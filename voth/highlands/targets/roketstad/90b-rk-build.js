// ================================================================= ROKETSTAD — the build: civic plots, the street frontages, the infill, the gate suburbs,
// the spaceport, the farms, the forest, the bakes
// Order: the reserved plots (88) first, then the frontage along every street wealthy-to-poor away from the squares, then
// the infill behind it; outside the gates the suburbs; then the spaceport rise; then the farms along the N and S
// highways; then the forest on everything left; then one bake per store. Most of the town is RECLAIMED (Travis: "use
// predominately reclaimed versions in this build") — kitKey() in 88 picks a def's `_reclaimed` twin where the kit has one.
const BUILD_T0=performance.now();
const VERN_PLACED=[];
const LANDMARKS=[];
const rki=(a,b)=>a+Math.floor(rng()*(b-a+1));
// adopt a landmark name onto the biggest REG volume the building registered
function landmark(name,r0,o){LANDMARKS.push({name,x:o.x,z:o.z});let best=null;for(let i=r0;i<REG.length;i++){const r=REG[i];if(!best||r.r>best.r)best=r;}
 if(best){best.name=name;best.tags=Object.assign({},best.tags||{},{landmark:true});}}
// a vernacular building at a plot. The footprint is the def's; the plot is levelled under anything big or civic
function placeVern(key,o,opt){opt=opt||{};const D=VERN.defs[key];if(!D){reportErr('no def '+key);return null;}const sc=opt.scale||1;o.hx=D.w/2*sc;o.hz=D.d/2*sc;
 let y=opt.y!=null?opt.y:groundY(o);
 if(opt.level||D.tags.wealth==='civic'||D.w*D.d>300||plotFall(o)>1.6){y=opt.y!=null?opt.y:(terrainH(o.x,o.z)+groundY(o))/2;cityFlat(o.x,o.z,Math.hypot(o.hx,o.hz)*.95,8,y+.06);}
 TSTAT.cur=key+'/'+(opt.v|0);const r0=REG.length;let G=null;
 try{G=VERN.place(scene,key,o.x,o.z,o.ry,{v:opt.v|0,scale:sc,y});}catch(e){reportErr(key+' '+e.stack);}
 TSTAT.cur=null;if(opt.landmark)landmark(opt.landmark,r0,o);
 if(!opt.noOcc){o.built=key;if(o.id==null)occAdd(o);}VERN_PLACED.push({key,o});return G;}
// ---------------------------------------------------------------- 1. the reserved plots: civic buildings, the guilds, the forge district
(function buildPlots(){reseed(SEED_RK+10);for(const P of PLOTS){placeVern(P.key,P.o,{landmark:P.opt.landmark,level:true,v:Math.floor(rng()*4)});}
 window._plots=PLOTS.length;})();
// ---------------------------------------------------------------- 2. the street frontages
// wealth falls with distance from the squares (squareD); the forge district trades in smithies and workshops; a gate
// brings taverns and warehouses. Everything with a reclaimed twin goes reclaimed 78% of the time (kitKey).
const HOUSES={0:['hl_rep_house_poor_a','hl_rep_house_poor_b','hl_rep_house_poor_c'],1:['hl_rep_house_mid_a','hl_rep_house_mid_b','hl_rep_house_mid_c'],2:['hl_rep_house_rich_a','hl_rep_house_rich_b','hl_rep_house_rich_c']};
const TAVERNS=['hl_rep_tavern_a','hl_rep_tavern_b','hl_rep_tavern_c'];
function gateD(x,z){let d=1e9;for(const [,g] of GATE_LIST){const p=gatePos(g);d=Math.min(d,Math.hypot(x-p[0],z-p[1]));}return d;}
function pickTown(x,z,r){const d=squareD(x,z),gd=gateD(x,z),forge=inForge(x,z),w=rng();
 const isMain=r&&(r.cls===KL.main||r.cls===KL.highway);
 let wealth=d<45?(w<.55?2:1):d<120?(w<.2?2:w<.8?1:0):d<200?(w<.45?1:0):(w<.85?0:1);
 if(forge&&wealth===2)wealth=1;
 let com=d<50?.42:isMain?.34:.14;if(gd<90)com+=.18;if(forge)com+=.35;
 if(rng()<com){const c=rng();
  if(forge){if(c<.4)return{key:'hl_rep_smithy_small'};if(c<.6)return{key:vPick(['hl_rep_workshop_a','hl_rep_workshop_b'])};if(c<.72)return{key:vPick(['hl_rep_warehouse_a','hl_rep_warehouse_b'])};if(c<.82)return{key:vPick(TAVERNS)};return{key:'hl_rep_shops'};}
  if(gd<90&&c<.35)return{key:rng()<.5?vPick(['hl_rep_warehouse_a','hl_rep_warehouse_b']):vPick(TAVERNS)};
  if(c<.52)return{key:'hl_rep_shops'};if(c<.68)return{key:vPick(TAVERNS)};if(c<.88)return{key:vPick(['hl_rep_workshop_a','hl_rep_workshop_b'])};return{key:'hl_rep_smithy_small'};}
 return{key:vPick(HOUSES[wealth]),v:Math.floor(rng()*6)};}
