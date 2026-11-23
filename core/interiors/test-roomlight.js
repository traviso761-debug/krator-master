#!/usr/bin/env node
/* Stage 7 shared [G data] unit tests for core/interiors/10-core-roomlight.js (I1-I4), on tools/ktest.js (2026-11-23: it
   declared its own ok before). Each claim beside its fault: the check fails on the fault and passes on the fix.
   Run: node core/interiors/test-roomlight.js */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const T=require('../../tools/ktest.js')(__filename);
const ROOT=path.join(__dirname,'..','..');
const KROOMLIGHT=require('./10-core-roomlight.js');
const swap=(rooms,id,o)=>rooms.map(r=>r.id===id?Object.assign({},r,o):r);
const table=rooms=>KROOMLIGHT.buildTable({rooms});

/* 1. Synthetic 4-room graph: WindowHall --door--> Corridor --door--> DeepCell, plus SealedRoom sharing a 20 cm wall with WindowHall (NO door!) */
const rooms=[
 {id:'win_hall',box:[0,0,0,10,4,10],doors:[{to:'corridor',w:1.6}],windows:[{w:2.0,h:1.8},{w:2.0,h:1.8}],lamps:[{amp:1,r:8}]},
 {id:'corridor',box:[10,0,0,14,4,10],doors:[{to:'win_hall',w:1.6},{to:'deep_cell',w:1.0}],windows:[],lamps:[{amp:1,r:6}]},
 {id:'deep_cell',box:[14,0,0,20,4,10],doors:[{to:'corridor',w:1.0}],windows:[],lamps:[{amp:1.2,r:8}]},
 {id:'sealed_adj',box:[0,0,10.2,10,4,18],doors:[],windows:[],lamps:[{amp:.8,r:6}]},
 {id:'sub_vault',box:[0,-20,0,12,-14,12],vault:true,doors:[{out:true,w:2.0}],windows:[{w:3,h:3}],lamps:[{amp:2,r:12}]}
];
const T1=table(rooms);
{
 const bfs=t=>{const wh=t.byId.win_hall,co=t.byId.corridor,dc=t.byId.deep_cell;return wh.hop===0&&co.hop===1&&dc.hop===2&&wh.daylight>.5&&wh.daylight>co.daylight&&co.daylight>dc.daylight&&dc.daylight>0;};
 T.neg('I2 a windowed hall (hop 0) > its corridor (hop 1) > the cell beyond (hop 2) ('+T1.byId.win_hall.daylight+' > '+T1.byId.corridor.daylight+' > '+T1.byId.deep_cell.daylight+')',
  bfs,table(swap(rooms,'win_hall',{windows:[]})),T1);
 const sealed=t=>t.byId.sealed_adj.daylight===0&&t.byId.sealed_adj.hop===-1;
 T.neg('I2 no light across a solid 20 cm wall without a door',sealed,table(swap(rooms,'sealed_adj',{doors:[{to:'win_hall',w:1.4}]})),T1);
 const vault=t=>t.byId.sub_vault.daylight===0&&t.byId.sub_vault.vault===true&&t.byId.sub_vault.interior===true;
 T.neg('I2 a vault takes no daylight, given windows and a door out or not',vault,table(swap(rooms,'sub_vault',{vault:false})),T1);
}
/* I3 room-gated pool: a lamp 1.0 m across a solid wall in sealed_adj is never picked when the eye is in win_hall */
{
 const lamps=[{x:5,y:2.2,z:9.6,amp:1.0,r:8,room:'win_hall'},{x:8,y:2.2,z:5.0,amp:0.9,r:8,room:'win_hall'},
  {x:5,y:2.2,z:10.5,amp:5.0,r:14,room:'sealed_adj'},{x:11,y:2.2,z:5.0,amp:1.0,r:8,room:'corridor'}];
 const wins=[{x:0.1,y:2.0,z:5.0,room:'win_hall'},{x:0.1,y:2.0,z:14.0,room:'sealed_adj'}];
 const pool=t=>{const p=KROOMLIGHT.pickPool({eye:[5,1.7,9.8],eyeRoom:'win_hall',table:t,lamps,windows:wins,sunUp:1.0,count:8,heroShadows:2}),sh=p.filter(q=>q.heroShadow);
  return p.length===4&&!p.some(q=>q.room==='sealed_adj')&&sh.length===2&&sh.every(s=>s.room==='win_hall'&&s.kind==='lamp');};
 const leak=JSON.parse(JSON.stringify(T1));leak.byId.win_hall.portals.push('sealed_adj');
 T.neg('I3 pickPool blocks a 5x brighter lamp 0.7 m behind a solid wall; heroShadow on 2 lamps of the eye\'s room',pool,leak,T1);
}

