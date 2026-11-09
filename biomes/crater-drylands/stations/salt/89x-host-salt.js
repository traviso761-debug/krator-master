// ================================================================= HOST — station 4, the salt floor: the pans and the brine (core/water ext 54, 54b)
// THE SALT PANS (WATER.pan, drawn by WATER.drawPan): each pan's crust in polygons a few metres across, cracked, the cracks and the low cells
// wetting first and flooding with brine after rain (the weather's wetness, W.wet()), white salt drying to the cracks' tan. Each is a flat mesh
// on its own level, 2 cm over the ground 45 flattened under it. THE BRINE POOLS (WATER.still with the brine look: deep red-brown, halophile
// bloom, to turquoise in the shallows to the salt's white at the rim; Outlands C5). Each registered so the inspector names it.
const SALT_WATER=(function(){const W=WATER,out={pans:[],brines:[]};
 const poly=(P,n)=>{const o=[],c=Math.cos(P.t),s=Math.sin(P.t);for(let k=0;k<n;k++){const a=k/n*TAU,f=1+.12*Math.sin(3*a+P.s)+.07*Math.sin(5*a+2*P.s),u=Math.cos(a)*P.a*f,v=Math.sin(a)*P.b*f;
  o.push([P.x+u*c-v*s,P.z+u*s+v*c]);}return o;};
 if(W.pan&&W.drawPan)PANS.forEach((P,i)=>{const S=W.pan({name:'A salt pan',poly:poly(P,48),level:P.level});const D=W.drawPan(S,{pick:true});D.mesh.userData.inspectLabel='A salt pan';
  out.pans.push(D);REGISTER({name:'A salt pan',key:'pan',x:P.x,z:P.z,y:P.level-2,r:Math.max(P.a,P.b)*1.1,h:6});});
 const lin=c=>new THREE.Color(c).convertSRGBToLinear().getHex();
 BRINES.forEach(P=>{const g=W.lookGradient?W.lookGradient('brine',{from:.1,to:.8}):{centre:lin(0x4e1c14),rim:lin(0xa9ded4),power:.6};
  const S=W.still({name:P.name,level:P.level,poly:poly(P,40),gradient:g});if(W.withLook)W.withLook(S,'brine');
  const D=W.drawStill(S,{roughness:.1,metalness:.05,envMapIntensity:.35,renderOrder:1,pick:true});D.mesh.userData.inspectLabel=P.name;out.brines.push(D);
  REGISTER({name:P.name,key:'brine',x:P.x,z:P.z,y:P.level-3,r:Math.max(P.a,P.b)*1.2,h:12});});
 window._saltWater={pans:out.pans.length,brines:out.brines.length};return out;})();
