// ================================================================= MID-RISE — "the Arcades" (a host: stepped arched bays, planted terraces, a barrel vault)
// A warm sandstone slab, twelve storeys, whose front is a stack of four levels of giant semicircular-arched bays.
// Each level steps back 5 m from the one below, leaving a planted terrace in front of its arches; behind each arch
// a 3.5 m loggia and a glazed wall. The fourth level is narrower and roofed by a full barrel vault, its front a tall
// glazed arch. Narrow arched windows run up both sides in a regular rhythm; a long stair climbs the east flank to the
// third level. HOST: the terraces are ready landings (no rail in front of an arch: planters stand only before the
// piers) and the arches ready way-ins; pods also root on the plain back wall and the west side (bearings 90, 270,
// 180 and either side). The stair's flank (east) takes none. Plates every 4.5 m from 6 m; a terrace is a plate.
const HAC={Y0:1.5,P:4.5,LH:13.5,X:25.5,X3:18,ZB:-20,ZF:[21,16,11,6],LOG:3.5,VR:18,SEED:141,PX:34,PZB:-27,PZF:30,BAY:17,SPAN:12,SPRING:6.5};
HAC.H=HAC.Y0+4*HAC.LH+HAC.VR;HAC.VY=HAC.Y0+4*HAC.LH;            // 73.5 to the vault's crown; the vault springs at 55.5
function hacLevel(yb){return clamp(Math.floor((yb-HAC.Y0)/HAC.LH),0,3);}
// the plan at builder height yb: a rectangle from the back wall to the level's arcade (inner: to its glazed wall);
// over the vault, the vault's section at that height
function hacPlan(yb,inner){const k=hacLevel(yb);let X=k<3?HAC.X:HAC.X3;if(yb>HAC.VY)X=Math.sqrt(Math.max(.25,HAC.VR*HAC.VR-(yb-HAC.VY)*(yb-HAC.VY)));
 const zf=HAC.ZF[k]-(inner&&k<3?HAC.LOG:0);return[[X,HAC.ZB],[X,zf],[-X,zf],[-X,HAC.ZB]];}
const HAC_MAT={sand:new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xe6c897,roughness:1,metalness:0,side:DS}),
 sandR:new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xa38a68,roughness:1,metalness:0,side:DS})};
const HAC_S=d=>d>0?HAC_MAT.sandR:HAC_MAT.sand;
// ONE LEVEL'S ARCADE: three bays of 17 m, each a 12 m semicircular-headed opening springing at 6.5 m, in a 1.2 m
// wall whose front face is at z=0 (instanced: three levels share it)
function hacArcadeGeo(){const X=HAC.X,s=new THREE.Shape();s.moveTo(-X,0);
 for(let b=0;b<3;b++){const cx=(b-1)*HAC.BAY,r=HAC.SPAN/2;s.lineTo(cx-r,0);s.lineTo(cx-r,HAC.SPRING);s.absarc(cx,HAC.SPRING,r,Math.PI,0,true);s.lineTo(cx+r,0);}
 s.lineTo(X,0);s.lineTo(X,HAC.LH);s.lineTo(-X,HAC.LH);s.lineTo(-X,0);
 const g=new THREE.ExtrudeGeometry(s,{depth:1.2,bevelEnabled:false,curveSegments:14});g.translate(0,0,-1.2);return g;}
