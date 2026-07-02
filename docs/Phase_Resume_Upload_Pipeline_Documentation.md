# AI Applicant Tracking System (AI ATS) - Resume Upload Pipeline Documentation

## Executive Summary
**Phase Objective**: Implement the complete Resume Upload and Raw Text Extraction Pipeline supporting PDF and DOCX formats using Multer, `pdf-parse`, and `mammoth`. Validates file size and extensions, stores original files in `server/uploads/`, cleans extracted text, and saves text into database `ResumeFile` and `ResumeVersion` records without calling AI models.

---

## 1. Resume Pipeline Workflow Architecture

```
Candidate Resume File (.pdf / .docx)
               │
               ▼
┌──────────────────────────────┐
│  Multer File Upload Engine   │  <-- Max 10MB size validation & MIME filter
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Local Disk Storage Engine  │  <-- Saved to server/uploads/ with timestamp
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│    Text Extraction Dispatcher│
│  ├─ PDF: pdf-parse           │  <-- Extracts raw text buffer
│  └─ DOCX: mammoth            │  <-- Extracts raw text XML/document
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Text Normalization & Clean  │  <-- Strips control chars, normalizes line breaks
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  Prisma Database Persistence │
│  ├─ ResumeFile Record        │  <-- File metadata, size, type, isPrimary
│  └─ ResumeVersion Record     │  <-- Version number, parsedText
└──────────────────────────────┘
```

---

## 2. Text Normalization Specifications

Raw text extracted from PDF or DOCX streams passes through `cleanExtractedText()` in `server/utils/resumeExtractor.js`:

1. **Non-breaking Space Conversion**: Replaces `\u00A0` with standard ASCII space `' '`.
2. **Control Character Removal**: Removes non-printable characters matching `[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]`.
3. **Line Break Standardisation**: Converts `\r\n` and `\r` to standard `\n`.
4. **Paragraph Collapsing**: Replaces 3+ consecutive newlines (`\n{3,}`) with clean double newlines `\n\n`.
5. **Edge Trimming**: Removes leading and trailing whitespace.

---

## 3. API Response Format

### Request
- **Endpoint**: `POST /api/candidate/resumes`
- **Headers**: `Authorization: Bearer <access_token>`, `Content-Type: multipart/form-data`
- **Body**: `resume` file field (.pdf or .docx up to 10MB).

### Response Sample (HTTP 201 Created)
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resumeFile": {
      "id": "res_823901",
      "candidateId": "cand_12345",
      "fileName": "John_Doe_Resume.pdf",
      "fileUrl": "/uploads/resume-1720000000000-123456789.pdf",
      "fileType": "application/pdf",
      "fileSize": 145200,
      "isPrimary": true,
      "createdAt": "2026-07-02T15:40:00.000Z"
    },
    "resumeVersion": {
      "id": "ver_90123",
      "resumeFileId": "res_823901",
      "versionNumber": 1,
      "parsedText": "John Doe\nSoftware Engineer\nExperience...\n"
    },
    "extractedText": "John Doe\nSoftware Engineer\nExperience...\n",
    "charCount": 1450,
    "wordCount": 230
  }
}
```
