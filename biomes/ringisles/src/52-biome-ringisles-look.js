// ================================================================= RING SEA ISLES — the look: textures, materials, items
// Greyscale procedural textures (the per-instance colour tints them), the library's maps where the page carries this
// kit's pack (materials.json -> KMAT.pack('ringisles'); BIO.libSwap swaps a slot's map in place, so the random stream and
// every plant's place are the same with or without it), the buckets and the instanced items.
// PROCEDURAL STAND-INS (no library set yet; KNOWN_ISSUES.md lists each with its generation prompt): the seagrass blade, the
// beach creeper's heart leaves, naupaka's succulent leaves, the sea grape's round leaves, the breadfruit's lobed leaf, the
// taro and kava heart leaves, the coral heads' surface, the tamarisk's plume.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);RINGISLES.C=C;

// ---------------------------------------------------------------- leaf textures
reseed(520071);
const TX={},G2=BIO.tex.grey;
/* fine bipinnate sprays (thorn scrub, the scrub thorn's flat crown): the library's card.acacia stands in its place */
TX.spray=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';BIO.tex.clusters(S,7,.55);for(let i=0;i<40;i++){const p=BIO.tex.clPt(S,.1,.62),a=p[2],L=rr(30,52);
  g.strokeStyle=G2(90);g.lineWidth=1.4;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*L,p[1]+Math.sin(a)*L);g.stroke();
  for(let t=.15;t<1;t+=.12)for(const sd of[-1,1]){const x=p[0]+Math.cos(a)*L*t,y=p[1]+Math.sin(a)*L*t;BIO.tex.leaf(g,x,y,rr(5,8),rr(1.4,2.2),a+sd*1.2,rr(120,230),false);}}},[90,100,60]);
/* small trifoliate leaves on short shoots (the corkwood) */
TX.trifol=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,8,.55);for(let i=0;i<150;i++){const p=BIO.tex.clPt(S,.09,.6);for(let k=-1;k<=1;k++)BIO.tex.leaf(g,p[0],p[1],rr(9,15),rr(3,5),p[2]+k*.7,rr(120,235),true);}},[80,100,60]);
/* feathery scale-leaf sprays (the salt cedar): fine drooping threads */
TX.feather=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<90;i++){const x=rr(.1,.9)*S,y=rr(.05,.6)*S,L=S*rr(.2,.4),a=Math.PI/2+rr(-.5,.5);g.strokeStyle=G2(rr(130,235));g.lineWidth=rr(1.2,2.4);
  g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+Math.cos(a)*L*.4+rr(-8,8),y+Math.sin(a)*L*.5,x+Math.cos(a)*L,y+Math.sin(a)*L);g.stroke();}},[100,110,100]);
/* a plume of tiny flowers (the salt cedar's, the cane's tassel) */
TX.plume=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<260;i++){const t=rng(),y=S*(1-t*.95),w=S*.22*Math.sin(Math.PI*Math.min(1,t*1.1));g.fillStyle=G2(rr(170,250));g.beginPath();g.arc(S/2+rr(-w,w),y,rr(1.4,2.6),0,TAU);g.fill();}},[200,200,200]);
/* a strap leaf along the frond strip, base at v=0 (the strand pandanus; the library's card.strap.pandan stands in) */
TX.strap=BIO.alphaTex(256,(g,S)=>{for(let k=0;k<3;k++){const x=S*(.5+(k-1)*.27),w=S*.11,lum=rr(150,215);
  g.fillStyle=G2(lum);g.beginPath();g.moveTo(x-w,0);for(let y=0;y<=S;y+=S/24){const t=y/S,ww=w*(1-.75*t*t)*(1+.08*((y/(S/24))%2));g.lineTo(x-ww,y);}
  for(let y=S;y>=0;y-=S/24){const t=y/S,ww=w*(1-.75*t*t);g.lineTo(x+ww,y);}g.closePath();g.fill();g.strokeStyle=G2(lum*.7);g.lineWidth=2;g.beginPath();g.moveTo(x,0);g.lineTo(x,S*.96);g.stroke();}},[90,110,70]);
/* round leathery leaves with red-brown veins (the sea grape): STAND-IN */
TX.round=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,7,.55);for(let i=0;i<34;i++){const p=BIO.tex.clPt(S,.1,.6),r=rr(14,24),l=rr(140,225);g.fillStyle=G2(l);g.beginPath();g.ellipse(p[0],p[1],r,r*.9,p[2],0,TAU);g.fill();
  g.strokeStyle=G2(l*.6);g.lineWidth=1.3;for(let k=0;k<5;k++){const a=p[2]+k/5*TAU;g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.cos(a)*r*.85,p[1]+Math.sin(a)*r*.8);g.stroke();}}},[70,90,50]);
