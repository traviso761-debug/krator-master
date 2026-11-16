// ================================================================= QIBLAI — the Temple Mountain, the walls (Q5; PLAN.md sections 3, 5)
// Ring 0, the central square: the great temple on its stepped platform of three cube terraces (chapels behind window grids
// in every terrace wall, a cardinal flight up each face, chortens at the corners), the sanctum on top, white and red under
// a gold roof, with the central dome (the only domes in Qiblai are here); the Hall of the Decree, where the council of
// abbots sits, one from each great monastery, with the Sultan's seat kept empty; the treasury that holds the faith's gold;
// and the great wheel house. Then the walls: each ring walled, a full wall on the outer square (a straight run, a corner
// tower, a gate tower with its gilt crown; o.v 1 the inner rings' low wall and smaller gate). Seeds 33700-33899.

// ---------------------------------------------------------------- the great temple
function buildQbTemple(G,o){reseed(33701+(o.v|0));const V=xV(o),TH=6;
 const wash=xC(xPick(XPAL.wash)),red=xC(xPick(XPAL.redwall)),stone=xC(xPick(QSTONE)),band=xC(xPick(XPAL.maroon)),g=xC(xPick(XPAL.gold)),trim=xC(XPAL.saffron);
 const T=[[90,90],[66,66],[44,44]];
 vnReg('Great temple (the Rainbow Temple)',0,0,48,3*TH+24);
 let y=0;const run=Math.max(2,Math.round(TH/.17))*.34;
 T.forEach(([w,d],i)=>{const c=i===2?red:wash;const k=qnCube(0,y,0,w,TH,d,0,c,i===2?'wash':'wash');
  // the chapels behind the terrace wall: one row of windows, the flights' bays left clear
  qnWins(0,y,0,w,d,0,[TH],k,{pitch:4.2,ww:1.1,wh:1.5,kind:'lit',trim,skip:[[-6,6]],skipUp:[[-6,6]],val:'all'});
  for(const a of[0,1,2,3]){const ry=a*Math.PI/2,half=(a%2?w:d)/2;const p=loc(0,0,0,half+run,ry);xnFlight(p[0],y,p[1],ry,8,TH,'vStone',stone);
   for(const s of[-1,1]){const q=loc(0,0,s*4.4,half+run/2,ry);kput('vStone',[q[0],y+TH/2,q[1]],vQ(ry,-Math.atan2(TH,run),0),[.8,.6,Math.hypot(TH,run)],stone);}}
  const top=qnRoof(0,y+TH,0,w*k,d*k,0,c,{band,gold:true,parapet:.9,frieze:i<2});
  // chortens at the terrace's corners (the lower two), drum rows along its parapet
  if(i<2){const nw=T[i+1][0];for(const sx of[-1,1])for(const sz of[-1,1])qnChorten(sx*(w*k/2+nw/2)/2,y+TH+.3,sz*(d*k/2+nw/2)/2,i===0?.75:.6);}
  y+=TH+.3;});
 // the sanctum: two storeys, white below and red above, a gold pavilion roof on each corner, the central dome on its drum
 const sw=28,sd=28,sh=[5.2,4.6];const S=qnStack(0,y,0,sw,sd,0,[sh[0]],wash,'wash');
 qnWins(0,y,0,sw,sd,0,[sh[0]],S.k,{pitch:3.2,ww:1.2,wh:1.8,kind:'lit',trim,skip:[[-3.5,3.5]],val:'all'});
 for(const a of[0,1,2,3]){const ry=a*Math.PI/2,p=loc(0,0,0,sd/2,ry);xnPortico(p[0],y,p[1],ry,8,2.4,4.6,wash,{band:true,valC:trim});qnDoor(p[0],y,p[1],ry,2.6,3.6,{c:xC(XPAL.red),step:false});}
 const t1=qnRoof(0,S.y,0,S.w,S.d,0,wash,{band,gold:true,parapet:.6,corner:'gold'});
 const R=qnStack(0,S.y+.3,0,sw*.7,sd*.7,0,[sh[1]],red,'wash');qnWins(0,S.y+.3,0,sw*.7,sd*.7,0,[sh[1]],R.k,{pitch:2.8,ww:1.0,wh:1.4,kind:'lit',trim,val:'all'});
 const t2=qnRoof(0,R.y,0,R.w,R.d,0,red,{band,gold:true,eave:true,eaveC:xC(xPick(XPAL.dark)),parapet:.6,corner:'gold'});
 for(const sx of[-1,1])for(const sz of[-1,1])xnGiltRoof(sx*S.w*.38,t1-.3,sz*S.d*.38,5,5,sx*sz>0?0:Math.PI/2,{frame:1.6,over:.8});
 const top=xnDome(0,t2-.3,0,R.w*.32,'G',{drum:2.6,drumItem:'xDrumM',fin:2.4});
 for(const a of[0,1,2,3]){const ry=a*Math.PI/2,p=loc(0,0,0,R.d/2-.6,ry);qnWheelDeer(p[0],t2,p[1],ry,1.3,g);}
 for(const sx of[-1,1])for(const sz of[-1,1])qnBanner(sx*(R.w/2-.4),t2,sz*(R.d/2-.4),3);
 // the eight banners on the top terrace, each in a monastery's colour and turned toward it (the owner, 2026-11-11: hence the
 // Rainbow Temple): the cardinal four beside the stairs' heads (the flights land on the axes), the diagonal four at the corners
 for(let i=0;i<8;i++){const d=qnSpokeDir(i),r=i%2?26.9:19.6,side=i%2?0:5.4;qnSpokeBanner(d[0]*r-d[1]*side,y,d[1]*r+d[0]*side,i,15);}
 // the great court at the foot: paving round the platform, pilgrims on the kora round it
 for(const a of[0,1,2,3]){const ry=a*Math.PI/2,p=loc(0,0,0,45+run+6,ry);qnPave(p[0],p[1],a%2?10:96,a%2?96:10,0);}
 xnFolk(0,0,45+run+5,10,30);xnFolk(-45-run-5,0,0,8,30);if(V===1)for(let i=0;i<12;i++)vBall('xGold',-30+i*5.4,TH+1.4,45.4,.12,xC(0xe8a030));}   // the festival's butter lamps along the first terrace