// ---- the row builder (Travis: "align walls and rooflines like an organically grown medieval city")
// A street is walked as a few long straight RUNS (its polyline simplified), and each side of a run is filled with a
// continuous row: every front wall flush on one building line just behind the street's edge, every building square to
// the run (no jitter), neighbours all but touching (a party-wall gap of .2–.7 m), and the row made of short RUNS of one
// house type (2–5 in a row, varied only by variant) so the eaves and ridges carry through. Where the street bends the
// row breaks and a new one starts on the next run — the way a medieval street front steps round a curve.
function simplifyPath(P,tol){if(P.length<3)return P.slice();let best=-1,bi=0;const a=P[0],b=P[P.length-1],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1;
 for(let i=1;i<P.length-1;i++){const d=Math.abs((P[i][0]-a[0])*dz-(P[i][1]-a[1])*dx)/L;if(d>best){best=d;bi=i;}}
 if(best<=tol)return[a,b];const l=simplifyPath(P.slice(0,bi+1),tol),r=simplifyPath(P.slice(bi),tol);return l.slice(0,-1).concat(r);}
const ROW_STAT={rows:0,runs:0};
function frontageAlong(pts,roadW,pick,test,st,opt){opt=typeof opt==='number'?{gapK:opt}:(opt||{});const gapK=opt.gapK||1,sides=opt.sides||[-1,1];
 const P=simplifyPath(pts,opt.tol==null?2.2:opt.tol);
 for(let sg=0;sg<P.length-1;sg++){const ax=P[sg][0],az=P[sg][1],bx=P[sg+1][0],bz=P[sg+1][1];const L=Math.hypot(bx-ax,bz-az);if(L<9)continue;
  const ux=(bx-ax)/L,uz=(bz-az)/L,nx=-uz,nz=ux;
  for(const side of sides){let s=rr(.3,2.5),run=null;const line=roadW/2+(opt.setback==null?1.45:opt.setback);ROW_STAT.rows++;
   const ry=Math.atan2(-nx*side,-nz*side);   // front (+z) to the street
   while(s<L-3){if(!run||run.left<=0){const cx=ax+ux*(s+6)+nx*side*(line+6),cz=az+uz*(s+6)+nz*side*(line+6);run={pk:pick(cx,cz),left:rki(2,5)};ROW_STAT.runs++;}
    const key=kitKey(run.pk.key);const D=VERN.defs[key];if(!D){run=null;s+=4;continue;}
    if(s+D.w>L+.5*gapK){if(run.tried){break;}run={pk:pick(ax+ux*s,az+uz*s),left:1,tried:1};continue;}   // does not fit what is left of the run: one narrower try, then the corner
    const along=s+D.w/2,off=line+D.d/2;const o={x:ax+ux*along+nx*side*off,z:az+uz*along+nz*side*off,hx:D.w/2,hz:D.d/2,ry,pad:.15};
    if(!test(o)){st.ground++;s+=2.5;run=null;}
    else if(!occFree(o,.15)){st.occ++;s+=2.5;run=null;}
    else{const v=run.pk.v==null?undefined:(run.pk.v+run.left)%6;placeVern(key,o,{v});st.placed++;run.left--;
     // a row closes up (party walls), a lane or a yard opens now and then; out in the suburbs the rows loosen
     s+=D.w+(rng()<.12*gapK?rr(3,7):rr(.2,.7)*gapK);}}}}}
