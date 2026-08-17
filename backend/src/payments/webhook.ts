import { createHmac, timingSafeEqual } from 'node:crypto';
import { transitionPayment } from '../services/payments.js';
import { reconcilePaidPayment } from './reconcile.js';

export type VerifiedWebhook={paymentId:string;status:'processing'|'paid'|'failed'|'cancelled';providerReference?:string};

export function verifySignature(rawBody:string,signature:string,secret:string){
  if(!signature||!secret)return false;
  const expected=createHmac('sha256',secret).update(rawBody).digest('hex');
  const a=Buffer.from(signature,'utf8'),b=Buffer.from(expected,'utf8');
  return a.length===b.length&&timingSafeEqual(a,b);
}

export async function handleVerifiedWebhook(event:VerifiedWebhook){
  if(event.status==='paid')return reconcilePaidPayment(event.paymentId,event.providerReference);
  return transitionPayment(event.paymentId,event.status,event.providerReference);
}
