// ================================================================= ATMOS — fx: an aqueduct's spill (water leaving a broken channel)
// [G data] (ATMOS.aqueductSpill: plain arithmetic) + [web] (ATMOS.spill draws it on fx/89-atmos-fx-localtime.js and the smoke's
// spray). biomes/ancientsvalley/PLAN.md 15 (the owner, 2026-11-10: the Terraces' aqueducts on arches, broken; the water still
// comes down the channel from the hills). From the channel's deck line and the break, one record says everything: where the
// water leaves, which way, how fast and how far it falls; the drips from the cracks along the span; the spray and the wet stain
// at the foot. A page with core/water draws the fall as WATER.fall's curtain from rec.fall (the same lip, dir, speed and drop);
// without it, ATMOS.spill draws the curtain as particles.
//   ATMOS.aqueductSpill(o) -> rec   o: {deck: [[x, z, y]...] the channel's bed line (y the bed), at (m along the deck: the
//            break), width (m, the channel), depth (m of water), speed (m/s along the channel, default 1.2), kind: 'span' (the
//            span is gone: the water leaves the open end along the channel) | 'breach' (a hole in a wall: it leaves sideways),
//            side (+1 | -1: which wall, for a breach), breach (m: the hole's length, default the width), ground (x, z) -> y,
//            cracks (drips along the span, default 6), seed, id}
//     rec: {id, lip: [[x, z, y], [x, z, y]], dir: [dx, dz], speed, drop, foot: [x, y, z], fall (WATER.fall's options), emitters
//           (for ATMOS.localFx: the curtain and the drips), spray: [x, y, z], wet: {at: [x, z], r, kind: 'wet'} (for ATMOS.spillOn)}
//   ATMOS.spill(rec, o) -> handle   {fx (localFx's), smoke, dispose()}; o: {seed, reach, curtain: false (core/water draws it)}
// Recorded for ATMOS.export() as {type: 'spill', lip, dir, speed, drop}.
(function(){const A=ATMOS;
 A.PRESETS.spill={salt:0x53504c4c,speed:1.2,cracks:6,crackSpan:30,curtainN:260,dripN:40,depthFlow:2.5};
 const num=(v,x)=>v==null?x:v;
 const kr=()=>{const K=typeof KRAND!=='undefined'?KRAND:(typeof globalThis!=='undefined'&&globalThis.KRAND);if(!K)throw new Error('atmos spill: load core/rand (KRAND) first');return K;};
 // the point and the tangent at a distance along a polyline of [x, z, y]
 const along=(L,s)=>{let acc=0;for(let i=0;i<L.length-1;i++){const a=L[i],b=L[i+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]);if(acc+d>=s||i===L.length-2){const u=d>0?Math.min(1,Math.max(0,(s-acc)/d)):0;
   return {p:[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u,a[2]+(b[2]-a[2])*u],t:d>0?[(b[0]-a[0])/d,(b[1]-a[1])/d]:[1,0]};}acc+=d;}return {p:L[0].slice(),t:[1,0]};};
 const lengthOf=L=>{let s=0;for(let i=0;i<L.length-1;i++)s+=Math.hypot(L[i+1][0]-L[i][0],L[i+1][1]-L[i][1]);return s;};
 A.aqueductSpill=o=>{const P=A.PRESETS.spill,K=kr(),L=o.deck;if(!L||L.length<2)throw new Error('atmos spill: deck needs two or more points [x, z, y]');
  const len=lengthOf(L),at=num(o.at,len/2);if(!(at>=0&&at<=len))throw new Error('atmos spill: at must lie on the deck (0..'+len.toFixed(1)+' m)');
  const kind=num(o.kind,'span');if(kind!=='span'&&kind!=='breach')throw new Error('atmos spill: kind is span or breach');
  const w=num(o.width,2.4),dep=num(o.depth,.6),speed=num(o.speed,P.speed),ground=o.ground||(()=>0),seed=num(o.seed,1)>>>0,side=o.side<0?-1:1;
  const B=along(L,at),p=B.p,t=B.t,n=[-t[1]*side,t[0]*side],y=p[2]+dep*.5;let lip,dir;
  if(kind==='span'){lip=[[p[0]-n[0]*w/2,p[1]-n[1]*w/2,y],[p[0]+n[0]*w/2,p[1]+n[1]*w/2,y]];dir=t;}
  else{const h=num(o.breach,w)/2,e=[p[0]+n[0]*w/2,p[1]+n[1]*w/2];lip=[[e[0]-t[0]*h,e[1]-t[1]*h,y],[e[0]+t[0]*h,e[1]+t[1]*h,y]];dir=n;}
  const mx=(lip[0][0]+lip[1][0])/2,mz=(lip[0][1]+lip[1][1])/2;
  // the drop to the ground where the arc lands (two passes: the landing point moves with the drop)
  let drop=Math.max(.5,y-ground(mx,mz));for(let k=0;k<2;k++){const tf=Math.sqrt(2*drop/9.81),fx=mx+dir[0]*speed*tf,fz=mz+dir[1]*speed*tf;drop=Math.max(.5,y-ground(fx,fz));}
  const tf=Math.sqrt(2*drop/9.81),foot=[mx+dir[0]*speed*tf,y-drop,mz+dir[1]*speed*tf];
  const em=[{kind:'curtain',lip,dir,speed,drop,n:Math.round(P.curtainN*Math.max(1,w*dep*P.depthFlow))}];
  const nc=num(o.cracks,P.cracks);for(let i=0;i<nc;i++){const u=K.unit(K.hash(seed,i,P.salt)),s=Math.min(len,Math.max(0,at+(u-.5)*2*P.crackSpan));if(Math.abs(s-at)<w)continue;
   const q=along(L,s).p,gy=ground(q[0],q[1]);em.push({kind:'drops',at:[q[0],gy,q[1]],r:.4,h:Math.max(.5,q[2]-gy),n:P.dripN});}
  const R={id:o.id||'spill_'+(seed%100000),kind,lip,dir,speed,drop,foot,
   fall:{lip,dir,speed,drop,plunge:foot.slice()},emitters:em,spray:[foot[0],foot[1]+.5,foot[2]],wet:{at:[foot[0],foot[2]],r:Math.max(4,drop*.6+w),kind:'wet'}};
  return R;};
 A.spill=(R,o)=>{o=o||{};const em=o.curtain===false?R.emitters.filter(e=>e.kind!=='curtain'):R.emitters;
  const H={fx:em.length&&A.localFx?A.localFx(em,{seed:o.seed,reach:o.reach}):null,smoke:A.smoke?A.smoke([[R.spray[0],R.spray[1],R.spray[2],'spray']]):null};
  A.rec('spill',{lip:R.lip,dir:R.dir,speed:R.speed,drop:R.drop,curtain:o.curtain!==false});
  H.dispose=()=>{if(H.fx)H.fx.dispose();if(H.smoke){if(H.smoke.parent)H.smoke.parent.remove(H.smoke);H.smoke.geometry.dispose();H.smoke.material.dispose();}};return H;};
})();
