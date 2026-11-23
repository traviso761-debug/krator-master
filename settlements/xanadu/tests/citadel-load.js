/* settlements/xanadu/tests/citadel-load.js: the loader test-citadel-rooms.js shares (not a test itself: no test- prefix).
   load() -> {IX, KROOMLIGHT, XACITR, G, drawn}: the interiors core and the citadel's set (kits/interiors), the Pleasure Dome's
   plan (kits/xanadu 78a, 78c, 78o's patch), and what the page DRAWS, captured: the kit's 78d and 78n run under a recording stub
   (every name they draw through is a no-op that logs its calls), so the room graph is checked against the page's own openings. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..');
const rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');

/* a recording stub: any name, any property, any call; calls logged by their dotted name */
function recorder(){const LOG=[];
 const mk=name=>new Proxy(()=>{},{
  get:(t,k)=>k===Symbol.toPrimitive?(()=>0):typeof k==='symbol'?undefined:k==='then'?undefined:mk(name+'.'+String(k)),
  apply:(t,self,args)=>{LOG.push({name,args});return mk(name+'()');},
  set:()=>true,has:()=>true});
 return{LOG,mk};}

function drawContext(files){const rec=recorder(),REAL={window:{},TAU:Math.PI*2,
  loc:(x,z,lx,lz,ry)=>[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)]};
 const P=new Proxy(REAL,{has:(t,k)=>typeof k==='string'&&(k in t||!(k in globalThis)),
  get:(t,k)=>k===Symbol.unscopables?undefined:(k in t)?t[k]:rec.mk(String(k)),set:(t,k,v)=>{t[k]=v;return true;}});
 const ctx=vm.createContext({__P:P,console});
 const names=['XPAT','XPDOME','xdomePlan','xdomeHall','xdomeStairs','xdomeRooms','xcPlan'];
 const src='with(__P){\n'+files.map(rd).join('\n;\n')+'\n;__out={'+names.map(n=>n+':typeof '+n+'!=="undefined"?'+n+':null').join(',')+'};}';
 vm.runInContext(src,ctx,{filename:'citadel-draw'});
 return{out:REAL.__out,rec,REAL};}

function load(){
 const ix=vm.createContext({console});
 const core=fs.readdirSync(path.join(ROOT,'kits/interiors/src')).filter(f=>/^\d/.test(f)&&f.endsWith('.js')&&f<'50').sort();
 for(const f of core)vm.runInContext(rd('kits/interiors/src/'+f),ix,{filename:f});
 vm.runInContext(rd('kits/interiors/sets/xanadu-citadel.js'),ix,{filename:'xanadu-citadel.js'});
 const IX=vm.runInContext('KratorInteriors',ix);
 const K='kits/xanadu/src/';
 const D=drawContext([K+'78a-xa-pattern-data.js',K+'78c-xa-dome-plan.js',K+'78d-xa-dome-in.js',K+'78n-xa-citadel.js',K+'78o-xa-golden-way.js']);
 const KROOMLIGHT=require(path.join(ROOT,'core/interiors/10-core-roomlight.js'));
 const XACITR=require(path.join(ROOT,'settlements/xanadu/citadel/rooms/89yr-xa-citadel-rooms.js'));
 const plan=D.out.xdomePlan();
 const G=XACITR.build({item:k=>IX.sets.find(k),XPDOME:D.out.XPDOME,plan});
 /* what the page draws: each citadel building's windows (xcPlan's clear panes, its jali cards) and lamps (78m xmLamp), and the Dome's 78d extras */
 const drawn={cit:{},dome:{}};
 for(const S of XACITR.SITES){if(S.key==='xa_pleasure_dome')continue;D.rec.LOG.length=0;D.out.xcPlan(IX.sets.find(S.key),{});
  drawn.cit[S.id]={panes:D.rec.LOG.filter(c=>c.name==='vB'&&c.args[0]==='vWinClear').map(c=>({x:c.args[1],y:c.args[2],z:c.args[3],w:c.args[4],h:c.args[5]})),
   jali:D.rec.LOG.filter(c=>c.name==='xmJali').length,
   lamps:D.rec.LOG.filter(c=>c.name==='xmLamp').map(c=>({k:c.args[0],x:c.args[1],y:c.args[2],z:c.args[3],ry:c.args[4],top:c.args[5]&&c.args[5].top}))};}
 D.rec.LOG.length=0;const Kd=D.rec.mk('K');
 D.out.xdomeHall({v:0},{},Kd);D.out.xdomeStairs({v:0},{},Kd);D.out.xdomeRooms({v:0},{},Kd);
 const L=D.rec.LOG;
 drawn.dome={glass:L.filter(c=>c.name==='K.glass').map(c=>c.args.slice(0,6)),panes:L.filter(c=>c.name==='vB'&&c.args[0]==='vWinClear').map(c=>c.args.slice(1,7)),
  gores:L.filter(c=>c.name==='xpGoreDome').map(c=>({x:c.args[0],y:c.args[1],z:c.args[2],r:c.args[3],hk:c.args[4]&&c.args[4].hk})),
  chandeliers:L.filter(c=>c.name==='xpChandelier').map(c=>c.args.slice(0,5))};
 return{IX,KROOMLIGHT,XACITR,G,drawn,plan,XPDOME:D.out.XPDOME};}
module.exports={load,ROOT};
