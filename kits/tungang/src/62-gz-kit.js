// prefix: gz
// ================================================================= THE GLAZIERS' SET (gz): its boxes, its void plans, its palette, its lamp code, its helpers
// The Glaziers of Opal Valley (PLAN.md sections 1.4, 3.4; LORE.md 6.13): the eastern loj, the crew who went up the Opal River
// into the fault and were not absorbed, a thousand years apart from the Union. Their hold is CUT into the fault scarp over the
// milk-opal tarns, the only Tungang hold with a face to the sky: tiered, battered, whitewashed fronts in the cliff, tapering
// window cuts under cusped arches glazed with MOONGLASS (potch, the common opal with no fire, sliced thin), cholet bands
// (rose, teal, saffron), gilt on salvage bought with opal, the click wheels (Xanadu's prayer wheels hung with opal chips and
// frost-willow spicules), Oidong's celadon, seal and register. A Tungang loj underneath, always: the count wall, the banner,
// the lamp code. The Orientalism is kept light (cusped arches, pierced brass, carpets and bolsters, a little lattice and gilt).
//
// THE FRAME (a scarp site's): the origin is the foot of the def's FRONT on the rock face (z 0 is the face), the front stands out
// toward +z (over the tarns) by its `out`, the rooms run into the rock at -z. TG.gz.BOX[key] is {w across, d (the front's out
// plus the depth into the rock), h, out}: the def's drawn box lies in x within +-w/2, z within [out - d, out], y within [0, h].
// TG.gz.plan(key, o) is the VOID PLAN, the ONE source (kits/zeijani/PLAN.md 6.3): the rock is carved from it (KCAVERN, the
// sheet's rows and its sample scarp; a world's own cavern through TG.gz.carve), the builder draws its floors, linings and
// furniture from it, core/walk takes its floors. Its records are the Tungang set's shape (TG.tg.plan, on Loj Twenny's branch):
// {id, kind:'room', x, z (the centre), w, d, y (the floor), h (the wall), ceil ('flat' | 'vault' | 'dome'), rise, finish
// ('hewn' | 'plaster' | 'polished'), use, doors:[{side 'n'|'s'|'e'|'w', at (along the wall, from the room's centre), w}]} or
// {id, kind:'stair', a:[x,y,z], b:[x,y,z], w, h}. A doorway through the face runs .4 m out past it (z +.4) into the built front.
//
// STATES: kept, worn (greyed, the paint flaking, lamps dimmed, rubble at the foot) and abandoned (dark: no lamp lit, the panes
// broken out, the curtains rags, the furniture thinned, the gilt dull). o.state, else the sheet's (FG_STATE, ?state=).
// THE LIGHT: every lamp a builder hangs is a light record in TG.gz.LIGHTS (core/cavelight's shape: {id, x, y, z, kind, colour,
// range, intensity, owner, on}), so a world can light it; the sheet shows them as halos.
//
//   gzCx(o)                         {st, worn, aband, v, o, key}: the builder's context
//   gzU(key, v, salt)               a unit draw (core/rand: the def's seed, the variant, a salt): plans and builders agree
//   gzCol(k, C)                     a palette colour, weathered by the state
//   gzLeanBox(...) / gzWall(...)    a battered wall piece; a battered wall with its openings (pieces round each)
//   gzArch(...)                     a cusped arch head (lobes: three for the poor, five for the rich), its spandrels to a square
//   gzWin(...) / gzDoor(...)        a tapering window cut (moonglass, a cusped head, a valance) / a cusped doorway and its leaf
//   gzTier(T, C)                    one tier of a front: battered face with its openings, side walls, a flat roof, the parapet
//                                   band (alecap purple), a cholet band, gilt on the rich
//   gzBand(...) / gzWheel8(...)     a cholet band (stepped lozenges in rose, teal, saffron, gilt lines) / the eight-spoked wheel
//   gzRooms(PL, C)                  every room of a plan: its floor finish, its whitewash lining (plaster and polished), its doors
//   gzLamp / gzLantern / gzBrass    a lamp of the code; a moonglass lantern; a pierced brass lantern
//   gzClick(...)                    a click wheel: a prayer wheel hung with opal chips and spicule twigs
//   gzFurn(key, ...)                a catalog piece (core/furnish through the engine's FURNISH), as fgFurn
Object.assign(SVPAL,{
 /* whitewash (lime over the rock), the scarp's rock (basalt, the rhyolite's rose), the cholet colours, gilt, the Order's blue */
 wash:[0xf2eee4,0xeee8dc,0xf4f0e8],washOld:[0xd8d0c0,0xcec6b4],rock:[0x4a4446,0x524a48,0x443e40],rhyo:[0x9a7e78,0x8e746e,0xa48a82],
 rose:[0xc8607a,0xbe5872],teal:[0x2a8a88,0x24807e],saffron:[0xe0a030,0xd89a2c],gilt:[0xc9a24a,0xd0aa52],orderBlue:[0x2a4f8a,0x2e568e],
 /* the parapet's band: alecap purple, the dye they buy and grow; indigo; the carved timber (dark), carpet reds and blues */
 alecap:[0x5a3a5e,0x4e3252,0x5e4062],indigo:[0x2e3a6a,0x34406e],timber:[0x5e4230,0x6a4a32,0x54392a],carpetR:[0x8a2e2a,0x7a2a3a,0x922f2c],carpetB:[0x2a3a6a,0x30406e],
 /* Oidong's celadon, the brass of lanterns and urns, potch (milky, fireless), the clear crystal opal, the lotus */
 celadon:[0x9cc4a8,0xa8ccb0,0x94bca0],brassC:[0xb08a48,0xa8823e],potch:[0xd8dcd4,0xcfd6d2,0xe2e0d8],opal:[0xbfe0e8,0xd8c8e8,0xc8e8d0,0xf0d8c8],
 lotus:[0xf0dce6,0xe8d0dc,0xf4e8ee],pad:[0x3e6a4a,0x4a7a52,0x36603e],tarn:[0x7cc4c4,0x84c8c6],fungus:[0xe8e0d0,0xd8ccb8],alecapC:[0x7a4a82,0x6e4276]});