/* a deeply lobed big leaf (the breadfruit): STAND-IN */
TX.lobed=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,6,.5);for(let i=0;i<12;i++){const p=BIO.tex.clPt(S,.1,.55),L=rr(40,62),a=p[2],l=rr(120,215);g.save();g.translate(p[0],p[1]);g.rotate(a);g.fillStyle=G2(l);
  g.beginPath();g.moveTo(0,0);for(let k=0;k<=8;k++){const t=k/8,w=L*.42*Math.sin(Math.PI*t)*(k%2?1:.45);g.lineTo(L*t,-w);}for(let k=8;k>=0;k--){const t=k/8,w=L*.42*Math.sin(Math.PI*t)*(k%2?1:.45);g.lineTo(L*t,w);}g.fill();
  g.strokeStyle=G2(l*.7);g.lineWidth=1.6;g.beginPath();g.moveTo(0,0);g.lineTo(L*.95,0);g.stroke();g.restore();}},[60,80,40]);
/* a paddle leaf along the frond strip, base at v=0, torn into strips (the banana; the library's card.paddle stands in) */
TX.paddle=BIO.alphaTex(256,(g,S)=>{const x=S/2,w=S*.36;g.fillStyle=G2(190);g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x-w*1.1,S*.2,x-w,S*.55);g.quadraticCurveTo(x-w*.8,S*.95,x,S);
  g.quadraticCurveTo(x+w*.8,S*.95,x+w,S*.55);g.quadraticCurveTo(x+w*1.1,S*.2,x,0);g.fill();g.globalCompositeOperation='destination-out';g.lineWidth=2;
  for(let k=0;k<10;k++){const y=rr(.25,.95)*S,sd=rng()<.5?-1:1;g.beginPath();g.moveTo(x+sd*w*1.2,y-6);g.lineTo(x+sd*w*.3,y);g.stroke();}g.globalCompositeOperation='source-over';
  g.strokeStyle=G2(130);g.lineWidth=3;g.beginPath();g.moveTo(x,0);g.lineTo(x,S);g.stroke();},[90,110,60]);
/* a heart leaf on its stalk's tip (taro, kava, the aroids), seen face-on, base at the bottom: STAND-IN */
TX.heart=BIO.alphaTex(256,(g,S)=>{const c=S/2,y0=S*.92;g.fillStyle=G2(195);g.beginPath();g.moveTo(c,y0);g.bezierCurveTo(c-S*.6,S*.62,c-S*.32,S*.02,c,S*.24);g.bezierCurveTo(c+S*.32,S*.02,c+S*.6,S*.62,c,y0);g.fill();
  g.strokeStyle=G2(140);g.lineWidth=2.5;for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(c,S*.3);g.quadraticCurveTo(c+k*S*.06,S*.5,c+k*S*.13,S*.78-Math.abs(k)*S*.07);g.stroke();}},[70,100,50]);
/* the beach creeper's two-lobed leaves on runners, from above: STAND-IN */
TX.creeper=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';g.strokeStyle=G2(110);g.lineWidth=2.5;for(let r=0;r<4;r++){const y=S*(.15+.23*r);g.beginPath();g.moveTo(0,y);for(let x=0;x<=S;x+=16)g.lineTo(x,y+Math.sin(x*.05+r)*8);g.stroke();
  for(let x=10;x<S;x+=rr(18,30)){const yy=y+Math.sin(x*.05+r)*8,l=rr(140,230),s=rr(9,15),a=rr(-.6,.6)+(rng()<.5?-1.2:1.2);g.fillStyle=G2(l);g.save();g.translate(x,yy);g.rotate(a);
   g.beginPath();g.ellipse(-s*.45,0,s*.55,s*.7,0,0,TAU);g.ellipse(s*.45,0,s*.55,s*.7,0,0,TAU);g.fill();g.restore();}}},[70,110,50]);
/* naupaka: fleshy spoon leaves crowded at the shoot tips: STAND-IN */
TX.spoon=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,8,.55);for(let i=0;i<46;i++){const p=BIO.tex.clPt(S,.09,.62);for(let k=0;k<7;k++){const a=k/7*TAU+rr(-.2,.2);BIO.tex.leaf(g,p[0],p[1],rr(18,28),rr(6,9),a,rr(140,240),true);}}},[90,130,70]);
/* seagrass: long ribbon blades from the base, swaying: STAND-IN */
TX.seagrass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<34;i++){const x=S/2+rr(-.3,.3)*S,L=S*rr(.55,.98),b=rr(-.25,.25);g.strokeStyle=G2(rr(120,225));g.lineWidth=rr(3.5,6);
  g.beginPath();g.moveTo(x,S);g.bezierCurveTo(x+b*S*.2,S-L*.35,x-b*S*.3,S-L*.7,x+b*S*.5,S-L);g.stroke();}},[60,90,50]);