(function frontage(){reseed(SEED_RK+11);const F={placed:0,ground:0,occ:0};
 const test=o=>groundOK(o,{town:true,margin:14});
 // 1. the squares first: a closed ring of the best houses and shops round each, fronts on the square
 for(const k in SQUARES){const S=SQUARES[k];const n=Math.max(8,Math.round(TAU*(S.r+2)/24));const ring=[];for(let i=0;i<=n;i++){const t=i/n*TAU;ring.push([S.x+(S.r+.5)*Math.cos(t),S.z+(S.r+.5)*Math.sin(t)]);}
  frontageAlong(ring,0,(x,z)=>{const w=rng();return w<.4?{key:'hl_rep_shops'}:w<.55?{key:vPick(TAVERNS)}:{key:vPick(HOUSES[w<.8?2:1]),v:Math.floor(rng()*6)};},test,F,{sides:[-1],tol:0,setback:1.2});}
 // 2. the main roads and the highways inside the wall (their frontages are the town's best), then the fabric
 const order=ROADS.filter(r=>insideWall(r.pts[0][0],r.pts[0][1],-4)||insideWall(r.pts[r.pts.length-1][0],r.pts[r.pts.length-1][1],-4))
  .filter(r=>r.zone!=='farmlane'&&!(r.zone||'').startsWith('port')&&!/-out$/.test(r.zone||''))
  .sort((a,b)=>(a.cls-b.cls));
 for(const r of order)frontageAlong(r.pts,r.w,(x,z)=>pickTown(x,z,r),test,F);
 window._frontage=Object.assign(F,ROW_STAT);})();
// ---------------------------------------------------------------- 3. the infill: yards and back-lot houses on a footpath to their street
(function infill(){reseed(SEED_RK+12);let n=0;
 for(let x=TC.x-TC.R-30;x<=TC.x+TC.R+30;x+=9)for(let z=TC.z-TC.R-30;z<=TC.z+TC.R+30;z+=9){const jx=x+rr(-3,3),jz=z+rr(-3,3);if(!insideWall(jx,jz,20))continue;if(!canBuild(jx,jz)||inPrecinct(jx,jz,2))continue;
  const nr=nearestRoadPt(jx,jz,null,60);if(!nr||nr.d>40)continue;
  const pk=pickTown(jx,jz,null);if(pk.key==='hl_rep_shops')pk.key=vPick(HOUSES[0]);const key=kitKey(pk.key);const D=VERN.defs[key];if(!D)continue;
  const ry=Math.atan2(nr.x-jx,nr.z-jz)+rr(-.06,.06);const o={x:jx,z:jz,hx:D.w/2,hz:D.d/2,ry,pad:1.3};
  if(groundOK(o,{town:true,margin:14})&&occFree(o,1.5)){placeVern(key,o,{v:pk.v});n++;
   if(nr.d>o.hz+3){const f=loc(jx,jz,0,o.hz+.5,ry);cstroke(cg,[[f[0],f[1]],[nr.x,nr.z]],2,'#7e6e58');cstroke(kg,[[f[0],f[1]],[nr.x,nr.z]],2,KLCOL(KL.lane));}}}
 window._infill=n;})();
// ---------------------------------------------------------------- 4. outside the gates: a straggle of poor houses, an inn, shops; the port road has more, and scrap smithies
(function suburbs(){reseed(SEED_RK+13);const S={};
 for(const [name] of GATE_LIST){const H=HIGHWAY[name];const east=name==='E';const reach=east?420:170;let acc=0;const pts=[H.gout];
  for(const p of H.out){const q=pts[pts.length-1];acc+=Math.hypot(p[0]-q[0],p[1]-q[1]);pts.push(p);if(acc>reach)break;}
  let inn=0,shops=0,smith=0;const st={placed:0,ground:0,occ:0};
  const pick=(x,z)=>{const w=rng();if(!inn){inn=1;return{key:'hl_rep_inn'};}
   if(east&&smith<6&&w<.28){smith++;return{key:'hl_rep_smithy_small'};}
   if(shops<(east?4:2)&&w<.5){shops++;return{key:rng()<.7?'hl_rep_shops':vPick(TAVERNS)};}
   if(w<.56)return{key:vPick(['hl_rep_workshop_a','hl_rep_workshop_b'])};
   return{key:vPick(HOUSES[0]),v:Math.floor(rng()*6)};};
  frontageAlong(pts,10,pick,o=>groundOK(o,{outside:true}),st,{gapK:east?2.2:4,setback:2.5});S[name]=st.placed;}
 window._suburbs=S;})();
