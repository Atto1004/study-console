// 자료·기존 화면의 직접 링크는 유지하고, 웹·태블릿 기본 진입만 학교로 연결.
if (
  /^\/(kingdom\/)?study\//.test(location.pathname) &&
  !location.search &&
  !location.hash &&
  matchMedia("(min-width:700px)").matches
) {
  location.replace(new URL("school/index.html", location.href));
}
