// ================================================================= SHUMARI HIGHLAND GROUND, ATMOSPHERE & FOOTPRINT SPACE AUDIT
// Registers the flat plateau sheet ground on KDRAWN (drawn-ground check), tunes crisp 1.06 atm highland haze,
// resets SM_DOMES on rebuilds, and verifies non-overlapping site footprints via KSPACE.

SM_SM6=qs.get('sm6')!=='0';
if(!SM_SM6){
 if(MAT.bronzeCast){MAT.bronzeCast.roughness=.42;MAT.bronzeCast.metalness=.68;}
 if(MAT.bronze){MAT.bronze.roughness=.36;MAT.bronze.metalness=.74;}
 if(MAT.brass){MAT.brass.roughness=.38;MAT.brass.metalness=.75;}
 if(MAT.gold){MAT.gold.roughness=.26;MAT.gold.metalness=.84;}
 if(MAT.tracery){MAT.tracery.roughness=.45;MAT.tracery.metalness=.50;}
 if(MAT.iron){MAT.iron.roughness=.52;MAT.iron.metalness=.55;}
 if(typeof svHwMat==='function'){const hw=svHwMat();hw.roughness=.32;hw.metalness=.85;}
}
SKY.dens=.88;
SKY.hour=qs.get('hour')?+qs.get('hour'):9.8;
scene.fog.density=.00068;
skyApply();

if(typeof KDRAWN!=='undefined'){
 KDRAWN.clear();
 KDRAWN.add(KDRAWN.grid({
  x0:-GROUND_SIZE*.5,
  z0:-GROUND_SIZE*.5,
  dx:GROUND_SIZE,
  dz:GROUND_SIZE,
  nx:1,
  nz:1,
  h:[0,0,0,0]
 }));
}

const smSpaceAudit=(function(){
 if(typeof KSPACE==='undefined')return {placed:0,clashes:0};
 const sp=KSPACE.create({cell:24});
 let placed=0,clashes=0;
 for(let i=0;i<SITES.length;i++){
  const s=SITES[i],d=DEFS[s.key];
  if(!d)continue;
  const rad=Math.min(d.w,d.d)*.45;
  if(sp.query(s.x,s.z,rad).length>0)clashes++;
  else{sp.insert(s,s.x,s.z,rad);placed++;}
 }
 return {placed,clashes};
})();
if(smSpaceAudit.clashes>0){
 reportErr('KSPACE site footprint clash count '+smSpaceAudit.clashes);
}

const smPrevBuildWorld=buildWorld;
buildWorld=function(){
 SM_DOMES.length=0;
 const w=smPrevBuildWorld();
 if(SM_SM6&&w&&!PLACE_DRY){
  const apB={},prevT=GTARGET;
  GTARGET=apB;
  resetCM();
  svNoWalk(()=>{
   for(let i=0;i<SITES.length;i++){
    const S=SITES[i],D=DEFS[S.key];
    if(!D)continue;
    const pw=D.w+2.8,pd=D.d+2.8;
    box('cobble',S.x,.003,S.z,pw,.015,pd,P('cobble'));
    box('paving',S.x,.007,S.z,D.w+1.1,.015,D.d+1.1,P('paving'));
    box('basalt',S.x,.004,S.z-pd*.5+.10,pw,.030,.20,P('basaltDark'));
    box('basalt',S.x-pw*.5+.10,.004,S.z,.20,.030,pd-.40,P('basaltDark'));
    box('basalt',S.x+pw*.5-.10,.004,S.z,.20,.030,pd-.40,P('basaltDark'));
    const gapW=Math.min(pw-.8,3.8),sideW=(pw-gapW)*.5;
    if(sideW>.25){
     box('basalt',S.x-(gapW*.5+sideW*.5),.004,S.z+pd*.5-.10,sideW,.030,.20,P('basaltDark'));
     box('basalt',S.x+(gapW*.5+sideW*.5),.004,S.z+pd*.5-.10,sideW,.030,.20,P('basaltDark'));
    }
   }
   for(let r=0;r<ROWS.length;r++){
    const R=ROWS[r],sz=R.z+R.d*.5+3.1,sw=R.w+4.0;
    box('cobble',0,.003,sz,sw,.016,3.2,P('cobble'));
    box('travertine',0,.007,sz,sw-.4,.015,.36,P('travShade'));
    box('basalt',0,.004,sz+1.52,sw,.032,.22,P('basaltDark'));
   }
  });
  GTARGET=prevT;
  flushBuckets(apB,w,true);
  if(window._build)window._build.tris=Math.round(GSTAT.tris);
 }
 return w;
};
