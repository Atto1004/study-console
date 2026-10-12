// 칠판 수식 간격 줄임(chalkTight) 검사. 실행: node school/lecture-chalk.test.mjs
// 수식 구간 안의 \qquad·\quad 만 한 칸(\ )으로 줄이고, 수식 밖 글줄과 \quadx 같은 다른 명령은 건드리지 않는다.
import assert from 'node:assert/strict';
import { chalkTight } from './lecture-chalk.js';
let n = 0; const ok = (a, b, m) => { assert.equal(a, b, m); n++; };
ok(chalkTight(String.raw`\[a\qquad(b)\quad c\]`), String.raw`\[a\ \ (b)\  c\]`, '디스플레이 수식 안');
ok(chalkTight(String.raw`$a\quad b$ and \(c\qquad d\) $$e\qquad f$$`), String.raw`$a\  b$ and \(c\ \  d\) $$e\ \  f$$`, '인라인·괄호·$$ 수식 안');
ok(chalkTight(String.raw`본문 \quad 설명 \[x\qquad y\]`), String.raw`본문 \quad 설명 \[x\ \  y\]`, '수식 밖 글줄은 그대로');
ok(chalkTight(String.raw`\[\quadx \qquadz\]`), String.raw`\[\quadx \qquadz\]`, '다른 명령(\quadx)은 그대로');
ok(chalkTight(''), '', '빈 문자열');
ok(chalkTight(null), '', 'null');
console.log('lecture-chalk 전부 통과 (' + n + ')');
