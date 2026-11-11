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
 /* a warped read-in tree's registered volume: centred between its foot and its leaned top, as tall as it now is, as wide as it now leans */
 const adjust=(T,w)=>{for(let i=REG.length-1;i>=0&&i>=REG.length-400;i--){const r=REG[i];if(r.kind==='tree'&&r.x===T.x&&r.z===T.z){if(!w){REG.splice(i,1);break;}r.x=T.x+w.dx/2;r.z=T.z+w.dz/2;r.h=w.h;r.r=r.r*w.kx+Math.hypot(w.dx,w.dz)/2;break;}}};
 const masked=(f,fn)=>{const old=BIO.host.mask;BIO.host.mask=(x,z)=>Math.min(old(x,z),f(x,z));try{return fn();}finally{BIO.host.mask=old;}};
 if(typeof NWLOW!=='undefined'&&STAGE.nwQ){CUT.warpKit(NWLOW,{ground:terrainH,toBowl:STAGE.toBowl,alt:STAGE.alt,allow:new Set(STAGE.nwAllow),adjust});
  try{window._nwlow=masked((x,z)=>clamp(STAGE.zone(x,z).nw,0,1),()=>NWLOW.build({R:STAGE.R-60,quality:q*STAGE.nwQ,avenues:[]}));}catch(e){reportErr('nwlowlands: '+e.stack);}}
 _mark('nwlowlands');
 if(typeof NHL!=='undefined'&&STAGE.nhlQ){CUT.warpKit(NHL,{ground:terrainH,toBowl:STAGE.toBowl,alt:STAGE.alt,allow:STAGE.nhlAllow?new Set(STAGE.nhlAllow):STAGE.nhlDeny?new Set(NHL.SPECIES.map(S=>S.key).filter(k=>STAGE.nhlDeny.indexOf(k)<0)):null,adjust,
   allowAt:STAGE.nhlAllowAt||null,stuck:STAGE.nhlStuck||null});   /* the exchanges (PLAN.md section 12: 5 the rowan, 6 the great trumpet; pair 10) */
  try{window._nhl=masked((x,z)=>clamp(STAGE.zone(x,z).nhl||0,0,1),()=>NHL.build(Object.assign({R:STAGE.R-60,quality:q*STAGE.nhlQ},STAGE.nhlOpt||{})));}catch(e){reportErr('nhighlands: '+e.stack);}}
 _mark('nhighlands');
 if(Q.has('nobake')){window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();_mark('bake');window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 /* THE TERRAIN'S HORIZON (core/terrain KHORIZON; the final rebuild, pair 10; ?horizon=0 off): baked over the page's square and, beyond it, over the whole
    bowl (CUT.bowl.h on a coarse grid out to 70 km, the rays reaching as far), so at a low sun the walls' shadow crosses the floor and the lip's crest
    shades the face; on the ground and every lit material on the land, not the far bowl (which draws its own light) */
 if(typeof KHORIZON!=='undefined'&&Q.get('horizon')!=='0'){try{const t1=performance.now(),S=TERR.R*1.1,FR=STAGE.horizonReach==null?70000:STAGE.horizonReach;
   const HZ=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,reach:FR,far:{h:(x,z)=>{const bb=STAGE.toBowl(x,z);return CUT.bowl.h(bb[0],bb[1])-STAGE.yRef;},box:[-FR,-FR,FR,FR],n:240}});
   /* ?horizon=ground or ?horizon=scene: one half only (a look comparison; KNOWN_ISSUES.md, the face's crest) */
   /* a station may keep its ground out (STAGE.horizon 'scene': the face, whose ground went near black under it in software GL while the bake reads
      sky .93 there; KNOWN_ISSUES.md); ?horizon=ground|scene|all overrides */
   const only=Q.get('horizon')||STAGE.horizon||'all';if(only!=='scene')KHORIZON.shade(GROUND.mat,HZ);
   window._horizon={ms:Math.round(performance.now()-t1),n:HZ.n,mats:only==='ground'?0:KHORIZON.shadeScene(scene,HZ,{filter:m=>!(m.userData&&m.userData.farField)&&m.material!==GROUND.mat})};}catch(e){reportErr('horizon: '+e.stack);}}
 _mark('horizon');
 REGISTER({name:STAGE.name+' (a piece of it)',x:0,z:0,r:STAGE.R,h:600});
})();
