// prefix: nr
// ================================================================= THE FORE: the forecourt plaza, the terraces, the grand stair, the bridge house, the bridge
// Drawn in the hull frame from the plan (14-nr-plan.js N.PLAZA, N.TIERS, N.FORE_STAIR, N.BRIDGEHOUSE). The PLAZA decks over
// the forward third of the basin at quay level, built like the hulls (antifouling, the barnacle band, white), its aft edge a
// quay with fenders and bollards; on it curved paths, planted beds and a fountain round Ruephus's headquarters (a lot,
// placed by 49). At its head the TERRACES climb to the top deck, each a curved glazed face with a rounded rail, the grand
// stair up their middle. On the bow the BRIDGE HOUSE: four storeys, each the bow's shape set in from the one below, glass
// bands under rounded rails; on top the BRIDGE, glazed all round under a visor roof, its wings out to either side, the mast.
// The bridge house's storeys are hollow decks round a spiral stair that climbs from the top deck to the bridge: the officers'
// hall, the chart and signal deck, the officers' berths and the lookout lounge (70 furnishes them, and the bridge).
/* a profile [[ds, dy], ...] lofted along a polyline in (x, z) at height y; ds along the polyline's outward normal (for a
   closed, anticlockwise outline: away from it; for an open one: to the right of its direction, turned -90 degrees). The
   facing is settled from the profile: a top segment faces up, a vertical-only profile faces out (o.inside reverses). */
function nrPolyLoft(mk,pts,closed,y,prof,col,o){o=o||{};const P=closed?pts.concat([pts[0]]):pts,n=P.length,m=prof.length-1;
 const N=P.map((p,i)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];let ex=b[0]-a[0],ez=b[1]-a[1];
  if(closed&&(i===0||i===n-1)){const a2=P[n-2],b2=P[1];ex=b2[0]-a2[0];ez=b2[1]-a2[1];}const l=Math.hypot(ex,ez)||1;return [ez/l,-ex/l];});
 const at=(u,v)=>{const q=u*(n-1),i=Math.min(n-2,Math.floor(q)),f=q-i,j=Math.min(m-1,Math.floor(v*m)),g=v*m-j;
  const ds=lerp(prof[j][0],prof[j+1][0],g),dy=lerp(prof[j][1],prof[j+1][1],g),nx=lerp(N[i][0],N[i+1][0],f),nz=lerp(N[i][1],N[i+1][1],f);
  return [lerp(P[i][0],P[i+1][0],f)+nx*ds,y+dy,lerp(P[i][1],P[i+1][1],f)+nz*ds];};
 /* the reference segment and the facing it wants */
 let ref=-1,best=-1e9;for(let j=0;j<m;j++){const dd=Math.abs(prof[j+1][0]-prof[j][0]),dh=Math.abs(prof[j+1][1]-prof[j][1]),hy=(prof[j][1]+prof[j+1][1])/2;if(dd>dh&&hy>best){best=hy;ref=j;}}
 const e=[P[1][0]-P[0][0],P[1][1]-P[0][1]],j=ref<0?0:ref,dsj=prof[j+1][0]-prof[j][0],dyj=prof[j+1][1]-prof[j][1];
 const dv=[N[0][0]*dsj,dyj,N[0][1]*dsj],cr=[0*dv[2]-e[1]*dv[1],e[1]*dv[0]-e[0]*dv[2],e[0]*dv[1]-0*dv[0]];
 const want=ref>=0?cr[1]:(cr[0]*N[0][0]+cr[2]*N[0][1]);let flip=want<0;if(o.inside)flip=!flip;
 psurf(mk,at,n-1,m,col,{flip});}
/* is the top deck at ring (t, s) covered by the fore (the terraces' top or the bridge house)? */
function nrUnderFore(t,s){const p=NR.at(t,s);return NR.inPoly(NR.BRIDGEHOUSE.storeys[0].poly,p[0],p[1])||NR.TIERS.some(T=>NR.inPoly(T.poly,p[0],p[1]));}
/* a slab over an outline with a round hole (the stairwell) at (cx, cz), top at y: the outline must be star-shaped from the
   hole's centre (the bridge house's are) */
