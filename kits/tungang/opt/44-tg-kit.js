// prefix: tg
// ================================================================= THE TUNGANG SET (tg): its boxes, its void plans, its palette, its lamp code, its helpers
// The Tungangs (PLAN.md sections 1.2, 3.1, 3.2, 5): the Line's crews, "friendly Morlocks"; their rooms are CUT into the rock
// (carved first: built pieces stand inside the voids, never instead of them), squared, small and many, hewn or plastered,
// wealth in the salvage fitted (enamel, brass, a carriage), never in the rock. Every door on a gallery has its lamp of the
// code's colour, a stencilled number and its click-ribs (3.1). The 0.94 scale: doorways 1.95 m, rooms 2.4-2.6 m clear.
//
// THE FRAME (a wall site's: core/city/cavern, Dhelv's): the origin is the foot of the def's FRONT on its way's wall, the door
// faces +z (into the way), the rooms run into the rock at -z. TG.tg.BOX[key] is the box behind the front ({w across, d deep,
// h}); TG.tg.plan(key, o) the VOID PLAN, the one source (kits/zeijani/PLAN.md 6.3): the cavern carves it, the builder draws
// inside it, core/city/cavern's carve takes it (KCITY.cavern.carve(H, {plan})). Each void {id, kind ('room' | 'stair'),
// x, z (its centre), w, d, y (its floor), h} or a stair {id, kind:'stair', a:[x,y,z], b:[x,y,z], w, h}; a doorway void runs
// .4 m out past the front (z +.4) so it overlaps the way it opens on (Dhelv's lesson).
//
// STATES (PLAN.md 5.3: a hold moves when its heat moves, the same def at three ages): kept, worn (greyed, lamps dim, the
// curtains rags, rubble at the foot of the walls) and abandoned (dark: no lamps lit, the furniture thinned and dust, doors
// hanging, the plaster stained). o.state or the record's; ?tgstate= on the sheet.
//
// THE LIGHT (PLAN.md 1.2, 1.5.1): the lamp code marks the ways and the doors (red a home, green the Line, amber work,
// glow-cap the poor, white hooded the surface and danger); rooms are lit by WAX LIGHT (warm white). Every lamp a builder
// hangs is a light record in TG.tg.LIGHTS (core/cavelight's shape: {id, x, y, z, kind, colour, range, intensity, owner,
// on}), so a world's KCAVELIGHT lights them (Loj Twenny) and the sheet shows them as halos.
TG.tg={SCALE:.94,
 /* the code's colours (PLAN.md 1.5.1) and each kind's KCAVELIGHT kind, range and intensity (the cave-light session's weakened
    coloured lamps: green .45/6 m, amber .7/8, red .35/4) */
 LAMP:{red:{hex:0xd8462e,kind:'lamp-red',range:4,intensity:.35},green:{hex:0x46c27a,kind:'lamp-green',range:6,intensity:.45},
  amber:{hex:0xf0a63a,kind:'lamp-amber',range:8,intensity:.7},glow:{hex:0x9fe8c0,kind:'glowcap',range:3,intensity:.25},
  white:{hex:0xf6f3ea,kind:'lamp-white',range:6,intensity:.6,hood:true},wax:{hex:0xffd9a0,kind:'wax',range:5,intensity:.55}},
 /* every def's box behind its front (w across, d into the rock, h to the highest ceiling), its tier and what it is */
 BOX:{
  'tg-cut':{w:2.8,d:3.6,h:2.4,tier:'poor',code:'red',what:'a single hewn cell off a gallery: a curtain door, a red lamp, a glow-cap jar'},
  'tg-set':{w:7.4,d:8.6,h:2.6,tier:'common',code:'red',what:'a household\'s cut rooms: the hearth room, the sleeping room, the store; the doorway plastered white with the berth numbers'},
  'tg-loj-hall':{w:14,d:17,h:6,tier:'civic',code:'green',what:'the loj hall: raked benches, the count wall and its lamp row, the banner wall, the Book\'s lectern, the steward\'s desk, the minute chest and the minutes on enamel'},
  'tg-signal-box':{w:6.4,d:5.2,h:3,tier:'civic',code:'green',what:'the steward\'s office in a cut called the signal box: the lever frame, the desk, the timetable and the rota'},
  'tg-carriage-house':{w:27,d:8.6,h:5.4,tier:'rich',code:'red',what:'a Line carriage drawn into a cut bay, its windows plated, its seats kept, a cut room behind it for the stove, a brass bell, the household\'s banner'},
  'tg-dark-beds':{w:12.4,d:14,h:3.2,tier:'works',code:'amber',what:'the dark beds: racks of plate trays of pale fungus under amber tending lamps, the mat in its sealed beds'},
  'tg-cistern':{w:8.4,d:9.4,h:3.6,tier:'works',code:'amber',what:'the cistern: a sunk tank under a plate walk, the drip gutters, the tap and the butts'},
  'tg-bath':{w:8.4,d:9.4,h:3.2,tier:'works',code:'amber',what:'the bath: a plastered pool of warm vent water, benches, the steam'},
  'tg-fan-house':{w:6.4,d:8.2,h:4.4,tier:'works',code:'amber',what:'the fan house: an Ancient fan still turning in the draught, its frame, the draught doors'},
  'tg-doors':{w:10,d:4.4,h:5,tier:'civic',code:'white',what:'the hold\'s gate: an Ancient door kept working across the way, its winding gear, the guard cut, the white lamp hooded'},
  'tg-night-mouth':{w:3.4,d:16,h:3,tier:'war',code:'white',what:'the night mouth: a cut passage climbing toward the surface, the hooded white lamp you are asked to cover, the click-ribs that tell who comes, a door'},
  'tg-last-stop':{w:7,d:12,h:3,tier:'last',code:null,what:'the last stop: the sealed siding of the dead, the berth numbers painted on the seals, the lamps left burning down'}},
 /* the palette (PLAN.md 1.5.1, the catalog file's): plaster and whitewash, hewn rock trims, the salvage, the livery */
 PAL:{plaster:0xe6e0d2,plasterW:0xc4bca8,plasterA:0x9a9282,hewn:0x7a7064,plate:0x8e8a80,plateG:0x3f5a43,cream:0xd8cfb0,oxide:0x8a3e2a,
  rust:0x8a5a3a,enamel:0xe2d8bc,enamelR:0xa8382c,brass:0xb08a48,canvas:0x8a8264,blanketG:0x6a6a64,blanketB:0x5e4a3a,blanketR:0x8a3028,
  tabard:0xc8783e,shine:0xdcdcd4,felt:0x6a5a48,leather:0xb59a72,rose:0xc88478,wax:0xe8d8a8,water:0x2a4a52,fungus:0xd8d0b8,mat:0x6a5a48,
  dark:0x16181a,dust:0x8a8274,steel:0x5c5e5a,glass:0x2e3438},
 LIGHTS:[],FURN:[],
 /* the void plan of a def: pure data (no three.js), so core/city/cavern's carve and a Godot port read it */
 plan(key,o){o=o||{};const B=TG.tg.BOX[key];if(!B)return null;const f=TG_PLANS[key];return f?f(B,o):[{id:'room',kind:'room',x:0,z:-B.d/2,w:B.w,d:B.d,y:0,h:B.h}];},
 /* the doorway every plan opens with: from .4 m out past the front to its first room */
 states:['kept','worn','abandoned']};
