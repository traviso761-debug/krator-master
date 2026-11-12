// ================================================================= QIBLAI — registry + helpers (prefix qn)
// Qiblai, the holy city of the Decree on the sacred river Ālph (kits/qiblai/PLAN.md): Tibetan cubes with gilt crowns, a
// blockier Xanadu. The kit is written on the Xanadu kit's contract (PLAN.md section 6): QB.def is XA.def (VERN.def under it)
// with culture and kit 'qiblai', so VERN.place, xnSub, the inspector and every placer that takes the Xanadu kit place these
// too, and a mixed street is one list of keys. Builders take the xn* helpers (kits/xanadu/src/72-xa-helpers.js) and the
// qn* ones below. Local frame as Xanadu's: origin at the plot centre on the ground, +z the FRONT, y up, metres.
// Seed block 33000-33999 (the Xanadu kit uses up to 32951): houses 33100, trades 33300, sacred 33500, the Temple Mountain
// and the walls 33700, the streets 33900.
//
// The style in one line (PLAN.md section 4): every volume a box with a light batter (2-4 %, crisp corners: qnCube), flat
// parapet roofs stacked in terraces (qnRoof, qnTerraces), black trapezoid windows in strict rows and columns (qnWins), the
// ornament in bands, and gilt crowns (qnCrown: a gilt pavilion, victory banners, the wheel and deer) only on the holy
// buildings, the gate towers and the kora's chortens. The colour shows the ring (QRING).
const QB={
 def(D){D.tags=Object.assign({culture:'qiblai',kit:'qiblai'},D.tags||{});D.nv=(D.nv==null?3:D.nv);XA.def(D);D.kit='qiblai';return D;},
 keys(){return VERN.order.filter(k=>VERN.defs[k].kit==='qiblai');},
 // families in definition order: [{family, keys:[…]}], as XA.families()
 families(){const out=[],idx={};for(const k of QB.keys()){const f=VERN.defs[k].family;if(idx[f]===undefined){idx[f]=out.length;out.push({family:f,keys:[]});}out[idx[f]].keys.push(k);}return out;},
};
// tags by group (the Xanadu kit's shapes: type list, wealth, lit; electric light on rich and civic only)
const QTAG=(wealth,types,extra)=>Object.assign({type:types||['single-family dwelling'],wealth,lit:wealth==='rich'||wealth==='civic'},extra||{});

// ---------------------------------------------------------------- the ring colours (PLAN.md section 4)
// lay: white wash; clergy: red (redwall, maroon band); kora: white with saffron trim and turquoise tile; temple: white and
// gold. A builder takes its ring's set with qnRingC(ring): {wall, trim, band, cap} as colours.
const QRING={
 lay:{wall:XPAL.wash,trim:[XPAL.blue,XPAL.red,XPAL.turquoise,XPAL.green],band:null},
 clergy:{wall:XPAL.redwall,trim:[XPAL.saffron,XPAL.white],band:XPAL.maroon},
 kora:{wall:XPAL.wash,trim:[XPAL.saffron],band:XPAL.maroon},
 temple:{wall:XPAL.wash,trim:[XPAL.saffron,XPAL.red],band:XPAL.maroon},
};
// The eight great monasteries, one a spoke of the wheel, each with its own colour that sets its tone (the owner, 2026-11-11):
// the wash of its walls, its trim and its twig band; the abbot's throne in the Hall of the Decree wears it too. Their names
// are still to come (PLAN.md section 9); until then each is called by its colour. Earth-pigment tints over the textured wash.
const QSPOKE=[
 {name:'Crimson',wall:0xa8302a,trim:XPAL.saffron,band:0x5a1c1c},
 {name:'Saffron',wall:0xd8862a,trim:XPAL.white,band:0x7a3a1a},
 {name:'Gold',wall:0xd4b040,trim:XPAL.red,band:0x6e4a1a},
 {name:'Green',wall:0x3f7a44,trim:XPAL.saffron,band:0x1f3f24},
 {name:'Turquoise',wall:0x2a9a94,trim:XPAL.white,band:0x1a4a48},
 {name:'Blue',wall:0x2a4a9a,trim:XPAL.gold[0],band:0x1a2a5a},
 {name:'Violet',wall:0x6a3a8a,trim:XPAL.saffron,band:0x3a1a4a},
 {name:'White',wall:0xeee8dc,trim:XPAL.red,band:0x6e2a2a},
];
function qnRingC(ring){const R=QRING[ring]||QRING.lay;return{wall:xC(xPick(R.wall)),trim:xC(xPick(R.trim)),band:R.band?xC(xPick(R.band)):null};}
const QSTONE=[0xc8c0b0,0xbcb4a4,0xd0c8b8];   // the dressed plinth and terrace stone: a shade lighter than XPAL.stone

