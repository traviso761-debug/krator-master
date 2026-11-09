// ================================================================= HOST — the land of station 2: the wet face (PLAN-STATIONS.md section 3; built 2026-11-09)
// The eastern Inner Wall's windward face, where the air off the inner crater rises and drops its rain: the foot's cloud forest. Sited on scale
// model 5.1 at px 1077,754 (old canvas 805,424): 1,271 m, Cfa, 4,000 mm a year (the model's ceiling), mean +21 C (warm month 30, cold 11),
// 1.36 atm. On 5.1 the face is far steeper than the 4.21 plan drew it: about -0.2 to 3.7 km across 40 km, in listric slump terraces (the
// crater wall's concentric megaslumps, tools/scale-model/README.md). The page is 5.2 km of it, climbing east from ~1,050 m to ~1,950 m (page y
// is metres above a datum of 1,000 m): three benches tilted back against their scarps, sag ponds at their inner edges, a headwater of the
// Na'ashǫ́'ii Buruuk (r365, the Riders' tongue: "caiman stream"; it meets the river ~18 km down) cutting a slot gorge back through each scarp
// and leaving each bench over a fall. The cloud bank stands at the page's top most mornings (STAGE.belt). The giant at azimuth 61, altitude 34.
// Everything grows toward it: the combed laurels' crowns and their epiphyte gardens, the tree ferns' fronds (the kit's species 7 and 8).
// The same names as station 1's land (46-host-land.js in src/): no Mother, bog, tarn, tors, gullies or vents here (null or empty).
const STAGE={id:'face',name:'The wet face of the eastern Inner Wall',R:2600,giantAz:61,groundN:560,datum:1000,
 site:{px:805,py:424},model:{px51:[1077,754],h:1271,rain:4000,cls:'Cfa',tm:21,tw:30,tc:11,atm:1.36},
 title:'Krator biome — the eastern highlands: the wet face',
 hint:'The eastern highlands, station 2: the cloud forest at the foot of the eastern Inner Wall\'s windward face (1.0-2.0 km, ~1.36 atm, ~4,000 mm a year). Combed laurels heavy with moss and epiphyte gardens, giant\'s tree ferns, a stream falling through slot gorges from bench to bench, the cloud bank above; everything grows toward the giant',
 climate:{wet:true},
 sky:{"air":{"pressure":1.36,"dustK":0.06,"dust":[0.82,0.85,0.88]},"clouds":{"cover":0.55},"fogDensity":0.00026,
  "ridges":[{"base":5.2,"amp":1.4,"cycles":30,"octaves":3,"seed":611,"win":[90,75,1.6],"floor":-1,"dist":30000,"haze":0.38,"rock":[0.28,0.36,0.3]},
   {"base":0.5,"amp":0.25,"cycles":40,"octaves":2,"seed":612,"dist":60000,"haze":0.85,"rock":[0.48,0.54,0.6]}]},
 expect:{species:['laurel','treefern'],mother:false,vigil:false,chemistry:false},
 fields:['forest'],ground:['moss','turf'],hfog:{falloff:1/650,mist:.0012},
 /* the cloud bank (89a: ATMOS.fogBelt) on the face's windward (west-facing) slope, from the second bench to above the page */
 belt:{y0:640,y1:1150,windward:[-1,0],density:.0011,depth:80},
 far:{out:12000,col:{a:[40,60,32],b:[58,78,40],scree:[96,96,90],snow:[226,232,238],haze:[150,166,178]},cold:y=>clamp((y-1500)/2700,0,1)},
 poolName:'A sag pond',regH:1200};
camera.far=30000;camera.updateProjectionMatrix();
// ---------------------------------------------------------------- the land
const TERR={R:STAGE.R};
const GIANT_AZ=STAGE.giantAz,GX=Math.sin(GIANT_AZ*Math.PI/180),GZ=-Math.cos(GIANT_AZ*Math.PI/180);
const MOTHER=null,BOG=null,TARN=null,TARNL=null,GEO=null,TORS=[],GULLY=[],VENTS=[],FLOWERING=null;
const zF=x=>0,xg=(G,z)=>0;
// THE SCARPS: one every SP_ m along x, each RISE m over 2 HW m, wandering in z; the benches between them slope west at SLOPE and tilt back
// against the scarp above (TILT m lower at the inner edge: the slump's rotation), so water stands there
const SP_=1400,X0=-1300,RISE=220,HW=140,SLOPE=.04,TILT=14;
const wig=z=>120*Math.sin(z*.0013+.6)+40*Math.sin(z*.0051+2.2);
function steps(x,z,lip){const s=(x-X0-wig(z))/SP_,n=Math.floor(s),f=(s-n)*SP_;
 const one=f=>lip?.5*smooth(HW-15,HW,f)+.5*smooth(-HW,HW-15,f):smooth(-HW,HW,f);
 return RISE*(n+one(f)+one(f-SP_))-TILT*smooth(HW+60,SP_-HW-40,f)*(1-smooth(SP_-HW-40,SP_-HW+20,f));}
