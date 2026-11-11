// prefix: fg
// ================================================================= THE MASSING FAMILIES (the owner, 2026-11-11: "a bit more variation in size and massing")
// The stand-in box is an UPPER bound: a building fills 65-100 % of its w and d and 75-100 % of its h, never more than 0.5 m past
// it (verify.py box-within-contract). Each house-like key has three to five massing families, picked by its seed (the sheet
// shows them in turn: v % n) or, in a village, weighted by the village's character (o.character: 'stony', the Fowlers stacked
// and stony; 'low', the Ice-cutters low, sunk and barrow-like). The families are drystone-and-turf vernacular the Fellgangs
// would have arrived at, with their salvage on top:
//   gable      a straight house, stone gables stepping to a turf ridge (half-hip, hip, bowed or twin ridges by seed)
//   black      the Hebridean blackhouse: rounded corners, thick double walls with turf in the wall head, a hipped roof seated
//              inside the wall head, roped and stone-weighted
//   burst      the Icelandic burstabaer: two to four gabled fronts side by side (painted timber gables), a passage range behind
//   bow        the Norse bow-sided longhouse: curved long walls, a bowed ridge
//   welsh      the Welsh longhouse: house and byre under one roof with a cross passage (opposed doors)
//   croft      a croft with lean-to outshots (an end, the back)
//   beehive    a house with corbelled beehive cells joined to it
// and the salvage additions: a plate lean-to, a half-buried container as a store, a wreck's cab as a porch.
// Details vary by seed too: the roof form, the pitch (30-50 degrees), the wall height, the chimney's place, the door's offset
// along the front, small windows, the turf (green, brown, patchy, flowering).
//   fgU(C, salt)                 a unit draw for this building: KRAND.hash(def seed, v, salt), never the engine's stream
//   fgPick(C, fams)              the family: o.family, else v % n on the sheet, else weighted by o.character
//   fgHouse(B, C, fams, inner)   draws the picked family inside the box B; inner(S) furnishes it in the house's own frame
//   fgRange(R, C)                one walled range: plan rect | round | bow, roof gable | halfhip | hip | bow | twin | black |
//                                mono, along x or z; doors and windows in its front; returns its frame S
//   fgTurfRoof(...)              a turf roof from a height function over its eave rectangle (top, underside, eave rolls)
/* a unit draw for this building (core/rand): the def's seed, the variant and a salt */
function fgU(C,salt){const s=CURKEY&&DEFS[CURKEY]?DEFS[CURKEY].seed:0;return KRAND.unit(KRAND.hash(s,C.v|0,salt|0));}
function fgLerp(r,u){return r[0]+(r[1]-r[0])*u;}
function fgPick(C,fams){if(C.o.family!=null){const f=fams.find(f=>f.id===C.o.family);if(f)return f;}
 if(!C.o.character)return fams[((C.v|0)%fams.length+fams.length)%fams.length];
 const ch=C.o.character,ws=fams.map(f=>(f.w==null?1:f.w)*(ch==='stony'?(f.stony==null?1:f.stony):ch==='low'?(f.low==null?1:f.low):1));
 let t=fgU(C,11)*ws.reduce((a,b)=>a+b,0);for(let i=0;i<fams.length;i++){t-=ws[i];if(t<=0)return fams[i];}return fams[fams.length-1];}
/* the turf's look by seed: green, brown, patchy (dead patches), flowering (dots of colour) */
function fgTurfLook(C){const k=Math.floor(fgU(C,31)*4);return ['green','brown','patchy','flower'][k];}
function fgTurfCol(C,look){return fgCol(look==='brown'?'turfBr':look==='green'?'turfG':'turf',C);}
/* ---------------------------------------------------------------- the roof's height function */
/* a along the ridge, b across it, (ea, eb) the eave half-sizes; 0 at the eaves, 1 at the ridge */
function fgRoofF(form,a,b,ea,eb){const ab=Math.abs(b)/eb,aa=Math.abs(a);
 if(form==='hip')return Math.max(0,Math.min(1-ab,(ea-aa)/eb));
 if(form==='halfhip')return Math.max(0,Math.min(1-ab,.62+(ea-aa)/eb));
 if(form==='bow'){const t=a/ea;return Math.max(0,(1-ab)*(1-.22*t*t));}
 if(form==='twin')return (Math.max(0,1-Math.abs(2*ab-1))*.85+.15*Math.max(0,1-ab))/.925;
 if(form==='black'){const k=Math.max(0,aa-(ea-eb));return Math.max(0,1-Math.hypot(k,b)/eb);}
 if(form==='mono')return Math.max(0,Math.min(1,(eb-b)/(2*eb)));
 return Math.max(0,1-ab);}