/* a doorway: a passage from z +.4 (into the way) back to z1 (the first room's front face, overlapping it .3 m) */
function tgDoorway(x,w,h,z1,id){return {id:id||'door',kind:'room',x,z:(.4+z1-.3)/2,w,d:.4-(z1-.3),y:0,h};}
const TG_PLANS={
 'tg-cut':B=>[tgDoorway(0,1.1,2.05,-.6),{id:'cell',kind:'room',x:0,z:-2.1,w:2.5,d:3,y:0,h:2.35}],
 'tg-set':B=>[tgDoorway(0,1.2,2.1,-.6),{id:'hearth',kind:'room',x:0,z:-2.4,w:4.6,d:3.6,y:0,h:2.55},
  {id:'sleep',kind:'room',x:-1.8,z:-6.6,w:3.4,d:3.4,y:0,h:2.4},{id:'store',kind:'room',x:2.2,z:-6.4,w:2.4,d:2.8,y:0,h:2.3},
  {id:'sleepdoor',kind:'room',x:-1.8,z:-4.55,w:.9,d:1.3,y:0,h:2},{id:'storedoor',kind:'room',x:2.2,z:-4.6,w:.8,d:1.2,y:0,h:1.95}],
 'tg-loj-hall':B=>[tgDoorway(0,2.4,2.6,-1.2,'door'),{id:'foyer',kind:'room',x:0,z:-2.2,w:6,d:2.4,y:0,h:2.8},
  {id:'hall',kind:'room',x:0,z:-10,w:13.2,d:13.4,y:0,h:5.8},{id:'hallgate',kind:'room',x:0,z:-3.6,w:2.6,d:1.4,y:0,h:2.6}],
 'tg-signal-box':B=>[tgDoorway(0,1.1,2.05,-.6),{id:'box',kind:'room',x:0,z:-2.8,w:6,d:4.6,y:0,h:2.9}],
 'tg-carriage-house':B=>[{id:'bay',kind:'room',x:0,z:-2.4,w:26.6,d:5.2,y:0,h:5.2},{id:'galley',kind:'room',x:3,z:-6.6,w:4.4,d:3.4,y:0,h:2.5},
  {id:'galleydoor',kind:'room',x:3,z:-4.6,w:1,d:1.4,y:0,h:2}],
 'tg-dark-beds':B=>[tgDoorway(0,1.6,2.2,-.8),{id:'beds',kind:'room',x:0,z:-7.4,w:12,d:13.2,y:0,h:3.1}],
 'tg-cistern':B=>[tgDoorway(0,1.4,2.2,-.6),{id:'tank',kind:'room',x:0,z:-4.9,w:8,d:8.4,y:0,h:3.5},
  {id:'sump',kind:'room',x:0,z:-5.6,w:6.4,d:6,y:-1.6,h:1.7,floor:false}],
 'tg-bath':B=>[tgDoorway(0,1.4,2.2,-.6),{id:'bath',kind:'room',x:0,z:-5,w:8,d:8.8,y:0,h:3.1},
  {id:'pool',kind:'room',x:0,z:-5.8,w:5,d:4.6,y:-1.1,h:1.2,floor:false}],
 'tg-fan-house':B=>[tgDoorway(0,1.4,2.3,-.6),{id:'fan',kind:'room',x:0,z:-4.2,w:6,d:7.2,y:0,h:4.3}],
 'tg-doors':B=>[{id:'guard',kind:'room',x:-3.4,z:-2.4,w:3,d:3.6,y:0,h:2.5},tgDoorway(-3.4,1,2,-.6,'guarddoor')],
 'tg-night-mouth':B=>[tgDoorway(0,1.3,2.2,-.6),{id:'porch',kind:'room',x:0,z:-1.8,w:2.6,d:2.6,y:0,h:2.6},
  {id:'climb',kind:'stair',a:[0,0,-3],b:[0,4.2,-15.4],w:1.6,h:2.4}],
 'tg-last-stop':B=>[{id:'seal',kind:'room',x:0,z:-.6,w:5.6,d:1.6,y:0,h:2.8},{id:'siding',kind:'room',x:0,z:-6.6,w:5.2,d:10.6,y:0,h:2.8}]};
