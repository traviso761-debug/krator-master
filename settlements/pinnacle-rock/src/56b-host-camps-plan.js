// ================================================================= HOST — the bands' grounds' plan (P3c), made before the kits build
// PRC (56-pr-camps.js) with the kit's table and boundary cutter (BR_CAMP, BR_RUN: CAT), on this page's ground: on the top
// a tent stands on the mesa's own cap 12 m in from its rim and 6 m off the rock standing on it; on the floor inside its
// band's camp or hedge, off the debris slope. The camps' tracks to the palisade's gates join PR's ways (cleared before the
// forest grows: 88); every tent, pen, hedge and fence piece, banner and track is registered in core/tags before 89e draws.
const CAMPS=(function(){try{const t0=performance.now(),TOP=MESA_B.top,ON=ROCK.filter(B=>B!==MESA_B&&Math.abs(B.y0-(TOP-1))<4);
 const upperOk=(x,z)=>{const a=KSTACKS.at(ROCK,x,z);if(!a||a.S!==MESA_B||a.d>-12||a.top<TOP-5)return false;const f=KSTACKS.foot(ON,x,z);return !f||f.d>6;};
 const lowerOk=(x,z)=>{const Z=PR.zoneAt(x,z).zone;return (Z==='camp'||Z==='hedged')&&groundH(x,z)-floorH(x,z)<.3;};
 const h=(x,z)=>{const t=TOWN?TOWN.h(x,z):0;return t>0?t:groundH(x,z);};
 const C=PRC.plan({PR,CAMP:CAT.CAMP,RUN:CAT.RUN,dims:(k,v)=>CAT.dims(k,v),upperOk,lowerOk,h,gates:FARMS?FARMS.palisade.gates:[],tags:BIO.tagReg(),seed:null});
 C.tracks.forEach(W=>PR.addWay(W));C.ms=Math.round(performance.now()-t0);return C;}
 catch(e){reportErr('camps plan: '+(e&&e.stack||e));return null;}})();
_mark('campsplan');
