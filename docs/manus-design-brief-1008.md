# Manus 디자인 시안 지시서 (10/8) — 그대로 붙여 넣기용

> 목적: 화면 **모양**만 받는다. 기능 코드는 아톰이 이미 만들었고, 받은 시안에서 색·글꼴·간격·모서리·그림자 토큰과 배치만 옮긴다.
> 넣지 말 것: 실존 인물 얼굴, 개인 자료, 실제 과제. 캐릭터는 단순한 일러스트/실루엣, 문제는 예시용.

---

## 붙여 넣을 프롬프트

You are designing static UI mockups (HTML + CSS only, no frameworks, one file per screen) for a Korean study app for a university engineering student. A tutor character ("스앵님") teaches lessons; the student solves problems and chats with the tutor. Output must be pixel-polished, calm, Apple-like simplicity with a light game feel (think Duolingo × Apple). Korean UI text, font Pretendard.

Canvas: 1040×918 (iPad landscape). Also make each screen respond down to 390px width.

Hard rules
- Control buttons are ICONS ONLY (inline SVG, 24px grid, 2px stroke), each with a tooltip label. Text is allowed only on content: answer choices, chat messages, list items, cards.
- Brand color is a single green (#21745a family). Define all colors, radii, shadows, spacing, font sizes as CSS custom properties in :root, plus a dark-mode set.
- No emoji in UI. No gradients-everywhere, no glassmorphism overload, no generic AI-dashboard look.
- Touch targets ≥ 44px.

Screen 1 — Classroom (most important). Three vertically stacked zones:
1. TOP "lecture stage" (~40% height): a chalkboard showing the lesson content being written line by line, the tutor character beside it, and a speech-bubble subtitle near the tutor showing the current sentence.
2. MIDDLE "work zone": the current problem — 4 multiple-choice answer cards, or a short answer input. While the lecture plays this zone is dimmed with a small note; after the lecture it is fully active.
3. BOTTOM "chat + control bar": a short chat log (tutor messages left, mine right, green), a text input with send icon, and one control row: restart, play/pause (primary), next, a progress label like "3/8", a thin progress track, hint icon, easier icon, and a "more" icon menu.
Header: app title area on the left; on the right a segmented icon toggle "site ↔ game(3D)" and a map icon.
Left edge: a slim vertical subject rail with 5 subject icons (number keys 1–5).
Show three states side by side or as separate files: lecture playing / lecture ended + question / chat open with tutor answer.

Screen 2 — Lobby: today's classes and deadlines, exam D-day per subject, a "readiness" ring per subject (0–100), and one big "what to do now" card.

Screen 3 — Component sheet: readiness ring, D-day track (days left with a progress flag), answer card (default/selected/correct/wrong), chat bubbles, icon buttons (default/hover/active/disabled), subtitle bubble, subject rail item, material badges in 4 kinds (원본 gray, 스앵님 정리 navy, 생성 purple, 과제 orange).

Deliver: screen1.html, screen2.html, components.html, tokens.css (only :root variables), and a short note listing the token values.
Make 2 visual directions for Screen 1 (A: warm paper/chalk, B: clean white/green) so I can pick.

---

## 받은 뒤 (아톰)
1. 대표님이 A/B 중 하나 고르기
2. tokens.css → `school/skin.css` 토큰으로 옮김, 세 칸 배치 차이는 `school/v3.css`에 반영
3. 1040×918 크롬·WebKit 캡처로 시안과 나란히 비교 → 오타 검수
