// ---------- the ground of the valley ----------
// Fan work; Tolkien's world belongs to the Tolkien Estate and every shape and colour here is this project's own.
//
// The engine colours terrain by height and slope, one colour a vertex, and on a valley whose walls are three
// hundred metres of sheer rock that reads as grey ramps. Tolkien draws the walls of Rivendell as pale rock,
// jointed into tall columns and banded across, with the green of the woods above them and the green of the
// floor below; the moor over the top is "the colour of heather and crumbling rock, with patches and slashes of
// grass-green". So the terrain here gets a shader of its own, which decides from the slope and the height
// above the water what every pixel is:
//
//   rock      where it is steep: pale grey, split by vertical joints every few metres, banded by bedding,
//             streaked darker where water has run down it, and green on the ledges
//   scree     where it is steep but not sheer, at the feet of the walls
//   meadow    the floor of the valley: lush, mottled, darker under the walls
//   shingle   the banks, a few metres either side of the water
//   woodland  the slopes between the top of the rock and the rim, which the firs stand on
//   moor      heather, crumbling rock, and slashes of green
//
// uSeason runs from Tolkien's summer (0) to the film's autumn (1); the woods (woods.js) follow the same knob.
//
// The engine's horizon plate is a flat ring at moor level round the map, and here the valley runs out of both
// ends of the box: the ring would lie over it like a lid. It is replaced by land of the page's own - the moor
// going on, with the valley continuing in it, and the mountains standing up at the head of it in the east.

