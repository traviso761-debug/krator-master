// ---------- buildings: every OpenStreetMap footprint extruded to its mapped height (or its levels), 3D parts where they are mapped,
// windows that light at dusk, storefront glass along the shopping streets; merged into 500 m tiles ----------
await stage('buildings');
// A window pattern, tiled a bay wide and a floor high. The lit ones are not all the same brightness: a face
// seen from two streets away is the texture's own mip, and if every window on it is the same bright orange
// that mip is one flat slab of light where a city should be a scatter. Varying them, and lighting rather
// fewer than half, is what keeps a distant wall reading as windows instead of a lamp.
function winTex(glow,cols,rows,seed,frames){const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');g.fillStyle=glow?'#000':(frames?'#d9d3c8':'#f4f2ee');g.fillRect(0,0,N,N);
  const R=mkRng(seed),cw=N/cols,rh=N/rows;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const lit=R()<0.38,k=lit?0.35+R()*0.65:0;
    g.fillStyle=glow?(lit?`rgb(${Math.round((205+R()*45)*k)},${Math.round((172+R()*54)*k)},${Math.round((118+R()*70)*k)})`:'#000')
                    :`rgb(${50+R()*25},${62+R()*25},${78+R()*25})`;
    // a palazzo's window (C.facade.shutters): a pale stone frame round it, shutters folded back either side
    if(frames&&!glow){const fc=g.fillStyle;g.fillStyle='#fbf8f2';g.fillRect(i*cw+cw*0.28,j*rh+rh*0.14,cw*0.44,rh*0.66);g.fillStyle=R()<0.75?'#4f6648':'#7a5a3e';
      g.fillRect(i*cw+cw*0.12,j*rh+rh*0.2,cw*0.14,rh*0.56);g.fillRect(i*cw+cw*0.74,j*rh+rh*0.2,cw*0.14,rh*0.56);g.fillStyle=fc;g.fillRect(i*cw+cw*0.32,j*rh+rh*0.2,cw*0.36,rh*0.54);continue;}
    g.fillRect(i*cw+cw*0.2,j*rh+rh*0.2,cw*0.6,rh*0.56);}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
