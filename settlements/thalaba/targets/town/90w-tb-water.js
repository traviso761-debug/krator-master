// ================================================================= THALABA — the water on core/water (and core/atmos)
// [draw] core/water/README.md is the contract: the page names its water and writes no water shader of its own.
//   the leat            a FLOW down its falling line (89zt: TB_LEAT, off the Solṭ Siṭrīm at the mouth, down the riser beside the
//                       expedition road, west along the Siṭēps' top), in its cut
//   the springs, the tank  STILL water: one record each (WATER.still), drawn together as one mesh on WATER.stillMaterial; the
//                       tank's stone steps and the springs' rims are the page's boxes
// core/atmos is bound for its clock and its wave chunk, which only the water takes; KratorSky stays the page's sky.
ATMOS.init({THREE,scene,camera,hour:()=>TB_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:TB.SEED+7,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const TBWATER=(function(){const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={flows:[],stills:[]};
 // ---- the leat
 {const S=WATER.flow({name:'The leat of the Siṭēps',pts:TB_LEAT.map(p=>[p[0],p[1],p[2]]),width:1.8,speed:.7});
  const D=WATER.drawFlow(S,{shallow:lin(0x6a7a6a),deep:lin(0x3a4a44),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.45,step:4,across:2,margin:.1});
  D.mesh.userData.inspectLabel=S.name;D.mesh.userData.probeSkip=true;scene.add(D.mesh);out.flows.push({S,D});}
 // ---- the still water: the springs' basins and the tank, one mesh
 const disc=(x,z,r,n)=>{const P=[];for(let k=0;k<n;k++){const a=k/n*Math.PI*2;P.push([x+Math.cos(a)*r,z+Math.sin(a)*r]);}return P;};
 for(const Sp of TB_SPRINGS)out.stills.push(WATER.still({name:'Siprīngz: '+Sp.id,level:Sp.y-.25,poly:disc(Sp.x,Sp.z,Sp.r+.4,28)}));
 {const K=TB_TANK,h=(K.half+1)*(1-4/8);out.stills.push(WATER.still({name:'The tank of the springs',level:K.water,poly:[[K.x-h,K.z-h],[K.x+h,K.z-h],[K.x+h,K.z+h],[K.x-h,K.z+h]]}));}
 const pos=[],nor=[],idx=[];
 out.stills.forEach(S=>{const o=pos.length/3,P=S.poly;let cx=0,cz=0;P.forEach(p=>{cx+=p[0];cz+=p[1];});cx/=P.length;cz/=P.length;
  pos.push(cx,S.level,cz);nor.push(0,1,0);P.forEach(p=>{pos.push(p[0],S.level,p[1]);nor.push(0,1,0);});
  for(let k=0;k<P.length;k++)idx.push(o,o+1+(k+1)%P.length,o+1+k);});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setIndex(idx);g.computeBoundingSphere();
 const mesh=new THREE.Mesh(g,WATER.stillMaterial({color:lin(0x2c4a46),roughness:.06,metalness:.12,envMapIntensity:.5}));
 mesh.name='water:still';mesh.userData.probeSkip=true;mesh.userData.inspectLabel='Still water (the springs\' basins, the tank)';mesh.renderOrder=1;scene.add(mesh);
 out.stillMesh=mesh;return out;})();
// the tank's stone steps (a stepped well: each ring a tread of fieldstone at its level, down to the floor under the water) and the
// springs' rims: the page's boxes, baked as one chunk
tbBakeChunk('water stone',[],()=>{const K=TB_TANK,d=K.depth/K.steps,H=K.half+1,col=xC(0x9a9384);TSTAT.cur='tb_tank/0';
 for(let k=1;k<=K.steps;k++){const y=K.rim-k*d,mo=H*(1-k/8),mi=k<K.steps?H*(1-(k+1)/8):0,t=mo-mi;
  if(mi<=0){vB('xRubB',K.x,y-d,K.z,2*mo,d,2*mo,0,col);continue;}
  vB('xRubB',K.x,y-d,K.z-(mi+t/2),2*mo,d,t,0,col);vB('xRubB',K.x,y-d,K.z+(mi+t/2),2*mo,d,t,0,col);
  vB('xRubB',K.x-(mi+t/2),y-d,K.z,t,d,2*mi,0,col);vB('xRubB',K.x+(mi+t/2),y-d,K.z,t,d,2*mi,0,col);}
 REG.push({name:'The tank of the springs (a stepped well)',key:'tb_tank',type:'tb_tank',cls:'building',x:K.x,y:K.rim,z:K.z,r:H,h:2});
 for(const Sp of TB_SPRINGS){for(let k=0;k<10;k++){const a=k/10*Math.PI*2,x=Sp.x+Math.cos(a)*(Sp.r+.9),z=Sp.z+Math.sin(a)*(Sp.r+.9);
   vB('xRubB',x,Sp.y-.6,z,2.2,1.0,.9,-a+Math.PI/2,col);}
  REG.push({name:'A spring of the spring line (Siprīngz)',key:'tb_spring',type:'tb_spring',cls:'feature',x:Sp.x,y:Sp.y,z:Sp.z,r:Sp.r+1.5,h:1});}});
window._tbWater={flows:TBWATER.flows.length,stills:TBWATER.stills.length,leat:TB_LEAT.length};
