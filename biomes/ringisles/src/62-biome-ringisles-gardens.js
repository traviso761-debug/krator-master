// ================================================================= RING SEA ISLES — the gardens (the island crops, as stands)
// A town's fields, each a STAND keyed crop-<name> (the owner's list, 2026-10-15: tree crops coconut, mango, banana,
// coffee, clove; ground crops rice, taro, sweet potato, medicinal herbs, greens, sugar cane; and breadfruit, kava).
// kits/islanders' placeholder keys (fl-paddy, fl-taro, fl-banana, fl-breadfruit, fl-coconut) name the same stands
// (RINGISLES.GARDEN_ALIAS). RINGISLES.stand(key, {x, z, w, d, a, level}) plants one plot (a rectangle w x d turned by a,
// its ground at level: the host levels it), RINGISLES.buildGardens(plots) a list of them. The trees in a plot are the
// kit's own (banana, mango, coffee, clove, breadfruit) or borrowed (the Throne's coconut), grown by RINGISLES.treeAt.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const PAL=RINGISLES.PAL,C=RINGISLES.C,{bright,shade,vary,leafCol}=RINGISLES;
const Y=(x,z)=>BIO.terrainH(x,z);
const lc=(slot,c)=>RINGISLES.libCol(slot,c);
// a plot's frame: (u, v) in metres from its centre along its width and its depth, to the world
const frame=P=>{const c=Math.cos(P.a||0),s=Math.sin(P.a||0);return(u,v)=>[P.x+u*c-v*s,P.z+u*s+v*c];};
// a grid of points over the plot (spacing du x dv, a margin m, jittered j)
function rows(P,du,dv,m,j,fn){const W=frame(P),nu=Math.max(1,Math.floor((P.w-2*m)/du)),nv=Math.max(1,Math.floor((P.d-2*m)/dv));
 for(let a=0;a<=nu;a++)for(let b=0;b<=nv;b++){const u=-P.w/2+m+a*(P.w-2*m)/nu+rr(-j,j),v=-P.d/2+m+b*(P.d-2*m)/nv+rr(-j,j),p=W(u,v);fn(p[0],p[1],a,b);}}
// a bund (a low earth wall) from (u0,v0) to (u1,v1) in the plot's frame
function bund(P,u0,v0,u1,v1,h,w){const W=frame(P),a=W(u0,v0),b=W(u1,v1),L=Math.hypot(b[0]-a[0],b[1]-a[1]),y=P.level==null?Y((a[0]+b[0])/2,(a[1]+b[1])/2):P.level+(P.key==='crop-rice'?.35:0);
 BIO.put('bund',[(a[0]+b[0])/2,y-.15,(a[1]+b[1])/2],qEuler(0,-Math.atan2(b[1]-a[1],b[0]-a[0]),0),[L+w,h+.15,w],shade(C(pick(PAL.bund)),rr(-.1,.05)));}
