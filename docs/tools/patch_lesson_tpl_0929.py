# -*- coding: utf-8 -*-
"""수업 노트 템플릿 패치(대표님 2026-09-29): 객관식 보기 섞기(k) · 암기/이해 알약 · 인라인 식 한 줄 · 화면 부가 설명 제거 · 스앵님 판정 기록 · 암기노트 링크. 멱등."""
import io, os
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lesson_tpl.html")
s = io.open(P, encoding="utf-8").read()
def sub(old, new, label):
    global s
    # 멱등: 새 글이 옛 글을 품으면(덧붙이기) 새 글이 있을 때 건너뜀 · 아니면 옛 글이 있으면 바꾼다(새 글이 옛 글의 일부인 「지우기」도 된다) · 둘 다 아니면 이미 바뀐 것
    if new and old in new and new in s: return
    if s.count(old) == 1: s = s.replace(old, new, 1); return
    if (not new or new in s) and old not in s: return   # 지우기(빈 새 글)도 두 번째부터는 건너뜀
    raise AssertionError(f"{label}: 자리 {s.count(old)}개")
# 알약: 암기(공식·외울 것) · 이해(왜·비유) · 함정 · 교수님 말 — 상자 머리말을 알약으로
sub('.why{border-left:5px solid var(--blue)}.why::before{content:"왜 그런가";display:block;font-size:12.5px;font-weight:700;color:var(--blue);margin-bottom:4px}',
    '/* 암기·이해 구분(대표님 2026-09-29): 상자 머리말 = 알약. 암기(주황) = 공식·외울 것, 이해(파랑) = 왜·비유 */\n'
    '.why::before,.analogy::before,.formula::before,.pitfall::before,.say::before,.memo.am::before{display:table;font-size:12px;font-weight:800;line-height:1;padding:5px 10px;border-radius:999px;margin:0 0 8px;color:#fff;letter-spacing:.02em}\n'
    '.why{border-left:5px solid var(--blue)}.why::before{content:"이해 · 왜";background:#1D4ED8}', "왜 알약")
sub('.say::before{content:"교수님 말";display:block;font-size:12.5px;font-weight:700;color:var(--pink);margin-bottom:4px}', '.say::before{content:"교수님 말";background:#A61E4D}', "교수님 말 알약")
sub('.analogy::before{content:"비유";display:block;font-size:12.5px;font-weight:700;color:#B26A00;margin-bottom:4px}', '.analogy{border-left-color:var(--blue)}.analogy::before{content:"이해 · 비유";background:#1D4ED8}', "비유 알약")
sub('.formula::before{content:"외울 것";display:block;font-size:12.5px;font-weight:700;color:var(--green);margin-bottom:4px}', '.formula{border-left-color:#D97706;background:rgba(217,119,6,.06)}.formula::before{content:"암기 · 공식";background:#B45309}', "공식 알약")
sub('.pitfall::before{content:"함정";display:block;font-size:12.5px;font-weight:700;color:var(--red);margin-bottom:4px}', '.pitfall::before{content:"함정";background:#C92A2A}', "함정 알약")
sub('.memo{border-left:5px solid var(--ink-3)}', '.memo{border-left:5px solid var(--ink-3)}\n.memo.am{border-left-color:#D97706;background:rgba(217,119,6,.06)}.memo.am::before{content:"암기";background:#B45309}\n'
    '/* 인라인 식은 줄에서 끊지 않는다(대표님 2026-09-29 「수식 한 줄로」) — 넘치면 fitInline 이 줄인다 */\n.katex{white-space:nowrap}\n'
    '#top a.memo-l{color:var(--ink);font-weight:700;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:6px 12px;background:rgba(255,255,255,.6);min-height:32px;display:inline-flex;align-items:center}', "암기 상자·인라인 식")
sub('.say{background:rgba(255,77,141,.10)}.analogy{background:rgba(245,159,0,.10)}.formula{background:rgba(47,158,68,.10)}.pitfall{background:rgba(224,49,49,.10)}',
    '.say{background:rgba(255,77,141,.10)}.analogy{background:rgba(59,130,246,.10)}.formula{background:rgba(217,119,6,.12)}.memo.am{background:rgba(217,119,6,.12)}.pitfall{background:rgba(224,49,49,.10)}#top a.memo-l{background:rgba(255,255,255,.08)}', "다크 알약 상자")
