// ================================================================= NORTHERN HIGHLANDS — floor
// Everything under the trees, by zone, from the same climate fields the tree
// pass reads (NHL.zones):
//   TEMPERATE  sword and lady ferns everywhere, moss mats and cushions, wood
//              sorrel, understorey shrubs; the LACE FERN here and there; the
//              dark accents where they seep in (black grass, smoke bush, dark
//              spurge, purple millet, the teal aroids); mountain cane patches;
//              a rare zebra rosette
//   GLADES     bluebell carpets, bracken, DISC STALKS (gold, amber up high)
//   THE BANKS  RED-STEM FANS, lace ferns, ferns, mossy boulders, sedge, disc
//              stalks on the gravel; stepping stones in the stream itself
//   OLD WOOD   boulder fields under moss, moss cushions, ferns, bilberry
//   MONTANE    ferns, moss, sorrel, bilberry, mushrooms
//   BOREAL     heath and bilberry, reindeer lichen, moss, fly agarics; fireweed
//              in the old burn; on the top, heath and lichen among stones
// And the fallen giants: mossed logs across the slope, saplings on their backs.
// Three LOD bands, each origin of the spine planting only its own share
// (nearest origin) so the bands never double.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=NHL.PAL,zones=NHL.zones,blocked=NHL.blocked;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);
const {bright,shade,vary,tint,means}=NHL;
const Y=(x,z)=>BIO.terrainH(x,z);
const leafCol=(set,k,dh)=>bright(vary(pick(set),dh==null?.03:dh,.1,.06),k==null?1.25:k);
const okGround=(x,z,pad)=>!blocked(x,z,pad)&&BIO.clearOf(x,z,pad);

// ---------------------------------------------------------------- small plants
function frondCrown(item,x,y,z,Rf,n,p0,p1,col,c2){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25),L=Rf*rr(.8,1.1);BIO.put(item,[x,y,z],qEuler(rr(-.18,.18),-a,rr(p0,p1)),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],bright(col,rr(.86,1.1)),c2?{c2}:null);}}
function swordFern(x,y,z,lv,k){const hc=vary(pick(PAL.fern),.03,.1,.06);frondCrown('frond',x,y-.1,z,rr(1.1,1.9)*(k||1),lv===2?ri(6,9):lv===1?4:3,.15,.7,bright(hc,1.55));}
function ladyFern(x,y,z,lv){const hc=vary(pick(PAL.fern),.03,.1,.06).lerp(C(0x7aa040),.3);frondCrown('lady',x,y-.1,z,rr(.8,1.4),lv===2?ri(6,9):4,.35,.9,bright(hc,1.6));}
function laceFern(x,y,z,lv){const hc=vary(pick(PAL.lace),.02,.06,.04);frondCrown('lace',x,y-.05,z,rr(.7,1.3),lv===2?ri(5,8):3,.2,.75,bright(hc,1.3),bright(C(pick(PAL.irid.LG)),1.2));}
function bracken(x,y,z,lv){const n=lv===2?ri(2,5):2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.2),h=rr(.5,1.1),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
 if(lv===2)BIO.beam('rod',[px,y,pz],[px,y+h,pz],.012,.008,C(0x5a6a3a));BIO.put('bracken',[px,y+h,pz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),rr(1,1.6),leafCol([0x5a8a32,0x6a9a3a,0x4e7a2c],1.3));}}
