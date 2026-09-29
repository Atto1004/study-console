# -*- coding: utf-8 -*-
"""학습 슬라이드 템플릿 v7 패치(2026-09-29, 대표님): ① 객관식 보기 섞기 대응 — 고른 보기를 원문 순서 k 로 저장·표시(quizmix, 섞기 전 저장값 = 원문 순서라 그대로 맞는다)
② 화면 부가 설명 제거(「부가적인 설명 텍스트는 화면에 안 보이게」) — 보기 채점 안내 · 펜 안내 · 출처 사진 조작 안내 · 암기/이해 부제 · 답 칸 설명. 멱등."""
import io, os
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "slides_tpl.html")
s = io.open(P, encoding="utf-8").read()
def sub(old, new, label):
    global s
    # 멱등: 새 글이 옛 글을 품으면(덧붙이기) 새 글이 있을 때 건너뜀 · 아니면 옛 글이 있으면 바꾼다(새 글이 옛 글의 일부인 「지우기」도 된다) · 둘 다 아니면 이미 바뀐 것
    if new and old in new and new in s: return
    if s.count(old) == 1: s = s.replace(old, new, 1); return
    if (not new or new in s) and old not in s: return   # 지우기(빈 새 글)도 두 번째부터는 건너뜀
    raise AssertionError(f"{label}: 자리 {s.count(old)}개")
# ① 보기 k — 고른 보기 찾기 도우미
sub("function openAns(s){",
    "/* v7: 보기는 빌드 때 섞인다(quizmix). 저장값 = 원문 순서 k → 화면 칸 찾기 */\nconst ckey=(c,i)=>String(c&&c.k!=null?c.k:i), cpick=(s,my)=>(s.choices||[]).findIndex((c,i)=>my!=null&&my!==\"\"&&ckey(c,i)===String(my));\nfunction openAns(s){", "도우미")
sub("const mine= mc ? (s.choices[+my]?'<span class=\"num\">'+(+my+1)+'</span>번 — '+s.choices[+my].html:'') : esc(my||\"\");",
    "const mi=mc?cpick(s,my):-1; const mine= mc ? (mi>=0?'<span class=\"num\">'+(mi+1)+'</span>번 — '+s.choices[mi].html:'') : esc(my||\"\");", "내 답 표시")
sub("s.choices.map((c,i)=>{ const sel=String(my)===String(i);",
    "s.choices.map((c,i)=>{ const sel=my!=null&&my!==\"\"&&String(my)===ckey(c,i);", "선택 표시")
sub("const ci=b.dataset.ci; if(ST.revealed[s.id]) return; const ok=!!(s.choices[+ci]&&s.choices[+ci].ok); ST.answer[s.id]=ci;",
    "const ci=b.dataset.ci; if(ST.revealed[s.id]) return; const c=s.choices[+ci]; const ok=!!(c&&c.ok); ST.answer[s.id]=ckey(c,+ci);", "선택 저장")
sub("my: my==null||my===\"\"?null:(mc?(s.choices[+my]?ctxPlain(s.choices[+my].html,120):null):String(my).slice(0,200)),",
    "my: my==null||my===\"\"?null:(mc?(cpick(s,my)>=0?ctxPlain(s.choices[cpick(s,my)].html,120):null):String(my).slice(0,200)),", "질문 문맥")
# ② 부가 설명
sub("act.innerHTML='<span class=\"hint\">보기를 누르면 바로 채점됩니다</span>';", "act.innerHTML='';", "채점 안내")
sub('<span>풀이 메모장</span><span class="hint">애플펜슬로 쓰세요</span>', '<span>풀이 메모장</span>', "펜 안내")
sub('<span class="hint">사진을 누르면 확대 · 드래그로 이동</span>', '<span class="sp" style="flex:1"></span>', "출처 조작 안내")
sub('<div class="mu-h">암기할 것 <span class="hint">외워서 바로 나와야</span></div>', '<div class="mu-h">암기</div>', "암기 부제")
sub('<div class="mu-h">이해할 것 <span class="hint">왜 그런지 설명할 수 있어야</span></div>', '<div class="mu-h">이해</div>', "이해 부제")
sub("<label for=\"myans\">내 답 — 답만. 행렬은 [1 2; 3 4]처럼, 여러 개면 쉼표로</label><textarea id=\"myans\" rows=\"2\" placeholder=\"여기에 답을 쓰고 「답 확인」\">",
    "<label for=\"myans\">내 답</label><textarea id=\"myans\" rows=\"2\">", "답 칸 설명")
