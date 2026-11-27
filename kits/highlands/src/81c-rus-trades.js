/* ================================================================= HIGHLANDS / RUSTIC — Slavic & Carpathian trades (81c)
   Craft, food, hospitality, civic, sacred, defence, guild and highland land trades for the Slavic / Carpathian /
   Novgorodian rustic vernacular (Free Clans of Ardent, Reed Lake, Klippeport, highland benches and rural cantons).
   Round-log srub walls (hnRULogBox), fieldstone socles (hnSocle / hRubB), turf (hnRUTurf) and fish-scale / larch
   shingle gables (hnRUShingle), shatyor tented roofs (hnRUShatyor), carved nalichniki window surrounds (hnNal),
   pierced prichelina bargeboards, okhlupen' / konyok ridge finials, solar rozetka & kolovrat discs, and rospis'
   folk accents. No electric light anywhere in the branch. Seeds 26000-26299. */

/* ---------------------------------------------------------------- Slavic / Carpathian rustic helpers (prefix hnRU) */
const HRU_TAG=(type,wealth,extra)=>Object.assign({type,wealth,lit:false},extra||{});

/* Round-log srub wall box with saddle-notched projecting log ends (v oblo) and optional carved pletenka belt frieze */
function hnRULogBox(x,y,z,w,h,d,ry,c,ext,frieze){
 hnLogBox(x,y,z,w,h,d,ry,c,ext==null?.32:ext);
 if(frieze){const fp=loc(x,z,0,d/2,ry==null?0:ry);hnFrieze(fp[0],y+h-.42,fp[1],ry==null?0:ry,w-.4,.34);}}

/* Steep Carpathian / Novgorodian shingle or fish-scale gable with pierced prichelina bargeboards & okhlupen' finial */
function hnRUShingle(x,y,z,w,d,pitch,ry,shC,bargeC,style,over,endItem,endC){
 const ov=over==null?.75:over,rot=ry==null?0:ry;
 const top=hnGable(x,y,z,w,d,pitch,rot,'hScaleB',shC,ov,endItem||'hGableLog',endC);
 hnBarge(x,y,z,w,d,pitch*d/2,rot,ov,bargeC||hC(HPAL.white),style||'lace');
 return top;}

/* Octagonal North-Rus' log drum with kokoshnik keel-gables, 8-sided shatyor shingle tent spire & solar finial */
function hnRUShatyor(x,y,z,r,drumH,tentH,logC,shC,trimC,kokosh){
 kput('hOctL',[x,y,z],null,[r,drumH,r],logC);
 vB('hPaint',x,y+drumH-.16,z,r*2.08,.18,r*2.08,0,trimC);
 if(kokosh!==false){
  for(let k=0;k<4;k++){const a=k*Math.PI/2,p=loc(x,z,0,r*.94,a);
   hnKokoshnik(p[0],y+drumH-.08,p[1],a,r*1.12,r*.92,'hKeelSh',shC,true);}}
 const tip=hnTent(x,y+drumH,z,r*1.32,tentH,'hTentSh',shC);
 vPst('vIron',x,tip-.25,z,.045,1.25,hC(0x2e2a26));
 vBall('hGold',x,tip+.55,z,.13,hC(HPAL.gold[0]));
 kput('hPaint',[x,tip+.82,z],null,[.52,.08,.08],hC(HPAL.gold[1]));
 return tip+1;}

/* North-Rus' / Carpathian roofed golubets grave-post or votive post with tiny shingle hood, prichelina & rozetka */
function hnRUGolubets(x,y,z,ry,woodC,trimC){
 const rot=ry==null?0:ry,wc=woodC||hC(vPick(HPAL.aged)),tc=trimC||hC(HPAL.white);
 vB('hRubB',x,y,z,.46,.22,.46,rot,hC(vPick(HPAL.rubble)));
 vPst('vPostB',x,y+.22,z,.09,1.48,wc);
 vB('hPaint',x,y+1.18,z,.44,.08,.1,rot,tc);
 vnGableRoof(x,y+1.62,z,.68,.56,.36,rot,'vShingleB',wc.clone().multiplyScalar(.88),.1,'vGableW',tc,.08);
 for(const sz of[-1,1]){const lp=loc(x,z,0,sz*.34,rot);kput('hLaceV',[lp[0],y+1.68,lp[1]],qEuler(0,rot+(sz>0?0:Math.PI),0),[.68,.18,1],tc);}
 if(KIT.defs.hM_d_sun){const sp=loc(x,z,0,.11,rot);kput('hM_d_sun',[sp[0],y+1.36,sp[1]],qEuler(0,rot,0),[.26,.26,1],null);}}

/* Slavic veshala tall two-rail drying frame hung with dyed cloth bolts, hides or nets */
function hnRUVeshala(x,y,z,ry,L,h,woodC,pal){
 const rot=ry==null?0:ry,wc=woodC||hC(vPick(HPAL.aged)),len=L==null?4.2:L,ht=h==null?2.6:h;
 for(const s of[-1,1]){const p=loc(x,z,s*len/2,0,rot);
  vPst('vPostB',p[0],y,p[1],.085,ht+.15,wc);
  for(const sz of[-1,1]){const f=loc(x,z,s*len/2,sz*.55,rot);beam('vWood',[f[0],y,f[1]],[p[0],y+ht*.55,p[1]],.07,.07,wc);}}
 const a=loc(x,z,-len/2-.18,0,rot),b=loc(x,z,len/2+.18,0,rot);
 beam('vWood',[a[0],y+ht,a[1]],[b[0],y+ht,b[1]],.08,.08,wc);
 beam('vWood',[a[0],y+ht*.58,a[1]],[b[0],y+ht*.58,b[1]],.065,.065,wc);
 const cols=pal||[0x244a80,0xb83224,0xd89e32,0xf3ead8,0x2f6d4c];
 const n=Math.max(2,Math.round(len/.78));
 for(let i=0;i<n;i++){const u=-len/2+.42+i*(len-.84)/Math.max(1,n-1),p=loc(x,z,u,0,rot);
  kput('vCloth',[p[0],y+ht-.52,p[1]],vQ(rot,0,rr(-.04,.04)),[.58,.96,1],hC(vPick(cols)));}}

Object.assign(HTRADE,{
 hl_rus_bakehouse:'bread',hl_rus_butcher:'pig',hl_rus_weaver:'shears',hl_rus_distillery:'barrel',
 hl_rus_tannery:'boot',hl_rus_inn:'horse',hl_rus_woodcarver:'wheel',hl_rus_warehouse:'sack',
 hl_rus_charcoal_works:'hammer',hl_rus_generator:'gear',hl_rus_school:'book',hl_rus_guild_lodge:'hammer',
 hl_rus_tollhouse:'scales',hl_rus_healer:'mortar',hl_rus_market:'scales',hl_rus_orchard:'sheaf',
 hl_rus_dairy:'barrel',hl_rus_envoy_lodge:'star',hl_rus_boatyard:'axe',hl_rus_quay:'sack',
 hl_rus_fishdock:'fish',hl_rus_ferry:'horse'});

/* ================================================================ 1. FOOD AND HOSPITALITY */

/* 1. hl_rus_bakehouse — Slavic log bakehouse with whitewashed clay pech' oven, corbelled chimney hood, peel rack & bread counter */
function buildHlRusBakehouse(G,o){reseed(26001+(o.v|0));const W=8.6,D=6.8,F=.45,H=2.9;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.88,1.02)),sh=hC(vPick(HPAL.shingle)),white=hC(vPick(HPAL.stucco)),trim=hC(vPick([HPAL.red,HPAL.ochre])),dk=hC(vPick(HPAL.tar));
 vnReg('Log bakehouse (bakers)',-.4,0,8.8,F+H+4.8);
 hnSocle(0,0,-.4,W+.24,F,D+.24,0);hnRULogBox(0,F,-.4,W,H,D,0,log,.32,true);
 const top=hnRUShingle(0,F+H,-.4,W,D,1.12,0,sh,hC(HPAL.white),'horns',.75,'hGableLog',log);
 hnForm('hFormT',-W/2-.03,F+H+.9,-.4,-Math.PI/2,2.2,1.1);hnForm('hFormT',W/2+.03,F+H+.9,-.4,Math.PI/2,2.2,1.1);
 const fz=-.4+D/2;
 vnDoor(2.1,F,fz,0,1.05,2.05,'hPaint',trim,dk,false);vnStairs(2.1,0,fz+.48,0,1.4,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 hnNal(-2.3,F+.92,fz,0,.85,1.05,'glass',hC(HPAL.white),{shutters:true,accent:trim});
 hnNal(W/2,F+.92,-.8,Math.PI/2,.8,1,'glass',hC(HPAL.white),{accent:trim});
 /* bread-selling shutter counter under front eave + sign */
 FURNISH('hl_rus_shutter_counter',-.1,F,fz+.52,0);hnSign(3.5,F+2.45,fz,0,'bread',.9);
 /* whitewashed Slavic clay pech' oven annex on -x with vaulted baking dome, ember mouth, peel rack & tall brick/stone hood */
 const ox=-W/2-1.65,oz=-.8;
 hnSocle(ox,0,oz,3.1,.55,3.8,0);vB('vPlaster',ox,.55,oz,2.9,1.65,3.5,0,white);
 kput('vDomeP',[ox,2.2,oz],null,[1.42,.95,1.68],white);
 vnShedRoof(ox,2.65,oz,3.3,4,.55,-Math.PI/2,'vShingleB',sh,.35,.14);
 vB('vClayB',ox+.1,1.05,oz+1.76,.95,.85,.18,0,hC(0x9a4e32));vB('vDarkB',ox+.1,1.12,oz+1.82,.62,.54,.08,0);
 vBall('vEmber',ox+.1,1.22,oz+1.74,.22,null,.12);
 hnStoneChimney(ox+.45,F+H-1.1,oz-.6,top-F-H+2.1,.82);
 /* wooden baker's peels leaning at the oven + birch firewood + flour sacks */
 for(let k=0;k<3;k++){const px=ox-1.1+k*.35;beam('vWood',[px,0,oz+2.05],[px+.08,2.15,oz+1.68],.045,.045,log);vB('vWood',px+.08,1.95,oz+1.66,.26,.36,.03,0,hC(0xd4a86a));}
 hnWoodpile(-W/2-1.6,0,2.8,0,2.8,1.35);hnSacks(3.6,0,fz+1.2,4);hnBarrel(W/2+.75,0,1.2,.34,.85);
 vnFolk(.4,fz+2.4,2,1.6);}

/* 2. hl_rus_butcher — Carpathian log butcher shop & tall koptil'nya timber smokehouse, meat racks & fenced yard */
function buildHlRusButcher(G,o){reseed(26011+(o.v|0));const W=7.8,D=6.2,F=.45,H=2.8,SX=-1.4,SZ=-.8;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.28)),sh=hC(vPick(HPAL.shingle)),trim=hC(HPAL.red),white=hC(HPAL.white),aged=hC(vPick(HPAL.aged));
 vnReg('Butcher and smokehouse (butchers)',0,-.4,8.8,F+H+4.6);
 hnSocle(SX,0,SZ,W+.24,F,D+.24,0);hnRULogBox(SX,F,SZ,W,H,D,0,log,.3,true);
 const top=hnRUShingle(SX,F+H,SZ,W,D,1.15,0,sh,white,'lace',.7,'hGableLog',log);
 const fz=SZ+D/2;
 vnDoor(SX+1.8,F,fz,0,1,2.02,'hPaint',white,trim,false);vnStairs(SX+1.8,0,fz+.45,0,1.3,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 hnNal(SX-1.8,F+.9,fz,0,.8,1,'glass',white,{shutters:true,accent:trim});
 hnNal(SX-W/2,F+.9,SZ,-Math.PI/2,.75,.95,'shut',white,{accent:trim});
 /* covered front butcher's porch on kubyshka posts with hanging cured meats & butcher block */
 const pd=1.9;vB('vWood',SX-.8,0,fz+pd/2,5.2,F,pd,0,log.clone().multiplyScalar(.82));
 for(const u of[-2.4,0,2.4])hnTotemPost(SX-.8+u,F,fz+pd-.18,.14,2.25,0);
 vnShedRoof(SX-.8,F+2.25,fz+pd/2,5.5,pd+.2,.55,0,'vShingleB',sh,.28,.12);
 beam('vIron',[SX-2.8,F+1.95,fz+pd-.35],[SX+1.2,F+1.95,fz+pd-.35],.045,.045,hC(0x2e2a26));
 for(let k=0;k<5;k++){const mx=SX-2.3+k*.85;vPst('vIron',mx,F+1.72,fz+pd-.35,.015,.24,hC(0x2e2a26));
  kput('vClayB',[mx,F+1.45,fz+pd-.35],qEuler(0,k*.5,0),[.22,.46,.16],hC(k%2?0x8e3428:0xa85238));}
 FURNISH('iziz_butcher_block',SX-1.6,F,fz+.85,0);FURNISH('hl_rep_produce_counter',SX+.2,0,fz+pd+.65,0);
 hnSign(SX+W/2-.35,F+2.4,fz,0,'pig',.9);hnStoneChimney(SX-2,F+H-.9,SZ-1.2,top-F-H+1.2,.64);
 /* tall koptil'nya timber smokehouse tower at +x with pyramid shingle roof & louvred smoke lantern */
 const kx=4.6,kz=-1.6,kw=2.7,kh=3.9;
 vB('hRubB',kx,0,kz,kw+.24,.85,kw+.24,0,hC(vPick(HPAL.rubble)));
 hnRUBoards(kx,.85,kz,kw,kh-.85,kw,0,log.clone().multiplyScalar(.86),null,trim,.48);
 vnDoor(kx,.85,kz+kw/2,0,.82,1.78,'vWood',log,trim,false);vnStairs(kx,0,kz+kw/2+.48,0,1.1,.85,3,'vStone',hC(vPick(HPAL.rubble)));
 vnPyrRoof('vPyrSh',kx,.85+kh-.85,kz,kw,kw,1.85,0,sh,.38);
 vB('hRUBoardV',kx,kh+1.45,kz,.95,.75,.95,0,log);hnRoom(kx,kh+1.58,kz+1.02*.48,.58,.38,.08,0);hnRoom(kx,kh+1.58,kz-1.02*.48,.58,.38,.08,Math.PI);
 vnPyrRoof('vPyrSh',kx,kh+2.2,kz,1.1,1.1,.75,0,sh,.2);
 /* wattle holding pen behind smokehouse with pigs, brine barrels & alder smoking wood */
 hnRUWattle([2.4,0,-5.4],[7.2,0,-5.4],1,aged);hnRUWattle([7.2,0,-5.4],[7.2,0,1.2],1,aged);hnRUWattle([2.4,0,-5.4],[2.4,0,-3.2],1,aged);
 hnRUBeast(4.8,-4.1,.6,'pig');hnRUBeast(5.9,-3.4,2.3,'pig');FURNISH('hl_rus_trough',3.6,0,-4.5,0,{v:0});
 hnBarrel(2.8,0,1.6,.34,.85);hnBarrel(3.55,0,1.7,.34,.85);hnWoodpile(SX-W/2-1.1,0,-1.8,Math.PI/2,3.4,1.3);
 vnFolk(-.5,fz+3.2,2,1.5);}

