# -*- coding: utf-8 -*-
"""교실 템플릿 v4 스킨 교체(2026-09-28, 대표님 레퍼런스 「인강 전자칠판」): <style> 를 _v4_style.css 로, 방 마크업을 「칠판(판서 + 서 있는 스앵님 + 자막) · 아래 조작 줄」로,
글꼴 링크에 Gothic A1 500·600 추가, JS 는 필요한 네 곳만(포즈 선택 · 자막 얼굴 · 자막 자동 스크롤 · (식 n-k)/【그림 n-k】 번호). 멱등 — 여러 번 돌려도 같은 결과."""
import io, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, "classroom_tpl.html")
CSS = io.open(os.path.join(HERE, "_v4_style.css"), encoding="utf-8").read().rstrip("\n") + "\n"
# 늘 v3 원본(커밋 214c1d8 의 템플릿)에서 새로 만든다 — 이미 넣은 문구를 고쳐도 다시 돌릴 수 있게(2026-09-28 오타 디자인 2차 준비). 원본 = git, 없으면 V4_BASE 파일
import subprocess
try:
    s = subprocess.check_output(["git", "show", "214c1d8:docs/tools/classroom_tpl.html"], cwd=HERE).decode("utf-8")
except Exception:
    s = io.open(os.environ["V4_BASE"], encoding="utf-8").read()
s = s.replace("\r\n", "\n")
assert "교실 모드 템플릿 v3" in s or "교실 모드 템플릿 v4" not in s, "원본이 v3 가 아님"

def sub1(old, new, label):
    """old → new 한 번. 늘 v3 원본에서 새로 조립하므로 old 가 먼저다 — 「new in s 면 건너뜀」은 new 가 빈 글이거나 old 의 일부일 때
    바꾸지 않고 넘어가는 구멍이 있었다(2026-09-29 표정 글자·빈 글 치환이 조용히 빠짐). old 가 없고 new 가 있으면 이미 바뀐 것으로 본다."""
    global s
    n = s.count(old)
    if n == 1: s = s.replace(old, new, 1); return
    if n == 0 and new and new in s: return
    raise AssertionError(f"{label}: 바꿀 자리 개수 {n}")

# 1) 머리 주석
s = re.sub(r"<!-- 교실 모드 템플릿 v[34] .*?-->", "<!-- 교실 모드 템플릿 v4 (대표님 2026-09-28 레퍼런스 「인강 전자칠판」: 초록 칠판 + 흰 활자 판서(Gothic A1) + 민트 테두리 식 상자(식 챕터-번호) + 【그림 챕터-번호】 캡션, 칠판 오른쪽에 전신으로 서서 지시봉으로 판서를 가리키는 김주영 스앵님, 대사 = 아래 자막(Gowun Dodum, 표정 얼굴), 조작 = 칠판 아래 줄)\n     v2 회차(D.v===2)는 판서 파일(BOARD)로 만든 단계(판서 줄 누적 + 그림 단계 + 대사), v1 회차는 원문 문단 그대로(「구버전 판서」 표시).\n     저장: mc-tutor(전역 XP·연속일·하트·호감도 + 회차 위치 {mode,cid,sid,qi,ver}) + mc-lesson-<id>(챕터 읽음·문제, 수업 노트·앱 V52 와 공유). 오타 설계 회의 1·2차 + 구현 검수 1~6차 조건 반영. -->", s, count=1, flags=re.S)
# 2) 글꼴 링크(판서 본문 = Gothic A1 600, 식 상자 번호 700) · 중복 Pretendard 링크 하나로
PRE = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">\n'
while s.count(PRE) > 1: s = s.replace(PRE, "", 1)
s = s.replace("family=Gothic+A1:wght@700;800&", "family=Gothic+A1:wght@500;600;700;800&")
assert "family=Gothic+A1:wght@500;600;700;800&" in s, "글꼴 링크 교체 실패"
# 3) <style> 교체
i0 = s.find("<style>"); i1 = s.find("</style>", i0)
assert i0 > 0 and i1 > i0
s = s[:i0] + "<style>\n" + CSS + s[i1:]
# 4) 방 마크업
MARK = ('<main><div id="room">\n'
        '  <div id="board">\n'
        '    <div class="slide"><div class="chk" id="chk"></div><div id="bwrap"><div id="bc"></div></div><button id="upHint" type="button" hidden>↑ 위 판서</button>\n'
        '      <div id="tutorCard"><div class="nm"><b id="dName">김주영 스앵님</b></div><div id="tutor"><img id="tutorImg" alt="" decoding="async" draggable="false"><img id="tg1" class="gimg" alt="" decoding="async" draggable="false"><img id="tg2" class="gimg" alt="" decoding="async" draggable="false">__TUTOR__</div></div>\n'
        '      <div class="box" id="sub"><img id="faceImg" alt="" decoding="async" draggable="false" hidden><div class="sb"><div class="name" id="dNameTag">김주영 스앵님</div><button type="button" id="tMore" class="tmore" hidden aria-controls="dText" aria-expanded="false">전체 ▾</button><div class="text" id="dText"></div></div></div>\n'
        '    </div>\n'
        '    <div id="ctl"><div class="choices" id="dCh"></div><div class="tip" id="dTip"></div></div>\n'
        '    <div id="chpills"></div>\n'
        '  </div>\n'
        '  <aside id="side"><div id="prog"><div class="k">이 챕터</div><div class="v" id="pV"></div><div class="bar"><i id="pBar"></i></div></div></aside>\n'
        '</div></main>')
m = re.search(r'<main><div id="room">.*?</div></main>', s, flags=re.S)
assert m, "방 마크업(<main><div id=\"room\">…</div></main>)을 못 찾음"
s = s[:m.start()] + MARK + s[m.end():]
for k in ('id="bwrap"', 'id="tutorImg"', 'id="faceImg"', 'id="dText"', 'id="dCh"', 'id="chpills"', 'id="pV"', "__TUTOR__"):
    assert s.count(k) == 1, f"마크업 {k} 개수 {s.count(k)}"
