// ================================================================= HOST — the far country (the Bowl)
// Round the station to 60 km: the lake to the horizon, the shore running east and west (it bends south toward Mantis),
// the pale salt flat along it, the floor rising toward the rim, all one vertex-coloured ring mesh from the stage's own
// ground formula (baseH: the same shore, plateau and reg go on past the station's edge). Inside the station's square the
// ring sinks 2 m under the ground mesh. The rim itself is the shared sky's ridges (89s-host-sky.js), 70 km and more off.
// MANTIS (PLAN-BOWL.md section 1; the owner, 2026-10-26: a far glimpse): the oasis town on the south-west shore, in its
// green pocket 2 km from the water, low roofs and date palms in a dark band of green. At its true 50 km a roof is under a
// pixel, so it is placed as the rings are, COMPRESSED (12 km west along the shore), and drawn LOOMING: stretched upward three
// times, as the hot air's mirage stretches a far shore; hazed by a fixed share (the page's fog would hide it whole).
// Its own build is a settlement's work.
const MANTIS={x:-12000,z:zS(-12000)+1800,loom:3,name:'Mantis, the oasis town (truly 50 km west along the shore; an Iziz holding under the Izani merchant houses)'};
const FAR=(function(){const R0=2900,R1=60000,NR=56,NA=320,inSq=(x,z)=>Math.abs(x)<TERR.R*1.1-20&&Math.abs(z)<TERR.R*1.1-20;
 const rad=i=>R0*Math.pow(R1/R0,i/(NR-1));
 const pocket=(x,z)=>{const dx=(x-MANTIS.x)/3200,dz=(z-MANTIS.z+700)/1500;return Math.exp(-dx*dx-dz*dz);};
 const farH=(x,z)=>{if(inSq(x,z))return terrainH(x,z)-2;const u=uOf(x,z),h=baseH(x,z),far=smooth(3500,6000,Math.max(Math.abs(x),Math.abs(z)));
  /* past 6 km: the lake floor well under the water, the land a step over it (no ground within metres of the water far off) */
  return u<0?Math.min(h,LAKE.level-6*far):Math.max(h,LAKE.level+4*far*smooth(0,400,u))+12*pocket(x,z);};
 const pos=new Float32Array(NR*NA*3),col=new Float32Array(NR*NA*3),c=new THREE.Color(),t=new THREE.Color();
 const SALT=new THREE.Color(0xe8e0d0),REG=new THREE.Color(0xb08a6a),OCH=new THREE.Color(0xc8945a),GREEN=new THREE.Color(0x4a5a2a),RIM=new THREE.Color(0x9a6e54);
 for(let i=0;i<NR;i++)for(let a=0;a<NA;a++){const r=rad(i),th=a/NA*TAU,x=Math.cos(th)*r,z=Math.sin(th)*r,k=i*NA+a,y=farH(x,z),u=uOf(x,z);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;
  /* the pale salt flat reaching 16-28 km outside the shore (here compressed toward the station), the reg, the rim's red */
  c.copy(REG).lerp(RIM,smooth(12000,40000,u));t.copy(SALT);c.lerp(t,smooth(9000+4000*Math.sin(x*.0003),2000,u)*smooth(-200,100,u));
  if(u<0)c.copy(OCH);c.lerp(GREEN,pocket(x,z)*.9);c.convertSRGBToLinear();col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;}
 const idx=[];for(let i=0;i<NR-1;i++)for(let a=0;a<NA;a++){const p=i*NA+a,q=i*NA+(a+1)%NA,P=p+NA,Q=q+NA;idx.push(p,q,P,q,Q,P);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.FrontSide}));m.userData.probeSkip=true;m.userData.inspectLabel='The Bowl beyond the station';m.userData.host=true;
 m.frustumCulled=false;scene.add(m);
 // MANTIS: low flat-roofed houses and palms on its pocket, merged into one vertex-coloured mesh, hazed by a fixed share
 const B=[],box=new THREE.BoxGeometry(1,1,1),sph=new THREE.IcosahedronGeometry(1,0),cc=new THREE.Color();
 const add=(geo,x,y,z,sx,sy,sz,hex)=>{const q=geo.clone().toNonIndexed();q.scale(sx,sy,sz);q.translate(x,y,z);const n=q.attributes.position.count,a=new Float32Array(n*3);
  cc.set(hex).convertSRGBToLinear();for(let v=0;v<n;v++){a[v*3]=cc.r;a[v*3+1]=cc.g;a[v*3+2]=cc.b;}q.setAttribute('color',new THREE.BufferAttribute(a,3));q.deleteAttribute('uv');B.push(q);};
 for(let i=0;i<70;i++){const R=KRAND,h=k=>R.unit(R.hash(8701,i,k)),x=MANTIS.x+(h(0)-.5)*3200,z=MANTIS.z+(h(1)-.5)*1600,y=farH(x,z)-1;
  if(i<44){const w=40+h(2)*90,d=30+h(3)*70,hh=8+h(4)*14;add(box,x,y+hh/2,z,w,hh,d,h(5)<.5?0xe0d0b0:0xd8c0a0);if(h(6)<.2)add(box,x,y+hh+9,z,10,18,10,0xe8dcc0);}   /* houses; the odd tower (a merchant house) */
  else{const s=18+h(2)*16;add(sph,x,y+s*1.4,z,s,s*.55,s,0x3e4e24);add(box,x,y+s*.7,z,3,s*1.4,3,0x5a4a3a);}}   /* date palms */
 /* one geometry: the pieces are non-indexed, so their arrays concatenate */
 const cat=n=>{let L=0;B.forEach(q=>L+=q.attributes[n].array.length);const o=new Float32Array(L);let k=0;B.forEach(q=>{o.set(q.attributes[n].array,k);k+=q.attributes[n].array.length;});return o;};
 const mg=new THREE.BufferGeometry();['position','normal','color'].forEach(n=>mg.setAttribute(n,new THREE.BufferAttribute(cat(n),3)));
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});
 /* the page's fog would hide the town whole at 50 km (exp2): a fixed share of the fog's colour, so it reads as a pale shape on the shore */
 mat.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <fog_fragment>','#ifdef USE_FOG\n gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor,0.62);\n#endif');};
 mat.customProgramCacheKey=()=>'bowl-mantis';
 const mm=new THREE.Mesh(mg,mat);mm.visible=STATION.mantisFar!==false;{const P=mg.attributes.position;for(let v=0;v<P.count;v++){const x=P.getX(v),z=P.getZ(v),g=farH(x,z)-1;P.setY(v,g+(P.getY(v)-g)*MANTIS.loom);}mg.computeVertexNormals();}
 mm.userData.inspectLabel=MANTIS.name;mm.userData.host=true;mm.userData.probeSkip=true;scene.add(mm);
 if(STATION.mantisFar!==false)REGISTER({name:MANTIS.name,x:MANTIS.x,z:MANTIS.z,y:farH(MANTIS.x,MANTIS.z)-5,r:2000,h:60,far:true});
 return{mesh:m,mantis:mm,farH};})();
_mark('far');
