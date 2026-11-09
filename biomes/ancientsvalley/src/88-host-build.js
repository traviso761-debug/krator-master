// ================================================================= HOST — build (every station)
// [web] The order: the kits read in place under their masks (the stage's zones), each made feral by AV.feralKit (46) as it builds: the
// south-west lowlands' forest on the floor, the shelf and the parks, the north-west's trees mixed in; then one bake; then the taint's
// tint on what was baked. The metropolis kit's towers come after, on the first frame (70-av-city.js boots them when the library maps are in).
window._swlow=null;window._nwlow=null;
(function(){const t0=performance.now();const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 const adjust=(T,w)=>{for(let i=REG.length-1;i>=0&&i>=REG.length-400;i--){const r=REG[i];if(r.kind==='tree'&&r.x===T.x&&r.z===T.z){if(!w){REG.splice(i,1);break;}r.h=w.h;r.r=r.r*w.kx;break;}}};
 const masked=(f,fn)=>{const old=BIO.host.mask;BIO.host.mask=(x,z)=>Math.min(old(x,z),f(x,z));try{return fn();}finally{BIO.host.mask=old;}};
 const feral=AVQ_ON('feral')?(x,z)=>STAGE.F.feral(x,z):(x,z)=>0;
 /* the perches (the owner, 2026-11-09: overgrown like Midgar at the end of FF7): in the wild half every stump, broken tower and tower with its
    crown gone wants trees on its top (two to seven by the top's area, inside its rim, none on a tower leaning past 2.5 degrees); a wrapped tree
    within 160 m of one gives it up to two copies of itself, smaller (AV.feralKit's o.perch), registered as rooftrees */
 const TOPS=[];STAGE.plan.towers.forEach(t=>{if(!(t.state==='stump'||t.state==='broken'||t.state==='crown')||(t.lean||0)>2.5||STAGE.F.wild(t.x,t.z)<.5)return;const F=MP.FAMILY[t.family]||MP.DESIGNS[t.family];if(!F)return;
  let cut;try{cut=MP.ruin(F,t.state).top;}catch(e){return;}if(!(cut>6))return;   /* the record's top: the hero is cut there (70, avClipHero) */const fp=F.footprint||{},r=fp.r!=null?fp.r:Math.min(fp.w==null?40:fp.w,fp.d==null?40:fp.d)/2;
  TOPS.push({t,cut,r:Math.max(4,r-4),n:Math.max(2,Math.min(7,Math.round(r*r/180))),got:0});});
 const TOPIX=KSPACE.create({cell:200});TOPS.forEach(P=>TOPIX.insert(P,P.t.x,P.t.z,P.r));const tq=[];
 const perch=AVQ_ON('perch')?(T,h)=>{tq.length=0;TOPIX.query(T.x,T.z,160,tq);const out=[];for(const P of tq){if(P.got>=P.n||Math.hypot(P.t.x-T.x,P.t.z-T.z)>160)continue;
   while(P.got<P.n&&out.length<2){const h1=KRAND.hash(STAGE.seed+53,P.t.id|0,P.got,0),a=KRAND.unit(h1)*TAU,rr=Math.sqrt(KRAND.unit(KRAND.hash(h1,1,0,0)))*P.r;
    if(!P.got)REGISTER({name:"trees on a ruin's top",kind:'rooftree',x:P.t.x,z:P.t.z,y:P.t.y+P.cut,r:P.r+3,h:28,tags:{kind:'rooftree',family:P.t.family,state:P.t.state}});   /* one volume a top: the probe samples instanced cards sparsely, so a tree's own would read empty */
    out.push({x:P.t.x+Math.cos(a)*rr,y:P.t.y+P.cut+.2,z:P.t.z+Math.sin(a)*rr,yaw:KRAND.unit(KRAND.hash(h1,2,0,0))*TAU,k:Math.min(.35+.2*KRAND.unit(KRAND.hash(h1,3,0,0)),h>0?25/h:1)});P.got++;}   /* a roof tree a third to a half of its source, under 25 m */
   if(out.length>=2)break;}return out;}:null;
 const perched=(T,pc,h)=>{AV.FERAL.perchedH=Math.max(AV.FERAL.perchedH||0,h);};
 window.AV_TOPS=TOPS;   /* ?feral=0: the kits as they are (the species kept, nothing grown), to tell the wrap's faults from the kits' */
 if(typeof SWLOW!=='undefined'&&STAGE.swQ){AV.feralKit(SWLOW,{ground:terrainH,feral,allow:STAGE.swAllow?new Set(STAGE.swAllow):null,keep:new Set(STAGE.swKeep||[]),adjust,perch,perched,seed:STAGE.seed+31});
  try{window._swlow=masked((x,z)=>clamp(STAGE.zone(x,z).sw,0,1),()=>SWLOW.build({R:STAGE.R-60,quality:q*STAGE.swQ,avenues:[]}));}catch(e){reportErr('swlowlands: '+e.stack);}}
 _mark('swlowlands');
 if(typeof NWLOW!=='undefined'&&STAGE.nwQ){AV.feralKit(NWLOW,{ground:terrainH,feral,allow:STAGE.nwAllow?new Set(STAGE.nwAllow):null,adjust,perch,perched,seed:STAGE.seed+37});
  try{window._nwlow=masked((x,z)=>clamp(STAGE.zone(x,z).nw,0,1),()=>NWLOW.build({R:STAGE.R-60,quality:q*STAGE.nwQ,avenues:[]}));}catch(e){reportErr('nwlowlands: '+e.stack);}}
 _mark('nwlowlands');
 if(Q.has('nobake')){window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();_mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;
 if(AVQ_ON('tint'))window._tinted=AV.tint(scene,{strength:1});_mark('tint');
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:STAGE.R,h:600});
})();