/* digits for the Register's numbers (3 x 5, the Fellgang set's daubed font: FG_FONT) */
Object.assign(FG_FONT,{'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','011','001','111'],
 '4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],
 '8':['111','101','111','101','111'],'9':['111','101','111','001','111'],'-':['000','000','111','000','000'],'.':['000','000','000','000','010']});
/* ---------------------------------------------------------------- the set: its boxes, its lamp code, its plans */
TG.gz={SCALE:.94,culture:'glazier',
 /* the lamp code (PLAN.md 1.5.1), kept by the Glaziers as by every loj; wax light in the rooms; the moonglass lanterns' soft milk */
 LAMP:{red:{hex:0xd8462e,kind:'lamp-red',range:4,intensity:.35},green:{hex:0x46c27a,kind:'lamp-green',range:6,intensity:.45},
  amber:{hex:0xf0a63a,kind:'lamp-amber',range:8,intensity:.7},glow:{hex:0x9fe8c0,kind:'glowcap',range:3,intensity:.25},
  white:{hex:0xf6f3ea,kind:'lamp-white',range:6,intensity:.6,hood:true},wax:{hex:0xffd9a0,kind:'wax',range:5,intensity:.55},
  moon:{hex:0xf2ecdc,kind:'moonglass',range:5,intensity:.5}},
 /* every def's box: w across, d (out plus the depth into the rock), h, out (how far the front stands from the face); tier, what */
 BOX:{
  'gz-cell':{w:8.4,d:7,h:4.4,out:1.3,tier:'poor',what:'a poor household: one tier and a door on the scarp, one carved room and a store niche'},
  'gz-front':{w:9.6,d:12,h:8,out:2.6,tier:'middle',what:'a household\'s front: two tiers, battered and whitewashed, the hearth room, the sleeping room and the store behind, the upper room up a cut stair'},
  'gz-house':{w:14.6,d:16.6,h:15.6,out:4,tier:'rich',what:'a rich household: three or four tiers, gilt and a lattice bay, the reception room with its carpets, the family rooms, the shrine at the top'},
  'gz-stair':{w:7.6,d:3.8,h:11.6,out:3.4,tier:'common',what:'the switchback stairs and ledges up the scarp between the fronts, railed, lamp-coded'},
  'gz-adit':{w:8.6,d:18,h:5,out:6,tier:'common',what:'an adit\'s mouth: a plate-framed portal, the Register\'s plaque, a spoil heap of potch, the wet-drilling flume from the tarn'},
  'gz-vein-gallery':{w:8,d:17,h:3.6,out:1,tier:'common',what:'the working: a narrow gallery following a potch line into the basalt-rhyolite contact, the face lit, the floor wet'},
  'gz-wheel-walk':{w:12.4,d:4.2,h:4.2,out:3,tier:'common',what:'the click wheels along the ledge to the loj hall: a rock-cut niche row of prayer wheels under a carved eave'},
  'gz-tea-hall':{w:16.6,d:21,h:13,out:4,tier:'civic',what:'the loj\'s meeting hall: the benches, the count wall, the steward\'s seat, the timetable, carpets, celadon, the guest benches'},
  'gz-register-room':{w:9.4,d:11.6,h:5.4,out:1.8,tier:'civic',what:'the Register of the Veins: the enamel plaques, the claim book, the Sultan\'s Fifth counted in cut stones, the seal'},
  'gz-glass-shop':{w:10.4,d:12,h:5.8,out:3.4,tier:'common',what:'the moonglass workshop: potch sliced and polished into panes, lenses ground from crystal opal, frames of plate'},
  'gz-monks-house':{w:10.4,d:13.4,h:6.4,out:3,tier:'civic',what:'the herbalist-monks\' house in the hold: a reading room, the pigment mill grinding opal spoil, the Order\'s blue'},
  'gz-dark-adit':{w:7,d:15,h:3.4,out:1,tier:'poor',what:'an old adit turned to dark beds: pale fungi and alecap in kerbed beds, the damp, a glow-cap lamp'},
  'gz-lotus-pond':{w:12.4,d:10.8,h:1.8,out:9.6,tier:'common',what:'a terraced pond on the tarn\'s edge for the opal water-lotus: stepped basins, a sluice from the rock'}},
 PLANS:{},LIGHTS:[]};
