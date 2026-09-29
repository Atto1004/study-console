# -*- coding: utf-8 -*-
"""지식맵(learn.html) — 스앵님 자동 판정(대표님 2026-09-29 「개념 마인드맵은 스앵님이 학습을 통해 내가 뭘 알고 뭘 모르는지 알아서 파악」)
① 판정 스크립트(tutor_judge.js) 인라인(/* TJ-START */ ~ /* TJ-END */, sync_judge.py 가 갱신) · 열 때 기록 전체 재판정
② 마인드맵 위 「김주영 스앵님 판정」: 기록으로 판정된 노드 중 모름·흔들림 약한 순 3개 + 근거(문제 정답·다시 설명) + 그 개념을 배운 교실로
③ 카드: 수동 자가평가 슬라이더 제거(스앵님이 판단) · 카드 퀴즈는 기록(quiz)으로 · 판정 근거 표시
④ 화면 부가 설명 제거(지침 §24). 멱등."""
import io, os, re
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
P = os.path.join(ROOT, "learn.html")
s = io.open(P, encoding="utf-8").read()
JUDGE = io.open(os.path.join(HERE, "tutor_judge.js"), encoding="utf-8").read().replace("</", "<\\/")
def sub(old, new, label):
    global s
    if new and old in new and new in s: return
    if s.count(old) == 1: s = s.replace(old, new, 1); return
    if (not new or new in s) and old not in s: return
    raise AssertionError(f"{label}: 자리 {s.count(old)}개")
sub('.btn.ghost{background:var(--card);color:var(--ink);border:1px solid var(--line)}',
    '.btn.ghost{background:var(--card);color:var(--ink);border:1px solid var(--line)}\n'
    '/* 스앵님 판정(2026-09-29) */\n'
    '.judge{display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border-radius:12px;background:var(--acc-soft);margin:0 0 10px}\n'
    '.judge img{flex:none;width:44px;height:44px;border-radius:50%;object-fit:cover;object-position:50% 14%;background:#1b2a21}\n'
    '.judge .jb{flex:1;min-width:0}.judge .jn{font-size:12px;font-weight:700;color:var(--acc);margin-bottom:2px}\n'
    '.judge ul{list-style:none;margin:0;padding:0}.judge li{display:flex;align-items:center;gap:8px;padding:5px 0;font-size:14px;flex-wrap:wrap}\n'
    '.judge li .s{flex:none;font-size:11px;font-weight:700;color:#fff;border-radius:999px;padding:2px 8px}.judge li .w{color:var(--sub);font-size:12px}\n'
    '.judge li a{margin-left:auto;flex:none;font-size:13px;font-weight:700;border:1px solid var(--line);border-radius:8px;padding:0 12px;min-height:34px;display:inline-flex;align-items:center;background:var(--card);color:var(--ink)}\n'
    '.why2{font-size:14px;color:var(--ink)}', "판정 스타일")
sub('<h2>개념 마인드맵 <small>선 = 선수지식(먼저 알아야 하는 것) → 나중 개념</small></h2>', '<h2>개념 마인드맵</h2>\n  <div class="judge" id="judge" hidden></div>', "마인드맵 머리")
sub('<span>옆으로 스크롤 · 「선택한 주차」를 누르면 그 주차 개념만 점선으로</span></div>', '</div>', "범례 안내")
if "/* TJ-START */" in s:   # 이미 들어가 있으면 표시 사이만 원본(tutor_judge.js)으로 갈아 끼운다 — 원본이 바뀌어도 두 벌이 되지 않게
    i0 = s.index("/* TJ-START */\n") + len("/* TJ-START */\n"); i1 = s.index("/* TJ-END */", i0); s = s[:i0] + JUDGE + s[i1:]
else:
    sub('<script>\n/* 데이터 소스:', '<script>/* TJ-START */\n' + JUDGE + '/* TJ-END */</script>\n<script>\n/* 데이터 소스:', "판정 스크립트")
