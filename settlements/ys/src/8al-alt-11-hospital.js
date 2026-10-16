// ================================================================= HOSPITAL ALT — "the Linked Blocks"
// A dark glass tower of rounded plan for the clinics, and beside it the wards:
// three great concrete cubes stacked one on another, each turned a little off
// the last, held 28 m up on a cluster of tall pilotis. Two glazed bridges tie
// the cubes to the tower; a long two-storey wing with an ambulance canopy runs
// across the front; a helipad is painted on the tower roof. After arco2 #8
// (the dark tower and the stacked concrete ward blocks on stilts joined by
// sky bridges).
// Ruin: the top cube slid off and lies broken east of the pilotis; the lower
// bridge fell; the tower's skin is gone and its head is burnt out.
function buildAltHospital(scene,gx,gz,d){reseed(9915);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),acc=[];
 REGISTER({name:'Hospital alt — the Linked Blocks ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:84,h:100});
 // THE TOWER: rounded-rectangle plan, 96 m (a ruin loses its head to 84)
 const TX=-38,TZ=-8,TW=17,TD=12,RC=6,TH=96,TH1=fall?84:TH;
 const plan=[];for(let k=0;k<4;k++){const cx=(k===0||k===3?1:-1)*(TW-RC),cz=(k<2?1:-1)*(TD-RC);for(let i=0;i<=6;i++){const a=k*Math.PI/2+i/6*Math.PI/2;plan.push([TX+cx+RC*Math.cos(a),TZ+cz+RC*Math.sin(a)]);}}
 const tw=[];altPrism(tw,plan,0,TH1);
 if(d===0){meshMerged(tw,MAT.darkGlass,G);for(let y=4;y<TH;y+=4)acBox(acc,TX,y,TZ,2*TW+.3,.35,2*TD+.3);}
 else{tw.length=0;altPrism(tw,plan.map(p=>[TX+(p[0]-TX)*.7,TZ+(p[1]-TZ)*.7]),0,TH1);meshMerged(tw,MAT.dark,G);
  for(let y=4;y<TH1;y+=4){acBox(acc,TX,y,TZ,2*TW,.5,2*TD);
   for(let k=0;k<plan.length;k+=2){const p=plan[k];if(altH(k,y,1)<.35)continue;kput('mullR',[p[0],y+2,p[1]],null,[.5,4,.5],null);}}
  // the burnt head: a ragged top of slabs and a few blackened columns
  for(let k=0;k<10;k++)kput('boxD',[TX+rr(-TW,TW),TH1+rr(0,5),TZ+rr(-TD,TD)],qEuler(rr(-.3,.3),0,rr(-.3,.3)),[rr(.6,1),rr(3,8),rr(.6,1)],null);}
 if(!fall){acBox(acc,TX,TH+.6,TZ,2*TW-2,1.2,2*TD-2);kput('slab',[TX,TH+1.3,TZ],null,[9,.2,9],new THREE.Color(0x2b2e33));
  for(const[x,z,w,dp]of[[-3,0,1,7],[3,0,1,7],[0,0,5,1]])kput('boxW',[TX+x,TH+1.45,TZ+z],null,[w,.1,dp],new THREE.Color(d>0?0x8a8070:0xf2efe6));
  stripRing(TX,TH+1.5,TZ,9.4,d,24);}
 // THE WARDS: pilotis and three stacked cubes
 const WX=34,WZ=-6,PY=28;
 for(const[x,z]of[[-6,-6],[6,-6],[-6,6],[6,6],[0,-10],[0,10]])acBox(acc,WX+x,PY/2,WZ+z,2.6,PY,2.6);
 acBox(acc,WX,PY/2,WZ,6,PY,6);                                         // the lift core
 const cubes=[[30,20,30,0],[26,22,26,.18],[30,18,30,-.1]];let y=PY;
 cubes.forEach(([w,h,dp,ry],ci)=>{const off=ci===1?[3,0,-2]:[0,0,0];
  if(fall&&ci===2){// slid off: lying tilted on the plain to the east
   const F=new THREE.Group();F.position.set(WX+44,0,WZ+10);F.rotation.set(.12,ry+.5,.32);G.add(F);
   const fa=[];acBox(fa,0,0,0,w,h,dp);meshMerged(fa,CM,F);
   useGroupXF(F);for(const s of[-1,1])for(let f=0;f<4;f++)kput('boxD',[0,-h/2+2.5+f*4.2,s*(dp/2+.05)],null,[w*.84,1.6,1],null);endGroupXF();
   dropFragment(F,0,2.5);altHeap(WX+30,WZ+6,18,60,2.4);return;}
  const g=acBox(acc,WX+off[0],y+h/2,WZ+off[2],w,h,dp,ry);
  // deep ribbon windows on all four faces
  for(let f=0;f<Math.floor(h/4.2);f++){const yy=y+2.5+f*4.2;for(let k=0;k<4;k++){const a=ry+k*Math.PI/2,n=[Math.sin(a),0,Math.cos(a)],L=(k%2?w:dp)*.84,o=(k%2?dp:w)/2;
   const dpth=k%2?w/2:dp/2;const px=WX+off[0]+n[0]*(k%2?w/2:dp/2),pz=WZ+off[2]+n[2]*(k%2?w/2:dp/2);
   altBand(px,yy,pz,(k%2?dp:w)*.84,1.6,n,d,f%2===0);}}
  y+=h;});
 // the bridges: tower to wards at 40 m and 64 m
 for(const[by,ok]of[[40,!fall],[64,true]]){const x0=TX+TW,x1=WX-13;
  if(!ok){acBox(acc,(x0+x1)/2,1,WZ-6,x1-x0,2,6,0,0,.08);altHeap((x0+x1)/2,WZ-6,8,24,1.4);continue;}
  acBox(acc,(x0+x1)/2,by,WZ-6,x1-x0,1,7);acBox(acc,(x0+x1)/2,by+5,WZ-6,x1-x0,.8,7);
  if(d===0){kput('pane',[(x0+x1)/2,by+2.6,WZ-2.5],null,[x1-x0,4,1],null);kput('pane',[(x0+x1)/2,by+2.6,WZ-9.5],null,[x1-x0,4,1],null);}
  for(let x=x0;x<=x1;x+=4)for(const z of[-2.5,-9.5])kput(dd?'mullR':'mullW',[x,by+2.6,WZ+z],null,[.5,4.4,.5],null);}
 // the front wing and its ambulance canopy
 acBox(acc,-6,5,38,128,10,22);altBand(-6,3,49.1,120,2.4,[0,0,1],d,true);altBand(-6,7.4,49.1,120,2.4,[0,0,1],d,true);
 acBox(acc,30,6.5,56,30,1,14);for(const x of[17,43])acBox(acc,x,3,62,1,6,1);
 if(d===0)kput('boxW',[30,7.2,62.8],null,[10,1.2,.3],new THREE.Color(0xd23a2a));
 altMerge(acc,CM,G);
 REGISTER({name:'Hospital alt — the clinic tower',x:TX,z:TZ,r:20,h:TH+4});
 REGISTER({name:'Hospital alt — the ward blocks',x:WX,z:WZ,r:22,h:68,y:PY});
 apron(G,0,10,70,90,d,.4);
 if(dd){mossOnRing(-6,10.2,38,20,24,1.6);vinesOnRing(WX,PY+40,WZ,15,16,14);altTrees(20,90,150,70,60);}
 else altTrees(10,95,150,70,60);
 figures(30,70,6,10);
 if(d===2){reseed(9940);
  for(let yy=PY+2.5;yy<PY+42;yy+=4.2)for(let k=0;k<5;k++){if(fbm(yy*.1,k,4,2)<.45)continue;fireWindow([WX-12+k*6,yy,WZ+15.1],[0,0,1],qFacing([0,0,1]),3,1.4);}
  for(let k=0;k<12;k++){const x=-60+k*10;if(fbm(k*.5,2,2,2)<.4)continue;fireWindow([x,3,49.3],[0,0,1],qFacing([0,0,1]),5,1.8);}
  acReclaim(G,{up:60,side:30,r:80,stalls:12,plots:12,people:18,key:'altHosp'});}
 KOFF=[0,0,0];return G;}
