# V34 설계 회의 r5 — 오타 4차 RED 2건 반영 (2026-09-17)

## 2.8⁗ 16주 목록 판정 — 순서 고정 알고리즘
```
ps   = planned(c).filter(p => p.week===w)                      // 회차 후보
live = ps.filter(p => !holidayOn(p.date) && !(sessionOn(c.id,p.date)||{}).cancelled)   // 휴강 제외
if (ps.length===0)            → 「수업 없음」
else if (live.length===0)     → 「휴강」 회색
ended = live.filter(p => sessionEnded(c, {date:p.date}))       // 끝난 회차
if (ended.length===0)         → 「미수강」 .fut 회색
// 출석 판정: 기록 없음(sessionOn null) = 미기록 → 출석으로 간주하지 않고 「기록 없음」으로 분리
rec   = ended.map(p => sessionOn(c.id,p.date))                  // null 가능
attended = ended.filter((p,i) => rec[i] && ["present","late","vlate"].includes(rec[i].status))
absent   = ended.filter((p,i) => rec[i] && ["absent","excused","ghost"].includes(rec[i].status))
norec    = ended.filter((p,i) => !rec[i] || !rec[i].status)
if (attended.length===0 && absent.length>0 && norec.length===0) → 「결석 · 보강 필요」 경고
else if (attended.length===0)                                  → 「기록 없음」 회색(정리 판정 ✗, 배지로 미기록 n)
else if (ended.length < live.length)                           → 「진행 중」 강조 (+ 결석 n · 미기록 n 배지)
else if (!weekNoteHas(c,w))                                    → 「정리 없음」 경고 (+배지)
else                                                           → 요약 행 (+배지)
```
- `sessionEnded(c,{date})`는 원본 시그니처(`s.date`만 사용)와 호환. 휴강 판정에 `holidayOn`(학교 휴일)과 회차 `cancelled` 둘 다.
- 배지: 「결석 n」「미기록 n」「휴강 n」을 행 끝에 병기. 8·16주차 라벨과 `exams` 배지는 r2대로.

## 오타에게
r5로 GREEN인지. RED면 번호만, 200자 안팎.
