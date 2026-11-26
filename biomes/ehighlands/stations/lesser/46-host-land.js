// ================================================================= HOST — the land of station 3: the Lesser Throne (built 2026-11-09)
// The young volcano on the eastern Inner Wall's crest, east of the Throne: the eruption that made it buried the Order of Historians' first
// monastery and its archive (LORE.md, the History Monks; the lava tube tube_lesser_06, "Entombed First Monastery Lava-Tube Vaults", runs
// ESE from the crater: DATA.tubes). The region's one vent (DATA.vents: floor 6,070 m, WNW rim 6,880 m); scale model 5.1 px 1130,854 (old
// canvas 858,524): EF on the floor (mean -9 C, warm month +4, cold -22), ~110 mm a year, 0.75 atm on the floor and 0.68 on the high rim.
// The page (8.4 km; y is metres above a datum of 6,000 m): the summit caldera, its rim high to the west-north-west and broken to the
// east-south-east where the last lava left it; a young cinder cone on the floor with its own steaming crater; fumaroles on the cone and along
// the ring fault; a small acid lake frozen under the high rim; the flow out through the breach and down the flank, and on it the skylight of
// the buried archive's tube. A polar desert of ash and pumice, snow on the high rim and the shaded walls: NOTHING LIVES but round the vents,
// where the warm ground keeps a ring of the kit's hardiest (mat algae, then turf, cushions and woolbacks): the fumarole oases of the real
// Andes' highest volcanoes. The giant at azimuth 58, altitude 34: the oases' cushions turn to it like the plateau's. The Godthrone stands on
// the south-western horizon, 450 km off and 25 km high (the sky's ridges).
const STAGE={id:'lesser',name:'The Lesser Throne',R:4200,giantAz:58,groundN:560,datum:6000,
 site:{px:858,py:524},model:{px51:[1130,854],h:6070,rain:110,cls:'EF',tm:-9,tw:4,tc:-22,atm:.75},
 title:'Krator biome — the eastern highlands: the Lesser Throne',
 hint:'The eastern highlands, station 3: the Lesser Throne, the young volcano on the eastern Inner Wall\'s crest (floor 6,070 m, rim 6,880 m, ~0.7 atm). Its summit caldera, a steaming cinder cone, fumaroles, a frozen acid lake, the lava that buried the Order\'s first monastery and the skylight of the archive\'s tube; nothing lives but round the vents, where the warm ground keeps mat algae, turf and cushions turned to the giant',
 climate:{cold:true},
 sky:{"air":{"pressure":0.72,"dustK":0.02,"dust":[0.82,0.84,0.88]},"clouds":{"cover":0.08},"fogDensity":0.00005,
  "ridges":[{"base":2.0,"amp":0.35,"cycles":6,"octaves":2,"seed":701,"win":[226,7,1.3],"floor":-1,"dist":450000,"haze":0.55,"rock":[0.42,0.4,0.42],"snow":[0.96,0.96,0.98],"snowH":12000},
   {"base":0.3,"amp":0.35,"cycles":40,"octaves":3,"seed":702,"dist":60000,"haze":0.6,"rock":[0.5,0.52,0.56],"snow":[0.95,0.95,0.97],"snowH":800},
   {"base":0.6,"amp":0.25,"cycles":20,"octaves":2,"seed":703,"win":[270,10,1.6],"dist":140000,"haze":0.7,"rock":[0.44,0.42,0.42]}]},
 expect:{species:['cushion','woolback'],mother:false,vigil:false,chemistry:false},
 fields:['ash','lava','warm'],ground:['ash','scoria','sinter'],hfog:{falloff:1/1200,mist:0},
 kettle:false,coneCol:0xd8cc98,
 far:{out:16000,col:{a:[118,110,102],b:[92,86,82],scree:[84,80,78],snow:[228,232,240],haze:[176,190,212]},cold:y=>clamp(.55+y/2200,0,1)},
 lod:{hero:300,mid:820,far:3000,floor:[260,640]},poolName:'An acid pool',regH:1400};
