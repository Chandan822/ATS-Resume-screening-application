import prisma from '../config/db.js';

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      candidate: true,
      recruiter: {
        include: { company: true },
      },
    },
  });
};

export const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      candidate: true,
      recruiter: {
        include: { company: true },
      },
    },
  });
};

export const createUserWithProfile = async (userData, profileData) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: userData.email.toLowerCase(),
        passwordHash: userData.passwordHash,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || null,
        emailVerificationToken: userData.emailVerificationToken,
        emailVerificationExpires: userData.emailVerificationExpires,
      },
    });

    if (userData.role === 'CANDIDATE') {
      await tx.candidate.create({
        data: {
          userId: user.id,
        },
      });
    } else if (userData.role === 'RECRUITER' && profileData?.companyName) {
      // Find or create company
      const companySlug = profileData.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let company = await tx.company.findUnique({ where: { slug: companySlug } });

      if (!company) {
        company = await tx.company.create({
          data: {
            name: profileData.companyName,
            slug: companySlug,
            website: profileData.companyWebsite || null,
          },
        });
      }

      await tx.recruiter.create({
        data: {
          userId: user.id,
          companyId: company.id,
          designation: profileData.designation || 'Hiring Manager',
        },
      });
    }

    return tx.user.findUnique({
      where: { id: user.id },
      include: { candidate: true, recruiter: { include: { company: true } } },
    });
  });
};

export const createRefreshToken = async (userId, token, expiresAt) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
};

export const findRefreshToken = async (token) => {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
};

export const revokeRefreshToken = async (token) => {
  return prisma.refreshToken.update({
    where: { token },
    data: { revokedAt: new Date() },
  });
};

export const revokeAllUserRefreshTokens = async (userId) => {
  return prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const updateUserPassword = async (userId, passwordHash) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
};

export const setPasswordResetToken = async (userId, token, expiresAt) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expiresAt,
    },
  });
};

export const findUserByResetToken = async (token) => {
  return prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { gt: new Date() },
    },
  });
};

export const findUserByEmailVerificationToken = async (token) => {
  return prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { gt: new Date() },
    },
  });
};

export const markEmailAsVerified = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });
};

export const updateLastLogin = async (userId) => {
  return prisma.user.update({
    where: { id: userId },
    data: { lastLoginAt: new Date() },
  });
};
