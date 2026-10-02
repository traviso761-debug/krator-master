// prefix: dk
// ---------------------------------------------------------------- DOCK (infrastructure). Land at the back (-z), harbour water in front (+z).
// A raised earth-and-tyre quay along the shore, a long plank pier on pilings with barrel/tyre floats, bollards and lamps, a scrap gantry crane with a spinning hoist wheel,
// a fuel tank and pump shed, fish-drying racks and nets, a harbourmaster's booth (container), a warehouse shack, two stalls, and three moored boats:
// a tug/trawler (prism hull, cabin, funnel, mast), a raft-house on tyre floats and a container barge. Water is one convex polygon plate at y=.05.
defBuilding({key:'dock',name:'Dock',seed:5810,tags:{type:['infrastructure'],size:'large',core:'shipping container + scrap crane',materials:['earth-filled tyres','planks','barrels','sheet metal','scrap steel','containers']},w:52,d:46,h:14,budget:240000,build:dkBuild});
const dkQ=.9;                                       // quay height above the water bed
function dkTire(x,y,z,R,col,ry,rx,rz){if(!_G.dkTor){const g=new THREE.TorusGeometry(.67,.33,4,9);g.rotateX(PI/2);_G.dkTor=g;}const m=TF(x,y,z,ry,rx,rz);m.scale(new THREE.Vector3(R,R,R));emit('rubber',_G.dkTor,m,col===undefined?jc(0x252220,.05):col);}
function dkBright(){return pick([0xc45a30,0xd8a020,0x3b7f8e,0x4d6f3c,0x9a3a2c,0xd8d0c0,0x2f5f8f,0x8a6a3a]);}
function dkWood(){return jc(pick([0x6a5238,0x7a6244,0x5c4630,0x8a7050]),.08);}
function dkPost(x,y0,y1,z,r,col){beam('wood',[x,y0,z],[x,y1,z],r||.08,col||jc(0x5c4630,.06),true,6);}
function dkBollard(x,y,z){cyl('iron',x,y,z,.16,.5,jc(0x3a3430,.05),8);cyl('iron',x,y+.45,z,.24,.14,jc(0x4a4038,.05),8);box('iron',x-.3,y,z-.3,.6,.06,.6,jc(0x4a4038,.05));}
function dkRope(a,b,sag){sag=sag===undefined?.25:sag;const m=[(a[0]+b[0])/2,(a[1]+b[1])/2-sag,(a[2]+b[2])/2];beam('plain',a,m,.025,jc(0x8a7a5a,.05),true,4);beam('plain',m,b,.025,jc(0x8a7a5a,.05),true,4);}
// hull wall along an outline (x,z pairs): boxes standing on the edge
function dkBulwark(pts,y0,h,col,th){th=th||.1;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.05)continue;box('sheet',(a[0]+b[0])/2,y0,(a[1]+b[1])/2,L+.08,h,th,col,Math.atan2(-dz,dx));}}
// ---- boats
function dkTug(){const hull=[[-2.3,-7],[2.3,-7],[2.55,1.5],[1.9,5.2],[0,7.4],[-1.9,5.2],[-2.55,1.5]];const red=jc(0x9a3a2c,.05);
 prism('sheet',hull.map(p=>[p[0]*.97,p[1]]),-.35,.62,jc(0x2a2826,.03));prism('sheet',hull,.6,1.5,red);prism('plank',hull.map(p=>[p[0]*.9,p[1]*.96]),1.5,1.56,jc(0x6a5a44,.06));
 dkBulwark(hull,1.5,.75,jc(0x8a3a2c,.05));
 for(const sx of [-1,1])for(let k=0;k<6;k++){dkTire(sx*2.6,.72,-5.6+k*1.7,.34,undefined,0,0,PI/2);}      // hanging fenders
 // cabin, wheelhouse, funnel, mast
 box('sheet',-1.45,1.56,-3.4,2.9,2.4,3.4,jc(0xd8d0c0,.04));for(const sx of [-1,1])box('glass',sx*1.46,2.4,-3.4,.04,.8,2.6,jc(0x6a9a94,.06));box('glass',0,2.4,-1.72,2.4,.8,.04,jc(0x6a9a94,.06));
 box('iron',-1.6,3.95,-3.55,3.2,.12,3.7,jc(0x4a4038,.05));
 box('sheet',-.55,4.07,-3.3,2.2,1.8,2.2,jc(0xc45a30,.05));box('glass',-.55,4.6,-2.16,1.9,.8,.04,jc(0x6a9a94,.06));for(const sx of [-1,1])box('glass',-.55+sx*1.11,4.6,-3.3,.04,.8,1.8,jc(0x6a9a94,.06));
 box('iron',-1.7,5.87,-3.45,2.6,.1,2.6,jc(0x4a4038,.05));
 cyl('iron',-.4,5.9,-4.2,.55,1.9,jc(0x2a2826,.03),12,.42);cyl('sheet',-.4,6.5,-4.2,.57,.5,jc(0xc99a2e,.05),12);cyl('iron',-.4,7.8,-4.2,.5,.12,jc(0x3a3430,.05),12);
 door(-1.45+.6,1.56,-1.7,.8,1.7,{step:false});
 box('iron',1.0,1.56,-6.6,.9,.6,.9,jc(0x4a4038,.05));// winch
 dkPost(-.55,5.97,9.3,-2.6,.05,jc(0x4a4038,.05));box('iron',-1.2,8.0,-2.62,1.3,.07,.07,jc(0x4a4038,.05));sock('flag',-.55,9.35,-2.6,0,{w:1.5,h:.75});
 lamp(-.55,5.97,-2.0,.9);
 // bow: bollard, anchor winch, coiled hawser, barrels
 dkBollard(0,1.56,5.0);dkBollard(-1.2,1.56,-6.3);dkBollard(1.2,1.56,-6.3);cylH('iron',0,2.0,3.2,.4,1.0,jc(0x3a3430,.05),'x',10);barrel(-1.3,1.56,1.0);barrel(1.4,1.56,2.4);crate(1.3,1.56,-.4,.6,.3);crate(-1.6,1.56,.2,.6,.6);}
