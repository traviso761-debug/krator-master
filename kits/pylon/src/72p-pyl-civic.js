// ================================================================= 72p. PYLON: civic (PLAN.md section 4)
// The Salvagers' Guild (the city's real power), the Emperor's assay office, the watch, the cult of the Ancients, a school
// and a clinic. Neo-Ancient: white render and concrete, the Ancient profiles, Iziz orange; lit (the lighting rule: civic).
// The governor's palace and the reclaimed Ancient temple come later (PLAN.md P4, P5). Seeds 9201-9299.
const PY_TAG_CIV={culture:'pylon',style:'neo',type:['civic'],wealth:'civic',lit:true};

// a round arch band: a semicircle of n short boxes, radius r (to the band's middle), t thick and deep d, centred on
// (x, z) of a face, springing at y; for gates and openings too big for the profile slabs
function pynArc(x,y,z,ry,r,t,d,c,n){n=n||14;for(let k=0;k<n;k++){const a=Math.PI*(k+.5)/n,p=loc(x,z,Math.cos(a)*r,d/2,ry);
 vBq('vPlaster',p[0],y+Math.sin(a)*r,p[1],t,Math.PI*r/n+.04,d,vQ(ry,0,a),c);}}

// Salvagers' Guild (refs/ancient office.jpg): the guild hall, a long block whose ground storey is an arcade of
// round-headed bays and whose upper wall is pierced by a graded cluster of great portholes; a tower at the west end with
// rounded merlons and strips of slot windows; the vault for the finds on the east, behind a round vault door; a stepped
// forecourt with banners.
function buildPylSalvagersGuild(G,o){reseed(9201+(o.v|0));const W=26,D=14,H=9.5,Z=-4.5,zf=Z+D/2,N=7;
 const wh=vC(vPick(PYPAL.white)),cr=vC(vPick(PYPAL.cream)),conc=vC(vPick(PYPAL.formwork)),or=vC(vPick(PYPAL.orange)),sf=vC(vPick(PYPAL.saffron)),gun=vC(vPick(PYPAL.gunmetal)),st=vC(vPick(PYPAL.stoneGrey));
 vnReg('Salvagers\' Guild — the hall',0,Z,14,H+1,{role:'guild'});vnReg('Salvagers\' Guild — tower',-W/2-1.5,Z-1,3.6,17);vnReg('Salvagers\' Guild — the vault of finds',W/2+3.2,Z+1,4,5);
 vB('vStone',0,0,Z,W+1,.35,D+1,0,st);vB('vStone',0,0,zf+2.2,W-4,.2,3.6,0,st);vB('vStone',0,0,zf+1,W-2,.35,1.6,0,st);
 vnBody('vPlaster',0,.35,Z,W,H,D,0,cr,{t:.4});
 for(let k=0;k<N;k++){const x=-W/2+(k+.5)*W/N;pynFrame('tomb',x,.35,zf,0,2.4,4.6,{rim:.22,n:2,cs:[sf,or],fill:k===3?'W':'G',fc:k===3?vC(PYPAL.walnut[0]):null,out:.05});if(k%2===1)vnLamp(x+1.85,4.2,zf+.02,0);}
 pynBand(0,5.6,Z,W,D,.3,.15,0,or);
 pynPortCluster(0,6.2,zf,0,W-1.5,H-6.6,11,1.25,sf,'G');
 vB('vPlaster',0,H+.35,Z,W+.3,.4,D+.3,0,or);vB('vPlaster',0,H+.75,Z,W,.6,D,0,cr);
 // the tower: rounded merlons and slot-window strips
 const tx=-W/2-1.5,tz=Z-1;vB('vPlaster',tx,.35,tz,5,16,5.4,0,wh);
 for(let k=0;k<3;k++)pynVault(tx-1.65+k*1.65,16.35,tz,1.4,5.4,.9,0,'pyHalf',wh);
 for(const dx of[-1.1,0,1.1])for(let j=0;j<11;j++)vB('vWinGlass',tx+dx,2.2+j*1.2,tz+2.72,.34,.7,.06,0,null);
 vB('vPlaster',tx,.35,tz+2.75,5.2,.3,.1,0,or);
 // the vault of finds: a concrete block with a round vault door
 const vx=W/2+3.2;vB('pyConc',vx,0,Z+1,6,4.6,6.4,0,conc);vB('vPlaster',vx,4.6,Z+1,6.2,.2,6.6,0,or);
 pynPorthole(vx,2.1,Z+4.2,0,1.5,gun,'C',6);
 for(const s of[-1,1]){vnBannerPole(s*6,0,zf+3.8,0,7,sf);vnLampPost(s*10,0,zf+3,3.2);}}

