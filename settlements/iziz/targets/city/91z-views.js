// TARGET: city — camera presets. [camX,camY,camZ, targetX,targetY,targetZ]
const _P=CITY.HILLS.palace,_T=CITY.HILLS.temple,_A=CITY.HILLS.arena,_G1=gatePos(GATES[0]);
const _eye=(x,z,tx,tz)=>[x,terrainH(x,z)+1.7,z,tx,terrainH(tx,tz)+4,tz];
const VIEWS={
 'Opening — from the south approach':[_G1[0]*1.55,150,_G1[1]*1.55,60,60,-20],
 'Overview':[0,1150,900,0,0,0],
 'Palace hill':[_P.x+300,_P.top+170,_P.z+240,_P.x,_P.top+20,_P.z],
 'Palace — triumphal plaza':(()=>{const g=_P.gate,c=Math.cos(g),s=Math.sin(g);return[_P.x+78*c-16*s,_P.top+3,_P.z+78*s+16*c,_P.x+20*c,_P.top+30,_P.z+20*s];})(),
 'Palace — the hall and terrace':(()=>{const g=_P.gate,c=Math.cos(g),s=Math.sin(g);return[_P.x+84*c-30*s,_P.top+46,_P.z+84*s+30*c,_P.x-14*c,_P.top+34,_P.z-14*s];})(),
 'Temple hill':[_T.x-240,_T.top+120,_T.z-220,_T.x,_T.top+10,_T.z],
 'Arena hill':[_A.x+300,_A.top+140,_A.z+260,_A.x,_A.top+10,_A.z],
 'Amphitheatre':[AMPH.x+140,90,AMPH.z+160,AMPH.x,20,AMPH.z],
 'South gate — from the causeway':[_G1[0]*1.46+30,44,_G1[1]*1.46,_G1[0],28,_G1[1]],
 'Reclaimed quarter — street':_eye(60,80,150,-40),
 'Ruined quarter — eye level':_eye(-60,-300,-60,-380),
 // a poor house whose camera spot (9 m out from its front) is on a street and clear of every plot — it used to take the
 // 37th-percentile house whatever, and on some seeds the camera stood inside a yard fence
 'Settler streets — eye level':(()=>{const h=VERN_PLACED.filter(v=>/vern_house_poor/.test(v.key));const k0=Math.floor(h.length*.37);
  for(let i=0;i<h.length;i++){const v=h[(k0+i)%h.length],o=v.o;const f=loc(o.x,o.z,0,o.hz+9,o.ry);if(!isRoad(f[0],f[1]))continue;if(!occFree({x:f[0],z:f[1],hx:.6,hz:.6,ry:0},.4))continue;
   const t=loc(o.x,o.z,-30,o.hz+6,o.ry);return _eye(f[0],f[1],t[0],t[1]);}return _eye(0,0,10,10);})(),
 'The moat and the jungle':[760,60,444,560,30,323],   // out with the wall (round 4)
 'Spaceport (ruined)':[SPORT.x+160,90,SPORT.z+140,SPORT.x,10,SPORT.z],
 'Observation tower':[NEEDLE.x+140,_A.top+90,NEEDLE.z+120,NEEDLE.x,_A.top+40,NEEDLE.z],
};
// deliberate towers: resolved after the build (91z runs after 90b)
if(window._project){const p=window._project;const l=Math.hypot(p[0],p[1])||1;VIEWS['The Project']=[p[0]-p[0]/l*85+20,45,p[1]-p[1]/l*85,p[0],50,p[1]];}
if(window._toppled){const t=window._toppled;VIEWS['Toppled Skyscraper B']=[t.x+90,60,t.z-90,t.x,20,t.z];}
{const a=AMPH;VIEWS['Amphitheatre — seating']=[a.x-20,CITY.PLATEAU+16,a.z-8,a.x,CITY.PLATEAU+10,a.z+30];}
{const f=OCC.list.find(o=>o.built==='toppled'&&o.z<0);if(f)VIEWS['Toppled Skyscraper F']=[f.x+30,150,f.z+10,f.x,18,f.z-20];}
{const m=REG.find(r=>r.key==='city_tripod_market');if(m)VIEWS['Tripod market']=[m.x+45,m.y+22,m.z+45,m.x,m.y+6,m.z];}
{const m=REG.filter(r=>r.key==='city_tripod_market').find(r=>Math.hypot(r.x+19,r.z-282)<20);if(m)VIEWS['Tripod market (west)']=[m.x+50,m.y+30,m.z+46,m.x,m.y+4,m.z];}
{const H=_P,g=H.gate,c=Math.cos(g),s=Math.sin(g);VIEWS['Palace — grand entrance']=[H.x+56*c-24*s,H.top+6,H.z+56*s+24*c,H.x+25*c,H.top+7,H.z+25*s];}
{const f=OCC.list.find(o=>o.piece===2);if(f)VIEWS['Toppled F — the break']=[f.x+70,95,f.z+40,f.x-6,20,f.z-14];}
{const g=GATES[0],R=(coreR(g)+wallR(g))/2;VIEWS['Farm belt (south)']=[(R+140)*Math.cos(g+.18),150,(R+140)*Math.sin(g+.18),R*Math.cos(g+.1),22,R*Math.sin(g+.1)];}
{const o=REG.find(r=>r.key==='atmos_outfall');if(o){const c=o.x/Math.hypot(o.x,o.z),s=o.z/Math.hypot(o.x,o.z);VIEWS['Sewer outfall']=[o.x+c*34-s*16,o.y+8,o.z+s*34+c*16,o.x,o.y-2,o.z];}}
{const g=GATES[0],R=wallR(g);VIEWS['Evening — the south gate road']=[(R-70)*Math.cos(g)+14,CITY.PLATEAU+9,(R-70)*Math.sin(g),(R+40)*Math.cos(g),CITY.PLATEAU+6,(R+40)*Math.sin(g)];}
{const p=PARKS[0];if(p)VIEWS['Park fountain']=[p.x+16,terrainH(p.x,p.z)+4,p.z+12,p.x,terrainH(p.x,p.z)+2,p.z];}
{const h=REG.find(r=>/honeycomb/.test(r.name));if(h)VIEWS['Honeycomb rows']=[h.x+90,70,h.z+90,h.x,15,h.z];}
