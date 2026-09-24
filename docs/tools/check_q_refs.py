# -*- coding: utf-8 -*-
"""정리노트 v2의 문제(div.q)마다 '자기완결' 검사 — 슬라이드 한 장에 문제 하나가 실리므로 문제는 다른 문제를 참조하면 안 된다.
- 문제 본문 수식에 나오는 행렬 기호(대문자 한 글자)가 같은 문제 안에서 정의(X=\\begin… / X=( … / "행렬 \\(X\\)" 일반 진술)돼 있는가
- '위의/위 /앞의/앞에서/이전 문제/기초 N-N/응용 N-N' 같은 다른 문제 참조 문구가 있는가
사용: python check_q_refs.py <note.html>   → 위반 목록 출력, 위반 있으면 exit 1 (build_slides.py가 먼저 부른다)"""
import io, re, sys
from lxml import html as LH

REF_WORDS = ["위의", "위 ", "앞의", "앞에서", "이전 문제", "같은 행렬", "그 행렬", "위에서"]
REF_QN = re.compile("(기초|응용) [0-9]-[0-9]")
ALWAYS_OK = {"I", "O"}          # 단위행렬·영행렬은 정의 없이 씀
BS = chr(92)                    # 백슬래시 — 셸 이스케이프 문제를 피하려고 문자로 조립
# 수식 안에서 '기호로 쓰인' 대문자: 앞에 글자·백슬래시가 없고, 뒤가 공백·^·)·,·.·{·}·끝. X_{..}(소행렬식 M_{ij}, 여인수 A_{ij})는 제외
LETTER_USED = re.compile("(?<![A-Za-z" + BS + BS + "])([A-Z])(?=[" + BS + "s" + BS + "^" + BS + ")," + BS + "." + BS + "{" + BS + "}]|$)")
# 정의: X=\begin / X=\left / X=(
LETTER_DEF = re.compile("([A-Z])" + BS + "s*(?:=|:=)" + BS + "s*(?:" + BS + BS + "begin|" + BS + BS + "left|" + BS + "()")
# 일반 진술 선언: "행렬 \(A\)가 대칭이면"
# 2026-09-24 물리·정역학 덱: "전기장 \(E\)" "장력 \(T\)" 처럼 명사 뒤에 기호를 밝힌 것도 정의로 본다. 문제가 스스로 정의하는 기호는 div.q data-def="E,V" 로도 선언할 수 있다
NOUNS = "행렬|임의의|어떤|정사각행렬|벡터|전기장|전위|전위차|전하|전하량|힘|장력|수직력|마찰력|무게|반지름|길이|거리|질량|넓이|면적|부피|저항|전류|기전력|전기 용량|전기용량|스프링 상수|선전하밀도|면전하밀도|각|점|상수|일반해|특수해|함수|해|미분방정식|적분인자|연산자|기저|론스키안|행렬식|역행렬"
GENERIC_DEF = re.compile("(?:" + NOUNS + ")" + BS + "s*(?:의" + BS + "s*(?:크기|세기|값))?" + BS + "s*" + BS + BS + BS + "(" + BS + "s*(?:" + BS + BS + "vec" + BS + "s*)?([A-Z])")
MATH = re.compile(BS + BS + BS + "((.*?)" + BS + BS + BS + ")|" + BS + BS + BS + "[(.*?)" + BS + BS + BS + "]", re.S)
TARGET = re.compile("([A-Z])" + BS + "s*(?:을|를)?" + BS + "s*(?:구하라|찾아라|정하라|쓰라|만족)")

def check(path):
    doc = LH.fromstring(io.open(path, encoding="utf-8").read())
    bad = []
    for q in doc.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," q ")]'):
        qn = (q.xpath('./div[contains(@class,"qn")]/text()') or ["?"])[0].strip()
        parts = [LH.tostring(x, encoding="unicode") for x in q if x.tag != "details" and "qn" not in (x.get("class") or "")]
        txt = re.sub("<[^>]+>", "", "".join(parts))
        maths = " ".join(a or b for a, b in MATH.findall(txt))
        used = set(LETTER_USED.findall(maths)) - ALWAYS_OK
        defined = set(LETTER_DEF.findall(maths)) | set(GENERIC_DEF.findall(txt)) | set(x.strip() for x in (q.get("data-def") or "").split(",") if x.strip())
        target = set(TARGET.findall(txt))
        undefined = sorted(used - defined - target)
        refs = [w for w in REF_WORDS if (re.search("(?<![가-힣])" + re.escape(w), txt) if w.startswith("위") else (w in txt))] + REF_QN.findall(txt)   # "전위 "·"단위 "의 "위 "는 참조가 아니다(2026-09-24)
        if undefined or refs:
            bad.append((qn, undefined, refs))
    return bad

if __name__ == "__main__":
    bad = check(sys.argv[1])
    for qn, und, refs in bad:
        print("!! " + qn + " | 정의 없는 기호: " + ",".join(und) + " | 참조 문구: " + ",".join(refs))
    print(("자기완결 위반 %d건 — 문제마다 필요한 행렬을 그 문제 안에 적어라" % len(bad)) if bad else "자기완결 검사 통과 (위반 0)")
    sys.exit(1 if bad else 0)
