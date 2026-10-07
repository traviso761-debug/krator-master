// ================================================================= HOST — the glacier's ice, waters and caves
// As RECORDS first (README.md), then drawn. The lake (milky with rock flour) and the river's braids (flowing DOWN the
// flank); the icefall's seracs and the icebergs in the lake; on the shelf the ice towers (frozen steam round the
// fumaroles), the ice caves (shells of ice the steam has hollowed: a mouth toward the valley, lit blue through their walls,
// warm inside: the mat, moss, glow mushrooms, a few lamp caps: the warm living spots) and an ice arch; and the steam.
const GLACIER={lake:{level:LAKE.level},caves:CAVES.map(C=>({x:C.x,z:C.z,R:C.R,H:C.H,face:C.face,life:0})),towers:TOWERS.length,fumaroles:FUMS.length,seracs:0,bergs:0,arch:{x:ARCH.x,z:ARCH.z,span:ARCH.span}};
const lin=h=>new THREE.Color(h).convertSRGBToLinear();

// ---------------------------------------------------------------- the waters
const WATERU={uT:{value:0},uLight:{value:1}};
const MAT_LAKE=new THREE.ShaderMaterial({fog:true,side:THREE.DoubleSide,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,WATERU,{uSun:{value:new THREE.Vector3(...SUN_POS).normalize()}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;','void main(){vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;uniform vec3 uSun;varying vec3 vWP;',
  'void main(){vec3 n=normalize(vec3(0.015*sin(vWP.x*0.21+uT*0.6)+0.01*sin(vWP.z*0.37-uT*0.4),1.0,0.015*cos(vWP.z*0.19+uT*0.5)));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-max(dot(n,V),0.0),0.0,1.0),3.0);',
  ' vec3 col=mix(vec3(0.30,0.58,0.62),vec3(0.80,0.88,0.94),0.1+fr*0.6);col+=pow(max(dot(n,normalize(uSun+V)),0.0),140.0)*0.6;',
  ' gl_FragColor=vec4(col*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
// the river: grey-green meltwater, streaked; v runs DOWNSTREAM along each ribbon and the streaks move down it with time
const MAT_RIVER=new THREE.ShaderMaterial({fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,WATERU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec2 aF;varying vec2 vF;','void main(){vF=aF;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT,uLight;varying vec2 vF;',
  'void main(){float s=sin(vF.y*0.35-uT*3.2+sin(vF.x*9.0)*1.5)*0.5+0.5,s2=sin(vF.y*0.9-uT*5.0+vF.x*14.0)*0.5+0.5;',
  ' vec3 col=mix(vec3(0.42,0.56,0.58),vec3(0.78,0.86,0.88),0.25*s+0.25*s2*s);col=mix(col,vec3(0.86,0.9,0.92),smoothstep(0.75,1.0,abs(vF.x*2.0-1.0))*0.5);',
  ' gl_FragColor=vec4(col*uLight,1.0);','#include <fog_fragment>','}'].join('\n')});
['uT','uLight'].forEach(k=>{MAT_LAKE.uniforms[k]=WATERU[k];MAT_RIVER.uniforms[k]=WATERU[k];});
[MAT_LAKE,MAT_RIVER].forEach(m=>{m.uniforms.fogColor.value=scene.fog.color;m.uniforms.fogDensity.value=scene.fog.density;});
TICKS.push(dt=>{WATERU.uT.value+=dt;});
// the lake: a grid over its basin at the level (what the ground or the ice covers does not show)
(function(){const pos=[],idx=[],D=8,pu0=TERM.u0-20,pu1=GL.SNOUT+280,pp0=TERM.p0-TERM.W0*1.4,pp1=TERM.p0+TERM.W0*1.4,nu=Math.ceil((pu1-pu0)/D),np=Math.ceil((pp1-pp0)/D);const id=new Int32Array((nu+1)*(np+1)).fill(-1);
 const vid=(i,j)=>{const k=i*(np+1)+j;if(id[k]<0){const c=upAt(pu0+i*D,pp0+j*D);id[k]=pos.length/3;pos.push(c[0],LAKE.level,c[1]);}return id[k];};
 for(let i=0;i<nu;i++)for(let j=0;j<np;j++){const c=upAt(pu0+(i+.5)*D,pp0+(j+.5)*D);if(lakeAt(c[0],c[1])<.12)continue;const a=vid(i,j),b=vid(i+1,j),cc=vid(i+1,j+1),d=vid(i,j+1);idx.push(a,d,b,b,d,cc);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 const m=new THREE.Mesh(g,MAT_LAKE);m.userData.probeSkip=true;m.userData.inspectLabel=LAKE.name;m.renderOrder=1;scene.add(m);})();
// the river's braids: a ribbon down each, a little above its cut bed
(function(){const pos=[],F=[],idx=[];let n=0;
 BRAIDS.forEach((B,bi)=>{let run=false,v=0,prev=null;
  for(let u=BREACH_U+12;u>-TERR.R*1.05;u-=6){const sp=braidSp(u),hw=B.hw*(bi?sp:1);if(bi&&hw<.8){run=false;continue;}
   const p=riverC(u)+B.o(u)*(bi?sp:1),c=upAt(u,p),y=RIV(u),l=upAt(u,p-hw-3.6),r=upAt(u,p+hw+3.6);   // out to where the bank rises through the waterif(prev)v+=Math.hypot(c[0]-prev[0],c[1]-prev[1]);prev=c;
   pos.push(l[0],y,l[1],r[0],y,r[1]);F.push(0,v,1,v);if(run)idx.push(n-2,n-1,n,n-1,n+1,n);n+=2;run=true;}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aF',new THREE.Float32BufferAttribute(F,2));g.setIndex(idx);
 const m=new THREE.Mesh(g,MAT_RIVER);m.userData.probeSkip=true;m.userData.inspectLabel='The meltwater river (flowing down the flank)';m.renderOrder=1;m.material.side=THREE.DoubleSide;scene.add(m);})();

// ---------------------------------------------------------------- the ice: seracs, icebergs, ice towers
const ICECLEAR=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('throne','ground.iceclear');if(!P)return null;const t=KMAT.textures(P,{aniso:4}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const ICE_MAT=BIO.solidMat(ICECLEAR);   // the owner's clear ice (the instance colour tints it)
const ICEC=[0xd8e8f4,0xc4dcee,0xb0d0ea,0xe4eef6,0x9cc4e4];
// a serac: a block of ice, its faces broken, its top chiselled to a slant (the vertices of one point moved together, so the
// faces stay closed)
BIO.def('serac',(function(){const g=new THREE.BoxGeometry(1,1,1,3,4,3),p=g.attributes.position,J={};reseed(8611);
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);if(!J[k])J[k]=[rr(-.13,.13),rr(-.1,.1),rr(-.13,.13)];const j=J[k],t=y+.5;
  p.setXYZ(i,x*(1-.3*t)+j[0],t+j[1]-.35*t*(x+.5),z*(1-.2*t)+j[2]);}g.computeVertexNormals();return g;})(),ICE_MAT,{label:'Seracs and icebergs'});
// an ice tower: a rough chimney of frozen steam, wider at its foot, lumpy (each ring pushed in and out by angle and height)
BIO.def('icetower',(function(){const g=new THREE.LatheGeometry([[2.2,0],[2.0,.1],[1.6,.3],[1.3,.5],[1.05,.7],[.8,.88],[.55,.97],[.32,1.0],[.2,1.0]].map(q=>new THREE.Vector2(q[0]/2.2,q[1])),14),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+.22*Math.sin(a*3+y*7)+.12*Math.sin(a*5-y*13);p.setXYZ(i,x*k,y,z*k);}g.computeVertexNormals();return g;})(),ICE_MAT,{label:'Ice towers (frozen steam)'});
(function(){reseed(8612);
 // the seracs: blocks and towers of ice tumbling down the icefall, standing on the ice
 const flow=Math.atan2(DN[1],DN[0]);
 for(let u=1300;u<1725&&GLACIER.seracs<340;u+=rr(11,17))for(let aw=-.84;aw<.84;aw+=rr(.025,.06)){if(rng()<.35)continue;const uu=u+rr(-2,2),c=upAt(uu,GL.pg(uu)+aw*GL.W(uu));if(iceAt(c[0],c[1])<8)continue;
  const s=rr(4,11)*(1-.4*Math.abs(aw)),h=s*rr(.8,1.8);BIO.put('serac',[c[0],terrainH(c[0],c[1])-h*.3,c[1]],qEuler(rr(-.12,.12),-flow+rr(-.35,.35),rr(-.45,.15)),[s,h,s*rr(.5,.9)],C3(pick(ICEC)));GLACIER.seracs++;}
 // the icebergs: calved from the snout, floating near it
 for(let k=0;k<400&&GLACIER.bergs<16;k++){const u=rr(GL.SNOUT-160,GL.SNOUT-10),p=TERM.p0+rr(-1,1)*TERM.W0*.8,c=upAt(u,p);if(lakeAt(c[0],c[1])<.6||terrainH(c[0],c[1])>LAKE.level-1)continue;
  const s=rr(2,7);BIO.put('serac',[c[0],LAKE.level-s*.35,c[1]],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*rr(.5,.9),s*rr(.6,1)],C3(pick(ICEC)));GLACIER.bergs++;}
 // the ice towers
 TOWERS.forEach(T=>{const y=terrainH(T.x,T.z);BIO.put('icetower',[T.x,y-.4,T.z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[T.r,T.h,T.r],C3(pick(ICEC)).multiplyScalar(rr(.95,1.05)));});
})();
function C3(h){return new THREE.Color(h);}

// ---------------------------------------------------------------- the ice caves
// A shell of ice: a dome (its outer face ice-white, rough), hollow, its mouth an arch cut on the side toward the valley; the
// inner face lit blue through the ice (deeper blue away from the mouth, scalloped as melt-caves are), a rim where the two meet
const CAVE_OUT=new THREE.MeshLambertMaterial({color:ICECLEAR?0xffffff:0xd8e8f4,map:ICECLEAR,side:THREE.DoubleSide}),ARCH_MAT=new THREE.MeshPhongMaterial({color:ICECLEAR?0xffffff:0xc8def0,map:ICECLEAR,specular:0x6688aa,shininess:40,flatShading:true});
const CAVE_IN=new THREE.ShaderMaterial({fog:true,side:THREE.DoubleSide,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uNight:{value:0}}]),
 vertexShader:['#include <fog_pars_vertex>','attribute float aD;varying float vD;varying vec3 vWP;','void main(){vD=aD;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uNight;varying float vD;varying vec3 vWP;',
  'void main(){float sc=0.5+0.5*sin(vWP.x*1.7+sin(vWP.y*2.3)*1.5)*sin(vWP.z*1.9+sin(vWP.x*1.1));',
  ' vec3 day=mix(vec3(0.62,0.86,0.98),vec3(0.06,0.26,0.52),smoothstep(0.0,1.0,vD))*(0.82+0.3*sc);',
  ' vec3 night=mix(vec3(0.10,0.26,0.30),vec3(0.03,0.10,0.18),vD)*(0.8+0.3*sc)+vec3(0.05,0.14,0.10)*(1.0-vD);',
  ' gl_FragColor=vec4(mix(day,night,uNight),1.0);','#include <fog_fragment>','}'].join('\n')});
CAVE_IN.uniforms.fogColor.value=scene.fog.color;CAVE_IN.uniforms.fogDensity.value=scene.fog.density;
function caveShell(C){const NT=48,NP=14,TH=.16,po=[],pi=[],di=[];reseed(8620+Math.round(C.R));
 const jit=[];for(let i=0;i<=NT;i++){jit[i]=[];for(let j=0;j<=NP;j++)jit[i][j]=(i===NT?jit[0][j]:1+.12*(fbm(i*.35,j*.4,8621+C.R,2)-.5)*2);}
 const P=(i,j,s)=>{const th=i/NT*TAU,ph=j/NP*Math.PI/2,r=C.R*jit[i][j]*s,y=C.H*Math.cos(ph)*(s<1?.92:1);return[C.x+Math.cos(th)*Math.sin(ph)*r,C.floor-.6+y+(j===NP?0:0),C.z+Math.sin(th)*Math.sin(ph)*r];};
 const inMouth=(i,j)=>{const th=(i+.5)/NT*TAU,ph=(j+.5)/NP;let d=Math.abs(((th-C.face)%TAU+TAU+Math.PI)%TAU-Math.PI);const lo=.32;   // ph: 0 the top, 1 the ground; the arch opens below lo
  if(ph<lo)return false;return d<C.mouth*Math.PI*Math.sqrt(clamp((ph-lo)/(1-lo),0,1));};
 const depth=(i,j)=>{const th=i/NT*TAU;return clamp(Math.abs(((th-C.face)%TAU+TAU+Math.PI)%TAU-Math.PI)/Math.PI,0,1);};
 const tri=(arr,a,b,c)=>{arr.push(...a,...b,...c);};
 for(let i=0;i<NT;i++)for(let j=0;j<NP;j++){if(inMouth(i,j))continue;
  const a=P(i,j,1),b=P(i+1,j,1),c=P(i+1,j+1,1),d=P(i,j+1,1);tri(po,a,c,b);tri(po,a,d,c);
  const A=P(i,j,1-TH),B=P(i+1,j,1-TH),Cc=P(i+1,j+1,1-TH),D=P(i,j+1,1-TH);tri(pi,A,B,Cc);tri(pi,A,Cc,D);di.push(depth(i,j),depth(i+1,j),depth(i+1,j+1),depth(i,j),depth(i+1,j+1),depth(i,j+1));
  // the rim: wherever a neighbour is the mouth, close the gap between the faces
  const rim=(o0,o1,i0,i1,k0,k1)=>{tri(pi,o0,o1,i1);tri(pi,o0,i1,i0);di.push(k0,k1,k1,k0,k1,k0);};
  if(i>0&&inMouth(i-1,j)||i===0&&inMouth(NT-1,j))rim(a,d,A,D,depth(i,j),depth(i,j+1));
  if(inMouth((i+1)%NT,j))rim(b,c,B,Cc,depth(i+1,j),depth(i+1,j+1));
  if(j<NP-1&&inMouth(i,j+1))rim(d,c,D,Cc,depth(i,j+1),depth(i+1,j+1));}
 const go=new THREE.BufferGeometry();go.setAttribute('position',new THREE.Float32BufferAttribute(po,3));{const uv=[];for(let k=0;k<po.length;k+=3){const dx=po[k]-C.x,dz=po[k+2]-C.z;uv.push((Math.atan2(dz,dx)/TAU+.5)*C.R*.35,(po[k+1]-C.floor)*.12);}go.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));}go.computeVertexNormals();
 const gi=new THREE.BufferGeometry();gi.setAttribute('position',new THREE.Float32BufferAttribute(pi,3));gi.setAttribute('aD',new THREE.Float32BufferAttribute(di,1));gi.computeVertexNormals();
 const mo=new THREE.Mesh(go,CAVE_OUT),mi=new THREE.Mesh(gi,CAVE_IN);mo.userData.inspectLabel=mi.userData.inspectLabel=C.name;scene.add(mo);scene.add(mi);
 REGISTER({name:C.name,x:C.x,z:C.z,y:C.floor-1,r:C.R*1.15,h:C.H+4,cave:CAVES.indexOf(C)});}