// ---------------------------------------------------------------- 5. the spaceport rise
// The Ancients' builders run at a scaled group on the port table (flat ground inside the builder, REG adopted to world
// space). Four launch sites stand EMPTY (the arcologies went); the fifth never launched and lies in ruin. The Starport
// in the middle of the pentagon, fuel centres between the pads, tanks, helipads, scrapyards and scrap smithies.
function placeAnc(fn,name,x,z,y,s,ry,args,tags){const G=new THREE.Group();G.position.set(x,y,z);G.rotation.y=ry;G.scale.setScalar(s);scene.add(G);G.updateMatrix();
 const r0=REG.length;KOFF=[0,0,0];useGroupXF(G);TSTAT.cur='anc_'+name;HOLES=1;
 try{withFlatGround(()=>fn.apply(null,[G,0,0].concat(args)));}catch(e){reportErr(name+' '+e.stack);}endGroupXF();KOFF=[0,0,0];TSTAT.cur=null;
 for(const n of['trunk','leafCard'])if(KIT.items[n]){}   // (the builders' own flora stays: the forest has taken the port back)
 for(let i=r0;i<REG.length;i++){const r=REG[i];const p=loc(x,z,r.x*s,r.z*s,ry);r.x=p[0];r.z=p[1];r.y=y+(r.y||0)*s;r.r*=s;r.h*=s;r.cls='building';r.key='anc_'+name;
  r.tags=Object.assign({culture:'ancients',state:'ruined',wealth:'poor',lit:false},r.tags||{},tags||{});}
 // one label per Ancient site: its parts stay inspectable but are not labelled
 let big=null;for(let i=r0;i<REG.length;i++)if(!big||REG[i].r>big.r)big=REG[i];for(let i=r0;i<REG.length;i++)if(REG[i]!==big)REG[i].cls='part';
 return G;}
kdef('rkTank',new THREE.CylinderGeometry(1,1,1,20,1),MAT.iron);kdef('rkTankCap',new THREE.SphereGeometry(1,16,6,0,TAU,0,Math.PI/2),MAT.iron);
kdef('rkSlab',VBOX,MAT.concrete);
const PORTX={pads:[],fuel:[],tanks:[],helis:[],yards:[]};
function portOK(o,grow){const pts=obbCorners(o,grow||0);pts.push([o.x,o.z]);
 for(const p of pts){if(Math.hypot(p[0]-PC.x,p[1]-PC.z)>PC.top-12)return false;if(klass(p[0],p[1])!==KL.port)return false;if(inPrecinct(p[0],p[1],6))return false;}return true;}
function portSpot(hx,hz,tx,tz,R){for(let r=0;r<=R;r+=8){const n=Math.max(1,Math.round(TAU*r/8));for(let i=0;i<n;i++){const a=i/n*TAU+r*.3;const x=tx+r*Math.cos(a),z=tz+r*Math.sin(a);
  const o={x,z,hx,hz,ry:Math.atan2(PC.x-x,PC.z-z),pad:2};if(portOK(o,2)&&occFree(o,2))return o;}}return null;}
