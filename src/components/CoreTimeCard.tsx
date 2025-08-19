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

  const maxParticipants = 10; // 시각화를 위한 최대값
  
  // 블록 시각화를 위한 배열 생성
  const participantBlocks = Array.from({ length: Math.min(participantCount, maxParticipants) }, (_, i) => i);
  const emptyBlocks = Array.from({ length: Math.max(0, maxParticipants - participantCount) }, (_, i) => i);

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
      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">
            오늘 {coreTimeInfo.label}
          </h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-600">현재</span>
            <span className="text-3xl font-bold text-blue-600 leading-none">
              {participantCount > 10 ? '10+' : participantCount}
            </span>
            <span className="text-sm font-medium text-gray-600">명 참여 중</span>
          </div>
        </div>

        {/* 참여 인원 블록 시각화 */}
        <div className="mb-6">
          <div className="grid grid-cols-10 gap-1.5 mb-3">
            {participantBlocks.map((_, index) => (
              <div
                key={`filled-${index}`}
                className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-md shadow-sm animate-pulse"
                style={{ 
                  animationDelay: `${index * 80}ms`,
                  animationDuration: '2s'
                }}
              />
            ))}
            {emptyBlocks.map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square bg-gray-200 rounded-md border border-gray-300"
              />
            ))}
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-500 mt-2">
            <span>0명</span>
            <span>{maxParticipants}명</span>
          </div>
        </div>

        <button
          onClick={handleButtonClick}
          disabled={isLoading || isSubmitting}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 transform ${
            isParticipating
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
          } ${
            isLoading || isSubmitting
              ? 'opacity-50 cursor-not-allowed transform-none'
              : ''
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              로딩 중...
            </div>
          ) : isParticipating ? '참여 취소' : '참여하기'}
        </button>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isParticipating ? '참여 취소' : '참여하기'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isParticipating 
                ? `${coreTimeInfo.label} 참여를 취소하시겠습니까?`
                : `${coreTimeInfo.label}에 참여하시겠습니까?`
              }
            </p>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  {isParticipating ? '취소용 비밀번호' : '취소 시 사용할 비밀번호'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="4자리 숫자"
                  maxLength={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  autoFocus
                />
                {!isParticipating && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 flex items-center gap-2">
                      <span className="text-amber-500">⚠️</span>
                      비밀번호를 잊으면 참여 취소가 불가능합니다
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <span className="text-red-500">❌</span>
                    {error}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !password || password.length !== 4}
                  className={`flex-1 py-3 px-4 rounded-xl text-white font-semibold disabled:opacity-50 transition-all ${
                    isParticipating
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      처리 중...
                    </div>
                  ) : '확인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}