/* beach grass: stiff rolled blades, a few seed heads */
TX.beachgrass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<60;i++){const x=S/2+rr(-.25,.25)*S,a=-Math.PI/2+rr(-.6,.6),L=S*rr(.4,.95);g.strokeStyle=G2(rr(130,230));g.lineWidth=rr(1.6,2.8);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.4,S+Math.sin(a)*L*.6,x+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[110,110,80]);
/* grass (the savanna, the steppe): blades from the base; the library's card.grass.dry stands in */
TX.grass=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<80;i++){const x=S/2+rr(-.2,.2)*S,a=-Math.PI/2+rr(-.45,.45),L=S*rr(.5,.98);g.strokeStyle=G2(rr(120,235));g.lineWidth=rr(1.8,3.2);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.5,S+Math.sin(a)*L*.5,x+Math.cos(a)*L+rr(-12,12),S+Math.sin(a)*L);g.stroke();
  if(i%5===0){g.fillStyle=G2(220);g.beginPath();g.ellipse(x+Math.cos(a)*L,S+Math.sin(a)*L,2.5,9,a+Math.PI/2,0,TAU);g.fill();}}},[100,100,70]);
/* burnt stubble: short black stalks */
TX.stubble=BIO.alphaTex(128,(g,S)=>{g.lineCap='round';for(let i=0;i<50;i++){const x=S/2+rr(-.35,.35)*S,L=S*rr(.15,.5);g.strokeStyle=G2(rr(60,170));g.lineWidth=rr(1.5,2.5);g.beginPath();g.moveTo(x,S);g.lineTo(x+rr(-6,6),S-L);g.stroke();}},[40,40,40]);
/* a round mat (ash, salt, glasswort from above) */
TX.mat=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let i=0;i<140;i++){const a=rr(0,TAU),d=Math.sqrt(rng())*S*.46;g.fillStyle=G2(rr(150,250));g.beginPath();g.arc(c+Math.cos(a)*d,c+Math.sin(a)*d,rr(3,8),0,TAU);g.fill();}},[150,150,150]);
/* glasswort: jointed succulent stems in a low mat (the library's card.samphire stands in) */
TX.samphire=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<55;i++){let x=S/2+rr(-.35,.35)*S,y=S;const a=-Math.PI/2+rr(-.9,.9),n=ri(4,8);g.strokeStyle=G2(rr(130,235));g.lineWidth=rr(3.5,5.5);
  for(let k=0;k<n;k++){const nx=x+Math.cos(a+rr(-.3,.3))*S*.06,ny=y+Math.sin(a)*S*.07;g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();x=nx;y=ny;}}},[110,120,70]);
/* a seaweed blade for the wrack (the library's card.seaweed stands in) */
TX.wrack=BIO.alphaTex(256,(g,S)=>{for(let i=0;i<26;i++){const x=rr(.1,.9)*S,y=rr(.1,.9)*S,L=rr(30,70),a=rr(0,TAU);BIO.tex.leaf(g,x,y,L,rr(4,9),a,rr(90,200),false);}},[60,50,30]);
/* coral branches standing (the library's card.reef stands in) */
TX.branch=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';const br=(x,y,a,L,w,d)=>{const nx=x+Math.cos(a)*L,ny=y+Math.sin(a)*L;g.strokeStyle=G2(rr(170,240));g.lineWidth=w;g.beginPath();g.moveTo(x,y);g.lineTo(nx,ny);g.stroke();
  if(d>0){br(nx,ny,a-rr(.25,.55),L*.75,w*.75,d-1);br(nx,ny,a+rr(.25,.55),L*.75,w*.75,d-1);}};for(let k=0;k<3;k++)br(S*(.3+.2*k),S,-Math.PI/2+rr(-.3,.3),S*.22,9,4);},[200,190,180]);
