// ================================================================= HOST — the summit vent: its lava, its fume, its crack, its hazards
// PLAN.md section 4: "the summit vent: a fissure and spatter rampart that fountains now and then, fuming in between". Here it
// is FUMING (whether it is active now is the owner's: section 10). Records first (core/tags, core/hazard), then drawn:
//   the throat   lava standing in the shaft under the main cone's crater (core/atmos fx/lava; KHAZ.GROUND.lavaLake)
//   the fume     a column from the crater, fumaroles all along the fissure's crack (ATMOS.smoke, two kinds added to this
//                page's preset: the air is a tenth of an atmosphere, so the column spreads wide and thins fast)
//   the crack    still hot: it glows along its length at night (ATMOS.glowAdd: the glow layer, on with the night)
//   the hazards  the throat's lava, the gas at the crater and the fumaroles (KHAZ.GROUND.gasVent), the hot ground of the
//                spatter rampart (hotGround); the thin air and the cold everywhere (the ambient bridge: the sky's pressure,
//                the kit's held temperature)
const VENTS=(function(){const V=VENT,K=KRAND,u=(a,b)=>K.unit(K.hash(WORLD,a,b,0xF0E));
 // ---- the records
 const throat={name:'The summit vent\'s throat (lava stands in it)',x:V.x,z:V.z,y:V.lavaY-3,r:V.throat,h:10,kind:'hazard',
  tags:{hazard:KHAZ.GROUND.lavaLake(V.throat*.9)}};
 const crater={name:'The summit vent\'s crater (its gases)',x:V.x,z:V.z,y:V.lavaY,r:V.r*V.crater,h:60,kind:'hazard',tags:{hazard:KHAZ.GROUND.gasVent(V.r*V.crater*.8)}};
 const fum=[];for(let k=0;k<6;k++){const uu=FISS.a+90+k*(FISS.b-FISS.a-180)/5,p=fissPt(uu);if(coneAt(p[0],p[1]).k>.3)continue;
  fum.push({name:'A fumarole on the fissure\'s crack',x:p[0],z:p[1],y:terrainH(p[0],p[1])-2,r:14,h:24,kind:'hazard',tags:{hazard:KHAZ.GROUND.gasVent(10)}});}
 const fa=fissPt(FISS.a),fbp=fissPt(FISS.b),dx=FISS.dir,ax=[(dx[0]+dx[1])*SQ,(dx[1]-dx[0])*SQ];   /* the fissure's axis in x,z (s,t -> x,z) */
 const nx=[-ax[1],ax[0]],hw=34,mid=[(fa[0]+fbp[0])/2,(fa[1]+fbp[1])/2],L=Math.hypot(fbp[0]-fa[0],fbp[1]-fa[1])/2;
 const pts=[[-L,-hw],[L,-hw],[L,hw],[-L,hw]].map(q=>[ax[0]*q[0]+nx[0]*q[1],ax[1]*q[0]+nx[1]*q[1]]);
 const ramp={name:'The spatter rampart (the ground is still hot)',x:mid[0],z:mid[1],y:terrainH(mid[0],mid[1])-4,r:L+hw,h:30,kind:'hazard',tags:{hazard:KHAZ.GROUND.hotGround(pts,null)}};
 [throat,crater,ramp].concat(fum).forEach(r=>REGISTER(r));
 // ---- the throat's lava
 const sd=SKY.state&&SKY.state.sunDir?SKY.state.sunDir:[.4,.8,.3];
 const LAVA=ATMOS.lavaMaterial({name:'The summit vent\'s throat',centre:[V.x,V.z],sun:[sd.x==null?sd[0]:sd.x,sd.y==null?sd[1]:sd.y,sd.z==null?sd[2]:sd.z],
  crust:hostGroundLib('lavaCrust',null),scale:.14,crack:1.3,heat:1.1,swell:false});
 const lg=new THREE.CircleGeometry(V.throat*1.05,48);lg.rotateX(-Math.PI/2);lg.translate(V.x,V.lavaY,V.z);
 const lava=new THREE.Mesh(lg,LAVA);lava.userData.inspectLabel=throat.name;lava.renderOrder=1;scene.add(lava);
 // ---- the fume and the fumaroles (two kinds on the page's smoke preset: core/atmos 0p, "change a value before placing")
 const SP=ATMOS.PRESETS.smoke;
 SP.fume={index:3,n:46,rate:.022,rise:560,drift:260,wobble:9,size:[16,120],alpha:.26,rainDamp:0,color:[.76,.74,.71]};
 SP.fumarole={index:4,n:14,rate:.07,rise:70,drift:30,wobble:2.5,size:[3,18],alpha:.22,rainDamp:0,color:[.86,.85,.82]};
 const em=[];
 for(let k=0;k<9;k++){const a=u(k,1)*TAU,r=V.r*V.crater*.55*Math.sqrt(u(k,2)),x=V.x+Math.cos(a)*r,z=V.z+Math.sin(a)*r;em.push([x,terrainH(x,z)+2,z,'fume']);}
 for(let uu=FISS.a+40;uu<FISS.b-40;uu+=55){const p=fissPt(uu);if(coneAt(p[0],p[1]).k>.4)continue;em.push([p[0],terrainH(p[0],p[1])+.5,p[1],'fumarole']);}
 const fume=ATMOS.smoke(em);
 // ---- the crack's glow at night, every 9 m along it (off where it runs into a cone: the cones climbed over it)
 let glows=0;for(let uu=FISS.a+30;uu<=FISS.b-30;uu+=9){const p=fissPt(uu),F=fissAt(p[0],p[1]);if(coneAt(p[0],p[1]).k>.2||F.crack<.5)continue;
  ATMOS.glowAdd(p[0],terrainH(p[0],p[1])+2.5,p[1],[1,.38,.1],11+4*u(Math.round(uu),3),-1,30);glows++;}
 ATMOS.glowAdd(V.x,V.lavaY+4,V.z,[1,.45,.12],46,0,30);   /* the throat lights its crater's walls, day and night */
 ATMOS.finish();
 // ---- the air and the cold (core/hazard's ambient bridge): the sky's pressure by height; the temperature, the summit's held
 // mean (4.23: about -75 C above 17 km; the ground's is the sun's, not the air's: PLAN.md section 1) swinging with the sun
 if(ATMOS.provideAir)ATMOS.provideAir(SKY.preset||SKY.P||{air:{pressure:1.6,thin:{y0:0,scale:8000}}});
 else KHAZ.provide('pressure',(x,y,z)=>AIR.at(y));
 KHAZ.provide('temperature',(x,y,z)=>{const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return -75+22*clamp(e*2.2,-1,1);});
 return{throat,crater,ramp,fum,lava,LAVA,fume,glows,emitters:em.length};})();
// the night raises the lava's heat (ATMOS's night); the fume's light follows the hour in its own shader
