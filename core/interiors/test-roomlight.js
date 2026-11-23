#!/usr/bin/env node
/* Stage 7 shared [G data] unit tests for core/interiors/10-core-roomlight.js (I1-I4), each with a paired negative.
   Run: node core/interiors/test-roomlight.js */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..');
const KROOMLIGHT=require('./10-core-roomlight.js');

let fails=0,total=0;
function ok(name,cond,neg){
 total++;
 const pass=!!cond&&(neg===undefined||neg===false);
 if(!pass)fails++;
 console.log((pass?' ok   ':' FAIL ')+name+(neg!==undefined?'  (negative '+(neg===false?'fails':'DID NOT FAIL')+')':''));
}

/* 1. Synthetic 4-room graph: WindowHall --door--> Corridor --door--> DeepCell, plus SealedRoom sharing a 20 cm wall with WindowHall (NO door!) */
{
 const rooms=[
  {id:'win_hall',box:[0,0,0,10,4,10],doors:[{to:'corridor',w:1.6}],windows:[{w:2.0,h:1.8},{w:2.0,h:1.8}],lamps:[{amp:1,r:8}]},
  {id:'corridor',box:[10,0,0,14,4,10],doors:[{to:'win_hall',w:1.6},{to:'deep_cell',w:1.0}],windows:[],lamps:[{amp:1,r:6}]},
  {id:'deep_cell',box:[14,0,0,20,4,10],doors:[{to:'corridor',w:1.0}],windows:[],lamps:[{amp:1.2,r:8}]},
  {id:'sealed_adj',box:[0,0,10.2,10,4,18],doors:[],windows:[],lamps:[{amp:.8,r:6}]},
  {id:'sub_vault',box:[0,-20,0,12,-14,12],vault:true,doors:[{out:true,w:2.0}],windows:[{w:3,h:3}],lamps:[{amp:2,r:12}]}
 ];
 const T=KROOMLIGHT.buildTable({rooms});
 const wh=T.byId.win_hall,co=T.byId.corridor,dc=T.byId.deep_cell,sa=T.byId.sealed_adj,sv=T.byId.sub_vault;
 ok('I2 BFS hop 0 windowed hall > hop 1 corridor > hop 2 deep cell ('+wh.daylight+' > '+co.daylight+' > '+dc.daylight+')',
  wh.hop===0&&co.hop===1&&dc.hop===2&&wh.daylight>.5&&wh.daylight>co.daylight&&co.daylight>dc.daylight&&dc.daylight>0,
  co.daylight>=wh.daylight);
 ok('I2 zero light bleed across solid 20 cm wall without a door (sealed_adj daylight === '+sa.daylight+')',
  sa.daylight===0&&sa.hop===-1,
  KROOMLIGHT.buildTable({rooms:rooms.map(r=>r.id==='sealed_adj'?Object.assign({},r,{doors:[{to:'win_hall',w:1.4}]}):r)}).byId.sealed_adj.daylight===0);
 ok('I2 subterranean vault room masks all exterior daylight even if given fake windows/out doors',
  sv.daylight===0&&sv.vault===true&&sv.interior===true,
  wh.daylight===0);

 /* I3 room-gated pool: lamp 1.0 m across solid wall in sealed_adj MUST NOT be picked when eye is in win_hall */
 const lamps=[
  {x:5,y:2.2,z:9.6,amp:1.0,r:8,room:'win_hall'},
  {x:8,y:2.2,z:5.0,amp:0.9,r:8,room:'win_hall'},
  {x:5,y:2.2,z:10.5,amp:5.0,r:14,room:'sealed_adj'},
  {x:11,y:2.2,z:5.0,amp:1.0,r:8,room:'corridor'}
 ];
 const wins=[{x:0.1,y:2.0,z:5.0,room:'win_hall'},{x:0.1,y:2.0,z:14.0,room:'sealed_adj'}];
 const picked=KROOMLIGHT.pickPool({eye:[5,1.7,9.8],eyeRoom:'win_hall',table:T,lamps,windows:wins,sunUp:1.0,count:8,heroShadows:2});
 const leaked=picked.some(p=>p.room==='sealed_adj');
 const shadows=picked.filter(p=>p.heroShadow);
 ok('I3 pickPool blocks 5x-brighter lamp 0.7 m behind solid wall and enables heroShadow on 2 active-room lamps',
  picked.length===4&&!leaked&&shadows.length===2&&shadows.every(s=>s.room==='win_hall'&&s.kind==='lamp'),
  picked.some(p=>p.room==='sealed_adj')||shadows.length===0);
}

/* 2. I4 analytic per-vertex corner darkening */
{
 const box=[0,0,0,10,4,8];
 const midWall=KROOMLIGHT.vertexCornerAO(0,2.0,4.0, 1,0,0, box);
 const wallFloor=KROOMLIGHT.vertexCornerAO(0,0.02,4.0, 1,0,0, box);
 const triCorner=KROOMLIGHT.vertexCornerAO(0,0.02,0.02, 1,0,0, box);
 const midFloor=KROOMLIGHT.vertexCornerAO(5.0,0,4.0, 0,1,0, box);
 ok('I4 corner AO: open wall/floor center === 1.0, wall-floor crease ('+wallFloor.toFixed(3)+') > trihedral corner ('+triCorner.toFixed(3)+')',
  midWall===1&&midFloor===1&&wallFloor<.72&&triCorner<wallFloor&&triCorner>=.44,
  triCorner>=midWall);
}

/* 3. Real Longsong Monastery rooms (40-ls-plan.js + 40c-ls-rooms.js): 700+ rooms, lecture hall vs archive stacks vs slow water */
{
 const ctx={console,Math,JSON,KROOMLIGHT};vm.createContext(ctx);
 for(const f of ['core/rand/08-core-rand.js','settlements/longsong/src/15-ls-tune.js','settlements/longsong/src/40-ls-plan.js','settlements/longsong/src/40c-ls-rooms.js']){
  vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
 }
 const RM=ctx.LS.ROOMS;
 /* Mark front/outer range rooms as windowed, inner archive stacks as windowless */
 const T=KROOMLIGHT.buildTable({
  rooms:RM.list,
  windowsOf:r=>{
   if(r.outdoor||r.vault)return[];
   if(/cataclysm|library|hours|chronicle|council|abbot|refectory/.test(r.id))return[{w:1.6,h:2.0},{w:1.6,h:2.0}];
   return[];
  }
 });
 const assembly=T.byId['wp.assembly'],cat=T.byId['wp.k0.w.out.cataclysm'],corr=T.byId['wp.k0.w.corridor'],granary=T.byId['base.k-2.granary'];
 ok('Longsong 320+ rooms table built ('+T.order.length+' rooms): Assembly & Cataclysm hall > inner corridor > sub-base granary',
  T.order.length>=300&&assembly.daylight>.6&&cat.daylight>.5&&cat.daylight>corr.daylight&&corr.daylight>granary.daylight,
  granary.daylight>=cat.daylight);
}

console.log(fails?fails+' FAILED of '+total:'all '+total+' passed');
process.exit(fails?1:0);