/* an anemone: tentacles from a disc */
TX.anemone=BIO.alphaTex(128,(g,S)=>{g.lineCap='round';const c=S/2;for(let k=0;k<60;k++){const a=-Math.PI*rr(.05,.95),L=S*rr(.25,.45);g.strokeStyle=G2(rr(170,250));g.lineWidth=rr(2,3.5);g.beginPath();g.moveTo(c+rr(-8,8),S);g.quadraticCurveTo(c+Math.cos(a)*L*.4,S+Math.sin(a)*L*.6,c+Math.cos(a)*L,S+Math.sin(a)*L);g.stroke();}},[150,150,150]);
/* fern frond (the library's card.fern.green stands in) */
TX.fern=BIO.alphaTex(256,(g,S)=>{const a=-Math.PI/2,L=S*.94,x0=S/2,y0=S;for(let t=0;t<1;t+=.045){const x=x0+Math.cos(a)*L*t,y=y0+Math.sin(a)*L*t,pl=S*.15*Math.sin(Math.PI*Math.min(1,t*1.1+.08));
  for(const sd of[-1,1])BIO.tex.leaf(g,x,y,pl,pl*.24,a+sd*1.25,rr(140,220),false);}},[60,90,40]);
/* a hanging liana: a stem with leaves down a strip (the library's card.vine.hanging stands in) */
TX.liana=BIO.alphaTex(128,(g,S)=>{g.strokeStyle=G2(110);g.lineWidth=3;g.beginPath();g.moveTo(S/2,0);g.lineTo(S/2,S);g.stroke();for(let y=6;y<S;y+=10){const sd=(y/10)%2?1:-1;BIO.tex.leaf(g,S/2,y,rr(14,24),rr(5,8),Math.PI/2+sd*1.0,rr(130,220),true);}},[70,90,50]);
/* a bromeliad rosette from the side (the library's card.bromeliad stands in) */
TX.epiphyte=BIO.alphaTex(128,(g,S)=>{for(let k=0;k<14;k++){const a=-Math.PI*(.1+.8*k/13);BIO.tex.leaf(g,S/2,S*.95,S*rr(.35,.5),S*.07,a,rr(140,230),true);}},[100,80,60]);
/* rice seedlings and cane: strap blades from the base (the library's card.crop stands in for the cane) */
TX.blades=BIO.alphaTex(256,(g,S)=>{g.lineCap='round';for(let i=0;i<46;i++){const x=S/2+rr(-.12,.12)*S,a=-Math.PI/2+rr(-.7,.7),L=S*rr(.45,.95);g.strokeStyle=G2(rr(130,235));g.lineWidth=rr(3,5);
  g.beginPath();g.moveTo(x,S);g.quadraticCurveTo(x+Math.cos(a)*L*.3,S+Math.sin(a)*L*.7,x+Math.cos(a)*L*1.1,S+Math.sin(a)*L*.85);g.stroke();}},[90,110,60]);
/* blooms: a trumpet (the morning glory, seen into), a half flower (naupaka) */
TX.glory=BIO.alphaTex(128,(g,S)=>{const c=S/2;g.fillStyle=G2(230);g.beginPath();for(let k=0;k<=5;k++){const a=k/5*TAU;g.lineTo(c+Math.cos(a)*S*.46,c+Math.sin(a)*S*.46);g.quadraticCurveTo(c+Math.cos(a+.63)*S*.36,c+Math.sin(a+.63)*S*.36,c+Math.cos(a+1.257)*S*.46,c+Math.sin(a+1.257)*S*.46);}g.fill();
  g.fillStyle=G2(110);g.beginPath();g.arc(c,c,S*.12,0,TAU);g.fill();},[200,200,200]);
TX.half=BIO.alphaTex(128,(g,S)=>{const c=S/2;for(let k=0;k<5;k++){const a=Math.PI*(.05+.9*k/4);BIO.tex.leaf(g,c,c,S*.44,S*.13,-a,rr(215,250),false);}},[220,220,220]);
/* glossy lance leaves in pairs along short shoots (the mango, coffee and clove: their crops' leaves): STAND-IN */
TX.glossy=BIO.alphaTex(256,(g,S)=>{BIO.tex.clusters(S,8,.55);for(let i=0;i<60;i++){const p=BIO.tex.clPt(S,.1,.6),L=rr(26,40);
  for(let k=0;k<4;k++){const a=p[2]+rr(-.5,.5)+(k%2?.6:-.6);BIO.tex.leaf(g,p[0]+Math.cos(p[2])*k*7,p[1]+Math.sin(p[2])*k*7,L,L*.22,a,rr(120,240),true);}}},[50,80,40]);
RINGISLES.TX=TX;

