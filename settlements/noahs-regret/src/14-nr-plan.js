// ================================================================= THE PLAN: the ring, its decks, zones, rooms and lots ([G data])
// Every position the arcology owns is decided here, before anything is drawn: the drawing passes (4x) and the furnishing
// pass (70) read NR, never the other way round. No THREE, no DOM: this is what a port takes as data.
//
// THE HULLS. Noah's Regret is a CATAMARAN: two long hulls joined at the bow, the harbour basin between them, open to the
// sea at the stern. Its plan is one centreline curve (A along the bow-stern x axis, B across), fine at the bow (+x), the
// hulls' sides near straight and parallel, cut away at the stern (x = XS): the cut is the HARBOUR MOUTH, the full width of
// the basin. Positions along it are by ARC LENGTH t on the centreline: t = 0 at the stem, increasing along the STARBOARD
// hull (+z, the beach) to its stern at T1; negative along the PORT hull (-z, the open sea) to its stern at T0 = -T1.
// Across it, s is the offset from the centreline along the outward normal (+s outboard, the sea or the beach; -s inboard,
// the harbour basin). Everything is placed symmetrically by hull: a starboard t has its port twin at -t.
//
// THE SECTION (s, hull y):
//   pontoon   |s| <= 26, y 0 -> 9: the holds (a double-height hold with a mezzanine gallery at 4.8; flooded to the sea)
//   ledges    the pontoon's top outside the main block, y 9: the outer promenade (beach and sea) and the inner quay
//   main      |s| <= 20, decks D1..D4 at y 9, 12.6, 16.2, 19.8 (3.6 m floor to floor), the TOP deck at 23.4
//             cabins 11 <= |s| <= 18.4 (D3, D4: a glazed wall at 18.5 and a balcony to 20; D1, D2: a window wall at 20)
//             corridors 8.5 <= |s| <= 11; the service core |s| <= 8.5 (solid: shafts and tanks), pierced by stair cores
//   top       parks, promenades and the Ancient buildings, |s| <= 15 for lots, parapets at 20
// Inhabited: D3 and D4 (cabins, the ship's rooms, the crew messes and their galleys, the greenhouse, the atrium galleries,
// the bridge, the grand dining room). D1 and D2 are stripped and empty, but for the twin ENGINE ROOMS at the stern of each
// hull, silent a thousand years; the holds are half full of the sea.
const NR=(function(){
 const N={ready:false};
 /* the centreline as a curve of an angle th: x = A cos th, z = +-B sqrt(1 - |cos th|^m) (1 - KB cos+^3). m is MB toward the
    bow (the tightest bend is the stem's, about 36 m on the centreline: the inboard skin at s = -26 stays a curve) and MS
    toward the stern, high, so the hulls run straight and parallel until the cut at XS (the stern turn is cut away). */
 const A=262,B=118,MB=2.4,MS=20,KB=.25,XS=-205;N.A=A;N.B=B;N.XS=XS;
 function cpt(th){const c=Math.cos(th),sn=Math.sin(th),m=c>0?MB:MS;const w=Math.sqrt(Math.max(0,1-Math.pow(Math.abs(c),m)))*(1-KB*Math.pow(Math.max(0,c),3));return [A*c,(sn<0?-1:1)*B*w];}
 N.curve=cpt;
 /* a table of NT samples, even in th: positions, arc length, outward normals, radius of curvature */
 const NT=8192,PX=new Float64Array(NT+1),PZ=new Float64Array(NT+1),TL=new Float64Array(NT+1),NX=new Float64Array(NT+1),NZ=new Float64Array(NT+1),RH=new Float64Array(NT+1);
 for(let i=0;i<=NT;i++){const p=cpt(i/NT*TAU);PX[i]=p[0];PZ[i]=p[1];if(i)TL[i]=TL[i-1]+Math.hypot(PX[i]-PX[i-1],PZ[i]-PZ[i-1]);}
 const P=TL[NT];N.P=P;
 const wrap=i=>((i%NT)+NT)%NT;
 for(let i=0;i<NT;i++){const a=wrap(i-1),b=wrap(i+1),dx=PX[b]-PX[a],dz=PZ[b]-PZ[a],l=Math.hypot(dx,dz);NX[i]=dz/l;NZ[i]=-dx/l;}
 NX[NT]=NX[0];NZ[NT]=NZ[0];
 /* the radius of curvature from the turning of the normal over 8 samples either side (the curve is convex everywhere) */
 for(let i=0;i<NT;i++){const a=wrap(i-8),b=wrap(i+8);let d=Math.atan2(NZ[b],NX[b])-Math.atan2(NZ[a],NX[a]);d=((d+PI)%TAU+TAU)%TAU-PI;
  const ds=b>a?TL[b]-TL[a]:P-TL[a]+TL[b];RH[i]=Math.min(1e5,ds/Math.max(1e-9,d));}
 RH[NT]=RH[0];
 /* the sample interval holding t, and the fraction across it */
 function seg(t){t=((t%P)+P)%P;let lo=0,hi=NT;while(hi-lo>1){const m=(lo+hi)>>1;if(TL[m]<=t)lo=m;else hi=m;}return [lo,(t-TL[lo])/Math.max(1e-9,TL[lo+1]-TL[lo])];}
 function nrmAt(t){const [i,f]=seg(t),x=NX[i]+(NX[i+1]-NX[i])*f,z=NZ[i]+(NZ[i+1]-NZ[i])*f,l=Math.hypot(x,z);return [x/l,z/l];}
 /* the point at (t, s), the outward normal and the tangent (direction of increasing t) at t, in the hull frame's x, z */
 N.at=function(t,s){const [i,f]=seg(t),n=nrmAt(t);return [PX[i]+(PX[i+1]-PX[i])*f+s*n[0],PZ[i]+(PZ[i+1]-PZ[i])*f+s*n[1]];};
 N.nrm=nrmAt;
 N.tan=function(t){const n=nrmAt(t);return [-n[1],n[0]];};   // the normal turned +90 deg
 /* the radius of curvature of the centreline at t */
 N.rho=function(t){const [i,f]=seg(t);return RH[i]+(RH[i+1]-RH[i])*f;};
 /* a heading (three.js rotation.y) whose local +z points along (dx, dz) */
 N.ryOf=function(dx,dz){return Math.atan2(dx,dz);};
 /* the nearest centreline point to hull (x, z): {t, s, inRing} (s > 0 outboard): a coarse pass over every 32nd sample,
    a fine pass round the best, then the foot on that sample's tangent */
 N.ringST=function(x,z){let bi=0,bd=1e18;
  for(let i=0;i<NT;i+=32){const dx=x-PX[i],dz=z-PZ[i],d=dx*dx+dz*dz;if(d<bd){bd=d;bi=i;}}
  const c=bi;for(let k=-40;k<=40;k++){const i=wrap(c+k),dx=x-PX[i],dz=z-PZ[i],d=dx*dx+dz*dz;if(d<bd){bd=d;bi=i;}}
  const dx=x-PX[bi],dz=z-PZ[bi],u=dx*(-NZ[bi])+dz*NX[bi],s=dx*NX[bi]+dz*NZ[bi];
  const t=TL[bi]+u;const tt=((t-N.T0)%P+P)%P+N.T0;return {t:tt,s,inRing:tt<=N.T1};};
 // ---------------------------------------------------------------- levels and widths
 const L={KEEL:0,HOLD:.6,MEZZ:4.8,D:[9.0,12.6,16.2,19.8],TOP:23.4,SLAB:.35,DH:3.6,PARAPET:1.15};
 L.CLEAR=L.DH-L.SLAB;   // 3.25 m from a deck to the slab above
 N.L=L;
 const W={PONT:26,SKIN:25.3,MAIN:20,BALC:20,GLASS:18.5,CAB:11,COR:8.5,MEZZ:19.2,LOT:15,PART:.16,WALL:.2};
 N.W=W;
 // ---------------------------------------------------------------- the ring's extent and the mouth
 /* the hulls' sterns: T1 where the starboard centreline reaches x = XS; the port hull is its mirror */
 {let i=0;while(i<NT/2&&PX[i]>XS)i++;N.T1=TL[i-1]+(TL[i]-TL[i-1])*(PX[i-1]-XS)/(PX[i-1]-PX[i]);}
 N.T0=-N.T1;
 const PH=P/2;N.PH=PH;N.TM=PH;                     /* the mouth's middle (on the cut-away stern of the curve) */
 {const a=N.at(N.T1,-W.PONT),b=N.at(N.T0,-W.PONT);N.MOUTH=Math.hypot(a[0]-b[0],a[1]-b[1]);}
 /* the cabins' frames: every DT from T0 + 6 (rooms snap their ends to them) */
 const DT=4.2;N.DT=DT;
 N.frame=t=>N.T0+6+Math.round((t-N.T0-6)/DT)*DT;
 /* the middles of the hulls' runs: the atrium (starboard) and the grand dining room (port) */
 const TA=245;N.TA=TA;
 // ---------------------------------------------------------------- ZONES: the public rooms and the machinery
 // decks: indices into L.D (0 = D1). s0..s1: the band across the ring a zone takes on those decks.
 N.ZONES=[
  {id:'atrium',kind:'atrium',name:'The grand atrium',t0:TA-22,t1:TA+22,decks:[0,1,2,3],s0:-W.MAIN,s1:W.MAIN,tc:TA},
  {id:'dining',kind:'dining',name:'The grand dining room',t0:-TA-26,t1:-TA+26,decks:[2,3],s0:-W.MAIN,s1:W.MAIN,tc:-TA},
  /* the twin engine rooms, one at the stern of each hull (aft: the direction of the stern along t) */
  {id:'engine-s',kind:'engine',name:'The starboard engine room',t0:N.T1-66,t1:N.T1-6,decks:[0,1],s0:-W.MAIN,s1:W.MAIN,tc:N.T1-36,aft:1},
  {id:'engine-p',kind:'engine',name:'The port engine room',t0:N.T0+6,t1:N.T0+66,decks:[0,1],s0:-W.MAIN,s1:W.MAIN,tc:N.T0+36,aft:-1},
  /* the crew messes (D3, the whole width: the corridors run through them), a galley beside each (N.ROOMS) */
  {id:'mess-s',kind:'mess',name:'The starboard crew mess',t0:N.frame(98),t1:N.frame(128),decks:[2],s0:-W.MAIN,s1:W.MAIN},
  {id:'mess-p',kind:'mess',name:'The port crew mess',t0:N.frame(-128),t1:N.frame(-98),decks:[2],s0:-W.MAIN,s1:W.MAIN},
  /* the greenhouse (D4, the whole width) under a glass roof that stands on the top deck */
  {id:'greenhouse',kind:'greenhouse',name:'The greenhouse',t0:N.frame(-130),t1:N.frame(-96),decks:[3],s0:-W.MAIN,s1:W.MAIN,roof:'glass'}];
 for(const Z of N.ZONES)if(Z.tc==null)Z.tc=(Z.t0+Z.t1)/2;
 N.zone=id=>N.ZONES.find(z=>z.id===id);
 /* does a zone take the band [s0, s1] at t in [t0, t1] on deck d? */
 N.blocked=function(d,t0,t1,s0,s1){for(const Z of N.ZONES.concat(N.ROOMS)){if(Z.decks.indexOf(d)<0)continue;if(t1<=Z.t0||t0>=Z.t1)continue;if(s1<=Z.s0||s0>=Z.s1)continue;return Z;}return null;};
 // ---------------------------------------------------------------- the SHIP'S ROOMS: in the cabin band of one side
 // What a great ship carries besides berths, each taking a run of cabins between two frames on D3 or D4, on one side
 // (side +1 outboard, -1 inboard): its corridor wall keeps a door, its glass wall and balcony stay. kind is the interiors
 // kit's room kind (70-nr-interiors.js adds the ship's kinds to its programmes). {id, kind, name, deck, side, t0, t1, s0, s1,
 // decks, door (the door's t), culture, wealth}
 N.ROOMS=[];
 {const room=(id,kind,name,deck,side,ta,tb,culture,wealth)=>{const t0=N.frame(Math.min(ta,tb)),t1=N.frame(Math.max(ta,tb));
   const s0=side>0?W.CAB+.15:-(W.GLASS-.1),s1=side>0?W.GLASS-.1:-(W.CAB+.15);
   N.ROOMS.push({id,kind,name,deck,decks:[deck],side,t0,t1,tc:(t0+t1)/2,s0,s1,door:t0+Math.min(2.4,(t1-t0)/2),culture,wealth});};
  /* D4: the officers' end, near the bridge; the chapel, the sail loft, a sick bay */
  room('chartroom','chartroom',"The chart room",3,-1,20,32,'post-apoc',.55);   /* below the bridge house */
  room('wardroom','mess',"The officers' wardroom",3,1,22,42,'post-apoc',.6);
  room('strongroom','strongroom',"The purser's strongroom",3,-1,-34,-22,'post-apoc',.7);
  room('chapel','shrine',"The chapel",3,1,300,314,'post-apoc',.5);
  room('sailloft','sailloft',"The sail loft",3,1,-404,-372,'scrap',.3);
  room('sickbay-p','sickbay',"The port sick bay",3,-1,-196,-176,'post-apoc',.4);
  /* D3: the working rooms */
  room('galley-s','kitchen',"The starboard galley",2,-1,128,142,'scrap',.3);
  room('galley-p','kitchen',"The port galley",2,-1,-142,-128,'scrap',.3);
  room('sickbay-s','sickbay',"The starboard sick bay",2,1,170,190,'post-apoc',.4);
  room('armoury','armoury',"The armoury",2,-1,300,316,'scrap',.35);
  room('carpenter','workshop',"The carpenter's shop",2,1,360,384,'scrap',.3);
  room('brig','brig',"The brig",2,-1,380,392,'scrap',.2);
  room('bosun','store',"The bosun's store",2,1,-62,-46,'scrap',.3);
  room('laundry','laundry',"The laundry",2,-1,-300,-284,'scrap',.25);
  room('cooper','workshop',"The cooper's shop",2,1,-360,-344,'scrap',.3);}
 N.room=id=>N.ROOMS.find(r=>r.id===id);
 // ---------------------------------------------------------------- STAIR CORES: switchback stairs in the service core, D1 -> TOP
 // Each takes t in [t-5, t+5] of the core (|s| <= 6) and opens onto both corridors on every deck; a kiosk covers it on top.
 N.CORES=[-425,-330,-150,-70,70,150,330,425].map((t,i)=>({id:'core'+i,t,t0:t-5,t1:t+5,down:Math.abs(t)===425}));
 // ---------------------------------------------------------------- CABINS: frames every DT along the centreline
 // A cabin is the band between two frames, 11.1 <= |s| <= 18.4 on D3-D4 (behind the glass, a balcony beyond) or 19.9 on
 // D1-D2, on either side of the ring. Partitions stand on the frames (radial lines), so a cabin is a slight trapezoid:
 // wider outboard on the outer side. CLASS: the widest of the template widths that fits its narrow end (70-nr-interiors.js
 // furnishes one template per class and door side and stands it in every cabin of that class, as data per cabin).
 N.CABIN_CLASSES=[3.2,3.6,4.0,4.4];
 N.cabins=[];
 {const ks=Math.ceil((N.T1-N.T0-12)/DT);let k=0;
  for(let i=0;i<ks;i++){const t0=N.T0+6+i*DT,t1=t0+DT;if(t1>N.T1-6)break;
   for(let d=0;d<4;d++)for(const side of [1,-1]){
    const sIn=side*(W.CAB+W.WALL/2),sOut=side*(d>=2?W.GLASS-W.WALL/2+.05:W.MAIN-W.WALL/2);
    if(N.blocked(d,t0,t1,Math.min(sIn,sOut),Math.max(sIn,sOut)))continue;
    /* the widths at the two ends (along the tangent, partitions .16 thick taken off) */
    const rho=N.rho((t0+t1)/2),wAt=s=>DT*(1+s/rho)-W.PART;
    const wMin=Math.min(wAt(sIn),wAt(sOut));
    let cls=-1;for(let c=N.CABIN_CLASSES.length-1;c>=0;c--)if(N.CABIN_CLASSES[c]<=wMin-.04){cls=c;break;}
    const id='D'+(d+1)+(side>0?'o':'i')+'-'+i;
    const doorEnd=(i%2===0)?0:1;    /* the corridor door near frame t0 (0) or t1 (1) */
    N.cabins.push({id,deck:d,side,i,t0,t1,tm:(t0+t1)/2,sIn,sOut,depth:Math.abs(sOut-sIn),wMin,cls,doorEnd,
     inhabited:d>=2,kind:null,wealth:null});
    k++;}}}
 /* the inhabited cabins' use, by a hash of the cabin (deterministic): officers on D4, crew below. Pirates sleep where
    they like: most cabins are a bunk and a chest, some are crowded bunk rooms (crew), some are loot stores. */
 const hsh=(a,b,c)=>{const s=Math.sin(a*12.9898+b*78.233+c*37.719)*43758.5453;return s-Math.floor(s);};
 for(const C of N.cabins){if(!C.inhabited)continue;const r=hsh(C.i,C.deck,C.side);
  if(C.deck===3){C.kind=r<.72?'bedroom':r<.86?'crew':'store';C.wealth=C.kind==='bedroom'?.55:.35;}
  else{C.kind=r<.5?'bedroom':r<.85?'crew':'store';C.wealth=C.kind==='bedroom'?.32:.25;}
  if(C.cls<0)C.kind='store';}     /* a cabin too narrow for any template is a store (it holds what fits) */
 // ---------------------------------------------------------------- the top deck: building LOTS, parks, kiosks
 // A lot: {key (the deck building def), t (centre), face: 'in' (front +z toward the harbour) | 'out' | 'fwd' (along the ring)}.
 // The defs' footprints along t: lab 44, aptA 36, aptB 20, offA 30 (the builders' declared w, 50-58).
 N.LOTS=[
  /* Ruephus's headquarters stands at the head of the forecourt plaza (N.PLAZA), on the axis from the bridge house down the
     liner mole, its door toward the harbour: placed by x, z, not t */
  {id:'lot-hq',key:'nr-anc-reliquary',t:null,x:120,z:0,ry:-PI/2,y:L.D[0],use:'hq',plaza:true},
  {id:'lot-b3',key:'nr-anc-apt-drum',t:444,face:'in',use:'barracks'},
  {id:'lot-a2',key:'nr-anc-apt-ribbon',t:116,face:'out',use:'barracks'},
  {id:'lot-o1',key:'nr-anc-office-lens',t:190,face:'in',use:'barracks'},
  {id:'lot-b2',key:'nr-anc-apt-drum',t:296,face:'in',use:'barracks'},
  {id:'lot-a3',key:'nr-anc-apt-ribbon',t:378,face:'in',use:'barracks'},
  {id:'lot-a1',key:'nr-anc-apt-ribbon',t:-190,face:'in',use:'barracks'},
  {id:'lot-b1',key:'nr-anc-apt-drum',t:-296,face:'in',use:'barracks'},
  {id:'lot-o2',key:'nr-anc-office-lens',t:-378,face:'in',use:'mess'}];
 /* face: 'in' the front (+z) toward the harbour, 'out' toward the sea or the beach, 'fwd' along the ring (increasing t) */
 for(const Lt of N.LOTS){if(Lt.plaza)continue;const p=N.at(Lt.t,0),n=Lt.face==='fwd'?N.tan(Lt.t):N.nrm(Lt.t),dz=Lt.face==='in'?-1:1;Lt.x=p[0];Lt.z=p[1];Lt.ry=Math.atan2(n[0]*dz,n[1]*dz);Lt.y=L.TOP;}
 /* parks: lawn beds between the lots; over the grand dining room the garden with its dry fountain (garden: true) */
 N.PARKS=[{id:'park-a',t0:133,t1:145},{id:'park-b',t0:-145,t1:-133},{id:'park-c',t0:312,t1:324},{id:'park-d',t0:-324,t1:-312},
  {id:'park-e',t0:401,t1:418},{id:'park-f',t0:-418,t1:-401},
  {id:'park-i',t0:-222,t1:-209},{id:'park-garden',t0:-TA-22,t1:-TA+22,garden:true}];
 /* the twin funnels of each hull, over its engine room */
 N.FUNNELS=[N.T1-46,N.T1-22,N.T0+22,N.T0+46];
 // ---------------------------------------------------------------- the ways down to the beach and to the water
 // Pirate-built timber: switchback TOWERS from the outer ledge (D1 level) to the top deck against the starboard hull, and
 // flights of STEPS from the ledge down to the dune; FLOATS (timber pontoons at the water) off the inner quay for boats.
 N.TOWERS=[{t:200},{t:350},{t:452}];
 N.STEPS=[{t:175},{t:280},{t:320},{t:395},{t:470}];
 N.FLOATS=[{t:-440},{t:-300},{t:300},{t:440}];
 // ---------------------------------------------------------------- the FORECASTLE: the bow's sheer
 // Round the bow the outer skin rises above the promenade to a bulwark, and the promenade inside it climbs as a deck from
 // D1 (|t| = FORE.t) to the D3 floor at the stem: a ship's sheer line. foreY(t): that deck's height (hull y) at t.
 N.FORE={t:64,y0:L.D[0],y1:L.D[2],bulwark:1.1};
 N.foreY=function(t){const u=Math.abs(t)/N.FORE.t;return u>=1?L.D[0]:L.D[0]+(N.FORE.y1-L.D[0])*Math.pow(1-u,1.6);};
 // ---------------------------------------------------------------- the FORE: the forecourt plaza, the terraces, the bridge house
 // The forward third of the basin is decked over at quay level (D1) between the hulls' inner skins: the FORECOURT PLAZA,
 // its aft edge a straight quay at x = XP where the liner mole starts. At its head the inner bow is built up solid to the top
 // deck in three TERRACES (the fore block) whose curved faces step back from the plaza, a grand stair up their middle; on
 // the bow above them stands the BRIDGE HOUSE, four storeys in the shape of the bow itself, each set in from the one below,
 // and on top the BRIDGE with its wings and mast. Polygons are hull (x, z), anticlockwise in (x, z) for prism.
 const ccw=P=>{const a=P.reduce((s,p,i)=>{const q=P[(i+1)%P.length];return s+p[0]*q[1]-q[0]*p[1];},0);return a<0?P.slice().reverse():P;};
 N.inPoly=function(Q,x,z){let inside=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;};
 const tAtX=(X,s)=>{let lo=0,hi=N.T1;for(let k=0;k<50;k++){const m=(lo+hi)/2;if(N.at(m,s)[0]>X)lo=m;else hi=m;}return lo;};
 N.tAtX=tAtX;
 {const XP=90,tP=tAtX(XP,-W.PONT),poly=[];
  for(let t=-tP;t<=tP+1e-6;t+=Math.min(2,(2*tP)/200))poly.push(N.at(t,-W.PONT));
  poly.push(N.at(tP,-W.PONT));
  N.PLAZA={XP,tP,poly:ccw(poly),y:L.D[0],name:'the forecourt plaza'};}
 /* the terraces: a face at X (its apex BULGE m further aft on the centreline), up to y1; the inner bow from the main block's
    inner wall (s = -20.3) forward of it */
 {const BULGE=10,tiers=[[190,L.D[0],L.D[2]],[196,L.D[2],L.D[3]],[202,L.D[3],L.TOP]];
  N.TIERS=tiers.map(([X,y0,y1],k)=>{const s=-(W.MAIN+.3),tk=tAtX(X,s),pts=[];
   for(let t=-tk;t<=tk+1e-6;t+=Math.min(1.5,2*tk/120))pts.push(N.at(t,s));
   const zk=N.at(tk,s)[1],face=[];for(let i=1;i<24;i++){const z=lerp(zk,-zk,i/24);face.push([X-BULGE*(1-(z/zk)*(z/zk)),z]);}
   return {k,X,apex:X-BULGE,y0,y1,zk,tk,face:[N.at(tk,s)].concat(face,[N.at(-tk,s)]),poly:ccw(pts.concat(face))};});
  N.FORE_STAIR={x0:N.PLAZA.XP+78,w:10,flights:N.TIERS.map(T=>({y0:T.y0,y1:T.y1,x1:T.apex}))};
  /* the inboard cabins at the bow whose glass now faces the terraces' solid lose their light: windowless stores */
  for(const C of N.cabins){if(!C.inhabited||C.side>0)continue;const p=N.at(C.tm,C.sOut+C.side*2.5),T=N.TIERS.find(T=>T.y0<=L.D[C.deck]+.1&&L.D[C.deck]<T.y1-.1);
   if(T&&N.inPoly(T.poly,p[0],p[1])){C.kind='store';C.blind=true;}}}
 /* the bridge house: storey k a scaled copy of the bow's plan (fine forward, round aft), centre xc, half-length a, half-
    width b; the bridge on top, its wings across */
 {const plan=(xc,a,b,n)=>{const P=[];for(let i=0;i<n;i++){const th=i/n*TAU,c=Math.cos(th),sn=Math.sin(th),m=c>0?MB:2.2;
    const w=Math.sqrt(Math.max(0,1-Math.pow(Math.abs(c),m)))*(1-KB*Math.pow(Math.max(0,c),3));P.push([xc+a*c,(sn<0?-1:1)*b*w]);}return ccw(P);};
  const st=[];for(let k=0;k<4;k++){const y0=L.TOP+k*L.DH,xc=237.5+1.6*k,a=32.5-3.6*k,b=46-6.5*k;st.push({k,y0,y1:y0+L.DH,xc,a,b,poly:plan(xc,a,b,96)});}
  const yb=L.TOP+4*L.DH,br={y0:yb,y1:yb+3.9,xc:246,a:17,b:21,poly:plan(246,17,21,72),wings:{x:252,z:31,d:5.5}};
  N.BRIDGEHOUSE={storeys:st,bridge:br,mast:{x:243,y:br.y1,h:16},name:'the bridge house'};}
 /* the bridge house's spiral stair: from the top deck through every storey to the bridge, about (x, 0) */
 N.BRIDGEHOUSE.stair={x:240,z:0,r:3.2,hole:3.6,y0:L.TOP,y1:N.BRIDGEHOUSE.bridge.y0};
 /* point tests (hull x, z): in a polygon; the floors of the fore under a point (hull y) */
 /* the floors of a rounded stern under hull (x, z) (40-nr-hull.js nrStern: the pontoon's deck to its rim, D2 inside the
    shell, the D3 terrace to 20, the D4 terrace to 17.5, the top deck to 15) */
 N.sternFloors=function(x,z){const F=[];for(const [t,dir] of [[N.T1,1],[N.T0,-1]]){const c=N.at(t,0),T=N.tan(t),dx=x-c[0],dz=z-c[1];
   if((dx*T[0]+dz*T[1])*dir<=0)continue;const r=Math.hypot(dx,dz);if(r>W.PONT+.7)continue;F.push(L.D[0]);
   if(r<W.MAIN)F.push(L.D[1],L.D[2]);if(r<17.5)F.push(L.D[3]);if(r<15)F.push(L.TOP);}return F;};
 N.foreFloors=function(x,z){const F=[];if(N.inPoly(N.PLAZA.poly,x,z)){let top=L.D[0];for(const T of N.TIERS)if(N.inPoly(T.poly,x,z))top=T.y1;F.push(top);}
  /* the bridge house's storeys are hollow: each one's floor, and its roof (the next one's floor, or a terrace) */
  const B=N.BRIDGEHOUSE;for(const S of B.storeys)if(N.inPoly(S.poly,x,z))F.push(S.y0,S.y1);
  if(N.inPoly(B.bridge.poly,x,z))F.push(B.bridge.y0);return F;};
 // ---------------------------------------------------------------- the PIERS the Ancients built in (drawn by 41-nr-piers.js)
 // Every pier's deck is level with the quays (D1, hull y 9). kind 'mole': the liner pier, a pontoon down the basin's long
 // axis from the bow's inner quay toward the open stern, a berth either side. 'finger': an open deck on columns off a hull's
 // inner quay, for smaller craft. {id, kind, name, t, side (+1 off the outer skin, -1 off the inner), o: the root's centre [x, z], d: the
 // unit direction along it, len, w, poly: the deck's outline [[x, z] ...] (its root follows the skin's curve)}
 N.PIERS=[];
 {const pier=(id,kind,name,t,side,len,w,splay)=>{const n=N.nrm(t),T=N.tan(t),ca=Math.cos(splay||0),sa=Math.sin(splay||0);
   const d=[side*(n[0]*ca+T[0]*sa),side*(n[1]*ca+T[1]*sa)],q=[-d[1],d[0]],o=N.at(t,side*W.PONT);
   /* the root: along the skin between the two corners' feet; then the sides, and a round head */
   const ta=N.ringST(o[0]+q[0]*w/2,o[1]+q[1]*w/2).t,tb=N.ringST(o[0]-q[0]*w/2,o[1]-q[1]*w/2).t,poly=[];
   const t0=Math.min(ta,tb),t1=Math.max(ta,tb);for(let k=0;k<=6;k++)poly.push(N.at(lerp(t0,t1,k/6),side*W.PONT));
   if(ta>tb)poly.reverse();   /* now from the +q corner to the -q corner */
   const L2=len-w/2,c=[o[0]+d[0]*L2,o[1]+d[1]*L2];
   for(let k=0;k<=12;k++){const a=-PI/2+k/12*PI;poly.push([c[0]+(d[0]*Math.cos(a)+q[0]*Math.sin(a))*w/2,c[1]+(d[1]*Math.cos(a)+q[1]*Math.sin(a))*w/2]);}
   N.PIERS.push({id,kind,name,t,side,o,d,q,len,w,poly,head:c});};
  for(const [i,t] of [-380,-240,240,380].entries())pier('pier-finger'+i,'finger','a finger pier',t,-1,34,7,0);
  /* the liner mole: from the middle of the plaza's quay (N.PLAZA, below) toward the open stern, its root square to it */
  {const w=18,len=150,o=[N.PLAZA.XP,0],d=[-1,0],q=[-d[1],d[0]],L2=len-w/2,c=[o[0]+d[0]*L2,o[1]+d[1]*L2];
   const poly=[[o[0]+q[0]*w/2,o[1]+q[1]*w/2],[o[0]-q[0]*w/2,o[1]-q[1]*w/2]];
   for(let k=0;k<=12;k++){const a=-PI/2+k/12*PI;poly.push([c[0]+(d[0]*Math.cos(a)+q[0]*Math.sin(a))*w/2,c[1]+(d[1]*Math.cos(a)+q[1]*Math.sin(a))*w/2]);}
   N.PIERS.push({id:'pier-mole',kind:'mole',name:'the liner mole',t:null,side:-1,o,d,q,len,w,poly,head:c});}}
 /* is hull (x, z) on a pier's deck? (even-odd test on its outline) */
 N.pierAt=function(x,z){for(const Pr of N.PIERS){const Q=Pr.poly;let inside=false;
   for(let i=0,j=Q.length-1;i<Q.length;j=i++){const a=Q[i],b=Q[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}
   if(inside)return Pr;}return null;};
 /* the hulls' sterns are half-rounds the pontoon's width beyond each end (40-nr-hull.js nrStern); the beacons on their
    inboard quarters mark the harbour mouth */
 N.BEACONS=[[N.T1,1],[N.T0,-1]].map(([t,dir])=>{const p=N.at(t+dir*4,-(W.PONT-3));return {x:p[0],z:p[1],t,dir};});
 /* the atrium: its void, the galleries round it, the grand stair (four flights: D1->D2 centre, D2->D3 twin, D3->D4 centre,
    D4->TOP twin) and the descent to the hold mezzanine. tau = t - (the atrium's centre). */
 N.ATRIUM={tc:TA,half:22,voidT:18,voidS:14,galleryS:[14,20],bridgeT:[6,9],flightT:6,centreS:4,twinS:[9,13],holdStair:{tau0:-17,tau1:-9,s:3}};
 N.ready=true;
 return N;})();