/* a turf roof over the eave rectangle (ea along the ridge, eb across), its eaves at y0, its ridge at y0 + rise: the top face
   (patched by colf), an underside .26 under it (seen from inside in the cut-away), turf rolls along its four edges */
function fgTurfRoof(ea,eb,y0,rise,form,ax,C,o){o=o||{};const look=o.look||'green',col=fgTurfCol(C,look),fb=o.flipB?-1:1;
 const Y=(a,b)=>y0+rise*fgRoofF(form,a,fb*b,ea,eb),P3=(a,y,b)=>ax==='z'?[b,y,a]:[a,y,b];
 const nu=Math.max(6,Math.min(16,Math.ceil(2*ea/1.4))),nv=form==='twin'?12:8;
 const dead=new THREE.Color(1.18,.92,.55),colf=(look==='patchy'||C.worn)?((u,v)=>{const n=KRAND.vnoise(u*nu*.6,v*nv*.6,C.v,77);return n>.58?dead:WHITE;}):null;
 psurf('turf',(u,v)=>{const a=-ea+2*ea*u,b=-eb+2*eb*v;return P3(a,Y(a,b),b);},nu,nv,col,{up:true,colf});
 psurf('turf',(u,v)=>{const a=-ea+2*ea*u,b=-eb+2*eb*v;return P3(a,Y(a,b)-.26,b);},nu,nv,col.clone().multiplyScalar(.7),{flip:ax==='z'});
 const edge=(f,n)=>{const pts=[];for(let i=0;i<=n;i++)pts.push(f(i/n));cord('turf',pts,.13,col);};
 for(const s of [-1,1]){edge(t=>{const a=-ea+2*ea*t;return P3(a,Y(a,s*eb)-.08,s*eb);},2);edge(t=>{const b=-eb+2*eb*t;return P3(s*ea,Y(s*ea,b)-.08,b);},Math.max(2,nv/2));}
 if(look==='flower'&&!C.worn){const fc=[0xe8d84a,0xd86a9a,0xf0f0e0];for(let k=0;k<30;k++){const a=(fgU(C,200+k)-.5)*1.8*ea,b=(fgU(C,300+k)-.5)*1.8*eb;const p=P3(a,Y(a,b)+.02,b);ellip('plain',p[0],p[1],p[2],.045,.025,.045,hc(fc[k%3]).clone().multiplyScalar(.7),0,4);}}
 return {Y,P3};}
/* ---------------------------------------------------------------- walls by plan */
/* a front wall from x0 to x1 at z with gaps [x0, x1, top, sill?]: a lintel over each, a sill wall under a window */
function fgFront(x0,x1,z,th,wh,C,gaps,col){gaps=(gaps||[]).filter(g=>g[0]>x0&&g[1]<x1).sort((a,b)=>a[0]-b[0]);let x=x0;
 for(const g of gaps){fgWall(x,z,g[0],z,th,0,wh,C,col);if(g[3])fgWall(g[0],z,g[1],z,th,0,g[3],C,col);box('stoneD',(g[0]+g[1])/2,g[2],z,g[1]-g[0]+.5,.24,th+.04,fgCol('stoneD',C));
  fgWall(g[0],z,g[1],z,th,g[2]+.24,wh,C,col);x=g[1];}
 fgWall(x,z,x1,z,th,0,wh,C,col);}
