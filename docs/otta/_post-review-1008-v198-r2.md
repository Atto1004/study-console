**판정: RED.** `1937cc1`에서 착석 화면의 접근성 결함이 남았습니다. main 병합은 보류해야 합니다.

1. 캐릭터 수명 — 해소 확인. 분리된 요소의 타이머 중단, 재렌더·이동 시 `destroy()`, 늦게 완료된 인스턴스의 세대 검사를 확인했습니다. `saeng_lifecycle_check` 통과했습니다.
2. 과목 연결 — 코드상 해소. `ROOMS` 과목만 `space.walk()`로 연결하고 나머지는 `showCourse()`로 보냅니다.
3. 문 목록 — 해소 확인. 시험 과목과 등록된 교실 과목을 합칩니다. 시험 없는 데이터에서 문 2개 검사가 통과했습니다. `pickQuest`에는 시험 있는 행만 전달합니다.
4. 이동 — 코드상 해소. `walk/seated`의 실패 경로에 세대 검사가 있습니다. 다른 방 진입의 `leave()`에서 `space.hide()`를 호출합니다. 실제 브라우저 왕복은 독립 재현하지 않았습니다.
5. 접근성·CSS — 일부 미해소. 걷기 진입의 포커스 전달과 `aria-hidden=false`, 발광 변수와 모바일 배치 규칙은 확인했습니다. **착석 진입에서는 `aria-hidden=false` 설정이 빠졌습니다.**
6. 복원 주소 — 제시한 판단에 동의합니다. 착석 복원은 `lesson·step·camera`, 걷기 복원은 `world=walking·subject`로 분기합니다. 착석 후 걷기 필드를 제거하는 동작을 결함으로 볼 근거는 없습니다.

남은 문제: [school/space.js:92](C:/Users/user/Desktop/아톰OS/기술실/study-console/.claude/worktrees/atom-game-redesign/school/space.js:92). 직접 착석하거나 `hide()` 후 착석하면 `hidden=false`, `world=seated`인데 `aria-hidden=true`가 유지됩니다. 캔버스가 보이면서 접근성 트리에서는 제외됩니다. 3D 로딩·카메라만 대체한 메모리 검사에서 두 경로 모두 재현했습니다. `seated()`에서도 표시 시 `aria-hidden=false`를 설정하고 두 경로를 검사하면 이 RED가 닫힙니다.

검사 결과는 metrics **7/7**, learning **7/7**, recovery **10/10**, lifecycle 통과, school_smoke **errors=0**입니다. smoke는 `createSpace`를 대체하므로 실제 3D 이동 검증 근거로 쓰지 않았습니다. 모바일 겹침과 실제 GPU 화면은 확인 못 했습니다. 기존 RED 문서는 주 저장소에서 찾아 대조했습니다.

아토가 하실 일: 없음. 아톰은 착석 접근성을 수정한 뒤 재검수를 요청하면 됩니다.

상태: 재검수 완료 · RED 1건 잔존 · 파일 변경·별도 기록 없음(읽기 전용 요청).