const STANDS={
 // a flooded paddy behind its bunds: the water a hand deep over the mud, rice in rows (young green or ripening gold)
 'crop-rice':(P,st)=>{const lev=P.level==null?Y(P.x,P.z):P.level,ripe=h3(P.x,P.z,7701)<.35;
  bund(P,-P.w/2,-P.d/2,P.w/2,-P.d/2,.45,.7);bund(P,-P.w/2,P.d/2,P.w/2,P.d/2,.45,.7);bund(P,-P.w/2,-P.d/2,-P.w/2,P.d/2,.45,.7);bund(P,P.w/2,-P.d/2,P.w/2,P.d/2,.45,.7);
  BIO.put('paddywater',[P.x,lev+.22,P.z],qEuler(0,-(P.a||0),0),[P.w-.6,1,P.d-.6],C(pick(PAL.paddyWater)));
  rows(P,.62,.62,1.1,.06,(x,z)=>{const h=ripe?rr(.65,.9):rr(.35,.6);BIO.put('rice',[x,lev+.12,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[h*.7,h,h*.7],leafCol(ripe?PAL.riceGold:PAL.rice,1.15,.02,.06,.05));st.rice++;});},
 // taro in a wet bed: heart leaves held up on long stalks
 'crop-taro':(P,st)=>{const lev=P.level==null?Y(P.x,P.z):P.level;BIO.put('bund',[P.x,lev-.2,P.z],qEuler(0,-(P.a||0),0),[P.w,.28,P.d],C(pick(PAL.soil)));
  rows(P,.95,.95,.5,.12,(x,z)=>{const n=ri(3,5),h=rr(.7,1.15);for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.3,.3),hh=h*rr(.75,1.05),tx=x+Math.cos(a)*.18,tz=z+Math.sin(a)*.18;
    BIO.beam('rod',[x,lev+.05,z],[tx,lev+hh,tz],.025,.018,C(pick(PAL.taroStalk)));BIO.put('heart',[tx,lev+hh-.1,tz],qEuler(-rr(.5,1.0),-a+Math.PI/2,0),[hh*.55,hh*.6,1],leafCol(PAL.taro,1.15,.02,.06,.05));}st.taro++;});},
 // a banana grove: clumps in a loose grid
 'crop-banana':(P,st)=>{rows(P,3.6,3.6,1.6,.6,(x,z)=>{if(RINGISLES.treeAt('banana',x,Y(x,z),z))st.trees++;});},
 'crop-breadfruit':(P,st)=>{rows(P,10,10,4,1.2,(x,z)=>{if(RINGISLES.treeAt('breadfruit',x,Y(x,z),z))st.trees++;});},
 // a coconut plantation in rows, the grass under it grazed short
 'crop-coconut':(P,st)=>{rows(P,8,8,3,.6,(x,z)=>{if(RINGISLES.treeAt('coconut',x,Y(x,z),z))st.trees++;});
  rows(P,2.2,2.2,.5,.8,(x,z)=>{const h=rr(.12,.25);BIO.put('bunch',[x,Y(x,z)-.03,z],qEuler(0,rr(0,TAU),0),[h*1.4,h,h*1.4],leafCol(PAL.grassGreen,1.15,.02,.06,.05));st.grass++;});},
 // kava: knee-to-shoulder shrubs of jointed green stems, broad heart leaves, in rows
 'crop-kava':(P,st)=>{rows(P,1.5,1.4,.7,.15,(x,z)=>{const y=Y(x,z),h=rr(1.1,2.2);for(let k=0,n=ri(3,6);k<n;k++){const a=rr(0,TAU),tx=x+Math.cos(a)*.3,tz=z+Math.sin(a)*.3,th=h*rr(.7,1);
    BIO.beam('rod',[x,y-.05,z],[tx,y+th,tz],.025,.018,C(pick(PAL.kavaStem)));
    for(let j=0;j<3;j++){const b=rr(0,TAU),s=rr(.3,.45);BIO.put('kava',[tx,y+th*rr(.55,1),tz],qEuler(-rr(.3,.9),-b,0),[s,s,1],leafCol(PAL.kava,1.15,.02,.06,.05));}}st.kava++;});},
 'crop-sugarcane':(P,st)=>{rows(P,.9,1.3,.4,.15,(x,z)=>{const y=Y(x,z),h=rr(2.4,3.8);BIO.put('cane',[x,y-.05,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[h*.45,h,h*.45],lc('cane',leafCol(PAL.cane,1.15,.02,.06,.05)));
  if(rng()<.12){const s=rr(.5,.8);BIO.put('plume',[x,y+h*.95,z],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s*.4,s,s*.4],C(0xe8e0d0));}st.cane++;});},
 // the owner's other crops (2026-10-15)
 'crop-mango':(P,st)=>{rows(P,9,9,4,1,(x,z)=>{if(RINGISLES.treeAt('mango',x,Y(x,z),z))st.trees++;});},
 // coffee in rows on the upper slopes, a few shade trees (bananas) among them
 'crop-coffee':(P,st)=>{rows(P,2.2,2.6,1,.25,(x,z,a,b)=>{const sh=(a+b)%5===2&&b%2===0;if(RINGISLES.treeAt(sh?'banana':'coffee',x,Y(x,z),z))st.trees++;});},
 'crop-clove':(P,st)=>{rows(P,6.5,6.5,2.5,.6,(x,z)=>{if(RINGISLES.treeAt('clove',x,Y(x,z),z))st.trees++;});},
 // sweet potato: ridges covered by its creeping heart-leaved vines
 'crop-sweetpotato':(P,st)=>{const W=frame(P);for(let v=-P.d/2+.6;v<=P.d/2-.6;v+=1.1){const a=W(-P.w/2+.5,v),b=W(P.w/2-.5,v),L=Math.hypot(b[0]-a[0],b[1]-a[1]),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
   BIO.put('bund',[mx,Y(mx,mz)-.12,mz],qEuler(0,-Math.atan2(b[1]-a[1],b[0]-a[0]),0),[L,.3,.55],C(pick(PAL.soil)));}
  rows(P,.9,1.1,.5,.2,(x,z)=>{const y=Y(x,z)+.18,R=rr(.5,.8);BIO.put('creeper',[x,y,z],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[R,1,R],leafCol(PAL.sweetpotato,1.1,.02,.06,.05));
   for(let k=0;k<3;k++){const a=rr(0,TAU),s=rr(.14,.22);BIO.put('heart',[x+Math.cos(a)*.2,y,z+Math.sin(a)*.2],qEuler(-rr(.9,1.3),-a,0),[s,s,1],leafCol(PAL.sweetpotato,1.1,.02,.06,.05));}st.sweetpotato++;});},
 // medicinal herbs: a bed of mixed clumps (lemongrass, ginger, turmeric, basil in flower)
 'crop-herbs':(P,st)=>{const lev=Y(P.x,P.z);BIO.put('bund',[P.x,lev-.22,P.z],qEuler(0,-(P.a||0),0),[P.w,.3,P.d],C(pick(PAL.soil)));
  rows(P,.7,.7,.4,.12,(x,z,a,b)=>{const y=Y(x,z),t=(a*3+b)%4;
   if(t===0){const h=rr(.7,1.1);BIO.put('beachgrass',[x,y,z],qEuler(0,rr(0,TAU),0),[h*.8,h,h*.8],leafCol(PAL.herb,1.15,.02,.06,.05));}
   else if(t===1){for(let k=0;k<3;k++){const a2=rr(0,TAU);BIO.put('gingerleaf',[x,y+.3,z],qEuler(rr(-.1,.1),-a2,rr(.3,.7)),[.5,.4,.18],leafCol(PAL.herb,1.15,.02,.06,.05),{n:[0,1,0]});}}
   else{const R=rr(.3,.45);BIO.put('naupaka',[x,y+R*.4,z],qEuler(0,rr(0,TAU),0),[R,R*.7,R],leafCol(PAL.herb,1.2,.02,.06,.05),{n:[0,1,0]});
    if(t===3)BIO.put('halfflower',[x,y+R*.85,z],null,rr(.05,.07),C(pick(PAL.herbBloom)));}st.herbs++;});},
 // greens: rows of leafy rosettes
 'crop-greens':(P,st)=>{const lev=Y(P.x,P.z);BIO.put('bund',[P.x,lev-.22,P.z],qEuler(0,-(P.a||0),0),[P.w,.3,P.d],C(pick(PAL.soil)));
  rows(P,.45,.6,.3,.04,(x,z)=>{const y=Y(x,z)+.06;for(let k=0;k<5;k++){const a=k/5*TAU+rr(-.2,.2),s=rr(.16,.26);BIO.put('heart',[x,y,z],qEuler(-rr(.6,1.1),-a+Math.PI/2,0),[s,s*1.2,1],leafCol(PAL.greens,1.15,.02,.06,.05));}st.greens++;});},
};
RINGISLES.STANDS=STANDS;
RINGISLES.stand=function(key,P,st){key=RINGISLES.GARDEN_ALIAS[key]||key;const f=STANDS[key];if(!f){BIO.err('ringisles: no stand '+key);return null;}st=st||{rice:0,taro:0,trees:0,grass:0,kava:0,yam:0,cane:0,sweetpotato:0,herbs:0,greens:0};
 const G=RINGISLES.GARDEN[key];P=Object.assign({w:G.w,d:G.d,a:0,key},P);P.key=key;f(P,st);
 BIO.register({name:G.name,key,x:P.x,z:P.z,y:P.level==null?Y(P.x,P.z):P.level,r:Math.hypot(P.w,P.d)/2,h:G.tree?28:key==='crop-sugarcane'?5:3,garden:key});return st;};
RINGISLES.buildGardens=function(plots,q){reseed(620071);const st={rice:0,taro:0,trees:0,grass:0,kava:0,yam:0,cane:0,sweetpotato:0,herbs:0,greens:0,plots:0};
 (plots||[]).forEach(P=>{RINGISLES.stand(P.key,P,st);st.plots++;});return st;};
})();
