"""학교 .178의 실제 디자인 검수 화면을 원본 보존 PDF로 묶는다."""
from pathlib import Path
import pymupdf as fitz

root = Path(__file__).resolve().parents[2]
out = root / 'output/pdf'
out.mkdir(parents=True, exist_ok=True)
screens = [
    ('학교 로비', '1180 × 720 · 안내 데스크와 과목별 교실', 'design-lobby-v178.png'),
    ('김주영 스앵님 상담실', '목표·학습 시간·출발점 상담', 'design-office-v178.png'),
    ('교실 · 가로 화면', '1024 × 768 · 고정 칠판·교사·하단 학습 영역', 'design-classroom-v178.png'),
    ('교실 · 세로 화면', '834 × 1194 · 칠판과 교사, 하단 대화 분리', 'design-portrait-v178.png'),
]
pdf = fitz.open()
for title, caption, name in screens:
    image = root / 'school' / name
    pix = fitz.Pixmap(str(image))
    portrait = pix.height > pix.width
    page = pdf.new_page(width=595 if portrait else 842, height=842 if portrait else 595)
    page.draw_rect(page.rect, color=None, fill=(.96, .94, .88))
    page.insert_font(fontname='Korean', fontfile='C:/Windows/Fonts/malgun.ttf')
    page.insert_text((24, 29), 'GREENLIGHT ACADEMY / .178', fontsize=10, color=(.19,.34,.25))
    page.insert_text((24, 55), title, fontname='Korean', fontsize=18, color=(.08,.22,.17))
    page.insert_text((24, 76), caption, fontname='Korean', fontsize=10, color=(.32,.39,.31))
    page.insert_image(fitz.Rect(24, 94, page.rect.width-24, page.rect.height-32), filename=str(image), keep_proportion=True)
    page.insert_text((24, page.rect.height-14), '실제 Chrome 검수 화면 · 실제 iPad Safari 실기 검증은 별도 · TTS 제외', fontname='Korean', fontsize=8, color=(.32,.39,.31))
pdf.subset_fonts()
target = out / 'greenlight-school-design-v178.pdf'
pdf.save(target, garbage=3, deflate=True)
pdf.close()
with fitz.open(target) as check:
    assert len(check) == 4
    for i, page in enumerate(check):
        assert page.get_images()
        page.get_pixmap(matrix=fitz.Matrix(.8,.8)).save(out / f'design-v178-page-{i+1}.png')
print(f'디자인 PDF: 4쪽 · {target.stat().st_size} bytes')
