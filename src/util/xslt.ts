

// Code is adapted from http://www.w3schools.com/xsl/xsl_client.asp 
export function applyXslt(xml: Node, xsl: Node): Node {
  // code for IE
  if ((window as any).ActiveXObject /*|| xhttp.responseType == "msxml-document"*/) {
    return (xml as any).transformNode(xsl);
    // document.getElementById("example").innerHTML = ex;
  }
  // code for Chrome, Firefox, Opera, etc.
  else if (document.implementation && document.implementation.createDocument) {
    let xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsl);
    return xsltProcessor.transformToFragment(xml, document);
  }
}
