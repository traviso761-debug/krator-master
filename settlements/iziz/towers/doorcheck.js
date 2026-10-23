// The doors check (the owner, 2026-10-19: "make sure every door threshold is level with the floor beyond"). Run in a built Iziz
// page after walkcheck.js's way (verify.py --eval, or the console): for every leaf IZDOOR drew, the walk floor 0.6 m either
// side of the doorway must lie within 0.12 m of the door's own foot (or the ground, outside, when no floor is registered
// there), and a walker (radius 0.3) standing in the open doorway or a step (0.45 m) either side must be blocked by nothing.
window.IZDOORCHECK=function(o){o=o||{};const W=KWALK,bad=[];let n=0;
 /* every door opens (E, or an NPC): a leaf's blocks never count, this door's or its pair's */
 const blockedNoDoor=(x,y,z)=>{const off=[];let bl;while((bl=W.blocked(x,y,z,.3,1.7))&&/^door:/.test(bl.tag||'')){W.setBlock(bl,false);off.push(bl);}for(const d of off)W.setBlock(d,true);return bl;};
 for(const D of IZDOOR.list){n++;const y=D.at[1],yaw=D.yaw,nx=Math.sin(yaw),nz=Math.cos(yaw),c=[D.at[0],D.at[2]];   /* each leaf at its own middle */
  const off=[];for(const B of D.blocks||[]){if(!B.off){W.setBlock(B,false);off.push(B);}}
  const why=[];for(const s of(D.locked?[1]:[-1,1])){   /* a locked door has no inside to reach (a solid body's) */const x=c[0]+nx*.6*s,z=c[1]+nz*.6*s,f=W.floorBelow(x,z,y+.4,.2);
   const fy=f?f[0]:(typeof terrainH==='function'?terrainH(x,z):null);if(fy==null)continue;
   if(Math.abs(fy-y)>.12)why.push((s>0?'front':'back')+' floor '+(fy-y>0?'+':'')+(fy-y).toFixed(2)+(f?'':' (ground)'));}
  for(const s of[-.45,0,.45]){const x=c[0]+nx*s,z=c[1]+nz*s,b=blockedNoDoor(x,y+.05,z);if(b){why.push('blocked '+(s?(s>0?'front':'back'):'in the doorway')+' ('+(b.tag||'?')+')');break;}}
  for(const B of off)W.setBlock(B,true);
  if(why.length)bad.push({id:D.id,at:D.at.map(v=>+v.toFixed(2)),key:D.key||null,why});}
 const byTag={};for(const b of bad){const k=(b.key||b.id).split('.').slice(0,2).join('.');byTag[k]=(byTag[k]||0)+1;}
 return{doors:n,fails:bad.length,byTag,first:bad.slice(0,o.list||20)};};
