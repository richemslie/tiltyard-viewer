
export function getHtmlDestructively(node: Node): string {
  var tmp: HTMLDivElement = document.createElement("div");
  tmp.appendChild(node);
  let vizHtml = tmp.innerHTML;
  tmp.remove();
  return vizHtml;
}
