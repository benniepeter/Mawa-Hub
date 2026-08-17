import type { IncomingMessage,ServerResponse } from 'node:http';
import { currentAccount } from '../auth/persistent.js';
import { getUserTransaction,listUserTransactions } from '../repositories/transactions.js';
const COOKIE='mawahub_session';
function sid(req:IncomingMessage){const c=req.headers.cookie||'';const m=c.split(';').map(x=>x.trim()).find(x=>x.startsWith(`${COOKIE}=`));return m?decodeURIComponent(m.slice(COOKIE.length+1)):'';}
function json(res:ServerResponse,status:number,data:unknown){res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));}
export async function transactionHttp(req:IncomingMessage,res:ServerResponse){
 const path=req.url?.split('?')[0]||''; if(req.method!=='GET'||!path.startsWith('/api/v1/transactions'))return false;
 const user=await currentAccount(sid(req)); if(!user){json(res,401,{error:'unauthorized'});return true;}
 const parts=path.split('/').filter(Boolean); const id=parts[3];
 const data=id?await getUserTransaction(user.id,id):await listUserTransactions(user.id);
 if(id&&!data){json(res,404,{error:'transaction_not_found'});return true;}
 json(res,200,{transactions:id?[data]:data});return true;
}
