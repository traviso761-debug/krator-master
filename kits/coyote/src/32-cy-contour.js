/* ==================== kits/coyote 32: the contour script (plain data, [G data]) ==================== */
/* The Coyote Men write the Hum as CONTOUR CARVINGS (biomes/outlands/PLAN.md section 6; kits/coyote/PLAN.md section 2): a line
   that rises and falls as the bark's pitch does. This turns a text into that line, the same text always the same line, so a
   milestone, a boundary stone, a riser band or a lintel carries what its record says, and Godot draws the same strokes.

     cyContour(text, o) -> {text, strokes: [{word, pts: [[u, v], ...]}], length, sylls: [{s, onset, vowel, tone, coda, base,
                            snap, at}], howls, hash}
       u runs along the line in syllable units from 0 (strokes follow one another with a gap of o.gap, default 0.6, between
       words); v is the pitch, 0 (lowest) to 1 (highest). A host scales u and v into the face it carves.

   The reading (the Outlands plan: "the tones as barked pitch contours, a howl ends a sentence"; the consonants cut to
   h k w y m n, with snaps for p t s l):
     - a word is one stroke, its syllables (the hyphenated parts of a Hum compound: Ham-Hau) joined in one line;
     - a syllable's onset sets its base pitch (CY_ONSET: h high, m low ...); a snap onset (p t s l, ch, ts) cuts a spike up
       and back before the vowel;
     - the vowel's mark is the tone: a macron level and long (2 units), a grave falling, an acute rising (1.5 units), no
       mark level and short (1 unit);
     - a coda: a nasal (m n ng) a short level tail, a stop (k t p) a hook down;
     - the end of a sentence (. ! ?, or the end of the text unless o.howl is false) is the HOWL: the line sweeps up to the
       top, holds, and falls away to the bottom.
   Nothing here draws or touches the browser: it is plain data on plain strings. */
const CY_ONSET={h:3,k:2,w:1,y:2,m:0,n:1,g:1,f:2,ch:3,ts:3,s:3,p:3,t:3,l:2,b:1,d:2,r:2};
const CY_SNAPS={p:1,t:1,s:1,l:1,ch:1,ts:1};
const CY_TONES={'̄':'level','̀':'fall','́':'rise','̌':'dip'};
const CY_VOWELS='aeiouy';
function cyClampP(p){return p<0?0:p>4?4:p;}
/* one syllable's parts: the onset (the letters before the first vowel; 'y' before a vowel is an onset), the vowel and its
   tone mark (the text decomposed, so a precomposed macron counts), the coda */
function cySyll(s){
 const d=s.normalize('NFD').toLowerCase();let i=0,onset='',vowel='',tone='short',coda='';
 while(i<d.length){const c=d[i];if(CY_VOWELS.indexOf(c)>=0&&!(c==='y'&&i+1<d.length&&CY_VOWELS.indexOf(d[i+1])>=0&&onset===''))break;if(/[a-z]/.test(c))onset+=c;i++;}
 while(i<d.length){const c=d[i];if(CY_TONES[c]){tone=CY_TONES[c];i++;continue;}if(CY_VOWELS.indexOf(c)>=0&&(vowel===''||coda==='')){if(coda)break;vowel+=c;i++;continue;}break;}
 for(;i<d.length;i++){const c=d[i];if(/[a-z]/.test(c))coda+=c;}
 const key=onset.slice(0,2)in CY_ONSET?onset.slice(0,2):onset.slice(0,1);
 const base=CY_ONSET[key]==null?2:CY_ONSET[key];
 return {s,onset,vowel,tone,coda,base,snap:!!CY_SNAPS[key]};}
function cyContour(text,o){o=o||{};const gap=o.gap==null?.6:o.gap,howlEnd=o.howl==null?true:!!o.howl;
 const src=String(text==null?'':text).normalize('NFC').trim();
 const sentences=src.split(/(?<=[.!?])\s*/).filter(t=>t.trim());
 const strokes=[],sylls=[];let u=0,howls=0;
 sentences.forEach((sen,si)=>{const ends=/[.!?]$/.test(sen)||(howlEnd&&si===sentences.length-1);
  const words=sen.replace(/[.!?,;:]/g,' ').split(/\s+/).filter(Boolean);
  words.forEach((w,wi)=>{if(strokes.length)u+=gap;const pts=[];let p=null;
   const put=(x,y)=>{const q=[+x.toFixed(4),+(cyClampP(y)/4).toFixed(4)];const L=pts[pts.length-1];if(!L||L[0]!==q[0]||L[1]!==q[1])pts.push(q);};
   w.split('-').filter(Boolean).forEach(part=>{const S=cySyll(part);S.at=+u.toFixed(4);sylls.push(S);const b=S.base;
    if(S.snap){put(u,p==null?b:p);put(u+.12,b+1.4);put(u+.24,b);u+=.24;}
    const len=S.tone==='level'?2:S.tone==='short'?1:1.5;
    const y0=S.tone==='fall'?b+1:S.tone==='rise'?b-1:b,y1=S.tone==='fall'?b-1:S.tone==='rise'?b+1:b;
    if(S.tone==='dip'){put(u,b);put(u+len/2,b-1.2);put(u+len,b);}else{put(u,y0);put(u+len,y1);}
    u+=len;p=S.tone==='fall'?b-1:S.tone==='rise'?b+1:b;
    if(/^(m|n|ng)$/.test(S.coda)){put(u+.3,p);u+=.3;}
    else if(/^[ktp]$/.test(S.coda)){put(u+.2,p-1);u+=.2;p=p-1;}});
   if(ends&&wi===words.length-1){howls++;const y=p==null?2:p;
    put(u+.6,(y+4)/2);put(u+1.4,4);put(u+1.9,4);put(u+3.2,1.2);put(u+4.2,0);u+=4.2;}
   strokes.push({word:w,pts});});});
 let h=0x811c9dc5;const mix=t=>{for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}};
 for(const S of strokes)mix(S.word+':'+S.pts.map(q=>q.join(',')).join(';')+'|');
 return {text:src,strokes,length:+u.toFixed(4),sylls,howls,hash:('00000000'+h.toString(16)).slice(-8)};}
