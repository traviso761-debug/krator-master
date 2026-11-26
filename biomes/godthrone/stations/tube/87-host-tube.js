// ================================================================= HOST — THE VAULT AND THE TUBES (station 9): core/terrain's KCAVERN, lit by lamps
// stationBuild() (88-host-build.js calls it after the kit's pass, before the bake):
//   THE PLAN     KCAVERN.create on the shield's ground: the vault a C.hall (290 x 175 m, 54 m high, its crown 58 m under the plain: the record's
//                numbers), tube_god_n_12 a C.tube through it north-south (44 m wide, 28 m high), the cross-conduit a C.tube leaving north-east (26 m,
//                18 m), each drawn 700 m from the vault and closed there (sealed: the record's state; beyond is the network, lore). Cell 1.5 m:
//                the voids are large (the 0.5 m of Dhelv's rooms would be ~30 M cells here)
//   THE COLUMNS  the ilmenite columns, hexagonal prisms 30 m tall on a hexagonal lattice over the vault's floor (KRAND by cell: gaps, heights,
//                a few broken), black with an ilmenite sheen: BIO items (welded, instanced), each a core/tags record by BIO.put; they stand on
//                the hall's floor (KCAVERN's plan: c[1]); the walk-ways between them kept clear (the explorers' line, north-south and to the conduit)
//   THE LIGHT    the vault is sealed: no sun reaches it. Its rock takes a material lit only by the explorers' lamps (six warm points along the
//                walk-ways and the eye's own headlamp), never by the sky's sun or hemisphere; the columns take the same
// STATION_FLOOR lets the eye stand on the vault's and the tubes' floors (the host's camera guard; under the plan only).
const TUBE_DRAW={meshes:[],counts:{}};
const VAULT=(function(){const crown=TB.y0-TB.depth,floor=crown-54;return{x:0,z:0,crown,floor,rx:87.5,rz:145,name:'The Ilmenite Pillar Vault'};})();
const tubeLine=(dir,from,len,y0,grade)=>{const o=[];for(let s=from;s<=from+len;s+=50){const x=dir[0]*s+(dir===TB.dir?0:0),z=dir[1]*s;o.push([x,y0+grade*s,z]);}return o;};
function STATION_FLOOR(x,z){const C=TUBE_DRAW.C;if(!C)return terrainH(x,z);
 const inV=Math.pow(x/VAULT.rx,2)+Math.pow(z/VAULT.rz,2)<1.05;if(inV)return VAULT.floor;
 const along=(d)=>x*d[0]+z*d[1],across=d=>Math.abs(-x*d[1]+z*d[0]);
 for(const T of TUBE_DRAW.tubes){const s=along(T.dir);if(s>T.from&&s<T.from+T.len&&across(T.dir)<T.w*.45)return T.y0+T.grade*s;}
 return terrainH(x,z);}
