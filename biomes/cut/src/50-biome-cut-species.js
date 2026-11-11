// ================================================================= THE CUT — the natives (data + kit items)
// [draw] The kit's own five plants (PLAN.md section 4), their records, harvest and tags, and their items. The read-in kits
// (nwlowlands, nhighlands) keep their own species; the warp (46) acts on them where they stand.
//   hyperbamboo   nwlowlands' sky bamboo in the dense air: culms 60-80 m, 0.6-1.0 m across, in groves of 50-200; every
//                 internode in a grove the same length, so the nodes line up across it; old culms bitten open to their chambers
//   ringreed      the reed rings at the lakes' edge: bands of reeds parallel to the water, each band one height
//   rankgrass     the salt grass: blue-grey tussocks seeding in straight lines along the field, the flats ruled from the rim
//   measuremelon  a melon vine whose fruit ripens in exactly three sizes; a share stuck unripe at the smallest
//   circlelichen  crustose lichens in perfect circles on the bare cut faces, nesting and overlapping, never touching
// The sheets (card.bamboo.giant, card.reed, card.rankgrass, card.crop.melon) are 3x3: each card geometry takes one cell in
// its own uv (no pack `cell`), the sheet unflipped as the library loads cards (v runs down the sheet).
BIO.kit('cut');
(function(){const T3=BIO.host.THREE,C=h=>new T3.Color(h),TAU=Math.PI*2;
CUT.TAGS={climate:'hypertropic..cold',aridity:'arid..humid',abyssal:true,riparian:'both'};
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
CUT.SPECIES=[
 {key:'hyperbamboo',name:'Hyperbamboo',habit:'grove',H:[60,80],rb:[.3,.5],tags:{climate:'hypertropic',aridity:'humid',abyssal:true,riparian:'both',form:'giant bamboo'},
  model:'Dendrocalamus giganteus, after nwlowlands\' sky bamboo, in 2 atm'},
 {key:'ringreed',name:'Ring reeds',habit:'reed',H:[2.4,4.2],rb:[.6,1.2],tags:{climate:'hypertropic..cold',aridity:'humid',abyssal:true,riparian:'yes',form:'reed'},model:'Phragmites, Typha'},
 {key:'rankgrass',name:'Rankgrass',habit:'tussock',H:[.5,1.1],rb:[.4,.8],tags:{climate:'hypertropic..subtropic',aridity:'arid..semiarid',abyssal:true,riparian:'no',form:'salt grass'},model:'Distichlis, Puccinellia'},
 {key:'measuremelon',name:'Measure melon',habit:'vine',H:[.4,.7],rb:[1.2,2],tags:{climate:'subtropic..temperate',aridity:'semiarid..subhumid',abyssal:false,riparian:'no',form:'vine'},model:'Cucumis melo'},
 {key:'circlelichen',name:'Circle lichen',habit:'crust',H:[.005,.01],rb:[.05,.9],tags:{climate:'temperate..cold',aridity:'arid..humid',abyssal:false,riparian:'no',form:'crustose lichen'},model:'Rhizocarpon, Xanthoria'}];
CUT.HARVEST={
 hyperbamboo:HV('culms (scaffolds, water pipes, the pass road\'s bridges)',['shoots','bamboo rice (once in decades, when a grove flowers together and dies)'],false,'The leaves are fodder. A grove flowers all at once and dies: the valley\'s bamboo rice.'),
 ringreed:HV('thatch, matting',['rhizomes (flour)'],false,''),
 rankgrass:HV('salt-tolerant thatch',[],false,'Grazing on the flats.'),
 measuremelon:HV('none',['melons (three sizes)'],false,'Dilihan\'s measures: a market measure is so many melons. The stuck ones stay hard and small. No catalog piece yet (KNOWN_ISSUES.md).'),
 circlelichen:HV('none',[],true,'Scraped and steeped as an antiseptic wash (as Usnea).')};
CUT.SPECIES.forEach(S=>{S.tags.harvest=CUT.HARVEST[S.key];});
CUT.byKey={};CUT.SPECIES.forEach(S=>{CUT.byKey[S.key]=S;});
CUT.FRUIT_KEYS=[];

// ---------------------------------------------------------------- the geometries
const G=CUT.G={};
const make=(pos,nor,uv,col)=>BIO.geo._make(pos,nor,uv,col);
// a card standing on the bottom of its cell: planes crossed at 180/n, bottom at y 0, top at y 1, x -.5..5
G.stand=function(cell,n){const pos=[],uv=[],nor=[],c=cell%3,r=Math.floor(cell/3),u0=c/3,u1=(c+1)/3,vt=r/3+.004,vb=(r+1)/3-.004;n=n==null?3:n;
 for(let k=0;k<n;k++){const a=k/n*Math.PI,ca=Math.cos(a),sa=Math.sin(a),nx=-sa,nz=ca;
  const P=[[-.5*ca,0,-.5*sa,u0,vb],[.5*ca,0,.5*sa,u1,vb],[.5*ca,1,.5*sa,u1,vt],[-.5*ca,1,-.5*sa,u0,vt]];
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(nx,.35,nz);});}
 return make(pos,nor,uv);};
