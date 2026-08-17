import { createHash, randomBytes } from 'node:crypto';
import { query } from '../db/client.js';

export interface DbSession { id:string; userId:string; expiresAt:Date; }
const hash=(id:string)=>createHash('sha256').update(id).digest('hex');
export async function createDbSession(userId:string,ttlMs=604800000){const id=randomBytes(32).toString('hex');const expiresAt=new Date(Date.now()+ttlMs);await query('INSERT INTO sessions (id_hash,user_id,expires_at) VALUES ($1,$2,$3)',[hash(id),userId,expiresAt]);return {id,userId,expiresAt};}
export async function getDbSession(id:string){if(!id)return null;const r=await query<{user_id:string;expires_at:Date}>('SELECT user_id,expires_at FROM sessions WHERE id_hash=$1 AND expires_at>NOW() LIMIT 1',[hash(id)]);const row=r.rows[0];return row?{id,userId:row.user_id,expiresAt:new Date(row.expires_at)}:null;}
export async function revokeDbSession(id:string){if(id)await query('DELETE FROM sessions WHERE id_hash=$1',[hash(id)]);}
export async function revokeAllUserSessions(userId:string){await query('DELETE FROM sessions WHERE user_id=$1',[userId]);}
export async function cleanupExpiredSessions(){await query('DELETE FROM sessions WHERE expires_at<=NOW()');}
