// TARGET: city — camera presets. [camX,camY,camZ, targetX,targetY,targetZ, hour?]; the first entry is the opening shot.
const _ysEye=(x,z,tx,tz,h)=>[x,Math.max(terrainH(x,z),0)+1.7,z,tx,Math.max(terrainH(tx,tz),0)+(h||3),tz];
const VIEWS={
 'Opening — the bay from the head of the shore':[CITY.HEAD[0]-240,48,CITY.HEAD[1]-170,CITY.HEAD[0]+520,0,CITY.HEAD[1]+440],
 'Overview':[-900,1500,1500,400,0,-100],
 'The bay from the sea':[1300,220,700,350,10,-150],
 'The shore at eye level':_ysEye(120,-380,600,-100,3),
 'Night on the water':[1000,60,500,200,8,-200,22.2],
 'The river terraces':[-330,30,380,-620,8,110],
 'The Citadel stack from the water':[CITY.STACKS[0].x+308,30,CITY.STACKS[0].z+298,CITY.STACKS[0].x,40,CITY.STACKS[0].z],
 'The layout from above':[(CITY.HEAD[0]+LAYOUT.A.x)/2,1100,(CITY.HEAD[1]+LAYOUT.A.z)/2+1,(CITY.HEAD[0]+LAYOUT.A.x)/2,0,(CITY.HEAD[1]+LAYOUT.A.z)/2],
 'The drowned grid from the south-east':[LAYOUT.A.x+420,200,LAYOUT.A.z+620,LAYOUT.A.x-120,0,LAYOUT.A.z+35],
 'The head of the bay — compass':[CITY.HEAD[0]+260,140,CITY.HEAD[1]+260,CITY.HEAD[0],4,CITY.HEAD[1],null,true],
};
// the placed city (88): presets found from the records, so they follow the placement
(function(){const N=LAYOUT.N,T=LAYOUT.T,A=LAYOUT.A,H=CITY.HEAD;const V=VIEWS;
 V['The Amphitriton across the water']=[A.x-N[0]*230+T[0]*90,34,A.z-N[1]*230+T[1]*90,A.x,30,A.z];
 const h=PLACE.hosts.find(h=>!h.full&&h.cls==='tall'&&h.pods.length>1)||PLACE.hosts[0];
 if(h){const p=h.pods[0];const c=Math.cos(p.a+.5),s=Math.sin(p.a+.5);const r=h.rAt(p.y,p.a);V['A stump and its pods']=[h.x+c*(r+75),p.y+22,h.z+s*(r+75),h.x,p.y+4,h.z];}
 for(const t in YS_HOST_TYPES){const g=PLACE.hosts.find(h=>h.type===t&&!h.full&&h.pods.length>1);if(!g)continue;const p=g.pods[0];const c=Math.cos(p.a+.45),sn=Math.sin(p.a+.45);const r=g.rAt(p.y,p.a);
  V['A '+YS_HOST_TYPES[t].name.replace('the ','')+' stump']=[g.x+c*(r+95),Math.max(p.y,g.top*.5)+30,g.z+sn*(r+95),g.x,Math.max(p.y,g.top*.4),g.z];}
 {const g=PLACE.hosts.find(h=>h.land);if(g){const p=g.pods[0];const c=Math.cos(p.a+.5),sn=Math.sin(p.a+.5);V['A reclaimed Ancient on land']=[g.x+c*130,g.sink+45,g.z+sn*130,g.x,g.sink+25,g.z];}}
 V['The karst from the bay']=[CITY.HEAD[0]+N[0]*700+T[0]*500,170,CITY.HEAD[1]+N[1]*700+T[1]*500,CITY.HEAD[0]-N[0]*700,40,CITY.HEAD[1]-N[1]*700];
 {const hd=KARST.made.find(s=>/north-east headland/.test(s.n));if(hd)V['The north-east headland']=[hd.x+N[0]*420-T[0]*260,120,hd.z+N[1]*420-T[1]*260,hd.x,40,hd.z];}
 {const g=PLACE.hosts.find(h=>h.type==='midStalks');if(g){const c=Math.cos(g.ry+.9),sn=Math.sin(g.ry+.9);V['The Capsule Stalks and their pods']=[g.x+c*85,g.sink+48,g.z+sn*85,g.x,g.sink+26,g.z];V['The Capsule Stalks from the other side']=[g.x-c*85,g.sink+40,g.z-sn*85,g.x,g.sink+26,g.z];}}
 {let best=null;for(const P of FLOORS.plans){const h=PLACE.hosts.find(x=>x.n===P.host);if(!h||h.full||h.cutY==null||h.land)continue;const gap=h.top-P.y;if(!best||gap<best.gap)best={P,h,gap};}
  if(best){const h=best.h;V['Into a stump: its lived floors']=[h.x+18,h.top+70,h.z+30,h.x,best.P.y,h.z];}}
 {const S=SPANS.list.find(s=>s.kind==='bridge');if(S){const ha=PLACE.hosts.find(x=>x.n===S.a.host),hb=PLACE.hosts.find(x=>x.n===S.b.host);const mx=(ha.x+hb.x)/2,mz=(ha.z+hb.z)/2,y=ha.pods[S.a.pod].y;const dx=hb.x-ha.x,dz=hb.z-ha.z,l=Math.hypot(dx,dz);
   V['A bridge between two hosts']=[mx-dz/l*110,y+30,mz+dx/l*110,mx,y,mz];}
  const D=SPANS.list.find(s=>s.kind==='drawbridge');if(D)V['The drawbridge to the Amphitriton']=[(D.A.x+D.B.x)/2-(D.B.z-D.A.z)*.9,40,(D.A.z+D.B.z)/2+(D.B.x-D.A.x)*.9,(D.A.x+D.B.x)/2,8,(D.A.z+D.B.z)/2];
  V['The L2 walk grid']=[LAYOUT.A.x+300,260,LAYOUT.A.z+380,LAYOUT.A.x,20,LAYOUT.A.z];
  // the network's links to the shore and its piers (Travis, Oct 5 2026)
  const sh=SPANS.list.find(s=>s.kind==='bridge'&&s.b.kind==='shore');if(sh){const h=PLACE.hosts.find(x=>x.n===sh.a.host);const mx=(h.x+sh.b.x)/2,mz=(h.z+sh.b.z)/2;const dx=sh.b.x-h.x,dz=sh.b.z-h.z,l=Math.hypot(dx,dz)||1;
   V['A tower bridged to the shore']=[mx-dz/l*150,46,mz+dx/l*150,mx,10,mz];}
  const pm=SPANS.list.find(s=>s.kind==='pontoon'||s.kind==='walkway'&&/mole/.test(s.na)&&!/Tides/.test(s.na));if(pm){const mx=(pm.A.x+pm.B.x)/2,mz=(pm.A.z+pm.B.z)/2;const dx=pm.B.x-pm.A.x,dz=pm.B.z-pm.A.z,l=Math.hypot(dx,dz)||1;
   V['A mole\'s '+pm.kind+' to the shore']=[pm.A.x-dx/l*30-dz/l*22,16,pm.A.z-dz/l*30+dx/l*22,mx,2.5,mz];}
  const lp=SPANS.list.filter(s=>s.kind==='bridge'&&(s.piers||0)>0).sort((a,b)=>b.piers-a.piers)[0];if(lp){const E=lp.b.host?PLACE.hosts.find(x=>x.n===lp.b.host):lp.b;const h=PLACE.hosts.find(x=>x.n===lp.a.host);const mx=(h.x+E.x)/2,mz=(h.z+E.z)/2;const dx=E.x-h.x,dz=E.z-h.z,l=Math.hypot(dx,dz)||1;
   V['The longest bridge and its piers']=[mx-dz/l*120,14,mz+dx/l*120,mx,12,mz];}
  const cs=SPANS.list.find(s=>s.kind==='cliffstair');if(cs){const a=cs.a0+cs.dir*.9;const r=ysStackEdge(CITY.STACKS[0],a)+70;V['The Citadel\'s cliff stair']=[cs.cx+Math.cos(a)*r,38,cs.cz+Math.sin(a)*r,cs.cx+Math.cos(a)*(r-60),28,cs.cz+Math.sin(a)*(r-60)];}
  const ct=SPANS.list.find(s=>s.kind==='bridge'&&s.b.kind==='citadel');if(ct){const h=PLACE.hosts.find(x=>x.n===ct.a.host);const mx=(h.x+ct.b.x)/2,mz=(h.z+ct.b.z)/2;const dx=ct.b.x-h.x,dz=ct.b.z-h.z,l=Math.hypot(dx,dz)||1;
   V['The Citadel\'s span']=[mx-dz/l*220,90,mz+dx/l*220,mx,50,mz];}}
 // the land quarter: a laned block, a skyscraper stump on land, the military harbour's quay (Travis, Oct 5 2026)
 {const b=LAYOUT.blocks.find(b=>b.use==='neighbourhood'&&!b.hostPlaced);if(b)V['A laned block from above']=[b.x-N[0]*60,250,b.z-N[1]*60+1,b.x,2,b.z];
  const t=PLACE.hosts.find(h=>h.land&&h.tall);if(t)V['A skyscraper stump on land']=[t.x-N[0]*230+T[0]*140,t.top*.7,t.z-N[1]*230+T[1]*140,t.x,t.top*.45,t.z];
  const m=PLACE.moles.find(m=>/military harbour mole 1/.test(m.name));if(m){const cx=(m.x0+m.x1)/2,cz=(m.z0+m.z1)/2;V['The military harbour quay']=[cx-N[0]*90+T[0]*140,40,cz-N[1]*90+T[1]*140,cx,3,cz];}
  const sh=PLACE.hosts.find(h=>h.pods.some(p=>p.stair));if(sh){const p=sh.pods.find(p=>p.stair);const r=sh.rAt(p.y,p.a)+34;V['A spiral stair down a tower']=[sh.x+Math.cos(p.a+.5)*r,p.y+8,sh.z+Math.sin(p.a+.5)*r,sh.x+Math.cos(p.a)*(r-30),p.y-5,sh.z+Math.sin(p.a)*(r-30)];}
  const ar=LAYOUT.landmarks.arena;if(ar)V['The Arena']=[ar.x-N[0]*210+T[0]*120,110,ar.z-N[1]*210+T[1]*120,ar.x,16,ar.z];}
 V['The main market']=[H[0]+N[0]*150-T[0]*110,55,H[1]+N[1]*150-T[1]*110,H[0],4,H[1]];
 {const r=PLACE.blds.find(r=>/^hyk_house_rich/.test(r.key));if(r){const f=[Math.sin(r.ry),Math.cos(r.ry)],x=[Math.cos(r.ry),-Math.sin(r.ry)];V['A rich house']=[r.x+f[0]*34+x[0]*14,r.y+13,r.z+f[1]*34+x[1]*14,r.x,r.y+4,r.z];}}
 const ph=PLACE.hosts.find(h=>/Pharos/.test(h.n));if(ph)V['The Pharos']=[ph.x-N[0]*260+T[0]*120,ph.top-10,ph.z-N[1]*260+T[1]*120,ph.x,ph.top-40,ph.z];
 {const r=PLACE.blds.find(r=>r.key==='hyk_navigators_guild')||PLACE.blds.find(r=>r.why==='civilian harbour');if(r)V['The civilian harbour']=[r.x+N[0]*140+T[0]*90,38,r.z+N[1]*140+T[1]*90,r.x,4,r.z];}
 {const r=PLACE.blds.find(r=>r.why==='home-grown mole');if(r){const m=PLACE.moles.find(m=>/home-grown/.test(m.name)&&ysPlInPoly(m.poly,r.x,r.z));const cx=m?(m.x0+m.x1)/2:r.x,cz=m?(m.z0+m.z1)/2:r.z;V['A home-grown mole']=[cx+N[0]*150+T[0]*100,70,cz+N[1]*150+T[1]*100,cx,3,cz];}}
 {const am=SPANS.list.find(s=>s.kind==='bridge'&&s.b.kind==='amph');if(am){const h=PLACE.hosts.find(x=>x.n===am.a.host);const mx=(h.x+am.b.x)/2,mz=(h.z+am.b.z)/2;const dx=am.b.x-h.x,dz=am.b.z-h.z,l=Math.hypot(dx,dz)||1;V['The Amphitriton\'s coastal span']=[mx-dz/l*160,60,mz+dx/l*160,mx,28,mz];}}
})();
