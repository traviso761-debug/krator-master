// prefix: nr
// ================================================================= THE DECKS: corridors, cabins, the service core, the stair cores
// Per deck D1..D4 (NR.L.D), in the hull frame: the corridor walls (|s| = 8.5 the core side, 11 the cabin side, a door per
// cabin), the partitions on the frames, the cabins' glazing on D3-D4 (|s| = 18.5, a balcony beyond, its divider and the
// white ribbon of 40-nr-hull.js), the service core between the corridors (dark shafts and tanks, solid in the cut), the
// stair cores (a switchback of two 1.8 m flights per deck in a hall across the core, doors onto both corridors, a kiosk on
// the top deck). D1 and D2 are stripped: partitions stand, the doors are gone, the cabins are empty. Zones (the atrium,
// the bridge, the dining room, the engine rooms, the crew messes, the greenhouse) draw themselves (44-46); the ship's rooms
// (NR.ROOMS) are runs of cabin band with a door, their partitions on the frames, drawn here.
/* the scale of a length at offset s from the centreline: a metre of centreline t is (1 + s/rho) metres there */
function nrK(t,s){return 1+s/NR.rho(t);}
/* the t ranges a deck's band [s0, s1] loses to zones */
function nrZoneCuts(d,s0,s1){return NR.ZONES.filter(Z=>Z.decks.indexOf(d)>=0&&s1>Z.s0&&s0<Z.s1).map(Z=>({t0:Z.t0,t1:Z.t1,y1:-1e9}));}
/* a wall along the ring whose openings include gaps (y1 = -1e9: no lintel) */
function nrWallGaps(mk,s,th,y0,y1,col,open,gaps){const G=gaps.slice().sort((a,b)=>a.t0-b.t0);let c=NR.T0;
 for(const g of G){if(g.t0>c)nrWallT(mk,c,g.t0,s,th,y0,y1,col,open);c=Math.max(c,g.t1);}if(c<NR.T1)nrWallT(mk,c,NR.T1,s,th,y0,y1,col,open);}
/* a cabin's corridor door, as a t range on the cabin wall: wT/2 - 0.75 m from the cabin's middle line toward its doorEnd
   frame (wT its template width, 70-nr-interiors.js: the template room has its door at the same place) */
function nrCabinDoor(C){const s=C.sIn,k=nrK(C.tm,s),hw=.45/k;const tc=C.tm+(C.doorEnd===0?-1:1)*(nrCabinW(C)/2-.75)/k;return {t0:tc-hw,t1:tc+hw,tc,s,y1:2.1};}
/* switchback flights in a stair core at t = tc from y0 to y1: flight A outboard (+s) rising toward +t to a landing, flight B
   inboard rising back toward -t; the arrival landing at y1 (t in [tc-3.5, tc-1.4]) when `land` */
function nrFlights(tc,y0,y1,land,col){const R=y1-y0,h=R/2,n=Math.max(8,Math.round(h/.18)),rise=h/n,run=2.8,tr=run/n;
 for(const [s0,s1,ya,dir] of [[.3,5.7,y0,1],[-5.7,-.3,y0+h,-1]]){
  for(let i=0;i<n;i++){const ta=dir>0?tc-run/2+i*tr:tc+run/2-(i+1)*tr;nrBand('conc',ta,ta+tr,s0,s1,ya+i*rise,ya+(i+1)*rise,col);}
  /* the soffit and the outer stringer */
  const a0=nrP(dir>0?tc-run/2:tc+run/2,s0,ya),a1=nrP(dir>0?tc+run/2:tc-run/2,s0,ya+h);
  beam('paint',[a0[0],a0[1]+.5,a0[2]],[a1[0],a1[1]+.5,a1[2]],.08,hc(0x5a6a72),false,0,1.0);}
 nrBand('conc',tc+run/2,tc+3.4,-5.7,5.7,y0+h-.2,y0+h,col);                     // the half landing
 if(land)nrBand('conc',tc-3.5,tc-run/2,-6,6,y1-.2,y1,col);                     // the arrival landing at the next deck
 nrBand('conc',tc-run/2,tc+run/2,-.3,.3,y0,y1,P('conc'),'oitse');               // the spine wall between the flights
 /* the handrails over the open side of each flight */
 for(const s of [5.6,-5.6]){const a=nrP(tc-run/2,s,y0+(s>0?0:h)+.95),b=nrP(tc+run/2,s,y0+(s>0?h:0)+.95);beam('paint',a,b,.05,hc(0x5a6a72),true,6);}}
