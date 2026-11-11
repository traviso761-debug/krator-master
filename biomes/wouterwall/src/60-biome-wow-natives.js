// ================================================================= WOW — the bench's own plants, placed (the puya spike)
// The dry bench's puya (46: WOW.PUYA, 50: its items): rosettes on the dry, sunny (north-facing) slopes and the old runouts' hummocks where the
// annual mean lies between -4.5 and +4.5 °C (the bench at about 4-5 km: stations 2 and 3; none on the loess tablelands, station 1, nor at the
// edge, station 4), never in water, on a wall, in a field or in a stack. A share of them in their century bloom, the spike standing out of
// the rosette. A lattice of cells, each cell's draws its own (reseeded from KRAND.hash(the world, the salt, i, j)): nothing else placed moves
// it. Its own loop, not NWOW.place: the NW outer wall's functions run in that kit's registry, and these items are this kit's.
WOW.buildNatives=function(R,q){q=q==null?1:q;const st={puya:0,bloom:0,at:[]},P=WOW.PUYA,{rr,rng,reseed,TAU}=BIO.fn,qEuler=BIO.qEuler||BIO.fn.qEuler;
 const zs=new Set(P.zones),N=Math.ceil(R*2/P.cell),seed=WOW.seed==null?5200:WOW.seed;
 const accept=(x,z)=>{const Z=WOW.zoneAt?WOW.zoneAt(x,z):WOW.at(x,z).zone;if(!zs.has(Z))return 0;
  const F=WOW.FIELDS(x,z);if(F.water||F.field||F.pillar||F.g>.75||F.mean<P.mean[0]||F.mean>P.mean[1]||F.sunny<P.sunny)return 0;
  return P.p*q*(.4+.6*Math.max(0,F.sunny));};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){reseed(KRAND.hash(seed,0x9A1,i,j));const x=-R+(i+rng())*P.cell,z=-R+(j+rng())*P.cell,u=rng();
  if(x*x+z*z>R*R||u>=accept(x,z)||BIO.mask(x,z)<=.9||!BIO.clearOf(x,z,1.6))continue;const y=BIO.terrainH(x,z);
  const s=rr(.8,1.25),w=rr(2.2,3.2)*s,h=rr(1.6,2.4)*s,v=Math.round(rr(222,250)),c=(v<<16)|(v<<8)|(v-4);
  BIO.put('puya',[x,y-.1,z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[w,h,w],c);st.puya++;
  if(rng()<P.bloom){const H=rr(8,12);BIO.put('puyaspike',[x,y+h*.45,z],qEuler(rr(-.03,.03),rr(0,TAU),rr(-.03,.03)),[H*.11,H,H*.11],c);st.bloom++;if(st.at.length<8)st.at.push([x,z]);}}
 return st;};
// ---------------------------------------------------------------- the terraces' crops (kits/crops, the wouterwall records; 50's items)
// o.fields(fn): the host walks its terraced fields' points and calls fn(x, y, z, cropId) for each (a lattice on the treads, each field one
// crop: the host's rotation). Each point a card of the crop at the season's height (WOW.CROP_LOOK), a little varied; nothing in a fallow
// field or a crop the season leaves out of the ground (winter's stubble)
WOW.buildCrops=function(o){const st={plants:0,byCrop:{}},{rr,reseed,TAU}=BIO.fn,qEuler=BIO.qEuler||BIO.fn.qEuler;if(!o||!o.fields)return st;
 o.fields((x,y,z,id)=>{const L=WOW.CROP_LOOK[id];if(!L)return;reseed(KRAND.hash(WOW.seed==null?5200:WOW.seed,0xC40,Math.round(x*4),Math.round(z*4)));
  const k=rr(.85,1.15),h=L.h*k,w=L.w*rr(.85,1.15);
  BIO.put('crop.'+id,[x+rr(-.25,.25),y-.04,z+rr(-.25,.25)],qEuler(rr(-.05,.05),rr(0,TAU),rr(-.05,.05)),[w,h,w],L.c);
  st.plants++;st.byCrop[id]=(st.byCrop[id]||0)+1;});
 return st;};
