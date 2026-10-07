// ================================================================= VIEWS, WHERE-AM-I and the WALK FLOORS (read the plan, draw nothing)
// A view is [cx, cy, cz, tx, ty, tz, {cut, night}] in WORLD metres; the interior ones are written in the hull frame (t, s,
// height) and carried to the world by NR_HULL. `cut` is a hull-frame height (92-camera.js NR_LEVELS) or null.
/* the deck cut's levels (92-camera.js): a name and a hull-frame height, or null for off */
const NR_LEVELS=[['off',null],['Holds (mezzanine)',NR.L.MEZZ+3.0],['D1 - stripped',NR.L.D[0]+2.2],['D2 - stripped',NR.L.D[1]+2.2],
 ['D3 - crew cabins',NR.L.D[2]+2.2],['D4 - officers, bridge',NR.L.D[3]+2.2],['Dining room (D3-D4)',NR.L.D[2]+5.6],['Top deck: ground floors',NR.L.TOP+2.4]];
for(let k=1;k<=5;k++)NR_LEVELS.push(['Top deck: storey '+(k+1),NR.L.TOP+.25+k*NR_STOREY+2.2]);
for(const S of NR.BRIDGEHOUSE.storeys)NR_LEVELS.push(['Bridge house: '+['the officers\' hall','the chart deck','the berths','the lookout lounge'][S.k],S.y0+2.2]);
NR_LEVELS.push(['The bridge (the bridge house)',NR.BRIDGEHOUSE.bridge.y0+2.2]);
function nrHP(t,s,y){const p=NR.at(t,s);return nrH2W(p[0],y,p[1]);}
function nrV(eye,at,opt){return eye.concat(at,[opt||{}]);}
function nrViews(){const L=NR.L,PQ=NR.ATRIUM.tc,lot=id=>NR.LOTS.find(l=>l.id===id),zone=NR.zone,room=NR.room,V={};
 const cutAt=name=>{const q=NR_LEVELS.find(l=>l[0].startsWith(name));return q?q[1]:null;};
 V["Opening: the harbour from the north-east"]=nrV([420,250,-470],[-10,8,10]);
 V['From the sea: the port hull']=nrV([-60,22,-600],[-20,14,-150]);
 {const a=NR.at(NR.T1,0),b=NR.at(NR.T0,0),m=nrH2W((a[0]+b[0])/2,0,(a[1]+b[1])/2);
  V['Astern: the harbour mouth between the hulls']=nrV([m[0]-330,40,m[2]-40],[m[0]+60,10,m[2]]);}
 V['The beach: the starboard hull']=nrV(nrHP(PQ-30,92,L.TOP-12),nrHP(PQ+10,20,L.D[0]+6));
 {const H=(x,y,z)=>nrH2W(x,y,z),br=NR.BRIDGEHOUSE.bridge,hq=lot('lot-hq');
  V['The bow: the bridge house']=nrV(nrHP(-40,110,L.TOP+40),H(240,L.TOP+8,0));
  V['The forecourt plaza and the headquarters']=nrV(H(30,36,-34),H(170,12,0));
  V['The terraces and the grand stair']=nrV(H(132,15,-22),H(200,21,0));
  V['Inside the bridge']=nrV(H(br.xc-11,br.y0+1.75,-7),H(br.xc+16,br.y0+1.3,5));
  {const S=NR.BRIDGEHOUSE.storeys[0],St=NR.BRIDGEHOUSE.stair;V["Inside the bridge house: the officers' hall"]=nrV(H(S.xc-26,S.y0+1.7,-14),H(S.xc+6,S.y0+1.2,6));
   V['Plan: the bridge house, the chart deck']=nrV(H(S.xc-40,S.y0+44,-30),H(S.xc,S.y0+4,0),{cut:cutAt('Bridge house: the chart')});
   V['The spiral stair to the bridge']=nrV(H(St.x-10,St.y0+1.7,-8),H(St.x,St.y0+5.5,0));}
  {const T=NR.TIERS[0];V['Inside the forward hall']=nrV(H(T.apex+4,L.D[0]+1.7,-30),H(T.apex+30,L.D[0]+1.2,10));
   const S=NR.BRIDGEHOUSE.storeys[2];V["Plan: the officers' berths"]=nrV(H(S.xc-36,S.y0+38,-34),H(S.xc,S.y0,0),{cut:cutAt('Bridge house: the berths')});
   const c=NR.at(-20,NR.W.MAIN+3.4),a=NR.at(10,NR.W.MAIN+3.6);V['Inside the chain locker']=nrV(H(c[0],L.D[0]+1.7,c[1]),H(a[0],L.D[0]+1.0,a[1]));}
  {const e=NR.at(NR.T1+3,-9.75),a=NR.at(NR.T1+18,4);V['The stern lounge (D3)']=nrV(nrH2W(e[0],L.D[2]+1.7,e[1]),nrH2W(a[0],L.D[2]+1.0,a[1]));}
  V['Plan: the bridge']=nrV(H(br.xc-34,br.y0+30,-30),H(br.xc,br.y0,0),{cut:cutAt('The bridge')});
  V["Plan: Ruephus's headquarters"]=nrV(H(hq.x-32,L.D[0]+30,-28),H(hq.x,L.D[0],0),{cut:cutAt('D1')});}
 V['The top deck: the promenade']=nrV(nrHP(52,-16.5,L.TOP+1.7),nrHP(96,-6,L.TOP+5));
 V['The stern of the starboard hull: the twin funnels']=nrV(nrHP(NR.T1-110,-70,L.TOP+40),nrHP(NR.T1-34,0,L.TOP+6));
 {const G=zone('greenhouse');V['The greenhouse under its glass']=nrV(nrHP(G.t0+3,-12,L.D[3]+2.2),nrHP(G.t1-4,6,L.D[3]+1.2));
  V['The greenhouse vault on the top deck']=nrV(nrHP(G.t0-40,-46,L.TOP+22),nrHP(G.tc,0,L.TOP+3));}
 {const Z=zone('dining');V['The garden over the dining room']=nrV(nrHP(Z.tc-40,-40,L.TOP+18),nrHP(Z.tc,0,L.TOP+2));}
 V['The atrium: the grand stair']=nrV(nrHP(PQ-17,-1,L.D[0]+1.7),nrHP(PQ+6,0,L.D[1]+3));
 V['The atrium from the dome gallery']=nrV(nrHP(PQ-15,-14.9,L.TOP+2.0),nrHP(PQ+12,5,L.D[1]));
 V['The bow: the forecastle and the stem']=nrV(nrHP(-30,95,L.D[0]+14),nrHP(3,24,L.D[1]+1));
 {const M=NR.PIERS.find(p=>p.kind==='mole'),e=nrPierPt(M,M.len+40,-34,L.D[0]+16),a=nrPierPt(M,M.len*.45,0,L.D[0]);
  V['The liner mole']=nrV(nrH2W(e[0],e[1],e[2]),nrH2W(a[0],a[1],a[2]));}
 V['The inner quay and a float']=nrV(nrHP(280,-62,L.D[0]+6),nrHP(300,-26,L.D[0]));
 {const Z=zone('dining');V['Plan: the grand dining room']=nrV(nrHP(Z.tc-44,30,L.D[2]+38),nrHP(Z.tc,0,L.D[2]),{cut:cutAt('Dining')});}
 for(const [id,nm] of [['engine-s','starboard'],['engine-p','port']]){const Z=zone(id);V['Plan: the '+nm+' engine room']=nrV(nrHP(Z.tc-Z.aft*50,-30,L.D[0]+36),nrHP(Z.tc,0,L.D[0]),{cut:cutAt('D2')});}
 {const Z=zone('mess-s');V['Plan: the starboard crew mess and galley']=nrV(nrHP(Z.tc-30,-34,L.D[2]+30),nrHP(Z.t1,0,L.D[2]),{cut:cutAt('D3')});}
 {const Z=zone('greenhouse');V['Plan: the greenhouse']=nrV(nrHP(Z.tc-36,-30,L.D[3]+34),nrHP(Z.tc,0,L.D[3]),{cut:cutAt('D4')});}
 {const R=room('carpenter'),B=room('brig');V["Plan: the ship's rooms (the carpenter's shop, the brig)"]=nrV(nrHP(R.tc-26,-30,L.D[2]+30),nrHP((R.tc+B.tc)/2,0,L.D[2]),{cut:cutAt('D3')});}
 {const R=room('wardroom'),C=room('chartroom');V["Plan: the wardroom and the chart room (D4)"]=nrV(nrHP(R.tc+30,-28,L.D[3]+28),nrHP((R.tc+C.tc)/2,0,L.D[3]),{cut:cutAt('D4')});}
 V['Plan: the holds']=nrV(nrHP(PQ+90,-40,L.MEZZ+30),nrHP(PQ+60,0,L.HOLD),{cut:cutAt('Holds')});
 V['Plan: D3 crew cabins']=nrV(nrHP(-200,-34,L.D[2]+26),nrHP(-176,6,L.D[2]),{cut:cutAt('D3')});
 V["Plan: D4 officers' cabins"]=nrV(nrHP(-110,30,L.D[3]+26),nrHP(-84,-6,L.D[3]),{cut:cutAt('D4')});
 V['Plan: D1, stripped']=nrV(nrHP(380,-30,L.D[0]+24),nrHP(360,4,L.D[0]),{cut:cutAt('D1')});
 V['Inside: a D3 cabin']=nrV(nrHP(201.6,14,L.D[2]+1.6),nrHP(202.2,18.2,L.D[2]+.9));
 const a2=lot('lot-a2'),o2=lot('lot-o2');
 V['Plan: a barracks (storey 2)']=nrV(nrHP(a2.t-26,24,L.TOP+30),nrHP(a2.t,0,L.TOP+NR_STOREY),{cut:cutAt('Top deck: storey 2')});
 V['Plan: the mess hall']=nrV(nrHP(o2.t-24,26,L.TOP+28),nrHP(o2.t,0,L.TOP),{cut:cutAt('Top deck: ground')});

 V['Night: the pirate port']=nrV([330,170,-380],[-10,10,30],{night:true});
 return V;}
