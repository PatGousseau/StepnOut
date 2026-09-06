// Offline preview of the actual React Native components, rendered by react-native-web.
// Run: node tests/growth-guidance-preview/preview.mjs /path/to/esbuild/lib/main.js
// No Supabase, analytics, microphone or model requests are made.
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
const require = createRequire(import.meta.url);
const { build } = require(process.argv[2] || "esbuild");
const root = process.cwd();
const fixture = path.join(root, "tests/growth-guidance-preview/fixtures.ts");
const glyphs = require("@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json");
const mocks = {
  "react-native": 'export * from "react-native-web";import {Platform as BasePlatform} from "react-native-web";export const Platform={...BasePlatform,OS:new URLSearchParams(location.search).has("voice")?"ios":"web"};',
  AuthContext: 'export const useAuth=()=>({user:{id:"preview"}});',
  LanguageContext: `import {translations} from ${JSON.stringify(path.join(root, "src/constants/translations.ts"))}; const language=new URLSearchParams(location.search).get('lang')||'en'; const t=(key,params={})=>Object.entries(params).reduce((s,[k,v])=>s.replace('('+k+')',String(v)),language==='it'?(translations[key]||key):key);export const useLanguage=()=>({language,t});`,
  posthog: 'export const captureEvent=()=>{};',
  "@react-navigation/native": 'export const useIsFocused=()=>true;',
  "expo-router": 'export const router={navigate:()=>{location.href="/"},back:()=>{location.href="/"}};',
  "expo-crypto": 'export const randomUUID=()=>crypto.randomUUID();',
  "expo-av": 'export const Audio={};',
  "expo-file-system/legacy": 'export const deleteAsync=async()=>{};',
  "react-native-safe-area-context": 'export {View as SafeAreaView} from "react-native-web";',
  growthGuidanceService: `import {plan,step,entry} from ${JSON.stringify(fixture)};const empty=new URLSearchParams(location.search).has('empty');let activeStep=empty?null:step;let interactions=empty?[]:[entry];let latestResponse=null;
  let fail=new URLSearchParams(location.search).has('failure');
  export const growthGuidanceService={fetchPlanExperience:async()=>{if(fail){fail=false;throw new Error('synthetic_load_failure')}return {plan,activeStep,interactions,latestResponse,pendingInteractionId:null}},fetchJournalHistory:async()=>interactions,fetchStepHistory:async()=>[],fetchStepReports:async()=>[],
  setStepChoice:async(id,choice)=>{activeStep=choice==='accept'?{...step,accepted_at:new Date().toISOString()}:null},fetchVoiceJournalDraft:async()=>new URLSearchParams(location.search).has('transcript')?{id:'voice-preview',plan_id:plan.id,status:'review',machine_transcript:'I waved to my neighbour today.',duration_ms:4000}:null,
  submitVoiceJournal:async(input)=>{const interaction={...entry,id:input.interactionId,journal_text:input.reviewedTranscript,voice_journal_id:input.voiceJournalId};interactions=[interaction,...interactions];latestResponse={id:'response',message:'That sounds like a useful small moment.',confirmation_status:'none'};return {interaction,response:latestResponse}},
  submitInteraction:async(input)=>{const interaction={...entry,id:input.interactionId,kind:input.kind,journal_text:input.journalText,request_kind:input.requestKind||null,report_outcome:input.outcome,follow_up:input.followUp};interactions=[interaction,...interactions];latestResponse={id:'response',message:'That small moment is worth noticing. You made room for connection without needing a perfect conversation.',confirmation_status:input.requestKind?'pending':'none',next_step:input.requestKind?{...step,title:'A simple hello',action:'Give a familiar neighbour a smile and say hello.'}:null};return {interaction,response:latestResponse}},
  confirmAdaptiveResponse:async(id,accepted)=>{latestResponse={...latestResponse,confirmation_status:accepted?'accepted':'rejected'};return latestResponse},deleteJournal:async({interactionId})=>{interactions=interactions.filter(e=>e.id!==interactionId)} }`,
  growthEventService: `import {eventPreferences,eventOpportunity,eventSelection} from ${JSON.stringify(fixture)};let preferences=new URLSearchParams(location.search).has('event')?eventPreferences:null;let selection=preferences?eventSelection:null;export const growthEventService={automatic:async()=>selection||{status:'no_match'},details:async()=>eventOpportunity,load:async()=>({preferences,areas:[],selection}),event:async()=>eventOpportunity,save:async(u,i,p)=>{preferences=p;selection=null},remove:async()=>{preferences=null;selection=null},choose:async()=>{selection=null},find:async()=>{selection=eventSelection;return selection}};`,
};
mocks["@expo/vector-icons/MaterialCommunityIcons"] = `import React from 'react';import {Text} from 'react-native-web';const glyphs=${JSON.stringify(glyphs)};export default function Icon({name,size,color}){return <Text aria-hidden style={{fontFamily:'MaterialCommunityIcons',fontSize:size,color}}>{String.fromCodePoint(glyphs[name]||glyphs.circle)}</Text>}`;
const result = await build({
  stdin: { contents: `import React from 'react';import {createRoot} from 'react-dom/client';import {GrowthPlanExperience} from './src/components/growthGuidance/GrowthPlanExperience';import {plan} from './tests/growth-guidance-preview/fixtures';createRoot(document.getElementById('root')).render(<GrowthPlanExperience initialPlan={plan}/>);`, resolveDir: root, loader: "tsx" },
  bundle: true, write: false, jsx: "automatic", format: "iife", define: { "process.env.NODE_ENV": '"development"', __DEV__: "true" },
  plugins: [{ name: "offline-fixtures", setup(b) {
    b.onResolve({ filter: /.*/ }, (args) => {
      const name = Object.keys(mocks).find((key) => args.path === key || args.path.endsWith('/' + key));
      if (name) return { path: name, namespace: "fixture" };
      if (args.path === "react-native") return { path: require.resolve("react-native-web") };
    });
    b.onLoad({ filter: /.*/, namespace: "fixture" }, (args) => ({ contents: mocks[args.path], loader: "tsx", resolveDir: root }));
  } }],
});
const js = result.outputFiles[0].contents;
createServer(async (req, res) => {
  if (req.url === "/preview.js") { res.setHeader("Content-Type", "text/javascript"); res.end(js); }
  else if (req.url === "/icons.ttf") { res.setHeader("Content-Type", "font/ttf"); res.end(await readFile(require.resolve("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"))); }
  else if (req.url === "/font.ttf") { res.setHeader("Content-Type", "font/ttf"); res.end(await readFile(path.join(root, "src/assets/fonts/Montserrat-Regular.ttf"))); }
  else { res.setHeader("Content-Type", "text/html");res.end('<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>@font-face{font-family:Montserrat-Regular;src:url(/font.ttf)}@font-face{font-family:MaterialCommunityIcons;src:url(/icons.ttf)}html,body,#root{height:100%;margin:0}#root{display:flex}*{box-sizing:border-box}</style><div id="root"></div><script src="/preview.js"></script>'); }
}).listen(4173, "127.0.0.1", () => console.log("Offline guidance preview: http://127.0.0.1:4173 (add ?lang=it or ?empty)"));