function dkRaft(){const W_=8.2,D_=6.2;const y=.32;
 for(let i=0;i<Math.round(W_/.75);i++)for(let j=0;j<Math.round(D_/.75);j++){const x=-W_/2+.4+i*.75,z=-D_/2+.4+j*.75;dkTire(x,.1,z,.36,undefined,rng()*TAU);dkTire(x+.02,.32,z,.36,undefined,rng()*TAU);}
 box('plank',0,.55,0,W_,.12,D_,jc(0x6a5a44,.06));for(let i=0;i<6;i++)box('wood',-W_/2+.4+i*1.5,.45,0,.2,.12,D_,jc(0x5c4630,.06));
 // the house: plank and sheet walls, gable roof, door, window, stovepipe
 const hx=-.7,hz=-.3,hw=4.6,hd=3.4,y0=.67;
 wallOpen('plank',hx,y0,hz+hd/2,hw,2.3,.12,[{x0:hx-.5,x1:hx+.5,y0:y0,y1:y0+1.95},{x0:hx+1.1,x1:hx+1.9,y0:y0+.9,y1:y0+1.7}],jc(pick([0x3b7f8e,0x8a3a2c,0xc99a2e]),.06));
 wallOpen('plank',hx,y0,hz-hd/2,hw,2.3,.12,[],jc(0x8a6a3a,.06));for(const sx of [-1,1])wallOpen('plank',hx+sx*hw/2,y0,hz,hd,2.3,.12,[{x0:hx+sx*hw/2-.5,x1:hx+sx*hw/2+.5,y0:y0+.9,y1:y0+1.7}],jc(0x7a5a38,.06),sx*PI/2);
 box('glass',hx+1.5,y0+.9,hz+hd/2+.02,.8,.8,.03,jc(0x6a9a94,.06));door(hx,y0,hz+hd/2+.03,1.0,1.95,{step:false});
 gableRoof(hx,y0+2.3,hz,hw,hd,1.0,{col:0x9a5a3a});stovepipe(hx-1.5,y0+2.7,hz-.6,1.5);
 sock('awning',hx+1.5,y0+1.85,hz+hd/2+.06,0,{w:1.5,d:.8,drop:.3,h:1.1});
 // open deck with rail and a washing line; water butts; a small skiff hull-like crate stack
 const rc=jc(0x5c4630,.06);for(let k=0;k<=8;k++){const x=-W_/2+.1+k*(W_-.2)/8;beam('wood',[x,.67,D_/2-.1],[x,1.6,D_/2-.1],.045,rc,true,5);}beam('wood',[-W_/2+.1,1.6,D_/2-.1],[W_/2-.1,1.6,D_/2-.1],.05,rc);beam('wood',[-W_/2+.1,1.15,D_/2-.1],[W_/2-.1,1.15,D_/2-.1],.035,rc);
 for(const sx of [-1,1]){for(let k=0;k<=4;k++){const z=-D_/2+.1+k*(D_-.2)/4;beam('wood',[sx*(W_/2-.1),.67,z],[sx*(W_/2-.1),1.6,z],.045,rc,true,5);}beam('wood',[sx*(W_/2-.1),1.6,-D_/2],[sx*(W_/2-.1),1.6,D_/2],.05,rc);}
 waterButt(-3.2,.67+.55,-2.3,.45,.7,{base:.67});barrel(3.2,.67,-2.0);barrel(3.7,.67,-1.6);crate(3.2,.67,1.6,.6,.3);
 dkPost(3.1,.67,3.2,-.4,.05);dkPost(1.0,.67,3.2,-.4,.05);beam('plain',[3.1,3.1,-.4],[1.0,3.1,-.4],.012,jc(0x6a5a44,.05),true,3);for(let k=0;k<4;k++)box('cloth',1.3+k*.5,2.2,-.4,.4,.9,.02,jc(pick([0xd8d0c0,0x3b7f8e,0xc45a30,0xd8a020]),.06));
 sock('banner',hx-hw/2-.06,y0+2.25,hz+.4,-PI/2,{w:.8,h:1.6});}
