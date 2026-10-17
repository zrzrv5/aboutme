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

// The same look for an InstancedMesh: tint from instanceColor, strength and
// fade from a per-instance `instanceAlpha` attribute, so one draw call carries
// every atom or every bond of the NAIIVE crystal.
export function createHologramInstanceMaterial(time) {
  const material=new THREE.ShaderMaterial({
    uniforms:{uTime:time},
    transparent:true,depthWrite:false,blending:THREE.NormalBlending,side:THREE.DoubleSide,toneMapped:false,
    vertexShader:`attribute float instanceAlpha;
      varying vec3 vNormal; varying vec3 vView; varying float vHeight; varying vec3 vTint; varying float vAlpha;
      void main(){vec3 p=position;vec3 n=normal;
      #ifdef USE_INSTANCING
      p=(instanceMatrix*vec4(position,1.)).xyz;n=mat3(instanceMatrix)*normal;
      #endif
      #ifdef USE_INSTANCING_COLOR
      vTint=instanceColor;
      #else
      vTint=vec3(1.);
      #endif
      vAlpha=instanceAlpha;
      vec4 world=modelMatrix*vec4(p,1.);vec4 view=modelViewMatrix*vec4(p,1.);
      vNormal=normalize(normalMatrix*n);vView=-view.xyz;vHeight=world.y;gl_Position=projectionMatrix*view;}`,
    fragmentShader:`uniform float uTime;
      varying vec3 vNormal;varying vec3 vView;varying float vHeight;varying vec3 vTint;varying float vAlpha;
      void main(){if(vAlpha<.003)discard;
      float rim=pow(1.-abs(dot(normalize(vNormal),normalize(vView))),1.5);
      float scan=.5+.5*sin(vHeight*38.-uTime*2.2);
      float flicker=.97+.03*sin(uTime*21.)*sin(uTime*6.1);
      float alpha=clamp((.48+.22*rim+.10*scan)*vAlpha*flicker,0.,.96);
      gl_FragColor=vec4(vTint*(.8+.65*rim),alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      }`,
  });
  return material;
}
