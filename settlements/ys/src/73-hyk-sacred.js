// ================================================================= HYKKOUSOI — sacred: the shrine of the Tides, the shrine of the Sea-gods, their grown-on pods (agent C)
// Seeds 30550–30599. Uses the agent-C helpers in 72-hyk-hospitality.js (hykHospPod, hykHospGrownPod, hykHospSpire,
// hykHospLamp, hykHospLanding, hykHospPadRib, hykHospFillet). Civic: nacre shells, lit (DESIGN §4): cool bioluminescent
// jars at the Tides, warm glow-pearls at the Sea-gods, whose great pearl is itself the lamp. Each shrine is a 'shrine'
// room with an altar spot (1.2 x 0.8) and two offering spots; the Tides keep a tide basin fed by a rimmed channel from a
// pool outside, the Sea-gods keep the pearl on a pedestal. Planting is spots, never geometry.
// ---------------------------------------------------------------- shared bits
// a sunk tide basin at (cx,cz) in a floor at y: a mosaic bowl, the water, a nacre lip
function hykShrineBasin(cx,cz,y,R,inside){const teal=hC(hPick(HPAL.teal));const d=R*.5;
 hykPut('hkMosaic',hykLathe({H:d,cx,cz,yBase:y-d,rFn:yy=>R*.55+R*.45*(yy/d),nu:28,nv:5,flip:true,col:teal}),inside);
 hykPut('hkFloor',hykDisc(cx,y-d*.28,cz,R*.9,{col:hC(hPick(HPAL.teal),1.15),nu:24}),inside);
 kput('hkLipN',[cx,y+.03,cz],qEuler(Math.PI/2,0,0),[R*1.06,R*1.06,.9],hC(hPick(HPAL.nacre)));}
// a raised pool at (cx,cz) on the ground: a shell wall, mosaic inside, the water, a lip
function hykShrinePool(cx,cz,R,H,col){const teal=hC(hPick(HPAL.teal));
 hykPut('hkNacre',hykLathe({H,cx,cz,yBase:0,rFn:y=>R+.12*Math.sin(y*4),nu:30,nv:5,rings:{n:2,amp:.03},col}));
 hykPut('hkMosaic',hykLathe({H,cx,cz,yBase:0,rFn:y=>R-.1+.12*Math.sin(y*4),nu:30,nv:5,flip:true,col:teal}));
 hykPut('hkFloor',hykDisc(cx,H*.78,cz,R*.95,{col:hC(hPick(HPAL.teal),1.15),nu:24}));kput('hkLipN',[cx,H,cz],qEuler(Math.PI/2,0,0),[R*1.04,R*1.04,.9],col);
 hykPut('hkNacre',hykFlare([cx,.02,cz],[0,1,0],R*.98,R*.3,{col}));}
// a rimmed water channel along z at x=cx from z0 to z1 at height y (two bone rims, a teal ribbon)
function hykShrineChannel(cx,y,z0,z1,inside){const teal=hC(hPick(HPAL.teal),1.15),bone=hC(hPick(HPAL.bone));
 for(const s of [-1,1])hykPut('hkBone',hykTube([[cx+s*.42,y+.02,z0],[cx+s*.42,y+.02,(z0+z1)/2],[cx+s*.42,y+.02,z1]],()=>.1,{seg:6,col:bone}),inside);
 hykPut('hkFloor',hykDeck([[cx,y,z0],[cx,y,z1]],.66,{col:teal}),inside);}
// urchin spines along the normals of pod P's upper shoulders, bedded .15 m into the shell
function hykShrineSpines(P,n,col){for(let i=0;i<n;i++){const th=rng()*TAU,el=rr(.45,1.05);const p=P.surfAt(th,el);const v=new THREE.Vector3(p[0]-P.cx,p[1]-P.cy,p[2]-P.cz).normalize();
 const h=rr(.4,.95);const q=new THREE.Quaternion().setFromUnitVectors(_UP,v);kput('hkDrip',[p[0]+v.x*(h/2-.15),p[1]+v.y*(h/2-.15),p[2]+v.z*(h/2-.15)],q,[h*.28,h,h*.28],col);}}
