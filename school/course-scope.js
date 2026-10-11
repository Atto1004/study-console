// 기존 단원 색인의 날짜·장 번호·키워드만으로 수업을 분류한다.
export function groupCourseLessons(course) {
  const units = (course.units || []).map(unit => ({...unit, lessons: []}));
  const other = {title: '단원 확인이 필요한 수업', lessons: []};
  const generated = {title: '자체 제작 시험 대비', lessons: []};
  const matches = (pattern, text) => { try { return pattern && new RegExp(pattern, 'i').test(text); } catch { return false; } };
  for (const lesson of [...(course.lessons || [])].sort((a,b) => a.date.localeCompare(b.date))) {
    if (lesson.generated) { generated.lessons.push(lesson); continue; }
    const unit = units.find(u => u.dates?.includes(lesson.date)) || units.find(u => matches(u.num, lesson.title)) || units.find(u => matches(u.kw, lesson.title));
    (unit || other).lessons.push(lesson);
  }
  return [...units, other, generated].filter(unit => unit.lessons.length);
}

export function groupLessonTopics(steps) {
  const topics = [];
  steps.forEach((step, index) => {
    const title = step.title || '수업 주제';
    const previous = topics.at(-1);
    if (previous?.title === title) previous.count++;
    else topics.push({title, stepId: step.id, index, count: 1, kind: step.kind});
  });
  return topics;
}
