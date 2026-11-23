// ================================================================= PINNACLE — the rock in the world (relief P4: a pinned landform)
// [G data] KNOWN_ISSUES.md, "No mesa in the world": the world showed the model's knoll where Pinnacle Rock stands. The rock
// is settlements/pinnacle-rock's own layout (40-pr-layout.js, read in place: PR), made into KSTACKS bodies as that page's
// stage makes them (its 45-host-stage.js ROCK: the mesa, its spurs, the Garden's mesa and the Heart, the fins on the rim,
// the Garden's pinnacles, the shrine's balanced rock), on the world's ground at the site region.json names, and pinned to
// core/world's landform records (43b-world-landforms.js: WLAND.pin), so the world's ground stands up into the rock and the
// bands' camps (the site plan) are planned round it. The page draws the same records as meshes, overhangs and all; the
// world draws them as its ground (their tops and walls), which is what a camp, a road or the camera reads.
WLAND.pin(function(o){'use strict';
 const S=(WORLD_DATA.meta.sites||[]).find(s=>s.page==='settlements/pinnacle-rock');if(!S)return [];
 const K=KSTACKS,L=[],M=PR.MESA,TAU=Math.PI*2,sx=S.x,sz=S.z,g=(x,z)=>o.ground(sx+x,sz+z);
 // the floor's lowest under and round a footprint (the page's footY, on the world's ground)
 const footY=(x,z,rx,rz)=>{let m=1e9;for(let i=0;i<48;i++){const a=i/48*TAU;for(const k of [.5,.85,1.08])m=Math.min(m,g(x+Math.cos(a)*rx*k,z+Math.sin(a)*rz*k));}return m-3;};
 // the top stands PR.MESA.top over the south foot (the page's frame: the south foot is y 0)
 const ys=g(M.x,M.z+M.r*Math.sqrt(M.e)+40),y0=Math.min(ys-5,footY(M.x,M.z,M.r/Math.sqrt(M.e),M.r*Math.sqrt(M.e)));
 const at=(x,z,y)=>({x:sx+x,z:sz+z,y0:y});
 const mesa=K.make(Object.assign({id:'pr:'+M.id,kind:'butte',seed:M.seed,lobes:M.lobes,weather:M.weather,shoulder:M.shoulder,tiers:[{h:ys+M.top-y0,r:M.r,e:M.e,ry:M.ry}]},at(M.x,M.z,y0)));
 mesa.name=M.name;L.push(mesa);
 const topB=mesa.beds[mesa.beds.length-1],topY=(x,z)=>K.topAt([mesa],sx+x,sz+z),top0=mesa.top;
 PR.SPURS.forEach(P=>{const R=K.footR(mesa.beds[0],P.a)*P.k,x=M.x+Math.cos(P.a)*R,z=M.z+Math.sin(P.a)*R,fy=Math.min(y0,footY(x,z,P.r,P.r));
  const s=K.make(Object.assign({id:'pr:'+P.id,kind:'butte',seed:P.seed,lobes:.2,weather:1,shoulder:{h:14,back:13,bed:[3,5]},tiers:[{h:ys+P.h-fy,r:P.r,e:1.4,ry:P.a+Math.PI/2}]},at(x,z,fy)));
  s.name='A spur of Pinnacle Rock (a ledge '+Math.round(P.h)+' m up)';L.push(s);});
 const footOn=(B,pad,on)=>{const b=B.beds[0];for(let i=0;i<24;i++){const a=i/24*TAU,R=K.footR(b,a),A=K.at([on],b.cx+Math.cos(a)*R,b.cz+Math.sin(a)*R);if(!A||A.d>-pad)return false;}return true;};
 PR.FINS.forEach(F=>{let B=null;for(let k=0;k<12&&!B;k++){const R=K.footR(topB,F.a)*(1-topB.ch)-F.inset-6*k,x=M.x+Math.cos(F.a)*R,z=M.z+Math.sin(F.a)*R;
   const b=K.make(Object.assign({id:'pr:'+F.id,kind:'fin',seed:F.seed,H:F.H,r:Math.sqrt(F.L*F.w),e:F.L/F.w,ry:F.rot},at(x,z,topY(x,z)-1.5)));if(footOn(b,12,mesa))B=b;}
  if(B){B.name='A fin on the rim of Pinnacle Rock';L.push(B);}});
 const GM=PR.GARDEN_MESA,gy0=topY(GM.x,GM.z)-4,inner=K.make(Object.assign({id:'pr:'+GM.id,kind:'butte',seed:GM.seed,lobes:GM.lobes,weather:GM.weather,shoulder:GM.shoulder,
  bed:GM.bed,tiers:[{h:top0+GM.h-gy0,r:GM.r,e:GM.e,ry:GM.ry}]},at(GM.x,GM.z,gy0)));
 inner.name=GM.name;L.push(inner);
 const HM=PR.HEART_MESA,hy0=K.topAt([inner],sx+HM.x,sz+HM.z)-4,gtop=top0+GM.h,heart=K.make(Object.assign({id:'pr:'+HM.id,kind:'butte',seed:HM.seed,lobes:HM.lobes,
  weather:HM.weather,shoulder:HM.shoulder,bed:HM.bed,tiers:[{h:gtop+HM.h-hy0,r:HM.r,e:HM.e,ry:HM.ry}]},at(HM.x,HM.z,hy0)));
 heart.name=HM.name;L.push(heart);
 PR.GARDEN.forEach(G=>{const on=G.on==='heart'?heart:inner,yy=K.topAt([on],sx+G.x,sz+G.z)-1.5;
  const B=K.make(Object.assign({id:'pr:'+G.id,kind:G.kind,seed:G.seed,H:G.H-(yy+1.5-gtop),r:G.r,e:G.kind==='fin'?3.2:null},at(G.x,G.z,yy)));
  if(footOn(B,on===heart?2:6,on)&&!(on===inner&&K.at([heart],B.x,B.z))){B.name='A pinnacle of the Garden';L.push(B);}});
 {const G=PR.SHRINE_ROCK,B=K.make(Object.assign({id:'pr:'+G.id,kind:G.kind,seed:G.seed,H:G.H,r:G.r},at(G.x,G.z,topY(G.x,G.z)-1.5)));
  if(footOn(B,8,mesa)){B.name='The balanced rock of the Winged Ones\' shrine';L.push(B);}}
 return L;});
