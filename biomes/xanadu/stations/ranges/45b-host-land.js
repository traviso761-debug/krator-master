// ================================================================= HOST - the land: STATION 3, THE HIGH RANGES (PLAN-STATIONS.md; the final rebuild, 2026-11-03)
// On the land contract of src/45b-host-land.js (TERR, terrainH, FIELD_RAW, LAND). The scale model's ranges round the Vale: ET 22.5k km2 at ~5.2 km
// (0.83 atm, ~220 mm, -7 degC) over Dsc/Dfc/Dsb at 3-4 km and EF over 6.2 km; the station's centre is ET's (old px 662,1205). The page compresses that
// climb into 6.8 km of ground at REAL heights, rising south (z) from 3,000 m at the north edge to ~6,700 m on the two summits (a 54% mean grade):
//   north third   THE CONIFER BELT (3.0-4.1 km): the dry-summer subalpine woodland of the Vale side to the west (Dsc: agate pines over gold grass),
//                 the wetter boreal forest to the east (Dfc: mist spruce over moss and ferns); the treeline at ~4.1 km, krummholz above it
//   the middle    THE CHASM'S HEAD, the set piece: Alph's amphitheatre (old px 575,1198 on map 5.1), a bowl 340 m across sunk ~260 m into the belt,
//                 the stream off the alpine falling ~320 m over its south lip into a pool on its floor, and the headwater conduit (map 5.1's
//                 tube_xanadu_nw_09, Alph's subglacial reservoir) bursting from a mouth in its east wall; the chasm runs north out of it to the map's edge
//   south         THE ALPINE (ET, 4.1-5.6 km): fell-field, cushion plants and the dwarf frost willow (EXCHANGES.md xanadu->godthrone, ET 5.3-5.7 km),
//                 talus under the faces (src/87-host-ledges.js), snowbeds; a cirque TARN at ~4.8 km fed by the glacier
//                 THE ICE (EF, over 5.6-6.2 km): the glacier between the two summits (snow that lies, frozen: 87-host-ranges.js), the summits ~6.7 km
// The two vent cones (old px 716,1128 and 770,1168, 10.7 and 8.4 km) stand far off to the north-east: their plumes are the skyline (89-host-sky.js).
const TERR={R:3200,X0:-3400,X1:3400,Z0:-3400,Z1:3400};
const RAN=(function(){
 const nz=(x,z,f,s,o)=>fbm(x*f+s*.137,z*f-s*.071,s,o||3)-.5;
 const AMPH={x:-40,z:-830,r:340},TARN={x:200,z:900,r:110,name:'The cirque tarn'},PEAKS=[[-1150,2950,620,900],[1400,2650,560,820]];
 /* the mountain before any water: the climb south, spurs and gullies that grow with height, the two summits */
 const base=(x,z)=>{const t=clamp((z-TERR.Z0)/(TERR.Z1-TERR.Z0),0,1),rid=1-Math.abs(2*fbm(x*.0011+3,z*.0011-2,71,3)-1);
  let h=3000+3400*Math.pow(t,1.35)+(rid-.5)*mix(160,760,t)+nz(x,z,.004,73,2)*mix(30,90,t);
  for(const P of PEAKS){const d=Math.hypot(x-P[0],z-P[1]);h+=P[2]*Math.exp(-(d*d)/(P[3]*P[3]));}
  return h;};
 /* the stream: from the tarn's outlet north over the alpine to the amphitheatre's lip, then out of the pool down the chasm to the map's edge */
 const LINE=[[200,1015],[150,700],[110,400],[60,40],[10,-330],[-25,-560],[-40,-830],[-60,-1180],[-30,-1560],[-10,-1960],[50,-2400],[70,-2900],[40,-3500]];
 const Q=[];for(let i=0;i<LINE.length-1;i++){const a=LINE[i],b=LINE[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/20));
  for(let k=0;k<n;k++){const t=k/n;Q.push([mix(a[0],b[0],t),mix(a[1],b[1],t)]);}}Q.push(LINE[LINE.length-1]);
 const S=[0];for(let i=1;i<Q.length;i++)S.push(S[i-1]+Math.hypot(Q[i][0]-Q[i-1][0],Q[i][1]-Q[i-1][1]));const LEN=S[S.length-1];
 const P=Q.map((q,i)=>{const s=S[i],w=12*Math.sin(s*.011+.6)+5*Math.sin(s*.031+2);const a=Q[Math.max(0,i-1)],b=Q[Math.min(Q.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;
  const inA=Math.hypot(q[0]-AMPH.x,q[1]-AMPH.z)<AMPH.r*1.1?0:1;return[q[0]-dz/l*w*inA,q[1]+dx/l*w*inA];});
 const amphD=(x,z)=>Math.hypot(x-AMPH.x,z-AMPH.z)/AMPH.r;
 AMPH.floor=base(AMPH.x,AMPH.z+AMPH.r)-320;AMPH.pool=AMPH.floor+.9;   /* the fall off the south lip ~320 m (the lip's ground less the floor) */
 TARN.base=base(TARN.x,TARN.z)-30;const TARNL=TARN.base+.8;
 const tarnD=(x,z)=>{const dx=x-TARN.x,dz=z-TARN.z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)*(1+.1*Math.sin(3*a+1)+.06*Math.sin(5*a))/TARN.r;};
 /* where the line is: the chasm north of the amphitheatre (its walls sheer), the channel south of it (a shallow bed over the alpine) */
 const sA=(function(){let b=0,bd=1e9;P.forEach((p,i)=>{const d=Math.hypot(p[0]-AMPH.x,p[1]-AMPH.z);if(d<bd){bd=d;b=i;}});return S[b];})();
 const chasmK=s=>smooth(sA-60,sA+120,s);
 const halfW=s=>mix(3.5,9,smooth(0,LEN,s));
 /* the bed: down the ground in the alpine (no climbing), the fall into the pool at the lip, the chasm's floor graded out to the edge */
 const bed=[];{let prev=1e9;for(let i=0;i<P.length;i++){const s=S[i];let b;
   if(s<sA-AMPH.r*.95){b=Math.min(base(P[i][0],P[i][1])-2.5,prev-.05);if(tarnD(P[i][0],P[i][1])<1.3)b=Math.min(b,TARNL-.4);}
   else if(s<=sA+AMPH.r*.6)b=Math.min(prev,AMPH.floor+.1);
   else b=Math.min(prev-.03,AMPH.floor-(s-sA)*.11);
   bed.push(b);prev=b;}}
 let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;P.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);});
 const box=[x0-300,z0-300,x1+300,z1+300];
 function near(x,z){if(x<box[0]||x>box[2]||z<box[1]||z>box[3])return null;let bd=1e18,bi=0,bf=0;
  for(let i=0;i<P.length-1;i+=4){const a=P[i],b=P[Math.min(P.length-1,i+4)],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;}}
  bd=1e18;const i0=Math.max(0,bi-4),i1=Math.min(P.length-2,bi+8);
  for(let i=i0;i<=i1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;bf=t;}}
  return{d:Math.sqrt(bd),s:mix(S[bi],S[bi+1],bf),i:bi,bed:mix(bed[bi],bed[bi+1],bf)};}
 function H(x,z){let h=base(x,z);
  /* the cirque round the tarn */
  const td=tarnD(x,z);if(td<4){h=mix(h,TARN.base+Math.max(0,td-.85)*26,smooth(3.6,1.6,td));if(td<1.05)h-=7*smooth(1.05,.3,td);}
  /* the amphitheatre: a flat floor and walls near sheer (3.4 m a metre) up to the ground */
  const ad=amphD(x,z);if(ad<1.45){const wall=AMPH.floor+Math.max(0,ad-.78)*AMPH.r*3.4+3*nz(x,z,.03,77,2);h=Math.min(h,wall);}
  /* the stream's channel; in the chasm a slot with sheer walls */
  const r=near(x,z);if(r){const g=chasmK(r.s),w=halfW(r.s),t=Math.max(0,r.d-w),kf=mix(.08,.4,g),tf=mix(18,2,g),kw=mix(.5,3.4,g);
   const bank=r.bed+(r.d<w?-.5*(1-r.d/w):0)+t*kf+Math.max(0,t-tf)*kw;if(bank<h)h=bank;}
  return h;}
 return{AMPH,TARN,TARNL,PEAKS,P,S,LEN,bed,sA,chasmK,halfW,near,amphD,tarnD,base,H,box};})();
