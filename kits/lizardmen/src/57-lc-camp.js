// prefix: lc
// ================================================================= THE CAMP: the tents of the mustering ground
// The owner's references (DESIGN.md section 9): hide tents over bone frames, the pole-and-shield tents, the great sail tents.
// A tent is a hide skin over an exoskeleton that runs on past the apex (odd ribs, lzHorn), its door a caste-sized triangle
// cut in the skin (lcSkin), bone stakes and cords outside; NO banners, drums, horns, gongs or fires: the camp is silent too.
// The row shows all four; two of them are pitched on the mustering ground (56-lz-military.js, lz-muster).
// Frame: origin on the ground at the tent's centre, +z the front (the door).
/* a hide cone: the skin from the ground ring R up to the apex at h, bulging a little, the front cut as a triangle dh high and
   dw wide at the foot (the gap closes linearly to the door's apex). o.mk hide | hideP, o.col, o.bulge; o.amp the flutter (small:
   the skin is staked). Declares the door and lays its threshold. */
function lcSkin(R,h,dh,dw,o){o=o||{};const mk=o.mk||'hide',col=o.col||P('hide'),bulge=o.bulge===undefined?.1:o.bulge,g0=2*Math.asin(Math.min(.9,dw/2/R));
 const f=(u,v)=>{const y=h*v,r=Math.max(.02,R*(1-v)*(1+bulge*Math.sin(PI*v)));const g=y<dh?g0*(1-y/dh):0;const a=g/2+u*(TAU-g);return [Math.sin(a)*r,y,Math.cos(a)*r];};
 withCloth((p,out)=>{const t=Math.sin(PI*clamp(p.y/h,0,1))*(o.amp===undefined?.035:o.amp);const L=Math.hypot(p.x,p.z)||1;out.set(p.x/L*t,0,p.z/L*t);},
  ()=>psurf(mk,f,o.nu||30,o.nv||9,col,{}));
 door(0,0,R,0,dw);lzThreshold(0,R+.12,0,dw);}
/* the radius of a cone skin at height y (to lay a thing flat on it) */
function lcSkinR(R,h,y,bulge){return R*(1-y/h)*(1+(bulge===undefined?.1:bulge)*Math.sin(PI*y/h));}
/* a bone stake outside the skin at angle a, radius R, with a cord from the skin's hem (at height y) out to it */
function lcStake(a,R,y){const sx=Math.sin(a),cz=Math.cos(a);beam('bones',[sx*(R+.7),0,cz*(R+.7)],[sx*(R+.95),.45,cz*(R+.95)],.04,P('boneO'),true,5);
 sagRope('rope',[sx*R*.98,y,cz*R*.98],[sx*(R+.93),.42,cz*(R+.93)],.04,.014,P('reedD'),5);}
/* n bone ribs (odd) round a cone R by h: each leans in from outside the skin, crosses above the apex and runs on as a spike
   (lzHorn); a bone collar lashes them near the top. o.r the root radius, o.curl, o.mk */
function lcRibs(n,R,h,o){o=o||{};const L=Math.hypot(R,h)*(o.run||1.14),lean=Math.atan2(R+.1,h);
 for(let i=0;i<n;i++){const a=(i+.5)*TAU/n;lzHorn(Math.sin(a)*(R+.1),0,Math.cos(a)*(R+.1),a+PI,L,o.r||.11,{curl:o.curl===undefined?.22:o.curl,lean,mk:o.mk||'bones',nt:12,ns:7});}
 ring(o.mk||'bones',0,h*.86,0,lcSkinR(R,h,h*.86,o.bulge)+.16,.05,P('boneO'),0,0,0,12);}
/* a round black-lacquer shield facing +z of the frame: a bronze rim and a spiral-eye boss */
function lcShield(r){WX(0,0,0,0,PI/2,0,()=>{cyl('lacq',0,-.06,0,r,.06,P('lacq'),16);ring('bronzeC',0,.0,0,r*.96,.022,P('bronze'),0,0,0,20);});lzEye(0,0,.005,0,r*.3,{mk:'bronze'});}
/* ---------------------------------------------------------------- the hide tent: the Line warriors' */
defBuilding({key:'lc-hide',name:'Hide tent',seed:7421,caste:4,cut:true,w:9.4,d:9.4,h:6.8,budget:40000,
 tags:{types:['dwelling-multi','military'],wealth:'poor',role:'dwelling'},
 note:"the Line warriors' tent (caste 4, a 2.77 m door): a hide skin from the bone hall's stock over seven hexapod ribs that lean in from outside it, cross above the apex and run on as spikes, a bone collar lashing them, seven stakes and cords; basking slabs inside",
 build(o){const R=3.2,h=4.6,dh=lzDoorH(4),dw=+(dh*.62).toFixed(2);lzCutFloor(0);
  /* the skin sags INWARD between the apex and the foot (a hide stretched over a frame), so the ribs stay outside it */
  lzDust(0,0,R+.9);lcSkin(R,h,dh,dw,{mk:'hide',col:P('hide'),bulge:-.07});
  lzNoCut(()=>{lcRibs(7,R,h,{r:.11,bulge:-.07});for(let i=0;i<7;i++)lcStake((i+.5)*TAU/7,R,.35);});
  lzFurnRoom(4.2,4.2,0,'common',{beds:2,noHearth:true,ceil:h*.55,extra:[['lizardmen_common_rack',-1.5,.9,PI/2],['generic_water',1.5,1.1,0]]});}});
