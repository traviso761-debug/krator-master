// ================================================================= THE SHEET'S TEST GROUND: a sample village, a sloped pad, a test wall with ropes
// After the rows are built (buildWorld, wrapped here after 91f-furnish.js), three test grounds are drawn the way a world draws
// the kit, through the host API (80-fg-host.js), so the sheet proves what a station will call:
//   THE SAMPLE VILLAGE (east)  KHAMLET.village on core/hamlet's fellgang row, focus `fowling` (core/hamlet/fellgang), its
//                              records registered in core/tags first (as a station does), then TG.fg.draw; its lanes; a stretch
//                              of the lantern road out of it with a Travellers' halt and wagon (TG.fg.pieces)
//   THE SLOPED PAD (west)      a block of ground rising 12 % east and 5 % north; five buildings drawn by TG.fg.draw on its
//                              ground (FG_PAD.ground): the floor at each footprint's highest corner, the plinth to its lowest,
//                              the longhouse's byre down-slope (verify.py asserts all three)
//   THE TEST WALL (north-west) a cliff with one ledge; six families' ropes up its fall line (TG.fg.ropes, from records shaped
//                              as the Fowlers' station makes them), wall stations, nest gear and a burial ledge on the ledge
// window._fgSheet holds what was drawn, for verify.py. Host-only: three.js.
const FG_PAD={x0:-190,x1:-130,z0:-82,z1:-38,ground(x,z){if(x<FG_PAD.x0||x>FG_PAD.x1||z<FG_PAD.z0||z>FG_PAD.z1)return 0;return .3+.12*(x-FG_PAD.x0)+.05*(z-FG_PAD.z0);}};
/* the wall: its foot along z = -300; up 1.6 m a metre to a ledge at 20 m (4 m deep), then up again to 64 m */
const FG_WALL={x0:-262,x1:-138,foot:-300,ground(x,z){if(x<FG_WALL.x0||x>FG_WALL.x1)return 0;const d=FG_WALL.foot-z;if(d<=0)return 0;
 const n=KRAND.vnoise(x*.15,0,z*.15,91)*1.2;if(d<12.5)return d*1.6+n*Math.min(1,d/3);if(d<16.5)return 20+n*.15;return Math.min(64,20+(d-16.5)*1.6)+n;}};
/* a block of ground (or rock) whose top follows f: the ground's library set (90-scene.js groundMat, in world metres) or the
   drystone's (rock: the wall), the colour converted to the linear working space as hc() does */
function fgSheetMesh(f,x0,x1,z0,z1,step,col,rock){const nx=Math.ceil((x1-x0)/step),nz=Math.ceil((z1-z0)/step),g=new THREE.BoxGeometry(x1-x0,1,z1-z0,nx,1,nz),a=g.attributes.position,uv=g.attributes.uv;
 const L=KMAT.mode==='lib'?KMAT.packed(KIT.pack,rock?'stone':'ground'):null,ts=rock?(L?L.scale[0]:2.4)*1.6:GROUND_SIZE;
 for(let i=0;i<a.count;i++){const x=a.getX(i)+(x0+x1)/2,z=a.getZ(i)+(z0+z1)/2,y=a.getY(i)>0?f(x,z):0;a.setXYZ(i,x,y,z);uv.setXY(i,rock?x/ts:x/ts+.5,rock?(y-z)/ts:.5-z/ts);}g.computeVertexNormals();
 const mt=new THREE.MeshStandardMaterial({color:hc(col),roughness:1});if(L){const T=rock?SV_LIBTEX.stone:{map:groundMat.map,normalMap:groundMat.normalMap,roughnessMap:groundMat.roughnessMap};if(T){mt.map=T.map;mt.normalMap=T.normalMap;mt.roughnessMap=T.roughnessMap;}}
 const m=new THREE.Mesh(g,mt);m.receiveShadow=true;m.castShadow=true;m.userData.isGround=true;m.userData.probeSkip=true;return m;}
