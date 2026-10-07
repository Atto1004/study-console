from pathlib import Path
p=Path(__file__).resolve().parents[2]/'school/school.js'
s=p.read_text(encoding='utf-8')
start=s.index('function board(')
end=s.index('\nfunction currentEvidence',start)
s=s[:start]+'''function board(title,body,kind,annotation){
  const host=$('board');let limit=innerHeight<760?260:440,pages=splitText(body,limit),page=0;
  function draw(){
    host.replaceChildren(node('div',kind,'caption'),node('h1',title),node('div',pages[page],'content'));
    if(annotation)host.append(node('div',annotation,'annotation'));
    if(pages.length>1){
      const controls=node('div',undefined,'board-pages'),prev=button('앞 판서',()=>{page--;draw();}),next=button('다음 판서',()=>{page++;draw();});
      prev.disabled=page===0;next.disabled=page===pages.length-1;
      controls.append(prev,node('span',`${page+1} / ${pages.length} · 내용 분할`),next);host.append(controls);
    }
    renderMath(host);
    requestAnimationFrame(()=>{
      if(current&&host.scrollHeight>host.clientHeight+2&&innerWidth>650&&limit>100){
        limit=Math.floor(limit*.7);const smaller=splitText(body,limit);
        if(smaller.length>pages.length){pages=smaller;page=0;draw();}
      }
    });
  }
  draw();
}
''' + s[end:]
s=s.replace("showLobby();status('학교 연결 완료');", "$('listen').disabled=!capabilities.voice;$('listen').title=capabilities.voice?'Fish 음성으로 대사 듣기':'서버에 Fish 음성 연결 설정이 필요합니다.';showLobby();status('학교 연결 완료');")
p.write_text(s,encoding='utf-8')