/* the rect plan: four walls, the front with its gaps */
function fgPlanRect(hw,hd,th,wh,C,gaps,o){o=o||{};const col=fgCol('stone',C);fgFront(-hw,hw,-hd+th/2,th,wh,C,o.backGaps,col);
 if(!o.openL)fgWall(-hw+th/2,-hd+th,-hw+th/2,hd-th,th,0,wh,C,col);if(!o.openR)fgWall(hw-th/2,-hd+th,hw-th/2,hd-th,th,0,wh,C,col);
 if(!o.openF)fgFront(-hw,hw,hd-th/2,th,wh,C,gaps,col);}
/* the blackhouse's plan: rounded corners of radius rc, the thick wall's head capped with turf */
function fgPlanRound(hw,hd,th,wh,C,gaps,rc){const col=fgCol('stone',C),tc=fgCol('turf',C);rc=Math.min(rc,hw-.2,hd-.2);
 fgFront(-hw+rc,hw-rc,-hd+th/2,th,wh,C,null,col);fgFront(-hw+rc,hw-rc,hd-th/2,th,wh,C,gaps,col);
 for(const s of [-1,1])fgWall(s*(hw-th/2),-hd+rc,s*(hw-th/2),hd-rc,th,0,wh,C,col);
 for(const sx of [-1,1])for(const sz of [-1,1]){const a0=sx>0?(sz>0?0:-PI/2):(sz>0?PI/2:PI),cx=sx*(hw-rc),cz=sz*(hd-rc);sector('stone',cx,cz,Math.max(.05,rc-th),rc,a0,a0+PI/2,0,wh,col,5);wkRing(cx,cz,Math.max(.05,rc-th),rc,a0,a0+PI/2,0,wh);
  sector('turf',cx,cz,Math.max(.05,rc-th+.1),rc-.1,a0,a0+PI/2,wh,wh+.18,tc,5);}
 for(const s of [-1,1]){box('turf',0,wh,s*(hd-th/2),2*(hw-rc),.18,th-.2,tc);box('turf',s*(hw-th/2),wh,0,th-.2,.18,2*(hd-rc),tc);}}
/* the Norse bow-sided plan: the long walls bow out, the ends are straight and narrower by bulge */
function fgPlanBow(hw,hd,th,wh,C,gaps,bulge){const col=fgCol('stone',C),n=6,zf=x=>hd-th/2-bulge*(x/hw)*(x/hw);
 /* the front's straight middle holds its gaps (the door near the middle, where the bow is flattest) */
 const G=(gaps||[]).filter(g=>Math.abs(g[0])<hw*.6&&Math.abs(g[1])<hw*.6),ga=G.length?Math.min(...G.map(g=>g[0]))-.4:0,gb=G.length?Math.max(...G.map(g=>g[1]))+.4:0;
 for(const s of [-1,1]){for(let k=0;k<n;k++){let xa=-hw+2*hw*k/n,xb=-hw+2*hw*(k+1)/n;if(s>0&&G.length){if(xa>=ga&&xb<=gb)continue;if(xb>ga&&xa<ga)xb=ga;else if(xa<gb&&xb>gb)xa=gb;}
   fgWall(xa,s*zf(xa),xb,s*zf(xb),th,0,wh,C,col);}
  fgWall(s*(hw-th/2),-zf(hw)+th/2,s*(hw-th/2),zf(hw)-th/2,th,0,wh,C,col);}
 if(G.length)fgFront(ga,gb,zf((ga+gb)/2),th,wh,C,G,col);}
/* ---------------------------------------------------------------- one range */
/* R: {w, d, wh, rise, th, plan ('rect' | 'round' | 'bow'), roof, ax ('x': the ridge along x | 'z'), ov (the eaves past the
   walls: 0 for a blackhouse, whose roof sits inside the wall head), doors [[x, w, h]], wins [[x, w, h, sill]], gables
   ('stone' | 'timber' | none), look, noRafters, flipB}. Returns {hw, hd, th, wh, rid, zf, x0, x1, z0, z1, Y} */
