// ================================================================= VIEWS, WHERE-AM-I and the WALK FLOORS (read the plan, draw nothing)
// A view is [cx, cy, cz, tx, ty, tz, {cut, night}] in WORLD metres; the interior ones are written in the hull frame (t, s,
// height) and carried to the world by NR_HULL. `cut` is a hull-frame height (92-camera.js NR_LEVELS) or null.
/* the deck cut's levels (92-camera.js): a name and a hull-frame height, or null for off */
const NR_LEVELS=[['off',null],['Holds (mezzanine)',NR.L.MEZZ+3.0],['D1 - stripped',NR.L.D[0]+2.2],['D2 - stripped',NR.L.D[1]+2.2],
 ['D3 - crew cabins',NR.L.D[2]+2.2],['D4 - officers, bridge',NR.L.D[3]+2.2],['Dining room (D3-D4)',NR.L.D[2]+5.6],['Top deck: ground floors',NR.L.TOP+2.4]];
for(let k=1;k<=5;k++)NR_LEVELS.push(['Top deck: storey '+(k+1),NR.L.TOP+.25+k*NR_STOREY+2.2]);
function nrHP(t,s,y){const p=NR.at(t,s);return nrH2W(p[0],y,p[1]);}
function nrV(eye,at,opt){return eye.concat(at,[opt||{}]);}
function nrViews(){const L=NR.L,PQ=NR.PQ,PH=NR.PH,lot=id=>NR.LOTS.find(l=>l.id===id),V={};
 const cutAt=name=>{const q=NR_LEVELS.find(l=>l[0].startsWith(name));return q?q[1]:null;};
 V["Opening: the harbour from the north-east"]=nrV([420,250,-470],[-10,8,10]);
 V['From the sea: the harbour mouth']=nrV([-40,22,-560],[-5,14,-150]);
 V['The beach: the starboard hull']=nrV(nrHP(PQ-30,92,L.TOP-12),nrHP(PQ+10,20,L.D[0]+6));
 V["The bow: Ruephus's headquarters"]=nrV(nrHP(-40,90,L.TOP+38),nrHP(4,0,L.TOP+16));
 V['The top deck: the promenade']=nrV(nrHP(52,-16.5,L.TOP+1.7),nrHP(96,-6,L.TOP+5));
 V['The stern: funnels and garden']=nrV(nrHP(PH-90,-70,L.TOP+40),nrHP(PH,0,L.TOP+6));
 V['The atrium: the grand stair']=nrV(nrHP(PQ-17,-1,L.D[0]+1.7),nrHP(PQ+6,0,L.D[1]+3));
 V['The atrium from the dome gallery']=nrV(nrHP(PQ-15,-14.9,L.TOP+2.0),nrHP(PQ+12,5,L.D[1]));
 V['The inner quay and a float']=nrV(nrHP(42,-60,L.D[0]+6),nrHP(62,-26,L.D[0]));
 V['Plan: the bridge (D4)']=nrV(nrHP(-26,-30,L.D[3]+34),nrHP(0,6,L.D[3]),{cut:cutAt('D4')});
 V['Plan: the grand dining room']=nrV(nrHP(PH+44,30,L.D[2]+38),nrHP(PH,0,L.D[2]),{cut:cutAt('Dining')});
 V['Plan: the engine room']=nrV(nrHP(PH-50,-30,L.D[0]+36),nrHP(PH,0,L.D[0]),{cut:cutAt('D2')});
 V['Plan: the holds']=nrV(nrHP(PQ+90,-40,L.MEZZ+30),nrHP(PQ+60,0,L.HOLD),{cut:cutAt('Holds')});
 V['Plan: D3 crew cabins']=nrV(nrHP(150,-34,L.D[2]+26),nrHP(176,6,L.D[2]),{cut:cutAt('D3')});
 V["Plan: D4 officers' cabins"]=nrV(nrHP(-110,30,L.D[3]+26),nrHP(-84,-6,L.D[3]),{cut:cutAt('D4')});
 V['Plan: D1, stripped']=nrV(nrHP(380,-30,L.D[0]+24),nrHP(400,4,L.D[0]),{cut:cutAt('D1')});
 V['Inside: a D3 cabin']=nrV(nrHP(201.6,14,L.D[2]+1.6),nrHP(202.2,18.2,L.D[2]+.9));
 const a2=lot('lot-a2'),o2=lot('lot-o2'),hq=lot('lot-hq');
 V['Plan: a barracks (storey 2)']=nrV(nrHP(a2.t-26,24,L.TOP+30),nrHP(a2.t,0,L.TOP+NR_STOREY),{cut:cutAt('Top deck: storey 2')});
 V['Plan: the mess hall']=nrV(nrHP(o2.t-24,26,L.TOP+28),nrHP(o2.t,0,L.TOP),{cut:cutAt('Top deck: ground')});
 V["Plan: Ruephus's headquarters"]=nrV(nrHP(hq.t-26,-30,L.TOP+30),nrHP(hq.t,0,L.TOP),{cut:cutAt('Top deck: ground')});
 V['Night: the pirate port']=nrV([330,170,-380],[-10,10,30],{night:true});
 return V;}