// Assay office: where the salvage is weighed and graded and the Emperor's tithe taken; Izani-run, so it carries the
// empire's marks: a small verdigris dome on a drum with the orb, the orange banner. A concrete block with one great
// glazed tombstone opening on the weighing hall, a weighbridge before it.
function buildPylAssayOffice(G,o){reseed(9211+(o.v|0));const W=11,D=9,H=5.6,Z=-1.8,zf=Z+D/2;
 const conc=vC(vPick(PYPAL.formwork)),wh=vC(vPick(PYPAL.white)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal)),st=vC(vPick(PYPAL.stoneGrey));
 vnReg('Assay office',0,Z,7.2,H+4,{role:'assayer'});
 vnBody('pyConc',0,0,Z,W,H,D,0,conc,{t:.3});vB('vPlaster',0,H,Z,W+.3,.35,D+.3,0,or);vB('pyConc',0,H+.35,Z,W,.5,D,0,conc);
 pynFrame('tomb',-1.2,0,zf,0,3.4,4.6,{rim:.24,n:2,cs:[wh,or],fill:'G',out:.05});
 vnDoor(3.4,0,zf,0,1.1,2.4,'vPlaster',or,vC(vPick(PYPAL.walnut)),false);
 vPst('vPostS',0,H+.85,Z,1.6,1.1,wh);kput('vDomeC',[0,H+1.95,Z],null,[1.6,1.3,1.6],null);vBall('vFinial',0,H+3.45,Z,.28);
 vnBannerPole(5,0,zf+1.2,0,6,vC(vPick(VPAL.orange)));
 vB('vIron',-1.2,0,zf+2.6,4,.12,3,0,gun);vB('vStone',-1.2,0,zf+2.6,4.4,.08,3.4,0,st);
 vB('vIron',-3.6,0,zf+2.6,.3,2.2,.3,0,gun);vB('vIron',-3.6,2.2,zf+2.6,.3,.2,3,0,gun);}

// The watch (refs/fortress.jpg): the city watch's gate fort, two round white towers with strips of slot windows and
// battlemented tops, joined over a round-headed gate by a bridge block; saffron legs clasping the gate's jambs.
function buildPylWatch(G,o){reseed(9221+(o.v|0));const R=3,H=15,GX=6,GW=6,BY=7.2,BH=4.4;
 const wh=vC(vPick(PYPAL.white)),sf=vC(vPick(PYPAL.saffron)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal));
 vnReg('The watch — gate fort',0,0,10,H+1.5,{role:'watch'});
 for(const s of[-1,1]){const x=s*GX;vPst('vTankW',x,0,0,R,H,wh);vPst('vTankW',x,H,0,R+.25,.5,wh);
  for(let k=0;k<10;k++){const a=k*TAU/10;vB('vPlaster',x+Math.sin(a)*(R+.05),H+.5,Math.cos(a)*(R+.05),.9,.9,.5,a,wh);}
  for(const a of[-.32,.32])for(let j=0;j<14;j++){const p=[x+Math.sin(a)*(R+.02),Math.cos(a)*(R+.02)];vB('vWinGlass',p[0],1.6+j*.9,p[1],.26,.55,.08,a,null);}
  // the saffron leg: a slab clasping the tower's gate side, rising to the bridge
  vB('vPlaster',s*(GW/2+.35),0,0,.7,BY,R*1.6,0,sf);}
 // the bridge block over the gate, its arch, the gate's leaves
 vB('vPlaster',0,BY,0,GW+.2,BH,R*1.4,0,wh);vB('vPlaster',0,BY+BH,0,GW+.6,.3,R*1.6,0,or);
 for(let k=0;k<5;k++)vB('vWinGlass',-2.4+k*1.2,BY+1.4,R*.7+.02,.5,1.4,.06,0,null);
 for(const zz of[R*.7,-R*.7])pynArc(0,BY-GW/2,zz,zz>0?0:Math.PI,GW/2-.2,.5,.4,sf,16);
 for(const s of[-1,1])vB('vWood',s*1.5,0,-R*.5,2.9,BY-.6,.15,0,vC(0x5a3a24));
 for(const s of[-1,1])vnLamp(s*(GW/2-.1),4.2,R*.8,0);vnBannerPole(0,BY+BH+.3,0,0,4,vC(vPick(VPAL.orange)));}

