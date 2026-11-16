// ================================================================= THE TIERS — the floor: what lies and grows on the ground (and the water)
// By zone (55: TIERS.zones) from the host's fields, the rule kept at the small scale too:
//   the tiergrass     in rows along the slopes' contours: its tufts sit on the lips of the terracettes, the little soil steps every grazed slope
//                     carries (a tuft where the ground's height stands in the top fifth of a 0.9 m step: rows a step apart, the terracettes'
//                     lips; the ground's steps themselves are amendment 3, T4: KNOWN_ISSUES.md)
//   the ledge heath   in level rows along the riser's ledges (the ledge field: a bench of the scarp), sparse on the dry rocky ground
//   the shore reeds   in the wet band at the water's edge
//   the stair lilies  colonies in the sheltered bays (0.3-2.6 m of water): pads in overlapping steps out from the shore, the oldest highest
//   the step moss     mats on the tufa dams of the seep's pools and along its wet line
//   the band lichen   crusts on the talus's boulders (the faces carry it as a ground layer: 45, ground.lichen)
//   the talus         basalt boulders and fallen columns under the Black Step and the stacks (the Grey Steps' pale blocks up high, no columns)
//   the cold stair    (station 4's tread, over ~4.2 km) the tiergrass sparse on its terracettes, the pagoda bush (grey discs stacked on a stem, a
//                     season's flush each) and the stack cushion (a terraced mound, a step a decade) on the stony pavement, pale cobbles between
// Every pass is the core's cell lattice (BIO.grid's cell form), in three LOD bands along the spine (near 6 m, mid 12 m, far 24 m cells); a cell's own
// stream (reseed) draws its shapes and colours.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=TIERS.PAL,zones=TIERS.zones,{bright,vary}=BIO.col;
const Y=(x,z)=>BIO.terrainH(x,z);
const tone=(set,k)=>bright(vary(pick(set),.02,.06,.06),k==null?1:k);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
function tuft(item,x,z,h,w,col,tilt){const t=tilt==null?.06:tilt;BIO.put(item,[x,Y(x,z)-.05,z],qEuler(rr(-t,t),rr(0,TAU),rr(-t,t)),[w==null?h*.9:w,h,w==null?h*.9:w],col);}
/* a flat card on the ground, tilted to the ground's own slope (seated: its centre on the ground, lifted 6 mm) */
function flatOn(item,x,z,s,col,lift){const e=1.5,hx=Y(x+e,z)-Y(x-e,z),hz=Y(x,z+e)-Y(x,z-e),n=[-hx/(2*e),1,-hz/(2*e)];
 BIO.put(item,[x,Y(x,z)+(lift==null?.006:lift),z],qUp(n),[s,1,s*rr(.85,1.15)],col);}
function stone(x,z,set,big){const y=Y(x,z),r=(big?rr(.5,1.6):rr(.1,.3))*(.7+.6*rng());BIO.put(big?'boulder':'stone',[x,y+r*.1,z],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),[r*rr(.9,1.4),r*.65,r],tone(set,rr(.85,1.1)));return r;}
function column(x,z){const y=Y(x,z),L=rr(1,3),w=rr(.4,.8),a=rr(0,TAU);   /* a fallen basalt column, lying on its side */
 BIO.put('column',[x,y+w*.38,z],new BIO.host.THREE.Quaternion().setFromEuler(new BIO.host.THREE.Euler(Math.PI/2+rr(-.1,.1),a,0,'YXZ')),[w,L,w],tone(PAL.rock,rr(.85,1.05)));}
/* the terracettes' lips: the top fifth of each 0.9 m step of the ground's height, on a slope (a grazed slope's level rows) */
const LIP=.9,lipK=(x,z,sl)=>{const f=Y(x,z)/LIP;return smooth(.1,.3,sl)*smooth(.75,.9,f-Math.floor(f));};

