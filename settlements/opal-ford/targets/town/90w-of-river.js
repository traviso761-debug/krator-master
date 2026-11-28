// ================================================================= ŌPAL-PHŌRḌ — the river and the bow's fall on core/water; the paddies' water
// KNOWN_ISSUES.md ("the river is a ribbon"): the Sitār Ḍrāi through the near ground (OF_RIVER_NEAR) is core/water's (README.md,
// the kinds): a FLOW along the river's line below the fall and another above it, at the water's height (ofW), as wide as the
// channel (ofHW) and quickening in the rapids, drawn as its ribbon (the ripple carried down the current, white where the bed
// steepens and along the banks); the bow's fall a FALL from its lip, the curtain arcing from the lip speed, its streaks and its
// plunge where it lands. The sky in the water is core/atmos's skylight (a capture of the page's dome, given to the water only).
// Its CPU twins: WATER.heightAt, WATER.flowAt (verify.py of-river). Beyond the near ground 90q's ribbon draws the river on.
// The paddies' still water: one merged mesh of level sheets a hand over each basin's floor (129 basins: not a WATER.still each).
// [web]: three.js; the records are core/water's [G data].
let OF_RIVER=null;
if(OF_WATER_ON){
 try{
  ATMOS.init({THREE,scene,camera,hour:()=>OF_SKY.hour,onFrame:fn=>FRAME_HOOKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:OF.SEED+70,
   err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
  const env=new THREE.Scene(),g=OF_SKYG.clone();g.position.set(0,0,0);env.add(g);
  ATMOS.skylight({renderer,sky:env,scene:{environment:null},ground:()=>new THREE.Color(0x5a6a48)});
  const Fl=OF.REACH.fall,lipZ=Fl.z+Fl.len/2,footZ=Fl.z-Fl.len/2,R=OF.REACH;
  /* a reach as a flow line, downstream (the river falls toward -z): [x, z, y] every 20 m; its width and its current per point */
  const reach=(z1,z0)=>{const P=[];for(let z=z1;z>=z0-.1;z-=20)P.push([ofRiverX(z),z,ofW(z)]);if(P[P.length-1][1]>z0)P.push([ofRiverX(z0),z0,ofW(z0)]);return P;};
  const speedAt=z=>z<R.slack[0]?2.6:z>R.slack[1]?2.4:.7+.5*Math.exp(-(z*z)/(OF.RIVER.ford.len*OF.RIVER.ford.len));   /* slack at the town, quick over the ford's shoal and in the rapids */
  const flow=(name,P)=>WATER.flow({name,pts:P,width:P.map(p=>2*ofHW(p[1])+2),speed:P.map(p=>speedAt(p[1]))});
  const Up=R.upper,lipU=Up.z+Up.len/2,footU=Up.z-Up.len/2;
  const below=flow('the Sitār Ḍrāi (the slack reach and the rapids below the fall)',reach(footZ,OF_RIVER_NEAR[0]));
  const above=flow('the Sitār Ḍrāi (the rapids between the falls)',reach(footU,lipZ));
  const top=flow('the Sitār Ḍrāi (the rapids above the upper fall)',reach(OF_RIVER_NEAR[1],lipU));
  const mkFall=(name,z,h,speed)=>{const c=ofRiverX(z),hw=ofHW(z);return WATER.fall({name,lip:[[c-hw,z,ofW(z)],[c+hw,z,ofW(z)]],dir:[0,-1],speed,drop:h,spread:2*hw});};
  const fall=mkFall('the bow\'s fall',lipZ,Fl.h,3.2),fallU=mkFall('the cataract\'s upper fall',lipU,Up.h,2.6);
  const lin=c=>c.clone().convertSRGBToLinear();
  const opt={shallow:lin(new THREE.Color(0x8ab8ae)),deep:lin(new THREE.Color(0x4f8a84)),color:0xffffff,roughness:.12,metalness:.05,envMapIntensity:.5,step:8,across:6,margin:1.5};
  const D1=WATER.drawFlow(below,opt),D2=WATER.drawFlow(above,opt),D3=WATER.drawFlow(top,opt);
  const fo=footY=>({color:lin(new THREE.Color(0xd8ece8)),opacity:.9,rows:36,cols:8,plungeY:footY-1.5,spray:'drop',envMapIntensity:.3});
  const DF=WATER.drawFall(fall,fo(ofW(footZ))),DU=WATER.drawFall(fallU,fo(ofW(footU)));
  for(const [m,l] of[[D1.mesh,'The Sitār Ḍrāi'],[D2.mesh,'The Sitār Ḍrāi between the falls'],[D3.mesh,'The Sitār Ḍrāi above the cataract'],[DF.mesh,'The bow\'s fall'],[DU.mesh,'The cataract\'s upper fall']])if(m){m.userData.probeSkip=true;m.userData.inspectLabel=l;}
  for(const d of[DF,DU])if(d.plunge){d.plunge.userData.probeSkip=true;d.plunge.userData.inspectLabel='The plunge';}
  OF_RIVER={below,above,top,fall,fallU,drawn:!!(D1.mesh&&D2.mesh&&D3.mesh&&DF.mesh&&DU.mesh)};
 }catch(e){reportErr('Ōpal-Phōrḍ: the river on core/water: '+(e&&e.stack||e));}
}
// ---------------------------------------------------------------- the paddies' still water (one mesh)
(function ofPaddyWater(){if(!OF_WORKS||!OF_WORKS.paddies.length)return;const pos=[],idx=[];
 for(const q of OF_WORKS.paddies){const P=q.poly,c=P.reduce((a,p)=>[a[0]+p[0]/P.length,a[1]+p[1]/P.length],[0,0]),y=ofH(c[0],c[1])+.08,b=pos.length/3;
  /* each basin's sheet 1.2 m inside its bunds */
  for(const p of P){const dx=c[0]-p[0],dz=c[1]-p[1],L=Math.hypot(dx,dz)||1;pos.push(p[0]+dx/L*1.2,y,p[1]+dz/L*1.2);}
  idx.push(b,b+1,b+2,b,b+2,b+3);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const M=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x4f7466,roughness:.3,metalness:.05,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}));
 M.name='the paddies\' water';M.userData.probeSkip=true;M.renderOrder=1;scene.add(M);window._ofPaddyWater=OF_WORKS.paddies.length;})();
window._ofRiver=OF_RIVER?{drawn:OF_RIVER.drawn,flowAtFord:WATER.flowAt?WATER.flowAt(ofRiverX(0),0):null,heightAtFord:WATER.heightAt?WATER.heightAt(ofRiverX(0),0):null,waterAtFord:ofW(0)}:null;
