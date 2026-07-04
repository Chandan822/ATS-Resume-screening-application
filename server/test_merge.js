import { fetchGitHubData, mergeSocialDataToCandidateProfile } from './services/socialIntegration.service.js';
import prisma from './config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const email = 'dashdrive316@gmail.com';
  console.log(`Diagnostic merge simulation for candidate: ${email}...`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { candidate: true }
    });
    
    if (!user || !user.candidate) {
      console.error('Candidate user not found!');
      return;
    }
    
    console.log('Fetching live github data for dashdrive316-eng...');
    const githubData = await fetchGitHubData('dashdrive316-eng');
    console.log('GitHub Data Extracted Skills:', githubData.extractedSkills);
    
    console.log('Running mergeSocialDataToCandidateProfile...');
    const mergeResult = await mergeSocialDataToCandidateProfile(user.id, { githubData, linkedinData: null });
    
    console.log('Merge completed successfully!');
    console.log('Result:', mergeResult);
    
    // Check skills in database now
    const dbSkills = await prisma.candidateSkill.findMany({
      where: { candidateId: user.candidate.id },
      include: { skill: true }
    });
    console.log('Skills in DB after merge:', dbSkills.map(s => s.skill.name));
    
  } catch (error) {
    console.error('Merge failure:', error);
  }
}

run().finally(() => prisma.$disconnect());
