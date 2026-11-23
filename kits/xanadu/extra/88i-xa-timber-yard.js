/* ================================================================= XANADU — the timber yard (the shipwrights' timber and saw pit)
   OPT-IN until the kit's next all-builds rebuild (kits/xanadu/README.md, "Opt-in pieces"; settlements/xanadu-lake/PLAN.md section
   5, the pieces named missing: Boṭ-Yārḍ's timber yard, step L3, 2026-11-23): a page takes it through its kit.json "external"
   (settlements/xanadu-lake), so no other page changes; it joins src/ with the ride-along rebuild. Drawn as 88g's are: its own
   frame, front +z, its ground at local y 0, opening with its own reseed, on the kit's vocabulary and 88g's shared helpers
   (xwHeap, xwTable: a page that takes this file takes 88g too). Seeds 34901-34902.
     xa_timber_yard    Boṭ-Yārḍ's: the log stacks at the back (the Cataracts' timber, come up the lake by Erewhon), the saw pit
                       with its trestle, a log on it and the two sawyers (top and pit), the plank stacks stickered to season,
                       the shed under a board gable where the knees and the ribs are shaped, the sheerlegs over the log pile,
                       the chips and the sawdust; v 1 a second saw pit and the shed's rubble back wall */

/* ---------------------------------------------------------------- the timber yard: 26 x 20, the logs at -z, the planks at +z */
function buildXaTimberYard(G,o){reseed(34901+(o.v|0));const V=xV(o),earth=xC(xPick(XPAL.earth)),rub=xC(xPick(XPAL.rubble)),
 tim=xC(xPick(XPAL.aged)),timD=xC(0x4a3a28),bark=xC(0x5e4a36),board=xC(0x8a7658),fresh=xC(0xc8a878),dust=xC(0xb89a70);
 vnReg('Timber yard',0,0,13,5);
 vB('xEarthB',0,0,0,25,.05,19,0,earth.clone().multiplyScalar(.9));                       /* the yard's trodden floor */
 /* the log stacks along the back: whole trunks in tiers, their bark on, chocks under the bottom tier */
 for(let s=0;s<2;s++){const x0=s?3:-9.5;
  for(const x of[-3.2,3.2])vB('vWood',x0+3.2+x,0,-7.2,.3,.25,2.6,0,timD);
  for(let j=0;j<3;j++)for(let i=0;i<4-j;i++){const r=rr(.26,.34);
   kput('vPost',[x0+.4+r,.25+r+j*.6,-8.2+i*.62+j*.31],qEuler(0,0,-Math.PI/2),[r,6.2,r],bark.clone().multiplyScalar(rr(.85,1.12)));}}
 /* the sheerlegs over the log pile: two legs leaning together, the tackle hanging */
 kput('vPost',[-1.1,2.3,-8.6],qEuler(0,0,.32),[.12,4.8,.12],timD);kput('vPost',[1.1,2.3,-8.6],qEuler(0,0,-.32),[.12,4.8,.12],timD);
 vB('vWood',0,4.55,-8.6,.5,.2,.3,0,timD);vB('vWood',0,2.6,-8.6,.04,1.9,.04,0,xC(0xb8a888));
 /* the saw pit(s): a dark pit with a timber lining, the trestle over it, a squared log on it, the pit sawyer below */
 const PITS=V===1?[-6,2]:[-2];
 for(const px of PITS){vB('vDarkB',px,-.02,-1,1.4,.06,6,0);for(const s of[-1,1])vB('vWood',px+s*.8,0,-1,.18,.3,6.2,0,timD);
  for(const z of[-3.4,1.4]){vB('vWood',px,0,z,2.2,.9,.22,0,timD);vB('vWood',px,.9,z,2.4,.18,.3,0,timD);}
  vB('vWood',px,1.08,-1,.5,.45,6.6,0,fresh);                                                /* the log, squared on top */
  vB('vWood',px,1.2,-1.6,.04,1.6,.5,0,xC(0x6a6a6a));                                        /* the pit saw, upright in the cut */
  xwHeap(px+1.6,.8,.9,.7,.2,dust,5);}
 /* the plank stacks in front, stickered to season: boards in layers with laths between, a roof board on top */
 for(let k=0;k<3;k++){const x=-8+k*6.4,z=5.4;
  for(let j=0;j<6;j++){vB('vWood',x,.2+j*.2,z,4.2,.08,1.6,0,board.clone().multiplyScalar(rr(.9,1.08)));for(const u of[-1.6,0,1.6])vB('vWood',x+u,.28+j*.2,z,.06,.08,1.7,0,timD);}
  vB('vWood',x,1.45,z,4.6,.05,2.0,0,timD);for(const u of[-1.8,1.8])vB('vWood',x+u,0,z,.24,.2,1.7,0,timD);}
 /* the shed: posts, a board gable, the shaping bench and the ribs and knees laid out under it; v 1 a rubble back wall */
 const SX=9,SZ=-1,SW=7,SD=6,SH=3;
 for(const x of[SX-SW/2,SX,SX+SW/2])for(const s of[-1,1])vB('vWood',x,0,SZ+s*SD/2,.22,SH,.22,0,timD);
 for(const s of[-1,1])vB('vWood',SX,SH,SZ+s*SD/2,SW+.3,.2,.24,0,timD);
 vnGableRoof(SX,SH+.2,SZ,SW+.5,SD+.4,1.2,0,'vWood',board,.5);
 if(V===1)vB('xRubB',SX,0,SZ-SD/2-.25,SW,2.2,.45,0,rub);
 xwTable(SX-1.4,SZ,2.6,.9,.85,0,tim);xwTable(SX+1.8,SZ+1,1.8,.8,.85,0,tim);
 for(let k=0;k<5;k++){const a=-.6+k*.3;kput('vWood',[SX+.2+k*.55,.12,SZ-1.6],qEuler(0,a,0),[.12,.12,2.2],fresh.clone().multiplyScalar(rr(.9,1.05)));}   /* the ribs */
 for(let k=0;k<3;k++){vB('vWood',SX-2.6+k*.9,.1,SZ+2.2,.5,.2,.18,0,fresh);vB('vWood',SX-2.45+k*.9,.1,SZ+2.55,.2,.2,.6,0,fresh);}   /* the knees */
 /* the chips heap and the offcuts by the gate, the water butt */
 xwHeap(4.6,8.4,1.6,1.1,.45,fresh.clone().multiplyScalar(.82),8);
 for(let k=0;k<6;k++)kput('vWood',[-11+rr(-.6,.6),.1,8+rr(-.8,.8)],qEuler(0,rng()*3,0),[rr(.4,1.1),.12,rr(.12,.25)],fresh.clone().multiplyScalar(rr(.8,1.0)));
 vPst('vBarrel',11.4,0,7.6,.4,.9,tim);
 xnFolk(2,0,4,3,5);}
XA.def({key:'xa_timber_yard',name:'Timber yard (the shipwrights\')',family:'Works',tags:{type:['industry'],wealth:'poor',job:'shipwrighting',lit:false},w:26,d:20,h:6,fw:24,fd:18,nv:2,build:buildXaTimberYard});
