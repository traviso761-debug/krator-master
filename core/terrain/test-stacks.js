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
// below are the module's before the option); with it a relief top is a clipped grid, watertight with its wall
{const H0={mesa:305465533,sp:3674188268,relief:3343314386};
 ok('without opt.top the meshes are unchanged (default and the hoar\'s 150-ring options)',K.hash(K.mesh(mesa))===H0.mesa&&K.hash(K.mesh(sp))===H0.sp&&K.hash(K.mesh(mesa,{step:7,topRings:150,segMax:1200}))===H0.relief,
  K.hash(K.mesh(mesa,{top:{grid:5}}))===H0.mesa);
 ok('a bed too narrow for the grid keeps its rings (a spire)',K.hash(K.mesh(sp,{top:{grid:5}}))===H0.sp,K.hash(K.mesh(sp,{top:{grid:2,minCells:1}}))===H0.sp);
 // a relief top, as the hoar table wraps it: knolls on the beds' tops
 const _th=K.topH;K.topH=function(b,x,z){return _th(b,x,z)+4*Math.sin(x*.05)*Math.cos(z*.04);};
 const G=K.mesh(mesa,{step:7,segMax:1200,top:{grid:5}}),F=K.mesh(mesa,{step:7,topRings:150,segMax:1200});
 function topStats(m,B){const P=m.pos,I=m.idx,area={},edges=new Map();let up=0,n=0;
   for(let t=0;t<I.length;t+=3){const a=I[t],b=I[t+1],c=I[t+2];if(m.part[a]!==1)continue;n++;
     const ux=P[3*b]-P[3*a],uz=P[3*b+2]-P[3*a+2],vx=P[3*c]-P[3*a],vz=P[3*c+2]-P[3*a+2],ny=uz*vx-ux*vz;if(ny>0)up++;
     area[m.bed[a]]=(area[m.bed[a]]||0)+Math.abs(ny)/2;
     [[a,b],[b,c],[c,a]].forEach(([p,q])=>{const k=p<q?p+','+q:q+','+p;edges.set(k,(edges.get(k)||0)+1);});}
   let bLen=0,over=0;edges.forEach((v,k)=>{if(v>2)over++;if(v===1){const [p,q]=k.split(',').map(Number);bLen+=Math.hypot(P[3*p]-P[3*q],P[3*p+2]-P[3*q+2]);}});
   return {up:up/n,n,area,bLen,over};}
 function ringOf(B,k,opt){const b=B.beds[k],per=2*Math.PI*Math.max(b.rx,b.rz)*(1+b.lob),seg=Math.max(16,Math.min(opt.segMax,Math.round(per/opt.step))),c=[b.cx+(b.tx||0),b.cz+(b.tz||0)],t1=b.tp==null?1:b.tp;
   let A=0,L=0;const pts=[];for(let s=0;s<seg;s++){const a=-s/seg*2*Math.PI,R=K.footR(b,a)*(1-b.ch)*t1;pts.push([c[0]+Math.cos(a)*R,c[1]+Math.sin(a)*R]);}
   for(let s=0;s<seg;s++){const p=pts[s],q=pts[(s+1)%seg];A+=p[0]*q[1]-q[0]*p[1];L+=Math.hypot(q[0]-p[0],q[1]-p[1]);}return {A:Math.abs(A)/2,L};}
 const st=topStats(G,mesa),opt={step:7,segMax:1200};let aErr=0,perim=0;
 let nG=0;mesa.beds.forEach((b,k)=>{const r=ringOf(mesa,k,opt);perim+=r.L;if(Math.min(b.rx,b.rz)*(1-b.ch)*(b.tp==null?1:b.tp)*(1-b.lob)<=15)return;nG++;aErr=Math.max(aErr,Math.abs((st.area[k]||0)-r.A)/r.A);});
 ok('the grid top covers each top exactly (area within 1e-6 of the edge ring\'s: '+aErr.toExponential(1)+') and faces up ('+(st.up*100).toFixed(2)+'%)',aErr<1e-6&&st.up===1,false);
 ok('it is watertight: only the edge ring is open (open length '+st.bLen.toFixed(1)+' m, the rings '+perim.toFixed(1)+' m), no edge shared three ways',Math.abs(st.bLen-perim)<1e-6*perim&&st.over===0,false);
 {const m=K.mesh(mesa,{step:7,segMax:1200,top:{grid:5}}),I=m.idx;let t=0;while(m.part[I[t]]!==1)t+=3;t+=3*600;const cut={pos:m.pos,idx:Array.from(I).filter((_,q)=>Math.floor(q/3)!==t/3),part:m.part,bed:m.bed};
  const s2=topStats(cut,mesa);ok('a missing triangle would be caught (a hole opens in the edges)',true,Math.abs(s2.bLen-perim)<1e-6*perim);}
 // the vertices: on topH, except a ring edge's crossings of a grid line (on the wall's straight top edge)
 {let on=0,off=0,worst=0,tv=0;for(let i=0;i<G.part.length;i++){if(G.part[i]!==1)continue;tv++;const d=Math.abs(G.pos[3*i+1]-K.topH(mesa.beds[G.bed[i]],G.pos[3*i],G.pos[3*i+2]));if(d<1e-3)on++;else{off++;worst=Math.max(worst,d);}}
  let ftv=0;for(let i=0;i<F.part.length;i++)if(F.part[i]===1)ftv++;
  ok('its vertices are on topH but the ring crossings ('+on+' on, '+off+' crossings, worst '+worst.toFixed(3)+' m), and far fewer than the ring fan ('+tv+' against '+ftv+')',off<on*.2&&worst<.5&&tv<ftv*.5,false);}
 ok('the grid top is the same every time',K.hash(K.mesh(mesa,{step:7,segMax:1200,top:{grid:5}}))===K.hash(G),K.hash(K.mesh(mesa,{step:7,segMax:1200,top:{grid:6}}))===K.hash(G));
 // many bodies and grid sizes: every top covered once, only its edge open
 {let worst=0,openBad=0,nb=0;for(let q=0;q<12;q++){const B=K.make({id:'g'+q,kind:'mesa',x:q*37.3-200,z:q*-21.7+90,y0:0,seed:300+q*11,lobes:.1+.03*q,tiers:[{h:120,r:90+q*17,e:1+q*.07,ry:q*.4},{h:60,r:40+q*6,e:1.2,dx:q*3,dz:-q*2}]}),Gs=[3,5,7][q%3],o={step:5+q%3,segMax:900,top:{grid:Gs}},m=K.mesh(B,o),t=topStats(m,B);
   let L=0;B.beds.forEach((b,k)=>{const r=ringOf(B,k,o);L+=r.L;if(Math.min(b.rx,b.rz)*(1-b.ch)*(b.tp==null?1:b.tp)*(1-b.lob)<=Gs*3)return;nb++;worst=Math.max(worst,Math.abs((t.area[k]||0)-r.A)/r.A);});
   if(Math.abs(t.bLen-L)>1e-5*L||t.over)openBad++;}
  ok('12 more bodies, grids of 3, 5 and 7 m: '+nb+' gridded tops, area within '+worst.toExponential(1)+', '+openBad+' with a hole',nb>20&&worst<1e-6&&openBad===0,false);}
 K.topH=_th;}

