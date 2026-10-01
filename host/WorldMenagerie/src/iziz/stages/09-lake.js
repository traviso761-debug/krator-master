// ---------- the lake in the south-east corner: an irregular oval the river drains ----------
const LAKE=(()=>{const th=45*Math.PI/180,r=740;return {cx:r*Math.cos(th),cz:r*Math.sin(th),ur:[Math.cos(th),Math.sin(th)],ut:[-Math.sin(th),Math.cos(th)],A:130,B:150,L:0};})();
LAKE.rad=t=>1+0.12*Math.sin(3*t+1)+0.07*Math.sin(5*t+2);
// e: 0 at the centre, 1 on the shore
function lakeE(x,z){const dx=x-LAKE.cx,dz=z-LAKE.cz,ar=(dx*LAKE.ur[0]+dz*LAKE.ur[1])/LAKE.A,at=(dx*LAKE.ut[0]+dz*LAKE.ut[1])/LAKE.B;return Math.hypot(ar,at)/LAKE.rad(Math.atan2(at,ar));}
LAKE.at=(f,t)=>{const k=f*LAKE.rad(t);return [LAKE.cx+LAKE.ur[0]*Math.cos(t)*LAKE.A*k+LAKE.ut[0]*Math.sin(t)*LAKE.B*k,LAKE.cz+LAKE.ur[1]*Math.cos(t)*LAKE.A*k+LAKE.ut[1]*Math.sin(t)*LAKE.B*k];};
RIVER.rIn=(()=>{for(let r=400;r<960;r+=0.5){const t=RIVER.tc(r);if(lakeE(r*Math.cos(t),r*Math.sin(t))<1)return r;}return 715;})();   // where the river leaves the lake
RIVER.rEnd=RIVER.rIn+6;
LAKE.L=RIVER.S(RIVER.rIn-wallR(RIVER.tc(RIVER.rIn)))+0.12;   // a hand's breadth above the river at its mouth
// the harbour's frame (the docks section builds on it) and the road from the quay to the south causeway
const HARBOR0=(()=>{const t=RIVER.tc(RIVER.rIn),x=RIVER.rIn*Math.cos(t)-LAKE.cx,z=RIVER.rIn*Math.sin(t)-LAKE.cz,mouth=Math.atan2((x*LAKE.ut[0]+z*LAKE.ut[1])/LAKE.B,(x*LAKE.ur[0]+z*LAKE.ur[1])/LAKE.A),th=mouth-0.75;
  const S=LAKE.at(1.0,th),I=LAKE.at(0.55,th);let ux=I[0]-S[0],uz=I[1]-S[1];const ul=Math.hypot(ux,uz);ux/=ul;uz/=ul;const vx=-uz,vz=ux;
  return {th,S,u:[ux,uz],v:[vx,vz],W:(uu,vv)=>[S[0]+ux*uu+vx*vv,S[1]+uz*uu+vz*vv]};})();
const DOCKROAD=(()=>{const W=HARBOR0.W,ctrl=[W(2,24),W(-12,30),W(-30,36),[270,544],[170,512],[80,478],[20,462],[0,456]].map(q=>new THREE.Vector3(q[0],0,q[1]));
  const cv=new THREE.CatmullRomCurve3(ctrl,false,'centripetal',0.5),n=Math.ceil(cv.getLength?cv.getLength()/4:90),pts=[];
  for(let i=0;i<=n;i++){const q=cv.getPointAt(i/n,new THREE.Vector3());pts.push([q.x,q.z]);}
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of pts){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
  return {pts,box:[x0-12,x1+12,z0-12,z1+12]};})();
function roadD(x,z){const B=DOCKROAD.box;if(x<B[0]||x>B[1]||z<B[2]||z>B[3])return 1e9;let best=1e9;const P=DOCKROAD.pts;
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez||1,t=clamp(((x-a[0])*ex+(z-a[1])*ez)/L2,0,1),dx=x-a[0]-ex*t,dz=z-a[1]-ez*t,d=dx*dx+dz*dz;if(d<best)best=d;}return Math.sqrt(best);}
function lakeCarve(x,z,h){const e=lakeE(x,z);if(e>1.7)return h;const L=LAKE.L,c=e<1?L-0.8-5*(1-smooth(0.35,1,e)):L+0.35+(e-1)*30;return Math.min(h,c);}
// signed sideways distance from the centreline (cheap polar approximation, corrected for the meander's slope)
function riverD(x,z){const p=polar(x,z);if(p.r<200||p.r>RIVER.rEnd)return 1e9;let da=p.t-RIVER.tc(p.r);da=Math.atan2(Math.sin(da),Math.cos(da));
  const LT=r=>r*(RIVER.tc(r)-RIVER.t0),sl=(LT(p.r+1)-LT(p.r-1))/2;return p.r*da/Math.sqrt(1+sl*sl);}
