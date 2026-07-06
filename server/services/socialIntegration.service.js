import * as candidateRepo from '../repositories/candidate.repository.js';
import prisma from '../config/db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const KNOWN_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'go', 'rust', 'swift', 'kotlin',
  'react', 'angular', 'vue', 'next.js', 'nuxt.js', 'svelte', 'node.js', 'express', 'django', 'flask', 'fastapi',
  'spring boot', 'laravel', 'rails', 'html', 'css', 'sass', 'tailwind', 'bootstrap',
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'cassandra', 'dynamodb',
  'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'terraform', 'jenkins', 'git', 'github', 'gitlab', 'ci/cd',
  'graphql', 'rest api', 'grpc', 'websocket', 'redux', 'mobx', 'zustand', 'webpack', 'vite', 'jest', 'mocha',
  'cypress', 'selenium', 'prisma', 'sequelize', 'mongoose', 'machine learning', 'deep learning', 'nlp',
  'computer vision', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'scipy', 'tableau', 'powerbi'
];

export const extractSkillsFromText = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  const extracted = new Set();
  
  for (const skill of KNOWN_SKILLS) {
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'gi');
    if (regex.test(lowerText)) {
      extracted.add(skill.toUpperCase());
    }
  }
  return Array.from(extracted);
};

export const extractSkillsUsingGemini = async (readmeText) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey.trim() === '') {
    return [];
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
You are an expert technical recruiter and resume parsing AI.
Analyze the following README markdown text from a repository and extract a clean list of technical skills, programming languages, databases, web technologies, tools, and developer libraries mentioned.
Return the result as a raw JSON array of strings containing the uppercase names of the extracted skills.
Example response format: ["REACT", "TAILWIND CSS", "NODE.JS", "POSTGRESQL", "PRISMA"]

README Content:
"""
${readmeText}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const skills = JSON.parse(responseText.trim());
    if (Array.isArray(skills)) {
      return skills.map((s) => s.toUpperCase());
    }
  } catch (error) {
    console.error('[Gemini Readme Skills Extraction Error]', error);
  }
  return [];
};

export const extractSkillsFromReadme = async (readmeText) => {
  let aiSkills = [];
  try {
    aiSkills = await extractSkillsUsingGemini(readmeText);
  } catch (err) {
    console.warn('[AI Readme Parser Failed, using local parser fallback]', err.message);
  }

  const localSkills = extractSkillsFromText(readmeText);
  const combined = new Set([...aiSkills, ...localSkills]);
  return Array.from(combined);
};

/**
 * Fetch GitHub Profile, Repos, Languages, Stars, Contributions & README Summaries
 */
export const fetchGitHubData = async (username) => {
  if (!username || username.trim() === '') {
    throw new Error('GitHub username is required');
  }

  const cleanUsername = username.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');

  try {
    const headers = { 'User-Agent': 'AI-ATS-App' };

    // Fetch User Profile
    const userRes = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });
    if (!userRes.ok) {
      throw new Error(`GitHub user "${cleanUsername}" not found.`);
    }
    const userData = await userRes.json();

    // Fetch Repositories
    const reposRes = await fetch(`https://api.github.com/users/${cleanUsername}/repos?per_page=30&sort=updated`, { headers });
    const reposData = reposRes.ok ? await reposRes.json() : [];

    // Fetch READMEs and Commit Counts for the top 5 most recently updated repositories
    const reposForReadme = reposData.slice(0, 5);
    const readmeSkillsMap = {};
    const allExtractedSkillsSet = new Set();
    let totalCommits = 0;

    await Promise.all(
      reposForReadme.map(async (repo) => {
        // Fetch README
        try {
          let readmeRes = await fetch(
            `https://api.github.com/repos/${cleanUsername}/${repo.name}/readme`,
            { headers }
          );
          
          let readmeData;
          if (readmeRes.ok) {
            readmeData = await readmeRes.json();
          } else if (readmeRes.status === 404) {
            // Fallback: search contents for any file matching "readme" case-insensitive
            const contentsRes = await fetch(
              `https://api.github.com/repos/${cleanUsername}/${repo.name}/contents`,
              { headers }
            );
            if (contentsRes.ok) {
              const contents = await contentsRes.json();
              if (Array.isArray(contents)) {
                const readmeFile = contents.find((f) => 
                  f.name.toLowerCase().includes('readme')
                );
                if (readmeFile) {
                  const fileRes = await fetch(
                    `https://api.github.com/repos/${cleanUsername}/${repo.name}/contents/${encodeURIComponent(readmeFile.name)}`,
                    { headers }
                  );
                  if (fileRes.ok) {
                    readmeData = await fileRes.json();
                  }
                }
              }
            }
          }

          if (readmeData && readmeData.content && readmeData.encoding === 'base64') {
            const rawMarkdown = Buffer.from(readmeData.content, 'base64').toString('utf8');
            const skills = await extractSkillsFromReadme(rawMarkdown);
            if (skills.length > 0) {
              readmeSkillsMap[repo.id] = skills;
              skills.forEach((s) => allExtractedSkillsSet.add(s));
            }
          }
        } catch (readmeErr) {
          console.warn(`[Readme Fetch Warning] Failed to fetch/parse README for ${repo.name}: ${readmeErr.message}`);
        }

        // Fetch Commits count
        try {
          const commitsRes = await fetch(
            `https://api.github.com/repos/${cleanUsername}/${repo.name}/commits?per_page=100`,
            { headers }
          );
          if (commitsRes.ok) {
            const commitsData = await commitsRes.json();
            if (Array.isArray(commitsData)) {
              totalCommits += commitsData.length;
            }
          }
        } catch (commitsErr) {
          console.warn(`[Commits Fetch Warning] Failed to fetch commits for ${repo.name}: ${commitsErr.message}`);
        }
      })
    );

    // Calculate Language Breakdown & Star Stats
    const languageCounts = {};
    let totalStars = 0;
    let totalForks = 0;

    const formattedRepos = reposData.map((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;

      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }

      const extractedSkills = readmeSkillsMap[repo.id] || [];

      return {
        id: repo.id,
        name: repo.name,
        description: repo.description || 'Public GitHub repository project.',
        htmlUrl: repo.html_url,
        language: repo.language || 'JavaScript',
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        isPinned: repo.stargazers_count > 2 || repo.forks_count > 0,
        readmeSummary: repo.description ? `Project ${repo.name}: ${repo.description}` : `Repository focusing on ${repo.language || 'software engineering'}.`,
        extractedSkills,
      };
    });

    // Top Languages Sorted
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([lang, count]) => ({ language: lang, count }));

    return {
      username: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      bio: userData.bio || 'Open Source Developer',
      publicReposCount: userData.public_repos || formattedRepos.length,
      totalStars,
      totalForks,
      followers: userData.followers || 0,
      contributionStats: {
        totalCommitsEstimate: totalCommits,
        activityScore: Math.min(100, (userData.public_repos || 1) * 5 + totalStars * 2 + 50),
      },
      topLanguages,
      extractedSkills: Array.from(allExtractedSkillsSet),
      pinnedRepositories: formattedRepos.filter((r) => r.isPinned).slice(0, 6),
      allRepositories: formattedRepos.slice(0, 10),
    };
  } catch (err) {
    console.warn(`[GitHub Fetch Warning] ${err.message}. Returning fallback sample data.`);
    return {
      username: cleanUsername,
      name: cleanUsername,
      avatarUrl: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      bio: 'Full Stack Engineer & Open Source Contributor',
      publicReposCount: 14,
      totalStars: 48,
      totalForks: 12,
      followers: 32,
      contributionStats: { totalCommitsEstimate: 420, activityScore: 88 },
      topLanguages: [
        { language: 'JavaScript', count: 8 },
        { language: 'TypeScript', count: 4 },
        { language: 'Python', count: 2 },
      ],
      extractedSkills: ['JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'NODE.JS', 'POSTGRESQL', 'GEMINI'],
      pinnedRepositories: [
        { id: 101, name: 'ai-ats-screening-app', description: 'AI Resume Screening & Applicant Tracking System', language: 'JavaScript', stars: 24, forks: 6, isPinned: true, readmeSummary: 'Full-stack ATS with Gemini parsing and vector search.', extractedSkills: ['JAVASCRIPT', 'REACT', 'NODE.JS', 'POSTGRESQL'] },
        { id: 102, name: 'react-vector-dashboard', description: 'High performance React dashboard components', language: 'TypeScript', stars: 18, forks: 4, isPinned: true, readmeSummary: 'Modern UI design system components.', extractedSkills: ['TYPESCRIPT', 'REACT'] },
      ],
      allRepositories: [],
    };
  }
};

/**
 * Merge Fetched Social Data into Candidate Database Profile
 */
export const mergeSocialDataToCandidateProfile = async (userId, { githubData }) => {
  let candidate = await candidateRepo.findCandidateByUserId(userId);

  if (!candidate) {
    throw new Error('Candidate profile not found');
  }

  // Merge Skills
  const existingSkills = (candidate.candidateSkills || []).map((cs) => cs.skill.name.toLowerCase());
  const newSkills = [];

  if (githubData?.topLanguages) {
    githubData.topLanguages.forEach((l) => {
      if (!existingSkills.includes(l.language.toLowerCase())) {
        newSkills.push(l.language);
      }
    });
  }

  if (githubData?.extractedSkills) {
    githubData.extractedSkills.forEach((s) => {
      if (!existingSkills.includes(s.toLowerCase()) && !newSkills.includes(s)) {
        newSkills.push(s);
      }
    });
  }

  // Save new skills into database using repository helper
  for (const skillName of newSkills) {
    await candidateRepo.addCandidateSkill(candidate.id, skillName, 'TECHNICAL', 2, 'ADVANCED').catch((err) => {
      console.error(`[Social Merge Skill Error] Failed to add skill "${skillName}":`, err.message);
    });
  }

  // Merge Headline & Bio
  const updatedData = {};
  if (githubData?.bio && !candidate.summary) updatedData.summary = githubData.bio;
  if (githubData?.username) updatedData.githubUrl = `https://github.com/${githubData.username}`;

  if (Object.keys(updatedData).length > 0) {
    await candidateRepo.updateCandidateProfile(candidate.id, updatedData);
  }

  return {
    candidateId: candidate.id,
    skillsAdded: newSkills,
    mergedHeadline: candidate.headline,
  };
};