/* 3. hl_rus_distillery — Highland peat-fired pot-still distillery & ale brewhouse with pagoda malting vent & copper swan-neck */
function buildHlRusDistillery(G,o){reseed(26021+(o.v|0));const W=10.2,D=7.2,F=.75,H=3.2,HX=1.4,HZ=-.8;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.05,1.25)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.82),white=hC(HPAL.white),trim=hC(HPAL.ochre),rub=hC(vPick(HPAL.rubble)),cu=hC(0xb86b38);
 vnReg('Peat pot-still and brewhouse (brewers)',0,-.4,10.6,11.6);
 hnSocle(HX,0,HZ,W+.28,F,D+.28,0);hnRULogBox(HX,F,HZ,W,H,D,0,log,.32,true);
 const top=hnRUShingle(HX,F+H,HZ,W,D,1.1,0,sh,white,'horns',.8,'hGableLog',log);
 hnForm('hFormT',HX+W/2+.03,F+H+1.05,HZ,Math.PI/2,2.6,1.25);
 const fz=HZ+D/2;
 hnDoorway(HX-1.2,F,fz,0,1.9,2.25,{c:log,double:true});
 /* timber barrel-rolling ramp & stone stair to the raised cellar threshold */
 vnStairs(HX-2.6,0,fz+.65,0,1.2,F,3,'vStone',hC(vPick(HPAL.ashlar)));
 beam('vWood',[HX-.6,.08,fz+2.1],[HX-.6,F-.06,fz+.08],1.3,.14,log);
 for(const u of[1.6,3.6])hnNal(HX+u,F+.95,fz,0,.82,1.05,'glass',white,{shutters:true,accent:trim});
 for(const z of[-2,1.2])hnNal(HX+W/2,F+.95,HZ+z,Math.PI/2,.78,1,'glass',white,{accent:trim});
 hnSign(HX+W/2-.3,F+2.6,fz,0,'barrel',.95);
 /* Highland malting kiln & copper pot-still house at -x with double-tiered pagoda vent */
 const kx=HX-W/2-2.3,kz=HZ-.2,kw=4.6,kd=5.2,kh=4.1;
 vB('hRubB',kx,0,kz,kw+.2,1.2,kd+.2,0,rub);hnRULogBox(kx,1.2,kz,kw,kh-1.2,kd,0,log,.28);
 vnDoor(kx,0,kz+kd/2+.08,0,.95,1.95,'vStone',hC(vPick(HPAL.ashlar)),log,false);
 vnWin(kx-kw/2,2.1,kz,-Math.PI/2,.7,.85,'shut','hPaint',trim);
 vnPyrRoof('vPyrSh',kx,kh,kz,kw,kd,2.3,0,sh,.55);
 vB('hRUBoardV',kx,kh+1.85,kz,1.75,1.15,1.75,0,log);
 for(let a=0;a<4;a++){const p=loc(kx,kz,0,.9,a*Math.PI/2);hnRoom(p[0],kh+2.05,p[1],1.05,.62,.08,a*Math.PI/2);}
 vnPyrRoof('vPyrSh',kx,kh+3,kz,2.1,2.1,1.35,0,sh,.38);
 vPst('vPipeC',kx,kh+4.1,kz,.14,.95,cu);kput('vConeC',[kx,kh+4.95,kz],null,[.32,.42,.32],cu);
 /* open cooling verandah at front of still-house showing copper onion pot-still, swan-neck lyne arm & worm tub */
 const sy=F,sz=kz+kd/2+1.25;
 vB('hRubB',kx,0,sz,4.2,sy,2.3,0,rub);
 for(const sx of[-1.85,1.85])vPst('vPostB',kx+sx,sy,sz+1,.12,2.4,log);
 vnShedRoof(kx,sy+2.4,sz,4.4,2.5,.55,0,'vShingleB',sh,.25,.12);
 vPst('vBarrel',kx-.85,sy,sz-.15,.68,1.15,cu);kput('vDomeC',[kx-.85,sy+1.15,sz-.15],null,[.66,.58,.66],cu);
 vPst('vPipeC',kx-.85,sy+1.68,sz-.15,.16,.72,cu);
 beam('vPipeC',[kx-.85,sy+2.32,sz-.15],[kx+1.05,sy+1.78,sz+.1],.14,.14,cu);
 vPst('vBarrel',kx+1.05,sy,sz+.1,.62,1.55,hC(vPick(HPAL.pine)));vBq('vHoop',kx+1.05,sy+1.2,sz+.1,.64,.64,1,qEuler(Math.PI/2,0,0),hC(0x2e2a26));
 hnStoneChimney(HX+2.4,F+H-1,HZ-1.6,top-F-H+1.4,.74);
 /* mash copper, oak whisky/ale casks, grain sacks & roofed highland peat-stack */
 FURNISH('hl_rep_brew_copper',HX+3.2,0,fz+1.55,0);
 FURNISH('hl_rep_barrel_stack',HX+5.9,0,HZ+1.8,Math.PI/2);
 FURNISH('hl_rep_barrel_lying',HX+1.4,0,fz+1.5,0);
 const px=-7.4,pz=3.6;
 for(let r=0;r<3;r++)vB('hTurfB',px,r*.42,pz,2.6-r*.28,.4,1.6-r*.16,0,hC(0x4a3b2c));
 for(const sx of[-1.35,1.35])for(const sz2 of[-.85,.85])vPst('vPost',px+sx,0,pz+sz2,.07,1.85,log);
 vnShedRoof(px,1.85,pz,3,2,.38,0,'vWood',log,.2,.08);
 hnSacks(HX-3.8,0,fz+1.8,4);vnFolk(HX,fz+3.2,2,1.8);}

/* 4. hl_rus_inn — Postoyaly dvor: two-storey Slavic log coaching inn & L-wing stables around a gated cobbled yard */
function buildHlRusInn(G,o){reseed(26031+(o.v|0));const W=13.2,D=7.6,F=.55,H1=2.9,H2=2.7,IZ=-4.4,IX=-2.2;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.3)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),trim=hC(vPick([HPAL.red,HPAL.ochre])),barn=hC(vPick(HPAL.aged));
 vnReg('Postoyaly dvor coaching inn (inn)',0,-.5,12.8,F+H1+H2+5.2);
 vB('hCobble',0,-.02,1.6,22,.08,18,0,hC(0x888078));
 /* main two-storey Slavic log inn at the back of the yard */
 hnSocle(IX,0,IZ,W+.28,F,D+.28,0);
 hnRULogBox(IX,F,IZ,W,H1,D,0,log,.32,false);hnRULogBox(IX,F+H1,IZ,W,H2,D,0,log,.32,true);
 const yTop=F+H1+H2,fz=IZ+D/2;
 const top=hnRUShingle(IX,yTop,IZ,W,D,1.08,0,sh,white,'bird',.95,'hGableLog',log);
 hnForm('hFormT',IX-W/2-.03,yTop+1.1,IZ,-Math.PI/2,2.8,1.35);hnForm('hFormT',IX+W/2+.03,yTop+1.1,IZ,Math.PI/2,2.8,1.35);
 /* carved kryltso stair-porch & upper carved gallery */
 hnKryltso(IX-2.4,0,fz,0,2.2,F,'hKeelSh',sh,log);
 vnDoor(IX-2.4,F,fz,0,1.25,2.15,'hPaint',white,trim,false);
 for(const u of[.4,2.8,5])hnNal(IX+u,F+.88,fz,0,.85,1.1,'glass',white,{shutters:true,accent:trim});
 for(const u of[-4.8,-2.4,0,2.4,4.8])hnNal(IX+u,F+H1+.78,fz,0,.82,1.05,'glass',white,{keel:true,accent:trim});
 hnRUBalcony(IX+1.2,F+H1+.05,fz,0,8.6,1.35,log,white,true);
 for(const z of[-2,2])hnNal(IX-W/2,F+H1+.78,IZ+z,-Math.PI/2,.8,1,'glass',white,{accent:trim});
 hnStoneChimney(IX-4.2,yTop-1.2,IZ-1.4,top-yTop+1.6,.78);hnStoneChimney(IX+3.8,yTop-1.2,IZ-1.4,top-yTop+1.4,.72);
 /* L-wing timber stables & hayloft along +x */
 const sx=7.4,sz=2.2,sw=4.8,sd=11.6,sh1=2.7,sh2=1.6;
 hnSocle(sx,0,sz,sw+.2,.35,sd+.2,0);
 hnRULogBox(sx,.35,sz,sw,sh1,sd,0,barn,.26);hnRUBoards(sx,.35+sh1,sz,sw+.2,sh2,sd+.2,0,barn,null,white,.55);
 hnRUTurf(sx,.35+sh1+sh2,sz,sd+.2,sw+.2,.95,Math.PI/2,.55,'hGableLog',barn,12);
 vnDoor(sx-sw/2,.35,sz-3.2,-Math.PI/2,1.25,2.1,'vWood',barn,log,false);
 /* open stable stalls facing the yard (-x) + hayloft loading door */
 hnRoom(sx-sw/2+.05,.35,sz+1.6,.12,2.15,5.2,-Math.PI/2);
 for(const zz of[-1,1.6,4.2])vPst('vPostB',sx-sw/2-.05,.35,sz+zz,.11,sh1,log);
 hnDoorway(sx-sw/2,.35+sh1+.15,sz+1.6,-Math.PI/2,1.5,1.4,{c:barn});
 FURNISH('hl_rep_horse_stall',sx-.9,.35,sz+.4,-Math.PI/2);
 hnRUBeast(sx-3.3,sz+2.8,-.3,'horse');hnRUBeast(sx-3.5,sz+.2,.4,'horse');
 FURNISH('hl_rus_trough',sx-2.9,0,sz-1.8,Math.PI/2,{v:1});FURNISH('hl_rus_hay_rack',sx-3.2,0,sz+5.2,0,{v:0});
 /* front log courtyard fence & carved Slavic bochka gate-arch at +z */
 const gz=8.8;
 for(const [x0,x1] of[[-10.4,-2.6],[2.6,5.0]]){const xm=(x0+x1)/2,lw=x1-x0;
  vB('hRubB',xm,0,gz,lw,.45,.42,0,hC(vPick(HPAL.rubble)));vB('hLogB',xm,.45,gz,lw,1.55,.28,0,log);
  vnGableRoof(xm,2,gz,lw,.52,.26,0,'vShingleB',sh,.12,'vGableW',log,.08);}
 for(const s of[-1,1]){vB('hRubB',s*2.2,0,gz,.9,.55,.9,0,hC(vPick(HPAL.rubble)));hnRULogBox(s*2.2,.55,gz,.78,3.25,.78,0,log,.18);}
 vB('vWood',0,3.35,gz,5.3,.45,.85,0,log);hnFrieze(0,3.55,gz+.42,0,4.8,.32);
 hnBochka(0,3.8,gz,1.5,5.8,1.95,Math.PI/2,'hKeelSh',sh);
 if(KIT.defs.hM_d_sun)kput('hM_d_sun',[0,4.55,gz+.82],null,[.72,.72,1],null);
 hnDoorway(0,0,gz,0,3.4,3.2,{double:true,c:log});
 hnSign(2.75,3.2,gz+.45,0,'horse',1);
 /* yard wagons, porch tables & travellers */
 FURNISH('hl_rus_cart',-6.8,0,4.4,.55);FURNISH('hl_rus_porch_set',-6.8,0,.2,0);
 hnWoodpile(-9.4,0,-2.2,Math.PI/2,4.2,1.6);vnFolk(-1.5,3.8,4,2.8);}

/* 5. hl_rus_market — Torg covered Slavic timber market arcade & stalls with carved gables */
function buildHlRusMarket(G,o){reseed(26041+(o.v|0));const W=13.6,D=6.2,F=.35,H=3.1,MZ=-2.8;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.88,1.04)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),trim=hC(vPick([HPAL.red,HPAL.ochre,HPAL.blue])),tar=hC(vPick(HPAL.tar));
 vnReg('Torg covered market (market)',0,0,10.8,F+H+4.6);
 vB('hCobble',0,-.02,.4,20,.08,15.6,0,hC(0x8b8378));
 /* raised timber arcade platform on fieldstone socle */
 hnSocle(0,0,MZ,W+.4,F,D+.4,0);
 /* central lockup weigh-clerk & toll booth inside the arcade (gives a real KDOOR record) */
 hnRULogBox(0,F,MZ-.8,3.6,H,3.4,0,log,.24);
 vnDoor(0,F,MZ-.8+1.7,0,.95,1.98,'hPaint',white,trim,false);
 for(const s of[-1,1])hnNal(s*1.8,F+.9,MZ-.8,s*Math.PI/2,.68,.85,'glass',white,{accent:trim});
 /* carved kubyshka arcade columns & keel-arch valances along front and ends */
 for(let i=0;i<=4;i++){const u=-W/2+.35+i*(W-.7)/4;
  for(const sz of[-1,1])hnTotemPost(u,F,MZ+sz*(D/2-.22),.15,H,0);
  if(i<4){const um=u+(W-.7)/8;
   kput('hKeelW',[um,F+H-.72,MZ+D/2-.22],null,[(W-.7)/4-.24,.68,.12],trim);
   kput('hLaceV',[um,F+H-.18,MZ+D/2-.16],null,[(W-.7)/4-.18,.28,1],white);}}
 vB('vWood',0,F+H-.18,MZ,W+.2,.22,D+.2,0,tar);
 hnRUShingle(0,F+H,MZ,W,D,1.12,0,sh,white,'horns',.75,'hGableLog',log);
 hnForm('hFormT',-W/2-.03,F+H+1,MZ,-Math.PI/2,2.4,1.15);hnForm('hFormT',W/2+.03,F+H+1,MZ,Math.PI/2,2.4,1.15);
 hnSignBoard(0,F+H+.18,MZ+D/2+.62,0,3.4,.78,'scales',hC(HPAL.ochre));
 vnStairs(0,0,MZ+D/2+.52,0,2.8,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 /* stalls inside the arcade and across the torg square */
 FURNISH('hl_rus_stall',-4.3,F,MZ+.4,0,{v:0});FURNISH('hl_rus_stall',4.3,F,MZ+.4,0,{v:2});
 FURNISH('hl_rus_cloth_stall',-5.6,0,3.8,.25);FURNISH('hl_rus_stall',0,0,4.4,0,{v:1});FURNISH('hl_rus_stall',5.6,0,3.8,-.25,{v:3});
 FURNISH('hl_rep_weighing_beam',2.3,F,MZ+1.4,0);
 hnSacks(-8.2,0,1.2,4);hnBarrel(8.2,0,1.4,.35,.88);hnBarrel(8.8,0,2.1,.35,.88);hnCrate(-7.6,0,5.2,.75,.3);
 hnRUCart(8.2,-2.2,-.4);vnFolk(0,2.2,5,3.6);}

/* ================================================================ 2. CRAFTS AND WORKS */