// ---------------------------------------------------------------- kit items: the crisp cube
// The Tibetan batter made lighter: a block whose top is 98 % of its base (the Xanadu kit's lightest is 96 %).
const QBAT98=vnWedgeGeo(.98,.98);
kdef('qCubeW98',QBAT98,MAT.xWash);kdef('qCubeD98',QBAT98,MAT.stone);kdef('qCubeE98',QBAT98,MAT.xEarth);kdef('qCubeS98',QBAT98,MAT.xRubble);

// ---------------------------------------------------------------- the cube, the stack
// A crisp cube: a box with a light batter (98 % at the top, or the kit's 96 % when the block is tall for its width, as a
// 2-4 % batter wants). kind: wash | dressed | earth | stone. Returns the top's fraction k.
function qnBatK(w,h,d){return 1-2*h*.025/Math.min(w,d)>.97?.98:.96;}
// ('ashlar': the dressed ashlar of the kit's own pack, src/89q0z-qb-matlib.js)
function qnCube(x,y,z,w,h,d,ry,c,kind){const k=qnBatK(w,h,d),L={wash:'W',dressed:'D',earth:'E',stone:'S',ashlar:'A'}[kind||'wash'];
 kput(L==='A'?'qCubeA'+(k===.98?'98':'96'):(k===.98?'qCube':'xBat')+L+(k===.98?'98':'96'),[x,y,z],ry?qEuler(0,ry,0):null,[w,h,d],c||null);return k;}
// storeys stacked with the batter carried through, a crisp string course (a thin proud band) at each floor. Returns
// {y: top, w, d: the top's plan, k}.
function qnStack(x,y,z,w,d,ry,hs,c,kind,lineC){let yy=y,ww=w,dd=d,k=.98;
 for(let i=0;i<hs.length;i++){k=qnCube(x,yy,z,ww,hs[i],dd,ry,c,kind);yy+=hs[i];ww*=k;dd*=k;
  if(i<hs.length-1&&lineC!==false)vB('xPaint',x,yy-.07,z,ww+.06,.09,dd+.06,ry,lineC||xC(XPAL.black));}
 return{y:yy,w:ww,d:dd,k};}
// the ends of a row house (VASSAL-KITS.md section 2: row types take o.ends to close a run): o.ends absent or true is a house
// standing alone (both sides finished, windows on them); 'l', 'r' or '' a house in a run (a side not named is a party wall)
function qnEnds(o){const e=o&&o.ends;if(e==null||e===true)return{l:true,r:true};const s=String(e||'');return{l:s.indexOf('l')>=0,r:s.indexOf('r')>=0};}
// a dressed plinth (the batter of a terrace) with its stone cap, proud at the front and back only (row houses' plinths meet
// at the party walls, and two caps overlapping there would fight); returns its top
function qnPlinth(x,z,w,d,h,ry,c){c=c||xC(xPick(QSTONE));qnCube(x,0,z,w,h,d,ry,c,'ashlar');vB('qAshB',x,h-.12,z,w,.12,d+.16,ry,c.clone().multiplyScalar(1.06));return h;}

