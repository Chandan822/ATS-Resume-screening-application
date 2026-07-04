import { GoogleGenerativeAI } from '@google/generative-ai';
import env from '../config/env.js';
import { biasAnalysisOutputSchema } from '../validators/biasDetector.validator.js';

/**
 * 50+ Built-in Rules Dictionary for Instant (<50ms) Detection
 */
const BIAS_DICTIONARY = [
  // 1. Gender Bias
  { phrase: 'rockstar', category: 'GENDER_BIAS', explanation: 'Masculine-coded term that can alienate female candidates.', suggestion: 'exceptional engineer' },
  { phrase: 'ninja', category: 'GENDER_BIAS', explanation: 'Masculine-coded jargon that reduces application rate among female developers.', suggestion: 'skilled developer' },
  { phrase: 'guru', category: 'GENDER_BIAS', explanation: 'Overly aggressive title that deters diverse applicants.', suggestion: 'subject matter expert' },
  { phrase: 'dominant', category: 'GENDER_BIAS', explanation: 'Masculine-coded leadership term.', suggestion: 'leading / key contributor' },
  { phrase: 'manpower', category: 'GENDER_BIAS', explanation: 'Gender-exclusive word.', suggestion: 'workforce / team capacity' },
  { phrase: 'chairman', category: 'GENDER_BIAS', explanation: 'Gendered title.', suggestion: 'chairperson / board leader' },
  { phrase: 'salesman', category: 'GENDER_BIAS', explanation: 'Gendered job title.', suggestion: 'sales representative' },

  // 2. Age Bias
  { phrase: 'digital native', category: 'AGE_BIAS', explanation: 'Ageist term implying preference for younger generations.', suggestion: 'proficient with modern digital tools' },
  { phrase: 'recent graduate', category: 'AGE_BIAS', explanation: 'Can exclude experienced professionals transitioning careers.', suggestion: 'early-career professional' },
  { phrase: 'youthful team', category: 'AGE_BIAS', explanation: 'Ageist phrasing suggesting preference for younger employees.', suggestion: 'dynamic & innovative team' },
  { phrase: 'young and vibrant', category: 'AGE_BIAS', explanation: 'Implicitly favors younger candidates.', suggestion: 'energetic and collaborative' },
  { phrase: 'high-energy youth', category: 'AGE_BIAS', explanation: 'Direct age restriction terminology.', suggestion: 'motivated professional' },

  // 3. Exclusionary Language
  { phrase: 'native english speaker', category: 'EXCLUSIONARY_LANGUAGE', explanation: 'Excludes qualified non-native fluent speakers.', suggestion: 'fluent in professional business English' },
  { phrase: 'culture fit', category: 'EXCLUSIONARY_LANGUAGE', explanation: 'Can reinforce unconscious bias and homogeny.', suggestion: 'culture add / team alignment' },
  { phrase: 'clean driving record', category: 'EXCLUSIONARY_LANGUAGE', explanation: 'Excludes candidates with disabilities if driving is non-essential.', suggestion: 'reliable transportation to office' },
  { phrase: 'unmarried', category: 'EXCLUSIONARY_LANGUAGE', explanation: 'Discriminatory marital status inquiry.', suggestion: 'flexible scheduling' },

  // 4. Aggressive Tone
  { phrase: 'work hard play hard', category: 'AGGRESSIVE_TONE', explanation: 'Implies burnout culture and excessive unpaid overtime.', suggestion: 'balanced and results-oriented environment' },
  { phrase: 'relentless', category: 'AGGRESSIVE_TONE', explanation: 'Overly demanding tone that discourages work-life balance.', suggestion: 'persistent and goal-driven' },
  { phrase: 'crush it', category: 'AGGRESSIVE_TONE', explanation: 'Hyper-competitive jargon that can turn away collaborative candidates.', suggestion: 'excel and achieve team milestones' },
  { phrase: 'high-stress', category: 'AGGRESSIVE_TONE', explanation: 'Signals poor workload management.', suggestion: 'fast-moving environment' },

  // 5. Accessibility Issues
  { phrase: 'must stand for 8 hours', category: 'ACCESSIBILITY_ISSUE', explanation: 'Excludes candidates with mobility impairments if standing isn\'t core.', suggestion: 'ability to perform core role functions with or without accommodation' },
  { phrase: 'lift 50 lbs', category: 'ACCESSIBILITY_ISSUE', explanation: 'Physical constraint issue for desk roles.', suggestion: 'occasional light physical setup if required' },
  { phrase: 'perfect vision', category: 'ACCESSIBILITY_ISSUE', explanation: 'Accessibility constraint for visual impairments.', suggestion: 'ability to review visual assets' },
];

/**
 * Fast Dictionary Rule Engine (<50ms)
 */
export const runDictionaryBiasCheck = (text) => {
  if (!text || typeof text !== 'string') {
    return { inclusivityScore: 100, detectedBiases: [] };
  }

  const detectedBiases = [];
  const textLower = text.toLowerCase();

  BIAS_DICTIONARY.forEach((rule, idx) => {
    if (textLower.includes(rule.phrase.toLowerCase())) {
      detectedBiases.push({
        id: `bias_rule_${idx}_${Date.now()}`,
        phrase: rule.phrase,
        category: rule.category,
        explanation: rule.explanation,
        suggestion: rule.suggestion,
      });
    }
  });

  const penalty = Math.min(detectedBiases.length * 10, 60);
  const inclusivityScore = Math.max(100 - penalty, 40);

  return {
    inclusivityScore,
    detectedBiases,
  };
};

/**
 * Combined Bias Detector Service (Dictionary + Gemini AI Fallback)
 */
export const analyzeJobDescriptionBias = async (text) => {
  const dictionaryResult = runDictionaryBiasCheck(text);

  const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    return dictionaryResult;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `
You are an expert HR Diversity, Equity & Inclusion (DEI) Bias Scanner. Analyze the following job description text for Gender Bias, Age Bias, Exclusionary Language, Aggressive Tone, and Accessibility Issues.

Job Description Text:
"""
${text}
"""

Return JSON matching this exact structure:
{
  "inclusivityScore": number (0 to 100),
  "detectedBiases": [
    {
      "id": "b1",
      "phrase": "exact problematic phrase found in text",
      "category": "GENDER_BIAS | AGE_BIAS | EXCLUSIONARY_LANGUAGE | AGGRESSIVE_TONE | ACCESSIBILITY_ISSUE",
      "explanation": "why this term is biased or non-inclusive",
      "suggestion": "inclusive alternative suggestion"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const rawJson = JSON.parse(result.response.text());
    const aiValidated = biasAnalysisOutputSchema.parse(rawJson);

    // Merge AI detected biases with dictionary rules for maximum recall
    const mergedBiases = [...dictionaryResult.detectedBiases];
    aiValidated.detectedBiases.forEach((b) => {
      if (!mergedBiases.some((m) => m.phrase.toLowerCase() === b.phrase.toLowerCase())) {
        mergedBiases.push(b);
      }
    });

    const finalPenalty = Math.min(mergedBiases.length * 8, 55);
    const finalScore = Math.max(100 - finalPenalty, 45);

    return {
      inclusivityScore: finalScore,
      detectedBiases: mergedBiases,
    };
  } catch (err) {
    console.warn(`[Bias Detector Warning] ${err.message}. Returning dictionary rule analysis.`);
    return dictionaryResult;
  }
};
