// ================================================================= HOST — the ground (the geyser basin)
// Three meshes, one material: the map at 5 m, the basin's floor at 2 m and the Stair at 0.8 m (the terraces' rims are a
// metre wide), the coarse one with holes where the fine ones lie and the fine ones skirted so no seam shows. Each vertex
// carries the kit's thermal record (GEYSER.at) in byte attributes: heat, sinter, film (the run-off's sheet of water),
// acid, the flow's direction, dead, mud, terrace, sand, steam vents, meadow; and its macro colour and how rocky it is.
// The shader lays the library's ground layers by those (materials.json: litter under the jungle, the thermal meadow's
// grass and moss, rock on the walls, black sand on the beach, the sinter, the Stair's travertine, the acid field's clay,
// the mud) through a stochastic sampler (GEYSER.GLSL_LAY), then the THERMOPHILE MATS by the temperature: none over
// ~73 degC (the sinter bare and wet), yellow-green to ~63, orange to ~52, orange-brown, then brown-olive as the water
// cools, in streamers drawn out along the flow (and fanned out round the springs). The film shines and ripples down the
// flow; on the Stair the band each fragment lies in gives its pool's level, so the pools fill in the shader itself (no
// water mesh) and the water sheets down the curtains between them.
REGISTER({name:BASIN.name,x:BASIN.x,z:BASIN.z,y:20,r:Math.max(BASIN.rx,BASIN.rz),h:120});
LAYOUT.flats.forEach(f=>{if(f.key==='neck'||f.key==='acidflat')return;REGISTER({name:f.name,x:f.x,z:f.z,y:landH(f.x,f.z)-6,r:Math.max(f.rx,f.rz)*.9,h:80,flat:f.key});});
LAYOUT.dead.forEach(d=>REGISTER({name:d.name,x:d.x,z:d.z,y:landH(d.x,d.z)-6,r:d.r*.8,h:60,dead:d.key}));
{const z=(STAIR.z0+shoreZ(STAIR.x0))/2;REGISTER({name:STAIR.name,x:stairX(z),z,y:-4,r:(shoreZ(STAIR.x0)-STAIR.z0)/2,h:60,stair:true});}

// ---------------------------------------------------------------- the paint (per vertex)
const K=hx=>new THREE.Color(hx);
const PAINT={LITTER:K(0x3a3426),LITTER2:K(0x2e2a1e),MEADOW:K(0x5e5a36),ROCK:K(0x5e5a52),SAND:K(0x302e2c),SEABED:K(0x3c3a32),GRAVEL:K(0x6a6252),
 DEAD:K(0xb4b0a4),CLAY:K(0xe4dccc),OCHRE:K(0xc89448)};
const _c=new THREE.Color();
const GA={};   // scratch for one vertex's attributes
function paintAt(x,z,y,slope){const g=GEYSER.at(x,z,landH(x,z)),c=creekAt(x,z),sz=shoreZ(x),fl=Math.max(basinK(x,z),stairK(x,z));
 const n=fbm(x*.02,z*.02,4701,2)-.5,n2=fbm(x*.004,z*.004,4702,2);
 _c.copy(PAINT.LITTER).lerp(PAINT.LITTER2,clamp(.5+n*1.6,0,1));
 const meadow=smooth(.3,.6,fl)*(1-g.sinter)*(1-g.acid)*(1-g.dead)*(1-g.terr),sand=Math.max(smooth(sz-34,sz-12,z)*smooth(3,.3,y),z>sz?1:0);
 if(meadow>0)_c.lerp(PAINT.MEADOW,meadow*(.7+.3*n2));
 const rock=smooth(.55,.8,slope)*(1-sand);
 _c.lerp(PAINT.ROCK,rock);
 const bed=smooth(c.w+3,c.w-1,c.d);if(bed>0)_c.lerp(PAINT.GRAVEL,bed*.8);
 if(sand>0)_c.lerp(y<-.5?PAINT.SEABED:PAINT.SAND,sand);
 if(g.dead>0)_c.lerp(PAINT.DEAD,g.dead*.6);
 if(g.acid>0)_c.lerp(_c.clone().copy(PAINT.CLAY).lerp(PAINT.OCHRE,smooth(-.1,.25,n+(n2-.5)*.6)),g.acid*.9);
 GA.r=_c.r;GA.g=_c.g;GA.b=_c.b;GA.rock=rock;
 GA.heat=g.heat;GA.sinter=g.sinter*(1-sand);GA.film=g.film;GA.acid=g.acid;GA.dx=g.dx;GA.dz=g.dz;GA.dead=g.dead;GA.mud=g.mud;
 GA.terr=g.terr;GA.sand=Math.max(sand,bed*.7);GA.vent=g.vent;GA.grass=meadow*(1-rock);GA.pl=g.pl;
 return GA;}

