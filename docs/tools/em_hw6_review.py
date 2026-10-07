"""실제 다른 모델에 문제은행 수학·정답·힌트 검토를 요청한다. 학생 기록은 쓰지 않는다."""
from pathlib import Path
import json
import sys
root=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(Path.home()/'본사/atom'))
import server
from school_runtime import model_reply
hw=root/'notes/lessons/_private/em1/hw'
bank=json.loads((hw/'ch3.json').read_text(encoding='utf-8'))
prompt='수학 과제 문제은행을 독립 검토하세요. 각 원식·초기조건과 모든 단계의 정답/힌트/설명을 확인하세요. 스키마 검사와 SymPy 검산은 통과했지만 그 결과를 믿고 생략하지 마세요. 오류가 있으면 RED와 정확한 문제 id/단계/수정안을, 없으면 GREEN과 검토 근거를 한국어로 답하세요. 시험 출제 여부를 임의로 보태지 마세요.\n'+json.dumps(bank,ensure_ascii=False)
answer,usage=model_reply(server,'claude',prompt)
destination=root.parent/'study-materials/공업수학1/_과제/6주차_독립검토.md'
destination.write_text(answer,encoding='utf-8')
print(answer)
