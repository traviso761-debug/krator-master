// ================================================================= XANADU — the water modules (package X-L, round 6)
// Travis: the channels of the baths as modules that tile end to end and cap off with pools or fountains. Every piece
// sits on the same 8 m plot with its rill on the plot's centre line running out to the plot edge, so two pieces
// placed 8 m apart on the same axis join flush: straight, bend, cross, and the two caps. Seeds 32300–32399.

// a rill segment centred at (x,z), L long along local z, on a paved strip; o.cap 'pool' | 'fountain' closes its far
// (−z) end with a pool or a fountain basin instead of running out to the edge; o.w the water width (1.2)
function xnRill(x,y,z,ry,L,o){o=o||{};const w=o.w||1.2,c=o.c||xC(xPick(XPAL.stone)),curb=o.curb||'vStone',tile=xC(XPAL.turquoise),P=(u,v)=>loc(x,z,u,v,ry);
 const run=o.cap?L-3.2:L,zc=o.cap?(L-run)/2:0;   // the run stops short of a cap
 const m=P(0,zc);vB('xWaterB',m[0],y-.02,m[1],w,.16,run,ry,xC(XPAL.water));vB('xTilesB',m[0],y-.2,m[1],w+.2,.2,run,ry,tile);
 for(const s of[-1,1]){const p=P(s*(w/2+.15),zc);vB(curb,p[0],y-.05,p[1],.3,.3,run,ry,c);}
 if(o.cap==='pool'){const q=P(0,-L/2+2.2);vB(curb,q[0],y-.05,q[1],5.2,.3,4.4,ry,c);vB('xTilesB',q[0],y-.2,q[1],4.6,.2,3.8,ry,tile);vB('xWaterB',q[0],y-.02,q[1],4.6,.18,3.8,ry,xC(XPAL.water));
  const j=P(0,-L/2+4.4);vB('xWaterB',j[0],y-.02,j[1],w,.16,.6,ry,xC(XPAL.water));}
 else if(o.cap==='fountain'){const q=P(0,-L/2+2.4);xnFountain(q[0],y,q[1],2.4,c);const j=P(0,-L/2+4.2);vB('xWaterB',j[0],y-.02,j[1],w,.16,1.2,ry,xC(XPAL.water));}}
// a cross of two rills with a small square basin at the meeting
function xnRillCross(x,y,z,S,o){o=o||{};const w=o.w||1.2,c=o.c||xC(xPick(XPAL.stone));xnRill(x,y,z,0,S,{w,c,curb:o.curb});xnRill(x,y,z,Math.PI/2,S,{w,c,curb:o.curb});
 vB(o.curb||'vStone',x,y-.05,z,w+1.6,.3,w+1.6,0,c);vB('xWaterB',x,y,z,w+1.0,.18,w+1.0,0,xC(XPAL.water));vBall('vBallW',x,y+.2,z,.12,xC(0xe8f4f8));}

function xaWaterDef(key,name,fn){XA.def({key,name,family:'Water',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:8,d:8,h:2,fw:8,fd:8,snap:8,build:fn});}
// the strip: every piece paves its plot so a run reads as one walk
function xnXLPlot(V,c){xnPave(0,0,8,8,0,c,2);return V===1?'xBTileB':'vStone';}
xaWaterDef('xa_rill','Rill (straight)',function(G,o){reseed(32301+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill',0,0,4.2,1.2);const curb=xnXLPlot(V,c);xnRill(0,0,0,0,8,{c,curb,w:V===2?1.8:1.2});});
xaWaterDef('xa_rill_bend','Rill (bend)',function(G,o){reseed(32311+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill bend',0,0,4.2,1.2);const curb=xnXLPlot(V,c);const w=V===2?1.8:1.2;
 xnRill(0,0,2,0,4,{c,curb,w});xnRill(2,0,0,Math.PI/2,4,{c,curb,w});vB(curb,0,-.05,0,w+.6,.3,w+.6,0,c);vB('xWaterB',0,-.02,0,w,.16,w,0,xC(XPAL.water));});
xaWaterDef('xa_rill_cross','Rill (cross)',function(G,o){reseed(32321+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill cross',0,0,4.2,1.2);const curb=xnXLPlot(V,c);xnRillCross(0,0,0,8,{c,curb,w:V===2?1.8:1.2});});
xaWaterDef('xa_rill_pool','Rill (pool cap)',function(G,o){reseed(32331+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill pool',0,0,4.2,1.2);const curb=xnXLPlot(V,c);xnRill(0,0,0,0,8,{c,curb,w:V===2?1.8:1.2,cap:'pool'});
 for(const s of[-1,1])vPst('vClayPot',s*3.2,0,-2.4,.3,.5,xC(0x9a5a38));});
xaWaterDef('xa_rill_fountain','Rill (fountain cap)',function(G,o){reseed(32341+(o.v|0));const V=xV(o),c=xC(xPick(XPAL.stone));vnReg('Rill fountain',0,0,4.2,2.6);const curb=xnXLPlot(V,c);xnRill(0,0,0,0,8,{c,curb,w:V===2?1.8:1.2,cap:'fountain'});});
// the proof: a run of the modules tiled on the 8 m grid — a fountain at the head, three straights, a cross with
// bends off each arm to pool caps, a pool at the foot — with cypresses and beds along it
function buildXaRillGarden(G,o){reseed(32351+(o.v|0));const V=xV(o);vnReg('Rill garden',0,0,14,8);
 const v={v:V};xnSub('xa_rill_fountain',0,0,16,Math.PI,v);xnSub('xa_rill',0,0,8,0,v);xnSub('xa_rill_cross',0,0,0,0,v);xnSub('xa_rill',0,0,-8,0,v);xnSub('xa_rill_pool',0,0,-16,0,v);
 xnSub('xa_rill_bend',8,0,0,-Math.PI/2,v);xnSub('xa_rill_pool',8,0,-8,0,v);xnSub('xa_rill_bend',-8,0,0,Math.PI,v);xnSub('xa_rill_pool',-8,0,-8,0,v);
 for(const s of[-1,1])for(let k=0;k<5;k++)xnCypress(s*5.2,14-k*7,rr(5,8));for(const s of[-1,1]){vB('xEarthB',s*7,-.05,10,6,.12,10,0,xC(0x6a5a3a));kput('xLeaf',[s*7,.3,10],null,[.7,.5,.7],xC(xPick([0xd04a4a,0xe8a0c0,0xf0e060])));xnTree(s*7,7,3.6);}
 vnFolk(3,4,3,2);}
XA.def({key:'xa_rill_garden',name:'Rill garden',family:'Water',tags:{type:['infrastructure'],wealth:'civic',lit:false},w:28,d:44,h:9,fw:24,fd:40,nv:3,eye:[1,28,0,8],build:buildXaRillGarden});
