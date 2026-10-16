// ================================================================= HOST — the ground (the isle)
// A 5 m grid over the island and its reef, with finer patches where the detail is small (the vent's field at 2 m, the
// tide-pool bench at 0.8 m, the salt pan at 2 m, the gardens at 1.5 m); the coarse grid holed under them and the fine
// ones skirted. Each vertex carries its surface weights in byte attributes and the shader lays the library's ground
// layers by them (materials.json: sand, wet sand, the savanna's green and cured grass, the burn, the steppe's red soil,
// the salt crust, the mangal's mud, the forest's litter, the reef rock, the gardens' soil; the geyser kit's sinter)
// through the geyser kit's stochastic sampler (GEYSER.GLSL_LAY). The burn mosaic is the kit's (RINGISLES.burnAge), so
// the ground under a burnt patch of grass is black where the grass is. SEAGRASS meadows darken the lagoon's sand in the
// kit's own meadow pattern (a stand-in for the owner's lagoon floor: KNOWN_ISSUES.md). The vent's field paints its
// sinter, run-off film and thermophile mats by the geyser kit's record (GEYSER.at), as the geyser kit's own host does.
REGISTER({name:'The island (a Ring Sea isle)',x:-200,z:50,y:-40,r:1900,h:300});
REGISTER({name:BAY.name+' (mangroves on the mud, seagrass and coral heads inside the reef)',x:BAY.x,z:BAY.z,y:-4,r:BAY.r,h:30,bay:true});
REGISTER({name:BENCH.name,x:BENCH.x,z:BENCH.z,y:-1,r:BENCH.r,h:12,bench:true});
REGISTER({name:PAN.name,x:PAN.x,z:PAN.z,y:-1,r:PAN.rx,h:12,pan:true});
REGISTER({name:VENT.name,x:VENT.x,z:VENT.z,y:landH(VENT.x,VENT.z)-6,r:VENT.r*1.2,h:80,vent:true});
REGISTER({name:GARDEN.name,x:GARDEN.x,z:GARDEN.z,y:landH(GARDEN.x,GARDEN.z)-10,r:170,h:40,garden:true});
REGISTER({name:GARDEN2.name,x:GARDEN2.x,z:GARDEN2.z,y:landH(GARDEN2.x,GARDEN2.z)-14,r:90,h:50,garden:true});

