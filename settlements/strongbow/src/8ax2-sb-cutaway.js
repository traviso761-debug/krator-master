// ================================================================= STRONGBOW TODAY — the cutaway: who lives where
// sbCutaway(gx, gz) adds a cutaway to the page (the owner, 2026-11-12: "can we get a cutaway view so i can see the inhabited
// areas?"). Switched by the 'cutaway' button, the c key, or the views named "Cutaway — ..." (any other view switches it off).
// - THE SECTION: every lit material on the page takes a KHOOK layer (core/shader) that, while the cutaway is on, discards what
//   lies south of the column's axis (z above the axis's z at that height) and within the column's reach of it. The axis runs up
//   through the lobby, the Spine's drums and terraces and the Order's tower, from the layout's records (sbLayout(): each part's
//   centre, height and radius). The Nock's deck is left whole (the cut stops there), and so is everything off the column: the
//   cliff, the plaza, the wings, the town and the ground. While it is on, cut materials draw both sides, so a drum's far wall
//   shows from inside.
// - THE FLOORS: a slab for every storey of every part that has storeys (the drums, the terraces, the lobby's galleries, the
//   wings, the tower, the galleries on the face, the post at the lip), coloured by who holds it and its state, drawn unlit, and
//   cut by the same section. Shown only while the cutaway is on.
// - THE LEGEND: each holder's colour and the people it houses, from the layout's parts.
// Hashed only, no rng (build.py DETERMINISTIC). The floors are plain records drawn here: nothing is placed, so none is registered.
const SB_CUT_HOLD=[
 {id:'xanadu',name:'the Sultanate (Xanadu): reclaimed',col:0xe8a030,test:p=>p.by==='xanadu'&&p.state!=='damaged'},
 {id:'xanadu-d',name:'the Sultanate: held, damaged',col:0xb4905a,test:p=>p.by==='xanadu'},
 {id:'outcasts',name:'the outcasts: squatted',col:0xa060d0,test:p=>p.by==='outcasts'},
 {id:'order',name:'the Order',col:0x86b8ea,test:p=>p.by==='order'&&p.state!=='sealed'},
 {id:'sealed',name:'sealed',col:0x6a6a70,test:p=>p.state==='sealed'},
 {id:'cutoff',name:'cut off: no way in',col:0x404a62,test:p=>p.state==='cutoff'},
 {id:'empty',name:'empty, damaged',col:0x8a7a66,test:p=>true}];
const SB_CUT_SKIP=/^(plaza|pool|yard|pad|mast|wall|shaft|stair|quarry|ground|fallen|cistern|deck|landing|burned)$/;

