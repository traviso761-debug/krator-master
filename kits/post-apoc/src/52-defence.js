// prefix: df
// ---------------------------------------------------------------- defence and justice: watchtower, prisoner cages
// ENGINE WORKAROUND: plane4/roofP take e2 from the 4th point (shifts sheets by half their width); pass the same-side point twice.
function dfRoof(mk,x0,x1,zLow,yLow,zHigh,yHigh,th,col){plane4(mk,[x0,yLow,zLow],[x1,yLow,zLow],[x0,yHigh,zHigh],[x0,yHigh,zHigh],th||.06,col);}
const dfIron=[0x5a4a3c,0x6a4a34,0x4a4038,0x7a5238];   // rusty steel browns
function dfRust(){return jc(pick(dfIron),.07);}
// ---------------- watchtower
// leg x at height y for a tower whose legs run from +-b (ground) to +-t (y = H)
function dfSpread(y,b,t,H){return b+(t-b)*y/H;}
function dfTower(o){
 const b=3.6,t=1.6,H=14,S=y=>dfSpread(y,b,t,H),lc=jc(0x7a4a34,.05),bc=jc(0x6a5a4c,.05);
 // four legs, each a pair of pipe and angle
 for(const sx of [-1,1])for(const sz of [-1,1]){beam('iron',[sx*b,0,sz*b],[sx*t,H,sz*t],.2,lc);beam('iron',[sx*(b-.16),0,sz*(b-.16)],[sx*(t-.05),H,sz*(t-.05)],.09,jc(0x8a6a4a,.05),true,6);
  box('conc',sx*b,0,sz*b,.7,.3,.7,jc(0x8a8478,.05));}
 // panels: 4 levels of X-bracing on all four faces, ring beams at each level
 const lv=[0,3.5,7,10.5,14];
 for(let i=0;i<4;i++){const y0=lv[i],y1=lv[i+1],s0=S(y0),s1=S(y1);
  for(const f of [0,1,2,3]){const sw=(f%2)?1:0;const P0=(u,y,s)=>f===0?[u*s,y,s]:f===1?[s,y,u*s]:f===2?[u*s,y,-s]:[-s,y,u*s];
   beam('iron',P0(-1,y1,s1),P0(1,y1,s1),.07,bc);
   beam('iron',P0(-1,y0,s0),P0(1,y1,s1),.05,jc(0x6a4a34,.06));beam('iron',P0(1,y0,s0),P0(-1,y1,s1),.05,jc(0x6a4a34,.06));
   if(i%2===0)beam('iron',P0(-1,(y0+y1)/2,(s0+s1)/2),P0(1,(y0+y1)/2,(s0+s1)/2),.045,bc);}}
 for(let i=0;i<4;i++){const y=lv[i]+.05;for(const [a,c] of [[[-1,1],[1,1]],[[1,1],[1,-1]],[[1,-1],[-1,-1]],[[-1,-1],[-1,1]]])beam('iron',[a[0]*S(y),y,a[1]*S(y)],[c[0]*S(y),y,c[1]*S(y)],.09,bc);}
 // zig-zag stair up the front (+z) face: four steel flights. Each flight starts at the previous landing's inner edge and ends on the next landing,
 // whose centre sits on a leg bay (x = +-S(y)); the last flight ends on an apron platform level with the deck, beside the gate in the deck rail.
 const zf=y=>S(y)+.75,tc=jc(0x6a5a4c,.05);
 const hr=(a,c,off)=>{const n=Math.max(2,Math.round(Math.hypot(c[0]-a[0],c[2]-a[2])/1.3));beam('iron',[a[0],a[1]+1.0,a[2]+off],[c[0],c[1]+1.0,c[2]+off],.035,bc,true,6);
  for(let i=0;i<=n;i++){const u=i/n,px=a[0]+(c[0]-a[0])*u,py=a[1]+(c[1]-a[1])*u,pz=a[2]+(c[2]-a[2])*u;beam('iron',[px,py,pz+off],[px,py+1.0,pz+off],.035,bc,true,5);}};
 const landing=(cx,ly,cz,wd,dp)=>{box('iron',cx,ly-.1,cz,wd,.1,dp,tc);for(let k=0;k<=Math.round(dp/.3);k++)box('iron',cx,ly-.006,cz-dp/2+k*.3,wd,.012,.05,jc(0x3a3430,.04));};
 for(let k=0;k<4;k++){const y0=k*3.5,y1=y0+3.5,dir=k%2?-1:1;
  const sxs=k===0?-3.3:-dir*(S(y0)-.3);const exs=k<3?dir*(S(y1)-.3):-1.9;
  const zs=zf(y0),ze=k<3?zf(y1):3.2;
  stairs(sxs,y0,zs,exs,y1,ze,.85,{steel:true,rail:false});
  hr([sxs,y0,zs],[exs,y1,ze],.5);if(k<3)hr([sxs,y0,zs],[exs,y1,ze],-.5);
  if(k<3){const lx=dir*(S(y1)+.3),lz=zf(y1);landing(lx,y1,lz,1.2,1.8);
   // landing struts to the leg bay and rail on its outer edge and front
   for(const q of [-.8,.8])beam('iron',[lx,y1-.1,lz+q],[dir*S(y1),y1-1.3,S(y1)+q*.2],.06,bc);beam('iron',[lx,y1-.1,lz-.8],[dir*S(y1),y1-.1,S(y1)],.06,bc);
   beam('iron',[lx+dir*.6,y1,lz-.9],[lx+dir*.6,y1+1.0,lz-.9],.035,bc,true,5);beam('iron',[lx+dir*.6,y1,lz+.9],[lx+dir*.6,y1+1.0,lz+.9],.035,bc,true,5);beam('iron',[lx+dir*.6,y1+1.0,lz-.9],[lx+dir*.6,y1+1.0,lz+.9],.035,bc,true,5);
   beam('iron',[lx-dir*.6,y1+1.0,lz+.9],[lx+dir*.6,y1+1.0,lz+.9],.035,bc,true,5);beam('iron',[lx-dir*.6,y1,lz+.9],[lx-dir*.6,y1+1.0,lz+.9],.035,bc,true,5);}
  else{ // apron platform flush with the deck (top at y1 = 14), open to the deck through the rail gate
   landing(-2.4,y1,3.2,1.4,1.0);for(const sx of [-1,1])beam('iron',[-2.4+sx*.6,y1-.1,3.6],[-2.4+sx*.3,y1-1.4,S(12.6)],.05,bc);beam('iron',[-3.1,y1,2.7],[-3.1,y1+1.0,2.7],.035,bc,true,5);beam('iron',[-3.1,y1,3.7],[-3.1,y1+1.0,3.7],.035,bc,true,5);
   beam('iron',[-3.1,y1+1.0,2.7],[-3.1,y1+1.0,3.7],.035,bc,true,5);beam('iron',[-3.1,y1+.5,2.7],[-3.1,y1+.5,3.7],.03,bc,true,5);beam('iron',[-3.1,y1+1.0,3.7],[-1.7,y1+1.0,3.7],.035,bc,true,5);beam('iron',[-1.7,y1,3.7],[-1.7,y1+1.0,3.7],.035,bc,true,5);
   // gate posts in the deck rail and an open gate leaf
   for(const gx of [-2.7,-1.4])beam('iron',[gx,y1,2.7],[gx,y1+1.15,2.7],.06,bc,true,6);beam('iron',[-1.4,y1+.1,2.7],[-1.4,y1+1.0,3.5],.03,bc,true,4);beam('iron',[-1.4,y1+1.0,2.7],[-1.4,y1+1.0,3.5],.035,bc,true,4);}}
 // lower flight rail gate: base fence with a gate gap where the stair meets the ground
 const fz=S(0)+1.3,fx=4.5;fenceRun(-fx,-fz+1.3,fx,-fz+1.3,1.9,{barbed:true});fenceRun(-fx,-fz+1.3,-fx,fz,1.9,{barbed:true});fenceRun(fx,-fz+1.3,fx,fz,1.9,{barbed:true});
 fenceRun(-fx,fz,-3.4,fz,1.9,{barbed:true});fenceRun(-1.2,fz,fx,fz,1.9,{barbed:true});
 for(const x of [-3.4,-1.2])beam('wood',[x,0,fz],[x,2.2,fz],.1,jc(0x5c4630,.06),true,6);box('sheet',-2.3,1.0,fz-.02,.05,1.0,.05,jc(0xc45a30,.05));
 sph('plain',3.0,.15,fz-.4,.3,jc(0x4a3a24,.08),.5);cyl('sheet',-3.9,0,fz-.4,.2,.4,jc(0x8a8a86,.06),8);
 // ---- the cab and its rail deck at y = 14
 const y=H;
 box('plank',0,y-.14,0,5.4,.14,5.4,jc(0x6a5238,.06));for(const s of [-1,1]){beam('iron',[s*2.2,y-.14,-2.7],[s*2.2,y-.14,2.7],.12,bc);beam('iron',[-2.7,y-.14,s*2.2],[2.7,y-.14,s*2.2],.1,bc);}
 for(const sx of [-1,1])for(const sz of [-1,1])beam('iron',[sx*2.5,y-.1,sz*2.5],[sx*1.5,y-1.5,sz*1.5],.07,bc);
 const rl=1.05,rc=jc(0x7a4a34,.05);const corners=[[-2.7,2.7],[2.7,2.7],[2.7,-2.7],[-2.7,-2.7]];
 const rail=(a,c,skip)=>{const n=Math.max(1,Math.round(Math.hypot(c[0]-a[0],c[1]-a[1])/1.1));for(let k=0;k<=n;k++){const u=k/n;beam('iron',[a[0]+(c[0]-a[0])*u,y,a[1]+(c[1]-a[1])*u],[a[0]+(c[0]-a[0])*u,y+rl,a[1]+(c[1]-a[1])*u],.05,rc,true,5);}
  beam('iron',[a[0],y+rl,a[1]],[c[0],y+rl,c[1]],.06,rc);beam('iron',[a[0],y+.55,a[1]],[c[0],y+.55,c[1]],.04,rc);};
 rail(corners[1],corners[2]);rail(corners[2],corners[3]);rail(corners[3],corners[0]);rail([2.7,2.7],[-1.4,2.7]);
 // sheet panels hung on the rail (patched): a few tin plates
 box('corr',1.3,y,-2.72,1.4,.8,.04,jc(0xc45a30,.06));box('sheet',-1.3,y,-2.72,1.3,.7,.04,jc(0x3fa08e,.06));
 // cab: 3.4 x 3.2 x 2.5, patched plank and sheet
 const cw=3.4,cd=3.2,cx=0,cz=-.35,ch=2.5;
 box('plank',cx,y,cz,cw,1.2,cd,jc(0xa8845a,.06));box('corr',cx,y+1.2,cz,cw+.06,ch-1.2,cd+.06,jc(0x3f80a0,.05));
 for(const [px,pz,pw,ph,rz] of [[-1.0,cz+cd/2+.03,1.2,.8,.05],[1.1,cz+cd/2+.03,.9,.6,-.04]])box('sheet',px,y+.4,pz,pw,ph,.03,pick([P('rust'),P('paint'),P('galv')]),0,0,rz);
 for(let k=0;k<3;k++)box('sheet',cx+rr(-1.4,1.4),y+rr(.2,.9),cz-cd/2-.03,rr(.6,1.1),rr(.4,.8),.03,pick([P('rust'),P('paint'),P('galv')]),0,0,rr(-.06,.06));
 const fz2=cz+cd/2;
 win(-.75,y+1.25,fz2,1.0,.9,{shutters:false});win(.35,y+1.25,fz2,.0001,.0001,{});
 door(1.05,y,fz2,.8,1.85,{step:false,col:0x2f5f8f});
 W(cx+cw/2,0,cz,PI/2,()=>{win(-.7,y+1.25,0,.9,.9);win(.7,y+1.25,0,.9,.9,{lit:o.v===1});});
 W(cx-cw/2,0,cz,-PI/2,()=>{win(-.7,y+1.25,0,.9,.9);win(.7,y+1.25,0,.9,.9);});
 W(0,0,cz-cd/2,PI,()=>{win(-.8,y+1.25,0,1.1,.9,{bars:true});win(.8,y+1.25,0,1.1,.9);});
 // corner posts and a shingle of roof sheet
 for(const sx of [-1,1])for(const sz of [-1,1])beam('wood',[cx+sx*(cw/2),y,cz+sz*(cd/2)],[cx+sx*(cw/2),y+ch+.05,cz+sz*(cd/2)],.11,jc(0x5c4630,.06));
 dfRoof('corr',cx-cw/2-.4,cx+cw/2+.4,cz+cd/2+.55,y+ch+.2,cz-cd/2-.4,y+ch+.75,.07,jc(0xc8ccc8,.05));
 box('iron',cx,y+ch+.72,cz-cd/2-.4,cw+.8,.08,.1,bc);
 // searchlight on the roof front-left: post, drum, glowing lens
 beam('iron',[-1.1,y+ch+.45,cz+.4],[-1.1,y+ch+1.15,cz+.4],.09,bc,true,6);cylH('iron',-1.1,y+ch+1.35,cz+.4,.3,.65,jc(0x4a4038,.05),'z',10);cylH('glow',-1.1,y+ch+1.35,cz+.75,.24,.04,jc(0xfff0c0,.03),'z',10);
 beam('iron',[-1.1,y+ch+1.0,cz+.4],[-1.1,y+ch+1.5,cz+.15],.04,bc,true,4);
 // alarm bell in a small gallows frame on the deck's rear-right corner
 const bx=2.25,bz=-2.2;beam('wood',[bx,y,bz-.3],[bx,y+2.9,bz-.3],.1,jc(0x5c4630,.06));beam('wood',[bx,y,bz+.3],[bx,y+2.9,bz+.3],.1,jc(0x5c4630,.06));beam('wood',[bx,y+2.85,bz-.35],[bx,y+2.85,bz+.35],.09,jc(0x5c4630,.06));
 cone('iron',bx,y+2.0,bz,.3,.55,jc(0xb08a3a,.06),10);sph('iron',bx,y+2.0,bz,.06,jc(0x3a3430,.05),1);beam('plain',[bx,y+2.85,bz],[bx,y+2.55,bz],.015,jc(0x6a5a44,.05),true,3);beam('plain',[bx,y+2.0,bz],[bx-.5,y+.7,bz+.7],.012,jc(0x6a5a44,.05),true,3);
 // radio mast with guy wires and cross arms, from the roof rear-left
 const mx=-1.3,mz=cz-.9,mtop=20.2;beam('iron',[mx,y+ch+.5,mz],[mx,mtop,mz],.07,jc(0x8a8a86,.05),true,6);
 for(const [ym,w] of [[y+ch+2.2,.9],[y+ch+3.2,.7],[y+ch+3.9,.5]])beam('iron',[mx-w,ym,mz],[mx+w,ym,mz],.03,jc(0x8a8a86,.05),true,4);
 for(const [gx,gz] of [[-2.6,-2.6],[2.4,-2.7],[-2.5,1.6]])beam('plain',[mx,y+ch+2.7,mz],[gx,y+.05,gz],.01,jc(0x3a3430,.05),true,3);
 // rope and pulley on a boom off the cab's east side: rope hangs to a bucket at the foot of the tower
 const rx=4.05;beam('wood',[2.3,y+.1,.7],[2.3,y+2.4,.7],.1,jc(0x5c4630,.06));beam('wood',[1.6,y+2.35,.7],[rx+.3,y+2.35,.7],.1,jc(0x5c4630,.06));beam('wood',[2.3,y+1.6,.7],[rx-.2,y+2.3,.7],.06,jc(0x5c4630,.06));
 cylH('iron',rx,y+2.1,.7,.24,.1,jc(0x5a5a56,.05),'z',12);beam('plain',[rx,y+2.1-.24,.7],[rx,.5,.7],.02,jc(0x9a8a64,.05),true,3);beam('plain',[rx-.25,y+2.1,.7],[rx-.25,y+.5,.7],.02,jc(0x9a8a64,.05),true,3);
 cyl('sheet',rx,0,.7,.22,.36,jc(0x8a8a86,.06),8);beam('plain',[rx,.5,.7],[rx,.36,.7],.02,jc(0x6a5a44,.05),true,3);
 sph('plain',rx-.25,y+.45,.7,.16,jc(0xa08a58,.05),1);
 // sockets: banner from a pole at the deck's front-right corner, emblem on the east wall, flag on the mast, awning over the front window
 beam('wood',[2.55,y,2.55],[2.55,y+3.7,2.55],.09,jc(0x5c4630,.06),true,6);beam('wood',[2.55,y+3.5,2.55],[1.5,y+3.5,2.55],.06,jc(0x5c4630,.06));
 sock('banner',1.95,y+3.5,2.6,0,{w:.9,h:2.2});
 sock('emblem',cx+cw/2+.04,y+.7,cz,PI/2,{w:.9,h:.9});
 sock('flag',mx,mtop,mz,0,{w:1.3,h:.7});
 sock('awning',-.75,y+2.2,fz2+.04,0,{w:1.5,d:1.1,drop:.35,h:1.9});
 // stack of a few junk items at the tower foot: tyres, barrels
 tireStack(-5.4,fz-1.8,3);barrel(5.3,0,-2.0);barrel(5.6,0,-1.4);lamp(5.2,0,fz-.5,3.4,{arm:-.35});
}
defBuilding({key:'watchtower',name:'Watchtower',seed:5210,tags:{type:['infrastructure','civic'],size:'large',core:'steel lattice tower',materials:['steel pipe','plank','sheet metal','rope']},w:10,d:10,h:20.4,build:dfTower});