// Cult shrine (refs/pylon - temple.jpg): the post-Cataclysm cult of the Ancients: two battered pylons either side of a
// pointed niche door under a pediment, banded in orange with a dark slot down each; obelisk lamps on the forecourt.
function buildPylCultShrine(G,o){reseed(9231+(o.v|0));const Z=-1.5;
 const wh=vC(vPick(PYPAL.white)),or=vC(vPick(PYPAL.orange)),sf=vC(vPick(PYPAL.saffron)),st=vC(vPick(PYPAL.stoneGrey));
 vnReg('Shrine of the Ancients',0,Z,6.5,10,{type:['religious'],role:'priest'});
 vB('vStone',0,0,Z,12.4,.4,7.6,0,st);vnStairs(0,0,Z+4.4,0,3.2,.4,2,'vStone',st);
 for(const s of[-1,1]){kput('vBatterP',[s*3.7,.4,Z],null,[3.6,9,4.6],wh);vB('vPlaster',s*3.7,7.2,Z,3.3,.35,4.2,0,or);
  const lean=Math.atan(.32/9),hz=2.3-.32*3.5/9;vBq('pyPaneB',s*3.7,3.9,Z+hz+.03,.4,5.8,.08,vQ(0,-lean,0),null);vB('vPlaster',s*3.7,.4,Z+2.1,3.2,.35,.2,0,or);}
 vB('vPlaster',0,.4,Z-.4,4,6.2,3.2,0,wh);
 pynDoorway('point',0,.4,Z+1.2,0,1.8,4.6,{rim:.2,n:2,cs:[sf,or],out:.05});
 const pf=loc(0,Z+1.0,0,0,0);kput('vGablePl',[pf[0],6.6,pf[1]],vQ(Math.PI/2,0,0),[.6,1.8,7.6],or);
 for(const s of[-1,1])for(const z of[Z+4.9,Z+6.9]){vB('vPlaster',s*5,0,z,.5,4.2,.5,0,wh);kput('vPyrS',[s*5,4.2,z],null,[.5,.6,.5],sf);vBall('vBulb',s*5,4.95,z,.12);}}

// School: a two-storey neo-Ancient block, a row of pill windows lined in orange on the upper floor, a glazed ground
// floor under an orange canopy at the door, behind a low court wall.
function buildPylSchool(G,o){reseed(9241+(o.v|0));const W=20,D=9,H=3.8,Z=-3.5,zf=Z+D/2;
 const wh=vC(vPick(PYPAL.white)),or=vC(vPick(PYPAL.orange)),gun=vC(vPick(PYPAL.gunmetal)),conc=vC(vPick(PYPAL.formwork));
 vnReg('School',0,Z,11,2*H+1.6,{role:'teacher'});
 vnBody('vPlaster',0,0,Z,W,2*H+.3,D,0,wh,{t:.3});vB('vPlaster',0,2*H+.3,Z,W+.3,.35,D+.3,0,or);vB('vPlaster',0,2*H+.65,Z,W,.5,D,0,wh);
 for(let k=0;k<7;k++){const x=-W/2+1.6+k*(W-3.2)/6;pynStadium(x,H+.5,zf,0,1.1,2.6,.12,.12,'P',or);pynStadium(x,H+.65,zf,0,.75,2.3,.17,.05,'G');}
 for(const x of[-6.5,-3,3,6.5])vnWin(x,.6,zf,0,2.4,2.2,'glass','vIron',gun);
 vnDoor(0,0,zf,0,1.6,2.6,'vIron',gun,gun,false);pynCanopy(0,3.2,zf,0,5,2.4,.3,or);
 for(const s of[-1,1]){vB('pyConc',s*(W/2+1.5),0,zf+4,.3,1.4,8,0,conc);vB('pyConc',s*(W/4+1.6),0,zf+7.8,W/2-1.2,1.4,.3,0,conc);}
 vnLampPost(-2.4,0,zf+5,3);vnLampPost(2.4,0,zf+5,3);}

