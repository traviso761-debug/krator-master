// ================================================================= HOST — the air and the water: core/atmos bound, the perched water, the springs
// core/atmos on this page's ticks, ground and camera (no sky dome, no height fog: the page's two airs are the scene's fog, 49). Then:
//   THE PERCHED WATER   the lowest storey's table on the lake marl (CAVE.water: KKARST.water's flooded passages and pools near the scarp), one
//                       still surface (core/water's WATER.open) flooded from them over the storey's floor read off the cavern (49's bedH),
//                       clear and cold, standing only under the table's cover
//   THE SPRINGS         at each lowest-storey mouth whose sill is under the table (CAVE.water.springs): core/water's WATER.karstSpring at the
//                       face's foot, a pool and its run down the bench (KKARST.water's spring is the first of them)
ATMOS.bindHost({THREE,scene,camera,renderer,ticks:TICKS,ground:(x,z)=>terrainH(x,z),hour:()=>15.5,seed:7215,viewH:()=>innerHeight});
const WATERS=(function(){const out={table:null,springs:[]},lin=c=>new THREE.Color(c).convertSRGBToLinear(),Wt=CAVE.water;
 if(Wt.box&&WATER_BED){const b=Wt.box,seeds=Wt.sumps.map(s=>[(s.a[0]+s.b[0])/2,(s.a[2]+s.b[2])/2]).concat(Wt.pools.map(p=>p.c)).filter(p=>bedH(p[0],p[1])<WT);
  const S=WATER.open({name:'The perched water (the lowest storey, on the lake marl)',level:WT,field:.02,bounds:b,bed:bedH,bedBox:b,
   shore:{cell:1,band:8,seeds,land:(x,z)=>bedH(x,z)>WT+.15}});
  const D=WATER.draw(S,{renderOrder:1,roughness:.06,metalness:.05,envMapIntensity:0,surf:false,breakers:false,pick:true,shallow:lin(0x2e3a35),deep:lin(0x111816)});
  D.mesh.userData.inspectLabel=S.name;D.mesh.userData.probeSkip=true;out.table={S,D,seeds:seeds.length};}
 if(WATER.karstSpring&&Q.get('spring')!=='0')Wt.springs.forEach((sp,k)=>{const dir=sp.dir,x0=sp.at[0]-dir[0]*.4,z0=sp.at[1]-dir[1]*.4,g=sp.y;   /* the pool on the mouth's sill, its run out over the lip and down the bench */
  const line=[];let yp=g+.1;for(let i=0;i<=8;i++){const t=i/8,x=x0+dir[0]*(1.2+t*22),z=z0+dir[1]*(1.2+t*22);yp=Math.min(yp,CAVE.ground(x,z)+.12);line.push([x,z,yp]);}
  const K=WATER.karstSpring({name:'A spring at the scarp\'s foot (the maze\'s perched water coming out'+(k?')':': KKARST\'s resurgence)'),at:[x0,z0,g+.08],r:1.1,dir,line,width:1.2,speed:.4,run:22,seed:7220+k});
  const Gp=K.pool.gradient;if(Gp)K.pool.gradient=WATER.gradientOf(K.pool,{centre:lin(Gp.centre).getHex(),rim:lin(Gp.rim).getHex(),power:Gp.power});
  const a=WATER.drawStill(K.pool,WATER.lookDraw('spring','still',{color:lin(WATER.lookHex('spring',.3)),envMapIntensity:.3,renderOrder:1,pick:true}));
  const f=WATER.drawFlow(K.flow,WATER.lookDraw('clear','flow',{shallow:lin(WATER.lookHex('clear',.75)),deep:lin(WATER.lookHex('clear',.3)),color:0xffffff,step:2,across:3,margin:.4,envMapIntensity:.4,renderOrder:2,pick:true}));
  out.springs.push({id:sp.id,K,at:[x0,g,z0]});});
 return out;})();
window._air={table:!!WATERS.table,springs:WATERS.springs.length};
