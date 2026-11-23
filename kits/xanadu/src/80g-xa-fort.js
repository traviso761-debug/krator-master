// ================================================================= XANADU — the Xanadui fort, drawn (settlements/strongwall/PLAN.md section 5, F2-F3)
// Draws XFORT's plan (80f-xa-fort-data.js): the curtains (a rubble talus, a battered body, the walk, pointed merlons on
// the outer edge), the towers (square and battered, or drums), the gates (an iwan between two gate towers, the main one
// with its gilt pavilion), the water gate, the keep (white storeys, the red chapel with its gilt roof: the only gold
// but the gate's, the owner, 2026-11-16), the barracks, magazine, granary, stables, cistern, guns, the beacon, and at
// Strongwall the assay court, the strongroom, the barbican and the Golden Tears' court. Four defs, each in three
// states (o.v 0 kept, 1 damaged, 2 ruined: XFORT.damage, hashed): the watch fort (the Marches'), Strongwall (the march
// fort), the gate works, the watch post. A damaged or ruined fort's rubble is a core/terrain KRUBBLE heap (decoration to
// core/ruins); its fallen pieces are seated on their lowest points (core/ruins' rule); targets/sheet/91u-xasheet-ruins.js
// watches every one with KRUINS. Seeds 32000-32399.
const XF_STATES=['kept','damaged','ruined'];
const XF_SEED={watch:32011,march:32111,gate:32211,post:32311};
const XF_PLANS={watch:XFORT.plan({size:'watch'}),march:XFORT.plan({size:'march'}),gate:XFORT.plan({size:'gate'})};
const XF_MAIN={watch:'gate',march:'gate.qiblai',gate:'gate'};   /* the gate with the gilt pavilion (the owner, 2026-11-16: "Gold on gate pavilion and chapel") */
function xfCols(dress){const C={stone:xC(xPick(XPAL.stone)),wash:xC(xPick(XPAL.wash)),rubble:xC(xPick(XPAL.rubble)),earth:xC(xPick(XPAL.earth)),red:xC(xPick(XPAL.redwall)),
  maroon:xC(xPick(XPAL.maroon)),tile:xC(xPick([0x8a4a32,0x7a4030,0x96543a])),tim:xC(xPick(XPAL.dark)),iron:xC(0x2e2a26),bronze:xC(0x7a5a32),dress};
 C.body=dress==='royal'?C.stone:dress==='earth'?C.earth:C.wash;C.bodyItem=dress==='royal'?'xWallD':dress==='earth'?'xWallE':'xWallW';C.batKind=dress==='royal'?'dressed':dress==='earth'?'earth':'wash';
 C.scorch=c=>c.clone().multiplyScalar(.42);return C;}
const xfQ=ry=>qEuler(0,ry,0);
/* a box lying on the ground on its lowest points: centre height from its rotated extents, sunk a little (core/ruins' rule) */
function xfSeat(item,x,z,ry,tx,rz,s,c,sink){const q=vQ(ry,tx,rz),m=new THREE.Matrix4().makeRotationFromQuaternion(q).elements;
 const hy=(Math.abs(m[1])*s[0]+Math.abs(m[5])*s[1]+Math.abs(m[9])*s[2])/2;kput(item,[x,hy-(sink==null?.12:sink),z],q,s,c);}
/* a KRUBBLE heap drawn into the site's group: decoration to core/ruins (its blocks rest on its bed, the bed on the ground) */
function xfHeap(H,c){if(typeof KRUBBLE==='undefined')return;const G=VERN.cur&&VERN.cur.G;if(!G)return;
 const h=KRUBBLE.heap(Object.assign({cover:2.2,blocks:Math.round(6+H.rx),size:[.6,1.8]},H)),o=KRUBBLE.mesh(h,{cell:2}),g=new THREE.BufferGeometry(),uv=new Float32Array(o.uv.length);
 for(let i=0;i<uv.length;i++)uv[i]=o.uv[i]/3;g.setAttribute('position',new THREE.BufferAttribute(o.pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(new THREE.BufferAttribute(new Uint32Array(o.idx),1));g.computeVertexNormals();
 const M=new THREE.Mesh(g,MAT.xRubble);M.position.y=XF_Y;M.userData.decor=true;M.name='rubble '+H.id;if(c&&M.material.color){M.material=M.material.clone();M.material.color.copy(c);}G.add(M);}
// ---------------------------------------------------------------- a stretch of curtain (u0..u1 of c), h high; o.merlons, o.band
function xfCurtain(c,u0,u1,h,C,o){o=o||{};const a=[c.a[0]+(c.b[0]-c.a[0])*u0,c.a[1]+(c.b[1]-c.a[1])*u0],b=[c.a[0]+(c.b[0]-c.a[0])*u1,c.a[1]+(c.b[1]-c.a[1])*u1];
 const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.3||h<.3)return;const ry=Math.atan2(dx,dz)-Math.PI/2,m=[(a[0]+b[0])/2,(a[1]+b[1])/2],Q=xfQ(ry),base=Math.min(1.4,h);
 kput('xWallS',[m[0],0,m[1]],Q,[L,base,c.t+.9],C.rubble);   /* the rubble talus the curtain stands on */
 if(h>base)kput(C.bodyItem,[m[0],base,m[1]],Q,[L,h-base,c.t],o.scorch?C.scorch(C.body):C.body);
 if(!o.merlons)return;const tw=c.t*.82,on=(k)=>[m[0]+c.out[0]*k,m[1]+c.out[1]*k];
 vB('vStone',m[0],h-.12,m[1],L,.14,tw,ry,C.stone);   /* the walk */
 const ip=on(-(tw/2-.2));vB('vStone',ip[0],h,ip[1],L,.5,.35,ry,C.stone);   /* the inner lip */
 const n=Math.max(1,Math.round(L/1.5));for(let i=0;i<=n;i++){const t=-L/2+.3+(L-.6)*i/n,p=loc(m[0],m[1],t,0,ry),q=[p[0]+c.out[0]*(tw/2-.28),p[1]+c.out[1]*(tw/2-.28)];
  vB(C.dress==='earth'?'xEarthB':'vStone',q[0],h,q[1],.62,1.25,.5,ry,C.body);kput(C.dress==='royal'?'xArcS':'xArcW',[q[0],h+1.25,q[1]],Q,[.62,.4,.5],C.body);}
 const op=on(tw/2-.05);vB('vStone',op[0],h-.5,op[1],L,.5,.4,ry,C.stone);   /* the string course under the merlons */
 if(o.band&&L>3){const bp=on(tw/2+.06);vB('xBandB',bp[0],h-1.3,bp[1],L-.4,.6,.12,ry,C.maroon);}}
/* a stair up the inner face of a curtain, along it, to the walk (XFORT.walks' record: its foot on the curtain's line, its
   direction, its head on plain walk); walked (core/walk): the flight a strip from the ground to its head, a landing onto the walk */
const xfW3=(x,y,z)=>{const v=IZDOOR._w(x,y,z);return[v[0],v[2],v[1]];};   /* a point for KWALK's strips: [x, z, y] in the world */
function xfStair(c,s,h,C,tag){const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),dx=(c.b[0]-c.a[0])/L*s.dir,dz=(c.b[1]-c.a[1])/L*s.dir,off=c.t/2+.75;
 const p=[s.foot[0]-c.out[0]*off,s.foot[1]-c.out[1]*off],hd=[s.head[0]-c.out[0]*off,s.head[1]-c.out[1]*off];
 xnFlight(p[0],0,p[1],Math.atan2(-dx,-dz),1.4,h-.1,'vStone',C.stone);
 if(typeof KWALK==='undefined'||!tag)return null;
 KWALK.strip({a:xfW3(p[0],0,p[1]),b:xfW3(hd[0],h,hd[1]),w:1.3,name:'stair',tag});KWALK.strip({a:xfW3(hd[0],h,hd[1]),b:xfW3(s.head[0],h,s.head[1]),w:1.3,name:'stair head',tag});
 return IZDOOR._w(p[0]+dx*.4,.2,p[1]+dz*.4);}   /* the foot, [x, y, z] for KWALK.reach (its strips take [x, z, y]) */
/* the walks of a standing fort (XFORT.walks, F4b): the plain walk between the towers and gatehouses, a flight up the walk onto
   each kept tower it meets and that tower's top, the stairs from the ward. Every piece a stair reaches is a core/walk strip;
   the flights are drawn whether or not they are reached. -> {feet, n} */
function xfWalks(P,W,C,tag){const has=typeof KWALK!=='undefined',feet=[],cur=id=>P.curtains.find(q=>q.id===id);let n=0;
 W.walks.forEach(w=>{if(!w.reached||!has)return;const c=cur(w.curtain);KWALK.strip({a:xfW3(w.a[0],w.y,w.a[1]),b:xfW3(w.b[0],w.y,w.b[1]),w:Math.max(.9,c.t*.82-.9),name:'wall walk',tag});n++;});
 W.flights.forEach(f=>{const dx=f.head[0]-f.foot[0],dz=f.head[1]-f.foot[1],ry=Math.atan2(-dx,-dz),rise=f.y1-f.y0;
  if(f.steep){const S=XFORT.STEEP,n=Math.max(2,Math.round(rise/S.riser));   /* a steep stair (xnFlight's form, 0.20 m risers on 0.25 m treads) */
   for(let k=0;k<n;k++){const p=loc(f.foot[0],f.foot[1],0,-(k+.5)*S.tread,ry);vB('vStone',p[0],f.y0,p[1],1.2,rise*(k+1)/n,S.tread+.01,ry,C.stone);}}
  else xnFlight(f.foot[0],f.y0,f.foot[1],ry,1.4,rise,'vStone',C.stone);
  if(f.reached&&has){KWALK.strip({a:xfW3(f.foot[0],f.y0,f.foot[1]),b:xfW3(f.head[0],f.y1,f.head[1]),w:1.3,name:'tower stair',tag});n++;}});
 W.tops.forEach(t=>{if(t.reached&&has){KWALK.strip({a:xfW3(t.a[0],t.y,t.a[1]),b:xfW3(t.b[0],t.y,t.b[1]),w:1.6,name:'tower top',tag});n++;}});
 W.stairs.forEach(s=>{const c=cur(s.curtain),f=xfAt(XFORT.recY(P,c),()=>xfStair(c,s,c.h,C,tag));if(f)feet.push(f);});   /* a stair climbs from its own ward's ground */
 return{feet,n};}
