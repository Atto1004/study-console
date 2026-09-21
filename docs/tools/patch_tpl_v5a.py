# -*- coding: utf-8 -*-
"""덱 템플릿 v5a (아토 2026-09-21):
  ① 객관식은 보기를 누르면 바로 채점(「답 확인」 버튼 없음)
  ② 정답이면 답·풀이 판을 자동으로 띄우지 않는다(오답·자기채점 전에만). 「답 · 풀이 다시 보기」 버튼은 유지
  ③ 마지막 학습 위치 저장: 저장 때마다 localStorage "mc-slides-last"(전체 최신)·"mc-slides-last-<deck>"에
     {deck,title,href,idx,n,sid,part,partTitle,where,qDone,qN,ts} 기록 → 앱(V43)이 「이어서 학습하기」 카드로 읽는다
  ④ #resume 해시 = 저장된 위치에서 그대로 열기(#at= 은 파트 시작으로 되돌리므로 이어서 학습에는 #resume 사용)
템플릿(docs/tools/slides_tpl.html)과 이미 빌드된 덱 5개에 같은 치환. 멱등."""
import io, sys, glob
ROOT = r"C:\Users\user\Desktop\아톰OS\기술실\study-console"
FILES = [ROOT + r"\docs\tools\slides_tpl.html", r"C:\Users\user\.claude\scratch\sc_test\slides_tpl.html"] + glob.glob(ROOT + r"\notes\*slides*.html")

