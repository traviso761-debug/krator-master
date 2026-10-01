export function eq(a,b,msg){if(a!==b)throw new Error((msg||'not equal')+`: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`);}
export function near(a,b,eps,msg){if(Math.abs(a-b)>(eps||1e-9))throw new Error((msg||'not near')+`: ${a} vs ${b}`);}
export function ok(v,msg){if(!v)throw new Error(msg||'expected truthy');}
export function deepEq(a,b,msg){const x=JSON.stringify(a),y=JSON.stringify(b);if(x!==y)throw new Error((msg||'not deep-equal')+`: ${x.slice(0,200)} !== ${y.slice(0,200)}`);}
export function readJSON(relToTests){const Gio=imports.gi.Gio;const f=Gio.File.new_for_uri(import.meta.url).get_parent().resolve_relative_path(relToTests);const [,bytes]=f.load_contents(null);return JSON.parse(new TextDecoder().decode(bytes));}
