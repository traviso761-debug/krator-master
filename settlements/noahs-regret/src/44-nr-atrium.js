// prefix: nr
// ================================================================= THE GRAND ATRIUM: the void, the galleries, the grand stair, the dome
// Starboard midships (t = P/4, the beach side), all four decks: a void (tau in [-18, 18] along the ring, |s| <= 14) open
// from the D1 floor to a glass dome on the top deck. Galleries run round it on every deck (the slabs round the void, 40),
// glazed to the sea and the harbour (|s| = 20). The grand stair climbs the void in four flights, each landing on a bridge
// across it that joins the galleries: D1 -> D2 a broad central flight (tau -6 -> 6), D2 -> D3 twin flights back (|s| 9-13),
// D3 -> D4 central again, D4 -> the top deck twin. A flight drops from the D1 floor to the holds' mezzanine (47).
// The entrances on D1 open onto the outer promenade (the beach stairs, 62) and the inner quay; their doors are gone.
const NR_ATR=NR.ATRIUM;
function nrTau(tau){return NR_ATR.tc+tau;}
/* a flight from (tauA, yA) to (tauB, yB) across [s0, s1]: solid stone steps, each a block from the flight's foot level */
function nrStairRun(mk,tauA,tauB,s0,s1,yA,yB,col,rails){const n=Math.max(4,Math.round(Math.abs(yB-yA)/.18)),dt=(tauB-tauA)/n,rise=(yB-yA)/n;
 const base=Math.min(yA,yB)-.35;
 for(let i=0;i<n;i++){const a=tauA+dt*i,b=a+dt;   /* descending (rise < 0): step i is the higher one */
  const lo=Math.min(a,b),hi=Math.max(a,b),yt=rise>0?yA+rise*(i+1):yA+rise*i;nrBand(mk,nrTau(lo),nrTau(hi),s0,s1,base,yt,col,'t');
  nrBand('plaster',nrTau(lo),nrTau(hi),s0,s1,base,yt,P('plaster'),'oibse');}
 if(rails)for(const s of [s0+.15,s1-.15]){const a=nrP(nrTau(tauA),s,yA+1.0),b=nrP(nrTau(tauB),s,yB+1.0);beam('brass',a,b,.05,P('brass'),true,6);
  for(let i=0;i<=n;i+=3){const t=lerp(tauA,tauB,i/n),yy=lerp(yA,yB,i/n);const p=nrP(nrTau(t),s,yy);beam('brass',p,[p[0],p[1]+1,p[2]],.025,P('brass'),true,5);}}}
/* a balustrade along the ring at s from tau0 to tau1 at height y: glass panels, a brass rail */
function nrBalT(s,tau0,tau1,y){nrBand('glass',nrTau(tau0),nrTau(tau1),s-.03,s+.03,y,y+1.0,hc(0x9ab4bc),'oi');nrBand('brass',nrTau(tau0),nrTau(tau1),s-.06,s+.06,y+1.0,y+1.08,P('brass'),'oit');
 for(let t=tau0;t<=tau1+.01;t+=2)nrBox('brass',nrTau(t),s,y,.06,1.04,.06,P('brass'));}
/* a balustrade across the ring at tau from s0 to s1 */
function nrBalS(tau,s0,s1,y){nrRadial('glass',nrTau(tau),s0,s1,y,y+1.0,.06,hc(0x9ab4bc));nrRadial('brass',nrTau(tau),s0,s1,y+1.0,y+1.08,.12,P('brass'));
 for(let s=s0;s<=s1+.01;s+=2)nrBox('brass',nrTau(tau),s,y,.06,1.04,.06,P('brass'));}
