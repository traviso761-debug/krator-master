// prefix: yt
// ================================================================= INSIDE: the rich part (PLAN.md section 5, Y5)
// Austere outside, rich inside. The kit's own drawing of what the catalog does not carry, and the two rules that dress a room:
//   ytFigureParams(seed, o)  a carved figure's form and proportions, a pure function of its seed (core/rand): the dancing
//                            bear, mother and child, the drum dancer, the transformation figure, the owl, the seal; in
//                            soapstone, antler or larch (o.form, o.mk override). [G data]: numbers only
//   ytFigure(x, y, z, ry, h, o)  the figure generator: a figure h tall standing at (x, y, z) facing ry, seeded by where it
//                            stands in the world (never by how many came before), on a plinth when o.plinth; each is noted on
//                            its building's record (rec.figures: form, material, seed), so no two halls carry the same pieces
//   YT_LOOT_N, ytLootN(tier) the war-loot rule (the owner, 2026-10-25): how many trophies a household of that tier shows:
//                            none in the poor house, a few in the common, a wall of them in the rich and the State's halls
//   ytLoot(slots, tier)      the raids' takings at a building's offered places, the first ytLootN(tier) of them: the State's
//                            closed-eyed metal faces and masks (kits/eternian's head generator, 42-et-head.js, READ IN PLACE
//                            by build.py: never copied), porcelain and celadon, silk over the hide lining, bronze tracery pried
//                            from a gate, and the catalog's Eternian pieces (lacquer chests, alabaster lamps, a visor case),
//                            so they stay Eternian pieces in a Khaayken room; noted on the record (rec.loot)
//   ytWallAt(D, a, y, w, d)  a piece w wide and d deep backed onto a dome room's inner face at angle a and height y: [x, z, ry]
//   ytGoods(D, o)            a dome house's goods by its tier, from the khaayken catalog culture file (the platform's bag or
//                            chest, the tea board, the soapstone pot, the drying rack over the lamp) and the generic goods
// A slot is [kind, x, y, z, ry, size]: kind 'wall' (a mask, a tracery panel or silk on the wall), 'shelf' (a head on a stand,
// porcelain), 'floor' (a catalog piece), or a loot kind itself ('head', 'mask', 'porcelain', 'silk', 'tracery', or a catalog key).
// Where the page lacks the head generator (biomes/nwouterwall's yeti_bundle.py takes the buildings without it) a face is skipped,
// and FURNISH is that bundle's no-op: the shells are the same.
const YT_LOOT_N={poor:0,middle:2,common:2,rich:6,state:9};
function ytLootN(tier){return YT_LOOT_N[tier]==null?0:YT_LOOT_N[tier];}
const YT_BRONZE=[0x8a6a3a,0x7a5e34,0x9a7a44],YT_GILT=0xc8a040,YT_SILVERED=0xb8bcc0;
const YT_SILK=[0x8a2430,0x2e6a62,0xb08a2e,0x3a3a78],YT_PORCELAIN=[0xf2f2ec,0xb8d4c2,0x9ec4b2,0xe8e4d8,0x3c5a8a];
const YT_FIG_FORMS=['bear','mother','drummer','transform','owl','seal'],YT_FIG_MKS=['soap','soap','antler','carved'];
const ytV3=new THREE.Vector3();
/* a seed from the world position of a local point: the same piece in the same place, whatever was drawn before it */
function ytSeedAt(x,y,z,salt){ytV3.set(x,y,z).applyMatrix4(CM);return KRAND.hash(0x7e71^(salt|0),Math.round(ytV3.x*20),Math.round(ytV3.y*20),Math.round(ytV3.z*20));}
function ytU(seed,k){return KRAND.unit(KRAND.hash(seed>>>0,0x5a17,k));}
function ytNote(k,v){if(CURREC&&!PLACE_DRY)(CURREC[k]=CURREC[k]||[]).push(v);}
/* a generator's triangle list ({pos, uv}, 42-et-head.js) into the current frame: scaled by s ([w, h, d]), turned ry, at (x, y, z) */
function ytEmitGeo(mk,G,x,y,z,s,ry,col){const n=G.pos.length/3,nor=new Array(G.pos.length),idx=new Array(n);
 for(let i=0;i<n;i+=3){const a=i*3,ux=G.pos[a+3]-G.pos[a],uy=G.pos[a+4]-G.pos[a+1],uz=G.pos[a+5]-G.pos[a+2],vx=G.pos[a+6]-G.pos[a],vy=G.pos[a+7]-G.pos[a+1],vz=G.pos[a+8]-G.pos[a+2];
  let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
  for(let k=0;k<3;k++){nor[a+k*3]=nx;nor[a+k*3+1]=ny;nor[a+k*3+2]=nz;idx[i+k]=i+k;}}
 const m=TF(x,y,z,ry||0);m.scale(new THREE.Vector3(s[0],s[1],s[2]));emit(mk,mkGeo(G.pos.slice(),nor,G.uv.slice(),idx),m,col);}