// ---------------------------------------------------------------- the layers (the library, or procedural without it)
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2),c=fbm(x/5,y/5,7.5,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=c*255;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
// key: the layer; [procedural colour (sRGB), how strongly the detail map shows]
const GL_KEYS={litter:[0x3a3426,.6],grass:[0x5a6034,.5],moss:[0x4a6a2a,.45],rock:[0x5e5a52,.7],sand:[0x2e2c2a,.4],sinter:[0xdcd8cc,.35],
 tufa:[0xe8e4da,.4],clay:[0xe0d6c4,.35],mud:[0x6a6052,.4],mat:[0xc87a30,.3]};
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k in GL_KEYS){const P=KMAT.packed('geyser','ground.'+k);if(P)o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const GRU={uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xc8d4d4)},uLight:{value:1}};
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uMacro={value:TEX_MACRO};Object.assign(sh.uniforms,GRU);
 const lib=k=>GLAY&&GLAY[k];
 for(const k in GL_KEYS)if(lib(k))sh.uniforms['uG_'+k]={value:GLAY[k].map};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aC,aT,aU,aW;attribute vec2 aPL;varying vec4 vC,vT,vU,vW;varying vec2 vPL;varying vec3 vGWP;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vC=aC;vT=aT;vU=aU;vW=aW;vPL=aPL;');
 const libKeys=Object.keys(GL_KEYS).filter(lib);
 const L=k=>{const P=GL_KEYS[k];if(lib(k))return'_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt)';const c=new THREE.Color(P[0]).convertSRGBToLinear();
  return'(vec3('+c.r.toFixed(4)+','+c.g.toFixed(4)+','+c.b.toFixed(4)+')*mix(1.0,dt.r*1.08,'+P[1].toFixed(2)+'))';};
 let decl='uniform sampler2D uDetail,uMacro;uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec4 vC,vT,vU,vW;varying vec2 vPL;varying vec3 vGWP;'+
  (libKeys.length?'uniform sampler2D '+libKeys.map(k=>'uG_'+k).join(',')+';':'')+GEYSER.GLSL_LAY+
  // the mats' colour by the heat (0..1 of 33..100 degC): clear water over ~73, yellow-green, orange, orange-brown, brown-olive
  'vec3 _matCol(float h){vec3 c=vec3(0.36,0.32,0.14);c=mix(c,vec3(0.56,0.3,0.1),smoothstep(0.1,0.17,h));c=mix(c,vec3(0.85,0.46,0.12),smoothstep(0.25,0.32,h));'+
  'c=mix(c,vec3(0.86,0.72,0.2),smoothstep(0.42,0.47,h));c=mix(c,vec3(0.66,0.74,0.36),smoothstep(0.5,0.55,h));return pow(c,vec3(2.2));}';
 const body='vec3 _E=vec3(0.0);{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);vec3 dt=texture2D(uDetail,p*0.13).rgb;'+
  'float rock=vC.a,heat=vT.x,sin_=vT.y,film=vT.z,acid=vT.w,dead=vU.z,mud=vU.w,terr=vW.x,sand=vW.y,vent=vW.z,grass=vW.w;'+
  'vec3 base=pow(vC.rgb,vec3(2.2));vec3 c=mix('+L('litter')+',base,0.35);'+
  'c=mix(c,'+L('grass')+'*mix(vec3(1.0),base*3.0,0.3),grass*0.9);'+
  'c=mix(c,'+L('moss')+',grass*smoothstep(0.03,0.09,heat)*(1.0-smoothstep(0.2,0.32,heat))*0.8);'+
  'c=mix(c,'+L('rock')+',rock);c=mix(c,'+L('sand')+'*mix(vec3(1.0),base*4.0,0.25),sand);'+
  'c=mix(c,'+L('sinter')+'*vec3(0.78,0.76,0.72),dead*0.7);c=mix(c,'+L('sinter')+'*mix(vec3(0.74,0.72,0.68),vec3(1.0,0.98,0.94),smoothstep(0.25,0.75,texture2D(uMacro,p*0.011).g+dt.r*0.2-0.1)),sin_);'+
  'c=mix(c,'+L('tufa')+'*vec3(1.04,1.02,0.98),terr);'+
  'c=mix(c,'+L('clay')+'*mix(vec3(1.0),base*1.4,0.6),acid*0.9);c=mix(c,'+L('mud')+',mud*0.95);'+
  // a steam vent's ground: sulphur yellow, rust round it
  'c=mix(c,mix(vec3(0.42,0.12,0.03),vec3(0.75,0.6,0.08),smoothstep(0.5,0.9,vent)),smoothstep(0.08,0.4,vent)*0.75);'+
  // THE MATS: where the warm water lies or runs; streamers drawn out along the flow (fanned out round a spring)
  '{vec2 fd=vU.xy*2.0-1.0;float fl=length(fd);vec2 d=fl>0.05?fd/fl:vec2(1.0,0.0),pp=vec2(-d.y,d.x);float s=dot(p,d),t=dot(p,pp);'+
  'float st=texture2D(uMacro,vec2(t*0.21,s*0.012)).b*0.7+texture2D(uMacro,vec2(t*0.06,s*0.004)).g*0.6-0.65;'+
  'float h=heat+st*0.09*smoothstep(0.05,0.3,fl);float w=max(film,terr*0.3)*(1.0-smoothstep(0.55,0.62,h))*smoothstep(0.015,0.06,h)*(0.75+0.25*fl);'+
  'vec3 m=_matCol(h)*(0.75+0.5*texture2D(uMacro,vec2(t*0.5,s*0.03)).b)'+(lib('mat')?'*mix(vec3(1.0),'+L('mat')+'*2.2,0.45)':'')+';'+
  'c=mix(c,m,clamp(w*1.5,0.0,1.0)*0.94);'+
  // the film: wet, dark, shining, rippling down the flow; the hottest a little blue-white
  'float wet=clamp(film,0.0,1.0)*(1.0-sand);c*=1.0-0.25*wet;c=mix(c,pow(vec3(0.62,0.78,0.82),vec3(2.2)),wet*smoothstep(0.55,0.75,heat)*0.35);'+
  'vec3 V=normalize(cameraPosition-vGWP);float rp=sin(s*3.1-uT*5.0+t*0.7)*0.5+sin(s*7.3-uT*8.0)*0.25;vec3 N=normalize(vec3(d.x*rp*0.08,1.0,d.y*rp*0.08));'+
  'float sp=pow(max(dot(N,normalize(uSun+V)),0.0),90.0);float fr=pow(1.0-max(V.y,0.0),4.0);_E+=wet*(sp*0.55*vec3(1.0,0.95,0.85)+fr*0.12*uSky)*uLight;}'+
  // THE STAIR's pools: the band this fragment lies in and its pool's level; under it, water (turquoise where hot, greener
  // as it cools) over the floor; on a curtain, the water sheeting down
  'if(terr>0.97){float lev=vPL.x,spread=vPL.y-lev*lev,dep=vPL.x>-50.0?lev-vGWP.y:-1.0;vec3 V=normalize(cameraPosition-vGWP);'+
  ' vec3 fn=normalize(cross(dFdx(vGWP),dFdy(vGWP)));if(fn.y<0.0)fn=-fn;float steep=1.0-fn.y;'+
  // a pool: the triangle wholly in one pool (no spread of level across it) and under that pool's level
  ' if(dep>0.0&&spread<0.02){vec3 wc=mix(vec3(0.2,0.48,0.36),vec3(0.18,0.56,0.62),smoothstep(0.05,0.25,heat));wc=mix(wc,vec3(0.3,0.7,0.8),smoothstep(0.3,0.5,heat));'+
  '  float a=smoothstep(0.0,0.35,dep);c=mix(c*0.55,pow(wc,vec3(2.2))*0.5,a*0.9);vec3 N=normalize(vec3(0.02*sin(p.x*1.3+uT*1.1)+0.015*sin(p.y*2.1-uT*0.9),1.0,0.02*cos(p.y*1.1+uT)));'+
  '  float fr=0.02+0.5*pow(1.0-max(dot(N,V),0.0),5.0);_E+=(fr*uSky*0.2+pow(max(dot(N,normalize(uSun+V)),0.0),160.0)*0.9*vec3(1.0,0.95,0.85))*uLight;}'+
  // a wall: fluted, draped with drip ridges running down it (stripes across the face, none down it), the water sheeting over
  ' else if(steep>0.35){float fl=smoothstep(0.35,0.7,steep),k=dot(p,normalize(vec2(-fn.z,fn.x)));float fx=texture2D(uMacro,vec2(k*0.21,vGWP.y*0.004)).b;'+
  '  float rib=0.5+0.5*sin(k*7.0+fx*9.0),rib2=0.5+0.5*sin(k*23.0+fx*17.0);c=mix(c,vec3(0.8,0.79,0.76)*(0.82+0.18*rib),fl*0.65);c*=mix(1.0,0.78+0.3*rib*rib2+0.1*rib,fl);'+
  '  c=mix(c,c*vec3(0.8,0.7,0.58),fl*smoothstep(0.62,0.85,fx)*(1.0-smoothstep(0.1,0.35,heat))*0.7);'+
  '  float str=smoothstep(0.6,1.0,texture2D(uMacro,vec2(k*0.35,vGWP.y*0.08+uT*0.12)).b+0.15*sin(vGWP.y*9.0+uT*7.0));_E+=fl*str*0.12*vec3(0.95,0.98,1.0)*uLight;}}'+
