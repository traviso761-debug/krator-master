// ---------- the second pass: what the layers are furnished with, and what the Megastructure is made of ----------
// city.js lays out the big masses of each layer. This adds what is on them and between them, and gives the
// Megastructure a structure of its own rather than being five flat slabs:
//
//   the trunks     three columns of Megastructure a couple of kilometres across that go through every layer and
//                  every slab, up and down past the ends of the block, with plinths where they meet a floor and
//                  haunches where they meet a ceiling. They are what holds the stack up, and in the section
//                  they are the black verticals the black horizontals hang from.
//   the beams      ribs under every ceiling on the 1,600 m seams, tens to hundreds of metres deep, and lighter
//                  ones on the 400 m seams under the tall layers; they stop at the holes and the trunks
//   the plating    low plates and kerbs laid over the floors along the seams
//   the collars    rings round every hole, standing on the floor and hanging under the ceiling; ledges down the
//                  wall of the great shaft; ribs running out from its rim
//
// and in the layers -
//
//   the Arcade     domes on drums, bell towers, colonnades along the foot of the walls, ledges up them, and an
//                  older, smaller town along the canyon floors
//   the Works      tanks, bundles of risers up the towers, chimneys with a light at the top, catwalks
//   the Plain      two causeways on piers that go to the horizon both ways, a lattice mast four kilometres high,
//                  a monolith, and kerbs along the seams
//   the Hanging    dwellings clinging to the stalactites, and lines slung between them
//
// It also picks the sites where the Builders are at work (builders.js animates them). Everything goes through
// city.js's put(), so it is instanced, seeded and in the fingerprint like the rest.

export const TRUNK_LEVELS=8;                    // how many blocks' height the trunks carry on above and below