// ---------------------------------------------------------------- windows in a grid
// Black trapezoid windows (xnTibWin) in STRICT rows and columns on the faces of a stack (PLAN.md section 4: "the grid
// down to the window"). The columns are set by the top storey's plan, so every column runs plumb from the ground storey
// to the roof. (x,z,ry) the stack's frame, w x d its base plan, hs its storeys, k its batter. o: {pitch, ww, wh, sill,
// kind, trim, val, valC, front, back, left, right (false to skip a face: a party wall), skip:[[u0,u1],…] (ground-storey
// gaps on the front, for a door), skipUp (the same on every storey), top (skip the top n storeys), from (skip the lower n),
// val (true: valances on the ground storey; 'all': on every storey)}.
function qnWins(x,y,z,w,d,ry,hs,k,o){o=o||{};const P=(o.pitch==null?2.6:o.pitch),ww=(o.ww==null?.8:o.ww),wh=(o.wh==null?1.1:o.wh),kind=o.kind||(xLit()?'lit':'glass'),trim=o.trim||xC(xPick(XPAL.trim));
 const fN=Math.pow(k,hs.length-1),wt=w*fN,dt=d*fN,nx=Math.max(1,Math.floor(wt/P)),nz=Math.max(1,Math.floor(dt/P));
 const faces=[];
 if(o.front!==false)faces.push([nx,wt,1,0]);if(o.back!==false)faces.push([nx,wt,-1,0]);
 if(o.left!==false)faces.push([nz,dt,0,-1]);if(o.right!==false)faces.push([nz,dt,0,1]);
 let yy=y;const n=hs.length-(o.top|0);
 for(let s=0;s<n;s++){if(s<(o.from|0)){yy+=hs[s];continue;}   // o.from: blank lower storeys (a Tibetan house's ground floor is a store)
  const f=Math.pow(k,s)*(1-(1-k)*.5),sill=yy+(o.sill!=null?o.sill:Math.min(.95,hs[s]*.32)),hh=Math.min(wh,hs[s]-(sill-yy)-.75);
  const opt={noVal:!(o.val==='all'||(o.val&&s===0)),valC:o.valC};
  for(const [cnt,len,fz,fx] of faces){for(let i=0;i<cnt;i++){const u=-len/2+len*(i+.5)/cnt;
   if(fz>0&&((s===0&&(o.skip||[]).some(r=>u>r[0]&&u<r[1]))||(o.skipUp||[]).some(r=>u>r[0]&&u<r[1])))continue;
   const p=fz?loc(x,z,fz*u,fz*(d*f/2-.04),ry):loc(x,z,fx*(w*f/2-.04),fx*u,ry);
   xnTibWin(p[0],sill,p[1],ry+(fz>0?0:fz<0?Math.PI:fx*Math.PI/2),ww,hh,kind,trim,opt);}}
  yy+=hs[s];}}

// ---------------------------------------------------------------- roofs: the parapet, the terraces
// a flat parapet roof on a cube top (xnFlatRoof underneath): o.band a colour (the twig band: monasteries and the kora),
// o.frieze (a colour-carrying frieze strip under the parapet coping, the kora's), o.parapet height (default .75),
// o.corner as xnFlatRoof. Returns the parapet top.
function qnRoof(x,y,z,w,d,ry,c,o){o=o||{};const top=xnFlatRoof(x,y,z,w,d,ry,c,{band:o.band||false,gold:o.gold,eave:o.eave,eaveC:o.eaveC,parapet:o.parapet==null?.75:o.parapet,corner:o.corner});
 if(o.frieze){const ph=o.parapet==null?.75:o.parapet;for(const s of[-1,1]){const p=loc(x,z,0,s*(d/2+.13),ry);xvFr(p[0],top-ph*.62,p[1],w+.3,ph*.4,.04,ry,null);const q=loc(x,z,s*(w/2+.13),0,ry);xvFr(q[0],top-ph*.62,q[1],.04,ph*.4,d+.3,ry,null);}}
 return top;}
// cubes stepped in terraces (the massing's signature): T = [[w,d,h,dz],…] from the bottom up, each set dz toward the back
// (-z) of the frame and stacked on the last one's roof, each with its own parapet roof. Returns [{y,top,w,d,z}] per step.
function qnTerraces(x,y,z,ry,T,c,o){o=o||{};let yy=y;const out=[];
 for(let i=0;i<T.length;i++){const [w,d,h,dz]=T[i];const p=loc(x,z,0,-((dz==null?0:dz)),ry);const k=qnCube(p[0],yy,p[1],w,h,d,ry,c,o.kind);
  const top=qnRoof(p[0],yy+h,p[1],w*k,d*k,ry,c,{band:i===T.length-1?o.band:false,frieze:o.frieze&&i===T.length-1,parapet:o.parapet});
  out.push({y:yy,top,w:w*k,d:d*k,z:-((dz==null?0:dz)),k,h});yy+=h+.3;}
 return out;}

