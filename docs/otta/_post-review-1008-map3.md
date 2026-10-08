**판정: GREEN.** 1c6c2bf의 요청한 브라우저 재검사가 통과했습니다.

실행한 명령과 종료 코드:

- `node C:/Users/user/.claude/jobs/a132f963/tmp/map_a11y.cjs` — **종료 0**
- `node C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/docs/tools/popup_dismiss_check.cjs` — **종료 0**

확인: Chrome과 WebKit iPad 환경 모두 같은 결과입니다.

- 지도 포커스 탈출 **0/12회**, 학습 방식 창 탈출 **0/8회**.
- 지도 열림 중 `.school.inert=true`. 닫으면 해제되고 지도 아이콘으로 포커스 복귀.
- 탭 비활성 상태에서 열어도 창 안에 포커스 유지. 열린 채 활성화하면 지도 비활성 버튼 **4→0**.
- 상담 창 내부 클릭은 유지. 외부 클릭은 닫힘. 더보기 메뉴 외부 클릭도 닫힘.
- 두 검사 모두 페이지 오류 없음. HEAD는 `1c6c2bf8fa0c4acbc744e700164acd32edbba15a`로 확인했습니다.

단언은 검사 범위에서 타당합니다. 지도 12회는 **Tab 8회·Shift+Tab 4회 합계**입니다. 각 방향을 12회씩 검사한 것은 아닙니다. WebKit iPad는 기기 모의 환경이며, 실물 iPad의 Safari는 확인하지 않았습니다.

새 문제: 발견 없음. 추측을 판정 근거에 넣지 않았습니다. 코드·검사 파일과 라이브 서버 8787은 변경하지 않았습니다.

상태: 재검수 완료. [검사 기록](C:/Users/user/.claude/jobs/a132f963/tmp/otta-1c6c2bf-review.txt)을 저장하고 재읽기로 확인했습니다.