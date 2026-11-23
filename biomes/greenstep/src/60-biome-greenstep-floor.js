// ================================================================= GREENSTEP — floor
// Everything under the trees, by zone, from the same fields the kin rows read (GSTEP.zones):
//   the lower and spiral benches: ground fern under the canopy, bench grass in the open, escargot begonias in the wet shade
//   the cloud deck and the falls' spray: spray-moss cushions, fern, begonias
//   the banks and the basins' edges: sedge and reed, standing in the shallows
//   the paddies (the farm field): rice in its rows
//   the risers' talus and the benches' edges: basalt boulders and fallen columns, hanging moss off them where it is wet
// Three LOD bands along the spine (near / mid / far) at 8 / 16 / 32 m cells, then the shallows and the boulder fields. The kin trees are grown
// after this pass (89z: growKin) and keep clear of what it put down by the core's own clearance.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=GSTEP.PAL,zones=GSTEP.zones;
const {bright,vary,tint,means,leafCol}=GSTEP;
const Y=(x,z)=>BIO.terrainH(x,z);
const rockTint=(set,k)=>tint(vary(pick(set||PAL.rock),.02,.06,.06),means().rock,k==null?rr(.45,.7):k);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
function tuft(item,x,z,h,w,col,tilt){const t=tilt==null?.06:tilt;BIO.put(item,[x,Y(x,z)-.05,z],qEuler(rr(-t,t),rr(0,TAU),rr(-t,t)),[w==null?h*.9:w,h,w==null?h*.9:w],col);}
// ---------------------------------------------------------------- the plants
const fern=(x,z,lv,k)=>{const kk=k==null?1:k;around(x,z,lv===2?ri(3,6):2,.6,2.2,(px,pz)=>tuft('fern',px,pz,rr(.9,1.7)*kk,rr(1.3,2.2)*kk,leafCol(PAL.fern,1.1,.03,.08,.07),.1));};
const grass=(x,z,lv)=>{around(x,z,lv===2?ri(2,4):1,.3,1.1,(px,pz)=>tuft('grass',px,pz,rr(.45,.95),null,leafCol(PAL.grass,1.05,.03,.1,.08)));};
const sedge=(x,z,lv)=>{around(x,z,lv===2?ri(2,3):1,.3,.9,(px,pz)=>tuft('sedge',px,pz,rr(.7,1.5),null,leafCol(PAL.sedge,1.05,.03,.08,.06)));};
const moss=(x,z,lv)=>{around(x,z,lv===2?ri(2,4):1,.3,1.2,(px,pz)=>{const s=rr(.3,.9);BIO.put('mossC',[px,Y(px,pz)-.08,pz],qEuler(0,rr(0,TAU),0),[s,s*.4,s],bright(vary(pick(PAL.moss),.03,.08,.06),.95));});};
const begonia=(x,z,lv)=>{around(x,z,lv===2?ri(3,6):2,.15,.6,(px,pz)=>{const s=rr(.2,.38),a=rr(0,TAU);BIO.put('begonia',[px,Y(px,pz)+rr(.03,.12),pz],qUp([Math.cos(a)*.3,1,Math.sin(a)*.3]),[s,1,s],leafCol(PAL.begonia,.85,.02,.06,.06));});};
const rice=(x,z,lv)=>{around(x,z,lv===2?ri(3,5):2,.3,.9,(px,pz)=>tuft('rice',px,pz,rr(.6,.95),rr(.4,.6),leafCol(PAL.rice,1.05,.02,.06,.05)));};
function boulder(x,z,big){const y=Y(x,z),r=(big?rr(.7,1.8):rr(.25,.6))*(.7+.6*rng());BIO.put('boulder',[x,y+r*.1,z],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),[r*rr(.9,1.4),r*.65,r],rockTint(PAL.rock));return r;}
function column(x,z){const y=Y(x,z),L=rr(3,9),r=rr(.6,.8);BIO.put('column',[x,y+r*.35,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.1,.1)),[L,r*2,r*2],rockTint(PAL.rock,.5));return Math.max(L*.5,r);}
// ---------------------------------------------------------------- the planter: (x,z,Z,lv,st)
function plant(x,z,Z,lv,st){const t=rng(),shade=Z.tree*smooth(.45,.7,fbm(x*.0016,z*.0016,617,2)),mist=Math.max(Z.fog,smooth(.8,.95,Z.wet)*.6);
 if(Z.farm>.5){rice(x,z,lv);st.rice++;return;}
 if(Z.bank>.5&&t<.55){sedge(x,z,lv);st.sedge++;return;}
 if(t<.18+.25*mist){moss(x,z,lv);st.moss++;}
 else if(t<.5+.2*shade){fern(x,z,lv);st.fern++;}
 else if(t<.58+.12*mist*shade){begonia(x,z,lv);st.begonia++;}
 else if(t<.92-.3*shade){grass(x,z,lv);st.grass++;}
 else{boulder(x,z,false);st.stones++;}}
