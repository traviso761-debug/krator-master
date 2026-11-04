// ================================================================= HEARTHS — the Cave of Crystals: the cave, its crystals and the hold's massing  [G data]
// PLAN.md section 18. Everything here is records on the core, no THREE and no DOM; the host fragments (84 on) draw them.
//   THE CAVE     site 4's KKARST.network, whole, cropped to SITE.half round the drained storey's largest feeder chamber (SITE.focus): its chambers,
//                every passage with an end in the box, the cupolas in their roofs, the vents over them, the feeder and level shafts under the
//                feeder chambers (the HOT chambers). KKARST.build carves them in one KCAVERN; the station adds the vents' throats up through the
//                shelf (KKARST opens the well in the ground; the cupola stops short of it) and the hold's cuts (below)
//   THE HOLD     the massing a settlement kit drops into (proposed: the cooler chambers round the feeders): chambers (SITE.hold.chambers, their
//                level floors), shelves (a terrace cut in each one's wall), galleries (the passages joining them, by the cheapest path that keeps
//                out of the hot chambers), passages (the crystal doors: the same paths' legs into a hot chamber), approaches (the night road
//                rising toward the surface, the way down toward the active storey). HOLD.volumes are plain records with their shapes;
//                HOLD.at(x, y, z, pad) is the volume holding a point; KSPACE indexes them
//   THE CRYSTALS KSPELEO.place over each hot chamber with SITE.crystals.beams (the megacrystals), then over the whole box with
//                SITE.crystals.floor (the bladed floor and blocks); no record stands in a hold volume (accept), and none of the second pass in a
//                hot chamber (the first pass dressed it)
//   THE AIR      KTHERM over the hot chambers' feeders (the storey's warmth: every volume's temp), the hazards (KHAZ records: heat with soak and
//                slip over each hot chamber, KKARST's own falls), the hot water in each feeder well (core/water's arguments)
const CAVE=(function(S){
 const K=KRAND,d=(v,x)=>v==null?x:v;
 const N=KKARST.network(Object.assign({ground:S.ground,world:S.world},S.net));
 const M={};N.nodes.forEach(n=>{M[n.id]=n;});
 const F=N.chambers.find(c=>c.id===S.focus);if(!F)throw new Error('CAVE: the network has no chamber '+S.focus);
 const cx=F.c[0],cz=F.c[2],hb=S.half,box=[cx-hb,cz-hb,cx+hb,cz+hb];
 const inB=(x,z,m)=>{m=d(m,0);return x>box[0]-m&&x<box[2]+m&&z>box[1]-m&&z<box[3]+m;};
 // ---------------------------------------------------------------- the crop (KKARST's records, never edited)
 const chambers=N.chambers.filter(c=>c.storey===1&&inB(c.c[0],c.c[2]));
 const passages=N.passages.filter(p=>p.level===1&&(inB(M[p.a].x,M[p.a].z)||inB(M[p.b].x,M[p.b].z)));
 const nid=new Set();passages.forEach(p=>{nid.add(p.a);nid.add(p.b);});chambers.forEach(c=>nid.add(c.node));
 const cupolas=N.cupolas.filter(u=>chambers.some(c=>c.id===u.chamber));
 const vents=N.outlets.filter(o=>o.kind==='vent'&&cupolas.some(u=>o.over===u.id));
 const hot=chambers.filter(c=>c.feeder);
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
 // ---------------------------------------------------------------- the hold's cuts (before the build: a room or a stair joins hard)
 const H=S.hold,HC=Object.keys(H.chambers).map(id=>chambers.find(c=>c.id===id)).filter(Boolean);
 if(HC.length!==Object.keys(H.chambers).length)throw new Error('CAVE: a hold chamber is not in the box');
 /* each hold chamber's floor made level at its record's height: KCAVERN joins a hall and its passages smoothly, which sinks the floor up to
    1.7 m where they meet at the chamber's node; a monolith (it fills what was carved before it) brings it back to the hall's floor, out to a
    tenth past the floor's ellipse, where the passages leave it */
 Object.keys(H.chambers).forEach(id=>{const c=chambers.find(q=>q.id===id),P=[];for(let i=0;i<32;i++){const a=i/32*2*Math.PI;P.push([c.c[0]+c.rx*1.1*Math.cos(a),c.c[2]+c.rz*1.1*Math.sin(a)]);}
  C.monolith({id:'hold:floor:'+id,owner:'hearths',poly:P,y0:c.c[1]-4,y1:c.c[1],block:false});});
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
 const freeDir=(c,len,rise,avoid)=>{const A=passages.filter(p=>p.a===c.node||p.b===c.node).map(p=>{const o=M[p.a===c.node?p.b:p.a];return Math.atan2(o.z-c.c[2],o.x-c.c[0]);}).concat(avoid);
  let best=null;for(let k=0;k<24;k++){const a=k/24*2*Math.PI,u=ang(a),R=radAlong(c,u);let cl=1e9;
   for(let s=2;s<=len;s+=3)cl=Math.min(cl,clearAt(c.c[0]+u[0]*(R+s),c.c[1]+s*rise,c.c[2]+u[1]*(R+s),c.id));
   const sp=A.length?Math.min(...A.map(b=>sep(a,b))):Math.PI,sc=(cl>=8?1000:0)+(cl>=8?sp:cl);
   if(!best||sc>best.sc)best={a,u,R,sc,cl};}
  return best;};
 const towardFocus=c=>Math.atan2(cz-c.c[2],cx-c.c[0]);
 const vols=[];
 HC.forEach(c=>vols.push({id:'hold:chamber:'+c.id,kind:'chamber',name:H.chambers[c.id],prim:c.id,node:c.node,
  shape:{type:'ellipse',c:[c.c[0],c.c[2]],rx:c.rx,rz:c.rz,y0:c.c[1],y1:c.c[1]+c.h},floor:c.c[1],clear:c.h,area:Math.PI*c.rx*c.rz,volume:2/3*Math.PI*c.rx*c.rz*c.h}));
 /* shelves: a level terrace cut into each hold chamber's wall, SITE.hold.shelf.up over its floor, on its free bearing away from the hot chamber */
 const shelfDir={};
 HC.forEach(c=>{const s=H.shelf,f=freeDir(c,s.depth+4,0,[towardFocus(c)]),u=f.u,t=[-u[1],u[0]],d0=f.R*.9,d1=f.R+s.depth,y=c.c[1]+s.up;shelfDir[c.id]=f.a;
  const P=(dd,tt)=>[c.c[0]+u[0]*dd+t[0]*tt,c.c[2]+u[1]*dd+t[1]*tt],poly=[P(d0,-s.half),P(d1,-s.half),P(d1,s.half),P(d0,s.half)];
  const id='hold:shelf:'+c.id;C.room({id,owner:'hearths',poly,y,h:s.h,ceil:'vault',rise:s.rise,r:1.5,rock:'gypsum',finish:'raw'});
  vols.push({id,kind:'shelf',name:'A shelf over '+H.chambers[c.id].replace(/^The /,'the ').replace(/ \(.*$/,''),prim:id,on:'hold:chamber:'+c.id,
   shape:{type:'poly',pts:poly,y0:y,y1:y+s.h},floor:y,clear:s.h,drop:s.up,edge:[P(f.R,-s.half),P(f.R,s.half)],area:(d1-d0)*2*s.half,volume:(d1-d0)*2*s.half*s.h});});
 /* the night road: a gallery rising at SITE.hold.road.grade from the hall's wall toward the shelf's surface, carved to the box's edge; the rest of
    its run is recorded (continues) */
 {const R=H.road,c=HC.find(h=>h.id===R.from),f=freeDir(c,40,R.grade,[towardFocus(c),shelfDir[c.id]]),u=f.u;
  const x0=c.c[0]+u[0]*f.R*.85,z0=c.c[2]+u[1]*f.R*.85,y0=c.c[1];
  const tx=u[0]>0?(box[2]-4-x0)/u[0]:u[0]<0?(box[0]+4-x0)/u[0]:1e9,tz=u[1]>0?(box[3]-4-z0)/u[1]:u[1]<0?(box[1]+4-z0)/u[1]:1e9,L=Math.min(tx,tz);
  const pts=[0,.5,1].map(k=>[x0+u[0]*L*k,y0+L*k*R.grade,z0+u[1]*L*k]),e=pts[2],g=S.ground(e[0]+u[0]*(-e[1]/R.grade),e[2]+u[1]*(-e[1]/R.grade));
  C.tube({id:'hold:road',owner:'hearths',pts,w:R.w,h:R.h,rock:'gypsum',blend:2});
  const run=(g-e[1])/R.grade;
  vols.push({id:'hold:road',kind:'approach',name:'The night road (toward the shelf\'s surface)',prim:'hold:road',from:'hold:chamber:'+c.id,
   shape:{type:'capsule',pts,w:R.w,h:R.h},floor:y0,clear:R.h,area:L*R.w,volume:L*R.w*R.h,
   continues:{at:e.slice(),to:[e[0]+u[0]*run,g,e[2]+u[1]*run],grade:R.grade,note:'on at the same grade to a mouth on the shelf: the night entrance (PLAN.md section 11, station 2)'}});}
 /* the way down: a stair from the south chamber's wall toward the active storey (its floor at SITE.net.level), a landing at its foot; what
    it meets below is recorded (the active storey is not carved on this page) */
 {const D=H.down,c=HC.find(h=>h.id===D.from),f=freeDir(c,20,0,[towardFocus(c),shelfDir[c.id]]),u=f.u,drop=c.c[1]-S.net.level,run=drop/D.pitch;
  const a=[c.c[0]+u[0]*f.R*.85,c.c[1],c.c[2]+u[1]*f.R*.85],b=[a[0]+u[0]*run,S.net.level,a[2]+u[1]*run];
  C.stair({id:'hold:down',owner:'hearths',a,b,w:D.w,h:D.h});
  const t=[-u[1],u[0]],L=3.5,land=[[-1,-1],[1,-1],[1,1],[-1,1]].map(q=>[b[0]+u[0]*(q[0]+1)*L*.8+t[0]*q[1]*L,b[2]+u[1]*(q[0]+1)*L*.8+t[1]*q[1]*L]);
  C.room({id:'hold:down:landing',owner:'hearths',poly:land,y:b[1],h:D.h+.8,ceil:'flat',r:.8,rock:'gypsum',finish:'raw'});
  let near=null,nd=1e9;N.nodes.forEach(n=>{if(n.level!==0)return;const q=Math.hypot(n.x-b[0],n.z-b[2]);if(q<nd){nd=q;near=n;}});
  vols.push({id:'hold:down',kind:'approach',name:'The way down (toward the active storey)',prim:'hold:down',from:'hold:chamber:'+c.id,
   shape:{type:'capsule',pts:[a,b],w:D.w,h:D.h},floor:b[1],clear:D.h,area:run*D.w,volume:run*D.w*D.h,landing:{poly:land,y:b[1],h:D.h+.8},
   continues:{at:b.slice(),meets:near?{node:near.id,at:[near.x,near.y,near.z],d:Math.round(nd)}:null,note:'the active storey\'s maze, warm water and the dark crops (PLAN.md section 11, station 2)'}});}
 C.build();
 // ---------------------------------------------------------------- the galleries and the crystal doors (Dijkstra on the crop's passages)
 const hotNode=new Set(hot.map(c=>c.node)),adj={};
 passages.forEach(p=>{const a=M[p.a],b=M[p.b],w=Math.hypot(a.x-b.x,a.z-b.z)*(hotNode.has(p.a)||hotNode.has(p.b)?25:1);
  (adj[p.a]=adj[p.a]||[]).push([p.b,w,p]);(adj[p.b]=adj[p.b]||[]).push([p.a,w,p]);});
 const path=(s,t)=>{const D={},P={},Q=new Set([s]);D[s]=0;while(Q.size){let u=null;Q.forEach(q=>{if(u==null||D[q]<D[u])u=q;});Q.delete(u);if(u===t)break;
   (adj[u]||[]).forEach(([v,w,p])=>{const nd=D[u]+w;if(D[v]==null||nd<D[v]){D[v]=nd;P[v]=[u,p];Q.add(v);}});}
  if(D[t]==null)return null;const out=[];let v=t;while(v!==s){out.push(P[v][1]);v=P[v][0];}return out.reverse();};
 const onPath=new Map();
 const mark=(L,why)=>{(L||[]).forEach(p=>{if(!onPath.has(p.id))onPath.set(p.id,{p,why:[]});onPath.get(p.id).why.push(why);});};
 for(let i=0;i<HC.length;i++)for(let j=i+1;j<HC.length;j++)mark(path(HC[i].node,HC[j].node),HC[i].id+' / '+HC[j].id);
 HC.forEach(c=>mark(path(c.node,F.node),c.id+' / '+F.id));
 onPath.forEach(({p,why})=>{const a=M[p.a],b=M[p.b],door=hotNode.has(p.a)||hotNode.has(p.b);
  vols.push({id:'hold:'+(door?'door:':'gallery:')+p.id,kind:door?'passage':'gallery',name:door?'A crystal door (into '+(hotNode.has(p.a)?p.a:p.b)+')':'A gallery between the hold\'s chambers',
   prim:p.id,ends:[p.a,p.b],shape:{type:'capsule',pts:[[a.x,a.y,a.z],[b.x,b.y,b.z]],w:p.w,h:p.h},floor:Math.min(a.y,b.y),clear:p.h,
   area:Math.hypot(a.x-b.x,a.z-b.z)*p.w,volume:Math.hypot(a.x-b.x,a.z-b.z)*p.w*p.h,joins:why});});
 // ---------------------------------------------------------------- the storey's warmth (KTHERM over the hot chambers' feeders)
 const TH=KTHERM.create({soil:S.therm.soil,world:S.world,vents:hot.map(c=>{const f=N.feeders.find(q=>q.id===c.feeder);return {id:f.id,kind:'point',x:f.x,z:f.z,T:S.therm.T,reach:S.therm.reach,decay:S.therm.decay};})});
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
 const HOLD={format:'krator-hold-massing',version:1,site:{px:S.px,py:S.py,G:S.G,storey:1,y:S.net.levels[0].y},
  note:'Proposed: the spaces a Tungang loj would take in the drained storey (biomes/hearths/PLAN.md section 18). Every volume is clear rock-cut void, its floor level; the settlement kit fills it. Heights are metres under the shelf (G).',
  volumes:vols,at,inVol,index:SP,
  export:()=>({format:'krator-hold-massing',version:1,site:HOLD.site,note:HOLD.note,volumes:vols.map(V=>JSON.parse(JSON.stringify(V)))})};
 // ---------------------------------------------------------------- the crystals
 const hotAt=(x,z,pad)=>hot.find(c=>Math.hypot((x-c.c[0])/(c.rx+pad),(z-c.c[2])/(c.rz+pad))<=1)||null;
 /* a record is kept when no part of it stands in a hold volume: a beam along its whole axis, a block by its parts, a druse by its points */
 const clearOfHold=r=>{if(r.kind==='beam'){const dx=Math.cos(r.el)*Math.cos(r.az),dy=Math.sin(r.el),dz=Math.cos(r.el)*Math.sin(r.az),y0=r.y+r.r*.5;
   for(let t=0;t<=r.len;t+=1)if(at(r.x+dx*t,y0+dy*t,r.z+dz*t,r.r))return false;return true;}
  /* a block's part along its leaning axis (as 85 draws it: from 0.25 m under its floor); a druse point at its foot and its middle */
  if(r.kind==='block')return r.parts.every(p=>{const dx=Math.sin(p.tilt)*Math.cos(p.az),dz=Math.sin(p.tilt)*Math.sin(p.az),dy=Math.cos(p.tilt);
   for(let t=0;t<=p.len+.25;t+=.5)if(at(r.x+p.dx+dx*t,p.y-.25+dy*t,r.z+p.dz+dz*t,p.r))return false;return true;});
  if(r.kind==='druse')return r.pts.every(p=>{const sg=p.up?1:-1;return !at(r.x+p.dx,p.y+sg*.1,r.z+p.dz,.5)&&!at(r.x+p.dx,p.y+sg*p.len*.6,r.z+p.dz,.5);});
  return !at(r.x,r.y,r.z,.5);};
 /* a beam ends in the chamber: none runs up a vent's throat (KSPELEO marches it on while the void holds it, and the throat is void to the sky) */
 const offThroats=r=>{if(r.kind!=='beam')return true;const dx=Math.cos(r.el)*Math.cos(r.az),dy=Math.sin(r.el),dz=Math.cos(r.el)*Math.sin(r.az);
  return !throats.some(T=>{const ex=r.x+dx*r.len,ey=r.y+dy*r.len,ez=r.z+dz*r.len;return ey>T.y0-2&&Math.hypot(ex-T.c[0],ez-T.c[1])<T.r+r.r+1;});};
 const tag=(L,pre)=>L.map(r=>Object.assign(r,{id:pre+':'+r.id}));
 const beams=[];
 hot.forEach(c=>{const B=S.crystals.beams,bx=[c.c[0]-c.rx*1.2,c.c[2]-c.rz*1.2,c.c[0]+c.rx*1.2,c.c[2]+c.rz*1.2];
  const R=KSPELEO.place(C,{box:bx,y:c.c[1]+3,cell:B.cell,world:S.world,kinds:B.kinds,accept:r=>{const h=hotAt(r.x,r.z,2);return h&&h.id===c.id&&clearOfHold(r)&&offThroats(r);}});
  tag(R,'naica:'+c.id).forEach(r=>{r.chamber=c.id;beams.push(r);});});
 const FL=S.crystals.floor,floor=tag(KSPELEO.place(C,{box,y:S.net.levels[0].y+2,cell:FL.cell,world:S.world+1,kinds:FL.kinds,
  accept:r=>!hotAt(r.x,r.z,0)&&clearOfHold(r)}),'floor');
 // ---------------------------------------------------------------- the air: the hazards and the hot water
 const hazards=[];
 hot.forEach(c=>{const r=Math.max(c.rx,c.rz);
  hazards.push({id:'heat:'+c.id,name:'Naica\'s air: 50 degC at 100% humidity ('+(c.id===F.id?'the Cave of Crystals':'the west crystal chamber')+')',at:[c.c[0],c.c[1],c.c[2]],r,h:c.h,
   tags:{hazard:{kind:'heat',danger:S.heat.danger,falloff:'smooth',soak:Object.assign({},S.heat.soak),shape:{type:'cyl',r,h:c.h+4},tell:{sign:'sweat and fogged glass; a lamp\'s flame stands tall and still'}}}});
  hazards.push({id:'slip:'+c.id,name:'The beams: smooth selenite, wet with condensation',at:[c.c[0],c.c[1],c.c[2]],r:r*.85,h:c.h,
   tags:{hazard:{kind:'slip',shape:{type:'cyl',r:r*.85,h:c.h}}}});});
 KKARST.hazards(N2).forEach(z=>hazards.push(Object.assign({name:z.tags.hazard.kind==='fall'?'A feeder well: a fall to the hot water':'The cave ('+z.tags.hazard.kind+')'},z)));
 const wells=shafts.filter(s=>s.kind==='level').map(s=>({id:'well:'+s.id,name:'The feeder well (the storey\'s hot water, '+N.temp+' degC)',c:s.c.slice(),r:s.r,level:N.table,temp:N.temp,sulphur:true,mouth:s.y1}));
 return {N,N2,M,box,centre:[cx,cz],focus:F,hot,chambers,passages,cupolas,vents,throats,shafts,C,HOLD,TH,beams,floor,hazards,wells,inB,
  temp:(x,z)=>TH.heatAt(x,z),
  export:()=>({format:'krator-crystal-cave',version:1,site:HOLD.site,box,karst:N2,cavern:C.export(),speleo:KSPELEO.export(beams.concat(floor)),
   therm:TH.export({box,cell:8}),hold:HOLD.export(),hazards:hazards.map(z=>({id:z.id,at:z.at,tags:z.tags})),wells})};
})(SITE);
