// ================================================================= HOST — the Kimr's pueblos on the chaos's knobs (SITE.pueblos; 2026-11-12)
// PLAN.md section 8 (the Mesas: "a pueblo on a bench"), section 5 (the pueblo is a platform: "it stands on a chaos knob, a mesa bench or a built
// stone plinth, 6-15 m above the floor"). The house is kits/kimr's km-house (core/pueblo's plan, KIMR.md section 3), read in place through its
// closure KMK (kits/kimr/kit_bundle.py, the page's 85k: a station takes it with "kits": ["kimr"] in its station.json; the Gate never does, the
// Kimr keep away from the Hall). SITE.pueblos [{knob (an index into SITE.knobs: a low mesa with a flat top tier), v (the yard: 0..2), ry (the
// front's yaw: +z of the plan turned by ry; pi/2 faces east), back (m the blocks stand back from the knob's middle), name}].
// The knob IS the rock: the kit draws no plinth (kmSite's o.rock, drawn false), its rock record's edges are read off the drawn knob's outline
// (KSTACKS.ring at the top edge and at the face), its height from the floor in front; the long ladders, the round room, the pen and the dung
// walls stand on the floor past the knob's foot. Registered in core/tags (KMK.register) before it is drawn; KEEP holds its footprint, so the
// root mask (45) and the knobs' overgrowth (89z) keep off it.
const PUEBLOS=(function(){const L=SITE.pueblos||[];if(!L.length)return[];
 if(typeof KMK==='undefined'){reportErr('pueblos: SITE.pueblos but no Kimr bundle on the page (station.json "kits": ["kimr"])');return[];}
 return L.map((p,i)=>{const S=KNOBS[p.knob];if(!S){reportErr('pueblo '+i+': no knob '+p.knob);return null;}
  const v=p.v|0,ry=p.ry||0,c=Math.cos(ry),s=Math.sin(ry),sb=p.back==null?2:p.back,P=KMK.plan(v),B=P.bounds;
  /* the plan's frame: its origin sb m behind the knob's middle, +z the front turned by ry (three.js's rotation.y) */
  const O=[S.x-sb*s,S.z-sb*c],toW=(px,pz)=>[O[0]+px*c+pz*s,O[1]-px*s+pz*c],toP=(x,z)=>{const dx=x-O[0],dz=z-O[1];return[dx*c-dz*s,dx*s+dz*c];};
  /* the house's floor: the lowest of the knob's top under the blocks (the top's roughness buries a block's foot, never floats it) */
  let hy=Infinity;for(let px=B.x0;px<=B.x1+1e-6;px+=2)for(let pz=B.z0;pz<=B.z1+1e-6;pz+=2){const w=toW(px,pz);hy=Math.min(hy,KSTACKS.topAt([S],w[0],w[1]));}
  if(!(hy>-1e9)){reportErr('pueblo '+i+': the blocks run off knob '+p.knob);return null;}
  /* the rock's edges in the plan's frame, along the axes through the blocks' middle: the top edge (the ring 0.3 m under the top) and the face
     (the ring 1.5 m over the floor); the batter is the widest run between them over the height */
  const gy=terrainH(S.x,S.z),rt=(KSTACKS.ring(S,hy-.3,240)||[]).map(q=>toP(q[0],q[1])),rf=(KSTACKS.ring(S,gy+1.5,240)||[]).map(q=>toP(q[0],q[1]));
  const mx=(B.x0+B.x1)/2,mz=(B.z0+B.z1)/2,band=(R,ax,sg)=>{const o=R.filter(q=>Math.abs(q[1-ax]-(ax?mx:mz))<3&&(q[ax]-(ax?mz:mx))*sg>0).map(q=>q[ax]*sg);return o.length?o:null;};
  const edge={},run=[];for(const [k,ax,sg] of [['x0',0,-1],['x1',0,1],['z0',1,-1],['z1',1,1]]){const t=band(rt,ax,sg),f=band(rf,ax,sg);
   if(!t||!f){reportErr('pueblo '+i+': the knob\'s outline has no '+k+' side');return null;}const top=Math.min(...t);edge[k]=sg*top;run.push(Math.max(0,Math.max(...f)-top));}
  /* the rock's height: the floor at the site's dress (the ladders' feet, the round room, the pen, the dung walls), two passes */
  const rock=Object.assign({h:hy-gy,batter:0,drawn:false},edge);
  const fit=()=>{rock.batter=+(Math.max(...run)/rock.h).toFixed(4);const St=KMK.site(v,{rock}),pts=St.entries.map(E=>[E.x,E.z]).concat([[St.round.x,St.round.z],[(St.pen.x0+St.pen.x1)/2,(St.pen.z0+St.pen.z1)/2]],St.dung.map(D=>[D.x,D.z]));
   const g=pts.reduce((a,q)=>{const w=toW(q[0],q[1]);return a+terrainH(w[0],w[1]);},0)/pts.length;return{St,g};};
  let F=fit();rock.h=+(hy-F.g).toFixed(3);F=fit();const St=F.St,y0=hy-rock.h;
  /* the def's origin (the site's box centred on it, the floor's height): the plan's point -off */
  const G0=toW(-St.off[0],-St.off[1]),at=(x,y,z)=>[+(G0[0]+x*c+z*s).toFixed(4),+(y0+y).toFixed(4),+(G0[1]-x*s+z*c).toFixed(4)];
  const name=p.name||'A Kimr pueblo on a knob of the chaos';
  /* register before drawing: the house and its 50-odd parts in core/tags, its volume in the page's registry (the inspector names it) */
  const T=BIO.tagReg(),reg=T?KMK.register(T,{v,rock,at,ry,name}):null;
  REG.push({name,kind:'building',x:G0[0],z:G0[1],y:y0-1,r:Math.hypot(St.box.w,St.box.d)/2,h:St.box.h+2,tags:{kind:'pueblo',culture:'kimr'}});
  /* the footprint kept clear (45 rootMask, 89z's overgrowth): the site's box, a metre round it, in the world */
  KEEP.push({x:G0[0],z:G0[1],c,s,hw:St.box.w/2+1,hd:St.box.d/2+1});
  OBSTACLES.push({x:G0[0],z:G0[1],r:Math.hypot(St.box.w,St.box.d)/2});
  return{i,knob:p.knob,S,v,ry,P,St,rock,hy,y0,G0,at,toW,name,reg};}).filter(Boolean);})();
const PUEBLO_DRAW=(function(){let tris=0;
 PUEBLOS.forEach(Q=>{const g=KMK.proto('km-house',Q.v,{rock:Q.rock});if(!g){reportErr('pueblo '+Q.i+': '+KMK.errors.join('; '));return;}
  g.position.set(Q.G0[0],Q.y0,Q.G0[1]);g.rotation.y=Q.ry;g.name='host:pueblo.'+Q.i;
  g.traverse(o=>{if(o.isMesh){o.userData.host=true;o.userData.inspectLabel=Q.name;}});scene.add(g);Q.group=g;tris+=g.userData.tris||0;});
 if(PUEBLOS.length&&KMK.errors.length)reportErr('pueblo: '+KMK.errors.join('; '));
 window._pueblos=PUEBLOS.map(Q=>({name:Q.name,knob:Q.knob,v:Q.v,rockH:Q.rock.h,batter:Q.rock.batter,floor:+Q.hy.toFixed(2),registered:Q.reg&&Q.reg.count,tris:Q.group&&Q.group.userData.tris}));
 return{n:PUEBLOS.length,tris};})();