/* ---------------------------------------------------------------- the builder's context, the draws, the colours */
let GZ_COLLECT=0;   /* 84-gz-host.js sets it during a host draw: the lights are collected even when the draw is dry */
/* THE FACADE DRAW (a site's `facade: true` in TG.gz.draw: a town's far wall, Laitwal's outer bands): only what stands at or in
   front of the rock face is drawn, the front's tiers, doors, panes, lamps and what stands before it; everything behind the
   face (the carved rooms' floors, linings, furniture, lamps, plaques) is dropped, and no furniture is asked of the catalog.
   The test is the emitted piece's centre in the site's own frame (z < -.35: in the rock). The world gives such a site no
   carved voids: its rock is whole behind the front */
let GZ_FACADE=0;const gzFM=new THREE.Matrix4(),gzFV=new THREE.Vector3();
function gzBehind(lm,geo){if(!CURREC)return false;if(lm)gzFV.setFromMatrixPosition(gzFM.copy(CM).multiply(lm));
 else{if(!geo.boundingBox)geo.computeBoundingBox();geo.boundingBox.getCenter(gzFV).applyMatrix4(CM);}
 const dx=gzFV.x-CURREC.x,dz=gzFV.z-CURREC.z,c=Math.cos(CURREC.ry),s=Math.sin(CURREC.ry);return dx*s+dz*c<-.35;}
const gzEmit0=emit;
emit=function(mk,geo,lm,col,uvm){if(GZ_FACADE&&CURREC&&gzBehind(lm,geo))return;return gzEmit0(mk,geo,lm,col,uvm);};
function gzCx(o){o=o||{};const s=o.state!=null?o.state:(typeof FG_STATE!=='undefined'?FG_STATE:'kept'),st=s==='worn'||s==='abandoned'?s:'kept';
 return {st,worn:st!=='kept',aband:st==='abandoned',v:o.v|0,o,key:CURKEY};}
function gzU(key,v,salt){const D=DEFS[key];return KRAND.unit(KRAND.hash(D?D.seed:0,v|0,salt|0));}
function gzPickA(key,v,salt,A){return A[Math.min(A.length-1,Math.floor(gzU(key,v,salt)*A.length))];}
function gzCol(k,C){const c=P(k);if(C&&C.worn){const g=(c.r+c.g+c.b)/3,m=C.aband?.68:.86,t=C.aband?.5:.3;c.r=(c.r*(1-t)+g*t)*m;c.g=(c.g*(1-t)+g*t)*m;c.b=(c.b*(1-t)+g*t)*m*.97;}return c;}
/* a seeded keep: the abandoned state thins what was left (furniture, lanterns, wheels) */
function gzKeep(C,salt,p){if(!C.aband)return true;return gzU(C.key,C.v,9000+salt)<(p==null?.4:p);}
/* ---------------------------------------------------------------- battered walls */
/* a wall piece from ya to yb, w wide at x, whose outer face is zf at the tier's foot Yb and leans back by beta (radians);
   th thick: the piece is tilted about its own centre, so the pieces of one wall share its plane */
function gzLeanBox(mk,x,ya,yb,w,zf,th,Yb,beta,col){if(yb-ya<.01||w<.01)return;const yc=(ya+yb)/2,t=Math.tan(beta),zc=zf-th/2-(yc-Yb)*t;
 box(mk,x,yc-(yb-ya)/2,zc,w,yb-ya,th,col,0,-beta);}