function dkBarge(){const L0=-9.4,L1=9.2;const hull=[[-2.5,L0],[2.5,L0],[2.5,L1-1.3],[1.4,L1],[-1.4,L1],[-2.5,L1-1.3]];
 prism('sheet',hull.map(p=>[p[0]*.97,p[1]]),-.35,.55,jc(0x2a2826,.03));prism('sheet',hull,.5,1.15,jc(0x6a4a3a,.05));prism('plank',hull.map(p=>[p[0]*.94,p[1]*.985]),1.15,1.21,jc(0x6a5a44,.06));
 dkBulwark(hull,1.21,.45,jc(0x7a4a34,.06));
 for(const sx of [-1,1])for(let k=0;k<6;k++)dkTire(sx*2.58,.6,-7.5+k*3.0,.34,undefined,0,0,PI/2);
 // containers: two 20 ft end to end on each side, a 40 ft across the top
 for(const sx of [-1,1])for(const z of [-3.1,3.1])W(sx*1.25,1.21,z,PI/2,()=>container({len:CT.L20,doorEnd:false,col:jc(dkBright(),.05)}));
 W(-.0,1.21+CT.H,0,PI/2,()=>container({len:CT.L40,doorEnd:false,col:jc(dkBright(),.05)}));
 for(const sx of [-1,1])for(const z of [-6.1,0,6.1])beam('iron',[sx*2.45,1.21,z],[sx*.9,1.21+CT.H*2-.1,z+.3],.025,jc(0x3a3430,.05),true,4);
 // stern deckhouse with a stovepipe, bow bollards and a mooring line
 box('sheet',0,1.21,L0+.4,2.6,2.2,1.9,jc(0xd8a020,.05));box('glass',0,2.2,L0+2.31,2.0,.7,.04,jc(0x6a9a94,.06));door(-.7,1.21,L0+2.32,.7,1.6,{step:false});
 roofP('corr',-1.5,1.5,L0+2.6,3.5,L0+.2,3.7,.07,P('rust'));stovepipe(.9,3.6,L0+.9,1.2);
 dkBollard(0,1.21,L1-1.3);dkBollard(-2.0,1.21,L0+.5);dkBollard(2.0,1.21,L0+.5);crate(1.6,1.21,L1-2.4,.6,.2);barrel(-1.6,1.21,L1-2.2);}
