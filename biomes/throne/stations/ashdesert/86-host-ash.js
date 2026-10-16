// ================================================================= HOST — the ash desert's layout: the hollow's bones
// As RECORDS first (README.md), then drawn: the CO2 hollow kills what wanders into it and the mat digests it (NOTES.md,
// "The slime molds"), so its floor is clean; what is left lies bleached on the rim, where the gas thins: ribs, skulls,
// long bones, of the hardy Earth beasts and of Krator's own.
const ASH={hollow:{x:HOLLOW.x,z:HOLLOW.z,r:HOLLOW.r,depth:HOLLOW.depth,gas:'CO2',kills:true},bones:[]};
(function(){const R=BIO.fn.reseed;R(8601);
 const C=h=>new THREE.Color(h),rr2=BIO.fn.rr,ri2=BIO.fn.ri,Y=(x,z)=>terrainH(x,z),qE=(a,b,c)=>BIO.fn.qEuler(a,b,c);
 BIO.bucket('bone',BIO.barkMat(null),{label:'Bleached bones',uvScale:[1,1]});
 BIO.def('skull',new THREE.SphereGeometry(1,8,6).scale(1,.75,1.3),BIO.solidMat(null),{label:'Skulls'});
 const white=()=>C(0xe4ddcc).lerp(C(0xb8ae9a),rr2(0,.4));
 for(let k=0;k<26;k++){const a=rr2(0,TAU),d=HOLLOW.r*rr2(1.02,1.25),x=HOLLOW.x+Math.cos(a)*d,z=HOLLOW.z+Math.sin(a)*d,y=Y(x,z),s=rr2(.6,1.6),kind=k%3;const c=white();
  if(kind===0){// a ribcage: arcs from a spine
   const ry=rr2(0,TAU),sx=Math.cos(ry),sz=Math.sin(ry);BIO.tube('bone',[{x:x-sx*s,y:y+.08,z:z-sz*s,r:.05*s,col:c},{x:x+sx*s,y:y+.1,z:z+sz*s,r:.04*s,col:c}],c,{seg:4,cap:true});
   for(let j=0;j<6;j++){const t=(j/5-.5)*1.6*s,px=x+sx*t,pz=z+sz*t,side=j%2?1:-1;BIO.tube('bone',[{x:px,y:y+.1,z:pz,r:.03*s,col:c},{x:px-sz*.45*s*side,y:y+.45*s,z:pz+sx*.45*s*side,r:.025*s,col:c},{x:px-sz*.7*s*side,y:y+.05,z:pz+sx*.7*s*side,r:.02*s,col:c}],c,{seg:3,cap:true});}}
  else if(kind===1)BIO.put('skull',[x,y+.12*s,z],qE(rr2(-.3,.3),rr2(0,TAU),rr2(-.3,.3)),.22*s,c);
  else{const a2=rr2(0,TAU),L=rr2(.5,1.2)*s;BIO.tube('bone',[{x:x-Math.cos(a2)*L,y:y+.05,z:z-Math.sin(a2)*L,r:.06*s,col:c},{x:x+Math.cos(a2)*L,y:y+.05,z:z+Math.sin(a2)*L,r:.06*s,col:c}],c,{seg:4,cap:true});}
  ASH.bones.push({x,z,kind:['ribcage','skull','long bone'][kind]});}
 REGISTER({name:'Bones on the hollow\'s rim (the gas killed them; the mat cleaned the floor)',x:HOLLOW.x,z:HOLLOW.z,y:Y(HOLLOW.x,HOLLOW.z),r:HOLLOW.r*1.3,h:HOLLOW.depth+6,bones:true});
 OBSTACLES.push({x:HOLLOW.x,z:HOLLOW.z,r:HOLLOW.r*1.05});
 _mark('layout');
})();
