// ================================================================= HOST — the site (station 4: the edge, the ecotone)
// PLAN.md section 7, station 4: a box canyon with its spring-fed fall, the spring line, the lowlands and Ancient's Valley below. On the scale
// model (5.1) Waywater Ironblack crosses the bench's lower edge in a valley 4 km wide at ~3,200 m, its south wall rising 550 m to a loess
// plateau at ~3,790 m. The plan's px 360,1010 is half way up that wall; the page stands 1.5 km south of it, on the plateau's rim, px
// 360,1010.75 (region/far.py): 3,680 m, 1.01 atm, Dfb, mean +4 °C, 596 mm. The river leaves the bench at 2,580 m, 16 km east, and the
// lowlands and Ancient's Valley lie 2 km below beyond it: the page's far ground and sky.
//
// THE LANDFORMS (core/terrain 38c-core-landforms.js):
//   KRELIEF.gully  tops 'yuan'  the box canyon: from an amphitheatre head on the plateau north through the wall to the valley floor. Its
//                  floor is set here (the record is plain data): 150 m under the plateau at the head, grading to the valley floor at the
//                  mouth, never climbing; so it stands ~185 m deep where it cuts the wall (the model's box canyons: 185 m)
//   THE SPRING LINE  the loess (100 m here: WOW.bench at the plateau's height) lies on the patchwork rock; the water it soaks up comes out
//                  where a cut reaches its foot. At the canyon's head that is half way down the head wall: a spring-fed fall
//                  (core/water WATER.fall, following the face) into the head's pool, and the brook down the floor (WATER.flow)
//   The canyon's walls are loess above the contact and the patchwork rock below it (SITE.slots); dust towers on the plateau.
const SITE={
 name:'edge',title:'The edge (the box canyon)',R:2000,step:8,seed:5501,loess:100,warm:0,
 slots:['loess','rock'],
 // the canyon: its thalweg from the head (south, on the plateau) to the mouth (north, the valley floor); headDepth under the plateau at the
 // head; w the floor's half-width; head the amphitheatre's half-width over w
 canyon:{a:[160,1750],b:[-260,-2350],amp:120,wave:1100,headDepth:150,depth:185,w:14,head:2.3},
 dust:{cell:120,p:.16},
 snow:{autumn:[900,1400],winter:[-2000,-1900],spring:[-1500,-1300],summer:[2600,3200]},
 eye:30,
 spine:()=>[SITE_TRUNK_AT(.05),SITE_TRUNK_AT(.45),SITE_TRUNK_AT(.85),[900,1500]],
 // the floor's band round each spine point: the plateau is one wide steppe, and the NW outer wall's plumegrass (cap 250,000) reached 292,749
 // on the default [260, 600] (GPU verify 2026-11-10)
 floorBand:[240,480],
 // no larch wanted: the escarpment faces north (the sun's side at 40 S) and the canyon runs down it, so its walls face east and west: steppe
 need:{zones:['yuan','wall','scarp','floor','steppe'],keys:{'plant.dusttower':4},larch:0,trees:80,spring:false},
 views:V=>{const H=SITE_TRUNK_AT(0),a=SITE_TRUNK_AT(.12),m=SITE_TRUNK_AT(.5),e=SITE_TRUNK_AT(.97),F=SITE_FALL;const o={
  'The canyon\'s head and its fall':V([a[0],a[1],4],[H[0],H[1],60]),
  'Down the canyon to the valley':V([SITE_TRUNK_AT(.3)[0],SITE_TRUNK_AT(.3)[1],5],[e[0],e[1],0]),
  'The canyon from its rim':V(SITE_RIM(.45,1,5),[m[0],m[1],0]),
  'The canyon\'s mouth on the valley floor':V([SITE_TRUNK_AT(.9)[0]+70,SITE_TRUNK_AT(.9)[1]-60,5],[m[0],m[1],60]),   /* inside the near box (SITE.R*1.15): the mid ground's cells do not hold the canyon */
  'East to the lowlands (the bench\'s edge)':V(SITE_RIM(.25,-1,8),[16000,-3000,-1200]),
  'The edge from above':V([1500,2300,520],[-200,-800,0])};
  if(F)o['The spring line on the head wall']=V([H[0]+Math.cos(F.dir+Math.PI)*-60,H[1]+Math.sin(F.dir+Math.PI)*-60,3],[F.lip[0],F.lip[1],0]);
  const T=typeof PILLARS!=='undefined'?PILLARS.find(B=>B.key==='plant.dusttower'):null;
  if(T)o['Dust towers on the plateau']=V([T.x+T.R*5,T.z+T.R*3,2.5],[T.x,T.z,(T.top-T.y0)*.5]);
  return o;},
 checks:()=>[{name:'the box canyon cut through the loess into the rock (its depth where it cuts the wall)',run:()=>SITE_CANYON_CHECK(SITE_CANYON())},
  {name:'a spring-fed fall at the canyon\'s head, its lip at the loess\'s foot',run:()=>SITE_FALL_CHECK(SITE_FALL)}],
 negatives:()=>[{name:'a shallow cut',run:()=>SITE_CANYON_CHECK(Object.assign({},SITE_CANYON(),{depth:60}))},
  {name:'the fall from the plateau\'s top',run:()=>SITE_FALL_CHECK(SITE_FALL&&Object.assign({},SITE_FALL,{lipY:SITE_FALL.lipY+SITE.loess}))}]
};
function siteSwell(x,z){return 6*(KRAND.fbm(x*.0009+5.1,z*.0009-1.3,0,3,5502)-.5)*2+1.2*(KRAND.fbm(x*.006-3.2,z*.006+4.8,0,2,5506)-.5)*2;}
let SITE_RECS=null,SITE_SPRING=null,SITE_FALL=null;
function siteBuild(ground){const C=SITE.canyon;
 const can=KRELIEF.gully({pts:KRELIEF.meander(C.a,C.b,{amp:C.amp,wave:C.wave,seed:SITE.seed+1}),ground,depth:C.depth,w:C.w,head:C.head,tops:'yuan',branches:0,orders:1,seed:SITE.seed+2});
 // the floor: headDepth under the plateau at the head, grading straight to the valley floor at the mouth (3 m under it), never climbing
 const L=can.lines[0].pts,n=L.length,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(L[i][0]-L[i-1][0],L[i][1]-L[i-1][1]));
 const y0=ground(L[0][0],L[0][1])-C.headDepth,y1=ground(L[n-1][0],L[n-1][1])-3;
 for(let i=0;i<n;i++){L[i][2]=Math.min(y0+(y1-y0)*S[i]/S[n-1],ground(L[i][0],L[i][1])-3);if(i)L[i][2]=Math.min(L[i][2],L[i-1][2]-.01);}
 can.heads.forEach(h=>{if(h.line===0)h.y=L[0][2];});
 SITE_RECS={trunk:can};SITE_SPRING=[L[0][0],L[0][1],0];
 // THE SPRING-FED FALL: the head wall's face at the loess's foot (the contact), straight back from the head's middle along the thalweg;
 // it falls down the face to the head's pool on the floor
 const dx=L[1][0]-L[0][0],dz=L[1][1]-L[0][1],dl=Math.hypot(dx,dz),ux=dx/dl,uz=dz/dl,hw=C.w*C.head,g0=ground(L[0][0]-ux*(hw+40),L[0][1]-uz*(hw+40)),lipY=g0-SITE.loess;
 // out from the head's middle (upstream) to the point on the drawn wall at the contact's height
 let d=hw;for(;d<hw+80;d+=.5){const x=L[0][0]-ux*d,z=L[0][1]-uz*d;if(KRELIEF.shape(can,x,z,ground(x,z))>=lipY)break;}
 SITE_FALL={lip:[L[0][0]-ux*(d+.4),L[0][1]-uz*(d+.4)],lipY,foot:[L[0][0]-ux*(hw*.45),L[0][1]-uz*(hw*.45),L[0][2]],dir:Math.atan2(uz,ux),ux,uz,drop:lipY-L[0][2]};
 return SITE_RECS;}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and the canyon's part
