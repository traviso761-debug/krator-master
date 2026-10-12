 // ---- the diamond ------------------------------------------------------------
 // [z,y] on the SOUTH side of the diamond of L1 radius q. t runs 0 at the top
 // vertex, .5 at the equator, 1 at the keel; z is mirrored for the north side.
 // |z| + |y - CY| == q identically, which is the invariant the whole file leans
 // on. Arc length along one side from the ridge is 2*sqrt(2)*q*t, i.e. 2 000 m
 // from ridge to keel on the envelope.
 const ZY=(q,t)=>[q*(1-Math.abs(2*t-1)),CY+q*(1-2*t)];
 const ARCL=(q,t)=>2*Math.SQRT2*q*t;
 const TOFY=y=>(1-(y-CY)/RD)*.5;          // the t of a height, on the envelope
 // The outward radial in (z,y) at (t, side) — a unit vector at 45 degrees.
 const RAD=(t,sd)=>[0,(t<.5?1:-1)*Math.SQRT1_2,sd*Math.SQRT1_2];
 // and the tangent, in the direction of increasing t
 const TAN=(t,sd)=>[0,-Math.SQRT1_2,sd*(t<.5?1:-1)*Math.SQRT1_2];
 // Local +X onto a direction: `strip` and every cornice member runs along its
 // own local x, and the diamond's tangent is at 45 degrees in the (y,z) plane.
 const QX=v=>new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0),
   new THREE.Vector3(v[0],v[1],v[2]).normalize());
 // A FULL BASIS, for the light bands on the front elevation: local +x along the
 // diamond's tangent and local +z out of the end face, so a flat pane lies on the
 // face and follows the ring. A 4 m light TUBE at 1 600 m is two pixels and the
 // concentric rings are the whole drawing; a 9 m band is eight, and costs two
 // triangles a segment instead of twelve.
 const QB=(t,sd,ex)=>{const T=TAN(t,sd);
  const zz=new THREE.Vector3(ex,0,0),xx=new THREE.Vector3(T[0],T[1],T[2]).normalize();
  const yy=new THREE.Vector3().crossVectors(zz,xx).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xx,yy,zz));};

 // ---- materials and merge lists ----------------------------------------------
 const resM=dd?MAT.acResR:MAT.acRes, wrkM=dd?MAT.acWrkR:MAT.acWrk;
 const latM=dd?MAT.acLatR:MAT.acLat, masM=dd?MAT.acMassR:MAT.acMass;
 const dekM=dd?MAT.acDeckR:MAT.acDeck, shdM=dd?MAT.acShadeR:MAT.acShade;
 const pavM=dd?MAT.acPaveR:MAT.acPave;
 const bndM=dd?MAT.acBand1R:MAT.acBand1, frmM=dd?MAT.acFrameR:MAT.acFrame;
 const pirM=dd?MAT.acPierR:MAT.acPier;
 // on the mass (merged into P, the settled frame) ...
 const RES=[],WRK=[],LAT=[],MAS=[],DEK=[],SHD=[],BND=[],FRM=[],BRK=[],TWR=[];
 // ... and on the ground (merged into G)
 const PIRG=[],MASG=[],DEKG=[],SHDG=[],GRD=[];
 // A wall whose storey lines must stay level although its top is mitred: v of
 // the map is world height over the tile, whatever the grid's own v was.
 const uvWorldY=(g,tile)=>{const a=g.attributes.uv,p=g.attributes.position;
  for(let i=0;i<a.count;i++)a.setY(i,p.getY(i)/tile);return g;};
 // A box as a mergeable geometry, its map tiled at `tile` m on every face, turned
 // by q and put down at p: for the great fallen pieces that want a real wall map
 // rather than the kit's plain concrete.
 const acBoxGeo=(sx,sy,sz,tile,q,p)=>{const g=new THREE.BoxGeometry(sx,sy,sz),a=g.attributes.uv;
  const dims=[[sz,sy],[sz,sy],[sx,sz],[sx,sz],[sx,sy],[sx,sy]];
  for(let f=0;f<6;f++)for(let k=0;k<4;k++){const i=f*4+k;a.setXY(i,a.getX(i)*dims[f][0]/tile,a.getY(i)*dims[f][1]/tile);}
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));g.translate(p[0],p[1],p[2]);return g;};
 // QA (arcC): the same call, SHATTERED (krShard): the box's y ends (along=true,
 // a pier or a tower lying down, torn across its shaft) or its sides (a slab of
 // stacked floors, torn round its edges) are torn, every storey torn back
 // further than the one below, the tear on the break map, floor tongues and
 // bars out of it. p[1]===null beds it: its lowest point `bed` m into the plain.
 const BRKG=[];
 const acShardGeo=(sx,sy,sz,tile,q,p,skin,along,bed)=>{
  const w=sx,l=along?sy:sz,t=along?sz:sy,qq=along?q.clone().multiply(qEuler(Math.PI/2,0,0)):q;
  const SH=krShard({w:w,l:l,t:t,layers:Math.max(2,Math.min(9,Math.round(t/14))),brk:along?[1,0,1,0]:[1,1,1,1],bite:.2,tile:tile,seg:Math.max(10,Math.min(w,l)/5)});
  const y=p[1]===null?-SH.low(qq)-(bed||2):p[1];
  const M=new THREE.Matrix4().compose(new THREE.Vector3(p[0],y,p[2]),qq,new THREE.Vector3(1,1,1));
  if(SH.top)skin.push(SH.top.applyMatrix4(M));if(SH.side)skin.push(SH.side.applyMatrix4(M));
  if(SH.bot)SHDG.push(SH.bot.applyMatrix4(M));if(SH.brk)BRKG.push(SH.brk.applyMatrix4(M));
  const W=(a,b,c)=>{const v=new THREE.Vector3(a,b,c).applyMatrix4(M);return[v.x,v.y,v.z];};
  for(const r of SH.rim){const n=r.n,pp=r.p;
   if(r.step>2&&rng()<.6){const L=r.step*rr(.5,1)+rr(1,5);
    kput('acBox',W(pp[0]-n[0]*r.step*.5+n[0]*L*.5,pp[1]+.8,pp[2]-n[2]*r.step*.5+n[2]*L*.5),
     qq.clone().multiply(qFacing([n[0],0,n[2]])).multiply(qEuler(rr(-.05,.05),0,rr(-.07,.07))),[r.len*rr(.5,.9),1.6,L],new THREE.Color(0xa0968a));}
   if(rng()<.35)for(let b=0;b<2;b++){const L=rr(4,12);
    kput('acDim',W(pp[0]+n[0]*L*.35+rr(-2,2),pp[1]-rr(.5,3),pp[2]+n[2]*L*.35+rr(-2,2)),
     qq.clone().multiply(qFacing([n[0]+rr(-.3,.3),rr(-.3,.4),n[2]+rr(-.3,.3)])),[.45,.45,L],null);}}
  return SH;};

 // ---- decay ------------------------------------------------------------------
 // holeFn multiplies its u by 4.5*scale internally, so a u normalised over a
 // 2 000 m profile eats holes hundreds of metres across. Feed it arc length over
 // 216, as Plymouth had to.
 const hfn=holeFn(d*.5,9613,null,1.5);
 const rot=(s,y)=>hfn?hfn(s/216,y):false;
 // THE SPALL. An elliptical bite high on the south face with a noisy edge. It is
 // on an UPPER face on purpose: a hole in a face that slopes up and away is
 // looked INTO and DOWN onto from the ground, so the floor plates behind it read
 // as a section; the same hole in a lower face shows you nothing but soffits.
 const SPX=175,SPW=135,SPT=.225,SPTH=.12;
 const spall=(x,t,sd)=>{if(!dd||sd<0)return false;
  const ex=(x-SPX)/SPW,et=(t-SPT)/SPTH;
  return Math.hypot(ex,et)<1+.42*(fbm(x*.014,t*11,9614,3)-.5)*2;};
 // and the crack down the flank above the leg that failed
 const CRX=430,CRZ=672;
 const crack=(x,t,sd)=>{if(!dd||sd<0||t<.5)return false;
  const w=8+34*(t-.5);
  return Math.abs(x-CRX)<w&&t>.56&&t<.93&&fbm(x*.03,t*14,9615,2)>.36;};
 // THE BROKEN CORNER. Everything within BR(x,phi) of the cube's south vertex
 // line (z = RD, y = CY) is gone, a radius growing from nothing at x = BX0 to
 // 365 m at the east end, with a noisy edge. phi is the angle round that vertex
 // line, +45 degrees along the upper face and -45 along the lower, so a point ON
 // a face and a point INSIDE the mass are tested by the same function and the
 // fracture surface built later lands exactly on the holes this cuts.
 const BRr=(x,ph)=>{if(!dd||x<BX0)return 0;const f=Math.min(1,(x-BX0)/(HX-BX0));
  return BRMAX*(.7+.3*Math.pow(f,1.3))*(1+.30*(fbm(x*.011,ph*2.2,9618,3)-.5)*2);};
 const biteP=(x,y,z)=>{if(!dd||z<=0||x<BX0)return false;
  const dz=RD-z,dy=y-CY;return Math.hypot(dz,dy)<BRr(x,Math.atan2(dy,Math.max(dz,1e-3)));};
 const bite=(x,t,sd)=>{if(!dd||sd<0)return false;const p=ZY(RD,t);return biteP(x,p[1],p[0]);};
 const gone=(x,t,sd)=>spall(x,t,sd)||crack(x,t,sd)||bite(x,t,sd);

 // ---- the light wells ---------------------------------------------------------
 const WX=k=>-420+k*140;
 const SPINEK=3;                          // the middle station is the spine
 const wellOf=x=>{for(let k=0;k<NWL;k++)if(k!==SPINEK&&Math.abs(x-WX(k))<WWX*.5)return k;return -1;};
 const inWell=(x,t)=>t>WT0&&t<WT1&&wellOf(x)>=0;
 const inSpine=x=>Math.abs(x)<SPW2;
 const inFrieze=t=>t<FTA||(t>FTE&&t<FTD);
 // the strips between the openings, where the ovals and the frieze triangles go
 const STRIPS=[];
 {const iv=[[-HX,-PIERX],[PIERX,HX],[-SPW2,SPW2]];
  for(let k=0;k<NWL;k++)if(k!==SPINEK)iv.push([WX(k)-WWX*.5,WX(k)+WWX*.5]);
  iv.sort((a,b)=>a[0]-b[0]);
  for(let i=1;i<iv.length;i++)if(iv[i][0]-iv[i-1][1]>5)STRIPS.push([iv[i-1][1],iv[i][0]]);}

 // ---- the palette --------------------------------------------------------------
 const tone=()=>new THREE.Color().setHSL(rr(.05,.13),rr(.04,.20),dd?rr(.13,.26):rr(.40,.72));
 const stone=()=>new THREE.Color().setHSL(rr(.06,.10),rr(.02,.10),dd?rr(.15,.25):rr(.46,.62));
 const deck=()=>new THREE.Color().setHSL(rr(.06,.10),rr(.02,.09),dd?rr(.11,.19):rr(.30,.42));
 const leafC=()=>new THREE.Color().setHSL(rr(.18,.34),rr(.16,.42),dd?rr(.12,.26):rr(.20,.34));
 const soilC=new THREE.Color(0x7d5f3c);
 const WARMW=new THREE.Color(0xffa957);
 const winC=p=>dd
   ?(rng()<.014?WARMW.clone().multiplyScalar(rr(.06,.15))
              :new THREE.Color(0x070a0f).multiplyScalar(rr(.5,1.9)))
   :(rng()<p?WARMW.clone().multiplyScalar(rr(.30,.80))
            :new THREE.Color(0x080e16).multiplyScalar(rr(.6,1.9)));
 const lit=(p,q2,s,c)=>{if(dd&&rng()>.08)return;kput('strip',p,q2,s,c||CYAN);};
 const person=(x,y,z)=>{if(dd)return;
  kput('figB',[x,y,z],qEuler(0,rng()*TAU,0),1,new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5)));
  kput('figH',[x,y,z],null,1,new THREE.Color(0xc9a17e));};
 const plant=(x,y,z,h)=>{kput('trunk',[x,y,z],qEuler(rr(-.05,.05),rng()*TAU,rr(-.05,.05)),
   [h*.16,h*.74,h*.16],new THREE.Color().setHSL(rr(.05,.10),rr(.2,.4),rr(.14,.28)));
  const s0=h*rr(.26,.38);
  kput('leafCard',[x+rr(-.08,.08)*h,y+h*.72,z+rr(-.08,.08)*h],
   qEuler(rr(-.07,.07),rng()*TAU,rr(-.07,.07)),[s0,s0*rr(.7,1.05),s0],leafC());};

 // ---- the registry --------------------------------------------------------------
 REGISTER({name:'Arcube ('+STATE(d)+')',x:0,z:0,r:920,h:HTT+70});
 REGISTER({name:'Arcube — the cube',x:0,z:0,y:KY,r:730,h:2*RD});
 REGISTER({name:'Arcube — residential',x:0,z:0,y:CY,r:715,h:RD});
 REGISTER({name:'Arcube — living-working',x:0,z:0,y:KY,r:715,h:RD});
 REGISTER({name:'Arcube — the city centre',x:-HX+50,z:0,r:330,y:CY-330,h:660});
 REGISTER({name:'Arcube — the cultural centre',x:HX-50,z:0,r:330,y:CY-330,h:660});
 REGISTER({name:'Arcube — the void',x:0,z:0,r:BR[4]+14,y:CY-BR[4]-8,h:2*BR[4]+16});
 REGISTER({name:'Arcube — the heliport',x:0,z:0,r:120,y:HTT-24,h:96});
 REGISTER({name:'Arcube — the keel',x:0,z:0,r:120,y:KY-96,h:130});
 for(const k of [0,2,6])for(const sd of [1,-1])
  REGISTER({name:'Arcube — light well '+(k+1)+(sd>0?' south':' north'),
   x:WX(k),z:sd*500,r:56,y:200,h:1000});
 for(const sd of [1,-1])REGISTER({name:'Arcube — the central spine, '+(sd>0?'south':'north'),
   x:0,z:sd*560,r:60,y:300,h:1000});
 for(const L of PIERS){if(dd&&L.x===FAILX&&L.z===FAILZ)continue;
  const top=L.c?CY-RD+L.hz:CY-(RD-Math.abs(L.z)-L.hz);
  REGISTER({name:'Arcube — '+(L.c?'keel pier':'pier')+', '+(L.x<0?'west ':L.x>0?'east ':'mid ')+
   (L.z<0?'north':L.z>0?'south':'axis')+' '+Math.abs(L.x),x:L.x,z:L.z,r:Math.max(L.hx,L.hz)*.9,h:top-30});}
 if(!dd)REGISTER({name:'Arcube — the heliport tower',x:HTX,z:HTZ,r:95,y:1000,h:HTTOP+60-1000});
 REGISTER({name:'Arcube — the ground works',x:0,z:0,r:900,h:26});
 if(dd){REGISTER({name:'Arcube — the spall',x:SPX,z:430,y:900,r:210,h:430});
  REGISTER({name:'Arcube — the fallen pier',x:CRX+120,z:CRZ+190,r:220,h:90});
  REGISTER({name:'Arcube — the broken corner',x:330,z:560,y:CY-300,r:230,h:600});
  REGISTER({name:'Arcube — the fallen heliport tower',x:HTX-10,z:-1020,r:230,h:120});}

 // ============================================================ THE SETTLED MASS
 // Everything that is the cube is built in P. Intact, P is the identity. In the
 // ruin it is turned BSAG (4 degrees) about a horizontal axis through the middle
 // of the piers, mostly about east-west, so the south-east corner, whose pier went, has come
 // down some 40 m and the ridge has swung 75 m south — the outline itself has changed,
 // which no amount of patching on an upright cube can do. useGroupXF() carries
 // every kput() through the same turn; lowY() hands the piers the settled face
 // to be mitred into.
 const P=new THREE.Group();G.add(P);
 {const PIV=new THREE.Vector3(0,420,0);
  if(BSAG){P.quaternion.setFromAxisAngle(new THREE.Vector3(1,0,-.5).normalize(),BSAG);
   P.position.copy(PIV).sub(PIV.clone().applyQuaternion(P.quaternion));}}
 P.updateMatrix();
 const PMI=P.matrix.clone().invert(), _pv=new THREE.Vector3();
 const lowY=(x,z)=>{let y=CY-(RD-Math.abs(z));
  for(let i=0;i<5;i++){_pv.set(x,y,z).applyMatrix4(PMI);y+=(CY-(RD-Math.abs(_pv.z)))-_pv.y;}return y;};
 useGroupXF(P);

 // ============================================================ THE FOUR SLOPING FACES
 // One q-offset function drives everything the envelope does: the storey relief,
 // the recessed loggias and the deep band under the equator. It is a function of
 // ARC LENGTH from the ridge, so the same 36.6 m tile that the wall texture is
 // scaled to is the tile the relief steps on, and the two cannot slide apart.
 //
 // THE LOGGIAS ARE RECESSES, NOT LEDGES. A 9 m balcony running the length of the
 // building projects 9 m past the diamond in the FRONT elevation and serrates the
 // outline at a dozen heights. Cutting the same 9 m inward gives the identical
 // horizontal line — stronger, in fact, because the reveal is painted shade —
 // and costs the silhouette nothing. Apollonian: the incident is inside.
 const TILE=36.6;                       // 7 storeys of 5.23 m slope = 3.7 m of rise
 const qoff=s=>{const b=s/TILE,f=b-Math.floor(b),bi=Math.floor(b);
  const eq=Math.abs(s-ARCL(RD,.5));
  if(eq<TILE*.92&&s>ARCL(RD,.5))return -17;    // the deep band under the equator
  return (bi%4===2?-12.7:0)+(f<.5?0:-.44);};
 const isLog=s=>{const bi=Math.floor(s/TILE);return bi%4===2;};
 // THE CORNER PIERS. The sheet's plan puts VERTICAL STRUCTURE at the four corners
 // of the midlevel rectangle, and the four corner legs stand exactly there — but
 // they are under the mass and invisible from above, so the structure has to be
 // expressed in the envelope as well. The outer 60 m at each end of all four
 // faces is a BLIND pier on mass concrete with no dwelling grid on it: in the
 // plan it is four structural bands at the corners, in the side elevation two
 // piers framing the housing, and it is what the corner legs run up into.
 const inPier=x=>Math.abs(x)>PIERX;
 // THE TWO CIVIC COURTS. The sheet's plan puts the CITY CENTER at one end of the
 // rectangle and the CULTURAL CENTER at the other, and the two end craters are
 // exactly that — but a crater in a vertical end face cannot be seen from
 // overhead, so from the plan the two ends would read no differently from the
 // middle. Each end therefore also opens a court 127 x 240 m and 24 m deep into
 // the upper faces, inboard of the corner pier: four of them, two a end, and in
 // the plan view they are the two civic ends the drawing asks for. Recessed, like
 // everything else here, so the envelope is untouched.
 const CQX0=305,CQX1=432,CQT0=.13,CQT1=.30,CQQ=RD-34;
 const inCourt=(x,t)=>t>CQT0&&t<CQT1&&Math.abs(x)>CQX0&&Math.abs(x)<CQX1;
 // The faces are built in SEGMENTS of t so the side elevation's bands start and
 // stop on exact lines instead of on whichever 18 m grid row they fall in:
 //   mode 0  the dwelling wall, everything but the blind piers and the spine
 //   mode 1  the blind piers and the spine, on mass concrete
 //   mode 2  the spine alone (where it crosses the equator bands)
 //   mode 3  a dark band at a fixed q (the two friezes)
 //   mode 4  a dark band that keeps the q relief (the oval band under the equator)
 // Each segment's v is shifted by its own start so the wall map's storey lines
 // stay on the same 36.6 m tile the relief steps on.
 const uvShift=(g,dv)=>{const a=g.attributes.uv;for(let i=0;i<a.count;i++)a.setY(i,a.getY(i)+dv);return g;};
 const faceSurf=(sd,t0,t1,nv,mode,qf)=>{
  const arc=ARCL(RD,t1-t0),mass=mode===1||mode===2,band=mode>=3;
  const tl=mass?12:band?25.6:TILE;
  return uvShift(gridSurface((u,v)=>{const x=lerp(-HX,HX,u),t=lerp(t0,t1,v);
    const s=ARCL(RD,t),p=ZY(mode===3?qf:RD+(mass?-1.6:qoff(s)),t);
    return[x,p[1],sd*p[0]];},NU,nv,
   {uS:ACSIDE/(mass?12:25.6),vS:arc/tl,
    hole:(u,v)=>{const x=lerp(-HX,HX,u),t=lerp(t0,t1,v),s=ARCL(RD,t);
     const keep=mode===0?!(inPier(x)||inSpine(x)):mode===1?(inPier(x)||inSpine(x)):mode===2?inSpine(x):!inSpine(x);
     return !keep||inWell(x,t)||inCourt(x,t)||gone(x,t,sd)||rot(s,CY+RD*(1-2*t));}}),ARCL(RD,t0)/tl);};
 // the step between a band at FQ and the wall beside it, at one t
 const bandStep=(sd,t,qa,qb)=>gridSurface((u,v)=>{const p=ZY(lerp(qa,qb,v),t);
   return[lerp(-HX,HX,u),p[1],sd*p[0]];},NU,1,{uS:ACSIDE/12,vS:.4,
   hole:(u,v)=>{const x=lerp(-HX,HX,u);return inSpine(x)||inWell(x,t)||gone(x,t,sd);}});
 for(const sd of [1,-1]){
  RES.push(faceSurf(sd,FTA,FTE,46,0));      MAS.push(faceSurf(sd,FTA,FTE,46,1));
  WRK.push(faceSurf(sd,FTD,TK,47,0));       MAS.push(faceSurf(sd,FTD,TK,47,1));
  MAS.push(faceSurf(sd,TA,FTA,3,2));        MAS.push(faceSurf(sd,FTE,FTD,12,2));
  SHD.push(faceSurf(sd,TA,FTA,3,3,FQ));     SHD.push(faceSurf(sd,FTE,.5,5,3,FQ));
  SHD.push(faceSurf(sd,.5,FTD,14,4));
  SHD.push(bandStep(sd,FTA,FQ,RD+qoff(ARCL(RD,FTA))));
  SHD.push(bandStep(sd,FTE,FQ,RD+qoff(ARCL(RD,FTE))));
  SHD.push(bandStep(sd,.5,FQ,RD-17));}
 // ---- THE TWO FRIEZES -------------------------------------------------------------
 // Downward triangles, pale on the dark band, standing 3 m off it so their tips
 // stop short of the envelope: fourteen even ones under the ridge, and on the
 // equator one to each strip of wall between the openings, as the sheet spaces
 // them between its panels.
 const tri=(x,w,tb,h,sd)=>{const p=ZY(FQ,tb),n=RAD(tb,sd);
  if(gone(x,tb+.004,sd)||(dd&&rng()<.12))return;
  kput('acTri',[x,p[1],sd*p[0]],qFacing([0,n[1],n[2]]),[w,h,3.2],stone());};
 for(const sd of [1,-1]){
  for(let k=0;k<14;k++){const x=-HX+(k+.5)*ACSIDE/14;tri(x,ACSIDE/14-8,TA+.003,ARCL(RD,FTA-TA)-9,sd);}
  for(const S2 of STRIPS){const w=S2[1]-S2[0];tri((S2[0]+S2[1])*.5,w-8,FTE+.003,ARCL(RD,.5-FTE)-10,sd);}
  for(const ex of [-1,1])tri(ex*(PIERX+HX)*.5,HX-PIERX-8,FTE+.003,ARCL(RD,.5-FTE)-10,sd);
  // a light line along the foot of each frieze
  if(!dd)for(const tt of [FTA-.002,.5-.004])for(let x=-HX+25;x<HX;x+=50){
   if(inSpine(x)||inWell(x,tt))continue;const p=ZY(FQ+.8,tt),n=RAD(tt,sd);
   kput('acPane',[x,p[1],sd*p[0]],qFacing([0,n[1],n[2]]),[46,2.2,1],CYAN);}}
 // ---- THE OVAL LIGHT WELLS ---------------------------------------------------------
 // The sheet's residential elevation is rows of ovals in dark panels, one to a
 // bay, between the horizontal loggia lines. A panel a step darker than the wall,
 // a pale collar and a black throat: at 2 km that is the drawing's figure, and
 // close to it is a collar 3 m deep round a shaft going down into the city.
 const OVROW=[165,311,457,604,750,884], OVLOW=1076;
 const inPanel=(x,s)=>{if(s>ARCL(RD,FTD))return false;
  for(const S2 of STRIPS)if(x>S2[0]+6&&x<S2[1]-6){
   for(const r of OVROW)if(Math.abs(s-r)<46)return true;}return false;};
 const oval=(x,s,w,sd,panel)=>{const t=s/(2*Math.SQRT2*RD),p=ZY(RD,t),n=RAD(t,sd);
  if(gone(x,t,sd))return;const qf=qFacing([0,n[1],n[2]]);
  if(panel)kput('acBox',[x,p[1]+n[1]*.6,sd*p[0]+n[2]*.6],qf,[w+22,86,1.4],deck());
  kput('acOvalRim',[x,p[1]+n[1]*.9,sd*p[0]+n[2]*.9],qf,[w,w*1.12,3.1],stone());
  kput('acOvalIn',[x,p[1]+n[1]*1.2,sd*p[0]+n[2]*1.2],qf,[w,w*1.12,1.3],null);
  if(!dd&&rng()<.5)kput('acPane',[x,p[1]+n[1]*2.8,sd*p[0]+n[2]*2.8],qf,[w*.46,w*.12,1],WARMW.clone().multiplyScalar(rr(.4,.8)));};
 for(const sd of [1,-1])for(const S2 of STRIPS){const xc=(S2[0]+S2[1])*.5,w=Math.min(46,S2[1]-S2[0]-26);
  for(const r of OVROW)oval(xc,r,w,sd,1);
  oval(xc,OVLOW,w*.86,sd,0);}
 // ---- THE CENTRAL SPINE -------------------------------------------------------------
 // Ridge to keel down the middle of both flanks, blind mass with a stack of lift
 // lobbies — round openings, lit at night — every 48 m of slope, and a vertical
 // light line either side. In the side elevation it is the one full-height
 // vertical the sheet draws, and at the bottom it runs into the middle pier.
 for(const sd of [1,-1]){
  for(let s=40;s<ARCL(RD,TK)-30;s+=48){const t=s/(2*Math.SQRT2*RD);
   if(gone(0,t,sd))continue;const p=ZY(RD-1.6,t),n=RAD(t,sd),qf=qFacing([0,n[1],n[2]]);
   kput('acOvalRim',[0,p[1]+n[1]*.3,sd*p[0]+n[2]*.3],qf,[30,30,2.6],stone());
   kput('acOvalIn',[0,p[1]+n[1]*.6,sd*p[0]+n[2]*.6],qf,[30,30,1],null);
   if(!dd&&rng()<.6)kput('acPane',[0,p[1]+n[1]*2.2,sd*p[0]+n[2]*2.2],qf,[12,5,1],WARMW.clone().multiplyScalar(rr(.4,.85)));}
  for(const sx of [-1,1]){const pa=ZY(RD-1.6,TA+.01),pb=ZY(RD-1.6,.5),pc=ZY(RD-1.6,TK-.01);
   for(const seg of [[pa,pb,TA+.2],[pb,pc,.8]]){const n=RAD(seg[2],sd);
    const A=[sx*(SPW2-3),seg[0][1]+n[1]*1.5,sd*seg[0][0]+n[2]*1.5],B=[sx*(SPW2-3),seg[1][1]+n[1]*1.5,sd*seg[1][0]+n[2]*1.5];
    if(dd&&(biteP(A[0],A[1],A[2])||biteP(B[0],B[1],B[2])))continue;
    beam('acBox',A,B,3.4,3.4,stone());
    if(!dd)kput('strip',[sx*(SPW2-7),(A[1]+B[1])*.5+n[1]*.5,(A[2]+B[2])*.5+n[2]*.5],
      QX([0,B[1]-A[1],B[2]-A[2]]),[Math.hypot(B[1]-A[1],B[2]-A[2]),12,12],CYAN);}}}
 // ---- THE SLOT RHYTHM of the living-working faces -----------------------------------
 // Tall pale fins down the lower faces, three to a bay, so the band under the
 // equator reads as the sheet's vertical slot bays and not as a grid.
 for(const sd of [1,-1])for(const S2 of STRIPS){const w=S2[1]-S2[0];
  for(let j=1;j<4;j++){const x=S2[0]+w*j/4;
   const ta=FTD+.006,tb=TK-.03,pa=ZY(RD+.6,ta),pb=ZY(RD+.6,tb);
   if(gone(x,(ta+tb)*.5,sd)||gone(x,ta+.02,sd)||gone(x,tb-.02,sd))continue;
   beam('acBox',[x,pa[1],sd*pa[0]],[x,pb[1],sd*pb[0]],3.2,4.4,stone());}}
 // the pier's own rustication: a deep course every 55 m, which is the only relief
 // it gets and the thing that keeps 700 m of blind concrete from reading as card
 for(const sd of [1,-1])for(const ex of [-1,1])
  for(let t=TA+.02;t<TK-.02;t+=55/(2*Math.SQRT2*RD)){
   const p=ZY(RD,t);
   if(gone(ex*470,t,sd)||inFrieze(t))continue;
   kput('acBox',[ex*470,p[1],sd*(p[0]+1.4)],qFacing([0,0,sd]),[58,3.2,3.4],stone());}
 for(const sd of [1,-1])for(let x=-HX+13;x<HX-12;x+=26){
  if(gone(x,.5,sd))continue;
  const p=ZY(RD,.5);
  kput('acBox',[x,p[1]-1,sd*(p[0]+1.6)],qFacing([0,0,sd]),[26,7,7],stone());
  kput('acBox',[x,p[1]-7.5,sd*(p[0]+3.4)],qFacing([0,0,sd]),[26,4,4],deck());
  if(!dd&&x%78<26)kput('acPane',[x,p[1]-4.4,sd*(p[0]+5.2)],qFacing([0,0,sd]),[24,2.6,1],CYAN);}
 // ---- the civic courts ----------------------------------------------------------
 for(const sd of [1,-1])for(const ex of [-1,1]){
  const x0=ex<0?-CQX1:CQX0,x1=ex<0?-CQX0:CQX1;
  DEK.push(gridSurface((u,v)=>{const p=ZY(CQQ,lerp(CQT0,CQT1,v));
    return[lerp(x0,x1,u),p[1],sd*p[0]];},10,14,{uS:(x1-x0)/25.6,vS:(CQT1-CQT0)*2*Math.SQRT2*RD/25.6}));
  for(const sx of [0,1])SHD.push(gridSurface((u,v)=>{const p=ZY(lerp(RD,CQQ,v),lerp(CQT0,CQT1,u));
    return[sx?x1:x0,p[1],sd*p[0]];},14,3,{uS:12,vS:3}));
  for(const st of [CQT0,CQT1])SHD.push(gridSurface((u,v)=>{const p=ZY(lerp(RD,CQQ,v),st);
    return[lerp(x0,x1,u),p[1],sd*p[0]];},10,3,{uS:12,vS:3}));
  // what stands in them: the great halls of the two civic ends
  const tc=(CQT0+CQT1)*.5;
  for(let j=0;j<5;j++){const t=lerp(CQT0+.022,CQT1-.022,(j+.5)/5),p=ZY(CQQ,t);
   const hh=rr(16,30),wd=rr(46,92);
   if(dd&&rng()<.4)continue;
   kput('acBox',[(x0+x1)*.5+rr(-14,14),p[1]+hh*.42,sd*(p[0]+hh*.42)],qFacing([0,0,sd]),
    [wd,hh,rr(20,34)],stone());
   kput('acPane',[(x0+x1)*.5,p[1]+hh*.5,sd*(p[0]+hh*.5+17)],qFacing([0,0,sd]),[wd*.7,hh*.5,1],winC(.85));
   if(!dd)kput('strip',[(x0+x1)*.5,p[1]+hh+2,sd*(p[0]+hh+2)],null,[wd*.8,14,14],CYAN);
   for(let q2=0;q2<3;q2++)person((x0+x1)*.5+rr(-50,50),p[1]-1,sd*(p[0]-1+rr(-8,8)));}
  const pc=ZY(CQQ,tc);
  if(!dd)kput('finial',[(x0+x1)*.5,pc[1]+26,sd*(pc[0]+26)],null,[9,22,9],null);}

 // ---- what lives in the loggias -------------------------------------------------
 // A dark soffit over each, a pale deck under it, a balustrade on the lip and a
 // light strip along the back. Walked at 30 m so a 1 000 m loggia is 33 bays.
 for(const sd of [1,-1])for(let bi=2;bi*TILE<ARCL(RD,TK);bi+=4){
  const sMid=(bi+.5)*TILE, tMid=sMid/(2*Math.SQRT2*RD);
  if(tMid<TA+.01||tMid>TK-.01||inFrieze(tMid))continue;
  const pIn=ZY(RD-12.7,tMid), pT=ZY(RD,tMid-TILE*.5/(2*Math.SQRT2*RD)),
        pB=ZY(RD,tMid+TILE*.5/(2*Math.SQRT2*RD));
  const yT=pT[1],yB=pB[1],zT=sd*pT[0],zB=sd*pB[0],zI=sd*pIn[0],yI=pIn[1];
  const upper=tMid<.5;
  for(let x=-HX+9;x<HX-8;x+=18){
   if(inPier(x)||inSpine(x)||inWell(x,tMid)||gone(x,tMid,sd)||biteP(x,yI,zI))continue;
   const dp=Math.abs(zT-zI)+2;
   kput('acDim',[x,(yT+yI)*.5+3,(zT+zI)*.5],null,[18,3.4,dp],null);      // the soffit
   kput('acBox',[x,(yB+yI)*.5-1.4,(zB+zI)*.5],null,[18,2.8,dp],deck());  // the deck
   kput('acBox',[x,(yB+yI)*.5+1.6,zB-sd*1.2],null,[18,2.4,1.8],stone()); // the lip
   kput('acPane',[x,(yB+yI)*.5+3.4,(zB+zI)*.5-sd*dp*.42],qFacing([0,0,sd]),[16,4.2,1],winC(.55));
   if(!dd&&x%54<18)lit([x,yI+(upper?4:-4),zI+sd*2.2],null,[18,16,16],CYAN);
   if(upper&&rng()<.16)plant(x+rr(-7,7),(yB+yI)*.5,(zB+zI)*.5+sd*rr(-4,4),rr(5,9));
   if(rng()<.13)person(x+rr(-8,8),(yB+yI)*.5,(zB+zI)*.5+sd*rr(-3,3));}}

 // ---- balconies on the field between the loggias ---------------------------------
 // What the texture cannot do. Every other 6.4 m frontage on every sixth storey
 // of the residential faces, which at 45 degrees is a real terraced section
 // rather than a shelf stuck on a wall.
 for(const sd of [1,-1]){
  for(let t=FTA+.006;t<FTE;t+=TILE*.86/(2*Math.SQRT2*RD)){
   const s=ARCL(RD,t);if(isLog(s))continue;
   const p=ZY(RD,t);
   const nn=RAD(t,sd);
   for(let x=-HX+5;x<HX-4;x+=7.4){
    if(inPier(x)||inSpine(x)||inWell(x,t)||inPanel(x,s)||gone(x,t,sd)||(dd&&rng()<.34))continue;
    kput('acBalc',[x,p[1]-1.6,sd*p[0]],qFacing([0,0,sd]),[5.6,1.5,rr(2.2,3.4)],tone());
    kput('acPane',[x,p[1]+nn[1]*.6,sd*p[0]+nn[2]*.6],qFacing([0,nn[1],nn[2]]),
     [4.4,2.4,1],winC(.30));
    if(rng()<.5){const p2=ZY(RD,t+9/(2*Math.SQRT2*RD));
     kput('acPane',[x,p2[1]+nn[1]*.6,sd*p2[0]+nn[2]*.6],qFacing([0,nn[1],nn[2]]),
      [4.4,2.2,1],winC(.26));}}}
  // and louvre banks on the living-working faces, which are plant, not homes
  for(let t=FTD+.008;t<TK;t+=TILE*1.7/(2*Math.SQRT2*RD)){
   const s=ARCL(RD,t);if(isLog(s))continue;
   const p=ZY(RD,t);
   const nw2=RAD(t,sd);
   for(let x=-HX+8;x<HX-7;x+=15){
    if(inPier(x)||inSpine(x)||inWell(x,t)||gone(x,t,sd)||(dd&&rng()<.4))continue;
    if(rng()<.55)kput('acLouvre',[x,p[1],sd*(p[0]+.4)],qFacing([0,0,sd]),[13,7,2.6],stone());
    else kput('acPane',[x,p[1]+nw2[1]*.6,sd*p[0]+nw2[2]*.6],qFacing([0,nw2[1],nw2[2]]),
     [11,4.2,1],winC(.5));
    if(rng()<.18)kput('acDim',[x,p[1]+nw2[1]*1.2,sd*p[0]+nw2[2]*1.2],qFacing([0,nw2[1],nw2[2]]),
     [7,9,2.4],null);}}}

