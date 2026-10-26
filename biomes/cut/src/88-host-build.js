// ================================================================= HOST — build (every station)
// [web] The order: the kit's own natives first (the groves, the camp: their footprints become obstacles), then the kits
// read in place under their masks, each warped by CUT.warpKit (46) as it builds: nwlowlands on the shore, the creek and the
// walls; nhighlands on the lip (station 3); then one bake.
window._biome=null;window._cut=null;window._nwlow=null;window._nhl=null;
(function(){const t0=performance.now();const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 const env={R:STAGE.R-60,q:q*(STAGE.cutQ==null?1:STAGE.cutQ),spine:STAGE.spine,ground:terrainH,groundY:GROUND.meshH,toBowl:STAGE.toBowl,alt:STAGE.alt,zone:STAGE.zone,
  clear:(x,z,r)=>BIO.clearOf(x,z,r)&&terrainH(x,z)>WATER_LEVEL-1.2,camp:STAGE.camp||null,groves:STAGE.groves!==false,reeds:STAGE.reeds!==false,rank:STAGE.rank!==false,
  melons:STAGE.melons||null,lichen:STAGE.lichen||null,reedR:STAGE.reedR,rankR:STAGE.rankR,groveRange:STAGE.groveRange};
 try{window._cut=window._biome=CUT.build(env);}catch(e){reportErr('cut: '+e.stack);}
 (CUT.PLANTS?CUT.PLANTS.groves:[]).forEach(G=>OBSTACLES.push({x:G.x,z:G.z,r:G.r+3,y0:G.culms[0].y-2,y1:G.culms[0].y+G.L*28}));
 if(CUT.CAMP)OBSTACLES.push({x:CUT.CAMP.x,z:CUT.CAMP.z,r:CUT.CAMP.r,y0:CUT.CAMP.y-2,y1:CUT.CAMP.y+10});
 _mark('cut');
 const masked=(f,fn)=>{const old=BIO.host.mask;BIO.host.mask=(x,z)=>Math.min(old(x,z),f(x,z));try{return fn();}finally{BIO.host.mask=old;}};
 if(typeof NWLOW!=='undefined'&&STAGE.nwQ){CUT.warpKit(NWLOW,{ground:terrainH,toBowl:STAGE.toBowl,alt:STAGE.alt,allow:new Set(STAGE.nwAllow)});
  try{window._nwlow=masked((x,z)=>clamp(STAGE.zone(x,z).nw,0,1),()=>NWLOW.build({R:STAGE.R-60,quality:q*STAGE.nwQ,avenues:[]}));}catch(e){reportErr('nwlowlands: '+e.stack);}}
 _mark('nwlowlands');
 if(typeof NHL!=='undefined'&&STAGE.nhlQ){CUT.warpKit(NHL,{ground:terrainH,toBowl:STAGE.toBowl,alt:STAGE.alt,allow:STAGE.nhlAllow?new Set(STAGE.nhlAllow):null});
  try{window._nhl=masked((x,z)=>clamp(STAGE.zone(x,z).nhl||0,0,1),()=>NHL.build(Object.assign({R:STAGE.R-60,quality:q*STAGE.nhlQ},STAGE.nhlOpt||{})));}catch(e){reportErr('nhighlands: '+e.stack);}}
 _mark('nhighlands');
 if(Q.has('nobake')){window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();_mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:STAGE.R,h:600});
})();
