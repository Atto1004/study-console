# -*- coding: utf-8 -*-
"""객관식 보기 섞기 — build_lesson.py · build_classroom.py 가 같이 쓴다(원본은 한 곳).
대표님 2026-09-29 「객관식 답이 다 1번으로 고정」: 원문은 정답을 첫 보기로 쓰는 습관이 있다(120문제 전부 1번, 실측) → 빌드 때 섞는다.
- 결정적: 같은 회차·같은 문제는 늘 같은 순서(재빌드해도 저장된 답이 흔들리지 않게)
- 정답 칸은 회차 안에서 고르게: 보기 수별 주머니(0..n-1 을 섞은 것)에서 하나씩 꺼낸다 — 무작위만 쓰면 한 칸에 몰릴 수 있고, 차례로 돌리면 규칙이 보인다
- 보기마다 k = 원문 순서(0부터). 화면은 고른 보기를 k 로 저장한다(섞기 전 저장값 = 원문 순서라 그대로 맞는다)
- 해설의 「N번」은 새 번호로 바꾼다(해설은 원문 번호로 쓴다)
두 빌더는 문서 순서대로 객관식마다 mix() 를 부른다 — 부르는 순서가 같아야 같은 결과."""
import random, re

class Mixer:
    def __init__(self, lesson_id):
        self.lid = lesson_id
        self.rng = random.Random("pos|" + lesson_id)
        self.bags = {}

    def mix(self, choices, qid):
        """choices = [{"html", "ok"}, …] (원문 순서) → (섞은 목록, {원문 칸: 새 칸}) — 칸은 0부터"""
        n = len(choices)
        for i, c in enumerate(choices): c["k"] = i
        if n < 2: return choices, {i: i for i in range(n)}
        bag = self.bags.setdefault(n, [])
        if not bag:
            bag.extend(range(n)); self.rng.shuffle(bag)
        tgt = bag.pop()
        ok = next(i for i, c in enumerate(choices) if c["ok"])
        rest = [c for i, c in enumerate(choices) if i != ok]
        random.Random(f"{self.lid}|{qid}").shuffle(rest)
        out = rest[:tgt] + [choices[ok]] + rest[tgt:]
        return out, {c["k"]: p for p, c in enumerate(out)}

# 「2번은 …」「3번 정사각 아님」 — 앞이 숫자·영문·TeX 명령이면 보기 번호가 아니다
REF = re.compile(r"(?<![0-9A-Za-z_\\^{])([1-9])번")

def renum(html, newpos):
    def rep(m):
        i = int(m.group(1)) - 1
        return f"{newpos[i] + 1}번" if i in newpos else m.group(0)
    return REF.sub(rep, html)
