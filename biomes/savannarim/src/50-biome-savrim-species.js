// ================================================================= SAVANNARIM — species (data + kit items)
// The savannah rims (biomes/hyperjungle/PLAN-LANDS.md sections 4 and 5): the savannah's base for all three savannahs (hyperjungle N's
// abyssal savannah, the e rim, the se rim), each land re-tinting and re-weighting it. 0.6 to 1 km above the jungle floor at 1.7-1.9 atm,
// under monsoon rains: tall grass, the fire mosaic, termite cathedrals, gallery forest, fan palms. The base's own species are here; the
// rest is read in place from the neighbours (the hyperjungle's six for the gallery forest and the outliers, swbay's umbrella thorn, the
// north's bone giants and bloodwood; the rims' cousins by BIO.kin, 55). Everything here is DATA and kit definitions; no placement (the
// host's 87 places: a builder draws a record, the host decides where).
//   redoat      red oat grass (Themeda triandra): a tussock 2-3 m in the dense air, green in the rains, red-bronze, then straw
//   blindgrass  blind grass (Pennisetum purpureum): cane-grass 5-8 m, too dense to see through (the raiders' grass); mostly the north
//   thorn       the umbrella thorn (Vachellia tortilis), 10-22 m in the dense air: swbay's kind, the kit's own builder (swbay's, read in
//               place, fails the attachment audit: its crown's disc of loose cards; KNOWN_ISSUES.md)
//   borassus    the fan palm (Borassus aethiopum): 30-40 m, its trunk swollen halfway up, a crown of stiff fans; scattered stands
// Species are appended (the e rim's and the se rim's, 52 and 53): an index is never reused.
BIO.kit('savannarim');
const SAVRIM={};
SAVRIM.TAGS={climate:'tropical',aridity:'subhumid',abyssal:false,riparian:'no',koppen:['Aw','Am','XV']};
{const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});SAVRIM.HV=HV;
 const T=o=>Object.assign({},SAVRIM.TAGS,o);
 SAVRIM.SPECIES=[
  {key:'redoat',name:'Red oat grass',H:[2,3],kind:'grass',lands:['north','east','southeast'],tags:T({fire:'carrier',harvest:HV('none',[],false,'Grazing and thatch. Green in the rains, then red-bronze, then straw; it burns every two to four years.'),earth:'Themeda triandra'})},
  {key:'blindgrass',name:'Blind grass',H:[5,8],kind:'grass',lands:['north'],tags:T({fire:'carrier',harvest:HV('none',[],false,'Fodder, thatch and screening walls. Too dense to see through: the raiders\' grass.'),earth:'Pennisetum purpureum (elephant grass)'})},
  {key:'thorn',name:'Umbrella thorn',H:[10,22],rb:[.35,.6],kind:'tree',lands:['north','east','southeast'],tags:T({fire:'resister',harvest:HV('fuel, fencing (the thorny boughs)',['pods (fodder, famine)'],true,'The flat-topped thorn of the open savannah, at the dense air\'s size. The pods feed the herds; the gum is a sweet.'),earth:'Vachellia tortilis'})},
  {key:'borassus',name:'Fan palm',H:[30,40],rb:[.5,.65],kind:'palm',lands:['north','east','southeast'],tags:T({fire:'resister',harvest:HV('fronds (thatch, mats)',['palm wine (the tapped sap)','fruit (fibrous, orange)'],false,'The trunk swells halfway up, under a crown of stiff fans; in scattered stands.'),earth:'Borassus aethiopum'})}];
 SAVRIM.byKey={};SAVRIM.SPECIES.forEach(S=>{SAVRIM.byKey[S.key]=S;});}
