// prefix: hy
// ================================================================= MIXED VASSAL STREET & ANCESTOR STATUARY RANKS (PLAN.md §6, seeds 34401..34402)
//   34401 hy_mixed_street     Mirabilis Mixed Eternian-Hayrant Vassal Avenue: places all 6 read-in-place et_* residential defs
//                             beside 7 hy_* peers across poor, middle & rich tiers, verifying 0 lot overlaps & <= 0.50 m cornice delta
//   34402 hy_statuary_ranks   Ancestor Statuary & Door-Mask Ranks: 8 material tiers, veiled heads, 1 rare open-eye judge & all 4 figure poses

const HY_ET_PEERS=['et_canal_house','et_reed_house','et_block_hut','et_canal_row','et_merchant_house','et_official_villa'];
(function(){
 for(const k of HY_ET_PEERS){
  const d=DEFS[k];
  if(!d)continue;
  d.tags.culture='eternian';
  d.frag='kits/eternian';
 }
})();

/* 47. Mixed Eternian-Hayrant Vassal Avenue (cls: 'feature', kind: 'street') */
defBuilding({key:'hy_mixed_street',name:'Mirabilis Mixed Eternian-Hayrant Vassal Street',seed:34401,
 cls:'feature',kind:'street',cut:false,
 w:124.0,d:58.0,h:19.2,budget:950000,
 tags:{types:['infrastructure','plaza'],style:'hybrid',landmark:true},
 note:'paved Mirabilis avenue alternating read-in-place Eternian suzerain houses and Hayrant vassal houses plot-to-plot with <= 0.50 m cornice alignment',
 build(){
  /* Central east-west paved Mirabilis Avenue [x: -59..59, z: -4.0..4.0] strictly clear of all north/south building plots */
  svNoWalk(()=>{
   box('paving',0,0,0,118.0,.07,8.0,P('paving'));
   for(const sz of [-4.18,4.18]){
    box('columnar',0,0,sz,118.0,.18,.34,P('columnar'));
    box('nephrite',0,.18,sz,118.0,.05,.24,P('nephrite'));
   }
   /* Central stepped basalt & bronze median mile-stele at x = 0 */
   box('ashlar',0,.07,0,1.4,.42,1.4,P('ashlar'));
   box('columnar',0,.49,0,.76,1.85,.76,P('columnar'));
   box('nephrite',0,2.34,0,.92,.18,.92,P('nephrite'));
  });
  hyAncestorHead(0,2.52,0,0,.86,{mk:'gold'});
  hyBilingualSign(-1.6,1.5,0,0,1.25,.75);
  hyBilingualSign(1.6,1.5,0,PI,1.25,.75);

  /* Street-edge snow-lanterns & wind-rigged nephrite chimes along z = +/-4.65 (clear of avenue curb 4.35 & plot front 5.8) */
  for(const sx of [-42,-22,-4,14,32,50]){
   FURNISH('hayrant_jade_lantern_post',sx,0,-4.65,0);
   FURNISH('hayrant_jade_lantern_post',sx+6,0,4.65,PI);
  }
  hySeismicChimes(-12,3.1,-4.65,0,1.8,1.15,5);
  hySeismicChimes(28,3.1,4.65,PI,1.8,1.15,5);

  /* 13 non-overlapping lots: North Avenue (Rich & Middle, ry=0 facing +z avenue) & South Avenue (Multi & Poor, ry=PI facing -z avenue) */
  const specs=[
   /* North side (z < -5.8, ry = 0) */
   {key:'et_official_villa',x:-45.5,z:-16.2,ry:0,cornice:10.40,tier:'rich-compound'},
   {key:'hy_clan_lord_compound',x:-17.0,z:-16.9,ry:0,cornice:10.79,tier:'rich-compound'},
   {key:'et_merchant_house',x:5.4,z:-11.6,ry:0,cornice:11.90,tier:'rich-urban'},
   {key:'hy_merchant_tower_rich',x:22.1,z:-12.6,ry:0,cornice:11.82,tier:'rich-urban'},
   {key:'et_canal_house',x:37.6,z:-11.9,ry:0,cornice:7.20,tier:'mid-single'},
   {key:'hy_bench_house_mid',x:52.1,z:-12.1,ry:0,cornice:7.16,tier:'mid-single'},
   /* South side (z > +5.8, ry = PI) */
   {key:'hy_nuraghe_chise_mid',x:-45.0,z:12.6,ry:PI,cornice:7.04,tier:'mid-compound'},
   {key:'et_canal_row',x:-26.5,z:10.4,ry:PI,cornice:5.40,tier:'poor-multi'},
   {key:'hy_terrace_row_poor',x:-7.8,z:11.3,ry:PI,cornice:5.36,tier:'poor-multi'},
   {key:'et_reed_house',x:8.4,z:9.4,ry:PI,cornice:3.25,tier:'poor-single'},
   {key:'hy_loess_yaodong',x:21.6,z:11.2,ry:PI,cornice:3.39,tier:'poor-single'},
   {key:'et_block_hut',x:35.0,z:8.6,ry:PI,cornice:3.18,tier:'poor-hut'},
   {key:'hy_larch_chise_poor',x:48.4,z:11.7,ry:PI,cornice:2.88,tier:'poor-hut'}
  ];

  const placedLots=[];
  for(const s of specs){
   const d=DEFS[s.key];
   if(!d)continue;
   const r=place(s.key,s.x,s.z,s.ry,{v:0});
   if(r){
    const hw=d.w*.5,hd=d.d*.5;
    placedLots.push({
     key:s.key,culture:d.tags.culture,tier:s.tier,
     x:s.x,z:s.z,ry:s.ry,w:d.w,d:d.d,
     x0:s.x-hw,x1:s.x+hw,z0:s.z-hd,z1:s.z+hd,
     cornice:s.cornice
    });
   }
  }
  if(CURREC&&!PLACE_DRY){
   CURREC.mixedLots=placedLots;
   CURREC.mixedPairs=[
    ['hy_bench_house_mid','et_canal_house',7.16,7.20],
    ['hy_nuraghe_chise_mid','et_canal_house',7.04,7.20],
    ['hy_merchant_tower_rich','et_merchant_house',11.82,11.90],
    ['hy_clan_lord_compound','et_official_villa',10.79,10.40],
    ['hy_terrace_row_poor','et_canal_row',5.36,5.40],
    ['hy_loess_yaodong','et_block_hut',3.39,3.18],
    ['hy_larch_chise_poor','et_block_hut',2.88,3.18]
   ];
  }
 }});

