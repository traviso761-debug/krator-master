// Yachats: the buildings that are shapes rather than heights, on the shared landmark kit (src/core/landkit.js), each
// placed from its entry in yachats.json.
//
//   westshelter   the CCC's stone shelter on the top of Cape Perpetua (1933): basalt walls laid dry-looking, a
//                 shingled hip roof low over it, open to the west, a parapet round the viewpoint in front
//   visitorcenter the Cape Perpetua Visitor Center: timber and glass under a long low roof, its windows on the sea
//   logchurch     the Little Log Church (1927): log walls, a steep shingled roof, a small belfry over the door
//   cleftlight    the Cleft of the Rock Light (1976): a square white tower with a lantern, a keeper's house beside
//   blowhole      Thor's Well, the Spouting Horn and Devil's Churn: the black basalt shelf round each, its hole or
//                 slot dark in it (the water in them is src/yachats/coast.js's)
//   bridge        the Yachats River bridge on the 101: concrete piers in the river and the parapets of the deck
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
  // The shelf is dark basalt laid as a few slabs round the hole, its top just above the tide; the hole itself is a
  // black ring (the well), a dark crack (the horn) or a long slot running in from the sea (the churn).
  blowhole(L,x,z){const g0=Math.max(0.4,gh(x,z)),M=Model(),k=L.kind||'well';
    if(k==='churn'){for(const s of [-1,1])for(let u=-30;u<=18;u+=6)M.box(u%12?'basalt':'basaltDark',s*(4+Math.abs(u)*0.03),-3,u,4,3.6+((u+30)/48)*2,6.2);
      M.box('basaltWet',0,-6,-6,6,1,48);
      return M.finish(L,x,Math.max(0.6,g0),z,turn(L.face==null?280:L.face));}
    for(let i=0;i<9;i++){const a=i/9*6.28,r=k==='well'?6:5;M.box(i%3?'basalt':'basaltDark',Math.cos(a)*r,-2,Math.sin(a)*r,5,2.4+(i%2)*0.4,4,-a);}
    if(k==='well')M.put('basaltWet',new THREE.CylinderGeometry(2.8,2.2,2.6,16,1,true),0,-2.2,0);
    else M.box('basaltWet',0,-2,0,1.2,2.6,6);
    return M.finish(L,x,g0,z,turn(L.face==null?280:L.face));},

  // ================================================================ the Yachats River bridge
  bridge(L,x,z){const M=Model(),N=L.span||76,a=[x,z];
    const [ex,ez]=P([44.30783,-124.09971]),[wx,wz]=P([44.30737,-124.10031]),deck=Math.max(gh(ex,ez),gh(wx,wz),6)+0.4;
    for(const u of [-N/4,0,N/4])M.box('concreteDark',u,-6,0,1.6,deck+5.2,7);   // the piers, down into the river
    for(const s of [-1,1]){M.box('concrete',0,deck,s*5.2,N,1.1,0.4);for(let u=-N/2+2;u<N/2;u+=2.4)M.box('concreteDark',u,deck+0.2,s*5.2+s*0.05,1.2,0.6,0.42);}
    M.box('concreteDark',0,deck-1.4,0,N,1.4,10);
    return M.finish(L,(ex+wx)/2,0,(ez+wz)/2,Math.atan2(-(ez-wz),ex-wx));},
  };
}
