// ================================================================= HOST — the far country (KFAR) and the light modes
// The shared sky (89-host-sky.js) draws the sky, the sun and the giant and drives the light by the hour. What this page adds: THE RANGE
// AND WHAT IT DIVIDES as one coarse real mesh round the map (KFAR, core/terrain/44), out to 90 km with the planet's curvature, its
// heights the station's own ground carried on past the map (baseH: the map's relief, scale model 5.1, past 9.5 km): the Twins' cones
// (the NW Twin 24 km from station 1), the range's spine and its box vales, Xanadu's green basin falling away south-west and the Catch's
// pale floor north-east. Its colours by height and slope: the basalt's black on the faces, snow and ice high, scree between, the
// Catch's alkali tan and Xanadu's greens low (PLAN.md sections 1 and 3: the range divides the two). Started from the Godthrone's.
const FAR=(function(){
 /* the lattice is in the square's own frame (its centre at 0: KFAR's lines are symmetric), the mesh moved to the square's centre */
 const RIN=TERR.R,CELL=160,SINK=30,ROUT=90000,CX=TERR.cx,CZ=TERR.cz;
 const GL=KFAR.lines({cell:CELL,inner:9600,out:ROUT,grow:1.06});
 const FARK={curve:{from:RIN},crest:{k:.5,from:9000,to:30000}};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),hx=h=>L([(h>>16)&255,(h>>8)&255,h&255]);
 const C={rock:hx(0x252326),scree:hx(0x3d3834),snow:hx(0xdfe6ee),ice:hx(0xb9cbd8),catch:hx(0xc4b088),xanadu:hx(0x46623a),dry:hx(0x6e6450)};
 const mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const rr2=(ROUT-500)*(ROUT-500);
 const G=KFAR.grid(Object.assign({lines:GL,dense:true,
  h:(x,z)=>{const X=x+CX,Z=z+CZ;if(inMap(X,Z))return terrainH(X,Z)-(Math.abs(x)>=RIN||Math.abs(z)>=RIN?0:SINK);return baseH(X,Z);},
  skip:(x0,z0,x1,z1)=>(x0>=-RIN&&x1<=RIN&&z0>=-RIN&&z1<=RIN)||Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2,
  color:(x0,z0,y,q)=>{const x=x0+CX,z=z0+CZ,sl=q.slope||0,h=q.h;
   /* low country: the Catch's pale floor to the north-east, Xanadu's greens to the south-west (the range's two sides, by bearing) */
   const ne=smooth(-.3,.3,(x-z)/Math.max(1,Math.hypot(x,z))),low=smooth(3300,2500,h);
   let c=mixC(C.scree,mixC(mixC(C.dry,C.xanadu,smooth(2900,2200,h)),C.catch,ne),low);
   /* the faces: the basalt's black, its beds averaged (a coarse lattice cannot draw them) */
   const rk=smooth(.35,.85,sl),st=STRATA.colorAt(Math.floor(h/40)*40);c=mixC(c,mixC(C.rock,L(st.map(v=>v*255)),.3),rk);
   /* snow and ice: lying above ~4,700 m where the slope lets it, the Twins' summit ice above ~5,600 m (PLAN.md section 2) */
   c=mixC(c,C.snow,smooth(4600,5200,h)*smooth(.9,.4,sl)*.85);c=mixC(c,C.ice,smooth(5500,5900,h)*.6);
   return c;}},FARK));
 const mesh=KFAR.mesh(G,{name:'far:range',label:'The Twins\' range, the Catch and Xanadu (far country)'});
 mesh.position.set(CX,0,CZ);mesh.updateMatrixWorld(true);mesh.frustumCulled=false;mesh.userData.probeSkip=true;mesh.userData.farField=true;scene.add(mesh);
 REGISTER({name:'The Twins\' range round the station, the Catch and Xanadu (the far country)',x:CX,z:CZ,y:baseH(CX,CZ)-4000,r:ROUT,h:9000,far:true});
 /* at(x, z): the lattice's height at a point of the frame (KHORIZON's far grid reads it) */
 return{mesh,G,FARK,C,at:(x,z)=>G.at(x-CX,z-CZ),tris:G.count?G.count.tris:0};})();

// ---------------------------------------------------------------- light modes
// setLightMode('day'|'dawn'|'night') jumps the clock to that mode's hour (SKY.modes in 89-host-sky.js). LIGHT_MODE follows the sun and
// every LIGHT_HOOKS fn(mode) runs on each change (the torches, the Twin's glow)
var LIGHT_HOOKS=window.LIGHT_HOOKS||[];
var LIGHT_MODE='day';
function setLightMode(mode){if(typeof SKY!=='undefined')SKY.setMode(mode);}
LIGHT_HOOKS.push(m=>{const t=m==='night'?[.55,.58,.68]:m==='dawn'?[1,.9,.84]:[1,1,1];FAR.mesh.material.color.setRGB(t[0],t[1],t[2]);});
