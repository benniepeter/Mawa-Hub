export type ProviderName='safaricom_ke'|'airtel_ke'|'yas_tz'|'manual';
export type ProviderConfig={name:ProviderName;baseUrl:string;clientId?:string;clientSecret?:string;shortCode?:string;callbackUrl?:string};

const env=(key:string)=>process.env[key]?.trim()||undefined;

export function providerConfig(name:ProviderName):ProviderConfig{
  const prefix=name.toUpperCase();
  const baseUrl=env(`${prefix}_BASE_URL`);
  if(name==='manual') return {name,baseUrl:'local'};
  if(!baseUrl) throw new Error(`missing_provider_base_url:${name}`);
  return {name,baseUrl,clientId:env(`${prefix}_CLIENT_ID`),clientSecret:env(`${prefix}_CLIENT_SECRET`),shortCode:env(`${prefix}_SHORTCODE`),callbackUrl:env(`${prefix}_CALLBACK_URL`)};
}

export function assertProviderCredentials(config:ProviderConfig){
  if(config.name==='manual')return;
  if(!config.clientId||!config.clientSecret)throw new Error(`missing_provider_credentials:${config.name}`);
}
