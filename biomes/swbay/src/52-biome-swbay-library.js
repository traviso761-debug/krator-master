// ================================================================= SWBAY - the library extras (this kit's own page only)
// What the pack carries beyond the slots the kit's own code names (materials.json families marked "own": a host that vendors the kit
// takes its fragments by name and its pack without these, so its page keeps its bytes). Variants of the jungle clump and the hanging
// vine (card.jungle.clump.N, card.vine.hanging.N: each plant draws one by KRAND.hash of its spot, core/biome 32-core-variants.js),
// the bracket fungus's library map (organic.fungus.bracket)
// No pack: nothing here runs and the kit keeps its procedural maps.
(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib'||!KMAT.packed||typeof BIO.variantPool!=='function')return;
 const T=BIO.host.THREE,KIT='swbay',has=n=>!!KMAT.packed(KIT,n),tbl={};
 const ph=()=>new T.DataTexture(new Uint8Array([255,255,255,255]),1,1,T.RGBAFormat);   /* a card the library fills: libSwap takes a DataTexture for a card */
 const mk=(slot,key,opt)=>{if(!has(slot))return null;return tbl[slot]=BIO.leafMat(ph(),''+key,opt);};
 const under=[1,2].map(i=>mk('under'+i,'under'+i,{swayW:'1.0',swayA:.06})).filter(Boolean),hang=[1].map(i=>mk('hang'+i,'hang'+i,{swayW:'(-position.y)',swayA:.055,axis:1})).filter(Boolean);
 if(has('fungus')&&BIO.defs.fungus){BIO.defs.fungus.mat=tbl.fungus=BIO.solidMat(null,0xffffff);}
 SWBAY.LIB=Object.assign(SWBAY.LIB||{},BIO.libSwap(KIT,tbl));
 if(under.length)BIO.variantPool('ucard',under,0x3c01);
 if(hang.length)BIO.variantPool('strand',hang,0x3c02);
})();