const _sp={x:NaN,z:NaN,P:null};
const _cutPart=p=>p==='floor'||p==='head'||p==='wall'||p==='rim';
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const R=SITE_RECS,m=MODEL(x,z),g0=m+siteSwell(x,z);
 const g1=KRELIEF.shape(R.trunk,x,z,g0),a=KRELIEF.at(R.trunk,x,z,g0),c=!!(a&&_cutPart(a.part));
 const P={g0,g2:g1,y:g1,rel:g1-m,cut:Math.max(0,g0-g1),part:c?a.part:'yuan',rec:c?'trunk':null,order:c?0:-1,terrace:false,top:'yuan'};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
function siteFloor(x,z){const P=sitePoint(x,z);return P.part==='floor'?1:0;}
function siteGully(x,z){const P=sitePoint(x,z);return P.part==='head'?1:0;}
function siteYuan(x,z){const P=sitePoint(x,z);return P.part==='yuan'?1:0;}
function SITE_TRUNK_AT(u){if(!SITE_RECS)return [0,0];const L=SITE_RECS.trunk.lines[0].pts,i=Math.min(L.length-1,Math.round(u*(L.length-1)));return [L[i][0],L[i][1]];}
// a point on the canyon's rim at u, on its east (-1) or west (+1) side
function SITE_RIM(u,side,h){const L=SITE_RECS.trunk.lines[0].pts,i=Math.min(L.length-2,Math.round(u*(L.length-1))),a=L[i],b=L[i+1],dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz)||1;
 let d=10;for(;d<400;d+=4){const x=a[0]-dz/n*side*d,z=a[1]+dx/n*side*d;if(sitePoint(x,z).cut<3)break;}
 return [a[0]-dz/n*side*(d+8),a[1]+dx/n*side*(d+8),h];}