// the great pearl on its pedestal cup: the pearl is the lamp (warm, bare), rooted in the cup
function hykShrinePearl(cx,cz,y,level){const nac=hC(hPick(HPAL.nacre));
 hykPut('hkNacre',hykLathe({H:1.05,cx,cz,yBase:y,rFn:yy=>.46-.2*Math.sin(yy/1.05*Math.PI)+.18*Math.pow(yy/1.05,4),nu:20,nv:8,flute:{n:8,amp:.1,sharp:1.4},col:nac}),true);
 hykPut('hkNacre',hykFlare([cx,y+.02,cz],[0,1,0],.44,.3,{col:nac}),true);
 return hykLight(cx,y+1.05+.36,cz,{r:.42,bare:true,nacre:true,level:level||'ground',kind:'pearl',bracket:[cx,y+1.0,cz]});}
// ================================================================= the Shrine of the Tides (free-standing, civic, lit)
// A low fluted scallop: a drum rising into a dome, an urchin spire on the crown; inside, a tide basin sunk in the floor
// fed by a rimmed channel from a raised pool in the forecourt; the altar at the back; jars at the door and over the water.
function hykShrineBuildTides(G,o){reseed(30550+(o.v|0));const nac=hC(hPick(HPAL.nacre)),col2=hC(hPick(HPAL.shell));
 const D0=4.3+.06*1.8;const L={H:4.8,cx:0,cz:0,yBase:0,rFn:y=>y<1.8?4.3+.06*y:D0*Math.sqrt(Math.max(0,1-Math.pow((y-1.8)/3.0,2.4)))+.28*(y-1.8)/3.0,nu:64,nv:26,flute:{n:16,amp:.09,sharp:1.4},rings:{n:5,amp:.02},noise:{amp:.02,su:5,sv:1.5,seed:7},col:nac};
 const ops=[];const mk=(th,y,r,ky,kind,o2)=>{const q=hykLatheAt(L,th,y);ops.push(Object.assign({p:q.p,n:q.n,r,ky:ky||1,kind},o2||{}));};
 mk(Math.PI/2,1.33,1.1,1.15,'door');mk(Math.PI/2+1.25,2.5,.5,1,'window');mk(Math.PI/2-1.25,2.5,.5,1,'window');mk(-Math.PI/2,2.8,.45,1,'window');mk(Math.PI/2+2.3,2.3,.4,1,'window');mk(Math.PI/2-2.3,2.3,.4,1,'window');
 L.ops=ops;hykPut('hkNacre',hykLathe(L));hykPut('hkIn',hykLathe(Object.assign({},L,{rFn:y=>L.rFn(y)*.9,flip:true,col:hC(hPick(HPAL.shell),.9)})),true);
 hykPut('hkNacre',hykFlare([0,.02,0],[0,1,0],4.3*.96,1.3,{col:nac}));hykFloor(0,0,.1,3.9,{});
 for(const op of ops){if(op.kind==='door')hykDoor(op,{level:'ground',nacre:true});else hykWin(op,{nacre:true,lit:true});}
 const domeY=rho=>{let lo=1.8,hi=4.8;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(L.rFn(m)>rho)lo=m;else hi=m;}return lo;};   // the dome's height at a radius, for the spire's root
 const sp=hykHospSpire(0,0,4.72,5.8,1.15,{mat:'hkNacre',col:nac,flutes:9,twist:.8,recess:p=>domeY(Math.hypot(p[0],p[2]))-p[1]});
 // the tide: the basin, the channel out through the door, the pool in the forecourt
 hykShrineBasin(0,-.4,.1,1.6,true);hykShrineChannel(0,.08,1.25,4.0,true);hykShrineChannel(0,.08,5.0,5.8,false);hykShrinePool(0,7.4,1.8,.55,nac);
 hykPut('hkFloor',hykDisc(0,.03,7.0,4.3,{col:hC(hPick(HPAL.floor),.95),lobes:{n:11,amp:.06},nu:36}));
 // jars: two beside the door on the drum, one from the crown over the basin
 for(const s of [-1,1]){const q=hykLatheAt(L,Math.PI/2+s*.5,2.7);hykLight(q.p[0]+q.n[0]*.5,q.p[1]+.1,q.p[2]+q.n[2]*.5,{r:.2,cool:true,nacre:true,level:'ground',bracket:q.p});}
 {const q=hykLatheAt(Object.assign({},L,{rFn:y=>L.rFn(y)*.9}),-Math.PI/2,4.7);hykLight(0,3.4,-.9,{r:.22,cool:true,nacre:true,level:'ground',bracket:q.p});}
 // a few nacre nodules on the dome's flutes, the room and its spots, the forecourt
 for(let i=0;i<10;i++){const th=rng()*TAU,y=rr(2.4,4.0);const q=hykLatheAt(L,th,y);const s=rr(.14,.3);kput('hkBall',[q.p[0]-q.n[0]*.05,q.p[1],q.p[2]-q.n[2]*.05],null,[s,s*.8,s*1.3],nac);}
 const rm=hykRoom('shrine',hykCirclePoly(0,0,3.45,14),.1,4.3,{doors:[[0,4.35,2.2,'street']],wealth:.95});
 hykSpot(rm,'altar',0,-2.5,0,1.2,.8);hykSpot(rm,'shrine',-1.6,-2.2,0,.6,.6);hykSpot(rm,'shrine',1.6,-2.2,0,.6,.6);hykSpot(rm,'seat',0,2.2,0,1.4,.6);
 const ct=hykRoom('court',hykCirclePoly(0,7.2,3.6,14),.03,20,{doors:[[0,4.35,2.2,'shrine']],wealth:.95});hykSpot(ct,'plant',-2.6,6.6,0,1.2,1.2);hykSpot(ct,'plant',2.6,6.6,0,1.2,1.2);
 hykReg('Shrine of the Tides',0,2,8,sp.top);}