/* 6. hl_rus_weaver — Weaver & dyer's log hall with sunlit nalichniki loom gallery, copper dye vats & veshala racks */
function buildHlRusWeaver(G,o){reseed(26051+(o.v|0));const W=9.6,D=6.8,F=.5,H1=2.6,H2=2.3,WX=-2.4,WZ=-1.6;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.9,1.05)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),blue=hC(HPAL.blue),red=hC(HPAL.red),aged=hC(vPick(HPAL.aged));
 vnReg('Weaver and dyer hall (weavers)',0,-.4,9.8,F+H1+H2+4.5);
 hnSocle(WX,0,WZ,W+.24,F,D+.24,0);
 hnRULogBox(WX,F,WZ,W,H1,D,0,log,.3,false);hnRULogBox(WX,F+H1,WZ,W,H2,D,0,log,.3,true);
 const yTop=F+H1+H2,fz=WZ+D/2;
 const top=hnRUShingle(WX,yTop,WZ,W,D,1.1,0,sh,white,'bird',.8,'hGableLog',log);
 hnForm('hFormT',WX-W/2-.03,yTop+.95,WZ,-Math.PI/2,2.4,1.15);hnForm('hFormT',WX+W/2+.03,yTop+.95,WZ,Math.PI/2,2.4,1.15);
 vnDoor(WX-2.4,F,fz,0,1.05,2.05,'hPaint',white,blue,false);vnStairs(WX-2.4,0,fz+.48,0,1.4,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 for(const u of[.4,2.8])hnNal(WX+u,F+.85,fz,0,.85,1.05,'glass',white,{shutters:true,accent:blue});
 /* bright continuous upper loom-gallery windows in carved birch-white & ultramarine nalichniki */
 for(const u of[-3.4,-1.7,0,1.7,3.4])hnNal(WX+u,F+H1+.58,fz,0,.76,1.05,'glass',white,{accent:red});
 for(const z of[-1.6,1.6])hnNal(WX-W/2,F+H1+.58,WZ+z,-Math.PI/2,.76,1.02,'glass',white,{accent:blue});
 hnStoneChimney(WX-3,yTop-1.1,WZ-1.5,top-yTop+1.3,.68);
 hnSign(WX+W/2-.3,F+2.45,fz,0,'shears',.9);
 /* outdoor dyer's yard at +x: stone fire-bench with three steaming woad, madder & saffron-lichen copper dye vats */
 const dx=5.2,dz=-2.2;
 vB('vFlag',dx,-.02,dz+.8,6.4,.08,8.6,0,hC(0x766e64));
 const dyes=[[dx-1.4,dz-1.6,0x224880],[dx+.4,dz-1.6,0xa42822],[dx+2.2,dz-1.6,0xd49a26]];
 vB('hRubB',dx+.4,0,dz-1.6,5.2,.52,1.5,0,hC(vPick(HPAL.rubble)));
 for(const [vx,vz,dc] of dyes){
  vBall('vEmber',vx,.18,vz+.76,.14,null,.08);
  vPst('vBarrel',vx,.48,vz,.58,.86,hC(0x9e5c36));
  kput('hRUDisc',[vx,1.28,vz],null,[.52,.05,.52],hC(dc));
  beam('vWood',[vx-.15,.6,vz],[vx+.32,1.72,vz+.18],.04,.04,aged);}
 /* two tall Slavic veshala drying frames hung with freshly dyed bolts + cloth counter */
 hnRUVeshala(dx+.4,0,dz+1.8,0,4.8,2.65,aged,[0x224880,0xb83224,0xd89e32,0xf3ead8,0x2f6d4c]);
 hnRUVeshala(dx+.4,0,dz+4.3,0,4.4,2.45,aged,[0xb83224,0x224880,0xd89e32,0x2f6d4c]);
 FURNISH('hl_rus_cloth_stall',WX+1.6,0,fz+2.4,0);
 FURNISH('iziz_vern_water_butt',dx-2.4,0,dz-1.4,0,{v:1});hnWoodpile(WX-W/2-1.1,0,WZ,Math.PI/2,4,1.45);
 vnFolk(1.2,fz+3,2,1.8);}

/* 7. hl_rus_tannery — Bark-tanning pit yard, turf-roofed currier shed, hide-stretching frames & beamhouse */
function buildHlRusTannery(G,o){reseed(26061+(o.v|0));const W=8.2,D=5.8,F=.4,H=2.6,BX=-4.2,BZ=-2.2;
 const log=hC(vPick(HPAL.aged)).multiplyScalar(rr(.92,1.06)),turf=hC(vPick(HPAL.turf)),dk=hC(vPick(HPAL.tar)),rub=hC(vPick(HPAL.rubble));
 vnReg('Tannery and currier yard (tanners)',0,0,10.6,F+H+3.6);
 /* log beamhouse & turf-roofed currier shed */
 hnSocle(BX,0,BZ,W+.2,F,D+.2,0);hnRULogBox(BX,F,BZ,W,H,D,0,log,.28);
 const top=hnRUTurf(BX,F+H,BZ,W,D,.96,0,.55,'hGableLog',log,12);
 const fz=BZ+D/2;
 vnDoor(BX+1.8,F,fz,0,1,1.95,'vWood',log,dk,false);vnStairs(BX+1.8,0,fz+.42,0,1.25,F,2,'vStone',rub);
 vnWin(BX-1.8,F+.88,fz,0,.78,.85,'shut','vWood',log);vnWin(BX-W/2,F+.88,BZ,-Math.PI/2,.72,.8,'open','vWood',log);
 hnStoneChimney(BX-2.2,F+H-.8,BZ-1.2,top-F-H+1.1,.62);
 hnSign(BX+W/2-.25,F+2.25,fz,0,'boot',.85);
 /* open-sided fleshing & bark-grinding lean-to along front of beamhouse */
 for(const u of[-3.2,0])vPst('vPostB',BX+u,0,fz+1.75,.1,2.15,dk);
 vnShedRoof(BX-1.6,2.15,fz+.9,4.2,1.9,.45,0,'vWood',log,.25,.1);
 /* slanted fleshing beams */
 for(const u of[-2.6,-.8])beam('vWood',[BX+u,0,fz+1.55],[BX+u,.95,fz+.45],.28,.12,log.clone().multiplyScalar(1.12));
 /* sunken stone-and-timber bark-tanning vats at +x (2x3 grid of liquor pits) */
 const px=4.4,pz=-1.8;
 vB('vFlag',px,-.02,pz,8.4,.08,7.4,0,hC(0x6e665c));
 const liq=[0x3b2618,0x4c311e,0x5c3e26,0x2f2016,0x684a30,0x3d281a];
 for(let r=0;r<2;r++)for(let c=0;c<3;c++){
  const vx=px-2.5+c*2.5,vz=pz-1.5+r*2.8;
  vB('hRubB',vx,0,vz,2.15,.38,2.25,0,rub);vB('vWood',vx,.38,vz,2.05,.08,2.15,0,dk);
  vB('hPaint',vx,.28,vz,1.72,.14,1.82,0,hC(liq[(r*3+c)%6]));}
 /* three A-frame timber hide-stretching frames with taut pegged hides */
 for(let i=0;i<3;i++){const hx=-4.8+i*4.6,hz=4.4,ry=(i-1)*-.18;
  const a=loc(hx,hz,-1.15,0,ry),b=loc(hx,hz,1.15,0,ry);
  vPst('vPost',a[0],0,a[1],.075,2.25,dk);vPst('vPost',b[0],0,b[1],.075,2.25,dk);
  beam('vWood',[a[0],2.15,a[1]],[b[0],2.15,b[1]],.08,.08,dk);beam('vWood',[a[0],.35,a[1]],[b[0],.35,b[1]],.07,.07,dk);
  kput('vTarp',[hx,1.25,hz],vQ(ry,0,0),[1.75,1.45,1],hC(vPick([0xc49c6c,0xb08658,0xd2ae80])));}
 /* spruce/oak tanbark stacks, lime barrels & wattle yard fence */
 hnWoodpile(BX-W/2-1.1,0,BZ+.4,Math.PI/2,4.4,1.5);
 FURNISH('iziz_vern_water_butt',px+3.6,0,pz-2.6,0,{v:1});hnBarrel(px+3.5,0,pz+1.8,.34,.85);hnBarrel(px+3.5,0,pz+2.65,.34,.85);
 hnRUWattle([-9.2,0,-6.4],[9.2,0,-6.4],1.05,log);hnRUWattle([9.2,0,-6.4],[9.2,0,5.6],1.05,log);
 vnFolk(.8,2.6,2,1.8);}

/* 8. hl_rus_woodcarver — Slavic woodcarver, cooper & potter's kiln workshop */
function buildHlRusWoodcarver(G,o){reseed(26071+(o.v|0));const W=8.4,D=6.2,F=.45,H=2.85,WX=-2.4,WZ=-1.6;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.92,1.06)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),trim=hC(HPAL.ochre),red=hC(HPAL.red),tar=hC(vPick(HPAL.tar));
 vnReg('Woodcarver, cooper and potter workshop (craftsmen)',0,-.4,9.6,F+H+4.4);
 hnSocle(WX,0,WZ,W+.24,F,D+.24,0);hnRULogBox(WX,F,WZ,W,H,D,0,log,.32,true);
 const top=hnRUShingle(WX,F+H,WZ,W,D,1.15,0,sh,white,'bird',.78,'hGableLog',log);
 /* showpiece Slavic woodcarving on the workshop's own front: keel nalichniki, rospis' panel, carved portal */
 const fz=WZ+D/2;
 vnDoor(WX-.8,F,fz,0,1.05,2.05,'hPaint',white,red,false);hnRUPortal(WX-.8,F,fz+.03,0,1.05,2.05);
 vnStairs(WX-.8,0,fz+.48,0,1.45,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 hnNal(WX-2.8,F+.88,fz,0,.8,1.02,'glass',white,{keel:true,shutters:true,accent:red});
 hnNal(WX+2.2,F+.88,fz,0,.95,1.05,'glass',white,{keel:true,shutters:true,accent:trim});
 hnForm('hFormT',WX-W/2-.03,F+H+.95,WZ,-Math.PI/2,2.3,1.1);hnForm('hFormA',WX+2.2,F+2.18,fz+.02,0,1.9,.68);
 hnStoneChimney(WX-2.6,F+H-.9,WZ-1.2,top-F-H+1.2,.64);
 hnSign(WX+W/2-.25,F+2.45,fz,0,'wheel',.9);
 /* open side carpenter & cooper shelter + sawpit + cooper's cresset */
 const cx=WX-W/2-1.8;
 for(const z of[WZ-2.2,WZ+2.2])vPst('vPostB',cx-1.2,0,z,.1,2.25,tar);
 vnShedRoof(cx-.2,2.25,WZ,2.4,5.2,.52,-Math.PI/2,'vShingleB',sh,.25,.12);
 FURNISH('hl_rep_workbench',cx-.35,0,WZ+.6,Math.PI/2);
 FURNISH('hl_rep_wheel_stand',WX+2.4,0,fz+1.65,0);
 FURNISH('hl_rep_cooper_fire',1.8,0,3.2,0);
 FURNISH('hl_rep_timber_stack',-5.6,0,4.2,0);
 /* domed red-clay & rubble potter's updraft kiln at +x + drying pot shelves */
 const kx=5.2,kz=-1.8,clay=hC(0xa45436);
 vB('hRubB',kx,0,kz,3.4,.75,3.4,0,hC(vPick(HPAL.rubble)));
 vPst('vClayPot',kx,.75,kz,1.38,1.55,clay);kput('vDomeP',[kx,2.3,kz],null,[1.36,.95,1.36],clay);
 for(const yy of[1.15,1.85])vBq('vHoop',kx,yy,kz,1.4,1.4,1,qEuler(Math.PI/2,0,0),hC(0x2e2a26));
 vPst('vPipeR',kx,3.1,kz,.24,1.35,clay);
 vB('vClayB',kx,.75,kz+1.45,.95,.85,.45,0,clay);vBall('vEmber',kx,.98,kz+1.66,.2,null,.14);
 FURNISH('hl_rep_pot_shelves',kx+.4,0,kz+3.2,0);
 hnBarrel(3.2,0,4.2,.34,.85);vnFolk(.2,fz+2.8,2,1.6);}

/* 9. hl_rus_warehouse — Ambar: heavy raised Slavic log storehouse on boulder staddle piers with cantilevered veranda & hoist */
function buildHlRusWarehouse(G,o){reseed(26081+(o.v|0));const W=11.4,D=7.2,PH=.95,H1=2.8,H2=2.1,OV=1.5;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.3)),pine=hC(vPick(HPAL.pine)).multiplyScalar(.92),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.78),white=hC(HPAL.white),rub=hC(vPick(HPAL.rubble));
 vnReg('Ambar log storehouse (warehouse)',0,.2,9.4,PH+H1+H2+4.8);
 /* 8 heavy boulder piers with flat granite rat-guard caps */
 for(const u of[-4.8,-1.6,1.6,4.8])for(const sz of[-1,1]){
  const z=sz*(D/2-.45);
  vB('hRubB',u,0,z,.78,.52,.78,0,rub);vPst('vPostB',u,.52,z,.2,PH-.64,log);vB('vStone',u,PH-.14,z,1.02,.14,1.02,0,hC(vPick(HPAL.ashlar)));}
 /* heavy sleeper beams + plank deck extending forward as cantilevered loading gallery */
 for(const u of[-4.8,-1.6,1.6,4.8])vB('vWood',u,PH,OV/2,.28,.24,D+OV+.2,0,log);
 vB('vWood',0,PH+.24,OV/2,W+.2,.16,D+OV+.1,0,pine);
 const y1=PH+.4,y2=y1+H1;
 hnRULogBox(0,y1,0,W,H1,D,0,log,.34,false);
 /* gallery posts supporting the oversailing upper log loft */
 for(const u of[-5.2,-1.8,1.8,5.2])hnTotemPost(u,y1,D/2+OV-.2,.15,H1,0);
 hnDeckRail([-5.3,y1,D/2+OV-.2],[-2.2,y1,D/2+OV-.2],0,log,.95);
 hnDeckRail([2.2,y1,D/2+OV-.2],[5.3,y1,D/2+OV-.2],0,log,.95);
 vB('vWood',0,y2-.16,OV/2,W+.5,.2,D+OV+.3,0,log);
 hnRULogBox(0,y2,OV/2,W+.4,H2,D+OV,0,pine,.32,true);
 const yTop=y2+H2;
 hnRUShingle(0,yTop,OV/2,W+.4,D+OV,1.06,0,sh,white,'horns',.8,'hGableLog',pine);
 /* double iron-bound storehouse doors, loft hoist hatch & projecting cathead pulley beam */
 hnDoorway(0,y1,D/2,0,2,2.15,{double:true,c:log});
 hnDoorway(0,y2+.2,D/2+OV,0,1.45,1.55,{c:log});
 for(const u of[-3.6,3.6]){vnWin(u,y1+1.1,D/2,0,.6,.55,'shut','hPaint',white);vnWin(u,y2+.75,D/2+OV,0,.6,.55,'shut','hPaint',white);}
 beam('vWood',[0,yTop+1.95,D/2+OV-.4],[0,yTop+1.95,D/2+OV+1.35],.22,.24,log);
 kput('hRUDisc',[0,yTop+1.72,D/2+OV+1.15],qEuler(0,0,Math.PI/2),[.22,.08,.22],hC(0x2e2a26));
 vPst('vRope',0,y1+1.35,D/2+OV+1.15,.025,yTop-y1+.38,hC(0xb8a480));
 vB('vWood',0,y1+.75,D/2+OV+1.15,.72,.62,.72,.2,pine);
 /* stone steps & timber cart-loading ramp at front (leaves +x and -x/-z clear for reclaimed dress) */
 vnStairs(0,0,D/2+OV+.68,0,2.2,y1,5,'vStone',rub);
 hnSign(W/2-.2,y1+2.3,D/2+OV-.15,0,'sack',.95);
 FURNISH('hl_rep_weighing_beam',-3.4,y1,D/2+.75,0);
 hnSacks(3.4,y1,D/2+.7,5);hnBarrel(-3.8,0,D/2+OV+1.4,.35,.88);hnCrate(3.4,0,D/2+OV+1.5,.8,.25);
 FURNISH('hl_rus_cart',4.2,0,D/2+OV+3.1,-.35);vnFolk(-1.6,D/2+OV+2.8,2,1.6);}