// ---------------------------------------------------------------- the Hall of the Decree
// The seat of the Prismarchy, the council of the eight abbots (the Prismarchs; the owner, 2026-11-11): a red hall on a high
// plinth, a ten-column portico, three storeys; eight banners on its front parapet, one for each Prismarch in his monastery's
// colour; the gilt crown with the wheel and deer. (The Sultan's empty seat is inside: Q6's interior.)
function buildQbHallDecree(G,o){reseed(33711+(o.v|0));const V=xV(o),W=40,D=28,P=2.2,ZB=-3,hs=[6.0,4.6,4.2];
 const red=xC(xPick(XPAL.redwall)),wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE)),band=xC(xPick(XPAL.maroon)),g=xC(xPick(XPAL.gold)),trim=xC(XPAL.saffron);
 vnReg('Hall of the Decree (the Prismarchy)',0,ZB,26,P+15+8);
 const F=ZB+D/2;qnPlinth(0,ZB+2,W+2,D+4,P,0,stone);
 const S=qnStack(0,P,ZB,W,D,0,hs,red,'wash',xC(XPAL.white));
 qnWins(0,P,ZB,W,D,0,hs,S.k,{pitch:3.0,ww:1.2,wh:1.8,kind:'lit',trim,val:'all',skip:[[-15,15]]});
 xnPortico(0,P,F,0,30,4,5.6,wash,{band:true,valC:trim,colC:xC(XPAL.red)});qnDoor(0,P,F,0,3.2,4.4,{c:xC(XPAL.gold[0]),leaf:xC(XPAL.red),step:false});
 for(const s of[-1,1])qnDoor(s*9,P,F,0,1.8,3.2,{c:xC(XPAL.red),step:false});
 xnFlight(0,0,F+4+Math.max(2,Math.round(P/.17))*.34-.2,0,16,P,'vStone',stone);
 const t=qnRoof(0,S.y,ZB,S.w,S.d,0,red,{band,gold:true,eave:true,eaveC:xC(xPick(XPAL.dark)),parapet:.8,corner:'gold'});
 qnCrown(0,t,ZB,S.w,S.d,0,{pav:[S.w*.42,S.d*.45],deerS:1.5,banners:false});
 kput('qPlaqueHall',[0,t-.42,ZB+S.d/2+.16],null,[4.8,1.2,1],null);   /* the Decree, in its script, on the front parapet */
 for(let i=0;i<8;i++){const u=-S.w/2+2+i*(S.w-4)/7;qnBanner(u,t,ZB+S.d/2-.4,3.2,null,xC(QSPOKE[i].wall));}   /* one per Prismarch, in his colour */
 for(const s of[-1,1])for(const sz of[-1,1])qnBanner(s*(S.w/2-.4),t,ZB+sz*(S.d/2-.4)-(sz>0?0:0),2.4);
 qnPave(0,F+4+4.5,W,3,0);xnFolk(0,0,F+9,6,10);}

