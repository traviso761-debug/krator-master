// ================================================================= HOST — a serious eruption: the pit fills with a lava lake (the vent's page)
// The owner (2026-10-27): what a really serious eruption does to the summit vent. Kilauea filled Halema'uma'u with a lake 225 m
// deep (41 million m3) in 2020-21, fastest at the start, the vent drowned once the lake rose over it, the lake crusting as the
// supply fell; Olympus Mons' caldera floors are frozen lakes over 30 km wide with wrinkle ridges (PLAN.md section 4). Here the
// 900 m pit fills almost to its rim (~14 km3) at a flood-basalt rate. NO OVERFLOW: the level stops below the pit's lowest lip
// (a flow across the caldera's floor needs a lava-flow module core does not have: PLAN.md section 10).
//   THE DATA ([G data] in spirit: plain arrays and closed forms, no THREE)
//     LAKE.V(L)     the pit's volume under level L (m3), from the baked field (KFIELD, the base lattice): the hypsometry
//     LAKE.L(V)     its inverse; LAKE.Q(t) the eruption's rate (m3/s, Q0 e^-t/tau: fastest at the start, as Kilauea's);
//     LAKE.at(day)  {day, phase ('before'|'erupting'|'crusting'|'frozen'), Q, V, L, r (its radius), crust 0..1, drowned}
//   THE PAGE
//     the surface  one disc at the level on core/atmos's lava shader (fx/lava): plates, glowing cracks, overturning, the
//                  vent's dome under the lake once it is drowned; its heat falls and its crust closes as the supply fails
//     the hazard   one record, stateFn 'GODT.lake' (core/hazard: page state, as a live fire's): molten within the lake's
//                  radius while it is open, nothing once it is frozen
//     the floor    once frozen, the ground under the level is re-baked at the level with low wrinkle ridges (the field, the
//                  meshes, their paint: glassy black), and restored when the time-lapse goes back
// The time-lapse (99-host-take.js): a Serious eruption button, a slider over its days, play.
const LAKE=STN.vent?(function(){
 const F=GROUND_F,st=F.step,nx=F.nx,nz=F.nz,H=F.heights,P=PIT,inPit=(x,z)=>Math.hypot(x-P.x,z-P.z)<P.rimR+60;
 // ---- the hypsometry: the heights of the pit's cells, sorted; V(L) on a 1 m ladder from the floor to the lowest lip
 const hs=[];for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=F.x0+i*st,z=F.z0+j*st;if(inPit(x,z))hs.push(H[j*nx+i]);}
 hs.sort((a,b)=>a-b);
 let lip=1e9;for(let k=0;k<720;k++){const a=k/720*TAU,x=P.x+Math.cos(a)*(P.rimR+40),z=P.z+Math.sin(a)*(P.rimR+40);lip=Math.min(lip,terrainH(x,z));}
 const L0=hs[0],Lmax=lip-15,cellA=st*st,n=Math.ceil(Lmax-L0)+1,VV=new Float64Array(n);
 {let c=0,v=0;for(let k=1;k<n;k++){const L=L0+k;while(c<hs.length&&hs[c]<L)c++;v+=c*cellA;VV[k]=v;}}   // each metre adds the area under it
 const V=L=>{const f=clamp(L-L0,0,n-1),i=Math.min(n-2,Math.floor(f));return VV[i]+(VV[i+1]-VV[i])*(f-i);};
 const Linv=v=>{if(v<=0)return L0;if(v>=VV[n-1])return L0+n-1;let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(VV[m]<v)lo=m;else hi=m;}return L0+lo+(v-VV[lo])/(VV[hi]-VV[lo]);};
 const A=L=>{const f=L-L0;if(f<=0)return 0;const i=Math.min(n-2,Math.floor(f));return VV[i+1]-VV[i];};
 // ---- the eruption: Q0 a flood-basalt rate; tau so the volume poured by 4 tau fills the pit to Lmax
 const Q0=20000,Vmax=V(Lmax),tau=Vmax/(Q0*(1-Math.exp(-4))),T=4*tau,DAY=86400,crustDays=30;
 const E={Q0,tau,T,days:T/DAY,crustDays,Vmax,Lmax,L0,lip,coneTop:VENT.top};
 const Q=t=>t<0||t>T?0:Q0*Math.exp(-t/tau),Vc=t=>t<=0?0:Q0*tau*(1-Math.exp(-Math.min(t,T)/tau));
 function at(day){const t=day*DAY,v=Vc(t),L=v>0?Linv(v):L0,q=Q(t);
  const phase=day<0?'before':t<=T?'erupting':day<=E.days+crustDays?'crusting':'frozen';
  /* the crust: open while the supply is strong, closing as it fails, whole by the end of the crusting days */
  const crust=phase==='erupting'?clamp(1-Math.pow(q/Q0,.6),0,1)*.75:phase==='crusting'?.75+.25*clamp((day-E.days)/crustDays,0,1):phase==='frozen'?1:0;
  return{day,phase,Q:q,V:v,L,r:Math.sqrt(A(L)/Math.PI),crust,drowned:L>E.coneTop};}
 return{E,V,L:Linv,A,Q,Vc,at,hs:hs.length,inPit,day:null,state:null};})():null;

