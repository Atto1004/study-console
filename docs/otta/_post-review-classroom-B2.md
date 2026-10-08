**판정: RED**

HEAD `51a214e85d7c84767fb87000060ca30fba1b9b41`에서 결함 4건을 확인했습니다. 코드·원본 파일은 수정하지 않았습니다. 검사 결과는 허용된 임시 폴더에만 기록했습니다.

1. **P1 — 이전 과목의 코치 응답이 새 과목을 통과 처리합니다.**  
   `school/tutor.js:75–95`, `school/school.js:2231`  
   재현: A 단계 답 제출 → 응답 대기 중 B 단계로 전환 → A의 `supported` 응답 반환. 실제 tutor 소스를 로드한 재현에서 **A의 read 기록 + B의 pass 호출 + phase=done**이 나왔습니다. 응답 적용 전 과목·수업·단계 일치 검사와 이전 지연 작업 취소가 필요합니다.

2. **P1 — 선택지 버튼의 Enter·Space 응답이 막힙니다.**  
   `school/school.js:2244–2246`  
   실제 Chrome에서 선택지 버튼에 포커스한 뒤 Enter·Space를 각각 눌렀습니다. 답 이벤트 요청은 각각 **0건**입니다. 전역 단축키의 `preventDefault()`가 기본 버튼 활성화를 막습니다. 버튼 포커스에서는 기본 활성화를 보존해야 합니다. 이 재현에서는 이중 실행이 발생하지 않았습니다.

3. **P1 — dual 칠판 기기의 새 대화창이 쓰기 경로를 엽니다.**  
   `school/tutor.js:20`, `school/tutor.js:109–124`, `school/setup.css:24`  
   재현: `school-setup=dual`, `school-role=board` → 질문 입력·제출. 입력창이 실제로 보이고 **`/api/school/coach` POST**가 발생했습니다. 기존 칠판 전용 화면의 읽기 전용 계약을 새 폼이 우회합니다. 폼·단축키와 코치 쓰기 경로에 역할 제한이 필요합니다.

4. **P2 — 좁고 낮은 화면에서 문제·공책이 대화 바에 가려집니다.**  
   `school/surface.js:11–12`, `school/surface.js:23–26`  
   실제 Chrome **500×600**에서 문제 영역은 y=205.17–325.17, 공책은 y=355.17–475.17입니다. 대화 바는 y=270.11부터 시작해 두 영역을 가립니다. 최소 높이 120·240·150px가 가용 높이를 초과하는 원인입니다. **1194×834·834×1194에서는 대화 바와 10px 간격을 확인했습니다.**

확인된 정상 범위와 미확인 범위입니다.

- 코치 실패는 `read`만 남깁니다. `pass()`는 다음 이동을 허용하지만 `answer(correct)` 기록을 만들지 않습니다. 이해도·준비도 집계가 `answer`만 사용하므로 **코치 실패로 이해도 수치가 부풀려지는 경로는 확인되지 않았습니다.**
- 기존 `dual/paper`와 역할 저장값은 유지됩니다. 설정값이 없는 기기는 모두 `solo`가 됩니다. 기기 감지는 없습니다.
- 두 기기 세션 동기화, 펜·실행 취소, 창 열림 중 조작 차단, A의 면 좌표 검사는 통과했습니다.
- 실제 iPad 하드웨어와 화면 키보드가 열린 상태는 확인 못 했습니다.

실행 명령·종료 코드는 다음과 같습니다. `TMP`는 지정된 임시 폴더, 작업 디렉터리는 통합 작업 폴더입니다.

```text
node TMP/{tutor_check,overlay_check,sync_check,stage2_check,
          map_a11y,icons_check,pen_check,setup_flow,solo_check}.cjs
→ 각각 0

node docs/tools/{school_smoke,sit_lesson_check,
                 popup_dismiss_check,ipad_touch_check}.cjs
→ 각각 0

node docs/tools/practice_flow_check.cjs
→ 최초 1, 재실행 0

node docs/tools/ipad_keyboard_check.cjs
→ 최초 1, 재실행 1
  hangulW=true, latinW=true, arrow=false, wheel=true

SCHOOL_URL=http://127.0.0.1:8797 node docs/tools/classroom_surface_check.cjs
→ 0, Chrome·WebKit
```

`classroom_surface_check`는 URL 뒤에 `/A-surface`를 붙여 원점 URL로 실행했습니다. 착석 검사 최초 실패 원인은 미확정입니다. 방향키 검사도 2회 실패했지만, 벽 충돌·위치 조건과 키 처리 중 원인은 분리하지 못했습니다. 제품 방향키 결함으로 단정하지 않습니다. `setup_flow`의 종료 0은 관측값 출력이며, 단언 검사를 통한 통과와 구분했습니다.

전체 명령·관측값·수선 조건은 [검수 보고서](C:/Users/user/.claude/jobs/a132f963/tmp/otta-classroom-v2-review.txt)에 기록했습니다. 원시 결과는 [회귀 검사](C:/Users/user/.claude/jobs/a132f963/tmp/otta-cross-tests.json)와 [재검사](C:/Users/user/.claude/jobs/a132f963/tmp/otta-cross-retry.json)에 있습니다.

상태: 교차 검수 완료. 확인된 4건의 재현 경로가 닫히면 재판정 가능합니다.