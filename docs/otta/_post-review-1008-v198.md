**판정: RED.** 주 범위에서 캐릭터 타이머 누적과 과목 이동 실패를 재현했습니다. `main = 4e17e29`를 확인했습니다. 파일 변경은 없습니다.

1. **P1 — 로비 재렌더마다 반복 타이머가 남습니다.**  
   [workspace.js:163](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/workspace.js:163), [saeng.js:94](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/saeng.js:94)  
   메모리 재현: 실제 `mountSaeng`을 3회 실행하고 호스트를 제거했습니다. 반복 타이머 **6개가 남았습니다**. 이미지 로딩·시간 함수만 대체했습니다. DOM 제거로 `alive`가 바뀌지 않아 눈 깜박임·시선 타이머가 계속 재예약됩니다.  
   수정: 인스턴스를 보관하고 재렌더·화면 이탈 전에 `destroy()`를 호출하십시오. 비동기 부착 완료 시에도 렌더 세대와 `host.isConnected`를 확인하고, 오래된 인스턴스는 즉시 파괴해야 합니다.

2. **P1 — 과목명이 맞지 않으면 교실 대신 복도로 갑니다.**  
   [workspace.js:132](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/workspace.js:132), [space.js:88](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/space.js:88)  
   메모리 재현: `walk('unknown-course')` 결과는 `world=walking`, 제목은 `학교 복도`였습니다. 3D 로딩·카메라만 대체했습니다. 과제의 “풀이부터 할래요”도 이 경로를 사용합니다.  
   수정: 과목을 공통 ID로 연결하십시오. 지원하지 않는 교실은 기존 과목 화면이나 과제실로 연결하고 이유를 표시해야 합니다. 현재 `space` 존재 여부만 보는 대체 경로는 이를 막지 못합니다.

3. **P2 — 시험이 없으면 과목 문도 모두 사라집니다.**  
   [workspace.js:101](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/workspace.js:101), [workspace.js:145](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/workspace.js:145)  
   코드 확인: 문 목록은 ‘다가오는 필기 중간고사’에만 의존합니다. 시험이 없는 날은 자료실·과제실·계획 버튼만 남습니다. 과제만 있는 날에는 과제 선택지는 생기지만 해당 과목 문은 없을 수 있습니다.  
   수정: 문 목록은 등록 과목에서 만들고, 시험 정보와 퀘스트를 별도로 붙이십시오.

4. **P2 — 연속 이동의 정상 완료는 방어하지만 실패 경로는 남습니다.**  
   [space.js:88](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/space.js:88), [space.js:94](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/space.js:94)  
   코드 확인: 성공 경로에는 세대 번호 검사가 있습니다. 그러나 오래된 호출의 `catch`도 무조건 `hide()`를 실행합니다. 앞선 호출이 늦게 실패하면 뒤 호출의 화면을 닫을 수 있습니다. **실제 브라우저 재현은 미확인입니다.**  
   수정: `catch`에서도 현재 세대인지 검사하십시오. `walkTo`의 반환값을 전달해 이동 완료·실패를 검사할 수 있게 하십시오.

5. **접근성·CSS — 일부 확인, 시각 검수 미완료입니다.**  
   [workspace.js:146](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/workspace.js:146)의 문은 기본 `button`이며 접근 가능한 이름이 있습니다. 선택지도 기본 버튼입니다. 다만 [space.js:12](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/space.js:12)의 캔버스 부모는 `aria-hidden=true`인데 캔버스는 키보드 포커스를 받습니다. 이동 후 포커스 전달도 명시돼 있지 않습니다.  
   [skin.css:218](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/skin.css:218)의 퀘스트 발광 애니메이션은 녹색 테두리 규칙과 같은 `box-shadow`를 제어합니다. 애니메이션 중 색상 덮어쓰기를 정리하십시오. 복도에는 좁은 화면용 재배치 규칙이 없어 HUD·문패 겹침 검사가 필요합니다. **실제 겹침은 확인 못 함**입니다.

부 범위의 큰 위험은 다음과 같습니다.

- **이동 화면이 다른 화면 위에 남을 경로:** [space.js:103](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/space.js:103)은 `walking` 중 화면 모드가 바뀌어도 숨기지 않습니다. 메모리 재현에서 `data-mode=workspace`로 변경한 뒤에도 `world=walking`이 남았습니다. 화면 전환 시 명시적으로 이동 취소·숨김을 호출해야 합니다.
- **복원 주소 손실 가능성:** [school.js:34](C:/Users/user/Desktop/아톰OS/기술실/study-console/school/school.js:34)은 기존 화면 필드를 모두 지웁니다. 카메라 변경은 `lesson·step·camera`만 전달하므로 `world·subject`가 제거됩니다. 걷기 복원과 함께 회귀 검사가 필요합니다.
- 데이터 손실·보안의 치명 결함은 이번 확인에서 입증하지 못했습니다. 실제 저장 서버와 GPU 성능은 확인 못 했습니다.

제가 재실행한 `school_smoke`는 **errors=0**, 복구 검사는 **10/10 통과**했습니다. 다만 smoke의 `createSpace`는 대체 객체라 실제 이동을 검증하지 않습니다. Chrome 실행은 읽기 전용 환경의 임시 폴더 생성 제한(`EPERM`)으로 실패했습니다. 화면 크기별 시각 검수와 실제 스크린리더 조작은 미완료입니다.

아톰이 바로 고칠 순서는 **① 캐릭터 수명 정리 → ② 과목 연결·대체 경로 → ③ 이동 취소와 오래된 실패 차단 → ④ 시험 없는 문 목록 → ⑤ 포커스·좁은 화면·복원 회귀 검사**입니다.

상태: 읽기 전용 사후 검수 완료. 수정 후 재검수 필요. 별도 저장 기록 없음.