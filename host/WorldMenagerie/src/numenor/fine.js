// The fine patches: where a kilometre grid will not do (the Meneltarma, the firth, each haven), tools/make-numenor.py
// writes a finer grid of the same ground beside the coarse one (land.fine; heights in half-metres, metres east and
// south). This samples them; src/numenor/nature.js draws them over the coarse ground and presses that down under
// them. Each patch fades into the coarse ground at its edges, so where none answers the coarse ground is right.
export function makeFine(land){
  const P=(land&&land.fine||[]).map(p=>({...p,x1:p.x0+(p.nx-1)*p.step,z1:p.z0+(p.nz-1)*p.step,H:Float32Array.from(p.h,v=>v/2)}));
  const find=(x,z)=>{for(const p of P)if(x>=p.x0&&x<=p.x1&&z>=p.z0&&z<=p.z1)return p;return null;};
  const sample=(p,x,z)=>{const fi=(x-p.x0)/p.step,fj=(z-p.z0)/p.step,i=Math.min(p.nx-2,Math.floor(fi)),j=Math.min(p.nz-2,Math.floor(fj)),f=fi-i,g=fj-j,H=p.H,n=p.nx;
    // the same split of each cell into two triangles the patch mesh uses (from its north-west corner to its south-east)
    const a=H[j*n+i],b=H[j*n+i+1],c=H[(j+1)*n+i],d=H[(j+1)*n+i+1];
    return f>=g?a+(b-a)*f+(d-b)*g:a+(d-c)*f+(c-a)*g;};
  return {patches:P,find,sample,
    at:(x,z)=>{const p=find(x,z);return p?sample(p,x,z):null;},
    // the lowest the patch ground goes within r of a point, for pressing the coarse ground below it
    minNear:(x,z,r)=>{let m=Infinity;for(const p of P){if(x+r<p.x0||x-r>p.x1||z+r<p.z0||z-r>p.z1)continue;
      const i0=Math.max(0,Math.floor((x-r-p.x0)/p.step)),i1=Math.min(p.nx-1,Math.ceil((x+r-p.x0)/p.step)),j0=Math.max(0,Math.floor((z-r-p.z0)/p.step)),j1=Math.min(p.nz-1,Math.ceil((z+r-p.z0)/p.step));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++)m=Math.min(m,p.H[j*p.nx+i]);}return m;},
    // inside a patch by at least m metres (where the coarse ground is pressed and the patch is the ground)
    inside:(x,z,m)=>{for(const p of P)if(x>p.x0+m&&x<p.x1-m&&z>p.z0+m&&z<p.z1-m)return true;return false;}};
}
