// ================================================================= SHUMARI HIGHLAND GROUND, ATMOSPHERE & FOOTPRINT SPACE AUDIT
// Registers the flat plateau sheet ground on KDRAWN (drawn-ground check), tunes crisp 1.06 atm highland haze,
// resets SM_DOMES on rebuilds, and verifies non-overlapping site footprints via KSPACE.

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
 return smPrevBuildWorld();
};
