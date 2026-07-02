import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import prisma from '../config/db.js';
import { interviewQuestionKitSchema } from '../validators/interviewQuestion.validator.js';

/**
 * Fallback Heuristic Question Generator
 */
export const fallbackQuestionGenerator = (candidateName = 'Candidate', jobTitle = 'Software Engineer') => {
  return {
    technical: [
      {
        id: 't1',
        question: `Can you explain your technical approach to building scalable backend services for ${jobTitle}?`,
        difficulty: 'MEDIUM',
        expectedAnswer: 'Should cover API architecture, database indexing, caching strategies, and load management.',
      },
      {
        id: 't2',
        question: 'How do you handle asynchronous tasks and error recovery in distributed systems?',
        difficulty: 'HARD',
        expectedAnswer: 'Should discuss message queues, retry policies, dead-letter queues, and circuit breakers.',
      },
      {
        id: 't3',
        question: 'What strategies do you use for database schema migrations with zero downtime?',
        difficulty: 'EASY',
        expectedAnswer: 'Should explain multi-step migration scripts, backward compatibility, and feature flags.',
      },
    ],
    behavioral: [
      {
        id: 'b1',
        question: 'Describe a time when you had to resolve a high-priority production outage under tight pressure.',
        difficulty: 'MEDIUM',
        expectedAnswer: 'STAR method response highlighting root-cause analysis, team communication, and post-mortem actions.',
      },
      {
        id: 'b2',
        question: 'How do you prioritize competing feature requests from product managers and technical debt cleanup?',
        difficulty: 'EASY',
        expectedAnswer: 'Focus on business value impact, risk assessment, and technical debt allocation frameworks.',
      },
    ],
    coding: [
      {
        id: 'c1',
        question: 'Design an LRU Cache with O(1) time complexity for get and put operations.',
        difficulty: 'HARD',
        expectedAnswer: 'Doubly linked list combined with Hash Map data structure.',
      },
      {
        id: 'c2',
        question: 'Write a function to validate nested parenthetical expressions in a given string.',
        difficulty: 'EASY',
        expectedAnswer: 'Stack-based matching algorithm.',
      },
    ],
  };
};

/**
 * Main AI Interview Question Generator with Gemini API + Zod Validation
 */
export const generateInterviewQuestions = async ({ resumeText, jobDescription, candidateExperience, candidateName, jobTitle }) => {
  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    return fallbackQuestionGenerator(candidateName, jobTitle);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const prompt = `
You are an expert Technical Hiring Manager. Generate a customized interview question kit based on the following candidate resume and target job requisition.

Candidate Resume Text:
"""
${resumeText || 'Full Stack Engineer with React and Node.js experience'}
"""

Job Requisition:
"""
${jobDescription || 'Senior Software Engineer'}
"""

Generate JSON matching this exact structure with Technical, Behavioral, and Coding questions, tagging each question with difficulty ("EASY", "MEDIUM", or "HARD"):

{
  "technical": [
    {
      "id": "t1",
      "question": "string",
      "difficulty": "EASY|MEDIUM|HARD",
      "expectedAnswer": "string"
    }
  ],
  "behavioral": [
    {
      "id": "b1",
      "question": "string",
      "difficulty": "EASY|MEDIUM|HARD",
      "expectedAnswer": "string"
    }
  ],
  "coding": [
    {
      "id": "c1",
      "question": "string",
      "difficulty": "EASY|MEDIUM|HARD",
      "expectedAnswer": "string"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const rawJson = JSON.parse(result.response.text());
    return interviewQuestionKitSchema.parse(rawJson);
  } catch (err) {
    console.warn(`[AI Question Generator Warning] ${err.message}. Using fallback question kit.`);
    return fallbackQuestionGenerator(candidateName, jobTitle);
  }
};

/**
 * Save Interview Questions Kit to InterviewRound
 */
export const saveInterviewQuestions = async (interviewRoundId, questionKit) => {
  const validated = interviewQuestionKitSchema.parse(questionKit);
  return prisma.interviewRound.update({
    where: { id: interviewRoundId },
    data: { questions: validated },
  });
};

/**
 * Fetch Saved Interview Questions Kit
 */
export const getInterviewQuestions = async (interviewRoundId) => {
  const round = await prisma.interviewRound.findUnique({
    where: { id: interviewRoundId },
  });

  if (!round) throw new Error('Interview round not found');
  return round.questions || fallbackQuestionGenerator();
};
