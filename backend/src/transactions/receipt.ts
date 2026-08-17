import { query } from '../db/client.js';

export async function getReceiptForUser(userId:string,paymentId:string){
 const r=await query<{id:string;order_id:string|null;donation_id:string|null;provider:string;amount_minor:string;currency:string;status:string;provider_reference:string|null;created_at:Date}>('SELECT p.id,p.order_id,p.donation_id,p.provider,p.amount_minor,p.currency,p.status,p.provider_reference,p.created_at FROM payments p LEFT JOIN orders o ON o.id=p.order_id LEFT JOIN donations d ON d.id=p.donation_id WHERE p.id=$1 AND (o.buyer_id=$2 OR d.donor_id=$2) LIMIT 1',[paymentId,userId]);
 const p=r.rows[0]; if(!p)return null;
 return {receiptNumber:`MAWA-${p.id.slice(0,8).toUpperCase()}`,paymentId:p.id,reference:p.provider_reference,provider:p.provider,amountMinor:Number(p.amount_minor),currency:p.currency,status:p.status,orderId:p.order_id,donationId:p.donation_id,issuedAt:p.created_at};
}