/* the face's z at height y on a battered wall whose foot is zf at Yb */
function gzFaceZ(zf,y,Yb,beta){return zf-(y-Yb)*Math.tan(beta);}
/* a battered wall from x0 to x1 (outer face zf at its foot Y0, up to Y1), with openings [{x, w, y0, y1}] cut through it */
function gzWall(x0,x1,Y0,Y1,zf,th,beta,ops,mk,col){ops=(ops||[]).filter(o=>o.x-o.w/2>x0&&o.x+o.w/2<x1).sort((a,b)=>a.x-b.x);let x=x0;
 for(const o of ops){const a=o.x-o.w/2,b=o.x+o.w/2;gzLeanBox(mk,(x+a)/2,Y0,Y1,a-x,zf,th,Y0,beta,col);
  if(o.y0>Y0+.01)gzLeanBox(mk,o.x,Y0,o.y0,o.w,zf,th,Y0,beta,col);if(o.y1<Y1-.01)gzLeanBox(mk,o.x,o.y1,Y1,o.w,zf,th,Y0,beta,col);x=b;}
 gzLeanBox(mk,(x+x1)/2,Y0,Y1,x1-x,zf,th,Y0,beta,col);}
/* ---------------------------------------------------------------- the cusped arch */
/* the intrados of a cusped arch over span w, from the springing (y 0) to its crown (rise): n lobes, cusps cut in by c; [x, y] */
function gzArchPts(w,rise,n,c,seg){seg=seg||Math.max(12,n*6);const P=[];for(let i=0;i<=seg;i++){const t=i/seg,a=PI*(1-t),cs=Math.abs(Math.sin(n*PI*t));
 const r=n>1?1-c*(1-cs):1;P.push([Math.cos(a)*w/2*r,Math.sin(a)*rise*r*(1+.12*(1-Math.abs(2*t-1)))]);}return P;}
/* the arch head in the frame's plane: the spandrels from the intrados up to a square top (top above the springing), depth d
   from z0 out to z0 + d; ys the springing's height. The head is prisms (one per segment) turned to stand in the x-y plane */
function gzArch(x,ys,z0,w,rise,top,d,n,mk,col,o){o=o||{};const A=gzArchPts(w,rise,n,o.cusp==null?.14:o.cusp,o.seg);
 WX(x,ys,z0,0,PI/2,0,()=>{for(let i=0;i<A.length-1;i++){const a=A[i],b=A[i+1];prism(mk,[[a[0],-a[1]],[b[0],-b[1]],[b[0],-top],[a[0],-top]],0,d,col);}});
 if(o.edge)W(x,ys,z0+d+.01,0,()=>cord(o.edge,A.map(p=>[p[0],p[1],0]),.025,o.edgeCol||P('gilt')));
 return A;}
/* ---------------------------------------------------------------- the cholet band and the eight-spoked wheel */
/* a painted band along x from x0 to x1 at y (h tall) on a face at z (yaw ry): a whitewash ground, a row of stepped lozenges in
   turn rose, teal, saffron; thin gilt lines above and below on the rich (o.gilt). The pattern sheet is owed
   (patterns/glazier/cholet-front, PROMPTS-NEEDED.md): until it comes the band is geometry */
function gzBand(x0,x1,y,z,h,C,o){o=o||{};const L=x1-x0;if(L<.2)return;const n=Math.max(2,Math.round(L/(h*1.4))),s=L/n,cols=o.cols||['rose','teal','saffron'];
 W((x0+x1)/2,y,z,(o.ry==null?0:o.ry),()=>{box('plain',0,0,-.015,L,h,.03,gzCol(o.ground||'wash',C));
  for(let i=0;i<n;i++){const cx=-L/2+(i+.5)*s,k=cols[i%cols.length],c=gzCol(k,C);if(C.aband&&gzU(C.key,C.v,700+i)<.5)continue;
   quad('plain',cx,h/2,.004,h*.5,h*.5,c,0,0,PI/4);quad('plain',cx,h/2,.006,h*.22,h*.22,gzCol(cols[(i+1)%cols.length],C),0,0,PI/4);
   for(const sx of [-1,1])quad('plain',cx+sx*s*.42,h/2,.004,s*.1,h*.7,c);}
  if(o.gilt&&!C.aband)for(const yy of [.02,h-.02])box('gilt',0,yy-.012,0,L,.024,.03,P('gilt'));});}
/* the eight-spoked wheel (Xanadu's, drawn by the Glaziers on their wheels and lamps): radius r on a face at (x, y, z), gilt */
function gzWheel8(x,y,z,r,C,mk){mk=mk||(C.aband?'brass':'gilt');const c=C.aband?gzCol('brassC',C):P('gilt');
 W(x,y,z,0,()=>{ring(mk,0,0,0,r,r*.08,c,0,PI/2,0,16);ring(mk,0,0,0,r*.28,r*.07,c,0,PI/2,0,10);
  for(let k=0;k<8;k++){const a=k*PI/4;beam(mk,[Math.cos(a)*r*.3,Math.sin(a)*r*.3,0],[Math.cos(a)*r*.95,Math.sin(a)*r*.95,0],r*.05,c);}});}
