// ================================================================= REED LAKE — halls, sacred sites, the watchtower
// The communal buildings of the lake people: the great mudhif (the village longhouse and guest hall), the warrior's
// hall in its bundle palisade, the shaman's house under a painted cone, the spirit circle, and the watchtower
// that every island cluster keeps against raiders. Fire only; woven bands and pennants, nothing carved. Seeds 25100–25199.

// The great mudhif — the village longhouse: seven columns each end, twelve pairs of ribs, a bundle-edged terrace
// with braziers and a stair of mats, banded posts with pennants and hung cloths at the door, a woven finial over the front
// apex, a fish rail and canoes at the landing, guests on the terrace.
function buildRLLonghouse(G,o){reseed(25101+(o.v|0));const L=22,S=8.6,H=8.2;
 const old=hC(vPick(RPAL.strawOld)),c=hC(vPick(RPAL.straw));vnReg('Great mudhif',0,-1,12,H+1.5);
 const rf=hnRLPad(19,30,o,11);
 const M=hnRLMudhif(G,{x:0,z:-2,L,S,H,cols:7,rib:.2,col:.28,c});
 const fz=-2+L/2;
 // the terrace: two courses of bundles at the edge, a mat floor, braziers, banded posts, woven cloths
 vB('hRLMatB',0,-.02,fz+2.2,S+4,.12,4.4,0,old);for(const k of[0,1])kput('hRLBundleX',[0,.1+k*.2,fz+4.4-k*.2],null,[S+4.4-k*.4,.2,.2],old.clone().multiplyScalar(1-k*.08));
 for(const s of[-1,1]){hnRLPost(s*(S/2+.9),0,fz+1.2,.34,6.2,0,{disc:true,pennant:true});hnRLBrazier(s*3.4,fz+3.6,1);
  hnRLCloth(s*2.6,.5,fz+.2,0,2.4,1.2);hnRLCloth(s*(S/2-.7),.4,fz+.2,0,.6,M.hl-.7);}
 hnRLCloth(0,M.hl+.9,fz+.16,0,2.8,1.4);hnRLFinial(0,H+.1,fz+.1,0,1.2);
 for(let k=0;k<6;k++)hnRLGourd(-3.6+k*1.45,M.hl-.1,fz+.24);
 // the landing: a broad mat stair to the water, canoes, a fish rail, sheaves, a hearth for the cooks
 for(let k=0;k<3;k++)vB('hRLMatB',0,-.02,fz+4.6+k*.7,5-k*.6,.12-k*.03,.7,0,old);
 hnRLFishRail([-S/2-2.4,-3],[-S/2-2.4,2.5],2,9);hnRLSheaves(S/2+2.4,-4,0,4,{stook:true});hnRLReedLay(S/2+2.8,1.5,Math.PI/2,3.4,3);
 hnRLHearth(-S/2-2.6,5.4,.55);hnRLNet([S/2+2,0,4.2],[S/2+2,0,7.2],1.6);
 hnRLBeast(-S/2-3,0,-6,.6,'goat');hnRLBeast(4,0,-11.6,2,'duck');hnRLBeast(4.8,0,-12.2,1,'duck');hnRLBeast(-4,0,-12,4,'duck');
 if(rf){hnRLMoor(G,3.2,rf(Math.PI/2)+.4,0,{L:5.2,W:1.3,folk:2});hnRLMoor(G,-3.4,rf(Math.PI/2)+.4,0,{L:4.6,W:1.2,folk:1});
  const p=[8.5,rf(Math.PI/2-.35)+.6];hnRLBoat(G,p[0],p[1],.4,7.5,2,{heads:2,cabin:true,folk:2});}
 vnFolk(0,fz+2.4,4,1.8);vnFolk(-1,fz+6.4,3,1.5);hnRLFolk(0,0,-2,0,0);}

