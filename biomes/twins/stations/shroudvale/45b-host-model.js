// ================================================================= HOST — the ground model: THE VALLEY OF THE IRON SHROUD (station 4)
// The vale as plain functions of (x, z) on the frame: baseH, STRATA, the vale's frame (u up the vale, p across it), its parts (the mouth and
// its seep, the moraine, the cold basin, the headwall, the hanging glacier on the plateau behind it), MODEL. The map is flat here at its 2 km
// (5.1's grading: "WITHOUT raised circular rims"); the vale's fault blocks are this station's own relief, eased into the map past 4.4 km.
//   THE PLATEAU    the shaded fault blocks ~620 m over the vale's floor (5,340 m), frost-shattered, lightly snowed
//   THE VALE       a U: a flat floor 2/3 of its width, the toe rising into walls that stand sheer over the last sixth (columned titanium
//                  basalt: KSTRATA's tibasalt beds on every face, talus at the feet); 6 km from the mouth (south-south-east, toward Open
//                  Sprint 1) to the headwall (north-north-west); the walls end at the mouth in the fault block's south face, so the mouth
//                  opens wide and gentle
//   THE MORAINE    4 km in: the floor rises 38 m over a terminal moraine (its outer face gentle, its inner face the REVERSE slope: 20 degrees),
//                  and behind it the basin's floor lies 40 m under the crest: sealed (no outlet but over the lip)
//   THE BASIN      the cold sink: blue ice over its floor, the wreckage on it, the headwall closing it in a cirque
//   THE GLACIER    a hanging glacier on the plateau behind the headwall, its snout at the lip (KGLACIER's seracs leaning over it: 87)
//   THE SEEP       a lukewarm iron seep (+12 C: a small KTHERM vent) on the mouth's west floor, its iron stain on the ground
const SITE_Y=REGION?REGION.y0:4720;
const nrm2=v=>{const l=Math.hypot(v[0],v[1]);return[v[0]/l,v[1]/l];};
const LOCAL=(x,z)=>SITE_Y+(REGION?REGION.smooth(x,z):0);
// the vale's frame: UP from the mouth to the head (north-north-west: the mouth faces Open Sprint 1, px 980, 1467, south-south-east of the site)
const UP=nrm2([-.43,-.9]),AC=[-UP[1],UP[0]];   // AC: across, + toward the east wall
const vu=(x,z)=>x*UP[0]+z*UP[1],vp=(x,z)=>x*AC[0]+z*AC[1],vAt=(u,p)=>[UP[0]*u+AC[0]*p,UP[1]*u+AC[1]*p];
const VALE={u0:-3000,u1:2950,name:'Wadi al-Kafan, the Valley of the Iron Shroud (a dead-end glacial box-canyon: Trap F1)'};
const pc=u=>60*Math.sin(u*.0008)+25*Math.sin(u*.0021+1);   // the floor's centre line, wandering
const halfW=u=>430+520*smooth(-2300,-3500,u)+60*smooth(1100,2300,u)-90*smooth(2300,2950,u);   // wide at the mouth, a bowl at the cirque
const MOR={u:1000,out:780,inn:1110,h:38,name:'The moraine lip (a terminal moraine 38 m high: its inner face the reverse slope into the sink)'};
const BASIN_Y=SITE_Y-6;
// the floor's height along the vale: rising gently from the mouth to the moraine, over it, and down its inner face to the basin
const floorF=u=>SITE_Y-30+30*smooth(-3300,MOR.u,u);
const CREST_Y=floorF(MOR.u)+MOR.h;
function floorY(u){if(u<MOR.u)return floorF(u)+MOR.h*Math.pow(smooth(MOR.out,MOR.u,u),1.4);return BASIN_Y+(CREST_Y-BASIN_Y)*smooth(MOR.inn,MOR.u,u);}
const PLAT=(x,z)=>SITE_Y+620+40*(fb(x*.0006,z*.0006,2,WORLD+70)-.5)*2+6*(vn(x*.01,z*.01,WORLD+71)-.5);
const headU=d=>VALE.u1-260*d*d;   // the headwall's foot across the cirque (d: |p| over the half-width)
// the vale's share of the ground at (x, z): {d (across, of the half-width), wall 0..1 (the cliff's share), u, p}
function valeAt(x,z,o){const u=vu(x,z),p=vp(x,z)-pc(u),W=halfW(u),d=Math.abs(p)/W,head=smooth(headU(Math.min(d,1))-25,headU(Math.min(d,1))+45,u);
 const side=smooth(.8,.97,d),wall=Math.max(side,head)*smooth(-3650,-2950,u);o.u=u;o.p=p;o.d=d;o.W=W;o.wall=wall;o.head=head;return o;}
