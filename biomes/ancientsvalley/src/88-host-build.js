// ================================================================= HOST — build (every station)
// [web] The order: the kits read in place under their masks (the stage's zones), each made feral by AV.feralKit (46) as it builds: the
// south-west lowlands' forest on the floor, the shelf and the parks, the north-west's trees mixed in; then one bake; then the taint's
// tint on what was baked. The metropolis kit's towers come after, on the first frame (70-av-city.js boots them when the library maps are in).
window._swlow=null;window._nwlow=null;
(function(){const t0=performance.now();const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 const adjust=(T,w)=>{for(let i=REG.length-1;i>=0&&i>=REG.length-400;i--){const r=REG[i];if(r.kind==='tree'&&r.x===T.x&&r.z===T.z){if(!w){REG.splice(i,1);break;}r.h=w.h;r.r=r.r*w.kx;break;}}};
 const masked=(f,fn)=>{const old=BIO.host.mask;BIO.host.mask=(x,z)=>Math.min(old(x,z),f(x,z));try{return fn();}finally{BIO.host.mask=old;}};
 const feral=AVQ_ON('feral')?(x,z)=>STAGE.F.feral(x,z):(x,z)=>0;   /* ?feral=0: the kits as they are (the species kept, nothing grown), to tell the wrap's faults from the kits' */
 if(typeof SWLOW!=='undefined'&&STAGE.swQ){AV.feralKit(SWLOW,{ground:terrainH,feral,allow:STAGE.swAllow?new Set(STAGE.swAllow):null,keep:new Set(STAGE.swKeep||[]),adjust,seed:STAGE.seed+31});
  try{window._swlow=masked((x,z)=>clamp(STAGE.zone(x,z).sw,0,1),()=>SWLOW.build({R:STAGE.R-60,quality:q*STAGE.swQ,avenues:[]}));}catch(e){reportErr('swlowlands: '+e.stack);}}
 _mark('swlowlands');
 if(typeof NWLOW!=='undefined'&&STAGE.nwQ){AV.feralKit(NWLOW,{ground:terrainH,feral,allow:STAGE.nwAllow?new Set(STAGE.nwAllow):null,adjust,seed:STAGE.seed+37});
  try{window._nwlow=masked((x,z)=>clamp(STAGE.zone(x,z).nw,0,1),()=>NWLOW.build({R:STAGE.R-60,quality:q*STAGE.nwQ,avenues:[]}));}catch(e){reportErr('nwlowlands: '+e.stack);}}
 _mark('nwlowlands');
 if(Q.has('nobake')){window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();_mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;
 if(AVQ_ON('tint'))window._tinted=AV.tint(scene,{strength:1});_mark('tint');
 window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:STAGE.R,h:600});
})();