/* a square tower's crenellated parapet (72 xnCrenel's, square and unturned) that stands aside where a flight reaches it: the low
   wall cut and no merlon within 1.4 m of a gap */
function xfCrenel(x,y,z,w,c,gaps){const t=.5,h=1.25,G=gaps||[],near=(px,pz)=>G.some(g=>Math.hypot(g[0]-px,g[1]-pz)<1.4);
 for(const s of[-1,1])for(const ax of[0,1]){   /* a side: along x (ax 0) at z+s*(w/2-t/2), or along z at x+s*(w/2-t/2) */
  const fix=s*(w/2-t/2),cuts=G.filter(g=>Math.abs((ax?g[0]-x:g[1]-z)-fix)<1.6).map(g=>ax?g[1]-z:g[0]-x).sort((p,q)=>p-q);let a=-w/2;
  for(const g of cuts.concat([null])){const b=g==null?w/2:g-.8;if(b-a>.2){const m=(a+b)/2;vB('vStone',ax?x+fix:x+m,y,ax?z+m:z+fix,ax?t:b-a,h*.45,ax?b-a:t,0,c);}a=g==null?a:g+.8;}}
 const put=(lx,lz)=>{if(near(x+lx,z+lz))return;vB('vStone',x+lx,y,z+lz,.6,h,.6,0,c);kput('xArcW',[x+lx,y+h,z+lz],qEuler(0,0,0),[.6,.4,.6],c);};
 const n=Math.max(1,Math.round(w/1.3));for(let i=0;i<=n;i++)for(const s of[-1,1])put(-w/2+t/2+(w-t)*i/n,s*(w/2-t/2));
 for(let j=1;j<n;j++)for(const s of[-1,1])put(s*(w/2-t/2),-w/2+t/2+(w-t)*j/n);}
// ---------------------------------------------------------------- a tower: keep the fraction of its height; fallen: its top lies at its foot
function xfTower(t,C,o,id){o=o||{};const f=o.keep==null?1:o.keep,h=t.h*f,x=t.ctr[0],z=t.ctr[1],col=o.scorch?C.scorch(C.body):C.body;
 if(t.form==='drum'){const r=t.r;kput(C.dress==='earth'?'xDrumE':'xDrumS',[x,0,z],null,[r,h,r],col);
  if(f>=1){kput('xDrumS',[x,h,z],null,[r*1.08,.8,r*1.08],C.stone);for(let k=0;k<14;k++){const a=k/14*TAU,mx=x+Math.sin(a)*r*.98,mz=z+Math.cos(a)*r*.98;
    if((o.gaps||[]).some(g=>Math.hypot(g[0]-mx,g[1]-mz)<1.4))continue;vB('vStone',mx,h+.8,mz,.62,1.2,.5,a,C.stone);}
   for(let k=0;k<4;k++){const a=k/4*TAU+.4;xnRoom(x+Math.sin(a)*(r+.02),h*.55,z+Math.cos(a)*(r+.02),.28,1.2,.1,a);}}}
 else{const w=t.w,k=xnWall(x,0,z,w,h,w,0,col,C.batKind),tw=w*k;
  if(f>=1){vB('vStone',x,h-.15,z,tw+.3,.18,tw+.3,0,C.stone);xfCrenel(x,h,z,tw+.2,C.body,o.gaps);
   if(C.dress==='royal'&&tw>5)xnBand(x,h-1.4,z,tw,tw,0,.6,C.maroon);
   /* a signal tower (t.kind 'great' or t.signal: the House of the Tempest's Storm Tower, sheets T1, T2): the fire's iron basket on its
      roof, and a bronze signal mirror on a post at each corner, turned outward to read and answer the relay's flashes */
   if(t.kind==='great'||t.signal){vB('vStone',x,h+.03,z,2.2,.5,2.2,0,C.stone);vB('vIron',x,h+.53,z,.18,1.6,.18,0,C.iron);kput('xDrumE',[x,h+2.13,z],null,[.75,.7,.75],C.iron);vB('xRubB',x,h+2.5,z,.9,.35,.9,0,xC(0x3a2e24));
    for(const sx of[-1,1])for(const sz of[-1,1]){const px=x+sx*(tw/2-1.3),pz=z+sz*(tw/2-1.3),a=Math.atan2(sx,sz);vB('vWood',px,h+.03,pz,.16,2.4,.16,0,C.tim);
     kput('xDrumE',[px+Math.sin(a)*.12,h+2.4,pz+Math.cos(a)*.12],qEuler(0,a,0).multiply(qEuler(Math.PI/2,0,0)),[.55,.06,.55],C.bronze);}}
   for(const a of[0,Math.PI/2,Math.PI,-Math.PI/2]){const p=loc(x,z,0,tw/2*1.04+.02,a);xnRoom(p[0],h*.6,p[1],.3,1.2,.1,a);}}}
 if(o.fallen&&f<1){/* the top storey's wreck: blocks seated outside its foot, a heap under them */
  const out=t.at[0]===x&&t.at[1]===z?[0,1]:[x-t.at[0],z-t.at[1]],ol=Math.max(1e-6,Math.hypot(out[0],out[1])),R=XFORT.half(t),s=KRAND.stream(KRAND.child((o.seed==null?1:o.seed),id));
  const fx=x+out[0]/ol*(R+3.5),fz=z+out[1]/ol*(R+3.5);xfHeap({id:'tower.'+id,x:fx,z:fz,rx:R+1.5,rz:R*.9+1,ry:Math.atan2(out[1],out[0]),h:1.6,seed:KRAND.child((o.seed==null?1:o.seed),id+'.heap')},C.rubble);
  for(let i=0;i<5;i++){const a=s.range(-.9,.9)+Math.atan2(out[0]/ol,out[1]/ol),d=R+1.5+s.range(0,4);
   xfSeat('vStone',x+Math.sin(a)*d,z+Math.cos(a)*d,s.range(0,TAU),s.range(-.5,.5),s.range(-.4,.4),[s.range(1,2.4),s.range(.5,1),s.range(.7,1.6)],C.body);}}}
// ---------------------------------------------------------------- a gate: the gatehouse over the curtain, its iwan and leaves; burnt, gone
function xfGate(g,c,C,state,main,go){go=go||{};const ry=g.ry,x=g.at[0],z=g.at[1],GH=XFORT.gateHouse(g,c),gw=GH.w,gd=GH.d,gh=GH.h;   /* the block XFORT.walks ends the walk at */
 if(state==='gone'){for(const s of[-1,1]){const p=loc(x,z,s*(g.w/2+.8),0,ry);xnWall(p[0],0,p[1],1.6,gh*.35,gd,ry,C.body,C.batKind);}return;}
 const col=state==='burnt'?C.scorch(C.wash):C.wash;xnWall(x,0,z,gw,gh,gd,ry,col,'wash');
 const P=(u,v)=>loc(x,z,u,v,ry),front=P(0,gd/2),back=P(0,-gd/2);
 kput('xArchS',[front[0],0,front[1]],xfQ(ry),[g.w+1.4,g.w*1.45+1,.45],C.stone);kput('xArchS',[back[0],0,back[1]],xfQ(ry+Math.PI),[g.w+1.4,g.w*1.45+1,.45],C.stone);
 if(state==='burnt'){for(const s of[1,-1]){const q=P(0,s*(gd/2+.04));xnRoom(q[0],0,q[1],g.w,g.w*1.4,.06,s>0?ry:ry+Math.PI);}   /* the leaves burnt away: the passage's dim back */
  /* what the fire left of the outer leaves (before the dim panel that closes the passage): a charred stump at each jamb,
     standing on the ground, and one leaf fallen flat on the approach, seated on its lowest points (core/ruins' rule) */
  const char=xC(0x231a14),lw=g.w/2-.1,ll=Math.min(g.w*.9,gd-1.2);for(const sd of[-1,1]){const q=P(sd*(g.w/2-.35),gd/2+.25);vB('vWood',q[0],0,q[1],.5,g.w*.45,.16,ry+sd*.08,char);}
  const fl=P(lw*.2,gd/2+ll/2+.9);xfSeat('vWood',fl[0],fl[1],ry+.2,Math.PI/2,0,[lw*.9,ll,.14],char);}
 else{for(const s of[1,-1]){const q=P(0,s*(gd/2+.02));xnDoorway(q[0],0,q[1],s>0?ry:ry+Math.PI,g.w,g.w*1.4,{c:C.tim});}
  for(let k=0;k<4;k++){const q=P(0,gd/2+.12);vB('vIron',q[0],.8+k*g.w*.3,q[1],g.w*.96,.08,.04,ry,C.iron);}}
 const top=xnFlatRoof(x,gh,z,gw,gd,ry,col,{band:C.dress==='royal'?C.maroon:null,parapet:false});xnCrenel(x,top,z,gw+.1,gd+.1,ry,1.2,col,{pointed:true});
 const rp=P(0,gd/2+.02);xnRoundel(rp[0],gh-1.1,rp[1],ry,1.3);
 /* the Ancient lamp's cable (beacon:'ancient'): a stone channel cover in the passage's paving, along its west side, out to the
    lamp ward the page draws outside the gate */
 if(go.cable){const q=P(-(g.w/2-.45),0);vB('vStone',q[0],0,q[1],.5,.06,gd+.4,ry,C.stone);}
 if(main&&state!=='burnt')xnGiltRoof(x,top,z,Math.min(gw-2,6),Math.min(gd-2,4),ry,{frame:1.6,over:.8});}
