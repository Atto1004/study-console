/* 얼라이브위크는 학습앱의 시간표·오늘 할 일과 저장 원본을 공유한다. */
(function () {
  'use strict';
  if (new URLSearchParams(location.search).get('app') !== 'aliveweek') return;
  document.documentElement.classList.add('aliveweek-entry');
  document.title = '얼라이브위크';
  var style = document.createElement('style');
  style.textContent = '.aliveweek-entry .topbar,.aliveweek-entry #rail,.aliveweek-entry #tabbar{display:none!important}.aliveweek-entry .main{padding:16px 14px 40px!important;max-width:1180px}.aliveweek-entry .aw-entry-nav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.aliveweek-entry .aw-entry-nav button{min-height:44px;padding:8px 16px;border:1px solid #cbd7cb;border-radius:8px;background:#fff;color:#263c2b;font:inherit;cursor:pointer}.aliveweek-entry .aw-entry-nav button[aria-pressed=true]{background:#e5f1e5;border-color:#43834b;font-weight:700}';
  document.head.appendChild(style);
  // 마지막 학습 화면 위치와 얼라이브위크 화면 위치를 서로 덮지 않는다.
  if (window.V73) {
    V73.SK = 'mc-aliveweek-last-view';
    try { V73.saved = JSON.parse(sessionStorage.getItem(V73.SK) || 'null'); }
    catch (_) { V73.saved = null; }
  }
  var originalBoot = boot;
  boot = function () {
    originalBoot.apply(this, arguments);
    var main = document.querySelector('.main');
    var nav = document.createElement('nav');
    nav.className = 'aw-entry-nav'; nav.setAttribute('aria-label', '얼라이브위크 화면');
    [['plan', '시간표 · 오늘 할 일'], ['today', '오늘 수업'], ['todo', '할 일 목록']].forEach(function (item) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = item[1];
      b.onclick = function () { go(item[0]); };
      b.dataset.view = item[0]; nav.appendChild(b);
    });
    main.prepend(nav);
    var previousRender = render;
    render = function () {
      var result = previousRender.apply(this, arguments);
      var heading = document.querySelector('#v-plan .vh h1');
      if (heading) heading.textContent = '얼라이브위크';
      nav.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === ui.view)); });
      return result;
    };
    if (window.V60) { V60.ui.today = true; V60.ui.off = 0; V60.ui.week = 0; }
    go('plan');
  };
})();
