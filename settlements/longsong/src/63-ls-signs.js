// ================================================================= LONGSONG — the signs: what the monks paint and hang
// [draw] Canvas pictures for the containment's dress (the Order as the Buddhist keepers of an SCP-like register): the
// Order's sigil (a wheel round an hourglass, the eight spokes the eight seals), the register's plaques in the Order's
// rounded book hand (designation, class in the keepers' words, the procedure), the great containment thangka hung on
// the White Palace's face on festival days (the wheel and its eight sealed niches as a mandala), the glyph band of the
// Procrastinator, the seal strips, the Hall of Hours' dial. Each is painted once into a texture (SIGNS.*).
const SIGNS=(function(){
 const tex=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return t;};
 const BLUE='#2e5a9c',SAFF='#e0a030',INK='#1c1a18',PAPER='#efe6cf',RED='#8e2f24',GOLD='#d8b048';
 const HAND='italic 600 {s}px Georgia, "Times New Roman", serif';
 const font=(g,s)=>{g.font=HAND.replace('{s}',s);};
 // the glyphs: invented strokes (the Order's seal script), drawn from a seeded stroke list so a glyph is the same everywhere
 function glyph(g,x,y,s,seed,colour,lw){const S=KRAND.stream(seed>>>0);g.save();g.translate(x,y);g.strokeStyle=colour;g.lineWidth=lw||s*.09;g.lineCap='round';g.lineJoin='round';
  g.beginPath();g.arc(0,0,s*.46,0,Math.PI*2);g.stroke();
  const n=3+S.int(0,3);for(let i=0;i<n;i++){const a=S.range(0,Math.PI*2),r=S.range(.05,.38)*s,b=a+S.range(1.2,3.2);g.beginPath();
   if(S.chance(.5)){g.moveTo(Math.cos(a)*r,Math.sin(a)*r);g.lineTo(Math.cos(b)*s*.36,Math.sin(b)*s*.36);}else g.arc(0,0,r,a,b);g.stroke();}
  if(S.chance(.6)){g.beginPath();g.arc(0,0,s*.06,0,Math.PI*2);g.fillStyle=colour;g.fill();}
  g.restore();}
 // the Order's sigil: a wheel of eight spokes round an hourglass
 function sigil(g,cx,cy,R,fg,bg){g.save();g.translate(cx,cy);
  if(bg){g.fillStyle=bg;g.beginPath();g.arc(0,0,R,0,Math.PI*2);g.fill();}
  g.strokeStyle=fg;g.fillStyle=fg;g.lineWidth=R*.08;g.beginPath();g.arc(0,0,R*.86,0,Math.PI*2);g.stroke();g.lineWidth=R*.04;g.beginPath();g.arc(0,0,R*.62,0,Math.PI*2);g.stroke();
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.beginPath();g.moveTo(Math.cos(a)*R*.62,Math.sin(a)*R*.62);g.lineTo(Math.cos(a)*R*.86,Math.sin(a)*R*.86);g.stroke();
   g.beginPath();g.arc(Math.cos(a)*R*.74,Math.sin(a)*R*.74,R*.05,0,Math.PI*2);g.fill();}
  g.beginPath();g.moveTo(-R*.3,-R*.42);g.lineTo(R*.3,-R*.42);g.lineTo(R*.04,0);g.lineTo(R*.3,R*.42);g.lineTo(-R*.3,R*.42);g.lineTo(-R*.04,0);g.closePath();g.lineWidth=R*.05;g.stroke();
  g.beginPath();g.moveTo(-R*.18,R*.36);g.lineTo(R*.18,R*.36);g.lineTo(0,R*.12);g.closePath();g.fill();g.restore();}
 const wrap=(g,text,x,y,w,lh)=>{const words=text.split(' ');let line='';for(const wd of words){const t=line?line+' '+wd:wd;if(g.measureText(t).width>w&&line){g.fillText(line,x,y);y+=lh;line=wd;}else line=t;}if(line)g.fillText(line,x,y);return y+lh;};
 const SIGIL=tex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);sigil(g,128,128,124,'#f4efe2',BLUE);});
 // a register plaque: lacquered bronze-slate tablet with the Order's sigil, class band, and carved seal-script glyphs
 const CLASSCOL={STILL:'#4a7a5a',SLOWED:'#c08a28',HELD:'#9a2a20',UNWRITTEN:'#1c1a18'};
 function strSeed(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}return h;}
 function plaque(E){const sd=strSeed(String(E.id||'LS'));return tex(512,384,(g,w,h)=>{
  g.fillStyle='#232126';g.fillRect(0,0,w,h);g.strokeStyle=GOLD;g.lineWidth=10;g.strokeRect(10,10,w-20,h-20);
  g.strokeStyle=BLUE;g.lineWidth=4;g.strokeRect(22,22,w-44,h-44);
  sigil(g,78,82,46,GOLD,BLUE);
  g.fillStyle=CLASSCOL[E.cls]||RED;g.fillRect(144,48,w-180,28);
  for(let i=0;i<6;i++)glyph(g,168+i*50,108,34,KRAND.hash(sd,1,i),GOLD,3.2);
  for(let r=0;r<3;r++)for(let i=0;i<8;i++)glyph(g,58+i*56,178+r*56,36,KRAND.hash(sd,10+r,i),'#dfd4b4',2.6);
  for(const [rx,ry] of [[28,28],[w-28,28],[28,h-28],[w-28,h-28]]){g.fillStyle=GOLD;g.beginPath();g.arc(rx,ry,5,0,Math.PI*2);g.fill();}});}
 // a carved lacquered door tablet (a ward, a hall): dark indigo-crimson ground, gilt border, sigil, and seal-script glyphs
 function sign(title,line,bg){const sd=strSeed(String(title||'order')+String(line||''));return tex(512,256,(g,w,h)=>{
  g.fillStyle=bg||'#261c1d';g.fillRect(0,0,w,h);g.strokeStyle=GOLD;g.lineWidth=9;g.strokeRect(9,9,w-18,h-18);
  g.strokeStyle=RED;g.lineWidth=4;g.strokeRect(20,20,w-40,h-40);
  sigil(g,78,h/2,46,GOLD,BLUE);
  for(let i=0;i<6;i++)glyph(g,166+i*54,h/2-34,38,KRAND.hash(sd,2,i),GOLD,3.4);
  for(let i=0;i<7;i++)glyph(g,162+i*46,h/2+38,30,KRAND.hash(sd,3,i),'#dfd4b4',2.4);
  for(const [rx,ry] of [[26,26],[w-26,26],[26,h-26],[w-26,h-26]]){g.fillStyle=GOLD;g.beginPath();g.arc(rx,ry,5,0,Math.PI*2);g.fill();}});}
 // the great containment thangka: the wheel at the centre, the eight seals round it, the keepers in the corners
 const THANGKA=tex(768,1152,(g,w,h)=>{g.fillStyle='#1f3f78';g.fillRect(0,0,w,h);g.fillStyle='#6a2018';g.fillRect(24,24,w-48,h-48);g.fillStyle='#efe2c0';g.fillRect(56,56,w-112,h-112);
  const cx=w/2,cy=h*.46,R=w*.36;
  for(let i=0;i<6;i++){g.strokeStyle=i%2?BLUE:RED;g.lineWidth=6;g.beginPath();g.arc(cx,cy,R*(1-i*.08),0,Math.PI*2);g.stroke();}
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2-Math.PI/2,x=cx+Math.cos(a)*R*.78,y=cy+Math.sin(a)*R*.78;
   g.fillStyle=i===7?'#efe2c0':'#2a2420';g.beginPath();g.arc(x,y,R*.15,0,Math.PI*2);g.fill();g.strokeStyle=GOLD;g.lineWidth=5;g.stroke();
   glyph(g,x,y,R*.2,KRAND.hash(17,i),i===7?'#8a7a60':GOLD,4);}
  // the wheel: a drum of glyph bands
  g.fillStyle=GOLD;g.fillRect(cx-R*.26,cy-R*.4,R*.52,R*.8);g.fillStyle=RED;for(let k=0;k<4;k++){g.fillRect(cx-R*.26,cy-R*.36+k*R*.2,R*.52,R*.08);}
  for(let k=0;k<4;k++)for(let j=0;j<4;j++)glyph(g,cx-R*.18+j*R*.12,cy-R*.25+k*R*.2,R*.09,KRAND.hash(29,k,j),'#fff4c8',2);
  g.fillStyle='#3a2a1a';g.fillRect(cx-6,cy-R*.62,12,R*1.24);
  font(g,40);g.fillStyle=RED;g.textAlign='center';g.fillText('Turn the wheel. Never stop the wheel.',cx,h-150,w-150);
  font(g,26);g.fillStyle='#3a332a';g.fillText('the register of Longsong · eight seals',cx,h-108,w-150);g.textAlign='left';
  sigil(g,130,140,56,'#efe2c0',BLUE);sigil(g,w-130,140,56,'#efe2c0',BLUE);});
 // the glyph band of the Procrastinator: rows of the seal script, white on black (the shader burns them)
 const BAND=tex(2048,256,(g,w,h)=>{g.fillStyle='#000';g.fillRect(0,0,w,h);
  for(let r=0;r<2;r++)for(let i=0;i<24;i++)glyph(g,(i+.5)*w/24,h*(.28+r*.46),h*.36,KRAND.hash(53,r,i),'#fff',5);
  g.fillStyle='#fff';g.fillRect(0,h*.49,w,3);});
 // a seal strip: a paper talisman, a column of glyphs, the Order's sigil at the head
 const SEAL=tex(64,256,(g,w,h)=>{g.fillStyle='#f4ead0';g.fillRect(0,0,w,h);g.fillStyle=RED;g.fillRect(0,0,w,6);g.fillRect(0,h-6,w,6);
  sigil(g,w/2,30,24,'#f4ead0',BLUE);for(let i=0;i<5;i++)glyph(g,w/2,74+i*36,26,KRAND.hash(61,i),INK,2.5);});
 // the dial of the Hall of Hours: twelve bells round a water clock's face, the Order's sigil at its heart
 const DIAL=tex(512,512,(g,w,h)=>{g.fillStyle='#1f3f78';g.beginPath();g.arc(256,256,250,0,Math.PI*2);g.fill();g.fillStyle='#efe6cf';g.beginPath();g.arc(256,256,214,0,Math.PI*2);g.fill();
  g.fillStyle=INK;for(let i=0;i<12;i++){const a=i/12*Math.PI*2-Math.PI/2;glyph(g,256+Math.cos(a)*180,256+Math.sin(a)*180,46,KRAND.hash(71,i),INK,3);}
  sigil(g,256,256,70,'#efe6cf',BLUE);});
 BAND.wrapS=THREE.RepeatWrapping;
 // the library's own when packed (delivered 2026-10-19): the great thangka of the register, the burning glyph band (a
 // mask: white glows); the canvases above stay for ?mat=proc
 const lib=f=>{const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong',f):null;return L?KMAT.textures(L,{aniso:4}).map:null;};
 return {SIGIL,THANGKA:lib('thangka')||THANGKA,BAND:lib('glyphband')||BAND,SEAL,DIAL,plaque,sign,glyph,sigil};})();