HYK.def({key:'hyk_shrine_tides',name:'Shrine of the Tides',family:'sacred',row:'Sacred',inside:true,w:14,d:16,h:10.5,tags:{type:['religious'],wealth:'civic',lit:true},build:hykShrineBuildTides});
// ================================================================= the Shrine of the Sea-gods (free-standing, civic, lit)
// A nacre pod crowned with an open oculus, three urchin spires of three heights grown against its flanks, spines on its
// shoulders; inside, the great pearl glowing in a fluted cup behind the altar. Pearls at the door, a jar on the tall spire.
function hykShrineBuildSeagods(G,o){reseed(30558+(o.v|0));const nac=hC(hPick(HPAL.nacre)),cor=hC(hPick(HPAL.coral));
 const A=hykHospPod(0,-.6,{a:3.9,b:3.8,c:3.9,e1:.85,e2:1.0,sq:.55,mat:'hkNacre',nacre:true,col:nac,inCol:hC(hPick(HPAL.shell),.92),seed:17,skirt:1.3,
  openings:[{th:0,y:1.5,r:1.1,ky:1.2,kind:'door',main:true},{th:1.0,y:3.1,r:.5,kind:'window',o:{lit:true}},{th:-1.0,y:3.1,r:.5,kind:'window',o:{lit:true}},{th:Math.PI,y:3.3,r:.45,kind:'window',o:{lit:true}},{th:2.2,y:2.6,r:.38,kind:'window'},{th:-2.2,y:2.6,r:.38,kind:'window'},{th:0,el:1.25,r:.55,kind:'window',o:{open:true}}]});
 const spires=[[-3.4,-1.6,10.5,1.2],[3.3,-1.9,9.2,1.1],[.6,-4.1,8.0,1.0]];let top=A.top;
 for(const s of spires){const r=hykHospSpire(s[0],s[1],0,s[2],s[3],{mat:'hkNacre',col:nac,flutes:9,twist:.7});top=Math.max(top,r.top);}
 hykShrineSpines(A,16,nac);kput('hkLipN',[0,A.top-.12,-.6],qEuler(Math.PI/2,0,0),[.8,.8,.9],cor);
 hykShrinePearl(0,-2.9,A.floorY,'ground');
 hykHospLamp(A,.42,2.9,{nacre:true,level:'ground'});hykHospLamp(A,-.42,2.9,{nacre:true,level:'ground'});
 {const S=spires[0];const r=S[3]*Math.pow(1-3/S[2],.85)+.04;const ax=S[0],az=S[1]+r;hykLight(ax,2.95,az+.55,{r:.2,cool:true,nacre:true,level:'ground',bracket:[ax,3.0,az-.05]});}
 hykPut('hkFloor',hykDisc(0,.03,5.2,3.8,{col:hC(hPick(HPAL.floor),.95),lobes:{n:9,amp:.06},nu:32}));
 const rm=hykRoom('shrine',hykCirclePoly(0,-.6,3.0,14),A.floorY,4.6,{doors:[[A.door.p[0],A.door.p[2],2.2,'street']],wealth:.95});
 hykSpot(rm,'altar',0,-1.9,0,1.2,.8);hykSpot(rm,'shrine',-1.6,-2.2,0,.6,.6);hykSpot(rm,'shrine',1.6,-2.2,0,.6,.6);hykSpot(rm,'seat',0,.4,0,1.4,.6);
 const ct=hykRoom('court',hykCirclePoly(0,5.4,3.2,14),.03,20,{doors:[[A.door.p[0],A.door.p[2],2.2,'shrine']],wealth:.95});hykSpot(ct,'plant',-2.2,5.8,0,1.2,1.2);hykSpot(ct,'plant',2.2,5.8,0,1.2,1.2);
 hykReg('Shrine of the Sea-gods',0,.5,7.5,top);}
