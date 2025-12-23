import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Tên database file sẽ được lưu trong thư mục data của app
const DATABASE_NAME = 'foodbuddy.db';

// Mở database synchronously
export const expoDb = openDatabaseSync(DATABASE_NAME);

// Khởi tạo Drizzle ORM với expo-sqlite
export const db = drizzle(expoDb, { schema });

// Export DATABASE_NAME để có thể dùng ở nơi khác nếu cần
export { DATABASE_NAME };
