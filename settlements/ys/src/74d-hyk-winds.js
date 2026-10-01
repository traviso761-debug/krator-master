// ================================================================= HYKKOUSOI — the Temple of the Winds (landmark D)
// A cluster of seven urchin spires on a lobed mosaic terrace, wider and airier than the reference: open ground between
// the spires, each leaning a little outward, joined only by flying bone-ribs at mid-height; wind-holes lipped through
// every spire in pairs, so the sky shows through them; the hall under the great spire (hollow to its tip), with a
// gallery ring at +7 reached by a helical stair up the wall, the altar at the back; a vestry and a shrine of the winds
// in the two front satellites. Local frame, +z the front. Seeds 30665–30679. Uses 74c's hykTide* helpers.
// a spire surface: a tapering fluted twisted lathe whose axis leans `lean` metres toward azimuth `dir` by its tip.
// S:{cx,cz,yBase,H,rFn,flute:{n,amp,sharp},twist,rings:{n,amp},lean,dir,nu,nv,col,k (a scale: .92 for an inner skin)}
// Returns {fn, at(th,y)->{p,n}}; hykWindSpire builds the geometry with ops (openings) and a winding.
function hykWindSpireFn(S){const H=S.H,lean=S.lean||0,ld=S.dir||0,k=S.k||1;
 const rAt=(th,y)=>{let r=S.rFn(y);if(S.flute)r*=1+S.flute.amp*Math.pow(.5+.5*Math.cos(S.flute.n*th+(S.twist||0)*y),S.flute.sharp||2);if(S.rings)r*=1+S.rings.amp*Math.sin(y/H*S.rings.n*TAU);return r;};
 const cen=y=>{const q=Math.pow(Math.max(0,y)/H,1.6)*lean;return [S.cx+q*Math.cos(ld),S.cz+q*Math.sin(ld)];};
 return {rAt,cen,fn:(u,v)=>{const th=u*TAU,y=v*H;const r=rAt(th,y)*k;const c=cen(y);return [c[0]+r*Math.cos(th),S.yBase+y,c[1]+r*Math.sin(th)];},
  at:(th,y)=>{const r=rAt(th,y)*k;const c=cen(y);const e=.05;const dr=(rAt(th,y+e)-rAt(th,y))/e;const n=new THREE.Vector3(Math.cos(th),-dr,Math.sin(th)).normalize();return {p:[c[0]+r*Math.cos(th),S.yBase+y,c[1]+r*Math.sin(th)],n:[n.x,n.y,n.z]};}};}
