// ================================================================= MID-RISE — "the Bell Hall" (a host: travertine drums, a concave wall, a campanile slab)
// A civic hall in pale travertine on a round podium terrace with steps and a balustrade. Three interlocking drums of
// different heights hold its rooms: a great drum (26 m) with a columned loggia round its top storey, a tall drum
// (36 m) of round windows, and a low drum whose ground storey is an arcade of round arches. In front of them one
// sweeping CONCAVE wall rises from 8 m at its west end to 48 m where it meets a tall narrow slab campanile (58 m);
// the slab's front carries a clock and a rusted iron cage of bells that rises 8 m above the slab top and closes as
// an open crown of ribs.
// HOST: the drums are big plain curved faces (bearings 180 to 320, behind the wall), the slab's east end a flat one.
// The great drum's loggia faces the front, away from every bearing; avoid() keeps pods under its roof (26 m), as the
// bearings that reach it cannot know the height. The cage, the clock and the wall face no bearing. Plates every
// 5 m from 7.5 m in each drum and the slab.
const HBH={Y0:2.5,P:5,PR:44,SEED:161,
 DRUMS:[{n:'great',x:-14,z:-14,r:17,top:26,ruin:26,loggia:[19.5,24],arc:[-.5,3],win:'pane'},
        {n:'tall',x:8,z:-18,r:12,top:36,ruin:31,win:'oval'},
        {n:'low',x:-26,z:16,r:9,top:12,ruin:12,arcade:8,win:'pane'}],
 SLAB:{x0:21,x1:33,z0:6,z1:11,top:58,ruin:50},
 WALL:{cx:0,cz:40,R:36,a0:-120*Math.PI/180,a1:-55*Math.PI/180,h0:8,h1:48,t:1.4},
 CAGE:{x0:22,x1:32,z0:11,z1:15,y0:40,y1:66,cx:27,cy:73,cz:13},CLOCK:[27,32]};
// the face radius along bearing th at builder height yl: the outermost drum or slab face the ray leaves
function hbhRAt(yl,th){if(yl<HBH.Y0)return HBH.PR;const c=Math.cos(th),s=Math.sin(th);let best=0;
 for(const D of HBH.DRUMS){if(yl>D.top)continue;const b=c*D.x+s*D.z,q=b*b-(D.x*D.x+D.z*D.z)+D.r*D.r;if(q>=0)best=Math.max(best,b+Math.sqrt(q));}
 const S=HBH.SLAB;if(yl<=S.top){let t0=-1e9,t1=1e9;for(const [o,a,b] of [[c,S.x0,S.x1],[s,S.z0,S.z1]]){if(Math.abs(o)<1e-9){if(0<a||0>b){t1=-1;}continue;}const p=a/o,q=b/o;t0=Math.max(t0,Math.min(p,q));t1=Math.min(t1,Math.max(p,q));}
  if(t1>=Math.max(t0,0))best=Math.max(best,t1);}
 return best||HBH.DRUMS[0].r;}
const HBH_MAT={trav:new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xf0e6d2,roughness:1,metalness:0,side:DS}),
 travR:new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x9d978b,roughness:1,metalness:0,side:DS})};
const HBH_T=d=>d>0?HBH_MAT.travR:HBH_MAT.trav;
kdef('hbhBell',new THREE.LatheGeometry([[.001,1],[.24,1],[.31,.93],[.35,.62],[.43,.32],[.58,.09],[.66,0],[.6,-.02]].map(p=>new THREE.Vector2(p[0],p[1])),16),MAT.verdigris);
kdef('hbhDial',new THREE.CircleGeometry(1,24),MAT.white);kdef('hbhDialR',new THREE.CircleGeometry(1,24),MAT.guts);
const HOSTSPEC_BELLHALL={name:'the Bell Hall',key:'midBell',builder:'buildHostBellHall',H:HBH.SLAB.top,Y0:HBH.Y0,podium:HBH.PR,cap:HBH.PR+4,shaped:true,square:false,
 floors:{y0:HBH.Y0+HBH.P,pitch:HBH.P,top:.3,first:.3},k0:0,plate:k=>HBH.Y0+HBH.P*(k+1)+.3,
 rAt:(yl,th)=>th==null?24:hbhRAt(yl,th),
 cuts:{tall:[27,37],mid:[17,32],low:[12,22],land:[12,27]},crownY:25,sink:'seabed',minY:9,
 avoid:(yl,h)=>yl+h+.5>HBH.DRUMS[0].top,   // the bearings reach the great drum: no pod above its roof (the loggia faces the front, away from them)
 bearings:(st,n)=>anhFaces([Math.PI,1.17*Math.PI,1.36*Math.PI,1.67*Math.PI,1.78*Math.PI],st,n,.12,.03)};   // the great and tall drums, behind the wall

