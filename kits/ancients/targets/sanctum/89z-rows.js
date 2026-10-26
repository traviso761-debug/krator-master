// TARGET: sanctum — the Sanctum, the Eternal State's capital arcology, as the True Heirs keep it (the owner's form,
// 2026-10-22): a six-storey hexagonal podium with six gates under face sculptures and six atria behind them, a stalk a
// sixth of its width, and on it the hexagonal solid that is most of the mass, its corners over the gates, balconies
// and great lancets on its faces, light wells through it, a garden and towers on its roof (8ar0). The spiral drum that
// was the Sanctum until then is the Podium (targets/podium). Its fragments live here and it reads the Podium's skins
// in place (build.py TARGET_READS), so the kit's other pages do not change.
const TITLE='The Sanctum — the capital arcology of the Eternal State';
const GROUND_C=0;
const DECAYS=[0];
const ROWS={
 sanctum:{z:0,s:0,r:470},
};
const RUINS=[];
const EXTRA_BUILDERS={sanctum:buildSanctum};