(function spaceport(){reseed(SEED_RK+20);const y=PORT_Y;
 // the pentagon: vertex 0 (east, against the mountains) is the one that never launched
 for(const P of PENT){const ruined=P.k===0;const ry=P.a+Math.PI/2;
  placeAnc(buildLaunch,ruined?'launch_ruined':'launch_pad',P.x,P.z,y,PC.s,ry,ruined?[1]:[1,true],{landmark:true,type:['spaceport']});
  const R=REG.slice().reverse().find(r=>r.cls==='building'&&r.key&&r.key.startsWith('anc_launch'));if(R){R.name=ruined?'Launch Arcology — the one that never flew':'Launch site '+'VWXYZ'[P.k]+' — empty pad';R.tags.landmark=true;}
  occAdd({x:P.x,z:P.z,hx:PAD_R*.8,hz:PAD_R*.8,ry:0,pad:0});BIO_OBSTACLES.push({x:P.x,z:P.z,r:PAD_R*(ruined?.9:.7)});PORTX.pads.push(P);}
 // the Starport in the middle
 placeAnc(buildStarport,'starport',PC.x,PC.z,y,PC.starS,Math.PI,[1],{landmark:true,type:['spaceport']});
 {const R=REG.slice().reverse().find(r=>r.cls==='building'&&r.key==='anc_starport');if(R){R.name='The Starport (ruined)';R.tags.landmark=true;}}
 occAdd({x:PC.x,z:PC.z,hx:PORTR.star*.72,hz:PORTR.star*.72,ry:0,pad:0});BIO_OBSTACLES.push({x:PC.x,z:PC.z,r:PORTR.star*.8});
 // fuel centres: between pads 1-2 and 4-0 and 0-1 (the far side of the pentagon)
 for(const [i,j] of[[0,1],[4,0],[1,2]]){const A=PENT[i],B=PENT[j];const mx=(A.x+B.x)/2,mz=(A.z+B.z)/2,a=Math.atan2(mz-PC.z,mx-PC.x);const x=PC.x+(PC.P+30)*Math.cos(a),z=PC.z+(PC.P+30)*Math.sin(a);
  const s=.55,o={x,z,hx:60*s,hz:60*s,ry:0,pad:2};if(!portOK(o)||!occFree(o,2))continue;
  placeAnc(buildFuelStation,'fuel',x,z,y,s,a+Math.PI/2,[1],{type:['spaceport','fuel']});occAdd(o);PORTX.fuel.push(o);BIO_OBSTACLES.push({x,z,r:34});}
 // storage tank farms: clusters of big rusted cylinders, a pipe rack between them
 const tankCol=()=>hC(vPick([0x8a5a3a,0x7a6a58,0x9a8a74,0x6a4a34,0xa89880]));
 for(let k=0;k<6;k++){const a=rr(0,TAU),r=rr(PORTR.ring+40,PC.top-60);const o0=portSpot(26,20,PC.x+r*Math.cos(a),PC.z+r*Math.sin(a),60);if(!o0)continue;occAdd(o0);PORTX.tanks.push(o0);
  const n=rki(3,6);const R=rr(5,8.5);for(let i=0;i<n;i++){const lx=(i%3-1)*R*2.3,lz=(Math.floor(i/3)-.5)*R*2.3;const p=loc(o0.x,o0.z,lx,lz,o0.ry);const H=rr(10,19),c=tankCol();
   const tilt=rng()<.18;const q=tilt?qEuler(rr(-.12,.12),0,rr(-.12,.12)):null;
   kput('rkSlab',[p[0],y+.25,p[1]],null,[R*2.3,.5,R*2.3],hC(0x8a8478));kput('rkTank',[p[0],y+.5+H/2,p[1]],q,[R,H,R],c);
   if(!tilt)kput('rkTankCap',[p[0],y+.5+H,p[1]],null,[R,R*.35,R],c);}
  const a2=loc(o0.x,o0.z,-R*2.4,R*1.6,o0.ry),b2=loc(o0.x,o0.z,R*2.4,R*1.6,o0.ry);kput('rkTank',[(a2[0]+b2[0])/2,y+3,(a2[1]+b2[1])/2],qEuler(0,o0.ry,Math.PI/2),[.5,R*4.8,.5],hC(0x5a4a3a));
  REG.push({name:'Ancient storage tanks',x:o0.x,y,z:o0.z,r:26,h:22,cls:'building',key:'rk_tanks',tags:{culture:'ancients',type:['spaceport','storage'],state:'ruined',wealth:'poor',lit:false}});BIO_OBSTACLES.push({x:o0.x,z:o0.z,r:28});}
 // helipads: painted circles on concrete aprons
 for(let k=0;k<7;k++){const a=rr(0,TAU),r=rr(PORTR.ring+20,PC.top-40);const o=portSpot(13,13,PC.x+r*Math.cos(a),PC.z+r*Math.sin(a),50);if(!o)continue;occAdd(o);PORTX.helis.push(o);
  kput('rkSlab',[o.x,y+.15,o.z],qEuler(0,o.ry,0),[26,.3,26],hC(0xa09a8c));
  cdisc(cg,o.x,o.z,11,'#b4ae9e');cg.lineWidth=1.2*PXS;cg.strokeStyle='#d8c060';cg.beginPath();cg.arc(px(o.x),px(o.z),9*PXS,0,7);cg.stroke();
  cg.save();cg.translate(px(o.x),px(o.z));cg.rotate(-o.ry);cg.fillStyle='#e8e0cc';const u=PXS;cg.fillRect(-4*u,-5*u,1.6*u,10*u);cg.fillRect(2.4*u,-5*u,1.6*u,10*u);cg.fillRect(-4*u,-.8*u,8*u,1.6*u);cg.restore();
  REG.push({name:'Helipad (ancient)',x:o.x,y,z:o.z,r:13,h:2,cls:'building',key:'rk_heli',tags:{culture:'ancients',type:['spaceport'],state:'ruined',wealth:'poor',lit:false}});BIO_OBSTACLES.push({x:o.x,z:o.z,r:14});}
 // scrapyards: heaps of sorted scrap, a fence of plates; small scrap smithies working them
 const heap=(x,z,items,n,r)=>{const MH=r*.42;hnRCHeap(x,y,z,r*1.05,MH,hC(vPick([0x5a4a3e,0x6a5040,0x4a4038])),0);
  for(let i=0;i<n;i++){const a=rng()*TAU,d=Math.sqrt(rng())*r*.9,sy=y+Math.max(0,MH*(1-d/(r*1.05))-.12);const it=vPick(items);
   if(it==='vPipeR')kput('vPipeR',[x+Math.cos(a)*d,sy+.05,z+Math.sin(a)*d],qEuler(Math.PI/2+rr(-.3,.3),rng()*TAU,0),[rr(.08,.2),rr(1.5,3),rr(.08,.2)],null);
   else kput(it,[x+Math.cos(a)*d,sy+.04,z+Math.sin(a)*d],qEuler(0,rng()*TAU,0).multiply(qEuler(-Math.PI/2+rr(-.25,.25),0,0)),[rr(1,2.2),rr(.8,1.6),1],null);}};
 for(let k=0;k<5;k++){const P=PENT[(k+2)%5];const a=Math.atan2(P.z-PC.z,P.x-PC.x)+(k%2?.34:-.34);const r=rr(PC.P-40,PC.P+60);
  const o=portSpot(24,18,PC.x+r*Math.cos(a),PC.z+r*Math.sin(a),70);if(!o)continue;occAdd(o);PORTX.yards.push(o);
  for(let i=0;i<rki(5,8);i++){const p=loc(o.x,o.z,rr(-19,19),rr(-13,13),o.ry);heap(p[0],p[1],vPick([['vPlateW','vPlate'],['vSheet','vPlate'],['vPipeR'],['vPlateW','vPipeR']]),rki(14,26),rr(2,4.2));}
  const cs=obbCorners(o,0);for(let e=0;e<4;e++){const A=cs[e],B=cs[(e+1)%4];const L=Math.hypot(B[0]-A[0],B[1]-A[1]),m=Math.round(L/2.2),ry=Math.atan2(B[0]-A[0],B[1]-A[1])+Math.PI/2;
   for(let i=0;i<m;i++){if(e===0&&Math.abs(i-m/2)<2)continue;const t=(i+.5)/m;kput(vPick(['vPlate','vSheet','vPlateW']),[A[0]+(B[0]-A[0])*t,y+1.05,A[1]+(B[1]-A[1])*t],qEuler(0,ry,rr(-.06,.06)),[L/m+.1,2+rr(-.2,.1),1],null);}}
  cpoly(cg,cs,'rgba(74,62,48,.6)');
  REG.push({name:'Scrapyard',x:o.x,y,z:o.z,r:26,h:5,cls:'building',key:'rk_scrapyard',tags:{culture:'highland-republican',type:['industry','salvage'],wealth:'poor',lit:false}});BIO_OBSTACLES.push({x:o.x,z:o.z,r:28});
  // one or two small scrap smithies beside the yard
  for(let j=0;j<rki(1,2);j++){const key=kitKey('hl_rep_smithy_small');const D=VERN.defs[key];const q=portSpot(D.w/2+1,D.d/2+1,o.x+rr(-40,40),o.z+rr(-40,40),60);if(!q)continue;q.hx-=1;q.hz-=1;placeVern(key,q,{y});}}
 // the Scavengers' Guild: by the port's entrance, where the road from the town comes in
 {const gx=PC.x-PC.P*Math.cos(Math.PI/5)+20,gz=PC.z+55;const D=VERN.defs.hl_rep_guild_scav;const o=portSpot(D.w/2+1,D.d/2+1,gx,gz,90);
  if(o){o.hx-=1;o.hz-=1;const n=nearestRoadPt(o.x,o.z);if(n)o.ry=Math.atan2(n.x-o.x,n.z-o.z);placeVern('hl_rep_guild_scav',o,{y,landmark:"Scavengers' Guild"});}else reportErr('no room for the Scavengers\' Guild');}
 window._port={pads:PORTX.pads.length,fuel:PORTX.fuel.length,tanks:PORTX.tanks.length,helis:PORTX.helis.length,yards:PORTX.yards.length};})();