// Warrior's hall — a mudhif inside a palisade of sharpened reed bundles: shields racked along the front, spears,
// pennant posts at the gate, a mat-floored sparring ring, a trophy pole with horns, a war canoe with two heads.
function buildRLWarriorHall(G,o){reseed(25111+(o.v|0));const L=15,S=6.2,H=5.6,PW=26,PD=24,hz=-4;
 const old=hC(vPick(RPAL.strawOld)),c=hC(vPick(RPAL.straw));vnReg("Warrior's hall",0,hz,9,H+1);vnReg("Warrior's hall — yard",0,6,8,3);
 const rf=hnRLPad(24,24,o,12);
 // the palisade: close bundles with sharpened tips on a bundle sill, a gate in the front with pennant posts
 {const segs=[[[-PW/2,-PD/2],[PW/2,-PD/2]],[[PW/2,-PD/2],[PW/2,PD/2]],[[-PW/2,PD/2],[-PW/2,-PD/2]],[[-PW/2,PD/2],[-2,PD/2]],[[2,PD/2],[PW/2,PD/2]]];
  for(const s of segs){const Ls=Math.hypot(s[1][0]-s[0][0],s[1][1]-s[0][1]);const n=Math.round(Ls/.36);
   for(let i=0;i<=n;i++){const x=s[0][0]+(s[1][0]-s[0][0])*i/n,z=s[0][1]+(s[1][1]-s[0][1])*i/n;const h=2.6+rr(-.2,.2);vPst('hRLBundle',x,-.2,z,.17,h,old.clone().multiplyScalar(rr(.9,1.08)));kput('vConeI',[x,h-.25,z],null,[.17,.45,.17],hC(0x6a5a3a));}
   for(const yy of[.9,2])beam('hRLBundleC',[s[0][0],yy,s[0][1]],[s[1][0],yy,s[1][1]],.12,.12,old);}}
 for(const s of[-1,1]){vPst('hRLBundle',s*2.4,0,PD/2,.26,3.6,c);hnRLPost(s*3.8,0,PD/2+.9,.34,6.5,0,{disc:true,pennant:true});}
 kput('hRLBundleX',[0,3.5,PD/2],null,[5.4,.2,.2],c);hnRLFinial(0,3.7,PD/2,0,.9);
 // the hall
 const M=hnRLMudhif(G,{x:0,z:hz,L,S,H,cols:5,rib:.17,col:.24,c});const fz=hz+L/2;
 for(const s of[-1,1]){hnRLCloth(s*2.2,.4,fz+.18,0,1.9,M.hl-.6);}
 // shields racked on the mat band either side of the door, spears leaning
 for(const s of[-1,1]){kput('hRLBundleX',[s*1.9,M.hl+.4,fz+.3],null,[2.4,.07,.07],old);
  for(let k=0;k<4;k++){const x=s*(1+k*.55);kput('hRLShield',[x,M.hl+.05,fz+.38],qEuler(-.08,0,0),[.4,.4,1],hC(vPick([0xffffff,0xe8c0a0,0xa0d0c8,0xf0d890,0xe0a098])));}}
 for(let k=0;k<6;k++){const x=rr(-2.6,2.6);if(Math.abs(x)<.9)continue;kput('vPost',[x,0,fz+.5],qEuler(-.18,0,rr(-.1,.1)),[.03,2.6,.03],hC(vPick(RPAL.pole)));}
 vB('hRLMatB',0,-.02,fz+1.2,S+1,.1,2.4,0,old);hnRLBrazier(-3.2,fz+1.8,.9);hnRLBrazier(3.2,fz+1.8,.9);
 // the sparring ring: a round mat, a ring of short bundles, weapon racks, the trophy pole
 const rz=6.2,R=4.6;vPst('hRLDisc',0,-.02,rz,R,.08,old);for(let k=0;k<20;k++){const a=k/20*TAU,b=(k+1)/20*TAU;vPst('hRLBundle',Math.sin(a)*R,0,rz+Math.cos(a)*R,.1,.7,old);beam('hRLBundleC',[Math.sin(a)*R,.62,rz+Math.cos(a)*R],[Math.sin(b)*R,.62,rz+Math.cos(b)*R],.06,.06,old);}
 vnFolk(0,rz,2,1.2);vnFolk(0,rz+5.6,3,3);
 for(const s of[-1,1]){const x=s*8.6;for(const z of[rz-1.2,rz+1.2])vPst('hRLBundle',x,0,z,.08,1.7,old);kput('hRLBundleX',[x,1.6,rz],qEuler(0,Math.PI/2,0),[2.6,.06,.06],old);
  for(let k=0;k<5;k++){const z=rz-1+k*.5;kput('vPost',[x+.25*s,0,z],qEuler(0,0,s*-.14),[.025,2.5,.025],hC(vPick(RPAL.pole)));kput('vConeI',[x+.25*s-s*.34,2.48,z],qEuler(0,0,s*-.14),[.05,.24,.05],hC(0x5a5650));}}
 {const x=-9.8,z=-8;vPst('hRLBundle',x,0,z,.16,6,c);for(let k=0;k<4;k++){const a=k*.9;const p=loc(x,z,.6,0,a);beam('hRLBundleC',[x,2.6+k,z],[p[0],2.75+k,p[1]],.04,.04,c);kput('hRLBandP',[p[0],2.35+k,p[1]],qEuler(0,a,0),[.9,.45,1],null);}kput('hRLChakana',[x,6.5,z],null,[.9,.9,1],null);}
 hnRLSheaves(9.5,-8,0,3,{});hnRLHearth(9,-3,.5);
 if(rf){hnRLMoor(G,-4,rf(Math.PI/2)+.4,0,{L:4.6,W:1.2});const p=[5,rf(Math.PI/2+.2)+.8];hnRLBoat(G,p[0],p[1],.15,8,1.9,{heads:2,folk:3});}}