function fgRange(R,C){const hw=R.w/2,hd=R.d/2,th=R.th==null?.7:R.th,wh=R.wh,plan=R.plan||'rect',form=R.roof||'gable',ax=R.ax||'x';
 const gaps=(R.doors||[]).map(d=>[d[0]-d[1]/2,d[0]+d[1]/2,d[2]]).concat((R.wins||[]).map(w=>[w[0]-w[1]/2,w[0]+w[1]/2,w[3]+w[2],w[3]]));
 if(plan==='round')fgPlanRound(hw,hd,th,wh,C,gaps,R.rc==null?Math.min(hw,hd)*.55:R.rc);else if(plan==='bow')fgPlanBow(hw,hd,th,wh,C,gaps,R.bulge==null?hd*.16:R.bulge);
 else fgPlanRect(hw,hd,th,wh,C,gaps,{openF:R.openF,openL:R.openL,openR:R.openR,backGaps:R.backGaps});
 /* the roof: its eaves past the walls by ov (a blackhouse's inside the wall head), along x or z */
 const ov=R.ov==null?.12:R.ov,inset=form==='black'?th*.55:0,ea=(ax==='x'?hw:hd)+(form==='black'?-inset:ov),eb=(ax==='x'?hd:hw)+(form==='black'?-inset:ov*.6);
 const y0=form==='black'?wh+.1:wh-.05,T=fgTurfRoof(ea,eb,y0,R.rise,form,ax,C,{look:R.look,flipB:R.flipB}),rid=y0+R.rise;
 /* the timbers under it: a ridge pole where the roof is high, rafters across */
 if(!R.noRafters){const pc=fgCol('pole',C),fr=a=>fgRoofF(form,a,0,ea,eb);let ar=0;for(let a=0;a<ea;a+=.2)if(fr(a)>.95)ar=a;
  if(form!=='mono'&&form!=='twin'&&ar>.3)pole('pole',T.P3(-ar,rid-.38,0),T.P3(ar,rid-.38,0),.09,pc,6);
  const half=(ax==='x'?hd:hw)-th*.6,n=Math.max(2,Math.round(2*ea/2.6));for(let i=1;i<n;i++){const a=-ea+2*ea*i/n,ft=fr(a);if(ft<.35)continue;
   for(const s of [-1,1]){const yt=T.Y(a,0)-.36,yb=form==='mono'?T.Y(a,s*half)-.36:wh;pole('pole',T.P3(a,yb,s*half),T.P3(a,yt,form==='mono'?-s*half*.0:0),.055,pc,5);}}}
 /* the gables: drystone courses (or painted timber) under the roof's line at the two ends */
 if(R.gables!==false&&form!=='hip'&&form!=='black'&&form!=='mono'){const gt=.55,ha=(ax==='x'?hw:hd)-gt/2,hb=(ax==='x'?hd:hw)-.05,n=Math.max(4,Math.round(R.rise/.18));
  for(const se of [-1,1]){const timber=R.gables==='timber'&&se>0,mk=timber?'wood':'stone',gc=timber?(R.paint?hc(R.paint):fgCol('wood',C)):fgCol('stone',C);
   for(let k=0;k<n;k++){const y0k=wh+(rid-wh)*k/n,y1k=wh+(rid-wh)*(k+1)/n+.01;let run=null;
    for(let b=-hb;b<=hb+1e-6;b+=.1){const okb=T.Y(se*ha,b)-.3>=y1k;if(okb&&run==null)run=b;if((!okb||b+.1>hb)&&run!=null){const b1=okb?b:b-.1;if(b1-run>.08){const p=T.P3(se*ha,y0k,(run+b1)/2);
       if(ax==='x')box(mk,p[0],y0k,p[2],gt,y1k-y0k,b1-run+.1,gc);else box(mk,p[0],y0k,p[2],b1-run+.1,y1k-y0k,gt,gc);}run=null;}}}
   if(timber){const yb=T.Y(se*ha,0);for(const s of [-1,1]){const p0=T.P3(se*(ha+gt/2+.03),wh,s*hb),p1=T.P3(se*(ha+gt/2+.03),yb-.05,0);beam('paint',p0,p1,.09,P('white'),false);}}}}
 /* the doors (plate on cable hinges) */
 const zf=hd-th/2;(R.doors||[]).forEach((d,i)=>fgDoor(d[0],R.plan==='bow'?zf:zf,d[1],d[2],C,{th,rust:R.rust,name:i?'a door':'the house door'}));
 /* small windows: visor glass in the wall's thickness */
 (R.wins||[]).forEach(w=>{svPane(w[0],w[3],zf,0,w[1],w[2],{kind:'smoked'});});
 return {hw,hd,th,wh,rid,zf,x0:-hw+th,x1:hw-th,z0:-hd+th,z1:hd-th,Y:T.Y,P3:T.P3,ea,eb,form,ax};}