function mossMat(x,y,z,r,set){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[r,1,r],leafCol(set||PAL.moss,.95,.03));}
function mossCushion(x,y,z,R,set){BIO.put('cushion',[x,y+R*.15,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.45,.7),R],bright(vary(pick(set||PAL.moss),.03,.08,.06),rr(.95,1.2)));}
function sorrel(x,y,z,lv){const n=lv===2?ri(4,9):2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1),s=rr(.25,.45);BIO.put('sorrel',[x+Math.cos(a)*d,y+.08,z+Math.sin(a)*d],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),s,leafCol([0x6aa040,0x78b048,0x5a9038],1.3));}}
function shrub(x,y,z,lv,set){BIO.put('ucard',[x,y+.5,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[rr(1.2,2),rr(.8,1.2),rr(1.2,2)],leafCol(set||PAL.broad,1.35));}
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[w||h*.8,h,w||h*.8],col);}
function grass(x,y,z,lv,set,k){const h=rr(.4,.9)*(k||1)*(lv===0?1.6:1);tuft('blade',x,y,z,h,h*1.3,leafCol(set||[0x6a8a3a,0x7a9a40,0x5a7a34],1.25));}
function heath(x,y,z,lv){const h=rr(.25,.5),n=lv===2?ri(2,4):1;for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1.2):0;tuft('heath',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*2.2,leafCol([0x3a5a2e,0x44602e,0x4a4a3a,0x3e4e34],1.2));}
 if(lv===2&&rng()<.45)for(let b=0;b<6;b++)BIO.put('berry',[x+rr(-.6,.6),y+h*rr(.4,.9),z+rr(-.6,.6)],null,rr(.035,.05),bright(C(pick(PAL.bilberry)),1.1));}
function lichen(x,y,z,lv){const n=lv===2?ri(2,4):1;for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,.9),R=rr(.4,.9);BIO.put('mossmat',[x+Math.cos(a)*d,y+.08,z+Math.sin(a)*d],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[R,1,R],bright(vary(pick(PAL.lichen),.02,.05,.05),1.1));}}
// past the near band a cap is under a pixel: two stand for the troop
function mushrooms(x,y,z,lv,n,r,set){if(lv<2)n=Math.min(n,2);for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.08,.24);BIO.put('mushroom',[px,Y(px,pz)-.02,pz],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[h,h,h],bright(C(pick(set||PAL.mush)),1.05));}}
function bluebells(x,y,z,lv,n){for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,2.2)*Math.sqrt(rng()),h=rr(.28,.45);tuft('bell',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*1.2,leafCol(PAL.bluebell,1.15,.02));}}
// DISC STALKS: a clump of slender stalks, each topped with a ribbed gold disc, tilted a little to the light
function discStalks(x,y,z,lv,cold){const n=lv===2?ri(4,12):lv===1?3:2,amber=smooth(.4,.8,cold);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.2)*Math.sqrt(rng()),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=Y(px,pz),h=rr(1,2.6),lean=rr(-.12,.12),tx=px+lean*h,tz=pz+rr(-.12,.12)*h;
  if(lv>=1)BIO.beam('rod',[px,py-.05,pz],[tx,py+h,tz],.03,.018,bright(C(0x8a4a3a),1));
  const col=C(pick(PAL.disc)).lerp(C(0xc8702a),amber*.6);BIO.put('disc',[tx,py+h,tz],qEuler(rr(-.35,.35),rr(0,TAU),rr(-.35,.35)),rr(.22,.5),bright(col,1.1));}}
// RED-STEM FANS: round pleated fans on dark-red petioles, by the water
function pleatFans(x,y,z,lv){const n=lv===2?ri(3,8):lv===1?2:1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,.7),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(.5,1.5),ex=px+Math.cos(a)*h*.3,ez=pz+Math.sin(a)*h*.3,R=rr(.3,.7);
  if(lv>=1)BIO.beam('rod',[px,y-.05,pz],[ex,y+h,ez],.022,.016,bright(C(pick(PAL.fanRed)),1.05));
  BIO.put('pleat',[ex,y+h,ez],qEuler(rr(.35,.9)*(rng()<.5?-1:1),rr(0,TAU),rr(-.3,.3)),[R,R,R],bright(vary(pick(PAL.fanGreen),.02,.06,.05),1.1));}}
