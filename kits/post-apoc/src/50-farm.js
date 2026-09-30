// prefix: fm
// ---------------------------------------------------------------- farm: 3 buildings (50 farm) : farm plot, farmhouse, granary
// ENGINE WORKAROUND: plane4/roofP take e2 from the 4th point, which shifts every sheet by half its width. These pass the same-side point twice, right in either version.
function fmPlane(mk,p0,p1,p2,th,col){plane4(mk,p0,p1,p2,p2,th,col);}
function fmRoof(mk,x0,x1,zLow,yLow,zHigh,yHigh,th,col){fmPlane(mk,[x0,yLow,zLow],[x1,yLow,zLow],[x0,yHigh,zHigh],th||.06,col);}
function fmGable(x,y,z,w,d,rise,o){o=o||{};const ov=o.ov===undefined?.4:o.ov,m=o.mat||'corr';const c1=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):jc(o.col,.05);
 const hw=w/2+ov,hd=d/2+ov*.7;fmRoof(m,x-hw,x+hw,z+hd,y,z,y+rise,.07,c1);fmRoof(m,x-hw,x+hw,z-hd,y,z,y+rise,.07,c1);
 if(o.gables!==false){for(const sx of [-1,1])poly('plank',[[x+sx*(w/2),y,z-d/2],[x+sx*(w/2),y,z+d/2],[x+sx*(w/2),y+rise*(d/2)/(d/2+ov*.7),z]],jc(pick(PAL.wood),.06),true);}
 box('iron',x,y+rise-.02,z,w+ov*2,.1,.16,jc(0x5a4a3c,.05));return y+rise;}
function fmLean(x,zw,w,out,yHigh,yLow,o){o=o||{};const c=o.col===undefined?pick([P('galv'),P('rust'),P('paint')]):jc(o.col,.05);fmRoof(o.mat||'corr',x-w/2,x+w/2,zw+out,yLow,zw,yHigh,.06,c);
 if(o.posts!==false){const n=Math.max(2,Math.round(w/2.6)+1);for(let k=0;k<n;k++){const px=x-w/2+.1+k*(w-.2)/(n-1);beam('wood',[px,0,zw+out-.1],[px,yLow,zw+out-.1],.11,jc(0x5c4630,.06));}
  beam('wood',[x-w/2,yLow-.02,zw+out],[x+w/2,yLow-.02,zw+out],.1,jc(0x5c4630,.06));}}
// Shared helpers first (all names carry fm).
const fmG=[0x4d8a3c,0x5c9a3a,0x6aa63f,0x3f7a34,0x7ab04a];          // leaf greens
const fmS=[0x4a3220,0x5a3d26,0x3e2a1c];                              // soil browns
// soil bed (raised, rectangular) with planted rows along local x. kind: 'leaf' | 'corn' | 'sun' | 'bean'
function fmRows(x,z,w,d,n,kind,ry){W(x,0,z,ry||0,()=>{box('plain',0,0,0,w,.14,d,jc(pick(fmS),.08));
 for(let r=0;r<n;r++){const zz=-d/2+d*(r+.5)/n;box('plain',0,.14,zz,w-.1,.09,d/n*.45,jc(0x4a301c,.08));
  const step=kind==='leaf'||kind==='bean'?.42:.7;
  for(let xx=-w/2+.3;xx<=w/2-.25;xx+=step){const px=xx+rr(-.05,.05);
   if(kind==='corn'){const hh=rr(1.5,2.2);beam('plain',[px,.15,zz],[px+rr(-.05,.05),.15+hh,zz],.05,jc(0x8aa040,.06),true,5);
    for(let k=0;k<3;k++){const y=.5+k*.5,s=k%2?1:-1;beam('plain',[px,y,zz],[px+.45,y+.25,zz+s*.25],.06,jc(pick(fmG),.08),false);}
    cone('plain',px,.15+hh-.05,zz,.06,.22,jc(0xd8b840,.08),5);}
   else if(kind==='sun'){const hh=rr(1.5,2.0);beam('plain',[px,.15,zz],[px,.15+hh,zz],.06,jc(0x5c8a34,.06),true,5);
    for(let k=0;k<2;k++)box('plain',px+(k?.18:-.18),.5+k*.4,zz,.34,.05,.2,jc(pick(fmG),.08),0,0,k?-.5:.5);
    cyl('plain',px,.15+hh-.02,zz+.05,.24,.07,jc(0xe8b420,.06),9);cyl('plain',px,.15+hh,zz+.06,.13,.07,jc(0x4a2c18,.05),8);}
   else if(kind==='bean'){for(const s of [-1,1])beam('wood',[px+s*.18,.15,zz],[px,.95,zz],.03,jc(0x6a5238,.06),true,4);sph('plain',px,.32,zz,.2,jc(pick(fmG),.1),1.1);}
   else sph('plain',px,.28,zz,rr(.17,.24),jc(pick(fmG),.1),.75);}}});}
function fmTyreBed(x,z,R,o){o=o||{};tireRing(x,z,R,2,0,TAU);cyl('plain',x,.3,z,R-.3,.22,jc(pick(fmS),.08),12);
 const n=o.n||4;for(let k=0;k<n;k++){const a=k/n*TAU+rng(),d=rng()*(R-.55);sph('plain',x+Math.cos(a)*d,.6,z+Math.sin(a)*d,rr(.2,.3),jc(pick(o.cols||fmG),.1),.8);}}
function fmBarrelBed(x,z,o){o=o||{};const c=jc(pick([0x8a3a2c,0x2f5f8f,0x4d6f3c,0x8a6a3a,0xc99a2e]),.08);cyl('sheet',x,0,z,.42,.5,c,10,.42,true);for(const f of [.1,.4])cyl('iron',x,f,z,.44,.04,jc(0x3a3430,.05),10);
 cyl('plain',x,.46,z,.38,.06,jc(pick(fmS),.08),10);for(let k=0;k<4;k++){const a=k*PI/2+.5;sph('plain',x+Math.cos(a)*.16,.62,z+Math.sin(a)*.16,.15,jc(pick(o.cols||fmG),.1),.9);}}
function fmPlankBed(x,z,w,d,ry,kind){W(x,0,z,ry||0,()=>{const h=.4;for(const sz of [-1,1])box('plank',0,0,sz*(d/2-.03),w,h,.06,jc(pick(PAL.wood),.07));for(const sx of [-1,1])box('plank',sx*(w/2-.03),0,0,.06,h,d,jc(pick(PAL.wood),.07));
  box('plain',0,.02,0,w-.1,h-.06,d-.1,jc(pick(fmS),.08));if(kind)fmRows(0,0,w-.3,d-.3,Math.max(1,Math.round(d/.45)),kind);});}
