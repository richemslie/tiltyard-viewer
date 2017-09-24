// Note: This modifies the input.
export function getHtmlDestructively(node: Node): string {
  const tmp: HTMLDivElement = document.createElement("div");
  tmp.appendChild(node);
  let vizHtml = tmp.innerHTML;
  tmp.remove();
  return vizHtml;
}

export function securifyUrl(url: string): string {
  if (url.startsWith("http:")) {
    return url.replace("http:", "https:");
  }
  return url;
}
