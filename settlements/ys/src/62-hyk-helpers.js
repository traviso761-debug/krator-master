// ================================================================= HYKKOUSOI — the building frame, openings, rooms, lights, stairs
// HYK.place() builds one registered building in a LOCAL frame (origin at the plot centre on the ground, +z the front,
// y up), the way the Iziz vernacular does: the group carries position, yaw and scale; the shell kit moves merged
// geometry to world space at the put and kput goes through the group transform. Everything a later pass reads is
// recorded here in WORLD space through 60-ys-registries.js: MARKS (every opening and light), ROOMS and SPOTS
// (DESIGN §7), and the inspector volumes with the project tags.
const HYK_PLACED=[];
HYK.place=function(scene,key,x,z,ry,o){const D=HYK.defs[key];if(!D){reportErr('HYK.place: no such key '+key);return null;}
 o=Object.assign({v:0,y:0,scale:1},o||{});const G=new THREE.Group();G.position.set(x,o.y,z);G.rotation.y=ry||0;if(o.scale!==1)G.scale.setScalar(o.scale);scene.add(G);G.updateMatrix();
 KOFF=[0,0,0];useGroupXF(G);if(o.scale!==1)KXF.s=o.scale;
 const id=HYK_PLACED.length;const rec={key,x,z,ry:ry||0,o,id,name:D.name};HYK_PLACED.push(rec);
 HYK.cur={D,G,x,z,ry:ry||0,o,r0:REG.length,id,key,name:D.name};
 try{D.build(G,o);}catch(e){reportErr(key+' '+e.stack);}
 endGroupXF();HYK.cur=null;return G;};
// local -> world for a point and for a direction (the same rotation as loc(), 69c)
function hykW(lx,ly,lz){const c=HYK.cur;if(!c)return [lx,ly,lz];const s=c.o.scale||1;const p=loc(c.x,c.z,lx*s,lz*s,c.ry);return [p[0],(c.o.y||0)+ly*s,p[1]];}
function hykN(nx,ny,nz){const c=HYK.cur;if(!c)return [nx,ny,nz];const ry=c.ry;return [nx*Math.cos(ry)+nz*Math.sin(ry),ny,-nx*Math.sin(ry)+nz*Math.cos(ry)];}
// the inspector volume (project rule: name, class, tags), in the local frame
function hykReg(name,lx,lz,r,h,tags){const c=HYK.cur;const s=c?(c.o.scale||1):1;const p=c?loc(c.x,c.z,lx*s,lz*s,c.ry):[lx,lz];
 const R={name,x:p[0],y:c?(c.o.y||0):0,z:p[1],r:r*s,h:h*s,cls:'building',key:c?c.key:null,id:REG.length,bld:c?c.id:null,tags:Object.assign({culture:'hykkousoi'},c?c.D.tags:{},tags||{})};REG.push(R);return R;}
// ---------------------------------------------------------------- openings: a hole in a shell gets a lip and a reveal, and is recorded
// op = {p:[x,y,z], n:[nx,ny,nz], r, ky} on a shell in the current frame (from hykPod / hykLatheAt / a conch aperture).
// o:{kind:'door'|'wetdoor'|'window', level, room, lit, nacre, depth, open (a window with no pane), lipCol}
function hykOpening(op,o){o=o||{};const r=op.r,ky=op.ky||1;const n=new THREE.Vector3(op.n[0],op.n[1],op.n[2]).normalize();const P=new THREE.Vector3(op.p[0],op.p[1],op.p[2]);
 const q=qFacing([n.x,n.y,n.z]);const lc=o.lipCol||hC(hPick(o.nacre?HPAL.nacre:HPAL.shell));
 kput(o.nacre?'hkLipN':'hkLip',[P.x+n.x*.05,P.y+n.y*.05,P.z+n.z*.05],q,[r*1.04,r*1.04*ky,r*1.5],lc);
 const depth=o.depth||Math.max(.45,r*.45);const qy=new THREE.Quaternion().setFromUnitVectors(_UP,n);
 kput('hkReveal',[P.x-n.x*depth*.45,P.y-n.y*depth*.45,P.z-n.z*depth*.45],qy,[r*.985,depth,r*.985*ky],null);
 const kind=o.kind||'window';
 if(kind==='window'&&!o.open)kput('hkDisc',[P.x-n.x*depth*.9,P.y-n.y*depth*.9,P.z-n.z*depth*.9],q,[r*.97,r*.97*ky,1],o.lit?hC(0xffe2b8):null);
 const w=hykW(P.x,P.y,P.z),wn=hykN(n.x,n.y,n.z);const c=HYK.cur;
 const m={bld:c?c.id:null,key:c?c.key:null,name:c?c.name:(o.name||null),kind,x:w[0],y:w[1],z:w[2],nx:wn[0],nz:wn[2],w:r*2,h:r*2*ky,level:o.level||'ground',room:o.room!=null?o.room:null,lit:!!o.lit};
 if(kind==='door'||kind==='wetdoor'){m.step=[w[0]+wn[0]*1.0,w[2]+wn[2]*1.0];m.thresh=[w[0]-wn[0]*1.0,w[2]-wn[2]*1.0];
  kput('hkTread',[P.x+n.x*.25,P.y-r*ky+.07,P.z+n.z*.25],qEuler(0,Math.atan2(n.x,n.z),0),[r*2.1,.14,1.2],hC(hPick(HPAL.bone)));}
 ysMark(m);return m;}