// ---------------------------------------------------------------- where a point is (the inspector, the HUD)
function nrDeckOf(y){const L=NR.L;if(y<L.D[0])return y<L.MEZZ?'the holds':'the hold mezzanine';if(y>=L.TOP-.05)return 'the top deck';for(let d=3;d>=0;d--)if(y>=L.D[d]-.05)return 'D'+(d+1);return '?';}
function nrWhere(p){const h=nrW2H(p.x,p.y,p.z),q=NR.ringST(h[0],h[2]);if(!q.inRing||Math.abs(q.s)>NR.W.PONT+.5)return 'outside the hull';
 const deck=nrDeckOf(h[1]+.3),a=Math.abs(q.s);let what='';
 for(const Z of NR.ZONES){const d=NR.L.D.findIndex((y,i)=>h[1]+.3>=y&&(i===3||h[1]+.3<NR.L.D[i+1]));if(q.t>=Z.t0&&q.t<=Z.t1&&Z.decks.indexOf(d)>=0&&q.s>=Z.s0&&q.s<=Z.s1)what=Z.name;}
 if(!what&&h[1]<NR.L.TOP&&h[1]>=NR.L.D[0]-.1){if(a>NR.W.MAIN)what=q.s>0?'the outer promenade':'the inner quay';else if(a>=NR.W.CAB){const C=NR.cabins.find(c=>q.t>=c.t0&&q.t<c.t1&&c.side===(q.s>0?1:-1)&&NR.L.D[c.deck]<=h[1]+.3&&h[1]+.3<NR.L.D[c.deck]+NR.L.DH);what=C?'cabin '+C.id+(C.kind?' ('+C.kind+')':' (empty)'):'cabins';}
  else if(a>=NR.W.COR)what='the corridor';else{const C=NR.CORES.find(c=>Math.abs(q.t-c.t)<4);what=C?'stair core '+C.id:'the service core';}}
 return deck+(what?' · '+what:'')+'  (t '+q.t.toFixed(0)+', s '+q.s.toFixed(1)+')';}
function nrHudWhere(){const p=WALK.on?camera.position:ctl.target;return nrWhere(p);}
function nrInsideHull(p){const h=nrW2H(p.x,p.y,p.z),q=NR.ringST(h[0],h[2]);return q.inRing&&Math.abs(q.s)<NR.W.PONT+1&&h[1]>-1&&h[1]<NR.L.TOP+2;}
// ---------------------------------------------------------------- the walk floors: every level under a point (hull y), as world y
function nrFloorsAt(x,z){const h=nrW2H(x,0,z),q=NR.ringST(h[0],h[2]),L=NR.L,W=NR.W,F=[];
 if(q.inRing&&Math.abs(q.s)<=W.PONT){const a=Math.abs(q.s),A=NR.ATRIUM,inVoid=Math.abs(q.t-A.tc)<A.voidT&&a<A.voidS;
  if(a<W.SKIN)F.push(L.HOLD);if(a>=W.MEZZ&&a<W.SKIN)F.push(L.MEZZ);
  F.push(L.D[0]);
  if(a<=W.MAIN){for(let d=1;d<=4;d++){const y=d<4?L.D[d]:L.TOP;if(inVoid)continue;
    if(NR.CORES.some(c=>Math.abs(q.t-c.t)<3.5&&a<6))continue;
    if(d===1&&q.t>NR.zone('engine').t0&&q.t<NR.zone('engine').t1)continue;
    if(d===3&&q.t>NR.zone('dining').t0&&q.t<NR.zone('dining').t1)continue;F.push(y);}
   for(const B of NR_BUILT){const lx=(h[0]-B.x)*Math.cos(B.ry)-(h[2]-B.z)*Math.sin(B.ry),lz=(h[0]-B.x)*Math.sin(B.ry)+(h[2]-B.z)*Math.cos(B.ry);
    if(Math.abs(lx)<B.w/2&&Math.abs(lz)<B.d/2)for(const fy of B.floors)F.push(fy);}}}
 return F.map(y=>nrH2W(h[0],y,h[2])[1]);}
function nrFloorBelow(x,y,z){const F=nrFloorsAt(x,z).filter(f=>f<=y+.45);const g=terrainH(x,z);return F.length?Math.max(...F,g>y+.45?-1e9:g):Math.max(g,-30);}
function nrFloorStep(x,feet,z,dir){const F=nrFloorsAt(x,z).concat([terrainH(x,z)]).sort((a,b)=>a-b);
 if(dir>0){const up=F.find(f=>f>feet+.5);return up===undefined?feet:up;}const dn=F.filter(f=>f<feet-.5);return dn.length?dn[dn.length-1]:feet;}
