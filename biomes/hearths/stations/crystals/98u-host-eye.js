// ================================================================= HOST — the eye: where a view may stand, and the helpers the views use
// Both stations take this (stations/hold: its base). The views stand in the open: a camera is moved off a beam, out of the rock and out of the
// water to the nearest clear point (eyeAt). Each station's 98v-host-views.js writes its views with these; 'The hold's massing' looks down on
// the cave from above the shelf with the outlines shown and the haze thinned, every other view restores both (onView).
const F0=CAVE.focus,FX=F0.c[0],FZ=F0.c[2],FY=F0.c[1];
const beamNear=(x,y,z,pad)=>CAVE.beams.concat(CAVE.floor).some(r=>{if(r.kind!=='beam')return false;const dx=Math.cos(r.el)*Math.cos(r.az),dy=Math.sin(r.el),dz=Math.cos(r.el)*Math.sin(r.az),
 px=x-r.x,py=y-(r.y+r.r*.5),pz=z-r.z,t=Math.max(0,Math.min(r.len,px*dx+py*dy+pz*dz));return Math.hypot(px-dx*t,py-dy*t,pz-dz*t)<r.r+pad;});
/* the nearest clear eye to (x, y, z): in the open by .8 m, 1.2 m off any beam and over the water by .6 m, searched on rings out to 12 m */
const WL=CAVE.water?CAVE.water.level:-1e9;
function eyeAt(x,y,z){const ok=(a,b,c)=>CAVE.C.sdf(a,b,c)>.8&&!beamNear(a,b,c,1.2)&&b>WL+.6;if(ok(x,y,z))return[x,y,z];
 for(let r=1;r<=12;r+=1)for(let k=0;k<12;k++){const a=k/12*TAU,px=x+r*Math.cos(a),pz=z+r*Math.sin(a);for(const dy of[0,1,-.6,2])if(ok(px,y+dy,pz))return[px,y+dy,pz];}return[x,y,z];}
const at=(c,u,d,up)=>[c[0]+u[0]*d,up,c[2]+u[1]*d];
const unit=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.max(1e-9,Math.hypot(dx,dz));return[dx/l,dz/l];};
const vol=id=>CAVE.HOLD.volumes.find(V=>V.id===id);
const midOf=V=>{const P=V.shape.pts;return[P.reduce((a,p)=>a+p[0],0)/P.length,P.reduce((a,p)=>a+p[1],0)/P.length];};
const MASSING_VIEW='The hold\'s massing (from above)';
function onView(name){const m=name===MASSING_VIEW;MASSING.group.visible=m||Q.get('massing')==='1';scene.fog.density=m?.0015:.014;}
