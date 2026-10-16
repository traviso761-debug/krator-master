// prefix: sa
// ================================================================= SALAMANDERS: the Scyvoi's mounts and draught beasts
// THE ANIMALS ARE THE FAUNA KIT'S (kits/fauna: KratorFauna, bundled as 39-fauna-bundle.js): the salamander's body, its markings
// (variant 0 fire-black with ember blotches, 1 dun-red with saffron bands), its breeds (riding, war, draught), the goats, their
// parts and their animation. This fragment places them as defs of class `life` with a life record (SV_LIFE: faction Scyvoi, a
// band as sub-faction, a job, and the kit's diet, temperament, traits, yields and schedule) and draws the Scyvoi's TACK on
// the salamanders against the kit's body profile (saKey). The goat fold pens a flock.
// Frame: origin on the ground under the belly, +z the snout. o: v (markings), pose 'stand' | 'rest', tack 'riding' |
// 'war' | 'draught' | 'none', activity (SV_LIFE), band.
const SA_LIST=[];
function saReset(){SA_LIST.length=0;}
/* capture what fn draws into its own buckets, in a local frame, and fold its bounds into the site box */
function saCapture(fn){const keepG=GTARGET,keepCM=CM,keepStack=CMS.slice(),keepSB=SB;const own={};GTARGET=own;SB=null;resetCM();
 const box={mn:[1e9,1e9,1e9],mx:[-1e9,-1e9,-1e9]};SB=box;
 try{fn();}finally{GTARGET=keepG;SB=keepSB;CMS.length=0;for(const m of keepStack)CMS.push(m);CM=keepCM;}
 if(SB&&box.mn[0]<1e8){const v=new THREE.Vector3();for(let i=0;i<8;i++){v.set(i&1?box.mx[0]:box.mn[0],i&2?box.mx[1]:box.mn[1],i&4?box.mx[2]:box.mn[2]).applyMatrix4(CM);for(let k=0;k<3;k++){SB.mn[k]=Math.min(SB.mn[k],v.getComponent(k));SB.mx[k]=Math.max(SB.mx[k],v.getComponent(k));}}}
 return own;}
/* the body's profile comes from the fauna kit (kits/fauna: KratorFauna.profile), at scale 1 and standing: saKey(t, i) with
   i = 1 z along, 2 y of the centre line, 3 half-width, 4 half-height, t from the tail tip (0) to the snout (1). The tack below
   is written against it, so it fits whatever body the fauna kit draws. */
const SA_P=KratorFauna.profile('salamander','riding','stand');
function saKey(t,i){const q=SA_P.at(clamp(t,0,1));return i===1?q.z:i===2?q.y:i===3?q.hw:i===4?q.hh:t;}
/* an animal from the fauna kit, placed in the current frame: built now (its box goes into the site's bounds, so the inspector
   and the footprint checks see it), drawn and animated by saFlush and the frame hook. Returns its record. */
function saFauna(key,opt,mode){const g=KratorFauna.build(key,opt);const box=new THREE.Box3().setFromObject(g);
 if(SB&&isFinite(box.min.x)){const v=new THREE.Vector3();for(let i=0;i<8;i++){v.set(i&1?box.max.x:box.min.x,i&2?box.max.y:box.min.y,i&4?box.max.z:box.min.z).applyMatrix4(CM);
  for(let k=0;k<3;k++){SB.mn[k]=Math.min(SB.mn[k],v.getComponent(k));SB.mx[k]=Math.max(SB.mx[k],v.getComponent(k));}}}
 GSTAT.tris+=g.userData.tris;const e={g,world:CM.clone(),mode:mode||'idle',phase:(SA_LIST.length*1.37)%TAU,tack:null};SA_LIST.push(e);return e;}
