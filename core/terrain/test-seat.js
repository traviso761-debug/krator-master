// node core/terrain/test-seat.js — the drawn surface's contract (38a-core-seat.js), each check with a broken input that must
// fail: the ground as drawn (not terrainH), a KSTACKS body as drawn, seating on the lowest of a footprint, and the sweeps
// (contact: ok, floating, buried, inside, off; clearance; doors; stairs), and the drawers' probe points.
const fs=require('fs'),path=require('path');
global.window=global;
const load=f=>eval(fs.readFileSync(path.join(__dirname,f),'utf8'));
load('../rand/08-core-rand.js');load('../space/20-core-space.js');load('37-core-stacks.js');load('36-core-carve.js');
const mesa=KSTACKS.make({id:'m1',kind:'mesa',x:0,z:0,y0:0,seed:41,tiers:[{h:60,r:80,e:1.3,ry:.3}]});
const hashBefore=KSTACKS.hash(KSTACKS.mesh(mesa,{step:5}));
load('38a-core-seat.js');
const K=KSEAT;
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};

// ---- a few huge faces among many small ones: the buckets stay in proportion and no hit moves
{const pos=[];let q=1;const r=()=>(q=q*16807%2147483647)/2147483647;
 for(let i=0;i<4000;i++){const x=r()*180,y=r()*100,z=r()*180;pos.push(x,y,z,x+.3,y,z,x,y+.3,z+.3);}
 for(let i=0;i<20;i++){const y=i*5;pos.push(0,y,0,0,y,190,190,y,0,190,y,190,190,y,0,0,y,190);}
 const P=new Float32Array(pos),A=K.tris(P,null,{id:'a'}),F=K.tris(P,null,{id:'f',cell:8});let same=true;
 for(let i=0;i<500;i++){const x=r()*180,z=r()*180,a=K.down(A,x,z,120),f=K.down(F,x,z,120);if(!a||!f||a.y!==f.y)same=false;}
 ok('huge faces coarsen the buckets (a cell of '+A.cell+' m)',A.cell>1);
 ok('and every ray reads what a fixed cell reads',same);
 ok('a given cell stands',K.tris(P,null,{cell:1}).cell===1);}

// ---- a closed box, faces wound CCW from outside (the drawn convention)
function box(x0,y0,z0,x1,y1,z1){const c=[[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]],
  F=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]],pos=[],mid=[(x0+x1)/2,(y0+y1)/2,(z0+z1)/2];
 F.forEach(f=>{[[f[0],f[1],f[2]],[f[0],f[2],f[3]]].forEach(t=>{let [a,b,d]=t.map(i=>c[i]);
   const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[d[0]-a[0],d[1]-a[1],d[2]-a[2]],n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]],
     o=[a[0]-mid[0],a[1]-mid[1],a[2]-mid[2]];if(n[0]*o[0]+n[1]*o[1]+n[2]*o[2]<0)[b,d]=[d,b];pos.push(...a,...b,...d);});});
 return pos;}

// ---- the ground as drawn: a slope with a narrow brook, on 10 m cells. The brook (4 m wide, 3 m deep) falls between the
// vertices, so the drawn ground does NOT have it: KSEAT reads the drawn triangle, terrainH would sink the foot 3 m
const terrainH=(x,z)=>.2*x+.1*z+(Math.abs(x-35)<2?-3:0);
const G=K.grid(terrainH,[-200,-200,200,200],10,{id:'ground'});
const drawnAt=(x,z)=>{const i=Math.floor((x+200)/10),j=Math.floor((z+200)/10),u=(x+200)/10-i,v=(z+200)/10-j,X=-200+i*10,Z=-200+j*10,
  a=terrainH(X,Z),b=terrainH(X,Z+10),c=terrainH(X+10,Z+10),d=terrainH(X+10,Z);return u+v<=1?a+(d-a)*u+(b-a)*v:c+(b-c)*(1-u)+(d-c)*(1-v);};
{let worst=0;for(let k=0;k<400;k++){const x=-195+((k*37)%390)+.31,z=-195+((k*91)%390)+.17;worst=Math.max(worst,Math.abs(K.down(G,x,z).y-drawnAt(x,z)));}
 ok('the grid reads the drawn triangles (worst '+worst.toExponential(1)+' m)',worst<1e-6,Math.abs(K.down(G,35,3).y-terrainH(35,3))<.5);}