/* 48. Ancestor Statuary, Sutar-Pira Head-Totem Ranks, Veiled True-Heir Heads & Door-Mask Ranks (cls: 'feature', kind: 'sample') */
defBuilding({key:'hy_statuary_ranks',name:'Ancestor Statuary and Head-Totem Ranks',seed:34402,
 cls:'feature',kind:'sample',cut:false,
 w:22.4,d:14.4,h:8.2,budget:195000,
 tags:{types:['statue','religious'],style:'prefect'},
 note:'ranked gallery of Sutar-Pira Eternian-head totem poles, ancestor heads in 8 materials, veiled True-Heir busts, 1 rare open-eye judge & all 4 poses',
 build(){
  const G=.24;
  svNoWalk(()=>{
   box('megabreccia',0,0,0,20.4,G*.6,12.2,P('megabreccia'));
   box('paving',0,G*.6,0,20.0,G*.4,11.8,P('paving'));
   /* Rear stepped basalt display bench & nephrite string course */
   box('basalt',0,G,-3.6,18.4,.72,2.2,P('basalt'));
   box('nephrite',0,G+.72,-3.6,18.6,.12,2.3,P('nephrite'));
   /* Middle display bench */
   box('basalt',0,G,-.4,18.4,.42,1.8,P('basalt'));
   box('ashlar',0,G+.42,-.4,18.6,.1,1.9,P('ashlar'));
   /* Back screen wall displaying household & clan door masks + Kanopi circuit-maze frieze band */
   box('columnar',0,G,-5.1,18.4,2.85,.38,P('columnar'));
   hyFormLayerBox('maze',0,G+2.36,-4.91,1,17.8,.34,P('maze'));
   box('celadon',0,G+2.85,-5.1,18.8,.18,.48,KIT_HAS('celadon')?new THREE.Color(1,1,1):P('celadon'));
  });

  /* Back wall: 7 door-mask ranks (nephrite, gold, silver, bronze, kaen, lead, basalt) */
  const maskMks=['nephrite','gold','silver','bronze','kaen','lead','basalt'];
  for(let i=0;i<maskMks.length;i++){
   hyDoorMask(-7.2+i*2.4,G+1.65,-4.85,0,.48,maskMks[i]);
  }

  /* Rear elevated rank: 8 ancestor heads across the 8 highland & court materials (1 rare open-eye Imperial Judge in gold) */
  const headMks=['gold','silver','bronze','nephrite','gunmetal','lead','kaen','basalt'];
  for(let i=0;i<headMks.length;i++){
   const xx=-7.7+i*2.2,mk=headMks[i];
   const veiled=mk==='gunmetal'||mk==='silver'&&i===1;
   const openEye=mk==='gold'&&i===0;
   hyAncestorHead(xx,G+.84,-3.6,0,.84,{
    mk,plinth:.28,veiled,eyes:openEye?'open':'closed',
    seed:344020+i*13,headdress:openEye?'mitre':'band'
   });
  }

  /* Middle rank: 4 full-body ancestor figures demonstrating all 4 valid Eternian poses ('stand', 'seat', 'lintel', 'folded') */
  const poses=[
   ['stand','gold',-5.4],
   ['seat','silver',-1.8],
   ['lintel','bronze',1.8],
   ['folded','nephrite',5.4]
  ];
  for(let i=0;i<poses.length;i++){
   const [pose,mk,xx]=poses[i];
   hyAncestorFigure(xx,G+.52,-.4,0,1.85,{pose,mk,plinth:.36,seed:344050+i*19});
  }

  /* Ranked trio of Sutar-Pira Cyber-Totem Pylons linked along a titanium & porcelain-insulator ground busbar duct */
  hyHeadTotemPole(-8.1,G,1.75,0,{h:4.8,heads:3,r:.25,terminal:true,materials:['titanium','tarwood','celadon'],crown:'faraday',seed:344081});
  hyHeadTotemPole(0,G,1.75,0,{h:6.0,heads:4,r:.29,terminal:true,materials:['bronze','silver','titanium','gold'],crown:'halo',seed:344082});
  hyHeadTotemPole(8.1,G,1.75,0,{h:5.2,heads:4,r:.26,terminal:true,materials:['nephrite','alabaster','gunmetal','silver'],veiledIdx:2,crown:'arrestor',seed:344083});
  svNoWalk(()=>{
   for(const bx of [-4.05,4.05]){
    box('titanium',bx,G,1.22,6.4,.14,.22,hyTotemMatCol('titanium'));
    const cL=hyPinInsulator(bx-2.4,G+.14,1.22,.82,0);
    const cR=hyPinInsulator(bx+2.4,G+.14,1.22,.82,1);
    sagRope('brass',cL,cR,.18,.012,P('brass'),8);
   }
  });

  /* Front rank: seismic chime frame & willow inau shrines */
  hySeismicChimes(-6.2,G+2.65,3.8,0,2.2,1.25,5);
  hySeismicChimes(6.2,G+2.65,3.8,0,2.2,1.25,5);
  hyFurnList([
   ['hayrant_inau_ancestor_shelf',-2.6,G,3.8,0,0],
   ['hayrant_inau_ancestor_shelf',2.6,G,3.8,0,1],
   ['hayrant_jade_lantern_post',-8.4,G,4.6,0],
   ['hayrant_jade_lantern_post',8.4,G,4.6,0]
  ]);
 }});