// ---------------------------------------------------------------- the doorway
// the Tibetan door: a black trapezoid surround, a painted frame and leaf (vnDoor: a real, locked door), a timber lintel
// on corbels and a pleated valance; (x,z) on the face, ry outward
function qnDoor(x,y,z,ry,w,h,o){o=o||{};const fr=o.c||xC(XPAL.red),leaf=o.leaf||xC(xPick(XPAL.dark)),blk=xC(XPAL.black),N=xRot(ry,[0,0,1]);
 vnDoor(x,y,z+0,ry,w,h,'xPaint',fr,leaf,o.step);
 for(const s of[-1,1]){const a=xnOn(x,y,z,ry,s*(w/2+.5),.04),b=xnOn(x,y+h+.2,z,ry,s*(w/2+.26),.04);xnMember('xPaint',a,b,.34,.06,N,blk);}
 const lp=loc(x,z,0,.2,ry);vB('vWood',lp[0],y+h+.26,lp[1],w+1.2,.18,.34,ry,xC(xPick(XPAL.timber)));
 xnCorbels(x,y+h+.26,z,ry,w+.6,Math.max(3,Math.round((w+.6)/.45)),xC(xPick(XPAL.timber)),.55);
 if(o.val!==false){const v=loc(x,z,0,.38,ry);kput('xValance',[v[0],y+h,v[1]],qEuler(0,ry,0),[w+1.1,.6,1],o.valC||xC(xPick([XPAL.white,XPAL.saffron,XPAL.red])));}}

// ---------------------------------------------------------------- the faith's signs
// the eight-spoked wheel (PLAN.md section 2a: the Station as it was, whole), upright and facing ry, centre at (x,y,z),
// radius r: a rim of sixteen gilt staves, eight spokes with knobs, a hub
function qnWheel(x,y,z,ry,r,c){c=c||xC(xPick(XPAL.gold));const q0=qEuler(0,ry,0),seg=2*Math.PI*r/16*1.08;
 for(let i=0;i<16;i++){const a=(i+.5)*Math.PI/8,p=loc(x,z,Math.cos(a)*r,0,ry);kput('xGoldB',[p[0],y+Math.sin(a)*r,p[1]],q0.clone().multiply(qEuler(0,0,a+Math.PI/2)),[seg,r*.14,r*.12],c);}
 for(let i=0;i<8;i++){const a=i*Math.PI/4,p=loc(x,z,Math.cos(a)*r*.5,0,ry);kput('xGoldB',[p[0],y+Math.sin(a)*r*.5,p[1]],q0.clone().multiply(qEuler(0,0,a)),[r*.9,r*.07,r*.07],c);
  const e=loc(x,z,Math.cos(a)*r*1.12,0,ry);vBall('xGold',e[0],y+Math.sin(a)*r*1.12,e[1],r*.08,c);}
 const h=loc(x,z,0,.02,ry);kput('xDiscG',[h[0],y,h[1]],q0.clone().multiply(qEuler(Math.PI/2,0,0)),[r*.24,r*.16,r*.24],c);}
// a kneeling deer, gilt, its head toward its local +z (yaw ry), base at y, s its height
function qnDeer(x,y,z,ry,s,c){c=c||xC(xPick(XPAL.gold));const P=(u,v)=>loc(x,z,u*s,v*s,ry),q=qEuler(0,ry,0);
 let p=P(0,0);vB('xGoldB',p[0],y,p[1],.42*s,.3*s,.7*s,ry,c);p=P(0,.3);kput('xGoldB',[p[0],y+.42*s,p[1]],q.clone().multiply(qEuler(-.5,0,0)),[.16*s,.34*s,.16*s],c);
 p=P(0,.4);vB('xGoldB',p[0],y+.56*s,p[1],.17*s,.17*s,.28*s,ry,c);for(const e of[-1,1]){const a=P(e*.09,.34);vB('xGoldB',a[0],y+.68*s,a[1],.04*s,.14*s,.04*s,ry,c);}}
// the wheel and the two deer on a roof's front edge (the holy buildings' crown); (x,y,z) the base centre, ry facing out
function qnWheelDeer(x,y,z,ry,s,c){c=c||xC(xPick(XPAL.gold));vB('xGoldB',x,y,z,1.9*s,.12*s,.5*s,ry,c);
 kput('xDiscG',[x,y+.18*s,z],null,[.34*s,.12*s,.34*s],c);qnWheel(x,y+.82*s,z,ry,.55*s,c);
 for(const e of[-1,1]){const p=loc(x,z,e*.72*s,0,ry);qnDeer(p[0],y+.12*s,p[1],ry-e*Math.PI/2,.62*s,c);}}
