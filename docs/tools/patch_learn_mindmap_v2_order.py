# -*- coding: utf-8 -*-
"""마인드맵 v2 개념 순서 = 수업에 나온 순서(map.json 주차 순·주차 안 순서), 주차에 없는 번호 개념(2.4·2.9…)은 번호가 바로 앞인 개념 뒤에"""
import io
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-console\learn.html"
s = io.open(P, encoding="utf-8").read()
a = 'L.sort(function(a,b){return mmName(a).localeCompare(mmName(b),"ko",{numeric:true})});'
b = 'L.sort(function(a,b){return mmKey(a)-mmKey(b)||mmName(a).localeCompare(mmName(b),"ko",{numeric:true})});'
if b not in s:
    assert s.count(a) == 1; s = s.replace(a, b)
a2 = 'function mmName(id){'
b2 = r'''function mmNum(id){var m=/^(\d+)\.(\d+)/.exec(mmName(id));return m?(+m[1])*100+(+m[2]):null}
var MMK={},MMKS="";
function mmKey(id){if(MMKS!==SUBJ){MMK={};MMKS=SUBJ;var d=MAP[SUBJ]||{},ws=d.weeks||{},ks=Object.keys(ws).sort(function(x,y){return x-y}),c=0;
    ks.forEach(function(k){(ws[k].nodes||[]).forEach(function(n){if(MMK[n]==null)MMK[n]=++c})});
    Object.keys(NODES).forEach(function(n){if(MMK[n]!=null||NODES[n].subject!==SUBJ)return;var v=mmNum(n);if(v==null){MMK[n]=1e6;return}
      var best=null;Object.keys(MMK).forEach(function(o){var w=mmNum(o);if(w!=null&&w<v&&MMK[o]<1e6&&(best==null||w>mmNum(best)||(w===mmNum(best)&&MMK[o]>MMK[best])))best=o});
      MMK[n]=best?MMK[best]+.5+v/1e5:.5+v/1e5})}
  return MMK[id]==null?1e6:MMK[id]}
function mmName(id){'''
if "function mmKey(" not in s:
    assert s.count(a2) == 1; s = s.replace(a2, b2)
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("ok")