camera.far=40000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the land
const TERR={R:STAGE.R};
const GIANT_AZ=STAGE.giantAz,GX=Math.sin(GIANT_AZ*Math.PI/180),GZ=-Math.cos(GIANT_AZ*Math.PI/180);
const MOTHER=null,BOG=null,TORS=[],GULLY=[],FLOWERING=null,GEO=null;
const zF=x=>0,xg=(G,z)=>0;
// bearings from north, clockwise (x east, z south): the high rim to the WNW (292), the breach to the ESE (112)
const bear=(x,z)=>Math.atan2(x,-z),A_HI=292*Math.PI/180,A_LO=112*Math.PI/180;
const rimR=a=>2600*(1+.06*Math.sin(3*a+1)+.04*Math.sin(7*a+2));
const rimH=a=>{const w=.5+.5*Math.cos(a-A_HI);return 250+630*Math.pow(w,1.3)+25*Math.sin(5*a+.7);};
const FLOOR=70;
// THE CONE: a young cinder cone on the floor, east of the middle, with its crater; THE LAKE under the high rim, frozen
const CONE={x:260,z:140,r:430,h:165,cr:95,cd:48,name:'The young cone'};
const TARN={x:-1250,z:-260,r:210};
// the breach: the rim cut down to its floor where the lava left (a notch about A_LO), and the flow's channel down the flank
const notch=a=>{let d=Math.atan2(Math.sin(a-A_LO),Math.cos(a-A_LO));return smooth(.32,.06,Math.abs(d));};
function coneAt(x,z){const d=Math.hypot(x-CONE.x,z-CONE.z);if(d>CONE.r*1.2)return 0;
 let h=CONE.h*Math.pow(smooth(CONE.r,CONE.cr*1.1,d),1.15);h-=CONE.cd*smooth(CONE.cr,CONE.cr*.35,d);return h;}
function calderaH(x,z){const r=Math.hypot(x,z),a=bear(x,z),R0=rimR(a),RF=R0*.72,nb=notch(a);
 const top=mix(rimH(a),FLOOR+60,nb);
 let h;
 if(r<RF)h=FLOOR+10*(fbm(x*.002,z*.002,711,2)-.5)-14*smooth(700,0,Math.hypot(x-TARN.x,z-TARN.z));
 else if(r<R0){const t=smooth(RF,R0,r);h=mix(FLOOR,top,Math.pow(t,.75));}
 else{const q=r-R0;h=top-q*(.15+.13*Math.exp(-q/600))-nb*0;}
 h+=coneAt(x,z);
 /* the rough of young rock: blocky ash flows and spatter, rougher on the walls */
 h+=6*(fbm(x*.01,z*.01,712,3)-.5)+4*(fbm(x*.04,z*.04,713,2)-.5)*smooth(RF*.9,R0,r);
 return h;}
// THE FLOW: young lava from the cone's south-east foot across the floor, out through the breach and down the flank (a raised tongue, ~6 m)
const FLOW=(function(){const P=[];for(let t=0;t<=1.0001;t+=.02){const r=mix(CONE.r*.6,TERR.R*1.05,t),a=A_LO+.12*Math.sin(t*7)+(t<.25?.35*(.25-t):0);
 P.push([CONE.x*(1-t)+Math.sin(a)*r,CONE.z*(1-t)-Math.cos(a)*r,mix(140,240,t)]);}return P;})();
function flowD(x,z){let best=1e9,w=0,s=0;for(let i=0;i<FLOW.length-1;i++){const A=FLOW[i],B=FLOW[i+1],ux=B[0]-A[0],uz=B[1]-A[1],L2=ux*ux+uz*uz;
 let t=((x-A[0])*ux+(z-A[1])*uz)/L2;t=clamp(t,0,1);const d=Math.hypot(x-A[0]-ux*t,z-A[1]-uz*t);if(d<best){best=d;w=mix(A[2],B[2],t);s=(i+t)/(FLOW.length-1);}}return{d:best,w,s};}