/* ---------------------------------------------------------------- windows and doors */
/* a tapering window cut in a battered wall: the opening [x, w] from sill to top (the tier's foot Yb, face zf, lean beta, wall th),
   the Tibetan trapezoid surround painted (wider at the foot), a moonglass pane, a carved cusped head, a valance of cholet stripes.
   o.lattice: a lattice of carved timber over the pane (the rich); kind 'moon' | 'dark' (abandoned: the pane broken out) */
function gzWin(x,sill,top,w,zf,th,Yb,beta,C,o){o=o||{};const ym=(sill+top)/2,zo=gzFaceZ(zf,ym,Yb,beta),h=top-sill,frame=o.frame||'alecap';
 /* the trapezoid surround, a hair proud of the face */
 const fc=gzCol(frame,C),bw=w*.5+.16,tw=w*.5+.06,hw=w/2,dz=-(h+.16)*Math.tan(beta),s0=sill-.12,zt=t=>dz*(t-s0)/(top+.04-s0);
 /* the frame round the opening, wider at its foot: two slanted sides, a sill band and a thin head band (the pane shows inside) */
 W(x,0,gzFaceZ(zf,s0,Yb,beta)+.012,0,()=>{for(const s of [-1,1])poly('plain',s<0?[[-bw,s0,0],[-hw,sill,zt(sill)],[-hw,top,zt(top)],[-tw,top+.04,zt(top+.04)]]:[[hw,sill,zt(sill)],[bw,s0,0],[tw,top+.04,zt(top+.04)],[hw,top,zt(top)]],fc,false);
  poly('plain',[[-bw,s0,0],[bw,s0,0],[hw,sill,zt(sill)],[-hw,sill,zt(sill)]],fc,false);poly('plain',[[-hw,top,zt(top)],[hw,top,zt(top)],[tw,top+.04,zt(top+.04)],[-tw,top+.04,zt(top+.04)]],fc,false);});
 /* the pane in the wall's thickness */
 if(!C.aband)svPane(x,sill,zo-th*.5,0,w,h,{kind:'frosted',t:.03});else W(x,sill,zo-th*.5,0,()=>box('plain',0,0,-.05,w,h,.02,hc(0x141210)));
 /* the cusped head: a carved timber lintel with the arch cut under it */
 gzArch(x,top-h*.28,zo-.02,w,h*.28,h*.28+.12,.1,(o.lobes==null?3:o.lobes),'carved',gzCol('timber',C),{cusp:.16,seg:12});
 box('carved',x,top+.12,zo-.02,w+.3,.1,.16,gzCol('timber',C));
 /* the valance (shambu): three stripes of cloth over the head */
 if(!C.aband||gzU(C.key,C.v,31+Math.round(x*7))<.4){const sc=o.valance||['rose','teal','saffron'];for(let k=0;k<3;k++)box('silk',x,top+.22-k*.07-.07,zo+.06,w+.36,.07,.02,gzCol(sc[k%sc.length],C),0,0,k===2?.0:0);}
 if(o.lattice&&!C.aband){const lc=gzCol('timber',C),nx=Math.max(2,Math.round(w/.16)),ny=Math.max(3,Math.round(h/.16));W(x,sill,zo-.04,0,()=>{
  for(let i=1;i<nx;i++)box('carved',-w/2+w*i/nx,0,0,.025,h-h*.28,.03,lc);for(let j=1;j<ny;j++)box('carved',0,j*h*.72/ny,0,w,.025,.03,lc);});}
 windowAt(x,sill,zo,0,w,h,sill-Yb);}
/* a cusped doorway in a battered wall: the opening [x, w] up to top, the arch head (lobes), a frame in carved timber (gilt on the
   rich), the leaf (carved timber, or a curtain of wax-cloth: o.curtain), the household's lamp of the code beside it */
function gzDoor(x,top,w,zf,th,Yb,beta,C,o){o=o||{};const zo=gzFaceZ(zf,Yb+top*.5,Yb,beta),tc=gzCol('timber',C),rise=Math.min(.6,w*.42),ys=Yb+top-rise;
 for(const s of [-1,1])box('carved',x+s*(w/2+.07),Yb,zo-.05,.14,top+.12,.2,tc);
 gzArch(x,ys,zo-.15,w,rise,rise+.14,.2,(o.lobes==null?3:o.lobes),'carved',tc,{edge:o.gilt&&!C.aband?'gilt':null});
 box('carved',x,Yb+top+.12,zo-.15,w+.44,.14,.24,tc);
 /* a curtain is no wall to a walker: its strips are not recorded in core/walk (WKOFF, 37-wk-rec.js) */
 if(o.curtain){if(!C.aband||gzU(C.key,C.v,77)<.5){WKOFF++;try{W(x,Yb,zo-th*.5,0,()=>{const cc=gzCol(o.curtain,C);for(let k=0;k<5;k++)box('silk',-w/2+w*(k+.5)/5,C.aband?.5:0,0,w/5+.01,top-(C.aband?.5:0)-.05,.03,cc.clone().multiplyScalar(k%2?.9:1));});}finally{WKOFF--;}}}
 else svLeaf(x,Yb,zo-th*.5,0,w,top-.02,{mk:'carved',col:C.aband?0xa09080:0xffffff,t:.06,ajar:C.worn?.8:0,name:o.name||'a carved door'});
 door(x,Yb,zo,0,w,top);
 if(o.lamp)gzLamp(o.lamp,x+(w/2+.38)*((o.lampSide==null?1:o.lampSide)),Yb+top-.15,zo+.12,C,{wall:true});}
