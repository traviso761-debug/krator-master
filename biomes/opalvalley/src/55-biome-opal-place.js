// ================================================================= OPAL VALLEY — placement (PLAN.md sections 3.2 and 6)
// OPAL.buildKin(R, q, o): the Xanadu kin (OPAL.KIN; and a station's edge species, OPAL.EDGE) on the station's ground: each species a cell pass, every
// cell seeded from KRAND.cell(seed, ix, iz) (never from how many draws came before it), its builder's stream reseeded from the same hash; the tree
// made and grown by its SOURCE kit's builder (BIO.kin: make, grow), heroes near the spine, the far tier beyond (the builder's own impostors).
// OPAL.buildOwn(R, q, o): the kit's own plants (cushion, fern, pad, chalice, tussock). Both read the fields wet, rock, slope, upland, mist, flow, cold,
// ice (BIO.field) and the host's o.station (the key), o.keep(x, z) (0 where the host keeps the ground bare: the diggings, the sites), o.water(x, z)
// and o.ground(x, z) (BIO.host's). Nothing roots on the ice or in the water (BIO.mask). Returns the counts.
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn,C=OPAL.C,PAL=OPAL.PAL;
const pickC=(a,j)=>{const c=C(a[Math.floor(rng()*a.length)%a.length]);if(j)c.offsetHSL(rr(-j,j)*.3,rr(-j,j),rr(-j,j));return c;};
const Y=(x,z)=>BIO.host.terrainH(x,z);
const F=n=>(x,z)=>BIO.field(n,x,z);
// where a ground kind is, 0..1, from the fields (55's own words for PLAN.md section 3.2's "terrace zone")
const GROUND={
 forest:(x,z)=>smooth(.85,.55,F('upland')(x,z))*smooth(.5,.3,F('rock')(x,z))*smooth(.35,.55,F('wet')(x,z))*smooth(.92,.8,F('wet')(x,z)),
 shore:(x,z)=>smooth(.7,.85,F('wet')(x,z))*smooth(.4,.2,F('upland')(x,z))*smooth(.45,.25,F('rock')(x,z)),
 dry:(x,z)=>smooth(.75,.5,F('wet')(x,z))*smooth(.55,.3,F('rock')(x,z))*smooth(.8,.5,F('upland')(x,z)),
 rim:(x,z)=>smooth(.12,.35,F('mist')(x,z))*smooth(.7,.45,F('rock')(x,z)),
 mist:(x,z)=>smooth(.3,.55,F('mist')(x,z))*smooth(.6,.4,F('rock')(x,z)),
 fan:(x,z)=>smooth(.45,.25,F('rock')(x,z))*smooth(.7,.4,F('upland')(x,z))};
OPAL.GROUND=GROUND;
const grow=(K,x,z,seedH,lv,st,label)=>{const y=Y(x,z);reseed(seedH);const T=K.make(x,y,z);const o0=BIO.owner;BIO.owner=[x,z];
 try{K.grow(T,lv);st[label]=(st[label]||0)+1;st.trees++;}catch(e){BIO.err(label+': '+(e.stack||e));st.errors++;}finally{BIO.owner=o0;}};
OPAL.KINS={};   /* the kin made on this page, by key (BIO.kin's records: what the inspector names) */
OPAL.buildKin=function(R,q,o){o=o||{};q=q==null?1:q;R=R==null?2500:R;const st={trees:0,errors:0,missing:[]},keep=o.keep||(()=>1),Lv=BIO.LOD(),c0=BIO.center();
 const list=OPAL.KIN.filter(k=>k.zone[o.station]).map(k=>({k,w:k.zone[o.station],cell:o.cell==null?36:o.cell})).concat((OPAL.EDGE[o.station]||[]).map(k=>({k,w:k.w,cell:44})));
 list.forEach(({k,w,cell},si)=>{const K=OPAL.KINS[k.key]||BIO.kin(k.from,Object.assign({key:k.key,name:k.name,tags:k.tags||{}},k.delta||{}));if(!K){st.missing.push(k.from);return;}OPAL.KINS[k.key]=K;
  const seed=KRAND.child(1000057,'opalvalley/kin/'+k.key),N=Math.ceil(2*R/cell),gf=GROUND[k.ground],c1=BIO.cur;BIO.cur='opalvalley/kin';
  for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){const cx=c0[0]-R+(ix+.5)*cell,cz=c0[1]-R+(iz+.5)*cell;if(Math.hypot(cx-c0[0],cz-c0[1])>R)continue;
   reseed(KRAND.cell(seed,ix,iz));const x=cx+rr(-.45,.45)*cell,z=cz+rr(-.45,.45)*cell;
   const a=.3*w*q*gf(x,z)*(1-F('ice')(x,z))*smooth(.4,.62,BIO.fn.fbm(x*.0035,z*.0035,700+si,2));   /* groves, with meadow between */if(rng()>a||BIO.mask(x,z)<=0||keep(x,z)<=0)continue;
   const ld=BIO.lodD(x,z),lv=ld<Lv.hero?2:ld<Lv.mid?1:0;grow(K,x,z,KRAND.hash(seed,ix,iz,11),lv,st,k.key);if(st.errors>3)break;}
  BIO.cur=c1;});
 return st;};
