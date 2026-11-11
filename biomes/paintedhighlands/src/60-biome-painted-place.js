// ================================================================= PAINTED HIGHLANDS — placement (PLAN.md section 4)
// PAINTED.buildFloor(R, q, o): the steppe and the bloom on a station's ground, every cell seeded from KRAND.cell(seed, ix, iz) (never from how many
// draws came before it). o.bed(x, y, z) the strata kind at the ground (KSTRATA's at(): the drifts' clay); o.talus(x, z) 0..1 the foot of a cliff (the
// fallen blocks); o.keep(x, z) 0 where the host keeps the ground bare; o.grass 0..1 the station's grass. Reads the fields wet, rock, slope, bare, flow,
// flat, rim, cold (BIO.field). The zones (PLAN.md section 4):
//   bare    the clay hills and every slope over ~15 degrees (field `bare`), the scarps (`rock`): nothing but a rare tuft
//   bloom   the washes' floors (`flow`), the playa (`flat`), gentle dip slopes: the spring drifts over a thin grass
//   steppe  the gentle ground between: bunchgrass, sage, rabbitbrush, a spring flush of small flowers
//   rim     the scarps' tops and the canyon's lips: junipers and pinyons (70: BIO.kin), the cliff beardtongue
// The flowers are placed whatever the season; the season shows them (BIO.SEASON drops their cards at full dry: 41, 50). Returns the counts.
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn,C=PAINTED.C,PAL=PAINTED.PAL,B=PAINTED_BLOOM;
const pickC=(a,j)=>{const c=C(a[Math.floor(rng()*a.length)%a.length]);if(j)c.offsetHSL(rr(-j,j)*.3,rr(-j,j),rr(-j,j));return c;};
const Y=(x,z)=>BIO.host.terrainH(x,z);
const WHITE=[0xf4f2ec,0xeeeae0,0xf8f6f0];
PAINTED.buildFloor=function(R,q,o){o=o||{};q=q==null?1:q;R=R==null?2500:R;
 const st={grass:0,sage:0,rabbit:0,flowers:0,drifts:0,boulders:0,byFlower:B.FLOWERS.map(()=>0)},seed=KRAND.child(2000017,'paintedhighlands/floor'),
  keep=o.keep||(()=>1),bed=o.bed||(()=>null),talus=o.talus||(()=>0),grass=o.grass==null?1:o.grass;
 const F=n=>(x,z)=>BIO.field(n,x,z),wet=F('wet'),rock=F('rock'),slope=F('slope'),bare=F('bare'),flow=F('flow'),flat=F('flat'),rim=F('rim');
 const Lv=BIO.LOD(),c0=BIO.center();
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.abs(x-c0[0])>R||Math.abs(z-c0[1])>R)continue;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(BIO.mask(px,pz)<=0||keep(px,pz)<=0)continue;
  fn(px,Y(px,pz),pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);}};
 const open=(x,z)=>(1-bare(x,z))*(1-rock(x,z));
 // BUNCHGRASS: everywhere off the bare clay, thicker where wetter; thin on the playa's mud
 cellPass(2.6,1,Lv.floor[1]*1.2,(x,y,z,lv)=>{const a=grass*open(x,z)*(.22+.55*wet(x,z))*(1-.7*flat(x,z))*q+.025*q;if(rng()>a)return;
  const s=rr(.3,.6);BIO.put('phgrass',[x,y-.04,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.8,1.3),s],pickC(PAL.grass,.03));st.grass++;});
 // SAGE: the gentle ground and the washes' banks, never on the playa or a wash's floor
 cellPass(4.5,2,Lv.floor[1],(x,y,z,lv)=>{const a=.42*open(x,z)*(1-flat(x,z))*(1-smooth(.5,.9,flow(x,z)))*(1-smooth(.12,.22,slope(x,z)))*q;if(rng()>a)return;
  const s=rr(.5,1.1);BIO.put('phsage',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[s*1.1,s,s*1.1],pickC(PAL.sage,.03));st.sage++;});
 // RABBITBRUSH: the washes' banks and the disturbed clay at the hills' feet
 cellPass(6,3,Lv.floor[1],(x,y,z,lv)=>{const fw=flow(x,z),a=(.5*smooth(.2,.5,fw)*smooth(.95,.6,fw)+.06*smooth(.2,.5,bare(x,z))*(1-rock(x,z)))*q;if(rng()>a)return;
  const s=rr(.5,1.0);BIO.put('phrabbit',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[s*1.1,s,s*1.1],pickC(PAL.rabbit,.03));st.rabbit++;});
 // THE BLOOM: drifts on the washes' floors, the playa, the gentle dip slopes and the rims; each drift one flower, the one its bed's clay favours
 // (B.flowerFor) most of the time, a neighbour's now and then; a drift is a cluster of 3-9 plants of it about the cell's point
 cellPass(2.2,4,Lv.floor[1],(x,y,z,lv)=>{const sl=slope(x,z),gentle=(1-smooth(.08,.16,sl))*(1-bare(x,z));
  const zone=Math.max(flow(x,z)*.95,flat(x,z)*.3,gentle*.3,rim(x,z)*.25*(1-rock(x,z)));const a=zone*(1-rock(x,z))*q;if(rng()>a)return;   /* the playa's drifts at a third: its colour from afar is the ground's (84: aBl) */
  const kind=bed(x,y,z),fi=rng()<.78?B.flowerFor(kind,rng()):B.flowerFor(null,rng()),n=lv===2?ri(3,8):lv===1?ri(1,3):1,f=B.FLOWERS[fi];
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.2,1.1):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0||keep(px,pz)<=0)continue;
   const s=rr(.28,.55)*(f.key==='skylupin'||f.key==='ravenspike'||f.key==='scarletbeard'||f.key==='paintbrush'?1.3:1);
   BIO.put('phfl'+fi,[px,Y(px,pz)-.03,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[s,s,s],pickC(WHITE,.01));st.flowers++;st.byFlower[fi]++;}
  st.drifts++;});
 // FALLEN BLOCKS: the danxia's spall at a cliff's foot (the rockfall's sign)
 cellPass(9,5,Lv.mid,(x,y,z,lv)=>{const t=talus(x,z);if(rng()>t*.5*q)return;const s=rr(.4,2.4)*(rng()<.1?2.2:1);
  BIO.put('phboulder',[x,y+s*.15,z],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[s,s,s],pickC(PAL.boulder,.03));st.boulders++;});
 return st;};
// THE STONE CIRCLES (the Painted Men's, on the playas' rims: PLAN.md section 5): rings of standing stones as the host's site records give them
// ([x, z, r, n]); every stone KRAND-hashed by (circle, index). Returns the stones placed.
PAINTED.circles=function(list){let n0=0;const seed=KRAND.child(2000029,'paintedhighlands/circles');
 list.forEach((c,ci)=>{for(let i=0;i<c[3];i++){reseed(KRAND.hash(seed,ci,i));const a=i/c[3]*TAU+rr(-.08,.08),x=c[0]+Math.cos(a)*c[2],z=c[1]+Math.sin(a)*c[2],h=rr(.9,2.2);
  BIO.put('phstone',[x,Y(x,z)-.2,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[rr(.8,1.3),h,rr(.8,1.2)],pickC([0xb8a690,0xa89680,0xc4b49c],.03));n0++;}});
 return n0;};
})();
