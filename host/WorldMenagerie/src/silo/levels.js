// Silo 18: the levels. Fan work after Hugh Howey's Wool; every shape here is this project's own reading of the
// setting's premise (a buried cylinder of levels round a stairwell), not the books' text or the television design.
//
// The silo is 144 levels, one every LH metres, round an open shaft RS across with the stair in it. A level is a
// ring: the landing street round the shaft (RS..RW), a wall with doors and windows at RW, and rooms out to the
// silo's wall at RO. Each kind of level (homes, offices, farms, IT, the bazaar, supply, water, casting,
// mechanical) is built once as a kit and drawn as instances, one per level of that kind, turned a little each
// time so no two floors line up. Level 1, the top, and the generator hall at the bottom are built once each.
export const LH=4.2,Y1=-12,RS=11,RW=22,RO=50,NL=144;
export const yL=n=>Y1-(n-1)*LH;                         // the floor of level n
export const levelAt=y=>Math.floor((Y1+LH-y)/LH)+1;      // the level a height is on
// what each level is (my own layout of the setting's thirds: up top, the mids, down deep)
export function kindOf(n){const k=kindBase(n);return k==='home'&&n%6===2?'commons':k;}
function kindBase(n){
  if(n===1)return 'top';
  if(n>=142)return 'hall';
  if(n<=10)return 'office';
  if(n===34||n===35)return 'it';
  if(n>=49&&n<=56)return 'farm';
  if(n>=71&&n<=74)return 'bazaar';
  if(n>=77&&n<=84)return 'farm';
  if(n>=109&&n<=112)return 'supply';
  if(n>=123&&n<=128)return 'water';
  if(n>=129&&n<=134)return 'cast';
  if(n>=135)return 'mech';
  return 'home';
}
// the sixteen farm floors and how each grows: 0 channels, 1 rafts, 2 racks, 3 grain, 4 animals, 5 no light
export const FARMV={49:3,50:0,51:2,52:1,53:3,54:4,55:0,56:5,77:3,78:1,79:2,80:0,81:3,82:5,83:2,84:4};
// the water band's floors: 0 clean water, 1 the sewage cleaned, 2 the air plant
export const WATERV={123:0,124:1,125:2,126:0,127:1,128:2};
export const FARM_NAMES=['channels of greens','rafts on ponds','racks of greens five high','grain under sodium lamps','the animals','mushrooms, fish, seed and compost'];
export const zoneOf=n=>n<=48?'top':n<=96?'mid':'deep';
export function placeName(n){
  if(n<1)return 'above the top level';
  if(n>NL)return 'the mines';
  const k=kindOf(n),z=zoneOf(n);
  return ({top:'the top level: cafeteria, airlock and offices',office:'up top: offices',it:'IT',farm:n<60?'the upper farms':'the lower farms',
    bazaar:'the bazaar',commons:'the commons: washroom, laundry, school, clinic, kitchen, meeting room',supply:'supply',water:'water treatment',cast:'the casting rooms',mech:'mechanical',hall:'the generator hall'})[k]
    ||(z==='top'?'up top':z==='mid'?'the mids':'down deep');
}

const TAU=Math.PI*2,D=Math.PI/180;
const mkR=seed=>{let s=(seed*2654435761>>>0)%2147483647||1;return()=>((s=(s*16807)%2147483647)/2147483647);};
// the paint of a level's rooms, by third
const PAINT={top:['#b9b4a6','#a9b0b2','#c2b8a2','#9fa8a0'],mid:['#9da48a','#a8a184','#8f9c88','#b0a68e'],deep:['#8f8c84','#857f76','#9a8f7c','#7e8590']};

