/**
 * ATS Resume Scoring Engine
 * Evaluates resumes across 8 section criteria and generates actionable suggestions
 */

export const calculateAtsScore = (rawText = '', parsedData = {}) => {
  const text = rawText || '';
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const suggestions = [];

  // 1. Formatting Score (10%)
  let formattingScore = 60;
  const standardHeaders = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
  const foundHeaders = standardHeaders.filter((h) => new RegExp(`\\b${h}\\b`, 'i').test(text));
  formattingScore += Math.min(foundHeaders.length * 8, 40);
  if (foundHeaders.length < 3) {
    suggestions.push('Format: Add clear section headings like "Summary", "Work Experience", and "Education".');
  }

  // 2. Skills Score (15%)
  let skillsScore = 40;
  const extractedSkills = parsedData?.skills || [];
  if (extractedSkills.length >= 10) {
    skillsScore = 100;
  } else if (extractedSkills.length >= 6) {
    skillsScore = 85;
  } else if (extractedSkills.length >= 3) {
    skillsScore = 70;
  } else if (extractedSkills.length > 0) {
    skillsScore = 55;
  } else {
    // Fallback regex keyword count
    const skillMatches = text.match(/\b(JavaScript|React|Node\.js|Python|Java|SQL|AWS|Docker|TypeScript|Git|HTML|CSS)\b/gi) || [];
    skillsScore = Math.min(40 + skillMatches.length * 8, 90);
  }
  if (skillsScore < 75) {
    suggestions.push('Skills: Include a dedicated Technical & Core Skills section listing key industry tools.');
  }

  // 3. Action Keywords Score (15%)
  let keywordsScore = 50;
  const actionVerbs = [
    'developed', 'managed', 'spearheaded', 'architected', 'optimized', 'scaled',
    'implemented', 'created', 'designed', 'engineered', 'led', 'delivered', 'increased', 'reduced'
  ];
  const matchedVerbs = actionVerbs.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(text));
  keywordsScore += Math.min(matchedVerbs.length * 6, 50);
  if (matchedVerbs.length < 4) {
    suggestions.push('Keywords: Use strong action verbs at the start of bullet points (e.g., "Architected", "Spearheaded").');
  }

  // 4. Experience Score (15%)
  let experienceScore = 50;
  const expList = parsedData?.experience || [];
  if (expList.length >= 3) {
    experienceScore = 100;
  } else if (expList.length === 2) {
    experienceScore = 85;
  } else if (expList.length === 1) {
    experienceScore = 70;
  } else {
    // Regex check for work history keywords
    if (/experience|work history|employment/i.test(text)) experienceScore += 30;
  }
  if (experienceScore < 75) {
    suggestions.push('Experience: Detail company names, job titles, and bulleted achievements for past positions.');
  }

  // 5. Education Score (10%)
  let educationScore = 50;
  const eduList = parsedData?.education || [];
  if (eduList.length > 0) {
    educationScore = 95;
  } else if (/university|college|bachelor|master|degree|b\.s\.|m\.s\./i.test(text)) {
    educationScore = 85;
  } else {
    educationScore = 40;
  }
  if (educationScore < 75) {
    suggestions.push('Education: Clearly state your degree title, field of study, and institution name.');
  }

  // 6. Grammar & Tone Score (10%)
  let grammarScore = 85;
  const firstPersonCount = (text.match(/\b(I|me|my|we|our)\b/gi) || []).length;
  if (firstPersonCount > 5) {
    grammarScore -= 25;
    suggestions.push('Grammar: Avoid first-person pronouns ("I", "my") in resume bullet points.');
  } else if (firstPersonCount > 2) {
    grammarScore -= 10;
  }

  // 7. Quantified Achievements Score (15%)
  let achievementsScore = 40;
  const metricMatches = text.match(/(\$\d+|\d+%\b|\b\d+x\b|\d+\s*percent|\$\d+\s*k|\$\d+\s*m)/gi) || [];
  achievementsScore += Math.min(metricMatches.length * 15, 60);
  if (metricMatches.length < 2) {
    suggestions.push('Achievements: Add measurable numbers and percentages (e.g., "Increased performance by 35%").');
  }

  // 8. Length Score (10%)
  let lengthScore = 100;
  if (wordCount < 200) {
    lengthScore = 40;
    suggestions.push('Length: Your resume is too short (<200 words). Expand your summary and work responsibilities.');
  } else if (wordCount < 350) {
    lengthScore = 70;
    suggestions.push('Length: Consider elaborating on key achievements to reach an optimal length of 400-800 words.');
  } else if (wordCount > 1200) {
    lengthScore = 75;
    suggestions.push('Length: Your resume exceeds 1,200 words. Trim redundant bullets to keep it concise.');
  }

  // Calculate Weighted Overall Score
  const overallScore = Math.round(
    formattingScore * 0.10 +
    skillsScore * 0.15 +
    keywordsScore * 0.15 +
    experienceScore * 0.15 +
    educationScore * 0.10 +
    grammarScore * 0.10 +
    achievementsScore * 0.15 +
    lengthScore * 0.10
  );

  let scoreGrade = 'NEEDS_IMPROVEMENT';
  if (overallScore >= 85) scoreGrade = 'EXCELLENT';
  else if (overallScore >= 70) scoreGrade = 'GOOD';
  else if (overallScore >= 55) scoreGrade = 'FAIR';

  return {
    overallScore,
    scoreGrade,
    wordCount,
    sectionScores: {
      formatting: Math.min(Math.max(formattingScore, 0), 100),
      skills: Math.min(Math.max(skillsScore, 0), 100),
      keywords: Math.min(Math.max(keywordsScore, 0), 100),
      experience: Math.min(Math.max(experienceScore, 0), 100),
      education: Math.min(Math.max(educationScore, 0), 100),
      grammar: Math.min(Math.max(grammarScore, 0), 100),
      achievements: Math.min(Math.max(achievementsScore, 0), 100),
      length: Math.min(Math.max(lengthScore, 0), 100),
    },
    suggestions: suggestions.length > 0 ? suggestions : ['Your resume aligns well with standard ATS guidelines!'],
  };
};