def patch(p):
    s = io.open(p, encoding="utf-8").read()
    if "V5A-RESUME" in s:
        print("skip (already)", p); return
    n0 = len(s)
    # ① 객관식 즉시 채점
    old = '''    if(mc&&!rev){
      act.innerHTML='<button class="btn primary" id="reveal" disabled>답 확인</button>';
      const rb=$("#reveal"); let my2=my; const upd=()=>{ rb.disabled=!(String(my2)!==""); };
      body.querySelectorAll(".choice").forEach(b=>{ b.onclick=()=>{ my2=b.dataset.ci; ST.answer[s.id]=my2; save(); body.querySelectorAll(".choice").forEach(x=>x.classList.toggle("sel",x===b)); upd(); }; });
      upd();
      rb.onclick=()=>{ if(String(my2)==="") return; const ok=!!(s.choices[+my2]&&s.choices[+my2].ok); ST.answer[s.id]=my2; ST.revealed[s.id]=true; ST.correct[s.id]=ok; ST.done[s.id]=true; save(); render(); };
    } else if(mc&&rev){
      const c=ST.correct[s.id];
      act.innerHTML='<span class="verdict '+(c?"ok":"bad")+'">'+(c?"정답":"오답 — 풀이를 읽고 다시")+'</span><button class="btn xs" id="retry1">다시 풀기</button>';
      $("#retry1").onclick=()=>{ delete ST.revealed[s.id]; delete ST.done[s.id]; delete ST.correct[s.id]; delete ST.answer[s.id]; save(); render(); };'''
    new = '''    if(mc&&!rev){
      /* V5A: 보기를 누르는 순간 제출·채점 (아토 2026-09-21 "객관식은 고르면 바로 정답으로 제출") */
      act.innerHTML='<span class="hint">보기를 누르면 바로 채점됩니다</span>';
      body.querySelectorAll(".choice").forEach(b=>{ b.onclick=()=>{ const ci=b.dataset.ci; if(ST.revealed[s.id]) return; const ok=!!(s.choices[+ci]&&s.choices[+ci].ok); ST.answer[s.id]=ci; ST.revealed[s.id]=true; ST.correct[s.id]=ok; ST.done[s.id]=true; save(); render(); }; });
    } else if(mc&&rev){
      const c=ST.correct[s.id];
      act.innerHTML='<span class="verdict '+(c?"ok":"bad")+'">'+(c?"정답":"오답 — 풀이를 읽고 다시")+'</span><button class="btn xs" id="retry1">다시 풀기</button>';
      $("#retry1").onclick=()=>{ delete ST.revealed[s.id]; delete ST.done[s.id]; delete ST.correct[s.id]; delete ST.answer[s.id]; save(); render(); };'''
    assert s.count(old) == 1, ("① 앵커", p); s = s.replace(old, new)
    # ②-1 답 판 자동 열기는 정답이 아닐 때만
    old = '''    if(rev){ openAns(s); const sa=$("#showAns"); if(sa) sa.onclick=()=>openAns(s); }'''
    new = '''    if(rev){ if(ST.correct[s.id]!==true) openAns(s); /* V5A: 정답이면 풀이 판을 띄우지 않는다 (아토 2026-09-21) */ const sa=$("#showAns"); if(sa) sa.onclick=()=>openAns(s); }'''
    assert s.count(old) == 1, ("②-1 앵커", p); s = s.replace(old, new)
    # ②-2 (변경 없음 — 하단 「다음 →」가 이미 있어 별도 버튼 안 둠)
    old = '''      act.innerHTML='<button class="btn" id="yes">맞았어요'+(c===true?" ✓":"")+'</button><button class="btn" id="no">틀렸어요 · 다시'+(c===false?" ✓":"")+'</button>';
      $("#yes").onclick=()=>{ ST.correct[s.id]=true; ST.done[s.id]=true; save(); render(); };
      $("#no").onclick=()=>{ ST.correct[s.id]=false; ST.done[s.id]=true; save(); render(); };'''
    new = '''      act.innerHTML='<button class="btn" id="yes">맞았어요'+(c===true?" ✓":"")+'</button><button class="btn" id="no">틀렸어요 · 다시'+(c===false?" ✓":"")+'</button>';
      $("#yes").onclick=()=>{ ST.correct[s.id]=true; ST.done[s.id]=true; save(); render(); };
      $("#no").onclick=()=>{ ST.correct[s.id]=false; ST.done[s.id]=true; save(); render(); };'''
    assert s.count(old) == 1, ("②-2 앵커", p); s = s.replace(old, new)
    # ③ 마지막 위치 기록
    old = '''const save=()=>{ try{ localStorage.setItem(KEY,JSON.stringify(ST)); }catch(e){} };'''
    new = '''/* V5A-RESUME: 마지막 학습 위치 — 앱의 「이어서 학습하기」 카드가 읽는다 (아토 2026-09-21). #check(빌드 검사) 중에는 쓰지 않는다 */
const LAST_KEY="mc-slides-last";
function lastInfo(){
  const s=SLIDES[Math.max(0,Math.min(ST.idx,SLIDES.length-1))]; if(!s) return null;
  const p=s.part?PARTS.find(x=>x.n===s.part):null; const qs=SLIDES.filter(x=>x.type==="q");
  const clean=t=>String(t||"").replace(/[\\s★]+$/,"");
  const where= s.type==="q"?((s.kind||"")+" 문제 · "+(s.qn||"")).trim() : s.type==="concept"?("개념 · "+clean(s.title)) : s.type==="mu"?"암기 vs 이해" : s.type==="cover"?"파트 시작" : s.type==="result"?"파트 결과" : s.type==="final"?"전체 결과" : s.type==="jump"?"시작 위치 고르기" : "표지";
  return {deck:DECK_ID,title:document.title,href:location.href.split("#")[0],idx:ST.idx,n:SLIDES.length,sid:s.id,part:s.part||null,partTitle:p?clean(p.title):"",where:where,qDone:qs.filter(q=>ST.done[q.id]).length,qN:qs.length,ts:Date.now()};
}
const save=()=>{ if(location.hash==="#check") return; /* 빌드 검사 상태는 저장하지 않는다(오타 RED 2026-09-21) */ try{ localStorage.setItem(KEY,JSON.stringify(ST)); const li=lastInfo(); if(li){ const j=JSON.stringify(li); localStorage.setItem(LAST_KEY,j); localStorage.setItem(LAST_KEY+"-"+DECK_ID,j); } }catch(e){} };
window.addEventListener("pagehide",()=>{ try{ save(); }catch(e){} });'''
    assert s.count(old) == 1, ("③ 앵커", p); s = s.replace(old, new)
    # ④ #resume
    old = '''  if(location.hash==="#check"){ runCheck(); return; }
  render();'''
    new = '''  if(location.hash==="#check"){ runCheck(); return; }
  if(location.hash==="#resume"){ render(); save(); return; }   /* V5A: 저장된 위치 그대로 */
  render();'''
    assert s.count(old) == 1, ("④ 앵커", p); s = s.replace(old, new)
    io.open(p, "w", encoding="utf-8", newline="\n").write(s)
    print("patched", p, n0, "->", len(s))

for f in FILES: patch(f)

# ⑤ #act 안의 안내 글씨 스타일 (별도 멱등)
for f in FILES:
    s = io.open(f, encoding="utf-8").read()
    if "#act .hint{" in s: continue
    old = "#act{display:flex;gap:8px;align-items:center;margin-left:auto}"
    assert s.count(old) == 1, ("⑤ 앵커", f)
    s = s.replace(old, old + "#act .hint{font-size:var(--fs-note);color:var(--muted)}")
    io.open(f, "w", encoding="utf-8", newline="\n").write(s); print("css", f)
