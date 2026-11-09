// node core/terrain/test-stacks.js — the rock bodies' contract (37-core-stacks.js), each check with a broken input that must fail.
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'37-core-stacks.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KSTACKS;

// ---- a two-tier mesa, a spire, a balanced rock, a row of fins
const mesa=K.make({id:'m1',kind:'mesa',x:0,z:0,y0:0,seed:41,tiers:[{h:200,r:300,e:1.4,ry:.3},{h:120,r:150,e:1.2,dx:40,dz:-30}]});
const sp=K.make({id:'s1',kind:'spire',x:800,z:0,y0:5,seed:7,H:80,r:14});
const bal=K.make({id:'b1',kind:'balanced',x:-800,z:0,y0:0,seed:9,H:40,r:10});
const fins=K.row({id:'f',seed:3,a:[0,700],b:[400,700],n:5,H:[50,80],r:[8,12],e:[3,5]});
const ALL=[mesa,sp,bal].concat(fins);

ok('a mesa stands as tall as its tiers',Math.abs(mesa.top-320)<.01,Math.abs(mesa.top-300)<.01);
ok('its beds pile up without gaps',mesa.beds.every((b,i)=>i===0||Math.abs(b.y-(mesa.beds[i-1].y+mesa.beds[i-1].h))<1e-9),false);
ok('the same seed gives the same body',JSON.stringify(K.make({id:'m1',kind:'mesa',x:0,z:0,y0:0,seed:41,tiers:[{h:200,r:300,e:1.4,ry:.3},{h:120,r:150,e:1.2,dx:40,dz:-30}]}))===JSON.stringify(mesa),
  JSON.stringify(K.make({id:'m1',kind:'mesa',x:0,z:0,y0:0,seed:42,tiers:[{h:200,r:300,e:1.4,ry:.3},{h:120,r:150,e:1.2,dx:40,dz:-30}]}))===JSON.stringify(mesa));
let threw=false;try{K.make({id:'x',kind:'hill'});}catch(e){threw=true;}ok('an unknown kind is refused',threw,false);
threw=false;try{K.make({kind:'spire'});}catch(e){threw=true;}ok('a body without an id is refused',threw,false);

// ---- the height: the top of the highest bed over a point; the upper tier stands on the lower; off the rock nothing
const tTop=K.at(ALL,40,-30),tLow=K.at(ALL,239,74);
ok('the cap tier\'s top is its top',tTop&&tTop.b.tier===1&&Math.abs(tTop.top-320)<1,tTop&&tTop.b.tier===0);
ok('the bench (the lower tier out from under the cap) is lower',tLow&&tLow.b.tier===0&&Math.abs(tLow.top-200)<1,tLow&&tLow.b.tier===1);
ok('off the rock there is no top',K.topAt(ALL,0,-900)===-Infinity,K.topAt(ALL,0,0)===-Infinity);
const fo=K.foot(ALL,0,-900);ok('the foot reports the distance to the lowest bed',fo&&fo.S===mesa&&fo.d>0,fo&&fo.d<0);

// ---- the field, the height and the mesh agree (nwbay's lesson): every top vertex is on topAt
function topsAgree(B,list){const m=K.mesh(B);let worst=0,n=0;
  for(let i=0;i<m.part.length;i++){if(m.part[i]!==1)continue;const x=m.pos[3*i],y=m.pos[3*i+1],z=m.pos[3*i+2];
    // a top vertex on the very edge may belong to the bed's own rim: sample a hair inside it, toward the top's centre (a
    // stack leans: the top's centre is the bed's shifted by tx, tz)
    const b=B.beds[m.bed[i]],ix=x+(b.cx+(b.tx||0)-x)*.01,iz=z+(b.cz+(b.tz||0)-z)*.01,t=K.at(list,ix,iz);if(!t||t.b!==b)continue;
    worst=Math.max(worst,Math.abs(t.top-K.topH(b,ix,iz)));worst=Math.max(worst,Math.abs(y-K.topH(b,x,z)));n++;}
  return {worst,n};}
const ag=topsAgree(mesa,ALL);ok('the mesh\'s tops lie on the height the field reports ('+ag.n+' vertices)',ag.n>500&&ag.worst<1e-4,false);
const mBad=K.mesh(mesa);{const i0=mBad.part.indexOf(1);mBad.pos[3*i0+1]+=3;}{let w=0;for(let i=0;i<mBad.part.length;i++)if(mBad.part[i]===1){w=Math.max(w,Math.abs(mBad.pos[3*i+1]-K.topH(mesa.beds[mBad.bed[i]],mBad.pos[3*i],mBad.pos[3*i+2])));}
  ok('a moved vertex would be caught',true,w<1e-4);}
// ---- a stack is one tapering, leaning column (Pinnacle Rock, 2026-10-19: not a pile of drums): each bed's top outline is
// the next bed's foot, and the tops still lie on the field
function seams(B){let worst=0;for(let k=0;k<B.beds.length-1;k++){const b=B.beds[k],c=B.beds[k+1];if(B.kind==='balanced'&&k===B.beds.length-2)continue;
  const top=K.ring(B,b.y+b.h-1e-7,24),foot=K.ring(B,c.y+1e-7,24);
  for(let i=0;i<24;i++)worst=Math.max(worst,Math.hypot(top[i][0]-foot[i][0],top[i][1]-foot[i][1])/Math.max(c.rx,c.rz));}return worst;}
const leaner=K.make({id:'s2',kind:'spire',x:0,z:900,y0:0,seed:11,H:110,r:13,lean:.12});
ok('a spire\'s beds meet: each top is the next foot (worst '+(seams(leaner)*100).toFixed(1)+'% of a radius)',seams(leaner)<.08&&seams(sp)<.08,false);
{const stepped=JSON.parse(JSON.stringify(leaner));stepped.beds.forEach(b=>{b.tp=1;b.tx=0;b.tz=0;});
  ok('a stepped stack (the old drums) would be caught',true,seams(stepped)<.08);}
const ags=topsAgree(leaner,[leaner]);ok('a leaning spire\'s tops lie on the field ('+ags.n+' vertices)',ags.n>40&&ags.worst<1e-4,false);
ok('its crest narrows (the shoulders weathered round)',leaner.beds[leaner.beds.length-1].tp<.9,false);
// ---- a mesa's walls weathered (Pinnacle Rock, 2026-10-19: not smoothly cut): its beds' outlines differ (a ragged, stepped
// edge), gullies notch the rim and die out down the cliff, the walls still face out; weather 0 is the old clean cut
const raw=K.make({id:'w0',kind:'mesa',x:0,z:0,y0:0,seed:41,weather:0,tiers:[{h:200,r:300,e:1.4,ry:.3}]});
const wm=K.make({id:'w1',kind:'mesa',x:0,z:0,y0:0,seed:41,weather:.8,tiers:[{h:200,r:300,e:1.4,ry:.3}]});
// how much two beds' outlines differ in SHAPE (the spread round the rim of one minus the other, scaled to the same mean:
// a bed a little larger all round is not ragged)
function ragged(B){let s=0,n=0;for(let k=1;k<B.beds.length;k++){const d=[];for(let i=0;i<96;i++){const a=i/96*Math.PI*2,r0=K.footR(B.beds[k-1],a),r1=K.footR(B.beds[k],a);d.push(r1/r0);}
  const m=d.reduce((p,q)=>p+q,0)/d.length;s+=Math.sqrt(d.reduce((p,q)=>p+(q-m)*(q-m),0)/d.length)*K.footR(B.beds[k],0);n++;}return s/n;}
ok('weathered beds differ in outline ('+ragged(wm).toFixed(2)+' m between beds; clean-cut '+ragged(raw).toFixed(2)+' m)',ragged(wm)>1,ragged(raw)>.5);
{const top=wm.beds[wm.beds.length-1],low=wm.beds[0],g=top.gu&&top.gu[0];
 const notch=b=>{const gg=g[0];let o=0;for(const d of [-.35,.35])o+=K.footR(b,gg+d);return o/2-K.footR(b,gg);};
 ok('a gully notches the rim ('+(g?notch(top).toFixed(1):'none')+' m) and dies out down the cliff ('+(g?notch(low).toFixed(1):'-')+' m)',!!g&&notch(top)>6&&notch(low)<notch(top)*.3,
  !!(raw.beds[raw.beds.length-1].gu));}
