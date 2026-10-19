// ================================================================= NECANYONS — the ground plants (fonio, ringgrass, seep ferns)
// By zone (46): SANDPAN FONIO in the sand pans of the caps and the benches (the staple: wild here, sown round Pinnacle
// Rock's foot); RINGGRASS hummocks on the caps and the stack tops, each a ring grown out from a dead middle; maidenhair and
// moss (SEEP CURTAINS) at the walls' wet feet. The floor between the rocks is the hyperjungle's own understorey.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm,qEuler}=BIO.fn;
const PAL=NECANYONS.PAL,C=NECANYONS.C;const {bright,vary}=BIO.col;
const col=(slot,set,k)=>NECANYONS.libCol(slot,bright(vary(pick(set),.03,.1,.06),k==null?1.2:k));
function tuft(item,x,z,h,w,c){BIO.put(item,[x,BIO.terrainH(x,z)-.04,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w,h,w],c);}
NECANYONS.buildFloor=function(R,q){q=q==null?1:q;R=R||1500;const L=BIO.radii(),st={fonio:0,ringgrass:0,ferns:0};
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<L.floor[0]?2:d<L.floor[1]?1:0;};
 // FONIO in the pans
 NECANYONS.place(2.4,301,(x,z,Z)=>(Z.zone==='cap'||Z.zone==='bench')?Z.pan*smooth(-4.5,-6,Z.d)*(Z.zone==='cap'?.75:.45)*q:0,(x,y,z,Z)=>{const lv=lvOf(x,z),n=lv===2?ri(3,7):lv===1?2:1;
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.2,1.1):0,h=rr(.25,.55)*(lv===0?1.5:1);tuft('fonio',x+Math.cos(a)*d,z+Math.sin(a)*d,h,h*1.2,col('fonio',PAL.fonio,1.15));st.fonio++;}},{R,lodMax:L.floor[1]});
 // RINGGRASS: a hummock is a ring of tufts round a bare middle
 NECANYONS.place(5,302,(x,z,Z)=>(Z.zone==='cap'||Z.zone==='stack')?(1-Z.pan)*smooth(-4.5,-6.5,Z.d)*.45*q:0,(x,y,z,Z)=>{const lv=lvOf(x,z),r=rr(.5,1.6),n=lv===2?Math.round(r*9):lv===1?4:2;
  for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.2,.2),d=r*rr(.75,1.05),h=rr(.3,.6);tuft('ringgrass',x+Math.cos(a)*d,z+Math.sin(a)*d,h,h*1.3,col('ringgrass',PAL.ring,1.1));st.ringgrass++;}},{R,lodMax:L.floor[1]});
 // SEEP CURTAINS at the walls' wet feet: fronds fanned out of the talus
 NECANYONS.place(3,303,(x,z,Z)=>Z.zone==='foot'?smooth(2.5,4,Z.footD)*smooth(16,6,Z.footD)*smooth(.2,.5,Z.seep)*.6*q:0,(x,y,z,Z)=>{const lv=lvOf(x,z),n=lv===2?ri(4,7):2,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k*TAU/n+rr(-.25,.25),l=rr(.5,1.1);BIO.put('seepfern',[x,BIO.terrainH(x,z)+.03,z],qEuler(rr(-.08,.08),-a,rr(.25,.75)),[l,l,l*rr(.8,1)],col('fern',PAL.fern,1.25));st.ferns++;}},{R,lodMax:L.floor[1]});
 return{under:st};};
})();
