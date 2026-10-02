# -*- coding: utf-8 -*-
import io
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-console\learn.html"
s = io.open(P, encoding="utf-8").read()
R = [
 ('.forEach(function(n){if(NODES[n]&&!seen[n]&&NODES[n].level==="전공"){seen[n]=1;base.push(n)}});',
  '.forEach(function(n){if(NODES[n]&&!seen[n]&&(NODES[n].subject===SUBJ||NODES[n].level==="전공")){seen[n]=1;base.push(n)}});'),
 ('  var d=MAP[SUBJ]||{},ws=d.weeks||{};for(var k in ws){if((ws[k].nodes||[]).indexOf(id)>=0){var ds=ws[k].dates||[];\n'
  '    for(i=0;i<us.length;i++){if((us[i].dates||[]).some(function(x){return ds.indexOf(x)>=0}))return us[i]}}}\n',
  '  /* 주차 날짜: 겹치는 날이 가장 많은 장, 같으면 뒤 장 */\n'
  '  var d=MAP[SUBJ]||{},ws=d.weeks||{};for(var k in ws){if((ws[k].nodes||[]).indexOf(id)>=0){var ds=ws[k].dates||[],bu=null,bn=0;\n'
  '    for(i=0;i<us.length;i++){var c2=(us[i].dates||[]).filter(function(x){return ds.indexOf(x)>=0}).length;if(c2&&c2>=bn){bn=c2;bu=us[i]}}if(bu)return bu}}\n'),
]
for a, b in R:
    if b in s:
        continue
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("ok")
