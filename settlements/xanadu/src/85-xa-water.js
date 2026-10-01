// ================================================================= XANADU — the water modules (package X-L, round 6)
// Travis: the channels of the baths as modules that tile end to end and cap off with pools or fountains — and
// slanted versions, with a waterfall, so they can be placed on uneven ground. Every piece sits on the same 8 m plot
// with its rill on the plot's centre line running out to the plot edge, so two pieces placed 8 m apart on the same
// axis join flush: straight, bend, cross, the two caps; and the slope pieces, whose rill enters at the +z edge `rise`
// metres above the level it leaves at the −z edge: step (a three-step cascade over a terrace), ramp, cascade (a
// chadar stair), fall (a waterfall over a rock ledge into a plunge pool). Seeds 32300–32399.

const XWATER=xC(XPAL.water),XFOAM=xC(0xe8f4f8),XSHEET=xC(0xbfe4ec);
// a sunken basin: a tiled bed, water, and a curb RING round it (a solid curb slab would bury the water — that was
// the pool that never showed). (x,z) centre, w × d the water
function xnRillBasin(x,y,z,w,d,ry,curb,c){const P=(u,v)=>loc(x,z,u,v,ry);vB('xTilesB',x,y-.22,z,w+.2,.2,d+.2,ry,xC(XPAL.turquoise));vB('xWaterB',x,y-.02,z,w,.18,d,ry,XWATER);
 for(const s of[-1,1]){const p=P(s*(w/2+.15),0),q=P(0,s*(d/2+.15));vB(curb,p[0],y-.05,p[1],.3,.3,d+.6,ry,c);vB(curb,q[0],y-.05,q[1],w+.6,.3,.3,ry,c);}}
// a rill segment centred at (x,z), L long along local z; o.cap 'pool' | 'fountain' closes its far (−z) end with a pool
// or a fountain basin instead of running out to the edge; o.w the water width (1.2); o.open [near,far] leaves an end
// without the joint water (a basin or step takes it)
function xnRill(x,y,z,ry,L,o){o=o||{};const w=o.w||1.2,c=o.c||xC(xPick(XPAL.stone)),curb=o.curb||'vStone',tile=xC(XPAL.turquoise),P=(u,v)=>loc(x,z,u,v,ry);
 const run=o.cap?L-3.2:L,zc=o.cap?(L-run)/2:0;   // the run stops short of a cap
 const m=P(0,zc);vB('xWaterB',m[0],y-.02,m[1],w,.16,run,ry,XWATER);vB('xTilesB',m[0],y-.22,m[1],w+.2,.2,run,ry,tile);
 for(const s of[-1,1]){const p=P(s*(w/2+.15),zc);vB(curb,p[0],y-.05,p[1],.3,.3,run,ry,c);}
 if(o.cap==='pool'){const q=P(0,-L/2+2.2);xnRillBasin(q[0],y,q[1],4.6,3.8,ry,curb,c);const j=P(0,-L/2+4.4);vB('xWaterB',j[0],y-.02,j[1],w,.16,.6,ry,XWATER);}
 else if(o.cap==='fountain'){const q=P(0,-L/2+2.4);xnFountain(q[0],y,q[1],2.4,c);const j=P(0,-L/2+4.2);vB('xWaterB',j[0],y-.02,j[1],w,.16,1.2,ry,XWATER);}}
// a cross of two rills with a small square basin at the meeting
function xnRillCross(x,y,z,S,o){o=o||{};const w=o.w||1.2,c=o.c||xC(xPick(XPAL.stone)),curb=o.curb||'vStone';xnRill(x,y,z,0,S,{w,c,curb});xnRill(x,y,z,Math.PI/2,S,{w,c,curb});
 xnRillBasin(x,y,z,w+1.0,w+1.0,0,curb,c);vBall('vBallW',x,y+.2,z,.12,XFOAM);}
// a sheet of falling water h tall down a face at (x,z) facing ry, foam at its foot
function xnWaterSheet(x,y,z,ry,w,h){const p=loc(x,z,0,.08,ry);vB('xWaterB',p[0],y,p[1],w,h,.12,ry,XSHEET);for(let k=0;k<Math.round(w*4);k++){const q=loc(x,z,rr(-w/2,w/2),rr(.1,.5),ry);vBall('vBallW',q[0],y+rr(.02,.3),q[1],rr(.06,.14),XFOAM);}}

