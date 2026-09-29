// ================================================================= REPUBLICAN — the Fallen Arcology quarter (round 9)
// Travis: "Include a small district built into a toppled and partly-broken arcology" (after a painting of a pyramid split
// in two, its halves leaning apart, a town packed into the cleft). Two leaning half-pyramids of Ancient stone faced in a
// labyrinth relief, a great broken slab fallen against the back, rubble and drifted earth at their feet; in the cleft a
// crowd of narrow frame towers; terraces cut into the triangular faces with huts on them and stairs zig-zagging up;
// a row of small houses and a stall at the cleft's mouth. The ruin is Ancient; everything on it is Republican.
TEX.hMaze=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#c4bba8';g.fillRect(0,0,w,h);const N=8,C=w/N;
 // a depth-first maze on an 8x8 grid (fixed seed: the same relief everywhere, as on the Ancients' own faces)
 let s=90217;const R=()=>(s=(s*16807)%2147483647)/2147483647;const seen=new Set(),st=[[0,0]];seen.add('0,0');const cut=[];
 while(st.length){const [cx,cy]=st[st.length-1];const nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[(cx+dx+N)%N,(cy+dy+N)%N]).filter(([x,y])=>!seen.has(x+','+y));
  if(!nb.length){st.pop();continue;}const nx=nb[Math.floor(R()*nb.length)];seen.add(nx[0]+','+nx[1]);cut.push([cx,cy,nx[0],nx[1]]);st.push(nx);}
 g.lineCap='square';for(const [lw,col,o] of[[C*.46,'#6e665a',0],[C*.3,'#8a8274',1.5]]){g.strokeStyle=col;g.lineWidth=lw;
  for(const [a,b,c,d] of cut){if(Math.abs(a-c)>1||Math.abs(b-d)>1)continue;g.beginPath();g.moveTo((a+.5)*C+o,(b+.5)*C+o);g.lineTo((c+.5)*C+o,(d+.5)*C+o);g.stroke();}}
 g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=2;for(let k=0;k<=N;k++){g.beginPath();g.moveTo(0,k*C);g.lineTo(w,k*C);g.stroke();}});
