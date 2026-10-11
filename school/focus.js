// 지금 집중 과목(대표님 10/9 「다다음 주 시험이니까 CADD 빼고 4과목 위주로」). 시험 기간이 끝나면 이 목록만 바꾸면 된다.
// 쓰는 곳: 홈 위 D-day 칩(workspace.js) · 공부 계획 자동 배치·과목 고르기(plan.js) · 교실 왼쪽 과목 레일(school.js)
// 함수 선언으로 둔다(검사 jsdom 이 모듈을 스크립트로 읽을 때 const 는 바깥으로 안 보임)
export function focusCourses() { return ['정역학', '미분적분학2', '공업수학1', '일반물리학2']; }
export function inFocus(name) { return focusCourses().includes(name); }
// 수업 당일 과제 과목(대표님 10/9 「CADD 같은 건 수업 당일 과제」): 과제를 수업 시간에 하므로 오늘 할 일·자동 배치에 넣지 않고 「수업 중에 할 과제」로만 보여 준다
export function inClassCourses() { return ['CADD']; }
export function isInClass(name) { return inClassCourses().includes(name); }
