// prefix: sa
// ================================================================= THE ANIMALS: camels, horses and lizards to ride, the herds
// THE ANIMALS ARE THE FAUNA KIT'S (kits/fauna: KratorFauna, 39-fauna-bundle.js): the staghorn beetle the Ash Nomads ride
// (as the Zeijani of Dhelv do), the draught millipede they herd for its chitin and its grubs (the 'ash herd' variant), and
// the ash runner, the pig-sized six-legged runner kept for hides, eggs and meat. No carts: what the Scyvoi load on a cart
// goes on a beetle's back or on a millipede's. This fragment places them as defs of class `life` with a life record
// (SV_LIFE: faction Ash Nomads, a band as sub-faction, a job, the fauna kit's data) and draws the TACK from the fauna kit's
// anchors: a high-backed chitin saddle, war plates and a lance, pack frames. (The machinery is the Scyvoi kit's.)
// Frame: origin on the ground under the belly, +z the head. o: v (the fauna variant), activity, band, mode.
const SA_LIST=[];
function saReset(){SA_LIST.length=0;}
function saCapture(fn){const keepG=GTARGET,keepCM=CM,keepStack=CMS.slice(),keepSB=SB;const own={};GTARGET=own;SB=null;resetCM();
 const box={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]};SB=box;
 try{fn();}finally{GTARGET=keepG;SB=keepSB;CMS.length=0;for(const m of keepStack)CMS.push(m);CM=keepCM;}
 if(SB&&box.mn[0]<1e8){const v=new THREE.Vector3();for(let i=0;i<8;i++){v.set(i&1?box.mx[0]:box.mn[0],i&2?box.mx[1]:box.mn[1],i&4?box.mx[2]:box.mn[2]).applyMatrix4(CM);for(let k=0;k<3;k++){SB.mn[k]=Math.min(SB.mn[k],v.getComponent(k));SB.mx[k]=Math.max(SB.mx[k],v.getComponent(k));}}}
 return own;}
function saFauna(key,opt,mode){const g=KratorFauna.build(key,opt);const box=new THREE.Box3().setFromObject(g);
 if(SB&&isFinite(box.min.x)){const v=new THREE.Vector3();for(let i=0;i<8;i++){v.set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).applyMatrix4(CM);
  for(let k=0;k<3;k++){SB.mn[k]=Math.min(SB.mn[k],v.getComponent(k));SB.mx[k]=Math.max(SB.mx[k],v.getComponent(k));}}}
 GSTAT.tris+=g.userData.tris;const e={g,world:CM.clone(),mode:mode||'idle',phase:(SA_LIST.length*1.37)%TAU,tack:null};SA_LIST.push(e);return e;}
function saLife(key,o){const L=KratorFauna.lifeOf(key);return svLife(CURREC,{job:o.job,activity:o.activity,band:o.band,extra:{diet:L.diet,feeding:L.feeding,
 activityPattern:L.activity,temperament:L.temperament,fleeDistance:L.fleeDistance,aggression:L.aggression,traits:L.traits,yields:L.yields,life:L.life,
 schedule:L.schedule}});}
/* ---------------------------------------------------------------- tack, fitted to the fauna kit's anchors */
/* a cloth over the back round a point: len along the spine, drop down each flank (hw the half-width there) */
function saDrape(mk,at,hw,len,drop,col,o){o=o||{};const a1=Math.min(1.45,drop/hw);
 psurf(mk,(u,v)=>{const a=(u-.5)*2*a1,z=at[2]+(v-.5)*len;return [Math.sin(a)*hw*1.04,at[1]-(1-Math.cos(a))*hw*(o.flat||1.05)+.02,z];},10,4,col,o.colf?{colf:o.colf}:undefined);}
