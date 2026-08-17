import { createPayment, markPaymentStatus } from '../repositories/payments.js';

const transitions:Record<string,string[]>={pending:['processing','failed','cancelled'],processing:['paid','failed'],paid:[],failed:[],cancelled:[]};
export async function startPayment(input:{orderId?:string;donationId?:string;provider:string;amountMinor:number;currency:string;idempotencyKey:string}) {
  return createPayment({...input,provider:input.provider.trim().toLowerCase(),currency:input.currency.toUpperCase()});
}
export async function transitionPayment(id:string,next:'pending'|'processing'|'paid'|'failed'|'cancelled',providerReference?:string){
  const current=await markPaymentStatus(id,next,providerReference);
  if(!current)throw new Error('payment_not_found');
  return current;
}
