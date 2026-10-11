import * as THREE from 'three';

// Asset geometry, palette and UVs remain intact. The host owns loaded GPU
// resources; late requests are disposed if their world has already unmounted.
function resources(root) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  root.traverse(node=> {
    if(node.geometry) geometries.add(node.geometry);
    for(const material of node.material ? Array.isArray(node.material)?node.material:[node.material] : []) {
      materials.add(material);
      for(const value of Object.values(material)) if(value?.isTexture) textures.add(value);
    }
  });
  return {geometries,materials,textures};
}

export async function loadWorldModel(parent,url,{fit,onReady,isDisposed,adopt,invalidate}) {
  try {
    const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
    if(isDisposed()) return;
    const {scene}=await new GLTFLoader().loadAsync(url);
    const owned=resources(scene);
    if(isDisposed()) {
      owned.geometries.forEach(value=>value.dispose());
      owned.materials.forEach(value=>value.dispose());
      owned.textures.forEach(value=>{value.dispose();value.image?.close?.();});
      return;
    }
    adopt(owned);
    scene.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(scene);
    const size=bounds.getSize(new THREE.Vector3());
    const center=bounds.getCenter(new THREE.Vector3());
    const scale=Math.min(...fit.map((limit,axis)=>limit/Math.max(size.getComponent(axis),.0001)));
    scene.scale.setScalar(scale);
    scene.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    scene.traverse(node=> {
      if(node.isMesh) { node.castShadow=true; node.receiveShadow=true; }
    });
    parent.add(scene);
    onReady?.();
    invalidate();
  } catch(error) {
    if(!isDisposed()) console.error('Could not load the AmiiBot model:',error);
  }
}
