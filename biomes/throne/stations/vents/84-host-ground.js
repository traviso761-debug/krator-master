// ================================================================= HOST — the ground (vent country)
// One ground mesh painted from the layout and the fields, and the library's layers over it (materials.json), read through
// the kit's stochastic sampler (THRONE.GLSL_LAY): the plume's ash and its mycelium on the old ground, the flows' lava, the
// fissure's young flow with its veins, the cones' scoria, sulphur at the vents, the marsh's crust and its bank of acid
// travertine, sinter round the pools, mud at the pots, the mat in the hollows, lichen on the scarps. The steam valley's
// walls are altered by the steam (bleached white clay, stained ochre and rust). Round each pool the THERMOPHILE MATS are
// drawn in the shader from the pools' centres (sharp at any range: the painted map is ~3 m a pixel): green-yellow at the
// water, then yellow, orange, brown as it cools, streaming out down the runoff. (No library texture for them yet:
// core/materials/PLAN.md, ground.mat.thermal; procedural until the owner's arrives.) At night the fissure's veins, the
// mat and the mycelium light by their own colours.
// THE HAZARDS (core/hazard, 2026-10-26): what can hurt a walker here, on the records below (tags.hazard; KHAZ reads them,
// the host's 'hazards' layer shows them, the walk export turns them into navigation zones). The pools scald (the hotter, the
// worse), the pots spit, the hollows' CO2 kills (paths never go down into them), the marsh is acid, the cracks are falls; the
// shapes are the water's and the cracks', not the records' wider footprints
const HZ={pool:P=>({kind:'heat',danger:Math.min(1,.5+.5*P.hot),dose:1+2*P.hot,shape:{type:'cyl',r:P.r*1.45,h:8,y0:2},tell:{sign:'scalding: the bluer, the hotter'}}),
 mud:M=>({kind:'heat',danger:.6,dose:1.5,shape:{type:'cyl',r:M.r*1.1,h:6,y0:1}}),
 hollow:H=>({kind:'gas',danger:1,dose:1,falloff:'none',shape:{type:'cyl',r:H.r,h:H.depth+3,y0:0},tell:{sign:'bones on the rim'}}),
 marsh:()=>{const pts=[];for(let k=0;k<20;k++){const a=k/20*TAU,c=upAt(MARSH.u+MARSH.ru*Math.cos(a),MARSH.p+MARSH.rp*Math.sin(a));pts.push([c[0]-MARSH.x,c[1]-MARSH.z]);}
  return {kind:'acid',danger:.6,falloff:'linear',shape:{type:'poly',pts,h:8,y0:2,edge:25}};},
 crack:C=>{const ax=C.dx*C.len,az=C.dz*C.len,bx=-C.dz*C.hw,bz=C.dx*C.hw;
  return {kind:'fall',danger:.8,shape:{type:'poly',pts:[[ax+bx,az+bz],[-ax+bx,-az+bz],[-ax-bx,-az-bz],[ax-bx,az-bz]],h:C.d+6}};},
 fumarole:S=>({kind:'heat',danger:Math.round((.3+.4*S.s)*100)/100,dose:.5+S.s,shape:{type:'cyl',r:S.R*.25,h:8+6*S.s}})};
FLOWS.flows.forEach(f=>{let sx=0,sz=0,n=0;const F=FLOWS;
 for(let k=0;k<F.id.length;k+=7){if(F.id[k]!==f.fi)continue;const i=k%F.N,j=(k-i)/F.N,x=F.x0+i*F.cs,z=F.z0+j*F.cs;if(x*x+z*z>(TERR.R-150)*(TERR.R-150))continue;sx+=x;sz+=z;n++;}
 if(!n)return;f.cx=sx/n;f.cz=sz/n;f.rad=Math.sqrt(n*7*F.cs*F.cs/Math.PI);
 REGISTER({name:f.name+' ('+ageLabel(f.age)+')',x:f.cx,z:f.cz,y:terrainH(f.cx,f.cz)-15,r:f.rad*1.1,h:60,flow:f.fi});});