# 5) JS — 포즈: 목차·단계 = 지시봉 · 문제 = 노트 · 결과 = 팔짱
sub1('/* 목차 = 지시봉 전신(pose-point) · 결과 = 팔짱 전신(pose-cross) · 그 밖(단계·문제) = 표정 흉상. 포즈 파일이 없으면 흉상으로 */\nconst POSE_OK={}; function poseFile(mode){ return mode==="intro"?"pose-point":mode==="result"?"pose-cross":null; }',
     '/* v4 전자칠판: 칠판 옆 전신 — 목차·단계 = 지시봉(pose-point, 좌우 반전해 판서를 가리킴) · 문제 = 노트(pose-book) · 결과 = 팔짱(pose-cross). 표정은 자막 옆 얼굴(#faceImg). 포즈 파일이 없으면 흉상으로 */\nconst POSE_OK={}; function poseFile(mode){ return mode==="result"?"pose-cross":(mode==="quiz"||mode==="nohearts")?"pose-book":"pose-point"; }', "포즈 선택")
# 6) JS — 표정은 자막 옆 얼굴로
sub1('function faceImg(face){ const im=$("#tutorImg"), box=$("#tutor"); if(!im||!RASTER) return; const p=poseFile(S.mode); const usePose=!!(p&&POSE_OK[p]!==false);\n  const src=TUTOR_IMG+(usePose?p:(FACES.indexOf(face)>=0?face:"neutral"))+".png"; box.classList.toggle("pose",usePose);',
     'function faceImg(face){ const im=$("#tutorImg"), box=$("#tutor"), av=$("#faceImg"); if(!im||!RASTER) return; const p=poseFile(S.mode); const usePose=!!(p&&POSE_OK[p]!==false);\n  const fsrc=TUTOR_IMG+(FACES.indexOf(face)>=0?face:"neutral")+".png";\n  if(av){ if(av.getAttribute("src")!==fsrc) av.setAttribute("src",fsrc); av.hidden=false; }   /* v4: 표정 = 자막 옆 얼굴 · 칠판 옆 = 전신 포즈 */\n  const src=usePose?TUTOR_IMG+p+".png":fsrc; box.classList.toggle("pose",usePose);', "자막 얼굴")
# 7) JS — 자막이 4줄을 넘으면 따라 내려간다
sub1('el.textContent=text.slice(0,i); if(i<text.length) el.appendChild(cur); else {',
     'el.textContent=text.slice(0,i); if(i<text.length){ el.appendChild(cur); el.scrollTop=el.scrollHeight; } else {', "자막 자동 스크롤")
# 8) JS — (식 챕터-번호) · 【그림 챕터-번호】 (CSS 카운터: #bc 에 chn, 그림에 fno)
sub1('const bc=$("#bc"); bc.classList.toggle("v1",!!v1); bc.innerHTML=html;',
     'const bc=$("#bc"); bc.classList.toggle("v1",!!v1); bc.style.counterReset=""; bc.innerHTML=html;', "번호 초기화")
sub1('let figCur={ci:-1,name:null};',
     'let figCur={ci:-1,name:null};\nconst figNo=(ch,name)=>Math.max(1,[...new Set(ch.steps.map(s=>s.fig).filter(Boolean))].indexOf(name)+1);   /* 【그림 챕터-번호】: 챕터 안에서 그림이 처음 나온 순서 */', "그림 번호 함수")
sub1("if(fig) h+='<div class=\"bd-fig\" data-fig=\"'+esc(st.fig)+'\"><div class=\"fh\">",
     "if(fig) h+='<div class=\"bd-fig\" data-fig=\"'+esc(st.fig)+'\" style=\"counter-reset:fno '+figNo(ch,st.fig)+'\"><div class=\"fh\">", "그림 번호")
sub1("board(h,'<span>CH '+(S.ci+1)+' · '+esc(ch.title)+'</span><small>'+(S.si+1)+' / '+ch.steps.length+'</small>',false);",
     "board(h,'<span>CH '+(S.ci+1)+' · '+esc(ch.title)+'</span><small>'+(S.si+1)+' / '+ch.steps.length+'</small>',false);\n  $(\"#bc\").style.counterReset=\"eq 0 chn \"+(S.ci+1);   /* (식 챕터-번호) · 【그림 챕터-번호】 */", "식 번호")
# 9) 오타 디자인 검수 1차(RED 8) 반영 — 스크롤은 이번 단계 기준(R4) · 위 판서 표시 · 폰 그림 크게 보기(R2) · 미채점 결과(R3) · 자막 펼치기(R6)
sub1('<button class="cbt g" id="ovReset" type="button">이 회차 기록 지우기</button></div></div></div>',
     '<button class="cbt g" id="ovReset" type="button">이 회차 기록 지우기</button></div></div></div>\n<div id="figov" hidden role="dialog" aria-modal="true" aria-label="그림 크게 보기"><div class="fzh"><span>그림 크게 보기</span><button type="button" id="figovX" aria-keyshortcuts="Escape">닫기</button></div><div class="fz"></div></div>', "그림 겹창")
sub1('const el=$("#dText"); if(typing){ clearInterval(typing); typing=null; }',
     'const el=$("#dText"); el.classList.remove("open"); { const b=$("#tMore"); if(b) b.hidden=true; } if(typing){ clearInterval(typing); typing=null; }', "자막 펼침 초기화")
