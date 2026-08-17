import { randomUUID } from 'node:crypto';
import { query } from '../db/client.js';

export async function createDonation(input:{donorId?:string;fund:string;amountMinor:number;currency:string}) {
  if (!input.fund || !Number.isInteger(input.amountMinor) || input.amountMinor <= 0) throw new Error('invalid_donation');
  const r=await query<{id:string;status:string}>('INSERT INTO donations(id,donor_id,fund,amount_minor,currency,status) VALUES($1,$2,$3,$4,$5,$6) RETURNING id,status',[randomUUID(),input.donorId??null,input.fund,input.amountMinor,input.currency.toUpperCase(),'pending']);
  return r.rows[0];
}
export async function getDonation(id:string){const r=await query('SELECT id,donor_id,fund,amount_minor,currency,status,created_at FROM donations WHERE id=$1',[id]);return r.rows[0]??null;}
