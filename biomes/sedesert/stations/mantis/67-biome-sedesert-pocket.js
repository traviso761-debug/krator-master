// ================================================================= EASTERN DESERT, MANTIS'S POCKET — the floor
// The Bowl's floor pass (66: the reed shore, the halophytes at the pocket's edge, the reg beyond) runs first; then the pocket's own:
//   the SAVANNA       tall grass in the monsoon (the rank grass and the kit's grass, green-gold), blooms, croton bushes, aloes
//   the FOREST        its understory: croton, kalanchoe spikes in flower, aloes in the gaps, ferns and moss at the springs
//                     and the streams, fallen limbs
//   (the town's walled gardens are the host's: 88 grows their trees and their rows)
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,qEuler}=BIO.fn;
const {bright,vary,leafCol}=SEDESERT,{tuft,card,agaveR}=SEDESERT.small;
const F=(n,x,z)=>BIO.field(n,x,z);
/* dry: the mask and the water itself (the mask is decided on the closure, the water read on the baked field: they part at a pool's rim) */
const dry=(x,z)=>BIO.mask(x,z)>0&&BIO.waterH(x,z)<BIO.terrainH(x,z)+.05;
const PP={grass:[0x9a9a4a,0x8a9442,0xa8a050,0x7e8a3e,0xb0a456],rank:[0x7a9a8a,0x88a094,0x6e8e80],croton:[0x8a9a7a,0x96a484,0x7e8e70],
 kalanchoe:[0xe0602a,0xf07a30,0xd04a26],fern:[0x4a7a2e,0x56883a,0x3e6a28],bloom:[0xffffff],greens:[0x5a8a2e,0x6a9a3a,0x4e7a28],henna:[0x4a6a2a,0x56762e]};
Object.assign(SEDESERT.PLANTS,{
 croton:{name:'Croton',tags:{climate:'tropic',aridity:'semiarid',abyssal:true,riparian:'no',harvest:{wood:'fuel',edible:[],medicinal:true,notes:'Croton socotranus: the shrub of Socotra\'s slopes; a purge, and kindling.',fruit:null}},items:['small']},
 fern:{name:'Ferns',tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'yes',harvest:{wood:'none',edible:[],medicinal:false,notes:'At the springs and the streams only.',fruit:null}},items:['fern']},
 beard:{name:'Beard lichen',tags:{climate:'tropic',aridity:'humid',abyssal:true,riparian:'both',harvest:{wood:'none',edible:[],medicinal:true,notes:'Usnea on the forest\'s limbs in the humid air: a wound dressing.',fruit:null}},items:['beard']},
});
// a garden bed's plant, for the host's gardens (88): greens in rows, or a melon on its vine (a kit function, so its items are the kit's)
SEDESERT.bed=function(x,y,z,melon){if(melon){BIO.put('lobe',[x,y-.05,z],qEuler(0,rr(0,TAU),0),[.45,.25,.45],leafCol(PP.greens,1.1,.03));BIO.put('fruit',[x+rr(-.3,.3),y+.12,z+rr(-.3,.3)],null,[.22,.18,.22],0xc8c060);}
 else tuft('grass',x,y,z,rr(.35,.6),rr(.45,.7),leafCol(PP.greens,1.25,.03));};