function fmScarecrow(x,z,ry){W(x,0,z,ry||0,()=>{beam('wood',[0,0,0],[0,2.1,0],.08,jc(0x5c4630,.06),true,6);beam('wood',[-.85,1.7,0],[.85,1.7,0],.07,jc(0x5c4630,.06),true,6);
 box('cloth',0,1.0,0,.5,.8,.24,jc(0xa04a2a,.08));box('cloth',-.6,1.45,0,.7,.25,.08,jc(0xc99a2e,.08),0,0,.15);box('cloth',.6,1.45,0,.7,.25,.08,jc(0x3b7f8e,.08),0,0,-.15);
 sph('cloth',0,2.05,0,.2,jc(0xd8c090,.05),1);cyl('sheet',0,2.2,0,.3,.05,jc(0x6a5a44,.05),8);cyl('sheet',0,2.24,0,.17,.2,jc(0x6a5a44,.05),8);
 for(const s of [-1,1])box('cloth',s*.15,.35,0,.1,.65,.06,jc(0x4a5a6a,.06));
 box('cloth',.3,1.7,.1,.04,.5,.02,jc(0xc23a2a,.1));box('cloth',-.3,1.7,.1,.04,.4,.02,jc(0xe8dcc0,.1));});}
// water pump windmill: lattice tower, spinning multi-blade wheel, tail vane
function fmWindpump(x,z,H,ry){W(x,0,z,ry||0,()=>{const b=1.0,t=.35,c=jc(0x6a6a66,.05);
 const at=(y,s)=>{const k=b+(t-b)*y/H;return k*s;};
 for(const sx of [-1,1])for(const sz of [-1,1])beam('iron',[sx*b,0,sz*b],[sx*t,H,sz*t],.09,c);
 const N=4;for(let i=0;i<=N;i++){const y=H*i/N,k=b+(t-b)*i/N;if(i>0){beam('iron',[-k,y,-k],[k,y,-k],.05,c);beam('iron',[-k,y,k],[k,y,k],.05,c);beam('iron',[-k,y,-k],[-k,y,k],.05,c);beam('iron',[k,y,-k],[k,y,k],.05,c);}
  if(i<N){const y2=H*(i+1)/N,k2=b+(t-b)*(i+1)/N;for(const s of [-1,1]){beam('iron',[-k,y,s*k],[k2,y2,s*k2],.035,c,true,4);beam('iron',[k,y,s*k],[-k2,y2,s*k2],.035,c,true,4);beam('iron',[s*k,y,-k],[s*k2,y2,k2],.035,c,true,4);beam('iron',[s*k,y,k],[s*k2,y2,-k2],.035,c,true,4);}}}
 for(const s of [-1,1])for(const q of [-1,1])cyl('conc',s*b,0,q*b,.22,.18,jc(0x8a8478,.05),8);
 box('iron',0,H,0,.5,.3,.9,jc(0x4a4038,.05));cylH('iron',0,H+.15,.45,.14,.5,jc(0x5a5a56,.05),'z',8);
 // tail vane on a boom behind, wheel in front
 beam('iron',[0,H+.2,-.4],[0,H+.2,-2.4],.07,jc(0x5a4a3c,.05));box('sheet',0,H-.2,-2.9,.05,.9,1.3,jc(0xc45a30,.06));
 const sbKeep=SB;SB=null;   // ENGINE WORKAROUND: spinner-local vertices would pollute the building's bbox
 spin(0,H+.2,.75,0,'z',1.6,()=>{const R=1.55;for(let k=0;k<16;k++){const a=k/16*TAU,rc=R*.6,hh=R*.8;box('sheet',-Math.sin(a)*rc,Math.cos(a)*rc-hh/2,0,.3+.1*(k%2),hh,.03,jc(k%4===0?0xc45a30:pick([0xc8ccc8,0xb0b4b0,0x9a9e9a]),.05),0,0,a);}
   cylH('iron',0,0,0,.2,.2,jc(0x8a5a2a,.05),'z',8);const c2=jc(0x6a6a66,.05);for(let k=0;k<8;k++){const a=k/8*TAU;beam('iron',[0,0,0],[-Math.sin(a)*R,Math.cos(a)*R,0],.03,c2,true,4);}
   for(let k=0;k<24;k++){const a=k/24*TAU,a2=(k+1)/24*TAU;beam('iron',[-Math.sin(a)*R,Math.cos(a)*R,0],[-Math.sin(a2)*R,Math.cos(a2)*R,0],.03,c2,true,4);}});SB=sbKeep;
 // pump rod down the tower
 beam('iron',[0,H-.1,0],[0,.3,0],.04,jc(0x8a8a86,.05),true,5);cyl('sheet',0,0,0,.28,.6,jc(0x2f5f8f,.06),8);});}
// chicken coop on wheels
function fmCoop(x,z,ry){W(x,0,z,ry||0,()=>{const w=2.0,d=1.3;const c=jc(pick([0x3b7f6e,0xc99a2e,0x8a3a2c]),.06);
 box('plank',0,.55,0,w,.1,d,jc(0x6a5a44,.06));box('sheet',0,.65,-d/2+.03,w,.85,.06,c);box('sheet',0,.65,d/2-.03,w*.6,.85,.06,c);for(const sx of [-1,1])box('sheet',sx*(w/2-.03),.65,0,.06,.85,d,c);
 fmRoof('corr',-w/2-.1,w/2+.1,d/2+.1,1.5,-d/2-.1,1.75,.05,P('galv'));door(-.35,.75,d/2+.03,.4,.6,{step:false,col:0xc45a30});
 box('plank',.75,.7,d/2+.02,.5,.5,.04,jc(0x3a2a1c,.05));   // nest hatch
 tire(-.8,.36,d/2+.05,.36,.1,undefined,0,PI/2,0);tire(.8,.36,d/2+.05,.36,.1,undefined,0,PI/2,0);tire(-.8,.36,-d/2-.05,.36,.1,undefined,0,PI/2,0);tire(.8,.36,-d/2-.05,.36,.1,undefined,0,PI/2,0);
 beam('iron',[-.8,.36,-d/2],[-.8,.36,d/2],.05,jc(0x4a4038,.05),true,5);beam('iron',[.8,.36,-d/2],[.8,.36,d/2],.05,jc(0x4a4038,.05),true,5);
 beam('wood',[-w/2,.55,0],[-w/2-1.1,.2,0],.07,jc(0x5c4630,.06));   // tow bar
 box('plank',w/2+.3,.02,.1,.9,.35,.05,jc(0x6a5a44,.06),.8,-.05);beam('wood',[w/2-.05,.62,.35],[w/2+.8,.02,.8],.05,jc(0x6a5a44,.06));   // ramp
 for(let k=0;k<4;k++){const a=k*1.7;const px=w/2+.7+Math.cos(a)*.45,pz=.9+Math.sin(a)*.4;sph('plain',px,.16,pz,.13,jc(pick([0xd8c8a0,0xa04a2a,0x8a5a30]),.08),1.05);sph('plain',px+.09,.3,pz,.07,jc(0xc23a2a,.05),1);}});}
