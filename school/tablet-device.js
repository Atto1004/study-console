export function usesTabletLayout({width,userAgent='',platform='',maxTouchPoints=0,preview=false}) {
  const ipad = /iPad/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
  return width >= 641 && (width <= 1366 || ipad || preview);
}