REGISTER({name:'The graben (the rift\'s floor, dropped between its scarps)',x:0,z:0,y:flankH(0,0)-60,r:1900,h:120,graben:true});
{const p=fissPt((FISS.u0+FISS.u1)/2);REGISTER({name:FISS.name,x:p[0],z:p[1],y:terrainH(p[0],p[1])-10,r:(FISS.u1-FISS.u0)/2+40,h:40,fissure:true});}
CONES.forEach(C=>REGISTER({name:C.name,x:C.x,z:C.z,y:terrainH(C.x,C.z)-C.h-6,r:C.r*1.1,h:C.h*2+20,cone:C.i}));
{const p=upAt(-100,valL(-100));REGISTER({name:VALLEY.name,x:p[0],z:p[1],y:terrainH(p[0],p[1])-6,r:2000,h:60,valley:true});}
REGISTER({name:MARSH.name,x:MARSH.x,z:MARSH.z,y:MARSH.level-4,r:MARSH.ru*1.15,h:16,marsh:true,tags:{hazard:HZ.marsh()}});
CRACKS.forEach(C=>REGISTER({name:'An open crack in the graben floor (a gjá)',x:C.x,z:C.z,y:terrainH(C.x,C.z)-C.d-3,r:C.len,h:C.d+8,crack:true,tags:{hazard:HZ.crack(C)}}));
POOLS.forEach((P,i)=>REGISTER({name:'A hot pool',x:P.x,z:P.z,y:POOLL[i]-4,r:P.r*2.2,h:14,pool:i,tags:{hazard:HZ.pool(P)}}));
MUD.forEach((M,i)=>REGISTER({name:'A mud pot',x:M.x,z:M.z,y:MUDL[i]-3,r:M.r*1.6,h:10,mud:i,tags:{hazard:HZ.mud(M)}}));
HOLLOWS.forEach(H=>REGISTER({name:H.name,x:H.x,z:H.z,y:terrainH(H.x,H.z)-3,r:H.r*1.3,h:H.depth+8,hollow:H.i,tags:{hazard:HZ.hollow(H)}}));
// the fumaroles (47's STEAM, the pools' and pots' own left out: their pools are the hazard): heat at the vent, a hazard record
// each (core/tags only: not in REG, so the inspector's region names stay the pages' own)
STEAM.slice(0,STEAM.length-POOLS.length-MUD.length).forEach((S,i)=>BIO.record({name:'A fumarole (steam at 90 C and more, and its gas)',key:'fumarole',kind:'vent',
 x:S.x,z:S.z,y:terrainH(S.x,S.z)-1,r:S.R*.25,h:8+6*S.s,tags:{hazard:HZ.fumarole(S)}}));

// ---------------------------------------------------------------- the paint
const K=hx=>new THREE.Color(hx);
const PAINT={ASH:K(0x8a8478),ASH2:K(0x9a9282),DARK:K(0x5a5448),LAVA:K(0x2a2826),FRESH:K(0x1a1818),SCOR:K(0x5a2a22),SCOR2:K(0x2c2222),
 SUL:K(0xd8c040),SULW:K(0xeae2c4),LIME:K(0xa8c840),SINT:K(0xd8d2c2),MUD:K(0x6e665c),MAT:K(0x8a2a3a),LICH:K(0x8a8a6a),
 CLAY:K(0xe4dccc),OCHRE:K(0xc89a48),RUST:K(0x9a4a2a)};
