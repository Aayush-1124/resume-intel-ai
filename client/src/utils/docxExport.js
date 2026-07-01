export function exportToDoc(element, filename = 'document.doc') {
  const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>Resume Export</title>
  </head>
  <body>`;
  
  const postHtml = "</body></html>";
  
  // Create a clone to manipulate styles if needed
  const clone = element.cloneNode(true);
  
  // Strip out any elements that shouldn't be in the doc (like hidden utility buttons) if they exist
  
  const html = preHtml + clone.innerHTML + postHtml;
  
  // Using universal BOM to ensure UTF-8 encoding is picked up
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });
  
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
