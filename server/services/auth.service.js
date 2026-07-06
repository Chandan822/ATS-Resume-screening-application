import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';
import * as userRepository from '../repositories/user.repository.js';
import { logAuditAction } from '../utils/auditLogger.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

/**
 * Generate JWT Access Token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};

/**
 * Generate Cryptographic Refresh Token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Sanitize User Object (Strip sensitive fields)
 */
const sanitizeUser = (user) => {
  const {
    passwordHash,
    emailVerificationToken,
    emailVerificationExpires,
    passwordResetToken,
    passwordResetExpires,
    ...sanitized
  } = user;
  return sanitized;
};

/**
 * Register User
 */
export const registerUser = async (data, req = null) => {
  const existingUser = await userRepository.findUserByEmail(data.email);
  if (existingUser) {
    const error = new Error('Email address is already registered');
    error.statusCode = 400;
    throw error;
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(data.password, saltRounds);

  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await userRepository.createUserWithProfile(
    {
      email: data.email,
      passwordHash,
      role: data.role || 'CANDIDATE',
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    },
    {
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      designation: data.designation,
    }
  );

  logAuditAction({
    userId: user.id,
    action: 'REGISTER',
    entity: 'User',
    entityId: user.id,
    req,
    changes: { email: user.email, role: user.role },
  }).catch(() => {});

  return {
    user: sanitizeUser(user),
    verificationToken, // Returned for UI testing / email verification simulation
  };
};

/**
 * Login User
 */
export const loginUser = async ({ email, password, role }, req = null) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  if (role && user.role !== role) {
    const actualRole = user.role.charAt(0) + user.role.slice(1).toLowerCase();
    const requestedRole = role.charAt(0) + role.slice(1).toLowerCase();
    const error = new Error(`Access denied. Account is registered as a ${actualRole}, not a ${requestedRole}.`);
    error.statusCode = 403;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  logAuditAction({
    userId: user.id,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user.id,
    req,
    changes: { email: user.email, role: user.role },
  }).catch(() => {});

  // Update last login
  await userRepository.updateLastLogin(user.id);

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshTokenString = generateRefreshToken();
  const refreshTokenExpires = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await userRepository.createRefreshToken(user.id, refreshTokenString, refreshTokenExpires);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken: refreshTokenString,
  };
};

/**
 * Rotate Refresh Token & Issue New Access Token
 */
export const refreshAuthTokens = async (refreshTokenString) => {
  const tokenRecord = await userRepository.findRefreshToken(refreshTokenString);

  if (!tokenRecord || tokenRecord.revokedAt || tokenRecord.expiresAt < new Date()) {
    const error = new Error('Refresh token is invalid, expired, or revoked');
    error.statusCode = 401;
    throw error;
  }

  // Revoke old refresh token (Token Rotation)
  await userRepository.revokeRefreshToken(refreshTokenString);

  const user = tokenRecord.user;
  if (!user.isActive) {
    const error = new Error('User account is inactive');
    error.statusCode = 403;
    throw error;
  }

  // Generate new token pair
  const newAccessToken = generateAccessToken(user);
  const newRefreshTokenString = generateRefreshToken();
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await userRepository.createRefreshToken(user.id, newRefreshTokenString, newExpiresAt);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshTokenString,
  };
};

/**
 * Logout User (Revoke Refresh Token)
 */
export const logoutUser = async (refreshTokenString) => {
  if (refreshTokenString) {
    await userRepository.revokeRefreshToken(refreshTokenString).catch(() => {});
  }
  return { message: 'Logged out successfully' };
};

/**
 * Forgot Password (Request Reset Token)
 */
export const requestPasswordReset = async (email) => {
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    // Return success to prevent email enumeration attacks
    return { message: 'If an account exists with this email, a reset token has been generated.' };
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await userRepository.setPasswordResetToken(user.id, resetToken, expiresAt);

  return {
    message: 'Password reset token generated successfully',
    resetToken, // Returned for UI testing / email link simulation
  };
};

/**
 * Reset Password
 */
export const resetPassword = async ({ token, password }) => {
  const user = await userRepository.findUserByResetToken(token);
  if (!user) {
    const error = new Error('Password reset token is invalid or has expired');
    error.statusCode = 400;
    throw error;
  }

  const saltRounds = 10;
  const newPasswordHash = await bcrypt.hash(password, saltRounds);

  await userRepository.updateUserPassword(user.id, newPasswordHash);
  await userRepository.revokeAllUserRefreshTokens(user.id);

  return { message: 'Password has been reset successfully. You may now login.' };
};

/**
 * Verify Email Token
 */
export const verifyEmailToken = async (token) => {
  const user = await userRepository.findUserByEmailVerificationToken(token);
  if (!user) {
    const error = new Error('Email verification token is invalid or expired');
    error.statusCode = 400;
    throw error;
  }

  await userRepository.markEmailAsVerified(user.id);

  return { message: 'Email address verified successfully' };
};
