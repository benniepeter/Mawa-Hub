import { createServer } from 'node:http';
import { authHttpRouter } from './auth/http-routes.js';
import { paymentWebhook } from './payments/http-webhook.js';
import { paymentInitiateHttp } from './payments/http-initiate.js';

const port=Number(process.env.PORT||8080);
const allowedOrigin=process.env.WEB_ORIGIN||'http://localhost:3000';
const server=createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin',allowedOrigin);
  res.setHeader('Access-Control-Allow-Credentials','true');
  res.setHeader('Access-Control-Allow-Headers','Content-Type,X-MawaHub-Signature');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  if(req.method==='OPTIONS'){res.statusCode=204;res.end();return;}
  try {
    if(await paymentWebhook(req,res))return;
    if(await paymentInitiateHttp(req,res))return;
    if(await authHttpRouter(req,res))return;
    res.statusCode=404;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'not_found'}));
  } catch(error) {
    console.error('request_error',error instanceof Error?error.message:'unknown');
    if(!res.headersSent){res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'internal_server_error'}));}
  }
});
server.listen(port,()=>console.log(`MawaHub API listening on ${port}`));
