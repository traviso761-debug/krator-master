// ================================================================= HOST — the water (core/water; PLAN.md sections 3 and 11)
// The springs and the alkaline pool are WATER.spring (core/water/geyser 52) on an alkaline ramp the kit gives (deep turquoise to milk-white: Oman's
// hyperalkaline pools), the terraces WATER.terraces (ext 53), the streams WATER.flow: the alkaline stream milky blue, the acid stream rust over grey-green,
// and the outflow as TWO ribbons side by side (the alkaline half and the acid half) for as long as the curtains stand between them (ARCH.meeting's end),
// then one ribbon of the mixed water (still acid: the acid wins, ARCH.mix). The mud pots are WATER.spring on the sulphur ramp, boiling.
// CPU twins: WATER.heightAt, WATER.flowAt; BIO.waterH is the stage's.
{const env=new THREE.Scene(),WENV={environment:null};
 env.add(new THREE.Mesh(sky.geometry,sky.material));{const g=giant.clone(),r=giantRing.clone();env.add(g);env.add(r);}
 ATMOS.skylight({renderer,sky:env,scene:WENV,ground:()=>new THREE.Color(0x7a5a44)});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SPRING_MATS=new Map();
const ALK_RAMP={deep:[.04,.42,.52],blue:[.22,.66,.72],green:[.62,.84,.86],yel:[.86,.93,.93],ora:[.92,.95,.94],rust:[.95,.96,.95]};   /* turquoise to milk-white */
function spring(key,name,x,z,r,level,temp,mineral,o){const S=WATER.spring(Object.assign({key,name,x,z,r,level,temp,mineral,milky:.55,boil:temp>.9?1:0,steam:0},o||{}));
 const d=WATER.drawSpring(S,{THREE,scene,fog:scene.fog,mats:SPRING_MATS,renderOrder:1});d.mesh.userData.probeSkip=true;d.mesh.userData.inspectLabel=name;return S;}
function ribbon(name,pts,width,speed,shallow,deep,rapids){const F=WATER.flow({name,pts,width,speed,rapids:rapids||[.01,.04]});
 const D=WATER.drawFlow(F,{shallow:lin(shallow),deep:lin(deep),color:0xffffff,roughness:.14,metalness:.05,envMapIntensity:.4,step:6,across:4,margin:.6,depthBias:1.5,renderOrder:2,pick:true});
 /* core/water's drawFlow bakes the colours into the shader text but not into the program's cache key (51-core-water-kinds.js), so three.js reused the
    first flow's program and every stream drew the alkaline blue (seen 2026-11-12). The colours join the key here; the core fix is parked in TODO.md */
 {const m=D.mesh.material,k0=m.customProgramCacheKey;m.customProgramCacheKey=()=>(k0?k0.call(m):'')+'|arch:'+shallow+','+deep;m.needsUpdate=true;}
 D.mesh.userData.inspectLabel=name;return F;}
let BIGW=null,BIG_DRAW=null;const W_OUT={};
if(SITE.springs){const S=SITE;
 // THE SPRINGS: hyperalkaline, warm, milky turquoise with a white rim
 S.springs.forEach((sp,i)=>spring('spring'+i,'Type II spring '+(i+1)+' (pH ~11.5, '+sp.flow+' L/s, hydrogen)',sp.x,sp.z,sp.r,L.prof(sp.x,sp.z)-.6,.45,ALK_RAMP,{milky:.7}));
 if(S.pool)spring('pool','The alkaline pool (pH ~11)',S.pool.x,S.pool.z,S.pool.r,L.POOL_LV,.3,ALK_RAMP,{milky:.8});
 // THE TERRACES: a white rimstone staircase from each spring to the pool
 W_OUT.terraces=L.TER.map((T,i)=>{const TR=WATER.terraces({name:'Travertine terraces from spring '+(i+1),line:[T.F.A,T.F.B],levels:T.levels,riser:3,width:28,speed:.9,spread:3});
  WATER.drawTerraces(TR,{pool:{color:0xffffff,roughness:.06,metalness:.05,envMapIntensity:.55,renderOrder:1,gradient:{centre:lin(0x5ab8c4).getHex(),rim:lin(0xe6eeec).getHex(),power:1.3}},
   fall:{color:lin(0xeef4f2),opacity:.85,rowStep:1,cols:8,spray:false,plungeR:5,renderOrder:3}});return TR.pools.length;});W_OUT.springs=S.springs.length;}
if(SKEY==='confluence'){const S=SITE,M=L.MEET;
 // THE ALKALINE STREAM: the pool's outflow to the meet
 const pAlk=[];for(let s=0;s<=L.ALK.L+.1;s+=8){const p=L.ALK.p(s,L.alkOff(s));pAlk.push([p[0],p[1],L.alkLv(s)]);}
 ribbon('The alkaline stream (pH ~11, milky blue)',pAlk,9,.25,0xb8e2e6,0x4aa8b8);
 // THE ACID STREAM: from the solfatara down the fault's line
 const pAc=[];for(let s=0;s<=L.ACID.L+.1;s+=10){const p=L.ACID.p(s,L.acidOff(s));pAc.push([p[0],p[1],L.acidLv(s)]);}
 ribbon('The acid stream (pH ~2.4, ferrous iron and sulphate)',pAc,8,.3,0xc0783a,0x6a5a3a);
 // THE OUTFLOW: two halves side by side while the curtains stand, one mixed water past them
 const hw=S.outflow.w/2,qa=hw/2,end=M.end,pa=[],pb=[],pm=[];
 for(let s=0;s<=end+.1;s+=8){const pA=L.OUT.p(s,-qa),pB=L.OUT.p(s,qa),y=L.outLv(s);pa.push([pA[0],pA[1],y]);pb.push([pB[0],pB[1],y]);}
 for(let s=Math.max(0,end-10);s<=L.OUT.L+.1;s+=8){const p=L.OUT.p(s,0);pm.push([p[0],p[1],L.outLv(s)]);}
 ribbon('The outflow\'s alkaline half (left of the curtains)',pa,hw-.5,.12,0xbfe4e6,0x58aebc);
 ribbon('The outflow\'s acid half (right of the curtains)',pb,hw-.5,.12,0xc4823e,0x7a5a36);
 ribbon('The mixed water (pH ~'+M.mixed.pH.toFixed(1)+': the acid wins)',pm,hw*1.6,.5,0xc8b07a,0x7a7050,[.04,.12]);
 // THE MUD POTS: boiling acid mud on the sulphur ramp
 S.solfatara.pots.forEach((p,i)=>spring('pot'+i,'A mud pot (boiling acid mud)',p[0],p[1],p[2],L.prof(p[0],p[1])-4.2,.97,'sulfur',{milky:.9}));
 Object.assign(W_OUT,{curtainEnd:end,mixedPH:M.mixed.pH,halves:2});}
if(SKEY==='coast'){const S=SITE;
 const maskOf=(box,cell,fn)=>{const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(fn(box[0]+(i+.5)*cell,box[1]+(j+.5)*cell))d[j*nx+i]=255;return{x0:box[0],z0:box[1],cell,nx,nz,data:d};};
 const BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
 // THE STEAMING SEA: the open sea's swell, surf on the black sand and the pillow platform
 BIGW=WATER.open({name:'The Steaming Sea',level:0,swell:[[.02,14,60,0,.03],[.012,7,-40,1.3,.03]],field:0,bounds:BOX,bed:terrainH,bedCell:8,mask:maskOf(BOX,8,(x,z)=>L.WW(x,z)>-120&&L.land(x,z)<0)});
 BIG_DRAW=WATER.draw(BIGW,{surf:true,breakers:true,renderOrder:1,roughness:.12,metalness:.05,envMapIntensity:.6,shallow:lin(0x5ab0a8),deep:lin(0x0e4a64)});
 BIG_DRAW.mesh.userData.inspectLabel='The Steaming Sea';
 W_OUT.sea=true;}
if(SKEY==='sound'){const S=SITE,lin2=lin;
 const maskOf=(box,cell,fn)=>{const nx=Math.round((box[2]-box[0])/cell),nz=Math.round((box[3]-box[1])/cell),d=new Uint8Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)if(fn(box[0]+(i+.5)*cell,box[1]+(j+.5)*cell))d[j*nx+i]=255;return{x0:box[0],z0:box[1],cell,nx,nz,data:d};};
 const BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],SWELL=[[.01,8,40,0,.02],[.006,4,-30,1.1,.02]];
 // THE SOUND: warm, shallow, sheltered by a horst on each side: turquoise over the white of the stacks' debris, green over the mud
 BIGW=WATER.open({name:'The sound (the drowned axial graben, 5-8 m deep)',level:0,swell:SWELL,field:0,bounds:BOX,bed:terrainH,bedCell:8,mask:maskOf(BOX,8,(x,z)=>L.WW(x,z)>S.shoreW-300&&L.land(x,z)<0)});
 BIG_DRAW=WATER.draw(BIGW,{surf:false,breakers:false,renderOrder:1,roughness:.1,metalness:.05,envMapIntensity:.6,shallow:lin2(0x7ac8b8),deep:lin2(0x1a6a7a)});
 BIG_DRAW.mesh.userData.inspectLabel='The sound (5-8 m deep, warm, sheltered)';
 // THE GJAR: clear water at the water table, filtered through the rock (Silfra's, warm)
 const G=WATER.open({name:'The gjar\'s water (clear, alkaline from the serpentinite)',level:.5,swell:[[.002,2,10,0,.01]],field:0,bounds:BOX,bed:terrainH,bedCell:3,mask:maskOf(BOX,3,(x,z)=>{for(const g of L.GJ){const q=g.F.at(x,z);if(q.s>0&&q.s<g.F.L&&Math.abs(q.a)<g.wd/2+1)return true;}return false;})});
 const GD=WATER.draw(G,{surf:false,breakers:false,renderOrder:1,roughness:.04,metalness:.05,envMapIntensity:.6,shallow:lin2(0xa8e8f0),deep:lin2(0x0a3a7a)});GD.mesh.userData.inspectLabel='A gja\'s water (gin-clear, 12 m deep)';
 // THE WHITE STACKS: knobbly lathe chimneys, white brucite and carbonate, a green film near the water
 const SM=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85,metalness:0,vertexColors:true});
 L.STACKS.forEach((k,i)=>{const pts=[],n=14;for(let j=0;j<=n;j++){const t=j/n,r=k.r*(1-.55*t)*(1+.18*Math.sin(t*19+i)+.08*Math.sin(t*41+i*2));pts.push(new THREE.Vector2(Math.max(.2,r),t*(k.h-terrainH(k.x,k.z))));}
  pts.push(new THREE.Vector2(.01,k.h-terrainH(k.x,k.z)));const g=new THREE.LatheGeometry(pts,12),c=[],P=g.attributes.position;
  for(let j=0;j<P.count;j++){const y=P.getY(j)+terrainH(k.x,k.z),wet=smooth(1.2,-.4,y);c.push(.92-.35*wet,.93-.2*wet,.9-.38*wet);}g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));
  const m=new THREE.Mesh(g,SM);m.position.set(k.x,terrainH(k.x,k.z),k.z);m.userData.host=true;m.userData.inspectLabel='One of the White Stacks';scene.add(m);});
 Object.assign(W_OUT,{sound:true,gjar:L.GJ.length,stacks:L.STACKS.length});}
if(WATER.breakupFlows)WATER.breakupFlows();   /* core/water ext/56: the streams' glint broken up */
window._water=Object.assign({station:SKEY,surfaces:WATER.surfaces.length},W_OUT);
