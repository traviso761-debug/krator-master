// ================================================================= CULTURAL CENTRE — "the Wheel"
// Lifted out of Veladiga, where it sat in the park below the dam and read as a
// cluster of blocks at the wrong scale against a 250 m wall. On its own ground
// it can be what the sheet actually draws: a radial city — three concentric
// rings of halls on a stepped platform, radial spokes running out from a domed
// core, and a colonnaded plaza between them.
function buildCultural(scene,gx,gz,d){reseed(9390+d);KOFF=[gx,0,gz];const SM=skyShardMark();
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Cultural centre — the Wheel ('+STATE(d)+')',x:0,z:0,r:250,h:96});
 REGISTER({name:'Cultural centre — the great hall',x:0,z:0,r:78,h:96});
 const SH=[],DK=[];
 // Stepped platform. The terrace radii have to OVERLAP the ring they carry --
 // at 96/154/212 against rings at 104/156/208 each tier stopped short and the
 // overview showed bare ground in two annular gaps between the drums.
 const TIER=[[134,8.2],[190,5.6],[244,3.0]];
 TIER.forEach((T,k)=>{const [r,y]=T;
  kput(SLABC(d),[0,y-2.6,0],null,[r,5.2,r],new THREE.Color(d>0?0x6a5a4c:0xcfcac2));
  const nb=Math.round(r*.2);
  for(let j=0;j<nb;j++){const a2=j/nb*TAU;
   kput(BOXC(d),[Math.cos(a2)*r,y-4.4,Math.sin(a2)*r],qEuler(0,-a2,0),[7,4,3.2],null);}});
 // the domed great hall on the axis
 const CH=64,gr=y=>52*Math.pow(clamp(1-Math.pow(y/CH,2),0,1),.58);
 // THE RUIN CHANGES THE SKYLINE. It used to be the intact plan in rust with a
 // quarter of the halls gone to rubble: every surviving drum stood whole with
 // its cap on, so the silhouette was the intact one. On level 1 the great
 // dome has lost its crown (broken at 62% of its height, jagged), and most
 // campaniles and nearly half the halls are broken off at 40-75% of their
 // height with no cap. Level 3 (rehabilitated) keeps its full silhouette.
 const DC=d===1?CH*.62:null;
 SH.push(lathe({rFn:gr,H:CH,cut:DC,jag:DC?7:0,flutes:18,amp:.07,sharp:2,nu:64,nv:20,
  hole:(u,y)=>(Math.cos(u*TAU*18)<.28&&y>6&&y<CH*.84)||(holeFn(d*.9,9391,null,1.3)||(()=>false))(u,y)}).translate(0,11,0));
 if(d===0)mesh(lathe({rFn:y=>gr(y)-3,H:CH,nu:40,nv:14}),MAT.glass,G,0,11,0);
 else DK.push(lathe({rFn:y=>gr(y)-5,H:CH,cut:DC,jag:DC?7:0,nu:32,nv:10,
  hole:(u,y)=>fbm(u*5,y*.09,9392,2)<.5}).translate(0,11,0));
 if(d!==1)kput(SLABC(d),[0,11+CH,0],null,[12,2,12],null);
 if(d===0)kput('finial',[0,11+CH+8,0],null,[3.5,7,3.5],null);
 stripRing(0,20,0,50,d,30);stripRing(0,11+CH*.62,0,38,d,24);
 // Three concentric rings of halls, each ring turned against the last. Ring 1
 // renders behind the dome, so the variation that stops this reading as a tank
 // farm has to be in silhouette: every third hall is a campanile at twice the
 // height, and each drum takes a shallow dome cap rather than a flat lid.
 const RINGS=[[104,15,12,30,11],[156,19,16,26,7.4],[208,23,20,21,4]];
 RINGS.forEach((R,ri)=>{const [rad,bw,n,bh,py]=R;
  for(let k=0;k<n;k++){const a2=(k+(ri%2)*.5)/n*TAU;
   const bxp=Math.cos(a2)*rad,bzp=Math.sin(a2)*rad;
   if(d>0&&rng()<.28){rubbleRing(bxp,0,bzp,4,bw*1.6,26,2.3);continue;}
   const tall=(k%3===1),hh0=bh*(tall?2.05:1)*(.88+rng()*.24),bwk=bw*(tall?.62:1);
   const brk=d===1&&rng()<(tall?.8:.45),hh=brk?hh0*rr(.4,.75):hh0;
   SH.push(lathe({rFn:()=>bwk,H:hh,cut:brk?hh:null,jag:brk?3.5:0,flutes:6,amp:.22,sharp:1,nu:26,nv:6,
    hole:holeFn(d*.8,9393+ri*5+k,brk?hh:null,2)}).translate(bxp,py,bzp));
   const cap=bwk*(tall?.95:.42);
   if(!brk)SH.push(lathe({rFn:y=>bwk*1.04*Math.sqrt(clamp(1-Math.pow(y/cap,2),0,1)),H:cap,nu:20,nv:4,
    hole:holeFn(d*.7,9393+ri*5+k,null,1.4)}).translate(bxp,py+hh,bzp));
   if(d>0)DK.push(lathe({rFn:()=>bwk*.86,H:hh,nu:14,nv:2}).translate(bxp,py,bzp));
   // WINDOWS. Seven small arched windows at half height left every drum a
   // blank white wall at the distance the presets use. Tall dark-glass slots
   // now (clear glass on white reads as nothing),
   // in the six troughs between the flutes (the only place a pane is not
   // buried in the wall), two tiers on a hall and three on a campanile —
   // and cheaper than the seven extruded arches they replace.
   for(let row=0,nr=tall?3:2;row<nr;row++)for(let j=0;j<6;j++){const t2=(j+.5)/6*TAU,yw=py+hh*((row+.55)/nr);
    kput(d>0?'paneD':'darkPane',[bxp+bwk*1.015*Math.cos(t2),yw,bzp+bwk*1.015*Math.sin(t2)],
     qFacing([Math.cos(t2),0,Math.sin(t2)]),[bwk*.24,hh/nr*.62,1],null);}
   // MOULDINGS (round 2): a cornice where the drum meets its cap and a string
   // course between the window tiers. A broken drum keeps only the courses
   // under its break. The torus is the kit's ring, flattened into a band.
   const ringN=d>0?'ringR':'ringW',rq=qEuler(Math.PI/2,0,0);
   // (the flute crests stand at 1.22 of the radius, so the bands go outside them)
   if(!brk)kput(ringN,[bxp,py+hh-.4,bzp],rq,[bwk*1.27,bwk*1.27,5],null);
   for(let row=1,nr=tall?3:2;row<nr;row++)kput(ringN,[bxp,py+hh*(row+.05)/nr,bzp],rq,[bwk*1.25,bwk*1.25,3],null);
   if(d===0)kput('strip',[bxp,py+hh-2,bzp+bwk*1.03],qFacing([0,0,1]),[bwk*1.2,1,1],CYAN);
   // the spoke running back to the core
   beam(BOXC(d),[bxp*.42,py+2,bzp*.42],[bxp*.9,py+2,bzp*.9],6,3.4);}});
 // colonnade round the outer terrace
 for(let k=0;k<48;k++){const a=k/48*TAU;
  if(d>0&&rng()<.3)continue;
  kput(d>0?'colR':'colW',[Math.cos(a)*236,1.4,Math.sin(a)*236],null,[2.4,17,2.4],null);}
 for(let k=0;k<4;k++){const a=k/4*TAU+.4;
  kput('archOpen',[Math.cos(a)*232,9,Math.sin(a)*232],qFacing([Math.cos(a),0,Math.sin(a)]),[1.4,1.2,2],null);}
 apron(G,0,0,240,310,d,3);
 meshMerged(SH,skin,G);meshMerged(DK,MAT.guts,G);
 if(d>0){mossOnSurface(SH,0,0,0,150,2.4);vinesFromLedge(SH,0,0,0,60,16);stainsFromLedge(SH,0,0,0,50,12);
  scatterMoss(0,0,0,60,300,120,2.6);rubbleRing(0,0,0,240,330,80,2.6);trees(0,0,270,380,22);}
 if(d>0)skyShards(SM,d===3?.25:.5);   // glass teeth in the dead slots (52-sky-abc.js)
 figures(0,170,8,40);figures(120,-120,5,30);
 KOFF=[0,0,0];return G;}
