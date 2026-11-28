// ================================================================= SHUMAR HIGHLAND FLORA BAND: HOST BINDING (Phase SM4)
// Reads biomes/shighlands Station 4 (shumar: 62-biome-shigh-shumar.js) in place via BIO_BAND in build.py.
// Dresses a dedicated highland flora strip north of the last row (and around the farm row), kept clear of all building
// footprints via SM_FLORA.mask, and records every tree in both KTAGS (SM_FLORA.tags) and KSPACE (SM_FLORA.space).

const SM_FLORA=(function(){
 if(typeof BIO==='undefined'||!ROWS.length)return null;
 const last=ROWS[ROWS.length-1];
 const halfW=Math.max(88,last.w*.5+20);
 const x0=-halfW,x1=halfW;
 const z0=last.z-last.d*.5-42;
 const z1=last.z+last.d*.5+6;
 const zMid=last.z-last.d*.5-20;
 const R=Math.ceil(Math.hypot(Math.max(-x0,x1),Math.max(Math.abs(z0),Math.abs(z1))))+18;
 const keep=SITES.map(s=>{
  const d=DEFS[s.key];
  const pad=2.6;
  return [s.x-d.w*.5-pad,s.z-d.d*.5-pad,s.x+d.w*.5+pad,s.z+d.d*.5+pad];
 });
 const mask=(x,z)=>{
  if(x<x0||x>x1||z<z0||z>z1)return 0;
  for(let i=0;i<keep.length;i++){
   const b=keep[i];
   if(x>b[0]&&x<b[2]&&z>b[1]&&z<b[3])return 0;
  }
  return 1;
 };
 const tags=(typeof KTAGS!=='undefined'&&KTAGS.VOCAB)?KTAGS.create({build:'shumari-flora'}):null;
 const space=typeof KSPACE!=='undefined'?KSPACE.create({cell:16}):null;
 const regs=[];
 return {
  row:last,
  box:[x0,z0,x1,z1],
  zMid,
  R,
  mask,
  tags,
  space,
  regs,
  seed:KRAND.hash(0x5b41,8500)
 };
})();

function smFloraZoneAt(x,z){
 if(!SM_FLORA)return {bench:1,terrace:0,shelf:0,rim:0,seep:0,rock:0,slope:.08,north:.2,wet:.25,fog:0};
 const u=(x-SM_FLORA.box[0])/Math.max(1,SM_FLORA.box[2]-SM_FLORA.box[0]);
 const n=KRAND.fbm(x*.032+4.1,z*.032-1.7,0,2,8511)-.5;
 const w=clamp(u+n*.14,0,1);
 const terrace=clamp(1-Math.abs(w-.14)/.22,0,1);
 const seep=clamp(1-Math.abs(w-.08)/.15,0,1)*.65;
 const shelf=clamp(1-Math.abs(w-.38)/.24,0,1);
 const bench=clamp(1-Math.abs(w-.64)/.28,0,1);
 const rim=clamp(1-Math.abs(w-.88)/.24,0,1);
 const rock=rim*.52+shelf*.18;
 return {
  bench:Math.max(.18,bench),
  terrace,
  shelf,
  rim,
  seep,
  rock,
  slope:.08+rim*.16,
  north:.22,
  wet:.18+terrace*.38+seep*.32,
  fog:0
 };
}

const smFloraFields={
 bench:(x,z)=>smFloraZoneAt(x,z).bench,
 terrace:(x,z)=>smFloraZoneAt(x,z).terrace,
 shelf:(x,z)=>smFloraZoneAt(x,z).shelf,
 rim:(x,z)=>smFloraZoneAt(x,z).rim,
 seep:(x,z)=>smFloraZoneAt(x,z).seep,
 rock:(x,z)=>smFloraZoneAt(x,z).rock,
 slope:(x,z)=>smFloraZoneAt(x,z).slope,
 north:(x,z)=>smFloraZoneAt(x,z).north,
 wet:(x,z)=>smFloraZoneAt(x,z).wet,
 fog:(x,z)=>0,
 flow:(x,z)=>smFloraZoneAt(x,z).terrace*.5,
 oasis:(x,z)=>0,
 canyon:(x,z)=>smFloraZoneAt(x,z).terrace*.6,
 cold:(x,z)=>.35
};

if(SM_FLORA){
 BIO.init({
  THREE:THREE,
  scene:scene,
  terrainH:(x,z)=>0,
  waterH:(x,z)=>-1e9,
  mask:SM_FLORA.mask,
  obstacles:[],
  fields:smFloraFields,
  ticks:fn=>FRAME_HOOKS.push((dt,now)=>fn(dt,now/1000)),
  seed:SM_FLORA.seed,
  origin:[[-60,SM_FLORA.zMid],[0,SM_FLORA.zMid],[60,SM_FLORA.zMid]],
  center:[0,SM_FLORA.zMid],
  tags:SM_FLORA.tags,
  register:o=>{
   SM_FLORA.regs.push(o);
   if(SM_FLORA.space)SM_FLORA.space.insert(o,o.x,o.z,o.r==null?1.5:o.r);
  },
  err:m=>reportErr('flora '+m),
  eye:()=>[camera.position.x,camera.position.y,camera.position.z],
  lod:{hero:750,mid:1200,far:SM_FLORA.R*1.4,floor:[750,1150]}
 });
}