sub1('$("#dText").onclick=()=>{ skipTyping(); };',
     '$("#dText").onclick=()=>{ if(!skipTyping()) toggleText(); };   /* 타자 중이면 건너뛰기, 아니면 긴 대사 펼치기(오타 디자인 1차 R6) */\n'
     '$("#tMore").onclick=e=>{ e.stopPropagation(); if(!skipTyping()) toggleText(); };\n'
     'function toggleText(){ const el=$("#dText"); const o=el.classList.toggle("open"); el.scrollTop=o?0:el.scrollHeight; moreChk(); }\n'
     '/* 자막이 네 줄을 넘으면 이름 줄 오른쪽에 「전체 ▾」(타자가 끝난 뒤에만) — 잘린 줄 표시가 없었다(오타 디자인 1차 R6 · 2차 캡처). 펼쳐도 44vh 까지라 조작 줄은 그대로 */\n'
     'function moreChk(){ const el=$("#dText"), b=$("#tMore"); if(!el||!b) return; const open=el.classList.contains("open"); b.hidden=!!typing||!(open||el.scrollHeight>el.clientHeight+3); b.textContent=open?"접기 ▴":"전체 ▾"; b.setAttribute("aria-expanded",open?"true":"false"); }\n'
     '/* 넘치는 식은 줄여서 한 줄에 — 식을 두 줄로 나누지 않는다(대표님 2026-09-29 「수식 한 줄로」). 식 글자 14px(오타 기준) 아래로는 안 줄이고, 그래도 넘치면 식 상자 안에서 밀어 본다 */\n'
     'function fitMath(root){ if(!root) return; $$(".katex-display",root).forEach(k=>{ k.style.fontSize=""; const cw=k.clientWidth, sw=k.scrollWidth; if(!(cw>0&&sw>cw+1)) return;\n'
     '  const kx=k.querySelector(".katex"), fz=parseFloat(getComputedStyle(kx||k).fontSize)||20, lo=Math.min(1,Math.max(.6,14/fz));\n'
     '  let r=Math.max(lo,Math.floor(cw/sw*100)/100); k.style.fontSize=r+"em"; for(let i=0;i<20&&r>lo&&k.scrollWidth>k.clientWidth+1;i++){ r=Math.max(lo,Math.round((r-.02)*100)/100); k.style.fontSize=r+"em"; } }); }   /* 한글 \\\\text 폭은 배율과 딱 비례하지 않아 모자라면 2% 씩 더 */\n'
     '/* 인라인 식은 줄에서 끊지 않는다(CSS #bc .katex nowrap) — 줄보다 길면 글자를 줄여 한 줄에(14px 까지) */\n'
     'function fitInline(root){ if(!root) return; $$(".katex",root).forEach(k=>{ if(k.closest(".katex-display")) return; k.style.fontSize=""; const box=k.parentElement&&k.parentElement.closest(".bt,.qb,.ans,.cb,.tk,.bx,.ex,li,p,div"); if(!box) return;\n'
     '  const cw=box.clientWidth, w=k.getBoundingClientRect().width; if(!(cw>0&&w>cw-2)) return; const fs=parseFloat(getComputedStyle(k).fontSize)||16; k.style.fontSize=Math.max(14,Math.floor(fs*(cw-6)/w))+"px"; }); }\n'
     'window.addEventListener("resize",()=>{ fitMath($("#bc")); fitInline($("#bc")); moreChk(); reCur(); },{passive:true});\n'
     'try{ document.fonts.ready.then(()=>{ fitMath($("#bc")); fitInline($("#bc")); moreChk(); reCur(); }); document.fonts.addEventListener("loadingdone",()=>{ fitMath($("#bc")); fitInline($("#bc")); moreChk(); reCur(); }); }catch(e){}   /* KaTeX 글꼴이 늦게 붙으면 폭·높이가 바뀐다 */\n'
     '$("#bwrap").addEventListener("scroll",()=>upHint(),{passive:true}); UPH.onclick=()=>{ const w=$("#bwrap"); userScr=true; if(w) w.scrollTo({top:0,behavior:REDUCE?"auto":"smooth"}); };\n'
     'let figRet=null;   /* 확대창을 연 버튼(닫으면 포커스를 돌려준다) */\n'
     'function closeFig(){ const ov=$("#figov"); if(!ov||ov.hidden) return; ov.hidden=true; const r=figRet; figRet=null; try{ if(r&&document.contains(r)) r.focus(); }catch(e){} }\n'
     '$("#figovX").onclick=()=>closeFig(); document.addEventListener("keyup",e=>{ if(!$("#figov").hidden&&(e.key==="Enter"||e.key===" ")) e.preventDefault(); },true);', "자막 펼치기·위 판서·겹창")
sub1("typeset(bc); $(\"#bwrap\").scrollTop=0; }",
     "typeset(bc); fitMath(bc); fitInline(bc); $(\"#bwrap\").scrollTop=0; upHint(); }", "위 판서 표시 초기화")
