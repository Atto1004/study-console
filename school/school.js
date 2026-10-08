import {
  evidenceSummary,
  reviewQueue,
  recommendStart,
  splitText,
  learningPath,
} from "./learning.js";
import { createWorkspace } from "./workspace.js";
import { createMission } from "./mission.js?v=199";
import { attachSaeng } from "./saeng.js";
import { createSpace, ROOMS } from "./space.js";
import { pickLesson } from "./metrics.js";
import { createGrowth } from "./growth.js?v=199";
const $ = (id) => document.getElementById(id);
const TEST = new URLSearchParams(location.search).get("test") === "1";
let catalog,
  state,
  capabilities,
  current = null,
  course = "공업수학1",
  index = 0,
  assisted = false,
  passed = false,
  requestGeneration = 0;
let pending = [],
  saveTask = null,
  chatBusy = false,
  lastLesson = null;
let pausedLesson = null;
let activeSession = null, sessionQueue = Promise.resolve();
let resizeBoard;
let chatMode = "question";
let workspace, mission, space, growth, legacyLobbyMode = false, missionIndices = null;
const eventId = () => crypto.randomUUID();
function rememberScreen(fields){
  const url=new URL(location.href);
  for(const key of ['room','lesson','step','world','subject','camera'])url.searchParams.delete(key);
  for(const [key,value] of Object.entries(fields))if(value)url.searchParams.set(key,value);
  history.replaceState(null,'',url);
}
function node(tag, text, cls) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (cls) el.className = cls;
  return el;
}
function button(text, action, cls) {
  const el = node("button", text, cls);
  el.type = "button";
  el.onclick = action;
  return el;
}
function link(text, href) {
  if (!href) return node("span", text);
  const el = node("a", text);
  el.href = "../" + href;
  el.target = "_blank";
  el.rel = "noopener";
  return el;
}
function isStudyPractice(file) {
  return /혼자\s*풀기|스앵님|코칭/.test(file.label || "") || /\/hw(?:\d+)?\//.test(file.href || file.file || "");
}
let integratedCleanup = null, overviewGeneration = 0;
function openIntegrated(title, section, options = {}) {
  if (TEST) { status("통합 편집은 검증 모드에서 열지 않습니다. 실제 기록을 보호합니다.", true); return; }
  if (integratedCleanup) integratedCleanup();
  stopVoice(); closeDialogs(); ++requestGeneration;
  for (const id of ["lobby", "room", "dialogue", "progress", "assignments"]) $(id).hidden = true;
  document.querySelector(".school").dataset.mode = "integrated";
  $("location").textContent = title;
  const area = options.area || "learningArea";
  for (const id of ["learningArea", "progressArea", "assignmentArea"])
    $(id).setAttribute("aria-pressed", String(id === area));
  let host = $("integratedWorkspace");
  if (!host) { host = node("section", undefined, "integrated-workspace"); host.id = "integratedWorkspace"; $("scene").append(host); }
  host.hidden = false;
  const heading = node("div", undefined, "integrated-heading");
  heading.append(node("h1", title), button(area === "progressArea" ? "수업 자료로 돌아가기" : "공부하기로 돌아가기", () => area === "progressArea" ? showProgress() : showLobby()));
  const message = node("p", "불러오는 중…"); message.setAttribute("role", "status");
  const frame = node("iframe"); frame.title = title; frame.className = "integrated-frame";
  const params = new URLSearchParams({view: "classic", integrated: "1", lobby:"off", section});
  for (const key of ["course", "date", "mode"]) if (options[key]) params.set(key, options[key]);
  frame.src = "../index.html?" + params;
  host.replaceChildren(heading, message, frame);
  const receive = event => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow || !host.contains(frame)) return;
    if (event.data?.type === "school-integrated-ready") { message.hidden = true; window.removeEventListener("message", receive); }
    if (event.data?.type === "school-integrated-error") { message.textContent = event.data.message; window.removeEventListener("message", receive); }
  };
  window.addEventListener("message", receive);
  integratedCleanup = () => { window.removeEventListener("message", receive); integratedCleanup = null; };
  frame.addEventListener("load", () => { if (!host.contains(frame)) window.removeEventListener("message", receive); });
}
function openStudyAsset(title, path) {
  const host = panel(title), frame = node("iframe");
  frame.title = title; frame.className = "study-asset-frame"; frame.src = "../" + path;
  host.append(frame);
}
async function drawStudyOverview() {
  if (workspace) return;
  const generation = ++overviewGeneration;
  const host = $("studyOverview");
  if (!host) return;
  host.replaceChildren(node("h2", "오늘 공부·계획"));
  const tools = node("div", undefined, "assignment-filters");
  tools.append(button("오늘 공부·타이머", () => openIntegrated("오늘 공부", "today")), button("공부 계획", () => openIntegrated("공부 계획", "plan")), button("시험 대비·학습 기록", () => openIntegrated("시험 대비·학습 기록", "study")), button("학기·개인 공부", () => openIntegrated("학기·개인 공부", "shelf")));
  host.append(tools);
  try {
    const response = await fetch("/api/study/state", {credentials:"same-origin",cache:"no-store"});
    if (!response.ok) throw new Error("시험 정보를 불러오지 못했습니다.");
    const {state: original} = await response.json();
    if (generation !== overviewGeneration) return;
    const term = original?.terms?.find(t => t.id === original.activeTermId);
    const today = new Intl.DateTimeFormat("sv-SE", {timeZone:"Asia/Seoul"}).format(new Date());
    const exams = (term?.exams || []).filter(e => e.date >= today).sort((a,b) => a.date.localeCompare(b.date));
    const list = node("div", undefined, "exam-overview");
    list.append(node("h3", "다가오는 시험"));
    if (!exams.length) list.append(node("p", "등록된 예정 시험이 없습니다."));
    for (const exam of exams.slice(0,7)) {
      const c = term.courses.find(c => c.id === exam.courseId);
      row(list, `${c?.name || "과목 확인 필요"} · ${exam.kind || "시험"}`, `${exam.date} ${exam.time || ""} · ${exam.scope || "범위 확인 필요"}`, () => openIntegrated("시험 대비", "study"), "대비");
    }
    host.append(list);
  } catch (error) { if (generation === overviewGeneration) host.append(node("p", error.message)); }
}
async function api(path, body) {
  const response = await fetch("/api/school/" + path, {
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      ...(TEST ? { "X-School-Test": "1" } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { method: "POST", body: JSON.stringify(body) } : {}),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("서버 응답을 읽지 못했습니다.");
  }
  if (!response.ok)
    throw new Error(data.error || "학교 서버에 연결하지 못했습니다.");
  return data;
}
function status(text, error = false) {
  $("status").textContent =
    (TEST ? "검증 모드 · 실제 학습 기록과 분리 · " : "") + text;
  $("status").className = error ? "error" : "";
}
function record(event) {
  pending.push({ id: eventId(), ...event });
  flush();
}
function flush() {
  if (saveTask) return saveTask;
  if (!pending.length) return Promise.resolve();
  saveTask = (async () => {
    try {
      while (pending.length) {
        const saved = await api("event", pending[0]);
        state.revision = saved.revision;
        if (!state.events.some((e) => e.id === saved.event.id))
          state.events.push(saved.event);
        Object.assign(state, saved.projection);
        pending.shift();
      }
      status("서버에 학습 기록 저장");
      growth?.notifySkills();
      $("saveStatus").textContent = "서버에 저장됨";
      $("retry").hidden = true;
    } catch (error) {
      status(
        "저장되지 않은 기록 " + pending.length + "건 · " + error.message,
        true,
      );
      $("saveStatus").textContent = "저장 재시도 필요";
      $("retry").hidden = false;
    } finally {
      saveTask = null;
    }
  })();
  return saveTask;
}
$("retry").onclick = flush;
window.addEventListener("online", flush);
window.addEventListener("beforeunload", (event) => {
  if (pending.length || chatBusy) {
    event.preventDefault();
    event.returnValue = "";
  }
});
function renderMath(root) {
  if (window.renderMathInElement)
    window.renderMathInElement(root, {
      delimiters: [
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  requestAnimationFrame(() => {
    if (!root.isConnected) return;
    let hasOverflow = false;
    for (const formula of root.querySelectorAll(
      ".board .katex-display, .board .content > .katex",
    )) {
      const overflow = formula.scrollWidth > formula.clientWidth + 2;
      hasOverflow ||= overflow;
      formula.classList.toggle("formula-scrollable", overflow);
      if (overflow) {
        formula.tabIndex = 0;
        formula.setAttribute("role", "region");
        formula.setAttribute(
          "aria-label",
          "긴 수식 · 좌우로 스크롤하여 전체 보기",
        );
        formula.title = "좌우로 스크롤하세요. 키보드는 방향키를 사용하세요.";
      } else {
        formula.removeAttribute("tabindex");
        formula.removeAttribute("role");
        formula.removeAttribute("aria-label");
        formula.removeAttribute("title");
      }
    }
    if (root.classList.contains("board")) {
      const previousHint = root.querySelector(".formula-scroll-hint");
      if (previousHint) previousHint.remove();
      if (hasOverflow) root.querySelector(".caption")?.append(
        node("small", " · 긴 수식은 좌우로 스크롤하세요", "formula-scroll-hint"),
      );
    }
  });
}
function panel(title) {
  $("panelBody").replaceChildren(
    node("p", "GREENLIGHT ACADEMY", "eyebrow"),
    node("h2", title),
  );
  if (!$("panel").open) $("panel").showModal();
  return $("panelBody");
}
$("closePanel").onclick = () => $("panel").close();
// 팝업은 바깥을 누르면 닫는다(모든 dialog 공통). 창 안에서 누르기 시작해 바깥에서 뗀 경우(글자 끌어 선택)는 닫지 않는다.
const outside = (d, e) => { const r = d.getBoundingClientRect(); return e.target === d && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom); };
let backdropDown = null;
document.addEventListener("pointerdown", (e) => {
  backdropDown = [...document.querySelectorAll("dialog[open]")].find((d) => outside(d, e)) || null;
  for (const m of document.querySelectorAll("details.secondary-menu[open]")) if (!m.contains(e.target)) m.open = false;
});
document.addEventListener("click", (e) => {
  const d = backdropDown; backdropDown = null;
  if (d && d.open && outside(d, e)) d.close();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") for (const m of document.querySelectorAll("details.secondary-menu[open]")) m.open = false;
});
function row(host, title, detail, action, label = "열기") {
  const item = node("div", undefined, "list-row"),
    text = node("div");
  text.append(node("b", title), node("small", detail));
  item.append(text);
  if (action) item.append(button(label, action));
  host.append(item);
}
function showLobby() {
  if (workspace && !legacyLobbyMode) { workspace.open('main'); return; }
  rememberScreen({room:'learning'});
  if ($("integratedWorkspace")) $("integratedWorkspace").hidden = true;
  $("progress").hidden = true;
  $("progressArea").setAttribute("aria-pressed", "false");
  $("assignments").hidden = true;
  $("learningArea").setAttribute("aria-pressed", "true");
  $("assignmentArea").setAttribute("aria-pressed", "false");
  document.querySelector(".school").dataset.mode = "lobby";
  stopVoice();
  closeDialogs();
  requestGeneration++;
  current = null;
  $("scene").className = "scene lobby";
  $("lobby").hidden = false;
  $("room").hidden = true;
  $("dialogue").hidden = true;
  $("location").textContent = "공부하기";
  $("today").textContent =
    "기호부터 교수님 수업 문제까지, 한 단계씩 확인합니다.";
  drawStudyOverview();
  const doors = $("courseDoors");
  doors.replaceChildren();
  for (const [position, c] of catalog.courses
    .filter((c) => c.name !== "사회봉사")
    .entries()) {
    const b = button("", () => showCourse(c.name), "door");
    const info = node("span", undefined, "door-info");
    info.append(
      node("b", c.name),
      node("small", `${c.lessons.length}회 수업 · ${c.nodes.length}개 개념`),
    );
    b.append(
      node("span", String(position + 1).padStart(2, "0"), "door-number"),
      info,
      node("span", "›", "door-arrow"),
    );
    doors.append(b);
  }
  const plan = state.plans[course];
  $("resumeText").textContent = plan
    ? `${course} · ${plan.minutes}분씩 · ${plan.goal}`
    : "상담에서 시작점을 정하고 자신의 답으로 확인합니다.";
}
$("home").onclick = showLobby;
$("learningArea").onclick = showLobby;
$("progressArea").onclick = showProgress;
$("assignmentArea").onclick = () => showAssignments();
  async function showProgress() {
    if (workspace) { workspace.open('progress'); return; }
    if ($("integratedWorkspace")) $("integratedWorkspace").hidden = true;
  stopVoice(); closeDialogs(); const generation = ++requestGeneration; current = null;
  document.querySelector(".school").dataset.mode = "progress";
  $("scene").className = "scene lobby";
  $("lobby").hidden = $("room").hidden = $("dialogue").hidden = $("assignments").hidden = true;
  $("progress").hidden = false;
  $("location").textContent = "진도관리";
  for (const id of ["learningArea", "progressArea", "assignmentArea"])
    $(id).setAttribute("aria-pressed", String(id === "progressArea"));
  const host = $("progress");
  host.replaceChildren(node("h1", "진도관리"), node("p", "수업 내용과 자료를 불러오고 있습니다."));
  try {
      const [materials, sessions, files, original] = await Promise.all([...["knowledge/materials.json", "knowledge/sessions.json", "_private/class-files.json"].map(async path => {
      const response = await fetch("../" + path, {credentials: "same-origin", cache: "no-store"});
      if (!response.ok) throw new Error("수업 자료 목록을 불러오지 못했습니다.");
      return response.json();
      }), fetch("/api/study/state", {credentials:"same-origin",cache:"no-store"}).then(async response => {
        if (!response.ok) throw new Error("수업 기록을 불러오지 못했습니다.");
        return (await response.json()).state;
      })]);
    if (generation !== requestGeneration) return;
    const names = catalog.courses.filter(c => c.name !== "사회봉사").map(c => c.name);
    if (!names.includes(course)) course = names[0];
    const kinds = {textbook:"교재", pre:"강의자료", board:"판서", photo:"수업 사진", rec:"녹음", summary:"정리본", note:"내 필기", profnote:"교수 필기", derived:"변환본", lmsvideo:"강의 영상", other:"수업 자료"};
    function appendFiles(parent, list) {
      if (!list.length) { parent.append(node("p", "연결된 파일이 없습니다.")); return; }
      const groups = new Map();
      for (const file of list) {
        const kind = file.file.startsWith("중복_") ? "duplicate" : file.type;
        if (!groups.has(kind)) groups.set(kind, []);
        groups.get(kind).push(file);
      }
      for (const [kind, entries] of groups) {
        const group = node("details");
        group.append(node("summary", `${kind === "duplicate" ? "중복 표시 파일" : kinds[kind] || "수업 자료"} ${entries.length}개`));
        for (const file of entries) {
        const p = node("p");
        p.append(file.href ? link(file.file, file.href) : node("span", `${file.file} · 로컬 보관`));
        group.append(p);
        }
        parent.append(group);
      }
    }
    function draw() {
      host.replaceChildren(node("h1", "진도관리"), node("p", "수업에서 배운 범위와 회차별 자료를 관리합니다."));
      const tools = node("div", undefined, "assignment-filters"), select = node("select");
      select.setAttribute("aria-label", "진도관리 과목");
      for (const name of names) { const option = node("option", name); option.value = name; select.append(option); }
      select.value = course; select.onchange = () => { course = select.value; draw(); };
        tools.append(select, button("자료 대조·교수 규칙", () => showSources(course)), button("출결·회차 관리", () => openIntegrated("출결·회차 관리", "cal", {area:"progressArea",mode:"grid"})), button("시간표", () => openIntegrated("시간표", "cal", {area:"progressArea"})), button("성적·학점", () => openIntegrated("성적·학점", "grade", {area:"progressArea"})));
      host.append(tools, node("p", `자료 기준 ${materials.asOf || "확인 필요"}`));
        const c = catalog.courses.find(c => c.name === course), plan = materials.courses[course]?.sessions || {}, notes = sessions.courses[course] || {};
        const term = original?.terms?.find(t => t.id === original.activeTermId);
        const savedCourse = term?.courses?.find(c => c.name === course);
        const savedSessions = (term?.sessions || []).filter(s => s.courseId === savedCourse?.id);
      const courseFiles = files.items.filter(f => f.course === course);
      const shared = node("details"); shared.append(node("summary", "교재·공통 강의자료"));
      appendFiles(shared, courseFiles.filter(f => !f.date)); host.append(shared);
        const dates = [...new Set([...Object.keys(plan), ...Object.keys(notes), ...c.lessons.map(l => l.date), ...courseFiles.map(f => f.date).filter(Boolean), ...savedSessions.map(s => s.date)])].sort().reverse();
      const upcoming = node("details"); upcoming.append(node("summary", "앞으로의 수업 계획"));
      if (!dates.length) host.append(node("p", "아직 수업 회차 기록이 없습니다."));
      for (const date of dates) {
        const info = notes[date] || {}, material = plan[date] || {}, lesson = c.lessons.find(l => l.date === date);
        const scheduled = date > materials.asOf;
          const week = lesson?.week || Math.floor((Date.parse(date + "T00:00:00Z") - Date.parse("2026-08-30T00:00:00Z")) / (7 * 86400000)) + 1;
          const savedSession = savedSessions.find(s => s.date === date);
          const weekNote = savedCourse?.weekNotes?.[week];
        const card = node("details", undefined, "assignment-card");
        card.append(node("summary", `${date} · ${week}주차 · ${info.title || lesson?.title || (material.plan?.topic ? "예고: " + material.plan.topic : "수업 내용 확인 필요")}${scheduled ? " · 예정" : ""}`));
          if (info.prog) card.append(node("p", "수업 기록: " + info.prog));
          if (savedSession?.progress) card.append(node("p", "직접 기록한 범위: " + savedSession.progress));
          if (savedSession?.memo) card.append(node("p", "수업 메모: " + savedSession.memo));
          if (savedSession?.status) card.append(node("p", "출결: " + ({present:"출석",late:"지각",vlate:"개큰지각",ghost:"출튀",excused:"인정결석",absent:"결석"}[savedSession.status] || savedSession.status)));
          if (weekNote?.range || weekNote?.summary) card.append(node("p", `${week}주차 기록: ` + [weekNote.range, weekNote.summary].filter(Boolean).join(" · ")));
        if (material.plan?.topic || material.plan?.pre) card.append(node("p", "강의계획·예고: " + [material.plan.topic, material.plan.pre].filter(Boolean).join(" · ")));
        if (material.plan?.src) card.append(node("small", "범위 근거: " + material.plan.src));
          if (!info.prog && !savedSession?.progress && !weekNote?.range) card.append(node("p", scheduled ? "예정 범위입니다. 실제 수업 후 확인합니다." : "실제 진행 범위의 상세 기록을 확인해야 합니다."));
        const counts = material.k || {};
        card.append(node("p", "자료 색인 · " + ["pre", "board", "rec", "summary", "note"].map(k => `${kinds[k]} ${counts[k] || 0}`).join(" · ")));
        if (material.none) card.append(node("p", "수업 없음으로 기록된 회차"));
          if (lesson) card.append(button("수업 내용 열기", () => startLesson(lesson.id)));
          card.append(button("수업 기록·출결 수정", () => openIntegrated(`${course} · ${date} 수업 기록`, "course", {area:"progressArea",course,date})));
        appendFiles(card, courseFiles.filter(f => f.date === date));
        (scheduled ? upcoming : host).append(card);
      }
      if (upcoming.children.length > 1) host.append(upcoming);
    }
    draw();
  } catch (error) {
    if (generation !== requestGeneration) return;
    host.replaceChildren(node("h1", "진도관리"), node("p", error.message), button("다시 불러오기", showProgress));
  }
}
let assignmentFilter = "전체", assignmentStatus = "진행";
  async function showAssignments() {
    if ($("integratedWorkspace")) $("integratedWorkspace").hidden = true;
  $("progress").hidden = true;
  $("progressArea").setAttribute("aria-pressed", "false");
  const generation = ++requestGeneration;
  stopVoice(); closeDialogs();
  document.querySelector(".school").dataset.mode = "assignments";
  $("scene").className = "scene lobby";
  $("lobby").hidden = $("room").hidden = $("dialogue").hidden = true;
  $("assignments").hidden = false;
  $("location").textContent = "과제";
  $("learningArea").setAttribute("aria-pressed", "false");
  $("assignmentArea").setAttribute("aria-pressed", "true");
  const host = $("assignments");
  host.replaceChildren(node("h1", "과제"), node("p", "과제를 불러오고 있습니다."));
  try {
    const data = await api("assignments");
    if (generation !== requestGeneration) return;
    function draw() {
      host.replaceChildren(node("h1", "과제"));
      const tools = node("div", undefined, "assignment-filters");
      const select = node("select"); select.setAttribute("aria-label", "과제 과목");
      for (const name of ["전체", ...new Set(data.rows.map(r => r.course))]) {
        const option = node("option", name); option.value = name; select.append(option);
      }
      select.value = assignmentFilter;
      if (!select.value) assignmentFilter = select.value = "전체";
      select.onchange = () => { assignmentFilter = select.value; draw(); };
      tools.append(select);
        for (const label of ["진행", "지난 기록", "제출 완료", "전체"]){
        const b = button(label, () => { assignmentStatus = label; draw(); });
        b.setAttribute("aria-pressed", String(assignmentStatus === label)); tools.append(b);
      }
      const help = node("details"); help.append(node("summary", "ⓘ"), node("p", data.notice)); tools.append(help);
        if(activeSession)tools.append(button("수업 이어가기",resumeSession));
        host.append(tools);
        const today = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
        const isPast = r => /^\d{4}-\d{2}-\d{2}/.test(r.due||'') && r.due.slice(0,10)<today;
        const rows = data.rows.filter(r => (assignmentFilter === "전체" || r.course === assignmentFilter) &&
          (assignmentStatus === "전체" || assignmentStatus === "지난 기록" && isPast(r) ||
           assignmentStatus === "제출 완료" && r.submitted || assignmentStatus === "진행" && !r.submitted && (!isPast(r)||r.continueActive)));
      host.append(node("p", `${rows.length}건 · 자료 기준 ${data.asOf || "확인 필요"}`));
      if (!rows.length) host.append(node("p", "해당 과제가 없습니다."));
      let category = null;
      for (const task of rows) {
        const group = task.category || "assignment";
        if (category !== group) { host.append(node("h2", group === "assignment" ? "수업 과제" : "과제 관련 할 일")); category = group; }
        const card = node("article", undefined, "assignment-card");
        card.append(node("small", task.course), node("h2", task.title));
        card.append(button('과제 작업 시작 · 얼라이브위크 기록',()=>growth.task(task)));
          card.append(node("p", `마감 ${task.due ? task.due.replace("T", " ") : "미확인"} · ${task.workDone ? "풀이 완료" : "풀이 중"} · ${task.submitted ? "제출 완료" : "제출 전"}`));
          card.append(node("small", task.manualSubmitted ? "제출 상태: 직접 표시" : "원본 제출 기록: " + task.submission));
          const actions = node("div", undefined, "assignment-checks");
          const message = node("p"); message.setAttribute("role", "status");
          for (const [field, label] of [["workDone", "풀이 완료"], ["submitted", "제출 완료"], ["hiddenFromMain", "메인에서 숨김 · 마감 당일 표시"]]) {
              const choice = node("label", undefined, "assignment-check");
              const toggle = node("input"); toggle.type = "checkbox"; toggle.checked = !!task[field];
              if(field === 'hiddenFromMain')toggle.disabled = !task.workDone;
              if(field === 'hiddenFromMain')toggle.title = '풀이 완료한 과제를 메인에서 숨깁니다. 제출 마감 당일에는 다시 표시합니다.';
              toggle.onchange = async () => {
                const value = toggle.checked;
                for (const b of actions.querySelectorAll("input")) b.disabled = true;
              message.textContent = "저장 중…";
              try {
                  const saved = await api("assignment-status", {id: task.id, field, value});
                Object.assign(task, saved);
                if (generation === requestGeneration) { draw(); status(label + " 상태 저장 완료"); }
              } catch (error) {
                message.textContent = error.message;
                  toggle.checked = !!task[field];
                  [...actions.querySelectorAll("input")].forEach((b,i)=>b.disabled=i===2&&!task.workDone);
              }
              };
              choice.append(toggle, node("span", label)); actions.append(choice);
          }
          if (isPast(task)) actions.append(button(task.continueActive ? '진행 목록에서 빼기' : '계속 진행', async () => {
            try { Object.assign(task, await api('assignment-status',{id:task.id,field:'continueActive',value:!task.continueActive})); draw(); }
            catch(error) { message.textContent=error.message; }
          }));
          card.append(actions, message);
        const files = node("div", undefined, "assignment-files");
        for (const file of task.files.filter(file => !isStudyPractice(file))) files.append(link(file.label, file.href));
        card.append(files);
        if (task.source) { const detail = node("details"); detail.append(node("summary", "근거"), node("p", task.source)); card.append(detail); }
        host.append(card);
      }
    }
    draw(); status("과제 원본 연결 완료");
  } catch(error) {
    if (generation !== requestGeneration) return;
    host.replaceChildren(node("h1", "과제"), node("p", error.message, "error"), button("다시 불러오기", () => showAssignments()));
    status(error.message, true);
  }
}
$("courses").onclick = () => {
  const host = panel("과목 교실");
  for (const c of catalog.courses)
    row(host, c.name, c.strategy, () => showCourse(c.name), "들어가기");
};
  function showCourse(name) {
  course = name;
  const c = catalog.courses.find((c) => c.name === name);
    const host = panel(name);
    const assets = node("div", undefined, "assignment-filters");
    const slug = {"공업수학1":"em1", "미분적분학2":"calc2", "일반물리학2":"phys2", "정역학":"statics"}[name];
    if (slug) assets.append(button("암기노트", () => openStudyAsset(name + " · 암기노트", "notes/memo/" + slug + ".html")));
    assets.append(button("개념지도", () => openStudyAsset(name + " · 개념지도", "learn.html?subject=" + encodeURIComponent(name))), button("단원·시험 대비·학습 기록", () => openIntegrated(name + " · 학습", "course", {course:name})));
    host.append(assets);
  host.append(node("p", c.strategy, "notice"));
  const plan = state.plans[name];
  if (plan)
    row(
      host,
      "상담에서 정한 계획",
      plan.goal + " · " + plan.minutes + "분씩",
      () => startLesson(plan.start),
      "계획으로 시작",
    );
  else host.append(button("시작점 상담", () => consult(name), "primary"));
  host.append(node("h3", "교수님 수업"));
  if (!c.lessons.length)
    host.append(
      node(
        "p",
        "학교 화면으로 변환된 수업은 아직 없습니다. 선수 개념이나 기존 관제탑의 원자료부터 확인해주세요.",
      ),
    );
  for (const l of c.lessons)
    row(
      host,
      `${l.date} · ${l.title}`,
      `${l.week || "?"}주차 · 원문 수업 연결`,
      () => startLesson(l.id),
      "학습",
    );
  host.append(node("h3", "필요 개념"));
  const courseConcepts = node("div", undefined, "concept-list");
  for (const n of c.nodes)
    courseConcepts.append(button(n.name, () => startLesson("node:" + n.id)));
  host.append(courseConcepts);
  host.append(node("h3", "선수 기초"));
  const required = new Set(learningPath(c, catalog.basics, null, true).path);
  const relevant = catalog.basics.filter((n) => required.has("node:" + n.id));
  if (!relevant.length)
    host.append(
      node(
        "p",
        "이 과목에 연결된 선수 기초가 없습니다. 상담에서 필요한 개념을 정할 수 있습니다.",
      ),
    );
  const basicConcepts = node("div", undefined, "concept-list");
  for (const n of relevant)
    basicConcepts.append(button(n.name, () => startLesson("node:" + n.id)));
  host.append(basicConcepts);
  const others = node("details"),
    otherTitle = node("summary", "다른 기초 개념 찾아보기");
  others.append(otherTitle);
  for (const n of catalog.basics.filter((n) => !required.has("node:" + n.id)))
    row(others, n.name, n.level, () => startLesson("node:" + n.id), "배우기");
  host.append(others);
  host.append(button("과목별 자료·교수 규칙", () => showSources(name)));
  const practice = node("section");
  host.append(practice);
  fetch("../_private/submit.json", {credentials: "same-origin", cache: "no-store"})
    .then(response => { if (!response.ok) throw new Error("연습 자료를 불러오지 못했습니다."); return response.json(); })
    .then(registry => {
      if (!practice.isConnected) return;
      const seen = new Set();
      const files = [...(registry.practices || []), ...(registry.files || []).filter(isStudyPractice)]
        .filter(file => file.course === name && !seen.has(file.file) && seen.add(file.file));
      if (files.length) practice.append(node("h3", "혼자 풀기"));
      for (const file of files) { const p = node("p"); p.append(link(file.label, file.file)); practice.append(p); }
    })
    .catch(error => { if (practice.isConnected) practice.append(node("p", error.message)); });
}
$("resume").onclick = () => {
  const plan = state.plans[course];
  if (lastLesson) startLesson(lastLesson);
  else if (plan) startLesson(plan.start);
  else consult(course);
};
async function startLesson(id, options = {}) {
  try { await mission?.save(); await growth?.stop('pause'); } catch (error) { status(error.message, true); return; }
  const generation = ++requestGeneration;
  try {
    status("수업을 준비하고 있습니다.");
    const lesson = await api("lesson?id=" + encodeURIComponent(id));
    if (generation !== requestGeneration) return;
    let targetIndex = options.index ?? Math.min(state.progress[id]?.index || 0, lesson.steps.length - 1);
    if(options.stepId){const at=lesson.steps.findIndex(s=>s.id===options.stepId);if(at<0)throw new Error('이전 문제 위치를 확인해주세요.');targetIndex=at;}
    if (options.resume) { const restored = lesson.steps.findIndex(s=>s.id===options.resume.stepId); if(restored<0)throw new Error('이전 단계가 변경되었습니다. 수업 자료를 확인해주세요.'); targetIndex=restored; }
    const questions = lesson.steps.map((s,i)=>s.kind==='quiz'?i:-1).filter(i=>i>=0);
    const examples = lesson.steps.map((s,i)=>s.kind==='example'?i:-1).filter(i=>i>=0);
    missionIndices = options.purpose !== "exam" ? null : (questions.length ? questions : examples.length ? examples : lesson.steps.map((s,i)=>i)).slice(0,3);
    if (missionIndices && !missionIndices.includes(targetIndex)) targetIndex=missionIndices[0];
    await saveSession(lesson, targetIndex, {newSession: !options.resume, purpose: options.purpose || 'tutoring', assisted: options.assisted ?? !!options.resume?.assisted, returnTo: options.returnTo || null});
    if (generation !== requestGeneration) return;
  workspace?.hide();
  for (const id of ['mainArea','learningArea','progressArea','materialsArea','attendanceArea','assignmentArea']) $(id)?.setAttribute('aria-pressed',String(id==='learningArea'));
  if ($("integratedWorkspace")) $("integratedWorkspace").hidden = true;
  $("progress").hidden = true;
  $("progressArea").setAttribute("aria-pressed", "false");
  $("learningArea").setAttribute("aria-pressed", "true");
  $("assignmentArea").setAttribute("aria-pressed", "false");
  $("assignments").hidden = true;
    current = lesson;
    document.querySelector(".school").dataset.mode = "classroom";
    lastLesson = id;
    if (lesson.course !== "공통") course = lesson.course;
    index = targetIndex;
    if (missionIndices && !missionIndices.includes(index)) index = missionIndices[0];
    assisted = false;
    passed = false;
    closeDialogs();
    $("lobby").hidden = true;
    $("room").hidden = false;
    $("dialogue").hidden = false;
    $("scene").className = "scene classroom";
    $("location").textContent = course;
    $("roomLabel").textContent = lesson.title;
    await renderStep(options.camera);
    status("수업 준비 완료");
  } catch (error) {
    status(error.message, true);
  }
}
function saveSession(lesson, targetIndex, options = {}) {
  const task = sessionQueue.catch(() => {}).then(async () => {
    const request = {id: options.newSession ? eventId() : activeSession?.id || eventId(),
      revision: activeSession?.revision || 0, course: lesson.course, lessonId: lesson.id,
      stepId: lesson.steps[targetIndex].id, purpose: options.purpose || activeSession?.purpose || 'tutoring',
      assisted: options.assisted ?? assisted,
      returnTo: Object.hasOwn(options, 'returnTo') ? options.returnTo : activeSession?.returnTo || null};
    try { activeSession = await api('session', request); return activeSession; }
    catch(error) {
      status(error.message, true);
      const host = panel('수업 저장 확인');
      host.append(node('p', error.message), node('p', '현재 풀이와 입력은 이 화면에 보존했습니다. 최신 수업을 확인한 뒤 이동할 수 있습니다.'),
        button('최신 수업 확인', async () => { activeSession = await api('session'); current=null; closeDialogs(); workspace.open('main'); }));
      throw error;
    }
  });
  sessionQueue = task;
  return task;
}
// 교실 자리에 앉으면 이어 하던 수업, 없으면 안 푼 가장 이른 회차를 바로 시작한다.
async function sitDown(name) {
  const c = catalog?.courses.find((x) => x.name === name);
  const today = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" }).format(new Date());
  const pick = pickLesson({ course: name, lessons: c?.lessons || [], events: [...state.events, ...pending], today, session: activeSession });
  if (!pick) { status(`${name} 교실에 연결된 수업이 아직 없습니다.`, true); return; }
  if (pick.resume) return resumeSession();
  await startLesson(pick.id, { purpose: "tutoring" });
}
async function resumeSession() {
  const saved = activeSession;
  if (!saved) return workspace.open('learning');
  if(saved.returnTo){const base=await api('lesson?id='+encodeURIComponent(saved.returnTo.lessonId));const at=base.steps.findIndex(s=>s.id===saved.returnTo.stepId);if(at>=0)pausedLesson={lesson:base.id,index:at,course:base.course};}
  await startLesson(saved.lessonId, {resume: saved, purpose: saved.purpose, returnTo: saved.returnTo});
}
function returnReference() {
  return current ? {lessonId: current.id, stepId: current.steps[index].id,
    phase: current.steps[index].kind, workKey: current.id+'/'+current.steps[index].id,
    assisted: true, conversationCursor: [...state.events].reverse().find(e=>e.kind==='question')?.id || ''} : null;
}
function closeDialogs() {
  document.querySelector(".secondary-menu").open = false;
  if ($("panel").open) $("panel").close();
  $("chat").hidden = true;
  $("dialogue").classList.remove("chatting");
}
function board(title, body, kind, annotation) {
  const host = $("board");
  let limit = innerHeight < 760 ? 260 : 440,
    pages = splitText(body, limit),
    page = 0;
  function draw() {
    host.replaceChildren(
      node("div", kind, "caption"),
      node("h1", title),
      node("div", pages[page], "content"),
    );
    if (annotation) host.append(node("div", annotation, "annotation"));
    if (pages.length > 1) {
      const controls = node("div", undefined, "board-pages"),
        prev = button("앞 판서", () => {
          page--;
          draw();
        }),
        next = button("다음 판서", () => {
          page++;
          draw();
        });
      prev.disabled = page === 0;
      next.disabled = page === pages.length - 1;
      controls.append(
        prev,
        node("span", `${page + 1} / ${pages.length} · 내용 분할`),
        next,
      );
      host.append(controls);
    }
    renderMath(host);
    requestAnimationFrame(() => {
      if (
        host.scrollHeight > host.clientHeight + 2 &&
        innerWidth > 650 &&
        limit > 100
      ) {
        limit = Math.floor(limit * 0.7);
        const smaller = splitText(body, limit);
        if (smaller.length > pages.length) {
          pages = smaller;
          page = 0;
          draw();
        }
      }
    });
  }
  draw();
  clearTimeout(resizeBoard);
  window.onresize = () => {
    clearTimeout(resizeBoard);
    resizeBoard = setTimeout(() => {
      limit = innerHeight < 760 ? 260 : 440;
      pages = splitText(body, limit);
      page = Math.min(page, pages.length - 1);
      draw();
    }, 150);
  };
  if (window.visualViewport) window.visualViewport.onresize = window.onresize;
}

function currentEvidence() {
  return [...state.events, ...pending]
    .filter(
      (e) =>
        e.kind === "answer" &&
        e.lesson === current.id &&
        e.step === current.steps[index].id,
    )
    .at(-1);
}
async function renderStep(camera) {
  if (!current) return;
  stopVoice();
  const step = current.steps[index];
  rememberScreen({lesson:current.id,step:step.id});
  for (const id of ["simpler", "source", "generate"]) $(id).disabled = false;
  assisted = activeSession?.lessonId===current.id && activeSession?.stepId===step.id ? !!activeSession.assisted : false;
  passed = false;
  const prior = currentEvidence();
  if (prior) {
    assisted = assisted || !!prior.assisted || !prior.correct;
    if (prior.correct) passed = true;
  }
  $("stepLabel").textContent = missionIndices ? `${missionIndices.indexOf(index)+1} / ${missionIndices.length} · 미션` : `${index + 1} / ${current.steps.length}`;
  $("choices").replaceChildren();
  const kind =
    {
      reflection: "생각해보기",
      understand: "이해할 것",
      remember: "기억할 것",
      example: "풀이 연결",
      quiz: "직접 확인",
    }[step.kind] || "학습";
  board(
    step.title,
    step.body,
    kind,
    current.warnings.length
      ? "자료 주의사항 있음 · 이 수업의 근거에서 확인"
      : "",
  );
  $("speech").textContent =
    step.kind === "quiz"
      ? "직접 골라주세요. 틀리면 어디서 막혔는지 짚고 다시 풀어볼게요."
      : step.kind === "example" ? "판서를 한 단계씩 보면서 같이 풀어봅시다. 지금 식 다음에 무엇을 해야 할지 설명해보세요. 막히면 ‘더 쉽게’로 한 단계만 같이 볼 수 있어요." : step.speech ||
        "읽은 뒤 이 내용을 자신의 말로 설명해보세요. 모르는 부분은 바로 질문해주세요.";
  if (step.options) {
    step.options.forEach((option, i) => {
      const b = button(option, () => answer(i));
      b.disabled = ["rejected", "pending"].includes(current.review?.status);
      $("choices").append(b);
    });
    renderMath($("choices"));
    if (passed)
      $("speech").textContent =
        "이 문제는 전에 해결했습니다. 다시 풀거나 다음으로 갈 수 있어요.";
  } else
    $("choices").append(
      button("설명할 수 있어요 · 읽음 확인", () => {
        record({
          kind: "read",
          course,
          lesson: current.id,
          step: step.id,
          nodes: step.nodes || [],
        });
        passed = true;
        $("next").disabled = false;
        $("speech").textContent =
          "읽음으로 기록했습니다. 실제 이해는 뒤의 확인 문제로 구분할게요.";
      }),
    );
  if (!step.options)
    $("choices").append(
      button("내 말로 설명하고 피드백 받기", () => openChat("", "teachback")),
    );
  $("next").disabled = !passed;
  $("next").textContent =
    (missionIndices ? index === missionIndices.at(-1) : index === current.steps.length - 1) ? "미션 결과 보기" : "다음 도전";
  $("back").disabled = index === 0;
  $("hint").disabled = !step.options;
  if (["rejected", "pending"].includes(current.review?.status)) {
    $("speech").textContent =
      "내용 검토가 완료되지 않은 교재입니다. 학습 기록을 중지했으니 검토 의견을 확인하거나 원자료로 돌아가주세요.";
    $("choices").replaceChildren(
      button("검토 의견 보기", () => $("source").click()),
      button("원자료 수업으로 돌아가기", () => startLesson(current.baseLesson)),
    );
    $("next").disabled = true;
    $("hint").disabled = true;
  }
  if (pausedLesson && (current.id !== pausedLesson.lesson||index!==pausedLesson.index))
    $("choices").append(button("원래 문제로 돌아가기", returnToQuestion));
  await mission?.mount();
  await space?.seated(course,step.kind,camera);
  await growth?.step(activeSession);
}
async function returnToQuestion() {
  const saved = pausedLesson;
  if (!saved) return;
  await startLesson(saved.lesson,{index:saved.index,assisted:true,returnTo:null,camera:'notebook'});
  if (current?.id !== saved.lesson) return;
  index = saved.index;
  course = saved.course;
  assisted = true;
  pausedLesson = null;
  record({ kind: "review", course, action: "returned", lesson: current.id });
  record({ kind: "position", course, lesson: current.id, index });
}
async function supplementWork(){
  if(!current)return;
  const saved={lesson:current.id,index,course},step=current.steps[index];
  const available=[...catalog.basics,...catalog.courses.flatMap(c=>c.nodes)];
  const concepts=available.filter(n=>(step.nodes||current.nodes||[]).includes(n.id));
  const host=panel('풀이에 필요한 개념 보충');
  host.append(node('p','오류 진단과 아래 개념을 대조해 필요한 부분을 선택하세요. 학습 후 원래 문제로 돌아올 수 있습니다.'));
  const targets=[...new Set(concepts.flatMap(n=>[...(n.prereq||[]),n.id]))].map(id=>available.find(n=>n.id===id)).filter(Boolean);
  for(const target of targets)host.append(button(target.name,async()=>{
    await mission.save();pausedLesson=saved;
    record({kind:'review',course,action:'prerequisite',returnLesson:saved.lesson,returnIndex:saved.index});await flush();
    if(!pending.length)await startLesson('node:'+target.id,{assisted:true,returnTo:{lessonId:saved.lesson,stepId:step.id}});
  }));
  if(!targets.length){
    let at=current.steps.findIndex(s=>['understand','remember','example'].includes(s.kind)&&(s.nodes||[]).some(id=>(step.nodes||[]).includes(id)));
    if(at<0)at=current.steps.findIndex(s=>['understand','remember','example'].includes(s.kind));
    if(at>=0)host.append(button('이 수업의 개념 설명 다시 보기',async()=>{pausedLesson=saved;await startLesson(saved.lesson,{index:at,assisted:true,returnTo:{lessonId:saved.lesson,stepId:step.id}});}));
    else host.append(node('p','연결된 개념 자료가 없습니다. 문제 조건을 스앵님과 먼저 확인해주세요.'));
  }
}
function answer(choice) {
  const step = current.steps[index],
    correct = choice === step.answer;
  $("choices").querySelectorAll('button').forEach((b,i)=>{b.removeAttribute('data-result');if(i===choice)b.dataset.result=correct?'correct':'wrong';});
  if (mission) mission.feedback(correct?'correct':'retry');
  else window.dispatchEvent(new CustomEvent('saeng',{detail:{react:correct?'correct':'wrong'}}));
  record({
    kind: "answer",
    course,
    lesson: current.id,
    step: step.id,
    choice,
    correct,
    assisted,
    nodes: step.nodes || [],
  });
  if (correct) {
    passed = true;
    $("next").disabled = false;
    $("speech").textContent = assisted
      ? "도움을 받아 해결했습니다. 다음 복습에서는 힌트 없이 다시 확인해요."
      : "좋아요. 이 문제는 혼자 해결했어요. 다음 도전으로 이어가볼까요?";
  } else {
    assisted = true;
    passed = false;
    $("next").disabled = true;
    $("speech").textContent =
      "아직 맞지 않습니다. 먼저 문제에 주어진 조건과 구해야 할 양을 나눠 적어볼까요? 힌트가 필요하면 한 단계씩 같이 보겠습니다.";
    const available = [
      ...catalog.basics,
      ...catalog.courses.flatMap((c) => c.nodes),
    ];
    const target = available.find((n) => step.nodes?.includes(n.id));
    const prerequisite = (current.prereq || target?.prereq || []).find((id) =>
      available.some((n) => n.id === id),
    );
    if (prerequisite && !$("choices").querySelector(".remedial"))
      $("choices").append(
        button(
          "선수 개념부터 보충하기",
          async () => {
            pausedLesson = pausedLesson || {
              lesson: current.id,
              index,
              course,
            };
            record({
              kind: "review",
              course,
              action: "prerequisite",
              returnLesson: pausedLesson.lesson,
              returnIndex: pausedLesson.index,
            });
            await flush();
            if (!pending.length) startLesson("node:" + prerequisite,{returnTo:returnReference()});
          },
          "remedial",
        ),
      );
  }
  renderMath($("speech"));
}
$("hint").onclick = () => {
  assisted = true;
  saveSession(current,index,{assisted:true}).catch(()=>{});
  openChat('정답이나 전체 풀이를 공개하지 말고, 지금 문제에서 시작할 힌트 하나와 내가 답할 질문 하나만 주세요.', 'hint');
};
$("simpler").onclick = () => {
  assisted = true;
  saveSession(current,index,{assisted:true}).catch(()=>{});
  openChat('지금 문제의 첫 단계 하나만 같이 풀고, 내가 이어서 할 다음 단계를 질문해주세요. 정답과 전체 해설은 아직 주지 마세요.', 'together');
};
$("back").onclick = async () => {
  try { await mission?.save(); } catch { return; }
  if (index > 0) {
    const target=missionIndices ? missionIndices[Math.max(0,missionIndices.indexOf(index)-1)] : index-1;
    try { await saveSession(current,target,{assisted:false}); } catch { return; }
    requestGeneration++;
    index=target;
    record({ kind: "position", course, lesson: current.id, index });
    renderStep();
  }
};
$("next").onclick = async () => {
  if (!passed) return;
  try { await mission?.save(); } catch { return; }
  requestGeneration++;
  if (missionIndices ? index !== missionIndices.at(-1) : index < current.steps.length - 1) {
    const target=missionIndices ? missionIndices[missionIndices.indexOf(index)+1] : index+1;
    try { await saveSession(current,target,{assisted:false}); } catch { return; }
    index=target;
    record({ kind: "position", course, lesson: current.id, index });
    renderStep();
  } else finish();
};
async function finish() {
  try{await growth?.stop('finish');}catch(e){status(e.message,true);}
  const host = panel("미션 완료 · 다음 도전");
  const answers = evidenceSummary(
    [...state.events, ...pending].filter((e) => e.lesson === current.id),
  );
  host.append(node("p", current.title));
  const celebration=node('div',undefined,'mission-result');
  celebration.append(node('span',answers.independent?'도전 성공':'미션 기록 완료','mission-result-tag'),node('h2',answers.independent?`${answers.independent}문제를 혼자 해결했어요.`:'오늘 시도한 풀이를 남겼어요.'),node('p',answers.retry?'막힌 문제를 한 번 더 풀면 다음 도전이 쉬워져요.':'스앵님과 다음 도전으로 이어가볼까요?'));
  host.append(celebration);
  const summary = node("div", undefined, "summary");
  for (const [label, value] of [
    ["확인 문제", answers.tested],
    ["독립 해결", answers.independent],
    ["도움 사용", answers.assisted],
    ["재시도 필요", answers.retry],
  ]) {
    const el = node("span", label);
    el.prepend(node("strong", String(value)));
    summary.append(el);
  }
  host.append(
    summary,
    node(
      "p",
      "읽음과 문제 풀이를 따로 기록했습니다. 독립 정답도 이 문항의 증거이며 전체 시험범위 이해를 뜻하지 않습니다.",
      "notice",
    ),
    button("복습 계획 보기", showReviews),
    button("과목 교실로", () => showCourse(course)),
  );
  const path = state.plans[course]?.path || [],
    position = path.indexOf(current.id),
    next = path[position + 1];
  if (next && position >= 0) {
    host.append(
      button(
        "계획의 다음 학습으로",
        async () => {
          const plan = { ...state.plans[course], start: next };
          record({ kind: "plan", plan });
          await flush();
          if (!pending.length) startLesson(next);
        },
        "primary",
      ),
    );
  }
  if (answers.retry || answers.assisted)
    host.append(
      node(
        "p",
        "도움받거나 막힌 문제는 다음 내용을 배우기 전에 다시 설명해보세요. 복습 기록도 따로 남습니다.",
        "notice",
      ),
    );
}
async function consult(name = course) {
  if ($("integratedWorkspace")) $("integratedWorkspace").hidden = true;
  $("progress").hidden = $("assignments").hidden = true;
  $("progressArea").setAttribute("aria-pressed", "false");
  $("assignmentArea").setAttribute("aria-pressed", "false");
  $("learningArea").setAttribute("aria-pressed", "true");
  document.querySelector(".secondary-menu").open = false;
  document.querySelector(".school").dataset.mode = "office";
  course = name;
  requestGeneration++;
  current = null;
  $("scene").className = "scene office";
  $("lobby").hidden = true;
  $("room").hidden = false;
  $("dialogue").hidden = false;
  $("location").textContent = "상담실";
  $("roomLabel").textContent = "김주영 스앵님 상담실";
  $("stepLabel").textContent = "시작점 상담";
  board(
    "어디부터 시작할까요?",
    "목표와 공부 여건을 듣고, 직접 답한 내용을 바탕으로 출발점을 정합니다.",
    "첫 상담",
  );
  $("speech").textContent =
    "처음부터 모르는 게 당연해요. 지금 아는 것부터 차근차근 확인할게요.";
  $("choices").replaceChildren(button("상담 이어가기", () => consult(name)));
  for (const id of ["back", "next", "hint", "simpler", "source", "generate"])
    $(id).disabled = true;
  const host = panel("김주영 스앵님 상담실");
  host.append(
    node(
      "p",
      "목표와 공부 여건을 먼저 듣고, 짧은 진단으로 출발점을 제안할게요.",
    ),
  );
  const form = node("form");
  const fields = node("div", undefined, "fields");
  function field(label, id, type, value) {
    const box = node("div"),
      l = node("label", label);
    l.htmlFor = id;
    const input = node(type === "select" ? "select" : "input");
    input.id = id;
    input.name = id;
    if (type !== "select") input.type = type;
    input.value = value || "";
    box.append(l, input);
    fields.append(box);
    return input;
  }
  const cselect = field("과목", "consultCourse", "select");
  for (const c of catalog.courses) {
    const o = node("option", c.name);
    o.value = c.name;
    cselect.append(o);
  }
  cselect.value = name;
  const goal = field(
    "이번 목표",
    "goal",
    "text",
    state.plans[name]?.goal || "시험범위를 이해하고 수업 문제를 혼자 풀기",
  );
  goal.required = true;
  goal.maxLength = 300;
  const minutes = field(
    "한 번에 공부할 시간(분)",
    "minutes",
    "number",
    String(state.plans[name]?.minutes || 25),
  );
  minutes.min = 5;
  minutes.max = 180;
  minutes.required = true;
  const background = field("현재 상태", "background", "select");
  for (const text of [
    "처음부터 배우기",
    "기호는 알지만 풀이가 막힘",
    "문제 풀이와 복습 중심",
  ]) {
    const o = node("option", text);
    o.value = text;
    background.append(o);
  }
  form.append(
    fields,
    node("label", "가장 어려운 점"),
    Object.assign(node("textarea"), {
      name: "concern",
      maxLength: 1200,
      placeholder: "기호부터 모르겠어요 / 설명은 알겠는데 혼자 못 풀겠어요.",
    }),
    button("짧은 진단 시작", () => {}, "primary"),
  );
  form.lastChild.type = "submit";
  host.append(form);
  form.onsubmit = async (event) => {
    event.preventDefault();
    const preferences = {
      course: cselect.value,
      goal: goal.value.trim(),
      minutes: Number(minutes.value),
      background: background.value,
      concern: form.elements.concern.value,
    };
    course = preferences.course;
    const c = catalog.courses.find((c) => c.name === course);
    let diagnostic = [];
    const selected = (c.nodes[0]?.prereq || [])
      .map((id) => [...catalog.basics, ...c.nodes].find((n) => n.id === id))
      .filter(Boolean);
    if (!selected.length && c.nodes.length)
      selected.push(...catalog.basics.slice(0, 2));
    if (c.nodes[0]) selected.push(c.nodes[0]);
    let position = 0;
    async function ask() {
      const target = selected[position];
      if (!target) return propose();
      try {
        const lesson = await api(
          "lesson?id=" + encodeURIComponent("node:" + target.id),
        );
        const quiz = lesson.steps.find((s) => s.kind === "quiz");
        if (!quiz) {
          position++;
          return ask();
        }
        host.replaceChildren(
          node("h2", `시작 진단 · ${position + 1} / ${selected.length}`),
          node("p", quiz.body),
        );
        const choices = node("div");
        for (let i = 0; i < quiz.options.length; i++)
          choices.append(
            button(quiz.options[i], () => submit(i === quiz.answer)),
          );
        choices.append(button("아직 모르겠어요", () => submit(false)));
        host.append(
          choices,
          node("p", "한 문항으로 전체 실력을 단정하지 않습니다.", "notice"),
        );
        renderMath(host);
        function submit(correct) {
          diagnostic.push({ node: target.id, correct });
          position++;
          ask();
        }
      } catch (error) {
        status(error.message, true);
      }
    }
    function propose() {
      const start = recommendStart(
        c,
        c.nodes.length ? catalog.basics : [],
        diagnostic,
      );
      host.replaceChildren(
        node("h2", "이렇게 시작해봐요."),
        node("p", c.strategy),
        node("p", start.reason, "notice"),
      );
      const route = learningPath(
        c,
        catalog.basics,
        start.id,
        preferences.background === "처음부터 배우기",
      );
      if (route.path.length) start.id = route.path[0];
      const target = [...catalog.basics, ...c.nodes].find(
        (n) => "node:" + n.id === start.id,
      );
      if (route.missing.length)
        host.append(
          node(
            "p",
            "아직 보충 자료가 없는 선수 개념: " +
              route.missing.join(", ") +
              ". 해당 개념은 수업 중 따로 질문하며 확인해야 합니다.",
            "notice",
          ),
        );
      host.append(
        node(
          "p",
          "기초에서 수업 자료까지 " +
            route.path.length +
            "개 학습 묶음을 연결했습니다. 한 번에 전부 진행하지 않습니다.",
        ),
      );
      host.append(
        node("h3", target?.name || "첫 수업 자료"),
        node("p", `${preferences.minutes}분씩 · ${preferences.goal}`),
        node(
          "p",
          "설명 → 직접 답 → 막힌 부분 보충 → 도움 없는 풀이 → 지연 복습 순서로 진행합니다.",
        ),
      );
      if (start.id)
        host.append(
          button(
            "이 계획 적용하고 시작",
            async () => {
              record({
                kind: "plan",
                plan: {
                  ...preferences,
                  start: start.id,
                  diagnostic,
                  path: route.path,
                  missing: route.missing,
                  strategy: c.strategy,
                },
              });
              await flush();
              if (!pending.length) startLesson(start.id);
            },
            "primary",
          ),
        );
      else host.append(button("원자료 확인", () => showSources(course)));
      host.append(button("상담 다시 하기", () => consult(course)));
    }
    ask();
  };
}
$("consult").onclick = () => consult();
function showReviews() {
  const host = panel("복습할 것");
  const events = [...state.events, ...pending];
  const due = reviewQueue(events);
  if (!due.length)
    host.append(
      node(
        "p",
        "지금 복습할 문항은 없습니다. 도움받은 문항은 하루 뒤, 독립 해결 문항은 3일 뒤 다시 확인합니다.",
      ),
    );
  for (const e of due)
    row(
      host,
      e.course + " · " + e.step,
      e.correct && !e.assisted
        ? "독립 해결 뒤 지연 확인"
        : "도움·오답 뒤 재확인",
      async () => {
        await startLesson(e.lesson);
        if (current?.id === e.lesson) {
          index = current.steps.findIndex((s) => s.id === e.step);
          if (index < 0) index = 0;
          renderStep();
          passed = false;
          assisted = false;
          $("next").disabled = true;
        }
      },
      "다시 풀기",
    );
}
$("review").onclick = showReviews;
$("records").onclick = () => {
  const host = panel("학생 기록");
  const courseRecords = node("section");
  courseRecords.append(node("h3", "수업·진도 기록")); host.append(courseRecords);
  fetch("/api/study/state", {credentials:"same-origin",cache:"no-store"})
    .then(async response => { if(!response.ok) throw new Error("수업 기록을 불러오지 못했습니다."); return (await response.json()).state; })
    .then(original => {
      if (!courseRecords.isConnected) return;
      const term = original?.terms?.find(t => t.id === original.activeTermId);
      for (const c of term?.courses || []) {
        const entries = (term.sessions || []).filter(s => s.courseId === c.id && (s.progress || s.memo || s.reviewed));
        const weeks = Object.values(c.weekNotes || {}).filter(n => n.range || n.summary);
        row(courseRecords, c.name, `회차 기록 ${entries.length} · 주차 기록 ${weeks.length}`, () => openIntegrated(c.name + " · 학습 기록", "course", {course:c.name}), "보기");
      }
    }).catch(error => { if(courseRecords.isConnected) courseRecords.append(node("p",error.message)); });
  host.append(node("h3", "문제 풀이·질문·학습 계획"));
  for (const c of catalog.courses) {
    const summary = evidenceSummary(state.events, c.name);
    if (!summary.tested && !state.plans[c.name]) continue;
    row(
      host,
      c.name,
      `확인 ${summary.tested} · 독립 ${summary.independent} · 도움 ${summary.assisted} · 재시도 ${summary.retry}`,
      () => showCourse(c.name),
      "과목",
    );
  }
  host.append(
    node(
      "p",
      "학생의 풀이 증거와 교수님 자료·규칙은 따로 저장합니다. 모델을 바꿔도 이 기록을 다시 읽습니다.",
      "notice",
    ),
  );
  for (const event of state.events
    .filter((e) => ["answer", "question", "plan"].includes(e.kind))
    .slice(-30)
    .reverse())
    row(
      host,
      event.kind === "plan"
        ? event.plan.course + " · 계획 적용"
        : event.course +
            " · " +
            (event.kind === "question"
              ? "질문"
              : event.correct
                ? "정답"
                : "재시도"),
      event.kind === "question"
        ? event.question
        : event.kind === "plan"
          ? event.plan.goal
          : (event.assisted ? "도움 사용" : "도움 없이 응답") +
            " · " +
            event.step,
    );
  host.append(node("h3", "생성한 보충 수업"));
  for (const event of state.events
    .filter((e) => e.feedback)
    .slice(-12)
    .reverse())
    row(
      host,
      event.course + " · 서술형 관찰",
      event.feedback.misconception || event.feedback.notice,
      async () => {
        await startLesson(event.lesson);
        if (current?.id === event.lesson) {
          index = event.index;
          renderStep();
          openChat("", "teachback");
        }
      },
      "다시 설명",
    );
  for (const draft of Object.values(state.drafts || {}))
    row(
      host,
      draft.title,
      draft.course +
        " · " +
        draft.engine +
        " · " +
        ({
          reviewed: "다른 엔진 검토 통과",
          rejected: "검토 오류 · 학습 중지",
          pending: "내용 검토 대기",
        }[draft.review?.status] || "내용 미검증"),
      () => startLesson(draft.id),
      "다시 열기",
    );
  host.append(
    button("전체 기록 내려받기", () => {
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(state, null, 2)], {
          type: "application/json",
        }),
      );
      const a = node("a");
      a.href = url;
      a.download = "그린라이트-학습기록.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }),
  );
};
async function showSources(name = course) {
  try {
    const report = await api("sources?course=" + encodeURIComponent(name));
    const host = panel(name + " · 자료와 교수 규칙");
    host.append(
      node(
        "p",
        `${report.asOf || "시각 미기록"} 기준 · ${report.notice}`,
        "notice",
      ),
    );
    host.append(node("h3", "교수님 자료"));
    for (const source of report.links) {
      const p = node("p");
      p.append(link(source.label, source.href));
      host.append(p);
    }
    host.append(
      button("누락 의심 위치와 녹음 대조 대기", () => showAudit(name)),
    );
    host.append(node("h3", "회차별 확보 현황"));
    for (const r of report.rows)
      row(
        host,
        r.date,
        Object.entries(r.counts)
          .map(
            ([key, value]) =>
              `${{ rec: "녹음", board: "판서", photo: "사진", summary: "정리", pre: "강의자료", derived: "변환본" }[key] || key} ${value}`,
          )
          .join(" · ") +
          "\n" +
          (r.concerns.join(" / ") || "색인 확보") +
          " · " +
          r.semantic,
      );
    for (const p of report.pending)
      host.append(node("p", `${p.date} · 클로바 대조 대기`, "notice"));
    host.append(node("h3", "교수님 특징 · 풀이 · 평가 기준"));
    for (const note of report.professorNotes || []) {
      const details = node("details");
      details.append(
        node("summary", note.source + " · 기존 분석 · 미검증"),
        node("pre", note.text),
      );
      host.append(details);
    }
    const rules = state.rules[name] || [];
    if (!rules.length)
      host.append(
        node(
          "p",
          "근거를 붙여 기록한 규칙이 아직 없습니다. 기존 관제탑의 교수 분석도 함께 확인해주세요.",
        ),
      );
    for (const rule of rules)
      row(
        host,
        rule.claim,
        `${{ confirmed: "확정", inferred: "추정", unverified: "미확인" }[rule.certainty]} · ${rule.date || "날짜 미기록"} · ${rule.source}`,
      );
    const form = node("form");
    form.innerHTML =
      '<label for="ruleClaim">특징·풀이 방식·주의점</label><input id="ruleClaim" required maxlength="1200"><label for="ruleSource">출처(자료명·페이지 또는 녹음 시각)</label><input id="ruleSource" required maxlength="600"><div class="fields"><div><label for="ruleDate">근거 날짜</label><input id="ruleDate" type="date" required></div><div><label for="certainty">근거 등급</label><select id="certainty"><option value="unverified">미확인</option><option value="inferred">추정</option><option value="confirmed">확정</option></select></div></div><button type="submit">근거와 함께 기록</button>';
    const categoryLabel = node("label", "기록 종류");
    categoryLabel.htmlFor = "ruleCategory";
    const category = node("select");
    category.id = "ruleCategory";
    for (const [value, label] of [
      ["style", "교수님 특징"],
      ["exam", "출제 유형"],
      ["solution", "풀이 순서"],
      ["caution", "주의점"],
    ]) {
      const option = node("option", label);
      option.value = value;
      category.append(option);
    }
    form.prepend(categoryLabel, category);
    form.onsubmit = async (e) => {
      e.preventDefault();
      record({
        kind: "rule",
        rule: {
          course: name,
          claim: form.querySelector("#ruleClaim").value,
          source: form.querySelector("#ruleSource").value,
          date: form.querySelector("#ruleDate").value,
          certainty: form.querySelector("#certainty").value,
          category: category.value,
        },
      });
      await flush();
      if (!pending.length) showSources(name);
    };
    host.append(form);
  } catch (error) {
    status(error.message, true);
  }
}
$("library").onclick = () => showSources();
$("source").onclick = () => {
  if (!current) return;
  const host = panel("이 수업의 근거");
  for (const warning of current.warnings)
    host.append(node("p", warning, "notice"));
  if (current.review) {
    row(
      host,
      "별도 내용 검토 · " + current.review.engine,
      current.review.notice,
    );
    for (const issue of current.review.issues)
      row(host, issue.step, issue.reason);
    const reviewLesson = current.id;
    const retry = button("다른 엔진으로 내용 검토 다시 하기", async () => {
      retry.disabled = true;
      try {
        const result = await api("review", { lesson: reviewLesson });
        state = await api("state");
        current = await api("lesson?id=" + encodeURIComponent(reviewLesson));
        renderStep();
        status(result.notice, result.status !== "reviewed");
        $("source").click();
      } catch (error) {
        status(error.message, true);
      } finally {
        retry.disabled = false;
      }
    });
    host.append(retry);
  }
  for (const source of current.sources) {
    const p = node("p");
    p.append(link(source.label, source.href));
    host.append(p);
  }
  host.append(
    node(
      "p",
      "기존 수업·개념 카드를 의미 단위로 변환했습니다. 읽음 확인과 문제 정답은 서로 다른 증거입니다.",
    ),
  );
  host.append(button("회차 확보·교수 규칙 보기", () => showSources()));
};
$("settings").onclick = async () => {
  try {
    capabilities = await api("capabilities");
  } catch (error) {
    status(error.message, true);
  }
  const host = panel("김주영 스앵님 두뇌");
  host.append(button("학기·과목·기록 설정", () => openIntegrated("학기·과목·기록 설정", "set")));
  host.append(button("이 기기의 화면 점검", () => deviceCheck(host)));
  host.append(
    node(
      "p",
      "자동은 최근 사용량 계측에서 잔여 한도 비율이 큰 모델부터 선택합니다. 계측이 없거나 오래됐으면 기본 순서를 사용하며, 연결·한도 오류 때 다른 모델로 이어갑니다. 절대 토큰 수 비교는 아닙니다.",
      "notice",
    ),
  );
  const label = node("label", "모델 계열");
  for (const [engine, quota] of Object.entries(capabilities.quota || {}))
    row(
      host,
      engine,
      quota.remainingPercent === null
        ? "최근 사용량 계측 없음"
        : `사용량 창의 잔여 한도 ${quota.remainingPercent}% · ${new Date(quota.asOf * 1000).toLocaleTimeString("ko-KR")} 계측`,
    );
  label.htmlFor = "engine";
  const select = node("select");
  select.id = "engine";
  for (const [value, text] of [
    ["auto", "자동 전환"],
    ["claude", "Claude"],
    ["codex", "Codex / GPT"],
  ]) {
    const option = node("option", text);
    option.value = value;
    select.append(option);
  }
  select.value = state.settings.engine;
  host.append(
    label,
    select,
    button("적용", () => {
      record({
        kind: "settings",
        engine: select.value,
        voice: state.settings.voice,
      });
      flush();
    }),
  );
  host.append(
    node("h3", "음성"),
    node(
      "p",
      capabilities.voice
        ? "Fish 음성 연결 설정을 확인했습니다."
        : "Fish API 키와 음성 reference ID가 서버에 설정되지 않았습니다. 음성 자격정보는 화면에 입력하거나 노출하지 않습니다.",
    ),
  );
  host.append(
    node(
      "p",
      "모델에는 현재 수업·출처·계획·최근 풀이·질문 기록을 함께 전달합니다. 준비된 수업과 정답 확인은 모델 연결 없이 계속 사용할 수 있습니다.",
    ),
  );
};
function deviceCheck(host) {
  const board = $("board"),
    rect = board.getBoundingClientRect();
  row(
    host,
    "현재 화면",
    `${innerWidth} × ${innerHeight} · ${navigator.maxTouchPoints ? "터치 입력 지원" : "터치 입력 미감지"}`,
  );
  row(
    host,
    "기능 지원",
    `대화창 ${typeof HTMLDialogElement !== "undefined" ? "지원" : "미지원"} · 수식 ${typeof renderMathInElement === "function" ? "준비됨" : "연결 확인 필요"} · 음성 ${capabilities.voice ? "연결 설정 있음" : "연결 설정 없음"}`,
  );
  row(
    host,
    "현재 판서",
    current && rect.height
      ? board.scrollHeight > board.clientHeight + 2 ||
        board.scrollWidth > board.clientWidth + 2
        ? "내용이 판서 영역보다 큽니다. 화면 방향과 문제 단계를 알려주세요."
        : "현재 판서가 영역 안에 들어갑니다."
      : "수업을 연 다음 점검해주세요.",
  );
  host.append(
    node(
      "p",
      "현재 화면의 기능 점검입니다. 실제 iPad Safari에서는 수업·키보드·음성 재생도 직접 확인해야 합니다.",
    ),
  );
}
function openChat(prefill = "", mode = "question") {
  chatMode = mode;
  document.querySelector('label[for="question"]').textContent =
    mode === "teachback"
      ? "지금 배운 내용을 자신의 말로 설명해주세요"
      : "질문 또는 직접 설명한 답";
  if ($("chat").hidden) {
    $("chatMessages").replaceChildren();
    for (const event of state.events
      .filter(
        (e) =>
          e.kind === "question" &&
          e.course === course &&
          (!current || e.lesson === current.id),
      )
      .slice(-6)) {
      $("chatMessages").append(
        node("p", event.question, "student"),
        node(
          "p",
          event.answer
            .replace(/\*\*([^*]+)\*\*/g, "$1")
            .replace(/^#{1,6}\s+/gm, ""),
        ),
      );
      if (event.feedback)
        renderFeedback(event.feedback, {
          lesson: event.lesson,
          index: event.index,
          course: event.course,
          id: event.id,
        });
    }
    renderMath($("chatMessages"));
    if (!$("chatMessages").childElementCount)
      $("chatMessages").append(
        node(
          "p",
          "지금 판서에서 이해한 내용을 자신의 말로 설명해보세요. 어디서 막혔는지 함께 짚어볼게요.",
        ),
      );
    $("chat").hidden = false;
    $("dialogue").classList.add("chatting");
    if (current) renderStep();
  }
  if (prefill) $("question").value = prefill;
  $("question").focus();
}
$("askToggle").onclick = () => openChat();
$("closeChat").onclick = () => {
  $("chat").hidden = true;
  $("dialogue").classList.remove("chatting");
  stopVoice();
  renderStep();
};
$("chatForm").onsubmit = async (event) => {
  event.preventDefault();
  if (chatBusy) return;
  const question = $("question").value.trim();
  if (!question) return;
  assisted = true;
  await flush();
  if (pending.length) {
    $("chatStatus").textContent = "학습 기록 저장을 마친 뒤 질문을 보내주세요.";
    return;
  }
  chatBusy = true;
  $("send").disabled = true;
  $("question").value = "";
  $("chatMessages").append(node("p", question, "student"));
  const reply = node("p", "스앵님이 생각하고 있습니다.");
  $("chatMessages").append(reply);
  $("chatStatus").textContent = "현재 판서와 학생 기록을 함께 전달합니다.";
  const context = {
    course,
    lesson: current?.id,
    index,
    question,
    mode: chatMode,
    id: eventId(),
  };
  const generation=requestGeneration, sessionId=activeSession?.id;
  try {
    if(current)await saveSession(current,index,{assisted:true});
    const answer = await api("coach", {...context,sessionId});
    if(generation!==requestGeneration || sessionId!==activeSession?.id || current?.id!==context.lesson || index!==context.index)return;
    reply.textContent = answer.answer
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/^#{1,6}\s+/gm, "");
    renderMath(reply);
    if (answer.feedback) renderFeedback(answer.feedback, context);
    if (capabilities.voice)
      $("chatMessages").append(
        button("이 설명 듣기", () => speak(answer.answer)),
      );
    $("chatStatus").textContent =
      answer.engine +
      (answer.fallback ? " · 자동 전환" : "") +
      " · 답변 기록 저장";
    state = await api("state");
  } catch (error) {
    if(generation!==requestGeneration)return;
    if(!$("question").value)$("question").value=question;
    reply.textContent = error.message;
    reply.className = "error";
    $("chatStatus").textContent =
      "질문이 완료되지 않았습니다. 준비된 수업과 힌트는 사용할 수 있습니다.";
  } finally {
    chatBusy = false;
    $("send").disabled = false;
  }
};
function renderFeedback(feedback, context) {
  const note = node("div", undefined, "feedback");
  note.append(
    node(
      "p",
      `${{ supported: "설명에서 근거를 확인했어요", misconception: "다시 확인할 부분이 있어요", uncertain: "아직 판단하기 어려워요" }[feedback.assessment]}\n${feedback.misconception || feedback.notice}`,
    ),
  );
  if (feedback.studentQuote)
    note.append(node("small", `내 답: “${feedback.studentQuote}”`));
  const uncertainCount=[...state.events].filter(e=>e.kind==='question'&&e.lesson===context.lesson&&e.index===context.index&&e.feedback?.assessment==='uncertain').length + (feedback.assessment==='uncertain'&&!state.events.some(e=>e.id===context.id)?1:0);
  if(feedback.assessment==='uncertain' && uncertainCount>=2) {
    note.append(node('p','판단을 보류했습니다. 풀이를 보존했으며 정답이나 이해 완료로 기록하지 않습니다. 문제 조건이나 사진을 보완해주세요.'));
    if(current?.id===context.lesson && !['rejected','pending'].includes(current.review?.status)) {
      const target=current.steps.findIndex((s,i)=>i>context.index&&s.kind==='quiz'&&s.options);
      if(target>=0)note.append(button('원자료의 확인 문제로 계속',()=>startLesson(current.id,{index:target,returnTo:activeSession?.returnTo})));
    }
  } else note.append(button("다시 설명하기", () => openChat("", "teachback")));
  if (feedback.target)
    note.append(
      button(feedback.target.label, async () => {
        if (chatBusy) return;
        const saved = {
          lesson: context.lesson,
          index: context.index,
          course: context.course || course,
        };
        if (feedback.target.lesson !== saved.lesson) {
          record({
            kind: "review",
            course: saved.course,
            action: "prerequisite",
            returnLesson: saved.lesson,
            returnIndex: saved.index,
          });
          await flush();
          if (pending.length) return;
        }
        await startLesson(feedback.target.lesson,{index:Number.isInteger(feedback.target.index)?feedback.target.index:undefined,returnTo:feedback.target.lesson!==saved.lesson?returnReference():activeSession?.returnTo});
        if (current?.id !== feedback.target.lesson) return;
        if (feedback.target.lesson !== saved.lesson) pausedLesson = saved;
        if (Number.isInteger(feedback.target.index)) {
          index = feedback.target.index;
          if (current.id === saved.lesson && index === saved.index)
            assisted = true;
          record({ kind: "position", course, lesson: current.id, index });
          renderStep();
        }
        else if (pausedLesson) renderStep();
      }),
    );
  $("chatMessages").append(note);
}
let audio = null;
let audioUrl = null;
let voiceRequest = null;
function stopVoice() {
  voiceRequest?.abort();
  voiceRequest = null;
  if (audio) audio.pause();
  audio = null;
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = null;
  $("teacher").classList.remove("speaking");
  $("listen").textContent = "설명 듣기";
}
async function speak(text) {
  if (!capabilities.voice) {
    status("Fish 음성 키와 reference ID 설정이 필요합니다.", true);
    return;
  }
  stopVoice();
  const request = new AbortController();
  voiceRequest = request;
  $("listen").textContent = "음성 준비 중";
  try {
    const response = await fetch("/api/school/voice", {
      method: "POST",
      credentials: "same-origin",
      signal: request.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 1600) }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "음성 생성 연결을 확인해주세요.");
    }
    const blob = await response.blob();
    if (request.signal.aborted) return;
    audioUrl = URL.createObjectURL(blob);
    audio = new Audio(audioUrl);
    audio.onended = stopVoice;
    audio.onerror = () => {
      stopVoice();
      status("음성을 재생하지 못했습니다. 다시 눌러주세요.", true);
    };
    await audio.play();
    $("teacher").classList.add("speaking");
    $("listen").textContent = "음성 멈추기";
  } catch (error) {
    if (error.name === "AbortError" || request.signal.aborted) return;
    stopVoice();
    status(
      error.name === "NotAllowedError"
        ? "브라우저가 재생을 막았습니다. 설명 듣기를 다시 눌러주세요."
        : error.message,
      true,
    );
  }
}
async function showAudit(name) {
  try {
    const report = await api("sources?course=" + encodeURIComponent(name)),
      host = panel(name + " · 누락 의심 위치");
    host.append(
      node(
        "p",
        "기존 정리본에서 녹음 중단·재구성·미확인이 명시된 위치를 찾았습니다. 표현이 다르다는 이유만으로 실제 누락을 확정하지 않습니다.",
        "notice",
      ),
    );
    let count = 0;
    for (const session of report.rows)
      for (const excerpt of session.excerpts || []) {
        row(
          host,
          `${session.date} · ${excerpt.source}:${excerpt.line}`,
          excerpt.text,
        );
        count++;
      }
    if (!count)
      host.append(
        node(
          "p",
          "명시된 중단·재구성 문구를 찾지 못했습니다. 내용이 완전하다는 뜻은 아닙니다.",
        ),
      );
    for (const item of report.pending)
      row(host, item.date, "클로바 녹음 대조 대기");
    host.append(node("h3", "녹음 전사문과 정리본의 내용 대조"));
    host.append(
      node(
        "p",
        "원문 인용과 줄 번호를 확인한 결과만 표시합니다. 결과는 누락 의심이며, 녹음 자체를 들은 판정은 아닙니다.",
      ),
    );
    const display = (result, target) => {
      target.replaceChildren(node("p", result.notice, "notice"));
      if (result.review) target.append(node("p", result.review));
      if (result.withheld?.length)
        target.append(
          node(
            "p",
            `원문 근거가 부족하거나 설명이 맞지 않은 후보 ${result.withheld.length}건을 보류했습니다.`,
          ),
        );
      for (const coverage of result.coverage)
        row(
          target,
          coverage.source,
          coverage.complete
            ? `전체 ${coverage.totalLines}줄 대조 대상으로 전달`
            : `일부만 대조 · 원문 ${coverage.totalLines}줄`,
        );
      if (!result.findings.length)
        target.append(
          node(
            "p",
            result.withheld?.length
              ? "후보의 근거를 확인하지 못해 판정을 보류했습니다. 원문을 직접 확인해주세요."
              : "대조한 범위에서 의심 사항을 찾지 못했습니다. 전체 자료의 완전성을 확정한 것은 아닙니다.",
          ),
        );
      for (const finding of result.findings) {
        row(
          target,
          {
            missing_suspected: "누락 의심",
            conflict: "내용 충돌",
            uncertain_transcription: "전사 정확성 확인 필요",
          }[finding.kind],
          finding.explanation,
        );
        for (const citation of finding.citations)
          row(
            target,
            `${citation.source}:${citation.line}${citation.page ? ` · PDF ${citation.page}쪽` : ""}`,
            citation.quote,
          );
      }
    };
    for (const session of report.rows) {
      if (!session.counts.rec) continue;
      const resultHost = node("div");
      const stored = state.audits?.[name + ":" + session.date];
      if (stored) display(stored, resultHost);
      const compare = button(session.date + " · 내용 대조", async () => {
        compare.disabled = true;
        resultHost.replaceChildren(
          node("p", "원문과 정리본을 대조하고 근거 위치를 확인하고 있습니다."),
        );
        try {
          const result = await api("compare", {
            course: name,
            date: session.date,
          });
          state = await api("state");
          display(result, resultHost);
        } catch (error) {
          resultHost.replaceChildren(node("p", error.message, "error"));
        } finally {
          compare.disabled = false;
        }
      });
      host.append(compare, resultHost);
    }
    host.append(node("h3", "판서·사진 원본과 AI 판독"));
    for (const session of report.rows.filter(
      (s) => s.counts.board || s.counts.photo,
    ))
      host.append(
        button(session.date + " · 사진 확인", () =>
          showVisual(name, session.date),
        ),
      );
  } catch (error) {
    status(error.message, true);
  }
}
async function showVisual(name, date) {
  const host = panel(`${name} · ${date} 사진`);
  host.append(button("자료실로 돌아가기", () => showSources(name)));
  try {
    const listing = await api(
      `visual-files?${new URLSearchParams({ course: name, date })}`,
    );
    host.append(node("p", listing.notice, "notice"));
    if (!listing.files.length)
      host.append(
        node(
          "p",
          "이 회차 폴더에 직접 확인할 사진 파일이 없습니다. PDF와 기존 자료실도 확인해주세요.",
        ),
      );
    for (const file of listing.files) {
      const item = node("details"),
        result = node("div");
      item.append(node("summary", file.name));
      const image = node("img");
      image.alt = file.name;
      image.loading = "lazy";
      image.className = "source-photo";
      image.src = `/api/school/visual-image?${new URLSearchParams({ course: name, date, file: file.name })}`;
      const imageError = node("div", undefined, "source-photo-error");
      imageError.hidden = true;
      imageError.append(
        node(
          "p",
          "사진을 불러오지 못했습니다. 연결과 로그인을 확인하고 다시 시도해주세요.",
        ),
        button("사진 다시 불러오기", () => {
          imageError.hidden = true;
          image.hidden = false;
          const retry = new URL(image.src);
          retry.searchParams.set("retry", Date.now());
          image.src = retry.href;
        }),
      );
      image.onerror = () => {
        image.hidden = true;
        imageError.hidden = false;
      };
      image.onload = () => {
        image.hidden = false;
        imageError.hidden = true;
      };
      item.append(image, imageError);
      const display = (audit) => {
        result.replaceChildren(
          node("p", audit.notice, "notice"),
          node("pre", audit.transcription),
        );
        for (const uncertainty of audit.uncertain)
          result.append(node("p", "판독 불확실: " + uncertainty));
        for (const concern of audit.comparison)
          row(
            result,
            concern.region + " · 대조 의심",
            concern.explanation +
              (concern.summaryQuote
                ? `\n정리본: ${concern.summaryQuote}`
                : "\n정리본에서 찾지 못한 내용 · 원본 확인 필요"),
          );
        if (!audit.summaryAvailable)
          result.append(node("p", "정리본이 없어 사진 판독만 진행했습니다."));
        if (!audit.summaryComplete)
          result.append(
            node("p", "정리본 일부만 전달되어 누락 대조 결과를 보류했습니다."),
          );
      };
      const stored = state.audits?.[`visual:${name}/${date}/${file.name}`];
      if (stored) display(stored);
      const inspect = button("이 사진 판독·대조", async () => {
        inspect.disabled = true;
        result.replaceChildren(node("p", "원본 사진을 확인하고 있습니다."));
        try {
          const audit = await api("inspect", {
            course: name,
            date,
            file: file.name,
          });
          state = await api("state");
          display(audit);
        } catch (error) {
          result.replaceChildren(node("p", error.message, "error"));
        } finally {
          inspect.disabled = false;
        }
      });
      item.append(inspect, result);
      host.append(item);
    }
  } catch (error) {
    host.append(node("p", error.message, "error"));
  }
}
$("generate").onclick = async () => {
  if (!current) return;
  const base = current.id,
    host = panel("맞춤 보충 수업");
  host.append(
    node(
      "p",
      "현재 원자료와 학생 기록으로 설명·예제·독립 문제를 따로 생성합니다. 원문 수업을 덮어쓰지 않습니다. 생성 문제의 정확성은 추가 검토가 필요합니다.",
      "notice",
    ),
  );
  const create = button(
    "보충 수업 생성",
    async () => {
      create.disabled = true;
      const progress = node("p", "원자료를 바탕으로 생성하고 있습니다.");
      host.append(progress);
      try {
        await flush();
        const draft = await api("generate", { lesson: base, course });
        state = await api("state");
        progress.textContent = "생성 완료 · " + draft.engine;
        host.append(node("h3", draft.title));
        for (const warning of draft.warnings)
          host.append(node("p", warning, "notice"));
        if (draft.review) {
          row(
            host,
            "별도 내용 검토 · " + draft.review.engine,
            draft.review.notice,
          );
          for (const issue of draft.review.issues)
            row(host, issue.step, issue.reason);
        }
        for (const step of draft.steps)
          row(
            host,
            `${{ understand: "이해", remember: "기억", example: "예제", quiz: "직접 문제" }[step.kind]} · ${step.title}`,
            step.body,
          );
        const openDraft = button(
          "출처·검증 상태를 확인하고 이 수업 열기",
          () => startLesson(draft.id),
          "primary",
        );
        openDraft.disabled = ["rejected", "pending"].includes(
          draft.review?.status,
        );
        host.append(openDraft);
        renderMath(host);
      } catch (error) {
        progress.textContent = error.message;
        progress.className = "error";
        create.disabled = false;
      }
    },
    "primary",
  );
  host.append(create);
};
$("listen").onclick = async () => {
  if (audio || voiceRequest) return stopVoice();
  const step = current?.steps[index];
  await speak(
    step
      ? `${step.title}. ${step.body}. ${step.speech || ""}`
      : $("speech").textContent,
  );
};
$("teacher").onload = () => ($("teacher").hidden = false);
if ($("teacher").complete && $("teacher").naturalWidth)
  $("teacher").hidden = false;
async function boot() {
  const entry=new URLSearchParams(location.search);
  try {
    [catalog, state, capabilities, activeSession] = await Promise.all([
      api("catalog"),
      api("state"),
      api("capabilities"),
      api("session"),
    ]);
    if (TEST && !capabilities.testMode)
      throw new Error("검증 모드 서버 적용이 필요합니다.");
    if(activeSession?.returnTo){const base=await api('lesson?id='+encodeURIComponent(activeSession.returnTo.lessonId));const at=base.steps.findIndex(s=>s.id===activeSession.returnTo.stepId);if(at>=0)pausedLesson={lesson:base.id,index:at,course:base.course};}
    const last = [...state.events]
      .reverse()
      .find((e) => e.course || e.plan?.course);
    if (last) course = last.course || last.plan.course;
    const remedial = [...state.events]
      .reverse()
      .find(
        (e) =>
          e.kind === "review" &&
          ["prerequisite", "returned"].includes(e.action),
      );
    if (!activeSession && remedial?.action === "prerequisite")
      pausedLesson = {
        lesson: remedial.returnLesson,
        index: remedial.returnIndex,
        course: remedial.course,
      };
    const position = [...state.events]
      .reverse()
      .find((e) => e.kind === "position");
    if (position && position.at > (state.plans[course]?.acceptedAt || 0))
      lastLesson = position.lesson;
    for (const id of [
      "home",
      "learningArea",
      "mainArea",
      "progressArea",
      "materialsArea",
      "attendanceArea",
      "assignmentArea",
      "courses",
      "library",
      "records",
      "settings",
      "resume",
      "consult",
      "review",
    ])
      $(id).disabled = false;
    $("listen").disabled = !capabilities.voice;
    $("listen").title = capabilities.voice
      ? "Fish 음성으로 대사 듣기"
      : "서버에 Fish 음성 연결 설정이 필요합니다.";
    const room=entry.get('room'),lessonId=entry.get('lesson'),stepId=entry.get('step');
    if(entry.get('world')==='walking'){await workspace.open('main');await space.walk(entry.get('subject')||undefined);}
    else if(lessonId){const resume=activeSession?.lessonId===lessonId&&(!stepId||activeSession.stepId===stepId)?activeSession:null;await startLesson(lessonId,{stepId:stepId||undefined,resume,purpose:resume?.purpose,returnTo:resume?.returnTo,camera:entry.get('camera')});}
    else await workspace.open(['main','learning','materials','progress','attendance','assignments'].includes(room)?room:'main');
    status("학교 연결 완료");
  } catch (error) {
    $("today").textContent =
      "학교 서버를 준비하지 못했습니다. " + error.message;
    status(error.message, true);
    $("courseDoors").replaceChildren(button("다시 연결", boot));
  } finally {delete document.querySelector('.school').dataset.booting;$('bootScreen')?.remove();}
}
async function retest(id){
  try{await mission.save();status('조건이 다른 확인 문제를 준비하고 검토합니다.');const lesson=await api('generate',{lesson:id,course});state=await api('state');if(lesson.review?.status!=='reviewed')throw new Error('새 문제 검토가 완료되지 않았습니다. 원자료의 확인 문제를 사용해주세요.');await startLesson(lesson.id,{purpose:'exam',assisted:false});}catch(e){status(e.message,true);}
}
mission = createMission({api,context:()=>current?{lesson:current,step:current.steps[index],index,assisted,total:missionIndices?.length,number:missionIndices?missionIndices.indexOf(index)+1:undefined}:null,feedback:(text,kind)=>{$('speech').textContent=text;mission.feedback(kind);renderMath($('speech'));},retest,remedial:supplementWork,helped:()=>{assisted=true;saveSession(current,index,{assisted:true}).catch(()=>{});},allowNext:()=>{status('풀이 피드백은 관찰 기록입니다. 확인 문제의 정답 검증은 별도로 진행합니다.');}});
growth = createGrowth({api,status,panel,start:startLesson,retest,courses:()=>workspace?.data?.courses||[],home:()=>workspace.open('main')});
workspace = createWorkspace({api,status,panel,record,screen:rememberScreen,close:closeDialogs,catalog:()=>catalog,events:()=>[...state.events,...pending],walk:name=>space&&ROOMS.some(r=>r.name===name)?space.walk(name):showCourse(name),rooms:()=>ROOMS.map(r=>r.name),evidence:name=>evidenceSummary([...state.events,...pending],name),history:()=>state.events.filter(e=>e.kind==='question'&&e.mode==='consultation'),refreshLearning:async()=>{state=await api('state');},session:()=>activeSession,resume:resumeSession,tutorPlan:(host,data,refresh)=>growth.tutorPlan(host,data,refresh),leave:async()=>{space?.hide();await mission.save();await growth.stop('pause');if(current)await saveSession(current,index);stopVoice();closeDialogs();++requestGeneration;},lobby:()=>{legacyLobbyMode=true;showLobby();legacyLobbyMode=false;},assignments:showAssignments,start:startLesson,course:showCourse,integrated:openIntegrated,library:()=>$('library').onclick(),mode:mode=>mission.setMode(mode)});
space = createSpace({status,panel,screen:rememberScreen,view:camera=>{if(current)rememberScreen({lesson:current.id,step:current.steps[index].id,camera});},home:()=>workspace.open('main'),pause:async()=>{await mission.save();await growth.stop('pause');},ask:()=>openChat('','hint'),select:sitDown});
const DOCK_LINES={correct:'좋아요. 그 감각 그대로 다음 문제.',wrong:'괜찮아요. 조건부터 다시 나눠 적어봐요.',stuck:'막힌 데서 같이 볼게요.',deadline:'마감이 가까워요. 과제부터 끝내요.'};
// 표정은 얼굴로만 보여준다. 대사와 동작 버튼에는 상태 이름을 붙이지 않는다.
const DOCK_EMOTIONS=new Set(['상냥','상냥함','다정','엄격','단호','차분','중립','미소','놀람','칭찬','기쁨','화남','neutral','smile','strict','surprise','praise']);
const hiddenEmotionLabels=new WeakSet();
function hideDockEmotionLabels(){
  for(const el of $('dock').querySelectorAll('span,small,b,em,p,div')){
    if(el.children.length||el.id==='dockLine'||el.id==='dockFace')continue;
    if(DOCK_EMOTIONS.has(el.textContent.trim())){el.style.setProperty('display','none','important');hiddenEmotionLabels.add(el);}
    else if(hiddenEmotionLabels.has(el)){el.style.removeProperty('display');hiddenEmotionLabels.delete(el);}
  }
}
hideDockEmotionLabels();
new MutationObserver(hideDockEmotionLabels).observe($('dock'),{childList:true,characterData:true,subtree:true});
let dockSaeng=null;
attachSaeng($('dockFace')).then(s=>{dockSaeng=s;});
window.addEventListener('saeng',e=>{
  const {react,line}=e.detail||{};
  if(react)dockSaeng?.react(react);
  const text=line||DOCK_LINES[react];
  if(text){$('dockLine').textContent=text;dockSaeng?.speak(text);}
});
// 수업 중에는 도크가 칠판 옆 스앵님 자리로 들어가고, 나오면 화면 아래로 돌아온다.
new MutationObserver(()=>{const inClass=document.querySelector('.school').dataset.mode==='classroom',seat=document.querySelector('.teacher'),dock=$('dock');if(inClass&&seat&&dock.parentElement!==seat)seat.append(dock);else if(!inClass&&dock.parentElement===seat)document.querySelector('.school').insertBefore(dock,document.querySelector('.school > footer'));}).observe(document.querySelector('.school'),{attributes:true,attributeFilter:['data-mode']});
new MutationObserver(()=>{const t=$('speech').textContent.trim();if(t&&!$('dialogue').hidden)dockSaeng?.speak(t.slice(0,80));}).observe($('speech'),{childList:true,characterData:true,subtree:true});
$('dockTalk').onclick=()=>{if(document.querySelector('.school').dataset.mode==='classroom'){$('askToggle').click();return;}workspace.open('main').then(()=>document.querySelector('.main-tutor textarea')?.focus());};
$('home').onclick=()=>workspace.open('main');
$('mainArea').onclick=()=>workspace.open('main');
$('learningArea').onclick=()=>workspace.open('learning');
$('progressArea').onclick=()=>workspace.open('progress');
$('materialsArea').onclick=()=>workspace.open('materials');
$('attendanceArea').onclick=()=>workspace.open('attendance');
$('assignmentArea').onclick=()=>workspace.open('assignments');
boot();
