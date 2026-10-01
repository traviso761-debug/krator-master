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
 const r0=REG.length;KOFF=[0,0,0];useGroupXF(G);TSTAT.cur=o.key+'/'+d;const lush=BIOME.lush;BIOME.lush=0;YS_CUT=o.cutY!=null?{cutY:o.cutY}:null;HOLES=1;
 const snap={};for(const n in KIT.items)snap[n]=KIT.items[n].length;
 let H=null;try{H=withFlatGround(()=>o.builder(G,0,0,d));}catch(e){reportErr('host '+o.key+' '+e.stack);}
 YS_CUT=null;BIOME.lush=lush;endGroupXF();KOFF=[0,0,0];TSTAT.cur=null;
 for(const n of ['trunk','leafCard'])if(KIT.items[n])KIT.items[n].length=snap[n]||0;    // a plant is never part of a building
 for(let i=r0;i<REG.length;i++){const r=REG[i];const p=loc(o.x,o.z,r.x,r.z,o.ry||0);r.x=p[0];r.z=p[1];r.y=(r.y||0)+(o.y||0);r.cls='host';r.key=o.key;r.id=i;
  r.tags=Object.assign({culture:'ancients',type:['civic'],wealth:'civic',decay:d,host:o.name||o.key},r.tags||{});}
 const sink=o.y||0;const host={n:o.name||o.key,key:o.key,x:o.x,z:o.z,ry:o.ry||0,y:sink,cap:o.cap||{hw:60},cutY:o.cutY!=null?o.cutY+sink:null,
  rAt:o.rAt||(()=>30),floors:[],landings:[],heads:[],piers:[],ring:o.ring||1,lit:false,G,reg:r0};
 if(o.floors){const top=host.cutY!=null?host.cutY-2:1e9;for(let k=0,y=o.floors.y0+sink;y<top;y+=o.floors.pitch,k++){
  host.floors.push({k,y,H:o.floors.pitch-.4,kind:y<-.6?'drowned':y<1.4?'tide':'wild',use:0});}}
 ysHost(host);return host;}
// a host floor is inhabited once something is grown at it
function ysHostInhabit(host,y,use){let best=null;for(const f of host.floors)if(!best||Math.abs(f.y-y)<Math.abs(best.y-y))best=f;if(best){best.kind='inhabited';best.use=Math.max(best.use,use||.5);}return best;}
// ---------------------------------------------------------------- the tideline: crust, weed, barnacle specks, foam
function hykTideline(host,o){o=o||{};const yb=-1.7,yt=1.3;const R=y=>host.rAt(y)+.3;
 hykPut('hkCrust',hykLathe({H:yt-yb,yBase:yb,cx:host.x,cz:host.z,rFn:y=>R(y+yb),nu:84,nv:6,noise:{amp:.05,su:7,sv:.6,seed:11},col:hC(hPick(HPAL.crust))}));
 const n=o.weed||Math.round(TAU*R(0)/1.5);for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.12,.12);const r=R(.3)+.1;const h=rr(1.2,3.4),w=rr(.5,1.2);
  kput('hkWeedCard',[host.x+r*Math.cos(a),.35-h/2,host.z+r*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[w,h,1],hC(hPick(HPAL.weed)));}
 const m=o.specks||Math.round(TAU*R(0)*2.4);for(let i=0;i<m;i++){const a=rng()*TAU,y=rr(-1.3,1.2);const r=R(y)+.04;const s=rr(.08,.24);
  kput('hkBarnB',[host.x+r*Math.cos(a),y,host.z+r*Math.sin(a)],null,[s,s*.7,s],hC(hPick(HPAL.barnacle)));}
 const f=hykSurf((u,v)=>{const th=u*TAU;const r=R(0)+.1+v*(o.foam||2.4)*(1+.3*Math.sin(th*7));return [host.x+r*Math.cos(th),.06,host.z+r*Math.sin(th)];},84,2,{col:HYK_WHITE,flip:true});
 const fm=new THREE.Mesh(f,MAT.hkFoam);fm.userData.probeSkip=true;fm.renderOrder=2;scene.add(fm);}
