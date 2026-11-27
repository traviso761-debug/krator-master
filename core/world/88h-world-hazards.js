// ================================================================= OPEN WORLD — hazards drawn & wired: ambient fields, tells, minimap and inspector
// [web] openworld/catch-bowl/PLAN-HAZARDS.md section 5 & 6 (2026-11-25). Reads planned hazards from WORLD_DATA.sites
// (or plans SITE_SPEC.hazards at load when the bake predates version 3), registers every record in core/tags
// (build '<region>:hazards') BEFORE drawing, wires core/hazard's ambient providers (`pressure` from WORLD.pressure,
// `temperature` from WORLD.at().temp + diurnal cycle, `dust`/`alkali`/`visibility` when ATMOS.airLoad or WORLD_CONFIG.hazards
// provides them), binds KHAZ.bindClock and KHAZ.bindWind, draws visible tells (crust sheen, gas/heat rings, storm walls —
// NEVER drawing or listing `kind === 'hunter'` Stalkers before triggered!), adds a minimap overlay to window.MAP_LAYERS, and
// extends 90-world-camera.js's `#insp` readout.
var HAZARDS_DRAW;LATE.push(()=>{HAZARDS_DRAW=(function(){'use strict';
if(typeof KHAZ==='undefined'||typeof KTAGS==='undefined')return null;
const scene=HOST.scene,camera=HOST.camera,t0=performance.now();
const PLAN=WORLD_DATA.sites||{sites:[],errors:[]};
const region=((WORLD_DATA.meta&&WORLD_DATA.meta.cut&&WORLD_DATA.meta.cut.region)||PLAN.region||'region');
const TAGS=KTAGS.create({build:region+':hazards'});
const S={hazards:0,ways:0,drawn:0,provided:[],uncut:[],errors:[],from:'none',ms:0};

/* 1. Resolve hazard plan from baked sites.json (version >= 3) or plan at load from SITE_SPEC */
let HPLAN={hazards:[],ways:[],uncut:[],errors:[]};
if(typeof WHAZ!=='undefined'){
 if(PLAN.version>=3&&(PLAN.hazards||PLAN.hazardWays)){const O=WHAZ.of(PLAN);HPLAN={hazards:O.hazards,ways:O.ways,uncut:O.uncut,errors:[]};S.from='the baked plan';}
 else if(typeof SITE_SPEC!=='undefined'&&SITE_SPEC&&SITE_SPEC.hazards){HPLAN=WHAZ.plan(SITE_SPEC,{sites:PLAN.sites,plan:PLAN});S.from='planned at load';}}
S.hazards=HPLAN.hazards.length;S.ways=HPLAN.ways.length;
S.uncut=HPLAN.uncut.map(u=>u.id+': '+u.why);S.errors=HPLAN.errors.slice();

/* 2. Register every hazard record in core/tags BEFORE drawing; map logical crust IDs to KTAGS record IDs for KHAZ.under */
const idMap={},TAG_RECS=[];
const CULT=c=>KTAGS.VOCAB.cultures.indexOf(c)>=0?c:'generic';
/* first pass: everything except under-records so crusts get their KTAGS IDs first */
for(const r of HPLAN.hazards){if(r.hazard&&r.hazard.under)continue;
 try{const h=KHAZ.make(r.hazard);
  const tr=TAGS.add({class:'landmark',kind:'hazard',key:r.id,name:r.name||r.id,at:r.at.slice(),ry:r.ry==null?0:r.ry,
   r:r.r==null?undefined:r.r,h:r.h==null?undefined:r.h,size:r.size?r.size.slice():undefined,
   tags:{culture:CULT(r.culture),types:['natural'],hazard:h,taboo:r.taboo||undefined}});
  idMap[r.id]=tr.id;TAG_RECS.push({plan:r,tag:tr});}
 catch(e){S.errors.push(r.id+': '+(e&&e.message||e));}}
/* second pass: under-records linked to their crust's registered KTAGS id */
for(const r of HPLAN.hazards){if(!(r.hazard&&r.hazard.under))continue;
 try{const raw=JSON.parse(JSON.stringify(r.hazard)),cid=idMap[raw.under.crust]||raw.under.crust;
  raw.under.crust=cid;
  const tr=TAGS.add({class:'landmark',kind:'hazard',key:r.id,name:r.name||r.id,at:r.at.slice(),ry:r.ry==null?0:r.ry,
   r:r.r==null?undefined:r.r,h:r.h==null?undefined:r.h,size:r.size?r.size.slice():undefined,
   tags:{culture:CULT(r.culture),types:['natural'],hazard:raw}});
  idMap[r.id]=tr.id;TAG_RECS.push({plan:r,tag:tr});}
 catch(e){S.errors.push(r.id+': '+(e&&e.message||e));}}

/* 3. Ambient providers & clock/wind bindings (PLAN-HAZARDS.md section 4) */
const CFG=(typeof WORLD_CONFIG!=='undefined'&&WORLD_CONFIG&&WORLD_CONFIG.hazards)||{};
const clockObj=(typeof HOST!=='undefined'&&HOST.clock)||(typeof ATMOS!=='undefined'&&ATMOS.clock)||null;
if(KHAZ.bindClock){
 if(clockObj)KHAZ.bindClock(clockObj);
 else KHAZ.bindClock(()=>12);}
if(KHAZ.bindWind){
 if(typeof ATMOS!=='undefined'&&ATMOS&&typeof ATMOS.windAt==='function')KHAZ.bindWind((x,z,t)=>ATMOS.windAt(t,x,z));
 else if(CFG.wind)KHAZ.bindWind(CFG.wind);}

if(KHAZ.provide){
 if(typeof WORLD!=='undefined'&&WORLD&&typeof WORLD.pressure==='function'&&CFG.pressure!==false){
  KHAZ.provide('pressure',(x,y,z)=>{const h=y==null?WORLD.H(x,z):y;return WORLD.pressure(h);});
  S.provided.push('pressure');}
 if(typeof WORLD!=='undefined'&&WORLD&&typeof WORLD.at==='function'&&CFG.temperature!==false){
  const swing=CFG.diurnalSwing==null?7:CFG.diurnalSwing;
  KHAZ.provide('temperature',(x,y,z)=>{const A=WORLD.at(x,z),base=A&&A.temp!=null?A.temp:15;
   const hr=clockObj&&clockObj.hour!=null?clockObj.hour:14;
   const diur=-Math.cos((hr-3)/24*Math.PI*2)*swing*(A&&A.wet>0.5?0.55:1);
   const agl=y==null?0:Math.max(0,y-A.h);
   return base+diur-agl*0.0065;});
  S.provided.push('temperature');}
 /* optional region-supplied visibility / dust / alkali overrides when ATMOS.airLoad is not already providing them */
 ['dust','ash','alkali','visibility'].forEach(k=>{
  if(typeof CFG[k]==='function'){KHAZ.provide(k,CFG[k]);if(S.provided.indexOf(k)<0)S.provided.push(k);}});}

/* 4. Visual tells near the camera — strictly excluding `hunter` (Stalkers have no tell until triggered) */
const GRP=new THREE.Group();GRP.name='world hazards';scene.add(GRP);
const FULL=2500,ringG=new THREE.RingGeometry(0.88,1,32).rotateX(-Math.PI/2),discG=new THREE.CircleGeometry(1,24).rotateX(-Math.PI/2);
const TELLS=[];
for(const E of TAG_RECS){const r=E.plan,h=E.tag.tags.hazard;
 if(r.kind==='hunter'||(h&&h.under))continue;
 const tl=(h&&h.tell)||{},colStr=tl.colour||'#d86830';
 if(!tl.fx&&!tl.sign&&r.hazard&&r.hazard.stateFn!=='KHAZ.crust')continue;
 const sh=KHAZ.shape(E.tag)||{type:'cyl',r:12},rad=sh.r!=null?sh.r:(sh.w!=null?Math.max(sh.w,sh.d==null?sh.w:sh.d)/2:12);
 const isCrust=r.hazard&&r.hazard.stateFn==='KHAZ.crust';
 const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(colStr).convertSRGBToLinear(),transparent:true,opacity:isCrust?0.22:0.18,depthWrite:false,side:THREE.DoubleSide});
 const mesh=new THREE.Mesh(isCrust?discG:ringG,mat);
 mesh.position.set(r.at[0],WORLD.H(r.at[0],r.at[2])+0.18,r.at[2]);
 mesh.scale.set(rad,1,rad);mesh.visible=false;mesh.name='hazard tell '+r.id;mesh.userData.probeSkip=true;
 GRP.add(mesh);TELLS.push({mesh,x:r.at[0],z:r.at[2],r:rad,season:r.season});S.drawn++;}

/* 5. Minimap layer (`window.MAP_LAYERS`, runs before 90-world-camera.js builds `#ov`) — NEVER shows `hunter` */
if(typeof WORLD_DATA!=='undefined'&&WORLD_DATA.meta&&WORLD_DATA.meta.frame){
 const M=WORLD_DATA.meta,B=M.frame.box_px,W=B[2]-B[0],Hh=B[3]-B[1];
 let ras=null;
 const buildRas=()=>{if(ras)return ras;ras=new Uint8Array(W*Hh*3);
  const visRecs=HPLAN.hazards.filter(r=>r.kind!=='hunter');
  for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const k=(j*W+i)*3,[x,z]=WORLD.fromPx(B[0]+i+0.5,B[1]+j+0.5);
   if(!WORLD.inside(x,z)){ras[k]=20;ras[k+1]=20;ras[k+2]=22;continue;}
   const h=WORLD.H(x,z),p=WORLD.pressure?WORLD.pressure(h):1,A=WORLD.at(x,z),tm=A&&A.temp!=null?A.temp:15;
   let cr=46,cg=52,cb=48;
   if(p<0.6){const u=Math.min(1,(0.6-p)/0.45);cr=Math.round(50+120*u);cg=Math.round(70+110*u);cb=Math.round(130+120*u);}
   else if(tm>32){const u=Math.min(1,(tm-32)/18);cr=Math.round(90+155*u);cg=Math.round(60+45*u);cb=35;}
   else if(tm<0){const u=Math.min(1,-tm/28);cr=Math.round(55+60*u);cg=Math.round(95+110*u);cb=Math.round(135+110*u);}
   ras[k]=cr;ras[k+1]=cg;ras[k+2]=cb;}
  for(const r of visRecs){const px=Math.floor(WORLD.px(r.at[0])-B[0]),py=Math.floor(WORLD.py(r.at[2])-B[1]);
   if(px>=0&&px<W&&py>=0&&py<Hh){const k=(py*W+px)*3;ras[k]=255;ras[k+1]=180;ras[k+2]=60;}}
  return ras;};
 window.MAP_LAYERS=(window.MAP_LAYERS||[]).concat([{
  label:'hazards: air, temp & traps',
  color:k=>{const R=buildRas();return[R[k*3],R[k*3+1],R[k*3+2]];},
  legend:'<b>Hazards</b> · <span style="color:#a8c8ff">■</span> thin air (&lt;0.6 atm) · <span style="color:#f56828">■</span> extreme heat · <span style="color:#78c8f5">■</span> extreme cold · <span style="color:#ffb43c">■</span> known traps &amp; crusts'}]);}

/* 6. Frame update & inspector hook (appends live hazard state at cursor, hiding untriggered `hunter` records) */
const nowT=()=>clockObj&&clockObj.t!=null?clockObj.t:performance.now()*0.001;
const nowYD=()=>{const d=clockObj&&clockObj.day!=null?clockObj.day:0;return typeof WHAZ!=='undefined'?WHAZ.yearDay(d):259;};
if(HOST.loop)HOST.loop.push(()=>{const P=camera.position,yd=nowYD();
 for(const T of TELLS){const inS=!T.season||(typeof WHAZ!=='undefined'&&WHAZ.inSeason({season:T.season},yd));
  T.mesh.visible=inS&&Math.hypot(P.x-T.x,P.z-T.z)<FULL+T.r;}});

addEventListener('mousemove',()=>{const el=document.getElementById('insp');
 if(!el||el.style.display==='none'||!CAM||!CAM.st||!CAM.st.insp)return;
 const txt=el.textContent||'';if(!txt||txt==='inspector: the sky'||txt.indexOf('\nhazard · ')>=0)return;
 const m=/at x (-?\d+) z (-?\d+)/.exec(txt);if(!m)return;
 const x=+m[1],z=+m[2],y=WORLD.H(x,z)+1.2,t=nowT();
 const H=KHAZ.here?KHAZ.here(x,y,z,t,TAGS):null;if(!H)return;
 const visRecs=(H.records||[]).filter(e=>e.kind!=='hunter'||(e.state&&e.state.on&&!e.state.hidden));
 const parts=visRecs.map(e=>e.kind+' ('+e.state.state+', dose '+Math.round(e.dose*100)/100+'/s)')
  .concat((H.ambient||[]).map(a=>a.kind+' (dose '+Math.round(a.dose*100)/100+'/s)'));
 const sightStr=H.sight!=null&&H.sight<20000?' · sight '+Math.round(H.sight)+' m':'';
 if(parts.length||sightStr)el.textContent=txt+'\nhazard · '+(parts.join(', ')||'clear')+sightStr;});

S.ms=Math.round(performance.now()-t0);
function checks(){const C=typeof WHAZ!=='undefined'?WHAZ.check({sites:PLAN.sites,links:PLAN.links,ways:PLAN.ways,hazards:HPLAN.hazards,hazardWays:HPLAN.ways}):{ok:true,problems:[],counts:{}};
 const audit=TAGS.audit();
 return{ok:C.ok&&!S.errors.length&&audit.ok,plan:C,tags:audit,errors:S.errors.slice(),provided:S.provided.slice()};}
const api={plan:HPLAN,stats:()=>Object.assign({},S),checks,tags:()=>TAGS.audit(),here:(x,y,z,t)=>KHAZ.here(x,y,z,t==null?nowT():t,TAGS),registry:TAGS};
window._hazards=api;return api;})();});