// a spray hanging from its branch: two planes crossed, the top of the cell at y 0, hanging to y -1, out along +x by .35
G.hang=function(cell){const pos=[],uv=[],nor=[],c=cell%3,r=Math.floor(cell/3),u0=c/3,u1=(c+1)/3,vt=r/3+.004,vb=(r+1)/3-.004;
 for(const a of [0,Math.PI/2]){const ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5*ca+.35,0,-.5*sa,u0,vt],[.5*ca+.35,0,.5*sa,u1,vt],[.5*ca+.55,-1,.5*sa,u1,vb],[-.5*ca+.55,-1,-.5*sa,u0,vb]];
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(0,.6,0);});}
 return make(pos,nor,uv);};
// THE CULM: n internodes of equal length (unit height 1, radius .5), a slight swell at each node and the white waxy ring
// under it (vertex colour); u runs half the bark sheet round the culm, v one tile per two internodes.
// cut: a length cut from a culm (both ends square, no tip). bite: {y, r} in internodes and culm radii: a sphere bitten out of the side at +x, the inner wall and the septa (the
// chambers) drawn where it opened
G.culm=function(n,seg,bite,fs,cut){seg=seg||10;fs=fs||[0,.02,.08,.86];const pos=[],nor=[],uv=[],col=[],ring=[],R0=.5;
 const rad=f=>{const d=Math.min(f,1-f);return R0*(1+.05*Math.exp(-d*d/.0016));};   /* f: the place within the internode, 0 at a node */
 const fine=fs.length>=4,shade=f=>f<.005?(fine?.42:.85):f<.03?1.32:1;   /* the node: a dark ring, the white waxy band just above it, the colour returning up the internode */
 /* fs: the rows in each internode (near: the node, its swell's end, the band's start; mid: two; far: one); a bitten culm adds rows near its bite */
 const rows=[];for(let i=0;i<n;i++)for(const f of fs)rows.push((i+f)/n);rows.push(1);
 const inBite=(x,y,z)=>{if(!bite)return false;const by=bite.y/n,dx=(x-R0)/(bite.r*R0),dy=(y-by)*n/(bite.r*R0*2.2),dz=z/(bite.r*R0);return dx*dx+dy*dy+dz*dz<1;};
 /* the tip: the last internodes taper to a point a fifth the culm's width */
 for(const y of rows){const f=(y*n)%1,tp=cut?1:1-.8*Math.pow(Math.max(0,(y-.8)/.2),1.6),r=(y>=1?R0:rad(f))*tp,k=y>=1?1:shade(f),R=[];
  for(let s=0;s<=seg;s++){const a=s/seg*TAU;R.push({p:[Math.cos(a)*r,y,Math.sin(a)*r],n:[Math.cos(a),0,Math.sin(a)],u:s/seg*.5,v:y*n*.5,c:k});}ring.push(R);}
 const pv=(q,flip)=>{pos.push(...q.p);nor.push(flip?-q.n[0]:q.n[0],flip?-q.n[1]:q.n[1],flip?-q.n[2]:q.n[2]);uv.push(q.u,q.v);col.push(q.c,q.c,q.c);};
 for(let i=0;i<ring.length-1;i++)for(let s=0;s<seg;s++){const a=ring[i][s],b=ring[i][s+1],c=ring[i+1][s],d=ring[i+1][s+1];
  const m=[(a.p[0]+d.p[0])/2,(a.p[1]+d.p[1])/2,(a.p[2]+d.p[2])/2];if(inBite(m[0],m[1],m[2]))continue;pv(a);pv(c);pv(d);pv(a);pv(d);pv(b);}
 if(bite){/* the inner wall where the bite opened it, and the septa: the chambers */
  const ri=R0*.82,by=bite.y/n,h=bite.r*R0*2.2/n*1.15,y0=Math.max(0,by-h),y1=Math.min(1,by+h);
  const iq=(y,a)=>({p:[Math.cos(a)*ri,y,Math.sin(a)*ri],n:[Math.cos(a),0,Math.sin(a)],u:a/TAU*.5,v:y*n*.5,c:.55});
  const NY=8;for(let j=0;j<NY;j++)for(let s=0;s<seg;s++){const ya=y0+(y1-y0)*j/NY,yb=y0+(y1-y0)*(j+1)/NY,a0=s/seg*TAU,a1=(s+1)/seg*TAU;
   const A=iq(ya,a0),B=iq(ya,a1),Cq=iq(yb,a0),Dq=iq(yb,a1);pv(A,1);pv(Dq,1);pv(Cq,1);pv(A,1);pv(B,1);pv(Dq,1);}
  for(let i=Math.ceil(y0*n);i<=Math.floor(y1*n);i++){const y=i/n+.002;for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,cc={p:[0,y,0],n:[0,1,0],u:.25,v:y*n*.5,c:.8};
   const A={p:[Math.cos(a0)*ri,y,Math.sin(a0)*ri],n:[0,1,0],u:.25,v:y*n*.5,c:.8},B={p:[Math.cos(a1)*ri,y,Math.sin(a1)*ri],n:[0,1,0],u:.25,v:y*n*.5,c:.8};pv(cc);pv(B);pv(A);}}}
 return make(pos,nor,uv,col);};