/* the water gate: arches through the curtain with iron grilles, cutwaters before them (Kruk Gill) */
function xfWaterGate(g,c,C,gone){const ry=g.ry,x=g.at[0],z=g.at[1],P=(u,v)=>loc(x,z,u,v,ry),h=gone?c.h*.4:c.h;
 xnWall(x,0,z,g.w,h,c.t+1.2,ry,C.body,C.batKind);if(gone)return;
 for(const u of[-g.w/3,0,g.w/3]){for(const s of[1,-1]){const q=P(u,s*((c.t+1.2)/2+.03)),r=s>0?ry:ry+Math.PI;
   kput('xArchS',[q[0],0,q[1]],xfQ(r),[2.8,5.4,.4],C.stone);xnRoom(q[0],0,q[1],2.2,4.6,.06,r);
   if(s>0)for(let k=-2;k<=2;k++){const b=P(u+k*.42,(c.t+1.2)/2+.14);vB('vIron',b[0],0,b[1],.07,4.4,.07,ry,C.iron);}}
  const cw=P(u,(c.t+1.2)/2+1.1);vB('vStone',cw[0],0,cw[1],.9,1.6,1.8,ry,C.stone);}}
// ---------------------------------------------------------------- the keep: white storeys, the red chapel with the gilt roof, the beacon
function xfKeep(b,C,o){o=o||{};if(o.ancient&&!o.ruined)return xfPlinth(b,C,o);const x=b.at[0],z=b.at[1],w=b.w,d=b.d,lit=xLit()?'lit':'glass',trim=xC(xPick(XPAL.trim));
 const n=b.h>=25?5:3,hs=[];for(let i=0;i<n;i++)hs.push(i===0?4.8:4.3);const keepN=o.storeys==null?n:Math.min(n,o.storeys);
 xnWall(x,0,z,w+1.2,1.2,d+1.2,0,C.stone,'dressed');
 const S=xnStack(x,1.2,z,w,d,0,hs.slice(0,keepN),C.wash,'wash');
 let yy=1.2;for(let k=0;k<keepN;k++){const f=Math.pow(.96,k),nx=Math.max(2,Math.round(w*f/3.2)),nz=Math.max(2,Math.round(d*f/3.2));
  for(let i=0;i<nx;i++)for(const s of[-1,1]){const u=-w*f/2+w*f*(i+.5)/nx;if(s>0&&k===0&&Math.abs(u)<1.8)continue;xnTibWin(x+u,yy+hs[k]*.38,z+s*(d*f/2-.06),s>0?0:Math.PI,.8,1.1,o.ruined?'open':lit,trim,{noVal:true});}
  for(let j=0;j<nz;j++)for(const s of[-1,1]){const v=-d*f/2+d*f*(j+.5)/nz;xnTibWin(x+s*(w*f/2-.06),yy+hs[k]*.38,z+v,s*Math.PI/2,.8,1.1,o.ruined?'open':lit,trim,{noVal:true});}
  yy+=hs[k];}
 if(o.ruined&&o.ancient)xfLampWreck(x+w/2+2.6,z+1.5,C,KRAND.stream(KRAND.child((o.seed==null?1:o.seed),'lamp')));   /* the Ancient lamp thrown down off its plinth */
 if(o.ruined){xnRoom(x,1.2,z+d/2+.02,1.8,2.6,.06,0);for(let i=0;i<6;i++){const s=KRAND.stream(KRAND.child((o.seed==null?1:o.seed),'keep.top.'+i));vB('xRubB',x+s.range(-w*.35,w*.35),S.y,z+s.range(-d*.35,d*.35),s.range(1,2.4),s.range(.4,1.1),s.range(1,2.2),s.range(0,TAU),C.rubble);}return;}
 if(!b.passage){xnDoorway(x,1.2,z+d/2+.02,0,1.8,2.6,{c:C.tim});xnFlight(x,0,z+d/2+.6+Math.round(1.2/.17)*.34,0,2.4,1.2,'vStone',C.stone);}
 xfKeepWays(b,C,S);
 const roof=xnFlatRoof(x,S.y,z,S.w,S.d,0,C.wash,{band:C.maroon,parapet:.6});
 /* the chapel (lhakhang): a red block on the roof, the twig band, the gilt roof */
 const rw=Math.min(S.w*.5,10),rd=Math.min(S.d*.5,8),ry0=S.y+.3,R=xnStack(x,ry0,z-S.d*.12,rw,rd,0,[3.6],C.red,'wash');
 for(const s of[-1,1])xnTibWin(x,ry0+1.4,z-S.d*.12+s*(rd/2-.06),s>0?0:Math.PI,.85,1.2,lit,xC(XPAL.saffron),{valC:xC(XPAL.saffron)});
 const rt=xnFlatRoof(x,ry0+3.6,z-S.d*.12,R.w,R.d,0,C.red,{band:true,eave:true,eaveC:C.tim,parapet:.4});
 xnGiltRoof(x,rt-.4,z-S.d*.12,R.w*.62,R.d*.62,0,{frame:1.2,over:.8});
 /* the beacon: an iron fire basket on the roof's front corner */
 if(b.beacon){const bx=x+S.w/2-1.2,bz=z+S.d/2-1.2;vB('vIron',bx,roof,bz,.16,2.2,.16,0,C.iron);kput('xDrumE',[bx,roof+2.2,bz],null,[.55,.6,.55],C.iron);vB('xRubB',bx,roof+2.5,bz,.7,.3,.7,0,xC(0x3a2e24));}}
/* ---------------------------------------------------------------- a keep's other ways in (2026-11-23, the House of the Tempest's utse)
   b.doors: [{face: '+z'|'-z'|'+x'|'-x', y, w, h}], a door on that face at y above the keep's foot (on the battered face at that
   height); b.passage: {w, h, rise, face: 'z'|'x'}, a gate passage through the keep's foot from one face to the other, rising `rise`
   (the inner ward on its talus): an arched portal on each face (its entry at the foot, its exit at `rise`), and a core/walk strip
   through. The passage is NOT carved: the keep's storeys are battered blocks, and a tunnel through them would break their faces;
   the portals' dim backs stand for it, and a walker passes the solid storey (as through the gatehouses). The front door and its
   flight are the passage's front portal when a keep has one. S: the keep's stack (its top's w, d and y) */
function xfKeepWays(b,C,S){const x=b.at[0],z=b.at[1],w=b.w,d=b.d,y0=1.2,top=S?S.y:y0+4.5,tw=S?S.w:w,td=S?S.d:d;
 const half=(face,y)=>{const t=Math.max(0,Math.min(1,(y-y0)/Math.max(1,top-y0))),hb=(face==='+z'||face==='-z')?d/2:w/2,ht=(face==='+z'||face==='-z')?td/2:tw/2;return hb-(hb-ht)*t;};
 const faceAt=(face,y,off)=>{const h=half(face,y)+(off==null?.02:off);return face==='+z'?[x,z+h,0]:face==='-z'?[x,z-h,Math.PI]:face==='+x'?[x+h,z,Math.PI/2]:[x-h,z,-Math.PI/2];};
 for(const D of b.doors||[]){const yy=D.y==null?y0:D.y,p=faceAt(D.face||'+z',yy);xnDoorway(p[0],yy,p[1],p[2],D.w==null?1.8:D.w,D.h==null?2.6:D.h,{c:C.tim});}
 const Pg=b.passage;if(!Pg)return;
 const pw=Pg.w==null?3.2:Pg.w,ph=Pg.h==null?4:Pg.h,rise=Pg.rise==null?0:Pg.rise,ax=Pg.face==='x',fA=ax?'+x':'+z',fB=ax?'-x':'-z';
 const A=faceAt(fA,0,.04),B=faceAt(fB,rise,.04);
 for(const [p,yy] of[[A,0],[B,rise]]){kput('xArchS',[p[0],yy,p[1]],xfQ(p[2]),[pw+1.4,ph+1.2,.45],C.stone);xnRoom(p[0],yy,p[1],pw,ph,.06,p[2]);}   /* the portals and their dim backs */
 if(typeof KWALK!=='undefined'){const a=faceAt(fA,0,1.2),c=faceAt(fB,rise,1.2);KWALK.strip({a:xfW3(a[0],0,a[1]),b:xfW3(c[0],rise,c[1]),w:Math.max(1.2,pw-.6),name:'keep passage',tag:'fort:passage:'+b.id});}}