function lavaAt(x,z){const F=flowD(x,z),edge=F.w*(1+.18*Math.sin(F.s*40+x*.01)+.1*(fbm(x*.006,z*.006,714,2)-.5));return smooth(edge,edge*.7,F.d);}
// THE TUBE'S SKYLIGHT: where the buried archive's tube (tube_lesser_06) runs under the flow on the ESE flank, its roof fallen in
const SKY_HOLE=(function(){const i=Math.round(FLOW.length*.78),p=FLOW[i];return{x:p[0],z:p[1],r:11,d:14,name:'The skylight of the buried archive (tube_lesser_06)'};})();
function landH(x,z){let h=calderaH(x,z);h+=6*lavaAt(x,z);return h;}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 const ds=Math.hypot(x-SKY_HOLE.x,z-SKY_HOLE.z);if(ds<SKY_HOLE.r*1.6)h-=SKY_HOLE.d*smooth(SKY_HOLE.r*1.5,SKY_HOLE.r*.8,ds);
 const dt=Math.hypot(x-TARN.x,z-TARN.z);if(dt<TARN.r*1.5)h=mix(h,TARN.y0-4*smooth(TARN.r,0,dt),smooth(TARN.r*1.35,TARN.r*.85,dt));
 for(const P of POOLS){const dp=Math.hypot(x-P.x,z-P.z);if(dp<P.r*1.5)h-=1.2*smooth(P.r*1.4,P.r*.5,dp);}
 return h;}
TARN.y0=FLOOR-10;
// THE VENTS (86): on the cone's crater rim and floor, and along the ring fault at the walls' foot; k their size (fumaroles: none spouts)
const VENTS=(function(){const R=KRAND.stream(47031),V=[{x:CONE.x,z:CONE.z,k:1,name:'The cone\'s throat'}];
 for(let i=0;i<5;i++){const a=i/5*TAU+R.next()*.6;V.push({x:CONE.x+Math.cos(a)*CONE.cr*.8,z:CONE.z+Math.sin(a)*CONE.cr*.8,k:.45+R.next()*.3});}
 for(let i=0;i<7;i++){const a=-.9+i*.45+R.next()*.2,rr0=rimR(a)*.7;V.push({x:Math.sin(a)*rr0,z:-Math.cos(a)*rr0,k:.4+R.next()*.4});}   /* the ring fault, east and south */
 return V;})();
VENTS.forEach(V=>{V.y=undefined;});
// the acid pools by the ring-fault vents (warm: open water)
const POOLS=(function(){const P=[];VENTS.slice(6,10).forEach((V,i)=>{const a=Math.atan2(V.z,V.x),x=V.x-Math.cos(a)*40,z=V.z-Math.sin(a)*40;P.push({x,z,r:9+i*2});});return P;})();
POOLS.forEach(P=>{let lo=1e9;for(let k=0;k<12;k++){const a=k/12*TAU;lo=Math.min(lo,terrainH0(P.x+Math.cos(a)*P.r*1.15,P.z+Math.sin(a)*P.r*1.15));}P.y=lo-.12;});
const TARNL=(function(){let lo=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,terrainH0(TARN.x+Math.cos(a)*TARN.r*1.2,TARN.z+Math.sin(a)*TARN.r*1.2));}return lo-.25;})();
function waterH(x,z){if(Math.hypot(x-TARN.x,z-TARN.z)<TARN.r*1.3)return TARNL;for(const P of POOLS)if(Math.hypot(x-P.x,z-P.z)<P.r*1.2)return P.y;return -1e9;}
const SPTS=[],STREAMW=0;   /* no stream: the snow sublimes in this air more than it melts */
// ---------------------------------------------------------------- the climate fields (the definitions; 47-host-fields.js caches them)
// warm: the vents' heat in the ground (each vent's reach by its size); cold falls with it, so the kit's fell and puna come back in rings;
// barren: everywhere the warmth does not reach (the kit plants nothing there); ash, lava: the ground's own (84 paints them)
const SUNH=(function(){const l=Math.hypot(SUNP[0],SUNP[2]);return[SUNP[0]/l,SUNP[2]/l];})();
function warmAt(x,z){let w=0;for(const V of VENTS){const d=Math.hypot(x-V.x,z-V.z),R0=50+140*V.k;if(d<R0)w=Math.max(w,smooth(R0,R0*.15,d));}return w;}
function fieldsAt(x,z,h,slope,gx,gz){const warm=warmAt(x,z),lava=lavaAt(x,z),r=Math.hypot(x,z),a=bear(x,z),R0=rimR(a);
 const gl=Math.hypot(gx,gz)||1,sunF=clamp(-(gx*SUNH[0]+gz*SUNH[1])/gl,0,1)*smooth(.08,.3,slope),shade=smooth(.15,.5,slope)*(1-clamp(-(gx*SUNH[0]+gz*SUNH[1])/gl+.3,0,1));
 const cold=clamp(.6+(h-FLOOR)/2600+.14*shade-.5*warm,0,1);
 const rock=clamp(Math.max(smooth(.55,.85,slope)*.85,lava*.5,smooth(CONE.cr*1.3,CONE.cr,Math.hypot(x-CONE.x,z-CONE.z))*.6),0,1);
 const tarn=smooth(TARN.r*1.5,TARN.r*.9,Math.hypot(x-TARN.x,z-TARN.z));
 const ash=clamp(.85-lava-.6*smooth(.6,.85,slope)-.6*warm,0,1);
 return{wet:clamp(.12+.35*warm+.3*tarn,0,1),flow:0,upland:clamp(h/900,0,1),rock,slope,cold,bog:0,mother:0,geo:smooth(.5,.85,warm),gully:0,sun:sunF,tarn,tor:0,
  ash,lava,warm,barren:clamp(1-smooth(.12,.3,warm),0,1),canyon:0,rim:smooth(R0*.95,R0,r)*smooth(R0*1.1,R0,r),dune:0,oasis:0,abyss:0,salt:0};}
