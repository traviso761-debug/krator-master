// node core/terrain/test-ground-near.js — the near ground's contract (43n-core-ground-near.js, KGROUND.near): the patch meets the
// coarse ground with no crack, carries the height function inside, the coarse cells under it are cut and put back exactly, a build
// spread over frames is the one-shot build, and the attributes are the coarse grid's. Every check that can be broken has a negative.
'use strict';
const fs=require('fs'),path=require('path');
const T=require('../../tools/ktest.js')(__filename);
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'43n-core-ground-near.js'),'utf8'));
const NR=KGROUND.near;

// a coarse grid of a hilly function with 0.8 m ledges every 3 m of height (what a 13 m cell cannot carry)
const N=24,cs=13.4,x0=-N*cs/2,z0=-N*cs/2,nx=N+1;
const smoothH=(x,z)=>30*Math.sin(x*.011)*Math.cos(z*.009)+.04*x;
const H=(x,z)=>{const s=smoothH(x,z);return s+.8*(((s/3)%1+1)%1<.4?1:0);};
const pos=new Float32Array(nx*nx*3),ga=new Float32Array(nx*nx*4),idx=new Uint32Array(N*N*6);
for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=x0+i*cs,z=z0+j*cs;pos[k*3]=x;pos[k*3+1]=H(x,z);pos[k*3+2]=z;for(let c=0;c<4;c++)ga[k*4+c]=((i*7+j*3+c*11)%13)/13;}
{let t=0;for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}}
const G=NR.grid({N,x0,z0,cs,pos,attrs:{aGL0:{array:ga,size:4}}});
const coarseY=(x,z)=>{const t=NR.at(G,x,z);return t.k.reduce((s,k,q)=>s+pos[k*3+1]*t.w[q],0);};

// ---- the coarse triangle: barycentric, exact at the vertices, on the page's split (a,b,d / b,c,d)
{let bad=0;for(let q=0;q<3000;q++){const x=x0+((q*.618034)%1)*N*cs,z=z0+((q*.414214)%1)*N*cs,t=NR.at(G,x,z),s=t.w[0]+t.w[1]+t.w[2];if(Math.abs(s-1)>1e-9||t.w.some(w=>w<-1e-9))bad++;}
  T.ok('the coarse weights are barycentric (3000 points)',bad===0,bad+' off');}
{let m=0;for(let j=0;j<nx;j+=3)for(let i=0;i<nx;i+=3){const k=j*nx+i;m=Math.max(m,Math.abs(coarseY(pos[k*3],pos[k*3+2])-pos[k*3+1]));}
  T.ok('the coarse surface passes through its vertices',m<1e-4,'max '+m);}
/* the split: the point a quarter along the b-d diagonal's far side lies in b,c,d. A grid split a,c (the other diagonal) gives a
   different height there, which is what a crack at the rim would be */
const splitErr=(split)=>{const i=5,j=7,x=x0+(i+.7)*cs,z=z0+(j+.6)*cs,a=j*nx+i,b=a+nx,c=b+1,d=a+1,u=.7,v=.6;
  const yv=k=>pos[k*3+1];let ref;
  if(split==='bd')ref=u+v<=1?yv(a)*(1-u-v)+yv(b)*v+yv(d)*u:yv(b)*(1-u)+yv(c)*(u+v-1)+yv(d)*(1-v);
  else ref=u>=v?yv(a)*(1-u)+yv(d)*(u-v)+yv(c)*v:yv(a)*(1-v)+yv(b)*(v-u)+yv(c)*u;
  return Math.abs(coarseY(x,z)-ref)<1e-4;};
T.neg('the triangle under a point is the page\'s own split (a split on the other diagonal is caught)',s=>splitErr(s),'ac','bd');

// ---- the patch
const bx=NR.box(G,40,-25,7);
T.ok('the box is n x n cells inside the grid, centred on the camera\'s cell',bx.n===7&&bx.i0>=0&&bx.j0>=0&&bx.i0+7<=N&&bx.j0+7<=N&&
  Math.floor((40-x0)/cs)-bx.i0===3&&Math.floor((-25-z0)/cs)-bx.j0===3,JSON.stringify(bx));
{const e=NR.box(G,1e5,-1e5,7);T.ok('a camera off the grid keeps the box inside it',e.i0===N-7&&e.j0===0,JSON.stringify(e));}
const P=NR.build(G,bx,{h:H,cell:.5});
const rimCrack=P=>{let m=0;const M=P.M;for(let k=0;k<P.nx*P.nx;k++){const i=k%P.nx,j=(k/P.nx)|0;if(i&&j&&i<M&&j<M)continue;
  m=Math.max(m,Math.abs(P.pos[k*3+1]-coarseY(P.pos[k*3],P.pos[k*3+2])));}return m;};