kdef('hacArcade',hacArcadeGeo(),HAC_MAT.sand);kdef('hacArcadeR',hacArcadeGeo(),HAC_MAT.sandR);
// rAt toward the front is the arcade's face (a pier); through an arch the wall is the loggia's glass, 3.5 m in.
const HOSTSPEC_ARCADES={name:'the Arcades',key:'midArcades',builder:'buildHostArcades',H:HAC.H,Y0:HAC.Y0,podium:45,cap:46,shaped:true,square:true,
 floors:{y0:HAC.Y0+HAC.P,pitch:HAC.P,top:.3,first:.3},k0:0,plate:k=>HAC.Y0+HAC.P*(k+1)+.3,
 rAt:(yl,th)=>{if(yl<HAC.Y0)return 45;const P=hacPlan(Math.min(yl,HAC.H-.5));return th==null?anhMeanR(P):anhRayR(P,th);},
 cuts:{tall:[42,55],mid:[28,42],low:[15,28],land:[15,42]},crownY:55,sink:'seabed',minY:9,
 avoid:(yl,h)=>anhCross([15,28.5,42],yl,h,.8)||yl+h+1>HAC.VY,      // a pod stays within one level: the front steps back at each
 bearings:(st,n)=>anhFaces([Math.PI/2,3*Math.PI/2,Math.PI],st,n,.55,.04),
 terraces:HAC.ZF.slice(1).map((z,k)=>({y:HAC.Y0+HAC.LH*(k+1)+.3,z0:z,z1:HAC.ZF[k],x:k<2?HAC.X:HAC.X3}))};   // the landings, builder frame

