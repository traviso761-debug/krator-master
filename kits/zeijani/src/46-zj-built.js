// prefix: zb
// ================================================================= THE CONSTRUCTED HOUSES (PLAN.md 6.4): tuff block, the villages' and the satellites'
// Each def's rooms are its interiors item (kits/interiors/sets/zeijani.js): explicit round rooms drawn here round the same
// outlines, or a body the interiors planner divides (zbBody draws its plan: walls with their openings, slabs, stairs).

/* a planned body (the item's `bodies`), drawn on the kit's buckets: exterior walls inside the footprint with their windows and
   doors (a sill and a lintel stone at each window), the partitions, the upper floors' slabs round their stairwells, solid
   stairs. o: {wall, wallCol, part, partCol, slab, stair} */
function zbBody(key,o){o=o||{};const it=zjItem(key);if(!it||!it.bodies)return null;const inst=KratorInteriors.sets.instantiate(it,0,0,0,{register:false,prefix:'draw.'});
 const wm=o.wall||'ashlar',wc=o.wallCol||P('tuff'),sm=o.slab||'plank',stc=P('white');
 for(const B of inst.buildings){
  for(const Wl of B.walls){if(Wl.kind!=='exterior')continue;const dx=Wl.b[0]-Wl.a[0],dz=Wl.b[1]-Wl.a[1],L=Math.hypot(dx,dz);if(L<.1)continue;
   const ux=dx/L,uz=dz/L,ry=Math.atan2(dx,dz),t=Wl.thick||.4,n=Wl.out||[0,0],ox=-n[0]*t/2,oz=-n[1]*t/2,h=Wl.h,cuts=[[0,L]];
   const at=(u,off)=>[Wl.a[0]+ux*u+ox+n[0]*(off||0),Wl.a[1]+uz*u+oz+n[1]*(off||0)];
   for(const q of Wl.openings||[]){const a=q.u-q.w/2,b=q.u+q.w/2;for(let i=cuts.length-1;i>=0;i--){const c=cuts[i];if(b<=c[0]||a>=c[1])continue;cuts.splice(i,1,...[[c[0],a],[b,c[1]]].filter(s=>s[1]-s[0]>.05));}
    const m=at(q.u);if(q.y0>.02)box(wm,m[0],Wl.y,m[1],t,q.y0,q.w,wc,ry);box(wm,m[0],Wl.y+q.y1,m[1],t,h-q.y1,q.w,wc,ry);
    if(q.window){const s_=at(q.u,t/2+.06);box('tuffPol',s_[0],Wl.y+q.y0-.1,s_[1],.22,.1,q.w+.3,stc,ry);box('tuffPol',s_[0],Wl.y+q.y1,s_[1],.2,.22,q.w+.4,stc,ry);}}
   for(const c of cuts){const m=at((c[0]+c[1])/2);box(wm,m[0],Wl.y,m[1],t,h,c[1]-c[0],wc,ry);}}
  /* the upper floors: a slab 0.25 thick, 5 cm inside the footprint, round each stairwell (rectangular plans) */
  for(const F of B.floors){if(!F.level)continue;const xs=F.poly.map(p=>p[0]),zs=F.poly.map(p=>p[1]);let R=[[Math.min(...xs)+.05,Math.max(...xs)-.05,Math.min(...zs)+.05,Math.max(...zs)-.05]];
   for(const H of F.holes||[]){const hx=H.map(p=>p[0]),hz=H.map(p=>p[1]),h0=Math.min(...hx),h1=Math.max(...hx),k0=Math.min(...hz),k1=Math.max(...hz),out=[];
    for(const r of R){if(h1<=r[0]||h0>=r[1]||k1<=r[2]||k0>=r[3]){out.push(r);continue;}
     out.push([r[0],r[1],r[2],Math.max(r[2],k0)],[r[0],r[1],Math.min(r[3],k1),r[3]],[r[0],Math.max(r[0],h0),Math.max(r[2],k0),Math.min(r[3],k1)],[Math.min(r[1],h1),r[1],Math.max(r[2],k0),Math.min(r[3],k1)]);}
    R=out.filter(r=>r[1]-r[0]>.02&&r[3]-r[2]>.02);}
   for(const r of R)box(sm,(r[0]+r[1])/2,F.y-.25,(r[2]+r[3])/2,r[1]-r[0],.25,r[3]-r[2],P('wood'));}
  for(const S of B.stairs){if(S.kind!=='stair')continue;const n=S.risers||Math.round((S.y1-S.y0)/.18),tr=S.run/n,rs=(S.y1-S.y0)/n,ry=Math.atan2(S.dir[0],S.dir[1]);
   for(let i=0;i<n;i++)box(o.stair||'ashlar',S.foot[0]+S.dir[0]*(i+.5)*tr,S.y0,S.foot[1]+S.dir[1]*(i+.5)*tr,S.w,(i+1)*rs,tr+.01,P('tuffDark'),ry);}
  zwPartitions(key,o.part||'plaster',o.partCol||P('plaster'));}
 return inst;}

