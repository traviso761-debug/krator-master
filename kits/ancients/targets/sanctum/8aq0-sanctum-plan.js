// ================================================================= THE SANCTUM — the spiral arcology: the plan (records)
// The Ancients' live/work arcology the Eternal State's capital stands round (LORE.md §6.19; kits/eternian/PLAN.md §7,
// which replaces the proposed Plymouth with it). "The Sanctum" is a working name: what the Ancients called it is lost, and
// what the Eternians call it is open.
//
// THE FORM, from the owner's four pictures and their notes (2026-10-20; kits/eternian/refs, the gap noted there): a
// TAPERING DRUM, the volume of Plymouth but 2.5 times its height, CONTINUOUS WITH AND STANDING ON A SIX-POINTED PODIUM:
// a filleted star in three stepped tiers whose six points run up as ridges, each carrying a grand stair to the drum's
// foot. Three of the six stairs (south, north-west, north-east: a triangle) end at GREAT ARCHES framing large plate
// glass; the other three at small entrances. From each great arch a STAIRCASE SPIRALS COUNTERCLOCKWISE round the drum, a
// sixth of a turn a flight, up to the next arch and its BALCONY: nine arches a staircase, thirty in all with the great
// three, every one on one of the star's six axes, and at every level the three staircases' arches a triangle again.
//
//   the podium      a hexagram, 690 m tip to tip, tiers at 0-20-34-48 m converging on the drum
//   the drum        radius 208 m at the podium (a concave skirt) tapering to 80 m at 660 m; a rim and lantern above
//   the ridges      six, on the star's points, stairs from the ground (2 m) to landings at 152 m
//   the entrances   three great arches (south, north-west, north-east), three small doors between them
//   the staircases  three, counterclockwise from the great arches, nine flights and nine arches each, to about 600 m
//
// [G data]: no three.js, no DOM. Every number is a function of the plan's seed and the record's own id and index
// (core/rand: KRAND.hash), never of how many draws came before it, so a record keeps its place when another is added.
// Records carry stable ids (sanctum.gate.0, sanctum.st.12.bay); the Eternians' retrofit (8aq1) is a set of deltas by those
// ids. The drawing (8aq3) reads records and decides nothing.
const SANCTUM={};
SANCTUM.DIM={Y1:48,YT:660,R0:191,R1:80,PW:1.12,SKIRT:18,SKH:48,RT:355,KS:14,TIP0:Math.PI/2,
 TIERS:[[0,20,1],[20,34,.78],[34,48,.56]],NS:192,SH:4,
 // the staircases: three, nine flights each; a flight's rise is .3 of the radius it climbs at (38 to 62 m), so each
 // stays near 25 degrees as the drum narrows
 STAIRS:{n:3,flights:9,rise:.3,rMin:38,rMax:62,w:10},
 GATE:{yb:152,w:16,hs:20,depth:10,wG:56,hsG:44,depthG:16},RIDGE:{yTip:2,out:44,hw:28,hwG:36,land:18}};

// ---- the profiles: pure functions of the dimensions ---------------------------------------------------------------
// the drum's radius before the skirt, and the wall's (the skirt is a concave cove into the podium's top deck)
SANCTUM.rd=function(y){const D=SANCTUM.DIM,t=Math.min(1,Math.max(0,(y-D.Y1)/(D.YT-D.Y1)));return D.R1+(D.R0-D.R1)*Math.pow(1-t,D.PW);};
SANCTUM.rw=function(y){const D=SANCTUM.DIM,u=(y-D.Y1)/D.SKH;return SANCTUM.rd(y)+(u<1&&u>-1e-9?D.SKIRT*(1-u)*(1-u):0);};
// the star, as a radius per azimuth: the union of two equilateral triangles, softened (log-sum-exp) so the points
// and the notches are filleted. Azimuth th is measured from +x toward +z (south); a point stands on TIP0 (due south).
SANCTUM.star=function(th){const D=SANCTUM.DIM,k=D.KS;
 const smin=(a,b)=>-k*Math.log(Math.exp(-a/k)+Math.exp(-b/k));
 const tri=a0=>{let r=1e4;for(const n of [a0+Math.PI,a0+Math.PI/3,a0+5*Math.PI/3]){const c=Math.cos(th-n);if(c>.01)r=smin(r,(D.RT/2)/c);}return r;};
 return -smin(-tri(D.TIP0),-tri(D.TIP0+Math.PI/3));};
