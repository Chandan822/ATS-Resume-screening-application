import prisma from '../config/db.js';

/**
 * Get Searchable Audit Logs with Multi-Criteria Filtering
 */
export const getAuditLogs = async ({ search = '', userId = '', action = '', entity = '', dateRange = 'all', page = 1, limit = 20 }) => {
  const where = {};

  if (search) {
    where.OR = [
      { action: { contains: search, mode: 'insensitive' } },
      { entity: { contains: search, mode: 'insensitive' } },
      { ipAddress: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entity) where.entity = entity;

  if (dateRange && dateRange !== 'all') {
    const now = new Date();
    let startDate = new Date();
    if (dateRange === '24h') startDate.setDate(now.getDate() - 1);
    if (dateRange === '7d') startDate.setDate(now.getDate() - 7);
    if (dateRange === '30d') startDate.setDate(now.getDate() - 30);
    where.createdAt = { gte: startDate };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [logs, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    totalCount,
    page: parseInt(page),
    totalPages: Math.ceil(totalCount / limit) || 1,
  };
};