// ---------------------------------------------------------------- the treasury: the faith's gold behind blank walls
function buildQbTreasury(G,o){reseed(33721+(o.v|0));const V=xV(o),W=24,D=20,P=1.6,hs=[5,4.2,3.8];
 const wash=xC(xPick(XPAL.wash)),red=xC(xPick(XPAL.redwall)),stone=xC(xPick(QSTONE)),band=xC(xPick(XPAL.maroon)),dark=xC(xPick(XPAL.dark));
 vnReg('Treasury',0,-1,15,P+13+6);
 qnPlinth(0,-1,W,D,P,0,stone);const S=qnStack(0,P,-1,W,D,0,hs,wash,'wash',xC(XPAL.white));const F=-1+D/2;
 // no window below the top storey: slits only, in the grid; the top storey's small windows; an iron-bound door
 qnWins(0,P,-1,W,D,0,hs,S.k,{pitch:2.4,ww:.22,wh:1.0,kind:'open',trim:xC(XPAL.black),top:1,skip:[[-2.4,2.4]]});
 qnWins(0,P+hs[0]+hs[1],-1,W*Math.pow(S.k,2),D*Math.pow(S.k,2),0,[hs[2]],S.k,{pitch:2.6,ww:.8,wh:1.0,kind:'lit',trim:xC(XPAL.saffron),val:'all'});
 qnDoor(0,P,F,0,2.2,3.0,{c:xC(XPAL.gold[0]),leaf:dark,step:false});for(let i=0;i<5;i++)vB('vIron',0,P+.4+i*.55,F+.12,2.0,.08,.04,0);
 xnFlight(0,0,F+Math.max(2,Math.round(P/.17))*.34,0,4,P,'vStone',stone);
 const t=qnRoof(0,S.y,-1,S.w,S.d,0,wash,{band,gold:true,parapet:.8,corner:'gold'});
 const T=qnTerraces(0,S.y+.3,-1,0,[[S.w*.5,S.d*.5,3.2,0]],red,{band,parapet:.6});qnCrown(0,T[0].top,-1,T[0].w,T[0].d,0,{pav:[5,4],deerS:.8});
 for(const s of[-1,1])vPst('vPost',s*2.2,P,F+1.6,.06,2.2,xC(0x3a3430));}

