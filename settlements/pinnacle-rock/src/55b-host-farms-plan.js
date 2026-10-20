// ================================================================= HOST — the farms' plan (P3b), made before the kits build
// PRF (55-pr-farms.js) on this page's ground: the ring measured out from the mesa's lowest bed (KSTACKS.footR), the
// debris slope's height (the ground less the floor: LAND.talus with the lift road's bench), the lift road's end at the
// palisade (the north-west gate), the Beast Riders' sizes (CAT.dims); every field, farmhouse, gate, post, palisade run
// and track registered in core/tags before 89d draws them.
const FARMS=(function(){try{const t0=performance.now(),b=MESA_B.beds[0],Rd=(ROOST.roads||[])[0],e=Rd?Rd.pts[Rd.pts.length-1]:null;
 const F=PRF.plan({PR,c:[b.cx,b.cz],footR:a=>KSTACKS.footR(b,a),h:groundH,talus:(x,z)=>groundH(x,z)-floorH(x,z),liftEnd:e?[e[0],e[2]]:[-639,65],
  dims:(k,v)=>CAT.dims(k,v),tags:BIO.tagReg(),seed:null});
 F.ms=Math.round(performance.now()-t0);return F;}
 catch(e){reportErr('farms plan: '+(e&&e.stack||e));return null;}})();
_mark('farmsplan');