OPAL.buildOwn=function(R,q,o){o=o||{};q=q==null?1:q;R=R==null?2500:R;const S=o.station,keep=o.keep||(()=>1),water=o.water||(()=>-1e9),heat=o.heat||(()=>10),bare=o.bare||(()=>0);   /* bare: the host's sinter crust, 0..1 */
 const st={cushions:0,ferns:0,pads:0,chalices:0,tussock:0},seed=KRAND.child(1000059,'opalvalley/own');
 const wet=F('wet'),rock=F('rock'),slope=F('slope'),cold=F('cold'),mist=F('mist'),up=F('upland'),ice=F('ice');
 const Lv=BIO.LOD(),c0=BIO.center();
 const cellPass=(cell,salt,maxD,fn,dry)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.hypot(x-c0[0],z-c0[1])>R)continue;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(dry!==false&&(BIO.mask(px,pz)<=0||keep(px,pz)<=0))continue;
  fn(px,Y(px,pz),pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);}};
 const at=k=>OPAL.byKey[k].tags.zone.indexOf(S)>=0;
 // SILICA CUSHION: the moraines and the ice's margins, the cold open ground
 if(at('silicacushion'))cellPass(3.2,1,Lv.floor[1],(x,y,z,lv)=>{const a=.28*q*smooth(.4,.75,cold(x,z))*(1-smooth(.3,.6,rock(x,z)))*smooth(.9,.6,wet(x,z))*(1-ice(x,z));if(rng()>a)return;
  const n=lv===2?ri(1,4):1;for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.3,1.2):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0)continue;const s=rr(.1,.6);
   BIO.put('opcushion',[px,Y(px,pz)-.03,pz],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.5,.8),s],pickC(PAL.cushion,.02));st.cushions++;}});
 // PRISM FERN: the falls' mist and the canyon's damp shade, off the open water
 if(at('prismfern'))cellPass(2.6,2,Lv.floor[1],(x,y,z,lv)=>{const a=.3*q*Math.max(smooth(.25,.6,mist(x,z)),.35*smooth(.75,.9,wet(x,z)))*(1-smooth(.55,.8,rock(x,z)))*(1-smooth(.2,.5,bare(x,z)))*smooth(.42,.58,BIO.fn.fbm(x*.03,z*.03,741,2));if(rng()>a)return;   /* in the damp margins' patches, never on the bare sinter crust */
  const n=lv===2?ri(1,3):1;for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.3,1):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0)continue;const s=rr(.4,.9);
   BIO.put('opfern',[px,Y(px,pz)-.04,pz],qEuler(0,rr(0,TAU),0),[s,s*rr(.8,1.2),s],pickC(PAL.fern,.03),{n:[0,1,0],c2:pickC(PAL.fernC2,.02)});st.ferns++;}});
 // OPAL LOTUS PAD: on the lakes' still margins (water 0.4-2.5 m deep over the bed), floating at the water's level
 if(at('opalpad'))cellPass(2.2,3,Lv.floor[1],(x,y,z,lv)=>{const w=water(x,z);if(w<-1e8)return;const d=w-y;if(d<.4||d>2.5)return;
  const a=.2*q*smooth(2.5,1.2,d)*(o.lake?o.lake(x,z):1)*smooth(.45,.6,BIO.fn.fbm(x*.02,z*.02,733,2));if(rng()>a)return;   /* rafts, not a carpet */const n=lv===2?ri(2,6):1;
  for(let k=0;k<n;k++){const ang=rr(0,TAU),r=k?rr(.6,2.2):0,px=x+Math.cos(ang)*r,pz=z+Math.sin(ang)*r,ww=water(px,pz);if(ww<-1e8||ww-Y(px,pz)<.3)continue;const s=rr(.5,1.4);
   BIO.put('oppad',[px,ww+.03,pz],qEuler(0,rr(0,TAU),0),[s,1,s],pickC(PAL.pad,.03),{n:[0,1,0],c2:pickC(PAL.padC2,.02)});st.pads++;}},false);
 // SINTER CHALICE: the warm sinter by the seeps (20-45 degC) and the falls' mist
 if(at('sinterchalice'))cellPass(9,4,Lv.mid,(x,y,z,lv)=>{const T=heat(x,z),a=.4*q*Math.max(smooth(18,26,T)*smooth(48,38,T),.25*smooth(.35,.6,mist(x,z))*smooth(.5,.62,BIO.fn.fbm(x*.008,z*.008,742,2)))*(1-smooth(.4,.7,rock(x,z)));if(rng()>a)return;   /* round the seeps, and a few stands in the mist */
  const h=rr(1,3),r=h*rr(.35,.55),c=pickC(PAL.chalice,.02);BIO.put('opstalk',[x,y-.05,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*.5,h,h*.5],pickC(PAL.stalk,.03));
  BIO.put('opchalice',[x,y+h*.97,z],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[r,r*.8,r],c);st.chalices++;});
 // TUSSOCK: the open ground everywhere, thinning on rock, with the cold, on the warm ground and on the ice
 cellPass(3,5,Lv.floor[1],(x,y,z,lv)=>{const a=(o.grass==null?.5:o.grass)*(1-smooth(.35,.7,rock(x,z)))*(1-.6*smooth(.8,1,cold(x,z)))*smooth(30,18,heat(x,z))*(1-ice(x,z))*(.45+.5*wet(x,z))*q;if(rng()>a)return;
  const s=rr(.3,.7);BIO.put('optuss',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.9,1.4),s],pickC(PAL.tussock,.03));st.tussock++;});
 return st;};
})();
