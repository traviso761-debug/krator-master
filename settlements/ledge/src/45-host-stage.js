// ================================================================= HOST — stage: the renderer, the lights, Ledge's own ground
// The page's frame is the layout's (PLAN.md 9.2): x east along the face, z south out of it, y metres above sea level.
//
// THE GROUND is LEDGE.groundAt (31-ledge-rules.js): the head's bench, the face the Ancients dressed sheer, the apron and the lake's
// bed, the natural rift-fill cliff beyond the dressed face and the escarpment easing up to the tableland. Meshed on two grids:
// the near one (|x|, |z| < 3 km) with columns every 6 m along the face and rows every 8 m, a pair of rows either side of the dressed
// face and the quay so both stand sheer; the far one (to 12 km, 200 m cells) for the escarpment, the north shore and the lake.
// KDRAWN gets the near grid's triangles (the eye check measures what is drawn).
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xb9c4c8,.00005);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,60000);
const hemi=new THREE.HemisphereLight(0xd6e2e4,0x6a5e50,.66);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,1.3);sun.position.set(-2600,4200,3600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xbfd2ff,.25);fill.position.set(2000,1500,-2600);scene.add(fill);
/* the kit's night switch (kits/ancients 92-camera.js): no night state here yet */
let NIGHT=false;
const LEDGE_H=(x,z)=>LEDGE.groundAt(LEDGE_LAYOUT,x,z);

