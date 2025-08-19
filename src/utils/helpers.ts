import { v4 as uuidv4 } from 'uuid';
import { LOCAL_STORAGE_KEYS } from './constants';
import type { LocalParticipation, CoreTime } from '@/types';

// 브라우저 ID 생성 또는 가져오기
export function getBrowserId(): string {
  if (typeof window === 'undefined') return '';
  
  let browserId = localStorage.getItem(LOCAL_STORAGE_KEYS.BROWSER_ID);
  if (!browserId) {
    browserId = uuidv4();
    localStorage.setItem(LOCAL_STORAGE_KEYS.BROWSER_ID, browserId);
  }
  return browserId;
}

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
export function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// 로컬 참여 정보 저장
export function saveLocalParticipation(coreTime: CoreTime, date: string): void {
  if (typeof window === 'undefined') return;
  
  const participations = getLocalParticipations();
  const newParticipation: LocalParticipation = {
    coreTime,
    date,
    hasPassword: true
  };
  
  // 중복 제거 후 추가
  const filtered = participations.filter(
    p => !(p.coreTime === coreTime && p.date === date)
  );
  filtered.push(newParticipation);
  
  localStorage.setItem(LOCAL_STORAGE_KEYS.PARTICIPATIONS, JSON.stringify(filtered));
}

// 로컬 참여 정보 삭제
export function removeLocalParticipation(coreTime: CoreTime, date: string): void {
  if (typeof window === 'undefined') return;
  
  const participations = getLocalParticipations();
  const filtered = participations.filter(
    p => !(p.coreTime === coreTime && p.date === date)
  );
  
  localStorage.setItem(LOCAL_STORAGE_KEYS.PARTICIPATIONS, JSON.stringify(filtered));
}

// 로컬 참여 정보 가져오기
export function getLocalParticipations(): LocalParticipation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PARTICIPATIONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 특정 코어 타임에 참여했는지 확인
export function isParticipating(coreTime: CoreTime, date: string): boolean {
  const participations = getLocalParticipations();
  return participations.some(p => p.coreTime === coreTime && p.date === date);
}

// 4자리 숫자 비밀번호 검증
export function isValidPassword(password: string): boolean {
  return /^\d{4}$/.test(password);
}