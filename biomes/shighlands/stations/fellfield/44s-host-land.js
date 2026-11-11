// ================================================================= HOST — the land of STATION 3: THE SPIRAL FELLFIELD AND THE ICE (5.25-6.05 km; PLAN-STATIONS.md)
// Map 5.1 px 816,1058 (old canvas 544,728): 5,208 m, ET, 957 mm, -5 °C (8/-18), 0.83 atm, the ground rising east to 6.4 km within 20 km; the
// nearest EF lies 66 km south-east, so the ice here is a small cirque glacier under the summit ridge (at ~6 km the warm month is near 0 °C), not
// an ice cap. A 5.2 km piece: the fellfield rising from ~5.25 km in the west to a summit ridge at ~6.05 km in the east; on the ridge's north
// flank a cirque, its glacier spilling as an ICEFALL whose crevasses curve (arcs bowed downstream, skewed one way, as everything here turns)
// into a tarn at its snout; THE WHORL CROWN, a summit tor whose ledges climb it in a spiral (the Whorl Stone's theme carried up); scree under
// the steep; the flat terraces' ground sorted by frost into SPIRALS of stones (the ground's shader draws them, and stones are set on the same
// arms near the eye: STATION_SORTED below); snowbeds in the shade. Read by stations/common/45. x east, z south.
const STATION_LAND=(function(){const {smooth,clamp,fbm}=BIO.fn;
 const CQ={x:1350,z:-950,r:720};   /* the cirque */
 const raw=(x,z)=>5250+800*Math.pow(smooth(-2600,2400,x+.25*z),1.15)+130*(fbm(x*.0007+11,z*.0007-4,81,3)-.5)+40*(fbm(x*.003,z*.003,83,2)-.5)
  // terraces: the fellfield's gentle treads (solifluction), where the sorted spirals lie
  -18*Math.sin(((x+.25*z)/160)*Math.PI*2)*smooth(1600,-1800,x);
 const cirque=(x,z,h)=>{const d=Math.hypot(x-CQ.x,(z-CQ.z)*1.15);if(d>CQ.r*1.25)return h;
  const bowl=5560+40*(d/CQ.r)*(d/CQ.r);   /* the cirque's floor, rising to its lip */
  return h-Math.max(0,h-bowl)*smooth(CQ.r*1.25,CQ.r*.75,d)*(z<CQ.z+CQ.r*.3?1:smooth(CQ.z+CQ.r*.9,CQ.z+CQ.r*.3,z));};
 const base=(x,z)=>cirque(x,z,raw(x,z));
 // the ice: a centre line from the headwall to the snout, its width and thickness along it (s 0 the top, 1 the snout)
 const ICE=[[1950,-1350],[1700,-1180],[1450,-1000],[1220,-820],[1030,-690]];
 const north=(x,z)=>{const e=8,gz=(base(x,z+e)-base(x,z-e))/(2*e),gx=(base(x+e,z)-base(x-e,z))/(2*e),g=Math.hypot(gx,gz);return g<1e-4?0:clamp(gz/g,-1,1)*smooth(.02,.12,g);};
 const iceNear=(x,z)=>{let best=1e9,bs=0;for(let i=0;i+1<ICE.length;i++){const a=ICE[i],b=ICE[i+1],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),
   px=a[0]+dx*t,pz=a[1]+dz*t,d=Math.hypot(x-px,z-pz);if(d<best){best=d;bs=(i+t)/(ICE.length-1);}}return{d:best,s:bs,w:mix(150,70,bs)};};
 function mix(a,b,t){return a+(b-a)*t;}
 return{name:'The spiral fellfield and the ice',R:2600,seed:3047,haze:0xc8d2e0,fog:.0001,sun:[-800,1150,-300],wet:.4,coldFrom:4800,
  base,ICE,iceNear,CQ,
  tors:[{x:2050,z:350,r:170,h:75,step:8,s:1.9,spiral:1,name:'The Whorl Crown'},{x:-600,z:1200,r:90,h:28,step:6,s:3.3},{x:300,z:-1700,r:80,h:24,step:6,s:6.1}],
  tarn:{x:880,z:-610,r:75,depth:6},
  extra:['snow','scree','sorted','ice','north'],
  fogAt:()=>.05,
  fields:(x,z,h,slope,F,K)=>{const n=north(x,z),I=iceNear(x,z);
   F.north=n*.5+.5;
   F.ice=I.d<I.w*.5?1:smooth(I.w*.5+12,I.w*.5,I.d);
   F.snow=clamp(smooth(.2,.75,n)*smooth(5500,5900,h)*.85+smooth(5900,6050,h)*.5+.15*(fbm(x*.004,z*.004,85,2)-.5),0,1)*(1-smooth(.62,.85,slope))*(1-F.ice);
   F.scree=clamp(smooth(.32,.55,slope)*(1-smooth(.75,.9,slope))+K.foot*.8,0,1)*(1-F.ice);
   F.sorted=clamp(smooth(.14,.05,slope)*(1-F.scree)*(1-smooth(.35,.6,F.snow))*(1-F.ice)*(1-K.rock)*smooth(.42,.58,fbm(x*.0018+5,z*.0018-7,87,3)),0,1);
   F.rock=Math.max(F.rock,F.ice*0);F.wet=clamp(.3+.4*F.snow+.3*F.ice,0,1);F.barren=clamp(.5+.5*F.scree,0,1);},
  mask:(x,z,h)=>{const I=iceNear(x,z);return I.d<I.w*.5+3?0:1;},
  spine:[[0,0],[880,-610],[1400,-950],[2050,350],[-600,1200],[300,-1700],[-1800,-600],[-1500,1500],[900,1500],[-300,-500],[1500,-200]],
  lod:{hero:220,mid:540,far:2400,floor:[160,420]}};})();
