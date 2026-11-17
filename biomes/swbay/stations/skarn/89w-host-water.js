// ================================================================= HOST - the sound, the outer sea and the karst spring on core/water (station 3)
// THE SOUND: one WATER.open over TERR (the CDLOD mesh, a calm swell in the harbour's shelter, a share of the wave field, the bed from
// terrainH, a shore grid flooded from out at sea: the water stops at the cliffs, the visor and the masonry); the far sea past TERR a flat
// second surface masked off over it (the bay page's two surfaces, src/89w). Calcium-saturated spring water clears it: the plan's turquoise
// over the pale marble sand.
// THE KARST SPRING'S OUTFALL (W.karstSpring, core/water ext/54; the plan's foreground): the pool on the shelf 15 m in from the visor, the
// boil at its vent, its gin-clear run to the lip, and a curtain (W.fall) spilling over the visor's lip into the sound
{const WENV={environment:null};
 ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.45,.44,.36])).convertSRGBToLinear(),
  key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover!=null?SKY.look.cover.toFixed(2):''].join()});}
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const SEA_BOX=[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1];
const SEA=WATER.open({name:'The harbour sound (the Ring Sea)',level:0,swell:[[.05,40,230,0,.03],[.03,16,210,1.2,.02]],field:.12,bounds:SEA_BOX,
 bed:terrainH,bedBox:SEA_BOX,bedCell:8,shore:{seeds:[xzOf(600,-900)]}});
const SEA_DRAW=WATER.draw(SEA,{rain:true,renderOrder:1,roughness:.12,metalness:.05,envMapIntensity:.3,shallow:lin(0x5ac4b4),deep:lin(0x0e4a5a)});
SEA_DRAW.mesh.userData.inspectLabel='The harbour sound (the Ring Sea)';
const OUTER_BOX=[-9000,-9000,9000,9000];
const OUTER_SEA=WATER.open({name:'The Ring Sea (far)',level:-.15,swell:[],field:0,bounds:OUTER_BOX,
 mask:(function(){const c=50,nx=360,nz=360,d=new Uint8Array(nx*nz),m=60;
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=OUTER_BOX[0]+(i+.5)*c,z=OUTER_BOX[1]+(j+.5)*c;
   const inside=x>SEA_BOX[0]+m+c&&x<SEA_BOX[2]-m-c&&z>SEA_BOX[1]+m+c&&z<SEA_BOX[3]-m-c;d[j*nx+i]=inside?0:255;}
  return{x0:OUTER_BOX[0],z0:OUTER_BOX[1],cell:c,nx,nz,data:d};})()});
const OUTER_DRAW=WATER.draw(OUTER_SEA,{renderOrder:0,roughness:.2,metalness:.05,envMapIntensity:.5,color:lin(0x0e4a5a)});
OUTER_DRAW.mesh.userData.inspectLabel='The Ring Sea (far)';
// the spring: its pool level 0.1 m under its bowl's rim; its run along the shelf to the lip (never climbing), the curtain off the lip
const SPRING_DRAW=(function(){if(!WATER.karstSpring)return null;const S=SPRING,lvl=localH(S.x,S.z)-.12,dx=S.lip[0]-S.x,dz=S.lip[1]-S.z,dl=Math.hypot(dx,dz),dir=[dx/dl,dz/dl];
 /* the run over the shelf to its edge (2 m in from the front), then on over the visor's lip (85) to its outer edge, 0.6 m out over the sea */
 const line=[];let yc=lvl;const r0=S.r*.8,r1=dl-1.8;for(let k=0;k<=10;k++){const t=r0+(r1-r0)*k/10,x=S.x+dir[0]*t,z=S.z+dir[1]*t;yc=Math.min(yc,groundH(x,z)+.22);line.push([x,z,yc]);}
 line.push([S.x+dir[0]*(dl+.8),S.z+dir[1]*(dl+.8),yc]);
 const K=WATER.karstSpring({name:'The karst spring',at:[S.x,S.z,lvl],r:S.r,dir,line,width:3.2,speed:.8,seed:KRAND.hash(WORLD,60)});
 const G=K.pool.gradient;if(G)K.pool.gradient=WATER.gradientOf(K.pool,{centre:lin(G.centre).getHex(),rim:lin(G.rim).getHex(),power:G.power});
 const P=WATER.drawStill(K.pool,WATER.lookDraw('spring','still',{color:lin(WATER.lookHex('spring',.3)),envMapIntensity:.3,renderOrder:1,pick:true,rain:true}));
 const F=WATER.drawFlow(K.flow,WATER.lookDraw('clear','flow',{shallow:lin(WATER.lookHex('clear',.75)),deep:lin(WATER.lookHex('clear',.3)),color:0xffffff,step:1.5,across:3,margin:.5,envMapIntensity:.4,renderOrder:2,pick:true,rain:true}));
 // the curtain: from the run's last point, 0.7 m out over the lip, down to the sea
 const e=line[line.length-1],lipY=e[2],h=1.6,px=-dir[1],pz=dir[0],ox=e[0],oz=e[1];
 const FALL=WATER.fall({name:'The spring\'s outfall',lip:[[ox+px*h,oz+pz*h,lipY],[ox-px*h,oz-pz*h,lipY]],dir,speed:1.1,drop:lipY+.05});
 const FD=WATER.drawFalls([FALL],{name:'The spring\'s outfall',color:lin(0xe2f2ee),opacity:.85,envMapIntensity:.3,renderOrder:3,margin:.5,spray:'drop'});
 FD.mesh.userData.inspectLabel='The spring\'s outfall over the visor';if(FD.plunge)FD.plunge.userData.inspectLabel='The spring\'s outfall';
 return{K,P,F,FALL,FD,level:lvl,lip:lipY};})();
window._spring=SPRING_DRAW?{level:+SPRING_DRAW.level.toFixed(2),lip:+SPRING_DRAW.lip.toFixed(2),drop:+SPRING_DRAW.FALL.drop.toFixed(2)}:null;
