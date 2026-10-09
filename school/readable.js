// 자막·대사창용 읽기 쉬운 글자(대표님 10/9 「자막상에 이상한 코드 텍스트처럼 떠」).
// 실제 수업 자료의 판서·대사에는 수식 원문(LaTeX: \( \) \[ \] $ … $)과 내부 파일 표시(`판서_…`)가 그대로 들어 있다.
// 칠판은 수식을 그려 주지만 자막은 한 글자씩 찍으므로, 자막으로 갈 글만 사람이 읽는 꼴로 바꾼다(칠판 원문은 그대로).
const GREEK = { alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε', varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'θ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ', tau: 'τ', phi: 'φ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Pi: 'Π', Sigma: 'Σ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω' };
const SYM = { cdot: '·', times: '×', div: '÷', pm: '±', mp: '∓', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠', approx: '≈', equiv: '≡', to: '→', rightarrow: '→', Rightarrow: '⇒', leftarrow: '←', Leftrightarrow: '⇔', iff: '⇔', infty: '∞', partial: '∂', nabla: '∇', int: '∫', iint: '∬', oint: '∮', sum: 'Σ', prod: 'Π', cdots: '…', ldots: '…', dots: '…', vdots: '⋮', circ: '°', degree: '°', in: '∈', notin: '∉', subset: '⊂', cup: '∪', cap: '∩', forall: '∀', exists: '∃', perp: '⊥', parallel: '∥', angle: '∠', prime: '′', propto: '∝', sim: '∼', lvert: '|', rvert: '|', vert: '|', mid: '|', langle: '⟨', rangle: '⟩' };
const FN = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'ln', 'log', 'exp', 'det', 'lim', 'max', 'min', 'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh'];
const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻', '−': '⁻', n: 'ⁿ', i: 'ⁱ', T: 'ᵀ' };
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉', '+': '₊', '-': '₋', a: 'ₐ', e: 'ₑ', o: 'ₒ', x: 'ₓ', h: 'ₕ', k: 'ₖ', l: 'ₗ', m: 'ₘ', n: 'ₙ', p: 'ₚ', s: 'ₛ', t: 'ₜ', i: 'ᵢ', j: 'ⱼ', r: 'ᵣ' };
// { … } 짝 맞춰 하나 꺼내기
function group(s, at) {
  if (s[at] !== '{') { const m = /^\s*(\\[a-zA-Z]+|.)/.exec(s.slice(at)); return m ? [m[1], at + m[0].length] : ['', at]; }
  let d = 0;
  for (let k = at; k < s.length; k++) { if (s[k] === '{') d++; else if (s[k] === '}' && --d === 0) return [s.slice(at + 1, k), k + 1]; }
  return [s.slice(at + 1), s.length];
}
const mapAll = (txt, table) => ([...txt].every((ch) => table[ch]) ? [...txt].map((ch) => table[ch]).join('') : null);
function tex(s) {
  let out = '', k = 0;
  while (k < s.length) {
    const ch = s[k];
    if (ch === '\\') {
      const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(k)); const name = m ? m[1] : ''; k += m ? m[0].length : 1;
      if (name === 'frac' || name === 'dfrac' || name === 'tfrac') { const [a, k1] = group(s, k); const [b, k2] = group(s, k1); k = k2; const A = tex(a), B = tex(b); out += `${/^[\w′.]+$/.test(A) ? A : `(${A})`}/${/^[\w′.]+$/.test(B) ? B : `(${B})`}`; }
      else if (name === 'sqrt') { const [a, k1] = group(s, k); k = k1; const A = tex(a); out += `√${A.length > 1 ? `(${A})` : A}`; }
      else if (name === 'vec' || name === 'overrightarrow') { const [a, k1] = group(s, k); k = k1; out += tex(a) + '⃗'; }
      else if (name === 'hat') { const [a, k1] = group(s, k); k = k1; out += tex(a) + '̂'; }
      else if (name === 'bar' || name === 'overline') { const [a, k1] = group(s, k); k = k1; out += tex(a) + '̄'; }
      else if (name === 'dot') { const [a, k1] = group(s, k); k = k1; out += tex(a) + '̇'; }
      else if (['text', 'mathrm', 'mathbf', 'mathit', 'mathsf', 'boldsymbol', 'operatorname', 'mathcal', 'textbf'].includes(name)) { const [a, k1] = group(s, k); k = k1; out += tex(a); }
      else if (['left', 'right', 'big', 'Big', 'bigg', 'Bigg', 'displaystyle', 'limits', 'nolimits'].includes(name)) { /* 지움 */ }
      else if (['quad', 'qquad', ',', ';', ':', ' ', '!'].includes(name)) out += ' ';
      else if (name === '\\') out += ' ';
      else if (GREEK[name]) out += GREEK[name];
      else if (SYM[name]) out += SYM[name];
      else if (FN.includes(name)) out += name + (/^[a-zA-Z0-9(\\]/.test(s[k] || '') ? ' ' : '');
      else if (/^[{}%$&#_|]$/.test(name)) out += name;
      else if (name === 'begin' || name === 'end') { const [, k1] = group(s, k); k = k1; out += ' '; }
      else out += name;   // 모르는 명령은 이름만
    } else if (ch === '^' || ch === '_') {
      const [a, k1] = group(s, k + 1); k = k1; const A = tex(a).replace(/\s+/g, '');
      const t = mapAll(A, ch === '^' ? SUP : SUB);
      out += t ?? (ch === '^' ? `^(${A})` : `_${A.length > 1 ? `(${A})` : A}`);
    } else if (ch === '{' || ch === '}') k++;
    else if (ch === '&') { out += ' '; k++; }
    else { out += ch; k++; }
  }
  return out;
}
// 내부 파일 표시: 백틱 안이 「판서_…·사진_…·녹음_…」 이름이거나 파일 이름(….pdf 등)일 때만 — 보통 코드 표기(`x`, `sin`)는 내용을 남긴다(오타 검수 10/9)
const REF = /^(?:판서|사진|녹음|자료|강의자료|클로바|칠판|필기)_[^`]*$|\.(?:pdf|png|jpe?g|webp|md|html?|txt|json|m4a|mp3|mp4)$/i;
const dropRefGroups = (s) => s.replace(/\s*\(((?:\s*`[^`]*`\s*,?)+)\)/g, (m, inner) => ([...inner.matchAll(/`([^`]*)`/g)].every((x) => REF.test(x[1].trim())) ? '' : m));
const TAG = /<\/?(?:b|i|u|em|strong|small|mark|code|span|div|p|br|sup|sub|a|font|li|ul|ol|hr)\b[^<>]*>/gi;   // 실제 HTML 태그만(수식의 x<y 는 그대로)
export function readable(text) {
  let s = String(text ?? '');
  s = s.replace(/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\\\(([\s\S]+?)\\\)|\$([^$\n]+?)\$/g, (m, a, b, c, d) => tex(a ?? b ?? c ?? d));   // 수식 먼저
  s = s.replace(TAG, '');
  s = dropRefGroups(s);
  s = s.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1');        // 남은 백틱·굵게는 표시만 빼고 내용은 둠
  s = s.replace(/([\^_])\{([^{}]*)\}/g, (m, op, a) => tex(op + '{' + a + '}'));   // 수식 표시 없이 쓴 x^{iq}·y_{12}
  s = s.replace(/\[\[/g, '[').replace(/\]\]/g, ']');
  return s.replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.)])/g, '$1').trim();
}
// 칠판 제목: 수식은 칠판이 그리니 그대로 두고, 내부 파일 표시만 뺀다
export function cleanTitle(text) {
  return dropRefGroups(String(text ?? '')).replace(/`([^`]*)`/g, '$1').trim();
}