/* 10. hl_rus_charcoal_works — Highland peat/charcoal clamp, birch-tar degtyarnya retort & bloomery casting shed */
function buildHlRusCharcoalWorks(G,o){reseed(26091+(o.v|0));const W=7,D=5.4,F=.35,H=2.7,SX=5.2,SZ=-1.6;
 const log=hC(vPick(HPAL.aged)).multiplyScalar(rr(.88,1.02)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.76),turf=hC(vPick(HPAL.turf)),dk=hC(0x2e2a26),rub=hC(vPick(HPAL.rubble));
 vnReg('Charcoal, birch-tar and bloomery works (industry)',0,-.4,11.2,F+H+4.2);
 vB('hPaint',0,-.02,0,21,.06,16,0,hC(0x52463a));
 /* 1. Conical turf-and-earth charcoal & peat clamp (ugol'naya kuchya) at -x */
 const cx=-5.8,cz=-1.8,cr=3.1,ch=2.75;
 vPst('hRusDisc',cx,0,cz,cr+.35,.28,hC(0x362c24));
 kput('vConeT',[cx,.22,cz],null,[cr,ch,cr],turf.clone().multiplyScalar(.78));
 for(let k=0;k<10;k++){const a=k/10*TAU;
  beam('hLogX',[cx+Math.sin(a)*(cr-.15),.28,cz+Math.cos(a)*(cr-.15)],[cx+Math.sin(a)*.55,ch-.15,cz+Math.cos(a)*.55],.14,.14,log);
  if(k%2===0)vBall('vEmber',cx+Math.sin(a)*(cr-.02),.34,cz+Math.cos(a)*(cr-.02),.13,null,.09);}
 vPst('vPipeR',cx,ch-.15,cz,.22,.85,dk);vBall('vEmber',cx,ch+.68,cz,.18,null,.1);
 /* 2. Birch-tar degtyarnya masonry retort kiln in the rear centre dripping tar into barrels */
 const tx=-.4,tz=-4.4;
 vB('hRubB',tx,0,tz,2.6,1.35,2.6,0,rub);kput('vDomeP',[tx,1.35,tz],null,[1.18,.88,1.18],hC(0x8a5238));
 vBall('vEmber',tx,.45,tz+1.32,.18,null,.12);
 beam('vPipe',[tx+.95,1.25,tz],[tx+2.15,.72,tz+.6],.09,.09,dk);
 hnBarrel(tx+2.25,0,tz+.65,.34,.75);hnBarrel(tx+2.95,0,tz+.45,.34,.75);
 /* 3. Log-and-board bloomery & bronze-casting shed at +x */
 hnSocle(SX,0,SZ,W+.2,F,D+.2,0);hnRULogBox(SX,F,SZ,W,H,D,0,log,.28);
 const top=hnRUShingle(SX,F+H,SZ,W,D,1.08,0,sh,log.clone().multiplyScalar(1.2),'horns',.65,'hGableLog',log);
 vnDoor(SX-1.6,F,SZ+D/2,0,.98,1.98,'vWood',log,dk,false);vnStairs(SX-1.6,0,SZ+D/2+.42,0,1.25,F,2,'vStone',rub);
 vnWin(SX+1.8,F+.9,SZ+D/2,0,.75,.8,'shut','vWood',log);
 /* stone shaft bloomery furnace against +x flank with glowing tuyere & tall stack */
 const bx=SX+W/2+.75,bz=SZ-.4;
 vB('hRubB',bx,0,bz,1.65,2.4,1.65,0,rub);vPst('vClayPot',bx,2.4,bz,.62,1.6,hC(0x8e4c32));
 vBall('vEmber',bx,.62,bz+.84,.22,null,.14);
 hnStoneChimney(SX+1.6,F+H-.9,SZ-1.1,top-F-H+1.3,.68);
 FURNISH('hl_rus_forge',SX-1.2,0,SZ+D/2+2.1,0);FURNISH('hl_rus_anvil',SX+1.2,0,SZ+D/2+2.2,0);
 FURNISH('hl_rus_quench_barrel',SX+2.4,0,SZ+D/2+1.8,0);
 hnWoodpile(-6.2,0,3.4,0,4.2,1.5);hnSign(SX+W/2-.2,F+2.35,SZ+D/2,0,'hammer',.85);
 vnFolk(.4,3.2,2,2);}

/* 11. hl_rus_mine — Timber-collared highland adit portal, log headframe windlass, ore-sorting crib & rail-cart */
function buildHlRusMine(G,o){reseed(26101+(o.v|0));const MX=1.8,MZ=-5.2;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.82,.96)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle)),rub=hC(vPick(HPAL.rubble)),dk=hC(0x2e2a26);
 vnReg('Highland adit mine (miners)',0,-.5,11.2,10);
 vB('hPaint',0,-.02,.4,21,.06,16.5,0,hC(0x665e54));
 /* stepped highland rock crag at -z into which the adit is driven */
 kput('hBatterRub',[MX,0,MZ-1.8],null,[11.5,5.8,5.6],rub);
 for(const [rx,ry,rz,sx,sy,sz] of[[MX-4.6,0,MZ-.8,3.6,4.2,3.4],[MX+4.8,0,MZ-.6,3.8,4.5,3.6],[MX-.4,4.2,MZ-2.2,6.4,2.4,3.2]])
  kput('vRock',[rx,ry+sy*.42,rz],qEuler(rr(-.12,.12),rr(0,TAU),0),[sx*.55,sy*.55,sz*.55],rub.clone().multiplyScalar(rr(.88,1.08)));
 /* heavy notched-log adit collar, wing-cribs & iron-barred timber adit gate */
 const pz=MZ+1.1;
 for(const s of[-1,1]){
  vB('hLogB',MX+s*2.4,0,pz-.2,1.8,2.6,1.2,0,log);
  vPst('vPostB',MX+s*1.35,0,pz+.35,.2,3.05,tar);
  beam('vWood',[MX+s*1.35,2.85,pz+.35],[MX+s*.85,2.85,pz-.4],.24,.24,tar);}
 kput('hLogX',[MX,3.02,pz+.35],null,[3.4,.22,.22],tar);
 hnRUTurf(MX,3.15,pz-.1,3.6,1.8,.75,0,.35,'hGableLog',log,5);
 vB('vDarkB',MX,0,pz-.15,2.3,2.75,.5,0);
 hnDoorway(MX,0,pz+.28,0,2.2,2.65,{double:true,c:tar});
 /* iron-strapped timber rail track emerging from adit to ore-sorting crib + rail tub */
 for(const s of[-.38,.38])beam('vIron',[MX+s,.08,pz+.3],[MX+s,.08,5.8],.06,.07,dk);
 for(let k=0;k<11;k++)vB('vWood',MX,0,pz+.7+k*.78,1.25,.06,.16,0,log);
 FURNISH('hl_rep_rail_tub',MX,.08,2.8,0);
 /* log ore-sorting crib at +x heaped with copper-green & rust-iron skarn ore */
 const ox=7.2,oz=1.2;
 hnRULogBox(ox,0,oz,3.8,1.35,3.4,0,log,.24);
 for(let k=0;k<12;k++)kput('vRock',[ox+rr(-1.3,1.3),1.35+rr(0,.35),oz+rr(-1.1,1.1)],qEuler(rng(),rng(),0),[.34,.26,.3],hC(vPick([0x4d7a62,0x7c4c34,0x6e6860])));
 /* log headframe windlass over vertical ventilation/hoist shaft at -x, rear */
 const hx=-6.4,hz=-3.8;
 vB('hRubB',hx,0,hz,3.2,.55,3.2,0,rub);vB('vDarkB',hx,.52,hz,1.8,.08,1.8,0);
 for(const sx of[-1.15,1.15])for(const sz of[-1.15,1.15])beam('vWood',[hx+sx*1.15,.55,hz+sz*1.15],[hx+sx*.55,5.2,hz+sz*.55],.16,.16,tar);
 vnPyrRoof('vPyrSh',hx,5.2,hz,2.2,2.2,1.45,0,sh,.35);
 FURNISH('hl_rep_winch',hx,.55,hz,0);
 /* turf-roofed miner's tally & lamp hut at -x, front */
 const lx=-6.2,lz=2.4;
 hnSocle(lx,0,lz,4.8,.35,4.2,0);hnRULogBox(lx,.35,lz,4.6,2.35,4,0,log,.26);
 hnRUTurf(lx,2.7,lz,4.6,4,.92,0,.45,'hGableLog',log,7);
 vnDoor(lx,.35,lz+2,0,.9,1.88,'vWood',log,tar,false);vnWin(lx+4.6/2,.35+.85,lz,Math.PI/2,.65,.7,'glass','hPaint',hC(HPAL.white));
 vnChimney(lx-1.3,2.5,lz-.8,1.8,.11,true);
 FURNISH('hl_rep_timber_stack',-1.8,0,4.8,0);vnFolk(MX+1.8,4.4,2,1.5);}

/* 12. hl_rus_quarry — Stepped granite/slate quarry face, timber A-frame derrick crane & mason's shed */
function buildHlRusQuarry(G,o){reseed(26111+(o.v|0));const QX=-3.2,QZ=-3.8;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.85,1)),tar=hC(vPick(HPAL.tar)),slate=hC(vPick(HPAL.slate)),gran=hC(vPick(HPAL.ashlar)),rub=hC(vPick(HPAL.rubble));
 vnReg('Granite and slate quarry (quarrymen)',0,-.4,12,10.6);
 vB('vFlag',0,-.02,.5,23,.08,16.5,0,hC(0x888278));
 /* stepped quarried granite & blue-slate benches at -x / -z */
 vB('vStone',QX,0,QZ-1.2,12.5,2.1,4.8,0,gran);
 vB('hAshlarP',QX-.8,2.1,QZ-1.8,10.4,1.95,3.4,0,gran.clone().multiplyScalar(.94));
 vB('vStone',QX-1.6,4.05,QZ-2.3,7.8,1.75,2.2,0,slate);
 for(const u of[-4.2,-1.2,2.2])vB('vStone',QX+u,0,QZ+1.6,1.65,.95,1.15,.08,gran.clone().multiplyScalar(1.04));
 /* tall guyed timber A-frame sheerlegs derrick crane hoisting a dressed granite block */
 const cx=1.2,cz=.8;
 vB('hRubB',cx,0,cz,2.4,.45,2.4,0,rub);
 vPst('vPostB',cx,.45,cz,.2,7.6,tar);
 beam('vWood',[cx,1.1,cz],[cx-2.6,6.8,cz-1.4],.18,.18,log);
 beam('vWood',[cx,7.6,cz],[cx-3.1,1.2,cz+2.6],.13,.13,tar);beam('vWood',[cx,7.6,cz],[cx+3.1,1.2,cz+2.6],.13,.13,tar);
 hnCable([cx,7.8,cz],[cx-2.6,6.8,cz-1.4]);
 vPst('vRope',cx-2.6,2.8,cz-1.4,.03,4,hC(0x3a322a));
 vB('vStone',cx-2.6,1.95,cz-1.4,1.35,.85,.95,.15,gran);
 FURNISH('hl_rep_winch',cx+1.6,0,cz+1.8,-.4);
 FURNISH('hl_rep_stone_blocks',-4.6,0,3.6,.15);
 /* log-and-slate mason's banker shed at +x */
 const sx=6.8,sz=1.2,sw=6.4,sd=5,shH=2.7;
 hnSocle(sx,0,sz,sw+.2,.4,sd+.2,0);hnRULogBox(sx,.4,sz,sw,shH,sd,0,log,.28);
 hnRUShingle(sx,.4+shH,sz,sw,sd,1.05,0,slate,hC(HPAL.white),'lace',.65,'hGableLog',log);
 vnDoor(sx-1.4,.4,sz+sd/2,0,.98,1.98,'vWood',log,tar,false);vnStairs(sx-1.4,0,sz+sd/2+.42,0,1.3,.4,2,'vStone',gran);
 hnNal(sx+1.5,.4+.88,sz+sd/2,0,.8,.95,'glass',hC(HPAL.white),{accent:hC(HPAL.blue)});
 FURNISH('hl_rus_grindstone',sx-2.2,0,sz+sd/2+1.8,0);
 FURNISH('hl_rus_tool_board',sx+1.5,.4,sz+sd/2+.12,0);
 hnRUCart(-1.2,5.2,.35);vnFolk(2.6,4.4,2,1.8);}

/* 13. hl_rus_generator — Salvaged Ancient turbine & peat-boiler rustic powerhouse (matches 81b-rus-salvage.js aesthetic) */
function buildHlRusGenerator(G,o){reseed(26121+(o.v|0));const R=1.95,BL=7.6,yc=1.15+R,BX=-2.2,BZ=-1.2;
 const rust=hC(vPick([0x8a5a3a,0x7a4e34,0x96643e])),log=hC(vPick(HPAL.aged)).multiplyScalar(rr(.92,1.06)),tar=hC(vPick(HPAL.tar)),rub=hC(vPick(HPAL.rubble)),cu=hC(0xb86b38);
 vnReg('Salvaged turbine powerhouse (powerhouse)',0,-.4,10,11.6);
 /* fieldstone peat-furnace cradle under salvaged Ancient cylindrical pressure-boiler & turbine casing */
 vB('hRubB',BX,0,BZ,BL-.4,1.35,3.4,0,rub);
 vB('vDarkB',BX-BL/2+.02,.28,BZ,.14,.78,1.5,0);vBall('vEmber',BX-BL/2+.12,.48,BZ,.28,null,.16);
 if(KIT.defs.hTankC){
  kput('hTankC',[BX,yc,BZ],qEuler(0,0,Math.PI/2),[R,BL,R],rust);
  kput('hTankEnd',[BX+BL/2,yc,BZ],null,[R*.4,R,R],rust);kput('hTankEnd',[BX-BL/2,yc,BZ],qEuler(0,Math.PI,0),[R*.4,R,R],rust);}
 else vPst('vTankR',BX,1.2,BZ,R,BL,rust,qEuler(0,0,Math.PI/2));
 for(const dx of[-2.8,0,2.8])kput('vHoop',[BX+dx,yc,BZ],qEuler(0,Math.PI/2,0),[R*1.01,R*1.01,1],hC(0x2e2a26));
 /* tall guyed iron smoke-stack + copper steam header into dynamo log cabin */
 vPst('vPipeR',BX-2.4,yc+R-.2,BZ,.32,5.6,rust);
 for(const [gx,gz] of[[BX-5.6,BZ-3.2],[BX-5.6,BZ+3.2],[BX+.8,BZ-3.4]])beam('vRope',[BX-2.4,yc+R+4.2,BZ],[gx,.3,gz],.025,.025,hC(0x2e2a26));
 /* turf-roofed timber weather-hall straddling the boiler with Borgund dragon finials & shields */
 const HW=BL+1.8,HD=6.2,HH=yc+R+.65;
 for(const sx of[-1,-.33,.33,1])for(const sz of[-1,1]){const x=BX+sx*(HW/2-.28),z=BZ+sz*(HD/2-.22);
  vB('vStone',x,0,z,.52,.28,.52,0,rub);vPst('vPostB',x,.28,z,.14,HH-.28,log);}
 for(const sz of[-1,1])kput('hLogX',[BX,HH-.12,BZ+sz*(HD/2-.22)],null,[HW+.2,.18,.18],log);
 hnRUTurf(BX,HH,BZ,HW,HD,.88,0,.55,'hGableLog',log,10);
 hnRUDragons(BX,HH,BZ,HW,HD,.88*HD/2,0,.55,tar,.85);
 /* adjoining log-and-corrugate dynamo control house at +x */
 const dx=4.8,dz=-.8,dw=5.2,dd=6.2,dh=3.1;
 hnSocle(dx,0,dz,dw+.2,.45,dd+.2,0);hnRULogBox(dx,.45,dz,dw,dh,dd,0,log,.28);
 vnPatch(dx+dw/2+.02,.6,dz,Math.PI/2,dd-.8,dh-.4,3);
 const sh=hC(vPick(HPAL.shingle));
 hnRUShingle(dx,.45+dh,dz,dw,dd,1.05,0,sh,hC(HPAL.white),'horns',.65,'hGableLog',log);
 beam('vPipeC',[BX+BL/2,yc+.3,BZ],[dx-dw/2+.2,2.4,dz-.6],.22,.22,cu);
 vnDoor(dx,.45,dz+dd/2,0,1.05,2.05,'vWood',log,tar,false);vnStairs(dx,0,dz+dd/2+.48,0,1.35,.45,2,'vStone',rub);
 vnWin(dx-1.4,.45+.95,dz+dd/2,0,.72,.82,'glass','hPaint',hC(HPAL.white));
 hnRUShield(dx+1.5,.45+1.65,dz+dd/2,0,.4,hC(HPAL.red),hC(HPAL.ochre));
 /* timber power pole with cross-arms, porcelain insulators & outgoing feeder cables, battery bank, peat & wood fuel */
 const px=dx+2.2,pz=dz+dd/2+1.8;
 vPst('vPost',px,0,pz,.14,7.4,tar);vB('vWood',px,6.5,pz,1.8,.12,.12,0,tar);vB('vWood',px,5.8,pz,1.5,.12,.12,0,tar);
 for(const u of[-.7,0,.7])vPst('vPanelB',px+u,6.62,pz,.05,.18,hC(HPAL.white));
 beam('vRope',[dx,.45+dh-.3,dz+dd/2],[px,6.6,pz],.025,.025,hC(0x2e2a26));
 FURNISH('pa_battery_bank',dx-1.4,0,dz+dd/2+1.4,0);FURNISH('hl_rep_engine_bell',-6.4,0,3.2,.3);
 hnWoodpile(-2.8,0,3.8,0,4.2,1.5);hnSign(dx+dw/2-.2,.45+2.4,dz+dd/2,0,'gear',.88);
 vnFolk(1.2,4.2,2,1.6);}

