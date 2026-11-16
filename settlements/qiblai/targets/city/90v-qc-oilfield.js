// TARGET: city — the oilfield and the mission drawn (89zr-qc-oil-site.js has the records and why): each record built with the
// Yuni engine's kit (YKIT, gen/69y-ykit-bundle.js, sealed as Verge seals it: the Locus kit's petroleum, power and dwellings,
// the Yuni kit's civic buildings), on the ground where it stands, then the kit's instances and merged families emitted once;
// each one registered (REG, which 91t turns into core/tags records: the inspector, the minimap). Then the light (below): the
// field's line, and the town's from the Prismarchy's generator along every major avenue. Poles in the kit's timber and iron
// (baked once), the wires one line set with a sag.
// window._qiblaiOil reports.
const QC_OILF=(function(){const S={assets:0,errors:[],poles:0,lamps:0,wireSpans:0};window._qiblaiOil=S;
 if(typeof YKIT==='undefined'||typeof QC_OIL==='undefined'){S.errors.push('no YKIT or QC_OIL');return S;}
 for(const R of QC_OIL.assets){const A=YKIT.ASSET_BY_KEY[R.key];if(!A){S.errors.push('no asset '+R.key);continue;}const y=terrainH(R.x,R.z);
  try{YKIT.buildAsset(R.key,R.x,R.z,R.ry,{y,seed:R.seed,variant:R.v,wealth:R.wealth,name:R.name||A.name});S.assets++;
   REG.push({name:(R.name||A.name)+(R.culture==='yuni'?' (Yuni\'s mission)':' (the Geomancers\' concession)'),x:R.x,y,z:R.z,r:Math.hypot(A.w,A.d)/2,h:qcD(A.h,8),cls:'building',key:R.key,
    tags:{culture:R.culture==='yuni'?'yuni':'geomancer',type:(A.types||[]).slice(),site:R.site}});}
  catch(e){S.errors.push(R.key+': '+(e&&e.message||e));}}
 try{const E=YKIT.emitBuckets(),M=YKIT.emitMerged();YKIT.kitDone();S.instances=E.instances;S.meshes=E.meshes+M.meshes;S.tris=M.tris;}
 catch(e){S.errors.push('emit: '+(e&&e.stack||e));}
 // ---- the light (the owner, relayed 2026-11-16: "Qiblai will be electrified along all major avenues and in buildings except
 // in poor areas ... just enough to use the cut of oil they get from Yuni"). Runs of nodes [x, z, ground y, kind, c]: kind
 // 'pole' (a plain pole), 'lamp' (a lamp on an arm toward c, the street's middle), 'cross' (that, and a lamp hung on a wire
 // across the street to a post opposite), 'hang' (a wire's point through a gate's arch, no pole); each run wired in order.
 // The field's own short line (its generator to the yard and the village); the town's: the Prismarchy's generator house by
 // the south road, up the south gate's stair, through its arch, then every major avenue, a pole every 32 m on its right side.
 const runs=[],node=(x,z,y,kind,c)=>[x,z,y==null?terrainH(x,z):y,kind,c||null];
 const along=(R,a,b,step,kind)=>{const L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/step));for(let i=1;i<=n;i++)R.push(node(a[0]+(b[0]-a[0])*i/n,a[1]+(b[1]-a[1])*i/n,null,kind));};
 const fg=QC_OIL.assets.find(R=>R.key==='ind_generator_house'&&R.site==='yard'),O=QC_OIL.O;
 {const R=[node(fg.x+8,fg.z-10)];along(R,[fg.x+8,fg.z-10],[O[0]-20,O[1]-20],40,'pole');along(R,[O[0]-20,O[1]-20],[O[0]-70,O[1]+105],40,'pole');runs.push(R);}
 const cg=QC_OIL.assets.find(R=>R.id==='oil:council-generator'),st=QC_EXTRA.find(p=>p.kind==='stair'&&p.gate&&p.gate.o.v!==1&&/:gate:s$/.test(p.gate.id));
 const feed=[node(cg.x-9,cg.z)];
 if(st){const g=st.gate,SP=qnStairPlan(st.o.rise),sy=qcD(st.o.y,0),side=st.o.w/2+1.4,foot=loc(st.x,st.z,side,SP.len+3,st.ry);
  along(feed,[cg.x-9,cg.z],foot,40,'pole');
  for(const s of SP.segs.slice().reverse())if(s.k==='land'&&s.z0>0){const q=loc(st.x,st.z,side,(s.z0+s.z1)/2,st.ry);feed.push(node(q[0],q[1],sy+s.y,'pole'));}   /* up the stair, a pole on each landing */
  const top=loc(st.x,st.z,side,.6,st.ry);feed.push(node(top[0],top[1],sy,'pole'));}
 runs.push(feed);
 // every major avenue: stations every 32 m from its outer end, a pole on its right side; a span that crosses a gate goes
 // through its arch (a hang point 0.7 m under the arch's head); no pole within 11 m of a gate, no cross lamp within 12 m of
 // a crossing (its chorten)
 const gates=QC_EXTRA.filter(p=>p.kind==='gate'),xs=(QC_S.crossings||[]).map(c=>[c.x,c.z]);
 const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/L2)):0;return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);};
 for(const w of QC_S.ways.filter(w=>w.kind==='avenue')){let pts=w.pts.slice();if(Math.hypot(pts[0][0]-QC_LM.x,pts[0][1]-QC_LM.z)<Math.hypot(pts[pts.length-1][0]-QC_LM.x,pts[pts.length-1][1]-QC_LM.z))pts=pts.reverse();   /* from the outer end inward */
  const R=[],off=w.w/2-1.2;let prev=null,k=0;
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;const ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L,rx=-uz,rz=ux;
   for(let t=i===1?6:32;t<L;t+=32){const c=[a[0]+ux*t,a[1]+uz*t],p=[c[0]+rx*off,c[1]+rz*off];
    if(gates.some(G=>Math.hypot(G.x-c[0],G.z-c[1])<11))continue;
    if(prev){const G=gates.find(G=>segD([G.x,G.z],prev,c)<8);if(G){const gy=qcD(G.o.y,0),gc=[G.x+rx*Math.min(off,1.4),G.z+rz*Math.min(off,1.4)];R.push(node(gc[0],gc[1],gy+(G.o.v===1?5:7.5)-.7-8.6,'hang'));}}
    const nearX=xs.some(q=>Math.hypot(q[0]-c[0],q[1]-c[1])<12);R.push(node(p[0],p[1],null,(k++%2&&!nearX)?'cross':'lamp',c));prev=c;}}
  if(R.length>1)runs.push(R);}
 // ---- drawn: poles (timber, a cross-arm, three insulators), the lamps (an iron arm and a bulb), the posts opposite, the wires
 const G=new THREE.Group();G.name='oil:power';const saveK=KXF;KXF=null;const tim=xC(0x5a4634),iron=xC(0x2e2a26),H=9,V=[];
 const sag=(a,b,s)=>{const n=8;for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,p=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t-s*4*t*(1-t),a[2]+(b[2]-a[2])*t];V.push(...p(t0),...p(t1));}};
 for(const R of runs){let last=null;
  for(let i=0;i<R.length;i++){const [x,z,y,k,c]=R[i],at=[x,y+8.6,z];
   if(k!=='hang'){const nx=R[Math.min(R.length-1,i+1)],pv=R[Math.max(0,i-1)],ry=Math.atan2(nx[0]-pv[0],nx[1]-pv[1])+Math.PI/2;
    vPst('vPost',x,y,z,.12,H,tim);vB('vWood',x,y+H-.5,z,1.8,.14,.14,ry,tim);for(const u of[-.75,0,.75]){const q=loc(x,z,u,0,ry);vB('vIron',q[0],y+H-.36,q[1],.08,.16,.08,0,iron);}S.poles++;
    if(c){const dx=c[0]-x,dz=c[1]-z,L=Math.hypot(dx,dz)||1,ux=dx/L,uz=dz/L,ay=Math.atan2(-uz,ux);
     vB('vIron',x+ux*1.1,y+6.2,z+uz*1.1,2.2,.08,.08,ay,iron);kput('vBulb',[x+ux*2.2,y+6.0,z+uz*2.2],null,[.16,.2,.16],null);S.lamps++;
     if(k==='cross'){const o=[2*c[0]-x,2*c[1]-z],oy=terrainH(o[0],o[1]),cy=terrainH(c[0],c[1]);vPst('vPost',o[0],oy,o[1],.1,6.8,tim);kput('vBulb',[c[0],cy+5.6,c[1]],null,[.2,.24,.2],null);S.lamps++;
      const m=[c[0],cy+6.0,c[1]];sag([x,y+6.6,z],m,.15);sag(m,[o[0],oy+6.6,o[1]],.15);}}}
   if(last){sag(last,at,.6);S.wireSpans++;}last=at;}}
 KXF=saveK;kbake(G);for(const n in KIT.items)KIT.items[n].length=0;scene.add(G);
 const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(V,3));
 const wires=new THREE.LineSegments(wg,new THREE.LineBasicMaterial({color:0x161412}));wires.name='oil:wires';wires.userData.probeSkip=true;wires.raycast=()=>{};scene.add(wires);
 S.runs=runs.length;
 REG.push({name:'The town\'s power line (the Prismarchy\'s generator to the avenues\' lamps)',x:cg.x,y:terrainH(cg.x,cg.z),z:cg.z,r:6,h:10,cls:'infrastructure',key:'oil_power_line',tags:{culture:'qiblai',poles:S.poles,lamps:S.lamps}});
 return S;})();
