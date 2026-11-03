// ================================================================= HOST - the land: STATION 2, THE CLOUD SLOPES (PLAN-STATIONS.md; the final rebuild, 2026-11-03)
// Scale model (4.23 survey; 5.1: old px +272,+330): the Cfb belt south-east of the Vale at old px 669,1263, ~2.2 km, ~1,300 mm against the Vale's ~500,
// +11 degC (19/3), 1.21 atm; Csb (1.8 km, ~330 mm) and BSk (1.7 km, ~280 mm) on the drier leeward shoulders. The oceanic half of the Vale's brief at full
// strength: the moist air comes up from the south-east (the descent's warm country) and is wrung out on these faces.
// The page compresses the slope into the same 7 x 6.6 km square as the Vale (the host's 46 plane), on the land contract (src/45b-host-land.js):
//   south-east    THE WINDWARD FACE, 1,450 m at the map's SE corner rising to the crest: the mossy evergreen forest, ravines cut down it every ~700 m,
//                 one with the stream (89w); THE FOG BELT, 1,900-2,650 m, where the forest is wettest (the kit's `cloud` zone: tree-ferns, cloud frills,
//                 beard trees, the cousins of 87: the cloud trumpet and the cloud haze blossom, epiphyte-loaded); mist tea wild on the wet face (oidong's)
//   the middle    THE CREST, a ridge running south-west to north-east at ~2,750-2,950 m, rock and crag pines above the cloud
//   north-west    THE LEEWARD SHOULDERS falling gently to ~2,250 m: dry garrigue and maquis (the kit's `dry` zone), terraces in patches with the
//                 deeper cherry of 87 (oidong's cherry, carried back over the pass by the Monks)
// x east, z south (the Vale's frame); u runs south-east (uphill to the crest from the SE corner), v along the ridge.
const TERR={R:3200,X0:-3500,X1:3500,Z0:-3300,Z1:3300};
const CL=(function(){const S2=Math.SQRT1_2;
 const UV=(x,z)=>[(x+z)*S2,(x-z)*S2];
 const crestU=v=>-650+320*Math.sin(v*.00072+.6)+110*Math.sin(v*.0023+1.9);   /* the crest's line (u of the ridge) along v */
 const crestH=v=>2780+120*Math.sin(v*.0011+2.4)+70*Math.sin(v*.0037);
 const peak=(x,z)=>1-Math.abs(fbm(x*.0016+5,z*.0016-3,61,3)*2-1);
 /* the macro slope without ravines or terraces (the far field continues it) */
 function macro(x,z){const [u,v]=UV(x,z),c=crestU(v),H=crestH(v),d=u-c;
  if(d>=0){const t=d/3200;return H-1330*Math.pow(Math.min(t,1.6),.85)+60*(fbm(x*.0011,z*.0011,62,2)-.5);}   /* the windward face */
  const t=-d;return H-90*smooth(0,260,t)-420*smooth(150,2600,t)-120*smooth(2400,5000,t)+45*(fbm(x*.0013-2,z*.0013+4,63,2)-.5);}   /* the leeward shoulders */
 /* the ravines down the windward face: a gully every ~700 m along the ridge, deepening downhill; G0 holds the stream */
 const GULLY=[-2100,-1400,-700,0,700,1400,2100],G0=3;
 const gullyV=(k,u)=>GULLY[k]+70*Math.sin(u*.0021+k*1.7)+28*Math.sin(u*.0063+k);
 function ravine(x,z){const [u,v]=UV(x,z),d=u-crestU(v);if(d<-60)return{cut:0,k:-1,off:1e9};let best=1e9,bk=-1;
  for(let k=0;k<GULLY.length;k++){const o=v-gullyV(k,u);if(Math.abs(o)<Math.abs(best)){best=o;bk=k;}}
  const D=(bk===G0?62:44)*smooth(-60,900,d)*(1+.25*Math.sin(u*.004+bk)),w=bk===G0?85:70;return{cut:D*Math.exp(-(best*best)/(w*w)),k:bk,off:best};}
 /* the terraces on the leeward shoulders: patches where the slope is stepped into 3.5 m benches (Xanadu's gardens nobody tends) */
 const terraceK=(x,z)=>{const [u,v]=UV(x,z),d=u-crestU(v);return smooth(-250,-700,d)*smooth(-3200,-2700,d)*smooth(.52,.64,fbm(x*.0019+8,z*.0019-6,64,2));};
 function ground(x,z){let h=macro(x,z)+18*(peak(x,z)-.5)*smooth(2300,2800,macro(x,z));const r=ravine(x,z);h-=r.cut;
  const tk=terraceK(x,z);if(tk>0){const s=3.5,t=h/s,f=t-Math.floor(t);h=mix(h,(Math.floor(t)+smooth(.72,1,f))*s,tk*.9);}
  return h;}
 /* the stream: down gully G0 from below the crest to the map's SE edge; its bed never climbs downstream */
 const P=[];for(let u=-300;u<=5200;u+=20){const v=gullyV(G0,u),x=(u+v)*S2,z=(u-v)*S2;if(x>TERR.X1+60||z>TERR.Z1+60)break;if(u-crestU(v)<180)continue;P.push([x,z]);}
 const S=[0];for(let i=1;i<P.length;i++)S.push(S[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
 const bed=[];let prev=1e9;for(let i=0;i<P.length;i++){const b=Math.min(ground(P[i][0],P[i][1])-2.4,prev-.05);bed.push(b);prev=b;}
 return{UV,crestU,crestH,macro,ravine,terraceK,ground,stream:{P,S,LEN:S[S.length-1],bed,halfW:s=>mix(2.5,6,smooth(0,S[S.length-1],s))},G0};})();
function streamNear(x,z){const rv=CL.ravine(x,z);if(rv.k!==CL.G0||Math.abs(rv.off)>160)return{d:1e9,s:0,bed:0};   /* only in the stream's own ravine */
 const P=CL.stream.P;let bd=1e18,bi=0,bf=0;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d2=px*px+pz*pz;if(d2<bd){bd=d2;bi=i;bf=t;}}
 return{d:Math.sqrt(bd),s:mix(CL.stream.S[bi],CL.stream.S[bi+1],bf),bed:mix(CL.stream.bed[bi],CL.stream.bed[bi+1],bf)};}
// the stream's channel cut into the ravine floor: the bed and steep little banks
function terrainH(x,z){let h=CL.ground(x,z);const r=CL.ravine(x,z);if(r.k===CL.G0&&Math.abs(r.off)<60){const s=streamNear(x,z),w=CL.stream.halfW(s.s),t=Math.max(0,s.d-w),bank=s.bed+(s.d<w?-.3*(1-s.d/w):0)+t*.5+Math.max(0,t-4)*1.4;if(bank<h)h=bank;}return h;}
// ---------------------------------------------------------------- the climate fields (the kit's five, read by XANADU.zones)
const windK=(x,z)=>{const [u,v]=CL.UV(x,z);return smooth(-120,220,u-CL.crestU(v));};   /* 1 on the windward face, 0 over the crest */
const FIELD_RAW={
 wet:(x,z)=>{const h=terrainH(x,z),w=windK(x,z),r=CL.ravine(x,z);let k=mix(.36,.86,w);k=mix(k,.55,smooth(2650,2850,h)*w);k=Math.max(k,.9*smooth(40,6,r.cut>0?Math.abs(r.off):1e9)*w);
  k+=.08*(fbm(x*.0024-9,z*.0024+3,71,2)-.5);return clamp(k-.12*CL.terraceK(x,z),0,1);},
 salt:(x,z)=>0,
 /* the kit's upland: low (forest) on the face below the belt, the cloud band's .3-.55 in the belt, crag over the crest, the dry band on the shoulders */
 upland:(x,z)=>{const h=terrainH(x,z),w=windK(x,z);const face=mix(.06,.44,smooth(1750,2050,h)),lee=mix(.38,.3,smooth(2700,2350,h))-.1*CL.terraceK(x,z);
  return clamp(mix(lee,face,w)+.3*smooth(2690,2880,h)+.05*(fbm(x*.003,z*.003,72,2)-.5),0,1);},
 flow:(x,z)=>{const s=streamNear(x,z);return clamp(smooth(60,5,s.d),0,1);},
 /* the fog: the belt on the windward face (1,900-2,650 m), thicker in the ravines, broken by a slow noise; none in the lee */
 mist:(x,z)=>{const h=terrainH(x,z),w=windK(x,z),r=CL.ravine(x,z),band=smooth(1800,2000,h)*smooth(2760,2560,h);
  return clamp(w*(band*(.62+.5*smooth(.4,.62,fbm(x*.0021+4,z*.0021-6,73,2)))+.25*smooth(30,0,r.cut>0?Math.abs(r.off):1e9)*smooth(1550,1900,h)),0,1);}};
// ---------------------------------------------------------------- the land, handed to the host (the contract: src/45b-host-land.js)
const LAND={station:'cloud',sd:(x,z)=>1e4,waterY:-1e4,
 mask:(x,z)=>{const s=streamNear(x,z);return s.d<CL.stream.halfW(s.s)+2?0:1;},   // the stream's channel and its water
 spine:[[1800,1800],[900,900],[0,0],[-900,-900],[2200,200],[200,2200],[-1600,600],[600,-1600],[-2200,-1000],[-1000,-2200],[2600,2600]],
 snowH:9000,label:'The cloud slopes',bands:{upland:[1450,2950]},R:TERR.R+300,dome:false,
 hint:'Xanadu, station 2: the cloud slopes south-east of the Vale at ~2.2 km: mossy evergreen forest in a fog belt on the windward face, ravines and a stream, the crest, and the dry garrigue and terraces of the leeward shoulders',
 belt:{y0:1900,y1:2650,windward:[.71,.71],density:.0016},
 /* the far field: the face runs on down to the south-east toward the descent's country, the ridge continues north-east and south-west, the lee falls
    north-west toward the Vale (its lake far below, past the far field's reach) */
 far:{label:'The ranges round the cloud slopes',h:(x,z)=>{const m=CL.macro(x,z),[u,v]=CL.UV(x,z),d=u-CL.crestU(v);return Math.max(d>0?mix(m,900,smooth(5000,14000,d)):mix(m,1400,smooth(-4000,-14000,d)),300);},
  color:(x,z,y,q)=>{const L=a=>a.map(c=>Math.pow(c/255,2.2)),mx=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
   const wood=L([40,62,40]),dry=L([132,118,78]),rock=L([128,120,116]),far=L([112,126,132]);let c=mx(dry,wood,windK(x,z)*.9+.1*smooth(1800,1200,y));c=mx(c,rock,smooth(2650,2900,y));return mx(c,far,.5*smooth(4500,13000,q.r));}},
 fruitAbsent:['lotus'],   /* the lotus grows on the Vale's lake: no still water here, so its seed heads are not drawn (99's fruit check reads this list) */
 feetOwed:0};