// Clinic: twin barrel vaults on low walls, portholes down their sides, glazed tombstone ends; an orange canopy on posts
// over the door between them; the sign, an orange disc with a white bar.
function buildPylClinic(G,o){reseed(9251+(o.v|0));const WALL=2.6,Z=-1.6;
 const wh=vC(vPick(PYPAL.white)),cr=vC(vPick(PYPAL.cream)),or=vC(vPick(PYPAL.orange)),st=vC(vPick(PYPAL.stoneGrey));
 vnReg('Clinic',0,Z,8.5,WALL+3.6,{role:'healer',type:['civic']});
 vB('vStone',0,0,Z,15.6,.4,11.4,0,st);
 for(const s of[-1,1]){const x=s*4.2,zf=Z+5.2;vnBody('vPlaster',x,.4,Z,6,WALL,10.4,0,wh,{t:.25});pynVault(x,.4+WALL,Z,6.2,10.4,3,0,'pyHalf',wh);
  pynFrame('tomb',x,.65,zf,0,4.2,WALL+2.2,{rim:.2,c:or,fill:'G',out:.05});
  for(let k=0;k<3;k++)pynPorthole(x+s*3,1.8,Z-3+k*3,s*Math.PI/2,.42,or,'G',0);}
 vnBody('vPlaster',0,.4,Z-1,2.4,WALL+.6,8.4,0,cr,{t:.2});
 vB('vPlaster',0,.4,Z+4.2,2.4,WALL+.6,2,0,cr);vnDoor(0,.4,Z+5.2,0,1.3,2.4,'vPlaster',or,vC(vPick(PYPAL.walnut)),false);
 pynCanopy(0,3.4,Z+5.2,0,3.4,2.2,.25,or);for(const s of[-1,1])vPst('vPipe',s*1.5,.4,Z+7.2,.07,3,vC(vPick(PYPAL.gunmetal)));
 pynDisc(0,4.1,Z+5.2,0,.55,or);const b=loc(0,Z+5.2,0,.12,0);vB('vPlaster',b[0],3.98,b[1],.7,.22,.04,0,wh);}

VERN.def({key:'pyl_salvagers_guild',name:'Salvagers\' Guild',family:'civic',tags:Object.assign({},PY_TAG_CIV,{role:'guild'}),w:40,d:24,h:18,build:buildPylSalvagersGuild});
VERN.def({key:'pyl_assay_office',name:'Assay office',family:'civic',tags:PY_TAG_CIV,w:14,d:14,h:10,build:buildPylAssayOffice});
VERN.def({key:'pyl_watch',name:'The watch (gate fort)',family:'civic',tags:Object.assign({},PY_TAG_CIV,{type:['civic','military']}),w:20,d:8,h:17,build:buildPylWatch});
VERN.def({key:'pyl_cult_shrine',name:'Shrine of the Ancients',family:'civic',tags:Object.assign({},PY_TAG_CIV,{type:['religious']}),w:14,d:12,h:10,build:buildPylCultShrine});
VERN.def({key:'pyl_school',name:'School',family:'civic',tags:PY_TAG_CIV,w:24,d:18,h:9,build:buildPylSchool});
VERN.def({key:'pyl_clinic',name:'Clinic',family:'civic',tags:PY_TAG_CIV,w:16,d:14,h:7,build:buildPylClinic});
