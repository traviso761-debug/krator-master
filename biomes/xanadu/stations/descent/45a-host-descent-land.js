// ================================================================= HOST - THE DESCENT'S GROUND: the step, the cataract's foot, Ālph's line onto the floor (a REUSABLE block)
// Station 4's geometry, kept apart from its fields and its LAND (45b) so a station on the floor below (the owner's `floor`, 2026-11-03: the easternmost Rift
// lake under the step) can read the same ground: list this file in its station.json "reads" ({"45a-host-descent-land.js":
// "biomes/xanadu/stations/descent/45a-host-descent-land.js"}) and build its LAND on DESCENT's records. Needs 45-host-stage.js (BIO.fn) and core/rand only.
//
// THE HEIGHTS SETTLED (scale model 5.1, old-canvas px; NOTES.md has the samples): the Vale's lake -717 m (wl at 591,1173); the SE rim beside the step +985 to
// +1,536 m; the cataract step (tranche3's sculpt, px 635-670, 1230-1265) a -240 m step on the normal (.72, .69), its cells at -1,234 to -1,461 m; the floor's
// lake at -1,706 m, the end of Ālph (rivers.json r070: -232 -> -1,646 m). PAGE y = MODEL m + 1,706 (DESCENT.datum): the floor's lake is 0, the Vale's lake +989.
// The Rift floor's own lakes the `floor` station names (5.1 px 909,1556 salt lake at -1,362 m = page +344; the XA lakes at 869,1558 and 883,1552) stand
// above this datum: a floor station keeps the datum and sets its lakes' levels from it.
//
// THE AXIS: s runs south-east down the descent (the step's normal), t across it (north-east +); xzOf(s, t) back to the page.
//   the Vale's lake      s < lakeShore(t) (~ -2300): bed under LAKE_Y
//   the plateau, the lip lakeShore .. cliffS(t): +990-1000, the side ridges rimT(t) rising to +1,330 at |t| ~ 2.9 km
//   THE STEP             cliffS(t) ~ -1750, a 70 m-wide face; the AMPHITHEATRE cut 230 m back into it round t = 0 (the cataract's lip at s ~ -1980)
//   THE CATARACT'S FOOT  RIV.pool {x, z, r: 72, y}: the plunge pool's level (~ +733-748) over a bowl carved 10 m under it
//   THE VALLEY           footH(s, t): from the foot (LAKE_Y - 241) down 640 m to s = 1900 (17%), a 55 m step at s ~ 160 (the lower falls), side ridges
//   THE FLOOR            s > 1900: +80..+3, a salt pan on the north-east side, the floor's lake past seaShore(t) (~ +2380) at 0
//   ĀLPH                 RIV: the line TR(s) (straight to the lip and through the pool, then a meander), its bed RIV.bed, its water RIV.lvl, its width RIV.W,
//                        out of the Vale's lake a hand under its level, over the lip, flat through the pool, down the rapids, into the floor's lake; RIV.mouth
const DX=[.7220,.6919];
const sOf=(x,z)=>x*DX[0]+z*DX[1],tOf=(x,z)=>-x*DX[1]+z*DX[0],xzOf=(s,t)=>[s*DX[0]-t*DX[1],s*DX[1]+t*DX[0]];
const LAKE_Y=989,POOL_R=72;
const nzD=(s,t,f,seed)=>fbm(s*f+3.1,t*f-1.7,seed,2)-.5;
const cliffS=t=>-1750+110*Math.sin(t*.0011+.4)+60*nzD(0,t,.004,601)-230*Math.exp(-(t/260)*(t/260));
const lakeShore=t=>-2300+160*nzD(0,t,.0021,602);
const seaShore=t=>2380+300*nzD(0,t,.0013,603)+.00003*t*t;
const rimT=t=>320*smooth(1300,2900,Math.abs(t))+90*(1-Math.abs(2*fbm(t*.0019,4.2,604,2)-1))*smooth(900,2500,Math.abs(t));
const rimB=(s,t)=>380*smooth(1000,2600,Math.abs(t))*(1-smooth(1800,2700,s));
const footH=(s,t)=>{const s0=cliffS(t)+40,L=1900-s0,f=clamp((s-s0)/L,0,1);
 let h=LAKE_Y-241-640*Math.pow(f,1.15)-55*smooth(130,190,s+30*nzD(0,t,.003,605));
 const fl=smooth(1700,2100,s);h=mix(h,LAKE_Y-900+40*nzD(s,t,.0018,606)-60*smooth(1900,seaShore(t)-80,s),fl);
 h+=rimB(s,t)+120*smooth(2400,3400,Math.abs(t))+14*nzD(s,t,.007,607);
 const pan=smooth(300,700,t)*smooth(seaShore(t)-650,seaShore(t)-250,s)*(1-smooth(seaShore(t)-40,seaShore(t)+10,s));
 return mix(h,LAKE_Y-987.6,pan*.92);};