// goat / pig pen
function fmPen(x,z,w,d,gate){const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,o={type:'pickets'};
 fenceRun(x0,z0,x1,z0,1.4,o);fenceRun(x0,z0,x0,z1,1.4,o);fenceRun(x1,z0,x1,z1,1.4,o);fenceRun(x0,z1,x-gate/2,z1,1.4,o);fenceRun(x+gate/2,z1,x1,z1,1.4,o);
 box('wood',x0-.05,1.35,z0,w+.1,.08,.1,jc(0x5c4630,.06));
 // shelter lean-to against the back fence
 const sw=w*.55;fmLean(x0+sw/2+.3,z0+.05,sw,1.8,1.9,1.5,{mat:'corr'});
 box('earth',x0+sw/2+.3,0,z0+1.0,sw,.05,2,jc(0x6a5238,.08));   // trodden mud
 for(let k=0;k<3;k++){const px=x0+1.0+k*1.3,pz=z0+1.6+rr(0,.6);sph('plain',px,.42,pz,.5,jc(pick([0xe8b0a0,0xd89a8a,0xc88a7a]),.06),.7);sph('plain',px+.5,.5,pz+.05,.24,jc(0xe0a898,.06),.9);
  for(const s of [-1,1])for(const q of [-.2,.25])cyl('plain',px+s*.22+q*0,0,pz+q*1.1,.05,.2,jc(0xc88a7a,.05),5);}
 // goat on a tyre
 tire(x1-1.2,.12,z1-1.4,TYR.R,TYR.t);sph('plain',x1-1.2,.85,z1-1.4,.28,jc(0xe8e0d0,.05),.8);sph('plain',x1-1.0,1.05,z1-1.4,.14,jc(0xe8e0d0,.05),1);
 fmTrough(x1-.9,z0+.8);}
function fmTrough(x,z){box('plank',x,.0,z,1.1,.3,.4,jc(0x5c4630,.06));box('water',x,.3,z,1.0,.02,.3,jc(0x3a6a70,.05));}
function fmCold(x,z,w,d,ry){W(x,0,z,ry||0,()=>{const hb=.4,ht=.85;
 for(const sx of [-1,1])poly('plank',[[sx*w/2,0,-d/2],[sx*w/2,0,d/2],[sx*w/2,ht,d/2],[sx*w/2,hb,-d/2]],jc(pick(PAL.wood),.07),true);
 box('plank',0,0,-d/2,w,hb,.08,jc(pick(PAL.wood),.07));box('plank',0,0,d/2-.04,w,ht,.08,jc(pick(PAL.wood),.07));
 box('plain',0,.05,0,w-.2,.2,d-.2,jc(pick(fmS),.08));for(let k=0;k<Math.round(w/.4);k++)sph('plain',-w/2+.3+k*.4,.35,rr(-d/4,d/4),.13,jc(pick(fmG),.1),.9);
 const n=Math.max(2,Math.round(w/1.2)),pw=w/n;for(let k=0;k<n;k++){const x0=-w/2+k*pw;const op=k===n-1?.5:0;
  fmPlane('bottle',[x0+.02,ht+.02,d/2],[x0+pw-.02,ht+.02,d/2],[x0+.02,hb+.05+op,-d/2],.3,null);}
 for(let k=0;k<=n;k++){const x=-w/2+k*pw;beam('wood',[x,ht+.02,d/2+.03],[x,hb+.06,-d/2-.03],.07,jc(0x6a5238,.06));}
 beam('wood',[-w/2,ht+.03,d/2+.04],[w/2,ht+.03,d/2+.04],.08,jc(0x6a5238,.06));beam('wood',[-w/2,hb+.05,-d/2-.04],[w/2,hb+.05,-d/2-.04],.08,jc(0x6a5238,.06));});}
function fmCompost(x,z,r){for(let k=0;k<3;k++)fenceRun(x-r,z-r,x+r,z-r,.9,{type:'pickets'});
 for(const [a,b,c,d] of [[x-r,z-r,x+r,z-r],[x-r,z-r,x-r,z+r],[x+r,z-r,x+r,z+r]])fenceRun(a,b,c,d,1.0,{type:'pickets'});
 sph('plain',x,.2,z,r*.95,jc(0x4a3220,.1),.55);for(let k=0;k<10;k++){const a=rng()*TAU,d=rng()*r*.7;sph('plain',x+Math.cos(a)*d,.5+rr(0,.15),z+Math.sin(a)*d,rr(.12,.22),jc(pick([0x6a8a3a,0x8a6a2a,0xa04a2a,0x3f7a34,0xc8a040]),.1),.6);}}
// tool shed of sheet, front to +z. returns nothing; sockets declared here
function fmShed(x,z,w,d,h){const c=jc(pick([0xd0583a,0x3fa08e,0x3f80c0]),.05),fz=z+d/2;
 box('plank',x,0,z,w,.12,d,jc(0x6a5a44,.08));
 for(const [px,py,pz,ww,dd] of [[x,0,z-d/2+.04,w,.08],[x-w/2+.04,0,z,.08,d],[x+w/2-.04,0,z,.08,d]])box('corr',px,.12,pz,ww,h-.12,dd,jc(c,.04));
 wallOpen('corr',x,.12,fz-.04,w,h-.12,.08,[{x0:x+.1,x1:x+w/2-.3,y0:.12,y1:2.0}],c);   // door gap on the right half
 door(x+.6,.12,fz-.02,.9,1.9,{step:false,col:0x4a3a2c});
 fmRoof('corr',x-w/2-.2,x+w/2+.2,fz+.4,h-.1,z-d/2-.2,h+.5,.06,P('galv'));
 for(const sx of [-1,1])beam('wood',[x+sx*w/2,.12,fz],[x+sx*w/2,h,fz],.09,jc(0x5c4630,.06));
 beam('wood',[x-w/2,h,fz],[x+w/2,h,fz],.09,jc(0x5c4630,.06));
 // tools hung on the front, a bucket, a wheelbarrow
 for(let k=0;k<3;k++){const tx=x-w/2+.5+k*.3;beam('wood',[tx,.5,fz+.06],[tx,1.9,fz+.06],.03,jc(0x7a6040,.05),true,4);box('iron',tx,1.75,fz+.06,.22,.16,.03,jc(0x8a8a86,.05));}
 cyl('sheet',x-w/2-.4,0,fz+.3,.2,.3,jc(0x8a8a86,.06),8);
 W(x-w/2-1.4,0,fz+.8,.4,()=>{box('sheet',0,.35,0,.9,.28,.55,jc(0xc45a30,.06));tire(.55,.23,0,.23,.07,undefined,0,0,PI/2);beam('wood',[-.4,.4,.2],[-1.0,.7,.25],.04,jc(0x6a5238,.06));beam('wood',[-.4,.4,-.2],[-1.0,.7,-.25],.04,jc(0x6a5238,.06));});
 sock('awning',x+.6,2.1,fz,0,{w:1.5,d:.9,drop:.35,h:2.0});sock('emblem',x-w/2+1.0,1.3,fz+.04,0,{w:.7,h:.7});}