// THE DARK ACCENTS
function darkAccent(x,y,z,lv,st){const t=rng();
 if(t<.28){const n=lv===2?ri(3,7):2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.2),h=rr(.25,.45);tuft('mondo',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*1.6,bright(vary(pick(PAL.violet),.02,.05,.03),1.05));}}
 else if(t<.46){const R=rr(.7,1.5);BIO.put('smoke',[x,y+R*.4,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.75,.95),R],bright(vary(pick(PAL.plum),.02,.06,.04),1.1));}
 else if(t<.62){const n=lv===2?ri(3,6):2;for(let i=0;i<n;i++){const a=rr(0,TAU),L=rr(.9,1.6);BIO.put('paddle',[x+rr(-.3,.3),y,z+rr(-.3,.3)],qEuler(rr(-.55,-.15),a,rr(-.2,.2)),[L*.6,L,L],bright(vary(pick(PAL.tealDark),.02,.06,.04),1.15),{n:[Math.cos(a)*.4,.8,Math.sin(a)*.4]});}}
 else if(t<.78){const h=rr(.4,.7);tuft('spurge',x,y,z,h,h*1.6,bright(vary(pick(PAL.spurge),.02,.05,.04),1.1));if(lv===2)for(let b=0;b<5;b++)BIO.put('berry',[x+rr(-.35,.35),y+h*rr(.85,1.05),z+rr(-.35,.35)],null,rr(.07,.11),bright(C(0xb8d040),1.1));}
 else{const n=lv===2?ri(3,6):2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,.9),h=rr(.9,1.6);tuft('spike',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*.7,bright(vary(pick(PAL.plum),.02,.05,.04),1.15));}}
 st.dark++;}
function zebra(x,y,z){const h=rr(.5,.9);tuft('zebra',x,y,z,h,h*1.2,bright(C(0xf0f0e8),1));}
function cane(x,y,z,lv,st){const n=lv===2?ri(8,18):4,hc=C(0x5a8a3a);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.4)*Math.sqrt(rng()),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,h=rr(2,4.2),lean=rr(-.15,.15),tx=px+lean*h,tz=pz+rr(-.15,.15)*h;
  BIO.beam('cane',[px,y-.1,pz],[tx,y+h,tz],.035,.025,bright(C(pick([0x8aa04a,0x7a9440,0x9aaa58])),1.05));
  if(lv>=1)for(let k=0;k<(lv===2?3:1);k++){const u=rr(.5,1);BIO.put('lance',[px+(tx-px)*u,y+h*u,pz+(tz-pz)*u],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[rr(.8,1.3),rr(.4,.6),rr(.8,1.3)],bright(vary(hc,.02,.06,.05),1.2),{n:[0,1,0]});}}
 st.cane++;}
function boulder(x,y,z,lv,st,big,mossK){const s=(big?rr(1.4,3.6):rr(.5,1.4)),it=rng()<.5?'boulderA':'boulderB';
 BIO.put(it,[x,y-s*.3,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*rr(.9,1.3),s*rr(.6,.9),s*rr(.9,1.3)],tint(vary(pick(PAL.rock),.02,.04,.05),means().rock,rr(.5,.7)));st.boulders++;
 const mk=mossK==null?.75:mossK;
 if(rng()<mk){mossCushion(x+rr(-.2,.2)*s,y+s*.45,z+rr(-.2,.2)*s,s*rr(.75,1.1));st.moss++;}
 if(lv===2&&rng()<mk*.6){swordFern(x+rr(-1,1)*s,Y(x,z),z+rr(-1,1)*s,lv,.8);}}
