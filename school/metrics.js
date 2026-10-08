// 시험 대비 지표와 자료 분류. 화면은 이 결과만 그린다.
import { latestAnswers } from "./learning.js";

export const WEIGHTS = { understanding: 50, accuracy: 30, progress: 20 };
const DAY = 86400000;
const days = (a, b) => Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / DAY);

// 과목 하나의 다섯 지표. lessons = 회차({id,date}), events = 학습 기록, exam = {date} 또는 null
// 범위 = 시험 전 회차 전부(아직 안 들은 회차 포함). 완료 = 그 회차 문항을 하나 이상 푼 것(위치 이동은 제외).
// 정답률·이해도는 범위 회차 문항만, 준비도에는 범위를 덮은 비율을 곱해 일부만 잘 푼 경우를 부풀리지 않는다.
// 시간이 지나며 잊는 것(망각)은 아직 반영하지 않는다.
export function courseMetrics({ lessons = [], events = [], exam = null, today }) {
  const scope = lessons.filter((l) => l.date && (exam ? l.date < exam.date : l.date <= today));
  const ids = new Set(scope.map((l) => l.id));
  const answers = latestAnswers(events).filter((e) => ids.has(e.lesson));
  const answered = new Set(answers.map((e) => e.lesson));
  const covered = scope.filter((l) => answered.has(l.id)).length;
  const tested = answers.length;
  const independent = answers.filter((e) => e.correct && !e.assisted).length;
  const correct = answers.filter((e) => e.correct).length;
  const progress = scope.length ? covered / scope.length : 0;
  const accuracy = tested ? correct / tested : 0;
  const understanding = tested ? independent / tested : 0;
  const readiness = Math.round(
    progress * (understanding * WEIGHTS.understanding + accuracy * WEIGHTS.accuracy + WEIGHTS.progress),
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

// 공부할 회차 하나(시험 대비 효율 우선). 이어 하던 수업 > 시험 범위 중 틀린 채 남은 회차 > 안 푼 회차 > 도움받아서만 맞힌 회차 > 최근 회차.
// 수업으로 변환된 회차를 먼저 보고, 원본 메모 회차(id 가 session: 으로 시작, 예: 오리엔테이션)는 변환 회차에 할 게 없을 때 본다.
// 시험이 있는데 시험 범위에 회차가 없으면 null(범위 밖 수업을 시작하지 않는다).
export function pickLesson({ course, lessons = [], events = [], today, exam = null, session = null }) {
  if (session?.course === course && session.lessonId) return { id: session.lessonId, resume: true, why: "resume" };
  const scope = lessons.filter((l) => l.date && l.date <= today && (!exam || l.date < exam.date)).sort((a, b) => a.date.localeCompare(b.date));
  if (!scope.length) return !exam && lessons[0] ? { id: lessons[0].id, resume: false, why: "first" } : null;
  const answers = latestAnswers(events.filter((e) => e.course === course));
  const byLesson = new Map();
  for (const e of answers) { if (!byLesson.has(e.lesson)) byLesson.set(e.lesson, []); byLesson.get(e.lesson).push(e); }
  const tiers = (pool) => {
    const retry = pool.find((l) => (byLesson.get(l.id) || []).some((e) => !e.correct));
    if (retry) return { id: retry.id, resume: false, why: "retry" };
    const fresh = pool.find((l) => !byLesson.has(l.id));
    if (fresh) return { id: fresh.id, resume: false, why: "new" };
    const assisted = pool.find((l) => (byLesson.get(l.id) || []).some((e) => e.assisted));
    if (assisted) return { id: assisted.id, resume: false, why: "assisted" };
    return null;
  };
  const converted = scope.filter((l) => !String(l.id).startsWith("session:"));
  const raw = scope.filter((l) => String(l.id).startsWith("session:"));
  return tiers(converted) || tiers(raw) || { id: (converted.length ? converted : scope).at(-1).id, resume: false, why: "latest" };
}

// 회차 안에서 풀 문제 n개: 틀린 문제 > 안 푼 문제 > 도움받아 맞힌 문제 > 혼자 맞힌 문제(같은 등급은 원래 순서).
// steps = 회차 단계, 반환 = 단계 번호 목록. 확인 문제가 없으면 예제, 그것도 없으면 앞에서부터.
export function pickQuestions({ steps = [], events = [], lessonId, n = 3 }) {
  const quiz = steps.map((s, i) => (s.kind === "quiz" ? i : -1)).filter((i) => i >= 0);
  const examples = steps.map((s, i) => (s.kind === "example" ? i : -1)).filter((i) => i >= 0);
  if (!quiz.length) return (examples.length ? examples : steps.map((s, i) => i)).slice(0, n);
  const last = new Map(latestAnswers(events.filter((e) => e.lesson === lessonId)).map((e) => [e.step, e]));
  const rank = (i) => { const e = last.get(steps[i].id); return !e ? 1 : !e.correct ? 0 : e.assisted ? 2 : 3; };
  return [...quiz].sort((a, b) => rank(a) - rank(b) || a - b).slice(0, n);
}

// 자료 하나 = 종류 하나. 기준은 "누가 만들었나". 겹치면 과제 > 원본 > 스앵님 정리 > 생성.
export const KINDS = {
  assignment: { label: "과제", order: 0 },
  original: { label: "원본", order: 1 },
  tutor: { label: "스앵님 정리", order: 2 },
  generated: { label: "생성", order: 3 },
};
// 명시된 종류·출처가 있으면 그대로(sure), 파일 이름으로만 짐작하면 sure=false 로 "추정" 표시한다.
const SERVER_KIND = { material: "original", recording: "original", photo: "original", summary: "tutor" };
const ASSIGNMENT_TEXT = /과제|숙제|제출본|homework|\bHW[-_ ]?(Ch)?\d|\/hw\d*\//i;
export function sourceKind(item = {}) {
  const text = [item.file, item.title, item.label, item.href, item.module].filter(Boolean).join(" ");
  if (KINDS[item.kind]) return { kind: item.kind, sure: true };
  if (item.assignment) return { kind: "assignment", sure: true };
  if (SERVER_KIND[item.kind]) return { kind: SERVER_KIND[item.kind], sure: true };
  if (item.lms) return { kind: ASSIGNMENT_TEXT.test(text) ? "assignment" : "original", sure: true };
  if (ASSIGNMENT_TEXT.test(text)) return { kind: "assignment", sure: false };
  if (/강의자료|교수필기|강의계획서|교재|판서|녹음|클로바|clova|영상|\.mp4$/i.test(text)) return { kind: "original", sure: false };
  if (/수업\s*노트|notes\/lessons\/|notes\/classroom\/|기호\s*사전/.test(text)) return { kind: "tutor", sure: false };
  return { kind: "generated", sure: false };
}
export function classifySource(item = {}) {
  return sourceKind(item).kind;
}
