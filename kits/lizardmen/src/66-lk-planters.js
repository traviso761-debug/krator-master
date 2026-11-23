// prefix: lkp
// ================================================================= SPIRAL RIFT-PLANT PLANTERS & SHRUBBERIES (66-lk-planters.js)
// Cultivated XA hypertropic Rift-floor flora (after biomes/rift: coiled fiddlehead tree-ferns, purple Vain fan-fronds,
// hooked mawtrumpet pitchers, carrotfrill pod-stalks, stinging anemonestalks, ballvine melons and phyllotaxis cycads)
// set in stepped verdigris-stone and cast-bronze spiral planters and 75/105 deg leiwen hedge beds (owner, 2026-11-18):
//   1. lk-planter-helix  (7737): stepped three-turn Archimedean/polygonal spiral planter ascending round a central Rift cycad
//   2. lk-shrubbery-coil (7738): 75/105 deg squared-spiral (leiwen) stone-kerbed Rift topiary hedge bed with central basin
//   3. lk-planter-urn    (7739): cast-bronze Shang fangding botanical cauldron overflowing with Rift vines, fans & frill-tree
// Frame: origin on the ground at the plot centre, +z the front.

const LKP_PAL={
 teal:[0x247a68,0x1e6c5c,0x2e8c76],
 fern:[0x3b7a34,0x4a8c3c,0x2f662c],
 lime:[0x82b03a,0x92c044,0x729e32],
 vain:[0x8654b4,0x9664c6,0x7446a2],
 pod:[0xd8427a,0xe25838,0xc43268],
 pitch:[0x6e8c3a,0x5c7a32]};
function lkpC(k){return jc(pick(LKP_PAL[k]),.06);}

/* Tightly coiled Rift fern crozier (logarithmic fiddlehead spiral tube with paired lateral pinnae blades). */
function lkpFiddlehead(x,y,z,ry,H,r,col,tipCol){
 W(x,y,z,ry,()=>{
  const cFn=t=>{
   if(t<.58){const u=t/.58;return [0,H*u*(.92-.12*u),H*.38*u*u];}
   const u=(t-.58)/.42,a=u*TAU*1.45,rad=H*.16*(1-.72*u);
   return [0,H*.46+Math.sin(a)*rad,H*.38+H*.14-Math.cos(a)*rad];};
  tube('matW',cFn,t=>{const q=r*(1-.62*t)+.012;return [q,q*1.15];},18,5,col,{caps:true});
  /* Serrated lateral pinnae along the lower stalk */
  for(let i=1;i<=5;i++){const t=i*.095,p=cFn(t),L=H*(.22-.026*i);
   for(const s of [-1,1])WX(p[0],p[1],p[2],s*1.15,.35,s*.25,()=>box('matW',0,0,L*.5,.07,.02,L,tipCol||col));}
  const tp=cFn(1);sph('matW',tp[0],tp[1],tp[2],r*.65,tipCol||lkpC('lime'),1,6);});}

/* Canonical Rift `Vain` purple-violet iridescent pleated fan-frond (`biomes/rift` PAL.vain). */
function lkpVainFan(x,y,z,ry,tilt,sz,col){
 W(x,y,z,ry,()=>{
  beam('reed',[0,0,0],[0,sz*.38,sz*.14],.035*sz,lkpC('teal'),true,5);
  WX(0,sz*.34,sz*.12,0,tilt,0,()=>{
   const f=(u,v)=>{const a=(u-.5)*PI*.88,rr=sz*(.12+.88*v),pleat=((Math.round(u*12)%2)?.035:-.035)*sz*v;
    return [Math.sin(a)*rr,Math.cos(a)*rr*.86,pleat+.12*sz*v*v];};
   psurf('matW',f,12,4,col||lkpC('vain'),{});
   psurf('matW',f,12,4,col||lkpC('vain'),{flip:true});});});}

