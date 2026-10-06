import {
  evidenceSummary,
  reviewQueue,
  recommendStart,
  splitText,
  learningPath,
} from "./learning.js";
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
let resizeBoard;
let chatMode = "question";
const eventId = () => crypto.randomUUID();
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
function row(host, title, detail, action, label = "열기") {
  const item = node("div", undefined, "list-row"),
    text = node("div");
  text.append(node("b", title), node("small", detail));
  item.append(text);
  if (action) item.append(button(label, action));
  host.append(item);
}
function showLobby() {
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
  $("location").textContent = "학교 로비";
  $("today").textContent =
    "기호부터 교수님 수업 문제까지, 한 단계씩 확인합니다.";
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
$("assignmentArea").onclick = () => showAssignments();
let assignmentFilter = "전체", assignmentStatus = "진행";
async function showAssignments() {
  const generation = ++requestGeneration;
  stopVoice(); closeDialogs(); current = null;
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
      for (const label of ["진행", "제출 확인", "전체"]){
        const b = button(label, () => { assignmentStatus = label; draw(); });
        b.setAttribute("aria-pressed", String(assignmentStatus === label)); tools.append(b);
      }
      const help = node("details"); help.append(node("summary", "ⓘ"), node("p", data.notice)); tools.append(help);
      tools.append(link("과제 상태 관리 ↗", "index.html?view=classic")); host.append(tools);
      const rows = data.rows.filter(r => (assignmentFilter === "전체" || r.course === assignmentFilter) && (assignmentStatus === "전체" || r.submitted === (assignmentStatus === "제출 확인")));
      host.append(node("p", `${rows.length}건 · 자료 기준 ${data.asOf || "확인 필요"}`));
      if (!rows.length) host.append(node("p", "해당 과제가 없습니다."));
      let category = null;
      for (const task of rows) {
        const group = task.category || "assignment";
        if (category !== group) { host.append(node("h2", group === "assignment" ? "수업 과제" : "과제 관련 할 일")); category = group; }
        const card = node("article", undefined, "assignment-card");
        card.append(node("small", task.course), node("h2", task.title));
        card.append(node("p", `마감 ${task.due ? task.due.replace("T", " ") : "미확인"} · ${task.submission}${task.workDone ? " · 작업 완료" : ""}`));
        const files = node("div", undefined, "assignment-files");
        for (const file of task.files) files.append(link(file.label, file.href));
        card.append(files);
        if (catalog.courses.some(c => c.name === task.course))
          card.append(button("필요한 개념 학습", () => { showLobby(); showCourse(task.course); }));
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
}
$("resume").onclick = () => {
  const plan = state.plans[course];
  if (lastLesson) startLesson(lastLesson);
  else if (plan) startLesson(plan.start);
  else consult(course);
};
async function startLesson(id) {
  $("assignments").hidden = true;
  const generation = ++requestGeneration;
  try {
    status("수업을 준비하고 있습니다.");
    const lesson = await api("lesson?id=" + encodeURIComponent(id));
    if (generation !== requestGeneration) return;
    current = lesson;
    document.querySelector(".school").dataset.mode = "classroom";
    lastLesson = id;
    if (lesson.course !== "공통") course = lesson.course;
    index = Math.min(state.progress[id]?.index || 0, lesson.steps.length - 1);
    assisted = false;
    passed = false;
    closeDialogs();
    $("lobby").hidden = true;
    $("room").hidden = false;
    $("dialogue").hidden = false;
    $("scene").className = "scene classroom";
    $("location").textContent = course;
    $("roomLabel").textContent = lesson.title;
    renderStep();
    status("수업 준비 완료");
  } catch (error) {
    status(error.message, true);
  }
}
function closeDialogs() {
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
function renderStep() {
  if (!current) return;
  stopVoice();
  const step = current.steps[index];
  for (const id of ["simpler", "source", "generate"]) $(id).disabled = false;
  assisted = false;
  passed = false;
  const prior = currentEvidence();
  if (prior) {
    assisted = !!prior.assisted || !prior.correct;
    if (prior.correct) passed = true;
  }
  $("stepLabel").textContent = `${index + 1} / ${current.steps.length}`;
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
      : step.speech ||
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
    index === current.steps.length - 1 ? "수업 정리" : "다음";
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
  if (pausedLesson && current.id !== pausedLesson.lesson)
    $("choices").append(button("원래 문제로 돌아가기", returnToQuestion));
}
async function returnToQuestion() {
  const saved = pausedLesson;
  if (!saved) return;
  await startLesson(saved.lesson);
  if (current?.id !== saved.lesson) return;
  index = saved.index;
  course = saved.course;
  assisted = true;
  pausedLesson = null;
  record({ kind: "review", course, action: "returned", lesson: current.id });
  record({ kind: "position", course, lesson: current.id, index });
  renderStep();
}
function answer(choice) {
  const step = current.steps[index],
    correct = choice === step.answer;
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
      : "힌트 없이 해결했습니다. 조건이 다른 문제와 며칠 뒤 복습에서도 확인해요.";
  } else {
    assisted = true;
    passed = false;
    $("next").disabled = true;
    $("speech").textContent =
      "아직 맞지 않습니다. " +
      (step.why || "문제의 조건과 기호를 다시 확인해주세요.");
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
            if (!pending.length) startLesson("node:" + prerequisite);
          },
          "remedial",
        ),
      );
  }
  renderMath($("speech"));
}
$("hint").onclick = () => {
  assisted = true;
  const step = current.steps[index];
  $("speech").textContent =
    step.why ||
    "문제의 조건을 하나씩 적고, 어떤 정의나 법칙을 써야 할지 먼저 골라보세요.";
  renderMath($("speech"));
};
$("simpler").onclick = () => {
  assisted = true;
  openChat(
    "지금 판서를 처음 배우는 사람에게 쉬운 비유로 설명하고, 확인 질문 하나를 주세요.",
  );
};
$("back").onclick = () => {
  if (index > 0) {
    requestGeneration++;
    index--;
    record({ kind: "position", course, lesson: current.id, index });
    renderStep();
  }
};
$("next").onclick = () => {
  if (!passed) return;
  requestGeneration++;
  if (index < current.steps.length - 1) {
    index++;
    record({ kind: "position", course, lesson: current.id, index });
    renderStep();
  } else finish();
};
function finish() {
  const host = panel("오늘의 수업 정리");
  const answers = evidenceSummary(
    [...state.events, ...pending].filter((e) => e.lesson === current.id),
  );
  host.append(node("p", current.title));
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
    const categoryLabel = node("label","기록 종류");categoryLabel.htmlFor="ruleCategory";
    const category=node("select");category.id="ruleCategory";
    for(const [value,label] of [["style","교수님 특징"],["exam","출제 유형"],["solution","풀이 순서"],["caution","주의점"]]){const option=node("option",label);option.value=value;category.append(option);}
    form.prepend(categoryLabel,category);
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
  try {
    const answer = await api("coach", context);
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
  note.append(button("다시 설명하기", () => openChat("", "teachback")));
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
        await startLesson(feedback.target.lesson);
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
      item.append(image);
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
        openDraft.disabled = ["rejected", "pending"].includes(draft.review?.status);
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
  try {
    [catalog, state, capabilities] = await Promise.all([
      api("catalog"),
      api("state"),
      api("capabilities"),
    ]);
    if (TEST && !capabilities.testMode)
      throw new Error("검증 모드 서버 적용이 필요합니다.");
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
    if (remedial?.action === "prerequisite")
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
    showLobby();
    status("학교 연결 완료");
  } catch (error) {
    $("today").textContent =
      "학교 서버를 준비하지 못했습니다. " + error.message;
    status(error.message, true);
    $("courseDoors").replaceChildren(button("다시 연결", boot));
  }
}
boot();