sub1('const figNo=(ch,name)=>Math.max(1,[...new Set(ch.steps.map(s=>s.fig).filter(Boolean))].indexOf(name)+1);   /* 【그림 챕터-번호】: 챕터 안에서 그림이 처음 나온 순서 */',
     'const figNo=(ch,name)=>Math.max(1,[...new Set(ch.steps.map(s=>s.fig).filter(Boolean))].indexOf(name)+1);   /* 【그림 챕터-번호】: 챕터 안에서 그림이 처음 나온 순서 */\n'
     '/* 이번 단계가 보이게: 이 단계 첫 줄이 위로 밀려나지 않는 한에서 이 단계 끝(그림 포함)까지 보이게 스크롤 — 무조건 맨 아래로 내리면 앞 식이 머리글 밑에 반만 남았다(오타 디자인 1차 R4) */\n'
     'let userScr=false;   /* 사용자가 판서 창을 직접 밀었는가(휠·터치·포인터·위 판서 버튼) — 그러면 글꼴·크기 변화 때 다시 맞추지 않는다. scrollCur 가 새로 맞추면 풀린다 */\n'
     'function scrollCur(){ const w=$("#bwrap"); if(!w) return; userScr=false; const first=$("#bc .bl.cur"); if(!first){ w.scrollTop=w.scrollHeight; upHint(); return; }\n'
     '  const endEl=$("#bc .bd-fig")||$$("#bc .bl.cur").pop(), wr=w.getBoundingClientRect(), st0=w.scrollTop, ch=w.clientHeight;\n'
     '  const a=first.getBoundingClientRect().top-wr.top+st0, b=endEl.getBoundingClientRect().bottom-wr.top+st0;\n'
     '  /* 여유(위 10·아래 14)까지 들어가면 끝에 맞추고, 여유 없이만 들어가면 가운데, 안 들어가면 첫 줄을 위에(2차 실측: 창을 거의 채우는 단계에서 끝이 몇 px 잘렸다) */\n'
     '  w.scrollTop=Math.max(0,(b-a)+24<=ch?b+14-ch:(b-a)<=ch?a-(ch-(b-a))/2:a-10); upHint(); }\n'
     '/* 글꼴(KaTeX·한글 조각 글꼴)이 늦게 붙어 판서·자막 높이가 바뀌면 이번 단계 위치를 다시 맞춘다 — 360px 캡처에서 이번 단계 끝줄이 창 아래로 밀렸다(2차).\n'
     '   판서 창·판서 크기 변화(ResizeObserver)와 글꼴 로드 끝에서 부른다. 사용자가 직접 밀었으면 그대로 둔다 */\n'
     'function reCur(){ const w=$("#bwrap"); if(S.mode!=="step"||!V2||!w||userScr) return; scrollCur(); }\n'
     '["wheel","touchstart","pointerdown"].forEach(ev=>$("#bwrap").addEventListener(ev,()=>{ userScr=true; },{passive:true}));\n'
     'try{ let q=0; const ro=new ResizeObserver(()=>{ if(q) return; q=requestAnimationFrame(()=>{ q=0; reCur(); }); }); ro.observe($("#bwrap")); ro.observe($("#bc")); }catch(e){}\n'
     'function upHint(){ const w=$("#bwrap"); if(w&&UPH) UPH.hidden=!(w.scrollTop>12); }\n'
     '/* 폰에서 그림을 크게: 지금 보이는 그림 단계 그대로 복제해 겹창에(두 손가락 확대·옆으로 밀기) — 오타 디자인 1차 R2 */\n'
     'function zoomFig(){ const f=$("#bc .bd-fig figure"), ov=$("#figov"), box=$("#figov .fz"); if(!f||!ov||!box) return; box.innerHTML=""; const c=f.cloneNode(true); const sv=c.querySelector("svg"); if(sv) sv.removeAttribute("id");\n'
     '  $$(".pre,.draw,.fade",c).forEach(e=>{ e.classList.remove("pre","draw","fade"); e.style.strokeDasharray=""; e.style.strokeDashoffset=""; e.style.opacity=""; }); $$(".pulse",c).forEach(e=>e.classList.remove("pulse")); box.appendChild(c); figRet=document.activeElement; ov.hidden=false; try{ $("#figovX").focus(); }catch(e){}\n'
     '  /* 겹창에서는 가장 작은 글자(첨자 제외 font-size)가 14px 이 되게 키운다(오타 디자인 1차 R2 「설명 14px 이상」) — 넘치는 쪽은 겹창 안에서 밀어 본다 */\n'
     '  $$(":scope>svg",c).forEach(v=>{ const vb=v.viewBox&&v.viewBox.baseVal; if(!vb||!vb.width) return; let mu=99; v.querySelectorAll("text").forEach(t=>{ const z=parseFloat(getComputedStyle(t).fontSize); if(z>=6) mu=Math.min(mu,z); });   /* 6 미만은 자리 채움(점 등) */ if(mu>=99) mu=14; v.style.width=Math.round(vb.width*Math.max(1,14/mu))+"px"; v.style.maxWidth="none"; }); }\n'
     '/* 폰(≤760px): 가로로 늘어선 그림 칸(면·원통·구 비교처럼)을 세로로 쌓는다 — 통으로 줄이면 글자가 6px 까지 작아졌다(오타 디자인 1차 R2 「단순 축소 말고 세로 재배치」).\n'
     '   칸 = 가로 빈틈(24 또는 폭 3% 이상)으로 갈리는 요소 무리, 폭 12% 미만 무리는 가까운 이웃에 붙인다. 원본 요소를 칸별 svg 로 「옮기므로」(복제 아님) 그림 단계 숨김·그리기 애니메이션이 그대로 돈다.\n'
     '   칸이 하나면 그대로 두고 「크게 보기」. 칸 글자가 전부 14px 이상이면 .big → 「크게 보기」 숨김(오타 기준 14px). 모르는 요소가 있으면 손대지 않는다 */\n'
     'function stackFig(){\n'
     '  const fg=$("#bc .bd-fig figure"), sv=fg&&fg.querySelector(":scope>svg"); if(!sv) return;\n'
     '  let phone=false; try{ phone=window.matchMedia("(max-width:760px)").matches; }catch(e){} if(!phone) return;\n'
     '  const vb=sv.viewBox&&sv.viewBox.baseVal, sc=sv.getScreenCTM&&sv.getScreenCTM(); if(!vb||!vb.width||!vb.height||!sc) return;\n'
     '  const OKT=/^(g|a|line|path|circle|ellipse|polyline|polygon|rect|text|tspan|textPath|image|use|defs|style|title|desc|marker|clipPath|mask|pattern|symbol|linearGradient|radialGradient|stop|filter|fe[A-Za-z]+)$/;\n'
     '  if([...sv.querySelectorAll("*")].some(n=>!OKT.test(n.tagName))) return;\n'
     '  const W=vb.width, iv=sc.inverse(), NS="http://www.w3.org/2000/svg", items=[];\n'
     '  for(const e of $$("line,path,circle,ellipse,polyline,polygon,rect,text,image,use",sv)){\n'
     '    if(e.closest("defs,marker,clipPath,mask,pattern,symbol")||(e.parentNode&&e.parentNode.closest&&e.parentNode.closest("text"))) continue;\n'
     '    let b, m; try{ b=e.getBBox(); m=iv.multiply(e.getScreenCTM()); }catch(x){ return; }\n'
     '    const sw=(parseFloat(getComputedStyle(e).strokeWidth)||0)/2, xs=[], ys=[];\n'
     '    [[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].forEach(([x,y])=>{ xs.push(m.a*x+m.c*y+m.e); ys.push(m.b*x+m.d*y+m.f); });\n'
     '    items.push({e:e,x0:Math.min(...xs)-sw,x1:Math.max(...xs)+sw,y0:Math.min(...ys)-sw,y1:Math.max(...ys)+sw,bg:e.tagName==="rect"&&b.width>=W*.9}); }\n'
     '  const fgi=items.filter(t=>!t.bg); if(fgi.length<2) return;\n'
     '  const GAP=Math.max(24,W*.03), cl=[];\n'
     '  fgi.map(t=>[t.x0,t.x1]).sort((a,b)=>a[0]-b[0]).forEach(([a,b])=>{ const L=cl[cl.length-1]; if(L&&a<=L[1]+GAP) L[1]=Math.max(L[1],b); else cl.push([a,b]); });\n'
     '  for(let i=0;i<cl.length&&cl.length>1;){ if(cl[i][1]-cl[i][0]>=W*.12){ i++; continue; }\n'
     '    const gl=i>0?cl[i][0]-cl[i-1][1]:Infinity, gr=i<cl.length-1?cl[i+1][0]-cl[i][1]:Infinity, j=gl<=gr?i-1:i+1;\n'
     '    cl[j]=[Math.min(cl[j][0],cl[i][0]),Math.max(cl[j][1],cl[i][1])]; cl.splice(i,1); i=0; }\n'
     '  if(cl.length<2) return;\n'
     '  const which=t=>{ const cx=(t.x0+t.x1)/2; let k=0; cl.forEach((c,i)=>{ if(cx>=c[0]-.5) k=i; }); return k; };\n'
     '  const P=cl.map((c,i)=>{ const own=fgi.filter(t=>which(t)===i), pl=Math.min(10,i?(c[0]-cl[i-1][1])/2:c[0]-vb.x), pr=Math.min(10,i<cl.length-1?(cl[i+1][0]-c[1])/2:vb.x+W-c[1]);\n'
     '    const x0=c[0]-Math.max(0,pl), x1=c[1]+Math.max(0,pr), y0=Math.max(vb.y,Math.min(...own.map(t=>t.y0))-8), y1=Math.min(vb.y+vb.height,Math.max(...own.map(t=>t.y1))+8);\n'
     '    const p=document.createElementNS(NS,"svg"); [...sv.attributes].forEach(a=>{ if(!/^(id|viewBox|width|height|style)$/.test(a.name)) p.setAttribute(a.name,a.value); });\n'
     '    p.setAttribute("viewBox",x0.toFixed(1)+" "+y0.toFixed(1)+" "+(x1-x0).toFixed(1)+" "+(y1-y0).toFixed(1)); p.setAttribute("width",(x1-x0).toFixed(1)); p.setAttribute("height",(y1-y0).toFixed(1));\n'
     '    p.classList.add("fpan"); p.style.maxWidth=Math.round((x1-x0)*1.8)+"px"; return {p:p,map:new Map()}; });\n'
     '  const holder=(k,node)=>{ if(node===sv) return P[k].p; let c=P[k].map.get(node); if(c) return c;   /* 원본 묶음(g)의 칸 k 사본 — 속성(data-step·transform·글꼴·색) 그대로, id 는 처음 만든 칸에만 */\n'
     '    c=node.cloneNode(false); if(P.some((q,j)=>j!==k&&q.map.has(node))) c.removeAttribute("id"); holder(k,node.parentNode).appendChild(c); P[k].map.set(node,c); return c; };\n'
     '  [...sv.children].filter(n=>/^(defs|style|title|desc|marker|clipPath|mask|pattern|symbol|linearGradient|radialGradient|filter)$/.test(n.tagName)).forEach(n=>P[0].p.appendChild(n));\n'
     '  items.forEach(t=>{ if(t.bg) P.forEach((q,k)=>holder(k,t.e.parentNode).appendChild(k?t.e.cloneNode(true):t.e)); else holder(which(t),t.e.parentNode).appendChild(t.e); });   /* 문서 순서대로 = 칸마다 겹침 순서 유지 */\n'
     '  sv.replaceWith(...P.map(q=>q.p));\n'
     '  const box=fg.closest(".bd-fig"); box.classList.add("split"); box.dataset.pn=P.length;\n'
     '}\n'
     '/* 모든 폭: 그림에서 가장 작은 글자가 14px 미만이면 「크게 보기」·그림 누르기 확대(아이패드 1040 에서도 그림 글자 8.6~11px 가 있었다 — 2차 실측). 14px 이상이면 .big → 숨김 */\n'
     'function figZoomFlag(){ const bx=$("#bc .bd-fig"); if(!bx) return; let mn=99; $$("figure>svg text",bx).forEach(t=>{ const m=t.getScreenCTM&&t.getScreenCTM(), z=parseFloat(getComputedStyle(t).fontSize)||14; if(m&&z>=6) mn=Math.min(mn,z*Math.hypot(m.a,m.b)); }); bx.dataset.minfp=mn.toFixed(1); bx.classList.toggle("big",mn>=14); }', "스크롤·겹창 함수")
