// ================================================================= GUILIN — the ground plants (rice, ferns, silvergrass, moss, the lotus)
// By zone (46): RICE in every paddy by its state (a field's top as one card across it, its rows in water while young, a
// grown field dense and a ripe one gold; near the spine the tufts themselves); KARST FERNS at the towers' feet and between
// the stone forest's blades; CHINESE SILVERGRASS on the stone forest's floor and the plain's waste corners; MOSS on the
// blades' crests and at their feet; the SACRED LOTUS on the pond.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm,qEuler}=BIO.fn;
const PAL=GUILIN.PAL,C=GUILIN.C;const {bright,vary}=BIO.col;
const col=(slot,set,k)=>GUILIN.libCol(slot,bright(vary(pick(set),.03,.1,.06),k==null?1.2:k));
function tuft(item,x,z,h,w,c,y){BIO.put(item,[x,y==null?BIO.terrainH(x,z)-.04:y,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w,h,w],c);}
GUILIN.buildFloor=function(R,q,pond){q=q==null?1:q;R=R==null?1500:R;const L=BIO.radii(),st={rice:0,fields:0,ferns:0,grass:0,moss:0,lotus:0,pods:0};
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<L.floor[0]?2:d<L.floor[1]?1:0;};
 // RICE: one card across each field (its state's), and the tufts near
 const TOP={young:.12,green:.62,ripe:.86};
 GUILIN.PADDIES.forEach(P=>{if(P.state==='flooded'||Math.hypot(P.x,P.z)>R)return;reseed(KRAND.hash(0x51CE,P.i));
  const set=P.state==='young'?PAL.riceYoung:P.state==='ripe'?PAL.riceRipe:PAL.rice,item=P.state==='young'?'ricerows':'ricebed';
  const base=P.state==='ripe'?Math.max(...P.poly.map(p=>BIO.terrainH(p[0],p[1]))):P.level;
  BIO.put(item,[P.x,base+TOP[P.state],P.z],qEuler(0,-P.ang,0),[P.w,1,P.d],col(item,set,P.state==='ripe'?.95:1.0));st.fields++;
  if(lvOf(P.x,P.z)<2)return;
  const ca=Math.cos(P.ang),sa=Math.sin(P.ang),sp=P.state==='young'?1.0:1.3;
  for(let u=-P.w/2+sp/2;u<P.w/2;u+=sp)for(let v=-P.d/2+sp/2;v<P.d/2;v+=sp){if(rng()>.75*q)continue;const x=P.x+u*ca-v*sa,z=P.z+u*sa+v*ca,g=BIO.terrainH(x,z);
   const h=P.state==='young'?rr(.25,.4)+(P.level-g):rr(.75,1.0)+(P.state==='ripe'?.1:(P.level-g)*.3);
   tuft('rice',x+rr(-.15,.15),z+rr(-.15,.15),h,h*(P.state==='young'?.6:.9),col('rice',set,1.1),g-.02);st.rice++;}});
 // KARST FERNS at the towers' feet (in their shade) and between the blades
 GUILIN.place(2.6,301,(x,z,Z)=>(Z.zone==='foot'?smooth(3,6,Z.footD)*smooth(22,8,Z.footD)*.55:Z.zone==='grove'?.3*Z.grove:0)*q,(x,y,z,Z)=>{const lv=lvOf(x,z),n=lv===2?ri(4,7):2,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k*TAU/n+rr(-.25,.25),l=rr(.45,.95);BIO.put('fern',[x,BIO.terrainH(x,z)+.03,z],qEuler(rr(-.08,.08),-a,rr(.25,.75)),[l,l,l*rr(.8,1)],col('fern',PAL.fern,1.2));st.ferns++;}},{R,lodMax:L.floor[1]});
 // SILVERGRASS: clumps on the stone forest's floor, in the plain's corners, on the banks above the bars
 GUILIN.place(4,302,(x,z,Z)=>(Z.zone==='grove'?.55*Z.grove:Z.zone==='plain'?.08*smooth(.58,.66,fbm(x*.008+4,z*.008,77,2)):Z.zone==='bank'?.12:0)*q,(x,y,z,Z)=>{const lv=lvOf(x,z),n=lv===2?ri(5,9):lv===1?3:1,r=rr(.4,.9);
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),h=rr(1.1,2.0)*(lv===0?1.3:1);tuft('silvergrass',x+Math.cos(a)*d,z+Math.sin(a)*d,h,h*.8,col('silvergrass',PAL.silver,1.1));st.grass++;
   if(lv===2&&rng()<.35)tuft('plume',x+Math.cos(a)*d,z+Math.sin(a)*d,h*1.25,h*.5,col('silvergrass',PAL.silverPlume,1.05));}},{R,lodMax:L.floor[1]});
 // MOSS on the blades' crests (the layout's blade zone) and at their feet
 GUILIN.place(1.8,303,(x,z,Z)=>(Z.zone==='blade'?.75*smooth(-.3,-1,Z.d):Z.zone==='grove'&&Z.footD<4?.4:0)*q,(x,y,z,Z)=>{const s=rr(.5,1.3);
  BIO.put('moss',[x,y+.03,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[s,1,s],col('moss',PAL.moss,1.1));st.moss++;},{R,lodMax:L.floor[1]});
 // THE LOTUS on the pond: leaves held over the water, flowers and seed heads among them
 if(pond){GUILIN.place(1.6,304,(x,z,Z)=>pond.at(x,z)<.86?.7*q:0,(x,y,z,Z)=>{const w=pond.level,lift=rng()<.4?0:rr(.2,.9),s=rr(.5,1.0);
   BIO.put('lotus',[x,w+.02+lift,z],qEuler(rr(-.25,.25)*(lift?1:0),rr(0,TAU),rr(-.25,.25)*(lift?1:0)),[s,1,s],col('lotus',PAL.lotus,1.15));st.lotus++;
   if(lift)BIO.beam('rod',[x,w-.3,z],[x,w+lift,z],.012,.01,C(0x5a7a3a));
   const u=rng();if(u<.12){const h=rr(.6,1.1);BIO.beam('rod',[x+.3,w-.3,z],[x+.3,w+h,z],.012,.01,C(0x5a7a3a));
     BIO.put('lotusbloom',[x+.3,w+h,z],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.16,.24),GUILIN.libCol('lotusbloom',pick(PAL.lotusBloom)));}
   else if(u<.2){const h=rr(.6,1.0);BIO.beam('rod',[x-.3,w-.3,z],[x-.3,w+h,z],.012,.01,C(0x5a7a3a));
     BIO.put('lotuspod',[x-.3,w+h,z],qEuler(rr(-.3,.3),rr(0,TAU),0),rr(.13,.17),bright(pick(PAL.lotusPod),1.1));st.pods++;}},{R,wet:true});}
 return{under:st};};
})();
