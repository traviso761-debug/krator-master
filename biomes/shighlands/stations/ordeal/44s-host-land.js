// ================================================================= HOST — the land of STATION 5: THE ORDEAL RAMP (4.30-4.64 km; PLAN-STATIONS.md)
// Map 5.1 px 782,1194 (old canvas 510,864): 4,426 m, ET / Dsc, 235-329 mm/yr, -2 °C (+11/-15; winter night -23 °C), 0.92 atm; 30 km relief
// 3,392-9,548 m. The bleak SE wind-scoured ramp climbing out of Shumar directly toward Godthrone's 9.5 km dark titanium-basalt flank, where -ko
// initiates walk the Ordeal (Urudiru). A tilted freeze-thaw pavement of dark basalt and impactite slabs rising south-east (+x, +z), incised by a
// dry seasonal snowmelt boulder gulch, lee snowbeds, frost-sorted stone spirals on the flat treads, and a small cold meltwater tarn in a NW lee
// hollow. Read by stations/common/45-host-stage.js. x east, z south.
const STATION_LAND=(function(){const {smooth,clamp,fbm,mix}=BIO.fn;
 const GULCH=[[1950,1620],[1260,960],[560,340],[-120,-180],[-820,-660],[-1580,-1180],[-2250,-1640]];
 const gulchNear=(x,z)=>{let best=1e9,bs=0;
  for(let i=0;i+1<GULCH.length;i++){const a=GULCH[i],b=GULCH[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,
   t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),px=a[0]+dx*t,pz=a[1]+dz*t,d=Math.hypot(x-px,z-pz);
   if(d<best){best=d;bs=(i+t)/(GULCH.length-1);}}
  return{d:best,s:bs,w:mix(26,46,bs),dep:mix(10,17,bs)};};
 /* ramp axis: rises south-east (+x, +z) toward Godthrone; subtle basalt-slab treads give flat benches for frost-sorted spirals */
 const rampS=(x,z)=>(x*.72+z*.69);
 const raw=(x,z)=>{const s=rampS(x,z),u=smooth(-2600,2600,s);
  const steps=-13*Math.sin((s/185)*Math.PI*2)*smooth(2100,-1900,s);
  return 4305+335*Math.pow(u,1.12)+58*(fbm(x*.00075+9,z*.00075-5,131,3)-.5)+18*(fbm(x*.0032-4,z*.0032+7,133,2)-.5)+steps;};
 const base=(x,z)=>{const h=raw(x,z),G=gulchNear(x,z);
  const cut=G.dep*smooth(G.w*1.35,G.w*.28,G.d)+1.6*(fbm(x*.025,z*.025,135,2)-.5)*smooth(G.w,G.w*.2,G.d);
  return h-cut;};
 const north=(x,z)=>{const e=7,gz=(base(x,z+e)-base(x,z-e))/(2*e),gx=(base(x+e,z)-base(x-e,z))/(2*e),g=Math.hypot(gx,gz);return g<1e-4?0:clamp((gz*.75+gx*.66)/g,-1,1)*smooth(.015,.1,g);};
 /* Urudiru Ordeal trail waypoints climbing NW -> SE toward Godthrone (registered as empty core/tags feature records in 86-host-ordeal.js) */
 const WAY=[
  {name:'Lower Ordeal Threshold',kind:'gate-site',x:-880,z:-820,r:18,h:12},
  {name:'First Ordeal Cairn',kind:'cairn-site',x:-360,z:-340,r:12,h:8},
  {name:'Gulch Crossing Cairn',kind:'cairn-site',x:120,z:110,r:12,h:8},
  {name:'Watchstone Station',kind:'cairn-site',x:610,z:690,r:15,h:10},
  {name:'Upper Ordeal Gate',kind:'gate-site',x:1180,z:1140,r:20,h:14}
 ];
 return{name:'The Ordeal ramp',R:2600,seed:5047,haze:0xc6ced8,fog:.00009,sun:[-840,1120,-340],wet:.28,coldFrom:4100,
  base,GULCH,gulchNear,rampS,WAY,
  tors:[
   {x:780,z:860,r:138,h:54,step:7,s:2.1,spiral:1,name:'The Ordeal Watchstone'},
   {x:-540,z:620,r:94,h:28,step:6,s:4.3,name:'South-west slab tor'},
   {x:-1640,z:-740,r:98,h:32,step:6,s:5.6,name:'Lower ramp basalt crag'}
  ],
  tarn:{x:-1080,z:-860,r:42,depth:3.5},
  extra:['snow','scree','sorted','gulch','lee','north'],
  fogAt:()=>.03,
  fields:(x,z,h,slope,F,K)=>{const nw=north(x,z),G=gulchNear(x,z);
   F.north=nw*.5+.5;
   F.gulch=smooth(G.w*1.1,G.w*.35,G.d);
   F.snow=clamp(smooth(.18,.72,nw)*smooth(4330,4580,h)*.82+smooth(G.w*1.4,G.w*.6,G.d)*smooth(.25,.7,nw)*.45+.14*(fbm(x*.0042,z*.0042,137,2)-.5),0,1)*(1-smooth(.6,.85,slope));
   F.scree=clamp(smooth(.3,.56,slope)*(1-smooth(.76,.92,slope))+K.foot*.82+F.gulch*.78,0,1);
   /* sheltered rock lees (NW/N foot of tors, slab risers and gulch banks) where wind-shorn coil juniper krummholz survives */
   const slabLee=smooth(.14,.34,slope)*smooth(.15,.65,nw)*(1-smooth(.55,.8,slope));
   F.lee=clamp((K.foot*(.45+.55*F.north)+smooth(G.w*1.5,G.w*.75,G.d)*.55+slabLee*.65)*(1-smooth(.42,.68,F.snow)),0,1);
   F.sorted=clamp(smooth(.13,.04,slope)*(1-F.scree)*(1-F.gulch)*(1-smooth(.32,.56,F.snow))*(1-K.rock)*smooth(.40,.58,fbm(x*.0019+6,z*.0019-8,139,3)),0,1);
   F.wet=clamp(.22+.42*F.snow+.18*F.gulch,0,1);
   F.barren=clamp(.42+.45*F.scree+.3*F.gulch,0,1);},
  spine:[[0,0],[-280,-240],[320,340],[-1650,-750]],
  lod:{hero:190,mid:430,far:2400,floor:[145,350]}};})();
