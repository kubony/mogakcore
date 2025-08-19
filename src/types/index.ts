// 코어 타임 정의
export type CoreTime = '1000' | '1500' | '2000' | '2200';

// 참여 데이터 타입
export interface Participation {
  _id?: string;
  date: string; // YYYY-MM-DD 형식
  coreTime: CoreTime;
  browserId: string;
  passwordHash: string;
  createdAt: Date;
}

// API 요청/응답 타입
export interface ParticipateRequest {
  date: string;
  time: CoreTime;
  browserId: string;
  password: string;
}

export interface CancelRequest {
  date: string;
  time: CoreTime;
  browserId: string;
  password: string;
}

export type StatusResponse = {
  [key in CoreTime]: number; // 각 코어 타임별 참여 인원 수
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 코어 타임 정보
export interface CoreTimeInfo {
  time: CoreTime;
  label: string;
  displayTime: string;
}

// 로컬 스토리지 데이터 타입
export interface LocalParticipation {
  coreTime: CoreTime;
  date: string;
  hasPassword: boolean;
}