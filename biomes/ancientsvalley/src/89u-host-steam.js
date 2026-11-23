// ================================================================= HOST - the lake's steam (core/atmos: fogBank and smoke)
// [web] PLAN.md section 12, station 0's vision: "the lake's steam". The lake is brackish and warm over the drowned city (section 3: steam-
// shrouded), so banks of mist lie on the water (ATMOS.fogBank: broad low sprites) and thin columns of steam rise from it here and there
// (ATMOS.smoke, the 'steam' preset). The banks stand on the page's own water cells and on the model's water out to 7 km, so the inlets just
// past the page's edge and the far lake steam too; every pick is a hash of the cell (core/rand), never a draw count.
const AV_STEAM=(function(){const banks=[],plumes=[],R=STAGE.R,LY=STAGE.lakeY,seed=(STAGE.seed|0)+71;
 for(let x=-R;x<=R;x+=90)for(let z=-R;z<=R;z+=90){if(Math.hypot(x,z)>R)continue;if(STAGE.rawGround(x,z)>LY-1.5)continue;const h=KRAND.hash(seed,Math.round(x/90),Math.round(z/90),1);
  if(KRAND.unit(h)<.5)banks.push([x,LY,z]);if(KRAND.unit(KRAND.hash(h,2,0,0))<.1)plumes.push([x,LY+.3,z,'steam']);}
 for(let x=-7000;x<=7000;x+=360)for(let z=-7000;z<=7000;z+=360){const r=Math.hypot(x,z);if(r<=R||r>7000)continue;if(STAGE.modelY(x,z)>LY-2)continue;
  if(KRAND.unit(KRAND.hash(seed,Math.round(x/360),Math.round(z/360),3))<.6)banks.push([x,LY,z]);}
 const fog=banks.length?ATMOS.fogBank(banks):null,steam=plumes.length?ATMOS.smoke(plumes):null;
 if(banks.length)REGISTER({name:'the lake\'s steam',kind:'steam',x:0,z:0,r:R,h:12,tags:{kind:'steam',banks:banks.length,plumes:plumes.length}});
 return{banks:banks.length,plumes:plumes.length,fog,steam};})();