// a podium tier's edge: the star pulled in toward the drum by the tier's scale
SANCTUM.tierR=function(k,th){const D=SANCTUM.DIM,r0=SANCTUM.rw(D.Y1);if(k>=D.TIERS.length)return r0;return r0+(SANCTUM.star(th)-r0)*D.TIERS[k][2];};

// ---- a portable draw: a record's number from (seed, id, index, salt) ------------------------------------------------
SANCTUM.u=function(seed,a,b,c){return KRAND.unit(KRAND.hash(seed,a,b==null?0:b,c==null?0:c));};
SANCTUM.rng=function(seed,a,b,c,lo,hi){return lo+(hi-lo)*SANCTUM.u(seed,a,b,c);};

// ---- an arched bay, snapped to the wall's grid ---------------------------------------------------------------------
// The wall is NS segments round and SH-metre rows from Y1, so a bay's sides are segment lines and its floor, spring and
// head are row lines: the hole is exact and the wall needs no clipping. Ra is the arch's radius at the spring.
SANCTUM.bay=function(id,thc,yb,wTarget,hs,depth){const D=SANCTUM.DIM,DT=2*Math.PI/D.NS;
 const ys=yb+hs,r=SANCTUM.rw(ys),n=Math.max(4,2*Math.round(wTarget/(DT*r)/2));
 const i0=Math.round(thc/DT-n/2),th0=i0*DT,th1=(i0+n)*DT,Ra=(th1-th0)/2*r;
 return {id:id,i0:i0,n:n,th0:th0,th1:th1,thc:(th0+th1)/2,yb:yb,ys:ys,yT:Math.ceil((ys+Ra)/D.SH)*D.SH,Ra:Ra,
  depth:depth==null?12:depth,frame:Math.max(3,Ra*.16),proj:3};};