// ---------------------------------------------------------------- the great wheel house (the Temple Mountain's)
// the city's greatest prayer wheel, turned by the Ālph's water led up to it: open on all four sides between red piers, the
// wheel in the mosaic of the Song with gilt bands, under a gilt dome on a red drum (the Temple Mountain may have domes)
function buildQbGreatWheel(G,o){reseed(33731+(o.v|0));const V=xV(o),W=20,P=1.4,H=12;
 const wash=xC(xPick(XPAL.wash)),red=xC(xPick(XPAL.redwall)),stone=xC(xPick(QSTONE)),band=xC(xPick(XPAL.maroon)),g=xC(xPick(XPAL.gold));
 vnReg('Great wheel house',0,0,13,P+H+12);
 qnPlinth(0,0,W,W,P,0,stone);
 for(const sx of[-1,1])for(const sz of[-1,1])qnCube(sx*(W/2-2),P,sz*(W/2-2),3.6,H,3.6,0,wash,'wash');
 for(const a of[0,1,2,3]){const ry=a*Math.PI/2,p=loc(0,0,0,W/2-2,ry);vB('xWashB',p[0],P+H-2.2,p[1],W-7,2.2,3.6,ry,wash);for(const s of[-1,1]){const q=loc(0,0,s*2.4,W/2-1.2,ry);xnCol(q[0],P,q[1],H-2.2,.32,ry,xC(XPAL.red),xC(XPAL.saffron));}
  const f=loc(0,0,0,W/2+qnRun(P),ry);xnFlight(f[0],0,f[1],ry,6,P,'vStone',stone);}
 const t=qnRoof(0,P+H,0,W,W,0,wash,{band,gold:true,parapet:.7,corner:'gold'});
 // the wheel
 const R2=4.2,Hw=9;kput('xDrumS',[0,P,0],null,[R2+.5,.5,R2+.5],stone);kput('qSongDrum',[0,P+.5,0],null,[R2,Hw,R2],null);
 for(const tt of[.5,Hw*.33+.5,Hw*.66+.5,Hw+.4])kput('xDrumS',[0,P+tt,0],null,[R2+.1,.26,R2+.1],g);kput('xDomeT',[0,P+.5+Hw,0],null,[R2,1.0,R2],xC(XPAL.red));
 // the drum and the gilt dome over it, the wheel and deer on its four faces
 kput('xDrumT',[0,t,0],null,[6.4,2.6,6.4],red);vB('xBandB',0,t+2.2,0,13,.4,13,0,band);
 xnDome(0,t+2.6,0,6.0,'G',{drum:.8,drumItem:'xDrumM',fin:2.0});
 for(const a of[0,1,2,3]){const ry=a*Math.PI/2,p=loc(0,0,0,W/2-1,ry);qnWheelDeer(p[0],t,p[1],ry,1.1,g);}
 // the race that turns it, under the plinth on the east side (V 1: dry; the wheel turned by hand)
 if(V!==1){vB('xWaterB',W/2+4,0.05,0,6,.15,3,0,xC(XPAL.water));vB('vStone',W/2+4,0,-1.8,6,.5,.5,0,stone);vB('vStone',W/2+4,0,1.8,6,.5,.5,0,stone);}
 xnFolk(0,P,W/2-4,4,4);}
const qnRun=h=>Math.max(2,Math.round(h/.17))*.34;   // a flight's run for a rise h (xnFlight's treads: 0.17 high, 0.34 deep)

// ---------------------------------------------------------------- the walls (each ring walled; a full wall on the outer square)
// o.v 0: the outer square's full wall (8 m, a walk and a parapet); 1: an inner ring's low wall (3.6 m); 2: the full wall
// with a buttress tower at its middle. White wash over a dressed stone base, the maroon band under the parapet.
function buildQbWall(G,o){reseed(33741+(o.v|0));const V=xV(o),L=o.len==null?30:o.len,inner=V===1,H=inner?3.6:8,T=inner?1.4:4;   /* o.len: a run of any length (the city's, between its towers) */
 const wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE)),band=xC(xPick(XPAL.maroon));
 vnReg('Ring wall',0,0,L/2,H+2);
 qnCube(0,0,0,L,1.2,T+.6,0,stone,'ashlar');const k=qnCube(0,1.2,0,L,H-1.2,T,0,wash,'wash');
 vB('xBandB',0,H-.8,0,L,.5,T*k+.12,0,band);vB('xWashB',0,H-.3,0,L,.3,T*k+.2,0,wash);
 for(const s of[-1,1])vB('xWashB',0,H,s*(T*k/2-.15),L,inner?.5:1.1,.3,0,wash);
 if(!inner)for(let i=0;i<Math.floor(L/3);i++){const u=-L/2+1.5+i*3;vB('vDarkB',u,H+.35,T*k/2+.02,.25,.5,.06,0);}   // the loops in the parapet
 if(V===2){const tk=qnCube(0,0,T/2+2.2,9,H+3,4.4,0,wash,'wash');qnWins(0,0,T/2+2.2,9,4.4,0,[H+3],tk,{pitch:3,ww:.3,wh:1.0,kind:'open',trim:xC(XPAL.black),back:false,left:false,right:false,sill:H-1.4});
  const t=qnRoof(0,H+3,T/2+2.2,9*tk,4.4*tk,0,wash,{band,parapet:.8,corner:'flag'});}}
