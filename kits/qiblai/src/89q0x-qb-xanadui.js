// ================================================================= QIBLAI — the Xanadui script (GENERATED: do not edit)
// Lifted unchanged from lore/tongues-of-krator.html, its Xanadui section (the scribe: strokes, vowel signs, the stacking
// rule, the romanization parser, the wheel and the bar), by kits/qiblai/xanadui_script.py at every build. Edit the chart.
// XNDS.parse(text) gives words of tokens; XNDS.aks(cons, vowel, nasal, scale), XNDS.WHEEL(scale) and XNDS.BAR(scale)
// give each token as SVG markup, which src/89q0y-qb-script.js draws onto canvases. [G data] text, no DOM in what runs.
const XNDS=(function(){
 /* ---------- strokes: consonant body on a 0..56 x 20..64 cell, head at y 22 ---------- */
 const ASP="M44 62 Q58 60 56 72 Q53 82 43 76";
 const RET="M14 22 Q4 16 8 8 L16 6";
 const C={
  k:"M30 14 L30 60 Q30 68 22 66 M8 38 Q30 30 50 38 Q56 41 52 46",
  g:"M6 64 L26 22 L50 64 M18 22 L36 22",
  ṅ:"M8 22 L46 22 M26 22 Q12 38 26 44 Q42 50 38 60 L26 64",
  q:"M12 22 L12 62 L46 62 L46 36 Q46 24 34 28 L22 40",
  x:"M8 22 L48 64 M48 22 Q20 34 16 62",
  c:"M48 22 L20 22 Q10 22 10 34 L10 50 Q10 62 22 62 L48 62 M30 62 L30 38",
  j:"M46 22 L12 22 L12 42 L40 42 M12 42 L12 62 L46 62",
  ñ:"M8 22 L8 62 M8 42 Q30 20 50 42 L50 62",
  t:"M10 22 L46 22 M28 22 L28 50 Q28 62 40 62 Q50 60 48 50",
  d:"M12 22 L12 62 M12 22 Q50 22 50 42 Q50 62 12 62",
  n:"M6 62 L50 62 M28 62 L28 22 L16 22",
  p:"M10 22 L10 46 Q10 62 28 62 Q46 62 46 46 L46 22",
  b:"M12 22 L48 22 L48 62 L12 62 Z M12 22 L4 14",
  m:"M8 22 Q28 70 50 22 M28 48 L28 62 M12 62 L44 62",
  y:"M8 22 Q8 44 28 44 Q48 44 48 22 M28 22 L28 62",
  r:"M38 16 Q14 30 28 42 Q42 54 22 66",
  l:"M10 22 L10 50 Q10 62 22 62 L48 62 L48 40",
  w:"M28 22 Q8 22 8 42 Q8 62 28 62 Q48 62 48 42 Q48 22 28 22 M28 22 L20 14",
  ś:"M6 62 L26 22 L48 62 M14 46 L40 46 M26 22 L26 12",
  s:"M10 22 L10 46 Q10 62 28 62 Q46 62 46 46 L46 22 M46 40 L18 40",
 };
 /* [romanization, IPA, base, marks] */
 const CONS=[
  ["k","k","k"],["kh","kʰ","k",ASP],["g","g","g"],["gh","gʱ","g",ASP],["ṅ","ŋ","ṅ"],
  ["c","tʃ","c"],["ch","tʃʰ","c",ASP],["j","dʒ","j"],["jh","dʒʱ","j",ASP],["ñ","ɲ","ñ"],
  ["ṭ","ʈ","t",RET],["ṭh","ʈʰ","t",RET+" "+ASP],["ḍ","ɖ","d",RET],["ḍh","ɖʱ","d",RET+" "+ASP],["ṇ","ɳ","n",RET],
  ["t","t̪","t"],["th","t̪ʰ","t",ASP],["d","d̪","d"],["dh","d̪ʱ","d",ASP],["n","n","n"],
  ["p","p","p"],["ph","pʰ","p",ASP],["b","b","b"],["bh","bʱ","b",ASP],["m","m","m"],
  ["y","j","y"],["r","r","r"],["l","l","l"],["w","w","w"],
  ["ś","ʃ","ś"],["s","s","s"],["q","q","q"],["x","x","x"],
 ];
 const CB=Object.fromEntries(CONS.map(c=>[c[0],c]));
 const IV={a:"M8 30 L28 20 L50 30 M28 20 L28 62 M12 46 L44 46 L44 62",
  i:"M16 28 l5 8 M38 28 l5 8 M27 50 l5 8",
  u:"M14 22 L14 62 L48 62 M14 22 L22 16",
  e:"M12 22 L48 42 L12 62 Z",
  o:"M28 20 L48 42 L28 64 L8 42 Z"};
 /* vowel signs drawn on the main cell; "below" ones shift down past stacked letters */
 const VS={
  ā:{d:"M50 22 L58 22 L58 38"},
  i:{d:"M24 18 Q28 4 42 10"},
  ī:{d:"M14 16 Q26 0 44 8 L48 16"},
  u:{d:"M28 66 L28 78 L38 78",below:1},
  ū:{d:"M22 66 L22 78 M34 66 L34 78",below:1},
  e:{d:"M20 18 L12 8"},
  ai:{d:"M20 18 L12 8 M30 18 L22 8"},
  o:{d:"M20 18 L12 8 M50 22 L58 22 L58 38"},
  au:{d:"M20 18 L12 8 M30 18 L22 8 M50 22 L58 22 L58 38"},
 };
 const NIB=10,STEP=.5;
 function nib(d,cls,tf){let s="";for(let i=0;i<NIB;i++)s+=`<path class="${cls}" d="${d}" transform="${tf||""} translate(${(i*STEP).toFixed(2)} ${(-i*STEP).toFixed(2)})"/>`;return s}
 const BH=96,STK=26;
 function svgWrap(inner,stack,label,scale){
   const h=BH+STK*Math.max(0,stack-1),s=scale||.5;
   return `<svg viewBox="-6 0 72 ${h}" width="${(72*s).toFixed(1)}" height="${(h*s).toFixed(1)}" role="img" aria-label="${label}">${inner}</svg>`;
 }
 function consInner(k,tf,markCls){const c=CB[k];return nib(C[c[2]],"ink",tf)+(c[3]?nib(c[3],markCls||"mk",tf):"")}
 /* one syllable block: consonant list, vowel (null = kill stroke), nasal flag */
 function aks(cons,v,nas,scale){
   let inner="",label=cons.join("")+(v||"");
   if(!cons.length){
     const base=v[0]==="a"?"a":v.startsWith("ī")?"i":v.startsWith("ū")?"u":v[0];
     inner+=nib(IV[base==="ā"?"a":base],"ink");
     if(v==="ā"||v==="ī"||v==="ū")inner+=nib(VS.ā.d,"ink");
     if(v==="ai"||v==="au")inner+=nib(VS[v].d,"ink");
   }else{
     inner+=consInner(cons[0]);
     cons.slice(1).forEach((k,i)=>{inner+=consInner(k,`translate(13 ${52+STK*i}) scale(.55)`)});
     if(v&&v!=="a"){const s=VS[v];inner+=nib(s.d,"ink",s.below&&cons.length>1?`translate(0 ${STK*(cons.length-1)})`:"")}
     if(v===null)inner+=nib("M46 68 L56 80","ink",cons.length>1?`translate(0 ${STK*(cons.length-1)})`:"");
   }
   if(nas)inner+=`<circle class="dotf" cx="36" cy="6" r="3.2"/>`;
   return svgWrap(inner,Math.max(1,cons.length),label,scale);
 }
 const WHEEL=s=>`<svg viewBox="0 0 40 96" width="${(40*s).toFixed(1)}" height="${(96*s).toFixed(1)}" role="img" aria-label="full stop"><circle class="wh" cx="20" cy="42" r="12"/><circle class="wh" cx="20" cy="42" r="3"/>${[0,1,2,3,4,5,6,7].map(i=>{const a=i*Math.PI/4;return `<path class="wh" d="M${(20+3*Math.cos(a)).toFixed(1)} ${(42+3*Math.sin(a)).toFixed(1)} L${(20+12*Math.cos(a)).toFixed(1)} ${(42+12*Math.sin(a)).toFixed(1)}"/>`}).join("")}</svg>`;
 const BAR=s=>`<svg viewBox="0 0 24 96" width="${(24*s).toFixed(1)}" height="${(96*s).toFixed(1)}" role="img" aria-label="comma">${nib("M12 22 L12 62","ink")}</svg>`;

 /* ---------- romanization ---------- */
 const CK=CONS.map(c=>c[0]).sort((a,b)=>b.length-a.length);
 const VK=["ai","au","ā","ī","ū","a","i","u","e","o"];
 function parse(text){
   let s=text.normalize("NFC").toLowerCase()
    .replace(/ã/g,"aṃ").replace(/ĩ/g,"iṃ").replace(/ũ/g,"uṃ").replace(/õ/g,"oṃ").replace(/ẽ/g,"eṃ")
    .replace(/sh/g,"ś").replace(/ny/g,"ñ").replace(/aa/g,"ā").replace(/ii/g,"ī").replace(/uu/g,"ū");
   const words=[];let cur=[],cl=[];
   const flush=()=>{if(cl.length){cur.push({c:cl,v:null});cl=[]}};
   for(let i=0;i<s.length;){
     const ch=s[i];
     if(/\s/.test(ch)){flush();if(cur.length)words.push(cur);cur=[];i++;continue}
     if(ch==="."||ch==="!"||ch==="?"){flush();cur.push({p:"wheel"});i++;continue}
     if(ch===","||ch===";"){flush();cur.push({p:"bar"});i++;continue}
     if(ch==="-"||ch==="'"){i++;continue}
     if(ch==="ṃ"){const last=cur[cur.length-1];if(last&&last.v!==undefined&&!cl.length)last.n=1;i++;continue}
     const k=CK.find(k=>s.startsWith(k,i));
     if(k){cl.push(k);i+=k.length;continue}
     const v=VK.find(v=>s.startsWith(v,i));
     if(v){cur.push({c:cl,v});cl=[];i+=v.length;continue}
     flush();cur.push({u:ch});i++;
   }
   flush();if(cur.length)words.push(cur);
   return words;
 }
 function render(text,el,tokEl,scale){
   const sc=scale||.5,w=parse(text);
   el.innerHTML=w.map(wd=>`<span class="word">${wd.map(t=>t.u?`<span class="unk">${t.u}</span>`:t.p==="wheel"?WHEEL(sc):t.p==="bar"?BAR(sc):aks(t.c,t.v,t.n,sc)).join("")}</span>`).join("");
   if(tokEl)tokEl.textContent=w.map(wd=>wd.map(t=>t.u?`[${t.u}]`:t.p?(t.p==="wheel"?"☸":"|"):t.c.join("+")+(t.v===null?"·":t.v==="a"&&t.c.length?"":"+"+t.v)+(t.n?"ṃ":"")).join(" ")).join("   ");
 }
 return {parse,aks,WHEEL,BAR,BH,STK};
})();
