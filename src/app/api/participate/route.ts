import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getParticipationsCollection } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/ratelimit';
import type { ParticipateRequest, Participation } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting 체크
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimit = await checkRateLimit(`participate:${ip}`);
    
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

    const body: ParticipateRequest = await request.json();
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

    // 중복 참여 체크
    const existingParticipation = await collection.findOne({
      date,
      coreTime: time,
      browserId
    });

    if (existingParticipation) {
      return NextResponse.json(
        { success: false, error: 'Already participating in this core time' },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    const passwordHash = await bcrypt.hash(password, 10);

    // 참여 정보 저장
    const participation: Omit<Participation, '_id'> = {
      date,
      coreTime: time,
      browserId,
      passwordHash,
      createdAt: new Date()
    };

    await collection.insertOne(participation);

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
    console.error('Participate API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}