// two window rhythms: towers (narrow bays, every floor) and low buildings (wider bays)
const towerTex=winTex(false,4,4,5),towerGlow=winTex(true,4,4,6),lowTex=winTex(false,4,4,9,!!(C.facade&&C.facade.shutters)),lowGlow=winTex(true,4,4,10);
// footprints come in either winding, so faces are drawn from both sides and each building's normals are pointed outwards explicitly
const towerM=new THREE.MeshLambertMaterial({vertexColors:true,map:towerTex,emissiveMap:towerGlow,emissive:0x000000,side:THREE.DoubleSide});
const lowM=new THREE.MeshLambertMaterial({vertexColors:true,map:lowTex,emissiveMap:lowGlow,emissive:0x000000,side:THREE.DoubleSide});
const roofM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const shopM=new THREE.MeshLambertMaterial({color:0x1c2630,emissive:0x000000,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const blankM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});   // walls, armour plating and rubble carry no windows
const bldMats={tower:towerM,low:lowM,blank:blankM};
// A city may dress its buildings in more than one way (C.facadeStyles: [{tex, when: {types, minH, maxH, share}, bay,
// floor, colours, low}], the first that fits a building wins, the rest keep the two rhythms above). The textures:
//   curtain  glass panels on thin mullions, a glint of specular (a tower's curtain wall)
//   ribbon   a continuous band of dark window to each floor, a white spandrel under it (an office block)
//   balcony  each floor's slab edge, a frosted railing over it, doors and windows set back behind (an apartment block)
//   tile     punched windows in a tiled wall, the tiles' joints faint (a mid-rise of the seventies)
//   timber   half-timbering: dark posts and floor beams, braces under the sills, shutters (an old town's houses)
//   clapboard painted lap siding, a window in its white trim to each bay, the corner boards (a wooden house)
//   arched   a round-headed window to each bay in its pale surround, shutters either side, a course at each floor
// `when.where` keeps a style to some lat/lon boxes, [[s, w, n, e], ...] (a neighbourhood's houses).
// Each texture holds four bays and four floors; `colours` replace a building's own for that style (glass is not
// painted), and `low` styles are dropped at a distance like the low buildings.
function styleTex(kind,glow,seed){const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d'),R=mkRng(seed),cw=N/4,rh=N/4;
  const lit=()=>R()<0.4,warm=k=>`rgb(${Math.round((205+R()*45)*k)},${Math.round((176+R()*50)*k)},${Math.round((122+R()*66)*k)})`;
  g.fillStyle=glow?'#000':'#ffffff';g.fillRect(0,0,N,N);
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){const x=i*cw,y=j*rh;
    if(kind==='curtain'){const k=lit()?0.25+R()*0.5:0;g.fillStyle=glow?(k?warm(k):'#000'):`rgb(${196+R()*28},${212+R()*24},${226+R()*24})`;g.fillRect(x,y,cw,rh);
      if(!glow){g.fillStyle='#e8edf0';g.fillRect(x,y,cw,2);g.fillRect(x,y,2,rh);g.fillRect(x+cw/2,y,1,rh);g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(x+3,y+3,cw*0.4,rh*0.5);}}
    else if(kind==='ribbon'){g.fillStyle=glow?'#000':'#f2f0ea';g.fillRect(x,y,cw,rh);const k=lit()?0.35+R()*0.6:0;g.fillStyle=glow?(k?warm(k):'#000'):`rgb(${44+R()*16},${56+R()*16},${70+R()*18})`;g.fillRect(x,y+rh*0.12,cw,rh*0.56);
      if(!glow){g.fillStyle='#c8ccd0';g.fillRect(x,y+rh*0.12,2,rh*0.56);}}
    else if(kind==='balcony'){g.fillStyle=glow?'#000':'#ffffff';g.fillRect(x,y,cw,rh);const k=lit()?0.4+R()*0.6:0;
      g.fillStyle=glow?(k?warm(k):'#000'):`rgb(${58+R()*20},${66+R()*18},${74+R()*18})`;g.fillRect(x+cw*0.08,y+rh*0.1,cw*0.84,rh*0.5);   // the doors behind
      if(!glow){g.fillStyle=R()<0.3?'#9ab0bc':'#d6dcde';g.fillRect(x,y+rh*0.56,cw,rh*0.3);g.fillStyle='#fbfbf8';g.fillRect(x,y+rh*0.86,cw,rh*0.14);   // the railing panel, the slab's edge
        if(R()<0.25){g.fillStyle=['#e8e0d0','#c8d8e8','#e8c8c8'][Math.floor(R()*3)];g.fillRect(x+cw*0.2,y+rh*0.38,cw*0.3,rh*0.2);}}}   // washing on the rail
    else if(kind==='timber'){// half-timbering: posts at the bay's edges, a beam at each floor, braces up to the window's sill
      g.fillStyle=glow?'#000':'#f6f2ea';g.fillRect(x,y,cw,rh);const k=lit()?0.4+R()*0.6:0;
      g.fillStyle=glow?(k?warm(k):'#000'):`rgb(${46+R()*16},${52+R()*16},${58+R()*16})`;g.fillRect(x+cw*0.34,y+rh*0.22,cw*0.32,rh*0.42);
      if(!glow){g.fillStyle='#4a3424';g.fillRect(x,y,cw*0.07,rh);g.fillRect(x,y+rh*0.9,cw,rh*0.1);g.fillRect(x,y,cw,rh*0.05);
        g.strokeStyle='#4a3424';g.lineWidth=cw*0.06;g.beginPath();g.moveTo(x+cw*0.05,y+rh*0.9);g.lineTo(x+cw*0.32,y+rh*0.66);g.moveTo(x+cw*0.98,y+rh*0.9);g.lineTo(x+cw*0.68,y+rh*0.66);g.stroke();
        g.fillStyle='#4a3424';g.fillRect(x+cw*0.3,y+rh*0.64,cw*0.4,rh*0.05);g.fillStyle=R()<0.5?'#3a5a3a':'#6a3a2a';g.fillRect(x+cw*0.26,y+rh*0.22,cw*0.07,rh*0.42);g.fillRect(x+cw*0.67,y+rh*0.22,cw*0.07,rh*0.42);}}   // and shutters either side
    else if(kind==='arched'){// a Venetian front: a round-headed window to each bay in its stone surround, shutters, a string course at each floor
      g.fillStyle=glow?'#000':'#ece4d6';g.fillRect(x,y,cw,rh);const k=lit()?0.4+R()*0.6:0;
      if(!glow){g.fillStyle='#d4c6ae';g.fillRect(x,y+rh*0.9,cw,rh*0.1);g.fillStyle='#f8f2e8';g.beginPath();g.moveTo(x+cw*0.26,y+rh*0.78);g.lineTo(x+cw*0.26,y+rh*0.38);g.arc(x+cw*0.5,y+rh*0.38,cw*0.24,Math.PI,0);g.lineTo(x+cw*0.74,y+rh*0.78);g.closePath();g.fill();}
      g.fillStyle=glow?(k?warm(k):'#000'):`rgb(${36+R()*14},${46+R()*14},${58+R()*14})`;g.beginPath();g.moveTo(x+cw*0.32,y+rh*0.76);g.lineTo(x+cw*0.32,y+rh*0.4);g.arc(x+cw*0.5,y+rh*0.4,cw*0.18,Math.PI,0);g.lineTo(x+cw*0.68,y+rh*0.76);g.closePath();g.fill();
      if(!glow){const sc=['#3a6a5a','#3a5a8a','#8a4a3a','#4a7a8a'][Math.floor(R()*4)];g.fillStyle=sc;g.fillRect(x+cw*0.13,y+rh*0.3,cw*0.12,rh*0.46);g.fillRect(x+cw*0.75,y+rh*0.3,cw*0.12,rh*0.46);
        g.fillStyle='#cdbfa6';g.fillRect(x+cw*0.22,y+rh*0.77,cw*0.56,rh*0.04);}}
    else if(kind==='clapboard'){// the siding a shade under the trim, so a painted house keeps its white window frames
      g.fillStyle=glow?'#000':'#dcdcdc';g.fillRect(x,y,cw,rh);
      if(!glow){for(let k=1;k<14;k++){g.fillStyle='rgba(0,0,0,0.16)';g.fillRect(x,y+k*rh/14,cw,1.5);g.fillStyle='rgba(255,255,255,0.18)';g.fillRect(x,y+k*rh/14+1.5,cw,1);}
        g.fillStyle='#ffffff';g.fillRect(x,y,cw*0.05,rh);g.fillRect(x+cw*0.27,y+rh*0.18,cw*0.46,rh*0.56);g.fillRect(x+cw*0.24,y+rh*0.72,cw*0.52,rh*0.05);}
      const k=lit()?0.4+R()*0.6:0;g.fillStyle=glow?(k?warm(k):'#000'):`rgb(${40+R()*14},${48+R()*14},${56+R()*14})`;g.fillRect(x+cw*0.31,y+rh*0.22,cw*0.38,rh*0.48);
      if(!glow){g.fillStyle='#ffffff';g.fillRect(x+cw*0.31,y+rh*0.43,cw*0.38,rh*0.035);}}   // the sash's meeting rail
    else{g.fillStyle=glow?'#000':'#f4f2ee';g.fillRect(x,y,cw,rh);if(!glow){g.strokeStyle='rgba(0,0,0,0.06)';for(let q=0;q<rh;q+=6){g.beginPath();g.moveTo(x,y+q);g.lineTo(x+cw,y+q);g.stroke();}}
      const k=lit()?0.35+R()*0.6:0;g.fillStyle=glow?(k?warm(k):'#000'):`rgb(${50+R()*25},${62+R()*25},${78+R()*25})`;g.fillRect(x+cw*0.18,y+rh*0.22,cw*0.64,rh*0.5);}}
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
const STYLES=(C.facadeStyles||[]).map((st,i)=>{const tex=styleTex(st.tex,false,40+i*7),glow=styleTex(st.tex,true,41+i*7);
  const M=st.tex==='curtain'?new THREE.MeshPhongMaterial({vertexColors:true,map:tex,emissiveMap:glow,emissive:0x000000,specular:0x6a7a88,shininess:60,side:THREE.DoubleSide})
    :new THREE.MeshLambertMaterial({vertexColors:true,map:tex,emissiveMap:glow,emissive:0x000000,side:THREE.DoubleSide});
  const key='style'+i;bldMats[key]=M;const w=st.when||{};
  return {key,M,bay:st.bay||3.4,floor:st.floor||3.4,low:!!st.low,cols:(st.colours||[]).map(c=>new THREE.Color(c)),types:w.types?new Set(w.types):null,minH:w.minH||0,maxH:w.maxH||1e9,share:w.share===undefined?1:w.share,salt:i,
    where:w.where?w.where.map(([s,wl,n,e])=>{const [x0,z1]=P([s,wl]),[x1,z0]=P([n,e]);return [x0,z0,x1,z1];}):null};});