// the victory banner (gyaltsen): a black felt drum on a post, gilt rings, a gilt cap and knob; base at y, h tall
function qnBanner(x,y,z,h,c){c=c||xC(xPick(XPAL.gold));vPst('vPost',x,y,z,.05,h*.32,xC(0x3a2c22));
 vPst('xCol',x,y+h*.32,z,.2,h*.46,xC(0x2a2420));for(const t of[0,.5,1])vPst('xColG',x,y+h*(.32+.44*t),z,.23,.07,c);
 kput('xConeG',[x,y+h*.79,z],null,[.26,h*.14,.26],c);vBall('xGold',x,y+h*.95,z,.09,c);}
// the gilt crown on a holy roof: a gilt pavilion roof on a red frame (xnGiltRoof), victory banners at the corners of the
// roof below it, the wheel and deer on its front. (x,y,z) the roof centre at its parapet top, w x d the roof, ry the front.
// o: {pav: [pw,pd] the pavilion's plan (default 0.45 of the roof), banners (default true), deer (default true), dome (a gilt
// dome in place of the pavilion: the Temple Mountain only)}. Returns the crown's top.
function qnCrown(x,y,z,w,d,ry,o){o=o||{};const g=xC(xPick(XPAL.gold));let top=y;
 const pw=(o.pav||[])[0]||Math.min(w*.45,9),pd=(o.pav||[])[1]||Math.min(d*.45,7);
 if(o.dome){top=xnDome(x,y-.3,z,Math.min(pw,pd)*.5,'G',{drum:1.4,drumItem:'xDrumM',fin:1.2});}
 else if(o.pav!==false){top=xnGiltRoof(x,y-.3,z,pw,pd,ry,{frame:(o.frame==null?1.4:o.frame),over:.9});}
 if(o.banners!==false)for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2-.35),sz*(d/2-.35),ry);qnBanner(p[0],y,p[1],2.4,g);}
 if(o.deer!==false){const p=loc(x,z,0,d/2-.6,ry);qnWheelDeer(p[0],y,p[1],ry,(o.deerS==null?1:o.deerS),g);}
 return top;}
// a chorten (the kora's crossing marker, PLAN.md section 5): three stepped white plinths, the bell on a lotus seat, the
// square harmika with its painted eyes band, the thirteen gilt rings of the spire, the umbrella and the knob. s = scale
// (1 = 6.5 m tall). Returns the top.
function qnChorten(x,y,z,s,c){c=c||xC(xPick(XPAL.wash));const g=xC(xPick(XPAL.gold));let yy=y;
 for(const [w,h] of [[4.2,.6],[3.5,.5],[2.9,.45]]){qnCube(x,yy,z,w*s,h*s,w*s,0,c,'wash');yy+=h*s;}
 vB('xBandB',x,yy,z,2.4*s,.22*s,2.4*s,0,xC(xPick(XPAL.maroon)));yy+=.22*s;
 kput('xDrumW',[x,yy,z],null,[1.15*s,.3*s,1.15*s],c);yy+=.3*s;
 kput('xBulbW',[x,yy,z],null,[1.05*s,1.55*s,1.05*s],c);yy+=1.45*s;
 vB('xWashB',x,yy,z,.95*s,.55*s,.95*s,0,c);vB('xPaint',x,yy+.18*s,z,1.0*s,.16*s,1.0*s,0,xC(XPAL.saffron));vB('xGoldB',x,yy+.55*s,z,1.12*s,.1*s,1.12*s,0,g);yy+=.65*s;
 kput('xConeG',[x,yy,z],null,[.42*s,1.9*s,.42*s],g);for(let i=0;i<5;i++)kput('xDiscG',[x,yy+.18*s+i*.32*s,z],null,[(.44-i*.06)*s,.05*s,(.44-i*.06)*s],g);
 yy+=1.9*s;kput('xDiscG',[x,yy-.35*s,z],null,[.36*s,.05*s,.36*s],g);vBall('xGold',x,yy+.06*s,z,.12*s,g);return yy+.18*s;}
// a hand prayer-wheel row along a face (the kora's walls): Xanadu's drum rack (xnXDDrums, kits/xanadu/src/77-xa-sacred.js)
const qnDrums=(x,y,z,ry,w)=>xnXDDrums(x,y,z,ry,w,Math.max(2,Math.round(w/.62)));
// prayer flags strung between two local points
const qnFlags=(a,b,n)=>xnPennants(a,b,n||Math.max(6,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/.7)),[0x2a5aa8,0xf4efe4,0xa8382a,0x2f7a4a,0xe8a030]);
// a paved forecourt or street strip in the dressed stone
const qnPave=(x,z,w,d,ry,y)=>xnPave(x,z,w,d,ry,xC(xPick(QSTONE)),2.4,y);