T.ok('the patch is a whole number of fine cells a coarse cell, about 0.5 m',P.sub===27&&Math.abs(P.fc-cs/27)<1e-9&&P.M===7*27,'sub '+P.sub);
T.neg('the patch\'s rim lies on the coarse surface (no crack where they meet; a rim on the true height is caught)',P=>rimCrack(P)<1e-4,
  (()=>{const B=NR.build(G,bx,{h:H,cell:.5});for(let k=0;k<B.nx*B.nx;k++){const x=B.pos[k*3],z=B.pos[k*3+2];B.pos[k*3+1]=H(x,z);}return B;})(),P);
{let m=0,n=0;for(let k=0;k<P.nx*P.nx;k++)if(P.ramp[k]>=1){n++;m=Math.max(m,Math.abs(P.pos[k*3+1]-H(P.pos[k*3],P.pos[k*3+2])));}
  T.ok('inside the rim\'s ease the patch is the height function ('+n+' vertices)',n>P.nx*P.nx*.5&&m<1e-3,'max '+m);}
{const r=NR.rough(P.pos,P.nx,G);T.ok('the patch carries what the coarse cells could not (mean departure '+r.mean.toFixed(2)+' m, max '+r.max.toFixed(2)+')',r.mean>.15&&r.max>.6);
  const flat=NR.build(G,bx,{h:coarseY,cell:.5}),rf=NR.rough(flat.pos,flat.nx,G);
  T.neg('the roughness measure reads a patch on the coarse surface as smooth',q=>q.max>.3,rf,r);}
{let m=0;for(let k=0;k<P.nx*P.nx;k+=37){const t=NR.at(G,P.pos[k*3],P.pos[k*3+2]);for(let c=0;c<4;c++){const ref=t.k.reduce((s,kk,q)=>s+ga[kk*4+c]*t.w[q],0);m=Math.max(m,Math.abs(P.attrs.aGL0[k*4+c]-ref));}}
  T.ok('the patch\'s attributes are the coarse grid\'s, interpolated on its triangles',m<1e-6,'max '+m);}
{const B=NR.build(G,bx,{h:H,cell:.5,rows:[0,50]}),part=B.done;let R=B;for(let r=50;r<P.nx;r+=61)R=NR.build(G,bx,{h:H,cell:.5,rows:[r,r+61],into:R});
  let m=0;for(let k=0;k<P.pos.length;k++)m=Math.max(m,Math.abs(P.pos[k]-R.pos[k]));
  T.ok('a build spread over frames (rows) is the one-shot build',!part&&R.done&&m===0,'max '+m);}
T.ok('the same build twice is the same patch',(()=>{const Q=NR.build(G,bx,{h:H,cell:.5});for(let k=0;k<Q.pos.length;k++)if(Q.pos[k]!==P.pos[k])return false;return true;})());

// ---- the coarse cells under the patch: cut, then put back
const area=(I,f)=>{let s=0;for(let t=0;t<6;t+=3){const a=I[f+t]*3,b=I[f+t+1]*3,c=I[f+t+2]*3,ux=pos[b]-pos[a],uz=pos[b+2]-pos[a+2],vx=pos[c]-pos[a],vz=pos[c+2]-pos[a+2];s+=Math.abs(ux*vz-uz*vx)/2;}return s;};
const inBox=(i,j,b)=>i>=b.i0&&i<b.i0+b.n&&j>=b.j0&&j<b.j0+b.n;
const cutOK=(I,b)=>{for(let j=0;j<N;j++)for(let i=0;i<N;i++){const A=area(I,(j*N+i)*6),want=inBox(i,j,b)?0:cs*cs;if(Math.abs(A-want)>1e-3)return false;}return true;};
const I0=idx.slice();
const s1=NR.cut(idx,G,bx,null);
T.neg('the box\'s coarse cells are cut and only those (an uncut index is caught)',I=>cutOK(I,bx),I0,idx);
const bx2=NR.box(G,40+cs*2,-25-cs,7),s2=NR.cut(idx,G,bx2,s1);
T.ok('moving the patch puts the last box back and cuts the new one',cutOK(idx,bx2)&&s2.lo<=Math.min(s1.cutLo,s2.cutLo)&&s2.hi>=Math.max(s1.cutHi,s2.cutHi));
NR.uncut(idx,s2);
T.ok('uncut restores the index exactly',idx.every((v,k)=>v===I0[k]));
T.done();