sub1('<button type="button" class="a" data-replay="1">▶ 다시 보기</button>',
     '<button type="button" class="zoom" data-zoom="1">크게 보기</button><button type="button" class="a" data-replay="1">▶ 다시 보기</button>', "크게 보기 버튼")
sub1('{ const rb=$("#bc [data-replay]"); if(rb) rb.onclick=function(){ replayFig(); }; }',
     '{ const rb=$("#bc [data-replay]"); if(rb) rb.onclick=function(){ replayFig(); }; } { const zb=$("#bc [data-zoom]"); if(zb) zb.onclick=function(){ zoomFig(); }; }\n'
     '  { const fe=$("#bc .bd-fig figure"), bx=$("#bc .bd-fig"); if(fe&&bx&&!bx.classList.contains("big")) fe.addEventListener("click",()=>zoomFig()); }   /* 글자가 작은 그림은 그림을 눌러도 크게 */', "크게 보기 연결")
sub1('const wrap=$("#bwrap"); if(instant&&wrap) wrap.scrollTop=wrap.scrollHeight;',
     'const wrap=$("#bwrap"); if(instant&&wrap) scrollCur();', "스크롤 1")
sub1('later(()=>{ l.classList.add("on"); if(wrap) wrap.scrollTop=wrap.scrollHeight; },i*220);',
     'later(()=>{ l.classList.add("on"); if(wrap) scrollCur(); },i*220);', "스크롤 2")
sub1('      if(wrap) wrap.scrollTop=wrap.scrollHeight;\n      const settleFig',
     '      if(wrap) scrollCur();\n      const settleFig', "스크롤 3")
sub1("'</div><div class=\"stats\"><div><b>'+ok+'/'+n+'</b><span>정답</span></div>",
     "'</div><div class=\"stats\">'+(ung.length?'<div><b>'+graded+'/'+n+'</b><span>채점 완료</span></div><div><b>'+(graded?ok+'/'+graded:'—')+'</b><span>정답</span></div>':'<div><b>'+ok+'/'+n+'</b><span>정답</span></div>')+'", "미채점 결과 수치")
sub1("+'</span></div></div>'+badge+(ung.length?'<div class=\"wrong\">채점 전 '",
     "+'</span></div></div>'+(ung.length?'':badge)+(ung.length?'<div class=\"wrong\">채점 전 '", "미채점이면 배지 없음")
