import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Upstash Redis 설정이 있는 경우에만 사용
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  // 10초당 10회 제한
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
  });
}

// Rate limiting 체크 함수
export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  if (!ratelimit) {
    // Rate limiting이 설정되지 않은 경우 항상 성공
    return {
      success: true,
      limit: 10,
      remaining: 10,
      reset: Date.now() + 10000,
    };
  }

  const result = await ratelimit.limit(identifier);
  return result;
}

export default ratelimit;