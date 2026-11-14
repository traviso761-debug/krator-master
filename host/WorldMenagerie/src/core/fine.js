// Fine ground: where a kilometre grid will not do (a mountain, a firth, a haven), a generator writes finer grids of
// the same ground beside the coarse one (patches {n, x0, z0, step, nx, nz, h}: heights in half-metres, metres east
// and south). makeFine samples them; drawFine draws them over the engine's terrain and presses that down under them.
// Each patch fades into the coarse ground at its edges (the generator's job), so where none answers the coarse
// ground is right. Numenor (tools/make-numenor.py) and Mordor (tools/make-mordor.py) write them.
//
// A page that also sets ctx.fineAt=F.at before the build has the engine's groundH answer from the patches, so
// whatever is built on the ground stands on the fine ground.
export function makeFine(patches){
  const P=(patches||[]).map(p=>({...p,x1:p.x0+(p.nx-1)*p.step,z1:p.z0+(p.nz-1)*p.step,H:Float32Array.from(p.h,v=>v/2)}));
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

// Draw the patches. o.colour(x, y, z, ny, slope, out) colours a point (out is a THREE.Color; default: the engine's own
// rule, API.terrainColour); o.attrs {name: size} with o.attrAt(x, y, z, ny) -> {name: [bytes]} adds normalised byte
// attributes a page's ground shader reads (Numenor's land cover). Each patch is cut into chunks of 48 cells, each
// drawn at full resolution near the camera and at every second and every fourth point further off (o.near, o.mid);
// every level hangs a skirt from its edges, so where two chunks at different levels meet there is no crack. The
// engine's terrain is pressed below the lowest fine ground across each of its vertices' spans, since a chord between
// two coarse vertices on a concave flank stands above the fine ground.
export function drawFine(api,F,o={}){
  const {THREE,scene,camera,ctx,animHooks}=api,out={verts:0,pressed:0,chunks:[]};
  if(!F||!F.patches.length)return out;
  const terr=[];scene.traverse(m=>{if(m.isMesh&&m.name==='terrain')terr.push(m);});if(!terr.length)return out;
  const ST=api.terrainStep||1000,mat=o.material||terr[0].material,cc=new THREE.Color(),AT=o.attrs||{},names=Object.keys(AT);
  const colour=o.colour||((x,y,z,ny,sl,c)=>api.terrainColour?api.terrainColour(x,y,z,sl,c):c.set(0x777777));
  for(const t of terr){const p=t.geometry.attributes.position,span=ST*(t.userData.lod||1)*1.05;let hit=0;
    for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);if(!F.inside(x,z,span+100))continue;
      const m=F.minNear(x,z,span);if(m<Infinity&&p.getY(i)>m-8){p.setY(i,m-8);hit++;}}
    if(hit){p.needsUpdate=true;t.geometry.computeBoundingSphere();out.pressed+=hit;}}
  const CS=48,near=o.near||7000,mid=o.mid||20000;
  for(const P of F.patches){const n=P.nx*P.nz,H=P.H,NX=P.nx,st=P.step,pos=new Float32Array(n*3),nrm=new Float32Array(n*3),cl=new Float32Array(n*3),EX={};
    for(const k of names)EX[k]=new Uint8Array(n*AT[k]);
    for(let j=0;j<P.nz;j++)for(let i=0;i<NX;i++){const k=j*NX+i;pos[k*3]=P.x0+i*st;pos[k*3+1]=H[k];pos[k*3+2]=P.z0+j*st;
      const hx=(H[j*NX+Math.min(NX-1,i+1)]-H[j*NX+Math.max(0,i-1)])/(2*st),hz=(H[Math.min(P.nz-1,j+1)*NX+i]-H[Math.max(0,j-1)*NX+i])/(2*st),l=Math.hypot(hx,1,hz);
      nrm[k*3]=-hx/l;nrm[k*3+1]=1/l;nrm[k*3+2]=-hz/l;
      colour(pos[k*3],H[k],pos[k*3+2],1/l,Math.hypot(hx,hz),cc);cl[k*3]=cc.r;cl[k*3+1]=cc.g;cl[k*3+2]=cc.b;
      if(names.length){const v=o.attrAt(pos[k*3],H[k],pos[k*3+2],1/l);for(const a of names)EX[a].set(v[a],k*AT[a]);}}
    for(let cj=0;cj<P.nz-1;cj+=CS)for(let ci=0;ci<NX-1;ci+=CS){const w=Math.min(CS,NX-1-ci),d=Math.min(CS,P.nz-1-cj),levels=[];
      for(const s2 of [1,2,4]){const I=[];for(let a=0;a<w;a+=s2)I.push(ci+a);I.push(ci+w);const J=[];for(let b=0;b<d;b+=s2)J.push(cj+b);J.push(cj+d);
        const W=I.length,D=J.length,vs=[];for(const jj of J)for(const ii of I)vs.push(jj*NX+ii);
        // the skirt: the edge's vertices again, hung below it
        const edge=[];for(let a=0;a<W;a++)edge.push(a);for(let b=1;b<D;b++)edge.push(b*W+W-1);for(let a=W-2;a>=0;a--)edge.push((D-1)*W+a);for(let b=D-2;b>0;b--)edge.push(b*W);edge.push(0);
        const NV=vs.length+edge.length,ps=new Float32Array(NV*3),ns=new Float32Array(NV*3),cs=new Float32Array(NV*3),XS={},drop=30*s2;
        for(const a of names)XS[a]=new Uint8Array(NV*AT[a]);
        const put=(t,k,dy)=>{ps[t*3]=pos[k*3];ps[t*3+1]=pos[k*3+1]-dy;ps[t*3+2]=pos[k*3+2];for(let c=0;c<3;c++){ns[t*3+c]=nrm[k*3+c];cs[t*3+c]=cl[k*3+c];}
          for(const a of names){const z=AT[a];for(let c=0;c<z;c++)XS[a][t*z+c]=EX[a][k*z+c];}};
        vs.forEach((k,t)=>put(t,k,0));edge.forEach((e,t)=>put(vs.length+t,vs[e],drop));
        const idx=[];for(let b=0;b<D-1;b++)for(let a=0;a<W-1;a++){const v0=b*W+a,v1=v0+1,v2=v0+W,v3=v2+1;idx.push(v0,v3,v1,v0,v2,v3);}
        for(let t=0;t+1<edge.length;t++){const a=edge[t],b=edge[t+1],c=vs.length+t,e=vs.length+t+1;idx.push(a,c,b,b,c,e);}
        const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(ps,3));g.setAttribute('normal',new THREE.BufferAttribute(ns,3));g.setAttribute('color',new THREE.BufferAttribute(cs,3));
        for(const a of names)g.setAttribute(a,new THREE.BufferAttribute(XS[a],AT[a],true));
        g.setIndex(idx);g.computeBoundingSphere();
        const m=new THREE.Mesh(g,mat);m.name='fine:'+P.n;m.receiveShadow=o.receiveShadow!==false;m.castShadow=!!o.castShadow;m.userData.wireCat='ground';m.userData.info={name:P.n};m.visible=s2===1;scene.add(m);levels.push(m);if(s2===1)out.verts+=vs.length;}
      out.chunks.push({x:P.x0+(ci+w/2)*st,z:P.z0+(cj+d/2)*st,y:H[(cj+(d>>1))*NX+ci+(w>>1)],levels,cur:0});}}
  // which level each chunk shows: full within near, half to mid, a quarter beyond
  animHooks.push(()=>{const c=camera.position;let drawn=0;for(const ch of out.chunks){const dd=Math.hypot(c.x-ch.x,c.y-ch.y,c.z-ch.z),L=dd<near?0:dd<mid?1:2;
    if(L!==ch.cur){ch.levels[ch.cur].visible=false;ch.levels[L].visible=true;ch.cur=L;}drawn+=L;}if(ctx.details)ctx.details.fineLevels=drawn;});
  return out;}
