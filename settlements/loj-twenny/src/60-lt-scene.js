// ================================================================= LOJ TWENNY: THE SCENE (the rock, the terminus's works, the lamps)
// [web] The rock is KCAVERN.drawRock's (core/terrain/host/39e) with the rock cut (39h: H opens every void 2 m over its own
// floor) and the fade's soft band (KFADE, occluder off). The terminus's works are drawn here from LT.HALL: the invert, the two
// guideways, the side platforms at the car floor with their cream edges, the concourse over the buffers' end, the buffers,
// the Ancients' name boards (LOJ 20, kept by the loj), each siding's paint band at waist height along both its walls (the
// districts: PLAN.md 5.4), and the lamps as KCAVELIGHT records: the Line's green down the platforms and the sidings of the
// Line deck, red on the quiet deck's ways, amber on the work deck's (light falls with depth: PLAN.md 5.2). The defs' own lamps
// and wax light come from TG.tg.draw (64-lt-hold.js).
KTAGS.page=KTAGS.create({build:'loj-twenny'});
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0b0a09);scene.fog=new THREE.Fog(0x0b0a09,70,260);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.08,1200);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled=false;
const LT_HEMI=new THREE.HemisphereLight(0xd8d0c0,0x2a2420,.5);scene.add(LT_HEMI);
/* the rock: carved from the plan (50-lt-cavern.js), drawn with the cut and the fade */
LTC.build(KWALK);LTC.floors(KWALK);
const LT_ROCK=new THREE.MeshStandardMaterial({color:0xb8ab98,vertexColors:true,roughness:.95,metalness:0});LT_ROCK.name='lt rock';
KFADE.add(LT_ROCK,{occluder:false});KCAVERN.cutLayer(LT_ROCK);
const LT_DRAW=KCAVERN.drawRock(LTC.C,{THREE,material:LT_ROCK,tile:48,label:'The rift fill (the hold\'s rock, carved from the plan)',attrs:['aKCut'],weight:KCAVERN.cutWeight(LTC.C)});
scene.add(LT_DRAW.group);
/* ---------------------------------------------------------------- the terminus's works */
const LT_MATS={};
function ltMat(hex,o){const k=hex+(o?JSON.stringify(o):'');if(LT_MATS[k])return LT_MATS[k];const m=new THREE.MeshStandardMaterial(Object.assign({color:hex,roughness:.85,metalness:0},o||{}));KFADE.add(m);return LT_MATS[k]=m;}
const LT_WORKS=new THREE.Group();LT_WORKS.name='the terminus\'s works';scene.add(LT_WORKS);
function ltBox(x0,x1,y0,y1,z0,z1,hex,name,deck,o){const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),ltMat(hex,o));m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.name=name||'';
 m.userData.deck=deck==null?0:deck;LT_WORKS.add(m);return m;}
(function(){const P=LT.HALL,PY=P.platformY;
 ltBox(-90,P.x1,-.2,0,P.z0,P.z1,0x5e5a54,'the invert');
 P.tracks.forEach(T=>{ltBox(-90,P.buffers,0,P.guide.h,T.z-P.guide.w/2,T.z+P.guide.w/2,0x8a8984,'the guideway '+T.id);
  ltBox(-90,P.buffers,P.guide.h,P.guide.h+.01,T.z-.15,T.z+.15,0x3a2a22,'the guide slot '+T.id);
  ltBox(P.buffers,P.buffers+1.2,0,1.6,T.z-1.4,T.z+1.4,0x6a3a2a,'the buffers '+T.id);ltBox(P.buffers-.4,P.buffers,1.2,1.6,T.z-1.2,T.z+1.2,0xb0b0a8,'the buffer faces');});
 P.platforms.forEach(Q=>{ltBox(3,150,0,PY,Q.z0,Q.z1,0x8e8a82,'the platform '+Q.id);const e=Q.side<0?Q.z1:Q.z0,s=-Q.side;
  ltBox(3,150,PY,PY+.012,Math.min(e,e+s*.35),Math.max(e,e+s*.35),0xd8cfb0,'the platform edge (cream)');
  /* the floor plate worn to a shine down the middle (PLAN.md 5.4: the path) */
  ltBox(6,147,PY,PY+.008,(Q.z0+Q.z1)/2-.9,(Q.z0+Q.z1)/2+.9,0x9a9a94,'the worn floor plate',0,{roughness:.45,metalness:.3});});
 ltBox(148,157,0,PY,P.z0,P.z1,0x8e8a82,'the concourse over the buffers\' end');
 /* the Ancients' name boards, kept: a dark board, a cream band; LOJ 20 painted over the Ancients' name */
 const board=(x,z,ry,txt)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const g=c.getContext('2d');g.fillStyle='#2c3a40';g.fillRect(0,0,512,96);g.fillStyle='#e6dcc0';g.fillRect(0,30,512,36);
  g.fillStyle='#2c3a40';g.font='bold 30px sans-serif';g.textAlign='center';g.fillText(txt,256,58);const tx=new THREE.CanvasTexture(c);tx.encoding=THREE.sRGBEncoding;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(6,1.1),new THREE.MeshStandardMaterial({map:tx,roughness:.6}));m.position.set(x,4.6,z);m.rotation.y=ry;m.name='a name board: '+txt;m.userData.deck=0;LT_WORKS.add(m);};
 for(const x of [46,96,136])for(const [z,ry] of [[P.z0+.05,0],[P.z1-.05,Math.PI]])board(x,z,ry,x===96?'LOJ  TWENNY  20':'LOJ 20');})();
