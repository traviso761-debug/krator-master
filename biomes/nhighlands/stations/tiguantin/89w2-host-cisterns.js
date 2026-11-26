// ================================================================= HOST — station 6: the terrace cisterns' water (core/water WATER.still, after the stream and the spring pool, 89w)
// The four basins the contact springs feed (88t-host-tiguantin.js: their kerbs and records), each a still at its own level inside its kerb.
const CISTERN_STILLS=(TIGX.CISTERNS||[]).map((c,i)=>{const ca=Math.cos(c.a),sa=Math.sin(c.a),hw=c.w/2-.05,hd=c.d/2-.05,P=(u,v)=>[c.x+ca*u-sa*v,c.z+sa*u+ca*v];
 return WATER.still({name:'Terrace cistern '+(i+1),level:c.level,poly:[P(-hw,-hd),P(hw,-hd),P(hw,hd),P(-hw,hd)]});});
const CISTERN_DRAWS=CISTERN_STILLS.map(S=>{const D=WATER.drawStill(S,{color:lin(0x2a3a34),roughness:.12,metalness:0,envMapIntensity:.15,rain:true,renderOrder:1});
 D.mesh.userData.probeSkip=true;D.mesh.userData.inspectLabel='A terrace cistern (spring water)';return D;});
