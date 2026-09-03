/**
 * 얼라이브위크 출결 웹훅 — study-console → 구글 캘린더
 *
 * 앱에서 출결 버튼(출석/지각/출튀/결석)·수업 시작/종료를 누르면 이 스크립트가 받아서
 * 한양 캘린더의 그날 수업 블록에 색·시간·누적 현황을 반영한다.
 *
 * 색 규칙 (심각도 그라데이션):
 *   출석 = 블루베리(9) · 지각 = 바나나(5) · 출튀 = 귤(6) · 결석 = 토마토(11)
 * 시간 규칙:
 *   수업 종료를 기록하면 블록 종료 시각을 실제 시각으로 조정 (결석은 제외)
 * 누적 규칙:
 *   설명란에 출석/지각/출튀/결석 횟수와 결석환산(지각 N회=결석 1회)을 기록
 *
 * 배포 (1회, 약 10분):
 *   1. script.google.com → 새 프로젝트 → 이 파일 내용 붙여넣기
 *   2. 배포 > 새 배포 > 유형: 웹 앱
 *      - 실행 계정: 나(rladkxh1004@hanyang.ac.kr)  ← 캘린더 소유 계정으로 로그인한 상태여야 함
 *      - 액세스 권한: 링크가 있는 모든 사용자
 *   3. 승인 화면에서 캘린더 권한 허용
 *   4. 발급된 웹 앱 URL(…/exec)을 학습앱 설정 > 얼라이브위크 웹훅 URL에 붙여넣고 저장
 */

var CAL_ID = 'rladkxh1004@hanyang.ac.kr';
var COLOR = { present: '9', late: '5', ghost: '6', absent: '11' };
var LABEL = { present: '출석', late: '지각', ghost: '출튀', absent: '결석' };
var MARK = '[얼라이브위크]';

function doPost(e) {
  var out = { ok: false };
  try {
    var p = JSON.parse(e.postData.contents);
    if (!p.course || !p.date) throw new Error('course/date 누락');

    var day = new Date(p.date + 'T00:00:00+09:00');
    var evs = CalendarApp.getCalendarById(CAL_ID).getEventsForDay(day);
    var ev = null;
    for (var i = 0; i < evs.length; i++) {
      var t = evs[i].getTitle();
      if (t === p.course || t.indexOf(p.course) === 0) { ev = evs[i]; break; }
    }
    if (!ev) throw new Error(p.date + '에 "' + p.course + '" 블록 없음');

    // 1) 색 — 출결 상태
    if (p.status && COLOR[p.status]) ev.setColor(COLOR[p.status]);

    // 2) 시간 — 실제 종료 시각 반영 (결석 제외, 시작보다 뒤일 때만)
    if (p.endedAt && p.status !== 'absent') {
      var st = ev.getStartTime();
      var en = new Date(p.date + 'T' + p.endedAt + ':00+09:00');
      if (en > st) ev.setTime(st, en);
    }

    // 3) 설명 — 누적 현황 블록 갱신 (이전 블록은 교체)
    var c = p.counts || {};
    var lta = c.lta || 3;
    var lines = [
      MARK + ' ' + (LABEL[p.status] || p.status || '기록') +
        (p.startedAt ? ' · ' + p.startedAt : '') + (p.endedAt ? '–' + p.endedAt : '')
    ];
    lines.push(
      '누적: 출석' + (c.present || 0) + ' 지각' + (c.late || 0) +
      ' 출튀' + (c.ghost || 0) + ' 결석' + (c.absent || 0) +
      ' → 결석환산 ' + (c.eff || 0) + '/' + (c.limit || '−') +
      ' (지각 ' + lta + '회=결석 1회)'
    );
    if (p.status === 'late' && c.late && c.late % lta === 0) {
      lines.push('⚠ 지각 ' + c.late + '회 누적 — 결석 ' + (c.late / lta) + '회로 환산됨');
    }
    var desc = (ev.getDescription() || '');
    var idx = desc.indexOf(MARK);
    if (idx >= 0) desc = desc.substring(0, idx).replace(/\s+$/, '');
    ev.setDescription((desc ? desc + '\n\n' : '') + lines.join('\n'));

    out.ok = true;
    out.event = ev.getTitle();
  } catch (err) {
    out.error = String(err);
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

/** 배포 확인용 — 웹 앱 URL을 브라우저로 열면 상태가 보인다 */
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, service: 'aliveweek-webhook', calendar: CAL_ID })
  ).setMimeType(ContentService.MimeType.JSON);
}
