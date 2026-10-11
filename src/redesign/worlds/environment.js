import * as THREE from 'three';
import { batchWorld } from './batch-world';
import { createWorldProfiler } from './performance';
import { createWorldCamera } from './world-camera';
import { buildCampuses } from './campuses';
import { buildPlaza } from './plaza';
import { buildWorkplaces } from './workplaces';
import { buildProjectObjects } from './project-objects';
import { loadWorldModel } from './model-assets';
import { GAME_AREAS, PROJECT_LAYOUT, STUDY_OFFSET_Z, campusPoint, PLAZA_LAYOUT } from './world-layout';
import { byId } from './data';
import { SHORE, RIVER_POINTS, RIVER_OUTLET, RIVER_SOURCE, riverHeightAt, waterfallGeometry, CROSSINGS, DOCK, MOUNTAIN_TRAILS, mountainGeometry, mountainHeightAt, ribbonGeometry } from './landscape';

// Editable geometry, with the user-supplied AmiiBot GLB on its NFC display.
// Campus parcels and paths leave open ground between buildings. Coordinates: x / height / z.
const LABELS = Object.fromEntries(GAME_AREAS.map(area=>[area.id,area.anchor]));
const REGION_HOME = {research:'isu',ames:'@quests',...Object.fromEntries(GAME_AREAS.map(area=>[area.id,area.home]))};
const COLORS = {
  diorama: { sea: '#83bdcb', grass: '#97b66f', grassDark: '#799e68', sand: '#ded0a8', rock: '#abb5a7', green: '#42765c', leaf: '#709851', path: '#e6d4ae', wall: '#eee3c7', roof: '#b9684d', blue: '#56a4ae', trim: '#fff2d4' },
  illustrated: { sea: '#d8e6df', grass: '#c3cd9c', grassDark: '#a7bd8a', sand: '#e9dfbf', rock: '#bfc4b4', green: '#6c8c77', leaf: '#91aa78', path: '#f1e5c9', wall: '#fbf0d7', roof: '#bc866b', blue: '#98c0ba', trim: '#fff8e2' },
  pixel: { sea: '#77b7c4', grass: '#92b66a', grassDark: '#719a60', sand: '#d6c799', rock: '#9cafa0', green: '#366f54', leaf: '#649749', path: '#e0cd9d', wall: '#e9e2bd', roof: '#b9624b', blue: '#519b9b', trim: '#f8edc7' },
};

function islandShape(points, scale = 1) {
  const shape = new THREE.Shape();
  points.forEach(([x,z], i) => i ? shape.lineTo(x * scale, -z * scale) : shape.moveTo(x * scale, -z * scale));
  shape.closePath();
  return shape;
}

function roofGeometry(w, h, d) {
  const vertices = [-w/2,0,-d/2, w/2,0,-d/2, 0,h,-d/2, -w/2,0,d/2, w/2,0,d/2, 0,h,d/2];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex([0,2,1, 3,4,5, 0,3,5,0,5,2, 1,2,5,1,5,4, 0,1,4,0,4,3]);
  const flat = geometry.toNonIndexed();
  flat.computeVertexNormals();
  geometry.dispose();
  return flat;
}