// the corner tower: a square cube tower over the wall's corner, slit windows, banners on its roof
function buildQbWallCorner(G,o){reseed(33751+(o.v|0));const V=xV(o),inner=V===1,S=inner?6:11,H=inner?6:14;
 const wash=xC(xPick(XPAL.wash)),stone=xC(xPick(QSTONE)),band=xC(xPick(XPAL.maroon));
 vnReg('Wall corner tower',0,0,S*.75,H+4);
 qnCube(0,0,0,S+.6,1.4,S+.6,0,stone,'ashlar');const St=qnStack(0,1.4,0,S,S,0,[H-1.4],wash,'wash');
 qnWins(0,1.4,0,S,S,0,[H-1.4],St.k,{pitch:2.6,ww:.3,wh:1.1,kind:'open',trim:xC(XPAL.black),sill:H*.55});
 const t=qnRoof(0,St.y,0,St.w,St.d,0,wash,{band,parapet:.9});
 for(const sx of[-1,1])for(const sz of[-1,1])qnBanner(sx*(St.w/2-.4),t,sz*(St.d/2-.4),inner?1.8:2.6);}
// the gate tower: a great cube over the passage, two flanking towers a storey higher, the gilt crown with the wheel and
// deer (the gate towers carry gilt crowns: PLAN.md section 4), the eight-spoked wheel over the arch. +z is outside.
function buildQbWallGate(G,o){reseed(33761+(o.v|0));const V=xV(o),inner=V===1,W=inner?16:26,D=inner?8:14,H=inner?9:16,pw=inner?4:6,ph=inner?5:7.5;
 const wash=xC(xPick(XPAL.wash)),red=xC(xPick(XPAL.redwall)),stone=xC(xPick(QSTONE)),band=xC(xPick(XPAL.maroon)),g=xC(xPick(XPAL.gold)),trim=xC(XPAL.saffron);
 vnReg('Gate tower',0,0,W*.6,H+9);
 qnCube(0,0,0,W+.6,1.4,D+.6,0,stone,'ashlar');const S=qnStack(0,1.4,0,W,D,0,[H-1.4],wash,'wash');
 // the passage: its dark through-way, the arch frame and the leaves on both faces, the wheel above
 vB('vDarkB',0,0,0,pw,ph,D+.8,0);for(const s of[-1,1]){xnArch('xArchS',0,0,s*(D/2+.32),s>0?0:Math.PI,pw+1.6,ph+1.4,.5,stone);xnDoorway(0,0,s*(D/2+.05),s>0?0:Math.PI,pw,ph-.2,{});}
 qnWheel(0,ph+(inner?3.05:3.9),D/2+.3,0,inner?.9:1.5,g);   /* the wheel over the city's name in its script */
 for(const s of[-1,1])kput('qPlaqueGate',[0,ph+(inner?1.75:1.9),s*(D/2+.33)],qEuler(0,s>0?0:Math.PI,0),inner?[2.8,.7,1]:[4,1,1],null);
 qnWins(0,1.4,0,W,D,0,[H-1.4],S.k,{pitch:2.8,ww:.9,wh:1.2,kind:'lit',trim,skip:[[-pw/2-1.6,pw/2+1.6]],skipUp:[[-pw/2-1.6,pw/2+1.6]],left:false,right:false,sill:ph+.8});
 const t=qnRoof(0,S.y,0,S.w,S.d,0,wash,{band,gold:true,parapet:.8});
 for(const s of[-1,1]){const x=s*(W/2+(inner?1.6:2.8)),tw=inner?3.6:6,th=H+(inner?2.4:4);const Tt=qnStack(x,0,0,tw,D+1.2,0,[th],wash,'wash');
  qnWins(x,0,0,tw,D+1.2,0,[th],Tt.k,{pitch:2.4,ww:.3,wh:1.1,kind:'open',trim:xC(XPAL.black),sill:th*.6,left:s<0,right:s>0});
  const tt=qnRoof(x,Tt.y,0,Tt.w,Tt.d,0,red,{band,gold:true,parapet:.7,corner:'gold'});}
 qnCrown(0,t,0,S.w,S.d,0,{pav:[S.w*.4,S.d*.5],deerS:inner?.8:1.2});}

