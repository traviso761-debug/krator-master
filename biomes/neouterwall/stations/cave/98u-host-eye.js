// ================================================================= HOST — the eye: where a view may stand, and the helpers the views use
// Forked from biomes/hearths' (its massing view left out). A camera is moved out of the rock and out of the water to the nearest clear point.
const F0=CAVE.focus,FX=F0.c[0],FZ=F0.c[2],FY=F0.c[1];
const WL=CAVE.water?CAVE.water.level:-1e9;
/* the nearest clear eye to (x, y, z): in the open by .8 m and over the water by .6 m, searched on rings out to 12 m */
function eyeAt(x,y,z){const ok=(a,b,c)=>CAVE.C.sdf(a,b,c)>.8&&b>WL+.6;if(ok(x,y,z))return[x,y,z];
 for(let r=1;r<=12;r+=1)for(let k=0;k<12;k++){const a=k/12*TAU,px=x+r*Math.cos(a),pz=z+r*Math.sin(a);for(const dy of[0,1,-.6,2])if(ok(px,y+dy,pz))return[px,y+dy,pz];}return[x,y,z];}
const unit=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.max(1e-9,Math.hypot(dx,dz));return[dx/l,dz/l];};
function onView(){}
