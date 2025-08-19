'use client';

import { useState } from 'react';
import type { CoreTimeInfo } from '@/types';

interface CoreTimeCardProps {
  coreTimeInfo: CoreTimeInfo;
  participantCount: number;
  isParticipating: boolean;
  onParticipate: (coreTime: string, password: string) => Promise<void>;
  onCancel: (coreTime: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

export default function CoreTimeCard({
  coreTimeInfo,
  participantCount,
  isParticipating,
  onParticipate,
  onCancel,
  isLoading = false
}: CoreTimeCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const maxParticipants = 20; // 시각화를 위한 최대값
  const fillPercentage = Math.min((participantCount / maxParticipants) * 100, 100);

  const handleButtonClick = () => {
    setShowModal(true);
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^\d{4}$/.test(password)) {
      setError('4자리 숫자를 입력해주세요');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (isParticipating) {
        await onCancel(coreTimeInfo.time, password);
      } else {
        await onParticipate(coreTimeInfo.time, password);
      }
      setShowModal(false);
      setPassword('');
    } catch (err: unknown) {
      setError((err as Error).message || '오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            오늘 {coreTimeInfo.label}
          </h3>
          <p className="text-sm text-gray-600">
            현재 <span className="font-bold text-blue-600">{participantCount}명</span> 참여 중
          </p>
        </div>

        {/* 참여 인원 시각화 바 */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0명</span>
            <span>{maxParticipants}명+</span>
          </div>
        </div>

        <button
          onClick={handleButtonClick}
          disabled={isLoading || isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isParticipating
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } ${
            isLoading || isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          {isLoading ? '로딩 중...' : isParticipating ? '참여 취소' : '참여하기'}
        </button>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isParticipating ? '참여 취소' : '참여하기'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isParticipating ? '취소용 비밀번호' : '취소 시 사용할 비밀번호'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="4자리 숫자"
                  maxLength={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {!isParticipating && (
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ 비밀번호를 잊으면 참여 취소가 불가능합니다
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !password}
                  className={`flex-1 py-2 px-4 rounded-lg text-white font-medium disabled:opacity-50 ${
                    isParticipating
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {isSubmitting ? '처리 중...' : '확인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}