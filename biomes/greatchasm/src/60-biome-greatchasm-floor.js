// ================================================================= THE GREAT CHASM — the floor: what lies and grows on the ground
// By zone (50: GCH.zones) from the host's fields, thin everywhere (47-78 mm of rain, PLAN.md section 3):
//   the floor (XW)   bare pavement and dark sand; salt tufts in the salt hollows only; scattered cobbles
//   the desert (BWk) needle fur, grey cushions, pebble mats and crust rosettes on the flats, ember scrub on the warm slopes' feet, sac brush
//                    by the wadis; cobbles of the pavement
//   the wadis        bunch grass and sac brush where the runoff soaks in
//   the walls (ET+)  wall lichen on the rock and the boulders, grey cushions in the crevices, frost puffs over ~5 km (the high zone)
//   everywhere       boulders and fallen basalt columns under the steep rock (the talus field), more where the strata show
// Every pass is the core's cell lattice (BIO.grid's cell form: each cell KRAND.hash(world, kit, salt, cell), never the order of draws),
// in three LOD bands along the spine (near 7 m, mid 14 m, far 28 m cells); a cell's own stream (reseed) draws its shapes and colours.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=GCH.PAL,zones=GCH.zones,{bright,vary}=BIO.col;
const Y=(x,z)=>BIO.terrainH(x,z);
const tone=(set,k)=>bright(vary(pick(set),.02,.06,.06),k==null?1:k);
function around(x,z,n,dLo,dHi,fn){for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(dLo,dHi):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;if(i&&BIO.mask(px,pz)<=0)continue;fn(px,pz,i,a);}}
function tuft(item,x,z,h,w,col,tilt){const t=tilt==null?.06:tilt;BIO.put(item,[x,Y(x,z)-.05,z],qEuler(rr(-t,t),rr(0,TAU),rr(-t,t)),[w==null?h*.9:w,h,w==null?h*.9:w],col);}
/* a flat card on the ground, tilted to the ground's own slope (seated: its centre on the ground, lifted 6 mm) */
function flatOn(item,x,z,s,col){const e=1.5,hx=Y(x+e,z)-Y(x-e,z),hz=Y(x,z+e)-Y(x,z-e),n=[-hx/(2*e),1,-hz/(2*e)];
 BIO.put(item,[x,Y(x,z)+.006,z],qUp(n),[s,1,s*rr(.85,1.15)],col);}
function stone(x,z,set,big){const y=Y(x,z),r=(big?rr(.6,1.8):rr(.1,.35))*(.7+.6*rng());BIO.put(big?'boulder':'stone',[x,y+r*.1,z],qEuler(rr(0,1),rr(0,TAU),rr(0,1)),[r*rr(.9,1.4),r*.65,r],tone(set,rr(.8,1.1)));return r;}
function column(x,z){const y=Y(x,z),L=rr(1.2,3.5),w=rr(.5,.9),a=rr(0,TAU);   /* a fallen column, lying on its side */
 BIO.put('column',[x,y+w*.38,z],new BIO.host.THREE.Quaternion().setFromEuler(new BIO.host.THREE.Euler(Math.PI/2+rr(-.1,.1),a,0,'YXZ')),[w,L,w],tone(PAL.rockPale,rr(.85,1.05)));}

// ---------------------------------------------------------------- the planters, by zone: (x,z,Z,lv,st)
function plantFloor(x,z,Z,lv,st){
 if(Z.salt>.35&&rng()<.7){around(x,z,lv===2?ri(2,5):1,.3,1.4,(px,pz)=>tuft('salt',px,pz,rr(.18,.4),rr(.3,.5),tone(PAL.salt,1.05)));st.salt++;return;}
 if(rng()<.55){stone(x,z,rng()<.7?PAL.rock:PAL.rockRed,false);st.stones++;}}
function plantDesert(x,z,Z,lv,st){const t=rng();
 if(t<.24){around(x,z,lv===2?ri(2,4):1,.25,.9,(px,pz)=>tuft('needle',px,pz,rr(.2,.45),rr(.3,.5),tone(PAL.needle)));st.needle++;}
 else if(t<.38){tuft('cush',x,z,rr(.3,.8),rr(.6,1.3),tone(PAL.cush),.02);st.cush++;}
 else if(t<.5){flatOn('pebble',x,z,rr(.3,.7),tone(PAL.pebble));st.pebble++;}
 else if(t<.58){flatOn('rosette',x,z,rr(.2,.5),tone(PAL.rosette));st.rosette++;}
 else if(t<.66&&Z.slope>.12){tuft('ember',x,z,rr(.7,1.4),rr(.7,1.2),tone(PAL.ember));st.ember++;}
 else{stone(x,z,rng()<.6?PAL.rock:PAL.rockRed,false);st.stones++;}}
