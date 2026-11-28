// ================================================================= THE BEACON - the interiors (the build's step B8; the owner, 2026-11-23: "do B8")
// Every building of the order and the Lamp Plinth gets its rooms, planned on its shell and furnished from the catalog, by
// kits/qiblai's interiors (89q5s qnIxType: kits/interiors' planBuilding, the linings, stairs and slabs in the Xanadu kit's
// textured items, qnFurnishRooms with the page's furniture bundle), as Qiblai's city does its lots: the order's buildings are
// Qiblai stacks (bc_block, 90r), and the plinth is 80g's (the fort placed beacon:'ancient', which 80g's own fort set leaves
// alone). 90r listed each building's storey stacks while it drew (QB_SHELLREC: BC_IXREC); the shell is the main one
// (qnShellOf; the plinth's, the stack on the keep's place). The programmes are the blueprint's floors (BLUEPRINT.md: sheets L,
// P and B1-B2), in kits/interiors' room kinds; the Order's own pieces (kits/catalog, xanadu: the switchboard, the signal book's
// lectern, the Register of Lights ...) are offered first in the rooms that want them and kept out of the rest (BC_IX_WANT).
// Each interior is posed at its building's place, its pieces registered in core/tags (KTAGS.page) where they stand, its street
// door unlocked and its floors and stairs put into core/walk (qnIxWalk), so the walker (F) goes in. The gatehouses are passages:
// no rooms. window._beaconIx reports. [web]: three.js.
const BC_IX_WEALTH={holy:.7,labrang:.8,plain:.5,earth:.4};
/* a building's storeys (l: 0 the ground) in room kinds; the Labrang's and the plinth's floor by floor (sheets L and P) */
const BC_IX_PROG={
 guest_hall:l=>l?['bedroom','bedroom','bedroom','store']:['hall','kitchen','store'],
 store:l=>l?['dormitory','store']:['store','store','store'],
 labrang:l=>[['lobby','guard','store','study','hall'],['audience','study','committee','library'],['cell','cell','chamber','bedroom','study','shrine'],['shrine','gallery']][Math.min(l,3)],
 kitchen:l=>l?['store']:['kitchen','store'],
 novices:l=>l?['dormitory','dormitory']:['school','school','store'],
 chamber:l=>l?['bedroom']:['study'],
 infirmary:l=>l?['dormitory','study']:['dormitory','kitchen','store'],
 lamp_school:l=>l?['dormitory','study']:['school','school','library'],
 refectory:l=>l?['store']:['hall','kitchen'],
 hall_of_lights:l=>l?['library','library']:['shrine'],   /* the Register of Lights' hall below, the Library of Lights above */
 butter_lamps:()=>['shrine','store'],
 generator:()=>['workshop','store'],
 workshop:()=>['workshop','store'],
 /* P0 the switch room and cable vault, P1 the signal room and the log, P2 the Lamp Watch and its store, P3 the Chapel of the
    Beacon and its sacristy */
 plinth:l=>[['workshop','store'],['signals','study'],['dormitory','store'],['shrine','store']][Math.min(l,3)]};
/* the Order's pieces each building's rooms are offered first; every other building is offered none of them */
const BC_IX_OWN=['xanadu_lamp_switchboard','xanadu_cable_drum','xanadu_signal_lectern','xanadu_common_signal_mirror','xanadu_register_of_lights',
 'xanadu_court_gold_banner','xanadu_court_relic_lamp','xanadu_generator_set','xanadu_lens_bench','xanadu_common_hour_drum','xanadu_common_reader_seat'];
const BC_IX_WANT={plinth:['xanadu_lamp_switchboard','xanadu_cable_drum','xanadu_signal_lectern','xanadu_common_signal_mirror','xanadu_court_gold_banner'],
 generator:['xanadu_generator_set','xanadu_lamp_switchboard','xanadu_cable_drum'],workshop:['xanadu_lens_bench','xanadu_cable_drum'],
 lamp_school:['xanadu_signal_lectern','xanadu_common_signal_mirror','xanadu_lens_bench'],hall_of_lights:['xanadu_register_of_lights','xanadu_court_relic_lamp','xanadu_court_gold_banner'],
 labrang:['xanadu_court_gold_banner','xanadu_common_signal_mirror'],refectory:['xanadu_common_reader_seat']};
/* the pieces that make a room what it is: in these buildings they are the only Xanadu pieces of their type the placer is offered
   (kits/interiors shuffles its candidates, so being first is not enough): the Register is the Hall of Lights' altar, the
   switchboard the switch room's work place and the signal book's lectern the signal room's desk, the engine set and the
   switchboard the generator house's, the lens bench the workshop's */
const BC_IX_ONLY={plinth:['xanadu_lamp_switchboard','xanadu_signal_lectern'],hall_of_lights:['xanadu_register_of_lights'],
 generator:['xanadu_generator_set','xanadu_lamp_switchboard'],workshop:['xanadu_lens_bench']};