sub('function loadM(){if(SERVER)return fetch("/api/mastery").then(function(r){return r.json()}).then(function(d){M=d.mastery||{}}).catch(function(){M={}});\n  try{M=JSON.parse(localStorage.getItem("atto.mastery")||"{}")}catch(e){M={}}return Promise.resolve()}',
    '/* 스앵님 판정: 이 기기 기록(atto.evidence) 전체를 다시 판정한 atto.mastery 를 읽는다. atom 안이면 서버 값 위에 더 최근 자동 판정을 얹는다 */\n'
    'function loadM(){try{if(window.TJ)TJ.all()}catch(e){}var LOC={};try{LOC=JSON.parse(localStorage.getItem("atto.mastery")||"{}")||{}}catch(e){LOC={}}\n'
    '  if(SERVER)return fetch("/api/mastery").then(function(r){return r.json()}).then(function(d){M=d.mastery||{};Object.keys(LOC).forEach(function(id){var l=LOC[id];if(l&&l.auto&&(!M[id]||(+l.ts||0)>(+M[id].ts||0)))M[id]=l})}).catch(function(){M=LOC});\n'
    '  M=LOC;return Promise.resolve()}', "판정 읽기")
sub('function render(){renderChips();renderProg();renderSummary();renderList();renderTree();renderMap()}',
    'function render(){renderChips();renderProg();renderSummary();renderList();renderTree();renderMap();renderJudge()}\n'
    '/* 김주영 스앵님 판정: 학습 기록으로 판정된 노드 중 모름·흔들림, 점수 낮은 순 3개 — 근거와 그 개념을 배운 교실 */\n'
    'var LINKS={};\n'
    'function whyText(a){if(!a)return"";var w=[];if(a.q)w.push("문제 "+a.c+"/"+a.q);if(a.conf)w.push("다시 설명·질문 "+a.conf);if(a.read&&!a.q)w.push("읽기만");if(a.memo)w.push("외움");return w.join(" · ")}\n'
    'function renderJudge(){var el=$("#judge");if(!el)return;var rows=subjectNodes(SUBJ).map(function(id){return {id:id,e:M[id]}}).filter(function(x){return x.e&&x.e.auto&&(x.e.state==="unknown"||x.e.state==="shaky")}).sort(function(a,b){return (+a.e.score||0)-(+b.e.score||0)}).slice(0,3);\n'
    '  if(!rows.length){el.hidden=true;el.innerHTML="";return}el.hidden=false;\n'
    '  el.innerHTML=\'<img src="notes/classroom/assets/tutor/sharp.png" alt="" onerror="this.style.display=\\\'none\\\'"><div class="jb"><div class="jn">김주영 스앵님 판정</div><ul>\'+rows.map(function(r){var s2=r.e.state,w=whyText(r.e.auto),ln=LINKS[r.id];return \'<li><span class="s" style="background:var(--\'+s2+\')">\'+({shaky:"흔들림",unknown:"모름"})[s2]+\'</span><span>\'+esc(NODES[r.id].name)+\'</span>\'+(w?\'<span class="w">\'+esc(w)+\'</span>\':"")+(ln?\'<a href="\'+esc(ln)+\'">교실</a>\':"")+\'</li>\'}).join("")+\'</ul></div>\'}', "판정 패널")
sub("'<span style=\"color:var(--unknown)\">뿌리 결손 <b>'+a.gaps.length+'</b> — 여기부터 시작</span>'",
    "'<span style=\"color:var(--unknown)\">뿌리 결손 <b>'+a.gaps.length+'</b></span>'", "결손 안내")
# 카드: 자가평가 제거 · 판정 근거 · 퀴즈 = 기록
sub("else h+='<div class=\"sec\"><h4>카드</h4><p style=\"color:var(--sub)\">카드 준비 중 — 지금은 자가평가만 저장됩니다.</p></div>';",
    "else h+='<div class=\"sec\"><h4>카드</h4><p style=\"color:var(--sub)\">카드 준비 중</p></div>';\n"
    "    {var rs=window.TJ?TJ.reasons(id):null;h+='<div class=\"sec\"><h4>스앵님 판정</h4><p class=\"why2\">'+(rs?esc(whyText({q:rs.q,c:rs.c,conf:rs.conf,read:rs.read,memo:rs.memo})||\"읽은 기록\"):\"기록 없음\")+'</p></div>'}", "카드 판정 근거")