/* ---------------------------------------------------------------- the Ancient lamp's plinth (o.beacon:'ancient', 2026-11-23; settlements/beacon
   KNOWN_ISSUES.md, the Beacon's B6): in the keep's place, on its dressed footing, three white storeys (3.3 + 4.5 + 4.5 m over the
   1.2 m footing), the Chapel of the Beacon on top (4.5 m, yellow, saffron windows, gilt corners and a gilt finial: the forts' gold
   rule, the chapel), and on its roof at 18 m the lamp's slewing ring and yoke; the lamp's centre at 22 m. The keep's fire basket
   goes. The lamp head is the page's (kits/ancients' anc_beacon_lamp, B5): window._xaBeacons has each lamp's centre in the world.
   The figures are the Beacon's layout's (settlements/beacon/src/30-bc-layout.js draw.plinth, draw.mount, lamp.h) */
const XF_PLINTH={footing:1.2,storeys:[4.5,4.5,4.5],chapel:4.5,finial:2.2,ring:2.6,ringH:1.2,yoke:2.8,lamp:22,yellow:0xd4b040};   /* the gold spoke's wall (kits/qiblai QSPOKE[2].wall), as the order's own buildings wear it: the owner, 2026-11-23, "match the gold" */
function xfPlinth(b,C,o){const P=XF_PLINTH,x=b.at[0],z=b.at[1],w=b.w,d=b.d,lit=xLit()?'lit':'glass',trim=xC(xPick(XPAL.trim)),gilt=xC(xPick(XPAL.gold)),yel=xC(P.yellow);
 xnWall(x,0,z,w+1.2,P.footing,d+1.2,0,C.stone,'dressed');
 const hs=[P.storeys[0]-P.footing].concat(P.storeys.slice(1)),S=xnStack(x,P.footing,z,w,d,0,hs,C.wash,'wash');
 let yy=P.footing;for(let k=0;k<hs.length;k++){const f=Math.pow(.96,k),n=3;
  for(let i=0;i<n;i++)for(const s of[-1,1]){const u=-w*f/2+w*f*(i+.5)/n;if(s>0&&k===0&&Math.abs(u)<1.8)continue;
   xnTibWin(x+u,yy+hs[k]*.36,z+s*(d*f/2-.06),s>0?0:Math.PI,.8,1.1,lit,trim,{noVal:true});xnTibWin(x+s*(w*f/2-.06),yy+hs[k]*.36,z+u,s*Math.PI/2,.8,1.1,lit,trim,{noVal:true});}
  yy+=hs[k];}
 xnDoorway(x,P.footing,z+d/2+.02,0,1.8,2.6,{c:C.tim});xnFlight(x,0,z+d/2+.6+Math.round(P.footing/.17)*.34,0,2.4,P.footing,'vStone',C.stone);
 vB('xBandB',x,S.y-.7,z,S.w+.1,.5,S.d+.1,0,C.maroon);   /* the maroon band under the chapel */
 const Ch=xnStack(x,S.y,z,S.w,S.d,0,[P.chapel],yel,'wash');
 for(const s of[-1,1])for(const u of[-2.2,2.2]){xnTibWin(x+u,S.y+1.3,z+s*(S.d/2-.06),s>0?0:Math.PI,.9,1.4,lit,xC(XPAL.saffron),{valC:xC(XPAL.saffron)});
  xnTibWin(x+s*(S.w/2-.06),S.y+1.3,z+u,s*Math.PI/2,.9,1.4,lit,xC(XPAL.saffron),{valC:xC(XPAL.saffron)});}
 const top=xnFlatRoof(x,Ch.y,z,Ch.w,Ch.d,0,yel,{band:C.maroon,parapet:.9});   /* top: the parapet's cap, which 72's xnParapet lays over the whole roof */
 for(const sx of[-1,1])for(const sz of[-1,1])vBall('xGold',x+sx*(Ch.w/2-.3),top+.25,z+sz*(Ch.d/2-.3),.28,gilt);   /* the roof's gilt corners */
 const fx=x+Ch.w/2-1,fz=z+Ch.d/2-1;vB('vIron',fx,Ch.y,fz,.14,P.finial,.14,0,gilt);vBall('xGold',fx,Ch.y+P.finial,fz,.3,gilt);   /* the gilt finial */
 const lampY=Ch.y+P.ringH+P.yoke,yk=Math.max(.8,lampY-(top+P.ringH));   /* the lamp's centre stays at 22 m: the ring on the cap, the yoke up to the trunnions */
 kput('xDrumE',[x,top,z],null,[P.ring/2,P.ringH,P.ring/2],C.iron);   /* the drum item's scale is its radius: the ring 2.6 m across */for(const s of[-1,1])vB('vIron',x+s*1.05,top+P.ringH,z,.18,yk,.34,0,C.iron);   /* the slewing ring, the yoke */
 const L=IZDOOR._w(x,lampY,z),rec={key:o.lampAt||null,at:L,roof:Ch.y,lampH:lampY,lamp:null};
 /* the lamp head on its yoke, where the page has the Ancients' piece (kits/ancients/pieces/89p-anc-beacon-lamp.js): live meshes in the
    fort's group, sweeping by itself; rec.lamp is its handle (lamp.set({bearing, shutter, on, mode}) for a page's own schedule) */
 if(typeof ANC_BEACON_LAMP!=='undefined'&&VERN.cur&&VERN.cur.G){const lamp=ANC_BEACON_LAMP.make({night:()=>xLit()});lamp.root.position.set(x,rec.lampH+XF_Y,z);VERN.cur.G.add(lamp.root);rec.lamp=lamp;}
 (window._xaBeacons=window._xaBeacons||[]).push(rec);}
/* the lamp head thrown down in a ruin (the stand-in's size: a 1.6 m drum 2.2 m long, white metal), and its ring, seated on their lowest points */
function xfLampWreck(x,z,C,s){const a=s.range(0,TAU);
 if(typeof ANC_BEACON_LAMP!=='undefined'&&VERN.cur&&VERN.cur.G){const W=ANC_BEACON_LAMP.wreck({seed:s.range(0,1)});W.position.set(x,XF_Y,z);W.rotation.y=a;VERN.cur.G.add(W);   /* the Ancients' head itself, seated */
  const r=loc(x,z,2.2,s.range(-1,1),a);xfSeat('xDrumE',r[0],r[1],0,0,0,[1.3,.6,1.3],C.iron,.03);return;}
 xfSeat('xDrumE',x,z,a,Math.PI/2,s.range(-.3,.3),[.8,2.2,.8],xC(0xc8ccd0),.05);
 const r=loc(x,z,2.2,s.range(-1,1),a);xfSeat('xDrumE',r[0],r[1],0,0,0,[1.3,.6,1.3],C.iron,.03);}
// ---------------------------------------------------------------- a range (barracks, quarters, the Tears' house): two storeys, a colonnade on its ward face
function xfRange(b,C,o){o=o||{};const x=b.at[0],z=b.at[1],alongZ=b.d>b.w,L=alongZ?b.d:b.w,D=alongZ?b.w:b.d,ry=alongZ?Math.PI/2:0,lit=xLit()?'lit':'glass',trim=xC(XPAL.red);
 const face=alongZ?(x>0?-1:1):(z>0?-1:1),wash=b.kind==='merchant-house'?xC(xPick(XPAL.ochre)):C.wash;   /* the colonnade faces the ward's middle */
 if(o.ruined){xfLowWalls(b,C,o);return;}
 xnWall(x,0,z,b.w+.4,.6,b.d+.4,0,C.stone,'dressed');const top=o.burnt?C.scorch(wash):wash;
 const S=xnStack(x,.6,z,L,D,ry,[3.3,3.1],wash,'wash');
 const P=(u,v)=>loc(x,z,u,v,ry),nd=Math.max(1,Math.round(L/9)),nw=Math.max(2,Math.round(L/3.4));
 for(let i=0;i<nd;i++){const u=-L/2+L*(i+.5)/nd,q=P(u,face*(D/2+.02));xnDoorway(q[0],.6,q[1],ry+(face>0?0:Math.PI),1.2,2.2,{c:C.tim});}
 for(let i=0;i<nw;i++)for(const s of[-1,1]){const u=-L/2+L*(i+.5)/nw;if(s===face&&Math.abs(((u+L/2)/(L/nd))%1-.5)<.22)continue;const f=s===face?1:1;
  const q=P(u,s*(D/2*.97-.05));xnTibWin(q[0],4.4,q[1],ry+(s>0?0:Math.PI),.8,1.05,lit,trim,{noVal:true});}
 /* the colonnade: painted posts, a beam and a tiled lean-to before the ward face */
 const cq=P(0,face*(D/2+1.4));for(let i=0;i<=Math.round(L/3.2);i++){const p=P(-L/2+.4+(L-.8)*i/Math.round(L/3.2),face*(D/2+2.5));xnCol(p[0],.6,p[1],2.7,.15,ry,trim);}
 vB('vWood',cq[0],3.3,cq[1],(alongZ?2.8:L),.2,(alongZ?L:2.8),0,C.tim);vB('xTilesB',cq[0],3.5,cq[1],(alongZ?3.2:L+.3),.16,(alongZ?L+.3:3.2),0,C.tile);
 if(o.burnt){vB('xRubB',x,S.y,z,S.w*.98,.3,S.d*.98,ry,xC(0x2e2620));for(let i=0;i<5;i++){const p=P(-L/2+L*(i+.5)/5,0);vB('vWood',p[0],S.y+.3,p[1],.25,1.6,.25,ry+.3*i,xC(0x241c16));}}
 else xnFlatRoof(x,S.y,z,S.w,S.d,ry,top,{band:C.maroon,parapet:.5});}
