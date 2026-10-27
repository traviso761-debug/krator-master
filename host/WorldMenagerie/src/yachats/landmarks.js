// Yachats: the buildings that are shapes rather than heights, on the shared landmark kit (src/core/landkit.js), each
// placed from its entry in yachats.json.
//
//   westshelter   the CCC's stone shelter on the top of Cape Perpetua (1933): basalt walls laid dry-looking, a
//                 shingled hip roof low over it, open to the west, a parapet round the viewpoint in front
//   visitorcenter the Cape Perpetua Visitor Center: timber and glass under a long low roof, its windows on the sea
//   logchurch     the Little Log Church (1927): log walls, a steep shingled roof, a small belfry over the door
//   cleftlight    the Cleft of the Rock Light (1976): a square white tower with a lantern, a keeper's house beside
//   blowhole      Thor's Well, the Spouting Horn and Devil's Churn: the Forest Service's sign above each (the rock
//                 and the water are src/yachats/rocks.js's, from the lidar)
//   bridge        the 101's bridges (the Yachats River, Cook's Chasm, Cummins Creek) on OpenStreetMap's own bridge
//                 ways: girders, piers and abutments under the engine's deck, and the railing of each one's day
//
// Map data (c) OpenStreetMap contributors, ODbL. The geometry here is this project's own.
import {landkit} from '../core/landkit.js';

