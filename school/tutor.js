// 쌍방향 과외 진행자 (교실 v2 설계 4절, 대표님 10/8 「지금 학습 구성 최악 — 쌍방향 과외가 맞냐」).
// 한 단계마다: ① 설명(칠판에 한 줄씩 + 스앵님 말) → ② 스앵님이 먼저 확인 질문 → ③ 대표님 답(선택·한 문장·펜)
// → ④ 판정과 되받기(맞음: 이유 짚고 다음 / 틀림: 더 쉽게 다시 + 비슷한 질문 / 모르겠어요: 한 단계 같이 → 선수 개념).
// 언제든 Q 로 끼어들어 질문 → 그 단계 근거 안에서 답 → 하던 질문으로 돌아온다.
// 판정·기록은 서버 코치(coach: teachback·together·question)와 지금 기록(event)을 그대로 쓴다. 정답·전체 풀이를 먼저 주지 않는다.
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; };
const clean = (t) => String(t || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/^#{1,6}\s+/gm, '').trim();

const ASK = {
  understand: ['방금 내용을 한 문장으로 말해 볼래요? 핵심 하나면 돼요.', '이걸 친구한테 설명한다면 첫 문장을 뭐라고 할래요?'],
  remember: ['이건 외워야 해요. 지금 칠판 안 보고 핵심을 말해 볼래요?', '방금 본 걸 한 줄로 다시 써 볼까요?'],
  example: ['이 풀이에서 다음 줄은 뭘 해야 할까요? 왜 그런지도 짧게요.', '여기서 이 식을 쓴 이유가 뭘까요?'],
  reflection: ['어디가 제일 헷갈렸어요? 한 줄로 말해 주세요.', '이걸 어디에 써먹을 수 있을지 하나만 떠올려 볼래요?'],
};
const pick = (list, n) => list[n % list.length];

export function createTutor(app) {
  // app: { api, ctx(), record(ev), pass(), assist(), say(text, react), choices, eventId(), math(el), busy() }
  const dialogue = document.getElementById('dialogue');
  const form = el('form', undefined, 'tutor-reply'); form.hidden = true; form.setAttribute('aria-label', '스앵님께 답하기');
  const input = el('input'); input.type = 'text'; input.id = 'tutorInput'; input.autocomplete = 'off'; input.maxLength = 600;
  const send = el('button', '보내기'); send.type = 'submit';
  const dunno = el('button', '모르겠어요', 'tutor-dunno'); dunno.type = 'button';
  form.append(input, dunno, send);
  dialogue.querySelector('.speech')?.after(form);

  let key = '', phase = 'idle', tries = 0, asked = '', revealTimer = null, waiting = false, resumeLine = '';
  const setPhase = (p) => { phase = p; dialogue.dataset.tutor = p; };

  // ① 설명: 칠판을 위에서 아래로 분필로 쓰듯 드러낸다(수식 DOM 은 건드리지 않음). Space·클릭이면 바로 다 보이게.
  let finishReveal = () => {};
  function reveal(done) {
    clearTimeout(revealTimer); revealTimer = null;
    const content = document.querySelector('#board .content');
    if (!content || window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) { done(); return; }
    const lines = Math.max(1, Math.round(content.scrollHeight / 28));
    const ms = Math.min(9000, 700 + lines * 650);
    content.style.setProperty('--chalk', ms + 'ms'); content.classList.remove('chalk-writing'); void content.offsetWidth; content.classList.add('chalk-writing');
    const end = () => { if (!revealTimer) return; clearTimeout(revealTimer); revealTimer = null; content.classList.remove('chalk-writing'); done(); };
    revealTimer = setTimeout(end, ms);
    finishReveal = end;
  }

  function ask(line, mode) {
    asked = line; app.say(line, 'stuck');
    form.hidden = false; form.dataset.mode = mode;
    input.placeholder = mode === 'answer' ? '한 문장으로 답하기 (Q)' : '궁금한 거 물어보기 (Q)';
    dunno.hidden = mode !== 'answer';
  }

  // 단계가 바뀔 때마다 school.js 가 부른다
  function onStep() {
    const c = app.ctx(); if (!c) return;
    const k = c.lesson.id + '/' + c.step.id; if (k !== key) { key = k; tries = 0; }
    waiting = false; resumeLine = '';
    if (c.blocked) { form.hidden = true; setPhase('idle'); return; }   // 검토 안 된 교재 등
    setPhase('explain');
    const intro = clean(c.step.speech) || (c.step.options ? '문제부터 볼게요. 칠판 잘 보세요.' : '자, 칠판 보세요. 하나씩 쓸게요.');
    app.say(intro, 'neutral'); app.lecture?.(true);
    reveal(() => {
      app.lecture?.(false);
      if (c.passed) { setPhase('done'); ask('이건 전에 해결했어요. Space 로 다음, 다시 풀어도 돼요.', 'question'); return; }
      if (c.step.options) { setPhase('quiz'); ask(tries ? '다시 골라 볼까요? 조건부터 하나씩요.' : '직접 골라 보세요. 틀려도 어디서 막혔는지 같이 볼게요.', 'question'); }
      else { setPhase('check'); ask(pick(ASK[c.step.kind] || ASK.understand, tries), 'answer'); }
    });
  }

  async function coach(mode, text) {
    const c = app.ctx();
    return app.api('coach', { course: c.course, lesson: c.lesson.id, index: c.index, question: text, mode, id: app.eventId() });
  }

  // ③·④ 서술 답 판정
  async function evaluate(text) {
    const c = app.ctx(); waiting = true; send.disabled = true; app.say('음… 들어 볼게요.', 'neutral');
    try {
      const r = await coach('teachback', text);
      const verdict = r?.feedback?.assessment, reply = clean(r?.answer);
      if (verdict === 'supported') {
        app.record({ kind: 'read', course: c.course, lesson: c.lesson.id, step: c.step.id, nodes: c.step.nodes || [] });
        app.pass(); setPhase('done');
        ask((reply ? reply + '\n' : '') + '좋아요, 정확히 짚었어요. Space 로 다음 단계.', 'question'); app.react?.('correct');
      } else if (verdict === 'misconception') {
        tries++; app.assist(); setPhase('check');
        const fix = clean(r?.feedback?.misconception) || reply;
        ask((fix ? fix + '\n' : '') + (tries >= 2 ? '같이 한 단계만 해 볼게요. 「모르겠어요」를 누르면 제가 먼저 시작할게요.' : pick(ASK[c.step.kind] || ASK.understand, tries)), 'answer'); app.react?.('wrong');
      } else {
        setPhase('check');
        ask((reply ? reply + '\n' : '') + '조금만 더 구체적으로요. 어떤 식이나 조건을 썼는지까지요.', 'answer');
      }
    } catch (e) {
      // 코치가 없으면 막지 않는다: 스스로 확인한 것으로 넘어가되 「읽음」으로만 기록(이해 판정 아님)
      app.record({ kind: 'read', course: c.course, lesson: c.lesson.id, step: c.step.id, nodes: c.step.nodes || [] });
      app.pass(); setPhase('done'); ask('지금은 제가 판정을 못 해요. 읽음으로만 기록하고 넘어갈게요. Space 로 다음.', 'question');
    } finally { waiting = false; send.disabled = false; }
  }

  // 모르겠어요 → 한 단계 같이(정답은 안 줌) → 다시 묻기. 두 번째부터는 선수 개념 제안(answer() 쪽 버튼 재사용)
  async function together() {
    app.assist(); tries++; waiting = true;
    try {
      const r = await coach('together', '지금 단계의 첫 단계 하나만 같이 하고, 내가 이어서 할 다음 단계를 질문해 주세요. 정답과 전체 풀이는 주지 마세요.');
      ask((clean(r?.answer) || '그럼 첫 줄만 같이 해요. 주어진 조건부터 칠판에서 찾아볼까요?') + '\n이어서 해 볼래요?', 'answer');
    } catch { ask('그럼 첫 줄만 같이 해요. 주어진 조건부터 칠판에서 찾아볼까요?', 'answer'); }
    finally { waiting = false; }
  }

  // 끼어들기 질문 → 답 → 하던 질문으로 복귀
  async function question(text) {
    app.assist(); waiting = true; resumeLine = asked; const mode = form.dataset.mode;
    app.say('좋은 질문이에요. 잠깐만요.', 'neutral');
    try { const r = await coach('question', text); app.say(clean(r?.answer) || '그건 이 단계 근거만으로는 답하기 어려워요.', 'neutral'); }
    catch (e) { app.say('지금은 답을 못 가져왔어요. 하던 걸 이어서 해요.', 'neutral'); }
    finally {
      waiting = false;
      if (resumeLine && phase !== 'done') setTimeout(() => ask(resumeLine, mode), 2500);
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault(); if (waiting || app.busy?.()) return;
    const text = input.value.trim(); if (!text) return; input.value = '';
    // 답을 기다릴 때도 「?」로 끝나면 끼어들기 질문으로 받는다
    if (form.dataset.mode === 'answer' && phase === 'check' && !/[?？]\s*$/.test(text)) evaluate(text); else question(text);
  });
  dunno.addEventListener('click', () => { if (!waiting) together(); });

  return {
    onStep,
    // answer()(선택지)가 판정한 뒤 부른다
    onAnswer(correct) {
      if (correct) { setPhase('done'); setTimeout(() => ask('맞아요. 왜 맞는지 한 줄로 말해 볼래요? 아니면 Space 로 다음.', 'question'), 1200); return; }
      tries++; setPhase('quiz');
      setTimeout(() => ask(tries >= 2 ? '두 번 막혔네요. 「더 쉽게」(E)로 한 단계만 같이 하거나, 아래 선수 개념부터 볼까요?' : '어디서 갈렸는지 볼까요? 주어진 조건이랑 구할 걸 나눠 보세요.', 'question'), 1200);
    },
    // Space: 칠판 쓰는 중이면 바로 다 보이게, 아니면 false(다음으로 넘기는 건 school.js)
    skipReveal() { if (revealTimer) { finishReveal(); return true; } return false; },
    focus() { form.hidden = false; input.focus(); },
    get phase() { return phase; },
    hide() { form.hidden = true; clearTimeout(revealTimer); revealTimer = null; setPhase('idle'); },
  };
}