/* a ruined building: its walls to a third of their height, a heap within */
function xfLowWalls(b,C,o){const x=b.at[0],z=b.at[1],s=KRAND.stream(KRAND.child((o.seed==null?1:o.seed),'walls.'+b.id)),t=.7;
 for(const e of[[0,b.d/2,b.w,t],[0,-b.d/2,b.w,t],[b.w/2,0,t,b.d],[-b.w/2,0,t,b.d]]){const hh=Math.max(.5,(b.h==null?4:b.h)*s.range(.15,.45));vB('xRubB',x+e[0],0,z+e[1],e[2],hh,e[3],0,C.rubble);}
 if(b.w*b.d>40)xfHeap({id:'bld.'+b.id,x,z,rx:Math.max(1.5,b.w*.32),rz:Math.max(1.5,b.d*.32),ry:0,h:Math.min(2.2,(b.h==null?4:b.h)*.25),seed:KRAND.child((o.seed==null?1:o.seed),'heap.'+b.id)},C.rubble);}
// ---------------------------------------------------------------- the small buildings
function xfSmall(b,C,o){o=o||{};const x=b.at[0],z=b.at[1],w=b.w,d=b.d,h=b.h;if(o.ruined&&b.kind!=='cistern'&&b.kind!=='muster'){xfLowWalls(b,C,o);return;}
 const front=z>0?-1:1;
 switch(b.kind){
  case 'magazine':{xnWall(x,0,z,w,h,d,0,C.stone,'dressed');vB('xEarthB',x,h,z,w*.9,.8,d*.9,0,C.earth);xnDoorway(x,0,z+front*(d/2*.96+.03),front>0?0:Math.PI,1.1,2,{c:xC(0x8a5a32)});break;}
  case 'granary':case 'strongroom':{xnWall(x,0,z,w,.8,d,0,C.stone,'dressed');const S=xnStack(x,.8,z,w*.96,d*.96,0,[h-.8],b.kind==='strongroom'?C.stone:C.wash,b.kind==='strongroom'?'dressed':'wash');
   xnFlatRoof(x,S.y,z,S.w,S.d,0,C.wash,{parapet:.5,band:b.kind==='strongroom'?C.maroon:null});
   if(b.kind==='granary')for(let i=0;i<3;i++)xnRoom(x-w*.3+w*.3*i,h*.6,z+front*(S.d/2+.02),.3,.6,.06,front>0?0:Math.PI);
   else xnDoorway(x,.8,z+front*(d*.48+.02),front>0?0:Math.PI,1.2,2.1,{c:C.iron});break;}   /* at the stack's foot (it was on the roof's footprint, inside the wall) */
  case 'assay-furnace':case 'assay-weigh':case 'smithy':case 'wheel-house':{const red=b.kind==='wheel-house',S=xnStack(x,0,z,w,d,0,[h],red?C.red:C.wash,'wash');
   xnFlatRoof(x,S.y,z,S.w,S.d,0,red?C.red:C.wash,{band:C.maroon,parapet:.5,eave:red,eaveC:C.tim});
   /* the door at the battered face's foot and the windows on the face at their height (as xfKeep and xfRange: until 2026-11-22
      both stood on the roof's footprint, half a metre inside the wall, so the door was buried and its room sealed) */
   const fz=y0=>front*(d/2-(d/2-S.d/2)*y0/h+.02);
   xnDoorway(x,0,z+fz(0),front>0?0:Math.PI,1.8,2.6,{c:C.tim});
   for(const s of[-1,1])xnTibWin(x+s*w*.3,h*.45,z+fz(h*.45+.55),front>0?0:Math.PI,.8,1.1,xLit()?'lit':'glass',xC(XPAL.trim),{noVal:true});
   if(b.chimney||b.kind==='smithy'){const cx=x+w/2-1.4;vB('vStone',cx,S.y,z,1.5,b.chimney?7:3.5,1.5,0,C.stone);vB('vDarkB',cx,S.y+(b.chimney?7:3.5),z,1,.04,1,0);}
   break;}
  case 'stables':case 'ore-shed':{const alongZ=d>w,L=alongZ?d:w,D=alongZ?w:d,ry=alongZ?Math.PI/2:0,P=(u,v)=>loc(x,z,u,v,ry),sx=alongZ?(x>0?-1:1):(z>0?-1:1);
   if(b.kind==='stables'){const q=P(0,-sx*(D/2-.4));vB('xRubB',q[0],0,q[1],alongZ?.8:L,h,alongZ?L:.8,0,C.rubble);}
   for(let i=0;i<=Math.round(L/3.5);i++)for(const v of b.kind==='stables'?[sx*(D/2-.3)]:[-D/2+.3,D/2-.3]){const p=P(-L/2+.3+(L-.6)*i/Math.round(L/3.5),v);vPst('vPost',p[0],0,p[1],.12,h-.4,C.tim);}
   vnShedRoof(x,h-.4,z,alongZ?D:L,alongZ?L:D,.8,b.kind==='stables'?(alongZ?(sx>0?-Math.PI/2:Math.PI/2):(sx>0?Math.PI:0)):0,'xTilesB',C.tile,.4);
   if(b.kind==='ore-shed')for(let i=0;i<3;i++){const p=P(-L/3+L/3*i,0);vB('xRubB',p[0],0,p[1],2.6,1,2.2,i*.5,xC(0x6a5a48));}
   break;}
  case 'cistern':{vPst('vPostS',x,0,z,w*.4,.9,C.stone);vB('vDarkB',x,.9,z,w*.5,.03,w*.5,0);vB('vWood',x,1.8,z,w*.6,.12,.12,0,C.tim);for(const s of[-1,1])vB('vWood',x+s*w*.3,.9,z,.12,1,.12,0,C.tim);break;}
  case 'muster':{xnPave(x,z,w,d,0,C.stone,3);if(!o.ruined)for(const s of[-1,1])xnXGSpears(x+s*(w/2-1.5),z,Math.PI/2,6);break;}
  default:xfRange(b,C,o);}}
// ---------------------------------------------------------------- a gun: a bronze piece on its carriage, laid out of the wall
function xfGun(x,y,z,ry,C){vB('vStone',x,y,z,3,.25,3,ry,C.stone);vB('vWood',x,y+.25,z,1,.5,1.7,ry,C.tim);
 for(const s of[-1,1]){const w=loc(x,z,s*.6,0,ry);kput('xDrumE',[w[0],y+.25+.45,w[1]],qEuler(0,ry,Math.PI/2),[.45,.12,.45],C.tim);}
 const m=loc(x,z,0,.3,ry);kput('xColG',[m[0],y+1,m[1]],qEuler(0,ry,0).multiply(qEuler(Math.PI/2,0,0)),[.2,2.4,.2],C.bronze);}
// ---------------------------------------------------------------- the whole fort, from its plan, in its state
/* the plan a placement draws: the size's own (XF_PLANS), or, where the placement gives o.outline (a watch fort's convex ward) or
   o.gateEdge, XFORT.plan of them (cached): settlements/marches fits each watch fort's ward to its knoll this way */
const XF_PCACHE={};
function xfPlanOf(size,o){if(!o||(o.outline==null&&o.gateEdge==null))return XF_PLANS[size];const k=size+'|'+JSON.stringify(o.outline||null)+'|'+(o.gateEdge==null?'':o.gateEdge);
 return XF_PCACHE[k]||(XF_PCACHE[k]=XFORT.plan({size,outline:o.outline,gateEdge:o.gateEdge}));}
/* o.seed is the fort's LOOK (its colours, merlons: reseeded at once); o.damageSeed, when given, is what its damage is hashed
   from (breaches, fallen towers, ragged courses, low walls, wrecks), so one fort can keep its look through its three states
   (the Marches, 2026-11-23); without it the damage takes the look's seed, as before */
/* XF_Y: the height a ward is being drawn at (xfDrawPlan's xfAt): kput's records take it through KOFF; the live meshes 80g adds to
   the site's group (rubble heaps, the lamp head and its wreck) add it themselves */
let XF_Y=0;
function xfAt(y,f){if(!y)return f();KOFF[1]+=y;XF_Y+=y;try{return f();}finally{KOFF[1]-=y;XF_Y-=y;}}
/* ---------------------------------------------------------------- xfDrawPlan(P, G, o): a fort drawn from a plan handed in (2026-11-23,
   the House of the Tempest's ask: a host plan in XFORT's record shape gets the fort's states, burnt gates, guns, walks and records
   without composing 80g's builders itself). xfDraw(size, G, o) is xfDrawPlan of the size's plan. A record's height is its own y,
   else its ward's (XFORT.recY): a ward on a talus is drawn at its height (xfAt). o, besides xfDraw's {v, state, seed, damageSeed,
   beacon, _key}:
     size, dress ('march' plain, 'royal' banded), seedBase    for a plan of no size (default: o.size's, else 'watch')
     name                                                     the records' name (default: the def's)
     mainGate                                                 the id of the gate with the gilt pavilion (else XF_MAIN[size], or a gate of kind 'main')
     skip {tower(t), gate(g), building(b), barbican, court}   leave a piece to the host (it draws it itself)
     drawBuilding(b, C, ctx)                                  a host's own building: true when drawn (ctx {st, Dm, dseed, ruined, burnt})
     burnt {buildingId: true}                                 roofs to burn besides XFORT.damage's
   -> {P, Dm, Wk, C, st, seed, dseed, feet, walks} */