/* each siding's paint band along both its walls at waist height (a district's colour: cream over red, cream over green, plain red) */
(function(){const H=LT.plan(),col={'cream-red':[0x8a3e2a,0xd8cfb0],'cream-green':[0x3f5a43,0xd8cfb0],red:[0x8a3e2a,null]};
 H.ways.filter(w=>w.band&&w.kind==='siding').forEach(w=>{const C=col[w.band];if(!C)return;const a=w.pts[0],b=w.pts[w.pts.length-1],L=Math.hypot(b[0]-a[0],b[2]-a[2]),ux=(b[0]-a[0])/L,uz=(b[2]-a[2])/L;
  for(const s of [-1,1]){const ox=-uz*s*(w.w/2-.03),oz=ux*s*(w.w/2-.03),cx=(a[0]+b[0])/2+ox,cz=(a[2]+b[2])/2+oz,ry=Math.atan2(ux,uz),dk=w.deck==null?0:w.deck;
   const m=new THREE.Mesh(new THREE.BoxGeometry(.02,.95,L-1),ltMat(C[0]));m.position.set(cx,a[1]+.5,cz);m.rotation.y=ry;m.name='the paint band of '+w.id;m.userData.deck=dk;LT_WORKS.add(m);
   if(C[1]){const t=new THREE.Mesh(new THREE.BoxGeometry(.021,.12,L-1),ltMat(C[1]));t.position.set(cx,a[1]+1.04,cz);t.rotation.y=ry;t.name='the cream line of '+w.id;t.userData.deck=dk;LT_WORKS.add(t);}}});})();
/* ---------------------------------------------------------------- the lamps (records): the Line's green down the platforms and the
   branch; the decks' ways in their colour; drawn as small housings, the records lit by KCAVELIGHT (70-lt-light.js) */
const LT_LAMPS=[];
(function(){const H=LT.plan(),P=LT.HALL,PY=P.platformY,kindOf=d=>d===1?'lamp-red':d===-1?'lamp-amber':'lamp-green';
 for(const Q of P.platforms){const z=Q.side<0?Q.z0+.35:Q.z1-.35;for(let x=8;x<150;x+=14)LT_LAMPS.push({id:'lt.lamp.'+Q.id+'.'+x,kind:'lamp-green',x,y:PY+3.2,z,owner:Q.id,deck:0});}
 for(let x=-80;x<0;x+=20)LT_LAMPS.push({id:'lt.lamp.branch.'+x,kind:'lamp-green',x,y:4.6,z:-6.4,owner:'lt.branch',deck:0});
 for(const w of H.ways){if(w.kind!=='siding'&&w.kind!=='ramp'&&w.kind!=='stair')continue;const a=w.pts[0],b=w.pts[w.pts.length-1],L=Math.hypot(b[0]-a[0],b[2]-a[2]);
  if(L<4)continue;const n=Math.max(1,Math.floor(L/12)),dk=w.deck!=null?w.deck:(b[1]>a[1]+1?1:b[1]<a[1]-1?-1:0);
  for(let i=0;i<n;i++){const t=(i+.5)/n,y=a[1]+(b[1]-a[1])*t;LT_LAMPS.push({id:'lt.lamp.'+w.id+'.'+i,kind:kindOf(dk),x:a[0]+(b[0]-a[0])*t,y:y+Math.min(2.3,w.h-.35),z:a[2]+(b[2]-a[2])*t,owner:w.id,deck:dk});}}
 const hm=ltMat(0x2a2826,{metalness:.5,roughness:.5}),g=new THREE.BoxGeometry(.22,.3,.22);
 LT_LAMPS.forEach(r=>{const m=new THREE.Mesh(g,hm);m.position.set(r.x,r.y+.2,r.z);m.userData.deck=r.deck;LT_WORKS.add(m);
  const c=KCAVELIGHT.KINDS[r.kind].colour,bm=new THREE.MeshBasicMaterial({color:c});bm.toneMapped=false;const s=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),bm);s.position.set(r.x,r.y,r.z);s.userData.deck=m.userData.deck;LT_WORKS.add(s);});})();