function xaWaterDef(key,name,fn,rise,fam){XA.def({key,name,family:fam||'Water',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:8,d:8,h:(rise||0)+2,fw:8,fd:8,snap:8,rise:rise||0,eye:rise?[5,-9,0,0,.6]:undefined,build:fn});}
// the strip: every piece paves its plot so a run reads as one walk
function xnXLPlot(V,c,y,z,d){xnPave(0,z||0,8,d||8,0,c,2,y||0);return V===1?'xBTileB':'vStone';}
xaWaterDef('xa_rill','Rill (straight)',function(G,o){reseed(32301+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill',0,0,4.2,1.2);const curb=xnXLPlot(V,c);xnRill(0,0,0,0,8,{c,curb,w:V===2?1.8:1.2});});
xaWaterDef('xa_rill_bend','Rill (bend)',function(G,o){reseed(32311+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill bend',0,0,4.2,1.2);const curb=xnXLPlot(V,c);const w=V===2?1.8:1.2;
 xnRill(0,0,2.5,0,3,{c,curb,w});xnRill(2.5,0,0,Math.PI/2,3,{c,curb,w});xnRillBasin(0,0,0,w+.8,w+.8,0,curb,c);});
xaWaterDef('xa_rill_cross','Rill (cross)',function(G,o){reseed(32321+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill cross',0,0,4.2,1.2);const curb=xnXLPlot(V,c);xnRillCross(0,0,0,8,{c,curb,w:V===2?1.8:1.2});});
xaWaterDef('xa_rill_pool','Rill (pool cap)',function(G,o){reseed(32331+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill pool',0,0,4.2,1.2);const curb=xnXLPlot(V,c);xnRill(0,0,0,0,8,{c,curb,w:V===2?1.8:1.2,cap:'pool'});
 for(const s of[-1,1])vPst('vClayPot',s*3.2,0,-2.4,.3,.5,xC(0x9a5a38));});
xaWaterDef('xa_rill_fountain','Rill (fountain cap)',function(G,o){reseed(32341+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill fountain',0,0,4.2,2.6);const curb=xnXLPlot(V,c);xnRill(0,0,0,0,8,{c,curb,w:V===2?1.8:1.2,cap:'fountain'});});
// the proof: a run of the modules tiled on the 8 m grid — a fountain at the head, three straights, a cross with
// bends off each arm to pool caps, a pool at the foot — with cypresses and beds along it
function buildXaRillGarden(G,o){reseed(32351+(o.v|0));const V=xV(o);vnReg('Rill garden',0,0,14,8);
 const v={v:V};xnSub('xa_rill_fountain',0,0,16,Math.PI,v);xnSub('xa_rill',0,0,8,0,v);xnSub('xa_rill_cross',0,0,0,0,v);xnSub('xa_rill',0,0,-8,0,v);xnSub('xa_rill_pool',0,0,-16,0,v);
 xnSub('xa_rill_bend',8,0,0,Math.PI,v);xnSub('xa_rill_pool',8,0,-8,0,v);xnSub('xa_rill_bend',-8,0,0,Math.PI/2,v);xnSub('xa_rill_pool',-8,0,-8,0,v);   // a bend's arms are +z and +x; ry π turns them to −z,−x, ry π/2 to +x,−z
 for(const s of[-1,1])for(let k=0;k<5;k++)xnCypress(s*5.2,14-k*7,rr(5,8));for(const s of[-1,1]){vB('xEarthB',s*7,-.05,10,6,.12,10,0,xC(0x6a5a3a));kput('xLeaf',[s*7,.3,10],null,[.7,.5,.7],xC(xPick([0xd04a4a,0xe8a0c0,0xf0e060])));xnTree(s*7,7,3.6);}
 vnFolk(3,4,3,2);}
XA.def({key:'xa_rill_garden',name:'Rill garden',family:'Water',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:28,d:44,h:9,fw:24,fd:40,nv:3,eye:[1,28,0,8],build:buildXaRillGarden});

// ---------------------------------------------------------------- the slope pieces
// a terrace mass filling the +z part of the plot up to `rise`, rubble-faced; the paving on its top and at its foot
function xnXLTerrace(rise,dz,c,V){vB('xRubB',0,0,4-dz/2,8,rise-.1,dz,0,V===2?xC(xPick([0x6a5a48,0x7a6a54,0x5c4e40])):xC(xPick(XPAL.rubble)));xnPave(0,4-dz/2,8,dz,0,c,2,rise-.1);xnPave(0,-(8-dz)/2,8,8-dz,0,c,2,0);}   // a straight-sided block: its top and the plot edge agree
// STEP — rise 1.5: the rill on a terrace, three cascade steps down its face, the rill on at the foot
xaWaterDef('xa_rill_step','Rill step (1.5 m)',function(G,o){reseed(32361+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=V===1?'xBTileB':'vStone',w=V===2?1.8:1.2,R=1.5;vnReg('Rill step',0,0,4.2,R+1);
 xnXLTerrace(R,4,c,V);xnRill(0,R,2.1,0,3.8,{c,curb,w});
 for(let k=0;k<3;k++){const yk=R-(k+1)*.5,zk=-.3-k*.6;vB('vStone',0,yk-.3,zk,w+1.2,.32,.6,0,c);vB('xWaterB',0,yk-.02,zk,w+.6,.14,.5,0,XWATER);xnWaterSheet(0,yk,zk+.3,0,w+.4,.5);vB(curb,0,yk-.05,zk,.3,.3,.6,0,c);}
 xnRill(0,0,-3.05,0,1.9,{c,curb,w});vnFolk(2.8,0,-2.5,1,1);},1.5,'Water — slopes');
// RAMP — rise 1.5: the whole plot tilted, the rill sliding down it
xaWaterDef('xa_rill_ramp','Rill ramp (1.5 m)',function(G,o){reseed(32371+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=V===1?'xBTileB':'vStone',w=V===2?1.8:1.2,R=1.5;vnReg('Rill ramp',0,0,4.2,R+1);
 const a=Math.atan2(R,8),L=Math.hypot(R,8),q=qEuler(-a,0,0),yc=R/2;   // tilted so the +z edge is `rise` up
 kput('xRubB',[0,yc-1.0,0],q,[8,2.0,L],xC(xPick(XPAL.rubble)));   // the fill: a tilted rubble slab, its low end at grade, its high end 1.5 up
 kput('vStone',[0,yc+.1,0],q,[8,.16,L],c.clone().multiplyScalar(.85));const n=4;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const u=-4+(i+.5)*2,v=-L/2+(j+.5)*L/n;if(Math.abs(u)<w/2+.6)continue;
  kput('vFlag',[u,yc+.2+v*Math.sin(a)*1,v*Math.cos(a)],q,[1.92,.05,L/n-.08],c.clone().multiplyScalar(rr(.9,1.06)));}
 kput('xTilesB',[0,yc+.12,0],q,[w+.2,.2,L],xC(XPAL.turquoise));kput('xWaterB',[0,yc+.24,0],q,[w,.16,L],XWATER);for(const s of[-1,1])kput(curb,[s*(w/2+.15),yc+.3,0],q,[.3,.3,L],c);
 for(let k=0;k<6;k++)vBall('vBallW',rr(-w/2,w/2),yc+.35+(-L/2+k*L/6)*Math.sin(a),(-L/2+k*L/6)*Math.cos(a),.06,XFOAM);},1.5,'Water — slopes');
// CASCADE — rise 3: a chadar, six steps across the plot with water sliding over every one
xaWaterDef('xa_rill_cascade','Rill cascade (3 m)',function(G,o){reseed(32381+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=V===1?'xBTileB':'vStone',w=V===2?1.8:1.2,R=3,N=6;vnReg('Rill cascade',0,0,4.2,R+1);
 vB('xRubB',0,0,3,8,R-.1,2,0,xC(xPick(XPAL.rubble)));xnPave(0,3,8,2,0,c,2,R-.1);xnRill(0,R,3.2,0,1.6,{c,curb,w});
 for(let k=0;k<N;k++){const yk=R-(k+1)*.5,z0=2-k,zk=z0-.5;vB('vStone',0,0,zk,8,yk,1,0,c.clone().multiplyScalar(rr(.9,1.05)));   // the tread, solid to the ground, full width: a stair for the folk too
  vB('xTilesB',0,yk-.16,zk,w+.2,.16,1,0,xC(XPAL.turquoise));vB('xWaterB',0,yk-.02,zk,w,.14,1,0,XWATER);xnWaterSheet(0,yk,z0,Math.PI,w,.5);for(const s of[-1,1])vB(curb,s*(w/2+.15),yk-.05,zk,.3,.3,1,0,c);}
 xnPave(0,-3.5,8,1,0,c,2,0);xnRill(0,0,-3.5,0,1,{c,curb,w});vnFolk(2.5,R,3,1,1);},3,'Water — slopes');
// FALL — rise 4: the rill over a rock ledge, a waterfall into a plunge pool, the rill on from the pool
xaWaterDef('xa_rill_fall','Rill waterfall (4 m)',function(G,o){reseed(32391+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone)),curb=V===1?'xBTileB':'vStone',w=V===2?1.8:1.2,R=4;vnReg('Rill waterfall',0,0,4.2,R+1);
 const rock=xC(xPick([0x9a8a70,0xa89880,0x8c7c64]));vB('xRockB',0,0,2.1,8,R-.1,3.8,0,rock);for(let k=0;k<7;k++)kput('xBoulder',[rr(-3.6,3.6),R-.3,rr(.6,3.6)],qEuler(rng(),rng(),0),[rr(.6,1.2),rr(.4,.8),rr(.6,1.2)],rock.clone().multiplyScalar(rr(.8,1.1)));
 xnPave(0,2.5,8,3,0,c,2,R-.1);xnRill(0,R,2.4,0,3.2,{c,curb,w});vB('vStone',0,R-.12,.2,w+.6,.22,1.2,0,c);vB('xWaterB',0,R+.02,.2,w,.12,1.2,0,XWATER);   // the lip, proud of the rock, the water over it
 xnWaterSheet(0,.3,-.5,0,w*.95,R-.2);vB('xWaterB',0,R-.05,-.36,w*.95,.14,.4,0,XSHEET);   // the sheet hangs clear of the batterfor(let k=0;k<10;k++)vBall('vBallW',rr(-w,w),rr(.1,.9),rr(-1.2,.2),rr(.1,.22),XFOAM);   // the fall and its spray
 for(let k=0;k<4;k++)kput('xBoulder',[xPick([-1,1])*rr(w/2+.6,3),.2,rr(-2.6,-.2)],qEuler(rng(),rng(),0),[rr(.5,1.0),rr(.4,.7),rr(.5,1.0)],rock);
 xnRillBasin(0,0,-1.4,4.6,2.6,0,curb,c);xnPave(0,-2.5,8,3,0,c,2,0);xnRill(0,0,-3.4,0,1.2,{c,curb,w});
 for(const s of[-1,1])xnCypress(s*3.3,-3,rr(3,4.5));},4,'Water — slopes');
// the proof on a hill: the water comes down toward the viewer — a fountain and a rill on the height (8.5), the
// waterfall (to 4.5), a cross with a pool off one arm and a bend to a ramp (to 3) and a pool off the other, the
// cascade (to 1.5), the step (to 0), a pool at the foot. The ground is three earth terraces whose tops sit just under
// the modules' paving; a placer on real terrain would use `drop` footings instead
function buildXaRillHill(G,o){reseed(32399+(o.v|0));const V=xV(o);vnReg('Rill hill',0,0,14,12);const v={v:V},earth=xC(0x8a7a56);
 xnTerrace(0,0,-20,28,16,0,8.4,undefined,earth);xnTerrace(0,0,-4,28,16,0,4.4,undefined,earth);xnTerrace(-5,0,8,18,8,0,1.4,undefined,earth);xnTerrace(8,0,12,8,16,0,2.9,undefined,earth);
 xnSub('xa_rill_fountain',0,8.5,-24,0,v);xnSub('xa_rill',0,8.5,-16,0,v);xnSub('xa_rill_fall',0,4.5,-8,Math.PI,v);xnSub('xa_rill_cross',0,4.5,0,0,v);
 xnSub('xa_rill_cascade',0,1.5,8,Math.PI,v);xnSub('xa_rill_step',0,0,16,Math.PI,v);xnSub('xa_rill_pool',0,0,24,Math.PI,v);
 xnSub('xa_rill_pool',-8,4.5,0,Math.PI/2,v);xnSub('xa_rill_bend',8,4.5,0,-Math.PI/2,v);xnSub('xa_rill_ramp',8,3,8,Math.PI,v);xnSub('xa_rill_pool',8,3,16,Math.PI,v);
 for(const s of[-1,1]){xnCypress(s*5.4,-20,rr(5,7),8.5);xnCypress(s*5.4,-13,rr(5,7),8.5);xnCypress(s*10,-4,rr(4,6),4.5);}xnTree(-8,8,3.6,undefined,1.5);xnTree(-8,20,3.6);vnFolk(-3,0,22,3,2);}
XA.def({key:'xa_rill_hill',name:'Rill hill',family:'Water — slopes',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:28,d:60,h:14,fw:24,fd:56,nv:3,eye:[5,34,0,-6],eyes:[['fall',3,4,0,-8,4.5]],build:buildXaRillHill});