/* the blackhouse's ropes: cords over the roof every ~1.1 m, a stone hung at each end over the wall head */
function fgRopes(S,C){const n=Math.max(3,Math.round(2*S.ea/1.1)),sc=fgCol('stone',C);for(let i=1;i<n;i++){const a=-S.ea+2*S.ea*i/n,pts=[];
 for(let k=0;k<=8;k++){const b=-S.eb+2*S.eb*k/8;pts.push(S.P3(a,S.Y(a,b)+.04,b));}cord('cord',pts,.018,P('rope'));
 for(const s of [-1,1]){const p=S.P3(a,S.wh+.05,s*(S.eb+.25));cord('cord',[pts[s>0?8:0],[p[0],p[1]+.15,p[2]]],.016,P('rope'));ellip('stone',p[0],p[1]-.1,p[2],.18,.2,.16,sc,0,6);}}}
/* ---------------------------------------------------------------- the additions */
/* a lean-to outshot at an end (side -1 | 1) of a range of half-width hw: ow wide, od deep, its roof falling away from the house */
function fgOutshot(side,cx,ow,od,zc,C,o){o=o||{};const x=cx,Cx=Object.assign({},C,{gl:(a,b)=>C.gl(a+cx,b+zc)});W(x,0,zc,0,()=>{const th=.5,col=fgCol('stone',C),wh=1.55;fgPlinth(-ow/2,ow/2,-od/2,od/2,Cx);
 fgWall(-ow/2,-od/2+th/2,ow/2,-od/2+th/2,th,0,wh,C,col);fgWall(side*(ow/2-th/2),-od/2+th,side*(ow/2-th/2),od/2-th,th,0,wh,C,col);
 fgFront(-ow/2,ow/2,od/2-th/2,th,wh,C,o.door?[[-.4,.4,1.5]]:null,col);
 fgTurfRoof(od/2+.1,ow/2+.1,wh-.05,.85,'mono','z',C,{look:o.look,flipB:side<0});
 if(o.door)svLeaf(0,0,od/2-th/2+.13,0,.8,1.5,{mk:'rust',col:0xc8b8a8,t:.05,name:'the outshot door'});
 for(let k=0;k<5;k++)box('stoneD',(fgU(C,400+k)-.5)*(ow-1.4),0,-od/2+.8+k*.2,.4,.26,.4,P('peat'));});}
/* a corbelled beehive cell of radius r, height h at (x, z): a stone cone, a turf cap, a low plate door toward +z */
function fgBeehive(x,z,r,h,C){W(x,0,z,0,()=>{const sc=fgCol('stone',C),g=Math.max(C.lo,Math.min(0,C.gl(x-r,z-r),C.gl(x+r,z-r),C.gl(x-r,z+r),C.gl(x+r,z+r))-.5);cyl('stone',0,g,0,r+.02,.06-g,sc,12);
 lathe('stone',0,0,[[r,0],[r*.98,h*.35],[r*.78,h*.62],[r*.42,h*.86],[0,h]],12,sc);wkRing(0,0,r*.6,r,0,TAU,0,h*.6);lathe('turf',0,0,[[r*.7,h*.66],[r*.4,h*.88],[0,h+.05]],10,fgTurfCol(C,'green'));
 box('stoneD',0,1.05,r-.15,1,.18,.4,fgCol('stoneD',C));svLeaf(0,0,r-.02,0,.65,1.05,{mk:'rust',col:0xc8b8a8,t:.04,locked:true,name:'a cell door'});});}
