// ================================================================= FURNITURE
// Shared furniture models. Anything that goes inside or on top of a building
// lives here rather than being inlined where it is first needed, so the same
// piece can appear in a dwelling, on a terrace, and in the catalogue artifact
// without three slightly different versions drifting apart.
//
// Every piece takes (x,y,z,rot,s) with y the FLOOR it stands on and s a size
// multiplier, and every piece is built from instanced kit items so a hundred
// of them cost nothing. `FURN.list` is what the catalogue enumerates.
kdef('plank',new THREE.BoxGeometry(1,.09,.3),MAT.timber);
kdef('bowl',new THREE.SphereGeometry(1,10,6,0,TAU,Math.PI*.5,Math.PI*.5),MAT.rubble);
kdef('rope',new THREE.CylinderGeometry(.06,.06,1,5),MAT.lash||MAT.timber);

const FURN={
 // a sleeping platform on short legs, with a rolled mat
 // Five separate planks read as a pile of sticks at catalogue distance; the bed
 // is one slab with a frame, which is also what it actually is.
 bunk(x,y,z,rot,s){s=s||1;const q=qEuler(0,-rot,0);
  for(let i=-1;i<=1;i+=2)for(let j=-1;j<=1;j+=2)
   kput('postW',[x+Math.cos(rot)*i*1.6*s-Math.sin(rot)*j*.72*s,y+.36*s,
                 z+Math.sin(rot)*i*1.6*s+Math.cos(rot)*j*.72*s],null,[.28*s,.72*s,.28*s],null);
  kput(BOXC(1),[x,y+.78*s,z],q,[3.5*s,.2*s,1.6*s],new THREE.Color(0x7a6244));
  kput(BOXC(1),[x+Math.cos(rot)*1.62*s,y+1.06*s,z+Math.sin(rot)*1.62*s],q,
   [.28*s,.62*s,1.6*s],new THREE.Color(0x6a5238));
  kput('bowl',[x+Math.cos(rot)*1.0*s,y+.98*s,z+Math.sin(rot)*1.0*s],
   qEuler(1.5708,-rot,0),[.34*s,1.0*s,.34*s],new THREE.Color(0x8a7a52));},
 // a hammock slung between two points, as a shallow catenary of planks
 hammock(x,y,z,rot,s){s=s||1;const L=3.4*s;
  // overlapping slats that follow the sag, and tilt with it, so it reads as
  // slung cloth rather than a row of loose sticks
  for(let k=0;k<11;k++){const t=k/10-.5,sag=(.25-t*t)*1.9*s;
   kput(BOXC(1),[x+Math.cos(rot)*t*L,y-sag,z+Math.sin(rot)*t*L],qEuler(0,-rot,t*1.3),
    [L/10*1.3,.11*s,1.35*s],new THREE.Color(0x9a8a5e));}
  for(let i=-1;i<=1;i+=2)
   kput('rope',[x+Math.cos(rot)*i*L*.56,y+.46*s,z+Math.sin(rot)*i*L*.56],
    qEuler(0,0,i*.55),[s,1.9*s,s],null);},
 // a lidded chest
 chest(x,y,z,rot,s){s=s||1;const q=qEuler(0,-rot,0);
  kput(BOXC(1),[x,y+.42*s,z],q,[1.7*s,.85*s,1.0*s],new THREE.Color(0x6a5238));
  kput('plank',[x,y+.9*s,z],q,[1.8*s,s,1.1*s],null);
  for(let i=-1;i<=1;i+=2)
   kput('rope',[x-Math.sin(rot)*i*.42*s,y+.45*s,z+Math.cos(rot)*i*.42*s],
    qEuler(0,0,1.5708),[s,1.8*s,s],null);},
 // an open fruit basket
 // 'bowl' is the LOWER hemisphere, so it already opens upward; rotating it by
 // PI turned the basket into a dome with the fruit buried inside it.
 basket(x,y,z,rot,s){s=s||1;
  kput('bowl',[x,y+.62*s,z],qEuler(0,-rot,0),[.72*s,.8*s,.72*s],new THREE.Color(0x9a8450));
  for(let k=0;k<5;k++){const a=k/5*TAU+rot;
   kput('leafy',[x+Math.cos(a)*.26*s,y+.56*s,z+Math.sin(a)*.26*s],null,
    [.2*s,.2*s,.2*s],new THREE.Color(k%2?0xd08a2a:0xc25a3a));}},
 // a drying rack: two uprights and a run of poles
 rack(x,y,z,rot,s){s=s||1;
  for(let i=-1;i<=1;i+=2)
   kput('postW',[x+Math.cos(rot)*i*1.8*s,y+1.1*s,z+Math.sin(rot)*i*1.8*s],null,
    [.3*s,2.2*s,.3*s],null);
  for(let k=0;k<3;k++)
   kput('rope',[x,y+(1.2+k*.42)*s,z],qEuler(0,-rot,1.5708),[s,3.8*s,s],null);
  for(let k=0;k<6;k++)
   kput('plank',[x+Math.cos(rot)*(k/5-.5)*3*s,y+1.55*s,z+Math.sin(rot)*(k/5-.5)*3*s],
    qEuler(.6,-rot,0),[.7*s,s,.5*s],new THREE.Color(0x8a6a46));},
 // a cooking hearth: a ring of stones, ash, and a pot on a tripod
 hearth(x,y,z,rot,s){s=s||1;
  for(let k=0;k<9;k++){const a=k/9*TAU;
   kput('rubble',[x+Math.cos(a)*.95*s,y+.16*s,z+Math.sin(a)*.95*s],
    qEuler(rng(),rng(),rng()),[.34*s,.3*s,.34*s],null);}
  kput(SLABC(1),[x,y+.06*s,z],null,[.9*s,.12*s,.9*s],new THREE.Color(0x2a2420));
  for(let k=0;k<3;k++){const a=k/3*TAU+rot;
   kput('postW',[x+Math.cos(a)*.6*s,y+.9*s,z+Math.sin(a)*.6*s],
    qEuler(Math.cos(a)*.5,0,Math.sin(a)*.5),[.16*s,1.9*s,.16*s],null);}
  kput('bowl',[x,y+1.15*s,z],qEuler(Math.PI,0,0),[.5*s,.6*s,.5*s],new THREE.Color(0x44382e));},
 // a three-legged stool
 stool(x,y,z,rot,s){s=s||1;
  for(let k=0;k<3;k++){const a=k/3*TAU+rot;
   kput('postW',[x+Math.cos(a)*.34*s,y+.24*s,z+Math.sin(a)*.34*s],
    qEuler(Math.cos(a)*.22,0,Math.sin(a)*.22),[.14*s,.5*s,.14*s],null);}
  kput(SLABC(1),[x,y+.52*s,z],null,[.52*s,.1*s,.52*s],new THREE.Color(0x7a6244));},
 // a lashed ladder
 ladder(x,y,z,rot,s,h){s=s||1;h=h||4*s;
  for(let i=-1;i<=1;i+=2)
   kput('postW',[x-Math.sin(rot)*i*.36*s,y+h*.5,z+Math.cos(rot)*i*.36*s],null,
    [.17*s,h,.17*s],null);
  const n=Math.max(3,Math.round(h/(.5*s)));
  for(let k=1;k<n;k++)
   kput('rope',[x,y+k*h/n,z],qEuler(0,-rot,1.5708),[s,.82*s,s],null);},
 // a water jar
 // two hemispheres belly to belly, plus a neck: an egg needs a shoulder line
 jar(x,y,z,rot,s){s=s||1;const C=new THREE.Color(0x6e4a38);
  kput('bowl',[x,y+.56*s,z],qEuler(0,-rot,0),[.5*s,.58*s,.5*s],C);
  kput('bowl',[x,y+.56*s,z],qEuler(Math.PI,-rot,0),[.5*s,.5*s,.5*s],C);
  kput('postW',[x,y+1.1*s,z],null,[.19*s,.3*s,.19*s],C);
  kput(SLABC(1),[x,y+1.26*s,z],null,[.26*s,.07*s,.26*s],C);},
 // an upright loom with a part-woven web
 loom(x,y,z,rot,s){s=s||1;
  for(let i=-1;i<=1;i+=2)
   kput('postW',[x-Math.sin(rot)*i*1.1*s,y+1.3*s,z+Math.cos(rot)*i*1.1*s],null,
    [.24*s,2.6*s,.24*s],null);
  kput('rope',[x,y+2.5*s,z],qEuler(0,-rot,1.5708),[s,2.3*s,s],null);
  for(let k=0;k<9;k++)
   kput('rope',[x-Math.sin(rot)*(k/8-.5)*2*s,y+1.7*s,z+Math.cos(rot)*(k/8-.5)*2*s],
    null,[.5*s,1.7*s,.5*s],null);
  kput('plank',[x,y+.95*s,z],qEuler(0,-rot,0),[2.2*s,s,1.2*s],new THREE.Color(0x8a5a4a));},
};
FURN.list=['bunk','hammock','chest','basket','rack','hearth','stool','ladder','jar','loom'];

// ---------------------------------------------------------------- catalogue
// Lays every piece out on a lit plinth in a row, for the furniture artifact.
// One source for the models means the catalogue cannot drift from what is
// actually standing in the buildings.
function buildFurnCatalog(scene,gx,gz,d){reseed(9520+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const N=FURN.list.length,SP=11;
 REGISTER({name:'Furniture catalogue ('+N+' pieces)',x:(N-1)*SP*.5,z:0,r:N*SP*.6,h:12});
 mesh(gridSurface((u,v)=>[(u-.06)*(N*SP+10)-5,0,(v-.5)*26],4,4,{uS:12,vS:6}),MAT.slab,G);
 FURN.list.forEach((k,i)=>{const x=i*SP;
  kput(SLABC(0),[x,.5,0],null,[4.2,1,4.2],null);
  stripRing(x,1.1,0,4.0,0,14);
  REGISTER({name:'Furniture — '+k,x:x,z:0,r:4.4,h:9});
  FURN[k](x,1,0,0.6,1.6);});
 figures(-8,0,4,5);
 KOFF=[0,0,0];return G;}
