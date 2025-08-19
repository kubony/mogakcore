import { setupIndexes } from './src/lib/mongodb';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // MongoDB 인덱스 설정
    try {
      await setupIndexes();
      console.log('MongoDB indexes initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MongoDB indexes:', error);
    }
  }
}