// 같은 학습 규칙을 웹·태블릿·텍스트 화면에서 사용합니다.
export function latestAnswers(events, course) {
  const latest = new Map();
  for (const event of events)
    if (event.kind === "answer" && (!course || event.course === course))
      latest.set(`${event.lesson}/${event.step}`, event);
  return [...latest.values()];
}
export function evidenceSummary(events, course) {
  const answers = latestAnswers(events, course);
  return {
    tested: answers.length,
    independent: answers.filter((e) => e.correct && !e.assisted).length,
    assisted: answers.filter((e) => e.correct && e.assisted).length,
    retry: answers.filter((e) => !e.correct).length,
  };
}
export function reviewQueue(events, now = Date.now() / 1000) {
  return latestAnswers(events)
    .filter((e) => now >= e.at + (e.correct && !e.assisted ? 3 : 1) * 86400)
    .sort((a, b) => a.at - b.at);
}
export function recommendStart(course, basics, diagnostic) {
  const missed = diagnostic.find((d) => !d.correct);
  if (missed)
    return {
      id: "node:" + missed.node,
      reason:
        "진단에서 막힌 선수 개념을 먼저 확인합니다. 이 진단으로 전체 실력을 단정하지 않습니다.",
    };
  const first = course.nodes[0] || basics[0];
  return first
    ? {
        id: "node:" + first.id,
        reason:
          "기호와 기본 개념을 짧게 확인한 뒤 교수님 수업 자료로 연결합니다.",
      }
    : course.lessons[0]
      ? {
          id: course.lessons[0].id,
          reason: "연결된 첫 수업부터 자료와 평가 요구를 확인합니다.",
        }
      : {
          id: null,
          reason:
            "변환된 수업이 없습니다. 원자료와 과제 요구부터 확인해야 합니다.",
        };
}
export function learningPath(course, basics, start, beginner = false) {
  const nodes = new Map([...basics, ...course.nodes].map((n) => [n.id, n]));
  const path = [],
    visited = new Set(),
    missing = new Set();
  function visit(id) {
    if (visited.has(id)) return;
    visited.add(id);
    const current = nodes.get(id);
    if (!current) {
      missing.add(id);
      return;
    }
    for (const dependency of current.prereq || []) visit(dependency);
    path.push("node:" + id);
  }
  if (beginner && start?.startsWith("node:")) visit(start.slice(5));
  if (start && !path.includes(start)) path.push(start);
  const first = course.nodes.findIndex((n) => "node:" + n.id === start);
  for (const item of course.nodes.slice(Math.max(0, first))) visit(item.id);
  for (const item of course.lessons)
    if (!path.includes(item.id)) path.push(item.id);
  return { path, missing: [...missing] };
}
export function splitText(text, limit = 330) {
  const formulas = [],
    source = String(text || "");
  let marker = "\uE000";
  while (source.includes(marker)) marker += "\uE000";
  // 문장·빈 줄 분할보다 먼저 수식을 보호하며 원래 길이를 유지합니다.
  const protectedText = source.replace(
    /\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]*\$/g,
    (formula) => {
      const token = (marker + formulas.length + "\uE001").padEnd(
        formula.length,
        "\uE001",
      );
      formulas.push({ token, formula });
      return token;
    },
  );
  const paragraphs = protectedText.split(/\n\s*\n/),
    pages = [];
  for (const paragraph of paragraphs) {
    if (paragraph.length <= limit) {
      if (paragraph.trim()) pages.push(paragraph);
      continue;
    }
    // 수식은 중간에서 자르지 않고 별도 판서로 유지합니다.
    const pieces = paragraph.split(/(?<=[.!?。]|다\.)\s+|\n/);
    let page = "";
    for (const piece of pieces) {
      const units =
        piece.length > limit
          ? piece.match(
              /\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]*\$|[^\s]+\s*/g,
            ) || [piece]
          : [piece];
      for (const unit of units) {
        if (page && page.length + unit.length > limit) {
          pages.push(page.trim());
          page = "";
        }
        page += (page && units.length === 1 ? "\n" : "") + unit;
      }
    }
    if (page) pages.push(page.trim());
  }
  return (pages.length ? pages : [""]).map((page) => {
    for (const { token, formula } of formulas)
      page = page.split(token).join(formula);
    return page;
  });
}
