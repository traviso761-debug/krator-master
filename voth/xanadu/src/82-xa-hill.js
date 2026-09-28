// ================================================================= XANADU — the hillside (package X-I)
// The brief: "the terrain is hilly, buildings should still read well on an incline." This is the kit's proof: four
// terraces stepping up a slope, and on each one houses from the kit stood ASTRIDE the terrace edge with their
// front half hanging over the drop — placed through xnSub with o.drop, so every one grows the battered rubble
// footing that XA.def gives any building sited on a slope. Stairs climb between the terraces, a shrine and pennant
// lines crown the top. In a settlement the terrain does what the terraces do here. Seeds 31800–31899.
function buildXaHillside(G,o){reseed(31801+(o.v|0));const V=xV(o),STEP=V===3?2.4:V===4?4:3.2,TW=46;
 const rub=xC(xPick(XPAL.rubble)),stone=xC(xPick(XPAL.stone)),aged=xC(xPick(XPAL.aged));
 vnReg('Hillside quarter',0,0,24,STEP*3+12);
 // the terraces: step k has its top at k*STEP and its front edge at z = 10 - 10k (k = 1..3); the ground is step 0
 for(let k=1;k<=3;k++){const zf=10-10*k;xnTerrace(0,0,zf-5-(k===3?4:0),TW,10+(k===3?8:0),0,k*STEP,rub);}
 // the houses, each astride its terrace's front edge, front toward the valley (+z), footing dropped one step
 const H=[[3,'xa_mid_a',-9,0],[3,'xa_poor_a',8.5,0],[2,'xa_poor_b',-9,0],[2,'xa_poor_c',9.5,0],[1,'xa_poor_a',-9.5,0],[1,'xa_mid_a',9,0]];
 for(const [k,key,x,ry] of H){const zf=10-10*k;xnSub(key,x,k*STEP,zf,ry,{drop:STEP,v:((k+(x>0?1:0)+V)%5)});}
 // the ground row: a shrine, a well, a tree and the lane
 xnShrine(-14,0,17,1.2);xnTree(12,17,4.5);vPst('vPostS',4,0,17,.8,.8,rub);vB('vDarkB',4,.8,17,1,.03,1,0);
 xnPave(0,18.5,TW-6,4,0,stone,2.4);
 // the stairs between the terraces, on the axis, with a rubble parapet; a switchback path across each terrace
 for(let k=1;k<=3;k++){const zf=10-10*k,run=Math.max(2,Math.round(STEP/.17))*.34;xnFlight(0,(k-1)*STEP,zf+run+.05,0,2.4,STEP,'vStone',stone);
  vB('xRubB',-1.6,(k-1)*STEP,zf+run/2,.5,.8+STEP*.5,run,0,rub);vB('xRubB',1.6,(k-1)*STEP,zf+run/2,.5,.8+STEP*.5,run,0,rub);
  xnPave(0,zf-2.2,TW-8,3.2,0,stone,2.2);}
 // the crown: a shrine, a pennant mast, lines down to the houses; drying fodder on the top terrace
 xnShrine(0,STEP*3,-20,1.6);vPst('vPost',0,STEP*3,-16,.08,6,aged);vBall('xGold',0,STEP*3+6.1,-16,.12,xC(XPAL.gold[0]));
 for(const s of[-1,1]){xnPennants([0,STEP*3+5.8,-16],[s*12,STEP*3+2.8,-10],9);xnPennants([s*12,STEP*3+2.8,-10],[s*14,STEP*2+2.6,0],8);vPst('vPost',s*12,STEP*3,-10,.05,2.8,aged);vPst('vPost',s*14,STEP*2,0,.05,2.6,aged);}
 for(let k=0;k<4;k++)kput('vThatchB',[-18+k*2.2,STEP*3+.3,-18],qEuler(0,rr(-.2,.2),0),[1.6,.6,1.2],xC(xPick(VPAL.thatch)));
 xnYak(-16,-14,0,STEP*3);xnYak(16,-15,2.4,STEP*3);for(const s of[-1,1])xnTree(s*20,-4,4,null,STEP*2);
 vnFolk(0,19,3,2);xnFolk(3,STEP*2,-3,2,1);}
XA.def({key:'xa_hillside',name:'Hillside quarter',family:'Hillside',tags:{type:['multi-family dwelling','single-family dwelling'],wealth:'poor',lit:false},w:50,d:44,h:22,build:buildXaHillside});
