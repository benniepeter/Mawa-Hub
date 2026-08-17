export type PaymentRequest={amountMinor:number;currency:string;reference:string;phone?:string};
export type PaymentResult={provider:string;status:'pending'|'processing'|'paid'|'failed';providerReference?:string};
export interface PaymentProvider { readonly name:string; initiate(request:PaymentRequest):Promise<PaymentResult>; }

export class ManualProvider implements PaymentProvider {
  readonly name='manual';
  async initiate(request:PaymentRequest):Promise<PaymentResult>{
    if(!Number.isInteger(request.amountMinor)||request.amountMinor<=0)throw new Error('invalid_amount');
    return {provider:this.name,status:'pending',providerReference:request.reference};
  }
}

export function getPaymentProvider(name=process.env.PAYMENT_PROVIDER||'manual'):PaymentProvider{
  if(name==='manual')return new ManualProvider();
  throw new Error(`unsupported_payment_provider:${name}`);
}