/* the life record of a placed animal: the kit's data (diet, activity, temperament, traits, yields) under the Scyvoi's faction */
function saLife(key,o){const L=KratorFauna.lifeOf(key);return svLife(CURREC,{job:o.job,activity:o.activity,band:o.band,extra:{diet:L.diet,feeding:L.feeding,
 activityPattern:L.activity,temperament:L.temperament,fleeDistance:L.fleeDistance,aggression:L.aggression,traits:L.traits,yields:L.yields,life:L.life,
 schedule:L.schedule}});}
/* tack: the riding saddle, the war harness, the draught collar (local frame of the beast, S its scale) */
function saTack(S,o){const dy=o.pose==='rest'?-.42:0,by=z=>(saKey(clamp((z/S+2.55)/4.83,0,1),2)+dy)*S+saKey(clamp((z/S+2.55)/4.83,0,1),4)*S;
 const kind=o.tack||'riding';if(kind==='none')return;
 const zc=.25*S,top=by(zc);
 if(kind==='riding'||kind==='war'){
  // the saddle cloth draped over the back, the saddle with a high cantle and pommel, the girth, the stirrups
  psurf(kind==='war'?'patKilim':'patFelt',(u,v)=>{const a=(u-.5)*2.2,z=zc-.55*S+v*1.1*S,r=saKey(clamp((z/S+2.55)/4.83,0,1),3)*S+.02;return [Math.sin(a)*r*1.02,by(z)-(1-Math.cos(a))*saKey(.6,4)*S*.9+.02,z];},8,4,null);
  box('hide',0,top+.03,zc,.5*S,.1*S,.62*S,0x5a3018);box('hide',0,top+.08*S,zc-.32*S,.46*S,.28*S,.1*S,0x5a3018,0,-.25);box('hide',0,top+.08*S,zc+.3*S,.3*S,.18*S,.08*S,0x5a3018,0,.3);
  sph('brass',0,top+.28*S,zc+.33*S,.05*S,0xc8963a);
  const gr=[];for(let i=0;i<=16;i++){const a=i/16*TAU;const r=saKey(.6,3)*S+.025,h=saKey(.6,4)*S+.025,cy=(saKey(.6,2)+dy)*S;gr.push([Math.sin(a)*r,cy+Math.cos(a)*h,zc+.08*S]);}cord('hide',gr,.025*S,0x3a2010);
  if(o.pose!=='rest')for(const s of [-1,1]){const p=[s*.5*S,top-.05,zc];cord('hide',[p,[s*.55*S,top-.55*S,zc+.05*S]],.015*S,0x3a2010);ring('iron',s*.55*S,top-.62*S,zc+.05*S,.07*S,.012*S,0x2e2a26,PI/2,0,PI/2,10);}
  // the bridle and reins
  const hy=(saKey(.95,2)+dy)*S,hz=1.98*S;const nb=[];for(let i=0;i<=12;i++){const a=i/12*TAU;nb.push([Math.sin(a)*saKey(.95,3)*S*1.02,hy+Math.cos(a)*saKey(.95,4)*S*1.05,hz]);}cord('hide',nb,.015*S,0x3a2010);
  for(const s of [-1,1])sagRope('hide',[s*saKey(.95,3)*S,hy,hz],[s*.12*S,top+.18*S,zc+.36*S],.12*S,.012*S,0x3a2010,6);
  // a breast band with brass discs
  const bb=[];for(let i=0;i<=10;i++){const a=(i/10-.5)*2.6;bb.push([Math.sin(a)*saKey(.78,3)*S*1.05,(saKey(.78,2)+dy)*S+Math.cos(a)*saKey(.78,4)*S*1.05,1.18*S]);}cord('hide',bb,.022*S,0x5a3018);
  for(let i=1;i<10;i+=2){const q=bb[i];cyl('brass',q[0],q[1]-.02,q[2]+.02,.045*S,.02,0xc8963a,8);}
  if(kind==='war'){ // felt barding with brass studs down the flanks, a crest on the head, the lance in its boot
   for(const s of [-1,1])psurf('patKilim',(u,v)=>{const z=zc-.95*S+u*1.9*S,a=s*(.4+v*1.15);const t=clamp((z/S+2.55)/4.83,0,1);const r=saKey(t,3)*S+.04,h=saKey(t,4)*S+.04;return [Math.sin(a)*r,(saKey(t,2)+dy)*S+Math.cos(a)*h,z];},8,4,null);
   for(let i=0;i<7;i++){const z=zc-.85*S+i*.28*S;for(const s of [-1,1])sph('brass',s*(saKey(.6,3)*S+.05),(saKey(.6,2)+dy)*S-.02,z,.03*S,0xd8a840,1,6);}
   for(let i=0;i<5;i++)cone('plain',0,hy+saKey(.95,4)*S-.02,hz-.25*S+i*.1*S,.04*S,.22*S*(1-i*.12),0xa8282a,6);
   beam('wood',[.42*S,top-.2*S,zc-.1*S],[.55*S,top+2.6*S,zc+.6*S],.025*S,P('woodD'),true,6);cone('iron',.55*S,top+2.6*S,zc+.6*S,.04*S,.3*S,0x3a3632,6);}}
 if(kind==='draught'){ // a padded collar, a yoke saddle and the trace chains back along the flanks
  const cz=1.1*S,cy=(saKey(.78,2)+dy)*S;const col=[];for(let i=0;i<=18;i++){const a=i/18*TAU;col.push([Math.sin(a)*(saKey(.78,3)*S+.08),cy+Math.cos(a)*(saKey(.78,4)*S+.08),cz]);}
  cord('hide',col,.07*S,0x6a3a20);for(const s of [-1,1])cord('iron',[[s*(saKey(.78,3)*S+.06),cy,cz],[s*(saKey(.5,3)*S+.08),cy-.05,-.3*S],[s*(saKey(.4,3)*S+.1),cy-.1,-.9*S]],.012*S,0x3a3632);
  box('hide',0,top,zc,.6*S,.16*S,.5*S,0x5a3018);psurf('patFelt',(u,v)=>{const a=(u-.5)*2,z=zc-.3*S+v*.6*S;const r=saKey(.6,3)*S+.02;return [Math.sin(a)*r,by(z)-(1-Math.cos(a))*saKey(.6,4)*S*.9+.01,z];},6,2,null);}}