function sbCutaway(gx,gz){const L=sbLayout(),P={};for(const p of L.parts)P[p.id]=p;const O={on:false,auto:false,floors:0,mats:0};
 // ---- the column's axis: knots (y, x, z, reach) from the parts the column is made of -----------------------------------------
 const K=[],ctr=p=>{const s=p.shape;return s[0]==='box'?[(s[1]+s[2])/2,(s[3]+s[4])/2]:[s[1],s[2]];};
 const reach=p=>{const s=p.shape;return s[0]==='box'?Math.hypot(s[2]-s[1],s[4]-s[3])/2+2:s[0]==='ring'?s[4]+.5:s[3]+.5;};
 const col=L.parts.filter(p=>p.zone!=='town'&&(p.kind==='drum'||p.kind==='terrace'&&!p.in||p.id==='sb.lobby'||p.id==='sb.tower.low'||p.id==='sb.tower.order'))
  .sort((a,b)=>a.y-b.y);
 /* a terrace's band reaches 4 m under its deck and 2 m over its parapets: its slab and rim sit a little off its record's y */
 for(const p of col){const c=ctr(p),T=p.kind==='terrace',r=T?reach(p)+4:reach(p);K.push([p.y-(p.id==='sb.lobby'?16:T?4:0),c[0],c[1],r]);K.push([p.y+Math.max(p.h,8)+(T?2:0),c[0],c[1],r]);}
 K.sort((a,b)=>a[0]-b[0]);
 /* the Nock's deck stays whole: no reach from just under it to just over it */
 {const N=P['sb.nock.c'],y0=N.y-6,y1=N.y+14,at=y=>{for(let i=1;i<K.length;i++)if(K[i][0]>=y){const a=K[i-1],b=K[i],t=(y-a[0])/((b[0]-a[0])||1);return [y,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];}return K[K.length-1].slice();};
  const A=at(y0-1),B=at(y1+1);for(let i=K.length-1;i>=0;i--)if(K[i][0]>=y0-1&&K[i][0]<=y1+1)K.splice(i,1);
  K.push(A,[y0,A[1],A[2],0],[y1,B[1],B[2],0],B);K.sort((a,b)=>a[0]-b[0]);}
 const NK=Math.min(64,K.length);
 const U={uSbCut:{value:0},uSbN:{value:NK},uSbK:{value:K.slice(0,NK).map(k=>new THREE.Vector4(k[0],k[1]+gx,k[2]+gz,k[3]))}};
 while(U.uSbK.value.length<64)U.uSbK.value.push(new THREE.Vector4(1e6,0,0,0));
 const GL='uniform float uSbCut;uniform int uSbN;uniform vec4 uSbK[64];varying vec3 vSbW;\n'+
  'bool sbCutHere(vec3 w){if(w.y<uSbK[0].x||w.y>uSbK[uSbN-1].x)return false;vec4 a=uSbK[0],b=uSbK[0];\n'+
  ' for(int i=1;i<64;i++){if(i>=uSbN)break;b=uSbK[i];if(b.x>=w.y)break;a=b;}\n'+
  ' float t=clamp((w.y-a.x)/max(b.x-a.x,1e-3),0.0,1.0);vec4 k=mix(a,b,t);\n'+
  ' return k.w>0.5&&w.z>k.z&&length(w.xz-k.yz)<k.w;}\n';
 const SPEC={uniforms:U,
  vertex:{head:'varying vec3 vSbW;\n',at:[{at:'project_vertex',after:'#ifdef USE_INSTANCING\n vSbW=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n#else\n vSbW=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif'}]},
  fragment:{head:GL,at:[{at:'clipping_planes_fragment',after:'if(uSbCut>0.5&&sbCutHere(vSbW))discard;'}]}};
 const LIT=m=>m&&(m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshBasicMaterial)&&!m.isShaderMaterial;
 const hooked=new Set(),sides=new Map();
 const hookAll=()=>{scene.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];
  for(const m of ms){if(!LIT(m)||m===MAT.ground||hooked.has(m))continue;if(typeof KHOOK!=='undefined'){KHOOK.add(m,'sb-cutaway',SPEC,{key:'sb-cutaway'});hooked.add(m);}}});O.mats=hooked.size;};
 // ---- the floors: a slab a storey, coloured by holder --------------------------------------------------------------------------
 const pos=[],colr=[],C3=new THREE.Color(),cnt={},ppl={};
 const tri=(a,b,c)=>{for(const p of [a,b,c]){pos.push(p[0]+gx,p[1],p[2]+gz);colr.push(C3.r,C3.g,C3.b);}};
 const slab=(p,y,inset)=>{const s=p.shape,T=.45;
  if(s[0]==='box'){const x0=s[1]+inset,x1=s[2]-inset,z0=s[3]+inset,z1=s[4]-inset;if(x1<=x0||z1<=z0)return;
   for(const yy of [y,y+T]){tri([x0,yy,z0],[x1,yy,z1],[x1,yy,z0]);tri([x0,yy,z0],[x0,yy,z1],[x1,yy,z1]);}
   for(const [a,b] of [[[x0,z0],[x1,z0]],[[x1,z0],[x1,z1]],[[x1,z1],[x0,z1]],[[x0,z1],[x0,z0]]]){tri([a[0],y,a[1]],[b[0],y,b[1]],[b[0],y+T,b[1]]);tri([a[0],y,a[1]],[b[0],y+T,b[1]],[a[0],y+T,a[1]]);}return;}
  const cx=s[1],cz=s[2],r1=(s[0]==='ring'?s[4]:s[3])-inset,r0=s[0]==='ring'?s[3]+inset:0,n=40;if(r1<=r0)return;
  for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
   for(const yy of [y,y+T]){if(r0>0){tri([cx+r0*ca,yy,cz+r0*sa],[cx+r1*cb,yy,cz+r1*sb],[cx+r1*ca,yy,cz+r1*sa]);tri([cx+r0*ca,yy,cz+r0*sa],[cx+r0*cb,yy,cz+r0*sb],[cx+r1*cb,yy,cz+r1*sb]);}
    else tri([cx,yy,cz],[cx+r1*cb,yy,cz+r1*sb],[cx+r1*ca,yy,cz+r1*sa]);}
   tri([cx+r1*ca,y,cz+r1*sa],[cx+r1*cb,y,cz+r1*sb],[cx+r1*cb,y+T,cz+r1*sb]);tri([cx+r1*ca,y,cz+r1*sa],[cx+r1*cb,y+T,cz+r1*sb],[cx+r1*ca,y+T,cz+r1*sa]);}};
 for(const p of L.parts){if(p.zone==='town'||p.state==='gone'||SB_CUT_SKIP.test(p.kind))continue;
  const st=p.kind==='terrace'?1:p.st|0;if(st<1)continue;const H=SB_CUT_HOLD.find(g=>g.test(p));C3.setHex(H.col).convertSRGBToLinear();
  if(p.people>0)C3.multiplyScalar(1.15);else if(H.id.indexOf('xanadu')===0)C3.multiplyScalar(.8);
  const inset=p.kind==='terrace'?6:p.kind==='drum'?2.5:1.2,h=p.kind==='terrace'?0:p.h/st;
  for(let k=0;k<st;k++){slab(p,p.y+(p.kind==='terrace'?1.2:.3+k*h),inset);O.floors++;}
  cnt[H.id]=(cnt[H.id]||0)+st;ppl[H.id]=(ppl[H.id]||0)+(p.people|0);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colr,3));g.computeBoundingSphere();
 const FM=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
 const floors=new THREE.Mesh(g,FM);floors.name='strongbow:cutaway floors';floors.visible=false;floors.userData.lodSkip=true;floors.userData.probeSkip=true;scene.add(floors);
 // ---- the legend --------------------------------------------------------------------------------------------------------------
 const leg=document.createElement('div');leg.id='sbCutLegend';
 leg.style.cssText='position:fixed;left:10px;bottom:10px;display:none;background:rgba(20,16,12,.82);color:#eee;font:12px/1.5 system-ui,sans-serif;padding:8px 10px;border-radius:6px;max-width:300px;z-index:20';
 const tot=L.parts.filter(p=>p.zone!=='town').reduce((s,p)=>s+(p.people|0),0);
 leg.innerHTML='<b>Cutaway: who lives where</b><br>'+SB_CUT_HOLD.filter(G=>cnt[G.id]).map(G=>'<span style="display:inline-block;width:11px;height:11px;margin-right:6px;vertical-align:-1px;background:#'+
  G.col.toString(16).padStart(6,'0')+'"></span>'+G.name+(ppl[G.id]?' — '+ppl[G.id].toLocaleString('en')+' people':'')).join('<br>')+
  '<br><span style="opacity:.75">'+tot.toLocaleString('en')+' in the arcology; the town at the foot is not cut. c: cutaway on and off</span>';
 document.body.appendChild(leg);
 // ---- the switch ----------------------------------------------------------------------------------------------------------------
 const set=on=>{on=!!on;if(on===O.on)return;O.on=on;if(on&&!hooked.size)hookAll();U.uSbCut.value=on?1:0;floors.visible=on;leg.style.display=on?'block':'none';
  for(const m of hooked){if(on){if(!sides.has(m))sides.set(m,m.side);if(m.side!==THREE.DoubleSide){m.side=THREE.DoubleSide;m.needsUpdate=true;}}
   else if(sides.has(m)&&m.side!==sides.get(m)){m.side=sides.get(m);m.needsUpdate=true;}}
  if(btn)btn.textContent=on?'cutaway on (c)':'cutaway (c)';};
 const ui=document.getElementById('ui');let btn=null;
 if(ui){btn=document.createElement('button');btn.textContent='cutaway (c)';btn.onclick=()=>{O.auto=false;set(!O.on);};ui.appendChild(btn);}
 addEventListener('keydown',e=>{if(e.key&&e.key.toLowerCase()==='c'&&!(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))){O.auto=false;set(!O.on);}});
 /* the views named "Cutaway — ..." switch it on, any other view off: setView is wrapped on the first
    frame, after the camera fragment (92) has defined it; the view list and the probe both call it by name */
 let wrapped=false;
 tick(()=>{if(wrapped||typeof setView!=='function'||typeof VIEWS==='undefined')return;wrapped=true;const base=setView;
  const cuts=Object.keys(VIEWS).filter(k=>/^Cutaway/.test(k)).map(k=>VIEWS[k]);
  setView=function(){const a=arguments,hit=cuts.some(v=>v.slice(0,6).every((x,i)=>Math.abs(x-a[i])<1e-6));const r=base.apply(this,a);
   O.auto=hit;set(hit);return r;};});
 O.set=set;window._sbCut=O;return O;}
