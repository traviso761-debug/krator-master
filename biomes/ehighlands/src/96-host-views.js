// ================================================================= HOST — the page's preset views, and where its negative controls look (station 1)
// Each station replaces this file (stations/<name>/96-host-views.js): VIEWS (found on the map, not typed: a plant preset
// frames the nearest built hero of its species) and NEG, the points the host checks' negatives use (99-host-take.js):
// NEG.wet [x, y, z] a point under the water, NEG.cliff [x, z] the steepest rock, NEG.env where the field contract is sampled.
// Runs after the build (89z). The helpers (gh, look, SPI, nearTree, atTree, across, GAZ, SAZ) are 95v-host-viewkit.js, every station's.
// the best point of a zone near the spine (scored by the kit's zones on a 40 m sweep)
const ZP=(function(){const S={gully:Z=>Z.gully,scree:Z=>Z.scree,fell:Z=>Z.fell,dry:Z=>Z.dry,bog:Z=>Z.bog};const best={},bs={};for(const k in S){best[k]=[0,0];bs[k]=-1e9;}
 for(let z=-2400;z<=2400;z+=40)for(let x=-2400;x<=2400;x+=40){if(Math.hypot(x,z)>2300)continue;const Z=EHIGH.zones(x,z),ld=BIO.lodD(x,z);for(const k in S){const s=S[k](Z)-ld/2000;if(s>bs[k]){bs[k]=s;best[k]=[x,z];}}}return best;})();
const WG=GULLY[0],WGZ=zF(WG.x0)+330;
const VIEWS={
 'The Mother Cushion, under the giant':(function(){const cx=MOTHER.x-GX*820-GZ*120,cz=MOTHER.z-GZ*820+GX*120;return[cx,gh(cx,cz,5),cz,MOTHER.x+GX*60,gh(MOTHER.x,MOTHER.z,10),MOTHER.z+GZ*60];})(),
 'On the Mother Cushion':(function(){const x=MOTHER.x-GX*90+40,z=MOTHER.z-GZ*90+30;return[x,gh(x,z,4.5),z,x+GX*60,gh(x+GX*60,z+GZ*60,2),z+GZ*60];})(),
 'Vigil spikes in flower':(function(){const T=nearTree('vigil',FLOWERING.x,FLOWERING.z,10,{stage:'flower'});return atTree(T,T.H*1.6,GAZ+Math.PI/2,2,.5);})(),
 'Every spike leans to the giant':(function(){const x=FLOWERING.x-GZ*-330,z=FLOWERING.z+GX*-330;return[x,gh(x,z,6),z,FLOWERING.x,gh(FLOWERING.x,FLOWERING.z,8),FLOWERING.z];})(),
 'Dead torches':(function(){const T=nearTree('vigil',FLOWERING.x+600,FLOWERING.z,8,{stage:'torch'});return atTree(T,T.H*1.3,GAZ+Math.PI*.6,2.5,.45);})(),
 'Glass towers, backlit':(function(){const T=nearTree('glasstower',ZP.scree[0],ZP.scree[1],2.6);return atTree(T,6,SAZ+Math.PI,.9,.55);})(),
 'Wormwick in the turf':(function(){const W=EHIGH.WICKS||[];const w=W.slice().sort((a,b)=>BIO.lodD(a[0],a[1])-BIO.lodD(b[0],b[1]))[0]||[ZP.fell[0],ZP.fell[1]];return[w[0]+1.2,gh(w[0]+1.2,w[1]+.7,.6),w[1]+.7,w[0],gh(w[0],w[1],.05),w[1]];})(),
 'Tower honey on the cliff':(function(){const c=(EHIGH.COMBS||[]).slice().sort((a,b)=>BIO.lodD(a[0],a[2])-BIO.lodD(b[0],b[2]))[0];if(!c)return look(WG.x0+60,WGZ,4,WG.x0,WGZ,3);
  const e=1.5,gx=terrainH(c[0]+e,c[2])-terrainH(c[0]-e,c[2]),gz=terrainH(c[0],c[2]+e)-terrainH(c[0],c[2]-e),gl=Math.hypot(gx,gz)||1,nx=-gx/gl,nz=-gz/gl;
  const cx=c[0]+nx*5-nz*1.5,cz=c[2]+nz*5+nx*1.5;return[cx,Math.max(gh(cx,cz,1.4),c[1]-.3),cz,c[0],c[1]-.5,c[2]];})(),
 'A ragbark gully':(function(){const z0=WGZ-120,z1=WGZ+260;return[xg(WG,z0),gh(xg(WG,z0),z0,7),z0,xg(WG,z1),gh(xg(WG,z1),z1,6),z1];})(),
 'Ragbark':(function(){const T=nearTree('ragbark',xg(WG,WGZ),WGZ,7);return atTree(T,12,GAZ+Math.PI/2,2,.5);})(),
 'Poured cushions over the boulders':(function(){const T=nearTree('cushion',ZP.fell[0],ZP.fell[1],0,{minR:3.5});return atTree(T,T.crownR*3,GAZ+Math.PI*.75,2.2,.2);})(),
 'Woolbacks on the fell':(function(){const T=nearTree('woolback',ZP.fell[0],ZP.fell[1]);return atTree(T,7,GAZ+Math.PI*1.3,1.8,.3);})(),
 'Thorn cushions in flower':(function(){const T=nearTree('thorn',ZP.dry[0],ZP.dry[1]);return atTree(T,4.5,GAZ,1.4,.4);})(),
 'Hoar cereus':(function(){const T=nearTree('cereus',ZP.dry[0],ZP.dry[1]);return atTree(T,8,GAZ+Math.PI/2,1.8,.55);})(),
 'The bofedal and the frozen tarn':(function(){const x=BOG.x+380,z=BOG.z+60;return[x,gh(x,z,7),z,TARN.x,TARNL+2,TARN.z];})(),
 'From afar':look(-900,-2400,260,300,600,60),
};
const NEG={wet:[TARN.x,TARNL-3,TARN.z],
 /* the steepest rock on the west gully's walls (found, not typed) */
 cliff:(function(){let bx=0,bz=0,bs=-1;const G=GULLY[0];for(let z=zF(G.x0)+100;z<=zF(G.x0)+900;z+=4)for(let x=xg(G,z)-90;x<=xg(G,z)+90;x+=4){const s=FIELD.slope(x,z)*FIELD.rock(x,z);if(s>bs){bs=s;bx=x;bz=z;}}return[bx,bz];})(),
 env:[[0,0],[BOG.x,BOG.z],[MOTHER.x,MOTHER.z]]};
