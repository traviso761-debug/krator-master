// ================================================================= HOST — the festival of the register (PLAN.md P5c)
// [draw] Every seventh day (LS.FESTIVAL, LS.isFestival: core/simulation's weekday 6) the great thangka (64 hangs it on the
// White Palace's base: LS_THANGKA) is unrolled from dawn to dusk, and the pilgrims' camp ground in the ward (LS.CAMP) is
// pitched for the day and its night: the valley's white cotton tents with their blue appliqué, a cook fire at every
// second one, the trough. The rest of the week the thangka is rolled away and the ground is bare. Who comes and where they
// go that day is core/simulation's (40-ls-plan FEST_SCHEDULES, 40d); this fragment only shows the day, and that night the
// butter-lamp offering (the lamps along the base's foot and round the Debate Court).
// ?festival=1 opens the page on the festival day (99).
const LSFEST=(function(){const T=THREE,C=LS.CAMP,F=LS.FESTIVAL,y0=LS.wardY((C.z0+C.z1)/2),grp=new T.Group();grp.visible=false;scene.add(grp);
 REGISTER({name:C.name,cls:'fixture',kind:'camp',key:'longsong_pilgrims_camp',x:(C.x0+C.x1)/2,z:(C.z0+C.z1)/2,y:y0,r:(C.x1-C.x0)/2,h:3,
  tags:{culture:'order',types:['religious','dwelling-single'],festival:true}});
 // the tent: a ridge tent (a triangular prism over its floor), the blue band round its foot, a dark door at its front
 const tentG=(function(){const g=new T.BufferGeometry(),P=[],Cc=[],W=[1,1,1],B=[.16,.32,.62],D=[.12,.1,.09];
  const tri=(a,b,c,col)=>{P.push(...a,...b,...c);for(let k=0;k<3;k++)Cc.push(...col);};
  const L=[-.5,0,-.5],R=[.5,0,-.5],Lf=[-.5,0,.5],Rf=[.5,0,.5],Tb=[0,1,-.5],Tf=[0,1,.5],bl=[-.42,.16,-.5],br=[.42,.16,-.5],blf=[-.42,.16,.5],brf=[.42,.16,.5];
  // the roof slopes (white over the blue foot band)
  tri(bl,blf,Tf,W);tri(bl,Tf,Tb,W);tri(br,Tb,Tf,W);tri(br,Tf,brf,W);
  tri(L,Lf,blf,B);tri(L,blf,bl,B);tri(R,br,brf,B);tri(R,brf,Rf,B);
  // the gables: the back white, the front with its dark door
  tri(R,L,Tb,W);tri(Lf,Rf,Tf,W);tri([-.16,0,.501],[.16,0,.501],[0,.62,.501],D);
  g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('color',new T.Float32BufferAttribute(Cc,3));g.computeVertexNormals();return g;})();
 const tents=new T.InstancedMesh(tentG,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),C.tents.length);
 const M=new T.Matrix4(),Q=new T.Quaternion(),E=new T.Euler(),V=new T.Vector3(),S=new T.Vector3();
 C.tents.forEach((t,i)=>{Q.setFromEuler(E.set(0,t.ry,0));M.compose(V.set(t.x,terrainH(t.x,t.z)-.02,t.z),Q,S.set(t.w,t.h,t.d));tents.setMatrixAt(i,M);});
 tents.userData.inspectLabel='A pilgrims\' tent (the valley\'s white cotton, the blue knots)';grp.add(tents);
 // the cook fires: a ring of stones, the flame, its glow (brighter as the light goes)
 const fires=C.tents.filter(t=>t.fire).map(t=>({x:t.x+Math.sin(t.ry)*(t.d/2+1.6),z:t.z+Math.cos(t.ry)*(t.d/2+1.6)}));
 const ring=new T.InstancedMesh(new T.TorusGeometry(.42,.12,5,10),new T.MeshLambertMaterial({color:0x6a665e}),fires.length);
 const flame=new T.InstancedMesh(new T.ConeGeometry(.22,.7,7),new T.MeshBasicMaterial({color:0xff9a3a,toneMapped:false}),fires.length);
 fires.forEach((f,i)=>{const y=terrainH(f.x,f.z);Q.setFromEuler(E.set(Math.PI/2,0,0));M.compose(V.set(f.x,y+.08,f.z),Q,S.set(1,1,1));ring.setMatrixAt(i,M);
  M.compose(V.set(f.x,y+.38,f.z),Q.identity(),S.set(1,1,1));flame.setMatrixAt(i,M);});
 ring.userData.inspectLabel=flame.userData.inspectLabel='A cook fire (tsampa and butter tea)';grp.add(ring,flame);
 const glowC=document.createElement('canvas');glowC.width=glowC.height=64;{const g=glowC.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
  r.addColorStop(0,'rgba(255,190,110,.9)');r.addColorStop(.35,'rgba(255,140,60,.35)');r.addColorStop(1,'rgba(255,120,40,0)');g.fillStyle=r;g.fillRect(0,0,64,64);}
 const glowM=new T.SpriteMaterial({map:new T.CanvasTexture(glowC),blending:T.AdditiveBlending,depthWrite:false,transparent:true,toneMapped:false,opacity:.3});
 fires.forEach(f=>{const s=new T.Sprite(glowM);s.position.set(f.x,terrainH(f.x,f.z)+.6,f.z);s.scale.set(3.4,3.4,1);s.userData.probeSkip=true;grp.add(s);});
 // the trough
 {const t=C.trough,y=terrainH(t.x,t.z);const box=new T.Mesh(new T.BoxGeometry(t.w,.6,t.d),new T.MeshLambertMaterial({color:0x6a4a2c}));box.position.set(t.x,y+.3,t.z);
  const w=new T.Mesh(new T.PlaneGeometry(t.w-.2,t.d-.2),new T.MeshLambertMaterial({color:0x3a5a5a}));w.rotation.x=-Math.PI/2;w.position.set(t.x,y+.55,t.z);
  box.userData.inspectLabel=w.userData.inspectLabel='The camp\'s water trough';grp.add(box,w);}
 // ---------------------------------------------------------------- the butter-lamp offering (the festival night)
 // a row along the forecourt at the base's foot, two before the thangka (east of the stair's landing), and a ring round
 // the Debate Court's floor; each a small flame's glow (additive points), lit at dusk and burning down by dawn
 const LP=[],WP=LS.building('white-palace'),K=WP.court,TOP=LS.ROCK.top,fy=-1.6;
 for(let x=-90;x<=94;x+=1.6)LP.push([x,terrainH(x,-11)+.25,-11]);   // on the ground (the forecourt stands above the ward's datum)
 for(const z of [-5,-7])for(let x=74;x<=94;x+=1.2)LP.push([x,Math.max(terrainH(x,z),fy)+.25,z]);
 for(let x=K.x0+2;x<=K.x1-2;x+=1.5){LP.push([x,TOP+.25,K.z0+2]);LP.push([x,TOP+.25,K.z1-2]);}
 for(let z=K.z0+3.5;z<=K.z1-3.5;z+=1.5){LP.push([K.x0+2,TOP+.25,z]);LP.push([K.x1-2,TOP+.25,z]);}
 const lpG=new T.BufferGeometry();lpG.setAttribute('position',new T.Float32BufferAttribute(LP.flat(),3));
 // each lamp a glow (2.2 m, soft) and its flame (a hard bright core that stays a few pixels however far off)
 const lamps=new T.Group(),lampM=o=>new T.PointsMaterial(Object.assign({map:glowM.map,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false},o));
 lamps.add(new T.Points(lpG,lampM({size:2.2,sizeAttenuation:true,color:0xffb060,opacity:.85})),new T.Points(lpG,lampM({size:5,sizeAttenuation:false,color:0xfff0c0})));
 lamps.visible=false;lamps.traverse(m=>{m.userData.probeSkip=true;m.userData.inspectLabel='The butter-lamp offering (the festival night)';m.frustumCulled=false;});scene.add(lamps);
 const litAt=(day,hour)=>{const L=F.lamps;return (LS.isFestival(day)&&hour>=L[0])||(LS.isFestival(day-1)&&hour+24<L[1]);};
 // ---------------------------------------------------------------- the day
 const state={festival:false,hung:false,day:-1,hour:-1};
 function apply(day,hour){const fest=LS.isFestival(day),hung=fest&&hour>=F.hung[0]&&hour<F.hung[1];
  state.festival=fest;state.hung=hung;state.day=day;state.hour=hour;grp.visible=fest;state.lamps=lamps.visible=litAt(day,hour);if(typeof LS_THANGKA!=='undefined'&&LS_THANGKA)LS_THANGKA.visible=hung;
  glowM.opacity=.25+.6*(typeof LSNIGHT!=='undefined'?1-LSNIGHT.state.day:0);}
 TICKS.push(()=>{const c=typeof _hostH!=='undefined'&&_hostH&&_hostH.clock;if(!c)return;if(c.day!==state.day||Math.abs(c.hour-state.hour)>.02)apply(c.day,c.hour);});
 apply(0,12);
 // ---------------------------------------------------------------- the checks (64)
 const FECHK={
  // the thangka is up only on the festival day, dawn to dusk; a week has one festival
  calendar(isF,hungAt,lampAt){let days=0,bad=[];for(let d=0;d<14;d++){if(isF(d))days++;for(const h of [3,12,21]){const want=isF(d)&&h>=F.hung[0]&&h<F.hung[1];if(hungAt(d,h)!==want)bad.push('day '+(d+1)+' '+h+'h');
    const lit=(isF(d)&&h>=F.lamps[0])||(isF(d-1)&&h+24<F.lamps[1]);if(lampAt&&lampAt(d,h)!==lit)bad.push('the lamps day '+(d+1)+' '+h+'h');}}
   return{ok:days===2&&!bad.length,detail:days+' festival days in 14; the thangka '+(bad.length?'wrong at '+bad.slice(0,3).join(', '):'up only on them, '+F.hung[0]+'h to '+F.hung[1]+'h, and the '+LP.length+' butter lamps lit only that night')};},
  // the camp's tents stand in the camp ground, clear of the buildings and of one another
  camp(tents){const B=LS.BUILDINGS.filter(o=>o.base==='ward'),bad=[];
   tents.forEach((t,i)=>{if(t.x<C.x0||t.x>C.x1||t.z<C.z0||t.z>C.z1)bad.push(i+' outside');
    if(B.some(o=>Math.abs(t.x-o.x)<o.w/2+t.w/2&&Math.abs(t.z-o.z)<o.d/2+t.d/2))bad.push(i+' in a building');
    tents.forEach((u,j)=>{if(j>i&&Math.abs(t.x-u.x)<(t.w+u.w)/2&&Math.abs(t.z-u.z)<(t.d+u.d)/2)bad.push(i+' on '+j);});});
   return{ok:!bad.length,detail:tents.length+' tents, '+fires.length+' cook fires; '+(bad.length?bad.slice(0,3).join('; '):'all in the ground, clear')};}};
 const hungAt=(d,h)=>{apply(d,h);return state.hung;},lampAt=(d,h)=>{apply(d,h);return state.lamps;};
 window.festivalChecks=function(add){const s0=[state.day,state.hour];add('the great thangka hangs only on the festival day',FECHK.calendar(LS.isFestival,hungAt,lampAt));apply(s0[0],s0[1]);
  add('the pilgrims\' camp stands in its ground',FECHK.camp(C.tents));};
 window.festivalNegatives=function(add){add('a thangka hung every day',FECHK.calendar(()=>true,()=>true));
  add('a tent pitched in the market hall',FECHK.camp(C.tents.concat([{x:86,z:-96,w:4,d:4}])));};
 return {apply,state};})();
_mark('festival');