// ---------------------------------------------------------------- bark textures (grey, mean ~.6)
const barkTex=(fn,w,h)=>BIO.canvasTex(w||256,h||256,(g,W,H)=>{const id=g.createImageData(W,H),d=id.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,v=clamp(fn(x,y,W,H),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);});
RINGISLES.BARKTEX=[
 /* 0 the thorns: dark, fissured lengthwise */ barkTex((x,y)=>140+50*(fbm(x*.2,y*.015,81,3)-.5)-30*Math.pow(fbm(x*.06,y*.01,82,2),3)+10*(h3(x,y,83)-.5)),
 /* 1 the corkwood: smooth green-grey, peeling in papery flakes */ barkTex((x,y)=>{const f=fbm(x*.04,y*.03,84,3);return 160+30*(f-.5)+40*smooth(.55,.6,fbm(x*.09,y*.05,85,2))+8*(h3(x,y,86)-.5);}),
 /* 2 the salt cedar: rough, red-brown, ridged */ barkTex((x,y)=>145+45*(fbm(x*.14,y*.03,87,3)-.5)+10*(h3(x,y,88)-.5)),
 /* 3 the pandan: rings (leaf scars) */ barkTex((x,y,W,H)=>150-30*Math.pow(Math.abs(Math.sin(y/H*TAU*7+fbm(x*.05,y*.02,89,2)*1.5)),8)+18*(fbm(x*.04,y*.12,90,2)-.5)+20),
 /* 4 the sea grape and the breadfruit: smooth, mottled */ barkTex((x,y)=>160+30*(fbm(x*.03,y*.03,91,3)-.5)+20*(fbm(x*.15,y*.15,92,2)-.5)),
 /* 5 the banana's pseudostem: sheathed, streaked lengthwise */ barkTex((x,y)=>165+35*(fbm(x*.25,y*.01,93,2)-.5)+15*Math.sin(x*.12)+8*(h3(x,y,94)-.5))];
RINGISLES.WOODTEX=barkTex((x,y)=>165+30*(fbm(x*.12,y*.008,95,3)-.5)+10*(h3(x,y,96)-.5));
RINGISLES.ROCKTEX=barkTex((x,y)=>{const v=fbm(x*.05,y*.05,97,3),p=smooth(.62,.7,fbm(x*.12,y*.12,98,2));return 150+60*(v-.5)-50*p+12*(h3(x,y,99)-.5);});
/* the coral heads: a brain coral's meanders (grooves winding over the dome): STAND-IN */
RINGISLES.CORALTEX=barkTex((x,y)=>{const m=Math.sin(x*.21+3*fbm(x*.03,y*.03,100,2)*2.2)*Math.sin(y*.21+3*fbm(x*.03+5,y*.03,101,2)*2.2);return 150+70*Math.sign(m)*Math.pow(Math.abs(m),.35)+10*(h3(x,y,102)-.5);});

// ---------------------------------------------------------------- local geometries
const G={};
/* a tuft: three crossed vertical quads, base at y=0, top at y=1 */
G.tuft=function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,.3,ca);});}return BIO.geo._make(pos,nor,uv);};
/* a pad: a flat disc in xz, face up */
G.pad=function(){const pos=[],uv=[],nor=[],N=10;for(let k=0;k<N;k++){const a0=k/N*TAU,a1=(k+1)/N*TAU;
  [[0,0],[Math.cos(a1),Math.sin(a1)],[Math.cos(a0),Math.sin(a0)]].forEach(q=>{pos.push(q[0]*.5,0,q[1]*.5);uv.push(.5+q[0]*.5,.5+q[1]*.5);nor.push(0,1,0);});}return BIO.geo._make(pos,nor,uv);};
/* a quad standing up, its base at the origin (a leaf on its stalk, face +z) */
G.card=function(){const pos=[],uv=[],nor=[],P=[[-.5,0],[.5,0],[.5,1],[-.5,1]];[0,1,2,0,2,3].forEach(i=>{const q=P[i];pos.push(q[0],q[1],0);uv.push(q[0]+.5,1-q[1]);nor.push(0,0,1);});return BIO.geo._make(pos,nor,uv);};
/* a frond: arching along +x from the origin, the texture's top at the tip */
G.frond=function(){const pos=[],uv=[],nor=[],n=4,P=[];for(let i=0;i<=n;i++){const t=i/n,w=.5*(.35+.65*Math.sin(Math.min(1,t*1.15+.08)*Math.PI)),y=.42*Math.sin(t*2.0)-.3*t*t;P.push([t,y,-w,t],[t,y,w,t]);}
  for(let i=0;i<n;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];[[a,0],[b,1],[c,0],[b,1],[d,1],[c,0]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],1-q[0][3]);nor.push(0,1,0);});}
  return BIO.geo._make(pos,nor,uv);};