// ---------------------------------------------------------------- accretion: pods grown onto a host's face
// pods: [{y, a (azimuth, world: 0 = +x, pi/2 = +z), R, wealth:'poor'|'middle'|'rich', level:'L1'|'L2', pad:true}]
function hykAccrete(host,pods){const out=[];for(const pd of pods){
 const rs=host.rAt(pd.y);const nx=Math.cos(pd.a),nz=Math.sin(pd.a);const R=pd.R;const cx=host.x+(rs+R*.3)*nx,cz=host.z+(rs+R*.3)*nz;   // 70 % of the pod proud of the face
 const poor=pd.wealth==='poor',rich=pd.wealth==='rich';const col=hC(hPick(poor?HPAL.barnacle:rich?HPAL.nacre:HPAL.shell));const mat=poor?'hkBarn':rich?'hkNacre':'hkShell';
 const th=Math.atan2(nx,nz);
 const pod=hykPod({a:R,b:R*.86,c:R,e1:.9,e2:.94,cy:pd.y,nu:52,nv:28,noise:{amp:.028,su:4,sv:3,seed:(pd.a*10|0)+3},col,
  openings:[{th,el:-.06,r:Math.min(1.25,R*.33),ky:1.3,kind:'door'},{th:th+.8,el:.12,r:R*.16,kind:'window'},{th:th-.8,el:.12,r:R*.16,kind:'window'},{th:th+.25,el:.78,r:R*.13,kind:'window'}],hollow:{t:.07,col}});
 pod.geo.translate(cx,0,cz);hykPut(mat,pod.geo);if(pod.inner){pod.inner.translate(cx,0,cz);hykPut('hkIn',pod.inner,true);}
 const floorY=pd.y-R*.86*.52;hykPut('hkFloor',hykDisc(cx,floorY,cz,R*.82,{col:hC(hPick(HPAL.floor))}),true);
 let door=null;for(const op of pod.openings){op.p=[op.p[0]+cx,op.p[1],op.p[2]+cz];if(op.kind==='door'){door=op;hykDoor(op,{level:pd.level||'L1',nacre:rich,name:host.n+' pod'});}else hykWin(op,{nacre:rich,lit:rich,name:host.n+' pod'});}
 const contact=[host.x+(rs+.05)*nx,pd.y,host.z+(rs+.05)*nz];
 hykPut(mat,hykFlare(contact,[nx,0,nz],R*.9,R*.45,{col}));
 const nd=Math.round(R*2.4);for(let i=0;i<nd;i++){const a2=pd.a+rr(-.95,.95);const ro=rs+rr(.3,R*.95);const h=rr(.35,1.1)*R*.3,w=h*.3;
  kput('hkDrip',[host.x+ro*Math.cos(a2),pd.y-R*.86*.74-h/2,host.z+ro*Math.sin(a2)],qEuler(Math.PI,0,0),[w,h,w],col);}
 // the room: the pod's chamber, with the residence's three spots
 const room=ysRoom({building:host.n+' pod',bld:null,key:'accreted_pod',kind:'bedroom',poly:hykCirclePoly(cx,cz,R*.78,14),y:floorY,h:R*.86*1.3,
  doors:door?[{at:[door.p[0],door.p[2]],w:door.r*2,to:'landing'}]:[],windows:[],culture:'hykkousoi',wealth:rich?.9:poor?.15:.5,residence:true});
 const bx=-nx,bz=-nz;ysSpot({room:room.id,bld:null,kind:'bed',x:cx+bx*R*.42,z:cz+bz*R*.42,ry:Math.atan2(nx,nz),w:2.1,d:1.0});
 ysSpot({room:room.id,bld:null,kind:'store',x:cx-nz*R*.5,z:cz+nx*R*.5,ry:Math.atan2(nx,nz)+Math.PI/2,w:1.2,d:.7});
 ysSpot({room:room.id,bld:null,kind:'food',x:cx+nz*R*.5,z:cz-nx*R*.5,ry:Math.atan2(nx,nz)-Math.PI/2,w:.8,d:.8});
 // the landing in front of the door, grown off the host, on a rib
 let pad=null;if(door&&pd.pad!==false){const dy=door.p[1]-door.r*door.ky+.12;const padR=Math.max(2.6,R*.72);const px=door.p[0]+door.n[0]*(padR*.9),pz=door.p[2]+door.n[2]*(padR*.9);
  pad=hykPad(px,dy,pz,padR,{col,mat:poor?'hkBarn':'hkShell',own:host.n});
  hykPut('hkBone',hykRib([host.x+(rs+.1)*nx,dy-3.6,host.z+(rs+.1)*nz],[px,dy-.45,pz],{rise:-1.4,r0:.36,r1:.26,knuckles:3,col:hC(hPick(HPAL.bone))}));
  if(rich)hykLight(door.p[0]+door.n[0]*.5-nz*1.3,door.p[1]+door.r*door.ky+.25,door.p[2]+door.n[2]*.5+nx*1.3,{r:.2,nacre:true,level:pd.level||'L1'});
  host.landings.push({x:px,y:dy,z:pz,r:padR,level:pd.level||'L1',a:pd.a});}
 ysHostInhabit(host,pd.y,.6);
 out.push({pod,cx,cz,R,door,pad,room});}
 return out;}