/* 2. I4 analytic per-vertex corner darkening */
{
 const box=[0,0,0,10,4,8];
 const ao=b=>{const midWall=KROOMLIGHT.vertexCornerAO(0,2.0,4.0,1,0,0,b),wallFloor=KROOMLIGHT.vertexCornerAO(0,0.02,4.0,1,0,0,b),tri=KROOMLIGHT.vertexCornerAO(0,0.02,0.02,1,0,0,b),midFloor=KROOMLIGHT.vertexCornerAO(5.0,0,4.0,0,1,0,b);
  return midWall===1&&midFloor===1&&wallFloor<.72&&tri<wallFloor&&tri>=.44;};
 T.neg('I4 corner AO: an open wall or floor 1.0, a wall-floor crease darker, the trihedral corner darkest (>= 0.44)',ao,[0,0,0,10,4,0.1],box);
}

/* 3. the cases Erewhon's citadel brought (XS2, 2026-11-23): aperture, shut doors, sized skylights */
{
 /* a window's aperture: a jali lets in less, in the table and in the pool */
 const jali=ap=>table(swap(rooms,'win_hall',{windows:[{w:2.0,h:1.8,aperture:ap},{w:2.0,h:1.8,aperture:ap}]})).byId.win_hall.daylight;
 T.neg('a window of aperture 0.35 (a jali) lights its room less than clear glass ('+jali(.35)+' < '+jali(1)+'), and no aperture is 1',
  ap=>jali(ap)<jali(1)&&jali(null)===jali(1)&&jali(null)===T1.byId.win_hall.daylight,1,.35);
 const poolAmp=ap=>KROOMLIGHT.pickPool({eye:[5,1.7,5],eyeRoom:'win_hall',table:T1,windows:[{x:.1,y:2,z:5,room:'win_hall',aperture:ap}],lamps:[],sunUp:1})[0].amp;
 T.neg('pickPool scales a window by its aperture',ap=>Math.abs(poolAmp(ap)-1.35*.4)<1e-9,1,.4);
 /* a shut door is a wall to the light: given on the door, or by o.shut (core/door's live state) */
 const shutRooms=rooms.map(r=>Object.assign({},r,{doors:r.doors.map(d=>d.to==='deep_cell'||(r.id==='deep_cell')?Object.assign({},d,{shut:true}):d)}));
 const dark=t=>t.byId.deep_cell.daylight===0&&t.byId.deep_cell.hop===-1&&t.byId.deep_cell.portals.length===0&&t.byId.corridor.daylight>0;
 T.neg('a shut door passes no light: the cell behind it stays at 0 (shut on the door)',dark,T1,table(shutRooms));
 T.neg('the same by o.shut(room, door)',dark,T1,KROOMLIGHT.buildTable({rooms,shut:(r,d)=>r.id==='deep_cell'||d.to==='deep_cell'}));
 T.ok('without shut, a table is what it was',JSON.stringify(KROOMLIGHT.buildTable({rooms,shut:()=>false}))===JSON.stringify(T1));
 /* a sized skylight: more for its area, at least 0.46; the old flag still 0.66; none: no skylightCount on the row */
 const sky=sk=>table(swap(rooms,'deep_cell',{skylights:sk})).byId.deep_cell;
 const big=sky([{r:1.8}]),small=sky([{r:.4}]),screened=sky([{r:1.8,aperture:.3}]);
 T.neg('a skylight lights its room at hop 0 by its open area (an oculus of 1.8 m: '+big.daylight+'; 0.4 m: '+small.daylight+'; 1.8 m behind a screen: '+screened.daylight+')',
  r=>r.hop===0&&r.daylight>=.46&&r.skylightCount===1&&big.daylight>small.daylight&&big.daylight>screened.daylight,T1.byId.deep_cell,big);
 T.ok('a room with no skylight has no skylightCount; skylight: true still gives 0.66',T1.byId.deep_cell.skylightCount===undefined&&table(swap(rooms,'sealed_adj',{skylight:true})).byId.sealed_adj.daylight===.66);
 T.neg('a skylight lights no room it has no portal to',t=>t.byId.sealed_adj.daylight===0,table(swap(swap(rooms,'deep_cell',{skylights:[{r:1.8}]}),'sealed_adj',{doors:[{to:'deep_cell',w:1}]})),
  table(swap(rooms,'deep_cell',{skylights:[{r:1.8}]})));
 /* a skylight in the pool: a column of light. 40 m over the floor it is still picked, its light 6 m over the eye */
 const tb=table(swap(rooms,'deep_cell',{skylights:[{r:1.8}]}));
 const col=w=>{const p=KROOMLIGHT.pickPool({eye:[17,1.6,5],eyeRoom:'deep_cell',table:tb,windows:[w],lamps:[],sunUp:1});return p.length===1&&Math.abs(p[0].at[1]-7.6)<1e-9&&p[0].at[0]===17.5;};
 T.neg('pickPool: an oculus 40 m up is a column (picked from the floor, its light at the eye + 6 m, as the Godot twin)',col,
  {x:17.5,y:40,z:5,room:'deep_cell'},{x:17.5,y:40,z:5,room:'deep_cell',sky:true});
 T.ok('a skylight\'s light never above its opening, and an eye far above it out of reach',
  KROOMLIGHT.pickPool({eye:[17,1.6,5],eyeRoom:'deep_cell',table:tb,windows:[{x:17,y:4,z:5,room:'deep_cell',sky:true}],lamps:[],sunUp:1})[0].at[1]===4&&
  KROOMLIGHT.pickPool({eye:[17,40,5],eyeRoom:'deep_cell',table:tb,windows:[{x:17,y:4,z:5,room:'deep_cell',sky:true}],lamps:[],sunUp:1}).length===0);
}

