// ================================================================= HOST — the ground model: THE REDLANDS (station 4)
// PLAN.md sections 1, 2, 4 and 7 (station 4) on scale model 5.1: step 4's floor (Vourdostepos) at the closed valley's low end. The page's
// frame: x east, z south, origin at px 975,1085 (the model's 900 m); DOWN the valley's ENE axis, ACROSS to its right. Every form a core record:
//   THE FLOOR     the model's own (a plane fitted to 5.1 round the site: 900 m, falling ~2 m/km east and ~8 m/km south), low swells
//   FRONT 3       KRELIEF.stair (core's form for this valley, as station 1's): step 3's ponded floor at ~1,613 m falling ~713 m in a
//                 trap stair of benches to step 4's floor, its lip wandering across the valley, old frozen lava falls down it. At the
//                 kit's scale (the model's front is a ~5 km ramp 25-35 km west): the stair stands at the map's west side, and past the
//                 map its step 3 plain runs on west until the model's own relief stands higher (the step-2 country, the north wall)
//   THE BREAKAWAYS  KRELIEF.scarp (drop: the plateau is the plain, the floor falls 22 m under it): a red hardpan rim over pale gullied
//                 kaolin slopes, north-west of the pan; three mesas of the same cap (KSTACKS) cut off on the slopes below it
//   THE PAN       the dry terminal salt playa (Saltomagos): its outline a polygon painted on a core/mask canvas (KMASK, as data: never a
//                 DOM canvas), its signed distance by KMASK.distance; dead flat, a hollow of a few decimetres in its lowest part where a
//                 storm's sheet water stands (89w)
//   THE SHORES    the old lake's strandlines on the slopes round the pan (core/terrain's KBASIN: a lake that stood and is gone)
// THE ROCK (KSTRATA, the beds dipping with the floor's plane, so the plain's surface is one stratigraphic height): the relict laterite
// profile (35r: the hardpan cap, the mottled and pallid kaolin) over the old ponded flows; west of the stair's toe the stair's own flows
// (a lateral stack, one formation a flow on its flowTops, as station 1's front).
const DOWN=[.9611,-.2764],ACROSS=[.2764,.9611];
const dOf=(x,z)=>x*DOWN[0]+z*DOWN[1],aOf=(x,z)=>x*ACROSS[0]+z*ACROSS[1],xzDA=(d,a)=>[d*DOWN[0]+a*ACROSS[0],d*DOWN[1]+a*ACROSS[1]];
// THE FLOOR: scale model 5.1 round the site, fitted (the 2 km raster's own slope: 909 m 4 km west, 891 m 4 km east, 933 m 4 km north, 868 m 4 km south)
const ST={y0:900,gx:-.00225,gz:-.0081,y3:1613,lip:-4300,slope:13.3,brkH:22};
const plane=(x,z)=>ST.y0+ST.gx*x+ST.gz*z;
const swell=(x,z)=>1.6*(fb(x*.0004,z*.0004,2,WORLD+30)-.5)+.6*(vn(x*.015,z*.015,WORLD+31)-.5);
// FRONT 3: the stair in the plane's frame (its lower floor the plane itself): rel(x, z) the metres it stands over the floor
const STAIR=KRELIEF.stair({a:xzDA(-30000,0),b:xzDA(30000,0),steps:[{y:ST.y3,at:30000+ST.lip},{y:ST.y0,at:30000+ST.lip+20000}],w:20000,
 lobes:{amp:380,wave:2100},slope:ST.slope,tongues:{per:.45,len:[300,800],w:[80,220]},flows:[18,62],riser:.1,colonnade:.42,wrinkle:1.2,seed:KR.hash(WORLD,4,0,0x5747)});
const relStair=(x,z)=>dOf(x,z)>-300?0:Math.max(0,KRELIEF.shape(STAIR,x,z,-1e9)-ST.y0-1.3);   /* 0 on step 4's floor (its wrinkle is the floor's own swell) */
// THE BREAKAWAYS: the rim north-west of the pan (the plateau on its north side), a 22 m fall over a short steep run, gullied
const BRK=(function(){const pts=[[300,300],[1100,0],[2200,50],[3300,450],[4100,1100]].map(p=>xzDA(p[0],p[1]));
 const rec=KRELIEF.scarp({pts,side:-1,h:ST.brkH,run:75,power:2.4,drop:true,ravines:{n:7,w:[14,30],head:[25,70],depth:[5,12],power:1.4},
  talus:{h:2.4,reach:45},rim:{lip:.6,w:6},warp:{amp:60,scale:1/500},rough:.03,ends:400,seed:KR.hash(WORLD,4,1,0xB4E)});
 /* the inset's view: the face at the line's middle, from its foot */
 const p=xzDA(1650,40),n=ACROSS,bb=[Math.min(...pts.map(q=>q[0]))-300,Math.min(...pts.map(q=>q[1]))-300,Math.max(...pts.map(q=>q[0]))+300,Math.max(...pts.map(q=>q[1]))+300];return{rec,pts,bb,view:{x:p[0]+n[0]*90,z:p[1]+n[1]*90,fx:p[0],fz:p[1]},name:'The breakaways: relict laterite hardpan standing 22 m over pale gullied kaolin (Western Australia\'s kind, refs/05)'};})();
