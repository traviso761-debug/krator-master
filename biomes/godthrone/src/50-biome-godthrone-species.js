// ================================================================= GODTHRONE — the kit: its ground classes, its items, its materials
// The Godthrone and the airless rim (PLAN.md): the first kit where the ground is the whole show. Above the dry-cold line
// nothing grows (section 5: the endoliths and crusts live lower down, from station 3), so the kit's "species" are what lies
// on the ground: the talus blocks under every scarp, the spatter bombs and the spatter round the vent, the stones of the
// floor, and Pele's hair (golden glass threads) caught in the hollows. All glass and rock: core/tags class 'feature'.
// The ground's own colours (the halo's orange and black beads, the spatter, the glassy pit floor, the vent's sublimates,
// hoarfrost) are GODT.GROUND, which the host's painter reads (84-host-ground.js) through GODT.groundAt.
// Engine-independent: everything through BIO (BIOME-API.md); placement in 60, the order in 70.
const GODT={};
BIO.kit('godthrone');
GODT.TAGS={climate:'polar',aridity:'arid',abyssal:false,riparian:'no',koppen:['O']};
GODT.SPECIES=[];   // nothing grows at the summit (PLAN.md section 5)
// ---------------------------------------------------------------- the ground classes (sRGB; PLAN.md sections 3-4)
GODT.GROUND={
 beadOrange:{col:0xc8641e,name:'Orange glass beads (the halo, quenched fountain glass)'},
 beadBlack:{col:0x1a1817,name:'Black glass beads (the halo, crystallised droplets)'},
 basalt:{col:0x24222a,name:'Titanium basalt (black, an ilmenite sheen)'},
 spatter:{col:0x3a2620,name:'Spatter and cinder (the rampart and the cones)'},
 spatterRed:{col:0x6e2c1c,name:'Oxidised spatter (the vent\'s hot gases reddened it)'},
 glass:{col:0x121216,name:'The pit\'s floor: a frozen lava lake, glassy'},
 sublimate:{col:0xd8c26a,name:'Sublimates round the vent (sulphur and salts from its gases)'},
 frost:{col:0xdfe6ee,name:'Hoarfrost (grown from the thin air on shaded rock)'},
 /* the new stations' classes (2026-11-04; the host's fields palag..crust, 0 where a station has none) */
 palag:{col:0xb07a34,name:'Palagonite (the bead glass altered by meltwater under the dry-cold line: ochre)'},
 ice:{col:0xbfd2de,name:'Glacier ice (cold-based; under rubble on the debris-covered tongues)'},
 rust:{col:0x8e2a14,name:'Rust (iron oxide from the brine: it rusts the moment it meets the air)'},
 breccia:{col:0x6d6a66,name:'Megabreccia (the crater\'s patchwork rock: blocks of every rock in a grey matrix)'},
 snow:{col:0xeef2f6,name:'Snow and firn'},
 tuff:{col:0xcfc3a8,name:'Pale ash and ignimbrite (the summit\'s ash, carried downwind to the south-east)'},
 pave:{col:0x5c544b,name:'Desert pavement and sand-wedge polygons (the regolith, wind-sorted)'},
 crust:{col:0x2e2a22,name:'Lichen crusts (black and orange, on the lee of the stones)'}};
// the ground's weights at a point, from the host's fields (BIO.host.fields): {orange, black, spatter, glass, sublimate, frost}
// (0..1 each; the rock is what shows where none of them does)
GODT.groundAt=function(x,z,o){const F=BIO.host.fields,{smooth,clamp}=BIO.fn;o=o||{};
 const halo=F.halo(x,z),or=F.orange(x,z),ra=F.rampart(x,z),v=F.vent(x,z);
 o.orange=halo*or;o.black=halo*(1-or);o.spatter=ra*(1-.5*halo);o.sublimate=clamp(smooth(.55,.95,v)*(1-.4*F.slope(x,z)),0,1)*.8;
 o.glass=F.glass?F.glass(x,z)*(1-halo*.7)*(1-ra):0;   /* the cones and the rampart are spatter, not the lake's glassy skin */o.frost=F.frost(x,z);
 for(const q of GODT.EXTRA)o[q]=F[q]?F[q](x,z):0;return o;};