function xfDrawPlan(P,G,o){o=o||{};const size=o.size||P.size||'watch',V=xV(o),st=o.state||XF_STATES[V]||'kept',
  seed=o.seed==null?(o.seedBase==null?(XF_SEED[size]==null?XF_SEED.watch:XF_SEED[size]):o.seedBase)+V:o.seed,dseed=o.damageSeed==null?seed:o.damageSeed,ancient=o.beacon==='ancient';reseed(seed);
 const C=xfCols(o.dress||(size==='watch'?'march':'royal')),Dm=XFORT.damage(P,st,dseed),SK=o.skip||{},Y=r=>XFORT.recY(P,r);
 const nm=o.name||(VERN.defs[o._key]?VERN.defs[o._key].name:String(o._key));   /* no volume over the whole fort: its wards are open ground (a camera or walker in them stands in no building); its curtains, towers, gates and buildings register their own */
 const isMain=g=>o.mainGate!=null?g.id===o.mainGate:(XF_MAIN[size]!=null&&P.gates.some(q=>q.id===XF_MAIN[size]))?g.id===XF_MAIN[size]:g.kind==='main';
 /* the curtains: whole, breached, or in stubs; a standing fort's walks, the flights onto its towers and its stairs on core/walk
    (XFORT.walks: a ruined one has none) */
 const tag='fort:'+o._key+'/'+V,Wk=XFORT.walks(P,Dm);
 P.curtains.forEach(c=>xfAt(Y(c),()=>{const L=Math.hypot(c.b[0]-c.a[0],c.b[1]-c.a[1]),mid=[(c.a[0]+c.b[0])/2,(c.a[1]+c.b[1])/2];vnReg(nm+' — curtain',mid[0],mid[1],L/2,Y(c)+c.h+1.3,{part:'wall'});
  if(Dm.stubs[c.id]){Dm.stubs[c.id].forEach(s=>xfCurtain(c,s.u0,s.u1,s.h,C,{}));return;}
  const br=Dm.breaches.filter(b=>b.curtain===c.id),cuts=[0];br.forEach(b=>cuts.push(b.u0,b.u1));cuts.push(1);
  for(let i=0;i<cuts.length;i+=2)xfCurtain(c,cuts[i],cuts[i+1],c.h,C,{merlons:true,band:C.dress==='royal'});
  br.forEach(b=>{xfCurtain(c,b.u0,b.u1,1.2,C,{});   /* the breach's foot: the talus and a course of the body */
   /* its broken ends: the wall steps down into the gap in three or four ragged courses from each side (hashed per breach) */
   const s=KRAND.stream(KRAND.child(dseed,'breach.'+c.id+'.'+b.u0));
   for(const side of[-1,1]){const u=side<0?b.u0:b.u1;let hh=c.h,du=0;
    for(let k=0;k<4;k++){const w=s.range(.6,1.1)/L;hh*=s.range(.62,.82);if(hh<1.6||du+w>(b.u1-b.u0)*.3)break;   /* each side keeps to its third of the gap */const ua=side<0?u+du:u-du-w,ub=side<0?u+du+w:u-du;
     xfCurtain(c,Math.max(b.u0,Math.min(ua,ub)),Math.min(b.u1,Math.max(ua,ub)),hh,C,{});du+=w;}}});}));
 const WD=xfWalks(P,Wk,C,tag),feet=WD.feet,walks=WD.n;
 /* the walk audit's record (core/walk): the stairs' feet, this fort's tag, its lot in the world (the plan's w and d, else its wards') */
 if(typeof KWALK!=='undefined'&&walks){let x0=-P.w/2,x1=P.w/2,z0=-P.d/2,z1=P.d/2;
  if(!(P.w>0&&P.d>0)){const xs=[],zs=[];(P.wards||[]).forEach(w=>(w.poly||[]).forEach(p=>{xs.push(p[0]);zs.push(p[1]);}));P.curtains.forEach(c=>{xs.push(c.a[0],c.b[0]);zs.push(c.a[1],c.b[1]);});x0=Math.min(...xs);x1=Math.max(...xs);z0=Math.min(...zs);z1=Math.max(...zs);}
  const W=(x,y,z)=>IZDOOR._w(x,y,z),a=W(x0-6,0,z0-6),b=W(x1+6,0,z1+6);
  (window._xaForts=window._xaForts||[]).push({key:o._key,v:V,state:st,tag,feet,walks,box:[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[2],b[2])]});}
 Dm.heaps.forEach(H=>xfAt(Y(H),()=>xfHeap(H,C.rubble)));
 /* the towers */
 P.towers.forEach(t=>{if(SK.tower&&SK.tower(t))return;const T=Dm.towers[t.id]||{};xfAt(Y(t),()=>{vnReg(nm+' — '+(t.kind==='great'||t.signal?'the signal tower':'tower'),t.ctr[0],t.ctr[1],XFORT.half(t)+.5,Y(t)+t.h*(T.keep==null?1:T.keep)+2,{part:'tower'});
  xfTower(t,C,Object.assign({seed:dseed},T,{gaps:Wk.gaps[t.id]}),t.id);});});
 /* the gates */
 P.gates.forEach(g=>{if(SK.gate&&SK.gate(g))return;const c=P.curtains.find(q=>q.id===g.curtain)||P.curtains.find(q=>q.ward==='works');xfAt(Y(c||g),()=>{vnReg(nm+' — '+(g.kind==='water'?'water gate':'gate'),g.at[0],g.at[1],g.w/2+2,Y(c||g)+(c?c.h:7)+4,{part:'gate'});
  if(g.kind==='water')xfWaterGate(g,c,C,Dm.gates[g.id]==='gone');else xfGate(g,c,C,Dm.gates[g.id]||'kept',isMain(g),{cable:ancient&&isMain(g)});});});
 /* the barbican before the Qiblai Gate (Strongwall): three low walls, the outer opening on its west side */
 if(P.barbican&&!SK.barbican&&P.barbican.w){const b=P.barbican,x0=b.at[0]-b.w/2,x1=b.at[0]+b.w/2,z0=b.at[1]-b.d/2,z1=b.at[1]+b.d/2,S={curtH:6,curtT:2,walk:1.4};
  const wall=(id,a,c2)=>({id,a,b:c2,h:S.curtH,t:S.curtT,out:[0,0]});
  const ws=[Object.assign(wall('barb.f',[x0,z1],[x1,z1]),{out:[0,1]}),Object.assign(wall('barb.e',[x1,z1],[x1,z0]),{out:[1,0]}),Object.assign(wall('barb.w1',[x0,z0],[x0,z0+3]),{out:[-1,0]}),Object.assign(wall('barb.w2',[x0,z1-3],[x0,z1]),{out:[-1,0]})];
  const ruined=st==='ruined';ws.forEach(c=>xfCurtain(c,0,1,ruined?c.h*.35:c.h,C,{merlons:!ruined}));vnReg(nm+' — barbican',b.at[0],b.at[1],b.w/2,S.curtH+1.3,{part:'wall'});
  if(!ruined)kput('xArchS',[x0-1.05,0,b.at[1]],xfQ(-Math.PI/2),[5.4,6.2,.45],C.stone);}
 /* the buildings */
 P.buildings.forEach(b=>{if(SK.building&&SK.building(b))return;xfAt(Y(b),()=>{const ruined=st==='ruined',burnt=Dm.roofs[b.id]==='burnt'||!!(o.burnt&&o.burnt[b.id]);
  if(o.drawBuilding&&o.drawBuilding(b,C,{st,Dm,dseed,ruined,burnt}))return;
  if(b.kind!=='muster')vnReg(nm+' — '+b.kind.replace(/-/g,' '),b.at[0],b.at[1],Math.max(b.w,b.d)/2,Y(b)+(b.h==null?1:b.h)+(b.kind==='keep'?8:1),{part:b.kind});
  if(b.kind==='keep')xfKeep(b,C,{storeys:Dm.keep&&Dm.keep.storeys,ruined,seed:dseed,ancient,lampAt:o._key});
  else if(XF_RANGES[b.kind])xfRange(b,C,{ruined,burnt,seed:dseed});
  else xfSmall(b,C,{ruined,seed:dseed});});});
 /* the Golden Tears' court: its own low wall on the two sides inside the ward, its gate, its tower */
 if(P.court&&!SK.court){const K=P.court,p=K.poly,ruined=st==='ruined',wh=ruined?K.wallH*.4:K.wallH;   /* poly: front-left, front-right, back-right, back-left */
  const segs=[[p[3],p[2]],[p[3],[K.gateAt[0],K.gateAt[1]-2.2]],[[K.gateAt[0],K.gateAt[1]+2.2],p[0]]];
  segs.forEach(sg=>{const dx=sg[1][0]-sg[0][0],dz=sg[1][1]-sg[0][1],L=Math.hypot(dx,dz),m=[(sg[0][0]+sg[1][0])/2,(sg[0][1]+sg[1][1])/2];vB('xRubB',m[0],0,m[1],Math.abs(dx)>Math.abs(dz)?L:K.wallT,wh,Math.abs(dx)>Math.abs(dz)?K.wallT:L,0,C.rubble);
   if(!ruined)vB('xWashB',m[0],wh,m[1],(Math.abs(dx)>Math.abs(dz)?L:K.wallT)+.1,.25,(Math.abs(dx)>Math.abs(dz)?K.wallT:L)+.1,0,xC(xPick(XPAL.ochre)));});
  const T={id:K.id+'.tower',form:'square',w:K.tower.w,h:K.tower.h,at:K.tower.at,ctr:K.tower.at};xfTower(T,xfCols('march'),Object.assign({seed:dseed},Dm.towers[T.id]||(ruined?{keep:.45,fallen:true}:{})),T.id);
  vnReg(nm+' — the Golden Tears\' court',(p[0][0]+p[1][0])/2,(p[0][1]+p[3][1])/2,Math.abs(p[1][0]-p[0][0])/2,K.tower.h,{part:'court'});
  if(!ruined)xnDoorway(K.gateAt[0]-K.wallT/2-.02,0,K.gateAt[1],-Math.PI/2,3,3.2,{c:C.tim});}
 /* the guns: a standing one where it is laid; a damaged fort's gun whose wall was breached or whose gate burnt lies wrecked at
    the wall's foot inside (xfGunWreck); a ruined fort's were carried off */
 if(st!=='ruined')(P.guns||[]).forEach((g,gi)=>{const wreck=(x,z,ry)=>{if(st==='damaged')xfGunWreck(x,z,ry,C,KRAND.stream(KRAND.child(dseed,'gun.'+gi)));};
  if(g.curtain){const c=P.curtains.find(q=>q.id===g.curtain),p=[c.a[0]+(c.b[0]-c.a[0])*g.u,c.a[1]+(c.b[1]-c.a[1])*g.u],ry=Math.atan2(c.out[0],c.out[1]);
   xfAt(Y(c),()=>{if(Dm.breaches.some(b=>b.curtain===c.id&&g.u>b.u0-.05&&g.u<b.u1+.05)){wreck(p[0]-c.out[0]*(c.t/2+3),p[1]-c.out[1]*(c.t/2+3),ry);return;}
    xfGun(p[0]-c.out[0]*.3,c.h,p[1]-c.out[1]*.3,ry,C);});}
  else{const gt=P.gates.find(q=>q.id===g.gate);if(!gt)return;const c=P.curtains.find(q=>q.id===gt.curtain);
   xfAt(Y(c||gt),()=>{if(Dm.gates[gt.id]==='burnt'){const q=loc(gt.at[0],gt.at[1],gt.w/2+2,-(XFORT.gateHouse(gt,c).d/2+3),gt.ry);wreck(q[0],q[1],gt.ry);return;}
    const gh=(c?c.h:7)+3+.3,p=loc(gt.at[0],gt.at[1],gt.w/2+.4,-.3,gt.ry);xfGun(p[0],gh,p[1],gt.ry,C);});}});
 return{P,Dm,Wk,C,st,seed,dseed,feet,walks};}