const SA_CLOTH=(u,v)=>{const t=Math.abs(u-.5)*2;return akC(t>.85?AK_Y:t>.7?AK_P:AK_K);};
/* the beetle saddle: a saddle cloth banded red and yellow, a seat of hide on a chitin frame with a high carapace back */
function saBeetle(an,hw,war){const s=an.saddle;saDrape('felt',s,hw,1.0,.6,WHITE,{colf:SA_CLOTH,flat:.6});
 box('hide',0,s[1]+.07,s[2],.46,.1,.62,0x4a3020);
 WX(0,s[1]+.12,s[2]-.32,0,-.25,0,()=>{ellip('chitin',0,.32,0,.3,.36,.06,P('chitinA'),0,12);cord('plain',[[-.28,.12,.05],[0,.68,.05],[.28,.12,.05]],.02,akC(AK_Y));});
 ellip('chitin',0,s[1]+.2,s[2]+.3,.12,.1,.08,P('chitin'),0,8);   /* the pommel, a carved knob of chitin */
 for(const k of [-1,1]){cord('hide',[[k*hw*.8,s[1],s[2]],[k*(hw+.15),s[1]-.62,s[2]+.05]],.014,0x3a2010);ring('iron',k*(hw+.15),s[1]-.68,s[2]+.05,.06,.012,0x2e2a26,PI/2,0,PI/2,10);}
 if(war){for(const k of [-1,1])for(let i=0;i<3;i++)WX(k*(hw+.06),s[1]-.25-i*.05,s[2]-.5+i*.5,0,0,k*.35,()=>ellip('chitin',0,0,0,.05,.32,.28,P('chitinG'),0,8));   /* war plates on the flanks */
  beam('wood',[hw*.8,s[1]-.3,s[2]-.3],[hw,s[1]+3.0,s[2]+.6],.025,P('woodD'),true,6);cone('chitin',hw,s[1]+3.0,s[2]+.6,.05,.4,0x3a2a1a,6);
  withCloth(clothFlag(.9,.25),()=>W(hw*.98,s[1]+2.6,s[2]+.5,PI/2,()=>psurf('flag',(u,v)=>[u*.9,-v*(.3-u*.2),0],5,2,P('blue'))));}}
/* pack frames along a back: a chitin frame at each point, bundles slung each side, a rolled black tent across the top */
function saPackFrames(pts,hw){for(const p of pts){const y=p[1];beam('chitin',[-hw-.15,y,p[2]],[hw+.15,y,p[2]],.05,P('chitin'),true,6);
  for(const k of [-1,1]){pole('chitin',[k*(hw+.12),y,p[2]],[k*(hw+.2),y-.55,p[2]],.03,P('chitin'),5);ellip('rug',k*(hw+.32),y-.35,p[2],.2,.3,.32,k<0?P('blue'):P('ochre'),0,8);}
  W(0,y+.2,p[2],0,()=>{beam('ashCloth',[-hw-.25,0,0],[hw+.25,0,0],.2,P('ash'),true,12);for(const x of [-.3,.3])ring('rope',x,0,0,.21,.015,0x9a8a6a,0,0,PI/2,12);});}}
function saBridle(an,hr){const b=an.bridle;if(!b)return;const r_=[];for(let i=0;i<=14;i++){const a=i/14*TAU;r_.push([Math.sin(a)*hr,b[1]+Math.cos(a)*hr*1.1,b[2]]);}cord('hide',r_,.016,0x3a2010);
 if(an.saddle)sagRope('hide',[0,b[1]+hr,b[2]],[0,an.saddle[1]+.25,an.saddle[2]+.32],.15,.012,0x3a2010,6);}
