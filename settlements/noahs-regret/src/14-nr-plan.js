// ================================================================= THE PLAN: the ring, its decks, zones, rooms and lots ([G data])
// Every position the arcology owns is decided here, before anything is drawn: the drawing passes (4x) and the furnishing
// pass (70) read NR, never the other way round. No THREE, no DOM: this is what a port takes as data.
//
// THE RING. The hull is a C: an ellipse (centreline semi-axes A along the bow-stern x axis, B across) with a 76 m gap, the
// HARBOUR MOUTH, on the port beam (-z, the open sea). Positions along it are by ARC LENGTH t on the centreline: t = 0 at
// the bow, increasing toward starboard (the beach), the stern at P/2, the mouth at 3P/4. The ring runs t in [T0, T1]
// (T0 < 0: the port bow quarter). Across it, s is the offset from the centreline along the outward normal (+s outboard,
// the sea or the beach; -s inboard, the harbour basin).
//
// THE SECTION (s, hull y):
//   pontoon   |s| <= 26, y 0 -> 9: the holds (a double-height hold with a mezzanine gallery at 4.8; flooded to the sea)
//   ledges    the pontoon's top outside the main block, y 9: the outer promenade (beach and sea) and the inner quay
//   main      |s| <= 20, decks D1..D4 at y 9, 12.6, 16.2, 19.8 (3.6 m floor to floor), the TOP deck at 23.4
//             cabins 11 <= |s| <= 18.4 (D3, D4: a glazed wall at 18.5 and a balcony to 20; D1, D2: a window wall at 20)
//             corridors 8.5 <= |s| <= 11; the service core |s| <= 8.5 (solid: shafts and tanks), pierced by stair cores
//   top       parks, promenades and the Ancient buildings, |s| <= 15 for lots, parapets at 20
// Inhabited: D3 and D4 (cabins, the atrium galleries, the bridge, the grand dining room). D1 and D2 are stripped and empty;
// the engine room (D1-D2, stern) has been silent for a thousand years; the holds are half full of the sea.
const NR=(function(){
 const N={ready:false};
 const A=214,B=144;N.A=A;N.B=B;
 /* arc-length table over theta (x = A cos th, z = B sin th) */
 const NT=8192,TL=new Float64Array(NT+1);{let L=0,px=A,pz=0;for(let i=1;i<=NT;i++){const th=i/NT*TAU,x=A*Math.cos(th),z=B*Math.sin(th);L+=Math.hypot(x-px,z-pz);TL[i]=L;px=x;pz=z;}}
 const P=TL[NT];N.P=P;
 function thetaOf(t){t=((t%P)+P)%P;let lo=0,hi=NT;while(hi-lo>1){const m=(lo+hi)>>1;if(TL[m]<=t)lo=m;else hi=m;}const f=(t-TL[lo])/Math.max(1e-9,TL[hi]-TL[lo]);return (lo+f)/NT*TAU;}
 function tOf(th){th=((th%TAU)+TAU)%TAU;const u=th/TAU*NT,i=Math.min(NT-1,Math.floor(u)),f=u-i;return TL[i]+(TL[i+1]-TL[i])*f;}
 N.thetaOf=thetaOf;N.tOf=tOf;
 function nrm(th){const nx=Math.cos(th)/A,nz=Math.sin(th)/B,L=Math.hypot(nx,nz);return [nx/L,nz/L];}
 /* the point at (t, s), the outward normal and the tangent (direction of increasing t) at t, in the hull frame's x, z */
 N.at=function(t,s){const th=thetaOf(t),n=nrm(th);return [A*Math.cos(th)+s*n[0],B*Math.sin(th)+s*n[1]];};
 N.nrm=function(t){return nrm(thetaOf(t));};
 N.tan=function(t){const n=nrm(thetaOf(t));return [-n[1],n[0]];};   // increasing theta: (-sin, cos) scaled, i.e. the normal turned +90 deg
 /* the radius of curvature of the centreline at t (an ellipse: (A2 sin2 + B2 cos2)^1.5 / AB) */
 N.rho=function(t){const th=thetaOf(t),s=Math.sin(th),c=Math.cos(th);return Math.pow(A*A*s*s+B*B*c*c,1.5)/(A*B);};
 /* a heading (three.js rotation.y) whose local +z points along (dx, dz) */
 N.ryOf=function(dx,dz){return Math.atan2(dx,dz);};
 /* the nearest centreline point to hull (x, z): {t, s, th, inRing} (Newton on the ellipse's angle; s > 0 outboard) */
 N.ringST=function(x,z){let th=Math.atan2(z/B,x/A);
  for(let i=0;i<6;i++){const c=Math.cos(th),s=Math.sin(th),px=A*c,pz=B*s,dx=-A*s,dz=B*c,ddx=-A*c,ddz=-B*s;
   const f=(px-x)*dx+(pz-z)*dz,fp=dx*dx+dz*dz+(px-x)*ddx+(pz-z)*ddz;if(Math.abs(fp)<1e-9)break;th-=f/fp;}
  const px=A*Math.cos(th),pz=B*Math.sin(th),n=nrm(th),s=(x-px)*n[0]+(z-pz)*n[1];
  let t=tOf(th);const tt=((t-N.T0)%P+P)%P+N.T0;return {t:tt,s,th,inRing:tt<=N.T1};};
 // ---------------------------------------------------------------- levels and widths
 const L={KEEL:0,HOLD:.6,MEZZ:4.8,D:[9.0,12.6,16.2,19.8],TOP:23.4,SLAB:.35,DH:3.6,PARAPET:1.15};
 L.CLEAR=L.DH-L.SLAB;   // 3.25 m from a deck to the slab above
 N.L=L;
 const W={PONT:26,SKIN:25.3,MAIN:20,BALC:20,GLASS:18.5,CAB:11,COR:8.5,MEZZ:19.2,LOT:15,PART:.16,WALL:.2};
 N.W=W;
 // ---------------------------------------------------------------- the ring's extent and the mouth
 const MOUTH=76;N.MOUTH=MOUTH;N.TM=.75*P;
 N.T0=N.TM+MOUTH/2-P;N.T1=N.TM-MOUTH/2;
 const PQ=P/4,PH=P/2;N.PQ=PQ;N.PH=PH;
 // ---------------------------------------------------------------- ZONES: the public rooms and the machinery
 // decks: indices into L.D (0 = D1). s0..s1: the band across the ring a zone takes on those decks.
 N.ZONES=[
  {id:'bridge',kind:'bridge',name:'The bridge',t0:-18,t1:18,decks:[3],s0:-2,s1:W.MAIN},
  {id:'atrium',kind:'atrium',name:'The grand atrium',t0:PQ-22,t1:PQ+22,decks:[0,1,2,3],s0:-W.MAIN,s1:W.MAIN},
  {id:'dining',kind:'dining',name:'The grand dining room',t0:PH-26,t1:PH+26,decks:[2,3],s0:-W.MAIN,s1:W.MAIN},
  {id:'engine',kind:'engine',name:'The engine room',t0:PH-30,t1:PH+30,decks:[0,1],s0:-W.MAIN,s1:W.MAIN}];
 N.zone=id=>N.ZONES.find(z=>z.id===id);
 /* does a zone take the band [s0, s1] at t in [t0, t1] on deck d? */
 N.blocked=function(d,t0,t1,s0,s1){for(const Z of N.ZONES){if(Z.decks.indexOf(d)<0)continue;if(t1<=Z.t0||t0>=Z.t1)continue;if(s1<=Z.s0||s0>=Z.s1)continue;return Z;}return null;};
 // ---------------------------------------------------------------- STAIR CORES: switchback stairs in the service core, D1 -> TOP
 // Each takes t in [t-5, t+5] of the core (|s| <= 6) and opens onto both corridors on every deck; a kiosk covers it on top.
 N.CORES=[-228,-150,-70,70,150,225,380,470,650,730,800].map((t,i)=>({id:'core'+i,t,t0:t-5,t1:t+5,down:i===0||i===10}));
 // ---------------------------------------------------------------- CABINS: frames every DT along the centreline
 // A cabin is the band between two frames, 11.1 <= |s| <= 18.4 on D3-D4 (behind the glass, a balcony beyond) or 19.9 on
 // D1-D2, on either side of the ring. Partitions stand on the frames (radial lines), so a cabin is a slight trapezoid:
 // wider outboard on the outer side. CLASS: the widest of the template widths that fits its narrow end (70-nr-interiors.js
 // furnishes one template per class and door side and stands it in every cabin of that class, as data per cabin).
 const DT=4.2;N.DT=DT;
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
  {id:'lot-hq',key:'nr-anc-reliquary',t:-4,face:'fwd',use:'hq'},
  {id:'lot-a1',key:'nr-anc-apt-ribbon',t:-110,face:'in',use:'barracks'},
  {id:'lot-b1',key:'nr-anc-apt-drum',t:-200,face:'in',use:'barracks'},
  {id:'lot-a2',key:'nr-anc-apt-ribbon',t:110,face:'out',use:'barracks'},
  {id:'lot-o1',key:'nr-anc-office-lens',t:188,face:'in',use:'barracks'},
  {id:'lot-b2',key:'nr-anc-apt-drum',t:332,face:'in',use:'barracks'},
  {id:'lot-a3',key:'nr-anc-apt-ribbon',t:420,face:'in',use:'barracks'},
  {id:'lot-o2',key:'nr-anc-office-lens',t:506,face:'in',use:'mess'},
  {id:'lot-b3',key:'nr-anc-apt-drum',t:618,face:'out',use:'barracks'},
  {id:'lot-a4',key:'nr-anc-apt-ribbon',t:690,face:'in',use:'barracks'},
  {id:'lot-o3',key:'nr-anc-office-lens',t:765,face:'out',use:'barracks'}];
 /* face: 'in' the front (+z) toward the harbour, 'out' toward the sea or the beach, 'fwd' along the ring (increasing t) */
 for(const Lt of N.LOTS){const p=N.at(Lt.t,0),n=Lt.face==='fwd'?N.tan(Lt.t):N.nrm(Lt.t),dz=Lt.face==='in'?-1:1;Lt.x=p[0];Lt.z=p[1];Lt.ry=Math.atan2(n[0]*dz,n[1]*dz);Lt.y=L.TOP;}
 /* parks: lawn beds between the lots, the bow garden, the stern garden over the dining room (its skylights) */
 N.PARKS=[{id:'park-bowS',t0:-62,t1:-28},{id:'park-bowN',t0:28,t1:58},{id:'park-a',t0:-180,t1:-160},{id:'park-b',t0:-90,t1:-78},
  {id:'park-c',t0:130,t1:142},{id:'park-d',t0:236,t1:256},{id:'park-e',t0:350,t1:372},{id:'park-f',t0:440,t1:462},
  {id:'park-stern',t0:PH-30,t1:PH+30,stern:true},{id:'park-g',t0:632,t1:642},{id:'park-h',t0:708,t1:722},{id:'park-i',t0:778,t1:792}];
 // ---------------------------------------------------------------- the ways down to the beach and to the water
 // Pirate-built timber: switchback TOWERS from the outer ledge (D1 level) to the top deck against the starboard hull, and
 // flights of STEPS from the ledge down to the dune; FLOATS (timber pontoons at the water) off the inner quay for boats.
 N.TOWERS=[{t:PQ-58},{t:PQ+64},{t:PQ+150}];
 N.STEPS=[{t:PQ-36},{t:PQ},{t:PQ+40},{t:PQ+120},{t:PQ-110}];
 N.FLOATS=[{t:-120},{t:60},{t:330},{t:420},{t:650}];
 /* the atrium: its void, the galleries round it, the grand stair (four flights: D1->D2 centre, D2->D3 twin, D3->D4 centre,
    D4->TOP twin) and the descent to the hold mezzanine. tau = t - (the atrium's centre). */
 N.ATRIUM={tc:PQ,half:22,voidT:18,voidS:14,galleryS:[14,20],bridgeT:[6,9],flightT:6,centreS:4,twinS:[9,13],holdStair:{tau0:-17,tau1:-9,s:3}};
 N.ready=true;
 return N;})();