const _c=new THREE.Color();
function paintAt(c,x,z,at,n,n2,pav){
 c.copy(PAINT.ASH).lerp(PAINT.ASH2,clamp(.5+n*1.8,0,1)).lerp(PAINT.DARK,smooth(.62,.82,pav)*.3);
 const th=FLOWS.thickAt(x,z),age=FLOWS.ageAt(x,z),onF=smooth(.4,2,th);
 if(onF>0){_c.copy(PAINT.LAVA).lerp(PAINT.FRESH,smooth(400,20,age)).lerp(c,.25*smooth(300,3000,age));c.lerp(_c,onF*.85);}
 c.lerp(_c.copy(PAINT.SCOR).lerp(PAINT.SCOR2,smooth(.55,.75,pav+n2*.3)*.6),at('cinder')*.85);
 // the steam valley: the rock rotted to clay by the steam, white, stained ochre and rust in bands down its walls
 const vl=at('valley');if(vl>0){const y=FC.at(FC.a.h,x,z),b=Math.sin(y*.5+fbm(x*.02,z*.02,4741,2)*5);_c.copy(PAINT.CLAY).lerp(PAINT.OCHRE,smooth(.2,.5,b)).lerp(PAINT.RUST,smooth(-.3,-.6,b));c.lerp(_c,vl*.8);}
 c.lerp(PAINT.LICH,smooth(.6,.9,at('slope'))*at('rock')*.35);
 c.lerp(_c.copy(PAINT.SUL).lerp(PAINT.SULW,smooth(.5,.8,n2+.5)*.4),smooth(.45,.85,at('vent')+n*.4)*.75);
 // the marsh: sulphur crust and white salts, a lime film at the water
 const mr=at('marsh');if(mr>0)c.lerp(_c.copy(PAINT.SULW).lerp(PAINT.SUL,smooth(.4,.7,n2+.5+n)).lerp(PAINT.LIME,smooth(.6,.85,pav)*.4),mr*.85);
 c.lerp(PAINT.SINT,at('pools')*.7);c.lerp(PAINT.DARK,at('hollow')*.8).lerp(PAINT.MAT,at('hollow')*smooth(.4,.7,pav+n)*.6);
 return c;}
const paintTex=(W,x0,z0,S)=>BIO.canvasTex(W,W,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const c=new THREE.Color();
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=x0+(x/w)*S,wz=z0+(y/h)*S;
  const n=fbm(wx*.03,wz*.03,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5),pav=fbm(wx*.012+5,wz*.012-2,.7,2);
  paintAt(c,wx,wz,k=>FC.at(FC.a[k],wx,wz),n,n2,pav);const k=1+n*.12+n2*.06;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
/* the detail is the macro's blue channel (2026-11-09: the grey TEX_DETAIL was, the same pixels): one texture unit for the two, which the ground
   needs: it read seventeen of sixteen on the GPU once core/atmos's cloud noise was counted (the bismuth added none) */
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2);d[i]=a*255;d[i+1]=b*255;
  d[i+2]=clamp(232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26,0,255);d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
