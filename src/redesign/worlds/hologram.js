import * as THREE from 'three';

// A single forward pass, without bloom targets or a full-screen post stack.
export function createHologramMaterial(color,time,strength=1) {
  const material=new THREE.ShaderMaterial({
    uniforms:{uTint:{value:new THREE.Color(color)},uTime:time,uStrength:{value:strength}},
    transparent:true,depthWrite:false,blending:strength>=.8?THREE.NormalBlending:THREE.AdditiveBlending,side:THREE.DoubleSide,toneMapped:false,
    vertexShader:`varying vec3 vNormal; varying vec3 vView; varying float vHeight;
      void main(){vec4 world=modelMatrix*vec4(position,1.);vec4 view=modelViewMatrix*vec4(position,1.);
      vNormal=normalize(normalMatrix*normal);vView=-view.xyz;vHeight=world.y;gl_Position=projectionMatrix*view;}`,
    fragmentShader:`uniform vec3 uTint;uniform float uTime;uniform float uStrength;
      varying vec3 vNormal;varying vec3 vView;varying float vHeight;
      void main(){float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),1.5);
      float scan=.5+.5*sin(vHeight*38.-uTime*2.2);
      float alpha=clamp((.48+.22*rim+.10*scan)*uStrength,0.,.96);
      gl_FragColor=vec4(uTint*(.8+.65*rim),alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
  });
  material.userData.batchSafe=true;
  return material;
}
