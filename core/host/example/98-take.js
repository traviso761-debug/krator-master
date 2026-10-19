// ================================================================= EXAMPLE — everything core/host is handed, in one call
// The reference for a build adopting the whole interface (core/host/README.md): the views, the ground, the records
// (KTAGS.page), what things hold (o.holds over core/simulation: the stocks panel, O, and the inspector's contents), the
// editor (o.palette and a live world adapter: every edit a core/edits op), the cutaway (the shed's two storeys), the
// minimap from the records, marks. The world clock is the host's: 98 steps the simulation one world minute at a time.
const EXPIECES={crate:{w:1.2,d:1.2,h:1,col:0x9a7a52},barrel:{r:0.5,h:1.1,col:0x7a5a3a},shrub:{r:0.9,h:1.4,col:0x4f7a3e}};
function exPiece(key){const P=EXPIECES[key];if(!P)return null;
 const g=P.r?new THREE.CylinderGeometry(P.r,P.r,P.h,12).translate(0,P.h/2,0):new THREE.BoxGeometry(P.w,P.h,P.d).translate(0,P.h/2,0);
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:P.col}));m.name='piece:'+key;return m;}
const EXLIVE={};   // record id -> its mesh (the pieces the editor put down)
const exWorld={
 find:(t,tol)=>KEDITS.match(t,KTAGS.page.records.filter(r=>!r.removed),tol),
 add:(rec)=>{const m=exPiece(rec.key);if(!m)return null;m.position.set(rec.at[0],rec.at[1],rec.at[2]);m.rotation.y=rec.ry||0;scene.add(m);
  const P=EXPIECES[rec.key],r=KTAGS.page.add(Object.assign({},rec,{prefix:'piece',size:P.r?undefined:[P.w,P.d,P.h],r:P.r,h:P.h}));EXLIVE[r.id]=m;return r;},
 move:(h,at,ry)=>{const m=EXLIVE[h.id];if(!m)return;m.position.set(at[0],at[1],at[2]);if(ry!=null)m.rotation.y=ry;h.at=at.slice();if(ry!=null)h.ry=ry;},
 set:(h,path,value)=>{h[path]=value;},
 remove:(h)=>{const m=EXLIVE[h.id];if(m){scene.remove(m);delete EXLIVE[h.id];}KTAGS.page.remove(h.id);}};
let exLast=null;
const EXH=KHOST.take({
 build:'host-example',title:'core/host example',hint:'a toy economy on core/simulation, the whole interface on core/host',
 scene,camera,renderer,ground:exGround,clear:1.5,maxR:1500,
 views:{'The settlement':[60,140,240,75,0,20],'The shed':[60,30,70,40,3,30],'The farm':[190,40,80,150,0,30]},
 clock:{hour:8,running:true,scale:1,speeds:[0,1,2,4,8]},
 holds:KHOST.simHolds(SIM,{idOf:(rec,hit)=>hit&&hit.object===exDots&&hit.instanceId!=null?[EXACT[hit.instanceId]]:rec&&SIM.R.place[rec.key]?[rec.key]:[]}),
 inspect:(hit,hits,rec)=>hit.object===exDots&&hit.instanceId!=null?(()=>{const a=SIM.R.actor[EXACT[hit.instanceId]];return a.id+' · '+a.role+' · '+(a.activity||'idle')+(a.place?' at '+a.place:'');})():null,
 palette:{items:[{key:'crate',name:'Crate',family:'storage'},{key:'barrel',name:'Barrel',family:'storage'},{key:'shrub',name:'Shrub',family:'flora',cls:'flora'}],build:key=>exPiece(key)},
 edits:{world:exWorld,log:typeof KHOST_EDITS!=='undefined'?KHOST_EDITS:null,template:(it,at,ry)=>({'class':it.cls||'prop',key:it.key,name:it.name,at,ry})},
 cutaway:{units:[{id:'shed',name:'The shed',x:40,z:30,w:14,d:12,levels:[{y:0,h:4.5,name:'ground floor'},{y:4.5,h:4.5,name:'loft'}]}]},
 minimap:true,
 exporters:{tags:()=>KTAGS.page.export(),stocks:()=>SIM.stocks()},
 api:{world:()=>({minute:EX.m,day:EX.d}),contents:id=>SIM.contents(id)},
});
// the world minute follows the host's clock: one minute a real second at 1x (the speeds and the pause reach it)
let exAcc=0;
KHOST.on(function simStep(dt){exAcc+=dt;while(exAcc>=1){exAcc-=1;exMinute();}exDraw();});
// the editor's ops the page was made with (a saved edits.json, or this browser's draft): applied once, as the world is made
if(typeof KHOST_EDITS!=='undefined'&&KHOST_EDITS&&KHOST_EDITS.ops)window._edits=KEDITS.apply(KHOST_EDITS,exWorld,{});