/* Carnivorous Rift `mawtrumpet` pitcher cup (flared chartreuse/oxblood chalice with inward-hooked ivory rim teeth). */
function lkpMawTrumpet(x,y,z,ry,h,r){
 W(x,y,z,ry,()=>{
  lathe('matW',0,0,[[r*.22,0],[r*.34,h*.28],[r*.28,h*.56],[r*.62,h*.86],[r*.88,h],[r*.76,h*.96]],10,lkpC('pitch'),{});
  ring('lacqR',0,h*.98,0,r*.84,r*.09,P('oxblood'),0,0,0,12);
  for(let k=0;k<7;k++){const a=k*TAU/7;
   lzHorn(Math.cos(a)*r*.82,h,Math.sin(a)*r*.82,Math.atan2(-Math.cos(a),-Math.sin(a)),r*.42,r*.045,{curl:.75,lean:.45,mk:'ivory',col:P('tusk'),nt:4,ns:4});}});}

/* Rift `carrotfrill` rosette stalk with hot-magenta fizzing frillpods under a radiating leaf whorl. */
function lkpCarrotFrill(x,y,z,h,sc){
 W(x,y,z,0,()=>{
  cyl('cane',0,0,0,.055*sc,h,lkpC('teal'),6,.038*sc);
  for(let k=0;k<7;k++){const a=k*TAU/7;
   WX(0,h-.04,0,a,.48,0,()=>box('matW',0,0,.28*sc,.12*sc,.025*sc,.56*sc,lkpC('lime')));
   if(k%2===0)sph('lacqR',Math.cos(a)*.14*sc,h-.14*sc,Math.sin(a)*.14*sc,.065*sc,lkpC('pod'),1.35,6);}
  cone('lacqR',0,h,0,.11*sc,.26*sc,lkpC('pod'),7);});}

/* Phyllotaxis spiral Rift cycad / screw-pandan: scale-armoured trunk with 9 or 11 stiff V-fronds at 137.5 deg golden angles. */
function lkpSpiralCycad(x,y,z,h,R,chir){
 W(x,y,z,0,()=>{
  tube('wood',t=>[Math.sin(t*2.2)*(chir||1)*.12*t,t*h,.08*Math.cos(t*1.8)*t],t=>{const q=.22*(1-.32*t);return [q,q];},8,6,P('reedD'),{caps:true});
  for(let k=0;k<11;k++){const u=k/10,a=k*2.39996*(chir||1),fy=h*(.58+.42*u),len=R*(1-.38*u),droop=.25+.45*(1-u);
   W(0,fy,0,a,()=>{
    const fFrond=t=>[0,Math.sin(t*PI*.62)*len*.38-droop*len*t*t,t*len];
    tube('matW',fFrond,t=>[.14*(1-.72*t),.035],7,4,k%3===0?lkpC('lime'):lkpC('teal'),{caps:true});});}
  cone('lacqR',0,h+.02,0,.16,.44,lkpC('pod'),7);});}

/* Clipped/mounded Rift cushion-shrub clump (`prism bush` / `violet dome`) for spiral hedge beds. */
function lkpShrubMound(x,y,z,rx,ry,rz,kind){
 const col=kind===0?lkpC('teal'):kind===1?lkpC('fern'):kind===2?lkpC('vain'):lkpC('lime');
 ellip('matW',x,y+ry*.55,z,rx,ry,rz,col,x*.7+z*.3,9);
 ellip('matW',x+.18*rx,y+ry*.82,z-.12*rz,rx*.68,ry*.58,rz*.68,kind===2?lkpC('vain'):lkpC('lime'),1.1,8);}

