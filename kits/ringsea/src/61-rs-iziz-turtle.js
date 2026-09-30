// ---------------------------------------------------------------- vessel: Iziz Turtle Ship
// The Iziz harbour guard: a broad, flat-bottomed galley roofed over stem to stern with a shell of
// hexagonal plate cut from the white composite of the Ancient towers the settlers reclaimed, studded
// with spikes. An ochre beast-head at the bow breathes a sulphur smoke screen; twelve ports a side
// under the shell's eave, ten great sweeps a side below them, two lowering masts carrying cream
// battened lugs with the three ochre peaks of Iziz. (Ref: geobukseon.)
function rsIzizBatten(g,W,H,P){rsCloth(g,W,H,'#e6dcc4',7,'h');g.save();rsPolyPath(g,P);g.clip();g.fillStyle='rgba(120,70,30,.18)';for(let i=0;i<6;i++)g.fillRect(0,H*i/6,W,H/14);
 g.strokeStyle='#7a5a30';g.lineWidth=W*.03;rsPolyPath(g,P);g.stroke();const [cx,cy]=rsCentroid(P);g.fillStyle='#2a8a8a';g.fillRect(0,cy+W*.12,W,W*.05);
 g.fillStyle='#c88a3a';for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(cx+i*W*.16-W*.09,cy+W*.1);g.lineTo(cx+i*W*.16,cy-W*.1+Math.abs(i)*W*.04);g.lineTo(cx+i*W*.16+W*.09,cy+W*.1);g.closePath();g.fill();}g.restore();}
