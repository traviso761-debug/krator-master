// ================================================================= HOST - the views of the cloud slopes (station 2; the Vale's are src/98-host-views.js)
// Placed on the land's own frame (45b: u south-east across the ridge, v along it) and found in the built scene (the stream, a cousin, the tea, the cherries)
const VIEWS={};
(function(){const S2=Math.SQRT1_2,W=(u,v)=>[(u+v)*S2,(u-v)*S2],G=(x,z)=>terrainH(x,z);
 const at=(u,v,dh)=>{const p=W(u,v);return[p[0],G(p[0],p[1])+dh,p[1]];};
 const look=(name,a,b)=>{VIEWS[name]=[a[0],a[1],a[2],b[0],b[1],b[2]];};
 const c0=CL.crestU(0),c1=CL.crestU(1200),c2=CL.crestU(-1500);
 look('Over the cloud sea',at(c0-300,-200,180),at(c0+2600,300,-250));                 /* from above the crest's lee: the belt's top over the windward face */
 look('The crest',at(c1-150,1200,40),at(c1+100,700,10));
 look('Into the fog',at(c0+1500,-600,12),at(c0+1900,-300,20));                          /* inside the belt */
 look('The cloud forest',at(c0+1250,500,18),at(c0+1600,850,8));
 look('The windward face',at(c0+3600,-1000,90),at(c0+1200,-200,300));                   /* from below: the forest climbing into the cloud */
 look('The leeward shoulders',at(c2-900,-1500,60),at(c2-2600,-2300,-40));
 {const P=CL.stream.P,i=Math.round(P.length*.45),q=P[Math.max(0,i-10)],p=P[i];VIEWS['The ravine stream']=[q[0],G(q[0],q[1])+14,q[1],p[0],G(p[0],p[1])+2,p[1]];}
 const PL=(typeof CLOUD_KIN!=='undefined'&&CLOUD_KIN.placed)||[],near=k=>{let b=null,bd=1e9;PL.forEach(p=>{if(p.key!==k||p.lv!==2)return;const d=BIO.lodD(p.x,p.z);if(d<bd){bd=d;b=p;}});return b;};
 const spec=(name,k,dist,h,th)=>{const p=near(k);if(!p)return;for(let q=0;q<12;q++){const a=q/12*TAU,cx=p.x+Math.cos(a)*dist,cz=p.z+Math.sin(a)*dist;if(Math.abs(G(cx,cz)-p.y)<dist*.6){VIEWS[name]=[cx,G(cx,cz)+h,cz,p.x,p.y+th,p.z];return;}}};
 spec('A cloud trumpet','cloudtrumpet',34,6,12);spec('A cloud haze blossom','cloudhaze',28,4,8);spec('Mist tree-ferns','mistfern',18,3,6);
 spec('The cloud cherries','cloudcherry',26,4,5);spec('Mist tea on the wet face','tea',9,2,.6);
 {let best=null;for(let z=-2800;z<=2800;z+=100)for(let x=-2800;x<=2800;x+=100){const k=CL.terraceK(x,z);if(k>.8&&(!best||BIO.lodD(x,z)<best.d))best={x,z,d:BIO.lodD(x,z)};}
  if(best)VIEWS['The terraces']=[best.x+60,G(best.x+60,best.z+40)+16,best.z+40,best.x,G(best.x,best.z)+2,best.z];}
})();