// ---------------------------------------------------------------- the planters, by zone: (x,z,Z,lv,st)
function plantDry(x,z,Z,lv,st){const t=rng(),lip=lipK(x,z,Z.slope);
 if(t<.55+.35*lip){around(x,z,lv===2?ri(2,4):1,.2,.8,(px,pz)=>tuft('tiergrass',px,pz,rr(.3,.6),rr(.35,.55),tone(PAL.grass)));st.tiergrass++;}
 else if(t<.75&&Z.rock>.35){tuft('heath',x,z,rr(.4,.9),rr(.6,1),tone(PAL.heath),.03);st.heath++;}   /* the heath keeps to rocky ground and the ledges (its own pass): not the open slopes */
 else{stone(x,z,rng()<.7?PAL.rock:PAL.rockRed,false);st.stone++;}}
/* the meadow's tufts: tawny on the dry side, green in the swales (the same slow patch the ground's meadow layer follows, and the wet) */
const greenK=(x,z)=>clamp(Math.max(smooth(.5,.68,BIO.field('wet',x,z)),smooth(.52,.68,fbm(x*.0028,z*.0028,7.1,3))*.85),0,1);
function grassCol(x,z){const g=greenK(x,z);return g>.05&&rng()<g?tone(PAL.grassGreen,1):tone(PAL.grass,1.05);}
function plantGrass(x,z,Z,lv,st){around(x,z,lv===2?ri(2,4):1,.2,.9,(px,pz)=>tuft('tiergrass',px,pz,rr(.3,.65),rr(.4,.7),grassCol(px,pz)));st.tiergrass++;}
/* the cold stair (station 4): a pagoda bush, a stack cushion, a sparse tuft row or a cobble */
function pagoda(x,z,st,lv){const y=Y(x,z),H=rr(.5,1.2),n=ri(3,6),R0=rr(.32,.55);BIO.put('pdisc',[x,y,z],null,[.07,H*10,.07],tone(PAL.pagodaStem));   /* the stem (the drum's unit is 0.1 tall) */
 for(let k=0;k<n;k++){const u=(k+1)/n,yy=y+H*(.25+.75*u),r=R0*(1.05-.55*u)*rr(.9,1.1),a=rr(0,TAU),ox=rr(-.04,.04),oz=rr(-.04,.04);
  BIO.put('pdisc',[x+ox,yy-.05,z+oz],qEuler(rr(-.04,.04),a,rr(-.04,.04)),[r*2,.8,r*2],tone(PAL.pagoda,.62));BIO.put('pagoda',[x+ox,yy+.002,z+oz],qEuler(0,a,0),[r*2.1,1,r*2.1],tone(PAL.pagoda));}st.pagoda++;
 if(lv===2)(TIERS.SHRUBS=TIERS.SHRUBS||[]).push({key:'pagodabush',x,z,discs:n});}   /* the near ones, for the tiers rule (99) */
function cushion(x,z,st){const y=Y(x,z),s=rr(.4,1.6);BIO.put('cushion',[x,y-.04,z],qEuler(0,rr(0,TAU),0),[s,s*rr(.45,.85),s*rr(.8,1.2)],tone(PAL.cushion,rr(.9,1.1)));st.cushion++;}
function plantStair(x,z,Z,lv,st){const t=rng(),pv=BIO.field('pave',x,z),lip=lipK(x,z,Z.slope);
 if(t<.42*(1-pv*.6)+.3*lip){around(x,z,lv===2?ri(1,3):1,.2,.7,(px,pz)=>tuft('tiergrass',px,pz,rr(.2,.42),rr(.3,.45),tone(PAL.grass,.95)));st.tiergrass++;}
 else if(t<.6)pagoda(x,z,st,lv);else if(t<.74)cushion(x,z,st);else{stone(x,z,PAL.rockGrey,false);st.stone++;}}
function plantShore(x,z,Z,lv,st){around(x,z,lv===2?ri(2,5):2,.3,1.2,(px,pz)=>tuft('reed',px,pz,rr(.8,1.6),rr(.6,1),tone(PAL.reedTuft)));st.reed++;}

