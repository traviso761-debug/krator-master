// ================================================================= HYKKOUSOI — hosts: placing a cut Ancient tower, the tideline, accretion
// A drowned host is an Ancients-kit builder placed sunk (its base below the sea), cut short at a storey boundary
// through the builders' own y1 path (52-sky-abc.js, YS_CUT), with the kit's planting switched off (the biome plants
// the ground). It becomes a HOST record on the canton model (DESIGN §3) with a floors table (DESIGN §5), and the
// Hykkousoi grow onto it: the tideline dressing at the waterline, pods rooted into its face at the datums with
// fillets and drips, a lily-pad landing in front of every door, and the stairs that join the datums.
let YS_CUT=null;
// o:{key,builder,x,z,y (sink, usually negative),ry,d,cutY (the builder's own y),cap:{hw},rAt(y)->radius of the face
//    at world y, name, floors:{y0,pitch} (the builder's storey table, in its own y), ring}
function ysPlaceHost(scene,o){const d=o.d==null?1:o.d;const G=new THREE.Group();G.position.set(o.x,o.y||0,o.z);G.rotation.y=o.ry||0;scene.add(G);G.updateMatrix();
 const sink=o.y||0,ry=o.ry||0;const rAt=o.rAt||(()=>30);
 // the ways in: a pod declared here gets its hole cut through the body wall and the lining by the adapted builders
 // (52-sky-abc ysWallHole); hykAccrete then grows the pod bedded into that hole with a back door onto the plate.
 const ways=(o.ways||[]).map(w=>{const R=w.R||4;const rs=rAt(w.y,w.a);const u=((((w.a+ry)/TAU)%1)+1)%1;return {a:w.a,y:w.y,R,u,yb:w.y-sink+R*.447,uw:R*.9/(TAU*rs),hh:R*.88,door:null,room:null};});
 const r0=REG.length;KOFF=[0,0,0];useGroupXF(G);TSTAT.cur=o.key+'/'+d;{const t=tcur();t.host=true;t.n=(t.n||0)+1;}const lush=BIOME.lush;BIOME.lush=0;
 YS_CUT=(o.cutY!=null||o.podium!=null||ways.length)?{cutY:o.cutY!=null?o.cutY:null,podium:o.podium!=null?o.podium:null,ways:ways.map(w=>({u:w.u,y:w.yb,uw:w.uw,hh:w.hh}))}:null;
 HOLES=o.holes!=null?o.holes:.4;   // the kit's full decay eats 83 % of a tower's skin; a reclaimed host keeps most of its wall
 const snap={};for(const n in KIT.items)snap[n]=KIT.items[n].length;
 let H=null;try{H=withFlatGround(()=>o.builder(G,0,0,d));}catch(e){reportErr('host '+o.key+' '+e.stack);}
 YS_CUT=null;HOLES=1;BIOME.lush=lush;endGroupXF();KOFF=[0,0,0];TSTAT.cur=null;
 for(const n of ['trunk','leafCard'])if(KIT.items[n])KIT.items[n].length=snap[n]||0;    // a plant is never part of a building
 // the port's REGISTER already carries the group transform (KXF), so the volumes are in world space here; the kit's
 // generous radius (130 for A) shrinks to the host's cap so neighbouring hosts' volumes stop overlapping (the
 // inspector named A's pod after B, whose volume reached it)
 const capHw=o.cap&&o.cap.hw!=null?o.cap.hw:(o.podium!=null?o.podium:60)+6;
 for(let i=r0;i<REG.length;i++){const r=REG[i];r.cls='host';r.key=o.key;r.id=i;r.r=Math.min(r.r,capHw+4);
  r.tags=Object.assign({culture:'ancients',type:['civic'],wealth:'civic',decay:d,host:o.name||o.key},r.tags||{});}
 const host={n:o.name||o.key,key:o.key,x:o.x,z:o.z,ry,y:sink,cap:o.cap||{hw:(o.podium!=null?o.podium:60)+6},podium:o.podium!=null?o.podium:null,cutY:o.cutY!=null?o.cutY+sink:null,
  rAt,floors:[],landings:[],heads:[],piers:[],ways,members:[],ring:o.ring||1,lit:false,G,reg:r0};
 // the floors table: plate k's top is at y0 + k*pitch + top (k=0 may differ: `first`), all in the builder's y, plus the sink
 if(o.floors){const top=host.cutY!=null?host.cutY-2:1e9;const F=o.floors;for(let k=0;k<400&&F.pitch>0;k++){const y=sink+F.y0+(k?k*F.pitch+(F.top||0):(F.first!=null?F.first:(F.top||0)));if(y>=top)break;
  host.floors.push({k,y,H:F.pitch-.4,kind:y<-.6?'drowned':y<1.4?'tide':'wild',use:0});}}
 host.members=ysHostMembers(host,d);ysHost(host);return host;}