function nrRingSlab(mk,poly,cx,cz,rh,y,th,col,under){const P=poly.concat([poly[0]]),n=P.length-1;
 const at=(u,v,yy)=>{const q=u*n,i=Math.min(n-1,Math.floor(q)),f=q-i,px=lerp(P[i][0],P[i+1][0],f),pz=lerp(P[i][1],P[i+1][1],f),dx=px-cx,dz=pz-cz,l=Math.hypot(dx,dz)||1;
  return [lerp(cx+dx/l*rh,px,v),yy,lerp(cz+dz/l*rh,pz,v)];};
 psurf(mk,(u,v)=>at(u,v,y),n,2,col);
 psurf(under?under[0]:mk,(u,v)=>at(u,v,y-th),n,2,under?under[1]:col,{flip:true});
 lathe(mk,cx,cz,[[rh,y-th],[rh,y]],32,col,{inward:true});}
/* a raised bed: a soft oval kerb of white, earth and turf in it; c the centre, rx along x, rz along z */
function nrBlob(cx,cz,rx,rz,wob,seg){const P=[];for(let i=0;i<seg;i++){const a=i/seg*TAU,r=1+wob*Math.sin(3*a+cx*.1)+wob*.5*Math.sin(5*a+cz*.1);P.push([cx+Math.cos(a)*rx*r,cz+Math.sin(a)*rz*r]);}
 const ar=P.reduce((s,p,i)=>{const q=P[(i+1)%P.length];return s+p[0]*q[1]-q[0]*p[1];},0);return ar<0?P.reverse():P;}
function nrBed2(Q,y){prism('white',Q,y,y+.55,P('white'));const c=Q.reduce((a,p)=>[a[0]+p[0]/Q.length,a[1]+p[1]/Q.length],[0,0]);
 prism('turf',Q.map(p=>[c[0]+(p[0]-c[0])*.9,c[1]+(p[1]-c[1])*.9]),y+.5,y+.58,hc(0x5e8040));}
/* the plaza's beds, by centre and size (mirrored across the axis): the flora pass puts trees on them */
const NR_PLAZA_BEDS=[[104,40,12,7],[140,34,13,8],[112,64,8,5],[160,52,7,5]];
function nrPlaza(){const L=NR.L,Pz=NR.PLAZA,y=L.D[0];reseed(4450);
 /* the platform, built like the hulls */
 prism('paint',Pz.poly,1.2,5.6,hc(NR_ANTIFOUL));prism('barn',Pz.poly,5.6,7.0,WHITE);prism('white',Pz.poly,7.0,y-L.SLAB,P('whiteS'));prism('deck',Pz.poly,y-L.SLAB,y,hc(0xd2ccbe));
 /* the quay at its aft edge: kerb, fenders, bollards; steps down to the water at each side of the mole */
 const zq=NR.at(Pz.tP,-NR.W.PONT)[1];
 beam('white',[Pz.XP+.18,y+.15,-zq],[Pz.XP+.18,y+.15,zq],.3,P('white'));
 for(let z=-zq+3;z<zq-2;z+=6.5){if(Math.abs(z)<10)continue;box('dark',Pz.XP-.2,6.3,z,.36,2.4,1.4,hc(0x1e2022));}
 for(let z=-zq+4;z<zq-3;z+=11){if(Math.abs(z)<11)continue;nrBollard(Pz.XP+.9,y,z);}
 /* the paths: the axis from the quay to the stair, a ring round the headquarters, a ring round the fountain, and two
    winding walks from the quay's corners to the terraces (a lighter paving, a hand's breadth proud) */
 const yp=y+.012,M=0xe8e2d4;
 psurf('marble',(u,v)=>[lerp(Pz.XP+.6,NR.FORE_STAIR.x0,u),yp,lerp(-4,4,v)],24,1,hc(M),{up:true});
 const hq=NR.LOTS.find(l=>l.use==='hq'),F=[152,0];
 for(const [cx,cz,r0,r1] of [[hq.x,hq.z,15,19],[F[0],F[1],7.5,10.5]])psurf('marble',(u,v)=>{const a=u*TAU,r=lerp(r0,r1,v);return [cx+Math.cos(a)*r,yp+.002,cz+Math.sin(a)*r];},64,1,hc(M),{up:true});
 for(const sg of [1,-1]){const path=t=>{const x=lerp(Pz.XP+4,NR.FORE_STAIR.x0-6,t),z=sg*(zq-14-(zq-26)*t+9*Math.sin(t*PI*2.2));return [x,z];};
  psurf('marble',(u,v)=>{const a=path(u),b=path(u+.01),dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,w=(v-.5)*3.6;return [a[0]-dz/l*w,yp+.004,a[1]+dx/l*w];},60,1,hc(M),{up:true});}
 /* the beds */
 for(const [x,z,rx,rz] of NR_PLAZA_BEDS)for(const sg of [1,-1])nrBed2(nrBlob(x,sg*z,rx,rz,.08,28),y);
 /* the fountain: a ring of white, water in it, a shell of white on a stem */
 lathe('white',F[0],F[1],[[6.2,y],[6.5,y+.25],[6.5,y+.8],[6.1,y+.85],[5.9,y+.35]],48,P('white'));
 cyl('water',F[0],y+.32,F[1],5.95,.2,hc(0x4a5a4a),48);cyl('white',F[0],y,F[1],.7,2.6,P('white'),16,.4);
 lathe('white',F[0],F[1],[[.4,y+2.6],[1.8,y+2.9],[2.6,y+3.3],[2.5,y+3.45],[.2,y+3.1]],32,P('white'));}
