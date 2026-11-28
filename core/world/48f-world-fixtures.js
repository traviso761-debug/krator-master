// ================================================================= OPEN WORLD — fixtures: authored setpieces on streamed ground, ways and tubes (WFIX)
// [G data] openworld/catch-bowl/PLAN-SETPIECES.md section 1 (2026-11-25). Puts one authored group in one authored place — a toll
// house astride Route B, the Shrine of the Split Horn at the Brazier, the Hall of the Tally-Marks inside lava tube A3, a cairn,
// a bore windlass, or a dressed wreck — into the baked site plan (version 3, beside WHAZ; a region with none stays version 1 or
// 2, its hash untouched). Plain functions on plain records: no THREE, no DOM, no Math.random, no draw counts, so node
// (core/world/bake_sites.py), the browser (88f-world-fixtures.js) and Godot (core/world/wfix.gd) read one plan.
//
//   FIXTURE SPEC {id, kind (a registered builder's name), name?, culture?, and where:
//     at: [x, z] | px: [px, py] | site: '<id>' + near?: [dx, dz] | way: '<wayOrLinkId>' + s: <m along way>, sideOffset?: <m> |
//     tube: '<tubeId>' + s: <m along tube>,
//     on?: 'ground' | 'water' | 'cliff' | 'tube', look?: <m searched for flat dry ground>, R?: <m disc>,
//     face?: 'way' | <bearing rad> | [tx, tz], level?: <y>, ruin?: bool, when?, seed?, slots?: [...], ...own}
//   FIXTURE REC  {id, kind, name, culture, on, anchor: {x, y, z}, ry, R, slots: [SLOT], ruin, season?, way?, tube?, ...own}
//   SLOT         {id, key, v, kind, role?, x, y, z, ry, w, d, h, pending?, ruin?, wall?, ceiling?}
//
//   WFIX.builder(name, fn, {R, check}?)  open registry: fn(spec, ctx) -> {slots, R?, ry?, ...own}; chained (null removes)
//   WFIX.registered()                    sorted list of registered builder names
//   WFIX.kitDims(name, fn)               register box lookup fn(key, v) -> {w, d, h} | null; chained
//   WFIX.lay(spec, seed, o)              plan one fixture -> {fixture, errors} | {uncut} | {error}
//   WFIX.plan(spec, o)                   plan SITE_SPEC.fixtures -> {fixtures: [FIXTURE], uncut: [{id, why}], errors}
//   WFIX.of(plan)                        extract {fixtures, uncut} from a site plan (empty on version 1 or 2)
//   WFIX.inSeason(fix, yearDay)          true when fixture is active on `yearDay`
//   WFIX.check(plan, opt)                validate fixtures (inside cut, slots non-overlapping, ground/tube rules)
var WFIX=(function(){'use strict';
const r2=v=>Math.round(v*100)/100,r4=v=>Math.round(v*1e4)/1e4;
const copy=o=>o==null||typeof o!=='object'?o:Array.isArray(o)?o.map(copy):Object.assign({},...Object.keys(o).map(k=>({[k]:copy(o[k])})));
const api={},BUILDERS={},KITS={};

function builder(name,fn,o){if(fn==null){delete BUILDERS[name];return api;}
 if(typeof fn!=='function')throw new Error('WFIX.builder('+name+'): not a function');
 BUILDERS[name]={fn,R:(o&&o.R!=null)?o.R:24,check:(o&&o.check)?o.check:null};return api;}
function registered(){return Object.keys(BUILDERS).sort();}
function kitDims(name,fn){if(fn==null){delete KITS[name];return api;}
 if(typeof fn!=='function')throw new Error('WFIX.kitDims('+name+'): not a function');
 KITS[name]=fn;return api;}

/* oriented box geometry helpers (matching KCAMP / KSITES conventions) */
function boxCorners(r,pad){const p=pad==null?0:pad,c=Math.cos(r.ry==null?0:r.ry),s=Math.sin(r.ry==null?0:r.ry),
 hw=r.w/2+p,hd=r.d/2+p,ux=c*hw,uz=-s*hw,vx=s*hd,vz=c*hd;
 return[[r.x-ux-vx,r.z-uz-vz],[r.x+ux-vx,r.z+uz-vz],[r.x+ux+vx,r.z+uz+vz],[r.x-ux+vx,r.z-uz+vz]];}
function boxesOverlap(a,b,gap){const g=(gap==null?0:gap)/2,A=boxCorners(a,g),B=boxCorners(b,g);
 const axes=[[Math.cos(a.ry||0),-Math.sin(a.ry||0)],[Math.sin(a.ry||0),Math.cos(a.ry||0)],
  [Math.cos(b.ry||0),-Math.sin(b.ry||0)],[Math.sin(b.ry||0),Math.cos(b.ry||0)]];
 for(const ax of axes){let a0=1e18,a1=-1e18,b0=1e18,b1=-1e18;
  for(const q of A){const t=q[0]*ax[0]+q[1]*ax[1];if(t<a0)a0=t;if(t>a1)a1=t;}
  for(const q of B){const t=q[0]*ax[0]+q[1]*ax[1];if(t<b0)b0=t;if(t>b1)b1=t;}
  if(a1<=b0+1e-6||b1<=a0+1e-6)return false;}
 return true;}

function groundH(x,z,o){if(o&&o.ground&&typeof o.ground.H==='function')return o.ground.H(x,z);
 if(o&&typeof o.groundH==='function')return o.groundH(x,z);
 if(typeof WORLD!=='undefined'&&WORLD){if(WORLD.Hland)return WORLD.Hland(x,z);if(WORLD.H)return WORLD.H(x,z);}
 return 0;}
function waterH(x,z,o){if(o&&typeof o.water==='function')return o.water(x,z);
 if(typeof WORLD!=='undefined'&&WORLD&&WORLD.water)return WORLD.water(x,z);
 return -1e9;}
function insideWorld(x,z,o){if(o&&typeof o.inside==='function')return o.inside(x,z);
 if(typeof WORLD!=='undefined'&&WORLD&&WORLD.inside)return WORLD.inside(x,z);
 return true;}
function groundOkAt(x,z,o){if(o&&o.ground&&typeof o.ground.ok==='function')return o.ground.ok(x,z);
 if(typeof KSITES!=='undefined'&&KSITES&&KSITES.groundOk)return KSITES.groundOk(x,z);
 return insideWorld(x,z,o)&&!(waterH(x,z,o)>groundH(x,z,o)-0.3);}
function fromPx(px,py,o){if(o&&typeof o.fromPx==='function')return o.fromPx(px,py);
 if(typeof WORLD!=='undefined'&&WORLD&&WORLD.fromPx)return WORLD.fromPx(px,py);
 if(typeof WORLD_DATA!=='undefined'&&WORLD_DATA&&WORLD_DATA.meta&&WORLD_DATA.meta.frame){const F=WORLD_DATA.meta.frame.origin_px;return[(px-F[0])*2000,(py-F[1])*2000];}
 throw new Error('WFIX: no WORLD.fromPx to convert px coordinates');}

function boxFor(key,v,o){
 if(o&&typeof o.dims==='function'){const D=o.dims(key,v==null?0:v);if(D)return{D,pending:false};}
 for(const n of Object.keys(KITS).sort()){const D=KITS[n](key,v==null?0:v);if(D)return{D,pending:false};}
 if(typeof XAK!=='undefined'&&XAK&&typeof XAK.dims==='function'){const m=XAK.dims();if(m&&m[key])return{D:m[key],pending:false};}
 if(typeof IZV!=='undefined'&&IZV&&typeof IZV.dims==='function'){const m=IZV.dims();if(m&&m[key])return{D:m[key],pending:false};}
 if(typeof CAT!=='undefined'&&CAT&&CAT.ASSET_BY_KEY&&CAT.ASSET_BY_KEY[key]){const A=CAT.ASSET_BY_KEY[key];return{D:{w:A.w,d:A.d,h:A.h},pending:false};}
 return{D:{w:4,d:4,h:3},pending:true};}

function seasonOf(S){const W=S.when!==undefined?S.when:S.season;
 if(W==null)return null;
 if(typeof WHAZ!=='undefined'&&WHAZ.seasonOf)return WHAZ.seasonOf(S);
 if(Array.isArray(W))return{days:W.map(a=>a.slice()),name:null};
 if(W.days)return{days:W.days.map(a=>a.slice()),name:W.name==null?null:W.name};
 return null;}
function inSeason(F,yd){if(!F||!F.season)return true;
 if(typeof WHAZ!=='undefined'&&WHAZ.inSeason)return WHAZ.inSeason(F,yd);
 return true;}

/* arc-length interpolation along a 2D/3D polyline `pts` */
function alongPts(pts,sTarget){const cum=[0];
 for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
 const total=cum[cum.length-1];
 const d=Math.max(0,Math.min(total,sTarget));
 let lo=1,hi=pts.length-1;while(lo<hi){const m=(lo+hi)>>1;if(cum[m]<d)lo=m+1;else hi=m;}
 const a=pts[lo-1],b=pts[lo],seg=(cum[lo]-cum[lo-1])>0?(cum[lo]-cum[lo-1]):1,t=Math.max(0,Math.min(1,(d-cum[lo-1])/seg));
 const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,tx=(b[0]-a[0])/seg,tz=(b[1]-a[1])/seg;
 const y=a.length>=3&&b.length>=3?(a[2]+(b[2]-a[2])*t):null;
 const ground=a.length>=4&&b.length>=4?(a[3]+(b[3]-a[3])*t):null;
 return{x,z,y,ground,tx,tz,total,clamped:sTarget>total};}

function allWaysOf(P){if(!P)return[];
 return(P.sites||[]).flatMap(s=>s.roads||[]).concat(P.links||[]).concat(P.ways||[]);}

function placer(on,anchor,o,gap){const sp=(typeof KSPACE!=='undefined'&&KSPACE)?KSPACE.create({cell:16}):null,placed=[],G=gap==null?0.5:gap;
 let big=0;
 const okCorner=(x,z)=>{if(on==='tube'||on==='cliff')return insideWorld(x,z,o);
  if(on==='water')return insideWorld(x,z,o)&&waterH(x,z,o)>groundH(x,z,o)-0.2;
  return groundOkAt(x,z,o);};
 const fits=r=>{if(!boxCorners(r,0).every(q=>okCorner(q[0],q[1])))return false;
  const R0=Math.hypot(r.w,r.d)/2+G;
  if(sp)return !sp.some(r.x,r.z,R0+big,q=>boxesOverlap(r,q,G));
  return !placed.some(q=>boxesOverlap(r,q,G));};
 const put=r=>{const R0=Math.hypot(r.w,r.d)/2;big=Math.max(big,R0);placed.push(r);if(sp)sp.insert(r,r.x,r.z,R0);return r;};
 return{placed,gap:G,fits,put,first(L){for(const r of L)if(fits(r))return put(r);return null;}};}

/* ---------------------------------------------------------------- shipped generic setpiece builders */
/* 1. 'slots': author-laid relative offsets `[dx, dz, dry, dy]` in the fixture's local frame (+z along `ry`) */
builder('slots',(S,X)=>{const ca=Math.cos(X.ry),sa=Math.sin(X.ry),slots=[];
 (S.slots||[]).forEach((sl,i)=>{const b=X.dims(sl.key||'stone_block',sl.v||0);
  const w=sl.w==null?b.w:sl.w,d=sl.d==null?b.d:sl.d,h=sl.h==null?b.h:sl.h;
  const lx=sl.dx==null?0:sl.dx,lz=sl.dz==null?0:sl.dz,ly=sl.dy==null?0:sl.dy;
  const wx=X.anchor.x+lx*ca+lz*sa,wz=X.anchor.z-lx*sa+lz*ca;
  const wy=X.on==='tube'?X.anchor.y+ly:(X.on==='water'?X.level+ly:X.ground.H(wx,wz)+ly);
  const rec={id:S.id+'/s/'+(sl.id||i),key:sl.key||'stone_block',v:sl.v==null?0:sl.v,kind:sl.kind||'prop',
   x:r2(wx),y:r2(wy),z:r2(wz),ry:r4(X.ry+(sl.dry==null?0:sl.dry)),w:r2(w),d:r2(d),h:r2(h)};
  if(sl.role)rec.role=sl.role;if(b.pending&&sl.w==null)rec.pending=true;
  if(sl.wall)rec.wall=true;if(sl.ceiling)rec.ceiling=true;if(sl.ruin)rec.ruin=true;
  slots.push(rec);});
 return{slots};},{R:20});

/* 2. 'cairn': marker cairn + optional sign/gear pile (Catch-Lookout, Rangers' last cairn, descent turns) */
builder('cairn',(S,X)=>{const P=X.place(0.4),ca=Math.cos(X.ry),sa=Math.sin(X.ry);
 const mainKey=S.key||'cairn_stack',B0=X.dims(mainKey,0),w0=S.w==null?(B0.pending?2.4:B0.w):S.w,d0=S.d==null?(B0.pending?2.4:B0.d):S.d,h0=S.h==null?(B0.pending?3.2:B0.h):S.h;
 P.put({id:S.id+'/cairn',key:mainKey,v:0,kind:'monument',role:'cairn',x:r2(X.anchor.x),y:r2(X.anchor.y),z:r2(X.anchor.z),ry:r4(X.ry),w:r2(w0),d:r2(d0),h:r2(h0),pending:B0.pending&&S.w==null});
 if(S.tally!==false){const lx=2.6,lz=0.8,wx=X.anchor.x+lx*ca+lz*sa,wz=X.anchor.z-lx*sa+lz*ca;
  P.first([{id:S.id+'/board',key:S.boardKey||'tally_stone',v:0,kind:'sign',role:'tally',x:r2(wx),y:r2(X.on==='tube'?X.anchor.y:X.ground.H(wx,wz)),z:r2(wz),ry:r4(X.ry+0.25),w:1.2,d:0.6,h:1.8,pending:true}]);}
 if(S.gear){const a=X.unit(1)*Math.PI*2,wx=X.anchor.x+Math.cos(a)*2.8,wz=X.anchor.z+Math.sin(a)*2.8;
  P.first([{id:S.id+'/gear',key:'abandoned_pack',v:0,kind:'prop',role:'gear',x:r2(wx),y:r2(X.ground.H(wx,wz)),z:r2(wz),ry:r4(X.unit(2)*Math.PI*2),w:1.5,d:1.2,h:0.9,pending:true}]);}
 return{slots:P.placed,R:8};},{R:8});

/* 3. 'toll-gate': astride a trail (Sinter-Gate: gate arch across the bed, toll house & tally board beside, heated corral) */
builder('toll-gate',(S,X)=>{const ca=Math.cos(X.ry),sa=Math.sin(X.ry),hw=S.trailHw==null?2.5:S.trailHw,slots=[];
 const loc=(lx,lz,dry,id,key,role,w,d,h)=>{const b=X.dims(key,0),W=w==null?(b.pending?4:b.w):w,D=d==null?(b.pending?4:b.d):d,H=h==null?(b.pending?3.5:b.h):h;
  const wx=X.anchor.x+lx*ca+lz*sa,wz=X.anchor.z-lx*sa+lz*ca,wy=X.ground.H(wx,wz);
  const rec={id:S.id+'/'+id,key,v:0,kind:role==='corral'?'pen':'building',role,x:r2(wx),y:r2(wy),z:r2(wz),ry:r4(X.ry+dry),w:r2(W),d:r2(D),h:r2(H)};
  if(b.pending&&w==null)rec.pending=true;slots.push(rec);};
 /* two gate piers flanking the trail carriageway so nothing stands IN the road bed, with toll house & corral alongside */
 loc(-(hw+1.6),0,0,'pier_l',S.pierKey||'gate_pier','gate',2.2,2.2,4.5);
 loc(hw+1.6,0,0,'pier_r',S.pierKey||'gate_pier','gate',2.2,2.2,4.5);
 loc(hw+6.5,1.5,-Math.PI/2,'house',S.houseKey||'xa_guardhouse','toll-house',7,5.5,4.8);
 loc(-(hw+3.4),3.5,Math.PI/4,'tally',S.tallyKey||'tally_board','tally',1.8,0.6,2.2);
 if(S.corral!==false)loc(hw+15,-8,-Math.PI/2,'corral',S.corralKey||'stone_corral','corral',12,10,1.6);
 return{slots,R:28};},{R:28});

/* 4. 'waystation-oasis': warm spring basin, bath/shelter, corral or stilted plank walk (Mud-Kettle, Brazier, Brimstone, Lookout) */
builder('waystation-oasis',(S,X)=>{const P=X.place(0.8),ca=Math.cos(X.ry),sa=Math.sin(X.ry),off=S.setback==null?9:S.setback;
 const putAt=(lx,lz,dry,id,key,kind,role,w,d,h)=>{const b=X.dims(key,0),W=w==null?b.w:w,D=d==null?b.d:d,H=h==null?b.h:h;
  const wx=X.anchor.x+lx*ca+lz*sa,wz=X.anchor.z-lx*sa+lz*ca,wy=X.ground.H(wx,wz);
  const rec={id:S.id+'/'+id,key,v:0,kind,role,x:r2(wx),y:r2(wy),z:r2(wz),ry:r4(X.ry+dry),w:r2(W),d:r2(D),h:r2(H)};
  if(b.pending&&w==null)rec.pending=true;
  if(!P.put(rec))return null;return rec;};
 putAt(off,0,-Math.PI/2,'shelter',S.shelterKey||'xa_inn_small','building','waystation',8,6,4.5);
 putAt(-off,2,Math.PI/2,'basin',S.basinKey||'stone_trough_run','infrastructure',S.feature||'basin',6,2.4,1.2);
 if(S.shrine)putAt(-off-4,-5,0,'shrine',S.shrineKey||'split_horn_shrine','monument','shrine',3.2,3.2,4.6);
 if(S.corral!==false)putAt(off+10,-7,-Math.PI/2,'corral',S.corralKey||'stone_corral','pen','corral',11,9,1.5);
 return{slots:P.placed,R:26};},{R:26});

/* 5. 'tube-hall': underground Hall of the Tally-Marks inside a lava tube (cistern, wall ledges, torch brackets) */
builder('tube-hall',(S,X)=>{const ca=Math.cos(X.ry),sa=Math.sin(X.ry),tw=S.tubeW==null?18:S.tubeW,slots=[];
 const add=(lx,lz,ly,dry,id,key,kind,role,w,d,h,wall)=>{const wx=X.anchor.x+lx*ca+lz*sa,wz=X.anchor.z-lx*sa+lz*ca;
  const rec={id:S.id+'/'+id,key,v:0,kind,role,x:r2(wx),y:r2(X.anchor.y+ly),z:r2(wz),ry:r4(X.ry+dry),w:r2(w),d:r2(d),h:r2(h),pending:true};
  if(wall)rec.wall=true;slots.push(rec);};
 /* cut drip cistern in the hall floor, sleeping ledges along the basalt walls, and torch brackets at intervals */
 add(0,0,0,0,'cistern',S.cisternKey||'rock_cistern','infrastructure','cistern',4.5,4.5,1.3,false);
 add(-(tw*0.38),-4,0.4,Math.PI/2,'ledge_w','cut_ledge','furniture','sleeping-ledge',2.2,6.5,0.8,true);
 add(tw*0.38,-4,0.4,-Math.PI/2,'ledge_e','cut_ledge','furniture','sleeping-ledge',2.2,6.5,0.8,true);
 add(-(tw*0.42),5,1.8,Math.PI/2,'tally_wall','tally_wall_marks','monument','tally',0.5,8,2.4,true);
 const nb=S.brackets==null?4:S.brackets;
 for(let k=0;k<nb;k++){const side=k%2?1:-1,lz=-10+k*6.5;
  add(side*(tw*0.44),lz,2.1,-side*Math.PI/2,'torch_'+k,'torch_bracket','light','torch',0.4,0.4,0.7,true);}
 return{slots,R:Math.max(16,tw)};},{R:20});

/* 6. 'wreck-aftermath': ruined wagon / bore head / ambush aftermath seated for KRUINS.watch */
builder('wreck-aftermath',(S,X)=>{const ca=Math.cos(X.ry),sa=Math.sin(X.ry),slots=[];
 const add=(lx,lz,dry,id,key,role,w,d,h)=>{const wx=X.anchor.x+lx*ca+lz*sa,wz=X.anchor.z-lx*sa+lz*ca,wy=X.ground.H(wx,wz);
  slots.push({id:S.id+'/'+id,key,v:0,kind:'ruin',role,x:r2(wx),y:r2(wy),z:r2(wz),ry:r4(X.ry+dry),w:r2(w),d:r2(d),h:r2(h),ruin:true,pending:true});};
 add(0,0,X.unit(1)*0.6,'hull',S.hullKey||'wrecked_wagon','main-wreck',3.2,6.4,2.4);
 add(5.6,2.8,X.unit(2)*Math.PI,'debris_1',S.debrisKey||'broken_axle','wreck',1.6,2.2,0.8);
 add(-5.4,-2.6,X.unit(3)*Math.PI,'debris_2','scattered_bones','wreck',1.8,1.8,0.6);
 return{slots,R:14,ruin:true};},{R:14});

function resolveAnchor(S,o){const P=o.plan||null;
 /* 1. Tube arc-length placement (`tube` + `s`) */
 if(S.tube!=null){const tubes=(o.tubes&&o.tubes.tubes)||(P&&P.tubes&&P.tubes.tubes)||(Array.isArray(o.tubes)?o.tubes:null);
  if(!tubes||!tubes.length)return{uncut:{id:S.id,tube:S.tube,why:'no planned tubes in region yet'}};
  const T=tubes.find(t=>t.id===S.tube);
  if(!T||!T.st||T.st.length<2)return{uncut:{id:S.id,tube:S.tube,why:'tube '+S.tube+' is not in the cut'}};
  const s=S.s==null?0:S.s,q=alongPts(T.st,s);
  if(q.clamped&&s>q.total+10)return{uncut:{id:S.id,tube:S.tube,why:'s='+s+' m is past tube '+S.tube+' ('+Math.round(q.total)+' m)'}};
  if(!insideWorld(q.x,q.z,o))return{uncut:{id:S.id,tube:S.tube,why:'tube point lies outside the cut'}};
  let tw=16,th=12;
  if(T.sec){for(const sc of T.sec){tw=sc.w||tw;th=sc.h||th;break;}}
  return{x:q.x,y:q.y==null?groundH(q.x,q.z,o)-30:q.y,z:q.z,tx:q.tx,tz:q.tz,on:'tube',tube:{id:T.id,s:r2(s),ceiling:q.y!=null?r2(q.y+th):null,ground:q.ground!=null?r2(q.ground):r2(groundH(q.x,q.z,o))},tubeW:tw};}

 /* 2. Way / link arc-length placement (`way` + `s`) */
 if(S.way!=null){const Wlist=allWaysOf(P);
  const W=Wlist.find(w=>w.id===S.way||w.name===S.way||(w.id&&w.id.endsWith('/way/'+S.way)));
  if(!W){const uList=(P&&P.uncut)||[];
   if(uList.some(u=>u.id===S.way||(u.id&&u.id.endsWith('/way/'+S.way))))return{uncut:{id:S.id,way:S.way,why:'way '+S.way+' is outside the cut'}};
   return{error:S.id+': no way or link '+S.way};}
  const s=S.s==null?0:S.s,q=alongPts(W.pts,s);
  if(W.short&&s>q.total+10)return{uncut:{id:S.id,way:W.id,why:'way '+W.id+' ends short at '+Math.round(q.total)+' m before s='+s+' m'}};
  const side=S.sideOffset==null?0:S.sideOffset,nx=-q.tz,nz=q.tx,x=q.x+nx*side,z=q.z+nz*side;
  if(!insideWorld(x,z,o))return{uncut:{id:S.id,way:W.id,why:'outside the region\'s cut'}};
  const on=S.on||'ground',y=S.level!=null?S.level:(on==='water'?waterH(x,z,o):groundH(x,z,o));
  return{x,y,z,tx:q.tx,tz:q.tz,on,way:{id:W.id,s:r2(s),hw:W.hw==null?2:W.hw}};}

 /* 3. Site + near, px, or at */
 let x=0,z=0;
 if(S.site!=null){const sites=o.sites||(P&&P.sites)||[],st=sites.find(s=>s.id===S.site);
  if(!st)return{uncut:{id:S.id,site:S.site,why:'the cut has no site '+S.site+' yet'}};
  const nr=S.near||[0,0];x=st.x+nr[0];z=st.z+nr[1];}
 else if(S.px!=null){const q=fromPx(S.px[0],S.px[1],o);x=q[0];z=q[1];}
 else if(S.at!=null){x=S.at[0];z=S.at[1];}
 else return{error:S.id+': fixture needs at, px, site, way or tube'};

 if(!insideWorld(x,z,o))return{uncut:{id:S.id,site:S.site||null,why:'outside the region\'s cut'}};
 const on=S.on||'ground';
 /* optional `look` search around the target point for good dry ground when `on === 'ground'` */
 if(on==='ground'&&S.look&&S.look>0&&typeof KSITES!=='undefined'&&KSITES.siteFor){
  const R=S.R==null?(BUILDERS[S.kind]?BUILDERS[S.kind].R:20):S.R;
  const found=KSITES.siteFor(x,z,S.look,R,120);
  if(!found)return{error:S.id+': no good ground within '+S.look+' m'};
  x=found.x;z=found.z;}
 const y=S.level!=null?S.level:(on==='water'?waterH(x,z,o):groundH(x,z,o));
 return{x,y,z,tx:0,tz:1,on};}

function resolveYaw(S,A){
 if(typeof S.face==='number')return S.face;
 if(Array.isArray(S.face)&&S.face.length===2)return Math.atan2(S.face[0]-A.x,S.face[1]-A.z);
 if(S.face==='way'||S.face==null)return Math.atan2(A.tx==null?0:A.tx,A.tz==null?1:A.tz);
 return 0;}

function lay(S,seed,o){o=o||{};
 if(!S||!S.id)return{error:'fixture without id'};
 const B=BUILDERS[S.kind];
 if(!B)return{error:S.id+': no fixture builder '+S.kind+' (WFIX.builder: '+(registered().join(', ')||'none')+')'};
 let season=null;try{season=seasonOf(S);}catch(e){return{error:e.message||String(e)};}
 const A=resolveAnchor(S,o);
 if(A.uncut)return{uncut:A.uncut};
 if(A.error)return{error:A.error};
 const fseed=KRAND.child(seed==null?1:seed,'fix/'+(S.seed==null?S.id:S.seed));
 const ry=resolveYaw(S,A),R0=S.R==null?B.R:S.R;
 const specIn=A.tubeW&&S.tubeW==null?Object.assign({tubeW:A.tubeW},S):S;
 const X={id:S.id,kind:S.kind,spec:specIn,world:fseed,anchor:{x:r2(A.x),y:r2(A.y),z:r2(A.z)},ry,on:A.on,
  level:S.level!=null?S.level:(A.on==='water'?waterH(A.x,A.z,o):A.y),
  wayDir:[A.tx==null?0:A.tx,A.tz==null?1:A.tz],
  unit:(i,salt)=>KRAND.unit(KRAND.hash(fseed,i,salt==null?0:salt)),
  dims:(key,v)=>{const b=boxFor(key,v,o);return{w:b.D.w,d:b.D.d,h:b.D.h,pending:b.pending};},
  ground:{H:(x,z)=>groundH(x,z,o),ok:(x,z)=>groundOkAt(x,z,o)},
  place:gap=>placer(A.on,A,o,gap)};
 let built=null;
 try{built=B.fn(specIn,X);}catch(e){return{error:S.id+': '+(e&&e.message||e)};}
 if(!built||!Array.isArray(built.slots)||!built.slots.length)return{error:S.id+': builder '+S.kind+' produced no slots'};
 const fix={id:S.id,kind:S.kind,name:S.name||S.id,culture:S.culture||'generic',on:A.on,
  anchor:{x:r2(A.x),y:r2(A.y),z:r2(A.z)},ry:r4(built.ry==null?ry:built.ry),R:r2(built.R==null?R0:built.R),
  ruin:!!(S.ruin||built.ruin),slots:built.slots};
 if(season)fix.season=season;
 if(A.way)fix.way=A.way;
 if(A.tube)fix.tube=A.tube;
 if(S.mark!==false)fix.mark=S.mark||true;
 Object.keys(built).forEach(k=>{if(['slots','R','ry','ruin'].indexOf(k)<0)fix[k]=copy(built[k]);});
 return{fixture:fix,errors:[]};}

function plan(spec,o){o=o||{};const list=(spec&&spec.fixtures)||[],seed=spec&&spec.world!=null?spec.world:1;
 const fixtures=[],uncut=[],errors=[],seen={};
 for(const S of list){if(S&&S.id){if(seen[S.id]){errors.push('duplicate fixture id '+S.id);continue;}seen[S.id]=1;}
  const R=lay(S,seed,o);
  if(R.uncut)uncut.push(R.uncut);
  else if(R.error)errors.push(R.error);
  else if(R.fixture){fixtures.push(R.fixture);(R.errors||[]).forEach(e=>errors.push(e));}}
 return{fixtures,uncut,errors};}

function of(P){if(!P||(P.version!=null&&P.version<3&&!P.fixtures))return{fixtures:[],uncut:[]};
 return{fixtures:P.fixtures||[],uncut:(P.uncut||[]).filter(u=>u&&(u.tube!=null||u.way!=null||(P.fixtures||[]).length>0))};}

function check(P,opt){opt=opt||{};const problems=[],F=(P&&P.fixtures)||[];
 const counts={fixtures:F.length,slots:0},seen={};
 for(const fx of F){if(seen[fx.id])problems.push(fx.id+': duplicate fixture');seen[fx.id]=1;
  if(!insideWorld(fx.anchor.x,fx.anchor.z,opt))problems.push(fx.id+': anchor outside the region\'s cut');
  if(!fx.slots||!fx.slots.length){problems.push(fx.id+': no slots');continue;}
  counts.slots+=fx.slots.length;
  /* check anchor elevation against surface or tube */
  if(fx.on==='ground'){const g=groundH(fx.anchor.x,fx.anchor.z,opt);
   if(Math.abs(fx.anchor.y-g)>12)problems.push(fx.id+': anchor y '+fx.anchor.y+' is '+r2(Math.abs(fx.anchor.y-g))+' m off ground '+r2(g));}
  else if(fx.on==='tube'&&fx.tube){const g=fx.tube.ground!=null?fx.tube.ground:groundH(fx.anchor.x,fx.anchor.z,opt);
   if(fx.anchor.y>=g-1)problems.push(fx.id+': tube fixture floor '+fx.anchor.y+' is not underground (surface '+r2(g)+')');
   if(fx.tube.ceiling!=null&&fx.tube.ceiling>g-0.5)problems.push(fx.id+': tube roof '+fx.tube.ceiling+' breaches surface '+r2(g));}
  /* check slot overlaps & ground rules */
  let ov=0,off=0;
  const nonWall=fx.slots.filter(s=>!s.wall&&!s.ceiling);
  for(let i=0;i<nonWall.length;i++){const a=nonWall[i];
   for(let j=i+1;j<nonWall.length;j++)if(boxesOverlap(a,nonWall[j],0.05))ov++;
   if(fx.on==='ground'){if(!boxCorners(a,0).every(q=>(opt.groundOk||((x,z)=>groundOkAt(x,z,opt)))(q[0],q[1])))off++;
    const sg=groundH(a.x,a.z,opt);if(Math.abs(a.y-sg)>8)off++;}
   else if(fx.on==='water'){if(!(waterH(a.x,a.z,opt)>groundH(a.x,a.z,opt)-0.3))off++;}}
  if(ov)problems.push(fx.id+': '+ov+' overlapping slots');
  if(off)problems.push(fx.id+': '+off+' slots off valid '+fx.on);
  /* custom builder check if registered */
  const B=BUILDERS[fx.kind];if(B&&B.check){const ck=B.check(fx);if(ck&&!ck.ok)problems.push(fx.id+': '+(ck.detail||'builder check failed'));}}
 return{ok:!problems.length,problems,counts};}

return Object.assign(api,{VERSION:1,builder,registered,kitDims,boxCorners,boxesOverlap,seasonOf,inSeason,lay,plan,of,check});})();