// The host's members in world space, {n,a,b,r} capsules: the struts and legs a runner can reach for. They mirror the
// kit's own constants (52-sky-abc.js after the RESTAND: A's 24 struts from r 60 at y 5 to r rFn(64)*.96 at y 70, three
// gone when ruined; B's 12 legs raked straight from r 42 at the podium to the lobe tips at r rFn(30)*1.15, y 32, two
// gone) and must be re-read if the kit changes.
function ysHostMembers(h,d){const M=[];const W=(lx,ly,lz)=>{const p=loc(h.x,h.z,lx,lz,h.ry);return [p[0],ly+h.y,p[1]];};const V=(lx,lz)=>{const p=loc(0,0,lx,lz,h.ry);return [p[0],0,p[1]];};
 const seg=(n,a,b,r,extra)=>M.push(Object.assign({n,a:W(a[0],a[1],a[2]),b:W(b[0],b[1],b[2]),r},extra||{}));
 // a strut's shaft is a 5.5 x 4 beam, modelled as a capsule of r 2.75 (its corners stand .65 m proud of that); a strut
 // head is the kit's 7 x 9 x 6 box at the strut's top, 3 m down from the beam's end, its long axis radial
 if(h.key==='skyA'){const rT=(40+26*Math.pow(.42/.58,1.7))*.96;for(let k=0;k<24;k++){if(d>0&&(k===5||k===13||k===19))continue;const th=(k+.5)/24*TAU;const c=Math.cos(th),s=Math.sin(th);
   seg('strut '+k,[c*60,5,s*60],[c*rT,70,s*rT],2.75);
   M.push({n:'strut head '+k,c:W(c*rT,67,s*rT),u:V(c,s),v:[0,1,0],w:V(-s,c),he:[3.5,4.5,3],head:true});}}
 else if(h.key==='skyB'){const rb=(26+10*Math.pow(30/300,1.4))*1.15,LR=42;const ux=rb-LR,uy=27,ul=Math.hypot(ux,uy),ex=ux/ul,ey=uy/ul;
  for(let k=0;k<12;k++){if(d>0&&(k===3||k===8))continue;const th=k/12*TAU;const c=Math.cos(th),s=Math.sin(th);
   seg('leg '+k,[c*(LR-ex*7),5-ey*7,s*(LR-ex*7)],[c*(rb+ex*6),32+ey*6,s*(rb+ex*6)],1.7);}}
 return M;}
// a host floor is inhabited once something is grown at it
function ysHostInhabit(host,y,use){let best=null;for(const f of host.floors)if(Math.abs(f.y-y)<4.5&&(!best||Math.abs(f.y-y)<Math.abs(best.y-y)))best=f;if(best){best.kind='inhabited';best.use=Math.max(best.use,use||.5);}return best;}
// ---------------------------------------------------------------- the tideline: crust, weed, barnacle specks, foam
// A `shaped` host (a square keep, a rounded-square monolith: the city's D and H) has a face that depends on the bearing:
// the band, the weed, the specks and the foam follow host.rAt(y,a) round it; a round host keeps the lathe it always had.
function hykTideline(host,o){o=o||{};const yb=-1.7,yt=1.3;const S=!!host.shaped;const R=(y,a)=>host.rAt(y,S?a:undefined)+.3;
 if(S)hykPut('hkCrust',hykSurf((u,v)=>{const th=u*TAU,y=yb+v*(yt-yb);const r=R(y,th);return [host.x+r*Math.cos(th),y,host.z+r*Math.sin(th)];},192,6,{col:hC(hPick(HPAL.crust)),uS:TAU*R(0,0)/4,vS:(yt-yb)/4}));
 else hykPut('hkCrust',hykLathe({H:yt-yb,yBase:yb,cx:host.x,cz:host.z,rFn:y=>R(y+yb),nu:84,nv:6,noise:{amp:.05,su:7,sv:.6,seed:11},col:hC(hPick(HPAL.crust))}));
 const n=o.weed||Math.round(TAU*R(0,0)/1.5);for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.12,.12);const r=R(.3,a)+.1;const h=rr(1.2,3.4),w=rr(.5,1.2);
  kput('hkWeedCard',[host.x+r*Math.cos(a),.35-h/2,host.z+r*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[w,h,1],hC(hPick(HPAL.weed)));}
 const m=o.specks||Math.round(TAU*R(0,0)*2.4);for(let i=0;i<m;i++){const a=rng()*TAU,y=rr(-1.3,1.2);const r=R(y,a)+.04;const s=rr(.08,.24);
  kput('hkBarnB',[host.x+r*Math.cos(a),y,host.z+r*Math.sin(a)],null,[s,s*.7,s],hC(hPick(HPAL.barnacle)));}
 const f=hykSurf((u,v)=>{const th=u*TAU;const r=R(0,th)+.1+v*(o.foam||2.4)*(1+.3*Math.sin(th*7));return [host.x+r*Math.cos(th),.06,host.z+r*Math.sin(th)];},S?192:84,2,{col:HYK_WHITE,flip:true});
 const fm=new THREE.Mesh(f,MAT.hkFoam);fm.userData.probeSkip=true;fm.renderOrder=2;scene.add(fm);}
