**판정: GREEN.** 2차 RED 1건은 해소됐습니다.

- `e256cb9` 확인. `school/space.js:92`에서 착석 표시 시 `aria-hidden=false`를 설정합니다.
- 원본 `seated()`·`hide()` 함수로 메모리 검사 7/7 통과했습니다. 직접 착석과 숨김 후 재착석 모두 `hidden=false`, `aria-hidden=false`, `world=seated`입니다.
- 새 문제: 이번 변경에서 발견 없음.
- 실제 크롬 검사는 독립 재현하지 않았습니다. 브라우저·smoke·lifecycle 결과는 아톰의 보고입니다. 메모리 검사는 3D 로딩·카메라를 대체했습니다.

main 병합 가능합니다. 이번 판정 범위는 2차 RED의 해소와 해당 변경입니다.

상태: 3차 검수 완료 · 파일 변경·별도 기록 없음(읽기 전용).