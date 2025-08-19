import { NextRequest, NextResponse } from 'next/server';
import { getParticipationsCollection } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/ratelimit';
import type { StatusResponse, CoreTime } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Rate limiting 체크
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    const rateLimit = await checkRateLimit(`status:${ip}`);
    
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

    // 날짜 파라미터 가져오기 (기본값: 오늘)
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // 날짜 형식 검증
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    const collection = await getParticipationsCollection();

    // 각 코어 타임별 참여 인원 수 조회
    const coreTimes: CoreTime[] = ['1000', '1500', '2000', '2200'];
    const statusData: StatusResponse = {
      '1000': 0,
      '1500': 0,
      '2000': 0,
      '2200': 0
    };

    for (const coreTime of coreTimes) {
      const count = await collection.countDocuments({
        date,
        coreTime
      });
      statusData[coreTime] = count;
    }

    return NextResponse.json({
      success: true,
      data: statusData
    }, {
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': new Date(rateLimit.reset).toISOString(),
      }
    });

  } catch (error) {
    console.error('Status API error:', error);
    
    // MongoDB 연결 에러인지 확인
    const err = error as Error;
    let errorMessage = 'Internal server error';
    
    if (err.message?.includes('MongoServerSelectionError')) {
      errorMessage = 'Database connection failed';
      console.error('MongoDB connection error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
    } else if (err.message?.includes('SSL') || err.message?.includes('TLS')) {
      errorMessage = 'Database SSL/TLS connection error';
      console.error('SSL/TLS error details:', {
        name: err.name,
        message: err.message
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        // 개발 환경에서만 상세 에러 정보 제공
        ...(process.env.NODE_ENV === 'development' && { 
          details: err.message 
        })
      },
      { status: 500 }
    );
  }
}