/* a cone (a termite mound, a flower spike), base at y=0 */
G.cone=function(){const T=T3;return new T.ConeGeometry(.5,1,9,3).translate(0,.5,0);};
/* a termite mound: a lumpy spire with buttresses */
G.mound=function(){const g=new T3.CylinderGeometry(.08,.5,1,10,6).translate(0,.5,0),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),k=1+.22*Math.sin(a*3+y*4)+.12*Math.sin(a*7)+(y<.3?.25*Math.max(0,Math.cos(a*3)):0);p.setXYZ(i,x*k,y,z*k);}g.computeVertexNormals();return g;};
/* a brain coral: a squat dome; a table coral: a plate on a stalk */
G.brain=function(){const g=new T3.SphereGeometry(1,14,8,0,TAU,0,Math.PI*.55),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=1+.05*Math.sin(x*9+z*7)*Math.sin(z*8-y*6);p.setXYZ(i,x*k,y*.72*k,z*k);}g.computeVertexNormals();return g;};
G.table=function(){const a=new T3.CylinderGeometry(1,.82,.12,14,1).translate(0,.92,0).toNonIndexed(),b=new T3.CylinderGeometry(.08,.14,.9,6,1).translate(0,.45,0).toNonIndexed();
  const pos=[...a.attributes.position.array,...b.attributes.position.array],nor=[...a.attributes.normal.array,...b.attributes.normal.array],uv=[...a.attributes.uv.array,...b.attributes.uv.array];return BIO.geo._make(pos,nor,uv);};
/* an urchin: a spiked ball */
G.urchin=function(){const g=new T3.IcosahedronGeometry(1,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const k=(i%3===0)?2.2:1;p.setXYZ(i,p.getX(i)*k,p.getY(i)*k*.7,p.getZ(i)*k);}g.computeVertexNormals();return g;};
/* a salt-crust plate: a thin hexagonal slab, its edges curled up a little */
G.crust=function(){const g=new T3.CylinderGeometry(1,1,.12,6,1),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r=Math.hypot(x,z);p.setY(i,p.getY(i)+.18*r*r);}g.computeVertexNormals();return g;};
/* a flat square in xz, face up (the paddies' water) */
G.sq=function(){const pos=[],uv=[],nor=[],P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]];[0,2,1,0,3,2].forEach(i=>{const q=P[i];pos.push(q[0],0,q[1]);uv.push(q[0]+.5,q[1]+.5);nor.push(0,1,0);});return BIO.geo._make(pos,nor,uv);};
/* a box (the paddies' bunds), base at y=0 */
G.box=function(){return new T3.BoxGeometry(1,1,1).translate(0,.5,0);};
RINGISLES.G=G;

