// 시험 대비 수업 순서·숨김 — 「수업 선택」 창과 교실 탭 목록이 같은 표를 쓴다.
// 정역학은 강 번호(9/16 = 1강) 순서, 벼락치기 마지막. 1·2장(9/2·9/7·9/9·9/14)·10/9 문제집·10/10 복습은 목록에서만 숨김(파일은 그대로).
export const COURSE_ORDER = {'정역학':[['statics-2026-09-16','1강'],['statics-2026-09-21','2강'],['statics-2026-09-23','3강'],['statics-2026-09-28','4강'],['statics-2026-09-30','5강'],['statics-2026-10-07','6강'],['statics-2026-10-12','7강'],['statics-2026-10-11','벼락치기']]};
// 숨길 정역학 수업은 id 로 정확히 지정한다(9/2 는 카탈로그에서 `session:정역학:2026-09-02` 라 id 가 다르다). 같은 날 다른 수업은 건드리지 않는다.
const HIDDEN_IDS = new Set(['session:정역학:2026-09-02','statics-2026-09-07','statics-2026-09-09','statics-2026-09-14','exam-statics-2026-10-09','statics-2026-10-10']);
// 자료실 파일은 수업 id 가 없고 날짜만 있다 — 위 수업과 같은 날짜의 정역학 자료만(정역학은 하루에 수업 하나, 테스트로 확인)
const HIDDEN_DATES = new Set(['2026-09-02','2026-09-07','2026-09-09','2026-09-14','2026-10-10']);
// 출결·자료 색인만 있는 회차, 아직 판서와 대조하지 못한 자동 정리문은 공부 분량으로 세지 않는다.
// 원자료와 출결 기록은 그대로 두고, 교실에 제외 이유를 알린다.
export const EXCLUDED_LESSONS = {
  'session:일반물리학2:2026-09-02': {course:'일반물리학2', reason:'출결 기록만 있고 수업 내용은 확인되지 않았습니다.'},
  'session:일반물리학2:2026-10-07': {course:'일반물리학2', reason:'자동 정리문의 수식과 수업 범위를 판서와 다시 대조해야 합니다.'},
  'session:공업수학1:2026-09-25': {course:'공업수학1', reason:'자료 색인만 있고 학습 내용과 진도가 확인되지 않았습니다.'},
  'session:정역학:2026-10-12': {course:'정역학', reason:'공지 기록이며 새 수업 내용은 확인되지 않았습니다.'}
};
export const LESSON_ALIASES = {
  'phys2-2026-09-04':'phys2-reviewed-2026-09-04',
  'session:미분적분학2:2026-10-06':'calc2-2026-10-06',
  'session:미분적분학2:2026-10-08':'calc2-2026-10-08',
  'session:공업수학1:2026-10-02':'em1-2026-10-02',
  'session:공업수학1:2026-10-07':'em1-2026-10-07',
  'session:일반물리학2:2026-10-02':'phys2-2026-10-02'
};
export const canonicalLessonId = id => Object.hasOwn(LESSON_ALIASES,id) ? LESSON_ALIASES[id] : id;
export const lessonHidden = (course, l) => (course === '정역학' && HIDDEN_IDS.has(l?.id)) || (!!EXCLUDED_LESSONS[l?.id] && EXCLUDED_LESSONS[l.id].course === course);
// 순서표가 있는 과목이면 [{...lesson,label}] 학습 순서 목록, 없으면 null
export function orderedLessons(course) {
  const order = COURSE_ORDER[course?.name];
  if (!order) return null;
  return order.map(([id, label]) => { const l = (course.lessons || []).find(x => x.id === id); return l && {...l, label}; }).filter(Boolean);
}
// 「N강 · 9/16 · 주제」
export const orderedTitle = l => `${l.label} · ${+l.date.slice(5,7)}/${+l.date.slice(8)} · ${l.title}`;
// 수업 옆 목차도 교실과 같은 순서를 사용한다. 다른 과목은 기존 정규 수업만 표시한다.
export function scopeLessons(course) {
  return orderedLessons(course) || (course?.lessons || []).filter(l => !lessonHidden(course?.name,l) && !l.generated && !String(l.id).startsWith('exam-')).sort((a,b) => a.date.localeCompare(b.date));
}
// 숨긴 수업을 학교 화면 전체에서 빼는 한 곳 — 카탈로그 수업·자료실 자료·LMS 항목. 원본 파일·서버 자료는 그대로.
export function visibleCatalog(catalog) {
  if (!catalog?.courses) return catalog;
  return {...catalog, courses: catalog.courses.map(c => ({...c,
    lessons: (c.lessons || []).filter(l => !lessonHidden(c.name, l)),
    excludedLessons: (c.lessons || []).filter(l=>EXCLUDED_LESSONS[l.id]?.course===c.name).map(l=>({...l,reason:EXCLUDED_LESSONS[l.id].reason}))
  }))};
}
export const sourceHidden = s => s?.course === '정역학' && HIDDEN_DATES.has(s.date);
export const lmsHidden = i => i?.course === '정역학' && /Orientation|오리엔테이션/i.test(i.title || '');
export const HIDDEN_LESSON_IDS = HIDDEN_IDS, HIDDEN_LESSON_DATES = HIDDEN_DATES;