// ---------------------------------------------------------------- 6. the farms: steadings along the farm lanes and the N/S highways, ploughed fields round them
const cropMat=new THREE.MeshLambertMaterial({color:0xffffff});kdef('rkCrop',VBOX,cropMat);
const FIELDCOL=['#7a6a3a','#6e5e34','#857240','#6a6a3a','#5e6a32','#8a7a48'];
function sowField(o){const cs=obbCorners(o,0);cpoly(cg,cs,vPick(FIELDCOL));cpoly(kg,cs,KLCOL(KL.field));cpoly(mg,cs,'#000');
 const long=o.hx>=o.hz,L=long?o.hx:o.hz,S=long?o.hz:o.hx;const green=new THREE.Color().setHSL(rr(.14,.3),rr(.3,.55),rr(.2,.34));const pitch=rr(2.6,3.4);const n=Math.floor(2*S/pitch);
 for(let k=0;k<n;k++){const off=-S+pitch*(k+.5);const lx=long?0:off,lz=long?off:0;const p=loc(o.x,o.z,lx,lz,o.ry);const y=terrainH(p[0],p[1]);
  kput('rkCrop',[p[0],y+.3,p[1]],qEuler(0,o.ry+(long?0:Math.PI/2),0),[2*L-2,rr(.45,.9),pitch*.55],green.clone().offsetHSL(rr(-.02,.02),0,rr(-.04,.04)));}
 for(let k=0;k<5;k++){const t=k/4;cstroke(cg,[cs[0],cs[1]].map((c,i)=>[c[0]+(cs[3-i][0]-c[0])*t,c[1]+(cs[3-i][1]-c[1])*t]),1,'rgba(40,30,15,.35)');}
 REG.push({name:'Field',x:o.x,y:terrainH(o.x,o.z),z:o.z,r:Math.hypot(o.hx,o.hz),h:1.5,cls:'farm',key:'rk_field',tags:{culture:'highland-republican',type:['farm'],wealth:'poor',lit:false}});}
