// Silo 18: the plant at the bottom, levels 142 to 144 open as one hall twelve metres tall. A turbine-generator set
// on a concrete pedestal (the turbine's casing stepping up from a small high-pressure end to a big ribbed
// low-pressure end, coupled to the generator and its exciter), its valves, crossover and exhaust trunk, the lube oil
// skid and the cooler; an overhead travelling crane on rails across the hall; the oil (the wellhead and its pumpjack,
// separators, a still, day tanks with sight glasses) and the pipe rack that carries it; switchgear and bus bars, cable
// trays, the control boards and their mimic panel; a mezzanine of grating with a stair and a ladder; benches, tools,
// spares, drums, oil stains and painted warnings; caged lamps; a few people at work. This project's own design.
//
// Everything that stands still is merged by material key; the parts that move (the rotor, the pumpjack, the gauges'
// needles, steam) are a handful of meshes, driven by tick(t, dt, run) where run is the generator's speed, 0 to 1.
import {RS,RO,yL,NL} from './levels.js';
import {personGeo} from './life.js';

const D=Math.PI/180,TAU=Math.PI*2;
export function buildPlant(THREE,K,matFor,clip){
  const {G}=K,k=K.kit(),y0=yL(NL),HT=yL(141)-0.5-y0;          // floor, and the hall's height (about 12 m)
  const out={group:new THREE.Group(),needles:[]};
  const R=(()=>{let s=144;return()=>((s=(s*16807)%2147483647)/2147483647);})();
  // ---- the turbine's frame: s along the shaft, w across it (outward), h above the floor ----
  const a=300*D,R0=28,ua=a+Math.PI/2,cu=Math.cos(ua),su=Math.sin(ua),cv=Math.cos(a),sv=Math.sin(a);
  const P=(s,w)=>[cv*(R0+w)+cu*s,sv*(R0+w)+su*s];
  const tb=(key,col,s,w,h,ls,lh,lw,o={})=>{const [x,z]=P(s,w);k.add(key,G.box,col,x,y0+h,z,Object.assign({ry:-ua,sx:ls,sy:lh,sz:lw},o));};
  const tc=(key,col,s0,s1,w,h,r,geo)=>{const [x,z]=P((s0+s1)/2,w);k.add(key,geo||G.disc,col,x,y0+h,z,{rz:Math.PI/2,ry:-ua,sx:r,sy:s1-s0,sz:r});};
  const tv=(key,col,s,w,h0,h1,r,geo)=>{const [x,z]=P(s,w);k.add(key,geo||G.cyl,col,x,y0+(h0+h1)/2,z,{sx:r,sy:h1-h0,sz:r});};
  const tp=(key,col,s0,w0,h0,s1,w1,h1,r)=>{const [ax,az]=P(s0,w0),[bx,bz]=P(s1,w1);k.pipe(key,col,ax,y0+h0,az,bx,y0+h1,bz,r,G.cyl);};
  // ---- the world frame: angle b, radius r ----
  const W=(b,r)=>[Math.cos(b)*r,Math.sin(b)*r];
  const wv=(key,col,b,r,h0,h1,rad,geo)=>{const [x,z]=W(b,r);k.add(key,geo||G.cyl,col,x,y0+(h0+h1)/2,z,{sx:rad,sy:h1-h0,sz:rad});};
  const wp=(key,col,b0,r0,h0,b1,r1,h1,rad)=>{const [ax,az]=W(b0,r0),[bx,bz]=W(b1,r1);k.pipe(key,col,ax,y0+h0,az,bx,y0+h1,bz,rad,G.cyl);};
  const wb=(key,col,b,r,h,lr,lh,lt,o={})=>{const [x,z]=W(b,r);k.add(key,G.box,col,x,y0+h,z,Object.assign({ry:-b,sx:lr,sy:lh,sz:lt},o));};
  // a dial and its needle, facing along the outward normal (nx, nz) of whatever it is mounted on
  // (a disc turned by ry faces along (cos ry, -sin ry))
  const gauge=(x,y,z,ry,size=0.22,rest=-1.1,base=0.3,amp=0.25,f=0.7)=>{const nx=Math.cos(ry),nz=-Math.sin(ry);k.add('base',G.disc,'#e8e4d6',x,y,z,{rz:Math.PI/2,ry,sx:size,sy:0.05,sz:size});
    k.add('base',G.disc,'#2a2c2e',x-nx*0.015,y,z-nz*0.015,{rz:Math.PI/2,ry,sx:size*1.15,sy:0.04,sz:size*1.15});
    out.needles.push({x:x+nx*0.035,y,z:z+nz*0.035,ry,len:size*0.8,rest,base,amp,f,ph:R()*TAU});};
  const STEEL='#6e7478',DARK='#3a3e42',YEL='#d8aa1c',BLK='#1e1e1c',CONC='#8a857a',OIL='#7a5a20',WATER='#3a7050',STEAM='#b4b4ac',GAS='#c8a020',CRUDE='#2a2826';

  // ---------------- the turbine-generator set ----------------
  const HC=4.4;                                                  // the shaft's height above the floor
  // the pedestal, its anchor bolts, its painted edges and a hazard band round its foot
  tb('base',CONC,-0.4,0,0.8,29.6,1.6,6.8);
  for(let s=-14.5;s<=14;s+=1.6)for(const w of [-3.0,3.0]){tv('base','#5a5650',s,w,1.6,1.82,0.06,G.cyl6);tb('base','#4a4640',s,w,1.66,0.18,0.1,0.18);}
  for(const w of [-3.38,3.38])tb('base',YEL,-0.4,w,1.62,29.6,0.06,0.1);
  for(let s=-14.8;s<14.6;s+=0.8)for(const w of [-3.42,3.42])tb('base',Math.round(s/0.8)%2?YEL:BLK,s,w,0.2,0.4,0.4,0.04,{rz:0.6});
  // the casing: high-pressure, intermediate and low-pressure sections, each wider; the low-pressure end ribbed
  const SEC=[[-13,-8.5,1.45,'#a8aaa4'],[-8.5,-4.5,2.0,'#7c8286'],[-4.5,1.0,2.75,STEEL]];
  for(const [s0,s1,r,c] of SEC){tc('base',c,s0,s1,0,HC,r);
    // the horizontal joint where the top half bolts to the bottom, both sides
    for(const w of [-1,1]){tb('base',DARK,(s0+s1)/2,w*(r+0.12),HC,s1-s0,0.22,0.3);for(let s=s0+0.25;s<s1;s+=0.5)tv('base','#2a2c2e',s,w*(r+0.15),HC+0.11,HC+0.24,0.05,G.cyl6);}}
  for(let s=-4.2;s<0.9;s+=0.65)tc('base','#5c6266',s,s+0.12,0,HC,2.87);
  for(let s=-8.2;s<-4.6;s+=0.9)tc('base','#6a7074',s,s+0.1,0,HC,2.08);
  // flanged joints between the sections, ringed with bolts
  for(const [s,r] of [[-13.15,1.75],[-8.5,2.35],[-4.5,3.1],[1.0,3.1]]){tc('base',DARK,s-0.18,s+0.18,0,HC,r);
    const n=Math.round(r*9);for(let i=0;i<n;i++){const f=i/n*TAU;tc('base','#26282a',s-0.26,s+0.26,Math.cos(f)*(r-0.15),HC+Math.sin(f)*(r-0.15),0.06,G.cyl6);}}
  // the bearing standards, oil pipes into them
  for(const s of [-13.9,1.7,10.5,13.3]){tb('base','#4e5458',s,0,1.6+(HC-0.8-1.6)/2,1.0,HC-0.8-1.6,2.0);tb('base','#5a6064',s,0,HC-0.5,1.1,0.9,1.5);tp('base',OIL,s,-1.0,HC-0.3,s,-3.3,1.7,0.07);}
  // the steam chest's two stop valves and their handwheels; the inlet lines up to the ceiling and off to the wall
  for(const w of [-2.6,2.6]){tv('base','#5a6064',-12,w,1.6,6.0,0.65);tv('base','#6a7074',-12,w,6.0,6.8,0.4);tv('base','#8a8a82',-12,w,6.8,7.4,0.05,G.cyl6);
    tv('base','#a02818',-12,w,7.38,7.46,0.62,G.disc);for(let i=0;i<4;i++){const f=i/4*Math.PI;const [x,z]=P(-12,w);k.add('base',G.box,'#a02818',x,y0+7.42,z,{ry:f,sx:1.2,sy:0.04,sz:0.05});}
    tp('base',STEAM,-12,w,5.2,-12,w*1.9,5.2,0.42);tp('base',STEAM,-12,w*1.9,5.2,-12,w*1.9,HT-0.3,0.42);tp('base',STEAM,-12,w*1.9,HT-0.6,-12,w*1.9+(w>0?14:-6),HT-0.6,0.42);
    tc('base','#8a8a82',-12.2,-11.8,w*1.55,5.2,0.62);
    tp('base',STEAM,-12,w*0.9,HC+1.2,-12,w,5.0,0.35);}
  // the crossover from the high-pressure end over to the intermediate section
  tp('base',STEAM,-10.2,0,HC+1.3,-10.2,0,8.4,0.42);tp('base',STEAM,-10.2,0,8.4,-6.4,0,8.4,0.42);tp('base',STEAM,-6.4,0,8.4,-6.4,0,HC+1.9,0.42);
  for(const s of [-10.2,-6.4])tc('base',DARK,s-0.15,s+0.15,0,8.4,0.62);
  // the exhaust trunk, up from the low-pressure end through the ceiling, ribbed, with a hatch
  tb('base','#5a6064',-1.7,0,HC+2.6+(HT-HC-2.6)/2,4.2,HT-HC-2.6,3.8);
  for(let h=HC+3.2;h<HT;h+=1.2)tb('base','#4a5054',-1.7,0,h,4.4,0.14,4.0);
  tb('base','#3e4246',-1.7,1.95,HC+4.8,1.2,1.0,0.1);
  // the generator: its stator housing on a base, end bells, coolers on top, a terminal box and its cables
  tb('base','#36524a',6.7,0,2.3,7.2,1.4,5.2);tc('base','#3e5c54',3.3,10.1,0,HC,2.5);
  for(let s=3.8;s<10;s+=0.8)tc('base','#355048',s,s+0.1,0,HC,2.58);
  for(const s of [3.3,10.1])tc('base','#2e443e',s-0.2,s+0.2,0,HC,1.9);
  for(const s of [4.4,7.9]){tb('base','#56706a',s,0,HC+2.9,2.6,1.0,2.6);for(let q=0;q<5;q++)tb('base','#3a4a46',s-1+q*0.5,1.31,HC+2.9,0.08,0.8,0.02);}
  tb('base','#d8d4c4',6.7,-2.6,HC-0.6,1.0,0.5,0.04);                       // the maker's plate (blank: no name)
  tb('base','#36524a',6.6,2.9,2.4,1.6,1.4,0.9);for(let q=0;q<3;q++)tp('base','#1a1a1a',6.2+q*0.4,3.3,2.0,6.2+q*0.4,3.3,0.02,0.09);
  // the exciter, and its own little standard
  tc('base','#3e5c54',10.8,12.9,0,HC,1.2);for(let s=11;s<12.8;s+=0.35)tc('base','#355048',s,s+0.06,0,HC,1.26);
  // a gauge stand at the front of the set
  {const [x,z]=P(-16.2,0);tb('base','#3a4a4a',-16.2,0,1.3,0.3,2.6,2.4);for(let q=0;q<4;q++){const [gx,gz]=P(-16.37,-0.8+q*0.55);gauge(gx,y0+1.9,gz,-ua+Math.PI,0.2);}
    tb('glow','#70ff90',-16.37,-0.9,1.2,0.04,0.12,0.12);tb('blink','#ff4030',-16.37,0.9,1.2,0.04,0.12,0.12);}
  // the lube oil skid: a tank, two motor-driven pumps, twin filters, the header and the lines to the bearings
  tb('base','#3a3c3e',-2,-7.8,0.15,6.4,0.3,3.6);tb('base','#7a6a2a',-3.2,-7.8,1.2,3.6,1.8,2.6);tb('base',YEL,-3.2,-7.8,2.12,3.7,0.05,2.7);
  for(const w of [-7.0,-8.6]){tc('base','#3a5a7a',-0.6,0.4,w,0.75,0.34);tc('base','#3a5a7a',-0.75,-0.6,w,0.75,0.26);k.add('base',G.sph,'#6a6e72',...P(0.75,w).flatMap((v,i)=>i?[v]:[v,y0+0.75]),{sx:0.32,sy:0.3,sz:0.32});
    tb('base','#2a2c2e',0.2,w,0.4,1.8,0.2,0.6);tp('base',OIL,0.75,w,1.0,0.75,w,1.8,0.08);}
  for(const w of [-7.2,-8.4]){tv('base','#8a7a40',1.4,w,0.3,1.7,0.3);const [x,z]=P(1.4,w+0.32);gauge(x,y0+1.4,z,-a,0.12);}
  tp('base',OIL,0.75,-6.8,1.8,0.75,-8.8,1.8,0.1);tp('base',OIL,0.75,-6.6,1.8,0.75,-3.3,1.72,0.09);tp('base',OIL,-13.9,-3.3,1.72,13.3,-3.3,1.72,0.09);
  // the oil cooler: a shell and tubes on saddles, its water lines banded green
  tc('base','#6a7a7c',-12,-5,6.8,1.9,1.0);for(const s of [-12.15,-4.85])tc('base',DARK,s-0.15,s+0.15,6.8,1.9,1.15);
  for(const s of [-11,-6])tb('base','#4a4c4e',s,6.8,0.6,0.5,1.2,2.0);
  for(const [s,c] of [[-11.4,WATER],[-5.6,WATER],[-8,OIL]]){tv('base',c,s,6.8,2.8,3.4,0.22);tv('base',DARK,s,6.8,3.4,3.5,0.32,G.disc);}
  tp('base',WATER,-11.4,6.8,3.4,-11.4,6.8,5.0,0.2);tp('base',WATER,-5.6,6.8,3.4,-5.6,6.8,5.0,0.2);
  for(const s of [-11.4,-5.6])tv('base','#3070c0',s,6.8,4.2,4.45,0.23);

  // ---------------- the overhead travelling crane ----------------
  for(const w of [-9.5,9.5]){tb('base','#5a5a52',0,w,HT-1.2,34.5,0.6,0.45);tb('base','#2a2a28',0,w,HT-0.86,34.5,0.08,0.12);
    for(const s of [-16.6,16.6]){tb('base','#5a5a52',s,w,(HT-1.5)/2,0.5,HT-1.5,0.5);for(let h=0.2;h<1.6;h+=0.4)tb('base',Math.round(h/0.4)%2?YEL:BLK,s,w,h+0.1,0.54,0.2,0.54);}}
  {const sB=7.2;tb('base',YEL,sB,0,HT-1.35,0.7,0.95,19.8);tb('base',YEL,sB+0.9,0,HT-1.35,0.7,0.95,19.8);
    for(const w of [-9.5,9.5]){tb('base','#4a4a44',sB+0.45,w,HT-1.3,2.8,0.7,0.8);for(let q=0;q<4;q++)tb('base',q%2?YEL:BLK,sB+0.45-1.05+q*0.7,w,HT-1.75,0.7,0.2,0.84);}
    tb('base','#4a4c4e',sB+0.45,-1.6,HT-2.1,1.8,0.8,1.6);tb('base','#2a2c2e',sB+0.45,-1.6,HT-1.75,1.0,0.2,1.3);
    for(const d of [-0.25,0.25])tp('base','#1a1a1a',sB+0.45+d,-1.6,HT-2.5,sB+0.45+d,-1.6,8.9,0.03);
    tb('base',YEL,sB+0.45,-1.6,8.6,0.7,0.8,0.4);tb('base',BLK,sB+0.45,-1.6,8.6,0.72,0.12,0.42);tb('base','#2a2a28',sB+0.45,-1.6,7.95,0.12,0.5,0.12);tb('base','#2a2a28',sB+0.6,-1.6,7.72,0.4,0.1,0.12);
    tb('base','#d8d4c4',sB-0.38,4.0,HT-1.35,0.04,0.5,2.0);}

  // ---------------- the mezzanine beside the generator: grating, rails, a stair and a ladder ----------------
  {const s0=2.5,s1=13.2,wi=-3.9,wo=-6.4,hM=6.0;
    tb('base','#4a4e50',(s0+s1)/2,(wi+wo)/2,hM,s1-s0,0.08,wi-wo);for(let s=s0;s<s1;s+=0.35)tb('base','#2e3234',s,(wi+wo)/2,hM-0.02,0.04,0.1,wi-wo);
    tb('base','#3a3e40',(s0+s1)/2,wo,hM-0.15,s1-s0,0.3,0.12);
    for(const s of [s0+0.3,(s0+s1)/2,s1-0.3])for(const w of [wi+0.15,wo+0.15])tb('base','#4a4e50',s,w,(hM-0.1)/2,0.2,hM-0.1,0.2);
    for(let s=s0;s<=s1+0.01;s+=1.5)tb('base',YEL,s,wo+0.05,hM+0.55,0.06,1.1,0.06);
    for(const h of [0.55,1.1])tb('base',YEL,(s0+s1)/2,wo+0.05,hM+h,s1-s0,0.06,0.06);tb('base',YEL,(s0+s1)/2,wo+0.05,hM+0.08,s1-s0,0.15,0.03);
    for(const h of [0.55,1.1])tb('base',YEL,s1,(wi+wo)/2,hM+h,0.06,0.06,wi-wo);
    // the stair up from the floor, against the run of the set
    for(let i=0;i<14;i++){const s=s0-0.5-(13-i)*0.42,h=(i+1)*hM/14;tb('base','#5a5e60',s,-5.0,h,0.4,0.06,1.0);}
    for(const w of [-4.45,-5.55]){tp('base','#3a3e40',s0-0.5-13*0.42-0.3,w,0,s0-0.3,w,hM,0.06);tp('base',YEL,s0-0.5-13*0.42-0.3,w+(w<-5?-0.05:0.05),1.0,s0-0.3,w+(w<-5?-0.05:0.05),hM+1.0,0.03);}
    // a ladder at the far end
    for(const w of [-4.9,-5.4])tp('base','#5a5e60',s1+0.3,w,0,s1+0.3,w,hM+1.1,0.03);for(let h=0.3;h<hM+1;h+=0.3)tb('base','#5a5e60',s1+0.3,-5.15,h,0.04,0.04,0.5);}

  // ---------------- switchgear, bus bars, cable trays ----------------
  for(let i=0;i<16;i++){const b=(243+i*1.25)*D,r=RO-1.5;
    wb('base','#8a8e88',b,r,1.15,0.9,2.3,1.08);wb('base','#3a3c3e',b,r-0.46,1.15,0.02,2.2,0.02,{});
    for(let q=0;q<3;q++)wb('base','#4a4c4e',b,r-0.46,0.35+q*0.12,0.02,0.05,0.6);
    wb(i%3?'glow':'blink',['#70ff90','#ff5040','#ffd070'][i%3],b+0.18*D,r-0.47,2.0,0.03,0.08,0.08);wb('glow','#ffffff',b-0.18*D,r-0.47,2.0,0.03,0.08,0.08);
    wb('base',YEL,b,r-0.47,1.6,0.02,0.22,0.22);wb('base',BLK,b,r-0.475,1.6,0.02,0.1,0.04);
    if(i%4===1){const [x,z]=W(b+0.25*D,r-0.47);gauge(x,y0+1.25,z,-b+Math.PI,0.1);}}
  for(let q=0;q<3;q++){const r=RO-1.75+q*0.25;for(let i=0;i<15;i++){const b0=(243+i*1.25)*D,b1=b0+1.25*D;wp('base','#c07840',b0,r,2.62,b1,r,2.62,0.04);}
    for(let i=0;i<16;i+=2)wv('base','#e8e4dc',(243+i*1.25)*D,r,2.3,2.58,0.05,G.cyl6);}
  // a cable tray: from the switchgear round to the generator's terminal box, and down
  {const tray=(b0,r0,b1,r1,h)=>{const [ax,az]=W(b0,r0),[bx,bz]=W(b1,r1),L=Math.hypot(bx-ax,bz-az),ry=-Math.atan2(bz-az,bx-ax),mx=(ax+bx)/2,mz=(az+bz)/2;
      k.add('base',G.box,'#6a6c66',mx,y0+h,mz,{ry,sx:L,sy:0.04,sz:0.6});for(const sd of [-1,1])k.add('base',G.box,'#6a6c66',mx-Math.sin(-ry)*sd*0.3,y0+h+0.08,mz+Math.cos(-ry)*sd*0.3,{ry,sx:L,sy:0.16,sz:0.03});
      for(let q=0;q<4;q++)k.add('base',G.box,'#1c1c1c',mx-Math.sin(-ry)*(q-1.5)*0.12,y0+h+0.06,mz+Math.cos(-ry)*(q-1.5)*0.12,{ry,sx:L,sy:0.08,sz:0.08});};
    for(let b=253;b<312;b+=3)tray(b*D,43.5,(b+3)*D,43.5,3.4);tray(312*D,43.5,312*D,32.4,3.4);
    for(let i=0;i<10;i++){const b=(255+i*6)*D;wb('base','#3a3c3e',b,43.5,3.9,0.05,0.9,0.05);}
    {const [x,z]=W(312*D,32.4);k.add('base',G.box,'#6a6c66',x,y0+2.9,z,{ry:-312*D,sx:0.6,sy:1.0,sz:0.05});}}

  // ---------------- the control boards, their desk, the mimic panel above ----------------
  for(let i=0;i<7;i++){const b=(333+i*2.85)*D,r=RO-1.3;
    wb('base','#4a5a58',b,r,1.3,0.55,2.6,2.3);wb('base','#56686a',b,r-0.55,0.95,0.9,0.1,2.25,{rz:0.35});
    for(let q=0;q<8;q++){const bq=b+(q-3.5)*0.24/r,[x,z]=W(bq,r-0.29);k.add(q%3===1?'blink':'glow',G.box,['#ff5040','#70ff90','#ffd070','#e8f0ff'][(q+i)%4],x,y0+2.25,z,{ry:-b,sx:0.03,sy:0.1,sz:0.1});}
    for(let q=0;q<3;q++){const bq=b+(q-1)*0.7/r,[x,z]=W(bq,r-0.29);gauge(x,y0+1.7,z,-b+Math.PI,0.18,-1.1,0.2+q*0.25,0.2+q*0.1,0.4+q*0.3);}
    // two big levers on each board, knobs red and black
    for(const sd of [-1,1]){const bq=b+sd*0.55/r,[x0,z0]=W(bq,r-0.6),[x1,z1]=W(bq,r-1.0);k.pipe('base','#8a8a84',x0,y0+1.1,z0,x1,y0+1.62,z1,0.03);k.add('base',G.sph,sd<0?'#b02818':'#1e1e1e',x1,y0+1.66,z1,{sx:0.07,sy:0.09,sz:0.07});}
    for(let q=0;q<5;q++){const bq=b+(q-2)*0.3/r,[x,z]=W(bq,r-0.85);k.add('base',G.cyl6,'#2a2a2a',x,y0+1.03,z,{sx:0.04,sy:0.06,sz:0.04});}}
  {const b0=333*D,b1=(333+6*2.85)*D;for(let q=0;q<9;q++){const bq=b0+(b1-b0)*q/8;wb('base','#2e3a3a',bq,RO-1.55,3.3,0.1,1.3,2.5);}
    // the mimic: the plant drawn in coloured lines (a line for steam, for water, for oil, for power) with lamps along them
    for(const [hh,c,f] of [[2.9,'#d0d0c8',0.2],[3.18,'#40a060',0.35],[3.46,'#c08020',0.5],[3.74,'#c03020',0.65]])for(let q=0;q<9;q++){const bq=b0+(b1-b0)*q/8;wb('base',c,bq,RO-1.61,hh,0.02,0.06,2.4);if((q+hh*10)%3<1)wb('glow',c,bq,RO-1.62,hh,0.02,0.12,0.12);}
    }
  // a rubber mat in front of the boards, a chair, a log on a stand
  for(let i=0;i<7;i++)wb('base','#24262a',(333+i*2.85)*D,RO-3.2,0.01,1.6,0.02,2.4);
  {const b=338*D;wb('base','#3a4a5a',b,RO-3.4,0.45,0.45,0.08,0.45);wb('base','#3a4a5a',b,RO-3.62,0.75,0.06,0.6,0.45);wv('base','#2a2a2a',b,RO-3.4,0,0.42,0.04,G.cyl6);
    wb('base','#5a4a3a',352*D,RO-3.0,0.6,0.4,1.2,0.5);wb('base','#e0dcc8',352*D,RO-3.0,1.21,0.38,0.02,0.45);}

  // ---------------- the oil: wellhead and pumpjack, separators, the still, day tanks ----------------
  {const b=200*D,r=30;
    wv('base','#4a4440',b,r,0,0.3,0.9,G.disc);
    for(const [h0,h1,rr,c] of [[0.3,0.9,0.32,'#a02818'],[0.9,1.3,0.45,'#5a5e60'],[1.3,1.9,0.32,'#a02818'],[1.9,2.25,0.45,'#5a5e60'],[2.25,2.9,0.28,'#a02818'],[2.9,3.2,0.38,'#5a5e60']])wv('base',c,b,r,h0,h1,rr);
    for(const h of [0.6,1.6]){const [x,z]=W(b,r);for(const sd of [-1,1]){const tx=-Math.sin(b)*sd,tz=Math.cos(b)*sd;k.pipe('base','#5a5e60',x,y0+h,z,x+tx*0.6,y0+h,z+tz*0.6,0.06);
      k.add('base',G.disc,'#b02818',x+tx*0.62,y0+h,z+tz*0.62,{rz:Math.PI/2,ry:-b-Math.PI/2,sx:0.32,sy:0.04,sz:0.32});}}
    {const [x,z]=W(b,r);gauge(x,y0+3.5,z+0.01,-b+Math.PI,0.12);k.pipe('base','#5a5e60',x,y0+3.2,z,x,y0+3.4,z,0.02);}
    wp('base',CRUDE,b,r,1.1,b-0.08,r+0.4,1.1,0.12);wp('base',CRUDE,b-0.08,r+0.4,1.1,175*D,38.6,1.1,0.12);
    // the pumpjack: a base and a samson post, the gearbox; the beam and the crank turn (built below)
    wb('base','#3a3a36',b,r+4.5,0.2,9.5,0.4,2.0);
    for(const sd of [-1,1]){const [x0,z0]=W(b+sd*0.9/(r+3),r+2.8),[x1,z1]=W(b+sd*0.9/(r+5),r+5.0),[xt,zt]=W(b,r+4.0);k.pipe('base','#6a5a3a',x0,y0+0.4,z0,xt,y0+5.8,zt,0.12);k.pipe('base','#6a5a3a',x1,y0+0.4,z1,xt,y0+5.8,zt,0.12);}
    wb('base','#5a5a54',b,r+8,1.0,1.8,1.6,1.4);wb('base',YEL,b,r+8,1.82,1.82,0.06,1.42);
    for(let q=0;q<5;q++)wb('base',q%2?YEL:BLK,b,r+6.8+q*0.5,0.08,0.5,0.16,2.6);
    out.pumpjack={b,r,pivot:[...W(b,r+4.0),y0+5.95],crank:[...W(b,r+8),y0+1.4]};}
  // two separators on saddles, their sight glasses lit, gauges on their heads
  for(const b of [172*D,180*D]){const r=40,[x,z]=W(b,r);k.add('base',G.disc,'#6a6458',x,y0+1.9,z,{rz:Math.PI/2,ry:-b-Math.PI/2,sx:1.1,sy:5,sz:1.1});
    for(const sd of [-1,1]){k.add('base',G.sph,'#6a6458',x-Math.sin(b)*sd*2.5,y0+1.9,z+Math.cos(b)*sd*2.5,{sx:1.1,sy:1.1,sz:1.1});const [sx_,sz_]=[x-Math.sin(b)*sd*1.6,z+Math.cos(b)*sd*1.6];k.add('base',G.box,'#3a3a36',sx_,y0+0.5,sz_,{ry:-b,sx:2.2,sy:1.0,sz:0.4});}
    k.add('glow',G.box,'#d89040',x-Math.cos(b)*1.12,y0+1.8,z-Math.sin(b)*1.12,{ry:-b,sx:0.04,sy:1.1,sz:0.12});k.add('base',G.box,'#2a2a28',x-Math.cos(b)*1.11,y0+1.8,z-Math.sin(b)*1.11,{ry:-b,sx:0.03,sy:1.3,sz:0.22});
    gauge(x-Math.cos(b)*1.13-Math.sin(b)*0.8,y0+2.3,z-Math.sin(b)*1.13+Math.cos(b)*0.8,-b+Math.PI,0.13);
    k.pipe('base',CRUDE,x,y0+3.0,z,x,y0+HT-1.4,z,0.12);}
  // the still: a column of trays, its platforms and a caged ladder; the firebox at its foot; the condenser and drum
  {const b=207*D,r=42,[x,z]=W(b,r);k.add('base',G.disc,'#7a7a72',x,y0+5.8,z,{sx:1.1,sy:11.2,sz:1.1});k.add('base',G.sph,'#7a7a72',x,y0+11.4,z,{sx:1.1,sy:0.5,sz:1.1});
    for(let h=1.2;h<11;h+=1.1)k.add('base',G.disc,'#6a6a62',x,y0+h,z,{sx:1.16,sy:0.06,sz:1.16});
    for(const h of [3.6,7.2,10.4]){k.add('base',K.ring(1.1,2.1,0.08,24),'#4a4e50',x,y0+h,z);for(const hr of [0.5,1.0])k.add('base',K.ring(2.03,2.1,0.05,24),YEL,x,y0+h+hr,z);for(let q=0;q<8;q++){const f=q/8*TAU;k.add('base',G.box,YEL,x+Math.cos(f)*2.06,y0+h+0.5,z+Math.sin(f)*2.06,{sx:0.05,sy:1.0,sz:0.05});}}
    const [lx,lz]=W(b,r+1.3);for(const sd of [-1,1])k.pipe('base','#5a5e60',lx-Math.sin(b)*sd*0.22,y0,lz+Math.cos(b)*sd*0.22,lx-Math.sin(b)*sd*0.22,y0+11,lz+Math.cos(b)*sd*0.22,0.03);
    for(let h=0.3;h<11;h+=0.3)k.add('base',G.box,'#5a5e60',lx,y0+h,lz,{ry:-b,sx:0.04,sy:0.04,sz:0.46});
    for(let h=2.5;h<11;h+=0.9)k.add('base',K.ring(0.5,0.54,0.05,10),'#5a5e60',lx+Math.cos(b)*0.3,y0+h,lz+Math.sin(b)*0.3);
    wb('base','#4a4440',b,r-2.2,0.9,2.2,1.8,2.0);wb('glow','#ff8030',b,r-3.31,0.7,0.02,0.5,0.9);wb('base','#2a2624',b,r-3.32,0.7,0.02,0.62,1.04);
    wp('base','#5a4a3a',b,r-2.2,1.8,b,r-2.2,HT-0.2,0.25);
    k.add('base',G.disc,'#6a6a62',...W(b+5*D,r-1.5).flatMap((v,i)=>i?[v]:[v,y0+9.2]),{rz:Math.PI/2,ry:-b,sx:0.6,sy:3.4,sz:0.6});
    wp('base',STEAM,b,r,11.2,b+5*D,r-1.5,9.8,0.12);wp('base',OIL,b+5*D,r-1.5,8.6,b+5*D,r-1.5,1.6,0.1);}
  // three fuel day tanks on legs, each with a lit sight glass and a level scale
  for(let i=0;i<3;i++){const b=(226+i*5)*D,r=44,[x,z]=W(b,r);k.add('base',G.disc,['#7a6a4a','#6a6a5a','#7a5a3a'][i],x,y0+3.0,z,{sx:1.2,sy:4.4,sz:1.2});k.add('base',G.sph,'#5a5a4a',x,y0+5.2,z,{sx:1.2,sy:0.35,sz:1.2});
    for(let q=0;q<4;q++){const f=q/4*TAU+0.4;k.add('base',G.box,'#3a3a36',x+Math.cos(f)*1.0,y0+0.4,z+Math.sin(f)*1.0,{sx:0.15,sy:0.8,sz:0.15});}
    const lv=1.2+[2.6,1.4,3.2][i];k.add('base',G.box,'#1e1e1e',x-Math.cos(b)*1.22,y0+3.0,z-Math.sin(b)*1.22,{ry:-b,sx:0.04,sy:4.0,sz:0.2});
    k.add('glow',G.box,'#d89040',x-Math.cos(b)*1.24,y0+1.0+(lv-1.0)/2,z-Math.sin(b)*1.24,{ry:-b,sx:0.03,sy:lv-1.0,sz:0.1});
    for(let h=1.2;h<5;h+=0.5)k.add('base',G.box,'#e0dcc8',x-Math.cos(b)*1.25-Math.sin(b)*0.13,y0+h,z-Math.sin(b)*1.25+Math.cos(b)*0.13,{ry:-b,sx:0.02,sy:0.03,sz:0.08});
    wp('base',OIL,b,r,0.9,b,37.8,0.9,0.09);}
  // ---------------- the pipe rack: from the oil round to the set, five lines, banded and valved ----------------
  {const LN=[[36.3,4.9,CRUDE,'#c8c8c0'],[36.9,4.9,OIL,'#e0e0d8'],[37.5,4.9,WATER,'#3070c0'],[38.1,4.9,STEAM,'#c03020'],[37.0,5.9,GAS,'#1e1e1e']];
    for(let bd=205;bd<=268;bd+=7){const b=bd*D;for(const r of [35.9,38.5])wv('base','#4a4c4e',b,r,0,6.2,0.12,G.box);wb('base','#4a4c4e',b,37.2,4.65,2.8,0.18,0.18);wb('base','#4a4c4e',b,37.2,5.65,2.8,0.18,0.18);
      for(const [r,h,c,band] of LN){const [x,z]=W(b+0.6*D,r);k.add('base',G.cyl,band,x,y0+h,z,{rz:Math.PI/2,ry:-b-Math.PI/2,sx:0.2,sy:0.35,sz:0.2});
        if(bd<268)wp('base',c,b,r,h,b+7*D,r,h,0.15);}
      if(bd%14===2){const [x,z]=W(b+3.5*D,36.9);k.add('base',G.cyl,'#5a5e60',x,y0+5.25,z,{sx:0.1,sy:0.6,sz:0.1});k.add('base',G.disc,'#b02818',x,y0+5.58,z,{sx:0.35,sy:0.04,sz:0.35});}
      if(bd%21===2){const [x,z]=W(b+2*D,35.9);gauge(x,y0+5.3,z,-b+Math.PI,0.11);}}
    // and the lines' drops to the set's front
    wp('base',STEAM,268*D,38.1,4.9,272*D,33.5,4.9,0.15);wp('base',OIL,268*D,36.9,4.9,275*D,31,1.8,0.12);}

  // ---------------- benches, tools, spares, drums ----------------
  for(let i=0;i<3;i++){const b=(150+i*7)*D,r=RO-2.2;wb('base','#5a4a38',b,r,0.88,1.0,0.08,2.6);for(const sd of [-1,1])for(const dr of [-0.4,0.4]){const [x,z]=W(b+sd*1.15/r,r+dr);k.add('base',G.box,'#3a3632',x,y0+0.43,z,{sx:0.08,sy:0.86,sz:0.08});}
    wb('base','#3a3e42',b+0.8/r,r-0.2,1.05,0.3,0.24,0.24);wb('base','#2a2c2e',b+0.8/r,r-0.4,1.12,0.1,0.08,0.3);
    for(let q=0;q<4;q++)wb('base',['#5a5e62','#8a3a28','#3a4a6a','#6a6e72'][q],b+(q-1.5)*0.45/r,r+0.1,0.97,0.3,0.06,0.12+q*0.04);
    // a board of tools on the wall behind
    wb('base','#6a5e4a',b,RO-0.6,1.8,0.04,1.2,2.4);for(let q=0;q<9;q++){const bq=b+(q-4)*0.25/r;wb('base',['#4a4e52','#7a3a28','#2a2c2e'][q%3],bq,RO-0.66,1.6+(q%2)*0.4,0.03,0.35+(q%3)*0.1,0.05);}}
  for(let i=0;i<4;i++){const b=(171+i*3.6)*D,r=RO-1.0;wb('base','#4a4c4e',b,r,1.3,0.7,2.6,0.05);
    for(const h of [0.25,0.95,1.65,2.35]){wb('base','#5a5c5e',b,r,h,0.7,0.04,2.6);for(let q=0;q<5;q++){const bq=b+(q-2)*0.48/r;
      if((q+i+h*10)%3<1)k.add('base',G.disc,'#6a6e72',...W(bq,r).flatMap((v,j)=>j?[v]:[v,y0+h+0.2]),{rz:Math.PI/2,ry:-b,sx:0.18,sy:0.06,sz:0.18});
      else wb('base',['#8a6a3a','#5a6a7a','#7a7a6a'][q%3],bq,r,h+0.14,0.5,0.24,0.34);}}}
  for(let i=0;i<14;i++){const b=(184+(i%7)*2.0)*D,r=RO-2.4-Math.floor(i/7)*0.75;wv('base',['#2a4a7a','#8a2a1e','#3a5a3a','#5a5a5a'][i%4],b,r,0,0.9,0.3);wv('base','#1e1e1e',b,r,0.9,0.92,0.31,G.cyl6);}
  // oil stains on the floor, worst round the set and the pumps; painted walkways and warnings
  for(let i=0;i<46;i++){const near=i<22,[x,z]=near?P(-14+R()*28,(R()<0.5?-1:1)*(3.6+R()*3)):W(R()*TAU,RS+3+R()*(RO-RS-6));k.add('base',G.disc,R()<0.5?'#2a2420':'#3a322a',x,y0+0.012+i*0.0003,z,{sx:0.4+R()*1.4,sy:0.01,sz:0.3+R()*1.0,ry:R()*3});}
  for(const w of [-4.6,4.6])tb('base',YEL,-0.5,w,0.01,31,0.02,0.12);for(const s of [-15.4,14.6])tb('base',YEL,s,0,0.01,0.12,0.02,9.3);
  for(let i=0;i<6;i++){const s=-13+i*5,w=i%2?4.95:-4.95;tb('base',YEL,s,w,0.012,1.2,0.02,0.6);for(let q=0;q<3;q++)tb('base',BLK,s-0.4+q*0.4,w,0.014,0.12,0.02,0.6,{ry:-ua+0.6});}

  // ---------------- the steam side: the boiler that raises the steam the turbine runs on ----------------
  // drawn after real packaged water-tube boilers: a long clad block on a plinth (the furnace and the tube bank inside),
  // the steam drum along its top with domed ends, the burner in its front wall with the oil gun, the scanner and the
  // windbox, the forced-draught fan beside it, the flue trunk from its far end up into the ceiling, black with soot
  const wt=(key,col,b,r,h,rad,len,geo=G.cyl)=>{const [x,z]=W(b,r);k.add(key,geo,col,x,y0+h,z,{rx:Math.PI/2,ry:-b,sx:rad,sy:len,sz:rad});};
  const at=(b,r,d)=>b+d/r;   // an angle d metres further round at radius r
  {const bB=50*D,rB=34,L=11;
    wb('base','#6a6660',bB,rB,0.15,5.8,0.3,L+1.4);wb('base','#c8a03a',bB,rB,0.32,5.82,0.04,L+1.42);
    wb('base','#a6aaac',bB,rB,3.25,4.6,5.8,L);                                   // the cladding
    for(let q=0;q<=Math.round(L/1.2);q++){const bq=at(bB,rB,-L/2+q*1.2);wb('base','#8a8e90',bq,rB,3.25,4.64,5.8,0.06);}   // its seams
    for(const hh of [1.4,3.3,5.1])wb('base','#8a8e90',bB,rB,hh,4.64,0.05,L+0.02);
    // patches riveted over the cladding where it has been opened and closed again, a different shade each
    for(let q=0;q<5;q++){const bq=at(bB,rB,-L/2+1+R()*(L-2)),hh=1+R()*4;wb('base',['#9a9a92','#b4b4ac','#8e9490'][q%3],bq,rB-2.33,hh,0.03,0.6+R()*0.6,0.8+R()*1.2);}
    wt('base','#b8bcbe',bB,rB+0.7,6.75,0.8,L+0.6);                              // the steam drum
    for(const sd of [-1,1]){const [x,z]=W(at(bB,rB+0.7,sd*(L/2+0.3)),rB+0.7);k.add('base',G.sph,'#b0b4b6',x,y0+6.75,z,{sx:0.8,sy:0.8,sz:0.8});}
    wt('base','#7a7e80',bB,rB-1.4,0.9,0.55,L+0.4);                              // the mud drum, under the bank
    // the downcomers at the far end, outside the casing; the safety valves on the drum and their vent pipes up
    for(const dr of [-1.6,1.6]){const bq=at(bB,rB,L/2+0.25);wv('base','#8a8e90',bq,rB+dr*0.5,0.9,6.75,0.16);}
    for(const dd of [-3,-1.6]){const bq=at(bB,rB+0.7,dd);wv('base','#c03020',bq,rB+0.7,7.5,8.0,0.14);wv('base','#6a6e70',bq,rB+0.7,8.0,HT,0.08);}
    // the gauge glass on the drum's front end, lit from behind; the drum's pressure gauge
    {const bq=at(bB,rB+0.7,-L/2-0.95),[x,z]=W(bq,rB+0.7);k.add('glow',G.box,'#ffd890',x,y0+6.75,z,{ry:-bB,sx:0.08,sy:0.7,sz:0.08});gauge(x,y0+7.6,z,-bB+Math.PI/2,0.24,-1.1,0.5,0.1,0.3);}
    // the front wall: the burner in its refractory, the windbox round it, the oil gun and its hose, the scanner
    {const bf=at(bB,rB,-L/2-0.05);
      const [fx,fz]=W(bf,rB);const ff=(r,h,rad,len,col,key='base')=>{const bq=at(bf,rB,-len/2);const [x,z]=W(bq,r);k.add(key,G.cyl,col,x,y0+h,z,{rx:Math.PI/2,ry:-bB,sx:rad,sy:len,sz:rad});};
      wb('base','#6a5a4a',bf,rB,2.4,2.4,2.4,0.4);                               // the windbox
      ff(rB,2.4,0.95,0.5,'#4a4a48');ff(rB,2.4,0.7,0.6,'#2a2624');ff(rB,2.4,0.5,0.65,'#ff8030','glow');   // the throat, glowing
      ff(rB+0.4,2.4,0.06,1.6,'#9a9a94');ff(rB-0.6,3.0,0.08,0.5,'#3a5a6a');      // the oil gun; the flame scanner
      for(let q=0;q<6;q++){const a2=q/6*TAU,[x,z]=W(at(bf,rB,-0.3),rB+Math.cos(a2)*1.15);k.add('base',G.box,'#3a3230',x,y0+2.4+Math.sin(a2)*1.15,z,{ry:-bB,sx:0.5,sy:0.5,sz:0.06});}  // spalled refractory
      const [gx,gz]=W(at(bf,rB,-0.8),rB+0.4);k.pipe('base','#1e1e1c',gx,y0+2.4,gz,gx,y0+0.3,gz,0.05);   // the oil hose down to the floor
      wp('base','#c8a020',at(bf,rB,-0.8),rB+0.4,0.3,at(bf,rB,-0.8),rB+6,0.3,0.06);  // and on round to the day tanks (yellow: fuel)
      // the forced-draught fan: a scroll housing, its motor, the duct into the windbox
      const bfan=at(bf,rB,-2.6);wv('base','#5a6a6a',bfan,rB+1.2,0.3,2.8,1.25,G.disc);wb('base','#4a5a5a',bfan,rB+2.7,0.9,1.4,1.2,1.0);wb('base','#c8a03a',bfan,rB+2.0,0.9,0.35,0.9,0.9);
      wp('base','#5a6a6a',bfan,rB+1.2,2.2,at(bf,rB,-0.4),rB+0.4,3.4,0.45);}
    // the flue trunk from the far end, black with soot, a damper with its quadrant handle, up into the ceiling
    {const bq=at(bB,rB,L/2-1);wb('base','#2a2826',bq,rB-0.8,(6.2+HT)/2+1,1.6,HT-6.2,1.6);wb('base','#1a1816',bq,rB-0.8,6.3,1.8,0.3,1.8);
      wb('base','#3a3634',bq,rB-0.8,9.2,1.7,0.12,1.7);{const [x,z]=W(bq,rB+0.1);k.add('base',G.box,'#c03020',x,y0+9.2,z,{ry:-bB,sx:0.06,sy:0.06,sz:0.6,rz:0.5});}}
    // a stair and a platform along the drum for the man who reads the glass and blows down the gauges
    for(let q=0;q<10;q++){const bq=at(bB,rB+3.0,-L/2+q*0.32);wb('base','#4a4c4e',bq,rB+3.0,0.3+q*0.6,0.9,0.05,0.3);}
    wb('base','#4a4c4e',bB,rB+2.7,6.0,1.2,0.08,L-3);wb('base','#c8a03a',bB,rB+3.25,7.05,0.06,0.06,L-3);wb('base','#c8a03a',bB,rB+3.25,6.55,0.05,0.05,L-3);
    for(let q=0;q<6;q++){const bq=at(bB,rB+3.25,-L/2+1.5+q*(L-3)/5);wb('base','#c8a03a',bq,rB+3.25,6.55,0.06,1.05,0.06);}
    // the steam main: from the drum's top up under the ceiling and round the hall to the turbine's stop valves,
    // clad in aluminium, hung on spring hangers, with an expansion loop where it turns; green-banded water beside it
    {const hS=HT-1.6,rS=41,b0=at(bB,rB+0.7,1),pts=[];wv('base','#c4c8cc',b0,rB+0.7,7.4,hS,0.3);wp('base','#c4c8cc',b0,rB+0.7,hS,b0,rS,hS,0.3);
      for(let d=50;d>=-28;d-=6)pts.push(d*D);
      for(let q=0;q<pts.length-1;q++){wp('base','#c4c8cc',pts[q],rS,hS,pts[q+1],rS,hS,0.3);
        const [x,z]=W(pts[q],rS);k.pipe('base','#3a3a38',x,y0+hS+0.3,z,x,y0+HT,z,0.025);k.add('base',G.cyl6,'#4a6a8a',x,y0+hS+0.7,z,{sx:0.08,sy:0.4,sz:0.08});
        if(q%3===1)for(const sd of [-1,1])wb('base','#6aa06a',pts[q],rS,hS,0.62,0.12,0.12,{ry:-pts[q]+sd*0.001});}
      const bl=10*D;wp('base','#c4c8cc',bl-0.05,rS,hS,bl-0.05,rS-3,hS,0.3);wp('base','#c4c8cc',bl+0.05,rS,hS,bl+0.05,rS-3,hS,0.3);wp('base','#c4c8cc',bl-0.05,rS-3,hS,bl+0.05,rS-3,hS,0.3);
      wp('base','#c4c8cc',pts[pts.length-1],rS,hS,pts[pts.length-1],rS-4,hS,0.3);
      // the feedwater back: green-banded, from the pumps under the deaerator to the boiler, low along the floor
      wp('base','#5a7a5a',25*D,37,0.5,bB-6.2/rB,rB+1.6,0.5,0.12);wp('base','#5a7a5a',bB-6.2/rB,rB+1.6,0.5,bB-6.2/rB,rB+1.6,6.75,0.12);}}

  // ---------------- the deaerator, high on its frame, and the feed pumps under it ----------------
  // the feed pumps take their water from the deaerator high above them, so it never boils in them: a long tank on a
  // platform nine metres up, a vent stub steaming from its top, two pumps on the floor below (one runs, one stands by)
  {const bD=24*D,rD=37,Ld=8,hD=9.1;
    for(const dr of [-1.5,1.5])for(const dd of [-3.4,0,3.4]){const bq=at(bD,rD,dd);wv('base','#4a4c4e',bq,rD+dr,0,hD-0.9,0.12,G.box);}
    for(const dd of [-3.4,3.4]){const bq=at(bD,rD,dd);wp('base','#4a4c4e',bq,rD-1.5,0.5,bq,rD+1.5,hD-1.4,0.06);}
    wb('base','#4a4c4e',bD,rD,hD-0.9,3.6,0.12,Ld+1.4);wb('base','#c8a03a',bD,rD-1.85,hD-0.84,0.06,0.18,Ld+1.4);wb('base','#c8a03a',bD,rD+1.85,hD-0.84,0.06,0.18,Ld+1.4);
    for(const dr of [-1.85,1.85]){wb('base','#c8a03a',bD,rD+dr,hD+0.2,0.06,0.06,Ld+1.4);for(let q=0;q<6;q++)wb('base','#c8a03a',at(bD,rD,-Ld/2-0.7+q*(Ld+1.4)/5),rD+dr,hD-0.3,0.06,1.1,0.06);}
    for(let q=0;q<4;q++)wb('base','#2a2a28',at(bD,rD,-Ld/2+1+q*2),rD,hD-0.7,3.2,0.35,0.3);   // saddles
    wt('base','#b4b8ba',bD,rD,hD+0.6,1.25,Ld);for(const sd of [-1,1]){const [x,z]=W(at(bD,rD,sd*Ld/2),rD);k.add('base',G.sph,'#acb0b2',x,y0+hD+0.6,z,{sx:1.25,sy:1.25,sz:0.5});}
    wv('base','#b4b8ba',at(bD,rD,-1.5),rD,hD+1.6,hD+3.0,0.55);wv('base','#8a8e90',at(bD,rD,-1.5),rD,hD+3.0,hD+3.5,0.12);   // the heater dome and its vent
    {const [x,z]=W(at(bD,rD,-1.5),rD);k.add('base',G.box,'#ffd070',x,y0+hD+1.0,z,{ry:-bD,sx:0.06,sy:0.5,sz:0.06});}
    // a caged ladder up to the platform
    {const bq=at(bD,rD,Ld/2+1.2);for(const dd of [-0.25,0.25])wv('base','#c8a03a',at(bq,rD,dd),rD+1.6,0,hD,0.03,G.box);for(let y=0.3;y<hD;y+=0.3)wb('base','#c8a03a',bq,rD+1.6,y,0.04,0.04,0.5);
      for(let y=2.4;y<hD+1;y+=0.9)k.add('base',K.ring(0.36,0.4,0.04,12,0,Math.PI),'#c8a03a',...(([x,z])=>[x,y0+y,z])(W(bq,rD+1.95)));}
    // the feed pumps: motor, a yellow guard over the coupling, the multistage pump, suction down from the tank
    for(const dd of [-1.6,1.6]){const bq=at(bD,rD,dd);wb('base','#3a3c3e',bq,rD,0.2,1.0,0.4,3.6);
      wt('base','#4a6a8a',at(bq,rD,1.0),rD,0.85,0.38,1.4);wb('base','#c8a03a',at(bq,rD,0),rD,0.85,0.6,0.6,0.5);wt('base','#5a7a5a',at(bq,rD,-1.0),rD,0.85,0.34,1.6);
      for(let q=0;q<4;q++)wt('base','#4e6e4e',at(bq,rD,-0.4-q*0.38),rD,0.85,0.4,0.08);
      wv('base','#5a7a5a',at(bq,rD,-1.6),rD,0.85,hD,0.1);{const [x,z]=W(at(bq,rD,-1.6),rD-0.12);gauge(x,y0+1.7,z,-bD+Math.PI,0.15,-1.1,0.55,0.15,0.6);}
      wb('base','#2a2a26',bq,rD,0.02,1.4,0.03,3.8);wb('base','#1a1a18',bq,rD+0.2,0.035,0.6,0.01,1.0);}   // its drip tray and stain
    wb('glow','#70ff90',at(bD,rD,-1.6),rD-0.62,1.4,0.03,0.08,0.08);wb('base','#3a3a3a',at(bD,rD,1.6),rD-0.62,1.4,0.03,0.08,0.08);}  // the one running lit

  // ---------------- the standby engine: a diesel set in its own bay behind a wall ----------------
  {const bG=86*D,rG=43,Lg=10;
    for(const dd of [-Lg/2-1.2,Lg/2+1.2]){const bq=at(bG,rG,dd);wb('base','#7a7670',bq,rG-0.5,2.4,6.5,4.8,0.3);}
    wb('base','#6a6660',bG,rG,0.15,3.0,0.3,Lg);wb('base','#c8a03a',bG,rG,0.32,3.02,0.04,Lg+0.02);
    wb('base','#4a5a52',at(bG,rG,-1.2),rG,1.6,1.7,2.6,6.0);                     // the engine block
    for(let q=0;q<8;q++)wv('base','#3e4a44',at(bG,rG,-3.8+q*0.75),rG,2.9,3.2,0.22,G.cyl6);   // the heads
    wt('base','#5a6a62',at(bG,rG,3.3),rG,1.6,1.1,2.8);wb('base','#4a5a52',at(bG,rG,3.3),rG+0.9,1.0,0.6,1.2,1.4);   // the generator and its box
    wb('base','#c8a03a',at(bG,rG,1.85),rG,1.6,1.8,1.6,0.3);
    // the exhaust, lagged in pale cloth, up to a silencer hung under the ceiling and off into the wall
    {const be=at(bG,rG,-2.5);wv('base','#c8c0b0',be,rG-0.6,3.0,HT-2.2,0.28);wt('base','#b8b0a0',bG,rG-0.6,HT-1.6,0.7,4.0);wp('base','#c8c0b0',at(bG,rG-0.6,2),rG-0.6,HT-1.6,at(bG,rG-0.6,2),RO,HT-1.6,0.28);}
    // its fuel: a heated day tank with a sight glass, the purifier beside it, the line in
    {const bq=at(bG,rG,-Lg/2+0.4);wv('base','#7a7068',bq,rG+1.8,0,2.6,0.75);wb('glow','#ffb050',bq,rG+1.05,1.4,0.04,1.4,0.1);
      wv('base','#8a8a84',at(bq,rG,1.2),rG+1.8,0,1.3,0.35);wv('base','#6a6a64',at(bq,rG,1.2),rG+1.8,1.3,1.6,0.42,G.cone);
      wp('base','#c8a020',bq,rG+1.8,0.4,at(bG,rG,-3),rG+0.9,0.6,0.05);}
    // a hand-lettered board on its wall: when it last ran, kept in chalk
    wb('base','#2a3a2e',at(bG,rG,-Lg/2-1.05),rG,1.7,1.2,0.8,0.04);for(let q=0;q<4;q++)wb('base','#d8d4c8',at(bG,rG,-Lg/2-1.08),rG-0.2+((q*7)%5)*0.1-0.2,1.5+q*0.13,0.6-q*0.08,0.025,0.02);}

  // ---------------- the annunciator over the boards: rows of lit windows, one for each thing that can go wrong ----
  {const b0=333*D,b1=(333+6*2.85)*D;for(let q=0;q<9;q++){const bq=b0+(b1-b0)*q/8;wb('base','#3a4646',bq,RO-1.5,4.35,0.25,0.75,2.5);
      for(let c=0;c<8;c++)for(let rr=0;rr<3;rr++){const on=((q*29+c*7+rr*13)%11)<2,bc=bq+(c-3.5)*0.28/(RO-1.6);wb(on?((q+c)%3?'glow':'blink'):'base',on?(rr===0?'#ff6a50':'#ffe0a0'):'#c8c0a8',bc,RO-1.64,4.1+rr*0.24,0.02,0.18,0.24);}}
    // and the strip-chart recorders let into the boards, their paper creeping out from under them
    for(let i=0;i<7;i++){const b=(333+i*2.85)*D,r=RO-1.3;for(const sd of [-0.55,0.55]){const bq=b+sd/r;wb('base','#e8e4d6',bq,r-0.29,1.22,0.02,0.3,0.36);wb('base','#7a2a2a',bq,r-0.3,1.22,0.02,0.22,0.01,{rz:0.4});}}}

  // ---------------- caged lamps hung from the ceiling, and work lamps on stands ----------------
  const lampAt=(x,z,h)=>{k.pipe('base','#2a2a28',x,y0+HT,z,x,y0+h+0.35,z,0.02);k.add('base',G.cone,'#3a3c3e',x,y0+h+0.32,z,{sx:0.42,sy:0.25,sz:0.42});
    k.add('lamp',G.cyl,'#ffb860',x,y0+h,z,{sx:0.2,sy:0.36,sz:0.2});for(let q=0;q<5;q++){const f=q/5*TAU;k.add('base',G.box,'#2a2a28',x+Math.cos(f)*0.27,y0+h,z+Math.sin(f)*0.27,{sx:0.025,sy:0.5,sz:0.025});}
    k.add('base',K.ring(0.25,0.29,0.03,10),'#2a2a28',x,y0+h-0.24,z);};
  for(let i=0;i<10;i++){const b=(i+0.5)/10*TAU;lampAt(...W(b,22),HT-2.2);}
  for(let i=0;i<14;i++){const b=(i+0.25)/14*TAU;lampAt(...W(b,40),HT-1.9);}
  for(const [b,r] of [[196,26],[214,38],[338,44]]){const [x,z]=W(b*D,r);for(let q=0;q<3;q++){const f=q/3*TAU;k.pipe('base','#3a3a36',x+Math.cos(f)*0.6,y0,z+Math.sin(f)*0.6,x,y0+2.6,z,0.03);}
    k.add('base',G.box,'#3a3a36',x,y0+2.75,z,{sx:0.5,sy:0.35,sz:0.4,ry:-b*D});k.add('lamp',G.box,'#fff0d0',x-Math.cos(b*D)*0.21,y0+2.75,z-Math.sin(b*D)*0.21,{ry:-b*D,sx:0.03,sy:0.28,sz:0.34});}

  // ---------------- painted warnings: a small atlas of signs, in this project's own words ----------------
  {const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
    const T=[['HIGH VOLTAGE','KEEP CLEAR'],['HOT SURFACE','DO NOT TOUCH'],['HEARING','PROTECTION'],['NO NAKED','FLAME']];
    T.forEach(([l1,l2],i)=>{const cx=(i%2)*256,cy=Math.floor(i/2)*128;x.fillStyle=i===0?'#d8aa1c':i===1?'#c84a20':i===2?'#2a5a8a':'#c83020';x.fillRect(cx+4,cy+4,248,120);
      x.fillStyle='rgba(0,0,0,0.18)';for(let q=0;q<10;q++)x.fillRect(cx+4+((i*53+q*37)%230),cy+8+((i*29+q*17)%100),4+q%5,3);
      x.fillStyle=i===0?'#1a1a1a':'#f0ece0';x.font='bold 30px monospace';x.textAlign='center';x.fillText(l1,cx+128,cy+56);x.font='bold 24px monospace';x.fillText(l2,cx+128,cy+94);});
    const pos=[],uv=[];const sign=(cx,cy,cz,ny,i,w=1.6,h=0.8)=>{const nx=Math.cos(ny),nz=Math.sin(ny),tx=-nz,tz=nx,u0=(i%2)/2,v1=1-Math.floor(i/2)/2,v0=v1-0.5;
      const L=[cx+tx*w/2,cz+tz*w/2],Rr=[cx-tx*w/2,cz-tz*w/2];
      pos.push(L[0],cy,L[1],Rr[0],cy,Rr[1],Rr[0],cy+h,Rr[1],L[0],cy,L[1],Rr[0],cy+h,Rr[1],L[0],cy+h,L[1]);uv.push(u0,v0,u0+0.5,v0,u0+0.5,v1,u0,v0,u0+0.5,v1,u0,v1);};
    // signs face the hall's middle (their normal points inward: toward the axis)
    const onWall=(bd,h,i)=>{const b=bd*D,[x_,z_]=W(b,RO-0.25);sign(x_,y0+h,z_,b+Math.PI,i);};
    onWall(250,2.9,0);onWall(258,2.9,0);onWall(345,4.5,2);onWall(160,2.6,3);onWall(212,2.4,3);onWall(290,2.6,2);
    {const [x_,z_]=P(-4,-2.95);sign(x_,y0+5.3,z_,a+Math.PI,1,1.4,0.7);}{const [x_,z_]=P(-4,2.95);sign(x_,y0+5.3,z_,a,1,1.4,0.7);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
    out.group.add(new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide,clippingPlanes:clip})));}

  for(const [key,g] of Object.entries(k.build()))out.group.add(new THREE.Mesh(g,matFor(key)));

  // ---------------- the moving parts ----------------
  const M=c=>new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:clip});
  // the rotor: shaft ends, the coupling and its bolts, the exciter's fan; built along x, turned about x
  {const r=K.kit(),ax={rz:Math.PI/2};
    r.add('m',G.cyl,'#8a8e90',-13.9-0.4,0,0,Object.assign({sx:0.32,sy:1.4,sz:0.32},ax));r.add('m',G.cyl,'#8a8e90',2.1,0,0,Object.assign({sx:0.46,sy:2.4,sz:0.46},ax));
    for(const s of [1.85,2.35])r.add('m',G.disc,'#5a5e62',s,0,0,Object.assign({sx:1.0,sy:0.22,sz:1.0},ax));
    for(let i=0;i<8;i++){const f=i/8*TAU;r.add('m',G.cyl6,'#2a2a2a',2.1,Math.cos(f)*0.78,Math.sin(f)*0.78,Object.assign({sx:0.07,sy:0.75,sz:0.07},ax));}
    r.add('m',G.box,YEL,2.1,0.98,0,{sx:0.5,sy:0.06,sz:0.25});r.add('m',G.box,'#f0ece0',2.1,0,0.47,{sx:2.0,sy:0.1,sz:0.02});
    r.add('m',G.cyl,'#8a8e90',13.4,0,0,Object.assign({sx:0.3,sy:1.4,sz:0.3},ax));r.add('m',G.disc,'#4a4e50',14.05,0,0,Object.assign({sx:0.95,sy:0.08,sz:0.95},ax));
    for(let i=0;i<6;i++){const f=i/6*TAU;r.add('m',G.box,'#6a6e70',14.1,Math.cos(f)*0.5,Math.sin(f)*0.5,{rx:f,sx:0.06,sy:0.85,sz:0.3});}
    const rot=new THREE.Mesh(r.build().m,M());const hold=new THREE.Group();const [x,z]=P(0,0);hold.position.set(x,y0+HC,z);hold.rotation.y=-ua;hold.add(rot);out.group.add(hold);out.rotor=rot;}
  // the pumpjack's beam (and horsehead, bridle and the pitman arms hung from its tail) and its crank
  {const pj=out.pumpjack,r=K.kit();r.add('m',G.box,'#7a6a3a',0,0.35,0,{sx:8.4,sy:0.55,sz:0.45});
    for(let q=0;q<5;q++){const f=(q-2)*0.22;r.add('m',G.box,'#8a7a40',-4.2-Math.cos(f)*0.1+0.0,0.35+Math.sin(f)*1.0,0,{rz:f,sx:0.4,sy:0.5,sz:0.5});}
    r.add('m',G.cyl6,'#2a2a28',-4.45,-1.2,0,{sx:0.025,sy:2.6,sz:0.025});r.add('m',G.cyl6,'#c8c8c0',-4.45,-2.75,0,{sx:0.05,sy:0.5,sz:0.05});
    for(const sd of [-1,1])r.add('m',G.box,'#6a5a3a',4.0,-2.2,sd*0.5,{sx:0.15,sy:4.4,sz:0.12});
    const beam=new THREE.Mesh(r.build().m,M()),hb=new THREE.Group();hb.position.set(...[pj.pivot[0],pj.pivot[2],pj.pivot[1]]);hb.rotation.order='YXZ';hb.rotation.y=-pj.b;hb.add(beam);out.group.add(hb);
    const c=K.kit();for(const sd of [-1,1]){c.add('m',G.box,'#5a5a54',0,-0.6,sd*1.05,{sx:0.5,sy:1.6,sz:0.12});c.add('m',G.box,'#3a3a36',0,-1.3,sd*1.12,{sx:1.6,sy:0.9,sz:0.15});}
    const crank=new THREE.Mesh(c.build().m,M()),hc=new THREE.Group();hc.position.set(pj.crank[0],pj.crank[2],pj.crank[1]);hc.rotation.y=-pj.b;hc.add(crank);out.group.add(hc);
    out.beam=beam;out.crank=crank;}
  // the needles: one instanced mesh, every gauge's needle turned each frame
  {const g=new THREE.BoxGeometry(1,1,1).translate(0,0.5,0);out.needleMesh=new THREE.InstancedMesh(g,new THREE.MeshBasicMaterial({color:'#b01808',clippingPlanes:clip}),out.needles.length);
    out.needleMesh.frustumCulled=false;out.group.add(out.needleMesh);}
  // steam and heat: soft puffs rising off the valves, the still's top and the casing
  {const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(255,250,240,0.6)');gr.addColorStop(1,'rgba(255,250,240,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
    const tex=new THREE.CanvasTexture(c),src=[[...P(-12,-2.6),y0+7.6],[...P(-12,2.6),y0+7.6],[...P(-9,0),y0+HC+1.6],[...P(-2,0),y0+HC+3],[...W(207*D,42),y0+11.8],[...W(207*D,39.8),y0+2]];
    out.puffs=[];for(let i=0;i<18;i++){const m=new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0,clippingPlanes:clip});const sp=new THREE.Sprite(m);sp.userData={src:src[i%src.length],ph:i/18};out.group.add(sp);out.puffs.push(sp);}}
  // a few people at work, in overalls
  {const spots=[[...W(336*D,RO-3.6),338*D],[...W(344*D,RO-3.6),344*D],[...P(-1.5,-5.8),a+Math.PI],[...W(200*D,31.2),200*D+Math.PI],[...W(157*D,RO-3.4),157*D],[...W(250*D,RO-3.0),250*D],[...P(8,-5.2),ua+Math.PI]];
    const im=new THREE.InstancedMesh(personGeo(K),new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:clip}),spots.length),o=new THREE.Object3D(),c=new THREE.Color();
    spots.forEach(([x,z,f],i)=>{o.position.set(x,y0+(i===6?6.04:0),z);o.rotation.set(0,-f,0);o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,c.set(['#2e4a6a','#a85a20','#4a4a3a','#3a5a7a'][i%4]));});
    im.frustumCulled=false;out.group.add(im);}

  // ---- each frame: the rotor turns at the generator's speed, the pumpjack nods, needles move, steam rises ----
  const o=new THREE.Object3D();o.rotation.order='YXZ';let ca=0;
  out.tick=(t,dt,run)=>{out.rotor.rotation.x+=dt*run*15;ca+=dt*run*0.9;out.crank.rotation.z=-ca;out.beam.rotation.z=0.24*Math.sin(ca);
    out.needles.forEach((n,i)=>{const th=n.rest+(n.base-n.rest+n.amp*Math.sin(t*n.f+n.ph)*0.3+Math.sin(t*9+i)*0.01)*run;
      o.position.set(n.x,n.y,n.z);o.rotation.set(th,n.ry,0);o.scale.set(0.012,n.len,0.025);o.updateMatrix();out.needleMesh.setMatrixAt(i,o.matrix);});
    out.needleMesh.instanceMatrix.needsUpdate=true;
    for(const sp of out.puffs){const u=(t*0.18+sp.userData.ph)%1,[sx,sz,sy]=sp.userData.src;sp.position.set(sx+Math.sin(u*5+sp.userData.ph*9)*0.4,sy+u*3.2,sz+Math.cos(u*4)*0.3);
      const s=0.6+u*2.6;sp.scale.set(s,s,1);sp.material.opacity=0.22*Math.sin(u*Math.PI)*(0.3+0.7*run);}};
  out.HC=HC;out.axis={x:P(0,0)[0],z:P(0,0)[1],a,ua};
  return out;}
