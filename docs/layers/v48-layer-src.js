/* ============================================================
   V48 LAYER — 연동 끊김 배너 (대표님 2026-09-24 "LMS·체리·클로바노트·iCloud·구글드라이브 연동 여부는 항상 확인")
   PC 예약 작업 「아톰_연동점검」(매시간)이 knowledge/integrations.json 을 쓴다(.gitignore — atom /study/ 에서만 읽힘).
   오늘 탭 맨 위: 끊긴 연동이 있으면 빨간 배너(무엇이 · 무엇이 멈췄는지 · 조치), 점검이 3시간 넘게 안 돌았으면 그것도 알림. 전부 정상이면 아무것도 안 보인다.
   ============================================================ */
(function(){
  if(window.V48) return;
  var V48=window.V48={data:null,at:0};
  V48.NAMES={chrome:"아톰 크롬",clova:"클로바노트",lms:"한양 LMS",cherry:"체리스쿨",icloud:"iCloud 사진",gdrive:"구글 드라이브",tasks:"수집 작업"};
  V48.load=function(){
    if(Date.now()-V48.at<60000) return Promise.resolve(V48.data);
    return fetch("knowledge/integrations.json",{cache:"no-store"}).then(function(r){ return r.ok?r.json():null; }).catch(function(){ return null; })
      .then(function(d){ V48.data=d; V48.at=Date.now(); return d; });
  };
  V48.html=function(d){
    if(!d||!d.items) return "";
    var bad=Object.keys(d.items).filter(function(k){ return d.items[k]&&d.items[k].ok===false; });
    var age=(Date.now()-new Date(d.ts).getTime())/3600000, stale=age>3;
    if(!bad.length&&!stale) return "";
    var rows=bad.map(function(k){ var it=d.items[k]; return '<li><b>'+esc(V48.NAMES[k]||k)+'</b> — '+esc(it.msg||"")+(it.fix?'<span class="v48-fix">'+esc(it.fix)+'</span>':'')+'</li>'; }).join("");
    return '<div class="v48-h"><b>연동 끊김 '+bad.length+'</b><span>'+(stale?'점검이 '+Math.round(age)+'시간째 안 돌았습니다 · ':'')+'마지막 점검 '+esc(String(d.ts).slice(5,16).replace("T"," "))+'</span></div>'+(rows?'<ul>'+rows+'</ul>':'');
  };
  V48.render=function(){
    var v=$("#v-today"); if(!v) return;
    V48.load().then(function(d){
      var h=V48.html(d), box=$("#v48Bar");
      if(!h){ if(box) box.remove(); return; }
      if(!box){ box=document.createElement("div"); box.id="v48Bar"; box.className="v48"; var vh=$("#v-today .vh"); if(vh&&vh.nextSibling) v.insertBefore(box,vh.nextSibling); else v.insertBefore(box,v.firstChild); }
      box.innerHTML=h;
    });
  };
  var _renderToday=renderToday; renderToday=function(){ _renderToday(); try{ V48.render(); }catch(e){ if(window.console) console.warn("V48", e); } };
  var css=document.createElement("style"); css.id="v48css";
  css.textContent=[
    ".v48{border:1px solid color-mix(in srgb,var(--crit) 35%,var(--line));background:var(--crit-soft);border-radius:12px;padding:10px 14px}",
    ".v48-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px}.v48-h b{color:var(--crit);font-size:14px}.v48-h span{font-size:12px;color:var(--ink-3)}",
    ".v48 ul{margin:6px 0 0;padding-left:18px;display:flex;flex-direction:column;gap:3px}.v48 li{font-size:13px;line-height:18px}",
    ".v48-fix{display:block;font-size:12px;color:var(--ink-2)}"
  ].join("\n");
  document.head.appendChild(css);
})();
