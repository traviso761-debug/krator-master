// prefix: sa
// ================================================================= THE ANIMALS: camels, horses and lizards to ride, the herds
// THE ANIMALS ARE THE FAUNA KIT'S (kits/fauna: KratorFauna, 39-fauna-bundle.js): the dromedary, the horse, the sheep, the
// cattle and the goat in the desert; the riding and pack lizards and the marsh emu in the eastern abyss. This fragment
// places them as defs of class `life` with a life record (SV_LIFE: faction Desert Nomads, a clan as sub-faction, a job, and
// the fauna kit's diet, temperament, traits, yields and schedule), and draws the nomads' TACK on them from the fauna kit's
// anchors (saddle, pack, bridle): the shadad camel saddle with its sadu cloth and long tassels, pack bags and a rolled tent,
// an Arab horse saddle, a long lizard saddle. (The machinery is the Scyvoi kit's 56-sa-beasts.js; the tack is this kit's.)
// Frame: origin on the ground under the belly, +z the snout. o: v (the fauna variant), tack, activity, band, mode.
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
/* ---------------------------------------------------------------- tack, fitted to the fauna kit's anchors
   an: the built animal's anchors ({saddle, pack, bridle, lead, chest}: [x,y,z] in its frame); hw the body's half-width there */
const SA_SADU=[0x8e3a24,0x1c1a18,0xe8dcc4,0xb08a3a,0x2c3448];
/* a cloth draped over the back round the saddle point: len along the spine, `drop` down each flank */
function saDrape(mk,at,hw,len,drop,col,o){o=o||{};const a1=Math.min(1.45,drop/hw);
 psurf(mk,(u,v)=>{const a=(u-.5)*2*a1,z=at[2]+(v-.5)*len;return [Math.sin(a)*hw*1.04,at[1]-(1-Math.cos(a))*hw*(o.flat||1.05)+.02,z];},10,4,col);
 if(o.tassels)for(const s of [-1,1]){const pts=[];for(let i=0;i<=8;i++){const z=at[2]+(i/8-.5)*len*.92;pts.push([s*Math.sin(a1)*hw*1.06,at[1]-(1-Math.cos(a1))*hw*(o.flat||1.05)-.01,z]);}
  let k=0;for(const p of pts){const c=SA_SADU[k++%SA_SADU.length];beam('plain',p,[p[0],p[1]-o.tassels*.5,p[2]],.012,c,true,4);cone('plain',p[0],p[1]-o.tassels,p[2],.035,o.tassels*.5,c,6);}}}
function saBridle(an,hr,col){const b=an.bridle;if(!b)return;const ring_=[];for(let i=0;i<=14;i++){const a=i/14*TAU;ring_.push([Math.sin(a)*hr,b[1]+Math.cos(a)*hr*1.1,b[2]]);}cord('hide',ring_,.014,col||0x3a2010);
 if(an.lead)sagRope('rope',[0,b[1]-hr,b[2]+.02],[an.lead[0]*.5,.05,an.lead[2]+.9],.2,.012,0xb89a6a,6);}
/* the shadad: two crossed wooden forks fore and aft of the hump, a sheepskin between, the sadu cloth under it with tassels */
function saShadad(an,hw,war){const s=an.saddle;saDrape(war?'patKilim':'patSadu',s,hw,1.15,.75,null,{tassels:.32});
 for(const dz of [-.36,.36])for(const k of [-1,1])pole('wood',[k*hw*.8,s[1]-.18,s[2]+dz],[-k*hw*.25,s[1]+.42,s[2]+dz+k*.02],.03,P('woodD'),6);
 for(const dz of [-.36,.36])sph('brass',0,s[1]+.4,s[2]+dz,.045,0xb8924a);
 ellip('plain',0,s[1]+.08,s[2],hw*.75,.09,.42,0xe6dcc6,0,10);   // the sheepskin
 const gr=[];for(let i=0;i<=16;i++){const a=i/16*TAU;gr.push([Math.sin(a)*(hw+.03),s[1]-.55+Math.cos(a)*.62,s[2]+.15]);}cord('hide',gr,.03,0x5a3a22);
 if(war){beam('wood',[hw*.9,s[1]-.3,s[2]-.3],[hw*1.1,s[1]+2.8,s[2]+.5],.025,P('woodD'),true,6);cone('iron',hw*1.1,s[1]+2.8,s[2]+.5,.035,.32,0x3a3632,6);
  W(-hw-.12,s[1]-.15,s[2]+.15,-PI/2,()=>{cyl('hide',0,0,0,.34,.05,0x7a5032,16);sph('brass',0,.06,0,.06,0xb8924a);ring('brass',0,.05,0,.3,.015,0xb8924a,0,0,0,16);});}}
