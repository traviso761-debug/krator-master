// ---------- the L: every elevated CTA track in OpenStreetMap on its steel structure, station platforms, and trains running the joined lines ----------
await stage('el');
const polyLen=r=>{let L=0;r.cum=[0];for(let i=0;i+1<r.pts.length;i++){L+=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]);r.cum.push(L);}r.len=L;return r;};
const polyAt=(r,s,wrap)=>{s=wrap?((s%r.len)+r.len)%r.len:Math.max(0,Math.min(r.len,s));let lo=0,hi=r.cum.length-2;while(lo<hi){const mid=(lo+hi+1)>>1;if(r.cum[mid]<=s)lo=mid;else hi=mid-1;}
  const i=lo,a=r.pts[i],b=r.pts[i+1],u=(s-r.cum[i])/((r.cum[i+1]-r.cum[i])||1);return [a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,Math.atan2(b[1]-a[1],b[0]-a[0])];};
// join polylines that share an end point into longer chains
function joinChains(lines,tol){const key=p=>Math.round(p[0]/tol)+','+Math.round(p[1]/tol),left=lines.map(l=>l.slice()),out=[];
  while(left.length){let c=left.pop(),grew=true;while(grew){grew=false;for(let i=0;i<left.length;i++){const d=left[i];
      if(key(d[0])===key(c[c.length-1])){c=c.concat(d.slice(1));}else if(key(d[d.length-1])===key(c[c.length-1])){c=c.concat(d.slice(0,-1).reverse());}
      else if(key(d[d.length-1])===key(c[0])){c=d.slice(0,-1).concat(c);}else if(key(d[0])===key(c[0])){c=d.slice(1).reverse().concat(c);}else continue;left.splice(i,1);grew=true;break;}}out.push(c);}return out;}
