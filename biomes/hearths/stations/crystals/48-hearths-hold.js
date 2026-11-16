// ================================================================= HEARTHS — the Hearth hold's cave: both storeys, their dress and the hold's massing  [G data]
// PLAN.md sections 18 and 19. Everything here is records on the core, no THREE and no DOM; the host fragments (84 on) draw them. Both stations
// (crystals, hold) build this same cave, so the two pages are one place; each station draws all of it and looks at its own storey.
//   THE CAVE     site 4's KKARST.network, whole, cropped to SITE.half round the drained storey's largest feeder chamber (SITE.focus): on each of
//                SITE.storeys, the chambers in the box, every passage with an end in it, the cupolas in their roofs; the vents over the drained
//                storey's cupolas; the feeder and level shafts under the feeder chambers (the HOT chambers). KKARST.build carves them in one
//                KCAVERN; the station adds the vents' throats up through the shelf, the fumarole's shaft, and the hold's cuts (below)
//   THE HOLD     the massing a settlement kit drops into (proposed): on each storey its chambers (SITE.hold.storeys[s].chambers), shelves cut in
//                their walls (on the drained storey over the levelled floor; on the active storey over the water: a shelf and a field), the
//                galleries joining them (the cheapest path that keeps out of the hot chambers), the passages into a hot chamber, and the two
//                approaches: the night road up from the drained storey, the way down to a landing over the active storey's water.
//                HOLD.volumes are plain records with their shapes and their storey; HOLD.at(x, y, z, pad) is the volume holding a point
//   THE DRESS    the drained storey: KSPELEO with SITE.crystals.beams over each hot chamber (the megacrystals), SITE.crystals.floor over the box
//                (the bladed floor); the active storey: KSPELEO.HYPOGENE over each of its crust records (chandeliers, stalactites, columns).
//                No record stands in a hold volume (accept)
//   THE AIR      KTHERM over the feeders (every volume's and every pool's temperature), the hazards (KHAZ records: heat with soak and slip over
//                the drained storey's hot chambers; KKARST's own, its pools' heat replaced by KTHERM's: scalding near the feeders only; the
//                fumarole), the water (the table over the active storey's floor: core/water's arguments)
const CAVE=(function(S){
 const d=(v,x)=>v==null?x:v,TOP=Math.max(...S.storeys);
 const N=KKARST.network(Object.assign({ground:S.ground,world:S.world},S.net));
 const M={};N.nodes.forEach(n=>{M[n.id]=n;});
 const F=N.chambers.find(c=>c.id===S.focus);if(!F)throw new Error('CAVE: the network has no chamber '+S.focus);
 const cx=F.c[0],cz=F.c[2],hb=S.half,box=[cx-hb,cz-hb,cx+hb,cz+hb];
 const inB=(x,z,m)=>{m=d(m,0);return x>box[0]-m&&x<box[2]+m&&z>box[1]-m&&z<box[3]+m;};
 // ---------------------------------------------------------------- the crop (KKARST's records, never edited)
 const onS=s=>S.storeys.indexOf(s)>=0;
 const chambers=N.chambers.filter(c=>onS(c.storey)&&inB(c.c[0],c.c[2]));
 const passages=N.passages.filter(p=>onS(p.level)&&(inB(M[p.a].x,M[p.a].z)||inB(M[p.b].x,M[p.b].z)));
 const nid=new Set();passages.forEach(p=>{nid.add(p.a);nid.add(p.b);});chambers.forEach(c=>nid.add(c.node));
 const cupolas=N.cupolas.filter(u=>chambers.some(c=>c.id===u.chamber));
 const vents=N.outlets.filter(o=>o.kind==='vent'&&cupolas.some(u=>o.over===u.id));
 const hot=chambers.filter(c=>c.feeder),hotOf=s=>hot.filter(c=>c.storey===s);
 const shafts=N.shafts.filter(s=>(s.kind==='feeder'||s.kind==='level')&&hot.some(c=>s.feeder===c.feeder));
 const keepOn=r=>chambers.some(c=>c.id===r.on);
 const N2=Object.assign({},N,{nodes:N.nodes.filter(n=>nid.has(n.id)),passages,chambers,cupolas,shafts,outlets:vents,sinks:[],dolines:[],
  crusts:N.crusts.filter(keepOn),blocks:N.blocks.filter(keepOn),box:box.slice()});
 const C=KCAVERN.create({ground:S.ground,cell:S.cell,chunk:S.chunk,seed:S.world});
 KKARST.build(C,N2,{rock:'gypsum'});
 /* the vents' throats: from each cupola's crown up through the shelf, where KKARST opened the well */
 const throats=vents.map(V=>{const U=cupolas.find(u=>u.id===V.over),top=U.c[1]+U.h,g=S.ground(V.x,V.z);
  C.shaft({id:'throat:'+V.id,owner:'hearths',c:[V.x,V.z],y0:top-1.5,y1:g+3,r0:S.vent.r,r1:S.vent.r1});
  return {id:'throat:'+V.id,vent:V.id,c:[V.x,V.z],y0:top-1.5,y1:g,ground:g,r:S.vent.r1};});
 /* the fumarole's shaft (KARST-SITES site 4: the station's, not KKARST's): from the water over its feeder chamber up through both storeys to the
    shelf, set off the chamber's middle (its level shaft is there); a well where it leaves the ground */
 const fum=(function(){const Fm=S.fumarole,c=chambers.find(q=>q.id===Fm.chamber);if(!c)return null;const x=c.c[0]+Fm.off[0],z=c.c[2]+Fm.off[1],g=S.ground(x,z);
  C.shaft({id:'fumarole',owner:'hearths',c:[x,z],y0:N.table-.5,y1:g+3,r0:Fm.r,r1:Fm.r*1.3});C.opening({id:'fumarole:well',c:[x,z],r:Fm.r*1.3,kind:'well'});
  return {id:'fumarole',name:'The fumarole\'s shaft (steam from the feeder to the shelf)',c:[x,z],y0:N.table,y1:g,ground:g,r:Fm.r,chamber:c.id,T:Fm.T};})();
 // ---------------------------------------------------------------- the hold's cuts (before the build: a room or a stair joins hard)
 const H=S.hold,HS={};
 S.storeys.forEach(s=>{const cfg=H.storeys[s];if(!cfg)return;const L=Object.keys(cfg.chambers).map(id=>chambers.find(c=>c.id===id));
  if(L.some(c=>!c))throw new Error('CAVE: a hold chamber of storey '+s+' is not in the box');HS[s]=L;});
 const HC=[].concat(...Object.keys(HS).map(s=>HS[s])),nameOf=c=>H.storeys[c.storey].chambers[c.id];
 /* the drained storey's hold chambers made level at their records' height: KCAVERN joins a hall and its passages smoothly, which sinks the floor
    up to 1.7 m where they meet at the chamber's node; a monolith (it fills what was carved before it) brings it back to the hall's floor, out to
    a tenth past the floor's ellipse, where the passages leave it. The active storey's chambers are the warm pools: not levelled */
 HC.forEach(c=>{if(!H.storeys[c.storey].level)return;const P=[];for(let i=0;i<32;i++){const a=i/32*2*Math.PI;P.push([c.c[0]+c.rx*1.1*Math.cos(a),c.c[2]+c.rz*1.1*Math.sin(a)]);}
  C.monolith({id:'hold:floor:'+c.id,owner:'hearths',poly:P,y0:c.c[1]-4,y1:c.c[1],block:false});});
 const ang=a=>[Math.cos(a),Math.sin(a)],sep=(a,b)=>{const t=Math.abs(a-b)%(2*Math.PI);return Math.min(t,2*Math.PI-t);};
 const radAlong=(c,u)=>1/Math.hypot(u[0]/c.rx,u[1]/c.rz);
 const segD=(px,pz,ax,az,bx,bz)=>{const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((px-ax)*dx+(pz-az)*dz)/Math.max(1e-9,dx*dx+dz*dz)));return Math.hypot(px-ax-dx*t,pz-az-dz*t);};
 /* the rock's clearance at (x, y, z) from every other void of the crop: chambers by their floor ellipse grown 2 m, passages by their axis less
    half their width; a void wholly under y - 2 or over y + 5 is clear */
 const clearAt=(x,y,z,not)=>{let m=1e9;
  chambers.forEach(c=>{if(c.id===not||y>c.c[1]+c.h+2||y+5<c.c[1])return;const q=Math.hypot((x-c.c[0])/c.rx,(z-c.c[2])/c.rz);m=Math.min(m,(q-1)*Math.min(c.rx,c.rz)-2);});
  passages.forEach(p=>{const a=M[p.a],b=M[p.b];if(y>Math.max(a.y,b.y)+p.h+2||y+5<Math.min(a.y,b.y))return;m=Math.min(m,segD(x,z,a.x,a.z,b.x,b.z)-p.w/2);});
  return m;};
 /* the free bearing out of a chamber: the 24 bearings, those whose line (from its wall to `len` m out, at the floor's height plus `rise` a metre)
    keeps 8 m of rock from every other void, the one farthest in angle from its passages and from `avoid`; else the clearest */
 const freeDir=(c,len,rise,avoid,y0)=>{const A=passages.filter(p=>p.a===c.node||p.b===c.node).map(p=>{const o=M[p.a===c.node?p.b:p.a];return Math.atan2(o.z-c.c[2],o.x-c.c[0]);}).concat(avoid);
  const yb=d(y0,c.c[1]);let best=null;for(let k=0;k<24;k++){const a=k/24*2*Math.PI,u=ang(a),R=radAlong(c,u);let cl=1e9;
   for(let s=2;s<=len;s+=3)cl=Math.min(cl,clearAt(c.c[0]+u[0]*(R+s),yb+s*rise,c.c[2]+u[1]*(R+s),c.id));
   const sp=A.length?Math.min(...A.map(b=>sep(a,b))):Math.PI,sc=(cl>=8?1000:0)+(cl>=8?sp:cl);
   if(!best||sc>best.sc)best={a,u,R,sc,cl};}
  return best;};
 const towardFocus=c=>Math.atan2(cz-c.c[2],cx-c.c[0]);
 const vols=[],used={};
 HC.forEach(c=>{const wet=!H.storeys[c.storey].level;used[c.id]=[towardFocus(c)];
  vols.push({id:'hold:chamber:'+c.id,kind:'chamber',storey:c.storey,name:nameOf(c),prim:c.id,node:c.node,
   shape:{type:'ellipse',c:[c.c[0],c.c[2]],rx:c.rx,rz:c.rz,y0:c.c[1],y1:c.c[1]+c.h},floor:wet?N.table:c.c[1],clear:c.h-(wet?N.table-c.c[1]:0),
   area:Math.PI*c.rx*c.rz,volume:2/3*Math.PI*c.rx*c.rz*c.h,water:wet?{level:N.table,depth:Math.round((N.table-c.c[1])*10)/10}:null});});
 /* shelves: a level terrace cut into each hold chamber's wall on a free bearing away from the hot chamber and from the others: over the drained
    storey's floor (`up`), over the active storey's water (`above` the table). Each storey lists its kinds (a shelf, a field) */
 const shelfY=(c,s)=>s.up!=null?c.c[1]+s.up:N.table+s.above;
 HC.forEach(c=>H.storeys[c.storey].shelves.forEach((s,k)=>{const D=H.shelf,y=shelfY(c,s),f=freeDir(c,D.depth+4,0,used[c.id],y),u=f.u,t=[-u[1],u[0]],d0=f.R*.9,d1=f.R+D.depth;used[c.id].push(f.a);
  const P=(dd,tt)=>[c.c[0]+u[0]*dd+t[0]*tt,c.c[2]+u[1]*dd+t[1]*tt],poly=[P(d0,-D.half),P(d1,-D.half),P(d1,D.half),P(d0,D.half)];
  const id='hold:'+s.kind+':'+c.id+(k?':'+k:'');C.room({id,owner:'hearths',poly,y,h:D.h,ceil:'vault',rise:D.rise,r:1.5,rock:'gypsum',finish:'raw'});
  const over=nameOf(c).replace(/^The /,'the ').replace(/ \(.*$/,'');
  vols.push({id,kind:s.kind,storey:c.storey,name:(s.kind==='field'?'A field shelf (the dark crops\') over ':'A shelf over ')+over,prim:id,on:'hold:chamber:'+c.id,
   shape:{type:'poly',pts:poly,y0:y,y1:y+D.h},floor:y,clear:D.h,drop:y-(s.up!=null?c.c[1]:N.table),edge:[P(f.R,-D.half),P(f.R,D.half)],area:(d1-d0)*2*D.half,volume:(d1-d0)*2*D.half*D.h});}));
 /* the night road: a gallery rising at SITE.hold.road.grade from the hall's wall toward the shelf's surface, carved to the box's edge; the rest of
    its run is recorded (continues) */
 {const R=H.road,c=HC.find(h=>h.id===R.from),f=freeDir(c,40,R.grade,used[c.id]),u=f.u;used[c.id].push(f.a);
  const x0=c.c[0]+u[0]*f.R*.85,z0=c.c[2]+u[1]*f.R*.85,y0=c.c[1];
  const tx=u[0]>0?(box[2]-4-x0)/u[0]:u[0]<0?(box[0]+4-x0)/u[0]:1e9,tz=u[1]>0?(box[3]-4-z0)/u[1]:u[1]<0?(box[1]+4-z0)/u[1]:1e9,L=Math.min(tx,tz);
  const pts=[0,.5,1].map(k=>[x0+u[0]*L*k,y0+L*k*R.grade,z0+u[1]*L*k]),e=pts[2],g=S.ground(e[0]+u[0]*(-e[1]/R.grade),e[2]+u[1]*(-e[1]/R.grade));
  C.tube({id:'hold:road',owner:'hearths',pts,w:R.w,h:R.h,rock:'gypsum',blend:2});
  const run=(g-e[1])/R.grade;
  vols.push({id:'hold:road',kind:'approach',storey:c.storey,name:'The night road (toward the shelf\'s surface)',prim:'hold:road',from:'hold:chamber:'+c.id,
   shape:{type:'capsule',pts,w:R.w,h:R.h},floor:y0,clear:R.h,area:L*R.w,volume:L*R.w*R.h,
   continues:{at:e.slice(),to:[e[0]+u[0]*run,g,e[2]+u[1]*run],grade:R.grade,note:'on at the same grade to a mouth on the shelf: the night entrance (PLAN.md section 11, station 2)'}});}
 /* the way down: a stair from the drained storey's south chamber toward the active storey, to a landing over its water (the table plus
    SITE.hold.down.above): a platform of rock left standing (a monolith) where the stair comes down into a chamber, a room above it */
 {const D=H.down,c=HC.find(h=>h.id===D.from),f=freeDir(c,20,0,used[c.id]),u=f.u;used[c.id].push(f.a);
  const yb=N.table+D.above,run=(c.c[1]-yb)/D.pitch;
  const a=[c.c[0]+u[0]*f.R*.85,c.c[1],c.c[2]+u[1]*f.R*.85],b=[a[0]+u[0]*run,yb,a[2]+u[1]*run];
  C.stair({id:'hold:down',owner:'hearths',a,b,w:D.w,h:D.h});
  const t=[-u[1],u[0]],L=D.landing,land=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[b[0]+u[0]*(q[0]+1)*L*.8+t[0]*q[1]*L,b[2]+u[1]*(q[0]+1)*L*.8+t[1]*q[1]*L]);
  C.monolith({id:'hold:down:platform',owner:'hearths',poly:land,y0:N.table-4,y1:yb,block:false});
  C.room({id:'hold:down:landing',owner:'hearths',poly:land,y:yb,h:D.h+.8,ceil:'flat',r:.8,rock:'gypsum',finish:'raw'});
  let near=null,nd=1e9;chambers.forEach(q=>{if(q.storey!==0)return;const r=Math.hypot((b[0]-q.c[0])/q.rx,(b[2]-q.c[2])/q.rz);if(r<nd){nd=r;near=q;}});
  vols.push({id:'hold:down',kind:'approach',storey:c.storey,to:0,name:'The way down (to a landing over the active storey\'s water)',prim:'hold:down',from:'hold:chamber:'+c.id,
   shape:{type:'capsule',pts:[a,b],w:D.w,h:D.h},floor:b[1],clear:D.h,area:run*D.w,volume:run*D.w*D.h,
   meets:near&&nd<=1.2?{chamber:near.id,in:Math.round(nd*100)/100}:null});
  vols.push({id:'hold:down:landing',kind:'shelf',storey:0,name:'The landing over the water (the way down\'s foot)',prim:'hold:down:landing',
   shape:{type:'poly',pts:land,y0:yb,y1:yb+D.h+.8},floor:yb,clear:D.h+.8,drop:D.above,edge:null,area:4*L*L*.8,volume:4*L*L*.8*(D.h+.8)});}
 C.build();
 // ---------------------------------------------------------------- the galleries and the doors into a hot chamber (Dijkstra on each storey's passages)
 const hotNode=new Set(hot.map(c=>c.node));
 S.storeys.forEach(st=>{if(!HS[st])return;const adj={},P0=passages.filter(p=>p.level===st);
  P0.forEach(p=>{const a=M[p.a],b=M[p.b],w=Math.hypot(a.x-b.x,a.z-b.z)*(hotNode.has(p.a)||hotNode.has(p.b)?25:1);
   (adj[p.a]=adj[p.a]||[]).push([p.b,w,p]);(adj[p.b]=adj[p.b]||[]).push([p.a,w,p]);});
  const path=(s,t)=>{const D={},P={},Q=new Set([s]);D[s]=0;while(Q.size){let u=null;Q.forEach(q=>{if(u==null||D[q]<D[u])u=q;});Q.delete(u);if(u===t)break;
    (adj[u]||[]).forEach(([v,w,p])=>{const nd=D[u]+w;if(D[v]==null||nd<D[v]){D[v]=nd;P[v]=[u,p];Q.add(v);}});}
   if(D[t]==null)return null;const out=[];let v=t;while(v!==s){out.push(P[v][1]);v=P[v][0];}return out.reverse();};
  const onPath=new Map(),L=HS[st],HF=hotOf(st)[0];
  const mark=(Lp,why)=>{(Lp||[]).forEach(p=>{if(!onPath.has(p.id))onPath.set(p.id,{p,why:[]});onPath.get(p.id).why.push(why);});};
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++)mark(path(L[i].node,L[j].node),L[i].id+' / '+L[j].id);
  if(HF)L.forEach(c=>mark(path(c.node,HF.node),c.id+' / '+HF.id));
  const wet=!H.storeys[st].level;
  onPath.forEach(({p,why})=>{const a=M[p.a],b=M[p.b],door=hotNode.has(p.a)||hotNode.has(p.b),lo=Math.min(a.y,b.y);
   vols.push({id:'hold:'+(door?'door:':'gallery:')+p.id,kind:door?'passage':'gallery',storey:st,
    name:door?(wet?'A hot crossing (into '+(hotNode.has(p.a)?p.a:p.b)+', through the scalding water)':'A crystal door (into '+(hotNode.has(p.a)?p.a:p.b)+')'):'A gallery between the hold\'s chambers'+(wet?' (wading)':''),
    prim:p.id,ends:[p.a,p.b],shape:{type:'capsule',pts:[[a.x,a.y,a.z],[b.x,b.y,b.z]],w:p.w,h:p.h},floor:lo,clear:p.h,
    area:Math.hypot(a.x-b.x,a.z-b.z)*p.w,volume:Math.hypot(a.x-b.x,a.z-b.z)*p.w*p.h,joins:why,water:wet&&lo<N.table?{level:N.table,depth:Math.round((N.table-lo)*10)/10}:null});});});
 // ---------------------------------------------------------------- the warmth (KTHERM over the hot chambers' feeders, both storeys': one field)
 const feeders=[...new Set(hot.map(c=>c.feeder))].map(id=>N.feeders.find(q=>q.id===id));
 const TH=KTHERM.create({soil:S.therm.soil,world:S.world,vents:feeders.map(f=>({id:f.id,kind:'point',x:f.x,z:f.z,T:S.therm.T,reach:S.therm.reach,decay:S.therm.decay}))});
 const centreOf=V=>{const s=V.shape;if(s.type==='ellipse')return s.c;const P=s.type==='poly'?s.pts:s.pts.map(p=>[p[0],p[2]]);
  return [P.reduce((a,p)=>a+p[0],0)/P.length,P.reduce((a,p)=>a+p[1],0)/P.length];};
 vols.forEach(V=>{const q=centreOf(V);V.temp=Math.round(TH.heatAt(q[0],q[1])*10)/10;V.clearOK=V.clear>=H.clear;});
 // ---------------------------------------------------------------- the volumes' index and the point test
 const SP=KSPACE.create({cell:24});
 const ext=V=>{const s=V.shape;if(s.type==='ellipse')return [s.c[0],s.c[1],Math.max(s.rx,s.rz)];const P=s.type==='poly'?s.pts:s.pts.map(p=>[p[0],p[2]]);
  const q=centreOf(V);return [q[0],q[1],Math.max(...P.map(p=>Math.hypot(p[0]-q[0],p[1]-q[1])))+(s.w?s.w/2:0)];};
 vols.forEach(V=>{const e=ext(V);SP.insert(V,e[0],e[1],e[2]);});
 const inPoly=(P,x,z)=>{let s=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])s=!s;}return s;};
 const inVol=(V,x,y,z,pad)=>{const s=V.shape;
  if(s.type==='ellipse')return Math.hypot((x-s.c[0])/(s.rx+pad),(z-s.c[1])/(s.rz+pad))<=1&&y>=s.y0-pad&&y<=s.y1+pad;
  if(s.type==='poly')return y>=s.y0-pad&&y<=s.y1+pad&&(inPoly(s.pts,x,z)||s.pts.some((p,i)=>{const q=s.pts[(i+1)%s.pts.length];return segD(x,z,p[0],p[1],q[0],q[1])<=pad;}));
  for(let i=0;i+1<s.pts.length;i++){const a=s.pts[i],b=s.pts[i+1],dx=b[0]-a[0],dz=b[2]-a[2],l2=Math.max(1e-9,dx*dx+dz*dz),t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/l2));
   const fy=a[1]+(b[1]-a[1])*t;if(Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t)<=s.w/2+pad&&y>=fy-pad&&y<=fy+s.h+pad)return true;}return false;};
 const at=(x,y,z,pad)=>{pad=d(pad,0);let hit=null;SP.some(x,z,pad,V=>{if(inVol(V,x,y,z,pad)){hit=V;return true;}return false;});return hit;};
 const HOLD={format:'krator-hold-massing',version:2,site:{px:S.px,py:S.py,G:S.G,storeys:S.storeys.map(s=>({storey:s,y:s===0?S.net.level:S.net.levels[s-1].y,table:s===0?N.table:null}))},
  note:'Proposed: the spaces a Tungang loj would take in the Hearth hold, on both storeys (biomes/hearths/PLAN.md sections 18 and 19). Every volume is clear rock-cut void, its floor level (the active storey\'s chambers are warm water: their floor is the water\'s surface); the settlement kit fills it. Heights are metres under the shelf (G).',
  volumes:vols,at,inVol,index:SP,
  export:()=>({format:'krator-hold-massing',version:2,site:HOLD.site,note:HOLD.note,volumes:vols.map(V=>JSON.parse(JSON.stringify(V)))})};
 // ---------------------------------------------------------------- the dress
 const hotAt=(x,z,pad,st)=>hot.find(c=>(st==null||c.storey===st)&&Math.hypot((x-c.c[0])/(c.rx+pad),(z-c.c[2])/(c.rz+pad))<=1)||null;
 /* a record is kept when no part of it stands in a hold volume: a beam along its whole axis, a block by its parts, a druse by its points; any other
    kind by its foot and its tip */
 const clearOfHold=r=>{if(r.kind==='beam'){const dx=Math.cos(r.el)*Math.cos(r.az),dy=Math.sin(r.el),dz=Math.cos(r.el)*Math.sin(r.az),y0=r.y+r.r*.5;
   for(let t=0;t<=r.len;t+=1)if(at(r.x+dx*t,y0+dy*t,r.z+dz*t,r.r))return false;return true;}
  /* a block's part along its leaning axis (as 85 draws it: from 0.25 m under its floor); a druse point at its foot and its middle */
  if(r.kind==='block')return r.parts.every(p=>{const dx=Math.sin(p.tilt)*Math.cos(p.az),dz=Math.sin(p.tilt)*Math.sin(p.az),dy=Math.cos(p.tilt);
   for(let t=0;t<=p.len+.25;t+=.5)if(at(r.x+p.dx+dx*t,p.y-.25+dy*t,r.z+p.dz+dz*t,p.r))return false;return true;});
  if(r.kind==='druse')return r.pts.every(p=>{const sg=p.up?1:-1;return !at(r.x+p.dx,p.y+sg*.1,r.z+p.dz,.5)&&!at(r.x+p.dx,p.y+sg*p.len*.6,r.z+p.dz,.5);});
  const down=r.kind==='stalactite'||r.kind==='chandelier'||r.kind==='curtain'||r.kind==='straw',tip=r.y+(down?-1:1)*d(r.len,0);
  return !at(r.x,r.y,r.z,d(r.r,.5))&&!at(r.x,tip,r.z,d(r.r,.5))&&(r.kind!=='column'||!at(r.x,(r.floor+r.roof)/2,r.z,d(r.r,.5)));};
 /* a beam ends in its chamber: none runs up a vent's throat or the fumarole (KSPELEO marches it on while the void holds it) */
 const shafts2=throats.concat(fum?[{c:fum.c,y0:fum.y0+20,r:fum.r*1.3}]:[]);
 const offThroats=r=>{if(r.kind!=='beam')return true;const dx=Math.cos(r.el)*Math.cos(r.az),dy=Math.sin(r.el),dz=Math.cos(r.el)*Math.sin(r.az);
  return !shafts2.some(T=>{const ex=r.x+dx*r.len,ey=r.y+dy*r.len,ez=r.z+dz*r.len;return ey>T.y0-2&&Math.hypot(ex-T.c[0],ez-T.c[1])<T.r+r.r+1;});};
 const tag=(L,pre)=>L.map(r=>Object.assign(r,{id:pre+':'+r.id}));
 const beams=[],floor=[],hypo=[];
 if(onS(TOP)&&TOP>0){const yS=S.net.levels[TOP-1].y;
  hotOf(TOP).forEach(c=>{const B=S.crystals.beams,bx=[c.c[0]-c.rx*1.2,c.c[2]-c.rz*1.2,c.c[0]+c.rx*1.2,c.c[2]+c.rz*1.2];
   const R=KSPELEO.place(C,{box:bx,y:c.c[1]+3,cell:B.cell,world:S.world,kinds:B.kinds,accept:r=>{const h=hotAt(r.x,r.z,2,TOP);return h&&h.id===c.id&&r.y>yS-4&&clearOfHold(r)&&offThroats(r);}});
   tag(R,'naica:'+c.id).forEach(r=>{r.chamber=c.id;beams.push(r);});});
  const FL=S.crystals.floor;tag(KSPELEO.place(C,{box,y:yS+2,cell:FL.cell,world:S.world+1,kinds:FL.kinds,
   accept:r=>!hotAt(r.x,r.z,0,TOP)&&r.y>yS-4&&clearOfHold(r)}),'floor').forEach(r=>floor.push(r));}
 /* the active storey: the hypogene dress over each of its crust records (KARST-SITES site 4's call), kept off the hold's volumes */
 if(onS(0))N2.crusts.forEach(cr=>{const ch=chambers.find(c=>c.id===cr.on);if(!ch||ch.storey!==0)return;
  tag(KSPELEO.place(C,{box:cr.box,y:(cr.y0+cr.y1)/2,cell:S.hypogene.cell,world:S.world+2,kinds:KSPELEO[cr.speleo],accept:r=>r.y<S.net.level+ch.h+2&&clearOfHold(r)}),'hypo:'+ch.id)
   .forEach(r=>{r.chamber=ch.id;hypo.push(r);});});
 // ---------------------------------------------------------------- the air: the hazards and the water
 const hazards=[];
 hotOf(TOP).forEach(c=>{const r=Math.max(c.rx,c.rz);
  hazards.push({id:'heat:'+c.id,name:'Naica\'s air: 50 degC at 100% humidity ('+(c.id===F.id?'the Cave of Crystals':'the west crystal chamber')+')',at:[c.c[0],c.c[1],c.c[2]],r,h:c.h,
   tags:{hazard:{kind:'heat',danger:S.heat.danger,falloff:'smooth',soak:Object.assign({},S.heat.soak),shape:{type:'cyl',r,h:c.h+4},tell:{sign:'sweat and fogged glass; a lamp\'s flame stands tall and still'}}}});
  hazards.push({id:'slip:'+c.id,name:'The beams: smooth selenite, wet with condensation',at:[c.c[0],c.c[1],c.c[2]],r:r*.85,h:c.h,
   tags:{hazard:{kind:'slip',shape:{type:'cyl',r:r*.85,h:c.h}}}});});
 /* KKARST's hazards as they are, but its pools' heat: KKARST gives every pool the rising water's temperature; here each pool takes KTHERM's at
    its middle, and only a pool at S.therm.scald or over is a heat hazard (scalding), its danger by how far over */
 const W0=KKARST.water(N2);
 KKARST.hazards(N2).forEach(z=>{if(z.tags.hazard.kind==='heat')return;
  hazards.push(Object.assign({name:z.tags.hazard.kind==='fall'?'A feeder well: a fall to the hot water':z.tags.hazard.kind==='gas'?'Bad air (H2S and CO2) pooled on the water':
   z.tags.hazard.kind==='acid'?'The acid\'s drips (snottites) in the crust band':z.tags.hazard.kind==='drown'?'Warm water over the floor':'The cave ('+z.tags.hazard.kind+')'},z));});
 const pools=W0.pools.filter(p=>inB(p.c[0],p.c[1])).map(p=>Object.assign({},p,{temp:Math.round(TH.heatAt(p.c[0],p.c[1]))}));
 pools.forEach(p=>{if(p.temp<S.therm.scald)return;
  hazards.push({id:p.id+':heat',name:'Scalding water ('+p.temp+' degC, over a feeder)',at:[p.c[0],p.level-1,p.c[1]],r:p.r,h:2,
   tags:{hazard:{kind:'heat',danger:Math.min(1,.5+(p.temp-S.therm.scald)/20),shape:{type:'cyl',r:p.r,h:2.5},tell:{sign:'steam off the water; the gypsum crust white and crumbling'}}}});});
 if(fum)hazards.push({id:'fumarole:heat',name:'The fumarole: steam at '+fum.T+' degC',at:[fum.c[0],fum.y0,fum.c[1]],r:fum.r*1.6,h:fum.ground-fum.y0,
  tags:{hazard:{kind:'heat',danger:1,shape:{type:'cyl',r:fum.r*1.6,h:fum.ground-fum.y0},tell:{sign:'a roar of steam, a hot wind up the shaft'}}}});
 const wells=shafts.filter(s=>s.kind==='level').map(s=>({id:'well:'+s.id,name:'The feeder well (down to the active storey\'s water)',c:s.c.slice(),r:s.r,level:N.table,temp:Math.round(TH.heatAt(s.c[0],s.c[1])),sulphur:true,mouth:s.y1}));
 const water=onS(0)?{level:N.table,seeds:pools.map(p=>p.c.slice()),pools,box:box.slice()}:null;
 return {N,N2,M,box,centre:[cx,cz],focus:F,hot,hotOf,chambers,passages,cupolas,vents,throats,fumarole:fum,shafts,C,HOLD,TH,beams,floor,hypo,hazards,wells,water,inB,
  temp:(x,z)=>TH.heatAt(x,z),
  export:()=>({format:'krator-hearth-hold-cave',version:2,site:HOLD.site,box,karst:N2,cavern:C.export(),speleo:KSPELEO.export(beams.concat(floor,hypo)),
   therm:TH.export({box,cell:8}),hold:HOLD.export(),hazards:hazards.map(z=>({id:z.id,at:z.at,tags:z.tags})),wells,fumarole:fum,water})};
})(SITE);