/* a domed room of tuff blocks: plinth, wall to y1 with a doorway at angle da, a corbelled dome (its inside plastered), a stepped
   lintel over the door; r the room's inner radius */
function zbDomeRoom(cx,cz,r,da,o){o=o||{};const R=r+.25,g=zwGap(R,o.dw||.9),c=P('tuff'),y1=o.y1||2.15;
 cyl('ashlar',cx,0,cz,R+.2,.15,P('tuffDark'),24);
 zfDrum('ashlar',cx,.15,cz,R,y1-.15,c,{a0:da+g,a1:da+TAU-g,seg:26});zfDrum('plaster',cx,.15,cz,r,y1-.15,P('plaster'),{a0:da+g,a1:da+TAU-g,seg:26,inward:true});
 sector('ashlar',cx,cz,r,R,da+g-.03,da+g,.15,y1,c);sector('ashlar',cx,cz,r,R,da-g,da-g+.03,.15,y1,c);
 zfDome('ashlar',cx,y1,cz,R,(o.rise||2.0),c,{hole:o.hole,seg:26,rows:8});zfDome('plaster',cx,y1,cz,r,(o.rise||2.0)-.22,P('plaster'),{hole:o.hole,seg:26,rows:8,inward:true});
 const dx=Math.cos(da),dz=Math.sin(da),ry=Math.atan2(dx,dz),px=cx+dx*(R+.05),pz=cz+dz*(R+.05);
 W(px,0,pz,ry,()=>{for(const s of [-1,1])box('tuffPol',s*.55,.15,.02,.22,1.95,.34,P('white'));zfStepLintel('tuffPol',0,2.1,.06,1.0,P('white'),{n:2,h:.2,d:.34});});
 if(o.hole)smokeAt(cx,y1+(o.rise||2)+.1,cz,{r:.12});}

/* 1 poor: one round room under a corbelled dome with a smoke hole; a hide over the door */
defBuilding({key:'zj_house_built_poor',name:'Domed tuff hut',seed:4501,cut:true,tags:{types:['dwelling-single'],wealth:'poor',style:'constructed',rock:'tuff'},w:8,d:8,h:4.5,
 build(o){zbDomeRoom(0,0,2.45,ZF_FRONT,{hole:.3,rise:1.9});quad('hide',0,1.05,2.72,.9,1.8,P('hide'));door(0,.15,2.7,0,.9);
  FURNISH('zeijani_olla',1.6,0,2.9,0,{v:0,setting:'outdoor'});FURNISH('zeijani_drying_trays',-2.6,0,2.2,.5,{setting:'outdoor'});}});

/* 2 middle: three domes round a walled yard, the gate on the street */
defBuilding({key:'zj_house_built_mid',name:'Three domes round a yard',seed:4502,cut:true,tags:{types:['dwelling-single'],wealth:'middle',style:'constructed',rock:'tuff'},w:16,d:11,h:4.5,
 build(o){const c=P('tuff'),w=.3,H=1.8;
  zbDomeRoom(0,-2.9,2.35,ZF_FRONT,{rise:1.8});zbDomeRoom(-5.4,2.5,2.35,0,{rise:1.7});zbDomeRoom(5.4,2.5,2.35,PI,{rise:1.7,hole:.25});
  box('paving',0,0,2.5,5.6,.02,5.6,P('tuffDark'));
  /* the yard's walls on its outline, gaps at the gate and the three doors; a coping and a painted band */
  const seg=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),ry=Math.atan2(x1-x0,z1-z0),mx=(x0+x1)/2,mz=(z0+z1)/2;box('ashlar',mx,0,mz,w,H,L,c,ry);box('tuffPol',mx,H,mz,w+.12,.1,L+.12,P('white'),ry);};
  seg(-2.8,5.3,-.7,5.3);seg(.7,5.3,2.8,5.3);seg(-2.8,-.3,-.45,-.3);seg(.45,-.3,2.8,-.3);
  for(const s of [-1,1]){seg(s*2.8,-.3,s*2.8,2.05);seg(s*2.8,2.95,s*2.8,5.3);}
  for(const s of [-1,1])box('tuffPol',s*.72,0,5.3,.24,2.3,.42,P('white'));zfStepLintel('tuffPol',0,2.3,5.3,1.5,P('white'),{n:2,h:.22,d:.42});
  box('plain',0,1.5,5.46,4.0,.08,.02,P('turquoise'));zfLeaf(0,.02,5.15,1.2,2.2,P('wood'),.9);door(0,0,5.3,0,1.2);
  FURNISH('zeijani_olla',3.6,0,6.0,0,{v:1,setting:'outdoor'});FURNISH('zeijani_stone_bench',-4.2,0,6.0,0,{setting:'outdoor'});}});

