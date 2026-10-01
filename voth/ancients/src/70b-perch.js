// ================================================================= THE PERCH — non-ground placement, worked
// An example of the gy/noPlinth/hcut parameters the skyscraper builders gained.
// A masonry podium 90 m tall with Skyscraper E standing on top of it and no
// ground plinth of its own, and a half-height ruined Skyscraper F on a lower
// shoulder. The point is that a builder written to stand on the ground can be
// stood anywhere, because kput adds all three components of KOFF and bodyGroup
// routes its instanced pieces through the group transform.
function buildPerch(scene,gx,gz,d){reseed(9460+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const PH=90,SH2=42,R0=150;
 REGISTER({name:'The Perch — podium ('+STATE(d)+')',x:0,z:0,r:R0+30,h:PH});
 const M=[];
 // the podium: a battered drum with a chamfered cap
 M.push(lathe({rFn:y=>R0*(1-.12*clamp(y/PH,0,1)),H:PH,flutes:24,amp:.05,sharp:2,nu:56,nv:10,
  hole:holeFn(d*.55,9461,null,1.2)}));
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=lerp(R0*.88,0,v);
  return[r*Math.cos(th),PH,r*Math.sin(th)];},56,4,{uS:30,vS:12}),CONC(dd),G);
 // a lower shoulder off one side, for the second tower
 const SA=2.2,SX=Math.cos(SA)*(R0*.82),SZ=Math.sin(SA)*(R0*.82);
 M.push(lathe({rFn:()=>62,H:SH2,nu:28,nv:5}).translate(SX,0,SZ));
 mesh(gridSurface((u,v)=>{const th=u*TAU,r=lerp(62,0,v);
  return[SX+r*Math.cos(th),SH2,SZ+r*Math.sin(th)];},28,3,{uS:20,vS:8}),CONC(dd),G);
 meshMerged(M,CONC(dd),G);
 // the ramp up, so the podium is reachable
 for(let j=0;j<26;j++){const t=j/25,a=SA+1.1+t*2.5,r=R0*1.06;
  kput(SLABC(d),[Math.cos(a)*r,t*PH,Math.sin(a)*r],qEuler(0,-a,0),[26,3,14],null);}
 for(let k=0;k<30;k++){const a=k/30*TAU;
  kput(d>0?'colR':'colW',[Math.cos(a)*R0*.93,PH+5,Math.sin(a)*R0*.93],null,[3,10,3],null);}
 stripRing(0,PH+11,0,R0*.93,d,30);
 apron(G,0,0,R0*1.1,R0*1.7,d,4);
 // THE POINT: two kit towers, neither of them on the ground.
 buildSkyE(scene,gx,gz,d,PH,true);
 buildSkyF(scene,gx+SX,gz+SZ,Math.max(1,d),SH2,true,.5);
 figures(0,R0*1.3,10,60);
 KOFF=[0,0,0];return G;}
