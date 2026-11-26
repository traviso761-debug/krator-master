// ================================================================= HOST — the southern highlands' pack under its kit's own name
// station.json "packs" files biomes/shighlands' families (the barks, the leaves, the straps its trees draw with) under the folder's name,
// 'shighlands'; its kit reads them as KMAT.packed('shigh', ...), so they are filed again under 'shigh' here (the same records, no copy)
{const f={};['bark.banded','bark.helix','bark.palm','bark.ribbed','bark.rind','bark.rope','bark.scars','bark.skirt','bark.wrung','leaf.small','leaf.moss','strap','fern','escargot']
 .forEach(k=>{const L=KMAT.packed('shighlands',k);if(L)f[k]=L;});KMAT.pack('shigh',f);}
