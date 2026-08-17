import type { IncomingMessage,ServerResponse } from 'node:http';
import { currentAccount } from '../auth/persistent.js';
import { getReceiptForUser } from './receipt.js';
const COOKIE='mawahub_session';
function sid(req:IncomingMessage){const c=req.headers.cookie||'';const m=c.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`));return m?decodeURIComponent(m.slice(COOKIE.length+1)):'';}
function json(res:ServerResponse,status:number,data:unknown){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}
export async function receiptHttp(req:IncomingMessage,res:ServerResponse){
 const m=req.url?.split('?')[0].match(/^\/api\/v1\/transactions\/([^/]+)\/receipt$/); if(req.method!=='GET'||!m)return false;
 const user=await currentAccount(sid(req)); if(!user){json(res,401,{error:'unauthorized'});return true;}
 const receipt=await getReceiptForUser(user.id,m[1]); if(!receipt){json(res,404,{error:'receipt_not_found'});return true;}
 json(res,200,{receipt});return true;
}