defBuilding({key:'farm',name:'Farm plot',seed:5010,tags:{type:['farm'],size:'large',core:'raised beds of tyres, barrels and planks',materials:['tyres','plank','sheet metal','bottle glass','barrels']},w:28,d:22,h:9,build:fmFarm});
function fmFarm(o){
 const mir=o.v===1?-1:1;
 W(0,0,0,0,()=>{
 // ground: packed earth apron across the plot
 box('earth',0,0,0,28,.03,22,jc(0x8a7250,.05));
 // the two crop fields behind
 fmRows(-8,-7,9.6,6.4,7,'corn');
 fmRows(3.5,-7.6,8.4,4.8,6,'sun');fmRows(3.5,-4.4,8.4,1.6,3,'bean');
 fmRows(-10.6,-1.6,4,.9,2,'leaf');
 // irrigation ditch along z=-2.4 from the tank to the windpump, banks of earth, water inside
 box('earth',-1.3,0,-2.75,23,.14,.28,jc(0x7a6040,.05));box('earth',-1.3,0,-2.05,23,.14,.28,jc(0x7a6040,.05));box('water',-1.3,.04,-2.4,23,.03,.5,jc(0x3a6a70,.04));
 for(let k=0;k<4;k++)box('plank',-9+k*6.2,.1,-2.4,.7,.05,.9,jc(pick(PAL.wood),.06));   // little bridges
 // windpump at the ditch end
 fmWindpump(10.6,-3.4,7.4,.3);
 // beds in front of the ditch: tyre rings, half barrels, plank boxes
 fmTyreBed(-9.4,.6,.9,{cols:[0xc23a2a,0xd8a020,0x4d8a3c]});fmTyreBed(-6.9,1.2,.75,{cols:[0x6aa63f,0xd8a020]});
 fmBarrelBed(-4.4,.6);fmBarrelBed(-3.4,1.4,{cols:[0xc23a2a,0x6aa63f]});fmBarrelBed(-2.3,.6,{cols:[0xd8a020,0x6aa63f]});
 fmPlankBed(0,.5,2.6,1.0,0,'leaf');fmPlankBed(3.0,.5,2.6,1.0,0,'bean');fmPlankBed(0,2.2,2.6,1.0,0,'leaf');
 fmCold(6.6,1.2,3.4,1.7,0);
 // water tank on stilts, pipes to the beds and the ditch
 const tx=-11.2,tz=-1.4;for(const sx of [-1,1])for(const sz of [-1,1]){beam('wood',[tx+sx*.9,0,tz+sz*.9],[tx+sx*.9,3.0,tz+sz*.9],.13,jc(0x5c4630,.06));}
 for(const y of [1.0,2.0])for(const sz of [-1,1])beam('wood',[tx-.9,y,tz+sz*.9],[tx+.9,y+.5,tz+sz*.9],.06,jc(0x5c4630,.06),true,5);
 box('plank',tx,3.0,tz,2.3,.14,2.3,jc(0x5c4630,.06));cyl('sheet',tx,3.14,tz,1.05,1.5,jc(0x2f7f8e,.05),16,1.05,true);cyl('iron',tx,3.9,tz,1.1,.1,jc(0x4a4038,.05),16);cone('sheet',tx,4.64,tz,1.1,.45,jc(0x5a5a56,.05),16);
 ladder(tx+.2,0,tz+1.02,4.5,0);
 pipe('iron',[[tx+1.1,3.4,tz+.4],[tx+1.6,3.4,tz+.4],[tx+1.6,.5,tz+.4],[tx+1.6,.5,-1.0],[-9.4,.5,-1.0],[-9.4,.9,.0]],.06,jc(0x5a6a72,.05));
 pipe('iron',[[-9.4,.5,-1.0],[-6.9,.5,-1.0],[-6.9,.6,.4]],.05,jc(0x5a6a72,.05));pipe('iron',[[-6.9,.5,-1.0],[-2.3,.5,-1.0],[-2.3,.3,.0]],.05,jc(0x5a6a72,.05));
 for(const x of [-9.4,-6.9,-2.3])cyl('iron',x,.5,-1.0,.09,.18,jc(0xc23a2a,.05),8);
 pipe('iron',[[-2.3,.5,-1.0],[2.2,.5,-1.0],[3.6,.5,-1.0],[3.6,.4,-.1]],.05,jc(0x5a6a72,.05));
 // scarecrow, coop, pen, shed, compost
 fmScarecrow(-8.3,-7.2,.3);fmScarecrow(3.6,-7.0,-.4);
 fmCoop(2.2,7.2,-.2);fmPen(8.9,7.2,6.6,6.4,1.8);fmShed(-10.4,7.4,3.6,2.8,2.6);fmCompost(-5.4,8.2,1.1);
 // yard junk: tyre stack, barrels, a lamp
 tireStack(-8.4,5.6,4);barrel(-7.5,0,5.2);barrel(-7.1,0,5.8);junkPile(-1.8,6.0,1.2,7);lamp(5.4,0,9.6,3.2);
 // entrance gate posts with a banner beam
 for(const sx of [-1,1]){beam('wood',[sx*3.4,0,10.4],[sx*3.4,4.0,10.4],.14,jc(0x5c4630,.06));}
 beam('wood',[-3.4,3.9,10.4],[3.4,3.9,10.4],.12,jc(0x5c4630,.06));beam('wood',[-3.4,2.2,10.4],[-2.4,3.4,10.4],.06,jc(0x5c4630,.06));beam('wood',[3.4,2.2,10.4],[2.4,3.4,10.4],.06,jc(0x5c4630,.06));
 sock('banner',0,3.85,10.46,0,{w:1.0,h:2.3});
 // flag on the windpump tail
 beam('wood',[10.6,7.6,-3.4],[10.6,9.0,-3.4],.04,jc(0x4a4038,.05),true,5);sock('flag',10.6,9.0,-3.4,0,{w:1.0,h:.6});
 });}

