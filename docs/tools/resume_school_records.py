from pathlib import Path
p=Path(__file__).resolve().parents[2]/'school/school.js'
s=p.read_text(encoding='utf-8')
s=s.replace("kind:'position',lesson:current.id,index", "kind:'position',course,lesson:current.id,index")
s=s.replace("for(const id of ['home','courses','library','records','settings','resume','consult','review'])", "const last=[...state.events].reverse().find(e=>e.course||e.plan?.course);if(last)course=last.course||last.plan.course;const position=[...state.events].reverse().find(e=>e.kind==='position');if(position&&position.at>(state.plans[course]?.acceptedAt||0))lastLesson=position.lesson;for(const id of ['home','courses','library','records','settings','resume','consult','review'])")
s=s.replace("host.append(button('전체 기록 내려받기'", "host.append(node('h3','생성한 보충 수업'));for(const draft of Object.values(state.drafts||{}))row(host,draft.title,draft.course+' · '+draft.engine+' · 정확성 추가 검토 필요',()=>startLesson(draft.id),'다시 열기');host.append(button('전체 기록 내려받기'")
p.write_text(s,encoding='utf-8')