/* a dome room's inner face: the lining (a pycrete dome) or the stone (a stone dome) */
function ytInner(D){return D.stone?[D.Ri,D.Hi]:[D.Rr,D.Hl];}
function ytWallAt(D,a,y,w,d,off){const [R,H]=ytInner(D),m=Math.min(R,ytCatR(R,H,y))-(off==null?.06:off),r=Math.sqrt(Math.max(.01,m*m-w*w/4))-d/2;
 return [Math.cos(a)*r,Math.sin(a)*r,Math.atan2(-Math.cos(a),-Math.sin(a))];}

/* ---------------------------------------------------------------- the figure generator */
function ytFigureParams(seed,o){o=o||{};const u=k=>ytU(seed,k);
 return {form:o.form||YT_FIG_FORMS[Math.floor(u(1)*YT_FIG_FORMS.length)%YT_FIG_FORMS.length],mk:o.mk||YT_FIG_MKS[Math.floor(u(2)*YT_FIG_MKS.length)%YT_FIG_MKS.length],
  squat:u(3),lean:(u(4)-.5)*.3,head:.85+u(5)*.3,arms:u(6),turn:(u(7)-.5)*.5,seed:seed>>>0};}
const YT_FIG_COL={soap:'ice',antler:'ice',carved:'larch'};
/* each form in a unit frame: its foot at the origin, 1 tall, facing +z */
function ytFigForm(p){const mk=p.mk,c=()=>P(YT_FIG_COL[mk]||'ice'),sq=1+p.squat*.35,hd=p.head;
 if(p.form==='bear'){   /* the dancing bear: up on its hind legs, forepaws raised */
  for(const s of [-1,1])ellip(mk,s*.09*sq,.13,0,.07*sq,.13,.08,c());
  WX(0,0,0,0,p.lean-.08,0,()=>{ellip(mk,0,.47,0,.17*sq,.27,.15*sq,c());sph(mk,0,.8,.02,.1*hd,c());ellip(mk,0,.78,.1*hd,.05,.045,.07,c());
   for(const s of [-1,1]){pole(mk,[s*.13*sq,.62,.02],[s*(.24+p.arms*.08),.86+p.arms*.06,.06],.045,c());sph(mk,s*.06*hd,.88,.0,.03,c());}});return;}
 if(p.form==='mother'){   /* mother and child: the parka's hood holding the child at her back */
  cyl(mk,0,0,0,.2*sq,.66,c(),14,.13*sq);sph(mk,0,.76,.0,.11*hd,c());ellip(mk,0,.76,-.03,.15*hd,.15*hd,.13*hd,c());
  sph(mk,0,.82,-.15,.065*hd,c());for(const s of [-1,1])pole(mk,[s*.15*sq,.55,.02],[s*.05,.4,.13],.045,c());return;}
 if(p.form==='drummer'){   /* the drum dancer: the frame drum raised in one hand, the beater in the other */
  cyl(mk,0,0,0,.15*sq,.64,c(),12,.1*sq);sph(mk,0,.74,0,.1*hd,c());
  pole(mk,[.11*sq,.58,0],[.24,.78+p.arms*.06,.06],.04,c());ring(mk,.3,.86+p.arms*.06,.08,.14,.016,c(),0,PI/2-.3);
  cyl(mk,.3,.86+p.arms*.06,.08,.13,.008,P('hide'),14);pole(mk,[-.11*sq,.58,0],[-.2,.7,.12],.035,c());return;}
 if(p.form==='transform'){   /* the transformation figure: half man, half raven, wings for arms */
  ellip(mk,0,.4,0,.15*sq,.38,.13,c());sph(mk,0,.82,0,.11*hd,c());cone(mk,.0,.8,.1*hd,.035,.12,c(),6);
  for(const s of [-1,1])WX(s*.15*sq,.5,0,0,0,s*(.5+p.arms*.4),()=>ellip(mk,0,.12,0,.05,.2,.11,c()));return;}
 if(p.form==='owl'){   /* the snowy owl: an egg of stone, the eyes ringed */
  ellip(mk,0,.42,0,.24*sq,.42,.22*sq,c());for(const s of [-1,1]){ring(mk,s*.08,.66,.18*sq,.055,.012,c());cone(mk,s*.1,.8,0,.04,.12,c(),5);}
  cone(mk,0,.58,.2*sq,.025,.06,c(),5);return;}
 /* the seal: lying, its head raised */
 ellip(mk,0,.22,0,.18*sq,.2,.42,c());ellip(mk,0,.45,.3,.12*hd,.13*hd,.14*hd,c());for(const s of [-1,1])ellip(mk,s*.18*sq,.08,.12,.1,.03,.06,c(),s*.5);}