'diffuseColor.rgb=c;}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=_E;');};
TICKS.push(dt=>{GRU.uT.value+=dt;});
_onLight.push(m=>{GRU.uLight.value=m==='night'?.2:1;});

// ---------------------------------------------------------------- the meshes
// a grid from (x0,z0) to (x1,z1) at cs; hole(x0,z0,x1,z1) drops a cell; skirt hangs the border 1.5 m down
const PATCHES=[{name:'The basin floor',x0:-680,z0:-680,x1:680,z1:330,cs:2},{name:'The Stair',x0:-200,z0:330,x1:320,z1:870,cs:.8}];
function groundMesh(x0,z0,x1,z1,cs,label,hole,skirt){const nx=Math.round((x1-x0)/cs),nz=Math.round((z1-z0)/cs),W=nx+1,NV=W*(nz+1),NS=skirt?2*(nx+nz):0,N=NV+NS;
 const pos=new Float32Array(N*3),nor=new Float32Array(N*3),aC=new Uint8Array(N*4),aT=new Uint8Array(N*4),aU=new Uint8Array(N*4),aW=new Uint8Array(N*4),aPL=new Float32Array(N*2);
 const H=new Float32Array(NV);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)H[j*W+i]=terrainH(x0+i*cs,z0+j*cs);
 const hAt=(i,j)=>(i>=0&&i<=nx&&j>=0&&j<=nz)?H[j*W+i]:terrainH(x0+i*cs,z0+j*cs);
 const b=v=>Math.round(clamp(v,0,1)*255);
 const put=(k,x,z,y,i,j)=>{const hx=hAt(i+1,j)-hAt(i-1,j),hz=hAt(i,j+1)-hAt(i,j-1),l=Math.hypot(hx,2*cs,hz);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;nor[k*3]=-hx/l;nor[k*3+1]=2*cs/l;nor[k*3+2]=-hz/l;
  const A=paintAt(x,z,y,clamp(Math.hypot(hx,hz)/(2*cs),0,1));
  aC[k*4]=b(A.r);aC[k*4+1]=b(A.g);aC[k*4+2]=b(A.b);aC[k*4+3]=b(A.rock);
  aT[k*4]=b(A.heat);aT[k*4+1]=b(A.sinter);aT[k*4+2]=b(A.film);aT[k*4+3]=b(A.acid);
  aU[k*4]=b(A.dx*.5+.5);aU[k*4+1]=b(A.dz*.5+.5);aU[k*4+2]=b(A.dead);aU[k*4+3]=b(A.mud);
  aW[k*4]=b(A.terr);aW[k*4+1]=b(A.sand);aW[k*4+2]=b(A.vent);aW[k*4+3]=b(A.grass);aPL[k*2]=A.pl;aPL[k*2+1]=A.pl*A.pl;};
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)put(j*W+i,x0+i*cs,z0+j*cs,H[j*W+i],i,j);
 const idx=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){if(hole&&hole(x0+i*cs,z0+j*cs,x0+(i+1)*cs,z0+(j+1)*cs))continue;const a=j*W+i,bb=a+W,c=bb+1,d=a+1;idx.push(a,bb,d,bb,c,d);}
 if(skirt){const ring=[];for(let i=0;i<nx;i++)ring.push(i);for(let j=0;j<nz;j++)ring.push(j*W+nx);for(let i=nx;i>0;i--)ring.push(nz*W+i);for(let j=nz;j>0;j--)ring.push(j*W);
  ring.forEach((v,r)=>{const k=NV+r;for(let c=0;c<3;c++){pos[k*3+c]=pos[v*3+c];nor[k*3+c]=nor[v*3+c];}pos[k*3+1]-=1.5;
   for(let c=0;c<4;c++){aC[k*4+c]=aC[v*4+c];aT[k*4+c]=aT[v*4+c];aU[k*4+c]=aU[v*4+c];aW[k*4+c]=aW[v*4+c];}aPL[k*2]=-100;aPL[k*2+1]=1e4;});
  for(let r=0;r<ring.length;r++){const a=ring[r],b2=ring[(r+1)%ring.length],sa=NV+r,sb=NV+(r+1)%ring.length;idx.push(a,sa,b2,b2,sa,sb);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
 g.setAttribute('aC',new THREE.BufferAttribute(aC,4,true));g.setAttribute('aT',new THREE.BufferAttribute(aT,4,true));g.setAttribute('aU',new THREE.BufferAttribute(aU,4,true));
 g.setAttribute('aW',new THREE.BufferAttribute(aW,4,true));g.setAttribute('aPL',new THREE.BufferAttribute(aPL,2));
 g.setIndex(N>65535?new THREE.BufferAttribute(new Uint32Array(idx),1):idx);
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel=label;scene.add(m);return m;}
const GROUND=(function(){const S=TERR.R*2.2,inP=(a,b,c,d)=>PATCHES.some(P=>a>=P.x0-.01&&b>=P.z0-.01&&c<=P.x1+.01&&d<=P.z1+.01);
 const out=[groundMesh(-S/2,-S/2,S/2,S/2,5,'The Steampits: the jungle plateau and the coast',inP,false)];
 PATCHES.forEach(P=>out.push(groundMesh(P.x0,P.z0,P.x1,P.z1,P.cs,P.name,null,true)));return out;})();
_mark('ground');