/* the village's lanes as a worn ribbon a few cm over the ground (the stand-ins' FELLGANG.lanes, drawn the same way) */
function fgSheetLanes(V,W,G){const p=[],c=[],col=new THREE.Color(0x6a5a46);
 (V.lanes||[]).forEach(L=>{const a=L.pts[0],b=L.pts[1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(2,Math.ceil(len/4)),ux=(b[0]-a[0])/len,uz=(b[1]-a[1])/len,hw=L.w*.45;
  for(let k=0;k<n;k++){const t0=k/n*len,t1=(k+1)/n*len,q=(t,s)=>{const x=a[0]+ux*t-uz*hw*s,z=a[1]+uz*t+ux*hw*s;return [x,G(x,z)+.04,z];};
   const A=q(t0,-1),B=q(t0,1),C=q(t1,1),D=q(t1,-1);p.push(...A,...B,...C,...A,...C,...D);for(let j=0;j<6;j++)c.push(col.r,col.g,col.b);}});
 if(!p.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:hc(0x5e5040),roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}));m.userData.probeSkip=true;m.receiveShadow=true;W.add(m);}
/* register a record in core/tags before it is drawn (what a station does with REGISTER): its def's class and tags */
function fgSheetRegister(r,y,name){const D=DEFS[r.key];if(!D||!SVTAGS)return null;return SVTAGS.add({'class':D.cls,kind:r.key,key:r.key,name:name+': '+D.name,at:[r.x,y,r.z],ry:r.ry==null?0:r.ry,
 size:[D.w,D.d,D.h],tags:Object.assign({},D.tags),note:'drawn by TG.fg (the host API) on the sheet\'s test ground',frag:KIT.frag});}
