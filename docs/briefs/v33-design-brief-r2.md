# V33 설계 회의 2차 — 1차 RED 4건 수정안 (2026-09-16)
1차: v33-design-brief.md → _v33-otta-1.md (RED). 전부 수용, 대안 채택.

## 1. MUST 교체 → 오타 권고대로 **저장·복원**
- `V33.withList(c, fn)`: `var keep=MUST.slice(); MUST.length=0; push(post…); try{ return fn(); } finally { MUST.length=0; push(keep…) }`. `mustHTML`·`V32.dotsHTML` 래퍼가 이 안에서 원본을 호출. 동기 구간만 스왑, 호출 뒤 전역 원상복구. 스펙 없는 과목은 스왑 없이 V32 4종.
## 2. hw·상단·CADD 영상 판정 → 별도 판정기, 상태명 분리
- hw(공수1 「과제 제출용 생성본」)는 `kindState`에 넣지 않는다(kinds 없음 → TypeError 경로 제거). 전용 `V33.hwState(c, week)`: 해당 주차 `weekNotes[w].links` 중 `url`이 `notes/`로 시작하고 `label`이 /제출용|해답지/ 인 것 + `NOTES`(type "과제", course 일치, week 일치) 개수 → 상태 **`linked`**(「연결됨 N개」, 초록 아닌 파랑 점). "제출본 존재"라고 쓰지 않는다. 없으면 `none`.
- 상단(pre) 항목 판정: **classify 변경 없이** 앱에서 `V32.LIB.common`(course 일치)의 **파일명 정규식**으로 센다 — 전공책 `/교재|전공책|Kreyszig|Stewart|Halliday/` · 솔루션 `/솔루션|solution/i` · 강의노트 `/강의노트/` · 여름 강의노트 `/여름/` · 수업자료 `/강의자료|슬라이드|Lecture/i`. 상태 3값: `pc N개` / `none` / **`unknown`**(LIB 못 읽음 또는 동명 과목 → "확인 못 함"). 구·신 JSON 모두 파일명은 있으므로 호환.
- CADD 강의영상: `V32.LIB.items`(course=CADD, 파일명 /영상정리|영상/ ) 중 **date가 그 주(월~일)** 인 것만 → 주차별 판정. 과거 영상으로 충족 안 됨.
## 3. classify 호환 → **바꾸지 않는다**
- pre 분류 유지. 새 접두만 추가: `솔루션_`→solution, `교수필기_`→profnote, `영상정리_`→lmsvideo, `여름*`→summernote. 기존 회차 판정(lib:"pre")은 그대로. 앱 상단 판정은 §2 파일명 규칙이라 type 무관.
- `_영상정리`를 `LIB_SKIP_DIRS`에서 빼고 `COMMON_DIRS`에 추가(.py/.md 템플릿은 SKIP_EXT·이름 규칙으로 제외: README.md·템플릿.md 는 `_영상정리` 안에서 제외).
## 4. 입력 경로
- `V32.KINDS_ATT`에 "교수필기"·"영상정리" 추가 → 정역학 교수님 필기본(kinds 교수필기, lib profnote)·CADD 영상 첨부 경로 완성. 하단 항목의 「올리기」는 V32의 `data-v32put` 경로 재사용.
## 5. 점 개수 = `post.length`(동적). 과목 화면 규칙 카드(`V33.SPEC[c.name].rules`).
## 6. 검증
- 구문 0 · 스모크 기존 34건(`MUST 4종` 검사는 스펙 없는 가짜 과목 기준) + V33: (a) 공수1 시트 하단 3항목(판서·녹음·과제 제출용) + 상단 3항목(전공책 없음·솔루션 있음(`_과제/솔루션_*`은 common)·수업자료 있음) (b) 일물2 상단 강의노트 `pc 2개` (c) LIB 강제 null → 상단 전부 `unknown` (d) 스펙 없는 과목 → V32 4종, 렌더 뒤 `MUST.length===4` 복원 확인 (e) 정역학 시트 kind 선택지에 교수필기 (f) 주차표 점 개수 == post.length (g) 공수1 hw `linked`(V27 링크 존재) vs 미적2(없음) `none`.
## 7. 오타에게: 4건 닫혔는지, 새 치명 근거. 800자 안팎.
