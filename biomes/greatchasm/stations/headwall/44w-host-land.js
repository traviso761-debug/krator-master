// ================================================================= HOST — STATION 4, THE HEADWALL: its land
// Scale model 5.1 px 1664,812 (PLAN.md section 7): 1,628 m, BWk, tm 16 degC (24/9), 47 mm, 1.30 atm; the Outlands' lip (3,786 m) 110 km north.
// THE CHAOS AS DRAWN (the survey, PLAN.md "The sites as drawn"): the code's headwall chaos (build_425_master.py step 5B: tilted flat-topped mesas
// between anastomosing channels) reads on the 2 km cells as a plateau at 1,560-1,790 m broken by single LOW CELLS 350-550 m down (1,082-1,300 m):
// the channels, narrower than a cell, caught where a cell's centre fell in one. In the page: the plateau's eight cells round the site, and one low
// cell 2 km north (1,244 m); four more lie 4 km off on every side. The station draws:
//   THE PLATEAU    the model's surface through its high cells, each low cell filled from its high neighbours (MODEL.h's cell filter), so the
//                  mesa tops stand at the drawn heights and tilt as the cells do
//   THE CHANNELS   cut down from it to the drawn low cells' heights with sheer stepped walls (KRELIEF.stepcut, the Siphon Pits' graben): three
//                  lines joining the low cells, each floor at its low cells' mean, braided cobble on their floors (the wash field)
//   THE KNOBS      buttes and a spire left standing on the channels' floors (KSTACKS), talus under the risers
//   THE ROAD       the Coyote Men's way down from the lip to the east bench, along the channels' floors; Hum milestones in contour carving
// The ochre caps (the code's paint) are the strata's top formation on the plateau's rim (KSTRATA chasm-cap, 1,560-1,800 m).
const STATION=(function(){
 const LOW=1450;
 /* the plateau: a low cell takes the mean of its high neighbours (the 8 round it), so the surface is the mesas' tops */
 const fill=(i,j,h)=>{if(h>=LOW)return h;let s=0,n=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){if(!a&&!b)continue;const v=MODEL.raw(i+a,j+b);if(v>=LOW){s+=v;n++;}}return n?s/n:h;};
 const plateau=(x,z)=>MODEL.h(x,z,fill);
 const CH=[
  {name:'The west channel',pts:[[-6000,0],[-4000,0],[-2400,-900],[-1000,-1300],[0,-2000],[2000,-4000]],floor:1232},
  {name:'The east channel',pts:[[0,-2000],[1000,-1000],[3000,-1000],[5000,1000],[6000,0]],floor:1218},
  {name:'The south channel',pts:[[5000,1000],[4000,2000],[2000,3000],[0,4000],[-2000,6000]],floor:1150}];
 const CUTS=CH.map((c,i)=>KRELIEF.stepcut({line:{pts:c.pts,w:200},floor:c.floor,steps:3,tread:45,riser:2,rim:1.5,warp:{amp:60,scale:1/420},seed:94501+i}));
 const cut=(x,z,g)=>{let h=g;for(const C of CUTS)h=KRELIEF.shape(C,x,z,h);return h;};
 const partAt=(x,z)=>{const g=plateau(x,z);let best=null;for(const C of CUTS){const a=KRELIEF.at(C,x,z,g);if(a&&(!best||a.part==='floor'))best=a;}return best;};
 const ground=(x,z)=>cut(x,z,plateau(x,z))+.5*(KRAND.fbm(x*.01,.5,z*.01,2,94509)-.5);
 const PAVE=KRELIEF.pavement({h:ground,slope:[.05,.16],seed:94502});
 const ROAD={name:'The Coyote road (down from the Outlands\' lip)',pts:[[1500,-2950],[700,-2400],[0,-2000],[1000,-1000],[2950,-1000]],w:4};
 const roadD=(x,z)=>nearLine(ROAD.pts,x,z).d/ROAD.w;
 const L=chasmLand({R:2600,ground,
  rockAt:(x,z,h,sl)=>smooth(.45,.8,sl),strataK:(x,z,h,sl)=>smooth(.35,.7,sl),
  talus:(x,z)=>{const a=partAt(x,z);let t=a&&a.part==='floor'?smooth(60,0,a.e==null?60:a.e):0;if(ROCKS.length){const f=KSTACKS.foot(ROCKS,x,z);if(f)t=Math.max(t,smooth(30,3,f.d));}return t;},
  wash:(x,z)=>{const a=partAt(x,z);return a&&a.part==='floor'?smooth(30,90,a.e==null?0:a.e)*smooth(.55,.35,KRAND.fbm(x*.006,.5,z*.006,2,94503)):0;},
  pave:(x,z)=>{const a=partAt(x,z);return a?0:PAVE(x,z);},road:(x,z)=>smooth(1.6,.6,roadD(x,z)),
  strata:GCH_STRATA({capBase:1560,capTop:1800}),
  spine:[[0,0],[0,-2000],[1000,-1000],[2400,-1000],[-1000,-1300],[700,-2400],[-1600,900],[1500,1500]]});
 Object.assign(L,{CH,CUTS,partAt,plateau,ROAD,roadD,fill});return L;})();