/* ================================================================ 3. CIVIC AND SACRED */

/* 14. hl_rus_shrine — Wayside Slavic kapliczka / chasovnya shrine on fieldstone plinth with shatyor spire & rozetka */
function buildHlRusShrine(G,o){reseed(26131+(o.v|0));const W=3.6,D=3.6,F=.85,H=2.85,SZ=-.8;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.1,1.3)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),trim=hC(HPAL.red),gold=hC(HPAL.gold[0]);
 vnReg('Wayside chasovnya shrine (shrine)',0,0,5.6,9.8);
 vB('vFlag',0,-.02,.4,9.6,.08,9.6,0,hC(0x888076));
 /* stepped fieldstone plinth */
 vB('hRubB',0,0,SZ,W+2.2,.42,D+3.4,0,hC(vPick(HPAL.rubble)));
 hnSocle(0,.42,SZ+.2,W+1.4,F-.42,D+2.4,0);
 vnStairs(0,0,SZ+D/2+1.85,0,1.9,F,4,'vStone',hC(vPick(HPAL.ashlar)));
 /* notched-log sanctuary cell + carved kubyshka open prayer porch */
 hnRULogBox(0,F,SZ-.35,W,H,D,0,log,.28,true);
 const pz=SZ-.35+D/2+1.25;
 for(const s of[-1,1])hnTotemPost(s*1.45,F,pz,.15,H-.15,0);
 vB('vWood',0,F+H-.18,SZ+.28,W+.3,.2,D+1.5,0,log);
 hnBochka(0,F+H,pz-.55,1.5,W+.7,1.45,Math.PI/2,'hKeelSh',sh);
 /* locked carved portal + gilded solar icon niches on sides */
 vnDoor(0,F,SZ-.35+D/2,0,.98,1.98,'hPaint',white,trim,false);hnRUPortal(0,F,SZ-.35+D/2+.03,0,.98,1.98);
 for(const s of[-1,1]){
  kput('hKeelW',[s*(W/2+.05),F+1.15,SZ-.35],qEuler(0,s*Math.PI/2,0),[1.05,1.15,.1],white);
  if(KIT.defs.hM_d_sun)kput('hM_d_sun',[s*(W/2+.12),F+1.55,SZ-.35],qEuler(0,s*Math.PI/2,0),[.58,.58,1],null);}
 /* octagonal neck, kokoshniks & shatyor tent spire */
 hnRUShatyor(0,F+H,SZ-.35,1.52,1.65,3.4,log,sh,white,true);
 if(KIT.defs.hM_d_sun)kput('hM_d_sun',[0,F+H+.72,pz+.22],null,[.64,.64,1],gold);
 /* votive golubets posts, offering bench & pilgrim */
 hnRUGolubets(-3.4,0,2.6,.2,log,white);hnRUGolubets(3.4,0,2.6,-.2,log,white);
 FURNISH('hl_rus_log_bench',-2.8,0,.2,Math.PI/2,{v:0});FURNISH('pa_offerings',2.6,0,.8,-.4);
 vnFolk(.6,3.6,1,.8);}

/* 15. hl_rus_pogost — Wooden pogost funerary chapel with shingled onion cupola & fenced yard of roofed golubets grave-posts */
function buildHlRusPogost(G,o){reseed(26141+(o.v|0));const W=6.2,D=8.2,F=.65,H=3.7,CZ=-2.2;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.26)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),trim=hC(HPAL.ochre),rub=hC(vPick(HPAL.rubble));
 vnReg('Wooden pogost and graveyard (funerary)',0,0,10.8,15.8);
 /* traditional North-Rus' roofed log-and-fieldstone pogost enclosure wall */
 const EW=19.6,ED=19.6;
 for(const [x0,z0,x1,z1] of[[-EW/2,-ED/2,EW/2,-ED/2],[EW/2,-ED/2,EW/2,ED/2],[-EW/2,ED/2,-EW/2,-ED/2],[-EW/2,ED/2,-2.2,ED/2],[2.2,ED/2,EW/2,ED/2]]){
  const xm=(x0+x1)/2,zm=(z0+z1)/2,L=Math.hypot(x1-x0,z1-z0),yaw=Math.abs(x1-x0)>Math.abs(z1-z0)?0:Math.PI/2;
  vB('hRubB',xm,0,zm,L,.48,.46,yaw,rub);vB('hLogB',xm,.48,zm,L,.92,.28,yaw,log);
  vnGableRoof(xm,1.4,zm,L,.56,.28,yaw,'vShingleB',sh,.12,'vGableW',log,.08);}
 /* roofed timber lychgate at +z */
 const gz=ED/2;
 for(const s of[-1,1])hnTotemPost(s*1.85,0,gz,.16,2.85,0);
 vB('vWood',0,2.7,gz,4.3,.24,.9,0,log);
 hnRUShingle(0,2.94,gz,4.4,1.6,1.15,0,sh,white,'bird',.35,'vGableW',log);
 /* funerary log chapel + apse + kryltso porch + octagonal drum & aspen-shingle onion dome */
 hnSocle(0,0,CZ,W+.26,F,D+.26,0);hnRULogBox(0,F,CZ,W,H,D,0,log,.32,true);
 hnRULogBox(0,F,CZ-D/2-1.2,3.8,H-.6,2.4,0,log,.26);
 hnGable(0,F+H-.6,CZ-D/2-1.2,3.8,2.4,1.2,0,'hScaleB',sh,.4,'hGableLog',log);
 const fz=CZ+D/2;
 hnKryltso(0,0,fz,0,2.1,F,'hKeelSh',sh,log);
 vnDoor(0,F,fz,0,1.15,2.2,'hPaint',white,hC(HPAL.red),false);
 for(const s of[-1,1])for(const z of[-1.8,1.6])hnNal(s*W/2,F+1.15,CZ+z,s*Math.PI/2,.62,.95,'glass',white,{keel:true,accent:trim});
 const rTop=hnRUShingle(0,F+H,CZ,W,D,1.32,0,sh,white,'horns',.7,'hGableLog',log);
 hnOnion(0,rTop-.35,CZ-.4,1.65,'Sh',sh,2.1,'hOctL',log);
 /* small log undertaker's bier-house in -x/-z corner (with real locked door) */
 hnSocle(-6.8,0,-6.8,3.4,.3,3,0);hnRULogBox(-6.8,.3,-6.8,3.2,2.1,2.8,0,log,.22);
 hnRUTurf(-6.8,2.4,-6.8,3.2,2.8,.88,0,.35,'hGableLog',log,4);
 vnDoor(-6.8,.3,-6.8+1.4,0,.85,1.78,'vWood',log,white,false);
 /* graveyard of roofed Slavic golubets grave-posts & carved boards */
 for(const [gx,gz2,ry] of[[-6.4,-1.8,.1],[-5.2,1.6,-.12],[-6.8,4.8,.08],[5.4,-5.4,-.15],[6.6,-1.6,.12],[5.2,2,.05],[6.8,5.2,-.1],[-3.8,6.2,0]])
  hnRUGolubets(gx,0,gz2,ry,log,white);
 FURNISH('hl_rus_grave_board',4.2,0,5.8,.1);FURNISH('hl_rus_grave_board',-4.2,0,-2.6,-.1);
 vnFolk(0,5.4,2,1.8);}

/* 16. hl_rus_skete — Wooden skit monastery compound: shatyor log chapel, turf-roofed monk cells, bell-gate & herb cloister */
function buildHlRusSkete(G,o){reseed(26151+(o.v|0));
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.84,.98)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),trim=hC(HPAL.ochre),rub=hC(vPick(HPAL.rubble));
 vnReg('Wooden skit monastery (monks)',0,0,12.5,14.6);
 /* wattle-and-post cloister enclosure with shingle-hooded bell-gate at +z */
 const CW=22,CD=20;
 hnRUWattle([-CW/2,0,-CD/2],[CW/2,0,-CD/2],1.35,log);
 hnRUWattle([-CW/2,0,-CD/2],[-CW/2,0,CD/2],1.35,log);
 hnRUWattle([CW/2,0,-CD/2],[CW/2,0,CD/2],1.35,log);
 hnRUWattle([-CW/2,0,CD/2],[-2.4,0,CD/2],1.35,log);hnRUWattle([2.4,0,CD/2],[CW/2,0,CD/2],1.35,log);
 /* cloister bell-gate (zvonnitsa) */
 const gz=CD/2;
 for(const s of[-1,1]){vB('hRubB',s*1.9,0,gz,.8,.45,.8,0,rub);hnRULogBox(s*1.9,.45,gz,.7,3.1,.7,0,tar,.18);}
 vB('vWood',0,3.15,gz,4.6,.35,.8,0,tar);
 hnDoorway(0,0,gz,0,2.8,2.95,{double:true,c:tar});
 for(const s of[-1,1])vPst('vPost',s*1.35,3.5,gz,.1,1.55,tar);
 hnRUShingle(0,5.05,gz,3.6,1.5,1.2,0,sh,white,'bird',.35,'vGableW',tar);
 for(const u of[-.55,0,.55])kput('hBulbG',[u,4.35,gz],qEuler(Math.PI,0,0),[u===0?.24:.17,u===0?.34:.24,u===0?.24:.17],hC(HPAL.gold[0]));
 /* central octagonal log shatyor chapel */
 const cz=-2.2;
 vPst('hOctS',0,0,cz,3.15,.65,rub);
 kput('hOctL',[0,.65,cz],null,[2.85,3.8,2.85],tar);
 hnRULogBox(0,.65,cz+2.8,2.6,2.7,1.8,0,tar,.24);
 hnRUShingle(0,3.35,cz+2.8,2.6,1.8,1.2,0,sh,white,'lace',.35,'hGableLog',tar);
 vnDoor(0,.65,cz+3.7,0,1.05,2.05,'hPaint',white,hC(HPAL.red),false);vnStairs(0,0,cz+4.2,0,1.5,.65,3,'vStone',hC(vPick(HPAL.ashlar)));
 for(const s of[-1,1])hnNal(s*2.65,1.85,cz,s*Math.PI/2,.58,.88,'glass',white,{keel:true,accent:trim});
 hnRUShatyor(0,4.45,cz,2.25,2.1,5.8,tar,sh,white,true);
 /* two turf-roofed monk cell rows (kel'yi) flanking the cloister on -x and +x */
 for(const s of[-1,1]){
  const kx=s*7.6,kz=-1.2,kw=4,kd=8.4,kh=2.3;
  hnSocle(kx,0,kz,kw+.2,.35,kd+.2,0);hnRULogBox(kx,.35,kz,kw,kh,kd,0,log,.26);
  const cTop=hnRUTurf(kx,.35+kh,kz,kd,kw,.9,Math.PI/2,.45,'hGableLog',log,10);
  for(const dz of[-2.1,2.1]){
   vnDoor(kx-s*kw/2,.35,kz+dz,-s*Math.PI/2,.85,1.82,'vWood',log,tar,false);
   vnWin(kx-s*kw/2,.35+.85,kz+dz+(dz<0?1.2:-1.2),-s*Math.PI/2,.55,.62,'glass','hPaint',white);}
  hnStoneChimney(kx,.35+kh-.7,kz,cTop-.35-kh+1.1,.58);}
 /* cloister well, herb planters & log benches */
 FURNISH('hl_rep_roofed_well',-3.6,0,4.2,0);
 FURNISH('iziz_vern_planter',3.8,0,3.2,0,{v:0});FURNISH('iziz_vern_planter',3.8,0,5.6,0,{v:0});
 FURNISH('hl_rus_log_bench',-3.6,0,1.2,0,{v:0});vnFolk(0,4.8,3,2.2);}

/* 17. hl_rus_school — Village gramota schoolhouse & clan chronicler's lodge with carved prichelina & ridge belfry */
function buildHlRusSchool(G,o){reseed(26161+(o.v|0));const W=10.6,D=7.4,F=.55,H=3.25,SZ=-.8;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.92,1.06)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),blue=hC(HPAL.blue),red=hC(HPAL.red),tar=hC(vPick(HPAL.tar));
 vnReg('Gramota schoolhouse (school)',0,-.4,8.8,F+H+6.2);
 hnSocle(0,0,SZ,W+.26,F,D+.26,0);hnRULogBox(0,F,SZ,W,H,D,0,log,.32,true);
 const rTop=hnRUShingle(0,F+H,SZ,W,D,1.15,0,sh,white,'bird',.82,'hGableLog',log);
 hnForm('hFormT',-W/2-.03,F+H+1.05,SZ,-Math.PI/2,2.6,1.25);hnForm('hFormT',W/2+.03,F+H+1.05,SZ,Math.PI/2,2.6,1.25);
 const fz=SZ+D/2;
 hnKryltso(-2.8,0,fz,0,2,F,'hKeelSh',sh,log);
 vnDoor(-2.8,F,fz,0,1.1,2.1,'hPaint',white,blue,false);
 /* four tall bright schoolroom windows in carved birch-white & ultramarine nalichniki */
 for(const u of[-.4,1.5,3.4])hnNal(u,F+.85,fz,0,.88,1.22,'glass',white,{keel:true,shutters:true,accent:blue});
 for(const z of[-1.8,1.6])for(const s of[-1,1])hnNal(s*W/2,F+.85,SZ+z,s*Math.PI/2,.82,1.15,'glass',white,{accent:red});
 /* charming open timber school-bell turret on the ridge */
 vB('hRUBoardV',0,rTop-.45,SZ,1.35,.95,1.35,0,tar);
 for(const sx of[-.52,.52])for(const sz2 of[-.52,.52])vPst('vPost',sx,rTop+.5,SZ+sz2,.07,1.25,white);
 kput('hBulbG',[0,rTop+1.35,SZ],qEuler(Math.PI,0,0),[.22,.32,.22],hC(HPAL.gold[0]));
 hnTent(0,rTop+1.75,SZ,.98,1.85,'hTentSh',sh);
 vPst('vIron',0,rTop+3.45,SZ,.035,.65,hC(0x2e2a26));vBall('hGold',0,rTop+4.1,SZ,.09,hC(HPAL.gold[0]));
 hnStoneChimney(3.2,F+H-.9,SZ-1.6,rTop-F-H+1.2,.68);
 /* schoolyard slate board, reading benches, swing & book sign */
 hnSign(W/2-.3,F+2.55,fz,0,'book',.9);
 FURNISH('hl_rep_slate_board',1.8,0,fz+2.1,0);
 FURNISH('hl_rus_log_bench',1.8,0,fz+3.8,Math.PI,{v:1});
 FURNISH('hl_rep_swing',-4.2,0,fz+2.8,.2);
 hnWoodpile(-W/2-1.05,0,SZ-.4,Math.PI/2,3.6,1.4);vnFolk(.8,fz+3,3,2);}