// Shaman's house — a round mat house under a tall painted cone with a smoke hole and poles through it, woven
// cloths on every bay; a ring of spirit poles with bands and ribbons; herbs drying; a fire with a tripod pot.
function buildRLShaman(G,o){reseed(25121+(o.v|0));const R=3.4,H=2.3;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld)),blk=hC(HPAL.black);vnReg("Shaman's house",0,0,5,H+8.4);
 const rf=hnRLPad(16,16,o,13);
 vPst('hRLDisc',0,-.05,0,R+.3,.16,old);kput('hRLMatCyl',[0,.1,0],null,[R,H,R],c);
 const n=12;for(let k=0;k<n;k++){const a=k/n*TAU+.13;vPst('hRLBundle',Math.sin(a)*(R+.06),0,Math.cos(a)*(R+.06),.09,H+.2,old);}
 for(const yy of[.25,H-.15])kput('vHoop',[0,yy,0],qEuler(Math.PI/2,0,0),[R+.12,R+.12,1.4],old);
 kput('hRLConeP',[0,H-.05,0],null,[R+1.2,7.4,R+1.2],null);
 const top=H-.05+7.4;for(let k=0;k<6;k++){const a=k/6*TAU+.3;beam('hRLBundleC',[Math.sin(a)*.12,top-1.4,Math.cos(a)*.12],[Math.sin(a)*.7,top+1.3,Math.cos(a)*.7],.09,.09,old);}
 kput('vConeI',[0,top+.2,0],null,[.6,.5,.6],hC(0x4a4038));
 kput('hRLBandCyl',[0,H-.5,0],null,[R+.04,.4,R+.04],null);
 for(let k=1;k<n;k+=2){const a=(k+.5)/n*TAU+.13;hnRLCloth(Math.sin(a)*(R+.03),.3,Math.cos(a)*(R+.03),a,.55,1.5);}
 vnDoor(0,.1,R+.02,0,.95,1.75,'vWood',old,hC(0x6a4a30),false);hnRLCloth(0,H-.6,R+.05,0,1.7,.5);
 for(const s of[-1,1])hnRLPost(s*1.05,0,R+.6,.15,2.7,0,{});vB('hRLMatB',0,-.02,R+.9,2,.1,1.2,0,old);
 // spirit poles round the house
 for(let k=0;k<9;k++){const a=(k+.5)/9*TAU*(10/11)+TAU/22+Math.PI*.09;const x=Math.sin(a)*6.4,z=Math.cos(a)*6.4;if(z>5)continue;const h=rr(3,4.6);
  hnRLPost(x,0,z,.19,h,a,{disc:true,pennant:true});
  kput('vCloth',[x+Math.sin(a+1.57)*.3,h-.7,z+Math.cos(a+1.57)*.3],qEuler(0,a,0),[.18,1.2,1],hC(vPick([0xb3322a,0x2e9488,0xefe7d6,0xd19a3a])));}
 // herbs drying, the fire and pot, jars
 const hx=-5.4,hzz=3.6;for(const s of[-1,1])vPst('hRLBundle',hx+s*1.5,0,hzz,.07,2.1,old);beam('hRLBundleC',[hx-1.7,2,hzz],[hx+1.7,2,hzz],.07,.07,old);
 for(let k=0;k<8;k++){const x=hx-1.3+k*.37;vPst('vRope',x,1.65,hzz,.01,.35,hC(0x9a8a6a));kput('vLeaf',[x,1.45,hzz],null,[.12,.3,.12],hC(vPick([0x6a7a3a,0x8a7a44,0x5a6a34,0x9a8050])));}
 hnRLHearth(2.4,R+2.6,.5);for(let k=0;k<3;k++){const a=k/3*TAU;beam('vIron',[2.4+Math.sin(a)*.7,.18,R+2.6+Math.cos(a)*.7],[2.4,1.7,R+2.6],.04,.04,hC(0x2e2a26));}
 vBall('vBall',2.4,.95,R+2.6,.28,hC(0x2e2a26),.24);
 for(const [x,z] of[[5.4,1],[-4.6,-3.2]]){kput('vClayPot',[x,0,z],null,[.28,.55,.28],hC(0x9a5a38));kput('vClayPot',[x+.5,0,z+.3],null,[.2,.4,.2],hC(0x8a4a30));}
 if(rf)hnRLMoor(G,1.6,rf(Math.PI/2)+.3,0,{L:4,W:1});
 vnFolk(0,R+4.2,2,1.4);}

