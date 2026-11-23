// ================================================================= HOST — the land of STATION 4: SHUMAR, THE BASALT GORGE AND DRY PLATEAU (3.06-3.36 km; PLAN-STATIONS.md)
// Map 5.1 px 737,1201 (old canvas 465,871): 3,308 m, Dsb, 424 mm/yr, +7 °C (+20/-6; winter night -13 °C), 1.06 atm, on r287 Qappu-Narun just above
// its confluence with r007 Betun-Narun. A wind-swept ochre-olive Dsb loess-and-limestone plateau bench at ~3,310-3,365 m split south-to-north by a
// ~235 m stepped basalt-and-limestone canyon: its four cliff risers alternate dark polygonal basalt and pale iron-stained limestone (the natural
// ablaq stone of Shumar), separated by colluvial gravel shelves and wet canyon seeps down to Qappu-Narun's gravel bars and river channel.
// Read by stations/common/45-host-stage.js. x east, z south (north is -z: the river flows toward -z).
const STATION_LAND=(function(){const {smooth,clamp,fbm,mix}=BIO.fn;
 const canX=z=>-90+250*Math.sin(z*.00085+.38)+105*Math.cos(z*.0019-.65);
 const rivOff=z=>24*Math.sin(z*.0026+1.1)+9*Math.cos(z*.0051-.4);
 const rivX=z=>canX(z)+rivOff(z);
 const rivW=z=>18+5*Math.sin(z*.0017+.5);
 const floorY=z=>3082+.0068*z;   /* falls smoothly northward (-z) from ~3,100 m to ~3,064 m */
 const rivLevel=z=>floorY(z)-.38;
 const benchH=(x,z)=>3312+28*smooth(-2400,2400,x*.45+z*.65)+26*(fbm(x*.00065+4,z*.00065-7,101,3)-.5)+9*(fbm(x*.0024-3,z*.0024+6,103,2)-.5);
 const geom=(x,z)=>{const cx=canX(z),rx=rivX(z),hw=rivW(z)*.5;
  const spur=54*(fbm(x*.0028+3,z*.0028-4,105,3)-.5)+22*(fbm(x*.0085-2,z*.0085+6,106,2)-.5);
  const wf=Math.max(46,68+spur*.38),ww=Math.max(148,198+spur*.88);
  const dc=Math.abs(x-cx),dr=Math.abs(x-rx),u=clamp((dc-wf)/ww,0,1);
  const q=u*4,iq=Math.min(3,Math.floor(q)),fq=q-iq;
  /* four stepped ablaq tiers: steep cliff risers (fq 0..0.56) and colluvial shelves (fq 0.56..1.0) */
  const tier=.86*smooth(.03,.55,fq)+.14*smooth(.55,1,fq),wu=(iq+tier)/4;
  const onShelf=u>.02&&u<.98?smooth(.52,.64,fq)*smooth(.99,.88,fq):0;
  const onRiser=u>.01&&u<.99?smooth(.02,.12,fq)*smooth(.58,.46,fq):0;
  return{cx,rx,hw,wf,ww,dc,dr,u,wu,onShelf,onRiser};};
 const base=(x,z)=>{const G=geom(x,z),bh=benchH(x,z),fl=floorY(z);
  const bar=fl+1.1+3.8*smooth(G.hw+4,G.wf,G.dc)+1.2*(fbm(x*.018+2,z*.018-5,109,2)-.5)*smooth(G.hw+3,G.hw+18,G.dr);
  const bed=fl-1.65*smooth(G.hw+4.5,G.hw*.35,G.dr);
  const chan=mix(bar,bed,smooth(G.hw+5,G.hw+.5,G.dr));
  const wall=mix(chan,bh,G.wu)+3.2*(fbm(x*.014,z*.014,111,2)-.5)*G.onShelf;
  return G.dc>=G.wf+G.ww?bh:wall;};
 const north=(x,z)=>{const e=6,gz=(base(x,z+e)-base(x,z-e))/(2*e),gx=(base(x+e,z)-base(x-e,z))/(2*e),g=Math.hypot(gx,gz);return g<1e-4?0:clamp(gz/g,-1,1)*smooth(.02,.12,g);};
 const dayQ=(function(){if(typeof location==='undefined')return null;const p=new URLSearchParams(location.search).get('day');return p==null?null:+p;})();
 const autumn=dayQ==null?.38:clamp(Math.sin(clamp((dayQ-40)/140,0,1)*Math.PI),0,1);
 return{name:'Shumar: the basalt gorge and dry plateau',R:2600,seed:4047,haze:0xcfd6dc,fog:.000095,sun:[-920,1080,-420],wet:.3,coldFrom:3200,
  base,canX,rivX,rivW,floorY,rivLevel,geom,autumn,
  tors:[
   {x:-430,z:210,r:105,h:38,step:7,s:1.7,spiral:1,name:'The Ablaq Spire'},
   {x:920,z:-680,r:92,h:28,step:6,s:3.9,name:'East bench caprock'},
   {x:-1640,z:-740,r:88,h:24,step:6,s:5.1,name:'West rim crag'}
  ],
  tarn:{x:-1180,z:520,r:56,depth:4},
  extra:['bench','terrace','shelf','rim','seep','ablaq','north'],
  fogAt:(x,z,h)=>clamp(.03+.06*smooth(3150,3075,h),0,1),
  fields:(x,z,h,slope,F,K)=>{const G=geom(x,z),n=north(x,z);
   F.north=n*.5+.5;
   F.bench=smooth(.92,1,G.u)*(1-K.rock);
   F.terrace=smooth(G.wf+8,G.wf-10,G.dc)*smooth(G.hw+1.5,G.hw+7,G.dr)*(1-smooth(.55,.8,slope));
   F.shelf=G.onShelf*(1-smooth(.72,.9,slope));
   F.rim=smooth(G.wf+G.ww+130,G.wf+G.ww-10,G.dc)*smooth(G.wf+G.ww-35,G.wf+G.ww+5,G.dc)*(1-smooth(.72,.9,slope));
   const seepBand=smooth(.55,.78,fbm(x*.0045+8,z*.0045-3,113,2));
   F.seep=clamp((G.onShelf*seepBand*(.45+.55*F.north)+smooth(G.hw+14,G.hw+2.5,G.dr)*smooth(G.wf,G.hw+4,G.dc)*.65)*(1-smooth(.75,.92,slope)),0,1);
   F.rock=clamp(Math.max(F.rock,G.onRiser*.94+smooth(.58,.86,slope)*.82),0,1);
   F.ablaq=clamp((1-smooth(.96,1,G.u))*smooth(.02,.18,G.u)*F.rock,0,1);
   F.canyon=1-G.u;
   F.flow=smooth(G.hw+10,G.hw,G.dr);
   F.wet=clamp(.24+.58*F.terrace+.62*F.seep+.35*F.flow,0,1);},
  mask:(x,z,h)=>{const rx=rivX(z),hw=rivW(z)*.5;return Math.abs(x-rx)<hw+2.2?0:1;},
  spine:[[55,-40],[35,-340],[115,210],[220,-240],[-1650,-750]],
  lod:{hero:185,mid:420,far:2400,floor:[145,340]}};})();
