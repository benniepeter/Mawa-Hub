import { query } from '../db/client.js';

export async function listUserTransactions(userId:string,limit=50){
  const safeLimit=Math.min(Math.max(Math.trunc(limit),1),100);
  const r=await query('SELECT p.id,p.order_id,p.donation_id,p.provider,p.amount_minor,p.currency,p.status,p.provider_reference,p.created_at,p.updated_at FROM payments p LEFT JOIN orders o ON o.id=p.order_id LEFT JOIN donations d ON d.id=p.donation_id WHERE o.buyer_id=$1 OR d.donor_id=$1 ORDER BY p.created_at DESC LIMIT $2',[userId,safeLimit]);
  return r.rows;
}
export async function getUserTransaction(userId:string,paymentId:string){
  const r=await query('SELECT p.id,p.order_id,p.donation_id,p.provider,p.amount_minor,p.currency,p.status,p.provider_reference,p.created_at,p.updated_at FROM payments p LEFT JOIN orders o ON o.id=p.order_id LEFT JOIN donations d ON d.id=p.donation_id WHERE p.id=$1 AND (o.buyer_id=$2 OR d.donor_id=$2) LIMIT 1',[paymentId,userId]);
  return r.rows[0]??null;
}