// ---- the plan -----------------------------------------------------------------------------------------------------
SANCTUM.plan=function(o){o=o||{};const D=SANCTUM.DIM,S=o.seed==null?12100:o.seed,D2R=Math.PI/180,TAU=2*Math.PI;
 const P={id:'sanctum',seed:S,dim:D,gates:[],ridges:[],stations:[],bays:[],terminals:[],crown:null};
 // the six entrances at the ridge heads: a great arch on the even points (the triangle), a small door on the odd
 for(let k=0;k<6;k++){const a=D.TIP0+k*Math.PI/3,G=D.GATE,great=k%2===0;
  const B=great?SANCTUM.bay('sanctum.gate.'+k,a,G.yb,G.wG,G.hsG,G.depthG):SANCTUM.bay('sanctum.gate.'+k,a,G.yb,G.w,G.hs,G.depth);
  B.kind='gate';B.k=k;B.great=great;P.gates.push(B);P.bays.push(B);
  // the ridge: from the drum's face out past the star's point; its stair ends on a flat landing before the entrance
  const rIn=SANCTUM.rw(G.yb)-2,rTip=SANCTUM.star(a)+D.RIDGE.out;
  P.ridges.push({id:'sanctum.ridge.'+k,k:k,a:a,rIn:rIn,rTip:rTip,yIn:G.yb,yTip:D.RIDGE.yTip,hwIn:great?Math.max(D.RIDGE.hwG,B.Ra+B.frame):D.RIDGE.hw,hwTip:13,
   park:2.6,slab:.26,sL:D.RIDGE.land/(rTip-rIn)});
  // the Ancients' terminals: two faces flanking every entrance, lit, answering whoever stands before them
  for(const s of [-1,1])P.terminals.push({id:'sanctum.gate.'+k+'.face.'+(s<0?'w':'e'),gate:k,side:s,th:B.thc+s*(B.Ra+B.frame+5)/SANCTUM.rw(G.yb+12),
   y:G.yb+(great?14:(B.ys-G.yb)*.55),size:great?8:5,v:Math.floor(SANCTUM.u(S,101,k,s+1)*8)});}
 // the staircases. Level j (1..9) of staircase h stands a sixth of a turn counterclockwise (seen from above: toward
 // -th) of level j-1, starting from the great arch on point 2h, so every arch is on a point's axis and each level's
 // three arches are a triangle. Levels are numbered across the staircases (n = 3(j-1) + h), so the program, which runs
 // by height, reads them in order. The rise of the flight up to level j is .3 of the radius at level j-1.
 const T=D.STAIRS,SIX=Math.PI/3,lv=[D.GATE.yb];
 for(let j=1;j<=T.flights;j++){const y=lv[j-1],dy=Math.max(T.rMin,Math.min(T.rMax,T.rise*SANCTUM.rw(y)));lv.push(D.SH*Math.round((y+dy)/D.SH));}
 P.levels=lv;P.ramps=[];
 const prev=[P.gates[0],P.gates[2],P.gates[4]];
 for(let j=1;j<=T.flights;j++)for(let h=0;h<T.n;h++){const n=3*(j-1)+h,th=D.TIP0+2*h*SIX-j*SIX,y=lv[j],r=SANCTUM.rw(y);
  // an arch, its head and its balcony fit under the next arch up its axis (two levels up), with ten metres to spare
  const room=(j+2<=T.flights?lv[j+2]:D.YT)-y-12,w=Math.max(26,Math.min(48,.27*r));
  const n0=Math.round(w/(2*Math.PI/D.NS*r)),Ra=n0*Math.PI/D.NS*r;
  const hs=D.SH*Math.floor(Math.min(SANCTUM.rng(S,n,1,0,24,40),room-Ra-4)/D.SH);
  const id='sanctum.st.'+n,band=Math.floor((j-1)/3);
  const B=SANCTUM.bay(id+'.bay',th,y,w,Math.max(12,hs),12);B.kind='bay';B.st=n;B.turn=band;B.stair=h;B.level=j;
  B.balc={d:T.w,hw:B.Ra+B.frame+2,slab:1.4,rail:1.15};
  P.bays.push(B);P.stations.push({id:id,i:n,th:th,y:y,turn:band,bay:B.id,stair:h,level:j});
  // the flight up to it: from the counterclockwise end of the last arch's balcony (or the great arch's landing) to
  // the clockwise end of this one's
  const A=prev[h],ra=SANCTUM.rw(A.yb),hwA=A.kind==='gate'?(A.Ra+A.frame+2):A.balc.hw;
  P.ramps.push({id:'sanctum.stair.'+h+'.'+j,stair:h,level:j,from:A.id,to:B.id,w:T.w,
   th0:A.thc-hwA/ra,y0:A.yb,th1:B.thc+B.balc.hw/r,y1:B.yb});
  prev[h]=B;}
 P.crown={id:'sanctum.crown',y:D.YT,r:SANCTUM.rw(D.YT),rim:14,rimW:6,lanternR:24,lanternH:36,mast:70};
 P.vol=SANCTUM.volume(P);
 return P;};

// the balcony's edge in a bay's frame: across s (|s| <= hw), out from the wall. A squircle: flat in front and nearly
// full depth to its ends, where the flights land on it
SANCTUM.balcOut=function(B,s){const t=Math.min(1,Math.abs(s)/B.balc.hw);return B.balc.d*Math.pow(1-Math.pow(t,10),.1);};

