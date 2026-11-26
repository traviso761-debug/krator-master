// ================================================================= HOST — station 3's salt pans (core/water ext/54: WATER.pan, drawPan)
// The two hollows of the savanna floor (45: PANS): white salt crust in polygon cells over the hollow's flat floor, the cracks wetting
// first and the cells flooding to a brine film as the weather's wetness climbs (drawPan follows it). The plants keep off them (87).
// After core/atmos is bound (89a) and the water drawn (89w)
window._pans=0;
(function(){if(typeof WATER==='undefined'||!WATER.pan||!WATER.drawPan)return;
 PANS.forEach((P,i)=>{try{const level=P.flat+.05,poly=[];for(let k=0;k<28;k++){const a=k/28*TAU,r=P.r*(.92+.12*KRAND.unit(KRAND.hash(3501,i,k)));poly.push([P.x+Math.cos(a)*r,P.z+Math.sin(a)*r]);}
  const S=WATER.pan({name:'A salt pan on the savanna ('+(i+1)+')',poly,level,cell:3,seed:3510+i});const D=WATER.drawPan(S,{});
  const m=D&&(D.mesh||D);if(m&&m.userData){m.userData.inspectLabel=S.name;m.userData.probeSkip=true;}window._pans++;}catch(e){reportErr('pan: '+(e&&e.stack||e));}});})();