// a FALLEN GIANT across the slope: a mossed log, its root plate, saplings on its back (the nurse log)
function log(x,y,z,st,cold){const a=rr(0,TAU),L=rr(12,34),r=rr(.5,1.3),n=Math.max(3,Math.round(L/4)),pts=[];
 for(let i=0;i<=n;i++){const t=i/n,px=x+Math.cos(a)*L*(t-.5),pz=z+Math.sin(a)*L*(t-.5);if(BIO.mask(px,pz)<.2)return false;pts.push({x:px,y:Y(px,pz)+r*.55,z:pz,r:r*(1-.35*t)});}
 for(let i=1;i<pts.length;i++)if(Math.abs(pts[i].y-pts[i-1].y)>L/n*.7)return false;
 const mc=tint(vary(pick(PAL.moss),.03,.06,.05),means().wood,.95),wc=tint(C(0x6a5a46),means().wood,1);
 pts.forEach((p,i)=>{p.col=wc.clone().lerp(mc,clamp(.45+.35*Math.sin(i*1.7),0,.85));});
 BIO.tube('nwood',pts,wc,{seg:7,cap:true});
 // the root plate at the foot: a ragged disc of roots and earth
 const p0=pts[0],R0=r*rr(2.2,3.2);BIO.put('boulderB',[p0.x-Math.cos(a)*r*.6,Y(p0.x,p0.z)-R0*.4,p0.z-Math.sin(a)*r*.6],qEuler(0,-a,0),[R0*.35,R0*1.1,R0],C(0x4a3e30));
 for(let i=1;i<n;i++){const p=pts[i];BIO.put('mossmat',[p.x,p.y+p.r*.8,p.z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[p.r*1.6,1,p.r*1.6],bright(vary(pick(PAL.moss),.03,.08,.05),.95));
  if(rng()<.35){const h=rr(1.2,3.5);BIO.put('trunk',[p.x,p.y+p.r*.7,p.z],null,[h*.04+.05,h,h*.04+.05],C(0x6a5040));BIO.put('needle',[p.x,p.y+p.r*.7+h*.75,p.z],qEuler(0,rr(0,TAU),0),[h*.35,h*.5,h*.35],bright(vary(pick(PAL.conifer),.02,.06,.05),1.2),{n:[0,1,0]});}
  else if(rng()<.3)swordFern(p.x,p.y+p.r*.6,p.z,2,.7);
  if(rng()<.2)mushrooms(p.x,p.y+p.r*.3,p.z,2,ri(2,5),.4,cold>.5?[0xc8281e,0xd8a040]:[0xd8a040,0xe8dcc8,0x8a4a2a]);}
 st.logs++;return true;}

// ---------------------------------------------------------------- the zone planters
function plantTemperate(x,y,z,Z,lv,st){const t=rng();
 if(Z.dark>.2&&rng()<Z.dark*.38){darkAccent(x,y,z,lv,st);return;}
 if(Z.cane>.3&&rng()<Z.cane*.6){cane(x,y,z,lv,st);return;}
 if(t<.30){swordFern(x,y,z,lv);st.ferns++;if(lv===2&&rng()<.5)swordFern(x+rr(-1.6,1.6),y,z+rr(-1.6,1.6),lv,.8);}
 else if(t<.40){ladyFern(x,y,z,lv);st.ferns++;}
 else if(t<.52){if(lv>=1){mossMat(x,y,z,rr(1,2.4));if(rng()<.5)mossCushion(x+rr(-1,1),y,z+rr(-1,1),rr(.4,.9));st.moss++;}else{swordFern(x,y,z,lv);st.ferns++;}}
 else if(t<.58){sorrel(x,y,z,lv);st.sorrel++;}
 else if(t<.63){laceFern(x,y,z,lv);st.lace++;}
 else if(t<.70){shrub(x,y,z,lv);st.shrubs++;}
 else if(t<.75){grass(x,y,z,lv);st.tufts++;}
 else if(t<.78){mushrooms(x,y,z,lv,ri(2,6),.8,[0xd8a040,0xe8dcc8,0x8a4a2a]);st.mush++;}
 else if(t<.785){zebra(x,y,z);st.zebra++;}
 else if(t<.86){swordFern(x,y,z,lv,1.2);st.ferns++;}
 else if(t<.93){boulder(x,y,z,lv,st,false);}
 else{ladyFern(x,y,z,lv);st.ferns++;}}
function plantGlade(x,y,z,Z,lv,st){const t=rng();
 if(Z.boreal>.5){if(t<.4){const n=lv===2?ri(3,7):2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.4),h=rr(.9,1.5);tuft('spike',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*.7,bright(vary(pick(PAL.fireweed),.02,.05,.04),1.15));}st.spikes++;}
  else if(t<.6){discStalks(x,y,z,lv,Z.cold);st.discs++;}else if(t<.85){grass(x,y,z,lv);st.tufts++;}else{heath(x,y,z,lv);st.heath++;}return;}
 if(t<.36){bluebells(x,y,z,lv,lv===2?ri(6,14):lv===1?4:2);st.bells++;}
 else if(t<.52){bracken(x,y,z,lv);st.bracken++;}
 else if(t<.64){discStalks(x,y,z,lv,Z.cold);st.discs++;}
 else if(t<.80){grass(x,y,z,lv,[0x7a9a40,0x8aaa48,0x6a8a38]);st.tufts++;}
 else if(t<.88){swordFern(x,y,z,lv);st.ferns++;}
 else if(t<.94){laceFern(x,y,z,lv);st.lace++;}
 else{darkAccent(x,y,z,lv,st);}}
