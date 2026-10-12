// ================================================================= GEYSER — floor
// Everything under the trees, by zone (GEYSER.zones) and by the water's own records:
//   WARM      the warm crust: hot-springs panic grass (reddening where hotter), nodding clubmoss in patches, geothermal
//             moss cushioned over the sinter's edge, thermal ferns where it cools
//   MARGIN    the cool meadow of the floor: grass and ferns, denser; the creek's banks: reeds and ferns
//   THE RUN-OFF  walked channel by channel (GEYSER.R.runoff): flame streamers lying in the sheet of water where it has
//             cooled under ~60 degC, combed out down the flow; mat jelly on its banks
//   THE WATER kettle lilies floating on the Stair's cooler pools and the creek's slow reaches
// Three LOD bands along the spine at 4 / 8 / 16 m cells; the run-off and the water near the spine only.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm,qEuler}=BIO.fn;
const PAL=GEYSER.PAL,zones=GEYSER.zones,blocked=GEYSER.blocked,C=GEYSER.C,leafCol=GEYSER.leafCol,bright=BIO.col.bright,vary=BIO.col.vary;
function tuft(item,x,y,z,h,w,col){BIO.put(item,[x,y-.04,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w,h,w],col);}
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
const hotOK=(x,z)=>GEYSER.at(x,z).T<68;
// panic grass: green, yellower and reddening as the ground gets hotter
function grass(x,y,z,lv,heat,k){const h=rr(.25,.55)*(k||1)*(lv===0?1.5:1),red=smooth(.12,.3,heat);
 around(x,z,lv===2?ri(3,6):lv===1?2:1,.3,1.3,(px,pz)=>{if(!hotOK(px,pz))return;const c=rng()<red?leafCol(PAL.grassRed,1.2,.03,.1,.06):leafCol(PAL.grass,1.25,.04,.12,.06);tuft('grass',px,BIO.terrainH(px,pz),pz,h*rr(.8,1.15),h*1.4,c);});}
function fern(x,y,z,lv){const L=rr(.5,1.1)*(lv===0?1.4:1);around(x,z,lv===2?ri(1,2):1,.6,1.6,(px,pz)=>{if(!hotOK(px,pz))return;const py=BIO.terrainH(px,pz),c=leafCol(PAL.fern,1.25,.03,.1,.06),n=lv===2?ri(5,8):3,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k*TAU/n+rr(-.25,.25),l=L*rr(.75,1.1);BIO.put('fern',[px,py+.03,pz],qEuler(rr(-.08,.08),-a,rr(.25,.75)),[l,l,l*rr(.8,1.0)],bright(vary(c,.01,.04,.04),1));}});}
function club(x,y,z,lv){around(x,z,lv===2?ri(4,9):2,.2,1.1,(px,pz)=>{if(!hotOK(px,pz))return;const h=rr(.12,.3);tuft('clubmoss',px,BIO.terrainH(px,pz),pz,h,h*1.3,leafCol(PAL.club,1.25,.03,.1,.06));});}
function moss(x,y,z,lv){const R=rr(.25,.8);BIO.put('moss',[x,y-.06,z],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[R,R*rr(.3,.5),R*rr(.8,1.2)],bright(vary(pick(PAL.moss),.03,.1,.06),1.1));
 if(lv===2)around(x,z,ri(1,3),R,R*2.2,(px,pz)=>{const r=R*rr(.4,.7);BIO.put('moss',[px,BIO.terrainH(px,pz)-.05,pz],qEuler(0,rr(0,TAU),0),[r,r*.4,r],bright(vary(pick(PAL.moss),.03,.1,.06),1.1));});}
function reed(x,y,z,lv){around(x,z,lv===2?ri(2,4):1,.3,1,(px,pz)=>{const h=rr(1.1,2.2);tuft('reed',px,Math.max(BIO.terrainH(px,pz),BIO.waterH(px,pz)-.3),pz,h,h*.5,leafCol(PAL.reed,1.2,.03,.08,.05));});}