// THE STACKS: the plateau's dust towers (46: WOW.dustTowers), off the canyon's rim
function siteStacks(ctx){if(!SITE.dust)return [];return WOW.dustTowers({world:SITE.seed,box:[-SITE.R,-SITE.R,SITE.R,SITE.R],ground:ctx.ground,
 accept:(x,z)=>{const P=sitePoint(x,z);if(P.part!=='yuan'||ctx.COARSE.grade(x,z).g>=.1)return false;const A=KRELIEF.at(SITE_RECS.trunk,x,z,P.g0);return !A||A.e>60;}},SITE.dust);}
// the brook: from the fall's pool down the canyon's floor to the mouth
const SITE_STREAM={name:'The canyon\'s brook (the spring-fed fall\'s water, down the box canyon to Waywater Ironblack)',width:2.2,
 pts:()=>{if(!SITE_RECS)return [];return SITE_RECS.trunk.lines[0].pts.map(p=>[p[0],p[1],p[2]]);}};
// THE FALL (47 makes its core/water record; 89w draws it): the spring-fed fall at the head
function siteFalls(){const F=SITE_FALL;if(!F||!(F.drop>4))return [];const px=-F.uz,pz=F.ux,hw=3.5;
 return [WATER.fall({name:'The spring-fed fall (the loess\'s water coming out on the rock under it, '+F.drop.toFixed(0)+' m down the head wall)',
  lip:[[F.lip[0]-px*hw,F.lip[1]-pz*hw,F.lipY],[F.lip[0]+px*hw,F.lip[1]+pz*hw,F.lipY]],dir:[F.ux,F.uz],drop:F.drop,foot:[F.foot[0],F.foot[1],F.foot[2]],fit:true,spread:3,face:terrainH,faceLift:.5,faceN:40})];}
// ---------------------------------------------------------------- the station's checks
function SITE_CANYON(){const L=SITE_RECS.trunk.lines[0].pts;let depth=0,thru=0;for(let i=0;i<L.length;i++){const P=sitePoint(L[i][0],L[i][1]);depth=Math.max(depth,P.cut);if(P.cut>SITE.loess+6)thru++;}
 return{depth,thru,n:L.length};}
function SITE_CANYON_CHECK(C){return{ok:C.depth>=150&&C.thru>3,detail:'the canyon '+C.depth.toFixed(0)+' m deep at its deepest; '+C.thru+' of its '+C.n+' floor points under the loess\'s foot ('+SITE.loess+' m)'};}
function SITE_FALL_CHECK(F){if(!F)return{ok:false,detail:'no fall'};const g0=sitePoint(F.lip[0]-F.ux*40,F.lip[1]-F.uz*40).g0,contact=g0-SITE.loess;
 return{ok:Math.abs(F.lipY-contact)<6&&F.drop>15&&!!(WATER_RECS&&WATER_RECS.falls&&WATER_RECS.falls.length),detail:'the lip '+F.lipY.toFixed(0)+' m, the loess\'s foot '+contact.toFixed(0)+' m; a drop of '+F.drop.toFixed(0)+' m'};}