// the ground's colours (84-host-ground.js, STATION_PAINT): ochre-olive loess steppe on the Dsb bench, grey-buff colluvial gravel on the canyon
// shelves and river bars, damp moss-olive along the seeps, and banded dark basalt / iron-stained pale limestone on the canyon walls
const STATION_PAINT=(function(){const K=h=>new THREE.Color(h),{smooth,clamp}=BIO.fn;
 const LOESS=K(0xa49260),OLIVE=K(0x82804c),STRAW=K(0xbaa46e),LIMEF=K(0xa89e8c),GRAV=K(0x8c8578),COBB=K(0x6e6a62),
  SEEP=K(0x4c5c3a),BAS=K(0x2e3036),LIME=K(0xc4b090),RUST=K(0x9e5e38);
 const t=new THREE.Color();
 return(c,wx,wz,n,pav,pav2)=>{const F=k=>FC.at(FC.a[k],wx,wz),h=FC.at(FC.a.h,wx,wz);
  c.copy(LOESS).lerp(OLIVE,smooth(.38,.66,pav)*.75).lerp(STRAW,smooth(.52,.74,pav2)*.55).lerp(LIMEF,smooth(.66,.84,pav)*.35);
  t.copy(GRAV).lerp(COBB,smooth(.42,.7,pav2));
  c.lerp(t,clamp(F('terrace')*.9+F('shelf')*.8+F('flow')*.85,0,1));
  c.lerp(SEEP,F('seep')*.72);
  const cyc=((h+pav*11)%58+58)%58/58,bed=smooth(.54,.64,cyc)*(1-smooth(.92,.98,cyc));
  t.copy(BAS).lerp(LIME,bed).lerp(RUST,bed*smooth(.48,.78,pav2)*.52);
  c.lerp(t,smooth(.28,.68,F('rock')));};})();