// the depth of a superellipsoid pod's underside below its centre at a horizontal offset (dx,dz), or null outside it
function hykPodUnder(a,b,c,e1,e2,dx,dz){const q=Math.pow(Math.abs(dx)/a,2/e2)+Math.pow(Math.abs(dz)/c,2/e2);const t=Math.pow(q,e2/e1);if(t>=1)return null;return b*Math.pow(1-t,e1/2);}
// ---------------------------------------------------------------- accretion: pods grown onto a host's face
// pods: [{y, a (azimuth, world: 0 = +x, pi/2 = +z), R, wealth:'poor'|'middle'|'rich', level:'L1'|'L2', pad:true}]
function hykAccrete(host,pods){const out=[];for(const pd of pods){
 const R=pd.R;let way=null;
 if(pd.into){way=(host.ways||[]).find(w=>Math.abs(Math.atan2(Math.sin(w.a-pd.a),Math.cos(w.a-pd.a)))<.05&&Math.abs(w.R-R)<.01)||null;
  if(!way)reportErr('hykAccrete: '+host.n+' has no way declared at a='+pd.a.toFixed(2)+' R='+R+' (ysPlaceHost ways)');}
 if(way&&pd.y==null)pd.y=way.y+R*.447;   // the pod's floor on the plate
 const rs=host.rAt(pd.y,pd.a);const nx=Math.cos(pd.a),nz=Math.sin(pd.a);const depth=way?-R*.2:R*.3;const cx=host.x+(rs+depth)*nx,cz=host.z+(rs+depth)*nz;   // 70 % of a pod proud of the face; a way-in pod bedded a fifth into it
 const poor=pd.wealth==='poor',rich=pd.wealth==='rich';const col=hC(hPick(poor?HPAL.barnacle:rich?HPAL.nacre:HPAL.shell));const mat=poor?'hkBarn':rich?'hkNacre':'hkShell';
 const th=Math.atan2(nx,nz);
 const openings=[{th,el:-.06,r:Math.min(1.25,R*.33),ky:1.3,kind:'door'},{th:th+.8,el:.12,r:R*.16,kind:'window'},{th:th-.8,el:.12,r:R*.16,kind:'window'},{th:th+.25,el:.78,r:R*.13,kind:'window'}];
 if(way)openings.push({th:th+Math.PI,el:-.06,r:Math.min(1.25,R*.33),ky:1.3,kind:'door',back:true});   // the back door, onto the host's plate
 const pod=hykPod({a:R,b:R*.86,c:R,e1:.9,e2:.94,cy:pd.y,nu:52,nv:28,noise:{amp:.028,su:4,sv:3,seed:(pd.a*10|0)+3},col,openings,hollow:{t:.07,col}});
 pod.geo.translate(cx,0,cz);hykPut(mat,pod.geo);if(pod.inner){pod.inner.translate(cx,0,cz);hykPut('hkIn',pod.inner,true);}
 const floorY=way?way.y+.05:pd.y-R*.86*.52;hykPut('hkFloor',hykDisc(cx,floorY,cz,R*.82,{col:hC(hPick(HPAL.floor))}),true);
 let door=null,back=null;for(const op of pod.openings){op.p=[op.p[0]+cx,op.p[1],op.p[2]+cz];
  if(op.kind==='door'&&op.back){back=op;hykDoor(op,{level:pd.level||'L1',nacre:rich,name:host.n+' way in',into:host.n});}
  else if(op.kind==='door'){door=op;hykDoor(op,{level:pd.level||'L1',nacre:rich,name:host.n+' pod'});}else hykWin(op,{nacre:rich,lit:rich,name:host.n+' pod'});}
 const contact=[host.x+(rs+.05)*nx,pd.y,host.z+(rs+.05)*nz];
 // the fillet: for a proud pod it reaches .45 R out from the wall at radius .9 R, inside the pod's surface there; a
 // bedded pod is narrower that far out, so its fillet is shallower (.3 R out at .86 R) or its lip would show as a torn
 // collar round the pod. Either way the fillet's outer edge hides the ragged edge of a way-in hole.
 hykPut(mat,hykFlare(contact,[nx,0,nz],R*(way?.86:.9),R*(way?.3:.45),{col}));
 // drips hang from the pod's underside, read off the superellipsoid itself, their bases .22 m up inside the shell (the
 // growth noise is ±3 %), so every spike is rooted
 const nd=Math.round(R*2.4),aw=R*.62/Math.max(1,rs);for(let i=0;i<nd;i++){const a2=pd.a+rr(-aw,aw);const ro=rs+rr(.25,R*.5);const h=rr(.35,1.1)*R*.3,w=h*.3;
  const px=host.x+ro*Math.cos(a2),pz=host.z+ro*Math.sin(a2);const under=hykPodUnder(R,R*.86,R,.9,.94,px-cx,pz-cz);if(under==null)continue;
  kput('hkDrip',[px,pd.y-under-h/2+.22,pz],qEuler(Math.PI,0,0),[w,h,w],col);}
 // satellites: two smaller pods grown beside the main one (a colony, not a lone blob), windows only, rooted alike
 // (beside a way-in pod they sit further round, clear of the hole in the wall, and are hollow like the main pod: through
 // the hole the inside of the host sees their inner skin, not their culled back faces)
 if(pd.cluster!==false){for(const sp of [{da:R*(way?1.75:1.05)/Math.max(1,rs),dy:-.6,k:.5},{da:-R*(way?1.65:.95)/Math.max(1,rs),dy:1.4,k:.36}]){const R2=R*sp.k;const a3=pd.a+sp.da;const n3x=Math.cos(a3),n3z=Math.sin(a3);const rs3=host.rAt(pd.y+sp.dy,a3);
  const c3x=host.x+(rs3+R2*.35)*n3x,c3z=host.z+(rs3+R2*.35)*n3z;const th3=Math.atan2(n3x,n3z);
  const p3=hykPod({a:R2,b:R2*.9,c:R2,e1:.92,e2:.95,cy:pd.y+sp.dy,nu:36,nv:20,noise:{amp:.03,su:4,sv:3,seed:(a3*7|0)+1},col,openings:[{th:th3,el:.1,r:R2*.22,kind:'window'},{th:th3+1.1,el:.35,r:R2*.16,kind:'window'}],hollow:{t:.08,col}});
  p3.geo.translate(c3x,0,c3z);hykPut(mat,p3.geo);if(p3.inner){p3.inner.translate(c3x,0,c3z);hykPut('hkIn',p3.inner,true);}for(const op of p3.openings){op.p=[op.p[0]+c3x,op.p[1],op.p[2]+c3z];hykWin(op,{nacre:rich,name:host.n+' pod'});}
  hykPut(mat,hykFlare([host.x+(rs3+.05)*n3x,pd.y+sp.dy,host.z+(rs3+.05)*n3z],[n3x,0,n3z],R2*.92,R2*.5,{col}));
  for(let i=0;i<3;i++){const a4=a3+rr(-.2,.2)*R2/Math.max(1,rs3);const ro=rs3+rr(.2,R2*.5);const h=rr(.3,.8)*R2*.3;const px=host.x+ro*Math.cos(a4),pz=host.z+ro*Math.sin(a4);
   const under=hykPodUnder(R2,R2*.9,R2,.92,.95,px-c3x,pz-c3z);if(under==null)continue;kput('hkDrip',[px,pd.y+sp.dy-under-h/2+.2,pz],qEuler(Math.PI,0,0),[h*.3,h,h*.3],col);}}}
 // the room: the pod's chamber, with the residence's three spots; a way-in pod keeps its axis clear between its doors
 const doors=[];if(door)doors.push({at:[door.p[0],door.p[2]],w:door.r*2,to:'landing'});if(back)doors.push({at:[back.p[0],back.p[2]],w:back.r*2,to:'host'});
 const room=ysRoom({building:host.n+' pod',bld:null,key:'accreted_pod',kind:'bedroom',poly:hykCirclePoly(cx,cz,R*.78,14),y:floorY,h:R*.86*1.3,
  doors,windows:[],culture:'hykkousoi',wealth:rich?.9:poor?.15:.5,residence:true});
 const bx=-nx,bz=-nz,sx=-nz,sz=nx;
 if(way){const ra=Math.atan2(nx,nz)+Math.PI/2;ysSpot({room:room.id,bld:null,kind:'bed',x:cx+sx*R*.45,z:cz+sz*R*.45,ry:ra,w:2.1,d:1.0});
  ysSpot({room:room.id,bld:null,kind:'store',x:cx-sx*R*.45+nx*R*.3,z:cz-sz*R*.45+nz*R*.3,ry:ra,w:1.2,d:.7});
  ysSpot({room:room.id,bld:null,kind:'food',x:cx-sx*R*.45-nx*R*.3,z:cz-sz*R*.45-nz*R*.3,ry:ra,w:.8,d:.8});}
 else{ysSpot({room:room.id,bld:null,kind:'bed',x:cx+bx*R*.42,z:cz+bz*R*.42,ry:Math.atan2(nx,nz),w:2.1,d:1.0});
  ysSpot({room:room.id,bld:null,kind:'store',x:cx-nz*R*.5,z:cz+nx*R*.5,ry:Math.atan2(nx,nz)+Math.PI/2,w:1.2,d:.7});
  ysSpot({room:room.id,bld:null,kind:'food',x:cx+nz*R*.5,z:cz-nx*R*.5,ry:Math.atan2(nx,nz)-Math.PI/2,w:.8,d:.8});}
 // the landing in front of the door, grown off the host, on a rib
 let pad=null;if(door&&pd.pad!==false){const dy=door.p[1]-door.r*door.ky+.12;const padR=Math.max(2.6,R*.72);const px=door.p[0]+door.n[0]*(padR*.9),pz=door.p[2]+door.n[2]*(padR*.9);
  pad=hykPad(px,dy,pz,padR,{col,mat:poor?'hkBarn':'hkShell',own:host.n});
  hykPut('hkBone',hykRib([host.x+(rs+.1)*nx,dy-3.6,host.z+(rs+.1)*nz],[px,dy-.45,pz],{rise:-1.4,r0:.36,r1:.26,knuckles:3,col:hC(hPick(HPAL.bone))}));
  // the rich pod's lamp: anchored on the shell beside and above the door (the pod's own surface), on a short bracket
  if(rich){const lu=(((th+.34)/TAU)%1+1)%1,lv=clamp((-.06+.42)/Math.PI+.5,.02,.98);const sp=pod.surf(lu,lv);const A=[sp[0]+cx,sp[1],sp[2]+cz];
   const vx=A[0]-cx,vy=A[1]-pd.y,vz=A[2]-cz;const vl=Math.hypot(vx,vy,vz)||1;hykLight(A[0]+vx/vl*.5,A[1]+vy/vl*.5+.12,A[2]+vz/vl*.5,{r:.2,nacre:true,level:pd.level||'L1',bracket:A});}
  host.landings.push({x:px,y:dy,z:pz,r:padR,level:pd.level||'L1',a:pd.a});}
 // a way in: the host's plate at that floor joins the walk plan, and the floor is inhabited
 if(way){const pr=host.rAt(way.y,pd.a)*.9;ysDeck({kind:'hostfloor',host:host.n,x:host.x,z:host.z,r:pr,x0:host.x-pr,z0:host.z-pr,x1:host.x+pr,z1:host.z+pr,w:pr*2,y:way.y,own:host.n,level:pd.level||'L2'});
  way.door=[back.p[0],back.p[2]];way.room=room.id;const f=ysHostInhabit(host,way.y,.8);if(f)f.way=true;}
 else ysHostInhabit(host,pd.y,.6);
 out.push({pod,cx,cz,R,door,back,pad,room,way});}
 return out;}