const sw=shares(wm);ok('a weathered mesa\'s walls still face out ('+(sw.wall*100).toFixed(1)+'%)',sw.wall>.95,false);
ok('a weathered mesa\'s undersides close every overhang ('+shares(wm).nUnd+' triangles, facing down)',undersides(wm)===0&&shares(wm).und>.99,false);
// ---- the shoulder (the owner's Monument Valley butte, 2026-10-19): thin beds stepping back from the cliff's top, a rough
// 30-45 degree slope of ledges to the cap rock, the top inside it flat and whole; and the flutes run down the cliff
const sh=K.make({id:'sh',kind:'butte',x:0,z:0,y0:0,seed:52,weather:1,shoulder:{h:30,back:36},tiers:[{h:220,r:300,e:1.4,ry:.3}]});
const shBeds=sh.beds.filter(b=>b.y>=220-30-.01),cliff=sh.beds.filter(b=>b.y<190-.01).slice(-1)[0];
const meanR=b=>{let r=0;for(let i=0;i<64;i++)r+=K.footR(b,i/64*Math.PI*2);return r/64;};
{const back=meanR(cliff)-meanR(shBeds[shBeds.length-1]),deg=Math.atan2(30,back)*180/Math.PI,steps=shBeds.every((b,i)=>i===0||meanR(b)<meanR(shBeds[i-1])+.5);
 ok('the shoulder steps back '+back.toFixed(0)+' m over 30 m in '+shBeds.length+' ledges ('+deg.toFixed(0)+' degrees)',deg>=28&&deg<=47&&shBeds.length>=4&&steps,false);
 const plain=K.make({id:'sh',kind:'butte',x:0,z:0,y0:0,seed:52,weather:1,tiers:[{h:220,r:300,e:1.4,ry:.3}]});
 ok('without a shoulder the top is the cliff\'s (the negative)',true,Math.abs(meanR(plain.beds[plain.beds.length-1])-meanR(plain.beds[0]))>10);
 const agS=topsAgree(sh,[sh]);ok('the shoulder\'s ledges lie on the field ('+agS.n+' vertices)',agS.n>300&&agS.worst<1e-4,false);}
{const a=sh.beds[2],b=sh.beds[4],wig=B=>{const o=[];for(let i=0;i<720;i++){const t=i/720*Math.PI*2;o.push(K.footR(B,t)-(K.footR(B,t-.01)+K.footR(B,t+.01))/2);}return o;};
 const A=wig(a),Bw=wig(b),c=(()=>{let sa=0,sb=0,sab=0;for(let i=0;i<A.length;i++){sa+=A[i]*A[i];sb+=Bw[i]*Bw[i];sab+=A[i]*Bw[i];}return sab/Math.sqrt(sa*sb);})();
 ok('the flutes run down the cliff: two of its beds share their grooves (correlation '+c.toFixed(2)+')',c>.5,false);}
const agw=topsAgree(wm,[wm]);ok('and its tops lie on the field',agw.n>300&&agw.worst<1e-4,false);

// ---- the mesh faces out: walls away from the axis, tops up, an overhang's underside down
function shares(B){const m=K.mesh(B),P=m.pos,I=m.idx;let wall=0,wallOut=0,top=0,up=0,und=0,down=0;
  for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2],ax=P[3*a],ay=P[3*a+1],az=P[3*a+2];
    const ux=P[3*b]-ax,uy=P[3*b+1]-ay,uz=P[3*b+2]-az,vx=P[3*c]-ax,vy=P[3*c+1]-ay,vz=P[3*c+2]-az;
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,p=m.part[a],bd=B.beds[m.bed[a]];
    if(Math.hypot(nx,ny,nz)<1e-9)continue;
    if(p===0){wall++;if(nx*(ax-bd.cx)+nz*(az-bd.cz)>0)wallOut++;}else if(p===1){top++;if(ny>0)up++;}else{und++;if(ny<0)down++;}}
  return {wall:wallOut/wall,top:up/top,und:und?down/und:1,nUnd:und,m};}
const sm=shares(mesa);ok('a mesa\'s walls face out and its tops up ('+(sm.wall*100).toFixed(1)+'%, '+(sm.top*100).toFixed(1)+'%)',sm.wall>.97&&sm.top>.99,false);
const sb=shares(bal);ok('a balanced rock has an underside, facing down ('+sb.nUnd+' triangles)',sb.nUnd>0&&sb.und>.99,false);
{const m=sb.m,I=m.idx.slice();for(let t=0;t<I.length;t+=3){const x=I[t+1];I[t+1]=I[t+2];I[t+2]=x;}
  ok('a flipped winding would be caught',true,(()=>{const P=m.pos;let o=0,w=0;for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2];if(m.part[a]!==0)continue;
    const ux=P[3*b]-P[3*a],uy=P[3*b+1]-P[3*a+1],uz=P[3*b+2]-P[3*a+2],vx=P[3*c]-P[3*a],vy=P[3*c+1]-P[3*a+1],vz=P[3*c+2]-P[3*a+2],nx=uy*vz-uz*vy,nz=ux*vy-uy*vx,bd=bal.beds[m.bed[a]];w++;if(nx*(P[3*a]-bd.cx)+nz*(P[3*a+2]-bd.cz)>0)o++;}return o/w>.97;})());}
ok('a balanced rock\'s cap is wider than its neck',(()=>{const n=bal.beds.length,c=bal.beds[n-1],k=bal.beds[n-2];return Math.min(c.rx,c.rz)>Math.max(k.rx,k.rz);})(),false);
// every bed that overhangs the one below has an underside, and one that does not has none (a slit to the sky otherwise:
// the owner, 2026-10-19)
function undersides(B,m){m=m||K.mesh(B);let bad=0;for(let k=1;k<B.beds.length;k++){const b=B.beds[k],lo=B.beds[k-1];let over=false;
  for(let i=0;i<180&&!over;i++){const a=-i/180*Math.PI*2;if(K.footR(b,a)*(1-b.nt)>K.footR(lo,a)*(1-lo.ch)*(lo.tp==null?1:lo.tp)+.5)over=true;}
  let has=false;for(let v=0;v<m.part.length&&!has;v++)if(m.part[v]===2&&m.bed[v]===k)has=true;if(over&&!has)bad++;}return bad;}   // a bed out by half a metre or more must close its underside
{const m=K.mesh(mesa),cut={pos:m.pos,part:m.part.map(p=>p===2?0:p),bed:m.bed};
 ok('every overhanging bed has its underside ('+mesa.beds.length+' beds)',undersides(mesa)===0,undersides(mesa,cut)===0&&shares(mesa).nUnd>0);}

// ---- fins: one strike along their row; slender
ok('fins share their row\'s strike',fins.every(f=>Math.abs(Math.sin(f.beds[0].ry))<.15),fins.every(f=>Math.abs(Math.cos(f.beds[0].ry))<.15));
ok('a fin is long and thin',fins.every(f=>f.beds[0].rx/f.beds[0].rz>2.5),false);

// ---- ledges and rings
let led=0;for(let i=0;i<4000;i++){const a=i/4000*Math.PI*2,r=120+i%180;if(K.ledge([mesa],Math.cos(a)*r,Math.sin(a)*r))led++;}
ok('the bench out from under the cap is a ledge ('+led+' of 4000 samples)',led>200,false);
ok('a cap\'s top is not a ledge',!K.ledge([mesa],40,-30),!!K.ledge([mesa],40,-30)&&false);
const rg=K.ring(sp,40,32);ok('a ring at a height lies on the wall there',rg&&rg.length===32&&rg.every(p=>{const t=K.at([sp],p[0]+(sp.x-p[0])*.05,p[1]+(sp.z-p[1])*.05);return t;}),K.ring(sp,500)!==null);

// ---- a garden: no two stacks overlap; layouts are deterministic
const gd=K.cluster({id:'g',seed:5,c:[0,0],rad:200,n:12,H:[30,60],r:[6,12],gap:5});
ok('a garden\'s stacks keep their gap ('+gd.length+' placed)',gd.length>=8&&gd.every((a,i)=>gd.every((b,j)=>i===j||Math.hypot(a.x-b.x,a.z-b.z)>5)),false);
ok('the same garden from the same seed',JSON.stringify(K.cluster({id:'g',seed:5,c:[0,0],rad:200,n:12,H:[30,60],r:[6,12],gap:5}))===JSON.stringify(gd),
  JSON.stringify(K.cluster({id:'g',seed:6,c:[0,0],rad:200,n:12,H:[30,60],r:[6,12],gap:5}))===JSON.stringify(gd));
// ---- the variety ranges: asked for, each stack draws its own taper, lean and crown; not asked for, the garden is as before
{const gv=K.cluster({id:'g',seed:5,c:[0,0],rad:200,n:12,H:[30,60],r:[6,12],gap:5,taper:[.2,.6],lean:[0,.15],crown:[.5,1],lift:(x,z,r)=>r});
 const tp=B=>B.beds[B.beds.length-1].tp,lean=B=>Math.hypot(B.beds[0].tx,B.beds[0].tz)/B.beds[0].h;
 ok('variety: the same places, taller by the lift, crowns and leans of their own',gv.length===gd.length&&gv.every((B,i)=>B.x===gd[i].x&&B.z===gd[i].z&&B.top-B.y0>gd[i].top-gd[i].y0+5)&&new Set(gv.map(B=>tp(B).toFixed(3))).size>6&&new Set(gv.map(B=>lean(B).toFixed(3))).size>6,
   gv.every((B,i)=>tp(B)===tp(gd[i])));}