# ③ 스앵님 판정 기록(대표님 2026-09-29 「내가 뭘 알고 모르는지 스앵님이 알아서」) — 덱 문제·파트 → 개념 노드(knowledge/lesson_nodes.json decks), 판정 = tutor_judge.js
sub('<script>\nconst DECK_ID="__DECK_ID__";',
    '<script>__JUDGE__</script>\n<script>\nconst DECK_ID="__DECK_ID__";\nconst NDS=__NODES__, qNd=s=>((NDS.q||{})[s.id]||(NDS.parts||{})[String(s.part)]||[]), pNd=s=>((NDS.parts||{})[String(s.part)]||[]);\n'
    'function ev(k,x){ try{ if(!window.TJ) return; const o=Object.assign({k:k,lid:DECK_ID},x||{}); if(o.n&&o.n.length) TJ.rec(o); }catch(e){} }', "판정 스크립트")
sub('ST.correct[s.id]=ok; ST.done[s.id]=true; save(); render(); }; });',
    'ST.correct[s.id]=ok; ST.done[s.id]=true; save(); render(); ev("quiz",{qid:s.id,ok:ok,n:qNd(s)}); }; });', "보기 채점 기록")
sub('$("#yes").onclick=()=>{ ST.correct[s.id]=true; ST.done[s.id]=true; save(); render(); };',
    '$("#yes").onclick=()=>{ ST.correct[s.id]=true; ST.done[s.id]=true; save(); render(); ev("quiz",{qid:s.id,ok:true,n:qNd(s)}); };', "자기 채점 기록 1")
sub('$("#no").onclick=()=>{ ST.correct[s.id]=false; ST.done[s.id]=true; save(); render(); };',
    '$("#no").onclick=()=>{ ST.correct[s.id]=false; ST.done[s.id]=true; save(); render(); ev("quiz",{qid:s.id,ok:false,n:qNd(s)}); };', "자기 채점 기록 2")
sub('act.innerHTML=\'<button class="btn" id="ok">\'+(ST.done[s.id]?"다시 읽음 표시":"읽었어요 — 이해했습니다")+\'</button>\';\n    $("#ok").onclick=()=>{ ST.done[s.id]=true; save(); render(); };',
    'act.innerHTML=\'<button class="btn" id="ok">\'+(ST.done[s.id]?"다시 읽음 표시":"이해했어요")+\'</button>\';\n    $("#ok").onclick=()=>{ const was=!!ST.done[s.id]; ST.done[s.id]=true; save(); render(); if(!was) ev("read",{sid:s.id,n:pNd(s),clean:true}); };', "개념 읽음 기록")
# ④ 시작 장 설명 문단 · 조작 안내 제거
sub("'<div class=\"sub\">오른쪽 아래 「다음」으로 언제든 넘어갈 수 있고, 페이지를 끝내면 「다음」이 실선이 됩니다. 기초 문제는 보기를 누르고, 답이 여러 개인 문제는 답을 씁니다. 왼쪽 아래 「힌트」는 그 파트의 한 줄 요약, 작은 사진은 출처(학습지·내 풀이본)입니다.</div>'+\n", "", "시작 장 설명")
sub("(QUIZ?'문제 '+num(SLIDES.filter(x=>x.type===\"q\").length)+'개 · 보기를 누르면 바로 채점 · 끝 장에서 틀린 문제만 다시':", "(QUIZ?'문제 '+num(SLIDES.filter(x=>x.type===\"q\").length)+'개':", "시작 장 문제 안내")
sub('(QUIZ?"문제만 풀기 · 시험 대비":"학습 슬라이드 · 가로 화면")', '(QUIZ?"문제만 풀기 · 시험 대비":"학습 슬라이드")', "시작 장 머리")
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("slides_tpl v7 ok")