const plateauH=(s,t)=>{const d=s-lakeShore(t);if(d<0)return LAKE_Y-1.5-Math.min(40,-d*.05);return LAKE_Y+1.5+Math.min(9,d*.03)+rimT(t)+6*nzD(s,t,.006,608);};
function valleyH(s,t){const sc=cliffS(t),k=smooth(sc-35,sc+35,s);let h=mix(plateauH(s,t),footH(s,t),k);
 const ds=s-seaShore(t);if(ds>0)h=Math.min(h,-1.5-Math.min(40,ds*.04));return h;}
const TR=s=>140*Math.sin((s+1500)*.0017)*smooth(-1650,-1150,s)+60*Math.sin(s*.0043+1.1)*smooth(-1400,-900,s);
const RIV=(function(){const S0=lakeShore(0)-60,S1=seaShore(TR(seaShore(0)))+60,P=[],S=[],bed=[],lvl=[],W=[];let pb=1e9,pl=1e9;
 const sc0=cliffS(0),poolS0=sc0+30,poolS1=sc0+30+2*POOL_R;
 for(let s=S0;s<=S1;s+=12){const t=TR(s),xz=xzOf(s,t);P.push(xz);S.push(s-S0);
  let b=valleyH(s,t)-2.4;if(s<sc0-40)b=Math.min(b,LAKE_Y-1.6-(s-S0)*.0008);   /* the outlet: a hand under the lake's level to the lip */
  b=Math.min(b,pb-.02);bed.push(b);pb=b;let l=b+1.8;if(s<sc0-40)l=Math.min(l,LAKE_Y-.05-(s-S0)*.0004);l=Math.min(l,pl);lvl.push(l);pl=l;W.push(15+5*smooth(sc0,2000,s));}
 /* the plunge pool: flat water over the carved bowl at the cataract's toe, as wide as the bowl */
 let pi0=-1,pi1=-1;for(let i=0;i<S.length;i++){const s=S[i]+S0;if(s>=poolS0&&pi0<0)pi0=i;if(s<=poolS1)pi1=i;}
 const PL=lvl[pi1];for(let i=pi0;i<=pi1;i++){lvl[i]=PL;const s=S[i]+S0,u=(s-poolS0)/(poolS1-poolS0);W[i]=Math.max(W[i],2*POOL_R*Math.sqrt(Math.max(0,1-(2*u-1)*(2*u-1)))*.92);}
 /* the mouth: from the floor's shore on, the river's water is the lake's (-.06, under the lake's surface: no ribbon shows over it) */
 let im=S.length-1;for(let i=0;i<S.length;i++)if(S[i]+S0>seaShore(TR(S[i]+S0))-20){im=i;break;}
 for(let i=im;i<S.length;i++)lvl[i]=-.06;
 const pc=xzOf(sc0+30+POOL_R,0);
 return{P,S,S0,LEN:S[S.length-1],bed,lvl,W,pool:{x:pc[0],z:pc[1],r:POOL_R,y:PL},lip:xzOf(sc0-10,0),cliffS:sc0,src:P[0],mouth:P[im],mouthI:im};})();
function riverNear(x,z){const s=sOf(x,z),t=tOf(x,z),u=s-RIV.S0;if(u<-40||u>RIV.LEN+40)return null;const i=clamp(Math.round(u/12),0,RIV.P.length-1),d=Math.abs(t-TR(s))*.97;
 return{d,s:u,i,bed:RIV.bed[i],w:RIV.W[i]*.5,lvl:RIV.lvl[i]};}
function descentH(x,z){const s=sOf(x,z),t=tOf(x,z);let h=valleyH(s,t);
 const r=riverNear(x,z);
 if(r){const w=r.w,tt=Math.max(0,r.d-w),bank=r.bed+(r.d<w?-.5*(1-r.d/w):0)+tt*.14+Math.max(0,tt-8)*1.1;if(bank<h)h=bank;}
 /* the bowl at the cataract's toe: carved under the pool's level, its rim easing into the valley */
 const P=RIV.pool,pr=Math.hypot(x-P.x,z-P.z);if(pr<P.r+30){const bowl=P.y-1.2-9*Math.max(0,1-(pr/P.r)*(pr/P.r));h=Math.min(h,pr<P.r?bowl:mix(P.y-1.2,h,smooth(P.r,P.r+30,pr)));}
 return h;}
const DESCENT={datum:1706,model:{lake:-717,stepTop:[985,1536],stepCells:[-1234,-1461],floorLake:-1706,alph:[-232,-1646]},DX,sOf,tOf,xzOf,LAKE_Y,POOL_R,cliffS,lakeShore,seaShore,rimT,rimB,footH,plateauH,valleyH,TR,RIV,riverNear,h:descentH};
