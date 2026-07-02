import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import { aiParsedResumeSchema } from '../validators/aiResume.validator.js';

/**
 * Fallback Regex Heuristic Parser for Malformed Resumes or Missing API Keys
 */
export const fallbackHeuristicParser = (text) => {
  if (!text) {
    return {
      name: null,
      email: null,
      phone: null,
      location: null,
      summary: null,
      skills: [],
      experience: [],
      education: [],
      projects: [],
      languages: [],
      certifications: [],
    };
  }

  // Extract Email via Regex
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : null;

  // Extract Phone via Regex
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  // Heuristic Name: First non-empty line
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const name = lines.length > 0 && lines[0].length < 40 ? lines[0] : null;

  // Extract Common Skills Keyword Matches
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java',
    'C++', 'PostgreSQL', 'MongoDB', 'SQL', 'Docker', 'Kubernetes', 'AWS', 'Git',
    'TailwindCSS', 'HTML', 'CSS', 'REST API', 'GraphQL', 'Next.js'
  ];
  const foundSkills = commonSkills.filter((s) => new RegExp(`\\b${s}\\b`, 'i').test(text));

  return {
    name,
    email,
    phone,
    location: null,
    summary: lines.slice(1, 4).join(' '),
    skills: foundSkills,
    experience: [],
    education: [],
    projects: [],
    languages: ['English'],
    certifications: [],
  };
};

/**
 * Main AI Resume Parser with Gemini / OpenAI API, Retries & Zod Validation
 */
export const parseResumeTextWithAI = async (resumeText) => {
  if (!resumeText || resumeText.trim().length === 0) {
    return fallbackHeuristicParser(resumeText);
  }

  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

  // Fallback if no API key provided
  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    console.info('[AI Parser] No valid GEMINI_API_KEY configured. Running Heuristic Parser Fallback.');
    return fallbackHeuristicParser(resumeText);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const prompt = `
You are an expert HR Resume Parsing Engine. Analyze the following candidate resume text and extract structured information into JSON format.

Resume Text:
"""
${resumeText}
"""

Return JSON matching this exact structure:
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "location": "string or null",
  "summary": "string or null",
  "skills": ["array of strings"],
  "experience": [
    {
      "companyName": "string",
      "jobTitle": "string",
      "startDate": "YYYY-MM or string or null",
      "endDate": "YYYY-MM or string or null",
      "isCurrentJob": boolean,
      "description": "string or null"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string or null",
      "startDate": "YYYY-MM or string or null",
      "endDate": "YYYY-MM or string or null"
    }
  ],
  "projects": [
    {
      "title": "string",
      "description": "string or null",
      "projectUrl": "string or null"
    }
  ],
  "languages": ["array of strings"],
  "certifications": ["array of strings"]
}
`;

  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const rawJson = JSON.parse(responseText);
      const validatedData = aiParsedResumeSchema.parse(rawJson);
      return validatedData;
    } catch (err) {
      lastError = err;
      console.warn(`[AI Parser] Attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      // Wait exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }

  console.error('[AI Parser] All retries failed. Reverting to Heuristic Fallback Parser.', lastError?.message);
  return fallbackHeuristicParser(resumeText);
};
