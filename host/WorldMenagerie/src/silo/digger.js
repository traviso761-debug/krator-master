// Silo 18: under the hall. The mines (four drifts out through the wall into the rock, timbered, with rails and ore
// carts, worked at their far ends) and, off one of them behind a bulkhead nobody opens, a chamber where an old tunnel
// boring machine stands at the end of the tunnel it bored. The machine is drawn after real tunnel boring machines
// (a double-shield hard-rock machine), not after any film's: a cutter head about nine metres across with disc
// cutters on its spokes and buckets round its rim; the shield behind it with its thrust rams, gripper pads, main
// bearing and drive motors; a belt conveyor carrying the spoil back; and the trailing gear on rails behind it
// (the segment erector, the operator's cab, the hydraulic power packs, the transformer, the ventilation fan and
// its duct, cable reels), rusted and dusty, lamps strung along it. The tunnel behind it is lined with concrete
// segments, with rails, a duct and lamps; it runs toward the neighbouring silo, Silo 17, and stops short of it.
// In the field view it shows as a line under the plain: solid as far as it is bored, dashed beyond.
//
// tick(t, dt, wake) drives it: wake is null, or the event's clock: the lights come on along the gear, the conveyor
// starts, the head turns, dust comes off the face, and the machine creeps forward a few metres, shaking the ground.
import {RO,yL,NL} from './levels.js';