// a bamboo shoot: a narrow cone of sheaths
G.shoot=function(){const g=new T3.ConeGeometry(.5,1,7,2,false);g.translate(0,.5,0);return g;};
// a lichen thallus: a flat disc (on a face, local +z its normal), its rim a darker prothallus ring (vertex colour)
G.disc=function(seg){seg=seg||18;const pos=[],nor=[],uv=[],col=[];for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU;
  for(const [r0,r1,c0,c1] of [[0,.86,1,.95],[.86,1,.95,.45]]){const p=(r,a)=>[Math.cos(a)*r,Math.sin(a)*r,.004*(1-r)];
   const A=p(r0,a0),B=p(r0,a1),Cq=p(r1,a0),Dq=p(r1,a1);[[A,c0],[Cq,c1],[Dq,c1],[A,c0],[Dq,c1],[B,c0]].forEach(q=>{pos.push(...q[0]);nor.push(0,0,1);uv.push(q[0][0]*.5+.5,q[0][1]*.5+.5);col.push(q[1],q[1],q[1]);});}}
 return make(pos,nor,uv,col);};
// a melon: a squat sphere
G.melon=function(){const g=new T3.SphereGeometry(.5,7,5);g.scale(1,.86,1);g.translate(0,.43,0);return g;};

// ---------------------------------------------------------------- textures and materials
// The no-pack stand-ins (the page without the library's textures, as in the open world): plain shapes in each cell of a
// 3x3 sheet, so the geometry's cells still read; the library's sheets replace them (materials.json, BIO.libSwap)
const sheet=(fill,draw)=>BIO.alphaTex(384,(g,S)=>{for(let r=0;r<3;r++)for(let c=0;c<3;c++){g.save();g.translate(c*S/3,r*S/3);draw(g,S/3,fill);g.restore();}},[96,110,80]);
const TX=CUT.TX={
 hleaf:sheet('#5a7a3c',(g,s,f)=>{g.strokeStyle='#4a5a34';g.lineWidth=2;g.beginPath();g.moveTo(s*.5,0);g.lineTo(s*.5,s*.7);g.stroke();g.fillStyle=f;
  for(let i=0;i<9;i++){g.save();g.translate(s*.5,s*(.1+i*.07));g.rotate((i%2?1:-1)*(.5+.05*i));g.beginPath();g.ellipse(s*.12,0,s*.14,s*.025,0,0,TAU);g.fill();g.restore();}}),
 reed:sheet('#6a7a44',(g,s,f)=>{g.strokeStyle=f;g.lineWidth=3;for(let i=0;i<14;i++){g.beginPath();g.moveTo(s*(.3+.4*i/14),s);g.quadraticCurveTo(s*(.25+.5*i/14),s*.5,s*(.2+.6*i/14),s*.05);g.stroke();}}),
 rank:sheet('#8a9aa0',(g,s,f)=>{g.strokeStyle=f;g.lineWidth=2;for(let i=0;i<22;i++){g.beginPath();g.moveTo(s*.5,s);g.lineTo(s*(.15+.7*i/22),s*(.45+.2*Math.abs(i/22-.5)));g.stroke();}}),
 melon:sheet('#4a6a30',(g,s,f)=>{g.fillStyle=f;for(let i=0;i<5;i++){g.beginPath();g.arc(s*(.2+.15*i),s*(.75-.1*(i%2)),s*.13,0,TAU);g.fill();}g.fillStyle='#b8b070';g.beginPath();g.arc(s*.5,s*.8,s*.14,0,TAU);g.fill();}),
};
TX.culm=BIO.canvasTex(64,256,(g,w,h)=>{g.fillStyle='#9a9a94';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=2){g.fillStyle='rgba(0,0,0,'+(.03+.03*((y*7)%5)/5)+')';g.fillRect(0,y,w,1);}});
TX.disc=BIO.canvasTex(64,64,(g,w,h)=>{g.fillStyle='#d8d8d0';g.fillRect(0,0,w,h);for(let i=0;i<40;i++){g.fillStyle='rgba(60,60,40,.15)';g.fillRect((i*37)%w,(i*53)%h,2,2);}});
TX.melonSkin=BIO.canvasTex(128,128,(g,w,h)=>{g.fillStyle='#c4bc84';g.fillRect(0,0,w,h);g.strokeStyle='rgba(240,236,200,.75)';g.lineWidth=1.2;
 for(let i=0;i<18;i++){g.beginPath();g.moveTo(0,(i*29)%h);for(let x=0;x<=w;x+=8)g.lineTo(x,((i*29)+((x*13+i*7)%17)-8)%h);g.stroke();}
 for(let i=0;i<10;i++){g.beginPath();g.moveTo((i*13)%w,0);g.lineTo((i*13+9)%w,h);g.stroke();}});