// ---------------- prisoner cages
const dfBarC=0x5a4a40;
function dfBar(a,b,w){beam('iron',a,b,w||.03,jc(pick(dfIron),.06),true,4);}
function dfPadlock(x,y,z){box('iron',x,y,z,.13,.14,.06,jc(0xb8983a,.05));beam('iron',[x-.04,y+.14,z],[x-.04,y+.22,z],.02,jc(0x8a8a86,.05),true,4);beam('iron',[x+.04,y+.14,z],[x+.04,y+.22,z],.02,jc(0x8a8a86,.05),true,4);beam('iron',[x-.04,y+.22,z],[x+.04,y+.22,z],.02,jc(0x8a8a86,.05),true,4);}
// welded-rebar box cage, base at y, w x d x h, door on the front (+z). o:{stilt:h, wheel:true}
function dfCage(x,z,w,d,h,ry,o){o=o||{};W(x,0,z,ry||0,()=>{const y=o.stilt||(o.wheel?.5:.12);
 // floor of planks on skids or stilts
 box('plank',0,y-.12,0,w+.1,.12,d+.1,jc(0x6a5238,.08));
 if(o.stilt){for(const sx of [-1,1])for(const sz of [-1,1])beam('wood',[sx*(w/2-.1),0,sz*(d/2-.1)],[sx*(w/2-.1),y-.12,sz*(d/2-.1)],.13,jc(0x5c4630,.06));
  for(const sz of [-1,1])beam('wood',[-w/2,y*.45,sz*(d/2-.1)],[w/2,y*.7,sz*(d/2-.1)],.06,jc(0x5c4630,.06));}
 if(o.wheel){for(const sx of [-1,1])for(const sz of [-1,1]){tire(sx*(w/2-.15),.36,sz*(d/2+.14),.36,.1,undefined,0,PI/2,0);}
  beam('iron',[-w/2+.2,.36,-d/2-.1],[-w/2+.2,.36,d/2+.1],.06,jc(0x4a4038,.05),true,5);beam('iron',[w/2-.2,.36,-d/2-.1],[w/2-.2,.36,d/2+.1],.06,jc(0x4a4038,.05),true,5);
  beam('wood',[w/2,y-.2,0],[w/2+1.5,.3,0],.09,jc(0x5c4630,.06));beam('wood',[w/2,y-.2,-.3],[w/2+1.5,.3,-.05],.05,jc(0x5c4630,.06));}
 const nx=Math.round(w/.17),nz=Math.round(d/.17);
 for(let k=0;k<=nx;k++){const xx=-w/2+k*w/nx;dfBar([xx,y,-d/2],[xx,y+h,-d/2]);if(Math.abs(xx)>.5)dfBar([xx,y,d/2],[xx,y+h,d/2]);}
 for(let k=1;k<nz;k++){const zz=-d/2+k*d/nz;dfBar([-w/2,y,zz],[-w/2,y+h,zz]);dfBar([w/2,y,zz],[w/2,y+h,zz]);}
 // barrel hoops: horizontal rings at three heights, thicker corner posts
 for(const f of [.02,.5,.98]){const yy=y+h*f;for(const [a,c] of [[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]])beam('iron',[a[0]*w/2,yy,a[1]*d/2],[c[0]*w/2,yy,c[1]*d/2],.045,jc(0x3a3430,.05),true,5);}
 for(const sx of [-1,1])for(const sz of [-1,1])beam('iron',[sx*w/2,y,sz*d/2],[sx*w/2,y+h,sz*d/2],.06,jc(0x3a3430,.05),true,5);
 // roof: rebar grid + a lid sheet on one half
 for(let k=0;k<=3;k++){const xx=-w/2+k*w/3;dfBar([xx,y+h,-d/2],[xx,y+h,d/2],.03);}for(let k=0;k<=3;k++){const zz=-d/2+k*d/3;dfBar([-w/2,y+h,zz],[w/2,y+h,zz],.03);}
 box('sheet',-w/4,y+h+.02,0,w/2,.03,d,jc(pick([0x8a3a2c,0x5a6a68,0x9a8a4a]),.06));
 // door frame in the front bars, hinge, padlocked hasp
 const dw=.9,dh=h-.3;box('iron',0,y,d/2+.02,dw,.05,.05,jc(0x3a3430,.05));for(const sx of [-1,1])beam('iron',[sx*dw/2,y,d/2+.03],[sx*dw/2,y+dh,d/2+.03],.05,jc(0x3a3430,.05),true,5);
 beam('iron',[-dw/2,y+dh,d/2+.03],[dw/2,y+dh,d/2+.03],.05,jc(0x3a3430,.05),true,5);beam('iron',[-dw/2,y+.05,d/2+.03],[dw/2,y+dh,d/2+.03],.03,jc(0x3a3430,.05),true,4);
 for(let k=0;k<=4;k++)dfBar([-dw/2+k*dw/4,y,d/2],[-dw/2+k*dw/4,y+dh,d/2]);
 dfPadlock(dw/2-.02,y+h*.42,d/2+.07);for(const yy of [.3,h-.5])box('iron',-dw/2,y+yy,d/2+.05,.16,.06,.05,jc(0x3a3430,.05));
 // straw and a bucket inside
 sph('plain',-w/4,y+.12,-d/4,.4,jc(0xb89a48,.08),.4);sph('plain',w/5,y+.1,-d/5,.3,jc(0xa8883e,.08),.4);cyl('sheet',w/3,y,d/4,.16,.24,jc(0x8a8a86,.06),8);});}
