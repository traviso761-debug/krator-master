// TARGET: city — camera presets. [camX,camY,camZ, targetX,targetY,targetZ, hour?]; the first entry is the opening shot.
const _ysEye=(x,z,tx,tz,h)=>[x,Math.max(terrainH(x,z),0)+1.7,z,tx,Math.max(terrainH(tx,tz),0)+(h||3),tz];
const VIEWS={
 'Opening — the bay from the head of the shore':[CITY.HEAD[0]-240,48,CITY.HEAD[1]-170,CITY.HEAD[0]+520,0,CITY.HEAD[1]+440],
 'Overview':[-900,1500,1500,400,0,-100],
 'The bay from the sea':[1300,220,700,350,10,-150],
 'The shore at eye level':_ysEye(120,-380,600,-100,3),
 'Night on the water':[1000,60,500,200,8,-200,22.2],
 'The river terraces':[-330,30,380,-620,8,110],
 'The Citadel stack from the water':[1150,30,950,842,40,652],
 'The layout from above':[820,1500,101,820,0,100],
 'The drowned grid from the south-east':[1500,260,900,850,0,100],
 'The head of the bay — compass':[CITY.HEAD[0]+260,140,CITY.HEAD[1]+260,CITY.HEAD[0],4,CITY.HEAD[1],null,true],
};
// the placed city (88): presets found from the records, so they follow the placement
(function(){const N=LAYOUT.N,T=LAYOUT.T,A=LAYOUT.A,H=CITY.HEAD;const V=VIEWS;
 V['The Amphitriton across the water']=[A.x-N[0]*230+T[0]*90,34,A.z-N[1]*230+T[1]*90,A.x,30,A.z];
 const h=PLACE.hosts.find(h=>!h.full&&h.cls==='tall'&&h.pods.length>1)||PLACE.hosts[0];
 if(h){const p=h.pods[0];const c=Math.cos(p.a+.5),s=Math.sin(p.a+.5);const r=h.rAt(p.y,p.a);V['A stump and its pods']=[h.x+c*(r+75),p.y+22,h.z+s*(r+75),h.x,p.y+4,h.z];}
 V['The main market']=[H[0]+N[0]*150-T[0]*110,55,H[1]+N[1]*150-T[1]*110,H[0],4,H[1]];
 {const r=PLACE.blds.find(r=>/^hyk_house_rich/.test(r.key));if(r){const f=[Math.sin(r.ry),Math.cos(r.ry)],x=[Math.cos(r.ry),-Math.sin(r.ry)];V['A rich house']=[r.x+f[0]*34+x[0]*14,r.y+13,r.z+f[1]*34+x[1]*14,r.x,r.y+4,r.z];}}
 const ph=PLACE.hosts.find(h=>/Pharos/.test(h.n));if(ph)V['The Pharos']=[ph.x-N[0]*260+T[0]*120,ph.top-10,ph.z-N[1]*260+T[1]*120,ph.x,ph.top-40,ph.z];
 {const r=PLACE.blds.find(r=>r.key==='hyk_navigators_guild')||PLACE.blds.find(r=>r.why==='civilian harbour');if(r)V['The civilian harbour']=[r.x+N[0]*140+T[0]*90,38,r.z+N[1]*140+T[1]*90,r.x,4,r.z];}
 {const r=PLACE.blds.find(r=>r.why==='home-grown mole');if(r){const m=PLACE.moles.find(m=>/home-grown/.test(m.name)&&ysPlInPoly(m.poly,r.x,r.z));const cx=m?(m.x0+m.x1)/2:r.x,cz=m?(m.z0+m.z1)/2:r.z;V['A home-grown mole']=[cx+N[0]*120+T[0]*80,45,cz+N[1]*120+T[1]*80,cx,3,cz];}}
})();
