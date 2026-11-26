// ================================================================= THE CATCH — the floor: what grows under and between the trees, and the stones
// By field (BIO.field), on the seeded cell grid (CATCH.place), dense near the LOD spine and thinning with distance:
//   the SAND       dune shrubs on the flanks and in the corridors between dunes, sparse (one every ~40 m at best), none
//                  on a slip face; the crests bare
//   the WATER      reeds where it stands or the table is at the surface (wet > .82), thick round a pool
//   the SALT'S EDGE saltbush on the silt and the crust's margin (a band of wet .2 to .6), brine lamps on the crust
//                  itself where it is thin, in stands
//   the REG        the desert pavement: varnished black stones, close-set on the gravel plains and the fans
//   the TUGAI      fallen poplar wood under the dead
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler}=BIO.fn;
const PAL=CATCH.PAL,F=CATCH.F,blocked=CATCH.blocked,C=CATCH.C;
const {bright,vary}=BIO.col;
const vc=(set,k)=>bright(vary(pick(set),.03,.1,.06),k==null?1.1:k);
// a stand: which way a patch leans (saltbush vs brine lamp), from the cell's noise
const standK=(x,z)=>KRAND.fbm(x*.012,0,z*.012,2,CATCH.SEED+7);
CATCH.buildFloor=function(R,q){q=q==null?1:q;R=R==null?3000:R;const L=BIO.radii(),st={brooms:0,reeds:0,saltbush:0,brinelamps:0,stones:0,logs:0};
 const near=L.floor[0],mid=L.floor[1];
 const lv=(x,z)=>{const d=BIO.lodD(x,z);return d<near?2:d<mid?1:0;};
 const thin=(x,z)=>{const d=BIO.lodD(x,z);return d<near?1:d<mid?.45:d<L.far?.15:0;};
 // THE DUNE SHRUB: sand, not too steep, not on the crests' slip faces; a little more where the water table is near
 CATCH.place(9,201,(x,z)=>F('sand',x,z)*smooth(.55,.3,F('slope',x,z))*(.05+.25*smooth(.15,.45,F('wet',x,z)))*(1-F('crust',x,z))*thin(x,z)*q*CATCH.bias('broom',x,z),
  (x,y,z)=>{if(blocked(x,z,1.2))return;const h=rr(1.2,2.8);BIO.put('broom',[x,y-.05,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[h*rr(.8,1.2),h,h*rr(.8,1.2)],C(0xffffff));st.brooms++;},{R});
 // REEDS: standing water and the wettest ground (the pool's margin, a seep's runnel)
 CATCH.place(3.2,202,(x,z)=>smooth(.8,.95,F('wet',x,z))*(1-F('trod',x,z)*.7)*thin(x,z)*q*.85*CATCH.bias('reed',x,z),
  (x,y,z)=>{if(blocked(x,z,.4))return;const wy=BIO.waterH(x,z),h=rr(1.6,3.2),yy=wy>y?Math.min(wy-.3,y+.6):y-.05;if(wy-y>1.1)return;
   BIO.put('reed'+ri(0,3),[x,yy,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[h*rr(.7,1),h,h*rr(.7,1)],CATCH.col('reed',vc(PAL.reed)));st.reeds++;},{R,noMask:true});
 // SALTBUSH and BRINE LAMPS: the salt's margin, in stands (the noise picks which), brine lamps on thin crust too
 CATCH.place(6,203,(x,z)=>{const w=F('wet',x,z),cr=F('crust',x,z)+F('soda',x,z)*.6,ed=Math.max(F('silt',x,z),F('salt',x,z),cr);
   return smooth(.05,.3,ed)*smooth(.12,.28,w)*smooth(.75,.55,w)*smooth(.95,.7,cr)*(1-F('rock',x,z))*smooth(.6,.35,F('slope',x,z))*.45*thin(x,z)*q*CATCH.bias('salt',x,z);},
  (x,y,z)=>{if(blocked(x,z,.8))return;const lamp=standK(x,z)>.55||F('crust',x,z)>.45;
   if(lamp){const s=rr(.5,1.1);for(let k=0,n=ri(1,4);k<n;k++){const a=rr(0,TAU),d=k?rr(.6,1.8):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(BIO.mask(px,pz)<=0)continue;
     BIO.put('brinelamp'+ri(0,3),[px,BIO.terrainH(px,pz)-.04,pz],qEuler(0,rr(0,TAU),0),[s,s*rr(.8,1.1),s],CATCH.col('brinelamp',vc(PAL.brinelamp)));st.brinelamps++;}}
   else{const s=rr(.8,1.8)*CATCH.bias('saltbush',x,z);if(s<=0)return;BIO.put('saltbush'+ri(0,3),[x,y-.08,z],qEuler(0,rr(0,TAU),0),[s*rr(1,1.3),s,s*rr(1,1.3)],CATCH.col('saltbush',vc(PAL.saltbush)));st.saltbush++;}},{R});
 // THE DESERT PAVEMENT: stones on the reg and the fans, near the spine only (the ground's texture carries it further)
 CATCH.place(4,204,(x,z)=>{const d=BIO.lodD(x,z);if(d>near*.8)return 0;return smooth(.2,.6,F('reg',x,z))*(1-F('sand',x,z))*.4*q;},
  (x,y,z)=>{const s=rr(.08,.32),c=vc(PAL.stone,.9);BIO.put('stone',[x,y-s*.15,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s,s],c);st.stones++;},{R,lodMax:near});
 // FALLEN WOOD under the dead poplars
 CATCH.TREES.forEach((T,k)=>{if(T.sp!==0||!T.dead||T.lv<1)return;reseed(KRAND.hash(CATCH.SEED,205,k));
  for(let n=0,m=ri(0,2);n<m;n++){const a=rr(0,TAU),d=rr(2,T.H*.6),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;if(BIO.mask(x,z)<=0)continue;
   const len=rr(2,T.H*.5),r=rr(.12,.3),y=BIO.terrainH(x,z)+r*.6;BIO.put('log',[x,y,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[len,r,r],vc(PAL.wood,1));st.logs++;}});
 return{under:st};};
})();
