// ================================================================= HOST — stage: STATION 7, TRICKSTER'S HOUSE (PLAN.md section 9)
// The cursed city (5.1 px 1512,660; legacy 1240,330): ARCOINDIAN II, RUINED, built into the west wall of the N main basin over a lake at
// 2,132 m (WH at the water, 22 °C (29 / 14), 612 mm; 1.22 atm at the quay). On 5.1 the lake lies at px 1506-1510 and the wall climbs west
// of it, ~2.4 km at the shore to 3.2 km 4 km out and 5 km 16 km out; the land east of the lake is BSk at 2.1-2.6 km.
// THE RUIN is kits/ancients' own (89c-arcoindian2.js, read in place: build.py's "ancients"), its builder run at decay 1 and turned so its
// mouth, which the kit draws facing south, faces the lake (east). It brings its own site: the 690 m rim plateau, the hollow bitten into
// the cliff, the gorge with its far wall and its water; this page's ground sinks under that site (its box) and meets it at the edges, and
// the lake is drawn round it (the kit's water is the lake inside the box: the far wall reads as a ridge across the lake's inlet).
// THE HOUSE COLONY (PLAN.md section 4, "The House colony"): the one aware colony, a COPPER colony that took the arcology's metal as its ore,
// seeded at the ruin (OUTL.SEEDS) and far older and larger than any in the gem hills (its reach to 1.4 km). Its forms are grown ON THE
// RUIN'S OWN SURFACES (STAGE.after: the baked meshes' up-facing faces, sampled by hash): lace crust tracing the decks (its miners: the metal
// is the ore here), turquoise shelves, green fans on the terraces, drums in the wet rooms low down; and, out of pattern, glow (the decay
// layer's glow tubes) in the dark of the hollow. On this page's own ground: the steppe colonies of the BSk east shore, the river colony's
// glow bells on the lake's edge below the quay. The KEEP-OUT RING of turned-away stones (proposed) round the ruin on the land; the LUCK
// hazard (C6: strength by time inside) and the TABOO area as core/tags records; the House colony's pranks as `prank` records.
const STAGE={key:'house',title:'Trickster\'s House',seed:5700,site:{px:1240,py:330}};
STAGE.hint='The Outlands, station 7: Trickster\'s House, the ruined Ancient arcology Arcoindian II in the west wall of the N main basin, over its lake at 2,132 m. The Coyote Men shun it: the god lives here, and misfortune grows the longer one stays inside the ring of turned-away stones. The ruin is held by the House colony, the one aware colony: an old copper colony grown into the arcology\'s metal, its lace crust tracing the decks, glow where no copper colony glows. Its pranks are its attempts to talk';
const SUN_POS2=[1100,1200,700];sun.position.set(...SUN_POS2);sun.intensity=1.35;HEMI.intensity=.86;
scene.fog.density=.0001;HAZE.set(0xc8cccc);scene.fog.color.copy(HAZE);
// ---------------------------------------------------------------- the land
const LAKE_L=2132;
// THE RUIN'S SITE: the kit's builder frame (x along the cliff, rock at -z, the gorge at +z, the water at y 6) turned a quarter so its +z is
// this page's +x: world x = GX + zl, world z = GZ - xl, world y = LAKE_L - 6 + yl. Its box: xl -1500..570, zl -1250..760
const GX=-520,GZ=-470,GY=LAKE_L-6;
const toW=(xl,zl)=>[GX+zl,GZ-xl],toL=(x,z)=>[GZ-z,x-GX];
const SITE={x0:GX-1250,x1:GX+760,z0:GZ-570,z1:GZ+1500};
// THE WHOLE ESCARPMENT. The kit ends its massif on a MASTER JOINT (its builder's x 150: here z = GZ - 150), a plane that lays the galleries,
// the passages and the lens open in section for the kit's own sheet. In the world the cliff goes on: this page's ground carries the
// escarpment past the joint (and past the kit's west taper) as one wall, its face on the kit's brow line, its top at the kit's rim plateau
// (690 m over the water), so the joint's cut face is inside the rock and no room shows on the side. Inside the site's box the kit's rock is
// the cliff; beyond the joint, west of the face, this page's is (inSite leaves that corner out)
const ZJ=GZ-150,PLAT=GY+690;
const xFace=z=>GX-110+22*Math.sin(z*.004+.7)+18*(fbm(5,z*.006,577,2)-.5);   /* the cliff's face: the kit's brow at mid-height */
function massifH(x,z){const xc=xFace(z);return LAKE_L+4+(PLAT-LAKE_L-4)*smooth(xc+55,xc-18,x)+8*(fbm(x*.012,z*.012,579,2)-.5)*smooth(xc+10,xc-60,x);}
const beyondJoint=(x,z)=>z<ZJ&&x<xFace(z)+70;
const inSite=(x,z,m)=>{m=m==null?0:m;return x>SITE.x0-m&&x<SITE.x1+m&&z>SITE.z0-m&&z<SITE.z1+m&&!beyondJoint(x,z);};
// the wall west of the lake (rising west), the east shore rising to the BSk tableland
function baseH(x,z){const w=-x-350+120*Math.sin(z*.0011+.5)+80*(fbm(x*.0012,z*.0012,571,2)-.5);   /* metres west of the shore line */
 const wall=w>0?690*smooth(0,1500,w)+.18*Math.max(0,w-1500)+60*smooth(200,1400,w)*(fbm(x*.003,z*.003,573,2)-.5):-18*smooth(0,300,-w);
 const east=x-1900+150*Math.sin(z*.0013+2.2),shore=east>0?240*smooth(0,1200,east)+60*(fbm(x*.002,z*.002,575,3)-.5):0;
 return LAKE_L+4+(w>0?wall:east>0?shore:-22*smooth(0,500,-w)*smooth(0,600,-east));}
