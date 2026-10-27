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
 // Dalab's own (SP4 takes the Dalab set: settlements/dalab's registry, read in place): boxes at their footprints till then
 function dalabStandIn(p){const s=p.shape,b=SPAN.bbox(s),y0=p.in?SPAN.byId(L)[p.in].y+SPAN.byId(L)[p.in].h:p.y,h=Math.max(2,p.h);
  if(p.kind==='mound'){const w=W(s[1],s[2],y0),G=new THREE.Group();G.position.set(w[0],w[1],w[2]);scene.add(G);
   mesh(new THREE.CylinderGeometry(s[3]*.45,s[3],h,32,1).translate(0,h/2,0),MAT.mud||MAT.rock,G);}
  else if(p.kind==='wall'){for(let v=b[2];v<b[3];v+=6)box(KRAND.unit(KRAND.hash(seedOf(p),v|0))<.5?'plateR':'boxCR',b[0],b[1],v,v+5.6,y0,y0+h*(.75+.25*KRAND.unit(KRAND.hash(seedOf(p),v|0,2))));}
  else box('boxC',b[0],b[1],b[2],b[3],y0,y0+h,new THREE.Color(0xc9a27a));
  placed.push(p.id);}
 const t0=performance.now();
 L.parts.forEach(p=>{if(p.by==='dalab'){dalabStandIn(p);return;}
  if(p.in&&p.kind!=='craft'){placed.push(p.id);return;}   /* the Cross's zones: rooms are SP6 */
  const f=BUILD[p.kind];if(!f){missing.push(p.id);return;}
  try{f(p);}catch(e){reportErr(p.id+': '+(e.stack||e));}});
 TSTAT.cur=null;kbake(scene);
 return {placed,missing,ms:Math.round(performance.now()-t0),tags:T};})();
