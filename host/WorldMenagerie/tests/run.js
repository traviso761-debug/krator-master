// Test runner for the pure modules, run with gjs (GNOME's JavaScript engine, ES modules supported):
//     gjs -m tests/run.js            (or ./sitectl test)
// Each tests/*.test.js exports `tests`, an object of name -> function; a test fails by throwing.
import Gio from 'gi://Gio';
const here=Gio.File.new_for_uri(import.meta.url).get_parent();
const names=[];const en=here.enumerate_children('standard::name',0,null);let info;while((info=en.next_file(null)))if(info.get_name().endsWith('.test.js'))names.push(info.get_name());names.sort();
let pass=0,fail=0;
for(const n of names){const mod=await import(here.get_child(n).get_uri());
  for(const [name,fn] of Object.entries(mod.tests)){try{await fn();pass++;print(`  ok    ${n}: ${name}`);}catch(e){fail++;print(`  FAIL  ${n}: ${name}\n        ${e.message||e}`);}}}
print(`${pass} passed, ${fail} failed`);
if(fail)imports.system.exit(1);