/* 18. hl_rus_healer — Znakhar' herbalist infirmary & log banya steam-bath annex with herb-drying porch & apothecary beds */
function buildHlRusHealer(G,o){reseed(26171+(o.v|0));const W=9.2,D=6.6,F=.5,H=2.9,HX=-2.6,HZ=-1.2;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.9,1.04)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),green=hC(HPAL.teal),tar=hC(vPick(HPAL.tar));
 vnReg('Znakhar infirmary and banya (healers)',0,-.2,9.8,F+H+4.4);
 /* main herbalist infirmary cottage */
 hnSocle(HX,0,HZ,W+.24,F,D+.24,0);hnRULogBox(HX,F,HZ,W,H,D,0,log,.3,true);
 const top=hnRUShingle(HX,F+H,HZ,W,D,1.12,0,sh,white,'lace',.75,'hGableLog',log);
 hnForm('hFormT',HX-W/2-.03,F+H+.95,HZ,-Math.PI/2,2.3,1.1);
 const fz=HZ+D/2,pd=1.85;
 /* covered herb-drying veranda along the front */
 vB('vWood',HX,0,fz+pd/2,W-.2,F,pd,0,log.clone().multiplyScalar(.82));
 for(const u of[-4,-1.35,1.35,4])hnTotemPost(HX+u,F,fz+pd-.18,.13,2.35,0);
 vnShedRoof(HX,F+2.35,fz+pd/2,W+.2,pd+.25,.55,0,'vShingleB',sh,.28,.12);
 vnStairs(HX-1.35,0,fz+pd+.48,0,1.6,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 vnDoor(HX-1.35,F,fz,0,1.02,2.02,'hPaint',white,green,false);
 for(const u of[-3.3,1.2,3.2])hnNal(HX+u,F+.86,fz,0,.78,1,'glass',white,{shutters:true,accent:green});
 for(const z of[-1.6,1.6])hnNal(HX-W/2,F+.86,HZ+z,-Math.PI/2,.76,.98,'glass',white,{accent:green});
 FURNISH('hl_tri_herb_rack',HX+1.35,F,fz+pd-.35,0);FURNISH('hl_rus_porch_bench',HX+3,F,fz+.45,0,{v:0});
 hnStoneChimney(HX-2.4,F+H-.9,HZ-1.4,top-F-H+1.2,.68);
 hnSign(HX+W/2-.2,F+2.4,fz+pd-.1,0,'mortar',.9);
 /* smoky notched-log banya steam-bathhouse at +x under lush turf roof */
 const bx=5.4,bz=-1.8,bw=4.6,bd=4.6,bh=2.25;
 hnSocle(bx,0,bz,bw+.2,.35,bd+.2,0);hnRULogBox(bx,.35,bz,bw,bh,bd,0,tar,.28);
 const bTop=hnRUTurf(bx,.35+bh,bz,bw,bd,.94,0,.5,'hGableLog',tar,9);
 vnDoor(bx,.35,bz+bd/2,0,.85,1.78,'vWood',tar,log,false);vnStairs(bx,0,bz+bd/2+.4,0,1.2,.35,2,'vStone',hC(vPick(HPAL.rubble)));
 vnWin(bx+bw/2,.35+.82,bz,Math.PI/2,.52,.52,'glass','hPaint',white);
 hnStoneChimney(bx-1,.35+bh-.6,bz-.9,bTop-.35-bh+1.05,.66);
 /* cold-plunge barrel tub, sweep well & apothecary medicinal herb planters */
 FURNISH('iziz_vern_water_butt',bx-1.8,0,bz+bd/2+1.05,0,{v:1});
 FURNISH('hl_rep_sweep_well',5.2,0,4.2,-.4);
 FURNISH('iziz_vern_planter',-4.6,0,5.2,0,{v:0});FURNISH('iziz_vern_planter',-1.2,0,5.2,0,{v:0});
 hnWoodpile(bx+bw/2+.85,0,bz,Math.PI/2,3.2,1.3);vnFolk(0,4.4,2,1.8);}

/* 19. hl_rus_guild_lodge — Craft artel' brotherhood hall (Novgorodian jettied two-storey timber lodge) */
function buildHlRusGuildLodge(G,o){reseed(26181+(o.v|0));const W=12.4,D=8.4,F=.7,H1=2.95,H2=2.65,GZ=-.6;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.28)),pine=hC(vPick(HPAL.pine)).multiplyScalar(.96),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),red=hC(HPAL.red),ochre=hC(HPAL.ochre);
 vnReg('Artel brotherhood guild lodge (guild)',0,-.2,9.8,F+H1+H2+5.6);
 hnSocle(0,0,GZ,W+.3,F,D+.3,0);
 hnRULogBox(0,F,GZ,W,H1,D,0,log,.32,false);
 /* jettied upper council chamber oversailing on carved brackets */
 const y2=F+H1,OV=.48;
 hnJetty(0,y2,GZ,W,D,0,log,OV);
 hnRULogBox(0,y2,GZ,W+.2,H2,D+2*OV-.1,0,pine,.34,true);
 const yTop=y2+H2,fz=GZ+D/2,fz2=GZ+D/2+OV-.05;
 const top=hnRUShingle(0,yTop,GZ,W+.2,D+2*OV,1.15,0,sh,white,'horns',.85,'hGableLog',pine);
 hnForm('hFormT',-(W+.2)/2-.03,yTop+1.15,GZ,-Math.PI/2,2.8,1.35);hnForm('hFormT',(W+.2)/2+.03,yTop+1.15,GZ,Math.PI/2,2.8,1.35);
 /* ceremonial kryltso entrance stair & bochka canopy */
 hnKryltso(0,0,fz,0,2.4,F,'hKeelSh',sh,log);
 vnDoor(0,F,fz,0,1.35,2.2,'hPaint',white,red,false);
 for(const u of[-4.2,-2.2,2.2,4.2])hnNal(u,F+.88,fz,0,.82,1.08,'glass',white,{shutters:true,accent:ochre});
 for(const u of[-4.4,-2.2,0,2.2,4.4])hnNal(u,y2+.72,fz2,0,.85,1.15,'glass',white,{keel:true,accent:red});
 for(const z of[-2.2,2.2])for(const s of[-1,1])hnNal(s*(W+.2)/2,y2+.72,GZ+z,s*Math.PI/2,.8,1.08,'glass',white,{accent:ochre});
 /* guild shields & brotherhood signboard */
 hnSignBoard(0,yTop+.18,fz2+.06,0,3.6,.82,'hammer',ochre);
 for(const u of[-3.3,3.3])hnRUShield(u,y2-.22,fz+.25,0,.42,red,ochre);
 hnStoneChimney(-3.6,yTop-1.1,GZ-1.8,top-yTop+1.4,.76);
 FURNISH('hl_rep_notice_board',3.6,0,fz+2.1,0);FURNISH('hl_rep_samovar_table',-3.8,0,fz+2.2,0);
 FURNISH('hl_rus_porch_bench',-3.8,0,fz+3.4,Math.PI,{v:0});vnFolk(.8,fz+3.8,3,2);}

/* 20. hl_rus_envoy_lodge — Posol'sky dvor: carved Slavic clan truce & envoy guest-house with terem turret */
function buildHlRusEnvoyLodge(G,o){reseed(26191+(o.v|0));const W=12.6,D=8.2,F=.7,H1=3,H2=2.6,EZ=-1.8,EX=-1.2;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.1,1.3)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),red=hC(HPAL.red),blue=hC(HPAL.blue),ochre=hC(HPAL.ochre);
 vnReg('Posolsky dvor envoy lodge (embassy)',0,-.4,10.8,14.8);
 vB('hCobble',0,-.02,2.8,18.4,.08,9.6,0,hC(0x8c847a));
 hnSocle(EX,0,EZ,W+.3,F,D+.3,0);
 hnRULogBox(EX,F,EZ,W,H1,D,0,tar,.34,false);hnRULogBox(EX,F+H1,EZ,W,H2,D,0,tar,.34,true);
 const yTop=F+H1+H2,fz=EZ+D/2;
 const top=hnRUShingle(EX,yTop,EZ,W,D,1.15,0,sh,white,'bird',.88,'hGableLog',tar);
 hnForm('hFormT',EX-W/2-.03,yTop+1.1,EZ,-Math.PI/2,2.8,1.35);
 /* octagonal terem truce-turret at +x/+z corner with shatyor spire */
 const tx=EX+W/2+1.2,tz=fz-.8;
 vPst('hOctS',tx,0,tz,2.35,F,hC(vPick(HPAL.ashlar)));
 kput('hOctL',[tx,F,tz],null,[2.15,H1+H2+1.6,2.15],tar);
 for(let k=0;k<4;k++){const a=k*Math.PI/2-.4;hnNal(tx+Math.sin(a)*2.02,F+H1+.85,tz+Math.cos(a)*2.02,a,.62,.95,'glass',white,{keel:true,accent:ochre});}
 hnRUShatyor(tx,F+H1+H2+1.6,tz,1.95,1.45,4.2,tar,sh,white,true);
 /* kryltso porch, carved upper balcony & rospis' murals */
 hnKryltso(EX-2.6,0,fz,0,2.3,F,'hKeelSh',sh,tar);
 vnDoor(EX-2.6,F,fz,0,1.3,2.2,'hPaint',white,red,false);hnRUPortal(EX-2.6,F,fz+.03,0,1.3,2.2);
 for(const u of[.4,2.8])hnNal(EX+u,F+.9,fz,0,.85,1.12,'glass',white,{shutters:true,accent:blue});
 for(const u of[-4.2,-1.8,.6,3])hnNal(EX+u,F+H1+.75,fz,0,.82,1.08,'glass',white,{keel:true,accent:red});
 hnRUBalcony(EX+.6,F+H1+.05,fz,0,7.4,1.3,tar,white,true);
 hnStoneChimney(EX-4,yTop-1.1,EZ-1.6,top-yTop+1.5,.76);
 /* truce forecourt: twin banner poles, hitching rail, envoy horse & samovar hospitality table */
 vnBannerPole(-7.6,0,6.8,0,6.6,red);vnBannerPole(7.6,0,6.8,0,6.6,blue);
 FURNISH('hl_rep_hitching_rail',5.4,0,4.6,Math.PI/2);hnRUBeast(4.1,4.6,Math.PI/2,'horse');
 FURNISH('hl_rep_samovar_table',-5.2,0,4.2,0);FURNISH('hl_rus_porch_bench',-5.2,0,5.5,Math.PI,{v:0});
 hnSign(tx+1.8,F+2.6,tz+.8,0,'star',.9);vnFolk(-.8,4.8,3,2.2);}

/* ================================================================ 4. WALLS AND GARRISON */

/* 21. hl_rus_watchtower — Ostrog cantilevered log blockhouse tower with oblom gallery & shatyor tent roof */
function buildHlRusWatchtower(G,o){reseed(26201+(o.v|0));const W=5.2,F=.9,H1=6.6,OW=6.8,OH=2.2;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.25)),log=hC(vPick(HPAL.pine)).multiplyScalar(.88),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.74),white=hC(HPAL.white),rub=hC(vPick(HPAL.rubble));
 vnReg('Ostrog log watchtower (watchhouse)',0,0,6.8,15.8);
 /* battered fieldstone plinth + heavy notched-log tower shaft */
 kput('hBatterRub',[0,0,0],null,[W+.9,F,W+.9],rub);
 hnRULogBox(0,F,0,W,H1,W,0,tar,.34);
 vnDoor(0,F,W/2,0,1.05,2.05,'vWood',tar,hC(HPAL.red),false);vnStairs(0,0,W/2+.65,0,1.45,F,3,'vStone',hC(vPick(HPAL.ashlar)));
 /* staggered loophole slits & watch windows */
 for(let k=0;k<4;k++){const a=k*Math.PI/2,p1=loc(0,0,0,W/2,a),p2=loc(0,0,1.1,W/2,a);
  hnRoom(p1[0],F+3.1,p1[1],.22,.95,.12,a);vnWin(p2[0],F+4.8,p2[1],a,.58,.72,'shut','hPaint',white);}
 /* cantilevered oblom fighting gallery on projecting corbel logs */
 const yO=F+H1;
 for(let i=-2;i<=2;i++){
  kput('hLogX',[0,yO-.18,i*1.1],null,[OW+.35,.2,.2],tar);
  kput('hLogX',[i*1.1,yO-.38,0],qEuler(0,Math.PI/2,0),[OW+.35,.2,.2],tar);}
 vB('vWood',0,yO-.06,0,OW,.16,OW,0,tar);
 hnRULogBox(0,yO+.1,0,OW,OH,OW,0,log,.32,true);
 for(let k=0;k<4;k++){const a=k*Math.PI/2;
  for(const u of[-1.6,0,1.6]){const p=loc(0,0,u,OW/2,a);vnWin(p[0],yO+.78,p[1],a,.62,.75,'shut','hPaint',hC(HPAL.red));}
  hnRUShield(...[loc(0,0,0,OW/2,a)].map(q=>[q[0],yO+.48,q[1]])[0],a,.38,hC(HPAL.red),hC(HPAL.ochre));}
 /* soaring 8-sided shatyor shingle tent spire & watch-vane */
 const tip=hnTent(0,yO+.1+OH,0,OW*.78,5.4,'hTentSh',sh);
 vPst('vIron',0,tip-.25,0,.05,1.35,hC(0x2e2a26));vBall('hGold',0,tip+.65,0,.13,hC(HPAL.gold[0]));
 /* short tyn palisade wing-stubs, spear rack, signal horn & brazier */
 for(const s of[-1,1])for(let i=0;i<6;i++)vPst('vPostB',s*(W/2+.35+i*.34),0,-.8,.17,3.3+(i%2)*.18,log);
 FURNISH('hl_rus_spear_rack',-3.6,0,3.2,.3);FURNISH('hl_rus_horn_post',3.4,0,3.4,-.3);
 FURNISH('hl_tri_brazier',2.2,0,4.4,0);vnFolk(-.8,4.6,1,.8);}

