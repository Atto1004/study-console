# -*- coding: utf-8 -*-
"""덱 템플릿 v6b — 결과 장 재구성(브리프 v49 r3 §3): 정답·오답·안 푼 3칸 + 통과 기준 숫자 + 틀린 문제 목록 + 주버튼 우선순위
  (오답>0 → 틀린 문제 복습 / 오답0·안 푼>0 → 안 푼 문제 풀기 / 전부 정답 → 다음 파트(마지막이면 전체 결과)). 글꼴 경고는 3초 뒤 재확인해 로드되면 지운다.
템플릿 + 덱 5개. 멱등."""
import io, glob
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
FILES = [ROOT + r"\docs\tools\slides_tpl.html", r"C:\Users\user\.claude\scratch\sc_test\slides_tpl.html"] + glob.glob(ROOT + r"\notes\*slides*.html")

OLD_START = '''  } else if(s.type==="result"){
    const sc=partScore(s.part), pct=(o)=>o.n?Math.round(o.ok/o.n*100):0;'''
OLD_END = '''    $("#ok").onclick=()=>{ ST.done[s.id]=true; save(); go(1); };
  } else if(s.type==="final"){'''
NEW = r'''  } else if(s.type==="result"){
    /* V6B-RESULT: 정답·오답·안 푼 3칸 + 숫자 기준 + 틀린 문제 목록 + 주버튼 하나 (브리프 v49 r3 §3) */
    const sc=partScore(s.part);
    const qs=SLIDES.filter(x=>x.type==="q"&&x.part===s.part&&!ST.skip[x.id]);
    const wrong=qs.filter(q=>ST.correct[q.id]===false), left=qs.filter(q=>!ST.done[q.id]||ST.correct[q.id]==null&&!ST.revealed[q.id]);
    const okN=qs.filter(q=>ST.correct[q.id]===true).length;
    const passB=sc.b.n===0||sc.b.ok===sc.b.n, needA=Math.ceil(sc.a.n*2/3), passA=sc.a.n===0||sc.a.ok>=needA;
    const rule=(sc.b.n?'기초 '+sc.b.n+'문제 전부 정답':'')+(sc.b.n&&sc.a.n?' + ':'')+(sc.a.n?'응용 '+sc.a.n+'문제 중 '+needA+'문제 이상':'');
    body.classList.add("scrollable");
    body.innerHTML='<div class="kicker">파트 '+num(s.part)+' 결과</div><h1>'+esc(String(s.title).replace(/[\s★]+$/,""))+'</h1>'+
      '<div class="score"><div class="c ok"><b>'+okN+'</b>정답</div><div class="c bad"><b>'+wrong.length+'</b>오답</div><div class="c"><b>'+left.length+'</b>안 푼 문제</div></div>'+
      '<p class="rs-rule">통과 기준: '+esc(rule||'문제 없음')+' · 지금 '+(passB&&passA?'<b class="rs-pass">통과</b>':'<b class="rs-fail">미달</b>')+' (기초 '+sc.b.ok+'/'+sc.b.n+' · 응용 '+sc.a.ok+'/'+sc.a.n+')</p>'+
      (wrong.length?'<div class="rs-list"><div class="kicker">틀린 문제</div>'+wrong.map(q=>'<button class="rs-q" data-go="'+q.id+'"><span class="q-kind">'+esc(q.kind||"")+'</span>'+esc(q.qn||q.id)+'</button>').join("")+'</div>':'')+
      (left.length&&!wrong.length?'<div class="rs-list"><div class="kicker">안 푼 문제</div>'+left.map(q=>'<button class="rs-q" data-go="'+q.id+'"><span class="q-kind">'+esc(q.kind||"")+'</span>'+esc(q.qn||q.id)+'</button>').join("")+'</div>':'');
    body.querySelectorAll(".rs-q").forEach(b=>{ b.onclick=()=>startFrom(b.dataset.go,"at"); });
    const nextPart=PARTS.find(p=>p.n===s.part+1);
    let primary;
    if(wrong.length) primary='<button class="btn primary" id="rsGo">틀린 문제 복습</button>';
    else if(left.length) primary='<button class="btn primary" id="rsGo">안 푼 문제 풀기</button>';
    else primary='<button class="btn primary" id="rsGo">'+(nextPart?'다음 파트':'전체 결과')+'</button>';
    act.innerHTML='<button class="btn xs" id="back">이 파트 처음으로</button>'+(wrong.length&&left.length?'<button class="btn xs" id="rsLeft">안 푼 문제 '+left.length+'개</button>':'')+primary;
    $("#back").onclick=()=>{ ST.idx=SLIDES.findIndex(x=>x.id==="p"+s.part+"-cover"); save(); render(); };
    const rl=$("#rsLeft"); if(rl) rl.onclick=()=>startFrom(left[0].id,"at");
    $("#rsGo").onclick=()=>{ ST.done[s.id]=true; save();
      if(wrong.length){ wrong.forEach(q=>{ delete ST.revealed[q.id]; delete ST.done[q.id]; delete ST.correct[q.id]; delete ST.answer[q.id]; }); save(); startFrom(wrong[0].id,"at"); }
      else if(left.length) startFrom(left[0].id,"at");
      else go(1); };
  } else if(s.type==="final"){'''

CSS_ADD = '''.score .c.ok b{color:var(--accent)}.score .c.bad b{color:var(--bad)}.rs-rule{font-family:var(--ui);font-size:13px;color:var(--muted);margin-top:4px}.rs-pass{color:var(--accent)}.rs-fail{color:var(--bad)}
.rs-list{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}.rs-list .kicker{flex:0 0 100%}
.rs-q{font:inherit;font-size:var(--fs-note);display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:10px;background:#fff;padding:6px 12px;cursor:pointer}.rs-q:hover{background:var(--soft)}
'''
FONT_OLD = '''function fontCheck(){ try{ const ok=document.fonts.check("22px 'Nanum Pen Script'"); if(!ok){ let w=$("#fontWarn");'''
FONT_NEW = '''function fontCheck(){ try{ const ok=document.fonts.check("22px 'Nanum Pen Script'"); if(ok){ const w0=$("#fontWarn"); if(w0) w0.hidden=true; return; } setTimeout(fontCheck,3000); /* V6B: 늦게 로드되면 경고를 지운다 */ if(!ok){ let w=$("#fontWarn");'''

def patch(p):
    s = io.open(p, encoding="utf-8").read()
    if "V6B-RESULT" in s: print("skip", p[-40:]); return
    i = s.index(OLD_START); j = s.index(OLD_END, i) + len(OLD_END)
    s = s[:i] + NEW + s[j:]
    assert s.count(FONT_OLD) == 1, p
    s = s.replace(FONT_OLD, FONT_NEW, 1)
    s = s.replace("/* 시작 위치 목록 · 결과 */", CSS_ADD + "/* 시작 위치 목록 · 결과 */", 1)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s); print("patched", p[-40:])

for f in FILES: patch(f)