// inside the ruin's box this page's ground sinks under the kit's own (its rock, its plateau, its gorge), meeting it at the box's edge
function rockH(x,z){return Math.max(baseH(x,z),massifH(x,z));}
function land0(x,z){const h=rockH(x,z),inB=x>SITE.x0-40&&x<SITE.x1+40&&z>SITE.z0-40&&z<SITE.z1+40;if(!inB)return h;
 /* the sink under the kit's site; none beyond the joint west of the face, and it starts at the joint itself (the kit's own rock from there) */
 let k=Math.min(smooth(-40,30,x-SITE.x0),smooth(-40,30,SITE.x1-x),smooth(-40,30,z-SITE.z0),smooth(-40,30,SITE.z1-z));
 k*=1-smooth(ZJ+6,ZJ-6,z)*smooth(xFace(z)+90,xFace(z)+60,x);
 return mix(h,Math.min(h,LAKE_L-30),k);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){return terrainH(x,z)<LAKE_L&&!inSite(x,z)?LAKE_L:inSite(x,z)?-1e9:-1e9;}
const POOLS=[];
// THE RING of turned-away stones: on the land round the ruin, 1.9 km out, a stone every ~55 m (the Coyote Men set them facing outward)
const RING_R=1900,RING_C=[GX+200,GZ+465];
const RING=(function(){const out=[];for(let k=0;k<220;k++){const a=k/220*TAU,x=RING_C[0]+Math.cos(a)*RING_R,z=RING_C[1]+Math.sin(a)*RING_R;
  if(Math.abs(x)>TERR.R-60||Math.abs(z)>TERR.R-60||inSite(x,z,60)||rockH(x,z)<LAKE_L+3)continue;out.push({x,z,a,k});}return out;})();
