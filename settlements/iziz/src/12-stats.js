// ---------------------------------------------------------------- per-type accounting
// One global tally, filled while the builders run. 90-scene.js sets TSTAT.cur
// to the site key ('skyA/1' = Skyscraper A, ruined) before each builder call
// and clears it after, so every mesh and every instanced item is charged to the
// type that made it. This is what makes the per-type triangle budgets in
// verify.py --assert measurable at all: the kit shares one InstancedMesh per
// item across all 33 types, so after kbake() there is no way to tell whose
// triangles are whose.
//
// Nothing here emits geometry or draws from the PRNG, so switching it on does
// not move a single rock. Keep it that way.
const TSTAT={cur:null,by:{},bad:[]};
function tcur(){const k=TSTAT.cur;if(k==null)return null;return TSTAT.by[k]||(TSTAT.by[k]={tris:0,inst:0,meshes:0});}
function triOf(g){if(!g)return 0;if(g.index)return g.index.count/3;const p=g.attributes&&g.attributes.position;return p?p.count/3:0;}
const _KTRI={};
function ktri(name){if(_KTRI[name]===undefined){const def=KIT.defs[name];_KTRI[name]=def?triOf(def.geo):0;}return _KTRI[name];}
function finite3(a){return !!a&&isFinite(a[0])&&isFinite(a[1])&&isFinite(a[2]);}
