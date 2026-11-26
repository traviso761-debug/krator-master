// ================================================================= EASTERN DESERT, MANTIS'S POCKET — the Socotran monsoon forest
// The owner (2026-10-26): a unique Socotran-style monsoon forest, the Bowl's one lush place. Socotra's own wet woodland (the
// Haggeher's slopes and the wadis under them) is the model, grown in the abyss's dense air and the pocket's monsoon:
//   MANTIS FIG     Ficus vasta: the great spreading fig of Socotra's wadis, a fused, buttressed grey bole, limbs running out
//                  low and level, a dark dome of broad leaves forty metres across, aerial roots dropping from the limbs, figs
//   FRANKINCENSE   Boswellia socotrana: a gnarled small tree, its bark peeling in pale papery sheets, pinnate leaves at the
//                  branch tips, the resin the trade the merchant houses came for
//   CUCUMBER TREE  Dendrosicyos socotranus: a swollen water-storing trunk, a few stubby branches, broad leaves and yellow flowers
//   POMEGRANATE    Punica protopunica: Socotra's wild pomegranate, a small furrowed tree, scarlet flowers and fruit
//   STERCULIA      Sterculia africana: smooth, silvery-pink bark, palmate leaves on a light crown
// with the kit's dragon's blood trees in close groves, beard lichen (Usnea) hanging from the forest's limbs in the humid air,
// and an understory (67) of croton, aloe, kalanchoe and ferns at the springs. The species are pushed onto SEDESERT.SPECIES (so
// the kit's pass, impostors and inspector take them) and drawn with the kit's tools (55: SEDESERT.TOOLS).
(function(){const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick,qEuler,qUp}=BIO.fn;
const T3=BIO.host.THREE,C=SEDESERT.C,{bright,vary}=SEDESERT,TL=SEDESERT.TOOLS,TX=SEDESERT.TEX;
const F=(n,x,z)=>BIO.field(n,x,z);
// ---------------------------------------------------------------- materials and items (the 'mantis' pack's cards when present)
const MF={
 broad:BIO.leafMat(TX.small,'mantis-broad',{aN:true,swayW:'1.0',swayA:.07}),
 beard:BIO.leafMat(TX.small,'mantis-beard',{swayW:'(-position.y)',swayA:.08,axis:1}),
 fern:BIO.leafMat(TX.reed,'mantis-fern',{swayW:'(position.y)',swayA:.06,alphaTest:.4}),
};
SEDESERT.MANTIS_LIB=BIO.libSwap('mantis',MF);
BIO.def('broad',BIO.geo.clump(),MF.broad,{attrs:['aN'],label:'Broad leaves (fig, cucumber tree, sterculia)'});
BIO.def('beard',BIO.geo.ribbon(2,.5,.05),MF.beard,{label:'Beard lichen'});
BIO.def('fern',SEDESERT.G.tuft(),MF.fern,{label:'Ferns'});
// ---------------------------------------------------------------- the species
const PAL={fig:[0x2e4a22,0x365426,0x2a421e,0x3e5c2a],figFruit:[0x8a3a5a,0x9a4a3a,0x7a3a4a],incense:[0x6a7a3e,0x76863f,0x5e6e36],
 cucumber:[0x7a9a4a,0x88a854,0x6e8e40],pom:[0x4e6a2a,0x5a7630,0x466226],pomFlower:[0xe0402a,0xd0301e,0xf05030],sterc:[0x5a7a36,0x668a3e,0x4e6e2e],
 beard:[0xb8c0a0,0xa8b494,0xc4c8ac]};
const HV=(wood,edible,medicinal,notes,fruit)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:fruit||null});
const tag=(aridity,riparian,hv)=>({climate:'tropic',aridity,abyssal:true,habit:'Mantis\'s pocket (1.83 atm, the monsoon)',riparian,harvest:hv});
const NEW=[
 {key:'figv',name:'Mantis fig',H:[18,28],rb:[2.2,3.4],crownR:[17,26],barkK:2,bark:[0x8e8a80,0x828076,0x9a968c],leaf:PAL.fig,forks:5,forkLen:[.42,.32,.24,.18,.14],
  far:{poleU:.3,blobs:[[.62,1.0,.32,'L0','L2'],[.5,.75,.26,'L1','L3',{rich:true,off:.35}]]},
  tags:tag('subhumid','yes',HV('none (one tree is a grove)',['figs'],true,'Ficus vasta of Socotra\'s wadis: a fig tree is the village\'s shade and meeting place; the figs eaten fresh and dried, the latex a wart salve.'))},
 {key:'incense',name:'Socotran frankincense',H:[5,9],rb:[.35,.6],crownR:[3,5],barkK:2,bark:[0xc8bca8,0xd4c8b2,0xbcae98],leaf:PAL.incense,forks:4,forkLen:[.36,.28,.22,.18],
  far:{poleU:.45,blobs:[[.85,.85,.2,'L0','L2']]},
  tags:tag('semiarid','no',HV('none',[],true,'Boswellia: the resin tapped from the papery bark is the incense the Izani merchant houses came for; a medicine for the lungs.'))},
 {key:'cucumber',name:'Cucumber tree',H:[4,7],rb:[.7,1.3],crownR:[2,3.5],barkK:2,bark:[0xb4b098,0xc0bca2,0xa8a48c],leaf:PAL.cucumber,
  far:{poleU:.5,blobs:[[.35,1.4,.34,'B0','B1',{rxOf:'rb'}],[.85,.8,.18,'L0','L1']]},
  tags:tag('arid','no',HV('none',['stored water (famine)'],false,'Dendrosicyos: the swollen trunk is cut for fodder in a drought.'))},
 {key:'pom',name:'Socotran pomegranate',H:[3,6],rb:[.2,.4],crownR:[2.5,4],barkK:3,bark:[0x6a5a4a,0x5e5040,0x766654],leaf:PAL.pom,forks:4,forkLen:[.34,.28,.22,.18],
  far:{poleU:.35,blobs:[[.7,.9,.3,'L0','L2']]},
  tags:tag('semiarid','both',HV('fuel',['fruit (sour)'],true,'Punica protopunica: the sour fruit and the rind, a dye and a medicine for the gut.'))},
 {key:'sterc',name:'Socotran sterculia',H:[7,12],rb:[.45,.8],crownR:[4,7],barkK:2,bark:[0xb8a49a,0xc4b0a6,0xac988e],leaf:PAL.sterc,forks:4,forkLen:[.34,.27,.21,.17],
  far:{poleU:.45,blobs:[[.8,.85,.22,'L0','L2']]},
  tags:tag('semiarid','no',HV('soft (floats, carved)',['seeds (roasted)'],false,'Sterculia africana: the bark peels silver and pink; the roasted seeds are eaten.'))},
];
const SP=SEDESERT.SPECIES,base=SP.length;NEW.forEach(S=>{SP.push(S);SEDESERT.byKey[S.key]=S;});
const sp=k=>SP.indexOf(SEDESERT.byKey[k]);
// ---------------------------------------------------------------- the builders (the kit's fork tree, and what each species adds)
const B=TL.B;
// beard lichen hanging from a tree's limbs: strands under its crown, at a share of its tufts' height
/* (2026-11-08, the attach audit) each strand hangs from the limb nearest the spot drawn for it (segs: the fork tree's spans, 55's
   forkTree), its top at the limb's underside; the spot's draws are as they were */