/* ---------------------------------------------------------------- lamps and lanterns */
/* a light record (world frame) when the lamp burns; the halo the sheet shows */
function gzLight(kind,x,y,z,C,o){o=o||{};const L=TG.gz.LAMP[kind]||TG.gz.LAMP.wax;if(C.aband&&!o.always)return null;
 if(GZ_FACADE&&CURREC&&gzBehind(new THREE.Matrix4().makeTranslation(x,y,z),null))return null;
 const p=new THREE.Vector3(x,y,z).applyMatrix4(CM),r={id:(CURREC&&(CURREC.id||CURREC.tid)||CURKEY||'gz')+':'+kind+':'+TG.gz.LIGHTS.length,x:+p.x.toFixed(3),y:+p.y.toFixed(3),z:+p.z.toFixed(3),
  kind:L.kind,colour:L.hex,range:L.range*(C.worn?.8:1),intensity:L.intensity*(C.worn?.7:1),owner:CURREC?(CURREC.id||CURREC.tid||CURREC.key):null,on:true};
 if(!PLACE_DRY||GZ_COLLECT)TG.gz.LIGHTS.push(r);if(o.halo!==false)haloAt(x,y,z,L.hex,!!o.big);return r;}
/* a lamp of the code: an iron bracket from the wall (o.wall) or a hook, a glass globe in the code's colour (dark when out) */
function gzLamp(code,x,y,z,C,o){o=o||{};const L=TG.gz.LAMP[code]||TG.gz.LAMP.red,on=!C.aband;
 if(o.wall)beam('iron',[x,y+.12,z-.14],[x,y+.12,z],.02,P('iron'));
 cyl('iron',x,y+.1,z,.07,.04,P('iron'),8);ellip(on?'glow':'glass',x,y,z,.08,.1,.08,on?hc(L.hex):hc(0x2a2624),0,8);
 if(L.hood)cone('iron',x,y+.1,z,.12,.08,P('iron'),8);gzLight(code,x,y,z,C);}
/* the moonglass lantern (glazier_poor_moonglass_lantern): a brass frame round four panes of potch, a wax light inside; hung (o.hang
   the hook's height above it) or standing */
function gzLantern(x,y,z,C,o){o=o||{};const bc=gzCol('brassC',C),h=.42,w=.22;if(!gzKeep(C,Math.round(x*13+z*7),.35))return;
 W(x,y,z,0,()=>{box('brass',0,0,0,w+.03,.03,w+.03,bc);box('brass',0,h,0,w+.03,.03,w+.03,bc);cone('brass',0,h+.03,0,w*.62,.12,bc,8);
  for(const sx of [-1,1])for(const sz of [-1,1])box('brass',sx*w/2,.03,sz*w/2,.02,h-.03,.02,bc);
  for(const [ax,az,ry] of [[0,w/2,0],[0,-w/2,0],[w/2,0,PI/2],[-w/2,0,PI/2]])box(C.aband?'glass':'potch',ax,.03,az,w-.03,h-.04,.012,C.aband?hc(0x3a3834):P('potch'),ry);
  if(!C.aband)ellip('glow',0,h*.45,0,.05,.09,.05,hc(0xffe6b8),0,6);
  if(o.hang)cord('cord',[[0,h+.15,0],[0,h+o.hang,0]],.008,P('iron'));});
 gzLight('moon',x,y+h*.5,z,C,{big:!!o.big});}
/* the pierced brass lantern (glazier_common_brass_lantern): a lathe of brass, hung beside the moonglass ones */
function gzBrass(x,y,z,C,o){o=o||{};if(!gzKeep(C,Math.round(x*11+z*5),.3))return;const bc=gzCol('brassC',C);
 W(x,y,z,0,()=>{lathe('brass',0,0,[[.02,0],[.12,.06],[.15,.22],[.11,.4],[.05,.52],[.015,.62]],10,bc);if(!C.aband)ellip('glow',0,.25,0,.07,.1,.07,hc(0xffc070),0,6);
  if(o.hang)cord('cord',[[0,.62,0],[0,o.hang,0]],.008,P('iron'));});gzLight('wax',x,y+.25,z,C);}