export function details(k){
  const {THREE,R,rr,pick,put,batch,G,M,cable,light,speckle,L,stack,slabUnder,slabOver,inHole,C,K,KY,HALF,reg,trunks,TOP}=k;
  const sites=[];
  const inTrunk=(x,z,pad)=>trunks.some(t=>Math.abs(x-t.x)<t.w/2+(pad||0)&&Math.abs(z-t.z)<t.d/2+(pad||0));
  // the spans of a line (along x at z=c, or along z at x=c) that miss every hole in a slab and every trunk
  function spans(slab,axis,c,half){
    const cuts=[];
    for(const [hx,hz,r] of slab.holes||[]){const d=axis==='x'?Math.abs(hz-c):Math.abs(hx-c);if(d<r+half){const w=Math.sqrt(Math.max(0,(r+half)**2-d*d))+20;const m=axis==='x'?hx:hz;cuts.push([m-w,m+w]);}}
    for(const t of trunks){const d=axis==='x'?Math.abs(t.z-c):Math.abs(t.x-c),hw=axis==='x'?t.d/2:t.w/2;if(d<hw+half){const m=axis==='x'?t.x:t.z,w=(axis==='x'?t.w:t.d)/2+10;cuts.push([m-w,m+w]);}}
    cuts.sort((a,b)=>a[0]-b[0]);const out=[];let s=-HALF+2;
    for(const [a,b] of cuts){if(a>s+40)out.push([s,a]);s=Math.max(s,b);}
    if(HALF-2>s+40)out.push([s,HALF-2]);return out;
  }

  // =============================================================================================== trunks
  {const bT=batch('trunk',G.box,M.mega),bP=batch('trunk-plinth',G.box,M.mega);
   const lo=-TRUNK_LEVELS*(TOP-stack[0].h),hi=TOP+TRUNK_LEVELS*(TOP-stack[stack.length-1].h);
   for(const t of trunks){
     put(bT,t.x,(lo+hi)/2,t.z,t.w,hi-lo,t.d,0.62,0,0,true);
     for(const s of stack){if(s.kind!=='layer')continue;
       // a plinth where it stands through a floor, a haunch where it goes up through a ceiling
       const ph=rr(60,160),hh=Math.min(s.h*0.08,rr(120,320));
       put(bP,t.x,s.y0+ph/2,t.z,t.w+rr(260,520),ph,t.d+rr(260,520),0.6,0,0,true);
       put(bP,t.x,s.y1-hh/2,t.z,t.w+rr(300,700),hh,t.d+rr(300,700),0.58,0,0,true);
       // ribs up its faces, the height of the layer
       for(let i=0;i<rr(6,14);i++){const f=Math.floor(R()*4),a=rr(-0.45,0.45),o=rr(15,60),wd=rr(20,70);
         const x=t.x+(f===0?t.w/2+o/2:f===1?-t.w/2-o/2:a*t.w),z=t.z+(f===2?t.d/2+o/2:f===3?-t.d/2-o/2:a*t.d);
         put(bP,x,(s.y0+s.y1)/2,z,f<2?o:wd,s.h,f<2?wd:o,rr(0.56,0.64),0,0,true);}
       // and lit ports up its faces
       for(let i=0;i<40;i++){const f=Math.floor(R()*4),a=rr(-0.45,0.45);
         light(t.x+(f===0?t.w/2+1:f===1?-t.w/2-1:a*t.w),s.y0+rr(0.1,0.95)*s.h,t.z+(f===2?t.d/2+1:f===3?-t.d/2-1:a*t.d),R()<0.2);}}}}

  // =============================================================================================== beams under the ceilings
  {const bB=batch('beam',G.box,M.mega);
   for(const s of stack){if(s.kind!=='layer')continue;const over=stack[stack.indexOf(s)+1];
     for(const axis of ['x','z'])for(let i=-14;i<=14;i++){
       if(R()<0.42)continue;const c=i*1600,dep=Math.max(40,Math.min(320,s.h*rr(0.018,0.05))),wid=rr(50,150);
       for(const [a,b] of spans(over,axis,c,wid/2)){const m=(a+b)/2,l=b-a;
         put(bB,axis==='x'?m:c,s.y1-dep/2-0.3,axis==='x'?c:m,axis==='x'?l:wid,dep,axis==='x'?wid:l,0.6,0,0,true);}}
     // lighter ribs on the 400 m seams, under the tall layers
     if(s.h>3000)for(const axis of ['x','z'])for(let i=-58;i<=58;i++){
       if(i%4===0||R()<0.55)continue;const c=i*400,dep=rr(10,34),wid=rr(12,30);
       for(const [a,b] of spans(over,axis,c,wid/2)){const m=(a+b)/2,l=b-a;
         put(bB,axis==='x'?m:c,s.y1-dep/2-0.3,axis==='x'?c:m,axis==='x'?l:wid,dep,axis==='x'?wid:l,0.64,0,0,true);}}}}

  // =============================================================================================== plating on the floors
  {const bF=batch('plate',G.box,M.mega);
   for(const s of stack){if(s.kind!=='layer')continue;const fl=stack[stack.indexOf(s)-1];
     for(let i=0;i<300;i++){
       const onX=R()<0.5,c=Math.round(rr(-14,14))*1600+rr(-60,60),t=rr(-21000,21000);
       const x=onX?t:c,z=onX?c:t,l=rr(80,700),w=rr(30,260),h=rr(1.5,9);
       if(inHole(fl,x,z,l/2+50)||inTrunk(x,z,l/2)||Math.hypot(x-K.x,z-K.z)<400)continue;
       put(bF,x,s.y0+h/2,z,onX?l:w,h,onX?w:l,rr(0.56,0.66),0,0,true);}
     // kerbs: long low walls down the seams
     for(let i=0;i<120;i++){const onX=R()<0.5,c=Math.round(rr(-14,14))*1600+(R()<0.5?-1:1)*rr(14,40),t=rr(-21000,21000);
       const x=onX?t:c,z=onX?c:t,l=rr(300,2400),h=rr(4,26);
       if(inHole(fl,x,z,l/2+60)||inTrunk(x,z,l/2)||Math.hypot(x-K.x,z-K.z)<600)continue;
       put(bF,x,s.y0+h/2,z,onX?l:rr(4,14),h,onX?rr(4,14):l,rr(0.52,0.62),0,0,true);}}}

  // =============================================================================================== collars round the holes
  {const bC=batch('collar-seg',G.box,M.mega),S=C.shaft;
   stack.forEach(s=>{if(s.kind!=='slab')return;
     for(const [hx,hz,r] of s.holes||[]){
       const great=Math.abs(hx-S.x)<1&&Math.abs(hz-S.z)<1;
       const n=Math.max(16,Math.round(r/14)),th=great?rr(34,50):rr(10,30),up=great?rr(40,70):rr(8,40),dn=great?rr(160,260):rr(30,120);
       const isTop=s!==stack[stack.length-1],isBot=s!==stack[0];
       for(let i=0;i<n;i++){const a=i/n*Math.PI*2,rr0=r+th/2,x=hx+Math.cos(a)*rr0,z=hz+Math.sin(a)*rr0,seg=2*Math.PI*rr0/n+2;
         if(isTop)put(bC,x,s.y1+up/2,z,th,up,seg,0.6,-a+Math.PI/2,0,true);
         if(isBot)put(bC,x,s.y0-dn/2,z,th*1.4,dn,seg,0.56,-a+Math.PI/2,0,true);}
       if(great){
         // ribs out across the floor from the rim, and ledges down the shaft - on the lower slab, where the stair is not
         for(let i=0;i<12;i++){const a=i/12*Math.PI*2+0.13,l=rr(250,600),x=hx+Math.cos(a)*(r+th+l/2),z=hz+Math.sin(a)*(r+th+l/2);
           put(bC,x,s.y1+14,z,l,28,rr(18,30),0.58,-a,0,true);}
         const hasStair=s===slabUnder('hanging');
         if(!hasStair)for(let yy=s.y0+120;yy<s.y1-60;yy+=rr(140,220)){const m=Math.round(r/10);
           for(let i=0;i<m;i++){const a=i/m*Math.PI*2,x=hx+Math.cos(a)*(r-5),z=hz+Math.sin(a)*(r-5);
             put(bC,x,yy,z,12,rr(5,9),2*Math.PI*r/m+2,0.54,-a+Math.PI/2,0,true);}}
       }
     }});}

  // =============================================================================================== the Arcade
  {const A=L.arcade,f=A.y0,H=A.h,fl=slabUnder('arcade');
   const bDm=batch('dome',G.dome,M.concrete),bDr=batch('drum',G.cyl12,M.arcade),bSp=batch('belltower',G.box,M.arcade),bCap=batch('cap',G.pyr,M.concrete),
         bCol=batch('colonnade',G.cyl6,M.concrete),bEnt=batch('entablature',G.box,M.arcade),bLed=batch('ledge',G.box,M.concrete),bHo=batch('old-town',G.box,M.arcade);
   for(const b of reg.arcade){
     const r=b.roof;if(!r)continue;
     if(r.y<f+H-200&&R()<0.3){const rad=Math.min(r.w,r.d)*rr(0.18,0.34),dr=rad*rr(0.3,0.7);
       put(bDr,r.x,r.y+dr/2,r.z,rad*1.02,dr,rad*1.02,rr(0.8,0.9));put(bDm,r.x,r.y+dr,r.z,rad,rad*rr(0.8,1.15),rad,rr(0.78,0.88));
       put(bCap,r.x,r.y+dr+rad*1.05+rad*0.2,r.z,rad*0.12,rad*0.4,rad*0.12,0.8);}
     if(r.y<f+H-400&&R()<0.35)for(let i=0;i<rr(1,4);i++){const w=rr(14,50),h=Math.min(rr(80,420),f+H-r.y-80),x=r.x+rr(-0.4,0.4)*r.w,z=r.z+rr(-0.4,0.4)*r.d;
       put(bSp,x,r.y+h/2,z,w,h,w,rr(0.8,0.9));put(bCap,x,r.y+h+w*0.9,z,w*1.05,w*1.8,w*1.05,rr(0.7,0.82));}
     // ledges up two of its faces
     for(let j=0;j<2;j++){const side=Math.floor(R()*4),alongX=side>=2,len=(alongX?b.w:b.d)*rr(0.5,1),out=rr(4,12);
       for(let i=0;i<rr(1,4);i++){const yy=f+rr(0.05,0.9)*b.h;
         const x=b.x+(alongX?rr(-0.1,0.1)*b.w:(side?1:-1)*(b.w/2+out/2-1)),z=b.z+(alongX?(side===2?1:-1)*(b.d/2+out/2-1):rr(-0.1,0.1)*b.d);
         put(bLed,x,yy,z,alongX?len:out,rr(3,8),alongX?out:len,rr(0.72,0.84));}}
     // a colonnade along the foot of one face
     if(R()<0.13){const side=Math.floor(R()*4),alongX=side>=2,len=(alongX?b.w:b.d)*0.9,h=rr(40,95),rad=rr(2.2,4.2),sp=rad*rr(4,6),off=rr(10,22);
       const nC=Math.floor(len/sp);
       for(let i=0;i<=nC;i++){const t=-len/2+i*sp;
         const x=b.x+(alongX?t:(side?1:-1)*(b.w/2+off)),z=b.z+(alongX?(side===2?1:-1)*(b.d/2+off):t);put(bCol,x,f+h/2,z,rad,h,rad,rr(0.82,0.9));}
       const x=b.x+(alongX?0:(side?1:-1)*(b.w/2+off/2)),z=b.z+(alongX?(side===2?1:-1)*(b.d/2+off/2):0);
       put(bEnt,x,f+h+5,z,alongX?len+sp:off*2.2,10,alongX?off*2.2:len+sp,rr(0.84,0.92));}}
   // the old town in the bottoms of the canyons: a city the size of a city, at the feet of the one that grew over it
   const STEP=1150;
   for(let i=0;i<4200;i++){const onX=R()<0.5,c=(Math.round(rr(-16,16))+0.5)*STEP+rr(-110,110),t=rr(-19000,19000);
     const x=onX?t:c,z=onX?c:t;if(inHole(fl,x,z,60)||inTrunk(x,z,40))continue;
     const w=rr(8,30),h=rr(6,38)*(R()<0.08?3:1);put(bHo,x,f+h/2,z,w,h,w*rr(0.6,1.8),rr(0.78,0.9),Math.floor(R()*2)*Math.PI/2);}
   for(let i=0;i<260;i++){const b=pick(reg.arcade),c=pick(reg.arcade);if(b===c||Math.hypot(b.x-c.x,b.z-c.z)>2600)continue;
     const y0=f+rr(0.2,0.9)*Math.min(b.h,c.h);cable([b.x,y0,b.z],[c.x,y0+rr(-100,100),c.z],rr(20,160),12);}
   // Builders at the Arcade, adding to it
   for(let i=0;i<4;i++){const b=reg.arcade[Math.floor(R()*reg.arcade.length)];if(!b.roof||b.roof.y>f+H-600)continue;
     sites.push({x:b.roof.x,y:b.roof.y,z:b.roof.z,ang:R()*Math.PI,L:Math.min(b.roof.w,b.roof.d)*0.7,w:rr(10,22),hc:rr(6,10),n0:rr(4,20),max:rr(60,110),
       size:rr(24,40),mat:'arcade',layer:'arcade'});}
  }

  // =============================================================================================== the Works
  {const W=L.works,f=W.y0,H=W.h,fl=slabUnder('works');
   const bTk=batch('tank',G.cyl12,M.concrete),bRs=batch('riser',G.cyl6,M.concrete),bCh=batch('chimney',G.cyl8,M.machine),bCw=batch('catwalk',G.box,M.machine),bCl=batch('works-floor',G.box,M.machine);
   for(const t of reg.works){
     const top=f+t.h;
     if(t.h<H-60&&R()<0.3)for(let i=0;i<rr(1,4);i++){const r=rr(12,Math.min(70,t.w*0.35)),h=rr(16,Math.min(120,H-t.h-20));
       const k2=put(bTk,t.x+rr(-0.3,0.3)*t.w,top+h/2,t.z+rr(-0.3,0.3)*t.w,r,h,r,rr(0.6,0.8));if(k2>=0)speckle(bTk,k2,1,0.6);}
     if(R()<0.3){const side=Math.floor(R()*4),n=Math.floor(rr(3,9)),r=rr(1.5,6);
       for(let i=0;i<n;i++){const o=(i-n/2)*r*2.6;const x=t.x+(side<2?(side?1:-1)*(t.w/2+r+2):o),z=t.z+(side>=2?(side===2?1:-1)*(t.w/2+r+2):o);
         put(bRs,x,f+t.h/2,z,r,t.h,r,rr(0.5,0.66));}}
     if(t.h<H-300&&R()<0.1){const h=rr(60,Math.min(260,H-t.h-40)),r=rr(4,14);put(bCh,t.x,top+h/2,t.z,r,h,r,rr(0.45,0.6));light(t.x,top+h+1,t.z,true);light(t.x+r,top+h-2,t.z,true);}
   }
   for(let i=0;i<460;i++){const a=pick(reg.works),b=pick(reg.works);const d=Math.hypot(a.x-b.x,a.z-b.z);if(a===b||d>2200||d<300)continue;
     const yy=f+rr(0.1,0.95)*Math.min(a.h,b.h);put(bCw,(a.x+b.x)/2,yy,(a.z+b.z)/2,d,rr(2,5),rr(3,7),rr(0.5,0.7),-Math.atan2(b.z-a.z,b.x-a.x));}
   for(let i=0;i<3200;i++){const x=rr(-20000,20000),z=rr(-20000,20000);if(inHole(fl,x,z,60)||inTrunk(x,z,40))continue;
     const w=rr(8,70),h=rr(4,50);put(R()<0.2?bTk:bCl,x,f+h/2,z,w*(R()<0.2?0.5:1),h,w*rr(0.5,1.6),rr(0.5,0.72));}
   for(let i=0;i<6;i++){const t=pick(reg.works);if(t.h>H-200)continue;
     sites.push({x:t.x,y:f+t.h,z:t.z,ang:R()*Math.PI,L:t.w*0.8,w:rr(6,14),hc:rr(4,7),n0:rr(2,12),max:rr(50,90),size:rr(14,26),mat:'machine',layer:'works'});}
   for(let i=0;i<4;i++){const x=rr(-15000,15000),z=rr(-15000,15000);if(inHole(fl,x,z,400)||inTrunk(x,z,400))continue;
     sites.push({x,y:f,z,ang:R()*Math.PI,L:rr(160,320),w:rr(20,40),hc:rr(8,12),n0:rr(10,60),max:rr(150,220),size:rr(30,48),mat:'machine',layer:'works'});}
  }

  // =============================================================================================== the Plain
  {const P=L.plain,f=P.y0,H=P.h,fl=slabUnder('plain'),sp=C.spire;
   const bCd=batch('causeway',G.box,M.concrete),bPi=batch('pier',G.box,M.concrete),bLt=batch('lattice',G.box,M.concrete),bMo=batch('monolith',G.box,M.machine);
   // two causeways, one each way, on piers, to the horizon both ways
   for(const [axis,c,hgt,wid,span] of [['z',-6400,120,46,330],['x',7800,260,64,420]]){
     for(let t=-HALF+span/2;t<HALF-span/2;t+=span){
       const x=axis==='z'?c:t,z=axis==='z'?t:c;if(inHole(fl,x,z,120)||inTrunk(x,z,60))continue;
       put(bCd,x,f+hgt+6,z,axis==='z'?wid:span+2,12,axis==='z'?span+2:wid,rr(0.66,0.74));
       put(bPi,x,f+hgt/2,z,axis==='z'?wid*0.7:18,hgt,axis==='z'?18:wid*0.7,rr(0.6,0.7));
       if(R()<0.5)light(x+(axis==='z'?wid/2:0),f+hgt+14,z+(axis==='x'?wid/2:0),R()<0.3);}}
   // the lattice mast: four legs, braced, four kilometres high
   {const cx=12500,cz=-2600,Hm=4200,B=180;
    for(const [sx,sz] of [[-1,-1],[1,-1],[1,1],[-1,1]])put(bLt,cx+sx*B/2,f+Hm/2,cz+sz*B/2,9,Hm,9,0.55);
    for(let yy=f+150;yy<f+Hm;yy+=150){
      for(const [ax,s] of [['x',-1],['x',1],['z',-1],['z',1]]){
        put(bLt,cx+(ax==='z'?s*B/2:0),yy,cz+(ax==='x'?s*B/2:0),ax==='x'?B:4,4,ax==='x'?4:B,0.55);
        const diag=Math.hypot(B,150),ang=Math.atan2(150,B)*(Math.floor(yy/150)%2?1:-1);
        put(bLt,cx+(ax==='z'?s*B/2:0),yy+75,cz+(ax==='x'?s*B/2:0),diag,3,3,0.52,ax==='x'?0:Math.PI/2,ang);}}
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;cable([cx,f+Hm*rr(0.5,0.95),cz],[cx+Math.cos(a)*rr(3000,5000),f,cz+Math.sin(a)*rr(3000,5000)],rr(50,300),24);}
    for(let i=0;i<30;i++)light(cx+rr(-1,1)*B/2,f+rr(0,Hm),cz+rr(-1,1)*B/2,R()<0.4);light(cx,f+Hm+4,cz,true);}
   // the monolith: two and a half kilometres of something, standing on its own
   {const i=put(bMo,-12800,f+1300,-14800,1100,2600,240,0.5,0.3);speckle(bMo,i,60,0.2);}
   // Builders on the Plain: big ones, putting up new spires on the seams
   for(let i=0;i<5;i++){const x=Math.round(rr(-10,10))*1600,z=Math.round(rr(-10,10))*1600+rr(-40,40);
     if(inHole(fl,x,z,600)||inTrunk(x,z,600)||Math.hypot(x-sp.x,z-sp.z)<3000)continue;
     sites.push({x,y:f,z,ang:R()<0.5?0:Math.PI/2,L:rr(200,420),w:rr(30,70),hc:rr(12,22),n0:rr(10,50),max:rr(90,160),size:rr(70,120),mat:'concrete',layer:'plain'});}
   // and one near the spire, where the Plain view looks
   sites.push({x:sp.x-2600,y:f,z:sp.z+2200,ang:0.4,L:380,w:60,hc:18,n0:30,max:140,size:110,mat:'machine',layer:'plain'});
  }

  // =============================================================================================== the Hanging
  {const Hg=L.hanging,f=Hg.y0,top=Hg.y1;
   const bDw=batch('dwelling',G.box,M.machine);
   for(const d of reg.drips){
     if(d.len<700||R()<0.62)continue;
     for(let i=0;i<rr(4,13);i++){const t=rr(0.1,0.85),half=d.w*0.5*(1-t*0.8),a=Math.floor(R()*4)*Math.PI/2+d.ry,s=rr(8,44);
       const x=d.x+Math.cos(a)*(half+s/2-2),z=d.z-Math.sin(a)*(half+s/2-2);
       const k2=put(bDw,x,top-d.len*t,z,s,s*rr(0.5,1.4),s*rr(0.6,1.2),rr(0.52,0.7),a);if(k2>=0&&R()<0.3)speckle(bDw,k2,1,0.7);}
   }
   for(let i=0;i<340;i++){const a=pick(reg.drips),b=pick(reg.drips);const d=Math.hypot(a.x-b.x,a.z-b.z);if(a===b||d>1800||d<200)continue;
     cable([a.x,top-a.len*rr(0.3,0.9),a.z],[b.x,top-b.len*rr(0.3,0.9),b.z],rr(40,260),14);}
   // a Builder on a tower across from the platform, close enough to watch
   const phi=Math.atan2(C.column.x-K.x,C.column.z-K.z)+0.5;
   const bx=K.x+Math.sin(phi)*230,bz=K.z+Math.cos(phi)*230,by=KY-34;
   const bT=batch('builder-tower',G.box,M.machine);
   put(bT,bx,f+(by-f)/2,bz,46,by-f,40,0.62);
   sites.push({x:bx,y:by,z:bz,ang:-phi+Math.PI/2,L:34,w:5,hc:2.4,n0:2,max:12,size:7,mat:'machine',layer:'hanging',near:true});
   // and a big one on the floor below, in the void
   sites.push({x:K.x+Math.sin(phi-0.3)*900,y:f,z:K.z+Math.cos(phi-0.3)*900,ang:phi,L:260,w:26,hc:9,n0:20,max:120,size:40,mat:'concrete',layer:'hanging'});
  }
  return {sites};
}
