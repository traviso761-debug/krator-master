// ================================================================= RADAR TOWER — "the Listener"
function buildRadarTower(scene,gx,gz,d){reseed(9980+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Radar tower — the Listener ('+STATE(d)+')',x:0,z:0,r:40,h:100});
 const H=80;const cut=d>0?H*.78:null;const rFn=y=>7*Math.sqrt(1+3*Math.pow((y-H*.6)/(H*.6),2));
 const lat=(u,y)=>{const a=u*TAU*8,b=y*.35;return Math.abs(Math.sin(a+b))>.3&&Math.abs(Math.sin(a-b))>.3;};
 const top=cut||H;for(let k=0;k<8;k++)for(const dir of [-1,1]){let prev=null;for(let y=0;y<=top;y+=4){const th=k/8*TAU+dir*y*.045;const r=rFn(y);const p=[r*Math.cos(th),2+y,r*Math.sin(th)];if(prev&&!(d>0&&fbm(k+dir,y*.05,1000,2)<.2))beam(d>0?'strutR':'strutW',prev,p,.9,.9);prev=p;}}
 mesh(lathe({rFn:()=>2.2,H:cut||H,nu:12,nv:2}),MAT.darkSurf,G,0,2,0);
 for(let yy=10;yy<(cut||H)-4;yy+=14)kput(d>0?'ringR':'ringW',[0,2+yy,yy===10?0:0],qEuler(Math.PI/2,0,0),[rFn(yy),rFn(yy),3],null);
 kput('slab',[0,1,0],null,[16,2,16],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 // ground contact: a graded skirt off the 2 m pad instead of a hard edge
 apron(G,0,0,15.6,24,d,2);
 for(let k=0;k<3;k++){const th=k/3*TAU;beam(d>0?'strutR':'strutW',[Math.cos(th)*30,0,Math.sin(th)*30],[Math.cos(th)*rFn(20)*.9,22,Math.sin(th)*rFn(20)*.9],2.2,1.8);}
 if(!cut){kput('slab',[0,H+2,0],null,[12,1.2,12],new THREE.Color(0xd8d4cc));mesh(lathe({rFn:y=>9*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,nu:32,nv:6}),skin,G,0,H+2.6,0);
  // rotating bar antenna: two curved wings on a pedestal
  kput('tube',[0,H+9,0],null,[1.4,3,1.4],null);const ay=H+11;const yaw=rr(0,TAU);
  const wing=gridSurface((u,v)=>{const x=(u-.5)*30;return[x,ay+v*4+.15*Math.pow(x/15,2)*4,-.6*Math.pow(x/15,2)*3];},30,3,{uS:6});const wm=mesh(wing,MAT.darkSurf,G);wm.rotation.y=yaw;
  kput('boxW',[0,ay+2,0],qEuler(0,-yaw,0),[30,.4,.6],null);stripRing(0,H+1,0,10,d,16);
  // small dish on the side
  const dish=gridSurface((u,v)=>{const a=u*TAU,r=v*5;return[r*Math.cos(a),r*r*.06,r*Math.sin(a)];},24,6,{});const dm=mesh(dish,skin,G,14,H-4,0);dm.rotation.set(-.4,0,-.9);kput('tube',[12,H-8,0],qEuler(0,0,.4),[.5,8,.5],null);}
 else{for(let k=0;k<8;k++){beam('strutR',[14+rr(-4,4),1,10+rr(-4,4)],[30+rr(-6,6),3,22+rr(-6,6)],.9,.9);}rubbleRing(22,0,16,3,20,40,1.8);
  const wing=gridSurface((u,v)=>{const x=(u-.5)*30;return[x,v*4,-.6*Math.pow(x/15,2)*3];},30,3,{uS:6});const wm=mesh(wing,MAT.darkSurf,G,-10,.5,24);wm.rotation.set(Math.PI/2*.9,0,.4);dropFragment(wm,0,.2);}
 // service hut
 mesh(lathe({rFn:y=>6*Math.pow(clamp(1-Math.pow(y/6,2),0,1),.5),H:6,flutes:6,amp:.1,nu:28,nv:6,hole:holeFn(d*.6,1010,null,2.5)}),skin,G,-22,0,8);kput('archOpen',[-16.5,1.8,8],qFacing([1,0,0]),[.3,.35,1],null);
 if(d>0){scatterMoss(0,0,0,10,60,50,1.8);vinesOnRing(0,2+cut,0,rFn(cut),8,20);trees(0,0,40,80,8);}
 figures(0,30,3,4);KOFF=[0,0,0];return G;}