CAVES.forEach(caveShell);
// the warm floors inside: the mat, moss, glow mushrooms (the pack's), brain caps and a few small lamp caps: Krator's own
// life at -30 outside, warm and lit inside
(function(){reseed(8630);const P=THRONE.PAL,GS=THRONE.LIB.cardsOf('glowshroom'),prev=BIO.kit('throne'),cur=BIO.cur;BIO.cur='throne/floor';   // the kit's items: in its registry
 CAVES.forEach((C,ci)=>{let n=0;const used=[];   // each thing on the floor clear of the others (they clipped)
  const inside=(r)=>{r=r||.6;for(let k=0;k<12;k++){const a=rr(0,TAU),d=C.R*.72*Math.sqrt(rng()),x=C.x+Math.cos(a)*d,z=C.z+Math.sin(a)*d;if(used.every(q=>Math.hypot(q[0]-x,q[1]-z)>q[2]+r)){used.push([x,z,r]);return[x,z];}}const a=rr(0,TAU),d=C.R*.72;return[C.x+Math.cos(a)*d,C.z+Math.sin(a)*d];};
  for(let k=0;k<12;k++){const [x,z]=inside(),R=rr(1.2,3);BIO.put('mat',[x,C.floor+.04,z],qEuler(0,rr(0,TAU),0),[R,1,R],C3(pick(P.mat)));n++;}
  for(let k=0;k<24;k++){const s=rr(.5,1.1),[x,z]=inside(s);BIO.put('mossclump',[x,C.floor+s*.12,z],qEuler(0,rr(0,TAU),0),[s,s*.4,s],THRONE.LIB.mossclump?null:C3(pick(P.moss||[0x3a5a2a])),{n:[0,1,0]});n++;}
  for(let k=0;k<16;k++){const s=rr(.3,.7),[x,z]=inside(s*1.2);BIO.put('brain',[x,C.floor-.05,z],qEuler(0,rr(0,TAU),0),[s,s*.7,s],C3(pick(P.brain)));n++;}
  if(GS.length)for(let k=0;k<36;k++){const s=rr(.3,.65),[x,z]=inside(s*.8);BIO.put(pick(GS),[x,C.floor,z],qEuler(0,rr(0,TAU),0),[s,s,s],null);n++;}
  for(let k=0;k<9;k++){const h=rr(.8,1.8),s=rr(.3,.55),[x,z]=inside(s*1.1);BIO.beam('rod',[x,C.floor-.1,z],[x,C.floor+h,z],.04,.03,C3(pick(P.lampStem)));BIO.put('lamp',[x,C.floor+h,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s,s],C3(pick(P.lamp)));n++;}
  GLACIER.caves[ci].life=n;});BIO.cur=cur;BIO.kit(prev);})();