function saDef(key,name,seed,breed,tack,o){const E=KratorFauna.entry('salamander'),S=E.breeds[breed].scale,L=4.83*S;
 return defBuilding({key,name,seed,cls:'life',kind:'salamander',w:2.0*S+.4,d:L+.3,h:(tack==='war'?3.8:1.6)*S,budget:40000,front:{x:0,z:2.28*S,yaw:0},   // its front is its snout
 tags:{role:o.role},note:o.note,frag:'kits/fauna (body), kits/scyvoi (tack)',
 build(p){p=Object.assign({tack},p);const e=saFauna('salamander',{variant:p.v|0,breed,pose:p.pose||'stand',seed:seed+(p.v|0)},p.pose==='rest'?'rest':(p.mode||'idle'));
  e.tack=saCapture(()=>saTack(S,p));
  saLife('salamander',{job:o.job,activity:p.activity||(p.pose==='rest'?'REST':'IDLE'),band:p.band});}});}
saDef('salamander-riding','Riding salamander',5601,'riding','riding',{role:'riding mount',job:'mount',note:'a riding salamander, saddled and bridled'});
saDef('salamander-war','War salamander',5602,'war','war',{role:'war mount',job:'war mount',note:'a war salamander in felt barding, crested, a lance in its boot'});
saDef('salamander-draught','Draught salamander',5603,'draught','draught',{role:'draught',job:'draught',note:'a heavy draught salamander in a padded collar and traces'});
/* ---- the goats: the herd whose hair is the black tent cloth (kits/fauna: goat) */
defBuilding({key:'goat',name:'Drylands goat',seed:5604,cls:'life',kind:'goat',w:.8,d:1.3,h:1.3,budget:12000,front:{x:0,z:.65,yaw:0},
 tags:{role:'herd'},note:'a long-haired herd goat: milk, meat, the black hair woven into the tents, the hides to the hidemaker',frag:'kits/fauna',
 build(p){saFauna('goat',{variant:p.v|0,seed:5604+(p.seed|0)},p.mode||'graze');saLife('goat',{job:'herd',activity:p.activity||'GRAZE',band:p.band||"the band's flock"});}});
