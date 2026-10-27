// ================================================================= RIFT - the library extras (this kit's own page only)
// What the pack carries beyond the slots the kit's own code names (materials.json families marked "own": a host that vendors the kit
// takes its fragments by name and its pack without these, so its page keeps its bytes). Variants of the jungle clump and the hanging
// vine (card.jungle.clump.N, card.vine.hanging.N: each plant draws one by KRAND.hash of its spot, core/biome 32-core-variants.js),
// the bracket fungus's library map (organic.fungus.bracket)
// No pack: nothing here runs and the kit keeps its procedural maps.
(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib'||!KMAT.packed||typeof BIO.variantPool!=='function')return;
 const T=BIO.host.THREE,KIT='rift',has=n=>!!KMAT.packed(KIT,n),tbl={};
 const ph=()=>new T.DataTexture(new Uint8Array([255,255,255,255]),1,1,T.RGBAFormat);   /* a card the library fills: libSwap takes a DataTexture for a card */
 const mk=(slot,key,opt)=>{if(!has(slot))return null;return tbl[slot]=BIO.leafMat(ph(),''+key,opt);};
 const under=[].map(i=>mk('under'+i,'under'+i,{swayW:'1.0',swayA:.06})).filter(Boolean),hang=[1].map(i=>mk('hang'+i,'hang'+i,{swayW:'(-position.y)',swayA:.055,axis:1})).filter(Boolean);
 if(has('fungus')&&BIO.defs.fungus){BIO.defs.fungus.mat=tbl.fungus=BIO.solidMat(null,0xffffff);}
 /* the giant groundsel's head (2026-10-27): its rosette of flat untextured leaves (G.rosette) read as a pale paper star up close;
    here each leaf is a library strap leaf, cut to its outline, on the rosette with a uv along each leaf (G.rosetteUV: u from the
    leaf's base, which the geometry declares, so BIO.def turns the image's bottom-based strap to run base to tip) */
 const gs=mk('gshead','gshead',{swayW:'0.0',swayA:0,alphaTest:.4,vertexColors:true});
 RIFT.LIB=Object.assign(RIFT.LIB||{},BIO.libSwap(KIT,tbl));
 if(gs&&RIFT.G&&RIFT.G.rosetteUV){const g=RIFT.G.rosetteUV();g.userData.card={base:'left'};BIO.def('gshead',g,gs,{label:'Giant groundsel heads'});}
 if(under.length)BIO.variantPool('ucard',under,0x3c01);
 if(hang.length)BIO.variantPool('strand',hang,0x3c02);
})();