function plantBank(x,y,z,Z,lv,st){const t=rng();
 if(t<.24){pleatFans(x,y,z,lv);st.fans++;}
 else if(t<.38){laceFern(x,y,z,lv);st.lace++;}
 else if(t<.50){swordFern(x,y,z,lv);st.ferns++;}
 else if(t<.62){boulder(x,y,z,lv,st,rng()<.4,.9);}
 else if(t<.72){grass(x,y,z,lv,[0x5a8a3a,0x6a9a40,0x4e7a34],1.3);st.tufts++;}
 else if(t<.80){if(Z.flow>.8){discStalks(x,y,z,lv,Z.cold);st.discs++;}else{ladyFern(x,y,z,lv);st.ferns++;}}
 else if(t<.88){if(lv>=1){mossMat(x,y,z,rr(1,2.2));mossCushion(x,y,z,rr(.5,1));st.moss++;}}
 else if(t<.94){darkAccent(x,y,z,lv,st);}
 else{shrub(x,y,z,lv);st.shrubs++;}}
function plantOldwood(x,y,z,Z,lv,st){const t=rng();
 if(t<.30){boulder(x,y,z,lv,st,true,.95);}
 else if(t<.44){if(lv>=1){mossCushion(x,y,z,rr(.6,1.6));mossMat(x+rr(-1,1),y,z+rr(-1,1),rr(1,2));st.moss++;}}
 else if(t<.62){swordFern(x,y,z,lv);st.ferns++;}
 else if(t<.72){heath(x,y,z,lv);st.heath++;}
 else if(t<.80){sorrel(x,y,z,lv);st.sorrel++;}
 else if(t<.86){laceFern(x,y,z,lv);st.lace++;}
 else if(t<.92){ladyFern(x,y,z,lv);st.ferns++;}
 else boulder(x,y,z,lv,st,false,.9);}
function plantMontane(x,y,z,Z,lv,st){const t=rng();
 if(Z.dark>.3&&rng()<Z.dark*.2){darkAccent(x,y,z,lv,st);return;}
 if(t<.26){swordFern(x,y,z,lv);st.ferns++;}
 else if(t<.38){ladyFern(x,y,z,lv);st.ferns++;}
 else if(t<.52){if(lv>=1){mossMat(x,y,z,rr(1,2.2));st.moss++;}}
 else if(t<.62){sorrel(x,y,z,lv);st.sorrel++;}
 else if(t<.74){heath(x,y,z,lv);st.heath++;}
 else if(t<.80){mushrooms(x,y,z,lv,ri(2,5),.8);st.mush++;}
 else if(t<.86){grass(x,y,z,lv);st.tufts++;}
 else if(t<.89){laceFern(x,y,z,lv);st.lace++;}
 else boulder(x,y,z,lv,st,false);}
