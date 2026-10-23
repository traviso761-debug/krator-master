// ================================================================= HOST — the ground, the stream and the pond
// Two meshes of the ground: 2 m over the 640 m round the monastery (the rock's faces, the pads, the ward's risers),
// 10 m out to the page's edge (a skirt hides the seam). Painted per vertex from the Oidong kit's zones outside the walls
// (its own painter's colours: biomes/oidong/src/84-host-ground.js) and from the plan inside them (the ward's gravel, the
// paved courts and the avenue, the gardens' soil), with the library's granite on the rock and flagstones on the paving.
const GROUND=(function(){
 const K=hx=>new THREE.Color(hx),c=new THREE.Color(),t=new THREE.Color();
 const LOAM=K(0x4e4a3a),MOSS=K(0x76964a),MOSS2=K(0x92b25a),MEAD=K(0x9cb070),MEAD2=K(0xb4c08a),SAND=K(0xeeeadf),SAND2=K(0xe2dccd),
  WET=K(0x5a7a4a),SAGE=K(0x98a882),OCHRE=K(0xb0a888),GRAN=K(0x8e8a82),GRAN2=K(0x66625c),LITTER=K(0xc0b888),
  GRAVEL=K(0xaaa08a),GRAVEL2=K(0x968c78),PAVE=K(0xb4aea2),SOIL=K(0x6e5e44),KORA=K(0xc2b8a0);
 const colourAt=(x,z,h,slope)=>{const n=fbm(x*.04,z*.04,.3,2)-.5,pav=fbm(x*.012+5,z*.012-2,.7,2),pav2=fbm(x*.025-3,z*.025+8,.9,2);
  const Zn=LS.zoneAt(x,z);let rock=0,pave=0;
  if(Zn.zone==='valley'||Zn.zone==='garden'||Zn.zone==='farm'){const Z=OIDONG.zones(x,z);
   c.copy(MEAD).lerp(MEAD2,smooth(.42,.62,pav)*.8).lerp(LITTER,smooth(.6,.72,pav2)*.3);
   t.copy(SAGE).lerp(OCHRE,smooth(.45,.7,pav2)*.7);c.lerp(t,smooth(.25,.6,Z.up)*.65);
   t.copy(MOSS).lerp(MOSS2,clamp(.5+n*2,0,1)*.6).lerp(LOAM,smooth(.5,.72,pav)*.5);c.lerp(t,clamp(Z.moss*1.4+Z.mistZ*1.2,0,1));
   c.lerp(LITTER,clamp(Z.bamboo*1.3,0,1)*.8);
   t.copy(SAND).lerp(SAND2,smooth(.4,.65,pav2)*.6);c.lerp(t,clamp(Z.flats*1.3,0,1));
   c.lerp(WET,clamp(Z.shore*1.2,0,1)*.6);c.lerp(WET,smooth(.4,.85,FIELD.flow(x,z))*.75);
   if(Zn.zone==='garden'||Zn.zone==='farm')c.lerp(SOIL,Zn.zone==='farm'?.7:.45);
   rock=smooth(.35,.7,FIELD.rock(x,z));
   // the track and the kora: beaten pale ground
   const td=LS.trackD(x,z);c.lerp(KORA,smooth(6,3,td)*.85);
   const kd=Math.abs(Math.hypot((x-LS.KORA.cx)/LS.KORA.a,(z-LS.KORA.cz)/LS.KORA.b)-1)*Math.min(LS.KORA.a,LS.KORA.b);
   if(!LS.inGrounds(x,z,-1))c.lerp(KORA,smooth(LS.KORA.w,LS.KORA.w-2,kd)*.8);}
  else if(Zn.zone==='rock'||Zn.zone==='top'){
   // the granite: grey, darker in its joints, green where it is gentle enough to hold soil (grass, moss, the kit's crag
   // pines); the top is meadow and terrace garden, paved only round the buildings (a pad's apron) and in the courts
   c.copy(GRAN).lerp(GRAN2,clamp(.4+n*1.6,0,1));rock=smooth(.35,.75,slope);
   t.copy(MOSS).lerp(MEAD,smooth(.4,.7,pav)).lerp(LOAM,smooth(.6,.8,pav2)*.3);c.lerp(t,(1-rock)*.85);c.lerp(MOSS,smooth(.55,.75,pav2)*.3*rock);
   if(Zn.zone==='top'){const P=padAt(x,z);if(P){c.lerp(PAVE,P.w);pave=P.w;rock*=1-P.w;}}}
  else{c.copy(GRAVEL).lerp(GRAVEL2,smooth(.4,.7,pav));
   if(Zn.zone==='square'||Zn.zone==='avenue'){c.copy(PAVE);pave=1;}
   if(Zn.zone==='raked'){c.copy(SAND);}}
  return {rock,pave};};
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});
 const pk=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong',n):null;
 const RP=pk('rock'),PP=pk('paving'),RT=RP?KMAT.textures(RP,{aniso:8}).map:(OIDONG.ROCKTEX||null),PT=PP?KMAT.textures(PP,{aniso:8}).map:null;
 const DET=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*32+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
  g.putImageData(id,0,0);});
 DET.wrapS=DET.wrapT=THREE.RepeatWrapping;
 mat.onBeforeCompile=sh=>{sh.uniforms.uDet={value:DET};sh.uniforms.uRock={value:RT};sh.uniforms.uPave={value:PT};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec2 aRP;varying vec2 vRP;')
   .replace('#include <common>\nvarying vec3 vGWP;','#include <common>\nvarying vec3 vGN;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vRP=aRP;vGN=objectNormal;');
  // triplanar on the steeps (2026-10-19: projected from above only, the granite and the detail streaked down every face)
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDet;'+(RT?'uniform sampler2D uRock;':'')+(PT?'uniform sampler2D uPave;':'')+'varying vec3 vGWP;varying vec2 vRP;varying vec3 vGN;'+
   'vec3 tp(sampler2D t,float s){vec3 w=pow(abs(normalize(vGN)),vec3(4.0));w/=(w.x+w.y+w.z);return texture2D(t,vGWP.zy*s).rgb*w.x+texture2D(t,vGWP.xz*s).rgb*w.y+texture2D(t,vGWP.xy*s).rgb*w.z;}')
   .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=tp(uDet,0.165)*tp(uDet,0.021)*1.12;'+
    (RT?'vec3 rt=pow(tp(uRock,0.14),vec3(2.2))*1.6;dt=mix(dt,rt,vRP.x*0.85);':'')+
    (PT?'vec3 pt=pow(texture2D(uPave,vGWP.xz/3.0).rgb,vec3(2.2))*1.45;dt=mix(dt,pt,vRP.y*0.8);':'')+
    'diffuseColor.rgb*=dt;}');};
 mat.customProgramCacheKey=()=>'ls-ground'+(RT?'r':'')+(PT?'p':'');
 // (the grid's edges: see below)
 // skirt: the edge's vertices dropped 2.5 m (hides the seam with the coarser mesh)
 // a grid Sx by Sz, step st, centred on (0, cz); hole(x, z): leave that cell out (the finer mesh's)
 const mesh=(Sx,Sz,st,cz,hole,skirt)=>{const nx=Math.round(Sx/st)+1,nz=Math.round(Sz/st)+1,n=nx,x0=-Sx/2,z0=cz-Sz/2,pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3),rp=new Float32Array(nx*nz*2);
  const H=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)H[j*n+i]=terrainH(x0+i*st,z0+j*st);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*n+i,x=x0+i*st,z=z0+j*st,y=H[k];
   const edge=skirt&&(i===0||j===0||i===nx-1||j===nz-1);pos[k*3]=x;pos[k*3+1]=y-(edge?2.5:0);pos[k*3+2]=z;
   const hx=H[j*n+Math.min(nx-1,i+1)]-H[j*n+Math.max(0,i-1)],hz=H[Math.min(nz-1,j+1)*n+i]-H[Math.max(0,j-1)*n+i],slope=clamp(Math.hypot(hx,hz)/(2*st)*1.6,0,1);
   const r=colourAt(x,z,y,slope);c.convertSRGBToLinear();col[k*3]=c.r;col[k*3+1]=c.g;col[k*3+2]=c.b;rp[k*2]=r.rock;rp[k*2+1]=r.pave;}
  const idx=[];
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const x=x0+(i+.5)*st,z=z0+(j+.5)*st;if(hole&&hole(x,z))continue;
   const a=j*n+i,b=a+n,cc=b+1,d=a+1;idx.push(a,b,d,b,cc,d);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.setAttribute('aRP',new THREE.BufferAttribute(rp,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);m.userData.probeSkip=true;m.userData.ground=true;m.userData.inspectLabel='The ground';scene.add(m);
  m.userData.grid={x0,z0,st,nx,nz,H,hole};return m;};
 // the height of the ground AS DRAWN at (x, z): the grid's own triangles (a cell split on its b-d diagonal, as idx above),
 // the fine mesh where it is drawn, the coarse one elsewhere. What lies on the ground (the villages' lanes, 85h) is draped
 // on this, not on terrainH: between a coarse mesh's vertices terrainH can fall below the drawn surface and bury it
 const onGrid=(G,x,z)=>{const u=(x-G.x0)/G.st,v=(z-G.z0)/G.st;if(u<0||v<0||u>G.nx-1||v>G.nz-1)return null;
  const i=Math.min(G.nx-2,Math.floor(u)),j=Math.min(G.nz-2,Math.floor(v)),fu=u-i,fv=v-j,H=G.H,n=G.nx;
  const a=H[j*n+i],d=H[j*n+i+1],b=H[(j+1)*n+i],c2=H[(j+1)*n+i+1];
  return fu+fv<=1?a+(d-a)*fu+(b-a)*fv:c2+(b-c2)*(1-fu)+(d-c2)*(1-fv);};
 function drawnH(x,z){const Gi=inner.userData.grid,Go=outer.userData.grid;
  if(Go.hole(x,z)){const h=onGrid(Gi,x,z);if(h!=null)return h;}const h=onGrid(Go,x,z);return h==null?terrainH(x,z):h;}
 // the inner mesh holds the rock whole (centred 60 m south of the origin); the outer leaves a hole a little smaller
 // (2026-10-19: the fine mesh reaches south over the terraces and the tea garden, whose treads a 10 m grid would smear)
 const inner=mesh(640,920,2,200,null,true);
 const outer=mesh(TERR.R*2,TERR.R*2,10,0,(x,z)=>Math.abs(x)<318&&z>-258&&z<658,false);
 return {inner,outer,mat,drawnH};})();
_mark('ground');

// ---------------------------------------------------------------- the water's records (core/water draws it: 89w-ls-water.js)
REGISTER({name:LS.POND.name,cls:'feature',kind:'pond',key:'longsong_pond',x:LS.POND.x,z:LS.POND.z,y:LS.POND.y-4,r:LS.POND.r+2,h:10});
REGISTER({name:'The Longsong stream (Lõsõ-bi Siṭrīm, the scale model\'s r105)',cls:'feature',kind:'river',key:'longsong_stream',x:0,z:BRIDGE.z,y:BRIDGE.water-4,r:60,h:12});
FANS.forEach((F,i)=>REGISTER({name:'A gravel fan the stream left (raked by the wind)',cls:'feature',kind:'flats',key:'longsong_fan_'+i,x:F.x,z:F.z,y:terrainH(F.x,F.z)-4,r:F.rx,h:14}));
