import type { IncomingMessage, ServerResponse } from 'node:http';
import { verifySignature, handleVerifiedWebhook } from './webhook.js';

async function readBody(req:IncomingMessage){let raw='';for await(const chunk of req)raw+=chunk;return raw;}
function json(res:ServerResponse,status:number,data:unknown){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}

export async function paymentWebhook(req:IncomingMessage,res:ServerResponse){
  if(req.method!=='POST'||req.url?.split('?')[0]!=='/api/v1/payments/webhook')return false;
  const raw=await readBody(req);
  const signature=String(req.headers['x-mawahub-signature']||'');
  const secret=process.env.PAYMENT_WEBHOOK_SECRET||'';
  if(!verifySignature(raw,signature,secret))return json(res,401,{error:'invalid_signature'}),true;
  try{
    const event=JSON.parse(raw);
    if(typeof event.paymentId!=='string'||!['processing','paid','failed','cancelled'].includes(event.status))return json(res,400,{error:'invalid_webhook'}),true;
    const result=await handleVerifiedWebhook({paymentId:event.paymentId,status:event.status,providerReference:typeof event.providerReference==='string'?event.providerReference:undefined});
    return json(res,200,{ok:true,payment:result}),true;
  }catch{ return json(res,400,{error:'invalid_webhook'}),true; }
}