// ---------------------------------------------------------------- the pass
TIERS.buildFloor=function(R,q){q=q==null?1:q;R=R||2500;
 const st={tiergrass:0,heath:0,reed:0,pad:0,lilybloom:0,moss:0,lichen:0,stone:0,boulder:0,column:0,pagoda:0,cushion:0};
 const L=BIO.LOD(),bands=[[6,L.floor[0],0,'near'],[12,L.floor[1],L.floor[0],'mid'],[24,1e9,L.floor[1],'far']],box=[-R,-R,R,R];
 bands.forEach((b,bi)=>{const lv=2-bi,band=(x,z)=>{const ld=BIO.lodD(x,z);return ld<b[1]&&ld>=b[2];};
  // the dry slopes, the tread and the wood's floor: tiergrass in its rows (the terracettes' lips), heath on the rocky ground, cobbles
  BIO.grid('floor-dry-'+b[3],b[0],(x,z)=>{if(!band(x,z))return 0;const Z=zones(x,z);if(Z.land<=0)return 0;
    const lip=lipK(x,z,Z.slope),d=Z.dry*(.4+.5*lip)+Z.wood*.3+Z.temperate*Z.land*Z.live*.38*(1-Z.farm)*(1-Z.shore*.6)*(1-Z.rock);   /* the lake tread's grass: the tawny Csa meadow between the woods */return q*(lv===0?.5:1)*clamp(d,0,1);},
   (x,y,z)=>{const Z=zones(x,z);if(Z.dry>.2)plantDry(x,z,Z,lv,st);else plantGrass(x,z,Z,lv,st);},{box,patch:.6,patchScale:.012,pad:.5});
  // the cold stair's tread (station 4): sparse, the pavement's stones between
  BIO.grid('floor-stair-'+b[3],b[0]*1.6,(x,z)=>{if(!band(x,z))return 0;const Z=zones(x,z);if(Z.stair<=0)return 0;return q*(lv===0?.5:1)*clamp(Z.stair*(1-Z.rock)*(1-Z.talus*.7)*.62,0,1);},
   (x,y,z)=>plantStair(x,z,zones(x,z),lv,st),{box,patch:.55,patchScale:.01,pad:.6});
  // the shore's reed band (the wet edge of the land)
  BIO.grid('floor-shore-'+b[3],b[0],(x,z)=>{if(!band(x,z))return 0;const Z=zones(x,z);return q*clamp(Z.temperate*Z.land*smooth(10,1,Z.shoreD)*(1-Z.farm)*(1-Z.road)*.8,0,1);},
   (x,y,z)=>plantShore(x,z,zones(x,z),lv,st),{box,patch:.5,patchScale:.02,pad:.4});});
 // THE LEDGE HEATH: rows along the riser's ledges (each candidate on the ledge's bench), the riser's level lines of green; on the faces the band
 // lichen's crusts in the beds (the cliff gate off: these grow on faces, BIO.def(..., {cliff:true}))
 BIO.grid('floor-ledge',2.5,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;const Z=zones(x,z);return q*clamp(Z.ledge*.85,0,1);},
  (x,y,z)=>{tuft('heath',x,z,rr(.5,1.2),rr(.7,1.2),tone(PAL.heath,rr(.95,1.1)),.03);st.heath++;if(rng()<.25){BIO.put('cbloom',[x,Y(x,z)+rr(.5,.9),z],null,[.05,.04,.05],tone(PAL.heathBloom));}},
  {box,patch:.25,patchScale:.03,pad:.3,cliff:true});
 BIO.grid('floor-face',4,(x,z)=>{if(BIO.lodD(x,z)>L.floor[0])return 0;const Z=zones(x,z);return q*clamp(Z.face*.5,0,1);},
  (x,y,z)=>{const e=1.2,hx=Y(x+e,z)-Y(x-e,z),hz=Y(x,z+e)-Y(x,z-e),n=[-hx/(2*e),1,-hz/(2*e)];BIO.put('lichen',[x,Y(x,z)+.02,z],qUp(n),[rr(.6,1.4),1,rr(.4,.9)],tone(PAL.lichen,1.05));st.lichen++;},
  {box,patch:.3,patchScale:.04,pad:.2,cliff:true});
 // THE STAIR LILIES: colonies in the bays, each a few rows of pads stepping out from the shore (the water's height plus a step for each row back
 // toward the land: the oldest, nearest the shore, highest), a flower or two; on the water, so the mask is off (the pass reads the depth)
 const wH=BIO.host.waterH;
 BIO.grid('floor-lilies',22,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;const Z=zones(x,z);return q*clamp(Z.bay*.55,0,1);},
  (x,y,z)=>{const w=wH(x,z);if(!(w>-1e8))return;const e=3,gx=Y(x+e,z)-Y(x-e,z),gz=Y(x,z+e)-Y(x,z-e),gl=Math.hypot(gx,gz)||1,ux=gx/gl,uz=gz/gl;   /* up the bed: toward the shore */
   const rows=ri(3,6),per=ri(3,6);for(let r=0;r<rows;r++)for(let k=0;k<per;k++){const px=x+ux*r*1.1+(-uz)*(k-per/2)*1.2+rr(-.3,.3),pz=z+uz*r*1.1+ux*(k-per/2)*1.2+rr(-.3,.3);
     const d=w-Y(px,pz);if(d<.15||d>3)continue;const s=rr(.8,1.6)*(1+.12*r);BIO.put('pad',[px,w+.015+.035*r,pz],qEuler(0,rr(0,TAU),0),[s,1,s],tone(PAL.pad,rr(.9,1.1)));st.pad++;
     if(rng()<.06){BIO.put('lilybloom',[px+rr(-.2,.2),w+.12+.035*r,pz+rr(-.2,.2)],null,[.14,.1,.14],tone(PAL.lilyBloom));st.lilybloom++;}}},
  {box,patch:.4,patchScale:.02,pad:2,noMask:true});
 // THE STEP MOSS: mats along the seep's wet line and on its pools' dams (the seep field: 44w's line), the tufa round them in the ground's layer
 BIO.grid('floor-moss',1.6,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;return q*clamp(BIO.field('seep',x,z)*.7,0,1);},
  (x,y,z)=>{flatOn('moss',x,z,rr(.4,1.1),tone(PAL.moss,rr(.95,1.1)),.01);st.moss++;},{box,patch:.2,patchScale:.05,pad:.2,noMask:true});
 // THE TALUS: basalt boulders and fallen columns under the Black Step and round the stacks, band lichen on a share of them
 BIO.grid('talus',10,(x,z)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return q*clamp(Z.talus*.7+Z.rock*.08*smooth(.15,.5,Z.slope),0,1)*Z.land*(1-Z.road);},
  (x,y,z)=>{const grey=Y(x,z)>3900;if(rng()<.25&&!grey){column(x,z);st.column++;return;}   /* columns are the basalt's: the Grey Steps break in blocks */
   const r=stone(x,z,grey?PAL.rockGrey:rng()<.8?PAL.rock:PAL.rockRed,true),gy=Y(x,z);st.boulder++;
   if(rng()<.5)for(let k=0,m=ri(1,3);k<m;k++){const a=rr(0,TAU),n=[Math.cos(a)*.5,1,Math.sin(a)*.5];
    BIO.put('lichen',[x+Math.cos(a)*r*.3,gy+r*.5,z+Math.sin(a)*r*.3],qUp(n),[r*rr(.5,.9),1,r*rr(.5,.9)],tone(PAL.lichen,1.1));st.lichen++;}},
  {box,patch:.5,patchScale:.015,pad:1.2});
 return{under:st};};
})();