// drum cage: barrel hoops and bars in a ring, a hoop lid, door gap
function dfDrum(x,z,r,h,ry){W(x,0,z,ry||0,()=>{const y=.1,n=22;box('plank',0,0,0,r*2.1,.1,r*2.1,jc(0x6a5238,.08));cyl('iron',0,0,0,r+.05,.1,jc(0x3a3430,.05),16);
 for(let k=0;k<n;k++){const a=k/n*TAU;if(Math.abs(Math.sin(a-PI/2))<.11&&Math.cos(a-PI/2)>.5)continue;dfBar([Math.cos(a)*r,y,Math.sin(a)*r],[Math.cos(a)*r,y+h,Math.sin(a)*r]);}
 for(const f of [0,.33,.66,1]){const yy=y+h*f;for(let k=0;k<20;k++){const a=k/20*TAU,c=(k+1)/20*TAU;beam('iron',[Math.cos(a)*r,yy,Math.sin(a)*r],[Math.cos(c)*r,yy,Math.sin(c)*r],.045,jc(0x3a3430,.05),true,4);}}
 for(let k=0;k<6;k++){const a=k*PI/3;beam('iron',[0,y+h,0],[Math.cos(a)*r,y+h-.1,Math.sin(a)*r],.03,jc(0x4a4038,.05),true,4);}
 beam('iron',[0,y+h,0],[0,y+h+.3,0],.04,jc(0x4a4038,.05),true,4);sph('iron',0,y+h+.3,0,.07,jc(0x4a4038,.05),1);
 // door bars (hinged wider), padlock; chain to a stake
 dfPadlock(.15,y+h*.45,r+.05);for(const s of [-1,1])beam('iron',[s*.45,y,r*.9],[s*.45,y+h-.2,r*.9],.05,jc(0x3a3430,.05),true,5);beam('iron',[-.45,y+h-.2,r*.9],[.45,y+h-.2,r*.9],.05,jc(0x3a3430,.05),true,5);
 for(let k=0;k<4;k++)dfBar([-.3+k*.2,y,r*.9],[-.3+k*.2,y+h-.2,r*.9]);
 sph('plain',-.2,y+.1,-.3,.4,jc(0xb89a48,.08),.4);});}
