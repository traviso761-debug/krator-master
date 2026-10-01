// ================================================================= SATELLITE DISH — "the Ear"
function buildDish(scene,gx,gz,d){reseed(9990+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Satellite dish — the Ear ('+STATE(d)+')',x:0,z:0,r:70,h:80});
 const R=44;kput('slab',[0,1,0],null,[40,2,40],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 // ground contact: a graded skirt off the 2 m pad instead of a hard edge
 apron(G,0,0,39.6,50,d,2);
 // pedestal: three leaning hyperboloid legs meeting at a yoke
 for(let k=0;k<3;k++){const th=k/3*TAU;const Lg=new THREE.Group();Lg.position.set(Math.cos(th)*26,2,Math.sin(th)*26);Lg.rotation.set(0,-th,0);Lg.rotateZ(Math.atan2(24,30));G.add(Lg);
  mesh(lathe({rFn:y=>3.2*Math.sqrt(1+1.5*Math.pow((y-19)/19,2)),H:38,nu:20,nv:8}),skin,Lg);}
 kput('tube',[0,32,0],null,[5,6,5],null);
 const D=new THREE.Group();D.position.set(0,36,0);const tilt=d===1?1.1:.55;D.rotation.set(tilt,0,0);G.add(D);useGroupXF(D);
 const dishF=(u,v)=>{const a=u*TAU,r=v*R;return[r*Math.cos(a),r*r/(R*2.2),r*Math.sin(a)];};
 // THE BROKEN BOWL (round 2). The ruin's holes were fbm bands across the
 // paraboloid, which left concentric rings of skin hanging in the air, joined
 // to nothing ("dish floating wreckage"). Panels now tear away from the rim
 // inward along a ragged line, so every surviving piece still runs back to the
 // hub; a few punctures stay as holes. The rehabilitated dish (d=3) keeps the
 // intact tilt and only loses the outer ring of panels.
 const tear=u=>.42+.75*fbm(u*5,.5,1100,2)+(d===3?.3:0);
 const dHole=d>0?(u,v)=>v>tear(u)||(u>.64&&u<.78&&v>.6)||(v>.25&&fbm(u*16,v*9,1101,2)<.18):null;
 mesh(gridSurface(dishF,72,18,{uS:12,vS:6,hole:dHole}),skin,D);
 mesh(gridSurface((u,v)=>{const p=dishF(u,v);return[p[0],p[1]-.6,p[2]];},72,18,{uS:12,vS:6,hole:dHole}),MAT.darkSurf,D);
 for(let k=0;k<12;k++){const a=k/12*TAU;if(d>0&&k===7)continue;beam(d>0?'strutR':'strutW',[Math.cos(a)*4,0,Math.sin(a)*4],[Math.cos(a)*R*.95,R*R*.95*.95/(R*2.2),Math.sin(a)*R*.95],.9,1.2);}
 // feed on a tripod of thin struts
 const fy=R*.55;for(let k=0;k<3;k++){const a=k/3*TAU+.5;beam('tube',[Math.cos(a)*R*.7,R*R*.49/(R*2.2),Math.sin(a)*R*.7],[0,fy,0],.5,.5);}
 kput('finial',[0,fy,0],null,[2.5,3.5,2.5],null);
 // the rim went with the outer panels in the ruin; the ribs end bare
 if(d!==1)kput(d>0?'ringR':'ringW',[0,R*R/(R*2.2)+.3,0],qEuler(Math.PI/2,0,0),[R,R,3],null);endGroupXF();
 // the fallen panel lies on the ground: it used to stand on edge like a fence
 // (x .73 rad cancels the paraboloid's 42 degree slope at the rim)
 if(d>0){const fm=mesh(gridSurface((u,v)=>{const p=dishF(u*.12+.65,v*.4+.6);return p;},10,8,{uS:12,vS:6}),MAT.rust,G,56,1,54);fm.rotation.set(-.73,.3,.05);dropFragment(fm,0,.6);rubbleRing(0,0,20,10,40,40,2);scatterMoss(0,0,0,12,70,50,2);trees(0,0,50,90,8);}
 // control hut
 mesh(lathe({rFn:y=>6*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,flutes:6,amp:.1,nu:28,nv:6,hole:holeFn(d*.6,1110,null,2.5)}),skin,G,40,0,-10);kput('archOpen',[34.5,1.8,-10],qFacing([-1,0,0]),[.3,.35,1],null);
 kput(d>0?'pipeR':'pipe',[20,.6,-4],qEuler(0,-.3,Math.PI/2),[.4,36,.4],null);
 figures(0,40,3,4);KOFF=[0,0,0];return G;}

