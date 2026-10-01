// ================================================================= HOST — stage (Shade)
// Renderer, lights, haze, the climate fields the biome zones itself by, the
// flora mask (the places are reserved here, before the biome runs), BIO.init,
// the painted ground and the water. Positions all come from 44-host-layout.
// The sun must stay at (-1000,1150,-560): 82-host-sky paints it there.
var SEDESERT_WATER={hue:0.45};          // the travertine pool's turquoise; the reeds' accents and the blooms follow it
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
// the inspector's registry: {name,cls,x,z,y,r,h,tags}; cls is 'flora','fauna','place','water','terrain'
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd9c3a6);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00036);   // the map is 2.6 km, not the kit's 6.8: the far ground fades by 4 km
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,16000);
scene.add(new THREE.HemisphereLight(0xc8d4e4,0x6a4030,.58));
const sun=new THREE.DirectionalLight(0xfff2dc,1.55);sun.position.set(-1000,1150,-560);scene.add(sun);
const fill=new THREE.DirectionalLight(0xd8b8a0,.22);fill.position.set(900,300,900);scene.add(fill);

// ---------------------------------------------------------------- the climate fields
// The biome reads ten fields (BIOME-API.md). Shade's: the basin floor and the
// canyon floor are 'canyon' (the riparian floor), their faces the benches, the
// band back from the lip the rim; the pool is the oasis; the plateau is scrub
// with badland patches; the mesas are the only upland.
function fieldsAt(x,z,h,slope){
 const d=basinD(x,z),W=wallW(x,z),inB=smooth(2,-2,d),wt=clamp(d/W,0,1);
 const canyon=d<=0?1:d>=W?0:1-smooth(0,1,wt);
 const rim=smooth(0,4,d-W)*(1-smooth(25,45,d-W));
 const dS=x>POOL.x-2?Math.abs(z-zS(x)):1e9,dU=x<=BASIN.x0?Math.abs(z-zU(x)):1e9,dp=Math.hypot(x-POOL.x,z-POOL.z);
 const oasis=smooth(48,16,dp)*inB;
 const flow=clamp(Math.max(smooth(14,3,dS)*inB,smooth(12,2.5,dU),smooth(26,13,dp)*inB),0,1)*(h-waterH(x,z)<3.5?1:.4);
 let wet=Math.max(.06,inB*.5,.95*smooth(34,3,dS)*inB,oasis*.95,.75*smooth(26,3,dU));wet*=1-.3*slope;
 const bad=smooth(.58,.7,fbm(x*.0012+9,z*.0012+4,61,2))*(1-inB)*smooth(40,120,d);
 const mesa=clamp((mesaH(x,z)-12)/30,0,1);
 const rock=clamp(Math.max(bad,smooth(.3,.62,slope)*.9),0,1);
 return{wet:clamp(wet,0,1),flow,upland:mesa*.55,canyon,rim,rock,dune:0,oasis,slope,abyss:0,mtn:0,
  strata:smooth(.15,.6,rock),crack:smooth(.5,.95,oasis)*smooth(.6,.2,flow)*.6};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','mtn','strata','crack'];
// one cache, 4.5 m cells over the whole map (the kit's is 19 m: its canyon is 250 m wide, this one's walls are 2 m)
const FC=(function(){const N=640,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the flora mask (reserve before you build)
// 0 where nothing may root: under the water, inside every reserved place (a
// 3 m margin), on the switchback. The flora pass runs before any building, so
// a place not reserved here would find itself planted over.
const MASKBOX={x0:-140,z0:-190,x1:160,z1:100,c:1};
const RESERVED=PLACES.filter(p=>!p.grows);
const MASKR=(function(){const B=MASKBOX,nx=Math.round((B.x1-B.x0)/B.c)+1,nz=Math.round((B.z1-B.z0)/B.c)+1,m=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=B.x0+i*B.c,z=B.z0+j*B.c;let v=1;
  for(const p of RESERVED){v=Math.min(v,smooth(0,3,polyDist(p.poly,x,z)));if(v===0)break;}
  if(v>0){const n=swNear(x,z);if(n)v=Math.min(v,smooth(SWB.bank,SWB.bank+2.5,n.d));}
  m[j*nx+i]=v;}
 return{nx,nz,m};})();
function placeMask(x,z){const B=MASKBOX;if(x<B.x0||x>B.x1||z<B.z0||z>B.z1)return 1;
 const u=(x-B.x0)/B.c,v=(z-B.z0)/B.c,i=Math.min(MASKR.nx-2,Math.floor(u)),j=Math.min(MASKR.nz-2,Math.floor(v)),fu=u-i,fv=v-j,m=MASKR.m,k=j*MASKR.nx+i;
 return m[k]*(1-fu)*(1-fv)+m[k+1]*fu*(1-fv)+m[k+MASKR.nx]*(1-fu)*fv+m[k+MASKR.nx+1]*fu*fv;}
// nothing roots on a cliff: the faces are rock, not ground (the kit's dress() is for
// ledges). Analytic, from the shapes that make the cliffs, because the biome asks
// the mask millions of times and four height samples per ask stalled the build:
// every basin and canyon wall narrower than the switchback's slope, every mesa's
// face, the upper stream's cut banks; and the 4.5 m slope field for anything else.
function cliffMask(x,z){if(FC.at(FC.a.slope,x,z)>.9)return 0;let m=1;
 const d=basinD(x,z);if(d>-1.5){const W=wallW(x,z);if(W<40&&d<W+1.5)m=Math.min(m,Math.max(smooth(-.3,-1.5,d),smooth(W+.3,W+1.5,d)));}
 for(let i=0;i<MESAS.length;i++){const M=MESAS[i],dd=Math.hypot(x-M[0],z-M[1]);if(dd>M[2]*1.2)continue;const a=Math.atan2(z-M[1],x-M[0]),e=M[2]*(1+.07*Math.sin(3*a+i)+.045*Math.sin(7*a+2*i)+.03*Math.sin(13*a)),u=dd/e;
  m=Math.min(m,Math.max(smooth(.89,.85,u),smooth(1.0,1.05,u)));}
 if(x<=BASIN.x0){const dU=Math.abs(z-zU(x));if(dU<STREAM.upBank+1)m=Math.min(m,Math.max(smooth(STREAM.upHW,STREAM.upHW-.6,dU),smooth(STREAM.upBank,STREAM.upBank+1,dU)));}
 return m;}
function floraMask(x,z){const d=terrainH(x,z)-waterH(x,z),w=d<.15?0:d<.7?(d-.15)/.55:1;return w===0?0:Math.min(w,placeMask(x,z),cliffMask(x,z));}

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
const SPINE=[[POOL.x,POOL.z],[12,0],[120,0],[60,-150],[-400,zU(-400)],[420,zC(420)],[-60,-420],[250,300]];
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:floraMask,
 obstacles:OBSTACLES,ticks:tick,seed:23,origin:SPINE,center:[0,0],fields:FIELD,
 register:o=>REGISTER(Object.assign({cls:'flora'},o)),err:reportErr,
 lod:{hero:700,mid:1300,far:2000,floor:[450,1100]},
 windows:{water:[-TERR.R-100,-60,TERR.R+100,60]}});
