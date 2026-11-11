// ================================================================= THE RIFT RIM — floor
// Everything under the trees, by zone and rim, from the same fields the tree pass reads (RRIM.zones):
//   N  the glass forest's floor: starberry, prism heath (teal-orange), lenswort carpets on the open rock, moss; at the lakes sedge,
//      glass-cane groves standing in the shallows and the algal domes under them
//   S  the black barrens: sun rosettes all facing the sun, sailwort slopes edge-on to the wind, cushion anemones, rimroot in the hollows,
//      prism heath (rust-magenta), reindeer lichen, boulder fields in iris lichen; snowblood is the snow's own layer (45)
//   W  the cloud belt: mist cups, moor-sponge cushions on the flats, prism heath (gold-magenta), sedge and cotton grass in the bogs;
//      veil thread hung off the boulders; the basin plain's grass and Dalab's fields (the farm field)
//   all three: tussock and grass by wetness, stones and boulders on the rock, by height
// Three LOD bands along the spine (near / mid / far) at 8 / 16 / 32 m cells, then the lake shallows and the boulder fields.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=RRIM.PAL,zones=RRIM.zones,C=RRIM.C;
const {bright,shade,vary,tint,means,leafCol}=RRIM;
const Y=(x,z)=>BIO.terrainH(x,z);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.45,.7):k);
const blocked=(x,z,pad)=>RRIM.blocked(x,z,pad);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
function tuft(item,x,z,h,w,col,tilt){const t=tilt==null?.06:tilt;BIO.put(item,[x,Y(x,z)-.05,z],qEuler(rr(-t,t),rr(0,TAU),rr(-t,t)),[w==null?h*.9:w,h,w==null?h*.9:w],col);}
// the sun's bearing (the host's BIO.setSun): the sun rosettes face it, all one way; the wind's (RRIM.WIND, the land's): the sailwort turn edge-on
const sunDir=()=>{const v=BIO.SUN&&BIO.SUN.value;const s=v?[v.x,v.y,v.z]:[-.6,.65,-.35],l=Math.hypot(s[0],s[1],s[2])||1;return[s[0]/l,s[1]/l,s[2]/l];};
const HEATH={n:PAL.heathN,s:PAL.heathS,w:PAL.heathW};

// ---------------------------------------------------------------- small plants
const heath=(x,z,lv,k)=>{around(x,z,lv===2?ri(2,4):1,.4,1.3,(px,pz)=>tuft('heath',px,pz,rr(.35,.7)*(k||1),rr(.7,1.2)*(k||1),leafCol(HEATH[RRIM.rim]||PAL.heathN,1.1,.03,.1,.08)));};
const grass=(x,z,lv,dry)=>{const it=dry?'tussock':'grass';around(x,z,lv===2?ri(2,4):1,.3,1.1,(px,pz)=>tuft(it,px,pz,rr(.4,.9),null,leafCol(dry?PAL.dry:PAL.grass,1.05,.03,.1,.08)));};
const sedge=(x,z,lv)=>{around(x,z,lv===2?ri(2,3):1,.3,.9,(px,pz)=>tuft(rng()<.25&&RRIM.rim!=='n'?'cotton':'sedge',px,pz,rr(.5,1.1),null,leafCol(PAL.sedge,1.05,.03,.08,.06)));};
function stone(x,z,set,big){const y=Y(x,z),r=(big?rr(.6,1.6):rr(.12,.4))*(.7+.6*rng());BIO.put(big?'boulder':'stone',[x,y+r*.1,z],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),[r*rr(.9,1.4),r*.65,r],rockTint(set));return r;}
// N
function starberry(x,z,lv,st){const s=rr(.4,.75);tuft('berry',x,z,s,s*1.2,bright(vary(0xf4f8f6,.02,.04,.05),1));
 if(lv===2&&rng()<.6)for(let k=0,m=ri(2,5);k<m;k++){const a=rr(0,TAU),d=rr(.1,.35)*s;BIO.put('fruit',[x+Math.cos(a)*d,Y(x,z)+s*rr(.35,.7),z+Math.sin(a)*d],null,rr(.025,.04),rng()<.6?0x7a3aa8:0x3a9a8a);st.fruit++;}}