function riverCarve(x,z,h,ro){if(ro<30)return h;const d=Math.abs(riverD(x,z)),w=RIVER.hw(ro);if(d>w+40)return h;const S=RIVER.S(ro);
  const c=d<w?S-3.5+3.9*smooth(0,w,d):S+0.4+(d-w)*0.9;const k=smooth(30,34,ro);return h+(Math.min(h,c)-h)*k;}
RIVER.bridgeR=385;
const TRAIL=(()=>{const rb=RIVER.bridgeR,tb=RIVER.tc(rb),pts=[];
  for(let a=Math.PI/2;a>tb;a-=0.012){const r=rb+8*Math.sin((a-tb)*9);pts.push([r*Math.cos(a),r*Math.sin(a)]);}   // round from the south causeway
  for(let a=tb;a>tb-0.9;a-=0.012){const u=tb-a,r=rb+u*120+6*Math.sin(u*11);pts.push([r*Math.cos(a),r*Math.sin(a)]);}   // then off to the north-east
  return {pts,rb,tb};})();
function trailD(x,z){const r=Math.hypot(x,z);if(r<360||r>520)return 1e9;let best=1e9;const P=TRAIL.pts;
  for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],ex=b[0]-a[0],ez=b[1]-a[1],L2=ex*ex+ez*ez,t=clamp(((x-a[0])*ex+(z-a[1])*ez)/L2,0,1),dx=x-a[0]-ex*t,dz=z-a[1]-ez*t,d=dx*dx+dz*dz;if(d<best)best=d;}
  return Math.sqrt(best);}
function riverHit(x,z,m){const p=polar(x,z),ro=p.r-wallR(p.t);return ro>30&&Math.abs(riverD(x,z))<RIVER.hw(ro)+m;}
function terrainBase(x,z){
  const p=polar(x,z),R=wallR(p.t),ro=p.r-R;
  const jungle=1+4*fbm(x*0.012,z*0.012)+1.5*fbm(x*0.05,z*0.05);
  let h;
  if(ro<4){
    h=PLATEAU+hillH(x,z)*(1-smooth(-12,4,ro))+0.8*fbm(x*0.03,z*0.03);
  }else{
    const down=smooth(4,11,ro), up=smooth(30,46,ro);
    h=PLATEAU*(1-down)+CHASM*down*(1-up)+jungle*up;
    // rocky chasm walls
    h+= (down*(1-up))*3*fbm(x*0.08,z*0.08);
  }
  // causeways out from each gate
  for(const g of GATES){
    const along=x*Math.cos(g)+z*Math.sin(g), perp=Math.abs(-x*Math.sin(g)+z*Math.cos(g));
    if(perp<16 && along>R+38){
      const ramp=PLATEAU*(1-smooth(R+40,R+170,along))+jungle*smooth(R+40,R+170,along);
      const w=1-smooth(11,16,perp);
      h=Math.max(h,ramp*w+h*(1-w));
    }
  }
  // spaceport apron: flat
  {const d=Math.hypot(x-SP.x,z-SP.z);if(d<SPR+22){const f=1-smooth(SPR+2,SPR+22,d);h=h*(1-f)+SPH*f;}}
  if(ro>=30)h=riverCarve(x,z,h,ro);
  if(ro>=200)h=lakeCarve(x,z,h);
  return h;
}
// level platforms: arena bowl and forecourt, temple plaza, shuttle pads — each blended into the base terrain over a short apron
const FLATS=[[ARENA.x,ARENA.z,60,14],[TEMPLE.x,TEMPLE.z,48,12],[TPAD.x,TPAD.z,11,6],[APAD.x,APAD.z,11,6],[AMPH.x,AMPH.z,19,8],[0,0,32,10],[SPIRE.x,SPIRE.z,9,6],[NEEDLE.x,NEEDLE.z,22,8]];   // central square and the column's plinth are level too
{const g=315*Math.PI/180,R=wallR(g);FLATS.push([R*Math.cos(g),R*Math.sin(g),24,18,PLATEAU]);}   // the north-east gate: level passage before the hill rises behind it
FLATS.forEach(f=>{if(f.length<5)f.push(terrainBase(f[0],f[1]));});
function terrainH(x,z){let h=terrainBase(x,z);for(const f of FLATS){const d=Math.hypot(x-f[0],z-f[1]);if(d<f[2]+f[3]){const k=1-smooth(f[2],f[2]+f[3],d);h=h*(1-k)+f[4]*k;}}return h;}