// ---------------------------------------------------------------- the paint (per vertex)
const K=hx=>new THREE.Color(hx);
const PAINT={LITTER:K(0x3a3426),SAND:K(0xd8ccae),SEABED:K(0xb8b090),MUD:K(0x4a4032),RED:K(0x8a5a3e),GRASS:K(0x5e6a34),CURED:K(0xa89660),ROCK:K(0x8a8676)};
const _c=new THREE.Color();
const GA={};   // scratch for one vertex's attributes
const meadow=(x,z)=>smooth(.35,.6,fbm(x*.012,z*.012,7601,2));   // the kit's seagrass meadows (60-biome-ringisles-floor.js)
function paintAt(x,z,y,slope){const F=n=>FIELD[n](x,z),w=waterH(x,z),dep=w-y;
 const kXA=F('koppen:XA'),kAf=F('koppen:Af'),kAm=F('koppen:Am'),kAw=F('koppen:Aw'),kXV=F('koppen:XV'),kBSh=F('koppen:BSh'),kXS=F('koppen:XS');
 const forest=kXA+kAf+kAm,sav=kAw+kXV,step=kBSh+kXS,beach=F('beach'),dune=F('dune'),mangal=F('mangal'),reef=F('reef'),bench=F('bench'),pan=F('pan'),garden=F('garden');
 const sb=sav+step,B=sb>.02?RINGISLES.burnState(RINGISLES.burnAge(x,z)):{black:0,flush:0,green:0,cured:0};
 const under=smooth(-.2,.4,dep),sd=coastD(x,z);
 const n=fbm(x*.02,z*.02,4701,2)-.5;
 // the base: the macro colour under the layers (the class's soil)
 _c.copy(PAINT.LITTER).lerp(PAINT.RED,clamp(step,0,1)).lerp(PAINT.CURED,clamp(sav*.6,0,1));
 const sand=clamp(Math.max(beach,dune*.85,smooth(-6,-25,sd)*(1-reef)*(1-mangal)),0,1),mud=clamp(mangal*(1-reef),0,1);
 if(sand>0)_c.lerp(dep>.1?PAINT.SEABED:PAINT.SAND,sand);if(mud>0)_c.lerp(PAINT.MUD,mud);
 const rock=clamp(smooth(.62,.85,slope)*(1-sand)+bench*.9,0,1);_c.lerp(PAINT.ROCK,rock*.6);
 GA.r=_c.r;GA.g=_c.g;GA.b=_c.b;GA.rock=rock;
 GA.sand=sand*(1-under);GA.wet=sand*under;GA.salt=pan;GA.mud=mud;
 GA.litter=forest*(1-sand)*(1-mud);GA.green=(sav*(B.flush+B.green)+step*B.green*.4)*(1-sand)*(1-mud);
 GA.cured=(sav*B.cured+step*(B.cured*.5))*(1-sand)*(1-mud);GA.burn=sb*B.black*(1-sand)*(1-mud);
 GA.steppe=step*(1-B.black)*(1-sand)*(1-mud)*(1-pan);GA.reef=Math.max(reef*(1-mangal),bench);GA.soil=garden;
 GA.grass=meadow(x,z)*F('lagoon');
 // the vent's field: the geyser kit's record
 if(nearVent(x,z)){const g=GEYSER.at(x,z,landH(x,z));GA.sinter=g.sinter;GA.heat=g.heat;GA.film=g.film;GA.acid=g.acid;GA.vent=g.vent;GA.dx=g.dx;GA.dz=g.dz;GA.gmud=g.mud;GA.dead=g.dead;}
 else{GA.sinter=0;GA.heat=0;GA.film=0;GA.acid=0;GA.vent=0;GA.dx=0;GA.dz=0;GA.gmud=0;GA.dead=0;}
 return GA;}

// ---------------------------------------------------------------- the layers (the library, or procedural without it)
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*40+(BIO.fn.h3(x,y,9)-.5)*26;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_MACRO=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,a=fbm(x/40,y/40,7.3,3),b=fbm(x/13,y/13,7.4,2),c=fbm(x/5,y/5,7.5,2);d[i]=a*255;d[i+1]=b*255;d[i+2]=c*255;d[i+3]=255;}g.putImageData(id,0,0);});
TEX_MACRO.wrapS=TEX_MACRO.wrapT=THREE.RepeatWrapping;TEX_MACRO.encoding=THREE.LinearEncoding;
// key: the layer; [procedural colour (sRGB), how strongly the detail map shows, the pack ('ringisles' or 'geyser')]
const GL_KEYS={litter:[0x3a3426,.6],sand:[0xd8ccae,.35],wetsand:[0xa89c7e,.35],grass:[0x5e6a34,.5],cured:[0xa89660,.5],burn:[0x24201c,.5],
 steppe:[0x8a5a3e,.45],salt:[0xece6da,.3],mud:[0x4a4032,.4],reef:[0x9a9482,.6],soil:[0x5a4630,.4],sinter:[0xdcd8cc,.35,'geyser']};
const GLAY=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const o={};
 for(const k in GL_KEYS){const P=KMAT.packed(GL_KEYS[k][2]||'ringisles','ground.'+k);if(P)o[k]={map:KMAT.textures(P,{aniso:8}).map,k:1/P.scale[0]};}return o;})();
