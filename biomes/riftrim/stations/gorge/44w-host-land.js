// ================================================================= HOST — STATION 4, the gorge (the W rift highland, the veiled rim)
// Scale model 5.1: Chimes Riba (r005, 1,089 m³/s at its mouth) leaves the great lake at 299 m, crosses the basin plain flat for ~80 km, and at
// the notch (px 464,1390, world 928,2780 km; Cfa, ~1,050 mm, +22 degC) falls ~1.9 km in 12 km to the Rift's trough lake (-1,862 m):
// 187 m at px 466,1394, -731 at 468,1398, -1,534 at 470,1398. Its shoulders stand 2.2-3.0 km. CHIMES (ruined arcology, 468,1392) stands at
// the brink. The page compresses the notch into 6 km (x east: downstream runs west to east, z south):
//   west     the river coming down the plain to the notch, slow and wide (~120 m), at 299 m; fan trees and cork oak on its banks
//   middle   THE NOTCH between shoulders rising to ~1.9 km on the page (the far field carries them on); the river narrowing into rapids;
//            CHIMES' SITE on a bench of the north shoulder over the brink (site only: a ruin's terrace, tagged; PLAN.md section 12, answer 3)
//   east     THE FALLS: the brink, then a staircase of three tall falls into the gorge, its floor ~ -600 m at the east edge; spray and fog
//            in the gorge, the cloud belt on the shoulders' upper slopes (mist frills, lobe larches, veil thread)
const STATION=(function(){const R=3000,LV=299;
 const rz=x=>120*Math.sin(x*.0008+.6)+60*Math.sin(x*.0027);              /* the river's line */
 const STEPS=[[400,LV-6,LV-260],[1250,LV-268,LV-560],[2150,LV-570,LV-880]];  /* the falls: x of the lip, the lip's level, the foot's level */
 const wl=x=>{let y=LV-6*smooth(-3200,400,x);for(const s of STEPS){if(x>=s[0])y=s[2]-(x-s[0])*.006;}return y;};
 const W=x=>x<0?60:x<400?mix(60,26,smooth(0,400,x)):22;                   /* the river's half-width: wide on the plain, narrowing to the brink */
 const ridge=(x,z,f,s)=>1-Math.abs(2*fbm(x*f,z*f,s,2)-1);
 const shoulder=(x,z)=>{const d=Math.abs(z-rz(x)),k=smooth(-2600,-300,x);return LV+3+d*(.02+k*.95*smooth(60,700,d))*(1-.35*smooth(1500,2900,d))+k*220*(ridge(x,z,.0012,61)-.5)*smooth(200,900,d);};
 const BENCH={x:200,z:rz(200)-620,r:180,y:LV+260};                         /* Chimes' bench on the north shoulder, over the brink */
 function ground(x,z){const d=Math.abs(z-rz(x)),w=W(x),y=wl(x);let h=shoulder(x,z);
  // the gorge: east of the brink the floor drops with the river, its walls standing to the shoulders
  const gk=smooth(200,600,x),gw=w+60+x*.08;if(gk>0){const wall=smooth(gw*2.6,gw,d);h=mix(h,Math.min(h,y+3+Math.pow(Math.max(0,d-w)/gw,1.6)*(h-y)*.5),wall*gk);}
  // the channel: the bed under the water line
  if(d<w*2.2){const bed=y-3.5-(x<400?2:0);h=d<w?Math.min(h,bed+(d/w)*2.5):mix(h,Math.min(h,y+.6+(d-w)*.25),smooth(w*2.2,w,d));}   /* the bed under the water to the river's edge, the bank just over the water past it */
  // the falls' faces: each lip a sharp step (the ground falls with the water)
  // Chimes' bench: a flat terrace cut into the shoulder
  {const bd=Math.hypot(x-BENCH.x,(z-BENCH.z)*1.4);if(bd<BENCH.r*1.8)h=mix(BENCH.y,h,smooth(BENCH.r*.9,BENCH.r*1.8,bd));}
  return h+6*(fbm(x*.02,z*.02,62,2)-.5)*smooth(w*1.3,w*3,d);}
 const pts=[];for(let x=-3300;x<=3300;x+=20)pts.push([x,rz(x),wl(x)]);
 const falls=STEPS.map((s,i)=>{const x=s[0],z=rz(x),w=W(x),fx=x+Math.max(60,(s[1]-s[2])*.18);return{name:['The brink (the first fall)','The second fall','The third fall'][i],
  lip:[[x,z-w,s[1]+.3],[x,z+w,s[1]+.3]],dir:[1,0],drop:s[1]-s[2],foot:[fx,rz(fx),s[2]],plungeR:Math.max(24,w*1.6)};});
 const L=rimLand({R,ground,river:{pts,width:110,half:(x,z)=>W(x),name:'Chimes Riba',speed:2.2},falls,
  tm:(x,z,h)=>22-6.5*(h-LV)/1000,
  wet:(x,z,h)=>.55+.15*smooth(1400,2100,h)+.2*smooth(400,1600,x)*smooth(300,60,Math.abs(z-rz(x))),
  fog:(x,z,h)=>Math.max(smooth(1500,1900,h)*.9,.7*smooth(380,900,x)*smooth(260,80,Math.abs(z-rz(x)))),   /* the cloud belt; the falls' spray in the gorge */
  rockAt:(x,z,h,sl)=>smooth(.5,.82,sl),
  strataK:(x,z,h,sl)=>smooth(.45,.8,sl),
  strata:BIO.strata({recipe:'rift',seed:6804,range:[-1200,2400],res:.5,private:true}),
  spine:[[-2000,rz(-2000)+150],[-800,rz(-800)-160],[0,rz(0)+120],[BENCH.x,BENCH.z],[400,rz(400)-100],[1250,rz(1250)+120],[2150,rz(2150)-120],[2800,rz(2800)],
   [-1500,-1600],[-1500,1500],[600,-1700],[600,1700]]});
 Object.assign(L,{rz,wl,STEPS,W,BENCH,LV});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The gorge (riftrim station 4)',title:'Krator biome — the rift rim: the gorge',
 hint:'Station 4 of the rift rim, the veiled rim (the W rift highland): Chimes Riba leaving the basin plain through the notch, the brink and a staircase of tall falls into the gorge, Chimes\' site on the shoulder, the cloud belt above (scale model 5.1, px 464,1390)',
 region:{name:'The gorge (station 4)',x:0,z:0,r:TERR.R},rim:'w',wind:[1,0],arcade:false,fruitMin:0,
 species:['mistfrill','lobelarch'],sky:{px:192,py:1060},atm:1.54,cloud:.5,dust:false,   /* the sky's frame: the old canvas (5.1 px less 272,330) */
 fog:{falloff:1/700,sun:.3,sky:.45},climate:{cold:false,dry:false},wet:false,groundN:600,
 groundLayers:['grass','needles','sphagnum','lichen','peat'],
 riverLook:[0x5a8a7a,0x2e5a54],
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),de=Math.max(0,x-S0),dw=Math.max(0,-S0-x),dn=Math.max(0,-S0-z),ds=Math.max(0,z-S0);
  return g-de*.35*smooth(0,4000,de)+(dn+ds)*.35*smooth(0,3000,dn+ds)+dw*.01+200*(fbm(x*.0008,z*.0008,412,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[-1500,400,1600,2600,3400],farLabel:'The shoulders of the notch and the trough past the map',
 build:()=>{const B=STATION.BENCH;REGISTER({name:'Chimes (ruin, site only: PLAN.md section 12, answer 3)',key:'site.chimes',x:B.x,z:B.z,y:B.y-5,r:B.r,h:40});return{chimes:1};},
 kin:[
  {ref:'swlowlands.corkoak',key:'corkoak',name:'Cork oak',cell:40,minR:3,accept:Z=>Z.shore*.22*Z.gentle*(1-Z.lake)},
  {ref:'swlowlands.willow',key:'willow',name:'Veil willow',cell:24,minR:2.5,accept:Z=>Z.lake*.35*smooth(.3,.15,Z.cold)},
  /* OWED: swlowlands.cedar (the tier cedar, Dalab's timber): its builder (swlowlands src/55, B[16]) jitters its 4 m pads up to 1.2 m off the limbs, and the attach audit failed at 2% here (4.4% of its needle cards); grown again once swlowlands holds them (BIO.holdTo). KNOWN_ISSUES.md */
  {ref:'rift.stonepine',key:'stonepine',name:'Rift stone pine',cell:36,minR:3,accept:Z=>Z.shore*.22*smooth(.6,.42,Z.wet)*smooth(.15,.4,Z.slope)},
  {ref:'rift.fantree',key:'fantree',name:'Fan tree',cell:36,minR:2.5,accept:Z=>Z.shore*.16*Z.gentle}],
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,s0=S.STEPS[0],s1=S.STEPS[1];
  return{
  'The notch from upstream':[-1600,S.LV+30,S.rz(-1600)+40,600,S.LV-60,S.rz(600)],
  'The brink':[s0[0]-220,S.LV+14,S.rz(s0[0]-220)-90,s0[0]+300,s0[2]+80,S.rz(s0[0]+300)],
  'The falls from the gorge\'s floor':[s1[0]+500,Math.max(S.wl(s1[0]+500)+25,gh(s1[0]+500,S.rz(s1[0]+500)+40,6)),S.rz(s1[0]+500)+40,s1[0],s1[1]-60,S.rz(s1[0])],
  'Chimes\' bench over the brink':[S.BENCH.x-260,Math.max(S.BENCH.y+30,gh(S.BENCH.x-260,S.BENCH.z-120,8)),S.BENCH.z-120,s0[0]+200,s0[2],S.rz(s0[0]+200)],
  'Mist frills on the shoulder':atTree(nearTree('mistfrill',P.cloud[0],P.cloud[1]),26,2.2,3),
  'Cork oaks and fan trees on the plain':look(P.shore[0]-40,P.shore[1]+30,6,P.shore[0]+40,P.shore[1]-20,4),
  'From afar':look(-2900,2600,700,700,0,0)};},
 probes:{bed(){const x=-1200;return[x,terrainH(x,STATION.rz(x))+.2,STATION.rz(x)];},ice:null}};