// ---- the kits ----
export function buildKits(K,R){
  const kits={};
  const {G}=K;
  // the parts most kits share: the floor, the rail round the shaft, the ring wall with its doors, the street lamps
  // a room's furniture goes in under its own key ('fbase'), so the page can leave it out of levels seen from far off
  const F=key=>key==='base'?'fbase':key;
  const furn=k=>({add:(key,...r)=>k.add(F(key),...r),radial:(key,...r)=>k.radial(F(key),...r),tangent:(key,...r)=>k.tangent(F(key),...r),pipe:(key,...r)=>k.pipe(F(key),...r)});
  let fk=null;
  function shell(k,o={}){fk=furn(k);if(o.open===undefined)o.open=i=>i%7===2;
    k.add('base',K.ring(RS,RO,0.5,64),'#7a766e',0,0,0);
    // the conduits along the ceiling, and the lamps over the street
    k.add('base',K.ring(RW-0.6,RW-0.35,0.25,48),'#55534e',0,LH-0.75,0);
    k.add('base',K.ring(RS+1.2,RS+1.45,0.18,48),'#6b5c48',0,LH-0.85,0);
    const nl=o.lamps||20;for(let i=0;i<nl;i++){const a=(i+0.5)/nl*TAU;k.radial('lamp','#ffe2b0',a,16.5,LH-0.72,1.6,0.35,0.12);}
    if(o.wall===false)return;
    // the ring wall: per room a door, a window, the piers between, and the lintels
    const nr=o.rooms||24,step=TAU/nr;
    for(let i=0;i<nr;i++){const a0=i*step;if(o.skip&&o.skip(a0+step/2))continue;
      const arc=step*RW,door=o.door||1.3,win=o.win||1.8,da=door/RW,wa=win/RW,h=LH-0.5;
      const aD=a0+step*0.28,aW=a0+step*0.66;
      const seg=(x0,x1,y0,y1,col)=>{if(x1<=x0)return;k.tangent('base',col||'#a39d90',(x0+x1)/2,RW,y0,(x1-x0)*RW,0.25,y1-y0);
        if(y0===0&&o.street)fk.tangent('base',o.v===1?'#8a8070':'#868074',(x0+x1)/2,RW-0.135,0.85,(x1-x0)*RW,0.02,0.55);};   // walls darkened at hand height
      seg(a0,aD-da/2,0,h);seg(aD-da/2,aD+da/2,2.3,h);seg(aD+da/2,aW-wa/2,0,h);seg(aW-wa/2,aW+wa/2,0,1.0);seg(aW-wa/2,aW+wa/2,2.3,h);seg(aW+wa/2,a0+step,0,h);
      if(o.open&&o.open(i)){
        // a door left open: the panel swung in, the room's light in the doorway and spilling out across the street
        const hx=Math.cos(aD-da/2)*(RW+0.1),hz=Math.sin(aD-da/2)*(RW+0.1),sw=-aD+0.25;
        k.add('base',G.box,'#4a3a2c',hx+Math.cos(-sw)*0.62,1.15,hz-Math.sin(-sw)*0.62,{ry:sw,sx:1.25,sy:2.3,sz:0.06});
        k.tangent('glow','#ffd8a0',aD,RW+1.0,0,door,0.04,2.3);
        k.radial('spill','#7a5a30',aD,RW-1.6,0.02,3.0,door*1.2,0.01);}
      else k.tangent('base','#4a3a2c',aD,RW+0.12,0,door,0.1,2.3);             // the door
      if(i%6===3){const ax=Math.cos(aD)*(RW-0.15),az=Math.sin(aD)*(RW-0.15);   // a ventilation fan in a grille over the door
        k.add('base',G.disc8,'#3a3c3e',ax,3.1,az,{rz:Math.PI/2,ry:-aD,sx:0.5,sy:0.12,sz:0.5});
        for(let f=0;f<4;f++)k.add('base',G.box,'#6a6e70',Math.cos(aD)*(RW-0.23),3.1,Math.sin(aD)*(RW-0.23),{ry:-aD,rx:f*Math.PI/4,sx:0.02,sy:0.85,sz:0.12});}
      k.tangent('glow','#ffd08a',aW,RW+0.2,1.0,win,0.06,1.3);            // the window, lit from inside
      // the partition to the next room
      // the partition to the next room, painted, with a doorway near the back and a shelf and a picture on it
      {const pc=['#9a8a70','#7f8c84','#a08a78','#8a8a96','#90806a'][i%5],d0=RO-6,d1=RO-4.8;
        k.radial('base',pc,a0,(RW+0.2+d0)/2,0,d0-RW-0.2,0.22,h);k.radial('base',pc,a0,(d1+RO)/2,0,RO-d1,0.22,h);k.radial('base',pc,a0,(d0+d1)/2,2.3,d1-d0,0.22,h-2.3);
        k.radial('base','#5e4e3e',a0,RW+9,1.5,2.4,0.5,0.08);k.radial('base',['#6a7a8a','#8a6a5a','#7a8a6a'][i%3],a0,RW+15,1.4,1.6,0.3,1.0);
        k.radial('base','#c8b8a0',a0,RW+4.5,0,0.3,0.32,2.1);}
      k.tangent('base',['#9a8a70','#7f8c84','#a08a78','#8a8a96','#90806a'][i%5],a0+step/2,RO-0.25,0,step*(RO-0.25),0.12,h);   // each room's own paint on the back wall
      if(o.street)street(fk,a0,step,i,aD,aW,da,o);
      if(o.room)o.room(fk,a0,step,i);
    }
  }
  // ---- generations of living on a landing: wear, repairs, things added, all near-only ----
  const SIGN=[['#c8a040','#2a2a28'],['#3a6a8a','#e8e0d0'],['#8a3a2a','#e8dcc0']];      // three eras of hand-painted signs
  function street(k,a0,step,i,aD,aW,da,o){const v=o.v||0,rs=mkR(v*977+i*31+7),R=rs,res=o.street==='res';
    // the floor worn pale in a path from the rail to the door; grime round the door frame; tallies scratched by it
    k.radial('base','#8e897f',aD,(RS+RW)/2+0.5,0.004,RW-RS-2,da*RW*0.9,0.006);
    for(const sd of [-1,1])k.tangent('base','#5e584e',aD+sd*(da/2+0.06/RW),RW-0.14,0,0.12,0.02,2.35);k.tangent('base','#5e584e',aD,RW-0.14,2.3,da*RW+0.24,0.02,0.14);
    if(R()<0.5)for(let q=0;q<5+(R()*8|0);q++)k.add('base',K.G.box,'#d8d0c0',Math.cos(aD+da/2+0.12/RW+q*0.05/RW)*(RW-0.15),1.45,Math.sin(aD+da/2+0.12/RW+q*0.05/RW)*(RW-0.15),{ry:-aD,rx:q%5===4?0.9:0,sx:0.01,sy:0.18,sz:0.012});
    // patched panels and paint chipped to older colours beneath; a rust streak under the conduit
    const wall=(aa,h,w,hh,col,d=0.13)=>k.tangent('base',col,aa,RW-d,h,w,0.015,hh);
    if(R()<0.6)wall(a0+step*(0.45+R()*0.1),0.4+R()*1.2,0.6+R()*0.8,0.5+R()*0.9,['#8a9088','#9a8a74','#7a8288','#a89a80'][(R()*4)|0]);
    for(let q=0;q<4;q++)wall(a0+step*R(),0.3+R()*2.6,0.06+R()*0.18,0.04+R()*0.12,['#6a7a6a','#8a6a5a','#5a6a7a'][v%3],0.14);
    if(R()<0.45){const aa=a0+step*(0.1+R()*0.8);wall(aa,LH-2.2,0.06,1.4,'#6a4a32',0.14);wall(aa+0.05/RW,LH-1.7,0.04,0.9,'#7a5a3a',0.145);}
    // soot on the ceiling over the street lamp, a cable bundle strung from bracket to bracket, sagging, over the old conduit
    {const b0=a0+0.1/RW,b1=a0+step-0.1/RW,bm=(b0+b1)/2,r=RW-0.45,c=(b)=>[Math.cos(b)*r,Math.sin(b)*r];const [x0,z0]=c(b0),[xm,zm]=c(bm),[x1,z1]=c(b1);
      k.pipe('base','#1e1e1e',x0,LH-0.95,z0,xm,LH-1.25,zm,0.05);k.pipe('base','#1e1e1e',xm,LH-1.25,zm,x1,LH-0.95,z1,0.05);k.add('base',K.G.box,'#3a3c3e',x0,LH-0.92,z0,{ry:-b0,sx:0.3,sy:0.08,sz:0.12});
      if(R()<0.4){k.pipe('base','#3a5a3a',x0,LH-1.05,z0,xm,LH-1.35,zm,0.03);k.pipe('base','#3a5a3a',xm,LH-1.35,zm,x1,LH-1.05,z1,0.03);}}
    if(i%2===0)k.radial('base','#3a352e',a0+step*0.5,16.5,LH-0.515,2.6,1.0,0.01);
    // a lamp left on its bracket long after it stopped working
    if(R()<0.2)k.tangent('base','#4a4844',a0+step*0.85,RW-0.25,2.5,0.4,0.2,0.25);
    if(!res)return;
    // a notice board thick with papers pinned over papers
    if(i%3===0){const ab=aD-da/2-0.7/RW;k.tangent('base','#7a5e3e',ab,RW-0.16,1.2,0.95,0.03,0.85);
      for(let q=0;q<9;q++){const aq=ab+(R()-0.5)*0.7/RW;k.add('base',K.G.box,['#e8e4d8','#e8d890','#d8e0e8','#e0c8b8','#c8c0b0'][(R()*5)|0],Math.cos(aq)*(RW-0.18-q*0.003),1.3+R()*0.6,Math.sin(aq)*(RW-0.18-q*0.003),{ry:-aq,rz:(R()-0.5)*0.3,sx:0.005,sy:0.18+R()*0.12,sz:0.14+R()*0.1});}}
    // a hand-painted sign with an arrow, in one era's colours or another's
    if(i%4===1){const [bg,fg]=SIGN[(i+v)%3],as=a0+step*0.97;k.tangent('base',bg,as,RW-0.16,2.55,0.9,0.02,0.4);k.add('base',K.G.box,fg,Math.cos(as)*(RW-0.18),2.75,Math.sin(as)*(RW-0.18),{ry:-as-Math.PI/2,sx:0.5,sy:0.06,sz:0.01});
      k.add('base',K.G.box,fg,Math.cos(as+0.22/RW)*(RW-0.18),2.75,Math.sin(as+0.22/RW)*(RW-0.18),{ry:-as-Math.PI/2,rz:Math.PI/4,sx:0.16,sy:0.16,sz:0.01});}
    // children's chalk on the wall low down: loops and stick shapes of their own
    if(R()<0.35){const ac=aW+0.2*R()/RW;for(let q=0;q<7;q++)k.add('base',K.G.box,['#f0ece0','#f0d0d8','#d0e8f0','#f0e8a0'][q%4],Math.cos(ac+q*0.09/RW)*(RW-0.15),0.35+R()*0.5,Math.sin(ac+q*0.09/RW)*(RW-0.15),{ry:-ac,rx:R()*3,sx:0.005,sy:0.12+R()*0.18,sz:0.015});}
    // laundry strung across the walkway, a line from the wall to the rail
    if(i%4===2){const al=a0+step*0.5,r0=RS+1.2,r1=RW-0.3;k.radial('base','#c8c0b0',al,(r0+r1)/2,2.85,r1-r0,0.012,0.012);
      for(let q=0;q<5;q++){const r=r0+1+q*1.6+R()*0.4;k.add('base',K.G.box,['#a89a80','#8a9aa8','#b8a8a0','#9aa088','#c8b8a0','#7a6a8a'][(q+i)%6],Math.cos(al)*r,2.45-R()*0.25,Math.sin(al)*r,{ry:-al,sx:0.5+R()*0.4,sy:0.6+R()*0.4,sz:0.015});}}
    // plants in tins along the street's edge by the rail
    for(let q=0;q<2;q++){const ap=a0+step*(0.3+q*0.4)+R()*0.05,r=RS+1.0+R()*0.4;k.add('base',K.G.cyl6,['#8a8a84','#7a5a3a','#5a6a7a'][q],Math.cos(ap)*r,0.15,Math.sin(ap)*r,{sx:0.15,sy:0.3,sz:0.15});
      k.add('base',K.G.sph4,['#4f7a3e','#5e8a44','#6a8a3a'][(q+i)%3],Math.cos(ap)*r,0.42,Math.sin(ap)*r,{sx:0.22,sy:0.2+R()*0.15,sz:0.22});}
    // the memorial: one stretch of wall a level, rows of small marks, one for each of the dead, and a candle under them
    if(i===o.memorial){const am=a0+step*0.5;k.tangent('base','#6a645a',am,RW-0.15,0.6,step*RW*0.5,0.02,2.0);
      for(let rr=0;rr<9;rr++)for(let q=0;q<12;q++){const aq=am+(q-5.5)*step*0.038;if(R()<0.85)k.add('base',K.G.box,'#2a2622',Math.cos(aq)*(RW-0.17),0.75+rr*0.2,Math.sin(aq)*(RW-0.17),{ry:-aq-Math.PI/2,sx:0.08+R()*0.1,sy:0.025,sz:0.005});}
      k.radial('glow','#ffb050',am,RW-0.5,0,0.08,0.08,0.18);k.radial('glow','#ffb050',am+0.15/RW,RW-0.5,0,0.08,0.08,0.14);}}

  // ---- a flat: a narrow door with its number off the walkway; a front room (a table and stools, a sink, shelves of
  //      saved tins and jars, a rug, a lamp, a toy) and through a curtained doorway a back room (bunks or a bed that
  //      folds down, or a loft built in over it, laundry on a line). Nothing matches: furniture made and remade ----
  const FADED=['#8a7a6a','#7a8a8a','#9a8a7a','#8a8070','#7a7a8a','#a08a70','#6a7a6a'],WOOD=['#6d5a46','#5e5246','#7a6248','#5a4a3a','#806a50'];
  const homeRoom=(k,a0,step,i,v=0)=>{const R=mkR(v*131+i*17+3),a=a0+step*0.5,X=RW+11,XB=RO-6.5,pick=L=>L[(R()*L.length)|0];
    const at=(aa,r)=>[Math.cos(aa)*r,Math.sin(aa)*r];
    // the wall between the rooms, its doorway hung with a curtain; the back wall with its doorway to the passage behind
    {const ad=a0+step*0.3,dw=0.9/X,wc=pick(['#9a8a70','#8a8a7a','#a09080','#8a9088']);
      k.tangent('base',wc,(a0+ad-dw/2)/2,X,0,(ad-dw/2-a0)*X,0.15,LH-0.5);k.tangent('base',wc,(ad+dw/2+a0+step)/2,X,0,(a0+step-ad-dw/2)*X,0.15,LH-0.5);k.tangent('base',wc,ad,X,2.1,dw*X,0.15,LH-2.6);
      k.tangent('base',pick(['#8a5a4a','#5a6a8a','#7a8a5a','#a08a5a','#6a4a6a']),ad,X-0.05,0.15,0.95,0.02,1.95);
      const ab=a0+step*0.7,bw=0.9/XB;k.tangent('base',wc,(a0+ab-bw/2)/2,XB,0,(ab-bw/2-a0)*XB,0.15,LH-0.5);k.tangent('base',wc,(ab+bw/2+a0+step)/2,XB,0,(a0+step-ab-bw/2)*XB,0.15,LH-0.5);k.tangent('base',wc,ab,XB,2.1,bw*XB,0.15,LH-2.6);}
    // the front room: a small table and stools by the window, a sink and a counter against the side wall, a rug
    {const at_=a0+step*0.62,rt=RW+3.2;k.radial('base',pick(WOOD),at_,rt,0,0.9,0.8,0.74);k.radial('base',pick(WOOD),at_,rt,0.72,1.0,0.9,0.04);
      for(const sd of [-1,1]){const [x,z]=at(at_+sd*0.65/rt,rt);k.add('base',K.G.cyl6,pick(WOOD),x,0.22,z,{sx:0.17,sy:0.44,sz:0.17});}
      const as=a0+0.45/(RW+6);k.radial('base','#9a9488',as,RW+6.5,0,2.2,0.6,0.85);k.radial('base','#d8d8d0',as,RW+6.0,0.86,0.5,0.45,0.12);k.radial('base','#8a8c8e',as,RW+6.0,0.98,0.05,0.05,0.25);
      k.radial('base',pick(FADED),a,RW+4.5,0.005,2.6,step*(RW+4.5)*0.55,0.01);
      // shelves on the dividing wall: saved containers, every one different
      for(let sh=0;sh<3;sh++){const ah=a0+step*0.72;k.tangent('base','#6e604f',ah,X-0.25,0.9+sh*0.55,1.6,0.3,0.03);
        for(let q=0;q<5;q++){const [x,z]=at(ah+(q-2)*0.3/X,X-0.25);k.add('base',R()<0.6?K.G.cyl6:K.G.box,pick(['#a07a50','#7a8a9a','#c0b090','#8a5a4a','#b8b8b0','#6a7a5a']),x,0.98+sh*0.55+0.06,z,{sx:0.07+R()*0.05,sy:0.12+R()*0.12,sz:0.07+R()*0.05});}}
      // hooks with a coat and a bag; a toy on the floor; a basket
      const ah=a0+step*0.92,[hx,hz]=at(ah,RW+1.2);k.add('base',K.G.box,pick(FADED),hx,1.45,hz,{ry:-ah,sx:0.12,sy:0.8,sz:0.4});
      if(R()<0.6){const [x,z]=at(a0+step*(0.4+R()*0.3),RW+5+R()*3);k.add('base',K.G.sph4,pick(['#c84a3a','#3a7ac8','#e0c040']),x,0.12,z,{sx:0.12,sy:0.12,sz:0.12});k.add('base',K.G.box,'#8a6a4a',x+0.3,0.07,z+0.1,{sx:0.25,sy:0.14,sz:0.15,ry:R()*3});}
      {const [x,z]=at(a0+step*0.85,RW+8);k.add('base',K.G.cyl,'#a08a5a',x,0.2,z,{sx:0.25,sy:0.4,sz:0.25});}
      // the cooking corner beside the sink: a hotplate on a counter, a pot and a kettle, a cupboard over both, a
      // dish rack, a bucket and a mop; a cloth over the counter's front instead of a door
      {const ac=a0+0.45/(RW+9),[cx,cz]=at(ac,RW+8.9);k.radial('base',pick(WOOD),ac,RW+9.1,0,1.5,0.6,0.85);k.radial('base',pick(FADED),ac,RW+9.1,0.1,1.4,0.62,0.6);
        k.radial('base','#2e2c2a',ac,RW+8.9,0.85,0.55,0.4,0.08);k.add('base',K.G.cyl6,'#6a6a66',cx,1.02,cz,{sx:0.15,sy:0.18,sz:0.15});
        const [kx,kz]=at(ac,RW+9.6);k.add('base',K.G.sph4,pick(['#8a3a2a','#3a5a6a','#7a7a70']),kx,0.98,kz,{sx:0.12,sy:0.1,sz:0.12});
        k.radial('base','#7a6a52',as,RW+6.4,1.55,2.0,0.32,0.7);k.radial('base','#5a4c3c',as,RW+6.4,1.53,2.04,0.34,0.03);
        k.radial('base','#8a8a80',as,RW+5.4,0.98,0.4,0.25,0.25);
        const [bx,bz]=at(a0+0.5/(RW+4.5),RW+4.6);k.add('base',K.G.cyl6,'#5a6a7a',bx,0.17,bz,{sx:0.17,sy:0.34,sz:0.17});k.pipe('base','#8a7a5a',bx+0.15,0,bz,bx+0.05,1.25,bz,0.015);}
      // on the side walls: a patched panel, a hanging of patchwork, two pictures kept for generations
      {const ap=a0+step-0.16/(RW+5);k.radial('base',pick(['#8a8478','#9a8e7a','#7e8478']),ap,RW+5.5,0.4,1.4,0.02,1.1);
        for(let q=0;q<9;q++){const r0=RW+7.2+(q%3)*0.42,y0=1.1+((q/3)|0)*0.42;k.radial('base',pick(FADED.concat(['#a85a4a','#4a6a8a','#c8a050'])),ap,r0,y0,0.4,0.02,0.4);}
        for(const [rr,yy,w,h] of [[RW+3.2,1.5,0.5,0.6],[RW+4.0,1.7,0.35,0.45]]){const aw=a0+0.16/(RW+4);k.radial('base','#4a3a2a',aw,rr,yy,w+0.06,0.02,h+0.06);k.radial('base',pick(['#b8a888','#8a9a8a','#a8988a']),aw+0.01/(RW+4),rr,yy+0.03,w,0.02,h);}}
      // by the door: a mat, and the floor worn pale from it to the curtain; a tally of days scratched by the frame
      {const ad=a0+step*0.3;k.radial('base','#5a4a3a',a,RW+0.9,0.004,0.7,1.0,0.012);k.radial('base','#8a7e6c',ad,(RW+X)/2,0.001,X-RW-1,0.75,0.004);
        const at2=a0+step*0.45;k.tangent('base','#d0c8b0',at2,X-0.1,1.3,0.55,0.02,0.7);for(let q=0;q<5;q++)k.tangent('base','#3a3430',at2-(0.2-q*0.1)/X,X-0.12,1.4,0.025,0.02,0.45);
        k.tangent('base','#3a3430',at2,X-0.12,1.62,0.5,0.02,0.025);}
      // a worn chair with a blanket over it by the window, a plant in a tin on the sill
      {const aw=a0+step*0.18,[x,z]=at(aw,RW+2.4);k.add('base',K.G.box,pick(WOOD),x,0.25,z,{ry:-aw,sx:0.6,sy:0.5,sz:0.6});k.add('base',K.G.box,pick(WOOD),x+Math.cos(aw)*0.28,0.75,z+Math.sin(aw)*0.28,{ry:-aw,sx:0.08,sy:0.9,sz:0.6});
        k.add('base',K.G.box,pick(FADED),x+Math.cos(aw)*0.15,0.55,z+Math.sin(aw)*0.15,{ry:-aw+0.1,sx:0.5,sy:0.06,sz:0.66});
        const [px,pz]=at(a0+step*0.75,RW+0.35);k.add('base',K.G.cyl6,'#8a8a84',px,1.05,pz,{sx:0.1,sy:0.16,sz:0.1});k.add('base',K.G.sph4,pick(['#4a7a3a','#5a8a40','#3e6a34']),px,1.25,pz,{sx:0.2,sy:0.22,sz:0.2});}
      // overhead: a water pipe run across the ceiling, a cable strung beside it on hooks, taped where it was mended
      {const ac=a0+step*0.08,[x0,z0]=at(ac,RW+0.5),[x1,z1]=at(ac,X-0.2);k.pipe('base','#6a6a62',x0,LH-0.75,z0,x1,LH-0.75,z1,0.04);k.pipe('base','#2a2826',x0,LH-0.85,z0,x1,LH-0.95,z1,0.012);
        for(let q=1;q<4;q++){const [x,z]=at(ac,RW+q*2.6);k.add('base',K.G.box,'#b8a060',x,LH-0.9,z,{ry:-ac,sx:0.1,sy:0.04,sz:0.04});}}}
    // the back room: bunks two high, or a bed folded against the wall, or a loft built in with a ladder
    {const ab=a0+step*0.28,kind=(i+v)%3;
      if(kind===0){for(const h of [0.25,1.45]){k.radial('base','#4a4038',ab,X+4.5,h,3.8,1.4,0.18);k.radial('base',pick(FADED),ab,X+4.5,h+0.18,3.6,1.3,0.22);k.radial('base','#d8d0c0',ab,X+6.0,h+0.4,0.5,1.0,0.14);}
        for(const dr of [-1.85,1.85])for(const dt of [-0.65,0.65]){const [x,z]=at(ab,X+4.5+dr);k.add('base',K.G.box,'#3a3430',x-Math.sin(ab)*dt,1.0,z+Math.cos(ab)*dt,{ry:-ab,sx:0.08,sy:2.0,sz:0.08});}}
      else if(kind===1){k.radial('base',pick(WOOD),ab,X+3.3,0.15,0.12,1.4,1.9);k.radial('base',pick(FADED),ab,X+5.2,0,3.6,1.4,0.45);k.radial('base','#d8d0c0',ab,X+6.6,0.45,0.5,1.0,0.12);}
      else{k.radial('base',pick(WOOD),a,(X+XB)/2+2,2.2,XB-X-4,step*((X+XB)/2)*0.9,0.12);for(const sd of [-1,1])k.radial('base','#4a4038',a+sd*step*0.4,X+4.5,0,0.12,0.12,2.2);
        k.radial('base',pick(FADED),a,(X+XB)/2+2,2.32,XB-X-5,step*((X+XB)/2)*0.6,0.2);
        for(const sd of [-0.25,0.25]){const [x0,z0]=at(a+sd/(X+3),X+3.6),[x1,z1]=at(a+sd/(X+3),X+4.6);k.pipe('base','#5a4a38',x0,0,z0,x1,2.3,z1,0.03);}
        k.radial('base',pick(WOOD),ab,X+5,0,3.4,1.2,0.42);}
      // laundry on a line across the back room
      {const r=(X+XB)/2,b0=a0+0.3/r,b1=a0+step-0.3/r,[x0,z0]=at(b0,r),[x1,z1]=at(b1,r);k.pipe('base','#c8c0b0',x0,2.6,z0,x1,2.6,z1,0.008);
        for(let q=0;q<4;q++){const aq=b0+(b1-b0)*(0.15+q*0.22),[x,z]=at(aq,r);k.add('base',K.G.box,pick(FADED),x,2.25,z,{ry:-aq-Math.PI/2,sx:0.45,sy:0.6,sz:0.012});}}
      // a lamp of its own in each room, none matching
      k.radial('lamp',pick(['#ffd9a0','#ffcf90','#ffe2b8']),a,RW+4,LH-0.9,0.4,0.4,0.15);k.radial('lamp','#ffc880',ab,X+6,LH-0.9,0.35,0.35,0.15);}
    // the passage behind: crates, a drum, a broom
    {const ap=a0+step*(0.2+R()*0.5),[x,z]=at(ap,RO-3);k.add('base',K.G.box,pick(['#7a6a4a','#5a5a4a','#6a5a4a']),x,0.35,z,{ry:-ap,sx:0.8,sy:0.7,sz:0.7});
      if(R()<0.5){const [x2,z2]=at(ap+0.6/RO,RO-2);k.add('base',K.G.cyl,pick(['#3a5a7a','#7a3a2a']),x2,0.45,z2,{sx:0.3,sy:0.9,sz:0.3});}}
    };
  // homes, three of them, so the floors are not all alike: each has its own paint, its own clutter, its own wear
  for(let v=0;v<3;v++){const k=K.kit();shell(k,{rooms:36,door:1.0,win:1.3,street:'res',v,memorial:(v*11+5)%36,room:(k,a0,step,i)=>homeRoom(k,a0,step,i,v)});
    for(let i=0;i<10;i++){const a=(i+0.3)/10*TAU;if(i%3===v)continue;k.radial('base','#5b6d48',a,19.5,0,1.2,2.4,0.7);k.radial('base','#4f7a3e',a,19.5,0.7,1.0,2.2,0.45);}  // planters
    for(let i=0;i<8;i++){const a=(i+0.8)/8*TAU;k.tangent('base',['#6a5a48','#5a5a5a','#7a6a50'][(i+v)%3],a,20.8,0,2.2,0.6,0.45);}                    // benches
    kits['home'+v]=k.build();}
  // ---- the commons: one level in six on the residential bands. Round the ring, in turn: a washroom, a laundry, a
  //      schoolroom, a clinic, a shared kitchen with its long table, a meeting room ----
  const commonsRoom=(k,a0,step,i)=>{const R=mkR(i*71+5),a=a0+step*0.5,t=i%6,at=(aa,r)=>[Math.cos(aa)*r,Math.sin(aa)*r];
    if(t===0){// a washroom: stalls along one side, a row of basins with a long mirror on the other, a bench to wait on
      for(let q=0;q<6;q++){const r=RW+4+q*3.4;k.radial('base','#8a9a9a',a0+step*0.08,r,0,0.08,1.6,2.1);k.radial('base','#6a7a7a',a0+step*0.08,r+1.7,0,1.4,0.05,2.0);}
      for(let q=0;q<7;q++){const r=RW+4+q*3.2,[x,z]=at(a0+step*0.9,r);k.add('base',K.G.box,'#d8d8d0',x,0.85,z,{ry:-a0-step*0.9,sx:0.6,sy:0.2,sz:0.5});k.add('base',K.G.box,'#8a8c8e',x,1.1,z,{ry:-a0-step*0.9,sx:0.04,sy:0.25,sz:0.04});}
      k.radial('base','#c0d0d8',a0+step*0.97,RW+14,1.3,20,0.03,0.8);k.radial('base','#6a5a48',a,RW+2,0,3,0.5,0.45);}
    else if(t===1){// a laundry: tubs and a mangle, lines and lines of washing
      for(let q=0;q<6;q++){const r=RW+4+q*3.6;k.radial('base','#8a8c8e',a0+step*0.25,r,0,1.6,1.0,0.9);k.radial('base','#6a8aa0',a0+step*0.25,r,0.9,1.4,0.8,0.02);k.radial('base','#5a5c5e',a0+step*0.25,r,0.9,0.2,0.2,0.4);}
      {const [x,z]=at(a0+step*0.75,RW+3);k.add('base',K.G.box,'#4a4c4e',x,0.5,z,{sx:0.8,sy:1.0,sz:0.6});k.add('base',K.G.cyl,'#8a7a5a',x,1.1,z,{rz:Math.PI/2,ry:-a0,sx:0.15,sy:0.8,sz:0.15});}
      for(let L=0;L<4;L++){const r=RW+8+L*4.5,b0=a0+0.4/r,b1=a0+step-0.4/r,[x0,z0]=at(b0,r),[x1,z1]=at(b1,r);k.pipe('base','#c8c0b0',x0,2.7,z0,x1,2.7,z1,0.01);
        for(let q=0;q<7;q++){const aq=b0+(b1-b0)*(0.08+q*0.13),[x,z]=at(aq,r);k.add('base',K.G.box,FADED[(q+L)%FADED.length],x,2.3,z,{ry:-aq-Math.PI/2,sx:0.5+R()*0.3,sy:0.7,sz:0.012});}}}
    else if(t===2){// a schoolroom: benches in rows facing a chalkboard on the side wall, chalk on it, a teacher's table
      const ac=a0+step*0.06;k.radial('base','#2e3e34',ac,RW+12,1.0,9,0.05,1.5);for(let q=0;q<14;q++){const [x,z]=at(ac+0.06/RW,RW+8+R()*8);k.add('base',K.G.box,'#e0e0d8',x,1.3+R()*1.1,z,{ry:-ac,rx:R()*3,sx:0.01,sy:0.25+R()*0.3,sz:0.012});}
      for(let row=0;row<5;row++){const aa=a0+step*(0.3+row*0.13);for(let q=0;q<3;q++){const r=RW+8+q*4;k.radial('base','#7a6a50',aa,r,0.42,3,0.35,0.05);k.radial('base','#6a5a48',aa,r,0,0.1,0.3,0.42);
        k.radial('base','#8a7a60',aa-0.012,r,0.7,3,0.35,0.04);}}
      k.radial('base','#7a5a3a',a0+step*0.17,RW+12,0,2.2,0.9,0.76);}
    else if(t===3){// a clinic: cots with white covers behind curtains on rails, a cabinet of bottles, a scrubbed table
      for(let q=0;q<5;q++){const r=RW+5+q*4.2;k.radial('base','#8a8c8e',a0+step*0.25,r,0,2,0.8,0.6);k.radial('base','#e8e6e0',a0+step*0.25,r,0.6,2,0.8,0.1);
        k.tangent('base','#c8d8d0',a0+step*0.25,r+1.3,0.2,2,0.02,1.9);k.tangent('base','#8a8c8e',a0+step*0.25,r+1.3,2.15,2.2,0.04,0.04);}
      const ak=a0+step*0.9;k.radial('base','#c8c8c0',ak,RW+10,0,1.6,0.4,1.9);for(let q=0;q<12;q++){const [x,z]=at(ak,RW+9.4+q*0.11);k.add('base',K.G.cyl6,['#a0603a','#e0e0d8','#5a7a5a'][q%3],x,0.5+(q%3)*0.55,z,{sx:0.04,sy:0.16,sz:0.04});}
      k.radial('base','#d8d4c8',a,RW+16,0,2.0,1.0,0.85);k.radial('glow','#f0f8ff',a,RW+16,LH-0.8,1.5,0.4,0.08);}
    else if(t===4){// a shared kitchen: stoves along the back, a hatch to the walkway, a long table with benches either side
      for(let q=0;q<3;q++){const as=a0+step*(0.25+q*0.25);k.tangent('base','#3a3c3e',as,RO-1.6,0,1.6,1.0,0.9);k.tangent('glow','#ff7030',as,RO-1.6,0.9,1.1,0.6,0.02);k.tangent('base','#5a5c5e',as,RO-1.7,2.4,1.8,1.2,0.5);}
      const r=RW+12;k.radial('base','#8a7458',a,r,0.74,14,1.0,0.06);for(let q=0;q<4;q++)k.radial('base','#5a4a3a',a,r-6+q*4,0,0.2,0.8,0.74);
      for(const sd of [-1,1])k.radial('base','#6a5a46',a+sd*0.95/r,r,0.44,14,0.35,0.05);
      for(let q=0;q<8;q++){const [x,z]=at(a+(R()-0.5)*0.6/r,r-6+q*1.7);k.add('base',K.G.cyl6,['#8a8a84','#a07a50','#d8d0c0'][q%3],x,0.84,z,{sx:0.12,sy:0.14,sz:0.12});}}
    else{// a meeting room: benches in rows facing a low table with candles, hangings of patched cloth on the back wall
      for(let row=0;row<6;row++){const r=RW+6+row*3;for(const sd of [-1,1])k.tangent('base','#6a5a46',a+sd*step*0.2,r,0.42,step*r*0.3,0.35,0.05);}
      k.tangent('base','#5a4a3a',a,RO-4,0,3,1.0,0.6);for(let q=0;q<5;q++){const [x,z]=at(a+(q-2)*0.25/(RO-4),RO-4);k.add('glow',K.G.cyl6,'#ffc070',x,0.72,z,{sx:0.04,sy:0.14,sz:0.04});}
      for(let q=0;q<5;q++)k.tangent('base',FADED[(q*3)%FADED.length],a+(q-2)*0.9/(RO-0.3),RO-0.3,1.0,0.85,0.02,2.2);}
    k.radial('lamp','#ffd9a0',a,(RW+RO)/2,LH-0.8,3,0.4,0.1);};
  {const k=K.kit();shell(k,{rooms:12,door:1.6,win:2.4,street:'res',v:1,memorial:7,room:commonsRoom,open:i=>true});
    // the walkway outside: benches to wait on, a queue's worn stretch of floor at the washroom door, more planters
    for(let i=0;i<12;i++){const a=(i+0.5)/12*TAU;k.tangent('base','#6a5a48',a,20.6,0,2.6,0.6,0.45);}
    kits.commons=k.build();}
  // offices: half as many rooms, desks in rows
  {const k=K.kit();shell(k,{rooms:12,room:(k,a0,step,i)=>{for(let d=0;d<4;d++){const a=a0+step*(0.2+d*0.2);k.radial('base','#8b8170',a,RW+12,0,3.4,1.0,0.78);k.radial('base','#3a3f44',a,RW+12.8,0.78,0.5,0.6,0.4);}
      k.radial('lamp','#e8f0ff',a0+step*0.5,(RW+RO)/2,LH-0.8,8,0.4,0.1);}});kits.office=k.build();}
  // the farms. Feeding ten thousand under lights takes more floor than the silo has, so the farm floors are stacked
  // in tiers and each grows its own way, drawn after real indoor farming: channels of greens with a film of water
  // running down them (white gullies on frames, two tiers); rafts floating on long lined ponds; racks of greens five
  // tiers high, a bar of light under every shelf; grain in deep troughs of soil under the old sodium lamps; a floor of
  // animals kept on the crops' waste; and a floor of the things that need no light (mushroom rooms, fish tanks, the
  // nutrient room, the seed store, the compost and the digester that makes gas of it). FARMV says which is where.
  {const G=K.G,WHITE='#e4e2da',LEAF=['#5a9a3e','#6aaa44','#4a8a3a','#7aa848','#5e9e52'],LED='#ff6ad8',SOD='#ffb050';
    const rings=(r0,r1,dr,seg,f)=>{for(let r=r0;r<=r1;r+=dr){const n=Math.floor(TAU*r/seg);for(let i=0;i<n;i++){const a=(i+(Math.round(r)%2)*0.5)/n*TAU;
      if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<(r<20?0.32:0.12))continue;f(a,r,i,TAU*r/n*0.9);}}};   // the way in from the landing kept clear
    const frame=(k,a,r,L,D,H)=>{for(const da of [-0.5,0.5])for(const dr of [-D/2,D/2])k.add('base',G.box,'#8a8c8e',Math.cos(a+da*L/r)*(r+dr),H/2,Math.sin(a+da*L/r)*(r+dr),{ry:-a,sx:0.06,sy:H,sz:0.06});};
    const farmKit=(v,f)=>{const k=K.kit();shell(k,{wall:false,lamps:16});f(k);kits['farm'+v]=k.build();};
    // 0: channels: white gullies two tiers high on frames, a plant row in each, the light bar over each tier
    farmKit(0,k=>rings(15,46,2.6,6,(a,r,i,L)=>{frame(k,a,r,L,1.3,2.6);
      for(const h of [0.85,2.05]){for(let g=0;g<4;g++){const rr=r-0.48+g*0.32;k.tangent('base',WHITE,a,rr,h,L,0.12,0.08);
          k.tangent('base',LEAF[(i+g+(h>1?2:0))%5],a,rr,h+0.08,L*0.96,0.2,0.1+((i*3+g)%4)*0.04);}
        k.tangent('lamp',LED,a,r,h+0.75,L*0.9,0.5,0.04);}
      if(i%5===0){k.tangent('base','#4a6a8a',a,r+0.75,0.3,0.6,0.25,0.25);}   // the return gutter's sump
      if(i%11===3)k.tangent('base','#3a5a3a',a,r-0.2,0.9,L*0.4,0.2,0.04);}));    // one channel gone green with algae
    // 1: rafts on ponds: long black-lined ponds, white boards edge to edge, rows of heads in them; air lines along the edge
    farmKit(1,k=>rings(16,45,3.6,6,(a,r,i,L)=>{k.tangent('base','#2a2e2e',a,r,0,L,2.6,0.42);k.tangent('base','#22303a',a,r,0.3,L*0.98,2.4,0.1);
      for(let b=0;b<4;b++){const aa=a+(b-1.5)*L/4/r;k.tangent('base',(i+b)%9?WHITE:'#c8c4b4',aa,r,0.4,L/4-0.04,2.36,0.05);
        for(let q=0;q<4;q++)k.tangent('base',LEAF[(i+b+q)%5],aa,r-0.9+q*0.6,0.45,L/4-0.3,0.34,0.14+((i+q)%3)*0.05);}
      k.tangent('base','#3a6aa0',a,r+1.32,0.45,L,0.04,0.04);
      for(const dr of [-0.7,0.7])k.tangent('lamp',LED,a,r+dr,LH-1.25,L*0.9,0.35,0.05);}));
    // 2: racks: five tiers of greens, a light bar under every shelf, the aisle between racks a metre wide
    farmKit(2,k=>rings(15,46,2.3,6,(a,r,i,L)=>{frame(k,a,r,L,1.2,3.3);
      for(let t=0;t<5;t++){const h=0.25+t*0.62;k.tangent('base','#9a9c9a',a,r,h,L,1.2,0.04);k.tangent('base',LEAF[(i+t)%5],a,r,h+0.04,L*0.95,1.0,0.12+((i+t)%3)*0.05);
        if(t<4||true)k.tangent('lamp',(i*5+t)%23===0?'#5a3a50':LED,a,r,h+0.55,L*0.92,0.6,0.03);}}));   // one bar in twenty-three dead
    // 3: grain: deep troughs of soil in two tiers, wheat standing in them, sodium lamps on gull-wing reflectors with
    //    their ballast boxes on the frames
    farmKit(3,k=>rings(15,46,2.8,6,(a,r,i,L)=>{frame(k,a,r,L,1.5,2.0);
      for(const h of [0.15,1.6]){k.tangent('base','#5a4a3a',a,r,h,L,1.5,0.38);k.tangent('base','#3e3226',a,r,h+0.38,L*0.98,1.38,0.02);
        for(let q=0;q<5;q++)k.tangent('base',(i+q+(h>1?1:0))%4?'#c8b862':'#9aa850',a,r-0.56+q*0.28,h+0.4,L*0.96,0.12,0.5+((i*7+q*3)%5)*0.05);}   // the wheat in rows
      k.tangent('lamp',SOD,a,r,LH-0.95,0.5,0.4,0.18);k.tangent('base','#9a9c9e',a,r,LH-0.78,0.9,0.9,0.05);
      k.tangent('base','#5a5c5e',a,r+0.8,1.4,0.35,0.15,0.25);}));
    // 4: animals: hens on litter with perches and nest boxes; pigs in concrete pens behind tube gates; rabbits in wire
    //    hutches over trays; goats with a raised platform; troughs, drinkers, a dung channel, big fans at the wall
    farmKit(4,k=>{const R=mkR(404),pick=L=>L[(R()*L.length)|0];
      const pen=(a0,a1,r0,r1,floor)=>{const am=(a0+a1)/2,rm=(r0+r1)/2;k.radial('base',floor,am,rm,0.003,r1-r0,(a1-a0)*rm,0.02);
        for(const aa of [a0,a1])for(const h of [0.35,0.75,1.1])k.radial('base','#a8acae',aa,rm,h,r1-r0,0.05,0.05);
        for(const h of [0.35,0.75,1.1])k.tangent('base','#a8acae',am,r0,h,(a1-a0)*r0,0.05,0.05);
        k.tangent('base','#2e2a22',am,r0-0.4,0.002,(a1-a0)*r0,0.5,0.03);};       // the dung channel along the front
      // hens: 0-120 degrees
      for(let p=0;p<6;p++){const a0=p*20*D,a1=a0+19*D;pen(a0,a1,18,44,'#b8a060');
        for(let q=0;q<45;q++){const a=a0+R()*(a1-a0),r=19+R()*24;k.add('base',G.sph4,R()<0.7?'#e8e2d0':'#8a5a3a',Math.cos(a)*r,0.17,Math.sin(a)*r,{ry:R()*6,sx:0.22,sy:0.18,sz:0.14});}
        for(let q=0;q<3;q++){const a=a0+(a1-a0)*(0.25+q*0.25);k.radial('base','#7a6248',a,36,0.7+q*0.15,8,0.06,0.06);}
        const an=a1-1.2/40;for(let q=0;q<6;q++)k.radial('base','#8a7050',an,24+q*3,0.6,2.6,0.6,0.6);
        k.radial('base','#8a8a84',(a0+a1)/2,30,0.15,14,0.25,0.15);}
      // pigs: 120-200
      for(let p=0;p<4;p++){const a0=(122+p*19.5)*D,a1=a0+18.5*D;pen(a0,a1,18,40,'#8a8478');
        for(let q=0;q<7;q++){const a=a0+(0.15+R()*0.7)*(a1-a0),r=21+R()*16,ry=R()*6,c=pick(['#d8a8a0','#c89890','#8a6a60','#e0b8b0']);
          k.add('base',G.box,c,Math.cos(a)*r,0.45,Math.sin(a)*r,{ry,sx:1.25,sy:0.62,sz:0.6});k.add('base',G.box,c,Math.cos(a)*r+Math.cos(ry)*0.7,0.5,Math.sin(a)*r-Math.sin(ry)*0.7,{ry,sx:0.35,sy:0.36,sz:0.36});}
        k.radial('base','#6a6e70',(a0+a1)/2,38,0.15,3,0.5,0.35);k.radial('base','#9aa0a4',a1-0.6/30,28,0.6,0.1,0.1,0.15);}
      // rabbits: 200-270, hutches three high in rows
      for(let r=19;r<=43;r+=4)for(let a=202*D;a<268*D;a+=2.6/r){for(let t=0;t<3;t++){const h=0.5+t*0.8;k.tangent('base','#8a8a80',a,r,h,1.9/1.0,0.9,0.03);
          k.tangent('base','#4a4a42',a,r,h-0.1,2.0,1.0,0.05);for(const dd of [-0.95,0.95])k.radial('base','#9a9a90',a+dd/r,r,h,0.9,0.03,0.65);
          if(R()<0.8)k.add('base',G.sph4,pick(['#e8e4dc','#8a7a6a','#5a4a3e','#c8b8a0']),Math.cos(a)*r,h+0.15,Math.sin(a)*r,{ry:R()*6,sx:0.22,sy:0.16,sz:0.15});}}
      // goats: 272-338, a pen on straw and a raised platform of planks
      pen(272*D,338*D,18,44,'#c8b070');k.radial('base','#7a6248',305*D,36,0,8,10,0.7);
      for(let q=0;q<14;q++){const a=(276+R()*58)*D,r=20+R()*22,ry=R()*6,c=pick(['#e8e0d0','#8a7a6a','#5a4e44','#c8a880']),y=(r>32&&r<40&&Math.abs(a-305*D)<0.15)?0.7:0;
        k.add('base',G.box,c,Math.cos(a)*r,y+0.6,Math.sin(a)*r,{ry,sx:0.95,sy:0.45,sz:0.38});k.add('base',G.box,c,Math.cos(a)*r+Math.cos(ry)*0.55,y+0.85,Math.sin(a)*r-Math.sin(ry)*0.55,{ry,sx:0.28,sy:0.3,sz:0.2});
        for(const dx of [-0.35,0.35])for(const dz of [-0.13,0.13])k.add('base',G.box,c,Math.cos(a)*r+Math.cos(ry)*dx+Math.sin(ry)*dz,y+0.2,Math.sin(a)*r-Math.sin(ry)*dx+Math.cos(ry)*dz,{sx:0.07,sy:0.4,sz:0.07});}
      // the feed store: sacks stacked, a mill, bins of the farms' waste for fodder
      for(let q=0;q<30;q++){const a=(341+R()*16)*D,r=20+R()*20;k.add('base',G.box,pick(['#c8b890','#b8a880','#a89870']),Math.cos(a)*r,0.2+((q%3))*0.38,Math.sin(a)*r,{ry:-a+R()*0.4,sx:0.9,sy:0.36,sz:0.55});}
      // fans in the wall, the floor's air changed far more often than any other's
      for(let q=0;q<10;q++){const a=(q+0.5)/10*TAU;k.add('base',G.disc,'#4a4c4e',Math.cos(a)*46.5,2.2,Math.sin(a)*46.5,{rz:Math.PI/2,ry:-a,sx:1.2,sy:0.3,sz:1.2});
        for(let b=0;b<4;b++)k.add('base',G.box,'#6a6c6e',Math.cos(a)*46.3,2.2,Math.sin(a)*46.3,{ry:-a,rx:b*Math.PI/4,sx:0.05,sy:2.0,sz:0.25});}});
    // 5: no light needed: mushroom rooms (enclosed, dim, misted, shelving and hanging columns), the fish tanks and their
    //    filters, the nutrient room, the seed store, the compost bays and the digester with its gas dome
    farmKit(5,k=>{const R=mkR(505),pick=L=>L[(R()*L.length)|0];
      const room=(a0,a1,r0,r1,col)=>{for(const aa of [a0,a1])k.radial('base',col,aa,(r0+r1)/2,0,r1-r0,0.15,LH-0.5);
        const am=(a0+a1)/2,dw=1.0/r0;k.tangent('base',col,(a0+am-dw)/2,r0,0,(am-dw-a0)*r0,0.15,LH-0.5);k.tangent('base',col,(am+dw+a1)/2,r0,0,(a1-am-dw)*r0,0.15,LH-0.5);k.tangent('base',col,am,r0,2.1,2*dw*r0,0.15,LH-2.6);
        k.tangent('base',col,am,r1,0,(a1-a0)*r1,0.15,LH-0.5);};
      // mushrooms: 5-85 degrees, two rooms
      for(const [a0,a1] of [[5,43],[47,85]]){const A0=a0*D,A1=a1*D;room(A0,A1,17,44,'#7a7e78');
        for(let r=19.5;r<=42;r+=2.4)for(let a=A0+1/r;a<A1-1/r;a+=2.2/r){for(let t=0;t<5;t++){const h=0.2+t*0.6;k.tangent('base','#7a7c7e',a,r,h,1.9,0.7,0.03);
            for(let q=0;q<4;q++)k.add('base',G.cyl6,pick(['#e8e0c8','#d8d0b8','#c8b898']),Math.cos(a+(q-1.5)*0.45/r)*r,h+0.17,Math.sin(a+(q-1.5)*0.45/r)*r,{sx:0.13,sy:0.3,sz:0.13});}}
        for(let q=0;q<8;q++){const a=A0+(A1-A0)*(q+0.5)/8;k.radial('base','#9aa0a4',a,30,LH-0.75,24,0.04,0.04);}
        k.radial('lamp','#c8d8ff',(A0+A1)/2,30,LH-0.6,1.2,0.3,0.06);}
      // fish: 92-178, round tanks, a settling cone on legs, the filter tanks, the blower; grow beds fed from them
      for(let q=0;q<10;q++){const a=(96+(q%5)*16)*D,r=q<5?22:34;k.add('base',G.cyl,q%2?'#2a4a6a':'#1e2224',Math.cos(a)*r,0.65,Math.sin(a)*r,{sx:1.9,sy:1.3,sz:1.9});
        k.add('base',G.disc,'#2a4a3a',Math.cos(a)*r,1.29,Math.sin(a)*r,{sx:1.8,sy:0.02,sz:1.8});
        k.add('base',G.cone,'#3a3c3e',Math.cos(a)*(r+4),1.6,Math.sin(a)*(r+4),{sx:0.9,sy:-1.2,sz:0.9});k.add('base',G.cyl,'#3a3c3e',Math.cos(a)*(r+4),2.5,Math.sin(a)*(r+4),{sx:0.9,sy:0.6,sz:0.9});for(let l=0;l<3;l++){const f=l/3*TAU;k.add('base',G.box,'#5a5c5e',Math.cos(a)*(r+4)+Math.cos(f)*0.8,1.1,Math.sin(a)*(r+4)+Math.sin(f)*0.8,{sx:0.08,sy:2.2,sz:0.08});}
        k.tangent('base','#5a4a3a',a,r+7.5,0,3.4,1.6,0.6);k.tangent('base',LEAF[q%5],a,r+7.5,0.6,3.2,1.4,0.3);}
      k.radial('base','#4a6a8a',172*D,30,0,2,1.4,1.2);k.radial('base','#c8a03a',172*D,28.7,0.3,0.4,1.2,0.6);
      // the nutrient room: the two stock tanks, the acid, the dosing pumps on a board, the meters lit, the headers out
      {const b=190*D;for(const [dd,c] of [[-2.5,'#e8e6e0'],[-0.5,'#3a6aa0'],[1.4,'#e0d8a0']]){const a=b+dd/30;k.add('base',G.cyl,c,Math.cos(a)*30,0.9,Math.sin(a)*30,{sx:0.8,sy:1.8,sz:0.8});}
        k.radial('base','#3a4448',b,33,0.9,0.3,4,1.8);for(let q=0;q<4;q++)k.radial('glow',['#70ff90','#ffd070','#70ff90','#ff6050'][q],b+(q-1.5)*0.6/33,32.8,1.9,0.04,0.25,0.12);
        for(let q=0;q<4;q++)k.radial('base','#5a6a7a',b+(q-1.5)*0.6/33,32.8,1.2,0.2,0.3,0.3);
        for(const dd of [-1,1])k.radial('base','#e8e6e0',b+dd*1.6/30,26,2.6,8,0.1,0.1);}
      // the seed store: a cold room, steel shelves of sealed tins, a ledger on a stand
      {const a0=205*D,a1=240*D;room(a0,a1,20,32,'#a8b0b4');for(let r=22;r<31;r+=1.6)for(let a=a0+1.2/r;a<a1-1.2/r;a+=1.6/r)for(let t=0;t<4;t++){k.tangent('base','#8a8c8e',a,r,0.3+t*0.55,1.4,0.5,0.03);
          for(let q=0;q<4;q++)k.add('base',G.cyl6,pick(['#b8b0a0','#8a8478','#c8c0a8']),Math.cos(a+(q-1.5)*0.33/r)*r,0.42+t*0.55,Math.sin(a+(q-1.5)*0.33/r)*r,{sx:0.11,sy:0.2,sz:0.11});}
        k.radial('lamp','#e0f0ff',(a0+a1)/2,26,LH-0.6,1,0.3,0.06);}
      // compost: three-sided bays of planks with heaps in them, turned by hand; the digester: an insulated tank, its
      // gas dome on top, the pipe off to the boilers, a flare stack with its little flame
      for(let q=0;q<6;q++){const a=(250+q*7)*D;for(const dd of [-1.4,1.4])k.radial('base','#6a5238',a+dd/40,40,0,3,0.12,1.2);k.tangent('base','#6a5238',a,41.5,0,2.8,0.12,1.2);
        k.add('base',G.sph,['#4a3a28','#5a4630','#3e3020'][q%3],Math.cos(a)*40,0.2,Math.sin(a)*40,{sx:1.3,sy:0.9,sz:1.3});}
      {const a=310*D,r=32;k.add('base',G.cyl,'#7a7a6e',Math.cos(a)*r,1.6,Math.sin(a)*r,{sx:4.2,sy:3.2,sz:4.2});k.add('base',G.sph,'#8a8478',Math.cos(a)*r,3.2,Math.sin(a)*r,{sx:3.8,sy:0.6,sz:3.8});
        for(let q=0;q<10;q++){const f=q/10*TAU;k.add('base',G.box,'#5a5a52',Math.cos(a)*r+Math.cos(f)*4.22,1.6,Math.sin(a)*r+Math.sin(f)*4.22,{sx:0.15,sy:3.2,sz:0.15});}
        k.pipe('base','#c8a020',Math.cos(a)*r,3.5,Math.sin(a)*r,Math.cos(a)*46,3.5,Math.sin(a)*46,0.08);
        const fa=a+8/r;k.add('base',G.cyl,'#5a5c5e',Math.cos(fa)*40,1.8,Math.sin(fa)*40,{sx:0.12,sy:3.6,sz:0.12});k.add('glow',G.cone,'#ff9a30',Math.cos(fa)*40,3.75,Math.sin(fa)*40,{sx:0.12,sy:0.3,sz:0.12});}});
    kits.farm=kits.farm0;}
  // IT: racks of machines in rows, their lights
  {const k=K.kit();shell(k,{rooms:12,room:(k,a0,step,i)=>{for(let j=0;j<3;j++){const a=a0+step*(0.25+j*0.25);
        k.radial('base','#2c3036',a,RW+13,0,18,0.9,2.3);
        for(let m=0;m<5;m++)for(let b=0;b<4;b++)if((m*3+b+i+j)%3)k.radial((m+b+i)%2?'glow':'blink',(m+b)%3?'#7dffb0':(m+b)%2?'#ffb040':'#8ad0ff',a,RW+6.5+m*3.4,0.45+b*0.5,2.6,0.96,0.07);
        k.radial('base','#1e2226',a,RW+13,2.3,18,1.0,0.12);for(let m=0;m<3;m++)k.pipe('base','#2a3a5a',Math.cos(a)*(RW+5+m*6),2.42,Math.sin(a)*(RW+5+m*6),Math.cos(a)*(RW+5+m*6),LH-0.3,Math.sin(a)*(RW+5+m*6),0.08);}
      k.radial('lamp','#d8ecff',a0+step*0.5,(RW+RO)/2,LH-0.8,10,0.3,0.1);}});
    kits.it=k.build();}
  // the bazaar: flats behind, and the walkway packed with stalls in two rings under awnings of patched cloth: cloth,
  // tools, food, mended things; crates stacked behind, lamps hung on strings
  {const k=K.kit();shell(k,{rooms:36,door:1.0,win:1.3,street:'res',v:2,memorial:20,room:(k,a0,step,i)=>homeRoom(k,a0,step,i,2)});
    const R=mkR(74),at=(aa,r)=>[Math.cos(aa)*r,Math.sin(aa)*r];
    for(const [r,n] of [[18.6,26],[14.8,20]])for(let i=0;i<n;i++){const a=(i+0.5)/n*TAU;if(Math.abs(((a+Math.PI)%TAU)-Math.PI)<0.32)continue;const t=(i+n)%4;
      const L=r*TAU/n*0.62;k.tangent('base','#6e5a44',a,r,0,L,1.1,0.9);
      // the awning: three pieces of different cloth sewn together, on poles
      for(let q=0;q<3;q++)k.tangent('base',['#b8402e','#d0a030','#3a6aa0','#4a8a4a','#9a4a8a','#a89a80','#7a8a9a'][(i*3+q)%7],a+(q-1)*L/3/r,r-0.2,2.3+q*0.03,L/3+0.05,1.9,0.06);
      for(const sd of [-1,1]){const [x,z]=at(a+sd*L/2/r,r-1.0);k.add('base',K.G.cyl6,'#4a4038',x,1.15,z,{sx:0.04,sy:2.3,sz:0.04});}
      // the goods, by the kind of stall
      for(let q=0;q<5;q++){const aq=a+(q-2)*L/5.5/r,[x,z]=at(aq,r);
        if(t===0)k.add('base',K.G.cyl,['#a8402e','#3a6a8a','#c8b890','#6a8a4a','#8a4a7a'][(q+i)%5],x,1.05,z,{rz:Math.PI/2,ry:-aq,sx:0.14,sy:0.9,sz:0.14});
        else if(t===1)k.add('base',K.G.box,['#4a4e52','#6a6e72','#8a5a3a'][q%3],x,0.95,z,{ry:R()*3,sx:0.4,sy:0.06,sz:0.08});
        else if(t===2){k.add('base',K.G.box,'#7a6040',x,0.98,z,{ry:-aq,sx:0.4,sy:0.16,sz:0.3});for(let m=0;m<3;m++)k.add('base',K.G.sph4,['#c8a040','#7aa040','#c86030','#a0a080'][(q+m)%4],x+(m-1)*0.1,1.1,z,{sx:0.07,sy:0.07,sz:0.07});}
        else k.add('base',R()<0.5?K.G.box:K.G.cyl6,['#8a8a84','#6a5a4a','#a08a6a','#5a6a7a'][(q+i)%4],x,1.05,z,{sx:0.15+R()*0.1,sy:0.2,sz:0.15+R()*0.1});}
      // crates behind, a lamp hung from the awning
      {const [x,z]=at(a+L/3/r,r+1.1);k.add('base',K.G.box,'#7a6a4a',x,0.3,z,{ry:-a,sx:0.7,sy:0.6,sz:0.6});if(i%2)k.add('base',K.G.box,'#6a5a3a',x,0.85,z,{ry:-a+0.2,sx:0.6,sy:0.5,sz:0.5});}
      {const [x,z]=at(a,r-0.6);k.pipe('base','#2a2a28',x,2.3,z,x,1.95,z,0.01);k.add('lamp',K.G.sph4,'#ffc878',x,1.88,z,{sx:0.09,sy:0.11,sz:0.09});}}
    // strings of lamps across the walkway, from the wall to the rail
    for(let i=0;i<14;i++){const a=(i+0.25)/14*TAU;for(let q=0;q<6;q++){const [x,z]=at(a,RS+1.5+q*1.7);k.add('lamp',K.G.sph4,'#ffd090',x,3.0-Math.sin(q/5*Math.PI)*0.35,z,{sx:0.06,sy:0.08,sz:0.06});}
      k.radial('base','#2a2a28',a,(RS+1.5+RW)/2,3.0,RW-RS-1.5,0.01,0.01);}
    kits.bazaar=k.build();}
  // ---- shared bits of industry: a gauge, a valve wheel, a stencilled warning, yellow paint on the floor ----
  const at=(a,r)=>[Math.cos(a)*r,Math.sin(a)*r];
  const wheel=(k,a,r,h,rad=0.22,col='#a8281c')=>{const [x,z]=at(a,r);k.add('base',K.ring(rad*0.8,rad,0.05,10),col,x,h,z,{rz:Math.PI/2,ry:-a});k.add('base',K.G.box,col,x,h-0.025,z,{ry:-a,sx:0.04,sy:0.04,sz:rad*1.6});};
  const dial=(k,a,r,h)=>{const [x,z]=at(a,r);k.add('base',K.G.disc8,'#e0dccc',x,h,z,{rz:Math.PI/2,ry:-a-Math.PI/2,sx:0.12,sy:0.04,sz:0.12});k.add('base',K.G.disc8,'#2a2c2e',x,h,z,{rz:Math.PI/2,ry:-a-Math.PI/2,sx:0.14,sy:0.03,sz:0.14});};
  const yline=(k,a0,a1,r)=>{const am=(a0+a1)/2;k.tangent('base','#c8a020',am,r,0.003,(a1-a0)*r,0.12,0.006);};
  const stencil=(k,a,r,h,w=0.9)=>{k.tangent('base','#c8a020',a,r,h,w,0.02,0.3);for(let q=0;q<4;q++)k.tangent('base','#1e1e1c',a+(q-1.5)*w*0.22/r,r-0.012,h+0.06,w*0.14,0.01,0.18);};
  const stain=(k,a,r,sz)=>{const [x,z]=at(a,r);k.add('base',K.G.disc8,'#3a342c',x,0.006,z,{sx:sz,sy:0.004,sz:sz*0.7});};
  // a hoist: a chain and hook through a hatch in the ceiling, a railed hatch in the floor below it, a load on the hook
  const hoist=(k,a,r)=>{const [x,z]=at(a,r);k.add('base',K.G.box,'#3a3c3e',x,LH-0.6,z,{ry:-a,sx:2.6,sy:0.3,sz:0.3});k.pipe('base','#2a2a28',x,LH-0.6,z,x,1.2,z,0.03,K.G.cyl);
    k.add('base',K.G.box,'#c8a020',x,1.1,z,{sx:0.2,sy:0.25,sz:0.12});k.add('base',K.G.box,'#7a6a4a',x,0.75,z,{ry:-a,sx:0.9,sy:0.6,sz:0.7});
    k.add('base',K.ring(0.9,1.0,0.05,16),'#c8a020',x,1.05,z);for(let q=0;q<4;q++){const b=q/4*TAU+0.4;k.add('base',K.G.cyl6,'#c8a020',x+Math.cos(b)*0.95,0.52,z+Math.sin(b)*0.95,{sx:0.03,sy:1.05,sz:0.03});}
    k.add('base',K.G.disc8,'#141414',x,0.01,z,{sx:0.85,sy:0.01,sz:0.85});};
  // supply: rooms of shelves and crates, and every third room a workshop where things are made and mended
  {const k=K.kit();shell(k,{rooms:12,room:(k,a0,step,i)=>{if(i%3===1){supplyShop(k,a0,step,i);return;}
      for(let j=0;j<3;j++){const a=a0+step*(0.22+j*0.28);k.radial('base','#6a645a',a,RW+13,0,20,1.0,2.6);
        for(let m=0;m<5;m++)k.radial('base',['#8a6a44','#6a7a5a','#9a8a6a','#5a6a7a'][(m+i+j)%4],a,RW+6+m*3.6,0.1+((m+j)%3)*0.9,1.4,0.9,0.7);}
      // sacks heaped by the door, bins along the back, a hoist to the levels above and below
      for(let m=0;m<7;m++){const aa=a0+step*(0.08+(m%4)*0.03),rr=RW+2+(m>>2)*1.0+(m%2)*0.4;k.add('base',G.sph4,['#b8a070','#a89060','#c0aa80'][m%3],Math.cos(aa)*rr,0.32+(m>3?0.45:0),Math.sin(aa)*rr,{sx:0.45,sy:0.3,sz:0.35,ry:m});}
      for(let m=0;m<4;m++){const aa=a0+step*(0.15+m*0.2);k.add('base',G.cyl,['#4a6a5a','#6a5a3a','#4a5a6a'][m%3],Math.cos(aa)*(RO-1.3),0.55,Math.sin(aa)*(RO-1.3),{sx:0.5,sy:1.1,sz:0.5});}
      if(i%3===2)hoist(k,a0+step*0.5,RO-6);
      k.radial('lamp','#ffe6b8',a0+step*0.5,(RW+RO)/2,LH-0.8,10,0.3,0.1);}});kits.supply=k.build();}
  function supplyShop(k,a0,step,i){const a=a0+step*0.5;
    // lathes along one side: bed, headstock, chuck, tailstock, a tray of swarf under each
    for(let q=0;q<3;q++){const r=RW+5+q*6,al=a0+step*0.18;k.radial('base','#3e4a44',al,r,0,2.6,0.7,0.9);k.radial('base','#5a6a62',al,r-1.0,0.9,0.7,0.6,0.55);
      const [x,z]=at(al,r-0.55);k.add('base',G.cyl,'#8a8c88',x,1.15,z,{rz:Math.PI/2,ry:-al,sx:0.18,sy:0.15,sz:0.18});k.radial('base','#5a6a62',al,r+0.9,0.9,0.4,0.4,0.4);
      k.radial('base','#4a4c4e',al,r,0.02,2.4,0.9,0.04);dial(k,al,r-1.0,1.25);}
    // a pillar drill; a forge of brick with its fire, its hood and flue, an anvil and a quench tub before it
    {const ad=a0+step*0.45,[x,z]=at(ad,RW+6);k.add('base',G.cyl,'#4a5a52',x,1.0,z,{sx:0.07,sy:2.0,sz:0.07});k.add('base',G.box,'#4a5a52',x,1.75,z,{ry:-ad,sx:0.5,sy:0.4,sz:0.3});
      k.add('base',G.box,'#3a3c3e',x,0.95,z,{ry:-ad,sx:0.4,sy:0.04,sz:0.4});k.add('base',G.box,'#3a3c3e',x,0.04,z,{ry:-ad,sx:0.6,sy:0.08,sz:0.5});}
    {const af=a0+step*0.72,r=RO-4;k.radial('base','#7a4a3a',af,r,0,2.2,1.6,0.85);k.radial('glow','#ff6a1a',af,r,0.86,1.2,0.9,0.02);
      k.radial('base','#3a3634',af,r,2.2,2.4,1.8,0.5);const [x,z]=at(af,r);k.add('base',G.cyl,'#2a2826',x,3.2,z,{sx:0.22,sy:1.6,sz:0.22});
      const [x2,z2]=at(af,r-2.4);k.add('base',G.box,'#2a2a2a',x2,0.65,z2,{ry:-af,sx:0.7,sy:0.18,sz:0.25});k.add('base',G.box,'#3a3a38',x2,0.3,z2,{sx:0.3,sy:0.6,sz:0.3});
      const [x3,z3]=at(af+0.9/r,r-1.6);k.add('base',G.cyl,'#5a4a3a',x3,0.3,z3,{sx:0.35,sy:0.6,sz:0.35});k.add('base',G.disc8,'#2a3a40',x3,0.6,z3,{sx:0.32,sy:0.01,sz:0.32});
      stain(k,af,r-2.6,1.2);}
    // a bench under a board of tools; parts in trays; scrap in a bin; the floor marked yellow round the machines
    {const ab=a0+step*0.9;k.radial('base','#6a5a46',ab,RW+9,0,4.5,0.8,0.9);k.radial('base','#4a4a46',a0+step*0.97,RW+9,1.1,4.5,0.03,1.2);
      for(let q=0;q<10;q++){const [x,z]=at(a0+step*0.965,RW+7+q*0.45);k.add('base',G.box,['#8a8c88','#6a3a2a','#c8a020'][q%3],x,1.4+(q%3)*0.3,z,{ry:-ab,sx:0.02,sy:0.35,sz:0.05});}
      for(let q=0;q<4;q++){const [x,z]=at(ab,RW+7.5+q*1.0);k.add('base',G.box,'#5a5a56',x,0.95,z,{ry:-ab,sx:0.4,sy:0.08,sz:0.3});}
      const [x,z]=at(a0+step*0.6,RO-1.5);k.add('base',G.cyl,'#4a4a46',x,0.5,z,{sx:0.6,sy:1.0,sz:0.6});}
    yline(k,a0+step*0.05,a0+step*0.35,RW+3.6);yline(k,a0+step*0.05,a0+step*0.35,RW+18);stencil(k,a0+step*0.55,RW+0.2,1.8);
    // racks of bar stock and plate along the back wall; a welding cart with its bottles; a second bench with a vice
    for(let q=0;q<3;q++){const ar=a0+step*(0.12+q*0.12);k.tangent('base','#4a4c4e',ar,RO-1.2,0,2.6,0.8,0.08);for(let lv=0;lv<3;lv++){k.tangent('base','#3a3c3e',ar,RO-1.2,0.6+lv*0.8,2.6,0.8,0.05);
      for(let m=0;m<6;m++){const [x,z]=at(ar+(m-2.5)*0.4/RO,RO-1.2);k.add('base',G.cyl6,['#7a7c80','#6a4a32','#8a8c88'][(m+lv)%3],x,0.7+lv*0.8,z,{rz:Math.PI/2,ry:-ar-Math.PI/2,sx:0.04+(m%2)*0.03,sy:0.75,sz:0.04+(m%2)*0.03});}}}
    {const aw=a0+step*0.58,[x,z]=at(aw,RW+12);k.add('base',G.box,'#5a3a2a',x,0.45,z,{ry:-aw,sx:0.7,sy:0.7,sz:0.5});for(const d of [-0.15,0.15])k.add('base',G.cyl,d<0?'#2a5a3a':'#8a2a1a',x+d,1.2,z,{sx:0.11,sy:0.9,sz:0.11});
      k.pipe('base','#1a1a18',x,1.0,z,x+0.6,0.1,z+0.4,0.02);}
    {const ab=a0+step*0.35;k.radial('base','#6a5a46',ab,RO-9,0,3.2,0.8,0.9);const [x,z]=at(ab,RO-10.2);k.add('base',G.box,'#3a4a5a',x,1.05,z,{ry:-ab,sx:0.3,sy:0.2,sz:0.2});
      for(let q=0;q<5;q++){const [px,pz]=at(ab+(q-2)*0.1/(RO-9),RO-8.5+q*0.3);k.add('base',G.box,['#8a8c88','#c8a020','#6a3a2a'][q%3],px,0.94,pz,{ry:q,sx:0.25,sy:0.05,sz:0.06});}}
    k.radial('lamp','#ffe6b8',a,(RW+RO)/2,LH-0.8,10,0.3,0.1);}
  // water treatment: settling tanks round the ring with walkways over them, sand filters between, pumps on their
  // plinths, the ring main overhead, gauges and valve wheels, grating over the drains, puddles, a board of lamps
  {const k=K.kit();shell(k,{wall:false,lamps:14});
    for(let i=0;i<10;i++){const a=(i+0.5)/10*TAU,x=Math.cos(a)*36,z=Math.sin(a)*36;k.add('base',G.cyl,'#5d7a86',x,1.8,z,{sx:4.2,sy:3.6,sz:4.2});k.add('base',G.cyl,'#3e5560',x,3.65,z,{sx:4.4,sy:0.12,sz:4.4});
      k.add('base',G.disc8,'#2a4a50',x,3.6,z,{sx:3.9,sy:0.05,sz:3.9});k.radial('base','#4a4c4e',a,36,3.72,8.6,0.8,0.06);for(const sd of [-1,1])k.radial('base','#c8a020',a+sd*0.42/36,36,4.25,8.6,0.04,0.04);
      k.pipe('base','#7a6a52',x,3.3,z,Math.cos(a)*24,3.3,Math.sin(a)*24,0.25);
      // a valve on each tank's line, and its gauge; rust run down the tank's side
      wheel(k,a,27,3.3,0.3);dial(k,a+0.02,26.5,2.9);k.tangent('base','#6a4a32',a+0.06,40.15,0.6,0.15,0.02,2.6);
      // between the tanks: a pair of sand filters with their valve trees, and a pump on a plinth
      const af=a+TAU/20;for(const dr of [-2.4,2.4]){const [fx,fz]=at(af,31+dr);k.add('base',G.cyl,'#6a7a72',fx,1.3,fz,{sx:0.9,sy:2.6,sz:0.9});k.add('base',G.sph4,'#6a7a72',fx,2.6,fz,{sx:0.9,sy:0.4,sz:0.9});
        k.pipe('base','#3a5a6a',fx,2.9,fz,fx,3.3,fz,0.1);wheel(k,af,31+dr-1.0,1.2,0.18);}
      {const [px,pz]=at(af,44.5);k.add('base',G.box,'#8a857a',px,0.15,pz,{ry:-af,sx:1.2,sy:0.3,sz:2.4});k.add('base',G.cyl,'#3a6a5a',px,0.7,pz,{rz:Math.PI/2,ry:-af-Math.PI/2,sx:0.35,sy:1.0,sz:0.35});
        const [qx,qz]=at(af+0.9/44.5,44.5);k.add('base',G.box,'#2a5a7a',qx,0.65,qz,{ry:-af,sx:0.7,sy:0.7,sz:0.7});k.pipe('base','#3a5a6a',qx,1.0,qz,qx,3.0,qz,0.12);
        stain(k,af+0.4/44.5,43.5,0.8);}
      // the drain grating, wet round it
      {const [gx,gz]=at(af,38.5);k.add('base',G.box,'#2a2c2e',gx,0.01,gz,{ry:-af,sx:1.6,sy:0.02,sz:0.8});k.add('base',G.disc8,'#2e3a3e',gx,0.005,gz,{sx:1.8,sy:0.004,sz:1.2});}}
    k.add('base',K.ring(23.6,24.2,0.5,48),'#7a6a52',0,3.6,0);k.add('base',K.ring(44,44.5,0.4,48),'#6a7a80',0,0.4,0);
    k.add('base',K.ring(46.6,46.9,0.3,64),'#3a6a8a',0,3.4,0);k.add('base',K.ring(46.6,46.9,0.3,64),'#7a6a3a',0,2.9,0);
    for(let i=0;i<24;i++){const a=i/24*TAU;k.radial('base','#c8a020',a,46.75,3.25,0.1,0.35,0.06);}
    // the control board: lamps for each tank, gauges, a stool
    {const ab=0.3;k.tangent('base','#5a6a62',ab,48.6,0,4.0,0.6,1.9);for(let q=0;q<10;q++){const [x,z]=at(ab+(q-4.5)*0.35/48,48.25);k.add(q%4?'glow':'blink',G.box,q%3?'#60e080':'#ffb030',x,1.55,z,{ry:-ab,sx:0.02,sy:0.08,sz:0.08});}
      for(let q=0;q<3;q++)dial(k,ab+(q-1)*1.0/48,48.25,1.2);stencil(k,ab,48.27,0.55,1.4);}
    // after the filters: the lamp tubes that kill what the sand lets through, a baffled tank where the chlorine has
    // time to work, and the pressure tank that keeps the mains up between the pumps' runs
    for(let q=0;q<3;q++){const a=(200+q*5)*D;k.add('base',G.cyl,'#c8ccd0',Math.cos(a)*30,1.1,Math.sin(a)*30,{rx:Math.PI/2,ry:-a,sx:0.22,sy:2.2,sz:0.22});
      k.add('glow',G.box,'#a0c8ff',Math.cos(a)*30.25,1.1,Math.sin(a)*30.25,{ry:-a,sx:0.04,sy:0.08,sz:0.6});}
    {const a=225*D;k.tangent('base','#7a7a72',a,26,0,9,4,1.6);for(let q=1;q<5;q++)k.radial('base','#6a6a62',a+(q-2.5)*1.8/26,26.6,0,2.8,0.15,1.7);
      k.tangent('base','#2e4a50',a,26,1.45,8.8,3.8,0.05);}
    {const a=250*D,[x,z]=at(a,30);k.add('base',G.cyl,'#5a6e7a',x,1.9,z,{sx:1.1,sy:3.0,sz:1.1});k.add('base',G.sph,'#5a6e7a',x,3.4,z,{sx:1.1,sy:0.5,sz:1.1});k.add('base',G.sph,'#5a6e7a',x,0.4,z,{sx:1.1,sy:0.5,sz:1.1});
      k.add('glow',G.box,'#a8d8ff',x-Math.cos(a)*1.12,1.9,z-Math.sin(a)*1.12,{ry:-a,sx:0.04,sy:1.4,sz:0.08});}
    kits.water=k.build();}
  // the silo's sewage, cleaned to be used again: long aeration basins of brown water churned by the air bubbled up
  // through it (the blowers that push it the loudest machines on the floor), a round clarifier with its scraper bridge,
  // the sludge tank that feeds the digesters, and the press that squeezes what is left
  {const k=K.kit();shell(k,{wall:false,lamps:14});const R=mkR(707),pick=L=>L[(R()*L.length)|0];
    for(let q=0;q<4;q++){const a=(20+q*38)*D,L=30*D*30;
      for(const dr of [-4.55,4.55])k.tangent('base','#a8a49a',a,30+dr,0,L,0.3,1.5);for(const sd of [-1,1])k.radial('base','#a8a49a',a+sd*(L/2-0.15)/30,30,0,9.4,0.3,1.5);k.tangent('base','#6a6438',a,30,1.18,L-0.3,8.8,0.04);
      for(let f=0;f<60;f++){const aa=a+(R()-0.5)*(L-1)/30,rr=26+R()*8;k.add('base',G.sph4,pick(['#e8e0c8','#f0ead8','#d8d0b0']),Math.cos(aa)*rr,1.27,Math.sin(aa)*rr,{sx:0.4+R()*0.8,sy:0.06,sz:0.3+R()*0.6});}
      for(const dr of [-4.8,4.8])k.tangent('base','#3a6aa0',a,30+dr,1.6,L,0.12,0.12);
      k.tangent('base','#4a4c4e',a,30,1.55,L,0.9,0.05);for(const dr of [-0.45,0.45])k.tangent('base','#c8a020',a,30+dr,2.6,L,0.04,0.04);}
    {const a=200*D,r=32,[x,z]=at(a,r);k.add('base',G.cyl,'#8a867c',x,1.1,z,{sx:8,sy:2.2,sz:8});k.add('base',G.disc,'#4a5a4a',x,2.15,z,{sx:7.6,sy:0.05,sz:7.6});
      k.add('base',K.ring(7.6,8.0,0.2,32),'#6a6a62',x,2.2,z);k.add('base',G.box,'#4a4c4e',x,2.5,z,{ry:0.7,sx:16,sy:0.3,sz:1.0});k.add('base',G.box,'#c8a020',x,3.0,z,{ry:0.7,sx:16,sy:0.05,sz:0.05});
      k.add('base',G.cyl,'#5a5c5e',x,2.6,z,{sx:0.5,sy:0.6,sz:0.5});}
    {const a=232*D,[x,z]=at(a,36);k.add('base',G.cyl,'#6a5e4a',x,1.7,z,{sx:2.6,sy:3.4,sz:2.6});k.add('base',G.cone,'#6a5e4a',x,3.7,z,{sx:2.6,sy:0.6,sz:2.6});
      const [px,pz]=at(a+6/36,36);k.add('base',G.box,'#5a6a7a',px,1.0,pz,{ry:-a,sx:1.6,sy:2.0,sz:3.4});k.add('base',G.box,'#4a3a28',px,0.15,pz,{ry:-a,sx:2.0,sy:0.3,sz:3.6});}
    for(let q=0;q<4;q++){const a=(260+q*12)*D;k.radial('base','#6a6660',a,44,0,2.4,1.6,0.3);k.radial('base','#3a6a8a',a,44,0.3,1.8,1.2,1.2);
      k.add('base',G.cyl,'#8a8a84',Math.cos(a)*42.4,1.2,Math.sin(a)*42.4,{sx:0.45,sy:1.6,sz:0.45});k.radial('base','#c8a020',a,45.4,0.3,0.5,1.25,0.9);
      k.pipe('base','#3a6aa0',Math.cos(a)*42.4,2.0,Math.sin(a)*42.4,Math.cos(a)*42.4,3.6,Math.sin(a)*42.4,0.15);}
    k.add('base',K.ring(42.25,42.55,0.3,64,250*D,60*D+TAU*0.55),'#3a6aa0',0,3.75,0);
    kits.water1=k.build();}
  // the air plant: air handlers in a ring (their grey boxes of mixing, filters, coils and fan, a gauge across the
  // filters, a drain from the coil's pan), the main riser up the silo, the scrubber's two columns (the solution takes the
  // breath's carbon in one and gives it up in the other, and the gas goes up the line to the farms), the cells that
  // split water for oxygen, and on a post the readings everyone checks: oxygen and carbon in the air
  {const k=K.kit();shell(k,{wall:false,lamps:14});
    for(let q=0;q<7;q++){const a=(q*40+10)*D,L=9;k.tangent('base','#7e8c86',a,41,0,L,2.6,2.6);k.tangent('base','#5a6460',a,41,0,L+0.1,2.7,0.15);
      {const af=a+(L/2-1)/41,[x,z]=at(af,39.4);k.add('base',G.cyl,'#4a6a8a',x,1.3,z,{rx:Math.PI/2,ry:-a,sx:0.45,sy:1.1,sz:0.45});}
      for(let sct=0;sct<5;sct++){const aa=a+(sct-2)*L/5/41;k.tangent('base','#6a6e70',aa,39.68,0.15,0.04,0.02,2.3);if(sct%2)k.tangent('base','#9a9e9e',aa,39.67,0.4,1.0,0.02,1.6);}
      k.tangent('base','#4a4c4e',a,39.66,1.0,0.06,0.02,0.06);dial(k,a-L/5/41,39.62,1.8);
      k.pipe('base','#4a6a4a',Math.cos(a)*39.8,0.1,Math.sin(a)*39.8,Math.cos(a)*38.5,0.02,Math.sin(a)*38.5,0.05);
      k.tangent('base','#9a9c9e',a,41,2.6,1.6,1.2,LH-3.1);k.radial('base','#9a9c9e',a,32,LH-1.0,18,1.2,0.8);}
    k.radial('base','#a8aaac',0,22,0,2.6,2.6,LH);for(const h of [1.2,2.6])k.radial('base','#c8a020',0,22,h,2.64,2.64,0.06);
    for(const dd of [-1.5,1.5]){const a=95*D+dd/30,[x,z]=at(a,30);k.add('base',G.cyl,'#9aa0a4',x,1.9,z,{sx:0.75,sy:3.6,sz:0.75});k.add('base',G.sph,'#9aa0a4',x,3.7,z,{sx:0.75,sy:0.3,sz:0.75});
      for(let q=0;q<4;q++)k.add('base',K.ring(0.75,0.82,0.06,16),'#6a6e70',x,0.6+q*0.9,z);}
    k.pipe('base','#8a8a84',Math.cos(95*D)*30,3.6,Math.sin(95*D)*30,Math.cos(95*D)*30,LH,Math.sin(95*D)*30,0.08);
    for(let q=0;q<12;q++){const a=(140+q*2.4)*D;k.radial('base','#5a6a7a',a,34,0,1.4,0.7,1.1);k.radial('base','#e0e0d8',a,34,1.1,1.2,0.6,0.04);k.pipe('base','#b06020',Math.cos(a)*34,1.15,Math.sin(a)*34,Math.cos(a)*34,LH-0.4,Math.sin(a)*34,0.02);}
    {const a=12*D,[x,z]=at(a,18);k.add('base',G.box,'#4a4c4e',x,1.0,z,{sx:0.15,sy:2.0,sz:0.15});k.add('base',G.box,'#2a2c2e',x,2.1,z,{ry:-a,sx:0.15,sy:0.7,sz:1.1});
      k.add('glow',G.box,'#70ff90',x-Math.cos(a)*0.09,2.25,z-Math.sin(a)*0.09,{ry:-a,sx:0.02,sy:0.18,sz:0.9});k.add('glow',G.box,'#ffd070',x-Math.cos(a)*0.09,1.95,z-Math.sin(a)*0.09,{ry:-a,sx:0.02,sy:0.18,sz:0.9});}
    kits.water2=k.build();}
  // the casting rooms: in each a furnace under its hood and flue, a crucible lifted from it on a jib, sand moulds
  // laid out in rows on the floor waiting to be poured, heaps of moulding sand, ingots stacked, tongs racked, scorch
  // on the floor, an ore conveyor coming up through the floor from the mines' level, a hoist for the metal going up
  {const k=K.kit();shell(k,{rooms:8,room:(k,a0,step,i)=>{const a=a0+step*0.5;
      k.radial('base','#4a4440',a,RO-8,0,6,5,3.2);k.radial('glow','#ff7a20',a,RO-11.05,0.6,0.1,2.4,1.4);
      k.radial('base','#3a3634',a,RO-8,3.2,6.6,5.6,0.4);{const [x,z]=at(a,RO-8);k.add('base',G.cyl,'#2e2a28',x,3.4+0.5,z,{sx:0.7,sy:1.0,sz:0.7});}
      k.radial('base','#7a4a2a',a,RO-11.3,0.15,0.4,5.4,0.3);stain(k,a,RO-12.5,1.6);
      // the jib and the crucible on it, glowing at the lip
      {const aj=a+3.4/(RO-12),[x,z]=at(aj,RO-12);k.add('base',G.cyl,'#3a3c3e',x,1.6,z,{sx:0.12,sy:3.2,sz:0.12});k.radial('base','#3a3c3e',a+1.7/(RO-12),RO-12,3.0,0.2,3.4,0.2);
        const [cx,cz]=at(a+0.6/(RO-12),RO-12.5);k.pipe('base','#2a2a28',cx,3.0,cz,cx,1.6,cz,0.02);k.add('base',G.cyl,'#4a3a32',cx,1.25,cz,{sx:0.4,sy:0.7,sz:0.4});k.add('glow',G.disc8,'#ff8a30',cx,1.61,cz,{sx:0.32,sy:0.01,sz:0.32});}
      // the moulds in rows, each a box of dark sand with its pouring cup; some already poured, cooling
      for(let rr=0;rr<3;rr++)for(let q=0;q<4;q++){const am=a0+step*(0.15+q*0.1),r=RW+4+rr*2.2,[x,z]=at(am,r);k.add('base',G.box,'#3e3630',x,0.25,z,{ry:-am,sx:1.0,sy:0.5,sz:0.8});
        k.add(q+rr<2?'glow':'base',G.cyl6,q+rr<2?'#ff6a20':'#2a2420',x,0.52,z,{sx:0.08,sy:0.05,sz:0.08});}
      // moulding sand heaped, a shovel in it; ingots stacked by the door; tongs on a rack
      {const [x,z]=at(a0+step*0.75,RW+4);k.add('base',G.sph4,'#8a6a48',x,0,z,{sx:1.4,sy:0.7,sz:1.1});k.pipe('base','#5a4a38',x+0.3,0.4,z,x+0.6,1.3,z+0.2,0.03);}
      for(let q=0;q<5;q++){const [x,z]=at(a0+step*0.88,RW+3+(q%2)*0.3);k.add('base',G.box,'#8a8c90',x,0.08+((q/2)|0)*0.13,z,{ry:-a0-step*0.88+(q%2?Math.PI/2:0),sx:0.6,sy:0.12,sz:0.18});}
      for(let q=0;q<4;q++){const ar=a0+step*0.95,[x,z]=at(ar,RW+8+q*0.35);k.add('base',G.box,'#2a2a28',x,1.3,z,{ry:-ar,sx:0.02,sy:1.4,sz:0.04});}
      yline(k,a0+step*0.1,a0+step*0.55,RW+10.6);stencil(k,a,RW+0.2,1.9);
      // the ore conveyor up through the floor from below, tipping into a hopper; a hoist in every other room
      if(i%2===0){const ac=a0+step*0.62,[x0,z0]=at(ac,RW+14),[x1,z1]=at(ac,RW+20);k.pipe('base','#3a3a38',x0,-0.2,z0,x1,2.0,z1,0.35);k.pipe('base','#1e1e1c',x0,0.1,z0,x1,2.3,z1,0.3);
        k.add('base',G.box,'#4a4440',x1,2.0,z1,{ry:-ac,sx:1.4,sy:1.0,sz:1.4});k.add('base',G.disc8,'#141414',x0,0.01,z0,{sx:0.8,sy:0.01,sz:0.8});}
      else hoist(k,a0+step*0.62,RW+16);
      k.radial('lamp','#ffb070',a,(RW+RO)/2,LH-0.8,6,0.4,0.1);}});kits.cast=k.build();}
  // mechanical: machines, pumps and pipe runs
  {const k=K.kit();shell(k,{rooms:8,room:(k,a0,step,i)=>{const a=a0+step*0.5,x=Math.cos(a)*36,z=Math.sin(a)*36;
      k.add('base',G.box,'#4f5f6e',x,1.3,z,{ry:-a,sx:7,sy:2.6,sz:4});k.add('base',G.cyl,'#6a6458',x,2.9,z,{sx:1,sy:0.8,sz:1});
      k.pipe('base','#8a5a32',x,2.2,z,Math.cos(a)*RW,2.2,Math.sin(a)*RW,0.3);k.pipe('base','#4f6a5a',Math.cos(a+0.1)*RO,LH-1,Math.sin(a+0.1)*RO,Math.cos(a+0.1)*RW,LH-1,Math.sin(a+0.1)*RW,0.22);
      // tanks against the back wall, gauge boards with dials, a valve wheel
      for(const t of [-0.28,0.28]){const at=a+t*step,tx=Math.cos(at)*(RO-3),tz=Math.sin(at)*(RO-3);k.add('base',G.cyl,'#6a5a48',tx,1.8,tz,{sx:1.6,sy:3.6,sz:1.6});k.add('base',G.sph4,'#6a5a48',tx,3.6,tz,{sx:1.6,sy:0.5,sz:1.6});
        k.pipe('base','#8a5a32',tx,3.4,tz,Math.cos(at)*(RO-3),LH-0.4,Math.sin(at)*(RO-3),0.15);}
      {const ag=a0+step*0.12;k.tangent('base','#3a3c3e',ag,RW+0.4,1.0,2.4,0.1,1.2);
        for(let q=0;q<3;q++){const aq=ag+(q-1)*0.6/RW;k.add('base',G.disc8,'#e8e4d8',Math.cos(aq)*(RW+0.5),1.6,Math.sin(aq)*(RW+0.5),{rz:Math.PI/2,ry:-aq,sx:0.28,sy:0.04,sz:0.28});
          k.add('base',G.box,'#a02010',Math.cos(aq)*(RW+0.53),1.62,Math.sin(aq)*(RW+0.53),{ry:-aq,rx:q*0.9-0.6,sx:0.02,sy:0.22,sz:0.03});}}
      k.add('base',G.disc8,'#a02818',Math.cos(a)*(RW+3),1.6,Math.sin(a)*(RW+3),{rz:Math.PI/2,ry:-a,sx:0.5,sy:0.06,sz:0.5});
      // a pump set on its skid: motor, a yellow guard over the coupling, the pump, its riser with a flange and a valve
      {const ap=a0+step*0.78,rp=29,c=Math.cos(ap),sn=Math.sin(ap);k.radial('base','#2e3032',ap,rp,0,3.4,1.2,0.25);
        k.add('base',G.cyl,'#3a5a7a',c*(rp+0.8),0.75,sn*(rp+0.8),{rz:Math.PI/2,ry:-ap,sx:0.42,sy:1.4,sz:0.42});k.radial('base','#d8aa1c',ap,rp-0.2,0.3,0.5,0.62,0.7);
        k.add('base',G.sph4,'#5a6064',c*(rp-1.0),0.75,sn*(rp-1.0),{sx:0.5,sy:0.48,sz:0.5});k.pipe('base','#3a7050',c*(rp-1.0),1.1,sn*(rp-1.0),c*(rp-1.0),LH-0.3,sn*(rp-1.0),0.16);
        k.add('base',G.disc8,'#3a3c3e',c*(rp-1.0),1.6,sn*(rp-1.0),{sx:0.3,sy:0.08,sz:0.3});k.add('base',G.disc8,'#a02818',c*(rp-1.0)-sn*0.35,2.2,sn*(rp-1.0)+c*0.35,{rz:Math.PI/2,ry:-ap-Math.PI/2,sx:0.3,sy:0.04,sz:0.3});
        k.add('base',G.disc8,'#2a2420',c*(rp-0.4),0.004,sn*(rp-0.4),{sx:1.0,sy:0.01,sz:0.7,ry:ap});}
      // a switch cabinet on the back wall, its lamps lit
      k.radial('base','#8a8e88',a,RO-0.6,0,0.5,1.6,2.2);k.radial('glow','#70ff90',a+0.01,RO-0.86,1.9,0.02,0.08,0.08);k.radial('blink','#ff5040',a-0.01,RO-0.86,1.9,0.02,0.08,0.08);
      k.radial('base','#d8aa1c',a,RO-0.86,1.4,0.02,0.22,0.22);
      // pipe runs across the ceiling, each with a band of its colour code
      for(const [rr,cc,band] of [[RW+8,'#b4b4ac','#c03020'],[RW+8.6,'#3a7050','#3070c0'],[RW+9.2,'#7a5a20','#e0e0d8']]){
        const b0=a0+0.6/RW,b1=a0+step-0.6/RW;k.pipe('base',cc,Math.cos(b0)*rr,LH-0.55,Math.sin(b0)*rr,Math.cos(b1)*rr,LH-0.55,Math.sin(b1)*rr,0.13);
        k.add('base',G.cyl,band,Math.cos(a)*rr,LH-0.55,Math.sin(a)*rr,{rz:Math.PI/2,ry:-a-Math.PI/2,sx:0.15,sy:0.4,sz:0.15});}
      // a painted border round the machine, a stain under it; a bench with a vice by the door
      for(const sd of [-1,1]){k.radial('base','#d8aa1c',a+sd*2.8/36,36,0,8.2,0.12,0.012);k.tangent('base','#d8aa1c',a,36+sd*4.1,0,5.6,0.12,0.012);}
      k.add('base',G.disc8,'#2a2420',Math.cos(a)*38,0.006,Math.sin(a)*38,{sx:1.4,sy:0.01,sz:0.9,ry:a});
      {const ab=a0+step*0.3;k.radial('base','#5a4a38',ab,RW+2.2,0.85,1.0,2.2,0.08);k.radial('base','#3a3632',ab,RW+2.2,0,0.9,2.0,0.85);k.radial('base','#3a3e42',ab+0.02,RW+2.0,0.93,0.3,0.24,0.22);}
      k.radial('lamp','#ffc890',a,(RW+RO)/2,LH-0.8,6,0.4,0.1);}});kits.mech=k.build();}
  return kits;
}

