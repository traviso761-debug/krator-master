// ================================================================= RIDE LAB — the scene: the gallery, the cars, the people
// [web] Stand-ins drawn from the world's records: each segment's trackbed, rails and platforms, the fall between the
// segments and the cavern round it, the towns' floors; each car a group of boxes posed every frame by SIM.rideCarPose
// (its doors' leaves slide with the door window); the travellers and porters as instanced figures at SIM.pose, a crate
// on a porter's back while the porters' carrier is on its way.
const scene=new THREE.Scene();scene.background=new THREE.Color(0x101216);scene.fog=new THREE.Fog(0x101216,180,1600);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,5000);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd8dce8,0x2a2622,0.85));{const d=new THREE.DirectionalLight(0xfff2dc,0.55);d.position.set(300,500,-200);scene.add(d);}
const LAB={mats:{},cars:[],lamp:null};
const mat=(c,o)=>LAB.mats[c]||(LAB.mats[c]=new THREE.MeshLambertMaterial(Object.assign({color:c},o||{})));
function box(x0,x1,y0,y1,z0,z1,c,parent,name){const m=new THREE.Mesh(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0),mat(c));m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);if(name)m.name=name;(parent||scene).add(m);return m;}
const labGround=()=>-0.4;
box(-200,2300,-0.6,-0.4,-200,60,0x2a2724,null,'rock floor');
RL.L.seg.forEach(S=>{
  box(S.x0,S.x1,-0.4,0,-1.65,6,0x47423c,null,'trackbed '+S.id);
  [-0.8,0.8].forEach(z=>box(S.x0,S.x1,0,0.16,z-0.04,z+0.04,0x9a9590,null,'rail'));
  box(S.x0,S.x1,0,0.12,5,5.1,0x6a5a3a,null,'second track (cold)');
  /* the gallery's far wall and its lamps in a row, the Line's lamp code */
  box(S.x0,S.x1,0,12,8,9,0x34312d,null,'gallery wall');
  for(let x=S.x0+10;x<S.x1;x+=40)box(x-0.4,x+0.4,10.5,11,7.6,8,0xffe7a8,null,'lamp');
  S.stops.forEach(st=>{const x=RL.L.stops[st.id].x;
    box(x-35,x+35,0,1.1,-6,-1.65,0x8c8478,null,'platform '+st.id);
    box(x-35,x+35,1.1,1.14,-1.85,-1.65,0xd8c040,null,'platform edge');
    box(x-1.2,x+1.2,0,1.1,-14,-6,0x6c665c,null,'stair '+st.id);
    for(let dx=-30;dx<=30;dx+=12)box(x+dx-0.3,x+dx+0.3,1.1,6,-6.6,-6,0x5a544c,null,'column');});});
/* the fall between the segments, and the cavern walked round it */
box(1000,1100,0,9,-6,9,0x3c3732,null,'the fall');
for(let i=1;i<RL.L.cavern.length;i++){const a=RL.L.cavern[i-1],b=RL.L.cavern[i],L=Math.hypot(b[0]-a[0],b[2]-a[2]),m=new THREE.Mesh(new THREE.BoxGeometry(4,0.3,L),mat(0x5a4e40));
  m.position.set((a[0]+b[0])/2,(a[1]+b[1])/2-0.15,(a[2]+b[2])/2);m.rotation.order='YXZ';m.rotation.y=Math.atan2(b[0]-a[0],b[2]-a[2]);m.rotation.x=-Math.atan2(b[1]-a[1],L);m.name='cavern path';scene.add(m);}
['ledge','twenny'].forEach(id=>{const x=RL.L.stops[id].x;box(x-30,x+30,-0.4,0,-60,-14,0x4c4438,null,'town '+id);
  for(let k=0;k<5;k++)box(x-26+k*11,x-19+k*11,0,4,-58,-50,0x7a6650,null,'house');});