/* ---------------------------------------------------------------- the click wheel */
/* a click wheel (glazier_common_click_wheel): a painted drum on an iron axle between a stone foot and a timber bracket, its band
   in gilt with the eight-spoked wheel, opal chips and frost-willow spicule twigs hung from its lower rim on cords: they ring as
   a passer-by turns it (the Tungang click made a prayer). r the drum's radius, h its height, y0 its foot */
function gzClick(x,y0,z,r,h,C,o){o=o||{};const keep=gzKeep(C,Math.round(x*17+z*3),.55);
 W(x,y0,z,0,()=>{const dc=gzCol(o.col||pick(['rose','teal','saffron','carpetR']),C),gc=C.aband?gzCol('brassC',C):P('gilt'),y=.45;
  cyl('hewn',0,0,0,r*.9,.3,gzCol('rock',C),10);beam('iron',[0,.3,0],[0,y+h+.35,0],.025,P('iron'));
  if(!keep){box('plain',r*.6,0,r*.4,.4,.06,.3,dc,.4);return;}
  cyl('paint',0,y,0,r,h,dc,14);for(const yy of [y,y+h-.05])cyl('gilt',0,yy,0,r+.012,.05,gc,14);
  /* the wheel's words: three bands of small gilt marks (the syllabary; drawn, not written) */
  for(let k=0;k<12;k++){const a=k*TAU/12;W(Math.cos(a)*(r+.006),y+h*.5,Math.sin(a)*(r+.006),-a+PI/2,()=>quad('plain',0,0,0,.04,h*.5,gc));}
  /* the opal chips and the spicule twigs on cords from the lower rim */
  const n=o.chips==null?8:o.chips,oc=SVPAL.opal;for(let k=0;k<n;k++){const a=k*TAU/n+.2,px=Math.cos(a)*(r-.02),pz=Math.sin(a)*(r-.02),L=.12+.08*((k*7)%3);
   cord('cord',[[px,y,pz],[px,y-L,pz]],.004,P('rope'));
   if(k%2)ellip('potch',px,y-L-.02,pz,.025,.035,.012,hc(oc[k%oc.length]),a,5);else beam('bone',[px,y-L,pz],[px+.015,y-L-.16,pz-.01],.006,hc(0xeef2f4));}
  /* the bracket above */
  box('carved',0,y+h+.3,0,r*2+.2,.08,.12,gzCol('timber',C));});
 if(keep)fgNote('wheels');}
/* ---------------------------------------------------------------- furniture */
/* the catalog's pieces at the floor (y null: the floor finish's top, .05); its back to a wall as fgFurnBack / fgFurnSide */
function gzFurn(key,x,y,z,ry,o,C){if(GZ_FACADE)return null;if(C&&C.aband&&!gzKeep(C,Math.round(x*31+z*17),.45))return null;return FURNISH(key,x,y==null?.05:y,z,ry==null?0:ry,o);}
/* ---------------------------------------------------------------- the void plan: rooms, stairs, doorways */
/* a rectangular room void; o.join: a stretch of a working that runs on into the next (a gallery's turns, an adit's face): the
   rock between rooms is not asked of it */
function gzRoom(id,x,z,w,d,y,o){o=o||{};return Object.assign({id,kind:'room',x,z,w,d,y:(y==null?0:y),h:o.h==null?2.45:o.h,ceil:o.ceil||'vault',rise:o.rise==null?.45:o.rise,
 finish:o.finish||'hewn',use:o.use||'room',doors:o.doors||[]},o.noFloor?{noFloor:true}:{},o.dado?{dado:o.dado}:{},o.join?{join:true}:{},o.extra||{});}
/* a doorway void: a short passage of w x dh from (x, z0) to (x, z1) (along z) or along x (o.ax 'x'), floor y */
/* a passage runs .35 m on into the rooms at both its ends: the cavern insets every floor .3 m (core/terrain 39), so without the
   overlap a walker meets a gap at each doorway */
function gzPass(id,x,z0,z1,w,y,o){o=o||{};const ax=o.ax||'z',L=Math.abs(z1-z0)+.7,m=(z0+z1)/2;
 return {id,kind:'room',x:ax==='z'?x:m,z:ax==='z'?m:x,w:ax==='z'?w:L,d:ax==='z'?L:w,y:(y==null?0:y),h:o.h==null?1.95:o.h,ceil:'flat',rise:0,finish:o.finish||'hewn',use:'door',doors:[],pass:true};}