/* a figure h tall at (x, y, z) facing ry; o.plinth (its height), o.form, o.mk, o.seed */
function ytFigure(x,y,z,ry,h,o){o=o||{};const seed=o.seed==null?ytSeedAt(x,y,z,7):o.seed,p=ytFigureParams(seed,o),ph=o.plinth||0;
 if(ph)box('slab',x,y,z,h*.6,ph,h*.6,P('slab'),ry);
 const m=TF(x,y+ph,z,(ry||0)+p.turn);m.scale(new THREE.Vector3(h,h,h));pushM(m);try{ytFigForm(p);}finally{popM();}
 ytNote('figures',{form:p.form,mk:p.mk,seed:p.seed});return p;}

/* ---------------------------------------------------------------- the war loot */
const ytHasHeads=()=>typeof etHeadGeo==='function'&&typeof etHeadParams==='function';
/* a State face h tall on a larch stand at (x, y, z) facing ry: bronze, gilt or silvered (the rank it held), eyes closed */
function ytLootHead(x,y,z,ry,h,seed){if(!ytHasHeads())return false;const u=ytU(seed,11),col=u<.6?jc(YT_BRONZE[Math.floor(u*5)%3],.04):u<.85?jc(YT_GILT,.03):jc(YT_SILVERED,.03);
 W(x,y,z,ry,()=>{box('larch',0,0,0,h*.55,.06,h*.55,P('larch'));cyl('larch',0,.06,0,.035,h*.25,P('larch'),8);
  ytEmitGeo('brass',etHeadGeo(etHeadParams(seed,{eyes:'closed'})),0,.06+h*.25+h*.16,0,[h*.92,h,h*.92],0,col);});return true;}
/* a mask s tall hung on the wall at (x, y, z) facing ry (its centre at y), on a thong from a peg */
function ytLootMask(x,y,z,ry,s,seed){if(!ytHasHeads())return false;const u=ytU(seed,12),col=u<.7?jc(YT_BRONZE[Math.floor(u*7)%3],.04):jc(YT_GILT,.03);
 W(x,y,z,ry,()=>{ytEmitGeo('brass',etHeadGeo(etHeadParams(seed,{mask:true,eyes:'closed'})),0,-s/2,0,[s*.92,s,s*.6],0,col);
  pole('hide',[0,s*.5,-.01],[0,s*.62,-.03],.006,P('hide'));});return true;}
/* porcelain and celadon: two or three pieces standing at (x, y, z) */
function ytLootPorcelain(x,y,z,ry,seed){W(x,y,z,ry,()=>{const n=2+(ytU(seed,13)*2|0);for(let i=0;i<n;i++){const u=ytU(seed,20+i),h=.16+u*.2,r=.05+ytU(seed,30+i)*.05,dx=(i-(n-1)/2)*.17;
  lathe('bone',dx,0,[[.001,0],[r*.7,0],[r,h*.3],[r*.95,h*.6],[r*.4,h*.85],[r*.45,h],[.001,h]],12,jc(YT_PORCELAIN[Math.floor(u*5)%5],.02));}});}
/* a silk panel w x h hung from a pole, its centre top at (x, y, z) facing ry */
function ytLootSilk(x,y,z,ry,w,h,seed){const col=jc(YT_SILK[Math.floor(ytU(seed,14)*4)%4],.03);
 W(x,y,z,ry,()=>{box('plain',0,-h,0,w,h,.012,col);box('plain',0,-h,.008,w*.92,.06,.006,jc(YT_GILT,.02));pole('larch',[-w/2-.05,.02,0],[w/2+.05,.02,0],.018,P('larch'));});}
/* a bronze tracery panel pried from a gate, w x h, its foot at (x, y, z), leant on the wall facing ry */
function ytLootTracery(x,y,z,ry,w,h,seed){const col=jc(YT_BRONZE[Math.floor(ytU(seed,15)*3)%3],.04);
 W(x,y,z,ry,()=>{for(const s of [-1,1])box('brass',s*(w/2-.03),0,0,.06,h,.05,col);box('brass',0,0,0,w,.06,.05,col);box('brass',0,h-.06,0,w,.06,.05,col);
  const n=3+(ytU(seed,16)*2|0);for(let i=1;i<n;i++){const t=i/n;box('brass',-w/2+t*w,.06,0,.025,h-.12,.03,col);box('brass',0,.06+t*(h-.12),0,w-.08,.025,.03,col);}
  ring('brass',0,h/2,.03,Math.min(w,h)*.22,.018,col);});}
