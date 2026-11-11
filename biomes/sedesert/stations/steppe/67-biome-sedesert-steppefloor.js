// ================================================================= EASTERN DESERT, THE STEPPE FRINGE — the floor
// After the Bowl's floor (66: its halophytes at the pan's damp margin, its reg plants on the pavement and the desert edge):
//   the FAIRY CIRCLES   a bare disc each (a decal on the ground), a ring of taller grass round its rim, no grass inside
//   the GRASS           bunchgrass, plume grass among it, close, mid and far
//   the RARE THREE      old twoleafs on the pavement and the pan's margin (the oldest a heap 8 m across), rock figs on the kopjes'
//                       granite faces, pebble plants on the pan's gravel margin and the pavement
//   the ALIENS          whistle reeds round the pan and along the wadi, drift lanterns in the grass (and loose ones rolling down
//                       the wind), sun-dials in drifts turning with the sun (59: SEDESERT.steppeMotion)
// The host hands the layout in SEDESERT.STEPPE_HOST: {discs:[{x,z,r}], wind:[x,z], insideDisc(x,z)}
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,pick}=BIO.fn;
const F=(n,x,z)=>BIO.field(n,x,z),PL=SEDESERT.STEPPE_PLANTS;
const base=SEDESERT.buildFloor;
SEDESERT.buildFloor=function(R,q){const out=base(R,q);reseed(670031);q=q==null?1:q;R=R||3000;const H=SEDESERT.STEPPE_HOST||{discs:[],wind:[0,1],insideDisc:()=>null};
 const st={discs:0,grass:0,twoleaf:0,rockfig:0,pebbles:0,whistle:0,lantern:0,dials:0,loose:0};
 const L=BIO.LOD(),lvAt=(x,z)=>{const d=BIO.lodD(x,z);return d<L.floor[0]?2:d<L.floor[1]?1:0;};
 const ok=(x,z,p)=>!SEDESERT.blocked(x,z,p)&&BIO.clearOf(x,z,p)&&BIO.mask(x,z)>0;
 // the fairy circles: the discs and the taller grass on their rims
 H.discs.forEach(D=>{if(!BIO.clearOf(D.x,D.z,D.r))return;const y=BIO.terrainH(D.x,D.z);PL.fairy(D.x,y,D.z,D.r);st.discs++;
  const lv=lvAt(D.x,D.z);if(lv===0)return;for(let k=0,n=Math.round(D.r*(lv===2?3.2:1.4));k<n;k++){const a=k/n*TAU+rr(-.1,.1),rr0=D.r*rr(1.05,1.3),x=D.x+Math.cos(a)*rr0,z=D.z+Math.sin(a)*rr0;
   PL.bunch(x,BIO.terrainH(x,z),z,1,rr(.9,1.4));st.grass++;}});
 // the gnamma pools: moss and ferns round each rim, where the rain lingers in the rock
 (H.gnamma||[]).forEach(G=>{for(let k=0,n=Math.round(G.r*5);k<n;k++){const a=rr(0,TAU),d=G.r*rr(1.02,1.35),x=G.x+Math.cos(a)*d,z=G.z+Math.sin(a)*d,y=BIO.terrainH(x,z);if(y<G.level+.05)continue;
  if(rng()<.6)BIO.put('lichen',[x,y+.02,z],BIO.fn.qEuler(0,rr(0,TAU),0),rr(.4,1.1),SEDESERT.leafCol([0x5a7a3a,0x6a8a42,0x4e6e34],1.15,.04));else BIO.put('fern',[x,y-.03,z],BIO.fn.qEuler(0,rr(0,TAU),0),[rr(.5,.9),rr(.4,.8),rr(.5,.9)],SEDESERT.leafCol([0x4a7a2e,0x56883a],1.2,.03));}});
 // the grass: three bands along the LOD spine. COUNTED (2026-11-08, the instance cap): the spine is a lattice over the whole plain, so
 // the near band is nearly all of it: at 3.6 m it put 1,141,829 bunchgrass tufts (91,181 mid; 1,233,010 in all, five times the core's
 // 250k cap) and drew them all (the station floor keeps the spine's static LOD). Now 9.6 m near and 17 m mid, the tussocks a quarter
 // larger: about 230k (9 m and 16 m put 261,374); the ground's grass layer carries the sward between them
 [[9.6,L.floor[0],0,2],[17,L.floor[1],L.floor[0],1],[28,1e9,L.floor[1],0]].forEach(b=>{BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return F('lush',x,z)*.9*q;},
  (x,y,z)=>{if(H.insideDisc(x,z))return;if(SEDESERT.blocked(x,z,.3))return;const lv=b[3],h=rr(.45,.95)*(lv===0?1.7:lv===1?1.25:1)*(lv>0?1.25:1);
   if(rng()<.14)PL.stipa(x,y,z,lv,h*1.25);else PL.bunch(x,y,z,lv,h);st.grass++;},{patch:.55,patchScale:.02,pad:.25,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // the old twoleafs: the pavement and the pan's margin
 BIO.grid(36,0,R,(x,z)=>F('pave',x,z)*.3+F('damp',x,z)*.12,(x,y,z)=>{if(!ok(x,z,3))return;PL.twoleaf(x,y,z,rng()<.16);st.twoleaf++;},{patch:.4,pad:3});
 // the rock figs on the kopjes' granite faces
 BIO.grid(8,0,R,(x,z)=>F('granite',x,z)*smooth(.3,.6,F('slope',x,z))*.22,(x,y,z)=>{if(!ok(x,z,.8))return;PL.rockfig(x,y,z,rr(.35,.9));st.rockfig++;},{patch:.5,pad:1,noMask:true});
 // the pebble plants: the pan's gravel margin and the pavement
 BIO.grid(18,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;return F('damp',x,z)*.5+F('pave',x,z)*.18;},(x,y,z)=>{if(!ok(x,z,.4))return;PL.pebbles(x,y,z,lvAt(x,z));st.pebbles++;},{patch:.5,pad:.5});
 // the whistle reeds: round the pan and along the wadi
 BIO.grid(30,0,R,(x,z)=>F('damp',x,z)*.45+F('wadi',x,z)*.18,(x,y,z)=>{if(!ok(x,z,1))return;PL.whistle(x,y,z,lvAt(x,z));st.whistle++;},{patch:.5,pad:1});
 // the drift lanterns in the grass
 BIO.grid(16,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.mid)return 0;return F('lush',x,z)*.035;},(x,y,z)=>{if(!ok(x,z,.5)||H.insideDisc(x,z))return;PL.lantern(x,y,z,lvAt(x,z));st.lantern++;},{patch:.7,patchScale:.008,pad:.5});
 // the sun-dials: drifts in the grass, near enough to see them turn (a dynamic mesh: each disc posed with the sun)
 const dials=[],loose=[];
 BIO.grid(6,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.floor[1])return 0;return F('lush',x,z)*smooth(.52,.66,BIO.fn.fbm(x*.006+11,z*.006-4,4801,2))*.8*q;},(x,y,z)=>{if(!ok(x,z,.4)||H.insideDisc(x,z)||dials.length>=3000)return;
  const h=rr(.6,1.5),r=rr(.18,.34);BIO.beam('rod',[x,y,z],[x+rr(-.08,.08),y+h,z+rr(-.08,.08)],.022,.014,0x6a7a3a);dials.push({x,y:y+h,z,r,ph:rr(0,TAU)});
  BIO.put('small',[x,y+.15,z],null,[.35,.25,.35],SEDESERT.leafCol([0x6a7a3a,0x76863e],1.2,.03),{n:[0,1,0]});},{patch:.4,pad:.3});
 st.dials=dials.length;
 // the loose lanterns: rolling down the wind along a run each, near the spine
 BIO.grid(55,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.floor[0]*1.4)return 0;return F('lush',x,z)*.6;},(x,y,z)=>{if(loose.length>=260)return;loose.push({x,z,r:rr(.2,.34),len:rr(120,260),v:rr(.7,1.8),ph:rr(0,300)});},{patch:.3,pad:0,noMask:true});
 st.loose=loose.length;
 SEDESERT.steppeMotion(dials,loose,H.wind);
 return Object.assign(out,{steppe:st});};
})();
