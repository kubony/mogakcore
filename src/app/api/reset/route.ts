import { NextRequest, NextResponse } from 'next/server';
import { getParticipationsCollection } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // 보안을 위해 특정 헤더나 토큰으로 접근 제한 (선택사항)
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.RESET_API_SECRET;
    
    if (expectedAuth && authHeader !== `Bearer ${expectedAuth}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const collection = await getParticipationsCollection();

    // 24시간 이전 데이터 삭제 (TTL 인덱스가 있지만 수동 정리도 가능)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const deleteResult = await collection.deleteMany({
      createdAt: { $lt: oneDayAgo }
    });

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: deleteResult.deletedCount,
        resetTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Reset API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}