const YT_LOOT_CAT=['eternian_common_chest','eternian_court_alabaster_lamp','eternian_court_visor_case'];
/* the rule: the first ytLootN(tier) of the offered slots, each a trophy (see the header) */
function ytLoot(slots,tier){const n=Math.min(slots.length,ytLootN(tier));let shown=0;
 for(let i=0;i<n;i++){const [k,x,y,z,ry,s]=slots[i],seed=ytSeedAt(x,y,z,9+i);let kind=k;
  if(k==='wall')kind=['mask','mask','tracery','silk'][Math.floor(ytU(seed,1)*4)%4];
  else if(k==='shelf')kind=ytU(seed,2)<.6?'head':'porcelain';
  else if(k==='floor')kind=YT_LOOT_CAT[Math.floor(ytU(seed,3)*YT_LOOT_CAT.length)%YT_LOOT_CAT.length];
  let ok=true;
  if(kind==='head')ok=ytLootHead(x,y,z,ry,s||.42,seed);
  else if(kind==='mask')ok=ytLootMask(x,y,z,ry,s||.34,seed);
  else if(kind==='porcelain')ytLootPorcelain(x,y,z,ry,seed);
  else if(kind==='silk')ytLootSilk(x,y+(s||.9)/2,z,ry,(s||.9)*.7,s||.9,seed);
  else if(kind==='tracery')ytLootTracery(x,y-(s||.8)/2,z,ry,(s||.8)*.8,s||.8,seed);
  else ok=!!FURNISH(kind,x,y,z,ry);
  if(ok){shown++;ytNote('loot',{kind,from:'eternian',seed:seed>>>0});}}
 if(CURREC&&!PLACE_DRY)CURREC.lootRule={tier,offered:slots.length,share:ytLootN(tier),shown};
 return shown;}
/* one wall slot: a kind, its centre at angle a and height y on the room's inner face, s its size */
function ytWallSlot(D,kind,a,y,s,off){const [x,z,ry]=ytWallAt(D,a,y,(s||.4)*.8,.06,off==null?.12:off);return [kind,x,y,z,ry,s];}
/* wall slots round a dome room: n of them from angle a0 to a1 at height y */
function ytWallSlots(D,a0,a1,n,y,kind){const out=[];for(let i=0;i<n;i++){const a=a0+(a1-a0)*(i+.5)/n,[x,z,ry]=ytWallAt(D,a,y,.3,.06,.1);out.push([kind||'wall',x,y,z,ry]);}return out;}

/* ---------------------------------------------------------------- a dome house's goods, by its tier */
function ytGoods(D,o){const yP=D.yPlat+.07,s=D.Rr/2.645,w=CURREC&&CURREC.tags&&CURREC.tags.wealth||'poor',poor=w==='poor',rich=w==='rich';
 FURNISH(poor?'khaayken_poor_hide_bag':'khaayken_common_chest',-1.5*s,yP,-1.4*s,.7);
 if(poor)FURNISH('generic_tea_set',.2*s,yP,-.6*s,0);
 else if(!rich){FURNISH('khaayken_common_tea_board',.2*s,yP,-.55*s,0);FURNISH('generic_tea_set',.2*s,yP+(typeof svfH==='function'?svfH('khaayken_common_tea_board',0,.42):.42),-.55*s,0);}
 FURNISH('generic_lamp_oil',1.3*s,yP,-.5*s,-.4);
 FURNISH(poor?'khaayken_poor_hide_bucket':'khaayken_common_pot',1.2*s,D.yFl,1.2*s,-1.2);
 if(!o.small){FURNISH('generic_floor_basket',-1.4*s,D.yFl,1.1*s,1.1);FURNISH('generic_fuel',-.6*s,D.yFl,1.9*s,2.4);
  if(!D.stone)FURNISH('khaayken_poor_drying_rack',.75,yP,D.zPlat-.62,0);}   /* over the lamp at the platform's edge */
 /* the loot rule: a common house shows a mask over the platform and porcelain on it (a rich house, a hall: its builder offers
    its own wall of places: 52-yt-rich.js, 60-yt-state.js) */
 if(!rich)ytLoot([['mask',...(()=>{const a=-PI/2-.55,[x,z,ry]=ytWallAt(D,a,yP+1.25,.3,.06,.12);return [x,yP+1.25,z,ry,.3];})()],['porcelain',-.35*s,yP,-1.55*s,.3]],w);}
