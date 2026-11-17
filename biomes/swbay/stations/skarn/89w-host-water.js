// ================================================================= HOST - the far sea and the karst spring on core/water (station 3)
// THE SEA: since the re-siting (2026-11-17) the Ring Sea is ~13 km off to the north-east, in the far country only: one flat WATER.open
// past TERR (the bay page's outer surface, src/89w), masked off over the map. The raised platforms are dry.
// THE KARST SPRING'S OUTFALL (W.karstSpring, core/water ext/54; the plan's foreground): the pool on the shelf 15 m in from the old visor,
// the boil at its vent, its gin-clear run to the lip, a curtain (W.fall) spilling over the visor onto the raised platform, into a plunge
// pool (W.still) in the bowl the ground keeps for it (45's POOL), which drains on across the platform
{const WENV={environment:null};
 ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.45,.44,.36])).convertSRGBToLinear(),
  key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover!=null?SKY.look.cover.toFixed(2):''].join()});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SEA_BOX=[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1];   /* the map: no sea on it */
const OUTER_BOX=[-30000,-30000,30000,30000];   /* out to the far ring: the Ring Sea 13 km off */
const OUTER_SEA=WATER.open({name:'The Ring Sea (far)',level:-.15,swell:[],field:0,bounds:OUTER_BOX,
 mask:(function(){const c=100,nx=600,nz=600,d=new Uint8Array(nx*nz),m=60;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=OUTER_BOX[0]+(i+.5)*c,z=OUTER_BOX[1]+(j+.5)*c;
   const inside=x>SEA_BOX[0]+m+c&&x<SEA_BOX[2]-m-c&&z>SEA_BOX[1]+m+c&&z<SEA_BOX[3]-m-c;d[j*nx+i]=inside?0:255;}
  return{x0:OUTER_BOX[0],z0:OUTER_BOX[1],cell:c,nx,nz,data:d};})()});
const OUTER_DRAW=WATER.draw(OUTER_SEA,{renderOrder:0,roughness:.2,metalness:.05,envMapIntensity:.5,color:lin(0x0e4a5a)});
OUTER_DRAW.mesh.userData.inspectLabel='The Ring Sea (far)';
// the spring: its pool level 0.1 m under its bowl's rim; its run along the shelf to the lip (never climbing), the curtain off the lip
const SPRING_DRAW=(function(){if(!WATER.karstSpring)return null;const S=SPRING,lvl=localH(S.x,S.z)-.12,dx=S.lip[0]-S.x,dz=S.lip[1]-S.z,dl=Math.hypot(dx,dz),dir=[dx/dl,dz/dl];
 /* the run over the shelf to its edge (2 m in from the front), then on over the visor's lip (85) to its outer edge, 0.6 m out over the platform */
 const line=[];let yc=lvl;const r0=S.r*.8,r1=dl-2.8;   /* the run stays on the shelf's top (2.8 m in from its front: past it the notch) */for(let k=0;k<=10;k++){const t=r0+(r1-r0)*k/10,x=S.x+dir[0]*t,z=S.z+dir[1]*t;yc=Math.min(yc,groundH(x,z)+.22);line.push([x,z,yc]);}
 line.push([S.x+dir[0]*(dl+.8),S.z+dir[1]*(dl+.8),yc]);
 const K=WATER.karstSpring({name:'The karst spring',at:[S.x,S.z,lvl],r:S.r,dir,line,width:3.2,speed:.8,seed:KRAND.hash(WORLD,60)});
 const G=K.pool.gradient;if(G)K.pool.gradient=WATER.gradientOf(K.pool,{centre:lin(G.centre).getHex(),rim:lin(G.rim).getHex(),power:G.power});
 const P=WATER.drawStill(K.pool,WATER.lookDraw('spring','still',{color:lin(WATER.lookHex('spring',.3)),envMapIntensity:.3,renderOrder:1,pick:true,rain:true}));
 const F=WATER.drawFlow(K.flow,WATER.lookDraw('clear','flow',{shallow:lin(WATER.lookHex('clear',.75)),deep:lin(WATER.lookHex('clear',.3)),color:0xffffff,step:1.5,across:3,margin:.5,envMapIntensity:.4,renderOrder:2,pick:true,rain:true}));
 // the curtain: from the run's last point, out over the lip, down into the plunge pool on the platform
 const e=line[line.length-1],lipY=e[2],h=1.6,px=-dir[1],pz=dir[0],ox=e[0],oz=e[1],poolY=POOL.y0-.25;
 const FALL=WATER.fall({name:'The spring\'s outfall',lip:[[ox+px*h,oz+pz*h,lipY],[ox-px*h,oz-pz*h,lipY]],dir,speed:1.1,drop:lipY-poolY});
 const PP=WATER.still({name:'The plunge pool',level:poolY,poly:Array.from({length:16},(_,k)=>{const t=k/16*TAU,r=POOL.r*(1+.15*(KRAND.unit(KRAND.hash(WORLD,62,k))-.5));return[POOL.x+Math.cos(t)*r,POOL.z+Math.sin(t)*r];})});
 const PD=WATER.drawStill(PP,WATER.lookDraw('clear','still',{color:lin(WATER.lookHex('clear',.5)),envMapIntensity:.3,renderOrder:1,pick:true,rain:true}));
 const FD=WATER.drawFalls([FALL],{name:'The spring\'s outfall',color:lin(0xe2f2ee),opacity:.85,envMapIntensity:.3,renderOrder:3,margin:.5,spray:'drop'});
 FD.mesh.userData.inspectLabel='The spring\'s outfall over the visor';if(FD.plunge)FD.plunge.userData.inspectLabel='The spring\'s outfall';
 return{K,P,F,FALL,FD,PP,PD,level:lvl,lip:lipY,pool:poolY};})();
window._spring=SPRING_DRAW?{level:+SPRING_DRAW.level.toFixed(2),lip:+SPRING_DRAW.lip.toFixed(2),pool:+SPRING_DRAW.pool.toFixed(2),drop:+SPRING_DRAW.FALL.drop.toFixed(2)}:null;
