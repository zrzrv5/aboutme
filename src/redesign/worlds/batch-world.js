import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Preserve independent hover/picking roots and every animated transform.
// Only bake stationary children into their nearest such root.
export function batchWorld(scene,owned) {
  scene.updateMatrixWorld(true);
  const roots=[scene];
  for(let index=0;index<roots.length;index++) {
    const root=roots[index],inverse=root.matrixWorld.clone().invert(),buckets=new Map();
    const visit=node=> {
      if(node!==root&&(node.userData.id||node.userData.dynamic)) { roots.push(node);return; }
      if(node!==root&&(node.isMesh||node.isLineSegments)&&node.visible&&!Array.isArray(node.material)) {
        const material=node.material;
        if(!material.transparent||node.isLineSegments||material.blending===THREE.AdditiveBlending||material.userData.batchSafe) {
          const key=[node.isLineSegments?'line':'mesh',material.uuid,node.castShadow,node.receiveShadow,!!node.geometry.attributes.color].join(':');
          if(!buckets.has(key))buckets.set(key,[]);
          buckets.get(key).push(node);
        }
      }
      for(const child of node.children)visit(child);
    };
    visit(root);
    for(const nodes of buckets.values()) {
      if(nodes.length<2)continue;
      const pieces=nodes.map(node=> {
        const geometry=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();
        // All untextured world materials only need these attributes.
        for(const name of Object.keys(geometry.attributes))if(!['position','normal','color','uv'].includes(name))geometry.deleteAttribute(name);
        if(!node.material.map&&!node.material.normalMap)geometry.deleteAttribute('uv');
        geometry.clearGroups();
        return geometry.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,node.matrixWorld));
      });
      const geometry=mergeGeometries(pieces,false);
      pieces.forEach(g=>g.dispose());
      if(!geometry)continue;
      geometry.computeBoundingSphere();geometry.computeBoundingBox();owned.add(geometry);
      const first=nodes[0],merged=first.isLineSegments?new THREE.LineSegments(geometry,first.material):new THREE.Mesh(geometry,first.material);
      merged.name=`${root.name||'landscape'} / batched ${first.isLineSegments?'edges':'surfaces'}`;
      merged.castShadow=first.castShadow;merged.receiveShadow=first.receiveShadow;root.add(merged);
      nodes.forEach(node=>node.removeFromParent());
    }
  }
  const live=new Set();scene.traverse(node=>{if(node.geometry)live.add(node.geometry);});
  for(const geometry of owned)if(!live.has(geometry)){geometry.dispose();owned.delete(geometry);}
  scene.traverse(node=> {
    if(!node.userData.id&&!node.userData.dynamic&&!node.isCamera&&!node.isLight) {node.updateMatrix();node.matrixAutoUpdate=false;}
  });
}