// ---------------------------------------------------------------- the fields
const SPINE=[[GX,GZ+465],[GX+500,GZ+465],[RING_C[0]+RING_R*.7,RING_C[1]],[2600,-1500],[2600,1500],[-2400,-2400],[-2400,2400]];for(let x=-2800;x<=2800;x+=1100)for(const z of[-2700,-900,900,2700])SPINE.push([x,z]);
const NEAR=STAGEKIT.nearField(SPINE,90,260);
function fieldsAt(x,z,h,slope){const lakeEdge=!inSite(x,z,30)?smooth(5,0,Math.abs(h-LAKE_L))*(h>LAKE_L-1?1:0):0,east=x>1200&&h>LAKE_L+2?1:0,wall=x<-300&&!inSite(x,z,0)?1:0,site=inSite(x,z,0)?1:0;
 return{near:NEAR(x,z),wet:clamp(.3+.5*lakeEdge,0,1),upland:.5,rock:clamp(smooth(.55,.85,slope),0,1),slope,dry:clamp(.6*east+.3*wall,0,1),shore:lakeEdge,site,
  ore:site,oreX:site,dark:0,z_copper:site,
  /* the steppe on the east shore and the wall's gentler ground, the river colony on the lake's margin: the two meet a few metres up the shore */
  z_steppe:clamp(Math.max(east*smooth(LAKE_L+4,LAKE_L+10,h),wall*.6*smooth(.6,.3,slope)),0,1)*(1-site),z_river:(h>LAKE_L-1.5?smooth(LAKE_L+14,LAKE_L+4,h):0)*(1-site)};}