export function ground(api){
  const {THREE,C,ctx,scene,animHooks}=api;
  const V=ctx.valley;if(!V)return;
  const U={uSeason:{value:0},uRiver:{value:null},uRX:{value:new THREE.Vector2()}};

  // the river, as a texture along x: (middle z, water level, half-width) at 1024 stations
  {const N=1024,rv=V.river,x0=rv[rv.length-1][0],x1=rv[0][0],d=new Float32Array(N*4);
   for(let i=0;i<N;i++){const x=x0+(x1-x0)*i/(N-1);
     let k=rv.length-1;while(k>0&&rv[k][0]<x)k--;const a=rv[Math.min(rv.length-1,k+1)],b=rv[k];const t=b[0]===a[0]?0:(x-a[0])/(b[0]-a[0]);
     d[i*4]=a[1]+(b[1]-a[1])*t;d[i*4+1]=a[2]+(b[2]-a[2])*t;d[i*4+2]=a[3]+(b[3]-a[3])*t;d[i*4+3]=1;}
   const tx=new THREE.DataTexture(d,N,1,THREE.RGBAFormat,THREE.FloatType);tx.needsUpdate=true;
   U.uRiver.value=tx;U.uRX.value.set(x0,x1-x0);}

  const mat=new THREE.MeshLambertMaterial({color:0xffffff});
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader='varying vec3 vWP;varying vec3 vWN;\n'+sh.vertexShader.replace('#include <fog_vertex>',
      '#include <fog_vertex>\n vWP=(modelMatrix*vec4(transformed,1.0)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
    sh.fragmentShader=`varying vec3 vWP;varying vec3 vWN;uniform float uSeason;uniform sampler2D uRiver;uniform vec2 uRX;
float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float fb(vec2 p){return 0.5*n2(p)+0.25*n2(p*2.03+7.1)+0.125*n2(p*4.1+3.3)+0.0625*n2(p*8.3+1.7);}
`+sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
 {
 vec3 p=vWP;vec3 n=normalize(vWN);
 float slope=1.0-clamp(n.y,0.0,1.0);
 vec4 rv=texture2D(uRiver,vec2((p.x-uRX.x)/uRX.y,0.5));
 float dRiv=abs(p.z-rv.x),above=p.y-rv.y;
 float fw=length(fwidth(p.xz))+fwidth(p.y);             // how big a pixel is, for fading fine detail
 // ---- rock: pale, jointed into columns, banded, streaked, green on its ledges ----
 vec2 t2=normalize(vec2(-n.z,n.x)+vec2(1e-4,0.0));float u=dot(p.xz,t2);
 float jw=6.5+3.0*n2(vec2(u*0.05,3.0));
 float joint=1.0-smoothstep(0.0,0.09+fw*0.02,abs(fract(u/jw+0.35*n2(vec2(u*0.02,p.y*0.01)))-0.5)*2.0);
 joint*=smoothstep(40.0,6.0,fw*8.0);
 float bed=smoothstep(0.82,0.95,n2(vec2(u*0.004,p.y*0.11)))*smoothstep(30.0,4.0,fw*6.0);
 float streak=fb(vec2(u*0.09,p.y*0.006));
 vec3 rock=mix(vec3(0.80,0.79,0.75),vec3(0.66,0.66,0.64),fb(vec2(u*0.02,p.y*0.02)));
 rock*=0.84+0.2*n2(vec2(u*0.045,1.0));                    // the columns: broad vertical banding
 rock*=1.0-0.42*joint;rock*=1.0-0.16*bed;
 rock=mix(rock,vec3(0.47,0.46,0.43),smoothstep(0.55,0.85,streak)*0.55);
 rock=mix(rock,vec3(0.58,0.62,0.50),smoothstep(0.62,0.8,fb(vec2(u*0.01+9.0,p.y*0.015)))*0.35);   // lichen
 rock=mix(rock,vec3(0.72,0.62,0.48),smoothstep(0.7,0.9,fb(vec2(u*0.006+3.0,p.y*0.004)))*0.3);    // iron-stained
 // ---- the rest ----
 vec2 q=p.xz;
 vec3 grassS=mix(vec3(0.27,0.40,0.19),vec3(0.36,0.49,0.23),fb(q*0.02));
 grassS=mix(grassS,vec3(0.42,0.44,0.24),smoothstep(0.6,0.8,fb(q*0.006+4.0))*0.5);
 vec3 grassA=mix(vec3(0.52,0.48,0.26),vec3(0.64,0.55,0.30),fb(q*0.02));
 vec3 meadow=mix(grassS,grassA,uSeason*0.8);
 meadow*=0.8+0.25*fb(q*0.11);
 vec3 shingle=mix(vec3(0.80,0.74,0.58),vec3(0.66,0.62,0.54),fb(q*0.3));
 vec3 scree=mix(vec3(0.62,0.60,0.55),vec3(0.52,0.49,0.44),fb(q*0.08));
 vec3 wood=mix(vec3(0.20,0.28,0.16),vec3(0.36,0.30,0.18),uSeason*0.7)*(0.85+0.3*fb(q*0.05));
 float heather=fb(q*0.004+vec2(3.0,1.0));
 vec3 moorC=mix(vec3(0.40,0.34,0.35),vec3(0.47,0.41,0.34),fb(q*0.03));                 // heather
 moorC=mix(moorC,vec3(0.36,0.47,0.25),smoothstep(0.52,0.62,fb(q*0.0025+vec2(7.0,2.0)+0.2*vec2(fb(q*0.01),0.0)))*0.9);   // slashes of green
 moorC=mix(moorC,vec3(0.66,0.63,0.58),smoothstep(0.66,0.78,fb(q*0.012+vec2(1.0,9.0))));   // crumbling rock
 moorC=mix(moorC,mix(moorC,vec3(0.56,0.42,0.28),0.5),uSeason*0.6);
 // ---- which is which ----
 float steep=smoothstep(0.38,0.58,slope);
 float mid=smoothstep(0.16,0.34,slope)*(1.0-steep);
 float high=smoothstep(150.0,230.0,above);                        // above the rock, on the slope and the moor
 float onMoor=smoothstep(250.0,300.0,above)*(1.0-smoothstep(0.12,0.3,slope));
 vec3 c=mix(meadow,wood,smoothstep(40.0,120.0,above)*0.7);         // the floor darkens towards the walls
 c=mix(c,wood,high);
 c=mix(c,moorC,onMoor);
 c=mix(c,scree,mid*(1.0-high)*0.8);
 c=mix(c,wood,mid*high*0.6);
 c=mix(c,rock,steep);
 float bank=(1.0-smoothstep(1.2,4.5,above))*(1.0-smoothstep(rv.z+4.0,rv.z+22.0,dRiv));
 c=mix(c,shingle,bank*(1.0-steep));
 diffuseColor.rgb=c;
 }`);
  };
  mat.customProgramCacheKey=()=>'rivendell-ground';
  const terr=[];scene.traverse(o=>{if(o.isMesh&&o.name==='terrain')terr.push(o);});
  for(const m of terr){m.material=mat;if(m.geometry.attributes.color)m.geometry.deleteAttribute('color');}

  // ---- the land beyond the box ----
  let ring=null;scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='RingGeometry'&&o.renderOrder===-1)ring=o;});
  if(ring)ring.visible=false;
  const B=api.B,HX=B.w/2,HZ=B.d/2,cx=B.cx,cz=B.cz;
  const rv=V.river,east=rv[0],west=rv[rv.length-1];
  // the moor's level, and the valley going on in it: the line of the river carried on past each end
  const moorAt=x=>612+0.05*Math.max(-HX,Math.min(HX,x))+60*Math.min(1,Math.max(0,(x-1500)/1800))-40*Math.min(1,Math.max(0,(-1200-x)/2000))
    +(x>HX?Math.min(900,(x-HX)*0.12):0);
  const valleyZ=x=>x>east[0]?east[1]+(x-east[0])*0.12:x<west[0]?west[1]+(x-west[0])*-0.22:null;
  {const S=240,N=90,pos=[],idx=[],col=[],cc=new THREE.Color();const L=S*N/2;
   for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=cx-L+i*S,z=cz-L+j*S;let y=moorAt(x);
     const vz=valleyZ(x);if(vz!==null){const dd=Math.abs(z-vz),lv=x>0?east[2]+(x-east[0])*0.1:west[2];y=Math.min(y,lv+(y-lv)*Math.min(1,Math.pow(dd/900,1.3)));}
     pos.push(x,y-1,z);cc.setRGB(0.42,0.38,0.38).lerp(new THREE.Color(0.36,0.44,0.28),Math.random()*0.4);col.push(cc.r,cc.g,cc.b);}
   for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=cx-L+(i+0.5)*S,z=cz-L+(j+0.5)*S;
     if(Math.abs(x-cx)<HX-S*0.6&&Math.abs(z-cz)<HZ-S*0.6)continue;                 // the box has its own ground
     const a=j*(N+1)+i;idx.push(a,a+N+1,a+1,a+1,a+N+1,a+N+2);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
   g.setIndex(idx);g.computeVertexNormals();
   const m=new THREE.Mesh(g,mat);m.userData.noWire=true;m.receiveShadow=false;scene.add(m);}

  // ---- the mountains at the head of the valley ----
  // Tolkien's 'looking East' has them filling the gap the valley makes: grey and blue with snow on them, a
  // long way off. They are lit, and tinted by hand for their distance because the fog would take them away.
  {const R=mkR(1937),g=[],snow=[];
   // inside the sky dome (the engine's sky is about 18 km out; anything past it is drawn over)
   for(let i=0;i<52;i++){const a=-0.8+1.6*R(),d=11500+R()*5000,h=900+R()*1700*(1-Math.abs(a)*0.4),w=h*(0.8+R()*0.5);
     const x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;
     const geo=new THREE.ConeGeometry(w,h,5+Math.floor(R()*3),1).toNonIndexed();geo.rotateY(R()*6.28);
     const p=geo.attributes.position;for(let k=0;k<p.count;k++){const yy=p.getY(k);if(yy<h*0.49)p.setX(k,p.getX(k)*(0.8+R()*0.5));}
     geo.translate(x,h/2+500,z);geo.computeVertexNormals();g.push(geo);
     const cap=new THREE.ConeGeometry(w*0.34,h*0.34,5,1);cap.rotateY(R()*6.28);cap.translate(x,500+h*0.84,z);snow.push(cap);}
   const merge=list=>{const pos=[],nor=[];for(const q of list){const nq=q.index?q.toNonIndexed():q;nq.computeVertexNormals();pos.push(...nq.attributes.position.array);nor.push(...nq.attributes.normal.array);}
     const out=new THREE.BufferGeometry();out.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));out.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));return out;};
   const mm=new THREE.Mesh(merge(g),new THREE.MeshLambertMaterial({color:0x8793a8,fog:false,flatShading:true}));
   const ms=new THREE.Mesh(merge(snow),new THREE.MeshLambertMaterial({color:0xe8edf4,fog:false,flatShading:true}));
   for(const m of [mm,ms]){m.userData.noWire=true;m.frustumCulled=false;scene.add(m);}
   // dim them with the day
   animHooks.push(()=>{const k=1-0.8*(api.nightF?api.nightF(api.hour()):0);mm.material.color.setRGB(0.53*k,0.58*k,0.66*k);ms.material.color.setRGB(0.91*k,0.93*k,0.96*k);});}

  ctx.rivGround={U,setSeason:v=>{U.uSeason.value=v;}};
}

function mkR(s){return ()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
