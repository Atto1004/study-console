**판정 — RED. BUILD .91은 수정 후 재검수가 필요합니다.**

파일을 읽고 원본 함수를 메모리에서 재현했습니다. 화면은 첨부 10장 기준입니다. 실제 브라우저 조작·서버 상태와 기존 검사기의 수치는 재검증하지 않았습니다.

**근거**

1. **① GREEN — 표정 글자 제거.**  
   교실 마크업에서 `#dFace`가 제거됐습니다. 표본 결과물에서도 없습니다. 근거: [교실 마크업](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/_v4_splice.py:37).

2. **② 판정 불가 — 지침 반영만 확인.**  
   [학습시스템.md:265](/C:/Users/user/.claude/지침/학습시스템.md:265)에 교수 자료의 순서·용어·예제 번호를 따르도록 명시됐습니다. 빌더는 작성된 HTML을 읽습니다. 교수 원자료와 결과물의 실제 대응은 확인 못 했습니다. 대표 회차의 원자료 쪽수와 생성 섹션 대응 근거가 필요합니다.

3. **③ GREEN — 세 빌더의 보기 섞기·저장 구조.**  
   메모리 검사 120문항에서 결정성·보기 보존을 통과했습니다. 정답 위치는 각 30개입니다. 원문 순서 `k`로 저장하며, 교실 숫자 키는 화면 순서의 버튼을 누릅니다. 근거: [quizmix.py:17](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/quizmix.py:17), [교실 저장:711](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/classroom_tpl.html:711), [숫자 키:770](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/classroom_tpl.html:770).  
   참고: 수업 노트·덱에는 숫자 1~4 단축키가 없습니다. 해설 치환은 문맥 없이 `N번`을 바꾸므로 반복 횟수 같은 표현도 바꿀 수 있습니다.

4. **④ RED — 수식 분할이 괄호 짝을 끊습니다.**  
   `\left(a\qquad b\right)`가 `\left(a`와 `b\right)`로 나뉩니다. 중괄호·환경·`\text{}` 보호는 통과하지만 일반 괄호와 `\left…\right`는 보호하지 않습니다. [split_tex.js:6](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/split_tex.js:6)에 괄호 깊이 검사를 추가해야 합니다.  
   현재 수업 노트·암기노트에서 분할되는 166개 식에서는 이 짝 깨짐을 찾지 못했습니다. 새 자료 입력 시 재현되는 경계 결함입니다.

5. **⑤ RED — 암기노트 항목 분할이 HTML을 훼손합니다.**  
   `<b>A = B · C = D</b>`가 닫히지 않은 두 조각으로 나뉩니다. 태그 내부 문법만 건너뛰고 요소 범위는 보존하지 않습니다. [build_memo.py:21](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/build_memo.py:21)를 DOM 기반 분할로 바꾸거나, 분할 조각마다 태그를 복원해야 합니다.  
   암기·이해 알약과 별도 노트 자체는 구현됐습니다. 참고로 첨부 5의 ‘학습지 = 유일한 교재’는 암기 지식보다 수업 안내에 가깝습니다.

6. **⑥ RED — 대사 건너뛰기 후 동작이 계속됩니다.**  
   대사 중 Enter → `finishNow()` → `cancelAll()` 경로에서 타자는 끝나지만 `GE.t`·`GE.h`는 남습니다. 메모리 재현에서도 동작 타이머 2개가 유지됐습니다. [cancelAll:429](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/classroom_tpl.html:429)에 동작 정리를 연결해야 합니다.  
   시작 시 동작 줄이기와 사전 로딩 실패 제외는 있습니다. 다만 `geShow()`에는 표시 이미지의 `onerror` 처리가 없습니다. 실패 시 기본 자세 복귀와 늦게 도착한 콜백 무효화도 필요합니다.

7. **⑦ RED — 자동 판정의 신뢰성이 깨집니다.**
   - **감쇠:** 90일 전 정답 1개는 `0.286·모름`입니다. 오늘 암기 체크만 추가하면 `0.943·안다`가 됩니다. [tutor_judge.js:14](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/tutor_judge.js:14)가 최근 활동 시각으로 정답까지 갱신합니다. 정답과 읽기·암기 근거를 각각 감쇠해야 합니다.
   - **4,000건 상한:** 다른 노드의 활동 때문에 과거 정답이 잘린 뒤 해당 노드를 다시 평가하면 기존 `quiz`가 삭제됩니다. 노드별 최근 정답 요약을 보존해야 합니다. [28행·36행](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/tutor_judge.js:28).
   - **저장 실패:** `setItem`이 두 번 실패하면 새 활동이 유실됩니다. 예외는 숨기고 이전 저장소로 판정합니다. 실패 반환과 메모리 내 기록 유지가 필요합니다. [35행](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/tutor_judge.js:35).
   - **중복:** 한 이벤트의 같은 노드 중복은 정답 수를 늘리지 않습니다. 하지만 카드의 ‘다시 저장’은 같은 답을 다시 기록합니다. 학습 시도 식별자로 중복 제출을 막아야 합니다. [learn.html:310](/C:/Users/user/Desktop/아톰OS/기술실/study-console/learn.html:310).

   V47 → V55 → V57 선언 순서와 최신 로컬 판정 병합 코드는 확인했습니다. 실제 서버 병합 결과는 확인 못 했습니다.

8. **⑧ RED — 금지한 설명이 남습니다.**  
   덱 파트 표지에 ‘개념 → 암기 vs 이해 → 기초 문제 → 응용 문제 순서로 갑니다’가 남습니다. [slides_tpl.html:503](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/slides_tpl.html:503), 생성된 [em1 덱:544](/C:/Users/user/Desktop/아톰OS/기술실/study-console/notes/em1-mid-slides.html:544)에서 확인했습니다.  
   첨부 데스크톱 교실 버튼의 `Enter`도 §24의 제거 대상입니다. [버튼 생성:492](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/classroom_tpl.html:492)에서 제거해야 합니다.

화면 참고: 알약 4종의 지정색 대비는 **9.22~11.38:1**로 통과합니다. 암기노트 날짜 버튼은 **40px**, 교실 링크는 **36px**여서 요청한 44px에 못 미칩니다. [memo_tpl.html:28](/C:/Users/user/Desktop/아톰OS/기술실/study-console/docs/tools/memo_tpl.html:28)을 수정해야 합니다. 첨부 1·2는 판서 상단 일부가 잘려 보이며, 스크롤로 정상 복구되는지는 정지 화면만으로 확인 못 했습니다.

**아토가 하실 일**

아톰에게 위 RED 수선과 ② 원자료 대응 근거를 요청하면 됩니다. 재검수는 해당 재현 경로만 확인하겠습니다.

상태: 배포 보류. 파일 변경·외부 전송 없음.