// the three library layers' weights per vertex (84, STATION_GL): x the dry plateau steppe (ground.puna), y the canyon's colluvial gravel and bars
// (ground.gravel), z the rocky basalt-and-limestone walls (rock.basalt); [3] the swirl-tussock fleck print on the open bench
const STATION_GL=(x,z,rk)=>{const gr=Math.min(1,(FC.at(FC.a.terrace,x,z)+FC.at(FC.a.shelf,x,z)+FC.at(FC.a.flow,x,z))*(1-rk*.7));
 const bn=Math.max(0,(1-gr)*(1-rk));return[bn,gr*(1-rk*.4),rk,bn*.68];};
const STATION_KGL=()=>{const p=KGROUND.layer('shigh','ground.puna',{w:'vGL.x',amt:.52,gain:1.25,tint:'diffuse',name:'plateau steppe'}),
 g=KGROUND.layer('shigh','ground.gravel',{w:'vGL.y',amt:.72,gain:1.2,tint:'diffuse',name:'canyon gravel'}),
 r=KGROUND.layer('shigh','rock.basalt',{w:'vGL.z',amt:.58,gain:1.18,tint:'diffuse',name:'ablaq cliff rock'});
 return p&&g&&r?[p,g,r]:[];};
// THE ABLAQ STRATA (84, STATION_GROUND_GLSL): thick dark polygonal-basalt flows (~34 m) alternating with irregular pale iron-stained limestone
// interbeds (~22 m, split by a dark shale parting) matching the four structural cliff tiers of Qappu-Narun
const STATION_GROUND_GLSL='{float abW=smoothstep(0.32,0.74,vRock)*smoothstep(3314.0,3290.0,vGWP.y);'+
 'float warp=sin(vGWP.x*0.0038+vGWP.z*0.0029)*5.5+sin(vGWP.x*0.013-vGWP.z*0.011)*2.1;'+
 'float cyc=fract((vGWP.y+warp)/58.0);'+
 'float b1=smoothstep(0.56,0.61,cyc)*(1.0-smoothstep(0.75,0.79,cyc));'+
 'float b2=smoothstep(0.83,0.87,cyc)*(1.0-smoothstep(0.94,0.98,cyc));'+
 'float lime=clamp(b1+b2,0.0,1.0);'+
 'float colJ=0.86+0.14*sin(vGWP.x*1.55+sin(vGWP.z*0.7)*1.4)*sin(vGWP.z*1.35);'+
 'vec3 basC=diffuse*vec3(0.28,0.29,0.34)*colJ;'+
 'float rust=smoothstep(0.45,0.86,fract(sin(vGWP.x*0.017-vGWP.z*0.013)*2.3+cyc*3.1));'+
 'vec3 limC=diffuse*mix(vec3(0.88,0.78,0.62),vec3(0.74,0.46,0.29),rust*0.65);'+
 'diffuseColor.rgb=mix(diffuseColor.rgb,mix(basC,limC,lime),abW*0.72);}';
// the far field (85, STATION_FARCOL): ochre-olive dry steppe plateau, darker basalt-grey in the gorges, pale dusty crests above 3.65 km
const STATION_FARCOL=(x,z,h,n,L)=>{const{smooth}=BIO.fn,a=L([134,122,82]),b=L([108,104,70]),g=L([72,72,76]),hi=L([166,156,136]),
 m=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
 let c=m(a,b,n);c=m(c,g,smooth(3260,3120,h)*.75);return m(c,hi,smooth(3520,3820,h)*.65);};
// the mirror-handed tree a camera finds (89zx): a helix poplar on the canyon's gravel terrace near the spine
const STATION_MIRROR={key:'helixpoplar',score:(x,z)=>FC.at(FC.a.terrace,x,z)*2-Math.abs(z)/1200,box:[-500,-900,500,900]};
// the air (stations/common/89z-host-atmos.js): dry 1.06 atm bench (no summer snow), faint morning river mist along Qappu-Narun's floor
const STATION_AIR={snowBase:0,mist:{density:.00055,y:3092,depth:26,noise:.65}};
const STATION_Q=1;