// ---------------------------------------------------------------- the seep (KTHERM: one small vent over the frozen floor)
const SEEP=(()=>{const u=-2450,p=pc(u)-170,q=vAt(u,p);return{x:q[0],z:q[1],u,r:2.3,T:12,name:'The iron seep (+12 C: lukewarm, iron-stained; it promises a warm spring round the bend)'};})();
const THERM=KTHERM.create({soil:-8,vents:[{id:'seep',kind:'point',x:SEEP.x,z:SEEP.z,T:16,reach:26,decay:2.2}],detail:{amp:.8,scale:.05,seed:KR.hash(WORLD,4,4,0x7E37)},world:WORLD});
const THERM_F=THERM.bake({box:[SEEP.x-40,SEEP.z-40,SEEP.x+40,SEEP.z+40],cell:2});
const heatAt=(x,z)=>(Math.abs(x-SEEP.x)>39||Math.abs(z-SEEP.z)>39)?-8:KTHERM.fieldAt(THERM_F,x,z);
// ---------------------------------------------------------------- the rock, the frost
const LSLOPE=(x,z)=>{const e=40;return Math.hypot(LOCAL(x+e,z)-LOCAL(x-e,z),LOCAL(x,z+e)-LOCAL(x,z-e))/(2*e);};
const FROST=KFROST.create({seed:KR.hash(WORLD,4,1,0xF205),ground:(x,z)=>LOCAL(x,z),lobes:{cell:30,h:.9,where:(x,z)=>smooth(.04,.12,LSLOPE(x,z))*smooth(.6,.35,LSLOPE(x,z))}});
const STRATA=KSTRATA.create({seed:KR.hash(WORLD,0,4,0x57A7),formations:[{recipe:'tibasalt'}],range:[4400,5600],
 dip:[UP[0],UP[1],.004],warp:[5,1.4],wash:{m:2},regolith:.4,dust:0x2c2a28});
const _v={};
function preH(x,z){const V=valeAt(x,z,_v),fl=floorY(V.u),pl=PLAT(x,z);
 /* the floor: flat, the U's toe rising 28 m over the inner sixth, talus aprons against the walls, moraine hummocks */
 const toe=28*Math.pow(clamp((V.d-.55)/.27,0,1),2.2),apron=22*smooth(.66,.81,V.d)*(1-smooth(.82,.86,V.d)),hum=V.u>MOR.out-80&&V.u<MOR.inn+60?4*(vn(x*.03,z*.03,WORLD+72)-.5)*2*smooth(MOR.out-80,MOR.out+40,V.u)*smooth(MOR.inn+60,MOR.inn,V.u):0;
 const floor=fl+(toe+apron)*(1-V.head)+hum+1.2*(vn(x*.05,z*.05,WORLD+73)-.5)+FROST.h(x,z)*.6;
 /* the plateau where the walls stand; the cliff between, a little uneven along its face (the columns' fallen bays) */
 const bay=10*(fb(V.u*.004,Math.sign(V.p)*3,2,WORLD+74)-.5);
 const w=clamp(V.wall+bay*.004,0,1);
 return floor+(pl-floor)*w;}