function buildHostArcades(scene,gx,gz,d){reseed(12020+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const SM=skyShardMark(),Y0=HAC.Y0,PS=HAC.P,LH=HAC.LH,B=new Map(),S=HAC_S(dd);
 REGISTER({name:'The Arcades — stepped arched terraces ('+(d===2?'collapsed':STATE(d))+')',x:0,z:0,r:44,h:HAC.H+2});
 const yc=(typeof ysCutY==='function'?ysCutY(d):null),host=yc!=null;
 const cut=d===2?Y0+PS*5:yc!=null?yc:(d===1?Y0+PS*11:null),L=cut!=null?cut:HAC.H;   // builder y (the body is drawn in the builder's frame)
 let hole=holeFn(dd*(d===2?1.3:1),HAC.SEED,cut!=null?L+25:null,1.3);   // the cut's erosion over its top 20 m, not 45: a low buildingif(d===1&&!host)hole=skyScarHole(hole,.75,.12,L*.45,L,HAC.SEED);
 if(typeof ysWallHole==='function')hole=ysWallHole(hole,0);         // YS: a way-in pod's hole through the skin and the lining
 // THE PODIUM: a 1.5 m terrace with steps at the front; a Ys podium shrinks it toward the building, never inside it
 const PRs=(typeof ysPodiumR==='function'?ysPodiumR(45):45),ps=clamp(PRs/45,.82,1),shrunk=PRs<45;
 {const pp=[[HAC.PX*ps,HAC.PZB*ps],[HAC.PX*ps,HAC.PZF*ps],[-HAC.PX*ps,HAC.PZF*ps],[-HAC.PX*ps,HAC.PZB*ps]];
  anhPut(B,S,anhBand(pp,0,Y0,1));anhPut(B,S,anhFan(pp,Y0,1));
  for(let i=0;i<3;i++)kput(BOXC(dd),[0,Y0*(2-i)/3/2,HAC.PZF*ps+.6+.6*i],null,[24-2*i,Y0*(2-i)/3+.01,1.2],null);}
 // THE LEVELS: each a prism on three sides (its front is the arcade), lined and floored when open
 const cols=anhCols(hacPlan(Y0),2.6);
 for(let k=0;k<4;k++){const ya=Y0+k*LH,yb=ya+LH;if(ya>=L)break;const plan=y=>hacPlan(clamp(y,ya+.01,yb-.01)),pin=y=>hacPlan(clamp(y,ya+.01,yb-.01),true);
  anhPut(B,S,anhPrism({plan,y0:0,yA:ya,yB:yb,top:L<yb?L:null,jag:2.5,seed:HAC.SEED,cols,dy:PS/2,hole,skip:e=>e===1}));
  if(dd)anhPut(B,MAT.guts,anhPrism({plan:pin,y0:0,yA:ya,yB:yb,top:L<yb?L:null,jag:2.5,seed:HAC.SEED,cols:anhCols(pin(ya),4.2),dy:PS,hole,k:.86}));
  if(L>=yb-.01){const P=plan(ya);anhPut(B,S,anhFan(P,yb+.3,1));anhPut(B,S,anhBand(P,yb,yb+.3,1));}   // the roof: the next level's terrace
  const zf=HAC.ZF[k];
  if(k<3){// the arcade, or its pier stubs under a cut
   if(L>=yb-.01)kput(dd?'hacArcadeR':'hacArcade',[0,ya,zf],null,1,null);
   else for(const [x0,x1] of [[-HAC.X,-HAC.X+2.5],[-11,-6],[6,11],[HAC.X-2.5,HAC.X]]){const h=Math.max(.6,(L-ya)*(.55+.45*h3(x0,ya,3)));kput(BOXC(dd),[(x0+x1)/2,ya+h/2,zf-.6],null,[x1-x0,h,1.2],null);}
   // the loggia's glazed wall, one pane per bay (gone in a ruin: the rooms show)
   if(!dd)for(let b=0;b<3;b++){const cx=(b-1)*HAC.BAY;mesh(gridSurface((u,v)=>[cx+(u-.5)*12.4,ya+v*Math.min(12.6,L-ya),zf-HAC.LOG],1,1,{}),MAT.glass,G);}
   // the terrace in front of this level's arcade is the roof of the level below: planters only before the piers
   if(k>0){const yt=ya+.3;for(const x of [-HAC.X+1.3,-8.5,8.5,HAC.X-1.3]){if(dd&&h3(x,k,7)<.3)continue;
    kput(BOXC(dd),[x,yt+.5,HAC.ZF[k-1]-.9],null,[x===-8.5||x===8.5?5:2.4,1,1.4],null);kput('hedge',[x,yt+1.25,HAC.ZF[k-1]-.9],null,[x===-8.5||x===8.5?4.4:2,.6+h3(x,k,1)*.8,1.1],null);}}}
  // narrow arched windows up both sides, a sparser rhythm on the back
  for(let yw=ya+PS*.5;yw<Math.min(yb,L-2.4);yw+=PS){const zi=zf-(k<3?HAC.LOG:0)-1.6,X=k<3?HAC.X:HAC.X3;
   for(const s of [-1,1])for(let z=HAC.ZB+2.2;z<zi;z+=3.4){const u=(Math.atan2(z,s*X)/TAU+1)%1;if(hole&&hole(u,yw))continue;kput(dd?'winD':'winI',[s*(X+.06),yw,z],qFacing([s,0,0]),[.75,.8,.6],null);}
   for(let x=-X+4;x<X-3;x+=8.5){const u=(Math.atan2(HAC.ZB,x)/TAU+1)%1;if(hole&&hole(u,yw)||Math.round((yw-Y0)/PS)%2)continue;kput(dd?'winD':'winI',[x,yw,HAC.ZB-.06],qFacing([0,0,-1]),[.75,.8,.6],null);}}}
 // the storeys behind the open fabric
 const ys=anhStoreys(Y0,PS,0,Math.min(L,HAC.VY),dd?2:1e9);
 if(dd){const acc={pale:[],dark:[]};anhPlates(y=>hacPlan(y+.01,true),0,ys,.9,acc);anhPut(B,ANH.plate,acc.pale);anhPut(B,ANH.soffit,acc.dark);
  if(ys.length)skyRooms({rFn:y=>anhInR(hacPlan(y+.01,true))*.84,y0:ys[0],y1:Math.min(L,HAC.VY)-2,step:PS,soff:1.3,hole,d,seed:HAC.SEED});}
 // THE VAULT over the fourth level, its back closed, its front a tall glazed arch in a sandstone archivolt
 if(L>=HAC.H-.01){const VY=HAC.VY,R=HAC.VR,z0=HAC.ZB,z1=HAC.ZF[3];
  anhPut(B,S,gridSurface((u,v)=>{const a=u*Math.PI;return[R*Math.cos(a),VY+R*Math.sin(a),lerp(z0,z1,v)];},24,10,{uS:7,vS:3,hole:hole?(u,v)=>{const a=u*Math.PI,x=R*Math.cos(a);return hole((Math.atan2(lerp(z0,z1,v),x)/TAU+1)%1,VY+R*Math.sin(a));}:null}));
  const semi=[...Array(25)].map((_,i)=>{const a=i/24*Math.PI;return[R*Math.cos(a),R*Math.sin(a)];});
  {const s=new THREE.Shape();s.moveTo(R,0);for(const p of semi)s.lineTo(p[0],p[1]);anhPut(B,S,new THREE.ShapeGeometry(s).translate(0,VY,z0));}
  {const s=new THREE.Shape();s.moveTo(-R,-LH);s.lineTo(R,-LH);for(const p of semi)s.lineTo(p[0],p[1]);if(!dd)mesh(new THREE.ShapeGeometry(s).translate(0,VY,z1),MAT.glass,G);
   for(let x=-R+3.6;x<R-1;x+=3.6){const yt=VY+Math.sqrt(R*R-x*x);if(dd&&h3(x,1,9)<.35)continue;kput(dd?'mullR':'mullW',[x,(VY-LH+yt)/2,z1+.1],null,[.5,yt-(VY-LH),.5],null);}
   for(let y=VY-LH+PS;y<VY+R-1;y+=PS){const w=y<VY?R:Math.sqrt(R*R-(y-VY)*(y-VY));if(dd&&h3(y,2,9)<.35)continue;kput(dd?'mullR':'mullW',[0,y,z1+.1],qEuler(0,0,Math.PI/2),[.5,w*2,.5],null);}}
  {const s=new THREE.Shape();s.moveTo(R+1.6,0);s.absarc(0,0,R+1.6,0,Math.PI,false);s.lineTo(-R,0);s.absarc(0,0,R,Math.PI,0,true);s.lineTo(R+1.6,0);
   anhPut(B,S,new THREE.ExtrudeGeometry(s,{depth:1.5,bevelEnabled:false,curveSegments:20}).translate(0,VY,z1-.7));
   for(const sx of [-1,1])kput(BOXC(dd),[sx*(R+.8),VY-LH/2,z1+.05],null,[1.6,LH,1.5],null);}}
 // THE STAIR up the east flank: one long flight from the podium at the front to the third level at the back
 if(L>Y0+2*LH-2){const xa=HAC.X+.7,xb=HAC.X+3.7,zA=22,zB=-16.5,yA=Y0,yB=Y0+2*LH+.3,n=Math.round((yB-yA)/.3);
  for(let i=0;i<n;i++){const t=(i+.5)/n;if(dd&&h3(i,3,5)<.12)continue;kput(BOXC(dd),[(xa+xb)/2,lerp(yA,yB,t)-.15,lerp(zA,zB,t)],null,[xb-xa,.3,Math.abs(zA-zB)/n+.05],null);}
  anhPut(B,S,gridSurface((u,v)=>[lerp(xa,xb,u),lerp(yA,yB,v)-.9,lerp(zA,zB,v)],1,1,{}));                 // its soffit
  anhPut(B,S,gridSurface((u,v)=>[xb+.1,lerp(yA,yB,v)-.9+u*2.2,lerp(zA,zB,v)],1,8,{hole:dd?(u,v)=>h3(v*8|0,4,4)<.2:null}));   // its parapet
  kput(BOXC(dd),[(xa+xb)/2,yB-.15,-18.25],null,[xb-xa,.3,3.5],null);kput('archOpen',[HAC.X+.05,yB+2.3,-18.25],qFacing([1,0,0]),[.5,.5,.6],null);}
 anhFlush(B,G);
 if(dd>0&&!shrunk){scatterMoss(0,0,0,40,110,160,3.2);rubbleRing(0,0,0,30,70,d===2?160:70,d===2?4:2.5);trees(0,0,52,130,18);if(d!==2)vinesOnRing(0,Y0+LH,0,24,18,10);}
 if(d===2)rubbleRing(0,Y0,0,6,28,120,4.5);
 if(d>0)skyShards(SM,d===3?.25:.5);
 if(!shrunk)figures(0,HAC.PZF+8,5,10);KOFF=[0,0,0];return G;}
