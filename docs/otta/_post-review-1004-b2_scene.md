RED

- [walkers.js:102](/C:/Users/user/본사/atom/kingdom/walkers.js:102) · 중간 · 초기 `fp:fit`이 좌표만 갱신하고 `placeFg()`를 생략합니다. 이어지는 ResizeObserver도 크기가 같아 건너뜁니다. 메모리 재현에서 가림 레이어 폭이 두 화면 모두 1008px에 남았습니다. 정상값은 1040×918에서 1040px, 755×730에서 821.25px입니다. 초기화와 `fp:fit`을 `refit()`으로 통일해야 합니다.

- [walkers.js:233](/C:/Users/user/본사/atom/kingdom/walkers.js:233) · 중간 · Otta가 작업해도 `work` 상태가 켜지지 않습니다. [server.py:3039](/C:/Users/user/본사/atom/server.py:3039)의 `tag`는 세션별 `A~D`인데 프런트는 사람별 `A/O`로 해석합니다. 명시적인 작업자 식별값과 작업 시각으로 판정해야 합니다.

- [walkers.js:164](/C:/Users/user/본사/atom/kingdom/walkers.js:164) · 중간 · Otta 다음 Atom 대사가 타자로 출력되면 첫 글자는 `peer`, 두 번째 글자는 `user`가 됩니다. 첫 이벤트가 `lastRole`을 덮어써 말풍선 색과 이동 목적지가 바뀝니다. 대사 식별자별로 상대를 고정하고 `office:line`에 전달해야 합니다.

- [walkers.js:149](/C:/Users/user/본사/atom/kingdom/walkers.js:149) · 중간 · 동작 줄이기를 켜도 보내기·대사 이벤트가 이동을 시작합니다. 메모리 검사에서 설정을 켠 캐릭터가 이동했습니다. `arrange()`의 이동과 이동 프레임에도 설정을 적용해야 합니다.

- [walkers.js:148](/C:/Users/user/본사/atom/kingdom/walkers.js:148) · 중간 · 데스크톱 3440×720에서는 `maxY=440.77`인데 대화 목적지는 `490`입니다. 내부 이동 좌표와 화면에 표시하는 좌표가 달라집니다. 이동 공간이 사라질 때 정지시키고 `pick()`·`arrange()`·표시 좌표에 같은 경계를 적용해야 합니다.

- [index.html:17](/C:/Users/user/본사/atom/kingdom/index.html:17) · 중간 · `aria-hidden="true"`인 `#world` 안에 포커스 가능한 캐릭터 버튼을 추가합니다. 키보드 포커스와 접근성 트리가 불일치합니다. 버튼을 숨김 영역 밖으로 옮기거나 장식으로 처리하고 기존 비서실 버튼으로 조작을 통일해야 합니다.

- [fp.js:69](/C:/Users/user/본사/atom/kingdom/fp.js:69), [walkers.js:244](/C:/Users/user/본사/atom/kingdom/walkers.js:244) · 낮음 · 데스크톱에서 포인터가 멈춰도 매 프레임 스타일을 씁니다. 숨김 검사도 `deskTick()`에는 적용되지 않으며 폴링·95ms 타이머는 계속 예약됩니다. 정지·숨김 시 중단하고 복귀 시 재개해야 합니다. 실제 배터리 소모량은 확인 못 했습니다.

검증 범위: HEAD `44d7171`, 지정 변경 파일·관련 CSS·서버 응답 구조, JS 구문 7개 통과, 메모리 재현. `#world`의 독립적인 쌓임 맥락 때문에 높은 내부 z-index가 HUD를 덮는 경로는 없습니다. 이중 전송·ResizeObserver 순환·폴링 JSON 실패에 따른 전체 화면 중단은 코드에서 발견하지 못했습니다.

아이패드 Safari 실기·IME 입력·화면 렌더링은 확인 못 했습니다. 파일 변경과 외부 호출은 없습니다.