export function landmarks(api){
  const {THREE,gh,P}=api;
  const {Model,turn}=landkit(api,{basalt:0x3a3a38,basaltDark:0x252624,basaltWet:0x1c1d1e,shingle:0x5a5650,shingleDark:0x46423e,cedar:0x8a6a4a,
    logs:0x7a5a3e,logsDark:0x5e4430,timber:0x6a5240,glassDark:0x24303a,white:0xeeeeea,lantern:0xd8d0a0,red:0x9a2a24,concrete:0xb4b0a8,concreteDark:0x8e8a84,
    rail:0xc8c4bc,grey:0x9a9a96,moss:0x4a5a3a});
  const hip=(M,k,x,y,z,w,d,h)=>M.put(k,new THREE.ConeGeometry(Math.SQRT1_2,1,4).rotateY(Math.PI/4).scale(w,h,d).translate(0,h/2,0),x,y,z);
  const gable=(M,k,x,y,z,w,d,h,ry=0)=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();M.put(k,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}).translate(0,0,-d/2),x,y,z,ry);};

  return {

  // ================================================================ the West Shelter
  westshelter(L,x,z){const g0=gh(x,z),M=Model(),W=7.5,D=5.5,H=3.2;
    // three walls of basalt, the west side open on two piers; the stones show as courses of slightly proud blocks
    M.box('basalt',0,0,-D/2+0.35,W,H,0.7);for(const s of [-1,1])M.box('basalt',s*(W/2-0.35),0,0,0.7,H,D);
    for(let y=0.4;y<H;y+=0.55)for(let u=-W/2+0.6;u<W/2-0.3;u+=1.1)M.box(((u*7+y*3)|0)%2?'basaltDark':'basalt',u+((y*10|0)%2)*0.5,y,-D/2-0.02,0.9,0.42,0.12);
    for(const s of [-1,1])M.box('basalt',s*1.6,0,D/2-0.4,0.9,H,0.8);
    M.box('timber',0,H,0,W+0.6,0.3,D+0.6);hip(M,'shingle',0,H+0.3,0,W+1.6,D+1.6,2.2);M.box('basaltDark',0,0,0,W-1.2,0.12,D-1.2);   // the roof, the floor
    M.box('timber',0,0.45,-D/2+1.1,W-2,0.12,0.5);   // the bench along the back wall
    // the parapet round the viewpoint in front, and the chimney of the fireplace
    for(let a=-1.2;a<=1.2;a+=0.12)M.box('basalt',Math.sin(a)*7,0,D/2+Math.cos(a)*6-3.5,1.0,0.9,0.7,a);
    M.box('basalt',W/2-1.2,H-0.4,-D/2+0.4,1.2,3.4,1.0);
    return M.finish(L,x,g0,z,turn(L.face==null?270:L.face));},

  // ================================================================ the Cape Perpetua Visitor Center
  visitorcenter(L,x,z){const g0=gh(x,z),M=Model(),W=30,D=14,H=4.2;
    M.box('basaltDark',0,0,0,W+1,0.6,D+1);M.box('cedar',0,0.6,-1.5,W,H,D-3);M.box('glassDark',0,0.6,D/2-1.5,W-2,H-0.6,3);   // the timber hall, the glass front on the sea
    for(let u=-W/2+1;u<=W/2-1;u+=3.5)M.box('timber',u,0.6,D/2,0.35,H,0.35);
    gable(M,'shingleDark',0,H+0.6,0,D+3,W+2,3.2,Math.PI/2);   // the ridge along the hall
    M.box('timber',0,0.6,D/2+2.5,W*0.7,0.3,5);for(let u=-W*0.35;u<=W*0.35;u+=1.6)M.box('rail',u,0.9,D/2+5,0.08,1.0,0.08);   // the deck
    return M.finish(L,x,g0,z,turn(L.face==null?250:L.face));},

  // ================================================================ the Little Log Church
  logchurch(L,x,z){const g0=gh(x,z),M=Model(),W=7,D=13,H=3.6;
    M.box('basaltDark',0,0,0,W+0.4,0.5,D+0.4);
    for(let y=0.5,i=0;y<H;y+=0.34,i++){const k=i%2?'logs':'logsDark';   // the courses of logs, their ends crossing at the corners
      for(const s of [-1,1])M.put(k,new THREE.CylinderGeometry(0.17,0.17,D+0.6,8).rotateX(Math.PI/2),s*W/2,y+0.17,0);
      M.put(k,new THREE.CylinderGeometry(0.17,0.17,W+0.6,8).rotateZ(Math.PI/2),0,y+0.17,-D/2);M.put(k,new THREE.CylinderGeometry(0.17,0.17,W+0.6,8).rotateZ(Math.PI/2),0,y+0.17,D/2);}
    gable(M,'shingle',0,H,0,W+1.4,D+1.2,4.6);   // the steep roof, ridge along the nave
    for(const s of [-1,1])for(let u=-D/2+2.5;u<D/2-1;u+=3)M.box('glassDark',s*(W/2+0.18),1.4,u,0.1,1.4,0.9);
    M.box('cedar',0,0.5,D/2+0.2,1.4,2.3,0.15);   // the door, and over it the belfry and its little spire
    M.box('cedar',0,H+3,D/2-1.2,1.6,2.0,1.6);M.box('white',0,H+3.6,D/2-0.38,1.0,0.8,0.05);M.put('shingle',new THREE.ConeGeometry(1.3,2.4,4).rotateY(Math.PI/4).translate(0,1.2,0),0,H+5,D/2-1.2);
    M.box('white',0,H+7.4,D/2-1.2,0.08,1.2,0.08);M.box('white',0,H+7.9,D/2-1.2,0.6,0.08,0.08);
    return M.finish(L,x,g0,z,turn(L.face==null?180:L.face));},

  // ================================================================ the Cleft of the Rock Light
  cleftlight(L,x,z){const g0=gh(x,z),M=Model(),T=3.6,H=10;
    M.box('white',0,0,0,T,H,T);M.box('red',0,H,0,T+0.8,0.3,T+0.8);for(let a=0;a<8;a++)M.box('rail',Math.cos(a/8*6.28)*(T/2+0.3),H+0.3,Math.sin(a/8*6.28)*(T/2+0.3),0.06,0.9,0.06);
    M.cyl('lantern',0,H+0.3,0,1.2,1.2,1.8,8);M.put('red',new THREE.ConeGeometry(1.5,1.2,8).translate(0,0.6,0),0,H+2.1,0);M.box('red',0,H+3.3,0,0.12,0.6,0.12);
    for(const y of [3,6.5])M.box('glassDark',0,y,T/2+0.03,0.8,1.1,0.06);
    M.box('white',-T/2-4,0,0,7,3.4,6);gable(M,'red',-T/2-4,3.4,0,7.6,6.6,2.6);   // the keeper's house beside it
    const lamp=new THREE.Mesh(new THREE.SphereGeometry(0.6,10,8),new THREE.MeshBasicMaterial({color:0xfff4c0}));lamp.position.set(0,H+1.2,0);lamp.userData.noWire=true;
    api.animHooks.push(()=>{lamp.visible=api.nightF(api.hour())>0.3;});
    return M.finish(L,x,g0,z,turn(L.face==null?270:L.face),[lamp]);},

  // ================================================================ Thor's Well, the Spouting Horn, Devil's Churn
  // The rock and the water are rocks.js's, from the lidar; here only the Forest Service's sign on the trail above
  // each (a brown routed board on two posts), so the landmark has something to click.
  blowhole(L,x,z){const M=Model(),k=L.kind||'well',[sx,sz]=L.sign?P(L.sign):[x+14,z-6],g0=gh(sx,sz);
    for(const s of [-1,1])M.box('timber',s*0.55,0,0,0.14,1.5,0.14);M.box('cedar',0,0.9,0,1.5,0.62,0.08);M.box('white',0,1.12,0.05,1.1,0.05,0.01);
    return M.finish(L,sx,g0,sz,turn(L.face==null?280:L.face));},

  // ================================================================ the highway's bridges
  // Each sits on OpenStreetMap's own bridge ways (the engine has drawn their deck at its heights, ROADS[].ys): under
  // the deck the girders, the piers down to the bed and an abutment at each end; along its edges the railing of its
  // day. L.style: 'odot' (the Yachats River, 1977: a concrete parapet with a steel rail over it), 'mccullough'
  // (Cummins Creek, 1931: Conde McCullough's balustrade of round-arched openings, a pylon at each corner), 'modern'
  // (Cook's Chasm, 2003: a plain sloped concrete barrier). L.spans: how many spans (the piers between).
  bridge(L,x,z){const M=Model(),ROADS=api.ROADS||[],style=L.style||'odot',spans=L.spans||1;
    // the bridge ways near the landmark, joined end to end into one line with its deck heights
    const near=ROADS.filter(r=>r.deck>0&&r.c!=='trail'&&r.pts.some(q=>Math.hypot(q[0]-x,q[1]-z)<(L.reach||70)));
    if(!near.length)return M.finish(L,x,gh(x,z),z,0);
    let line=near[0].pts.map((q,i)=>[q[0],q[1],near[0].ys[i]]),rest=near.slice(1);
    for(let guard=0;rest.length&&guard<8;guard++)for(let k=0;k<rest.length;k++){const r=rest[k],pts=r.pts.map((q,i)=>[q[0],q[1],r.ys[i]]),A=line[0],B=line[line.length-1],a=pts[0],b=pts[pts.length-1],d=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1]);
      if(d(B,a)<2)line=line.concat(pts.slice(1));else if(d(B,b)<2)line=line.concat(pts.reverse().slice(1));else if(d(A,b)<2)line=pts.concat(line.slice(1));else if(d(A,a)<2)line=pts.reverse().concat(line.slice(1));else continue;
      rest.splice(k,1);break;}
    const w=(near[0].w||14)+1,cum=[0];for(let i=1;i<line.length;i++)cum.push(cum[i-1]+Math.hypot(line[i][0]-line[i-1][0],line[i][1]-line[i-1][1]));const LEN=cum[cum.length-1];
    const at=s=>{let i=1;while(i<cum.length-1&&cum[i]<s)i++;const t=(s-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]),a=line[i-1],b=line[i];return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,Math.atan2(b[1]-a[1],b[0]-a[0])];};
    const x0=line[0][0],z0=line[0][1],y0=0,loc=(px,pz)=>[px-x0,pz-z0];   // local frame: the first point, unrotated
    const put=(k,geo,px,py,pz,ang)=>{const [lx,lz]=loc(px,pz);M.put(k,geo.rotateY(-ang),lx,py,lz);};
    const bed=(px,pz)=>Math.min(gh(px,pz),api.inWater&&api.inWater(px,pz)?-1.5:gh(px,pz));
    // the girders and the soffit, in 2 m pieces so they follow the deck's camber
    for(let s=0;s<LEN;s+=2){const [px,pz,py,ang]=at(s+1),dk=py-1.6;
      put('concreteDark',new THREE.BoxGeometry(2.05,0.35,w-1).translate(0,-0.175,0),px,dk,pz,ang);
      for(const o of [-w*0.33,0,w*0.33])put('concreteDark',new THREE.BoxGeometry(2.05,style==='mccullough'?1.1:1.4,0.55).translate(0,-0.35-(style==='mccullough'?0.55:0.7),o),px,dk,pz,ang);}
    // the piers (wall piers with rounded ends, as the river's current wants) and the abutments
    for(let k=1;k<spans;k++){const [px,pz,py,ang]=at(LEN*k/spans),top=py-1.6-(style==='mccullough'?1.45:1.75),foot=bed(px,pz)-1;
      put('concrete',new THREE.BoxGeometry(1.3,top-foot,w*0.7).translate(0,(top-foot)/2,0),px,foot,pz,ang);
      for(const o of [-1,1])put('concrete',new THREE.CylinderGeometry(0.65,0.65,top-foot,10).translate(0,(top-foot)/2,o*w*0.35),px,foot,pz,ang);
      put('concrete',new THREE.BoxGeometry(1.8,0.6,w-0.6).translate(0,-0.3,0),px,top+0.6,pz,ang);}
    for(const s of [0.6,LEN-0.6]){const [px,pz,py,ang]=at(s),foot=Math.min(py-6,bed(px,pz)-1);put('concrete',new THREE.BoxGeometry(1.6,py-1.6-foot,w+1.2).translate(0,(py-1.6-foot)/2,0),px,foot,pz,ang);}
    // the railings, both sides
    for(const sd of [-1,1]){
      if(style==='mccullough'){// the balustrade: a curb, round-arched openings between slim posts, a moulded cap
        for(let s=0.4;s<LEN-0.3;s+=0.9){const [px,pz,py,ang]=at(s),ox=-Math.sin(ang)*sd*(w/2-0.15),oz=Math.cos(ang)*sd*(w/2-0.15);
          put('white',new THREE.BoxGeometry(0.9,0.25,0.3).translate(0,0.125,0),px+ox,py,pz+oz,ang);
          put('white',new THREE.BoxGeometry(0.16,0.75,0.24).translate(-0.37,0.62,0),px+ox,py,pz+oz,ang);
          put('white',new THREE.TorusGeometry(0.36,0.06,4,10,Math.PI).translate(0,0.95,0),px+ox,py,pz+oz,ang);
          put('white',new THREE.BoxGeometry(0.92,0.14,0.36).translate(0,1.12,0),px+ox,py,pz+oz,ang);}
        for(const s of [0.3,LEN-0.3]){const [px,pz,py,ang]=at(s),ox=-Math.sin(ang)*sd*(w/2+0.2),oz=Math.cos(ang)*sd*(w/2+0.2);   // the pylons
          put('white',new THREE.BoxGeometry(1.0,2.6,1.0).translate(0,1.3,0),px+ox,py,pz+oz,ang);put('white',new THREE.BoxGeometry(1.2,0.25,1.2).translate(0,2.7,0),px+ox,py,pz+oz,ang);
          put('white',new THREE.ConeGeometry(0.5,0.9,4).rotateY(Math.PI/4).translate(0,3.25,0),px+ox,py,pz+oz,ang);}}
      else for(let s=0;s<LEN;s+=2){const [px,pz,py,ang]=at(s+1),ox=-Math.sin(ang)*sd*(w/2-0.25),oz=Math.cos(ang)*sd*(w/2-0.25);
        if(style==='modern')put('concrete',new THREE.BoxGeometry(2.02,0.82,0.5).translate(0,0.41,0),px+ox,py,pz+oz,ang);   // the sloped barrier, read as a block
        else{put('concrete',new THREE.BoxGeometry(2.02,0.7,0.35).translate(0,0.35,0),px+ox,py,pz+oz,ang);                    // the parapet
          put('rail',new THREE.BoxGeometry(2.02,0.1,0.12).translate(0,1.05,0),px+ox,py,pz+oz,ang);                           // the steel rail over it
          if(((s/2)|0)%1===0)put('rail',new THREE.BoxGeometry(0.1,0.35,0.1).translate(0,0.87,0),px+ox,py,pz+oz,ang);}}}
    return M.finish(L,x0,y0,z0,0);},
  };
}