API.BLD_MATS=bldMats;API.FACADE_STYLES=STYLES;   // for a page that streams buildings of its own (src/core/metro.js) and wants them dressed alike
const styleOf=(b,H,hsh,cx,cz)=>{for(const st of STYLES){if(st.types&&!st.types.has(b.t||'yes'))continue;if(st.where&&!st.where.some(([x0,z0,x1,z1])=>cx>=x0&&cx<=x1&&cz>=z0&&cz<=z1))continue;if(H<st.minH||H>st.maxH)continue;if(st.share<1&&((hsh*977+st.salt*0.37)%1)>=st.share)continue;return st;}return null;};
const BLANK_T=new Set(['wall','rubble','ruin','armour','barrier','tower','keep','rock']);
// A city that was built before glass says so, and gets no window texture on anything: the pattern is a
// grid of lit offices, and on a stone city it turns white walls grey and puts a curtain wall on a keep.
const NO_WIN=C.windows===false;
const PALETTE={
  glass:['#5d7890','#6a8aa0','#4e6478','#8a9aa8','#7c8e9a','#3e5264','#9aa8b2'].map(col),
  stone:['#c8bea8','#b8ae98','#d8d0bc','#a89e8a','#e2dccb','#9c9486','#c2b49a'].map(col),
  brick:['#8a4b3a','#9c5a45','#7a4535','#b07a5a','#a8624a','#6e5a4e','#b58e6a','#8c7b6a'].map(col),
  concrete:['#a9a59c','#b6b2a8','#96928a','#c0bcb2'].map(col)};