/* ---------------------------------------------------------------- 1. Spiral Rift-Fern Planter (stepped Archimedean spiral) */
defBuilding({key:'lk-planter-helix',name:'Spiral Rift-Fern Planter',seed:7737,caste:'all',cut:false,w:8,d:8,h:6.4,budget:55000,
 front:{x:0,z:4,yaw:0},tags:{types:['park','civic'],wealth:'rich',role:'planter'},
 note:'a raised verdigris-stone and cast-bronze spiral planter winding 2.25 turns upward round a central basalt drum, planted in ascending phyllotaxis order with coiled Rift fiddlehead croziers, purple Vain fan-fronds, hooked mawtrumpet cups and a crown cycad',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1;
  const stCol=v===1?P('jade'):P('verd'),dkCol=P('basaltD'),brCol=P('bronze');
  /* Chamfered dark basalt octagonal footing */
  const oct=(r)=>{const out=[];for(let i=0;i<8;i++){const a=i/8*TAU+PI/8;out.push([Math.cos(a)*r,Math.sin(a)*r]);}return out;};
  prism('cyclo',oct(3.65),0,.32,dkCol);
  /* Stepped 19-segment rising spiral kerb & humus terrace (`r = 3.25 m -> 1.05 m`, `y = 0.65 m -> 2.35 m`) */
  const N=19;
  for(let i=0;i<N;i++){
   const u=i/(N-1),a=u*TAU*1.65*chir+v*.5,r=lerp(3.05,1.08,u),hSeg=lerp(.68,2.28,u),wSeg=lerp(.98,.66,u);
   const x=Math.cos(a)*r,z=Math.sin(a)*r,yaw=-a+PI/2;
   W(x,.32,z,yaw,()=>{
    box('cyclo',0,0,0,wSeg*1.08,hSeg,wSeg,i%2?stCol:dkCol);
    box('bronzeC',0,hSeg-.06,0,wSeg*1.16,.08,wSeg*1.08,brCol);
    box('earth',0,hSeg-.02,0,wSeg*.90,.06,wSeg*.84,P('earth'));
    /* Ascending Rift botanical sequence along the spiral ramp */
    const md=(i+v)%4;
    if(md===0)lkpFiddlehead(0,hSeg,0,a+.4,1.35+.55*u,.075,lkpC('teal'),lkpC('lime'));
    else if(md===1)lkpVainFan(0,hSeg,0,a,.38,1.05+.35*(1-u),lkpC('vain'));
    else if(md===2){lkpShrubMound(0,hSeg,0,.44,.34,.42,i%3);lkpCarrotFrill(.08,hSeg,.06,.78+.35*u,.95);}
    else lkpMawTrumpet(0,hSeg,0,a*1.3,.68+.28*u,.24);});}
  /* Central cylindrical verdigris-and-bronze pedestal urn holding the specimen spiral Rift cycad */
  cyl('stoneP',0,.32,0,1.05,2.45,stCol,10,.92);
  ring('bronzeC',0,2.72,0,.98,.075,brCol,0,0,0,16);
  W(0,1.65,.98,0,()=>lzEye(0,0,0,0,.32,{mk:'bronze'}));
  cyl('earth',0,2.74,0,.84,.08,P('earth'),10);
  lkpSpiralCycad(0,2.78,0,2.15,1.75,chir);
  for(let k=0;k<3;k++){const a=k*TAU/3+.3;lkpFiddlehead(Math.cos(a)*.55,2.78,Math.sin(a)*.55,-a+PI/2,1.25,.065,lkpC('fern'),lkpC('lime'));}}});