const EL=C.el||{};   // a land with no railway need not configure one; every section here reads it
section('el',()=>{
  // The height is above the street, not above the datum. It used to be absolute, which is the same thing in
  // Chicago, where the ground along the L is a few metres above the lake, and nonsense anywhere the land moves:
  // City 17's viaduct crosses ground at 22 m, so all of it, trains included, was built underneath the city.
  //
  // Following the ground exactly is wrong too. A viaduct is graded: it is built level over the dips and its
  // columns get longer, it does not ride up and down over every hummock like a road. So the deck is the ground
  // smoothed along the line, held at least half its height clear of it, and the columns take up the difference -
  // which is what makes a viaduct read as one thing crossing a city rather than as track laid on the dirt.
  const H=EL.height||8,elev=RAILS.filter(r=>r.type==='L'&&r.elevated);
  // the joined lines, resampled fine enough to follow the land, each carrying its own deck profile
  const chains=joinChains(elev.map(r=>r.pts),3).map(p=>polyLen({pts:TER?resample(p,12*WORLD):p}));
  for(const r of chains){const g=r.pts.map(([x,z])=>groundH(x,z));let y=g.slice();
    for(let k=0;k<4;k++){const o=y.slice();for(let i=0;i<y.length;i++){let sum=0,n=0;
      for(let j=Math.max(0,i-3);j<=Math.min(y.length-1,i+3);j++){sum+=o[j];n++;}y[i]=sum/n;}}
    r.g=g;r.ys=y.map((v,i)=>Math.max(v,g[i]+H*0.55)+H);}
  // the height of the deck at arc length s along a line, which is where the trains ride
  const deckOn=(r,s)=>{s=Math.max(0,Math.min(r.len,s));let lo=0,hi=r.cum.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(r.cum[mid]<=s)lo=mid;else hi=mid-1;}
    const i=lo,j=Math.min(r.cum.length-1,i+1),u=(s-r.cum[i])/((r.cum[j]-r.cum[i])||1);return r.ys[i]+(r.ys[j]-r.ys[i])*u;};
  // How heavy the structure is. Chicago's L is light steel; something a military occupation drove through a
  // city is not, so the deck's width and depth, the piers and their spacing all come from the city file.
  const DW=EL.deckWidth||4.2,PW=EL.pierWidth||0.6,PD=EL.deckDepth||1.2,PE=EL.pierEvery||14;
  const deck=tiledBuffer(new THREE.MeshLambertMaterial({vertexColors:true}),{cast:true}),dc=col(EL.colour||'#5e6166');
  const cols=[];
  for(const r of chains){deck.ribbon(r.pts,DW,r.ys,dc,PD);
    for(let i=0,run=1e9;i+1<r.pts.length;i++){const L=r.cum[i+1]-r.cum[i];run+=L;if(run<PE)continue;run=0;
      cols.push([r.pts[i][0],r.pts[i][1],r.g[i],r.ys[i]]);}}
  deck.build('L structure');
  const cm=new THREE.InstancedMesh(new THREE.BoxGeometry(PW,1,PW).translate(0,0.5,0),steelM,Math.max(1,cols.length)),d=new THREE.Object3D();
  cols.forEach(([x,z,g,y],i)=>{d.position.set(x,g,z);d.scale.set(1,Math.max(1,y-PD-g),1);d.updateMatrix();cm.setMatrixAt(i,d.matrix);});cm.count=cols.length;cm.castShadow=true;scene.add(cm);
  // stations on the elevated lines: platforms and a canopy along the track, at the deck's own height
  const platM=new THREE.MeshLambertMaterial({color:0xa8a49a}),canM=new THREE.MeshLambertMaterial({color:0x2a5aa8});let nst=0;
  for(const s of STATIONS){let best=null;for(const r of chains)for(let i=0;i+1<r.pts.length;i++){const dd=segDist(s.x,s.z,r.pts[i][0],r.pts[i][1],r.pts[i+1][0],r.pts[i+1][1]);if(dd<45&&(!best||dd<best.d))best={d:dd,r,i};}
    if(!best)continue;const r=best.r,a=r.pts[best.i],b=r.pts[best.i+1],ang=Math.atan2(b[1]-a[1],b[0]-a[0]);
    const t=((s.x-a[0])*(b[0]-a[0])+(s.z-a[1])*(b[1]-a[1]))/Math.max(1,(b[0]-a[0])**2+(b[1]-a[1])**2),tt=Math.max(0,Math.min(1,t));
    const x=a[0]+(b[0]-a[0])*tt,z=a[1]+(b[1]-a[1])*tt,y=r.ys[best.i]+(r.ys[best.i+1]-r.ys[best.i])*tt,g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=-ang;
    for(const sd of [-1,1]){const pl=new THREE.Mesh(new THREE.BoxGeometry(120,0.8,3.5),platM);pl.position.set(0,0.3,sd*4.2);const cn=new THREE.Mesh(new THREE.BoxGeometry(70,0.3,4),canM);cn.position.set(0,4,sd*4.2);g.add(pl,cn);}
    g.userData.info={name:s.name+' station',info:EL.stationInfo||'CTA ’L’ station (elevated).'};g.traverse(o=>o.userData.info=g.userData.info);LANDMARKS.push(g);scene.add(g);nst++;}
  // trains: the lines long enough to run on, one every trainEvery metres so there is usually one in sight,
  // slowing at stations. Two trains on four kilometres of track is a line nobody ever catches in the act.
  const lines=chains.filter(r=>r.len>700);
  const winM=new THREE.MeshLambertMaterial({color:0x1e2630});
  const carL=EL.carLength||14.6,N=EL.trainCars||6,carM=new THREE.MeshLambertMaterial({color:EL.livery!==undefined?EL.livery:0x8e959c,emissive:0x000000}),trains=[];   // brushed steel, not white
  const EVERY=EL.trainEvery||1500;
  for(const r of lines){const k=Math.max(1,Math.round(r.len/EVERY));for(let i=0;i<k;i++)trains.push({r,s:(i+0.5)*r.len/k,dir:i%2?1:-1,v:EL.trainSpeed||13});}
  const tm=new THREE.InstancedMesh(new THREE.BoxGeometry(carL,3.4,3),carM,Math.max(1,trains.length*N)),tw=new THREE.InstancedMesh(new THREE.BoxGeometry(carL-1.2,1.1,3.04).translate(0,0.45,0),winM,Math.max(1,trains.length*N));tm.frustumCulled=tw.frustumCulled=false;scene.add(tm,tw);
  const stS=lines.map(r=>STATIONS.map(s=>{let bs=-1,bd=60;for(let q=0;q<=r.len;q+=10){const [px,pz]=polyAt(r,q);const dd=Math.hypot(px-s.x,pz-s.z);if(dd<bd){bd=dd;bs=q;}}return bs;}).filter(q=>q>=0));
  let last=performance.now();
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let i=0;
    for(const tr of trains){const li=lines.indexOf(tr.r),slow=stS[li].some(q=>Math.abs(q-tr.s)<90);tr.s+=tr.dir*(slow?4:tr.v)*dt;
      if(tr.s>tr.r.len-5)tr.dir=-1;if(tr.s<5+N*(carL+1))tr.dir=1;
      for(let c=0;c<N;c++){const s=tr.s-tr.dir*c*(carL+1),[x,z,a]=polyAt(tr.r,s),o=tr.dir*1.1;d.position.set(x-Math.sin(a)*o,deckOn(tr.r,s)+2.3,z+Math.cos(a)*o);d.rotation.set(0,-a,0);d.scale.set(1,1,1);d.updateMatrix();tm.setMatrixAt(i,d.matrix);tw.setMatrixAt(i++,d.matrix);}}
    tm.count=tw.count=i;tm.instanceMatrix.needsUpdate=tw.instanceMatrix.needsUpdate=true;const w=windowF(hourCur);carM.emissive.setRGB(w*0.9,w*0.85,w*0.6);});
  const deckLo=chains.length?Math.round(Math.min(...chains.map(r=>Math.min(...r.ys)))):0,deckHi=chains.length?Math.round(Math.max(...chains.map(r=>Math.max(...r.ys)))):0;
  ctx.details=Object.assign(ctx.details||{},{elevatedTrack:elev.length,elevatedDeck:chains.length?deckLo+'–'+deckHi+' m':'none',stations:nst,trainLines:lines.length,trains:trains.length});
});
// commuter rail: double-deck silver trains (Chicago's Metra) on the mapped heavy-rail lines, at grade and on their embankments
// A train rides the ground under it (they used to ride y = 0.2, the datum, wherever the land was), the road deck
// where it shares one, and across a mapped rail bridge the chord between the bridge's ends. The lines are joined
// one name at a time, so a train keeps to its own line instead of turning off down the next one. A city whose own
// traffic (src/core/traffic.js, C.vehicles) runs its trains does without these.
function railLines(rails,minLen){const by=new Map();for(const r of rails){const k=r.name||'';if(!by.has(k))by.set(k,[]);by.get(k).push(r.pts.map(p=>[p[0],p[1],r.elevated?1:0]));}
  const out=[];for(const [name,ls] of by)for(const p of joinChains(ls,3)){const r=polyLen({pts:p});if(r.len<minLen)continue;r.hasName=name?1:0;
    // the heights at the bridge points: along the chord between the ground at the bridge's two ends
    const g=p.map(q=>q[2]?NaN:groundH(q[0],q[1]));for(let i=0;i<g.length;i++)if(isNaN(g[i])){let j=i;while(j<g.length&&isNaN(g[j]))j++;const a=i>0?g[i-1]:(j<g.length?g[j]:0),b=j<g.length?g[j]:a,s0=i>0?r.cum[i-1]:r.cum[i],s1=j<g.length?r.cum[j]:r.cum[g.length-1];
      for(let k=i;k<j;k++)g[k]=Math.max(a+(b-a)*((r.cum[k]-s0)/((s1-s0)||1)),groundH(p[k][0],p[k][1])+(C.railBridge||3));i=j;}
    r.ys=g;r.elev=p.map(q=>q[2]);out.push(r);}return out;}
