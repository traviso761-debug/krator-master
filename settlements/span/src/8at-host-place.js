// ================================================================= HOST — Span placed from its layout (PLAN.md SP3)
// Every part of SPAN_LAYOUT (30-span-layout.js) drawn at its place and state: the records are registered in core/tags
// first (SPAN.tags: KTAGS.page, which the host's inspector and minimap read), then each part goes to the builder its kind
// names: Span's own pieces (kits/ancients targets/span, read in place: the galleries, ranges, domes, pads, the Cross, the
// weirs, the portals) and, for the parts no builder draws yet, plain stand-ins from the kit's items (the hangars' fronts, the
// tanks, the works, the bridges, the service ledges, the wrecks) and Dalab's buildings as boxes until SP4 takes the Dalab set.
// The decay states are the kit's: the rehabilitated get repairPass, the worn wornPass, as its scene loop does.
// Nothing here decides where a thing goes: a position or a size changes in the layout, never here.
const SP=(function(){const L=SPAN_LAYOUT,F=SPAN_FRAME,T=KTAGS.create({build:'span'});KTAGS.page=T;SPAN.tags(L,F,T);
 const D={intact:0,ruined:1,toppled:2,rehab:3,worn:5},placed=[],missing=[],PI=Math.PI;
 const seedOf=p=>KRAND.child(2820,'span:'+p.id);
 const W=(u,v,y)=>SPAN.toWorld(F,u,v,y||0);
 // a builder at the part's state, with the kit's passes for the rehabilitated and the worn (90-scene.js's loop)
 function run(p,x,z,fn,o){const d=D[p.state],dd=d===5?0:d;TSTAT.cur=p.kind+'/'+p.id;HOLES=(d>=3&&d!==5)?.55:1;
  const l0=d===5?wornLens():null;let G=null;o.id=p.id;o.seed=seedOf(p);
  try{G=fn(scene,x,z,dd,o);}catch(e){reportErr(p.id+': '+(e.stack||e));}
  HOLES=1;
  if(G&&d===5){KOFF=[x,0,z];try{wornPass(G,l0,0);}catch(e){reportErr(p.id+' worn: '+e.stack);}KOFF=[0,0,0];}
  if(G&&d===3){KOFF=[x,0,z];try{repairPass(G,3);}catch(e){reportErr(p.id+' repair: '+e.stack);}KOFF=[0,0,0];}
  placed.push(p.id);return G;}
 // a box of the kit's at a part (a stand-in), in the page's frame
 function box(key,u0,u1,v0,v1,y0,y1,c){const w=W((u0+u1)/2,(v0+v1)/2,(y0+y1)/2);kput(key,[w[0],w[1],w[2]],F.ang?qEuler(0,-F.ang,0):null,[u1-u0,y1-y0,v1-v0],c||null);}
 const frontRy=v=>v>0?PI:0;   /* a piece's front (+z) toward the canyon's axis: the right bank faces -v, the left +v */
 const toward=(u,v,tu,tv)=>Math.atan2(tu-u,tv-v);
 const BUILD={
  gallery(p){const s=p.shape,lo=Math.min(Math.abs(s[3]),Math.abs(s[4])),hi=Math.max(Math.abs(s[3]),Math.abs(s[4])),sg=s[3]>0?1:-1,vc=sg*(lo+hi)/2;
   const w=W(sg>0?s[2]:s[1],vc,0);run(p,w[0],w[2],buildSpanGallery,{L:s[2]-s[1],D:hi-lo,n:p.st,y:p.y,ry:frontRy(sg),fall:p.y-L.levels.floor});},
  ledge(p){const s=p.shape,sg=s[3]>0?1:-1,v=sg*(Math.min(Math.abs(s[3]),Math.abs(s[4]))+2),d=D[p.state];
   for(let u=s[1];u<s[2];u+=20){if(d===2&&u>(s[1]+s[2])/2)break;
    box(d>0?'plateR':'plateW',u,u+20,v-2,v+2,p.y,p.y+.5);
    [0.8,1.6].forEach(h=>{const w=W(u+10,v+sg*3,p.y+h);kput(d>0?'pipeR':'pipe',w,qEuler(0,0,PI/2),[.4,20,.4],null);});}
   placed.push(p.id);},
  range(p){const s=p.shape,lo=Math.min(Math.abs(s[3]),Math.abs(s[4])),hi=Math.max(Math.abs(s[3]),Math.abs(s[4])),sg=s[3]>0?1:-1;
   const w=W(sg>0?s[2]:s[1],sg*(lo+hi)/2,0);run(p,w[0],w[2],buildSpanRange,{L:s[2]-s[1],D:hi-lo,up:p.st,down:2,y:p.y,ry:frontRy(sg),fall:40});},
  dome(p){const s=p.shape,w=W(s[1],s[2],0),c=L.bay.c;
   run(p,w[0],w[2],buildSpanDome,{R:s[3]/1.32,y:p.y,ry:toward(s[1],s[2],c[0],c[1])});},
  pad(p){const s=p.shape,w=W(s[1],s[2],0);run(p,w[0],w[2],buildSpanPad,{R:s[3],h:Math.max(p.h,4),y:p.y,ry:toward(s[1],s[2],s[1],0)});},
  cross(p){const s=p.shape,w=W((s[1]+s[2])/2,0,0);run(p,w[0],w[2],buildSpanCross,{W:s[2]-s[1],S:s[4]-s[3],st:p.st,gate:80,keel:p.y+110,y:0});},   /* the keel from the body's soffit (y -18) down to the river under it (y -110) */
  gate(p){placed.push(p.id);},   /* the Cross draws its gate towers */
  weir(p){const s=p.shape,w=W((s[1]+s[2])/2,(s[3]+s[4])/2,0);
   if(p.id==='sluice')run(p,w[0]-60,w[2],buildSpanWeir,{L:s[4]-s[3],h:16,bays:3,steps:4,drop:17.5,run:30,y:-110-16*.55,ry:PI/2});
   else run(p,w[0],w[2],buildSpanWeir,{L:s[4]-s[3],h:p.h,bays:Math.max(3,Math.round((s[4]-s[3])/20)),y:p.y,ry:PI/2});},
  portal(p){const cut=L.cuts.find(c=>c.id===(p.id==='basin_portal'?'basin_cut':'valley_cut')),bx=cut.box,sg=p.id==='basin_portal'?-1:1;
   const vf=sg<0?bx[2]:bx[3],w=W((bx[0]+bx[1])/2,vf,0);
   run(p,w[0],w[2],buildSpanPortal,{y:p.y,ry:sg<0?0:PI,stage:true,lit:p.held});},
  hangar(p){const s=p.shape,d=D[p.state],sg=s[3]>0?1:-1,face=sg*Math.min(Math.abs(s[3]),Math.abs(s[4])),back=sg*Math.max(Math.abs(s[3]),Math.abs(s[4]));
   const top=L.levels.b3;box(d>0?'boxCR':'boxC',s[1],s[2],Math.min(face+sg*3,back),Math.max(face+sg*3,back),p.y,top);
   box(d>0?'plateR':'plateW',s[1],s[2],face+sg*1,face+sg*3,top-12,top);
   box('spVoid',s[1]+5,s[2]-5,face+sg*2.9,face+sg*3.1,p.y,top-12);
   [s[1]+2.5,s[2]-2.5].forEach(u=>box(d>0?'pierR':'pierW',u-2.5,u+2.5,face,face+sg*3,p.y,top-12));
   if(d>0&&KRAND.unit(KRAND.hash(seedOf(p),1))<.6)box('plateR',s[1]+5,s[1]+5+(s[2]-s[1])*.45,face+sg*1.2,face+sg*2,p.y,top-14);
   placed.push(p.id);},
  tank(p){const s=p.shape,d=D[p.state],w=W(s[1],s[2],p.y);const G=new THREE.Group();G.position.set(w[0],w[1],w[2]);scene.add(G);
   const hf=d>0?holeFn(d*.7,seedOf(p)%997,null,1.2):null,H=d===2?p.h*.8:p.h;
   meshMerged([lathe({rFn:()=>s[3],H:H,cut:d===2?H:undefined,jag:d===2?6:undefined,seed:seedOf(p)%97,nu:48,nv:Math.round(H/8),hole:hf}),
    new THREE.CircleGeometry(s[3],48).rotateX(-PI/2).translate(0,d===2?H*.9:H,0)],SHELL(d),G);
   for(let y=8;y<H;y+=16)kput(d>0?'ringR':'ringW',[w[0],w[1]+y,w[2]],qEuler(PI/2,0,0),[s[3]*1.01,s[3]*1.01,1.2],null);
   placed.push(p.id);},
  works(p){const s=p.shape,d=D[p.state];box(d>0?'boxCR':'boxC',s[1],s[2],s[3],s[4],p.y,p.y+Math.max(4,p.h*.7));
   if(p.h>6)for(let u=s[1]+6;u<s[2];u+=12)box(d>0?'plateR':'plateW',u-5,u+5,s[3]+2,s[4]-2,p.y+p.h*.7,p.y+p.h);
   placed.push(p.id);},
  bridge(p){const s=p.shape,d=D[p.state],k=d>0?'plateR':'plateW';
   if(p.id==='pipe_bridge'){[-6,0,6].forEach((du,i)=>{const n=16;for(let j=0;j<n;j++){const v0=s[3]+(s[4]-s[3])*j/n,v1=s[3]+(s[4]-s[3])*(j+1)/n,sag=t=>-6*(1-Math.pow(2*t-1,2));
     const a=W((s[1]+s[2])/2+du,v0,p.y+sag(j/n)),b=W((s[1]+s[2])/2+du,v1,p.y+sag((j+1)/n));beam(d>0?'pipeR':'pipe',a,b,2.2+i%2,2.2+i%2);}});}
   else{box(k,s[1],s[2],s[3],s[4],p.y,p.y+1.2);[s[1]+.5,s[2]-.5].forEach(u=>box(k,u-.5,u+.5,s[3],s[4],p.y-6,p.y+2.2));}
   placed.push(p.id);},
  payload(p){const s=p.shape,d=D[p.state],w=W(s[1],s[2],p.y),G=new THREE.Group();G.position.set(w[0],w[1],w[2]);scene.add(G);
   meshMerged([new THREE.SphereGeometry(s[3],20,14).scale(1,1.3,1).translate(0,s[3]*1.3,0)],SHELL(Math.max(1,d)),G);
   if(d<2)beam('pipeR',[w[0],w[1]+s[3]*2.6,w[2]],[w[0],L.levels.b1-2,w[2]],.35,.35);
   placed.push(p.id);},
  craft(p){const s=p.shape,w=W(s[1],s[2],p.y),G=new THREE.Group();G.position.set(w[0],w[1],w[2]);G.rotation.y=KRAND.unit(KRAND.hash(seedOf(p),2))*TAU;scene.add(G);
   meshMerged([new THREE.SphereGeometry(1,24,12).scale(s[3],Math.max(3,p.h*.5),s[3]*.42).translate(0,p.h*.3,0)],SHELL(1),G);placed.push(p.id);},
  fallen(p){const s=p.shape,b=SPAN.bbox(s),sd=seedOf(p);
   for(let i=0;i<Math.round((b[1]-b[0])*(b[3]-b[2])/60);i++){const u=b[0]+(b[1]-b[0])*KRAND.unit(KRAND.hash(sd,i,1)),v=b[2]+(b[3]-b[2])*KRAND.unit(KRAND.hash(sd,i,2));
    if(!SPAN.inShape(s,u,v))continue;const w=W(u,v,p.y+.8);kput(i%3?'rubble':'plateR',w,qEuler(KRAND.unit(KRAND.hash(sd,i,3))*.9,KRAND.unit(KRAND.hash(sd,i,4))*TAU,0),i%3?1.5+2*KRAND.unit(KRAND.hash(sd,i,5)):[6,.6,4],null);}
   placed.push(p.id);},
  ringsite(p){const s=p.shape;
   if(s[0]==='box'){const w=W(s[2],(s[3]+s[4])/2,0);run(p,w[0],w[2],buildSpanGallery,{L:s[2]-s[1],D:(s[4]-s[3])*p.cover,n:p.st,y:p.y,ry:PI});}
   else{const w=W(s[1],s[2],0),G=new THREE.Group();G.position.set(w[0],w[1],w[2]);scene.add(G);
    meshMerged([lathe({rFn:()=>s[3],H:4.5,nu:96,nv:2}),lathe({rFn:()=>s[3]-1.2,H:4.5,nu:96,nv:2})],SHELL(1),G);
    for(let i=0;i<6;i++){const a=i/6*TAU,u=s[1]+Math.cos(a)*s[3]*.55,v=s[2]+Math.sin(a)*s[3]*.55,ww=W(u,v,0);
     run({id:p.id+'_dome_'+i,kind:'dome',state:p.state},ww[0],ww[2],buildSpanDome,{R:20,y:0,ry:toward(u,v,s[1],s[2])});}}},
  deck(p){const s=p.shape,w=W(s[1],s[2],p.y),G=new THREE.Group();G.position.set(w[0],w[1],w[2]);scene.add(G);
   meshMerged([new THREE.CylinderGeometry(1,1,p.h,96,1).scale(s[3],1,s[4]).translate(0,p.h/2,0)],SHELL(D[p.state]===0?0:1),G);
   kput('ringR',[w[0],w[1]+p.h,w[2]],qEuler(PI/2,0,0),[s[3],s[4],1],null);placed.push(p.id);},
  ramp(p){const s=p.shape;box('spRoad',s[1],s[2],s[3],s[4],p.y,p.y+.4);placed.push(p.id);},
  bay(p){placed.push(p.id);},   /* the bay is the ground's (SPAN.groundAt) */
 };
 // OTHER PEOPLE'S BUILDINGS, each through its own kit at the part's footprint centre on its base (a part with a parent stands
 // on the parent's top), turned by the part's `ry` (by default its front toward the Apron's long axis), a variant by its seed:
 //  - a key of the Dalab set (settlements/dalab, read in place): VERN.place, its registry (the trading post, the mound, the
 //    watch tower, Dalab's gates and banners)
 //  - a 'pa:' key: the Post-Apoc kit (kits/post-apoc, the closure KratorPostApoc), all in one build at the end (the arena, the
 //    highlanders' houses, the barricade that is Dalab's Line), its own furniture from the catalog
 // Each placement keeps the record's footprint and the def's for the page's check (99-host-take.js).
 const OWN_PLACED=[],PA_SITES=[];
 function ownPlace(p){const s=p.shape,b=SPAN.bbox(s),par=p.in?SPAN.byId(L)[p.in]:null,y0=par?par.y+par.h:p.y;
  const cu=(b[0]+b[1])/2,cv=(b[2]+b[3])/2,w=W(cu,cv,0),ry=(p.ry!=null?p.ry:(cv>0?Math.PI:0))-F.ang,v=KRAND.hash(seedOf(p),7)%3,args=p.args||{};
  const rec={id:p.id,key:p.key,w:b[1]-b[0],d:b[3]-b[2],ry:p.ry||0,args:args};
  if(p.key.indexOf('pa:')===0){PA_SITES.push({key:p.key.slice(3),x:w[0],z:w[2],ry:ry,o:Object.assign({v:v,y:y0},p.by==='dalab'?{culture:'dalab'}:{},args)});rec.kit='post-apoc';OWN_PLACED.push(rec);placed.push(p.id);return;}
  if(typeof VERN!=='undefined'&&VERN.defs[p.key]){TSTAT.cur=p.kind+'/'+p.id;const G=VERN.place(scene,p.key,w[0],w[2],ry,Object.assign({y:y0,v:v},args));
   if(G){rec.kit='dalab';rec.def=[VERN.defs[p.key].w,VERN.defs[p.key].d];OWN_PLACED.push(rec);}else missing.push(p.id);placed.push(p.id);return;}
  missing.push(p.id);}
 const t0=performance.now();
 L.parts.forEach(p=>{if(p.key&&(p.by!=='ancient'||p.key.indexOf('pa:')===0)){ownPlace(p);return;}
  if(p.in&&p.kind!=='craft'){placed.push(p.id);return;}   /* the Cross's zones: rooms are SP6 */
  const f=BUILD[p.kind];if(!f){missing.push(p.id);return;}
  try{f(p);}catch(e){reportErr(p.id+': '+(e.stack||e));}});
 // THE PILLAR RIM (SP5): SW highlands station 4's towers, from its site record only (L.pillars, mapped: 30-span-layout.js),
 // drawn here as PROXIES so the post and its stairs have rock under them on Span's own page: core/terrain KSTACKS 'pillar'
 // bodies at each record's place, foot and top (the watch pillar its w x l and turn; a tower 1.4 R wide), their beds core/terrain
 // KSTRATA's 'pillar' recipe, uncontoured and unweathered. The rock as it is drawn is the station's (KSTACKS.contour with
 // keep 12 on the watch pillar); a world that draws both re-fits the watch stair to the station's mesh (KNOWN_ISSUES.md).
 // Only the towers on the page's ground (u to 1800, v from -2400) are drawn
 const PILLARS=[],PDRAWN={};if(L.pillars&&typeof KSTACKS!=='undefined'&&typeof KSTRATA!=='undefined'){const pos=[],col=[],idx=[];
  const ST=SPAN_ROCK.ST;
  // a bed's thickness above y and its hardness, for KSTACKS' pillar (o.strata): up the column until the bed changes
  const strata=(x,y,z)=>{const a=ST.at(x,y,z),b=a.bed,f=a.formation;let h=.25;while(h<60){const q=ST.at(x,y+h,z);if(q.bed!==b||q.formation!==f)break;h+=.25;}return {h:h,hard:a.hard};};
  L.pillars.filter(q=>q.u<=1800&&q.v>=-2400).forEach((q,i)=>{const c=W(q.u,q.v,0),wd=q.w||1.4*q.R;let B=null;
   try{B=KSTACKS.make({kind:'pillar',id:q.id,x:c[0],z:c[2],H:q.top-q.foot,w:wd,l:q.l||wd,ry:q.ry||0,sq:6,taper:q.flat?1-q.flat/Math.min(q.w,q.l):.05,lean:0,y0:q.foot,
    seed:KRAND.hash(2820,9,i),strata:strata});}catch(e){reportErr(q.id+': '+(e.stack||e));return;}
   PILLARS.push(B);const m=KSTACKS.mesh(B,{step:2.5}),o=pos.length/3;
   for(let v=0;v<m.pos.length/3;v++){const s=.5+.5*m.occ[v];pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);col.push(s,s,s);}
   for(const k of m.idx)idx.push(o+k);PDRAWN[q.id]={B,m};
   REGISTER({name:q.name+' (station 4: '+q.site+', '+Math.round(q.top-q.foot)+' m; a proxy)',x:c[0],z:c[2],y:B.y0,r:Math.min(B.R,30),h:B.top-B.y0});placed.push(q.id);});
  const mat=SPAN_ROCK.mat(false);   /* the strata's colour, the library's grain: 45-host-stage.js */
  if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
   g.setIndex(idx);g.computeVertexNormals();const me=new THREE.Mesh(g,mat);
   me.userData.host=true;me.userData.inspectLabel='The pillar rim: proxies of the towers in SW highlands station 4 site record (the station draws the rock)';
   me.userData.probePoints=[].concat(...PILLARS.map(B=>[B.x,(B.y0+B.top)/2,B.z]));   /* flat x,y,z: one sample a body */scene.add(me);}}
 // THE REACH OF A DRAWN PILLAR (Pinnacle Rock's rule: what hangs on a wall follows the wall AS DRAWN, settlements/pinnacle-rock
 // src/43-pr-roosts.js): the weathered mesh's wall vertices binned by angle round the body's middle and by metre of height, each
 // bin the farthest rock; reach(a, y0, y1) the farthest rock over that band of heights within a bin either side
 function reachOf(D){const B=D.B,m=D.m,NA=180,y0=B.y0,NH=Math.ceil(B.top-y0)+2,R=new Float32Array(NA*NH);
  for(let v=0;v<m.part.length;v++){if(m.part[v]!==0)continue;const dx=m.pos[3*v]-B.x,dz=m.pos[3*v+2]-B.z,a=Math.atan2(dz,dx),h=Math.floor(m.pos[3*v+1]-y0);if(h<0||h>=NH)continue;
   const k=((Math.floor((a+PI)/TAU*NA)%NA)+NA)%NA,r=Math.hypot(dx,dz);if(r>R[h*NA+k])R[h*NA+k]=r;}
  // a thick bed's wall rows stand metres apart: a height with no vertex takes the rock between the rows above and below it
  for(let k=0;k<NA;k++){let last=-1;for(let h=0;h<NH;h++){if(!R[h*NA+k])continue;
   if(last<0)for(let j=0;j<h;j++)R[j*NA+k]=R[h*NA+k];else for(let j=last+1;j<h;j++)R[j*NA+k]=R[last*NA+k]+(R[h*NA+k]-R[last*NA+k])*(j-last)/(h-last);last=h;}
   if(last>=0)for(let j=last+1;j<NH;j++)R[j*NA+k]=R[last*NA+k];}
  return (a,ya,yb)=>{const k=((Math.floor((a+PI)/TAU*NA)%NA)+NA)%NA;let r=0;
   for(let h=Math.max(0,Math.floor(ya-y0));h<=Math.min(NH-1,Math.floor(yb-y0));h++)for(let d=-1;d<=1;d++){const x=R[h*NA+(k+d+NA)%NA];if(x>r)r=x;}return r;};}
 // THE STAIRS Dalab keeps (the layout's 'stair' ways that are not a link's: the cliff stair, the watch pillar's): treads cut
 // in the rock (3 m into it behind, so a weathered hollow is filled, not bridged), each with a block of the Dalab set's grey
 // stone on its outer edge (a stepped parapet). The watch pillar's follows the layout's line round the pillar, each tread put
 // just outside the drawn rock at its angle (its inner edge .2 m into the wall over the tread's head height)
 const stone=dCol(DPAL.stone),cut=vC(0xc29c84);
 function treads(w){const P=w.pts,out=[];
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],du=b[0]-a[0],dv=b[1]-a[1],dy=b[2]-a[2],len=Math.hypot(du,dv);if(len<.05)continue;
   const k=Math.max(1,Math.ceil(Math.abs(dy)/.22),Math.ceil(len/.6));for(let j=0;j<k;j++){const t=j/k;out.push([a[0]+du*t,a[1]+dv*t,a[2]+dy*t]);}}
  const e=P[P.length-1];out.push([e[0],e[1],e[2]]);return out;}
 function stairWay(w,T,away){const hw=w.w/2;let n=0;
  for(let i=0;i+1<T.length;i++){const a=T[i],b=T[i+1],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz);if(len<.05)continue;
   let nx=-dz/len,nz=dx/len;const mx=(a[0]+b[0])/2,mz=(a[2]+b[2])/2,r=away(mx,mz);if(nx*(mx-r[0])+nz*(mz-r[1])<0){nx=-nx;nz=-nz;}
   const y=Math.max(a[1],b[1]),ry=Math.atan2(-dz,dx);
   vB('vStone',mx-nx*1.5,y-.5,mz-nz*1.5,len+.04,.5,w.w+3,ry,cut);vB('vStone',mx+nx*(hw-.2),y,mz+nz*(hw-.2),len+.04,.95,.4,ry,stone);n++;}
  placed.push(w.id);return n;}
 const STEPS={};L.ways.filter(w=>w.kind==='stair').forEach(w=>{const P=treads(w);
  if(w.id==='watch_stair'&&PDRAWN[L.pillars[0].id]){const D=PDRAWN[L.pillars[0].id],reach=reachOf(D),B=D.B,hw=w.w/2,Pw=L.pillars[0];
   // each tread's angle round the middle and the rock's reach there; a tread on the top (the head's landing, inside the pillar's
   // plan) stays where the layout puts it. The radius is smoothed along the flight (a running maximum over 13 treads, then
   // their mean over 17), so the flight runs on as one line, never inside the rock, and does not jag tread by tread
   // THE HELIX: the layout's line is a square round the pillar (its spec); the drawn rock is round-cornered, so the flight is
   // drawn as an even helix over the same turn and rise (the line's angles unwrapped, then spaced evenly from its foot to the
   // head), which has no corner to jag
   const on=P.map(p=>Math.max(Math.abs(p[0]-Pw.u),Math.abs(p[1]-Pw.v))<Pw.w/2-1),A=P.map(p=>{const c=W(p[0],p[1],p[2]);return Math.atan2(c[2]-B.z,c[0]-B.x);});
   for(let i=1;i<A.length;i++){while(A[i]-A[i-1]>PI)A[i]-=TAU;while(A[i]-A[i-1]<-PI)A[i]+=TAU;}
   {const ix=[];on.forEach((o,i)=>{if(!o)ix.push(i);});const i0=ix[0],i1=ix[ix.length-1],n=i1-i0,a0=A[i0],a1=A[i1],y0=P[i0][2],y1=P[i1][2];
    for(let i=i0;i<=i1;i++){const f=n?(i-i0)/n:0;A[i]=a0+(a1-a0)*f;P[i]=[P[i][0],P[i][1],y0+(y1-y0)*f];}}
   const R0=P.map((p,i)=>on[i]?0:reach(A[i],p[2]-.3,p[2]+2.4)-.2+hw),R1=R0.map((r,i)=>{let m=r;for(let d=-4;d<=4;d++){const q=R0[i+d];if(q!=null&&!on[i+d]&&q>m)m=q;}return m;});
   const R=R1.map((r,i)=>{let s=0,c=0;for(let d=-8;d<=8;d++){const q=R1[i+d];if(q!=null&&!on[i+d]){s+=q;c++;}}return c?Math.max(R0[i],s/c):r;});
   STEPS[w.id]=stairWay(w,P.map((p,i)=>{const c=W(p[0],p[1],p[2]);return on[i]?[c[0],p[2],c[2]]:[B.x+Math.cos(A[i])*R[i],p[2],B.z+Math.sin(A[i])*R[i]];}),()=>[B.x,B.z]);}
  else STEPS[w.id]=stairWay(w,P.map(p=>{const c=W(p[0],p[1],p[2]);return [c[0],p[2],c[2]];}),(x,z)=>[x-10,z]);});
 TSTAT.cur=null;kbake(scene);
 // the Post-Apoc kit's buildings in one build (generic marks: the highlanders' own wait on who they are; what Dalab raises, the
 // Line and the arena, flies Dalab's red: core/sockets' `dalab` pack, by the site's o.culture). Its furniture pass
 // makes its own core/tags registry as KTAGS.page: the page's is put back after it
 let PA=null;if(PA_SITES.length&&typeof KratorPostApoc!=='undefined'){const keep=KTAGS.page;KratorPostApoc.setError(reportErr);
  try{PA=KratorPostApoc.build(PA_SITES,{culture:'generic'});scene.add(PA);}catch(e){reportErr('post-apoc: '+(e.stack||e));}
  KTAGS.page=keep;
  for(const r of OWN_PLACED)if(r.kit==='post-apoc'){const d=KratorPostApoc.declOf(r.key.slice(3),r.args);r.def=[r.args.L!=null?r.args.L:r.args.w!=null?r.args.w:d.w,r.args.d!=null?r.args.d:d.d];}}
 return {placed,missing,own:OWN_PLACED,pa:PA,pillars:PILLARS,steps:STEPS,ms:Math.round(performance.now()-t0),tags:T};})();