function nrTerraces(){const L=NR.L,W=NR.W,S=NR.FORE_STAIR,hw=S.w/2+.35;
 for(const T of NR.TIERS){
  prism('white',T.poly,T.y0,T.y1-.06,P('white'));prism('deck',T.poly,T.y1-.06,T.y1,hc(0xd6d0c2));
  /* the face: a glass band each storey, mullions */
  for(let y=T.y0;y<T.y1-.1;y+=L.DH){nrPolyLoft('glass',T.face,false,y,[[.05,.95],[.05,2.85]],hc(0x24343c));
   for(let i=1;i<T.face.length-1;i+=2){const p=T.face[i];box('white',p[0]-.08,y+.95,p[1],.24,1.9,.2,P('white'));}}
  /* the rounded rail on the terrace's edge, open where the stair comes up */
  const left=T.face.filter(p=>p[1]>hw),right=T.face.filter(p=>p[1]<-hw);
  for(const part of [left,right])if(part.length>1)nrPolyLoft('white',part,false,T.y1,T.k===2?NR_PARAPET_PROF:NR_RIBBON_PROF,P('white'));}
 /* the grand stair: a flight up each terrace, balustrades of rounded white rails on posts */
 let xa=S.x0;
 for(const f of S.flights){const rise=f.y1-f.y0,n=Math.max(8,Math.round(rise/.18)),run=(f.x1-xa)/n;
  for(let i=0;i<n;i++)box('marble',xa+(i+.5)*run,f.y0,0,run+.01,(i+1)*rise/n,S.w,hc(0xece6d8));
  for(const z of [-S.w/2-.15,S.w/2+.15]){box('white',(xa+f.x1)/2,f.y0,z,f.x1-xa,.3,.3,P('white'));
   const a=[xa,f.y0+1.0,z],b=[f.x1,f.y1+1.0,z];beam('white',a,b,.22,P('white'),true,10);
   for(let i=0;i<=4;i++){const x=lerp(xa,f.x1,i/4),yy=lerp(f.y0,f.y1,i/4);beam('white',[x,yy,z],[x,yy+1.0,z],.08,P('white'),true,6);}}
  xa=f.x1;}}