// ---------------------------------------------------------------- the pass
GEYSER.FLOOR_ZONES=['warm','margin','creek'];
GEYSER.buildFloor=function(R,q){reseed(600631);q=q==null?1:q;R=R||1300;
 const st={grass:0,fern:0,club:0,moss:0,reed:0,streamers:0,jelly:0,lilies:0};
 function plant(x,y,z,lv){if(blocked(x,z,.5))return;const Z=zones(x,z);if(Z.scald>.2||Z.live<.5)return;const h=Z.g.heat;
  const w=[Z.warm*1.2,Z.margin*1.0,Z.creek*.9];let tot=w[0]+w[1]+w[2];if(tot<=.02)return;let r=rng()*Math.max(1,tot);
  if(r<w[0]){const u=rng();if(u<.5){grass(x,y,z,lv,h,1);st.grass++;}else if(u<.72&&h>.06){club(x,y,z,lv);st.club++;}else if(u<.88&&Z.g.sinter>.15){moss(x,y,z,lv);st.moss++;}else{fern(x,y,z,lv);st.fern++;}return;}
  r-=w[0];if(r<w[1]){if(rng()<.62){grass(x,y,z,lv,h,1.5);st.grass++;}else{fern(x,y,z,lv);st.fern++;}return;}
  r-=w[1];if(r<w[2]){if(rng()<.55){reed(x,y,z,lv);st.reed++;}else{fern(x,y,z,lv);st.fern++;}}}
 const L=BIO.radii(),bands=[[4,L.floor[0],0],[8,L.floor[1],L.floor[0]],[16,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .8*q*(lv===0?.5:1);},(x,y,z)=>plant(x,y,z,lv),
  {patch:.55,patchScale:.03,pad:.4,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // THE RUN-OFF: streamers in the sheet where it has cooled under ~60 degC, lying down the flow; jelly on the banks
 for(const ch of GEYSER.R.runoff){const P=ch.P;for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],s=b[2],T=GEYSER.chT(ch,s),w=GEYSER.chW(ch,s);
   if(T>60||T<36||BIO.lodD(b[0],b[1])>L.mid)continue;const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,ux=dx/l,uz=dz/l,yaw=Math.atan2(ux,uz);
   const dense=smooth(60,52,T)*smooth(36,42,T)*q;
   for(let k=0,n=Math.round(w*1.4*dense);k<n;k++){const off=rr(-.85,.85)*w,x=b[0]-uz*off+ux*rr(-1.2,1.2),z=b[1]+ux*off+uz*rr(-1.2,1.2),y=BIO.terrainH(x,z),g=GEYSER.at(x,z);
    if(g.film<.3||g.T>62)continue;const L1=rr(.5,1.3);
    BIO.put('streamer',[x,y+.03,z],qEuler(0,yaw+rr(-.25,.25),0),[rr(.18,.32),1,L1],T>50?leafCol(PAL.streamer,1.25,.03,.08,.06):rng()<.6?leafCol(PAL.streamer,1.1,.03,.1,.08):leafCol(PAL.streamerGreen,1.2,.03,.1,.06));st.streamers++;}
   if(i%3===0&&rng()<.5*dense){const sd=rng()<.5?-1:1,off=sd*w*rr(1.05,1.5),x=b[0]-uz*off,z=b[1]+ux*off;if(GEYSER.at(x,z).T<62&&!blocked(x,z,.3)){const r=rr(.25,.7);
    BIO.put('jelly',[x,BIO.terrainH(x,z)-.05,z],qEuler(0,rr(0,TAU),0),[r,r*rr(.35,.6),r*rr(.8,1.3)],bright(vary(pick(PAL.jelly),.03,.1,.06),1.1));st.jelly++;}}}}
 // THE WATER: kettle lilies on the Stair's cooler pools and the creek's slower reaches
 BIO.grid(2.2,0,R,(x,z)=>{if(BIO.lodD(x,z)>L.mid)return 0;const g=GEYSER.at(x,z);if(g.T>48)return 0;const tr=g.terr>.97&&g.pl>-50?smooth(.2,.1,g.heat):0,cr=BIO.field('flow',x,z)>.85?.2:0;return (tr*.09+cr)*q;},
  (x,y,z)=>{const wl=BIO.waterH(x,z);if(wl<-1e8||wl-y<.12)return;for(let k=0,n=ri(2,6);k<n;k++){const px=x+rr(-1.2,1.2),pz=z+rr(-1.2,1.2);if(BIO.waterH(px,pz)-BIO.terrainH(px,pz)<.1)continue;
   const r=rr(.35,.85);BIO.put('lily',[px,wl+.012,pz],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[r,1,r],rng()<.25?leafCol(PAL.lilyRed,1.15,.03,.08,.05):leafCol(PAL.lily,1.2,.03,.08,.05));st.lilies++;
   if(rng()<.2){const r2=rr(.4,.8);BIO.put('lilyflower',[px+rr(-1,1),wl+.014,pz+rr(-1,1)],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[r2,1,r2],GEYSER.LIB.lilyb?C(0xf4f4ec):leafCol(PAL.lily,1.2,.03,.08,.05));}}},
  {patch:.5,patchScale:.04,noMask:true,pad:.3,box:BIO.window('stair')});
 return{under:st};};
})();