// the ice arch: a bowed span of ice over the shelf (the owner's reference board, refs/02)
(function(){const R0=ARCH.span/2,g=new THREE.TorusGeometry(R0,ARCH.tube,12,48,Math.PI),p=g.attributes.position;reseed(8640);
 // each ring of the tube pushed out from its own centre: thick at the feet, thinner over the top, lumpy all along; the
 // span then raised to its rise
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),t=Math.atan2(y,x),cx=Math.cos(t)*R0,cy=Math.sin(t)*R0,
   k=(1+.9*Math.pow(1-Math.sin(t),2))*(1+.35*(fbm(x*.18+3,y*.18+z*.25,8641,2)-.5)*2);
  p.setXYZ(i,cx+(x-cx)*k,(cy+(y-cy)*k)*(ARCH.rise/R0),z*k);}
 g.computeVertexNormals();const m=new THREE.Mesh(g,ARCH_MAT);const y=terrainH(ARCH.x,ARCH.z)-ARCH.tube*.8;m.position.set(ARCH.x,y,ARCH.z);m.rotation.y=-ARCH.a;m.userData.inspectLabel=ARCH.name;scene.add(m);
 REGISTER({name:ARCH.name,x:ARCH.x,z:ARCH.z,y:y-2,r:ARCH.span*.7,h:ARCH.rise+6,arch:true});})();