const FNAMES=['near','wet','upland','rock','slope','dry','shore','site','ore','oreX','dark','z_copper','z_steppe','z_river'];
const {FC,FIELD}=STAGEKIT.fields(FNAMES,fieldsAt,terrainH);
/* the House colony's ground: the ruin's box, its core only at its seed (30 m: no other copper colony seeds in the box), the rest its reach */
const HSEED=[GX-200,GZ+465];
FIELD.oreX=(x,z)=>inSite(x,z,0)?1:0;FIELD.z_copper=(x,z)=>inSite(x,z,0)?(Math.hypot(x-HSEED[0],z-HSEED[1])<30?1:.3):0;
// ---------------------------------------------------------------- the host binding
function rootMask(x,z){if(inSite(x,z,20))return 0;const h=terrainH(x,z),d=h-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}
BIO.init({tags:'outlands',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:5700,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS2);
// ---------------------------------------------------------------- the ruin (kits/ancients, read in place) and the records before the kit
let RUIN=null;const HOUSE={samples:[],hollow:[],records:{}};
function houseBuild(){const out={};
 if(typeof buildArcoindian2!=='function'){reportErr('house: the Ancients kit is not on this page (buildArcoindian2)');return out;}
 const holder=new THREE.Group();KIT.order.forEach(n=>{KIT.items[n].length=0;});KOFF=[0,0,0];KXF=null;const r0=ANC_REG.length;
 try{buildArcoindian2(holder,0,0,1);}catch(e){reportErr('Arcoindian II: '+e.stack);}
 KOFF=[0,0,0];KXF=null;kbake(holder);KIT.order.forEach(n=>{KIT.items[n].length=0;});
 holder.position.set(GX,GY,GZ);holder.rotation.y=Math.PI/2;holder.name='ruin.arcoindian2';holder.userData.inspectLabel='Trickster\'s House (Arcoindian II, ruined)';
 holder.traverse(m=>{if(m.isMesh){m.userData.host=true;if(!m.userData.inspectLabel)m.userData.inspectLabel='Trickster\'s House (Arcoindian II, ruined)';}});
 scene.add(holder);holder.updateMatrixWorld(true);RUIN=holder;
 /* the kit's own volumes (ANC_REG, in its builder frame) become this page's records, turned with the ruin */
 /* each a record; a page volume (the inspector's names, the registry's occupancy) only where the ruin, at decay 1, still holds what the
    probe counts there (core/host's regOccupancy: an instance, or a mesh's box centre); the kit's own page checks them at decay 0 */
 const SP=[],MI=new THREE.Matrix4(),V3=new THREE.Vector3(),BX=new THREE.Box3();
 holder.traverse(m=>{if(m.isInstancedMesh){for(let i=0;i<m.count;i++){m.getMatrixAt(i,MI);V3.setFromMatrixPosition(MI).applyMatrix4(m.matrixWorld);SP.push([V3.x,V3.y,V3.z]);}}
  else if(m.isMesh&&m.geometry){BX.setFromObject(m);BX.getCenter(V3);SP.push([V3.x,V3.y,V3.z]);}});
 out.volumes=0;out.gone=0;const PP=[];
 ANC_REG.splice(r0).forEach(v=>{const w=toW(v.x==null?0:v.x,v.z==null?0:v.z),y0=GY+(v.y==null?0:v.y),r=v.r==null?5:v.r,h=v.h==null?10:v.h,rec={name:'Trickster\'s House: '+v.name,kind:'ruin',x:w[0],z:w[1],y:y0,r,h};
  const full=SP.some(p=>regHas(rec,p[0],p[1],p[2]));
  if(full){REGISTER(rec);out.volumes++;PP.push(w[0],y0+Math.min(h*.5,4),w[1]);}else{BIO.record(Object.assign({},rec,{name:rec.name+' (fallen: the ruin holds nothing there now)'}));out.gone++;}});
 /* the ruin's merged meshes carry one probe point at each volume they fill (as station 1's landforms do): a merged mesh is one box centre */
 {const o=new THREE.Object3D();o.name='ruin probe points';o.userData.probePoints=PP;scene.add(o);}
 let tris=0;holder.traverse(m=>{if(m.isMesh&&m.geometry){const g=m.geometry,n=g.index?g.index.count/3:g.attributes.position.count/3;tris+=n*(m.isInstancedMesh?m.count:1);}});out.tris=Math.round(tris);window._ruinTris=out.tris;
 // the ruin's up-facing faces, sampled by hash (a point a 6 m cell of the plan at most): where the House colony grows; the hollow's (under
 // the crown, behind the mouth, in the kit's frame) are its dark rooms
 const P=new THREE.Vector3(),A=new THREE.Vector3(),B=new THREE.Vector3(),C=new THREE.Vector3(),N=new THREE.Vector3(),seen=new Set(),M4=new THREE.Matrix4();
 holder.traverse(m=>{if(!m.isMesh||m.isInstancedMesh||!m.geometry||!m.geometry.attributes.position)return;const g=m.geometry,pos=g.attributes.position,ix=g.index,nt=ix?ix.count/3:pos.count/3;M4.copy(m.matrixWorld);
  for(let t=0;t<nt;t++){const a=ix?ix.getX(3*t):3*t,b=ix?ix.getX(3*t+1):3*t+1,c=ix?ix.getX(3*t+2):3*t+2;A.fromBufferAttribute(pos,a).applyMatrix4(M4);B.fromBufferAttribute(pos,b).applyMatrix4(M4);C.fromBufferAttribute(pos,c).applyMatrix4(M4);
   N.subVectors(B,A).cross(P.subVectors(C,A));const ar=N.length()/2;if(ar<4)continue;N.normalize();if(Math.abs(N.y)<.82)continue;
   const cx=(A.x+B.x+C.x)/3,cy=(A.y+B.y+C.y)/3,cz=(A.z+B.z+C.z)/3,key=Math.floor(cx/6)+','+Math.floor(cz/6)+','+Math.floor(cy/6);if(seen.has(key))continue;seen.add(key);
   const L=toL(cx,cz),yl=cy-GY;if(yl<7)continue;const dark=L[1]>-260&&L[1]<60&&yl>330&&yl<600&&L[0]>-560&&L[0]<150;
   (dark?HOUSE.hollow:HOUSE.samples).push({x:cx,y:cy,z:cz,up:N.y>0?1:-1,low:yl<60});}});
 /* the ruin's materials keep their own shading: no horizon hook on them (89zx) */
 STAGE.hzSkip=new Set();holder.traverse(m=>{if(m.isMesh)[].concat(m.material).forEach(x=>STAGE.hzSkip.add(x));});
 out.samples=HOUSE.samples.length;out.hollow=HOUSE.hollow.length;
 // the ring of turned-away stones (plain meshes), the luck hazard and the taboo, the pranks
 const g=new THREE.Group(),stone=new THREE.MeshLambertMaterial({color:0x8a8478});
 RING.forEach(R=>{const s=new THREE.Mesh(new THREE.BoxGeometry(.9,2.6,.5),stone),y=terrainH(R.x,R.z);s.position.set(R.x,y+1.1,R.z);s.rotation.y=-R.a+Math.PI/2;
  /* turned away: the carved face outward, the back to the ruin */ s.rotation.z=.04*(KRAND.unit(KRAND.hash(5711,R.k,1))-.5);g.add(s);});
 g.traverse(o=>{if(o.isMesh){o.userData.host=true;o.userData.inspectLabel='A turned-away stone (the keep-out ring: its carving faces out)';}});scene.add(g);
 REGISTER({name:'The keep-out ring of turned-away stones (the Coyote Men\'s)',kind:'structure',x:RING_C[0],z:RING_C[1],y:LAKE_L-10,r:RING_R+20,h:60});
 HOUSE.records.luck=BIO.record({kind:'hazard',key:'luck:house',name:'The trickster\'s misfortune (it grows the longer one stays inside the ring)',x:RING_C[0],y:LAKE_L-40,z:RING_C[1],r:RING_R,h:900,
  tags:{hazard:{kind:'luck',shape:{type:'cyl',r:RING_R,h:900}}}});
 HOUSE.records.taboo=BIO.record({kind:'area',key:'taboo:house',name:'The god\'s house (taboo: no faction draws inside the ring)',x:RING_C[0],y:LAKE_L-40,z:RING_C[1],r:RING_R,h:900,
  tags:{taboo:{why:'the god lives here (the trickster); the House colony is the god\'s too, to the Coyote Men',shape:{type:'cyl',r:RING_R,h:900}}}});
 const PR=[['writing','Lace crust grown overnight on a camp\'s stones, in shapes like the contour carvings of the milestones, garbled'],
  ['echoing','The glow in the dark shelf pulses back the rhythm of a howl'],['gifts','A drum swelled shut across a doorway; a cistern found full where none was'],
  ['following','A fairy ring round a sleeping place; a line of shelves tracing a visitor\'s path by morning']];
 HOUSE.records.pranks=PR.map((p,i)=>{const a=i*1.6+.5,x=RING_C[0]+Math.cos(a)*700,z=RING_C[1]+Math.sin(a)*700;return BIO.record({kind:'prank',key:'prank:'+p[0],name:'A prank of the House colony ('+p[0]+'): '+p[1],x,y:LAKE_L,z,r:30,h:10,tags:{colony:'house',prank:p[0]}});});
 return out;}
// THE HOUSE COLONY's forms on the ruin's surfaces (after the kit's own pass: its seams and territories are the colony map's)
/* run in the kit's own registry (its items: BIO.kitWrap), as the kit's exports run */
function houseAfter(){const prev=BIO.kit('outl');try{return houseAfter0();}finally{BIO.kit(prev);}}
function houseAfter0(){BIO.cur='outl/house';const M=OUTL.COLONY,A={},F=OUTL.byKey,PAL=OUTL.PAL,C=OUTL.C,lab=(S,c)=>S.name+' (the House colony, '+c.id+')',out={lacecrust:0,tqshelf:0,greenfan:0,drums:0,glowtubes:0};
 const house=M.colonies.find(c=>c.id==='shouse');if(!house)return out;
 const col=(set,u)=>{const c=C(set[Math.floor(u*set.length)%set.length]);return c;},note=(S,c,x,z,y,ex)=>{OUTL.PLACED[S.key]=(OUTL.PLACED[S.key]==null?0:OUTL.PLACED[S.key])+1;OUTL.INST.push(Object.assign({key:S.key,role:S.role,type:S.type,colony:c?c.id:null,x,z,y},ex||{}));out[S.key]++;};
 const Q=(ax,ay,az)=>new THREE.Quaternion().setFromEuler(new THREE.Euler(ax,ay,az));
 HOUSE.samples.forEach((p,i)=>{if(p.up<0)return;M.at(p.x,p.z,A);if(!A.c||A.c.type!=='copper'||A.seam)return;const u=k=>KRAND.unit(KRAND.hash(5721,i,k));if(u(0)>.55)return;
  const pick=u(1),ry=u(2)*TAU;
  if(p.low&&pick<.35){const S=F.drums;for(let k=0;k<4;k++){const a=u(10+k)*TAU,d=u(20+k)*1.2,s=.35+.4*u(30+k);BIO.put('drum',[p.x+Math.cos(a)*d,p.y-.08,p.z+Math.sin(a)*d],Q(0,u(40+k)*TAU,0),[s,s*1.2,s],col(PAL.drum,u(50+k)),{label:lab(S,A.c)});}note(S,A.c,p.x,p.z,p.y,{onRuin:true});}
  else if(pick<.62){const S=F.lacecrust,s=.8+1.6*u(3);BIO.put(OUTL.LIB.lace?'lace':'crust',[p.x,p.y+.06,p.z],Q(0,ry,0),[s,1,s*(.5+.5*u(4))],OUTL.LIB.lace?col([0xe4f0ec,0xd8eae4],u(5)):col(PAL.lace,u(5)),{label:lab(S,A.c)});note(S,A.c,p.x,p.z,p.y,{onRuin:true});}
  else if(pick<.82){const S=F.tqshelf;for(let k=0;k<3;k++){const a=u(10+k)*TAU,d=u(20+k)*.7,s=.25+.25*u(30+k);BIO.put('bracket',[p.x+Math.cos(a)*d,p.y+.02,p.z+Math.sin(a)*d],Q(-Math.PI/2+(u(40+k)-.5)*.6,u(50+k)*TAU,0),[s,s*.5,s],col(PAL.tq,u(60+k)),{label:lab(S,A.c)});}note(S,A.c,p.x,p.z,p.y,{onRuin:true});}
  else{const S=F.greenfan,s=.45+.45*u(6);BIO.put(OUTL.LIB.lace?'fan':'bracket',[p.x,p.y-.05,p.z],Q(-Math.PI/2+(u(7)-.5)*.4,ry,0),[s,s,s*.8],OUTL.LIB.lace?col([0xc8e4d0,0xd4ecd8],u(8)):col(PAL.green,u(8)),{label:lab(S,A.c)});note(S,A.c,p.x,p.z,p.y,{onRuin:true});}});
 // out of pattern: glow in the dark of the hollow (the decay layer's glow tubes, where no copper colony glows)
 HOUSE.hollow.forEach((p,i)=>{if(p.up<0||KRAND.unit(KRAND.hash(5723,i,0))>.5)return;const S=F.glowtubes,u=k=>KRAND.unit(KRAND.hash(5723,i,k)),H=.3+.6*u(1),w=.25+.25*u(2);
  BIO.put('tubeglow',[p.x,p.y-.04,p.z],Q(0,u(3)*TAU,0),[w,H,w],col(PAL.tubeg,u(4)),{label:S.name+' (out of pattern: the House colony\'s glow in the hollow)'});note(S,null,p.x,p.z,p.y,{H,hollow:true});});
 return out;}
// ---------------------------------------------------------------- the stage record
const t_=new THREE.Color();
const T_={sand1:new THREE.Color(0xb08e70),sand2:new THREE.Color(0x8a6c54),sand3:new THREE.Color(0x6a5040),varn:new THREE.Color(0x4e3a2e),
 rock:new THREE.Color(0x8a6a58),rock2:new THREE.Color(0x7a5e50),tan:new THREE.Color(0xa08a6a),tan2:new THREE.Color(0x8a7a5e),mud:new THREE.Color(0x5e5444),bed:new THREE.Color(0x4a4a40)};
Object.assign(STAGE,{
 types:['copper','steppe','river'],seeds:[{id:'house',x:HSEED[0],z:HSEED[1],type:'copper'}],reach:{copper:[900,1500]},share:{copper:.05},unlike:[['river','steppe']],
 tint:{copper:0x6e8a7a,steppe:0x8a6e52,river:0x5a6a4a},tintK:.12,
 paint(x,z,H,c,f){const p1=fbm(x*.012+5,z*.012-2,.7,2),p2=fbm(x*.03-3,z*.03+8,.9,2),rk=f('rock'),sh=f('shore'),west=x<-300?1:0;
  c.copy(T_.tan).lerp(T_.tan2,smooth(.4,.7,p1)*.5);c.lerp(T_.rock,west*.6);c.lerp(T_.rock2,west*smooth(.45,.7,p2)*.4);c.lerp(T_.mud,sh*.6);if(H<LAKE_L)c.lerp(T_.bed,.8);
  /* the escarpment's face, in the kit's bedded sandstone (its aiRockTx: tan beds, darker partings) so this page's cliff past the joint and the
     kit's own read as one wall: beds by height, warped a little along the wall; desert varnish streaking down from the rim */
  const fc=smooth(.25,.6,rk);if(fc>0){const u=H*.11+2.2*(fbm(x*.004,z*.004,581,2)-.5),b=u-Math.floor(u),bed=b<.18?T_.sand3:b<.55?T_.sand1:T_.sand2;
   t_.copy(bed).lerp(T_.sand2,smooth(.3,.7,fbm(x*.02,H*.02,583,2))*.35);t_.lerp(T_.varn,smooth(.55,.8,fbm(z*.03,H*.004,585,2))*.45);c.lerp(t_,fc*.92);}},
 layers:[{fam:'ground.gravel',name:'gravel',amt:.4,gain:1.2},{fam:'ground.steppe',name:'steppe',amt:.45,gain:1.2},{fam:'ground.mud',name:'the lake\'s mud',amt:.55,gain:1.15}],
 gl(x,z){const sh=smooth(.2,.7,FC.at(FC.a.shore,x,z)),st=smooth(.2,.6,FC.at(FC.a.z_steppe,x,z))*(1-sh);return[(1-sh)*(1-st),st,sh];},
 landmarks:[{name:'The lake under Trickster\'s House (2,132 m)',x:1200,z:0,y:LAKE_L-25,r:700,h:30}],probes:[[1200,-4,0]],
 far:{h:(x,z)=>rockH(x,z)+(x<-3400?.35*(-3400-x):0),col(x,z,y,q){const L=a=>a.map(v=>Math.pow(v/255,2.2)),R=L([140,108,90]),T=L([160,140,108]),HZ=L([200,204,206]),w=x<0?1:0;
   const c=[T[0]+(R[0]-T[0])*w,T[1]+(R[1]-T[1])*w,T[2]+(R[2]-T[2])*w],t=.55*smooth(3500,10000,q.r);return[c[0]+(HZ[0]-c[0])*t,c[1]+(HZ[1]-c[1])*t,c[2]+(HZ[2]-c[2])*t];}},
 sky:{"air":{"pressure":1.22,"humidity":0.4},"clouds":{"cover":0.3,"cumulus":0.6,"cirrus":0.45},"fogDensity":0.00013,
  "ridges":[{"base":3.4,"amp":1.2,"cycles":18,"octaves":2,"seed":63,"win":[270,100,2.2],"floor":-0.2,"dist":30000,"haze":0.05,"forestH":0,"rock":[0.58,0.48,0.42]},
   {"base":0.5,"amp":0.6,"cycles":30,"octaves":3,"peaks":12,"peakAmp":0.5,"seed":64,"win":[[90,120,2.5]],"floor":-0.3,"dist":30000,"haze":0.1,"forestH":0,"rock":[0.6,0.52,0.44]}],"landmarks":[]},
 atmos:{climate:{wet:false,cold:false,dry:true},fog:{falloff:1/900,sun:.3,sky:.3}},
 water:{lakes:[{name:'The lake under Trickster\'s House',label:'The lake under Trickster\'s House (2,132 m)',level:LAKE_L,box:[-1500,-3740,3740,3740],seed:[1600,0],cell:6,band:40,
   land:(x,z)=>inSite(x,z,-10),shallow:0x5a7a70,deep:0x1e4048}]},
 build:{quality:.7},decayForms:['glowtubes'],
 structures:houseBuild,after:houseAfter,
 views(){const K=STAGEKIT,P=(xl,yl,zl)=>{const w=toW(xl,zl);return[w[0],GY+yl,w[1]];},Gb=K.near('glowbell',1200,0),Em=K.near('ember',2400,0),
   L1=OUTL.INST.find(f=>f.key==='lacecrust'&&f.onRuin)||{x:GX,y:GY+500,z:GZ},G1=OUTL.INST.find(f=>f.key==='glowtubes'&&f.hollow)||{x:GX,y:GY+400,z:GZ},R0=RING[Math.floor(RING.length*.5)]||{x:1500,z:1500};
  const cam=(a,b)=>a.concat(b);
  return{
   'Trickster\'s House from the inlet':cam(P(420,140,560),P(-180,430,-80)),
   'The half-cave from across the inlet':cam(P(-100,330,640),P(-150,470,-120)),
   'The ruin\'s hollow':cam(P(-60,520,180),P(-250,450,-250)),
   'The House colony on the decks':[L1.x+14,L1.y+6,L1.z+10,L1.x,L1.y,L1.z],
   'Glow in the hollow':[G1.x+8,G1.y+3,G1.z+6,G1.x,G1.y+.3,G1.z],
   'The wall over the lake':K.look(1800,-2600,90,-1600,0,300),
   'The keep-out ring':[R0.x+Math.cos(R0.a)*40,K.gh(R0.x+Math.cos(R0.a)*40,R0.z+Math.sin(R0.a)*40,3),R0.z+Math.sin(R0.a)*40,R0.x,K.gh(R0.x,R0.z,1.2),R0.z],
   'Glow bells below the quay':K.at(Gb,6,2.4,1.5,.4),
   'Ember hedges on the east shore':K.at(Em,12,.6,2.2,.6),
  };},
 checks(add){add('the ruin read in place and the House colony on it',HSCHK.ruin(OUTL.INST));add('the luck hazard, the taboo and the pranks recorded',HSCHK.recs(HOUSE.records));
  add('glow in the hollow only',HSCHK.glow(OUTL.INST));},
 negatives(add){add('a House colony with no form on the ruin',HSCHK.ruin(OUTL.INST.filter(f=>!f.onRuin)));add('no luck hazard',HSCHK.recs({pranks:[]}));add('a glow tube on the plateau',HSCHK.glow([{key:'glowtubes',hollow:false}]));},
});
const HSCHK={
 ruin(I){const on=I.filter(f=>f.onRuin&&f.colony==='shouse');return{ok:!!RUIN&&on.length>50&&on.some(f=>f.key==='lacecrust'),detail:(RUIN?'Arcoindian II read in place ('+(window._ruinTris==null?0:window._ruinTris)+' triangles), ':'NO RUIN, ')+on.length+' House colony forms on its surfaces'};},
 recs(R){const p=(R.pranks||[]).filter(Boolean).length;return{ok:!!R.luck&&!!R.taboo&&p>=4,detail:(R.luck?'luck ':'no luck, ')+(R.taboo?'taboo ':'no taboo, ')+p+' pranks (core/tags records)'};},
 glow(I){const g=I.filter(f=>f.key==='glowtubes'),bad=g.filter(f=>!f.hollow);return{ok:g.length>0&&!bad.length,detail:bad.length?bad.length+' glow tubes outside the hollow':g.length+' glow tubes, every one in the hollow'};}};
