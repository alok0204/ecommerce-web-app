import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5002;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const JWT_SECRET = process.env.JWT_SECRET || 'nexora_production_jwt_secret_key_alok_kumar_vishwas_thiranex_task3';
export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
export const DATABASE_URL = process.env.DATABASE_URL || '';
