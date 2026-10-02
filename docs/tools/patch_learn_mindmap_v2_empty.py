# -*- coding: utf-8 -*-
import io
P = r"C:\Users\user\Desktop\아톰OS\기술실\study-console\learn.html"
s = io.open(P, encoding="utf-8").read()
a = 'if(other.length&&MAPV!=="mid"&&MAPV!=="sel")show.push({n:"etc",title:"그 밖의 개념",phase:"",dates:[]});'
b = ('if(other.length&&(!us.length||(MAPV!=="mid"&&MAPV!=="sel")||(MAPV==="sel"&&other.some(function(n){return sel[n]}))))'
     'show.push({n:"etc",title:us.length?"그 밖의 개념":"핵심 개념",phase:"",dates:[]});')
if b not in s:
    assert s.count(a) == 1; s = s.replace(a, b)
a2 = "  html+='</div></div>';\n  $(\"#mm\").innerHTML=html;"
b2 = "  if(!show.length)html+='<span class=\"mm-none\">없음</span>';\n  html+='</div></div>';\n  $(\"#mm\").innerHTML=html;"
if b2 not in s:
    assert s.count(a2) == 1; s = s.replace(a2, b2)
io.open(P, "w", encoding="utf-8", newline="\n").write(s)
print("ok")