// a city can bring its own walls: "palette": {"brick": [...], "stone": [...]} replaces those families (Rome's are
// ochre, yellow, terracotta and pink stucco, not brick)
for(const k in (C.palette||{}))if(k!=='_'&&PALETTE[k])PALETTE[k]=C.palette[k].map(col);
const NAMED_COL={white:'#e8e6e0',black:'#2a2c30',grey:'#8a8a88',gray:'#8a8a88',brown:'#7a5a44',red:'#8a3a2a',beige:'#d8ccb0',tan:'#c8b08a',yellow:'#d8c070',blue:'#4a6a8a',silver:'#b0b4b8'};
function colourOf(b,h,hsh){if(b.c){const k=b.c.toLowerCase();try{return col(NAMED_COL[k]||k);}catch(e){}}
  const m=(b.mat||'').toLowerCase(),pickFrom=a=>a[Math.floor(hsh*a.length)];
  if(/glass|metal|steel/.test(m))return pickFrom(PALETTE.glass);if(/brick/.test(m))return pickFrom(PALETTE.brick);if(/stone|limestone|marble|granite/.test(m))return pickFrom(PALETTE.stone);if(/concrete/.test(m))return pickFrom(PALETTE.concrete);
  if(h>90)return hsh<0.55?pickFrom(PALETTE.glass):hsh<0.8?pickFrom(PALETTE.stone):pickFrom(PALETTE.concrete);
  if(h>35)return hsh<0.35?pickFrom(PALETTE.glass):hsh<0.65?pickFrom(PALETTE.brick):pickFrom(PALETTE.stone);
  return hsh<0.7?pickFrom(PALETTE.brick):pickFrom(PALETTE.stone);}
const PITCHED=new Set(['house','detached','semidetached_house','terrace','bungalow','cabin','church','chapel']);
// What the roofs are made of, which is as much a cultural fact as the pitch: slate and asphalt in Chicago,
// copper gone green and slate gone violet in a valley full of elves. roofColours in the city file.
const FLATROOF=C.flatRoofColours?C.flatRoofColours.map(col):null;
const SHINGLE=(C.roofColours||['#4a4644','#5a3a32','#3e4a52','#6a5a4a','#2e3034','#584a44']).map(col);
const ROOFTOP=[];   // flat roofs big enough for equipment or a water tank, for the details stage
// a gable roof over the footprint's oriented bounding box
const ROOF_PITCH=C.roofPitch===undefined?0.42:C.roofPitch;
const ROOF_RISE=C.roofRise===undefined?4.2:C.roofRise;
API.ROOF={rise:ROOF_RISE,pitch:ROOF_PITCH};   // for a city's own roof dress (src/edinburgh/oldtown.js)
const ROOF_AREA=C.roofMaxArea===undefined?600:C.roofMaxArea;
const ROOF_TALL=C.roofMaxHeight===undefined?16:C.roofMaxHeight;
// the box a roof is fitted to: along its principal axis with the ridge on the long side, or, given an axis (a city
// whose ridges follow the street: C.roofStreet), along that whatever the footprint's shape
function roofBox(ring,cx,cz,axis){let a=axis;if(a===undefined){let sxx=0,szz=0,sxz=0;for(const [x,z] of ring){sxx+=(x-cx)**2;szz+=(z-cz)**2;sxz+=(x-cx)*(z-cz);}a=0.5*Math.atan2(2*sxz,sxx-szz);}
  let ux=Math.cos(a),uz=Math.sin(a),u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;
  for(const [x,z] of ring){const u=(x-cx)*ux+(z-cz)*uz,v=-(x-cx)*uz+(z-cz)*ux;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v);}
  if(axis===undefined&&v1-v0>u1-u0){[ux,uz]=[-uz,ux];[u0,u1,v0,v1]=[v0,v1,-u1,-u0];}   // ridge along the long side
  return {ux,uz,u0,u1,v0,v1};}
function gableRoof(rf,ring,cx,cz,h,shingle,wall,axis){const {ux,uz,u0,u1,v0,v1}=roofBox(ring,cx,cz,axis);
  // How steep a roof is is a cultural fact, not a constant: a Chicago three-flat and an elven hall in a wet
  // valley are the same gable with a different pitch, and at these scales the pitch is most of what tells
  // them apart. roofPitch and roofRise in the city file move it.
  const W=(u,v,y)=>[cx+u*ux-v*uz,y,cz+u*uz+v*ux],rh=Math.min(ROOF_RISE,(v1-v0)*ROOF_PITCH),vm=(v0+v1)/2;
  const A=W(u0,v0,h),Bp=W(u1,v0,h),Cp=W(u1,v1,h),D=W(u0,v1,h),R0=W(u0,vm,h+rh),R1=W(u1,vm,h+rh);
  const tri=(p,q,r,cl)=>{const e1=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],e2=[r[0]-p[0],r[1]-p[1],r[2]-p[2]];let n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];const l=Math.hypot(...n)||1;n=n.map(v=>v/l);if(n[1]<0)n=n.map(v=>-v);
    const base=rf.p.length/3;rf.p.push(p[0],p[1],p[2],q[0],q[1],q[2],r[0],r[1],r[2]);
    const n0=n[0],n1=n[1],n2=n[2];rf.n.push(n0,n1,n2,n0,n1,n2,n0,n1,n2);
    const cr=cl.r,cg=cl.g,cb=cl.b;rf.c.push(cr,cg,cb,cr,cg,cb,cr,cg,cb);rf.idx.push(base,base+1,base+2);};
  const sl=shingle,sl2=shingle.clone().multiplyScalar(0.8);
  tri(A,Bp,R1,sl);tri(A,R1,R0,sl);tri(D,R0,R1,sl2);tri(D,R1,Cp,sl2);tri(A,R0,D,wall);tri(Bp,Cp,R1,wall);}
