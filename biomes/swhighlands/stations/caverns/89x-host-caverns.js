// ================================================================= STATION caverns — the karst under the limestone ridge: the drawing
// The plan is 44k-host-karst.js (KKARST's records, laid before the ground: src/45 bakes the dolines into it). Here, after the sky and the water:
//   the cave        KKARST.build into one KCAVERN (rock 'limestone', 1 m cells, 16 m chunks) under the page's ground (terrainH: the dolines
//                   baked in). The sinks' swallets are choked (no well); the cenotes' and the skylights' wells are KCAVERN openings with a
//                   9 m rim: the page's ground (its 6 m grid and its 2 m insets) has every triangle wholly inside a well's rim dropped, and
//                   the cavern meshes the ground inside the rim (its 'ground' triangles, drawn as soil, pushed back by a polygon offset
//                   so the page's own ground wins where the two overlap at the rim's edge). KCAVERN's materials are basalt and tuff only
//                   (KARST-SITES-5.1.md, "Notes for the module"), so the rock is drawn here in the library's karst limestone (the page's
//                   rockDetail set, rock.limestone.karst, as station 1's beds and grain)
//   the light       a cave has no sky: each vertex carries how much sky it sees (aSky, from its depth under the ground, and the open
//                   sky over a well) and the material's direct and ambient light are scaled by it; a lamp at the eye lights the dark
//                   when the eye is under the ground (a PointLight kept on the scene at intensity 0 above it, so the programs never change)
//   the dress       KSPELEO.LIMESTONE in the chambers and along the old dry level (dripstone, straws, curtains, flowstone, rimstone);
//                   the old level, dry for longest, the most decorated
//   the water       a pool at the table wherever a passage or a chamber crosses it (the face of a sump); the cave's streams along the
//                   keyholes near the showcase (KKARST.water: WATER.flow ribbons on the canyons' floors)
//   the records     the cave system, every chamber (class feature, kind cave) and every hazard of KKARST.hazards (drown over the sumps,
//                   fall down the shafts and the skylights) as core/tags records
// Meshing is lazy past the showcase: the chunks near the views and every well are meshed at load, the rest near the eye a few a frame.
const CAVES=(function(){const K=STATION_GROUND;if(!K||!K.N){reportErr('caverns: the karst plan did not run');return null;}
 try{const t0=performance.now(),N=K.N,Q=new URLSearchParams(location.search),TABLE=N.table;
 const C=KCAVERN.create({ground:terrainH,cell:1,chunk:16,seed:20261109,minRock:.8});
 {const op=C.opening;C.opening=P=>P.kind==='well'?(K.wells.some(w=>w.id===P.id)?op(Object.assign({},P,{rim:K.RIM})):null):P.kind==='door'?null:op(P);   /* only the wells the plan keeps; no door: the river cave's alcove is the mouth */
  KKARST.build(C,N,{rock:'limestone'});C.opening=op;}
 K.sky.forEach(s=>C.opening({id:s.sh.id+':well',c:[s.well.x,s.well.z],r:s.well.r,rim:K.RIM,kind:'well'}));
 C.build();
 // ---------------------------------------------------------------- the material: the library's karst limestone, lit by the sky it sees
 const S=ROCK_LIB&&ROCK_LIB.scale?ROCK_LIB.scale[0]:6;
 const mat=new THREE.MeshStandardMaterial({map:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN,roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:2});
 /* the map TRIPLANAR on the world position (a vertex's own projection flipped between axes across a triangle and smeared it flat) */
 mat.onBeforeCompile=sh=>{sh.uniforms.uTs={value:1/S};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aSky;varying float vSky;varying vec3 vWP;varying vec3 vWN;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvSky=aSky;vWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uTs;varying vec3 vWP;varying vec3 vWN;')
   .replace('#include <map_fragment>','#ifdef USE_MAP\n{vec3 tn=abs(normalize(vWN));tn/=tn.x+tn.y+tn.z;vec4 tt=texture2D(map,vWP.zy*uTs)*tn.x+texture2D(map,vWP.xz*uTs)*tn.y+texture2D(map,vWP.xy*uTs)*tn.z;diffuseColor*=mapTexelToLinear(tt);}\n#endif');
  /* the SUN's light (the directional lights) scaled by the sky the point sees; the lamp at the eye (a point light) not, so it lights the dark */
  const LB=THREE.ShaderChunk.lights_fragment_begin,LB2=LB.replace(/(directionalLight,\s*geometry,\s*directLight\s*\);)/g,'$1\n\t\tdirectLight.color*=vSky;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vSky;')
   .replace('#include <lights_fragment_begin>',LB2)
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n'+(LB2===LB?'reflectedLight.directDiffuse*=vSky;reflectedLight.directSpecular*=vSky;':'')+'reflectedLight.indirectDiffuse*=mix(.05,1.,vSky);reflectedLight.indirectSpecular*=vSky;');};
 mat.customProgramCacheKey=()=>'swhi-cave-sky-tri';
 const LIMEC=new THREE.Color(0xcbc4b4),WET=new THREE.Color(0x7c8a80),SOIL=new THREE.Color(0x5e5a3e),cc=new THREE.Color();
 /* the sky a point sees: its depth under the ground, and the open sky down a well (the light falls a long way down a skylight) */
 const skyAt=(x,y,z)=>{let sk=Math.max(.03,Math.min(1,1-(terrainH(x,z)-y)/22));
  for(const w of K.wells){const d=Math.hypot(x-w.x,z-w.z);if(d<w.r*3.2){const f=Math.pow(Math.max(0,1-d/(w.r*3.2)),1.5);sk=Math.max(sk,f*Math.max(.25,1-(terrainH(w.x,w.z)-y)/120));}}return sk*sk;};
 const grp=new THREE.Group();grp.name='The ridge karst';scene.add(grp);
 const meshed=new Set();let tris=0,chunks=0,groundTris=0;
 function meshKey(key){if(meshed.has(key))return;meshed.add(key);const ch=C.meshChunk(key);if(!ch.idx.length)return;const nv=ch.pos.length/3,G=65535;
  const uv=new Float32Array(nv*2),col=new Float32Array(nv*3),sky=new Float32Array(nv),wi=[];
  for(let i=0;i<nv;i++){const x=ch.pos[i*3],y=ch.pos[i*3+1],z=ch.pos[i*3+2],nx=Math.abs(ch.nrm[i*3]),ny=Math.abs(ch.nrm[i*3+1]),nz=Math.abs(ch.nrm[i*3+2]);
   if(ny>.7){uv[i*2]=x/S;uv[i*2+1]=z/S;}else if(nx>nz){uv[i*2]=z/S;uv[i*2+1]=y/S;}else{uv[i*2]=x/S;uv[i*2+1]=y/S;}
   sky[i]=ch.prim[i]===G?1:skyAt(x,y,z);
   if(ch.prim[i]===G)cc.copy(SOIL);else{cc.copy(LIMEC).multiplyScalar(.45+.55*ch.occ[i]);if(y<TABLE+1.5)cc.lerp(WET,Math.min(.6,(TABLE+1.5-y)*.2));}
   col[i*3]=cc.r;col[i*3+1]=cc.g;col[i*3+2]=cc.b;}
  const gi=[];for(let t=0;t<ch.idx.length;t+=3){const a=ch.idx[t],b=ch.idx[t+1],c=ch.idx[t+2];if(ch.prim[a]===G&&ch.prim[b]===G&&ch.prim[c]===G){gi.push(a,b,c);continue;}wi.push(a,b,c);}
  /* the ground inside a well's rim: drawn on the PAGE'S GROUND MATERIAL (its paint by the page's uv, its KGROUND layers and hollows sampled
     from the 6 m grid's own attributes), 10 cm under the page's ground, so where a page triangle still lies over it the page's wins */
  if(gi.length&&GROUND){const GG=GROUND.geometry,AG=GG.attributes.aGL,AO=GG.attributes.aKGAO,NX=Math.round((TERR.X1-TERR.X0)/GROUND_STEP),SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0;
   const pos=new Float32Array(nv*3),guv=new Float32Array(nv*2),gl=new Float32Array(nv*4),ao=new Float32Array(nv);
   const bil=(A,sz,x,z,o)=>{const u=Math.max(0,Math.min(NX-1e-3,(x-TERR.X0)/GROUND_STEP)),v=Math.max(0,Math.min(NX-1e-3,(z-TERR.Z0)/GROUND_STEP)),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*(NX+1)+i;
    for(let c=0;c<sz;c++){const f=n=>A.array[n*sz+c];o[c]=(f(k)*(1-fu)+f(k+1)*fu)*(1-fv)+(f(k+NX+1)*(1-fu)+f(k+NX+2)*fu)*fv;}return o;};
   const t4=[0,0,0,0],t1=[0];
   for(let i=0;i<nv;i++){const x=ch.pos[i*3],z=ch.pos[i*3+2];pos[i*3]=x;pos[i*3+1]=ch.pos[i*3+1]-.1;pos[i*3+2]=z;guv[i*2]=(x-TERR.X0)/SX;guv[i*2+1]=1-(z-TERR.Z0)/SZ;
    if(AG){bil(AG,4,x,z,t4);gl.set(t4,i*4);}ao[i]=AO?bil(AO,1,x,z,t1)[0]:1;}
   const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));gg.setAttribute('normal',new THREE.BufferAttribute(ch.nrm,3));gg.setAttribute('uv',new THREE.BufferAttribute(guv,2));
   gg.setAttribute('aGL',new THREE.BufferAttribute(gl,4));gg.setAttribute('aKGAO',new THREE.BufferAttribute(ao,1));gg.setIndex(new THREE.BufferAttribute(new Uint32Array(gi),1));gg.computeBoundingSphere();
   const gm=new THREE.Mesh(gg,GROUND.material);gm.userData.probeSkip=true;gm.userData.inspectLabel='The ground round a skylight';grp.add(gm);groundTris+=gi.length/3;}
  if(!wi.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(ch.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(ch.nrm,3));
  g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aSky',new THREE.BufferAttribute(sky,1));g.setIndex(new THREE.BufferAttribute(new Uint32Array(wi),1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mat);m.userData.host=true;m.userData.cave=true;m.userData.probeSkip=true;m.userData.inspectLabel='The ridge karst (limestone: the ringfold\'s limestone ridge)';m.userData.cavernChunk=key;grp.add(m);tris+=wi.length/3;chunks++;}
 const all=C.chunks.map(k=>{const v=k.split(',').map(Number);return{k,x:v[0]*16+8,y:v[1]*16+8,z:v[2]*16+8};});
 const M_={};N.nodes.forEach(n=>M_[n.id]=n);
 // ---------------------------------------------------------------- the showcase: what the views look at, meshed at load
 const keyholes=N.passages.filter(p=>p.section==='keyhole'&&p.stream&&p.level===0&&!/^sw:/.test(p.id));
 const showP=keyholes.slice().sort((a,b)=>{const A=M_[a.a],B=M_[b.a],sa=K.sky[0]?Math.hypot(A.x-K.sky[0].H.c[0],A.z-K.sky[0].H.c[2]):0,sb=K.sky[0]?Math.hypot(B.x-K.sky[0].H.c[0],B.z-K.sky[0].H.c[2]):0;return sa-sb||(a.id<b.id?-1:1);})[0]||null;
 const old=N.passages.filter(p=>p.level===1),oldCh=N.chambers.filter(H=>M_[H.node]&&M_[H.node].level===1);
 const oldP=old.slice().sort((a,b)=>(b.h-a.h)||(a.id<b.id?-1:1))[0]||null;
 const show=[];
 K.sky.forEach(s=>{const H=s.H;show.push([H.c[0],H.c[1]+H.h*.5,H.c[2],Math.max(H.rx,H.rz)+20]);});
 K.wells.forEach(w=>{show.push([w.x,terrainH(w.x,w.z)-10,w.z,w.r+K.RIM+16]);show.push([w.x,terrainH(w.x,w.z)-40,w.z,w.r+20]);});
 if(showP){const a=M_[showP.a],b=M_[showP.b];show.push([(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,40]);}
 if(oldP){const a=M_[oldP.a],b=M_[oldP.b];show.push([(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,45]);}
 oldCh.slice(0,2).forEach(H=>show.push([H.c[0],H.c[1]+H.h*.5,H.c[2],Math.max(H.rx,H.rz)+16]));
 {const sn=M_[N.spring.node];show.push([sn.x,sn.y,sn.z,40]);}
 if(K.gorge)show.push([K.gorge.foot.x,K.gorge.foot.y,K.gorge.foot.z,30]);
 const eager=all.filter(c=>show.some(s=>Math.hypot(c.x-s[0],c.y-s[1],c.z-s[2])<s[3]+14)||K.wells.some(w=>Math.hypot(c.x-w.x,c.z-w.z)<w.r+K.RIM+12&&c.y>terrainH(w.x,w.z)-80&&c.y<terrainH(w.x,w.z)+40));
 if(Q.get('caves')!=='lazy')eager.forEach(c=>meshKey(c.k));
 // ---------------------------------------------------------------- the rest, near the eye, a few chunks a frame
 tick(()=>{const e=camera.position;if(e.y>terrainH(e.x,e.z)+120)return;let n=0;const near=all.filter(c=>!meshed.has(c.k)&&Math.hypot(c.x-e.x,c.y-e.y,c.z-e.z)<90).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y,a.z-e.z)-Math.hypot(b.x-e.x,b.y-e.y,b.z-e.z));
  for(const c of near){meshKey(c.k);if(++n>=4)break;}});
 // ---------------------------------------------------------------- the wells: the page's ground opened where the cave meets the sky
 let cut=0;
 {const meshes=[GROUND].concat(GROUND_INSETS||[]).filter(Boolean);
  meshes.forEach(gm=>{const g=gm.geometry,P=g.attributes.position;if(!g.index)return;const I=g.index.array,keep=[];let n=0;
   const inWell=i=>{const x=P.getX(i),z=P.getZ(i);for(const w of K.wells)if(Math.hypot(x-w.x,z-w.z)<w.r+K.RIM)return true;return false;};
   for(let t=0;t<I.length;t+=3){if(inWell(I[t])&&inWell(I[t+1])&&inWell(I[t+2])){n++;continue;}keep.push(I[t],I[t+1],I[t+2]);}
   if(n){g.setIndex(keep.length>65535*3||P.count>65535?new THREE.Uint32BufferAttribute(keep,1):new THREE.Uint16BufferAttribute(keep,1));cut+=n;}});}
 // ---------------------------------------------------------------- the dress: speleothems in the chambers and along the old level
 let speleo=0;
 if(typeof KSPELEO!=='undefined'&&Q.get('speleo')!=='0'){const recs=[];
  const boxes=N.chambers.filter(H=>!H.flooded&&show.some(s=>Math.hypot(H.c[0]-s[0],H.c[2]-s[2])<s[3]+60)).map(H=>({box:[H.c[0]-H.rx,H.c[2]-H.rz,H.c[0]+H.rx,H.c[2]+H.rz],y:H.c[1]+H.h*.45,id:H.id}));
  old.forEach(p=>{const a=M_[p.a],b=M_[p.b];if(!show.some(s=>Math.hypot((a.x+b.x)/2-s[0],(a.z+b.z)/2-s[2])<s[3]+80))return;boxes.push({box:[Math.min(a.x,b.x)-3,Math.min(a.z,b.z)-3,Math.max(a.x,b.x)+3,Math.max(a.z,b.z)+3],y:(a.y+b.y)/2+p.h*.5,id:p.id});});
  boxes.forEach(B=>{try{recs.push(...KSPELEO.place(C,{box:B.box,y:B.y,cell:3,world:20261109,kinds:KSPELEO.LIMESTONE}));}catch(e){reportErr('speleo '+B.id+': '+e.message);}});
  const seen=new Set(),uniq=recs.filter(r=>{if(seen.has(r.id))return false;seen.add(r.id);return true;});
  if(uniq.length){const M=KSPELEO.mesh(uniq,{seg:6}),g=new THREE.BufferGeometry(),nv=M.pos.length/3,sky=new Float32Array(nv),col=new Float32Array(nv*3),uv=new Float32Array(nv*2);
   for(let i=0;i<nv;i++){const x=M.pos[i*3],y=M.pos[i*3+1],z=M.pos[i*3+2];sky[i]=skyAt(x,y,z);cc.set(0xe6dfcd);col[i*3]=cc.r;col[i*3+1]=cc.g;col[i*3+2]=cc.b;uv[i*2]=x/S;uv[i*2+1]=y/S;}
   g.setAttribute('position',new THREE.BufferAttribute(M.pos,3));g.setAttribute('normal',new THREE.BufferAttribute(M.nrm,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aSky',new THREE.BufferAttribute(sky,1));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
   g.setIndex(new THREE.BufferAttribute(M.idx,1));g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.userData.host=true;m.userData.cave=true;m.userData.probeSkip=true;m.userData.inspectLabel='Speleothems (dripstone, straws, curtains, flowstone, rimstone)';grp.add(m);speleo=uniq.length;tris+=M.idx.length/3;}}
 // ---------------------------------------------------------------- the water: the sumps' faces at the table, the streams in the keyholes near the showcase
 let pools=0,streams=0;
 const poolAt=(x,z,r,name)=>{const poly=[];for(let s=0;s<20;s++){const a=s/20*Math.PI*2;poly.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}const Pp=WATER.still({name,level:TABLE,poly});
  WATER.drawStill(Pp,{color:lin(0x24443e),roughness:.05,metalness:.1,envMapIntensity:.06,renderOrder:1,pick:true});pools++;};
 N.passages.forEach(Pp=>{const a=M_[Pp.a],b=M_[Pp.b];const lo=Math.min(a.y,b.y),hi=Math.max(a.y,b.y);if(!(lo<TABLE&&hi+Pp.h>TABLE&&hi>TABLE-.5))return;
  const t=Math.max(0,Math.min(1,(TABLE-a.y)/((b.y-a.y)||1e-6))),x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;if(terrainH(x,z)-TABLE<4)return;
  if(!show.some(s=>Math.hypot(x-s[0],z-s[2])<s[3]+30))return;poolAt(x,z,Math.max(1.5,Pp.w*.55),'The face of a sump (the water table)');});
 {const Wt=KKARST.water(N);(Wt.streams||[]).forEach(R=>{if(streams>=24)return;const P3=R.pts;if(!P3||P3.length<2)return;const mx=P3.reduce((s,p)=>s+p[0],0)/P3.length,mz=P3.reduce((s,p)=>s+p[2],0)/P3.length;
   if(!show.some(s=>Math.hypot(mx-s[0],mz-s[2])<s[3]+20))return;
   const pts=P3.map(p=>[p[0],p[2],p[1]+.12]);for(let i=1;i<pts.length;i++)if(pts[i][2]>pts[i-1][2])pts[i][2]=pts[i-1][2];   /* never climbing */
   try{const F=WATER.flow({name:'A cave stream (in a keyhole\'s canyon)',pts,width:pts.map(()=>Math.max(.8,(R.w==null?1.5:R.w)*.7)),speed:pts.map(()=>.8)});
    WATER.drawFlow(F,{shallow:lin(0x7aa89a),deep:lin(0x2a5a52),color:0xffffff,roughness:.15,metalness:.05,step:1,across:2,margin:.2,envMapIntensity:.08,renderOrder:2,pick:true});streams++;}catch(e){reportErr('cave stream: '+e.message);}});}
 // ---------------------------------------------------------------- the records: the system, the chambers, the hazards
 const B=K.box;
 REGISTER({name:'The ridge karst (a branchwork in the limestone ridge, the river cave its spring)',x:(B[0]+B[2])/2,z:(B[1]+B[3])/2,y:K.G-12,r:Math.hypot(B[2]-B[0],B[3]-B[1])/2,h:120,kind:'cave',
  tags:{cave:{rock:'limestone',kind:'branch',levels:2,level:N.spring.y,table:TABLE,passages:N.passages.length,chambers:N.chambers.length,spring:'the river cave (station 1)',site:'biomes/KARST-SITES-5.1.md site 2'}}});
 /* the chambers and the hazards are core/tags records (BIO.record), not registered volumes: most of the cave is meshed only when the eye
    comes near, and a registered volume is something drawn (the probe's registered-volumes-non-empty) */
 const RECS=[];const rec=o=>{RECS.push(o);BIO.record(o);};
 N.chambers.forEach(H=>{const lv=M_[H.node]?M_[H.node].level:0;rec({name:(H.skylight?'A chamber under a skylight':lv===1?'A chamber of the old dry level':'A chamber')+(H.flooded?' (flooded)':''),x:H.c[0],y:H.c[1],z:H.c[2],r:Math.max(H.rx,H.rz),h:H.h,kind:'cave',
  tags:{cave:{part:'chamber',level:lv,flooded:!!H.flooded,id:H.id,skylight:!!H.skylight}}});});
 const HZ=KKARST.hazards(N);
 HZ.forEach(R=>{const h=R.tags.hazard,sh=h.shape||{},r=sh.r!=null?sh.r:Math.max(1,(sh.w==null?2:sh.w)/2),hh=sh.h!=null?sh.h:2;
  rec({name:h.kind==='drown'?'A sump (drowns a walker)':'A shaft (a fall)',x:R.at[0],y:R.at[1],z:R.at[2],ry:R.ry||0,r,h:Math.max(.5,hh),kind:'hazard',id:'karst:'+R.id,tags:{hazard:h}});});
 // ---------------------------------------------------------------- the lamp at the eye, on under the ground
 const lamp=new THREE.PointLight(0xffe2b8,0,60,1.4);scene.add(lamp);
 tick(()=>{const e=camera.position,under=e.y<terrainH(e.x,e.z)-1.5;lamp.position.copy(e);lamp.intensity=under?2.4:0;});
 /* the rock over every passage (the ground at its ends and middle less its crown): a passage that broke out of the ground is a fault */
 const roofs=N.passages.map(p=>{const a=M_[p.a],b=M_[p.b];let m=1e9;for(const t of [0,.5,1]){const x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=a.y+(b.y-a.y)*t+p.h;let r=terrainH(x,z)-y;
  for(const w of K.wells)if(Math.hypot(x-w.x,z-w.z)<w.r+4)r=1e9;m=Math.min(m,r);}return{p,roof:m};});
 window._caves={ms:Math.round(performance.now()-t0),plan:K.ms,passages:N.passages.length,old:old.length,sumps:N.passages.filter(p=>p.section==='sump').length,keyholes:keyholes.length,chambers:N.chambers.length,shafts:N.shafts.length,
  sinks:N.sinks.length,dolines:K.recs.length,cenotes:K.recs.filter(r=>r.form==='cenote').length,skylights:K.sky.length,wells:K.wells.length,sinksDropped:K.dropped,chunks:C.chunks.length,meshed:()=>meshed.size,drawn:()=>chunks,tris:()=>Math.round(tris),
  groundTris:()=>groundTris,eager:eager.length,cut,speleo,pools,streams,hazards:HZ.length,minRoof:Math.round(Math.min(...roofs.map(r=>r.roof))*10)/10,thinRoofs:roofs.filter(r=>r.roof<2).length};
 return {C,N,K,grp,mat,meshKey,meshed,show,showP,oldP,oldCh,hazards:HZ,recs:RECS,roofs,M_};}catch(e){reportErr('caverns: '+(e&&e.stack||e));return null;}})();
// the station's views, written from the plan's own records
const STATION_VIEWS=CAVES?(function(){const X=CAVES,K=X.K,N=X.N,M=X.M_,V={};
 K.sky.forEach((s,i)=>{const H=s.H,a=i===0?'':' (the second)';
  V['The skylit chamber'+a]={v:[H.c[0]+H.rx*.62,H.c[1]+Math.min(2.2,H.h*.3),H.c[2]+H.rz*.2,H.c[0]-H.rx*.15,H.c[1]+H.h*.95,H.c[2]],mode:'day'};
  if(i===0){const g=terrainH(H.c[0],H.c[2]);V['The skylight from the rim']={v:[H.c[0]+s.well.r+7,g+5.5,H.c[2]+4,H.c[0],g-14,H.c[2]],mode:'day'};}});
 if(X.showP){const a=M[X.showP.a],b=M[X.showP.b],lo=a.y<b.y?a:b,hi=lo===a?b:a;V['A keyhole passage (the stream\'s canyon)']={v:[hi.x+(lo.x-hi.x)*.1,hi.y+X.showP.h*.55,hi.z+(lo.z-hi.z)*.1,lo.x,lo.y+X.showP.h*.3,lo.z]};}
 if(X.oldCh.length){const H=X.oldCh[0];V['A chamber of the old dry level']=[H.c[0]+H.rx*.55,H.c[1]+H.h*.3,H.c[2],H.c[0]-H.rx*.6,H.c[1]+H.h*.35,H.c[2]];}
 else if(X.oldP){const a=M[X.oldP.a],b=M[X.oldP.b];V['The old dry level']=[a.x+(b.x-a.x)*.1,a.y+X.oldP.h*.55,a.z+(b.z-a.z)*.1,b.x,b.y+X.oldP.h*.45,b.z];}
 {const sn=M[N.spring.node],P=N.passages.find(p=>(p.a===sn.id||p.b===sn.id)&&!/^sw:spring/.test(p.id));if(P){const o=M[P.a===sn.id?P.b:P.a];V['Toward the spring (the sump under the river cave)']=[o.x+(sn.x-o.x)*.15,o.y+P.h*.6,o.z+(sn.z-o.z)*.15,sn.x,sn.y+1,sn.z];}}
 {const B=K.box,cx=(B[0]+B[2])/2+250,cz=(B[1]+B[3])/2;V['The sinks over the cave (dolines in the east valley)']=[cx-650,terrainH(cx-650,cz+500)+260,cz+500,cx+250,terrainH(cx+250,cz)-10,cz];}
 return V;})():null;
// the eye may go down into the cave's voids; elsewhere the ground holds it (as station 1's: 1.6 m over terrainH)
const STATION_TAKE={build:'swhighlands-caverns',title:'Krator SW Highlands: the ridge karst',map:'The ridge karst',
 hint:'The SW highlands, station 7: the ridge karst under the ring folds. A branchwork in the limestone ridge: sinks and dolines in the east valley, keyhole passages down to the spring under the river cave, the gorge\'s sink draining in, skylit chambers, an older dry level full of dripstone. N for night',
 clampCam:(p,t)=>{if(CAVES&&p.y<terrainH(p.x,p.z)+1.6&&CAVES.C.sdf(p.x,p.y,p.z)>.4)return;const f=terrainH(p.x,p.z)+1.6;if(p.y<f)p.y=f;}};
// the station's own checks (verify.py --assert: src/99-host-take.js hostChecks), each a plain function of the plan so a broken one must fail
const KCHK={
 // every node drains to the spring: the passages and the level shafts are one graph
 one(N){const adj={},e=(a,b)=>{(adj[a]=adj[a]||[]).push(b);(adj[b]=adj[b]||[]).push(a);};N.passages.forEach(p=>e(p.a,p.b));N.shafts.forEach(s=>{if(s.kind==='level')e(s.from,s.to);});
  const seen={[N.spring.node]:1},q=[N.spring.node];while(q.length){const n=q.shift();(adj[n]||[]).forEach(m=>{if(!seen[m]){seen[m]=1;q.push(m);}});}
  const off=N.nodes.filter(n=>!seen[n.id]);return{ok:!off.length&&N.passages.length>60,seen,detail:N.passages.length+' passages, '+N.chambers.length+' chambers, '+N.shafts.length+' shafts; '+off.length+' nodes cut off from the spring'};},
 // under the ground: no passage's crown within 2 m of the surface, but at a well
 roofs(R){const thin=R.filter(r=>r.roof<2);return{ok:!thin.length,detail:'the least rock over a passage '+Math.min(...R.map(r=>r.roof)).toFixed(1)+' m; '+thin.length+' passages within 2 m of the ground'+(thin.length?': '+thin.slice(0,3).map(r=>r.p.id).join(', '):'')};}};
const STATION_CHECKS=()=>{const R=[],X=CAVES;if(!X)return[{name:'caverns-built',ok:false,detail:'the cave was not built (the error panel says why)'}];const N=X.N,K=X.K,c=window._caves,M=X.M_;
 const one=KCHK.one(N);R.push({name:'karst-one-system',ok:one.ok,detail:one.detail});
 const sn=M[N.spring.node],dB=Math.hypot(sn.x-K.back[0],sn.z-K.back[1]),riser=M['sw:spring:riser'];
 R.push({name:'the-river-cave-is-the-spring',ok:dB<45&&!!riser&&riser.y<K.G&&!!one.seen['sw:spring:riser'],detail:'the spring node '+dB.toFixed(1)+' m behind the alcove\'s back, its riser to '+(riser?(K.G-riser.y).toFixed(1):'?')+' m under the alcove\'s floor'});
 R.push({name:'the-gorge-sink-drains-in',ok:!!K.gorge&&!!one.seen['sw:gorge:foot']&&K.gorge.shaft.y1<GORGE.sink.floor,detail:K.gorge?'a shaft from '+(GORGE.sink.floor-K.gorge.shaft.y1).toFixed(1)+' m under the sink\'s bed down '+(K.gorge.shaft.y1-K.gorge.shaft.y0).toFixed(0)+' m, joined '+(K.gorge.d).toFixed(0)+' m off':'none'});
 const old=N.passages.filter(p=>p.level===1),ls=N.shafts.find(s=>s.kind==='level');
 R.push({name:'an-old-dry-level',ok:old.length>=10&&old.every(p=>Math.min(M[p.a].y,M[p.b].y)>N.table)&&!!ls,detail:old.length+' passages on the old level, none under the table; joined by '+(ls?'a shaft '+(ls.y1-ls.y0).toFixed(0)+' m':'no shaft')});
 R.push({name:'skylights-open',ok:K.wells.length>=1&&c.cut>0&&c.groundTris()>0,detail:K.wells.length+' wells ('+c.skylights+' skylights, '+c.cenotes+' cenotes); '+c.cut+' ground triangles cut, '+c.groundTris()+' cavern ground triangles inside the rims'});
 const rf=KCHK.roofs(X.roofs);R.push({name:'every-passage-under-the-ground',ok:rf.ok,detail:rf.detail});
 const dl=K.recs.every(r=>r.form==='cenote'||r.x>crestX(RB,r.z)-60);
 R.push({name:'sinks-on-the-up-dip-side',ok:dl&&K.recs.length>0,detail:K.recs.length+' dolines ('+c.cenotes+' cenotes) east of the limestone ridge\'s crest; '+c.sinksDropped+' sinks dropped off the features'});
 R.push({name:'cave-drawn',ok:c.drawn()>0&&c.tris()>0,detail:c.drawn()+' chunks drawn of '+c.chunks+' ('+c.eager+' at load), '+c.tris()+' triangles, '+c.speleo+' speleothems, '+c.pools+' sump pools, '+c.streams+' cave streams; built in '+c.ms+' ms (the plan '+c.plan+' ms)'});
 return R;};
const STATION_NEGATIVES=()=>{const X=CAVES;if(!X)return[];const N=X.N,r=(name,c)=>({name,failed:!c.ok,detail:c.detail});
 const cutOff=Object.assign({},N,{passages:N.passages.filter(p=>p.a!==N.spring.node&&p.b!==N.spring.node)});
 const lifted=X.roofs.map((q,i)=>i===0?{p:q.p,roof:-3}:q);
 return[r('a network cut off from its spring',KCHK.one(cutOff)),r('a passage broken out of the ground',KCHK.roofs(lifted))];};