HYK.def({key:'hyk_shrine_seagods',name:'Shrine of the Sea-gods',family:'sacred',row:'Sacred',inside:true,w:14,d:15,h:11.5,tags:{type:['religious'],wealth:'civic',lit:true},build:hykShrineBuildSeagods});
// ================================================================= the grown tide shrine (G frame)
// A nacre pod on the host's face with a spire on its crown; the tide basin sunk in its floor drains through a spout under
// the pod, a thread of water falling from it; the altar at the back; jars at the door and over the water; a window
// satellite; the landing on a rib.
function hykShrineBuildPodTides(G,o){reseed(30566+(o.v|0));const R=3.8;const nac=hC(hPick(HPAL.nacre)),teal=hC(hPick(HPAL.teal),1.15);
 const A=hykHospGrownPod(o,{R,proud:.3,mat:'hkNacre',nacre:true,col:nac,inCol:hC(hPick(HPAL.shell),.92),seed:23,
  openings:[{th:0,el:-.06,r:1.1,ky:1.2,kind:'door',main:true},{th:.9,el:.15,r:.45,kind:'window',o:{lit:true}},{th:-.9,el:.15,r:.45,kind:'window',o:{lit:true}},{th:1.9,el:.4,r:.38,kind:'window'},{th:-1.9,el:.4,r:.38,kind:'window'},{th:0,el:1.25,r:.42,kind:'window',o:{open:true}}]});
 const B=hykHospGrownPod(o,{R:1.6,x:3.7,dy:-.5,proud:.45,mat:'hkNacre',nacre:true,col:nac,seed:25,floor:false,drips:3,openings:[{th:.3,el:.2,r:.34,kind:'window'},{th:1.4,el:.4,r:.26,kind:'window'}]});
 hykHospJoin(A,B,{R:1.0,f:.7});
 const sp=hykHospSpire(0,A.cz,A.top-.3,3.8,.78,{mat:'hkNacre',col:nac,flutes:9,twist:.9,recess:p=>hykHospPodRay(A,p[0]-A.cx,p[1]-A.cy,p[2]-A.cz)[1]-p[1]});
 hykShrineBasin(0,A.cz-.3,A.floorY,1.15,true);
 // the spout: a long drip under the basin, a thread of water from its tip
 {const under=hykPodUnder(R,A.b,R,A.e1,A.e2,0,-.3);const ty=A.cy-under;kput('hkDrip',[0,ty-.8+.2,A.cz-.3],qEuler(Math.PI,0,0),[.4,1.7,.4],nac);
  hykPut('hkMosaic',hykTube([[0,ty-1.45,A.cz-.3],[.05,ty-2.6,A.cz-.25],[.12,ty-3.8,A.cz-.2]],t=>.06-.02*t,{seg:5,col:teal}));}
 const padY=A.door.p[1]-A.door.r*A.door.ky+.12,padZ=A.door.p[2]+2.7;hykHospLanding(o,0,padY,padZ,2.8,{mat:'hkNacre',col:nac});hykHospPadRib(o,0,padY,padZ,{});
 hykHospLamp(A,.4,A.cy+.8,{cool:true,nacre:true,level:o.level});hykHospLamp(A,-.4,A.cy+.8,{cool:true,nacre:true,level:o.level});
 hykLight(0,A.cy+A.b*.45,A.cz-.3,{r:.22,cool:true,nacre:true,level:o.level,bracket:[0,A.cy+A.b*.9,A.cz-.3]});
 const rm=hykRoom('shrine',hykCirclePoly(0,A.cz,R*.78,14),A.floorY,A.b*1.3,{doors:[[A.door.p[0],A.door.p[2],2.2,'landing']],wealth:.95});
 hykSpot(rm,'altar',0,A.cz-2.0,0,1.2,.8);hykSpot(rm,'shrine',-1.5,A.cz-1.8,0,.6,.6);hykSpot(rm,'shrine',1.5,A.cz-1.8,0,.6,.6);
 hykReg('Grown tide shrine',0,A.cz+1,R*1.6,sp.top-A.floorY);}