function hykWindSpire(S,ops,k,flip,col){const F=hykWindSpireFn(Object.assign({},S,{k:k||1}));return hykSurf(F.fn,S.nu||64,S.nv||40,{col:col||S.col,uS:TAU*S.rFn(S.H*.3)/4,vS:S.H/4,flip,hole:hykHoleOf(ops)});}
// ---------------------------------------------------------------- the temple
function buildHykTempleWinds(G,o){reseed(30665+(o.v|0));
 const PLW=1.6,RT=30;   // the terrace's top and radius
 const cBone=hC(hPick(HPAL.bone)),cNac=hC(hPick(HPAL.nacre)),cFloor=hC(hPick(HPAL.floor)),cIn=hC(hPick(HPAL.shell),.86),cTeal=hC(hPick(HPAL.teal)),cCrust=hC(hPick(HPAL.crust)),cLens=hC(hPick(HPAL.lens));
 // ---- the terrace: a lobed mosaic plinth, its top, its rail, the front steps and the back flight
 hykPut('hkMosaic',hykLathe({H:PLW,yBase:0,rFn:y=>RT-.6*(y/PLW),nu:192,nv:4,lobes:{n:6,amp:.1},col:(u,v)=>v<.3?cCrust:cTeal}));
 hykPut('hkFloor',hykDisc(0,PLW,0,RT-.6,{lobes:{n:6,amp:.1},col:cFloor,nu:192,nv:4}));
 hykTideRail(0,0,a=>(RT-1.7)*(1+.1*Math.cos(6*a)),PLW+1.15,0,TAU,{col:cBone,gaps:[[Math.PI/2-.24,Math.PI/2+.24],[1.5*Math.PI-.08,1.5*Math.PI+.08]]});
 hykTideStair([0,0,RT*.9+4.4],[0,PLW,(RT-.6)*.9+.3],12,{col:cBone,rails:'both',solid:true,solidCol:cTeal});
 hykTideStair([0,0,-RT*.9-4.4],[0,PLW,-(RT-.6)*.9-.3],3.2,{col:cBone,rails:'both',solid:true,solidCol:cTeal});
 // ---- the spires: the great one holds the hall; six satellites stand round it at 21.5 m, leaning out, graded in height
 const S0={cx:0,cz:-3,yBase:PLW,H:58,rFn:y=>11*Math.pow(Math.max(0,1-y/58),.72)+.25,flute:{n:9,amp:.11,sharp:1.4},twist:.05,rings:{n:16,amp:.014},nu:168,nv:84,col:cNac};
 const F0=hykWindSpireFn(S0);const at0=(th,y)=>F0.at(th,y);
 const sats=[];for(let k=0;k<6;k++){const a=Math.PI/2+(k+.5)*Math.PI/3;const Hs=[38,44,34,42,30,36][k],rb=[6.4,5.4,7.0,5.0,6.2,5.8][k];
  sats.push({a,S:{cx:S0.cx+21.5*Math.cos(a),cz:S0.cz+21.5*Math.sin(a),yBase:PLW,H:Hs,rFn:y=>rb*Math.pow(Math.max(0,1-y/Hs),.72)+.2,flute:{n:7+(k%3),amp:.12,sharp:1.4},twist:.07+.02*k,rings:{n:12,amp:.016},lean:2.3,dir:a,nu:88,nv:52,col:hC(hPick(k%2?HPAL.shell:HPAL.shellWarm))},rb,Hs,room:k===5?'store':k===0?'shrine':null});}
 const inward=(ops,F,t)=>ops.map(op=>({p:[op.p[0]-op.n[0]*t,op.p[1]-op.n[1]*t,op.p[2]-op.n[2]*t],r:op.r,ky:op.ky}));
 // the great spire: the door at the front, four lit windows above the gallery, three pairs of wind-holes up the shaft
 const door=at0(Math.PI/2,1.75);door.r=1.25;door.ky=1.3;
 const ops0=[door];for(const az of [.5,2.6,3.7,5.8]){const q=at0(az,9.5);q.r=1.1;q.ky=1.15;q.win=true;ops0.push(q);}
 for(const h of [[24,Math.PI/2,1.7],[34,0,1.4],[44,Math.PI/3,1.0]])for(const s of [0,Math.PI]){const q=at0(h[1]+s,h[0]);q.r=h[2];q.ky=1.25;q.wind=true;ops0.push(q);}
 hykPut('hkNacre',hykWindSpire(S0,ops0));hykPut('hkIn',hykWindSpire(S0,inward(ops0,F0,.9),.92,true,cIn),true);
 hykDoor(door,{level:'ground',nacre:true,depth:1.2});for(const q of ops0)if(q.win)hykWin(q,{nacre:true,lit:true,depth:1.0});else if(q.wind)hykWin(q,{nacre:true,open:true,depth:Math.max(.6,q.r*.6)});
 hykPut('hkNacre',hykFlare([S0.cx,PLW+.01,S0.cz],[0,1,0],11*.98,4.2,{col:cNac}));kput('hkBall',[S0.cx,PLW+58,S0.cz],null,[.55,.9,.55],cNac);
 // the satellites: through-pairs of wind-holes at two heights, a lit window on the outward face, a door on the two front ones
 for(const T of sats){const S=T.S,F=hykWindSpireFn(S);const ops=[];
  for(const f of [.42,.68]){const y=S.H*f;for(const s of [1,-1]){const q=F.at(T.a+s*Math.PI/2,y);q.r=Math.max(.75,S.rFn(y)*.3);q.ky=1.2;q.wind=true;ops.push(q);}}
  const w=F.at(T.a,S.H*.26);w.r=.8;w.ky=1.15;w.win=true;ops.push(w);
  let d=null;if(T.room){d=F.at(Math.PI/2,1.75);d.r=1.15;d.ky=1.3;ops.push(d);T.door=d;}
  hykPut('hkShell',hykWindSpire(S,ops));hykPut('hkIn',hykWindSpire(S,inward(ops,F,.5),.9,true,cIn),true);
  for(const q of ops){if(q===d)hykDoor(d,{level:'ground',nacre:true,depth:.9});else if(q.win)hykWin(q,{nacre:true,lit:!!T.room,depth:.8});else hykWin(q,{nacre:true,open:true,depth:Math.max(.5,q.r*.6)});}
  hykPut('hkShell',hykFlare([S.cx,PLW+.01,S.cz],[0,1,0],T.rb*.98,T.rb*.4,{col:S.col}));const tip=F.cen(S.H);kput('hkBall',[tip[0],PLW+S.H,tip[1]],null,[.4,.7,.4],S.col);
  for(let i=0;i<7;i++){const a=rr(0,TAU),y=rr(.1,1.6);const r=F.rAt(a,y)+.03;kput('hkBarnB',[S.cx+r*Math.cos(a),PLW+y,S.cz+r*Math.sin(a)],null,[.26,.2,.26],hC(hPick(HPAL.barnacle)));}
  if(T.room){hykFloor(S.cx,S.cz,PLW+.02,T.rb*.86,{col:cFloor});for(const s of [-1,1]){const q=F.at(Math.PI/2+s*.3,3.6);hykLight(q.p[0]+q.n[0]*.5,q.p[1]+.25,q.p[2]+q.n[2]*.5,{r:.2,nacre:true,bracket:q.p});}}}
 // ---- the flying ribs: from the great spire to every satellite at mid-height, and between neighbours lower down
 for(let k=0;k<6;k++){const T=sats[k],F=hykWindSpireFn(T.S);
  const A=at0(T.a,26),B=F.at(T.a+Math.PI,T.Hs*.55);hykPut('hkBone',hykRib([A.p[0]-A.n[0]*.5,A.p[1],A.p[2]-A.n[2]*.5],[B.p[0]-B.n[0]*.5,B.p[1],B.p[2]-B.n[2]*.5],{rise:2.6,r0:.62,r1:.4,knuckles:4,n:18,seg:9,col:cBone}));
  kput('hkBall',[A.p[0],A.p[1],A.p[2]],null,[.95,.8,.95],cBone);kput('hkBall',[B.p[0],B.p[1],B.p[2]],null,[.8,.7,.8],cBone);
  const U=sats[(k+1)%6],FU=hykWindSpireFn(U.S);const toU=Math.atan2(U.S.cz-T.S.cz,U.S.cx-T.S.cx);
  const C=F.at(toU,T.Hs*.3),E=FU.at(toU+Math.PI,U.Hs*.3);hykPut('hkBone',hykRib([C.p[0]-C.n[0]*.4,C.p[1],C.p[2]-C.n[2]*.4],[E.p[0]-E.n[0]*.4,E.p[1],E.p[2]-E.n[2]*.4],{rise:1.9,r0:.48,r1:.32,knuckles:3,n:16,seg:8,col:cBone}));
  kput('hkBall',[C.p[0],C.p[1],C.p[2]],null,[.7,.6,.7],cBone);kput('hkBall',[E.p[0],E.p[1],E.p[2]],null,[.7,.6,.7],cBone);}
 // ---- the hall: its floor, the gallery ring at +7 on ribs, the helical stair up the wall, the lamps
 const rIn=y=>S0.rFn(y-PLW)*.92;const GY=PLW+7;
 hykFloor(S0.cx,S0.cz,PLW+.02,rIn(PLW)-.2,{col:cFloor,nu:48});
 const hx=hykTideHelix(S0.cx,S0.cz,y=>rIn(y)-.72,PLW,GY,Math.PI/2+.6,1,1.2,{col:cBone,rail:'in',inside:true});
 const ring=(y,flip,r0,r1)=>hykSurf((u,v)=>{const th=u*TAU;const r=r0+v*(r1-r0);return [S0.cx+r*Math.cos(th),y,S0.cz+r*Math.sin(th)];},96,3,{col:cFloor,flip,hole:(u,v,p)=>{const a=Math.atan2(p[2]-S0.cz,p[0]-S0.cx);const r=Math.hypot(p[0]-S0.cx,p[2]-S0.cz);return r>7.4&&Math.abs(hykTideAng(a,hx.a1-.3))<.36;}});
 hykPut('hkFloor',ring(GY,true,6.7,9.4),true);hykPut('hkShell',ring(GY-.4,false,6.9,9.4),true);
 hykPut('hkBone',hykTube(hykCirclePoly(S0.cx,S0.cz,6.75,48).concat([hykCirclePoly(S0.cx,S0.cz,6.75,48)[0]]).map(p=>[p[0],GY-.2,p[1]]),t=>.28*(1+.2*Math.max(0,Math.cos(t*12*TAU))),{seg:8,col:cBone}),true);
 hykTideRail(S0.cx,S0.cz,6.6,GY+1.15,0,TAU,{col:cBone,inside:true});
 for(let k=0;k<6;k++){const a=k/6*TAU+.4;if(Math.abs(hykTideAng(a,Math.PI/2))<.5)continue;const A=[S0.cx+9.6*Math.cos(a),PLW,S0.cz+9.6*Math.sin(a)],B=[S0.cx+7.0*Math.cos(a),GY-.45,S0.cz+7.0*Math.sin(a)];
  hykPut('hkBone',hykRib(A,B,{rise:1.2,r0:.5,r1:.3,knuckles:3,n:12,seg:8,col:cBone}),true);kput('hkBall',[A[0],PLW+.3,A[2]],null,[.75,.6,.75],cBone);}
 for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4;const r=6.6;hykLight(S0.cx+r*Math.cos(a),GY+1.5,S0.cz+r*Math.sin(a),{r:.2,nacre:true,bracket:[S0.cx+r*Math.cos(a),GY+1.15,S0.cz+r*Math.sin(a)]});}
 for(const s of [-1,1]){const q=at0(Math.PI/2+s*.24,3.8);hykLight(q.p[0]+q.n[0]*.55,q.p[1]+.25,q.p[2]+q.n[2]*.55,{r:.22,nacre:true,bracket:q.p});}
 for(let k=0;k<6;k++){const a=k/6*TAU+.52;if(Math.abs(hykTideAng(a,Math.PI/2))<.4||Math.abs(hykTideAng(a,1.5*Math.PI))<.3)continue;const r=(RT-1.7)*(1+.1*Math.cos(6*a));hykLight(r*Math.cos(a),PLW+1.5,r*Math.sin(a),{r:.2,cool:true,bracket:[r*Math.cos(a),PLW+1.15,r*Math.sin(a)]});}
 // ---- rooms and spots: the hall (the altar at the back under the spire, seats), the vestry, the shrine of the winds
 const hall=hykRoom('hall',hykCirclePoly(S0.cx,S0.cz,rIn(PLW)-1.2,20),PLW+.02,GY-PLW-.5,{doors:[[door.p[0],door.p[2],2.5,'street']],wealth:.95});
 hykSpot(hall,'shrine',S0.cx,S0.cz-6.4,Math.PI,1.8,.9);hykSpot(hall,'seat',S0.cx+5.6,S0.cz-1.2,Math.PI/2,1.6,.9);hykSpot(hall,'seat',S0.cx-5.6,S0.cz-1.2,-Math.PI/2,1.6,.9);hykSpot(hall,'seat',S0.cx+3.2,S0.cz+3.6,0,1.4,.9);
 for(const T of sats){if(!T.room)continue;const S=T.S;const rm=hykRoom(T.room,hykCirclePoly(S.cx,S.cz,T.rb*.78,14),PLW+.02,T.Hs*.3,{doors:[[T.door.p[0],T.door.p[2],2.3,'street']],wealth:.95});
  if(T.room==='store'){hykSpot(rm,'store',S.cx-2.6,S.cz-1.6,Math.PI/2,1.2,.7);hykSpot(rm,'store',S.cx+2.6,S.cz-1.6,-Math.PI/2,1.2,.7);hykSpot(rm,'work',S.cx,S.cz-3.2,Math.PI,1.4,.8);}
  else{hykSpot(rm,'shrine',S.cx,S.cz-3.2,Math.PI,1.6,.9);hykSpot(rm,'seat',S.cx+2.6,S.cz-.6,Math.PI/2,1.3,.9);hykSpot(rm,'seat',S.cx-2.6,S.cz-.6,-Math.PI/2,1.3,.9);}}
 hykReg('Temple of the Winds',0,-2,36,61);}
HYK.def({key:'hyk_temple_winds',name:'Temple of the Winds',family:'sacred',row:'Sacred',w:70,d:66,h:61,landmark:true,inside:true,tags:{type:['religious'],wealth:'civic',lit:true},build:buildHykTempleWinds});