var ROCKS=[];
{const W=94511,u=(i,k)=>KRAND.unit(KRAND.hash(W,i,k,0x53)),G=STATION.terrainH;
 /* knobs on the channels' floors: candidates along each line, kept where the floor is wide enough for them and clear of the road */
 STATION.CH.forEach((c,ci)=>{for(let k=0;k<6;k++){const t=(k+.5)/6,m=c.pts,seg=Math.min(m.length-2,Math.floor(t*(m.length-1))),f=t*(m.length-1)-seg,a=m[seg],b=m[seg+1];
  const ox=(u(ci*10+k,1)-.5)*180,oz=(u(ci*10+k,2)-.5)*180,x=a[0]+(b[0]-a[0])*f+ox,z=a[1]+(b[1]-a[1])*f+oz;
  if(Math.abs(x)>2700||Math.abs(z)>2700||u(ci*10+k,3)<.35||STATION.roadD(x,z)<12)continue;const P=STATION.partAt(x,z);if(!P||P.part!=='floor')continue;
  const y0=Math.min(...[[0,0],[25,0],[-25,0],[0,25],[0,-25]].map(o=>G(x+o[0],z+o[1])))-2,tall=u(ci*10+k,4);
  ROCKS.push(tall<.25?KSTACKS.make({id:'hw-spire-'+ci+'-'+k,kind:'spire',x,z,y0,seed:W+ci*10+k,H:40+50*u(ci*10+k,5),r:9+6*u(ci*10+k,6)}):
   KSTACKS.make({id:'hw-butte-'+ci+'-'+k,kind:'butte',x,z,y0,seed:W+ci*10+k,tiers:[{h:30+60*u(ci*10+k,5),r:25+35*u(ci*10+k,6),e:1+.5*u(ci*10+k,7),ry:u(ci*10+k,8)*6.28}],bed:[2,8]}));}});}
STATION.ROCK.push(...ROCKS);
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
// THE MILESTONES: the Coyote Men's carved stones along the road (records first, pending stand-ins: kits/coyote owed)
const HEAD_SITE=(function(){const R=[],P=STATION.ROAD.pts;let acc=0,k=0;
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let s=acc>0?700-acc:350;s<L;s+=700){const x=a[0]+(b[0]-a[0])*s/L+(b[1]-a[1])/L*6,z=a[1]+(b[1]-a[1])*s/L-(b[0]-a[0])/L*6;
  R.push({id:'road:milestone-'+(k++),name:'A Hum milestone (contour-carved; kits/coyote owed)',kind:'milestone',x,z,w:.9,d:.6,h:2.2,y:terrainH(x,z),pending:true});}acc=(acc+L)%700;}
 function build(){const geo=new THREE.BoxGeometry(1,1,1).translate(0,.5,0);
  R.forEach(r=>{const y0=r.y-.4;REGISTER({name:r.name,key:r.id,x:r.x,z:r.z,y:y0,r:1.2,h:r.h+1.4,tags:{pending:true,culture:'coyote',role:'milestone'}});
   const me=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0x7a7068}));me.position.set(r.x,y0,r.z);me.scale.set(r.w,r.h+.4,r.d);me.rotation.y=k*.7;me.userData.host=true;me.userData.post=true;me.userData.inspectLabel=r.name;scene.add(me);});
  return{milestones:R.length};}
 return{R,build};})();
