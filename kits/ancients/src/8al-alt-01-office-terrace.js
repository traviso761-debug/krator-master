// ================================================================= OFFICE ALT 1 — "the Terrace Wedge"
// A stepped office mass wedged between two blind service slabs, its trays
// stepping back toward a louvred crown slung between the slab heads. Every
// tray carries a sloped sunshade along its edge, so from the street the steps
// read as one ribbed slope. After arco1 #30 and #72 (the stepped, louvred
// pyramid between sheer concrete shafts).
// Ruin: the east slab snapped at two thirds and lies along the plain; the
// crown lost its east bearing and hangs tilted; the front-east trays are bitten
// out down to the podium. Decay contract: see 8al-alt-00-lib.js.
function buildAltOfficeTerrace(scene,gx,gz,d){reseed(9905);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),acc=[],slabAcc=[];
 REGISTER({name:'Office alt 1 — the Terrace Wedge ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:70,h:126});
 const PB=8,NT=18,TH=4.2,ZB=-22;
 const hw=i=>lerp(40,21,i/(NT-1)),zf=i=>lerp(40,9,i/(NT-1));
 const bite=fall?altBite(28,30,30,24,32,26,3.1):()=>false;
 // podium with a front colonnade
 acBox(acc,0,PB/2,10,104,PB,84);
 for(let k=-6;k<=6;k++){const x=k*7.6;kput(BOXC(d),[x,PB/2,53],null,[1.6,PB,1.6],null);}
 kput(BOXC(d),[0,PB+.4,53],null,[100,.8,3],null);
 altBand(0,PB/2,52.1,96,5,[0,0,1],d,true);
 // the trays
 for(let i=0;i<NT;i++){const y=PB+i*TH,w=hw(i),f=zf(i);
  // the tray in segments a collapse can take out: the core (back wall to six
  // metres behind the front), the front strip, and the sunshade
  const nS=Math.round(2*w/6);
  for(let s=0;s<nS;s++){const x=-w+(s+.5)*2*w/nS;
   if(!bite(x,y,f-12))acBox(acc,x,y+.4,(ZB+f-6)/2,2*w/nS+.02,.8,f-6-ZB);
   else if(altH(x,y,s)<.4)acBox(acc,x,y+.2,(ZB+f-6)/2,2*w/nS*.8,.6,(f-6-ZB)*.5,0,(altH(y,x,s)-.5)*.6,(altH(s,y,x)-.5)*.5);   // a slab hanging off its rebar
   if(bite(x,y,f-3))continue;
   acBox(acc,x,y+.4,f-3,2*w/nS+.02,.8,6);
   acBox(slabAcc,x,y+TH*.55,f+.6,2*w/nS+.02,.22,TH*.95,0,-.62);}          // sloped louvre plate
  // sides: floor strip and sunshade on each flank
  for(const sx of[-1,1]){if(bite(sx*w,y,f-12))continue;
   acBox(slabAcc,sx*(w+.6),y+TH*.55,(ZB+f)/2,.22,TH*.95,f-ZB,0,0,sx*.62);}
  // glazing set back from the edge, under the louvres
  if(!bite(-w*.5,y,f))altBand(-w*.45,y+TH*.55,f-6,w*.9,TH*.7,[0,0,1],d,true);
  if(!bite(w*.5,y,f))altBand(w*.45,y+TH*.55,f-6,w*.9,TH*.7,[0,0,1],d,true);
  for(const sx of[-1,1])altBand(sx*(w-.1),y+TH*.55,(ZB+f-6)/2,f-6-ZB-2,TH*.7,[sx,0,0],d,i%3===0);
  // planting along the tray edges: a few planters intact, more growth in a ruin
  if(i%2===0)for(let k=0;k<4;k++){const x=rr(-w+3,w-3);if(bite(x,y,f))continue;
   kput('hedge',[x,y+1.1,f-1.2],null,[rr(3,6),.7,1],new THREE.Color().setHSL(rr(.22,.3),.45,.32));}}
 const yTop=PB+NT*TH;
 acBox(acc,0,yTop+.4,(ZB+zf(NT-1))/2,2*hw(NT-1),.8,zf(NT-1)-ZB);
 // the back wall, sheer
 acBox(acc,0,yTop/2,ZB-1,84,yTop,2);
 // the two service slabs; the east one snaps at ~78 m in a ruin
 const SH=124,SW=14,SZ0=-26,SZ1=10,cutE=fall?78:SH;
 for(const sx of[-1,1]){const h=sx>0?cutE:SH;acBox(acc,sx*30,h/2,(SZ0+SZ1)/2,SW,h,SZ1-SZ0);
  for(const ox of[-3.5,3.5]){const L=h-14;kput(d>0?'boxD':'darkPane',[sx*30+ox,8+L/2,SZ1+.12],null,[1.1,L,1],null);}
  for(let y=14;y<h-6;y+=8)kput(d>0?'cellD':'cell',[sx*(30+SW/2+.3),y,-8],qFacing([sx,0,0]),[1.2,3,1],d>0?null:(altH(sx,y,0)<.5?WARM:CYAN));}
 if(fall){// the fallen head of the east slab, laid along the plain to the east
  const F=new THREE.Group();F.position.set(78,0,-14);F.rotation.set(0,.25,-Math.PI/2+.07);G.add(F);
  const fa=[];acBox(fa,0,0,0,SW,SH-cutE-6,SZ1-SZ0);meshMerged(fa,CM,F);dropFragment(F,0,1.2);
  altHeap(44,-8,16,60,2.4);altHeap(70,-14,22,40,1.8);
  // its broken stump: a jagged lip of fragments on the cut
  for(let k=0;k<7;k++)kput(BOXC(d),[30+rr(-6,6),cutE+rr(.5,4),rr(SZ0+2,SZ1-2)],qEuler(rr(-.4,.4),rr(0,3),rr(-.4,.4)),[rr(2,5),rr(2,6),rr(2,5)],null);
  altHeap(26,40,14,50,2.2);}
 else{kput('postW',[-30,SH+9,-8],null,[.5,18,.5],null);kput('strip',[-30,SH+18,-8],null,[3,1,1],d>0?DEAD:CYAN);}
 altMerge(acc,CM,G);altMerge(slabAcc,d>0?MAT.rust:MAT.white,G);
 // THE CROWN: a louvred box slung between the slab heads, cantilevered forward
 const C=new THREE.Group();C.position.set(-23,yTop+.8,0);G.add(C);if(fall)C.rotation.set(0,0,-.14);
 useGroupXF(C);const ca=[],cf=[];const CW=46,CH=16,CZ0=-20,CZ1=16;
 acBox(ca,CW/2,.5,(CZ0+CZ1)/2,CW,1,CZ1-CZ0);acBox(ca,CW/2,CH-.5,(CZ0+CZ1)/2,CW,1,CZ1-CZ0);
 kput('boxD',[CW/2,CH/2,(CZ0+CZ1)/2],null,[CW-2,CH-2,CZ1-CZ0-2],null);
 for(let x=1;x<CW;x+=1.6){if(fall&&x>CW*.72&&altH(x,1,2)<.6)continue;acBox(cf,x,CH/2,CZ1,.35,CH,1.6);}
 for(let z=CZ0+1;z<CZ1;z+=1.6)for(const ex of[0,CW]){if(fall&&ex>0&&altH(z,2,1)<.5)continue;acBox(cf,ex,CH/2,z,1.6,CH,.35);}
 meshMerged(ca,CM,C);meshMerged(cf,d>0?MAT.rust:MAT.white,C);
 if(d===0)for(let k=0;k<6;k++)kput('cell',[4+k*7.5,CH*.5,CZ1-1.2],null,[5,CH*.6,1],k%2?WARM:CYAN);
 endGroupXF();
 REGISTER({name:'Office alt 1 — the crown',x:0,z:-2,r:28,h:20,y:yTop});
 // ground
 apron(G,0,10,56,72,d,.6);
 if(dd){altHeap(30,46,12,40,1.8);mossOnRing(0,PB+.4,10,46,30,2);vinesOnRing(0,PB,10,51,14,6);
  for(let i=0;i<NT;i+=2)for(let k=0;k<3;k++){const x=rr(-hw(i)+2,hw(i)-2);if(bite(x,PB+i*TH,zf(i)))continue;
   kput('vine',[x,PB+i*TH+.4,zf(i)+1.6],null,[1,rr(3,7),1],null);}
  altTrees(14,64,120,58,60);}
 else altTrees(8,70,120,58,60);
 figures(0,70,5,10);
 // reclaimed: its own stream, last, so it moves nothing above. Fires burn in
 // a block of trays on the west side, where the glazing line is whole.
 if(d===2){reseed(9930);
  for(let i=2;i<NT-2;i++){const y=PB+i*TH,w=hw(i),f=zf(i);for(let k=0;k<5;k++){const x=-w*.9+k*w*.22+rr(-1,1);
   if(fbm(x*.08,i*.4,7,2)<.5)continue;fireWindow([x,y+TH*.5,f-6],[0,0,1],qFacing([0,0,1]),rr(2,3.2),TH*.55);}}
acReclaim(G,{up:80,side:46,r:66,stalls:12,plots:9,people:18,key:'altOffT'});}
 KOFF=[0,0,0];return G;}
