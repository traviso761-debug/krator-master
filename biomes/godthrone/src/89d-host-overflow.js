// ================================================================= HOST — the lake's overflow (KLAVA), opt-in: the page's ?overflow
// PLAN.md section 10, "step 5": the serious eruption's lake (89c) spills over the pit's lowest lip onto the caldera floor. The
// flow is core/terrain's KLAVA (46-core-lava.js: a Bingham lava on the field's lattice, cooling and freezing into new ground).
// Off unless the page is opened with ?overflow: without it this fragment makes nothing and the page is 89c's.
//   THE SCENARIO  the eruption of 89c with its rate scaled by kQ, so the lake reaches the lip at tSpill and pours OVF_V (m3) over
//                 it before the supply ends (4 tau); its level from its volume less what has left it (the pond's ledger), on the
//                 pit's cells below the lip (80 m cells, flood-filled from the pit's middle)
//   THE SIM       KLAVA on GROUND_F every 8th point (80 m), roughness 0.5 m on WORLD; the pond held at the level until the
//                 supply ends; run on the page's frames as the time-lapse asks (snapshots every 12 h of sim time for going back)
//   THE PAGE      the moving surface (KLAVA.surface on core/atmos's lava chunk, glowing by temperature); the frozen flow
//                 written into the field and the ground meshes (KLAVA.writeBack, painted glassy black as the frozen lake);
//                 one hazard record over the sim's box (KLAVA.flow: molten where it is molten, a fresh crust for a day)
//   OVF.goTo(t), OVF.pump(ms), OVF.state(day), OVF.active (the time-lapse's checkbox), OVF.end (the sim time all is frozen)
const OVF_V=2.5e8;   // m3 over the lip: 0.25 km3 (a fifth of Kilauea 2018's; the flow stays on the 9.6 km map)
const OVF=(STN.vent&&LAKE&&typeof KLAVA!=='undefined'&&KLAVA.create&&/[?&]overflow\b/.test(location.search))?(function(){
 const E=LAKE.E,P=PIT,DAY=86400,F=GROUND_F,t0ms=performance.now();
 // ---- the lowest lip (89c's ring) and its direction
 let lip=1e9,la=0;for(let k=0;k<720;k++){const a=k/720*TAU,h=terrainH(P.x+Math.cos(a)*(P.rimR+40),P.z+Math.sin(a)*(P.rimR+40));if(h<lip){lip=h;la=a;}}
 const S=KLAVA.create({field:F,stride:8,seed:WORLD,rough:.5,dtMax:120,dtMin:5,cfl:2});
 const A=S.cs*S.cs,nx=S.nx,nz=S.nz,cellOf=(x,z)=>Math.round((z-S.z0)/S.cs)*nx+Math.round((x-S.x0)/S.cs);
 // ---- the pond: the pit's cells under the lip, flood-filled from its middle
 const inP=new Uint8Array(S.N),stack=[cellOf(P.x,P.z)];inP[stack[0]]=1;
 while(stack.length){const c=stack.pop(),i=c%nx,j=(c-i)/nx;
  for(let n=0;n<4;n++){const ii=i+KLAVA.DI[n],jj=j+KLAVA.DJ[n];if(ii<0||jj<0||ii>=nx||jj>=nz)continue;const k=jj*nx+ii;
   if(inP[k]||S.z[k]>=lip-.5||Math.hypot(S.x0+ii*S.cs-P.x,S.z0+jj*S.cs-P.z)>P.rimR+300)continue;inP[k]=1;stack.push(k);}}
 const cells=[];for(let k=0;k<S.N;k++)if(inP[k])cells.push(k);
 // ---- its hypsometry on those cells: V(L) = A (c L - the sum of the c heights under L); Lof its inverse
 const zs=cells.map(k=>S.z[k]).sort((a,b)=>a-b),n=zs.length,cum=new Float64Array(n+1);for(let i=0;i<n;i++)cum[i+1]=cum[i]+zs[i];
 const Vof=L=>{let lo=0,hi=n;while(lo<hi){const m=(lo+hi)>>1;if(zs[m]<L)lo=m+1;else hi=m;}return A*(lo*L-cum[lo]);};
 const Lof=V=>{if(V<=0)return zs[0];let lo=1,hi=n;while(lo<hi){const m=(lo+hi+1)>>1;if(A*(m*zs[m-1]-cum[m])<=V)lo=m;else hi=m-1;}return (V/A+cum[lo])/lo;};
 // ---- the eruption scaled so the lake reaches the lip and OVF_V pours over it: x = e^(-tSpill/tau)
 const Vlip=Vof(lip),e4=Math.exp(-4),rr=OVF_V/Vlip,x=(rr+e4)/(1+rr),kQ=Vlip/(E.Q0*E.tau*(1-x)),tSpill=-E.tau*Math.log(x);
 const Vin=t=>kQ*LAKE.Vc(t),tOf=V=>-E.tau*Math.log(1-V/(kQ*E.Q0*E.tau));
 const tStart=tOf(Vof(lip-12));   /* the sim starts with the lake 12 m under the lip: nothing moves before */
 let Lend=null;
 const pond=S.pond({cells,T:1420,name:'the lake',level:(t,out)=>{if(t>E.T){if(Lend==null)Lend=Lof(Vin(E.T)-out);return -1e9;}return Lof(Vin(t)-out);}});
 S.t=tStart;const snaps=[S.snapshot()],SNAP=DAY/2;snaps[0].Lend=null;
 // ---- the hazard, registered before anything is drawn; bound by its key (REGISTER keeps the tags record to itself)
 const hz=S.hazard({key:'godthrone-overflow',nav:{travel:4,enter:12,avoid:false}}),sh=hz.hazard.shape;
 const rec={name:'The lake\'s overflow (KLAVA: molten where the flow is, a fresh crust for a day)',x:hz.at[0],y:hz.at[1],z:hz.at[2],r:Math.hypot(sh.w,sh.d)/2,h:sh.h,kind:'hazard',tags:{hazard:hz.hazard}};
 REGISTER(rec);KLAVA.bind('godthrone-overflow',S);
 // ---- the surface: KLAVA.surface on the lava chunk, the pond left to 89c's lake
 const sd=SKY.state&&SKY.state.sunDir?SKY.state.sunDir:[.4,.8,.3],D=[sd.x==null?sd[0]:sd.x,sd.y==null?sd[1]:sd.y,sd.z==null?sd[2]:sd.z];
 const M=KLAVA.surface(S,{name:rec.name,crust:hostGroundLib('lavaCrust',null),sun:D,scale:.6,crack:1.2,heat:1.1,ponds:false,lift:.3});
 M.visible=false;M.renderOrder=1;scene.add(M);
 // ---- the frozen flow as ground: KLAVA.writeBack into the field (all of it each time: the field is put back first) and the
 // ground meshes' vertices and paint (89c's frozen-lake paint: glassy black)
 const grids=[{F:GROUND_F,m:GROUND_MESHES[0]}].concat(INSET&&GROUND_MESHES[1]?[{F:INSET.field,m:GROUND_MESHES[1]}]:[]);
 grids.forEach(G=>{G.h0=Float32Array.from(G.F.heights);G.touched=new Map();});
 let applied=-1,normalsAt=0,dirty=false;
 function putBack(){grids.forEach(G=>{const a=G.m.geometry.attributes;G.touched.forEach((v,k)=>{G.F.heights[k]=G.h0[k];a.position.setY(k,G.h0[k]);
   a.aGL.setXYZ(k,v[0],v[1],v[2]);a.aGM.setXYZW(k,v[3],v[4],v[5],v[6]);});if(G.touched.size){a.position.needsUpdate=a.aGL.needsUpdate=a.aGM.needsUpdate=true;G.dirty=true;}G.touched.clear();});}
 function ground(force){let sum=0;for(let k=0;k<S.N;k++)sum+=S.dep[k];if(!force&&sum===applied)return;applied=sum;putBack();
  S.writeBack(F,{all:true,each:(g,k)=>{const G=g===F?grids[0]:grids[1];if(!G)return;const a=G.m.geometry.attributes;
   if(!G.touched.has(k))G.touched.set(k,[a.aGL.getX(k),a.aGL.getY(k),a.aGL.getZ(k),a.aGM.getX(k),a.aGM.getY(k),a.aGM.getZ(k),a.aGM.getW(k)]);
   a.position.setY(k,g.heights[k]);if(g.heights[k]-G.h0[k]>.25){a.aGL.setXYZ(k,0,0,1);a.aGM.setXYZW(k,0,0,0,0);}
   a.position.needsUpdate=a.aGL.needsUpdate=a.aGM.needsUpdate=true;G.dirty=true;}});
  dirty=true;}
 function normals(){if(!dirty)return;grids.forEach(G=>{if(!G.dirty)return;G.m.geometry.computeVertexNormals();G.m.geometry.computeBoundingSphere();G.dirty=false;});dirty=false;normalsAt=performance.now();}
 // ---- the clock: goTo(t) restores the snapshot before t when going back; pump(ms) runs toward it within a budget
 let target=tStart,end=null;
 function goTo(t){t=Math.max(t,tStart);if(t<S.t-1){let s=snaps[0];for(const q of snaps)if(q.t<=t&&q.t>s.t)s=q;S.restore(s);Lend=s.Lend;if(end!=null&&s.t<end)end=null;}target=t;}
 function pump(ms){const t1=performance.now()+ms;let n=0;
  while(S.t<target-1e-6&&performance.now()<t1){
   if(end!=null&&S.t>=end){S.t=target;break;}                      /* all frozen: nothing moves again */
   const slot=Math.floor((S.t-tStart)/SNAP);S.step(Math.min(S.dtNext,target-S.t));n++;
   if(Math.floor((S.t-tStart)/SNAP)>slot&&!snaps.some(q=>Math.abs(q.t-S.t)<1)){const q=S.snapshot();q.Lend=Lend;snaps.push(q);}
   if(end==null&&S.t>E.T&&S.molten===0)end=S.t;}
  return n;}
 // ---- the state at a day (89c's, the level from the pond's ledger)
 function state(day){const t=day*DAY,s=LAKE.at(day),q=t<0||t>E.T?0:kQ*LAKE.Q(t);
  const L=t<tStart?Lof(Vin(Math.max(0,t))):t>E.T&&Lend!=null?Lend:Lof(Vin(Math.min(t,E.T))-pond.out);
  return Object.assign({},s,{Q:q,V:Vin(Math.max(0,t)),L,drowned:L>E.coneTop,spill:t>=tSpill&&t<=E.T,poured:pond.out,frozen:S.mass().frozen,computing:S.t<target-1e-6});}
 const O={S,pond,lip,la,Vlip,kQ,tSpill,tStart,state,goTo,pump,ground,normals,putBack,snaps,M,rec,active:true,
  get end(){return end;},msBuild:Math.round(performance.now()-t0ms)};
 // ---- 89c's LAKE.set, with the overflow: the lake at its own level, the flow run to the day, drawn, written as ground
 const set0=LAKE.set;let wasFrozen=false;
 LAKE.set=function(day){if(!O.active){M.visible=false;if(applied!==-1){putBack();applied=-1;dirty=true;normals();}return set0(day);}
  if(day==null){goTo(tStart);const r=set0(null);M.visible=false;putBack();applied=-1;dirty=true;normals();wasFrozen=false;return r;}
  goTo(day*DAY);pump(30);const s=state(day);
  if(s.phase==='frozen'){LAKE.day=day;LAKE.state=s;LAKE.mesh.visible=false;LAKE.rebake(s.L);if(VENTS.lava)VENTS.lava.visible=false;VENTS.lakeK=0;}
  else{set0(day);LAKE.state=s;if(LAKE.mesh.visible){LAKE.mesh.position.y=s.L;LAKE.mesh.updateMatrixWorld(true);}if(VENTS.lava)VENTS.lava.visible=s.L<VENT.lavaY+1;}
  const fz=s.phase==='frozen';ground(fz!==wasFrozen);wasFrozen=fz;
  M.visible=S.t>tStart;M.update();if(performance.now()-normalsAt>1200||!s.computing)normals();
  return s;};
 // ---- the checks (99's hostChecks): the scenario run to its end. Mid-spill: molten burns, the far side does not. At the end:
 // the pond poured about OVF_V, mass kept, all frozen, the deposit beyond the lowest lip (not the far side), the field raised by
 // exactly the deposit, the GPU stepper within tolerance of the CPU, and the ground put back when the scenario is off
 O.run=function(){if(O.last)return O.last;const was=LAKE.day,act=O.active;O.active=true;const r={};const t1=performance.now();
  const runTo=t=>{goTo(t);while(S.t<target-1e-6)pump(1e9);};
  runTo((tSpill+E.T)/2);
  {let best=-1,bh=0;for(let k=0;k<S.N;k++)if(S.pondOf[k]<0&&S.h[k]>bh&&S.T[k]>S.rheo.Tsol+20){bh=S.h[k];best=k;}
   const at=k=>[S.x0+(k%nx)*S.cs,S.z0+Math.floor(k/nx)*S.cs];r.mid={h:bh};
   if(best>=0){const p=at(best),a=KHAZ.here(p[0],S.z[best]+S.h[best]+1,p[1],0);r.mid.burn=(a.doses&&a.doses.burn)||0;r.mid.state=KLAVA.flowState({id:'x'},hz.hazard,0,1,p[0],p[1]).state;}
   const fx=P.x-Math.cos(la)*(P.rimR+900),fz=P.z-Math.sin(la)*(P.rimR+900),b=KHAZ.here(fx,terrainH(fx,fz)+1,fz,0);r.mid.farBurn=(b.doses&&b.doses.burn)||0;}
  runTo((E.days+E.crustDays)*DAY);
  const m=S.mass();r.mass=m;r.out=pond.out;r.molten=S.molten;r.end=end;
  let cx=0,cz=0,w=0,far=0,all=0,best=-1,bd=0;const ux=Math.cos(la),uz=Math.sin(la);
  for(let k=0;k<S.N;k++){const d=S.dep[k];if(!(d>0)||S.pondOf[k]>=0)continue;const x=S.x0+(k%nx)*S.cs-P.x,z=S.z0+Math.floor(k/nx)*S.cs-P.z;
   all+=d;if(Math.hypot(x,z)>P.rimR+100&&x*ux+z*uz<0)far+=d;cx+=x*d;cz+=z*d;w+=d;if(d>bd){bd=d;best=k;}}
  r.cos=w>0?(cx*ux+cz*uz)/Math.hypot(cx,cz):-1;r.farShare=all>0?far/all:1;r.depMax=bd;
  ground(true);{const i=(best%nx)*8,j=Math.floor(best/nx)*8,k=j*GROUND_F.nx+i;r.raised=GROUND_F.heights[k]-grids[0].h0[k];r.dep=S.dep[best];}
  r.ms=Math.round(performance.now()-t1);r.steps=S.steps;
  r.gpu=null;try{if(KLAVA.gpuCheck){const lx=P.x+ux*(P.rimR+200),lz=P.z+uz*(P.rimR+200);
   const mk=()=>{const s=KLAVA.create({field:F,box:[lx-1600,lz-1600,lx+1600,lz+1600],stride:4,seed:WORLD,rough:.5});s.vent({x:lx,z:lz,r:60,Q:150,T:1420});return s;};
   r.gpu=KLAVA.gpuCheck(renderer,mk,150,20);}}catch(e){r.gpu={error:String(e&&e.message||e)};}
  LAKE.set(null);let off=0;grids.forEach(G=>{for(let k=0;k<G.h0.length;k++)if(G.F.heights[k]!==G.h0[k])off++;});r.off=off;
  O.active=act;LAKE.set(was);O.last=r;return r;};
 O.verdict=function(r){const m=r.mass,g=r.gpu||{};return [
  {name:'the overflow: the lake pours about '+(OVF_V/1e9).toFixed(2)+' km3 over its lip',ok:r.out>.7*OVF_V&&r.out<1.05*OVF_V,detail:'poured '+(r.out/1e6).toFixed(1)+' Mm3 from day '+(tSpill/DAY).toFixed(1)+' (k '+kQ.toFixed(3)+'); '+r.steps+' steps in '+r.ms+' ms'},
  {name:'the overflow: mass kept, all of it frozen by the end',ok:Math.abs(m.error)<1e-6*m.erupted&&r.molten===0&&m.molten<1e-6*m.erupted,detail:'erupted '+(m.erupted/1e6).toFixed(1)+' Mm3 = frozen '+(m.frozen/1e6).toFixed(1)+' + lost off the map '+(m.lost/1e6).toFixed(1)+' + molten '+(m.molten/1e6).toFixed(3)+' (error '+m.error.toExponential(1)+' m3); all frozen at day '+(r.end/DAY).toFixed(1)},
  {name:'the overflow: its flow lies beyond the lowest lip',ok:r.cos>.7&&r.farShare<.02,detail:'the deposit\'s centre '+(Math.acos(Math.max(-1,Math.min(1,r.cos)))*180/Math.PI).toFixed(0)+' deg off the lip\'s bearing; '+(r.farShare*100).toFixed(1)+'% on the far side; deepest '+r.depMax.toFixed(1)+' m'},
  {name:'the overflow: the frozen flow is new ground (KLAVA.writeBack)',ok:r.dep>.5&&Math.abs(r.raised-r.dep)<1e-3*Math.max(1,r.dep),detail:'the field raised '+r.raised.toFixed(3)+' m where the deposit is '+r.dep.toFixed(3)+' m'},
  {name:'the overflow: molten burns mid-spill, the far side does not',ok:r.mid.burn>0&&r.mid.farBurn===0&&r.mid.state==='molten',detail:'burn '+r.mid.burn+' on the flow ('+r.mid.h.toFixed(1)+' m deep, '+r.mid.state+'), '+r.mid.farBurn+' across the pit'},
  {name:'the overflow: the GPU stepper agrees with the CPU (150 steps)',ok:!!g.mass&&Math.abs(g.mass-1)<1e-3&&g.dh<.05,detail:g.error?'error: '+g.error:g.mass?'worst |dh| '+g.dh.toFixed(4)+' m, |dT| '+g.dT.toFixed(2)+' K, volume ratio '+g.mass.toFixed(6)+', molten '+g.molten.join(' / '):'not run'},
  {name:'the overflow: the ground put back when it is off',ok:r.off===0,detail:r.off+' heights off'}];};
 // ---- the time-lapse's line and checkbox (99): what has poured and frozen, and the switch back to 89c's lake
 O.words=s=>' · overflow '+(s.poured/1e6).toFixed(0)+' Mm3 poured, '+(s.frozen/1e6).toFixed(0)+' frozen'+(s.spill?' · spilling':'')+(s.computing?' · computing…':'');
 O.ui=function(box,go){const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=O.active;
  l.style.cssText='font:12px ui-monospace,monospace;display:flex;gap:4px;align-items:center';l.title='The lake spills over the pit\'s lowest lip (core/terrain KLAVA): '+(OVF_V/1e9).toFixed(2)+' km3 from day '+(tSpill/DAY).toFixed(0);
  l.append(c,document.createTextNode('overflow'));box.insertBefore(l,box.lastChild);c.onchange=()=>{O.active=c.checked;go(LAKE.day);};};
 // the frames: keep computing toward the day the time-lapse shows, then redraw it
 KHOST.on(()=>{if(!O.active||LAKE.day==null||S.t>=target-1e-6)return;pump(25);M.update();ground(false);if(performance.now()-normalsAt>1200||S.t>=target-1e-6)normals();
  if(LAKE.ui)LAKE.ui.sync();},'view');
 return O;})():null;