(function farms(){reseed(SEED_RK+30);let steads=0,fields=0,mills=0;
 const lanes=FARMLANES.map(f=>({pts:f.pts,w:4.5})).concat(['N','S'].map(k=>({pts:HIGHWAY[k].out,w:10,hw:true})));
 const farmOK=o=>groundOK(o,{outside:true,ppad:4})&&!insideWall(o.x,o.z,-60)&&Math.hypot(o.x-PC.x,o.z-PC.z)>PC.top+60;
 for(const Ln of lanes){const P=Ln.pts;let acc=rr(20,60);
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<4)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,nx=-uz,nz=ux;
   for(let s=0;s<L;s+=6){acc-=6;if(acc>0)continue;const side=rng()<.5?-1:1;const fx=a[0]+ux*s,fz=a[1]+uz*s;
    const key=kitKey(rng()<.6?'hl_rep_farmhouse':'hl_rep_farm');const D=VERN.defs[key];if(!D){acc=20;continue;}
    const off=Ln.w/2+D.d/2+rr(3,8);const o={x:fx+nx*side*off,z:fz+nz*side*off,hx:D.w/2,hz:D.d/2,ry:Math.atan2(-nx*side,-nz*side),pad:3};
    if(!farmOK(o)||!occFree(o,3)){acc=8;continue;}
    placeVern(key,o,{v:Math.floor(rng()*4)});steads++;acc=Ln.hw?rr(160,260):rr(110,190);
    // outbuildings behind the steading
    for(const ok of[rng()<.6?'hl_rep_pens':null,rng()<.4?'hl_rep_granary':null]){if(!ok)continue;const k2=kitKey(ok);const D2=VERN.defs[k2];if(!D2)continue;
     const p=loc(o.x,o.z,rr(-1,1)*(D.w/2+D2.w/2+3),-(D.d/2+D2.d/2+rr(4,9)),o.ry);const o2={x:p[0],z:p[1],hx:D2.w/2,hz:D2.d/2,ry:o.ry+rr(-.15,.15),pad:2};
     if(farmOK(o2)&&occFree(o2,2))placeVern(k2,o2,{});}
    if(rng()<.3&&mills<5){const mk=kitKey('hl_rep_windmill');const DM=VERN.defs[mk];const p=loc(o.x,o.z,(rng()<.5?-1:1)*(D.w/2+14),-8,o.ry);const om={x:p[0],z:p[1],hx:DM.w/2,hz:DM.d/2,ry:o.ry,pad:3};if(farmOK(om)&&occFree(om,3)){placeVern(mk,om,{});mills++;}}
    // the fields: a patchwork on both sides of the lane round the steading
    for(let f=0;f<rki(3,6);f++){const fw=rr(22,44),fd=rr(30,70);const along=rr(-90,90),out=rr(8,40)+fd/2;const sd=rng()<.7?side:-side;
     const cx=fx+ux*along+nx*sd*(Ln.w/2+out),cz=fz+uz*along+nz*sd*(Ln.w/2+out);const fo={x:cx,z:cz,hx:fw/2,hz:fd/2,ry:Math.atan2(-nx*sd,-nz*sd)+rr(-.08,.08),pad:2};
     if(farmOK(fo)&&occFree(fo,2)){occAdd(fo);sowField(fo);fields++;}}}}}
 window._farms={steads,fields,mills};})();
