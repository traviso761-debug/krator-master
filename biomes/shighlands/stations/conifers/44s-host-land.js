// ================================================================= HOST — the land of STATION 2: THE SPIRAL CONIFERS (3.6-4.3 km; PLAN-STATIONS.md)
// The plateau just behind the southern Inner Wall's rim on map 5.1 (px 762,1059; old canvas 490,729): 3,786 m, Dsc, 439 mm, +4 °C (17/-9),
// 1.00 atm, the ground round it 3.4-4.8 km in 30 km, ET on the higher ground and Dsb below. A 5.2 km piece of it: a broad ridge rising to
// ~4.3 km in the south-east (wind-shorn: the coil juniper's krummholz on its crest), a shallow valley falling to ~3.65 km in the north-west,
// long swells between, two granite tors (the larger with a spiral ledge, as the Whorl Stone's), a snowmelt tarn in a hollow. Snowbeds lie
// into summer on the north-facing slopes and in the hollows (Dsc: the summer dry, the snow the year's water). Read by stations/common/45.
// x east, z south (north is -z). Every height is the model's own (page y = metres above sea level).
const STATION_LAND=(function(){const {smooth,clamp,fbm}=BIO.fn;
 // the ridge's axis runs south-west to north-east across the south-east; s: distance across it (positive toward the ridge)
 const ridge=(x,z)=>{const s=(x*.55+z*.83);return smooth(-400,2600,s);};
 const base=(x,z)=>3700+560*Math.pow(ridge(x,z),1.3)+120*(fbm(x*.0006+7,z*.0006-3,61,3)-.5)+45*(fbm(x*.0022-2,z*.0022+5,63,2)-.5)
  -70*smooth(900,0,Math.abs((x+z*.35)+700+300*Math.sin(z*.0011)))*smooth(1200,-2000,x*.55+z*.83);   /* the north-west valley's floor */
 // aspect: how much the ground faces north (-z), from the base's own gradient (the snowbeds' shade), and the curvature (a hollow holds snow)
 const north=(x,z)=>{const e=6,gz=(base(x,z+e)-base(x,z-e))/(2*e),gx=(base(x+e,z)-base(x-e,z))/(2*e),g=Math.hypot(gx,gz);return g<1e-4?0:clamp(gz/g,-1,1)*smooth(.02,.12,g);};
 const hollow=(x,z)=>{const e=40,c=base(x,z);return clamp(((base(x+e,z)+base(x-e,z)+base(x,z+e)+base(x,z-e))/4-c)/6,-1,1);};
 return{name:'The spiral conifers',R:2600,seed:2047,haze:0xc8d4e2,fog:.00011,sun:[-900,1100,-400],wet:.42,coldFrom:3300,
  base,
  tors:[{x:-900,z:900,r:150,h:70,step:8,s:2.2,spiral:1,name:'The Coil Stone'},{x:1300,z:-600,r:110,h:40,step:7,s:4.1},{x:1700,z:1500,r:90,h:30,step:6,s:5.7}],
  tarn:{x:-1300,z:-900,r:70,depth:4},
  extra:['snow','exposed','meadow','north'],
  fogAt:()=>.04,
  // snow: snowbeds where the ground faces north or lies in a hollow, more with height; exposed: the ridge's crest, wind-shorn; meadow: the
  // openings (the valley's floor and patches on the swells)
  fields:(x,z,h,slope,F)=>{const n=north(x,z),hl=hollow(x,z);
   F.north=n*.5+.5;
   F.snow=clamp(smooth(.15,.75,n)*smooth(3750,4150,h)*.9+smooth(.1,.5,hl)*smooth(3700,4000,h)*.7+.12*(fbm(x*.004,z*.004,71,2)-.5),0,1)*(1-smooth(.6,.85,slope));
   const cr=ridge(x,z);F.exposed=clamp(smooth(4080,4240,h)*(.6+.4*smooth(.5,1,cr))+.2*(fbm(x*.003+1,z*.003,73,2)-.5),0,1);
   F.meadow=clamp(smooth(.62,.78,fbm(x*.0016+3,z*.0016+9,75,3))*.9+smooth(150,0,Math.abs((x+z*.35)+700+300*Math.sin(z*.0011)))*smooth(1200,-2000,x*.55+z*.83)*.6,0,1);
   F.wet=clamp(.38+.25*F.snow+.1*hl,0,1);},
  spine:[[0,0],[-1300,-900],[-900,900],[1300,-600],[600,1400],[1700,1500],[-1800,-1800],[-200,-1600],[1800,200],[-2000,500],[300,600]],
  lod:{hero:240,mid:580,far:2400,floor:[180,440]}};})();