const LAND={name:'The Headwall (greatchasm station 4)',title:'Krator biome — the Great Chasm: the Headwall',build_id:'greatchasm-headwall',
 hint:'Station 4 of the Great Chasm: the headwall\'s chaos at its north end (scale model 5.1 px 1664,812; 1,628 m, 1.30 atm, BWk): the mesas\' plateau at 1.6-1.8 km cut by box channels 400 m deep, the Coyote Men\'s road down them, Hum milestones',
 region:{name:'The Headwall (station 4)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.15,
 fog:{falloff:1/1100,sun:.3,sky:.3},climate:{cold:false,dry:true},wet:false,groundN:620,shimmer:false,
 groundLayers:['pave','steppe','wadi','lichen'],
 plants:['needle','cush','pebble','grass','sac'],
 modelTol:45,
 farLabel:'The headwall\'s chaos and the Outlands\' plateau to the north (the scale model 5.1)',
 kin:[{ref:'ebadlands.needlebloom',key:'needlebloom',name:'Needle bloom (the eastern badlands\', read in place)',cell:60,minR:3,accept:Z=>Z.wadi*.4+Z.desert*.02*Z.gentle}],
 prebuild:()=>HEAD_SITE.build(),
 hazards:()=>{const out=[];STATION.CH.forEach((c,ci)=>{const P=c.pts;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if(Math.abs(mx)>2700||Math.abs(mz)>2700)continue;
   const L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;for(const sd of [-1,1]){const e=200+3*45+60;
    out.push({name:'The channel\'s rim (a fall of 400 m: '+c.name.toLowerCase()+')',kind:'fall',x:mx+nx*sd*e,z:mz+nz*sd*e,r:Math.min(400,L*.4),h:30,danger:.95,tell:{sign:'the plateau\'s edge: a sheer stepped wall'}});}}});
  return out.concat(ROCKS.map(B=>({name:'Rockfall under a knob',kind:'crush',x:B.x,z:B.z,r:B.R*1.2,h:B.top-B.y0+4,danger:.4,tell:{sign:'fresh spalls at its foot'}})));},
 hazardMin:4,
 views:H=>{const {look}=H,S=STATION,B=ROCKS[0]||{x:1000,z:-1000,R:20,top:1300,y0:1220};
  return{
  'Down the west channel from its rim':look(-1300,-1650,3,-300,-1800,-120),
  'On the channel\'s floor':look(1500,-1000,1.7,2900,-1000,30),
  'A butte on the floor':look(B.x+B.R*3,B.z+B.R*1.5,2,B.x,B.z,(B.top-B.y0)*.5),
  'The mesas\' plateau':look(-1500,1400,2,1500,1800,4),
  'A Hum milestone':look(HEAD_SITE.R[0]?HEAD_SITE.R[0].x+6:0,HEAD_SITE.R[0]?HEAD_SITE.R[0].z+4:0,1.7,HEAD_SITE.R[0]?HEAD_SITE.R[0].x:0,HEAD_SITE.R[0]?HEAD_SITE.R[0].z:0,1.2),
  'North toward the Outlands\' lip':look(300,2400,25,0,-90000,2400),
  'South into the trench':look(0,-2600,30,6000,60000,-600),
  'The chaos from above':look(-2800,2800,450,600,-800,0)};},
 probes:{}};