# 10) 오타 디자인 검수 2차 준비(2026-09-28 캡처) — 위 판서 버튼은 머리글 안(판서 위에 떠서 식 번호를 가렸다) · 자막 「전체 ▾」 표시 시점 · 폰 그림 칸 쌓기 호출
sub1('const $=s=>document.querySelector(s), $$=(s,el)=>Array.from((el||document).querySelectorAll(s));',
     'const $=s=>document.querySelector(s), $$=(s,el)=>Array.from((el||document).querySelectorAll(s));\n'
     'const UPH=document.getElementById("upHint");   /* 위 판서 버튼 — 그리는 곳은 머리글(#chk) 안 쪽수 앞. board() 가 머리글을 새로 쓸 때마다 다시 끼운다 */', "UPH")
sub1('function board(html,tag,v1){ $("#chk").innerHTML=tag||"";',
     'function board(html,tag,v1){ const ck=$("#chk"); ck.innerHTML=tag||""; if(UPH) ck.insertBefore(UPH,ck.querySelector("small"));', "머리글에 위 판서")
sub1('if(REDUCE||S.resume||SAY_INSTANT){ el.textContent=text; const f=typeDone;',
     'if(REDUCE||S.resume||SAY_INSTANT){ el.textContent=text; moreChk(); const f=typeDone;', "즉시 대사 전체 보기")
sub1('} else { clearInterval(typing); typing=null; const f=typeDone; typeDone=null; if(f) f(); } },TYPE_MS);',
     '} else { clearInterval(typing); typing=null; moreChk(); const f=typeDone; typeDone=null; if(f) f(); } },TYPE_MS);', "타자 끝 전체 보기")
sub1('function skipTyping(){ if(!typing) return false; clearInterval(typing); typing=null; $("#dText").textContent=fullText;',
     'function skipTyping(){ if(!typing) return false; clearInterval(typing); typing=null; $("#dText").textContent=fullText; moreChk();', "건너뛰기 전체 보기")
sub1('$("#dText").textContent=fullText; typeDone=null; }',
     '$("#dText").textContent=fullText; typeDone=null; moreChk(); }', "즉시 완료 전체 보기")
sub1('c.classList.add("pulse"); });',
     'c.classList.add("pulse"); });\n  stackFig(); figZoomFlag();   /* 폰: 가로 칸 그림을 세로로(오타 디자인 1차 R2) · 모든 폭: 작은 글자 그림은 크게 보기 — 그림 단계 숨김보다 먼저(숨긴 요소는 크기를 못 잰다) */', "그림 칸 쌓기 호출")
# 11) 오타 디자인 검수 2차 RED — 그림 확대창에서 Enter 가 뒤 교실을 진행시켰다
sub1('if($("#ov").classList.contains("on")){ if(e.key==="Escape") $("#ov").classList.remove("on"); return; }',
     'if($("#ov").classList.contains("on")){ if(e.key==="Escape") $("#ov").classList.remove("on"); return; }\n  if(!$("#figov").hidden){ if(e.key==="Escape"){ e.preventDefault(); closeFig(); } else if(e.key==="Tab"){ e.preventDefault(); $("#figovX").focus(); } else if(e.key==="Enter"||e.key===" "){ e.preventDefault(); } return; }   /* 그림 확대창이 열려 있으면 뒤 교실 단축키(Enter·Space·숫자) 차단, 닫기는 Esc·닫기 버튼 — 오타 디자인 2차 */', "확대창 단축키 차단")
# 12) 대표님 2026-09-29 — 표정 글자 없앰 · 객관식 보기 섞기(k) · 스앵님 판정 기록 · 암기/이해 알약 · 화면 부가 설명 제거 · 암기노트
sub1('<script>\nconst D=__DATA__;', '<script>__JUDGE__</script>\n<script>\nconst D=__DATA__;', "판정 스크립트")
sub1('curFace=face||"neutral"; faceImg(curFace); $("#dFace").textContent=FACEN[face||"neutral"]||"";', 'curFace=face||"neutral"; faceImg(curFace);', "표정 글자")
sub1('const FACEN={neutral:"무표정",sharp:"날카로움",smile:"미소",angry:"화남",wide:"놀람",proud:"흡족"};\n', '', "표정 이름표")
sub1('const CH=D.chapters, QZ=D.quiz||[], NCH=CH.length+(QZ.length?1:0);',
     'const CH=D.chapters, QZ=D.quiz||[], NCH=CH.length+(QZ.length?1:0);\n'
     '/* 스앵님 판정 기록 — 무엇을 알고 모르는지는 스앵님이 학습 기록으로 판단한다(대표님 2026-09-29). 노드 연결 = D.nodes(knowledge/lesson_nodes.json), 판정 = tutor_judge.js(TJ) */\n'
     'const NDS=D.nodes||{sec:{},q:{}}, CONF={}, secN=id=>(NDS.sec||{})[id]||[], qN=id=>(NDS.q||{})[id]||[];\n'
     'function ev(k,x){ try{ if(!window.TJ) return; const o=Object.assign({k:k,lid:D.id},x||{}); if(o.n&&o.n.length) TJ.rec(o); }catch(e){} }\n'
     '/* 객관식 보기는 빌드 때 섞인다(quizmix). 보기 k = 원문 순서 → 고른 보기를 k 로 저장(섞기 전 저장값 = 원문 순서라 그대로 맞는다) */\n'
     'const ck=(c,i)=>String(c&&c.k!=null?c.k:i);', "판정·보기 도우미")
sub1("'<li><button type=\"button\" class=\"cb'+(rev?(x.ok?\" ok\":(String(my)===String(i)?\" bad\":\"\")):\"\")",
     "'<li><button type=\"button\" class=\"cb'+(rev?(x.ok?\" ok\":(my!=null&&String(my)===ck(x,i)?\" bad\":\"\")):\"\")", "고른 보기 표시")
sub1('ST.answer[q.id]=i; ST.done[q.id]=true; settle(q,!!(q.choices[i]&&q.choices[i].ok)); }',
     'const c=q.choices[i]; ST.answer[q.id]=(c&&c.k!=null)?c.k:i; ST.done[q.id]=true; settle(q,!!(c&&c.ok)); }', "고른 보기 저장")
sub1('my:(ST.answer[qq.id]==null?null:String(ST.answer[qq.id])),',
     'my:(ST.answer[qq.id]==null?null:(Array.isArray(qq.choices)&&qq.choices.length?(()=>{ const j=qq.choices.findIndex((c,i)=>ck(c,i)===String(ST.answer[qq.id])); return j>=0?(j+1)+"번 "+tc(qq.choices[j].html):null; })():String(ST.answer[qq.id]))),', "질문 문맥 내 답")
