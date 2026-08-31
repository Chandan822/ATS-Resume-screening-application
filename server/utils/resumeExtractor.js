import fs from 'fs';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

/**
 * Clean & Normalize Raw Extracted Text
 * Strips control characters, normalizes line breaks, and collapses whitespace
 */
export const cleanExtractedText = (text) => {
  if (!text || typeof text !== 'string') return '';

  return text
    // Replace non-breaking space with standard space
    .replace(/\u00A0/g, ' ')
    // Normalize Windows line breaks
    .replace(/\r\n?/g, '\n')
    // Remove control characters except newlines and tabs
    .replace(/\p{Cc}/gu, (character) => (character === '\n' || character === '\t' ? character : ''))
    // Collapse 3+ consecutive newlines into double newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace
    .trim();
};

/**
 * Extract Text from PDF File
 */
export const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const uint8Array = new Uint8Array(dataBuffer);
  const parser = new PDFParse(uint8Array);
  const data = await parser.getText();
  return cleanExtractedText(data.text);
};

/**
 * Extract Text from DOCX File
 */
export const extractTextFromDOCX = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return cleanExtractedText(result.value);
};

/**
 * Main Text Extraction Dispatcher
 * Routes based on file extension or MIME type
 */
export const extractResumeText = async (filePath, mimeType, originalName = '') => {
  const isPdf =
    mimeType === 'application/pdf' ||
    originalName.toLowerCase().endsWith('.pdf');

  const isDocx =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    originalName.toLowerCase().endsWith('.docx') ||
    originalName.toLowerCase().endsWith('.doc');

  if (isPdf) {
    return extractTextFromPDF(filePath);
  }

  if (isDocx) {
    return extractTextFromDOCX(filePath);
  }

  throw new Error('Unsupported file format. Only PDF and DOCX documents are supported.');
};