// ---------------------------------------------------------------- materials (the library's when the pack carries them)
// grass: card.grass.dry (one plant of its sheet, materials.json `grass`) for the red oat grass, card.rankgrass (`blind`) for the blind grass
// (a stand-in: card.grass.elephant is owed, PROMPTS-NEEDED.md section 37); the fan palm's fronds card.palm (`fan`, base bottom), its trunk
// bark.palm (`palmbark`). Without a pack (the open world): painted stand-ins (BIO.alphaTex), the same instance colours.
{const LIB=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('savannarim',n):null,TH=BIO.host.THREE;
 const card=(n,m)=>{const L=LIB(n);if(!L)return null;let t=KMAT.textures(L,{aniso:4,flipY:false}).map;
  if(L.cell){const src=t;t=src.clone();if(!src.image)(src._onImage=src._onImage||[]).push(img=>{t.image=img;t.needsUpdate=true;});const c=L.cell;t.offset.set(c[0],c[1]);t.repeat.set(c[2]-c[0],c[3]-c[1]);}
  if(m&&(L.base||L.stems))m.userData.libCard={base:L.base||null,stems:L.stems||null,rise:L.rise==null?null:L.rise};
  t.generateMipmaps=true;t.minFilter=TH.LinearMipmapLinearFilter;t.magFilter=TH.LinearFilter;return t;};
 const LQ=typeof location!=='undefined'?new URLSearchParams(location.search):null,off=k=>LQ&&LQ.get(k)==='0';
 const GT=off('groundtint')?null:{k:.3,gain:.36,fade:[1500,2100]},SN=off('season')?null:{colour:0xc8a860,k:.85,stagger:.5};
 // painted stand-ins: blades from the root at the canvas's top row (a DataTexture: row 0 is v 0)
 const blades=(n,col,bend)=>BIO.alphaTex(128,(g,S)=>{for(let k=0;k<n;k++){const x0=S*(.1+.8*((k*.6180339)%1)),h=S*(.55+.45*((k*.4142)%1)),lean=S*bend*(((k*.7321)%1)-.5);
   g.strokeStyle=col[k%col.length];g.lineWidth=1.5+(k%3);g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+lean*.3,h*.55,x0+lean,h);g.stroke();}},[150,130,80]);
 const M=SAVRIM.MAT={
  grass:BIO.leafMat(null,'redoat',{swayW:'(position.y)',swayA:.13,alphaTest:.4,ground:GT,season:SN}),
  blind:BIO.leafMat(null,'blindgrass',{swayW:'(position.y)',swayA:.09,alphaTest:.4,ground:GT,season:SN?{colour:0xb8a060,k:.6,stagger:.5}:null}),
  fan:BIO.leafMat(null,'borassusfan',{swayW:'(position.x)',swayA:.04,alphaTest:.4}),
  pod:BIO.leafMat(null,'savrimpod',{swayW:'(-position.y)',swayA:.3,alphaTest:0,vertexColors:true}),
  thorn:BIO.leafMat(null,'thornleaf',{aN:true,swayW:'1.0',swayA:.1,alphaTest:.4,season:SN?{drop:.35,colour:0x9a8a48,k:.4}:null})};
 const tg=card('grass',M.grass),tb=card('blind',M.blind),tf=card('fan',M.fan);
 M.grass.map=tg||blades(40,['#c8b070','#b89a58','#d8c080','#a88a48'],.25);M.blind.map=tb||blades(30,['#8a9a50','#7a8a40','#9aa860','#6a7a3a'],.12);
 M.fan.map=tf||BIO.alphaTex(128,(g,S)=>{g.fillStyle='#5a7a3a';for(let k=0;k<21;k++){const a=-1.2+k/20*2.4;g.save();g.translate(S/2,0);g.rotate(a*.5);g.fillRect(-1.5,0,3,S*.95);g.restore();}},[70,96,50]);
 /* the umbrella thorn's leaflets: a painted stand-in (the library's card.acacia wants its stems: the GPU pass wires it) of fine pinnate
    sprays, its flat crown made of them */
 M.thorn.map=BIO.alphaTex(128,(g,S)=>{for(let k=0;k<7;k++){const x0=S*(.12+.76*k/6),y0=S*.08;g.strokeStyle='#4a5a2a';g.lineWidth=1.2;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+S*.04,S*.9);g.stroke();
   for(let j=0;j<16;j++){const y=y0+j*S*.05,x=x0+S*.04*j/16;g.fillStyle=['#6a7a3a','#5a6a30','#7a8a44'][j%3];g.fillRect(x-S*.05,y,S*.045,S*.018);g.fillRect(x+S*.006,y,S*.045,S*.018);}}},[90,100,52]);
 [M.grass,M.blind,M.fan,M.thorn].forEach(m=>{m.alphaTest=.4;m.needsUpdate=true;});
 SAVRIM.LIBSTATE={grass:!!tg,blind:!!tb,fan:!!tf};
 const PB=LIB('palmbark');M.palmbark=BIO.barkMat(PB?KMAT.textures(PB,{aniso:8}).map:null);
 BIO.bucket('palmtrunk',M.palmbark,{label:'Fan palm trunks',uvScale:PB&&PB.scale?PB.scale:[3,4]});}
// ---------------------------------------------------------------- the items
// a TUSSOCK: three crossed cards from the root (v 0) up to y 1, as the abyss's tufts (eastabyss G.tuft's shape, its own copy of four
// lines: a kit's own geometry); the blind grass on five taller, narrower cards (a cane-grass stand)
SAVRIM.G={};
SAVRIM.G.tuft=function(n,w){const pos=[],uv=[],nor=[];n=n==null?3:n;w=w==null?1:w;
 for(let k=0;k<n;k++){const a=k/n*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);
  const P=[[-.5*w,0],[.5*w,0],[.5*w,1],[-.5*w,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]/w+.5,q[1]]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
BIO.def('redoat',SAVRIM.G.tuft(3,1),SAVRIM.MAT.grass,{label:'Red oat grass',kind:'redoat',tags:SAVRIM.byKey.redoat.tags,
 cap:700000,capWhy:'the savannah\'s grass is the page (as the hyperjungle\'s savanna station, the owner 2026-11-08): two tussocks a 3.5 m cell near, two a 7 m cell mid, one a 14 m cell far, over the open grass and the dambos'});
BIO.def('blindgrass',SAVRIM.G.tuft(5,.55),SAVRIM.MAT.blind,{label:'Blind grass (cane-grass, 5-8 m)',kind:'blindgrass',tags:SAVRIM.byKey.blindgrass.tags,
 cap:900000,capWhy:'the north savannah is blind grass to the horizon (PLAN-LANDS.md section 3): a stand a 4 m cell near, a 9 m cell mid, a 16 m cell far, over the open grass'});
BIO.def('thornleaf',BIO.geo.clump(),SAVRIM.MAT.thorn,{attrs:['aN'],label:'Umbrella thorn leaflets',kind:'thorn'});
BIO.bucket('thornbark',BIO.barkMat(null),{label:'Umbrella thorn bark (vertex colour)',uvScale:[2,3]});
BIO.def('borassusfan',BIO.geo.frond(3),SAVRIM.MAT.fan,{label:'Fan palm fronds',kind:'borassus'});
BIO.def('borassusfruit',BIO.geo.pod(),SAVRIM.MAT.pod,{label:'Fan palm fruit',kind:'borassus',onLeaf:true});
