// ================================================================= LOJ TWENNY: THE HOLD'S DEFS DRAWN (the Tungang set, kits/tungang)
// [web] Every site of the plan is registered in core/tags (a building of culture tungang, its def's types) BEFORE it is drawn,
// then drawn through the kit's host API (TG.tg.draw: dry, its furniture the catalog's Tungang pieces at 0.94, its lamps light
// records). One draw a deck, so each deck's meshes carry userData.deck for the deck cut (X) and the decks above hide.
const LT_HOLD={draws:[],recs:[],lights:[],furniture:0,missing:{},missingFurn:{},tris:0};
(function(){const H=LT.plan(),deckOf=s=>s.deck==null?0:s.deck;
 for(const s of H.sites){if(s.state==='removed')continue;const D=TG.DEFS[s.key];
  s.tid=KTAGS.page.add({'class':'building',kind:s.key,key:s.key,name:(D?D.name:s.key)+' ('+s.id+')',at:[s.x,s.y,s.z],ry:s.ry,size:[s.w,s.d,s.h],
   tags:Object.assign({},D?D.tags:{},{culture:'tungang'}),note:'Loj Twenny, '+(s.district||'the Line deck')+', '+s.state+': laid on core/city/cavern, carved by KCAVERN, drawn by TG.tg',frag:'settlements/loj-twenny'}).id;}
 for(const dk of [1,0,-1]){const sites=H.sites.filter(s=>s.state!=='removed'&&deckOf(s)===dk);if(!sites.length)continue;
  const out=TG.tg.draw(sites,{scene,seed:20261120+dk,label:'Loj Twenny: '+LT.DECKS.find(d=>d.i===dk).name});
  out.group.traverse(m=>{m.userData.deck=dk;if(m.material&&m.isMesh){const ms=Array.isArray(m.material)?m.material:[m.material];ms.forEach(q=>{if(!q.userData.ltFade){q.userData.ltFade=1;KFADE.add(q);}});}});
  LT_HOLD.draws.push(out);LT_HOLD.recs.push(...out.recs);LT_HOLD.lights.push(...out.lights);LT_HOLD.furniture+=out.furniture;LT_HOLD.tris+=out.tris;
  Object.assign(LT_HOLD.missing,out.missing);Object.assign(LT_HOLD.missingFurn,out.missingFurn);}
 if(TG.errors.length)reportLtErr('TG: '+TG.errors.slice(0,3).join(' | '));})();
function reportLtErr(m){const e=document.getElementById('errs');if(e){e.style.display='block';e.textContent+=m+'\n';}console.error(m);}