// ---- the stair: one turn a level, its landing at angle 0 where the floor's rail has its gap ----
// an open well down the middle, so from the top you can look down the stair's eye
export const STAIR={rin:2.4,rout:6.4,treads:32};
export function buildStair(K){const k=K.kit(),{G}=K,{rin,rout,treads}=STAIR,rise=LH/treads,step=TAU/treads;
  for(let i=0;i<treads;i++){const a=i*step,y=-i*rise,rm=(rin+rout)/2;
    // each tread in three strips: polished where feet go (the up lane inside, the down lane outside), plain between
    {const bands=[[rin,rin+1.5,'#6c6e6c'],[rin+1.5,rout-1.4,'#55585a'],[rout-1.4,rout,'#717371']];
      for(const [r0,r1,cc] of bands){const rr=(r0+r1)/2;k.radial('stair',cc,a,rr,y-0.08,r1-r0,TAU*rr/treads*1.05,0.08);}}
    // the outer stringer, the rails and their posts
    k.tangent('stair','#3e4144',a,rout,y-0.4,TAU*rout/treads*1.08,0.12,0.4);
    const a2=a+step,y2=y-rise;
    k.pipe('stair','#2f3134',Math.cos(a)*rout,y+1.0,Math.sin(a)*rout,Math.cos(a2)*rout,y2+1.0,Math.sin(a2)*rout,0.045);
    k.pipe('stair','#2f3134',Math.cos(a)*(rin+0.15),y+0.95,Math.sin(a)*(rin+0.15),Math.cos(a2)*(rin+0.15),y2+0.95,Math.sin(a2)*(rin+0.15),0.04);
    if(i%2===0)k.add('stair',G.box,'#2f3134',Math.cos(a)*rout,y+0.5,Math.sin(a)*rout,{sx:0.06,sy:1,sz:0.06});}
  // the cage: posts on the outer edge every quarter turn tie each turn to the one below, braced crosswise
  for(let q=0;q<4;q++){const a=(q+0.25)/4*TAU,ya=-(a/TAU)*LH,b=a+TAU/4,yb=-(b/TAU)*LH,r=rout+0.12;
    k.add('stair',G.box,'#34373a',Math.cos(a)*r,ya+LH/2,Math.sin(a)*r,{ry:-a,sx:0.12,sy:LH,sz:0.12});
    k.pipe('stair','#34373a',Math.cos(a)*r,ya+LH-0.45,Math.sin(a)*r,Math.cos(b)*r,yb+0.1,Math.sin(b)*r,0.035);
    k.pipe('stair','#34373a',Math.cos(a)*r,ya+0.1,Math.sin(a)*r,Math.cos(b)*r,yb+LH-0.45,Math.sin(b)*r,0.035);}
  // pipes and cable runs down the shaft, outside the stair, on a bracket each level
  for(const [a,rr,cc,w] of [[100*D,10.4,'#6a4a30',0.16],[103*D,10.4,'#4a5a50',0.12],[106*D,10.45,'#2a2a2c',0.07],[108*D,10.45,'#2a2a2c',0.07],[250*D,10.4,'#5a5e62',0.2],[254*D,10.45,'#8a3a28',0.1]]){
    k.add('pipes',G.cyl6,cc,Math.cos(a)*rr,-LH/2,Math.sin(a)*rr,{sx:w,sy:LH,sz:w});}
  for(const a of [104*D,252*D]){k.radial('pipes','#3a3c3e',a,10.6,-0.4,0.9,0.6,0.1);}
  // lamps on the inner rail, four a turn: from the top they spiral away down the eye
  for(let i=0;i<3;i++){const a=(i+0.12)/3*TAU,y=-(a/TAU)*LH;k.add('slamp',G.box,'#ffd8a0',Math.cos(a)*(rin+0.1),y+1.0,Math.sin(a)*(rin+0.1),{ry:-a,sx:0.3,sy:0.14,sz:0.45});}
  // the landing, from the stair across to the floor, and the floor's rail round the shaft with its gap at the landing
  // (here, not in the level kits, since the levels are turned and the stair is not)
  k.add('rail',K.ring(RS,RS+0.1,0.08,48,6*D,TAU-12*D),'#3f4144',0,1.05,0);k.add('rail',K.ring(RS,RS+0.06,0.05,48,6*D,TAU-12*D),'#3f4144',0,0.55,0);
  for(let i=0;i<40;i++){const a=6*D+(TAU-12*D)*i/39;k.add('rail',G.box,'#3f4144',Math.cos(a)*(RS+0.06),0.5,Math.sin(a)*(RS+0.06),{sx:0.08,sy:1,sz:0.08});}
  // the catwalk: a bridge at every level from the stair's landing across the open shaft to the floor's edge, so the
  // stair stands free in the middle of the shaft and each level is reached over the drop. Deck plate on two stringers,
  // a rail and a mid-rail both sides on posts, toe plates, knee braces under it from the floor's edge, a lamp over it.
  {const r0=rout-0.4,r1=RS+0.7,len=r1-r0,rm=(r0+r1)/2,W=1.8,hw=W/2;
    k.radial('stair','#5f6264',0,rm,-0.08,len,W,0.08);                       // the deck plate
    for(let i=0;i<Math.floor(len/0.6);i++)k.radial('stair','#4a4d50',0,r0+0.3+i*0.6,-0.035,0.05,W*0.96,0.02);   // the anti-slip ribs
    for(const sz of [-hw+0.08,hw-0.08])k.add('stair',G.box,'#35383b',rm,-0.32,sz,{sx:len,sy:0.42,sz:0.12});   // the stringers
    for(let i=0;i<=Math.ceil(len/1.2);i++){const x=r0+Math.min(len,i*1.2);k.add('stair',G.box,'#35383b',x,-0.32,0,{sx:0.1,sy:0.3,sz:W-0.1});}   // cross-members
    for(const sz of [-hw,hw]){
      k.add('stair',G.box,'#3a3d40',rm,1.05,sz,{sx:len,sy:0.06,sz:0.06});    // the handrail
      k.add('stair',G.box,'#3a3d40',rm,0.55,sz,{sx:len,sy:0.04,sz:0.04});    // the mid-rail
      k.add('stair',G.box,'#3a3d40',rm,0.06,sz,{sx:len,sy:0.14,sz:0.02});    // the toe plate
      for(let i=0;i<=Math.ceil(len/1.1);i++){const x=r0+Math.min(len,i*1.1);k.add('stair',G.box,'#2f3134',x,0.5,sz,{sx:0.07,sy:1.1,sz:0.07});}
      k.pipe('stair','#35383b',RS+0.1,-1.5,sz*0.9,rm,-0.5,sz*0.9,0.05);}      // the knee braces from the floor's edge
    // where it meets the floor: a threshold plate over the gap in the rail, and a lamp on a bracket above
    k.add('stair',G.box,'#6a6d6f',RS+0.35,-0.05,0,{sx:0.8,sy:0.1,sz:W+0.6});
    k.add('slamp',G.box,'#ffd8a0',rm,2.6,0,{sx:0.5,sy:0.12,sz:0.3});
    k.add('stair',G.box,'#2f3134',rm,2.75,0,{sx:0.08,sy:0.3,sz:0.08});}
  return k.build();}

