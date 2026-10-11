// http://<tailscale IP> 처럼 보안 컨텍스트가 아닌 주소에선 브라우저가 crypto.randomUUID 를 주지 않는다(10/9 대표님 「교실이 안 열리는」).
// 저장 ID 를 만들다 조용히 멈추던 것 → getRandomValues(보안 컨텍스트 아니어도 됨)로 같은 v4 형식을 만든다. 학교 모듈보다 먼저 불러온다.
if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function' && typeof crypto.getRandomValues === 'function') {
  crypto.randomUUID = () => {
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  };
}
