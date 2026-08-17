import { randomUUID } from 'node:crypto';
import { withTransaction } from '../db/client.js';

export async function createOrder(input:{buyerId:string;currency:string;items:{productId:string;quantity:number}[]}) {
  if(!input.items.length) throw new Error('empty_order');
  return withTransaction(async client=>{
    let total=0;
    const lines:{productId:string;quantity:number;unitPrice:number;currency:string}[]=[];
    for(const item of input.items){
      if(!Number.isInteger(item.quantity)||item.quantity<1) throw new Error('invalid_quantity');
      const r=await client.query<{id:string;price_minor:string;currency:string;stock:number}>('SELECT id,price_minor,currency,stock FROM products WHERE id=$1 AND status=$2 FOR UPDATE',[item.productId,'published']);
      const p=r.rows[0]; if(!p||p.stock<item.quantity) throw new Error('insufficient_stock');
      if(p.currency!==input.currency) throw new Error('currency_mismatch');
      total+=Number(p.price_minor)*item.quantity; lines.push({productId:p.id,quantity:item.quantity,unitPrice:Number(p.price_minor),currency:p.currency});
      await client.query('UPDATE products SET stock=stock-$1,updated_at=NOW() WHERE id=$2',[item.quantity,p.id]);
    }
    const orderId=randomUUID();
    await client.query('INSERT INTO orders(id,buyer_id,status,currency,total_minor) VALUES($1,$2,$3,$4,$5)',[orderId,input.buyerId,'pending',input.currency,total]);
    for(const line of lines) await client.query('INSERT INTO order_items(id,order_id,product_id,quantity,unit_price_minor,currency) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),orderId,line.productId,line.quantity,line.unitPrice,line.currency]);
    return {id:orderId,totalMinor:total,currency:input.currency,status:'pending'};
  });
}
