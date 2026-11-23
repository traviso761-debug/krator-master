// ================================================================= XANADU — the caravanserai (the owner, 2026-11-16: "build xanadu one")
// The Xanadu kit had none (Qiblai's kit has its own, qb_caravanserai, in Qiblai's dress). This is the Sultanate's: a square
// court of two-storey ranges in white-washed, battered Tibetan masonry with Persian detail, settlements/pher/PLAN.md:
//   - the ranges: travellers' rooms upstairs behind trapezoid windows; on the ground floor, the stables and stores open
//     to the court through a pointed arcade;
//   - the gate: a tall gate block with an open iwan through it (its mosaic vault, guldasta turrets), a flight up to it;
//   - four corner towers, a storey higher, gilt finials;
//   - the court: a fountain and its trough, yaks and mules, bales, sacks and crates, the caravaneers.
// v0 the north shore's (Phēr: wash and gold), v1 the road's (earth wash, plainer, a second well). Seeds 32990-32999.
// Its rooms: kits/xanadu/extra/69dz-ix-xanadu-extra.js (the set 'xanadu-extra', an item per range).
// OPT-IN until the kit's next all-builds rebuild (kits/xanadu/README.md, "Opt-in pieces"): a page takes it through its
// kit.json "external" (settlements/pher), so no other page changes; it joins src/ with the ride-along rebuild.
function buildXaCaravanserai(G,o){reseed(32991+(o.v|0));const V=xV(o),W=48,D=48,Dr=7,P=.6,hr=[3.8,3.2],GW=12;
 const wash=xC(xPick(V===1?XPAL.earth:XPAL.wash)),stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.timber)),timD=xC(0x5a4632),trim=xC(xPick(XPAL.trim)),lit=xLit();
 vnReg('Caravanserai',0,0,27,P+14);vnReg('Caravanserai — court',0,0,12,4);
 xnWall(0,0,0,W+.8,P,D+.8,0,stone,'dressed');
 // the ranges: [centre x, centre z, length, ry (the outer face's way out)]; the back and the front's two halves stop at the
 // corner towers (TW), the front's halves flank the gate block; the sides run between the back and the front ranges
 const TW=Dr,half=(W-GW)/2-TW,R=[[0,-D/2+Dr/2,W-2*TW,Math.PI],[W/2-Dr/2,0,D-2*Dr,Math.PI/2],[-W/2+Dr/2,0,D-2*Dr,-Math.PI/2],
  [-(GW/2+half/2),D/2-Dr/2,half,0],[GW/2+half/2,D/2-Dr/2,half,0]];
 for(const [x,z,L,ry] of R){const S=xnStack(x,P,z,L,Dr,ry,hr,wash,V===1?'earth':'wash');
  xnFlatRoof(x,S.y,z,S.w,S.d,ry,wash,{parapet:.6,band:true});
  // the outer face: the upper storey's windows only (a caravanserai is blind below)
  const n=Math.max(2,Math.floor((L-3)/3.4));for(let i=0;i<n;i++){const p=loc(x,z,-L/2+1.7+(L-3.4)*(i+.5)/n,(Dr+S.d)/4+.03,ry);xnTibWin(p[0],P+hr[0]+.9,p[1],ry,.9,1.1,lit?'lit':'glass',trim,{noVal:i%2===1});}
  // the court face: the pointed arcade of the stables below, windows over it
  const ci=ry+Math.PI,m=Math.max(2,Math.floor((L-4)/3.6));for(let i=0;i<m;i++){const u=-L/2+2+(L-4)*(i+.5)/m,p=loc(x,z,u,-Dr/2-.02,ry);
   xnArch('xArchS',p[0],P,p[1],ci,2.6,2.9,.45,stone);const q=loc(x,z,u,-(Dr+S.d)/4-.03,ry);xnTibWin(q[0],P+hr[0]+.9,q[1],ci,.8,1.0,lit?'lit':'glass',trim,{noVal:true});}}
 // the gate block: a cube a storey taller with the open iwan through it, its flight, the gilt finials
 const GH=hr[0]+hr[1]+3.2;xnWall(0,P,D/2-Dr/2,GW,GH,Dr+1,0,wash,V===1?'earth':'wash');
 xnIwanOpen(0,P,D/2+.5,0,7.2,GH-1.4,Dr+1,wash,{through:true});
 xnFlatRoof(0,P+GH,D/2-Dr/2,GW*.9,Dr*.9,0,wash,{parapet:.8,corner:'gold'});
 xnFlight(0,0,D/2+.5+Math.max(2,Math.round(P/.17))*.34,0,7,P,'vStone',stone);
 // the corner towers, a storey higher than the ranges
 for(const sx of[-1,1])for(const sz of[-1,1]){const x=sx*(W/2-TW/2),z=sz*(D/2-TW/2),T=xnStack(x,P,z,TW,TW,0,[hr[0],hr[1],2.8],wash,V===1?'earth':'wash');
  xnFlatRoof(x,T.y,z,T.w,T.d,0,wash,{parapet:.7,corner:V===1?'pinnacle':'gold'});}
 // the court: the fountain and its trough, the beasts and the loads, the caravaneers
 xnFountain(0,P,2,1.4);vB('vStone',0,P,7.2,6,.6,1,0,stone);vB('xWaterB',0,P+.45,7.2,5.6,.12,.7,0,xC(XPAL.water));
 if(V===1)xnFountain(-9,P,-8,1.0);
 for(let i=0;i<(V===1?5:7);i++)xnYak(-13+i*4.2,(i%2?-6:9),i*.8+.4,P);
 for(let i=0;i<6;i++)kput('vThatchB',[11+(i%3)*1.4,P+.35,-9+Math.floor(i/3)*1.2],null,[1.2,.7,1],xC(xPick(VPAL.thatch)));
 vnSacks(-12,P,-11,6);vnCrate(-8.5,P,-12.5,.9,.2);vnCrate(-7.4,P,-11,.8,.4);vnBarrel(9,P,10,.36,.9,xC(0x8a6a48));vnBarrel(10,P,10.3,.36,.9,xC(0x8a6a48));
 vB('vWood',0,P+2.7,-D/2+Dr+1.4,W-2*Dr,.12,2.6,0,tim);for(let k=0;k<8;k++)vPst('vPost',-W/2+Dr+2+k*(W-2*Dr-4)/7,P,-D/2+Dr+2.6,.1,2.6,timD);   // the hay loft's lean-to on the back range
 xnFolk(0,P,0,8,12);}
XA.def({key:'xa_caravanserai',name:'Caravanserai',family:'Trade',tags:{type:['tavern/inn','market/shop','infrastructure'],wealth:'civic',lit:true,landmark:true},w:54,d:56,h:17,fw:48,fd:48,nv:2,eye:[2,34,0,10],build:buildXaCaravanserai});
