import prisma from '@/lib/prisma';
import redis from '@/lib/redis';

export async function GET() {
  const health: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {},
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    (health.services as Record<string, string>).database = 'connected';
  } catch {
    (health.services as Record<string, string>).database = 'disconnected';
    health.status = 'degraded';
  }

  // Check Redis connection
  try {
    if (redis) {
      await redis.ping();
      (health.services as Record<string, string>).redis = 'connected';
    } else {
      (health.services as Record<string, string>).redis = 'not configured';
    }
  } catch {
    (health.services as Record<string, string>).redis = 'disconnected';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;

  return Response.json(health, { status: statusCode });
}
