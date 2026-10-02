# -*- coding: utf-8 -*-
import io
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-console\learn.html"
s = io.open(P, encoding="utf-8").read()
a = '  for(i=0;i<us.length;i++){try{re=us[i].kw&&new RegExp(us[i].kw);if(re&&re.test(nm))return us[i]}catch(e){}}\n'
b = ('  /* 키워드: 맞은 낱말이 가장 많은 장, 같으면 뒤 장(뒤 장 개념 이름에 앞 장 낱말이 예시로 들어간다 — 「연속 분포의 전위 — 쌍극자…」) */\n'
     '  var best=null,bc=0;for(i=0;i<us.length;i++){try{if(!us[i].kw)continue;var c=(nm.match(new RegExp(us[i].kw,"g"))||[]).length;if(c&&c>=bc){bc=c;best=us[i]}}catch(e){}}\n'
     '  if(best)return best;\n')
if b not in s:
    assert s.count(a) == 1; s = s.replace(a, b)
a2 = '.forEach(function(n){if(NODES[n]&&!seen[n]){seen[n]=1;base.push(n)}});'
b2 = '.forEach(function(n){if(NODES[n]&&!seen[n]&&NODES[n].level==="전공"){seen[n]=1;base.push(n)}});'
if b2 not in s:
    assert s.count(a2) == 1; s = s.replace(a2, b2)
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("ok")