/* the ranges xfRange draws (two storeys, a colonnade on the ward face): the forts' own kinds and a host's */
const XF_RANGES={barracks:1,'married-quarters':1,'merchant-house':1,range:1,'stable-range':1};
function xfDraw(size,G,o){return xfDrawPlan(xfPlanOf(size,o),G,Object.assign({size},o));}
/* a gun thrown down: its bronze barrel, its carriage on its side and a wheel, each seated on its lowest points (core/ruins' rule) */
function xfGunWreck(x,z,ry,C,s){const a=ry+s.range(-.7,.7);
 xfSeat('xColG',x,z,a,Math.PI/2,0,[.2,2.4,.2],C.bronze,.02);
 const w=loc(x,z,s.range(.9,1.4),s.range(-.6,.6),a);xfSeat('vWood',w[0],w[1],a+s.range(-.4,.4),s.range(.05,.25),s.range(1.35,1.5),[1,.5,1.7],C.tim,.05);   /* on its side */
 const h=loc(x,z,-s.range(.8,1.3),s.range(-.8,.8),a);xfSeat('xDrumE',h[0],h[1],0,0,0,[.45,.12,.45],C.tim,.02);}
// ---------------------------------------------------------------- the watch post: a square tower, its fire basket, a fuel store, a hut
function xfPost(G,o){const V=xV(o),st=XF_STATES[V]||'kept',seed=XF_SEED.post+V;reseed(seed);const W=XFORT.post(),C=xfCols('march'),T=W.tower;
 /* the post's record (for the sim, S3): the fort it answers to (o.fort, a settlement or ensemble id; null when none is given)
    and its rota (o.rota men on the line; XFORT.post's 4 by default), on the group and in window._xaPosts with its place (not on
    its core/tags volume: the vocabulary has no such key, and a core/tags change waits for the all-builds rebuild) */
 const c0=VERN.cur,rec={fort:o.fort==null?null:o.fort,rota:o.rota==null?W.rota:o.rota,state:st,x:c0?c0.x:0,z:c0?c0.z:0};if(G&&G.userData)G.userData.post=rec;
 (window._xaPosts=window._xaPosts||[]).push(rec);
 vnReg('Watch post',0,0,W.w/2,T.h+3,{part:'tower'});
 const tw={id:'post',form:'square',w:T.w,h:T.h,at:[T.at[0],T.at[1]+T.w],ctr:T.at};
 const keep=st==='kept'?1:st==='damaged'?.65:.38;xfTower(tw,C,{keep,fallen:keep<1,seed},'post');
 if(st==='kept'){xnDoorway(T.at[0],0,T.at[1]+T.w/2*.93+.03,0,1,2,{c:C.tim});const k=xnBatterK(T.w,T.h,T.w);
  const y=T.h+.15;vB('vIron',T.at[0],y,T.at[1],.14,W.basket.h,.14,0,C.iron);kput('xDrumE',[T.at[0],y+W.basket.h,T.at[1]],null,[.6,.6,.6],C.iron);vB('xRubB',T.at[0],y+W.basket.h+.3,T.at[1],.8,.3,.8,0,xC(0x3a2e24));}
 for(const piece of[W.store,W.hut]){const b={id:piece===W.store?'store':'hut',kind:'hut',at:piece.at,w:piece.w,d:piece.d,h:piece.h};
  if(st==='ruined'){xfLowWalls(b,C,{seed});continue;}
  const S=xnStack(b.at[0],0,b.at[1],b.w,b.d,0,[b.h],C.earth,'earth');vnShedRoof(b.at[0],S.y,b.at[1],b.w+.3,b.d+.3,.4,0,'vThatchB',xC(xPick(VPAL.thatch)),.3);
  if(piece===W.hut)xnDoorway(b.at[0],0,b.at[1]+S.d/2+.03,0,.9,1.9,{c:C.tim});
  else for(let i=0;i<3;i++)vB('vWood',b.at[0]-1+i,0,b.at[1]+b.d/2+.5,.3,.9,.3,0,C.tim);}}
/* the walk audit (core/walk's KWALK.reach): from every standing fort's stair feet, over its own floors, every wall walk and stair
   reached; a walk cut off by a breach must have a stair of its own. -> [{key, v, state, floors, reached, unreached: [names]}] */
function xfReach(Wk,forts){Wk=Wk||(typeof KWALK!=='undefined'?KWALK:null);if(!Wk)return null;   /* Wk, forts: another walk and its forts (the negative's) */
 return(forts||window._xaForts||[]).map(F=>{const R=Wk.reach(F.feet,{box:F.box,cell:.5}),mine=f=>String(f.tag||'')===F.tag,re=R.reached.filter(mine),un=R.unreached.filter(mine);
  return{key:F.key,v:F.v,state:F.state,floors:re.length+un.length,reached:re.length,unreached:un.map(f=>f.name),capped:!!R.capped};});}
const XTAG_FORT=(more)=>({type:['military'].concat(more||[]),wealth:'civic',lit:false});
const xfDef=(key,size,name,more)=>{const P=XF_PLANS[size];XA.def({key,name,family:'Forts',tags:XTAG_FORT(more),xfort:size,w:P.w+12,d:P.d+12,h:size==='march'?40:size==='gate'?20:30,fw:P.w,fd:P.d,nv:3,
 build:(G,o)=>xfDraw(size,G,Object.assign({},o,{_key:key}))});};
xfDef('xa_fort_watch','watch','Watch fort (the Marches\')',['civic']);
/* the beacon fort (the Beacon's, settlements/beacon): the watch fort with the Ancient lamp's plinth in the keep's place; a page may
   equally place xa_fort_watch with {beacon:'ancient'} */
{const P=XF_PLANS.watch;XA.def({key:'xa_fort_beacon',name:'Beacon fort (the Ancient lamp\'s)',family:'Forts',tags:XTAG_FORT(['civic','religious']),xfort:'watch',w:P.w+12,d:P.d+12,h:30,fw:P.w,fd:P.d,nv:3,
 build:(G,o)=>xfDraw('watch',G,Object.assign({},o,{_key:'xa_fort_beacon',beacon:'ancient'}))});}
xfDef('xa_fort_march','march','Strongwall (the march fort)',['civic']);
xfDef('xa_fort_gate','gate','Gate works',['infrastructure']);
XA.def({key:'xa_fort_post',name:'Watch post (the watch line\'s)',family:'Forts',tags:XTAG_FORT(['infrastructure']),xfort:'post',w:XFORT.post().w+6,d:XFORT.post().d+6,h:12,fw:XFORT.post().w,fd:XFORT.post().d,nv:3,build:xfPost});
/* ---------------------------------------------------------------- F4: the forts' interiors (the interior set `xanadu-fort`)
   One item per fort def, written from its plan (XF_PLANS) as kits/interiors/sets/xanadu.js writes the kit's other buildings: each
   building the fort draws as a battered stack (the keep, the ranges, the strongroom, the magazine, the assay court, the smithy,
   the wheel house) is an INSET body on the footprint its storeys share, its doors where the builder draws them. A page with the
   Xanadu interiors (settlements/xanadu 89y: its 69d bundle and ?interiors=1, or a target that turns them on) then draws those
   bodies hollow (kits/iziz-vernacular 69e6), unlocks their doors, plans, furnishes and floors the rooms in core/walk. Written
   here, not in sets/xanadu.js, because the plans are XFORT's (80f), which loads after the interiors bundle. Only a KEPT fort is
   furnished: a damaged one has lost storeys and roofs, a ruined one is low walls (XF_IXSTATE, set as each top-level fort is
   placed, makes its item a skip). The towers, gatehouses and the keep's chapel stay solid (no stair is drawn into them); the
   granary has no door, the stables and the ore shed are open sheds. */