/* a stair void from a to b ([x, y, z] the floor at each end), w wide, h clear over the flight */
function gzStairV(id,a,b,w,o){return {id,kind:'stair',a,b,w:(w==null?1:w),h:o&&o.h!=null?o.h:2.2};}
/* the plan of a def (the one source): TG.gz.PLANS[key](o) -> {voids, rooms (by id), ...the def's own layout} */
TG.gz.plan=function(key,o){const f=TG.gz.PLANS[key];if(!f)return null;o=o||{};const R=f(Object.assign({v:o.v|0},o));R.byId={};for(const v of R.voids)R.byId[v.id]=v;return R;};
/* a room's polygon (its rectangle, plan view [x, z]) and its corner radius for the cavern */
function gzPoly(V){if(V.poly)return V.poly;const hw=V.w/2,hd=V.d/2;return [[V.x-hw,V.z-hd],[V.x+hw,V.z-hd],[V.x+hw,V.z+hd],[V.x-hw,V.z+hd]];}
/* ---------------------------------------------------------------- drawing a plan's rooms */
/* each room of the plan (not the passages): its floor finish (flags of hewn rock, whitewashed boards on plaster, a carpet on
   polished), its whitewash lining for plaster and polished rooms (to the springing, with a gap at each door on that wall), a
   dado band in the Order's blue or alecap. The rock itself is the cavern's (the sheet's rows, the scarp, a world's) */
function gzRooms(PL,C){for(const V of PL.voids){if(V.kind!=='room'||V.pass||V.noFloor)continue;const hw=V.w/2,hd=V.d/2,fin=V.finish;
 W(V.x,V.y,V.z,0,()=>{box(fin==='hewn'?'hewn':'wash',0,0,0,V.w-.04,.05,V.d-.04,fin==='hewn'?gzCol('rock',C):gzCol(fin==='polished'?'rhyo':'washOld',C));
  if(fin==='plaster'||fin==='polished'){const lc=gzCol(fin==='polished'?'wash':'washOld',C),dc=gzCol(V.dado||(fin==='polished'?'orderBlue':'alecap'),C),hh=V.h-.05,th=.04;
   const sides={n:[[-hw,-hd+.04],[hw,-hd+.04],0],s:[[-hw,hd-.04],[hw,hd-.04],0],w:[[-hw+.04,-hd],[-hw+.04,hd],1],e:[[hw-.04,-hd],[hw-.04,hd],1]};
   for(const sd in sides){const [a,b,vert]=sides[sd],L=vert?V.d:V.w,gaps=(V.doors||[]).filter(d=>d.side===sd).map(d=>[d.at-d.w/2-.05,d.at+d.w/2+.05]).sort((p,q)=>p[0]-q[0]);
    let s=-L/2;const seg=(s0,s1)=>{if(s1-s0<.05)return;const m=(s0+s1)/2;if(vert){box('wash',a[0],.05,m,th,hh,s1-s0,lc);box('plain',a[0]+(sd==='w'?.025:-.025),.05,m,.01,.12,s1-s0,dc);}
     else{box('wash',m,.05,a[1],s1-s0,hh,th,lc);box('plain',m,.05,a[1]+(sd==='n'?.025:-.025),s1-s0,.12,.01,dc);}};
    for(const g of gaps){seg(s,g[0]);s=g[1];}seg(s,L/2);}}});}}
/* the plan's world records for a site at (x, y, z, ry): each void's primitive in the shape KCAVERN takes (room: poly, y, h, ceil,
   rise, r, finish; stair: a, b, w, h), its id prefixed by the site's. A world carves them (TG.gz.carve) */
function gzWorldVoids(PL,site){const c=Math.cos((site.ry==null?0:site.ry)),s=Math.sin((site.ry==null?0:site.ry)),X=(lx,lz)=>[+(site.x+lx*c+lz*s).toFixed(4),+(site.z-lx*s+lz*c).toFixed(4)],y0=(site.y==null?0:site.y),out=[];
 for(const V of PL.voids){const id=(site.id||site.key)+'.'+V.id;
  if(V.kind==='stair'){const a=X(V.a[0],V.a[2]),b=X(V.b[0],V.b[2]);out.push({prim:'stair',id,a:[a[0],y0+V.a[1],a[1]],b:[b[0],y0+V.b[1],b[1]],w:V.w,h:V.h,owner:site.id||site.key});}
  else out.push({prim:'room',id,poly:gzPoly(V).map(p=>X(p[0],p[1])),y:y0+V.y,h:V.h,ceil:V.ceil||'flat',rise:(V.rise==null?0:V.rise),r:V.pass?0:(Math.min(V.w,V.d)/2-.15>.1?Math.min(.25,Math.min(V.w,V.d)/2-.15):0),
   finish:V.finish==='polished'?'polished':V.finish==='plaster'?'plaster':'hewn',owner:site.id||site.key,pass:!!V.pass});}
 return out;}