// ---- surface on the drawn wall (o.drawn, 2026-10-26: k-guilin's trees stood up to a metre proud where the chamfer pulls the wall in)
{const T=K.tower({id:'t',seed:9,x:0,z:0,H:150,R:60,y0:0});let eD=0,eL=0,n=0;
 for(let k=0;k<T.beds.length;k++){const b=T.beds[k];if((b.tp==null?1:b.tp)>.995)continue;
  for(let a=0;a<6.28;a+=.7)for(const u of [.3,.6,.85,.95]){const w=K.wall(T,b,a,u),pD=K.surface([T],w.x,w.z,null,{drawn:true}),pL=K.surface([T],w.x,w.z);
   if(!pD||!pL||!pD.wall||!pL.wall||pD.b!==b||pL.b!==b)continue;n++;eD=Math.max(eD,Math.abs(pD.top-w.y));eL=Math.max(eL,Math.abs(pL.top-w.y));}}
 ok('KSTACKS.surface {drawn}: on the drawn wall within '+eD.toFixed(3)+' m ('+n+' points; the straight wall is off by '+eL.toFixed(2)+' m)',n>20&&eD<.05&&eL>eD,eL<.05);
 ok('without o.drawn surface is as before',JSON.stringify(K.surface([T],30,0))===JSON.stringify(K.surface([T],30,0,null,null)),false);}
console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