// hanging gibbet cage: a man-shaped cage of bands
function dfGibbet(x,y,z){W(x,y,z,0,()=>{const c=jc(0x3a3430,.05);
 for(const [yy,r] of [[0,.14],[.35,.3],[.75,.34],[1.15,.26],[1.5,.2],[1.8,.13]]){for(let k=0;k<10;k++){const a=k/10*TAU,b=(k+1)/10*TAU;beam('iron',[Math.cos(a)*r,yy,Math.sin(a)*r*.7],[Math.cos(b)*r,yy,Math.sin(b)*r*.7],.04,c,true,4);}}
 const rs=[.14,.3,.34,.26,.2,.13],ys=[0,.35,.75,1.15,1.5,1.8];for(let k=0;k<8;k++){const a=k/8*TAU;for(let i=0;i<5;i++)beam('iron',[Math.cos(a)*rs[i],ys[i],Math.sin(a)*rs[i]*.7],[Math.cos(a)*rs[i+1],ys[i+1],Math.sin(a)*rs[i+1]*.7],.03,c,true,4);}
 sph('plain',0,1.05,0,.16,jc(0x4a3a2c,.08),1.5);   // a dark shape within
 beam('iron',[0,1.8,0],[0,2.3,0],.04,c,true,4);sph('iron',0,2.32,0,.09,c,1);});}