// ---------------------------------------------------------------- farmhouse: silo stair-core fused to a long plank-and-sheet house
function fmRocker(x,z,ry,col){W(x,0,z,ry||0,()=>{const c=jc(col||0x8a5a30,.06);
 for(const s of [-1,1]){beam('wood',[s*.28,.55,-.3],[s*.28,.55,.3],.04,c);beam('wood',[s*.28,.12,-.4],[s*.28,.05,0],.04,c);beam('wood',[s*.28,.05,0],[s*.28,.12,.4],.04,c);
  beam('wood',[s*.28,.12,-.4],[s*.28,.55,-.3],.035,c);beam('wood',[s*.28,.12,.4],[s*.28,.55,.3],.035,c);beam('wood',[s*.28,.55,-.3],[s*.28,1.0,-.38],.04,c);}
 box('plank',0,.5,0,.6,.05,.6,c);box('plank',0,.7,-.34,.6,.4,.04,jc(0xc99a2e,.08),0,-.15);box('cloth',0,.56,.05,.5,.06,.4,jc(0xa04a2a,.08));});}
function fmWell(x,z,r){tireRing(x,z,r,3,0,TAU);cyl('plain',x,.5,z,r-.32,.02,jc(0x1a2a30,.03),12);
 for(const s of [-1,1])beam('wood',[x+s*(r+.05),0,z],[x+s*(r+.05),2.1,z],.09,jc(0x5c4630,.06));
 beam('wood',[x-r-.1,2.1,z],[x+r+.1,2.1,z],.09,jc(0x5c4630,.06));cylH('wood',x,1.7,z,.09,r*2,jc(0x7a5a38,.06),'x',8);
 fmRoof('corr',x-r-.35,x+r+.35,z+.8,2.0,z-.8,2.5,.05,P('rust'));beam('plain',[x,1.65,z],[x,1.0,z],.012,jc(0x6a5a44,.05),true,3);cyl('sheet',x,.75,z,.13,.26,jc(0x8a8a86,.06),8);}
