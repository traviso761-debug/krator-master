// ================================================================= KORONA — the summit's life (the idyllic end of the rule)
// On a top (the necanyons 'cap' and 'bench' zones): LACE PITCHERS in the sphagnum of the pavement's wet hollows (the host's
// bogAt), RAINBOW FANS in its soil pockets (the rich field: the reagent, never on bare rock), STORM PODS along the exposed
// rim. Each rainbow fan is named for the inspector (BIO.nameSet): it is what a party climbs for.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,fbm}=BIO.fn;const qEuler=KORONA.qEuler;
const PAL=KORONA.PAL,C=KORONA.C,P=KORONA.PLANTS,SEED=0x0C0A3;const {bright,vary}=BIO.col;
const col=(slot,set,k)=>KORONA.libCol(slot,bright(vary(pick(set),.03,.08,.06),k==null?1.2:k));
const tuft=(item,x,z,h,w,c)=>BIO.put(item,[x,BIO.terrainH(x,z)-.04,z],qEuler(rr(-.08,.08),rr(0,TAU),rr(-.08,.08)),[w,h,w],c);
const NAMED=[];
KORONA.buildFloor=function(R,q){q=q==null?1:q;R=R||1500;const L=BIO.radii(),st={lace:0,rfan:0,stormpod:0},H=BIO.host,bias=KORONA.bias,F=KORONA.F;
 NAMED.length=0;
 const lvOf=(x,z)=>{const d=BIO.lodD(x,z);return d<L.floor[0]?2:d<L.floor[1]?1:0;};
 const bog=(x,z)=>H.bogAt?H.bogAt(x,z):0,top=Z=>Z.zone==='cap'||Z.zone==='bench';
 // LACE PITCHERS in the bogs
 KORONA.place(2.6,301,(x,z,Z)=>top(Z)?smooth(.3,.7,bog(x,z))*smooth(-5,-7,Z.d)*.7*bias('lacepitcher',x,z,Z)*q:0,(x,y,z,Z)=>{const lv=lvOf(x,z),n=lv===2?ri(2,5):lv===1?2:1;
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.2,1):0,h=rr(.5,1.1)*(lv===0?1.4:1);tuft(rng()<.5?'lace0':'lace1',x+Math.cos(a)*d,z+Math.sin(a)*d,h,h*.75,col('lace',PAL.lace,1.1));st.lace++;}},{R,lodMax:L.floor[1]});
 // RAINBOW FANS in the soil pockets (rich), never in a bog and never on bare pavement
 KORONA.place(3.4,302,(x,z,Z)=>top(Z)?smooth(.3,.6,F('rich',x,z))*(1-smooth(.25,.5,bog(x,z)))*smooth(-5,-8,Z.d)*.55*bias('rainbowfan',x,z,Z)*q:0,(x,y,z,Z,i,j)=>{const lv=lvOf(x,z),n=lv===2?ri(1,3):1,k=KRAND.hash(SEED,i,j,5)%5;
  for(let f=0;f<n;f++){const a=rr(0,TAU),d=f?rr(.4,1):0,h=rr(.6,1.2),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
   BIO.put('rfan'+((k+f)%5),[px,BIO.terrainH(px,pz)-.03,pz],qEuler(rr(-.12,.12),rr(0,TAU),rr(-.12,.12)),[h*1.1,h,h*1.1],col('rfan',[PAL.rfan[(k+f)%9]],1.05));st.rfan++;}
  if(lv>=1&&(i+j)%2===0)NAMED.push({name:P.rainbowfan.name,plant:'rainbowfan',x,y,z,r:1.4,h:1.3});},{R,lodMax:L.floor[1]});
 // STORM PODS along the rim, just in from the edge
 KORONA.place(4,303,(x,z,Z)=>(Z.zone==='cap'&&Z.d>-26&&Z.d<-5)?.4*bias('stormpod',x,z,Z)*q:0,(x,y,z,Z)=>{const lv=lvOf(x,z),n=lv===2?ri(1,3):1;
  for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?rr(.4,1.2):0,h=rr(1,2);tuft(rng()<.5?'stormpod0':'stormpod1',x+Math.cos(a)*d,z+Math.sin(a)*d,h,h*.6,col('stormpod',PAL.stormpod,1.1));st.stormpod++;}},{R,lodMax:L.floor[1]});
 KORONA.NAMED=(KORONA.NAMED||[]).concat(NAMED);BIO.nameSet('korona.summit',NAMED.slice());
 return{summit:st};};
})();
