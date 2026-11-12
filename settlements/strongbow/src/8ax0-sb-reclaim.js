// ================================================================= STRONGBOW TODAY — the reclamation, drawn from the layout's records
// sbReclaim(gx, gz) draws on the arcology's ruin (kits/ancients/targets/strongbow, d = 1) what its people made of it since
// (settlements/strongbow/PLAN.md, src/30-sb-layout.js):
// - Xanadu's girder lift frames, with their cages and capstan houses; the wall landings; the girder bridges;
// - the re-glazed south side of the lobby, the bazaar's stalls, a stand-in serai on the terminus hall's platforms;
// - the sealed burned run, the barred stair at T3;
// - the outcasts' rope ways;
// - the Order's balloon, shed and signal mast on the Nock;
// - the Sultanate's post and caravan yard at the lip;
// - the banners.
// Everything is registered in core/tags first. Hashed only (no rng()): listed in build.py's DETERMINISTIC. The town's own
// buildings (the rings, on core/city with the scrap Xanadu set) are SB3's (8ax1); the serai and the plaza's three are stand-ins only
// where the scrap set is not on the page.
kdef('sbBall',new THREE.SphereGeometry(1,18,12),MAT.acKit);
const SB_RED=new THREE.Color(0x9a2a1e),SB_GOLD=new THREE.Color(0xc89a3a),SB_SAFFRON=new THREE.Color(0xe0901a),SB_GIRDER=new THREE.Color(0x7a3428),SB_BRONZE=new THREE.Color(0xb07a40);

