// ================================================================= HOST — stage (station 11: the lava tube)
// The ideal-type host for THE THRONE's lava tubes (NOTES.md, "Fauna hooks": blind glowing cave life in the tubes; the
// skylights of station 1): renderer, the cave's light, the tube and its layout as DATA; 47 the floor, the fields, BIO.init;
// 84 the tube's mesh and the surface; 86 the lava, the light, the cave life on the walls and the roof.
//
// THE MAP (x east, z south; R 1300). An old flow on the south-east shoulder ~1.6 km up, under the plume's edge; under it a
// lava tube ~1.4 km long, falling gently downstream (east-south-east). The surface is the flow's top (~20 m above the floor).
//   THE TUBE       an arched passage 13-24 m wide and 8-15 m high: a flat floor of old ropy lava, flow ledges along both
//                  walls (each a level the lava once stood at), lavacicles hanging from the roof
//   THE SKYLIGHTS  three places where the roof fell in: a hole to the sky, a breakdown pile of the fallen roof below it;
//                  daylight pours in, and the life that wants light grows there (siphon trees, lamp caps, ferns, moss)
//   THE DARK       between them Krator's own cave life: the mat glowing on the floor, glow mushrooms, lantern brackets on
//                  the walls, fungi dripping from the roof
//   THE PASSAGE    a side passage leaving the tube, smaller, ending in a choke of breakdown
//   THE HOT REACH  downstream the tube is young: still hot, a lava stream running in a channel in its floor, the walls glazed
//                  and glowing; nothing lives there. The tube ends in a sump where the stream goes under
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.3;document.body.appendChild(renderer.domElement);
// THE LIGHT: 82 sets it per mode. The directional sun stays OFF (it would light the cave through its rock); its position is
// still the sun's direction, read by the surface's own shading (84) and the skylights' spot lights (86)
const scene=new THREE.Scene();const HAZE=new THREE.Color(0x0b0b0d);scene.fog=new THREE.FogExp2(HAZE.getHex(),.009);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.3,12000);
const hemi=new THREE.HemisphereLight(0x4a5464,0x1a1614,.32);scene.add(hemi);
const SUN_POS=[-850,900,500];
const sun=new THREE.DirectionalLight(0xffdcae,0);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb8bcd0,0);fill.position.set(900,400,900);scene.add(fill);

// ---------------------------------------------------------------- the tube and its layout
const TERR={R:1300};
const SURF0=1620;   // the surface's height at the map's middle
// a tube: its centre line (a base direction, wandering across it), its floor height, its half-width and height along it
function makeTube(o){const T=Object.assign({},o),N=Math.ceil(T.L/2)+1;T.px=new Float32Array(N);T.pz=new Float32Array(N);T.N=N;T.du=T.L/(N-1);
 const d=[Math.cos(T.dir),Math.sin(T.dir)],n=[-d[1],d[0]];T.d=d;T.n=n;
 for(let i=0;i<N;i++){const u=i*T.du,w=T.wand(u);T.px[i]=T.x0+d[0]*u+n[0]*w;T.pz[i]=T.z0+d[1]*u+n[1]*w;}
 T.P=u=>{const f=clamp(u/T.du,0,N-1.001),i=Math.floor(f),t=f-i;return[mix(T.px[i],T.px[i+1],t),mix(T.pz[i],T.pz[i+1],t)];};
 T.tan=u=>{const a=T.P(u-1),b=T.P(u+1),l=Math.hypot(b[0]-a[0],b[1]-a[1])||1;return[(b[0]-a[0])/l,(b[1]-a[1])/l];};
 // (u, l): the nearest point on the centre line and the signed distance from it (l > 0 to the line's left)
 T.near=(x,z)=>{const u0=clamp((x-T.x0)*d[0]+(z-T.z0)*d[1],-60,T.L+60);let bu=0,bd=1e18;
  for(let u=Math.max(0,u0-90);u<=Math.min(T.L,u0+90);u+=6){const p=T.P(u),e=(x-p[0])**2+(z-p[1])**2;if(e<bd){bd=e;bu=u;}}
  for(let u=Math.max(0,bu-6);u<=Math.min(T.L,bu+6);u+=.5){const p=T.P(u),e=(x-p[0])**2+(z-p[1])**2;if(e<bd){bd=e;bu=u;}}
  const p=T.P(bu),t=T.tan(bu);return{u:bu,l:(x-p[0])*-t[1]+(z-p[1])*t[0],d:Math.sqrt(bd)};};
 return T;}
const TUBE=makeTube({key:'main',name:'The lava tube',x0:-640,z0:-470,dir:.56,L:1420,
 wand:u=>55*Math.sin(u*.0058)+24*Math.sin(u*.017+1.1)+8*Math.sin(u*.05+2),
 floor:u=>SURF0-6-20+.032*(700-u)+1.5*(fbm(u*.004,1.7,141,2)-.5),
 W:u=>(8.5+3*fbm(u*.006,3.1,142,2)+1.5*Math.sin(u*.021))*(1-.35*smooth(1350,1420,u)),
 H:u=>(10+4.5*fbm(u*.005,5.3,143,2))*(1-.4*smooth(1360,1420,u))});
// THE SIDE PASSAGE: off the tube's left wall, smaller, rising a little, ending in a choke
const SIDE=(function(){const u=520,p=TUBE.P(u),t=TUBE.tan(u),a=Math.atan2(t[1],t[0])-.95,f0=TUBE.floor(u);
 return makeTube({key:'side',name:'A side passage (it ends in a choke)',x0:p[0],z0:p[1],dir:a,L:190,wand:v=>14*Math.sin(v*.03)*smooth(0,30,v),
  floor:v=>f0+.6+.025*v,W:v=>(5.5+1.2*Math.sin(v*.04))*(1-.5*smooth(150,190,v)),H:v=>(6.5+1.5*Math.sin(v*.033+1))*(1-.45*smooth(150,190,v)),from:u});})();
const TUBES=[TUBE,SIDE];
// THE SKYLIGHTS: on the main tube; r the hole's radius at the surface; the breakdown pile below
const SKY=[{u:230,r:11},{u:640,r:14},{u:1010,r:9}].map((S,i)=>{const p=TUBE.P(S.u);return Object.assign(S,{i,x:p[0],z:p[1],name:'A skylight (the roof fell in)'});});
// the hole's ragged radius by angle
const skyR=(S,a)=>S.r*(1+.22*(fbm(Math.cos(a)*1.3+S.i*3,Math.sin(a)*1.3,151,2)-.5)*2+.08*Math.sin(3*a+S.i));
// THE HOT REACH: the young tube downstream: hot(u) 0..1
const HOT={u0:1130,u1:1220,name:'The hot reach (a lava stream still runs here)'};
const hotK=u=>smooth(HOT.u0,HOT.u1,u);
// the surface: the old flow's top, falling gently east-south-east like the tube under it
function surfH(x,z){const u=(x-TUBE.x0)*TUBE.d[0]+(z-TUBE.z0)*TUBE.d[1];return SURF0+.03*(700-u)+9*(fbm(x*.002+3,z*.002-1,152,3)-.5)+2.5*(fbm(x*.012,z*.012,153,2)-.5);}
function plumeAt(x,z){return .55;}
