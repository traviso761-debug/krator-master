// ================================================================ DAM BASINS — the flood's debris on this page (PLAN.md, D1)
// The debris (52-db-flotsam.js, DBF) across the bed in front of the port: thickest on the fast-drain slope, where the
// break's flood ran hardest and dropped what it tore loose, thinner in the ring and the recession (a little more on its
// strandlines, where the shrinking lake left its wrack), never above the old line, on the port or under a moored hulk.
// Runs after the scene (90) and the wrecks (91a): the ground is final, so every piece sits in it.
const DB_FLOTSAM_MAT={rust:DB_WRECK_MAT.hull,dark:DB_WRECK_MAT.dark,
 paint:new THREE.MeshStandardMaterial({map:TEX.rust,roughnessMap:TEX.rustRM,metalnessMap:TEX.rustRM,color:0xd8d0c8,metalness:.45,roughness:1,vertexColors:true,side:THREE.DoubleSide})};
const DB_FLOTSAM=(()=>{const run=PORT_LAYOUT.runs[0],moorF=(PORT_LAYOUT.db&&PORT_LAYOUT.db.moored)||[],S={};
 let z1=-1e9;for(const it of PORT_LAYOUT.items){const f=portFoot(it);if(f)z1=Math.max(z1,f.z1);}
 const avoid=(x,z)=>(x>run.x0-40&&x<run.x1+40&&z<z1+50)||moorF.some(m=>Math.hypot(x-m.gx,z-m.gz)<160);
 const accept=(x,z,h)=>{if(h>-.5)return 0;const s=DB_BASIN.sample(x,z,h,S),B=KBASIN.BAND;
  return s.band===B.ring?.18:s.band===B.drain?.5:s.band===B.recession?.14+.3*s.strand:0;};
 return DBF.records({x0:run.x0-2200,x1:run.x1+2200,z0:dbShore(0)+30,z1:dbShore(0)+4800,cell:70,field:8,seed:4417,ground:terrainH,accept,avoid});})();
{for(const r of DB_FLOTSAM){const sz=r.kind==='plate'?Math.max(r.w,r.l):r.L;REGISTER({name:DBF.WHO[r.kind],x:r.x,z:r.z,y:r.h-1,r:sz*.6,h:3});}
 const G=DBF.draw(THREE,DB_FLOTSAM,{ground:terrainH,materials:DB_FLOTSAM_MAT});G.name='flotsam';scene.add(G);
 window._flotsam=DB_FLOTSAM.length;}
