// 시험 대비 지표와 자료 분류. 화면은 이 결과만 그린다.
import { latestAnswers } from "./learning.js";

export const WEIGHTS = { understanding: 50, accuracy: 30, progress: 20 };
const DAY = 86400000;
const days = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY);

// 과목 하나의 다섯 지표. lessons = 회차({id,date}), events = 학습 기록, exam = {date} 또는 null
export function courseMetrics({ lessons = [], events = [], exam = null, today }) {
  const until = exam && exam.date < today ? exam.date : today;
  const scope = lessons.filter((l) => l.date && l.date <= until && (!exam || l.date < exam.date));
  const studied = new Set(
    events.filter((e) => ["answer", "position"].includes(e.kind) && e.lesson).map((e) => e.lesson),
  );
  const covered = scope.filter((l) => studied.has(l.id)).length;
  const after = new Set(exam ? lessons.filter((l) => l.date >= exam.date).map((l) => l.id) : []);
  const answers = latestAnswers(events).filter((e) => !after.has(e.lesson));
  const tested = answers.length;
  const independent = answers.filter((e) => e.correct && !e.assisted).length;
  const correct = answers.filter((e) => e.correct).length;
  const progress = scope.length ? covered / scope.length : 0;
  const accuracy = tested ? correct / tested : 0;
  const understanding = tested ? independent / tested : 0;
  const readiness = Math.round(
    understanding * WEIGHTS.understanding + accuracy * WEIGHTS.accuracy + progress * WEIGHTS.progress,
  );
  const daysLeft = exam ? days(today, exam.date) : null;
  const remaining = scope.length - covered;
  const perDay = daysLeft && daysLeft > 0 ? remaining / daysLeft : remaining ? Infinity : 0;
  const pace = !exam ? "none" : perDay <= 1 ? "ok" : perDay <= 2 ? "tight" : "behind";
  return { scope: scope.length, covered, remaining, tested, independent, correct, progress, accuracy, understanding, readiness, daysLeft, perDay, pace };
}

// 지금 할 것 하나. 하루 안 마감 과제가 먼저, 다음은 (100-준비도)/남은 날이 큰 과목. 날짜 미확정 시험은 뒤로.
export function pickQuest(rows, deadlines = []) {
  const task = deadlines.find((r) => !r.submitted && r.deadlineDays !== null && r.deadlineDays >= 0 && r.deadlineDays <= 1);
  if (task) return { type: "assignment", task };
  const score = ({ exam, m }) => (100 - m.readiness) / Math.max(exam.dday, 1);
  const sorted = [...rows].sort((a, b) => (a.exam.assumed - b.exam.assumed) || score(b) - score(a));
  return sorted.length ? { type: "course", ...sorted[0] } : null;
}

// 자료 하나 = 종류 하나. 기준은 "누가 만들었나". 겹치면 과제 > 원본 > 스앵님 정리 > 생성.
export const KINDS = {
  assignment: { label: "과제", order: 0 },
  original: { label: "원본", order: 1 },
  tutor: { label: "스앵님 정리", order: 2 },
  generated: { label: "생성", order: 3 },
};
export function classifySource(item = {}) {
  const text = [item.kind, item.file, item.title, item.label, item.href, item.module].filter(Boolean).join(" ");
  if (item.assignment || /과제|숙제|제출본|homework|\bHW[-_ ]?(Ch)?\d|\/hw\d*\//i.test(text)) return "assignment";
  if (item.lms || /^(material|recording|photo)$/.test(item.kind || "") || /강의자료|교수필기|강의계획서|교재|판서|녹음|클로바|clova|영상|\.mp4$/i.test(text)) return "original";
  if (item.kind === "summary" || /정리|수업\s*노트|notes\/lessons\/|notes\/classroom\/|요약|기호\s*사전/.test(text)) return "tutor";
  return "generated";
}