/* ---------------------------------------------------------------- 2. Leiwen Topiary Shrubbery (75/105 deg squared-spiral hedge) */
defBuilding({key:'lk-shrubbery-coil',name:'Leiwen Rift Shrubbery',seed:7738,caste:'all',cut:false,w:12,d:10,h:4.8,budget:65000,
 front:{x:0,z:5,yaw:0},tags:{types:['park','plaza','civic'],wealth:'rich',role:'shrubbery'},
 note:'a 75 and 105 degree squared-spiral (leiwen) botanical parterre: low battered verdigris-stone and cast-bronze kerbs winding inward (with one deliberate flaw gap) filled with sculpted teal, chartreuse and purple Vain Rift hedges around a bronze basking basin',
 build(o){const v=((o&&o.v)|0)%5,chir=v%2?-1:1;
  const stCol=v===2?P('jade'):P('verd'),dkCol=P('basaltD'),brCol=P('bronze');
  /* Skew 75/105 deg paved stone parterre plinth (`w=10.8, d=8.8`) */
  const sk=.18*chir,P0=[[-5.1-sk,-4.1],[5.1-sk,-4.1],[5.1+sk,4.1],[-5.1+sk,4.1]];
  prism('stoneP',P0,0,.22,dkCol);
  /* Squared-spiral (`leiwen`) planter trough segments winding inward in 9 straight runs (skip middle of run 3: the deliberate flaw!) */
  const runs=[];let x0=-4.35*chir,z0=-3.35,wx=8.7,wz=6.7,dir=0;
  for(let s=0;s<9;s++){
   const horiz=dir%2===0,len=horiz?wx:wz;
   const dx=horiz?[1,0,-1,0][dir]*chir:0,dz=horiz?0:[0,1,0,-1][dir];
   const x1=x0+dx*len+dz*.16*len*chir,z1=z0+dz*len;
   runs.push([x0,z0,x1,z1,s]);
   x0=x1;z0=z1;dir=(dir+1)%4;
   if(s>=2){if(horiz)wx-=1.85;else wz-=1.55;}
   if(wx<1.6||wz<1.4)break;}
  for(const [ax,az,bx,bz,si] of runs){
   const L=Math.hypot(bx-ax,bz-az);if(L<.6)continue;
   const ux=(bx-ax)/L,uz=(bz-az)/L,yaw=Math.atan2(ux,uz),hKerb=.48+.05*si;
   const nSteps=Math.max(2,Math.round(L/.95));
   for(let k=0;k<nSteps;k++){
    if(si===2&&k===Math.floor(nSteps/2))continue;   /* the deliberate leiwen hedge flaw: a narrow stepping-stone gap! */
    const f=(k+.5)/nSteps,segL=L/nSteps-.04,px=lerp(ax,bx,f),pz=lerp(az,bz,f);
    W(px,.22,pz,yaw,()=>{
     box('cyclo',0,0,0,.78,hKerb,segL,si%2?stCol:dkCol);
     box('bronzeC',0,hKerb-.04,0,.84,.05,segL+.04,brCol);
     box('earth',0,hKerb-.01,0,.64,.04,segL*.9,P('earth'));
     /* Dense clipped/mounded Rift hedge pillows + accent Vain fans, fiddleheads & frillpods */
     lkpShrubMound(0,hKerb,0,.46,.38+.04*(si%3),segL*.54,(si+v+(k%2))%4);
     if((k+si)%3===0)lkpVainFan(0,hKerb+.18,0,k*1.7,.42,.82,lkpC('vain'));
     else if((k+si)%4===1)lkpCarrotFrill(0,hKerb+.22,0,.72,.85);
     else if((k+si)%5===0)lkpMawTrumpet(0,hKerb+.16,0,k*1.1,.56,.20);});}
   /* Corner spiral cycad / fiddlehead cluster at every 75/105 deg turn */
   if(si<4)lkpFiddlehead(bx,.22+hKerb,bz,si*1.6,1.45,.07,lkpC('teal'),lkpC('lime'));}
  /* Central cast-bronze spiral-eye basin & tall Rift cycad at the heart of the shrubbery coil */
  cyl('bronzeC',0,.22,0,1.28,.54,brCol,12,1.36);
  cyl('jade',0,.70,0,1.12,.09,hc(0x286a62),12);
  lkpSpiralCycad(0,.74,0,2.45,1.85,chir);
  for(let c=0;c<5;c++){const a=c*TAU/5+v*.3;lkpVainFan(Math.cos(a)*.85,.74,Math.sin(a)*.85,-a+PI/2,.45,1.05,lkpC('vain'));}}});