// ---------------------------------------------------------------- the terrace stair (PLAN.md Q7a; the owner, 2026-11-16: "make gates go both ways")
// A gate's way down its lower side: from its sill (y 0, z 0, the gate's face) out along +z and down o.rise metres, in flights
// of 3 m at most (0.17 m risers, 0.34 m treads) with a 3 m landing between them, a 1.2 m landing at the top and 1 m at the
// foot; o.w wide between ashlar side walls 0.9 m over the treads; a banner post either side of the foot. Each tread and landing
// is a solid ashlar mass down to 1.5 m under the foot, so the stair stands on a falling ground. qnStairPlan(rise) is its
// layout ({segs: [{k: 'land', z0, z1, y} | {k: 'flight', z0, z1, y0, y1, n}], len}): a world reads it for the walker's floors.
function qnStairPlan(rise,o){o=o||{};const rh=.17,td=.34,every=o.every==null?3:o.every,land=o.land==null?3:o.land,top=o.top==null?1.2:o.top,segs=[];
 segs.push({k:'land',z0:0,z1:top,y:0});let z=top,y=0,left=rise;
 while(left>1e-6){const r=Math.min(every,left),n=Math.max(1,Math.round(r/rh)),run=n*td;segs.push({k:'flight',z0:z,z1:z+run,y0:y,y1:y-r,n});z+=run;y-=r;left-=r;
  if(left>1e-6){segs.push({k:'land',z0:z,z1:z+land,y});z+=land;}}
 segs.push({k:'land',z0:z,z1:z+1,y});return{segs,len:z+1};}
function buildQbTerraceStair(G,o){reseed(33791+(o.v|0));const rise=o.rise==null?4:o.rise,w=o.w==null?8:o.w,stone=xC(xPick(QSTONE)),base=-rise-1.5,S=qnStairPlan(rise);
 vnReg('Terrace stair',0,S.len/2,Math.max(w,S.len)/2+1,1.2);
 const mass=(x,ww,zc,d,top)=>vB('qAshB',x,base,zc,ww,top-base,d,0,stone);
 for(const s of S.segs){if(s.k==='land'){mass(0,w,(s.z0+s.z1)/2,s.z1-s.z0,s.y);for(const e of[-1,1])mass(e*(w/2+.3),.6,(s.z0+s.z1)/2,s.z1-s.z0,s.y+.9);continue;}
  const rh=(s.y0-s.y1)/s.n,td=(s.z1-s.z0)/s.n;
  for(let i=0;i<s.n;i++){const top=s.y0-(i+1)*rh,zc=s.z0+(i+.5)*td;vB('vStone',0,base,zc,w,top-base,td,0,stone);for(const e of[-1,1])mass(e*(w/2+.3),.6,zc,td,top+.9);}}
 const f=S.segs[S.segs.length-1];for(const e of[-1,1])qnBanner(e*(w/2+.3),f.y+.9,f.z1-.4,3.4);}
