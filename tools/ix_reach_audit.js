/* tools/ix_reach_audit.js: the interiors' reachability audit for a kit page built with hollow walls (2026-11-09; the
   Highlands and Xanadu pages with ?interiors=1, their verify.py --interiors). Evaluated in the page: every unlocked door
   opened, then for each furnished building (HLF or XAF .buildings) core/walk's KWALK.reach from a point 1.6 m outside each
   of its doors (the ground walkable), over a box round the building: its floors (tag built:<hl|xa>.<n>.) reached or not.
   A building with an unreached floor at 0.4 m is sampled again at 0.2 m before it is reported. A SLIVER (2026-11-09) is a floor part narrower than a walker (twice its area over its perimeter under 0.75 m: the strip a
   stair hole leaves between itself and a wall); one no sample stood on is counted apart (reach.slivers), not as unreached.
   window.AUDIT_ONLY = [keys] limits it. Returns {vauto, hollow, doors, interiors, pieces, reach, list}. */
()=>{
 const out={};
 out.vauto=typeof VAUTO!=='undefined'?{matched:VAUTO.matched,keys:Object.keys(VAUTO.byKey).length,planDoors:VAUTO.planDoors||0}:null;
 out.hollow=typeof VHOLLOW!=='undefined'?{bodies:VHOLLOW.bodies,walls:VHOLLOW.walls,structure:VHOLLOW.structure}:null;
 out.doors={n:KDOOR.list.length,locked:KDOOR.list.filter(D=>D.locked).length};
 const F=typeof HLF!=='undefined'?HLF:(typeof XAF!=='undefined'?XAF:null);if(!F){out.err='no furnish';return out;}
 const P=typeof HLF!=='undefined'?'hl.':'xa.';
 out.interiors=F.buildings.length;out.pieces=F.buildings.reduce((a,b)=>a+(b.interior?b.interior.pieces:0),0);
 for(const D of KDOOR.list)if(!D.locked)KDOOR.open(D.id,{by:'audit'});for(let i=0;i<40;i++)KDOOR.step(.25);
 const gr=typeof terrainH==='function'?(x,z)=>terrainH(x,z):(x,z)=>0;
 const width=f=>{const P=f.pts;if(!P||P.length<3)return 9;let A=0,L=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];A+=a[0]*b[1]-b[0]*a[1];L+=Math.hypot(b[0]-a[0],b[1]-a[1]);}return L?Math.abs(A)/L:9;};
 const res=[];let tot=0,un=0,bad=0,sl=0;const ONLY=window.AUDIT_ONLY||null;
 F.buildings.forEach((B,i)=>{if(ONLY&&!ONLY.includes(B.key))return;const pre='built:'+P+i+'.',D0=VERN.defs[B.key]||{},rr=Math.max(D0.w||30,D0.d||30)/2+8;
  const st=[];for(const D of KDOOR.list){if(D.locked)continue;if(Math.abs(D.at[0]-B.x)>rr||Math.abs(D.at[2]-B.z)>rr)continue;
   const ox=D.at[0]+Math.sin(D.yaw)*1.6,oz=D.at[2]+Math.cos(D.yaw)*1.6;st.push([ox,gr(ox,oz),oz]);}
  let R=KWALK.reach(st,{ground:gr,box:[B.x-rr,B.x+rr,B.z-rr,B.z+rr],cell:.4});
  // a building with an unreached floor is sampled again at 0.2 m: a 0.8 m door (a cell's) leaves a walker 0.3 m of play,
  // which a 0.4 m grid can step over
  if(R.unreached.some(f=>String(f.tag||'').indexOf(pre)===0&&width(f)>=.75)){const R2=KWALK.reach(st,{ground:gr,box:[B.x-rr,B.x+rr,B.z-rr,B.z+rr],cell:.2}),h2=new Set(R2.reached);
   R={reached:R.reached.concat(R.unreached.filter(f=>h2.has(f))),unreached:R.unreached.filter(f=>!h2.has(f))};}   // reached at either
  const unr0=R.unreached.filter(f=>String(f.tag||'').indexOf(pre)===0),unr=unr0.filter(f=>width(f)>=.75);sl+=unr0.length-unr.length;
  const rch=R.reached.filter(f=>String(f.tag||'').indexOf(pre)===0);
  tot+=unr0.length+rch.length;un+=unr.length;if(unr.length)bad++;
  if(unr.length||ONLY)res.push(B.key+' floors '+(unr0.length+rch.length)+' unreached '+unr.length+(unr.length?' ['+unr.slice(0,8).map(f=>f.name.replace(/^.*\.(?=[^.]+\.[^.]+$)/,'')).join(', ')+']':''));});
 out.reach={buildings:F.buildings.length,floors:tot,unreached:un,slivers:sl,buildingsWithUnreached:bad};out.list=res;
 return out;}