defBuilding({key:'farmhouse',name:'Farmhouse',seed:5020,tags:{type:['farm','single-family dwelling'],size:'medium',core:'grain silo',materials:['plank','galvanised sheet','tyres','timber']},w:21,d:14,h:10.4,build:fmFarmhouse});
function fmFarmhouse(o){
 const sx=-6.6,sz=-1.6,r=3.0,sh=7.6,hx0=-4.2,hx1=7.8,hz0=-5,hz1=2,wh=5.4;
 W(sx,0,sz,0,()=>silo({r:r,h:sh,roofCol:0xc45a30,col:o.v===1?0xc9a24a:0xc8ccc8}));
 // house body: plank ground floor, teal sheet upper storey, both boxes overlap the silo by a hand
 const pc=o.v===1?0x7aa090:0xd0a868;
 box('plank',(hx0+hx1)/2,0,(hz0+hz1)/2,hx1-hx0,2.75,hz1-hz0,jc(pc,.05));box('conc',(hx0+hx1)/2,0,(hz0+hz1)/2,hx1-hx0+.3,.35,hz1-hz0+.3,jc(0x8a8478,.05));
 box('corr',(hx0+hx1)/2,2.75,(hz0+hz1)/2,hx1-hx0+.06,wh-2.75,hz1-hz0+.06,jc(o.v===1?0xd8883a:0x3fa08e,.05));
 box('iron',(hx0+hx1)/2,2.72,(hz0+hz1)/2,hx1-hx0+.16,.1,hz1-hz0+.16,jc(0x5c4630,.05));
 // patch sheets on the plank floor
 for(let k=0;k<6;k++){const pw=rr(.9,1.6),px=rr(hx0+1,hx1-1-pw);box(pick(['sheet','corr']),px,rr(.4,1.5),hz1+.02,pw,rr(.5,.9),.03,pick([P('rust'),P('galv'),P('paint')]),0,0,rr(-.05,.05));}
 fmGable((hx0+hx1)/2,wh,(hz0+hz1)/2,hx1-hx0,hz1-hz0,2.0,{col:0xb85030});
 // chimney of brick-coloured earth block with a stovepipe beside it
 box('earth',5.9,3.6,-3.1,.9,5.2,.9,jc(0xa8543a,.05));box('conc',5.9,8.7,-3.1,1.1,.14,1.1,jc(0x6a625a,.05));stovepipe(4.7,6.6,-2.6,1.9);
 // windows and doors on the front (z=2): ground floor, upper storey
 const fz=hz1;
 door(1.0,.5,fz,1.1,2.1,{step:false,col:0x3f7fc0});win(-2.4,1.5,fz,1.0,1.0);win(3.6,1.5,fz,1.0,1.0,{lit:o.v===1});
 door(1.0,2.9,fz,1.0,2.0,{step:false,col:0xc45a30});win(-2.4,3.6,fz,.9,1.0,{shutters:true});win(3.6,3.6,fz,.9,1.0,{shutters:true,lit:o.v===1});win(6.4,3.6,fz,.7,1.0,{});
 // back and east end windows
 for(const x of [-2,2,6])W(x,0,hz0,PI,()=>win(0,1.5,0,.9,.9,{}));for(const x of [-2,3])W(x,0,hz0,PI,()=>win(0,3.6,0,.9,.9,{shutters:true}));
 W(hx1,0,-1.5,PI/2,()=>{win(0,3.6,0,1.0,1.0,{});});
 // veranda and balcony: front decks, posts, tin roofs
 deck(-6.5,.5,3.0,5.8,3.2,{posts:false,rail:['l']});deck(1.0,.5,3.3,9.2,2.6,{posts:false});
 deck(-3.9,2.9,3.0,11.6,3.2,{posts:false,rail:['l','f']});deck(2.5,2.9,3.3,3.6,2.6,{posts:false,rail:['f']});
 deck(5.0,2.9,5.4,2.8,2.2,{posts:false,rail:['f','r','l']});   // stair landing
 for(const x of [-9.3,-6.4]){beam('wood',[x,0,4.5],[x,3.9,4.5],.12,jc(0x5c4630,.06));}for(const x of [-3.6,-1.2,1.2,3.6]){beam('wood',[x,0,4.5],[x,5.1,4.5],.12,jc(0x5c4630,.06));}
 for(const x of [4.0,6.2]){beam('wood',[x,0,6.3],[x,2.8,6.3],.12,jc(0x5c4630,.06));}
 beam('wood',[6.2,0,4.6],[6.2,2.8,4.6],.12,jc(0x5c4630,.06));
 // veranda rail at front, with the stair gap at x -2.4..-.6, front rail on the ground deck
 for(const [a,b] of [[-9.4,-2.6],[-.5,5.2]]){beam('wood',[a,1.5,4.55],[b,1.5,4.55],.06,jc(0x5c4630,.06));for(let x=a+.3;x<=b;x+=1.0)beam('wood',[x,.5,4.55],[x,1.5,4.55],.04,jc(0x5c4630,.06),true,5);}
 fmLean(1.4,1.9,10.6,3.2,5.75,5.2,{posts:false,col:0xc99a2e});
 beam('wood',[-3.9,5.2,4.9],[6.6,5.2,4.9],.1,jc(0x5c4630,.06));
 // stairs: ground -> veranda (front) and ground -> balcony landing (east)
 stairs(-1.5,0,6.6,-1.5,.5,4.5,1.3,{rail:false});
 stairs(10.4,0,6.3,6.4,2.9,6.3,.95);
 // silo details: doors and windows, a spiral stair core stepping up the back
 W(sx,0,sz+r,0,()=>{door(0,.5,.02,1.0,2.0,{step:false,col:0x3f7fc0});door(0,2.9,.02,1.0,2.0,{step:false,col:0xc45a30});});
 for(const [a,y] of [[PI*.72,3.7],[PI*1.0,1.7],[PI*1.0,4.2],[PI*1.28,3.7],[PI*1.6,6.0]]){const px=sx+Math.cos(a)*(r+.02),pz=sz+Math.sin(a)*(r+.02);W(px,0,pz,PI/2-a,()=>win(0,y,0,.8,.9,{shutters:y>3}));}
 const N=17,R2=r+.85;for(let k=0;k<N;k++){const a=PI*.78+k*.052*PI*1.0,y=.22+k*.33;const px=sx+Math.cos(a)*R2,pz=sz+Math.sin(a)*R2;
  W(px,y,pz,PI/2-a,()=>{box('plank',0,-.05,0,1.0,.06,.85,jc(pick(PAL.wood),.07));beam('iron',[0,-.03,-.3],[0,.4,-.85],.03,jc(0x4a4038,.05));});
  W(sx+Math.cos(a)*(r+.05),y-.03,sz+Math.sin(a)*(r+.05),PI/2-a,()=>beam('iron',[0,0,0],[0,-.02,.7],.05,jc(0x4a4038,.05)));
  if(k%4===0)beam('wood',[px,0,pz],[px,y-.05,pz],.09,jc(0x5c4630,.06));
  const a2=a+.052*PI,y2=y+.33;const qx=sx+Math.cos(a2)*(R2+.42),qz=sz+Math.sin(a2)*(R2+.42);const rx=sx+Math.cos(a)*(R2+.42),rz=sz+Math.sin(a)*(R2+.42);if(k<N-1)beam('wood',[rx,y+.95,rz],[qx,y2+.95,qz],.05,jc(0x5c4630,.06));if(k%2===0)beam('wood',[rx,y-.05,rz],[rx,y+.95,rz],.04,jc(0x5c4630,.06),true,5);}
 { const a=PI*.78+(N-1)*.052*PI,yl=.22+(N-1)*.33;const px=sx+Math.cos(a)*(r+.65),pz=sz+Math.sin(a)*(r+.65);
  // landing flush with the last tread, running back to the silo wall; door sill exactly at its top, centred on the landing
  W(px,yl,pz,PI/2-a,()=>{box('plank',0,-.05,0,1.3,.06,1.3,jc(0x6a5238,.06));for(const s of [-1]){beam('wood',[s*.62,-.05,-.6],[s*.62,.95,-.6],.05,jc(0x5c4630,.06),true,5);beam('wood',[s*.62,-.05,.62],[s*.62,.95,.62],.05,jc(0x5c4630,.06),true,5);beam('wood',[s*.62,.95,-.6],[s*.62,.95,.62],.05,jc(0x5c4630,.06));}
   beam('wood',[-.62,.95,.62],[.62,.95,.62],.05,jc(0x5c4630,.06));beam('wood',[-.62,-.05,.62],[-.62,-.6,.62],.04,jc(0x5c4630,.06));});
  W(sx+Math.cos(a)*(r+.02),yl+.01,sz+Math.sin(a)*(r+.02),PI/2-a,()=>door(0,0,0,.9,1.8,{step:false,col:0x3f9a8a}));
  beam('wood',[px+Math.cos(a)*.6,0,pz+Math.sin(a)*.6],[px+Math.cos(a)*.6,yl-.05,pz+Math.sin(a)*.6],.1,jc(0x5c4630,.06));}
 // east barn lean-to for the cart
 W(hx1,0,-1.9,PI/2,()=>{fmLean(0,0,5.0,2.9,3.9,2.7,{col:0x8a3a2c});box('plank',0,0,1.4,5.0,.08,2.9,jc(0x6a5a44,.08));
  for(const s of [-1,1])box('plank',s*2.45,0,1.4,.08,2.7,2.8,jc(pick(PAL.wood),.07));
  box('plank',0,.55,1.5,1.3,.1,2.2,jc(0x7a5a38,.06));for(const s of [-1,1]){tire(s*.78,.5,1.3,.5,.09,undefined,0,0,PI/2);cyl('iron',s*.74,.5,1.3,.16,.06,jc(0x8a8a86,.05),8);}
  for(const s of [-1,1])beam('wood',[s*.55,.6,1.5],[s*.5,.5,3.4],.06,jc(0x6a5238,.06));sph('plain',0,.95,1.2,.55,jc(0xd8b840,.08),.6);for(const s of [-1,1])box('plank',s*.6,.65,1.5,.06,.4,2.2,jc(0x7a5a38,.06));
  for(let k=0;k<3;k++)tire(1.9,.12+k*.24,.6+rr(-.05,.05),TYR.R,TYR.t);barrel(-1.9,0,.7);crate(-1.9,0,2.2,.6,.2);});
 // kitchen garden behind a picket fence, front left
 fmPlankBed(-8.4,6.2,2.2,1.0,0,'leaf');fmPlankBed(-5.8,6.2,2.2,1.0,0,'bean');fmTyreBed(-10.0,6.1,.65,{cols:[0xc23a2a,0xd8a020]});
 fenceRun(-10.7,4.95,-4.4,4.95,1.0,{type:'pickets'});fenceRun(-10.7,4.95,-10.7,7.0,1.0,{type:'pickets'});fenceRun(-4.4,4.95,-4.4,7.0,1.0,{type:'pickets'});fenceRun(-10.7,7.0,-4.4,7.0,1.0,{type:'pickets'});
 // well with a tyre rim, rocking chairs, water butt at the back, yard junk
 fmWell(9.4,2.8,.62);fmRocker(2.7,3.7,PI,0x8a5a30);fmRocker(4.4,3.6,PI+.15,0x3f7fc0);fmRocker(-.3,3.9,PI-.1,0xc45a30);fmRocker(-2.6,3.8,PI,0x8a5a30);
 waterButt(-1.5,1.5,hz0-.6,.55,.9);barrel(6.6,0,5.2);barrel(7.1,0,4.7);tireStack(-3.0,6.6,3);lamp(-3.0,0,4.3,3.0,{arm:.3});
 W(-2.0,0,-6.2,0,()=>{crate(0,0,0,.6,.2);crate(.7,0,.1,.6,-.2);sacks(-.3,0,.7,5,.1);});
 // sockets
 sock('awning',sx,5.2,sz+r+.03,0,{w:2.2,d:1.4,drop:.4,h:1.9});
 beam('wood',[sx-1.0,6.6,sz+r+.3],[sx+1.0,6.6,sz+r+.3],.08,jc(0x5c4630,.06));for(const s of [-1,1])beam('wood',[sx+s*.9,6.5,sz+r+.3],[sx+s*.9,6.2,sz+r-.1],.05,jc(0x5c4630,.06));
 sock('banner',sx,6.6,sz+r+.34,0,{w:.9,h:2.4});
 beam('wood',[sx,sh+1.2,sz],[sx,10.4,sz],.05,jc(0x4a4038,.05),true,5);sock('flag',sx,10.4,sz,0,{w:1.2,h:.7});
 sock('emblem',hx1+.05,4.3,-1.5,PI/2,{w:1.0,h:1.0});sock('paint',hx1+.02,1.2,-1.5,PI/2,{w:2.5,h:1.8});
}