const XF_IXKEY={watch:'xa_fort_watch',march:'xa_fort_march',gate:'xa_fort_gate'},XF_IXSTATE={state:null},XF_IXHOST=new Set();
/* the item of one plan (a size's, or a host's: xfIxHost); a raised ward's buildings get none (see below) */
function xfIxItem(P,key,name){const R3=v=>Math.round(v*1000)/1000;
 /* sets/xanadu.js inset() and stack(), on the kit's own batter (xnBatterK): every storey on the footprint they all share, the doors
    drawn on the blocks' outer faces moved in onto it */
 const inset=(P,id,o)=>{const w=R3(P[1]-P[0]),d=R3(P[3]-P[2]),cx=R3((P[0]+P[1])/2),cz=R3((P[2]+P[3])/2);
  const doors=(o.doors||[]).map(D=>{const x=D.at[0],z=D.at[1],ex=Math.min(Math.abs(x-P[0]),Math.abs(x-P[1])),ez=Math.min(Math.abs(z-P[2]),Math.abs(z-P[3]));
   const outX=x<P[0]||x>P[1],outZ=z<P[2]||z>P[3],onX=outX&&!outZ?true:outZ&&!outX?false:ex<ez;
   const at=onX?[x<cx?P[0]:P[1],Math.max(P[2]+.6,Math.min(P[3]-.6,z))]:[Math.max(P[0]+.6,Math.min(P[1]-.6,x)),z<cz?P[2]:P[3]];
   return Object.assign({},D,{at:[R3(at[0]),R3(at[1])]});});
  return Object.assign({id,poly:[[cx-w/2,cz-d/2],[cx+w/2,cz-d/2],[cx+w/2,cz+d/2],[cx-w/2,cz+d/2]].map(p=>[R3(p[0]),R3(p[1])]),y:o.y==null?0:o.y,
   levels:o.hs.map(h=>({h})),wall:.45,roof:'flat',doors,program:o.program,inset:true},o.windows===false?{windows:false}:{});};
 const stack=(cx,cz,w,d,hs,o)=>{let ww=w,dd=d;hs.forEach(h=>{const k=xnBatterK(ww,h,dd);ww*=k;dd*=k;});return inset([cx-ww/2,cx+ww/2,cz-dd/2,cz+dd/2],o.id,Object.assign({},o,{hs}));};
 const RANGE={barracks:n=>n>3?[['barracks','hall','kitchen','barracks'],['barracks','barracks','store','barracks']]:[['barracks','hall','kitchen'],['barracks','barracks','store']],
  'married-quarters':n=>n>3?[['living','kitchen','living','kitchen'],['bedroom','bedroom','bedroom','bedroom']]:[['living','kitchen','living'],['bedroom','bedroom','bedroom']],
  'merchant-house':()=>[['shop','store','kitchen'],['living','bedroom','study']],'ore-store':()=>[['store','store'],['store','study']],
  range:n=>n>3?[['barracks','hall','kitchen','barracks'],['barracks','barracks','store','barracks']]:[['barracks','hall','kitchen'],['barracks','barracks','store']],
  'stable-range':n=>n>3?[['stable','stable','store','stable'],['barracks','barracks','barracks','barracks']]:[['stable','stable','store'],['barracks','barracks','barracks']]};   /* a host's: the House's companies sleep over their horses */
 const SMALL={'assay-furnace':'workshop','assay-weigh':'workshop',smithy:'smithy','wheel-house':'shrine'};
 const B=[];
  for(const b of P.buildings){const x=b.at[0],z=b.at[1],w=b.w,d=b.d,h=b.h,front=z>0?-1:1,Y=XFORT.recY(P,b),n0=B.length;
   if(Y){}   /* a building of a raised ward: no body (the kits' auto bodies, kits/iziz-vernacular 69e6, match a block in the builder's frame,
               which the ward's raise is not in: its rooms would be sealed in a solid block). A host keeps such a ward its own def */
   else if(b.kind==='keep'&&b.passage){}   /* a keep with a gate passage: its foot is the passage (80g xfKeepWays), so it stays solid here */
   else if(b.kind==='keep'){const n=h>=25?5:3,hs=[];for(let i=0;i<n;i++)hs.push(i?4.3:4.8);   /* xfKeep: on its 1.2 m plinth, its door on the +z face */
    B.push(stack(x,z,w,d,hs,{id:b.id,y:1.2,doors:[{at:[x,z+d/2],w:1.8}],program:n===5?[['hall','guard','store'],['war_room','armoury','study'],['audience','study'],['living','bedroom','kitchen'],['signals','store']]
     :[['hall','guard','store'],['war_room','armoury'],['living','bedroom','kitchen']]}));}
   else if(RANGE[b.kind]){const alongZ=d>w,L=alongZ?d:w,D=alongZ?w:d,ry=alongZ?Math.PI/2:0,face=alongZ?(x>0?-1:1):(z>0?-1:1),nd=Math.max(1,Math.round(L/9)),doors=[];   /* xfRange: two storeys on a 0.6 m plinth, a door a bay on the ward face */
    for(let i=0;i<nd;i++){const q=loc(x,z,-L/2+L*(i+.5)/nd,face*(D/2),ry);doors.push({at:[R3(q[0]),R3(q[1])],w:1.2});}
    B.push(stack(x,z,w,d,[3.3,3.1],{id:b.id,y:.6,doors,program:RANGE[b.kind](Math.round(L/8.5))}));}
   else if(b.kind==='strongroom')B.push(stack(x,z,w*.96,d*.96,[h-.8],{id:b.id,y:.8,doors:[{at:[x,z+front*d*.48],w:1.2}],program:['store'],windows:false}));
   else if(b.kind==='magazine')B.push(stack(x,z,w,d,[h],{id:b.id,y:0,doors:[{at:[x,z+front*d/2],w:1.1}],program:['magazine'],windows:false}));
   else if(SMALL[b.kind])B.push(stack(x,z,w,d,[h],{id:b.id,y:0,doors:[{at:[x,z+front*d/2],w:1.8}],program:[SMALL[b.kind]]}));
   }
  name=name||(VERN.defs[key]?VERN.defs[key].name:key);
  return B.length?{key,name,culture:'xanadu',wealth:.65,types:['military','civic','multi-family dwelling'],lot:[P.w+12,P.d+12],bodies:B,
   note:'the fort\'s stacks hollow (kits/xanadu 80g, F4): the keep, the ranges, the strongroom, the magazine and the court\'s small buildings; towers, gatehouses and the chapel solid'}
   :{key,name,types:['military'],skip:'no building the fort draws has a door into a stack'};}
function xfIxItems(){return Object.keys(XF_IXKEY).map(size=>xfIxItem(XF_PLANS[size],XF_IXKEY[size]));}
/* the set, on a page that has the interiors core (KratorInteriors: settlements/xanadu's 69d bundle); a skip while the fort being
   placed is damaged or ruined. XF_IXSTATE is set before the placement (the 69e hollow wrap reads the item as the def is built) */
if(typeof KratorInteriors!=='undefined'&&KratorInteriors.sets&&!KratorInteriors.sets.byName['xanadu-fort']){
 const S=KratorInteriors.sets.add({set:'xanadu-fort',title:'Xanadu: the forts (F4)',culture:'xanadu',items:xfIxItems()});
 for(const it of S.items)if(!it.skip)Object.defineProperty(it,'skip',{configurable:true,enumerable:true,
  get:()=>xfIxSkip(XF_IXSTATE.state)});
 const p0=VERN.place;VERN.place=function(sc,key,x,z,ry,o){if(!VERN.cur&&(/^xa_fort_(watch|march|gate)$/.test(key)||XF_IXHOST.has(key)))XF_IXSTATE.state=o&&(o.outline!=null||o.gateEdge!=null||o.beacon)?'custom':(o&&o.state)||XF_STATES[xV(o||{})]||'kept';return p0.apply(this,arguments);};}
/* xfIxHost(key, P, name): a host's fort def (a plan of its own, drawn by xfDrawPlan: the House of the Tempest) gets its item the same
   way, in a set of its own (`xanadu-fort:<key>`), a skip while it is placed damaged or ruined; call it once, after the def, on a
   page with the interiors core (else it does nothing). -> the item, or null */
function xfIxHost(key,P,name){if(typeof KratorInteriors==='undefined'||!KratorInteriors.sets||KratorInteriors.sets.byName['xanadu-fort:'+key])return null;
 const S=KratorInteriors.sets.add({set:'xanadu-fort:'+key,title:'Xanadu: '+(name||key),culture:'xanadu',items:[xfIxItem(P,key,name)]}),it=S.items[0];
 if(!it.skip)Object.defineProperty(it,'skip',{configurable:true,enumerable:true,get:()=>xfIxSkip(XF_IXSTATE.state)});XF_IXHOST.add(key);return it;}
function xfIxSkip(st){return st==='custom'?'a fort of its own outline (o.outline, o.gateEdge): its buildings stand where this item does not plan them':st&&st!=='kept'?'the fort is '+st+': its stacks have lost storeys or stand as low walls':undefined;}
