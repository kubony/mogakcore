import { MongoClient, Db, Collection } from 'mongodb';
import type { Participation } from '@/types';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // 개발 환경에서는 글로벌 변수를 사용하여 연결을 재사용
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // 프로덕션 환경에서는 새로운 클라이언트 생성
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// 데이터베이스 및 컬렉션 가져오기
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db('mogakcore');
}

export async function getParticipationsCollection(): Promise<Collection<Participation>> {
  const db = await getDatabase();
  return db.collection<Participation>('participations');
}

// 인덱스 설정 함수 (앱 시작 시 호출)
export async function setupIndexes(): Promise<void> {
  const collection = await getParticipationsCollection();
  
  // TTL 인덱스 설정 (24시간 후 자동 삭제)
  await collection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 24 * 60 * 60 } // 24시간
  );
  
  // 복합 인덱스 설정 (조회 성능 향상)
  await collection.createIndex({ date: 1, coreTime: 1 });
  await collection.createIndex({ browserId: 1, date: 1, coreTime: 1 });
}

export default clientPromise;