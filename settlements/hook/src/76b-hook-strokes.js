/* ============================== HOOK: THE EDITOR'S GROUND STROKES ON THE PAGE ([G data]) ============================== */
/* The site editor's brushes (raise, lower, smooth: settlements/voth/targets/voth-site/10-site-model.js TERR) are saved as
   strokes in site/hook-site.json `terrain` ({m, r, s, pts}, in the kit's frame). Here they are replayed in order onto a
   height-delta grid over the same square, with the editor's own arithmetic (cell 6 m, square 3,900 m each way, a cosine
   dab, smooth by a summed-area mean), and added to the natural ground the kit's terrain is built on (PORT.natH): every
   stamp, pad and lot then stands on the edited ground, as the editor showed it. Built once, at the first height asked
   for, and only when there are strokes; nothing changes without them. On the editor's own page (HOOK_EDITOR, set by
   build.py for a site target) the editor's live grid carries the strokes, so they are not applied twice. The one
   difference from the editor: its smooth reads the ground with the kit's stamps, this the natural ground under them.
   No three.js, no DOM. */
const HOOK_STROKES=(()=>{
 const strokes=(typeof HOOK_SITE!=='undefined'&&HOOK_SITE.terrain)||[],editor=typeof HOOK_EDITOR!=='undefined'&&HOOK_EDITOR;
 const T={cell:6,ext:3900,D:null,base:null,count:strokes.length,applied:!editor&&strokes.length>0};
 T.N=Math.ceil(2*T.ext/T.cell)+1;
 if(!T.applied)return T;
 const nat=PORT.natH;
 const baseAt=(i,j)=>{const k=j*T.N+i;let v=T.base[k];if(v!==v)v=T.base[k]=nat(-T.ext+i*T.cell,-T.ext+j*T.cell);return v;};
 function dab(m,x,z,r,s){const c=T.cell,N=T.N,D=T.D,E=T.ext;
  const i0=Math.max(1,Math.floor((x-r+E)/c)),i1=Math.min(N-2,Math.ceil((x+r+E)/c)),j0=Math.max(1,Math.floor((z-r+E)/c)),j1=Math.min(N-2,Math.ceil((z+r+E)/c));
  if(i0>i1||j0>j1)return;
  const w=(i,j)=>{const d=Math.hypot(-E+i*c-x,-E+j*c-z)/r;return d>=1?0:.5+.5*Math.cos(Math.PI*d);};
  if(m==='smooth'){const H=(i,j)=>baseAt(i,j)+D[j*N+i],upd=[];
   const k2=Math.max(1,Math.round(r/c/3)),a0=i0-k2,b0=j0-k2,W2=i1-i0+2*k2+1,H2=j1-j0+2*k2+1,S=new Float64Array((W2+1)*(H2+1));
   for(let jj=0;jj<H2;jj++){let row=0;const gj=Math.min(N-1,Math.max(0,b0+jj));
    for(let ii=0;ii<W2;ii++){row+=H(Math.min(N-1,Math.max(0,a0+ii)),gj);S[(jj+1)*(W2+1)+ii+1]=S[jj*(W2+1)+ii+1]+row;}}
   const cnt=(2*k2+1)*(2*k2+1);
   for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const wt=w(i,j);if(!wt)continue;
    const x0=i-k2-a0,y0=j-k2-b0,x1=x0+2*k2+1,y1=y0+2*k2+1,sum=S[y1*(W2+1)+x1]-S[y0*(W2+1)+x1]-S[y1*(W2+1)+x0]+S[y0*(W2+1)+x0];
    upd.push(j*N+i,(sum/cnt-H(i,j))*Math.min(1,s)*wt);}
   for(let q=0;q<upd.length;q+=2)D[upd[q]]+=upd[q+1];}
  else{const sg=m==='lower'?-1:1;for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const wt=w(i,j);if(wt)D[j*N+i]+=sg*s*wt;}}}
 function build(){const n=T.N*T.N;T.D=new Float32Array(n);T.base=new Float32Array(n).fill(NaN);
  for(const st of strokes)for(const p of (st.pts||[]))dab(st.m,p[0],p[1],st.r,st.s);T.base=null;}
 T.delta=(x,z)=>{if(!T.D)build();const fx=(x+T.ext)/T.cell,fz=(z+T.ext)/T.cell,i=Math.floor(fx),j=Math.floor(fz),N=T.N;
  if(i<0||j<0||i>=N-1||j>=N-1)return 0;const u=fx-i,v=fz-j,D=T.D,k=j*N+i;
  return (D[k]*(1-u)+D[k+1]*u)*(1-v)+(D[k+N]*(1-u)+D[k+N+1]*u)*v;};
 PORT.natH=(x,z)=>nat(x,z)+T.delta(x,z);
 return T;})();