// ---- level 1, the top: the cafeteria and its screen, the offices, the airlock ----
export const CAFE=[50*D,115*D],SCREEN=[66*D,112*D],AIRLOCK=180*D,OFFICES=[[205*D,232*D,'the sheriff\'s office'],[240*D,270*D,'the mayor\'s office']];
// the cafeteria's tables (and their chairs), in rows across the room: shared by the furniture and the diners
export function cafeTables(){const K1=CAFE[0]+13*D,out=[],y=yL(1);
  // long tables in four rows along the curve, benches either side, a place every sixty centimetres: people sit with
  // whoever is there. Each table's places are listed as 'chairs' (where to sit, which way to face)
  for(const r of [28,32.6,37.2,41.8]){const span=CAFE[1]-K1-4*D,n=Math.max(1,Math.floor(span*r/7.2));
    for(let i=0;i<n;i++){const a=K1+2.5*D+(i+0.5)/n*span,c=Math.cos(a),s=Math.sin(a),x=c*r,z=s*r,ry=-a-Math.PI/2,chairs=[],L=5.6;
      for(const sd of [-1,1])for(let q=0;q<9;q++){const tt=(q-4)*0.6,tx=-s*tt,tz=c*tt,ox=c*sd*0.72,oz=s*sd*0.72;chairs.push({x:x+tx+ox,z:z+tz+oz,ry,bx:c*sd*0.2,bz:s*sd*0.2,face:a+(sd>0?Math.PI:0)});}
      out.push({x,z,ry,chairs,y,a,r,L});}}
  return out;}