function railY(r,s,x,z){let lo=0,hi=r.cum.length-2;s=Math.max(0,Math.min(r.len,s));while(lo<hi){const m=(lo+hi+1)>>1;if(r.cum[m]<=s)lo=m;else hi=m-1;}
  const base=(r.elev[lo]||r.elev[lo+1])?r.ys[lo]+(r.ys[lo+1]-r.ys[lo])*((s-r.cum[lo])/((r.cum[lo+1]-r.cum[lo])||1)):groundH(x,z);return Math.max(base,deckAt(x,z));}
section('commuter-rail',()=>{if(C.vehicles)return;
  {const pos=[],nor=[],W=3.2,T=1.4,q=(a,b,c,d,n)=>{for(const v of [a,b,c,a,c,d])pos.push(...v);for(let k=0;k<6;k++)nor.push(...n);};
    for(const r of railLines(RAILS.filter(r=>r.type==='rail'),0))for(let i=0;i+1<r.pts.length;i++){if(!(r.elev[i]&&r.elev[i+1]))continue;
      const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);if(L<0.1)continue;const nx=-(bz-az)/L*W,nz=(bx-ax)/L*W,ya=r.ys[i],yb=r.ys[i+1];
      q([ax+nx,ya,az+nz],[ax-nx,ya,az-nz],[bx-nx,yb,bz-nz],[bx+nx,yb,bz+nz],[0,1,0]);
      q([ax+nx,ya-T,az+nz],[ax+nx,ya,az+nz],[bx+nx,yb,bz+nz],[bx+nx,yb-T,bz+nz],[nx/W,0,nz/W]);q([bx-nx,yb-T,bz-nz],[bx-nx,yb,bz-nz],[ax-nx,ya,az-nz],[ax-nx,ya-T,az-nz],[-nx/W,0,-nz/W]);}
    if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
      const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0x8a857c,side:THREE.DoubleSide}));mesh.castShadow=mesh.receiveShadow=true;scene.add(mesh);ctx.details=Object.assign(ctx.details||{},{railBridgeTris:pos.length/9});}}
  // the named main lines first (the unnamed track is sidings and spurs as often as not), never a yard
  const CM=C.commuter||{},YARD=/yard|terminal district|industrial|siding/i;
  const lines=railLines(RAILS.filter(r=>r.type==='rail'&&!YARD.test(r.name||'')),1500);
  const cars=CM.freight?(CM.cars||14):(CM.cars||6),carL=CM.freight?17:26,N=cars;
  // C.commuter: {body, band, cars, freight} - stainless double-deckers with dark window bands by default (Metra);
  // a freight line's cars come in rust, brown, tank black and intermodal colours, and are not lit at night
  const m=new THREE.MeshLambertMaterial({color:0xffffff,emissive:0x000000}),band=new THREE.MeshLambertMaterial({color:new THREE.Color(CM.band||'#1e2630')});
  lines.sort((a,b)=>(b.hasName-a.hasName)||(b.len-a.len));lines.splice(C.commuterLines||8);
  const trains=lines.map((r,i)=>({r,s:r.len*((i*0.37)%1),dir:i%2?1:-1,v:CM.freight?9:14}));
  const FREIGHT=['#7a3a26','#5a3a2a','#2a2a2c','#8a5a2a','#3a5a7a','#a83a2a','#6a6a62'].map(c=>new THREE.Color(c)),BODY=new THREE.Color(CM.body||'#8a9096');
  const body=new THREE.InstancedMesh(new THREE.BoxGeometry(carL,CM.freight?3.6:4.6,CM.freight?2.9:3).translate(0,CM.freight?2.4:2.9,0),m,Math.max(1,trains.length*N)),stripe=new THREE.InstancedMesh(new THREE.BoxGeometry(carL-1,1.6,3.05).translate(0,3.1,0),band,Math.max(1,trains.length*N)),d=new THREE.Object3D();
  body.frustumCulled=stripe.frustumCulled=false;scene.add(body,stripe);let last=performance.now();
  for(let k=0;k<trains.length*N;k++)body.setColorAt(k,CM.freight?FREIGHT[Math.floor(((Math.sin(k*12.9898)*43758.5453)%1+1)%1*FREIGHT.length)]:BODY);
  if(CM.freight)stripe.visible=false;
  animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let i=0;
    for(const t of trains){t.s+=t.dir*t.v*dt;if(t.s>t.r.len-5)t.dir=-1;if(t.s<N*(carL+1)+5)t.dir=1;
      for(let c=0;c<N;c++){const s2=t.s-t.dir*c*(carL+1),[x,z,a]=polyAt(t.r,s2);d.position.set(x,railY(t.r,s2,x,z)+0.2,z);d.rotation.set(0,-a,0);d.updateMatrix();body.setMatrixAt(i,d.matrix);stripe.setMatrixAt(i,d.matrix);i++;}}
    body.count=stripe.count=i;body.instanceMatrix.needsUpdate=stripe.instanceMatrix.needsUpdate=true;const w=CM.freight?0:windowF(hourCur);m.emissive.setRGB(w*0.5,w*0.48,w*0.35);
    if(trains.length&&/raildebug/.test(location.hash)){const t=trains[0],[x,z]=polyAt(t.r,t.s);ctx.details.commuterAt=[Math.round(x),Math.round(railY(t.r,t.s,x,z)*10)/10,Math.round(z),Math.round(groundH(x,z)*10)/10];}});
  ctx.details=Object.assign(ctx.details||{},{commuterTrains:trains.length});
});
// light rail and streetcars at street level (MAX, the Portland Streetcar): rails in the pavement and trains running the joined lines
section('surface-rail',()=>{
  const surf=RAILS.filter(r=>(r.type==='L'&&!r.elevated)||r.type==='tram');if(!surf.length)return;
  const rb=tiledBuffer(groundMat(6),{tile:1000,far:2500*WORLD}),steel=col('#8a8a86');
  const off=(pts,o)=>pts.map((p,i)=>{const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [p[0]-dz/l*o,p[1]+dx/l*o];});
  for(const r of surf)for(const o of [-0.72,0.72])rb.ribbon(off(r.pts,o),0.12,0.02,steel);rb.build('surface rails');
  const make=(type,carL,N,colour,v)=>{const lines=joinChains(surf.filter(r=>type==='tram'?r.type==='tram':r.type!=='tram').map(r=>r.pts),3).map(p=>polyLen({pts:p})).filter(r=>r.len>600);
    const m=new THREE.MeshLambertMaterial({color:colour,emissive:0x000000}),trains=[],stripeC=type==='tram'?0x1e2228:0x1e2630;for(const r of lines){const k=r.len>2500?2:1;for(let i=0;i<k;i++)trains.push({r,s:(i+0.4)*r.len/k,dir:i%2?1:-1,v});}
    const im=new THREE.InstancedMesh(new THREE.BoxGeometry(carL,3.6,2.65).translate(0,2.2,0),m,Math.max(1,trains.length*N)),win=new THREE.InstancedMesh(new THREE.BoxGeometry(carL-2,1.3,2.7).translate(0,2.7,0),new THREE.MeshLambertMaterial({color:stripeC,emissive:0x000000}),Math.max(1,trains.length*N)),
      band=new THREE.InstancedMesh(new THREE.BoxGeometry(carL+0.02,0.45,2.72).translate(0,1.2,0),new THREE.MeshLambertMaterial({color:type==='tram'?0xd8d0c0:0x2a5aa8}),Math.max(1,trains.length*N)),d=new THREE.Object3D();
    im.frustumCulled=win.frustumCulled=band.frustumCulled=false;scene.add(im,win,band);let last=performance.now();
    animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;let i=0;for(const t of trains){t.s+=t.dir*t.v*dt;if(t.s>t.r.len-5)t.dir=-1;if(t.s<N*(carL+0.5)+5)t.dir=1;
        for(let c=0;c<N;c++){const [x,z,a]=polyAt(t.r,t.s-t.dir*c*(carL+0.5));d.position.set(x,Math.max(groundH(x,z),deckAt(x,z)),z);d.rotation.set(0,-a,0);d.updateMatrix();im.setMatrixAt(i,d.matrix);win.setMatrixAt(i,d.matrix);band.setMatrixAt(i++,d.matrix);}}
      im.count=win.count=band.count=i;im.instanceMatrix.needsUpdate=win.instanceMatrix.needsUpdate=band.instanceMatrix.needsUpdate=true;const w=windowF(hourCur);m.emissive.setRGB(w*0.7,w*0.66,w*0.5);});return trains.length;};
  // on a bridge the tracks share the road deck: lift the train to it
  const nMax=make('L',28,EL.trainCars||2,0x9ea3a8,11),nCar=C.vehicles?0:make('tram',20,1,new THREE.Color(EL.tramColour||'#7a2a5a'),7);   // MAX: grey with a blue stripe; the streetcar in its plum livery
  ctx.details=Object.assign(ctx.details||{},{lightRailTrains:nMax,streetcars:nCar});
});
Object.assign(API,{polyLen,polyAt,joinChains});