// ---------------------------------------------------------------- materials
RINGISLES.MAT={
 bark:RINGISLES.BARKTEX.map(t=>BIO.barkMat(t)),wood:BIO.barkMat(RINGISLES.WOODTEX),
 thornspray:BIO.leafMat(TX.spray,'thornspray',{aN:true,swayW:'1.0',swayA:.06}),
 trifol:BIO.leafMat(TX.trifol,'trifol',{aN:true,swayW:'1.0',swayA:.07}),
 tamfoliage:BIO.leafMat(TX.feather,'tamfoliage',{aN:true,swayW:'1.0',swayA:.1}),
 plume:BIO.leafMat(TX.plume,'plume',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 strap:BIO.leafMat(TX.strap,'strap',{aN:true,swayW:'(position.x)',swayA:.07}),
 grapeleaf:BIO.leafMat(TX.round,'grapeleaf',{aN:true,swayW:'1.0',swayA:.05}),
 glossy:BIO.leafMat(TX.glossy,'glossy',{aN:true,swayW:'1.0',swayA:.05}),
 breadleaf:BIO.leafMat(TX.lobed,'breadleaf',{aN:true,swayW:'1.0',swayA:.05}),
 paddle:BIO.leafMat(TX.paddle,'paddle',{aN:true,swayW:'(position.x)',swayA:.08}),
 heart:BIO.leafMat(TX.heart,'heart',{swayW:'(position.y)',swayA:.07,alphaTest:.4}),
 creeper:BIO.leafMat(TX.creeper,'creeper',{swayW:'0.0',swayA:0,alphaTest:.4}),
 naupaka:BIO.leafMat(TX.spoon,'naupaka',{aN:true,swayW:'1.0',swayA:.06}),
 seagrass:BIO.leafMat(TX.seagrass,'seagrass',{swayW:'(position.y)',swayA:.16,alphaTest:.4}),
 beachgrass:BIO.leafMat(TX.beachgrass,'beachgrass',{swayW:'(position.y)',swayA:.14,alphaTest:.4}),
 grass:BIO.leafMat(TX.grass,'grass',{swayW:'(position.y)',swayA:.14,alphaTest:.4}),
 grassb:BIO.leafMat(TX.grass,'grassb',{swayW:'(position.y)',swayA:.14,alphaTest:.4}),
 bunch:BIO.leafMat(TX.grass,'bunch',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 stubble:BIO.leafMat(TX.stubble,'stubble',{swayW:'0.0',swayA:0,alphaTest:.4}),
 mat:BIO.leafMat(TX.mat,'mat',{swayW:'0.0',swayA:0,alphaTest:.35}),
 samphire:BIO.leafMat(TX.samphire,'samphire',{swayW:'(position.y)',swayA:.03,alphaTest:.4}),
 saltbush:BIO.leafMat(TX.trifol,'saltbush',{aN:true,swayW:'1.0',swayA:.04}),
 wrack:BIO.leafMat(TX.wrack,'wrack',{swayW:'0.0',swayA:0,alphaTest:.4}),
 branchcoral:BIO.leafMat(TX.branch,'branchcoral',{swayW:'0.0',swayA:0,alphaTest:.4}),
 anemone:BIO.leafMat(TX.anemone,'anemone',{swayW:'(position.y)',swayA:.05,alphaTest:.4}),
 fern:BIO.leafMat(TX.fern,'fern',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 liana:BIO.leafMat(TX.liana,'liana',{swayW:'(-position.y)',swayA:.05,alphaTest:.4}),
 epiphyte:BIO.leafMat(TX.epiphyte,'epiphyte',{swayW:'(position.y)',swayA:.03,alphaTest:.4}),
 mossclump:BIO.leafMat(TX.mat,'mossclump',{aN:true,swayW:'0.0',swayA:0,alphaTest:.3}),
 rice:BIO.leafMat(TX.blades,'rice',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 cane:BIO.leafMat(TX.blades,'cane',{swayW:'(position.y)',swayA:.08,alphaTest:.4}),
 glory:BIO.leafMat(TX.glory,'glory',{swayW:'0.0',swayA:0,alphaTest:.4}),
 half:BIO.leafMat(TX.half,'half',{swayW:'1.0',swayA:.04,alphaTest:.4}),
 solid:BIO.solidMat(null),rock:BIO.solidMat(RINGISLES.ROCKTEX),coral:BIO.solidMat(RINGISLES.CORALTEX),
 water:new T3.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.72,depthWrite:false}),
};
const M=RINGISLES.MAT;
M.water.emissive=new T3.Color(0x0a1612);
// THE LIBRARY: the slots materials.json names take the library's maps (a card cut to its cell); without the pack the
// procedural ones stay
RINGISLES.LIB=BIO.libSwap('ringisles',M);
const LIBWHITE=C(0xf4f2ec);
// a full-colour card carries its own colour: its instances take a near-white, a sixth of the procedural colour kept
RINGISLES.libCol=(slot,c)=>RINGISLES.LIB[slot]?LIBWHITE.clone().lerp(c&&c.isColor?c:C(c),.16):c;
RINGISLES.LIBMEAN={};
{const P=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('ringisles',n):null;
 ['bark0','bark1','bark2','bark3','bark4','bark5','wood','rock','coral'].forEach(k=>{const L=P(k);if(L&&L.mean>0)RINGISLES.LIBMEAN[k]=L.mean;});}
['Thorn bark (scrub thorn)','Papery bark (corkwood)','Ridged bark (salt cedar)','Ringed bark (strand pandanus)','Smooth bark (sea grape, breadfruit)','Pseudostems (banana)'].forEach((lab,i)=>
 BIO.bucket('bark'+i,M.bark[i],{label:lab,uvScale:[i===3?2:3,i===3?3:4]}));
BIO.bucket('wood',M.wood,{label:'Driftwood',uvScale:[3,5]});
BIO.bucket('far',BIO.barkMat(null),{label:'Far trees (impostors)'});

// ---------------------------------------------------------------- instanced items
BIO.def('thornspray',BIO.geo.clump(),M.thornspray,{attrs:['aN'],label:'Thorn-scrub foliage'});
BIO.def('trifol',BIO.geo.clump(),M.trifol,{attrs:['aN'],label:'Corkwood leaves'});
BIO.def('tamfoliage',BIO.geo.clump(),M.tamfoliage,{attrs:['aN'],label:'Salt-cedar foliage'});
BIO.def('plume',G.tuft(),M.plume,{label:'Flower plumes (salt cedar, cane)'});
BIO.def('strap',G.frond(),M.strap,{attrs:['aN'],label:'Strand-pandanus leaves'});
BIO.def('grapeleaf',BIO.geo.clump(),M.grapeleaf,{attrs:['aN'],label:'Sea-grape leaves'});
BIO.def('glossy',BIO.geo.clump(),M.glossy,{attrs:['aN'],label:'Glossy leaves (mango, coffee, clove)'});
BIO.def('breadleaf',BIO.geo.clump(),M.breadleaf,{attrs:['aN'],label:'Breadfruit leaves'});
BIO.def('paddle',G.frond(),M.paddle,{attrs:['aN'],label:'Banana leaves'});
BIO.def('heart',G.card(),M.heart,{label:'Heart leaves (taro, aroids)'});
BIO.def('kava',G.card(),M.heart,{label:'Kava leaves'});
BIO.def('creeper',G.pad(),M.creeper,{label:'Beach morning glory'});
BIO.def('gloryflower',G.pad(),M.glory,{label:'Morning-glory flowers'});
BIO.def('naupaka',BIO.geo.clump(),M.naupaka,{attrs:['aN'],label:'Naupaka'});
BIO.def('halfflower',BIO.geo.bloom(),M.half,{label:'Naupaka half-flowers'});
BIO.def('seagrass',G.tuft(),M.seagrass,{label:'Seagrass'});
BIO.def('beachgrass',G.tuft(),M.beachgrass,{label:'Beach grass'});
BIO.def('tallgrass',G.tuft(),M.grass,{label:'Tall savanna grass'});
BIO.def('tallgrassb',G.tuft(),M.grassb,{label:'Tall savanna grass (seeding)'});
BIO.def('bunch',G.tuft(),M.bunch,{label:'Steppe bunchgrass'});
BIO.def('stubble',G.tuft(),M.stubble,{label:'Burnt stubble'});
BIO.def('ash',BIO.geo.mat(),M.mat,{label:'Ash and char'});
BIO.def('samphire',G.tuft(),M.samphire,{label:'Glasswort and samphire'});
BIO.def('saltbush',BIO.geo.clump(),M.saltbush,{attrs:['aN'],label:'Saltbush'});
BIO.def('crust',G.crust(),M.solid,{label:'Salt-crust plates'});
BIO.def('wrack',G.pad(),M.wrack,{label:'Wrack (cast-up seaweed)'});
BIO.def('drift',BIO.geo.rod(6),M.wood,{label:'Driftwood'});
BIO.def('brain',G.brain(),M.coral,{label:'Brain coral heads'});
BIO.def('branchcoral',G.tuft(),M.branchcoral,{label:'Branching coral'});
BIO.def('tablecoral',G.table(),M.coral,{label:'Table coral'});
BIO.def('rubble',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Coral rubble'});
BIO.def('anemone',G.tuft(),M.anemone,{label:'Anemones'});
BIO.def('urchin',G.urchin(),M.solid,{label:'Sea urchins'});
BIO.def('limpet',G.cone(),M.solid,{label:'Limpets'});
BIO.def('fern',G.frond(),M.fern,{label:'Rainforest ferns'});
BIO.def('gingerleaf',G.frond(),M.paddle,{attrs:['aN'],label:'Ginger leaves'});
BIO.def('gingerbloom',G.cone(),M.solid,{label:'Red ginger bracts'});
BIO.def('aroid',G.card(),M.heart,{label:'Elephant ears'});
BIO.def('liana',BIO.geo.ribbon(5,.7,.15),M.liana,{label:'Lianas'});
BIO.def('epiphyte',G.tuft(),M.epiphyte,{label:'Bromeliads'});
BIO.def('mossclump',BIO.geo.clump(),M.mossclump,{attrs:['aN'],label:'Moss on boughs'});
BIO.def('mound',G.mound(),M.solid,{label:'Termite mounds'});
BIO.def('stone',new T3.IcosahedronGeometry(1,0),M.rock,{label:'Stones'});
BIO.def('lobe',BIO.geo.lobe(),M.solid,{label:'Shrub masses'});
BIO.def('rod',BIO.geo.rod(5),M.solid,{label:'Stems'});
BIO.def('fruit',new T3.IcosahedronGeometry(1,1),M.solid,{label:'Fruit (pandan keys, breadfruit, bananas, grapes)'});
// the gardens
BIO.def('rice',G.tuft(),M.rice,{label:'Rice'});
BIO.def('cane',G.tuft(),M.cane,{label:'Sugar cane'});
BIO.def('bund',G.box(),M.solid,{label:'Paddy bunds and garden beds'});
BIO.def('paddywater',G.sq(),M.water,{label:'Paddy water'});
})();