sub("    h+='<div class=\"sec\"><h4>자가평가 — 남에게 설명할 수 있나?</h4><div class=\"self\"><span style=\"font-size:12px;color:var(--sub)\">1 전혀</span><input type=\"range\" min=\"1\" max=\"5\" value=\"'+sv+'\" id=\"selfR\"><span style=\"font-size:12px;color:var(--sub)\">5 확실</span><b id=\"selfV\">'+sv+' / 5</b></div></div>';\n", "", "자가평가 제거")
sub("h+='<button class=\"btn\" id=\"saveBtn\">'+(c&&c.quiz&&c.quiz.length?\"채점하고 저장\":\"자가평가 저장\")+'</button><button class=\"btn ghost\" id=\"closeBtn\">닫기</button>'",
    "h+=(c&&c.quiz&&c.quiz.length?'<button class=\"btn\" id=\"saveBtn\">채점</button>':'')+'<button class=\"btn ghost\" id=\"closeBtn\">닫기</button>'", "저장 버튼")
sub('$("#selfR").oninput=function(){$("#selfV").textContent=this.value+" / 5"};$("#closeBtn").onclick=closeCard;', '$("#closeBtn").onclick=closeCard;', "자가평가 입력")
sub('$("#saveBtn").onclick=function(){var upd={},u={self:+$("#selfR").value,seen:true};',
    'var sb=$("#saveBtn");if(sb)sb.onclick=function(){var upd={},u={seen:true};', "채점 시작")
sub("upd[id]=u;this.disabled=true;var btn=this;saveM(upd).then(function(){var r=score(M[id]);",
    "/* 카드 퀴즈도 스앵님 판정 기록 — 문항마다 quiz 한 건 */\n"
    "      if(u.quiz&&window.TJ){c.quiz.forEach(function(q,i){var r=sh.querySelector('input[name=\"q'+i+'\"]:checked');if(r)TJ.rec({k:\"quiz\",ok:+r.value===q.answer,n:[id],lid:\"card\",qid:id+\"#\"+i})});try{var J=JSON.parse(localStorage.getItem(\"atto.mastery\")||\"{}\");if(J[id])u=Object.assign({},J[id],{seen:true})}catch(e){}}\n"
    "      upd[id]=u;this.disabled=true;var btn=this;saveM(upd).then(function(){var r=score(M[id]);renderJudge();", "카드 퀴즈 기록")
sub('$("#mode").textContent=SERVER?"atom 저장":"이 기기에만 저장";', '$("#mode").textContent="";', "저장 위치 안내")
# 판정 패널의 「교실」 연결: knowledge/lesson_nodes.json 에서 노드가 처음 나온 회차·챕터
sub('fetch("knowledge/progress.json").then(function(r){return r.ok?r.json():null}).catch(function(){return null}),probe]).then(function(a){',
    'fetch("knowledge/progress.json").then(function(r){return r.ok?r.json():null}).catch(function(){return null}),probe,\n'
    '    fetch("knowledge/lesson_nodes.json").then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(j){if(!j||!j.lessons)return;Object.keys(j.lessons).forEach(function(lid){var r=j.lessons[lid],m=/^(\\w+)-(\\d{4}-\\d{2}-\\d{2})$/.exec(lid);if(!m)return;Object.keys(r.sec||{}).forEach(function(sid,k){(r.sec[sid]||[]).forEach(function(n){if(!LINKS[n])LINKS[n]="notes/classroom/"+m[1]+"/"+m[2]+".html#ch="+(k+1)})})})})]).then(function(a){', "교실 연결")
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("learn.html judge ok")
