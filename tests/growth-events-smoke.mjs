import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';

// Local-only: read local keys without printing them or using production Expo env.
const local = Object.fromEntries(execFileSync('supabase', ['status', '-o', 'env'], {encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim().split('\n').map(line=>{
  const at=line.indexOf('='); return [line.slice(0,at),line.slice(at+1).replace(/^"|"$/g,'')];
}));
if(!/^http:\/\/127\.0\.0\.1:54321$/.test(local.API_URL || '')) throw new Error('Local Supabase only');
const service=createClient(local.API_URL,local.SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const user=createClient(local.API_URL,local.ANON_KEY,{auth:{persistSession:false}});
const assert=(value,message)=>{if(!value) throw new Error(message);};
const must=async promise=>{const {data,error}=await promise;if(error) throw error;return data;};
const sourceId=`smoke-${randomUUID()}`;let userId;
try{
  const email=`events-${randomUUID()}@test.local`,password=`Test-${randomUUID()}`;
  const created=await must(service.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{username:`events-${randomUUID()}`,display_name:'Synthetic event test'}}));
  userId=created.user.id;
  await must(user.auth.signInWithPassword({email,password}));
  const intake=await must(service.from('growth_intakes').insert({user_id:userId,answers:{current_situation:'I recently moved to Fabriano and know no one locally.',desired_change:'Build a few local friendships',practice_context:'I have no existing class or recurring social setting.',boundaries:'No nightlife or costly events; I use a wheelchair.',challenge_level:'gentle'},status:'confirmed'}).select().single());
  const step={title:'Find one structured setting',rationale:'A safe setting could help start contact',action:'Look for a suitable community setting',completion_criterion:'Identify one feasible setting',if_then_plan:null};
  const plan=await must(service.from('growth_plans').insert({user_id:userId,intake_id:intake.id,version:1,status:'active',goal:'Build local friendships through repeated genuine contact',formulation:'Lack of a suitable accessible setting may be the blocker',milestones:[{title:'Start contact',description:'Initiate a brief interaction'},{title:'Reconnect',description:'Meet familiar people again'},{title:'Make a plan',description:'Suggest a shared activity'}],current_focus:'Initiate brief contact in a structured setting',first_step:step,model_name:'fixture',prompt_version:'fixture',confirmed_at:new Date().toISOString()}).select().single());
  await must(service.from('growth_steps').insert({...step,user_id:userId,plan_id:plan.id,sequence:1}));
  await must(user.from('growth_event_preferences').insert({user_id:userId,intake_id:intake.id,enabled:true,approximate_location:'Fabriano',latitude:43.34,longitude:12.91,travel_radius:'5',availability:'Any day during daytime',max_cost_eur:0,wheelchair_required:true}));
  const empty=await must(user.functions.invoke('find-growth-event',{body:{selection_id:randomUUID(),locale:'en'}}));
  assert(empty.selection.status==='no_match','Empty inventory did not produce no match');
  await must(service.from('growth_event_sources').insert({id:sourceId,name:'Synthetic library',source_url:'https://example.org',enabled:true,approval_reference:'LOCAL TEST ONLY',area:'Fabriano',latitude:43.34,longitude:12.91}));
  const tomorrow=new Date();tomorrow.setUTCDate(tomorrow.getUTCDate()+1);tomorrow.setUTCHours(12,0,0,0);
  const event=await must(service.from('growth_events').insert({source_id:sourceId,source_key:'library-table',title:'Library conversation table',description:'A public facilitated small-group conversation table for adults at the municipal library. Free entry, no booking, wheelchair entrance and toilet verified. One-off occurrence.',category:'community',source_url:'https://example.org/library-table',kind:'event',starts_at:tomorrow.toISOString(),timezone:'Europe/Rome',location:'Municipal library',latitude:43.34,longitude:12.91,cost_eur:0,wheelchair_accessible:true,accessibility:'Step-free entry and accessible toilet',status:'active',verified_at:new Date().toISOString()}).select().single());
  const find=async()=>{const data=await must(user.functions.invoke('find-growth-event',{body:{selection_id:randomUUID(),locale:'en'}}));assert(data.selection.status==='proposed','Expected suitable synthetic event to be proposed');return data.selection;};
  const suggestion=await find();
  await must(service.from('growth_events').update({location:'Changed venue'}).eq('id',event.id));
  const stale=await user.rpc('choose_growth_event',{p_selection_id:suggestion.id,p_reason:null});assert(stale.error,'Changed venue accepted using stale model step');
  const current=await find();
  await must(user.rpc('choose_growth_event',{p_selection_id:current.id,p_reason:null}));
  const active=await must(user.from('growth_steps').select().eq('status','active'));
  assert(active.length===1 && active[0].event_id===event.id,'Acceptance did not create exactly one event step');
  // A competing delete must wait for the same lock, then clear even the new snapshot.
  await new Promise((resolve,reject)=>{
    let deleting=null;let output='';
    const sql=`begin; select pg_advisory_xact_lock(hashtextextended('${userId}',0)); select 'LOCK_HELD'; select pg_sleep(0.5); select id from public.claim_growth_event_selection('${randomUUID()}','${userId}'); commit;`;
    const claiming=spawn('psql',['postgresql://postgres:postgres@127.0.0.1:54322/postgres','-v','ON_ERROR_STOP=1','-At']);
    claiming.stdin.end(sql.replaceAll(';',';\n'));
    claiming.stdout.on('data',data=>{
      output+=data.toString();
      if(output.includes('LOCK_HELD') && !deleting) deleting=must(user.from('growth_event_preferences').delete().eq('user_id',userId));
    });
    claiming.on('error',reject);
    claiming.on('close',async code=>{try{assert(code===0,'Concurrent claim failed');assert(deleting,'Concurrency test did not start deletion');await deleting;resolve();}catch(error){reject(error);}});
  });
  const retained=await must(user.from('growth_event_selections').select('id'));assert(retained.length===0,'Deleted preference snapshots remain');
  await must(user.rpc('delete_user'));userId=null;
  console.log('Event API smoke passed: no match, generated match, stale rejection, confirmed single step, preference deletion, account deletion.');
}finally{
  if(userId) await service.auth.admin.deleteUser(userId);
  await service.from('growth_events').delete().eq('source_id',sourceId);
  await service.from('growth_event_sources').delete().eq('id',sourceId);
  await user.auth.signOut();
}
