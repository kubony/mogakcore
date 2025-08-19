import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getParticipationsCollection } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/ratelimit';
import type { CancelRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 체크
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimit = await checkRateLimit(`cancel:${ip}`);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
          }
        }
      );
    }

    const body: CancelRequest = await request.json();
    const { date, time, browserId, password } = body;

    // 입력 검증
    if (!date || !time || !browserId || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 날짜 형식 검증
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // 코어 타임 검증
    if (!['1000', '1500', '2000', '2200'].includes(time)) {
      return NextResponse.json(
        { success: false, error: 'Invalid core time' },
        { status: 400 }
      );
    }

    // 비밀번호 형식 검증 (4자리 숫자)
    if (!/^\d{4}$/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be 4 digits' },
        { status: 400 }
      );
    }

    const collection = await getParticipationsCollection();

    // 참여 정보 조회
    const participation = await collection.findOne({
      date,
      coreTime: time,
      browserId
    });

    if (!participation) {
      return NextResponse.json(
        { success: false, error: 'Participation not found' },
        { status: 404 }
      );
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, participation.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    // 참여 정보 삭제
    await collection.deleteOne({
      date,
      coreTime: time,
      browserId
    });

    // 현재 참여 인원 수 조회
    const currentCount = await collection.countDocuments({
      date,
      coreTime: time
    });

    return NextResponse.json({
      success: true,
      data: { count: currentCount }
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
      }
    });

  } catch (error) {
    console.error('Cancel API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}