// ---- the gantry crane (in the quay frame, y=0 is the quay top)
function dkCrane(x0){const dk=jc(0x6a4a3a,.05),st=jc(0x4a4038,.05);const H=9.0;const zs=[-9.0,-4.4],xs=[x0-2.2,x0+2.2];
 for(const x of xs)for(const z of zs){box('iron',x-.2,0,z-.2,.4,H,.4,jc(0xc98a2a,.06));box('conc',x-.5,0,z-.5,1.0,.3,1.0,jc(0x8a8880,.05));}
 for(const x of xs){for(const [ya,yb] of [[0,4.5],[4.5,9]]){beam('iron',[x,ya,zs[0]],[x,yb,zs[1]],.09,st);beam('iron',[x,ya,zs[1]],[x,yb,zs[0]],.09,st);}for(const y of [4.5]){beam('iron',[x,y,zs[0]],[x,y,zs[1]],.14,st);}}
 for(const z of zs){for(const [ya,yb] of [[0,4.5],[4.5,9]]){beam('iron',[xs[0],ya,z],[xs[1],yb,z],.09,st);beam('iron',[xs[0],yb,z],[xs[1],ya,z],.09,st);}beam('iron',[xs[0],4.5,z],[xs[1],4.5,z],.14,st);}
 box('plank',x0,H,-6.7,6,.18,7.2,jc(0x6a5a44,.06));      // centred on the four legs (x0, z -6.7); the rails below run round its edge
 // rails, cab, counterweight, ladder
 for(const [a,b] of [[[x0-3,-10.3],[x0+3,-10.3]],[[x0+3,-10.3],[x0+3,-3.1]],[[x0-3,-10.3],[x0-3,-3.1]]]){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/1.6));for(let k=0;k<=n;k++){const t=k/n;beam('wood',[a[0]+(b[0]-a[0])*t,H+.18,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,H+1.2,a[1]+(b[1]-a[1])*t],.04,jc(0x5c4630,.06),true,5);}beam('wood',[a[0],H+1.2,a[1]],[b[0],H+1.2,b[1]],.045,jc(0x5c4630,.06));}
 box('plank',x0+1.0,H+.18,-9.4,2.0,2.2,2.2,jc(0x3b7f8e,.06));box('glass',x0+1.0,H+1.0,-7.18,1.6,.8,.04,jc(0x6a9a94,.06));roofP('corr',x0-.2,x0+2.2,-6.9,H+2.4,-9.9,H+2.7,.07,P('rust'));
 for(let k=0;k<5;k++)box('conc',x0-2.6+k*.5,H+.18,-11.1,.45,1.5,1.0,jc(pick([0x8a8880,0x7a7870,0x9a968c]),.05));
 ladder(x0-2.2,0,zs[1]+.32,H+.5,0);
 // the mast, boom and stays
 const mz=-6.7;beam('iron',[x0-.6,H+.18,mz],[x0,H+4.9,mz],.12,st,true,6);beam('iron',[x0+.6,H+.18,mz],[x0,H+4.9,mz],.12,st,true,6);
 const tip=[x0,H+1.5,9.6];for(const sx of [-.55,.55]){beam('iron',[x0+sx,H+.4,-4.2],[x0+sx,H+.4,tip[2]],.11,st);beam('iron',[x0+sx,H+1.5,-4.2],[x0+sx,H+1.5,tip[2]],.09,st);}
 for(let i=0;i<=12;i++){const z=-4.2+i*(tip[2]+4.2)/12;for(const sx of [-.55,.55])beam('iron',[x0+sx,H+.4,z],[x0+sx,H+1.5,z],.05,st,true,4);if(i<12){const z2=z+(tip[2]+4.2)/12;for(const sx of [-.55,.55])beam('iron',[x0+sx,(i%2)?H+1.5:H+.4,z],[x0+sx,(i%2)?H+.4:H+1.5,z2],.045,st,true,4);}}
 beam('iron',[x0,H+4.9,mz],[x0,H+1.5,tip[2]],.05,st,true,4);beam('iron',[x0,H+4.9,mz],[x0,H+.4,-11.6],.05,st,true,4);
 // hoist wheel on the boom and the hanging hook with a net of crates
 spin(x0,H+.95,6.0,0,'x',.9,()=>{cylH('iron',0,0,0,.14,.5,jc(0x8a8a86,.05),'x',8);for(let q=0;q<6;q++){const a=q*PI/3;beam('iron',[0,Math.cos(a)*.7,Math.sin(a)*.7],[0,-Math.cos(a)*.7,-Math.sin(a)*.7],.035,jc(0x3a3430,.05));}
  for(let q=0;q<10;q++){const a=q/10*TAU;box('iron',0,Math.cos(a)*.7,Math.sin(a)*.7,.36,.07,.07,jc(0x6a6a66,.05),0,a);}});
 beam('iron',[x0,H+.28,6.0],[x0,4.2,6.0],.03,jc(0x6a6a66,.05),true,3);box('iron',x0-.1,3.9,5.9,.2,.35,.2,jc(0x3a3430,.05));
 for(const [dx,dz,s] of [[-.3,0,.5],[.3,0,.5],[0,.1,.45]])box('plank',x0+dx-s/2,3.0-(s>.46?0:-.5),6.0+dz-s/2,s,s,s,P('wood'));
 // banners on the front legs, a lamp
 sock('banner',xs[1]+.22,H-.6,zs[1],PI/2,{w:1.0,h:3.0});sock('banner',xs[0]-.22,H-.6,zs[1],-PI/2,{w:1.0,h:3.0});lamp(x0,H+.18,-4.3,1.4);}