function lenswort(x,z,lv){around(x,z,lv===2?ri(2,4):1,.25,.7,(px,pz)=>{const s=rr(.08,.16);BIO.put('lens',[px,Y(px,pz)-.01,pz],qEuler(0,rr(0,TAU),0),[s,s*rr(.8,1.1),s],bright(vary(pick(PAL.lens),.03,.06,.06),1.2));});}
// S
function rosette(x,z,lv){const s=rr(1,2)*(lv===2?1:.9),d=sunDir(),y=Y(x,z)+.08,tilt=.55;   /* all of a field face the sun (the plan: "in a field they all face one way") */
 const n=[d[0]*tilt,1,d[2]*tilt];BIO.put('rosette',[x,y,z],qUp(n),[s,1,s],bright(vary(0xf2ecf4,.02,.04,.05),1));   /* the card's own black-violet (keep 1) */}
function sailwort(x,z,lv,st){const w=RRIM.WIND||[1,0],a=Math.atan2(w[1],w[0]);   /* each membrane turned edge-on to the wind: its plane holds the wind's line */
 around(x,z,lv===2?ri(2,4):1,.8,2.2,(px,pz)=>{const h=rr(1,2),y=Y(px,pz);BIO.beam('rod',[px,y-.1,pz],[px,y+h*.45,pz],.025,.018,0x6a4a34);
  BIO.put('sail',[px,y+h*.3,pz],qEuler(rr(-.06,.06),-a+rr(-.12,.12),rr(-.08,.08)),[h*.5,h*.75,1],leafCol(PAL.sail,1.3,.03,.08,.08));st.sails++;});}
function anemone(x,z,lv){const s=rr(.4,.9),y=Y(x,z);BIO.put('cushion',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[s*.55,s*.35,s*.55],bright(pick(PAL.anemone),.9));
 tuft('anemone',x,z,s*.65,s*1.05,bright(vary(0xffffff,.01,.02,.04),1));}
function rimroot(x,z,lv){const y=Y(x,z),n=lv===2?ri(4,6):3,a0=rr(0,TAU),L=rr(.6,1.1);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU,d=L*.42;BIO.put('rheum',[x+Math.cos(a)*d,y+.12,z+Math.sin(a)*d],qUp([Math.cos(a)*.35,1,Math.sin(a)*.35]),[L,1,L],leafCol(PAL.rheum,1.2,.02,.06,.06));}
 const h=rr(.9,1.6);BIO.put('bract',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[h*.32,h,h*.32],bright(pick(PAL.rheumBract),1.1));}
function cladonia(x,z,lv){around(x,z,lv===2?ri(1,3):1,.3,.8,(px,pz)=>{const s=rr(.18,.4);tuft('clad',px,pz,s,s*1.6,bright(vary(0xffffff,.01,.02,.03),1),.02);});}
// W
function mistcup(x,z,lv){const s=rr(.45,.85);tuft('cup',x,z,s*.7,s,bright(vary(0xffffff,.01,.02,.04),1),.04);}
function sponge(x,z,lv){around(x,z,lv===2?ri(2,4):1,.3,1.2,(px,pz)=>{const s=rr(.3,.8);BIO.put('sponge',[px,Y(px,pz)-.08,pz],qEuler(0,rr(0,TAU),0),[s,s*.35,s],bright(vary(pick(PAL.sponge),.03,.08,.06),.95));});}
function crop(x,z,lv){around(x,z,lv===2?ri(3,5):2,.3,.9,(px,pz)=>tuft('crop',px,pz,rr(.6,1),rr(.5,.8),leafCol(PAL.crop,1.05,.02,.06,.05)));}

