// prefix: nr
// ================================================================= ANCIENT DECK BUILDINGS: the shared kit
// The deck buildings are Ancient mid-rises (white panelled metal, ribbon balconies, glass, the streamlined forms of the
// arcology's own top deck), drawn by their builders (56, 58, 60) in the building's local frame (origin at the plot
// centre on the top deck, +z the front). Their INSIDES are the interiors kit's: each def names an item of the interior set
// (kits/interiors/sets/noahs-regret.js) whose body is the building's glazing line; the planner (planBuilding) cuts every
// storey into rooms, and nrDrawPlan() draws what it decided: the upper floors with the stair wells cut out, the
// partitions with their door openings, the stairs, the door leaves. The builders draw the outside: plinth, glazing,
// ribbons, roofs. So the rooms the furnishing pass fills (70) are exactly the rooms the walls enclose.
const NR_STOREY=3.35;   // an apartment storey, floor to floor: 3.1 clear + the planner's 0.25 slab
const NR_BUILT=[];      // every deck building placed: {key, x, z, ry, w, d, floors: [hull y]} (the walk floors, 89-nr-views.js)
const NR_PLANS={};      // set item key -> its plan at the origin (IX.sets.instantiate), shared by every building of that item
function nrSetItem(key){const S=KratorInteriors.sets.byName['noahs-regret'];const it=S&&S.byKey[key];if(!it)reportErr('no interior set item '+key);return it;}
function nrPlanOf(key){if(NR_PLANS[key])return NR_PLANS[key];const it=nrSetItem(key);if(!it)return null;
 const inst=KratorInteriors.sets.instantiate(it,0,0,0,{baseY:0,register:false,seed:0,prefix:'tpl.'});
 for(const B of inst.buildings)if(B.report&&B.report.warnings&&B.report.warnings.length)console.warn('plan '+key+': '+B.report.warnings.join('; '));
 return NR_PLANS[key]=inst;}
/* a slab of a planned floor: outline and holes [[x, z], ...], top at y, thickness th (ExtrudeGeometry: top, bottom, edges) */
function nrPlanSlab(mk,poly,holes,y,th,col){const sh=new THREE.Shape(poly.map(p=>new THREE.Vector2(p[0],-p[1])));
 for(const h of (holes||[]))sh.holes.push(new THREE.Path(h.map(p=>new THREE.Vector2(p[0],-p[1]))));
 const g=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false});g.rotateX(-PI/2);g.translate(0,y-th,0);emit(mk,g,null,col);g.dispose();}
/* draw a plan's insides in the current frame: o = {floor, part, stair, door: [mk, colour], skipLevel0} */
function nrDrawPlan(inst,o){o=o||{};const fl=o.floor||['conc',hc(0xbab4a8)],pa=o.part||['plaster',hc(0xe6e0d4)],st=o.stair||['conc',hc(0x9a948a)],dr=o.door||['timber',hc(0x7a5a3e)];
 for(const B of inst.buildings){
  for(const F of B.floors){if(F.level===0)continue;nrPlanSlab(fl[0],F.poly,F.holes,F.y,F.thick||.25,fl[1]);}
  for(const Wl of B.walls){if(Wl.kind!=='partition')continue;const a=Wl.a,b=Wl.b,len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<1e-6)continue;
   const t=[(b[0]-a[0])/len,(b[1]-a[1])/len],ry=Math.atan2(-t[1],t[0]),y0=Wl.y,top=Wl.y+Wl.h;
   const seg=(u0,u1,ya,yb)=>{if(u1-u0<.01||yb-ya<.01)return;const uc=(u0+u1)/2;box(pa[0],a[0]+t[0]*uc,ya,a[1]+t[1]*uc,u1-u0,yb-ya,Wl.thick,pa[1],ry);};
   let u=0;for(const op of Wl.openings.slice().sort((p,q)=>p.u-q.u)){const u0=op.u-op.w/2,u1=op.u+op.w/2;seg(u,u0,y0,top);seg(u0,u1,y0+op.y1,top);if(op.y0>0)seg(u0,u1,y0,y0+op.y0);u=u1;}
   seg(u,len,y0,top);}
  for(const S of B.stairs){if(!S.centre)continue;const d=S.dir;
   if(S.kind==='stair'){const n=S.risers,tread=S.run/Math.max(1,n-1),rise=(S.y1-S.y0)/n;
    for(let i=0;i<n-1;i++){const s=i*tread+tread/2;box(st[0],S.foot[0]+d[0]*s,S.y0,S.foot[1]+d[1]*s,S.w,rise*(i+1),tread,st[1],S.ry);}
    const side=[-d[1],d[0]],a=[S.foot[0]+side[0]*S.w/2,S.y0+.95,S.foot[1]+side[1]*S.w/2],b=[S.top[0]+side[0]*S.w/2,S.y1+.95,S.top[1]+side[1]*S.w/2];beam('paint',a,b,.04,hc(0x5a5a5a),true,6);}
   else{const side=[-d[1],d[0]],L=Math.hypot(S.run,S.y1-S.y0),rungs=Math.floor(L/.3);
    for(const sg of [-1,1])beam('paint',[S.foot[0]+side[0]*sg*S.w/2,S.y0,S.foot[1]+side[1]*sg*S.w/2],[S.top[0]+side[0]*sg*S.w/2,S.y1,S.top[1]+side[1]*sg*S.w/2],.035,hc(0x5a5a5a),true,6);
    for(let i=1;i<rungs;i++){const f=i/rungs;box('paint',S.foot[0]+(S.top[0]-S.foot[0])*f,S.y0+(S.y1-S.y0)*f-.02,S.foot[1]+(S.top[1]-S.foot[1])*f,S.w,.04,.05,hc(0x5a5a5a),S.ry);}}}
  for(const R of B.rooms)for(const dd of R.doors){if(dd.swing==='none'||!dd.leaf||dd.to==='street')continue;
   const left=[-dd.n[1],dd.n[0]],hs=dd.hinge==='right'?-1:1,hx=dd.at[0]+left[0]*hs*dd.w/2,hz=dd.at[1]+left[1]*hs*dd.w/2;
   const dir=dd.swing==='out'?-1:1,ang=75*PI/180,cx=-left[0]*hs,cz=-left[1]*hs,ox=dd.n[0]*dir,oz=dd.n[1]*dir;
   const vx=cx*Math.cos(ang)+ox*Math.sin(ang),vz=cz*Math.cos(ang)+oz*Math.sin(ang),lh=Math.min(dd.h||2.1,R.h-.1)-.02;
   box(dr[0],hx+vx*dd.w/2,R.y+.01,hz+vz*dd.w/2,dd.w-.04,lh,.05,dr[1],Math.atan2(-vz,vx));}}}