function baseH(x,z){const g=preH(x,z),s=Math.hypot(x-SEEP.x,z-SEEP.z);const y=s<SEEP.r+3?g-.55*smooth(SEEP.r+3,SEEP.r*.4,s):g;return REGION?REGION.blend(y,x,z,4400,9500,SITE_Y):y;}
// ---------------------------------------------------------------- the caravans' line in (the guide's false route: no cairns, a trodden line up the floor)
const TRACK=(function(){const P=[];for(let u=-4600;u<=1800;u+=25){const p=u<-3300?pc(-3300)+(u+3300)*.35:pc(u)-40*Math.sin(u*.0015);P.push(vAt(u,p));}
 return{pts:P,name:'The caravans\' tracks into the vale (no cairns: the Guild marks no road here)'};})();
const TRACK_IX=(function(){const B=new Map(),P=TRACK.pts,C=50;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];
 for(let gi=Math.floor((Math.min(a[0],b[0])-8)/C);gi<=Math.floor((Math.max(a[0],b[0])+8)/C);gi++)for(let gj=Math.floor((Math.min(a[1],b[1])-8)/C);gj<=Math.floor((Math.max(a[1],b[1])+8)/C);gj++){
  const k=gi+','+gj;if(!B.has(k))B.set(k,[]);B.get(k).push(i);}}return{B,C};})();
function trackDist(x,z){const L=TRACK_IX.B.get(Math.floor(x/TRACK_IX.C)+','+Math.floor(z/TRACK_IX.C));if(!L)return 1e9;let best=1e9;const P=TRACK.pts;
 for(const i of L){const a=P[i-1],b=P[i],ex=b[0]-a[0],ez=b[1]-a[1],t=clamp(((x-a[0])*ex+(z-a[1])*ez)/(ex*ex+ez*ez),0,1);best=Math.min(best,Math.hypot(x-a[0]-ex*t,z-a[1]-ez*t));}return best;}
const _m={};
const MODEL={
 heatAt,
 warmAt:(x,z)=>smooth(0,8,heatAt(x,z)),
 /* the ice: blue glacier ice over the basin's floor and the hanging glacier on the plateau behind the headwall; the seep's iron stain (mat) */
 classAt(x,z,o){const V=valeAt(x,z,_m),inBasin=V.u>MOR.inn+10&&V.d<.78&&V.head<.3,n=vn(x*.02,z*.02,WORLD+75);
  const basin=inBasin?smooth(MOR.inn+10,MOR.inn+120,V.u)*smooth(.78,.6,V.d)*(.7+.35*n):0;
  const hang=smooth(headU(Math.min(V.d,1))+40,headU(Math.min(V.d,1))+120,V.u)*smooth(1.25,.9,V.d)*smooth(4300,3900,V.u);
  o.ice=Math.max(o.ice||0,clamp(Math.max(basin,hang),0,1));
  const s=Math.hypot(x-SEEP.x,z-SEEP.z);o.mat=Math.max(o.mat||0,smooth(SEEP.r+9,SEEP.r+1,s)*.8);return o;},
 pathAt(x,z){return .6*smooth(3,1,trackDist(x,z));},
 fieldsAt(x,z,sl,hollow,o){const V=valeAt(x,z,_m);o.face=smooth(.95,1.5,sl);
  o.talus=smooth(.64,.78,V.d)*(1-smooth(.82,.86,V.d))*(1-o.face)*smooth(-3600,-2900,V.u);o.obsidian=.03;
  o.scree=clamp((.55+.45*smooth(.2,.6,sl))*(1-o.face),0,1);
  o.lichen=clamp(.5*smooth(.45,.12,sl)*smooth(.35,.75,vn(x*.01,z*.01,WORLD+61))*(V.u>MOR.u?.2:1),0,1);
  o.blocks=clamp((.12*smooth(.4,.75,vn(x*.004,z*.004,WORLD+62))+.5*o.talus)*(1-o.face),0,1);o.poly=0;return o;},
 after(){SEEP.y=terrainH(SEEP.x,SEEP.z);let lo=1e9;for(let k=0;k<24;k++){const a=k/24*TAU;lo=Math.min(lo,terrainH(SEEP.x+Math.cos(a)*(SEEP.r+.6),SEEP.z+Math.sin(a)*(SEEP.r+.6)));}SEEP.level=lo-.1;
  const c=vAt(MOR.u,pc(MOR.u));MOR.y=terrainH(c[0],c[1]);}};