/* ---------------------------------------------------------------- the builder's context and colours */
let TG_STATE=(()=>{const m=typeof location!=='undefined'&&/[?&]tgstate=(worn|abandoned)\b/.exec(location.search);return m?m[1]:'kept';})();
function tgCx(o){o=o||{};const st=o.state==='worn'||o.state==='abandoned'?o.state:o.state==='kept'?'kept':TG_STATE;
 return {state:st,worn:st!=='kept',aband:st==='abandoned',v:o.v|0,num:o.num==null?null:o.num,owner:o.owner||null};}
/* a palette colour aged by the state: worn greyed and darkened, abandoned more so and dusted */
function tgCol(k,C){const hex=TG.tg.PAL[k]==null?k:TG.tg.PAL[k],c=jc(hex,.04);if(C&&C.worn){const g=(c.r+c.g+c.b)/3,f=C.aband?.55:.3,d=C.aband?.7:.85;
 c.r=(c.r*(1-f)+g*f)*d;c.g=(c.g*(1-f)+g*f)*d;c.b=(c.b*(1-f)+g*f)*d;}return c;}
function tgU(C,salt){const s=CURKEY&&DEFS[CURKEY]?DEFS[CURKEY].seed:0;return KRAND.unit(KRAND.hash(s,C.v|0,salt|0));}
/* ---------------------------------------------------------------- the lamps: a housing, its glass in the code's colour, a light record */
/* tgLamp(code, x, y, z, C, o): a lamp of the code (red, green, amber, glow, white, wax) at a local point; o.hood (a hooded white),
   o.on (default: lit unless abandoned; the last stop's lamps burn on), o.wall (a bracket back to -z), o.pole (a lamp pole to the floor) */