/* the planned storeys' floor heights (local y) of a plan */
function nrPlanFloors(inst){const F=[];for(const B of inst.buildings)for(const Lv of B.levels)F.push(Lv.y);return F;}
/* register a placed deck building for the walk floors and the furnishing pass */
function nrBuilt(o,key,itemKey,w,d){const Lt=o.lot;if(!Lt)return;const inst=nrPlanOf(itemKey);
 NR_BUILT.push({key,item:itemKey,lot:Lt.id,use:Lt.use,x:Lt.x,z:Lt.z,ry:Lt.ry,y:Lt.y,w,d,floors:nrPlanFloors(inst).map(y=>Lt.y+y),rec:CURREC});}
/* minor damage: a deterministic few of a building's glass bays are broken and boarded or sheeted by the pirates */
function nrDamaged(n,p){return rng()<p;}
/* a boarded bay: planks or a corrugated sheet nailed over a gap, in the current frame (a quad of width w, height h at
   (x, y, z) facing ry) */
function nrBoard(x,y,z,w,h,ry,sheet){if(sheet){box('corr',x,y,z,w*1.04,h,.05,P('corr'),ry);return;}
 const n=Math.max(2,Math.round(h/.3));for(let i=0;i<n;i++)if(rng()<.85)box('timber',x,y+i*h/n,z,w*(1+rr(-.04,.08)),h/n*.9,.05,P('timber'),ry,0,rr(-.04,.04));}
/* a stadium outline (a rectangle L x D with half-discs on its short ends) offset by e, n points per end */
function nrStadium(L,D,e,n){const r=D/2+e,out=[];n=n||14;
 for(let i=0;i<=n;i++){const a=-PI/2+i/n*PI;out.push([L/2+Math.cos(a)*r,Math.sin(a)*r]);}
 for(let i=0;i<=n;i++){const a=PI/2+i/n*PI;out.push([-L/2+Math.cos(a)*r,Math.sin(a)*r]);}return out;}
/* a closed ribbon band round an outline (x, z points) from y0 to y1, faced outward; a parapet with a top lip */
function nrRibbon(mk,pts,y0,y1,col,th){th=th||.18;const n=pts.length,P2=pts.concat([pts[0]]);
 const len=[0];for(let i=1;i<=n;i++)len.push(len[i-1]+Math.hypot(P2[i][0]-P2[i-1][0],P2[i][1]-P2[i-1][1]));
 const at=u=>{const L=u*len[n];let i=1;while(i<n&&len[i]<L)i++;const f=(L-len[i-1])/Math.max(1e-6,len[i]-len[i-1]);return [lerp(P2[i-1][0],P2[i][0],f),lerp(P2[i-1][1],P2[i][1],f)];};
 const cw=pts.reduce((a,p,i)=>{const q=pts[(i+1)%n];return a+p[0]*q[1]-q[0]*p[1];},0)>0;
 /* the outline's outward side: for a positive area in (x, z) the outward normal is the edge turned -90 degrees */
 const off=(u,e)=>{const a=at(Math.max(0,u-.002)),b=at(Math.min(1,u+.002)),dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=(cw?dz:-dz)/L,nz=(cw?-dx:dx)/L,p=at(u);return [p[0]+nx*e,p[1]+nz*e];};
 const seg=n*2;
 /* psurf's own normal is (along the outline) x (up): inward for a positive-area outline, so the outer face flips then */
 psurf(mk,(u,v)=>{const p=off(u,0);return [p[0],lerp(y0,y1,v),p[1]];},seg,1,col,{flip:cw});
 psurf(mk,(u,v)=>{const p=off(u,-th);return [p[0],lerp(y0,y1,v),p[1]];},seg,1,col,{flip:!cw});
 psurf(mk,(u,v)=>{const p=off(u,-th*v);return [p[0],y1,p[1]];},seg,1,col,{up:true});
 psurf(mk,(u,v)=>{const p=off(u,-th*v);return [p[0],y0,p[1]];},seg,1,col,{flip:!cw});}
/* a box heading whose local x runs along the tangent of a circle at angle a (x = cos a, z = sin a) */
function nrRyTan(a){return Math.atan2(-Math.cos(a),-Math.sin(a));}
/* a flat slab over an outline (convex or not: ShapeGeometry), top at y, thickness th */
function nrOutlineSlab(mk,pts,y,th,col,holes){nrPlanSlab(mk,pts,holes,y,th,col);}