// the built volume: the podium's tiers, the drum and skirt, the ridges, less the bays' recesses (the brief: Plymouth's
// 46 Mm3)
SANCTUM.volume=function(P){const D=SANCTUM.DIM,TAU=2*Math.PI,N=720;let V=0;
 for(let k=0;k<D.TIERS.length;k++){let A=0;for(let i=0;i<N;i++){const r=SANCTUM.tierR(k,i/N*TAU);A+=.5*r*r*TAU/N;}V+=A*(D.TIERS[k][1]-D.TIERS[k][0]);}
 for(let y=D.Y1;y<D.YT;y+=2){const r=SANCTUM.rw(y+1);V+=Math.PI*r*r*2;}
 for(const R of P.ridges){const n=40;for(let j=0;j<n;j++){const s=(j+.5)/n,r=R.rIn+(R.rTip-R.rIn)*s;
  if(r<SANCTUM.tierR(0,R.a))continue;V+=2*SANCTUM.ridgeHW(R,s)*SANCTUM.ridgeY(R,s)*(R.rTip-R.rIn)/n;}}
 for(const B of P.bays)V-=2*B.Ra*B.depth*(B.ys-B.yb+B.Ra*.78);
 return Math.round(V);};

// a record's deltas by id (8aq1's retrofit): a set merges fields into the record with that id; add appends records
SANCTUM.apply=function(P,delta){const by={};
 for(const L of [P.gates,P.ridges,P.stations,P.bays,P.terminals,P.ramps||[]])for(const r of L)by[r.id]=r;
 by[P.crown.id]=P.crown;
 for(const id in (delta.set||{})){if(!by[id])throw new Error('SANCTUM.apply: no record '+id);Object.assign(by[id],delta.set[id]);}
 P.add=(P.add||[]).concat(delta.add||[]);P.state=delta.state||P.state;return P;};

// ---- frames the dressing shares: plain math, metres, the arcology's local frame (x east, z south, y up) ----------
// a point on the drum wall at azimuth th, height y, pushed out by dr
SANCTUM.wallPt=function(th,y,dr){const r=SANCTUM.rw(y)+(dr||0);return [r*Math.cos(th),y,r*Math.sin(th)];};
// a point in a bay's own frame: s across the opening (metres at the spring), h above the spring, dr out from the wall
SANCTUM.bayPt=function(B,s,h,dr){const th=B.thc+s/SANCTUM.rw(B.ys),y=B.ys+h;return SANCTUM.wallPt(th,y,dr);};
SANCTUM.out=function(th){return [Math.cos(th),0,Math.sin(th)];};
// a point on a ridge: s from the drum (0) to the point (1), off across it (toward +th), and its stair line's height
// the stair line: flat on the landing (s < sL), then straight down to the foot
SANCTUM.ridgeY=function(R,s){const sL=R.sL||0;return s<=sL?R.yIn:R.yIn+(R.yTip-R.yIn)*(s-sL)/(1-sL);};
// s at a height on the stair line (the inverse, below the landing)
SANCTUM.ridgeS=function(R,y){const sL=R.sL||0;return sL+(1-sL)*(R.yIn-y)/(R.yIn-R.yTip);};
SANCTUM.ridgeAt=function(R,s,off,dy){const r=R.rIn+(R.rTip-R.rIn)*s,a=R.a,y=SANCTUM.ridgeY(R,s)+(dy||0);
 return [r*Math.cos(a)-off*Math.sin(a),y,r*Math.sin(a)+off*Math.cos(a)];};
SANCTUM.ridgeHW=function(R,s){return R.hwIn+(R.hwTip-R.hwIn)*s;};