export function createEnvironment(canvas, { art, onSelect, onHover, onLayout, onMiss, surface = canvas, view, onInteract, onViewReset }) {
  const c = COLORS[art] ?? COLORS.diorama;
  const illustrated = art === 'illustrated';
  const pixel = art === 'pixel';
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(c.sea);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !pixel, alpha: false, powerPreference: 'low-power' });
  const profiler=import.meta.env.DEV && new URLSearchParams(window.location.search).has('perf') ? createWorldProfiler(renderer,surface,scene) : null;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = illustrated ? 1.12 : 1;
  renderer.shadowMap.enabled = !pixel;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const camera = new THREE.OrthographicCamera(-15,15,11.25,-11.25,.1,100);
  camera.position.set(0,34,pixel ? 20 : 24);
  camera.lookAt(0,0,0);
  camera.updateMatrixWorld();

  scene.add(new THREE.HemisphereLight('#fff5dc','#709392',1.7));
  const sun = new THREE.DirectionalLight('#fff3dc',2.3);
  sun.position.set(-10,22,10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536,1536);
  renderer.shadowMap.autoUpdate=false;
  Object.assign(sun.shadow.camera,{ left:-19,right:19,top:21,bottom:-21,near:.5,far:75 });
  sun.shadow.normalBias = .04;
  sun.shadow.bias = -.0002;
  sun.shadow.radius = 3;
  scene.add(sun);

  let disposed=false;
  const materials = new Map();
  const modelMaterials = new Set();
  const geometries = new Set();
  const textures = new Set();
  const clickables = [];
  const objects = new Map();
  const animations = [];
  const outlines = new THREE.LineBasicMaterial({ color: '#53655b', transparent: true, opacity: .45 });
  const gradient = new THREE.DataTexture(new Uint8Array([105,180,245]),3,1,THREE.RedFormat);
  gradient.minFilter = gradient.magFilter = THREE.NearestFilter;
  gradient.needsUpdate = true;
  textures.add(gradient);

  function material(color, opts = {}) {
    const key = color + JSON.stringify(opts);
    if (!materials.has(key)) {
      const props = { color, ...opts };
      if (illustrated) { delete props.roughness; delete props.metalness; }
      materials.set(key, illustrated ? new THREE.MeshToonMaterial({ ...props, gradientMap: gradient }) : new THREE.MeshStandardMaterial({ roughness: .86, metalness: 0, ...props }));
    }
    return materials.get(key);
  }

  function mesh(parent, geometry, color, position = [0,0,0], outline = false, opts = {}) {
    geometries.add(geometry);
    const model = new THREE.Mesh(geometry, material(color, opts));
    model.position.set(...position);
    model.castShadow = true;
    model.receiveShadow = true;
    parent.add(model);
    if (illustrated && outline) {
      const edges = new THREE.EdgesGeometry(geometry,30);
      geometries.add(edges);
      model.add(new THREE.LineSegments(edges,outlines));
    }
    return model;
  }
  const box = (parent,w,h,d,color,x=0,y=0,z=0,outline=false) => mesh(parent,new THREE.BoxGeometry(w,h,d),color,[x,y,z],outline);
  const cylinder = (parent,top,bottom,height,color,x=0,y=0,z=0,n=12) => mesh(parent,new THREE.CylinderGeometry(top,bottom,height,n),color,[x,y,z],true);
  const ball = (parent,r,color,x=0,y=0,z=0) => mesh(parent,new THREE.IcosahedronGeometry(r,art === 'diorama' ? 1 : 0),color,[x,y,z]);

  function group(name, x, z, parent=scene) {
    const g = new THREE.Group();
    g.name = name;
    g.position.set(x,.35,z);
    parent.add(g);
    return g;
  }

  function register(g,id,title,stand) {
    // Size conveys each region's hierarchy; placement includes plateau height.
    // Scale an inner group so hovering cannot erase the intended size.
    const placement=PROJECT_LAYOUT[id];
    if(placement) {
      const model=new THREE.Group();
      while(g.children.length) model.add(g.children[0]);
      model.scale.setScalar(placement.scale);
      g.add(model);
      g.position.fromArray(placement.at);
    }
    g.userData = { id, title:byId[id]?.roleLabel ?? byId[id]?.title ?? title, location:byId[id]?.location, baseY:g.position.y, stand: placement?.stand ?? stand ?? [g.position.x,g.position.y,g.position.z + 1.5] };
    clickables.push(g);
    objects.set(id,g);
    return g;
  }

  function terrain(name, points, scale, depth, y, color, bevel) {
    const geometry = new THREE.ExtrudeGeometry(islandShape(points,scale),{depth,bevelEnabled:bevel,bevelSize:.18,bevelThickness:.12,bevelSegments:2,steps:1,curveSegments:1});
    geometry.rotateX(-Math.PI/2);
    const model = mesh(scene,geometry,color,[0,y,0],true);
    model.name = name;
    return model;
  }
  terrain('island / limestone foundation',SHORE,1,1.05,-.95,c.rock,true);
  terrain('island / sandy shore',SHORE,1.025,.10,.03,c.sand,true);
  terrain('island / grass',SHORE,.945,.13,.22,c.grass,false);

  // Separate triangle vertices already give the mountain flat face normals.
  const mountain=mesh(scene,mountainGeometry(),'#ffffff',[0,0,0],false,{vertexColors:true});
  mountain.name='ML / AI hills / faceted rock and grassy clearings';

  const sea = mesh(scene,new THREE.PlaneGeometry(200,200),c.sea,[0,-.78,0],false,{roughness:.6});
  sea.rotation.x = -Math.PI/2;
  sea.castShadow = false;

  function ribbon(points,width,color,height) {
    const strip=mesh(scene,ribbonGeometry(points,width,height),color,undefined,false,{side:THREE.DoubleSide});
    strip.castShadow=false;
    return strip;
  }

  const {visualization,life}=CROSSINGS;
  const roads = [
    // Three staggered campuses share an approach into the north of the square.
    [campusPoint('wustl',[-7.5,-3.06]),[-7.85,-7.25],[-6.5,-7.24],[-5.3,-7.10],[-4.5,-6.1],[-3.6,-4.45]],
    [[-4.5,-6.1],[-2.9,-5.35],[-1.15,-4.7],[.5,-4.7],campusPoint('isu',[.5,-.6])],
    [campusPoint('cust',[-8.85,.75]),[-6.75,-4.9],[-5.8,-4.0],[-4.8,-3.6]],
    // Four short exits connect the square to the river, industry and west garden.
    [[-.9,-3.7],[.5,-4.7],visualization.west],
    [[-2.1,1.42],[-2.1,2.2],[-2.35,3.5],[-3.45,4.0],[-5,4.2],[-6.25,4.2]],
    [[-5.25,.6],[-6.5,1.2],[-8.4,1.8],[-8.4,3.55],[-7.7,4.3],[-6.25,4.2]],
    [[0,-.2],[.9,.85],[.6,2.0],life.west],
    // The rear bridge arrives behind NAIIVE, clear of its plinth and the hillside.
    [visualization.east,[4.0,-4.95],[6.4,-4.95],[7.45,-4.6],[9.4,-4.6]],
    [[4.8,-.48],[6.6,-.15],[7.8,-.65],[8.9,-1.0],[9.4,-3.0],[9.4,-4.6]],
    [life.east,[2.8,4.25],[4.3,4.4],[6.1,4.45],[7.35,4.15],[7.75,3.65],[7.7,2.7]],
    [[6.1,4.45],[6.4,5.05],[6.35,5.9],DOCK.landing],
  ];
  roads.forEach(points=> { ribbon(points,.78,c.sand,.366); ribbon(points,.61,c.path,.372); });
  const spurs=[
    [[2.8,4.25],[2.65,5.0],[2.7,5.95]],
    [[3.65,4.4],[3.65,4.15]],
    [[6.4,5.05],[6.9,5.0]],
    [[6.35,5.9],[7.1,6.25]],
    [[-.7,1.6],[.1,1.95],[.6,2.0]],
    [[-8.4,1.8],[-7.8,2.15],[-7.6,2.05]],
  ];
  spurs.forEach(points=>ribbon(points,.36,c.path,.372));
  MOUNTAIN_TRAILS.forEach(points=>ribbon(points,.38,c.path,(x,z)=>mountainHeightAt(x,z)+.045));

  const river=RIVER_POINTS;
  ribbon(river,.90,c.sand,(x,z)=>riverHeightAt(x,z)-.009);
  ribbon(river,.56,c.blue,riverHeightAt);
  ribbon(river,.13,'#b3ded1',(x,z)=>riverHeightAt(x,z)+.003);
  const fall=mesh(scene,waterfallGeometry(),c.blue,undefined,false,{side:THREE.DoubleSide});fall.castShadow=false;
  const foamFall=mesh(scene,waterfallGeometry(.07,.005),'#c8e9e0',undefined,false,{side:THREE.DoubleSide});foamFall.castShadow=false;
  const spring=group('river spring',...RIVER_SOURCE);
  const springRim=cylinder(spring,.44,.45,.025,c.sand,0,.01,0,16);springRim.scale.z=1.3;springRim.castShadow=false;
  const springPool=cylinder(spring,.32,.33,.012,c.blue,0,.03,0,16);springPool.scale.z=1.45;springPool.castShadow=false;
  for(const [dx,dz,r] of [[-.13,-.50,.19],[.15,-.54,.22],[.34,-.25,.14]])ball(spring,r,c.rock,dx,.13,dz);
  const splash=mesh(scene,new THREE.RingGeometry(.15,.44,16),'#c8e9e0',[RIVER_OUTLET.at[0],-.775,RIVER_OUTLET.at[1]],false,{side:THREE.DoubleSide});
  splash.rotation.x=-Math.PI/2;splash.castShadow=false;splash.userData.dynamic=true;
  animations.push(t=>splash.scale.setScalar(1+Math.sin(t*1.5)*.08));

  function bridge(crossing) {
    const g=group('bank-to-bank footbridge',...crossing.center);
    g.rotation.y=crossing.angle;
    const {length,width}=crossing;
    for(let i=0;i<12;i++) box(g,width,.08,length/12-.012,i%2?'#b89565':'#c5a579',0,.12,-length/2+(i+.5)*length/12);
    for(const end of [-1,1]) {
      box(g,width+.20,.17,.24,'#b1ad96',0,.01,end*(length/2-.10),true);
      const ramp=box(g,width,.045,.30,'#b89565',0,.073,end*(length/2+.12));
      ramp.rotation.x=end*.32;
    }
    for(const side of [-1,1]) {
      for(const z of [-length/2+.04,length/2-.04]) box(g,.075,.47,.075,'#967d57',side*(width/2-.025),.335,z);
      box(g,.065,.065,length,'#b49367',side*(width/2-.025),.57,0);
    }
  }
  Object.values(CROSSINGS).forEach(bridge);

  function tree(x,z,size=1,fruit=false) {
    const g=group(fruit?'apple tree':'woodland tree',x,z);
    const variant=Math.abs(Math.round(x*13+z*7))%3;
    if(fruit||variant===0) {
      cylinder(g,.10,.15,1.18,'#857254',0,.58,0,7);
      const crown=ball(g,.70,fruit?c.leaf:c.green,0,1.40,0);crown.scale.set(1,fruit?1.1:.86,.9);
      ball(g,.48,c.leaf,-.25,1.7,-.1);
    } else if(variant===1) {
      cylinder(g,.065,.10,1.85,'#d5d1b9',0,.91,0,6);
      for(const y of [.5,.85,1.15])box(g,.13,.035,.115,'#8f9783',0,y,.012);
      const crown=ball(g,.52,c.leaf,0,1.8,0);crown.scale.set(.8,1.25,.72);
      ball(g,.35,c.green,.24,1.40,.07);
    } else {
      cylinder(g,.08,.13,1.25,'#857254',0,.6,0,6);
      for(let i=0;i<3;i++)cylinder(g,0,.63-i*.14,.95-i*.09,i%2?c.leaf:c.green,0,1.0+i*.46,0,7);
    }
    if(fruit) [[-.42,1.5,.44],[.35,1.76,.4],[.35,1.1,.48]].forEach(p=>ball(g,.105,'#ba6550',...p));
    g.rotation.y=Math.sin(x*3+z)*.7;g.scale.setScalar(size);return g;
  }
  for(const [x,z,size] of [[-10.1,-7.8,.6],[-10.4,-6.2,.6],[-6.5,-8.75,.6],[-4,-8.8,.5],[-2.7,-8.8,.45]]) tree(x,z+STUDY_OFFSET_Z,size);
  const trees=[[10.3,-5.4,.65],[9.35,-.45,.65],[9.8,.4,.75],[9.65,3.25,.65],[-9.5,.1,.65],[-9.2,2.8,.75],[-7.7,5.15,.48],[-1.9,6.3,.7]];
  trees.forEach(([x,z,s])=>tree(x,z,s));
  [[8.15,-3.35],[8.65,4.6],[8.5,5.65],[2.2,6.8],[1.2,5.9]].forEach(([x,z])=>tree(x,z,.75,true));

  // Keep the industry frontage open: low planting and reeds instead of a tree wall.
  for(const [x,z] of [[-6.8,5.55],[-4.8,5.5],[-3.2,6.75]]) {
    for(let i=0;i<3;i++) {const shrub=ball(scene,.25,c.leaf,x+(i-1)*.27,.5,z+Math.sin(i)*.09);shrub.scale.y=.58;}
  }
  for(const [x,z] of [[-1.6,5.85],[-.45,6.8],[2.9,-11.55]]) {
    const reeds=group('river reeds',x,z);reeds.position.y=mountainHeightAt(x,z);
    for(let i=0;i<5;i++) {const stem=cylinder(reeds,.016,.021,.36+(i%3)*.08,'#89986b',(i-2)*.07,.21,Math.sin(i)*.08,4);stem.rotation.z=(i-2)*.08;}
  }

  function rock(x,z,size=1) {
    const r=ball(scene,size*.48,c.rock,x,.36,z);
    r.scale.set(1,.6,1.15);
    r.rotation.set(.2,x*.2,.1);
  }
  const rocks=[[-11.6, -2, 0.8], [-11.95, -5.0, 1.15], [-10.7, -12.0, 1.0], [-4.8, -13.55, 0.65], [-11.2, -9.5, 0.8], [11.3, -8.8, 1.5], [10, 0.4, 0.8], [9, 4.5, 1.15], [-0.3, 7.3, 0.8], [-5.6, 6.6, 1.15], [-9.25, .8, 0.8]];
  rocks.forEach(([x,z,size])=>rock(x,z,size));

  buildCampuses({group,register,box,cylinder,ball,mesh,roofGeometry,c});

  // Short landscape seams separate neighboring workshops and cottage gardens.
  // Their openings stay aligned with the paths; they never surround a building
  // with an uninterrupted fence or turn a street into an obstacle course.
  function divider(x1,z1,x2,z2,hedge=true) {
    const line=group('garden boundary',(x1+x2)/2,(z1+z2)/2);
    line.rotation.y=Math.atan2(x2-x1,z2-z1);
    const length=Math.hypot(x2-x1,z2-z1);
    box(line,.13,.14,length,'#c0bfaa',0,.07,0);
    box(line,.18,.035,length+.03,c.trim,0,.15,0);
    if(hedge) box(line,.22,.18,length-.08,c.green,0,.255,0);
  }
  divider(3.35,1.3,4.9,1.3);
  divider(6.6,1.3,8.4,1.3);
  divider(8.1,4.3,8.1,5.75,false);
  for(const [x,z,size] of [[3.45,-11.5,.48],[4.5,-13.15,.40],[10.8,-12.0,.45],[10.8,-7.9,.40]]) {
    const canopy=tree(x,z,size); canopy.position.y=mountainHeightAt(x,z);
  }

  buildWorkplaces({group,box,cylinder,mesh,register,animations,c});

  buildProjectObjects({group,box,cylinder,mesh,register,animations,c,ownMaterial:material=>{modelMaterials.add(material);return material;},isActive:g=>g===hovered || g===selected,
    loadModel:(parent,url,options)=>loadWorldModel(parent,url,{...options,isDisposed:()=>disposed,
      adopt:loaded=> {
        loaded.geometries.forEach(value=>geometries.add(value));
        loaded.materials.forEach(value=>modelMaterials.add(value));
        loaded.textures.forEach(value=>textures.add(value));
      },
      invalidate:()=> {
        for(const anchor of anchors) anchor.position=new THREE.Box3().setFromObject(objects.get(anchor.id)).getCenter(new THREE.Vector3()).toArray();
        updateLayout(); render(performance.now(),true);
      },
    }),
  });

  function sign(id,title,x,z,color=c.blue) {
    const g=group(title,x,z);
    box(g,.09,.75,.09,'#9b835c',0,.38,0);
    box(g,.6,.4,.12,c.trim,0,.78,0,true);
    box(g,.43,.22,.02,color,0,.79,.073);
    register(g,id,title,[x-.3,.35,z+.4]);
  }
  const {board}=buildPlaza({group,box,cylinder,ball,mesh,register,roofGeometry,animations,c,isSelected:g=>g===selected});
  objects.set('job',board);
  sign('phd','PhD dissertation',-.4,-3.55+STUDY_OFFSET_Z,'#b99c61');
  sign('patents','Four granted patents',-7.3,1.65,'#b99c61');
  // Hand-placed details keep paths and entrances open.
  for(const [x,z] of [campusPoint('cust',[-9.9,1.3]),[-4.4,-3.3+STUDY_OFFSET_Z],[-6.6,.2],[8.55,3.55],[3.5,5.1]]) {
    const pot=group('flower pot',x,z);
    cylinder(pot,.16,.11,.25,'#b88564',0,.12,0,8);
    for(let i=0;i<3;i++) ball(pot,.10,i%2?'#f1d892':'#e1aa92',(i-1)*.1,.4,0);
  }
  for(let i=0;i<6;i++) {
    const fence=group('orchard fence',8.0,3.9+i*.32);
    box(fence,.075,.55,.075,c.trim,0,.3,0);
    box(fence,.045,.08,.48,'#cab58c',0,.42,.18);
  }
  const dock=group('shore-aligned dock',...DOCK.landing);
  dock.rotation.y=DOCK.angle;
  for(let i=0;i<10;i++) box(dock,1.3,.09,.19,i%2?'#c9ae80':'#bda071',0,.015,i*.2);
  for(const side of [-1,1]) for(const z of [.15,1.60]) cylinder(dock,.075,.09,1.42,'#9d855f',side*.56,-.56,z,7);
  box(dock,1.44,.16,.27,c.rock,0,-.06,.02,true);

  const boat=group('little sailboat',-11,3.5);
  boat.position.y=-.58; boat.userData.dynamic=true;
  const hull=ball(boat,.7,'#cda77b'); hull.scale.set(.55,.28,1.4);
  cylinder(boat,.035,.035,1.5,'#9a845d',0,.75,0,6);
  const sailShape=new THREE.Shape(); sailShape.moveTo(0,0); sailShape.lineTo(.75,-.1); sailShape.lineTo(0,1.15); sailShape.closePath();
  mesh(boat,new THREE.ShapeGeometry(sailShape),c.trim,[.03,.32,0],true,{side:THREE.DoubleSide});
  animations.push(t=> { boat.rotation.z=Math.sin(t*.6)*.07; boat.position.y=-.58+Math.sin(t*.9)*.035; });

  // Foam marks are geometry and move independently of the island.
  for(let i=0;i<26;i++) {
    const angle=i*Math.PI*2/26;
    const x=Math.cos(angle)*12.4;
    const z=Math.sin(angle)*9.3;
    const foam=box(scene,.35+(i%3)*.18,.015,.035,'#e0eeDF',x,-.745,z);
    foam.castShadow=foam.receiveShadow=false; foam.userData.dynamic=true;
    foam.rotation.y=-angle;
    animations.push(t=> { foam.scale.x=.8+Math.sin(t*.8+i)*.25; });
  }

  const ring=mesh(scene,new THREE.TorusGeometry(.52,.025,6,36),'#f4e6af',[0,.40,0]);
  ring.rotation.x=-Math.PI/2;
  ring.castShadow=false; ring.userData.dynamic=true;
  const petMap=new THREE.TextureLoader().load('/game/frog.png',texture=> {
    if(disposed) texture.dispose();
    else render(performance.now(),true);
  });
  petMap.colorSpace=THREE.SRGBColorSpace;
  petMap.magFilter=THREE.NearestFilter;
  petMap.minFilter=THREE.LinearFilter;
  petMap.repeat.set(1/8,1/5);
  petMap.offset.set(0,4/5);
  textures.add(petMap);
  const petMaterial=new THREE.SpriteMaterial({map:petMap,alphaTest:.05});
  const pet=new THREE.Sprite(petMaterial); pet.userData.dynamic=true;
  pet.scale.set(.72,.78,1);
  scene.add(pet);
  const destination=new THREE.Vector3(PLAZA_LAYOUT.mirror.stand[0],.87,PLAZA_LAYOUT.mirror.stand[2]);
  pet.position.copy(destination);
  const from=destination.clone();
  let hopStart=-1000;
  let selected=null;
  let hovered=null;
  let width=1,height=1;
  let inspecting=false;
  const raycaster=new THREE.Raycaster();
  const pointer=new THREE.Vector2();
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  // The models are stationary; cache their centers once rather than traversing
  // every mesh again on every frame of a camera drag.
  batchWorld(scene,geometries);
  const anchors=clickables.map(g=>({id:g.userData.id,title:g.userData.title,location:g.userData.location,position:new THREE.Box3().setFromObject(g).getCenter(new THREE.Vector3()).toArray()}));
  let previous=0,lastShadow=-Infinity,lastLayout=-Infinity,lastPick=-Infinity,paused=false;
  const orbit=createWorldCamera(camera,canvas,{
    surface,reduced,view,onInteract,onReset:onViewReset,onHoverClear:leave,onPick:click,
    onChange() {
      const now=performance.now();
      if(now-lastLayout>65) {updateLayout();lastLayout=now;}
      render(now,reduced.matches);
    },
  });

  function findObject(id) {
    if(id?.startsWith('biome:')) return objects.get(REGION_HOME[id.slice(6)]);
    return objects.get(id);
  }
  function project(position) {
    const v=new THREE.Vector3(...position).project(camera);
    return {x:(v.x+1)*50,y:(1-v.y)*50,hidden:Math.abs(v.x)>1 || Math.abs(v.y)>1 || Math.abs(v.z)>1};
  }
  function select(id,instant=false) {
    selected=findObject(id);
    from.copy(pet.position);
    // Home is now an open arrival plaza, not a selectable building.
    const p=selected?.userData.stand ?? PLAZA_LAYOUT.mirror.stand;
    destination.set(p[0],p[1]+.52,p[2]);
    hopStart=instant || reduced.matches ? -1000 : performance.now();
    if(instant || reduced.matches) pet.position.copy(destination);
    ring.position.set(p[0],p[1]+.05,p[2]);
    render(performance.now(),true);
  }
  function resize(w,h) {
    width=Math.max(1,w); height=Math.max(1,h);
    const aspect=width/height;
    renderer.setPixelRatio(pixel?1:Math.min(window.devicePixelRatio||1,1.5));
    const renderWidth=pixel?Math.max(280,Math.round(width/2.2)):width;
    renderer.setSize(renderWidth,pixel?Math.round(renderWidth/aspect):height,false);
    orbit.resize(width,height,inspecting);
  }
  function updateLayout() {
    onLayout({
      regions:Object.fromEntries(Object.entries(LABELS).map(([id,p])=>[id,project(p)])),
      objects:anchors.map(({id,title,location,position})=>({id,title,location,...project(position)})),
    });
  }
  function hit(event) {
    const rect=canvas.getBoundingClientRect();
    pointer.set((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);
    raycaster.setFromCamera(pointer,camera);
    const intersections=raycaster.intersectObjects(clickables,true);
    for(const intersection of intersections) {
      let node=intersection.object;
      while(node && !node.userData.id) node=node.parent;
      if(node?.userData.id) return node;
    }
    return null;
  }
  function move(event) {
    if(orbit.isInteracting() || event.pointerType==='touch') return;
    const now=performance.now();if(now-lastPick<50)return;lastPick=now;
    const next=hit(event);
    if(next===hovered) return;
    hovered=next;
    canvas.style.cursor=hovered?'pointer':'grab';
    onHover(hovered?{title:hovered.userData.title,location:hovered.userData.location,...project([hovered.position.x,hovered.position.y+2.8,hovered.position.z])}:null);
    render(performance.now(),true);
  }
  function leave() { hovered=null; onHover(null); canvas.style.cursor='grab'; render(performance.now(),true); }
  function click(event) { const picked=hit(event); if(picked) onSelect(picked.userData.id); else onMiss?.(); }
  canvas.addEventListener('pointermove',move);
  canvas.addEventListener('pointerleave',leave);
  function render(now,force=false) {
    if(disposed || document.hidden) return;
    const interval=1000/(orbit.isInteracting()?60:30);
    if(!force&&(paused||now-previous<interval-.5))return;
    profiler?.begin();
    previous=force?now:now-((now-previous)%interval);
    const t=reduced.matches?0:now/1000;
    animations.forEach(update=>update(t));
    clickables.forEach(g=> {const target=g===hovered?1.035:1; g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x,target,.18));});
    const progress=Math.min(1,Math.max(0,(now-hopStart)/550));
    const easing=progress*progress*(3-2*progress);
    pet.position.lerpVectors(from,destination,easing);
    pet.position.y+=reduced.matches?0:Math.sin(progress*Math.PI)*1.25;
    petMap.offset.x=(reduced.matches?0:Math.floor(t*5)%6)/8;
    if(now-lastShadow>120) {renderer.shadowMap.needsUpdate=true;lastShadow=now;}
    renderer.render(scene,camera);
    profiler?.end();
  }
  function visibility() {
    profiler?.reset(document.hidden?'hidden':paused?'paused':'running');
    if(reduced.matches) hopStart=-1000;
    renderer.setAnimationLoop(document.hidden || paused || reduced.matches ? null : animate);
    if(!document.hidden) render(performance.now(),true);
  }
  document.addEventListener('visibilitychange',visibility);
  reduced.addEventListener('change',visibility);
  function animate(now) { orbit.update(); render(now); }
  renderer.setAnimationLoop(reduced.matches?null:animate);

  return {
    select,resize,getView:orbit.getView,resetView:orbit.reset,
    pause(value) {paused=value;visibility();},
    inspect(value) { if(inspecting!==value) { inspecting=value; resize(width,height); } },
    dispose() {
      disposed=true;
      profiler?.dispose();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener('pointermove',move);
      canvas.removeEventListener('pointerleave',leave);
      orbit.dispose();
      document.removeEventListener('visibilitychange',visibility);
      reduced.removeEventListener('change',visibility);
      geometries.forEach(g=>g.dispose());
      materials.forEach(m=>m.dispose());
      modelMaterials.forEach(m=>m.dispose());
      textures.forEach(t=>{t.dispose();t.image?.close?.();});
      outlines.dispose(); petMaterial.dispose(); sun.shadow.map?.dispose(); renderer.dispose();
    },
  };
}