const STATION_AIR={snowBase:.45,frozen:false,mist:{density:.0006,y:5600,depth:25,noise:.8}};
// the ground (84): STATION_PAINT the fellfield's grey-brown stone and lichen crust, the scree, the snow; STATION_GL x the lichen crust (ground.lichen),
// y the scree (ground.scree), z the snow (ground.snow); [3] the sorted spirals' weight (the shader term below), in the tussock print's place
const STATION_TUFT=false;
const STATION_PAINT=(function(){const K=h=>new THREE.Color(h),{smooth,clamp}=BIO.fn;
 const FELL=K(0x8a8070),FELL2=K(0x7a7466),CRUST=K(0x9a9468),RUST=K(0x9a6a44),SCREE=K(0x8c8a86),SNOW=K(0xf0f4f8),SNOW2=K(0xdae2ec),ICE=K(0xb8cad8),GRAN=K(0x9a948e);
 const t=new THREE.Color();
 return(c,wx,wz,n,pav,pav2)=>{const F=k=>FC.at(FC.a[k],wx,wz);
  c.copy(FELL).lerp(FELL2,smooth(.4,.7,pav)).lerp(CRUST,smooth(.55,.75,pav2)*.6).lerp(RUST,smooth(.7,.85,pav)*.25);
  c.lerp(SCREE,F('scree')*.85);c.lerp(GRAN,smooth(.3,.65,F('rock'))*.7);
  t.copy(SNOW).lerp(SNOW2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.35,.6,F('snow')));c.lerp(ICE,F('ice'));};})();
const STATION_GL=(x,z,rk)=>{const{smooth}=BIO.fn,sn=smooth(.35,.6,FC.at(FC.a.snow,x,z))*(1-rk),sc=FC.at(FC.a.scree,x,z)*(1-sn),ic=FC.at(FC.a.ice,x,z);
 return[(1-sc)*(1-sn)*(1-rk)*(1-ic),sc*(1-rk*.5)*(1-ic),sn,FC.at(FC.a.sorted,x,z)];};
const STATION_KGL=()=>{const l=KGROUND.layer('shigh','ground.lichen',{w:'vGL.x',amt:.55,gain:1.2,tint:'diffuse',name:'lichen crust'}),
 s=KGROUND.layer('shigh','ground.scree',{w:'vGL.y',amt:.75,gain:1.15,tint:'diffuse',name:'scree'}),n=KGROUND.layer('shigh','ground.snow',{w:'vGL.z',amt:.9,gain:1.0,name:'snowbed'});
 return l&&s&&n?[l,s,n]:[];};
// THE SORTED SPIRALS: frost heave sorts the stones of the flat treads to the edges of cells ~8 m across (the sorted circles of Earth's fellfields);
// here every cell's border is wound into a spiral, right-handed. One rule for the shader and the stones (62's floor): cells on an 8 m grid, the
// centre at the cell's middle; a cell's phase and its one or two arms from a Weyl sequence of the cell's indices (no sine hash, no random draw);
// the stones lie where theta/TAU*arms - r/pitch + phase is a whole number, out to 3.6 m. The weight is the `sorted` field (the treads)
const STATION_SORTED={cell:8,pitch:1.4,rMax:3.6,
 phase:(ix,iz)=>{const v=ix*.618034+iz*.414214;return v-Math.floor(v);},arms:(ix,iz)=>{const v=ix*.381966+iz*.707107;return v-Math.floor(v)>.5?2:1;}};
const STATION_GROUND_GLSL='{vec2 cc=floor(vGWP.xz/8.0);vec2 dd=vGWP.xz-(cc+0.5)*8.0;float rr=length(dd);float ph=fract(cc.x*0.618034+cc.y*0.414214);'+
 'float arms=fract(cc.x*0.381966+cc.y*0.707107)>0.5?2.0:1.0;float vv=atan(dd.y,dd.x)/6.2831853*arms-rr/1.4+ph;'+
 'float st=1.0-smoothstep(0.06,0.15,abs(fract(vv+0.5)-0.5));float ww=vPar*(1.0-smoothstep(3.3,3.9,rr))*smoothstep(0.3,0.8,rr);'+
 'diffuseColor.rgb=mix(diffuseColor.rgb,diffuse*vec3(0.74,0.72,0.68),st*ww*0.8);diffuseColor.rgb*=1.0-(1.0-st)*ww*0.22;}';
// the far field: the fellfield's grey-brown, white above 6 km
const STATION_FARCOL=(x,z,h,n,L)=>{const{smooth}=BIO.fn,a=L([128,120,104]),b=L([110,106,96]),s=L([236,240,244]),m=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
 return m(m(a,b,n),s,smooth(5800,6200,h)*.9);};
const STATION_MIRROR=null;   /* no trees up here */
// the build's default quality (89zx): this station was tuned at 1
const STATION_Q=1;
