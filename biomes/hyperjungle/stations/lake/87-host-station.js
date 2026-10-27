// ================================================================= HOST — STATION 3's own life (PLAN-LANDS.md section 6; EXCHANGES.md geyser -> hyperjungle)
// After the kit's forest (88 calls stationBuild before the bake). Every place is a cell of a lattice, its tree or plant drawn from
// KRAND.hash(world, i, j, salt) and a reseed of the same hash: nothing the kit placed moves, and a cell's plant depends on no other.
//   stiltkapok  the kit's crimson kapok (sp 5) as the várzea's habit: 55-60% of its height, raised on 8-14 stilt roots from 3-9 m up
//               the bole; grown by the kit's own builder (HYPERJUNGLE.make, placeHero: the runtime LOD and its impostor as the kit's)
//   moriche     the moriche palm (Mauritia flexuosa, the aguajal): 35-50 m, a smooth grey stem and a crown of 12-16 broad leaves,
//               scaly red-brown fruit in hanging bunches, in pure stands in the várzea's back-swamps (the ground's low pockets)
//   skylily     the sky lily (Victoria): rimmed pads 6-9 m across, red beneath, white flowers turning pink, on the shallows of the
//               lake's edge; they ride the lake's level (89w)
//   floatgrass  the floating meadows (Paspalum and Echinochloa rafts): grass mats drifting on the open water and lodged against the
//               forest's edge; they ride the level too
//   pandan      geyser's stilt pandan, read in place (EXCHANGES.md: its floating fruit came down the basin's outflow): on the várzea's
//               lake edge and the river's banks, by GEYSER.make / grow in its own registry
// ?station=0 grows none of it.
function stationBuild(){
 if(new URLSearchParams(location.search).get('station')==='0')return null;
 const W=8113,LT=HYPERJUNGLE.LOD.tree,T3=THREE,C=h=>new T3.Color(h),out={stiltkapok:0,moriche:0,skylily:0,floatgrass:0,pandan:0};
 const S=KSPACE.create({cell:60}),CEN=BIO.center(),nearC=(x,z)=>Math.hypot(x-CEN[0],z-CEN[1])<1500;out.groves=[];   /* a view's subject inside the hero disc */(HYPERJUNGLE.TREES||[]).forEach(T=>S.insert(T,T.x,T.z,(T.rb||1)*1.4+3));
 const free=(x,z,r)=>!S.some(x,z,r,()=>true)&&BIO.clearOf(x,z,r);
 const cells=(cell,salt,fn)=>{const N=Math.ceil(TERR.R/cell);for(let j=-N;j<=N;j++)for(let i=-N;i<=N;i++){const h=KRAND.hash(W,i,j,salt),u=k=>KRAND.unit(KRAND.hash(h,k,0,salt));
  const x=(i+u(1))*cell,z=(j+u(2))*cell;if(Math.max(Math.abs(x),Math.abs(z))>TERR.R-60)continue;fn(x,z,h,u);}};
 BIO.cur='jungle/station';
 // the items the station adds, in the kit's registry (the kit's materials): the pads (a rimmed disc, green over red, lit both sides),
 // their flowers, the meadows' mats and tufts. They float (89w lifts them with the level)
 const defs=BIO.kitWrap('hyperjungle',{d(){const M=HYPERJUNGLE.MAT;
  if(!BIO.defs.skylily){const g=(function(){const pos=[],nor=[],uv=[],col=[],seg=28,R=[0,.55,.9,.97,1,1],Y=[0,.004,.012,.03,.09,.12];
    const top=new T3.Color(0x4f7a2e).convertSRGBToLinear(),rim=new T3.Color(0x8a2a24).convertSRGBToLinear();
    const P=(a,k)=>[Math.cos(a)*R[k],Y[k],Math.sin(a)*R[k]];
    for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU;for(let k=0;k<R.length-1;k++){const q=[P(a0,k),P(a1,k),P(a1,k+1),P(a0,k+1)];
      const c=k<3?top:top.clone().lerp(rim,k===3?.6:1);[0,1,2,0,2,3].forEach(m=>{pos.push(...q[m]);nor.push(0,1,0);uv.push(q[m][0]*.5+.5,q[m][2]*.5+.5);col.push(c.r,c.g,c.b);});}}
    /* the notch: the pad's cleft (Victoria's) left open at a = 0 by dropping nothing; the kit's vertex-coloured material shades it */
    return BIO.geo._make(pos,nor,uv,col);})();
   BIO.def('skylily',g,M.pod,{label:'Sky lily pads'});
   BIO.def('skyflower',BIO.geo.bloom(),M.bloom,{label:'Sky lily flowers'});
   BIO.def('floatgrass',BIO.geo.mat(),M.moss,{label:'Floating meadows'});
   BIO.def('floattuft',BIO.geo.clump(),M.under,{label:'Floating meadow grass'});}}});
 defs.d();
 const station=BIO.kitWrap('hyperjungle',{
  // ---- STILT KAPOKS: the várzea between 60 m and 1.5 km from the shore, off the channels and the back-swamps
  kapoks(){cells(150,0x6c01,(x,z,h,u)=>{const t=across(x,z);if(t>-60||t<-1500)return;if(u(3)>.62)return;
    if(brookDist(x,z)<60||groundH(x,z)<LOW+1.2)return;if(!free(x,z,18))return;
    reseed(h);const y=terrainH(x,z),T=HYPERJUNGLE.make(5,x,y,z);T.H*=.58;T.rb*=.62;T.crownR*=.6;T.butK=.12;   /* no buttresses: the stilts carry it */
    HYPERJUNGLE.placeHero(T,BIO.lodD(x,z)<900?2:1);
    const R0=REG[REG.length-1];if(R0&&/kapok/i.test(R0.name)){R0.name='Stilt kapok (the várzea)';R0.label='Stilt kapok';}
    // the stilt roots: arching out from 3-9 m up the bole to the mud, the bole's own bark (bucket limb5)
    if(LT){BIO.owner=[x,z];BIO.range=LT;}
    const n=8+Math.floor(KRAND.unit(KRAND.hash(h,9,0,1))*7),col=C(0x7a5a4c);if(!out.kapokAt&&nearC(x,z))out.kapokAt=[x,z,T.rb];
    for(let k=0;k<n;k++){const a=k/n*TAU+(KRAND.unit(KRAND.hash(h,k,1,2))-.5)*.5,yt=y+7+8*KRAND.unit(KRAND.hash(h,k,2,2)),d=9+10*KRAND.unit(KRAND.hash(h,k,3,2)),
      r0=HYPERJUNGLE.trunkR(T,yt)*.98,gx=x+Math.cos(a)*(r0+d),gz=z+Math.sin(a)*(r0+d),gy=terrainH(gx,gz)-.3,pts=[];
     for(let s=0;s<=6;s++){const q=s/6,rr2=r0+d*Math.pow(q,.8),hy=mix(yt,gy,Math.pow(q,1.6))+Math.sin(q*Math.PI)*1.2;pts.push({x:x+Math.cos(a)*rr2,y:hy,z:z+Math.sin(a)*rr2,r:mix(1.1,.4,q)});}
     BIO.tube('limb5',pts,col,{seg:5});}
    BIO.owner=null;BIO.range=null;
    S.insert(T,x,z,T.rb*1.4+8);out.stiltkapok++;});},
  // ---- MORICHE: groves in the back-swamps (the ground's low pockets, 250 m-1.5 km in), 12-30 palms each
  moriche(){cells(240,0x6c02,(cx,cz,h,u)=>{const t=across(cx,cz);if(t>-250||t<-1500)return;
    const pk=KRAND.fbm(cx*.0021,.5,cz*.0021,2,404);if(pk>.34||u(3)>.8)return;
    const n=12+Math.floor(u(4)*19),gr=60+50*u(5);let made=0;
    for(let k=0;k<n;k++){const hk=KRAND.hash(h,k,7,3),v=m=>KRAND.unit(KRAND.hash(hk,m,0,3)),a=v(1)*TAU,d=gr*Math.sqrt(v(2)),x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;
     if(brookDist(x,z)<30||across(x,z)>-40||!free(x,z,4))continue;
     const y=terrainH(x,z),H=35+15*v(3),rb=.38+.12*v(4),la=v(5)*TAU,lk=.02+.05*v(6),tx=x+Math.cos(la)*lk*H,tz=z+Math.sin(la)*lk*H,ty=y+H*(1-lk*lk*.5);
     if(LT){BIO.owner=[x,z];BIO.range=LT;}
     BIO.put('saptrunk1',[x,y-.5,z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[rb/.4,H+.5,rb/.4],C(0xa8a49a));   /* the smooth grey stem, on the ghostwood's pale bark (the small trunks' map is dark) */
     reseed(hk);HYPERJUNGLE.small.frondCrown(tx,ty,tz,9+3*v(7),16,-.5,.2,C(0x4a6a2a));HYPERJUNGLE.small.frondCrown(tx,ty+.4,tz,4,5,.5,.95,C(0x5a7a34));
     for(let b=0,nb=1+Math.floor(v(8)*3);b<nb;b++){const ab=v(9+b)*TAU;BIO.put('pod',[tx+Math.cos(ab)*1.2,ty-1.2,tz+Math.sin(ab)*1.2],qEuler(0,ab,0),2.4+v(12)*1.2,C(0x7a3a22));}
     BIO.owner=null;BIO.range=null;
     S.insert({x,z},x,z,3);made++;}
    if(made){out.moriche+=made;if(nearC(cx,cz))out.groves.push([cx,cz,gr]);REGISTER({name:'A moriche swamp (aguajal)',kind:'stand',label:'Moriche palm',key:'hyperjungle.moriche',x:cx,z:cz,y:terrainH(cx,cz),r:gr+8,h:52});}});},
  // ---- SKY LILIES and FLOATING MEADOWS on the lake's edge (open water at low water, .4-3 m deep, within 450 m of the shore)
  floating(){const lr=HYPERJUNGLE.LOD.floor?HYPERJUNGLE.LOD.mid:null;BIO.range=lr||null;
   cells(16,0x6c03,(x,z,h,u)=>{const t=across(x,z),dep=LOW-terrainH(x,z);if(t<0||t>450||dep<.4||dep>3.2)return;
    const lee=KRAND.fbm(x*.004,.5,z*.004,2,405);if(lee<.45)return;   /* the sheltered bays */
    if(u(3)<.55*smooth(.45,.7,lee)){const r=3+1.5*u(4);BIO.put('skylily',[x,LOW+.03,z],qEuler(0,u(5)*TAU,0),[r,1,r],C(0xffffff));out.skylily++;
     if(u(6)<.16)BIO.put('skyflower',[x+(u(7)-.5)*r,LOW+.25,z+(u(8)-.5)*r],qEuler(0,u(9)*TAU,0),.9+.4*u(10),C(u(11)<.5?0xf4f0e8:0xe890a8));}});
   cells(30,0x6c04,(x,z,h,u)=>{const t=across(x,z),dep=LOW-terrainH(x,z);if(t<-10||t>380||dep<.2)return;
    const near=smooth(380,40,t);if(u(3)>.5*near)return;
    const r=4+8*u(4);BIO.put('floatgrass',[x,LOW+.05,z],qEuler(0,u(5)*TAU,0),[r,1,r*(.6+.4*u(6))],C(0x9aa848));out.floatgrass++;
    for(let k=0,n=3+Math.floor(u(7)*5);k<n;k++){const a=KRAND.unit(KRAND.hash(h,k,4,5))*TAU,d=r*.7*KRAND.unit(KRAND.hash(h,k,5,5)),s=1.6+1.2*KRAND.unit(KRAND.hash(h,k,6,5));
     BIO.put('floattuft',[x+Math.cos(a)*d,LOW+.05+s*.25,z+Math.sin(a)*d],qEuler(0,a,0),[s,s*.7,s],C(0xa8b85a));}});
   BIO.range=null;}});
 try{station.kapoks();}catch(e){reportErr('station kapoks: '+e.stack);}
 try{station.moriche();}catch(e){reportErr('station moriche: '+e.stack);}
 try{station.floating();}catch(e){reportErr('station floating: '+e.stack);}
 // ---- the geyser's STILT PANDAN, read in place: the várzea's lake edge (60-400 m in) and the river's banks
 try{if(typeof GEYSER!=='undefined'){const sp=GEYSER.SPECIES.findIndex(Q=>Q.key==='pandan');
  cells(70,0x6c05,(x,z,h,u)=>{const t=across(x,z),b=brookDist(x,z),edge=t<-60&&t>-400,bank=b>26&&b<80&&t<-60;if(!edge&&!bank)return;
   if(u(3)>(bank?.5:.35))return;if(!free(x,z,4))return;
   reseed(h);const T=GEYSER.make(sp,x,terrainH(x,z),z),lv=BIO.lodD(x,z)<900?2:1;
   const t0=(BIO.stats['jungle/station']||{tris:0}).tris;if(LT){BIO.owner=[x,z];BIO.range=LT;BIO.minRange=0;}GEYSER.grow(T,lv);const t1=(BIO.stats['jungle/station']||{tris:0}).tris;
   if(LT){BIO.range=1e9;BIO.minRange=LT;GEYSER.grow(Object.assign({},T),0);}BIO.owner=null;BIO.range=null;BIO.minRange=0;
   if(!(t1>t0))return;   /* a hero that drew nothing (the builder kept clear) takes no volume (its stand-in alone is not one) */
   S.insert(T,x,z,3);REGISTER({name:'Stilt pandan (from the Steampits)',kind:'tree',label:'Stilt pandan',x,z,y:T.y0,r:(T.crownR||3)*1.6+2,h:T.H+4});out.pandan++;});}}
 catch(e){reportErr('station pandan: '+e.stack);}
 BIO.cur=null;return out;}
