# V34 설계 회의 r3 — 오타 2차 RED 4건 반영 (2026-09-17)

## 1 → 2.5″ 할 일 초기화 (되돌릴 수 있게)
- 대상 주 = 이번 주 entry. 실행 전 **entry 전체를 `S.patches.v34a.backup`에 깊은 복사**(items 원본 그대로). 그다음 `items = items.filter(it => !it.key)`(수동 항목 = key 없음 보존, 자동 항목 = key 있음 제거) → `generateWeekly(mon)` → 2.1″ 규칙으로 study 정리. `S.patches.v34a={at, removed, kept}`.
- 복구 함수 `V34.restoreTodo()` = backup을 entry에 되돌림(설정 패치 노트 카드에 버튼 「초기화 되돌리기」). 되돌릴 수 있으므로 사전 확인 없이 실행하고, 완료 보고에 삭제 건수·복구 버튼 위치를 명시. 아토가 더 넓게(과거 주·주차노트 tasks) 원하면 별도 지시.

## 2·3 → 2.1″ 예습 차단 기준
- `V34.reviewBlocked(c)`: `sessions(c.id)` 중 **`sessionEnded(c,s)`인 모든 회차**(주 경계 무관, 오늘 끝난 회차 포함)에서 `cancelled` 제외, **`status ∈ {absent, excused, ghost}` 제외**(보강은 기존 `makeup:` 흐름·회차 시트에서 다루고, 이 패치는 "복습 안 했으면 예습 없음"만 구현 — 결석 보강 미완이 예습을 막지 않는 것은 의도된 범위 제한으로 보고에 명시), 남은 회차 중 `!reviewed` 하나라도 → true. 기록 없는 회차(`sessionOn` null)는 미복습.
- 효과: 월요일 회차 미복습이면 목요일 예습 항목이 생기지 않음(주 2회 조건 충족). 복습(gradeReview/captureLog reviewed=true)하면 즉시 `generateWeekly`+`pruneStudy`+persist.

## 4 → 2.8″ 16주 목록 판정
- 각 주 `ps = planned(c).filter(p.week===w)`. 상태:
  - `ps.length===0` → 「수업 없음」(회색 아님, 라벨만).
  - `ps.every(p => !sessionEnded(c, p))` → **미수강 회색 `.fut`**(오늘 수업 전 포함).
  - 일부만 끝남 → 「진행 중」 강조(이번 주).
  - 전부 끝남 + `weekNoteHas` 없음 → 「정리 없음」 경고색 / 있음 → 요약 행.
- 8·16주차 기본 라벨 + `exams` 주차 배지(2.8′ 그대로).

## 오타에게
r3로 GREEN인지. 남은 RED만 번호로, 400자 안팎.
