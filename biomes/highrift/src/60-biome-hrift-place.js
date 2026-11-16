// ================================================================= HIGH RIFT — placement (PLAN.md sections 4 and 5)
// HRIFT.buildRift(R, q, o): the rift's own life on a station's ground, every cell seeded from KRAND.cell(seed, ix, iz) (never from how many draws came
// before it). o.heat(x, z) the ground's temperature (degC: KTHERM's bake, the host's), o.acid(x, z) 0..1 the acid ground (the springs' and vents'
// alteration), o.grass 0..1 the station's tussock (1 on the mild grabens, less on the horst and the gjar), o.keep(x, z) 0 where the host keeps the ground
// bare. Reads the fields wet, rock, slope, cold, mist, canyon (BIO.field). HRIFT.combs(list, q): the bladed quartz on the fissures' walls, from the host's
// wall points [{x, y, z, nx, nz, s}]. Returns the counts.
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,qEuler}=BIO.fn,C=HRIFT.C,PAL=HRIFT.PAL;
const pickC=(a,j)=>{const c=C(a[Math.floor(rng()*a.length)%a.length]);if(j)c.offsetHSL(rr(-j,j)*.3,rr(-j,j),rr(-j,j));return c;};
const Y=(x,z)=>BIO.host.terrainH(x,z);
HRIFT.buildRift=function(R,q,o){o=o||{};q=q==null?1:q;R=R==null?2500:R;
 const st={canes:0,beads:0,worts:0,heath:0,tussock:0},seed=KRAND.child(1000019,'highrift/rift'),keep=o.keep||(()=>1),heat=o.heat||(()=>5),acid=o.acid||(()=>0),grass=o.grass==null?1:o.grass;
 const F=n=>(x,z)=>BIO.field(n,x,z),wet=F('wet'),rock=F('rock'),slope=F('slope'),cold=F('cold'),mist=F('mist'),slot=F('canyon');
 const Lv=BIO.LOD(),c0=BIO.center();
 const cellPass=(cell,salt,maxD,fn)=>{const N=Math.ceil(R*2/cell);for(let iz=0;iz<N;iz++)for(let ix=0;ix<N;ix++){
  const x=c0[0]-R+(ix+.5)*cell,z=c0[1]-R+(iz+.5)*cell;if(Math.hypot(x-c0[0],z-c0[1])>R)continue;const ld=BIO.lodD(x,z);if(ld>maxD)continue;
  reseed(KRAND.cell(seed+salt,ix,iz));const px=x+rr(-.5,.5)*cell,pz=z+rr(-.5,.5)*cell;if(BIO.mask(px,pz)<=0||keep(px,pz)<=0)continue;
  fn(px,Y(px,pz),pz,ld<Lv.floor[0]?2:ld<Lv.floor[1]?1:0);}};
 const band=(t,a,b,f)=>smooth(a-f,a+f,t)*smooth(b+f,b-f,t);
 // OPAL CANE: the warm run-off (30-70 degC and wet), and the gja's floor (its still, damp air)
 cellPass(4,1,Lv.mid,(x,y,z,lv)=>{const T=heat(x,z),a=Math.max(band(T,30,70,6)*smooth(.35,.6,wet(x,z)),.12*smooth(.5,.9,slot(x,z))*smooth(.4,.7,wet(x,z)))*(1-smooth(.5,.8,slope(x,z)))*q;
  if(rng()>a)return;const n=lv===2?ri(6,14):lv===1?ri(3,6):2,dead=rng()<.2;
  for(let k=0;k<n;k++){const ang=rr(0,TAU),d=rr(0,.9),px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0)continue;const py=Y(px,pz),h=rr(1,2.5),lean=rr(-.18,.18);
   const col=pickC(dead?PAL.opalDead:PAL.opal,.02),qq=qEuler(lean,rr(0,TAU),rr(-.18,.18));BIO.put('hrcane',[px,py-.05,pz],qq,[h,h,h],col);
   if(lv===2)for(let j=1;j<4;j++){const t=j/4;BIO.put('hrnode',[px+Math.sin(lean)*h*t*.0,py+h*t,pz],qq,[.035,.04,.035],col);}st.canes++;}});
 // BEAD CAP: rings on the sinter at 25-50 degC, never in the water, on the flat
 cellPass(2.2,2,Lv.floor[1],(x,y,z,lv)=>{const T=heat(x,z),a=band(T,25,50,4)*(1-smooth(.35,.6,slope(x,z)))*.8*q;if(rng()>a)return;
  const n=lv===2?ri(2,6):1;for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.15,.6):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0)continue;
   const py=Y(px,pz),s=rr(.05,.3),hs=rr(.3,1.2)*s;if(lv===2)BIO.put('hrbeadstalk',[px,py-.02,pz],qEuler(0,rr(0,TAU),0),[s*.5,hs,s*.5],pickC(PAL.beadStalk,.03));
   BIO.put('hrbead',[px,py+hs*.9,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s,s],pickC(PAL.bead,.02));st.beads++;}});
 // VERDIGRIS WORT: the acid ground round the springs and the vents, 12-40 degC
 cellPass(3,3,Lv.floor[1],(x,y,z,lv)=>{const a=acid(x,z)*band(heat(x,z),12,40,5)*(1-rock(x,z))*.85*q;if(rng()>a)return;const s=rr(.18,.42);
  BIO.put('hrwort',[x,y-.01,z],qEuler(0,rr(0,TAU),0),[s,s*.8,s],pickC(PAL.verd,.03));
  if(lv>0&&rng()<.4){const h=rr(.3,.6);BIO.put('hrspike',[x,y,z],qEuler(rr(-.1,.1),0,rr(-.1,.1)),[h*.8,h,h*.8],pickC(PAL.verdFlower,.02));}st.worts++;});
 // STEAM HEATH: the warm margins (10-25 degC) and the spray zone (the mist field)
 cellPass(3.5,4,Lv.floor[1]*1.3,(x,y,z,lv)=>{const T=heat(x,z),a=Math.max(band(T,10,25,3),.7*smooth(.25,.6,mist(x,z)))*(1-smooth(.4,.75,rock(x,z)))*.75*q;if(rng()>a)return;
  const n=lv===2?ri(2,5):1;for(let k=0;k<n;k++){const ang=rr(0,TAU),d=k?rr(.3,1.1):0,px=x+Math.cos(ang)*d,pz=z+Math.sin(ang)*d;if(BIO.mask(px,pz)<=0)continue;const s=rr(.35,.8);
   BIO.put('hrheath',[px,Y(px,pz)-.04,pz],qEuler(0,rr(0,TAU),0),[s,s*.7,s],pickC(PAL.heath,.03));st.heath++;}});
 // TUSSOCK: the cold ground between, thinning on rock and with the cold, gone on hot ground
 cellPass(3,5,Lv.floor[1],(x,y,z,lv)=>{const a=grass*.5*(1-smooth(.35,.7,rock(x,z)))*(1-.6*smooth(.75,1,cold(x,z)))*smooth(18,8,heat(x,z))*(.5+.6*wet(x,z))*q;if(rng()>a)return;
  const s=rr(.3,.7);BIO.put('hrtuss',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[s,s*rr(.9,1.4),s],pickC(PAL.tussock,.03));st.tussock++;});
 return st;};
// THE SINGING CRYSTALS: combs of bladed quartz standing out of the fissures' walls, each comb a fan of 5-14 thin plates, pale to amethyst toward the vugs
HRIFT.combs=function(list,q){q=q==null?1:q;const st={combs:0,blades:0},seed=KRAND.child(1000029,'highrift/combs');
 list.forEach((w,i)=>{reseed(KRAND.hash(seed,i,7));if(rng()>q)return;const n=ri(5,14),az=Math.atan2(w.nx,w.nz),s=w.s==null?1:w.s;
  for(let k=0;k<n;k++){const L=rr(.15,.9)*s,a=az+rr(-.7,.7),tilt=rr(-.5,.5),d=rr(0,.5)*s;
   BIO.put('hrblade',[w.x+Math.cos(a)*0+rr(-.3,.3)*s,w.y+rr(-.4,.4)*s,w.z+rr(-.3,.3)*s],qEuler(tilt,a,rr(-.4,.4)),[L*rr(.3,.6),L*rr(.7,1.2),L],pickC(PAL.crystal,.01));st.blades++;void d;}
  st.combs++;});
 return st;};
})();
