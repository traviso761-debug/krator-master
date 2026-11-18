// ================================================================= HOST — the Deep's steam (station 2; core/atmos particles: ATMOS.smoke's `steam`, ATMOS.fogBank)
// The brine is ~60 degC under +36 degC air at 2.2 atm and 72% humidity: it steams, faintly, thickest over the vent (KTHERM's field, 48). Thin columns
// rise from the water where the heat is over SITE.steam.hot (ATMOS.smoke, the `steam` preset), and in foggy weather banks lie on it (ATMOS.fogBank: its
// alpha is the weather's fog). Each pick is a hash of the lattice cell (core/rand), never a draw count. A site without `steam` draws none (station 1:
// KNOWN_ISSUES.md keeps its haze owed).
const GALV_STEAM=SITE.steam&&DP?(function(){const S=SITE.steam,cell=S.cell==null?70:S.cell,R=DP.r*.94,banks=[],plumes=[],seed=4406;
 for(let x=DP.x-R;x<=DP.x+R;x+=cell)for(let z=DP.z-R;z<=DP.z+R;z+=cell){if(Math.hypot(x-DP.x,z-DP.z)>R)continue;
  const i=Math.round(x/cell),j=Math.round(z/cell),h=KRAND.hash(seed,i,j,1),ux=KRAND.unit(KRAND.hash(h,1,0,0)),uz=KRAND.unit(KRAND.hash(h,2,0,0));
  const px=x+(ux-.5)*cell*.8,pz=z+(uz-.5)*cell*.8,T=HEAT_AT(px,pz);if(T<S.hot)continue;
  if(KRAND.unit(h)<.6)banks.push([px,SEA_LEVEL,pz]);if(KRAND.unit(KRAND.hash(h,3,0,0))<.15+.5*smooth(S.hot,DP.T,T))plumes.push([px,SEA_LEVEL+.2,pz,'steam']);}
 const fog=banks.length?ATMOS.fogBank(banks):null,steam=plumes.length?ATMOS.smoke(plumes):null;
 if(plumes.length)REGISTER({name:'The Deep\'s steam (hot brine in the warm air)',kind:'steam',x:DP.x,z:DP.z,y:SEA_LEVEL-2,r:R,h:14,tags:{kind:'steam',banks:banks.length,plumes:plumes.length}});
 return{banks,plumes,fog,steam};})():null;
window._steam=GALV_STEAM?{banks:GALV_STEAM.banks.length,plumes:GALV_STEAM.plumes.length}:null;