// Spirit circle — the lake's answer to the stone circle: a ring of tall reed-bundle pillars with woven bands, chakana
// discs and pennants, a hearth on a clay slab in the middle, an altar of jars and gourds, two banded posts at the entrance and
// an avenue of low bundles leading in from the landing.
function buildRLSpiritCircle(G,o){reseed(25131+(o.v|0));const R=7.2;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld));vnReg('Spirit circle',0,0,R+1.5,6.2);
 const rf=hnRLPad(18,20,o,14);
 vPst('hRLDisc',0,-.04,0,R+1.4,.08,old);
 let k=0;for(let a=.62;a<TAU-.6;a+=(TAU-1.24)/12){const x=Math.sin(a)*R,z=Math.cos(a)*R;const h=rr(3,4.6);vPst('hRLBundle',x,0,z,.27,h,c.clone().multiplyScalar(rr(.9,1.05)));
  kput('hRLBandCyl',[x,h*.55,z],null,[.3,.45,.3],null);kput('hRLBandCyl',[x,h*.2,z],null,[.3,.35,.3],null);
  if(k%3===1)kput('hRLChakana',[x,h+.6,z],qEuler(0,a+Math.PI,0),[1,1,1],null);
  else if(k%3===0){const p=loc(x,z,.7,0,a+Math.PI);beam('hRLBundleC',[x,h-.1,z],[p[0],h+.15,p[1]],.05,.05,c);kput('hRLBandP',[p[0],h-.45,p[1]],qEuler(0,a+Math.PI,0),[1.1,.5,1],null);}
  else kput('vCloth',[x+Math.sin(a+1.57)*.32,h-.9,z+Math.cos(a+1.57)*.32],qEuler(0,a,0),[.2,1.4,1],hC(vPick([0xb3322a,0x2e9488,0xefe7d6,0xd19a3a])));k++;}
 for(const s of[-1,1]){hnRLPost(s*3.4,0,R*.9,.3,5.6,0,{disc:true,pennant:true});for(let j=0;j<3;j++)vPst('hRLBundle',s*2,0,R+1.8+j*1.8,.16,rr(.8,1.1),old);}
 vB('hRLMud',0,-.02,-1,3.2,.2,2,0,hC(vPick(RPAL.mud)));vB('hRLMatB',0,.18,-1,2.4,.5,1.2,0,old);
 hnRLCloth(0,.22,-.36,0,1.4,.42);for(let j=0;j<3;j++)vBall('vGourd',-.7+j*.5,.8,-.9,.12,hC(0xa08040));kput('vClayPot',[1.5,.18,-1.3],null,[.2,.4,.2],hC(0x9a5a38));
 hnRLHearth(0,2.2,.7);hnRLBrazier(-2.6,-3,.8);hnRLBrazier(2.6,-3,.8);
 if(rf)hnRLMoor(G,-2.2,rf(Math.PI/2)+.3,0,{L:4,W:1,folk:1});
 vnFolk(0,4.2,3,2.2);}