/* the cars: a floor, the walls with their door openings, the ends, a roof drawn only from outside, seats, door leaves */
const CAR=RIDELAB.CAR,HL=CAR.len/2,HW=1.3,FY=CAR.floorY,WY=FY+CAR.wallH;
RL.L.sources.forEach(S=>S.cars.forEach(C=>{const g=new THREE.Group();g.name=S.id+'.car'+C.k;g.rotation.order='YXZ';
  box(-HW,HW,0.5,FY,-HL,HL,0x5e6670,g,'car floor');
  box(-HW-0.15,HW+0.15,0.15,0.5,-HL+1.5,-HL+3.5,0x2a2a2a,g,'bogie');box(-HW-0.15,HW+0.15,0.15,0.5,HL-3.5,HL-1.5,0x2a2a2a,g,'bogie');
  [1,-1].forEach(side=>{const x0=side>0?HW:-HW-0.15,x1=side>0?HW+0.15:-HW,cuts=[-HL,-4.1,-2.9,2.9,4.1,HL];
    for(let j=0;j<cuts.length-1;j++){if(j===1||j===3){box(x0,x1,FY+2.0,WY,cuts[j],cuts[j+1],0xc8ccd0,g,'door head');continue;}
      box(x0,x1,FY,FY+0.9,cuts[j],cuts[j+1],0xc8ccd0,g,'car side');box(x0,x1,FY+1.7,WY,cuts[j],cuts[j+1],0xc8ccd0,g,'car side');
      const gl=box(x0,x1,FY+0.9,FY+1.7,cuts[j],cuts[j+1],0x86a8c0,g,'window');gl.material=new THREE.MeshLambertMaterial({color:0x86a8c0,transparent:true,opacity:0.35});}});
  box(-HW-0.15,HW+0.15,FY,WY,-HL-0.15,-HL,0xb0b4b8,g,'car end');box(-HW-0.15,HW+0.15,FY,WY,HL,HL+0.15,0xb0b4b8,g,'car end');
  const roof=box(-HW-0.15,HW+0.15,WY,WY+0.25,-HL-0.15,HL+0.15,0xa8823a,g,'roof');
  box(-HW-0.15,HW+0.15,FY+0.2,FY+0.5,-HL-0.15,-HL,0x3a6a4a,g,'livery');
  CAR.seats.forEach(s=>box(s.at[0]-0.25,s.at[0]+0.25,FY,FY+0.45,s.at[2]-0.25,s.at[2]+0.25,0x7a4a32,g,'seat'));
  const leaves={};CAR.doors.forEach(D=>{const x0=D.side>0?HW:-HW-0.12,x1=D.side>0?HW+0.12:-HW;
    const l=box(x0,x1,FY,FY+2.0,D.at[2]-0.6,D.at[2],0x6a7078,g,'door leaf '+D.id),r=box(x0,x1,FY,FY+2.0,D.at[2],D.at[2]+0.6,0x6a7078,g,'door leaf '+D.id);
    leaves[D.id]={l,r,z:D.at[2],open:0};});
  scene.add(g);LAB.cars.push({src:S.id,k:C.k,g,roof,leaves});}));
/* the people: travellers in ochre, porters in rust, a crate on a porter's back while the carrier is on its way */
LAB.ids=RL.people.map(a=>a.id).concat(RL.shift.map(a=>a.id),RL.L.porters.crew);
LAB.fig=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.22,0.26,1.6,8).translate(0,0.8,0),mat(0xffffff),LAB.ids.length);LAB.fig.name='people';
{const col=new THREE.Color();LAB.ids.forEach((id,i)=>LAB.fig.setColorAt(i,col.set(id.indexOf('porter')>=0?0xb4552e:id.indexOf('shift')===0?0x5a9ad8:0xe0b050)));}
LAB.crate=new THREE.InstancedMesh(new THREE.BoxGeometry(0.6,0.5,0.5),mat(0x9a7a4a),RL.L.porters.crew.length);LAB.crate.name='crates';
scene.add(LAB.fig,LAB.crate);
const labM=new THREE.Matrix4(),labQ=new THREE.Quaternion(),labE=new THREE.Euler(),labV=new THREE.Vector3(),labS=new THREE.Vector3(1,1,1),labSit=new THREE.Vector3(1,0.7,1);
function labDraw(t,dt,eye){
  LAB.cars.forEach(c=>{const P=SIM.rideCarPose(c.src,c.k,t);c.g.position.set(P.x,P.y,P.z);c.g.rotation.y=P.yaw;c.g.rotation.x=-P.pitch;
    c.roof.visible=!(eye&&Math.abs(eye.x-P.x)<HL+1&&Math.abs(eye.z-P.z)<HL+1&&eye.y<P.y+WY+0.2);
    Object.keys(c.leaves).forEach(id=>{const L=c.leaves[id],tgt=SIM.rideDoorOpen(c.src,c.k,id,t)?1:0;L.open+=Math.max(-dt*1.4,Math.min(dt*1.4,tgt-L.open));
      L.l.position.z=L.z-0.3-L.open*0.55;L.r.position.z=L.z+0.3+L.open*0.55;});});
  const carrying=RL.L.routes.porters.carriers[0].phase==='sail';
  LAB.ids.forEach((id,i)=>{const a=SIM.R.actor[id],p=a?SIM.pose(a,t):null;
    if(!p||p.hidden)labM.makeScale(0,0,0);
    else{labQ.setFromEuler(labE.set(0,p.h,0));
      /* a rider held on a seat (its journey's place on this car is a seat, and it is not walking) is drawn sitting on it */
      const seated=p.frame&&!p.moving&&a.task.ride&&a.task.ride.held.some(h=>h.src===p.frame.source&&h.k===p.frame.k&&h.seat);
      labM.compose(labV.set(p.x,p.y+(seated?0.42:0),p.z),labQ,seated?labSit:labS);}
    LAB.fig.setMatrixAt(i,labM);});
  RL.L.porters.crew.forEach((id,i)=>{const a=SIM.R.actor[id],p=SIM.pose(a,t);
    if(carrying){labQ.setFromEuler(labE.set(0,p.h,0));labM.compose(labV.set(p.x,p.y+1.75,p.z),labQ,labS);}else labM.makeScale(0,0,0);LAB.crate.setMatrixAt(i,labM);});
  LAB.fig.instanceMatrix.needsUpdate=true;LAB.crate.instanceMatrix.needsUpdate=true;}