const GRU={uT:{value:0},uSun:{value:new THREE.Vector3(...SUN_POS).normalize()},uSky:{value:new THREE.Color(0xc8d4d4)},uLight:{value:1}};
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uMacro={value:TEX_MACRO};Object.assign(sh.uniforms,GRU);
 const lib=k=>GLAY&&GLAY[k];
 for(const k in GL_KEYS)if(lib(k))sh.uniforms['uG_'+k]={value:GLAY[k].map};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aC,aT,aU,aW,aV;varying vec4 vC,vT,vU,vW,vV;varying vec3 vGWP;')
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vC=aC;vT=aT;vU=aU;vW=aW;vV=aV;');
 const libKeys=Object.keys(GL_KEYS).filter(lib);
 const L=k=>{const P=GL_KEYS[k];if(lib(k))return'_lay(uG_'+k+',p,q,'+GLAY[k].k.toFixed(4)+',mt)';const c=new THREE.Color(P[0]).convertSRGBToLinear();
  return'(vec3('+c.r.toFixed(4)+','+c.g.toFixed(4)+','+c.b.toFixed(4)+')*mix(1.0,dt.r*1.08,'+P[1].toFixed(2)+'))';};
 const decl='uniform sampler2D uDetail,uMacro;uniform float uT,uLight;uniform vec3 uSun,uSky;varying vec4 vC,vT,vU,vW,vV;varying vec3 vGWP;'+
  (libKeys.length?'uniform sampler2D '+libKeys.map(k=>'uG_'+k).join(',')+';':'')+GEYSER.GLSL_LAY+
  'vec3 _matCol(float h){vec3 c=vec3(0.36,0.32,0.14);c=mix(c,vec3(0.56,0.3,0.1),smoothstep(0.1,0.17,h));c=mix(c,vec3(0.85,0.46,0.12),smoothstep(0.25,0.32,h));'+
  'c=mix(c,vec3(0.86,0.72,0.2),smoothstep(0.42,0.47,h));c=mix(c,vec3(0.66,0.74,0.36),smoothstep(0.5,0.55,h));return pow(c,vec3(2.2));}';
 // aC: macro rgb, rock; aT: sand, wet sand, salt, mud; aU: litter, green, cured, burn; aW: steppe, reef, soil, seagrass;
 // aV: sinter, heat, film, acid (the vent's)
 const body='vec3 _E=vec3(0.0);{vec2 p=vGWP.xz,q=mat2(0.799,-0.602,0.602,0.799)*p;float mt=smoothstep(0.3,0.7,texture2D(uMacro,p*0.0061).r);vec3 dt=texture2D(uDetail,p*0.13).rgb;'+
  'float rock=vC.a;vec3 base=pow(vC.rgb,vec3(2.2));vec3 c=mix('+L('litter')+'*vec3(0.62,0.6,0.46),base,0.3);'+
  'c=mix(c,'+L('steppe')+'*mix(vec3(1.0),base*2.4,0.3),vW.x);'+
  'c=mix(c,'+L('grass')+'*mix(vec3(1.0),base*2.0,0.2),vU.y);'+
  'c=mix(c,'+L('cured')+',vU.z);'+
  'c=mix(c,'+L('burn')+',vU.w);'+
  'c=mix(c,'+L('litter')+'*vec3(0.62,0.6,0.46),vU.x*(1.0-vU.y-vU.z)*0.85);'+
  'c=mix(c,'+L('soil')+',vW.z);'+
  'c=mix(c,'+L('salt')+',vT.z);'+
  'c=mix(c,'+L('mud')+',vT.w);'+
  'c=mix(c,'+L('reef')+',vW.y);'+
  'c=mix(c,'+L('sand')+',vT.x);'+
  'c=mix(c,'+L('wetsand')+'*vec3(0.42,0.5,0.46),vT.y);'+
  // the seagrass meadows: blades combed by the current, dark green over the lagoon's sand (stand-in: KNOWN_ISSUES.md)
  '{float sg=texture2D(uMacro,vec2(p.x*0.35,p.y*0.05)).b*0.6+texture2D(uMacro,p*0.09).g*0.6;c=mix(c,pow(vec3(0.16,0.26,0.12),vec3(2.2))*(0.7+0.6*sg),vW.w*smoothstep(0.35,0.6,sg)*0.9);}'+
  'c=mix(c,c*0.7+vec3(0.02,0.02,0.01),rock*0.3);'+
  // the vent's field (the geyser kit's record): sinter, its mats by the heat on the film, acid clay
  'c=mix(c,'+L('sinter')+'*vec3(0.78,0.76,0.72),vV.x);'+
  '{float heat=vV.y,film=vV.z;float st=texture2D(uMacro,p*0.21).b*0.7-0.35;float w=film*(1.0-smoothstep(0.55,0.62,heat+st*0.09))*smoothstep(0.015,0.06,heat);'+
  'c=mix(c,_matCol(heat+st*0.09)*(0.75+0.5*texture2D(uMacro,p*0.3).b),clamp(w*1.5,0.0,1.0)*0.9);c*=1.0-0.25*film;'+
  'c=mix(c,pow(vec3(0.88,0.84,0.74),vec3(2.2)),vV.w*0.85);'+
  'vec3 V=normalize(cameraPosition-vGWP);float sp=pow(max(dot(vec3(0.0,1.0,0.0),normalize(uSun+V)),0.0),90.0);_E+=film*sp*0.4*vec3(1.0,0.95,0.85)*uLight;}'+
  'diffuseColor.rgb=c;}';
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+decl).replace('#include <map_fragment>','#include <map_fragment>\n'+body)
  .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n totalEmissiveRadiance+=_E;');};
