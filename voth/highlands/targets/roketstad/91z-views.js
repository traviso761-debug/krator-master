// TARGET: roketstad — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (91z runs after 90b: the plots exist)
const _ty=(x,z)=>terrainH(x,z);
const _eye=(x,z,tx,tz)=>[x,_ty(x,z)+1.7,z,tx,_ty(tx,tz)+4,tz];
const _sq=SQUARES.main,_mk=SQUARES.market,_tp=SQUARES.temple,_gE=gatePos(RK.GATES.E),_gN=gatePos(RK.GATES.N),_gS=gatePos(RK.GATES.S);
const _plot=k=>{const P=PLOTS.find(p=>p.key===k);return P?P.o:null;};
const _near=(o,d,h,ang)=>{if(!o)return null;const a=(ang==null?o.ry:ang);const c=loc(o.x,o.z,0,d,a);return[c[0],_ty(o.x,o.z)+h,c[1],o.x,_ty(o.x,o.z)+8,o.z];};
const VIEWS={
 'Opening — Roketstad from the port road':[_gE[0]+330,_ty(_gE[0],_gE[1])+70,_gE[1]+120,TC.x+40,TC.H+20,TC.z],
 'Overview':[TC.x+300,780,TC.z+1250,(TC.x+PC.x)/2,20,0],
 'The town from above':[TC.x+120,420,TC.z+520,TC.x,30,TC.z],
 'Main square':[_sq.x+70,_sq.y+26,_sq.z+62,_sq.x,_sq.y+4,_sq.z],
 'Main square — eye level':_eye(_sq.x+30,_sq.z+26,_sq.x-20,_sq.z-30),
 'Market square':[_mk.x+50,_mk.y+24,_mk.z+44,_mk.x,_mk.y+4,_mk.z],
 'Temple square':[_tp.x+48,_tp.y+24,_tp.z-44,_tp.x,_tp.y+4,_tp.z],
 'Forge district':(()=>{const p=townPt(0,230);return[p[0]+60,_ty(p[0],p[1])+90,p[1]+150,p[0],_ty(p[0],p[1])+6,p[1]];})(),
 'East gate — the port road':[_gE[0]+140,_ty(_gE[0],_gE[1])+36,_gE[1]+40,_gE[0],_ty(_gE[0],_gE[1])+10,_gE[1]],
 'North gate':[_gN[0]+40,_ty(_gN[0],_gN[1])+34,_gN[1]-150,_gN[0],_ty(_gN[0],_gN[1])+10,_gN[1]],
 'South gate':[_gS[0]-30,_ty(_gS[0],_gS[1])+34,_gS[1]+150,_gS[0],_ty(_gS[0],_gS[1])+10,_gS[1]],
 'Streets — eye level':(()=>{const h=VERN_PLACED.filter(v=>/house_(poor|mid)/.test(v.key)&&insideWall(v.o.x,v.o.z,60));const v=h[Math.floor(h.length*.41)]||h[0];if(!v)return _eye(TC.x+100,TC.z,TC.x,TC.z);const o=v.o;const f=loc(o.x,o.z,0,o.hz+7,o.ry),t=loc(o.x,o.z,-30,o.hz+5,o.ry);return _eye(f[0],f[1],t[0],t[1]);})(),
 'The spaceport':[PC.x-420,PORT_Y+300,PC.z+520,PC.x,PORT_Y+20,PC.z],
 'The Starport':[PC.x-150,PORT_Y+70,PC.z+140,PC.x,PORT_Y+14,PC.z],
 'The arcology that never flew':(()=>{const P=PENT[0];return[P.x-260,PORT_Y+120,P.z+230,P.x,PORT_Y+80,P.z];})(),
 'An empty launch pad':(()=>{const P=PENT[2];return[P.x-60,PORT_Y+90,P.z+220,P.x,PORT_Y,P.z];})(),
 'Farms on the south road':(()=>{const p=HIGHWAY.S.out[Math.floor(HIGHWAY.S.out.length*.45)];return[p[0]+200,_ty(p[0],p[1])+120,p[1]+140,p[0],_ty(p[0],p[1]),p[1]];})(),
 'The Inner Wall':[TC.x-200,TC.H+60,TC.z+60,TC.x+2000,300,TC.z],
};
{const g=_plot('hl_rep_guild_mech');if(g)VIEWS["Mechanics' Guild clocktower"]=_near(g,40,14);}
{const g=_plot('hl_rep_town_hall');if(g)VIEWS['Town hall']=_near(g,45,16);}
{const g=_plot('hl_rep_guild_astro');if(g)VIEWS["Astronomers' Guild"]=_near(g,40,16);}
{const g=_plot('hl_rep_forgehouse');if(g)VIEWS['The Forgehouse']=_near(g,50,18);}
{const s=VERN_PLACED.find(v=>v.key==='hl_rep_guild_scav');if(s)VIEWS["Scavengers' Guild"]=_near(s.o,42,14);}
for(const k in VIEWS)if(!VIEWS[k])delete VIEWS[k];