// ---- land side
function dkQuay(){const zq=-5.2;
 box('earth',0,0,-14.1,52,dkQ,17.8,jc(0xa08a68,.04));box('earth',0,dkQ,-14.1,52,.03,17.8,jc(0x9a8464,.04));
 // tyre face with timber cap (gap where the pier passes)
 for(const [x0,x1] of [[-26,4.9],[8.3,26]]){const n=Math.round((x1-x0)/.72);for(let c=0;c<4;c++)for(let i=0;i<n;i++){const paint=rng()<.1;dkTire(x0+.4+i*(x1-x0-.4)/n+(c%2)*.36,c*.22+.12,zq+.34,.36,paint?jc(dkBright(),.06):undefined,rng()*TAU);}
  box('wood',(x0+x1)/2,dkQ-.02,zq+.06,x1-x0,.16,.7,jc(0x6a5238,.06));}
 // plank apron along the edge
 box('plank',0,dkQ+.03,-6.6,52,.06,3.0,jc(0x6a5a44,.06));for(let i=0;i<9;i++)box('wood',-24+i*6,dkQ+.03,-6.6,.16,.07,3.0,jc(0x5c4630,.06));
 for(const x of [-22,-14,-6,2,14,22])dkBollard(x,dkQ,-5.5);
 for(const x of [-18,-9,11,18])lamp(x,dkQ,-6.3,3.6,{arm:.35});
 // ramp/steps down to the water at the west end
 stairs(-24.0,0,-4.6,-24.0,dkQ,-5.2,1.2,{rail:false});}