function faceH(x,z){return 60+SLOPE*(x+2600)+steps(x,z,false)+40*(fbm(z*.002+3,x*.0005,621,3)-.5)+9*(fbm(x*.011,z*.011,622,2)-.5);}
// THE STREAM: along z = zr(x), from the east (high) to the west; its bed falls with the benches but drops at each scarp's LIP (half the rise
// in 15 m: the fall) and runs the other half down a slot it has cut back through the scarp (rapids)
const zr=x=>-250+240*Math.sin(x*.0011+.4)+70*Math.sin(x*.004+1);
const bedH=x=>{const z=zr(x);return 60+SLOPE*(x+2600)+steps(x,z,true)+40*(fbm(z*.002+3,x*.0005,621,3)-.5)-4;};
const STREAMW=4;
function streamD(x,z){return{d:Math.abs(z-zr(x))*Math.cos(Math.atan(Math.abs(zr(x+1)-zr(x-1))/2)),s:x};}
function landH(x,z){return faceH(x,z);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH(x,z);
 const S=streamD(x,z);if(S.d<160){const b=bedH(x),dep=Math.max(6,h-b),wb=STREAMW+3,wt=wb+Math.max(8,dep*.32);
  /* the channel at the bed, steep walls up to the bench (a slot under each fall), a gentle valley on the benches */
  const cut=h-b+1;h-=cut*smooth(wt,wb,S.d)+6*smooth(160,wt,S.d)*(1-smooth(wt,wb,S.d));}
 for(const Pq of POOLS){const dp=Math.hypot(x-Pq.x,z-Pq.z);if(dp<Pq.r*1.5)h-=1.6*smooth(Pq.r*1.4,Pq.r*.5,dp);}
 return h;}
// THE SAG PONDS: at each bench's inner edge, where it tilts back against the scarp above (KRAND: the page's stream is not touched)
const POOLS=(function(){const R=KRAND.stream(46021),P2=[];
 for(let k=-1;k<=2;k++)for(let i=0;i<5;i++){const z=-2300+i*1000+(R.next()-.5)*500,x=X0+k*SP_+wig(z)-HW-45+(R.next()-.5)*40;
  if(Math.abs(x)>2400||Math.abs(z-zr(x))<120)continue;const r=8+R.next()*14;if(P2.some(q=>Math.hypot(q.x-x,q.z-z)<q.r+r+20))continue;P2.push({x,z,r});}return P2;})();
POOLS.forEach(Pq=>{let lo=1e9;for(let k=0;k<12;k++){const a=k/12*TAU;lo=Math.min(lo,terrainH0(Pq.x+Math.cos(a)*Pq.r*1.15,Pq.z+Math.sin(a)*Pq.r*1.15));}Pq.y=lo-.15;});
function waterH(x,z){for(const Pq of POOLS)if(Math.hypot(x-Pq.x,z-Pq.z)<Pq.r*1.2)return Pq.y;
 const S=streamD(x,z);if(S.d<STREAMW+1)return bedH(x)+.6;return -1e9;}
// the stream drawn (89w): every 6 m from the east edge to the west, its level the bed's (falling only), its falls WATER.fallsOf's breaks
const LAND_FLOWS=(function(){const pts=[];let y=1e9;for(let x=TERR.R*1.05;x>=-TERR.R*1.05;x-=6){y=Math.min(y,bedH(x)+.6);pts.push([x,zr(x),y]);}
 return[{name:"The stream (a headwater of the Na'ashǫ́'ii Buruuk)",pts,width:STREAMW*2+2,speed:1.6}];})();
const SPTS=[];   /* the stream is drawn from LAND_FLOWS */
// ---------------------------------------------------------------- the climate fields (the definitions; 47-host-fields.js caches them)
const SUNH=(function(){const l=Math.hypot(SUNP[0],SUNP[2]);return[SUNP[0]/l,SUNP[2]/l];})();
function fieldsAt(x,z,h,slope,gx,gz){const S=streamD(x,z),pond=POOLS.reduce((m,Pq)=>Math.max(m,smooth(Pq.r*2.2,Pq.r,Math.hypot(x-Pq.x,z-Pq.z))),0);
 const flow=smooth(STREAMW+14,STREAMW*.6,S.d),cold=clamp(.04+h/4200,0,1);
 /* rock: the scarps' and the slot's faces, where it is too steep for soil */
 const rock=clamp(smooth(.62,.9,slope)*.9,0,1);
 const wet=clamp(.66+.2*(fbm(x*.0015,z*.0015,631,2)-.5)+.4*flow+.3*pond,0,1);
 const gl=Math.hypot(gx,gz)||1,sunF=clamp(-(gx*SUNH[0]+gz*SUNH[1])/gl,0,1)*smooth(.08,.3,slope);
 /* the forest everywhere: on the banks, the ponds' rims and the gorge's ledges too (the kit's cliff rule keeps the sheer faces bare; the
    water's own mask keeps plants out of the water) */
 const forest=1;
 return{wet,flow,upland:clamp(h/1000,0,1),rock,slope,cold,bog:pond*.5,mother:0,geo:0,gully:0,sun:sunF,tarn:0,tor:rock*.6,forest,
  canyon:0,rim:0,dune:0,oasis:0,abyss:0,salt:0,barren:0};}
// ---------------------------------------------------------------- the LOD spine and the kit's windows
const OBSTACLES=[];
const SPINE=[[0,0]];for(let k=-1;k<=1;k++){const x=X0+k*SP_+wig(zr(X0+k*SP_));SPINE.push([x+HW+40,zr(x+HW)],[x+HW+380,zr(x+HW+380)+160]);}
STAGE.windows={water:[-TERR.R,-TERR.R,TERR.R,TERR.R]};
// the far field (85): the face goes on climbing east in benches and falling west, without the stream
STAGE.farH=(x,z)=>faceH(x,z);