/* pack: two woven bags slung each side, a rolled black tent across the top */
function saPack(an,hw){const s=an.pack||an.saddle;saDrape('patSadu',s,hw,1.0,.5,null,{});
 for(const k of [-1,1]){ellip('rug',k*(hw+.24),s[1]-.42,s[2],.24,.38,.42,k<0?P('rust'):P('indigo'),0,10);cord('rope',[[k*hw*.6,s[1]+.08,s[2]-.25],[k*(hw+.2),s[1]-.1,s[2]-.25]],.015,0xb89a6a);}
 W(0,s[1]+.2,s[2],0,()=>{beam('goat',[-hw-.35,0,0],[hw+.35,0,0],.22,P('goat'),true,12);for(const x of [-.4,.4])ring('rope',x,0,0,.23,.015,0xb89a6a,0,0,PI/2,12);});}
/* the Arab horse saddle: a padded seat, a low cantle and pommel, a sadu saddle cloth, stirrups */
function saHorse(an,hw){const s=an.saddle;saDrape('patSadu',s,hw,.85,.55,null,{tassels:.12});
 box('hide',0,s[1]+.05,s[2],.36,.08,.5,0x5a3420);box('hide',0,s[1]+.14,s[2]-.24,.3,.16,.06,0x5a3420,0,-.2);box('hide',0,s[1]+.13,s[2]+.24,.22,.12,.06,0x5a3420,0,.25);
 for(const k of [-1,1]){cord('hide',[[k*hw*.95,s[1]-.05,s[2]],[k*(hw+.04),s[1]-.62,s[2]+.04]],.012,0x3a2010);ring('iron',k*(hw+.04),s[1]-.68,s[2]+.04,.06,.012,0x2e2a26,PI/2,0,PI/2,10);}
 saBridle(an,.09);}
/* the long, low lizard saddle of the abyssal nomads: a quilted pad along the spine, a high back, stirrups slung wide */
function saLizard(an,hw,pack){const s=an.saddle;saDrape('patSadu',s,hw,1.2,.4,null,{tassels:.14,flat:.7});
 if(!pack){box('hide',0,s[1]+.06,s[2],.42,.1,.7,0x5a3420);box('hide',0,s[1]+.22,s[2]-.36,.4,.3,.07,0x5a3420,0,-.25);
  for(const k of [-1,1]){cord('hide',[[k*hw*.9,s[1],s[2]],[k*(hw+.25),s[1]-.4,s[2]+.05]],.012,0x3a2010);ring('iron',k*(hw+.25),s[1]-.46,s[2]+.05,.06,.012,0x2e2a26,PI/2,0,PI/2,10);}}
 else saPack({saddle:s,pack:s},hw*.85);}