function dkPier(){const x0=6.6,w=3.4,zA=-5.0,zB=21.0,y=1.0;const zc=(zA+zB)/2,L=zB-zA;
 box('plank',x0,y-.14,zc,w,.14,L,jc(0x6a5a44,.06));for(let i=0;i<Math.round(L/2.6);i++)box('plank',x0,y-.13,zA+1.3+i*2.6,w+.02,.16,.06,jc(0x4a3a2c,.06));
 for(const sx of [-1,1])box('wood',x0+sx*1.4,.6,zc,.22,.26,L,jc(0x5c4630,.06));
 const n=Math.round(L/2.4);for(let i=0;i<=n;i++){const z=zA+i*L/n;for(const sx of [-1,1]){dkPost(x0+sx*1.5,0,y-.1,z,.17);
   if(i>0&&i%2===0){for(const dz of [-.5,.5])for(let k=0;k<2;k++)dkTire(x0+sx*1.9,.14+k*.2,z+dz*.9,.36,undefined,rng()*TAU);}
   if(i>0&&i%3===1){cylH('sheet',x0+sx*2.2,.32,z,.29,.88,jc(pick([0x8a3a2c,0x2f5f8f,0x4d6f3c,0x9a9a92]),.08),'z',10,true);}}
  box('wood',x0-1.55,.7,z-.06,3.1,.16,.12,jc(0x5c4630,.06));}
 // bollards, lamps, tall banner posts
 for(let i=1;i<n;i+=2)for(const sx of [-1,1])dkBollard(x0+sx*1.45,y,zA+i*L/n);
 for(let i=2;i<n;i+=4){const z=zA+i*L/n;lamp(x0-1.5,y,z,3.4,{arm:.35});}
 for(const z of [zA+8.0,zA+18.5]){for(const sx of [-1,1]){dkPost(x0+sx*1.62,y,y+4.4,z,.08);}}
 sock('banner',x0-1.62,y+4.4,zA+8.0+.1,0,{w:1.0,h:2.6});sock('banner',x0+1.62,y+4.4,zA+18.5+.1,0,{w:1.0,h:2.6});sock('banner',x0+1.62,y+4.4,zA+8.0-.1,PI,{w:1.0,h:2.6});
 // T-head at the end
 box('plank',x0,y-.14,zB+1.0,8.2,.14,2.6,jc(0x6a5a44,.06));for(const dx of [-3.8,-1.3,1.3,3.8])for(const dz of [.2,1.8])dkPost(x0+dx,0,y-.1,zB+dz+.0,.16);for(const dx of [-3.6,3.6])dkBollard(x0+dx,y,zB+1.0);
 crate(x0+2.6,y,zB+.7,.7,.3);barrel(x0-2.6,y,zB+1.6,undefined);
 // mooring lines
 return zB;}
