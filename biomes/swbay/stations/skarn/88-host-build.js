// ================================================================= HOST — build (station 3, the skarn-marble cliffs)
// The order the bay's page follows (src/88): the host's works first (85: the visor, the cut blocks fill OBSTACLES
// and the registry), then the kit (SWBAY.build: its trees, floor and fauna by the fields of 45), then the trees the host puts on the
// ledges (85 ledgeTrees, SWBAY.treeAt), one bake, the impostors, the terrain's horizon shadows.
window._biome=null;
(function(){const t0=performance.now();
 try{buildQuarry();}catch(e){reportErr('quarry: '+e.stack);}
 try{window._biome=SWBAY.build({R:TERR.R-100,quality:1});}catch(e){reportErr('biome: '+e.stack);}
 try{window._ledgeTrees=ledgeTrees();}catch(e){reportErr('ledge trees: '+e.stack);}
 const b=BIO.bake();
 if(SWBAY.postBakeOwn)SWBAY.postBakeOwn(scene,terrainH);
 if(BIO.impostorLook)BIO.impostorLook({gain:+(Q.get('impgain')||2.2),wrap:+(Q.get('impwrap')||1)});   /* the bay page's measured gain (src/88) */
 if(BIO.bakeImpostors){try{BIO.bakeImpostors(renderer);}catch(e){reportErr('impostors: '+e.stack);}}
 if(SWBAY_LOOK.ground)BIO.setGround(MAT_GROUND.map,[TERR.X0,TERR.Z1,TERR.X1,TERR.Z0]);   /* R5: the floor cover's root colour (the paint spans TERR; a canvas's v runs z1..z0) */
 // THE TERRAIN'S HORIZON (core/terrain KHORIZON; ?horizon=0 off): the headland's and the crown's shadows over the cove at a low sun
 if(typeof KHORIZON!=='undefined'&&Q.get('horizon')!=='0'){try{const t1=performance.now();
  const HZ=KHORIZON.bake({box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1],n:256,h:terrainH,
   far:{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}});
  window._horizon={ms:Math.round(performance.now()-t1),n:HZ.n};KHORIZON.shade(MAT_GROUND,HZ);
  window._horizon.mats=KHORIZON.shadeScene(scene,HZ,{filter:m=>!(m.userData&&m.userData.farField)});}catch(e){reportErr('horizon: '+e.stack);}}
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The Almua skarn-marble cliffs, raised (showcase station 3)',x:CENTER[0],z:CENTER[1],y:UO-120,r:TERR.R*1.42,h:420});
 REGISTER({name:'The marble headland (contact-marble, a former sea cliff, quarried)',key:'land.headland',kind:'landform',...(()=>{const p=xzOf(900,-120);return{x:p[0],z:p[1]};})(),y:UO-45,r:260,h:160});
 REGISTER({name:'A raised sea stack (the old tide\'s notch at its foot)',key:'land.stack',kind:'landform',ground:true,x:STACK.x,z:STACK.z,y:STACK.base-2,r:STACK.r1+1,h:STACK.h+4});
 REGISTER({name:'The karst spring\'s outfall',key:'water.spring',kind:'water',x:SPRING.x,z:SPRING.z,y:Uat(SPRING.x,SPRING.z)-3,r:22,h:12});})();