/* a plate lean-to against an end wall: two fir poles, white plate sheets, peat stacked under it */
function fgLean(x,z,w,d,side,C){W(x,0,z,0,()=>{const pc=fgCol('pole',C);for(const s of [-1,1])pole('pole',[side*d/2,0,s*(w/2-.15)],[side*d/2,1.55,s*(w/2-.15)],.05,pc,5);
 fgSlab('plate',[-side*d/2,2.05,-w/2],[-side*d/2,2.05,w/2],[side*(d/2+.1),1.5,-w/2],.04,fgCol('plate',C));for(const s of [-.3,.3])fgLash([-side*d/2,2.1,s*w],[side*d/2,1.55,s*w]);
 for(let i=0;i<3;i++)for(let j=0;j<3;j++)box('stoneD',(i-1)*.4*side,j*.27,(j%2?.15:-.15),.36,.25,w*.7,P('peat'));});}
/* a half-buried container (the Ancients' freight box) as a store: corrugated, sunk, turf over it, its end doors barred */
function fgContainer(x,z,ry,L,C){W(x,0,z,ry,()=>{const tc=fgCol('tin',C);box('tin',0,-.55,0,L,1.4,1.3,tc);fgSlab('turf',[-L/2-.05,.92,-.7],[L/2+.05,.92,-.7],[-L/2-.05,.92,.7],.22,fgTurfCol(C,'green'));
 box('rust',L/2+.01,-.5,0,.04,1.3,1.2,fgCol('rust',C));for(const y of [.1,.5])box('iron',L/2+.04,y,0,.04,.05,1.2,P('iron'));});}
/* a wreck's cab as a porch round the front door at (x, zFront): its shell painted once, the windscreen gone, fused to the wall */
/* a porch on fir posts before the front: a turf lean-to from the wall's head down to the posts, a bench under it */
function fgPorch(w,pd,wh,zf,C,look){W(0,0,zf+pd/2,0,()=>{const pc=fgCol('pole',C);for(const s of [-1,1])pole('pole',[s*(w/2-.2),.06,pd/2-.15],[s*(w/2-.2),wh-.45,pd/2-.15],.12,pc,7);
 pole('pole',[-w/2,wh-.45,pd/2-.15],[w/2,wh-.45,pd/2-.15],.11,pc,7);fgTurfRoof(w/2+.1,pd/2+.05,wh-.55,.5,'mono','x',C,{look,flipB:true});box('stoneD',0,0,0,w-.4,.06,pd-.2,fgCol('stoneD',C));});}
function fgCab(x,zf,C){const c=hc([0x4a6a7a,0x6a7a4a,0x8a4a3a][C.v%3]).clone().multiplyScalar(C.worn?.7:1);W(x,0,zf+.75,0,()=>{
 for(const s of [-1,1])box('paint',s*.88,.06,0,.06,1.35,1.5,c);box('paint',0,.06,0,1.8,.06,1.5,c);
 psurf('paint',(u,v)=>{const a=PI*u;return [Math.cos(a)*.9,1.4+Math.sin(a)*.55,-.75+1.5*v];},8,2,c);psurf('paint',(u,v)=>{const a=PI*u;return [Math.cos(a)*.88,1.4+Math.sin(a)*.53,-.75+1.5*v];},8,2,c,{flip:true});
 for(const s of [-1,1])beam('paint',[s*.86,1.35,.74],[s*.6,1.9,.6],.07,c);box('tyre',0,.06,.78,1.9,.18,.08,P('tyre'));});}
/* ---------------------------------------------------------------- a house in its family */
/* fams: [{id, plan, roof, ax, wf, df, hf, pitch, th, ov, gables, add: ['outshot', 'beehive', 'lean', 'container', 'cab',
   'burst', 'welsh'], w (weight), stony, low}], drawn inside box B. spec.doors(S0) -> [[x, w, h]] in the house's frame (default
   one door, offset by seed); inner(S) furnishes it. The house's frame is offset (S.xo, S.zo) so its additions fit the box */
