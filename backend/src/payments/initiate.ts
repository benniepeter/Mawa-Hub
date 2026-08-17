import { getPaymentProvider } from './provider.js';
import { startPayment } from '../services/payments.js';

export async function initiatePayment(input:{provider:string;amountMinor:number;currency:string;reference:string;phone?:string;orderId?:string;donationId?:string;idempotencyKey:string}) {
  if(!input.orderId&&!input.donationId) throw new Error('payment_target_required');
  const provider=getPaymentProvider(input.provider);
  const payment=await startPayment({orderId:input.orderId,donationId:input.donationId,provider:provider.name,amountMinor:input.amountMinor,currency:input.currency,idempotencyKey:input.idempotencyKey});
  const result=await provider.initiate({amountMinor:input.amountMinor,currency:input.currency,reference:payment.id,phone:input.phone});
  return {payment,result};
}
