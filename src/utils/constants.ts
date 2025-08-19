import { CoreTimeInfo } from '@/types';

// 코어 타임 정보
export const CORE_TIMES: CoreTimeInfo[] = [
  {
    time: '1000',
    label: '오전 10시',
    displayTime: '10:00'
  },
  {
    time: '1500',
    label: '오후 3시',
    displayTime: '15:00'
  },
  {
    time: '2000',
    label: '저녁 8시',
    displayTime: '20:00'
  },
  {
    time: '2200',
    label: '밤 10시',
    displayTime: '22:00'
  }
];

// 로컬 스토리지 키
export const LOCAL_STORAGE_KEYS = {
  BROWSER_ID: 'mogakcore_browser_id',
  PARTICIPATIONS: 'mogakcore_participations'
} as const;

// API 엔드포인트
export const API_ENDPOINTS = {
  STATUS: '/api/status',
  PARTICIPATE: '/api/participate',
  CANCEL: '/api/cancel',
  RESET: '/api/reset'
} as const;

// 폴링 간격 (밀리초)
export const POLLING_INTERVAL = 3000; // 3초