/* ---------------------------------------------------------------- the pole-and-shield tent: the Bulwarks' */
defBuilding({key:'lc-shield',name:'Pole-and-shield tent',seed:7422,caste:6,cut:true,w:12.6,d:12.6,h:9.8,budget:70000,
 tags:{types:['dwelling-multi','military'],wealth:'middle',role:'dwelling'},
 note:"the Bulwarks' tent (caste 6, a 4.37 m door): one great leg-bone pole running on past the apex with five horns at its collar, the pale hide skin pegged to eleven short bone posts, and thirteen round black-lacquer shields with bronze rims and spiral-eye bosses: twelve leaning round the skirt, the thirteenth hung over the door",
 build(o){const R=4.6,h=7.2,dh=lzDoorH(6),dw=+(dh*.62).toFixed(2);lzCutFloor(0);
  lzDust(0,0,R+1);lcSkin(R,h,dh,dw,{mk:'hideP',col:P('hideP'),bulge:.06});
  lzNoCut(()=>{beam('bones',[0,0,0],[0,h+1.6,0],.2,P('boneO'),true,9,.07);ring('rope',0,h-.1,0,.26,.04,P('reedD'),0,0,0,10);
   for(let i=0;i<5;i++){const a=i*TAU/5+.3;lzHorn(Math.sin(a)*.2,h-.2,Math.cos(a)*.2,a,1.4,.06,{curl:.5,lean:.5,mk:'horn'});}
   for(let i=0;i<11;i++){const a=(i+.5)*TAU/11,x=Math.sin(a)*(R+.08),z=Math.cos(a)*(R+.08);beam('bones',[x,0,z],[x*1.01,1.5,z*1.01],.07,P('boneO'),true,6);if(i%2)lcStake(a,R,.6);}
   for(let i=1;i<13;i++){const a=i*TAU/13;WX(Math.sin(a)*(R+.32),.68,Math.cos(a)*(R+.32),a,-.32,0,()=>lcShield(.64));}
   /* the thirteenth hangs over the door, flat on the skin */
   const yd=dh+1.1;WX(0,yd,lcSkinR(R,h,yd,.06)+.08,0,-Math.atan2(R,h)*.9,0,()=>lcShield(.64));});
  lzFurnRoom(6,6,0,'common',{beds:3,ceil:h*.5,extra:[['lizardmen_common_rack',-2.6,1.2,PI/2],['generic_trade_locker',2.6,1.4,-PI/2]]});}});
/* ---------------------------------------------------------------- the Interpreters' tent: tall, narrow, twisted */
defBuilding({key:'lc-seer',name:"Interpreters' tent",seed:7423,caste:5,cut:true,w:8.6,d:8.6,h:10.4,budget:45000,
 tags:{types:['dwelling-single','religious'],wealth:'rich',role:'dwelling'},
 note:"an Interpreter's tent (caste 5, a 3.48 m door): a tall narrow cone of black-lacquered hide under five bone ribs that twist as they climb and cross above the apex (the Interpreters' tower in hide), an oxblood leiwen band either side of the door, a spiral eye above it; a court interior",
 build(o){const R=2.9,h=8,dh=lzDoorH(5),dw=+(dh*.62).toFixed(2),B=.14;lzCutFloor(0);
  lzDust(0,0,R+.8);lcSkin(R,h,dh,dw,{mk:'hide',col:P('hideD'),bulge:B,amp:.02});
  lzNoCut(()=>{for(let i=0;i<5;i++){const a0=(i+.5)*TAU/5;tube('bones',t=>{const r=(R+.12)*(1-t*1.12)*(1+B*Math.sin(PI*Math.min(1,t*1.12))),a=a0+t*1.1;return [Math.sin(a)*r,h*t*1.12,Math.cos(a)*r];},t=>{const q=.1*(1-.6*t)+.01;return [q,q];},16,7,P('bone'),{caps:true});}
   ring('bones',0,h-.15,0,.42,.06,P('boneO'),0,0,0,12);for(let i=0;i<5;i++)lcStake((i+.5)*TAU/5,R,.5);
   /* the eye above the door and the leiwen bands either side of it lie flat on the skin, tilted with its slope */
   const tilt=-Math.atan2(R,h)*.9,ye=dh+.9;WX(0,ye,lcSkinR(R,h,ye,B)+.06,0,tilt,0,()=>lzEye(0,0,0,0,.34,{mk:'bronze'}));
   for(const s of [-1,1]){const a=s*.66,yb=.4,rb=lcSkinR(R,h,yb,B)+.05;WX(Math.sin(a)*rb,yb,Math.cos(a)*rb,a,tilt,0,()=>lzLeiwen(.9,.7,{cell:.3,mk:'lacqR',back:false,proud:.05}));}});
  lzFurnRoom(3.8,3.8,0,'court',{beds:1,noHearth:true,ceil:h*.45,extra:[['lizardmen_court_low_table',0,.6,0],['lizardmen_court_candelabra',1.3,-.9,0],['lizardmen_court_statue',-1.3,-.9,PI/4]]});}});
