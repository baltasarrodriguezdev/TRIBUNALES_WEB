const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

async function extractTextFromPDF(buffer) {
  try {
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info
      }
    };
  } catch (error) {
    console.error('Error extracting PDF:', error);
    throw new Error('Error al procesar archivo PDF');
  }
}

async function extractTextFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      metadata: {
        messages: result.messages
      }
    };
  } catch (error) {
    console.error('Error extracting DOCX:', error);
    throw new Error('Error al procesar archivo Word');
  }
}

async function extractTextFromTxt(buffer) {
  try {
    const text = buffer.toString('utf-8');
    return {
      text: text,
      metadata: {}
    };
  } catch (error) {
    console.error('Error extracting TXT:', error);
    throw new Error('Error al procesar archivo de texto');
  }
}

async function extractText(file) {
  const mimeType = file.mimetype;
  const buffer = file.buffer;

  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractTextFromDocx(buffer);
  } else if (mimeType === 'application/msword') {
    return extractTextFromDocx(buffer);
  } else if (mimeType === 'text/plain') {
    return extractTextFromTxt(buffer);
  } else {
    throw new Error('Formato de archivo no soportado. Use PDF, Word (.docx) o texto (.txt)');
  }
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim();
}

module.exports = {
  extractText,
  extractTextFromPDF,
  extractTextFromDocx,
  extractTextFromTxt,
  cleanText
};