BIO.setSun([-1000,1150,-560]);

// ---------------------------------------------------------------- the ground
// One mesh. Its grid is fine (1.25 m) over the settlement, where the walls are
// 2 m wide, and opens out geometrically to 4.2 km; the painted texture covers
// the field cache's square and clamps beyond it (the haze has the far ground).
const TEX_GROUND=BIO.canvasTex(1600,1600,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=FC.S;
 const c=new THREE.Color(),t=new THREE.Color();
 const RED1=new THREE.Color(0xa85a42),RED2=new THREE.Color(0x884834),PALE=new THREE.Color(0xc99a72),PAVE=new THREE.Color(0x6e4634),SCRUB=new THREE.Color(0x9e6a4c),
  BANDS=[new THREE.Color(0xb8683f),new THREE.Color(0x8f4f3a),new THREE.Color(0xd4a884),new THREE.Color(0xa4523a),new THREE.Color(0x7a4030),new THREE.Color(0xc98a5e)],
  SILT=new THREE.Color(0xb49a78),SILT2=new THREE.Color(0x9a8466),DAMP=new THREE.Color(0x5a5040),ALGA=new THREE.Color(0x6a7a48),TRAV=new THREE.Color(0xd8d0bc),
  EARTH=new THREE.Color(0xc6a07a),FURROW=new THREE.Color(0x6e6a3e),FURROW2=new THREE.Color(0x8a7a4a),TRAIL=new THREE.Color(0xd2b08a);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S;
  const n=fbm(x/24,y/24,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5);
  const wet=FC.at(FC.a.wet,wx,wz),flow=FC.at(FC.a.flow,wx,wz),can=FC.at(FC.a.canyon,wx,wz),oa=FC.at(FC.a.oasis,wx,wz);
  const pav=fbm(x/90+5,y/90-2,.7,2);
  c.copy(RED1).lerp(RED2,clamp(.5+n*1.8,0,1)).lerp(PALE,clamp(n2*.6+.25+.25*Math.sin(wx*.01+wz*.013),0,1)*.35).lerp(PAVE,smooth(.56,.7,pav)*.45);
  c.lerp(SCRUB,clamp(.35*smooth(.15,.45,wet),0,1));
  c.lerp(BANDS[1],FC.at(FC.a.strata,wx,wz)*.4);
  // the floor: pale silt, darker and greener toward the water, travertine white round the pool
  t.copy(SILT).lerp(SILT2,smooth(.55,.9,wet)).lerp(BANDS[1],smooth(.95,.5,can)*.6);c.lerp(t,smooth(.3,.8,can));
  c.lerp(DAMP,smooth(.55,.95,flow)*.75);c.lerp(ALGA,smooth(.85,1,flow)*.3);
  c.lerp(TRAV,smooth(.6,.95,oa)*smooth(.9,.4,flow)*.5);
  // the reserved ground: packed earth; the fields in furrows; the switchback a pale trail
  if(wx>MASKBOX.x0&&wx<MASKBOX.x1&&wz>MASKBOX.z0&&wz<MASKBOX.z1){const pm=1-placeMask(wx,wz);
   if(pm>0){let farm=false;for(const p of RESERVED)if(p.activities.indexOf('FARM')>=0&&polyHas(p.poly,wx,wz)){farm=true;break;}
    if(farm){const f=.5+.5*Math.sin(wz*2.4+Math.sin(wx*.05));t.copy(FURROW).lerp(FURROW2,f);c.lerp(t,pm*.85);}
    else{const n3=swNear(wx,wz);c.lerp(n3&&n3.d<SWB.bank+1?TRAIL:EARTH,pm*.7);}}}
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX_GROUND.wrapS=TEX_GROUND.wrapT=THREE.ClampToEdgeWrapping;
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*24;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_CRACK=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 g.strokeStyle='rgba(70,60,50,.6)';g.lineCap='round';
 const P=[];for(let i=0;i<16;i++)P.push([rng()*w,rng()*h]);
 for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])>w*.4)continue;if(rng()<.45)continue;
  g.lineWidth=rr(1.2,2.6);for(let k=-1;k<=1;k++)for(let m=-1;m<=1;m++){g.beginPath();g.moveTo(a[0]+k*w,a[1]+m*h);g.quadraticCurveTo((a[0]+b[0])/2+rr(-18,18)+k*w,(a[1]+b[1])/2+rr(-18,18)+m*h,b[0]+k*w,b[1]+m*h);g.stroke();}}});
