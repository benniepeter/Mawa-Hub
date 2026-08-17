import type { IncomingMessage, ServerResponse } from 'node:http';
import { currentAccount } from '../auth/persistent.js';
import { authorizePaymentTarget } from './authorize.js';
import { initiatePayment } from './initiate.js';

const COOKIE='mawahub_session';
async function readBody(req:IncomingMessage){let raw='';for await(const chunk of req)raw+=chunk;return raw;}
function json(res:ServerResponse,status:number,data:unknown){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}
function sessionId(req:IncomingMessage){const c=req.headers.cookie||'';const m=c.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`));return m?decodeURIComponent(m.slice(COOKIE.length+1)):'';}

export async function paymentInitiateHttp(req:IncomingMessage,res:ServerResponse){
  if(req.method!=='POST'||req.url?.split('?')[0]!=='/api/v1/payments/initiate')return false;
  try{
    const user=await currentAccount(sessionId(req));
    if(!user)return json(res,401,{error:'unauthorized'}),true;
    const b=JSON.parse(await readBody(req));
    if(typeof b.provider!=='string'||typeof b.amountMinor!=='number'||!Number.isInteger(b.amountMinor)||b.amountMinor<=0||typeof b.currency!=='string'||typeof b.idempotencyKey!=='string')return json(res,400,{error:'invalid_payment_request'}),true;
    if(b.phone!==undefined&&typeof b.phone!=='string')return json(res,400,{error:'invalid_phone'}),true;
    if(b.orderId!==undefined&&typeof b.orderId!=='string')return json(res,400,{error:'invalid_order'}),true;
    if(b.donationId!==undefined&&typeof b.donationId!=='string')return json(res,400,{error:'invalid_donation'}),true;
    const target=await authorizePaymentTarget({userId:user.id,orderId:b.orderId,donationId:b.donationId,amountMinor:b.amountMinor,currency:b.currency});
    const result=await initiatePayment({provider:b.provider,amountMinor:target.amountMinor,currency:target.currency,reference:target.id,phone:b.phone,orderId:b.orderId,donationId:b.donationId,idempotencyKey:b.idempotencyKey});
    return json(res,201,result),true;
  }catch(e){
    const message=e instanceof Error?e.message:'internal_error';
    const bad=['payment_target_required','invalid_amount','order_not_found','order_not_payable','donation_not_found','donation_not_payable','payment_amount_mismatch','invalid_phone','invalid_order','invalid_donation'];
    const status=message==='unauthorized'?401:message==='forbidden'?403:bad.includes(message)?400:500;
    return json(res,status,{error:status===500?'payment_initiation_failed':message}),true;
  }
}
