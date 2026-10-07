/* 기존 학습 엔진의 기능을 통합 화면 안에서 재사용한다. 새 원장을 만들지 않는다. */
(function () {
  const params = new URLSearchParams(location.search);
  if (params.get('integrated') !== '1') return;
  document.documentElement.classList.add('school-integrated');
  document.title = '학습';
  const style = document.createElement('style');
  style.textContent = `
    html.school-integrated,html.school-integrated.v74 { color-scheme:light; --font-head: "Pretendard Variable", "Malgun Gothic", sans-serif; --font-body: var(--font-head); --surface:#fff; --surface-2:#f4f6f3; --surface-3:#edf2eb; --ink:#24332c; --ink-2:#4d6153; --ink-3:#66736b; --line:#dfe5dd; --line-2:#d6ddd5; --bg:#fff; --gl-bg0:#fff; --gl-bg1:#fff; --gl-bg2:#fff; }
    html.school-integrated body { background:#fff!important;background-image:none!important; }
    .school-integrated .topbar,.school-integrated #rail,.school-integrated #tabbar,.school-integrated #sc-loading { display:none!important; }
    .school-integrated .main { margin:0!important;padding:16px!important;max-width:none!important; }
    .school-integrated .app { display:block!important; }
    .school-integrated #v74Scene { display:none!important; }
    html.school-integrated button,html.school-integrated .btn { box-shadow:none!important;transform:none!important;font-family:var(--font-body)!important; }
    html.school-integrated h1,html.school-integrated h2,html.school-integrated h3,html.school-integrated .chip,html.school-integrated .v65-clock { font-family:var(--font-head)!important; }
    html.school-integrated .card,html.school-integrated .tile { border:1px solid #dfe5dd!important;box-shadow:none!important;background:#fff!important; }
    .school-integrated #v-course .back { display:none!important; }
    .school-integrated #v33Pre,.school-integrated #lqSumMust { display:none!important; }
  `;
  document.head.append(style);
  let attempts = 0;
  const ready = setInterval(function () {
    if (typeof S === 'undefined' || !S || typeof term !== 'function' || typeof go !== 'function') {
      if (++attempts < 200) return;
      clearInterval(ready);
      parent.postMessage({type:'school-integrated-error',message:'학습 정보를 불러오지 못했습니다.'},location.origin);
      return;
    }
    clearInterval(ready);
    try {
      // 화면 위치를 공유하지 않고 데이터 원본만 공유한다.
      if (window.V73) { V73.SK='school-integrated-view'; V73.saved=null; }
      const originalLogSheet = logSheet;
      let filesPromise;
      logSheet = function(cid, date) {
        originalLogSheet(cid, date);
        const target = document.querySelector('#lqSum');
        const c = course(cid);
        if (!target || !c) return;
        const files = document.createElement('details');
        const summary = document.createElement('summary'); summary.textContent='연결된 수업 자료'; files.append(summary);
        target.prepend(files);
        filesPromise ||= fetch('_private/class-files.json', {credentials:'same-origin',cache:'no-store'}).then(r => { if (!r.ok) throw new Error('자료 목록 확인 필요'); return r.json(); });
        filesPromise.then(registry => {
          if (!files.isConnected) return;
          const items = registry.items.filter(f => f.course === c.name && (!f.date || f.date === date));
          summary.textContent='연결된 수업 자료 ' + items.length + '개';
          for (const item of items) {
            const p=document.createElement('p'), a=document.createElement('a');
            a.textContent=item.file; a.href=item.href; a.target='_blank'; a.rel='noopener'; p.append(a); files.append(p);
          }
          if (!items.length) { const p=document.createElement('p');p.textContent='이 회차에 연결된 파일이 없습니다.';files.append(p); }
        }).catch(error => { if(files.isConnected) summary.textContent=error.message; });
      };
      const name = params.get('course');
      const selected = term().courses.find(c => c.name === name);
      const section = params.get('section');
      const allowed = new Set(['today','plan','study','cal','grade','course','shelf','set']);
      if (!allowed.has(section)) throw new Error('지원하지 않는 학습 화면입니다.');
      if (section === 'course' && !selected) throw new Error('과목을 찾을 수 없습니다.');
      if (section === 'cal') ui.calMode = params.get('mode') === 'grid' ? 'grid' : 'week';
      go(section, selected?.id);
      if (params.get('date')) {
        if (!selected || !/^\d{4}-\d{2}-\d{2}$/.test(params.get('date'))) throw new Error('수업 회차를 확인해주세요.');
        logSheet(selected.id, params.get('date'));
      }
      parent.postMessage({type:'school-integrated-ready',section},location.origin);
    } catch(error) {
      parent.postMessage({type:'school-integrated-error',message:error.message},location.origin);
    }
  }, 50);
})();
