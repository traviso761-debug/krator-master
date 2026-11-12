// ================================================================= HOST — the walk-in adit and its opal vug (PLAN.md section 10, step O7; KNOWN_ISSUES.md)
// One adit a station (the one nearest the station's centre, of the diggings that are adits: the middle bed's on the basalt contact, the lower bed's
// in the fire-opal tuff) is carved for real in core/terrain's KCAVERN: a tube from its timbered mouth into the wall (the record's length, rising
// a hand a metre for the drainage), ending in a small hall: THE VUG, where the vein opened into a cavity lined with precious opal. KSPELEO places
// the lining (this kit's own kinds: opal druse and a few botryoidal blocks; the mineral is a label, the colour this host's), on the cavern's own
// queries. KCAVERN writes the tube's and the hall's floors to core/walk (KWALK): walk in with F.
// THE MOUTH: a `well` opening round it makes the cavern mesh the ground inside its rim (0.5 m cells) with the mouth open in it; the page's ground
// (10 m cells, 84) drops its triangles inside that rim, and the cavern's ground is drawn with the page's own ground material and masks, so the
// two read as one slope. The rock: the library's titanium basalt (the middle bed: Rift Black Opal's host) or tuff (the lower bed), darkening
// with depth under the ground (nwbay's caverns' lines: the sky it sees). The vug's opal on the core's `irid` bark kind (no new kind).
// ?adit=0: none of it (the mouth keeps its painted throat, 86).
const ADIT=(function(){const Q=new URLSearchParams(location.search);if(Q.get('adit')==='0'||typeof KCAVERN==='undefined'||typeof KSPELEO==='undefined')return null;
 const ads=DIGS.filter(r=>r.kind==='adit');if(!ads.length)return null;
 const r=ads.slice().sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];r.walkIn=true;
 try{const t0=performance.now(),ox=Math.cos(r.az),oz=Math.sin(r.az),ix=-ox,iz=-oz,px=-iz,pz=ix;   /* out of the wall; into it; across */
  const m0=[r.x+ox*5,r.z+oz*5],y0=GROUND.userData.heightAt(m0[0],m0[1])+.05,L=r.len,pts=[[m0[0],y0,m0[1]]];
  for(let s=12;s<=L;s+=12){const w=1.6*Math.sin(s*.07+r.x*.01);pts.push([r.x+ix*s+px*w,y0+.012*s,r.z+iz*s+pz*w]);}
  const e=pts[pts.length-1],vc=[e[0]+ix*3.5,e[1],e[2]+iz*3.5];
  const GH=GROUND.userData.heightAt;   /* the cavern cuts the ground as drawn (the 560-cell grid), not the finer terrainH: its plate then meets the page's ground */
  const C=KCAVERN.create({ground:GH,cell:.5,chunk:16,seed:KRAND.child(70417,'opalvalley/adit/'+SKEY),minRock:.8,walk:typeof KWALK!=='undefined'?KWALK:null});
  C.tube({id:'adit',owner:r.id,pts,w:r.mw+.4,h:r.h+.3,spring:.45,rock:SKEY==='middlebed'?'basalt':'tuff',finish:'hewn',walkW:r.mw-.2});
  C.hall({id:'vug',owner:r.id,c:vc,rx:3.4,rz:3,h:3.3,belly:.3});
  C.opening({id:'mouth',c:[r.x,r.z],r:14,rim:8,kind:'well'});
  C.build();
  // THE PAGE'S GROUND opened: its triangles wholly inside the mouth's rim go (the cavern's ground takes their place)
  {const g=GROUND.geometry,P=g.attributes.position,I=g.index.array,keep=[];let cut=0;
   for(let t=0;t<I.length;t+=3){let inside=true;for(let k=0;k<3;k++){const v=I[t+k];if(!C.holeAt(P.getX(v),P.getZ(v))){inside=false;break;}}if(inside){cut++;continue;}keep.push(I[t],I[t+1],I[t+2]);}
   g.setIndex(keep);g.index.needsUpdate=true;window._aditCut=cut;}
  // THE ROCK: the library's set, a triplanar uv, the occlusion and the depth's darkness in the vertex colour, the opal veins as thin bright seams
  const fam=SKEY==='middlebed'?'rock.basalt.titanium':'rock.tuff',L0=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('opalvalley',fam):null,LT=L0?KMAT.textures(L0,{aniso:8}):{};
  const rockMat=new THREE.MeshStandardMaterial({map:LT.map||null,normalMap:LT.normalMap||null,roughnessMap:LT.roughnessMap||null,color:L0?0xffffff:(SKEY==='middlebed'?0x3c3c44:0xa86a48),roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide});
  const LAMPU={value:0};   /* the miner's lamp, carried at the eye: drawn in the rock's own shader as emitted light (the horizon layer, khorizonl, rightly shades everything inside the hill as under it, and would put out a light term) */
  rockMat.onBeforeCompile=sh=>{sh.uniforms.uLamp=LAMPU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aSky;varying float vSky;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSky=aSky;');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vSky;uniform float uLamp;')
    .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.directDiffuse*=max(vSky,.3);reflectedLight.directSpecular*=vSky;reflectedLight.indirectDiffuse*=mix(.75,1.,vSky);reflectedLight.indirectSpecular*=vSky;\nif(uLamp>0.0){float ld=length(vViewPosition);totalEmissiveRadiance+=diffuseColor.rgb*vec3(1.0,.8,.58)*uLamp*max(dot(normal,vViewPosition/ld),0.0)/(1.0+ld*ld*.05);}');};   /* deep in, the miners\' lamps: a floor of light, not the sky's (nwbay's caves go to .16: a walk-in adit would be black) */
  rockMat.customProgramCacheKey=()=>'opalvalley-adit-rock';
  const RIM=22,S=L0&&L0.scale?L0.scale[0]:2.5,G=65535,BASE=new THREE.Color(SKEY==='middlebed'?0xc8c8d0:0xf0d8c8),VEIN=[0x6ad0d8,0x9a7ae8,0xe8884a,0x7ae0a0].map(h=>new THREE.Color(h)),cc=new THREE.Color();
  const R={pos:[],nrm:[],uv:[],col:[],sky:[],idx:[],n:0},GR={pos:[],nrm:[],uv:[],gl:[],op:[],idx:[],n:0},m5=[0,0,0,0,0],SG=TERR.R*2.2;
  let tris=0;
  C.chunks.forEach(key=>{const ch=C.meshChunk(key);if(!ch.idx.length)return;const nv=ch.pos.length/3,gm=new Int32Array(nv).fill(-1);
   /* a triangle's three corners take ONE projection, from its face normal (a projection chosen per corner shears the uv across the triangle,
      and the normal map's derivatives turn the light off in flat stepped patches) */
   const addR=(i,pr)=>{const x=ch.pos[i*3],y=ch.pos[i*3+1],z=ch.pos[i*3+2];
    R.pos.push(x,y,z);R.nrm.push(ch.nrm[i*3],ch.nrm[i*3+1],ch.nrm[i*3+2]);R.uv.push(...(pr===1?[x/S,z/S]:pr===0?[z/S,y/S]:[x/S,y/S]));
    const dep=GH(x,z)-y,sk=Math.min(clamp(1-dep/14,.04,1),clamp(1-(Math.hypot(x-r.x,z-r.z)-1.5)/5,.04,1));R.sky.push(sk*sk);   /* the sky reaches in a few metres past the portal: past that the throat reads black */
    const vein=Math.pow(Math.max(0,Math.sin(y*2.7+x*.31+z*.23)),40)*smooth(2,6,dep);cc.copy(BASE).multiplyScalar(.45+.55*ch.occ[i]).lerp(VEIN[(Math.floor(y*1.3+x*.2)%4+4)%4],vein*.8);
    R.col.push(cc.r,cc.g,cc.b);return R.n++;};
   const addRT=(a,b,c)=>{const P=ch.pos,ux=P[b*3]-P[a*3],uy=P[b*3+1]-P[a*3+1],uz=P[b*3+2]-P[a*3+2],vx=P[c*3]-P[a*3],vy=P[c*3+1]-P[a*3+1],vz=P[c*3+2]-P[a*3+2];
    const nx=Math.abs(uy*vz-uz*vy),ny=Math.abs(uz*vx-ux*vz),nz=Math.abs(ux*vy-uy*vx),pr=ny>=nx&&ny>=nz?1:nx>=nz?0:2;R.idx.push(addR(a,pr),addR(b,pr),addR(c,pr));};
   const addG=i=>{if(gm[i]>=0)return gm[i];const x=ch.pos[i*3],z=ch.pos[i*3+2],y=ch.pos[i*3+1]-.3*smooth(RIM-6,RIM,Math.hypot(x-r.x,z-r.z));GR.pos.push(x,y,z);   /* the same surface as the page's ground, its rim a hand under it (where the page's cells straddle the hole's edge, theirs is on top) */GR.nrm.push(ch.nrm[i*3],ch.nrm[i*3+1],ch.nrm[i*3+2]);
    GR.uv.push(x/SG+.5,.5-z/SG);masksAt(x,z,y,m5);GR.gl.push(m5[0],m5[1],m5[2],m5[3]);GR.op.push(m5[4]);return gm[i]=GR.n++;};
   for(let t=0;t<ch.idx.length;t+=3){const a=ch.idx[t],b=ch.idx[t+1],c=ch.idx[t+2];
    if(ch.prim[a]===G&&ch.prim[b]===G&&ch.prim[c]===G)GR.idx.push(addG(a),addG(b),addG(c));else addRT(a,b,c);tris++;}});
  const mk=(B,attrs,mat,label)=>{if(!B.idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(B.nrm,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(B.uv,2));attrs.forEach(([n,a,k])=>g.setAttribute(n,new THREE.Float32BufferAttribute(a,k)));g.setIndex(B.idx);g.computeBoundingSphere();
   const m=new THREE.Mesh(g,mat);m.userData.host=true;m.userData.cave=true;m.userData.probeSkip=true;m.userData.inspectLabel=label;scene.add(m);return m;};
  const rock=mk(R,[['color',R.col,3],['aSky',R.sky,1]],rockMat,'The adit ('+r.id+'): '+(SKEY==='middlebed'?'titanium basalt on the potch line':'fire-opal tuff'));
  const gnd=mk(GR,[['aGL',GR.gl,4],['aOp',GR.op,1],['aWet',new Array(GR.n).fill(0),1]],MAT_GROUND,SITE.name);
  // THE VUG'S OPAL: druse (botryoidal knobs and short points) and a few blocks, milky with flashes; on the irid bark kind (its colour turns with the angle)
  const VUG={druse:{p:.95,len:[.01,.05],r:[.25,.6],n:[8,18],mineral:'opal'},block:{p:.04,len:[.04,.12],r:[.05,.12],n:[1,2],mineral:'opal'}};   /* a lining of low knobs (opal is amorphous: no long points), a few botryoidal blocks */
  const recs=KSPELEO.place(C,{box:[vc[0]-4,vc[2]-4,vc[0]+4,vc[2]+4],y:vc[1]+1.4,cell:.6,world:KRAND.child(70418,'opalvalley/vug/'+SKEY),kinds:VUG});
  let crystals=null;if(recs.length){const M=KSPELEO.mesh(recs,{seg:6}),nv=M.pos.length/3,col=new Float32Array(nv*3);
   const OPC=SKEY==='middlebed'?[0x2a2c3a,0x30324a,0x26283a]:[0xf08a48,0xf4a050,0xe87038],FL=[0x58c8e0,0x8a6ae8,0x60e0a0,0xe8604a,0xf0c060].map(h=>new THREE.Color(h)),b=new THREE.Color();
   for(let i=0;i<nv;i++){const h=KRAND.unit(KRAND.hash(70419,Math.floor(M.pos[i*3]*9),Math.floor(M.pos[i*3+1]*9),Math.floor(M.pos[i*3+2]*9)));b.set(OPC[i%3]).lerp(FL[Math.floor(h*FL.length)%FL.length],h>.55?.55:.15);col[i*3]=b.r;col[i*3+1]=b.g;col[i*3+2]=b.b;}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(M.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(M.nrm,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(M.idx,1));
   const vm=BIO.iridBarkMat(null,'op-vug',[1.06,1.0,.96],[.72,1.04,1.28]);crystals=new THREE.Mesh(g,vm);crystals.userData.host=true;crystals.userData.inspectLabel=SKEY==='middlebed'?'Rift Black Opal in its vug (precious opal on a dark potch backing)':'Fire opal in its vug';
   crystals.userData.probePoints=[vc[0],vc[1]+1,vc[2]];scene.add(crystals);}
  if(rock)rock.userData.probePoints=[pts[Math.floor(pts.length/2)][0],pts[Math.floor(pts.length/2)][1]+1,pts[Math.floor(pts.length/2)][2],vc[0],vc[1]+1.5,vc[2]];
  const mid=pts[Math.floor(pts.length/2)];
  REGISTER({name:'The walk-in adit ('+Math.round(L)+' m into the wall; '+r.grade+' grade; '+r.id+')',x:mid[0],z:mid[2],y:Math.min(y0,vc[1])-1,r:L/2+4,h:6,
   tags:{class:'site',kind:'digging',mining:'opal',resource:r.resource,hazard:{kind:'gas',danger:.25}}});
  REGISTER({name:SKEY==='middlebed'?'The vug: Rift Black Opal where the vein met the basalt':'The vug: fire opal in the tuff',x:vc[0],z:vc[2],y:vc[1]-.5,r:4.2,h:4.5,tags:{class:'site',kind:'digging',mining:'opal',resource:r.resource}});
  /* THE EYE INSIDE: the page's near plane (1 m) clips a 2.8 m tunnel; inside the void it comes in to 0.15 m (outside, the far field keeps its depth precision) */
  /* set before every render (scene.onBeforeRender runs ahead of the projection and the lights' setup): a tick runs a frame late, and a shot
     taken just after a view jumps inside would miss it */
  const prevBR=scene.onBeforeRender;
  scene.onBeforeRender=function(rd,sc,cam){if(prevBR)prevBR.apply(this,arguments);if(cam!==camera)return;const p=camera.position,inside=C.voidSD(p.x,p.y,p.z)<.5&&GH(p.x,p.z)>p.y+.5,n=inside?.15:1;
   if(camera.near!==n){camera.near=n;camera.updateProjectionMatrix();}LAMPU.value=inside?2.4:0;};
  return{record:r,C,pts,vug:vc,mouth:m0,y0,cut:window._aditCut,tris,crystals:recs.length,ms:Math.round(performance.now()-t0),rock,gnd};}
 catch(e){reportErr('adit: '+(e.stack||e));return null;}})();
window._adit=ADIT?{id:ADIT.record.id,len:ADIT.record.len,tris:ADIT.tris,crystals:ADIT.crystals,cut:ADIT.cut,ms:ADIT.ms}:null;