/* the fold: a ring of woven wattle hurdles with a gate, a trough, a hay rack and the flock inside */
defBuilding({key:'goat-fold',name:'Goat fold',seed:5606,cls:'feature',kind:'goat fold',w:10,d:10,h:1.4,budget:120000,front:{x:0,z:4.6,yaw:0},
 tags:{role:'herding'},note:'the flock penned for the night or for milking: wattle hurdles, a gate, a trough',
 build(o){const R=4.4,n=18,gate=.55;
  for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU,am=(a0+a1)/2;if(tkNearDoor(am,gate*.5))continue;   // the gate gap faces +z
   const p0=[Math.cos(a0)*R,Math.sin(a0)*R],p1=[Math.cos(a1)*R,Math.sin(a1)*R],L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
   W((p0[0]+p1[0])/2,0,(p0[1]+p1[1])/2,Math.atan2(p1[0]-p0[0],p1[1]-p0[1])-PI/2,()=>{
    for(const x of [-L/2+.05,0,L/2-.05])pole('wood',[x,0,0],[x,1.15,0],.035,P('woodD'),6);
    for(let k=0;k<6;k++){const y=.15+k*.17;for(let q=0;q<3;q++){const xa=-L/2+q*L/3,xb=xa+L/3;beam('wood',[xa,y+(q%2?.03:-.03),(k%2?.03:-.03)],[xb,y+(q%2?-.03:.03),(k%2?-.03:.03)],.025,P('wood'),true,5);}}});}
  for(const s of [-1,1])pole('wood',[s*gate*R*.5,0,R],[s*gate*R*.5,1.3,R],.06,P('woodD'),7);
  W(-gate*R*.5,0,R,.9,()=>{for(const y of [.3,.7,1.05])beam('wood',[0,y,0],[gate*R*.95,y,0],.035,P('wood'),true,6);beam('wood',[0,.3,0],[gate*R*.95,1.05,0],.03,P('wood'),true,5);});   // the gate, swung open
  FURNISH('scyvoi_trade_trough',-1.6,0,-2.6,.4,{setting:'outdoor'});FURNISH('scyvoi_trade_hayrack',2.2,0,-3.4,-.5,{setting:'outdoor'});
  const spots=[[0,0,.2],[1.4,.8,2.4],[-1.5,1.2,-.6],[2.2,-1.4,3.6],[-2.4,-1.3,1.1],[.6,-2.2,-2.6],[-.8,2.6,2.9],[1.9,2.1,-1.2],[-2.8,.3,.6]];
  spots.forEach(([x,z,ry],i)=>place('goat',x,z,ry,{v:i===0?0:(i===3||i===6)?2:i%3===1?3:1,seed:i,mode:i%3===2?'idle':'graze'}));}});
/* ---- the great herds (2026-10-07): the bison and the cattle (kits/fauna), and the ring of wattle that pens them */
function saHerdDef(key,name,seed,fauna,note,job){const E=KratorFauna.entry(fauna);
 return defBuilding({key,name,seed,cls:'life',kind:fauna,w:E.w+.3,d:E.d+.3,h:E.h+.3,budget:20000,front:{x:0,z:E.d/2,yaw:0},tags:{role:'herd'},note,frag:'kits/fauna',
  build(p){saFauna(fauna,{variant:p.v|0,seed:seed+(p.seed|0)},p.mode||'graze');saLife(fauna,{job:job||'herd',activity:p.activity||'GRAZE',band:p.band||"the band's herd"});}});}