function dfStocks(x,z,ry){W(x,0,z,ry||0,()=>{const c=jc(0x5c4630,.06);for(const s of [-1,1]){beam('wood',[s*.9,0,0],[s*.9,1.5,0],.15,c);}
 box('plank',0,.65,-.06,1.9,.14,.1,jc(0x6a5238,.06));box('plank',0,.95,.06,1.9,.14,.1,jc(0x6a5238,.06));   // two halves, hole gaps between
 for(const s of [-.5,.05,.55])box('plank',s,.79,0,.22,.16,.12,jc(0x2a2018,.05));
 beam('wood',[-.9,1.5,0],[.9,1.5,0],.1,c);for(const s of [-1,1])box('iron',s*.9,.85,.09,.06,.3,.04,jc(0x3a3430,.05));
 box('plank',0,0,.9,1.6,.16,.6,jc(0x6a5238,.08));   // bench for the prisoner
 box('iron',.15,.5,.5,.14,.12,.06,jc(0xb8983a,.05));});}
function dfWhipPost(x,z){beam('wood',[x,0,z],[x,2.6,z],.18,jc(0x5c4630,.06),true,8);cyl('conc',x,0,z,.4,.14,jc(0x8a8478,.05),10);beam('wood',[x-.7,2.15,z],[x+.7,2.15,z],.1,jc(0x5c4630,.06));
 for(const s of [-1,1]){cyl('iron',x+s*.55,1.85,z,.09,.09,jc(0x4a4038,.05),8);beam('iron',[x+s*.55,1.85,z],[x+s*.5,1.3,z+.1],.02,jc(0x3a3430,.05),true,3);}
 for(let k=0;k<5;k++)beam('iron',[x,1.15,z+.15],[x+rr(-.2,.2),.55+k*.02,z+.2],.02,jc(0x3a3430,.05),true,3);
 cyl('plain',x+.5,0,z+.6,.7,.02,jc(0x4a2c24,.05),10);}