const base=SEDESERT.buildFloor;
SEDESERT.buildFloor=function(R,q){const out=base(R,q);reseed(670021);q=q==null?1:q;R=R||3000;
 const st={grass:0,croton:0,kalanchoe:0,aloe:0,fern:0,blooms:0,rows:0};
 const ok=(x,z,p)=>!SEDESERT.blocked(x,z,p)&&BIO.clearOf(x,z,p)&&dry(x,z);
 /* COUNTED (2026-11-08, the instance cap): the spine runs along the shore, the streams and the springs, so the near band covers most of
    the pocket: this and the tall grass below put 643,785 'grass' and 315,146 'rankgrass' (the core's cap is 250k). A clump is now one or
    two tufts close (it was three to six) and the tall grass's cells are 6.2 m and 12 m (3.6, 7.5): 230,847 'grass' and 113,910 'rankgrass' now */
 function grass(x,y,z,lv){const n=lv===2?ri(1,2):1,h0=rr(.8,1.6)*(lv===0?1.5:1);
  for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1.8):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;
   const rk=rng()<.35;tuft(rk?'rankgrass':'grass',px,BIO.terrainH(px,pz),pz,h0*rr(.75,1.15),h0*rr(1,1.4),leafCol(rk?PP.rank:PP.grass,1.25,.03));}st.grass++;}
 function croton(x,y,z,lv){const Rs=rr(.7,1.6);card('small',x,y+Rs*.45,z,Rs*1.5,Rs*.95,leafCol(PP.croton,1.3,.03),.25);if(lv===2&&rng()<.5)card('small',x+rr(-.8,.8),y+Rs*.35,z+rr(-.8,.8),Rs,Rs*.7,leafCol(PP.croton,1.2,.03),.25);st.croton++;}
 function kalanchoe(x,y,z,lv){for(let i=0,n=lv===2?ri(2,5):1;i<n;i++){const a=rr(0,TAU),d=i?rr(.3,1.2):0,h=rr(.5,1.1);tuft('spire',x+Math.cos(a)*d,y,z+Math.sin(a)*d,h,h*.4,leafCol(PP.kalanchoe,1.2,.02));}st.kalanchoe++;}
 function fern(x,y,z,lv){for(let i=0,n=lv===2?ri(3,6):2;i<n;i++){const a=rr(0,TAU),d=i?rr(.4,1.6):0,h=rr(.5,1.2),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&!dry(px,pz))continue;
  tuft('fern',px,BIO.terrainH(px,pz),pz,h*1.3,h,leafCol(PP.fern,1.2,.03));}st.fern++;}
 function plant(x,y,z,lv){if(!ok(x,z,.6))return;const lu=F('lush',x,z),fo=F('forest',x,z),spr=F('spring',x,z),dl=F('delta',x,z),t=rng();
  const w=[lu*1.2,fo*1.5,Math.max(spr,dl)*fo*1.1],tot=w[0]+w[1]+w[2];if(tot<=0)return;let r=rng()*Math.max(1,tot),k=0;for(;k<3;k++){if(r<w[k])break;r-=w[k];}if(k>=3)return;
  if(k===0){if(t<.8)grass(x,y,z,lv);else if(t<.82)croton(x,y,z,lv);else if(t<.9){SEDESERT.blooms(x,y,z,rr(.6,1.4),ri(3,7),rng()<.5?[0xf0d040,0xe8c030]:[0xe87090,0xf0a0b0],null,{flat:true,tilt:.4,s0:.16,s1:.34});st.blooms++;}
   else if(t<.96){agaveR(x,y,z,SEDESERT.PAL.agaveRed,.8);st.aloe++;}else kalanchoe(x,y,z,lv);}
  else if(k===1){if(t<.4)croton(x,y,z,lv);else if(t<.62)kalanchoe(x,y,z,lv);else if(t<.78){agaveR(x,y,z,SEDESERT.PAL.agave,.7);st.aloe++;}else if(t<.9)fern(x,y,z,lv);else grass(x,y,z,lv);}
  else fern(x,y,z,lv);}
 const L=BIO.LOD(),bands=[[7,L.floor[0],0],[14,L.floor[1],L.floor[0]],[28,1e9,L.floor[1]]];
 bands.forEach((b,bi)=>{const lv=2-bi;BIO.grid(b[0]*.8,0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return .9*q*(lv===0?.6:1)*clamp(F('pocket',x,z)*1.2,0,1)*(1-F('garden',x,z));},
  (x,y,z)=>plant(x,y,z,lv),{patch:.6,patchScale:.012,pad:.6,box:b[1]<1e9?BIO.originBox(b[1]):null});});
 // THE UNDERSTOREY under the canopy (KNOWN_ISSUES: the floor was thin under the figs away from the springs): croton, kalanchoe and
 // aloes in the gaps, ferns where it is wetter, close and mid range
 [[4.5,L.floor[0],0,2],[9,L.floor[1],L.floor[0],1]].forEach(b=>{BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return smooth(.3,.7,F('forest',x,z))*.6*q;},
  (x,y,z)=>{if(!ok(x,z,.6))return;const lv=b[3],t=rng(),w=F('wet',x,z);
   if(t<.38)croton(x,y,z,lv);else if(t<.38+.3*smooth(.85,.97,w))fern(x,y,z,lv);else if(t<.82)kalanchoe(x,y,z,lv);else{agaveR(x,y,z,SEDESERT.PAL.agave,.7);st.aloe++;}},{patch:.6,patchScale:.015,pad:.6,box:BIO.originBox(b[1])});});
 // THE TALL GRASS: the monsoon's savanna is grass to the knee and the waist, not a lawn: a sward of tufts close by, bigger ones
 // further off (past that the ground's grass layer carries it)
 [[6.2,L.floor[0],0,2],[12,L.floor[1],L.floor[0],1]].forEach(b=>{BIO.grid(b[0],0,R,(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;return F('lush',x,z)*(1-F('garden',x,z))*.95*q;},
  (x,y,z)=>{if(SEDESERT.blocked(x,z,.4))return;const lv=b[3],h=rr(.7,1.5)*(lv===1?1.4:1)*1.2,rk=rng()<.3;
   tuft(rk?'rankgrass':'grass',x,y,z,h,h*rr(1.1,1.5)*(lv===1?1.3:1),leafCol(rk?PP.rank:PP.grass,1.25,.04));st.grass++;},{patch:.5,patchScale:.02,pad:.3,box:BIO.originBox(b[1])});});
 return Object.assign(out,{pocket:st});};
})();
