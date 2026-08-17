import type { IncomingMessage, ServerResponse } from 'node:http';
import { currentAccount, loginAccount, logoutAccount, registerAccount } from './persistent.js';

const COOKIE='mawahub_session';
const cookie=(value:string,maxAge:number)=>`${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
const send=(res:ServerResponse,status:number,data:unknown)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
async function read(req:IncomingMessage){let raw='';for await(const chunk of req)raw+=chunk;try{return raw?JSON.parse(raw):{}}catch{return null}}
function sid(req:IncomingMessage){const c=req.headers.cookie||'';const m=c.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`));return m?decodeURIComponent(m.slice(COOKIE.length+1)):'';}

export async function authHttp(req:IncomingMessage,res:ServerResponse){
 const path=req.url?.split('?')[0];
 try{
  if(req.method==='POST'&&path==='/api/v1/auth/register'){const b=await read(req);if(!b)return send(res,400,{error:'invalid_json'});const r=await registerAccount(b);res.setHeader('Set-Cookie',cookie(r.sessionId,604800));return send(res,201,{user:r.user});}
  if(req.method==='POST'&&path==='/api/v1/auth/login'){const b=await read(req);if(!b)return send(res,400,{error:'invalid_json'});const r=await loginAccount(String(b.email||''),String(b.password||''));res.setHeader('Set-Cookie',cookie(r.sessionId,604800));return send(res,200,{user:r.user});}
  if(req.method==='POST'&&path==='/api/v1/auth/logout'){const id=sid(req);if(id)await logoutAccount(id);res.setHeader('Set-Cookie',cookie('',0));return send(res,200,{ok:true});}
  if(req.method==='GET'&&path==='/api/v1/me'){const user=await currentAccount(sid(req));if(!user)return send(res,401,{error:'unauthorized'});return send(res,200,{user});}
  return false;
 }catch(e){const code=e instanceof Error&&e.message==='account_exists'?409:e instanceof Error&&e.message==='invalid_credentials'?401:400;return send(res,code,{error:e instanceof Error?e.message:'request_failed'});}
}