// Watchtower — four thick bundle legs lashed into a tapering frame, a mat platform under a thatch cap, a
// ladder of bundle rungs, a fire-cage and a drum; the lookout against raiders on the open water.
function buildRLWatchtower(G,o){reseed(25141+(o.v|0));const H=9,B=2.4,T=1.1,PY=6.4;
 const c=hC(vPick(RPAL.straw)),old=hC(vPick(RPAL.strawOld));vnReg('Watchtower',0,0,3.6,H+2.4);
 const rf=hnRLPad(8,8,o,15);
 const leg=(sx,sz)=>[[sx*B,0,sz*B],[sx*T,H,sz*T]];
 for(const sx of[-1,1])for(const sz of[-1,1]){const [a,b]=leg(sx,sz);beam('hRLBundleC',a,b,.36,.36,c);}
 for(const yy of[2.2,4.4,PY-.2,H-.3]){const f=yy/H;const r=lerp(B,T,f);for(const s of[-1,1]){beam('hRLBundleC',[-r,yy,s*r],[r,yy,s*r],.12,.12,old);beam('hRLBundleC',[s*r,yy,-r],[s*r,yy,r],.12,.12,old);}}
 for(const s of[-1,1]){const r0=B,r1=lerp(B,T,4.4/H);beam('hRLBundleC',[-r0,0,s*r0],[r1,4.4,s*r1],.1,.1,old);beam('hRLBundleC',[r0,0,s*r0],[-r1,4.4,s*r1],.1,.1,old);}
 const rp=lerp(B,T,PY/H)+.9;vB('hRLMatB',0,PY-.08,0,rp*2,.1,rp*2,0,c);for(let k=0;k<3;k++)kput('hRLBundleX',[0,PY-.2,-rp+.4+k*rp],null,[rp*2+.2,.12,.12],old);
 for(const s of[-1,1]){hnBambooRail([-rp,PY,s*rp],[rp,PY,s*rp],old,1);hnBambooRail([s*rp,PY,-rp],[s*rp,PY,rp],old,1);}
 kput('hRLPyrT',[0,H+.2,0],null,[rp*2+1,2.2,rp*2+1],c);vPst('hRLBundleC',0,H+2.3,0,.14,.6,old);hnRLFinial(0,H+2.6,0,0,.8);
 for(let k=0;k<Math.round(PY/.36);k++){const t=k*.36;const f=t/H;const r=lerp(B,T,f);kput('hRLBundleC',[0,t+.2,r+.12],qEuler(Math.PI/2,0,Math.PI/2),[.06,.8,.06],old);}   // ladder rungs
 hnRLCage(rp-.2,PY+1.6,rp+.2);vPst('vStave',-rp+.5,PY,-rp+.5,.3,.5,old);vB('vDarkB',-rp+.5,PY+.44,-rp+.5,.55,.06,.55,0);
 hnRLFolk(0,PY,0,1,.4);vnFolk(2.4,2.4,1,.6);hnRLSheaves(-2.8,2.4,0,2,{});
 if(rf)hnRLMoor(G,1.2,rf(Math.PI/2)+.3,0,{L:3.8,W:1});}

RL.def({key:'rl_longhouse',name:'Great mudhif',family:'Halls',tags:{type:['civic'],wealth:'civic',lit:false,landmark:true},w:30,d:36,h:12,build:buildRLLonghouse});
RL.def({key:'rl_warrior_hall',name:"Warrior's hall",family:'Halls',tags:{type:['military'],wealth:'civic',lit:false},w:32,d:32,h:9,build:buildRLWarriorHall});
RL.def({key:'rl_shaman',name:"Shaman's house",family:'Halls',tags:{type:['religious'],wealth:'middle',lit:false},w:22,d:22,h:12,build:buildRLShaman});
RL.def({key:'rl_spirit_circle',name:'Spirit circle',family:'Sacred and lookout',tags:{type:['religious'],wealth:'civic',lit:false},w:24,d:26,h:7,build:buildRLSpiritCircle});
RL.def({key:'rl_watchtower',name:'Watchtower',family:'Sacred and lookout',tags:{type:['military'],wealth:'poor',lit:false},w:12,d:12,h:13,build:buildRLWatchtower});