/* and the culture's other pieces that would fill the same need (a shrine room's altar may be an 'altar' or a 'shrine') */
const BC_IX_BLOCK={hall_of_lights:['xanadu|shrine']};
const BC_IX=(function(){const S={on:false,buildings:[],rooms:0,pieces:0,fails:[],ms:0,placed:{},walked:0};
 const report=()=>{window._beaconIx={on:S.on,buildings:S.buildings.map(b=>({id:b.id,kind:b.kind,levels:b.levels,rooms:b.rooms,kinds:b.kinds,pieces:b.pieces,keys:b.keys,fails:b.fails,door:b.door,walk:b.walk,passage:b.passage||null})),
  rooms:S.rooms,pieces:S.pieces,fails:S.fails.slice(0,10),ms:S.ms,placed:S.placed,walked:S.walked};};
 if(typeof qnIxType!=='function'||typeof KratorInteriors==='undefined'||typeof KratorFurniture==='undefined'){S.fails.push('no interiors on the page');report();return S;}
 S.on=true;const IX=KratorInteriors,W=typeof KWALK!=='undefined'?KWALK:null,T0=KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'}));
 const loc=(px,pz,x,z,ry)=>[px+x*Math.cos(ry)+z*Math.sin(ry),pz-x*Math.sin(ry)+z*Math.cos(ry)];
 /* the catalog as one building sees it: its wanted pieces first, the Order's others out (qnFurnishRooms' perType keeps the first
    three of a culture's type, in this order) */
 const offered=(want,only,block,fn)=>{const ra=IX.runtimeAdapter;IX.runtimeAdapter=function(){const A=ra.apply(this,arguments),L0=A.list.bind(A);let c=null;
   A.list=function(){if(c)return c;const l=L0(),ot=new Set(only.map(k=>l.find(d=>d.key===k)).filter(Boolean).map(d=>d.culture+'|'+d.type).concat(block));
    c=want.concat(only.filter(k=>want.indexOf(k)<0)).map(k=>l.find(d=>d.key===k)).filter(Boolean)
     .concat(l.filter(d=>BC_IX_OWN.indexOf(d.key)<0&&!ot.has(d.culture+'|'+d.type)));return c;};return A;};
  try{return fn();}finally{IX.runtimeAdapter=ra;}};
 const doorsAt=new Map();for(const D of KDOOR.list){const m=/^(.*)\.\d+(#\d+)?$/.exec(D.id);if(m)(doorsAt.get(m[1])||doorsAt.set(m[1],[]).get(m[1])).push(D);}
 const t0=performance.now(),inst0=window._instances;   /* kbake's count is the page's (beacon-laid); the interiors' own bakes would overwrite it */
 for(const R of BC_IXREC){const plinth=R.part==='plinth',p=plinth?null:bcPart(R.part),kind=plinth?'plinth':p.kind;
  if(!BC_IX_PROG[kind])continue;   /* the gatehouses: passages */
  const id=plinth?'plinth':p.id,pose={x:R.x,z:R.z,y:R.y==null?0:R.y,ry:R.ry||0};
  let sh=null,body=null;
  if(plinth){/* the plinth is battered: 80g's storeys narrow from 12 m to 10.6 m and its chapel is 9.75 m. Its shell is the stack of
    storeys on the keep's place with the chapel added on top, sized to the chapel's top (its linings inside every storey's walls);
    body: the ground storey's half depth, the doorway's outer face */
   const L=BC.lampRec&&BC.lampRec.at,dx=L?L[0]-pose.x:0,dz=L?L[2]-pose.z:0,c=Math.cos(pose.ry),s=Math.sin(pose.ry),lx=dx*c-dz*s,lz=dx*s+dz*c;
   const on=R.list.filter(q=>Math.hypot(q.x-lx,q.z-lz)<1.5),st=on.filter(q=>q.hs.length>=3).sort((a,b)=>a.y-b.y)[0],ch=on.filter(q=>st&&q.y>st.y+st.hs.reduce((a,b)=>a+b,0)-.4).sort((a,b)=>a.w-b.w)[0];
   if(st&&ch){const w=Math.round((Math.min(ch.w,ch.d)*.96+.5)*100)/100,hs=st.hs.concat(ch.hs).slice(0,4);
    sh={x:st.x,y:st.y,z:st.z,w,d:w,ry:st.ry,hs,h:hs[0],n:hs.length,sig:[st.x,st.y,st.z,w,w,st.ry].concat(hs).join(',')};body={hd:st.d/2,hw:st.w/2};}}
  else sh=qnShellOf(R.list);
  const B={id,kind,levels:0,rooms:0,kinds:[],pieces:0,keys:{},fails:[],door:null,walk:false};S.buildings.push(B);
  if(!sh){B.fails.push('no shell');continue;}
  const doors=doorsAt.get((plinth?'xa_fort_watch':'bc_block')+'@'+Math.round(R.x)+','+Math.round(R.z));
  const dr=qnIxDoorOf(sh,pose,doors);B.door=dr?{n:dr.n,t:dr.t,w:dr.w,h:dr.h}:null;
  const holy=BC_HOLY.indexOf(kind)>=0||kind==='plinth'||kind==='butter_lamps'||kind==='hall_of_lights',wealth=kind==='labrang'?BC_IX_WEALTH.labrang:holy?BC_IX_WEALTH.holy:BC_EARTH.indexOf(kind)>=0?BC_IX_WEALTH.earth:BC_IX_WEALTH.plain;
  const prog={name:'beacon-'+kind,wealth,program:BC_IX_PROG[kind]};
  let T=null;try{T=offered(BC_IX_WANT[kind]||[],BC_IX_ONLY[kind]||[],BC_IX_BLOCK[kind]||[],()=>{let best=null;for(let k=0;k<3;k++){const U=qnIxType(sh,'bc.'+id,34900+BCL.parts.indexOf(p)*31+k*7919,dr?{n:dr.n,t:dr.t,w:dr.w,h:dr.h}:null,prog);
    if(!U||!U.G){if(!best)best=U;break;}if(!best||!best.G||U.F.fails.length<best.F.fails.length)best=U;if(!best.F.fails.length)break;}return best;});}
  catch(e){B.fails.push(String(e&&e.message||e));continue;}
  if(!T||!T.G){B.fails.push(T&&T.error||'no plan');continue;}
  S.T=S.T||{};S.T[id]=T;const g=T.G;g.name='interior:'+id;
  if(body&&dr){/* the plinth's doorway through its thick wall, from the plan's face out to the body's: jambs, a lintel, a threshold
    (the Xanadu kit's wash and planks, drawn before the page as the plan is), the depth-only portal moved out to the body's face */
   const side=dr.n[0]!==0,f0=side?sh.w/2:sh.d/2,f1=side?body.hw:body.hd,dep=f1-f0+.04,mid=(f0+f1)/2,dw=Math.max(.95,dr.w+.1),dh=Math.max(2,Math.min(dr.h,sh.hs[0]-.3));
   const P=(off,t)=>side?[sh.x+dr.n[0]*off,sh.z+t]:[sh.x+t,sh.z+dr.n[1]*off],bry=sh.ry+(side?Math.PI/2:0),w0=xC(0xece4d6),Gd=new THREE.Group(),saveK=KXF;KXF=null;
   for(const e of[-1,1]){const q=P(mid,dr.t+e*(dw/2+.06));vB('xWashB',q[0],sh.y,q[1],.12,dh+.05,dep,bry,w0);}
   {const q=P(mid,dr.t);vB('xWashB',q[0],sh.y+dh,q[1],dw+.24,.25,dep,bry,w0);vB('qPlankB',q[0],sh.y,q[1],dw,.06,dep,bry,xC(0xf0e8dc));}
   KXF=saveK;kbake(Gd);for(const k in KIT.items)KIT.items[k].length=0;Gd.traverse(o=>{if(o.isMesh)o.renderOrder=-2;});Gd.name='doorway';g.add(Gd);
   const pt=g.getObjectByName('portal');if(pt){const q=P(f1+.03,dr.t);pt.position.x=q[0];pt.position.z=q[1];}
   B.passage={from:f0,to:f1};}
  g.position.set(pose.x,pose.y,pose.z);g.rotation.y=pose.ry;scene.add(g);g.updateMatrixWorld(true);
  B.levels=T.plan.levels.length;B.rooms=T.plan.rooms.length;B.kinds=T.plan.rooms.map(r=>r.kind);B.fails=(T.F.fails||[]).slice(0,4);S.rooms+=B.rooms;
  for(const q of T.F.placed||[]){const w=loc(pose.x,pose.z,q.x,q.z,pose.ry);B.pieces++;S.pieces++;S.placed[q.key]=(S.placed[q.key]|0)+1;if(BC_IX_OWN.indexOf(q.key)>=0)B.keys[q.key]=(B.keys[q.key]|0)+1;
   T0.add({prefix:'ixf','class':'furniture',kind:q.kind,key:q.key,name:q.name,at:[w[0],pose.y+q.y,w[1]],ry:q.ry+pose.ry,size:q.size,tags:Object.assign({},q.tags,{building:id}),frag:'90w-bc-interiors.js'});}
  /* walk in: the door's blocks off while the entry flight is laid (as Qiblai's lots), then the door unlocked */
  if(W){const D=dr&&dr.D,on=D?D.blocks.map(b=>!b.off):[];if(D)W.setBlock(D.blocks,false);
   const a=D?[D.at[0]+Math.sin(D.yaw)*1.2,D.at[2]+Math.cos(D.yaw)*1.2]:[pose.x,pose.z],ga=W.floorBelow(a[0],a[1],pose.y+T.plan.levels[0].y,.1);
   try{if(qnIxWalk(T,pose,W,Math.max(terrainH(a[0],a[1]),ga?ga[0]:-1e9),'interior:'+id)){B.walk=true;S.walked++;}}catch(e){B.fails.push('walk: '+(e&&e.message||e));}
   if(D){D.blocks.forEach((b,i)=>W.setBlock(b,on[i]));D.locked=false;}}}
 window._instances=inst0;S.ms=Math.round(performance.now()-t0);report();return S;})();
