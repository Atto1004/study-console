from pathlib import Path

target = Path(__file__).resolve().parents[2] / 'school/school.js'
text = target.read_text(encoding='utf-8')
text = text.replace("reflection:'?? ??'", "reflection:'생각해보기'")
text = text.replace("'?? ?? ??? ??? ??? ?? ?????.'", "'학습 기록 저장을 마친 뒤 질문을 보내주세요.'")
text = text.replace("showLobby();status('학교 연결 완료');", "for(const id of ['home','courses','library','records','settings','resume','consult','review'])$(id).disabled=false;showLobby();status('학교 연결 완료');")
text = text.replace("course=name;const host=panel('김주영 스앵님 상담실');", "course=name;requestGeneration++;current=null;$('scene').className='scene office';$('lobby').hidden=true;$('room').hidden=false;$('dialogue').hidden=false;$('location').textContent='상담실';$('roomLabel').textContent='김주영 스앵님 상담실';board('어디부터 시작할까요?','목표와 공부 여건을 듣고, 직접 답한 내용을 바탕으로 출발점을 정합니다.','첫 상담');$('speech').textContent='처음부터 모르는 게 당연해요. 지금 아는 것부터 차근차근 확인할게요.';$('choices').replaceChildren(button('상담 이어가기',()=>consult(name)));for(const id of ['back','next','hint','simpler','source','generate'])$(id).disabled=true;const host=panel('김주영 스앵님 상담실');")
text = text.replace("const step=current.steps[index];assisted=false;passed=false;", "const step=current.steps[index];for(const id of ['simpler','source','generate'])$(id).disabled=false;assisted=false;passed=false;")
text = text.replace("$('next').disabled=!passed;", "if(!step.options)$('choices').append(button('내 말로 설명하고 피드백 받기',()=>openChat('제가 이해한 내용을 설명할게요. 틀린 부분을 짚고 확인 질문을 주세요.\\n')));$('next').disabled=!passed;")
text = text.replace("host.append(node('h3','회차별 확보 현황'));", "host.append(button('누락 의심 위치와 녹음 대조 대기',()=>showAudit(name)));host.append(node('h3','회차별 확보 현황'));")
text = text.replace("const rules=state.rules[name]||[];", "for(const note of report.professorNotes||[]){const details=node('details');details.append(node('summary',note.source+' · 기존 분석 · 미검증'),node('pre',note.text));host.append(details);}const rules=state.rules[name]||[];")
target.write_text(text, encoding='utf-8')
