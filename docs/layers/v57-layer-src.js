/* ============================================================
   V57 LAYER — 심플 화면 · 암기노트 입구 · 스앵님 판정 이어받기 (BUILD 2026-09-29.91)
   대표님 2026-09-29: 「부가적인 설명을 붙인 텍스트들은 전부 화면상에 안 보이게, 화면에는 필요한 것만 심플하게」(지침 학습시스템 §24)
     ① 설명만 하는 글(조작 안내·흐름 설명·설정 안내)은 숨긴다 — 검사 docs/tools/helper_text_audit.cjs 로 찾은 자리. 상태·수치가 섞인 글은 원문에서 설명 조각만 뺐다(기본 코드·V25·V34·V35·V49)
     ② 과목 화면 히어로에 「암기노트」(notes/memo/<약칭>.html — build_memo.py)
     ③ atom 안(서버 이해도)에서도 이 기기의 스앵님 판정(atto.mastery 의 auto — 교실·수업 노트·덱·암기노트 기록)이 더 최근이면 그것을 쓴다(V47)
   끄기: ?simple=off (①만)
   ============================================================ */
(function(){
  var V57=window.V57={};
  V57.MEMO={"일반물리학2":"phys2","정역학":"statics","공업수학1":"em1","미분적분학2":"calc2"};
  /* ① 설명만 하는 글 숨김 */
  if(!/[?&]simple=off\b/.test(location.search)){
    var st=document.createElement("style"); st.id="v57css";
    st.textContent=[
      "#studySub,#kmapEntry .hint,#v50Card>.card-h .ha,#weeklyBox>.hint,#v-grade>.vh .sub,#v-set>.vh .sub,#retakeBox>.hint,#termBox>.hint,#v54Card .hint,#rulesBox>.hint,#fontBox>.hint,#dataBox>.hint,#v55Path>.card-h .ha,.v55-unit.none .v55-ut{display:none!important}"
    ].join("\n");
    document.head.appendChild(st);
  }
  /* ② 암기노트 버튼 */
  V57.memoBtn=function(){
    var v=$("#v-course"), c=course(ui.course), hero=$("#v55Hero",v||document); if(!v||!c||!hero) return;
    var slug=V57.MEMO[c.name], act=$(".v55-act",hero); if(!slug||!act||$("#v57Memo",act)) return;
    var b=document.createElement("button"); b.type="button"; b.className="btn"; b.id="v57Memo"; b.textContent="암기노트";
    b.onclick=function(){ openNote("notes/memo/"+slug+".html",c.name+" 암기노트"); };
    var sp=$(".v55-actsp",act); act.insertBefore(b,sp||null);
  };
  if(window.V55&&V55.render&&!V55._v57){ var _r=V55.render; V55.render=function(){ var x=_r.apply(this,arguments); try{ V57.memoBtn(); }catch(e){} return x; }; V55._v57=1; }
  /* ③ 스앵님 판정 이어받기 */
  if(window.V47&&V47.load&&!V47._v57){ var _ld=V47.load; V47.load=function(){ var p=_ld.apply(this,arguments);
    return p.then(function(ok){ try{ if(V47.MAST){ var L=JSON.parse(localStorage.getItem("atto.mastery")||"{}")||{}; Object.keys(L).forEach(function(id){ var l=L[id], m=V47.MAST[id]; if(l&&l.auto&&(!m||(+l.ts||0)>(+m.ts||0))) V47.MAST[id]=l; }); } }catch(e){} return ok; }); }; V47._v57=1; }
})();
