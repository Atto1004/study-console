RED

- kingdom/index.html:7 → kingdom/app.js:498–502 · 중간 · 입력 복원이 `await refresh()` 뒤에 있습니다. 복구 후 API 응답을 기다리는 동안 새 글을 입력하면, 저장된 `kDraft`가 새 글을 덮어씁니다. 초안 복원을 첫 비동기 대기 앞으로 옮겨야 합니다.

나머지 6건은 코드상 반영을 확인했습니다. 읽기 전용 검토이며 WebKit·curl 실측은 재실행하지 않았습니다.