saHerdDef('bison','Steppe bison',5607,'bison','a steppe bison of the band\'s herd: meat, the great hides, the spring moult for felt');
saHerdDef('cattle','Cattle',5608,'cattle','the band\'s cattle: milk, meat, hides');
/* a ring of wattle hurdles of radius R with a gate gap at +z (gate: its share of a hurdle), the gate swung open */
function saWattle(R,n,gate,hgt){hgt=hgt||1.15;for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU,am=(a0+a1)/2;if(tkNearDoor(am,gate*.5))continue;
  const p0=[Math.cos(a0)*R,Math.sin(a0)*R],p1=[Math.cos(a1)*R,Math.sin(a1)*R],L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);
  W((p0[0]+p1[0])/2,0,(p0[1]+p1[1])/2,Math.atan2(p1[0]-p0[0],p1[1]-p0[1])-PI/2,()=>{
   for(const x of [-L/2+.05,0,L/2-.05])pole('wood',[x,0,0],[x,hgt,0],.04,P('woodD'),6);
   for(let k=0;k<Math.round(hgt/.17);k++){const y=.15+k*.17;for(let q=0;q<3;q++){const xa=-L/2+q*L/3,xb=xa+L/3;beam('wood',[xa,y+(q%2?.03:-.03),(k%2?.03:-.03)],[xb,y+(q%2?-.03:.03),(k%2?-.03:.03)],.026,P('wood'),true,5);}}});}
 const gw=gate*R*.5;for(const s of [-1,1])pole('wood',[s*gw,0,R],[s*gw,hgt+.2,R],.07,P('woodD'),7);
 W(-gw,0,R,.9,()=>{for(const y of [.3,.75,hgt-.05])beam('wood',[0,y,0],[gw*1.9,y,0],.04,P('wood'),true,6);beam('wood',[0,.3,0],[gw*1.9,hgt-.05,0],.035,P('wood'),true,5);});}
defBuilding({key:'bison-pen',name:'Bison and cattle pen',seed:5609,cls:'feature',kind:'cattle fold',w:17,d:17,h:1.7,budget:240000,front:{x:0,z:7.6,yaw:0},
 tags:{role:'herding'},note:'the great herd penned for the night: a wide ring of high wattle hurdles, the bison and the cattle, troughs and a hay rack',
 build(o){saWattle(7.4,26,.38,1.45);
  FURNISH('scyvoi_trade_trough',-2.6,0,-5.0,.4,{setting:'outdoor'});FURNISH('scyvoi_trade_trough',2.6,0,-5.0,-.4,{setting:'outdoor'});FURNISH('scyvoi_trade_hayrack',4.6,0,-3.6,-.8,{setting:'outdoor'});
  [[0,0,.3,'bison',0],[-3.2,1.4,2.2,'bison',1],[2.8,2.2,-1.0,'bison',2],[-1.2,-3.0,1.4,'cattle',1],[3.4,-1.6,3.0,'cattle',2],[-4.0,-1.2,-.6,'bison',1]].forEach(([x,z,ry,k,v],i)=>place(k,x,z,ry,{v,seed:i,mode:i%3===2?'idle':'graze'}));}});
/* the meshes: each animal's group at its placement (the fauna kit's parts and materials), its tack beside it */
function saFlush(parent){for(const e of SA_LIST){const g=e.g;g.matrixAutoUpdate=false;g.matrix.copy(e.world);parent.add(g);
 if(e.tack){const T=new THREE.Group();g.add(T);flushBuckets(e.tack,T,true);}}}
FRAME_HOOKS.push(()=>{const t=ANIMU.uTime.value;for(const e of SA_LIST)KratorFauna.animate(e.g,t,e.mode,{phase:e.phase});});