function sbReclaim(gx,gz){const L=sbLayout(),P={},h=(a,b,c,e)=>STRONGBOW.h(1647,700+a,b,c,e);for(const p of L.parts)P[p.id]=p;KOFF=[gx,0,gz];
 const W=a=>[a[0]+gx,a[1],a[2]+gz],ctr=p=>{const s=p.shape;return s[0]==='box'?[(s[1]+s[2])/2,p.y,(s[3]+s[4])/2]:[s[1],p.y,s[2]];};
 // ---- core/tags: what this layer places -------------------------------------------------------------------------------------
 {const T=KTAGS.strongbow||(KTAGS.strongbow=KTAGS.create({build:'ancients-strongbow'})),B='ruin/strongbow',X={culture:'xanadu',state:'reclaimed'};
  for(const w of L.ways){if(w.kind==='lift'&&w.id!=='L1')T.child(B,{'class':'infrastructure',kind:'lift',key:'sb.today.'+w.id,at:W([w.frame[0],w.y0,w.frame[1]]),h:w.y1-w.y0,tags:Object.assign({role:w.elevator?'the elevator':w.gated?'the salvagers\' lift':'a lift'},X)});
   else if(w.kind==='bridge')T.child(B,{'class':'infrastructure',kind:'bridge',key:'sb.today.'+w.id,at:W(ctr(P[w.a])),tags:X});
   else if(w.kind==='rope')T.child(B,{'class':'infrastructure',kind:'rope-way',key:'sb.today.'+w.id,at:W(ctr(P[w.a])),tags:{culture:'outcasts'}});}
  for(const p of L.parts)if(p.kind==='landing'&&p.id!=='sb.nock.landing')T.child(B,{'class':'part',kind:'landing',key:'sb.today.'+p.id,at:W(ctr(p)),tags:X});
  if(!sbTownKit())T.child(B,{'class':'building',kind:'caravanserai',key:'sb.today.serai',name:'the terminus serai (stand-in)',at:W(ctr(P['sb.hall.serai'])),tags:Object.assign({types:['inn','market']},X)});
  T.child(B,{'class':'fixture',kind:'balloon',key:'sb.today.balloon',name:'the Order\'s balloon',at:W(ctr(P['sb.nock.pad'])),tags:{culture:'order'}});
  T.child(B,{'class':'building',kind:'toll-post',key:'sb.today.lippost',name:'the Sultanate\'s post at the lip',at:W(ctr(P['sb.lip.post'])),tags:Object.assign({types:['civic']},X)});}

 // ---- the girder lifts: four painted posts with bronze collars, X-braced faces, a cage, a capstan house at the head -----------
 for(const w of L.ways){if(w.kind!=='lift'||w.id==='L1')continue;const x=w.frame[0],z=w.frame[1],y0=w.y0,y1=w.y1+4,hw=3.5;
  for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]])beam('acBox',[x+dx*hw,y0,z+dz*hw],[x+dx*hw,y1,z+dz*hw],1.1,1.1,SB_GIRDER);
  for(let y=y0,k=0;y<y1-6;y+=12,k++){const ya=y,yb=Math.min(y+12,y1);
   for(const [a,b] of [[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]]){
    beam('acBox',[x+a[0]*hw,ya,z+a[1]*hw],[x+b[0]*hw,yb,z+b[1]*hw],.5,.5,SB_GIRDER);
    beam('acBox',[x+a[0]*hw,ya,z+a[1]*hw],[x+b[0]*hw,ya,z+b[1]*hw],.6,.6,SB_GIRDER);}
   if(k%2===0)for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]])kput('sbCyl',[x+dx*hw,ya+1,z+dz*hw],null,[1,1.2,1],SB_BRONZE);}
  const cy=lerp(y0,w.y1,h(1,w.id.length,Math.round(x)));kput('acBox',[x,cy+2,z],null,[5.6,4,5.6],SB_BRONZE);
  kput('acBox',[x,y1+3,z],null,[11,6,11],new THREE.Color(0xe6dcc6));kput('acBox',[x,y1+6.4,z],null,[12,.8,12],SB_RED);
  kput('sbCyl',[x,y1+3,z+6.2],qEuler(Math.PI/2,0,0),[3.4,.6,3.4],SB_BRONZE);
  if(w.elevator||w.id==='L2a'){kput('acBox',[x,y1+11,z],null,[.3,9,.3],new THREE.Color(0x5a4630));kput('acBox',[x+1.6,y1+14,z],null,[3,1.8,.08],w.gated?SB_GOLD:SB_RED);}
  REGISTER({name:'Strongbow today — lift '+w.id+(w.elevator?' (the elevator)':w.gated?' (the salvagers\', gated)':''),x,z,r:7,y:y0,h:y1-y0+8});}
 // ---- the wall landings: ledges bolted to the face, cable rails --------------------------------------------------------------
 for(const p of L.parts){if(p.kind!=='landing'||p.id==='sb.nock.landing')continue;const s=p.shape,c=ctr(p);
  kput('acBox',[c[0],p.y-.6,c[2]],null,[s[2]-s[1],1.2,s[4]-s[3]],new THREE.Color(0xb8b0a0));
  for(const sx of [-1,1])beam('acBox',[c[0]+sx*(s[2]-s[1])/2,p.y+1.1,s[3]],[c[0]+sx*(s[2]-s[1])/2,p.y+1.1,s[4]],.15,.15,new THREE.Color(0x2c3236));
  beam('acBox',[s[1],p.y+1.1,s[4]],[s[2],p.y+1.1,s[4]],.15,.15,new THREE.Color(0x2c3236));
  for(let i=0;i<3;i++)beam('acBox',[s[1]+(s[2]-s[1])*(i+.5)/3,p.y-1,s[3]],[s[1]+(s[2]-s[1])*(i+.5)/3,p.y-9,s[3]-2],.6,.6,SB_GIRDER);}
 // the Nock's transfer landing: a deck on the west wing's inner end and its wall against the Order's field
 {const p=P['sb.nock.landing'],s=p.shape,c=ctr(p);kput('acBox',[c[0],p.y+.6,c[2]],null,[s[2]-s[1],1.2,s[4]-s[3]],new THREE.Color(0xb8b0a0));
  const wl=P['sb.nock.wall'].shape;kput('acBox',[(wl[1]+wl[2])/2,p.y+3,(wl[3]+wl[4])/2],null,[1.4,6,wl[4]-wl[3]],new THREE.Color(0xd8ccb2));}
 // ---- the girder bridges: a truss from part to part --------------------------------------------------------------------------
 for(const w of L.ways){if(w.kind!=='bridge'||!w.pts)continue;const a=[w.pts[0][0],P[w.a].y+1,w.pts[0][1]],b=[w.pts[1][0],P[w.b].y+1,w.pts[1][1]];
  beam('acBox',a,b,4,.8,new THREE.Color(0xc8bea8));
  for(const o of [-2,2]){const n=[b[2]-a[2],0,a[0]-b[0]],l=Math.hypot(n[0],n[2])||1,q=[n[0]/l*o,0,n[2]/l*o];
   beam('acBox',[a[0]+q[0],a[1]+1.2,a[2]+q[2]],[b[0]+q[0],b[1]+1.2,b[2]+q[2]],.2,.2,new THREE.Color(0x2c3236));
   beam('acBox',[a[0]+q[0],a[1]-.4,a[2]+q[2]],[b[0]+q[0],b[1]-.4,b[2]+q[2]],.8,1.6,SB_GIRDER);}}
 // ---- the outcasts' rope ways: ropes and hauled baskets down the face to the scree ------------------------------------------
 for(const w of L.ways){if(w.kind!=='rope')continue;const a=ctr(P[w.a]),b=ctr(P[w.b]),top=[b[0]-P[w.b].shape[3]*.7,b[1]+8,b[2]];
  for(const o of [-1.2,0,1.2])beam('acBox',[a[0]+o,a[1],a[2]],[top[0]+o,top[1],top[2]],.12,.12,new THREE.Color(0x4a3a28));
  for(let i=1;i<6;i++){const t=i/6;kput('acBox',[lerp(a[0],top[0],t),lerp(a[1],top[1],t)-1.4,lerp(a[2],top[2],t)],null,[1.6,1.4,1.6],new THREE.Color(0x7a5a34));}
  /* their fires in the squatted drums */ for(const p of L.parts)if(p.state==='squatted'&&p.kind==='drum')for(let j=0;j<5;j++){const a2=h(2,j,Math.round(p.y))*Math.PI*2,r=p.shape[3]+.4;
   kput('acPane',[p.shape[1]+Math.cos(a2)*r,p.y+3+h(3,j,Math.round(p.y))*(p.h-6),p.shape[2]+Math.sin(a2)*r],qFacing([Math.cos(a2),0,Math.sin(a2)]),[2.6,1.6,1],new THREE.Color(0xff8a3a).multiplyScalar(.8));}}
 // ---- the sealed run and the barred stair -----------------------------------------------------------------------------------
 for(const p of L.parts){if(p.state!=='sealed'||p.kind!=='drum')continue;const c=ctr(p),r=p.shape[3];
  for(let j=0;j<10;j++){const a=j/10*Math.PI*2;kput('stain',[c[0]+Math.cos(a)*(r+.3),c[1]+p.h*.6,c[2]+Math.sin(a)*(r+.3)],qFacing([Math.cos(a),0,Math.sin(a)]),[10,p.h*.9,1],null);}}
 {const t=P['sb.T3'],c=ctr(t);kput('acBox',[c[0]+12,t.y+3,c[2]-20],null,[8,6,.6],new THREE.Color(0x5a4630));kput('acBox',[c[0]+12,t.y+6.4,c[2]-20],null,[9,.6,.9],SB_RED);}

 // ---- the lobby: scrap glass on its south side, the bazaar's stalls ---------------------------------------------------------
 {const lb=L.lobby,c=lb.at,r=lb.r+.3;
  for(let i=0;i<18;i++)for(let k=0;k<3;k++){const a=Math.PI*(i+.5)/18,y=6+k*10;const col=new THREE.Color([0xd8a050,0x5aa8a0,0xc87a3a][(i+k)%3]).multiplyScalar(.85);
   kput('acPane',[c[0]+Math.cos(a)*r,y,c[2]+Math.sin(a)*r],qFacing([Math.cos(a),0,Math.sin(a)]),[9.6,8,1],col);}
  const lob=P['sb.lobby'],r0=lob.shape[3]+3,r1=lob.shape[4]-4,cloth=[0xa83a2a,0xd8a040,0x2a5a8a,0xe8dcc0,0x6a8a3a];
  for(let i=0;i<46;i++){const a=h(4,i)*Math.PI*2,rr=lerp(r0,r1,h(5,i)),x=c[0]+Math.cos(a)*rr,z=c[2]+Math.sin(a)*rr;
   kput('acBox',[x,3.2,z],qEuler(0,-a,.1),[5,.15,4],new THREE.Color(cloth[i%5]));kput('acBox',[x,.6,z],qEuler(0,-a,0),[2.4,1.2,1.6],new THREE.Color(0x8a6a44));
   kput('figB',[x+1.5,0,z+1],qEuler(0,h(6,i)*6.28,0),1,new THREE.Color().setHSL(.03+.1*h(7,i),.45,.36));kput('figH',[x+1.5,0,z+1],null,1,new THREE.Color(0xa87a56));}
  REGISTER({name:'Strongbow today — the bazaar in the lobby',x:c[0],z:c[2],r:lb.r,y:0,h:6});}
 // ---- the serai on the hall's platforms (a stand-in for the scrap set's xa_scrap_serai, drawn by 8ax1 where XAK is on the page)
 if(!sbTownKit()){const p=P['sb.hall.serai'],s=p.shape,cx=(s[1]+s[2])/2,cz=(s[3]+s[4])/2,w=s[2]-s[1]-8,d=s[4]-s[3]-8;
  for(const [ox,oz,bw,bd] of [[0,-d/2+4,w,8],[0,d/2-4,w,8],[-w/2+4,0,8,d-16],[w/2-4,0,8,d-16]]){
   kput('acBox',[cx+ox,4,cz+oz],null,[bw,8,bd],new THREE.Color(0xe6dcc6));kput('acBox',[cx+ox,8.3,cz+oz],null,[bw+.6,.6,bd+.6],SB_RED);}
  kput('acBox',[cx+w/2,6,cz],null,[2,12,12],SB_GOLD);
  for(let i=0;i<12;i++)kput('figB',[cx+(h(8,i)-.5)*w*.6,0,cz+(h(9,i)-.5)*d*.5],qEuler(Math.PI/2,h(10,i)*6,0),[2.2,1.6,2.2],new THREE.Color(0x6a4a2e));
  REGISTER({name:'Strongbow today — the terminus serai (stand-in)',x:cx,z:cz,r:Math.hypot(w,d)/2,y:0,h:9});}
 // ---- the plaza's gate, shrine and pavilion (stand-ins for the scrap set's, drawn by 8ax1 where XAK is on the page) -----------
 if(!sbTownKit()){const g=P['sb.plaza.gate'],s=g.shape,c=ctr(g);for(const dz of [-1,1])kput('acBox',[c[0],g.y+8,c[2]+dz*12],null,[10,16,6],new THREE.Color(0xe2d8c2));
  beam('acBox',[c[0],g.y+15,c[2]-12],[c[0],g.y+15,c[2]+12],2,2,SB_GIRDER);
  for(const dz of [-1,1]){kput('acBox',[c[0],g.y+21,c[2]+dz*12],null,[.3,10,.3],new THREE.Color(0x5a4630));kput('acBox',[c[0]+1.8,g.y+24,c[2]+dz*12],null,[3.4,2,.08],SB_RED);}
  const sh=P['sb.plaza.shrine'],cs=ctr(sh);kput('sbCyl',[cs[0],sh.y+4,cs[2]],null,[sh.shape[3]*.8,8,sh.shape[3]*.8],new THREE.Color(0xe8e0cc));
  kput('sbBall',[cs[0],sh.y+8,cs[2]],null,[sh.shape[3]*.7,sh.shape[3]*.6,sh.shape[3]*.7],new THREE.Color(0x4f7a6c));kput('finial',[cs[0],sh.y+16,cs[2]],null,[1.4,2.4,1.4],null);
  const pv=P['sb.plaza.pavilion'],cp=ctr(pv);for(let i=0;i<8;i++){const a=i*Math.PI/4;beam('acBox',[cp[0]+Math.cos(a)*14,pv.y,cp[2]+Math.sin(a)*14],[cp[0]+Math.cos(a)*14,pv.y+7,cp[2]+Math.sin(a)*14],.9,.9,SB_GIRDER);}
  kput('sbBall',[cp[0],pv.y+7,cp[2]],null,[15,6,15],new THREE.Color(0x9ac8c8));}

 // ---- the Nock: the Order's balloon on the pad, its shed and the signal mast -----------------------------------------------
 {const pad=ctr(P['sb.nock.pad']),y=P['sb.nock.pad'].y;
  kput('sbBall',[pad[0],y+26,pad[2]],null,[9,11,9],SB_SAFFRON);kput('sbBall',[pad[0],y+26.5,pad[2]],qEuler(0,.5,0),[9.1,4,9.1],new THREE.Color(0x9a2a1e));
  kput('acBox',[pad[0],y+12,pad[2]],null,[3,2,3],new THREE.Color(0x7a5a34));
  for(const [dx,dz] of [[-1,-1],[1,-1],[1,1],[-1,1]])beam('acBox',[pad[0]+dx*1.4,y+13,pad[2]+dz*1.4],[pad[0]+dx*6,y+19,pad[2]+dz*6],.12,.12,new THREE.Color(0x3a3020));
  for(const [dx,dz] of [[-1,0],[1,0]])beam('acBox',[pad[0]+dx*1.4,y+11,pad[2]],[pad[0]+dx*12,y,pad[2]+dz],.12,.12,new THREE.Color(0x3a3020));
  const sh=P['sb.nock.shed'].shape;kput('acBox',[(sh[1]+sh[2])/2,y+6,(sh[3]+sh[4])/2],null,[sh[2]-sh[1],12,sh[4]-sh[3]],new THREE.Color(0xd8c8a8));
  kput('acBox',[(sh[1]+sh[2])/2,y+12.4,(sh[3]+sh[4])/2],null,[sh[2]-sh[1]+1,.8,sh[4]-sh[3]+1],SB_SAFFRON);
  const m=P['sb.nock.mast'],mc=ctr(m);kput('acBox',[mc[0],y+15,mc[2]],null,[.8,30,.8],new THREE.Color(0x5a4630));
  kput('sbCyl',[mc[0]+1,y+28,mc[2]+2],qEuler(Math.PI/2,0,.3),[3,.4,3],new THREE.Color(0xe6eef2));kput('acPane',[mc[0],y+31,mc[2]+.6],null,[2,2,1],new THREE.Color(0xffd080));
  kput('acBox',[mc[0]+2.5,y+24,mc[2]],null,[5,7,.12],SB_SAFFRON);
  REGISTER({name:'Strongbow today — the Order\'s balloon on the Nock',x:pad[0],z:pad[2],r:14,y:y,h:40});}
 // ---- the top: the Sultanate's post at the lip and the caravan yard -------------------------------------------------------
 {const po=P['sb.lip.post'],s=po.shape,c=ctr(po);kput('acBox',[c[0],po.y+5,c[2]],null,[s[2]-s[1],10,s[4]-s[3]],new THREE.Color(0xe2d8c2));
  kput('acBox',[c[0],po.y+10.4,c[2]],null,[s[2]-s[1]+1,.8,s[4]-s[3]+1],SB_RED);
  kput('acBox',[c[0],po.y+16,c[2]],null,[.3,12,.3],new THREE.Color(0x5a4630));kput('acBox',[c[0]+2,po.y+20,c[2]],null,[4,2.4,.1],SB_RED);
  const yd=P['sb.lip.yard'],t=yd.shape;for(const [a,b] of [[[t[1],t[3]],[t[2],t[3]]],[[t[2],t[3]],[t[2],t[4]]],[[t[2],t[4]],[t[1],t[4]]],[[t[1],t[4]],[t[1],t[3]]]])
   beam('acBox',[a[0],yd.y+1,a[1]],[b[0],yd.y+1,b[1]],.4,2,new THREE.Color(0xc8b896));
  kput('acBox',[t[1]+10,yd.y+3,(t[3]+t[4])/2],null,[16,6,(t[4]-t[3])*.8],new THREE.Color(0xd8c8a8));
  for(let i=0;i<10;i++)kput('figB',[lerp(t[1]+24,t[2]-6,h(11,i)),yd.y,lerp(t[3]+6,t[4]-6,h(12,i))],qEuler(Math.PI/2,h(13,i)*6,0),[2.4,1.8,2.4],new THREE.Color(0x4a3a2e));
  REGISTER({name:'Strongbow today — the Sultanate\'s post at the lip',x:c[0],z:c[2],r:30,y:po.y,h:22});}
 // ---- the Order's banners at its gatehouse --------------------------------------------------------------------------------
 {const g=P['sb.lip.gatehouse'],s=g.shape;for(let i=0;i<3;i++){const x=lerp(s[1]+10,s[2]-10,i/2);
  kput('acBox',[x,g.y+g.h+6,s[4]+.5],null,[.3,12,.3],new THREE.Color(0x5a4630));kput('acBox',[x+1.8,g.y+g.h+9,s[4]+.5],null,[3.4,6,.1],SB_SAFFRON);}}
 KOFF=[0,0,0];}
