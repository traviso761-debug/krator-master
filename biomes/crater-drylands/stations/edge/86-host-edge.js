// ================================================================= HOST — station 3, the savannah edge: its build, its views and checks (PLAN-STATIONS.md)
// STATION.build (45) calls EDGE.build from src/88-host-build.js in place of the kit's build alone:
//   1. THE KIT (CRATERDRY.build) as on station 1, on this stage's wetter, oftener-burnt ground.
//   2. TERMITE MOUNDS (core/terrain KSTACKS.mounds, the H10 mound kind): fluted clay spires on a skirt, by 90 m cell from KRAND (world 0xed6e), on
//      the open grass (the kit's `open` zone, not a wash, a kopje or the seep, slope under .3), clear of the kit's trees; their clay the plain's red
//      soil. One merged mesh (vertex colour: the record's clay by the mesh's occlusion); the tall ones registered. Fire runs round them (the mosaic is
//      the kit's: a mound does not burn, and the grass at its foot burns as the ground's age says).
//   3. SW BAY'S UMBRELLA TREES AS KIN (core/biome 32, BIO.kin; EXCHANGES.md, "swbay → crater"): the bay's umbrella thorn and gate baobab, grown by
//      swbay's own builders (its fragments read in place, station.json) with the kin's record: the thorn a little smaller (.8) and the baobab much
//      smaller (.65: the edge is drier than the bay's savannah), both tagged Aw and BSh. By cell from KRAND (the thorn every 75 m, the baobab every
//      260 m, each by a chance on the open grass), clear of the kit's trees and the mounds; heroes near the LOD spine, the bay's far form beyond.
//      The bay's trees do not take the fire's char (their builders know no burn age): a thorn in fresh char stands green, as savannah thorns do.
// ?mounds=0 and ?kin=0 leave either out.
const EDGE=(function(){const Q=new URLSearchParams(location.search),W=0xed6e,E={mounds:[],trees:[],mesh:null};
 const open=(x,z)=>{const Z=CRATERDRY.zones(x,z);return Z.open*(1-Z.wash)*(1-Z.kop)*(1-Z.seep)*(Z.slope<.3?1:0);};
 const nearMound=(x,z,pad)=>E.mounds.some(M=>Math.hypot(x-M.x,z-M.z)<M.R+pad);
 function mounds(){if(Q.get('mounds')==='0'||typeof KSTACKS==='undefined')return 0;const R=TERR.R-200;
  E.mounds=KSTACKS.mounds({id:'edge.mound',world:W,cell:90,p:.22,H:[2.5,7],gap:6,x0:-R,z0:-R,x1:R,z1:R,ground:terrainH,soil:[.61,.40,.31],
   accept:(x,z,r)=>Math.hypot(x,z)<R&&open(x,z)>.55&&!CRATERDRY.blocked(x,z,r+2)});
  const pos=[],col=[],idx=[],c=new THREE.Color();
  E.mounds.forEach(M=>{const m=KSTACKS.mesh(M,{step:.8}),n0=pos.length/3,cl=M.clay||[.6,.4,.3];c.setRGB(cl[0],cl[1],cl[2]).convertSRGBToLinear();
   for(let v=0;v<m.part.length;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);const k=.55+.45*m.occ[v];col.push(c.r*k,c.g*k,c.b*k);}
   for(let i=0;i<m.idx.length;i++)idx.push(n0+m.idx[i]);
   OBSTACLES.push({x:M.x,z:M.z,r:M.R,y0:M.y0-1,y1:M.top});
   if(M.top-M.y0>5)REGISTER({name:'A termite mound',key:'mound',x:M.x,z:M.z,y:M.y0-1,r:M.R*1.1,h:M.top-M.y0+2});});
  if(idx.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
   g.setIndex(idx);g.computeVertexNormals();const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.customProgramCacheKey=()=>'craterdry-mounds';
   const me=new THREE.Mesh(g,mat);me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel='Termite mounds';me.userData.probePoints=[].concat(...E.mounds.map(M=>[M.x,(M.y0+M.top)/2,M.z]));   /* one point a mound in the merged mesh (core/host's probe) */scene.add(me);E.mesh=me;}
  return E.mounds.length;}
 function kinTrees(q){if(Q.get('kin')==='0'||typeof BIO.kin!=='function'||typeof SWBAY==='undefined')return{thorn:0,baobab:0};
  const KIN=[{K:BIO.kin('swbay.thorn',{key:'edgethorn',name:'Umbrella thorn (SW Bay, at the edge)',scale:.8,tags:{koppen:['Aw','BSh']}}),cell:75,p:.42,pad:7,salt:1,n:'thorn'},
   {K:BIO.kin('swbay.baobab',{key:'edgebaobab',name:'Gate baobab (SW Bay, at the edge)',scale:.65,tags:{koppen:['Aw','BSh']}}),cell:260,p:.5,pad:10,salt:2,n:'baobab'}];
  // nwbay's flame-crown at the waterhole (EXCHANGES.md "nwbay → crater", read in place: 48n0..48n9): a planted shade tree, so a few, round the seep
  if(typeof NWBAY!=='undefined'){const F=BIO.kin('nwbay.flamecrown',{key:'edgeflamecrown',name:'Flame-crown (nwbay\'s, planted at the waterhole)',tags:{koppen:['Aw','BSh']}});
   if(F)KIN.push({K:F,cell:60,p:.9,pad:9,salt:3,n:'flamecrown',near:[SEEP.x,SEEP.z,240]});}
  const LOD=BIO.LOD(),R=TERR.R-200,out={};
  for(const k of KIN){out[k.n]=0;if(!k.K)continue;const n=Math.ceil(R/k.cell);   /* k.near [x, z, r]: only round that point (the flame-crowns' waterhole) */
   for(let j=-n;j<n;j++)for(let i=-n;i<n;i++){reseed(KRAND.hash(W,k.salt,i,j));const x=(i+.15+.7*rng())*k.cell,z=(j+.15+.7*rng())*k.cell;
    if(k.near&&Math.hypot(x-k.near[0],z-k.near[1])>k.near[2])continue;
    if(Math.hypot(x,z)>R||rng()>k.p*q*(k.near?Math.max(open(x,z),.6*(1-CRATERDRY.zones(x,z).kop)):open(x,z))||BIO.mask(x,z)<=0)continue;
    if(CRATERDRY.blocked(x,z,k.pad)||nearMound(x,z,k.pad)||E.trees.some(T=>Math.hypot(T.x-x,T.z-z)<T.crownR+k.pad))continue;
    const y=terrainH(x,z),T=k.K.make(x,y,z,{wet:.4,sav:1}),ld=BIO.lodD(x,z),lv=ld<LOD.hero?2:(ld<LOD.mid?1:0);
    k.K.grow(T,lv);T.kin=k.n;E.trees.push(T);out[k.n]++;
    OBSTACLES.push({x,z,r:T.crownR*.6+1,y0:y-3,y1:y+T.H});
    if(lv>0)REGISTER({name:k.K.record.name,key:k.K.record.key,x,z,y:y-1,r:T.crownR*1.1,h:T.H+2});}}
  return out;}
 E.build=function(q){{const D=BIO.kits&&BIO.kits.craterdry&&BIO.kits.craterdry.defs;if(D&&D.bloom)Object.assign(D.bloom,{cap:1000000,capWhy:'the savannah edge: younger, oftener-burnt ground, its mosaic mostly bloom and regrowth (PLAN-STATIONS.md station 3; the instance-cap rule, 2026-11-08): 904,208 at 2026-11-09'});}const out=CRATERDRY.build({R:TERR.R-150,quality:q});
  BIO.cur='edge/mounds';out.mounds=mounds();BIO.cur='edge/kin';out.kin=kinTrees(q);BIO.cur=null;
  /* OWED TO SWBAY'S TURN (KNOWN_ISSUES.md; korona's way): the bay's `leaflet` and `bloom` cards float on the thorn and the baobab for want of a
     structure near them in swbay's own builders (221 of 351 and 121 of 206 here on software GL; ringisles found the same on these two trees), so
     this page's attach audit leaves them to that turn rather than raise its cap. Marked free here only: drawn as they are. ?owed=0 audits them */
  if(Q.get('owed')!=='0'){window._auditOwed=[];[['swbay','leaflet'],['swbay','bloom']].forEach(([k,n])=>{const R=BIO.kits[k],d=R&&R.defs[n];if(d){d.free=true;window._auditOwed.push(k+'.'+n);}});}
  return out;};
 // the views: the grass under the thorns, a baobab, the mounds, the edge from above
 const nearKin=(n,x,z)=>{let b=null,bd=1e9;for(const T of E.trees){if(T.kin!==n||T.lv<2)continue;const d=Math.hypot(T.x-x,T.z-z);if(d<bd){bd=d;b=T;}}return b;};
 E.views=function(h){const V={},c=BIO.center?BIO.center():[0,0],t=nearKin('thorn',c[0],c[1]),b=nearKin('baobab',c[0],c[1]);
  if(t)V['Umbrella thorns over the grass']=h.atTree(t,t.crownR*3.2,.8,2.4,.55);
  if(b)V['A gate baobab at the edge']=h.atTree(b,b.crownR*3.4,2.1,3,.5);
  const f=nearKin('flamecrown',SEEP.x,SEEP.z);if(f)V['Flame-crowns at the waterhole']=h.atTree(f,f.crownR*2.6,2.6,3,.5);
  let M=null;for(const m of E.mounds)if(!M||m.top-m.y0>M.top-M.y0)M=m;
  if(M)V['Termite mounds in the grass']=[M.x+18,h.gh(M.x+18,M.z+11,2.2),M.z+11,M.x,M.y0+(M.top-M.y0)*.5,M.z];
  const K0=KOP[0];V['The waterhole kopje']=h.look(K0.x+K0.r*2.2,K0.z+K0.r*1.4,10,K0.x,K0.z,K0.h*.5);
  V['The savannah edge from above']=h.look(2400,-2300,700,-400,400,0);return V;};
 // the station's checks, each with its broken input (99's negatives)
 const CH={kin:(n)=>({ok:n.thorn>=30&&n.baobab>=3,detail:'umbrella thorns '+n.thorn+', baobabs '+n.baobab+' (SW Bay\'s, as kin)'}),
  mounds:(M)=>{const bad=M.filter(m=>{const Z=CRATERDRY.zones(m.x,m.z);return Z.wash>.5||Z.kop>.5||Z.seep>.5;});
   return{ok:M.length>=40&&!bad.length,detail:M.length+' mounds'+(bad.length?', '+bad.length+' in a wash, on a kopje or at the seep':', all on the open grass')};}};
 E.checks=(add)=>{add('SW Bay\'s umbrella trees grown as kin',CH.kin((window._biome&&window._biome.kin)||{}));add('termite mounds on the open grass',CH.mounds(E.mounds));};
 E.negatives=(add)=>{add('no umbrella trees',CH.kin({thorn:0,baobab:0}));
  const w=CRATERDRY.TREES.find(T=>CRATERDRY.zones(T.x,T.z).wash>.6)||{x:SEEP.x,z:SEEP.z};add('a mound in the wash',CH.mounds(E.mounds.concat([{x:w.x,z:w.z}])));};
 return E;})();