const REPLACED=new Set(C.landmarks.flatMap(l=>l.replace||[]).map(s=>s.toLowerCase()));
// Some landmarks are modelled in the landmarks stage instead of extruded, because their shape is not a
// footprint pushed upwards: One World Trade is mapped as a square with a triangle glued to each side, all five
// of them run up to 417 m, which builds a slab. A landmark carrying "clear":[radius, minHeight] drops every
// mapped footprint whose middle falls inside that circle and which stands taller than minHeight, so the model
// has the site to itself while the low buildings round its plaza stay where the map put them.
const CLEARED=C.landmarks.filter(l=>Array.isArray(l.clear)).map(l=>{const [x,z]=P(l.at);return {x,z,r:l.clear[0],h:l.clear[1]||0};});
// A site that is not round (a palace on a quadrangle, with a church against it that has its own model) carries
// "clearArea": {"poly": [[lat,lon], ...], "minHeight": m} instead: footprints whose middle falls inside the outline go.
const CLEAR_POLY=C.landmarks.filter(l=>l.clearArea&&Array.isArray(l.clearArea.poly)).map(l=>({ring:l.clearArea.poly.map(P),h:l.clearArea.minHeight||0}));
const inRing=(x,z,r)=>{let o=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,zi]=r[i],[xj,zj]=r[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)o=!o;}return o;};
const cleared=(cx,cz,h)=>(CLEARED.length>0&&CLEARED.some(c=>h>=c.h&&Math.hypot(cx-c.x,cz-c.z)<=c.r))||(CLEAR_POLY.length>0&&CLEAR_POLY.some(c=>h>=c.h&&inRing(cx,cz,c.ring)));
const HEIGHT_FIX=C.landmarks.filter(l=>l.height||l.colour).map(l=>{const [x,z]=P(l.at);return {x,z,h:l.height||0,c:l.colour?col(l.colour):null,have:0};});   // known heights and colours for landmarks whose OSM tags are missing or wrong
// A height fix exists for towers the map gets wrong, but many are mapped properly as a stack of parts with a low
// outline at street level. Raising that outline to the tower's height buries the real massing inside one box
// (it was doing exactly that to Willis Tower, Aqua, Trump and the Board of Trade), so a fix is dropped wherever
// the map already carries something near the height it was going to force.
if(HEIGHT_FIX.length){for(const b of OSM.buildings){const p=b.p;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
    for(let i=0;i+1<p.length;i+=2){const px=p[i]/10,pz=p[i+1]/10;if(px<x0)x0=px;if(px>x1)x1=px;if(pz<z0)z0=pz;if(pz>z1)z1=pz;}
    if(cleared((x0+x1)/2,(z0+z1)/2,b.h||0))continue;   // a footprint that is not going to be drawn cannot vouch for a height
    let ring=null;
    for(const f of HEIGHT_FIX){if(!f.h||f.x<x0||f.x>x1||f.z<z0||f.z>z1||(b.h||0)<=f.have)continue;
      if(!ring){ring=[];for(let i=0;i+1<p.length;i+=2)ring.push([p[i]/10,p[i+1]/10]);}
      if(inPoly(f.x,f.z,ring))f.have=b.h||0;}}
  for(const f of HEIGHT_FIX)f.skip=f.have>=f.h*0.6;}
