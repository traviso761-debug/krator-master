// ================================================================= GODSTEP — station 2's leaf: the rille's ground classes and its pass (the red stalk fields)
// PLAN.md sections 3 and 5: the Talovolci farm the red guyed stalk (Redostalcos) on the rille's floor under the springs, where the water keeps
// the ground wet; nowhere else on the head step is wet enough. The pass reads the stream's own wet field (core/water: WATER.fields over the
// stream's box, its `flow` the metres to running water) and the fields' polygons (the host's core/mask raster, BIO.host.fields.field), and
// lays the stalks in rows (GSTEP.stalks, 51). Engine-independent: through BIO and the host's fields.
GSTEP.GROUND.field={col:0x5c3a26,name:'The Talovolci\'s stalk fields (worked soil, wet from the stream)',k:.9};
GSTEP.GROUND.seep={col:0x18181a,name:'The spring\'s seep (the wall wet and dark under it)',k:.6};
GSTEP.CLASSES.push('field','seep');
/* `playa` is the host's "keep the loose stuff off" here (the fields, the stream, the walked skylight's hole): no pan to paint */
{const g0=GSTEP.groundAt;GSTEP.groundAt=function(x,z,o){o=g0(x,z,o);o.playa=0;return o;};}
GSTEP.TAGS=Object.assign({},GSTEP.TAGS,{koppen:['Dsc','Dfc'],riparian:'spring'});
// the stalks' wet: 1 within ~25 m of the stream's water, 0 past ~90 m (WATER.fieldAt's flow distance), only where the fields are
GSTEP.PASSES.push({name:'rille',fn(R,q,box){const H=BIO.host,F=H.fields;
 const WF=GSTEP.RILLE_WATER||(GSTEP.RILLE_WATER=WATER.fields({box:GSTEP.RILLE_WATERBOX,cell:4,ground:H.terrainH,surfaces:GSTEP.RILLE_SURFACES}));
 const wet=(x,z)=>{const f=WATER.fieldAt(WF,x,z);return f.depth>0?0:1-BIO.fn.smooth(25,90,f.flow);};
 GSTEP.RILLE_WET=wet;
 /* the stalks' own wet gated by the fields (GSTEP.stalks snaps a stalk to its row after testing the field, so an edge row could step out) */
 const fieldWet=(x,z)=>F.field(x,z)>.5&&GSTEP.RILLE_FIELD(x,z)?wet(x,z):0;
 const st=GSTEP.stalks({box:GSTEP.RILLE_WATERBOX,q,wet:fieldWet,min:.55,h:[3.5,6],cell:2,rows:{a:GSTEP.RILLE_ROWS,sp:1.7,at:(x,z)=>F.field(x,z)>.5&&GSTEP.RILLE_FIELD(x,z),only:true}});
 return st;}});