function plantBoreal(x,y,z,Z,lv,st){const t=rng();
 if(Z.burn>.3&&rng()<Z.burn*.65){const n=lv===2?ri(3,7):2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=rr(0,1.4),h=rr(.9,1.6);tuft('spike',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*.7,bright(vary(pick(PAL.fireweed),.02,.05,.04),1.15));}if(rng()<.4)grass(x,y,z,lv,[0x8a9a48,0x9aaa50]);st.spikes++;return;}
 if(t<.34){heath(x,y,z,lv);st.heath++;}
 else if(t<.48){lichen(x,y,z,lv);st.lichen++;}
 else if(t<.62){if(lv>=1){mossMat(x,y,z,rr(1,2),PAL.mossDark);st.moss++;}}
 else if(t<.70){mushrooms(x,y,z,lv,ri(1,4),.7,[0xc8281e,0xc8281e,0xd8a040]);st.mush++;}
 else if(t<.80){grass(x,y,z,lv,[0x6a7a3a,0x7a8a40,0x5a6a34]);st.tufts++;}
 else if(t<.88){swordFern(x,y,z,lv,.8);st.ferns++;}
 else if(t<.94)boulder(x,y,z,lv,st,rng()<.3,.5);else{lichen(x,y,z,lv);st.lichen++;}}
// THE FAR FLOOR (lv 0, past ~950 m of the spine): only what still reads from there, as a speckle over the ground's
// paint: ferns, shrubs, bracken in the glades, boulders and their moss, the smoke bush's dark patches. The small
// things (mushrooms, sorrel, bluebells, discs, grass, heath and lichen tufts, canes) are under a pixel at that range,
// and every item a band carries is one more draw call in every chunk it is drawn in: this band is drawn out to 2.4 km.
function plantFar(x,y,z,Z,st){const t=rng();
 if(Z.boreal*(1-Z.glade)>.5){if(t<.22)boulder(x,y,z,0,st,rng()<.3,.5);else if(t<.42){swordFern(x,y,z,0,.8);st.ferns++;}return;}   // up high the paint is the floor (heath, lichen): a few stones and ferns
 if(Z.glade>.4){if(t<.45){bracken(x,y,z,0);st.bracken++;}else if(t<.72){swordFern(x,y,z,0);st.ferns++;}else if(t<.82){shrub(x,y,z,0);st.shrubs++;}return;}
 if(Z.dark>.3&&t<Z.dark*.3){const R=rr(.7,1.5);BIO.put('smoke',[x,y+R*.4,z],qEuler(0,rr(0,TAU),0),[R,R*rr(.75,.95),R],bright(vary(pick(PAL.plum),.02,.06,.04),1.1));st.dark++;return;}
 if(t<(Z.oldwood>.4?.4:Z.rip>.4?.3:.12)){boulder(x,y,z,0,st,Z.oldwood>.4||rng()<.3,.85);return;}
 if(t<.62){swordFern(x,y,z,0,rng()<.3?1.2:1);st.ferns++;}
 else if(t<.78){ladyFern(x,y,z,0);st.ferns++;}
 else{shrub(x,y,z,0);st.shrubs++;}}
function plantAlpine(x,y,z,Z,lv,st){const t=rng();
 if(t<.38){heath(x,y,z,lv);st.heath++;}else if(t<.62){lichen(x,y,z,lv);st.lichen++;}else if(t<.82){grass(x,y,z,lv,[0x7a8458,0x8a9460],.7);st.tufts++;}else if(t<.88)boulder(x,y,z,lv,st,rng()<.3,.3);}

