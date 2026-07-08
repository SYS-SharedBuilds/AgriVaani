import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://agrivaani:agrivaani_dev@localhost:5432/agrivaani',
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