const GROUNDU={uNight:{value:0}};
// the pools and the pots for the mats (x, z, r, how hot: a pot is -1, grey mud and no mats)
const MATPOOLS=POOLS.map(P=>new THREE.Vector4(P.x,P.z,P.r,P.hot)).concat(MUD.map(M=>new THREE.Vector4(M.x,M.z,M.r,-1)));
const GL_KEYS=['ash','mycelium','lava','veins','scoria','sulphur','rim','sinter','mud','matfloor','lichenrock','crust'];
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k of GL_KEYS){const P=KMAT.packed('throne','ground.'+k);if(!P)return null;o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
// the owner's thermal mat (ground.thermal): the runoff's streamers, under the bands' hue (blue-green at the water stays the shader's)
const GTH=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('throne','ground.thermal');return P?KMAT.textures(P,{aniso:8}).map:null;})();
let KGI=null;   /* the layers' uKG indices once KGROUND.hook has them (THRONE.kgGround, 70): the page then leaves the layers to it */
const MAT_GROUND=new THREE.MeshStandardMaterial({roughness:.95,metalness:0,map:null,color:0xb0aaa4});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uNight=GROUNDU.uNight;sh.uniforms.uMacro={value:TEX_MACRO};
 sh.uniforms.uPools={value:MATPOOLS};if(GTH)sh.uniforms.uG_thermal={value:GTH};sh.uniforms.uDn={value:new THREE.Vector2(DN[0],DN[1])};
 if(GLAY)if(!KGI)GL_KEYS.forEach(k=>sh.uniforms['uG_'+k]={value:GLAY[k].map});
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute vec4 aL0,aL1,aL2;varying vec4 vL0,vL1,vL2;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vL0=aL0;vL1=aL1;vL2=aL2;');
 const W={ash:'vL0.x',mycelium:'vL0.y',lava:'vL0.z',veins:'vL0.w',scoria:'vL1.x',sulphur:'vL1.y',rim:'vL1.z',sinter:'vL1.w',mud:'vL2.x',matfloor:'vL2.y',lichenrock:'vL2.z',crust:'vL2.w'};
 const NP=MATPOOLS.length;
 let decl=(GTH?'uniform sampler2D uG_thermal;':'')+'uniform sampler2D uMacro;uniform float uNight;uniform vec4 uPools['+NP+'];uniform vec2 uDn;varying vec3 vGWP;varying vec4 vL0,vL1,vL2;',body;
 // the mats: for each pool, its distance in radii, stretched out down the runoff and ragged by angle; the bands by it
 const mats='{vec2 p=vGWP.xz;for(int i=0;i<'+NP+';i++){vec4 P=uPools[i];vec2 dv=p-P.xy;float r=length(dv);if(r>P.z*4.5)continue;vec2 dn=dv/max(r,0.01);'+
  'float ang=atan(dn.y,dn.x),rag=texture2D(uMacro,vec2(ang*0.16+P.x*0.013,P.z*0.07)).g,run=max(dot(dn,uDn),0.0);'+
  'float d=r/(P.z*(1.0+0.35*rag+1.0*run*run*smoothstep(0.35,0.7,texture2D(uMacro,vec2(ang*0.9,P.y*0.01)).r)));'+
  'vec3 m;float w;if(P.w<0.0){m=vec3(0.3,0.28,0.25);w=smoothstep(2.1,1.3,d)*0.75;}'+
  'else{m=mix(vec3(0.55,0.6,0.3),vec3(0.74,0.58,0.27),smoothstep(1.05,1.3,d));m=mix(m,vec3(0.64,0.4,0.21),smoothstep(1.3,1.6,d));m=mix(m,vec3(0.42,0.31,0.22),smoothstep(1.6,1.9,d));'+
  'm=mix(m,vec3(0.3,0.52,0.56),smoothstep(1.05,0.95,d)*P.w);w=smoothstep(2.05,1.7,d)*smoothstep(0.85,0.98,d)*(0.45+0.4*P.w);}'+
  'm*=0.7+0.55*texture2D(uMacro,p*0.045).g;'+(GTH?'m=mix(m,texture2D(uG_thermal,p*0.33).rgb*(0.8+0.4*smoothstep(1.3,1.9,d)),0.7*smoothstep(1.0,1.25,d));':'')+'diffuseColor.rgb=mix(diffuseColor.rgb,pow(m,vec3(2.2))*(0.85+0.3*texture2D(uMacro,p*0.11).b),w);}}';
 if(GLAY&&KGI){body='vec3 _E_veins='+THRONE.kgE(KGI,GLAY,'veins')+',_E_crust='+THRONE.kgE(KGI,GLAY,'crust')+';{vec3 dt=vec3(texture2D(uMacro,vGWP.xz*0.023+0.37).b);diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);}\n/*KGROUND*/\n'+mats;}
 else if(GLAY){decl+='uniform sampler2D '+GL_KEYS.map(k=>'uG_'+k).join(',')+';'+THRONE.layGLSL(USE_KG);
  body='vec3 _E_veins=vec3(0.0),_E_crust=vec3(0.0);{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);'+
   'vec3 dt=vec3(texture2D(uMacro,p*0.023+0.37).b);diffuseColor.rgb*=mix(vec3(1.0),dt*1.06,0.6);vec3 L;'+
   GL_KEYS.map(k=>'L=_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt);diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*L*1.25,'+W[k]+');'+(k==='veins'?'_E_veins=L;':k==='crust'?'_E_crust=L;':'')).join('')+'}'+mats;}
 else body='vec3 _E_veins=vec3(0.0),_E_crust=vec3(0.0);{vec3 dt=vec3(texture2D(uMacro,vGWP.xz*0.17).b);vec3 dt2=vec3(texture2D(uMacro,vGWP.xz*0.023+0.37).b);diffuseColor.rgb*=dt*dt2*1.12;}'+mats;
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body+'\n/*KGROUND*/')
  // at night the fissure's veins glow orange (still hot, four years on), the mat its pink, the mycelium a faint gold
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=uNight*(vL2.y*vec3(0.55,0.08,0.3)+vL0.y*vec3(0.42,0.34,0.1)*0.6)+(0.12+uNight)*vL0.w*max(_E_veins*smoothstep(0.05,0.25,_E_veins.r-_E_veins.b)*2.4,vec3(0.5,0.12,0.02)*vL0.w*vL0.w)+(0.06+uNight*0.8)*vL2.w*_E_crust*smoothstep(0.05,0.25,_E_crust.r-_E_crust.b)*2.0;');};
// a vertex's layer weights (the main mesh and the fine patch both)
function layersAtV(x,z,k,L0,L1,L2){
  const at=n=>FC.at(FC.a[n],x,z),th=FLOWS.thickAt(x,z),age=FLOWS.ageAt(x,z),onF=smooth(.4,2,th)*(1-smooth(2500,7000,age));
  const mr=at('marsh'),pl=at('pools'),hw=at('hollow'),vl=at('valley'),cn=at('cinder'),vent=at('vent'),sl=at('slope'),rk=at('rock');
  const soil=(1-onF)*(1-mr)*(1-pl)*(1-hw)*(1-cn),n1=fbm(x*.008,z*.008,4722,2),fz=FC.at(FC.a.fiss,x,z);
  // the young flow's veins: only near the fissure, where it is still hot under its crust
  const dF=Math.abs(pOf(x,z)-fissL(uOf(x,z))),hot=smooth(90,10,dF)*smooth(FISS.u0-120,FISS.u0+60,uOf(x,z))*smooth(FISS.u1+120,FISS.u1-60,uOf(x,z));
  L0[k*4]=soil*(1-vl)*.8;L0[k*4+1]=soil*(1-vl)*at('ash')*smooth(.55,.8,n1)*.7;L0[k*4+2]=Math.max(onF*.85*(1-mr),smooth(.55,.85,sl)*rk*.65*(1-vl));L0[k*4+3]=Math.max(hot*onF,fz)*.85;
  L1[k*4]=cn*.85;L1[k*4+1]=Math.max(smooth(.45,.85,vent+(n1-.5)*.3)*.8,mr*smooth(.3,.6,fbm(x*.05,z*.05,4733,2))*.7);L1[k*4+2]=mr*.55*smooth(.75,1.1,marshD(x,z));L1[k*4+3]=pl*.8;
  L2[k*4]=Math.max(pl*smooth(.5,.8,fbm(x*.04,z*.04,4734,2))*.6,mr*.35);L2[k*4+1]=hw*(.12+.65*smooth(.45,.7,fbm(x*.06,z*.06,4735,2)));L2[k*4+2]=smooth(.55,.85,sl)*rk*.4*smooth(.4,.65,n1)*(1-vl*.6);
  /* the library's glowing lava crust over the fissure's hottest flow, a fresh crust cracked over the still-molten */
  L2[k*4+3]=hot*onF*smooth(.5,.72,fbm(x*.03+9,z*.03-2,4736,2))*.8;}
