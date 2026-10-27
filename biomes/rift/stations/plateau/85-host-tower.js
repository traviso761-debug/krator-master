// ================================================================= HOST — station 4's structure: THE PILE, Cube's ruin (massing)
// The owner, 2026-10-27: "the 4th station will now use the Pile rather than arccube, and must be able to cover its lower decks in wild
// vegetation". The Pile (kits/ancients, target arcpile; built on claude/upbeat-yalow-7b38ae): 99 slab blocks in ten tiers laid
// crosswise with wide gaps, a terraced capstone, 435 m; in its ruin the south-east corner down, two blocks crashed through, the
// crown an island its people farm. Baked to RUIN_MASS and RUIN_ROOFS (44c-host-ruin-data.js, by stations/bake_ruin.py: the target's
// ruined site, vertices clustered on an 8 m grid) and stood on the plinth at the origin (45m). MASSING: its shape and the colours of
// its surfaces, not its detail; its own build, and the people in its crown (the Tungangs' Loj Nahn), are the settlement work's.
// The plaza's flat paving is dropped (the plinth's paint takes its place, 45m MAP_PAINT); the upright pieces where they meet the
// ground are obstacles; the whole shell goes to RIFT.dress (moss and hanging growth on its ledges, soffits and walls). THE BASE'S
// DECKS (the roofs the ruin leaves bare: overgrow) are the station's roof pass (87 plantDecks): roofOpen says which part of a roof
// is open sky, not under a block of the tier above. Host-only: no plant is placed in this file.
// the concrete from the material library (materials.json towerConcrete), UVs in world metres / 6, as src/85's tower
function hostTowerLib(n,fb){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('rift',n):null;if(!L)return fb;
 const t=KMAT.textures(L,{aniso:8}).map;t.repeat.set(6/L.scale[0],6/L.scale[1]);return t;}
// the roofs in page coordinates (on the plinth), and the storey stack's tier height (the step between the roofs' heights)
const DECKS=RUIN_ROOFS.map(r=>({x0:r[0],x1:r[1],z0:r[2],z1:r[3],y:r[4]+PLINTH.y,overgrow:!!r[5]}));
const DECK_TS=(function(){const ys=[...new Set(DECKS.map(d=>Math.round(d.y*100)/100))].sort((a,b)=>a-b);return ys.length>1?ys[1]-ys[0]:36.57;})();
// open sky over a point of a roof at height y: no block of the tier above rests there (its roof DECK_TS higher contains the point)
function roofOpen(x,z,y){for(const d of DECKS)if(Math.abs(d.y-DECK_TS-y)<1&&x>=d.x0&&x<=d.x1&&z>=d.z0&&z<=d.z1)return false;return true;}
let RUIN_BASE=null;   /* the base's shell (under the neck), for the decks' pass (87 plantDecks) */
// a deck's soil under the growth: moss greens and dark litter, over the paving's pale grass where an overgrown deck faces the sky
const DECK_SOIL=[0x3e5a2c,0x4a6a32,0x34482a,0x56703a,0x3a4a30];
function onDeck(y){for(const d of DECKS)if(d.overgrow&&Math.abs(d.y-y)<1.2)return true;return false;}
function buildTestTower(){
 const M=RUIN_MASS,dec=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;};
 const q=new Uint16Array(dec(M.pos).buffer),c8=dec(M.col),ib=dec(M.idx),I=M.i16?new Uint16Array(ib.buffer):new Uint32Array(ib.buffer);
 const P=new Float32Array(M.n*3);for(let i=0;i<M.n;i++)for(let k=0;k<3;k++)P[i*3+k]=M.lo[k]+q[i*3+k]/65535*(M.hi[k]-M.lo[k])+(k===1?PLINTH.y:0);   /* on the plinth */
 REGISTER({name:'The Pile (Cube’s ruin, massing)',x:0,z:0,y:PLINTH.y,r:Math.max(M.hi[0]-M.lo[0],M.hi[2]-M.lo[2])/2,h:M.hi[1]});
 // the triangles kept (not the flat paving: all three under 4 m), as a soup with flat normals and world UVs (6 m a unit, as the tower's)
 /* the dress's shell is THE BASE only (under the neck, tier 6: the crown's roofs are its people's fields, not the forest's) */
 const pos=[],col=[],uv=[],cells={},base=[],NECK=PLINTH.y+6*DECK_TS+2;
 for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],d=I[t+2],ya=P[a*3+1],yb=P[b*3+1],yd=P[d*3+1],lo=Math.min(ya,yb,yd),hi=Math.max(ya,yb,yd);
  if(hi<PLINTH.y+4)continue;
  /* an overgrown deck's face (level, up, at a base roof's height): its soil's colour, by a hash of where it is */
  const ux=P[b*3]-P[a*3],uy=yb-ya,uz=P[b*3+2]-P[a*3+2],vx=P[d*3]-P[a*3],vy=yd-ya,vz=P[d*3+2]-P[a*3+2],ny=uz*vx-ux*vz,nl=Math.hypot(uy*vz-uz*vy,ny,ux*vy-uy*vx)||1;
  const soil=hi-lo<.6&&ny/nl>.9&&onDeck(lo-PLINTH.y+PLINTH.y)?new THREE.Color(DECK_SOIL[KRAND.hash(0x50f1,Math.floor(P[a*3]/9),Math.floor(P[a*3+2]/9))%DECK_SOIL.length]):null;
  for(const v of [a,b,d]){pos.push(P[v*3],P[v*3+1],P[v*3+2]);if(soil)col.push(soil.r/1.75,soil.g/1.72,soil.b/1.64);else col.push(c8[v*3]/255,c8[v*3+1]/255,c8[v*3+2]/255);uv.push((P[v*3]+P[v*3+2])/6,P[v*3+1]/6);if(hi<NECK)base.push(P[v*3],P[v*3+1],P[v*3+2]);}
  /* an upright piece at the ground: its 24 m cell an obstacle */
  if(lo<PLINTH.y+30&&hi-lo>6){const cx=Math.floor((P[a*3]+P[b*3]+P[d*3])/72),cz=Math.floor((P[a*3+2]+P[b*3+2]+P[d*3+2])/72),k=cx+','+cz;cells[k]=Math.max(cells[k]||0,hi);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();
 const TEXC=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=200+(fbm(x/18,y/18,2.2,3)-.5)*60+(fbm(x/3,y/3,8,1)-.5)*24;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
 /* the baked colours were lit there by a standard material and its own environment; under this page's Lambert they read dark, so the
    material lifts them (1.75 for the Arcube's .41 mean: kept for the Pile, a pale weathered render) */
 const mat=new THREE.MeshLambertMaterial({map:hostTowerLib('towerConcrete',TEXC),vertexColors:true,color:new THREE.Color(1.75,1.72,1.64)});
 const m=new THREE.Mesh(geo,mat);m.userData.inspectLabel='The Pile, Cube’s ruin (massing from kits/ancients arcpile)';m.userData.host=true;scene.add(m);
 for(const k in cells){const [cx,cz]=k.split(',').map(Number);OBSTACLES.push({x:(cx+.5)*24,z:(cz+.5)*24,r:18,y0:PLINTH.y-5,y1:cells[k]+10});}
 /* SHELLS (core/biome/40-core-place.js): the base, one share (the decks get their own, denser pass: 87 plantDecks) */
 const gb=new THREE.BufferGeometry();gb.setAttribute('position',new THREE.Float32BufferAttribute(base,3));gb.computeVertexNormals();RUIN_BASE=gb;
 return [{geos:[gb],share:1}];}
