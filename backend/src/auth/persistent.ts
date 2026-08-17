import { randomUUID } from 'node:crypto';
import { findUserByEmail, findUserById, createUser, listUserRoles } from '../repositories/users.js';
import { hashPassword, verifyPassword } from '../security/password.js';
import { createDbSession, getDbSession, revokeDbSession } from '../security/db-session-store.js';

export async function registerAccount(input:{email:string;fullName:string;password:string;phone?:string;country?:string;role?:string}) {
  const email=input.email.trim().toLowerCase();
  if (!email || !input.fullName.trim() || input.password.length < 8) throw new Error('invalid_registration');
  if (await findUserByEmail(email)) throw new Error('account_exists');
  const user=await createUser({id:randomUUID(),email,phone:input.phone,fullName:input.fullName,country:input.country,passwordHash:await hashPassword(input.password),role:input.role||'buyer'});
  const session=await createDbSession(user.id);
  return {sessionId:session.id,user:{id:user.id,email:user.email,fullName:user.full_name,roles:await listUserRoles(user.id)}};
}

export async function loginAccount(emailInput:string,password:string){
  const user=await findUserByEmail(emailInput.trim().toLowerCase());
  if(!user || user.status!=='active' || !(await verifyPassword(password,user.password_hash))) throw new Error('invalid_credentials');
  const session=await createDbSession(user.id);
  return {sessionId:session.id,user:{id:user.id,email:user.email,fullName:user.full_name,roles:await listUserRoles(user.id)}};
}

export async function currentAccount(sessionId:string){
  const session=await getDbSession(sessionId); if(!session)return null;
  const user=await findUserById(session.userId); if(!user || user.status!=='active')return null;
  return {id:user.id,email:user.email,phone:user.phone,fullName:user.full_name,country:user.country,roles:await listUserRoles(user.id)};
}
export async function logoutAccount(sessionId:string){await revokeDbSession(sessionId);}