// ---------------------------------------------------------------- the LOD spine and the kit's windows
const OBSTACLES=[];
const SPINE=[[CONE.x,CONE.z],[CONE.x+CONE.r*.8,CONE.z+CONE.r*.3],[TARN.x,TARN.z],[SKY_HOLE.x,SKY_HOLE.z]].concat(VENTS.slice(6).map(V=>[V.x,V.z]));
STAGE.windows={water:[TARN.x-TARN.r*1.4,TARN.z-TARN.r*1.4,TARN.x+TARN.r*1.4,TARN.z+TARN.r*1.4]};
STAGE.places=[{name:'The caldera of the Lesser Throne',x:0,z:0,r:2700,h:1000,dy:60},{name:CONE.name+' (a cinder cone)',x:CONE.x,z:CONE.z,r:CONE.r,h:CONE.h+40,dy:10},
 {name:'The breach (where the last lava left the caldera)',x:Math.sin(A_LO)*rimR(A_LO),z:-Math.cos(A_LO)*rimR(A_LO),r:420,h:300,dy:40},
 {name:SKY_HOLE.name,x:SKY_HOLE.x,z:SKY_HOLE.z,r:SKY_HOLE.r*1.6,h:30,dy:SKY_HOLE.d+6},
 {name:'The high rim (6,880 m)',x:Math.sin(A_HI)*rimR(A_HI),z:-Math.cos(A_HI)*rimR(A_HI),r:500,h:200,dy:40}];
// the far field (85): the flanks falling away past the square
STAGE.farH=(x,z)=>calderaH(x,z);
/* 2026-11-08 (the GPU verify): the vents' warmth is 50-190 m across and the fields' cache is 22 m a cell here, so the cached `barren` let 3 trees
   root on cold ash at an oasis's edge. 47 reads these two at full resolution (STAGE.exact), as it does the Mother */
STAGE.exact={warm:(x,z)=>warmAt(x,z),barren:(x,z)=>clamp(1-smooth(.12,.3,warmAt(x,z)),0,1)};
/* the export profile's box (verify.py reads STAGE.exportBox): the main page's [900,1200,1200,1500] is cold ash here, so the densest 300 m cell
   of the oases' plants, found after the build */
STAGE.exportBox=()=>{const C={};let b=null,bn=0;for(const T of EHIGH.TREES){const k=Math.floor(T.x/300)+','+Math.floor(T.z/300);C[k]=(C[k]||0)+1;if(C[k]>bn){bn=C[k];b=k;}}
 if(!b)return null;const p=b.split(',').map(Number);return[p[0]*300,p[1]*300,p[0]*300+300,p[1]*300+300];};