export function buildTop(K){const k=K.kit(),{G}=K,y=yL(1);
  const inSec=(a,[a0,a1])=>a>=a0&&a<=a1;
  const skip=a=>inSec(a,CAFE)||Math.abs(a-AIRLOCK)<10*D||OFFICES.some(o=>inSec(a,o));
  // the shell as any level, with the cafeteria, the offices and the airlock corridor left open
  const kk=k;// homes elsewhere on the top level
  kk.add('base',K.ring(RS,RO,0.5,64),'#7d786e',0,y,0);
  kk.add('base',K.ring(RS,RS+0.1,0.08,48,6*D,TAU-12*D),'#3f4144',0,y+1.05,0);
  for(let i=0;i<20;i++){const a=(i+0.5)/20*TAU;kk.radial('lamp','#ffe2b0',a,16.5,y+LH-0.72,1.6,0.35,0.12);}
  const nr=24,step=TAU/nr;
  for(let i=0;i<nr;i++){const a0=i*step,am=a0+step/2;const open=skip(am);
    if(!open){kk.tangent('base','#a8a294',am,RW,y,step*RW,0.25,LH-0.5);kk.radial('base','#9b958a',a0,(RW+RO)/2,y,RO-RW-0.4,0.25,LH-0.5);
      kk.tangent('base','#4a3a2c',a0+step*0.3,RW+0.12,y,1.3,0.1,2.3);kk.tangent('glow','#ffd08a',a0+step*0.68,RW+0.2,y+1,1.8,0.06,1.3);}}
  // the cafeteria: a kitchen at one end behind a serving counter, then separate tables, four chairs each, in rows
  // facing the screen; a wall to the street with wide doorways; lamps over the rows
  {const K0=CAFE[0],K1=CAFE[0]+13*D;
    // long tables of old boards, scrubbed pale down the middle, on trestles; a bench either side
    for(const t of cafeTables()){const c=Math.cos(t.a),s_=Math.sin(t.a),tx=-s_,tz=c;
      kk.add('base',G.box,'#8a7458',t.x,y+0.74,t.z,{ry:t.ry,sx:t.L,sy:0.06,sz:1.0});kk.add('base',G.box,'#a89070',t.x,y+0.775,t.z,{ry:t.ry,sx:t.L*0.96,sy:0.01,sz:0.4});
      for(const q of [-0.4,0,0.4]){const px=t.x+tx*q*t.L,pz=t.z+tz*q*t.L;kk.add('base',G.box,'#4a4038',px,y+0.37,pz,{ry:t.ry,sx:0.12,sy:0.74,sz:0.7});}
      for(const sd of [-1,1]){const bx=t.x+c*sd*0.72,bz=t.z+s_*sd*0.72;kk.add('base',G.box,'#6a5a46',bx,y+0.44,bz,{ry:t.ry,sx:t.L,sy:0.05,sz:0.32});
        for(const q of [-0.42,0,0.42])kk.add('base',G.box,'#3a3430',bx+tx*q*t.L,y+0.22,bz+tz*q*t.L,{ry:t.ry,sx:0.08,sy:0.44,sz:0.28});}
      for(let q=0;q<5;q++){const tt=(q-2)*1.1+((t.r*7+q*3)%5)*0.1;kk.add('base',G.cyl6,['#8a8a84','#c8c0b0','#7a6a58'][q%3],t.x+tx*tt,y+0.83,t.z+tz*tt,{sx:0.1,sy:0.1,sz:0.1});}}
    // the kitchen's wall, with the hatch over the counter that the food comes through
    {const KW=K1-0.7*D,r0=RW+0.3,r1=RO-0.4,h0=RW+3,h1=RO-6;kk.radial('base','#9a948a',KW,(r0+r1)/2,y+2.1,r1-r0,0.2,LH-2.6);
      kk.radial('base','#9a948a',KW,(r0+h0)/2,y,h0-r0,0.2,2.1);kk.radial('base','#9a948a',KW,(h1+r1)/2,y,r1-h1,0.2,2.1);kk.radial('base','#7a7468',KW,(h0+h1)/2,y+2.05,h1-h0,0.26,0.1);
      kk.radial('base','#c8b890',KW+0.3*D,(h0+h1)/2,y+2.25,4,0.02,0.5);}
    // the serving counter along the kitchen's edge, a gap at each end; trays and pots on it
    kk.radial('base','#b8b4aa',K1,(RW+2+RO-4)/2,y,RO-RW-8,1.0,1.0);kk.radial('base','#8a8478',K1,(RW+2+RO-4)/2,y+1.0,RO-RW-8,1.2,0.06);
    for(let j=0;j<8;j++){const r=RW+4+j*2.8;kk.radial('base',j%2?'#c8c4b8':'#7a6a58',K1-0.3*D,r,y+1.06,0.6,0.4,0.25);}
    // the kitchen: stoves under hoods along the back wall, steel tables, shelves of tins, a sink
    for(let j=0;j<5;j++){const a=K0+(j+0.6)/5.4*(K1-K0);kk.tangent('base','#3a3c3e',a,RO-1.6,y,2.0,1.2,0.9);kk.tangent('glow','#ff7030',a,RO-1.6,y+0.9,1.4,0.7,0.02);
      kk.tangent('base','#8a8c8e',a,RO-1.7,y+2.6,2.2,1.4,0.6);kk.tangent('base','#9a9c9e',a,RW+8+(j%2)*7,y,2.4,1.0,0.9);kk.tangent('base','#6a645a',a,RW+1.2,y,2.2,0.5,2.2);
      for(let m=0;m<3;m++)kk.tangent('base',['#a07040','#708050','#c0b090'][(j+m)%3],a,RW+1.15,y+0.6+m*0.6,1.9,0.42,0.3);}
    kk.radial('base','#9b958a',K0,(RW+RO)/2,y,RO-RW-0.4,0.25,LH-0.5);
    // the wall to the street: piers and lintels, doorways between
    for(let j=0;j<6;j++){const a0=CAFE[0]+j/6*(CAFE[1]-CAFE[0]),a1=CAFE[0]+(j+1)/6*(CAFE[1]-CAFE[0]),am=(a0+a1)/2;
      kk.tangent('base','#a8a294',a0+(a1-a0)*0.15,RW,y,(a1-a0)*RW*0.3,0.25,LH-0.5);kk.tangent('base','#a8a294',a1-(a1-a0)*0.15,RW,y,(a1-a0)*RW*0.3,0.25,LH-0.5);
      kk.tangent('base','#a8a294',am,RW,y+2.6,(a1-a0)*RW*0.42,0.25,LH-3.1);}
    kk.radial('base','#9b958a',CAFE[1],(RW+RO)/2,y,RO-RW-0.4,0.25,LH-0.5);
    for(let j=0;j<8;j++){const a=K1+(j+0.5)/8*(CAFE[1]-K1);kk.radial('lamp','#fff0d0',a,35,y+LH-0.7,18,0.45,0.08);}}
  // the screen's frame on the wall (the screen itself is drawn live, by the page)
  kk.tangent('base','#2a2b2c',(SCREEN[0]+SCREEN[1])/2,RO-0.35,y+0.3,(SCREEN[1]-SCREEN[0])*RO*1.02,0.3,0.25);
  kk.tangent('base','#2a2b2c',(SCREEN[0]+SCREEN[1])/2,RO-0.35,y+3.85,(SCREEN[1]-SCREEN[0])*RO*1.02,0.3,0.2);
  // the offices: a desk, cabinets, a counter; a cell in the sheriff's
  for(const [a0,a1] of OFFICES){kk.radial('base','#9b958a',a0,(RW+RO)/2,y,RO-RW-0.4,0.25,LH-0.5);kk.radial('base','#9b958a',a1,(RW+RO)/2,y,RO-RW-0.4,0.25,LH-0.5);
    const am=(a0+a1)/2;kk.tangent('base','#b0a894',am,RW,y,(a1-a0)*RW,0.25,LH-0.5);kk.tangent('glow','#ffe0a8',am,RW+0.2,y+1,4,0.06,1.6);
    kk.tangent('base','#6a503a',am,RW+9,y,4.4,1.6,0.8);kk.tangent('base','#5a5d60',am,RO-1.5,y,10,0.8,2.0);kk.radial('lamp','#fff0d0',am,34,y+LH-0.8,10,0.5,0.1);}
  {const a=OFFICES[0][1]-5*D;for(let j=0;j<9;j++)kk.radial('base','#2f3134',a,RO-9+j*0.9,y,0.08,0.08,LH-0.6);}
  // the airlock: a corridor out through the wall, two doors and the chamber between, then the ramp up
  {const a=AIRLOCK,c=Math.cos(a),s=Math.sin(a);
    for(const r of [RW,RO])kk.tangent('base','#8a8478',a,r,y,0.1,0.1,0.01);
    kk.radial('base','#77736a',a,(RW+RO)/2,y+LH-0.6,RO-RW,4.4,0.2);
    for(const sd of [-1,1])kk.add('base',G.box,'#8e897e',c*(RW+RO)/2-s*sd*2.3,y+(LH-0.5)/2,s*(RW+RO)/2+c*sd*2.3,{ry:-a,sx:RO-RW,sy:LH-0.5,sz:0.3});
    // the chamber, walled and roofed, from the inner door to the outer
    for(const sd of [-1,1])kk.add('base',G.box,'#6e6a62',c*57-s*sd*2.6,y+1.9,s*57+c*sd*2.6,{ry:-a,sx:14,sy:3.8,sz:0.6});
    kk.add('base',G.box,'#6e6a62',c*57,y+3.95,s*57,{ry:-a,sx:14,sy:0.4,sz:5.8});kk.add('base',G.box,'#6a665e',c*57,y-0.2,s*57,{ry:-a,sx:14,sy:0.4,sz:5.8});
    kk.add('base',G.box,'#a09a8a',c*51.5,y+1.9,s*51.5,{ry:-a,sx:2.5,sy:3.8,sz:4.8});   // the inner door's frame wall
    // the corridor to it: lamps, a hazard frame round the inner door, benches, the suit's locker
    for(let j=0;j<4;j++)kk.add('lamp',G.box,'#fff0d8',c*(RW+3+j*7),y+LH-0.55,s*(RW+3+j*7),{ry:-a,sx:1.6,sy:0.1,sz:0.5});
    for(const sd of [-1,1]){kk.add('base',G.box,'#c8a028',c*50.2-s*sd*1.75,y+1.4,s*50.2+c*sd*1.75,{ry:-a,sx:0.1,sy:2.8,sz:0.35});
      for(let j=0;j<5;j++)kk.add('base',G.box,'#222222',c*50.14-s*sd*1.75,y+0.3+j*0.55,s*50.14+c*sd*1.75,{ry:-a,rx:0.6,sx:0.06,sy:0.18,sz:0.36});}
    kk.add('base',G.box,'#c8a028',c*50.2,y+2.9,s*50.2,{ry:-a,sx:0.1,sy:0.35,sz:3.85});
    kk.add('glow',G.box,'#ff3020',c*50.1,y+3.3,s*50.1,{ry:-a,sx:0.08,sy:0.25,sz:0.8});
    for(const sd of [-1,1])kk.add('base',G.box,'#6a5a48',c*38-s*sd*1.9,y+0.25,s*38+c*sd*1.9,{ry:-a,sx:6,sy:0.5,sz:0.5});
    kk.add('base',G.box,'#5a6066',c*46-s*1.8,y+1.25,s*46+c*1.8,{ry:-a,sx:2.4,sy:2.5,sz:0.8});
    // the ramp's tunnel up to the surface
    const r0=64,r1=110,y0=y,y1=0,L=Math.hypot(r1-r0,y1-y0),pitch=Math.atan2(y1-y0,r1-r0),rm=(r0+r1)/2,ym=(y0+y1)/2;
    kk.add('base',G.box,'#5e5a52',c*rm,ym-0.2,s*rm,{ry:-a,rz:pitch,sx:L,sy:0.4,sz:4.6});
    kk.add('base',G.box,'#5e5a52',c*rm,ym+3.8,s*rm,{ry:-a,rz:pitch,sx:L,sy:0.4,sz:4.6});
    for(const sd of [-1,1])kk.add('base',G.box,'#64605a',c*rm-s*sd*2.4,ym+1.8,s*rm+c*sd*2.4,{ry:-a,rz:pitch,sx:L,sy:4,sz:0.3});
    for(let i=0;i<8;i++){const r=r0+(i+0.5)/8*(r1-r0),yy=y0+(i+0.5)/8*(y1-y0);kk.add('airlock',G.box,'#ffb040',c*r,yy+3.5,s*r,{ry:-a,sx:0.8,sy:0.12,sz:0.5});}
    for(let i=0;i<3;i++)kk.add('airlock',G.box,'#ffb040',c*(53+i*4.5),y+3.6,s*(53+i*4.5),{ry:-a,sx:0.8,sy:0.12,sz:0.6});}
  return k.build();}