function tgLamp(code,x,y,z,C,o){o=o||{};const L=TG.tg.LAMP[code]||TG.tg.LAMP.wax,on=o.on==null?!C.aband:o.on,dim=C.worn&&!C.aband?.6:1;
 const pc=tgCol('steel',C);if(o.wall)box('iron',x,y+.12,z-.12,.04,.04,.24,pc);if(o.pole)pole('iron',[x,0,z],[x,y+.3,z],.03,pc,6);
 box('plate',x,y-.06,z,.16,.04,.16,pc);box('plate',x,y+.16,z,.18,.05,.18,pc);
 const gc=on?hc(L.hex).clone().multiplyScalar(dim):tgCol('dark',C);box(on?'glow':'glass',x,y-.02,z,.11,.18,.11,gc);
 if(L.hood||o.hood){box('plate',x,y+.2,z+.02,.24,.26,.06,tgCol('plate',C));box('plate',x,y+.2,z-.1,.24,.26,.04,tgCol('plate',C));}
 if(on){const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);if(!PLACE_DRY||TG_COLLECT){TG.tg.LIGHTS.push({id:(CURREC&&CURREC.tid||CURKEY||'tg')+':lamp'+TG.tg.LIGHTS.length,
  x:+p.x.toFixed(3),y:+p.y.toFixed(3),z:+p.z.toFixed(3),kind:L.kind,code,colour:L.hex,range:L.range*(L.hood||o.hood?.5:1),intensity:L.intensity*dim,owner:CURREC&&CURREC.tid||null,on:true});}
  haloAt(x,y,z,L.hex,false);}}
let TG_COLLECT=0;   /* a world's dry draw still collects the lights (80-tg-host.js sets it) */
/* ---------------------------------------------------------------- furniture at the Tungangs' scale (PLAN.md 3.1: 0.94)
   The engine's batch draws a catalog piece at a human's measure (core/furnish: KFURN.drawRec passes no scale; the furniture
   session's follow-up). So the set's pieces go to a batch of their own: placed at their world point over the scale and
   flushed into a group scaled by it (80-tg-host.js tgFurnFlush), which puts each piece back at its point, 0.94 of its size.
   Each is registered in core/tags (class furniture, the def as parent) before it is drawn, as FURNISH does. */
function tgFurn(key,x,y,z,ry,o){o=o||{};if(typeof KratorFurniture==='undefined'||!KratorFurniture.has(key)){TG.tg.missing[key]=(TG.tg.missing[key]||0)+1;return null;}
 const p=new THREE.Vector3(x,y==null?0:y,z).applyMatrix4(CM),e=CM.elements,wry=Math.atan2(e[8],e[10])+(ry||0),rec={key,x:p.x,y:p.y,z:p.z,ry:wry,v:o.v|0,s:TG.tg.SCALE};
 if(SVTAGS&&!PLACE_DRY){const A=KratorFurniture.FURN_BY_KEY[key],dm=KratorFurniture.entryDims(A,o.v|0);
  const tr={'class':'furniture',kind:A.type||null,key,name:A.name||key,at:[p.x,p.y,p.z],ry:wry,size:[dm.w*rec.s,dm.d*rec.s,dm.h*rec.s],tags:{culture:'tungang',scale:rec.s},frag:'kits/tungang'};
  const t=CURREC&&CURREC.tid?SVTAGS.child(CURREC.tid,tr):SVTAGS.add(tr);rec.id=t.id;}
 TG.tg.FURN.push(rec);if(CURREC)CURREC.furniture.push(rec);return rec;}
TG.tg.missing={};
function tgDim(key,v){if(typeof KratorFurniture==='undefined'||!KratorFurniture.has(key))return {w:1,d:1,h:1};const d=KratorFurniture.entryDims(KratorFurniture.FURN_BY_KEY[key],v|0),s=TG.tg.SCALE;return {w:d.w*s,d:d.d*s,h:d.h*s};}
/* a piece with its back to a wall: the back wall at zb (its back to -z), or a side wall at xw (xs -1 the left, +1 the right) */
function tgFurnBack(key,x,zb,o,y){const d=tgDim(key,o&&o.v);return tgFurn(key,x,y,zb+d.d/2+.04,0,o);}
function tgFurnSide(key,xs,xw,z,o,y){const d=tgDim(key,o&&o.v);return tgFurn(key,xw-xs*(d.d/2+.04),y,z,xs<0?PI/2:-PI/2,o);}
/* the abandoned state thins the furniture: keep a piece or not, by its salt */
function tgKeep(C,salt,p){return !C.aband||tgU(C,salt)<(p==null?.35:p);}
/* ---------------------------------------------------------------- the door's dress (PLAN.md 3.1): a plate frame, the stencilled number, the click-ribs, the code's lamp */
/* tgFront(w, h, C, o): at the front (z 0) a doorway w x h: a riveted plate frame, its number stencilled over it (o.num), the
   code's lamp beside it (o.code), the click-ribs on the other side (o.ribs), a curtain (o.curtain) or a plate leaf (o.leaf),
   the doorway plastered white round it (o.plaster: the households' sets), declared as a door() */
