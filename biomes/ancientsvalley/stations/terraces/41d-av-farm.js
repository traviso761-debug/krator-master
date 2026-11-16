// ================================================================= THE ANCIENT'S VALLEY — the Terraces: the farm belt's plan (records)
// [G data] PLAN.md section 12, 2b: Soleri's planned farm developments round a civic hub town, aqueducts on arches and pylon lines between,
// the fields and orchards gone to thicket. Plain records on core/rand (KRAND) and core/space (KSPACE): no THREE, no DOM, so Godot takes the
// same plan (tests/test-farm.js). Everything is decided here; the stage draws what this returns (70-host-city.js the buildings through the
// metropolis kit's tiers, 70t-host-farm.js the lines, 87t-host-thicket.js the fields).
//   AV.farm(o) -> {hub, towers, aqueduct, roads, pylons, fields, clusters, arrays, roadD(x,z), aqD(x,z), fieldAt(x,z), boxD(T,x,z), ...}
//     o: {R, seed, ground(x,z) (the raw ground, page y), lakeY, extent(family) -> [hw, hd] (the footprint's half extents in its frame),
//         crops: [{id, card, form}] (what the fields grow: kits/crops, picked by the stage), hubNear [x, z]}
//   AV.FARM_CUTS, AV.AQ_CUTS  the farm belt's ruin shares (cumulative, AV.RUINS's order), the aqueduct's apart (a line that reads as one)
// The plan, in order (each step avoids what came before it):
//   1 THE HUB: the flattest ground near o.hubNear: the hall, the market beside it along the contour, a ring road round them
//   2 THE AQUEDUCT: a contour line 320 m upslope of the hub, traced both ways in modules of the kit's joint (MP.aqueductJoin's length: 66 m),
//     each turning at most 5 degrees from the last, level but for a fall of 3 cm a module toward its west end; the pump house and the water
//     tower beside it on the hub's side, where the line passes nearest
//   2b THE HONEYCOMBS: four arrays of twelve to nineteen pods packed on a 53 m hex lattice (flat to flat, a walk of 8 m between), each on one
//     level the relief cuts and fills, out on the belt off the aqueduct and the trunk's line; a spoke road to each (out.arrays, also in clusters)
//   3 THE CLUSTERS: on rings round the hub, each a small honeycomb (the lattice's first ring) of growing pods, a row of vault houses along the contour, or (on the steeper
//     ground) growing stacks facing down the slope; a road from the ring to each
//   4 THE ROADS: the ring, a spoke to each cluster and to the pump house, the trunk road down the slope to the page's edge; where a road
//     meets the aqueduct it passes under an arch (the crossing moved to the arch's middle, square to the line)
//   5 THE PYLONS: two lines down the slope, a pylon every 280 m nudged off every pad, road and the aqueduct
//   6 THE FIELDS: parcels on a grid along the contour, wherever nothing else stands, each a crop or an orchard (o.crops)
(function(){
 var S=AV.smooth,CL=AV.clamp;
 /* the farm belt is far from the war at the lake, but a thousand years on: the glass is gone from most (gutted 30%), a few stand whole */
 AV.FARM_CUTS=[.04,.34,.52,.70,.82,.88,1.01];
 AV.AQ_CUTS=[.10,.60,.80,.94,.98,.98,1.01];
 var stateOf=function(cuts,u){var i=0;while(i<cuts.length-1&&u>=cuts[i])i++;return AV.RUINS[i];};
 /* the distance from (x, z) to a polyline's segments, and the nearest point's parameter */
 var segD=function(a,b,x,z){var dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1e-9,t=CL(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1),px=a[0]+dx*t,pz=a[1]+dz*t;return{d:Math.hypot(x-px,z-pz),t:t,x:px,z:pz};};
 /* a box record's signed distance (negative inside): its centre, yaw (cos c, sin s), half extents rx (along its frame x) and rz */
 var boxD=function(T,x,z){var dx=x-T.x,dz=z-T.z,u=dx*T.c-dz*T.s,v=dx*T.s+dz*T.c,ex=Math.abs(u)-T.rx,ez=Math.abs(v)-T.rz;return ex>0||ez>0?Math.hypot(Math.max(ex,0),Math.max(ez,0)):Math.max(ex,ez);};
 AV.farmBoxD=boxD;
 /* what the fields grew (kits/crops): the crops the south-west lowlands' zones grow rain-fed or wild (the site is Cfa, 1,694 mm: kits/crops PLAN.md
    reads the swlowlands kit as its plain and bayou), grown in a field, with a card in the crops kit's pack; one crop a card, the first by id, at most
    ten field crops and four tree crops (a card is three items on the page: its cells). -> [{id, name, card, fam (the pack's family), form, bucket}] */
 AV.farmCrops=function(CR){if(!CR||!CR.forBiome)return[];var seen={},out=[],nt=0,nf=0;
  CR.forBiome('swlowlands').filter(function(r){var c=r.crop;return(r.how==='rain'||r.how==='wild')&&c.grown==='field'&&c.card&&/^card\.(crop|orchard|croptree)/.test(c.card);})
   .sort(function(a,b){return a.crop.id<b.crop.id?-1:a.crop.id>b.crop.id?1:0;}).forEach(function(r){var c=r.crop,tree=c.form==='tree';if(seen[c.card])return;if(tree?nt>=4:nf>=10)return;seen[c.card]=1;if(tree)nt++;else nf++;
    out.push({id:c.id,name:c.name,card:c.card,fam:c.card.replace(/\./g,'_'),form:tree?'tree':c.form,bucket:c.bucket});});return out;};
 /* the land: the model's heights (AV.model) and the page's relief on them, station 0's rule (46z: ridged noise scaled by the model's slope, finer
    noise for the ground's grain, none under the lake's level). o: {model, base, lakeY, seed} -> (x, z) => page y */
 AV.farmLand=function(o){var M=o.model,BASE=o.base,LY=o.lakeY,SEED=o.seed|0;
  return function(x,z){var m=M.at(x,z)-BASE,s=(M.at(x+600,z)-M.at(x-600,z))/1200,t=(M.at(x,z+600)-M.at(x,z-600))/1200,st=Math.hypot(s,t),r=1-Math.abs(2*KRAND.fbm(x*.0013+3.7,z*.0013-9.1,0,4,SEED+1)-1),f=KRAND.fbm(x*.011+1.3,z*.011+2.2,0,3,SEED+2);
   return m+(14+260*Math.min(.5,st))*(r-.45)*S(LY-30,LY+6,m)+2.2*(f-.5);};};
 AV.farm=function(o){
  var R=o.R,seed=o.seed|0,G=o.ground,u=function(a,b,c){return KRAND.unit(KRAND.hash(seed,a|0,b|0,c|0));},ext=o.extent,margin=6;
  var grad=function(x,z){var e=20;return[(G(x+e,z)-G(x-e,z))/(2*e),(G(x,z+e)-G(x,z-e))/(2*e)];},slope=function(x,z){var g=grad(x,z);return Math.hypot(g[0],g[1]);};
  var out={towers:[],roads:[],pylons:[],fields:[],clusters:[],dropped:{pad:0,road:0,aq:0,edge:0,slope:0}};
  var PADS=KSPACE.create({cell:200});out.pads=PADS;
  /* a building record (AV.plan's shape, so the city stage draws it), its box for the conflicts: frame x along yaw */
  /* THE YAW: the station turns its buildings in three.js's sense (yaw3: local x to (cos, -sin), with c and s for its own checks); the page draws
     every tower in the plan's (yaw: local x to (cos, sin), the lobbies' finding, 2026-11-10), so the record's yaw is the negation. Before, every
     farm building and aqueduct module drew mirrored about its own axis, the aqueduct's modules skewed off their line (the owner: "aqueduct does not
     align segments properly") */
  var mk=function(fam,x,z,yaw,id,cuts,salt){var e=ext(fam),st=stateOf(cuts,u(salt,7,1));var T={id:id,key:fam+'.'+st,family:fam,state:st,x:x,z:z,y:G(x,z),yaw:-yaw,yaw3:yaw,kind:'farm',lean:0,leanDir:0,
    c:Math.cos(yaw),s:Math.sin(yaw),rx:e[0]+margin,rz:e[1]+margin};T.padR=Math.hypot(T.rx,T.rz);T.ease=14;
   if(fam!=='aqueduct'&&(st==='broken'||st==='crown'||st==='stump'))T.lean=(st==='broken'?3:1.5)*u(salt,8,1);T.leanDir=u(salt,9,1)*Math.PI*2;return T;};
  /* the conflicts: another pad (their boxes closer than gap), a road, the aqueduct's corridor, the page's edge, the slope */
  var near=[];var padClash=function(T,gap){near.length=0;PADS.query(T.x,T.z,T.padR+gap+80,near);for(var i=0;i<near.length;i++){var P=near[i];if(P===T||(T.array!=null&&P.array===T.array))continue;   /* a honeycomb's own pods share their walks */
    var corners=[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1],[0,0]];for(var k=0;k<corners.length;k++){var q=corners[k],lx=q[0]*T.rx,lz=q[1]*T.rz,wx=T.x+lx*T.c+lz*T.s,wz=T.z-lx*T.s+lz*T.c;if(boxD(P,wx,wz)<gap)return true;}
    var cs=[[1,1],[1,-1],[-1,1],[-1,-1]];for(k=0;k<4;k++){q=cs[k];lx=q[0]*P.rx;lz=q[1]*P.rz;wx=P.x+lx*P.c+lz*P.s;wz=P.z-lx*P.s+lz*P.c;if(boxD(T,wx,wz)<gap)return true;}}return false;};
  var put=function(T){PADS.insert(T,T.x,T.z,T.padR+20);out.towers.push(T);return T;};
  // ---------------------------------------------------------------- 1 the hub
  var hn=o.hubNear||[0,400],hub=null,hs=1e9;for(var hx=-800;hx<=800;hx+=50)for(var hz=-800;hz<=800;hz+=50){var x=hn[0]+hx,z=hn[1]+hz;if(Math.hypot(hx,hz)>800||Math.hypot(x,z)>R-700)continue;
   var sc=slope(x,z)*1000+Math.hypot(hx,hz)/300;if(sc<hs){hs=sc;hub=[x,z];}}
  var gh=grad(hub[0],hub[1]),gl=Math.hypot(gh[0],gh[1])||1,up=[gh[0]/gl,gh[1]/gl],along=[-up[1],up[0]];if(along[0]<0)along=[-along[0],-along[1]];
  out.hub={x:hub[0],z:hub[1],y:G(hub[0],hub[1]),up:up,along:along,ring:190};
  var yawAlong=Math.atan2(-along[1],along[0]);
  put(mk('hall',hub[0],hub[1],yawAlong+Math.PI/2*0,'av.f.hall',AV.FARM_CUTS,11));
  put(mk('market',hub[0]+along[0]*118,hub[1]+along[1]*118,yawAlong,'av.f.market',AV.FARM_CUTS,12));
  // ---------------------------------------------------------------- 2 the aqueduct along a contour
  var J=o.joint,L=J.len,s0=[hub[0]+up[0]*320,hub[1]+up[1]*320],cY=G(s0[0],s0[1]);
  var trace=function(start,dir0,maxN){var pts=[start.slice()],p=start.slice(),d=dir0.slice();for(var n=0;n<maxN;n++){var q=[p[0]+d[0]*L,p[1]+d[1]*L];
    for(var k=0;k<4;k++){var g=grad(q[0],q[1]),g2=g[0]*g[0]+g[1]*g[1];if(g2<1e-8)break;var e=G(q[0],q[1])-cY;q[0]-=e*g[0]/g2;q[1]-=e*g[1]/g2;}
    var nd=[q[0]-p[0],q[1]-p[1]],nl=Math.hypot(nd[0],nd[1])||1;nd=[nd[0]/nl,nd[1]/nl];
    /* at most 5 degrees from the last module */
    var cr=d[0]*nd[1]-d[1]*nd[0],dt=d[0]*nd[0]+d[1]*nd[1],an=Math.atan2(cr,dt),lim=5*Math.PI/180;if(Math.abs(an)>lim){var a2=Math.sign(an)*lim,c2=Math.cos(a2),s2=Math.sin(a2);nd=[d[0]*c2-d[1]*s2,d[0]*s2+d[1]*c2];}
    q=[p[0]+nd[0]*L,p[1]+nd[1]*L];if(Math.hypot(q[0],q[1])>R-90)break;if(Math.abs(G(q[0],q[1])-cY)>9)break;   /* the contour lost (a cliff, a knoll): the line ends */
    pts.push(q);p=q;d=nd;}return pts;};
  var E=trace(s0,along,40),W=trace(s0,[-along[0],-along[1]],40),line=E.slice().reverse().concat(W.slice(1));
  var mods=[];for(var i=0;i+1<line.length;i++){var a=line[i],b=line[i+1],dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,T=mk('aqueduct',(a[0]+b[0])/2,(a[1]+b[1])/2,Math.atan2(-dz,dx),'av.f.aq.'+i,AV.AQ_CUTS,1000+i);
   T.y=cY-i*.03;T.lean=0;T.line='aq';T.i=i;T.a=a;T.b=b;T.dir=[dx,dz];mods.push(put(T));}
  out.aqueduct={pts:line,modules:mods,cY:cY,joint:J};
  var aqD=function(x,z){var d=1e9;for(var i=0;i+1<line.length;i++){var r=segD(line[i],line[i+1],x,z);if(r.d<d)d=r.d;}return d;};out.aqD=aqD;
  /* the pump house and the water tower on the hub's side where the line passes nearest the hub */
  var best=null,bd=1e9;for(i=0;i<line.length;i++){var dd=Math.hypot(line[i][0]-hub[0],line[i][1]-hub[1]);if(dd<bd){bd=dd;best=line[i];}}
  var toHub=[hub[0]-best[0],hub[1]-best[1]],th=Math.hypot(toHub[0],toHub[1])||1;toHub=[toHub[0]/th,toHub[1]/th];
  var pump=put(mk('pumphouse',best[0]+toHub[0]*46,best[1]+toHub[1]*46,Math.atan2(-toHub[1],toHub[0])+Math.PI,'av.f.pump',AV.FARM_CUTS,13));
  put(mk('watertower',pump.x+along[0]*72,pump.z+along[1]*72,0,'av.f.water',AV.FARM_CUTS,14));
  // ---------------------------------------------------------------- 2b the honeycombs: pods packed on a hex lattice
  /* the pod's hex has its corners on its frame x (52 m across them, 45 across the flats): on a lattice of 53 m its neighbours face it flat to flat
     with a walk of 8 m between, at 30, 90, 150... degrees. A honeycomb is the lattice's slots to a ring (1: seven, 2: nineteen) on one level y (the
     slots' median ground), every pod on it; a slot is kept when its box's ground lies within 5 m of that level (the relief cuts and fills it,
     the walks with it) and it is clear of everything else; the array stands when minN pods or more are kept */
  var AS=53,LAT=[];for(var qa=-2;qa<=2;qa++)for(var ra=-2;ra<=2;ra++){var sa3=-qa-ra;if(Math.abs(sa3)>2)continue;LAT.push({lx:qa*AS*Math.cos(Math.PI/6),lz:qa*AS*.5+ra*AS,ring:Math.max(Math.abs(qa),Math.abs(ra),Math.abs(sa3)),q:qa,r:ra});}
  LAT.sort(function(a,b){return a.ring-b.ring||a.q-b.q||a.r-b.r;});
  var underT=function(T){var lo=1e9,hi=-1e9;for(var a=-1;a<=1;a+=.5)for(var b=-1;b<=1;b+=.5){var lx=a*(T.rx-margin),lz=b*(T.rz-margin),h=G(T.x+lx*T.c+lz*T.s,T.z-lx*T.s+lz*T.c);if(h<lo)lo=h;if(h>hi)hi=h;}return[lo,hi];};
  var roadClash=null;
  var honey=function(id,x,z,rings,minN,salt,dry){var slots=LAT.filter(function(s){return s.ring<=rings;}),hs=slots.map(function(s){return G(x+s.lx,z+s.lz);}).sort(function(a,b){return a-b;}),y0=hs[hs.length>>1],got=[],drop={edge:0,aq:0,pad:0,road:0,slope:0};
   slots.forEach(function(s,k){var T=mk('pod',x+s.lx,z+s.lz,0,id+'.p'+k,AV.FARM_CUTS,salt+k);T.array=id;T.y=y0;
    if(Math.hypot(T.x,T.z)+T.padR>R-40){drop.edge++;return;}if(aqD(T.x,T.z)<Math.max(T.rx,T.rz)+12){drop.aq++;return;}if(padClash(T,4)){drop.pad++;return;}
    if(roadClash&&roadClash(T)){drop.road++;return;}var lh=underT(T);if(lh[0]<y0-5||lh[1]>y0+5){drop.slope++;return;}got.push(T);});
   if(dry)return got.length;if(got.length<minN)return null;for(var k in drop)out.dropped[k]+=drop[k];
   var arr={id:id,x:x,z:z,y:y0,rings:rings,members:[],reach:0};got.forEach(function(T){put(T);arr.members.push(T.id);arr.reach=Math.max(arr.reach,Math.hypot(T.x-x,T.z-z)+T.padR);});return arr;};
  /* the arrays: four of them (twelve pods or more), on the belt 950 to 2,150 m from the hub, 700 m apart, off the aqueduct and the trunk's line */
  out.arrays=[];{var dn0=[-up[0],-up[1]],cand=[];for(var rr2=950;rr2<=2150;rr2+=240)for(var k2=0;k2<40;k2++){var t2=(k2+u(rr2,k2,61)*.6)/40*Math.PI*2,x=hub[0]+Math.cos(t2)*rr2,z=hub[1]+Math.sin(t2)*rr2;
    if(Math.hypot(x,z)>R-200||aqD(x,z)<230)continue;if(segD([hub[0],hub[1]],[hub[0]+dn0[0]*2*R,hub[1]+dn0[1]*2*R],x,z).d<240)continue;cand.push({x:x,z:z,r:rr2,k:k2});}
   cand.forEach(function(c){c.n=honey('x',c.x,c.z,2,0,0,true);c.sc=-c.n+u(c.r,c.k,62)*.9;});cand.sort(function(a,b){return a.sc-b.sc;});
   for(var ci2=0;ci2<cand.length&&out.arrays.length<4;ci2++){var c=cand[ci2];if(c.n<14)break;if(out.arrays.some(function(A){return Math.hypot(A.x-c.x,A.z-c.z)<700;}))continue;
    var A=honey('av.f.a'+out.arrays.length,c.x,c.z,2,12,3000+out.arrays.length*20);if(A){A.kind='array';out.arrays.push(A);out.clusters.push(A);}}}
  // ---------------------------------------------------------------- 3 the clusters, and 4 their roads
  var road=function(id,pts,w,kind){var r={id:id,pts:pts,w:w,kind:kind};out.roads.push(r);return r;};
  var ring=[];for(i=0;i<=40;i++){var t=i/40*Math.PI*2;ring.push([hub[0]+Math.cos(t)*out.hub.ring,hub[1]+Math.sin(t)*out.hub.ring]);}road('av.f.r.ring',ring,8,'ring');
  var CEN=[],RINGS=[[620,5],[1020,7],[1450,9],[1900,11],[2350,12]];
  RINGS.forEach(function(rg,ri){for(var k=0;k<rg[1];k++){var t=(k+u(ri,k,21))/rg[1]*Math.PI*2+u(ri,0,22)*6,rr=rg[0]+(u(ri,k,23)-.5)*160,x=hub[0]+Math.cos(t)*rr,z=hub[1]+Math.sin(t)*rr;
   if(Math.hypot(x,z)>R-170){out.dropped.edge++;continue;}if(aqD(x,z)<150){out.dropped.aq++;continue;}if(CEN.some(function(c){return Math.hypot(c[0]-x,c[1]-z)<300;}))continue;if(out.arrays.some(function(A){return Math.hypot(A.x-x,A.z-z)<A.reach+260;}))continue;
   var sl=slope(x,z);if(sl>.2){out.dropped.slope++;continue;}CEN.push([x,z,sl,ri,k]);}});
  /* each road from the ring toward its cluster, stopping 100 m short (its turning place); the trunk down the slope; the spoke to the pump */
  var spoke=function(id,tx,tz,stop){var d=[tx-hub[0],tz-hub[1]],l=Math.hypot(d[0],d[1])||1;d=[d[0]/l,d[1]/l];var a=[hub[0]+d[0]*out.hub.ring,hub[1]+d[1]*out.hub.ring],b=[tx-d[0]*stop,tz-d[1]*stop];
   if(l-stop<out.hub.ring+10)return null;var pts=[a];for(var s=1;s<=8;s++)pts.push([a[0]+(b[0]-a[0])*s/8,a[1]+(b[1]-a[1])*s/8]);
   /* a building placed before the roads (the hub's, the pump house, the water tower) is not driven through: the spoke is not built */
   var L2=Math.hypot(b[0]-a[0],b[1]-a[1]);for(var q=0;q<=L2;q+=8){var x=a[0]+(b[0]-a[0])*q/L2,z=a[1]+(b[1]-a[1])*q/L2;near.length=0;PADS.query(x,z,120,near);if(near.some(function(P){return P.family!=='aqueduct'&&boxD(P,x,z)<3.5+3;}))return null;}
   return road(id,pts,7,'spoke');};
  CEN.forEach(function(c,ci){c.road=spoke('av.f.r.c'+ci,c[0],c[1],100);});
  spoke('av.f.r.pump',pump.x,pump.z,48);
  out.arrays.forEach(function(A){A.road=spoke('av.f.r.'+A.id.split('.').pop(),A.x,A.z,A.reach+6);});
  {var dn=[-up[0],-up[1]],pts=[[hub[0]+dn[0]*out.hub.ring,hub[1]+dn[1]*out.hub.ring]];for(var s=1;s<=60;s++){var q=[pts[0][0]+dn[0]*s*60,pts[0][1]+dn[1]*s*60];if(Math.hypot(q[0],q[1])>R-30)break;near.length=0;PADS.query(q[0],q[1],120,near);if(near.some(function(P){return boxD(P,q[0],q[1])<8;}))break;pts.push(q);}if(pts.length>2)road('av.f.r.trunk',pts,9,'trunk');}
  /* a road that meets the aqueduct passes under an arch: the crossing moved to the arch's middle, the road square to the line for 24 m either side */
  /* a crossing is good when it lies in an arch's clear span with the carriageway and 1.5 m either side; the others are moved, and the pass runs
     again until none is left (a moved approach can meet the line again where it bends) */
  out.crossings=[];var goodX=function(uu,w,sq){var A=J.archAt(uu);return !!A&&Math.abs(uu-A.c)<=A.half-(w/2+1.5)&&(sq==null||sq>.866);};   /* sq: the sine of the angle between the road and the line (square within 30 degrees) */
  var sqOf=function(a,b,M){var dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return Math.abs(dx/l*M.dir[1]-dz/l*M.dir[0]);};
  out.roads.forEach(function(r){for(var pass=0;pass<5;pass++){var P=r.pts,NP=[P[0]],moved=false;for(var i=0;i+1<P.length;i++){var a=P[i],b=P[i+1],hit=null;
    for(var m=0;m<mods.length&&!hit;m++){var M=mods[m],x=segX(a,b,M.a,M.b);if(x&&!goodX((x.u-.5)*L,r.w,sqOf(a,b,M)))hit={M:M,t:x.t,u:x.u};}
    if(hit){var M=hit.M,uu=(hit.u-.5)*L,k=Math.max(0,Math.min(J.arches-1,Math.floor((uu+L/2)/J.span))),cc=-L/2+(k+.5)*J.span;
     var X=[M.x+M.dir[0]*cc,M.z+M.dir[1]*cc],nrm=[-M.dir[1],M.dir[0]],sd=((a[0]-X[0])*nrm[0]+(a[1]-X[1])*nrm[1])<0?-1:1;
     NP.push([X[0]+nrm[0]*sd*24,X[1]+nrm[1]*sd*24],X,[X[0]-nrm[0]*sd*24,X[1]-nrm[1]*sd*24]);moved=true;}
    NP.push(b);}r.pts=NP;if(!moved)break;}
   /* the crossings that stand, for the checks */
   for(var i=0;i+1<r.pts.length;i++)for(var m=0;m<mods.length;m++){var M=mods[m],x=segX(r.pts[i],r.pts[i+1],M.a,M.b);if(x){var uu=(x.u-.5)*L;out.crossings.push({road:r.id,module:M.id,u:uu,x:M.x+M.dir[0]*uu,z:M.z+M.dir[1]*uu,sq:sqOf(r.pts[i],r.pts[i+1],M),good:goodX(uu,r.w,sqOf(r.pts[i],r.pts[i+1],M))});}}});
  function segX(a,b,c,d){var r=[b[0]-a[0],b[1]-a[1]],s=[d[0]-c[0],d[1]-c[1]],den=r[0]*s[1]-r[1]*s[0];if(Math.abs(den)<1e-9)return null;var t=((c[0]-a[0])*s[1]-(c[1]-a[1])*s[0])/den,v=((c[0]-a[0])*r[1]-(c[1]-a[1])*r[0])/den;return t>=0&&t<=1&&v>=0&&v<=1?{t:t,u:v}:null;}
  /* a road that still runs against a pier (a spoke laid nearly along the line, which no crossing can square) is not built: its cluster keeps its
     fields and loses its road */
  var pierBoxes=[];mods.forEach(function(M){for(var k=0;k<=J.arches;k++){var uu=-L/2+k*J.span;pierBoxes.push({x:M.x+M.dir[0]*uu,z:M.z+M.dir[1]*uu,c:M.c,s:M.s,rx:J.pier/2+.3,rz:J.depth/2+.3});}});
  out.droppedRoads=[];out.roads=out.roads.filter(function(r){for(var i=0;i+1<r.pts.length;i++){var a=r.pts[i],b=r.pts[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);for(var q=0;q<=l;q+=2){var x=a[0]+(b[0]-a[0])*q/l,z=a[1]+(b[1]-a[1])*q/l;
     for(var p=0;p<pierBoxes.length;p++){var B=pierBoxes[p];if(Math.abs(B.x-x)<40&&Math.abs(B.z-z)<40&&boxD(B,x,z)<r.w/2+1.5){out.droppedRoads.push(r.id);return false;}}}}return true;});
  out.crossings=out.crossings.filter(function(x){return out.droppedRoads.indexOf(x.road)<0;});
  /* the roads' segments on core/space, for the distance every later step asks */
  var RS=KSPACE.create({cell:120});out.roads.forEach(function(r){for(var i=0;i+1<r.pts.length;i++){var a=r.pts[i],b=r.pts[i+1],sg={a:a,b:b,w:r.w,id:r.id};RS.insert(sg,(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+10);}});
  var rq=[];var roadNear=function(x,z,reach){rq.length=0;RS.query(x,z,reach,rq);var d=1e9,w=0;for(var i=0;i<rq.length;i++){var e=segD(rq[i].a,rq[i].b,x,z).d-rq[i].w/2;if(e<d){d=e;w=rq[i].w;}}return d;};
  out.roadD=function(x,z){return roadNear(x,z,200);};
  /* a building's box clear of the roads (its edge 3 m off the carriageway), sampled round its outline */
  roadClash=function(T){for(var k=0;k<16;k++){var t=k/16*Math.PI*2,lx=Math.cos(t)*T.rx,lz=Math.sin(t)*T.rz,q=Math.max(Math.abs(Math.cos(t)),Math.abs(Math.sin(t)));lx/=q;lz/=q;lx=CL(lx,-T.rx,T.rx);lz=CL(lz,-T.rz,T.rz);
    var wx=T.x+lx*T.c+lz*T.s,wz=T.z-lx*T.s+lz*T.c;if(roadNear(wx,wz,T.padR+20)<3)return true;}return roadNear(T.x,T.z,T.padR+20)<T.padR*.3;};
  var place=function(T){if(Math.hypot(T.x,T.z)+T.padR>R-40){out.dropped.edge++;return null;}if(padClash(T,4)){out.dropped.pad++;return null;}if(roadClash(T)){out.dropped.road++;return null;}
   if(T.family!=='aqueduct'&&aqD(T.x,T.z)<Math.max(T.rx,T.rz)+12){out.dropped.aq++;return null;}if(slope(T.x,T.z)>.24){out.dropped.slope++;return null;}
   /* the plinth levels what falls under the box: no more than 6 m of it (a growing stack, which steps down its slope, 10 m) */
   var lo=1e9,hi=-1e9;for(var a=-1;a<=1;a+=.5)for(var b=-1;b<=1;b+=.5){var lx=a*(T.rx-margin),lz=b*(T.rz-margin),h=G(T.x+lx*T.c+lz*T.s,T.z-lx*T.s+lz*T.c);if(h<lo)lo=h;if(h>hi)hi=h;}
   if(hi-lo>(T.family==='stack'?10:6)){out.dropped.slope++;return null;}T.y=G(T.x,T.z);return put(T);};
  /* the hub's own buildings must not stand in its ring road: they were placed first; they are checked like the rest */
  CEN.forEach(function(c,ci){var x=c[0],z=c[1],g=grad(x,z),l=Math.hypot(g[0],g[1])||1,dn=[-g[0]/l,-g[1]/l],al=[-dn[1],dn[0]],kind=c[2]>.075?'stack':u(ci,1,31)<.62?'pods':'vaults',cl={id:'av.f.c'+ci,x:x,z:z,kind:kind,members:[]};out.clusters.push(cl);
   if(kind==='pods'){/* a small honeycomb: the centre and its ring, on one level */var A=honey(cl.id,x,z,1,1,2000+ci*10);if(A){cl.members=A.members;cl.y=A.y;cl.reach=A.reach;}}
   else if(kind==='vaults'){var nv=2+Math.floor(u(ci,3,31)*2),ya=Math.atan2(-al[1],al[0]);for(k=0;k<nv;k++){var o2=(k-(nv-1)/2)*52;T=place(mk('vault',x+dn[0]*o2,z+dn[1]*o2,ya,cl.id+'.v'+k,AV.FARM_CUTS,2000+ci*10+k));if(T)cl.members.push(T.id);}}
   else{/* stacks side by side along the contour, each facing down the slope (its frame +z downhill) */var ns=1+Math.floor(u(ci,4,31)*2),ys=Math.atan2(dn[0],dn[1]);for(k=0;k<ns;k++){o2=(k-(ns-1)/2)*84;T=place(mk('stack',x+al[0]*o2,z+al[1]*o2,ys,cl.id+'.s'+k,AV.FARM_CUTS,2000+ci*10+k));if(T)cl.members.push(T.id);}
    /* and a pod or two beside them */for(k=0;k<2;k++){var side=k?1:-1,px=x+al[0]*side*(ns*42+40),pz=z+al[1]*side*(ns*42+40);T=place(mk('pod',px,pz,0,cl.id+'.p'+k,AV.FARM_CUTS,2100+ci*10+k));if(T)cl.members.push(T.id);}}});
  // ---------------------------------------------------------------- 5 the pylon lines
  var linesAt=[[-.46,.08],[.5,-.06]];linesAt.forEach(function(LA,li){var x0=LA[0]*R,dirA=LA[1],d=[Math.sin(dirA),Math.cos(dirA)],list=[];
   for(var s=-R;s<=R;s+=280){var bx=x0+d[0]*s,bz=d[1]*s,got=null;var offs=[0,30,-30,60,-60,90,-90];for(var k=0;k<offs.length&&!got;k++){var x=bx+d[0]*offs[k],z=bz+d[1]*offs[k];if(Math.hypot(x,z)>R-60)continue;
     near.length=0;PADS.query(x,z,120,near);if(near.some(function(P){return boxD(P,x,z)<14;}))continue;if(roadNear(x,z,60)<6)continue;if(aqD(x,z)<14)continue;got=[x,z];}
    if(!got)continue;var h=u(li,Math.round(s),41),st=h<.68?'up':h<.82?'leaning':h<.94?'fallen':'stump';list.push({id:'av.f.py.'+li+'.'+list.length,x:got[0],z:got[1],y:G(got[0],got[1]),yaw:Math.atan2(d[0],d[1]),state:st,
     lean:st==='leaning'?(5+7*u(li,Math.round(s),42)):0,leanDir:u(li,Math.round(s),43)*Math.PI*2,fallDir:u(li,Math.round(s),44)*Math.PI*2});}
   out.pylons.push({id:'av.f.py.'+li,list:list,dir:d});});
  // ---------------------------------------------------------------- 6 the fields along the contour
  var crops=o.crops||[],th=Math.atan2(along[1],along[0]),ca=Math.cos(th),sa=Math.sin(th),FW=78,FD=54;
  var FX=KSPACE.create({cell:160});
  for(var i2=-40;i2<=40;i2++)for(var j2=-60;j2<=60;j2++){var lu=i2*(FW+6)+((j2&1)?FW/2:0),lv=j2*(FD+5),x=hub[0]+lu*ca-lv*sa,z=hub[1]+lu*sa+lv*ca;if(Math.hypot(x,z)>R-50||Math.hypot(x-hub[0],z-hub[1])<out.hub.ring+60)continue;
   if(u(i2+500,j2+500,51)>.82)continue;   /* a parcel in six left as the wild wood's: a hedge, a copse */
   /* the worked land lies round the buildings that worked it: within 420 m of a cluster or 650 m of the hub; past that the wood took it back */
   if(Math.hypot(x-hub[0],z-hub[1])>650&&!out.clusters.some(function(c){return Math.hypot(c.x-x,c.z-z)<420;}))continue;
   var okF=true;for(var a2=-1;a2<=1&&okF;a2++)for(var b2=-1;b2<=1&&okF;b2++){var qx=x+a2*FW/2*ca-b2*FD/2*sa,qz=z+a2*FW/2*sa+b2*FD/2*ca;near.length=0;PADS.query(qx,qz,60,near);if(near.some(function(P){return boxD(P,qx,qz)<4;}))okF=false;else if(roadNear(qx,qz,40)<2)okF=false;else if(aqD(qx,qz)<8)okF=false;}
   if(!okF||slope(x,z)>.3)continue;
   /* the crop: an orchard one parcel in three (a tree crop), else a field crop, from the list by hash */
   var trees=crops.filter(function(c){return c.form==='tree';}),plants=crops.filter(function(c){return c.form!=='tree';}),orch=trees.length&&u(i2+500,j2+500,52)<.34,list2=orch?trees:plants;if(!list2.length)continue;
   var cr=list2[Math.floor(u(i2+500,j2+500,53)*list2.length)],Fd={id:'av.f.fd.'+i2+'.'+j2,x:x,z:z,y:G(x,z),yaw:th,w:FW,d:FD,crop:cr.id,card:cr.card,form:cr.form,orchard:!!orch,seed:KRAND.hash(seed,i2+500,j2+500,54)};
   out.fields.push(Fd);FX.insert(Fd,x,z,Math.hypot(FW,FD)/2+2);}
  var fq=[];out.fieldAt=function(x,z){fq.length=0;FX.query(x,z,2,fq);for(var i=0;i<fq.length;i++){var F=fq[i],dx=x-F.x,dz=z-F.z,lu=dx*ca+dz*sa,lv=-dx*sa+dz*ca;if(Math.abs(lu)<=F.w/2&&Math.abs(lv)<=F.d/2)return F;}return null;};
  /* how deep inside its field a point is (0 at the edge, 1 from 8 m in): the ground's terraces and the thicket's rows fade at the hedges */
  out.fieldK=function(x,z){var F=out.fieldAt(x,z);if(!F)return 0;var dx=x-F.x,dz=z-F.z,lu=dx*ca+dz*sa,lv=-dx*sa+dz*ca;return S(0,8,Math.min(F.w/2-Math.abs(lu),F.d/2-Math.abs(lv)));};
  out.boxD=boxD;out.theta=th;out.slope=slope;
  return out;};
})();
