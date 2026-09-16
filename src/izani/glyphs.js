// The Izani script, as set down in "The Izani Tongue": straight strokes branching off a stem, stemless vowel marks,
// tally numerals. Pure functions: no DOM, no three.js. Shared by the city page and the Tongue page.
const S=[0,0,0,1];   // the stem; every stroke is [x1,y1,x2,y2] in an em box, y down, stem at x=0
  const G={t:[S,[0,.12,.45,0]],d:[S,[0,.12,.45,0],[0,.47,.45,.35]],k:[S,[0,0,-.3,.2],[0,0,.3,.2]],
    s:[S,[0,0,.45,.22]],z:[S,[0,0,.45,.22],[0,.45,.45,.67]],f:[S,[0,.1,.42,.1]],v:[S,[0,.1,.42,.1],[0,.42,.42,.42]],
    th:[S,[0,0,-.45,.22]],sh:[S,[0,.12,-.45,0]],zh:[S,[0,.12,-.45,0],[0,.47,-.45,.35]],h:[S,[-.42,.35,.42,.35]],
    m:[S,[0,1,.45,1]],n:[S,[0,1,-.45,1]],ng:[S,[-.42,1,.42,1]],l:[S,[.35,.05,0,.6]],r:[S,[-.35,.05,0,.6]],
    y:[[0,.4,0,1],[-.35,0,0,.4],[.35,0,0,.4]],w:[[-.45,0,-.22,1],[-.22,1,0,.25],[0,.25,.22,1],[.22,1,.45,0]],
    i:[[0,.05,0,.7]],a:[[-.3,.7,0,.05],[0,.05,.3,.7]],e:[[-.2,.05,.2,.375],[.2,.375,-.2,.7]],
    o:[[0,.05,.25,.375],[.25,.375,0,.7],[0,.7,-.25,.375],[-.25,.375,0,.05]],u:[[-.3,.05,0,.7],[0,.7,.3,.05]]};
  G.ae=G.o.concat([[0,-.02,0,.77]]);
  const DI=['th','sh','zh','ng','ae'];
  const letters=w=>{const out=[];const s2=w.toLowerCase();for(let i=0;i<s2.length;){const two=s2.slice(i,i+2);if(DI.includes(two)){out.push(two);i+=2;}else{out.push(s2[i]);i++;}}return out;};
  const span=g=>{let a=0,b=0;for(const q of g){a=Math.min(a,q[0],q[2]);b=Math.max(b,q[0],q[2]);}return [a,b];};
  function layout(text){const segs=[];let x=0;
    text.trim().split(/\s+/).forEach((wd,wi)=>{if(wi)x+=0.62;const m=/^#(\d+)$/.exec(wd);
      if(m){let n=+m[1];while(n>0){const grp=Math.min(5,n),gx=x;for(let j=0;j<Math.min(4,grp);j++){segs.push([x,.3,x,.95]);x+=0.24;}
          if(grp===5)segs.push([gx-0.12,.92,x-0.12,.36]);n-=grp;x+=n>0?0.28:-0.24;}return;}
      letters(wd).forEach((L,li)=>{const g=G[L];if(!g)return;const [a,b]=span(g);if(li)x+=0.34;x-=a;for(const q of g)segs.push([q[0]+x,q[1],q[2]+x,q[3]]);x+=b;});});
    return {segs,width:Math.max(x,0.1)};}
  const PICS={   // painted pictures, drawn the Izan way: straight strokes only
    tree:[[0,.1,0,1],[0,.35,-.35,.1],[0,.35,.35,.1],[0,.6,-.4,.35],[0,.6,.4,.35],[-.3,1,.3,1]],
    star:[[0,0,0,1],[-.45,.5,.45,.5],[-.33,.17,.33,.83],[-.33,.83,.33,.17]],
    boat:[[-.6,.7,-.35,1],[-.35,1,.35,1],[.35,1,.6,.7],[-.6,.7,.6,.7],[0,.7,0,0],[0,0,.45,.55],[.45,.55,0,.55]],
    burst:[[0,.5,0,0],[0,.5,.35,.15],[0,.5,.5,.5],[0,.5,.35,.85],[0,.5,0,1],[0,.5,-.35,.85],[0,.5,-.5,.5],[0,.5,-.35,.15]],
    beast:[[-.6,.45,.35,.45],[-.6,.45,-.6,1],[-.35,.45,-.35,1],[.1,.45,.1,1],[.35,.45,.35,1],[.35,.45,.55,.25],[.55,.25,.75,.3],[.55,.25,.5,.05],[.62,.27,.7,.05],[-.6,.45,-.8,.7]],
    fish:[[-.6,.5,-.2,.2],[-.2,.2,.3,.35],[.3,.35,.6,.1],[.6,.1,.6,.9],[.6,.9,.3,.65],[.3,.65,-.2,.8],[-.2,.8,-.6,.5],[-.35,.45,-.3,.45]]};
export {S,G,DI,letters,span,layout,PICS};
// an inline SVG of a word, in the style the Tongue page uses (pad 0.12 em, square caps)
export function glyphSVG(text,o){o=o||{};const pad=o.pad===undefined?0.12:o.pad,L=layout(text),W=L.width+2*pad,H=1+2*pad,f=v=>(v+pad).toFixed(3),h=o.height||18;
  const lines=L.segs.map(q=>`<line x1="${f(q[0])}" y1="${f(q[1])}" x2="${f(q[2])}" y2="${f(q[3])}"/>`).join('');
  return `<svg class="gl" role="img" aria-label="${text} in Izani script" viewBox="0 0 ${W.toFixed(3)} ${H.toFixed(3)}" style="height:${h}px;width:${(h*W/H).toFixed(1)}px"><g stroke="${o.color||'#1f2d25'}" stroke-width="${(o.weight||0.085).toFixed(3)}" stroke-linecap="square" fill="none">${lines}</g></svg>`;}