function nrAtrium(){const L=NR.L,W=NR.W,A=NR_ATR,vT=A.voidT,vS=A.voidS,H=A.half;reseed(4400);
 const decks=[L.D[0],L.D[1],L.D[2],L.D[3],L.TOP];
 /* marble floors: the D1 hall and every gallery */
 nrBand('marble',nrTau(-H),nrTau(H),-W.MAIN+.2,W.MAIN-.2,L.D[0],L.D[0]+.02,P('marble'),'t');
 for(let k=1;k<4;k++){const y=decks[k];
  for(const sg of [1,-1])nrBand('marble',nrTau(-H),nrTau(H),sg>0?vS:-W.MAIN+.2,sg>0?W.MAIN-.2:-vS,y,y+.02,P('marble'),'t');
  for(const tg of [1,-1])nrBand('marble',nrTau(tg>0?vT:-H),nrTau(tg>0?H:-vT),-vS,vS,y,y+.02,P('marble'),'t');}
 /* the zone's end walls on every deck: open to the corridors (|s| 8.5-11) and as a broad arch to the core-side lobby */
 for(let d=0;d<4;d++){const y=L.D[d],top=y+L.CLEAR;
  for(const tau of [-H,H]){const t=nrTau(tau);
   for(const [s0,s1] of [[-W.MAIN,-W.CAB],[-W.COR,W.COR],[W.CAB,W.MAIN]])nrRadial('plaster',t,s0,s1,y,top,.3,P('plaster'));
   for(const [s0,s1] of [[-W.CAB,-W.COR],[W.COR,W.CAB]])nrRadial('plaster',t,s0,s1,y+2.6,top,.3,P('plaster'));}
  /* the facades in the zone: glass curtain walls with white mullions (D1 has the entrances, its doors gone) */
  for(const sg of [1,-1]){const s=sg*(W.MAIN-.2);
   if(d===0){for(const [a,b] of [[-H,-4],[4,H]])nrBand('glass',nrTau(a),nrTau(b),s-.04,s+.04,y,top,hc(0x6a8a98),'oi');nrBand('glass',nrTau(-4),nrTau(4),s-.04,s+.04,y+3.0,top,hc(0x6a8a98),'oi');
    nrBand('white',nrTau(-4.3),nrTau(4.3),s-.25,s+.25,y+2.95,y+3.25,P('white'));}
   else nrBand('glass',nrTau(-H),nrTau(H),s-.04,s+.04,y,top,hc(0x6a8a98),'oi');
   for(let tau=-H;tau<=H+.01;tau+=2.75)if(!(d===0&&Math.abs(tau)<4))nrBox('white',nrTau(tau),s,y,.16,top-y,.22,P('white'));}}
 /* galleries' balustrades round the void, every level above D1 (a gap where a flight or a bridge lands) */
 for(let k=1;k<5;k++){const y=decks[k];
  for(const sg of [1,-1]){
   /* the side balustrades, broken where a bridge meets the gallery */
   const br=k%2===1?[A.bridgeT[0],A.bridgeT[1]]:[-A.bridgeT[1],-A.bridgeT[0]];
   nrBalT(sg*vS,-vT,br[0],y);nrBalT(sg*vS,br[1],vT,y);}
  for(const tg of [1,-1])nrBalS(tg*vT,-vS,vS,y);}
 /* the bridges across the void and their balustrades */
 for(let k=1;k<5;k++){const y=decks[k],b0=k%2===1?A.bridgeT[0]:-A.bridgeT[1],b1=k%2===1?A.bridgeT[1]:-A.bridgeT[0];
  nrBand('marble',nrTau(b0),nrTau(b1),-vS,vS,y-.6,y,P('marble'),'t');nrBand('white',nrTau(b0),nrTau(b1),-vS,vS,y-.75,y,P('white'),'bse');
  /* the balustrade on the bridge's open edge (the flight arriving lands on the other) */
  const open=k%2===1?b1:b0,land=k%2===1?b0:b1;
  nrBalS(open,-vS,vS,y);
  /* the next flight leaves from the bridge's landing edge: central from the odd bridges' far side, twin from the even */
  const S=k<4?[[-vS,-A.twinS[1]],[-A.twinS[0],-A.centreS],[A.centreS,A.twinS[0]],[A.twinS[1],vS]]:[[-vS,-A.twinS[1]],[-A.twinS[0],A.twinS[0]],[A.twinS[1],vS]];
  for(const q of S)nrBalS(land,q[0],q[1],y);}
 /* the grand stair: four flights */
 nrStairRun('marble',-A.flightT,A.flightT,-A.centreS,A.centreS,L.D[0],L.D[1],P('marble'),true);                   // D1 -> D2, central
 for(const sg of [1,-1])nrStairRun('marble',A.flightT,-A.flightT,sg>0?A.twinS[0]:-A.twinS[1],sg>0?A.twinS[1]:-A.twinS[0],L.D[1],L.D[2],P('marble'),true);   // D2 -> D3, twin
 nrStairRun('marble',-A.flightT,A.flightT,-A.centreS,A.centreS,L.D[2],L.D[3],P('marble'),true);                   // D3 -> D4, central
 for(const sg of [1,-1])nrStairRun('marble',A.flightT,-A.flightT,sg>0?A.twinS[0]:-A.twinS[1],sg>0?A.twinS[1]:-A.twinS[0],L.D[3],L.TOP,P('marble'),true); // D4 -> top, twin
 /* the newel posts at the foot of the grand stair: two Ancient lamp standards (dead; the pirates hang lanterns on them) */
 for(const sg of [1,-1]){const p=nrP(nrTau(-A.flightT-.8),sg*(A.centreS+.4),L.D[0]);cyl('brass',p[0],p[1],p[2],.22,3.4,P('brass'),12,.12);sph('glass',p[0],p[1]+3.6,p[2],.45,hc(0xd8e0e0),1,12);}
 /* the descent to the holds through the D1 floor: a flight down to the mezzanine catwalk (47), its well railed */
 const HS=A.holdStair;nrStairRun('conc',HS.tau1,HS.tau0,-HS.s,HS.s,L.D[0],L.MEZZ,P('conc'),true);
 for(const sg of [1,-1])nrBalT(sg*(HS.s+.1),HS.tau0,HS.tau1,L.D[0]);nrBalS(HS.tau0,-HS.s,HS.s,L.D[0]);
 /* the dome over the void and the top deck's gallery round it: a white drum just inside the parapets, white ribs, glass
    between (an ellipse in the ring's frame at the atrium's centre) */
 const C=NR.at(A.tc,0),T=NR.tan(A.tc),N=NR.nrm(A.tc),ra=H-.4,rb=W.MAIN-.7,dh=14,y0=L.TOP;
 const dp=(phi,u)=>{const r=Math.cos(u*PI/2),h=Math.sin(u*PI/2);const a=Math.cos(phi)*ra*r,b=Math.sin(phi)*rb*r;return [C[0]+T[0]*a+N[0]*b,y0+1.4+h*dh,C[1]+T[1]*a+N[1]*b];};
 psurf('glass',(u,v)=>dp(u*TAU,v),48,10,hc(0xb8d0d8));
 psurf('white',(u,v)=>{const p=dp(u*TAU,0);return [p[0],y0+v*1.4,p[2]];},48,1,P('white'),{flip:true});
 for(let i=0;i<24;i++){const phi=i/24*TAU;for(let j=0;j<10;j++){const a=dp(phi,j/10),b=dp(phi,(j+1)/10);beam('white',a,b,.16,P('white'));}}
 for(let j=1;j<10;j+=3)for(let i=0;i<48;i++){const a=dp(i/48*TAU,j/10),b=dp((i+1)/48*TAU,j/10);beam('white',a,b,.1,P('white'));}
 {const q=dp(0,1);cyl('white',q[0],q[1]-.2,q[2],1.4,.6,P('white'),16);cyl('white',q[0],q[1]+.4,q[2],.15,5,P('white'),8,.05);}}
nrPart('atrium',nrAtrium);
