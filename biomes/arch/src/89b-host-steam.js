// ================================================================= HOST — after the atmosphere is bound (89a): the steam and the eternal flames
// THE STEAM (core/atmos fx/smokegroups): the solfatara's vent and its mud pots; a faint breath off the warm springs
const STEAM=(function(){const G={};if(SKEY!=='confluence')return null;const V=SITE.solfatara,E=[];
 for(let k=0;k<9;k++){const a=k/9*TAU,r=k?20+12*(k%3):0,x=V.x+Math.cos(a)*r,z=V.z+Math.sin(a)*r;E.push([x,terrainH(x,z)+.4,z,'steam']);}
 V.pots.forEach(p=>E.push([p[0],terrainH(p[0],p[1])+.3,p[1],'steam']));G.solfatara={emitters:E,n:18,k:.8};
 G.springs={emitters:SITE.springs.map(sp=>[sp.x,terrainH(sp.x,sp.z)+.3,sp.z,'steam']),n:8,k:.25};
 try{return ATMOS.smokeGroups?ATMOS.smokeGroups(G):null;}catch(e){reportErr('steam: '+e.stack);return null;}})();
// THE ETERNAL FLAMES (PLAN.md 3.7, Chimaera's): hydrogen and methane from the serpentinite burning in a cleft on the dome's flank. Each flame a few small
// additive cones that flicker on the host clock; methane's flame is yellow-orange and seen, the hydrogen's pale blue and nearly invisible by day (a
// faint blue core at the root). No core module draws a flame yet (core/atmos has only the brazier's cone): KNOWN_ISSUES.md. Each is a record with its heat.
const FLAMES=(function(){const out={list:[],meshes:[]};if(SKEY!=='confluence')return out;const C=SITE.flames;
 const gOuter=new THREE.ConeGeometry(.35,1,8,1,true);gOuter.translate(0,.5,0);const gCore=new THREE.ConeGeometry(.18,1,8,1,true);gCore.translate(0,.5,0);
 const mOuter=new THREE.MeshBasicMaterial({color:0xffa040,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 const mCore=new THREE.MeshBasicMaterial({color:0x6a9aff,transparent:true,opacity:.55,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
 for(let i=0;i<C.n;i++){reseed(KRAND.hash(SITE.seed,i,77));const s=(i+.5)/C.n*C.len,x=C.x+C.dir[0]*s+rr(-.6,.6),z=C.z+C.dir[1]*s+rr(-.6,.6),y=terrainH(x,z)+.05,h=rr(.5,1.6);
  const g=new THREE.Group();g.position.set(x,y,z);const o=new THREE.Mesh(gOuter,mOuter),c=new THREE.Mesh(gCore,mCore);o.scale.set(1,h,1);c.scale.set(1,h*.45,1);g.add(o);g.add(c);
  g.userData.inspectLabel='An eternal flame (hydrogen and methane from the serpentinite)';g.userData.probeSkip=true;scene.add(g);out.meshes.push({g,o,c,h,ph:rr(0,TAU)});
  out.list.push({x,z,h});
  REGISTER({name:'An eternal flame (H2 + CH4 from the serpentinite; the hydrogen\'s flame is nearly invisible by day)',x,z,y:y-.5,r:1.4,h:h+1.5,tags:{hazard:{kind:'fire',danger:.7,shape:{type:'cyl',r:.8,h:h+.5}}}});}
 tick(()=>{const t=performance.now()/1000;for(const m of out.meshes){const f=1+.18*Math.sin(t*7.3+m.ph)+.1*Math.sin(t*13.1+m.ph*2);m.o.scale.y=m.h*f;m.c.scale.y=m.h*.45*(2-f);}});
 return out;})();