MAT.hMaze=hStd({map:TEX.hMaze,roughness:.95});vWorldUV(MAT.hMaze,.09);
kdef('hMazeW',VGABLE,MAT.hMaze);kdef('hMazeB',VBOX,MAT.hMaze);
function buildHlRepArcoQuarter(G,o){reseed(22201+(o.v|0));
 const st=hC(vPick([0xd0c6b2,0xc4baa4,0xd8ceb8])),sand=hC(0xb89a70),ash=hC(vPick(HPAL.ashlar)),log=hC(vPick(HPAL.aged)),corr=hC(vPick(HSV.corr)),sh=hC(vPick(HPAL.shingle)),lit=vLit()?'lit':'glass';
 vnReg('The Fallen Arcology',0,-6,40,32);vnReg('Arcology quarter',0,4,16,18);
 // the two halves (ridge running back into the scene, the triangular faces to the front), leaning apart; the fallen slab
 const A={x:-24,z:-6,L:48,H:32,B:40,lean:-.2,sink:1.5},B={x:24,z:-4,L:42,H:27,B:36,lean:.26,sink:3};
 for(const P of[A,B])kput('hMazeW',[P.x,-P.sink,P.z],qEuler(0,Math.PI/2,0).multiply(qEuler(P.lean,0,0)),[P.L,P.H,P.B],st);
 kput('hMazeB',[36,9,-26],qEuler(0,.35,0).multiply(qEuler(0,0,.62)),[50,4.5,26],st);
 for(let k=0;k<26;k++){const x=rr(-44,44),z=rr(12,22)*(rng()<.8?1:-1.4);kput('vRock',[x,rr(.3,1.4),z],qEuler(rng(),rng(),0),[rr(.8,3),rr(.6,2),rr(.8,2.6)],st);}
 for(const [x,z,r] of[[-38,18,7],[34,16,6],[0,-30,9],[-14,20,4]])kput('hRCHeap',[x,-.05,z],qEuler(0,rng()*TAU,0),[r,r*.3,r*1.2],sand);
 // the cleft: a crowd of narrow frame towers, 2-4 storeys, jettied, under steep little gables
 const cx0=0;for(let i=0;i<7;i++){const x=cx0+rr(-2.4,2.4)+(i%2?1.2:-1.2),z=-24+i*6.4,n=hri(2,4),w=rr(3,4);let y=0;
  if(i===0){vB('vStone',x,0,z-2,5,2.4,.4,0,ash);}
  for(let k=0;k<n;k++){const ww=w+(k?.5:0);hnFachBox(x,y,z,ww,2.6,ww,0,null,null,lit);if(k<n-1)hnJetty(x,y+2.6+.1,z,ww+.5,ww+.5,0,hC(vPick(HPAL.redwood)),.25);y+=2.7;}
  hnGable(x,y,z,w+.6,w+.6,1.8,rng()<.5?0:Math.PI/2,rng()<.6?'vCorr':'vShingleB',rng()<.6?corr:sh,.35,'vGableW',log);
  if(i%2)hnCable([x,y-.3,z],[x+(rng()<.5?-9:9),y+2,z],hC(0x3a3028));}
 // a cave mouth into the broken half, lanterns at it
 vB('vDarkB',B.x-B.B*.36,0,B.z+B.L/2-.2,5,6,.4,0);for(let k=0;k<4;k++)hnLantern(B.x-B.B*.36-2+k*1.3,5.8,B.z+B.L/2+.4);
 // terraces cut into the faces: a platform on beams, a hut, a carved balustrade; stairs zig-zagging between them
 const terr=(P,u,y)=>{const fz=P.z+P.L/2+1.8,x=P.x+u;vB('boxCR',x,y-.35,fz,7,.35,3.6,0,ash);for(const s of[-1,1])beam('vWood',[x+s*3,y-.35,fz+1.6],[x+s*3,y-3.2,P.z+P.L/2],.22,.22,log);
  hnFachBox(x-1,y,fz-.4,3.6,2.4,2.8,0,null,null,lit);hnGable(x-1,y+2.4,fz-.4,3.6,2.8,1.6,0,'vShingleB',sh,.3,'vGableW',log);kput('hRailC',[x+1,y+.45,fz+1.78],null,[4.8,.7,1],log);return[x,y,fz];};
 const t1=terr(A,-2,7),t2=terr(A,-8,14),t3=terr(A,4,20),t4=terr(B,2,8),t5=terr(B,-6,15);
 for(const [a,b] of[[[A.x-6,0],t1],[t1,t2],[t2,t3],[[B.x-2,0],t4],[t4,t5]]){const p0=Array.isArray(a)&&a.length===2?[a[0],0,A.z+A.L/2+2.6]:a;
  const dy=b[1]-p0[1],steps=Math.round(dy/.25);const mx=(p0[0]+b[0])/2,mz=Math.max(p0[2],b[2])+.9;vnStairs(mx,p0[1],mz,Math.PI/2,1,dy,steps,'vWood',log);}
 // the mouth of the cleft: small houses, a stall, a lamp
 for(const [key,x,z,ry] of[['hl_rep_house_poor_a',-11,24,0],['hl_rep_lantern_stall',11,24.5,0],['hl_rep_house_poor_b',-22,26,.1]]){if(VERN.defs[key])hnSub(key,x,0,z,ry);}
 hnStall(0,0,22,0);vnLampPost(3,0,20,3.8);vnFolk(0,20,4,4);}
HL.def({key:'hl_rep_arco_quarter',name:'The Fallen Arcology',branch:'republican',family:'Monuments',tags:{type:['multi-family dwelling','ruin'],wealth:'poor',lit:true,salvage:true,landmark:true},w:100,d:72,h:34,build:buildHlRepArcoQuarter});
