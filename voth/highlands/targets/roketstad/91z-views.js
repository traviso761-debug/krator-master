// TARGET: roketstad — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (91z runs after 90b: the plots exist)
const _ty=(x,z)=>terrainH(x,z);
const _eye=(x,z,tx,tz)=>[x,_ty(x,z)+1.7,z,tx,_ty(tx,tz)+4,tz];
const _sq=SQUARES.main,_mk=SQUARES.market,_tp=SQUARES.temple,_gE=gatePos(RK.GATES.E),_gN=gatePos(RK.GATES.N),_gS=gatePos(RK.GATES.S);
const _plot=k=>{const P=PLOTS.find(p=>p.key===k);return P?P.o:null;};
const _near=(o,d,h,ang)=>{if(!o)return null;const a=(ang==null?o.ry:ang);const c=loc(o.x,o.z,0,d,a);return[c[0],_ty(o.x,o.z)+h,c[1],o.x,_ty(o.x,o.z)+8,o.z];};
// round 10: a port-table site seen from its port side (toward the Starport), a little off square
const _fromPort=(r,d,h,side)=>{if(!r)return null;const a=Math.atan2(PC.z-r.z,PC.x-r.x)+(side||.45);return[r.x+d*Math.cos(a),PORT_Y+h,r.z+d*Math.sin(a),r.x,PORT_Y+6,r.z];};
const VIEWS={
 'Opening — Roketstad from the port road':[_gE[0]+150,PORT_Y+62,_gE[1]-95,TC.x+60,TC.H+24,TC.z],   // round 10: the old shot stood inside the never-flown arcology's scaffold
 'Overview':[TC.x+300,780,TC.z+1250,(TC.x+PC.x)/2,20,0],
 'The capital from above':[TC.x+150,760,TC.z+980,TC.x,30,TC.z],
 'The old town on the hill':[HILL.x+120,420,HILL.z+520,HILL.x,30,HILL.z],
 'Republic square':[SQUARES.republic.x+60,_ty(SQUARES.republic.x,SQUARES.republic.z)+30,SQUARES.republic.z+80,SQUARES.republic.x,_ty(SQUARES.republic.x,SQUARES.republic.z)+8,SQUARES.republic.z-30],
 'Main square':[_sq.x+70,_sq.y+26,_sq.z+62,_sq.x,_sq.y+4,_sq.z],
 'Main square — eye level':_eye(_sq.x+30,_sq.z+26,_sq.x-20,_sq.z-30),
 'Market square':[_mk.x+50,_mk.y+24,_mk.z+44,_mk.x,_mk.y+4,_mk.z],
 'Temple square':[_tp.x+48,_tp.y+24,_tp.z-44,_tp.x,_tp.y+4,_tp.z],
 'Scrap and industrial district':(()=>{const p=[60,40];return[p[0]-60,_ty(p[0],p[1])+140,p[1]+260,p[0]+20,_ty(p[0],p[1])+6,p[1]-20];})(),
 'East gate — the port gate':[_gE[0]+70,_ty(_gE[0],_gE[1])+26,_gE[1]+30,_gE[0],_ty(_gE[0],_gE[1])+10,_gE[1]],
 'North gate':[_gN[0]+40,_ty(_gN[0],_gN[1])+34,_gN[1]-150,_gN[0],_ty(_gN[0],_gN[1])+10,_gN[1]],
 'South gate':[_gS[0]-30,_ty(_gS[0],_gS[1])+34,_gS[1]+150,_gS[0],_ty(_gS[0],_gS[1])+10,_gS[1]],
 // round 10: stand in the street itself and look down it (the old shot stood off a house front and faced the next house)
 'Streets — eye level':(()=>{const h=VERN_PLACED.filter(v=>/house_(poor|mid)/.test(v.key)&&insideWall(v.o.x,v.o.z,60));const v=h[Math.floor(h.length*.41)]||h[0];if(!v)return _eye(TC.x+100,TC.z,TC.x,TC.z);const o=v.o;
  const n=nearestRoadPt(o.x,o.z);if(!n||!n.road.pts)return _eye(o.x,o.z,TC.x,TC.z);const P=n.road.pts;let i=0,bd=1e9;P.forEach((p,k)=>{const d=Math.hypot(p[0]-n.x,p[1]-n.z);if(d<bd){bd=d;i=k;}});
  const j=i+3<P.length?Math.min(P.length-1,i+4):Math.max(0,i-4);return _eye(n.x,n.z,P[j][0],P[j][1]);})(),
 'The spaceport':[PC.x-420,PORT_Y+300,PC.z+520,PC.x,PORT_Y+20,PC.z],
 'The Starport':[PC.x-150,PORT_Y+70,PC.z+140,PC.x,PORT_Y+14,PC.z],
 // round 10: the never-flown arcology stands on the pad NEAREST THE TOWN (90b); these two had it the wrong way round
 'The arcology that never flew':(()=>{const P=PENT.reduce((b,P)=>Math.hypot(P.x-TC.x,P.z-TC.z)<Math.hypot(b.x-TC.x,b.z-TC.z)?P:b);const a=Math.atan2(P.z-PC.z,P.x-PC.x)-.9;return[P.x+300*Math.cos(a),PORT_Y+130,P.z+300*Math.sin(a),P.x,PORT_Y+80,P.z];})(),
 'An empty launch pad':(()=>{const P=PENT.reduce((b,P)=>Math.hypot(P.x-TC.x,P.z-TC.z)>Math.hypot(b.x-TC.x,b.z-TC.z)?P:b);const a=Math.atan2(P.z-PC.z,P.x-PC.x)+.5;return[P.x+170*Math.cos(a),PORT_Y+80,P.z+170*Math.sin(a),P.x,PORT_Y+10,P.z];})(),
 'Farms on the south road':(()=>{const p=HIGHWAY.S.out[Math.floor(HIGHWAY.S.out.length*.45)];return[p[0]+200,_ty(p[0],p[1])+120,p[1]+140,p[0],_ty(p[0],p[1]),p[1]];})(),
 'The Inner Wall':[TC.x-200,TC.H+60,TC.z+60,TC.x+2000,300,TC.z],
};
{const g=_plot('hl_rep_guild_mech');if(g)VIEWS["Mechanics' Guild clocktower"]=_near(g,40,14);}
{const g=_plot('hl_rep_town_hall');if(g)VIEWS['Town hall']=_near(g,45,16);}
{const g=_plot('hl_rep_guild_astro');if(g)VIEWS["Astronomers' Guild"]=_near(g,40,16);}
{const g=_plot('hl_rep_forgehouse');if(g)VIEWS['The Forgehouse']=_near(g,95,40);}
{const g=_plot('hl_rep_hall_republic');if(g)VIEWS['Hall of the Republic']=_near(g,120,42);}
{const m=VERN_PLACED.find(v=>v.key==='hl_rep_muster');if(m)VIEWS['The Mustering ground']=_near(m.o,62,24);}
{const s=VERN_PLACED.find(v=>v.key==='hl_rep_guild_scav');if(s){VIEWS["Scavengers' Guild by the port gate"]=_near(s.o,78,30,s.o.ry+.5);VIEWS["Scavengers' yard — eye level"]=(()=>{const f=loc(s.o.x,s.o.z,16,34,s.o.ry),t=loc(s.o.x,s.o.z,18,0,s.o.ry);return[f[0],PORT_Y+1.7,f[1],t[0],PORT_Y+4,t[1]];})();}}
{const y=REG.filter(r=>r.key==='rk_scrapyard');const r=y[Math.floor(y.length*.6)];if(r)VIEWS['Scrap yards on the apron']=_fromPort(r,72,30,.3);}
{const r=REG.find(r=>r.key==='rk_silos');if(r)VIEWS['Ruined Ancient silos']=_fromPort(r,80,34);}
{const r=REG.find(r=>r.key==='rk_works');if(r)VIEWS['A ruined Ancient factory']=_fromPort(r,85,38,-.5);}
{const H=SAT.hub;VIEWS['The scrap town']=[H.x-70,PORT_Y+45,H.z+95,H.x,PORT_Y+2,H.z];VIEWS['The scrap town — eye level']=[H.x+6,terrainH(H.x+6,H.z+10)+1.7,H.z+10,H.x-10,terrainH(H.x,H.z)+4,H.z-18];}
{const b=REG.find(r=>r.key==='anc_bunker');if(b){const k=.16;VIEWS['A reclaimed bunker']=[b.x+(PC.x-b.x)*k+14,PORT_Y+26,b.z+(PC.z-b.z)*k+14,b.x,PORT_Y+4,b.z];}}
{const a=REG.find(r=>r.key==='anc_launch_ruined');if(a)VIEWS['The arcology from the town']=[TC.x+260,TC.H+60,TC.z+40,a.x,a.y+60,a.z];}
{const f=PLOTS.find(p=>p.key==='hl_rep_arco_quarter');if(f){const o=f.o,c=loc(o.x,o.z,105,80,o.ry),b=loc(o.x,o.z,0,95,o.ry);   // round 10: the ship lies stern (local +x) to the port; look along it off the stern quarter
  VIEWS['The Fallen Arcology — engines to the port']=[c[0],_ty(c[0],c[1])+30,c[1],o.x+8,_ty(o.x,o.z)+12,o.z];VIEWS['The Fallen Arcology — broadside']=[b[0],_ty(b[0],b[1])+18,b[1],o.x,_ty(o.x,o.z)+14,o.z];}}
{const g=gatePos(RK.GATES.W);VIEWS['West gate and the farms']=[g[0]-260,_ty(g[0],g[1])+80,g[1]+120,g[0],_ty(g[0],g[1])+8,g[1]];}
for(const k in VIEWS)if(!VIEWS[k])delete VIEWS[k];
