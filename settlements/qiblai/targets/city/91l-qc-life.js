// ================================================================= QIBLAI — the city's life (Q7e): pilgrims, monks, townsfolk, the market, a caravan ([draw])
// The people are Verge's instanced rigs (settlements/verge/src/77-verge-rigs.js, read in place through kit.json "external":
// RIGS.person / RIGS.camel, procedural, no assets), walked along the plan's ways (QC_S.ways) as pure functions of the clock:
//   pilgrims  on the kora, clockwise, three times round with eyes lowered (LORE 6.13), in undyed wool, packs on their backs;
//             round each chorten on its outer side, clear of the prayer-wheel arcades on the kora's inner side
//   monks     on the ring street nearest their monastery, robed in its colour (QSPOKE: the wall a robe, the band its trim),
//             shaven heads; up and down a stretch either side of their gate
//   townsfolk on the lay ring streets, the cross streets and the avenues (cut at every gate: no one walks through a gate
//             passage), dressed from the Xanadu people's palette (core/charactermodels/data/peoples.json 'xanadu': the
//             kurta and chuba, the wealthy in the turban), more turbans the richer the ring
//   the market in the gate markets' stretch of each avenue: buyers standing at the shopfronts, others browsing to and fro
//   a caravan of camels led out of the south gate along the road to the Geomancers' field (QC_OIL.road) and back
// The great wheels and every prayer wheel turn: the Song drum's texture (TEX.qSongDrum, one material for every drum) scrolls,
// clockwise seen from above, once round in a minute. By night (NIGHT) a quarter of the people stay out.
// Only those within LIFE_R of the eye are set each frame; the rest are hidden. window._qiblaiLife reports (verify.py 'life').
const QC_LIFE=(function(){
 const S={people:0,camels:0,kinds:{},paths:{},errors:[],frames:0,moved:0,shown:0,wheels:false};window._qiblaiLife=S;
 if(typeof RIGS==='undefined'){S.errors.push('RIGS missing (settlements/verge/src/77-verge-rigs.js not on the page)');return S;}
 const SEED=KRAND.child(33980,'life'),U=(a,b,c)=>KRAND.unit(KRAND.hash(SEED,a,b==null?0:b,c==null?0:c));
 const pickU=(arr,u)=>arr[Math.min(arr.length-1,Math.floor(u*arr.length))];
 const LIFE_R=260,STRIDE=1.45,CSTRIDE=2.8;

 // ---------------------------------------------------------------- paths: polylines sampled to arc length
 const mkPath=(pts,closed)=>{const P=pts.map(p=>[p[0],p[1]]);if(closed)P.push([P[0][0],P[0][1]]);const s=[0];
  for(let i=1;i<P.length;i++)s.push(s[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return{P,s,L:s[s.length-1],closed:!!closed};};
 const at=(T,d,o)=>{const P=T.P,s=T.s;let lo=0,hi=s.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(s[m]<=d)lo=m;else hi=m;}
  const a=P[lo],b=P[hi],L=s[hi]-s[lo],t=L>0?(d-s[lo])/L:0,dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz);const ux=n?dx/n:1,uz=n?dz/n:0;
  o.x=a[0]+dx*t-uz*o.off;o.z=a[1]+dz*t+ux*o.off;o.ux=ux;o.uz=uz;return o;};
 const area=pts=>{let A=0;for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];A+=a[0]*b[1]-b[0]*a[1];}return A/2;};
 const resample=(pts,closed,step)=>{const T=mkPath(pts,closed),out=[];for(let d=0;d<T.L-(closed?step*.5:0);d+=step){const o=at(T,d,{off:0});out.push([o.x,o.z]);}
  if(!closed){const e=pts[pts.length-1];out.push([e[0],e[1]]);}return out;};

 // ---------------------------------------------------------------- the ways, cut at the gates and kept inside the outer wall
 const gates=[];for(const W of QC_S.walls)for(const g of W.gates)gates.push(g);
 const outerHalf=Math.max(...QC_S.walls.map(W=>W.half==null?0:W.half));
 const cutOpen=(pts,gap)=>{const T=mkPath(pts,false),cuts=[];
  for(const g of gates){for(let i=1;i<T.P.length;i++){const a=T.P[i-1],b=T.P[i],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz;if(!L2)continue;
   const t=((g.x-a[0])*dx+(g.z-a[1])*dz)/L2;if(t<0||t>1)continue;const px=a[0]+dx*t,pz=a[1]+dz*t;if(Math.hypot(g.x-px,g.z-pz)>6)continue;
   const d=T.s[i-1]+t*Math.sqrt(L2);cuts.push([d-gap,d+gap]);}}
  cuts.sort((p,q)=>p[0]-q[0]);const pieces=[];let d0=0;
  const keep=(a,b)=>{if(b-a<24)return;const seg=[];for(let d=a;d<b;d+=4){const o=at(T,d,{off:0});seg.push([o.x,o.z]);}const o=at(T,b,{off:0});seg.push([o.x,o.z]);
   if(seg.every(p=>Math.max(Math.abs(p[0]-QC_LM.x),Math.abs(p[1]-QC_LM.z))<outerHalf-3))pieces.push(seg);};
  for(const c of cuts){keep(d0,c[0]);d0=Math.max(d0,c[1]);}keep(d0,T.L);return pieces;};

 // ---------------------------------------------------------------- the kora's line: outward of its centre, round each chorten
 const chortens=QC_S.crossings.filter(c=>c.chorten);
 const koraLine=W=>{let pts=W.pts.slice();if(area(pts)<0)pts.reverse();
  const out=resample(pts,true,1.5).map(p=>{let x=p[0],z=p[1];const rx=x-QC_LM.x,rz=z-QC_LM.z,m=Math.max(Math.abs(rx),Math.abs(rz));
   const ox=Math.abs(rx)>=Math.abs(rz)?Math.sign(rx):0,oz=Math.abs(rz)>Math.abs(rx)?Math.sign(rz):0,off=W.w*.18;x+=ox*off;z+=oz*off;
   for(const c of chortens){const dx=x-c.x,dz=z-c.z,d=Math.hypot(dx,dz),R=8.2;if(d<R){
    /* pushed out of the chorten's disc on the side away from the centre (the arcades stand on the inner side) */
    const cn=Math.hypot(c.x-QC_LM.x,c.z-QC_LM.z)||1,hx=(c.x-QC_LM.x)/cn,hz=(c.z-QC_LM.z)/cn;let nx=d>.01?dx/d:hx,nz=d>.01?dz/d:hz;
    const dot=nx*hx+nz*hz;if(dot<0){nx-=2*dot*hx;nz-=2*dot*hz;}
    x=c.x+nx*R;z=c.z+nz*R;}}
   return[x,z];});
  return out;};

 // ---------------------------------------------------------------- looks
 const SKIN=[0xd7ae88,0xbc8e66,0x9b6f4b,0xa87452,0x8a5a3c];
 const TOWN=[0xa8382a,0x2a3f7a,0xc89a3a,0xe6dfcf,0x6e2a2a,0x3a6a5a,0xd8862a,0x5a4a3a,0x2aa5a0,0xcfc0a0,0x7a2a4a,0x8a6a48];
 const TTRIM=[0xe8a030,0x1e3f8a,0xa8382a,0xf4efe4,0x2e2622,0xc8a040,0x3a6a5a];
 const WOOL=[0xcfc2a6,0xb8a888,0x9a8466,0x6a5a48,0x7a3a2a,0x5a4a3c,0x8a7a62];
 const LOOK=[],kind=[],path=[],pose=[],spd=[],phase0=[],offs=[],pitch=[],night=[],lag=[];
 const add=(k,T,o)=>{LOOK.push(o.look);kind.push(k);path.push(T);pose.push(o.pose==null?'walk':o.pose);spd.push(o.speed==null?1.2:o.speed);
  phase0.push(o.s0==null?0:o.s0);offs.push(o.off==null?0:o.off);pitch.push(o.pitch==null?0:o.pitch);night.push(o.night?1:0);lag.push(o.lag==null?0:o.lag);S.kinds[k]=(S.kinds[k]||0)+1;};
 const ringWealth=q=>{const R=QC_S.rings.find(r=>r.ring===q);return R&&R.wealth!=null?R.wealth:.5;};
 const townLook=(i,w)=>{const u=U(1,i,1),h=U(1,i,2);return{robe:pickU(TOWN,u),trim:pickU(TTRIM,U(1,i,3)),skin:pickU(SKIN,U(1,i,4)),
  head:h<.25+.4*w?'turban':h<.55+.2*w?'cap':h<.7+.15*w?'hood':'bare',pack:U(1,i,5)<.12?1:0,spear:0,cloak:U(1,i,6)<.18?1:0};};
 let n=0;

 /* the pilgrims on the kora */
 const K=QC_S.ways.find(w=>w.kind==='kora');
 if(K){const T=mkPath(koraLine(K),true);S.paths.kora=Math.round(T.L);const N=Math.min(260,Math.round(T.L/9));
  for(let i=0;i<N;i++,n++)add('pilgrim',T,{s0:T.L*(i+U(2,i,1)*.6)/N,speed:.75+.35*U(2,i,2),off:(U(2,i,3)-.5)*2.4,pitch:-.35,night:U(2,i,4)<.3,
   look:{robe:pickU(WOOL,U(2,i,5)),trim:pickU([0x7a2a22,0x6e4a1a,0x3a2a1e,0xa8382a],U(2,i,6)),skin:pickU(SKIN,U(2,i,7)),head:pickU(['hood','cap','bare','hood'],U(2,i,8)),pack:U(2,i,9)<.55?1:0,spear:0,cloak:U(2,i,10)<.45?1:0}});}

 /* the monks, by their monastery's colour, on the ring street nearest it */
 const rings=QC_S.ways.filter(w=>w.closed&&(w.kind==='ring'||w.kind==='kora'));
 for(const M of QC_S.monasteries){const bl=M.blocks.map(id=>qcBlock[id]).filter(Boolean);if(!bl.length)continue;
  const cx=bl.reduce((a,b)=>a+(b.box[0]+b.box[2])/2,0)/bl.length,cz=bl.reduce((a,b)=>a+(b.box[1]+b.box[3])/2,0)/bl.length;
  let best=null,bd=1e9;for(const W of rings)for(const p of W.pts.concat(resample(W.pts,true,6))){const d=Math.hypot(p[0]-cx,p[1]-cz);if(d<bd){bd=d;best=[W,p];}}
  if(!best)continue;const W=best[0],pts=resample(W.pts,true,2),T0=mkPath(pts,true);
  let k0=0,kd=1e9;for(let j=0;j<pts.length;j++){const d=Math.hypot(pts[j][0]-best[1][0],pts[j][1]-best[1][1]);if(d<kd){kd=d;k0=j;}}
  const span=[];for(let j=-45;j<=45;j++){span.push(pts[(k0+j+pts.length)%pts.length]);}
  const T=mkPath(span,false),SP=QSPOKE[M.spoke%8],N=14;
  for(let i=0;i<N;i++,n++)add('monk',T,{s0:T.L*2*U(3,M.spoke*40+i,1),speed:.9+.3*U(3,M.spoke*40+i,2),off:(U(3,M.spoke*40+i,3)-.5)*W.w*.6,night:U(3,M.spoke*40+i,4)<.2,
   look:{robe:SP.wall,trim:SP.band,skin:pickU(SKIN,U(3,M.spoke*40+i,5)),head:'bare',pack:0,spear:0,cloak:U(3,M.spoke*40+i,6)<.6?1:0}});}

 /* townsfolk on the lay ring streets, the cross streets and the avenues */
 const lay=QC_S.ways.filter(w=>w.kind==='ring'||w.kind==='cross'||w.kind==='avenue');
 let tf=0;for(const W of lay){const pieces=W.closed?[W.pts.concat([W.pts[0]])]:cutOpen(W.pts,W.kind==='avenue'?16:7);
  const q=W.ring==null?3:W.ring,w=ringWealth(q),dens=W.kind==='avenue'?6:W.kind==='ring'?3:1.6;
  for(const pc of pieces){const T=mkPath(pc,false),N=Math.round(T.L/100*dens);S.paths[W.kind]=(S.paths[W.kind]||0)+Math.round(T.L);
   for(let i=0;i<N;i++,n++,tf++)add('townsfolk',T,{s0:T.L*2*U(4,tf,1),speed:1.0+.45*U(4,tf,2),off:(U(4,tf,3)-.5)*Math.min(W.w-4,18),night:U(4,tf,4)<.2,look:townLook(tf,w)});}}

 /* the gate markets: their stretch of each avenue, buyers at the shopfronts and browsers */
 let mf=0;for(const Mk of QC_S.markets){const bl=Mk.blocks.map(id=>qcBlock[id]).filter(Boolean);if(!bl.length)continue;
  const av=QC_S.ways.find(w=>w.kind==='avenue'&&w.dir===Mk.dir);if(!av)continue;
  const x0=Math.min(...bl.map(b=>b.box[0])),x1=Math.max(...bl.map(b=>b.box[2])),z0=Math.min(...bl.map(b=>b.box[1])),z1=Math.max(...bl.map(b=>b.box[3]));
  const pcs=cutOpen(av.pts,16).map(pc=>pc.filter(p=>p[0]>=x0-2&&p[0]<=x1+2&&p[1]>=z0-2&&p[1]<=z1+2)).filter(pc=>pc.length>=4);
  for(const pc of pcs){const T=mkPath(pc,false),N=Math.round(T.L/4);S.paths.market=(S.paths.market||0)+Math.round(T.L);
   for(let i=0;i<N;i++,n++,mf++){const st=U(5,mf,1)<.55,side=U(5,mf,2)<.5?-1:1;
    add('market',T,{s0:T.L*(st?U(5,mf,3):2*U(5,mf,3)),speed:st?0:.5+.3*U(5,mf,4),pose:st?'stand':'walk',off:st?side*(av.w/2-2.2-U(5,mf,5)*1.2):(U(5,mf,5)-.5)*(av.w-8),night:0,look:townLook(5000+mf,.6)});}}}

 /* the caravan on the oilfield road: camels on a lead, two drivers, out and back */
 const cam=[],CL=[];
 if(typeof QC_OIL!=='undefined'&&QC_OIL.road&&QC_OIL.road.length>1){const r=QC_OIL.road,start=[r[0][0],QC_B.z1+60];
  const T=mkPath([start].concat(r),false);S.paths.caravan=Math.round(T.L);
  for(let i=0;i<6;i++)cam.push({T,lag:i*4.2,look:{coat:pickU([0xc8a878,0xb08a5a,0x9a7048,0xd8c4a0],U(6,i,1)),tassels:pickU([0xa02820,0x2a3a8a,0xd0a030],U(6,i,2)),load:i===0?3:1+Math.floor(U(6,i,3)*2)}});
  for(let i=0;i<2;i++,n++)add('driver',T,{s0:0,speed:.95,off:-1.4,pose:'lead',look:{robe:pickU(TOWN,U(7,i,1)),trim:0xe8a030,skin:pickU(SKIN,U(7,i,2)),head:'turban',pack:0,spear:0,cloak:1},lag:i?6*4.2+2:-2.4});}

 // ---------------------------------------------------------------- the pools and the frame
 const NP=kind.length;S.people=NP;S.camels=cam.length;
 let PP=null,CP=null;try{PP=RIGS.person(Math.max(1,NP));if(cam.length)CP=RIGS.camel(cam.length);}catch(e){S.errors.push('pools: '+(e&&e.stack||e));return S;}
 const o={off:0,x:0,z:0,ux:1,uz:0},opt={phase:0,speed:0,pitch:0,look:null,pose:'walk',t:0};
 const pingpong=(T,d)=>{const L=T.L,m=((d%(2*L))+2*L)%(2*L);return m<=L?[m,1]:[2*L-m,-1];};
 const wheelTex=typeof TEX!=='undefined'&&TEX.qSongDrum?TEX.qSongDrum:null;
 if(wheelTex){wheelTex.wrapS=THREE.RepeatWrapping;wheelTex.needsUpdate=true;S.wheels=true;}
 let T0=0,last=null;
 FRAME_HOOKS.push(dt=>{const t0=performance.now();T0+=(dt==null?.016:Math.min(dt,.1));const t=T0;S.frames++;
  if(wheelTex)wheelTex.offset.x=-(t/60)%1;
  const C=camera.position,nt=typeof NIGHT!=='undefined'&&NIGHT;let shown=0,moved=0;
  for(let i=0;i<NP;i++){const T=path[i];if(nt&&!night[i]&&kind[i]!=='driver'){PP.hide(i);continue;}
   let d,dir=1;const v=spd[i];
   if(kind[i]==='driver'){const r=pingpong(T,t*v-lag[i]);d=r[0];dir=r[1];}
   else if(T.closed){d=((phase0[i]+t*v)%T.L+T.L)%T.L;}
   else if(v>0){const r=pingpong(T,phase0[i]+t*v);d=r[0];dir=r[1];}
   else d=Math.min(T.L,phase0[i]);
   o.off=offs[i]*dir;at(T,d,o);const dx=o.x-C.x,dz=o.z-C.z;if(dx*dx+dz*dz>LIFE_R*LIFE_R){PP.hide(i);continue;}
   let yaw=Math.atan2(o.ux*dir,o.uz*dir);
   if(v===0){const s=offs[i]<0?-1:1;yaw=Math.atan2(-o.uz*s,o.ux*s)+(U(8,i,1)-.5)*.6;}
   opt.phase=(d/STRIDE)%1;opt.speed=v;opt.pitch=pitch[i];opt.look=LOOK[i];opt.pose=pose[i];opt.t=t+i*.37;
   PP.set(i,o.x,terrainH(o.x,o.z),o.z,yaw,opt);shown++;if(v>0)moved++;}
  PP.flush();
  if(CP){for(let j=0;j<cam.length;j++){const K2=cam[j],r=pingpong(K2.T,t*.95-K2.lag),dd=Math.max(0,Math.min(K2.T.L,r[0]));o.off=0;at(K2.T,dd,o);
    const dx=o.x-C.x,dz=o.z-C.z;if(dx*dx+dz*dz>LIFE_R*LIFE_R*2.2){CP.hide(j);continue;}
    opt.phase=(dd/CSTRIDE)%1;opt.speed=.95;opt.pitch=0;opt.look=K2.look;opt.pose='walk';opt.t=t+j;
    CP.set(j,o.x,terrainH(o.x,o.z),o.z,Math.atan2(o.ux*r[1],o.uz*r[1]),opt);}CP.flush();}
  S.shown=shown;S.moved=moved;S.frameMs=+(performance.now()-t0).toFixed(3);});
 S.at=i=>{const T=path[i];return T?{kind:kind[i],len:Math.round(T.L)}:null;};
 return S;})();