/* ---------------------------------------------------------------- the great sail tent: the camp's shared hall */
defBuilding({key:'lc-sail',name:'Great sail tent',seed:7424,caste:'all',cut:true,w:15,d:19,h:11.6,budget:90000,
 tags:{types:['dwelling-multi','military','civic'],wealth:'middle',role:'hall'},
 note:'the shared tent of the camp (nested portals to a 4.4 m door): three bone masts of unequal height carry a sagging ridge, two hide sails hang from it to seven bone posts a side and are guyed to stakes beyond; the front gable a hide sheet with the seven nested bronze frames, the back gable closed; a hall inside',
 build(o){const L=15,hz=4.4,eY=.06,dh=lzDoorH(6),dw=+(dh*.62).toFixed(2);lzCutFloor(0);   /* the sails and gables reach the ground (owner: the wall was not at the floor) */
  const ridge=z=>7.4+1.8*Math.cos(PI*z/L);   /* the ridge sags between the masts: a sail's curve */
  box('earthR',0,0,0,2*hz+.6,.08,L+.6,P('earthP'));
  /* the sails: two hide sheets from the ridge down to the eave line, bellying a little */
  withCloth((p,out)=>{const q=Math.abs(p.x)/hz,t=4*q*(1-q)*.05;out.set(0,t,0);},()=>{for(const s of [-1,1])psurf('hide',(u,v)=>{const z=-L/2+L*u,y=lerp(eY,ridge(z),v)-.3*Math.sin(PI*v);return [s*hz*(1-v)*(1+.04*Math.sin(PI*v)),y,z];},12,7,P('hide'),{flip:s>0});});
  /* the gables: the front a hide sheet with the door (and the portal's seven frames), the back closed */
  const zf=L/2,zb=-L/2;lzWall([-hz*.97,zf],[hz*.97,zf],[-.12,zf],[.12,zf],0,ridge(zf),'hideW',P('hideP'),[{s:hz*.97,w:dw,h:dh,door:true}],{inner:false});
  lzWall([hz*.97,zb],[-hz*.97,zb],[.12,zb],[-.12,zb],0,ridge(zb),'hideW',P('hideP'),[],{inner:false});
  lzNoCut(()=>{lzPortal(0,0,zf+.1,0,dh,{mk:'bronze',step:.12});lzThreshold(0,zf+.3,0,dw);
   /* the masts (odd, unequal) run on past the ridge; the ridge pole follows the curve */
   for(const z of [-5,0,5])beam('bones',[0,0,z],[0,ridge(z)+1.3,z],.17,P('boneO'),true,9,.07);
   const rp=[];for(let k=0;k<=10;k++){const z=-L/2-.4+(L+.8)*k/10;rp.push([0,ridge(z)+.04,z]);}cord('bones',rp,.08,P('boneO'));
   /* seven posts a side under the eave, every post staked; guys from the mast tops */
   for(const s of [-1,1])for(let i=0;i<7;i++){const z=-L/2+.6+(L-1.2)*i/6,x=s*(hz+.1);beam('bones',[x,0,z],[x*1.02,eY+.9,z],.07,P('boneO'),true,6);
    beam('bones',[s*(hz+1.5),0,z],[s*(hz+1.9),.45,z],.04,P('boneO'),true,5);sagRope('rope',[x,eY+.85,z],[s*(hz+1.85),.42,z],.05,.014,P('reedD'),5);}
   for(const z of [-5,0,5])for(const s of [-1,1]){beam('bones',[s*(hz+2.4),0,z],[s*(hz+2.7),.5,z],.05,P('boneO'),true,5);sagRope('rope',[0,ridge(z)+1.1,z],[s*(hz+2.65),.48,z],.25,.016,P('reedD'),7);}});
  lzFurnRoom(7,12,0,'common',{beds:3,ceil:5.5,extra:[['lizardmen_common_rack',-3.1,2.4,PI/2],['lizardmen_common_rack',3.1,2.4,-PI/2],['generic_trade_bunk',0,3.6,0]]});}});
