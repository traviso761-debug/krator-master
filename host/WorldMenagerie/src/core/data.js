// Content files: numbers stay numbers; a string is an expression over the values defined above it, Math and
// rad(degrees); objects and arrays resolve member by member. "_" keys are comments. See data/cities/iziz.json.
export const DATA_FN={Math,rad:d=>d*Math.PI/180};
export function dataExpr(str,scope){try{return Function(...Object.keys(scope),'"use strict";return ('+str+')')(...Object.values(scope));}catch(e){throw new Error('data expression "'+str+'": '+e.message);}}
export function dataValue(node,scope){if(typeof node==='string')return dataExpr(node,scope);if(Array.isArray(node))return node.map(v=>dataValue(v,scope));
  if(node&&typeof node==='object'){const o={};for(const k in node)if(k!=='_')o[k]=dataValue(node[k],scope);return o;}return node;}
// a city file: every top-level parameter may refer to the ones above it; the named sections are left for their own readers
export function resolveCity(c,skipKeys){const skip=new Set(skipKeys||['name','note','districts','views','constellations','art','wall']),scope={...DATA_FN};
  for(const k in c)if(!skip.has(k))scope[k]=dataValue(c[k],scope);for(const k in DATA_FN)delete scope[k];scope.wall=c.wall;return scope;}