HYK.def({key:'hyk_pod_shrine_tides',name:'Grown tide shrine',family:'sacred',row:'Sacred',grown:true,inside:true,w:7.6,d:11,h:9.5,tags:{type:['religious'],wealth:'civic',lit:true},build:hykShrineBuildPodTides});
// ================================================================= the grown sea-god shrine (G frame)
// A taller nacre egg on the face with three spires standing on its shoulders and spines along its crown; the pearl on its
// cup behind the altar; pearls at the door, a jar over the landing; a window satellite; the landing on a rib.
function hykShrineBuildPodSeagods(G,o){reseed(30574+(o.v|0));const R=3.8;const nac=hC(hPick(HPAL.nacre)),cor=hC(hPick(HPAL.coral));
 const A=hykHospGrownPod(o,{R,b:R*1.05,e1:.8,proud:.3,mat:'hkNacre',nacre:true,col:nac,inCol:hC(hPick(HPAL.shell),.92),seed:27,
  openings:[{th:0,el:-.08,r:1.1,ky:1.2,kind:'door',main:true},{th:.9,el:.1,r:.45,kind:'window',o:{lit:true}},{th:-.9,el:.1,r:.45,kind:'window',o:{lit:true}},{th:2.0,el:.45,r:.36,kind:'window'},{th:-2.0,el:.45,r:.36,kind:'window'},{th:0,el:1.3,r:.42,kind:'window',o:{open:true}}]});
 const B=hykHospGrownPod(o,{R:1.6,x:-3.7,dy:-.4,proud:.45,mat:'hkNacre',nacre:true,col:nac,seed:29,floor:false,drips:3,openings:[{th:-.3,el:.2,r:.34,kind:'window'},{th:-1.4,el:.4,r:.26,kind:'window'}]});
 hykHospJoin(A,B,{R:1.0,f:.7});
 const recess=p=>hykHospPodRay(A,p[0]-A.cx,p[1]-A.cy,p[2]-A.cz)[1]-p[1];let top=A.top;
 for(const s of [[2.4,1.0,4.6,.68],[-2.4,1.0,4.0,.62],[Math.PI,1.15,5.4,.74]]){const p=A.surfAt(s[0],s[1]);const r=hykHospSpire(p[0],p[2],p[1]-.3,s[2],s[3],{mat:'hkNacre',col:nac,flutes:8,twist:.9,recess});top=Math.max(top,r.top);}
 hykShrineSpines(A,14,nac);kput('hkLipN',[0,A.top-.12,A.cz],qEuler(Math.PI/2,0,0),[.7,.7,.9],cor);
 hykShrinePearl(0,A.cz-2.4,A.floorY,o.level);
 const padY=A.door.p[1]-A.door.r*A.door.ky+.12,padZ=A.door.p[2]+2.7;hykHospLanding(o,0,padY,padZ,2.8,{mat:'hkNacre',col:nac});hykHospPadRib(o,0,padY,padZ,{});
 hykHospLamp(A,.4,A.cy+.8,{nacre:true,level:o.level});hykHospLamp(A,-.4,A.cy+.8,{nacre:true,level:o.level});
 {const J=A.surfAt(1.1,A.elAt(A.cy+1.3));hykLight(J[0]+.9,J[1]+.2,J[2]+.8,{r:.2,cool:true,nacre:true,level:o.level,bracket:J});}
 const rm=hykRoom('shrine',hykCirclePoly(0,A.cz,R*.78,14),A.floorY,A.b*1.3,{doors:[[A.door.p[0],A.door.p[2],2.2,'landing']],wealth:.95});
 hykSpot(rm,'altar',0,A.cz-1.4,0,1.2,.8);hykSpot(rm,'shrine',-1.5,A.cz-1.6,0,.6,.6);hykSpot(rm,'shrine',1.5,A.cz-1.6,0,.6,.6);hykSpot(rm,'seat',0,A.cz+.6,0,1.4,.6);
 hykReg('Grown sea-god shrine',0,A.cz+1,R*1.6,top-A.floorY);}
HYK.def({key:'hyk_pod_shrine_seagods',name:'Grown sea-god shrine',family:'sacred',row:'Sacred',grown:true,inside:true,w:7.6,d:11,h:11,tags:{type:['religious'],wealth:'civic',lit:true},build:hykShrineBuildPodSeagods});