GODT.EXTRA=['palag','ice','rust','breccia','snow','tuff','pave','crust'];
// ---------------------------------------------------------------- the items
// tints (sRGB): the basalt's blacks, a rusty block now and then (an oxidised flow top), the bombs' glass skin
GODT.PAL={basalt:[0x2a2826,0x232124,0x1e1d1f,0x302c2a],rubble:[0x433c37,0x383431],oxid:[0x5a2e22,0x6a3626],bomb:[0x141315,0x1b1918,0x221c1a],
 hair:[0xd9a441,0xe8bd5c,0xc8902e],endo:[0x3d5a2a,0x46632f,0x2f4a26,0x1e2a1c],
 breccia:[0x6d6a66,0x8a8780,0x9a4430,0x232124,0xbdb6a6,0x75716c]};
(function(){const T3=BIO.host.THREE,K=KRAND,S=0x60D7;
 // a block: an icosahedron with its vertices pushed in and out by a hash of the vertex (a fresh angular fragment of a flow)
 const block=(det,seed,flat)=>{const g=new T3.IcosahedronGeometry(1,det),p=g.attributes.position,key=new Map();
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=Math.round(x*1e3)+','+Math.round(y*1e3)+','+Math.round(z*1e3);
   let f=key.get(k);if(f==null){f=.72+.5*K.unit(K.hash(seed,key.size,0xB10C));key.set(k,f);}
   p.setXYZ(i,x*f,y*f*(flat==null?.78:flat),z*f);}
  g.computeVertexNormals();return g;};
 // a spatter bomb: a spindle, its ends twisted into tails (it spun in flight)
 const bomb=()=>{const g=new T3.SphereGeometry(1,10,6),p=g.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.abs(x),tw=x*.9;
   const r=Math.pow(1-a*a,.65)*(1-.15*a),ny=y*r*.55,nz=z*r*.55;p.setXYZ(i,x*1.15,ny*Math.cos(tw)-nz*Math.sin(tw),ny*Math.sin(tw)+nz*Math.cos(tw));}
  g.computeVertexNormals();return g;};
 const M=GODT.MAT={rock:BIO.solidMat(null),bomb:BIO.solidMat(null),hair:BIO.leafMat(null,'godt-hair',{})};
 M.rock.userData.godt='rock';M.bomb.userData.godt='bomb';
 BIO.def('boulder',block(1,S+1),M.rock,{label:'Talus blocks (titanium basalt, fallen from the scarps)',cls:'feature',kind:'rock'});
 BIO.def('stone',block(0,S+2,.7),M.rock,{label:'Stones on the floor (wind-faceted in the thin air)',cls:'feature',kind:'rock'});
 BIO.def('bomb',bomb(),M.bomb,{label:'Spatter bombs (glass-skinned, from the fountains)',cls:'feature',kind:'rock'});
 BIO.def('splat',block(1,S+3,.28),M.bomb,{label:'Spatter (clots of lava that landed molten)',cls:'feature',kind:'rock'});
 /* THE ENDOLITHS (PLAN.md section 5; the orange belt and below, to ~9 km): a stone split by frost, its broken face showing the green
    band a few mm under the glass skin. The stone a half block (its flat face the split), the band a thin plate on that face */
 /* THE BAND (the owner, 2026-11-15: "a flat green square on the back of the rocks"): it was a box 0.45 x 0.72 of the stone, stuck on the middle of
    the break, which drew as a green rectangle on a black stone. The band lies a few mm under the skin, so on a break it shows as a line just inside
    the break's edge, all round. The break is now a plane (x = 0: frost splits along one), and the band a ring cut from the break's own outline (its
    boundary edges, inset toward their centre: .93 to .85 of the way out), 6 mm proud of it in the stone's frame; put with the stone's own position,
    turn and scale (60-biome-godthrone-ground.js) so it stays on the break */
 const half=(det,seed)=>{const g=block(det,seed,.8),p=g.attributes.position;for(let i=0;i<p.count;i++)if(p.getX(i)>0)p.setX(i,0);g.computeVertexNormals();return g;};
 const band=(src,o0,o1,dx)=>{const p=src.attributes.position,E=new Map(),pt={},key=(y,z)=>Math.round(y*1e4)+','+Math.round(z*1e4);
  for(let i=0;i<p.count;i+=3){if(p.getX(i)<-1e-6||p.getX(i+1)<-1e-6||p.getX(i+2)<-1e-6)continue;   /* a triangle of the break */
   for(let k=0;k<3;k++){const a=i+k,b=i+(k+1)%3,ka=key(p.getY(a),p.getZ(a)),kb=key(p.getY(b),p.getZ(b));if(ka===kb)continue;pt[ka]=[p.getY(a),p.getZ(a)];pt[kb]=[p.getY(b),p.getZ(b)];
    const e=ka<kb?ka+'|'+kb:kb+'|'+ka;E.set(e,(E.get(e)||0)+1);}}
  const nb={};E.forEach((n,e)=>{if(n!==1)return;const ab=e.split('|');(nb[ab[0]]||(nb[ab[0]]=[])).push(ab[1]);(nb[ab[1]]||(nb[ab[1]]=[])).push(ab[0]);});
  const s0=Object.keys(nb)[0],loop=[s0];let prev=null,cur=s0;for(let n=0;n<999;n++){const nx=(nb[cur]||[]).find(q=>q!==prev);if(nx==null||nx===s0)break;loop.push(nx);prev=cur;cur=nx;}
  if(loop.length<3)throw new Error('godthrone: the split stone has no break outline');
  let cy=0,cz=0;loop.forEach(k=>{cy+=pt[k][0];cz+=pt[k][1];});cy/=loop.length;cz/=loop.length;
  const at=(k,f)=>[dx,cy+(pt[k][0]-cy)*f,cz+(pt[k][1]-cz)*f],pos=[],nor=[],uv=[];
  const tri=(a,b,c)=>{/* wound to face +x, the break's side */const nx=(b[1]-a[1])*(c[2]-a[2])-(b[2]-a[2])*(c[1]-a[1]);
   const q=nx<0?[a,c,b]:[a,b,c];q.forEach(v=>{pos.push(v[0],v[1],v[2]);nor.push(1,0,0);uv.push(v[2]*.5+.5,v[1]*.5+.5);});};
  for(let i=0;i<loop.length;i++){const k0=loop[i],k1=loop[(i+1)%loop.length],A=at(k0,o1),B=at(k1,o1),Ci=at(k1,o0),D=at(k0,o0);tri(A,B,Ci);tri(A,Ci,D);}
  const g=new T3.BufferGeometry();g.setAttribute('position',new T3.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T3.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T3.Float32BufferAttribute(uv,2));return g;};
 const splitG=half(1,S+5),bandG=band(splitG,.85,.93,.006);
 M.endo=BIO.solidMat(null);M.endo.userData.godt='endolith';M.endo.polygonOffset=true;M.endo.polygonOffsetFactor=-1;M.endo.polygonOffsetUnits=-2;
 BIO.def('splitstone',splitG,M.rock,{label:'Split stones (frost-split; the endolith band in the break)',cls:'feature',kind:'rock'});
 BIO.def('endolith',bandG,M.endo,{label:'The endolith band (Krator\'s own life in the glass: a green band a few mm under the surface)',cls:'feature',kind:'life'});
 /* VENTIFACTS (PLAN.md section 4, the airless rim): stones the thin wind's sand faceted and polished, keeled where two faces meet */
 const vent=()=>{const g=block(0,S+6,.55),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);if(y>0)p.setY(i,y*.6+Math.abs(x)*.25);}g.computeVertexNormals();return g;};
 BIO.def('ventifact',vent(),M.rock,{label:'Ventifacts (stones faceted and polished by the thin wind\'s sand)',cls:'feature',kind:'rock'});
 BIO.def('hair',BIO.geo.mat(),M.hair,{label:'Pele\'s hair (golden glass threads, caught in the hollows)',cls:'feature',kind:'glass'});
 GODT.LIB=BIO.libSwap('godthrone',M);   /* the library's maps (materials.json): the basalt's grain, the bombs' crust, the hair's card */
})();
