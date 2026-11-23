// ================================================================= 89yr. THE CITADEL'S ROOM GRAPH (XS2, 2026-11-23) [G data]
// Erewhon's citadel room by room for the vertical stack's interiors (I1-I4: core/interiors/10-core-roomlight.js KROOMLIGHT;
// settlements/xanadu/STACK-PLAN.md sections 7 and 9, XS2): every room with a stable id and its box, its doors as portals
// (open or with a leaf), its windows (a jali one with a reduced aperture), its skylights (the Pleasure Dome's oculus) and its
// lamps, each tagged with its room id. Data only, engine-neutral: no THREE, no DOM, no Math.random; ids are names, never
// counters, so they hold across builds. XP2 (after Stage 8) exports it as the citadel's interiors.json v2.
// NOT IN THE PAGE (2026-11-23): settlements/xanadu/build.py takes every digit-named file in src/, and the owner's rule is "data
// now, looks after" (no page's bytes change before Stage 8), so this fragment lives here and only the node test reads it
// (settlements/xanadu/tests/test-citadel-rooms.js). XP2 moves it into src/ beside 89y when the page takes it.
// Derived from the records the page already builds, never restated by hand where a record exists:
//   the citadel's buildings  kits/interiors/sets/xanadu-citadel.js (the items xcPlan draws and 89y furnishes): rooms, doors,
//                            heads, rails; the windows by xcPlan's own rule (kits/xanadu/src/78n-xa-citadel.js, "windows:"),
//                            ported line for line; a Mughal, banded or gold room's window has a jali before its glass (XC_STYLE)
//   the Pleasure Dome        kits/xanadu/src/78c-xa-dome-plan.js xdomePlan() (as 78o patches it: the North Door 4 m in): its
//                            rooms, its walls' openings (door, arch, void, window) and the windows it gives every outside wall;
//                            what 78d draws beyond the plan (the hall's clerestory and drum, the glass eyes of the gored
//                            domes: the hall's oculus, the rotunda's, the pool's three; the stair hall's skylight; the
//                            chandeliers) is restated below from 78d's numbers, and the test checks each against 78d's calls
//   the sites                settlements/xanadu/targets/erewhon/87-er-layout.js CIT_SITES (each `at`; ry 0), the test checks
// Frame: Erewhon's world x and z (a site's `at` plus the building's local x, z; every citadel site stands at ry 0); y is the
// building's own, above its block (the block's level is CIT_G's, from the terrain: XP2 adds it, `site.y` null here).
//   XACITR.build(src)        src {item(key): the set item, XPDOME, plan: xdomePlan()} -> G {version, sites, rooms, portals,
//                            windows, skylights, lamps, dark}; G.rooms[i] {id, building, name, kind, style, box [x0,y0,z0,
//                            x1,y1,z1], rects, outdoor, vault, skylight, doors [{to, out, w, open, leaf, walk, portal}]}
//   XACITR.tableInput(G, o)  KROOMLIGHT.buildTable's input: {rooms, windowsOf, lampsOf}; o.leaves 'shut' (the default: a door
//                            with a leaf is not a light portal, core/door's default state) | 'open' (every door a portal)
//   XACITR.pool(G)           pickPool's {windows: [{room, x, y, z}], lamps: [{room, x, y, z, amp, r}]} (a skylight is a window
//                            light under its opening: 1.35 m under it, or SKY_FILL over the floor where that is lower)
//   XACITR.JALI              a jali's open fraction (proposed: patterns/xanadu/jali is owed; tuned after Stage 8)
var XACITR=(function(){'use strict';
 const R2=v=>Math.round(v*100)/100,R3=v=>Math.round(v*1000)/1000;
 const JALI=.35;           // proposed: the share of a jali's face that is open (a pierced screen of the Mughal kind)
 const INSET=1.35;         // a window's light point this far inside its room (Longsong's export, 94-ls-export.js)
 const SL=.35;             // the citadel's slab (78n xcPlan SL)
 const SKY_FILL=8;         // proposed: a skylight's pool light this far over its room's floor at most (the oculus's opening is 41 m up;
                           // KROOMLIGHT.pickPool drops a window light more than 26 m from the eye, and lights it 15 m out)
 // the citadel's sites on Erewhon (87-er-layout CIT_SITES: key, at); id the building's short name in every room id
 const SITES=[
  {key:'xa_pleasure_dome',id:'dome',at:[-344,-152]},
  {key:'xa_cit_palace',id:'palace',at:[-344,-258]},
  {key:'xa_cit_vizier',id:'vizier',at:[-424,-145]},
  {key:'xa_cit_temple',id:'temple',at:[-360,-69]},
  {key:'xa_cit_barracks',id:'barracks',at:[-264,-169]},
  {key:'xa_cit_mines',id:'mines',at:[-480,-105]},
  {key:'xa_cit_treasurer',id:'treasurer',at:[-260,-225]},
  {key:'xa_cit_chancellor',id:'chancellor',at:[-419,-224]},
  {key:'xa_cit_envoys',id:'envoys',at:[-305,-70]},
  {key:'xa_cit_kitchens',id:'kitchens',at:[-466,-150]}];
 // the rooms dark by day with the leaves shut (no window, no skylight, no open portal to a lit room): each named, so a change
 // that darkens or lights a room is a decision, not a drift (the test holds the table to this list)
 const DARK={
  'cit.palace.u0_w':'the west range\'s upper store: plain, so no window (78n), its one door a leaf',
  'cit.palace.ramp':'the Ramp of the Sultan\'s tower: no window (78n draws none on a ramp), its doors leaves',
  'cit.palace.ramp_u':'the Ramp\'s landing at the Sultan\'s floor: in the tower, its rail on the dark shaft',
  'cit.palace.ramp_t':'the Ramp\'s head at the roof: in the tower, its door to the terrace a leaf',
  'cit.palace.sstair':'the service stair: rooms on three sides and too short a back wall for a window (78n), its door a leaf',
  'cit.palace.sland':'the service stair\'s head: no window, its doors leaves, its flight down the dark stair',
  'cit.temple.hall':'the prayer hall: the porch, the kora and the side rooms on every side, so no window (78n); the dome over it stands on a solid slab and star ceiling; its doors leaves',
  'cit.barracks.side_r':'the guard\'s store on the parade court: plain, no window, its door a leaf',
  'cit.kitchens.ice':'the ice house: no window, its door to the kitchen a leaf'};

 // ---------------------------------------------------------------- frames
 const placeOf=(site,ox,oz)=>{const ry=site.ry==null?0:site.ry,c=Math.cos(ry),s=Math.sin(ry),X=site.at[0],Z=site.at[1]+(oz==null?0:oz);
  return{pt:(x,z)=>[R2(X+x*c+z*s),R2(Z-x*s+z*c)],dir:(x,z)=>[R3(x*c+z*s),R3(-x*s+z*c)]};};
 const boxOf=(P,pt,y0,y1)=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of P){const q=pt(p[0],p[1]);x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}
  return[x0,R2(y0),z0,x1,R2(y1),z1];};
 const lbox=r=>{const xs=r.poly.map(p=>p[0]),zs=r.poly.map(p=>p[1]);return[Math.min(...xs),Math.max(...xs),Math.min(...zs),Math.max(...zs)];};   // 78n xcBox

 // ---------------------------------------------------------------- xcPlan's openings (78n), as data: the doors' heights and every window
 // the same rule, line for line (78n: "the openings, per wall line" and "windows:"); returns {doors: Map(door -> Hd), wins}
 const XC_WIN={mughal:'jali',banded:'jali',gold:'jali'};   // XC_STYLE[style].win: every other style clear glass
 function xcOpenings(R){const B=new Map();for(const r of R)B.set(r,lbox(r));const isCourt=r=>r.ceil==='open';
  const across=(x,z,y0,y1,self)=>R.find(q=>q!==self&&!isCourt(q)&&(()=>{const b=B.get(q);return x>b[0]&&x<b[1]&&z>b[2]&&z<b[3]&&q.y<y1-.3&&q.y+q.h>y0+.3;})());
  const roomById=id=>R.find(q=>q.id===id||('.'+q.id)===id||String(id).endsWith('.'+q.id));
  const edges=[];for(const r of R){const P=r.poly;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length];if(Math.abs(a[0]-b[0])<1e-6&&Math.abs(a[1]-b[1])<1e-6)continue;
   const axis=Math.abs(a[1]-b[1])<1e-6?'z':'x',c=axis==='z'?a[1]:a[0],u0=Math.min(axis==='z'?a[0]:a[1],axis==='z'?b[0]:b[1]),u1=Math.max(axis==='z'?a[0]:a[1],axis==='z'?b[0]:b[1]);
   const bx=B.get(r),side=axis==='z'?(Math.abs(c-bx[2])<1e-6?1:-1):(Math.abs(c-bx[0])<1e-6?1:-1);
   const nm=axis==='z'?(side>0?'z0':'z1'):(side>0?'x0':'x1');edges.push({r,axis,c,u0,u1,side,nm,rail:(r.rail||[]).includes(nm)});}}
  const keyOf=(axis,c)=>axis+(Math.round(c*20)/20);
  const ops=new Map(),addOp=(axis,c,q)=>{const k=keyOf(axis,c);(ops.get(k)||ops.set(k,[]).get(k)).push(q);};
  const doors=[],Hd=new Map();for(const r of R)for(const d of r.doors||[]){if(doors.some(q=>Math.hypot(q.d.at[0]-d.at[0],q.d.at[1]-d.at[1])<.3&&Math.abs(q.y-r.y)<.5))continue;
   const E=edges.filter(e=>e.r===r).map(e=>({e,dd:Math.abs((e.axis==='z'?d.at[1]:d.at[0])-e.c)+((e.axis==='z'?d.at[0]:d.at[1])<e.u0-.01||(e.axis==='z'?d.at[0]:d.at[1])>e.u1+.01?9:0)})).sort((a,b)=>a.dd-b.dd)[0];
   if(!E)continue;const other=d.to&&d.to!=='street'?roomById(d.to.replace(/^.*\./,'')):null;
   const hr=Math.min(r.h,other?other.h:r.h),w=d.w,H=d.head?hr:Math.min(d.h||Math.min(2.3+w*.55,hr-.4),hr-.25),P=Math.min(w*.8,Math.max(.5,H-2.05))/.86,s=H-P*.86;
   doors.push({d,y:r.y});Hd.set(d.id,H);
   addOp(E.e.axis,E.e.c,{u0:(E.e.axis==='z'?d.at[0]:d.at[1])-w/2,u1:(E.e.axis==='z'?d.at[0]:d.at[1])+w/2,y0:r.y,y1:d.head?r.y+hr+SL:r.y+s+P*(d.head?0:1),door:true});}
  const wins=[];for(const e of edges){const r=e.r;if(isCourt(r)||r.kind==='ramp'||e.rail||r.h<3||r.style==='plain'&&r.kind==='store')continue;
   const L=e.u1-e.u0,n=Math.floor((L-2)/4.2);if(n<1)continue;
   for(let i=0;i<n;i++){const u=e.u0+L*(i+.5)/n,px=e.axis==='z'?u:e.c-e.side*.7,pz=e.axis==='z'?e.c-e.side*.7:u;
    if(across(px,pz,r.y,r.y+r.h,r))continue;if((ops.get(keyOf(e.axis,e.c))||[]).some(q=>q.u1>u-1.6&&q.u0<u+1.6&&q.y0<r.y+r.h&&q.y1>r.y))continue;
    const ww=r.h>5?1.6:1.2;if(edges.some(f=>f.axis!==e.axis&&f.r!==r&&!f.rail&&Math.abs(f.c-u)<ww/2+.75&&f.u0<=e.c+.05&&f.u1>=e.c-.05&&f.r.y<r.y+r.h-.3&&f.r.y+Math.max(f.r.h,1)>r.y+.3))continue;
    const sill=r.y+(r.h>5?1.4:1.0),top=Math.min(r.y+r.h-.9,sill+(r.h>5?3.0:1.7)),P=Math.min(ww*.9,r.y+r.h-.25-top)/.86;if(P<.35)continue;
    wins.push({r,e,u,ww,sill,top,P,jali:XC_WIN[r.style]==='jali'});addOp(e.axis,e.c,{u0:u-ww/2,u1:u+ww/2,y0:sill,y1:top+P});}}
  return{Hd,wins,edges,B};}

 // ---------------------------------------------------------------- a citadel building from its set item
 function citBuilding(site,it,G){const R=it.rooms,F=placeOf(site),rid=id=>'cit.'+site.id+'.'+id,O=xcOpenings(R),isCourt=r=>r.ceil==='open';
  const byId={};for(const r of R)byId[r.id]=r;
  // the room under an opening that has no wall (a flight's or the Ramp's head, a rail): the highest room below whose plan holds it
  const below=(r,x,z)=>{let best=null;for(const q of R){if(q===r||q.y>=r.y-.5)continue;const b=O.B.get(q);if(!(x>b[0]-.6&&x<b[1]+.6&&z>b[2]-.6&&z<b[3]+.6))continue;if(!best||q.y>best.y)best=q;}return best;};
  const recs={};
  for(const r of R){const rec={id:rid(r.id),building:site.id,key:site.key,name:r.id,kind:r.kind,style:r.style||null,ceil:r.ceil||null,y:R2(r.y),
    box:boxOf(r.poly,F.pt,r.y,r.y+r.h),rects:[(()=>{const b=boxOf(r.poly,F.pt,0,0);return[b[0],b[3],b[2],b[5]];})()],outdoor:isCourt(r),vault:false,skylight:false,doors:[]};
   recs[r.id]=rec;G.rooms.push(rec);}
  const seen={};
  for(const r of R)for(const d of r.doors||[]){if(seen[d.id])continue;seen[d.id]=1;
   const at=F.pt(d.at[0],d.at[1]);let to=null,out=false;
   if(d.to==='street'){if(d.head){const q=below(r,d.at[0],d.at[1]);if(q)to=q.id;else out=true;}else out=true;}
   else to=d.to.replace(/^\./,'');
   if(to&&!byId[to])throw new Error('XACITR: '+site.id+' door '+d.id+' to an unknown room '+to);
   const open=!!(d.open||d.head),P={id:rid(d.id),a:rid(r.id),b:to?rid(to):null,out,at,y:R2(r.y),w:R2(d.w),h:R2(O.Hd.has(d.id)?O.Hd.get(d.id):(d.h==null?2.2:d.h)),
    open,leaf:!open,walk:true,kind:d.head?'head':open?'arch':'door'};
   G.portals.push(P);
   recs[r.id].doors.push({to:P.b,out,w:P.w,open,leaf:P.leaf,walk:true,portal:P.id});
   if(P.b)recs[to].doors.push({to:P.a,out:false,w:P.w,open,leaf:P.leaf,walk:true,portal:P.id});}
  // a rail: an edge with no wall (a balustrade): open to the room or the court beyond it
  for(const e of O.edges){if(!e.rail||isCourt(e.r))continue;const r=e.r,u=(e.u0+e.u1)/2,px=e.axis==='z'?u:e.c-e.side*.7,pz=e.axis==='z'?e.c-e.side*.7:u;
   let q=null;for(const c of R){if(c===r)continue;const b=O.B.get(c);if(px>b[0]&&px<b[1]&&pz>b[2]&&pz<b[3]&&(isCourt(c)||c.y<r.y-.5)&&(!q||c.y>q.y))q=c;}
   const id=rid('rail.'+r.id+'.'+e.nm),at=F.pt(e.axis==='z'?u:e.c,e.axis==='z'?e.c:u),w=R2(e.u1-e.u0);
   G.portals.push({id,a:rid(r.id),b:q?rid(q.id):null,out:!q,at,y:R2(r.y),w,h:R2(r.h),open:true,leaf:false,walk:false,kind:'rail'});
   recs[r.id].doors.push({to:q?rid(q.id):null,out:!q,w,open:true,leaf:false,walk:false,portal:id});
   if(q)recs[q.id].doors.push({to:rid(r.id),out:false,w,open:true,leaf:false,walk:false,portal:id});}
  // the windows (xcPlan's), each 1.35 m inside its room for the light pool
  for(const W of O.wins){const e=W.e,x=e.axis==='z'?W.u:e.c,z=e.axis==='z'?e.c:W.u,n=e.axis==='z'?[0,e.side]:[e.side,0],h=W.top+W.P*.6-W.sill;
   const ap=W.jali?R3(((W.top-W.sill)*JALI+(h-(W.top-W.sill)))/h):1,at=F.pt(x,z),nn=F.dir(n[0],n[1]),cy=R2(W.sill+h/2);
   G.windows.push({id:rid(W.r.id)+'.w.'+e.nm+'.'+R2(W.u),room:rid(W.r.id),at:[at[0],cy,at[1]],n:nn,x:R2(at[0]+nn[0]*INSET),y:cy,z:R2(at[1]+nn[1]*INSET),
    w:R2(W.ww),h:R2(h),sill:R2(W.sill),jali:W.jali,aperture:ap,kind:'window'});}
  return recs;}

 // ---------------------------------------------------------------- the Pleasure Dome from its plan (78c) and 78d's numbers
 const DOME_CHANDELIERS=D=>{const H=D.HALL,cx=H.c[0],cz=H.c[1],L=[];   // 78d: [x, y (the hang), z, r (its size), drop]
  for(const sx of[-1,1])for(const sz of[-1,1])L.push(['hall',cx+sx*6.5,H.clere-.5,cz+sz*6.5,1.5,7.5]);   // xdomeHall: round the dome's square
  for(const s of[-1,1])L.push(['gallery',s*17,H.top,-20,.9,3.2]);                                        // over the galleries' runners
  L.push(['rotunda',D.ROT.c[0],D.Y2+4.6,D.ROT.c[1],1.5,8.5]);                                           // xdomeStairs: the spiral stair
  L.push(['stair hall',24.5,D.Y2,9,1.2,4.5]);                                                            // the sweeping stair
  for(const p of[[-35,-40],[-35.5,9],[35,-17.5],[35,-3.5],[-24,-14]])L.push(['crystal',p[0],D.Y1-D.SLAB,p[1],.8,2.2]);           // xdomeRooms: the private rooms
  for(const p of[[-35,-40],[-28,9],[-35,41],[35,-17.5],[35,-3.5],[35,22.5],[-24,-14]])L.push(['crystal',p[0],D.Y2,p[1],.8,2.0]);
  return L;};
 // a gored dome's glass eye (78b xpGoreDome: radius r sin .13 at y + r hk cos .13)
 const goreEye=(x,y,z,r,hk)=>({x,z,y:y+r*(hk==null?1:hk)*Math.cos(.13),r:r*Math.sin(.13)});
 const DOME_SKY=D=>{const H=D.HALL;return[
  Object.assign({what:'oculus',room:'hall'},goreEye(H.c[0],H.clere+H.drum,H.c[1],H.r-.1,1)),               // the Hall of Feasts' crown
  Object.assign({what:'eye',room:'rotunda'},goreEye(D.ROT.c[0],D.Y2+.2,D.ROT.c[1],D.ROT.r-.1,.82)),         // the rotunda's gored vault
  ...[25,35,45].map(x=>Object.assign({what:'eye',room:'pool'},goreEye(x,D.Y2+.2,40,4.85,.78))),            // the great pool's three domes
  {what:'skylight',room:'stairE',x:35,z:9,y:D.Y2+.2,w:16,d:6}];};                                          // the stair hall's, in its gold frame
 function domeBuilding(site,D,P,G){const F=placeOf(site,null,D.OZ==null?0:D.OZ),rid=id=>'cit.dome.'+id,recs={};
  const top=r=>r.id==='hall'?null:r.top!=null?r.top:(r.lv===1||r.double)?D.Y2:D.Y1-D.SLAB;
  const SKY=DOME_SKY(D),crown=SKY[0].y;
  for(const r of P.rooms){if(r.void)continue;const P0=[];for(const q of r.rects)P0.push([q[0],q[2]],[q[1],q[3]]);
   const y0=r.lv?D.Y1:D.Y0,y1=r.id==='hall'?crown:top(r);
   const rec={id:rid(r.id),building:'dome',key:site.key,name:r.name,bp:r.bp,kind:r.kind,style:null,ceil:null,y:R2(y0),box:boxOf(P0,F.pt,y0,y1),
    rects:r.rects.map(q=>{const a=F.pt(q[0],q[2]),b=F.pt(q[1],q[3]);return[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])];}),
    outdoor:!!r.open,vault:false,skylight:false,doors:[]};
   if(r.double)rec.double=true;if(r.mezz)rec.mezz=rid(r.mezz);recs[r.id]=rec;G.rooms.push(rec);}
  const real=R=>R&&R.void?R.below:R,isOut=R=>!R;
  const full={};for(const k in recs)full[recs[k].id]=recs[k];
  const link=(P1)=>{G.portals.push(P1);full[P1.a].doors.push({to:P1.b,out:P1.out,w:P1.w,open:P1.open,leaf:P1.leaf,walk:P1.walk,portal:P1.id});
   if(P1.b)full[P1.b].doors.push({to:P1.a,out:false,w:P1.w,open:P1.open,leaf:P1.leaf,walk:P1.walk,portal:P1.id});};
  const yl=lv=>lv?D.Y1:D.Y0;
  for(const S of P.segs)for(const op of S.ops){if(!op.own)continue;const A=real(S.A),B=real(S.B),X=S.axis==='x',lx=X?S.c:op.s,lz=X?op.s:S.c,at=F.pt(lx,lz);
   const key=op.lv+'.'+S.axis+R2(S.c)+'.'+R2(op.s);
   if(op.type==='window'&&!(op.open&&A&&B)){   // a window onto the outside or an open court: its room's
    const In=(!A||A.open)?B:A;if(!In||In.open)continue;const sg=In===A?-1:1,n=X?[sg,0]:[0,sg],nn=F.dir(n[0],n[1]),h=op.ys-op.y0+op.w/2,cy=R2(op.y0+h/2);
    G.windows.push({id:rid(In.id)+'.w.'+key,room:rid(In.id),at:[at[0],cy,at[1]],n:nn,x:R2(at[0]+nn[0]*INSET),y:cy,z:R2(at[1]+nn[1]*INSET),
     w:R2(op.w),h:R2(h),sill:R2(op.y0),jali:false,aperture:1,kind:'window'});continue;}
   if(!A&&!B)continue;const a=A||B,b=A?B:null,open=op.type!=='door';
   link({id:rid('p.'+key),a:rid(a.id),b:b?rid(b.id):null,out:isOut(b),at,y:R2(op.y0),w:R2(op.w),h:R2(Math.min(op.ys,yl(op.lv)+40)-op.y0),open,leaf:!open,
    walk:op.type!=='window',kind:op.type==='void'?'arch':op.type});}
  // no wall between these (an arcade, a balustrade: XPDOME.open): one open portal the width of the shared run
  for(const pr of D.open){const a=recs[pr[0]],b=recs[pr[1]];if(!a||!b)continue;const w=R2(Math.max(a.box[3]-a.box[0],a.box[5]-a.box[2]));
   link({id:rid('p.open.'+pr[0]+'.'+pr[1]),a:a.id,b:b.id,out:false,at:[R2((a.box[0]+a.box[3])/2),R2((a.box[2]+a.box[5])/2)],y:a.y,w,h:R2(a.box[4]-a.box[1]),open:true,leaf:false,walk:true,kind:'open'});}
  // 78d's windows beyond the plan: the clerestory (five a face over the aisles) and the drum's twelve
  {const H=D.HALL,cx=H.c[0],cz=H.c[1],hf=H.half,bay=2*hf/H.bays;
   const faces=[['s','z',cz+hf,-1],['n','z',cz-hf,1],['w','x',cx-hf,1],['e','x',cx+hf,-1]];   // the line, its inward sign
   for(const f of faces)for(let i=0;i<H.bays;i++){const s=-hf+(i+.5)*bay,lx=f[1]==='z'?cx+s:f[2],lz=f[1]==='z'?f[2]:cz+s,at=F.pt(lx,lz),n=f[1]==='z'?[0,f[3]]:[f[3],0],nn=F.dir(n[0],n[1]);
    const y0=18,h=20.4+1.2-18,cy=R2(y0+h/2);   // 78d: y0 18, the springing 20.4, a round head on 2.4 m
    G.windows.push({id:rid('hall')+'.clerestory.'+f[0]+i,room:rid('hall'),at:[at[0],cy,at[1]],n:nn,x:R2(at[0]+nn[0]*INSET),y:cy,z:R2(at[1]+nn[1]*INSET),w:2.4,h:R2(h),sill:y0,jali:false,aperture:1,kind:'clerestory'});}
   const N=24,rd=H.r+.1,pw=R2(2*Math.PI*rd/N+.06);
   for(let k=1;k<N;k+=2){const a=k/N*2*Math.PI,sx=Math.sin(a),sz=Math.cos(a),at=F.pt(cx+sx*(rd+.1),cz+sz*(rd+.1)),nn=F.dir(-sx,-sz),y0=H.clere+1,cy=R2(y0+1.15);
    G.windows.push({id:rid('hall')+'.drum.'+k,room:rid('hall'),at:[at[0],cy,at[1]],n:nn,x:R2(at[0]+nn[0]*INSET),y:cy,z:R2(at[1]+nn[1]*INSET),w:pw,h:2.3,sill:R2(y0),jali:false,aperture:1,kind:'drum'});}}
  // the skylights: the oculus (open to the sky for the light: STACK-PLAN section 7's default; 78b sets a glass disc in it, so
  // it keeps the rain out), the gored vaults' eyes, the stair hall's
  for(const s of SKY){const at=F.pt(s.x,s.z),room=rid(s.room),id=room+'.'+s.what+(s.what==='eye'&&s.room==='pool'?'.'+s.x:'');
   // its light for the pool (x, y, z): under the opening, no higher than SKY_FILL over the floor (pickPool takes a window light
   // only within 26 m of the eye, and the oculus is 41 m over the hall's floor: see SKY_FILL)
   const rec={id,room,kind:s.what,at:[at[0],R2(s.y),at[1]],x:at[0],y:R2(Math.min(s.y-INSET,recs[s.room].y+SKY_FILL)),z:at[1],open:true,glazed:true};
   if(s.r!=null)rec.r=R3(s.r);else{rec.w=s.w;rec.d=s.d;}
   G.skylights.push(rec);recs[s.room].skylight=true;}
  // the lamps: the chandeliers (the light at the crystal's body, 0.75 m under its drop)
  for(const c of DOME_CHANDELIERS(D)){const y=c[2]-c[5]-.75,lv=y>D.Y1?1:0,R=real(P.at(lv,c[1],c[3]));if(!R)throw new Error('XACITR: a chandelier in no room at '+c[1]+','+c[3]);
   const at=F.pt(c[1],c[3]);G.lamps.push({id:rid(R.id)+'.lamp.'+R2(c[1])+'.'+R2(c[3])+'.'+lv,room:rid(R.id),x:at[0],y:R2(y),z:at[1],hang:R2(c[2]),size:c[4],drop:c[5],
    amp:R2(.4+.67*c[4]),r:R2(4+4.6*c[4]),src:'drawn',what:'chandelier ('+c[0]+')'});}
  return recs;}

 // ---------------------------------------------------------------- the whole citadel
 function build(src){const G={version:1,format:'krator-xanadu-citadel-rooms',sites:[],rooms:[],portals:[],windows:[],skylights:[],lamps:[],dark:DARK};
  for(const S of SITES){const site=Object.assign({ry:0,y:null},S);G.sites.push(site);
   if(S.key==='xa_pleasure_dome'){site.oz=src.XPDOME.OZ;domeBuilding(site,src.XPDOME,src.plan,G);continue;}
   const it=src.item(S.key);if(!it)throw new Error('XACITR: no set item '+S.key);const recs=citBuilding(site,it,G);
   // the lamps the builders draw (78n): the forecourt's lamp posts, the Vizier's garden's
   const F=placeOf(site),post=(room,x,y,z,h)=>{const at=F.pt(x,z);G.lamps.push({id:recs[room].id+'.lamp.'+R2(x)+'.'+R2(z),room:recs[room].id,x:at[0],y:R2(y+h),z:at[1],amp:1,r:8,src:'drawn',what:'lamp post'});};
   if(S.id==='palace'){const FL=it.cit.FL;for(const s of[-1,1])for(const z of[8,20])post('forecourt',s*6,FL,z,3.6);}
   if(S.id==='vizier')for(const s of[-1,1])post('garden',s*4,.05,44,3.4);}
  return G;}

 // ---------------------------------------------------------------- KROOMLIGHT's input
 function tableInput(G,o){o=o||{};const shut=o.leaves!=='open',wins={},lamps={};
  for(const w of G.windows)(wins[w.room]||(wins[w.room]=[])).push({w:R3(w.w*w.aperture),h:w.h});
  for(const l of G.lamps)(lamps[l.room]||(lamps[l.room]=[])).push({amp:l.amp,r:l.r});
  const rooms=G.rooms.map(r=>({id:r.id,box:r.box,outdoor:r.outdoor,vault:r.vault,skylight:r.skylight,
   doors:r.doors.filter(d=>!(shut&&d.leaf)).map(d=>d.out?{out:true,w:d.w}:{to:d.to,w:d.w})}));
  return{rooms,windowsOf:r=>wins[r.id]||[],lampsOf:r=>lamps[r.id]||[]};}
 function pool(G){const W=G.windows.map(w=>({room:w.room,x:w.x,y:w.y,z:w.z})).concat(G.skylights.map(s=>({room:s.room,x:s.x,y:s.y,z:s.z})));
  return{windows:W,lamps:G.lamps.map(l=>({room:l.room,x:l.x,y:l.y,z:l.z,amp:l.amp,r:l.r}))};}
 return{SITES,DARK,JALI,INSET,SKY_FILL,build,tableInput,pool,xcOpenings};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=XACITR;