# 화면 부가 설명 제거 + 암기노트 링크
sub('<span id="tRead">읽음 0/0</span><span class="pct" id="tPct">0%</span>', '<span id="tRead">읽음 0/0</span><span class="pct" id="tPct">0%</span><a class="memo-l" href="__MEMO__">암기노트</a>', "암기노트 링크")
sub('<section id="quiz"><h2>확인 문제</h2><div class="hint">보기를 누르면 바로 채점됩니다. 답을 쓰는 문제는 「답 보기」 뒤에 맞음/틀림을 스스로 표시합니다.</div>', '<section id="quiz"><h2>확인 문제</h2>', "문제 안내")
sub('$("#done").textContent= rd>=N_SEC&&qd>=QUIZ.length&&QUIZ.length? (okN>=need? "이 회차 끝 — 정답 "+okN+"/"+QUIZ.length+". 앱의 「수업 따라가기」에서 따라감으로 표시됩니다." : "다 풀었지만 정답 "+okN+"/"+QUIZ.length+" — 틀린 문제를 다시 풀어 "+need+"개 이상 맞히면 따라감으로 표시됩니다.") : ""; }',
    '$("#done").textContent= rd>=N_SEC&&qd>=QUIZ.length&&QUIZ.length? (okN>=need? "완료 · 정답 "+okN+"/"+QUIZ.length : "정답 "+okN+"/"+QUIZ.length+" · "+need+"개 이상이면 완료") : ""; }', "끝 안내")
# 스앵님 판정 스크립트 + 노드 연결
# (두 자리로 나눈다 — 한 번에 바꾸면 뒤 패치가 사이에 끼어들 때 새 글이 깨져 두 번 들어갔다, 2026-09-29)
sub('const LESSON_ID="__ID__", QUIZ=__QUIZ__,', 'const LESSON_ID="__ID__", QUIZ=__QUIZ__, NDS=__NODES__,', "노드 연결")
sub('<script>\nconst LESSON_ID=', '<script>__JUDGE__</script>\n<script>__SPLITTEX__</script>\n<script>\nconst LESSON_ID=', "판정·식 나누기 스크립트")
sub('function typeset(el){', '/* 스앵님 판정 기록(대표님 2026-09-29) — 섹션 읽음 · 문제 채점 → 개념 노드(knowledge/lesson_nodes.json) */\nfunction ev(k,x){ try{ if(!window.TJ) return; const o=Object.assign({k:k,lid:LESSON_ID},x||{}); if(o.n&&o.n.length) TJ.rec(o); }catch(e){} }\n'
    '/* 객관식 보기는 빌드 때 섞인다(quizmix) — 고른 보기를 원문 순서 k 로 저장 */\nconst ck=(c,i)=>String(c&&c.k!=null?c.k:i);\n'
    '/* 인라인 식이 줄보다 길면 글자를 줄여 한 줄에(14px 까지) */\nfunction fitInline(root){ $$(".katex",root).forEach(k=>{ if(k.closest(".katex-display")) return; k.style.fontSize=""; const box=k.parentElement&&k.parentElement.closest("p,li,div,summary,button,td"); if(!box) return; const cw=box.clientWidth, w=k.getBoundingClientRect().width; if(!(cw>0&&w>cw-2)) return; const fs=parseFloat(getComputedStyle(k).fontSize)||17; k.style.fontSize=Math.max(14,Math.floor(fs*(cw-6)/w))+"px"; }); }\n'
    'window.addEventListener("resize",()=>fitInline(document.querySelector("main")),{passive:true});\n'
    'function typeset(el){', "판정·보기·인라인 도우미")
sub('function typeset(el){ try{ renderMathInElement(el,{delimiters:[{left:"\\\\(",right:"\\\\)",display:false},{left:"\\\\[",right:"\\\\]",display:true}],throwOnError:false,strict:"ignore"}); }catch(e){} }',
    'function typeset(el){ try{ renderMathInElement(el,{delimiters:[{left:"\\\\(",right:"\\\\)",display:false},{left:"\\\\[",right:"\\\\]",display:true}],throwOnError:false,strict:"ignore"}); }catch(e){} fitInline(el); }', "조판 뒤 인라인 맞춤")
