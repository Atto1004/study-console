/* 여러 식을 이은 식 줄 나누기(대표님 2026-09-29 「수식 한 줄로, 배치구조 신경」) — 원본은 이 파일 하나(수업 노트·암기노트 템플릿에 빌더가 넣는다, __SPLITTEX__).
   \[ A,\qquad B \] 처럼 서로 다른 식을 \qquad 또는 「,\quad」로 이어 붙인 줄은 식마다 한 줄(\[A\]\[B\])로 — 한 식 안은 가르지 않는다.
   괄호 { } 와 \begin…\end 안의 구분자는 건드리지 않고, 연결 기호만 남은 조각(\Rightarrow·\to·\Leftrightarrow·\therefore)은 다음 식 앞에 붙인다. */
function splitTex(t){
  const parts=[]; let d=0, env=0, cur="", i=0;
  while(i<t.length){
    if(t.startsWith("\\begin{",i)) env++;
    else if(t.startsWith("\\end{",i)) env=Math.max(0,env-1);
    const c=t[i];
    if(c==="\\"&&(t[i+1]==="{"||t[i+1]==="}")){ cur+=t.slice(i,i+2); i+=2; continue; }
    if(c==="{") d++; else if(c==="}") d=Math.max(0,d-1);
    if(!d&&!env){
      let m=0;
      if(t.startsWith("\\qquad",i)&&!/[a-zA-Z]/.test(t[i+6]||"")) m=6;
      else if(t.startsWith(",\\quad",i)&&!/[a-zA-Z]/.test(t[i+6]||"")) m=6;
      if(m){ parts.push(cur); cur=""; i+=m; continue; }
    }
    cur+=c; i++;
  }
  parts.push(cur);
  const out=[]; let carry="";
  parts.map(p=>p.trim().replace(/^,\s*/,"").replace(/,\s*$/,"")).forEach(p=>{
    if(!p) return;
    if(/^(\\(Rightarrow|Leftarrow|Leftrightarrow|to|therefore|because|implies|iff)\s*)+$/.test(p)){ carry+=p+" "; return; }
    out.push(carry+p); carry="";
  });
  if(carry&&out.length) out[out.length-1]+=" "+carry.trim();
  return out.length?out:[t];
}
/* 좁은 화면(폰)에서만: 글자 덩어리(\text{…})를 화살표(\to·\Rightarrow)로 이은 「흐름」 줄은 화살표 단위로 줄을 나눈다 — 수식이 아니라 단계 나열이라 나눠도 식이 갈리지 않는다 */
function splitFlow(t){
  const segs=[]; let d=0, cur="", i=0;
  while(i<t.length){ const c=t[i];
    if(c==="\\"&&(t[i+1]==="{"||t[i+1]==="}")){ cur+=t.slice(i,i+2); i+=2; continue; }
    if(c==="{") d++; else if(c==="}") d=Math.max(0,d-1);
    if(!d){ const m=/^\\ ?\\(to|Rightarrow)(?![a-zA-Z])\\ ?/.exec(t.slice(i))||/^\s*\\(to|Rightarrow)(?![a-zA-Z])\s*/.exec(t.slice(i)); if(m&&cur.trim()){ segs.push(cur); cur="\\"+m[1]+"\\ "; i+=m[0].length; continue; } }
    cur+=c; i++; }
  segs.push(cur);
  const ok=segs.length>=3&&segs.every(s=>/^(\\(to|Rightarrow)\\ )?\s*\\text\{/.test(s.trim()));
  return ok?segs.map(s=>s.trim()):[t];
}
function splitDisplays(html,narrow){
  return String(html).replace(/\\\[([\s\S]*?)\\\]/g,(m,tex)=>{ let ps=splitTex(tex); if(narrow) ps=[].concat(...ps.map(splitFlow)); return ps.length>1?ps.map(p=>"\\["+p+"\\]").join(""):m; });
}