// THE MESAS: the same cap cut off on the slopes below the rim (KSTACKS mesas, their tops at the plateau's level)
const MESAS=[[900,620,62,1.3,.4],[2650,700,84,1.5,1.1],[3800,1650,52,1.2,2.2]].map((v,i)=>{const p=xzDA(v[0],v[1]),y0=plane(p[0],p[1])-ST.brkH;
 return KSTACKS.make({id:'mesa'+i,kind:'mesa',x:p[0],z:p[1],y0,seed:KR.hash(WORLD,4,10+i,0x3E5A),tiers:[{h:ST.brkH+swell(p[0],p[1]),r:v[2],e:v[3],ry:v[4]}],bed:[.8,2.4],lobes:.18,weather:.6});});
// THE PAN: its outline painted on a core/mask canvas over the map (10 m a pixel), its signed distance from KMASK.distance both ways
const PAN=(function(){const c=xzDA(2100,1650),A=1250,B=720,n=72,poly=[];
 for(let k=0;k<n;k++){const t=k/n*TAU,r=1+.2*(fb(Math.cos(t)*1.6+5,Math.sin(t)*1.6+5,3,WORLD+70)-.5)*2,u=Math.cos(t)*A*r,v=Math.sin(t)*B*r;
  poly.push([c[0]+u*DOWN[0]+v*ACROSS[0],c[1]+u*DOWN[1]+v*ACROSS[1]]);}
 const PX=10,W=960,X0=-4800,Z0=-4800,mv=KMASK.canvas(W,W),g=mv.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,W,W);g.fillStyle='#fff';g.beginPath();
 poly.forEach((p,i)=>{const X=(p[0]-X0)/PX,Y=(p[1]-Z0)/PX;i?g.lineTo(X,Y):g.moveTo(X,Y);});g.closePath();g.fill();
 /* the distance from the pan (0 inside it), then from the ground round it: the mask read by KMASK.distance itself, never a pixel read here */
 const Fo=KMASK.distance(mv,{channel:0,threshold:128}),Fi=KMASK.distance(mv,{inside:(i,j)=>Fo.d2[j*W+i]>0});
 /* the signed distance (m): negative inside the pan */
 const sd=(x,z)=>{const u=(x-X0)/PX,v=(z-Z0)/PX;return(Fo.sample(u,v)-Fi.sample(u,v))*PX;};
 return{x:c[0],z:c[1],A,B,poly,sd,hash:KMASK.hash(mv),level:null,name:'The salt playa (Saltomagos): the dry terminal pan of the closed lower valley'};})();
const panW=(x,z)=>smooth(12,-20,PAN.sd(x,z));
// the ground before the pan: the floor, the breakaways, the mesas, the stair
const _gPre=(x,z)=>{let g=plane(x,z)+swell(x,z);g=KRELIEF.shape(BRK.rec,x,z,g);const m=KSTACKS.topAt(MESAS,x,z);if(m>g)g=m;return g;};
PAN.level=(function(){let lo=1e9;for(let a=-PAN.B;a<=PAN.B;a+=40)for(let d=-PAN.A;d<=PAN.A;d+=40){const x=PAN.x+d*DOWN[0]+a*ACROSS[0],z=PAN.z+d*DOWN[1]+a*ACROSS[1];
 if(PAN.sd(x,z)<0)lo=Math.min(lo,_gPre(x,z));}return Math.round((lo-2)*10)/10;})();
