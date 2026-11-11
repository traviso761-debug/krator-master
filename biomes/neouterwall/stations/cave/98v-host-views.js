// ================================================================= HOST — the views: the Marble Hall
// Into the hall from its west end, across it under the cupolas, up into the largest cupola, the gypsum floor, a feeder well down to the lower
// storey's hot water, a passage of the dry storey's maze, and the lower storey's warm pools.
const VIEWS=(function(){const V={},R=F0.rx,Rz=F0.rz;
 {const e=eyeAt(FX-R*.8,FY+2.2,FZ);V['The Marble Hall']=[e[0],e[1],e[2],FX+R*.5,FY+16,FZ];}
 {const e=eyeAt(FX+R*.55,FY+1.8,FZ+Rz*.5);V['Across the hall']=[e[0],e[1],e[2],FX-R*.6,FY+10,FZ-Rz*.4];}
 {const U=CAVE.hallCupolas.reduce((a,u)=>u.r>a.r?u:a,CAVE.hallCupolas[0]),e=eyeAt(U.c[0]+16,FY+1.8,U.c[2]+10);V['Up into a cupola']=[e[0],e[1],e[2],U.c[0],U.c[1]+U.h*.6,U.c[2]];}
 {const e=eyeAt(FX-R*.3,FY+1.5,FZ-Rz*.3);V['The gypsum floor']=[e[0],e[1],e[2],e[0]+8,FY+.2,e[2]+5];}
 if(CAVE.wells.length){const W=CAVE.wells.reduce((a,w)=>Math.hypot(w.c[0]-FX,w.c[1]-FZ)<Math.hypot(a.c[0]-FX,a.c[1]-FZ)?w:a,CAVE.wells[0]),e=eyeAt(W.c[0]+W.r+2.2,W.mouth+2.2,W.c[1]+.5);
  V['A feeder well (the lower storey\'s hot water below)']=[e[0],e[1],e[2],W.c[0],W.level,W.c[1]];}
 {const P=CAVE.passages.filter(p=>p.level===1).map(p=>[CAVE.M[p.a],CAVE.M[p.b],p]).filter(q=>CAVE.inB(q[0].x,q[0].z)&&CAVE.inB(q[1].x,q[1].z)&&Math.hypot((q[0].x-FX)/R,(q[0].z-FZ)/Rz)>1.3)[0];
  if(P){const a=P[0],b=P[1],e=eyeAt(a.x,a.y+1.6,a.z);V['A passage of the dry storey']=[e[0],e[1],e[2],b.x,b.y+1.5,b.z];}}
 {const L=CAVE.chambers.find(c=>c.storey===0&&!CAVE.hot.includes(c))||CAVE.chambers.find(c=>c.storey===0);
  if(L){const e=eyeAt(L.c[0]+L.rx*.5,(CAVE.water?CAVE.water.level:L.c[1])+1.6,L.c[2]);V['The lower storey\'s warm pools']=[e[0],e[1],e[2],L.c[0]-L.rx*.6,L.c[1]+2,L.c[2]];}}
 return V;})();