function terrainH(x,z){return RAN.H(x,z);}
// ---------------------------------------------------------------- the climate fields (the kit's five, as its zones read them: XANADU.zones in 55)
//   upland  .04 in the belt (the kit's 'forest' and 'vale' floor planters: moss and ferns east, grass and flowers west), .62 on the alpine (its 'crag'
//           planter: silver tufts, stars, thyme, boulders; the ground's paint half rock), 1 on the ice
//   wet     the Vale side dry (.5: Dsc), the south-east wet (.84: Dfc); the stream, the tarn and the amphitheatre's spray wet
//   mist    the falls' spray in the amphitheatre (the kit's 'chasm' planter: giant ferns and moss in the spray)
const TREELINE=4080;
const FIELD_RAW={
 wet:(x,z)=>{const h=terrainH(x,z),r=RAN.near(x,z);let w=mix(.5,.84,smooth(-1300,1500,x+.25*z));w=mix(w,.56,smooth(TREELINE,TREELINE+300,h));
  if(r)w=Math.max(w,.94*smooth(60,8,r.d));w=Math.max(w,.9*smooth(1.6,1,RAN.tarnD(x,z)),.92*smooth(1.6,.9,RAN.amphD(x,z)));
  return clamp(w+.08*(fbm(x*.0024-9,z*.0024+3,91,2)-.5),0,1);},
 salt:(x,z)=>0,
 upland:(x,z)=>{const h=terrainH(x,z);let u=mix(.04,.62,smooth(TREELINE-100,TREELINE+250,h));u=mix(u,1,smooth(5450,5900,h));return u;},
 flow:(x,z)=>{const r=RAN.near(x,z);return r?clamp(smooth(60,6,r.d),0,1):0;},
 mist:(x,z)=>{const ad=RAN.amphD(x,z),r=RAN.near(x,z);return clamp(Math.max(.75*smooth(1.7,.6,ad),r&&RAN.chasmK(r.s)>.5?.45*smooth(40,8,r.d)*smooth(RAN.sA+900,RAN.sA+200,r.s):0),0,1);}};
