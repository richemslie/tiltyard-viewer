// Code is adapted from http://www.w3schools.com/xsl/xsl_client.asp
export function applyXslt(xml: Node, xsl: Node): Node {
  if ((window as any).ActiveXObject /*|| xhttp.responseType == "msxml-document"*/) {
    // code for IE
    return (xml as any).transformNode(xsl);
  } else if (document.implementation && document.implementation.createDocument) {
    // code for Chrome, Firefox, Opera, etc.
    let xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    return xsltProcessor.transformToFragment(xml, document);
  }
}
