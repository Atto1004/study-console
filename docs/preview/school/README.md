# 학교 첫 수업 시안

아이패드·웹 디자인 검토를 위한 별도 실행 페이지. 기존 앱의 화면·저장·이해도를 변경하지 않는다.

진입: `/kingdom/study/docs/preview/school/index.html` 또는 이 폴더의 index.html.

## 구현한 것

- A++O의 진초록·황동·목재 계열로 만든 1인칭 로비·상담실·교실 배경과 최신 스앵님 초상. 정적 WebP 세 장 합계 472,070바이트. 별도 라이브러리·외부 폰트 없음.
- 상담 진단에 따른 기초/초기조건 시작 분기와 계획 선택.
- 공업수학1 1.1의 변화율·초기조건에 대한 준비된 질문 4단계.
- 선택형과 숫자 답 확인, 오답 보충·힌트·이전 단계·완료 기록.
- localStorage `study-school-preview-v2`에 시안 진행과 미제출 숫자 답 저장. 실제 mastery에는 쓰지 않음. 이전 v1은 보존하며 읽지 않음.
- 원자료 링크와 보충 예제의 구분, 최신 이미지 준비 후 표시.
- 실제 sections.json을 읽는 공업수학1 자료실과 시범 수업 기록 열람·JSON 내보내기.
- 현재 수업 문맥을 기존 /api/conversations → /api/send SSE 코칭에 전달하는 질문창. 중단 및 방 이동 시 요청 취소. 실제 AI 응답·한도 처리는 미검증.

## 검증

2026-10-06 실제 Chrome의 기존 A++O 서버에서 로비→상담→수업→완료 진행 확인.
오답 보충, 진단의 기초 경로, 숫자 정답, 입력 후 새로고침 복원 확인.
1040×918과 1180×720에서 확인한 수업 칠판의 내부 넘침과 가로 넘침 없음. 실제 iPad 기기·키보드 동작은 미검증.
node --check 통과. 기존 앱 변경은 이번 작업에서 하지 않음.

## 다음 작업

Fish TTS·모델 교체·서버 동기화·실제 이해도 갱신·자료 자동 대조는 미연결.
상담은 한 문제와 출발점 제안만 구현한 상태이며 학습시간·시험일·목표·선수지식 종합 진단은 추가 구현이 필요하다.
정답 확인 직후 새로고침하면 해당 문제를 다시 보여준다. 완료 상태와 미제출 답은 복원된다.
이번 질문은 전체 1.1 수업이 아니라 변화율과 출발점에 대한 짧은 흐름 검증이다.
원자료 전체 대조, 실제 교수 규칙, 일반 미분방정식 진단은 다음 단계에 수행한다.

## 배경 제작 기록

imagegen으로 제작한 원본 PNG와 웹용 WebP를 assets에 함께 보관한다. 브라우저는 WebP만 읽는다.
공통 주문: 16:9, first-person academic pixel-art interior, forest green, antique brass, walnut, warm afternoon light, no people, no readable text.
로비: three classroom doors, left courtyard window, green wainscot, bench.
상담실: across a walnut desk, bookshelves, empty teacher space center-right.
교실: large empty green chalkboard, left windows, foreground walnut desks, empty teacher space right.