// ---------------------------------------------------------------- the pass
GSTEP.buildFloor=function(R,q){reseed(800071);q=q==null?1:q;R=R==null?3000:R;means();
 const st={fern:0,grass:0,sedge:0,moss:0,begonia:0,rice:0,stones:0,boulders:0,columns:0,hang:0};
 function at(x,z,lv){if(GSTEP.blocked(x,z,.6))return;const Z=zones(x,z);if(Z.live<.2)return;plant(x,z,Z,lv,st);}
 const L=BIO.LOD(),bands=[[8,L.floor[0],0],[16,L.floor[1],L.floor[0]],[32,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const Z=zones(x,z);return .9*q*(lv===0?.5:1)*clamp(Z.live,0,1);},
   (x,y,z)=>at(x,z,lv),{patch:.55,patchScale:.014,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // THE SHALLOWS: sedge and reed at the rivers' and the basins' edges
 BIO.grid(7,0,R,(x,z)=>{if(BIO.lodD(x,z)>=L.mid)return 0;return .5*q*smooth(1.2,.2,BIO.depth(x,z));},
  (x,y,z)=>{const lv=BIO.lodD(x,z)<L.floor[0]*1.2?2:1,w=BIO.waterH(x,z);around(x,z,lv===2?3:1,.3,1,(px,pz)=>{BIO.put('sedge',[px,Math.max(Y(px,pz),w-.35),pz],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[rr(.6,1),rr(.9,1.6),rr(.6,1)],leafCol(PAL.sedge,1.05,.03,.08,.06));});st.sedge++;},
  {patch:.6,patchScale:.03,noMask:true,depth:[-.1,.8],pad:1,box:BIO.window('water')});
 // THE TALUS AND THE BENCHES' EDGES: basalt boulders and whole fallen columns where the rock shows on the gentler ground (a riser's foot, a
 // rille's lip), hanging moss off their tops where it is wet
 BIO.grid(13,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z);return q*clamp(Z.rock*.5*smooth(.12,.45,Z.slope)*smooth(.92,.7,Z.slope)+BIO.field('talus',x,z)*.4,0,1)*(1-Z.flow)*(1-smooth(.35,.7,Z.site));},
  (x,y,z)=>{if(GSTEP.blocked(x,z,1.5)||BIO.mask(x,z)<=0)return;const isCol=rng()<.3,r=isCol?column(x,z):boulder(x,z,true),gy=Y(x,z);if(isCol)st.columns++;else st.boulders++;
   const wet=Math.max(BIO.field('fog',x,z),smooth(.6,.9,BIO.field('wet',x,z)));
   if(wet>.3&&rng()<.6){for(let k=0,m=ri(1,3);k<m;k++){const a=rr(0,TAU),rr0=Math.min(r,1.2);BIO.put('mossH',[x+Math.cos(a)*rr0*.6,gy+rr0*.65,z+Math.sin(a)*rr0*.6],qEuler(0,a,0),[rr(.5,.9),rr0*rr(.8,1.4),1],leafCol(PAL.mossHang,1.05,.02,.06,.06));st.hang++;}}},
  {patch:.5,patchScale:.015,pad:1.5});
 GSTEP.COUNTS=st;return{under:st};};
})();