ok('a brook between the vertices is not drawn, and KSEAT says so',Math.abs(G.h(35,3)-terrainH(35,3))>2.5,false);
// the same ground as a mesh's arrays (PlaneGeometry's index, rotated flat) reads the same
{const nx=40,nz=40,pos=[],idx=[];for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=-200+i*10,z=-200+j*10;pos.push(x,terrainH(x,z),z);}
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=i+(nx+1)*j,b=i+(nx+1)*(j+1),c=i+1+(nx+1)*(j+1),d=i+1+(nx+1)*j;idx.push(a,b,d,b,c,d);}
 const T=K.tris(pos,idx,{id:'groundMesh',cls:'ground'});let worst=0,up=0;
 for(let k=0;k<300;k++){const x=-195+((k*53)%390)+.43,z=-195+((k*29)%390)+.71,h=K.down(T,x,z);worst=Math.max(worst,Math.abs(h.y-G.h(x,z)));if(h.n[1]>0)up++;}
 ok('a mesh\'s arrays read the same as the grid (worst '+worst.toExponential(1)+' m), faces up',worst<1e-6&&up===300,false);
 // a matrix moves it: the mesh drawn 5 m up reads 5 m up
 const M=[1,0,0,0,0,1,0,0,0,0,1,0,0,5,0,1],T5=K.tris(pos,idx,{matrix:M});
 ok('o.matrix takes the arrays to the world',Math.abs(K.down(T5,12.3,-40.1).y-5-G.h(12.3,-40.1))<1e-6,Math.abs(K.down(T5,12.3,-40.1).y-G.h(12.3,-40.1))<1e-6);}

// ---- seating: the lowest of the footprint, tilted to the slope
{const s=K.seat(G,{x:-50.5,z:20.3,r:3});
 const ring=[];for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ring.push(G.h(-50.5+Math.cos(a)*3,20.3+Math.sin(a)*3));}
 const lo=Math.min(G.h(-50.5,20.3),...ring),tilt=Math.atan(Math.hypot(.2,.1));
 ok('seat: the lowest of the footprint ('+s.y.toFixed(3)+' m), spread '+s.spread.toFixed(2)+' m',Math.abs(s.y-lo)<1e-6&&s.spread>1,Math.abs(s.y-s.yc)<1e-6);
 ok('seat: the fitted normal follows the slope (tilt '+(s.tilt*180/Math.PI).toFixed(2)+' deg)',Math.abs(s.tilt-tilt)<1e-3,Math.abs(s.tilt)<1e-3);
 const sb=K.seat(G,{x:10,z:10,w:6,d:4,ry:.7,sink:.1});ok('seat: a box footprint, sunk',sb.hits===9&&Math.abs(sb.y-(sb.lo-.1))<1e-9,sb.hits===1);
 ok('seat: nothing drawn under the centre is null',K.seat(G,{x:900,z:0})===null,K.seat(G,{x:0,z:0})===null);}

// ---- a KSTACKS body as drawn: its top, its walls (inside the outline), its inside
const ROCK=K.stacks([mesa],{step:5});
const S=[G].concat(ROCK);
{const d=K.down(ROCK,20,10),t=KSTACKS.topH(mesa.beds[mesa.beds.length-1],20,10);
 ok('the drawn top is the top function where a ring meets it ('+(d&&d.y.toFixed(2))+' vs '+t.toFixed(2)+')',d&&Math.abs(d.y-t)<1.2&&d.id==='m1'&&d.cls==='rock',!d);
 ok('under the rock\'s top, a point is in it; over it, not',K.under(ROCK,20,20,10)>30&&K.under(ROCK,20,70,10)===0,K.under(ROCK,300,20,4)>0);
 // what KSEAT found here: a ringed top's last ring stopped at .08 of its radius, so the drawn top had a hole at its centre and a
 // ray there fell through to the ground; since 2026-11-08 a centre fan closes it (37-core-stacks.js, fan)
 {const c=K.down(ROCK,mesa.beds[0].cx,mesa.beds[0].cz),t=KSTACKS.topH(mesa.beds[mesa.beds.length-1],mesa.beds[0].cx,mesa.beds[0].cz);
  ok('the drawn top is closed at its centre (a ray down meets the rock '+(c&&c.y.toFixed(2))+' vs '+t.toFixed(2)+')',c&&c.cls==='rock'&&Math.abs(c.y-t)<1.2,!c);}
 // the outline at mid-height against the drawn wall: the level gap from outside reads positive in the air, negative in rock
 const b=mesa.beds[0],a=.9,R=KSTACKS.footR(b,a),px=b.cx+Math.cos(a)*(R+20),pz=b.cz+Math.sin(a)*(R+20),gIn=K.gap(ROCK,px,b.y+b.h*.5,pz,-Math.cos(a),-Math.sin(a));
 ok('gap: 20 m out from the outline the drawn wall is '+(gIn==null?'?':gIn.toFixed(2))+' m off',gIn!=null&&gIn>10&&gIn<40,gIn!=null&&gIn<0);}