// ---------------------------------------------------------------- where a point is (the inspector, the HUD)
function nrDeckOf(y){const L=NR.L;if(y<L.D[0])return y<L.MEZZ?'the holds':'the hold mezzanine';if(y>=L.TOP-.05)return 'the top deck';for(let d=3;d>=0;d--)if(y>=L.D[d]-.05)return 'D'+(d+1);return '?';}
function nrWhere(p){const h=nrW2H(p.x,p.y,p.z),q=NR.ringST(h[0],h[2]);
 /* the fore first: the bridge, the bridge house, the terraces, the plaza */
 {const B=NR.BRIDGEHOUSE,y=h[1]+.3;if(NR.inPoly(B.bridge.poly,h[0],h[2])&&y>=B.bridge.y0)return 'the bridge';
  for(const S of B.storeys.slice().reverse())if(NR.inPoly(S.poly,h[0],h[2])&&y>=S.y0){if(S.k===2){const C=B.berths.cabins.find(C=>NR.inPoly(C.poly,h[0],h[2]));if(C)return B.name+' · '+C.id;}
   return B.name+' · '+["the officers' hall",'the chart and signal deck',"the officers' berths",'the lookout lounge'][S.k];}
  if(NR.inPoly(NR.PLAZA.poly,h[0],h[2])&&y>=NR.L.D[0]&&y<NR.L.TOP+1){for(const H of NR.FORE_HALLS.slice().reverse())if(y>=H.y0&&NR.inPoly(NR.TIERS[H.tier].poly,h[0],h[2]))return H.name;return NR.PLAZA.name;}}
 if(!q.inRing||Math.abs(q.s)>NR.W.PONT+.5){const Pr=NR.pierAt(h[0],h[2]);return Pr?Pr.name+'  (pier '+Pr.id.replace('pier-','')+')':'outside the hull';}
 const deck=nrDeckOf(h[1]+.3),a=Math.abs(q.s);let what='';
 for(const Z of NR.ZONES.concat(NR.ROOMS)){const d=NR.L.D.findIndex((y,i)=>h[1]+.3>=y&&(i===3||h[1]+.3<NR.L.D[i+1]));if(q.t>=Z.t0&&q.t<=Z.t1&&Z.decks.indexOf(d)>=0&&q.s>=Z.s0&&q.s<=Z.s1)what=Z.name;}
 if(!what&&h[1]<NR.L.TOP&&h[1]>=NR.L.D[0]-.1){if(a>NR.W.MAIN)what=q.s>0?(Math.abs(q.t)<NR.FORE.t?'the forecastle':'the outer promenade'):'the inner quay';else if(a>=NR.W.CAB){const C=NR.cabins.find(c=>q.t>=c.t0&&q.t<c.t1&&c.side===(q.s>0?1:-1)&&NR.L.D[c.deck]<=h[1]+.3&&h[1]+.3<NR.L.D[c.deck]+NR.L.DH);what=C?'cabin '+C.id+(C.kind?' ('+C.kind+')':' (empty)'):'cabins';}
  else if(a>=NR.W.COR)what='the corridor';else{const C=NR.CORES.find(c=>Math.abs(q.t-c.t)<4);what=C?'stair core '+C.id:'the service core';}}
 return deck+(what?' · '+what:'')+'  (t '+q.t.toFixed(0)+', s '+q.s.toFixed(1)+')';}