function nrBridgeHouse(){const L=NR.L,B=NR.BRIDGEHOUSE,br=B.bridge;reseed(4470);
 const St=B.stair;
 for(const S of B.storeys){
  /* the walls: a white sill, the glass, a white head, each seen from both sides */
  for(const inside of [false,true]){nrPolyLoft('white',S.poly,true,S.y0,[[0,0],[0,.85]],P('white'),{inside});
   nrPolyLoft('glass',S.poly,true,S.y0,[[.03,.85],[.03,2.95]],hc(0x24343c),{inside});nrPolyLoft('white',S.poly,true,S.y0,[[0,2.95],[0,L.DH-L.SLAB]],P('white'),{inside});}
  for(let i=0;i<S.poly.length;i+=4){const p=S.poly[i];box('white',p[0],S.y0+.85,p[1],.22,2.1,.22,P('white'));}
  /* its roof: the next storey's floor and the terrace outside it, open round the stair */
  nrRingSlab('deck',S.poly,St.x,St.z,St.hole,S.y1,L.SLAB,hc(0xd6d0c2),['plaster',hc(0xe4ded2)]);
  nrPolyLoft('white',S.poly,true,S.y1,[[0,-L.SLAB],[0,0]],P('white'));
  nrPolyLoft('white',S.poly,true,S.y1,NR_RIBBON_PROF,P('white'));
  /* a rail round the stairwell, open where the stair arrives */
  lathe('white',St.x,St.z,[[St.hole+.1,S.y1],[St.hole+.1,S.y1+1.0]],24,P('white'),{a0:.9,a1:TAU-.3});}
 /* the spiral stair: treads round a white column, a handrail on its outer edge */
 {const rise=.18,n=Math.round((St.y1-St.y0)/rise),da=.155;cyl('white',St.x,St.y0,St.z,.42,St.y1-St.y0+1.1,P('white'),14);
  for(let i=0;i<n;i++){const a=i*da,yy=St.y0+(i+1)*rise-.06;box('marble',St.x+Math.cos(a)*1.8,yy,St.z+Math.sin(a)*1.8,2.75,.08,.62,hc(0xece6d8),-a);}
  const hr=[];for(let i=0;i<=n;i++){const a=i*da;hr.push([St.x+Math.cos(a)*3.1,St.y0+i*rise+.95,St.z+Math.sin(a)*3.1]);}cord('white',hr,.05,P('white'));}
 /* the bridge: floor, a white sill, glass all round, a white head; a visor roof standing out over it */
 const y=br.y0,P2b=br.poly;
 for(const inside of [false,true]){nrPolyLoft('white',P2b,true,y,[[0,0],[0,1.0]],P('white'),{inside});
  nrPolyLoft('glass',P2b,true,y,[[.02,1.0],[.02,3.35]],hc(0x3a5260),{inside});nrPolyLoft('white',P2b,true,y,[[0,3.35],[0,3.9]],P('white'),{inside});}
 for(let i=0;i<P2b.length;i+=3){const p=P2b[i];box('white',p[0],y+1.0,p[1],.14,2.35,.14,P('white'));}
 const roof=P2b.map(p=>[br.xc+(p[0]-br.xc)*1.09,p[1]*1.12]);
 prism('white',roof,y+3.9,y+4.3,P('white'));nrPolyLoft('white',roof,true,y+4.3,[[-.05,-.4],[.1,-.2],[.12,0],[0,.08]],P('white'));
 /* the wings: decks out to either side with a rail and a small glazed cab at the end */
 const Wg=br.wings;for(const sg of [1,-1]){const z0=sg*(br.b-1.5),z1=sg*Wg.z,zc=(z0+z1)/2,len=Math.abs(z1-z0);
  box('white',Wg.x,y-.5,zc,Wg.d,.55,len,P('white'));box('deck',Wg.x,y+.05,zc,Wg.d-.2,.02,len,hc(0xbfb8aa));
  for(const dx of [-Wg.d/2+.1,Wg.d/2-.1])beam('white',[Wg.x+dx,y+1.05,z0],[Wg.x+dx,y+1.05,z1],.12,P('white'),true,8);
  box('white',Wg.x,y+.05,z1-sg*1.6,3.2,1.0,3.2,P('white'));box('glass',Wg.x,y+1.05,z1-sg*1.6,3.1,1.8,3.1,hc(0x3a5260));box('white',Wg.x,y+2.85,z1-sg*1.6,3.5,.3,3.5,P('white'));
  /* the wing's underside brackets back to the house */
  beam('white',[Wg.x,y-.5,z1-sg*1.5],[Wg.x,y-3.2,z0],.3,P('white'),true,8);}
 /* the mast: a white tapered pole on the roof, a yard, the Ancients' rotor radar, a lantern, Ruephus's flag */
 const M=B.mast,ym=y+4.3;cyl('white',M.x,ym,0,.45,M.h,P('white'),12,.18);
 box('white',M.x,ym+M.h*.62,0,.3,.25,9,P('white'));
 lathe('white',M.x,0,[[.1,ym+M.h*.45],[2.6,ym+M.h*.45+.5],[2.7,ym+M.h*.45+.7],[.2,ym+M.h*.45+.3]],24,P('white'));
 cyl('glass',M.x,ym+M.h,0,.35,.6,hc(0xd8c070),10);
 nrPirateFlag(M.x,ym+M.h+.6,0,3.5,4.4,2.9,PI/2);}
nrPart('fore',()=>{nrPlaza();nrTerraces();nrBridgeHouse();});
/* trees on the plaza's beds (placeholder flora, as the parks') */
nrAfter('plaza flora',function(){const L=NR.L;reseed(4480);let v=0;
 for(const [x,z,rx,rz] of NR_PLAZA_BEDS)for(const sg of [1,-1]){const n=rx>10?2:1;for(let i=0;i<n;i++){const xx=x+(n>1?(i?.45:-.45)*rx:0),zz=sg*z+rr(-1,1);
  place('nr-flora-shade-tree',xx,zz,rr(0,TAU),{y:L.D[0]+.58,v:v++});}}});