function plantWadi(x,z,Z,lv,st){const t=rng();
 if(t<.45){around(x,z,lv===2?ri(2,4):1,.3,1.1,(px,pz)=>tuft('grass',px,pz,rr(.35,.8),null,tone(PAL.grass)));st.grass++;}
 else if(t<.75){tuft('sac',x,z,rr(.5,1.1),rr(.6,1),tone(PAL.sac));st.sac++;}
 else{stone(x,z,PAL.rockPale,false);st.stones++;}}
function plantWall(x,z,Z,lv,st){const t=rng();
 if(Z.high>.4&&t<.35){around(x,z,lv===2?ri(2,4):1,.2,.8,(px,pz)=>tuft('puff',px,pz,rr(.12,.35),null,tone(PAL.puff)));st.puff++;return;}
 if(t<.55){flatOn('lichen',x,z,rr(.25,.6),tone(PAL.lichen,1.1));st.lichen++;}
 else if(t<.75){tuft('cush',x,z,rr(.2,.5),rr(.4,.9),tone(PAL.cush,.95),.02);st.cush++;}
 else{stone(x,z,PAL.rock,false);st.stones++;}}

// ---------------------------------------------------------------- the pass
GCH.buildFloor=function(R,q){q=q==null?1:q;R=R||2600;
 const st={salt:0,needle:0,cush:0,pebble:0,rosette:0,ember:0,grass:0,sac:0,lichen:0,puff:0,stones:0,boulders:0,columns:0};
 const L=BIO.LOD(),bands=[[7,L.floor[0],0,'near'],[14,L.floor[1],L.floor[0],'mid'],[28,1e9,L.floor[1],'far']],box=[-R,-R,R,R];
 const dens=Z=>Math.max(Z.floor*(.12+.6*Z.salt),Z.desert*.45,Z.wadi*.75,Z.wall*.3);
 bands.forEach((b,bi)=>{const lv=2-bi;
  BIO.grid('floor-'+b[3],b[0],(x,z)=>{const ld=BIO.lodD(x,z);if(ld>=b[1]||ld<b[2])return 0;const Z=zones(x,z);return q*(lv===0?.5:1)*clamp(dens(Z),0,1);},
   (x,y,z)=>{const Z=zones(x,z);
    if(Z.wadi>.4)plantWadi(x,z,Z,lv,st);else if(Z.wall>Math.max(Z.desert,Z.floor))plantWall(x,z,Z,lv,st);else if(Z.floor>Z.desert)plantFloor(x,z,Z,lv,st);else plantDesert(x,z,Z,lv,st);},
   {box,patch:.6,patchScale:.012,pad:.5});});
 // THE TALUS FIELD: boulders and fallen columns where the rock is steep and the strata show (under the walls, the bench lips, the mesas' feet),
 // lichen on a share of them. The boulders sit where the slope eases (the foot), not on the face (the core's cliff gate)
 BIO.grid('talus',12,(x,z)=>{if(BIO.lodD(x,z)>L.mid)return 0;const Z=zones(x,z),tal=BIO.field('talus',x,z);
   return q*clamp(tal*.6+Z.rock*.12*smooth(.15,.5,Z.slope),0,1)*(1-Z.barren)*(1-Z.road);},
  (x,y,z)=>{if(rng()<.3&&BIO.field('strata',x,z)>.2){column(x,z);st.columns++;return;}
   const r=stone(x,z,rng()<.75?PAL.rock:PAL.rockRed,true),gy=Y(x,z);st.boulders++;
   if(rng()<.45)for(let k=0,m=ri(1,3);k<m;k++){const a=rr(0,TAU),n=[Math.cos(a)*.5,1,Math.sin(a)*.5];
    BIO.put('lichen',[x+Math.cos(a)*r*.3,gy+r*.5,z+Math.sin(a)*r*.3],qUp(n),[r*rr(.5,.9),1,r*rr(.5,.9)],tone(PAL.lichen,1.1));st.lichen++;}},
  {box,patch:.5,patchScale:.015,pad:1.2});
 return{under:st};};
})();