// a picture hung or fixed on a face: a quad w x h centred at (x,y,z), facing (nx,nz); its own mesh (a few on the page)
const DECALS=[];
var LS_THANGKA=null;   // the great thangka of the register (64 hangs it; 89y shows it on the festival day)
function lsDecal(map,x,y,z,w,h,nx,nz,o){o=o||{};const g=new THREE.PlaneGeometry(w,h);
 // o.basic: lit by nothing (a sign in the Vault, which the sun never reaches): its own dim tone
 const mat=o.basic?new THREE.MeshBasicMaterial({map,color:o.tone||0x8a8478,transparent:!!o.transparent,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2})
  :new THREE.MeshLambertMaterial({map,transparent:!!o.transparent,side:o.double?THREE.DoubleSide:THREE.FrontSide,emissive:o.glow?0xffffff:0,emissiveMap:o.glow?map:null,emissiveIntensity:o.glow||0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
 const m=new THREE.Mesh(g,mat);if(o.basic)m.userData.vault=true;
 m.position.set(x,y,z);m.rotation.y=Math.atan2(nx,nz);if(!o.basic)m.userData.arch=true;m.userData.host=true;m.userData.inspectLabel=o.label||'a sign of the Order';m.userData.cls='fixture';
 scene.add(m);DECALS.push(m);return m;}
