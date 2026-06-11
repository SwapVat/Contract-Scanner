const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

const extractTextFromPDF = async (buffer) => {
  try {
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    console.log('PDF text length:', fullText.length);
    console.log('PDF text preview:', fullText.substring(0, 200));
    return fullText;
  } catch (err) {
    console.error('PDF Parse Error:', err.message);
    throw new Error('Failed to parse PDF');
  }
};

module.exports = { extractTextFromPDF };