function dkLand(){
 // harbourmaster's booth
 const bx=1.5,bz=-9.4;W(bx,0,bz,0,()=>container({len:CT.L20,doorEnd:false,col:jc(dkBright(),.05)}));const fz=bz+CT.W/2;
 win(bx-.8,1.05,fz,1.6,.9,{});door(bx+1.8,.16,fz,.9,2.0,{step:true});
 sock('awning',bx-.8,2.05,fz,0,{w:2.2,d:1.4,drop:.5,h:1.55});
 sock('emblem',bx-CT.L20/2-.001,1.4,bz,-PI/2,{w:.95,h:.95});
 for(const x of [-1.2,1.2])beam('wood',[bx+x-.8,CT.H,fz-.2],[bx+x-.8,CT.H+.9,fz-.2],.05,jc(0x5c4630,.06),true,5);box('plank',bx-.8,CT.H+.8,fz-.35,2.6,.5,.06,jc(0x3a2a1c,.05));sock('sign',bx-.8,CT.H+1.05,fz-.28,0,{w:2.3,h:.42,trade:'HARBOUR'});
 ladder(bx+CT.L20/2-.5,0,-CT.W/2+bz-.02,CT.H,PI);box('plank',bx+.8,CT.H,bz,3.2,.1,CT.W-.2,jc(0x6a5a44,.06));stovepipe(bx+2.4,CT.H,bz-.4,1.3);barrel(bx+3.6,0,fz+.3);barrel(bx+4.05,0,fz+.7);
 // two stalls with awnings
 for(const [sx,c] of [[-8.5,0x3b7f8e],[-14.5,0xc45a30]]){const sz=-9.6;W(sx,0,sz,0,()=>{rngSkip(40);FURNISH('pa_lean_to_stall',0,0,0,0,{v:2});   // the fish stall (its stock and the fish on the counter included)
   sock('awning',0,2.5,1.3,0,{w:4.0,d:1.0,drop:.4,h:2.1});});}
 // fish-drying racks with hanging fish and nets
 for(let r=0;r<3;r++){const x0=-25+r*5.4,z=-15.0;rngSkip(8+4+43+(r===1?20:0));FURNISH('pa_fish_rack',x0,0,z,0,{v:r===1?1:0,ax:-2.15});}   // fish-drying racks (the middle one with a net)
 // net pile and pots
 rngSkip(25+12);FURNISH('pa_net_pile',-8.3,0,-12.9,0);   // the net pile and its pots
 // warehouse shack: patchwork walls, big sliding door, gable roof, lean-to
 const wx=-4.5,wz=-18.7,ww=14,wd=6.4;const ha=3.4;
 wallOpen('plank',wx,0,wz+wd/2,ww,ha,.14,[{x0:wx-2.2,x1:wx+2.2,y0:0,y1:3.0}],jc(0x8a6a3a,.06));wallOpen('corr',wx,0,wz-wd/2,ww,ha,.1,[],pick([P('galv'),P('paint')]));
 for(const sx of [-1,1])wallOpen('corr',wx+sx*ww/2,0,wz,wd,ha,.1,[{x0:wx+sx*ww/2-1,x1:wx+sx*ww/2+1,y0:1.0,y1:2.0}],jc(pick([0x3b7f6e,0x8a3a2c]),.06),sx*PI/2);
 for(const x of [-6,-2,2,6])box('plank',wx+x-.1,0,wz+wd/2+.08,.2,ha,.1,jc(0x5c4630,.06));
 gableRoof(wx,ha,wz,ww,wd,1.6,{col:0x7a7a72});
 W(wx+1.2,0,wz+wd/2+.2,0,()=>{box('corr',0,.1,0,2.8,2.8,.1,jc(0x6a5a44,.06));box('iron',0,3.0,.02,6.6,.1,.1,jc(0x3a3430,.05));});
 sock('awning',wx,3.15,wz+wd/2+.1,0,{w:5.4,d:1.6,drop:.5,h:2.6});sock('banner',wx+ww/2-.9,3.3,wz+wd/2+.12,0,{w:.9,h:2.2});
 crate(wx-3.6,0,wz+wd/2+.9,.8,.3);crate(wx-3.6,.8,wz+wd/2+.9,.7,.5);crate(wx-2.7,0,wz+wd/2+.7,.7,.2);sacks(wx-5,0,wz+wd/2+.8,5,.2);barrel(wx+4.3,0,wz+wd/2+.8);barrel(wx+4.8,0,wz+wd/2+.6);
 // fuel: horizontal tank on cradles, pump shed, a hose and a pipe run
 W(20.3,0,-17.5,0,()=>tankH({r:1.5,L:6.5,col:0xc99a2e}));
 const px=12.5,pz=-12.8;box('plank',px,0,pz,3.8,.1,2.8,jc(0x6a5a44,.06));wallOpen('plank',px,.1,pz-1.3,3.8,2.4,.1,[],jc(0x8a3a2c,.06));for(const sx of [-1,1])wallOpen('plank',px+sx*1.9,.1,pz,2.6,2.4,.1,[],jc(0x7a5a38,.06),sx*PI/2);
 wallOpen('plank',px,.1,pz+1.3,3.8,2.4,.1,[{x0:px-1.1,x1:px+1.1,y0:.1,y1:2.1}],jc(0x8a3a2c,.06));roofP('corr',px-2.1,px+2.1,pz+1.7,2.2,pz-1.5,2.7,.07,P('rust'));
 box('iron',px-.4,.1,pz+.4,.5,1.3,.4,jc(0xc45a30,.05));box('glass',px-.32,.95,pz+.62,.34,.25,.03,jc(0x9ac0a0,.06));
 // pump outside
 box('iron',px+3.0,0,pz+1.1,.6,1.4,.5,jc(0xc99a2e,.05));box('glass',px+3.0,.95,pz+1.36,.4,.3,.03,jc(0x9ac0a0,.06));box('iron',px+3.0,1.4,pz+1.1,.7,.1,.6,jc(0x3a3430,.05));pipe('iron',[[px+3.3,1.0,pz+1.1],[px+3.6,.5,pz+1.5],[px+3.2,.12,pz+2.2]],.035,jc(0x2a2826,.05));
 pipe('iron',[[18,1.1,-16.3],[16.5,.35,-14.6],[px+2.2,.35,pz+.6]],.09,jc(0x4a4038,.05));barrel(px+4.5,0,pz-1.0);barrel(px+5.0,0,pz-.6);barrel(px+4.7,0,pz+.4);
 W(0,0,-1.6,0,()=>dkCrane(19.2));      // set back so the front legs stand on the quay (edge z -5.2), not over its tyre face
 // scatter
 junkPile(-22,-20,1.8,8);tireStack(24.6,-10,3);crate(3.6,0,-6.4,.7,.2);crate(3.6,.7,-6.4,.6,.5);}
