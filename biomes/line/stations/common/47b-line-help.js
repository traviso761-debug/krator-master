// ================================================================= LINE — helpers the windows share: the gallery's floors and works, strips, the vein  [G data]
// The plain gallery's walk floors (KWALK) over a stretch, a run of walk strips along a polyline, the floor of the section at x, the works a car must
// clear in the plain gallery, and the vein's stain on the rock. No three.js, no DOM.
const LW=(function(){
 /* the plain gallery's floors from z0 to z1: the walkway, the road and its footway, the strip, the guideways' tops, the invert between; the barrier */
 function gallery(W,SEC,z0,z1,trackX){const G=SEC.guide,xs=SEC.tracks.map(T=>trackX(T.id,(z0+z1)/2));
  W.floor({rect:[SEC.walk.x0,SEC.walk.x1,z0,z1],y:SEC.walk.y,name:'the walkway (east wall)',tag:'line.walkway'});
  W.floor({rect:[SEC.road.x0,SEC.road.x1,z0,z1],y:SEC.road.y,name:'the access road',tag:'line.road'});
  W.floor({rect:[SEC.road.foot[0],SEC.road.foot[1],z0,z1],y:SEC.road.footY,name:'the road\'s footway',tag:'line.road'});
  W.floor({rect:[SEC.strip.x0,SEC.strip.x1,z0,z1],y:SEC.strip.y,name:'the central strip',tag:'line.strip'});
  SEC.tracks.forEach((T,i)=>W.floor({rect:[xs[i]-G.w/2,xs[i]+G.w/2,z0,z1],y:G.h,name:'guideway '+T.id.toUpperCase(),tag:'line.guideway'}));
  for(const [a,b] of invertGaps(SEC,xs))W.floor({rect:[a,b,z0,z1],y:0,name:'the invert',tag:'line.invert'});
  W.block([SEC.road.barrier[0],SEC.road.barrier[1],z0,z1,SEC.road.y,SEC.road.y+SEC.road.barrierH],'line.barrier');}
 /* the invert's bare strips between the works across the section */
 function invertGaps(SEC,xs){const G=SEC.guide,e=[[SEC.road.barrier[1],SEC.road.barrier[1]]];
  const parts=xs.map(x=>[x-G.w/2,x+G.w/2]).concat([[SEC.strip.x0,SEC.strip.x1]]).sort((a,b)=>a[0]-b[0]);
  const out=[];let cur=SEC.road.barrier[1];for(const p of parts){if(p[0]-cur>.05)out.push([cur,p[0]]);cur=Math.max(cur,p[1]);}
  if(SEC.walk.x0-cur>.05)out.push([cur,SEC.walk.x0]);return out;}
 function strips(W,pts,w,name,tag){for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1];W.strip({a:[a[0],a[2],a[1]],b:[b[0],b[2],b[1]],w,name,tag});}}
 /* the section's floor at x (the plain gallery) */
 function sectionFloor(SEC,x,trackX,z){const G=SEC.guide;
  if(x<SEC.road.foot[1])return SEC.road.footY;
  if(x<SEC.road.barrier[0])return SEC.road.y;
  if(x<SEC.road.barrier[1])return SEC.road.y+SEC.road.barrierH;
  for(const T of SEC.tracks)if(Math.abs(x-trackX(T.id,z))<=G.w/2)return G.h;
  if(x>=SEC.strip.x0&&x<=SEC.strip.x1)return SEC.strip.y;
  if(x>=SEC.walk.x0)return SEC.walk.y;
  return 0;}
 /* the works a car must clear in the plain gallery: the barrier, the walkway and its rail, the strip's masts, the crown's fittings */
 function galleryWorks(SEC,WIN,lamps,crown,spans){const O=[],sp=spans||[[WIN.z0,WIN.z1]];
  for(const [z0,z1] of sp){O.push({name:'the road\'s barrier',x0:SEC.road.barrier[0],x1:SEC.road.barrier[1],y0:0,y1:SEC.road.y+SEC.road.barrierH,z0,z1});
   O.push({name:'the walkway and its rail',x0:SEC.walk.x0,x1:SEC.walk.x1,y0:0,y1:SEC.walk.y+1.06,z0,z1});}
  lamps.filter(l=>l.mast).forEach(l=>O.push({name:'a strip mast at z '+l.z,x0:l.x-.14,x1:l.x+.62,y0:0,y1:l.y+.1,z0:l.z-.15,z1:l.z+.15}));
  crown.forEach(c=>O.push({name:'a crown fitting',x0:c.x-.6,x1:c.x+.6,y0:c.y,y1:c.y+.18,z0:c.z-.15,z1:c.z+.15}));
  return O;}
 /* the vein's stain: a band 1.4 m high through its gallery's walls, dipping with it, patchy (core/rand's noise): fills w[0] (aVein) */
 function veinWeight(V){if(!V)return null;return (x,y,z,w)=>{let d=1e9;for(let j=0;j+1<V.pts.length;j++){const a=V.pts[j],b=V.pts[j+1],dx=b[0]-a[0],dz=b[2]-a[2],L=dx*dx+dz*dz,
   t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/L));d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t));}
  const yv=V.pts[0][1]+1.3-(x-V.pts[0][0])*.012,band=Math.max(0,1-Math.abs(y-yv)/.9),near=Math.max(0,Math.min(1,(6-d)/4.5));
  w[0]=Math.max(0,Math.min(1,band*near*(.6+.6*KRAND.fbm(x*.2,y*.3,z*.2,3,91))));};}
 return {gallery,invertGaps,strips,sectionFloor,galleryWorks,veinWeight};
})();
