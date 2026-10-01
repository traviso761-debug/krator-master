// ---------- the Amniotic Thermal Springs ----------
// The first version of the springs was a scatter of orange sacs on the shaft wall and three hot tubs on decks.
// The park's own leaflet for the springs (refs: AmnioticThrmalSprings.png) draws something else entirely, and
// this follows it:
//
//   the baths        a cluster of ballast bulbs off one side of the shaft - round chambers with convoluted
//                    walls, like a brain turned inside out, each with a pool of fluid in its lower third, a
//                    deck, a ladder, a hut and a phone. Eight are open, each with a name, and they are graded by
//                    potency: the fluid runs from a pale blue in the Main Bath through the blues of Regia and
//                    Laetis to the reds of Viribus and, lowest and strongest, Libido.
//   the Main Bath    the big one: a chamber tented up into points round a ring of fresh-air ducts, the pool
//                    wandered by two red walkways, loungers round the edge, and the Bath House on its near side -
//                    lockers, towels, showers, and a reinforced shell that doubled as the shelter.
//   the passages     the long passage up through the middle with the lift in it, the stalks out to each bath,
//                    the Lovers Squeeze between Salus and Libido, and the Complementary Readiness Vestibule at
//                    the bottom. The enclosed trail comes down to the Bath House from the lifts in the shaft.
//   the frames       the Geodesic Retaining Frames pressed into the walls of every bath, which are what keep a
//                    chamber in a living wall the shape of a chamber.
//   the lease        the Commercial Extraction Lease Area on the far side: Anodyne's bulbs, off-limits, full of
//                    scaffold and tanks, with the pipe that takes the fluid to the surface.
//
// Fan work: the springs and their names are Trevor Roberts's. The shapes, the arrangement and the words on the
// cards are this project's own reading of the leaflet. Built by organism.js (it hands in env) so that
// everything here is merged and carded the same way as the rest of the pit.
export function buildSprings(env){
  const {THREE,RNG,AX,AZ,Y,wallAt,mergeParts,signBoard,faceTowards,card,M,L,F}=env;
  const parts=[],pods=[],stands=[],lamps=[],movers=[],cav=[];
  const A=env.azimuth!==undefined?env.azimuth:2.5;               // which way the complex lies off the shaft
  const ux=Math.cos(A),uz=Math.sin(A),vx=-Math.sin(A),vz=Math.cos(A);
  // (o, s, depth): o metres out from the shaft axis, s metres to the side, depth below the plain
  const W=(o,s,d)=>new THREE.Vector3(AX+ux*o+vx*s,Y(d),AZ+uz*o+vz*s);
  const box=(p,w,h,dd,m,rot)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,dd).translate(0,h/2,0),m);b.position.copy(p);if(rot!==undefined)b.rotation.y=rot;return b;};
  const UP=new THREE.Vector3(0,1,0);
  const strut=(a,b,w,h,m)=>{const dir=new THREE.Vector3().subVectors(b,a),len=dir.length();
    const s=new THREE.Mesh(new THREE.BoxGeometry(w,len,h||w),m);s.position.copy(a).addScaledVector(dir,0.5);s.quaternion.setFromUnitVectors(UP,dir.normalize());return s;};
  const faceOut=Math.atan2(ux,uz);                               // a board facing away from the shaft

  // ---- potency: the fluid's colour, from the Main Bath's pale blue to Libido's red ----
  const POT=[[0,'#bfe8f6'],[0.3,'#4a86e0'],[0.5,'#2c4aa8'],[0.62,'#8a3a9a'],[0.8,'#c8305a'],[1,'#e01c32']];
  const potColour=p=>{for(let i=1;i<POT.length;i++)if(p<=POT[i][0]){const [p0,c0]=POT[i-1],[p1,c1]=POT[i];
    return new THREE.Color(c0).lerp(new THREE.Color(c1),(p-p0)/(p1-p0));}return new THREE.Color(POT[POT.length-1][1]);};

  // ---- a ballast bulb: a sphere with the wall folded like a brain, and a drop-shaped bottom ----
  function bulbGeometry(R,seed,star){
    const g=new THREE.SphereGeometry(R,star?64:40,star?36:28);
    const p=g.attributes.position,col=[],c=new THREE.Color();
    const base=new THREE.Color(star?'#d99098':'#c8707c'),groove=new THREE.Color('#6a2430');
    for(let i=0;i<p.count;i++){
      let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
      const nx=x/R,ny=y/R,nz=z/R,phi=Math.atan2(nz,nx);
      // the folds: two crossing wave fields, bent by a third, so the ridges wander like gyri
      const f=Math.sin(nx*9+seed+Math.sin(ny*7+seed*2)*1.8)*Math.sin(nz*9-seed+Math.sin(nx*6)*1.6)+0.5*Math.sin(ny*13+nz*5+seed);
      let r=1+(star?0.018:0.05)*f;
      if(star){                                                  // the Main Bath is tented up into six points
        const pk=Math.pow(Math.max(0,Math.cos(phi*6)),3);
        r*=1+0.22*pk*Math.max(0,1-Math.abs(ny)*0.8);
        if(ny>0)y+=R*0.55*pk*ny*ny;
        y*=0.62;
      }else if(ny<-0.35){                                        // the drop at the bottom: narrower and pointed
        const t=(-ny-0.35)/0.65;r*=1-0.45*t*t;y*=1+0.5*t*t;
      }
      p.setXYZ(i,x*r,y,z*r);
      c.copy(base).lerp(groove,Math.max(0,-f)*0.55).multiplyScalar(0.85+0.15*Math.sin(ny*3+seed));
      col.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.computeVertexNormals();
    return g;
  }
  const bulbM=new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.BackSide,specular:0x5a2a32,shininess:30,emissive:0x2a0c10});
  const geoM=new THREE.LineBasicMaterial({color:0x9a948c,transparent:true,opacity:0.32});
  const phoneM=new THREE.MeshBasicMaterial({color:0x3a78e0});
  const lounger=new THREE.MeshLambertMaterial({color:0xece8e0});

  // a geodesic retaining frame, pressed into the wall: the edges of a subdivided icosahedron, sized to the bulb
  function frame(c,R,sy){const e=new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(R*0.955,1));
    const l=new THREE.LineSegments(e,geoM);l.position.copy(c);l.scale.set(1,sy||1,1);return l;}

  // a pool: a disc at the level, the width of the bulb there, lit from underneath by what is in it
  function pool(c,R,level,p,sy){
    const dy=(c.y-level)/(sy||1),rr=Math.sqrt(Math.max(0,R*R-dy*dy))*0.94;
    const col=potColour(p);
    const m=new THREE.Mesh(new THREE.CircleGeometry(rr,40),new THREE.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:0.35,
      specular:0xffffff,shininess:90,transparent:true,opacity:0.9,side:THREE.DoubleSide}));
    m.rotation.x=-Math.PI/2;m.position.set(c.x,level,c.z);
    movers.push({m,kind:'sea',y:level});
    return {m,rr,col};
  }

  // ---- the baths ----
  const BATHS=(L.baths&&L.baths.length)?L.baths:[];
  const at={};                                                   // where each one ended up, for the stalks
  for(const B of BATHS){
    const c=W(B.o,B.s,B.d),R=B.R,G=[];
    const shell=new THREE.Mesh(bulbGeometry(R,B.o*0.013+B.s*0.007,false),bulbM);shell.position.copy(c);G.push(shell);
    if(B.sealed){                                                // the undeveloped bulb: no pool, no deck, an orifice
      const ring=new THREE.Mesh(new THREE.TorusGeometry(R*0.35,R*0.14,8,16),M.wetM);ring.position.copy(c).add(new THREE.Vector3(-ux*R*0.9,0,-uz*R*0.9));
      ring.rotation.y=faceOut+Math.PI/2;G.push(ring);
      const sg=signBoard(THREE,['UNDEVELOPED BALLAST BULB','Traditional entry: crawl in through the orifice'],{w:7,h:1.8});
      sg.position.copy(c).add(new THREE.Vector3(-ux*(R+3),-R*0.5,-uz*(R+3)));sg.rotation.y=faceOut+Math.PI;G.push(sg);lamps.push(sg);
      parts.push(...card({name:B.name,info:B.info||''},G));
      cav.push({kind:'ell',c,r:[R,R,R]});at[B.key]={c,R,level:c.y-R*0.4};
      continue;
    }
    const level=c.y-R*0.42;
    const pl=pool(c,R,level,B.p,1);G.push(pl.m);
    G.push(frame(c,R));
    // the deck on the shaft side, a ladder into the water, a hut, a phone, a lamp and the name
    const inward=new THREE.Vector3(-ux,0,-uz),deckC=new THREE.Vector3().copy(c).addScaledVector(inward,pl.rr*0.72);
    deckC.y=level+0.6;
    const dk=box(deckC,pl.rr*0.55,0.5,pl.rr*0.8,M.deckM,faceOut);dk.position.y-=0.5;G.push(dk);
    const hut=box(new THREE.Vector3().copy(deckC).addScaledVector(inward,pl.rr*0.1),4,3,3,M.brownM,faceOut);G.push(hut);
    G.push(strut(new THREE.Vector3().copy(deckC).addScaledVector(inward,-pl.rr*0.3),new THREE.Vector3().copy(deckC).addScaledVector(inward,-pl.rr*0.4).setY(level-2),0.5,0.2,M.steelM));
    const ph=box(new THREE.Vector3().copy(deckC).add(new THREE.Vector3(vx*pl.rr*0.25,0,vz*pl.rr*0.25)),0.7,1.5,0.5,phoneM,faceOut);G.push(ph);
    const lp=box(new THREE.Vector3().copy(deckC).add(new THREE.Vector3(-vx*pl.rr*0.25,0,-vz*pl.rr*0.25)),0.3,5,0.3,M.steelM);G.push(lp);
    const lh=box(new THREE.Vector3().copy(lp.position).setY(lp.position.y+5),1.6,0.4,0.6,M.fluorM,faceOut);G.push(lh);lamps.push(lh);
    const sg=signBoard(THREE,[B.name.toUpperCase(),B.sign||''],{w:7,h:1.8,style:B.p>0.7?['#4a0c14','#ffd0d0','#e01c32']:B.p>0.45?['#2a1440','#f0d8ff','#a870d0']:['#102a44','#d8f0ff','#6ab0e0']});
    sg.position.copy(deckC).addScaledVector(inward,pl.rr*0.1).setY(deckC.y+4.2);sg.rotation.y=faceOut+Math.PI;G.push(sg);lamps.push(sg);
    parts.push(...card({name:B.name,info:(B.info||'')+' Potency '+Math.round(B.p*10)+' on the park\'s scale of ten.'},G));
    stands.push({kind:'bath',x:c.x,y:level+0.3,z:c.z,spread:pl.rr*0.6,n:B.n||10});
    pods.push({x:c.x,y:c.y,z:c.z,R,a:Math.atan2(c.z-AZ,c.x-AX)});
    cav.push({kind:'ell',c,r:[R,R*1.1,R],level,fluid:pl.col});
    at[B.key]={c,R,level};
  }

  // ---- the Main Bath ----
  const MB=L.mainBath||{o:300,s:-40,d:1250,R:105};
  {
    const c=W(MB.o,MB.s,MB.d),R=MB.R,SY=0.62,G=[];
    const shell=new THREE.Mesh(bulbGeometry(R,3.3,true),new THREE.MeshPhongMaterial({vertexColors:true,side:THREE.BackSide,specular:0x8a5a60,shininess:50,emissive:0x2a1014}));
    shell.position.copy(c);G.push(shell);
    const level=c.y-R*SY*0.5;
    const pl=pool(c,R,level,0,SY);G.push(pl.m);
    G.push(frame(c,R,SY*1.05));
    // the fresh-air ring up in the tent, and its ducts to the wall
    const ringY=c.y+R*SY*0.55;
    const ring=new THREE.Mesh(new THREE.TorusGeometry(R*0.45,1.6,8,64),M.yellowM);ring.rotation.x=Math.PI/2;ring.position.set(c.x,ringY,c.z);G.push(ring);
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2;
      G.push(strut(new THREE.Vector3(c.x+Math.cos(a)*R*0.45,ringY,c.z+Math.sin(a)*R*0.45),new THREE.Vector3(c.x+Math.cos(a)*R*0.9,ringY+R*0.25,c.z+Math.sin(a)*R*0.9),1.8,1.8,M.yellowM));}
    // the red walkways across the water: two loops, on pontoons
    const redM=new THREE.MeshLambertMaterial({color:0xb02a2a});
    for(let q=0;q<2;q++){
      const pts=[];for(let k=0;k<=40;k++){const t=k/40*Math.PI*2;
        pts.push(new THREE.Vector3(c.x+(Math.cos(t)*pl.rr*0.45+(q?-1:1)*pl.rr*0.2)*1,level+0.6,c.z+Math.sin(t*2)*pl.rr*0.22+(q?1:-1)*pl.rr*0.15));}
      G.push(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),120,1.3,5,true),redM));
    }
    // the deck ring round the pool, loungers on it, a lifeguard chair, lamps
    const deckRing=new THREE.Mesh(new THREE.RingGeometry(pl.rr,pl.rr+9,64),new THREE.MeshLambertMaterial({color:0xd8d0c4,side:THREE.DoubleSide}));
    deckRing.rotation.x=-Math.PI/2;deckRing.position.set(c.x,level+0.4,c.z);G.push(deckRing);
    const loungers=[];
    for(let k=0;k<30;k++){const a=k/30*Math.PI*2,r=pl.rr+4.5;const l=new THREE.Mesh(new THREE.BoxGeometry(2,0.5,0.8),lounger);
      l.position.set(c.x+Math.cos(a)*r,level+0.8,c.z+Math.sin(a)*r);l.rotation.y=-a;loungers.push(l);}
    G.push(mergeParts(loungers,lounger));
    G.push(box(new THREE.Vector3(c.x+pl.rr*0.9,level+0.4,c.z),1.4,4,1.4,M.deckM));
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2+0.2,p=new THREE.Vector3(c.x+Math.cos(a)*(pl.rr+8),level+0.4,c.z+Math.sin(a)*(pl.rr+8));
      G.push(box(p,0.3,5,0.3,M.steelM));const h=box(new THREE.Vector3(p.x,p.y+5,p.z),1.2,0.4,1.2,M.fluorM);G.push(h);lamps.push(h);}
    {const sg=signBoard(THREE,['MAIN BATH','All ages · Accessible · Lifeguard on duty'],{w:10,h:2.2,style:['#102a44','#d8f0ff','#6ab0e0']});
     const p=W(MB.o-pl.rr-6,MB.s+10,0);sg.position.set(p.x,level+5,p.z);sg.rotation.y=faceOut;G.push(sg);lamps.push(sg);}
    parts.push(...card({name:'The Main Bath',info:(MB.info||'')},G));
    stands.push({kind:'bath',x:c.x,y:level+0.3,z:c.z,spread:pl.rr*0.75,n:MB.n||70});
    stands.push({kind:'bath',x:c.x,y:level+0.9,z:c.z+pl.rr+4,spread:5,n:12});
    pods.push({x:c.x,y:c.y,z:c.z,R,a:Math.atan2(c.z-AZ,c.x-AX)});
    cav.push({kind:'ell',c,r:[R*1.1,R*SY*1.25,R*1.1],level,fluid:pl.col});
    at.main={c,R,level,SY};
  }

  // ---- the Bath House: round, reinforced, blue-windowed, on the near side of the Main Bath ----
  const BH=W(MB.o-MB.R*0.62,MB.s-8,0);BH.y=at.main.level+0.6;
  {
    const G=[];const concM=new THREE.MeshLambertMaterial({color:0xd8d4cc});
    const body=new THREE.Mesh(new THREE.CylinderGeometry(15,16,7,24).translate(0,3.5,0),concM);body.position.copy(BH);G.push(body);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(15.1,15.1,2,24,1,true).translate(0,4,0),new THREE.MeshBasicMaterial({color:0x5aa8f0}));band.position.copy(BH);G.push(band);lamps.push(band);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(15,24,8,0,Math.PI*2,0,Math.PI/2),concM);dome.scale.y=0.35;dome.position.set(BH.x,BH.y+7,BH.z);G.push(dome);
    const pad=new THREE.Mesh(new THREE.CylinderGeometry(22,22,1,24),M.deckM);pad.position.set(BH.x,BH.y-0.5,BH.z);G.push(pad);
    const sg=signBoard(THREE,['BATH HOUSE','Lockers · Towels · Showers · Shelter'],{w:10,h:2});
    sg.position.set(BH.x-ux*16.5,BH.y+9,BH.z-uz*16.5);sg.rotation.y=faceOut+Math.PI;G.push(sg);lamps.push(sg);
    parts.push(...card({name:'The Bath House',info:'Lockers at five dollars for two hours, towels when there are towels, showers before and after. The shell is reinforced concrete poured on a sprung raft, and in an emergency the Bath House is the shelter: a steel door, air for six hours, and a phone line to the surface.'},G));
    stands.push({kind:'bath',x:BH.x,y:BH.y,z:BH.z,spread:18,n:18});
  }

  // ---- the passages ----
  const fleshTubeM=new THREE.MeshPhongMaterial({color:0xb86a74,side:THREE.BackSide,specular:0x4a2228,shininess:20,emissive:0x220a0e});
  const plankM=new THREE.MeshLambertMaterial({color:0x8a7a62});
  function passage(pts,r,info,lit){
    const curve=new THREE.CatmullRomCurve3(pts),G=[];
    G.push(new THREE.Mesh(new THREE.TubeGeometry(curve,Math.max(16,pts.length*10),r,10,false),fleshTubeM));
    // a boardwalk along the floor of it, and a lamp every so often
    const n=Math.max(4,Math.round(curve.getLength()/6)),planks=[];
    for(let k=0;k<n;k++){const a=curve.getPointAt(k/n),b=curve.getPointAt((k+1)/n);a.y-=r*0.7;b.y-=r*0.7;planks.push(strut(a,b,Math.min(2.4,r*0.9),0.3,plankM));}
    G.push(mergeParts(planks,plankM));
    if(lit)for(let k=1;k<n;k+=5){const p=curve.getPointAt(k/n);p.y+=r*0.7;const l=box(p,0.6,0.4,0.6,M.fluorM);G.push(l);lamps.push(l);}
    for(let k=0;k<pts.length-1;k++)cav.push({kind:'cap',a:pts[k].clone(),b:pts[k+1].clone(),r});
    parts.push(...card(info,G));
    return curve;
  }
  const lnk=(A1,B1)=>{const a=at[A1],b=at[B1];if(!a||!b)return null;const pa=a.c.clone(),pb=b.c.clone();pa.y=a.level+2;pb.y=b.level+2;
    const m=pa.clone().lerp(pb,0.5);m.y-=6;return [pa,m,pb];};
  // the long passage: up through the middle of the cluster, with the lift in it
  const SP=L.spine||{o:200,s:30,top:1060,bottom:1275};
  {
    const top=W(SP.o,SP.s,SP.top),bot=W(SP.o,SP.s,SP.bottom);
    passage([top,top.clone().lerp(bot,0.5).add(new THREE.Vector3(vx*4,0,vz*4)),bot],6.5,{name:'The long passage',info:'The spine of the springs: a tall passage up through the middle of the baths, with the stalks to each one opening off it and a lift the height of it. The lift was the only part of the springs Anodyne paid for.'},true);
    parts.push(box(new THREE.Vector3(bot.x,bot.y,bot.z),1.2,top.y-bot.y,1.2,M.steelM));
    const cage=box(new THREE.Vector3(bot.x+1.8,bot.y,bot.z),2.6,3,2.6,M.yellowM);parts.push(cage);
    movers.push({m:cage,kind:'lift',y0:top.y-4,amp:top.y-bot.y-6,ph:0.7});
    at.spineTop={c:top,level:top.y-2};at.spineBot={c:bot,level:bot.y-2};
    for(const B of BATHS){if(!B.via||B.sealed)continue;
      const b=at[B.key],spineY=Math.max(bot.y,Math.min(top.y,b.level+2));
      if(B.via==='spine'){const p0=new THREE.Vector3(top.x,spineY,top.z),p1=b.c.clone();p1.y=b.level+2;
        passage([p0,p0.clone().lerp(p1,0.5).setY((p0.y+p1.y)/2-4),p1],3.8,{name:'To the '+B.name,info:'A stalk off the long passage, planked and lit.'},true);}
      else{const pts=lnk(B.via,B.key);if(pts)passage(pts,B.squeeze?1.9:3.8,B.squeeze?{name:'The Lovers Squeeze',info:'The eustachian passage between Salus and Libido: a crawl, not a walk, and the park put a rope through it and left the rest to the bathers. It was the most photographed place in the springs.'}:{name:'To the '+B.name,info:'A stalk between two baths, planked and lit.'},!B.squeeze);}
    }
    // the bottom of the passage opens into the Main Bath
    const pm=lnk('spineBot','main');if(pm)passage(pm,5,{name:'The long passage',info:'Where the long passage comes down into the Main Bath.'},true);
  }

  // ---- the enclosed trail: from the lifts in the shaft down to the Bath House ----
  {
    const d0=L.trailFrom||1100,rw=wallAt(d0);
    const a0=W(rw-4,-10,d0),a1=new THREE.Vector3(BH.x-ux*20,BH.y+1,BH.z-uz*20);
    const G=[],dir=new THREE.Vector3().subVectors(a1,a0),len=dir.length(),n=Math.round(len/6);
    const side=new THREE.Vector3(vx,0,vz),chords=[],frames=[],treads=[];
    for(const [sx,sy] of [[-1.8,0],[1.8,0],[-1.8,3.4],[1.8,3.4]]){const o=side.clone().multiplyScalar(sx).setY(sy);
      chords.push(strut(a0.clone().add(o),a1.clone().add(o),0.35,0.35,M.steelM));}
    for(let k=0;k<=n;k++){const p=a0.clone().addScaledVector(dir,k/n);
      frames.push(strut(p.clone().addScaledVector(side,-1.8),p.clone().addScaledVector(side,1.8).setY(p.y+3.4),0.2,0.2,M.steelM));
      treads.push(box(p,3.4,0.25,1.4,M.deckM,Math.atan2(side.x,side.z)));
      if(k%3===0){const l=box(p.clone().setY(p.y+3.2),1,0.3,0.4,M.fluorM);G.push(l);lamps.push(l);}}
    const glass=strut(a0.clone().setY(a0.y+1.7),a1.clone().setY(a1.y+1.7),3.7,3.3,new THREE.MeshLambertMaterial({color:0x9ab8c0,transparent:true,opacity:0.22,depthWrite:false}));
    G.push(mergeParts(chords,M.steelM),mergeParts(frames,M.steelM),mergeParts(treads,M.deckM),glass);
    // the catwalk from the lift guides out to the wall, where the trail starts
    G.push(strut(W(26,-10,d0),W(rw-4,-10,d0),3,0.5,M.deckM));
    parts.push(...card({name:'Enclosed trail to the Lower Visitor Center',info:'A glazed truss stair from the lift landing in the shaft down to the Bath House: two hundred metres long, lit every eighteen, and the only way into the springs that did not involve crawling.'},G));
    cav.push({kind:'cap',a:a0,b:a1,r:4});
    stands.push({kind:'trail',path:[[a0.x,a0.y+0.2,a0.z],[a1.x,a1.y+0.2,a1.z]],n:24});
  }

  // ---- the Complementary Readiness Vestibule, under Libido ----
  if(at.libido){const b=at.libido,p=b.c.clone();p.y=b.level-b.R*0.35;
    const G=[box(p,9,4,6,new THREE.MeshLambertMaterial({color:0xe8e0d4}),faceOut)];
    const sg=signBoard(THREE,['COMPLEMENTARY READINESS VESTIBULE','Please wait here'],{w:8,h:1.6,style:['#4a0c14','#ffd0d0','#e01c32']});
    sg.position.set(p.x-ux*3.2,p.y+5,p.z-uz*3.2);sg.rotation.y=faceOut+Math.PI;G.push(sg);lamps.push(sg);
    parts.push(...card({name:'Complementary Readiness Vestibule',info:'A small white room below the Libido Bath with a bench, a clock and a basin, where bathers bound for the strongest water in the park were asked to sit for ten minutes first and think about it. The leaflet recommends a counsellor before the yellow line and a physician before the green one.'},G));}

  // ---- the Commercial Extraction Lease Area: Anodyne's side, off-limits ----
  {
    const LS=L.lease||[{o:330,s:-190,d:1110,R:46},{o:380,s:-120,d:1180,R:40},{o:300,s:-240,d:1200,R:34}];
    const tankM=new THREE.MeshPhongMaterial({color:0xe8e8e4,specular:0xffffff,shininess:60});
    for(const [i,Ls] of LS.entries()){
      const c=W(Ls.o,Ls.s,Ls.d),R=Ls.R,G=[],scaf=[];
      {const sh=new THREE.Mesh(bulbGeometry(R,i*2.7+1,false),bulbM);sh.position.copy(c);G.push(sh);}
      const level=c.y-R*0.42;
      G.push(pool(c,R,level,0.15,1).m,frame(c,R));
      // scaffold: towers of yellow frames standing in the fluid, and white tanks on them
      for(let k=0;k<4;k++){const a=k/4*Math.PI*2+i,px=c.x+Math.cos(a)*R*0.35,pz=c.z+Math.sin(a)*R*0.35;
        for(let h=0;h<3;h++){const y=level+h*6;
          for(const [dx,dz] of [[-2,-2],[2,-2],[2,2],[-2,2]])scaf.push(box(new THREE.Vector3(px+dx,y,pz+dz),0.3,6,0.3,M.yellowM));
          scaf.push(box(new THREE.Vector3(px,y+6,pz),4.4,0.3,4.4,M.yellowM));}
        if(k%2===0){const t=new THREE.Mesh(new THREE.SphereGeometry(4,12,8),tankM);t.position.set(px,level+22,pz);G.push(t);}
        const l=box(new THREE.Vector3(px,level+18.5,pz),1.2,0.4,1.2,M.mercM);G.push(l);lamps.push(l);}
      G.push(mergeParts(scaf,M.yellowM));
      const sg=signBoard(THREE,['COMMERCIAL EXTRACTION LEASE AREA','Off-limits to park visitors'],{w:9,h:2,style:'company'});
      sg.position.set(c.x-ux*(R*0.8),level+4,c.z-uz*(R*0.8));sg.rotation.y=faceOut+Math.PI;G.push(sg);lamps.push(sg);
      parts.push(...card({name:'Commercial Extraction Lease Area',info:'Anodyne\'s bulbs, on the far side of the springs from the baths and closed to visitors. The fluid is drawn off here, diluted, and pumped to the surface: some of it to the bath water upstairs, most of it to the refinery and the trucks to Odessa.'},G));
      stands.push({kind:'crew',x:c.x,y:level+18.5,z:c.z,spread:R*0.3,n:5,crew:true});
      cav.push({kind:'ell',c,r:[R,R*1.1,R],level,fluid:potColour(0.15)});
      if(i===0){                                                 // the pipe to the surface: to the shaft wall and up it
        const wallP=W(wallAt(Ls.d)-3,Ls.s*0.2,Ls.d);
        parts.push(strut(new THREE.Vector3(c.x,level+22,c.z),wallP,1.6,1.6,M.darkSteelM));
        parts.push(box(new THREE.Vector3(wallP.x,Y(Ls.d),wallP.z),1.6,Ls.d-env.D0,1.6,M.darkSteelM));
      }
    }
  }

  // ---- the ballast crops: lumps between the baths, not mapped, and a sign about them ----
  {
    const cropM=new THREE.MeshPhongMaterial({color:0x9a3a46,specular:0x6a3040,shininess:40,flatShading:true,emissive:0x1a0408});
    const crops=[];
    for(let k=0;k<70;k++){
      const o=180+RNG()*220,s=-200+RNG()*460,d=1060+RNG()*320,p=W(o,s,d),r=3+RNG()*9;
      if(Object.values(at).some(b=>b.R&&p.distanceTo(b.c)<b.R+r+6))continue;
      const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),cropM);m.position.copy(p);m.scale.set(1,0.8+RNG()*0.4,1);crops.push(m);
    }
    if(crops.length)parts.push(...card({name:'Ballast crops',info:'The lumps between the baths are ballast bulbs that never opened. Visitors are asked to take care when diving: many of them are not mapped, and some of them are closer to the surface of a pool than they look.'},[mergeParts(crops,cropM)]));
  }

  return {parts,pods,stands,lamps,movers,cavities:cav};
}