/* ---------------------------------------------------------------- 3. Bronze Fangding Rift-Tree Urn (plaza botanical cauldron) */
defBuilding({key:'lk-planter-urn',name:'Bronze Fangding Rift Urn',seed:7739,caste:'all',cut:false,w:6,d:6,h:5.8,budget:45000,
 front:{x:0,z:3,yaw:0},tags:{types:['park','civic'],wealth:'rich',role:'planter'},
 note:'a four-legged cast-bronze Shang fangding botanical vessel on a chamfered verdigris-stone plinth, embossed with leiwen panels and overflowing with cascading Rift ballvine melons, purple Vain fans and a gnarled multi-crowned Rift trumpet-tree',
 build(o){const v=((o&&o.v)|0)%5;
  const stCol=v===3?P('jade'):P('verd'),brCol=v%2?P('bronze'):P('verd');
  /* Stepped verdigris-stone plinth + four cast-bronze pillar legs + embossed rectangular Shang cauldron */
  box('cyclo',0,0,0,4.2,.36,4.2,P('basaltD'));
  box('stoneP',0,.36,0,3.5,.28,3.5,stCol);
  for(const sx of [-1,1])for(const sz of [-1,1]){
   cyl('bronzeC',sx*.96,.64,sz*.96,.18,.88,P('bronze'),8,.22);
   lzHorn(sx*1.32,2.48,sz*1.32,Math.atan2(sx,sz),.68,.08,{curl:.65,lean:.35,mk:'bronzeC',col:brCol,nt:5,ns:5});}
  box('bronzeC',0,1.46,0,2.75,1.08,2.75,brCol);
  box('bronzeC',0,2.48,0,3.02,.14,3.02,P('bronze'));
  for(const q of [0,PI/2,PI,-PI/2])W(0,1.62,0,q,()=>W(0,0,1.39,0,()=>lzLeiwen(2.15,.74,{cell:.26,mk:'bronze',back:'lacq',eye:q===0})));
  box('earth',0,2.54,0,2.52,.10,2.52,P('earth'));
  /* Gnarled multi-stemmed Rift `trumpet`/`frill` specimen tree + cascading `ballvine` tendrils & ribbed green melons */
  for(let b=0;b<3;b++){const a=b*TAU/3+v*.45,hB=2.35+.35*b;
   tube('wood',t=>[Math.cos(a)*(.18+.72*t),2.60+t*hB,Math.sin(a)*(.18+.72*t)],t=>{const q=.16*(1-.45*t);return [q,q];},8,6,P('reedD'),{caps:true});
   const tx=Math.cos(a)*.90,tz=Math.sin(a)*.90,ty=2.60+hB;
   ellip('matW',tx,ty+.18,tz,1.08,.48,1.08,b===0?lkpC('lime'):lkpC('teal'),a,9);
   lkpCarrotFrill(tx,ty+.32,tz,.55,.85);}
  /* Understorey ring of purple Vain fans, coiled fiddleheads & hanging ballvine melons over the bronze rim */
  for(let k=0;k<5;k++){const a=k*TAU/5+.2;
   lkpVainFan(Math.cos(a)*.92,2.62,Math.sin(a)*.92,-a+PI/2,.52,.98,lkpC('vain'));
   lkpFiddlehead(Math.cos(a+.6)*.78,2.62,Math.sin(a+.6)*.78,-(a+.6)+PI/2,1.15,.06,lkpC('fern'),lkpC('lime'));}
  for(let m=0;m<3;m++){const a=m*TAU/3+1.05,mx=Math.cos(a)*1.42,mz=Math.sin(a)*1.42;
   sagRope('reed',[mx*.7,2.58,mz*.7],[mx,1.72,mz],-.12,.028,lkpC('fern'),6);
   sph('matW',mx,1.66,mz,.21,lkpC('lime'),1.15,8);}}});
