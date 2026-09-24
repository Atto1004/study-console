/* 레이어 존재 검사 — index.html 에 V32~V49 헤더가 전부 한 번씩 있어야 한다 (2026-09-24 V45·V46 유실 사고 후) */
const fs = require("fs");
const s = fs.readFileSync(process.argv[2] || "C:/Users/user/Desktop/아톰OS/기술실/study-console/index.html", "utf8").replace(/\r\n/g, "\n");
const need = []; for (let v = 32; v <= 49; v++) need.push("V" + v);
const bad = need.filter(v => (s.split("/* ============================================================\n   " + v + " LAYER").length - 1) !== 1);
console.log("레이어 " + need.length + "개 중 이상 " + bad.length + (bad.length ? " : " + bad.join(",") : ""));
process.exit(bad.length ? 1 : 0);