function dfMud(x,z,r,w){cyl('plain',x,.02,z,r,.03,jc(pick([0x4a3624,0x3e2c1e,0x52402a]),.06),12);if(w)cyl('water',x+r*.1,.05,z,r*.55,.01,jc(0x4e4634,.04),10);}
function dfChain(a,b,n){for(let k=0;k<n;k++){const t=(k+.5)/n;const p=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-Math.sin(t*PI)*.12,a[2]+(b[2]-a[2])*t];box('iron',p[0],p[1],p[2],.06,.06,.06,jc(0x4a4038,.05),k%2?.7:0,0,0);}
 beam('iron',a,b,.015,jc(0x4a4038,.05),true,3);}
function dfCells(o){
 const cx=-3.6,cz=-6.5,L=CT.L40;
 W(cx,0,cz,0,()=>container({len:L,col:0x6a7a78,doorEnd:false}));
 const fz=cz+CT.W/2;
 // barred slit windows: dark slots cut over the wall with bars across; a door with a wicket
 for(const k of [-2.3,.6,3.2,5.0]){box('iron',cx+k,1.75,fz+.005,.9,.28,.03,jc(0x0a0808,.03));for(let j=0;j<5;j++)box('iron',cx+k-.36+j*.18,1.72,fz+.04,.03,.34,.03,jc(0x3a3430,.05));
  box('iron',cx+k,2.06,fz+.03,1.0,.05,.06,jc(0x4a4038,.05));box('iron',cx+k,1.68,fz+.03,1.0,.05,.06,jc(0x4a4038,.05));}
 // cell door: dark steel frame proud of the face, leaf centred inside it, wicket, hinges, hasp and padlock
 {const dx=cx-4.5,fw=1.1,fh=2.15,y0=.16,fc=jc(0x2a2624,.04);
  for(const sx of [-1,1])box('iron',dx+sx*(fw/2-.05),y0,fz+.02,.1,fh,.1,fc);box('iron',dx,y0+fh-.1,fz+.02,fw,.1,.1,fc);box('iron',dx,y0,fz+.02,fw,.06,.1,fc);
  box('iron',dx,y0+.06,fz+.03,fw-.2,fh-.16,.06,jc(0x5a4a40,.05));
  for(const yy of [.6,1.3,1.9])box('iron',dx,yy,fz+.07,fw-.2,.06,.04,jc(0x3a3430,.05));
  box('iron',dx,1.55,fz+.07,.38,.22,.05,jc(0x0a0808,.03));for(let j=0;j<3;j++)box('iron',dx-.1+j*.1,1.53,fz+.1,.02,.26,.02,jc(0x3a3430,.05));
  for(const yy of [.4,1.85])box('iron',dx-fw/2+.1,yy,fz+.1,.14,.08,.05,jc(0x3a3430,.05));
  box('iron',dx+.3,.95,fz+.1,.28,.1,.04,jc(0x3a3430,.05));dfPadlock(dx+.38,.78,fz+.14);}
 // roof furnishings: barbed wire coils and a spotlight
 for(let k=0;k<3;k++)box('iron',cx-4+k*3.5,CT.H+.05,cz+.3,.03,.5,.03,jc(0x3a3430,.05),0,0,.4);
 beam('iron',[cx-L/2+.3,CT.H,fz-.2],[cx+L/2-.3,CT.H,fz-.2],.02,jc(0x3a3430,.05),true,3);
 lamp(cx+5.6,0,fz+.9,3.4,{arm:-.35});
 // ventilation stack, drainage pipe and a bucket line
 stovepipe(cx+3,CT.H,cz-.5,.9);
 sock('emblem',cx+.3,1.0,fz+.04,0,{w:.9,h:.9});sock('paint',cx+L/2+.02,1.3,cz,PI/2,{w:2.0,h:1.9});}
