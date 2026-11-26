// ================================================================= HOST — the far country (KFAR) and the light modes
// The shared sky (89-host-sky.js) draws the sky, the sun and the giant, and drives the light by the hour; with thin air
// it takes the fog to nothing (PLAN.md section 2: at 0.07-0.11 atm the far rim 65 km off stands as sharp as the near one).
// What this page adds: THE CALDERA AND THE UPPER SHIELD as one coarse real mesh round the map (KFAR, core/terrain/44), out
// to 90 km with the planet's curvature: the whole ring of the caldera wall, its far rim, and past the rim the shield
// falling away. Its heights are the stage's own closure (baseH) carried on past the map; its colours the rock's
// (KSTRATA's tibasalt on the faces), the halo's black beads on the floor and the benches, the orange near the vent.
const FAR=(function(){
 /* the lattice is in the square's own frame (its centre at 0: KFAR's lines are symmetric), the mesh moved to the square's centre */
 const RIN=TERR.R,CELL=160,SINK=30,ROUT=90000,CX=TERR.cx,CZ=TERR.cz;
 const GL=KFAR.lines({cell:CELL,inner:9600,out:ROUT,grow:1.06});
 const FARK={curve:{from:RIN},crest:{k:.5,from:9000,to:30000}};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),hx=h=>L([(h>>16)&255,(h>>8)&255,h&255]);
 const C={rock:hx(0x2a2829),black:hx(0x1d1b1b),orange:hx(0xa85a24),floor:hx(0x3b3a39),bench:hx(0x353332),frost:hx(0xb8c0c8)};
 const mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const rr2=(ROUT-500)*(ROUT-500),o1={};
 const G=KFAR.grid(Object.assign({lines:GL,dense:true,
  h:(x,z)=>{const X=x+CX,Z=z+CZ;if(inMap(X,Z))return terrainH(X,Z)-(Math.abs(x)>=RIN||Math.abs(z)>=RIN?0:SINK);return baseH(X,Z);},
  skip:(x0,z0,x1,z1)=>(x0>=-RIN&&x1<=RIN&&z0>=-RIN&&z1<=RIN)||Math.min(x0*x0+z0*z0,x1*x1+z0*z0,x0*x0+z1*z1,x1*x1+z1*z1)>rr2,
  /* the floor and benches the halo's black beads as the map draws them (its mean under the sun), orange toward the vent;
     the faces the basalt's black; frost on the steep faces turned south (the shaded side at this site) */
  color:(x0,z0,y,q)=>{const x=x0+CX,z=z0+CZ,sl=q.slope||0,h=q.h,dV=Math.hypot(x-VENT.x,z-VENT.z);
   let c=mixC(C.floor,C.orange,.55*Math.exp(-dV/2600));
   /* the faces: the basalt's black, a band now and then (the column's colour averaged over 40 m: a coarse lattice cannot draw beds) */
   const rk=smooth(.35,.85,sl),st=STRATA.colorAt(Math.floor(h/40)*40);c=mixC(c,mixC(C.rock,L(st.map(v=>v*255)),.35),rk);
   const south=smooth(.2,.7,G0n(x,z));c=mixC(c,C.frost,.18*south*rk);
   return MODEL.farColor?MODEL.farColor(x,z,h,sl,c,{mixC,L,C}):c;}},FARK));   /* a station's own colours (the orange belt's palagonite, the ice) */
 function G0n(x,z){const e=40;return (baseH(x,z+e)-baseH(x,z-e))/(2*e)*-1;}   // >0: the ground falls southward (it faces south: the shaded side at this site)
 const mesh=KFAR.mesh(G,{name:'far:caldera',label:'The caldera and the upper shield (far country)'});
 mesh.position.set(CX,0,CZ);mesh.updateMatrixWorld(true);mesh.frustumCulled=false;mesh.userData.probeSkip=true;mesh.userData.farField=true;scene.add(mesh);
 REGISTER({name:STN.summit?'The summit caldera, its far wall and the upper shield (the far country)':'The Godthrone\'s shield round the station (the far country)',x:CX,z:CZ,y:baseH(CX,CZ)-6000,r:ROUT,h:12000,far:true});
 /* at(x, z): the lattice's height at a point of the summit's frame (KHORIZON's far grid reads it) */
 return{mesh,G,FARK,C,at:(x,z)=>G.at(x-CX,z-CZ),tris:G.count?G.count.tris:0};})();

// ---------------------------------------------------------------- light modes
// setLightMode('day'|'dawn'|'night') jumps the clock to that mode's hour (SKY.modes in 89-host-sky.js). LIGHT_MODE follows
// the sun and every LIGHT_HOOKS fn(mode) runs on each change (the vent's glow, the fume's colour)
var LIGHT_HOOKS=window.LIGHT_HOOKS||[];
var LIGHT_MODE='day';
function setLightMode(mode){if(typeof SKY!=='undefined')SKY.setMode(mode);}
LIGHT_HOOKS.push(m=>{const t=m==='night'?[.55,.58,.68]:m==='dawn'?[1,.9,.84]:[1,1,1];FAR.mesh.material.color.setRGB(t[0],t[1],t[2]);});