// ---------------------------------------------------------------- the zone planters, by rim: (x,z,Z,lv,st)
function plantN(x,z,Z,lv,st){const t=rng(),up=Z.alpine;
 if(Z.lake>.45&&t<.5){sedge(x,z,lv);st.sedge++;return;}
 if(t<.24){starberry(x,z,lv,st);st.berries++;}
 else if(t<.46){heath(x,z,lv);st.heath++;}
 else if(t<.62+.2*up){lenswort(x,z,lv);st.lens++;}
 else if(t<.8){grass(x,z,lv,up>.4);st.grass++;}
 else if(t<.88){cladonia(x,z,lv);st.lichen++;}
 else{stone(x,z,PAL.rock,rng()<.15);st.stones++;}}
function plantS(x,z,Z,lv,st){const t=rng(),hol=Z.gentle*smooth(.55,.75,Z.wet);
 if(Z.montane>.5&&t<.25){rimroot(x,z,lv);st.rimroot++;return;}
 if(t<.24){rosette(x,z,lv);st.rosettes++;}
 else if(t<.38){sailwort(x,z,lv,st);}
 else if(t<.52){anemone(x,z,lv);st.anemones++;}
 else if(t<.58+.1*hol){rimroot(x,z,lv);st.rimroot++;}
 else if(t<.7){heath(x,z,lv,.8);st.heath++;}
 else if(t<.8){cladonia(x,z,lv);st.lichen++;}
 else if(t<.88){grass(x,z,lv,true);st.grass++;}
 else{stone(x,z,PAL.rockBlack,rng()<.2);st.stones++;}}
function plantW(x,z,Z,lv,st){const t=rng();
 if(Z.farm>.5){crop(x,z,lv);st.crops++;return;}
 if(Z.shore>.5){if(t<.6){grass(x,z,lv,false);st.grass++;}else if(t<.75){heath(x,z,lv,.8);st.heath++;}else if(Z.lake>.4){sedge(x,z,lv);st.sedge++;}else{stone(x,z,PAL.rockCopper,false);st.stones++;}return;}
 const bog=Z.gentle*smooth(.5,.8,Z.wet)*smooth(.2,.6,Z.fog);
 if(t<.2+.25*bog){sponge(x,z,lv);st.sponge++;}
 else if(t<.38){mistcup(x,z,lv);st.cups++;}
 else if(t<.52){heath(x,z,lv);st.heath++;}
 else if(t<.66+.1*bog){sedge(x,z,lv);st.sedge++;}
 else if(t<.86){grass(x,z,lv,Z.alpine>.4);st.grass++;}
 else{stone(x,z,PAL.rockCopper,rng()<.12);st.stones++;}}
const PLANT={n:plantN,s:plantS,w:plantW};