// ---------------------------------------------------------------- the page: the surface, the hazard, the floor
if(LAKE)(function(){const V=VENT,P=PIT,E=LAKE.E;
 // the hazard first (a record before it is drawn): the lake at its fullest; its state is the time-lapse's (stateFn)
 KHAZ.STATES['GODT.lake']=(rec,h,t,speed,x,z)=>{const s=LAKE.state;if(!s||s.phase==='before'||s.phase==='frozen'||s.V<=0)return{state:s?s.phase:'none',k:0,on:false};
  if(x!=null&&z!=null&&Math.hypot(x-P.x,z-P.z)>s.r)return{state:'shore',k:0,on:false};
  return{state:s.phase==='erupting'?'molten':'crusting',k:s.phase==='erupting'?1:.5,on:true};};
 const rec={name:'The lava lake (a serious eruption fills the pit: the time-lapse)',x:P.x,z:P.z,y:E.L0-5,r:P.rimR,h:E.Lmax-E.L0+10,kind:'hazard',
  tags:{hazard:KHAZ.GROUND.lavaLake(P.rimR,{shape:{type:'cyl',r:P.rimR,h:E.Lmax-E.L0+10,y0:0},stateFn:'GODT.lake'})}};
 REGISTER(rec);LAKE.rec=rec;
 // the surface: one disc; the shader's own swell, the vent's dome once drowned (vents), the crust by heat and erupt
 const sd=SKY.state&&SKY.state.sunDir?SKY.state.sunDir:[.4,.8,.3],D=[sd.x==null?sd[0]:sd.x,sd.y==null?sd[1]:sd.y,sd.z==null?sd[2]:sd.z];
 const vents=[new THREE.Vector3(V.x,V.z,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0)];
 const M=ATMOS.lavaMaterial({name:'The lava lake',centre:[P.x,P.z],sun:D,crust:hostGroundLib('lavaCrust',null),scale:1.2,crack:1,heat:1.2,vents});
 const g=new THREE.CircleGeometry(P.rimR+180,192);g.rotateX(-Math.PI/2);g.translate(P.x,0,P.z);
 const mesh=new THREE.Mesh(g,M);mesh.visible=false;mesh.renderOrder=1;mesh.userData.inspectLabel=rec.name;scene.add(mesh);LAKE.mesh=mesh;LAKE.M=M;
 // ---- the floor, re-baked under the frozen lake: the field's heights (base and inset) and the meshes' vertices and paint
 const grids=[{F:GROUND_F,m:GROUND_MESHES[0]}].concat(INSET&&GROUND_MESHES[1]?[{F:INSET.field,m:GROUND_MESHES[1]}]:[]);
 grids.forEach(G=>{G.h0=Float32Array.from(G.F.heights);const a=G.m.geometry.attributes;G.gl0=Float32Array.from(a.aGL.array);G.gm0=Float32Array.from(a.aGM.array);});
 let baked=null;
 const wrinkle=(x,z)=>{const r=1-Math.abs(KRAND.fbm(x*.004,0,z*.004,2,WORLD+31)*2-1);return 3.5*r*r*r+.6*(KRAND.vnoise(x*.05,0,z*.05,WORLD+32)-.5);};   /* the frozen lake's pressure ridges */
 LAKE.rebake=function(Lf){if(baked===Lf)return;LAKE.restore(true);
  grids.forEach(G=>{const F=G.F,a=G.m.geometry.attributes,pos=a.position,gl=a.aGL,gm=a.aGM;let n=0;
   for(let j=0;j<F.nz;j++)for(let i=0;i<F.nx;i++){const k=j*F.nx+i,x=F.x0+i*F.step,z=F.z0+j*F.step;if(!LAKE.inPit(x,z)||G.h0[k]>=Lf)continue;
    const y=Lf+wrinkle(x,z);F.heights[k]=y;pos.setY(k,y);gl.setXYZ(k,0,0,1);gm.setXYZW(k,0,0,0,0);n++;}
   G.n=n;pos.needsUpdate=gl.needsUpdate=gm.needsUpdate=true;G.m.geometry.computeVertexNormals();G.m.geometry.computeBoundingSphere();});
  baked=Lf;};
 LAKE.restore=function(quiet){if(baked==null)return;grids.forEach(G=>{const a=G.m.geometry.attributes;G.F.heights.set(G.h0);
   for(let k=0;k<G.h0.length;k++)a.position.setY(k,G.h0[k]);a.aGL.array.set(G.gl0);a.aGM.array.set(G.gm0);
   a.position.needsUpdate=a.aGL.needsUpdate=a.aGM.needsUpdate=true;G.m.geometry.computeVertexNormals();G.m.geometry.computeBoundingSphere();});baked=null;};
 // ---- the time-lapse: LAKE.set(day) (null: the scenario off, the vent as it is)
 LAKE.set=function(day){LAKE.day=day;const s=day==null?null:LAKE.at(day);LAKE.state=s;
  if(!s||s.phase==='before'||s.V<=0){mesh.visible=false;LAKE.restore();if(VENTS.lava)VENTS.lava.visible=true;VENTS.lakeK=null;return s;}
  if(s.phase==='frozen'){mesh.visible=false;LAKE.rebake(s.L);if(VENTS.lava)VENTS.lava.visible=false;VENTS.lakeK=0;return s;}
  LAKE.restore();mesh.visible=true;mesh.position.y=s.L;mesh.updateMatrixWorld(true);
  const sup=s.Q/E.Q0;M.uniforms.uErupt.value=clamp(sup*1.2,0,1);M.uniforms.uHeat.value=mix(1.25,.18,s.crust);
  vents[0].z=s.drowned?clamp(sup*2,0,1):0;   /* the drowned vent wells up under the lake */
  if(VENTS.lava)VENTS.lava.visible=s.L<V.lavaY+1;
  VENTS.lakeK=s.phase==='erupting'&&!s.drowned?1:0;   /* the vent fountains without pause until the lake drowns it (89b reads it) */
  return s;};
 LAKE.scale=s=>s*E.days;})();