function tgFront(x,w,h,C,o){o=o||{};const pc=tgCol(o.frame||'plate',C),t=.08,z=.02;
 for(const s of [-1,1])box('plate',x+s*(w/2+t/2),0,z,t,h,.12,pc);box('plate',x,h,z,w+2*t,t,.12,pc);
 /* the rivets along the jambs */
 for(const s of [-1,1])for(let y=.3;y<h;y+=.45)box('iron',x+s*(w/2+t/2),y,z+.065,.03,.03,.02,tgCol('steel',C));
 if(o.plaster){const pw=w+1.6,ph=h+.7,pcol=tgCol(C.aband?'plasterA':C.worn?'plasterW':'plaster',C);
  box('plain',x-(w/2+t+.4),0,-.04,.8-.0,ph,.04,pcol);box('plain',x+(w/2+t+.4),0,-.04,.8,ph,.04,pcol);box('plain',x,h+t,-.04,pw,ph-h-t,.04,pcol);
  if(C.aband)for(let i=0;i<5;i++)box('plain',x-(pw/2)+pw*tgU(C,70+i),.2+ph*.7*tgU(C,80+i),-.015,.2+.3*tgU(C,90+i),.4+.6*tgU(C,95+i),.01,tgCol('dust',C));}
 if(o.num!=null){const s=String(o.num),ch=.16;fgText(s,x,h+.28,z+.08,0,ch,C.aband?tgCol('dust',C):hc(TG.tg.PAL.rose));}
 if(o.code){const sx=o.lampSide==null?1:o.lampSide;tgLamp(o.code,x+sx*(w/2+.45),Math.min(2.2,h+.05),z+.18,C,{wall:true,hood:o.code==='white'});}
 if(o.ribs!==false&&tgKeep(C,41,.6)){const sx=o.lampSide==null?-1:-o.lampSide;tgFurn('tungang_common_click_ribs',x+sx*(w/2+.75),0,z+.08,0);}
 if(o.curtain&&!C.aband){const cc=tgCol(o.curtain,C);box('plain',x-w/4,0.15,z-.08,w/2-.04,h-.2,.03,cc);box('plain',x+w/4+(C.worn?.1:0),C.worn?.5:.15,z-.08,w/2-.14,h-(C.worn?.6:.2),.03,cc);}
 if(o.leaf){const lc=tgCol(o.leaf==='green'?'plateG':'plate',C);if(C.aband)box('plate',x+w*.3,0,z+.6,w,.06,h*.9,lc,.4);
  else if(C.worn)box('plate',x-w/2-.02,0,z+.5,.06,h-.04,w*.9,lc,.5);else box('plate',x-w/2-.02,0,z+.45,.06,h-.04,w*.9,lc);}
 door(x,0,0,0,w,h);}
/* plaster on a room's wall (the inner face of a cut room at x0..x1, the face at z, facing +z) */
function tgPlaster(x0,x1,y0,y1,z,C,ry){const col=tgCol(C.aband?'plasterA':C.worn?'plasterW':'plaster',C);W((x0+x1)/2,0,z,ry||0,()=>box('plain',0,y0,.02,x1-x0,y1-y0,.03,col));}
/* a paint band at waist height (PLAN.md 5.4: the siding's livery: cream over red, cream over green, plain red) along a wall */
function tgBand(x0,x1,z,C,band,ry){const lo=band==='cream-green'?'plateG':band==='red'||band==='cream-red'?'oxide':null;if(!lo)return;
 W((x0+x1)/2,0,z,ry||0,()=>{box('paint',0,.05,.02,x1-x0,.95,.02,tgCol(lo,C));if(band!=='red')box('paint',0,1,.02,x1-x0,.12,.02,tgCol('cream',C));});}
/* rubble and dust at the foot of a room's walls (worn and abandoned) */
function tgRubble(x0,x1,z0,z1,C,n,salt){if(!C.worn)return;n=(C.aband?2:1)*(n==null?6:n);const col=tgCol('dust',C);
 for(let i=0;i<n;i++){const a=tgU(C,(salt|0)+i*3),b=tgU(C,(salt|0)+i*3+1),s=.12+.3*tgU(C,(salt|0)+i*3+2),side=i%4;
  const x=side<2?x0+(x1-x0)*a:(side===2?x0+.25:x1-.25),z=side<2?(side?z1-.25:z0+.25):z0+(z1-z0)*b;box('stone',x,0,z,s*1.4,s*.6,s,col,a*3);}}
