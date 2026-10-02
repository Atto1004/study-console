# -*- coding: utf-8 -*-
import io
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-console\learn.html"
s = io.open(P, encoding="utf-8").read()
R = [
 ('var base=[],seen={};subjectNodes(SUBJ).forEach(function(n){if(NODES[n]&&!seen[n]){seen[n]=1;base.push(n)}});',
  'var base=[],seen={};subjectNodes(SUBJ).concat(Object.keys(NODES).filter(function(n){return NODES[n].subject===SUBJ&&NODES[n].level==="전공"})).forEach(function(n){if(NODES[n]&&!seen[n]){seen[n]=1;base.push(n)}});'),
 ('(NODES[n].prereq||[]).forEach(function(p){if(NODES[p]&&!seen[p])basics[p]=1})',
  '(NODES[n].prereq||[]).forEach(function(p){if(NODES[p]&&!seen[p]&&NODES[p].level!=="전공")basics[p]=1})'),
 ('#mapWrap{position:relative;margin-top:6px}',
  '#mapCard{width:min(1000px,calc(100vw - 28px));margin-left:calc((100% - min(1000px,calc(100vw - 28px)))/2)}\n#mapWrap{position:relative;margin-top:6px}'),
 ('.mm-base{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:2px}',
  '.mm-base{display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:4px;align-self:stretch}'),
]
for a, b in R:
    if b in s:
        continue
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b)
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("ok")
