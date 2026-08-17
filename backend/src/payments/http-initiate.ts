import type { IncomingMessage, ServerResponse } from 'node:http';
import { initiatePayment } from './initiate.js';

async function readBody(req:IncomingMessage){let raw='';for await(const chunk of req)raw+=chunk;return raw;}
function json(res:ServerResponse,status:number,data:unknown){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}

export async function paymentInitiateHttp(req:IncomingMessage,res:ServerResponse){
  if(req.method!=='POST'||req.url?.split('?')[0]!=='/api/v1/payments/initiate')return false;
  try{
    const b=JSON.parse(await readBody(req));
    if(typeof b.provider!=='string'||typeof b.amountMinor!=='number'||!Number.isInteger(b.amountMinor)||b.amountMinor<=0||typeof b.currency!=='string'||typeof b.reference!=='string'||typeof b.idempotencyKey!=='string')return json(res,400,{error:'invalid_payment_request'}),true;
    if(b.phone!==undefined&&typeof b.phone!=='string')return json(res,400,{error:'invalid_phone'}),true;
    if(b.orderId!==undefined&&typeof b.orderId!=='string')return json(res,400,{error:'invalid_order'}),true;
    if(b.donationId!==undefined&&typeof b.donationId!=='string')return json(res,400,{error:'invalid_donation'}),true;
    const result=await initiatePayment({provider:b.provider,amountMinor:b.amountMinor,currency:b.currency,reference:b.reference,phone:b.phone,orderId:b.orderId,donationId:b.donationId,idempotencyKey:b.idempotencyKey});
    return json(res,201,result),true;
  }catch(e){const message=e instanceof Error?e.message:'internal_error';const status=['payment_target_required','invalid_amount'].includes(message)?400:500;return json(res,status,{error:status===500?'payment_initiation_failed':message}),true;}
}
