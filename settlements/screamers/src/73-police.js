// ================================================================= POLICE STATION — "the Watch"
function buildPolice(scene,gx,gz,d){reseed(9230+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Police station — the Watch ('+STATE(d)+')',x:0,z:0,r:90,h:60});
 kput(SLABC(d),[0,.4,0],null,[80,.8,80],null);
 // main block: battered hex, two storeys, slit windows, a sally-port
 const R0=34,R1=30,HM=12;mesh(lathe({rFn:y=>R0-(R0-R1)*y/HM,H:HM,nu:6,nv:4,hole:holeFn(d*.7,1800,null,1.5)}),CONC(d),G,0,.8,0);mesh(lathe({rFn:y=>(R0-(R0-R1)*y/HM)*.9,H:HM,nu:6,nv:1}),MAT.dark,G,0,.8,0);
 kput(SLABC(d),[0,.8+HM,0],null,[R1*.98,.8,R1*.98],null);
 for(let f=0;f<6;f++){const fa=f/6*TAU+Math.PI/6;const n=[Math.cos(fa),0,Math.sin(fa)];const tg=[-n[2],0,n[0]];for(let k=-2;k<=2;k++)for(const yy of [4.5,9.5]){const r=hexR(R0-(R0-R1)*(yy-.8)/HM,fa)+.2;kput(d>0?'winSmD':'winSmI',[n[0]*r+tg[0]*k*7,yy,n[2]*r+tg[2]*k*7],qFacing(n),[1.2,2.6,1],null);}
  for(let k=-2;k<=2;k++){const r=hexR(R0,fa)+1;beam(BOXC(d),[n[0]*r+tg[0]*k*8,.8,n[2]*r+tg[2]*k*8],[n[0]*(r-4.5)+tg[0]*k*8,.8+HM+2,n[2]*(r-4.5)+tg[2]*k*8],1.6,1.4);}}
 kput('archOpen',[0,4,hexR(R0,Math.PI/2)-.5],qFacing([0,0,1]),[1,1,3],null);kput(BOXC(d),[0,7,hexR(R0,Math.PI/2)+6],null,[16,1,12],null);
 // watch tower: lattice hyperboloid with cupola and light
 const TH=44,tcut=d>0?TH*.6:null;const tx=-22,tz=-18;const rFn=y=>4*Math.sqrt(1+2.5*Math.pow((y-TH*.6)/(TH*.6),2));
 for(let k=0;k<6;k++)for(const dir of [-1,1]){let prev=null;for(let y=0;y<=(tcut||TH);y+=3){const th=k/6*TAU+dir*y*.06;const r=rFn(y);const p=[tx+r*Math.cos(th),.8+HM+y,tz+r*Math.sin(th)];if(prev)beam(d>0?'strutR':'strutW',prev,p,.7,.7);prev=p;}}
 kput('tube',[tx,.8+HM+(tcut||TH)/2,tz],null,[1.6,(tcut||TH),1.6],null);
 if(!tcut){mesh(lathe({rFn:y=>8*Math.pow(clamp(1-Math.pow((y-4)/4,2),0,1),.5)+.01,H:8,nu:32,nv:8}),CONC(d),G,tx,.8+HM+TH-2,tz);kput('slab',[tx,.8+HM+TH+1.5,tz],null,[7,.6,7],new THREE.Color(0x1a1d22));stripRing(tx,.8+HM+TH+2,tz,6.5,d,16);kput('finial',[tx,.8+HM+TH+8,tz],null,[1.2,2,1.2],null);}
 // vehicle bays wing + perimeter wall with gate
 kput(BOXC(d),[42,5,-10],null,[30,10,50],null);kput('boxD',[42,5,-10],null,[28,9,48],null);for(let k=0;k<3;k++)kput('archOpen',[57.2,3.4,-26+k*16],qFacing([1,0,0]),[.9,.75,1.5],null);
 for(let k=0;k<3;k++){const lit=d>0?rng()<.2:true;kput('strip',[57.4,9.2,-26+k*16],qEuler(0,0,0),[10,1,1],lit?CYAN:DEAD);}
 for(let k=0;k<4;k++){const a=k*Math.PI/2;for(let j=-1;j<=1;j+=2){if(k===0&&j===1)continue;kput(BOXC(d),[Math.cos(a)*44+ (-Math.sin(a))*j*22,2.5,Math.sin(a)*44+Math.cos(a)*j*22],qEuler(0,-a,0),[1.2,5,44],null);}}
 kput(BOXC(d),[46,6,44],null,[3,12,3],null);kput(BOXC(d),[-46,6,44],null,[3,12,3],null);kput('boxD',[0,3,44],null,[1,6,1],null);
 for(let k=0;k<6;k++){const x=-30+k*12;kput(BOXC(d),[x,.8,60],null,[5,.5,10],null);}
 if(d>0){mossOnRing(0,.8+HM+.5,0,26,20,2);rubbleRing(0,.8,0,36,60,40,2);vinesOnRing(0,.8+HM,0,R1,12,10);}
 figures(0,50,4,6);KOFF=[0,0,0];return G;}

