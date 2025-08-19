'use client';

import { useState, useEffect, useCallback } from 'react';
import CoreTimeCard from '@/components/CoreTimeCard';
import { CORE_TIMES, POLLING_INTERVAL, API_ENDPOINTS } from '@/utils/constants';
import {
  getBrowserId,
  getTodayString,
  saveLocalParticipation,
  removeLocalParticipation,
  isParticipating
} from '@/utils/helpers';
import type { StatusResponse, ApiResponse, CoreTime } from '@/types';

export default function HomePage() {
  const [participantCounts, setParticipantCounts] = useState<StatusResponse>({
    '1000': 0,
    '1500': 0,
    '2000': 0,
    '2200': 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const today = getTodayString();
  const browserId = typeof window !== 'undefined' ? getBrowserId() : '';

  // 상태 조회 함수
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.STATUS}?date=${today}`);
      const result: ApiResponse<StatusResponse> = await response.json();

      if (result.success && result.data) {
        setParticipantCounts(result.data);
        setLastUpdated(new Date());
        setError('');
      } else {
        throw new Error(result.error || 'Failed to fetch status');
      }
    } catch (err: unknown) {
      console.error('Status fetch error:', err);
      setError('상태를 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  // 참여하기 함수
  const handleParticipate = async (coreTime: string, password: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.PARTICIPATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          time: coreTime,
          browserId,
          password
        }),
      });

      const result: ApiResponse<{ count: number }> = await response.json();

      if (result.success && result.data) {
        // 로컬 스토리지에 참여 정보 저장
        saveLocalParticipation(coreTime as CoreTime, today);
        
        // 상태 업데이트
        setParticipantCounts(prev => ({
          ...prev,
          [coreTime]: result.data!.count
        }));
      } else {
        throw new Error(result.error || 'Failed to participate');
      }
    } catch (err: unknown) {
      console.error('Participate error:', err);
      throw new Error((err as Error).message || '참여에 실패했습니다');
    }
  };

  // 참여 취소 함수
  const handleCancel = async (coreTime: string, password: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.CANCEL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: today,
          time: coreTime,
          browserId,
          password
        }),
      });

      const result: ApiResponse<{ count: number }> = await response.json();

      if (result.success && result.data) {
        // 로컬 스토리지에서 참여 정보 삭제
        removeLocalParticipation(coreTime as CoreTime, today);
        
        // 상태 업데이트
        setParticipantCounts(prev => ({
          ...prev,
          [coreTime]: result.data!.count
        }));
      } else {
        throw new Error(result.error || 'Failed to cancel participation');
      }
    } catch (err: unknown) {
      console.error('Cancel error:', err);
      throw new Error((err as Error).message || '참여 취소에 실패했습니다');
    }
  };

  // 초기 로드 및 폴링 설정
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, POLLING_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            오늘의 모각코 현황
          </h1>
          <p className="text-lg text-gray-700 mb-4">
            지금, 코딩 메이트와 함께할 코어 타임을 선택하세요!
          </p>
          {lastUpdated && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">
                실시간 업데이트 중
              </span>
            </div>
          )}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchStatus}
              className="mt-2 text-sm text-red-700 underline hover:no-underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 코어 타임 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_TIMES.map((coreTimeInfo) => (
            <CoreTimeCard
              key={coreTimeInfo.time}
              coreTimeInfo={coreTimeInfo}
              participantCount={participantCounts[coreTimeInfo.time]}
              isParticipating={isParticipating(coreTimeInfo.time, today)}
              onParticipate={handleParticipate}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* 푸터 */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm">💡</span>
              </div>
              <div>
                <h4 className="font-semibold text-amber-800 text-sm mb-1">비밀번호 보관</h4>
                <p className="text-amber-700 text-xs leading-relaxed">
                  참여 취소 시 입력한 비밀번호가 필요하니 꼭 기억해주세요
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 text-sm mb-1">실시간 업데이트</h4>
                <p className="text-blue-700 text-xs leading-relaxed">
                  참여 현황은 3초마다 자동으로 업데이트됩니다
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8 text-xs text-gray-400">
            <p>모각코어 - 함께하는 코딩 시간</p>
          </div>
        </div>
      </div>
    </div>
  );
}