// prefix: nr
// ================================================================= THE HOLDS: the pontoon's cargo holds, empty and half full of the sea
// The whole pontoon under D1 (|s| < 25.3, y 0.6 -> 8.65) is one ring of holds: concrete columns on a grid, watertight
// bulkheads with great doorways, a mezzanine gallery of grating along both skins at y 4.8, catwalks across where the
// stairs come down (the atrium's descent, the two end cores). The sea stands in them at its own level (the hull is holed
// and aground): about 2 m deep on the starboard side, 6 on the port side. The water is the sea's own mesh (82).
const NR_BULKHEADS=[-232,-130,-40,60,170,236,330,430,500,640,740].map(t=>({t}));
function nrHolds(){const L=NR.L,W=NR.W,y0=L.HOLD,y1=L.D[0]-L.SLAB,M=L.MEZZ,A=NR.ATRIUM;reseed(4700);
 /* the columns: four rows, every 8.4 m (skipped where a catwalk or a bulkhead stands) */
 const busy=t=>NR_BULKHEADS.some(b=>Math.abs(b.t-t)<1.2)||Math.abs(t-(A.tc-18))<3||NR.CORES.some(c=>c.down&&Math.abs(c.t-t)<4);
 for(let t=NR.T0+4;t<NR.T1-2;t+=8.4){if(busy(t))continue;for(const s of [-13,-6,6,13]){const p=nrP(t,s,y0),n=NR.nrm(t);box('conc',p[0],y0,p[2],.7,y1-y0,.7,P('concD'),Math.atan2(n[0],n[1]));}}
 /* the bulkheads: a great doorway in the middle, the mezzanines pass through at the sides */
 for(const B of NR_BULKHEADS){const t=B.t;
  for(const [s0,s1] of [[-W.SKIN,-W.MEZZ],[-W.MEZZ+1.5,-4],[4,W.MEZZ-1.5],[W.MEZZ,W.SKIN]]){nrRadial('cracked',t,s0,s1,y0,y1,.45,hc(0x8a857a));}
  for(const [s0,s1] of [[-W.MEZZ,-W.MEZZ+1.5],[W.MEZZ-1.5,W.MEZZ]]){nrRadial('cracked',t,s0,s1,M+2.6,y1,.45,hc(0x8a857a));nrRadial('cracked',t,s0,s1,y0,M,.45,hc(0x8a857a));}
  nrRadial('cracked',t,-4,4,y0+6.2,y1,.45,hc(0x8a857a));}
 /* the mezzanine galleries along both skins: grating on brackets, a rail on the open edge */
 for(const sg of [1,-1]){const s0=sg>0?W.MEZZ:-W.SKIN+.05,s1=sg>0?W.SKIN-.05:-W.MEZZ;
  nrBand('grate',NR.T0+1,NR.T1-1,s0,s1,M-.15,M,WHITE);
  nrBand('paint',NR.T0+1,NR.T1-1,sg*W.MEZZ-.03,sg*W.MEZZ+.03,M+1.0,M+1.06,hc(0x6a6a62),'oit');
  for(let t=NR.T0+2;t<NR.T1-1;t+=3){const p=nrP(t,sg*W.MEZZ,M);box('paint',p[0],M,p[2],.06,1.0,.06,hc(0x6a6a62));
   const q=nrP(t,sg*(W.MEZZ+1.5),M-1.6);beam('paint',[q[0],q[1],q[2]],nrP(t,sg*(W.SKIN-.1),M-.1),.12,hc(0x6a6a62));}}
 /* catwalks across: at the atrium's descent and the two end cores' arrivals */
 const across=(t0,t1)=>{nrBand('grate',t0,t1,-W.MEZZ,W.MEZZ,M-.15,M,WHITE);for(const t of [t0,t1])nrBand('paint',t-.03,t+.03,-W.MEZZ,W.MEZZ,M+1.0,M+1.06,hc(0x6a6a62),'oit');
  for(const s of [-12,-4,4,12]){const p=nrP((t0+t1)/2,s,y0);box('paint',p[0],y0,p[2],.18,M-.15-y0,.18,hc(0x6a6a62));}};
 across(A.tc+A.holdStair.tau0-2.6,A.tc+A.holdStair.tau0+.05);
 for(const C of NR.CORES.filter(c=>c.down)){across(C.t-3.6,C.t-1.3);nrFlights(C.t,M,L.D[0],true,P("conc"));}
 /* what is left in them: a few Ancient containers, some floating, some on the mezzanine, rotting cargo frames */
 for(let i=0;i<34;i++){const t=rr(NR.T0+10,NR.T1-10),s=rr(-22,22);if(Math.abs(s)<4.5&&rng()<.7)continue;
  const p=NR.at(t,s),n=NR.nrm(t),sea=nrSeaHullY(p[0],p[1]);const onMezz=Math.abs(s)>W.MEZZ+.8;const yb=onMezz?M:Math.max(y0,sea-.9);
  if(onMezz&&rng()<.5)continue;box('rust',p[0],yb,p[1],2.4,2.5,6,WHITE,Math.atan2(n[0],n[1])+rr(-.25,.25),onMezz?0:rr(-.12,.12),onMezz?0:rr(-.1,.1));}}
nrPart('holds',nrHolds);