// ---- contact: a record's foot against the drawn surfaces (the ground's and the rock's)
{const on=(x,z,dy,f)=>({id:'t'+x+','+z,class:'flora',at:[x,(K.seat(S,{x,z,r:f&&f.r}).y)+(dy||0),z],foot:f||{}});
 const c0=K.contact(S,on(-120,-80,0,{r:1}));ok('contact: a seated foot is ok (gap '+c0.gap.toFixed(3)+')',c0.status==='ok',K.contact(S,on(-120,-80,.31)).status==='ok');
 const cf=K.contact(S,on(-120,-80,1));ok('contact: lifted 1 m it floats (gap '+(cf.gap||0).toFixed(2)+')',cf.status==='float'&&Math.abs(cf.gap-1)<1e-6,false);
 const cb=K.contact(S,on(-120,-80,-1));ok('contact: sunk 1 m it is buried (depth '+(cb.depth||0).toFixed(2)+')',cb.status==='buried'&&Math.abs(cb.depth-1)<.02,false);
 // on terrainH over the brook: computed, not drawn, so the foot is 3 m under the drawn ground
 const cBrook=K.contact(G,{id:'brook',at:[35,terrainH(35,3),3],foot:{}});ok('contact: a foot set on terrainH over the undrawn brook is buried',cBrook.status==='buried'&&cBrook.depth>2.5,K.contact(G,{id:'b2',at:[35,G.h(35,3),3],foot:{}}).status!=='ok');
 // inside the rock: a foot on the ground under the mesa, or a foot on the analytic outline that the drawn wall swallows
 const ci=K.contact(S,{id:'in',at:[20,G.h(20,10),10],foot:{}});ok('contact: a foot inside the mesa is buried in it',ci.status==='buried'&&ci.depth>40,false);
 // half in, half out at the wall's foot: not every sample under, but rock over the centre with ground under it
 const b=mesa.beds[0],a=2.1;let rIn=0;for(let r=KSTACKS.footR(b,a)+30;r>0;r-=.25){const x=b.cx+Math.cos(a)*r,z=b.cz+Math.sin(a)*r;if(K.under(ROCK,x,G.h(x,z)+.5,z)>0){rIn=r-1;break;}}
 const xi=b.cx+Math.cos(a)*rIn,zi=b.cz+Math.sin(a)*rIn,cw=K.contact(S,{id:'wall',at:[xi,G.h(xi,zi),zi],foot:{r:3}});
 const xo=b.cx+Math.cos(a)*(rIn+8),zo=b.cz+Math.sin(a)*(rIn+8);
 ok('contact: a foot straddling the drawn wall\'s foot is inside ('+cw.status+')',cw.status==='inside',K.contact(S,{id:'out',at:[xo,G.h(xo,zo),zo],foot:{r:3}}).status!=='ok');
 // an overhang: a slab 0.3-3 m over the ground; a foot on the ground under it is inside, beside it ok
 const FL=K.grid(()=>0,[100,100,200,200],10,{id:'flat'}),slab=K.tris(box(150,.3,150,158,3,158),null,{id:'slab',cls:'rock'}),SS=[FL,slab];
 const cu=K.contact(SS,{id:'u',at:[154,0,154],foot:{}});ok('contact: under a low overhang is inside ('+cu.status+')',cu.status==='inside',K.contact(SS,{id:'v',at:[140,0,140],foot:{}}).status!=='ok');
 ok('contact: o.skip leaves the slab out',K.contact(SS,{id:'u',at:[154,0,154],foot:{}},{skip:['slab']}).status==='ok',false);
 ok('contact: nothing drawn under the foot is off',K.contact(G,{id:'o',at:[900,0,0],foot:{}}).status==='off',false);
 // the sweep: three placed right, one floating, one buried; the negative control lifts a good one and sees it float
 const recs=[on(-100,-100),on(-60,-90,0,{r:2}),on(80,-120),on(-20,150,2),on(100,100,-2),{id:'nofoot',class:'x',at:[0,500,0]}];
 const sw=K.contactSweep(S,recs);
 ok('contactSweep: '+sw.ok+' of '+sw.n+' ok, '+sw.by.float+' floating, '+sw.by.buried+' buried; the negative control floats',sw.n===5&&sw.ok===3&&sw.by.float===1&&sw.by.buried===1&&sw.neg===true&&Math.abs(sw.worst.gap-2)<1e-6,false);
 const blind=K.contactSweep([],recs);ok('contactSweep: with nothing drawn every foot is off and the control fails',blind.ok===0&&blind.neg!==true,false);}