// THE ROCK: core/terrain KSTRATA's rift-fill beds (the 'rift-redbeds' recipe: the basin fill's red beds, drawn halfway to a warm tan) laid level, on every
// steep face of the ground; the library's grain over them (materials.json: bedded gypsum on the natural cliff, the drill-marked cut
// on the dressed face and the benches; turf on the high flats, gravelly sand on the low ones), triplanar in world metres. The
// colour of a flat is its vertex colour; a face's is the strata's. aDress (1 on the Ancients' dressed face and apron) picks the grain.
const LEDGE_ROCK=(function(){const G=LEDGE_LAYOUT.ground;
 const ST=KSTRATA.shade({recipe:'rift-redbeds',seed:4373,range:[G.lake-200,G.top],dip:[0,0,1],warp:[3,.8]},{THREE});
 const GREY=new THREE.DataTexture(new Uint8Array([120,120,120,255]),1,1);GREY.needsUpdate=true;
 const lib=n=>{const E=(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('ledge',n):null;return E?{t:KMAT.textures(E,{aniso:8}).map,s:1/(E.scale||[8,8])[0]}:{t:GREY,s:.1};};
 const m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
 m.onBeforeCompile=sh=>{ST.inject(sh);const W=lib('cliffWall'),D=lib('faceDressed'),T=lib('turf'),S=lib('shore');
  Object.assign(sh.uniforms,{uW:{value:W.t},uWs:{value:W.s},uD:{value:D.t},uDs:{value:D.s},uT:{value:T.t},uTs:{value:T.s},uS:{value:S.t},uSs:{value:S.s}});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aDress;varying float vDress;').replace('#include <begin_vertex>','#include <begin_vertex>\nvDress=aDress;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uW,uD,uT,uS;uniform float uWs,uDs,uTs,uSs;varying float vDress;')
   .replace('#include <color_fragment>',['#include <color_fragment>',
    '{vec3 nn=normalize(vSWN),n=abs(nn);float sx=n.x/(n.x+n.z+1e-4),up=smoothstep(.55,.85,nn.y);',
    ' vec3 gw=texture2D(uW,vSWP.zy*uWs).rgb*sx+texture2D(uW,vSWP.xy*uWs).rgb*(1.0-sx);',
    ' vec3 gd=texture2D(uD,vSWP.zy*uDs).rgb*sx+texture2D(uD,vSWP.xy*uDs).rgb*(1.0-sx);',
    ' vec3 wall=mix(gw,gd,vDress),flt=mix(texture2D(uS,vSWP.xz*uSs).rgb,texture2D(uT,vSWP.xz*uTs).rgb,smoothstep(330.0,420.0,vSWP.y));',
    ' flt=mix(flt,texture2D(uD,vSWP.xz*uDs).rgb,vDress);',
    ' float l=dot(mix(wall,flt,up),vec3(.333)),g=mix(1.0,clamp(pow(l/.47,1.3),.45,1.6),.6);',
    ' vec3 rock=mix(mix(strataColor(vSWP,vSWN),vec3(.62,.52,.42),.45),vec3(.74,.70,.63),vDress);',
    ' diffuseColor.rgb=mix(rock,diffuseColor.rgb,up)*g;}'].join('\n'));};
 m.customProgramCacheKey=()=>'ledge-rock';
 return {ST,mat:m};})();

const LEDGE_GROUND=(function(){const G=LEDGE_LAYOUT.ground,PG=G.page;
 // columns and rows: the near grid's lines (with the sheer pairs); the far grid's every 200 m, skipping the near square
 const xs=[];for(let x=-PG;x<=PG+.01;x+=(Math.abs(x)<1000?6:30))xs.push(x);
 const zs=new Set();for(let z=-PG;z<=PG+.01;z+=(z>-1000&&z<700?8:30))zs.add(Math.round(z*100)/100);
 [-.05,.05,G.quay-.05,G.quay+.05].forEach(z=>zs.add(z));
 const ZS=[...zs].sort((a,b)=>a-b);
 const nx=xs.length,nz=ZS.length,NV=nx*nz,P=new Float32Array(NV*3),C=new Float32Array(NV*3),Dr=new Float32Array(NV);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=xs[i],z=ZS[j],k=j*nx+i,a=Math.abs(x);
  // the sheer pair on the dressed face: the row north of the face takes the head, the row south the apron (groundAt's z <= 0 is rock)
  const y=LEDGE_H(x,z);P[k*3]=x;P[k*3+1]=y;P[k*3+2]=z;
  Dr[k]=a<G.dressed-10&&z>-30&&z<=G.quay+.1&&y<G.head-1?1:0;}
 const I=[];for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;I.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();
 // the colours of the flats (the faces take the strata in the shader): the head's turf (montane grass, a little dry on the bench),
 // the apron's pale Ancient paving, the shore's gravel, the lake's bed; KRAND's noise by position
 const N=g.attributes.normal;
 for(let k=0;k<NV;k++){const x=P[k*3],y=P[k*3+1],z=P[k*3+2],n=KRAND.fbm(x/70,y/50,z/70,3,4374);let r,gg,b;
  if(Dr[k]&&y<G.apron+.5&&y>G.apron-.5){r=.74+.05*n;gg=.72+.05*n;b=.68+.04*n;}
  else if(y<G.lake-.5){r=.42;gg=.40;b=.33;}
  else if(y<G.lake+30){r=.58+.06*n;gg=.53+.05*n;b=.43;}
  else if(y<1400){r=.36+.08*n;gg=.44+.07*n;b=.25;}
  else{r=.42+.08*n;gg=.47+.06*n;b=.29;}
  C[k*3]=Math.pow(r,2.2);C[k*3+1]=Math.pow(gg,2.2);C[k*3+2]=Math.pow(b,2.2);}
 g.setAttribute('color',new THREE.BufferAttribute(C,3));g.setAttribute('aDress',new THREE.BufferAttribute(Dr,1));
 const m=new THREE.Mesh(g,LEDGE_ROCK.mat);m.name='ground';m.userData.ground=true;m.userData.probeSkip=true;scene.add(m);
 if(typeof KDRAWN!=='undefined')KDRAWN.add(KDRAWN.mesh(Array.from(P),I,null,{cell:40}));
 // the far ring: 200 m cells to the far edge, its cells inside the near square left out (the near grid draws them)
 const F=G.far,st=200,fx=[];for(let x=-F;x<=F+.01;x+=st)fx.push(x);
 const fn=fx.length,FP=new Float32Array(fn*fn*3),FC=new Float32Array(fn*fn*3),FD=new Float32Array(fn*fn),FI=[];
 for(let j=0;j<fn;j++)for(let i=0;i<fn;i++){const x=fx[i],z=fx[j],k=j*fn+i,y=LEDGE_H(x,z),n=KRAND.fbm(x/900,0,z/900,3,4375);FP[k*3]=x;FP[k*3+1]=y-(Math.abs(x)<PG&&Math.abs(z)<PG?0:0);FP[k*3+2]=z;
  const r=y<G.lake?.42:y<2400?.34+.06*n:.48+.08*n,gg=y<G.lake?.40:y<2400?.42+.06*n:.47+.06*n,b=y<G.lake?.33:y<2400?.24:.36;
  FC[k*3]=Math.pow(r,2.2);FC[k*3+1]=Math.pow(gg,2.2);FC[k*3+2]=Math.pow(b,2.2);}
 for(let j=0;j<fn-1;j++)for(let i=0;i<fn-1;i++){if(fx[i]>=-PG&&fx[i+1]<=PG&&fx[j]>=-PG&&fx[j+1]<=PG)continue;const a=j*fn+i,b=a+1,c=a+fn,d=c+1;FI.push(a,c,b,b,c,d);}
 const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.BufferAttribute(FP,3));fg.setIndex(FI);fg.computeVertexNormals();
 fg.setAttribute('color',new THREE.BufferAttribute(FC,3));fg.setAttribute('aDress',new THREE.BufferAttribute(FD,1));
 const fm=new THREE.Mesh(fg,LEDGE_ROCK.mat);fm.name='ground far';fm.userData.ground=true;fm.userData.probeSkip=true;scene.add(fm);
 return {near:m,far:fm,verts:NV+fn*fn};})();
