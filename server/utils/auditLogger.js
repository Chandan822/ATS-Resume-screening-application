import prisma from '../config/db.js';

/**
 * Central Audit Logging Utility
 * Asynchronously logs important system actions to database
 */
export const logAuditAction = async ({ userId = null, action, entity, entityId = null, req = null, changes = null }) => {
  try {
    let ipAddress = '127.0.0.1';
    let userAgent = 'Unknown Browser';

    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      userAgent = req.headers['user-agent'] || 'Unknown Browser';
    }

    const auditLog = await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        ipAddress: typeof ipAddress === 'string' ? ipAddress : String(ipAddress),
        userAgent: typeof userAgent === 'string' ? userAgent.slice(0, 255) : String(userAgent).slice(0, 255),
        changes: changes ? JSON.parse(JSON.stringify(changes)) : null,
      },
    });

    return auditLog;
  } catch (err) {
    console.warn(`[Audit Logger Warning] Failed to persist audit log: ${err.message}`);
    return null;
  }
};