const M=CUT.MAT={
 hleaf:BIO.leafMat(TX.hleaf,'cut-hleaf',{aN:false,swayW:'(-position.y)',swayA:.10,axis:1,alphaTest:.38}),
 reed:BIO.leafMat(TX.reed,'cut-reed',{swayW:'(position.y)',swayA:.10,alphaTest:.4}),
 rank:BIO.leafMat(TX.rank,'cut-rank',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
 melon:BIO.leafMat(TX.melon,'cut-melon',{swayW:'(position.y)',swayA:.02,alphaTest:.42}),
 culm:new T3.MeshLambertMaterial({color:0xffffff,map:TX.culm,vertexColors:true,side:T3.DoubleSide}),
 fruit:new T3.MeshLambertMaterial({color:0xffffff,map:TX.melonSkin}),
 disc:new T3.MeshLambertMaterial({color:0xffffff,map:TX.disc,vertexColors:true,side:T3.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),
 shoot:BIO.solidMat(null,0xffffff),
 /* the echoes: a faint pale copy, seen only at dusk (its opacity from the world clock: CUT.echoLight, set each frame by the host) */
 echo:new T3.MeshBasicMaterial({color:0xa8c4dc,transparent:true,opacity:0,depthWrite:false,fog:true,side:T3.DoubleSide,blending:T3.AdditiveBlending})};   /* additive: a pale glow against the dusk, never a dark shape */
M.culm.userData.bio={kind:'bark'};M.fruit.userData.bio={kind:'bark'};M.disc.userData.bio={kind:'bark'};
CUT.echoLight=v=>{M.echo.opacity=v;M.echo.visible=v>.004;};
CUT.LIB=BIO.libSwap('cut',M);

// ---------------------------------------------------------------- the items
// the culm: three intact lengths (20, 24, 28 internodes) and three bitten ones (one bite each, at a third, a half and two
// thirds of the way up); a grove draws from them by its own internode count, so every node in a grove lines up
CUT.CULM_N=[20,24,28];
/* three LOD tiers each (CUT.CULM_LOD: the core's runtime ranges): near in full, mid with two rows an internode, far one */
CUT.CULM_LOD={near:350,mid:1200};
/* ON THE CORE'S BAMBOO (BIO.bamboo.culm, core/biome/33b-core-bamboo.js; the final rebuild, pair 10, BACKPORT.md's "BIO.bamboo for every bamboo"): the
   culm was lifted from G.culm above, and with these options writes its vertices exactly (node core/biome/test-bamboo.js, which reads G.culm here: keep
   it). A page without 33b (nhighlands, which reads this file for exchanges 7 and 8) draws from G.culm, the same vertices */
const CULM=o=>BIO.bamboo&&BIO.bamboo.culm?BIO.bamboo.culm(o):G.culm(o.n,o.seg,o.bite||null,o.fs,o.cut);
CUT.CULM_N.forEach(n=>{BIO.def('hculm'+n,CULM({n,seg:6}),M.culm,{label:'Hyperbamboo culms',cls:'flora'});
 BIO.def('hculmm'+n,CULM({n,seg:5,fs:[0,.5]}),M.culm,{label:'Hyperbamboo culms',cls:'flora'});BIO.def('hculmf'+n,CULM({n,seg:4,fs:[0]}),M.culm,{label:'Hyperbamboo culms',cls:'flora'});});
CUT.BITTEN=[{n:24,y:8.4,r:1.3},{n:24,y:12.5,r:1.1},{n:28,y:18.5,r:1.4}];
CUT.BITTEN.forEach((b,i)=>BIO.def('hculmb'+i,CULM({n:b.n,seg:10,bite:{y:b.y,r:b.r},fs:[0,.02,.08,.45,.86]}),M.culm,{label:'Hyperbamboo culms, bitten open to their chambers',cls:'flora'}));
BIO.def('hecho',CULM({n:24,seg:5,fs:[0]}),M.echo,{label:'An echo (a faint copy of a culm, seen at dusk)',cls:'flora'});
[0,4,8].forEach((c,i)=>BIO.def('hleaf'+i,G.hang(c),M.hleaf,{label:'Hyperbamboo leaf sprays',cls:'flora'}));
BIO.def('hshoot',G.shoot(),M.shoot,{label:'Hyperbamboo shoots',cls:'flora'});
[1,4,7].forEach((c,i)=>BIO.def('reed'+i,G.stand(c,3),M.reed,{label:'Ring reeds',cls:'flora'}));
[0,4,8].forEach((c,i)=>BIO.def('rank'+i,G.stand(c,3),M.rank,{label:'Rankgrass',cls:'flora'}));
[0,4,8].forEach((c,i)=>BIO.def('melon'+i,G.stand(c,2),M.melon,{label:'Measure melon vines',cls:'flora'}));
BIO.def('mfruit',G.melon(),M.fruit,{label:'Measure melons (three sizes)',cls:'flora'});
BIO.def('lichen',G.disc(14),M.disc,{label:'Circle lichen',cls:'flora'});
CUT.PAL={culm:[0x5e8a6c,0x6a9474,0x7a9a6a,0x5a7e70,0x8aa070],culmOld:[0x9a9a78,0xa8a27e,0x8e8c6c],leaf:[0x7a9a54,0x86a45a,0x6e8c4e],
 reed:[0xa8b07a,0x98a46c,0xb4b884],rank:[0xb8c4c8,0xa8b8c0,0xc4ccd0],melon:[0xd0c48a,0xc8bc80,0xd8cc94],stuck:[0x9aa86a,0x8e9c62],
 lichen:[0xb8c040,0xc8c850,0xe07a2a,0xe8902e,0xd0d070]};
})();
