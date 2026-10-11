import * as THREE from 'three';

// Footprint traced by hand from the user's aerial reference. Coordinates follow
// that image (north at the top); heights are simplified for the miniature.
export function buildGilman(parent, { box, cylinder, mesh }) {
  const unit = .004;
  const x = value => (value - 466) * unit;
  const z = value => (value - 508) * unit;
  const brick = '#a16c5a', stone = '#d6cebb', roof = '#505e69';
  const footprint = [
    [242,48],[678,48],[678,114],[852,114],[852,322],[678,322],
    [678,449],[855,449],[855,634],[678,634],[678,779],[856,779],
    [856,800],[908,800],[908,916],[855,916],[855,957],[612,957],
    [612,971],[323,971],[323,957],[82,957],[82,916],[24,916],
    [24,800],[82,800],[82,779],[259,779],[259,634],[50,634],
    [50,449],[260,449],[260,322],[85,322],[85,114],[242,114],
  ];
  const courtyard = [[426,632],[499,632],[499,797],[426,797]];
  const shape = new THREE.Shape(footprint.map(([px,pz]) => new THREE.Vector2(x(px),-z(pz))));
  // Hole winding must oppose the outer contour so its walls face into the
  // light well. Matching windings make those walls disappear under backface culling.
  shape.holes.push(new THREE.Path(courtyard.map(([px,pz]) => new THREE.Vector2(x(px),-z(pz))).reverse()));
  function slab(y, height, color) {
    const geometry = new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false});
    geometry.rotateX(-Math.PI/2);
    return mesh(parent,geometry,color,[0,y,0],true);
  }
  slab(0,.09,stone);
  slab(.09,.91,brick);
  slab(1,.035,roof);

  // Follow the actual perimeter, including the open side courts and narrow
  // internal light well. No rectangular foundation closes those spaces.
  function edge(a,b,y,width,height,color) {
    const dx=x(b[0])-x(a[0]), dz=z(b[1])-z(a[1]);
    const length=Math.hypot(dx,dz);
    const beam=box(parent,width,height,length,color,(x(a[0])+x(b[0]))/2,y,(z(a[1])+z(b[1]))/2);
    beam.rotation.y=Math.atan2(dx,dz);
  }
  for(const loop of [footprint,courtyard]) loop.forEach((a,i) => {
    const b=loop[(i+1)%loop.length];
    edge(a,b,1.035,.030,.09,stone);
    edge(a,b,.17,.025,.035,stone);
    const dx=x(b[0])-x(a[0]), dz=z(b[1])-z(a[1]);
    const length=Math.hypot(dx,dz), bays=Math.floor(length/.22);
    // A slim window passes through the wall face, so both orientations use the
    // same detail and the courtyard elevations remain visible when orbiting.
    for(let bay=0;bay<bays;bay++) {
      const t=(bay+.5)/bays, px=x(a[0])+dx*t, pz=z(a[1])+dz*t;
      for(const y of [.34,.60,.85]) {
        // Rear of the south (exit-side) wing, just southeast of the water tower:
        // the middle third-floor window is the only room with its light on.
        const lit=loop===footprint && a[0]===82 && a[1]===779 && b[0]===259 && bay===1 && y===.85;
        const window=lit
          ? mesh(parent,new THREE.BoxGeometry(.028,.15,.105),'#ffe7a2',[px,y,pz],false,
            {emissive:'#ffbc52',emissiveIntensity:.85,toneMapped:false})
          : box(parent,.028,.15,.105,'#42606a',px,y,pz);
        if(lit) window.name='gilman-lit-third-floor-window';
        window.rotation.y=Math.atan2(dx,dz);
        const sill=box(parent,.038,.019,.13,stone,px,y-.085,pz);
        sill.rotation.y=window.rotation.y;
      }
    }
  });

  function roofBlock(x1,z1,x2,z2,height,color=brick) {
    const w=(x2-x1)*unit, d=(z2-z1)*unit, px=x((x1+x2)/2), pz=z((z1+z2)/2);
    box(parent,w,height-1,d,color,px,(height+1)/2,pz,true);
    box(parent,w+.025,.035,d+.025,stone,px,height,pz);
    box(parent,w-.045,.018,d-.045,roof,px,height+.025,pz);
    return height+.035;
  }
  // Stepped north addition, the two longitudinal connectors, and the lower
  // projecting south entrance. The void between the connectors stays open.
  roofBlock(260,48,678,194,1.30);
  roofBlock(242,48,318,108,1.34);
  roofBlock(615,48,678,108,1.34);
  roofBlock(262,594,424,813,1.16);
  roofBlock(499,555,678,854,1.25);
  roofBlock(324,892,610,971,1.10);

  const metal='#b6c4c5';
  function duct(points,y,width=.06) {
    for(let i=1;i<points.length;i++) edge(points[i-1],points[i],y,width,.055,metal);
  }
  function airUnit(px,pz,y=1.07) {
    box(parent,.18,.10,.14,metal,x(px),y+.05,z(pz));
    for(const side of [-1,1]) {
      cylinder(parent,.031,.031,.011,'#586d76',x(px)+side*.045,y+.106,z(pz),8);
    }
  }
  // The paired fan banks and branched north duct are prominent in the aerial.
  duct([[105,226],[345,226],[345,260]],1.10,.085);
  duct([[345,226],[598,226],[598,260]],1.10,.085);
  duct([[598,226],[828,226]],1.10,.085);
  for(const px of [176,768]) {
    airUnit(px,207); airUnit(px,244);
    for(const side of [-1,1]) duct([[px+side*34,183],[px+side*34,267]],1.085,.028);
  }
  duct([[316,331],[316,374],[582,374],[582,434]],1.10);
  duct([[296,536],[296,643],[396,643],[396,695]],1.10);
  for(const row of [
    {a:82,b:294,z:535,y:1.07}, {a:643,b:824,z:537,y:1.07},
    {a:106,b:284,z:830,y:1.07}, {a:617,b:824,z:854,y:1.07},
  ]) {
    duct([[row.a,row.z],[row.b,row.z]],row.y+.10,.08);
    for(let px=row.a;px<row.b;px+=48) airUnit(px,row.z+19,row.y);
  }
  for(const p of [[355,487,1.07],[454,520,1.07],[589,593,1.285],[627,700,1.285],[579,781,1.285]]) airUnit(...p);

  // Three doors and a shallow stone portal face south, as in the facade photo.
  const front=z(971);
  for(const px of [-.18,0,.18]) {
    box(parent,.115,.26,.03,'#355960',px,.26,front+.016);
    for(const dx of [-.074,.074]) box(parent,.026,.32,.06,stone,px+dx,.28,front+.03);
  }
  box(parent,.66,.06,.14,stone,0,.47,front+.04);
  for(let i=0;i<3;i++) box(parent,.78,.03,.36-i*.08,stone,0,.02+i*.03,front+.14-i*.04);
}