// ---------------------------------------------------------------- 7. the quarry and a mine: the east hillsides toward the mountains, off the N road
(function works(){reseed(SEED_RK+40);
 for(const [key,tx,tz,name] of[['hl_rep_quarry',TC.x+260,TC.z-560,'The quarry'],['hl_rep_mine',PC.x+160,PC.z-620,'The mine']]){const D=VERN.defs[key];if(!D)continue;
  let o=null;for(let r=0;r<260&&!o;r+=12)for(let i=0;i<12&&!o;i++){const a=i/12*TAU;const t={x:tx+r*Math.cos(a),z:tz+r*Math.sin(a),hx:D.w/2,hz:D.d/2,ry:rng()*TAU,pad:3};if(groundOK(t,{outside:true})&&occFree(t,3))o=t;}
  if(!o){reportErr('no room for '+key);continue;}const n=nearestRoadPt(o.x,o.z);if(n){o.ry=Math.atan2(n.x-o.x,n.z-o.z);road([[o.x,o.z],[n.x,n.z]],4.5,KL.lane,{zone:'works',col:'#8a7a5c'});}
  placeVern(key,o,{landmark:name,level:true});}})();
// ---------------------------------------------------------------- 8. footprints into the mask, the terrain mesh, then the forest
for(const o of OCC.list)footprint(obbCorners(o,.6));
for(const o of PORTX.pads)cdisc(mg,o.x,o.z,PAD_R,'#000');
cityBakeMasks();
cityTerrainMesh();
(function forest(){BIO.setScene(scene);const q=RK.QUALITY;const t0=performance.now();let T={};
 BIO.host.mask=bioTreeMaskFn;
 // a denser forest than the biome's showcase stocking, paid for with detail: the tree passes see every distance stretched
 // (hero detail inside ~650 m of the town or the port instead of 1100), and stock at RK.FOREST x the showcase density
 const lodD0=BIO.lodD;BIO.lodD=(x,z)=>lodD0(x,z)*RK.FOREST_LOD;
 try{T=NWLOW.buildTrees?(BIO.cur='nwlow/trees',NWLOW.buildTrees(2450,q*RK.FOREST,{})):{};}catch(e){reportErr('forest trees: '+e.stack);}
 BIO.lodD=lodD0;
 BIO.host.mask=bioMaskFn;let F={};try{if(NWLOW.buildFloor){BIO.cur='nwlow/floor';F=NWLOW.buildFloor(2450,q);}}catch(e){reportErr('forest floor: '+e.stack);}
 BIO.cur=null;const b=BIO.bake();window._biome={trees:T.trees,heroes:T.heroes,far:T.far,calls:b&&b.calls,inst:b&&b.inst,ms:Math.round(performance.now()-t0)};
 BIO._tickWind&&BIO._tickWind();})();
// ---------------------------------------------------------------- 9. bakes
kbake(scene);
window._registered=REG.length;window._buildMs=Math.round(performance.now()-BUILD_T0);window._occ=OCC.list.length;
window._vern=(()=>{const by={};let rec=0;for(const v of VERN_PLACED){by[v.key]=(by[v.key]||0)+1;if(/_reclaimed$/.test(v.key))rec++;}return{n:VERN_PLACED.length,reclaimed:rec,by};})();
