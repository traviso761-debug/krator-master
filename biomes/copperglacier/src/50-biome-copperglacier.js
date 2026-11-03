// ================================================================= COPPER GLACIER — species (data + kit items)
// The alpine cryosphere of the southern Crook (PLAN.md): glaciers over gneiss and granite, a turquoise tarn, the copper of the eastern pass. Cold, wet,
// young ground: the moraines a few centuries bare, the tundra on them thin. Its life is Krator's cold lineage and the metal ground's (PLAN.md section 3):
//   FROST CORAL       the one woody plant: a branching coral of stiff fleshy limbs, 1.5-4.5 m, ice-blue to verdigris, its tips iridescent (the Rift's
//                     rule, the cold kin of the Throne's gill-corals); limbs grown as polylines, each joined to its parent by BIO.flareJoin
//   VERDIGRIS CUSHION a hard dome of tiny leaves; a metallophyte, it greens toward verdigris on copper ground
//   COPPER FLOWER     a mauve-violet spike over a basal rosette: the prospector's plant, only on copper ground (the resource data's)
//   LICHEN, MOSS, SEDGE  plates on the boulders; mats and tufts on the wet ground
// Everything here is DATA and kit definitions; no placement (60). Tags follow the project rule (climate / aridity / abyssal / riparian / Koppen).
BIO.kit('copperglacier');   // this kit's own registry of items and buckets (core/biome: kits)
var COPPERG={};
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=h=>new T3.Color(h);COPPERG.C=C;
COPPERG.TAGS={climate:'polar',aridity:'humid',abyssal:false,riparian:'both',koppen:['ET','EF','Dfb']};
// the classes of the region on scale model 5.1 (read 2026-11-03; PLAN.md section 1): shares by area of the polygon with air, the airless rim left out
COPPERG.KOPPEN={ET:.33,EF:.30,HF:.18,HT:.13,Dfb:.06};

// ---------------------------------------------------------------- palettes
const PAL=COPPERG.PAL={
 coral:[0x9cc8d8,0xa8d4dc,0x8cbccc,0xb4d8e0],coralCu:[0x6fb8a0,0x7cc4a8,0x62a894,0x88ccb0],   /* ice-blue; verdigris on copper ground */
 coralTip:[0xd8f0f4,0xe4f4f0,0xccecf0],tipIrid:[0x9a80f0,0x60e0c8,0xf0a0d0,0x80c8ff],
 cushion:[0x8a9a6a,0x96a474,0x7c8e60,0xa0ac7c],cushionCu:[0x5e9a7c,0x6aa486,0x548e72],
 cuflower:[0xb07ac8,0xbc88d2,0xa46cbc,0xc898dc],
 lichen:[0xd88a3a,0xe0a040,0xc8c060,0xb8bca8,0xd0d4c4],moss:[0x6e8a3a,0x7a9644,0x5e7a32,0x8aa04e],sedge:[0x9a9468,0xa8a072,0x8c8660],
 granite:[0x9a948c,0x8e8a84,0xa6a098,0x84807a],gneiss:[0x8a8680,0x96908a,0x7a7670],malachite:[0xd8ece0,0xe4f2ea,0xcce4d6],gossan:[0xf0dccc,0xe8d0bc,0xf4e4d6],   /* tints over the library's own colours (rock.malachite, rock.gossan) */
};
COPPERG.vary=(c,h,s,l)=>{const o=c.clone?c.clone():C(c);o.offsetHSL(rr(-h,h),rr(-s,s),rr(-l,l));return o;};

