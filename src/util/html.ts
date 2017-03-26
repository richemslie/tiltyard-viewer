// Note: This modifies the input.
export function getHtmlDestructively(node: Node): string {
  const tmp: HTMLDivElement = document.createElement("div");
  tmp.appendChild(node);
  let vizHtml = tmp.innerHTML;
  tmp.remove();
  return vizHtml;
}