function fgHouse(B,C,fams,inner,spec){spec=spec||{};const F=fgPick(C,fams),ch=C.o.character,add=F.add||[];fgSet('family',F.id);
 /* at most .96 of w and d: the eaves and their turf rolls stand ~.2 m past the walls on each side */
 let wf=Math.min(.96,fgLerp(F.wf==null?[.75,1]:F.wf,fgU(C,21))),df=Math.min(.96,fgLerp(F.df==null?[.8,1]:F.df,fgU(C,22))),hf=fgLerp(F.hf==null?[.8,1]:F.hf,fgU(C,23));
 if(ch==='low')hf=hf-.08;hf=Math.max(.79,Math.min(1,hf));if(ch==='stony')hf=Math.min(1,hf+.05);
 /* room for the additions inside the box */
 const aw=add.includes('outshot')||add.includes('lean')||add.includes('beehive')?Math.min(3.2,B.w*.28):0,ad=add.includes('porch')?1.9:add.includes('cab')?1.5:add.includes('container')?1.6:0;
 let w=Math.max(B.w*.65,Math.min(B.w*wf,B.w-aw)),d=Math.max(B.d*.65,Math.min(B.d*df,B.d-ad));const side=fgU(C,24)<.5?-1:1;
 if(aw&&w+aw<B.w*.65)w=B.w*.65-aw;
 const xo=aw?-side*aw/2:0,zo=add.includes('cab')||add.includes('porch')?-ad/2:add.includes('container')?ad/2:0,H=B.h*hf;
 /* the walls' height and the roof's rise from the pitch (30-50 degrees; a low village pitches lower, a stony one higher) */
 let pitch=fgLerp(F.pitch==null?[34,46]:F.pitch,fgU(C,25));if(ch==='low')pitch-=4;if(ch==='stony')pitch+=3;pitch=Math.max(28,Math.min(52,pitch));
 const across=(F.ax==='z'?w:d)/2,wantRise=Math.tan(pitch*PI/180)*across*(F.roof==='twin'?.5:1);let wh=Math.max(1.55,H-.1-wantRise);if(ch==='low')wh=Math.max(1.5,wh-.2);const rise=Math.max(.8,H-.1-wh-(F.roof==='black'?.1:0));
 const th=(F.th==null?.7:F.th)+(ch==='stony'?.1:0),look=fgTurfLook(C),C2=Object.assign({},C,{gl:(x,z)=>C.gl(x+xo,z+zo)});
 const dw=spec.doorW==null?.95:spec.doorW,dh=Math.min(spec.doorH==null?1.8:spec.doorH,wh-.3);
 W(xo,0,zo,0,()=>{fgPlinth(-w/2,w/2,-d/2,d/2,C2);
  const S0={w,d,hw:w/2,hd:d/2,th,wh},doors=spec.doors?spec.doors(S0,F):[[(fgU(C,26)-.5)*Math.max(0,w-2*th-dw-1.4),dw,dh]];
  const nwin=F.wins==null?(w>7?2:1):F.wins,wins=[];for(let k=0;k<nwin;k++){const x=-w/2+th+.8+(w-2*th-1.6)*(k+.5)/nwin;if(doors.every(dd=>Math.abs(dd[0]-x)>dd[1]/2+.6))wins.push([x,.45,.4,Math.min(1.05,wh-.7)]);}
  let S;
  if(F.id==='burst'){S=fgBurst(w,d,wh,H,th,doors,C2,look,F);}
  else{const bd=spec.backDoor||F.welsh?doors[0]:null;S=fgRange({w,d,wh,rise,th,plan:F.plan,roof:F.roof,ax:F.ax,ov:F.ov,doors,wins,gables:F.gables,look,rust:C.v%4===3,rc:F.rc,
   backGaps:bd?[[bd[0]-bd[1]/2,bd[0]+bd[1]/2,bd[2]]]:null},C2);if(bd)svLeaf(bd[0],0,-d/2+th/2-.12,PI,bd[1],bd[2],{mk:'plate',col:0xe0dcd0,t:.05,name:'the cross passage\'s back door'});}
  if(F.roof==='black')fgRopes(S,C2);
  S.w=w;S.d=d;S.xo=xo;S.zo=zo;S.fam=F.id;S.look=look;S.doors=doors;S.H=H;
  /* the chimney: a hood on the ridge at a place by seed, or a stone stack at a gable end */
  if(!spec.noHood){const hx=F.roof==='black'||F.roof==='hip'?(fgU(C,27)-.5)*w*.3:(fgU(C,27)-.5)*w*.5;if(F.stack&&F.roof!=='hip'){const sx=(w/2-th/2)*(fgU(C,28)<.5?-1:1);box('stone',sx,wh,0,.8,S.rid-wh+.3,.8,fgCol('stone',C2));smokeAt(sx,S.rid+.4,0,{r:.25});}
   else if(F.id!=='burst')fgHood(hx,S.Y(F.ax==='z'?0:hx,F.ax==='z'?hx:0)-.1,Math.min(B.h+.35,S.Y(F.ax==='z'?0:hx,F.ax==='z'?hx:0)+.3),C2);S.hoodX=hx;}
  if(add.includes('cab'))fgCab(doors[0][0],d/2-.05,C2);if(add.includes('porch'))fgPorch(Math.min(w-.6,Math.max(4,w*.7)),ad,wh,d/2,C2,look);
  if(add.includes('container'))fgContainer((fgU(C,29)-.5)*Math.max(0,w-3.2),-d/2-.75,0,Math.min(2.8,w*.5),C2);
  if(inner)inner(S,F);});
 /* the end additions, in the box's frame beside the house */
 const hx0=xo+side*w/2;
 if(add.includes('outshot'))fgOutshot(side,hx0+side*(aw/2-.3),aw,Math.min(d*.85,B.d*.8),zo,C,{look,door:fgU(C,32)<.5});
 if(add.includes('beehive')){const r=Math.min(1.5,aw/2),hb=Math.min(H,2.6);W(hx0,0,0,0,()=>fgBeehive(side*(r-.05),Math.min(d/2-r,(fgU(C,33)-.5)*d*.4),r,hb,Object.assign({},C,{gl:(p,q)=>C.gl(p+hx0,q)})));}
 if(add.includes('lean'))W(hx0,0,zo,0,()=>fgLean(side*aw/2,0,Math.min(d*.7,3.6),aw-.2,side,C));
 if(C.worn)fgRubble((fgU(C,34)-.5)*w*.6+xo,zo+d/2-.02,4,C);
 return {F,w,d,H,xo,zo,side};}