// ---------------------------------------------------------------- the small plants, tagged (60 places them; the inspector reads `items`)
const HV=(use,food,med,note)=>({use:use||'none',food:food||[],medicinal:!!med,note:note||''});
const K=(c,a,r,kp,o)=>Object.assign({climate:c,aridity:a,abyssal:false,riparian:r,koppen:kp},o||{});
const PK=(name,c,a,r,kp,items,hv,o)=>({name,tags:Object.assign(K(c,a,r,kp,o),{harvest:hv||HV()}),items});
COPPERG.PLANTS={
 frostcoral:PK('Frost coral','polar','humid','both',['ET','Dfb'],['coraltip'],HV('none',[],false,'A coral of stiff fleshy limbs, ice-blue, the tips catching every colour at a slant; Krator\'s cold lineage, kin of the Throne\'s gill-corals. On copper ground its limbs green to verdigris.'),{alien:true}),
 cushion:PK('Verdigris cushion','polar','humid','no',['ET','EF'],['cushion'],HV('fuel (dried)',[],false,'A hard dome of tiny leaves packed against the wind. It takes up copper: on the copper ground it is verdigris, elsewhere sage.'),{metallophyte:true}),
 copperflower:PK('Copper flower','polar','humid','no',['ET'],['copperflower'],HV('none',[],false,'A mauve-violet spike over a rosette, as Earth\'s copper flowers grow on the ore: where it flowers, the copper is under it. Prospectors follow it.'),{metallophyte:true,indicator:'copper'}),
 lichen:PK('Rock lichen','polar','humid','no',['ET','EF','HT'],['lichen'],HV('dye (orange)',[],false,'Plates and rosettes on the boulders and the rock: orange, sulphur and a pale grey that is faintly iridescent.')),
 moss:PK('Moss','polar','humid','yes',['ET','Dfb'],['mossmat'],HV()),
 sedge:PK('Sedge','polar','humid','yes',['ET','Dfb'],['sedge'],HV('thatch',[],false,'')),
 stones:PK('Moraine stones','polar','humid','no',['ET','EF','HT'],['stone','boulder','malachite','gossan'],HV('none',[],false,'The moraine\'s boulders, gneiss and granite; on the copper ground green malachite and rusty gossan.')),
};
COPPERG.plantOfItem=item=>{for(const k in COPPERG.PLANTS)if(COPPERG.PLANTS[k].items.indexOf(item)>=0)return COPPERG.PLANTS[k];return null;};

// ---------------------------------------------------------------- textures (the procedural fallbacks: a page with the kit's pack takes the library's)
const card=(S,fn)=>BIO.alphaTex(S,g=>fn(g,S,S),[255,255,255]);
const TX={
 lichen:card(128,(g,w)=>{for(let i=0;i<40;i++){g.fillStyle='rgba(255,255,255,'+rr(.5,1)+')';g.beginPath();g.arc(rr(16,w-16),rr(16,w-16),rr(4,14),0,TAU);g.fill();}}),
 moss:card(128,(g,w)=>{for(let i=0;i<900;i++){g.fillStyle='rgba(255,255,255,'+rr(.4,1)+')';g.fillRect(rr(8,w-8),rr(8,w-8),rr(1,3),rr(1,3));}}),
 sedge:card(128,(g,w,h)=>{g.strokeStyle='#fff';for(let i=0;i<26;i++){g.lineWidth=rr(1,2.5);const x=rr(30,w-30);g.beginPath();g.moveTo(x,h);g.quadraticCurveTo(x+rr(-12,12),h*.5,x+rr(-30,30),rr(4,30));g.stroke();}}),
 spike:card(128,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(w/2-1.5,h*.35,3,h*.65);for(let i=0;i<30;i++){const y=rr(6,h*.55);g.beginPath();g.arc(w/2+rr(-9,9)*(1-y/h),y,rr(3,6),0,TAU);g.fill();}
  for(let i=0;i<7;i++){g.beginPath();g.ellipse(w/2+rr(-26,26),h-rr(4,14),rr(10,18),rr(3,6),rr(-.5,.5),0,TAU);g.fill();}}),
};
const grey=(n,seed)=>BIO.canvasTex(n,n,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;for(let i=0;i<w*h;i++){const v=200+(h3(i%w,(i/w)|0,seed)-.5)*60;d[i*4]=d[i*4+1]=d[i*4+2]=clamp(v,0,255);d[i*4+3]=255;}g.putImageData(id,0,0);});