// the air (stations/common/89z-host-atmos.js): thin 0.92 atm frost air; dry rain-shadow pavement stays bare except white NW lee snowbeds (F.snow) and active snowfall/blizzard modes
const STATION_AIR={snowBase:.05,frozen:false,mist:{density:.00045,y:4350,depth:22,noise:.75}};
// the ground (84): dark basalt-and-impactite freeze-thaw pavement, ochre-grey frost fines, angular boulder scree in the dry gulch, white lee snowbeds
const STATION_TUFT=false;
const STATION_PAINT=(function(){const K=h=>new THREE.Color(h),{smooth,clamp}=BIO.fn;
 const PAV=K(0x52504c),FINES=K(0x787062),IMPACT=K(0x383a42),LICH=K(0x88845e),GUL=K(0x42444a),SNOW=K(0xf0f4f8),SNOW2=K(0xd8e0ec),BAS=K(0x3e4046);
 const t=new THREE.Color();
 return(c,wx,wz,n,pav,pav2)=>{const F=k=>FC.at(FC.a[k],wx,wz);
  c.copy(FINES).lerp(PAV,smooth(.36,.68,pav)).lerp(IMPACT,smooth(.58,.82,pav2)*.65).lerp(LICH,smooth(.62,.8,pav)*.35);
  c.lerp(GUL,clamp(F('scree')*.65+F('gulch')*.85,0,1));
  c.lerp(BAS,smooth(.3,.65,F('rock'))*.8);
  t.copy(SNOW).lerp(SNOW2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.36,.62,F('snow')));};})();
// three KGROUND layers: x frost-sorted fines (ground.fines), y dark basaltic rubble & scree (ground.scree), z lee snowbeds (ground.snow);
// [3] carries the frost-sorted stone spirals' weight into vPar (drawn by STATION_GROUND_GLSL below)
const STATION_GL=(x,z,rk)=>{const{smooth}=BIO.fn,sn=smooth(.36,.62,FC.at(FC.a.snow,x,z))*(1-rk),
 sc=Math.min(1,(FC.at(FC.a.scree,x,z)+FC.at(FC.a.gulch,x,z)*.6))*(1-sn);
 return[Math.max(0,(1-sc)*(1-sn)*(1-rk)),sc*(1-rk*.4),sn,FC.at(FC.a.sorted,x,z)];};
const STATION_KGL=()=>{const f=KGROUND.layer('shigh','ground.fines',{w:'vGL.x',amt:.58,gain:1.2,tint:'diffuse',name:'frost fines'}),
 s=KGROUND.layer('shigh','ground.scree',{w:'vGL.y',amt:.78,gain:1.15,tint:'diffuse',name:'basalt rubble'}),
 n=KGROUND.layer('shigh','ground.snow',{w:'vGL.z',amt:.9,gain:1.0,name:'lee snowbed'});
 return f&&s&&n?[f,s,n]:[];};
// THE SORTED SPIRALS (same deterministic Weyl-sequence cell rule as station 3, in dark basalt-and-impactite stone on the ramp's flat treads)
const STATION_SORTED={cell:8,pitch:1.4,rMax:3.6,
 phase:(ix,iz)=>{const v=ix*.618034+iz*.414214;return v-Math.floor(v);},
 arms:(ix,iz)=>{const v=ix*.381966+iz*.707107;return v-Math.floor(v)>.5?2:1;}};
const STATION_GROUND_GLSL='{vec2 cc=floor(vGWP.xz/8.0);vec2 dd=vGWP.xz-(cc+0.5)*8.0;float rr=length(dd);float ph=fract(cc.x*0.618034+cc.y*0.414214);'+
 'float arms=fract(cc.x*0.381966+cc.y*0.707107)>0.5?2.0:1.0;float vv=atan(dd.y,dd.x)/6.2831853*arms-rr/1.4+ph;'+
 'float st=1.0-smoothstep(0.06,0.15,abs(fract(vv+0.5)-0.5));float ww=vPar*(1.0-smoothstep(3.3,3.9,rr))*smoothstep(0.3,0.8,rr);'+
 'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.46,0.47,0.52),st*ww*0.82);diffuseColor.rgb*=1.0-(1.0-st)*ww*0.20;}';
// the far field: dark slate-basalt and frost-brown ramp climbing into Godthrone's dark titanium-basalt foot and high snows
const STATION_FARCOL=(x,z,h,n,L)=>{const{smooth}=BIO.fn,a=L([88,84,76]),b=L([62,64,70]),dk=L([44,46,54]),sn=L([226,232,240]),
 m=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
 let c=m(a,b,n);c=m(c,dk,smooth(4480,4850,h)*.7);return m(c,sn,smooth(5050,5600,h)*.75);};
// the mirror-handed coil juniper a camera finds (89zx)
const STATION_MIRROR={key:'coiljuniper',score:(x,z)=>FC.at(FC.a.lee,x,z)*2-Math.hypot(x+220,z+180)/1400,box:[-1800,-1800,1800,1800]};
const STATION_Q=1;