sub1('function settle(q,ok){\n  ST.correct[q.id]=ok; touchStreak();',
     'function settle(q,ok){\n  ST.correct[q.id]=ok; touchStreak(); ev("quiz",{qid:q.id,ok:!!ok,n:qN(q.id)});', "문제 기록")
sub1('L.ch[ch.id]=true; ST.read[ch.id]=true; touchStreak();',
     'L.ch[ch.id]=true; ST.read[ch.id]=true; touchStreak(); ev("read",{sid:ch.id,n:secN(ch.id),clean:!CONF[ch.id]}); delete CONF[ch.id];', "챕터 기록")
sub1('choices([{t:"이해했어요",cls:"p",primary:1,key:"Enter",f:()=>next()},{t:"다시 설명",cls:"g",f:()=>{ S.again=1; render(); }},{t:"질문할게요",cls:"t",f:ask}]);',
     'choices([{t:"이해했어요",cls:"p",primary:1,key:"Enter",f:()=>next()},{t:"다시 설명",cls:"g",f:()=>{ again(); S.again=1; render(); }},{t:"질문할게요",cls:"t",f:ask}]);', "다시 설명 기록 v2")
sub1('cs.push({t:"다시 설명",cls:"g",f:()=>{ S.again++; render(); }});',
     'cs.push({t:"다시 설명",cls:"g",f:()=>{ again(); S.again++; render(); }});', "다시 설명 기록 v1")
sub1('function ask(){ if(anim||typing) finishNow();',
     'function again(){ const c=CH[S.ci]; if(c){ CONF[c.id]=true; ev("again",{sid:c.id,n:secN(c.id)}); } }\n'
     'function ask(){ if(anim||typing) finishNow(); if(S.mode==="step"){ const c=CH[S.ci]; if(c){ CONF[c.id]=true; ev("ask",{sid:c.id,n:secN(c.id)}); } } else if(S.mode==="quiz"){ const q=QZ[S.qi]; if(q) ev("ask",{qid:q.id,n:qN(q.id)}); }', "질문 기록")
# 암기·이해 알약(빌더 board_line 의 tg)
sub1('const BOX={why:"왜 그런가",analogy:"비유",formula:"외울 것",pitfall:"함정",memo:"정리",say:"교수님 말"};',
     'const BOX={why:"왜 그런가",analogy:"비유",formula:"외울 것",pitfall:"함정",memo:"정리",say:"교수님 말"};\nconst TGN={am:"암기",ih:"이해",ex:"시험",pr:"연습"};   /* 판서 줄 알약 — 암기·이해 구분(대표님 2026-09-29) */', "알약 이름")
sub1("'\"'+(ln.k===\"li\"?' data-n=\"'+nLi+'\"':'')+'><div class=\"bt\">'+ln.h+'</div></div>';",
     "'\"'+(ln.k===\"li\"?' data-n=\"'+nLi+'\"':'')+'><div class=\"bt\">'+(ln.tg&&TGN[ln.tg]?'<span class=\"tg tg-'+esc(ln.tg)+'\">'+TGN[ln.tg]+'</span>':'')+ln.h+'</div></div>';", "알약 그리기")
# 화면 부가 설명 제거(대표님 2026-09-29 「부가적인 설명 텍스트는 화면에 안 보이게」 · 지침 §24)
sub1('choices([{t:"질문할게요",cls:"t",f:ask},{tip:mc?"숫자 키 1~"+q.choices.length+" 로 고를 수 있습니다":""}]);', 'choices([{t:"질문할게요",cls:"t",f:ask}]);', "숫자 키 안내")
sub1("'<div class=\"wrong\">채점 전 '+ung.length+'개 — 답 보기 뒤 「맞았어요/틀렸어요」까지 눌러야 완료입니다.</div>'", "'<div class=\"wrong\">채점 전 '+ung.length+'개</div>'", "채점 전 안내")
sub1("'<div class=\"wrong\">틀린 문제 '+wrong.length+'개 — 해설을 읽고 다시 푸세요.</div>'", "'<div class=\"wrong\">틀린 문제 '+wrong.length+'개</div>'", "틀린 문제 안내")
sub1('<div class="ttl">하트 0</div><div class="lead">챕터 하나를 다시 읽고 끝까지 가면 하트 하나가 돌아옵니다. 하트는 매일 3개로 채워집니다.</div><div class="sub">목차</div>', '<div class="ttl">하트 0</div><div class="sub">목차</div>', "하트 0 안내")
sub1("'<div class=\"exhide\">풀이는 생각한 뒤에 엽니다.</div>'", "''", "풀이 안내")
sub1('$("#ovMeta").textContent=D.course+" · "+D.sess+" · XP "+(L.xp||0)+(V2?" · 판서 v2":" · 구버전 판서");', '$("#ovMeta").textContent=D.course+" · "+D.sess;', "목차 머리 안내")
# 암기노트(과목별 notes/memo/<약칭>.html — build_memo.py)
sub1('<button class="cbt g" id="ovBook" type="button">교재 보기</button>', '<button class="cbt g" id="ovMemo" type="button">암기노트</button><button class="cbt g" id="ovBook" type="button">교재 보기</button>', "목차 암기노트 버튼")
sub1('cs.push({t:"교재 보기",cls:"g",f:()=>openBook((CH[0]||{}).id)});\n  choices(cs);',
     'cs.push({t:"교재 보기",cls:"g",f:()=>openBook((CH[0]||{}).id)}); cs.push({t:"암기노트",cls:"g",f:openMemo});\n  choices(cs);', "첫 화면 암기노트")
sub1('function openBook(sid){',
     'function openMemo(){ const h="#d"+D.date; if(EMB) post({type:"mc-open",v:1,file:"notes/memo/"+D.slug+".html"+h,title:D.course+" 암기노트"}); else location.href="../../memo/"+D.slug+".html"+h; }\n'
     '$("#ovMemo").onclick=()=>{ $("#ov").classList.remove("on"); openMemo(); };\nfunction openBook(sid){', "암기노트 열기")
