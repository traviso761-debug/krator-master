// ================================================================= HOST — STATION 3's ice: the cirque glacier and its ICEFALL (crevasses that curve)
// The ice is the host's own mesh (no core ice kind is approved: biomes/STATIONS-SURVEY.md; KNOWN_ISSUES.md), draped on the land along the
// centre line STATION_LAND.ICE from the headwall to the snout, ~150 m wide at the top narrowing to ~70 m, up to ~38 m thick, thinning to a few
// metres at the snout over the tarn. THE CREVASSES CURVE: transverse crevasses bowed downstream (the ice runs faster in the middle, so a
// crack across the flow is bent into an arc, as on Earth's icefalls and their ogives below), close-set and deep on the steep headwall, wide
// apart and shallow lower down; and every arc's apex drifts across the flow a little more at each crevasse, one way, so from above the
// crevasses wind as the station's spirals do (right-handed, SHIGH.HAND). Each crevasse is cut into the mesh (its lips' vertices dropped) and
// coloured from the ice's white through blue to its deep blue floor; grit seams streak the lower ice. The library's glacier ice
// (ice.glacier) tiles over it; ?ice=0 none. window._ice holds what was drawn for the checks (98-host-views.js).
window._ice=null;
const ICE=(function(){if(new URLSearchParams(location.search).get('ice')==='0')return null;
 const L_=STATION_LAND,P=L_.ICE,H=SHIGH.HAND,N=48;
 // the centre line resampled every 1.5 m: s (metres from the top), x, z, the unit tangent
 const seg=[];let tot=0;for(let i=0;i+1<P.length;i++){const l=Math.hypot(P[i+1][0]-P[i][0],P[i+1][1]-P[i][1]);seg.push(l);tot+=l;}
 const at=s=>{let i=0,a=s;while(i<seg.length-1&&a>seg[i]){a-=seg[i];i++;}const t=Math.min(1,a/seg[i]),p=P[i],q=P[i+1],tx=(q[0]-p[0])/seg[i],tz=(q[1]-p[1])/seg[i];return[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,tx,tz];};
 const step=1.5,rows=Math.floor(tot/step)+1,pos=new Float32Array(rows*(N+1)*3),col=new Float32Array(rows*(N+1)*3),uv=new Float32Array(rows*(N+1)*2);
 const WH=[.93,.96,1.0],BL=[.55,.75,.92],DEEP=[.12,.3,.55],GRIT=[.36,.34,.32];
 let crev=0,lastK=-1,maxThick=0;
 for(let r=0;r<rows;r++){const s=r*step,f=s/tot,[cx,cz,tx,tz]=at(s),nx=-tz,nz=tx,w=150+(70-150)*f;
  const thick=38*Math.sin(Math.PI*Math.min(1,.15+f*.95))*(1-.85*Math.pow(f,3))+2;maxThick=Math.max(maxThick,thick);
  // the crevasse spacing: 9 m on the headwall (the steep first third), widening to 30 m at the snout
  const lam=9+21*Math.pow(f,1.3);
  for(let j=0;j<=N;j++){const u=j/N*2-1,x=cx+nx*u*w*.5,z=cz+nz*u*w*.5,g=terrainH(x,z);
   // the arc: bowed downstream by u^2, its apex drifting across the flow by the hand, a little more for each crevasse
   const phase=(s-.22*w*.5*u*u)/lam,k=Math.floor(phase),apex=H*.35*Math.sin(k*.6),arc=(s-.22*w*.5*(u-apex)*(u-apex))/lam,fr=arc-Math.floor(arc);
   const lens=Math.sqrt(Math.max(0,1-u*u)),depth=Math.min(thick*.7,6+10*(1-f))*lens,cv=fr<.14?Math.sin(fr/.14*Math.PI):0;
   const y=g+thick*lens+.4-depth*cv*(f<.9?1:0);
   const o=(r*(N+1)+j);pos[o*3]=x;pos[o*3+1]=y;pos[o*3+2]=z;uv[o*2]=x/9;uv[o*2+1]=z/9;
   let c=WH.slice();const b=smooth(0,.6,cv);for(let q=0;q<3;q++)c[q]=c[q]+(BL[q]-c[q])*Math.min(1,b*1.4)+(DEEP[q]-BL[q])*Math.max(0,b*1.4-.4);
   const gs=smooth(.9,1,Math.abs(Math.sin(u*9+s*.004)))*smooth(.35,.8,f)*.5;for(let q=0;q<3;q++)c[q]=c[q]+(GRIT[q]-c[q])*gs;
   col[o*3]=c[0];col[o*3+1]=c[1];col[o*3+2]=c[2];}
  const k=Math.floor(s/lam);if(k!==lastK){crev++;lastK=k;}}
 const idx=[];for(let r=0;r+1<rows;r++)for(let j=0;j<N;j++){const a=r*(N+1)+j,b=a+N+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();
 const L=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('shigh','ice.glacier'):null,map=L?KMAT.textures(L,{aniso:8}).map:null;
 if(map)map.wrapS=map.wrapT=THREE.RepeatWrapping;
 const mat=new THREE.MeshStandardMaterial({map,vertexColors:true,roughness:.32,metalness:0,color:0xffffff});
 const mesh=new THREE.Mesh(g,mat);mesh.userData.host=true;mesh.userData.inspectLabel='The icefall (a cirque glacier, its crevasses curving)';scene.add(mesh);
 const c0=at(0),c1=at(tot);
 REGISTER({name:'The icefall of the Whorl Crown\'s cirque',kind:'ice',x:(c0[0]+c1[0])/2,z:(c0[1]+c1[1])/2,y:terrainH((c0[0]+c1[0])/2,(c0[1]+c1[1])/2)-20,r:tot*.55,h:120});
 window._ice={length:Math.round(tot),rows,crevasses:crev,maxThick:Math.round(maxThick),tris:idx.length/3,map:!!map};
 return{mesh,mat,tot};})();