function dfGuard(o){
 // ground shack (plank) with a lookout platform on stilts beside it
 const gx=7.2,gz=5.6;
 box('plank',gx,0,gz,3.0,.14,2.4,jc(0x6a5238,.08));for(const [px,pz,pw,pd] of [[gx,gz-1.1,3.0,.1],[gx-1.45,gz,.1,2.4],[gx+1.45,gz,.1,2.4]])box('plank',px,.14,pz,pw,2.2,pd,jc(0xa87a4a,.07));
 wallOpen('plank',gx,.14,gz+1.16,3.0,2.2,.1,[{x0:gx-.3,x1:gx+.6,y0:.14,y1:2.0},{x0:gx-1.2,x1:gx-.6,y0:1.0,y1:1.8}],jc(0xa87a4a,.07));
 door(gx+.15,.14,gz+1.18,.9,1.85,{step:true,col:0x8a3a2c});win(gx-.9,1.0,gz+1.19,.6,.7,{bars:true});
 dfRoof('corr',gx-1.75,gx+1.75,gz+1.45,2.35,gz-1.3,2.85,.07,jc(0x9a8a70,.06));
 for(const sx of [-1,1])beam('wood',[gx+sx*1.6,0,gz+1.2],[gx+sx*1.6,2.4,gz+1.2],.1,jc(0x5c4630,.06));
 // lookout: four stilts, platform, rail, little roof, ladder, lamp
 const lx=10.1,lz=4.8,ly=3.3;
 for(const sx of [-1,1])for(const sz of [-1,1])beam('wood',[lx+sx*.9,0,lz+sz*.9],[lx+sx*.9,ly+1.9,lz+sz*.9],.13,jc(0x5c4630,.06));
 for(const sz of [-1,1]){beam('wood',[lx-.9,.4,lz+sz*.9],[lx+.9,ly*.7,lz+sz*.9],.06,jc(0x5c4630,.06));beam('wood',[lx+.9,.4,lz+sz*.9],[lx-.9,ly*.7,lz+sz*.9],.06,jc(0x5c4630,.06));}
 deck(lx,ly,lz,2.4,2.4,{posts:false,rail:['b','r','l','f']});
 for(const [px,pz,pw,pd] of [[lx,lz-1.15,2.3,.04]])box('corr',px,ly,pz,pw,1.1,pd,pick([P('rust'),P('paint')]));   // shield of sheet on the back rail
 dfRoof('corr',lx-1.5,lx+1.5,lz+1.4,ly+1.95,lz-1.4,ly+2.35,.07,jc(0xc45a30,.06));
 ladder(lx-.3,0,lz+1.2,ly,0);lamp(lx+1.1,ly,lz+.9,1.6,{arm:.3});
 box('iron',lx-.5,ly,lz-.2,.7,.4,.4,jc(0x3a3430,.05));   // ammo crate / searchlight base
 // sandbags at the shack door
 for(let k=0;k<5;k++)sph('cloth',gx-2.4+k*.4,.18,gz+1.9,.24,jc(pick([0xa89a70,0x8a7c58]),.06),.7);
 sph('cloth',gx-2.2,.5,gz+1.9,.24,jc(0x8a7c58,.06),.7);
 sock('banner',gx+1.7,3.1,gz+1.28,0,{w:.9,h:2.0});
 beam('wood',[gx+1.7,2.5,gz+1.35],[gx+1.7,3.15,gz+1.35],.08,jc(0x5c4630,.06));beam('wood',[gx+1.7,3.1,gz+1.35],[gx+1.7,3.1,gz+1.28],.05,jc(0x5c4630,.06));
 sock('awning',gx+.15,2.35,gz+1.2,0,{w:1.5,d:1.0,drop:.3,h:2.0});}
