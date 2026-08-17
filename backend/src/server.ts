import { createServer } from 'node:http';
import { authHttpRouter } from './auth/http-routes.js';

const port=Number(process.env.PORT||8080);
const server=createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin',process.env.WEB_ORIGIN||'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials','true');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  if(req.method==='OPTIONS'){res.statusCode=204;res.end();return;}
  try {
    const handled=await authHttpRouter(req,res);
    if(handled)return;
    res.statusCode=404;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'not_found'}));
  } catch(error) {
    console.error('request_error',error instanceof Error?error.message:'unknown');
    if(!res.headersSent){res.statusCode=500;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:'internal_server_error'}));}
  }
});
server.listen(port,()=>console.log(`MawaHub API listening on ${port}`));