// ---------------------------------------------------------------- the pass
NHL.buildFloor=function(R,q,box){
 reseed(600031);q=q==null?1:q;R=R||3300;means();
 const st={ferns:0,lace:0,moss:0,sorrel:0,shrubs:0,tufts:0,mush:0,zebra:0,boulders:0,bells:0,bracken:0,discs:0,fans:0,heath:0,lichen:0,spikes:0,dark:0,cane:0,logs:0,stones:0};
 function plant(x,y,z,lv){if(!okGround(x,z,.8))return;const Z=zones(x,z);
  if(lv===0){plantFar(x,y,z,Z,st);return;}
  const w=[Z.temperate*(1-Z.glade)*(1-Z.oldwood)*(1-Z.rip),Z.glade*1.2,Z.rip*1.6,Z.oldwood*1.4,Z.montane*(1-Z.glade)*(1-Z.oldwood)*(1-Z.rip),Z.boreal*(1-Z.alpine)*(1-Z.glade)*(1-Z.rip),Z.alpine],P=[plantTemperate,plantGlade,plantBank,plantOldwood,plantMontane,plantBoreal,plantAlpine];
  let tot=0;for(const v of w)tot+=v;if(tot<=0)return;
  let r=rng()*tot,k=0;for(;k<w.length;k++){if(r<w[k])break;r-=w[k];}if(k>=w.length)k=w.length-1;
  P[k](x,y,z,Z,lv,st);}
 // the bands: each origin plants the cells it is nearest to
 const O=BIO.host.origin,nearest=(x,z)=>{let b=0,bd=1e18;for(let i=0;i<O.length;i++){const d=(x-O[i][0])**2+(z-O[i][1])**2;if(d<bd){bd=d;b=i;}}return b;};
 const bands=[[5.6,320,0],[13,900,320]];
 BIO.range=NHL.LOD.floor;
 bands.forEach((b,bi)=>{const lv=2-bi;O.forEach((o,oi)=>{
  BIO.grid(b[0],0,1e9,(x,z)=>{if(nearest(x,z)!==oi)return 0;const ld=Math.hypot(x-o[0],z-o[1]);if(ld>=b[1]||ld<b[2])return 0;return .82*q*(lv===1?.85:1);},(x,y,z)=>plant(x,y,z,lv),
   {patch:.7,patchScale:.014,pad:.6,center:[0,0],box:[o[0]-b[1],o[1]-b[1],o[0]+b[1],o[1]+b[1]]});});});
 BIO.range=NHL.LOD.farFloor;
 BIO.grid(30,0,R*1.42,(x,z)=>{if(BIO.lodD(x,z)<950)return 0;return .55*q;},(x,y,z)=>plant(x,y,z,0),{patch:.7,patchScale:.014,pad:.6,box});
 BIO.range=NHL.LOD.floor;
 // stepping stones in the stream: mossy boulders standing in the water (the depth window)
 O.forEach((o,oi)=>{BIO.grid(5,0,1e9,(x,z)=>{if(nearest(x,z)!==oi||Math.hypot(x-o[0],z-o[1])>900)return 0;return .16*q;},
  (x,y,z)=>{const s=rr(.5,1.6);BIO.put(rng()<.5?'boulderA':'boulderB',[x,y-s*.25,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*rr(.9,1.3),s*rr(.7,1),s*rr(.9,1.3)],tint(vary(pick(PAL.rock),.02,.04,.05),means().rock,.45));
   if(rng()<.55)BIO.put('mossmat',[x,y+s*.5,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s*.8,1,s*.8],bright(vary(pick(PAL.moss),.03,.08,.05),.95));st.stones++;},
  {patch:.4,patchScale:.03,noMask:true,depth:[.15,1.6],pad:.3,center:[0,0],box:[o[0]-900,o[1]-900,o[0]+900,o[1]+900]});});
 BIO.range=NHL.LOD.logs;
 // the fallen giants: across the temperate and montane slopes, more in the old wood
 BIO.grid(85,0,R*1.42,(x,z)=>{if(BIO.lodD(x,z)>1200)return 0;const Z=zones(x,z);return (Z.temperate*.75+Z.montane*.5+Z.oldwood*.4+Z.boreal*.2)*(1-Z.rip)*q;},(x,y,z)=>{const c=BIO.field('cold',x,z);for(let t=0;t<4;t++)if(log(x+rr(-20,20),y,z+rr(-20,20),st,c))break;},{patch:0,pad:2,box});
 BIO.range=null;
 return{under:st};};
})();