// ---- the bottom: the generator hall (levels 142 to 144 open as one), the oil, and the mines out into the rock ----
export function buildHall(K){const k=K.kit(),{G}=K,y=yL(NL),top=yL(141)-0.5;
  {const SA=115*D,SR=36,h=2.25/SR;   // the floor, with the mine shaft's hatch left open in it (src/silo/digger.js, SHAFT)
    k.add('base',K.ring(RS,SR-2.2,0.5,64),'#5e5a54',0,y,0);k.add('base',K.ring(SR+2.2,RO,0.5,64),'#5e5a54',0,y,0);
    k.add('base',K.ring(SR-2.2,SR+2.2,0.5,64,SA+h,TAU-2*h),'#5e5a54',0,y,0);}
  k.add('base',K.ring(0.01,RS,1.2,32),'#5a5650',0,y,0);   // the bottom of the shaft, under the stair's foot
  k.add('base',K.ring(RS,RS+0.1,0.08,48,6*D,TAU-12*D),'#3f4144',0,y+1.05,0);
  // catwalks round the hall at the two missing floors
  for(const n of [142,143]){const yy=yL(n);k.add('base',K.ring(RO-4,RO,0.15,64),'#4a4c4e',0,yy,0);k.add('base',K.ring(RO-4.1,RO-4,-1.0,64),'#3a3c3e',0,yy,0);
    k.add('base',K.ring(RS,RS+3,0.15,48,6*D,TAU-12*D),'#4a4c4e',0,yy,0);}
  // the plant itself (the turbine set, the oil, the boards) is src/silo/plant.js
  // the mines and the digger beyond them are src/silo/digger.js
  return {geo:k.build()};}
