// prefix: sa
// ================================================================= SALAMANDERS: the Scyvoi's mounts and draught beasts
// Big, low, heavy amphibians with broad flat heads and thick tails, the size of a horse and longer; they are said to grow
// their limbs back (so do their riders). Markings: the fire-black with ember-orange blotches (variant 0), the dun-red with
// saffron bands (variant 1). Each is a def of class `life`, kind `salamander`, with a life-layer record (SV_LIFE: faction
// Scyvoi, a band as sub-faction, a job and a dummy schedule). The tail and the head are separate pieces turned about
// their roots every frame (a slow sway, a nod); the rest is one merged body per salamander.
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
/* the body's centre line and section, by t from the tail tip (0) to the snout (1), scaled by the beast's length */
const SA_KEYS=[ // t, z (along), y (height of the centre), half-width, half-height: a heavy, low beast
 [0,-2.55,.24,.015,.015],[.12,-2.05,.32,.1,.11],[.28,-1.35,.48,.24,.25],[.4,-.75,.66,.44,.37],[.5,-.3,.76,.56,.43],[.62,.3,.8,.6,.45],
 [.72,.85,.79,.53,.42],[.8,1.25,.77,.39,.33],[.87,1.62,.77,.46,.26],[.94,2.0,.73,.43,.2],[1,2.28,.69,.21,.11]];
function saKey(t,i){for(let k=0;k<SA_KEYS.length-1;k++){const a=SA_KEYS[k],b=SA_KEYS[k+1];if(t<=b[0]){const f=(t-a[0])/(b[0]-a[0]),e=f*f*(3-2*f);return lerp(a[i],b[i],i>=3?e:f);}}return SA_KEYS[SA_KEYS.length-1][i];}
const SA_TAIL=.36;   // the tail is t < SA_TAIL (it sways about its root)
/* the markings: a vertex colour from the position along (t) and round (a, 0 = the spine) */
function saSkin(v){const base=hc(v?0x5a2414:0x161414),spot=hc(v?0xd8a028:0xf07418),spot2=hc(v?0xe8c040:0xf4a020),belly=hc(v?0xc87a3a:0xd8843a),c=new THREE.Color();
 return (t,a)=>{const top=Math.cos(a);if(top<-.55)return c.copy(belly).lerp(base,smooth(-.75,-.55,top)*.6);
  if(v){const band=Math.sin(t*44);if(band>.55&&top>-.3)return c.copy(spot).lerp(spot2,h3(Math.floor(t*20),1,2));return c.copy(base);}
  const n=vnoise(t*22,a*2.2,3.7)+.35*vnoise(t*50,a*5,9.1);if(n>.78&&top>-.4)return c.copy(n>.9?spot2:spot);return c.copy(base);};}
