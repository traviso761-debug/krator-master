// ---------- the night city: neon on every facade, billboards and holograms over the street, flying traffic in
// its lanes, flare stacks out on the flats, steam off the gratings, and rain. Night City is the only city that
// lives like this, so it travels with its own page instead of with the shared engine, and nothing is built
// unless the city config carries a "neon" block. ----------
import { mkRng } from '../core/rng.js';

export function neon(api){
  const {THREE,C,ctx,B,scene,camera,animHooks,AREAS,ROADS,box,col,groundH,roofAt,inMap,inWater,nightF,hour}=api;

  const N=C.neon;if(!N)return;
  const NR=mkRng(7749),D=new THREE.Object3D(),cc=new THREE.Color();
  // the palette: nothing here is white. Signage is sodium, magenta, cyan and a sick green.
  const NEON=(N.colours||['#ff2e6b','#12e6ff','#ffc21e','#b14bff','#25ff92','#ff6a1e','#ff1e3c','#57d0ff']).map(h=>new THREE.Color(h));
  const pickNeon=()=>NEON[Math.floor(NR()*NEON.length)];
  const lit=[];   // everything that brightens after dark, dimmed again by day

  // Pick a point anywhere on a set of streets, weighted by how long they are. Walking the list in order and
  // stopping at a quota puts everything on the first few streets, which on a city whose roads are single long
  // simplified lines means the whole budget lands on one edge of town.
  function sampler(list){const cum=[];let tot=0;
    for(const r of list){tot+=r.len;cum.push(tot);}
    return ()=>{if(!tot)return null;const t=NR()*tot;let lo=0,hi=cum.length-1;
      while(lo<hi){const m=(lo+hi)>>1;if(cum[m]<t)lo=m+1;else hi=m;}
      const r=list[lo];let s=NR()*r.len,acc=0;
      for(let i=0;i+1<r.pts.length;i++){const [ax,az]=r.pts[i],[bx,bz]=r.pts[i+1],L=Math.hypot(bx-ax,bz-az);
        if(L<0.01)continue;
        if(acc+L>=s){const u=(s-acc)/L;return {r,x:ax+(bx-ax)*u,z:az+(bz-az)*u,dx:(bx-ax)/L,dz:(bz-az)/L};}
        acc+=L;}
      return null;};}

  // ---- text on signs: drawn to a canvas, because a sign nobody can read is just a coloured rectangle ----
  function cv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  // Does this machine have the glyphs? A missing one renders as the same tofu box every time, so measure a
  // character against a code point nothing has and fall back to the roman signage if they match.
  const CJK_OK=(()=>{try{const g=cv(8,8).getContext('2d');g.font='40px "Noto Sans CJK JP","Noto Serif CJK JP",sans-serif';
    return Math.abs(g.measureText('\u98df').width-g.measureText('\uffff').width)>0.5;}catch(e){return false;}})();
  ctx.cjk=CJK_OK;
  function texFrom(c){const t=new THREE.CanvasTexture(c);t.anisotropy=8;t.needsUpdate=true;return t;}
  // a wide sign: the name across it, lit from behind, with the tube glow bleeding into the panel
  // A brand's own colour, and for a few of them a simple mark. These are drawn here from primitives - they
  // are this project's own renditions in the spirit of each sign, not copies of anyone's trademark artwork,
  // which is not something to reproduce even for a company that no longer trades.
  const BRAND={
    'ATARI':['#d8232a','bars'],'ENRON':['#2f6fbf','bars'],'PAN AM':['#1257a8','globe'],
    'BLOCKBUSTER':['#ffcf1a','ticket'],'COMPAQ':['#e4002b',''],'NETSCAPE':['#1f9e4f','disc'],
    'POLAROID':['#e04a2f','frame'],'WOOLWORTH':['#c8102e',''],'LEHMAN BROS':['#4a6f9e',''],
    'TWA':['#d0021b','arrow'],'RCA':['#b8232f','disc'],'COMMODORE':['#3f7fc0','chev'],
    'SUN MICRO':['#8a4f9e',''],'BORDERS':['#2f8a5e',''],'TOWER RECORDS':['#ffcf1a',''],
    'PALM':['#ff8a2b','disc'],'WANG':['#4a7fbf',''],'CIRCUIT CITY':['#e4002b','arrow'],
    'RADIOSHACK':['#d2232a','bars'],'GATEWAY':['#cfcfcf','spots'],'NAPSTER':['#2aa3e0','disc'],
    'NORTEL':['#8a5fc0','disc'],'WORLDCOM':['#3f6fc0','globe'],'PETS.COM':['#2f8ad0',''],
    'KODAK':['#ffcf1a','frame'],'BRANIFF':['#ff6a2b','arrow'],'EASTERN AIR':['#3f7fa8','arrow'],
    'OLDSMOBILE':['#b8b0a0','chev'],'PONTIAC':['#c8302a','arrow'],'STUDEBAKER':['#a8b0bf','chev'],
    'ZENITH':['#cfcfcf','bars'],'AIWA':['#cfd6e0',''],'MINOLTA':['#2f6fbf',''],'AMPEX':['#cfcfcf','bars'],
    'ALTAVISTA':['#2f8ad0',''],'GEOCITIES':['#3f9e6f','globe'],'FRIENDSTER':['#3f7fc0','spots'],
    'SEGWAY':['#cfcfcf',''],'TOYS R US':['#2f8ad0','spots'],'DE LOREAN':['#b8bec8','chev'],
    'ARTHUR ANDERSEN':['#c8a04a',''],'BEAR STEARNS':['#4a6f9e',''],'SHARPER IMAGE':['#b8b0a0',''],
    'PULLMAN':['#8a6a4a',''],'TOWER':['#ffcf1a',''],'NORTHERN TELECOM':['#8a5fc0','']};
  function emblem(g,kind,cx2,cy2,r,col){g.save();g.fillStyle=col;g.strokeStyle=col;g.lineWidth=r*0.17;
    if(kind==='bars'){for(let i=-1;i<=1;i++){g.beginPath();
      g.moveTo(cx2+i*r*0.46,cy2+r);g.quadraticCurveTo(cx2+i*r*0.9,cy2,cx2+i*r*0.46,cy2-r);g.stroke();}}
    else if(kind==='globe'){g.beginPath();g.arc(cx2,cy2,r,0,7);g.stroke();
      for(let i=-1;i<=1;i++){g.beginPath();g.ellipse(cx2,cy2,r*Math.abs(0.36+i*0.3)||r*0.2,r,0,0,7);g.stroke();}
      g.beginPath();g.moveTo(cx2-r,cy2);g.lineTo(cx2+r,cy2);g.stroke();}
    else if(kind==='disc'){g.beginPath();g.arc(cx2,cy2,r,0,7);g.stroke();
      g.beginPath();g.arc(cx2,cy2,r*0.36,0,7);g.fill();}
    else if(kind==='arrow'){g.beginPath();g.moveTo(cx2-r,cy2+r*0.5);g.lineTo(cx2+r,cy2-r*0.2);
      g.lineTo(cx2+r*0.2,cy2-r*0.75);g.closePath();g.fill();}
    else if(kind==='chev'){for(let i=0;i<2;i++){g.beginPath();g.moveTo(cx2-r,cy2+r*0.5-i*r*0.6);
      g.lineTo(cx2,cy2-r*0.3-i*r*0.6);g.lineTo(cx2+r,cy2+r*0.5-i*r*0.6);g.stroke();}}
    else if(kind==='ticket'){g.fillRect(cx2-r,cy2-r*0.62,r*2,r*1.24);
      g.fillStyle='#0a0a0c';g.fillRect(cx2-r*0.66,cy2-r*0.3,r*1.32,r*0.6);}
    else if(kind==='frame'){g.lineWidth=r*0.26;g.strokeRect(cx2-r,cy2-r*0.74,r*2,r*1.48);}
    else if(kind==='spots'){for(let i=0;i<4;i++){g.beginPath();
      g.arc(cx2-r*0.6+ (i%2)*r*1.2, cy2-r*0.45+Math.floor(i/2)*r*0.9, r*0.32,0,7);g.fill();}}
    g.restore();}
  // fit the name to the panel: measure it, drop the size until it fits, and break it over two lines if that
  // lets it sit bigger. It used to guess the size from the letter count and ran straight off the edge.
  function fitLines(g,text,maxW,maxH,weight){
    const tries=[[text]];
    const sp=text.lastIndexOf(' ');
    if(sp>0)tries.push([text.slice(0,sp),text.slice(sp+1)]);
    let best=null;
    for(const lines of tries){
      let lo=10,hi=110,fit=10;
      while(lo<=hi){const mid=(lo+hi)>>1;
        g.font=weight+' '+mid+'px "DejaVu Sans","Helvetica Neue",Arial,sans-serif';
        const w=Math.max(...lines.map(l=>g.measureText(l).width)),h=mid*1.16*lines.length;
        if(w<=maxW&&h<=maxH){fit=mid;lo=mid+1;}else hi=mid-1;}
      if(!best||fit*(lines.length===1?1.04:1)>best.size)best={lines,size:fit};}
    return best;}
  function signTex(text,hex){const W=512,H=256,c=cv(W,H),g=c.getContext('2d');
    const br=BRAND[text]||[hex,''],col=br[0],mark=br[1];
    g.fillStyle=col;g.fillRect(0,0,W,H);
    g.fillStyle='rgba(0,0,0,0.36)';g.fillRect(0,0,W,H);
    g.strokeStyle='rgba(0,0,0,0.5)';g.lineWidth=12;g.strokeRect(7,7,W-14,H-14);
    const hasMark=!!mark,textX=hasMark?W*0.60:W/2,maxW=(hasMark?W*0.70:W*0.86);
    const fit=fitLines(g,text,maxW,H*0.62,'800');
    g.textAlign='center';g.textBaseline='middle';
    g.shadowColor='#000';g.shadowBlur=16;g.fillStyle='#fffdf6';
    g.font='800 '+fit.size+'px "DejaVu Sans","Helvetica Neue",Arial,sans-serif';
    const n=fit.lines.length,step=fit.size*1.16;
    fit.lines.forEach((l,i)=>g.fillText(l,textX,H/2+(i-(n-1)/2)*step));
    g.shadowBlur=0;
    if(hasMark)emblem(g,mark,W*0.20,H/2,H*0.26,'#fffdf6');
    return texFrom(c);}
  // a blade sign: characters stacked down a panel that sticks out over the street
  // The whole panel is lit, with the characters knocked out of it. Bright glyphs on a dark panel look right
  // up close and average to a black bar the moment the texture is minified, which is how you see almost all
  // of them; a lit panel stays a bar of colour at any distance, and it is what the signage actually is.
  function bladeTex(text,hex){const W=96,H=Math.max(160,text.length*92),c=cv(W,H),g=c.getContext('2d');
    g.fillStyle=hex;g.fillRect(0,0,W,H);
    g.fillStyle='rgba(0,0,0,0.30)';g.fillRect(0,0,W,H);          // knock it back so the glyphs can sit brighter
    g.strokeStyle='rgba(0,0,0,0.65)';g.lineWidth=7;g.strokeRect(4,4,W-8,H-8);
    g.font='700 70px "Noto Sans CJK JP","Noto Serif CJK JP","DejaVu Sans",sans-serif';
    g.textAlign='center';g.textBaseline='middle';
    for(let i=0;i<text.length;i++){const y=(i+0.5)*(H/text.length);
      g.shadowColor='#000';g.shadowBlur=10;g.fillStyle='#fffbf2';g.fillText(text[i],W/2,y);g.shadowBlur=0;}
    return texFrom(c);}

  // ---- facade neon: vertical signs bolted to whatever wall faces the street ----
  let signs=0;
  {const want=N.signs||0;
   const barG=new THREE.BoxGeometry(0.5,1,0.5),panelG=new THREE.BoxGeometry(0.28,1,1);
   const barM=new THREE.MeshBasicMaterial({vertexColors:true}),panM=new THREE.MeshBasicMaterial({vertexColors:true});
   const bars=new THREE.InstancedMesh(barG,barM,Math.max(1,want)),pans=new THREE.InstancedMesh(panelG,panM,Math.max(1,want));
   const pick=sampler(ROADS.filter(r=>(r.c==='residential'||r.c==='secondary'||r.c==='tertiary')&&r.len>20));
   for(let tries=0;tries<want*14&&signs<want;tries++){
       const q=pick();if(!q)break;const {r,dx,dz}=q;
       const sd=NR()<0.5?-1:1;
       const px=q.x-dz*sd*(r.w/2+1.4),pz=q.z+dx*sd*(r.w/2+1.4);
       if(!inMap(px,pz,10)||inWater(px,pz))continue;
       const roof=roofAt(px-dz*sd*3,pz+dx*sd*3)||roofAt(px-dz*sd*6,pz+dx*sd*6);if(roof<8)continue;
       const gy=groundH(px,pz),head=Math.atan2(dz,dx),c=pickNeon();
       const hh=3+NR()*Math.min(16,roof-6),y=gy+4+NR()*Math.max(1,roof-hh-6);
       D.position.set(px,y,pz);D.rotation.set(0,-head,0);D.scale.set(1,hh,1);D.updateMatrix();
       bars.setMatrixAt(signs,D.matrix);bars.setColorAt(signs,c);
       D.scale.set(1,hh*0.82,1.1+NR()*1.8);D.updateMatrix();
       pans.setMatrixAt(signs,D.matrix);pans.setColorAt(signs,cc.copy(c).multiplyScalar(0.55));
       signs++;}
   bars.count=pans.count=signs;if(signs){scene.add(bars,pans);lit.push(barM,panM);}}

  // ---- billboards: the big ones, high on the core towers, advertising companies that no longer exist ----
  // Blade Runner put Atari, Pan Am and Bell on its skyline and then watched all three go under. This city
  // only advertises the dead: every name up there is a company that does not exist any more.
  const BRANDS=N.brands||['ATARI','ENRON','PAN AM','BLOCKBUSTER','COMPAQ','NETSCAPE','POLAROID','WOOLWORTH',
    'LEHMAN BROS','TWA','RCA','COMMODORE','SUN MICRO','BORDERS','TOWER RECORDS','PALM','WANG','CIRCUIT CITY',
    'RADIOSHACK','GATEWAY','NAPSTER','NORTEL','WORLDCOM','PETS.COM','SHARPER IMAGE','BEAR STEARNS','STUDEBAKER',
    'ZENITH','AIWA','MINOLTA','AMPEX','ARTHUR ANDERSEN','ALTAVISTA','GEOCITIES','OLDSMOBILE','PONTIAC','BRANIFF',
    'EASTERN AIR','SEGWAY','FRIENDSTER','KODAK','TOYS R US','CIRCUIT CITY','DE LOREAN','PULLMAN','BRANIFF'];
  const boards=[];
  {const want=N.billboards||0,fm=[];
   for(let k=0;k<want;k++){
     let px=0,pz=0,roof=0,tries=0;
     do{px=(NR()-0.5)*(B.w*0.6)+B.cx;pz=(NR()-0.5)*(B.d*0.6)+B.cz;roof=roofAt(px,pz);tries++;}while(roof<40&&tries<60);
     if(roof<40)continue;
     // face them towards the middle of the city rather than at random: a board pointed into the hills is a
     // board nobody reads, and its own backing panel hides it
     const w=18+NR()*34,h=w*0.5,y=groundH(px,pz)+18+NR()*Math.max(4,roof-30),
           a=Math.atan2(B.cz-pz,B.cx-px)+(NR()-0.5)*1.5;
     const c0=pickNeon(),hex='#'+c0.getHexString();
     // double-sided: a procedurally placed board is as likely to be facing away from you as towards you,
     // and a dead company's name is worth reading from both sides
     const m=new THREE.MeshBasicMaterial({map:signTex(BRANDS[Math.floor(NR()*BRANDS.length)],hex),transparent:true,opacity:0.95,side:THREE.DoubleSide});
     const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);
     face.position.set(px+Math.cos(a)*2,y,pz+Math.sin(a)*2);face.rotation.y=-a+Math.PI/2;
     const frame=new THREE.Mesh(new THREE.BoxGeometry(w+2,h+2,1),new THREE.MeshLambertMaterial({color:0x14161a}));
     frame.position.copy(face.position).addScaledVector(new THREE.Vector3(Math.cos(a),0,Math.sin(a)),-0.7);
     frame.rotation.y=face.rotation.y;
     scene.add(face,frame);boards.push({m,ph:NR()*6.28,sp:0.4+NR()*1.6,at:[Math.round(px),Math.round(y),Math.round(pz)]});fm.push(m);}
   ctx.billboardAt=()=>boards.map(b=>b.at);   // where they are, for aiming a camera at one
   if(boards.length)animHooks.push(now=>{const t=now/1000;
     for(const b of boards){const k=0.55+0.45*Math.sin(t*b.sp+b.ph);b.m.color.setScalar(0.45+0.75*k);}});
   lit.push(...fm);}

  // ---- holograms: slow turning shapes hung over the junctions, translucent and far too large ----
  {const want=N.holograms||0,hm=[];
   for(let k=0;k<want;k++){
     let px=0,pz=0,tries=0;
     do{px=(NR()-0.5)*(B.w*0.5)+B.cx;pz=(NR()-0.5)*(B.d*0.5)+B.cz;tries++;}while((inWater(px,pz)||roofAt(px,pz)>4)&&tries<60);
     if(inWater(px,pz))continue;
     const m=new THREE.MeshBasicMaterial({color:pickNeon().clone(),transparent:true,opacity:0.15,depthWrite:false,side:THREE.DoubleSide});
     const r=11+NR()*19,g=new THREE.Group();
     for(let q=0;q<4;q++){const ring=new THREE.Mesh(new THREE.TorusGeometry(r*(0.5+q*0.18),0.8,4,22),m);
       ring.rotation.x=Math.PI/2;ring.position.y=q*r*0.36;g.add(ring);}
     const col=new THREE.Mesh(new THREE.CylinderGeometry(r*0.22,r*0.3,r*1.5,8,1,true),m);col.position.y=r*0.6;g.add(col);
     g.position.set(px,groundH(px,pz)+30+NR()*40,pz);scene.add(g);
     hm.push(m);animHooks.push(now=>{g.rotation.y=now*0.00018*(1+NR()*0);});}
   lit.push(...hm);}

  // ---- spinners: traffic in the air, in lanes, going somewhere at a steady clip ----
  const spinners=[];
  {const want=N.spinners||0;
   const bodyG=new THREE.BoxGeometry(5.4,1.5,2.4),finG=new THREE.BoxGeometry(1.6,0.5,4.4);
   const bodyM=new THREE.MeshLambertMaterial({color:0x1b1e24}),
         headM=new THREE.MeshBasicMaterial({color:0xfff0c8}),tailM=new THREE.MeshBasicMaterial({color:0xff2a2a});
   const bodies=new THREE.InstancedMesh(bodyG,bodyM,Math.max(1,want)),fins=new THREE.InstancedMesh(finG,bodyM,Math.max(1,want)),
         heads=new THREE.InstancedMesh(new THREE.SphereGeometry(0.55,6,5),headM,Math.max(1,want)),
         tails=new THREE.InstancedMesh(new THREE.SphereGeometry(0.45,6,5),tailM,Math.max(1,want));
   for(const m of [bodies,fins,heads,tails])m.frustumCulled=false;
   const LANES=N.lanes||[70,120,180,250];
   for(let k=0;k<want;k++){const lane=LANES[k%LANES.length],a=NR()*Math.PI*2,r=300+NR()*1700;
     spinners.push({y:lane+NR()*18,a,r,cx:B.cx+(NR()-0.5)*500,cz:B.cz+(NR()-0.5)*500,
       v:(NR()<0.5?-1:1)*(0.00006+NR()*0.00007),bob:NR()*6.28});}
   bodies.count=fins.count=heads.count=tails.count=spinners.length;
   if(spinners.length)scene.add(bodies,fins,heads,tails);
   animHooks.push(now=>{
     spinners.forEach((s,i)=>{const a=s.a+now*s.v,x=s.cx+Math.cos(a)*s.r,z=s.cz+Math.sin(a)*s.r,
       y=s.y+Math.sin(now*0.0004+s.bob)*3,head=a+(s.v>0?Math.PI/2:-Math.PI/2);
       D.position.set(x,y,z);D.rotation.set(0,-head,0.06*Math.sin(now*0.0007+s.bob));D.scale.set(1,1,1);D.updateMatrix();
       bodies.setMatrixAt(i,D.matrix);fins.setMatrixAt(i,D.matrix);
       D.position.set(x+Math.cos(head)*3.1,y,z+Math.sin(head)*3.1);D.updateMatrix();heads.setMatrixAt(i,D.matrix);
       D.position.set(x-Math.cos(head)*3.1,y,z-Math.sin(head)*3.1);D.updateMatrix();tails.setMatrixAt(i,D.matrix);});
     for(const m of [bodies,fins,heads,tails])m.instanceMatrix.needsUpdate=true;});}

  // ---- flare stacks: the flats burn off whatever they are making out there ----
  let flares=0;
  {const m=new THREE.MeshLambertMaterial({color:0x3f3b36}),fires=[];
   const flameM=[0,1,2].map(()=>new THREE.MeshBasicMaterial({color:0xff8420,transparent:true,opacity:0.9}));
   const smokeM=new THREE.MeshLambertMaterial({color:0x2a2724,transparent:true,opacity:0.3,depthWrite:false});
   for(const a of AREAS){if(a.kind!=='industrial')continue;
     for(let k=0;k<(N.flares||0)/2&&flares<(N.flares||0);k++){
       const px=a.bb.x0+NR()*(a.bb.x1-a.bb.x0),pz=a.bb.z0+NR()*(a.bb.z1-a.bb.z0);
       if(!inMap(px,pz,40)||inWater(px,pz))continue;
       const gy=groundH(px,pz),H=60+NR()*70;
       const st=new THREE.Mesh(new THREE.CylinderGeometry(2.4,4.2,H,10).translate(0,H/2,0),m);st.position.set(px,gy,pz);scene.add(st);
       for(let q=0;q<3;q++){const leg=new THREE.Mesh(new THREE.BoxGeometry(0.7,H*0.7,0.7).translate(0,H*0.35,0),m);
         const aa=q/3*Math.PI*2;leg.position.set(px+Math.cos(aa)*6,gy,pz+Math.sin(aa)*6);leg.rotation.set(Math.sin(aa)*0.1,0,-Math.cos(aa)*0.1);scene.add(leg);}
       const fm=flameM[flares%3];
       const fl=new THREE.Mesh(new THREE.ConeGeometry(3.4,16,8).translate(0,8,0),fm);fl.position.set(px,gy+H,pz);scene.add(fl);
       const sm=[];for(let q=0;q<4;q++){const p=new THREE.Mesh(new THREE.SphereGeometry(7,7,5),smokeM);p.position.set(px,gy+H,pz);scene.add(p);sm.push(p);}
       const lamp=new THREE.PointLight(0xff7a20,0,260);lamp.position.set(px,gy+H+8,pz);scene.add(lamp);
       fires.push({fl,sm,px,pz,gy,H,lamp,ph:NR()*6.28});flares++;}}
   if(fires.length)animHooks.push(now=>{const n=nightF(hour());
     for(const f of fires){const k=0.65+0.35*Math.sin(now*0.009+f.ph)+0.18*Math.sin(now*0.023+f.ph*2);
       f.fl.scale.set(0.75+0.35*k,k,0.75+0.35*k);f.lamp.intensity=(0.5+0.6*n)*k;
       f.sm.forEach((p,i)=>{const t=((now/6000)+i/4+f.ph)%1;p.position.set(f.px+t*40,f.gy+f.H+8+t*90,f.pz+t*16);p.scale.setScalar(1+t*3.6);});}
     for(let i=0;i<3;i++)flameM[i].opacity=0.75+0.25*Math.sin(now*0.011+i*2);
     smokeM.opacity=0.26;});}

  // ---- steam off the gratings ----
  {const want=N.steam||0,cols=[];
   const sm=new THREE.MeshBasicMaterial({color:0xb9c3cc,transparent:true,opacity:0.12,depthWrite:false});
   for(let k=0;k<want;k++){const r=ROADS[Math.floor(NR()*ROADS.length)];if(!r||r.pts.length<2)continue;
     const i=Math.floor(NR()*(r.pts.length-1)),[ax,az]=r.pts[i];
     const px=ax+(NR()-0.5)*r.w,pz=az+(NR()-0.5)*r.w;
     if(!inMap(px,pz,10)||inWater(px,pz))continue;
     const g=new THREE.Mesh(new THREE.CylinderGeometry(1.4,3.4,14,7,1,true).translate(0,7,0),sm);
     g.position.set(px,groundH(px,pz),pz);scene.add(g);cols.push({g,ph:NR()*6.28});}
   if(cols.length)animHooks.push(now=>{for(const c of cols){const k=0.7+0.3*Math.sin(now*0.0011+c.ph);
     c.g.scale.set(k,1+0.25*Math.sin(now*0.0008+c.ph),k);}});}

  // ---- rain: a column of streaks that rides along with the camera ----
  if(N.rain){const nDrops=N.rain,pos=new Float32Array(nDrops*6),vel=new Float32Array(nDrops),len=new Float32Array(nDrops);
   const SPREAD=150,TOP=90;
   for(let i=0;i<nDrops;i++){const x=(NR()-0.5)*SPREAD,y=NR()*TOP,z=(NR()-0.5)*SPREAD;
     vel[i]=58+NR()*46;len[i]=1.4+NR()*1.8;
     pos[i*6]=x;pos[i*6+1]=y;pos[i*6+2]=z;pos[i*6+3]=x+0.25;pos[i*6+4]=y-len[i];pos[i*6+5]=z;}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
   const rm=new THREE.LineBasicMaterial({color:0x8fa4b8,transparent:true,opacity:0.3,depthWrite:false});
   const streaks=new THREE.LineSegments(g,rm);streaks.frustumCulled=false;scene.add(streaks);
   let last=performance.now();
   animHooks.push(now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
     for(let i=0;i<nDrops;i++){let y=pos[i*6+1]-vel[i]*dt;
       if(y<-4){y=TOP;const x=(NR()-0.5)*SPREAD,z=(NR()-0.5)*SPREAD;pos[i*6]=x;pos[i*6+2]=z;pos[i*6+3]=x+0.25;pos[i*6+5]=z;}
       pos[i*6+1]=y;pos[i*6+4]=y-len[i];}
     g.attributes.position.needsUpdate=true;
     streaks.position.set(camera.position.x,camera.position.y-TOP*0.5,camera.position.z);
     rm.opacity=0.12+0.2*nightF(hour());});}

  // ---- blade signs: the wall of the street is stacked with them, projecting out so you read them end-on ----
  let blades=0;
  {const want=N.blades||0;
   const WORDS=CJK_OK
     ?['食堂','酒','薬局','電気','銀行','市場','ラーメン',
       'バー','寿司','珈琺','旅館','質屋','医院','24時間',
       '出口','発電','機械','工場','通信','保安','夜市',
       '龍','月光','火鍋','電脳','義体','情報','無料',
       '両替','修理']
     :['SHOKUDO','SAKE','YAKKYOKU','DENKI','GINKO','ICHIBA','RAMEN','BAR','SUSHI','KOHI','RYOKAN','SHICHIYA',
       'IIN','24H','DEGUCHI','HATSUDEN','KIKAI','KOJO','TSUSHIN','HOAN','YOICHI','RYU','GEKKO','NABE','DENNO',
       'GITAI','JOHO','MURYO','RYOGAE','SHURI'];
   // one texture to a word, and every sign using that word instanced together
   const per=Math.max(1,Math.ceil(want/WORDS.length));
   const geo=new THREE.PlaneGeometry(1,1);
   const sets=WORDS.map(w=>{const m=new THREE.MeshBasicMaterial({map:bladeTex(w,'#'+pickNeon().getHexString()),
     transparent:true,side:THREE.DoubleSide,depthWrite:false});
     const im=new THREE.InstancedMesh(geo,m,per);im.count=0;im.frustumCulled=false;return {m,im,n:0,chars:w.length};});
   const pick=sampler(ROADS.filter(r=>(r.c==='residential'||r.c==='secondary')&&r.len>20));
   for(let tries=0;tries<want*14&&blades<want;tries++){
         const q=pick();if(!q)break;const {r,dx,dz}=q;
         const sd=NR()<0.5?-1:1,ox=-dz*sd,oz=dx*sd;
         const px=q.x+ox*(r.w/2+0.7),pz=q.z+oz*(r.w/2+0.7);
         if(!inMap(px,pz,10)||inWater(px,pz))continue;
         const roof=roofAt(px+ox*3,pz+oz*3);if(roof<9)continue;
         const set=sets[Math.floor(NR()*sets.length)];if(set.n>=per)continue;
         const h=3.4+NR()*2.0,ph=h*set.chars,gy=groundH(px,pz);
         const y=gy+5+NR()*Math.max(1,roof-ph-6);
         D.position.set(px+ox*(ph*0.30),y,pz+oz*(ph*0.30));
         D.rotation.set(0,Math.atan2(dx,dz),0);D.scale.set(h*0.82,ph,1);D.updateMatrix();
         set.im.setMatrixAt(set.n++,D.matrix);blades++;}
   for(const st of sets){st.im.count=st.n;if(st.n){scene.add(st.im);lit.push(st.m);}}}

  // ---- lantern strings over the side streets ----
  let lanterns=0;
  {const want=N.lanterns||0,lm=new THREE.MeshBasicMaterial({color:0xff7a4a,transparent:true,opacity:0.9});
   const im=new THREE.InstancedMesh(new THREE.SphereGeometry(0.42,7,5),lm,Math.max(1,want));
   const wire=[];const pick=sampler(ROADS.filter(r=>r.c==='residential'&&r.len>40));
   for(let tries=0;tries<want*3&&lanterns<want;tries++){
     const q=pick();if(!q)break;const {r,dx,dz}=q;
     const cx2=q.x,cz2=q.z;if(!inMap(cx2,cz2,10)||inWater(cx2,cz2))continue;
     if(roofAt(cx2-dz*(r.w/2+3),cz2+dx*(r.w/2+3))<7)continue;
     const gy=groundH(cx2,cz2),top=gy+9+NR()*5,span=r.w+3,n=6+Math.floor(NR()*6);
     for(let k=0;k<=n&&lanterns<want;k++){const t=k/n,sag=Math.sin(t*Math.PI)*1.8;
       const px=cx2-dz*(t-0.5)*span,pz=cz2+dx*(t-0.5)*span;
       D.position.set(px,top-sag,pz);D.rotation.set(0,0,0);D.scale.setScalar(0.8+NR()*0.8);D.updateMatrix();
       im.setMatrixAt(lanterns++,D.matrix);
       if(k)wire.push(new THREE.Vector3(px,top-sag,pz),new THREE.Vector3(cx2-dz*((k-1)/n-0.5)*span,top-Math.sin((k-1)/n*Math.PI)*1.8,cz2+dx*((k-1)/n-0.5)*span));}}
   im.count=lanterns;if(lanterns){scene.add(im);lit.push(lm);
     scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wire),new THREE.LineBasicMaterial({color:0x14100e})));}}

  // ---- market awnings, and the light under them ----
  let awnings=0;
  {const want=N.awnings||0;
   const am=new THREE.MeshLambertMaterial({color:0x6a3b34}),gm=new THREE.MeshBasicMaterial({color:0xffb46a,transparent:true,opacity:0.55});
   const A1=new THREE.InstancedMesh(new THREE.BoxGeometry(3.6,0.3,2.4),am,Math.max(1,want)),
         G1=new THREE.InstancedMesh(new THREE.BoxGeometry(3.2,0.12,2.0),gm,Math.max(1,want));
   const pick=sampler(ROADS.filter(r=>(r.c==='residential'||r.c==='secondary')&&r.len>20));
   for(let tries=0;tries<want*14&&awnings<want;tries++){
         const q=pick();if(!q)break;const {r,dx,dz}=q;
         const sd=NR()<0.5?-1:1,ox=-dz*sd,oz=dx*sd;
         const px=q.x+ox*(r.w/2-1.1),pz=q.z+oz*(r.w/2-1.1);
         if(!inMap(px,pz,8)||inWater(px,pz))continue;
         if(roofAt(px+ox*2.5,pz+oz*2.5)<5)continue;
         const gy=groundH(px,pz),head=Math.atan2(dz,dx);
         D.position.set(px,gy+3.3,pz);D.rotation.set(0,-head,0.12*sd);D.scale.set(1,1,1);D.updateMatrix();
         A1.setMatrixAt(awnings,D.matrix);
         D.position.set(px,gy+3.05,pz);D.rotation.set(0,-head,0);D.updateMatrix();G1.setMatrixAt(awnings,D.matrix);
         awnings++;}
   A1.count=G1.count=awnings;if(awnings){scene.add(A1,G1);lit.push(gm);}}

  // ---- the cable tangle: nobody has taken a wire down in this city in fifty years ----
  {const want=N.cables||0,pts=[];
   for(let k=0;k<want*6;k++){
     const px=(NR()-0.5)*B.w*0.8+B.cx,pz=(NR()-0.5)*B.d*0.8+B.cz;
     const r1=roofAt(px,pz);if(r1<8||r1>90)continue;
     const a=NR()*Math.PI*2,d=18+NR()*40,qx=px+Math.cos(a)*d,qz=pz+Math.sin(a)*d;
     const r2=roofAt(qx,qz);if(r2<8||r2>90)continue;
     const y1=groundH(px,pz)+r1*(0.55+NR()*0.4),y2=groundH(qx,qz)+r2*(0.55+NR()*0.4);
     const mid=new THREE.Vector3((px+qx)/2,Math.min(y1,y2)-2.5-NR()*3,(pz+qz)/2);
     const a0=new THREE.Vector3(px,y1,pz),b0=new THREE.Vector3(qx,y2,qz);
     for(let i=0;i<5;i++){const t0=i/5,t1=(i+1)/5;
       const p0=a0.clone().lerp(mid,t0*2>1?1:t0*2),p1=a0.clone().lerp(mid,t1*2>1?1:t1*2);
       if(t0>=0.5)p0.copy(mid).lerp(b0,(t0-0.5)*2);
       if(t1>=0.5)p1.copy(mid).lerp(b0,(t1-0.5)*2);
       pts.push(p0,p1);}
     if(pts.length>want*12)break;}
   if(pts.length)scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts),
     new THREE.LineBasicMaterial({color:0x0d0e11})));}

  // ---- the antenna forest on every roof ----
  let masts=0;
  {const want=N.antennas||0,mm=new THREE.MeshLambertMaterial({color:0x2a2c30});
   const M1=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.1,0.16,1,4).translate(0,0.5,0),mm,Math.max(1,want)),
         D1=new THREE.InstancedMesh(new THREE.CylinderGeometry(1.5,1.5,0.25,8),mm,Math.max(1,Math.floor(want/3)));
   let dishes=0;
   for(let k=0;k<want*4&&masts<want;k++){
     const px=(NR()-0.5)*B.w*0.86+B.cx,pz=(NR()-0.5)*B.d*0.86+B.cz;
     const roof=roofAt(px,pz);if(roof<8)continue;
     const y=groundH(px,pz)+roof;
     D.position.set(px,y,pz);D.rotation.set(0,NR()*3,0);D.scale.set(1,3+NR()*11,1);D.updateMatrix();
     M1.setMatrixAt(masts++,D.matrix);
     if(NR()<0.3&&dishes<Math.floor(want/3)){D.position.set(px+NR()*3,y+1.4,pz+NR()*3);
       D.rotation.set(0.7+NR()*0.4,NR()*6.28,0);D.scale.setScalar(0.7+NR()*0.8);D.updateMatrix();
       D1.setMatrixAt(dishes++,D.matrix);}}
   M1.count=masts;D1.count=dishes;if(masts)scene.add(M1,D1);}

  // everything neon fades back in the daylight it never really gets, scaled from whatever it was built at
  // rather than set outright - a hologram is meant to stay a ghost after dark, not turn into a solid slab
  {const base=lit.map(m=>(m.opacity===undefined?1:m.opacity));
   animHooks.push(()=>{const n=0.35+0.65*nightF(hour());
     lit.forEach((m,i)=>{if(m.transparent)m.opacity=base[i]*n;});});}
  ctx.details=Object.assign(ctx.details||{},{neonSigns:signs,billboards:boards.length,billboardAt:boards.slice(0,6).map(b=>b.at.join(',')).join(' | '),bladeSigns:blades,lanterns,awnings,antennas:masts,spinners:spinners.length,flares,cjkFonts:CJK_OK});
}
