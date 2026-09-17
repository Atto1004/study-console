# V33 설계 회의 — 과목별 상단(미리)/하단(수업 후) 자료 구성 (2026-09-16)
작성 아톰. 코딩 설계는 오타 주도. 파일 쓰기 금지, 코드는 아톰이 씀.

## 0. 아토 지시(원문 요지, 지침 학습시스템.md §10에 기록)
회차 화면을 상단 = 미리 올릴 자료(과목 공통), 하단 = 수업 후 올릴 자료(회차별)로. 과목별 목록:
- 일반물리학2: 상 전공책·여름 강의노트·일반물리 강의노트 / 하 칠판 판서·녹음본
- 공업수학1: 상 전공책·솔루션·수업자료 / 하 판서·녹음본·과제 제출용 생성본. 규칙: 과제 매주 수요일 생성, 전주차 과제 수요일 제출
- 정역학: 상 전공책 / 하 교수님 필기본(LMS)·녹음본. 규칙: LMS에 수업 영상+필기본 업로드됨, 영어→한글 변환
- 미분적분학2: 상 전공책 / 하 판서·녹음본·(필기). 규칙: 문제풀이 과제 추후 한 번에, 미적분 클리닉 매주(가능하면 매일)
- CADD: 상 (월 LMS 강의영상) / 하 과제. 규칙: 매주 과제 당일 제출, 월 영상→일요일 전 수강, 영상 자동 정리 필요
- 아카데믹글쓰기: 상 수업자료 / 하 녹음본. 규칙: 매주 수업 중 과제, 추후 글쓰기 과제, 교재 불필요

## 1. 현재(V32, GREEN 구현)
- `MUST`(전역 배열 4종 rec/pre/note/board)를 `mustHTML(sl,counts)`(V32 덮어씀, `V32.cur`로 과목·날짜 인지)과 `V32.dotsHTML(c,date,counts)`가 읽음. `V32.kindState(m,sl,counts,pc)`가 종류별 상태. PC 인벤토리 `V32.LIBMAP[과목|날짜][type]` + `V32.LIB.common`(과목 공통 폴더 `_교재`·`_강의자료`·`_정리노트`·`_과제`).
- library.json type: rec/pre/note/board/summary/hw/derived/other. `_진도커버리지.py classify()`: `교재*`·`강의노트*`·`강의자료_*`·`학습지_*.pdf` → pre.
- 앱 과목 id는 기기별 uid, 이름으로 연결(중복 이름 미연결).

## 2. 아톰 초안
### 2.1 과목별 스펙 `V33.SPEC[과목명] = {pre:[{k,n,lib}], post:[{k,n,kinds,slot,lib}], rules:[문자열]}`
- 하단(post) 항목 k: rec(녹음본, kinds 녹음, slot rec, lib rec) · board(칠판 판서, kinds 칠판판서, lib board) · note(필기, kinds 필기본, slot note, lib note) · profnote(교수님 필기본, kinds 교수필기, lib profnote) · hw(과제 제출용 생성본/과제, lib hw — `_과제/` 폴더는 공통이라 회차 연결 불가 → 회차 판정 제외, 주차노트 과제 링크(V27.LOG) 존재 여부로 판정) · lmsvideo(CADD 강의영상 정리, lib lmsvideo).
- 상단(pre) 항목 k: book(전공책) · solution(솔루션) · summernote(여름 강의노트) · lecnote(강의노트) · material(수업자료) · lmsvideo. 판정 = `V32.LIB.common` 중 course 일치 & type 일치 개수(PC) — 기기 첨부는 회차 단위라 상단엔 없음. 없으면 「없음 — PC `_교재`/`_강의자료`에 넣기」 안내.
### 2.2 MUST 동적화
- `V33.applyMust(c)`: `MUST.length=0; push(SPEC[c.name].post…)`. 스펙 없는 과목은 V32 기본 4종.
- `mustHTML` 래핑: `V32.cur.cid`→course→applyMust 후 원본(V32) 호출. `V32.dotsHTML` 래핑: 인자 c로 applyMust 후 호출. 렌더가 동기이므로 배열 스왑 안전. 주차표 점 개수 = 과목별 post 수(2~3).
### 2.3 회차 시트 상단 칸
- logSheet 래핑(V32 뒤): `#lqSumMust` 앞에 `#v33Pre` 상자 삽입 — 「미리 올릴 자료 (과목 공통)」 항목별 PC 개수/없음. V32 refill 이 must 를 다시 그려도 pre 상자는 별도 노드라 유지.
### 2.4 과목 화면 규칙 카드
- renderCourse 래핑: `#v-course` 상단(.vh 다음)에 「과목 규칙」 카드(rules 목록 + 상/하 목록). 
### 2.5 library.json
- classify 추가: `교재*`→book · `솔루션_*`→solution · `여름*`→summernote · `강의노트*`→lecnote · `강의자료_*`·`학습지_*.pdf`→material(pre 유지: 앱의 pre 는 material 로 별칭) · `교수필기_*`→profnote · `영상정리_*`·`_영상정리/`→lmsvideo. 기존 pre 사용처(V32 kindState lib:"pre")는 material 로 바꾸고 library 생성 시 material 을 pre 로도 세면 호환.
### 2.6 검증
- 게이트 구문 0 + 스모크(기존 34건 유지: `MUST 4종` 검사는 스펙 없는 과목 기준으로 조정) + V33 검사: 공수1 시트에 post 3종(판서·녹음·과제) 표시, 일물2 상단 3항목 표시(PC 강의노트 1개 이상), 스펙 없는 가짜 과목은 V32 4종, 주차표 점 개수 = post 수, 과목 화면 규칙 카드.

## 3. 오타에게
1. MUST 인플레이스 스왑 방식의 재현 가능한 결함(비동기 fillDots에서 c 가 바뀐 뒤 콜백이 다른 과목의 MUST 를 읽는 경우 등). 대안이 있으면 제시.
2. hw 판정(주차노트 링크 존재)과 상단 판정(common 개수)의 함정.
3. classify 변경으로 기존 회차 판정(pre→material)이 깨지는 경로.
4. 그 외 RED. GREEN 조건 명시. 한국어 존댓말 1200자 안팎.