/* 3 wealthy: two storeys of tuff ashlar (the interiors planner's plan), a frieze at the floor line, a stepped doorway; a flat
   roof as a terrace: a parapet with stepped merlons, a dome over the middle, an awning, a few pieces */
defBuilding({key:'zj_house_built_rich',name:'Two-storey house with a roof terrace',seed:4503,cut:true,tags:{types:['dwelling-single'],wealth:'rich',style:'constructed',rock:'tuff'},w:12,d:10,h:9.5,
 build(o){const c=P('tuff'),wt=P('white'),inst=zbBody('zj_house_built_rich',{wall:'ashlar',wallCol:c});const B=inst&&inst.buildings[0],RY=B?B.roof.y:6.35;
  box('ashlar',0,0,0,10.4,.3,8.4,P('tuffDark'));box('paving',0,.3,0,9.1,.02,7.1,P('tuffDark'));zfSteps('ashlar',0,.3,4.2,1.6,2,P('tuffDark'),.15,.32);
  /* the doorway (the planner's street door: 1.2 wide, 2.1 high), the frieze band at the floor line, corner pilasters */
  for(const s of [-1,1])box('tuffPol',s*.74,.3,4.06,.26,2.1,.16,wt);zfStepLintel('tuffPol',0,2.4,4.1,1.6,wt,{n:3,h:.22,d:.24});zfLeaf(0,.3,3.85,1.2,2.1,P('wood'),-.4);
  for(const [x,z,ry,L] of [[0,4.04,0,10.16],[0,-4.04,PI,10.16],[5.04,0,PI/2,8.16],[-5.04,0,-PI/2,8.16]]){W(x,0,z,ry,()=>{box('tuffPol',0,3.0,0,L,.62,.1,wt);});}
  zfBand('patFrieze',0,3.04,4.1,10.0,.54,0,wt);zfBand('patFrieze',0,3.04,-4.1,10.0,.54,PI,wt);
  for(const sx of [-1,1])for(const sz of [-1,1])box('tuffPol',sx*4.9,.3,sz*3.9,.44,RY-.3,.44,wt);
  /* the roof: a slab, a parapet with stepped merlons, a dome over the middle on a low drum, an awning on poles over the front */
  box('ashlar',0,RY,0,9.9,.25,7.9,c);const top=RY+.25;
  for(const [x,z,w,d] of [[0,3.8,10,.4],[0,-3.8,10,.4],[4.8,0,.4,7.2],[-4.8,0,.4,7.2]])box('ashlar',x,top,z,w,.7,d,c);
  for(let i=0;i<9;i++){const x=-4.4+i*1.1;for(const z of [-3.8,3.8]){box('tuffPol',x,top+.7,z,.5,.22,.44,wt);box('tuffPol',x,top+.92,z,.26,.18,.44,wt);}}
  for(let i=0;i<6;i++){const z=-3.0+i*1.2;for(const x of [-4.8,4.8]){box('tuffPol',x,top+.7,z,.44,.22,.5,wt);box('tuffPol',x,top+.92,z,.44,.18,.26,wt);}}
  zfDrum('ashlar',0,top,-.6,2.3,.6,c,{seg:28});cyl('ashlar',0,top+.6,-.6,2.38,.12,wt,28);zfDome('plaster',0,top+.72,-.6,2.3,1.7,P('plaster'),{seg:28,rows:9});
  cyl('copper',0,top+2.42,-.6,.12,.35,P('copper'),8);
  for(const x of [-3.6,3.6])cyl('log',x,top,2.9,.07,2.2,P('woodD'),7);plane4('felt',[-4.2,top+2.2,1.7],[4.2,top+2.2,1.7],[-4.2,top+2.0,3.3],.04,P('alecap'));
  FURNISH('zeijani_stone_bench',-2.4,top,2.6,0,{setting:'outdoor'});FURNISH('zeijani_olla',3.6,top,-2.9,0,{v:1,setting:'outdoor'});FURNISH('zeijani_drying_trays',-3.4,top,-2.4,PI/2,{setting:'outdoor'});
  door(0,.3,4,0,1.2);}});
