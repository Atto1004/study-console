# docs — 학습 관제탑 앱 부속 문서·도구 (2026-09-17 정리)

| 폴더 | 무엇 | 언제 보나 |
|---|---|---|
| `tools/` | 학습 덱 생성기. `build_slides.py`(정리노트 v2 HTML → 가로 덱, 배치 검사 게이트 내장) · `slides_tpl.html`(덱 템플릿 v4) · `check_q_refs.py`(문제 자기완결 검사) · `build_md_note.py`(회차 정리.md → 임시 노트) | 덱을 새로 만들거나 고칠 때 |
| `tools/calc2-matrix/` | 미적2 행렬 노트에 1회 적용한 패치 스크립트(보기 추가·암기/이해·보충·파트 4~6 재작성 등). 멱등이라 다시 돌려도 안전 | 행렬 노트를 다른 방식으로 다시 만들 때 참고 |
| `layers/` | `index.html` 끝에 붙는 레이어의 원본(`v32`~`v41`). 앱은 이 레이어를 순서대로 덧붙여 동작 | 앱 기능을 고칠 때 해당 레이어부터 |
| `briefs/` | 레이어 설계 브리프 — **최종판만**(v32 r2 · v33 r3 · v34 r5 · v36). 이전 판은 깃 이력 | 왜 그렇게 만들었는지 볼 때 |
| `otta/` | 오타(Codex) 판정문 — 레이어별 **최종(GREEN) 판만**, 덱 디자인 검토는 1·2차 둘 다(2차가 1차 해석을 철회한 부분이 있어 함께 둠). 이전 라운드는 깃 이력 | 사후 검수·이견 확인 |
| `기획서.md` | 앱 기획서 | |
| `aliveweek-webhook.md` | 출결 → 캘린더 웹훅 절차 | |

## 덱 만들기 (정식)
```
python docs/tools/build_slides.py <정리노트.html> notes/<deck>-slides.html <deck-id> "<제목>"
```
- 정리노트 규격: `section > h2 span.no「파트 N」`, `h3 span.tag.c/b/a`, `div.why/.concept/.one/.say`, `div.q > div.qn + (ol.choices li[data-ok]) + details > div.ans`, `aside.exam[data-level][data-when]`, `div.mu`, `div.extra[data-title]`.
- 같은 이름의 `<노트>.sources.json`이 있으면 PDF 영역을 잘라 `notes/src/<deck>/`에 출처 사진을 넣는다.
- 빌드 전 자기완결 검사(문제마다 필요한 행렬이 그 안에), 빌드 후 헤드리스 크롬 배치 검사(1024×768, 기본·답 공개·힌트 상태). **넘침·raw LaTeX 1건이라도 있으면 실패.** `--limit=N`(개념 장 분할 한계, 기본 440), `--no-check`, `--soft`(임시 덱만: 넘친 장을 스크롤 허용으로 표시).

## 임시 덱 (회차 정리 자동 변환)
```
python docs/tools/build_md_note.py study-materials/<과목> <과목>/_정리노트/<이름>.html "<제목>"
python docs/tools/build_slides.py <그 노트> notes/<code>-w1-3-slides.html <code>-w1-3 "<제목>" --limit=400 --soft
```
새 회차가 생기면 둘을 다시 돌리고, `layers/v41-layer-src.js`의 `DECKS[과목].parts`에 날짜→파트 번호를 더한 뒤 패치 플래그(`patchV41a`)를 올린다.

## 덱 디버그 해시
`#check`(전 장 검사 결과 표시) · `#at=<id>` 이동 · `#from=<id>` 앞은 건너뜀 · `#done=<id>` 앞은 완료 · `#at=<id>,pad` 필기 판 열림 · `#src` 첫 출처 열림
