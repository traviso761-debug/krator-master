// ================================================================= HOST — the sealed portal on the rim (PLAN.md section 6)
// Where the Ancients' tunnels from Pluton come out on the caldera's rim: a sealed portal, its face turned into the caldera.
// A PLACEHOLDER the settlement and dungeon plan dresses (its place on the rim is that plan's: section 10): a plinth set into
// the crest, two pylons, a lintel and the seal, in the Ancients' white render (the library's concrete.ancient when packed).
// A record first (core/tags: class 'infrastructure', culture 'ancient'), then drawn; an obstacle for the kit (45).
function buildPortal(){const P=PORTAL,T=THREE;
 const rec={name:P.name,x:P.x,z:P.z,y:P.y-2,r:20,h:18,kind:'structure',host:true,tags:P.tags,cls:'infrastructure'};REGISTER(rec);
 const map=hostGroundLib('portal',null);
 const mat=new T.MeshStandardMaterial({color:map?0xffffff:0xd8d4cc,map:map,roughness:.82,metalness:0});
 const seal=new T.MeshStandardMaterial({color:0x9a968e,map:map,roughness:.6,metalness:.25});
 const grp=new T.Group();grp.position.set(P.x,0,P.z);grp.rotation.y=P.ry;
 // the ground under the footprint: the plinth sits on its lowest point and is buried into the highest
 let lo=1e9,hi=-1e9;for(let a=-16;a<=16;a+=4)for(let b=-14;b<=14;b+=4){const c=Math.cos(P.ry),s=Math.sin(P.ry),x=P.x+a*c+b*s,z=P.z-a*s+b*c,y=terrainH(x,z);lo=Math.min(lo,y);hi=Math.max(hi,y);}
 const y0=lo-1.5,box=(w,h,d,x,y,z,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.userData.host=true;o.userData.inspectLabel=P.name;grp.add(o);return o;};
 box(34,hi-y0+2.2,28,0,(y0+hi+2.2)/2,0,mat);   /* the plinth */
 const top=hi+2.2;
 box(4.6,P.h,5,-7.3,top+P.h/2,8,mat);box(4.6,P.h,5,7.3,top+P.h/2,8,mat);   /* the pylons, at the plinth's caldera edge */
 box(19.2,3.2,6.2,0,top+P.h+1.6,8,mat);   /* the lintel */
 box(10,P.h-.6,1.2,0,top+(P.h-.6)/2,7.2,seal);   /* the seal, recessed a little behind the pylons' faces */
 box(10.6,.5,3,0,top+.25,9.2,mat);   /* the sill */
 scene.add(grp);grp.updateMatrixWorld(true);
 P.top=top;P.drawn=grp;return grp;}