// ---- the Ancients' own life: the intact live/work arcology's gardens and people (records, not drawing) -----------
// Gardens on every podium deck and in every bay (the owner's first and third pictures), a crowd on the decks, the
// stairs and the balconies. Positions are hashed from (seed, salt, index): adding a tree moves no other tree.
SANCTUM.dressIntact=function(P){const D=SANCTUM.DIM,S=P.seed,TAU=2*Math.PI,add=[];
 for(let k=0;k<D.TIERS.length;k++){const y=D.TIERS[k][1],n=Math.round(2400*D.TIERS[k][2]/14);
  for(let i=0;i<n;i++){const th=(i+SANCTUM.u(S,201,k,i)*.6)/n*TAU,ro=SANCTUM.tierR(k,th),ri=SANCTUM.tierR(k+1,th);
   if(ro-ri<10)continue;const r=ri+(ro-ri)*SANCTUM.rng(S,202,k,i,.3,.75);
   if(P.ridges.some(R=>Math.abs(Math.sin(th-R.a))*r<SANCTUM.ridgeHW(R,.5)+6&&Math.cos(th-R.a)>0))continue;
   add.push({id:'sanctum.tree.d'+k+'.'+i,kind:'tree',at:[r*Math.cos(th),y,r*Math.sin(th)],h:SANCTUM.rng(S,203,k,i,6,13)});
   if(SANCTUM.u(S,204,k,i)<.35)add.push({id:'sanctum.fig.d'+k+'.'+i,kind:'figure',at:[(r-4)*Math.cos(th),y,(r-4)*Math.sin(th)],ry:SANCTUM.u(S,205,k,i)*TAU});}}
 for(const B of P.bays){if(B.kind==='gate')continue;const m=Math.max(2,Math.floor(B.Ra/5));
  for(let j=0;j<m;j++){const s=-B.Ra+3+(2*B.Ra-6)*(j+.5)/m,p=SANCTUM.bayPt(B,s,B.yb-B.ys,-B.depth+3);
   add.push({id:B.id+'.planter.'+j,kind:'planter',at:p,th:B.thc,w:(2*B.Ra-6)/m-1.2});
   if(j%2===0)add.push({id:B.id+'.tree.'+j,kind:'tree',at:[p[0],p[1]+.9,p[2]],h:SANCTUM.rng(S,206,B.st,j,4,8)});
   add.push({id:B.id+'.fig.'+j,kind:'figure',at:SANCTUM.bayPt(B,s+SANCTUM.rng(S,207,B.st,j,-2,2),B.yb-B.ys,-B.depth*.4),ry:SANCTUM.u(S,208,B.st,j)*TAU});}}
 for(const B of P.bays){if(!B.balc)continue;
  for(let j=0;j<3;j++){const s=B.balc.hw*SANCTUM.rng(S,209,B.st,j,-.8,.8);
   add.push({id:B.id+'.walk.'+j,kind:'figure',at:SANCTUM.bayPt(B,s,B.yb-B.ys,SANCTUM.balcOut(B,s)*SANCTUM.rng(S,210,B.st,j,.2,.7)),ry:SANCTUM.u(S,211,B.st,j)*TAU});}
  for(const sd of [-1,1])add.push({id:B.id+'.balc.planter.'+(sd<0?'w':'e'),kind:'planter',at:SANCTUM.bayPt(B,sd*(B.balc.hw-3),B.yb-B.ys,B.balc.d*.55),th:B.thc,w:4});}
 for(const R of P.ramps)for(let j=0;j<2;j++){const t=SANCTUM.rng(S,215,R.stair*16+R.level,j,.15,.85),th=R.th0+(R.th1-R.th0)*t,y=R.y0+(R.y1-R.y0)*t;
  add.push({id:R.id+'.fig.'+j,kind:'figure',at:SANCTUM.wallPt(th,y,R.w*SANCTUM.rng(S,216,R.stair*16+R.level,j,.3,.7)),ry:th-Math.PI/2});}
 for(const R of P.ridges)for(let j=0;j<8;j++){const s=SANCTUM.rng(S,212,R.k,j,.1,.9),hw=SANCTUM.ridgeHW(R,s);
  add.push({id:R.id+'.fig.'+j,kind:'figure',at:SANCTUM.ridgeAt(R,s,(SANCTUM.u(S,213,R.k,j)<.5?-1:1)*hw*SANCTUM.rng(S,214,R.k,j,.35,.7),.5),ry:R.a+Math.PI});}
 P.add=(P.add||[]).concat(add);P.state='intact';return P;};