// the ground's colours (84-host-ground.js, STATION_PAINT): needle litter under the forest, the meadows' green and gold, the snowbeds white, the
// krummholz crest's grey-green stone and lichen, granite on the tors (the kit's own granite term still draws the steep)
const STATION_PAINT=(function(){const K=h=>new THREE.Color(h),{smooth,clamp}=BIO.fn;
 const LIT=K(0x6e5a44),LIT2=K(0x5a4a38),MOSS=K(0x6a7a3a),MEAD=K(0x8a9a4a),MEAD2=K(0xb0a45a),SNOW=K(0xeef2f6),SNOW2=K(0xd8e0ea),CREST=K(0x8a8c7a),GRAN=K(0x9a948e);
 const t=new THREE.Color();
 return(c,wx,wz,n,pav,pav2)=>{const F=k=>FC.at(FC.a[k],wx,wz);
  c.copy(LIT).lerp(LIT2,smooth(.4,.7,pav)).lerp(MOSS,smooth(.55,.75,pav2)*.5);
  t.copy(MEAD).lerp(MEAD2,smooth(.45,.7,pav));c.lerp(t,F('meadow')*.85);
  t.copy(CREST).lerp(MEAD2,smooth(.5,.7,pav2)*.3);c.lerp(t,F('exposed')*.8);
  c.lerp(GRAN,smooth(.3,.65,F('rock'))*.8);
  t.copy(SNOW).lerp(SNOW2,clamp(.5+n*2,0,1));c.lerp(t,smooth(.35,.6,F('snow')));};})();
// the three library layers' weights per vertex (84, STATION_GL): x the needle litter (ground.needles), y the meadow grass (ground.paramo), z the snow
// (ground.snow); [3] the tussock print's share (the meadows only)
const STATION_GL=(x,z,rk)=>{const{smooth}=BIO.fn,sn=smooth(.35,.6,FC.at(FC.a.snow,x,z))*(1-rk),md=FC.at(FC.a.meadow,x,z)*(1-sn)*(1-rk),ex=FC.at(FC.a.exposed,x,z);
 return[(1-md)*(1-sn)*(1-rk)*(1-ex*.6),md,sn,md*.6];};
const STATION_KGL=()=>{const n=KGROUND.layer('shigh','ground.needles',{w:'vGL.x',amt:.65,gain:1.2,tint:'diffuse',name:'needle litter'}),
 m=KGROUND.layer('shigh','ground.paramo',{w:'vGL.y',amt:.5,gain:1.3,tint:'diffuse',name:'meadow grass'}),s=KGROUND.layer('shigh','ground.snow',{w:'vGL.z',amt:.9,gain:1.0,name:'snowbed'});
 return n&&m&&s?[n,m,s]:[];};
// the far field (85, STATION_FARCOL): the dark conifer plateau, its higher swells white with old snow and grey with the krummholz's stone
const STATION_FARCOL=(x,z,h,n,L)=>{const{smooth}=BIO.fn,a=L([48,62,46]),b=L([70,80,58]),r=L([150,150,140]),s=L([226,232,238]),m=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t];
 let c=m(a,b,n);c=m(c,r,smooth(4150,4400,h)*.7);return m(c,s,smooth(4300,4700,h)*.8);};
// the mirror-handed tree a camera finds (89zx): the rope pine nearest the deepest forest
const STATION_MIRROR={key:'ropepine',score:(x,z)=>(1-FC.at(FC.a.meadow,x,z))*(1-FC.at(FC.a.exposed,x,z))*(1-FC.at(FC.a.snow,x,z)),box:[-2200,-2200,2200,2200]};
// the air (stations/common/89z-host-atmos.js): the season's old snow on the lit materials, a dawn mist pooled in the north-west valley
const STATION_AIR={snowBase:.25,mist:{density:.0007,y:3720,depth:30,noise:.7}};
// the build's default quality (89zx): this station was tuned at 1
const STATION_Q=1;