// strata painted by the shader from world y (3.4 m bands), weighted per vertex by the rock field
const STRATA=[0xb8683f,0x8f4f3a,0xd4a884,0xa4523a,0x7a4030,0xc98a5e].map(h=>new THREE.Color(h).convertSRGBToLinear());
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xa89e94});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};sh.uniforms.uCrack={value:TEX_CRACK};sh.uniforms.uBands={value:STRATA};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;attribute float aCrack;attribute float aRock;varying float vCrack;varying float vRock;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vCrack=aCrack;vRock=aRock;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail,uCrack;uniform vec3 uBands[6];varying vec3 vGWP;varying float vCrack;varying float vRock;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 ck=texture2D(uCrack,vGWP.xz*0.14).rgb;'+
  'float bb=mod(floor(vGWP.y/3.4+0.3*dt2.r),6.0);vec3 bc=uBands[0];if(bb>0.5)bc=uBands[1];if(bb>1.5)bc=uBands[2];if(bb>2.5)bc=uBands[3];if(bb>3.5)bc=uBands[4];if(bb>4.5)bc=uBands[5];'+
  'diffuseColor.rgb=mix(diffuseColor.rgb,bc*(0.85+0.3*dt.r),vRock*0.9);'+
  'diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85)*mix(vec3(1.0),ck,vCrack);}');};