function beards(T,n,lo,hi,segs){for(let k=0;k<n;k++){const a=rr(0,TAU),d=T.crownR*Math.sqrt(rr(.05,.8));let x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=T.y0+T.H*rr(lo,hi);
 const sn=segs&&segs.length?BIO.snapSeg(segs,[x,y,z]):null;if(sn){x=sn.p[0];z=sn.p[2];y=sn.p[1]-(sn.seg.r0+(sn.seg.r1-sn.seg.r0)*sn.t)*.8;}
 BIO.put('beard',[x,y,z],qEuler(0,rr(0,TAU),0),[rr(.5,.9),rr(.9,2.2),1],bright(vary(pick(PAL.beard),.02,.06,.05),1.15));}}
B[sp('figv')]=function(T,st,lv){const segs=TL.forkTree(T,st,lv,{fam:'bark2',item:'broad',boleU:.26,el0:.42,spread:.62,rise:.04,curve:.03,wig:.05,tuftK:.3,flat:.5,nC:3,nTop:ri(5,8),fill:.7,flute:.16,lean:.02});
 if(lv<2)return;
 // the fused bole's buttresses: low flanges round the foot
 const S=SP[T.sp];for(let k=0,m=ri(5,8);k<m;k++){const a=k/m*TAU+rr(-.2,.2),L=T.rb*rr(1.8,2.8);
  BIO.tube('bark2',[{x:T.x+Math.cos(a)*T.rb*.6,y:T.y0+T.rb*1.6,z:T.z+Math.sin(a)*T.rb*.6,r:T.rb*.35},{x:T.x+Math.cos(a)*(T.rb+L*.5),y:T.y0+.6,z:T.z+Math.sin(a)*(T.rb+L*.5),r:T.rb*.22},{x:T.x+Math.cos(a)*(T.rb+L),y:T.y0-.3,z:T.z+Math.sin(a)*(T.rb+L),r:.12}],TL.barkCol(S,k),{seg:5});}
 // aerial roots from the limbs, some reaching the ground and thickening there (the fig's pillars)
 for(let k=0,m=ri(8,16);k<m;k++){const a=rr(0,TAU),d=T.crownR*rr(.3,.75),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y0=T.y0+T.H*rr(.32,.45),g=BIO.terrainH(x,z),reach=rng()<.4;
  const yb=reach?g-.2:y0-rr(2,5);BIO.beam('rod',[x,yb,z],[x+rr(-.3,.3),y0,z+rr(-.3,.3)],reach?rr(.12,.3):.05,.04,TL.rodCol(S,k));}
 // figs on the limbs
 for(let k=0,m=ri(20,40);k<m;k++){const a=rr(0,TAU),d=T.crownR*rr(.2,.8),s=rr(.05,.08);BIO.put('fruit',[T.x+Math.cos(a)*d,T.y0+T.H*rr(.45,.7),T.z+Math.sin(a)*d],null,[s,s*1.2,s],pick(PAL.figFruit));}
 beards(T,ri(14,26),.38,.62,segs);};