# 13) 대표님 2026-09-29 「팔은 안 움직이고 멀뚱히 서 있다 → 움직임·표정」: 말하는 동안 대사 표정에 맞는 전신 동작 그림을 교차 페이드로 바꾸고, 말이 끝나면 쉬는 자세로
sub1('function say(text,face,name,onDone){',
     '/* 스앵님 동작·표정 엔진 — 동작 그림 pose-<이름>.png: talk 설명 · stress 강조 · up 지시봉 위 · think 생각 · praise 엄지 · strict 허리에 손 (+ 쉬는 자세 point · book · cross).\n'
     '   말하는 동안 1.9초마다 두 겹(#tg1·#tg2)을 번갈아 교차 페이드, 타자가 끝나면 0.9초 뒤 쉬는 자세(#tutorImg). 없는 그림은 건너뛰고, 동작 줄이기·즉시 대사면 쉬는 자세 그대로 */\n'
     'const GEST={neutral:["talk","point","up"],sharp:["stress","point","talk"],smile:["talk","praise"],angry:["strict","stress"],proud:["praise","talk"],wide:["think","talk"]};\n'
     '/* 동작 세트 = notes/classroom/assets/tutor/g/<이름>.png (640×1000, 같은 키·발 줄·몸 중심 — docs/tools/tutor_gesture_cut.py). 쉬는 자세(point·book·cross)도 이 세트로 바꿔야 겹칠 때 안 튄다 */\n'
     'const TUTOR_G=TUTOR_IMG+"g/";\n'
     'const GE={has:{point:null,book:null,cross:null,talk:null,stress:null,up:null,think:null,praise:null,strict:null},t:null,h:null,cur:null,flip:0};\n'
     'function gePreload(){ let left=Object.keys(GE.has).length; const done=()=>{ if(--left===0) faceImg(curFace); };   /* 다 받으면 쉬는 자세도 세트로 */\n'
     '  Object.keys(GE.has).forEach(n=>{ const im=new Image(); im.onload=()=>{ GE.has[n]=true; done(); }; im.onerror=()=>{ GE.has[n]=false; done(); }; im.src=TUTOR_G+n+".png"; }); }\n'
     'function geShow(n){ const box=$("#tutor"), a=$("#tg1"), b=$("#tg2"); if(!box||!a||!b||!box.classList.contains("gset")) return;\n'
     '  const nx=GE.flip?a:b, pv=GE.flip?b:a, src=TUTOR_G+n+".png"; GE.cur=n;\n'
     '  const go=()=>{ nx.classList.add("on"); pv.classList.remove("on"); box.classList.add("gon"); GE.flip^=1; };\n'
     '  if(nx.getAttribute("src")===src&&nx.complete) go(); else { nx.onload=()=>{ nx.onload=null; if(GE.cur===n) go(); }; nx.setAttribute("src",src); } }\n'
     'function geRest(){ clearInterval(GE.t); GE.t=null; clearTimeout(GE.h); GE.h=null; GE.cur=null; const box=$("#tutor"); if(box) box.classList.remove("gon"); $$("#tutor .gimg").forEach(g=>g.classList.remove("on")); }\n'
     'function geStart(face){ geRest(); if(REDUCE||!RASTER) return;\n'
     '  const set=(S.mode==="quiz"||S.mode==="nohearts"?(face==="angry"?["strict","think"]:(face==="smile"||face==="proud")?["praise","book"]:["think","book"]):S.mode==="result"?(face==="angry"?["strict","cross"]:face==="proud"?["praise","cross"]:["talk","cross"]):(GEST[face]||GEST.neutral)).filter(n=>GE.has[n]===true);\n'
     '  if(!set.length) return; let i=hash(String(fullText))%set.length; geShow(set[i]); if(set.length>1) GE.t=setInterval(()=>{ i=(i+1)%set.length; geShow(set[i]); },1900); }\n'
     'function geEnd(){ clearInterval(GE.t); GE.t=null; clearTimeout(GE.h); GE.h=setTimeout(geRest,S.mode==="result"?4000:900); }\n'
     'function say(text,face,name,onDone){', "동작 엔진")
sub1('if(REDUCE||S.resume||SAY_INSTANT){ el.textContent=text; moreChk(); const f=typeDone;',
     'if(REDUCE||S.resume||SAY_INSTANT){ geRest(); el.textContent=text; moreChk(); const f=typeDone;', "즉시 대사 = 쉬는 자세")
sub1('  let i=0; const cur=document.createElement("i"); cur.className="cur";\n',
     '  let i=0; const cur=document.createElement("i"); cur.className="cur"; geStart(curFace);\n', "말할 때 동작")
sub1('} else { clearInterval(typing); typing=null; moreChk(); const f=typeDone; typeDone=null; if(f) f(); } },TYPE_MS);',
     '} else { clearInterval(typing); typing=null; moreChk(); geEnd(); const f=typeDone; typeDone=null; if(f) f(); } },TYPE_MS);', "말 끝 = 쉬는 자세")
sub1('function skipTyping(){ if(!typing) return false; clearInterval(typing); typing=null; $("#dText").textContent=fullText; moreChk();',
     'function skipTyping(){ if(!typing) return false; clearInterval(typing); typing=null; $("#dText").textContent=fullText; moreChk(); geEnd();', "건너뛰기 = 쉬는 자세")
sub1('probe.onload=function(){ RASTER=true; $("#tutor").classList.add("raster"); faceImg(curFace); };',
     'probe.onload=function(){ RASTER=true; $("#tutor").classList.add("raster"); faceImg(curFace); gePreload(); };', "동작 그림 미리 받기")
sub1('const src=usePose?TUTOR_IMG+p+".png":fsrc; box.classList.toggle("pose",usePose);',
     'const gn=p?p.replace("pose-",""):"", useG=!!(usePose&&GE.has[gn]===true);   /* 동작 세트가 있으면 쉬는 자세도 세트 그림(같은 캔버스) */\n'
     '  const src=usePose?(useG?TUTOR_G+gn+".png":TUTOR_IMG+p+".png"):fsrc; box.classList.toggle("pose",usePose); box.classList.toggle("gset",useG);', "쉬는 자세 = 동작 세트")
assert "wrap.scrollTop=wrap.scrollHeight" not in s.split("function renderStepV2")[1].split("function replayFig")[0], "renderStepV2 에 맨 아래 스크롤이 남음"
assert s.index("stackFig();") < s.index('$$("[data-step]",root)'), "칸 쌓기가 단계 숨김보다 뒤"
io.open(TPL, "w", encoding="utf-8", newline="\n").write(s)
print("v4 splice ok · size", len(s))