/* 4. Real Longsong Monastery rooms (40-ls-plan.js + 40c-ls-rooms.js; 40g flags the skylit ones, as the page's callers do): 600+ rooms, lecture hall vs archive stacks vs slow water */
{
 const ctx={console,Math,JSON,KROOMLIGHT};vm.createContext(ctx);
 for(const f of ['core/rand/08-core-rand.js','settlements/longsong/src/15-ls-tune.js','settlements/longsong/src/40-ls-plan.js','settlements/longsong/src/40c-ls-rooms.js','settlements/longsong/src/40g-ls-roomlight.js']){
  vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
 }
 const RM=ctx.LS.ROOMS,LIST=ctx.LS_ROOMLIGHT.rooms(RM.list);
 const winOf=r=>{if(r.outdoor||r.vault)return[];if(/cataclysm|library|hours|chronicle|council|abbot|refectory/.test(r.id))return[{w:1.6,h:2.0},{w:1.6,h:2.0}];return[];};
 const LT=KROOMLIGHT.buildTable({rooms:LIST,windowsOf:winOf});
 const ls=t=>{const a=t.byId['wp.assembly'],c=t.byId['wp.k0.w.out.cataclysm'],co=t.byId['wp.k0.w.corridor'],g=t.byId['base.k-2.granary'];
  return t.order.length>=300&&a.daylight>=.66&&c.daylight>.5&&c.daylight>co.daylight&&co.daylight>g.daylight;};
 T.neg('Longsong ('+LT.order.length+' rooms): the Assembly (its skylight columns, flagged by 40g) and a Cataclysm hall > an inner corridor > a sub-base granary',
  ls,KROOMLIGHT.buildTable({rooms:RM.list,windowsOf:winOf}),LT);
}
T.done();