function hykDoor(op,o){return hykOpening(op,Object.assign({kind:'door'},o||{}));}
function hykWin(op,o){return hykOpening(op,Object.assign({kind:'window'},o||{}));}
// a lamp: a glow-pearl in a shell cup (warm) or a bioluminescent jar (cool); recorded as a light mark
function hykLight(lx,ly,lz,o){o=o||{};const cool=!!o.cool;const r=o.r||.22;
 kput(cool?'hkPearlC':'hkPearl',[lx,ly,lz],null,r,cool?hC(0x9ff4e4):hC(0xffe2b0));
 if(!o.bare)kput('hkBall',[lx,ly-r*.7,lz],null,[r*1.6,r*.9,r*1.6],hC(hPick(o.nacre?HPAL.nacre:HPAL.shell)));
 const w=hykW(lx,ly,lz);const c=HYK.cur;
 return ysMark({bld:c?c.id:null,key:c?c.key:null,name:c?c.name:null,kind:'light',x:w[0],y:w[1],z:w[2],nx:0,nz:0,w:r*2,h:r*2,level:o.level||'ground',warm:!cool,lightKind:o.kind||(cool?'jar':'pearl')});}
// ---------------------------------------------------------------- rooms and the spots the later placer fills (kits/interiors/SPEC.md)
// poly in the local frame, y the floor, h the clear height; o:{doors:[[lx,lz,w,to]], residence, wealth}
function hykRoom(kind,poly,y,h,o){o=o||{};const c=HYK.cur;const wp=poly.map(p=>{const w=hykW(p[0],0,p[1]);return [w[0],w[2]];});
 const R={building:c?c.name:(o.building||null),bld:c?c.id:null,key:c?c.key:null,kind,poly:wp,y:(c?(c.o.y||0):0)+y,h,
  doors:(o.doors||[]).map(d=>{const w=hykW(d[0],0,d[1]);return {at:[w[0],w[2]],w:d[2]||1.1,to:d[3]||'street'};}),windows:o.windows||[],
  culture:'hykkousoi',wealth:o.wealth!=null?o.wealth:.5,residence:!!o.residence};return ysRoom(R);}
function hykSpot(room,kind,lx,lz,ry,w,d){const c=HYK.cur;const p=hykW(lx,0,lz);return ysSpot({room:room.id,bld:c?c.id:null,kind,x:p[0],z:p[2],ry:(c?c.ry:0)+(ry||0),w,d});}
// a circular room polygon (n points) about a local centre
function hykCirclePoly(cx,cz,r,n){const P=[];n=n||14;for(let i=0;i<n;i++){const a=i/n*TAU;P.push([cx+r*Math.cos(a),cz+r*Math.sin(a)]);}return P;}
// the floor plate of a room: a chord disc at y, into the interior bucket
function hykFloor(cx,cz,y,R,o){o=o||{};return hykPut('hkFloor',hykDisc(cx,y,cz,R,{col:o.col||hC(hPick(HPAL.floor)),lobes:o.lobes,nu:o.nu||28}),true);}
// ---------------------------------------------------------------- landings, stairs, ladders (world frame unless inside a building)
// a lily-pad landing: a lobed disc with a domed underside, on a stalk down to the ground if o.stalk
function hykPad(x,y,z,R,o){o=o||{};const col=o.col||hC(hPick(HPAL.shell));const mk=o.mat||'hkShell';
 hykPut(mk,hykDisc(x,y,z,R,{col,lobes:{n:o.lobes||9,amp:.08}}));hykPut(mk,hykDisc(x,y-.3,z,R*.97,{col,sag:-R*.22,down:true,lobes:{n:o.lobes||9,amp:.08}}));
 kput('hkLip',[x,y+.02,z],qEuler(Math.PI/2,0,0),[R*1.0,R*1.0,.9],col);
 if(o.stalk){const yb=o.stalk===true?terrainH(x,z)-1:o.stalk;kput('hkPost',[x,(yb+y)/2,z],null,[R*.14,y-yb,R*.14],col);}
 ysDeck({x0:x-R,z0:z-R,x1:x+R,z1:z+R,w:R*2,y,kind:'pad',own:o.own||null});return {x,y,z,r:R};}