// ---------------------------------------------------------------- the Temple Mountain, whole (Q7a): ring 0's one landmark lot
// The central 3 x 3 blocks less their streets, 312 m square: the Rainbow Temple at the centre, its four flights on the four
// avenues (which end at the lot's edge on the axes, so nothing stands on an axis); the Hall of the Decree, where the
// Prismarchy sits, in the north-west quarter facing the temple; the great wheel house in the north-east; the treasury in the
// south-west; the great chorten in the south-east; the court laid in ashlar, a chorten at each corner.
function buildQbTempleMountain(G,o){reseed(33771+(o.v|0));const W=312,stone=xC(xPick(QSTONE));
 vnReg('The Temple Mountain',0,0,W*.48,52);
 vB('qAshB',0,0,0,W-6,.2,W-6,0,stone);
 xnSub('qb_temple',0,0,0,0,{v:0});
 const Q=100;
 xnSub('qb_hall_decree',-Q,0,-Q,0,{v:0});
 xnSub('qb_great_wheel',Q,0,-Q,0,{v:0});
 xnSub('qb_treasury',-Q,0,Q,Math.PI,{v:0});
 xnSub('qb_chorten',Q,0,Q,0,{v:2});
 for(const sx of[-1,1])for(const sz of[-1,1])xnSub('qb_chorten',sx*(W/2-14),0,sz*(W/2-14),0,{v:1});}
QB.def({key:'qb_temple_mountain',name:'The Temple Mountain',family:'The Temple Mountain',tags:QTAG('civic',['religious','civic'],{landmark:true,note:'ring 0, whole: the Rainbow Temple, the Hall of the Decree, the great wheel house, the treasury, the great chorten'}),w:312,d:312,h:52,fw:306,fd:306,nv:1,build:buildQbTempleMountain});
QB.def({key:'qb_temple',name:'Great temple (the Rainbow Temple)',family:'The Temple Mountain',tags:QTAG('civic',['religious'],{landmark:true,job:'worship',note:'ring 0: the stepped platform, the sanctum, the central dome'}),w:120,d:120,h:48,fw:92,fd:92,nv:2,build:buildQbTemple});
QB.def({key:'qb_hall_decree',name:'Hall of the Decree (the Prismarchy)',family:'The Temple Mountain',tags:QTAG('civic',['civic','religious'],{landmark:true,note:'the Prismarchy, the council of the eight Prismarchs; the Sultan\'s seat kept empty'}),w:42,d:42,h:26,fw:42,fd:32,nv:2,build:buildQbHallDecree});
QB.def({key:'qb_treasury',name:'Treasury',family:'The Temple Mountain',tags:QTAG('civic',['civic']),w:24,d:26,h:22,fw:24,fd:20,nv:2,build:buildQbTreasury});
QB.def({key:'qb_great_wheel',name:'Great wheel house',family:'The Temple Mountain',tags:QTAG('civic',['religious'],{landmark:true}),w:34,d:28,h:28,fw:20,fd:20,nv:2,build:buildQbGreatWheel});
QB.def({key:'qb_wall',name:'Ring wall',family:'Walls and gates',tags:QTAG('civic',['military','infrastructure']),w:30,d:14,h:12,fw:30,fd:5,build:buildQbWall});
QB.def({key:'qb_wall_corner',name:'Wall corner tower',family:'Walls and gates',tags:QTAG('civic',['military']),w:12,d:12,h:17,fw:12,fd:12,nv:2,build:buildQbWallCorner});
QB.def({key:'qb_terrace_stair',name:'Terrace stair',family:'Walls and gates',tags:QTAG('civic',['infrastructure']),w:10,d:24,h:6,fw:10,fd:24,build:(G,o)=>buildQbTerraceStair(G,Object.assign({rise:6,w:8},o))});
QB.def({key:'qb_wall_gate',name:'Gate tower',family:'Walls and gates',tags:QTAG('civic',['military','infrastructure']),w:40,d:16,h:26,fw:40,fd:15,nv:2,build:buildQbWallGate});