B[sp('incense')]=function(T,st,lv){const segs=TL.forkTree(T,st,lv,{fam:'bark2',item:'feather',boleU:.3,el0:.75,spread:.62,rise:.08,curve:.14,wig:.14,tuftK:.36,flat:.7,nC:2,nTop:ri(2,4),lean:.12,flute:.08,bloom:.3,bloomCol:[0xd85a6a,0xe87080]});
 if(lv===2&&rng()<.5)beards(T,ri(2,5),.4,.75,segs);};
B[sp('pom')]=function(T,st,lv){TL.forkTree(T,st,lv,{fam:'bark3',item:'small',boleU:.2,el0:.95,spread:.55,rise:.12,curve:.08,wig:.1,tuftK:.38,flat:.75,nC:3,nTop:ri(3,5),flute:.04,bloom:.55,bloomCol:PAL.pomFlower});
 if(lv===2)for(let k=0,m=ri(5,12);k<m;k++){const a=rr(0,TAU),d=T.crownR*rr(.3,.85),s=rr(.07,.11);BIO.put('fruit',[T.x+Math.cos(a)*d,T.y0+T.H*rr(.45,.85),T.z+Math.sin(a)*d],null,[s,s,s],0xc0402a);}};
B[sp('sterc')]=function(T,st,lv){const segs=TL.forkTree(T,st,lv,{fam:'bark2',item:'broad',boleU:.45,el0:.95,spread:.5,rise:.12,curve:.05,wig:.06,tuftK:.32,flat:.62,nC:2,nTop:ri(3,4),flute:.03});
 if(lv===2&&rng()<.6)beards(T,ri(3,7),.5,.8,segs);};
// the cucumber tree: a swollen trunk (a lathe, fat at its middle), a few stubby branches, broad leaves and yellow flowers
B[sp('cucumber')]=function(T,st,lv){const S=SP[T.sp],H=T.H,rb=T.rb,trH=H*.62,rings=[];
 for(let k=0;k<=8;k++){const u=k/8;rings.push({x:T.x,y:T.y0+trH*u,z:T.z,r:rb*(.75+.55*Math.sin(Math.PI*Math.pow(u,.8)))*(1-.55*u*u),yy:trH*u,col:TL.barkCol(S,k)});}
 rings.push({x:T.x,y:T.y0+trH+rb*.2,z:T.z,r:.05,yy:trH+1,col:TL.barkCol(S,1)});
 st.trunk+=BIO.lathe('bark2',rings,lv===2?10:7,Math.max(1,Math.round(TAU*rb/3)),5,(R,ang)=>R.r*(1+.03*Math.sin(5*ang)),null);
 const top={x:T.x,y:T.y0+trH,z:T.z},n=lv===2?ri(3,6):3;
 for(let k=0;k<n;k++){const a=k/n*TAU+rr(-.3,.3),el=rr(.5,1.1),len=H*rr(.22,.38),pts=TL.treeGrow(top,[Math.cos(a)*Math.cos(el),Math.sin(el),Math.sin(a)*Math.cos(el)],len,rb*.28,rb*.12,3,.05,.08);
  /* the leaves on the limb (the card fit, 2026-10-27: the fig card is held by its sprigs' stems, which start at the clump's origin): the tuft
     seated on the tip itself, not 0.3 m over it, the limb tapering into it, and a second tuft two thirds along a hero's limb (the owner saw
     capped stubs under floating crowns). The second tuft draws from the stream, so the pocket's later placements move a little */
  pts[pts.length-1].r=rb*.05;st.limb+=BIO.tube('bark2',pts,TL.barkCol(S,k),{seg:5,cap:true});const e=pts[pts.length-1];
  const cs=T.crownR*rr(.45,.65),lc=C(pick(S.leaf));TL.clumpAt('broad',e.x,e.y,e.z,cs,.6,lc,T.x,T.y0+H*.9,T.z,T.crownR,H*.25);st.clumps++;
  if(lv===2){const m=pts[Math.max(1,Math.round((pts.length-1)*.66))];TL.clumpAt('broad',m.x,m.y,m.z,cs*.7,.6,lc,T.x,T.y0+H*.9,T.z,T.crownR,H*.25);st.clumps++;}
  if(lv===2&&rng()<.6){const q=qEuler(0,rr(0,TAU),0),ps=T.crownR*rr(.25,.4);BIO.put('plume',BIO.holdTo([e.x,e.y,e.z],[e.x,e.y+T.crownR*.4,e.z],SEDESERT.reachOf('plume',ps)),q,ps,bright(vary(0xf0d040,.02,.08,.05),1.2),{n:[0,1,0]});}}
 TL.regTree(T,S,T.crownR+1,H+1);};
})();