/* 22. hl_rus_gate — Ostrog timber palisade gatehouse with double iron-bound gates, oblom gallery & tyn walls */
function buildHlRusGate(G,o){reseed(26211+(o.v|0));const GW=6.8,GD=6.2,H1=4.4,OW=8,OD=7.4,OH=2.2;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.25)),log=hC(vPick(HPAL.pine)).multiplyScalar(.88),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.74),white=hC(HPAL.white),red=hC(HPAL.red),rub=hC(vPick(HPAL.rubble));
 vnReg('Ostrog palisade gatehouse (gate)',0,0,10.8,14.8);
 vB('hCobble',0,-.02,0,4.4,.08,12.8,0,hC(0x847c72));
 /* twin log gate-bastions flanking the 3.2 m vaulted carriageway */
 for(const s of[-1,1]){
  hnSocle(s*2.5,0,0,1.85,.65,GD+.24,0);
  hnRULogBox(s*2.5,.65,0,1.75,H1-.65,GD,0,tar,.3);}
 /* heavy timber over-arch bridging the passage + double iron-bound gates + portcullis teeth */
 vB('hLogB',0,3.35,0,GW,H1-3.35,GD,0,tar);
 hnDoorway(0,0,GD/2-.15,0,3.15,3.25,{double:true,c:tar});
 for(let i=-3;i<=3;i++)kput('vConeI',[i*.42,3.18,GD/2+.05],qEuler(Math.PI,0,0),[.06,.34,.06],hC(0x2e2a26));
 /* protective Slavic kapliczka icon hood & solar rozetka over the gate arch */
 kput('hKeelW',[0,3.48,GD/2+.12],null,[1.65,.95,.14],white);
 if(KIT.defs.hM_d_sun)kput('hM_d_sun',[0,3.88,GD/2+.22],null,[.62,.62,1],null);
 /* cantilevered oblom gallery + shatyor tent roof */
 for(let i=-2;i<=2;i++)kput('hLogX',[i*1.45,H1-.16,0],qEuler(0,Math.PI/2,0),[OD+.3,.2,.2],tar);
 vB('vWood',0,H1-.04,0,OW,.16,OD,0,tar);
 hnRULogBox(0,H1+.12,0,OW,OH,OD,0,log,.32,true);
 for(const u of[-2.2,0,2.2])for(const sz of[-1,1])vnWin(u,H1+.78,sz*OD/2,sz>0?0:Math.PI,.65,.75,'shut','hPaint',red);
 const tip=hnTent(0,H1+.12+OH,0,OW*.74,5.6,'hTentSh',sh);
 vPst('vIron',0,tip-.25,0,.05,1.25,hC(0x2e2a26));vBall('hGold',0,tip+.6,0,.13,hC(HPAL.gold[0]));
 /* sharpened upright-log tyn palisade walls with rear firing catwalk & ladders */
 for(const s of[-1,1]){
  const x0=s*(GW/2+.2),n=18;
  vB('hRubB',s*6.8,0,0,6.6,.4,1.1,0,rub);
  for(let i=0;i<n;i++){const x=x0+s*i*.36,ph=3.8+(i%3)*.14;
   vPst('vPostB',x,.35,0,.18,ph,log);kput('vConeT',[x,.35+ph,0],null,[.18,.42,.18],log);}
  vB('vWood',s*6.8,2.45,-.85,6.4,.14,1.2,0,tar);
  hnDeckRail([s*3.7,2.55,-1.4],[s*9.8,2.55,-1.4],0,tar,.95);
  for(const u of[4.2,9.2])vPst('vPost',s*u,0,-1.35,.1,2.45,tar);
  vnLadder(s*8.2,0,-1.85,Math.PI,2.6,log);
  vnBannerPole(s*4.2,0,GD/2+1.2,0,6.2,red);}
 vnFolk(2.2,GD/2+2.4,2,1.5);}

/* 23. hl_rus_barracks — Druzhina clan long-barracks with carved shield-gallery, weapon racks & muster yard */
function buildHlRusBarracks(G,o){reseed(26221+(o.v|0));const W=18.2,D=8,F=.6,H1=3,H2=2.3,BZ=-2.2;
 const tar=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.08,1.28)),sh=hC(vPick(HPAL.shingle)).multiplyScalar(.72),white=hC(HPAL.white),red=hC(HPAL.red),ochre=hC(HPAL.ochre);
 vnReg('Druzhina clan long-barracks (barracks)',0,-.4,12.5,F+H1+H2+5.2);
 hnSocle(0,0,BZ,W+.3,F,D+.3,0);
 hnRULogBox(0,F,BZ,W,H1,D,0,tar,.34,false);hnRULogBox(0,F+H1,BZ,W,H2,D,0,tar,.34,true);
 const yTop=F+H1+H2,fz=BZ+D/2;
 const top=hnRUShingle(0,yTop,BZ,W,D,1.12,0,sh,ochre,'horns',.85,'hGableLog',tar);
 hnRUDragons(0,yTop,BZ,W,D,1.12*D/2,0,.85,tar.clone().multiplyScalar(1.2),1.05);
 for(const s of[-1,1])hnForm('hFormT',s*(W/2+.03),yTop+1.15,BZ,s*Math.PI/2,2.8,1.35);
 /* pillared front shield-galereya & upper bunkhouse windows */
 const pd=2;vB('vWood',0,0,fz+pd/2,W-.4,F,pd,0,tar.clone().multiplyScalar(.82));
 for(let i=0;i<=6;i++){const u=-W/2+.6+i*(W-1.2)/6;hnTotemPost(u,F,fz+pd-.2,.15,H1-.1,0);}
 vnShedRoof(0,F+H1-.1,fz+pd/2,W,pd+.25,.6,0,'vShingleB',sh,.28,.14);
 for(let i=0;i<6;i++){const u=-W/2+1.8+i*(W-3.6)/5;hnRUShield(u,F+H1-.45,fz+pd-.12,0,.4,i%2?red:ochre,white);}
 vnStairs(0,0,fz+pd+.55,0,2.6,F,3,'vStone',hC(vPick(HPAL.ashlar)));
 hnDoorway(0,F,fz,0,1.9,2.15,{double:true,c:tar});
 vnDoor(-5.8,F,fz,0,1,2.02,'hPaint',white,red,false);
 for(const u of[-7.4,-3.2,3.2,6.4])vnWin(u,F+.95,fz,0,.78,.9,'shut','hPaint',red);
 for(const u of[-6.8,-4,-1.4,1.4,4,6.8])hnNal(u,F+H1+.62,fz,0,.74,.95,'glass',white,{accent:red});
 hnStoneChimney(-5.2,yTop-1.1,BZ-1.5,top-yTop+1.4,.76);hnStoneChimney(5.2,yTop-1.1,BZ-1.5,top-yTop+1.4,.76);
 /* muster forecourt: spear & weapon racks, pell, archery butt, clan banners & firepit */
 FURNISH('hl_rus_spear_rack',-6.4,0,4.6,0);FURNISH('hl_rep_weapon_rack',6.4,0,4.6,0);
 FURNISH('hl_rus_pell',-2.8,0,5.2,0);FURNISH('hl_rus_target_butt',3.2,0,5.6,Math.PI);
 vnBannerPole(-8.6,0,5.8,0,6.4,red);vnBannerPole(8.6,0,5.8,0,6.4,hC(HPAL.teal));
 hnFirepit(0,0,5.2,.8);vnFolk(-1.2,4,4,2.8);}

/* 24. hl_rus_tollhouse — Zastava mountain-pass & quay tollhouse with counterweighted turnpike barrier, scale-beam & guard porch */
function buildHlRusTollhouse(G,o){reseed(26231+(o.v|0));const W=7.8,D=6.2,F=.55,H=2.95,TX=-3.6,TZ=-.8;
 const log=hC(vPick(HPAL.tar)).multiplyScalar(rr(1.05,1.25)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),red=hC(HPAL.red),rub=hC(vPick(HPAL.rubble));
 vnReg('Zastava tollhouse (customs)',0,0,9.6,F+H+4.6);
 /* cobbled pass / quay toll-road running along +x */
 const rx=4.8;vB('hCobble',rx,-.02,0,5.4,.08,14.8,0,hC(0x888078));
 for(const s of[-1,1])vB('vStone',rx+s*2.8,0,0,.28,.16,14.8,0,hC(vPick(HPAL.ashlar)));
 /* log customhouse overlooking the roadway with overhanging guard porch */
 hnSocle(TX,0,TZ,W+.26,F,D+.26,0);hnRULogBox(TX,F,TZ,W,H,D,0,log,.32,true);
 const top=hnRUShingle(TX,F+H,TZ,W,D,1.15,0,sh,white,'horns',.78,'hGableLog',log);
 hnForm('hFormT',TX+W/2+.03,F+H+1,TZ,Math.PI/2,2.4,1.15);
 const fz=TZ+D/2;
 /* side inspection veranda facing the toll road (+x) */
 const px=TX+W/2+.95;vB('vWood',px,0,TZ,1.9,F,D-.4,0,log.clone().multiplyScalar(.82));
 for(const dz of[-2.4,0,2.4])hnTotemPost(px+.78,F,TZ+dz,.14,2.35,Math.PI/2);
 vnShedRoof(px,F+2.35,TZ,2.1,D,.55,Math.PI/2,'vShingleB',sh,.25,.12);
 vnStairs(px+1.22,0,TZ+1.4,Math.PI/2,1.4,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 vnDoor(TX+1.6,F,fz,0,1.05,2.05,'hPaint',white,red,false);vnStairs(TX+1.6,0,fz+.48,0,1.4,F,2,'vStone',hC(vPick(HPAL.ashlar)));
 hnNal(TX-1.8,F+.9,fz,0,.85,1.05,'glass',white,{shutters:true,accent:red});
 hnNal(TX+W/2,F+.9,TZ-1.2,Math.PI/2,.82,1.02,'glass',white,{accent:red});
 hnStoneChimney(TX-2.2,F+H-.9,TZ-1.3,top-F-H+1.2,.68);
 /* counterweighted Slavic shlagbaum striped turnpike barrier across the toll road */
 const bz=1.6,pL=rx-2.9,pR=rx+2.9;
 vB('hRubB',pL,0,bz,.65,.35,.65,0,rub);vPst('vPostB',pL,.35,bz,.16,1.35,log);
 vB('hRubB',pR,0,bz,.55,.3,.55,0,rub);vPst('vPostB',pR,.3,bz,.13,1.25,log);
 /* striped black-white-red barrier pole + boulder counterweight box */
 for(let k=0;k<9;k++){const sx=pL-.8+k*.78;
  kput('hPaint',[sx,1.52+k*.04,bz],qEuler(0,0,.05),[.8,.13,.13],k%3===0?red:k%2===0?white:hC(HPAL.black));}
 vB('vWood',pL-1.15,1.18,bz,.85,.62,.65,0,log);kput('vRock',[pL-1.15,1.62,bz],null,[.32,.22,.28],rub);
 /* painted Slavic verstovoy stolb (striped milepost) */
 for(let k=0;k<6;k++)vPst('hPaint',rx-2.9,.2+k*.42,5.4,.13,.42,k%2?white:hC(HPAL.black));
 vB('hRubB',rx-2.9,0,5.4,.5,.2,.5,0,rub);kput('vPyrSh',[rx-2.9,2.72,5.4],null,[.42,.35,.42],red);
 /* customs weighing beam, tariff board, sign & inspected cargo */
 hnSign(px+.78,F+2.25,fz-.2,0,'scales',.92);
 FURNISH('hl_rep_weighing_beam',rx-1.8,0,-2.6,Math.PI/2);FURNISH('hl_rep_notice_board',TX-1.8,0,fz+1.8,0);
 hnCrate(rx-1.8,0,-4.4,.78,.2);hnBarrel(rx-1.9,0,-5.3,.34,.85);vnFolk(rx-.6,3.4,2,1.6);}

/* ================================================================ 5. ORCHARDS AND DAIRIES */

/* 25. hl_rus_orchard — Terraced highland apple/plum orchard, Slavic paseka carved log beehives & cider press shed */
function buildHlRusOrchard(G,o){reseed(26241+(o.v|0));
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.88,1.02)),aged=hC(vPick(HPAL.aged)),rub=hC(vPick(HPAL.rubble)),white=hC(HPAL.white),bark=hC(0x523c2a);
 vnReg('Highland orchard and paseka (orchards)',0,0,13.5,7.4);
 /* wattle-fenced orchard plot (keeps +x and -x/-z edges clear for reclaimed twin dress) */
 vB('hTurfB',0,-.02,0,24,.08,20,0,hC(vPick(HPAL.turf)));
 hnRUWattle([-11.5,0,-9.5],[8.5,0,-9.5],1,aged);hnRUWattle([-11.5,0,9.5],[-2,0,9.5],1,aged);hnRUWattle([2,0,9.5],[11.5,0,9.5],1,aged);
 /* two dry-stone retaining terraces on the upper (-z) half with gnarled apple & plum trees */
 vB('hRubB',1.5,0,-5.2,17,.65,7.2,0,rub);vB('hTurfB',1.5,.65,-5.2,16.6,.1,6.8,0,hC(vPick(HPAL.turf)));
 vnStairs(1.5,0,-1.3,0,1.8,.65,3,'vStone',rub);
 const trees=[[-2.8,.72,-6.8,0xd03428],[1.2,.72,-4.2,0x6e2e68],[5.4,.72,-6.6,0xd03428],[8.2,.72,-3.8,0xd89e32],
  [-8.2,0,2.2,0xd03428],[-4.2,0,4.8,0x6e2e68],[.4,0,2.8,0xd03428],[4.6,0,5.2,0xd89e32]];
 for(const [tx,ty,tz,fc] of trees){
  vPst('vPostB',tx,ty,tz,.18,1.65,bark);
  for(let b=0;b<3;b++){const a=b*TAU/3+.4;beam('vWood',[tx,ty+1.35,tz],[tx+Math.sin(a)*.95,ty+2.25,tz+Math.cos(a)*.95],.1,.1,bark);}
  for(let c=0;c<5;c++){const a=c*TAU/5,cr=c===0?0:.85,cy=c===0?ty+2.85:ty+2.35;
   kput('vLeaf',[tx+Math.sin(a)*cr,cy,tz+Math.cos(a)*cr],null,[1.15,.88,1.15],hC(vPick([0x4c7c36,0x5a8c40,0x3f6c2e])));}
  for(let f=0;f<6;f++){const a=f*TAU/6+.2;
   kput('hPaintBall',[tx+Math.sin(a)*1.12,ty+2.15+(f%2)*.35,tz+Math.cos(a)*1.12],null,[.09,.09,.09],hC(fc));}}
 /* Slavic paseka apiary: 5 carved upright log koloda beehives with pitched shingle caps & painted flight-boards */
 const hiveColors=[HPAL.red,HPAL.ochre,HPAL.blue,HPAL.teal,HPAL.white];
 for(let i=0;i<5;i++){const hx=3.6+(i%3)*1.95,hz=-.2+Math.floor(i/3)*2.1,hc=hC(hiveColors[i]);
  vB('vStone',hx,0,hz,.48,.16,.48,0,rub);vPst('vPostB',hx,.16,hz,.28,.98,log);
  vB('hPaint',hx,.62,hz+.29,.22,.05,.12,0,hc);vB('vDarkB',hx,.67,hz+.27,.12,.04,.04,0);
  vnGableRoof(hx,1.14,hz,.72,.72,.38,0,'vShingleB',aged,.1,'hGablePaint',hc,.07);}
 /* turf-roofed log cider-press & fruit-drying shed at -x */
 const sx=-7.2,sz=-3.4,sw=5.4,sd=4.4,shH=2.45;
 hnSocle(sx,0,sz,sw+.2,.35,sd+.2,0);hnRULogBox(sx,.35,sz,sw,shH,sd,0,log,.26);
 hnRUTurf(sx,.35+shH,sz,sw,sd,.9,0,.45,'hGableLog',log,8);
 vnDoor(sx,.35,sz+sd/2,0,.95,1.88,'vWood',log,aged,false);vnWin(sx+1.6,.35+.85,sz+sd/2,0,.65,.7,'shut','hPaint',white);
 /* outdoor timber screw cider-press beside the shed */
 const px=-3.2,pz=sz+1.2;
 vB('vStone',px,0,pz,1.5,.28,1.5,0,rub);vPst('vBarrel',px,.28,pz,.48,.68,log);
 for(const s of[-.58,.58])vPst('vPost',px+s,.28,pz,.08,1.75,aged);
 vB('vWood',px,1.88,pz,1.45,.18,.24,0,aged);vPst('vPost',px,.96,pz,.07,1.25,white);vB('vWood',px,1.52,pz,.95,.08,.08,.4,white);
 hnBarrel(sx+2.1,0,sz+sd/2+1.2,.34,.85);hnCrate(sx-1.8,0,sz+sd/2+1.3,.7,.2);
 hnSign(sx+sw/2-.2,.35+2.1,sz+sd/2,0,'sheaf',.82);vnFolk(-.8,6.4,2,2);}