// THE SHEET: a storm's water in the pan's lowest part (its south-east): a hollow 0.45 m deep there, the rest of the pan dead flat
const SHEET=(function(){const c=[PAN.x+ACROSS[0]*260+DOWN[0]*300,PAN.z+ACROSS[1]*260+DOWN[1]*300];return{x:c[0],z:c[1],r:520,depth:.45,level:PAN.level-.12};})();
const sheetDip=(x,z)=>{const r=Math.hypot(x-SHEET.x,z-SHEET.z)/SHEET.r;return r>=1?0:SHEET.depth*(1-r*r)*(1-r*r);};
// THE OLD LAKE (KBASIN): it stood 16 m over the pan and fell back to it, leaving strandlines on the slopes round it
const BASIN=KBASIN.create({lakes:[{name:'the pan\'s old lake',kind:'flood',level:PAN.level+16,remnant:PAN.level,
 member:(x,z)=>smooth(3400,2200,PAN.sd(x,z))}],seed:KR.hash(WORLD,4,2,0xBA51),age:9000,recession:7000,wind:DOWN,yardang:{h:0},strand:{top:14,bottom:2,a:.75}});
const _bs={};
// THE GROUND: the floor's dish into the pan (closed: it rises gently every way from the pan's edge), the strandlines, the pan flat
function localH(x,z){let g=_gPre(x,z);const s=PAN.sd(x,z),L=PAN.level;
 if(s>0){g=Math.min(g,L+.025*s+Math.max(0,s-500)*.2);g=Math.max(g,L+.0022*Math.min(s,2600));if(g<L+18)g=BASIN.land(x,z,g);}
 else g=L-sheetDip(x,z);
 if(s>-30&&s<0)g=Math.max(g,L);   /* the pan's edge: never under its level */
 const r=relStair(x,z);if(r>0)g=Math.max(g,plane(x,z)+swell(x,z)*.3+r);
 return g;}
/* past the map the model's relief (src/region.json): to the west the stair's step 3 plain runs on until 5.1's own country stands higher */
function baseH(x,z){const g=localH(x,z);if(!REGION)return g;const R=Math.max(Math.abs(x),Math.abs(z)),k=smooth(5300,9600,R);if(k<=0)return g;
 const far=REGION.y0+REGION.h(x,z),r=relStair(x,z),lo=mix(g,far,k);return r>0?Math.max(lo,plane(x,z)+r):lo;}
// THE ROCK: the laterite profile on the plane's stratigraphic height (the plain's surface is yy 900), the stair's own flows west of its toe
const STRATA=(function(){const T=STAIR.flowTops,FL=[];let prev=STAIR.flowBase-600;FL.push({recipe:'godstep-ponded',base:prev,top:STAIR.flowBase});prev=STAIR.flowBase;
 for(const t of T){if(t-prev<1)continue;FL.push({recipe:'godstep-ponded',base:prev,top:t});prev=t;}FL.push({recipe:'godstep-thin',base:prev,top:prev+400});
 const toe=xzDA(-400,0),g=Math.hypot(ST.gx,ST.gz);
 const S=KSTRATA.create({seed:KR.hash(WORLD,4,3,0x57A7),
  formations:[{recipe:'godstep-ponded',base:STAIR.flowBase-600,top:858},{recipe:'godstep-kaolin',base:858,top:894.5},{recipe:'godstep-hardpan',base:894.5,top:STAIR.flowBase+1200}],
  range:[STAIR.flowBase-600,STAIR.flowBase+1200],dip:[-ST.gx/g,-ST.gz/g,g],warp:[.6,.3],wash:{m:1},regolith:.35,dust:0xb89878,
  lateral:{formations:FL,range:[STAIR.flowBase-600,prev+400],dir:[-DOWN[0],-DOWN[1]],at:toe,d0:0,d1:400,tongue:6}});
 /* the column a face shows from afar (84's distance band) and the far country's faces (82) read colorAt(yy), the first stack's alone: over
    the plain's cap (yy 906) only the stair stands, so there the column is the lateral stack's (its flows), not the hardpan's */
 const c0=S.colorAt.bind(S);S.colorAt=yy=>yy>906&&S.lateral?S.lateral.colorAt(yy):c0(yy);return S;})();
