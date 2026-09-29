import asyncio
from playwright.async_api import async_playwright
JS=r"""()=>{
 const sat=(A,B)=>{const axes=[];for(const P of [A,B])for(let i=0;i<4;i++){const p=P[i],q=P[(i+1)%4];axes.push([-(q[1]-p[1]),q[0]-p[0]]);}
   let minO=1e9;for(const ax of axes){const l=Math.hypot(ax[0],ax[1])||1;const a=[ax[0]/l,ax[1]/l];const pr=P=>{let lo=1e9,hi=-1e9;for(const p of P){const v=p[0]*a[0]+p[1]*a[1];lo=Math.min(lo,v);hi=Math.max(hi,v);}return [lo,hi];};
     const [a0,a1]=pr(A),[b0,b1]=pr(B);const o=Math.min(a1,b1)-Math.max(a0,b0);if(o<=0)return 0;minO=Math.min(minO,o);}return minO;};
 const quadOf=o=>{o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;const v=new THREE.Vector3();const pts=[];let ymin=1e9,ymax=-1e9;
   for(const x of [b.min.x,b.max.x])for(const z of [b.min.z,b.max.z])for(const y of [b.min.y,b.max.y]){v.set(x,y,z).applyMatrix4(o.matrixWorld);pts.push([v.x,v.z]);ymin=Math.min(ymin,v.y);ymax=Math.max(ymax,v.y);}
   // footprint quad: take the 4 distinct xz corners in order (bottom corners suffice; rotation about y keeps them a rectangle)
   const q=[];for(const x of [b.min.x,b.max.x]){for(const z of (x===b.min.x?[b.min.z,b.max.z]:[b.max.z,b.min.z])){v.set(x,b.min.y,z).applyMatrix4(o.matrixWorld);q.push([v.x,v.z]);}}
   return {q,ymin,ymax};};
 scene.updateMatrixWorld(true);const props=[];
 scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.geometry.type==='PlaneGeometry'||(o.material&&o.material.transparent))return;if(o.parent&&o.parent.userData&&o.parent.userData.ph!==undefined)return;
   const qq=quadOf(o);const w=Math.hypot(qq.q[1][0]-qq.q[0][0],qq.q[1][1]-qq.q[0][1]),d=Math.hypot(qq.q[2][0]-qq.q[1][0],qq.q[2][1]-qq.q[1][1]);if(w>90||d>90||qq.ymax<-5||qq.ymax-qq.ymin>400)return;props.push({...qq,g:o.geometry.type,cx:(qq.q[0][0]+qq.q[2][0])/2,cz:(qq.q[0][1]+qq.q[2][1])/2});});
 const bl=lots.filter(l=>!l.fixed).map(l=>{const c0=Math.cos(l.ry),s0=Math.sin(l.ry);const q=[[-1,-1],[1,-1],[1,1],[-1,1]].map(p=>[l.x+p[0]*l.fx*c0+p[1]*l.fz*s0,l.z-p[0]*l.fx*s0+p[1]*l.fz*c0]);const y=terrainH(l.x,l.z);return {q,ymin:y-1,ymax:y+l.h,kind:l.kind,x:l.x|0,z:l.z|0,rad:l.rad};});
 const hits=[];for(const p of props){for(const b of bl){if(Math.hypot(p.cx-b.x,p.cz-b.z)>b.rad+60)continue;if(Math.min(p.ymax,b.ymax)-Math.max(p.ymin,b.ymin)<1)continue;const o=sat(p.q,b.q);if(o>1.0)hits.push([b.kind,b.x,b.z,p.g,p.cx|0,p.cz|0,+o.toFixed(1)]);}}
 return {props:props.length,buildings:bl.length,hits:hits.length,sample:hits.slice(0,30)};}"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=["--use-gl=swiftshader","--enable-webgl","--ignore-gpu-blocklist"])
        pg=await b.new_page(viewport={"width":400,"height":300})
        await pg.goto("http://localhost:8765/iziz_test.html",timeout=180000); await pg.wait_for_timeout(3000); await pg.evaluate("renderer.shadowMap.enabled=false")
        r=await pg.evaluate(JS); print({k:v for k,v in r.items() if k!='sample'})
        for h in r['sample']: print(h)
        await b.close()
asyncio.run(main())