ok('a mesh is the same every time',K.hash(K.mesh(mesa))===K.hash(K.mesh(K.load(K.export([mesa]))[0])),K.hash(K.mesh(mesa))===K.hash(K.mesh(sp)));
threw=false;try{K.load({format:'x'});}catch(e){threw=true;}ok('a foreign export is refused',threw,false);
// ---- the karst tower: KSTACKS.tower is guilin's tower() as it stood (biomes/guilin/src/45-host-stage.js before 2026-10-25),
// so the guilin page's rock is unchanged; the copy below is that function, kept as the golden
{const TAU=Math.PI*2,KR=global.KRAND;
 function oldTower(id,seed,x,z,H,R,y0,footY){const s=KR.stream(KR.hash(seed,0x70E)),e=s.range(1.0,1.3);
  const B=K.make({id,kind:'spire',x,z,y0:y0==null?footY(x,z,R*Math.sqrt(e)):y0,seed,H,r:R,e,ry:s.range(0,TAU),lean:s.range(0,.045),taper:0,crown:1});
  const tw=s.range(.45,.62),pw=s.range(.84,.94),kx=s.range(1.7,2.7),phi=s.range(0,TAU),drift=s.range(.04,.16)*R;
  const prof=t=>t<=tw?1-(1-pw)*t/tw:pw*Math.pow(Math.max(0,1-.95*Math.pow((t-tw)/(1-tw),kx)),1/kx);
  const sh=t=>t<=tw?0:drift*Math.pow((t-tw)/(1-tw),1.5);
  B.beds.forEach(b=>{const t0=(b.y-B.y0)/H,t1=(b.y+b.h-B.y0)/H,f0=prof(t0),f1=prof(t1);b.rx*=f0;b.rz*=f0;b.tp=f1/Math.max(.01,f0);b.lob=.2;
   b.cx+=Math.cos(phi)*sh(t0);b.cz+=Math.sin(phi)*sh(t0);b.tx+=Math.cos(phi)*(sh(t1)-sh(t0));b.tz+=Math.sin(phi)*(sh(t1)-sh(t0));});
  let RR=0;B.beds.forEach(b=>{RR=Math.max(RR,Math.max(b.rx,b.rz)*(1+2.5*b.lob)+Math.hypot(b.cx-x,b.cz-z));});B.R=RR+2;B.tower=true;return B;}
 const foot=(x,z,r)=>-3-.01*r+.001*x;let same=true,n=0;
 for(let i=0;i<40;i++){const seed=2200+i*7,x=i*37-700,z=500-i*23,H=90+i*3.5,R=40+i*2,y0=i%3?null:-2;
  const a=oldTower('t'+i,seed,x,z,H,R,y0,foot),b=K.tower({id:'t'+i,seed,x,z,H,R,y0:y0==null?undefined:y0,foot});
  if(JSON.stringify(a)!==JSON.stringify(b))same=false;n++;}
 const T=K.tower({id:'t',seed:9,x:0,z:0,H:150,R:60,y0:0});
 // the surface over the dome: never under the beds' tops, on the wall where a bed tapers, and a slope (not a staircase)
 {let under=0,walls=0,soil=0,jump=0,prev=null;for(let r=0;r<=70;r+=1){const p=K.surface([T],r,0),a=K.at([T],r,0);if(!p)break;
   if(a&&p.top<a.top-1e-9)under++;if(p.wall){walls++;if(p.steep<2.75)soil++;}if(prev!=null&&r<55&&Math.abs(p.top-prev)>14)jump++;prev=p.top;}
  ok('KSTACKS.surface: on the dome\'s walls ('+walls+' samples, '+soil+' hold soil), never under a top, no staircase',under===0&&walls>5&&soil>0&&jump===0,
   K.at([T],30,0)&&K.surface([T],30,0)&&K.at([T],30,0).top===K.surface([T],30,0).top&&K.surface([T],30,0).wall);}
 ok('KSTACKS.tower is guilin\'s tower(), record for record ('+n+' towers), a cliff under a dome',same&&T.tower===true&&T.top>140&&T.beds[T.beds.length-1].rx<T.beds[0].rx*.7,
   JSON.stringify(K.tower({id:'t',seed:10,x:0,z:0,H:150,R:60,y0:0}))===JSON.stringify(T));}