function nrDecks(){const L=NR.L,W=NR.W;reseed(4200);
 for(let d=0;d<4;d++){const y=L.D[d],top=y+L.CLEAR,stripped=d<2;
  /* --- the service core: dark shafts and tanks, broken at the stair cores and the zones */
  {const gaps=nrZoneCuts(d,-W.COR,W.COR).concat(NR.CORES.map(C=>({t0:C.t-3.7,t1:C.t+3.7})));
   const B=d===3?NR.zone('bridge'):null;
   gaps.sort((a,b)=>a.t0-b.t0);let c=NR.T0+.3;
   const fill=(a,b)=>{if(b-a<.5)return;nrBand('dark',a,b,-W.COR+.12,W.COR-.12,y+.03,top-.02,hc(0x34363a),'tbse');};
   for(const g of gaps){if(g.t0>c)fill(c,g.t0);c=Math.max(c,g.t1);}if(NR.T1-.3>c)fill(c,NR.T1-.3);
   if(B)nrBand('dark',B.t0,B.t1,-W.COR+.12,B.s0-.12,y+.03,top-.02,hc(0x34363a),'tbse');}
  /* --- floor finishes on the inhabited decks: boards in the cabins, tiles in the corridors (D1-D2 are bare concrete) */
  if(!stripped)for(const side of [1,-1]){const cuts=nrZoneCuts(d,-W.MAIN,W.MAIN).concat(NR.CORES.map(C=>({t0:C.t-3.6,t1:C.t+3.6,cor:1}))).sort((a,b)=>a.t0-b.t0);
   const lay=(a,b)=>{if(b-a<.3)return;const cA=side>0?W.CAB+.1:-(W.GLASS-.05),cB=side>0?W.GLASS-.05:-(W.CAB+.1);nrBand('floor',a,b,cA,cB,y,y+.02,P('floor'),'t');
    nrBand('deck',a,b,side>0?W.COR+.1:-(W.CAB-.1),side>0?W.CAB-.1:-(W.COR+.1),y,y+.02,hc(0xc8beb0),'t');};
   let c=NR.T0;for(const g of cuts.filter(g=>!g.cor)){if(g.t0>c)lay(c,g.t0);c=Math.max(c,g.t1);}lay(c,NR.T1);}
  /* --- the corridor walls on the core side (|s| = 8.5): doors into each stair core hall */
  for(const side of [1,-1]){const s=side*W.COR,open=NR.CORES.map(C=>{const k=nrK(C.t,s);return {t0:C.t-3.2/k,t1:C.t-1.6/k,y1:2.3};});
   nrWallGaps('plaster',s,W.WALL,y,top,P('plaster'),open,nrZoneCuts(d,Math.min(s,s+side*.1),Math.max(s,s+side*.1)));}
  if(d===3){const B=NR.zone('bridge');nrWallT('plaster',B.t0,B.t1,B.s0,W.WALL,y,top,P('plaster'),[{t0:-1.2,t1:1.2,y1:2.3}]);}
  /* --- the stair core halls: end walls across the core, the flights, the arrival landings */
  for(const C of NR.CORES){for(const t of [C.t-3.7,C.t+3.7])nrRadial('plaster',t,-W.COR,W.COR,y,top,.2,P('plaster'));
   nrFlights(C.t,y,d<3?L.D[d+1]:L.TOP,true,P('conc'));}
  /* --- the cabins: the cabin walls with a door each, the partitions on the frames, the glazing (D3-D4) */
  for(const side of [1,-1]){const sW=side*W.CAB,mine=NR.cabins.filter(C=>C.deck===d&&C.side===side),rooms=NR.ROOMS.filter(R=>R.deck===d&&R.side===side);
   /* the ship's rooms (14-nr-plan.js NR.ROOMS) keep a door in the cabin wall; their ends stand on frames like the cabins' */
   const roomDoors=rooms.map(R=>{const k=nrK(R.door,sW),hw=.55/k;return {t0:R.door-hw,t1:R.door+hw,y1:2.3};});
   nrWallGaps('plaster',sW,W.WALL,y,top,P('plaster'),mine.map(nrCabinDoor).concat(roomDoors),nrZoneCuts(d,Math.min(sW,sW+side*.1),Math.max(sW,sW+side*.1)));
   const frames=new Set();for(const C of mine.concat(rooms)){frames.add(C.t0.toFixed(3));frames.add(C.t1.toFixed(3));}
   const sOut=side*(d>=2?W.GLASS:W.MAIN-.25);
   for(const f of frames){const t=+f;nrRadial('plaster',t,Math.min(sW,sOut),Math.max(sW,sOut),y,top,W.PART,P('plaster'));
    if(d>=2)nrRadial('white',t,Math.min(sOut,side*W.BALC),Math.max(sOut,side*W.BALC),y,y+2.2,.1,P('white'));}   // balcony dividers
   if(d>=2){const gaps=nrZoneCuts(d,Math.min(sOut,sOut+side*.1),Math.max(sOut,sOut+side*.1)).sort((a,b)=>a.t0-b.t0);let c=NR.T0;
    const glaze=(a,b)=>{if(b-a<.2)return;nrBand('glass',a,b,sOut-.04,sOut+.04,y,top,hc(0x6a8a98),side>0?'o':'i');
     nrBand('white',a,b,sOut-.08,sOut+.08,y,y+.12,P('white'),'oit');nrBand('white',a,b,sOut-.08,sOut+.08,top-.15,top,P('white'),'oib');
     for(let t=a;t<b;t+=NR.DT/2)nrBox('white',t,sOut,y,.08,top-y,.14,P('white'));};
    for(const g of gaps){if(g.t0>c)glaze(c,g.t0);c=Math.max(c,g.t1);}glaze(c,NR.T1);}
   /* the doors' leaves on the inhabited decks: most hang open into the cabin, some are gone */
   if(!stripped)for(const C of mine){if(C.i%5===3)continue;const D=nrCabinDoor(C),k=nrK(C.tm,C.sIn);const hingeT=C.doorEnd===0?D.t0:D.t1;
    const h=NR.at(hingeT,C.sIn+side*.1),T=NR.tan(hingeT),n=NR.nrm(hingeT),ang=1.25+.3*rng();
    /* the leaf swings from the hinge into the cabin (outboard, +side*n), turning away from the door's free edge */
    const fx=(C.doorEnd===0?1:-1),dx=T[0]*fx*Math.cos(ang)+n[0]*side*Math.sin(ang),dz=T[1]*fx*Math.cos(ang)+n[1]*side*Math.sin(ang);
    box('timber',h[0]+dx*.43,y+.02,h[1]+dz*.43,.86,2.05,.045,hc(0x8a6a4a),Math.atan2(-dz,dx));}}
  /* the stripped decks: debris where the pirates threw what they took out (heaps of panels and pipe) */
  if(stripped)for(let i=0;i<40;i++){const t=rr(NR.T0+8,NR.T1-8),s=(rng()<.5?-1:1)*rr(8.8,10.7);if(NR.blocked(d,t-1,t+1,Math.min(s,s*.9),Math.max(s,s*.9)))continue;
   const p=NR.at(t,s);box('rust',p[0],y,p[1],rr(.4,1.2),rr(.1,.5),rr(.3,.9),WHITE,rr(0,TAU));}}
 /* the kiosks over the stair cores on the top deck: a white pavilion, a band of glass, a curved roof, doors both ways */
 for(const C of NR.CORES){const y=L.TOP,h=3.3,t0=C.t-4.2,t1=C.t+4.2;
  for(const side of [1,-1]){const s=side*6.6,k=nrK(C.t,s);nrWallT('white',t0,t1,s,.25,y,y+h,P('white'),[{t0:C.t-3.4/k,t1:C.t-1.4/k,y1:2.4}]);
   nrBand('glass',t0+.4,t1-.4,s-.14,s+.14,y+2.5,y+3.0,hc(0x5a7a88),side>0?'o':'i');}
  for(const t of [t0,t1])nrRadial('white',t,-6.6,6.6,y,y+h,.25,P('white'));
  nrBand('white',t0-.6,t1+.6,-7.2,7.2,y+h,y+h+.35,P('white'));
  psurf('white',(u,v)=>{const t=lerp(t0-.4,t1+.4,u),s=lerp(-7,7,v);return nrP(t,s,y+h+.35+1.1*Math.sin(PI*v));},6,8,P('white'),{up:true});}}
nrPart('decks',nrDecks);