// ---------------------------------------------------------------- the pass
RRIM.buildFloor=function(R,q){reseed(800031);q=q==null?1:q;R=R||3000;means();
 const st={sedge:0,berries:0,fruit:0,heath:0,lens:0,grass:0,lichen:0,stones:0,boulders:0,rosettes:0,sails:0,anemones:0,rimroot:0,sponge:0,cups:0,crops:0,canes:0,domes:0,veils:0,irisRocks:0};
 const planter=PLANT[RRIM.rim]||plantN;
 function plant(x,z,lv){if(blocked(x,z,.6))return;const Z=zones(x,z);if(Z.ice>.6||Z.live<.2)return;planter(x,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[8,L.floor[0],0],[16,L.floor[1],L.floor[0]],[32,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const Z=zones(x,z);return .7*q*(lv===0?.5:1)*clamp(Z.live*(1-Z.ice),0,1);},
   (x,y,z)=>plant(x,z,lv),{patch:.55,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // THE SHALLOWS: sedge at every rim's lake edge; on the N rim the glass canes standing in 0.2-1.6 m of water, the algal domes under them
 BIO.grid(7,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.mid)return 0;return .5*q*smooth(1.2,.2,BIO.depth(x,z));},
  (x,y,z)=>{const lv=BIO.lodD(x,z)<L.floor[0]*1.2?2:1,w=BIO.waterH(x,z);around(x,z,lv===2?3:1,.3,1,(px,pz)=>{BIO.put('sedge',[px,Math.max(Y(px,pz),w-.35),pz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[rr(.6,1),rr(.8,1.4),rr(.6,1)],leafCol(PAL.sedge,1.05,.03,.08,.06));});st.sedge++;},
  {patch:.6,patchScale:.03,noMask:true,depth:[-.1,.8],pad:1,box:BIO.window('water')});
 if(RRIM.rim==='n'){
  BIO.grid(6,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.mid)return 0;const d=BIO.depth(x,z);return .55*q*smooth(.15,.35,d)*smooth(1.8,1.2,d)*smooth(.45,.6,fbm(x*.012,z*.012,9101,2));},
   (x,y,z)=>{const lv=BIO.lodD(x,z)<L.floor[0]*1.4?2:1,w=BIO.waterH(x,z),n=lv===2?ri(5,11):ri(2,4);
    for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.3,2.2):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,g=Y(px,pz);if(w-g<.05)continue;
     const h=rr(3,6),r=rr(.035,.06),lean=rr(-.06,.06);BIO.put('cane',[px,g-.2,pz],qEuler(lean,rr(0,TAU),lean),[r*2,h+.2,r*2],bright(vary(pick(PAL.cane),.02,.04,.04),1.05));
     if(lv===2)for(let j=1;j<4;j++)BIO.put('canejoint',[px+lean*h*j/4*.5,g+h*j/4,pz],null,[r*2.3,.06,r*2.3],pick(PAL.caneJoint));st.canes++;}},
   {patch:.4,patchScale:.02,noMask:true,depth:[.15,1.8],pad:.6,box:BIO.window('water')});
  BIO.grid(5,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.floor[1])return 0;const d=BIO.depth(x,z);return .5*q*smooth(.1,.4,d)*smooth(2.6,1.6,d);},
   (x,y,z)=>{const s=rr(.4,1.3),g=Y(x,z);BIO.put('dome',[x,g-.1,z],qEuler(0,rr(0,TAU),0),[s,s*rr(.3,.55),s],bright(vary(pick(PAL.algal),.02,.06,.06),.9));st.domes++;},
   {patch:.5,patchScale:.03,noMask:true,depth:[.1,2.6],pad:.3,box:BIO.window('water')});}
 // BOULDER FIELDS on the rocky ground (the moraines, the felsenmeer); on the S rim the iris lichen on them (black, rust and violet crusts);
 // on the W rim veil thread hung off their tops
 BIO.grid(14,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return q*clamp(Z.rock*.45*smooth(.15,.5,Z.slope)*smooth(.92,.7,Z.slope)+Z.alpine*.08,0,1)*(1-Z.ice)*(1-Z.lake);},
  (x,y,z)=>{if(blocked(x,z,1.5))return;const set=RRIM.rim==='s'?PAL.rockBlack:RRIM.rim==='w'?PAL.rockCopper:PAL.rock,r=stone(x,z,set,true),gy=Y(x,z);st.boulders++;
   if(RRIM.rim==='s'&&rng()<.75){for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU),n=[Math.cos(a)*.5,1,Math.sin(a)*.5];
     BIO.put('lichenP',[x+Math.cos(a)*r*.35,gy+r*.55,z+Math.sin(a)*r*.35],qUp(n),[r*rr(.6,1),1,r*rr(.6,1)],bright(vary(pick(PAL.iris),.03,.08,.06),1.5));}st.irisRocks++;}
   if(RRIM.rim==='w'&&BIO.field('fog',x,z)>.3&&rng()<.5){for(let k=0,m=ri(1,3);k<m;k++){const a=rr(0,TAU);BIO.put('veil',[x+Math.cos(a)*r*.6,gy+r*.6,z+Math.sin(a)*r*.6],qEuler(0,a,0),[rr(.4,.7),r*rr(.8,1.4),1],leafCol(PAL.veil,1.05,.02,.06,.06));st.veils++;}}},
  {patch:.5,patchScale:.015,pad:1.5});
 return{under:st};};
})();
