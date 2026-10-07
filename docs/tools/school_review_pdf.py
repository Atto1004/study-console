"""검증한 실제 화면을 PDF로 묶습니다. 이미지 원본을 보존합니다."""
from pathlib import Path
import pymupdf as fitz

root=Path(__file__).resolve().parents[2]
out=root/'output/pdf'
out.mkdir(parents=True,exist_ok=True)
screens=[
 ('학교 로비','7개 과목 교실과 상담·학습 이어가기 · .176','review-lobby-v176.jpg'),
 ('상담실','최신 교사 외형 · 목표·학습 시간·출발점 진단','review-office-v176.jpg'),
 ('하단 과외 대화 · 가로','1024×768 Chrome 화면 크기 검증 · 실제 iPad Safari 검증은 별도','review-bottom-chat-landscape.jpg'),
 ('하단 과외 대화 · 세로','834×1194 Chrome 화면 크기 검증 · 칠판·교사·대화 분리','review-bottom-chat-portrait.jpg'),
]
pdf=fitz.open()
for title,caption,filename in screens:
 image=root/'school'/filename
 pix=fitz.Pixmap(str(image))
 portrait=pix.height>pix.width
 page=pdf.new_page(width=595 if portrait else 842,height=842 if portrait else 595)
 page.draw_rect(page.rect,color=None,fill=(.96,.94,.87))
 page.insert_font(fontname='Korean',fontfile='C:/Windows/Fonts/malgun.ttf')
 page.insert_text((24,30),'GREENLIGHT ACADEMY',fontname='helv',fontsize=10,color=(.2,.36,.27))
 page.insert_text((24,55),title,fontname='Korean',fontsize=18,color=(.08,.23,.18))
 page.insert_text((24,75),caption,fontname='Korean',fontsize=10,color=(.3,.39,.31))
 page.insert_image(fitz.Rect(24,93,page.rect.width-24,page.rect.height-31),filename=str(image),keep_proportion=True)
 page.insert_text((24,page.rect.height-13),'브라우저 검증 화면 · Fish 자격정보 필요 · 교재 검토 상태는 수업 근거에서 확인',fontname='Korean',fontsize=8,color=(.3,.39,.31))
pdf.subset_fonts()
target=out/'greenlight-school-review-v176.pdf'
pdf.save(target,garbage=3,deflate=True)
pdf.close()
check=fitz.open(target)
assert len(check)==len(screens)
for i,page in enumerate(check):
 assert page.get_images()
 page.get_pixmap(matrix=fitz.Matrix(.8,.8)).save(out/f'review-page-{i+1}.png')
print(f'PDF 확인: {len(check)}쪽 · {target.stat().st_size} bytes')
