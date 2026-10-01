import {letters,layout,glyphSVG,G} from '../src/izani/glyphs.js';
import {eq,ok,deepEq,readJSON} from './assert.js';
const baked=readJSON('./fixtures/tongue-glyphs.json');
export const tests={
  'digraphs split before single letters'(){deepEq(letters('Shaenaeleth'),['sh','ae','n','ae','l','e','th']);deepEq(letters('Iziz'),['i','z','i','z']);deepEq(letters('thur'),['th','u','r']);},
  'every letter of the alphabet has strokes'(){for(const k of ['t','d','k','s','z','f','v','th','sh','zh','h','m','n','ng','l','r','y','w','i','a','e','o','u','ae'])ok(G[k]&&G[k].length,'missing '+k);},
  'layout width grows with the word and tallies count'(){ok(layout('iz').width<layout('iziz').width);const t=layout('#12');eq(t.segs.length,12);eq(layout('#5').segs.length,5);eq(layout('#3').segs.length,3);},
  'glyphSVG reproduces every glyph baked into the Tongue page'(){let n=0;for(const [word,svg] of Object.entries(baked)){const h=+(/height:(\d+)px/.exec(svg)||[0,18])[1],color=(/stroke="(#\w+)"/.exec(svg)||[])[1];eq(glyphSVG(word,{height:h,color}),svg,'glyph for '+word);n++;}ok(n>20,'fixtures loaded');},
};