// ---------------------------------------------------------------- the steam
// the fumaroles breathe tall plumes (they freeze into the towers); a wisp from each tower's top; a little at the caves' mouths
const STEAMU={uT:{value:0},uScale:{value:innerHeight*.5},uCol:{value:new THREE.Color(0xf2f4f6)}};
const STEAM_MAT=new THREE.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,STEAMU]),
 vertexShader:['#include <fog_pars_vertex>','attribute vec4 aS;uniform float uT,uScale;varying float vA;',
  'void main(){float ph=fract(uT*aS.y+aS.x);vec3 p=position+vec3(sin(ph*6.0+aS.x*9.0)*aS.z*0.4+ph*aS.z*2.5,ph*aS.w,cos(ph*5.0+aS.x*7.0)*aS.z*0.4+ph*aS.z*1.2);',
  ' vec4 mvPosition=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mvPosition;gl_PointSize=uScale*aS.z*(0.6+ph*2.2)/max(1.0,-mvPosition.z);',
  ' vA=smoothstep(0.0,0.12,ph)*(1.0-ph)*0.5;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform vec3 uCol;varying float vA;',
  'void main(){vec2 q=gl_PointCoord-0.5;float r=length(q);if(r>0.5)discard;gl_FragColor=vec4(uCol,vA*smoothstep(0.5,0.1,r));','#include <fog_fragment>','}'].join('\n')});
