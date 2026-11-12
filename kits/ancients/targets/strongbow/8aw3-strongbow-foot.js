// ================================================================= STRONGBOW — the foot: the lobby, the terminus hall, the wings, the plaza
// The owner (2026-11-11): "the bottom portion should be more elaborate and have an actual lobby". sbFoot(X) draws P.foot (8aw0) as
// the Ancients built it and, with X.RU, as it stands now: the terminus hall's west half crushed by the fallen lower hull, most of the
// lobby's glazing gone and its galleries broken in places, the east wing's upper floors burned, the plaza's pools dry. Hashed only
// (no rng()): listed in build.py's DETERMINISTIC. The lobby's glass is its own transparent material, so the galleries, the core and
// the great stair inside read through it.
MAT.sbLobbyGlass=new THREE.MeshStandardMaterial({color:0xbfe3ea,emissive:0x1d4a52,emissiveIntensity:.25,roughness:.06,metalness:.4,
 transparent:true,opacity:.42,depthWrite:false,side:DS});
MAT.sbLobbyGlassR=new THREE.MeshStandardMaterial({color:0x6f8a86,roughness:.4,metalness:.2,transparent:true,opacity:.6,depthWrite:false,side:DS});

function sbFoot(X){const P=X.P,F=X.F,FT=P.foot,L=FT.lobby,H=FT.hall,RU=X.RU,dd=X.dd,h=X.h,col=dd?'whiteW':'white',L2=X.L;
 const c=L.at,TAUf=Math.PI*2,wcol=new THREE.Color(dd?0x8e887a:0xeee8da);
 // a box of storeys: the long south face glazed (the dwelling map), the others white, the roof a deck with a white parapet
 const box=(b,front,burn)=>{const fy=burn?b.y1-burn*25.6/7:b.y1;
  L2.res.push(gridSurface((u,v)=>[lerp(b.x0,b.x1,u),lerp(b.y0,fy,v),b.z1],8,1,{uS:(b.x1-b.x0)/25.6,vS:(fy-b.y0)/25.6}));
  if(burn)L2.frab.push(gridSurface((u,v)=>[lerp(b.x0,b.x1,u),lerp(fy,b.y1,v),b.z1+.1],8,1,{uS:6,vS:2}));
  L2[col].push(gridSurface((u,v)=>[lerp(b.x0,b.x1,u),lerp(b.y0,b.y1,v),b.z0],8,1,{uS:(b.x1-b.x0)/20,vS:2}));
  for(const x of [b.x0,b.x1])L2[col].push(gridSurface((u,v)=>[x,lerp(b.y0,b.y1,v),lerp(b.z0,b.z1,u)],6,1,{uS:(b.z1-b.z0)/20,vS:2}));
  L2.deck.push(gridSurface((u,v)=>[lerp(b.x0,b.x1,u),b.y1,lerp(b.z0,b.z1,v)],8,6,{uS:(b.x1-b.x0)/14,vS:(b.z1-b.z0)/14}));
  L2[col].push(gridSurface((u,v)=>[lerp(b.x0,b.x1,u),b.y1+lerp(-1.6,1.6,v),b.z1+.25],8,1,{uS:10,vS:1}));};
 for(const w of FT.wings)box(w,'res',RU&&RU.foot.burned.id===w.id?RU.foot.burned.storeys:0);
 if(RU)for(let i=0;i<14;i++){const w=FT.wings.find(q=>q.id===RU.foot.burned.id),x=lerp(w.x0+6,w.x1-6,h(600,i));
  kput('stain',[x,w.y1-6,w.z1+.4],qFacing([0,0,1]),[5+6*h(601,i),12+10*h(602,i),1],null);}

 // ---- the lobby: a glazed rotunda round the Spine's foot ---------------------------------------------------------------
 {const n=L.ribs,r=L.r,lostG=(u,v)=>RU&&h(610,Math.floor(u*n),Math.floor(v*4))<RU.foot.glass;
  L2.lglass.push(gridSurface((u,v)=>[c[0]+r*Math.cos(u*TAUf),lerp(L.y0+1.5,L.y1,v),c[2]+r*Math.sin(u*TAUf)],n,4,{uS:n,vS:4,hole:lostG}));
  /* the mullions, the transoms at the galleries' levels, the plinth and the cornice */
  for(let i=0;i<n;i++){const a=i/n*TAUf;beam('acBox',[c[0]+r*Math.cos(a),L.y0,c[2]+r*Math.sin(a)],[c[0]+r*Math.cos(a),L.y1,c[2]+r*Math.sin(a)],1.2,1.6,wcol);}
  L2[col].push(SBG.cyl(c,r+1.2,L.y0,L.y0+1.5,64),SBG.cyl(c,r+1.6,L.y1-2.2,L.y1+1.4,64));
  for(const g of L.galleries)L2[col].push(SBG.cyl(c,r+.6,g.y-.4,g.y+.4,64));
  /* the roof: an annulus from the Spine's first drum out to the cornice, a parapet ring */
  L2.deck.push(SBG.disc(c,P.dim.SPINE.r+1.5,r+1.6,L.y1+1.4,64));
  L2.deck.push(SBG.disc(c,0,r+.5,L.y0+.25,64)); /* the floor */
  /* the galleries inside: three rings on the wall, broken in places in the ruin */
  for(const g of L.galleries){const lost=RU?RU.foot.galleries.find(q=>q.id===g.id).lost:0,m=48;
   L2.deck.push(gridSurface((u,v)=>{const a=u*TAUf,rr=lerp(g.r0,g.r1,v);return[c[0]+rr*Math.cos(a),g.y,c[2]+rr*Math.sin(a)];},m,1,{uS:m/2,vS:1,hole:(u,v)=>lost&&h(611,g.y|0,Math.floor(u*m))<lost}));
   L2[col].push(gridSurface((u,v)=>{const a=u*TAUf;return[c[0]+g.r0*Math.cos(a),g.y+lerp(-1.2,1.1,v),c[2]+g.r0*Math.sin(a)];},m,1,{uS:m/2,vS:1,hole:(u,v)=>lost&&h(611,g.y|0,Math.floor(u*m))<lost}));}
  /* the core: the Spine's lift shafts down to the floor, the lifts' light strips (dark in the ruin) */
  L2[col].push(SBG.cyl(c,L.core,L.y0,L.y1,32));
  if(!dd)for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;kput('strip',[c[0]+Math.cos(a)*(L.core+.3),(L.y0+L.y1)/2,c[2]+Math.sin(a)*(L.core+.3)],qEuler(0,-a,Math.PI/2),[L.y1-L.y0-4,1.4,1.4],CYAN);}
  /* the great stair: treads winding up round the core to the first gallery and on to the roof */
  const st=L.stair,NT=Math.round(st.turns*36);for(let i=0;i<NT;i++){const f=i/NT,a=f*st.turns*TAUf,y=lerp(L.y0,L.y1,f),rm=(st.r0+st.r1)/2;
   if(RU&&h(612,i)<.08)continue;
   kput('acBox',[c[0]+rm*Math.cos(a),y+.3,c[2]+rm*Math.sin(a)],qEuler(0,-a,0),[st.r1-st.r0,.6,4.6],new THREE.Color(dd?0x7e7868:0xd8d0be));}
  /* the bazaar's people as built (Ancient travellers); the ruin's floor is the town's (the settlement's build) */
  if(!dd)for(let i=0;i<40;i++){const a=h(613,i)*TAUf,rr=L.core+12+(r-L.core-16)*h(614,i),p=[c[0]+rr*Math.cos(a),L.y0,c[2]+rr*Math.sin(a)];
   kput('figB',p,qEuler(0,h(615,i)*6.28,0),1,new THREE.Color().setHSL(h(616,i)*.1,.3,.42));kput('figH',p,null,1,new THREE.Color(0xc9a17e));}}

 // ---- the terminus hall: a barrel vault where the line came in; in the ruin its west half crushed by the lower hull ----------
 {const zc=(H.z0+H.z1)/2,hw=(H.z1-H.z0)/2,xa=RU?RU.foot.hallCut:H.x0,vp=(x,a,o)=>[x,H.y0+(H.y1-H.y0+o)*Math.sin(a),zc+(hw+o)*Math.cos(a)];
  L2[col].push(gridSurface((u,v)=>vp(lerp(xa,H.x1,u),v*Math.PI,0),Math.max(4,Math.round((H.x1-xa)/12)),12,{uS:(H.x1-xa)/14,vS:8}));
  L2.shade.push(gridSurface((u,v)=>vp(lerp(xa,H.x1,u),v*Math.PI,-1.2),Math.max(4,Math.round((H.x1-xa)/12)),12,{uS:(H.x1-xa)/14,vS:8}));
  /* the ribs, standing proud, and the east end against the lobby */
  for(let x=H.x1-4;x>=xa;x-=H.ribs)L2[col].push(gridSurface((u,v)=>vp(x+lerp(-1.2,1.2,v),u*Math.PI,1.4),12,1,{uS:6,vS:1}));
  L2.shade.push(gridSurface((u,v)=>{const p=vp(H.x1,u*Math.PI,0);return[H.x1,lerp(H.y0,p[1],v),p[2]];},12,1,{uS:4,vS:2}));
  L2.deck.push(gridSurface((u,v)=>[lerp(xa,H.x1,u),H.y0+.25,lerp(H.z0,H.z1,v)],8,2,{uS:(H.x1-xa)/12,vS:6}));
  for(const pl of H.platforms){const x0=Math.max(pl.x0,xa);kput('acBox',[(x0+pl.x1)/2,H.y0+.6,pl.z],null,[pl.x1-x0,1.2,pl.w],new THREE.Color(dd?0x6a6355:0xcfc6b2));}
  /* the ruin: the crushed half, its vault in white shards on the rubble under the lower hull's pieces */
  if(RU)for(let i=0;i<46;i++){const x=lerp(H.x0,xa,h(620,i)),z=lerp(H.z0-6,H.z1+6,h(621,i)),s=4+10*h(622,i);
   if(i%3)kput('rubble',[x,H.y0+s*.25,z],qEuler(h(623,i)*3,h(624,i)*3,0),[s,s*.45,s*.8],new THREE.Color(0xb8b2a4));
   else kput('acBox',[x,H.y0+2+6*h(625,i),z],qEuler(h(626,i)*1.4,h(627,i)*3,h(628,i)*1.2),[s*1.4,1.2,s],new THREE.Color(0xd4cec0));}}

 // ---- the plaza: a raised forecourt before the lobby, steps down to the road, two pools ------------------------------------
 {const Z=FT.plaza,y0=F.FL;
  L2.pave.push(gridSurface((u,v)=>[lerp(Z.x0,Z.x1,u),Z.y,lerp(Z.z0,Z.z1,v)],10,4,{uS:(Z.x1-Z.x0)/8,vS:(Z.z1-Z.z0)/8}));
  for(const z of [Z.z1])L2[col].push(gridSurface((u,v)=>[lerp(Z.x0,Z.x1,u),lerp(y0,Z.y,v),z],8,1,{uS:10,vS:1}));
  for(const x of [Z.x0,Z.x1])L2[col].push(gridSurface((u,v)=>[x,lerp(y0,Z.y,v),lerp(Z.z0,Z.z1,u)],6,1,{uS:6,vS:1}));
  for(let k=0;k<3;k++)kput('acBox',[(Z.x0+Z.x1)/2,y0+Z.y*(k+.5)/3*.98,Z.z1+1.6*(3-k)-.8],null,[Z.x1-Z.x0-40,Z.y*(k+1)/3,1.6],new THREE.Color(dd?0x9a9282:0xe2dccc));
  for(const pool of Z.pools){L2[dd?'poolR':'pool'].push(SBG.disc(pool.at,0,pool.r,pool.at[1]+.2,40));
   L2[col].push(SBG.cyl(pool.at,pool.r,pool.at[1],pool.at[1]+1,40),SBG.disc(pool.at,pool.r,pool.r+1.6,pool.at[1]+1,40));
   if(!dd)kput('finial',[pool.at[0],pool.at[1]+3,pool.at[2]],null,[1.6,3,1.6],null);}}}