/* the burstabaer: n gabled fronts side by side (timber gables painted, the door in one), a passage range behind them */
function fgBurst(w,d,wh,H,th,doors,C,look,F){const n=w>11?4:w>8?3:2,uw=w/n,df=d*.62,db=d-df+.3,paint=[0xa8321e,0xe8e2d4,0x2e5a8a,0x3a6a3a][C.v%4];wh=Math.max(wh,H-.1-Math.tan(52*PI/180)*uw/2);
 /* the back range first (lower, ridge along x), then the fronts (ridges along z) */
 W(0,0,-d/2+db/2,0,()=>fgRange({w,d:db,wh:Math.max(1.5,wh-.2),rise:Math.max(.8,(H-.1-wh)*.7),th,roof:'gable',ax:'x',look,noRafters:true},C));
 let S=null;const di=Math.min(n-1,Math.max(0,Math.round((doors[0][0]+w/2)/uw-.5)));
 for(let i=0;i<n;i++){const ux=-w/2+uw*(i+.5);W(ux,0,d/2-df/2,0,()=>{const R=fgRange({w:uw+(i<n-1?th*.5:0),d:df,wh,rise:Math.max(.9,H-.1-wh),th,roof:'gable',ax:'z',ov:.08,
   doors:i===di?[[0,Math.min(doors[0][1],uw-1.2),doors[0][2]]]:[],wins:i===di?[]:[[0,.5,.45,Math.min(1.05,wh-.7)]],gables:'timber',paint,look},C);if(i===di)S=R;});}
 fgSet('fronts',n);
 /* the house's frame as the back range and the fronts share it: the rooms behind the fronts */
 return Object.assign({},S,{hw:w/2,hd:d/2,x0:-w/2+th,x1:w/2-th,z0:-d/2+th,z1:d/2-th,zf:d/2-th/2,rid:wh+(H-.1-wh),Y:(a,b)=>wh+(H-wh)*.8,P3:(a,y,b)=>[a,y,b]});}