sub('if(!ST.read[id]&&!timers[id]) timers[id]=setTimeout(()=>{ ST.read[id]=true; save(); renderTop(); },1200);',
    'if(!ST.read[id]&&!timers[id]) timers[id]=setTimeout(()=>{ ST.read[id]=true; save(); renderTop(); ev("read",{sid:id,n:(NDS.sec||{})[id]||[],clean:true}); },1200);', "읽음 기록 1")
sub("if(r.bottom<window.innerHeight*.6&&r.bottom>-2000){ ST.read[s.dataset.id]=true; save(); renderTop(); }",
    "if(r.bottom<window.innerHeight*.6&&r.bottom>-2000){ ST.read[s.dataset.id]=true; save(); renderTop(); ev(\"read\",{sid:s.dataset.id,n:(NDS.sec||{})[s.dataset.id]||[],clean:true}); }", "읽음 기록 2")
sub('const sel=String(my)===String(ci);', 'const sel=my!=null&&String(my)===ck(c,ci);', "고른 보기 표시")
sub('const ci=+b.dataset.ci; ST.answer[q.id]=ci; ST.done[q.id]=true; ST.correct[q.id]=!!(q.choices[ci]&&q.choices[ci].ok); save(); bindQ(); renderTop();',
    'const ci=+b.dataset.ci, c=q.choices[ci]; ST.answer[q.id]=(c&&c.k!=null)?c.k:ci; ST.done[q.id]=true; ST.correct[q.id]=!!(c&&c.ok); save(); bindQ(); renderTop(); ev("quiz",{qid:q.id,ok:ST.correct[q.id],n:(NDS.q||{})[q.id]||[]});', "고른 보기 저장·기록")
sub('b.onclick=()=>{ ST.correct[q.id]=b.dataset.grade==="1"; save(); bindQ(); renderTop(); };',
    'b.onclick=()=>{ ST.correct[q.id]=b.dataset.grade==="1"; save(); bindQ(); renderTop(); ev("quiz",{qid:q.id,ok:ST.correct[q.id],n:(NDS.q||{})[q.id]||[]}); };', "자기 채점 기록")
# 여러 식을 이은 식 줄 → 식마다 한 줄(docs/tools/split_tex.js, 빌더가 __SPLITTEX__ 에 넣는다) + 넘치는 식은 글자를 줄여 한 줄(14px 까지)
sub('function boot(){ typeset(document.querySelector("main"));',
    '/* 넘치는 식 줄은 글자를 줄여 한 줄에(14px 까지) — 그래도 넘치면 식 칸 안에서 민다 */\n'
    'function fitDisplay(root){ $$(".katex-display",root).forEach(k=>{ k.style.fontSize=""; const cw=k.clientWidth, sw=k.scrollWidth; if(!(cw>0&&sw>cw+1)) return; const kx=k.querySelector(".katex"), fz=parseFloat(getComputedStyle(kx||k).fontSize)||20, lo=Math.min(1,Math.max(.6,14/fz)); k.style.fontSize=Math.max(lo,Math.floor(cw/sw*100)/100)+"em"; }); }\n'
    'window.addEventListener("resize",()=>fitDisplay(document.querySelector("main")),{passive:true});\n'
    'function boot(){ $$("section.s").forEach(s=>{ const h=s.innerHTML, n=splitDisplays(h,innerWidth<700); if(n!==h) s.innerHTML=n; }); typeset(document.querySelector("main")); fitDisplay(document.querySelector("main")); try{ document.fonts.ready.then(()=>fitDisplay(document.querySelector("main"))); }catch(e){}', "식 나누기·맞춤")
sub("inner+='<div class=\"ans\"><b>답 · 풀이</b><div>'+(q.ans||\"\")+'</div></div>';", "inner+='<div class=\"ans\"><b>답 · 풀이</b><div>'+splitDisplays(q.ans||\"\",innerWidth<700)+'</div></div>';", "해설 식 나누기")
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("lesson_tpl 0929 ok")