// THE FINE PATCH (2026-10-26, KNOWN_ISSUES: the small features were coarser than the 6.5 m mesh): the hot pools and the mud pots stand on
// a patch four times finer (1.6 m), cut out of the main mesh; its border vertices lie on the coarse mesh's own edges (no crack). The
// pots' floors and the pools' bowls are drawn as cut, not flattened under a 6.5 m triangle
const GN=880,GS=TERR.R*2.2,GCS=GS/GN,GNX=GN+1,GX0=-GS/2,GH=new Float32Array(GNX*GNX);
const PATCH=(function(){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;const add=(x,z,r)=>{x0=Math.min(x0,x-r);z0=Math.min(z0,z-r);x1=Math.max(x1,x+r);z1=Math.max(z1,z+r);};
 POOLS.forEach(P=>add(P.x,P.z,P.r*2.6+8));MUD.forEach(M=>add(M.x,M.z,M.r*2+8));
 const i0=Math.floor((x0-GX0)/GCS),i1=Math.ceil((x1-GX0)/GCS),j0=Math.floor((z0-GX0)/GCS),j1=Math.ceil((z1-GX0)/GCS);
 return{i0,i1,j0,j1,sub:4,x0:GX0+i0*GCS,z0:GX0+j0*GCS,sx:(i1-i0)*GCS,sz:(j1-j0)*GCS};})();
