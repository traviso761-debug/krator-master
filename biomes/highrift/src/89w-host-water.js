// ================================================================= HOST — the water (core/water; PLAN.md section 3)
// The large stills are WATER.open surfaces over the ground's bed with NO surf and NO breakers (the owner's rule for still water, 2026-11-02), the
// reflections switch (58) on the largest, off at load. Hot pools are WATER.spring (core/water/geyser 52, banded by their heat and mineral), the geysers
// WATER.geyser (drawn by 52b on the host clock). The cataract's treads and the outlet's rimstone pools are WATER.terraces (ext 53, drawn by 53b), the
// last tier into the Caldron a tall WATER.fall on its face (plungeR, footK). Brant-Fell Gill brings its glacial flour into the Caldron as a tint that moves
// (ext 61, tintFlow: ?plume=0 without it). The streams are WATER.flow. CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is the stage's.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x8a8478)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const WQ=new URLSearchParams(location.search);
const SWELL=[[.012,6,35,0,.02],[.008,3.5,-50,1.3,.02]];
function maskOf(box,cell,fn){const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(fn(box[0]+(i+.5)*cell,box[1]+(j+.5)*cell))d[j*nx+i]=255;return{x0:box[0],z0:box[1],cell,nx,nz,data:d};}
const SPRING_MATS=new Map(),GEYSER_MATS=new Map(),GEYSER_U={uScale:{value:900}};
TICKS.push(()=>{GEYSER_U.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
function spring(key,name,x,z,r,level,temp,mineral,o){const S=WATER.spring(Object.assign({key,name,x,z,r,level,temp,mineral,milky:.3,boil:temp>.9?1:0,steam:0},o||{}));
 const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:SPRING_MATS,renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=name;return S;}
function geyser(G,name){const y=terrainH(G.x,G.z);const S=WATER.geyser({key:SKEY+'-geyser',name,vents:[[G.x,G.z]],top:y+.6,H:G.H,style:G.style,period:G.period,pre:G.period*.15,dur:G.period*.18,steam:G.period*.2,pool:2.5,world:100+SITE.zone});
 const P=WATER.drawGeyser(S,{THREE,scene,uniforms:GEYSER_U,fog:scene.fog,wind:[.6,-.3],gravity:9.8,mats:GEYSER_MATS}).points;P.userData.inspectLabel=name;
 REGISTER({name,x:G.x,z:G.z,y:y-3,r:12,h:G.H+10,tags:{hazard:{kind:'heat',danger:.8,shape:{type:'cyl',r:10,h:G.H}}}});return S;}
// the line a stage's band follows: s along a segment frame, the band's centre at a = off(s)
function bandLine(F,off,s0,s1,step){const P=[];for(let s=s0;s<=s1+1e-6;s+=step){const a=off(s);P.push([F.A[0]+F.ux*s+F.uz*a,F.A[1]+F.uz*s-F.ux*a]);}return P;}
let BIGW=null,BIG_DRAW=null;const W_OUT={};
if(SKEY==='cataract'){const P=SITE.pool,C=L.C,T=SITE.cataract.tiers,fr=[[0,.28],[.30,.52],[.54,.74],[.76,.93]];
 // THE CALDRON: turquoise over the deep vent, milk-white over the shelves; the Gill's grey flour coming in from the south-east on a slow current
 const BOX=[P.x-P.r-30,P.z-P.r-30,P.x+P.r+30,P.z+P.r+30],MASK=maskOf(BOX,6,(x,z)=>Math.hypot(x-P.x,z-P.z)<P.r+4);
 const mouth=L.G.B,gu=[-L.G.ux,-L.G.uz];   /* the Gill's mouth and the way its water runs on into the pool */
 const PLUME=WQ.get('plume')!=='0'&&WATER.tintFlowAt;
 const TINT={box:BOX,cell:6,at:(x,z)=>{const dx=x-mouth[0],dz=z-mouth[1],al=-(dx*gu[0]+dz*gu[1]),ac=Math.abs(dx*gu[1]-dz*gu[0]);const a=.55*smooth(40+.6*Math.max(0,al),4,ac)*smooth(320,0,Math.max(0,al))*smooth(-30,10,al);
  return a<.004?null:{c:lin(0x9a9c94).getHex(),a};}};
 BIGW=WATER.open(Object.assign({name:'The Caldron Pool',level:P.level,swell:SWELL,field:0,bounds:BOX,bed:terrainH,bedCell:6,mask:MASK},PLUME?{tint:TINT,
  tintFlow:{v:(x,z)=>{const d=Math.hypot(x-mouth[0],z-mouth[1]);return d>360?null:[-gu[0]*.12*smooth(360,0,d),-gu[1]*.12*smooth(360,0,d)];},period:60,swirl:.08,scale:90}}:{}));
 BIG_DRAW=WATER.draw(BIGW,{surf:false,breakers:false,renderOrder:1,roughness:.12,metalness:.05,envMapIntensity:.6,shallow:lin(0x9ad8cc),deep:lin(0x1a6a86)});
 BIG_DRAW.mesh.userData.inspectLabel='The Caldron Pool (2,580 m)';
 // THE OPALINE CATARACT: four treads in the gorge, a fall down each riser (terraces), the last tier a tall fall into the pool
 const off=s=>-8*Math.sin(s*.01);
 const line=bandLine(C,off,0,C.L*.93,12);
 const TR=WATER.terraces({name:'The Opaline Cataract',line,treads:fr.map((f,i)=>({s0:f[0]*C.L,s1:Math.min(f[1]*C.L,C.L*.93-1),y:T[i],w:26})),speed:2.2,spread:4});
 const TR_DRAW=WATER.drawTerraces(TR,{pool:{color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.5,renderOrder:1,gradient:{centre:lin(0x6ab0b0).getHex(),rim:lin(0xd8e8e4).getHex(),power:1}},
  fall:{color:lin(0xe6eeec),opacity:.92,rowStep:2,cols:10,spray:'drop',plungeR:14,renderOrder:3}});
 const s1=C.L*.93,ly=T[3],lx=C.A[0]+C.ux*s1+C.uz*off(s1),lz=C.A[1]+C.uz*s1-C.ux*off(s1),fx=C.A[0]+C.ux*C.L*1.04,fz=C.A[1]+C.uz*C.L*1.04;
 const LAST=WATER.fall({name:'The Opaline Cataract (the last tier)',lip:[[lx+C.uz*13,lz-C.ux*13,ly+.2],[lx-C.uz*13,lz+C.ux*13,ly+.2]],dir:[C.ux,C.uz],drop:ly-P.level,foot:[fx,fz,P.level],fit:true,spread:6,face:terrainH,faceLift:.6,faceN:48});
 const LAST_DRAW=WATER.drawFall(LAST,{color:lin(0xe6eeec),opacity:.92,rowStep:3,cols:12,spray:'drop',plungeR:46,footK:.8,envMapIntensity:.25,renderOrder:3,pick:true});
 LAST_DRAW.mesh.userData.inspectLabel='The Opaline Cataract';
 // THE STAIRCASE: the outlet's rimstone pools stepping down the sinter ridge south-west
 const OT=WATER.terraces({name:'The Opaline Sinter Staircase',line:[L.O.A,L.O.B],levels:SITE.outlet.levels,riser:3,width:40,speed:1.2,spread:3});
 const OT_DRAW=WATER.drawTerraces(OT,{pool:{color:0xffffff,roughness:.06,metalness:.05,envMapIntensity:.55,renderOrder:1,gradient:{centre:lin(0x58b8c0).getHex(),rim:lin(0xe0ece6).getHex(),power:1.4}},
  fall:{color:lin(0xeaf2f0),opacity:.85,rowStep:1,cols:8,spray:false,plungeR:6,renderOrder:3}});
 // BRANT-FELL GILL: glacial water, milky grey-green, from the south-east into the pool
 const gp=[];for(let s=0;s<=L.G.L+.1;s+=20){const a=-14*Math.sin(s*.006),x=L.G.A[0]+L.G.ux*s+L.G.uz*a,z=L.G.A[1]+L.G.uz*s-L.G.ux*a;gp.push([x,z,L.gillBed(s)-1.0]);}
 const GILL=WATER.flow({name:'Brant-Fell Gill',pts:gp,width:13,speed:1.8,rapids:[.02,.08]});
 const GILL_DRAW=WATER.drawFlow(GILL,{shallow:lin(0x9aa8a0),deep:lin(0x4a6a6a),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:10,across:6,margin:1,depthBias:2,renderOrder:2,pick:true});
 GILL_DRAW.mesh.userData.inspectLabel='Brant-Fell Gill';
 // the small vents' hot pools and the geyser on the staircase
 SITE.vents.slice(2).forEach((v,i)=>spring('cpool'+i,'A hot spring by the Caldron',v.x,v.z,9,terrainH(v.x,v.z)+.1,.85,'sinter'));
 W_OUT.geyser=geyser(SITE.geyser,'A geyser on the staircase');
 Object.assign(W_OUT,{treads:TR.pools.length,tierFalls:TR.falls.length+1,terraces:OT.pools.length,cataractDrop:T[0]-P.level});}
if(SKEY==='mirror'){const K=SITE.lake,BOX=[-TERR.R*1.1,-200,TERR.R*1.1,TERR.R*1.1];
 // LAKE VERDIGRIS: turquoise-green acid water (copper sulfate), milky over the boiling patch
 BIGW=WATER.open({name:'Lake Verdigris',level:K.level,swell:SWELL,field:0,bounds:BOX,bed:terrainH,bedCell:8,mask:maskOf(BOX,8,(x,z)=>z>L.shoreZ(x)-6)});
 BIG_DRAW=WATER.draw(BIGW,{surf:false,breakers:false,renderOrder:1,roughness:.14,metalness:.05,envMapIntensity:.55,shallow:lin(0x8ad8b8),deep:lin(0x1e7a74)});
 BIG_DRAW.mesh.userData.inspectLabel='Lake Verdigris (2,880 m; acid)';
 spring('patch','Lake Verdigris\'s boiling patch (vent 89)',SITE.patch.x,SITE.patch.z,SITE.patch.r,K.level+.04,1,'copper',{milky:.7});
 SITE.springs.forEach((s,i)=>spring('acid'+i,'An acid spring (copper and sulfur)',s[0],s[1],s[2]*.95,K.level+.6,.75+.05*i,i%2?'sulfur':'copper'));
 W_OUT.geyser=geyser(SITE.geyser,'A geyser on the shore');
 REGISTER({name:'Lake Verdigris (acid: copper sulfate)',x:0,z:1500,y:K.level-K.depth,r:2600,h:K.depth+3,tags:{hazard:{kind:'acid',danger:.5}}});}
if(SKEY==='wedge'){const P=L.TN,poly=[],R=P.r*1.4;for(let k=0;k<40;k++){const a=k/40*TAU;poly.push([P.x+Math.cos(a)*R,P.z+Math.sin(a)*R]);}
 const TS=WATER.still({name:'The tarn on the crest',level:P.l,poly,gradient:{centre:lin(0x1e3038).getHex(),rim:lin(0x7a8e90).getHex(),power:1}});
 const D=WATER.drawPools([TS],{name:'The tarn',color:0xffffff,roughness:.03,metalness:.1,envMapIntensity:.6,renderOrder:1,pick:true});D.mesh.userData.inspectLabel='The tarn';W_OUT.tarnDraw=true;}
if(SKEY==='coulee'){const Gc=SITE.gill,pts=[];for(let x=TERR.R*1.05;x>=-TERR.R*1.05;x-=20){const z=L.gz(x)+14*Math.sin(x*.013);pts.push([x,z,L.bedY(x)-Gc.bed+.9]);}
 const GILL=WATER.flow({name:'Brant-Fell Gill',pts,width:Gc.flow,speed:1.6,rapids:[.01,.05]});
 const GD=WATER.drawFlow(GILL,{shallow:lin(0xa4b0aa),deep:lin(0x52706e),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:10,across:6,margin:1,depthBias:2,renderOrder:2,pick:true});
 GD.mesh.userData.inspectLabel='Brant-Fell Gill (between outbursts)';
 spring('vpool','A hot pool by the geyser',SITE.vents[1].x,SITE.vents[1].z,10,terrainH(SITE.vents[1].x,SITE.vents[1].z)+.1,.8,'iron');
 W_OUT.geyser=geyser(SITE.geyser,'A geyser where the Gill meets the warm ground (vent 90)');
 REGISTER({name:'Brant-Fell Gill\'s bed (the outburst floods)',x:0,z:L.gz(0),y:L.bedY(0)-Gc.bed-2,r:2600,h:16,tags:{hazard:{kind:'drown',danger:.7}}   /* the outburst flood: core/tags has no 'flood' kind */});}
if(SKEY==='gjar'){const M=SITE.master,BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 // the gja's floor water: gin-clear meltwater and warm seepage over the dropped blocks, where Verdigris Beck rises
 BIGW=WATER.open({name:'The gja\'s water (the source of Verdigris Beck)',level:M.pool,swell:SWELL,field:0,bounds:BOX,bed:terrainH,bedCell:6,mask:maskOf(BOX,6,(x,z)=>L.water(x,z)>-1e8)});
 BIG_DRAW=WATER.draw(BIGW,{surf:false,breakers:false,renderOrder:1,roughness:.05,metalness:.05,envMapIntensity:.6,shallow:lin(0xa8e4e4),deep:lin(0x0c4a6e)});
 BIG_DRAW.mesh.userData.inspectLabel='The gja\'s water (gin-clear)';
 spring('vpool','A sulfur spring by the vent',SITE.vents[1].x,SITE.vents[1].z,9,terrainH(SITE.vents[1].x,SITE.vents[1].z)+.1,.8,'sulfur');
 W_OUT.geyser=geyser(SITE.geyser,'A geyser at the swarm\'s end (vent 91)');}
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the streams' glint broken up */
window._water=Object.assign({station:SKEY,surfaces:WATER.surfaces.length},W_OUT,{geyser:!!W_OUT.geyser});