/* ---------------------------------------------------------------- the defs */
function saMount(key,name,seed,fauna,breed,tack,o){const E=KratorFauna.entry(fauna),sc=breed&&E.breeds?E.breeds[breed].scale:1,V=o.v===undefined?null:o.v;
 const dims=(V!==null&&E.variantDims)?E.variantDims[V]:E;
 return defBuilding({key,name,seed,cls:'life',kind:fauna,w:dims.w*sc+(tack==='pack'?1.2:.8),d:dims.d*sc+.4,h:dims.h*sc+(tack==='war'?2.0:1.0),budget:70000,front:{x:0,z:dims.d*sc/2,yaw:0},
 tags:{role:o.role},note:o.note,frag:'kits/fauna (body), kits/ash-nomads (tack)',
 build(p){const e=saFauna(fauna,{variant:V!==null?V:(p.v|0),breed,pose:'stand',seed:seed+(p.v|0)},p.mode||'idle');const an=e.g.userData.anchors||{};
  e.tack=saCapture(()=>{if(tack==='riding'||tack==='war'){saBeetle(an,o.hw,tack==='war');saBridle(an,o.bridle||.2);}
   else if(tack==='pack'&&fauna==='staghorn-beetle'){saPackFrames([[0,an.saddle[1]+.05,an.saddle[2]+.1],[0,(an.pack||an.saddle)[1]+.05,(an.pack||an.saddle)[2]-.2]],o.hw);saBridle(an,o.bridle||.2);}
   else if(tack==='pack'){const L=dims.d*sc;saPackFrames([-.3,-.1,.1,.3].map(t=>[0,dims.h*sc*.98,t*L]),o.hw);}});
  saLife(fauna,{job:o.job,activity:p.activity||'IDLE',band:p.band});}});}
saMount('beetle-riding','Riding beetle',5601,'staghorn-beetle','riding','riding',{hw:.62,role:'riding mount',job:'mount',note:'a staghorn beetle under a high-backed chitin saddle and a cloth banded red and yellow'});
saMount('beetle-war','War beetle',5602,'staghorn-beetle','war','war',{hw:.74,bridle:.24,role:'war mount',job:'war mount',note:'the war breed, bigger in the mandibles: chitin plates on its flanks, a lance with a red pennant'});
saMount('beetle-pack','Pack beetle',5603,'staghorn-beetle','riding','pack',{hw:.62,role:'pack',job:'pack',note:'a beetle under pack frames: rolled black tents, bales, jars (the Ash Nomads use no carts)'});
saMount('millipede-pack','Pack millipede',5604,'draught-millipede',null,'pack',{v:2,hw:.75,role:'pack',job:'pack',note:"an ash-herd millipede carrying a band's tents on a row of chitin frames: the Ash Nomads' answer to the Scyvoi ger cart"});
/* ---- the herds (kits/fauna): the millipedes (chitin, grubs), the ash runners (hides, eggs, meat) */
function saHerd(key,name,seed,fauna,o){const E=KratorFauna.entry(fauna),D=(o.v!==undefined&&E.variantDims)?E.variantDims[o.v]:E;
 return defBuilding({key,name,seed,cls:'life',kind:fauna,w:D.w+.3,d:D.d+.3,h:D.h+.3,budget:20000,front:{x:0,z:D.d/2,yaw:0},tags:{role:'herd'},note:o.note,frag:'kits/fauna',
  build(p){saFauna(fauna,{variant:o.v!==undefined?o.v:(p.v|0),seed:seed+(p.seed|0)},p.mode||o.mode||'graze');saLife(fauna,{job:'herd',activity:p.activity||'GRAZE',band:p.band||"the band's herd"});}});}
saHerd('millipede','Herd millipede',5610,'draught-millipede',{v:2,mode:'walk',note:'an ash-herd millipede: its cast rings are the chitin, its brood the grubs'});
saHerd('runner','Ash runner',5611,'ash-runner',{note:'the six-legged runner: hides, eggs and meat'});
saHerd('runner-young','Ash runner (young)',5612,'ash-runner',{v:3,note:'a young runner'});
function saFlush(parent){for(const e of SA_LIST){const g=e.g;g.matrixAutoUpdate=false;g.matrix.copy(e.world);parent.add(g);
 if(e.tack){const T=new THREE.Group();g.add(T);flushBuckets(e.tack,T,true);}}}
FRAME_HOOKS.push(()=>{const t=ANIMU.uTime.value;for(const e of SA_LIST)KratorFauna.animate(e.g,t,e.mode,{phase:e.phase});});
