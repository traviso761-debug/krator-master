// ================================================================= LONGSONG — the people (the life layer's scaffold)
// [draw] Every person is a record of the plan (LS.PEOPLE: faction, sub-faction, job, a schedule of 24 activities); where
// they are at an hour is the plan's answer (LS.whereAt), never decided here. This fragment draws them as robed figures
// (placeholders until core/charactermodels dresses the Order: KNOWN_ISSUES.md) and animates what each activity looks like:
//   DRILL     the operatives' forms at lightning speed, each strike leaving its afterimages (three ghosts, fading)
//   the master of arms in the drill ground's middle: still, and every few seconds he is simply somewhere else (an
//             afterimage left where he stood), and the petals falling round him stop in the air within his reach
//   DEBATE    the questioner stands and claps the point home; the defender sits
//   KORA      walking the circuit clockwise; TURN_WHEEL the keepers walking the Procrastinator round, pushing its handles
const PEOPLE_DRAWN=(function(){
 const N=LS.PEOPLE.length,DRESS={monk:[0x7a2a22,0xe0a030],novice:[0x9a4030,0xd8b060],operative:[0x2e3a4e,0xe0a030],master:[0xd8962a,0x7a2a22],
  keeper:[0x2a2a30,0x2e5a9c],warden:[0x24406e,0x8e2f24],servant:[0x6e5a40,0xb0a080],pilgrim:[0x4a6a8a,0xc04a3a]};
 const robeG=new THREE.CylinderGeometry(.17,.34,1.42,10,1);robeG.translate(0,.71,0);
 const headG=new THREE.SphereGeometry(.12,10,8);headG.translate(0,1.58,0);
 const armG=new THREE.CylinderGeometry(.055,.045,.62,6,1);armG.translate(0,-.31,0);   // hangs from the shoulder: rotate it to strike
 const sashG=new THREE.CylinderGeometry(.2,.24,.12,10,1,true);sashG.translate(0,.98,0);
 const staffG=new THREE.CylinderGeometry(.025,.025,1.9,5,1);staffG.translate(0,.95,0);
 const mat=()=>new THREE.MeshLambertMaterial({color:0xffffff});
 const mk=(g,n,m)=>{const im=new THREE.InstancedMesh(g,m||mat(),n);im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.userData.people=true;im.userData.host=true;im.userData.cls='life';im.frustumCulled=false;scene.add(im);return im;};
 const robe=mk(robeG,N),head=mk(headG,N),arm=mk(armG,2*N),sash=mk(sashG,N),staff=mk(staffG,N);
 robe.userData.inspectLabel=head.userData.inspectLabel=arm.userData.inspectLabel=sash.userData.inspectLabel='A person of Longsong';staff.userData.inspectLabel='A warden\'s staff';
 // the afterimages: three ghosts of each operative's robe and arms, fading
 const GH=3,ghostM=k=>new THREE.MeshBasicMaterial({color:0x6a8ac8,transparent:true,opacity:.34-k*.1,depthWrite:false});
 const OPS=LS.PEOPLE.map((P,i)=>i).filter(i=>LS.PEOPLE[i].role==='operative'||LS.PEOPLE[i].role==='master');
 const gRobe=[],gArm=[];for(let k=0;k<GH;k++){gRobe.push(mk(robeG,OPS.length,ghostM(k)));gArm.push(mk(armG,2*OPS.length,ghostM(k)));}
 gRobe.concat(gArm).forEach(m=>{m.userData.inspectLabel='An afterimage (a strike faster than the eye)';m.renderOrder=5;});
 const C=new THREE.Color();
 LS.PEOPLE.forEach((P,i)=>{const d=DRESS[P.dress]||DRESS.monk,u=KRAND.unit(KRAND.hash(P.seed,3));
  const L=h=>new THREE.Color(h).convertSRGBToLinear();
  C.copy(L(d[0]));if(P.dress==='pilgrim')C.setHSL(u,.35,.38).convertSRGBToLinear();robe.setColorAt(i,C);arm.setColorAt(2*i,C);arm.setColorAt(2*i+1,C);sash.setColorAt(i,L(d[1]));
  C.setHSL(.07,.35,.36+u*.16).convertSRGBToLinear();head.setColorAt(i,C);staff.setColorAt(i,L(P.role==='warden'?0x5a3a20:0x000000));});
 [robe,head,arm,sash,staff].forEach(m=>{if(m.instanceColor)m.instanceColor.needsUpdate=true;});
 // where each one stands, per hour (the plan's), and the ground's height there
 const S=LS.PEOPLE.map(()=>({x:0,y:-1e4,z:0,ry:0,act:null,place:null,shown:false}));
 const yOf=(pl,x,z)=>pl.y==='rock'?LS.ROCK.top:pl.y==='ward'?terrainH(x,z):typeof pl.y==='number'?pl.y:terrainH(x,z);
 function place(h){let shown=0;LS.PEOPLE.forEach((P,i)=>{const w=LS.whereAt(P,h),s=S[i];s.act=w.activity;s.place=w.place;s.shown=!w.indoor&&!!w.place;
   if(s.shown){s.x=w.x;s.z=w.z;s.y=yOf(w.place,w.x,w.z);shown++;
    // facing: the drill faces the master; debaters face their partner; the rest face the place's middle
    const pl=w.place;s.ry=pl.x!=null?Math.atan2(pl.x-w.x,pl.z-w.z):0;}});
  out.shown=shown;}
 const out={shown:0,place,S};
 // the master of arms (the first master) stands in the drill ground's middle
 const MASTER=LS.PEOPLE.findIndex(P=>P.role==='master');
 const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),V=new THREE.Vector3(),SC=new THREE.Vector3(1,1,1),HIDE=new THREE.Matrix4().makeScale(0,0,0);
 const setM=(im,k,x,y,z,ry,rx,rz,sy)=>{E.set(rx||0,ry,rz||0,'YXZ');Q.setFromEuler(E);V.set(x,y,z);SC.set(1,sy||1,1);M4.compose(V,Q,SC);im.setMatrixAt(k,M4);};
 // the pose: body (x,y,z,ry,crouch) and each arm's swing (forward pitch) and spread (roll), from the activity and time
 function pose(i,t,s,o){const P=LS.PEOPLE[i],ph=KRAND.unit(KRAND.hash(P.seed,5))*6.28;o.x=s.x;o.y=s.y;o.z=s.z;o.ry=s.ry;o.sy=1;o.a0=0;o.a1=0;o.r0=.12;o.r1=-.12;
  if(s.act==='DRILL'){if(i===MASTER){o.ry=s.ry+Math.sin(t*.2)*.3;o.a0=-.3;o.a1=-.3;return o;}
   // the forms: a strike every 0.16 s, the stance turning, the step; the speed is the point
   const f=t*6.2+ph,k=Math.floor(f),fr=f-k,side=k%2,strike=Math.sin(Math.min(1,fr*2.2)*Math.PI);
   o.ry=s.ry+[0,.6,-.6,1.4,-1.4,0][k%6]*.5;o.y=s.y-.18*Math.abs(Math.sin(f*Math.PI))*.6;o.sy=.92+.08*Math.cos(f*6.28);
   o.x=s.x+Math.sin(o.ry)*.35*strike;o.z=s.z+Math.cos(o.ry)*.35*strike;
   if(side){o.a0=-1.55*strike;o.a1=-.4;}else{o.a1=-1.55*strike;o.a0=-.4;}o.r0=.12+.5*(k%3===2?strike:0);return o;}
  if(s.act==='DEBATE'){const q=KRAND.unit(KRAND.hash(P.seed,7))<.5;if(q){const c=Math.max(0,Math.sin(t*1.3+ph));o.a0=-1.2*c-.2;o.a1=-1.1*c-.2;o.r0=.4*c;o.r1=-.4*c;}else{o.sy=.55;o.y=s.y;}return o;}
  if(s.act==='KORA'||s.act==='PILGRIM'&&false){const K=LS.KORA,sp=1.1/Math.max(K.a,K.b),a0=Math.atan2((s.z-K.cz)/K.b,(s.x-K.cx)/K.a),a=a0-t*sp;   // clockwise seen from above
   o.x=K.cx+Math.cos(a)*K.a;o.z=K.cz+Math.sin(a)*K.b;o.y=terrainH(o.x,o.z);o.ry=Math.atan2(Math.sin(a)*K.a,-Math.cos(a)*K.b);const st=Math.sin(t*5+ph);o.a0=.3*st;o.a1=-.3*st;return o;}
  if(s.act==='TURN_WHEEL'){const Pr=LS.PROCRASTINATOR,R=Pr.wheelR+4.2,a=t*Pr.turn+KRAND.unit(KRAND.hash(P.seed,9))*6.28;
   o.x=Pr.x+Math.cos(-a)*R;o.z=Pr.z+Math.sin(-a)*R;o.y=Pr.y0+1.4;o.ry=-a+Math.PI;o.a0=-1.3;o.a1=-1.3;return o;}
  if(s.act==='GUARD'){o.a1=-.5;return o;}
  return o;}
 const o={},go={};
 // the master's step through time: every 5-7 s he is elsewhere within 9 m; the place he left keeps his afterimage 2 s
 const MS={x:0,z:0,from:null,at:-10,next:3};
 function tick(dt,t){
  for(let i=0;i<N;i++){const s=S[i];
   if(!s.shown){robe.setMatrixAt(i,HIDE);head.setMatrixAt(i,HIDE);sash.setMatrixAt(i,HIDE);staff.setMatrixAt(i,HIDE);arm.setMatrixAt(2*i,HIDE);arm.setMatrixAt(2*i+1,HIDE);continue;}
   pose(i,t,s,o);
   if(i===MASTER&&s.act==='DRILL'){if(t>MS.next){MS.from={x:o.x+MS.x,z:o.z+MS.z,t};const S2=KRAND.stream(KRAND.hash(211,Math.floor(t)));MS.x=S2.range(-9,9);MS.z=S2.range(-6,6);MS.at=t;MS.next=t+S2.range(5,7);}
    o.x+=MS.x;o.z+=MS.z;o.y=terrainH(o.x,o.z);MASTER_AT.set(o.x,o.y,o.z);}
   setM(robe,i,o.x,o.y,o.z,o.ry,0,0,o.sy);setM(sash,i,o.x,o.y,o.z,o.ry,0,0,o.sy);setM(head,i,o.x,o.y+(o.sy-1)*1.42,o.z,o.ry);
   const sx=Math.cos(o.ry),sz=-Math.sin(o.ry),hy=o.y+1.36*o.sy;
   setM(arm,2*i,o.x+sx*.22,hy,o.z+sz*.22,o.ry,o.a0,o.r0);setM(arm,2*i+1,o.x-sx*.22,hy,o.z-sz*.22,o.ry,o.a1,o.r1);
   if(LS.PEOPLE[i].role==='warden')setM(staff,i,o.x+sx*.35,o.y,o.z+sz*.35,o.ry);else staff.setMatrixAt(i,HIDE);}
  // the afterimages: each operative's pose a moment ago (and the master's where he was)
  OPS.forEach((i,j)=>{const s=S[i];for(let k=0;k<GH;k++){
   if(!s.shown||s.act!=='DRILL'){gRobe[k].setMatrixAt(j,HIDE);gArm[k].setMatrixAt(2*j,HIDE);gArm[k].setMatrixAt(2*j+1,HIDE);continue;}
   if(i===MASTER){const F=MS.from;if(F&&t-F.t<2&&k===0){setM(gRobe[k],j,F.x,terrainH(F.x,F.z),F.z,s.ry);gArm[k].setMatrixAt(2*j,HIDE);gArm[k].setMatrixAt(2*j+1,HIDE);}
    else{gRobe[k].setMatrixAt(j,HIDE);gArm[k].setMatrixAt(2*j,HIDE);gArm[k].setMatrixAt(2*j+1,HIDE);}continue;}
   pose(i,t-(k+1)*.035,s,go);setM(gRobe[k],j,go.x,go.y,go.z,go.ry,0,0,go.sy);const sx=Math.cos(go.ry),sz=-Math.sin(go.ry),hy=go.y+1.36*go.sy;
   setM(gArm[k],2*j,go.x+sx*.22,hy,go.z+sz*.22,go.ry,go.a0,go.r0);setM(gArm[k],2*j+1,go.x-sx*.22,hy,go.z-sz*.22,go.ry,go.a1,go.r1);}});
  [robe,head,arm,sash,staff].concat(gRobe,gArm).forEach(m=>{m.instanceMatrix.needsUpdate=true;});
  PETALS.mat.uniforms.uT.value=t;PETALS.mat.uniforms.uM.value.copy(MASTER_AT);}
 const MASTER_AT=new THREE.Vector3(LS.DRILL.x,0,LS.DRILL.z);
 // the petals over the drill ground: falling and drifting, except within the master's reach, where they hang
 const PETALS=(function(){const n=900,pos=new Float32Array(n*3),ph=new Float32Array(n),St=KRAND.stream(223),D=LS.DRILL,y0=LS.wardY(D.z);
  for(let i=0;i<n;i++){pos[i*3]=D.x+St.range(-D.w*.6,D.w*.6);pos[i*3+1]=y0+St.range(0,9);pos[i*3+2]=D.z+St.range(-D.d*.6,D.d*.6);ph[i]=St.range(0,100);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('aPh',new THREE.BufferAttribute(ph,1));
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uT:{value:0},uM:{value:new THREE.Vector3()},uY0:{value:y0},uL:LS_LIGHT},
   vertexShader:'uniform float uT,uY0;uniform vec3 uM;attribute float aPh;varying float vS;void main(){vec3 p=position;'+
    // the petal's own clock runs slow inside the master's reach (3.2 m): it is time that stops, not the petal
    'float d=distance(p.xz,uM.xz);float k=smoothstep(1.6,3.4,d);vS=k;float t=aPh+uT*mix(0.0004,1.0,k);'+
    'float fall=mod(t*0.55,9.0);p.y=uY0+9.0-fall;p.x+=sin(t*1.3+aPh)*0.6;p.z+=cos(t*1.1+aPh*1.7)*0.6;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(60.0/-mv.z,1.5,7.0);}',
   fragmentShader:'uniform float uL;varying float vS;void main(){vec2 d=gl_PointCoord-0.5;float a=smoothstep(0.5,0.2,length(d*vec2(1.0,1.8)));gl_FragColor=vec4(mix(vec3(0.75,0.85,1.0),vec3(1.0,0.78,0.82),vS)*uL,a);}'});
  const pts=new THREE.Points(g,mat);pts.userData.people=true;pts.userData.inspectLabel='Cherry petals over the drill ground (round the master they stop in the air)';pts.frustumCulled=false;scene.add(pts);return {pts,mat};})();
 place(12);
 TICKS.push(tick);
  // the people in core/tags: one item set (class life), each person an instance whose position is read live from the
 // drawn robe (core/tags/README.md, "Item sets": a moving thing's instance answers where it is now); who each one is
 // (faction, sub-faction, job, schedule) is the plan's record, LS.PEOPLE[i]. Not in the probe's volumes: they move.
 const T=BIO.tagReg&&BIO.tagReg();out.set=null;
 if(T){const A=robe.instanceMatrix.array;try{out.set=T.addSet({'class':'life',kind:'person',key:'longsong_people',name:'The people of Longsong',at:[0,0,0],tags:{culture:'order'}},
   {get n(){return N;},pos(i,o){o=o||[];o[0]=A[i*16+12];o[1]=A[i*16+13];o[2]=A[i*16+14];return o;},ry(i){return S[i].ry;}});}catch(e){reportErr('people: '+e.message);}}
 out.ROLE={monk:'A monk of the Order',novice:'A novice',operative:'An operative from Keepwell, in training',master:'A master of arms',keeper:'A keeper of the Vault',warden:'A warden',servant:'A lay servant',pilgrim:'A pilgrim'};
 // which person a picked instance is: the robe, head, sash and staff by their index, the arms by half theirs, a ghost by the operatives' list
 out.personOf=(o,id)=>{if(id==null)return null;if(o===robe||o===head||o===sash||o===staff)return LS.PEOPLE[id];if(o===arm)return LS.PEOPLE[id>>1];
  if(gRobe.indexOf(o)>=0)return LS.PEOPLE[OPS[id]];if(gArm.indexOf(o)>=0)return LS.PEOPLE[OPS[id>>1]];return null;};
 out.records=N;
 return out;})();
function placePeople(h){PEOPLE_DRAWN.place(h);}
_mark('people');