function dfCages(o){
 // mud floor and puddles, then the fence line
 box('earth',0,0,0,24,.03,18,jc(0x6a5238,.06));
 for(const [x,z,r,w] of [[-6,3,1.8,1],[2.5,2.8,1.4,0],[-2.5,-1.6,1.1,1],[9,0.6,1.5,0],[-9.5,-4,1.3,0],[4,-3.2,.9,1]])dfMud(x,z,r,w);
 const fx=11.6,fz=8.6,fh=2.0;const fo={barbed:true};
 fenceRun(-fx,-fz,fx,-fz,fh,fo);fenceRun(-fx,-fz,-fx,fz,fh,fo);fenceRun(fx,-fz,fx,fz,fh,fo);fenceRun(-fx,fz,-2.0,fz,fh,fo);fenceRun(2.0,fz,fx,fz,fh,fo);
 for(const sx of [-1,1]){beam('wood',[sx*2.0,0,fz],[sx*2.0,fh+.9,fz],.16,jc(0x5c4630,.06),true,6);box('iron',sx*2.0,fh+.6,fz+.1,.14,.3,.06,jc(0x8a3a2c,.05));}
 beam('wood',[-2.0,fh+.85,fz],[2.0,fh+.85,fz],.12,jc(0x5c4630,.06));
 // the gate: two leaves of frame and chain link, one swung open, a chain and padlock
 W(-2.0,0,fz,0,()=>{box('iron',0,0,0,.06,fh,.06,jc(0x4a4038,.05));box('iron',0,0,0,2.0,.06,.06,jc(0x4a4038,.05));box('iron',0,fh,0,2.0,.06,.06,jc(0x4a4038,.05));box('iron',2.0,0,0,.06,fh,.06,jc(0x4a4038,.05));quad('chain',1.0,fh/2,0,2.0,fh,jc(0xb4b8b8,.05));beam('iron',[0,.05,0],[2.0,fh,0],.03,jc(0x4a4038,.05),true,4);});
 W(2.0,0,fz,-1.1,()=>{box('iron',0,0,0,.06,fh,.06,jc(0x4a4038,.05));box('iron',-2.0,0,0,2.0,.06,.06,jc(0x4a4038,.05));box('iron',-2.0,fh,0,2.0,.06,.06,jc(0x4a4038,.05));box('iron',-2.0,0,0,.06,fh,.06,jc(0x4a4038,.05));quad('chain',-1.0,fh/2,0,2.0,fh,jc(0xb4b8b8,.05));});
 dfChain([-2.0,1.2,fz+.05],[-1.0,1.1,fz+.05],6);dfPadlock(-1.05,1.0,fz+.1);
 // cell block against the back fence, cages along the right, stocks and post on the left
 dfCells(o);
 dfCage(5.2,-6.3,2.4,2.4,2.2,0.1,{});dfDrum(9.6,-6.0,1.0,2.2,.4);
 dfCage(6.0,-1.2,2.3,2.3,2.1,-.2,{stilt:1.3});ladder(6.9,0,-.05,1.3,0);
 dfCage(9.6,-1.6,2.2,1.8,1.8,PI-.15,{wheel:true});
 dfCage(3.7,-3.2,1.3,1.1,1.0,.3,{});
 // gallows-arm crane: post, arm, brace, hanging gibbet
 const px=-1.2,pz=-1.8;box('conc',px,0,pz,.9,.25,.9,jc(0x8a8478,.05));beam('wood',[px,0,pz],[px,5.3,pz],.24,jc(0x5c4630,.06),true,8);
 beam('wood',[px,5.1,pz],[px+3.2,5.1,pz],.2,jc(0x5c4630,.06));beam('wood',[px,3.4,pz],[px+2.0,5.0,pz],.12,jc(0x5c4630,.06));beam('wood',[px,3.4+.3,pz],[px-1.2,0,pz],.08,jc(0x5c4630,.06));
 dfChain([px+2.9,5.0,pz],[px+2.9,4.2,pz],4);dfGibbet(px+2.9,2.2,pz);
 sph('iron',px+2.9,5.05,pz,.1,jc(0x3a3430,.05),1);
 // left side: stocks, whipping post, chained bench
 dfStocks(-8.0,-1.2,.3);dfWhipPost(-6.2,.8);
 dfChain([-9.4,.3,-1.4],[-8.8,.15,-.7],6);
 // guard shack and lookout
 dfGuard(o);
 // lamps, buckets, a barrel fire and yard clutter
 lamp(-.4,0,4.4,3.6,{arm:.35});lamp(-10.4,0,-7.6,3.2,{arm:.35});
 for(const [x,z] of [[-10.4,5.6],[-10.0,6.2],[-4.2,5.3],[3.6,-3.8]]){cyl('sheet',x,0,z,.2,.32,jc(pick([0x8a8a86,0x8a3a2c,0x4d6f3c]),.06),8);beam('iron',[x-.2,.32,z],[x+.2,.32,z],.015,jc(0x3a3430,.05),true,3);}
 barrel(-9.6,0,3.9);barrel(-9.2,0,4.5);barrel(-10.2,0,4.7);junkPile(-9.6,-6.9,1.3,8);
 dfChain([11.5,1.9,-3],[11.5,1.5,-2.2],5);dfChain([-11.5,1.9,2],[-11.5,1.5,2.8],5);
 for(let k=0;k<3;k++)tire(-5.2+k*.3,.12,6.6+k*.05,TYR.R,TYR.t,undefined,rng()*TAU);
 // sign posts: skull and bones on a stake by the gate
 beam('wood',[3.2,0,7.4],[3.2,2.2,7.4],.09,jc(0x5c4630,.06),true,6);sph('plain',3.2,2.3,7.4,.15,jc(0xe0d8c0,.04),1.1);box('plank',3.2,1.7,7.4,.5,.05,.05,jc(0xe0d8c0,.04),0,0,.2);
}
defBuilding({key:'cages',name:'Prisoner cages',seed:5220,tags:{type:['civic'],size:'large',core:'shipping container (cell block)',materials:['rebar','barrel hoops','chain-link','plank','chain']},w:24,d:18,h:8.4,budget:120000,build:dfCages});