function buildHostBellHall(scene,gx,gz,d){reseed(12040+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const SM=skyShardMark(),Y0=HBH.Y0,PS=HBH.P,B=new Map(),T=HBH_T(dd),S=HBH.SLAB,W=HBH.WALL,K=HBH.CAGE;
 REGISTER({name:'The Bell Hall — drums, a concave wall and a campanile ('+(d===2?'collapsed':STATE(d))+')',x:0,z:0,r:HBH.PR+2,h:K.cy+2});
 const yc=(typeof ysCutY==='function'?ysCutY(d):null),host=yc!=null,gcut=d===2?Y0+PS*2+2:yc;
 const topOf=(t,ruin)=>gcut!=null?Math.min(t,gcut):(d===1?ruin:t);
 let hole=holeFn(dd*(d===2?1.3:1),HBH.SEED,gcut!=null?gcut-Y0+25:null,1.5);
 if(typeof ysWallHole==='function')hole=ysWallHole(hole,Y0);         // YS: a way-in pod's hole through a drum's skin and lining
 const hostU=(x,z)=>(Math.atan2(z,x)/TAU+1)%1;
 // THE PODIUM TERRACE: steps at the front, a balustrade round the rest
 const PRs=(typeof ysPodiumR==='function'?ysPodiumR(HBH.PR):HBH.PR),pr=clamp(PRs,40.5,HBH.PR),shrunk=PRs<HBH.PR;
 anhPut(B,T,lathe({rFn:()=>pr,H:Y0,nu:72,nv:1}));anhPut(B,T,anhFan([...Array(72)].map((_,i)=>[pr*Math.cos(i/72*TAU),pr*Math.sin(i/72*TAU)]),Y0,1));
 if(!shrunk)for(let i=0;i<5;i++)kput(BOXC(dd),[0,(i+.5)*Y0/5/2,pr-.2+(5-i)*.75],null,[18,(i+.5)*Y0/5,.75],null);
 {const n=Math.round(TAU*pr/2.4),gap=a=>Math.abs(Math.atan2(Math.sin(a-Math.PI/2),Math.cos(a-Math.PI/2)))<.24;
  for(let k=0;k<n;k++){const a0=k/n*TAU,a1=(k+1)/n*TAU,r=pr-.4;if(gap(a0)||gap(a1))continue;if(dd&&h3(k,2,7)<.22)continue;
   const p0=[r*Math.cos(a0),Y0,r*Math.sin(a0)],p1=[r*Math.cos(a1),Y0,r*Math.sin(a1)];
   kput(BOXC(dd),[p0[0],Y0+.5,p0[2]],null,[.35,1,.35],null);beam(BOXC(dd),[p0[0],Y0+1.05,p0[2]],[p1[0],Y0+1.05,p1[2]],.22,.3);}}
 // THE DRUMS, each in its own group at its foot; the hole predicate asks the host's bearing
 for(const D of HBH.DRUMS){const top=topOf(D.top,D.ruin),L=top-Y0,cutD=top<D.top-.01;
  const P=new THREE.Group();P.position.set(D.x,Y0,D.z);G.add(P);useGroupXF(P);const BP=new Map();
  const hc=hole?(u,y)=>{const a=u*TAU;return hole(hostU(D.x+D.r*Math.cos(a),D.z+D.r*Math.sin(a)),y);}:null;
  const lg=D.loggia&&D.loggia[1]<=top?[D.loggia[0]-Y0,D.loggia[1]-Y0]:null,ar=D.arcade&&D.arcade<=top?D.arcade-Y0:null;
  const nb=14,bw=TAU*D.r/nb;   // the arcade's bays
  const arch=(u,y)=>{if(ar==null||y>ar)return false;const s=((u*nb)%1-.5)*bw;return Math.abs(s)<1.45&&y<ar-2.2+Math.sqrt(Math.max(0,2.1-s*s));};
  const inArc=u=>{if(!D.arc)return true;const a=Math.atan2(Math.sin(u*TAU),Math.cos(u*TAU));return a>D.arc[0]&&a<D.arc[1];};   // the loggia faces the front only
  const skinHole=(u,y)=>(hc&&hc(u,y))||(lg&&y>lg[0]&&y<lg[1]&&inArc(u))||arch(u,y);
  const nu=ar!=null?nb*6:Math.max(40,Math.round(TAU*D.r/1.7));
  anhPut(BP,T,lathe({rFn:()=>D.r,H:L,cut:cutD?L:null,jag:cutD?2:0,nu,nv:Math.round(L/(ar!=null?.55:2.5)),hole:skinHole,seed:HBH.SEED}));
  if(dd){anhPut(BP,MAT.guts,lathe({rFn:()=>D.r*.86,H:L,cut:cutD?L:null,jag:cutD?2:0,nu:Math.round(nu*.6),nv:Math.round(L/5),hole:hc,seed:HBH.SEED}));
   const ys=anhStoreys(Y0,PS,Y0,L,2);for(const y of ys){kput('slab',[0,y,0],null,[D.r*.9,.6,D.r*.9],new THREE.Color(0xbdb7ad));kput('slab',[0,y-.95,0],null,[D.r*.87,.7,D.r*.87],new THREE.Color(0x191b1f));}
   if(ys.length)skyRooms({rFn:()=>D.r*.84,y0:ys[0],y1:L-2,step:PS,soff:1.3,hole:hc,d,seed:HBH.SEED});}
  const ring=(r0,r1,y)=>gridSurface((u,v)=>{const a=u*TAU,r=lerp(r0,r1,v);return[r*Math.cos(a),y,r*Math.sin(a)];},48,1,{});
  // the loggia: a recessed glazed wall 3 m in, a floor, a soffit, a ring of columns
  if(lg){const A=D.arc,arcS=(r0,r1,y0,y1)=>gridSurface((u,v)=>{const a=lerp(A[0],A[1],u),r=y0===y1?lerp(r0,r1,v):r0;return[r*Math.cos(a),y0===y1?y0:lerp(y0,y1,v),r*Math.sin(a)];},30,1,{});
   anhPut(BP,MAT.darkGlass,arcS(D.r-3,0,lg[0],lg[1]));anhPut(BP,T,[arcS(D.r-3,D.r,lg[0],lg[0]),arcS(D.r-3,D.r,lg[1],lg[1])]);
   for(const e of A)anhPut(BP,T,gridSurface((u,v)=>[lerp(D.r-3,D.r,u)*Math.cos(e),lerp(lg[0],lg[1],v),lerp(D.r-3,D.r,u)*Math.sin(e)],1,1,{}));   // its end walls
   for(let k=0;k<20;k++){const a=lerp(A[0],A[1],(k+.5)/20);if(dd&&h3(k,D.r,3)<.15)continue;kput(dd?'postR':'postW',[(D.r-.7)*Math.cos(a),(lg[0]+lg[1])/2,(D.r-.7)*Math.sin(a)],null,[.5,lg[1]-lg[0],.5],null);}}
  // the arcade: a dark wall 3.2 m in behind the arches, and its soffit
  if(ar!=null){anhPut(BP,MAT.dark,lathe({rFn:()=>D.r-3.2,H:ar,nu:48,nv:1}));anhPut(BP,T,ring(D.r-3.2,D.r,ar));}
  // the roof and a low parapet, where the drum is whole
  if(!cutD){anhPut(BP,T,anhFan([...Array(48)].map((_,i)=>[(D.r+.05)*Math.cos(i/48*TAU),(D.r+.05)*Math.sin(i/48*TAU)]),L,1));anhPut(BP,T,lathe({rFn:()=>D.r+.05,H:1.1,nu:48,nv:1}).translate(0,L,0));}
  // small windows, square or round, in a sparse regular grid
  for(let y=PS*.5+(ar!=null?ar:0);y<L-2.5;y+=PS){const inLg=lg&&y>lg[0]-1.5&&y<lg[1]+1;const n=Math.round(TAU*D.r/(D.win==='oval'?7:6));
   for(let k=0;k<n;k++){const a=(k+.5*((y/PS|0)%2))/n*TAU,c=Math.cos(a),s=Math.sin(a),u=hostU(D.x+D.r*c,D.z+D.r*s);if(hc&&hc(a/TAU,y))continue;if(inLg&&inArc(a/TAU))continue;
    if(D.win==='oval')kput(dd?'ovalD':'ovalI',[c*(D.r+.05),y,s*(D.r+.05)],qFacing([c,0,s]),[.75,.75,.6],null);
    else kput(dd?'paneD':'pane',[c*(D.r+.06),y,s*(D.r+.06)],qFacing([c,0,s]),[1.3,1.3,1],null);}}
  anhFlush(BP,P);endGroupXF();}
 // THE SLAB CAMPANILE, in the builder's frame (its plan does not hold the axis)
 const st=topOf(S.top,S.ruin),sL=st,sCut=st<S.top-.01;
 {const hs=hole?(u,y)=>hole(u,y-Y0):null,plan=()=>[[S.x1,S.z0],[S.x1,S.z1],[S.x0,S.z1],[S.x0,S.z0]],inner=()=>[[S.x1-.7,S.z0+.7],[S.x1-.7,S.z1-.7],[S.x0+.7,S.z1-.7],[S.x0+.7,S.z0+.7]];
  anhPut(B,T,anhPrism({plan,y0:0,yA:Y0,yB:S.top,top:sCut?sL:null,jag:2,seed:HBH.SEED,cols:anhCols(plan(),1.8),dy:2.5,hole:hs}));
  if(dd){anhPut(B,MAT.guts,anhPrism({plan:inner,y0:0,yA:Y0,yB:S.top,top:sCut?sL:null,jag:2,seed:HBH.SEED,cols:anhCols(inner(),3),dy:5,hole:hs}));
   for(const y of anhStoreys(Y0,PS,0,sL,2)){kput('boxW',[(S.x0+S.x1)/2,y,(S.z0+S.z1)/2],null,[S.x1-S.x0-1.2,.6,S.z1-S.z0-1.2],new THREE.Color(0xbdb7ad));kput('boxD',[(S.x0+S.x1)/2,y-.95,(S.z0+S.z1)/2],null,[S.x1-S.x0-1.4,.7,S.z1-S.z0-1.4],null);}}
  if(!sCut){anhPut(B,T,anhFan(plan().map(p=>[p[0]-27,p[1]-8.5]),0,1).translate(27,S.top,8.5));}
  // the clock on the slab's front
  const [cx,cy]=HBH.CLOCK;if(cy<sL-3){kput(dd?'hbhDialR':'hbhDial',[cx,cy,S.z1+.06],null,[3.2,3.2,1],null);kput(dd?'ringR':'ringW',[cx,cy,S.z1+.1],null,[3.4,3.4,3],null);
   kput('strutR',[cx+.9*Math.sin(.6),cy+.9*Math.cos(.6),S.z1+.2],qEuler(0,0,-.6),[.22,1.9,.1],null);kput('strutR',[cx+1.2*Math.sin(2.9),cy+1.2*Math.cos(2.9),S.z1+.22],qEuler(0,0,-2.9),[.16,2.5,.1],null);}}
 // THE BELL CAGE: rusted iron, proud of the slab's front, rising above its top to an open crown of ribs
 {const ct=sCut?Math.min(sL+1.5,K.y1):K.y1,R='strutR',w=.45,V=[[K.x0,K.z0],[K.x1,K.z0],[K.x0,K.z1],[K.x1,K.z1],[K.x0+(K.x1-K.x0)/3,K.z1],[K.x0+2*(K.x1-K.x0)/3,K.z1]];
  if(ct>K.y0+1){for(const [x,z] of V){const h=sCut?(ct-K.y0)*(.5+.5*h3(x,z,1)):ct-K.y0;kput(R,[x,K.y0+h/2,z],null,[w,h,w],null);}
   for(let y=K.y0;y<=ct-.5;y+=6.5){kput(R,[(K.x0+K.x1)/2,y,K.z1],null,[K.x1-K.x0,w,w],null);kput(R,[(K.x0+K.x1)/2,y,K.z0+.1],null,[K.x1-K.x0,w,w],null);
    for(const x of [K.x0,K.x1])kput(R,[x,y,(K.z0+K.z1)/2],null,[w,w,K.z1-K.z0],null);}
   if(!sCut){for(const [x,z] of V){const m=[lerp(x,K.cx,.35)+(x-K.cx)*.25,K.y1+4.5,lerp(z,K.cz,.35)+(z-K.cz)*.25];
     beam(R,[x,K.y1,z],m,w,w);beam(R,m,[K.cx,K.cy,K.cz],w,w);}kput(R,[K.cx,K.cy+3,K.cz],null,[.2,6,.2],null);}}
  // the bells: hung from beams across the cage; those above a broken top lie on the terrace in front
  const bells=[[24.6,46,2.4],[29.4,46,2.4],[27,52.5,2.9],[25,59,2],[29,59,2]];
  bells.forEach(([x,y,s],i)=>{if(y+s<ct-.5){kput(R,[27,y+s+.2,(K.z0+K.z1)/2],null,[K.x1-K.x0,.4,.4],null);kput(R,[x,y+s*.5+.15,(K.z0+K.z1)/2],null,[.15,s*.6,.15],null);kput('hbhBell',[x,y,(K.z0+K.z1)/2],null,s,null);}
   else if(dd)kput('hbhBell',[x+rr(-4,4),Y0+s*.45,K.z1+5+rr(0,8)],qEuler(rr(1.2,1.9),rr(0,TAU),0),s,null);});}
 // THE CONCAVE WALL, from 8 m at its west end to 48 m against the slab, its hollow to the front
 {const top=a=>{const t=(a-W.a0)/(W.a1-W.a0),h=W.h0+(W.h1-W.h0)*Math.pow(t,1.6);return Math.max(Y0+1,Math.min(gcut!=null?gcut:(d===1?h*.82+fbm(a*9,1,3,2)*4:h),h));};
  const at=(a,r)=>[W.cx+r*Math.cos(a),W.cz+r*Math.sin(a)],nu=40,wh=hole?(u,v,r)=>{const a=lerp(W.a0,W.a1,u),p=at(a,r);return hole(hostU(p[0],p[1]),Y0+v*(top(a)-Y0)-Y0);}:null;
  for(const r of [W.R,W.R+W.t])anhPut(B,T,gridSurface((u,v)=>{const a=lerp(W.a0,W.a1,u),p=at(a,r);return[p[0],Y0+v*(top(a)-Y0),p[1]];},nu,Math.round((W.h1-Y0)/3),{uS:8,vS:5,hole:wh?(u,v)=>wh(u,v,r):null}));
  anhPut(B,T,gridSurface((u,v)=>{const a=lerp(W.a0,W.a1,u),p=at(a,lerp(W.R,W.R+W.t,v));return[p[0],top(a),p[1]];},nu,1,{}));
  anhPut(B,T,gridSurface((u,v)=>{const p=at(W.a0,lerp(W.R,W.R+W.t,u));return[p[0],Y0+v*(top(W.a0)-Y0),p[1]];},1,2,{}));}
 anhFlush(B,G);
 if(dd>0&&!shrunk){scatterMoss(0,0,0,pr+2,pr+80,150,3.2);rubbleRing(0,0,0,pr,pr+50,d===2?150:60,d===2?4:2.5);trees(0,0,pr+20,pr+110,16);vinesOnRing(0,Y0+1,0,pr-.5,22,3);}
 if(d===2)for(const D of HBH.DRUMS)rubbleRing(D.x,Y0,D.z,D.r*.4,D.r*1.8,50,4);
 if(d>0)skyShards(SM,d===3?.25:.5);
 if(!shrunk)figures(0,pr+8,5,10);KOFF=[0,0,0];return G;}