/* ---------------------------------------------------------------- the defs */
function saMount(key,name,seed,fauna,breed,tack,o){const E=KratorFauna.entry(fauna),sc=breed&&E.breeds?E.breeds[breed].scale:1;
 return defBuilding({key,name,seed,cls:'life',kind:fauna,w:E.w*sc+(tack==='pack'?1.0:.6),d:E.d*sc+.4,h:E.h*sc+(tack==='war'?1.6:.6),budget:60000,front:{x:0,z:E.d*sc/2,yaw:0},
 tags:{role:o.role},note:o.note,frag:'kits/fauna (body), kits/desert-nomads (tack)',
 build(p){const e=saFauna(fauna,{variant:p.v|0,breed,pose:'stand',seed:seed+(p.v|0)},p.mode||'idle');const an=e.g.userData.anchors||{};
  if(tack!=='none')e.tack=saCapture(()=>{if(tack==='camel'||tack==='war')saShadad(an,o.hw,tack==='war');else if(tack==='pack'&&fauna==='dromedary')saPack(an,o.hw);
   else if(tack==='horse')saHorse(an,o.hw);else if(tack==='lizard'||tack==='pack')saLizard(an,o.hw,tack==='pack');if(tack!=='horse')saBridle(an,o.bridle||.13);});
  saLife(fauna,{job:o.job,activity:p.activity||'IDLE',band:p.band});}});}
saMount('camel-riding','Riding camel',5601,'dromedary',null,'camel',{hw:.36,role:'riding mount',job:'mount',note:'a riding dromedary under the shadad saddle: the sadu cloth, long tassels, a sheepskin'});
saMount('camel-war','War camel',5602,'dromedary',null,'war',{hw:.36,role:'war mount',job:'war mount',note:'a raider\'s camel: a kilim saddle cloth, the lance in its boot, a round hide shield'});
saMount('camel-pack','Pack camel',5603,'dromedary',null,'pack',{hw:.36,role:'pack',job:'pack',note:'a pack camel: woven bags slung each side, the black tent rolled across the top'});
saMount('horse-riding','Riding horse',5604,'horse',null,'horse',{hw:.3,role:'riding mount',job:'mount',note:'an Arab horse under a padded saddle and a sadu cloth: the desert nomads ride horses now and then'});
saMount('lizard-riding','Riding lizard',5605,'riding-lizard','riding','lizard',{hw:.42,bridle:.16,role:'riding mount',job:'mount',note:'the abyssal nomads\' riding lizard under a long, low quilted saddle'});
saMount('lizard-pack','Pack lizard',5606,'pack-lizard',null,'pack',{hw:.55,bridle:.2,role:'pack',job:'pack',note:'the abyssal nomads\' pack lizard under bags and a rolled tent'});
/* ---- the herds (kits/fauna): goats everywhere; sheep and cattle in the desert; emus in the abyss */
function saHerd(key,name,seed,fauna,o){const E=KratorFauna.entry(fauna);
 return defBuilding({key,name,seed,cls:'life',kind:fauna,w:E.w+.2,d:E.d+.2,h:E.h+.2,budget:20000,front:{x:0,z:E.d/2,yaw:0},tags:{role:'herd'},note:o.note,frag:'kits/fauna',
  build(p){saFauna(fauna,{variant:p.v|0,seed:seed+(p.seed|0)},p.mode||'graze');saLife(fauna,{job:'herd',activity:p.activity||'GRAZE',band:p.band||"the clan's herd"});}});}
saHerd('goat','Desert goat',5610,'goat',{note:'a black goat: milk, meat, the hair woven into the tents'});
saHerd('sheep','Sheep',5611,'sheep',{note:'a fat-tailed sheep of the desert flocks: wool for the sadu, milk, meat'});
saHerd('cattle','Cattle',5612,'cattle',{note:'the desert herders\' cattle, watered at the wells'});
saHerd('emu','Marsh emu',5613,'marsh-emu',{note:'the abyssal nomads\' emus: eggs, meat, feathers'});
/* the meshes: each animal's group at its placement, its tack beside it */
function saFlush(parent){for(const e of SA_LIST){const g=e.g;g.matrixAutoUpdate=false;g.matrix.copy(e.world);parent.add(g);
 if(e.tack){const T=new THREE.Group();g.add(T);flushBuckets(e.tack,T,true);}}}
FRAME_HOOKS.push(()=>{const t=ANIMU.uTime.value;for(const e of SA_LIST)KratorFauna.animate(e.g,t,e.mode,{phase:e.phase});});
