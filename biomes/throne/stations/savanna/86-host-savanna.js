// ================================================================= HOST — the savanna's layout: the lahar boulders, the kopjes' boulders
// As RECORDS first (README.md), then drawn:
//   BOULDERS   the lahar's: blocks the size of huts carried down in the flood and strewn on the fan, more of them up-fan
//   KOPJES     each knoll's pile of old basalt boulders, lichened, some split
// Runs before 88 builds the kit: each boulder is an obstacle it plants round.
const SAV={boulders:[],kopjes:KOPJES.map(K=>({x:K.x,z:K.z,r:K.r,h:K.h,boulders:0}))};
(function(){const R=BIO.fn.reseed;R(8601);
 const C=h=>new THREE.Color(h),rr2=BIO.fn.rr,ri2=BIO.fn.ri,pk=BIO.fn.pick,Y=(x,z)=>terrainH(x,z),qE=(a,b,c)=>BIO.fn.qEuler(a,b,c);
 const lib=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('throne',n):null;
 const tex=n=>{const L=lib(n);return L?KMAT.textures(L,{aniso:4}).map:null;};
 BIO.def('laharblock',new THREE.IcosahedronGeometry(1,1),BIO.solidMat(tex('ground.lichenrock')),{label:'Lahar boulders'});
 BIO.def('kopjeblock',new THREE.DodecahedronGeometry(1,0),BIO.solidMat(tex('ground.lichenrock')),{label:'Kopje boulders'});
 const grey=()=>C(pk([0x6a6660,0x5e5a54,0x76706a,0x625c54]));
 // the lahar's boulders: on the fan, off its channels, thicker up-fan
 for(let k=0,tries=0;k<130&&tries<4000;tries++){const z=rr2(-2400,2400),x=FAN.cx(z)+rr2(-1,1)*FAN.W(z)*.95;if(fanIn(x,z)<.7||chanAt(x,z).bed>.3)continue;
  if(rng()>smooth(2600,-2600,z)*.8+.2)continue;if(OBSTACLES.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+3))continue;
  const s=rr2(1.2,3.6)*(rng()<.12?1.6:1),y=Y(x,z);BIO.put('laharblock',[x,y+s*.35,z],qE(rr2(0,3),rr2(0,TAU),rr2(0,3)),[s*rr2(1,1.4),s*rr2(.6,.9),s],grey());
  SAV.boulders.push({x,z,s,kind:'lahar boulder'});OBSTACLES.push({x,z,r:s*1.3});k++;}
 REGISTER({name:'Lahar boulders (carried down in the flood)',x:FAN.cx(-600),z:-600,y:flankH(0,-600)-10,r:2400,h:120,boulders:true});
 // the kopjes: boulders heaped on each knoll, the biggest on top
 KOPJES.forEach((K,ki)=>{for(let k=0,n=Math.round(K.r*.9);k<n;k++){const a=rr2(0,TAU),d=K.r*Math.sqrt(rng())*.95,x=K.x+Math.cos(a)*d,z=K.z+Math.sin(a)*d,s=rr2(1.5,4.2)*(1-d/K.r*.5),y=Y(x,z);
   BIO.put('kopjeblock',[x,y+s*.3,z],qE(rr2(0,3),rr2(0,TAU),rr2(0,3)),[s*rr2(1,1.3),s*rr2(.7,1),s*rr2(.9,1.2)],grey().lerp(C(0x8a8a6a),rr2(0,.3)));SAV.kopjes[ki].boulders++;}
  OBSTACLES.push({x:K.x,z:K.z,r:K.r*.7});});
 _mark('layout');
})();
