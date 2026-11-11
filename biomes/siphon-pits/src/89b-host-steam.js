// ================================================================= HOST — after the atmosphere is bound (89a): the snow off the hot ground, the steam, the deck's light
// THE SNOW: never on ground over 0 degC (KTHERM's snow mask: ATMOS.snowBare). Before the bake (89z).
if(THERM&&ATMOS.snowBare){try{ATMOS.snowBare(THERM.snowMask({box:THERM_BOX,cell:8}));}catch(e){reportErr('snow bare: '+e.stack);}}
// THE STEAM (core/atmos fx/smokegroups): a ring of mouths round each vent; the woolly siphons' lips breathe too (89z adds them after the build)
const STEAM_GROUPS={};
VENTS.forEach((v,i)=>{const L0=[],n=v.reach>=200?7:4;for(let k=0;k<n;k++){const a=k/n*TAU+.4*i,r=k?Math.min(v.reach*.2,6+5*(k%3)):0,x=v.x+Math.cos(a)*r,z=v.z+Math.sin(a)*r;
 L0.push([x,terrainH(x,z)+.4,z,'steam']);}STEAM_GROUPS['v'+i]={emitters:L0,n:v.reach>=200?20:12,k:.7};});
// THE DECK'S LIGHT (station 3; the Arete's pits a little): under the lid the sky's fog colour is tinted amber and the sun dimmed, by how deep the eye is
// under it. The mist has no colour of its own in core/atmos (its colour is the page's fog colour: sky/89-atmos-j-fog.js, cM = fc), so the page tints the
// fog colour per frame after the sky sets it (KNOWN_ISSUES.md: a mist tint in the fog chunk is a proposed core change)
const DECK_TINT={amber:new THREE.Color(SITE.fog&&SITE.fog.color||'#d4a359'),k:0};
function deckView(){if(!DECK)return;const under=smooth(DECK.y+40,DECK.y-60,camera.position.y),k=(SKEY==='pitfloor'?.85:.35)*under;DECK_TINT.k=k;if(k<=0)return;
 scene.fog.color.lerp(DECK_TINT.amber,k);sun.intensity*=1-.55*k;const hemi=scene.children.find(o=>o.isHemisphereLight);if(hemi)hemi.color.lerp(DECK_TINT.amber,k*.5);}
// THE DECK'S LID (station 3): a sheet at the deck's top, so from under it the sky is the deck's underside (the fog takes it to amber) and from the rim the
// deck is a flat sea of amber cloud filling the maar. Drawn, not a fog layer: the height fog's mist ends at its lid, the sky dome does not take fog
const DECK_LID=(function(){if(SKEY!=='pitfloor'||new URLSearchParams(location.search).get('lid')==='0')return null;const r=SITE.maar.r+60;
 const g=new THREE.CircleGeometry(r,96);g.rotateX(Math.PI/2);   /* facing down: seen from below; DoubleSide for the rim's view */
 const m=new THREE.MeshBasicMaterial({color:0xc8964e,side:THREE.DoubleSide,transparent:true,opacity:.9,depthWrite:false});   /* unlit: the deck glows with the light it holds, amber from above and below */
 const mesh=new THREE.Mesh(g,m);mesh.position.y=SITE.fog.top;mesh.renderOrder=5;mesh.userData.inspectLabel='The amber deck (the inversion\'s lid, 2,580 m)';scene.add(mesh);
 REGISTER({name:'The amber deck (the inversion\'s lid at 2,580 m: 303 m over the floor)',x:0,z:0,y:SITE.fog.top-2,r:r*.9,h:6});return mesh;})();