// the grid's coordinate at s in [0,1]: 1.25 m cells inside +-260 m, then growing to +-4.2 km
const GRID={N:560,inner:260,fi:416/560};
function gridX(s){const u=s*2-1,a=Math.abs(u);if(a<=GRID.fi)return u/GRID.fi*GRID.inner;
 const t=(a-GRID.fi)/(1-GRID.fi),lin=1.25*GRID.N*(1-GRID.fi)/2;   // the first outer cells are as fine as the inner ones
 return Math.sign(u)*(GRID.inner+lin*t+(TERR.GROUND-GRID.inner-lin)*Math.pow(t,2.4));}
const GROUND=(function(){const N=GRID.N,S=FC.S,g=new THREE.PlaneGeometry(1,1,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,uv=g.attributes.uv,ck=new Float32Array(p.count),rk=new Float32Array(p.count);
 for(let iy=0;iy<=N;iy++)for(let ix=0;ix<=N;ix++){const k=iy*(N+1)+ix,x=gridX(ix/N),z=gridX(iy/N);
  p.setXYZ(k,x,terrainH(x,z),z);uv.setXY(k,x/S+.5,.5-z/S);ck[k]=FC.at(FC.a.crack,x,z);rk[k]=FC.at(FC.a.strata,x,z);}
 g.setAttribute('aCrack',new THREE.BufferAttribute(ck,1));g.setAttribute('aRock',new THREE.BufferAttribute(rk,1));
 g.computeVertexNormals();g.computeBoundingSphere();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The ground';m.name='ground';scene.add(m);return m;})();

// ---------------------------------------------------------------- the water
// The streams are ribbons at their own descending surfaces, the pool a disc at
// POOL.y; one vertex-coloured ripple material (the kit's). The falls are a
// streaked curtain in front of the lip, with mist at the plunge.
const WHUE=SEDESERT_WATER.hue;
const WATER_SHALLOW=new THREE.Color().setHSL(WHUE,.55,.46),WATER_MID=new THREE.Color().setHSL(WHUE,.62,.30),WATER_DEEP=new THREE.Color().setHSL(WHUE,.6,.15),WATER_PALE=new THREE.Color().setHSL(WHUE-.03,.35,.62);
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1000,1150,-560).normalize()},uSky:{value:new THREE.Color(0xdfe6ec)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(120.0,420.0,dcam);',
  ' vec3 n=normalize(vec3(rk*(0.035*sin(vWP.x*0.31+uT*1.1)+0.02*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.035*cos(vWP.z*0.27+uT*0.9)+0.02*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(clamp(1.0-dot(n,V),0.0,1.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.10+fr*0.62);',
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.8*vec3(1.0,0.97,0.9);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
function waterColorAt(x,z,out){const h=terrainH(x,z),d=Math.max(0,waterH(x,z)-h),shoal=fbm(x*.05+2,z*.05-4,505,2);
 return out.copy(WATER_SHALLOW).lerp(WATER_PALE,Math.max(smooth(.5,.7,shoal)*smooth(1.2,.3,d),smooth(.5,.1,d)*.7)).lerp(WATER_MID,smooth(.8,2,d)).lerp(WATER_DEEP,smooth(2.2,3.8,d));}
// a ribbon along a centreline: rows every `step` metres, NW+1 vertices across 2*HW
function ribbon(x0,x1,step,cz,cy,HW,label){const pos=[],col=[],c=new THREE.Color(),NW=6,rows=[];
 for(let x=x0;x<=x1+1e-6;x+=step){const z0=cz(x),dz=(cz(x+.5)-cz(x-.5)),l=Math.hypot(1,dz),nx=-dz/l,nz=1/l,row=[];
  for(let k=0;k<=NW;k++){const o=(k/NW-.5)*2*HW,px=x+nx*o,pz=z0+nz*o;row.push(pos.length/3);waterColorAt(px,pz,c);c.convertSRGBToLinear();pos.push(px,cy(x),pz);col.push(c.r,c.g,c.b);}rows.push(row);}
 const idx=[];for(let r=0;r<rows.length-1;r++)for(let k=0;k<NW;k++){const a=rows[r][k],b=rows[r][k+1],cc=rows[r+1][k],dd=rows[r+1][k+1];idx.push(a,dd,cc,a,b,dd);}   // counter-clockwise seen from above: the face looks up
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel=label;m.userData.NW=NW;m.renderOrder=1;scene.add(m);return m;}
const WATER={};
// the lip's real edge: where the face drops below the upper stream's bed (the
// channel cuts a shelf across the top of the lip, so it is east of LIPX)
const LIPEDGE=(function(){for(let x=LIPX-1;x<BASIN.x0;x+=.02)if(terrainH(x,0)<WLU(x)-STREAM.bed-.05)return x;return LIPX;})();
WATER.upper=ribbon(-TERR.GROUND*.4,LIPEDGE-.05,3,zU,WLU,2.6,'The upper stream');
WATER.lower=ribbon(POOL.x+12,TERR.GROUND*.4,3,zS,WLL,3.4,'The lower stream');
(function(){const pos=[POOL.x,POOL.y,POOL.z],col=[],c=new THREE.Color(),PN=48,idx=[];waterColorAt(POOL.x,POOL.z,c);c.convertSRGBToLinear();col.push(c.r,c.g,c.b);
 for(let k=0;k<=PN;k++){const a=k/PN*TAU,r=POOL.r+2.5,x=POOL.x+Math.cos(a)*r,z=POOL.z+Math.sin(a)*r;pos.push(x,POOL.y,z);waterColorAt(POOL.x+Math.cos(a)*(POOL.r-1),POOL.z+Math.sin(a)*(POOL.r-1),c);c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}
 for(let k=0;k<PN;k++)idx.push(0,k+2,k+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The plunge pool';m.renderOrder=1;scene.add(m);WATER.pool=m;})();
// the falls: a curtain from the lip's notch to the pool, thrown a little clear of the face
const TEX_FALL=BIO.canvasTex(128,512,(g,w,h)=>{g.fillStyle='#ffffff';g.fillRect(0,0,w,h);
 for(let i=0;i<260;i++){const x=rng()*w,l=rr(40,200);g.strokeStyle='rgba('+(rng()<.5?'150,190,200':'255,255,255')+','+(.2+rng()*.5).toFixed(2)+')';g.lineWidth=rr(1,4);g.beginPath();g.moveTo(x,rng()*h);g.lineTo(x+rr(-3,3),rng()*h+l);g.stroke();}});
const MAT_FALL=new THREE.ShaderMaterial({fog:true,transparent:true,depthWrite:false,side:THREE.DoubleSide,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uTex:{value:TEX_FALL},uCol:{value:new THREE.Color().setHSL(WHUE,.4,.7)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec2 vUv;varying vec3 vWP;',
  'void main(){vUv=uv;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform sampler2D uTex;uniform vec3 uCol;varying vec2 vUv;varying vec3 vWP;',
  'void main(){',
  ' vec3 s1=texture2D(uTex,vec2(vUv.x*2.0,vUv.y*3.0-uT*1.4)).rgb;vec3 s2=texture2D(uTex,vec2(vUv.x*3.1+0.3,vUv.y*2.0-uT*2.0)).rgb;',
  ' float f=(s1.r*s2.g);vec3 col=mix(uCol,vec3(1.0),0.2+0.6*smoothstep(0.35,0.9,f));',
  ' float a=(0.35+0.5*smoothstep(0.3,0.9,f))*(0.55+0.45*s1.g);a*=smoothstep(0.0,0.14,vUv.x)*smoothstep(1.0,0.86,vUv.x);',
  ' a*=mix(1.0,0.6,smoothstep(0.5,1.0,vUv.y));',
  ' gl_FragColor=vec4(col,a);','#include <fog_fragment>','}'].join('\n')});
MAT_FALL.uniforms.fogColor.value=scene.fog.color;MAT_FALL.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_FALL.uniforms.uT.value+=dt;});
const FALL={x:LIPEDGE,z:0,y:WLU(LIPEDGE),foot:POOL.y,throwX:2.0};
FALL.xAt=t=>FALL.x+FALL.throwX*(1-Math.exp(-3*t))/(1-Math.exp(-3));
(function(){const pos=[],uv=[],idx=[],NS=30,H=FALL.y-FALL.foot;
 for(let i=0;i<=NS;i++){const t=i/NS,y=FALL.y-H*t,x=FALL.xAt(t),w=(STREAM.upHW-.1)*(1+t*1.1);   // as wide as the notch's flat bed at the lip, spreading as it falls
  for(let k=-1;k<=1;k+=2){pos.push(x,y,FALL.z+k*w);uv.push(k<0?0:1,t);}}
 for(let i=0;i<NS;i++){const a=i*2,b=a+1,c2=a+2,d=a+3;idx.push(a,c2,d,a,d,b);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_FALL);m.userData.probeSkip=true;m.userData.inspectLabel='The falls';m.renderOrder=2;scene.add(m);WATER.falls=m;
 const mistTex=BIO.canvasTex(128,128,(gg,w,h)=>{const gr=gg.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.45,'rgba(240,246,250,.45)');gr.addColorStop(1,'rgba(240,246,250,0)');gg.fillStyle=gr;gg.fillRect(0,0,w,h);});
 const SPR=[];
 for(let i=0;i<14;i++){const plunge=i<9,t=plunge?rr(.9,1):rr(.3,.85),y=FALL.y-H*t,x=FALL.xAt(t)+(plunge?rr(.5,6):rr(.2,1.2)),s=plunge?rr(5,11):rr(2.5,5);
  const sm=new THREE.SpriteMaterial({map:mistTex,transparent:true,depthWrite:false,opacity:plunge?rr(.25,.45):rr(.12,.25),fog:true,color:0xf4f8fa});
  const sp=new THREE.Sprite(sm);sp.position.set(x,y+(plunge?rr(0,4):0),FALL.z+rr(-4,4));sp.scale.set(s,s*rr(.7,1.1),1);sp.userData.probeSkip=true;sp.userData.inspectLabel='Mist';sp.userData.ph=rr(0,TAU);sp.userData.y0=sp.position.y;scene.add(sp);SPR.push(sp);}
 TICKS.push((dt,t)=>{for(let i=0;i<SPR.length;i++){const s=SPR[i];s.position.y=s.userData.y0+.6*Math.sin(t*.5+s.userData.ph);}});})();
// the named water and terrain the inspector knows
REGISTER({name:'The falls',cls:'water',x:LIPX+1,z:0,y:POOL.y,r:4,h:FALL.y-POOL.y,tags:{height_m:+(FALL.y-POOL.y).toFixed(1)}});
REGISTER({name:'The plunge pool',cls:'water',x:POOL.x,z:POOL.z,y:POOL.y-POOL.depth,r:POOL.r,h:POOL.depth+1,tags:{depth_m:POOL.depth,surface_m:POOL.y}});
