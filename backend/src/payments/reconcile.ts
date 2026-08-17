import { withTransaction } from '../db/client.js';

export async function reconcilePaidPayment(paymentId:string,providerReference?:string){
  return withTransaction(async client=>{
    const p=await client.query<{id:string;order_id:string|null;donation_id:string|null;status:string}>('SELECT id,order_id,donation_id,status FROM payments WHERE id=$1 FOR UPDATE',[paymentId]);
    const payment=p.rows[0]; if(!payment)throw new Error('payment_not_found');
    if(payment.status==='paid')return payment;
    if(payment.status!=='processing'&&payment.status!=='pending')throw new Error('payment_not_reconcilable');
    await client.query('UPDATE payments SET status=$1,provider_reference=COALESCE($2,provider_reference),updated_at=NOW() WHERE id=$3',['paid',providerReference??null,paymentId]);
    if(payment.order_id){
      const r=await client.query<{status:string}>('UPDATE orders SET status=$1,updated_at=NOW() WHERE id=$2 AND status=$3 RETURNING status',['paid',payment.order_id,'pending']);
      if(!r.rows[0])throw new Error('order_not_payable');
    }
    if(payment.donation_id){
      const r=await client.query<{status:string}>('UPDATE donations SET status=$1 WHERE id=$2 AND status=$3 RETURNING status',['paid',payment.donation_id,'pending']);
      if(!r.rows[0])throw new Error('donation_not_payable');
    }
    return {id:paymentId,status:'paid',orderId:payment.order_id,donationId:payment.donation_id};
  });
}