STEAM_MAT.uniforms.fogColor.value=scene.fog.color;STEAM_MAT.uniforms.fogDensity.value=scene.fog.density;
['uT','uScale','uCol'].forEach(k=>STEAM_MAT.uniforms[k]=STEAMU[k]);
(function(){reseed(8650);const P=[],A=[];
 const add=(x,z,y,n,size,rise,rate)=>{for(let i=0;i<n;i++){P.push(x+rr(-1.2,1.2),y,z+rr(-1.2,1.2));A.push(rng(),rate*rr(.8,1.2),size*rr(.7,1.3),rise*rr(.7,1.3));}};
 FUMS.forEach(F=>add(F.x,F.z,terrainH(F.x,F.z),Math.round(14+16*F.s),5+4*F.s,30+30*F.s,.06));
 TOWERS.forEach(T=>{if(T.fum)add(T.x,T.z,terrainH(T.x,T.z)+T.h,4,1.6,8,.1);});
 CAVES.forEach(C=>{const x=C.x+Math.cos(C.face)*C.R*.95,z=C.z+Math.sin(C.face)*C.R*.95;add(x,z,C.floor+C.H*.55,6,2.5,10,.07);});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('aS',new THREE.Float32BufferAttribute(A,4));
 const pts=new THREE.Points(g,STEAM_MAT);pts.frustumCulled=false;pts.userData.probeSkip=true;pts.renderOrder=2;scene.add(pts);})();
TICKS.push(dt=>{STEAMU.uT.value+=dt;STEAMU.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
_onLight.push(m=>{const n=m==='night';STEAMU.uCol.value.setHex(n?0x40444c:0xf2f4f6);WATERU.uLight.value=n?.2:1;CAVE_IN.uniforms.uNight.value=n?1:0;});
OBSTACLES.push(...CAVES.map(C=>({x:C.x,z:C.z,r:C.R*1.1})),...TOWERS.map(T=>({x:T.x,z:T.z,r:T.r*1.2})),{x:ARCH.x,z:ARCH.z,r:ARCH.span*.6});
_mark('layout');