function nrHudWhere(){const p=WALK.on?camera.position:ctl.target;return nrWhere(p);}
function nrInsideHull(p){const h=nrW2H(p.x,p.y,p.z),q=NR.ringST(h[0],h[2]);return q.inRing&&Math.abs(q.s)<NR.W.PONT+1&&h[1]>-1&&h[1]<NR.L.TOP+2;}
// ---------------------------------------------------------------- the walk floors: every level under a point (hull y), as world y
function nrFloorsAt(x,z){const h=nrW2H(x,0,z),q=NR.ringST(h[0],h[2]),L=NR.L,W=NR.W,F=[];
 /* the fore (43): the plaza, the terraces' tops, the bridge house's terraces, the bridge */
 for(const y of NR.foreFloors(h[0],h[2]))F.push(y);
 /* the rounded sterns (40): the pontoon's deck, the galleries and terraces */
 for(const y of NR.sternFloors(h[0],h[2]))F.push(y);
 /* the piers (41): one deck, level with the quays */
 if(!(q.inRing&&Math.abs(q.s)<=W.PONT)&&NR.pierAt(h[0],h[2]))F.push(L.D[0]);
 /* the forecastle's deck climbs over the outer promenade round the bow */
 if(q.inRing&&q.s>W.MAIN&&q.s<=W.PONT+1.2&&Math.abs(q.t)<NR.FORE.t)F.push(NR.foreY(q.t));
 if(q.inRing&&Math.abs(q.s)<=W.PONT){const a=Math.abs(q.s),A=NR.ATRIUM,inVoid=Math.abs(q.t-A.tc)<A.voidT&&a<A.voidS;
  if(a<W.SKIN)F.push(L.HOLD);if(a>=W.MEZZ&&a<W.SKIN)F.push(L.MEZZ);
  F.push(L.D[0]);   /* (under the forecastle: the chain locker's floor) */
  /* the balconies of D3 and D4 swell out between the frames (40 nrScallop) */
  if(a>W.MAIN&&a<=W.MAIN+nrScallop(q.t))F.push(L.D[2],L.D[3]);
  if(a<=W.MAIN){for(let d=1;d<=4;d++){const y=d<4?L.D[d]:L.TOP;if(inVoid)continue;
    if(NR.CORES.some(c=>Math.abs(q.t-c.t)<3.5&&a<6))continue;
    /* no floor where a room is double height (its decks d-1 and d), nor on the top deck over the greenhouse's glass */
    if(NR.ZONES.some(Z=>Z.kind!=='atrium'&&q.t>Z.t0&&q.t<Z.t1&&q.s>Z.s0&&q.s<Z.s1&&((d<4&&Z.decks.indexOf(d-1)>=0&&Z.decks.indexOf(d)>=0)||(d===4&&Z.roof==='glass'))))continue;F.push(y);}
   for(const B of NR_BUILT){const lx=(h[0]-B.x)*Math.cos(B.ry)-(h[2]-B.z)*Math.sin(B.ry),lz=(h[0]-B.x)*Math.sin(B.ry)+(h[2]-B.z)*Math.cos(B.ry);
    if(Math.abs(lx)<B.w/2&&Math.abs(lz)<B.d/2)for(const fy of B.floors)F.push(fy);}}}
 return F.map(y=>nrH2W(h[0],y,h[2])[1]);}
function nrFloorBelow(x,y,z){const F=nrFloorsAt(x,z).filter(f=>f<=y+.45);const g=terrainH(x,z);return F.length?Math.max(...F,g>y+.45?-1e9:g):Math.max(g,-30);}
function nrFloorStep(x,feet,z,dir){const F=nrFloorsAt(x,z).concat([terrainH(x,z)]).sort((a,b)=>a-b);
 if(dir>0){const up=F.find(f=>f>feet+.5);return up===undefined?feet:up;}const dn=F.filter(f=>f<feet-.5);return dn.length?dn[dn.length-1]:feet;}