function buildRsIzizTurtle(){reseed(71100);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const TIM=0x8a6038,TEAL=0x2a8a8a,OCHRE=0xc88a3a,IRON=0xe4e0d4;
 const H=rsHull({L:34,B:10,fb:2.4,dr:1.5,sheerF:.9,sheerA:1.6,sp:2.2,pb:1.9,pa:2.4,q:.55,n:4,flare:.16,rakeF:1.4,rakeA:.4,transom:.52,keelEnd:.5,kp:4});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.9?TEAL:h>.82?OCHRE:h<.35?0x2c2a24:TIM);rsFoam(B,H,1.1);
 const dY=rsDeck(B,H,{bw:.3,col:0x8a7254});rsWale(B,H,.83,.13,'wood',0x3a2a1c);rsWale(B,H,.55,.1,'wood',0x3a2a1c);rsSpine(B,H,.25,0x3a2a1c);
 // the shell: an iron hex-plated vault from stern to bow, its eave just outboard of the sheer
 const x0=H.xAt(.06,1),x1=H.xAt(.93,1),y0=H.ys(.5)+.05,hw=H.hb(.5)+.25,rise=2.9;
 const shell=(u,v)=>{const x=lerp(x0,x1,u),e=Math.abs(u*2-1),k=Math.pow(Math.max(0,1-Math.pow(e,6)),.35),a=v*Math.PI;return[x,y0+Math.sin(a)*rise*k+(u>.5?(H.ys(lerp(.06,.93,u))-H.ys(.5))*.6:0),Math.cos(a)*hw*Math.max(.3,k)];};
 rsPut(B,'hex',rsGrid(shell,30,16,(u,v,p)=>[p[0]/3,v*Math.PI*(hw+rise)/2/3]),null,null,null,IRON);
 // spikes along the shell, normal-out, skipping the ridge walk
 for(let i=1;i<20;i++)for(let j=1;j<14;j++){if(j===7)continue;const u=i/20,v=j/14;const p=shell(u,v),pu=shell(u+.01,v),pv=shell(u,v+.01);
  const N=new THREE.Vector3(pu[0]-p[0],pu[1]-p[1],pu[2]-p[2]).cross(new THREE.Vector3(pv[0]-p[0],pv[1]-p[1],pv[2]-p[2])).normalize();if(N.y<0)N.negate();
  rsPut(B,'metal',new THREE.ConeGeometry(.07,.5,5,1),[p[0]+N.x*.25,p[1]+N.y*.25,p[2]+N.z*.25],new THREE.Quaternion().setFromUnitVectors(_rsUp,N),null,0x3a3c40);}
 // the ridge walk and the gunports under the eave
 const ridge=[];for(let i=0;i<=20;i++)ridge.push(shell(i/20,.5));rsTube(B,'paint',ridge.map(p=>[p[0],p[1]+.1,0]),.22,0x2a8a8a,40,6);
 for(let i=0;i<12;i++){const u=lerp(.14,.86,i/11);for(const s of[-1,1]){const p=shell(u,s>0?.08:.92);rsBox(B,'paint',[.55,.45,.1],[p[0],p[1]-.05,p[2]+s*.02],[0,0,0],0x0e0c0a);
  rsLink(B,'metal',[p[0],p[1]-.05,p[2]],[p[0],p[1]-.05,p[2]+s*.7],.1,0x1c1c1e,8);}}
 // the dragon's head at the bow and its smoke; a painted demon face on the bow planks
 const pb=H.pt(1,0,1);rsTube(B,'paint',[[pb[0]-1.6,pb[1]+.3,0],[pb[0]-.5,pb[1]+.8,0],[pb[0]+.4,pb[1]+1.5,0]],.55,0xb8782c,12,10);
 rsDragonHead(B,[pb[0]+.8,pb[1]+1.8,0],1.25,0xc88a3a,0xf0e8d0,.3);
 if(!RSMAT.smoke)rsDefMat('smoke',new THREE.MeshStandardMaterial({color:0xc8c49a,transparent:true,opacity:.35,depthWrite:false,roughness:1}));
 for(let i=0;i<6;i++)rsSphere(B,'smoke',.5+i*.28,[pb[0]+3+i*1.3,pb[1]+1.6+i*.55,rr(-.3,.3)],[1.3,1,1],0xd0cca0,10,8);
 for(const s of[-1,1]){rsDecal(B,H,.95,s,.6,.8,0xe8d8b0,'paint',20,.08);rsDecal(B,H,.95,s,.6,.28,0x111111,'paint',14,.12);}
 // the stern transom crest
 {const p=H.pt(0,0,.7);rsPut(B,'paint',new THREE.CircleGeometry(1.1,24),[p[0]-.08,p[1],0],[0,-Math.PI/2,0],null,TEAL);rsPut(B,'paint',new THREE.CircleGeometry(.55,20),[p[0]-.12,p[1],0],[0,-Math.PI/2,0],null,0xd8b048);}
 // sweeps and two lowering masts
 rsOars(V,H,{name:'sweeps',uA:.2,uB:.82,n:10,hF:.62,len:8.5,inb:2.6,r:.07,bladeW:.32,col:0x7a6040,sweep:.36,rate:.32});
 for(const [mx,mh] of[[4,15],[-6,13]]){const base=y0+rise;rsLink(B,'wood',[mx,y0-.5,0],[mx,base+mh,0],.24,0x6a4a30,8,.16);const w=mh*.62;
  const S=rsSail(B,{key:'iziz-batten',O:[mx,base+1.2,0],U:[.35,0,-.94],V:[0,1,0],belly:.6,scallop:6,
   A:t=>[-w*.3,t*mh*.9],Bf:t=>[w*.7+Math.sin(t*Math.PI)*w*.08,t*mh*.84+mh*.06],draw:rsIzizBatten});
  for(let k=0;k<=6;k++){const pts=[];for(let i=0;i<=8;i++)pts.push(S.at(k/6,i/8));rsTube(B,'wood',pts,.05,0x4a3a26,16,5);}
  rsRope(B,[mx,base+mh,0],[H.xAt(.98,1),H.ys(.98)+.5,0]);rsRope(B,[mx,base+mh,0],[H.xAt(.02,1),H.ys(.02)+.5,0]);
  rsPennant(B,[mx,base+mh+.2,0],3.2,.8,[0x2a8a8a,0xc88a3a]);}
 for(const x of[-15.5,-14.6])rsFigure(B,[x,dY(.03)+.1,rr(-1,1)],0,[0xe8dcc0,0x2a8a8a][x<-15?0:1]);
 {const p=H.pt(0,0,.3);rsBox(B,'wood',[.3,3.4,2.2],[p[0]-.6,p[1]-.8,0],null,0x3a2a1c);}
 rsBake(B,V.group,'izizTurtle');V.deckY=y0+rise;return V;}
RS_VESSEL({key:'izizTurtle',name:'Iziz Turtle Ship',culture:'iziz-vernacular',L:40,B:28,H:21,
 tags:{type:['warship','turtle ship'],propulsion:['oars','sail'],hull:'monohull',wealth:'state',crew:130,role:'harbour guard and armoured breaker'},
 blurb:'A spiked shell of reclaimed Ancient hex plate over the whole deck, a smoke-breathing beast head, great sweeps.',build:buildRsIzizTurtle});