// ---------------------------------------------------------------- materials (BIO.libSwap gives each slot its library map: materials.json)
const M=COPPERG.MAT={
 'bark.coral':BIO.iridBarkMat(grey(128,11),'copperg-coral',[1.0,1.03,1.04],[1.08,.98,1.12]),
 tip:BIO.leafMat(null,'coraltip',{irid:true,swayW:'0.0',swayA:0,alphaTest:0}),
 solid:BIO.solidMat(null,0xffffff),
 'rock.granite':BIO.solidMat(grey(128,12)),'rock.malachite':BIO.solidMat(grey(128,13)),'rock.gossan':BIO.solidMat(grey(128,14)),
 lichen:BIO.leafMat(TX.lichen,'lichen',{swayW:'0.0',swayA:0,alphaTest:.4}),
 moss:BIO.leafMat(TX.moss,'mossmat',{swayW:'0.0',swayA:0,alphaTest:.3}),
 sedge:BIO.leafMat(TX.sedge,'sedge',{swayW:'(position.y)',swayA:.1,alphaTest:.4}),
 spike:BIO.leafMat(TX.spike,'spike',{swayW:'(position.y)',swayA:.05,alphaTest:.4}),
};
COPPERG.SWAP=BIO.libSwap('copperglacier',M);
BIO.bucket('coral',M['bark.coral'],{label:'Frost coral (limbs)',uvScale:[1.2,2.4]});

// ---------------------------------------------------------------- geometries local to this kit
const G=COPPERG.G={
 // n crossed vertical quads, base at y 0, 1 tall and 1 wide: the floor cards
 cross(n){const pos=[],uv=[],nor=[];for(let k=0;k<n;k++){const a=k/n*Math.PI,c=Math.cos(a)*.5,s=Math.sin(a)*.5;
  pos.push(-c,0,-s, c,0,s, c,1,s, -c,0,-s, c,1,s, -c,1,-s);uv.push(0,1,1,1,1,0,0,1,1,0,0,0);for(let i=0;i<6;i++)nor.push(0,1,0);}return BIO.geo._make(pos,nor,uv);},
 // a flat card lying on the ground (lichen plates), facing up
 flat(){const pos=[-.5,0,-.5, .5,0,-.5, .5,0,.5, -.5,0,-.5, .5,0,.5, -.5,0,.5],uv=[0,0,1,0,1,1,0,0,1,1,0,1],nor=[];for(let i=0;i<6;i++)nor.push(0,1,0);return BIO.geo._make(pos,nor,uv);},
 // a rock: an icosahedron, each vertex pushed in or out together (the faces stay closed), flattened a little
 rock(seed){const g=new T3.IcosahedronGeometry(1,1),p=g.attributes.position,J={};reseed(seed);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=x.toFixed(3)+','+y.toFixed(3)+','+z.toFixed(3);if(!J[k])J[k]=rr(.78,1.12);const s=J[k];p.setXYZ(i,x*s,y*s*.72,z*s);}
  g.computeVertexNormals();return g;},
 // a cushion: a low dome, its rim tucked under
 cushion(){const g=new T3.SphereGeometry(1,10,5,0,TAU,0,Math.PI*.58);g.scale(1,.62,1);return g;},
};

// ---------------------------------------------------------------- instanced items
BIO.def('coraltip',BIO.geo.pod(),M.tip,{attrs:['aC2'],label:'Frost coral (tips)'});
BIO.def('cushion',G.cushion(),M.solid,{label:'Verdigris cushions'});
BIO.def('copperflower',G.cross(2),M.spike,{label:'Copper flowers'});
BIO.def('lichen',G.flat(),M.lichen,{label:'Rock lichen'});
BIO.def('mossmat',BIO.geo.mat(),M.moss,{label:'Moss'});
BIO.def('sedge',G.cross(3),M.sedge,{label:'Sedge'});
BIO.def('stone',G.rock(8101),M['rock.granite'],{label:'Moraine stones'});
BIO.def('boulder',G.rock(8102),M['rock.granite'],{label:'Moraine boulders (gneiss and granite)'});
BIO.def('malachite',G.rock(8103),M['rock.malachite'],{label:'Malachite-stained boulders (the copper ground)'});
BIO.def('gossan',G.rock(8104),M['rock.gossan'],{label:'Gossan (the rusty cap over the copper\'s sulphides)'});
})();