STN.exportBox=(function(){const p=xzDA(dOf(PAN.x,PAN.z),aOf(PAN.x,PAN.z)-PAN.B-110);return[Math.round(p[0]-150),Math.round(p[1]-150),Math.round(p[0]+150),Math.round(p[1]+150)];})();
// what the kit asks of a point (45c caches them)
const MODEL={fieldsAt(x,z,sl,hollow,o,y,north){const c=dOf(x,z)>-300?null:KRELIEF.at(STAIR,x,z,-1e9),part=c?c.part:'top',d=dOf(x,z),onFront=(part==='front'||part==='tongue')&&relStair(x,z)>1;
  const pw=panW(x,z),s=PAN.sd(x,z),R=STRATA.at(x,y,z),cap=R.recipe==='godstep-hardpan'?1:0,kao=R.recipe==='godstep-kaolin'?1:0,bas=1-cap-kao;
  o.face=onFront?smooth(.55,1.0,sl):smooth(.6,1.1,sl);
  /* talus: under the stair's risers (as station 1), at the breakaways' and the mesas' feet */
  const up=baseH(x-DOWN[0]*40,z-DOWN[1]*40),rise=up-y,bk=x>BRK.bb[0]&&x<BRK.bb[2]&&z>BRK.bb[1]&&z<BRK.bb[3]?KRELIEF.at(BRK.rec,x,z):null,mf=KSTACKS.foot(MESAS,x,z);
  o.talus=clamp(Math.max(smooth(10,34,rise)*smooth(.75,.35,sl)*(onFront||relStair(x,z)>1?1:.3),bk&&bk.part==='talus'?.85:0,mf&&mf.d>0&&mf.d<22?smooth(22,4,mf.d)*.8:0),0,1);
  o.pan=pw;
  /* the strandlines and the silt over the old lake's floor: pale, fading up the slopes */
  const B=s>0&&y<PAN.level+18?BASIN.sample(x,z,y,_bs):null;o.shore=B?clamp(B.strand,0,1):0;
  o.silt=clamp((1-pw)*Math.max(smooth(200,0,s),B?smooth(PAN.level+17,PAN.level+6,y)*.75+o.shore*.3:0),0,1)*(1-smooth(.5,.9,sl));
  o.kaolin=clamp(kao*(1-pw)*(1-o.silt*.7)*(.7+.3*vn(x*.02,z*.02,WORLD+64)),0,1);
  const rimN=bk&&(bk.part==='rim'||bk.part==='face')?1:0;
  o.laterite=clamp(cap*(1-pw)*(.32+.45*rimN+.25*smooth(.55,.75,fb(x*.006,z*.006,2,WORLD+65)))*(1-smooth(.7,1.1,sl)*.5),0,1);
  o.pavement=clamp((1-pw)*(1-o.silt)*(.6*cap+.3*kao+.2*bas)*smooth(.6,.2,sl)*(.55+.45*fb(x*.004,z*.004,2,WORLD+66)),0,1);
  o.steppeF=cap||kao?1:0;
  o.edge=s>8&&s<170?smooth(8,30,s)*smooth(170,90,s):0;
  o.playa=pw;   /* station 1's pan class: it keeps the kit's own passes (the talus, stones, pioneers) off the salt */
  o.skin=0;o.sand=0;o.moss=0;o.snow=0;o.cone=0;o.path=0;
  o.soil=clamp(.3*hollow*(1-pw)*(1-o.silt)*smooth(.5,.15,sl),0,1);
  o.lichen=clamp(bas*smooth(.55,.25,sl)*smooth(.35,.7,vn(x*.012,z*.012,WORLD+62))*.5,0,1);
  o.palag=clamp(bas*smooth(.58,.78,fb(x*.009,z*.009,2,WORLD+61))*smooth(.6,.2,sl)*.5,0,1);
  o.flow=0;o.age=0;o.step=c?c.step:0;o.part=part;return o;},
 /* the core's fields: the pan's salt, its storm water; the sedesert's floor reads `abyss` as no-plant ground (the pan, and the faces: its
    badland mix puts stones and boulders on any rock slope, which the risers here are not) and `oasis` as its
    salt-tolerant edge (98: the edge's mix) */
 coreFields(F){F.salt=(x,z)=>clamp(F.pan(x,z)+F.silt(x,z)*.5,0,1);F.wet=(x,z)=>clamp(F.pan(x,z)*.25+F.edge(x,z)*.15,0,1);/* the kit's own pioneers (the lava pioneers' cushions and crusts, its stones: src/60) on the stair's basalt only, not on the laterite's steppe,
    whose floor is the sedesert's (60's passes keep off `path`: the steppe reads as one to them; the paint's path is zeroed in 55) */
 F.path=F.steppeF;F.abyss=(x,z)=>Math.max(F.pan(x,z),smooth(.4,.7,F.slope(x,z)));F.oasis=F.edge;F.rim=F.laterite;},
 /* the far country: a hot steppe's red-tan on the low gentle ground */
 farColor(x,z,h,sl,c,K){return K.mixC(c,K.L([138,108,84]),smooth(1500,1150,h)*(1-smooth(.35,.85,sl))*.75);},
 after(){}};