function stationBuild(){const t0=performance.now(),C=KCAVERN.create({ground:(x,z)=>terrainH(x,z),cell:1.5,chunk:24,seed:KRAND.hash(WORLD,90,0,0xCA7E),minRock:.8});
 TUBE_DRAW.C=C;
 C.hall({id:'vault',owner:'godthrone',c:[0,VAULT.floor,0],rx:VAULT.rx,rz:VAULT.rz,h:54,belly:.22});
 /* the tubes: along their records' bearings, their floors 10 m over the vault's, graded with the shield (falling north and north-east) */
 const T1={id:'tube-n12',dir:TB.dir,from:-700,len:1400,w:44,h:28,y0:VAULT.floor+10,grade:-.05,name:'tube_god_n_12 (the North Shield tube)'},
  T2={id:'conduit',dir:TB.conduit,from:60,len:700,w:26,h:18,y0:VAULT.floor+10,grade:-.06,name:'the West Godstep Rim Cross-Conduit (toward Godstep\'s vent pit, 85 km)'};
 TUBE_DRAW.tubes=[T1,T2];
 [T1,T2].forEach(T=>{const pts=tubeLine(T.dir,T.from,T.len,T.y0,T.grade);C.tube({id:T.id,owner:'godthrone',pts,w:T.w,h:T.h,spring:.45,ledge:{v:T.h*.32,d:1.6},blend:10,rock:'basalt',finish:'raw'});});
 C.build();
 /* the rock's material: lit by the lamps only (a sealed vault: no sun, no sky) */
 const LAMPS=[[0,VAULT.floor+2,-90],[0,VAULT.floor+2,0],[30,VAULT.floor+2,90],[-40,VAULT.floor+2,40],[TB.conduit[0]*140,VAULT.floor+12,TB.conduit[1]*140],[TB.dir[0]*-260,VAULT.floor+2-.05*-260+10,TB.dir[1]*-260]];
 const U={uLamps:{value:LAMPS.map(p=>new THREE.Vector3(p[0],p[1],p[2]))},uHead:{value:1}};
 const vs='#ifndef USE_OCC\nfloat occ=1.0;\n#else\nattribute float occ;\n#endif\nvarying vec3 vW;varying vec3 vN;varying float vOcc;varying vec3 vC;void main(){\n#ifdef USE_INSTANCING\nmat4 mm=modelMatrix*instanceMatrix;\n#else\nmat4 mm=modelMatrix;\n#endif\nvec4 w=mm*vec4(position,1.0);vW=w.xyz;vN=normalize(mat3(mm)*normal);vOcc=occ;vC=vec3(1.0);gl_Position=projectionMatrix*viewMatrix*w;}';
 const fs='uniform vec3 uLamps[6];uniform float uHead;varying vec3 vW;varying vec3 vN;varying float vOcc;varying vec3 vC;uniform vec3 uBase;uniform float uSheen;'+
  'void main(){vec3 n=normalize(vN);vec3 c=vec3(0.0);for(int i=0;i<6;i++){vec3 l=uLamps[i]-vW;float d=length(l);c+=vec3(1.0,0.78,0.52)*max(dot(n,l/d),0.0)*120.0/(d*d+40.0);}'+
  'vec3 e=cameraPosition-vW;float de=length(e);vec3 v=e/de;c+=uHead*vec3(0.95,0.95,1.0)*max(dot(n,v),0.0)*260.0/(de*de+60.0);'+
  'float sp=pow(max(dot(reflect(-v,n),v),0.0),24.0)*uSheen*uHead*220.0/(de*de+60.0);'+
  'vec3 col=uBase*vC*(c*vOcc+0.012)+vec3(0.6,0.62,0.66)*sp;gl_FragColor=vec4(pow(col,vec3(1.0/2.2)),1.0);}';
 const mat=(base,sheen,occ)=>{const m=new THREE.ShaderMaterial({uniforms:Object.assign({uBase:{value:new THREE.Color(base).convertSRGBToLinear()},uSheen:{value:sheen}},U),vertexShader:vs,fragmentShader:fs,defines:occ?{USE_OCC:''}:{}});m.userData.noHorizon=true;return m;};
 const rockM=mat(0x2c2a2b,.4,true);
 let tris=0;C.meshAll().forEach(ch=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(ch.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(ch.nrm,3));
  g.setAttribute('occ',new THREE.BufferAttribute(ch.occ,1));g.setIndex(new THREE.BufferAttribute(ch.idx,1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,rockM);m.userData.host=true;m.userData.cavern=true;m.userData.inspectLabel='The vault\'s rock: titanium basalt, glazed where the lava drained (KCAVERN)';scene.add(m);TUBE_DRAW.meshes.push(m);tris+=ch.idx.length/3;});
 /* the voids as core/tags records (the vault, the two tubes) */
 REGISTER({name:VAULT.name+' (sealed; 58 m under the shield)',x:0,z:0,y:VAULT.floor,r:VAULT.rz,h:54,kind:'cavern'});
 [T1,T2].forEach(T=>{const m=T.from+T.len/2;REGISTER({name:T.name,x:T.dir[0]*m,z:T.dir[1]*m,y:T.y0+T.grade*m-2,r:T.len/2,h:T.h+4,kind:'cavern'});});
 /* THE COLUMNS: hexagonal prisms (a unit hexagon 1 m across the flats, 1 m tall), scaled per instance */
 const hex=(function(){const g=new THREE.CylinderGeometry(1,1,1,6,1);g.translate(0,.5,0);g.rotateY(Math.PI/6);g.computeVertexNormals();return g;})();
 const colM=mat(0x1b1a1d,1,false),P=[];
 const sp=7.5,hp=sp*Math.sqrt(3)/2;let broken=0;
 for(let j=-Math.ceil(VAULT.rz/hp);j<=Math.ceil(VAULT.rz/hp);j++)for(let i=-Math.ceil(VAULT.rx/sp);i<=Math.ceil(VAULT.rx/sp);i++){
  const h=KRAND.hash(WORLD,i,j,0x11C0),u=k=>KRAND.unit(KRAND.hash(h,k)),x=i*sp+(j&1?sp/2:0)+(u(1)-.5)*1.2,z=j*hp+(u(2)-.5)*1.2;
  const e=Math.pow(x/VAULT.rx,2)+Math.pow(z/VAULT.rz,2);if(e>.78)continue;
  /* the walk-ways: north-south down the middle (6 m) and out to the conduit's mouth */
  if(Math.abs(x)<6)continue;{const s=x*TB.conduit[0]+z*TB.conduit[1],c=Math.abs(-x*TB.conduit[1]+z*TB.conduit[0]);if(s>0&&c<6)continue;}
  if(u(3)<.12)continue;   /* gaps */
  const r=mix(1.1,1.7,u(4)),isBroken=u(5)<.08,H=isBroken?mix(3,12,u(6)):mix(26,34,u(6));if(isBroken)broken++;
  P.push({x,y:VAULT.floor-.3,z,r,H,yaw:u(8)*.4,tx:(u(7)-.5)*.02,tz:(u(9)-.5)*.02,broken:isBroken});}
 /* drawn as one instanced mesh under the lamp material (BIO's instancing does not feed a ShaderMaterial); the field a core/tags record first */
 REGISTER({name:'The ilmenite columns ('+P.length+', '+broken+' broken): black hexagonal prisms 30 m tall, grown as the lava cooled slowly',x:0,z:0,y:VAULT.floor,r:VAULT.rz,h:36,kind:'feature'});
 {const im=new THREE.InstancedMesh(hex,colM,P.length),M=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler();
  P.forEach((p,k)=>{e.set(p.tx,p.yaw,p.tz);q.setFromEuler(e);M.compose(new THREE.Vector3(p.x,p.y,p.z),q,new THREE.Vector3(p.r,p.H,p.r));im.setMatrixAt(k,M);});
  im.instanceMatrix.needsUpdate=true;im.computeBoundingSphere&&im.computeBoundingSphere();im.frustumCulled=false;im.userData.host=true;im.userData.cavern=true;im.userData.inspectLabel='Ilmenite columns (black hexagonal prisms, 30 m)';scene.add(im);TUBE_DRAW.meshes.push(im);}
 TUBE_DRAW.cols=P;const n=P.length;
 BIO.range=null;
 TUBE_DRAW.counts={columns:n,broken,cavernTris:tris,chunks:C.chunks.length,ms:Math.round(performance.now()-t0)};
 window._cavern=TUBE_DRAW.counts;return TUBE_DRAW.counts;}
