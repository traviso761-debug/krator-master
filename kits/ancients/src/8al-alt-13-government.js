// ================================================================= GOVERNMENT ALT — "the Citadel"
// A seat of government built as a fortress: a blind square keep 112 m tall,
// split down its face by a deep slot and finished with an open frame of beams
// for a crown, rising between two half-round bastions whose walls are ribbed
// with fins and pierced by a ring of arches near the top. A broad flight
// climbs the whole front of the base block to the portal at the keep's foot;
// lower towers step away behind. After arco1 #34 (the citadel of a slotted
// central tower between round bastions) and arco1 #89 (the brutalism sampler).
// Ruin: the keep broke at 76 m and its head fell back across the rear towers;
// the west bastion's front split open to its floors; the flight is cracked.
function buildAltGovernment(scene,gx,gz,d){reseed(9917);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,fall=d===1||d===2,CM=CONC(d),acc=[];
 REGISTER({name:'Government alt — the Citadel ('+(d===2?'reclaimed':STATE(d))+')',x:0,z:0,r:90,h:132});
 const BY=22,KW=24,KH=112,KH1=fall?76:KH;
 // the base block and the flight
 altBox(acc,0,BY/2,-6,104,BY,54);
 for(let k=0;k<22;k++){const z=21+(22-k)*1.4;if(fall&&k>8&&k<13&&altH(k,1,1)<.7){altBox(acc,-14,k*.5,z,22,k+1,1.4,0,.1);continue;}altBox(acc,0,(k+1)/2,z-.7,48-k*.6,k+1,1.4);}
 // the keep, with its slot; above the cut a ruin keeps only a jagged lip
 for(const sx of[-1,1])altBox(acc,sx*(KW/4+1),BY+(KH1-BY)/2,-6,KW/2-2,KH1-BY,KW);
 altBox(acc,0,BY+(KH1-BY)/2,-12,4,KH1-BY,KW-12);                        // the back of the slot
 kput('boxD',[0,BY+(KH1-BY)/2,1],null,[3.6,KH1-BY-6,.5],null);
 for(let y=BY+6;y<KH1-4;y+=6)kput(d>0?'cellD':'cell',[0,y,1.4],null,[2.4,3.4,1],d>0?null:(y%12<6?WARM:CYAN));
 kput('archOpen',[0,BY+5,6.3],qFacing([0,0,1]),[.7,.9,1],null);
 if(!fall){altBox(acc,0,KH+.6,-6,KW+2,1.2,KW+2);
  // the crown: an open cage of beams
  const c=KW/2,top=KH+22;for(const[x,z]of[[-c,-c],[c,-c],[c,c],[-c,c]]){beam(dd?'boxCR':'boxC',[x,KH,z-6],[x*.7,top,z*.7-6],2,2);}
  for(const y of[KH+8,KH+16,top])for(const[a,b]of[[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]],[[-1,1],[-1,-1]]]){const k=lerp(1,.7,(y-KH)/22)*c;
   beam(dd?'boxCR':'boxC',[a[0]*k,y,a[1]*k-6],[b[0]*k,y,b[1]*k-6],1.2,1.2);}
  kput('postW',[0,top+8,-6],null,[.4,16,.4],null);kput('finial',[0,top+16.5,-6],null,[1.4,2.4,1.4],null);}
 else{for(let k=0;k<8;k++)kput(BOXC(d),[rr(-KW/2,KW/2),KH1+rr(0,6),-6+rr(-KW/2,KW/2)],qEuler(rr(-.5,.5),rr(0,3),rr(-.5,.5)),[rr(3,6),rr(3,9),rr(3,6)],null);
  // the head, fallen back (north) across the rear towers
  const F=new THREE.Group();F.position.set(6,0,-92);F.rotation.order='YXZ';F.rotation.set(-Math.PI/2+.2,.15,0);G.add(F);
  const fa=[];altBox(fa,0,0,0,KW,KH-KH1,KW);meshMerged(fa,CM,F);dropFragment(F,0,3);altHeap(4,-70,22,70,3);}
 // the two bastions: half-drums facing south, finned, a ring of arches near the top
 const BR=22,BH=BY+42;      // from the plain, standing proud of the base block
 for(const sx of[-1,1]){const cx=sx*44,cz=4,split=fall&&sx<0;
  const hole=split?(u,y)=>Math.abs(u-.25)<.07+.1*fbm(y*.1,u*4,3,2)&&y>6:null;
  const g=lathe({rFn:()=>BR,H:BH,nu:40,nv:14,hole});const pa=g.attributes.position;
  for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i);if(z<0)pa.setZ(i,0);} // a half-drum: the north half flattened onto its chord
  g.computeVertexNormals();g.translate(cx,0,cz);acc.push(g);
  altBox(acc,cx,BH/2,cz-1,2*BR,BH,2);                              // its flat back
  altRev(acc,cx,cz,BR+1,BH,0,BH+.5,0,Math.PI,24);              // the roof
  for(let k=0;k<13;k++){const a=(k+.5)/13*Math.PI,c=Math.cos(a),s=Math.sin(a);if(split&&Math.abs(a-Math.PI/2)<.5)continue;
   altBox(acc,cx+c*(BR+1),BH*.45,cz+s*(BR+1),1.2,BH*.9,2.4,-a);
   if(k%2===0)kput('archOpen',[cx+c*(BR+.3),BH-8,cz+s*(BR+.3)],qFacing([c,0,s]),[.32,.42,1],null);}
  if(split){civRooms({cx,cy:0,cz,rFn:()=>BR-.5,y0:4,y1:BH-2,step:8,d,seed:9917,rIn:.5,gap:a=>Math.abs(a-Math.PI/2)>.5});altHeap(cx,cz+BR+8,12,40,2.2);}}
 // the lower towers stepping away behind
 for(const[x,z,w,h]of[[-30,-50,18,52],[28,-54,16,64],[0,-74,22,40]])altBox(acc,x,h/2,z,w,h,w);
 altMerge(acc,CM,G);
 REGISTER({name:'Government alt — the keep',x:0,z:-6,r:18,h:140,y:BY});
 REGISTER({name:'Government alt — the bastions',x:0,z:4,r:70,h:BH});
 apron(G,0,-10,70,92,d,.5);
 if(dd){mossOnRing(0,BY,-6,40,40,2);vinesOnRing(0,BY+40,-6,KW*.75,16,22);rubbleRing(0,0,-6,58,80,40,1.8);altTrees(18,95,160,80,90);}
 else altTrees(10,100,160,80,90);
 figures(0,52,8,14);
 if(d===2){reseed(9942);
  for(const sx of[-1,1])for(let k=0;k<13;k+=2){const a=(k+.5)/13*Math.PI,c=Math.cos(a),s=Math.sin(a);if(fbm(k,sx,7,2)<.4)continue;
   fireWindow([sx*44+c*(BR+.5),BH-8,4+s*(BR+.5)],[c,0,s],qFacing([c,0,s]),2.4,3.4);}
  altReclaim(G,{up:70,side:30,r:80,stalls:14,plots:12,people:22,key:'altGov'});}
 KOFF=[0,0,0];return G;}