// a spiral stair hugging a round host from y0 down to y1: treads on the face, a rail tube on the outer edge
function hykStairSpiral(cx,cz,rAt,y0,y1,o){o=o||{};const w=o.w||1.1,rise=.19,run=.64,dir=o.dir||1;const col=o.col||hC(hPick(HPAL.bone));const rail=[];
 let a=o.a0||0,y=y0;const nst=Math.max(1,Math.round((y0-y1)/rise));
 for(let i=0;i<=nst;i++){const r=rAt(y)+.1+w/2;kput('hkTread',[cx+r*Math.cos(a),y-.06,cz+r*Math.sin(a)],qEuler(0,-a,0),[w,.12,run*1.08],col);
  const ro=rAt(y)+.1+w;rail.push([cx+ro*Math.cos(a),y+.95,cz+ro*Math.sin(a)]);
  if(i%7===0)kput('hkPost',[cx+ro*Math.cos(a),y+.45,cz+ro*Math.sin(a)],null,[.05,.95,.05],col);
  a+=dir*run/(rAt(y)+.1+w/2);y-=rise;}
 if(rail.length>2)hykPut('hkBone',hykTube(rail,()=>.07,{seg:6,col}));
 return {a1:a,y1:y+rise};}
// a rib bridge: an arched deck between two landings with two bone ribs under its edges and lip rails
function hykBridge(A,B,o){o=o||{};const w=o.w||2.6;const L=Math.hypot(B.x-A.x,B.z-A.z);const rise=o.rise!=null?o.rise:Math.min(9,L*.07);const n=Math.max(8,Math.round(L/4));
 const pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push([A.x+(B.x-A.x)*t,A.y+(B.y-A.y)*t+rise*4*t*(1-t),A.z+(B.z-A.z)*t]);}
 const col=o.col||hC(hPick(HPAL.bone));const dcol=o.deckCol||hC(hPick(HPAL.shell));
 hykPut('hkShell',hykDeck(pts,w,{col:dcol,camber:.08}));hykPut('hkShell',hykDeck(pts.map(p=>[p[0],p[1]-.5,p[2]]),w*.92,{col:dcol,flip:false}));
 const tx=(B.x-A.x)/L,tz=(B.z-A.z)/L;const rx=-tz,rz=tx;
 for(const s of [-1,1]){const edge=pts.map(p=>[p[0]+rx*s*w*.46,p[1]-.3,p[2]+rz*s*w*.46]);
  hykPut('hkBone',hykTube(edge,(t)=>.32*(1+.18*Math.max(0,Math.cos(t*TAU*4)))-.08*Math.sin(t*Math.PI),{seg:8,col}));
  hykPut('hkBone',hykTube(edge.map(p=>[p[0],p[1]+1.25,p[2]]),()=>.07,{seg:6,col}));
  for(let i=0;i<=n;i+=2){const p=edge[i];kput('hkPost',[p[0],p[1]+.62,p[2]],null,[.06,1.25,.06],col);}}
 ysDeck({x0:Math.min(A.x,B.x)-w,z0:Math.min(A.z,B.z)-w,x1:Math.max(A.x,B.x)+w,z1:Math.max(A.z,B.z)+w,w,y:Math.max(A.y,B.y)+rise,kind:'bridge',own:o.own||null,a:[A.x,A.y,A.z],b:[B.x,B.y,B.z]});
 return pts;}