// ---- clearance between records of different classes
{const R=[{id:'h1',class:'building',at:[0,0,0],ry:0,size:[10,8,6]},{id:'st',class:'street',at:[8,0,0],ry:0,size:[8,40,.2]},
  {id:'t1',class:'flora',at:[2,0,1],r:1.5,h:8},{id:'h2',class:'building',at:[6,0,0],ry:0,size:[4,4,4]},
  {id:'h3',class:'building',at:[30,0,0],ry:.4,size:[6,6,5]},{id:'t2',class:'flora',at:[30+3+1.4,0,0],r:1,h:5},
  {id:'b1',class:'bird',at:[0,20,0],r:1,h:1}];
 const c=K.clearSweep(R),ids=c.fails.map(f=>[f.a,f.b].sort().join('+')).sort();
 ok('clearSweep: a house over the street, a tree in the house, not a house on a house, not a bird over the roof ('+ids.join(', ')+')',
  ids.indexOf('h1+st')>=0&&ids.indexOf('h1+t1')>=0&&ids.indexOf('h3+t2')>=0,ids.some(s=>s==='h1+h2'||s.indexOf('b1')>=0));
 const rot=K.clearSweep([{id:'a',class:'building',at:[0,0,0],ry:Math.PI/4,size:[4,4,4]},{id:'b',class:'flora',at:[2.6,0,0],r:.1,h:2}]);
 ok('clearSweep: a turned box is turned (its corner reaches 2.83 m)',rot.fails.length===1,K.clearSweep([{id:'a',class:'building',at:[0,0,0],ry:0,size:[4,4,4]},{id:'b',class:'flora',at:[2.6,0,0],r:.1,h:2}]).fails.length>0);
 ok('clearSweep: o.pairs limits the classes',K.clearSweep(R,{pairs:[['building','street']]}).fails.every(f=>f.ca!=='flora'&&f.cb!=='flora'),false);
 // the KSPACE broad phase finds what the full loop finds
 let s=7;const rnd=()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;},big=[];
 for(let i=0;i<600;i++)big.push(rnd()<.5?{id:'b'+i,class:'building',at:[rnd()*800,0,rnd()*800],ry:rnd()*6,size:[3+rnd()*20,3+rnd()*20,4+rnd()*10]}:{id:'f'+i,class:'flora',at:[rnd()*800,0,rnd()*800],r:.5+rnd()*4,h:3+rnd()*10});
 const KS=global.KSPACE,fast=K.clearSweep(big);global.KSPACE=undefined;const slow=K.clearSweep(big);global.KSPACE=KS;
 const key=o=>o.fails.map(f=>[f.a,f.b].sort().join('+')).sort().join();
 ok('clearSweep: KSPACE\'s broad phase == the full loop ('+fast.fails.length+' overlaps in '+fast.pairs+' pairs)',key(fast)===key(slow)&&fast.fails.length>0,fast.pairs===slow.pairs&&fast.pairs>50000);}