// ---- the gridded top (opt.top {grid}: Korona's hoar pavement, 2026-10-26). Without it every mesh is as before (the hashes
// below are the module's before the option, refrozen 2026-11-08 for the centre fan that closes a ringed top); with it a relief top is
// a clipped grid, watertight with its wall
{const H0={mesa:2719229404,sp:3424084641,relief:4222178254};
 ok('without opt.top the meshes are unchanged (default and the hoar\'s 150-ring options)',K.hash(K.mesh(mesa))===H0.mesa&&K.hash(K.mesh(sp))===H0.sp&&K.hash(K.mesh(mesa,{step:7,topRings:150,segMax:1200}))===H0.relief,
  K.hash(K.mesh(mesa,{top:{grid:5,cull:false}}))===H0.mesa);
 ok('a bed too narrow for the grid keeps its rings (a spire)',K.hash(K.mesh(sp,{top:{grid:5,cull:false}}))===H0.sp,K.hash(K.mesh(sp,{top:{grid:2,minCells:1}}))===H0.sp);
 // a relief top, as the hoar table wraps it: knolls on the beds' tops
 const _th=K.topH;K.topH=function(b,x,z){return _th(b,x,z)+4*Math.sin(x*.05)*Math.cos(z*.04);};
 const G=K.mesh(mesa,{step:7,segMax:1200,top:{grid:5,cull:false}}),F=K.mesh(mesa,{step:7,topRings:150,segMax:1200});
 function topStats(m,B){const P=m.pos,I=m.idx,area={},edges=new Map();let up=0,n=0;
   for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2];if(m.part[a]!==1)continue;n++;
     const ux=P[3*b]-P[3*a],uz=P[3*b+2]-P[3*a+2],vx=P[3*c]-P[3*a],vz=P[3*c+2]-P[3*a+2],ny=uz*vx-ux*vz;if(ny>0)up++;
     area[m.bed[a]]=(area[m.bed[a]]||0)+Math.abs(ny)/2;
     [[a,b],[b,c],[c,a]].forEach(([p,q])=>{const k=p<q?p+','+q:q+','+p;edges.set(k,(edges.get(k)||0)+1);});}
   let bLen=0,over=0;edges.forEach((v,k)=>{if(v>2)over++;if(v===1){const [p,q]=k.split(',').map(Number);bLen+=Math.hypot(P[3*p]-P[3*q],P[3*p+2]-P[3*q+2]);}});
   return {up:up/n,n,area,bLen,over};}
 function ringOf(B,k,opt){const b=B.beds[k],per=2*Math.PI*Math.max(b.rx,b.rz)*(1+b.lob),seg=Math.max(16,Math.min(opt.segMax,Math.round(per/opt.step))),c=[b.cx+(b.tx||0),b.cz+(b.tz||0)],t1=b.tp==null?1:b.tp;
   let A=0,L=0;const pts=[];for(let s=0;s<seg;s++){const a=-s/seg*2*Math.PI,R=K.footR(b,a)*(1-b.ch)*t1;pts.push([c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R]);}
   for(let s=0;s<seg;s++){const p=pts[s],q=pts[(s+1)%seg];A+=p[0]*q[1]-q[0]*p[1];L+=Math.hypot(q[0]-p[0],q[1]-p[1]);}return {A:Math.abs(A)/2,L,pts};}
 const st=topStats(G,mesa),opt={step:7,segMax:1200};let aErr=0,perim=0;
 let nG=0;mesa.beds.forEach((b,k)=>{const r=ringOf(mesa,k,opt);perim+=r.L;if(Math.min(b.rx,b.rz)*(1-b.ch)*(b.tp==null?1:b.tp)*(1-b.lob)<=15)return;nG++;aErr=Math.max(aErr,Math.abs((st.area[k]||0)-r.A)/r.A);});
 ok('the grid top covers each top exactly (area within 1e-6 of the edge ring\'s: '+aErr.toExponential(1)+') and faces up ('+(st.up*100).toFixed(2)+'%)',aErr<1e-6&&st.up===1,false);
 ok('it is watertight: only the edge ring is open (open length '+st.bLen.toFixed(1)+' m, the rings '+perim.toFixed(1)+' m), no edge shared three ways',Math.abs(st.bLen-perim)<1e-6*perim&&st.over===0,false);
 {const m=K.mesh(mesa,{step:7,segMax:1200,top:{grid:5,cull:false}}),I=m.idx;let t=0;while(m.part[I[t]]!==1)t+=3;t+=3*600;const cut={pos:m.pos,idx:Array.from(I).filter((_,q)=>Math.floor(q/3)!==t/3),part:m.part,bed:m.bed};
  const s2=topStats(cut,mesa);ok('a missing triangle would be caught (a hole opens in the edges)',true,Math.abs(s2.bLen-perim)<1e-6*perim);}
 // the vertices: on topH, except a ring edge's crossings of a grid line (on the wall's straight top edge)
 {let on=0,off=0,worst=0,tv=0;for(let i=0;i<G.part.length;i++){if(G.part[i]!==1)continue;tv++;const d=Math.abs(G.pos[3*i+1]-K.topH(mesa.beds[G.bed[i]],G.pos[3*i],G.pos[3*i+2]));if(d<1e-3)on++;else{off++;worst=Math.max(worst,d);}}
  let ftv=0;for(let i=0;i<F.part.length;i++)if(F.part[i]===1)ftv++;
  ok('its vertices are on topH but the ring crossings ('+on+' on, '+off+' crossings, worst '+worst.toFixed(3)+' m), and far fewer than the ring fan ('+tv+' against '+ftv+')',off<on*.2&&worst<.5&&tv<ftv*.5,false);}
 ok('the grid top is the same every time',K.hash(K.mesh(mesa,{step:7,segMax:1200,top:{grid:5,cull:false}}))===K.hash(G),K.hash(K.mesh(mesa,{step:7,segMax:1200,top:{grid:6,cull:false}}))===K.hash(G));
 // many bodies and grid sizes: every top covered once, only its edge open
 {let worst=0,openBad=0,nb=0;for(let q=0;q<12;q++){const B=K.make({id:'g'+q,kind:'mesa',x:q*37.3-200,z:q*-21.7+90,y0:0,seed:300+q*11,lobes:.1+.03*q,tiers:[{h:120,r:90+q*17,e:1+q*.07,ry:q*.4},{h:60,r:40+q*6,e:1.2,dx:q*3,dz:-q*2}]}),Gs=[3,5,7][q%3],o={step:5+q%3,segMax:900,top:{grid:Gs,cull:false}},m=K.mesh(B,o),t=topStats(m,B);
   let L=0;B.beds.forEach((b,k)=>{const r=ringOf(B,k,o);L+=r.L;if(Math.min(b.rx,b.rz)*(1-b.ch)*(b.tp==null?1:b.tp)*(1-b.lob)<=Gs*3)return;nb++;worst=Math.max(worst,Math.abs((t.area[k]||0)-r.A)/r.A);});
   if(Math.abs(t.bLen-L)>1e-5*L||t.over)openBad++;}
  ok('12 more bodies, grids of 3, 5 and 7 m: '+nb+' gridded tops, area within '+worst.toExponential(1)+', '+openBad+' with a hole',nb>20&&worst<1e-6&&openBad===0,false);}
 // the cull: cells under the bed above are left out, and every hole it opens lies under that bed's foot
 {const C=K.mesh(mesa,{step:7,segMax:1200,top:{grid:5}}),st2=topStats(C,mesa);let tv=0,cv=0;for(let i=0;i<G.part.length;i++)if(G.part[i]===1)tv++;for(let i=0;i<C.part.length;i++)if(C.part[i]===1)cv++;
  const P=C.pos,I=C.idx,E=new Map();for(let t=0;t<I.length;t+=3){if(C.part[I[t]]!==1)continue;const a=I[t],b=I[t+1],c=I[t+2];[[a,b],[b,c],[c,a]].forEach(([p,q])=>{const k=p<q?p+','+q:q+','+p;E.set(k,(E.get(k)||0)+1);});}
  let outside=0;E.forEach((v,k)=>{if(v!==1)return;const [p,q]=k.split(',').map(Number),bd=C.bed[p],up=mesa.beds[bd+1];const mx=(P[3*p]+P[3*q])/2,mz=(P[3*p+2]+P[3*q+2])/2;
   const r=ringOf(mesa,bd,opt);let dm=1e9;for(let s=0;s<r.pts.length;s++){const A=r.pts[s],B=r.pts[(s+1)%r.pts.length],ex=B[0]-A[0],ez=B[1]-A[1],t=Math.max(0,Math.min(1,((mx-A[0])*ex+(mz-A[1])*ez)/(ex*ex+ez*ez)));dm=Math.min(dm,Math.hypot(mx-A[0]-t*ex,mz-A[1]-t*ez));}const onRing=dm<1e-3;
   if(onRing)return;if(!up){outside++;return;}const ua=Math.atan2(mz-up.cz,mx-up.cx);if(Math.hypot(mx-up.cx,mz-up.cz)>K.footR(up,ua)*(1-up.nt))outside++;});
  ok('the cull leaves out the tops hidden under the bed above ('+cv+' vertices against '+tv+'), every hole under that bed ('+outside+' outside)',cv<tv*.6&&outside===0,false);}
 K.topH=_th;}

// ---- surface on the drawn wall (o.drawn, 2026-10-26: k-guilin's trees stood up to a metre proud where the chamfer pulls the wall in)
{const T=K.tower({id:'t',seed:9,x:0,z:0,H:150,R:60,y0:0});let eD=0,eL=0,n=0;
 for(let k=0;k<T.beds.length;k++){const b=T.beds[k];if((b.tp==null?1:b.tp)>.995)continue;
  for(let a=0;a<6.28;a+=.7)for(const u of [.3,.6,.85,.95]){const w=K.wall(T,b,a,u),pD=K.surface([T],w.x,w.z,null,{drawn:true}),pL=K.surface([T],w.x,w.z);
   if(!pD||!pL||!pD.wall||!pL.wall||pD.b!==b||pL.b!==b)continue;n++;eD=Math.max(eD,Math.abs(pD.top-w.y));eL=Math.max(eL,Math.abs(pL.top-w.y));}}
 ok('KSTACKS.surface {drawn}: on the drawn wall within '+eD.toFixed(3)+' m ('+n+' points; the straight wall is off by '+eL.toFixed(2)+' m)',n>20&&eD<.05&&eL>eD,eL<.05);
 ok('without o.drawn surface is as before',JSON.stringify(K.surface([T],30,0))===JSON.stringify(K.surface([T],30,0,null,null)),false);}