// ---------------------------------------------------------------- granary: four silos on a shared apron, catwalk, auger, loading bay
function fmScale(x,z,ry){W(x,0,z,ry||0,()=>{box('conc',0,0,0,3.4,.16,1.7,jc(0x8a8478,.05));box('iron',0,.16,0,3.0,.08,1.4,jc(0x5a5a56,.05));
 for(let k=0;k<6;k++)box('iron',-1.3+k*.5,.24,0,.25,.02,1.3,jc(k%2?0x2a2826:0xc0902a,.04));
 beam('iron',[1.9,.16,.4],[1.9,1.3,.4],.09,jc(0x4a4038,.05));cylH('iron',1.9,1.45,.4,.28,.16,jc(0xe8e0d0,.03),'z',12);cylH('glow',1.9,1.45,.49,.2,.02,jc(0xd8e8b0,.03),'z',12);beam('iron',[1.9,1.45,.5],[1.98,1.55,.5],.02,jc(0x2a2826,.03),true,3);
 box('iron',1.9,1.8,.4,.5,.18,.14,jc(0x3a3430,.05));});}
function fmGranary(o){
 const sil=[[-8,-5,4,12,0xc8ccc8,0xb8502e],[-.2,-5.5,3.2,9.6,0xd8b860,0x8a8a84],[6.2,-5.5,2.6,8.6,0x9fbfb5,0xc45a30],[-8.5,3.4,2.5,6.5,0xb8bcb8,0x9a4a2a]];
 box('conc',0,0,0,24,.14,18,jc(0x9a9688,.04));
 for(let k=0;k<5;k++)box('conc',-9.6+k*4.8,.14,-.2,.06,.02,17.6,jc(0x6a6660,.05));   // expansion joints
 for(const [x,z,r,h,c,rc] of sil){W(x,.14,z,0,()=>silo({r:r,h:h,col:c,roofCol:rc}));}
 // catwalk in front of the three tall silos at y 7.4, on steel legs, with rails and stubs to each silo door
 const cy=7.4,cz=-.4;
 box('plank',-.3,cy-.1,cz,19.6,.1,1.0,jc(0x6a5a44,.06));beam('iron',[-10,cy-.15,cz-.5],[9.5,cy-.15,cz-.5],.08,jc(0x4a4038,.05));beam('iron',[-10,cy-.15,cz+.5],[9.5,cy-.15,cz+.5],.08,jc(0x4a4038,.05));
 for(const x of [-9.4,-4.8,-.2,4.4,9.0]){for(const s of [-1,1])beam('iron',[x+s*.3,0,cz+.5],[x,cy-.15,cz+.5],.08,jc(0x5a5a56,.05));beam('iron',[x-.3,2.5,cz+.5],[x+.3,4.6,cz+.5],.04,jc(0x5a5a56,.05),true,4);beam('iron',[x+.3,2.5,cz+.5],[x-.3,4.6,cz+.5],.04,jc(0x5a5a56,.05),true,4);}
 for(const [a,b] of [[-10,9.6]]){beam('iron',[a,cy+1.0,cz+.5],[b,cy+1.0,cz+.5],.05,jc(0x8a8a86,.05));beam('iron',[a,cy+1.0,cz-.5],[b,cy+1.0,cz-.5],.05,jc(0x8a8a86,.05));beam('iron',[a,cy+.5,cz+.5],[b,cy+.5,cz+.5],.03,jc(0x8a8a86,.05));
  for(let x=a;x<=b+.01;x+=1.6){beam('iron',[x,cy,cz+.5],[x,cy+1.0,cz+.5],.04,jc(0x8a8a86,.05),true,4);beam('iron',[x,cy,cz-.5],[x,cy+1.0,cz-.5],.04,jc(0x8a8a86,.05),true,4);}}
 for(const [x,z,r] of sil.slice(0,3)){const zf=z+Math.sqrt(Math.max(0,r*r-.0))-.1;box('plank',x,cy-.1,(cz-.5+zf)/2,1.0,.1,zf-(cz-.5)+.0,jc(0x6a5a44,.06));
  W(x,0,z+r+.1,0,()=>{door(0,cy-.05,-.05,.9,1.8,{step:false,col:pick([0x8a3a2c,0x2f5f8f,0x4d6f3c])});});}
 // stub from catwalk to silo doors: made as boards reaching the wall face
 // ladders: catwalk end, silo C east side to its roof, silo D
 ladder(-10.2,0,cz+.1,cy+1.0,0);ladder(8.85,0,-5.5,8.9,PI/2);ladder(-8.5,.14,3.4+2.5+.02,6.6,0);
 for(const [x,z,r,h] of [[6.2,-5.5,2.6,8.6]])W(x+r*.0,0,z,0,()=>{});
 // silo details: ring bands are in the core; add windows/hatches, painted numbers as plates, patch panels
 for(const [x,z,r,h] of sil){for(let k=0;k<3;k++){const a=rr(.2,PI-.2);W(x+Math.cos(a)*(r+.03),0,z+Math.sin(a)*(r+.03),PI/2-a,()=>{box(pick(['sheet','corr']),0,rr(1,h*.6),0,rr(.8,1.3),rr(.6,1.1),.04,pick([P('rust'),P('paint'),P('galv')]),0,0,rr(-.05,.05));});}}
 // silo D: low door and a sheet lean-to along its front
 W(-8.5,.14,3.4+2.5,0,()=>{door(-.9,.3,.02,1.0,2.0,{step:false,col:0x2f5f8f});});
 fmLean(-5.9,3.4+1.8,4.4,2.4,3.6,2.5,{col:0xc99a2e,mat:'corr'});
 W(-9.4,0,6.4,0,()=>{crate(0,0,0,.7,.2);crate(.7,0,.1,.6,-.2);sacks(-.4,0,.8,5,.1);pallet(1.6,0,.2,1.2,1.0,.1);});
 // auger from a hopper on legs to silo D's roof
 const hx=-1.6,hz=6.2;for(const s of [-1,1])for(const q of [-1,1])beam('iron',[hx+s*.6,0,hz+q*.6],[hx+s*.45,1.3,hz+q*.45],.07,jc(0x6a5a44,.05));
 cyl('sheet',hx,1.3,hz,.4,1.0,jc(0x8a3a2c,.05),10,.95);box('iron',hx,2.3,hz,1.9,.08,1.9,jc(0x4a4038,.05));for(const s of [-1,1]){box('sheet',hx+s*.95,2.3,hz,.06,.35,1.9,jc(0x8a3a2c,.05));box('sheet',hx,2.3,hz+s*.95,1.9,.35,.06,jc(0x8a3a2c,.05));}
 sph('plain',hx,2.55,hz,.75,jc(0xd8b840,.08),.35);cone('plain',hx+1.9,0,hz+.8,.9,.7,jc(0xd8b840,.08),9);
 const a0=[hx-.3,.85,hz-.2],a1=[-5.8,6.9,4.15];beam('iron',a0,a1,.5,jc(0x8a8a86,.05),true,8);
 for(let k=1;k<8;k++){const t=k/8;const p=[a0[0]+(a1[0]-a0[0])*t,a0[1]+(a1[1]-a0[1])*t,a0[2]+(a1[2]-a0[2])*t];const q=[p[0],p[1],p[2]];cyl('iron',p[0],p[1]-.05,p[2],.29,.1,jc(0x4a4038,.05),8);}
 for(const t of [.35,.7]){const p=[a0[0]+(a1[0]-a0[0])*t,a0[1]+(a1[1]-a0[1])*t,a0[2]+(a1[2]-a0[2])*t];for(const s of [-1,1])beam('iron',[p[0]+s*.7,0,p[2]+.3],[p[0],p[1]-.2,p[2]],.07,jc(0x5a5a56,.05));}
 box('iron',hx+.55,.2,hz-.3,.8,.6,.7,jc(0x2f5f8f,.05));cyl('iron',hx+.55,.8,hz-.3,.1,.5,jc(0x3a3430,.05),6);   // motor
 // loading bay: open-fronted container, dock deck with steps, sacks stacked, scale, lean-to at its end
 const bx=6.6,bz=5.6;W(bx,.14,bz,0,()=>container({len:CT.L20,open:'front',col:o.v===1?0x3fa08e:0xc45a30}));
 deck(bx,.9,bz+1.22+.75,6.0,1.5,{rail:['l','r'],posts:false});for(const s of [-1,1])for(const x of [-2.8,0,2.8])beam('wood',[bx+x,.14,bz+2.3+s*.6],[bx+x,.78,bz+2.3+s*.6],.12,jc(0x5c4630,.06));
 stairs(bx-1,.14,bz+4.6,bx-1,.9,bz+3.5,1.3,{rail:true});
 sacks(bx-2.2,.28,bz+.2,6,.05);sacks(bx-1.2,.28,bz-.6,6,-.05);sacks(bx+.5,.28,bz-.5,6,.05);sacks(bx+2.0,.28,bz+.3,5,0);sacks(bx-1.8,1.0,bz+2.9,6,.1);sacks(bx+1.5,1.0,bz+2.8,6,-.1);
 for(let k=0;k<3;k++)for(let j=0;j<3-k;j++)box('cloth',bx-2.2+j*.55+k*.27,.28+.95+k*.32,bz-.55,.5,.3,.34,jc(pick([0xd8c8a0,0xc8b888,0xb8a878]),.05),0,0,0);
 fmScale(-.4,6.6,0);
 W(bx+CT.L20/2+.1,0,bz,PI/2,()=>{fmLean(0,0,2.8,2.6,3.0,2.4,{col:0x3fa08e,mat:'sheet'});box('plank',0,.1,1.3,2.8,.05,2.6,jc(0x6a5a44,.08));barrel(-.8,.14,1.3);barrel(0,.14,1.9);crate(.9,.14,1.5,.6,.3);});
 // yard: pallets, barrels, tyres, lamp
 pallet(-4.0,.14,7.4,1.2,1.0,.1);pallet(-4.0,.26,7.4,1.2,1.0,-.15);tireStack(-5.4,7.8,3);barrel(2.6,.14,3.6);barrel(3.0,.14,4.0);lamp(-2.9,.14,8.4,3.6);lamp(11.0,.14,1.6,3.6,{arm:-.35});
 // sockets: emblem + paint on the tall silo, banner on a pole at the apron corner, flag on the middle silo, awning over the bay
 sock('emblem',-8,5.6,-.97,0,{w:1.6,h:1.6});sock('paint',-6.0,4.0,-1.9,.55,{w:2.4,h:3});
 beam('wood',[10.9,.14,7.2],[10.9,4.8,7.2],.1,jc(0x5c4630,.06),true,6);beam('wood',[10.9,4.7,7.2],[10.9,4.7,8.4],.07,jc(0x5c4630,.06));sock('banner',10.9,4.7,8.44,0,{w:.9,h:2.4});
 beam('wood',[-.2,10.9+.3,-5.5],[-.2,12.6,-5.5],.05,jc(0x4a4038,.05),true,5);sock('flag',-.2,12.6,-5.5,0,{w:1.4,h:.8});
 sock('awning',bx,2.75+.14,bz+1.28,0,{w:5.6,d:1.6,drop:.5,h:2.3});
}
defBuilding({key:'granary',name:'Granary',seed:5030,tags:{type:['farm'],size:'large',core:'grain silos',materials:['galvanised sheet','shipping container','steel','plank']},w:24,d:18,h:14.8,build:fmGranary});
