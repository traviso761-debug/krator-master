/* ============================== 78r. THE PALACE CITADEL DRAWN ============================== */
/* [web] Draws IZPAL.layout() (78q) into the kit's instance lists, before kbake: the masses' shells with their doorways, the
   liners, floors, ceilings, partitions, doors, balustrades, stairs and shafts, finished by each space's decor level (the
   blueprint's "Finishes by decor level"):
     4 sumptuous  marble floor (a sun medallion in the great rooms), marble dado, cream stucco, a gilt frieze, marble
                  pilasters with gilt capitals, a coffered ceiling (the coffer sheet), gilt door surrounds and bronze leaves (the door sheet)
     3 rich       mosaic floor, mahogany dado, warm orange stucco, the sun-banner frieze, a gilt cornice, mahogany doors
     2 fine       teal tile floor and dado, white stucco
     1 plain      stone floor, plaster
     0 bare       board-formed concrete
     Ancient      (the Depot and the Core) white Ancient panel with cyan light strips; concrete or panel floors
   The palace builder's own masses (78-transplant.js 'palace': seven frustums) are taken out of the kit's lists after it
   ran and drawn again here as SHELLS of the same size, taper, material and tint, with the doorways the layout's portals
   cut (the grand entrance, the great door, the hall's side doors); its dark doorway boxes and lit panes that stood inside
   the masses go too (SKILL.md 5o: clear what the builder put inside, by position, from the instances it pushed). Nothing
   else of the builder moves. IZPALDRAW.stats says what was drawn. */