function dkBuild(o){
 // water: a seabed and one clean convex polygon plate at y=.05
 const pts=[[-25.6,-5.2],[25.6,-5.2],[25.6,15],[18,22.6],[-18,22.6],[-25.6,15]];
 poly('plain',pts.map(p=>[p[0],.02,p[1]]),jc(0x203c3c,.02),true);poly('water',pts.map(p=>[p[0],.05,p[1]]),jc(0x3a6a70,.02),true);
 dkQuay();W(0,dkQ,0,0,()=>dkLand());
 dkPier();
 W(12.6,0,7.5,.06,()=>dkTug());W(-14.5,0,1.7,-.04,()=>dkRaft());W(1.2,0,10.2,0,()=>dkBarge());
 // gangplank to the raft-house (quay edge at z -5.2 to the raft deck at z -1.5, sloping down to it), mooring lines
 box('plank',-14.5-.5,.77,-3.45,1.0,.08,4.3,jc(0x6a5a44,.06),0,.05);
 dkRope([-14,1.2,-1.4],[-14,dkQ+.4,-5.4],.5);dkRope([-12.3,1.2,.5],[-10.6,dkQ+.4,-5.5],.5);
 dkRope([9.0,1.6,2.5],[8.3,1.3,1.5],.2);dkRope([4.2,1.3,2.0],[5.2,1.2,1.4],.2);
 // land-side steps: a timber flight up the back wall of the quay from the street (drawn last: the rest of the dock keeps its random draws)
 stairs(17,0,-24.55,17,dkQ+.03,-23.05,1.4,{rail:false});
}
