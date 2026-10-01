// ================================================================= YUNI VARIANTS (4 of 5): the Ear, dish intact
// The kit's satellite dish (86-dish.js) as Yuni's "reclaimed, dish intact"
// asset showed it: the same rusted, re-occupied structure, but the reflector,
// its twelve struts, the rim, the feed and the mount are whole and it still
// points at the sky. In Yuni this was a flag (DISHOK) on the kit's own
// builder; here it is a builder of its own, so the kit's dish is untouched.
//   0 intact: the kit's intact dish.
//   1 ruined: rust and holes in the legs and the hut, the bowl whole and
//     aimed; nothing lies on the ground, nobody is there.
//   3 repaired: Yuni's state proper. A later people keep it: shacks, gardens
//     and fires on the pad and round the legs (adReclaim), a cable strung from
//     the feed down a leg to the hut, a warm lamp on the feed and the hut lit
//     inside. repairPass patches the fabric as for every kit type.
// Upgrades over Yuni's: the ruined hut has a room behind its holes, and the
// whole builder costs one draw call per material (civFlatten).
function buildYvDish(scene,gx,gz,d){reseed(d>0?9988:9987);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Satellite dish — the Ear, dish intact ('+STATE(d)+')',x:0,z:0,r:70,h:80});
 const R=44;kput('slab',[0,1,0],null,[40,2,40],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 apron(G,0,0,39.6,50,d,2);
 // pedestal: three leaning hyperboloid legs meeting at a yoke (holed when old)
 const legs=[];
 for(let k=0;k<3;k++){const th=k/3*TAU;const Lg=new THREE.Group();Lg.position.set(Math.cos(th)*26,2,Math.sin(th)*26);Lg.rotation.set(0,-th,0);Lg.rotateZ(Math.atan2(24,30));G.add(Lg);legs.push(Lg);
  mesh(lathe({rFn:y=>3.2*Math.sqrt(1+1.5*Math.pow((y-19)/19,2)),H:38,nu:20,nv:8,hole:holeFn(d*.5,9987+k,null,3)}),skin,Lg);
  if(d>0)mesh(lathe({rFn:y=>2.4*Math.sqrt(1+1.5*Math.pow((y-19)/19,2)),H:38,nu:12,nv:2}),MAT.dark,Lg);}
 kput('tube',[0,32,0],null,[5,6,5],null);
 const D=new THREE.Group();D.position.set(0,36,0);D.rotation.set(.55,0,0);G.add(D);useGroupXF(D);
 const dishF=(u,v)=>{const a=u*TAU,r=v*R;return[r*Math.cos(a),r*r/(R*2.2),r*Math.sin(a)];};
 mesh(gridSurface(dishF,72,18,{uS:12,vS:6}),skin,D);
 mesh(gridSurface((u,v)=>{const p=dishF(u,v);return[p[0],p[1]-.6,p[2]];},72,18,{uS:12,vS:6}),MAT.dark,D);
 for(let k=0;k<12;k++){const a=k/12*TAU;beam(d>0?'strutR':'strutW',[Math.cos(a)*4,0,Math.sin(a)*4],[Math.cos(a)*R*.95,R*R*.95*.95/(R*2.2),Math.sin(a)*R*.95],.9,1.2);}
 const fy=R*.55;for(let k=0;k<3;k++){const a=k/3*TAU+.5;beam('tube',[Math.cos(a)*R*.7,R*R*.49/(R*2.2),Math.sin(a)*R*.7],[0,fy,0],.5,.5);}
 kput('finial',[0,fy,0],null,[2.5,3.5,2.5],null);
 kput(d>0?'ringR':'ringW',[0,R*R/(R*2.2)+.3,0],qEuler(Math.PI/2,0,0),[R,R,3],null);
 // the keepers' lamp on the feed, and their cable down the feed tripod
 if(d===3){kput('dot',[0,fy-2.2,0],null,[1.6,1.6,1.6],WARM);
  const a=.5,p0=[Math.cos(a)*R*.7,R*R*.49/(R*2.2),Math.sin(a)*R*.7];
  for(let i=1;i<6;i++){const t=i/6;kput('dot',[lerp(0,p0[0],t),lerp(fy,p0[1],t)-.6,lerp(0,p0[2],t)],null,[.5,.5,.5],WARM);}}
 endGroupXF();
 if(d>0){scatterMoss(0,0,0,12,70,50,2);trees(0,0,50,90,8);}
 // control hut
 const HC=[40,-10],hh=holeFn(d*.6,1110,null,2.5);
 mesh(lathe({rFn:y=>6*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,flutes:6,amp:.1,nu:28,nv:6,hole:hh}),skin,G,HC[0],0,HC[1]);kput('archOpen',[34.5,1.8,-10],qFacing([-1,0,0]),[.3,.35,1],null);
 kput(d>0?'pipeR':'pipe',[20,.6,-4],qEuler(0,-.3,Math.PI/2),[.4,36,.4],null);
 figures(0,40,3,4);
 // --- below here draws rng() only after everything the kit's dish draws
 if(d>0){// the hut's room: a floor, a liner behind the holes, the old consoles (lit when kept)
  kput('slab',[HC[0],.25,HC[1]],null,[5.6,.3,5.6],CIV_FLOOR);mesh(lathe({rFn:y=>4.2*Math.pow(clamp(1-Math.pow(y/5.2,2),0,1),.5),H:5.2,nu:18,nv:3}),MAT.dark,G,HC[0],0,HC[1]);
  for(let k=0;k<6;k++){const th=(k+.5)/6*TAU,on=d===3&&k%2===0;
   kput('boxD',[HC[0]+Math.cos(th)*4.6,1.1,HC[1]+Math.sin(th)*4.6],qEuler(0,-th,0),[.8,1.8,1.8],null);
   kput(on?'cell':'cellD',[HC[0]+Math.cos(th)*4.15,1.6,HC[1]+Math.sin(th)*4.15],qFacing([-Math.cos(th),0,-Math.sin(th)]),[.9,.6,1],on?CYAN:null);}}
 if(d===3){// the keepers: a camp on the pad and round the legs; the cable from the leg foot to the hut
  adReclaim(G,{up:70,minY:.5,ok:p=>p[1]<6&&Math.hypot(p[0],p[2])<48&&Math.hypot(p[0]-HC[0],p[2]-HC[1])>8,figs:6,spread:20});
  kput('dot',[HC[0]-6.5,3.4,HC[1]],null,[.8,.8,.8],WARM);
  beam('tube',[30,2.2,0],[HC[0]-5.6,2.2,HC[1]+.5],.18,.18);beam('tube',[30,2.2,0],[8.5,31.5,0],.18,.18);}
 // The keepers keep the bowl clear: repairPass, run by the scene on the group
 // this returns, would stand shacks on any upward face, the tilted bowl
 // included. At decay 3 the bowl leaves G for the scene (same place), so the
 // pass never sees it; it costs two draw calls of its own.
 if(d===3){G.remove(D);D.position.set(gx,36,gz);scene.add(D);}
 civFlatten(G);KOFF=[0,0,0];return G;}