const GW={ash:'vL0.x',mycelium:'vL0.y',lava:'vL0.z',veins:'vL0.w',scoria:'vL1.x',sulphur:'vL1.y',rim:'vL1.z',sinter:'vL1.w',mud:'vL2.x',matfloor:'vL2.y',lichenrock:'vL2.z',crust:'vL2.w'};
KGI=THRONE.kgGround(MAT_GROUND,{key:'throne-vents',keys:GL_KEYS,W:GW,GLAY});
const GROUND=(function(){const N=GN,S=GS,cs=GCS,nx=GNX;MAT_GROUND.map=paintTex(2048,-S/2,-S/2,S);
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),L0=new Float32Array(nx*nx*4),L1=new Float32Array(nx*nx*4),L2=new Float32Array(nx*nx*4);
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);GH[k]=y;pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  layersAtV(x,z,k,L0,L1,L2);}
 const idx=[];
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){if(i>=PATCH.i0&&i<PATCH.i1&&j>=PATCH.j0&&j<PATCH.j1)continue;const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx.push(a,b,d,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,4));
 g.setIndex(new THREE.BufferAttribute(new Uint32Array(idx),1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='Vent country: the east rift under the plume';scene.add(m);return m;})();
THRONE.kgCavity(GROUND);   /* the mesh's hollows for the relief (KGROUND.cavityMesh) */
const GROUND_PATCH=(function(){const P=PATCH,nx=(P.i1-P.i0)*P.sub+1,nz=(P.j1-P.j0)*P.sub+1,cs=GCS/P.sub,S=GS;
 const pos=new Float32Array(nx*nz*3),uv=new Float32Array(nx*nz*2),L0=new Float32Array(nx*nz*4),L1=new Float32Array(nx*nz*4),L2=new Float32Array(nx*nz*4);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=P.x0+i*cs,z=P.z0+j*cs;let y;const bi=i===0||i===nx-1,bj=j===0||j===nz-1;
  if(bi||bj){const gi=P.i0+i/P.sub,gj=P.j0+j/P.sub,i0=Math.floor(gi),j0=Math.floor(gj),fi=gi-i0,fj=gj-j0,H=(a,b)=>GH[Math.min(GN,b)*GNX+Math.min(GN,a)];
   y=bi&&bj?H(i0,j0):bi?mix(H(i0,j0),H(i0,j0+1),fj):mix(H(i0,j0),H(i0+1,j0),fi);}else y=terrainH(x,z);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;layersAtV(x,z,k,L0,L1,L2);}
 const idx=new Uint32Array((nx-1)*(nz-1)*6);let t=0;
 for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setAttribute('aL0',new THREE.BufferAttribute(L0,4));g.setAttribute('aL1',new THREE.BufferAttribute(L1,4));g.setAttribute('aL2',new THREE.BufferAttribute(L2,4));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='Vent country: the hot pools and the mud pots';scene.add(m);return m;})();
_onLight.push(m=>{GROUNDU.uNight.value=m==='night'?1:0;});
_mark('ground');
