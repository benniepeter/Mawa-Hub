/* MAWAHUB PAYMENT SETTINGS
   Edit this file when adding/changing a payment method.
   Safaricom Kenya is intentionally blank until its number/Till/PayBill is supplied.
   Do not put PINs, API secrets, or private credentials in this public file.
*/
window.MAWH_PAYMENT_CONFIG = {
  kenya: [
    { id:'safaricom-ke', name:'Safaricom M-PESA Kenya', network:'Safaricom', number:'', ussd:'*334#', status:'Add number / Till / PayBill' },
    { id:'airtel-ke', name:'Airtel Money Kenya', network:'Airtel', number:'+254789924419', ussd:'*334#', status:'active' }
  ],
  tanzania: [
    { id:'airtel-tz', name:'Airtel Money Tanzania', network:'Airtel', number:'+255679351001', ussd:'*150*60#', status:'active' },
    { id:'yas-tz', name:'Yas Tanzania (Tigo Pesa)', network:'Yas', number:'+255679351001', ussd:'*150*01#', status:'active' }
  ],
  bank: [],
  card: [],
  paypal: []
};