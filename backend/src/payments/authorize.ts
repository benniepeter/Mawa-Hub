import { query } from '../db/client.js';

export async function authorizePaymentTarget(input:{userId:string;orderId?:string;donationId?:string;amountMinor:number;currency:string}) {
  if(!input.userId) throw new Error('unauthorized');
  if((input.orderId?1:0)+(input.donationId?1:0)!==1) throw new Error('payment_target_required');
  if(!Number.isInteger(input.amountMinor)||input.amountMinor<=0) throw new Error('invalid_amount');
  if(input.orderId){
    const r=await query<{total_minor:string;currency:string;status:string}>('SELECT total_minor,currency,status FROM orders WHERE id=$1 AND buyer_id=$2 LIMIT 1',[input.orderId,input.userId]);
    const o=r.rows[0];
    if(!o) throw new Error('order_not_found');
    if(o.status!=='pending') throw new Error('order_not_payable');
    if(Number(o.total_minor)!==input.amountMinor||o.currency!==input.currency.toUpperCase()) throw new Error('payment_amount_mismatch');
    return {target:'order' as const,id:input.orderId,amountMinor:Number(o.total_minor),currency:o.currency};
  }
  const r=await query<{amount_minor:string;currency:string;status:string;donor_id:string|null}>('SELECT amount_minor,currency,status,donor_id FROM donations WHERE id=$1 LIMIT 1',[input.donationId]);
  const d=r.rows[0];
  if(!d) throw new Error('donation_not_found');
  if(d.donor_id&&d.donor_id!==input.userId) throw new Error('forbidden');
  if(d.status!=='pending') throw new Error('donation_not_payable');
  if(Number(d.amount_minor)!==input.amountMinor||d.currency!==input.currency.toUpperCase()) throw new Error('payment_amount_mismatch');
  return {target:'donation' as const,id:input.donationId!,amountMinor:Number(d.amount_minor),currency:d.currency};
}