MAT.palMarble=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.3,metalness:0});vWorldUV(MAT.palMarble,1/2.4);
MAT.palMosaic=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5,metalness:0});vWorldUV(MAT.palMosaic,1/1.2);
MAT.palMosaicB=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.45,metalness:0});vWorldUV(MAT.palMosaicB,1/1.2);
MAT.palTile=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5,metalness:0});vWorldUV(MAT.palTile,1/1.2);
MAT.palGilt=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35,metalness:.55});vWorldUV(MAT.palGilt,1/1.2);
MAT.palGold=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.28,metalness:.85});vWorldUV(MAT.palGold,1/1.5);
MAT.palStucco=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.92,metalness:0});vWorldUV(MAT.palStucco,1/3);
MAT.palAncient=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.55,metalness:.15});vWorldUV(MAT.palAncient,1/4);
MAT.palConc=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.95,metalness:0});vWorldUV(MAT.palConc,1/4);
MAT.palMahog=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:0});vWorldUV(MAT.palMahog,1/2);
MAT.palSunBanner=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,metalness:0});vWorldUV(MAT.palSunBanner,1/1.6);
MAT.palMedal=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.32,metalness:0});           // one medallion across the piece's top
MAT.palSunray=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.4,metalness:0});
// delivered 2026-10-19 (core/materials/PROMPTS-NEEDED.md, the palace's five): the coffer (world tiles of 2.4 m on the
// sumptuous ceilings), the deck (world tiles of 6 m on the Depot's working floors, grey, tinted), and three single sheets on
// a box's faces: the legions fresco (one 2:1 panel per frieze piece), the bronze door leaf, the crater map
MAT.palCoffer=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5,metalness:.2});vWorldUV(MAT.palCoffer,1/2.4);
MAT.palDeck=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.6,metalness:.35});vWorldUV(MAT.palDeck,1/6);
MAT.palFresco=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.9,metalness:0});
MAT.palDoorLeaf=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.42,metalness:.5});
MAT.palMap=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.32,metalness:0});
// the windows (2026-10-19, the owner: "actual doors and windows"): clear glass the rooms are seen through, a curtained glass
// for the blind ones (no room behind: a void, a stair, a partition), bronze glazing bars
MAT.palGlass=new THREE.MeshStandardMaterial({color:0xb8d0dc,roughness:.04,metalness:.2,transparent:true,opacity:.26,depthWrite:false});
MAT.palGlassD=new THREE.MeshStandardMaterial({color:0xe2c690,roughness:.35,metalness:.05,emissive:0x5a3c14});   // a blind window: lit curtains behind the glass
MAT.palBronze=new THREE.MeshStandardMaterial({color:0x6e4e26,roughness:.38,metalness:.7});
MAT.palWater=new THREE.MeshStandardMaterial({color:vC(0x2f8f8a),roughness:.08,metalness:.3,transparent:true,opacity:.82});
MAT.palPane=new THREE.MeshBasicMaterial({color:vC(0xdce8ef)});     // a window's daylight, seen from inside
MAT.palLamp=new THREE.MeshBasicMaterial({color:vC(0xffe4b4)});     // an electric light panel, a lit skylight
kdef('palFloorM',VBOX,MAT.palMarble);kdef('palFloorMo',VBOX,MAT.palMosaic);kdef('palFloorMoB',VBOX,MAT.palMosaicB);kdef('palFloorT',VBOX,MAT.palTile);
kdef('palMarbleB',VBOX,MAT.palMarble);kdef('palStuccoB',VBOX,MAT.palStucco);kdef('palMahogB',VBOX,MAT.palMahog);kdef('palGiltB',VBOX,MAT.palGilt);
kdef('palGoldB',VBOX,MAT.palGold);kdef('palAncB',VBOX,MAT.palAncient);kdef('palConcB',VBOX,MAT.palConc);kdef('palTileB',VBOX,MAT.palTile);kdef('palMosaicBB',VBOX,MAT.palMosaicB);
kdef('palSunBannerB',VBOX,MAT.palSunBanner);kdef('palMedalB',VBOX,MAT.palMedal);kdef('palSunrayB',VBOX,MAT.palSunray);kdef('palWaterB',VBOX,MAT.palWater);
kdef('palCofferB',VBOX,MAT.palCoffer);kdef('palDeckB',VBOX,MAT.palDeck);kdef('palFrescoB',VBOX,MAT.palFresco);kdef('palDoorB',VBOX,MAT.palDoorLeaf);kdef('palMapB',VBOX,MAT.palMap);
kdef('palGlassB',VBOX,MAT.palGlass);kdef('palGlassDB',VBOX,MAT.palGlassD);kdef('palBronzeB',VBOX,MAT.palBronze);
kdef('palPaneB',VBOX,MAT.palPane);kdef('palLampB',VBOX,MAT.palLamp);kdef('palGlowB',VBOX,MAT.strip);
kdef('palColM',new THREE.CylinderGeometry(1,1,1,16).translate(0,.5,0),MAT.palMarble);kdef('palColG',new THREE.CylinderGeometry(1,1,1,16).translate(0,.5,0),MAT.palGold);
kdef('palColF',new THREE.CylinderGeometry(.9,1,1,16).translate(0,.5,0),MAT.palGold);   // a flared gilt capital or base
KMAT.bindMat('izpalace',MAT,{});   // the palace's own pack (build.py TARGET_PACKS: palace/materials.json, palace/tex/)
const IZPALDRAW=(function(){
 const ST={shells:0,frustums:0,cleared:0,liners:0,walls:0,rails:0,doors:0,floors:0,ceilings:0,steps:0,panes:0,columns:0,portals:0,ms:0};
 const C={cream:vC(0xf3e2c0),orange:vC(0xefc79c),white:vC(0xf2ece2),plaster:vC(0xdcd2c2),teal:vC(0x2f8f8a),stone:vC(0xd8cbb4),conc:vC(0xc8c4bc),
  anc:vC(0xf0f0ec),deck:vC(0xb4b2ac),oak:vC(0x8a6440),dark:vC(0x3a3632),sand:tC(0xd4a05a),sandL:tC(0xe6bd7e),bronze:vC(0x8a6a2a),cyan:CYAN};
 let FR=null,Q=null,QV=null;const CELLW=IZPAL.CELL;
 // a box in the citadel's frame: centre (u, v), base height y (from the mesa top), sizes along u, v and up
 const B=(item,u,v,y,su,sv,sy,c,q)=>{const p=FR.P(u,v);kput(item,[p[0],FR.Y(y)+sy/2,p[1]],q||Q,[sv,sy,su],c||null);};
 // the same for the base-anchored round items (palColM, palColF, palColG): base at y; flip stands it on its head (a capital)
 const BC=(item,u,v,y,dia,h,c,flip)=>{const p=FR.P(u,v);kput(item,[p[0],FR.Y(flip?y+h:y),p[1]],flip?qEuler(Math.PI,FR.ry,0):Q,[dia/2,h,dia/2],c||null);};
 // a wall piece on a line: dir 'u' runs along v at u = line; 'v' runs along u at v = line; off moves it off the line
 const W=(item,dir,line,t0,t1,off,th,y,h,c)=>{if(t1-t0<.02||h<.02)return;const m=(t0+t1)/2,L=t1-t0;
  if(dir==='u')B(item,line+off,m,y,th,L,h,c);else B(item,m,line+off,y,L,th,h,c);};
 /* ---------------------------------------------------------------- finishes */
 // a space's style: its wall, its dado, its frieze, its floor, its ceiling, its door frame
 // the Depot's working floors take the hangar deck; the feast rooms and the Hall of the Standards the legions fresco
 const DECK={mech_bay:1,repair_shop:1,forge:1,hall:1,lift_hall:1,entrance:1,passage:1,workshop:1,store:1,cells:1,armoury:1},FRESCO={feast_private:1,trophy:1};
 function style(s,anc){const d=s?s.decor:2,k=s?s.kind:'';
  if(anc){const deck=s&&DECK[k]&&/\.U1\./.test(s.id);
   return{wall:'palAncB',wc:C.anc,dado:null,band:'palGlowB',bandC:C.cyan,floor:deck?'palDeckB':d>=3||k==='core'||k==='control_room'?'palAncB':'palConcB',fc:deck?C.deck:d>=3?C.anc:C.conc,
   ceil:'palAncB',cc:C.anc,frame:'palAncB',frameC:C.anc,anc:true,d};}
  const fr=FRESCO[k]&&d>=3;
  if(d>=4)return{wall:'palStuccoB',wc:C.cream,dado:'palMarbleB',dh:1.2,dc:null,frieze:fr?'palFrescoB':'palGiltB',fh:fr?1.1:.55,floor:k==='bath'?'palFloorMoB':'palFloorM',fc:null,ceil:'palCofferB',cc:null,frame:'palGoldB',frameC:null,pil:true,d};
  if(d===3)return{wall:'palStuccoB',wc:C.orange,dado:'palMahogB',dh:1.0,dc:null,frieze:fr?'palFrescoB':'palSunBannerB',fh:fr?1.1:.6,floor:k==='bath'?'palFloorMoB':'palFloorMo',fc:null,ceil:'palStuccoB',cc:C.cream,cornice:true,frame:'palMahogB',frameC:null,d};
  if(d===2)return{wall:'palStuccoB',wc:C.white,dado:'palTileB',dh:.9,dc:null,floor:'palFloorT',fc:null,ceil:'palStuccoB',cc:C.white,frame:'palMahogB',frameC:null,d};
  if(d===1)return{wall:'palStuccoB',wc:C.plaster,dado:null,skirt:true,floor:'vStone',fc:C.stone,ceil:'palStuccoB',cc:C.plaster,frame:'palStuccoB',frameC:C.stone,d};
  return{wall:'palConcB',wc:C.conc,floor:'palConcB',fc:C.conc,ceil:'palConcB',cc:C.conc,frame:'palConcB',frameC:C.conc,d};}
 // one skin of a wall (the face toward one space): wall, dado, frieze, pilasters; side = +1 or -1 off the line
 function skin(sty,dir,line,t0,t1,side,y,h,gaps){if(t1-t0<.05)return;const th=.13,off=side*.075;
  // the pieces between the door gaps, and above each gap a lintel piece of the wall
  const segs=[];let a=t0;(gaps||[]).slice().sort((p,q)=>p.t0-q.t0).forEach(g=>{if(g.t0>a)segs.push([a,g.t0]);
   const top=Math.min(h,g.h);if(top<h-.02)W(sty.wall,dir,line,g.t0,g.t1,off,th,y+top,h-top,sty.wc);
   if(g.y0>.02){const b=Math.min(g.y0,h);W(sty.wall,dir,line,g.t0,g.t1,off,th,y,b,sty.wc);if(sty.dado)W(sty.dado,dir,line,g.t0,g.t1,side*.155,.04,y,Math.min(sty.dh,b),sty.dc);
    if(sty.skirt)W('palStuccoB',dir,line,g.t0,g.t1,side*.155,.04,y,.18,C.dark);}
   a=Math.max(a,g.t1);});if(a<t1)segs.push([a,t1]);
  for(const[s0,s1]of segs){W(sty.wall,dir,line,s0,s1,off,th,y,h,sty.wc);ST.walls++;
   if(sty.dado)W(sty.dado,dir,line,s0,s1,side*.155,.04,y,sty.dh,sty.dc);
   if(sty.skirt)W('palStuccoB',dir,line,s0,s1,side*.155,.04,y,.18,C.dark);
   if(sty.band)W(sty.band,dir,line,s0,s1,side*.16,.05,y+Math.min(2.6,h-.4),.08,sty.bandC);
   if(sty.frieze==='palFrescoB'){if(h>sty.dh+sty.fh+1.4){const n=Math.max(1,Math.round((s1-s0)/(2*sty.fh))),L=(s1-s0)/n;
     for(let i=0;i<n;i++)W('palFrescoB',dir,line,s0+i*L,s0+(i+1)*L,side*.155,.04,y+h-sty.fh-.15,sty.fh,null);}}
   else if(sty.frieze&&h>3.2)W(sty.frieze,dir,line,s0,s1,side*.155,.04,y+h-sty.fh-.15,sty.fh,null);
   if(sty.cornice&&h>3)W('palGoldB',dir,line,s0,s1,side*.17,.12,y+h-.22,.14,null);
   if(sty.pil&&h>3.4){const n=Math.floor((s1-s0)/3.6);for(let i=1;i<=n;i++){const t=s0+(s1-s0)*i/(n+1);
    W('palMarbleB',dir,line,t-.3,t+.3,side*.22,.18,y,h-sty.fh-.24,C.white);W('palGoldB',dir,line,t-.38,t+.38,side*.25,.22,y+h-sty.fh-.55,.35,null);
    W('palGoldB',dir,line,t-.36,t+.36,side*.24,.2,y,.25,null);ST.columns++;}}}}
 /* ---------------------------------------------------------------- the masses' shells */
 // a battered face with rectangular holes: s along the face, y up; returns triangles in the citadel's frame
 function shellGeo(M,holes){const pos=[],nor=[],uv=[];
  const f=y=>1-(1-M.t)*(y-M.y0)/M.H;
  const faces=[{ax:'u',sgn:-1},{ax:'u',sgn:1},{ax:'v',sgn:-1},{ax:'v',sgn:1}];
  for(const F of faces){const hn=(F.ax==='u'?M.du:M.dv)/2,hs=(F.ax==='u'?M.dv:M.du)/2,cn=F.ax==='u'?M.u:M.v,cs=F.ax==='u'?M.v:M.u;
   // the point on the face at (s, y): its world position
   const pt=(s,y)=>{const n=cn+F.sgn*hn*f(y),ss=cs+s;const uv2=F.ax==='u'?[n,ss]:[ss,n];const p=FR.P(uv2[0],uv2[1]);return[p[0],FR.Y(y),p[1]];};
   const nrm=(()=>{const dn=hn*(1-M.t)/M.H;const nu=F.ax==='u'?F.sgn:0,nv=F.ax==='v'?F.sgn:0;const L=Math.hypot(1,dn);
    const a=FR.P(nu,nv),o=FR.P(0,0);return[(a[0]-o[0])/L,dn/L,(a[1]-o[1])/L];})();
   const H=holes.filter(h=>h.ax===F.ax&&h.sgn===F.sgn);
   const ys=[M.y0,M.y0+M.H];H.forEach(h=>{ys.push(Math.max(M.y0,Math.min(M.y0+M.H,h.y0)),Math.max(M.y0,Math.min(M.y0+M.H,h.y1)));});
   const Y=[...new Set(ys.map(y=>+y.toFixed(4)))].sort((a,b)=>a-b);
   for(let i=0;i+1<Y.length;i++){const ya=Y[i],yb=Y[i+1];if(yb-ya<1e-4)continue;
    const act=H.filter(h=>h.y0<=ya+1e-4&&h.y1>=yb-1e-4).map(h=>[h.s0-cs,h.s1-cs]).sort((p,q)=>p[0]-q[0]);
    // pieces: [left edge kind, value, right edge kind, value]; 'e' the face's edge (moves with y), 'h' a hole's side
    let L=['e',-1];const pieces=[];act.forEach(h=>{pieces.push([L,['h',h[0]]]);L=['h',h[1]];});pieces.push([L,['e',1]]);
    for(const[l,r]of pieces){const sx=(e,y)=>e[0]==='e'?e[1]*hs*f(y):e[1];
     const a=pt(sx(l,ya),ya),b=pt(sx(r,ya),ya),c=pt(sx(r,yb),yb),d=pt(sx(l,yb),yb);
     if(sx(r,ya)-sx(l,ya)<1e-3&&sx(r,yb)-sx(l,yb)<1e-3)continue;
     const quad=[a,b,c,a,c,d],uq=[[sx(l,ya),ya],[sx(r,ya),ya],[sx(r,yb),yb],[sx(l,ya),ya],[sx(r,yb),yb],[sx(l,yb),yb]];
     // wind so the face's normal points out (the frame's handedness decides)
     const e1=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],e2=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],cx=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
     const flip=cx[0]*nrm[0]+cx[1]*nrm[1]+cx[2]*nrm[2]<0;const order=flip?[0,2,1,3,5,4]:[0,1,2,3,4,5];
     for(const o of order){pos.push(...quad[o]);nor.push(...nrm);uv.push(uq[o][0],uq[o][1]);}}}}
  // the top
  {const ft=M.t,hu=M.du/2*ft,hv=M.dv/2*ft,y=FR.Y(M.y0+M.H);const c=[[-1,-1],[1,-1],[1,1],[-1,1]].map(k=>{const p=FR.P(M.u+k[0]*hu,M.v+k[1]*hv);return[p[0],y,p[1]];});
   const tri=[c[0],c[1],c[2],c[0],c[2],c[3]];const e1=[c[1][0]-c[0][0],0,c[1][2]-c[0][2]],e2=[c[2][0]-c[0][0],0,c[2][2]-c[0][2]];const up=e1[2]*e2[0]-e1[0]*e2[2]>0;
   const order=up?[0,1,2,3,4,5]:[0,2,1,3,5,4];for(const o of order){pos.push(...tri[o]);nor.push(0,1,0);uv.push(tri[o][0],tri[o][2]);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g;}
 // where a portal crosses a mass's face: the hole on that face at the portal's mid-height
 function portalHoles(M,P,y0){const out=[],ym=y0+P.h/2;if(ym<M.y0||ym>M.y0+M.H)return out;const f=1-(1-M.t)*(ym-M.y0)/M.H;
  for(const ax of['u','v'])for(const sgn of[-1,1]){const hn=(ax==='u'?M.du:M.dv)/2*f,hs=(ax==='u'?M.dv:M.du)/2*f,cn=ax==='u'?M.u:M.v,cs=ax==='u'?M.v:M.u;
   const plane=cn+sgn*hn,ia=ax==='u'?0:1,ib=1-ia,a=P.a[ia],b=P.b[ia];if((a-plane)*(b-plane)>0||a===b)continue;
   const t=(plane-a)/(b-a),s=P.a[ib]+(P.b[ib]-P.a[ib])*t;if(Math.abs(s-cs)>hs-.3)continue;
   out.push({ax,sgn,s0:s-P.w/2,s1:s+P.w/2,y0,y1:Math.min(y0+P.h,M.y0+M.H-.4)});}
  return out;}
 /* ---------------------------------------------------------------- the builder's instances inside the masses */
 function clear(mark,L){const vols=[];
  // the builder's windows (78-transplant.js izOne: a dark box, a lit panel, two jambs, a lintel, a drip, a sill at each of
  // IZPAL.windows()): all out; the openings are drawn in their place (palWindow), fitted to the storeys
  {const W0=IZPAL.windows();for(const name of['boxW','boxD','dot']){const it=KIT.items[name];
   KIT.items[name]=it.filter((o,i)=>{if(i<mark[name])return true;if(name==='boxW'&&Array.isArray(o.s)&&Math.max(o.s[0],o.s[2])>5)return true;
    const uv=FR.UV(o.p[0],o.p[2]),y=o.p[1]-FR.F.top;
    for(const w of W0){const dn=(uv[0]-w.u)*w.nu+(uv[1]-w.v)*w.nv,dt=w.nu?uv[1]-w.v:uv[0]-w.u,dy=y-w.y;
     if(Math.abs(dt)<=w.w/2+.75&&dn>-.6&&dn<1&&dy>-w.h/2-.6&&dy<w.h/2+1.1){ST.cleared++;return false;}}
    return true;});}}
  L.buildings.forEach(Bd=>Bd.storeys.forEach(S=>S.env.forEach(e=>{if(e.open)return;vols.push([e.u0+.1,e.u1-.1,e.v0+.1,e.v1-.1,S.y+.05,S.y+S.h]);})));
  // the doorways (the builder's dark boxes in them)
  const ports=[];L.buildings.forEach(Bd=>Bd.storeys.forEach(S=>(S.portals||[]).forEach(P=>{const du=P.b[0]-P.a[0],dv=P.b[1]-P.a[1],n=Math.hypot(du,dv);
   ports.push({a:P.a,du:du/n,dv:dv/n,len:n,w:P.w,y0:S.y,y1:S.y+P.h});})));
  const inVol=(u,v,y)=>vols.some(q=>u>q[0]&&u<q[1]&&v>q[2]&&v<q[3]&&y>q[4]&&y<q[5]);
  const inPort=(u,v,y)=>ports.some(P=>{const ru=u-P.a[0],rv=v-P.a[1],along=ru*P.du+rv*P.dv,across=Math.abs(-ru*P.dv+rv*P.du);
   return along>-2&&along<P.len+3&&across<P.w/2+.6&&y>P.y0-.5&&y<P.y1+.5;});
  for(const name of['boxD','dot','lampI']){const it=KIT.items[name],keep=[];
   it.forEach((o,i)=>{if(i<mark[name]){keep.push(o);return;}const uv=FR.UV(o.p[0],o.p[2]),y=o.p[1]-FR.F.top;
    if(inVol(uv[0],uv[1],y)||(name!=='lampI'&&inPort(uv[0],uv[1],y)))ST.cleared++;else keep.push(o);});KIT.items[name]=keep;}
  // the builder's roof slabs (boxW, 1.5 m thick, at each tier's top: the tier's cornice lip outside, a slab across every
  // room inside): each becomes a ring round the liner of the storey it sat in, so the outside keeps its cornice and the
  // rooms their floors and ceilings
  {const it=KIT.items.boxW,keep=[],rings=[];
   it.forEach((o,i)=>{if(i<mark.boxW){keep.push(o);return;}const sc=o.s,uv=FR.UV(o.p[0],o.p[2]),y=o.p[1]-FR.F.top;
    if(!Array.isArray(sc)||sc[0]*sc[2]<400||!inVol(uv[0],uv[1],y)){keep.push(o);return;}
    const lin=vols.filter(q=>uv[0]>q[0]&&uv[0]<q[1]&&uv[1]>q[2]&&uv[1]<q[3]&&y>q[4]&&y<q[5]).sort((p,q)=>(p[1]-p[0])*(p[3]-p[2])-(q[1]-q[0])*(q[3]-q[2]))[0];
    const hu=sc[2]/2,hv=sc[0]/2,iu0=lin[0]-.3,iu1=lin[1]+.3,iv0=lin[2]-.3,iv1=lin[3]+.3,o0=[uv[0]-hu,uv[0]+hu,uv[1]-hv,uv[1]+hv];
    rings.push({y:y-sc[1]/2,h:sc[1],c:o.c,parts:[[o0[0],iu0,o0[2],o0[3]],[iu1,o0[1],o0[2],o0[3]],[iu0,iu1,o0[2],iv0],[iu0,iu1,iv1,o0[3]]]});ST.cleared++;});
   KIT.items.boxW=keep;
   rings.forEach(r=>r.parts.forEach(q=>{if(q[1]-q[0]>.05&&q[3]-q[2]>.05)B('boxW',(q[0]+q[1])/2,(q[2]+q[3])/2,r.y,q[1]-q[0],q[3]-q[2],r.h,r.c);}));}
  // the seven masses (the frustums the palace pushed: frus93, frus90, frus88 x4, the tower's frus85 at the rear mass's top)
  const want=[['frus93',1],['frus90',1],['frus88',4],['frus85',1]];
  for(const[name,n]of want){const it=KIT.items[name];let taken=0;
   KIT.items[name]=it.filter((o,i)=>{if(i<mark[name]||taken>=n)return true;if(name==='frus85'&&Math.abs(o.p[1]-FR.Y(50))>.5)return true;taken++;ST.frustums++;return false;});}}
 /* ---------------------------------------------------------------- one storey */
 // rect arithmetic in the frame: the overlap of two rects, and what is left of x once I is taken out of it
 const inter=(a,b)=>({u0:Math.max(a.u0,b.u0),u1:Math.min(a.u1,b.u1),v0:Math.max(a.v0,b.v0),v1:Math.min(a.v1,b.v1)});
 const solid=q=>q.u1-q.u0>.01&&q.v1-q.v0>.01;
 const minus=(x,I)=>[{u0:x.u0,u1:I.u0,v0:x.v0,v1:x.v1},{u0:I.u1,u1:x.u1,v0:x.v0,v1:x.v1},{u0:I.u0,u1:I.u1,v0:x.v0,v1:I.v0},{u0:I.u0,u1:I.u1,v0:I.v1,v1:x.v1}].filter(solid);
 function storey(Bd,S,next,upper,anc,below){
  const sp=S.spaces;
  const sty=s=>style(s,anc);
  // how high the room at (u, v) rises: through every storey above whose space there is a void, to that storey's top; with
  // a far point (across a partition) it stops at a storey where the far side is open floor (a gallery's balustrade there)
  const riseAt=(u,v,fu,fv)=>{let top=S.y+S.h;for(const U of upper){const t=U.spaceAt(u,v);if(t&&t.void){if(fu!=null){const f=U.spaceAt(fu,fv);if(f&&f.open&&!f.void)break;}top=U.y+U.h;continue;}break;}return top;};
  // a rect's ceiling in pieces of one height each (the parts under a void above rise through it)
  const ceilPieces=q=>{let act=[q],top=S.y+S.h;const done=[];
   for(const U of upper){const vr=[];U.spaces.forEach(t=>{if(t.void&&t.rects)t.rects.forEach(r=>vr.push(r));});const nx=[];
    for(const p of act){let rest=[p];for(const r of vr){const nr=[];for(const x of rest){const I=inter(x,r);if(solid(I)){nx.push(I);nr.push(...minus(x,I));}else nr.push(x);}rest=nr;}rest.forEach(x=>done.push({q:x,top}));}
    act=nx;if(!act.length)break;top=U.y+U.h;}
   act.forEach(x=>done.push({q:x,top}));return done;};
  // a skin's height runs along a stretch (t0..t1 on a line, the space on side): split where the room rises through a void
  // (a skin's top stands 1 cm over its ceiling's top and 1 cm under the next floor's slab: no face shared with either)
  const hRuns=(s,dir,line,t0,t1,side,cap)=>{const out=[];let a=t0,cur=null;
   for(let t=t0;t<t1-1e-6;t+=CELLW){const tt=Math.min(t1,t+CELLW/2),p=dir==='u'?[line+side*.3,tt]:[tt,line+side*.3],f=dir==='u'?[line-side*.3,tt]:[tt,line-side*.3];
    let h=(s.stair?S.y+S.h:cap?riseAt(p[0],p[1]):riseAt(p[0],p[1],f[0],f[1]))-.33-S.y;if(cap)h=Math.min(h,cap);
    if(cur!=null&&Math.abs(h-cur)>.01){out.push([a,t,cur]);a=t;}cur=h;}
   if(cur!=null)out.push([a,t1,cur]);return out;};
  // floors (their tops at the storey's level: the furniture stands on it)
  sp.forEach(s=>{if(!s.floor||!s.rects)return;const st=sty(s);
   if(s.floor==='landing'){const land=landing(s.rect);s.rects.forEach(r=>{const q=inter(r,land);if(solid(q)){B(st.floor,(q.u0+q.u1)/2,(q.v0+q.v1)/2,S.y-.33,q.u1-q.u0,q.v1-q.v0,.33,st.fc);ST.floors++;}});return;}
   // (a precinct building's floor stops at its envelope: the cells past it lie under the outer wall)
   s.rects.forEach(q0=>{const q=Bd.rect?inter(q0,S.env[0]):q0;if(!solid(q))return;B(st.floor,(q.u0+q.u1)/2,(q.v0+q.v1)/2,S.y-.33,q.u1-q.u0,q.v1-q.v0,.33,st.fc);ST.floors++;});
   // a sun medallion in the great rooms and the grand spaces' floors
   if(!anc&&s.kind==='map_room'&&s.decor>=3){const q=s.rect,m=Math.min(q.u1-q.u0,q.v1-q.v0)*.78;s.floorMap={u:(q.u0+q.u1)/2,v:(q.v0+q.v1)/2,m};
    B('palMapB',s.floorMap.u,s.floorMap.v,S.y+.004,m,m,.012,null);ST.maps=(ST.maps||0)+1;}
   else if(!anc&&s.decor>=4&&s.area>=90&&!s.stair&&s.kind!=='corridor'&&s.kind!=='lift_hall'){const q=s.rect,m=Math.min(q.u1-q.u0,q.v1-q.v0)*.62;
    B(s.kind==='throne'||s.kind==='atrium'||s.kind==='vestibule'?'palMedalB':'palSunrayB',(q.u0+q.u1)/2,(q.v0+q.v1)/2,S.y+.004,m,m,.012,null);}});
  // ceilings: under the floor of the first storey above that is not a void over this space (so a room under a void rises
  // through it, piece by piece); the top storey's under the mass's roof
  sp.forEach(s=>{if(s.void||!s.rects||s.stair)return;const st=sty(s);s.ceil=[];
   s.rects.forEach(q0=>ceilPieces(q0).forEach(({q,top})=>{const cu=(q.u0+q.u1)/2,cv=(q.v0+q.v1)/2;
    const cy=top-.4;if(cy<=S.y+2)return;s.ceil.push({q,y:cy});
    if(anc&&s.kind==='lift_hall'){const h={u0:10.2,u1:19.8,v0:-5.8,v1:3.8};
     [[q.u0,h.u0,q.v0,q.v1],[h.u1,q.u1,q.v0,q.v1],[h.u0,h.u1,q.v0,h.v0],[h.u0,h.u1,h.v1,q.v1]].forEach(r=>{if(r[1]-r[0]>.05&&r[3]-r[2]>.05)B(st.ceil,(r[0]+r[1])/2,(r[2]+r[3])/2,cy,r[1]-r[0],r[3]-r[2],.06,st.cc);});
     s.ceilY=cy;return;}
    B(st.ceil,cu,cv,cy,q.u1-q.u0,q.v1-q.v0,.06,st.cc);ST.ceilings++;if(st.ceil==='palCofferB')ST.coffered=(ST.coffered||0)+1;
    if(st.coffer&&(q.u1-q.u0)>3&&(q.v1-q.v0)>3){const n1=Math.floor((q.u1-q.u0)/2.4),n2=Math.floor((q.v1-q.v0)/2.4);
     for(let i=1;i<=n1;i++)B('palGoldB',q.u0+(q.u1-q.u0)*i/(n1+1),cv,cy-.32,.22,q.v1-q.v0,.32,null);
     for(let j=1;j<=n2;j++)B('palGoldB',cu,q.v0+(q.v1-q.v0)*j/(n2+1),cy-.33,q.u1-q.u0,.22,.32,null);
     if(s.area>=60&&(q.u1-q.u0)*(q.v1-q.v0)>=40)B('palSunrayB',cu,cv,cy-.025,Math.min(q.u1-q.u0,q.v1-q.v0)*.42,Math.min(q.u1-q.u0,q.v1-q.v0)*.42,.01,null);}
    if(st.anc){const n=Math.floor((q.v1-q.v0)/4);for(let j=1;j<=n;j++)B('palLampB',cu,q.v0+(q.v1-q.v0)*j/(n+1),cy-.06,q.u1-q.u0-1,.35,.06,null);}
    s.ceilY=Math.max(s.ceilY||0,cy);}));
   // the ceiling's height at a point (the furnishing hangs its chandeliers from it)
   s.ceilAt=(u,v)=>{for(const c of s.ceil)if(u>=c.q.u0&&u<=c.q.u1&&v>=c.q.v0&&v<=c.q.v1)return c.y;return s.ceilY||S.y+S.h-.4;};});
  // the liners: each envelope's four sides, split by the space inside each stretch (at the cell lines, so a stretch ends
  // on its partition), cut by the portals and the entries
  S.env.forEach(e=>{if(e.open)return;ST.liners++;
   const sides=[['u',e.u0,-1,e.v0,e.v1],['u',e.u1,1,e.v0,e.v1],['v',e.v0,-1,e.u0,e.u1],['v',e.v1,1,e.u0,e.u1]];
   for(const[dir,line,out,t0,t1]of sides){
    // the portals through this side, and the entries on it
    const gaps=(S.portals||[]).filter(P=>{const ia=dir==='u'?0:1;return(P.a[ia]-line)*(P.b[ia]-line)<0;}).map(P=>{const ia=dir==='u'?0:1,ib=1-ia,t=(line-P.a[ia])/(P.b[ia]-P.a[ia]),c=P.a[ib]+(P.b[ib]-P.a[ib])*t;
     return{t0:c-P.w/2,t1:c+P.w/2,h:P.h,P};});
    const egaps=[];(S.outer||[]).forEach(w=>{if(w.dir!==dir||Math.abs(w.line-line)>.01)return;w.doors.forEach(d=>egaps.push({t0:d.t0,t1:d.t1,h:d.h}));});
    (S.wins||[]).forEach(w=>{if(w.blind||w.ax!==dir||Math.abs(w.line-line)>.01)return;egaps.push({t0:w.along-w.w/2,t1:w.along+w.w/2,h:w.y1-S.y,y0:w.y0-S.y});});
    // the stretches: cut at every grid line along the side, merged while the space inside is the same
    const g=S.grid,base=dir==='u'?g.V0:g.U0,ts=[t0];for(let k=Math.ceil((t0-base)/g.cell+1e-6);base+k*g.cell<t1-1e-6;k++)ts.push(base+k*g.cell);ts.push(t1);
    const stretch=[];ts.slice(0,-1).forEach((a,i)=>{const bb=ts[i+1],tt=(a+bb)/2,p=dir==='u'?[line-out*.3,tt]:[tt,line-out*.3],s=S.spaceAt(p[0],p[1]);
     const last=stretch[stretch.length-1];if(last&&last[2]===s)last[1]=bb;else stretch.push([a,bb,s]);});
    stretch.forEach(([s0,s1,s])=>{if(!s)return;let s2=s;
     // a void's side is the room's below that rises through it (its style), from this floor to its ceiling
     if(s.void){if(anc||!below)return;const c=dir==='u'?[line-out*.3,(s0+s1)/2]:[(s0+s1)/2,line-out*.3];s2=below.spaceAt(c[0],c[1]);if(!s2||s2.void)return;}
     const g2=gaps.concat(egaps).filter(g=>g.t1>s0&&g.t0<s1).map(g=>({t0:Math.max(s0,g.t0),t1:Math.min(s1,g.t1),h:g.h,y0:g.y0}));
     hRuns(s.void?{}:s,dir,line,s0,s1,-out,S.h+.4).forEach(([a,b2,h])=>skin(sty(s2),dir,line,a,b2,-out,S.y,h,g2.filter(g=>g.t1>a&&g.t0<b2).map(g=>({t0:Math.max(a,g.t0),t1:Math.min(b2,g.t1),h:g.h,y0:g.y0}))));});
    gaps.forEach(g=>{portalFrame(dir,line,g,S,sty(S.spaceAt(dir==='u'?line-out*.6:(g.t0+g.t1)/2,dir==='u'?(g.t0+g.t1)/2:line-out*.6)),out,e);});}});
  // partitions, balustrades, doors
  S.walls.forEach(w=>{const A=sp[w.a],Bs=sp[w.b];
   if(w.kind==='rail'){const s=A.void?Bs:A;const st=sty(s);W(anc?'palAncB':'palMarbleB',w.dir,w.line,w.t0,w.t1,0,.3,S.y,.95,anc?C.anc:C.white);
    W(anc?'palGlowB':'palGoldB',w.dir,w.line,w.t0-.05,w.t1+.05,0,anc?.1:.38,S.y+.95,.08,anc?C.cyan:null);ST.rails++;return;}
   const gaps=w.doors.map(d=>({t0:d.t0,t1:d.t1,h:d.h}));
   // a portal through this partition (the great door crosses the sliver between the hall and the Aula) opens it too
   (S.portals||[]).forEach(P=>{const ia=w.dir==='u'?0:1;if((P.a[ia]-w.line)*(P.b[ia]-w.line)>=0)return;const ib=1-ia,c=P.a[ib]+(P.b[ib]-P.a[ib])*(w.line-P.a[ia])/(P.b[ia]-P.a[ia]);
    if(c+P.w/2>w.t0&&c-P.w/2<w.t1)gaps.push({t0:Math.max(w.t0,c-P.w/2),t1:Math.min(w.t1,c+P.w/2),h:P.h});});
   // a = the side of smaller u (dir 'u') or v; its skin stands at -off
   for(const[X,side]of[[A,-1],[Bs,1]]){if(X.void)continue;
    hRuns(X,w.dir,w.line,w.t0,w.t1,side).forEach(([a,b2,h])=>skin(sty(X),w.dir,w.line,a,b2,side,S.y,h,gaps.filter(g=>g.t1>a&&g.t0<b2).map(g=>({t0:Math.max(a,g.t0),t1:Math.min(b2,g.t1),h:g.h}))));}
   w.doors.forEach(d=>{doorFrame(w.dir,w.line,d,S,sty(sp[d.from]),sty(d.to>=0?sp[d.to]:null),false,d.from===w.a?-1:1);});});
  // the outer doors of a precinct building (the gap in its liner is cut above)
  (S.outer||[]).forEach(w=>w.doors.forEach(d=>{const st=sty(sp[d.from]),e=S.env[0],into=w.dir==='u'?(w.line<=e.u0+.01?1:-1):(w.line<=e.v0+.01?1:-1);
   doorFrame(w.dir,w.line,d,S,st,st,true,into);}));
  // stairs
  S.stairs.forEach(f=>flights(f,anc,Bd));
 }
 // a stair's entry end: the strip at its low end along its long axis, where the flights arrive and leave
 function landing(q){const lu=q.u1-q.u0>=q.v1-q.v0,Ld=Math.min(1.8,(lu?q.u1-q.u0:q.v1-q.v0)*.2);
  return lu?{u0:q.u0,u1:q.u0+Ld,v0:q.v0,v1:q.v1}:{u0:q.u0,u1:q.u1,v0:q.v0,v1:q.v0+Ld};}
 /* ---------------------------------------------------------------- doors and portals */
 function doorFrame(dir,line,d,S,stA,stB,ext,into){ST.doors++;const t=(d.t0+d.t1)/2,w=d.t1-d.t0,h=d.h,y=S.y;
  for(const side of[-1,1]){const st=side<0?stA:stB||stA;
   // jambs and lintel, proud of the wall on each side; the jambs run 3 cm into the opening past the wall's end
   W(st.frame,dir,line,d.t0-.22,d.t0+.03,side*.2,.12,y,h+.2,st.frameC);W(st.frame,dir,line,d.t1-.03,d.t1+.22,side*.2,.12,y,h+.2,st.frameC);
   W(st.frame,dir,line,d.t0-.22,d.t1+.22,side*.2,.12,y+h,.24,st.frameC);
   // a stepped deco crest over the state doors
   if(st.d>=4){W('palGoldB',dir,line,t-w*.32,t+w*.32,side*.24,.1,y+h+.24,.22,null);W('palGoldB',dir,line,t-w*.16,t+w*.16,side*.26,.1,y+h+.46,.18,null);}}
  // the reveal through the wall (through the precinct's outer wall, PWALL deep, for an outer door), 4 cm into the opening
  const rd=ext?IZPAL.PWALL+.16:.32,ro=ext?-into*(IZPAL.PWALL-.16)/2:0;
  W(stA.frame,dir,line,d.t0-.02,d.t0+.04,ro,rd,y,h,stA.frameC);W(stA.frame,dir,line,d.t1-.04,d.t1+.02,ro,rd,y,h,stA.frameC);
  if(ext)W(stA.frame,dir,line,d.t0+.04,d.t1-.04,ro,rd,y+h-.04,.06,stA.frameC);
  // the leaves, open into the room: bronze in the state rooms, mahogany in the rich ones, none below
  const st=stB&&stB.d>stA.d?stB:stA,leaf=st.anc?'palAncB':st.d>=4?'palDoorB':'palMahogB',lc=st.anc?C.anc:st.d<3?C.oak:null,lw=w/2-.02;
  // an outer door stands closed (two leaves in the wall's thickness, a bronze rail across them); the covered ways' stay open
  if(ext&&!d.link){const n=-into*IZPAL.PWALL*.45;for(const sd of[-1,1]){const m=t+sd*(w/4);
    if(dir==='u'){B(leaf,line+n,m,y,.08,w/2-.03,h-.04,lc);B('palBronzeB',line+n-into*.06,m,y+h*.45,.04,w/2-.25,.08,null);}
    else{B(leaf,m,line+n,y,w/2-.03,.08,h-.04,lc);B('palBronzeB',m,line+n-into*.06,y+h*.45,w/2-.25,.04,.08,null);}}
   ST.leaves=(ST.leaves||0)+2;return;}
  for(const s of[-1,1]){const hinge=s<0?d.t0:d.t1,mid=hinge-s*.1;
   // a leaf standing open at right angles to the wall, against the jamb, on the room's side
   if(dir==='u')B(leaf,line+into*(lw/2+.2),mid,y,lw,.08,h-.05,lc);else B(leaf,mid,line+into*(lw/2+.2),y,.08,lw,h-.05,lc);
}}
 function portalFrame(dir,line,g,S,st,out,e){ST.portals++;const y=S.y,h=Math.min(g.h,S.h+14);
  // the reveal back to the mass's face (the batter makes it deeper at the floor) and a stepped surround on the inside
  const M=e&&e.mass,dep=yy=>{if(!M)return 1;const hn=(dir==='u'?M.du:M.dv)/2*(1-(1-M.t)*Math.max(0,Math.min(1,(yy-M.y0)/M.H))),c=dir==='u'?M.u:M.v;return Math.max(.2,hn-Math.abs(line-c)-.05);};
  const rv=st.frame==='palConcB'||st.anc?'palConcB':'palMarbleB',d0=dep(y),d1=dep(y+h*.6),d2=dep(y+h+.5),sh=M?0:.03;   // no mass: the Depot's gate, in the facade
  for(const[a,b]of[[g.t0-.25,g.t0+.04],[g.t1-.04,g.t1+.25]]){W(rv,dir,line,a,b,out*(d0/2+sh),d0,y,h*.6,C.white);W(rv,dir,line,a,b,out*(d1/2+sh),d1,y+h*.6,h*.4,C.white);}
  W(rv,dir,line,g.t0-.25,g.t1+.25,out*(d2/2+sh),d2,y+h-.04,.54,C.white);
  W(st.d>=3?'palGoldB':st.frame,dir,line,g.t0-.5,g.t0-.25,-out*.2,.16,y,h+.6,st.d>=3?null:st.frameC);
  W(st.d>=3?'palGoldB':st.frame,dir,line,g.t1+.25,g.t1+.5,-out*.2,.16,y,h+.6,st.d>=3?null:st.frameC);
  W(st.d>=3?'palGoldB':st.frame,dir,line,g.t0-.5,g.t1+.5,-out*.2,.16,y+h,.6,st.d>=3?null:st.frameC);
  // the leaves, open at right angles into the room (once a portal: it may cross two liners): the great door's cast bronze
  // (the delivered sheet), the others by their finish; none at the grand entrance (the builder's bronze leaves stand outside
  // it), a stair's landing or the Mech Gate (its blast doors are 78s's)
  const nm=g.P&&g.P.name||'';S.leafed=S.leafed||{};
  if(nm&&!/grand entrance|landing|Mech Gate/.test(nm)&&!S.leafed[nm]){S.leafed[nm]=1;const lw=(g.t1-g.t0)/2-.05,into=-out,big=/great door/.test(nm);
   const leaf=st.anc?'palAncB':big||st.d>=4?'palDoorB':'palMahogB',lc=st.anc?C.anc:st.d<3?C.oak:null,th=big?.12:.08;ST.leaves=(ST.leaves||0)+2;
   for(const[hinge,sd]of[[g.t0,1],[g.t1,-1]]){const m=hinge+sd*(th/2+.06);if(dir==='u')B(leaf,line+into*(lw/2+.3),m,y,lw,th,h-.05,lc);else B(leaf,m,line+into*(lw/2+.3),y,th,lw,h-.05,lc);}}}
 /* ---------------------------------------------------------------- stairs */
 // two flights side by side along the shaft's long axis with a half landing at the far end; a straight flight when the
 // shaft is too narrow for two. y0 -> y1; the flights leave and arrive at the entry end (landing())
 function flights(f,anc,Bd){const q=f.rect,lu=q.u1-q.u0>=q.v1-q.v0,L=lu?q.u1-q.u0:q.v1-q.v0,Wd=lu?q.v1-q.v0:q.u1-q.u0;
  const rise=f.y1-f.y0;if(rise<=.2)return;
  const mat=anc?'palConcB':'palMarbleB',mc=anc?C.conc:C.white,Ld=Math.min(1.8,L*.2),run=L-2*Ld;
  const at=(t,w,y,len,wid,hh,c,item)=>{const tt=(lu?q.u0:q.v0)+t,ww=(lu?q.v0:q.u0)+w;if(lu)B(item||mat,tt,ww,y,len,wid,hh,c||mc);else B(item||mat,ww,tt,y,wid,len,hh,c||mc);};
  const two=Wd>=2.4,fw=two?(Wd-.3)/2:Wd-.1;
  // repeated switchbacks when one storey's rise is more than one pair can climb in this run
  const perPair=Math.max(1,Math.ceil(rise/(run/.26*.18*(two?2:1)))),pr=rise/perPair;
  for(let k=0;k<perPair;k++){const yb=f.y0+k*pr;
   const n=Math.max(3,Math.round((two?pr/2:pr)/.18)),r=(two?pr/2:pr)/n,tr=run/n;
   // flight 1, entry end to far end, on the first half of the width
   for(let i=0;i<n;i++){at(Ld+i*tr+tr/2,two?fw/2+.05:Wd/2,yb+i*r-.12,tr+.02,fw,r+.12);ST.steps++;}
   if(two){// the half landing and flight 2 back, on the other half
    at(L-Ld/2,Wd/2,yb+pr/2-.3,Ld,Wd-.1,.3);
    for(let i=0;i<n;i++){at(L-Ld-i*tr-tr/2,Wd-fw/2-.05,yb+pr/2+i*r-.12,tr+.02,fw,r+.12);ST.steps++;}
    // the spine between the flights, and its gilt or cyan rail
    at(Ld+run/2,Wd/2,yb,run,.25,pr+.9,anc?C.anc:C.white,anc?'palAncB':'palStuccoB');
    at(Ld+run/2,Wd/2,yb+pr+.9,run+.1,.32,.08,anc?C.cyan:null,anc?'palGlowB':'palGoldB');}
   // an intermediate landing at the entry end between pairs
   if(k<perPair-1)at(Ld/2,Wd/2,yb+pr-.3,Ld,Wd-.1,.3);}}
 /* ---------------------------------------------------------------- the great rooms' architecture */
 function grandRooms(S,anc){if(anc)return;
  S.spaces.forEach(s=>{if(s.gone||s.void||!s.rect)return;const q=s.rect,du=q.u1-q.u0,dv=q.v1-q.v0,h=(s.ceilY||S.y+S.h)-S.y;
   const colonnade=(s.decor>=4&&s.area>=150&&['throne','atrium','vestibule','reception','ancestors_hall','feast_private','council','hall_hangar'].includes(s.kind)&&s.kind!=='hall_hangar');
   // the Aula: a basilica on the great door's axis (the processional line from the hall's medallion to the throne): a nave
   // from the wall to a colonnade 5.5 m past the axis, an aisle beyond with a second colonnade along the far wall
   const gd=s.kind==='throne'&&(S.portals||[]).find(P=>/great door/.test(P.name));if(gd)s.axisV=(gd.a[1]+gd.b[1])/2;
   if(colonnade&&s.axisV!=null){const rows=[s.axisV+5.5,q.v1-2.6],n=Math.max(2,Math.floor((du-6)/4.2)),rad=Math.min(.55,h*.045);
    for(const v of rows)for(let i=0;i<n;i++){const u=q.u0+2+(i+.5)/n*(du-8);
     BC('palColF',u,v,S.y,rad*2.9,.45,null);BC('palColM',u,v,S.y+.45,rad*2,h-1.5,C.white);BC('palColF',u,v,S.y+h-1.05,rad*3,.7,null,true);ST.columns++;}}
   else if(colonnade){const lu=du>=dv,L=lu?du:dv,Wd=lu?dv:du,inset=Math.min(2.6,Wd*.18),n=Math.max(2,Math.floor(L/4.2));
    for(let i=0;i<n;i++){const t=(i+.5)/n*L;for(const side of[-1,1]){const w=Wd/2+side*(Wd/2-inset);
     const u=lu?q.u0+t:q.u0+w,v=lu?q.v0+w:q.v0+t,rad=Math.min(.55,h*.045);
     BC('palColF',u,v,S.y,rad*2.9,.45,null);BC('palColM',u,v,S.y+.45,rad*2,h-1.5,C.white);
     BC('palColF',u,v,S.y+h-1.05,rad*3,.7,null,true);ST.columns++;}}}
   // the atrium's impluvium: a marble-rimmed pool under a lit opening (the slot through the roof garden)
   if(s.kind==='atrium'){const cu=(q.u0+q.u1)/2,cv=(q.v0+q.v1)/2,pu=du*.38,pv=dv*.3;
    B('palMarbleB',cu,cv,S.y,pu+.6,pv+.6,.35,C.white);B('palWaterB',cu,cv,S.y+.05,pu,pv,.28,null);
    B('palMosaicBB',cu,cv,S.y+.02,pu-.1,pv-.1,.05,null);B('palLampB',cu,cv,(s.ceilY||S.y+S.h)-.3,pu,pv,.05,null);}
   // the Hangar Hall (the old hangar, where the House entertains): tall banners down both flanks' faces on gilt rods, each
   // with a gilt sun; two great gilt sunbursts on the back wall either side of the great door
   if(s.kind==='hall_hangar'){const cols=[0xc9442a,0xe07a2a,0x2f8f8a];
    // (the middle pair would hang over the side doors: the Stair of the Hall's and the Consilium's, at u 15)
    for(const[v,sd]of[[q.v0-.15,1],[q.v1+.15,-1]])for(const k of[0,1,3,4]){const u=q.u0+1.3+k*(du-2.6)/4,c=vC(cols[(k+(sd>0?0:1))%3]);
     B('vClothB',u,v+sd*.05,S.y+2.6,1.6,.06,7.6,c);B('palGoldB',u,v+sd*.11,S.y+10.2,2,.1,.1,null);
     B('palGoldB',u,v+sd*.1,S.y+7.4,.7,.05,.7,null);B('palGoldB',u,v+sd*.1,S.y+2.45,1.6,.05,.18,null);}
    const gd=(S.portals||[]).find(P=>/great door/.test(P.name)),dv0=gd?(gd.a[1]+gd.b[1])/2:(q.v0+q.v1)/2;
    // the back wall is the rear mass's battered face: the sunbursts stand just off it at their lowest ray
    const M=IZPAL.MASS.rear,faceU=h=>M.u-M.du/2*(1-(1-M.t)*Math.max(0,h-M.y0)/M.H);
    for(const sd of[-1,1]){const v=dv0+sd*6.6,yc=S.y+5.6,uf=faceU(yc-3.7)-.06,p=FR.P(uf,v);
     for(let r=0;r<16;r++){const a=r/16*TAU,L2=r%2?1.7:2.6,cx=Math.cos(a)*(1+L2/2),cy=Math.sin(a)*(1+L2/2),pp=FR.P(uf,v+cx);
      kput('palGoldB',[pp[0],FR.Y(yc+cy),pp[1]],new THREE.Quaternion().multiplyQuaternions(Q,qEuler(0,0,a)),[L2,.2,.08],null);}
     kput('palMedalB',[p[0],FR.Y(yc),p[1]],new THREE.Quaternion().multiplyQuaternions(Q,qEuler(Math.PI/2,0,0)),[1.9,.06,1.9],null);ST.columns++;}}
   // the Aula: a stepped marble platform across the rear wall for the throne, three steps, a gilt edge
   if(s.kind==='throne'){const back=q.u1,cv=s.axisV!=null?s.axisV:(q.v0+q.v1)/2;for(let k=0;k<3;k++){const d=5.2-k*1.2,w=Math.min(2*Math.min(cv-q.v0,q.v1-cv)-1,14-k*2.4);
     B('palMarbleB',back-d/2-.2,cv,S.y+k*.3,d,w,.3,C.white);B('palGoldB',back-d-.2,cv,S.y+k*.3+.26,.08,w,.06,null);}
    s.dais={u:back-2.2,v:cv,y:S.y+.9};}});}
 /* ---------------------------------------------------------------- windows: openings through the shell and the liner */
 // For a palace window (78q palaceWindows): n is measured outward from the face at the opening's middle (the battered face
 // leans back above it, forward below); the opening runs from the room (just proud of the liner's skin) out through the
 // shell, lined with stone; the glass stands 0.55 m behind the face with bronze glazing bars, the surround (jambs, lintel and
 // drip, sill) is the builder's design redrawn to the opening. A blind window (no room behind) is curtained glass on the face.
 function palWindow(w){const WN=(item,t0,t1,n0,n1,y,h,c)=>{const n=(n0+n1)/2;if(w.ax==='u')B(item,w.face+w.sg*n,(t0+t1)/2,y,Math.abs(n1-n0),t1-t0,h,c);
   else B(item,(t0+t1)/2,w.face+w.sg*n,y,t1-t0,Math.abs(n1-n0),h,c);};
  const a=w.along,hw=w.w/2,h=w.y1-w.y0,sl=C.sandL,dr=tC(0xd4a05a,.9);
  if(!w.blind){const nIn=w.sg*(w.line-w.face)-.16;
   WN('palMarbleB',a-hw-.1,a-hw+.02,nIn,.45,w.y0,h,C.white);WN('palMarbleB',a+hw-.02,a+hw+.1,nIn,.45,w.y0,h,C.white);
   WN('palMarbleB',a-hw-.1,a+hw+.1,nIn,.45,w.y1-.02,.14,C.white);WN('palMarbleB',a-hw-.1,a+hw+.1,nIn,.45,w.y0-.12,.14,C.white);
   WN('palGlassB',a-hw,a+hw,-.565,-.535,w.y0+.01,h-.02,null);}
  else WN('palGlassDB',a-hw,a+hw,.4,.46,w.y0+.01,h-.02,null);
  // the glazing bars: two uprights on the wide windows (one on the narrow), two transoms
  const gn=w.blind?.43:-.55,ups=w.w>=2.6?[-w.w/6,w.w/6]:[0];
  ups.forEach(o=>WN('palBronzeB',a+o-.035,a+o+.035,gn-.06,gn+.06,w.y0,h,null));
  for(const f of[1/3,2/3])WN('palBronzeB',a-hw,a+hw,gn-.06,gn+.06,w.y0+h*f-.035,.07,null);
  WN('palBronzeB',a-hw,a+hw,gn-.07,gn+.07,w.y0,.05,null);WN('palBronzeB',a-hw,a+hw,gn-.07,gn+.07,w.y1-.05,.05,null);
  // the surround (78-transplant.js izOne's, fitted to the opening)
  WN('boxW',a-hw-.6,a-hw,0,.7,w.y0-.2,h+.4,sl);WN('boxW',a+hw,a+hw+.6,0,.7,w.y0-.2,h+.4,sl);
  WN('boxW',a-hw-.7,a+hw+.7,0,.8,w.y1,.7,sl);WN('boxW',a-hw-.3,a+hw+.3,.3,.8,w.y1+.725,.25,dr);WN('boxW',a-hw-.5,a+hw+.5,0,.9,w.y0-.5,.5,sl);
  ST.panes++;}
 // the openings through a storey's liner need a room behind them, the same room all across; else the window is blind
 function placeWindows(Bd){(Bd.storeys||[]).forEach(S=>{if(!S.wins)return;S.wins=S.wins.filter(w=>{
   const p=(t,n)=>w.ax==='u'?[w.line-w.sg*n,t]:[t,w.line-w.sg*n],A=S.spaceAt(...p(w.along-w.w/2+.1,.3)),Bs=S.spaceAt(...p(w.along+w.w/2-.1,.3));
   const crossed=(S.portals||[]).some(P=>{const c=[(P.a[0]+P.b[0])/2,(P.a[1]+P.b[1])/2];return Math.abs((w.ax==='u'?c[1]:c[0])-w.along)<w.w/2+P.w/2+.3&&Math.abs((w.ax==='u'?c[0]:c[1])-w.line)<4;});
   if(!A||A!==Bs||A.void||A.stair||crossed){w.blind=true;return false;}
   A.windows=(A.windows||[]).concat([{ax:w.ax,line:w.line,along:w.along,w:w.w,y:(w.y0+w.y1)/2,h:w.y1-w.y0,sg:w.sg}]);return true;});});}
 /* ---------------------------------------------------------------- the whole */
 function draw(L,frame,o){const t0=performance.now();FR=frame;Q=qEuler(0,FR.ry,0);o=o||{};
  // the storeys' cell lookups (spaceAt in the citadel's frame)
  L.buildings.forEach(Bd=>Bd.storeys.forEach(S=>{const g=S.grid,cell=new Int32Array(g.NU*g.NV).fill(-1);
   S.spaces.forEach((s,k)=>(s.rects||[]).forEach(q=>{const i0=Math.round((q.u0-g.U0)/g.cell),i1=Math.round((q.u1-g.U0)/g.cell),j0=Math.round((q.v0-g.V0)/g.cell),j1=Math.round((q.v1-g.V0)/g.cell);
    for(let i=Math.max(0,i0);i<Math.min(g.NU,i1);i++)for(let j=Math.max(0,j0);j<Math.min(g.NV,j1);j++)if(cell[i*g.NV+j]<0)cell[i*g.NV+j]=k;}));
   S.spaceAt=(u,v)=>{const i=Math.floor((u-g.U0)/g.cell),j=Math.floor((v-g.V0)/g.cell);if(i<0||j<0||i>=g.NU||j>=g.NV)return null;const k=cell[i*g.NV+j];return k>=0?S.spaces[k]:null;};}));
  if(o.mark)clear(o.mark,L);
  // the shells, with the portals' holes
  const pal=L.buildings.find(b=>b.id==='palace');L.buildings.forEach(placeWindows);
  for(const key of['t1','t2','rear','west','east','lintel','tower']){const M=IZPAL.MASS[key],holes=[];
   pal.storeys.forEach(S=>(S.portals||[]).forEach(P=>portalHoles(M,P,S.y).forEach(h=>holes.push(h))));
   (pal.wins||[]).forEach(w=>{if(!w.blind&&w.mass===key)holes.push({ax:w.ax,sgn:w.sg,s0:w.along-w.w/2,s1:w.along+w.w/2,y0:w.y0,y1:w.y1});});
   kdef('palShell_'+key,shellGeo(M,holes),MAT.white);kput('palShell_'+key,[0,0,0],null,[1,1,1],C.sand);ST.shells++;}
  // the Depot Stair arrives in the palace from the shaft below: its ground-storey floor is only the landing
  const g1=pal.storeys.find(S=>S.id==='G1'),dst=g1&&g1.spaces.find(s=>s.stair==='depot');if(dst)dst.floor='landing';
  L.buildings.forEach(Bd=>{const anc=!!Bd.ancient;
   Bd.storeys.forEach((S,i)=>{const upper=Bd.storeys.slice(i+1);storey(Bd,S,Bd.storeys[i+1],upper,anc,Bd.storeys[i-1]||null);grandRooms(S,anc);});});
  (pal.wins||[]).forEach(palWindow);
  shafts(L,dst);
  ST.ms=Math.round(performance.now()-t0);return ST;}
 // the two shafts through the rock between the Depot's ceiling and the palace's ground storey: the Well of the Machine (the
 // Ancient lift: a square of 9.6 m under the hall's medallion) and the Depot Stair (40 m of switchbacks)
 function shafts(L,dst){const mesa=L.buildings.find(b=>b.id==='mesa'),U1=mesa.storeys.find(S=>S.id==='U1'),y0=U1.y+U1.h-.4,y1=-.3;
  const box=(q,c,item)=>{for(const[dir,line,out,t0,t1]of[['u',q.u0,-1,q.v0,q.v1],['u',q.u1,1,q.v0,q.v1],['v',q.v0,-1,q.u0,q.u1],['v',q.v1,1,q.u0,q.u1]]){
    W(item,dir,line,t0-.3,t1+.3,out*.15,.3,y0,y1-y0,c);for(let y=y0+3;y<y1-1;y+=4)W('palGlowB',dir,line,t0+.4,t1-.4,-out*.03,.04,y,.1,C.cyan);}};
  box({u0:10.2,u1:19.8,v0:-5.8,v1:3.8},C.anc,'palAncB');
  if(dst){box(dst.rect,C.anc,'palAncB');flights({rect:dst.rect,y0:U1.y,y1:0},true);}
  // the lift's pit under the shaft: the Depot's ceiling is open over it (ceilings() leaves the square out)
 }
 return{draw,stats:ST,style,C};})();