function fgSheetExtras(W){const out={};
 /* THE SAMPLE VILLAGE */
 if(typeof KHAMLET!=='undefined'&&KHAMLET.CULTURES.fellgang){const V=KHAMLET.village({id:'sheet-fowlers',world:8310,culture:'fellgang',focus:'fowling',site:{x:250,z:-110},link:{x:420,z:-90},
   resource:{x:250,z:-260,workers:44},popMax:150,dims:TG.fg.dims});out.village=V;
  if(V.error)reportErr('the sample village: '+V.error);else{V.records.forEach(r=>fgSheetRegister(r,0,'The sample village'));fgSheetLanes(V,W,terrainH);
   out.villageDraw=TG.fg.draw(V,{scene:W,ground:terrainH,seed:8312,label:'The sample village (core/hamlet: the fellgang row, focus fowling)'});
   /* the lantern road out of it toward its link, a halt and a wagon by it */
   const L=[];for(let k=0;k<6;k++){const x=V.site.x+70+k*24,z=V.site.z+12+k*1.2;L.push({key:'fg-lantern-post',x,z:z+5,ry:0,id:'sheet:lamp:'+k});}
   L.push({key:'fg-halt',x:V.site.x+128,z:V.site.z+30,ry:0,id:'sheet:halt'},{key:'fg-wagon',x:V.site.x+120,z:V.site.z+36,ry:PI/2-.2,id:'sheet:wagon'});
   L.forEach(p=>fgSheetRegister(p,0,'The sample village\'s road'));out.road=TG.fg.pieces(L,{scene:W,ground:terrainH,seed:8313});}}
 /* THE SECOND VILLAGE: the Ice-cutters' kind (focus ice), its character low, sunk and barrow-like */
 if(typeof KHAMLET!=='undefined'&&KHAMLET.CULTURES.fellgang){const V=KHAMLET.village({id:'sheet-icecut',world:8410,culture:'fellgang',focus:'ice',site:{x:250,z:-360},link:{x:420,z:-350},
   resource:{x:250,z:-500,workers:40},popMax:120,dims:TG.fg.dims});out.village2=V;
  if(V.error)reportErr('the second village: '+V.error);else{V.records.forEach(r=>fgSheetRegister(r,0,'The ice village'));fgSheetLanes(V,W,terrainH);
   out.villageDraw2=TG.fg.draw(V,{scene:W,ground:terrainH,seed:8412,label:'The ice village (core/hamlet: the fellgang row, focus ice)'});}}
 /* THE SLOPED PAD */
 W.add(fgSheetMesh(FG_PAD.ground,FG_PAD.x0-.5,FG_PAD.x1+.5,FG_PAD.z0-.5,FG_PAD.z1+.5,2,0x6e7454));
 const PR=[{key:'fg-longhouse',x:-171,z:-68,ry:0},{key:'fg-house',x:-150,z:-69,ry:.3},{key:'fg-hut',x:-139,z:-50,ry:-.5},{key:'fg-cairnhall',x:-179,z:-50,ry:0},{key:'fg-icehouse',x:-157,z:-50,ry:0}]
  .map((r,i)=>Object.assign({id:'sheet:pad:'+i},r));
 PR.forEach(r=>fgSheetRegister(r,FG_PAD.ground(r.x,r.z),'The sloped pad'));
 out.pad=TG.fg.draw({id:'sheet-pad',focus:'ice',records:PR},{scene:W,ground:FG_PAD.ground,seed:8314,label:'The sloped test pad (the plinth to the lowest corner)'});
 /* THE TEST WALL AND ITS ROPES (as the Fowlers' station makes them: one per family, up the fall line from the foot) */
 W.add(fgSheetMesh(FG_WALL.ground,FG_WALL.x0,FG_WALL.x1,FG_WALL.foot-58,FG_WALL.foot+4,1.2,0x8a8476,true));
 const G=FG_WALL.ground,U=(i,s)=>KRAND.unit(KRAND.hash(8311,i,s)),ropes=[];
 for(let i=0;i<6;i++){const x=-246+i*19+(U(i,1)-.5)*4,z0=FG_WALL.foot+2,y0=G(x,z0),top=36+22*U(i,2),pts=[[x,y0+.3,z0]];let z=z0,px=x;
  for(let k=0;k<60;k++){z-=1.5;px+=(U(i,10+k)-.5)*.5;const y=G(px,z);pts.push([px,y+.35,z]);if(y-y0>top)break;}
  ropes.push({id:'sheet:rope:'+i,x,z:z0,y0,top:pts[pts.length-1][1],pts,family:i});}
 ropes.forEach(r=>{if(SVTAGS)SVTAGS.add({'class':'infrastructure',kind:'fg-fixed-line',key:'fg-fixed-line',name:'A family\'s rope (the test wall): its stretch of the face',at:[r.x,r.y0,r.z-20],ry:0,size:[2,40,r.top-r.y0],
  tags:{culture:'fellgang',style:'salvage',role:'rope',part:'fixed-line'},frag:KIT.frag});});
 out.ropes=ropes;out.ropeDraw=TG.fg.ropes(ropes,{scene:W,label:'The families\' ropes on the test wall'});
 const zl=FG_WALL.foot-14.5,WP=[{key:'fg-wall-station',x:ropes[1].pts[0][0]+2.2,z:zl,v:0},{key:'fg-nest-ledge',x:ropes[2].pts[0][0]+1.8,z:zl+.3,v:0},{key:'fg-wall-station',x:ropes[3].pts[0][0]+2.2,z:zl,v:1},
  {key:'fg-burial-ledge',x:ropes[4].pts[0][0]+2.4,z:zl+.5,family:4},{key:'fg-burial-ledge',x:ropes[4].pts[0][0]+5.6,z:zl+.5,family:2}].map((p,i)=>Object.assign({id:'sheet:wall:'+i,ry:0,y:20+(p.key==='fg-wall-station'?-.5:0)},p));
 WP.forEach(p=>fgSheetRegister(p,p.y,'The test wall'));out.wall=TG.fg.pieces(WP,{scene:W,ground:G,seed:8315});
 window._fgSheet=out;return out;}
const fgSheetBW=buildWorld;
buildWorld=function(){const W=fgSheetBW();try{fgSheetExtras(W);}catch(err){reportErr('the sheet\'s test ground: '+(err.stack||err));}
 if(typeof nightRebuild==='function')nightRebuild();if(window._build&&window._fgSheet)window._build.sheet={village:(window._fgSheet.village&&window._fgSheet.village.records||[]).length,pad:window._fgSheet.pad?window._fgSheet.pad.recs.length:0,ropes:(window._fgSheet.ropes||[]).length};return W;};