// ---------------------------------------------------------------- the land, for the host
const LAND={sd:()=>1e4,station:'ranges',label:'The high ranges round the Vale',
 hint:'Xanadu station 3, the high ranges (3-6.7 km): agate pines and mist spruce, the treeline, fell-field and cushions, the glacier, and Alph\'s chasm head with its falls and the conduit spring',
 /* the stream's channel and water; the glacier carries nothing; the kit's own TREES pass stays off (the Vale's lowland trees do not climb here):
    the station plants the belt's conifers (87-host-ranges.js), the kit's floor planters stay on (they read the fields above) */
 mask:(x,z)=>{if(BIO.cur==='xanadu/trees'&&!RAN.planting)return 0;
  if(BIO.cur==='xanadu/floor'&&FC.at(FC.a.slope,x,z)>.75)return 0;   /* the kit's floor tufts scatter a hand off their spot: on these walls that is a foot in the air or the rock */const r=RAN.near(x,z);if(r&&r.d<RAN.halfW(r.s)+2)return 0;if(RAN.tarnD(x,z)<1.15)return 0;if(RAN.amphD(x,z)<.2)return 0;
  if(terrainH(x,z)>5900)return 0;return 1;},
 spine:[[-2000,-2500],[1900,-2300],[-40,-830],[-1200,-460],[1300,-420],[-500,300],[200,900],[600,2000]],   /* eight origins: the two belts, the amphitheatre, the treeline twice, the fell-field, the tarn, the glacier */
 snowH:5500,lake:false,waterY:-1e4,bands:{upland:[3000,6700]},
 belt:{y0:3500,y1:4400,windward:[.71,.71],density:.0007},   /* the boreal side's cloud: the south-east's wet air lifted up the range */
 exportBox:[-180,-674,120,-374],   /* verify's export tile: the chasm head (the pool, its ferns and the fell-field's cover); the base's box holds no water here */
 dome:false,feetOwed:483/*2026-11-03 re-measured after the feet tolerance and the quaternion fix*/,fruitAll:false,   /* measured 2026-11-03 (SwiftShader): 1,918 of 49,341 feet off the drawn ground, the kit's floor tufts on 50-75% slopes (grass 939, frond 332, clubmoss 270, cushions 242); ratchet down */R:TERR.R+200,river:null,
 far:{label:'The ranges round the Vale',
  h:(x,z)=>{const X0=TERR.X0,X1=TERR.X1,Z0=TERR.Z0,Z1=TERR.Z1,d=Math.max(X0-x,x-X1,Z0-z,z-Z1,0),g=terrainH(clamp(x,X0,X1),clamp(z,Z0,Z1));
   const rid=1-Math.abs(2*KRAND.fbm(x*.0005,.5,z*.0005,3,431)-1);
   /* south the summits go on as a wall of ice; north the ground falls toward the Vale (its lake at 0 lies ~40 km off, past this field); spurs east and west */
   return g+(rid-.5)*700*smooth(0,3000,d)-1500*smooth(0,9000,Z0-z)+(300+600*rid)*smooth(Z1,Z1+4000,z)+200*smooth(0,4000,Math.max(X0-x,x-X1,0));},
  color:(x,z,y,q)=>{const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
   const wood=L([40,58,46]),rock=L([120,112,110]),snow=L([228,232,238]),far=L([118,130,140]);
   let c=mixC(wood,rock,smooth(TREELINE-200,TREELINE+200,y));c=mixC(c,snow,smooth(5300,5800,y));return mixC(c,far,.5*smooth(4500,13000,q.r));}}};
