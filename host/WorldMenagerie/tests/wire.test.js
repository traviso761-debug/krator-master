// The wireframe toggle, on the one kind of mesh that broke it: a mesh with geometry groups carries an array
// of materials (a Flesh Pit sign is one printed face and five plain ones), and the toggle used to treat that
// array as a material and die reading its userData. This loads the real three.js bundle, builds a scene with
// one such mesh and one ordinary one, and runs the toggle through every mode and back.
import GLib from 'gi://GLib';
import {createWire} from '../src/core/wire.js';
import {eq,ok} from './assert.js';

function three(){
  if(globalThis.THREE)return globalThis.THREE;
  const path=GLib.build_filenamev([GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]),
    '..','vendor','three','three.min.js']);
  const [,bytes]=GLib.file_get_contents(path);
  globalThis.self=globalThis;
  (0,eval)(new TextDecoder().decode(bytes));
  return globalThis.THREE;
}

export const tests={
  'multi-material meshes get a wire and their materials are restored'(){
    const THREE=three();
    const scene=new THREE.Scene();
    const edge=new THREE.MeshStandardMaterial(),face=new THREE.MeshStandardMaterial();
    scene.add(new THREE.Mesh(new THREE.BoxGeometry(2,1,0.2),[edge,edge,edge,edge,face,edge]));
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(1),new THREE.MeshStandardMaterial()));
    const w=createWire({THREE,scene,animHooks:[]});
    for(const mode of ['edges','triangles','off','edges'])w.set(mode);
    eq(w.state.n,2,'both meshes get a wire');
    eq(w.state.solids.size,3,'every distinct material is tracked, not the array');
    w.under('hidden');
    eq(face.colorWrite,false,'hidden-line mode hides the printed face too');
    w.set('off');
    ok(face.colorWrite&&face.depthWrite&&edge.colorWrite,'turning the wire off restores every material');
  },
};