function saBody(S,o,part){const v=o.v|0,skin=saSkin(v),rest=o.pose==='rest',dy=rest?-.42:0;
 const t0=part==='tail'?0:part==='head'?.84:SA_TAIL-.02,t1=part==='tail'?SA_TAIL+.02:part==='head'?1:.86;
 const curl=o.curl||0;
 tube('skin',t=>{const tt=lerp(t0,t1,t);return [Math.sin((1-tt)*3)*curl*Math.pow(1-tt,2)*S,(saKey(tt,2)+dy)*S,saKey(tt,1)*S];},
  t=>{const tt=lerp(t0,t1,t);return [saKey(tt,3)*S,saKey(tt,4)*S];},part==='body'?28:part==='tail'?14:10,16,WHITE,
  {colf:(t,a)=>skin(lerp(t0,t1,t),a),caps:part!=='body'});
 if(part==='head'){const hy=(saKey(.95,2)+dy)*S,hz=1.98*S;
  for(const s of [-1,1]){sph('plain',s*.22*S,hy+.11*S,hz-.06*S,.075*S,0x120c08,1,10);sph('brass',s*.235*S,hy+.13*S,hz-.03*S,.03*S,0xe8b040,1,6);   // eyes on the top of the head
   cord('plain',[[s*.31*S,hy-.05*S,hz-.35*S],[s*.3*S,hy-.06*S,hz],[s*.17*S,hy-.07*S,hz+.28*S],[0,hy-.07*S,hz+.34*S]],.012*S,0x2a0e08);}}   // the mouth line
 if(part==='body'){ // legs: shoulder and hip, splayed, the feet flat on the ground with four toes
  for(const [z,front] of [[.92,1],[-.42,0]])for(const s of [-1,1]){const b=[s*.42*S,(.66+dy)*S,z*S],kn=rest?[s*.82*S,.3*S,(z+(front?.2:-.1))*S]:[s*.76*S,.46*S,(z+(front?.08:-.1))*S],ft=rest?[s*.98*S,.07*S,(z+(front?.48:.12))*S]:[s*.74*S,.06*S,(z+(front?.26:.04))*S];
   tube('skin',t=>[lerp(b[0],kn[0],t),lerp(b[1],kn[1],t),lerp(b[2],kn[2],t)],t=>[lerp(.24,.15,t)*S,lerp(.26,.16,t)*S],4,10,WHITE,{colf:(t,a)=>skin(.6,a)});
   sph('skin',kn[0],kn[1],kn[2],.155*S,saSkin(v)(.6,0),1,10);
   tube('skin',t=>[lerp(kn[0],ft[0],t),lerp(kn[1],ft[1],t),lerp(kn[2],ft[2],t)],t=>[lerp(.15,.11,t)*S,lerp(.16,.1,t)*S],4,8,WHITE,{colf:(t,a)=>skin(.6,a),caps:true});
   ellip('skin',ft[0],ft[1],ft[2]+.06*S,.17*S,.06*S,.2*S,saSkin(v)(.6,0),0,10);
   for(let k=0;k<4;k++){const a=(k-1.5)*.38+(front?0:.1)*s;tube('skin',t=>[ft[0]+Math.sin(a)*t*.24*S,ft[1]-.02*S,ft[2]+.08*S+Math.cos(a)*t*.24*S],t=>[lerp(.04,.02,t)*S,lerp(.03,.015,t)*S],2,6,WHITE,{colf:(t,b2)=>skin(.6,b2),caps:true});}}}}
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
function saDef(key,name,seed,S,tack,o){const L=4.83*S;return defBuilding({key,name,seed,cls:'life',kind:'salamander',w:2.0*S+.4,d:L+.3,h:(tack==='war'?3.8:1.6)*S,budget:40000,front:{x:0,z:2.28*S,yaw:0},   // its front is its snout
 tags:{role:o.role},note:o.note,
 build(p){p=Object.assign({tack},p);const keepCM=CM.clone(),pv=SA_TAIL;
  const body=saCapture(()=>{saBody(S,p,'body');saTack(S,p);}),tail=saCapture(()=>saBody(S,Object.assign({curl:.25+.3*((p.v|0)%2)},p),'tail')),head=saCapture(()=>saBody(S,p,'head'));
  const dy=p.pose==='rest'?-.42:0;
  SA_LIST.push({body,tail,head,world:keepCM,tailRoot:[0,(saKey(pv,2)+dy)*S,saKey(pv,1)*S],headRoot:[0,(saKey(.84,2)+dy)*S,saKey(.84,1)*S],phase:(seed+(p.v|0)*31+SA_LIST.length*7)%13,rest:p.pose==='rest'});
  svLife(CURREC,{job:o.job,activity:p.activity||(p.pose==='rest'?'REST':'IDLE'),band:p.band});}});}
saDef('salamander-riding','Riding salamander',5601,1,'riding',{role:'riding mount',job:'mount',note:'a riding salamander, saddled and bridled'});
saDef('salamander-war','War salamander',5602,1.08,'war',{role:'war mount',job:'war mount',note:'a war salamander in felt barding, crested, a lance in its boot'});
saDef('salamander-draught','Draught salamander',5603,1.28,'draught',{role:'draught',job:'draught',note:'a heavy draught salamander in a padded collar and traces'});
/* the meshes: each salamander a group at its placement, its tail and head turned about their roots */
function saFlush(parent){for(const s of SA_LIST){const g=new THREE.Group();g.matrixAutoUpdate=false;g.matrix.copy(s.world);parent.add(g);flushBuckets(s.body,g,true);
 const mk=(b,root)=>{const pv=new THREE.Group();pv.position.set(...root);const inner=new THREE.Group();inner.position.set(-root[0],-root[1],-root[2]);pv.add(inner);g.add(pv);flushBuckets(b,inner,true);return pv;};
 s.tailNode=mk(s.tail,s.tailRoot);s.headNode=mk(s.head,s.headRoot);}}
FRAME_HOOKS.push((dt,now)=>{const t=ANIMU.uTime.value;for(const s of SA_LIST){if(!s.tailNode)continue;const k=s.rest?.45:1;
 s.tailNode.rotation.y=Math.sin(t*.7+s.phase)*.16*k;s.headNode.rotation.y=Math.sin(t*.31+s.phase*1.7)*.12*k;s.headNode.rotation.x=Math.sin(t*.53+s.phase)*.04;}});