const FACADE=C.facade||{};
const STADIUMS=C.landmarks.filter(l=>l.stadium).map(l=>({...l,xz:P(l.at)}));
const BUILDINGS=[];   // named buildings {name,h,cx,cz,tile,kind,start,end}, for picking
const BGRID=new Map(),FOOTPRINTS=[];   // FOOTPRINTS: every drawn footprint {ring,h,m,g,c,tall,name}, for a city's own stages   // every drawn footprint on a 100 m grid: {ring,h,m,x0,x1,z0,z1,name}
function buildingsAt(x,z,r){const out=[];r=r||0;for(let gi=Math.floor((x-r)/100);gi<=Math.floor((x+r)/100);gi++)for(let gj=Math.floor((z-r)/100);gj<=Math.floor((z+r)/100);gj++)for(const b of BGRID.get(gi*100003+gj)||[])if(x>=b.x0-r&&x<=b.x1+r&&z>=b.z0-r&&z<=b.z1+r&&!out.includes(b))out.push(b);return out;}
function roofAt(x,z){let h=0;for(const b of buildingsAt(x,z,0))if(inPoly(x,z,b.ring))h=Math.max(h,b.h);if(h)return h;for(const b of buildingsAt(x,z,20))h=Math.max(h,b.h);return h;}
const PICK_TILES=[];
section('buildings',()=>{
  const tiles=new Map();
  const TSZ=800*WORLD;const T=(x,z)=>{const k=Math.floor(x/TSZ)+','+Math.floor(z/TSZ);let t=tiles.get(k);if(!t){t={walls:{tower:{p:[],n:[],u:[],c:[],idx:[],own:[]},low:{p:[],n:[],u:[],c:[],idx:[],own:[]},blank:{p:[],n:[],u:[],c:[],idx:[],own:[]}},roof:{p:[],n:[],c:[],idx:[]},roofLow:{p:[],n:[],c:[],idx:[]},shop:{p:[],n:[],idx:[]}};tiles.set(k,t);}return t;};
  const MAIN=new Set(['primary','secondary','tertiary','pedestrian','trunk']);
  let n=0,stores=0,skippedStadium=0,skippedCleared=0;
  for(const b of OSM.buildings){const ring=dec(b.p);if(ring.length<3)continue;
    const name=(b.n||'').toLowerCase();if(name&&REPLACED.has(name))continue;
    // courtyards (a city that keeps them: "courtyards" in its config): inner rings, wound against the outline
    const holes=(b.i||[]).map(dec).filter(h=>h.length>=3).map(h=>Math.sign(polyArea(h))===Math.sign(polyArea(ring))?h.slice().reverse():h);
    let cx=0,cz=0;for(const [x,z] of ring){cx+=x;cz+=z;}cx/=ring.length;cz/=ring.length;
    if(!inMap(cx,cz,0))continue;
    if(C.noBuildingsInWater&&inWater(cx,cz))continue;   // a river city's bridge piers are mapped as buildings: they are not windowed houses
    // stadiums are drawn as bowls elsewhere; skip their solid outlines
    if(b.t==='stadium'||STADIUMS.some(s=>Math.hypot(s.xz[0]-cx,s.xz[1]-cz)<120&&Math.abs(polyArea(ring))>6000)){skippedStadium++;continue;}
    if(cleared(cx,cz,b.h||0)){skippedCleared++;continue;}   // modelled properly in the landmarks stage instead
    const g0=groundMin(ring);let h=g0+b.h,fixC=null;const m0=g0+(b.m||0);   // the lowest ground under the footprint: the building stands on it
    for(const f of HEIGHT_FIX)if(Math.abs(f.x-cx)<120&&Math.abs(f.z-cz)<120&&inPoly(f.x,f.z,ring)){if(!f.skip&&h-g0<f.h*0.6)h=g0+f.h;if(f.c)fixC=f.c;}
    const hsh=hash3(cx,cz,3),tall=h-g0>30,ST=(NO_WIN||BLANK_T.has(b.t))?null:styleOf(b,h-g0,hsh,cx,cz),W=(NO_WIN||BLANK_T.has(b.t))?'blank':ST?ST.key:(tall?'tower':'low'),t=T(cx,cz);
    const c=fixC||(ST&&ST.cols.length&&!b.c?ST.cols[Math.floor((hsh*313)%1*ST.cols.length)]:colourOf(b,h-g0,hsh)),wb=t.walls[W]||(t.walls[W]={p:[],n:[],u:[],c:[],idx:[],own:[]});
    const start=wb.idx.length;
    {const bb=bbox(ring),rec={ring,holes,h,m:m0,x0:bb.x0,x1:bb.x1,z0:bb.z0,z1:bb.z1,name:b.n||''};FOOTPRINTS.push({ring,holes,h,m:m0,g:g0,c,tall,name:b.n||'',t:b.t||'',hsh});for(let gi=Math.floor(bb.x0/100);gi<=Math.floor(bb.x1/100);gi++)for(let gj=Math.floor(bb.z0/100);gj<=Math.floor(bb.z1/100);gj++){const k=gi*100003+gj;let a=BGRID.get(k);if(!a){a=[];BGRID.set(k,a);}a.push(rec);}}
    // walls: u runs along the facade (one bay per 3.5 m, towers 3 m), v up the floors (3.6 m). A city of tall-storeyed
    // palazzi says so with "facade": {"bay": m, "floor": m} in its config - a window every bay metres, a row every
    // floor - for its low buildings; the texture holds four windows each way, so the tile spans four of each
    let per=0;const bay=ST?ST.bay*4:tall?3:(FACADE.bay?FACADE.bay*4:3.5),fl=ST?ST.floor*4:tall?3.6:(FACADE.floor?FACADE.floor*4:3.6);
    const e0=ring[0],e1=ring[1],el=Math.hypot(e1[0]-e0[0],e1[1]-e0[1])||1,out=inPoly((e0[0]+e1[0])/2+(e1[1]-e0[1])/el*0.3,(e0[1]+e1[1])/2-(e1[0]-e0[0])/el*0.3,ring)?-1:1;   // +1 when (dz,-dx) points outside
    for(let i=0;i<ring.length;i++){const a=ring[i],bb=ring[(i+1)%ring.length],len=Math.hypot(bb[0]-a[0],bb[1]-a[1]);if(len<0.05)continue;
      const nx=out*(bb[1]-a[1])/len,nz=-out*(bb[0]-a[0])/len,base=wb.p.length/3,u0=per/bay,u1=(per+len)/bay;per+=len;
      wb.p.push(a[0],h,a[1],bb[0],h,bb[1],bb[0],m0,bb[1],a[0],m0,a[1]);for(let k=0;k<4;k++){wb.n.push(nx,0,nz);wb.c.push(c.r,c.g,c.b);}
      wb.u.push(u0,(h-g0)/fl,u1,(h-g0)/fl,u1,(m0-g0)/fl,u0,(m0-g0)/fl);wb.idx.push(base,base+1,base+2,base,base+2,base+3);
      // storefront glass: ground-floor walls within a few metres of a main street, in the detailed areas
      if(m0-g0<1&&len>4&&h-g0>=6&&focusAt(cx,cz)){const mx=(a[0]+bb[0])/2,mz=(a[1]+bb[1])/2;
        if(roadsNear(mx+nx*3,mz+nz*3,8,r=>MAIN.has(r.c)).length){const s=t.shop,sb=s.p.length/3,o=0.15,ins=Math.min(1,len*0.1),ax=a[0]+(bb[0]-a[0])/len*ins,az=a[1]+(bb[1]-a[1])/len*ins,bx=bb[0]-(bb[0]-a[0])/len*ins,bz=bb[1]-(bb[1]-a[1])/len*ins;
          s.p.push(ax+nx*o,g0+4.2,az+nz*o,bx+nx*o,g0+4.2,bz+nz*o,bx+nx*o,g0+0.3,bz+nz*o,ax+nx*o,g0+0.3,az+nz*o);for(let k=0;k<4;k++)s.n.push(nx,0,nz);s.idx.push(sb,sb+1,sb+2,sb,sb+2,sb+3);stores++;}}}
    for(const hr of holes){let hp=0;for(let i=0;i<hr.length;i++){const a=hr[i],bb=hr[(i+1)%hr.length],len=Math.hypot(bb[0]-a[0],bb[1]-a[1]);if(len<0.05)continue;
      const nx=out*(bb[1]-a[1])/len,nz=-out*(bb[0]-a[0])/len,base=wb.p.length/3,u0=hp/bay,u1=(hp+len)/bay;hp+=len;
      wb.p.push(a[0],h,a[1],bb[0],h,bb[1],bb[0],m0,bb[1],a[0],m0,a[1]);for(let k=0;k<4;k++){wb.n.push(nx,0,nz);wb.c.push(c.r,c.g,c.b);}
      wb.u.push(u0,(h-g0)/fl,u1,(h-g0)/fl,u1,(m0-g0)/fl,u0,(m0-g0)/fl);wb.idx.push(base,base+1,base+2,base,base+2,base+3);}}
    // roof: houses get a pitched roof fitted to their footprint (ridge along the long side), everything else is flat
    // a flat roof is the wall's colour darkened, unless the city says what its flat roofs are (C.flatRoofColours: tar,
    // gravel, white membrane - a brick wall does not make a brick roof)
    const rf=tall?t.roof:t.roofLow,rc=FLATROOF?FLATROOF[Math.floor(hash3(cx,cz,17)*FLATROOF.length)]:c.clone().multiplyScalar(0.72),area=Math.abs(polyArea(ring));   // low roofs are culled with their walls; tower roofs never are
    // C.pitchAll {types, share}: a city whose tenements and terraces are slate-roofed, not flat (Edinburgh)
    const PA=C.pitchAll,pitched=!holes.length&&(b.r==='g'||b.r==='h'||PITCHED.has(b.t)||(b.t==='residential'&&h-g0<=11&&area<220&&hsh<0.35)||(PA&&(!PA.types||PA.types.includes(b.t||'yes'))&&((hsh*577)%1)<(PA.share??1)))&&area<ROOF_AREA&&h-g0<=ROOF_TALL&&b.r!=='f';
    // C.roofStreet: the ridge runs along the nearest street, as a terrace's does (its plots are narrow and deep, so
    // the long side is the wrong one); C.roofFill: a footprint that fills less of its roof's box than this (an L, a
    // court, a jagged block) keeps a flat roof, since a gable over it would overhang its neighbours
    let axis;if(pitched&&C.roofStreet){let best=1e9;for(const q of roadsNear(cx,cz,40)){const pa=q.road.pts[q.k],pb=q.road.pts[q.k+1];if(!pb)continue;
        const dx=pb[0]-pa[0],dz=pb[1]-pa[1],l2=dx*dx+dz*dz||1,tt=Math.max(0,Math.min(1,((cx-pa[0])*dx+(cz-pa[1])*dz)/l2)),d=Math.hypot(cx-pa[0]-dx*tt,cz-pa[1]-dz*tt);if(d<best){best=d;axis=Math.atan2(dz,dx);}}}
    let roofOK=pitched;if(pitched&&C.roofFill){const bx=roofBox(ring,cx,cz,axis);roofOK=area/((bx.u1-bx.u0)*(bx.v1-bx.v0)||1)>=C.roofFill;}
    if(roofOK){gableRoof(rf,ring,cx,cz,h,SHINGLE[Math.floor(hash3(cx,cz,9)*SHINGLE.length)],c,axis);const fp=FOOTPRINTS[FOOTPRINTS.length-1];fp.gable=true;fp.roofAxis=axis;}
    if(!roofOK){const rb=rf.p.length/3,v2=r=>r.map(([x,z])=>new THREE.Vector2(x,z));let faces;try{faces=THREE.ShapeUtils.triangulateShape(v2(ring),holes.map(v2));}catch(e){faces=[];}
      for(const [x,z] of [ring,...holes].flat()){rf.p.push(x,h,z);rf.n.push(0,1,0);rf.c.push(rc.r,rc.g,rc.b);}for(const f of faces)rf.idx.push(rb+f[0],rb+f[2],rb+f[1]);
      if(area>350&&h-g0>=7&&!tall)ROOFTOP.push({x:cx,z:cz,h,area,ring,brick:PALETTE.brick.includes(c),hsh});}
    if(b.n){BUILDINGS.push({name:b.n,h,cx,cz,tile:t,kind:W,start,end:wb.idx.length});}
    n++;}
  // build the tile meshes
  const mk=(d,mat,withUV)=>{if(!d.idx.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(d.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(d.n,3));
    if(d.c)g.setAttribute('color',new THREE.Float32BufferAttribute(d.c,3));if(withUV)g.setAttribute('uv',new THREE.Float32BufferAttribute(d.u,2));g.setIndex(d.idx);g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);m.castShadow=m.receiveShadow=true;scene.add(m);return m;};
  const far=(m,d)=>{if(m){m.userData.far=d;FAR_MESHES.push(m);}};
  // Anything under 30 m is sprawl: near the camera it is the city, from two kilometres away it is noise that costs
  // as much as the skyline. Tall buildings carry no distance limit, so the silhouette never changes.
  const LOW_FAR=(C.lowRiseFar||2400)*WORLD;
  for(const t of tiles.values()){for(const W of Object.keys(t.walls)){const m=mk(t.walls[W],bldMats[W],true);if(m){m.userData.pick={tile:t,kind:W};m.userData.wireCat='building';m.name='buildings';PICK_TILES.push(m);t.walls[W].mesh=m;if(W==='low'||STYLES.some(st=>st.key===W&&st.low))far(m,LOW_FAR);}}
    mk(t.roof,roofM,false);far(mk(t.roofLow,roofM,false),LOW_FAR);   // the skyline is always drawn; the low-rise behind it is not
    const s=mk(t.shop,shopM,false);if(s){s.castShadow=false;far(s,1500*WORLD);}}
  ctx.lotList=[];for(const a of BGRID.values())for(const r of a)if(!r._fp){r._fp=1;ctx.lotList.push({x:(r.x0+r.x1)/2,z:(r.z0+r.z1)/2,w:r.x1-r.x0,dpt:r.z1-r.z0,h:r.h,ry:0,kind:'osm',fixed:false});}   // the test fingerprint: every drawn footprint
  ctx.lotList.sort((p,q)=>p.x-q.x||p.z-q.z);ctx.lots=ctx.lotList.length;
  ctx.details=Object.assign(ctx.details||{},{buildingsDrawn:n,storefronts:stores,stadiumOutlinesSkipped:skippedStadium,modelledOutlinesSkipped:skippedCleared,heightFixesDropped:HEIGHT_FIX.filter(f=>f.skip).length,tiles:tiles.size});
});
// which named building a click hit: the wall triangle index maps back to the building that made it
function buildingAt(hit){const pk=hit.object.userData.pick;if(!pk)return null;const tri=hit.faceIndex*3;return BUILDINGS.find(b=>b.tile===pk.tile&&b.kind===pk.kind&&tri>=b.start&&tri<b.end)||null;}
// windows and storefronts come on at dusk
animHooks.push(()=>{const w=windowF(hourCur);towerM.emissive.setRGB(w,w*0.92,w*0.8);lowM.emissive.setRGB(w*0.9,w*0.8,w*0.62);for(const st of STYLES)st.M.emissive.setRGB(w*0.9,w*0.82,w*0.66);shopM.emissive.setRGB(w*0.6,w*0.52,w*0.34);});
Object.assign(API,{roofAt,buildingsAt,towerM,lowM,blankM,roofM,PALETTE,FOOTPRINTS});