// ---- doors and stairs against drawn bodies
{const y0=G.h(-150,-150),house=K.tris(box(-160,y0-1,-160,-140,y0+6,-150),null,{id:'house',cls:'built'}),SD=[G,house];
 // a door on the house's south face (z = -150), facing south (+z: ry 0). The skin is not cut: blocked
 const door={id:'d1',at:[-150,G.h(-150,-149.9),-150],ry:0,w:1.2,h:2.2};
 const ds=K.doorSweep(SD,[door]);ok('doorSweep: a door through an uncut skin is blocked ('+ds.fails.map(f=>f.rays).join()+' of 9 rays)',ds.fails.length===1&&ds.fails[0].status==='blocked',false);
 // the same door with its opening cut (the house drawn as two blocks either side of a 1.6 m gap, and a lintel)
 const cut=[K.tris(box(-160,y0-1,-160,-150.8,y0+6,-150),null,{id:'w'}),K.tris(box(-149.2,y0-1,-160,-140,y0+6,-150),null,{id:'e'}),K.tris(box(-150.8,y0+2.6,-160,-149.2,y0+6,-150),null,{id:'l'})];
 const dc=K.doorSweep([G].concat(cut),[door]);ok('doorSweep: the cut opening is clear',dc.ok===1,false);
 const hi=Object.assign({},door,{id:'d2',at:[-150,G.h(-150,-149.9)+3,-150]});
 ok('doorSweep: a door 3 m up with no step outside fails',K.doorSweep([G].concat(cut),[Object.assign({},hi,{at:[-150,y0+3,-150]})]).fails.some(f=>f.status==='no step'||f.status==='blocked'),dc.fails.length>0);
 // a stair from the ground to the house's roof, and one whose flight runs through the house
 const roof=y0+6,st={id:'s1',foot:[-150,G.h(-150,-135),-135],head:[-150,roof,-150.5]};
 const ss=K.stairSweep(SD,[st]);ok('stairSweep: a stair to the roof reaches it, clear overhead',ss.ok===1,K.stairSweep(SD,[Object.assign({},st,{head:[-150,roof+1,-150.5]})]).ok===1);
 const through={id:'s2',foot:[-150,G.h(-150,-135),-135],head:[-150,G.h(-150,-170)+.0,-170]};
 const st2=K.stairSweep(SD,[through]);ok('stairSweep: a flight through the house runs into a wall',st2.fails.length===1&&st2.fails[0].status==='into wall',false);}

// ---- the drawers' probe points (item 6)
{const m=KSTACKS.mesh(mesa,{step:5}),p=m.probe,b=mesa.beds[mesa.beds.length>>1];
 ok('KSTACKS.mesh returns a probe point in the body, half way up its middle bed',p&&p.length===3&&Math.abs(p[1]-(b.y+b.h/2))<1e-9&&Math.hypot(p[0]-mesa.x,p[2]-mesa.z)<mesa.R,!p);
 ok('the mesh\'s hash is unchanged by the probe point',KSTACKS.hash(m)===hashBefore,false);
 ok('KSEAT.points joins meshes\' points into one flat array',K.points([m,m,[1,2,3]]).length===9,false);
 const T3=['../../biomes/sedesert/three.min.js'].map(q=>path.join(__dirname,q)).find(q=>fs.existsSync(q)&&fs.statSync(q).size>10000);
 if(T3){const THREE=require(T3);global.performance=global.performance||{now:Date.now};const C=KCARVE.create();
  C.add({id:'a',c:[0,-1],n:[0,1],hw:6,depth:5,h:8,floorY:10,base:(x,z)=>z<-1?40:10,cell:1});
  const M=C.mesh(null,{THREE})[0],pp=M.userData.probePoints;
  ok('KCARVE.mesh sets each patch\'s probe points (the mouth, half way up its void)',pp&&pp.length===3&&pp[0]===0&&pp[1]===14&&pp[2]===-1,false);}
 else console.log('SKIP  KCARVE.mesh probe points (no three.min.js: git lfs pull)');}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