/* 26. hl_rus_dairy — Carpathian Hutsul koliba octagonal log alpine sheep-and-cattle cheese dairy, whey cauldron & aging cellar */
function buildHlRusDairy(G,o){reseed(26251+(o.v|0));const KX=-4.2,KZ=-2.2,KR=3.4;
 const log=hC(vPick(HPAL.pine)).multiplyScalar(rr(.88,1.02)),tar=hC(vPick(HPAL.tar)),sh=hC(vPick(HPAL.shingle)),white=hC(HPAL.white),ochre=hC(HPAL.ochre),rub=hC(vPick(HPAL.rubble));
 vnReg('Carpathian koliba cheese dairy (dairymen)',0,0,11.2,8.8);
 /* octagonal Carpathian log koliba shepherd's cheese-house with raised smoke-curing cupola */
 vPst('hOctS',KX,0,KZ,KR+.2,.45,rub);
 kput('hOctL',[KX,.45,KZ],null,[KR,2.65,KR],log);
 hnRULogBox(KX,.45,KZ+KR-.35,2.5,2.35,1.65,0,log,.24);
 hnRUShingle(KX,2.8,KZ+KR-.35,2.5,1.65,1.15,0,sh,white,'horns',.35,'hGableLog',log);
 vnDoor(KX,.45,KZ+KR+.48,0,.98,1.92,'hPaint',white,ochre,false);vnStairs(KX,0,KZ+KR+.92,0,1.4,.45,2,'vStone',rub);
 vnWin(KX-KR*.95,1.35,KZ,-Math.PI/2,.65,.72,'glass','hPaint',white);
 const t1=hnTent(KX,3.1,KZ,KR*1.24,3.2,'hTentSh',sh);
 /* raised smoke-hood lantern where oscypek & brynza cheeses cure in woodsmoke */
 kput('hOctW',[KX,t1-.55,KZ],null,[.95,1.05,.95],tar);
 for(let a=0;a<4;a++){const p=loc(KX,KZ,0,.9,a*Math.PI/2);hnRoom(p[0],t1-.32,p[1],.52,.42,.08,a*Math.PI/2);}
 hnTent(KX,t1+.5,KZ,1.25,1.45,'hTentSh',sh);
 /* outdoor covered whey-boiling copper cauldron hearth & wooden churn rack */
 const hx=KX+4.4,hz=KZ+1.2;
 vB('hRubB',hx,0,hz,1.7,.48,1.7,0,rub);vBall('vEmber',hx,.25,hz+.82,.18,null,.1);
 vPst('vBarrel',hx,.45,hz,.56,.68,hC(0xb86b38));kput('hRUDisc',[hx,1.08,hz],null,[.5,.04,.5],hC(0xf2ebd4));
 FURNISH('rustic_common_churn_rack',KX-3.2,0,KZ+3.8,.25);
 /* half-sunken turf-roofed stone cheese-aging cellar at front-left */
 const cx=-4.6,cz=4.8;
 vB('hRubB',cx,0,cz,3.8,1.35,3.6,0,rub);
 hnRUTurf(cx,1.35,cz,3.8,3.6,.85,0,.4,'hGableRub',rub,6);
 vnDoor(cx,0,cz+1.82,0,.88,1.68,'vWood',tar,ochre,false);
 /* split-rail sheep & dairy-cow milking fold (keeps +x outer strip clear for reclaimed dress) */
 vnFence(4.2,0,2.2,8.4,10.4,0,log,2.4,1.1);
 hnRUBeast(2.8,1.2,.5,'cow');hnRUBeast(5.4,3.4,2.1,'sheep');hnRUBeast(3.6,4.8,-.7,'sheep');hnRUBeast(6.1,.4,1.4,'goat');
 FURNISH('hl_rus_trough',1.8,0,5.2,0,{v:0});
 hnSign(KX+1.35,2.45,KZ+KR+.48,0,'barrel',.82);vnFolk(-.2,4.4,2,1.6);}

/* 27. hl_rus_mushroom_cellar — Sunken Slavic turf pogreb mushroom & root cellar works */
function buildHlRusMushroomCellar(G,o){reseed(26261+(o.v|0));
 const log=hC(vPick(HPAL.aged)).multiplyScalar(rr(.9,1.04)),tar=hC(vPick(HPAL.tar)),turf=hC(vPick(HPAL.turf)),rub=hC(vPick(HPAL.rubble)),white=hC(HPAL.white);
 vnReg('Pogreb turf mushroom cellars (fungiculture)',0,0,9.6,6.2);
 /* twin earth-bermed, sod-blanketed Slavic pogreb dark cellars (leaves +x and -x/-z outer margin clear for reclaimed dress) */
 for(const [cx,cz,cw,cd] of[[-3.6,-1.6,5.2,6.8],[2.8,-2.2,4.8,6.2]]){
  kput('hGableTurf',[cx,0,cz-.6],null,[cw+2.4,1.95,cd+.6],turf);
  for(const s of[-1,1])kput('hGableTurf',[cx+s*(cw/2+.2),0,cz],qEuler(0,Math.PI/2,0),[cd,1.55,2.2],turf);
  vB('hRubB',cx,0,cz,cw,1.85,cd,0,rub);
  hnRULogBox(cx,0,cz+cd/2-.35,cw,2.15,.8,0,log,.22);
  const cTop=hnRUTurf(cx,2.1,cz,cw,cd,.88,0,.45,'hGableLog',log,11);
  vnDoor(cx,0,cz+cd/2+.06,0,.92,1.82,'vWood',tar,white,false);
  /* clay breather vent-pipe on the sod ridge */
  vPst('vClayPot',cx,cTop-.25,cz-.6,.16,.85,hC(0x9a5436));kput('vConeT',[cx,cTop+.58,cz-.6],null,[.28,.26,.28],tar);}
 /* covered spawn-composting & inoculated birch-log mushroom bed porch in front */
 const px=-.4,pz=4.2;
 for(const sx of[-3.2,0,3.2])for(const sz of[-1.3,1.3])vPst('vPostB',px+sx,0,pz+sz,.09,2.15,tar);
 vnShedRoof(px,2.15,pz,7,3,.42,0,'hTurfB',turf,.3,.14);
 for(const u of[-1.6,1.6]){
  vB('vWood',px+u,0,pz,2.4,.38,1.8,0,log);vB('hPaint',px+u,.36,pz,2.2,.08,1.6,0,hC(0x3a2c20));
  for(let k=0;k<3;k++){const lz=pz-.5+k*.5;
   kput('hLogX',[px+u,.52,lz],null,[1.9,.11,.11],log);
   for(let m=0;m<4;m++)kput('hPaintBall',[px+u-.65+m*.44,.66,lz+rr(-.06,.06)],null,[.09,.06,.09],hC(vPick([0xe8dcc4,0xd4a45a,0xc88a48])));}}
 FURNISH('iziz_vern_crate',-4.8,0,3.8,.2,{v:1});FURNISH('iziz_vern_barrel',3.8,0,2.8,0,{v:0});
 vnFolk(-.4,6.4,2,1.4);}

/* ---------------------------------------------------------------- registry */
HL.def({key:'hl_rus_bakehouse',name:'Log bakehouse',branch:'rustic',family:'Food and hospitality',tags:HRU_TAG(['shop','industry'],'middle',{job:'baking',role:'bakery'}),w:19,d:16,h:9,build:buildHlRusBakehouse});
HL.def({key:'hl_rus_butcher',name:'Butcher and smokehouse',branch:'rustic',family:'Food and hospitality',tags:HRU_TAG(['shop','industry'],'middle',{job:'butchery',role:'butcher'}),w:18,d:16,h:9,build:buildHlRusButcher});
HL.def({key:'hl_rus_distillery',name:'Peat pot-still distillery',branch:'rustic',family:'Food and hospitality',tags:HRU_TAG(['industry','shop'],'middle',{job:'brewing',role:'distillery'}),w:22,d:18,h:12,build:buildHlRusDistillery});
HL.def({key:'hl_rus_inn',name:'Postoyaly dvor coaching inn',branch:'rustic',family:'Food and hospitality',tags:HRU_TAG(['inn','tavern'],'middle',{role:'coaching-inn'}),w:24,d:22,h:13,build:buildHlRusInn});
HL.def({key:'hl_rus_market',name:'Torg covered market',branch:'rustic',family:'Food and hospitality',tags:HRU_TAG(['market','shop'],'middle',{job:'trading',role:'market'}),w:22,d:18,h:8,build:buildHlRusMarket});

HL.def({key:'hl_rus_weaver',name:'Weaver and dyer hall',branch:'rustic',family:'Crafts and works',tags:HRU_TAG(['industry','shop'],'middle',{job:'weaving',role:'weaver-dyer'}),w:20,d:18,h:10,build:buildHlRusWeaver});
HL.def({key:'hl_rus_tannery',name:'Bark-tanning yard',branch:'rustic',family:'Crafts and works',tags:HRU_TAG(['industry'],'poor',{job:'tanning',role:'tannery'}),w:21,d:17,h:8,build:buildHlRusTannery});
HL.def({key:'hl_rus_woodcarver',name:'Woodcarver and potter kiln',branch:'rustic',family:'Crafts and works',tags:HRU_TAG(['industry','shop'],'middle',{job:'carpentry',role:'woodcarver-potter'}),w:20,d:16,h:9,build:buildHlRusWoodcarver});
HL.def({key:'hl_rus_warehouse',name:'Ambar log warehouse',branch:'rustic',family:'Crafts and works',tags:HRU_TAG(['industry'],'middle',{job:'warehousing',role:'warehouse'}),w:20,d:17,h:11,build:buildHlRusWarehouse});
HL.def({key:'hl_rus_charcoal_works',name:'Charcoal and birch-tar works',branch:'rustic',family:'Crafts and works',tags:HRU_TAG(['industry'],'poor',{job:'smithing',role:'charcoal-tar-works'}),w:23,d:18,h:9,build:buildHlRusCharcoalWorks});
HL.def({key:'hl_rus_mine',name:'Highland adit mine',branch:'rustic',family:'Crafts and works',tags:HRU_TAG(['industry'],'poor',{job:'mining',role:'mine'}),w:23,d:19,h:10,build:buildHlRusMine});
HL.def({key:'hl_rus_quarry',name:'Granite and slate quarry',branch:'rustic',family:'Crafts and works',tags:HRU_TAG(['industry'],'poor',{job:'quarrying',role:'quarry'}),w:25,d:19,h:11,build:buildHlRusQuarry});
HL.def({key:'hl_rus_generator',name:'Salvaged turbine powerhouse',branch:'rustic',family:'Salvage',tags:HRU_TAG(['infrastructure','industry'],'middle',{salvage:true,role:'powerhouse'}),w:21,d:18,h:12,build:buildHlRusGenerator});

HL.def({key:'hl_rus_shrine',name:'Wayside chasovnya shrine',branch:'rustic',family:'Civic and sacred',tags:HRU_TAG(['religious'],'civic',{job:'worship',role:'shrine'}),w:12,d:12,h:10,build:buildHlRusShrine});
HL.def({key:'hl_rus_pogost',name:'Wooden pogost chapel',branch:'rustic',family:'Civic and sacred',tags:HRU_TAG(['funerary','religious'],'civic',{job:'worship',role:'funerary-chapel'}),w:22,d:22,h:16,build:buildHlRusPogost});
HL.def({key:'hl_rus_skete',name:'Wooden skit monastery',branch:'rustic',family:'Civic and sacred',tags:HRU_TAG(['religious'],'civic',{job:'worship',role:'monastery'}),w:25,d:23,h:15,build:buildHlRusSkete});
HL.def({key:'hl_rus_school',name:'Gramota schoolhouse',branch:'rustic',family:'Civic and sacred',tags:HRU_TAG(['civic'],'civic',{job:'scribing',role:'school'}),w:18,d:16,h:11,build:buildHlRusSchool});
HL.def({key:'hl_rus_healer',name:'Znakhar infirmary and banya',branch:'rustic',family:'Civic and sacred',tags:HRU_TAG(['civic'],'middle',{job:'healing',role:'healer'}),w:20,d:18,h:9,build:buildHlRusHealer});
HL.def({key:'hl_rus_guild_lodge',name:'Artel brotherhood lodge',branch:'rustic',family:'Civic and sacred',tags:HRU_TAG(['civic','industry'],'rich',{role:'guild-hall'}),w:20,d:18,h:12,build:buildHlRusGuildLodge});
HL.def({key:'hl_rus_envoy_lodge',name:'Posolsky dvor envoy lodge',branch:'rustic',family:'Civic and sacred',tags:HRU_TAG(['civic'],'rich',{role:'embassy'}),w:22,d:19,h:15,build:buildHlRusEnvoyLodge});

HL.def({key:'hl_rus_watchtower',name:'Ostrog log watchtower',branch:'rustic',family:'Walls and garrison',tags:HRU_TAG(['military','civic'],'civic',{role:'watchhouse'}),w:14,d:14,h:16,build:buildHlRusWatchtower});
HL.def({key:'hl_rus_gate',name:'Ostrog palisade gatehouse',branch:'rustic',family:'Walls and garrison',tags:HRU_TAG(['military','infrastructure'],'civic',{role:'gatehouse'}),w:22,d:14,h:15,build:buildHlRusGate});
HL.def({key:'hl_rus_barracks',name:'Druzhina clan barracks',branch:'rustic',family:'Walls and garrison',tags:HRU_TAG(['military'],'civic',{role:'barracks'}),w:24,d:18,h:12,build:buildHlRusBarracks});
HL.def({key:'hl_rus_tollhouse',name:'Zastava pass tollhouse',branch:'rustic',family:'Walls and garrison',tags:HRU_TAG(['civic','infrastructure'],'civic',{job:'customs',role:'customs'}),w:20,d:17,h:9,build:buildHlRusTollhouse});

HL.def({key:'hl_rus_orchard',name:'Terraced orchard and paseka',branch:'rustic',family:'Orchards and dairies',tags:HRU_TAG(['farm'],'middle',{job:'farming',role:'orchard'}),w:26,d:22,h:8,build:buildHlRusOrchard});
HL.def({key:'hl_rus_dairy',name:'Carpathian koliba dairy',branch:'rustic',family:'Orchards and dairies',tags:HRU_TAG(['farm','industry'],'middle',{job:'dairy',role:'dairy'}),w:22,d:19,h:9,build:buildHlRusDairy});
HL.def({key:'hl_rus_mushroom_cellar',name:'Pogreb mushroom cellars',branch:'rustic',family:'Orchards and dairies',tags:HRU_TAG(['farm'],'poor',{job:'fungiculture',role:'mushroom-farm'}),w:19,d:17,h:6,build:buildHlRusMushroomCellar});
