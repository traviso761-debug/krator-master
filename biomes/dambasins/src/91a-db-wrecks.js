// ================================================================ DAM BASINS — the wrecks on this page (PLAN.md, D1)
// The stranded wrecks (50-db-wrecks.js, DBW) across the bed in front of the port, placed by what the water left: a few
// in the ring, more on the fast-drain slope, most in the slow recession and thickest on its strandlines, where the
// lake's boats grounded one by one as it shrank (the Aral pattern). Not on the port's footprint or its moored hulks.
// Runs after the scene (90): the ground is final (the stamps are in), so every piece sits on it.
const DB_WRECK_MAT=(()=>{const DS=THREE.DoubleSide,mkRust=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({map:TEX.rust,roughnessMap:TEX.rustRM,
  metalnessMap:TEX.rustRM,color:c,metalness:.7,roughness:1,vertexColors:true,side:DS},o||{}));
 return {hull:mkRust(0xb4988a),deck:mkRust(0x8a7466),house:mkRust(0xa08070),dark:new THREE.MeshStandardMaterial({color:0x16110e,roughness:.9,side:DS})};})();
const DB_WRECKS=(()=>{const run=PORT_LAYOUT.runs[0],moor=(PORT_LAYOUT.db&&PORT_LAYOUT.db.moored)||[],S={};
 let z1=-1e9;for(const it of PORT_LAYOUT.items){const f=portFoot(it);if(f)z1=Math.max(z1,f.z1);}
 const avoid=(x,z)=>(x>run.x0-90&&x<run.x1+90&&z<z1+110)||moor.some(m=>Math.hypot(x-m.gx,z-m.gz)<220);
 // how welcome a wreck is: by the band the point lies in, and on the recession's strandlines most of all
 const accept=(x,z,h)=>{const s=DB_BASIN.sample(x,z,h,S),B=KBASIN.BAND;
  return s.band===B.ring?.03:s.band===B.drain?.1:s.band===B.recession?.2+.55*s.strand:0;};
 return DBW.records({x0:run.x0-2600,x1:run.x1+2600,z0:dbShore(0)+40,z1:dbShore(0)+5600,cell:240,seed:9031,ground:terrainH,accept,avoid});})();
{const root=new THREE.Group();root.name='wrecks';
 for(const rec of DB_WRECKS){const G=DBW.draw(THREE,rec,{ground:terrainH,materials:DB_WRECK_MAT});root.add(G);
  REGISTER({name:'Wreck: '+rec.kind+' ('+rec.state+')',x:rec.x,z:rec.z,y:rec.h-rec.H,r:rec.L*.7,h:rec.H*2.5});}
 scene.add(root);window._wrecks=DB_WRECKS.length;}
