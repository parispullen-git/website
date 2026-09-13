import {replay} from '../../gym/engine.mjs';
const PREFIX='boxing:v2:rank:';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function top(kv){const result=await kv.list({prefix:PREFIX,limit:100});const seen=new Set();return result.keys.filter(k=>{if(!k.metadata||seen.has(k.metadata.match))return false;seen.add(k.metadata.match);return true}).slice(0,10).map((k,i)=>({rank:i+1,name:k.metadata.name,score:k.metadata.score,level:k.metadata.level,date:k.metadata.date}))}
export async function onRequest({request,env}){try{
 if(!env.PP_DATA)return json({error:'Leaderboard is not connected yet.'},503);
 if(request.method==='GET')return json({entries:await top(env.PP_DATA)});
 if(request.method!=='POST')return json({error:'Method not allowed'},405);
 const origin=request.headers.get('Origin');if(origin&&origin!==new URL(request.url).origin)return json({error:'Invalid origin'},403);
 const raw=await request.text();if(raw.length>50000)return json({error:'Fight replay is too large'},413);let body;try{body=JSON.parse(raw)}catch{return json({error:'Invalid request'},400)}
 if(body.action==='begin'){
  const ip=request.headers.get('CF-Connecting-IP')||'preview';const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+Math.floor(Date.now()/60000)));const rateKey='boxing:v2:rate:'+Array.from(new Uint8Array(bytes)).slice(0,12).map(b=>b.toString(16).padStart(2,'0')).join('');const count=Number(await env.PP_DATA.get(rateKey)||0);if(count>=12)return json({error:'Please wait a minute before starting another ranked fight.'},429);await env.PP_DATA.put(rateKey,String(count+1),{expirationTtl:120});
  const id=crypto.randomUUID(),seed=crypto.getRandomValues(new Uint32Array(1))[0];await env.PP_DATA.put('boxing:v2:session:'+id,JSON.stringify({seed,startedAt:Date.now()}),{expirationTtl:3600});return json({id,seed});
 }
 if(body.action==='submit'){
  if(typeof body.id!=='string'||!/^[a-f0-9-]{36}$/.test(body.id))return json({error:'Invalid fight'},400);
  const name=typeof body.name==='string'?body.name.trim():'';if(!/^[\p{L}\p{N} _.-]{2,16}$/u.test(name))return json({error:'Use 2–16 letters, numbers, spaces, dots, dashes or underscores.'},400);
  const key='boxing:v2:session:'+body.id,session=await env.PP_DATA.get(key,'json');if(!session)return json({error:'This fight expired. Play again to rank.'},410);if(session.submitted)return json({error:'This fight has already been submitted.'},409);
  if(!Number.isFinite(body.elapsed)||body.elapsed>Date.now()-session.startedAt+2000)return json({error:'Invalid fight duration'},400);
  let fight;try{fight=replay(session.seed,body.trace,body.elapsed)}catch(e){return json({error:e.message},400)}if(fight.score<1)return json({error:'Land a combo to earn a ranked score.'},400);
  const entries=await top(env.PP_DATA);if(entries.length===10&&fight.score<=entries[9].score)return json({error:'Another fighter took that spot. Beat '+entries[9].score+' to make the top ten.',entries},409);
  const metadata={match:body.id,name,score:fight.score,level:fight.level,date:new Date().toISOString()};const rankKey=PREFIX+String(999999999-fight.score).padStart(9,'0')+':'+body.id;await env.PP_DATA.put(rankKey,'1',{metadata});await env.PP_DATA.put(key,JSON.stringify({...session,submitted:true}),{expirationTtl:3600});
  const next=await top(env.PP_DATA);return json({ok:true,entry:metadata,entries:next,message:'Saved. Rankings may take a moment to update around the world.'});
 }
 return json({error:'Unknown action'},400);
 }catch{return json({error:'Leaderboard unavailable. Please try again.'},503)}}