const D=Math.PI/180,TAU=Math.PI*2;
export const MINE_ANGLES=[40,130,220,310].map(a=>a*D);
// the mines lie well under the plant: a cavern cut under the silo's footing MINE_DEPTH below the hall's floor, HUB_H
// tall, the drifts going out from its edge, and a shaft with a cage up into the hall at SHAFT (angle, radius)
export const MINE_DEPTH=40,HUB_H=11,SHAFT=[115*D,36];
// the grave of the machine that bored the silo's shaft: a void sealed under the plant, GRAVE metres below the hall's floor
// (its top is the underside of the concrete cap poured over it, its bottom the face where the machine stopped)
export const GRAVE={top:-4.5,bot:-24};
export function buildDigger(THREE,K,matFor,clip,out){
  const {G}=K,y0=yL(NL)-MINE_DEPTH,k=K.kit(),km=K.kit(),kh=K.kit();
  const R=(()=>{let s=1717;return()=>((s=(s*16807)%2147483647)/2147483647);})();
  const res={group:new THREE.Group()};
  const RUST=['#6a4a32','#7a5236','#5e4636','#80583a'],DUST=['#8a7e6c','#7e7464','#948670'],STEEL='#5a5e60',YEL='#a88a2a',ROCK=['#4e463e','#564c42','#463e38','#5c5046'];
  const pick=L=>L[(R()*L.length)|0];

  // ======== the mines: drifts out from the hall, timbered, with rails ========
  const DR0=RO-1,DR1=118;
  const W=(m,r,w)=>[Math.cos(m)*r-Math.sin(m)*w,Math.sin(m)*r+Math.cos(m)*w];   // along the drift at angle m: r out, w across
  const db=(kk,key,col,m,r,w,h,L,H,Wd,o={})=>{const [x,z]=W(m,r,w);kk.add(key,G.box,col,x,y0+h,z,Object.assign({ry:-m,sx:L,sy:H,sz:Wd},o));};
  MINE_ANGLES.forEach((m,t)=>{const dig=t===2,end=dig?75:DR1;
    // the rock: floor, roof and walls, rough, in pieces
    for(let r=DR0;r<end;r+=3){const L=Math.min(3,end-r),rm=r+L/2;db(k,'base',pick(ROCK),m,rm,0,-0.2,L,0.4,4.8);db(k,'base',pick(ROCK),m,rm,0,4.0+R()*0.3,L,0.5,5.0);
      for(const sd of [-1,1])db(k,'base',pick(ROCK),m,rm,sd*(2.35+R()*0.25),2.0,L,4.4,0.4);}
    // timber sets every 1.6 m (steel arches in the newer, deeper half), lagging behind some
    for(let r=DR0+1.5;r<end-0.5;r+=1.6){const steel=r>80,c=steel?pick(['#4a4440','#5a4a3a']):pick(['#6a5236','#5e4a32','#76603e']);
      for(const sd of [-1,1])db(k,'base',c,m,r,sd*1.95,1.75,0.24,3.5,0.24,{rx:sd*0.05});db(k,'base',c,m,r,0,3.62,0.26,0.26,4.3);
      if(!steel&&R()<0.5)for(const sd of [-1,1])db(k,'base','#5a4630',m,r+0.8,sd*2.1,1.8,1.5,3.0,0.05);}
    // rails on sleepers down the middle, a puddle here and there, a lamp hung from every fifth set
    for(let r=DR0;r<end-1;r+=0.8)db(k,'base','#3e3428',m,r,0,0.06,0.18,0.1,1.2);
    for(const sd of [-1,1])db(k,'base','#5a5650',m,(DR0+end)/2,sd*0.32,0.16,end-DR0,0.08,0.06);
    for(let r=DR0+6;r<end-2;r+=8){const [x,z]=W(m,r,0);k.add('lamp',G.box,'#ffc060',x,y0+3.25,z,{sx:0.25,sy:0.3,sz:0.25});k.pipe('base','#222',x,y0+3.5,z,x,y0+3.4,z,0.02,G.cyl);
      if(R()<0.6){const [px,pz]=W(m,r+2,(R()-0.5)*2);k.add('base',G.disc,'#2a3238',px,y0+0.02,pz,{sx:0.6+R()*0.6,sy:0.01,sz:0.4+R()*0.4});}}
    // a cable and a water pipe along one wall on brackets
    {const [ax,az]=W(m,DR0,-1.85),[bx,bz]=W(m,end-1,-1.85);k.pipe('base','#1e1e1c',ax,y0+3.0,az,bx,y0+3.0,bz,0.04,G.cyl);k.pipe('base','#4a5a6a',ax,y0+0.5,az,bx,y0+0.5,bz,0.07,G.cyl);}
    if(dig)return;
    // ore carts, one a train, others alone; a broken one tipped by the wall
    for(let c=0;c<5;c++){const r=DR0+10+c*(t===0?2.2:13)+R()*2;if(r>end-6)break;db(k,'base',pick(RUST),m,r,0,0.75,1.6,0.9,1.1);db(k,'base','#2a2420',m,r,0,1.18,1.45,0.06,0.95);
      if(R()<0.7)db(k,'base',pick(['#5a4e40','#6a5a46','#7a6a50']),m,r,0,1.25,1.3,0.25,0.85);for(const e of [-0.5,0.5])for(const sd of [-1,1])db(k,'base','#2a2826',m,r+e,sd*0.32,0.2,0.36,0.36,0.08);}
    // the working face: a drill on its stand, broken ore heaped, a cart under the heap
    db(k,'base',pick(ROCK),m,end+0.3,0,2.0,0.6,4.4,4.6);for(let q=0;q<9;q++){const [x,z]=W(m,end-0.8-R()*1.8,(R()-0.5)*3.2);k.add('base',G.sph,pick(['#5a5048','#6a5a4a','#4a4038']),x,y0+0.2,z,{sx:0.4+R()*0.4,sy:0.25+R()*0.3,sz:0.4+R()*0.4});}
    {const [x,z]=W(m,end-2.4,1.2);k.add('base',G.cyl,'#3a3c3e',x,y0+0.9,z,{sx:0.06,sy:1.8,sz:0.06});const [x2,z2]=W(m,end-1.2,1.2);k.pipe('base',YEL,x,y0+1.3,z,x2,y0+1.4,z2,0.08,G.cyl);k.pipe('base','#888',x2,y0+1.4,z2,x2+Math.cos(m)*0.9,y0+1.45,z2+Math.sin(m)*0.9,0.025,G.cyl);}
  });

  // ======== the mines' hall under the silo, and the shaft up to the plant ========
  {const HR=RO+1.5,HH=HUB_H,yH=yL(NL);
    k.add('base',G.disc,'#3e3832',0,y0-0.25,0,{sx:HR+0.5,sy:0.5,sz:HR+0.5});                  // the floor, worn smooth
    for(let q=0;q<30;q++){const a=R()*TAU,r=6+R()*(HR-8);k.add('base',G.disc,pick(['#363029','#433c34','#2e3236']),Math.cos(a)*r,y0+0.01,Math.sin(a)*r,{sx:1+R()*3,sy:0.01,sz:0.8+R()*2.5,ry:R()*3});}
    {const [SA,SR]=SHAFT,h=2.3/SR,yr=y0+HH+0.7;                                                 // the roof, open over the shaft
      k.add('base',K.ring(0.01,SR-2.3,0.7,64),'#3a342e',0,yr,0);k.add('base',K.ring(SR+2.3,HR+0.5,0.7,64),'#3a342e',0,yr,0);
      k.add('base',K.ring(SR-2.3,SR+2.3,0.7,64,SA+h,TAU-2*h),'#3a342e',0,yr,0);}
    k.add('base',K.ring(RO-3,RO+0.6,0.9,64),'#77736a',0,y0+HH,0);                             // the silo's footing, bared in the roof
    for(let q=0;q<40;q++){const a=R()*TAU,r=R()*(HR-4),hh=0.5+R()*0.6,[SA,SR]=SHAFT;if(Math.hypot(Math.cos(a)*r-Math.cos(SA)*SR,Math.sin(a)*r-Math.sin(SA)*SR)<5)continue;k.add('base',G.box,pick(ROCK),Math.cos(a)*r,y0+HH-hh/2+0.15,Math.sin(a)*r,{ry:R()*3,sx:1.5+R()*3,sy:hh,sz:1.2+R()*2.5});}
    // the wall: rough rock all round, the drifts' mouths left open, each mouth framed in heavy timber
    for(let i=0;i<64;i++){const a=(i+0.5)/64*TAU;if(MINE_ANGLES.some(m=>Math.abs(Math.atan2(Math.sin(a-m),Math.cos(a-m)))<3.2/HR))continue;
      for(let r0=0;r0<HH;r0+=3.7)k.add('base',G.box,pick(ROCK),Math.cos(a)*(HR+0.3+R()*0.4),y0+r0+1.85,Math.sin(a)*(HR+0.3+R()*0.4),{ry:-a+Math.PI/2+(R()-0.5)*0.2,sx:TAU*HR/64*1.15,sy:3.9,sz:0.9+R()*0.6});}
    for(const m of MINE_ANGLES){db(k,'base','#5e4a32',m,HR-0.2,0,4.3,0.5,0.5,5.2);for(const sd of [-1,1])db(k,'base','#5e4a32',m,HR-0.2,sd*2.45,2.1,0.5,4.3,0.4);
      db(k,'base','#2e2c28',m,HR-0.2,0,4.9+2.9,0.6,HH-4.5-0.5,5.6);
      // a painted number over each mouth, and the rails running in to the loop
      db(k,'base','#c8a03a',m,HR-0.48,0,5.2,0.04,0.7,1.2);
      for(const sd of [-1,1])db(k,'base','#5a5650',m,(40+HR)/2,sd*0.32,0.16,HR-40,0.08,0.06);}
    // pillars of rock left standing to hold the roof, banded where the miners have marked them
    for(let i=0;i<6;i++){const a=(15+60*i)*D,r=26;k.add('base',G.cyl6,pick(ROCK),Math.cos(a)*r,y0+HH/2,Math.sin(a)*r,{ry:R()*3,sx:2.4+R()*0.6,sy:HH,sz:2.2+R()*0.6});
      k.add('base',G.cyl6,'#b89a3a',Math.cos(a)*r,y0+1.2,Math.sin(a)*r,{sx:2.62,sy:0.25,sz:2.62});}
    // a loop of track round the hall, joining the drifts, on sleepers; carts standing on it, a loco at the shaft
    for(const rr of [39.68,40.32])k.add('base',K.ring(rr-0.04,rr+0.04,0.09,128),'#5a5650',0,y0+0.21,0);
    for(let i=0;i<180;i++){const a=i/180*TAU;k.add('base',G.box,'#3e3428',Math.cos(a)*40,y0+0.06,Math.sin(a)*40,{ry:-a,sx:1.25,sy:0.1,sz:0.2});}
    for(let i=0;i<9;i++){const a=(160+i*2.9)*D+(i>4?60*D:0),c=Math.cos(a),s=Math.sin(a),f=i===0;
      k.add('base',G.box,f?'#6a5a2a':pick(RUST),c*40,y0+(f?1.0:0.75),s*40,{ry:-a+Math.PI/2,sx:f?2.4:1.6,sy:f?1.5:0.9,sz:1.1});
      if(!f&&R()<0.7)k.add('base',G.box,pick(['#5a4e40','#6a5a46','#4a4038']),c*40,y0+1.25,s*40,{ry:-a+Math.PI/2,sx:1.3,sy:0.25,sz:0.85});}
    // lamps hung from the roof, and a few work lamps on stands where the drifts meet the hall
    for(let i=0;i<14;i++){const a=(i+0.3)/14*TAU,r=i%2?18:40;k.add('lamp',G.box,'#ffc060',Math.cos(a)*r,y0+HH-1.4,Math.sin(a)*r,{sx:0.35,sy:0.3,sz:0.35});
      k.pipe('base','#222',Math.cos(a)*r,y0+HH-1.2,Math.sin(a)*r,Math.cos(a)*r,y0+HH,Math.sin(a)*r,0.02,G.cyl);}
    // the shaft: a steel-framed square, rock-walled above the roof, a cage on two ropes, a ladderway down one side,
    // a headframe over the hatch in the hall's floor with its sheave wheel and the winch beside it
    {const [SA,SR]=SHAFT,c=Math.cos(SA),s=Math.sin(SA),X=(u,v)=>[c*(SR+u)-s*v,s*(SR+u)+c*v],hw=2.0,top=yH,Hs=top-y0;
      const sb=(col,u,v,y,sx,sy,sz,key='base')=>{const [x,z]=X(u,v);k.add(key,G.box,col,x,y,z,{ry:-SA,sx,sy,sz});};
      for(const u of [-hw,hw])for(const v of [-hw,hw])sb('#4a4c4e',u,v,y0+Hs/2,0.24,Hs,0.24);
      for(let y=y0+2.5;y<top;y+=2.5){sb('#3e4042',-hw,0,y,0.18,0.18,2*hw);sb('#3e4042',hw,0,y,0.18,0.18,2*hw);sb('#3e4042',0,-hw,y,2*hw,0.18,0.18);sb('#3e4042',0,hw,y,2*hw,0.18,0.18);}
      for(let y=y0+HH+0.7;y<top-0.4;y+=3.6){for(const sd of [-1,1]){sb(pick(ROCK),sd*(hw+0.5),0,y+1.8,0.7,3.7,2*hw+1.8);sb(pick(ROCK),0,sd*(hw+0.5),y+1.8,2*hw+1.8,3.7,0.7);}}
      for(let y=y0+0.3;y<top;y+=0.32)sb('#5a5c5e',-hw+0.15,hw-0.55,y,0.04,0.04,0.55);
      for(const v of [hw-0.3,hw-0.8])sb('#4a4c4e',-hw+0.15,v,y0+Hs/2,0.06,Hs,0.06);
      // the cage, part way up, and its counterweight going the other way
      const yc=y0+17;sb('#5a5e60',0,-0.4,yc,2.2,0.12,2.2);sb('#5a5e60',0,-0.4,yc+2.6,2.2,0.12,2.2);
      for(const u of [-1.05,1.05])for(const v of [-1.45,0.65])sb('#a88a2a',u,v,yc+1.3,0.08,2.6,0.08);
      for(const v of [-1.45,0.65])for(let q=0;q<6;q++)sb('#6a6c6e',0,v,yc+0.3+q*0.45,2.1,0.03,0.03);
      sb('#ffc060',0,-0.4,yc+2.45,0.3,0.12,0.3,'lamp');
      sb('#3a3c3e',1.4,1.3,y0+28,0.7,2.2,0.7);
      for(const v of [-0.7,-0.1]){const [x,z]=X(0,v);k.pipe('base','#1e1e1c',x,yc+2.6,z,x,top+6.8,z,0.03,G.cyl);}
      {const [x,z]=X(1.4,1.3);k.pipe('base','#1e1e1c',x,y0+29.1,z,x,top+6.8,z,0.03,G.cyl);}
      // the headframe: four legs, braced, a platform and the sheave; a yellow rail and a gate round the hatch
      for(const u of [-hw-0.3,hw+0.3])for(const v of [-hw-0.3,hw+0.3]){const [x,z]=X(u,v);k.add('base',G.box,'#4a4440',x,top+3.6,z,{ry:-SA,sx:0.3,sy:7.2,sz:0.3});}
      for(const sd of [-1,1]){const [ax,az]=X(sd*(hw+0.3),-hw-0.3),[bx,bz]=X(sd*(hw+0.3),hw+0.3);k.pipe('base','#4a4440',ax,top+0.5,az,bx,top+6.5,bz,0.07,G.cyl);k.pipe('base','#4a4440',ax,top+6.5,az,bx,top+0.5,bz,0.07,G.cyl);}
      sb('#3e3a36',0,0,top+7.2,2*hw+1,0.25,2*hw+1);
      {const [x,z]=X(0,-0.4);k.add('base',K.ring(0.9,1.15,0.18,24),'#5a4a3a',x,top+8.0,z,{rx:Math.PI/2,ry:-SA});k.add('base',G.box,'#3a3c3e',x,top+7.6,z,{ry:-SA,sx:0.2,sy:0.8,sz:0.2});}
      for(const u of [-hw-0.7,hw+0.7])sb('#c8a03a',u,0,top+1.05,0.07,0.07,2*hw+1.4);for(const v of [-hw-0.7,hw+0.7])sb('#c8a03a',0,v,top+1.05,2*hw+1.4,0.07,0.07);
      for(const u of [-hw-0.7,hw+0.7])for(const v of [-hw-0.7,0,hw+0.7])sb('#c8a03a',u,v,top+0.55,0.07,1.05,0.07);
      sb('#2a2826',0,0,top+0.04,2*hw+0.6,0.06,2*hw+0.6);
      // the winch: a drum on a frame, a motor and its box, and the man's stool beside it
      {const [x,z]=X(-hw-4.5,-1);k.add('base',G.disc,'#4a3e30',x,top+1.3,z,{rz:Math.PI/2,ry:-SA+Math.PI/2,sx:1.0,sy:2.2,sz:1.0});
        sb('#3e4042',-hw-4.5,-1,top+0.4,1.8,0.8,3.0);sb('#4a5a50',-hw-4.5,1.4,top+0.9,1.2,1.2,1.0);sb('#a88a2a',-hw-3.0,-2.6,top+0.75,0.5,1.5,0.4);
        sb('#3a3632',-hw-3.0,-1.8,top+0.25,0.5,0.5,0.5);}}}

  // ======== the digger's chamber and tunnel, in its own frame: s along the tunnel, w across, h above the floor ========
  const md=MINE_ANGLES[2],P0=[Math.cos(md)*84,Math.sin(md)*84];
  const S17=(out.silos||[]).find(s=>s.n===17)||{x:-420,z:0};
  const th=Math.atan2(S17.z-P0[1],S17.x-P0[0]),ux=Math.cos(th),uz=Math.sin(th),vx=-uz,vz=ux;
  const AX=3.0,RB=4.65,RLi=4.2,FACE=131,LIN1=110,LEN=Math.hypot(S17.x-P0[0],S17.z-P0[1])-RO-4;
  const F=(s,w)=>[P0[0]+ux*s+vx*w,P0[1]+uz*s+vz*w];
  const tb=(kk,key,col,s,w,h,L,H,Wd,o={})=>{const [x,z]=F(s,w);kk.add(key,G.box,col,x,y0+h,z,Object.assign({ry:-th,sx:L,sy:H,sz:Wd},o));};
  const tc=(kk,key,col,s0,s1,w,h,r,geo)=>{const [x,z]=F((s0+s1)/2,w);kk.add(key,geo||G.disc,col,x,y0+h,z,{rz:Math.PI/2,ry:-th,sx:r,sy:s1-s0,sz:r});};
  const tv=(kk,key,col,s,w,h0,h1,r,geo)=>{const [x,z]=F(s,w);kk.add(key,geo||G.cyl,col,x,y0+(h0+h1)/2,z,{sx:r,sy:h1-h0,sz:r});};
  const tp=(kk,key,col,s0,w0,h0,s1,w1,h1,r)=>{const [ax,az]=F(s0,w0),[bx,bz]=F(s1,w1);kk.pipe(key,col,ax,y0+h0,az,bx,y0+h1,bz,r,G.cyl);};
  // a tube round the tunnel's axis from s0 to s1, radii r0..r1, an arc from a0 (0 = the crown) for len
  const tr=(kk,key,col,s0,s1,r0,r1,seg=24,a0=0,len=TAU)=>{const [x,z]=F(s0,0);kk.add(key,K.ring(r0,r1,s1-s0,seg,a0,len),col,x,y0+AX,z,{rz:Math.PI/2,ry:-th});};
  res.frame={P0,th,AX,FACE,F,y0};

  // -- the bulkhead across the drift, a door in it, warnings painted on it in more than one hand --
  {const rb=72;db(k,'base','#4a4a46',md,rb,0,2.0,0.3,4.2,4.6);db(k,'base','#3a3632',md,rb-0.18,0.9,1.0,0.06,2.0,0.9);db(k,'base','#8a2a1a',md,rb-0.2,0,3.2,0.02,0.3,3.6);
    for(let q=0;q<6;q++)db(k,'base','#2a2826',md,rb-0.17,-2+q*0.8,R()*3.6+0.2,0.02,0.08,0.6,{rx:(R()-0.5)*0.4});
    for(let q=0;q<12;q++)db(k,'base','#6a6a64',md,rb-0.17,-2.1+(q%2)*4.2,0.3+(q>>1)*0.65,0.03,0.08,0.08);
    db(k,'base',YEL,md,rb-0.21,-1.2,2.5,0.02,0.5,0.8,{rx:0.785});db(k,'base',YEL,md,rb-0.21,-1.2,2.5,0.02,0.5,0.8,{rx:-0.785});}
  // -- the chamber where the drift meets the tunnel: rough, roughly round, the tunnel's mouth on one side --
  {const RC=10;for(let i=0;i<28;i++){const a=i/28*TAU,ad=Math.atan2(Math.sin(md+Math.PI-th),Math.cos(md+Math.PI-th));
      const da=Math.abs(Math.atan2(Math.sin(a-ad),Math.cos(a-ad))),dt=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));if(da<0.3||dt<0.48)continue;
      const s=Math.cos(a)*RC,w=Math.sin(a)*RC;for(let q=0;q<3;q++)tb(k,'base',pick(ROCK),s,w,1.6+q*3.2,2.6+R()*0.6,3.4,1.0+R()*0.8,{ry:-th-a+Math.PI/2+(R()-0.5)*0.3});}
    tb(k,'base','#3e3832',0,0,-0.2,2*RC+2,0.4,2*RC+2);tb(k,'base','#3a342e',0,0,10.5,2*RC+2,0.6,2*RC+2);
    // the tunnel's mouth: a portal ring of the first segments, the end of the lining
    tr(k,'base','#6a6a64',8.2,8.6,RLi-0.1,RB+0.6,32);
    // spoil heaped where the belt ends, a skip under the conveyor's end, old segments stacked, a crane beam
    for(let q=0;q<14;q++)tb(k,'base',pick(['#5a5048','#625446','#4a4238']),-2+R()*5,2+R()*4,0.3,1+R()*1.4,0.4+R()*0.9,1+R()*1.4,{ry:-th+R()*3});
    tb(k,'base',pick(RUST),3,1.2,0.7,2.4,1.4,1.6);
    for(let q=0;q<6;q++)tc(k,'base','#7a7a72',-4.5+(q%2)*0.2,-3.0,-5,0.25+q*0.32,1.0,G.cyl6);
    tb(k,'base',STEEL,0,0,9.6,0.4,0.5,16);for(const sd of [-1,1])tb(k,'base',STEEL,0,sd*7.8,4.8,0.4,9.6,0.4);
    for(let q=0;q<4;q++){const [x,z]=F(-6+q*4,(q%2?4:-4));k.add('lamp',G.box,'#ffc878',x,y0+9.0,z,{sx:0.3,sy:0.3,sz:0.3});}}
  // -- the lined tunnel: rings of segments, each ring six pieces with the joints staggered ring to ring --
  for(let s=8.6,i=0;s<LIN1;s+=1.5,i++){const off=(i%2)*TAU/12;
    for(let j=0;j<6;j++){const c=R()<0.08?'#5e6058':R()<0.2?'#76766c':'#6c6c64';tr(k,'base',c,s,s+1.48,RLi,RB-0.1,6,off+j*TAU/6+0.004,TAU/6-0.008);}
    // the bolt pockets on the ring joint, and water that has run down the lining from some joints
    if(i%2===0)for(let j=0;j<6;j++){const a=off+j*TAU/6+TAU/12,cw=Math.sin(a),ch=Math.cos(a);if(ch<-0.7)continue;tb(k,'base','#3e3e3a',s+1.49,cw*(RLi-0.02),AX+ch*(RLi-0.02),0.06,0.18,0.12);}
    if(R()<0.25){const sd=R()<0.5?-1:1;tb(k,'base','#4a5250',s+0.2+R(),sd*(RLi-0.03),AX-0.6,0.15+R()*0.3,2.6,0.02,{rx:sd*0.6});}}
  // the invert filled to a flat bed; the trailing gear's wide rails and the narrow track for the muck cars, on sleepers
  tb(k,'base','#4e4a44',(8.6+FACE)/2,0,-0.25,FACE-8.6,0.5,5.9);
  for(let s=9;s<FACE-6;s+=0.9)tb(k,'base','#3a322a',s,0,0.05,0.2,0.1,1.4);
  for(const w of [-0.45,0.45,-2.5,2.5])tb(k,'base','#5c5852',(9+FACE-7)/2,w,0.17,FACE-16,0.1,0.07);
  // services along the walls: the water and air mains low on one side, the high-tension cable on hangers on the
  // other, the ventilation duct at the crown, lamps every six metres (most dead; the machine's own come on with it)
  {const lw=-2.7,lh=1.3,rw=2.85,rh=3.6;tp(k,'base','#3a5a6a',9,lw,lh,FACE-10,lw,lh,0.1);tp(k,'base','#7a6a3a',9,lw-0.05,lh+0.35,FACE-10,lw-0.05,lh+0.35,0.07);
    tp(k,'base','#1c1c1a',9,rw,rh,FACE-10,rw,rh,0.06);tp(k,'base','#2a2a26',9,rw+0.12,rh-0.25,FACE-10,rw+0.12,rh-0.25,0.05);
    for(let s=12;s<FACE-10;s+=3){tb(k,'base','#3a3836',s,rw+0.25,rh,0.08,0.5,0.3);tb(k,'base','#3a3836',s,lw-0.2,lh+0.2,0.08,0.7,0.25);}
    tc(k,'base','#7a6c48',9,92,0,AX+3.25,0.55,G.cyl);for(let s=11;s<92;s+=2.5){tb(k,'base','#3a3836',s,0,AX+3.85,0.06,0.5,0.06);tc(k,'base','#4a4234',s,s+0.08,0,AX+3.25,0.6,G.cyl);}
    for(let s=13;s<FACE-8;s+=6){const on=((s/6)|0)%4===0;tb(k,on?'lamp':'dlamp',on?'#ffcf8a':'#ffe0a8',s,-3.15,AX+2.4,0.5,0.14,0.14,{rx:0.6});}}
  // the unlined stretch ahead, around the shield and the head: bare rock, rough
  tr(k,'base','#4a423a',LIN1,FACE,RB,RB+0.6,20);
  for(let q=0;q<70;q++){const s=LIN1+R()*(FACE-LIN1),a=R()*TAU;if(Math.cos(a)<-0.6)continue;tb(k,'base',pick(ROCK),s,Math.sin(a)*(RB-0.1),AX+Math.cos(a)*(RB-0.1),0.5+R()*1.2,0.3,0.6+R(),{rx:-a});}
  // the face: rock, ringed with the grooves the cutters cut, broken where the buckets bit
  tc(k,'base','#544a40',FACE,FACE+0.6,0,AX,RB+0.3,G.disc);
  for(let r=0.7;r<RB;r+=0.55){const [x,z]=F(FACE-0.02,0);k.add('base',K.ring(r,r+0.06,0.03,32),'#2a2420',x,y0+AX,z,{rz:Math.PI/2,ry:-th});}
  for(let q=0;q<20;q++){const a=R()*TAU,r=R()*RB;tb(k,'base',pick(ROCK),FACE-0.1-R()*0.3,Math.sin(a)*r,AX+Math.cos(a)*r,0.3+R()*0.4,0.3+R()*0.5,0.3+R()*0.5,{rx:R()*3});}
  // the muck that fell off the belt, and spoil under the head
  for(let q=0;q<26;q++)tb(k,'base',pick(['#5a5048','#625446','#4a4238']),FACE-9+R()*8.5,(R()-0.5)*4,0.15,0.4+R()*0.6,0.2+R()*0.3,0.4+R()*0.6,{ry:-th+R()*3});

  // ======== the machine (moves forward as one; its head turns) ========
  const HEAD=FACE-9;                                   // the head's front face, pulled back from the rock
  // -- the shield: the front shield round the main bearing, the gripper shield with its pads, the tail --
  tr(km,'base','#5a4a3c',HEAD-4.6,HEAD-0.5,RB-0.32,RB-0.08,40);tr(km,'base','#4e4236',HEAD-9.6,HEAD-4.7,RB-0.36,RB-0.12,40);tr(km,'base','#544638',HEAD-12.4,HEAD-9.6,RB-0.4,RB-0.18,40);
  for(const s of [HEAD-4.65,HEAD-9.65])tr(km,'base','#3a3430',s,s+0.12,RB-0.42,RB-0.04,40);
  for(const sd of [-1,1]){tb(km,'base','#3e3630',HEAD-7.2,sd*(RB-0.3),AX,2.6,2.0,0.3);tb(km,'base','#2a2622',HEAD-7.2,sd*(RB-0.45),AX,2.2,1.6,0.2);
    for(const dh of [-0.5,0.5])tp(km,'base','#8a8c88',HEAD-7.2,sd*1.4,AX+dh,HEAD-7.2,sd*(RB-0.6),AX+dh,0.16);}
  // -- the bulkhead behind the head, the main bearing ring, the eight drive motors round it --
  tc(km,'base','#4a4038',HEAD-4.8,HEAD-4.4,0,AX,RB-0.4,G.disc);tr(km,'base','#3a3836',HEAD-4.4,HEAD-3.6,1.2,2.9,32);
  for(let i=0;i<8;i++){const a=(i+0.5)/8*TAU,w=Math.sin(a)*2.3,h=AX+Math.cos(a)*2.3;tc(km,'base','#3e5a6a',HEAD-7.2,HEAD-4.8,w,h,0.42,G.cyl);tc(km,'base','#2e3a40',HEAD-7.4,HEAD-7.2,w,h,0.3,G.cyl);
    tb(km,'base','#4a4a48',HEAD-4.95,w,h,0.3,0.8,0.8);}
  // -- the thrust rams, from the bulkhead back to the last ring of segments --
  for(let i=0;i<14;i++){const a=(i+0.5)/14*TAU,w=Math.sin(a)*(RB-0.75),h=AX+Math.cos(a)*(RB-0.75);if(Math.cos(a)<-0.8)continue;tc(km,'base','#3a3632',HEAD-9.8,HEAD-5.0,w,h,0.2,G.cyl);
    tc(km,'base','#c8ccc8',HEAD-12.2,HEAD-9.8,w,h,0.12,G.cyl);tb(km,'base','#3a3632',HEAD-12.3,w,h,0.2,0.5,0.6);}
  // -- the segment erector: a ring that turns on rails behind the tail, its arm and grip --
  tr(km,'base',YEL,HEAD-14,HEAD-13.6,RB-1.6,RB-1.1,32);tb(km,'base',YEL,HEAD-13.4,0,AX+2.4,0.5,1.8,0.5);tb(km,'base','#3a3632',HEAD-13.3,0,AX+3.4,0.9,0.4,1.4);
  tc(km,'base','#7a7a72',HEAD-15.8,HEAD-14.3,0,0.65,1.0,G.cyl6);                 // a segment waiting on the feeder
  // -- the belt conveyor: up from the hopper behind the head over the gear, back to the chamber --
  const BH=AX+1.15,BW=1.0;
  tb(km,'base',STEEL,HEAD-6.6,0.2,AX-0.2,1.6,1.4,1.6);
  tp(km,'base','#2a2826',HEAD-7.4,0.2,AX-0.2,HEAD-14,0.2,BH,0.08);
  tb(km,'base','#3a3a38',(HEAD-14+10)/2,0.2,BH-0.18,HEAD-24,0.24,BW+0.2);tb(km,'base','#1a1a18',(HEAD-14+10)/2,0.2,BH-0.05,HEAD-24,0.03,BW);
  for(let s=11;s<HEAD-14;s+=1.6){tb(km,'base','#5a5a56',s,0.2,BH-0.12,0.1,0.1,BW+0.3);for(const sd of [-1,1])tb(km,'base','#4a4a46',s,0.2+sd*0.6,BH-0.5,0.08,0.75,0.08);}
  // the belt's legs in the chamber and the tunnel where no gantry carries it
  for(let s=12;s<38;s+=4)for(const sd of [-1,1])tb(km,'base','#4a4a46',s,0.2+sd*0.55,BH/2,0.1,BH,0.1);
  // -- the trailing gear: gantries on the wide rails, a deck over the muck track, each carrying its plant --
  const G0=HEAD-16,GL=8.4,NG=8;
  for(let g=0;g<NG;g++){const s1=G0-g*GL,s0=s1-GL+0.6,sm=(s0+s1)/2,c=pick(RUST);
    for(const sd of [-1,1]){for(const e of [s0+0.3,s1-0.3]){tb(km,'base',c,e,sd*2.5,1.35,0.3,2.5,0.3);tb(km,'base','#2a2826',e,sd*2.5,0.28,0.6,0.36,0.24);}
      tb(km,'base',c,sm,sd*2.5,2.6,s1-s0,0.3,0.3);tb(km,'base',YEL,sm,sd*2.75,3.5,s1-s0,0.06,0.05);for(let e=s0+0.4;e<s1;e+=1.4)tb(km,'base',YEL,e,sd*2.75,3.1,0.05,0.85,0.05);}
    tb(km,'base','#4a4440',sm,0,2.75,s1-s0,0.08,5.2);
    // dust lying on the deck, rust running from the bolts
    for(let q=0;q<4;q++)tb(km,'base',pick(DUST),s0+R()*(s1-s0),(R()-0.5)*4.4,2.8,1+R()*2,0.01,0.6+R());
    for(let q=0;q<3;q++)tb(km,'base','#6a3a22',s0+R()*(s1-s0),(R()<0.5?-1:1)*2.66,2.0,0.08,0.9,0.02);
    // lamps strung along the gantry's side
    for(let q=0;q<3;q++)tb(km,'dlamp','#ffd090',s0+1.2+q*2.6,(g%2?-1:1)*2.6,3.95,0.25,0.18,0.2);
    const deck=2.8;
    if(g===0){// the segment feeder: segments stacked on a shuttle
      for(let q=0;q<3;q++)tc(km,'base','#7a7a72',sm-2+q*1.6,sm-0.6+q*1.6,-1.2,deck+0.3,0.7,G.cyl6);}
    else if(g===1){// the operator's cab: a steel box with windows, a seat, the boards inside
      tb(km,'base','#5a5a4e',sm,-1.0,deck+1.15,3.2,2.3,2.4);tb(km,'dglow','#ffe0a0',sm+1.62,-1.0,deck+1.5,0.04,0.8,1.9);tb(km,'dglow','#ffe0a0',sm,-2.22,deck+1.5,2.6,0.8,0.04);
      tb(km,'base','#2a2a26',sm+1.2,-1.0,deck+0.9,0.5,0.9,1.8);tb(km,'dglow','#60ff90',sm+1.0,-1.0,deck+1.4,0.05,0.25,1.4);tb(km,'base',YEL,sm,-1.0,deck+2.35,3.3,0.06,2.5);}
    else if(g===2){// hydraulic power packs: tanks, pumps, filters, hoses running forward
      for(let q=0;q<2;q++){tb(km,'base','#3a5a48',sm-1.8+q*3.6,-1.2,deck+0.75,2.4,1.5,1.6);tv(km,'base','#2a3a30',sm-1.8+q*3.6,0.6,deck,deck+1.1,0.35);tv(km,'base','#c8a030',sm-1.0+q*3.6,1.4,deck,deck+0.8,0.18);}
      for(let q=0;q<4;q++)tp(km,'base','#1a1a18',sm,-0.4+q*0.15,deck+1.4,HEAD-9,-1.0+q*0.3,AX+1.6,0.04);}
    else if(g===3){// the transformer, its fins; a high-tension cable reel
      tb(km,'base','#4a5a52',sm-1.2,-1.0,deck+1.0,2.2,2.0,1.8);for(let q=0;q<9;q++)tb(km,'base','#3a4a42',sm-2.2+q*0.25,-2.05,deck+1.0,0.04,1.6,0.3);
      for(let q=0;q<3;q++)tv(km,'base','#c8c0a8',sm-1.8+q*0.6,-1.0,deck+2.0,deck+2.5,0.08);
      tc(km,'base','#5a4030',sm+2.1,sm+3.0,0.8,deck+1.3,1.25,G.disc);tc(km,'base','#1e1e1c',sm+2.0,sm+3.1,0.8,deck+1.3,0.9,G.cyl);}
    else if(g===4){// water and grout tanks, a compressor
      tc(km,'base','#3a5a6a',sm-3,sm+0.5,-1.0,deck+0.9,0.9,G.cyl);tb(km,'base','#4a4a46',sm+2,1.2,deck+0.6,1.8,1.2,1.2);tc(km,'base','#2a2a28',sm+1.5,sm+2.5,1.2,deck+1.3,0.25,G.cyl);}
    else if(g===5){// the ventilation fan and the duct cassette: the duct feeds back from here to the chamber
      tc(km,'base','#5a6a5a',sm-2,sm+1,0,AX+3.0,0.75,G.cyl);tc(km,'base','#2a2a28',sm+1,sm+1.1,0,AX+3.0,0.7,G.disc);tc(km,'base','#8a7a4a',sm-4,sm-2,0,AX+3.25,0.55,G.cyl);}
    else if(g===6){// cable reels, a container used as a workshop, spare cutters racked
      tb(km,'base','#5a4a3a',sm,-1.0,deck+1.2,4.4,2.4,2.2);tb(km,'base','#2a2622',sm+2.21,-1.0,deck+1.0,0.02,2.0,0.9);
      for(let q=0;q<6;q++)tc(km,'base','#5e5e5a',sm-2+q*0.4,sm-1.85+q*0.4,1.5,deck+0.5,0.24,G.disc);}
    else{// the end of the gear: a cable reel and the hose drum
      tc(km,'base','#4a3a2c',sm-1,sm+0.2,-1.0,deck+1.4,1.4,G.disc);tc(km,'base','#1e1e1c',sm-1.1,sm+0.3,-1.0,deck+1.4,1.0,G.cyl);}}
  // -- the cutter head (its own mesh: local x along the tunnel, the face toward +x) --
  {const hc=['#5a4836','#64503a','#4e4234'];
    kh.add('base',G.disc,'#4e4034',-0.25,0,0,{rz:Math.PI/2,sx:RB-0.12,sy:0.5,sz:RB-0.12});kh.add('base',G.disc,'#3e342c',-0.75,0,0,{rz:Math.PI/2,sx:RB-0.3,sy:0.5,sz:RB-0.3});
    kh.add('base',G.cone,'#5e4c3a',0.3,0,0,{rz:-Math.PI/2,sx:0.9,sy:0.6,sz:0.9});
    for(let i=0;i<6;i++){const f=i/6*TAU;kh.add('base',G.box,pick(hc),0.18,Math.cos(f)*2.25,Math.sin(f)*2.25,{rx:f,sx:0.36,sy:3.9,sz:0.8});
      // disc cutters down each spoke, staggered, in their housings
      for(let r=0.8;r<RB-0.35;r+=0.62){const ff=f+((r*10|0)%2?0.07:-0.07)*(2/(r+1));kh.add('base',G.box,'#3a3430',0.33,Math.cos(ff)*r,Math.sin(ff)*r,{rx:ff,sx:0.2,sy:0.42,sz:0.34});
        kh.add('base',G.disc,'#8a8a84',0.47,Math.cos(ff)*r,Math.sin(ff)*r,{rx:ff,sx:0.2,sy:0.08,sz:0.2});}}
    // the buckets round the rim between the spokes, their dark mouths and steel lips; gauge cutters at the edge
    for(let i=0;i<12;i++){const f=(i+0.5)/12*TAU;kh.add('base',G.box,'#141210',0.05,Math.cos(f)*(RB-0.6),Math.sin(f)*(RB-0.6),{rx:f,sx:0.3,sy:0.7,sz:0.85});
      kh.add('base',G.box,'#7a7a74',0.18,Math.cos(f)*(RB-0.98),Math.sin(f)*(RB-0.98),{rx:f,sx:0.12,sy:0.08,sz:0.9});
      kh.add('base',G.disc,'#5e5e58',0.4,Math.cos(f+0.13)*(RB-0.28),Math.sin(f+0.13)*(RB-0.28),{rx:f+0.13,rz:0.5,sx:0.2,sy:0.08,sz:0.2});}
    // dust caked in the hollows, rust in streaks
    for(let q=0;q<18;q++){const f=R()*TAU,r=0.6+R()*3.6;kh.add('base',G.box,pick(['#5e5446','#665a4a','#584e42']),0.2,Math.cos(f)*r,Math.sin(f)*r,{rx:f,sx:0.04,sy:0.2+R()*0.4,sz:0.2+R()*0.3});}}
  // ======== the old digger: the shaft borer that cut the silo's hole, left where it stopped at the bottom ========
  // An original design after real vertical shaft-boring machines, scaled to the silo: a cutter head as wide as the
  // shaft (its rim ringed with gauge cutters and muck buckets) under the main drive and its motors; above, the gripper
  // ring braced against the rock on pads, the thrust rams down to the head, two working decks, and the muck hoist's
  // lattice tower up the middle. When it reached the bottom they stripped what they could use, cut the tower off,
  // and poured the cap over it for the plant to stand on. Since then: rust, fallen motors, a sagging pad, a collapsed
  // deck, cables hanging from the cap, water pooled round the rim, mineral drips. The mine shaft was later sunk
  // straight through the void in a concrete tube. Built tilted a little as a whole (it settled).
  {const yH=yL(NL),CT=yH+GRAVE.top,CB=yH+GRAVE.bot,CH=CT-CB,RR=RO+1,[SA,SR]=SHAFT,sx_=Math.cos(SA)*SR,sz_=Math.sin(SA)*SR;
    const clear=(x,z,m=4)=>Math.hypot(x-sx_,z-sz_)>m;
    const kw=K.kit(),OLD=['#4a382a','#4e4a46','#3e3228','#5a4634','#44423e'],DK='#2e2a26';
    // -- the void: rough rock walls, the cap's underside with its formwork marks, the bottom, the shaft's tube --
    for(let i=0;i<64;i++){const a=(i+0.5)/64*TAU;for(let r0=0;r0<CH;r0+=3.9)k.add('base',G.box,pick(ROCK),Math.cos(a)*(RR+0.3+R()*0.4),CB+r0+1.95,Math.sin(a)*(RR+0.3+R()*0.4),{ry:-a+Math.PI/2+(R()-0.5)*0.2,sx:TAU*RR/64*1.15,sy:Math.min(4,CH-r0+0.1),sz:0.9+R()*0.6});}
    k.add('base',G.disc,'#5e5a52',0,CT+0.3,0,{sx:RR+0.8,sy:0.6,sz:RR+0.8});                     // the cap's underside
    for(let i=0;i<24;i++){const a=i/24*TAU;k.radial('base','#56524a',a,RR/2,CT-0.12,RR-1,0.25,0.12);}   // the formwork's joints
    k.add('base',K.ring(RR-1.5,RR+0.6,1.4,64),'#6a665c',0,CT+0.3,0);                              // the cap's bearing on the rock
    k.add('base',G.disc,'#2a2622',0,CB-0.3,0,{sx:RR+0.8,sy:0.6,sz:RR+0.8});                     // the bottom of the bore
    k.add('base',G.cyl,'#77736a',sx_,(CT+CB)/2,sz_,{sx:2.8,sy:CH+0.4,sz:2.8});                   // the mine shaft's tube, through
    for(let q=0;q<5;q++)k.add('base',G.cyl,'#5e5a52',sx_,CB+2+q*CH/5,sz_,{sx:2.95,sy:0.25,sz:2.95});
    k.add('base',K.ring(46.6,RR-0.2,0.05,64),'#1a2226',0,CB+0.45,0);                              // the water pooled round the rim
    for(let q=0;q<70;q++){const a=R()*TAU,r=R()*RR,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!clear(x,z))continue;   // the drips off the cap
      k.add('base',G.cone,pick(['#8a8478','#7a7468','#948e80']),x,CT-0.3-R()*0.4,z,{rx:Math.PI,sx:0.08+R()*0.12,sy:0.4+R()*1.1,sz:0.08+R()*0.12});}
    // -- the cutter head: as wide as the bore, thick, its rim ringed with cutters and buckets (some missing) --
    const W_=(key,geo,c,x,y,z,o)=>{if(clear(x,z,4.5))kw.add(key,geo,c,x,y,z,o);};
    kw.add('base',G.disc,'#3e3228',0,1.1,0,{sx:46,sy:2.2,sz:46});
    kw.add('base',K.ring(44,46.2,0.3,64),'#5a4634',0,2.4,0);
    for(let i=0;i<72;i++){const a=(i+0.5)/72*TAU;if(R()<0.15)continue;W_('base',G.cyl6,'#4a4440',Math.cos(a)*46.3,0.7,Math.sin(a)*46.3,{rz:Math.PI/2,ry:-a,sx:0.45,sy:0.35,sz:0.45});}
    for(let i=0;i<24;i++){const a=(i+0.25)/24*TAU;if(R()<0.2)continue;const x=Math.cos(a)*45.6,z=Math.sin(a)*45.6;W_('base',G.box,pick(OLD),x,1.6,z,{ry:-a,sx:1.4,sy:1.6,sz:3.2});}
    // the arms across the head's back, one broken off and lying askew
    for(let i=0;i<10;i++){const a=i/10*TAU;if(i===7){W_('base',G.box,'#4a382a',Math.cos(a)*27,3.0,Math.sin(a)*27,{ry:-a+0.12,rz:0.06,sx:24,sy:1.4,sz:1.8});continue;}
      for(let s=9;s<45;s+=6){const x=Math.cos(a)*(s+3),z=Math.sin(a)*(s+3);W_('base',G.box,pick(OLD),x,3.1,z,{ry:-a,sx:6.1,sy:1.8,sz:1.8});}}
    // -- the main drive: the housing, sixteen motors round it (five gone, two fallen over on the head) --
    kw.add('base',G.cyl,'#46443f',0,6.2,0,{sx:9,sy:8,sz:9});kw.add('base',G.cyl,'#5a4634',0,10.4,0,{sx:9.6,sy:0.5,sz:9.6});
    for(let i=0;i<16;i++){const a=(i+0.5)/16*TAU,x=Math.cos(a)*10.6,z=Math.sin(a)*10.6;if([2,5,9,12,14].includes(i))continue;
      if(i===4||i===11){const x2=Math.cos(a)*14,z2=Math.sin(a)*14;W_('base',G.cyl,'#5a4a3a',x2,3.4,z2,{rz:Math.PI/2,ry:-a+0.5,sx:1.1,sy:4,sz:1.1});continue;}
      W_('base',G.cyl,pick(['#5a4a3a','#4a4844','#62503e','#3e3c3a']),x,4.4+2,z,{sx:1.1,sy:4,sz:1.1});W_('base',G.cyl,'#3a302a',x,8.6,z,{sx:0.7,sy:0.5,sz:0.7});}
    // -- the gripper ring, its pads on the rock (one sagged down the wall), the thrust rams down to the head --
    const yG=14;kw.add('base',K.ring(39.5,43,1.6,64),'#4e4034',0,yG+1.6,0);
    for(let i=0;i<8;i++){const a=(i+0.5)/8*TAU,sag=i===3?3.2:0,x=Math.cos(a)*45,z=Math.sin(a)*45;
      W_('base',G.box,pick(OLD),x,yG+0.8-sag,z,{ry:-a,rz:i===3?0.08:0,sx:1.6,sy:6,sz:9});
      W_('base',G.box,'#3a302a',Math.cos(a)*43.6,yG+0.8,Math.sin(a)*43.6,{ry:-a,sx:1.4,sy:1.4,sz:2});}
    for(let i=0;i<16;i++){const a=(i+0.5)/16*TAU;if(i===9)continue;const x0=Math.cos(a)*41,z0=Math.sin(a)*41,x1=Math.cos(a)*32,z1=Math.sin(a)*32;
      if(clear(x0,z0,5)&&clear(x1,z1,5)){kw.pipe('base','#4a4440',x0,yG,z0,(x0+x1)/2,(yG+4.2)/2+0.5,(z0+z1)/2,0.55);kw.pipe('base','#6a6460',(x0+x1)/2,(yG+4.2)/2+0.5,(z0+z1)/2,x1,4.2,z1,0.35);}}
    // -- the decks: radial girders from the drive out to the ring, gratings on some, the upper deck half fallen in --
    for(let i=0;i<12;i++){const a=i/12*TAU;
      for(let s=10;s<40;s+=6){const x=Math.cos(a)*(s+3),z=Math.sin(a)*(s+3);W_('base',G.box,'#4e4034',x,yG+0.9,z,{ry:-a,sx:6.1,sy:1.0,sz:0.6});}
      if(i%2===0)for(let s=10;s<34;s+=6){if(R()<0.35)continue;const x=Math.cos(a+0.12)*(s+3),z=Math.sin(a+0.12)*(s+3);W_('base',G.box,'#3e3a36',x,yG+1.45,z,{ry:-a,sx:5.8,sy:0.08,sz:3.6});}
      const up=yG+5.5;if(i<7){for(let s=10;s<34;s+=6){const x=Math.cos(a)*(s+3),z=Math.sin(a)*(s+3);W_('base',G.box,'#4a3a2e',x,up,z,{ry:-a,sx:6.1,sy:0.7,sz:0.5});}
        const x=Math.cos(a)*36,z=Math.sin(a)*36;W_('base',G.box,'#3a302a',x,(up+yG+1.6)/2,z,{sx:0.5,sy:up-yG-1.6,sz:0.5});}
      else{const x0=Math.cos(a)*10,z0=Math.sin(a)*10,x1=Math.cos(a)*30,z1=Math.sin(a)*30;if(clear(x1,z1,5))kw.pipe('base','#4a3a2e',x0,up,z0,x1,yG+1.8,z1,0.3);}}   // fallen in
    // fallen gratings and rubbish on the head
    for(let q=0;q<26;q++){const a=R()*TAU,r=12+R()*30,x=Math.cos(a)*r,z=Math.sin(a)*r;W_('base',G.box,pick(['#3e3a36','#4a382a','#2e2a26']),x,4.2+R()*0.3,z,{ry:R()*3,rx:(R()-0.5)*0.3,rz:(R()-0.5)*0.3,sx:1+R()*3,sy:0.1,sz:0.8+R()*2});}
    for(let q=0;q<14;q++){const a=R()*TAU,r=10+R()*34,x=Math.cos(a)*r,z=Math.sin(a)*r;W_('base',G.sph4,pick(ROCK),x,4,z,{sx:1+R()*2,sy:0.4+R()*0.6,sz:1+R()*2});}
    // -- the muck hoist's tower up the middle, cut off and capped where the cap was poured; its skip hung askew --
    const yTop=CH-0.3;for(const [px,pz] of [[-2.6,-2.6],[2.6,-2.6],[2.6,2.6],[-2.6,2.6]])kw.add('base',G.box,'#4a3a2e',px,(10.6+yTop)/2,pz,{sx:0.45,sy:yTop-10.6,sz:0.45});
    for(let h=12;h<yTop-0.5;h+=2.6){kw.add('base',K.ring(3.4,3.75,0.3,4,TAU/8),'#4a3a2e',0,h,0);
      kw.pipe('base','#3a302a',-2.6,h-2.6,-2.6,2.6,h,-2.6,0.12);kw.pipe('base','#3a302a',2.6,h-2.6,2.6,-2.6,h,2.6,0.12);}
    kw.add('base',G.box,'#5a4634',0.6,yTop-5,0.4,{rz:0.18,rx:0.1,sx:2.6,sy:3,sz:2.4});
    kw.add('base',G.cyl,'#6a665c',0,yTop+0.1,0,{sx:4.6,sy:0.8,sz:4.6});                          // the plug poured over its stump
    // cables hanging from the cap in slack loops, and two that fell
    for(let q=0;q<12;q++){const a=R()*TAU,r=6+R()*34,x=Math.cos(a)*r,z=Math.sin(a)*r;if(!clear(x,z,5))continue;const lo=yG+3+R()*(yTop-yG-6);
      kw.pipe('base',DK,x,yTop+0.2,z,x+1.2,lo,z+0.6,0.06);kw.pipe('base',DK,x+1.2,lo,z+0.6,x+2.8,yTop+0.2-R()*2,z+1.4,0.06);}
    const wreck=new THREE.Group();wreck.position.set(0,CB+0.1,0);wreck.rotation.set(0.012,0,0.022);res.group.add(wreck);
    {const wm=new THREE.MeshLambertMaterial({vertexColors:true,color:'#8c8a86',clippingPlanes:clip});for(const [key,g] of Object.entries(kw.build())){const m=new THREE.Mesh(g,key==='base'?wm:matFor(key));m.frustumCulled=false;wreck.add(m);}}
    res.grave={CT,CB};}

  // ======== assemble ========
  const lampMat=new THREE.MeshBasicMaterial({vertexColors:true,clippingPlanes:clip}),glowMat=new THREE.MeshBasicMaterial({vertexColors:true,clippingPlanes:clip});
  const mf=key=>key==='dlamp'?lampMat:key==='dglow'?glowMat:matFor(key);
  const meshes=(geo,parent)=>{for(const [key,g] of Object.entries(geo)){const m=new THREE.Mesh(g,mf(key));m.frustumCulled=false;parent.add(m);}};
  meshes(k.build(),res.group);
  const machine=new THREE.Group();res.group.add(machine);meshes(km.build(),machine);
  const headG=new THREE.Group(),spin=new THREE.Group();{const [x,z]=F(HEAD,0);headG.position.set(x,y0+AX,z);headG.rotation.y=-th;}headG.add(spin);meshes(kh.build(),spin);machine.add(headG);
  // the muck on the belt: lumps that travel back along it while it runs
  const NM=90,muck=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.22,0),new THREE.MeshLambertMaterial({color:'#5a4e42',clippingPlanes:clip}),NM);muck.frustumCulled=false;machine.add(muck);
  const mu=[];for(let i=0;i<NM;i++)mu.push({s:10+R()*(HEAD-24),w:0.2+(R()-0.5)*0.6,sc:0.6+R()*0.9,r:R()*3});
  const o=new THREE.Object3D();const placeMuck=(load)=>{let n=0;for(const q of mu){if(q.s>10+(HEAD-24)*load)continue;const [x,z]=F(q.s,q.w);o.position.set(x,y0+BH+0.12,z);o.rotation.set(q.r,q.r*2,0);o.scale.setScalar(q.sc);o.updateMatrix();muck.setMatrixAt(n++,o.matrix);}muck.count=n;muck.instanceMatrix.needsUpdate=true;};
  placeMuck(0.3);
  // dust off the face while the head cuts
  const dustC=document.createElement('canvas');dustC.width=dustC.height=64;{const x=dustC.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(180,160,130,0.55)');g.addColorStop(1,'rgba(180,160,130,0)');x.fillStyle=g;x.fillRect(0,0,64,64);}
  const dustT=new THREE.CanvasTexture(dustC),puffs=[];
  for(let i=0;i<28;i++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:dustT,transparent:true,depthWrite:false,opacity:0}));sp.userData={ph:R(),w:(R()-0.5)*7,h:(R()-0.3)*6};res.group.add(sp);puffs.push(sp);}
  // ======== the line in the field: the bored part solid, the rest of the way to Silo 17 dashed ========
  if(out.field){const lm=new THREE.MeshBasicMaterial({color:'#ffb050',fog:false}),dm=new THREE.MeshBasicMaterial({color:'#c89060',fog:false,transparent:true,opacity:0.7});
    const seg=(a,b,mat,wd)=>{const [ax,az]=a,[bx,bz]=b,L=Math.hypot(bx-ax,bz-az),m=new THREE.Mesh(new THREE.BoxGeometry(L,wd,wd),mat);m.position.set((ax+bx)/2,y0+AX,(az+bz)/2);m.rotation.y=-Math.atan2(bz-az,bx-ax);out.field.add(m);};
    seg([Math.cos(md)*RO,Math.sin(md)*RO],P0,lm,7);seg(P0,F(FACE,0),lm,9);
    for(let s=FACE+8;s<LEN-8;s+=24)seg(F(s,0),F(Math.min(s+12,LEN),0),dm,6);}
  // ======== the clock ========
  let adv=0,spinV=0,lightL=0.12,belt=0;const AMAX=4.5;
  const setLights=v=>{lampMat.color.setScalar(v);glowMat.color.setScalar(v*0.9+0.1);};setLights(lightL);
  res.headAt=()=>{const [x,z]=F(HEAD+adv,0);return {x,y:y0+AX,z};};
  res.tick=(t,dt,wake,cam)=>{
    // what the event wants: lights by 2 s, belt by 5 s, head by 7 s, advance from 10 s to 46 s, all stop by 52 s
    let wl=0.12,wb=0,ws=0,wa=0;if(wake!=null){const e=wake;wl=e<0.4?0.12:e<2.2?(Math.sin(e*37)>0.2?1:0.2):1;wb=e>4&&e<50?1:0;ws=e>7&&e<48?1:0;wa=e>10&&e<46?1:0;}
    lightL+=(wl-lightL)*Math.min(1,dt*(wl>lightL?20:0.6));setLights(lightL);
    belt+=(wb-belt)*Math.min(1,dt*0.8);spinV+=(ws*0.45-spinV)*Math.min(1,dt*0.35);spin.rotation.x+=spinV*dt;
    if(wa)adv=Math.min(AMAX,adv+dt*0.11*Math.min(1,spinV/0.4));
    machine.position.set(ux*adv,0,uz*adv);
    if(belt>0.01){for(const q of mu){q.s-=dt*belt*2.2;if(q.s<10)q.s+=HEAD-24;q.r+=dt*belt*0.3;}placeMuck(1);}
    // dust: thick at the face while the head cuts, settling after
    const cut=Math.min(1,spinV/0.45)*(wa?1:0.4);
    for(const p of puffs){const u=p.userData;u.ph=(u.ph+dt*0.05*(0.5+cut))%1;const s=FACE-0.3-u.ph*14,[x,z]=F(s+adv*0,u.w*(0.4+u.ph));p.position.set(x,y0+AX+u.h*(0.3+u.ph*0.5),z);
      const sc=2+u.ph*7;p.scale.set(sc,sc,1);p.material.opacity=cut*0.5*Math.sin(u.ph*Math.PI);}
    return cut;};
  res.where=p=>{if(res.grave&&p.y<res.grave.CT&&p.y>res.grave.CB-1&&Math.hypot(p.x,p.z)<RO+2)return "the old digger's grave, under the cap";const dx=p.x-P0[0],dz=p.z-P0[1],s=dx*ux+dz*uz,w=dx*vx+dz*vz;if(Math.hypot(s,w)<11)return "the digger's chamber";if(s>8&&s<FACE+1&&Math.abs(w)<5)return s>HEAD-16?'the digger':"the digger's tunnel";const [SA,SR]=SHAFT;if(Math.hypot(p.x-Math.cos(SA)*SR,p.z-Math.sin(SA)*SR)<3&&p.y>y0+HUB_H)return 'the mine shaft';if(Math.hypot(p.x,p.z)<RO+2)return "the mines' hall";return 'the mines';};
  res.machine=machine;res.spin=spin;
  return res;}
