// ================================================================= YS CITY — the karst field (Krabi): towers and ridges on the land
// Travis (Oct 5 2026): stacks in the bay want more on land, like Krabi: jungle-crowned limestone towers and ridges standing
// straight out of the flat ground behind the town, headland ridges running into the sea at both ends of the bay with islets
// off their tips, and ranges stacked on the horizon. Generated once at load (after the layout, the streets and highways,
// before the placer and the terrain), from KRAND, into CITY.STACKS; every tower keeps clear of the city's land blocks,
// the river's valley and the highways, so the town stands on the flat between them. Shape and height: 84-city-geo.js.
const KARST={SEED:32500,made:[]};
(function karstField(){const H=CITY.HEAD,T=LAYOUT.T,N=LAYOUT.N,K=LAYOUT.K;const st=KRAND.stream(KRAND.child(KARST.SEED,'field'));
 const at=(t,s)=>[H[0]+T[0]*t-N[0]*s,H[1]+T[1]*t-N[1]*s];   // t along the coast, s inland (the land is -N)
 const cityLand=LAYOUT.blocks.filter(b=>b.use!=='farm');   /* every block of the grid, drowned ones too: a mole clipped a stack */
 const hw=[];for(const h of LAYOUT.highways)for(let i=1;i<h.pts.length;i++)hw.push([h.pts[i-1],h.pts[i]]);
 const segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1;const u=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);return Math.hypot(x-a[0]-dx*u,z-a[1]-dz*u);};
 const clear=(x,z,R)=>{if(Math.abs(x)>1580||Math.abs(z)>1580)return false;
  for(const b of cityLand)if(Math.abs((x-b.x)*LAYOUT.U[0]+(z-b.z)*LAYOUT.U[1])<100+R+20&&Math.abs((x-b.x)*LAYOUT.V[0]+(z-b.z)*LAYOUT.V[1])<100+R+20)return false;
  const rv=ysRiverDist(x,z);if(rv.d<rv.w*2.2+R+30)return false;
  for(const [a,b] of hw)if(segD(x,z,a,b)<R+25)return false;
  for(const s of CITY.STACKS)if(Math.hypot(s.x-x,s.z-z)<(s.r*(s.e||1))*.6+R*.6&&s.flat)return false;   // the landmark stacks stand alone
  return true;};
 const add=(o)=>{const R=o.r*(o.e||1);if(!clear(o.x,o.z,R*.85))return null;o.n=o.n||'a karst tower';o.field=true;CITY.STACKS.push(o);KARST.made.push(o);
  if(YS_NAT(o.x,o.z)<0&&typeof ysLoopStack==='function')ysLoopStack(o);return o;};
 const coastA=Math.atan2(T[1],T[0]);   // ridges run roughly with the coast, as Krabi's do
 // 1. behind the town: clusters of towers and ridges, denser and taller with distance inland
 for(let k=0;k<26;k++){const t=st.range(-1700,1700),s=st.range(600,1500);const c=at(t,s);const nC=st.int(1,4);const far=clamp((s-600)/900,0,1);
  for(let m=0;m<nC;m++){const x=c[0]+st.range(-110,110),z=c[1]+st.range(-110,110);const ridge=st.chance(.35);
   add({x,z,r:st.range(30,70)+far*35,h:st.range(70,130)+far*110,e:ridge?st.range(1.6,2.8):st.range(1,1.3),a:coastA+st.range(-.6,.6)});}}
 // 2. the headlands: a ridge from the land out into the sea at each end of the bay, islets off its tip
 for(const side of [1,-1]){const t=side*(1650*K+260);const c=at(t,-40);const a=Math.atan2(N[1],N[0]);
  const hd=add({x:c[0],z:c[1],r:st.range(70,90),h:st.range(130,170),e:st.range(2.6,3.2),a,n:side>0?'the north-east headland':'the south-west headland'});
  if(!hd)continue;const tip=hd.r*hd.e;for(let m=0;m<st.int(2,3);m++){const d=tip+st.range(70,200),o=st.range(-90,90);
   add({x:c[0]+N[0]*d+T[0]*o,z:c[1]+N[1]*d+T[1]*o,r:st.range(28,55),h:st.range(50,95),e:st.range(1,1.5),a:st.range(0,TAU),n:'an islet'});}}
 // 3. the horizon: a tall range along the north-west, the Inner Wall's foothills
 for(let k=0;k<16;k++){const t=st.range(-1900,1900),s=st.range(1650,2300);const c=at(t,s);
  add({x:c[0],z:c[1],r:st.range(90,170),h:st.range(180,340),e:st.range(1.2,2.6),a:coastA+st.range(-.5,.5),n:'the far karst'});}
 ysStacksDirty();
})();
// THE ROADS ROUND THE KARST (Travis: no street runs over a stack). A point is on karst when it lies inside a stack's
// wandering plan plus a margin. A highway's points are pushed out of every stack (along the stack's own radial line, a
// few metres at a time) and the ones that cannot leave are dropped; a street is cut where it meets karst and its clear
// runs (20 m or more) are kept. Then the road paint is laid (87c ysRoadStamps) and the placer reserves what is left.
function ysOnKarst(x,z,m){for(const s of ysStacksNear(x,z)){const L=ysStackLocal(s,x,z);if(L.d<ysStackRR(s,L.th)+m)return s;}return null;}
(function karstRoads(){let moved=0,cut=0;
 for(const h of LAYOUT.highways){const out=[];for(const p of h.pts){let x=p[0],z=p[1],s,k=0;
   while((s=ysOnKarst(x,z,h.w/2+6))&&k++<60){const dx=x-s.x,dz=z-s.z,l=Math.hypot(dx,dz)||1;x+=dx/l*5;z+=dz/l*5;}
   if(k>0)moved++;if(k<60)out.push([x,z]);}h.pts=out;}
 const S=[];for(const st of LAYOUT.streets){const L=Math.hypot(st.b[0]-st.a[0],st.b[1]-st.a[1]);const n=Math.max(2,Math.ceil(L/5));let run=null;const flush=()=>{if(run&&Math.hypot(run.b[0]-run.a[0],run.b[1]-run.a[1])>=20)S.push(run);run=null;};
  let broke=false;for(let i=0;i<=n;i++){const t=i/n,x=st.a[0]+(st.b[0]-st.a[0])*t,z=st.a[1]+(st.b[1]-st.a[1])*t;
   if(st.kind!=='canal'&&ysOnKarst(x,z,st.w/2+3)){broke=true;flush();continue;}
   if(!run)run=Object.assign({},st,{a:[x,z],b:[x,z]});else run.b=[x,z];}
  flush();if(broke)cut++;}
 LAYOUT.streets=S;KARST.roads={highwayPointsMoved:moved,streetsCut:cut};
 ysRoadStamps();})();
