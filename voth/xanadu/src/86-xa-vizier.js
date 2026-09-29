// ================================================================= XANADU — the Grand Vizier's palace (package X-M, round 7)
// Travis: a smaller palace for the Grand Vizier after three pictures — the Eram garden pavilion (a tall central arch
// between arcaded wings, tile spandrels, a long turquoise pool between marigold beds and cypresses), the Majorelle
// house (cobalt walls, turquoise pointed arches on a loggia, lemon shutters, a cobalt fountain basin among cactus
// and palms), and a Qajar-style brick pavilion (two storeys of open arcaded loggias on slender columns, octagonal
// bays, wide timber eaves on brackets, mosaic panels between the ground-floor arches). Seeds 32400–32499.

const XVZ=[ // the three dresses: cobalt (Majorelle) / brick (Qajar) / cream (Eram)
 {wall:0x1c2fb8,trim:0x36c0c8,acc:0xf0d040,col:0x36c0c8,rail:0x36c0c8,mosaic:false,arch:'xArchP',glass:true},
 {wall:0xb08a5c,trim:0xf0e6d2,acc:0x2a6a5a,col:0xf0e6d2,rail:0x7a4a22,mosaic:true,arch:'xArchP',glass:false},
 {wall:0xd8c4a0,trim:0xf4eee0,acc:0x36b0b8,col:0xf4eee0,rail:0x7a2a2a,mosaic:true,arch:'xArchP',glass:false}];
// a palm: a leaning trunk of stacked rings and a crown of fronds
function xnXMPalm(x,z,h,y){y=y||0;const lean=rr(-.12,.12),t=xC(0x8a6a48);for(let k=0;k<Math.round(h/.5);k++)vPst('xDrumS',x+lean*k*.5,y+k*.5,z,.16-.004*k,.5,t.clone().multiplyScalar(rr(.9,1.05)));
 const top=[x+lean*h,y+h,z];for(let k=0;k<9;k++){const a=k/9*TAU+rr(-.2,.2);kput('xLeaf',[top[0]+Math.cos(a)*1.1,top[1]+.1-Math.abs(Math.sin(k))*.2,top[2]+Math.sin(a)*1.1],qEuler(.3,-a,.5),[2.4,.18,.6],xC(xPick([0x3a8a3a,0x4a9a44,0x2f7a34])));}
 vBall('xPaintBall',top[0],top[1],top[2],.35,xC(0x6a4a30));}
// a marigold bed: an earth bed, a low hedge, yellow and orange heads
function xnXMBed(x,z,w,d,ry,y){y=y||0;vB('xEarthB',x,y-.04,z,w,.14,d,ry,xC(0x5a4a34));const n=Math.round(w*d*1.6);for(let k=0;k<n;k++){const p=loc(x,z,rr(-w/2+.2,w/2-.2),rr(-d/2+.2,d/2-.2),ry);
 kput('xLeaf',[p[0],y+.16,p[1]],null,[.34,.26,.34],xC(0x3f7a34));vBall('xPaintBall',p[0],y+.34,p[1],.09,xC(xPick([0xf2c12e,0xf0a020,0xe87a20,0xf8d848])));}}
// one loggia storey of a wing: an open arcade of n pointed arches on slender columns in front of a set-back wall,
// a rail between the columns on the upper floor, the wall behind with doors / mosaic panels
function xnXMLoggia(x,y,z,ry,w,h,n,dep,D,upper,lit){const P=(u,v)=>loc(x,z,u,v,ry);const bw=w/n,trim=xC(D.trim),col=xC(D.col),wall=xC(D.wall);
 const back=P(0,-dep/2);vB('vPlaster',back[0],y,back[1],w,h,dep,ry,wall);   // the room behind
 for(let i=0;i<=n;i++){const p=P(-w/2+bw*i,0);xnCol(p[0],y,p[1],h-.5,.17,ry,col,trim);}
 xnArcade(x,y+.5,z,ry,w,h-.5,n,D.arch,trim,.4,{open:true});
 for(let i=0;i<n;i++){const u=-w/2+bw*(i+.5),f=P(u,-dep+.06);
  if(upper){const r=P(u,.05);vB('xPaint',r[0],y+.9,r[1],bw-.5,.08,.08,ry,xC(D.rail));vB('xPaint',r[0],y+.05,r[1],bw-.5,.08,.08,ry,xC(D.rail));for(let k=0;k<Math.round(bw/.3);k++){const q=P(u-bw/2+.25+k*.3,.05);vPst('vPipe',q[0],y+.05,q[1],.018,.85,xC(D.rail));}
   vnDoor(f[0],y,f[1],ry,1.1,2.4,'xPaint',xC(D.acc),xC(D.acc),i%2===0);if(i%2)xnTibWin(f[0],y+.9,f[1],ry,1.0,1.5,lit?'lit':'glass',xC(D.acc),{noVal:true});}
  else{if(D.mosaic&&i%2===0)xnMural(i%4?'xMosB':'xMosA',f[0],y+.4,f[1],ry,bw-.9,h-1.2);else{vnDoor(f[0],y,f[1],ry,1.2,2.6,'xPaint',xC(D.acc),xC(D.acc),false);kput('xArcP',[f[0],y+2.6,f[1]],qEuler(0,ry,0),[1.7,.8,.16],trim);}}}
 if(D.mosaic)for(let i=0;i<n;i++){const u=-w/2+bw*(i+.5),sp=P(u,.26);kput('xMosB',[sp[0],y+h-.7,sp[1]],qEuler(0,ry,0),[bw*.8,.7,1],null);}}   // tile in the spandrels