// ---- the mound (2026-10-26, core gap H10): a termite cathedral, fluted clay spires on a skirt, on a sloping ground
{const gr=(x,z)=>.12*x+.4*Math.sin(z*.3)+10,MO={id:'mo',kind:'mound',x:3,z:4,H:8,seed:5,ground:gr},M=K.make(MO);
 // a vertical ray down through a mesh (the triangles of the beds keep() accepts): the highest crossing, or null
 const ray=(m,x,z,keep)=>{let best=null;const P=m.pos,I=m.idx;for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2];if(keep&&!keep(m.bed[a]))continue;
   const ax=P[3*a],az=P[3*a+2],bx=P[3*b],bz=P[3*b+2],cx=P[3*c],cz=P[3*c+2],d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-12)continue;
   const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d,l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d,l3=1-l1-l2;if(l1<-1e-7||l2<-1e-7||l3<-1e-7)continue;
   const y=l1*P[3*a+1]+l2*P[3*b+1]+l3*P[3*c+1];if(best==null||y>best)best=y;}return best;};
 const mm=K.mesh(M),sk=M.beds[0];
 ok('a mound is a kind in the table, beside the others',K.kinds().includes('mound')&&K.kinds().includes('mesa'),!K.kinds().includes('mound'));
 ok('it is a skirt (col -1) and its spires\' columns ('+M.cols+')',sk.col===-1&&M.beds.slice(1).every(b=>b.col>=0)&&M.cols>=1&&new Set(M.beds.slice(1).map(b=>b.col)).size===M.cols,false);
 ok('the same seed gives the same mound, another seed another',JSON.stringify(K.make(MO))===JSON.stringify(M),JSON.stringify(K.make(Object.assign({},MO,{seed:6})))===JSON.stringify(M));
 threw=false;try{K.make({kind:'mound'});}catch(e){threw=true;}ok('a mound without an id is refused',threw,false);
 ok('H is the main spire\'s top over the ground at its centre ('+M.top.toFixed(2)+' against '+(gr(3,4)+8).toFixed(2)+')',Math.abs(M.top-(gr(3,4)+8))<.05,Math.abs(K.make(Object.assign({},MO,{H:5})).top-(gr(3,4)+8))<.05);
 {const T=K.make({id:'t',kind:'mound',x:0,z:0,H:15,r:6,seed:5,y0:0}),s=K.make({id:'t',kind:'mound',x:0,z:0,H:3,r:1.2,seed:5,y0:0});
  const girth=B=>{let m=0;for(let a=0;a<6.28;a+=.1)m=Math.max(m,K.footR(B.beds[0],a)*K.prof(B.beds[0],0));return m;};
  ok('height and girth are parameters: a 15 m cathedral on a 6 m skirt, a 3 m mound on a 1.2 m one ('+girth(T).toFixed(2)+', '+girth(s).toFixed(2)+' m)',Math.abs(T.top-15)<.05&&Math.abs(s.top-3)<.05&&girth(T)>5.4&&girth(T)<7.5&&girth(s)>1&&girth(s)<1.5,girth(T)<girth(s));}
 // the flutes: the main spire's outline has as many buttresses as M.flutes; without flutes it is smooth
 // (a buttress: the outline's highest point within half a flute either side, standing a third of the flute's depth proud;
 // the grooves wander, so two may merge)
 const bumps=(b,fn)=>{const N=720,R=[];for(let i=0;i<N;i++)R.push(K.footR(b,i/N*2*Math.PI));const w=Math.round(N/fn/2);let n=0;
   for(let i=0;i<N;i++){let mx=true,lo=Infinity;for(let k=-w;k<=w;k++){const v=R[(i+k+N)%N];if(k&&v>R[i])mx=false;lo=Math.min(lo,v);}if(mx&&R[i]-lo>.16*R[i]*.3)n++;}return n;};
 {const M0=K.make(Object.assign({},MO,{flutes:0})),nb=bumps(M.beds[1],M.flutes),n0=bumps(M0.beds[1],M.flutes);
  ok('the spires are fluted: '+nb+' buttresses round the main spire for '+M.flutes+' flutes; none without ('+n0+')',nb>=M.flutes*.65&&nb<=M.flutes&&n0===0,n0>=M.flutes*.65);
  ok('a column\'s beds share their flutes (the grooves line up)',M.beds.filter(b=>b.col===0).every(b=>b.fn===M.flutes&&b.fp===M.beds[1].fp),false);}
 // the skirt sits on the sampled ground: its drawn foot ring is at the ground less the sink, and the ground nowhere pokes
 // through the drawn skirt
 {let fw=0,poke=0,n=0;for(let i=0;i<mm.part.length;i++){if(mm.bed[i]!==0||mm.part[i]!==0)continue;const x=mm.pos[3*i],y=mm.pos[3*i+1],z=mm.pos[3*i+2];
    const a=Math.atan2(z-sk.cz,x-sk.cx),rf=Math.hypot(x-sk.cx,z-sk.cz),R0=K.footR(sk,a)*K.prof(sk,0);if(Math.abs(rf-R0)>1e-6)continue;n++;fw=Math.max(fw,Math.abs(y-(gr(x,z)-.06)));}
  for(let a=0;a<6.28;a+=.05)for(const f of [.5,.75,.9]){   /* the last few centimetres of the toe are the sink: buried */const R0=K.footR(sk,a)*K.prof(sk,0)*f,x=sk.cx+Math.cos(a)*R0,z=sk.cz+Math.sin(a)*R0,y=ray(mm,x,z);if(y==null||y<gr(x,z)-.01)poke++;}
  const F=K.mesh(K.make(Object.assign({},MO,{ground:null,y0:gr(3,4)}))),Fs=K.make(Object.assign({},MO,{ground:null,y0:gr(3,4)})).beds[0];let fl=0;
  for(let a=0;a<6.28;a+=.05){const R0=K.footR(Fs,a)*K.prof(Fs,0)*.97,x=Fs.cx+Math.cos(a)*R0,z=Fs.cz+Math.sin(a)*R0,y=ray(F,x,z);if(y==null||y<gr(x,z)-.01||y>gr(x,z)+.4)fl++;}
  ok('the skirt\'s drawn foot is on the sampled ground ('+n+' foot vertices within '+fw.toFixed(3)+' m of ground less the sink), the ground nowhere through it ('+poke+')',n>40&&fw<.05&&poke===0,false);
  ok('a mound on a flat foot (no ground) on the same slope would be caught ('+fl+' foot rays off the ground)',true,fl===0);}
 // every spire is set into the skirt AS DRAWN: rays down at each column's foot ring meet the skirt's triangles above the
 // spire's foot, and not far above
 {let worst=-1e9,deep=0,miss=0,n=0;const embeds=[];for(let c=0;c<M.cols;c++){const b0=M.beds.find(b=>b.col===c);
   for(let i=0;i<mm.part.length;i++){if(mm.bed[i]!==b0.k||mm.part[i]!==0)continue;const x=mm.pos[3*i],y=mm.pos[3*i+1],z=mm.pos[3*i+2];if(Math.abs(y-b0.y)>1e-4)continue;
    const ea=Math.atan2(z-sk.cz,x-sk.cx);if(Math.hypot(x-sk.cx,z-sk.cz)<K.footR(sk,ea)*sk.tp*(1-sk.ch)*.1)continue;   /* a top's rings stop at 8% of its radius: that hole is under the main spire */
    const s=ray(mm,x,z,k=>k===0);n++;if(s==null){miss++;continue;}worst=Math.max(worst,y-s);deep=Math.max(deep,s-y);}}
  ok('each spire\'s foot is set into the drawn skirt ('+n+' rays: none misses ('+miss+'), the foot at most '+worst.toFixed(3)+' m from the skirt, buried at most '+deep.toFixed(2)+' m)',n>50&&miss===0&&worst<=0&&deep<.25*(sk.h),false);
  const L=JSON.parse(JSON.stringify(M));L.beds.filter(b=>b.col===1).forEach(b=>b.y+=.4);const lm=K.mesh(L);let up=0;
  const b1=L.beds.find(b=>b.col===1);for(let i=0;i<lm.part.length;i++){if(lm.bed[i]!==b1.k||lm.part[i]!==0||Math.abs(lm.pos[3*i+1]-b1.y)>1e-4)continue;const s=ray(lm,lm.pos[3*i],lm.pos[3*i+2],k=>k===0);if(s!=null&&lm.pos[3*i+1]>s)up++;}
  ok('a spire lifted 0.4 m off the skirt would be caught',true,up===0);}
 // KSTACKS.surface {drawn} agrees with the drawn mesh (rays) over the whole mound; the skirt's wall follows its ground foot
 {let ws=0,n=0,wl=0;for(let x=-3;x<=9;x+=.37)for(let z=-2;z<=10;z+=.41){const s=K.surface([M],x,z,null,{drawn:true}),y=ray(mm,x,z);if(!s||y==null)continue;
    if(s.wall&&s.b.col>=0)continue;   // a spire's steep wall: a hair across is a lot of height; checked on wall() below
    n++;ws=Math.max(ws,Math.abs(s.top-y));}
  const M2=JSON.parse(JSON.stringify(M));delete M2.beds[0].gy;for(let x=-3;x<=9;x+=.37)for(let z=-2;z<=10;z+=.41){const s=K.surface([M2],x,z,null,{drawn:true}),y=ray(mm,x,z);if(s&&y!=null&&!(s.wall&&s.b.col>=0))wl=Math.max(wl,Math.abs(s.top-y));}
  ok('surface {drawn} is the drawn skirt and tops ('+n+' rays, within '+ws.toFixed(3)+' m; a level foot instead would be off by '+wl.toFixed(2)+' m)',n>150&&ws<.08&&wl>.3,wl<.08);   /* .08: the flutes' chords on the skirt's slope */
  let eD=0,m2=0;M.beds.forEach(b=>{if(b.col<0)return;for(let a=0;a<6.28;a+=.5)for(const u of [.25,.5,.75]){const w=K.wall(M,b,a,u),p=K.surface([M],w.x,w.z,null,{drawn:true});if(!p||p.b.col!==b.col||!p.wall)continue;m2++;eD=Math.max(eD,p.top-w.y);}});
  ok('on a spire\'s wall surface {drawn} is at the wall or above it (a fused neighbour) ('+m2+' points, '+eD.toFixed(3)+' m)',m2>40&&eD>-.02,false);}
 // the field and the mesh: every drawn top vertex is on topH; at() over the main spire's tip is the tip
 {let w=0,n=0;for(let i=0;i<mm.part.length;i++){if(mm.part[i]!==1)continue;n++;w=Math.max(w,Math.abs(mm.pos[3*i+1]-K.topH(M.beds[mm.bed[i]],mm.pos[3*i],mm.pos[3*i+2])));}
  const tip=M.beds.filter(b=>b.col===0).pop(),t=K.at([M],tip.cx+tip.tx,tip.cz+tip.tz);
  ok('the mound\'s drawn tops lie on topH ('+n+' vertices, '+w.toExponential(1)+'); at() over the tip is the tip',n>50&&w<1e-4&&t&&t.b===tip,t&&t.b.col===-1);
  let hidden=0;M.beds.forEach(b=>{if(b.col>=0&&M.beds[b.k+1]&&M.beds[b.k+1].col===b.col)for(let i=0;i<mm.part.length;i++)if(mm.part[i]===1&&mm.bed[i]===b.k)hidden++;});
  ok('a spire bed\'s top inside its column is left out of the mesh',hidden===0,false);}
 // a ledge on the skirt's top between the spires; none on a spire; the foot reaches the flared skirt
 {let led=null;for(let a=0;a<6.28&&!led;a+=.1){const R=K.footR(sk,a)*sk.tp*(1-sk.ch)*.95,x=sk.cx+Math.cos(a)*R,z=sk.cz+Math.sin(a)*R,l=K.ledge([M],x,z);if(l&&l.b===sk)led=l;}
  const tip=M.beds.filter(b=>b.col===0).pop(),mid=M.beds.filter(b=>b.col===0)[2];
  ok('the skirt\'s top between the spires is a ledge; a spire\'s top under the next bed is not',!!led&&K.ledge([M],mid.cx+mid.tx,mid.cz+mid.tz)===null&&K.ledge([M],tip.cx+tip.tx,tip.cz+tip.tz)===null,false);
  const fa=K.foot([M],sk.cx+K.footR(sk,0)*1.1,sk.cz);ok('foot() reaches the flared skirt',fa&&fa.d<0,false);}
 // the clay: the ground's colour, reddened; two soils, two clays
 {const grey=K.make(Object.assign({},MO,{soil:[.45,.42,.38]})),red=K.make(Object.assign({},MO,{soil:[.62,.3,.18]})),at=K.make(Object.assign({},MO,{soilAt:(x,z)=>[.45,.42,.38]}));
  const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  ok('the clay is taken from the ground: nearer its own soil than the other, redder than a grey soil, soilAt as soil',dist(grey.clay,[.45,.42,.38])<dist(grey.clay,[.62,.3,.18])&&grey.clay[0]-grey.clay[2]>.07+.06&&JSON.stringify(at.clay)===JSON.stringify(grey.clay),dist(grey.clay,red.clay)<.05);}
 ok('a mound round-trips through export and load',JSON.stringify(K.load(K.export([M]))[0])===JSON.stringify(M)&&K.hash(K.mesh(K.load(K.export([M]))[0]))===K.hash(mm),false);
 // the layout by cell: two windows over one world agree where they overlap; no two mounds overlap; another world, others
 {const L={id:'sav',world:77,cell:30,ground:gr,H:[4,12]},A=K.mounds(Object.assign({x0:-90,z0:-90,x1:150,z1:150},L)),Bw=K.mounds(Object.assign({x0:30,z0:-30,x1:270,z1:210},L));
  const ia=new Map(A.map(m=>[m.id,m])),both=Bw.filter(m=>ia.has(m.id)),inA=m=>m.x>=-90&&m.x<150&&m.z>=-90&&m.z<150;
  ok('two windows give the same mounds where they overlap ('+both.length+' shared, every one identical and none missing)',both.length>3&&both.every(m=>JSON.stringify(m)===JSON.stringify(ia.get(m.id)))&&Bw.filter(inA).length===both.length,false);
  let ov=0;const all=A.concat(Bw.filter(m=>!ia.has(m.id)));for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)if(Math.hypot(all[i].x-all[j].x,all[i].z-all[j].z)<all[i].beds[0].rx*1.25+all[j].beds[0].rx*1.25)ov++;
  ok('no two mounds overlap ('+all.length+' mounds, '+ov+' overlaps) and the share of cells is p ('+(A.length/64).toFixed(2)+')',ov===0&&A.length/64>.15&&A.length/64<.45,false);
  const O=K.mounds(Object.assign({x0:-90,z0:-90,x1:150,z1:150},L,{world:78}));ok('another world gives other mounds',JSON.stringify(O.map(m=>[m.x,m.z]))!==JSON.stringify(A.map(m=>[m.x,m.z])),false);
  const acc=K.mounds(Object.assign({x0:-90,z0:-90,x1:150,z1:150},L,{accept:(x,z)=>x<0}));ok('accept refuses a place',acc.length>0&&acc.every(m=>m.x<0),false);}
}
// ---- the dry and folded country's kinds (2026-10-26: the outlands' C4, the SW highlands' arches and pillar rim, Godstep's colonnades)
{// every crossing of a vertical line with a mesh (the triangles of the beds keep() accepts), sorted from the top
 const hits=(m,x,z,keep)=>{const out=[],P=m.pos,I=m.idx;for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2];if(keep&&!keep(m.bed[a]))continue;
   const ax=P[3*a],az=P[3*a+2],bx=P[3*b],bz=P[3*b+2],cx=P[3*c],cz=P[3*c+2],d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-12)continue;
   const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d,l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d,l3=1-l1-l2;if(l1<-1e-7||l2<-1e-7||l3<-1e-7)continue;
   out.push(l1*P[3*a+1]+l2*P[3*b+1]+l3*P[3*c+1]);}return out.sort((p,q)=>q-p);};
 const top1=(m,x,z,keep)=>{const h=hits(m,x,z,keep);return h.length?h[0]:null;};
 // the drawn foot: every bed-k wall vertex on its lowest row, its height against the ground at its x,z
 const footGap=(m,k,gr)=>{let lo=Infinity,hi=-Infinity,ymin=Infinity;for(let i=0;i<m.part.length;i++)if(m.part[i]===0&&m.bed[i]===k)ymin=Math.min(ymin,m.pos[3*i+1]);
   let n=0;const B=[];for(let i=0;i<m.part.length;i++){if(m.part[i]!==0||m.bed[i]!==k)continue;B.push(i);}
   // the foot row: the first seg+1 vertices of the bed's wall grid
   const first=B[0];let seg=0;while(first+seg+1<m.part.length&&m.bed[first+seg+1]===k&&Math.abs(Math.hypot(m.pos[3*(first+seg+1)],m.pos[3*(first+seg+1)+2])-0)>=0&&seg<4000){seg++;const i=first+seg;if(Math.abs(m.pos[3*i]-m.pos[3*first])<1e-6&&Math.abs(m.pos[3*i+2]-m.pos[3*first+2])<1e-6)break;}
   for(let s=0;s<=seg;s++){const i=first+s,g=gr(m.pos[3*i],m.pos[3*i+2]),d=m.pos[3*i+1]-g;lo=Math.min(lo,d);hi=Math.max(hi,d);n++;}return {lo,hi,n};};
 const bumpy=(x,z)=>.08*x-.05*z+1.2*Math.sin(x*.07)*Math.cos(z*.05)+.6*Math.sin(z*.21+1)+20;
 ok('the new kinds are rows of the kind table',['dome','tor','arch','pillar'].every(k=>K.kinds().includes(k)),!K.kinds().includes('dome'));

 // DOME: an inselberg on bumpy ground
 {const DO={id:'d1',kind:'dome',x:10,z:-5,H:60,seed:12,ground:bumpy},D=K.make(DO),dm=K.mesh(D),gC=bumpy(10,-5);
  ok('a dome stands H over the ground at its centre ('+(D.top-gC).toFixed(2)+' m)',Math.abs(D.top-gC-60)<.5,Math.abs(D.top-gC-50)<.5);
  ok('its sheets narrow upward and pile without gaps',D.beds.every((b,i)=>i===0||(b.rx<=D.beds[i-1].rx+1e-9&&Math.abs(b.y-(D.beds[i-1].y+D.beds[i-1].h))<1e-9)),false);
  const half=(k)=>{const B=K.make(Object.assign({},DO,{k:k}));const b=B.beds.find(q=>q.y-gC>=30);return b.rx;};
  ok('k sets the profile: a bornhardt (k 3.5) is broader at half height than a sugarloaf (k 1.4) ('+half(3.5).toFixed(1)+' vs '+half(1.4).toFixed(1)+' m)',half(3.5)>half(1.4)*1.3,half(3.5)<=half(1.4));
  const fg=footGap(dm,0,bumpy),flat=K.make(Object.assign({},DO,{ground:null,y0:gC})),fgf=footGap(K.mesh(flat),0,bumpy);
  ok('the drawn foot is on the bumpy ground ('+fg.n+' vertices, '+fg.lo.toFixed(2)+'..'+fg.hi.toFixed(3)+' m); a level foot would float ('+fgf.hi.toFixed(2)+' m)',fg.n>40&&fg.hi<=.001&&fg.lo>-3,fgf.hi<=.001);
  let ws=0,n=0;for(let x=-70;x<=90;x+=7.3)for(let z=-80;z<=70;z+=6.9){const s=K.surface([D],x,z,null,{drawn:true}),y=top1(dm,x,z);if(!s||y==null)continue;if(s.wall&&(s.b.k===0||s.steep>2))continue;n++;ws=Math.max(ws,Math.abs(s.top-y));}   /* a steep wall: a hair across is a lot of height */
  ok('surface {drawn} is the drawn dome ('+n+' rays, within '+ws.toFixed(3)+' m): a plant on it stands on the rock',n>100&&ws<.35,false);
  const P=K.make(Object.assign({},DO,{pagoda:.8}));let led=0,led0=0;for(let x=-60;x<=80;x+=4)for(let z=-70;z<=60;z+=4){if(K.ledge([P],x,z))led++;if(K.ledge([D],x,z))led0++;}
  ok('a pagoda dome steps in ledges ('+led+' ledge points; the smooth dome '+led0+')',led>40&&led>led0*4,led<=led0);
  const st=K.make(Object.assign({},DO,{strata:(x,y,z)=>({h:6,hard:Math.floor(y/6)%2})}));
  ok('the strata hook sets the sheets: 6 m beds, the soft ones notched deeper',st.beds.slice(1,-1).every(b=>Math.abs(b.h-6)<1e-6)&&st.beds[2].nt!==st.beds[3].nt,st.beds.slice(1,-1).every(b=>Math.abs(b.h-6)>1e-6));
  ok('a dome round-trips through export and load',K.hash(K.mesh(K.load(K.export([D]))[0]))===K.hash(dm),false);
  ok('the same seed gives the same dome, another seed another',JSON.stringify(K.make(DO))===JSON.stringify(D),JSON.stringify(K.make(Object.assign({},DO,{seed:13})))===JSON.stringify(D));}

 // TOR: a pile of joint blocks
 {const TO={id:'t1',kind:'tor',x:0,z:0,H:7,seed:21,ground:bumpy,cols:4,logan:true},T=K.make(TO),tm=K.mesh(T);
  ok('a tor is '+T.cols+' columns of blocks, each column\'s first block a foot',T.cols===4&&T.feet.length===4&&T.feet.every(k=>T.beds[k].gy),false);
  let lo=Infinity,hi=-Infinity;T.feet.forEach(k=>{const f=footGap(tm,k,bumpy);lo=Math.min(lo,f.lo);hi=Math.max(hi,f.hi);});
  const fl=K.make(Object.assign({},TO,{ground:null,y0:bumpy(0,0)}));let hf=-Infinity;fl.feet.forEach(k=>{hf=Math.max(hf,footGap(K.mesh(fl),k,bumpy).hi);});
  ok('every column\'s drawn foot is on the ground ('+lo.toFixed(2)+'..'+hi.toFixed(3)+' m); a level pile would float ('+hf.toFixed(2)+' m)',hi<=.001&&lo>-2,hf<=.001);
  // each block rests on the one below as drawn: rays down through its foot ring (in from the notch) meet the lower block's top
  const rest=(B,m)=>{let worst=0,n=0;for(let k=1;k<B.beds.length;k++){const b=B.beds[k],lw=B.beds[k-1];if(lw.col!==b.col)continue;
     let here=0;for(let a=0;a<6.28;a+=.2)for(const f of [.25,.5,.75,.95]){const R=K.footR(b,a)*(1-b.nt)*f,x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R,c=[lw.cx+lw.tx,lw.cz+lw.tz];
       if(Math.hypot(x-c[0],z-c[1])>K.footR(lw,Math.atan2(z-c[1],x-c[0]))*(1-lw.ch)*lw.tp*.97)continue;   /* over the lower block's top, not its rounded shoulder */
       const y=top1(m,x,z,q=>q===lw.k);if(y==null)continue;n++;here++;worst=Math.max(worst,b.y-y);}
     if(!here)worst=Infinity;}return {worst,n};};   /* every block has a seat on the one below */
  const rs=rest(T,tm),Tl=JSON.parse(JSON.stringify(T));Tl.beds[2].y+=.3;const rl=rest(Tl,K.mesh(Tl));
  ok('each block sits on the drawn top of the one below ('+rs.n+' rays, the worst gap '+rs.worst.toFixed(3)+' m); a block lifted .3 m is caught ('+rl.worst.toFixed(2)+')',rs.n>30&&rs.worst<.02,rl.worst<.2);
  const ls=T.beds[T.feet.length>1?T.feet[1]-1:T.beds.length-1];
  const lb=T.beds[ls.k-1],seat=a=>K.footR(ls,a)*(1-ls.nt)<K.footR(lb,a)*(1-lb.ch)*lb.tp,wide=a=>K.footR(ls,a)>K.footR(lb,a)*(1-lb.ch)*lb.tp;
  ok('a logan stone: a wide block on a narrow seat inside the top below',ls.nt===.45&&[0,1,2,3,4,5].every(a=>seat(a)&&wide(a)),![0,1,2,3,4,5].every(a=>seat(a)));
  ok('clitter lies round the foot, on the ground',T.clitter.length>=3&&T.clitter.every(c=>Math.hypot(c.x,c.z)>6.2&&Math.abs(c.y-bumpy(c.x,c.z))<1e-9),false);
  ok('foot() finds a tor\'s outer columns',T.feet.every(k=>{const b=T.beds[k];return K.foot([T],b.cx,b.cz).d<0;}),false);}

 // ARCH: an opening under a lintel
 {const flat=(x,z)=>5+.02*x,AO={id:'a1',kind:'arch',x:0,z:0,span:14,rise:11,H:18,ry:.3,seed:31,ground:flat},A=K.make(AO),am=K.mesh(A),O=A.opening,ux=Math.cos(.3),uz=Math.sin(.3);
  // horizontal rays across the fin (Moller-Trumbore): through the opening they cross no wall; through a leg, its two faces
  const across=(m,o,d,L)=>{let c=0;const P=m.pos,I=m.idx;for(let t=0;t<I.length;t+=3){const a=3*I[t],b=3*I[t+1],cc=3*I[t+2];
     const e1=[P[b]-P[a],P[b+1]-P[a+1],P[b+2]-P[a+2]],e2=[P[cc]-P[a],P[cc+1]-P[a+1],P[cc+2]-P[a+2]],p=[d[1]*e2[2]-d[2]*e2[1],d[2]*e2[0]-d[0]*e2[2],d[0]*e2[1]-d[1]*e2[0]],det=e1[0]*p[0]+e1[1]*p[1]+e1[2]*p[2];
     if(Math.abs(det)<1e-12)continue;const iv=1/det,tv=[o[0]-P[a],o[1]-P[a+1],o[2]-P[a+2]],u=(tv[0]*p[0]+tv[1]*p[1]+tv[2]*p[2])*iv;if(u<0||u>1)continue;
     const q=[tv[1]*e1[2]-tv[2]*e1[1],tv[2]*e1[0]-tv[0]*e1[2],tv[0]*e1[1]-tv[1]*e1[0]],v=(d[0]*q[0]+d[1]*q[1]+d[2]*q[2])*iv;if(v<0||u+v>1)continue;
     const tt=(e2[0]*q[0]+e2[1]*q[1]+e2[2]*q[2])*iv;if(tt>0&&tt<L)c++;}return c;};
  const nx=-uz,nz=ux,T2=A.beds[0].rz*2;let clear=0,n=0;
  for(let y=O.y0+.4;y<O.y1-.15;y+=1.1){const lv=A.beds.filter(b=>b.col===0).find(b=>y>=b.y&&y<b.y+b.h),half=Math.hypot(lv.cx,lv.cz)-lv.rx-.3;   /* the opening's half-width at y */
    for(let s=-.9;s<=.9;s+=.3){const px=ux*s*half,pz=uz*s*half;n++;if(across(am,[px-nx*T2*2,y,pz-nz*T2*2],[nx,0,nz],T2*4)===0)clear++;}}
  const lg=A.beds[0],inLeg=across(am,[lg.cx-nx*T2*2,O.y0+2,lg.cz-nz*T2*2],[nx,0,nz],T2*4);
  ok('the opening is clear: '+clear+'/'+n+' rays across the fin under the soffit meet no rock; across a leg a ray crosses '+inLeg+' faces',clear===n&&n>40,inLeg<2);
  const soff=hits(am,0,0).filter(y=>Math.abs(y-O.y1)<.02).length,A2=JSON.parse(JSON.stringify(A));A2.beds.forEach(b=>delete b.und);
  ok('the lintel\'s soffit is drawn over the opening (a ray up the middle meets it at '+O.y1.toFixed(2)+' m); without und it is not',soff>=1,hits(K.mesh(A2),0,0).filter(y=>Math.abs(y-O.y1)<.02).length>=1);
  let flo=Infinity,fhi=-Infinity;A.feet.forEach(k=>{const f=footGap(am,k,flat);flo=Math.min(flo,f.lo);fhi=Math.max(fhi,f.hi);});
  ok('both legs stand on the ground ('+flo.toFixed(2)+'..'+fhi.toFixed(3)+' m) and reach into the lintel',fhi<=.001&&flo>-1&&[0,1].every(c=>{const L=A.beds.filter(b=>b.col===c).pop();return L.y+L.h>O.y1;}),false);
  const leg=A.beds.filter(b=>b.col===0),inner=b=>Math.hypot(b.cx,b.cz)-b.rx;
  ok('the legs step in over the opening ('+inner(leg[0]).toFixed(2)+' m from the axis at the foot, '+inner(leg[leg.length-1]).toFixed(2)+' at the crown)',inner(leg[leg.length-1])<inner(leg[0])-1,inner(leg[leg.length-1])>=inner(leg[0]));
  threw=false;try{K.make(Object.assign({},AO,{H:10}));}catch(e){threw=true;}ok('an arch whose top is under its opening is refused',threw,false);}

 // PILLAR and the PILLAR RIM: towers from the tableland's joints
 {const P=K.make({id:'p1',kind:'pillar',x:0,z:0,H:260,w:40,l:34,ry:.2,seed:41,ground:bumpy}),pm=K.mesh(P);
  ok('a pillar stands 260 m over its ground, in beds of 5-40 m',Math.abs(P.top-bumpy(0,0)-260)<1&&P.beds.slice(1,-1).every(b=>b.h>=4.3&&b.h<=40.01),false);
  const fg=footGap(pm,0,bumpy);ok('its drawn foot is on the ground ('+fg.lo.toFixed(2)+'..'+fg.hi.toFixed(3)+' m)',fg.hi<=.001&&fg.lo>-4,false);
  const sqr=K.footR(P.beds[3],.2+Math.PI/4)/Math.hypot(P.beds[3].rx,P.beds[3].rz),el=K.footR(Object.assign({},P.beds[3],{sq:0}),.2+Math.PI/4)/Math.hypot(P.beds[3].rx,P.beds[3].rz);
  ok('a jointed block is squared at its corners (diagonal reach '+sqr.toFixed(2)+' of the corner; an ellipse '+el.toFixed(2)+')',sqr>.82,sqr<=el+.05);
  const a=K.at([P],P.beds[P.beds.length-1].cx,P.beds[P.beds.length-1].cz);ok('at() over its middle is the flat top',a&&a.b===P.beds[P.beds.length-1],false);
  global.window=global;eval(fs.readFileSync(path.join(__dirname,'38-core-relief.js'),'utf8'));
  const J=KRELIEF.joints({world:7,angle:.25,sp:[40,70]}),zone=(x,z)=>clamp01((x-200)/1400),top=900,floor=(x,z)=>.03*x+.02*z;
  function clamp01(v){return v<0?0:v>1?1:v;}
  const box={x0:0,z0:0,x1:1600,z1:700},L={id:'rim',joints:J,zone,top,ground:floor,from:.3,to:.9},A=K.pillars(Object.assign({},box,L));
  ok('the pillar rim stands '+A.length+' towers, every one in the zone\'s band [.3, .9)',A.length>10&&A.every(p=>{const z=zone(p.x,p.z);return z>=.3&&z<.9;}),A.length===0);
  let ov=0;for(let i=0;i<A.length;i++)for(let j=i+1;j<A.length;j++){const p=A[i],q=A[j],d=Math.hypot(p.x-q.x,p.z-q.z);if(d>200)continue;
    const ang=Math.atan2(q.z-p.z,q.x-p.x),rp=Math.max(...p.beds.map(b=>K.footR(b,ang)+Math.hypot(b.cx-p.x,b.cz-p.z))),rq=Math.max(...q.beds.map(b=>K.footR(b,ang+Math.PI)+Math.hypot(b.cx-q.x,b.cz-q.z)));if(d<rp+rq)ov++;}
  ok('no two towers touch: each stands inside its own widened joints ('+ov+' touching)',ov===0,false);
  const far=A.filter(p=>zone(p.x,p.z)>.7).length/Math.max(1,A.filter(p=>zone(p.x,p.z)>.7||true).length),near=A.filter(p=>zone(p.x,p.z)<.5).length,out=A.filter(p=>zone(p.x,p.z)>=.7).length;
  ok('they thin toward the floor ('+near+' in the inner third of the band, '+out+' in the outer)',near>out,near<=out);
  const B2=K.pillars(Object.assign({x0:500,z0:-200,x1:2100,z1:500},L)),ia=new Map(A.map(p=>[p.id,p])),both=B2.filter(p=>ia.has(p.id));
  ok('two windows give the same towers where they overlap ('+both.length+')',both.length>3&&both.every(p=>JSON.stringify(p)===JSON.stringify(ia.get(p.id))),false);
  const tbl=KRELIEF.tableland({joints:J,zone,top,floor,z0:.3}),tower=A[0],tb=J.at(tower.x,tower.z);
  ok('the tableland ends where the towers begin: its cliff at the band\'s edge, the floor under every tower',A.every(p=>Math.abs(tbl(p.x,p.z)-floor(p.x,p.z))<1e-9)&&tbl(300,300)>800,tbl(300,300)<800);
  ok('a tower\'s block is its joints\' block ('+tower.id+')',tower.id==='rim:'+tb.id,false);}

 // COLONNADES on a flow's front: the columns option of a butte
 {const BO={id:'c1',kind:'butte',x:0,z:0,y0:0,seed:51,tiers:[{h:40,r:60,e:1.2},{h:25,r:40,e:1.1}]},plain=K.make(BO),col=K.make(Object.assign({},BO,{columns:{w:[1.6,2]}}));
  const strip=B=>JSON.stringify(B.beds.map(b=>{const c=Object.assign({},b);delete c.cw;delete c.cd;delete c.cs;return c;}));
  ok('asked for columns, a butte is the same butte with columns on its beds (nothing else moves)',strip(col)===strip(plain)&&col.beds.every(b=>b.cw>0),strip(col)!==strip(plain));
  const b0=col.beds[0],nc=Math.round(Math.PI*(b0.rx+b0.rz)/b0.cw);let mins=0;const N=nc*12,Rs=[];for(let i=0;i<N;i++)Rs.push(K.footR(b0,i/N*Math.PI*2));
  for(let i=0;i<N;i++){const p=Rs[(i+N-1)%N],c=Rs[i],q=Rs[(i+1)%N];if(c<p&&c<=q&&Math.max(...[-3,-2,-1,1,2,3].map(o=>Rs[(i+o+N)%N]))-c>b0.cd*.3)mins++;}
  const pl=plain.beds[0];let pm=0;for(let i=0;i<N;i++){const t=i/N*Math.PI*2,c=K.footR(pl,t);if(c<K.footR(pl,t-.001)&&c<=K.footR(pl,t+.001))pm++;}
  ok('the wall is a row of prisms: a joint groove every column ('+mins+' grooves for '+nc+' columns)',Math.abs(mins-nc)<=nc*.1,mins<nc*.5);
  const top=col.beds.filter(b=>b.tier===0).pop();ok('the top of a flow is entablature (narrow, deep), its foot colonnade',top.cw<col.beds[0].cw*.6&&top.cd>col.beds[0].cd,false);
  const cm=K.mesh(col),bt=col.beds[col.beds.length-1];let ws=0,n=0;for(let a=0;a<6.28;a+=.13){const R=K.footR(bt,a)*(1-bt.ch)*bt.tp*.98,x=bt.cx+bt.tx+Math.cos(a)*R,z=bt.cz+bt.tz+Math.sin(a)*R,y=top1(cm,x,z);if(y==null)continue;n++;ws=Math.max(ws,Math.abs(y-K.topAt([col],x,z)));}
  ok('the drawn top meets the columned wall: rays just inside each column\'s face land on the top ('+n+', within '+ws.toFixed(3)+' m)',n>40&&ws<.8,false);}
}
// ---- KSTACKS.weather (2026-10-26, opt-in): an arch's upper corners worn round, the faces moved by noise, the feet left on the ground
{const flat=(x,z)=>5,A=K.make({id:'aw',kind:'arch',x:0,z:0,span:18,rise:15,H:26,ry:0,seed:41,ground:flat}),m0=K.mesh(A,{step:2.5}),m1=K.mesh(A,{step:2.5});
 const h0=K.hash(m0);K.weather(A,m1,{ground:flat});
 const corner=m=>{let best=-1;const Lh=Math.max(...m.pos.filter((v,i)=>i%3===0).map(Math.abs));for(let i=0;i<m.pos.length;i+=3)if(Math.abs(m.pos[i])>Lh*.85&&m.pos[i+1]>A.top-1.5)best=Math.max(best,m.pos[i+1]);return best;};
 const raw=K.mesh(A,{step:2.5}),rw=K.weather(A,K.mesh(A,{step:2.5}),{ground:flat,amp:0,pit:0});
 ok('weather: the lintel\'s outer top corners are worn round (no vertex near the corner box\'s top)',corner(rw)<0,corner(raw)<0);
 let moved=0,feet=0;for(let i=0;i<m0.pos.length;i+=3){const d=Math.hypot(m1.pos[i]-m0.pos[i],m1.pos[i+1]-m0.pos[i+1],m1.pos[i+2]-m0.pos[i+2]);if(d>.2)moved++;if(m0.pos[i+1]<5.4&&d>1e-9)feet++;}
 ok('weather: the faces move ('+moved+' vertices over 20 cm)',moved>m0.pos.length/3*.5,false);
 ok('weather: the feet stay on the ground as drawn',feet===0,false);
 ok('weather: deterministic, and the record is not changed',K.hash(K.weather(A,K.mesh(A,{step:2.5}),{ground:flat}))===K.hash(m1)&&K.hash(K.mesh(A,{step:2.5}))===h0,K.hash(m1)===h0);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