TICKS.push(dt=>{GRU.uT.value+=dt;});
_onLight.push(m=>{GRU.uLight.value=m==='night'?.2:1;});

// ---------------------------------------------------------------- the meshes
const PATCHES=[{name:'The vent\'s field',x0:VENT.x-340,z0:VENT.z-340,x1:VENT.x+340,z1:VENT.z+340,cs:2},
 {name:'The tide-pool bench',x0:Math.round(BENCH.x-180),z0:Math.round(BENCH.z-180),x1:Math.round(BENCH.x+180),z1:Math.round(BENCH.z+180),cs:.8},
 {name:'The salt pan',x0:PAN.x-420,z0:PAN.z-280,x1:PAN.x+420,z1:PAN.z+280,cs:2},
 {name:'The village gardens',x0:GARDEN.x-200,z0:GARDEN.z-200,x1:GARDEN.x+200,z1:GARDEN.z+200,cs:1.5},
 {name:'The upper gardens',x0:GARDEN2.x-110,z0:GARDEN2.z-110,x1:GARDEN2.x+110,z1:GARDEN2.z+110,cs:1.5}];
// the patches snapped to the coarse grid so the holes fit them
const CS0=5;PATCHES.forEach(P=>{['x0','z0'].forEach(k=>P[k]=Math.floor(P[k]/CS0)*CS0);['x1','z1'].forEach(k=>P[k]=Math.ceil(P[k]/CS0)*CS0);});
function groundMesh(x0,z0,x1,z1,cs,label,hole,skirt){const nx=Math.round((x1-x0)/cs),nz=Math.round((z1-z0)/cs),W=nx+1,NV=W*(nz+1),NS=skirt?2*(nx+nz):0,N=NV+NS;
 const pos=new Float32Array(N*3),nor=new Float32Array(N*3),aC=new Uint8Array(N*4),aT=new Uint8Array(N*4),aU=new Uint8Array(N*4),aW=new Uint8Array(N*4),aV=new Uint8Array(N*4);
 const H=new Float32Array(NV);for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)H[j*W+i]=terrainH(x0+i*cs,z0+j*cs);
 const hAt=(i,j)=>(i>=0&&i<=nx&&j>=0&&j<=nz)?H[j*W+i]:terrainH(x0+i*cs,z0+j*cs);
 const b=v=>Math.round(clamp(v,0,1)*255);
 const put=(k,x,z,y,i,j)=>{const hx=hAt(i+1,j)-hAt(i-1,j),hz=hAt(i,j+1)-hAt(i,j-1),l=Math.hypot(hx,2*cs,hz);
  pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;nor[k*3]=-hx/l;nor[k*3+1]=2*cs/l;nor[k*3+2]=-hz/l;
  const A=paintAt(x,z,y,clamp(Math.hypot(hx,hz)/(2*cs),0,1));
  aC[k*4]=b(A.r);aC[k*4+1]=b(A.g);aC[k*4+2]=b(A.b);aC[k*4+3]=b(A.rock);
  aT[k*4]=b(A.sand);aT[k*4+1]=b(A.wet);aT[k*4+2]=b(A.salt);aT[k*4+3]=b(A.mud+A.gmud);
  aU[k*4]=b(A.litter);aU[k*4+1]=b(A.green);aU[k*4+2]=b(A.cured);aU[k*4+3]=b(A.burn);
  aW[k*4]=b(A.steppe);aW[k*4+1]=b(A.reef);aW[k*4+2]=b(A.soil);aW[k*4+3]=b(A.grass);
  aV[k*4]=b(Math.max(A.sinter,A.dead*.6));aV[k*4+1]=b(A.heat);aV[k*4+2]=b(A.film);aV[k*4+3]=b(A.acid);};
 for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++)put(j*W+i,x0+i*cs,z0+j*cs,H[j*W+i],i,j);
 const idx=[];
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){if(hole&&hole(x0+i*cs,z0+j*cs,x0+(i+1)*cs,z0+(j+1)*cs))continue;const a=j*W+i,bb=a+W,c=bb+1,d=a+1;idx.push(a,bb,d,bb,c,d);}
 if(skirt){const ring=[];for(let i=0;i<nx;i++)ring.push(i);for(let j=0;j<nz;j++)ring.push(j*W+nx);for(let i=nx;i>0;i--)ring.push(nz*W+i);for(let j=nz;j>0;j--)ring.push(j*W);
  ring.forEach((v,r)=>{const k=NV+r;for(let c=0;c<3;c++){pos[k*3+c]=pos[v*3+c];nor[k*3+c]=nor[v*3+c];}pos[k*3+1]-=1.5;
   for(let c=0;c<4;c++){aC[k*4+c]=aC[v*4+c];aT[k*4+c]=aT[v*4+c];aU[k*4+c]=aU[v*4+c];aW[k*4+c]=aW[v*4+c];aV[k*4+c]=aV[v*4+c];}});
  for(let r=0;r<ring.length;r++){const a=ring[r],b2=ring[(r+1)%ring.length],sa=NV+r,sb=NV+(r+1)%ring.length;idx.push(a,sa,b2,b2,sa,sb);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));
 g.setAttribute('aC',new THREE.BufferAttribute(aC,4,true));g.setAttribute('aT',new THREE.BufferAttribute(aT,4,true));g.setAttribute('aU',new THREE.BufferAttribute(aU,4,true));
 g.setAttribute('aW',new THREE.BufferAttribute(aW,4,true));g.setAttribute('aV',new THREE.BufferAttribute(aV,4,true));
 g.setIndex(N>65535?new THREE.BufferAttribute(new Uint32Array(idx),1):idx);
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel=label;scene.add(m);return m;}
const GROUND=(function(){const inP=(a,b,c,d)=>PATCHES.some(P=>a>=P.x0-.01&&b>=P.z0-.01&&c<=P.x1+.01&&d<=P.z1+.01);
 const out=[groundMesh(TERR.X0+100,TERR.Z0+50,TERR.X1-100,TERR.Z1-50,CS0,'The island, its lagoon and its reef',inP,false)];
 PATCHES.forEach(P=>out.push(groundMesh(P.x0,P.z0,P.x1,P.z1,P.cs,P.name,null,true)));return out;})();
_mark('ground');

// ---------------------------------------------------------------- the small waters: the tide pools and the brine pools
const MAT_POOL=new THREE.MeshLambertMaterial({color:0x4a7a78,transparent:true,opacity:.55,depthWrite:false,emissive:0x0a1a18});
const MAT_BRINE=new THREE.MeshLambertMaterial({color:0xc8a8a0,transparent:true,opacity:.7,depthWrite:false,emissive:0x1a1010});
POOLS.concat(BRINE).forEach((P,i)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(P.r*1.02,24).rotateX(-Math.PI/2),i<POOLS.length?MAT_POOL:MAT_BRINE);
 m.position.set(P.x,P.level,P.z);m.renderOrder=2;m.userData.probeSkip=true;m.userData.inspectLabel=i<POOLS.length?'A tide pool':'A brine pool (pink with its algae: the salt works\' first pans)';scene.add(m);});
_onLight.push(m=>{MAT_POOL.emissive.setHex(m==='night'?0x020404:0x0a1a18);MAT_BRINE.emissive.setHex(m==='night'?0x040202:0x1a1010);});