function buildXaVizier(G,o){reseed(32401+(o.v|0));const V=xV(o),D=XVZ[V%3],lit=xLit();
 const wall=xC(D.wall),trim=xC(D.trim),acc=xC(D.acc),stone=xC(xPick(XPAL.stone)),tim=xC(xPick(XPAL.timber)),gold=xC(xPick(XPAL.gold));
 const W=26,DP=12,H1=4.2,H2=3.8,WW=8.5,CW=W-2*WW,Z0=-14;   // wings 8.5 wide either side of a 9 m centre; the house sits back at Z0
 vnReg("Vizier's palace",0,Z0,W/2+3,H1+H2+7);vnReg("Vizier's palace — garden",0,10,16,6);
 // the plinth and the terrace it stands on, with a flight down to the garden
 vB('vStone',0,0,Z0,W+4,.6,DP+5,0,stone);xnPave(0,Z0+DP/2+1.8,W+4,4,0,stone,2.2,.6);xnFlight(0,0,Z0+DP/2+3.5+1.2,0,7,.6,'vStone',stone);
 // the wings: two loggia storeys each, open to the garden; the centre block a storey taller with the great arch
 for(const s of[-1,1]){const x=s*(CW/2+WW/2);xnXMLoggia(x,.6,Z0+DP/2,0,WW,H1,3,2.6,D,false,lit);xnXMLoggia(x,.6+H1,Z0+DP/2,0,WW,H2,3,2.6,D,true,lit);
  vB('vPlaster',x,.6,Z0-1.3,WW,H1+H2,DP-2.6,0,wall);   // the rooms behind the loggias
  for(const yy of[1.6,H1+1.5])for(const z of[Z0-4,Z0])xnTibWin(s*(W/2),yy,z,s*Math.PI/2,1.1,1.7,lit?'lit':'glass',acc,{noVal:true});
  vB('xTilesB',x,.6+H1-.06,Z0-1,WW+.1,.14,DP,0,xC(xPick(XPAL.tile)));}
 const HC=H1+H2+3.2;vB('vPlaster',0,.6,Z0,CW,HC,DP,0,wall);
 xnIwanOpen(0,.6,Z0+DP/2,0,7.2,H1+H2+.6,3.2,wall,{through:false,item:D.mosaic?'xArchM':'xArchP',faceC:D.mosaic?null:trim,lamps:lit});
 for(const s of[-1,1]){const x=s*(CW/2-.9);vB('xPaint',x,.6,Z0+DP/2+.1,.9,HC-.4,.4,0,trim);}   // pilasters flanking the arch
 if(D.mosaic){for(const s of[-1,1])xnMural('xMosA',s*(CW/2-1.9),H1+H2+2.0,Z0+DP/2+.02,0,1.4,1.6);}
 else{vB('xPaint',0,.6+HC-.7,Z0+DP/2+.06,CW-2,.5,.1,0,acc);for(const s of[-1,1])xnTibWin(s*(CW/2-2.2),H1+H2+1.4,Z0+DP/2,0,1.2,1.6,lit?'lit':'glass',acc,{noVal:true});}
 // the octagonal bays on the outer corners of the upper storey, with little tiled roofs
 for(const s of[-1,1]){const bx=s*(W/2-.6),bz=Z0+DP/2+.6,R=2.2,yb=.6+H1+.2,hb=H2-.4;kput('xOctW',[bx,yb,bz],qEuler(0,Math.PI/8,0),[R,hb,R],wall);kput('xOctP',[bx,yb-.2,bz],qEuler(0,Math.PI/8,0),[R+.3,.22,R+.3],tim);
  for(const a of[Math.PI/2*s,Math.PI/4*s,0]){const p=loc(bx,bz,0,R*Math.cos(Math.PI/8)/2*2*.5,a);xnTibWin(p[0],yb+.8,p[1],a,.9,1.6,lit?'lit':'glass',acc,{noVal:true});}
  kput('xOctP',[bx,yb+hb,bz],qEuler(0,Math.PI/8,0),[R+.4,.24,R+.4],tim);kput('xConeT',[bx,yb+hb+.24,bz],null,[R*.62,1.4,R*.62],xC(xPick(XPAL.tile)));vBall('xGold',bx,yb+hb+1.7,bz,.12,gold);}
 // the eaves: wide timber eaves on painted brackets all round the wings and the centre, a flat roof with a parapet
 const YE=.6+H1+H2;xnEave(0,YE-.5,Z0,W+.4,DP+.4,0,tim,1.1);xnFlatRoof(0,YE,Z0,W,DP,0,wall,{parapet:.5,corner:'pinnacle'});
 xnEave(0,.6+HC-.5,Z0,CW+.4,DP+.4,0,tim,1.0);if(V===1)xnGiltRoof(0,.6+HC,Z0,CW,DP,0,{frame:.8,rise:2.2,over:.8});else{xnFlatRoof(0,.6+HC,Z0,CW,DP,0,wall,{parapet:.6});xnDome(0,.6+HC+.6,Z0,2.6,V===2?'T':'G',{drum:1.2,drumItem:'xDrumS',fin:1.0});}
 // the garden: the long turquoise pool on the axis with marigold beds, cypresses and palms either side, a cobalt
 // fountain basin at its head, hedged walks, a garden wall with a gate at the front
 vB('vStone',0,0,6,5.2,.4,26,0,stone);vB('xTilesB',0,.1,6,4.4,.34,25.2,0,xC(XPAL.turquoise));vB('xWaterB',0,.2,6,4.4,.28,25.2,0,xC(0x2ab0c0));
 for(const s of[-1,1]){xnXMBed(s*4.6,6,2.2,25,0);for(let k=0;k<5;k++){if(k%2)xnXMPalm(s*9.5,-5+k*5.5,rr(5,7));else xnCypress(s*9.5,-5+k*5.5,rr(6,9));}
  vB('xPaint',s*7.4,0,6,.5,.9,26,0,xC(xPick(XPAL.leaf)).multiplyScalar(.8));xnXMBed(s*13,8,4,20,0);}
 {const fz=Z0+DP/2+8.5;vB('xPaint',0,0,fz,6,.9,6,0,V===0?xC(D.wall):stone);vB('xWaterB',0,.7,fz,5.2,.3,5.2,0,xC(0x2ab0c0));xnFountain(0,.9,fz,1.6,V===0?xC(D.wall):stone);}
 for(const s of[-1,1]){vB('vStone',s*((W+14)/4+2),0,20,(W+14)/2-4,1.4,.5,0,stone);vB('vStone',s*(W/2+7),0,3,.5,1.4,34.5,0,stone);vB('vStone',s*4,0,20,1.1,2.6,1.1,0,stone);kput('xBulbT',[s*4,2.6,20],null,[.9,1.0,.9],xC(xPick(XPAL.tile)));}   // the wall, open 7 m at the gate between two piers
 xnPave(0,20,7,3,0,stone,1.6);for(const s of[-1,1])vPst('vClayPot',s*2.4,0,17.5,.4,.8,xC(0x9a5a38));
 if(lit){for(const s of[-1,1]){vnLampPost(s*6.4,0,Z0+DP/2+4,3.4);vnLampPost(s*6.4,0,16,3.4);}}
 vnFolk(0,17,3,2);vnFolk(0,Z0+DP/2+5,2,2);}
XA.def({key:'xa_vizier',name:"Grand Vizier's palace",family:'The Sultan',tags:{type:['civic','single-family dwelling'],wealth:'civic',lit:true,landmark:true},w:44,d:56,h:20,fw:30,fd:17,eye:[3,32,0,-6],eyes:[['pool',0,14,0,-8],['loggia',-14,-1,-9,-8]],build:buildXaVizier});
