const randomColor = require('randomcolor');
global.THREE = require('three');
const TWEEN = require('tween.js');
const VerletSystem3D = require('verlet-system/3d');
const EyeStalk = require('./lib/eyestalk');
const createOrbitViewer = require('three-orbit-viewer')(THREE)
/* Scene */
const app = createOrbitViewer({
  clearColor: 0x000000,
  clearAlpha: 1,
  fov: 65,
  position: new THREE.Vector3(0, 0, 1), // camera
})

if (location.search.slice(1) !== 'novideo'){
  // Display cam feed on a plane
  // flip the video horizontally (since it's front side cam)
  const camEl = require('getuservideo')({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const tex = new THREE.VideoTexture(camEl);
  // set up texture for better performance
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  // tex.format = THREE.RGBFormat; // colored
  tex.format = THREE.LuminanceFormat; // B&W
  const geo = new THREE.PlaneGeometry(window.innerWidth / window.innerHeight, 1 );
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: tex });
  mat.side = THREE.BackSide;
  const viewPlane = new THREE.Mesh(geo, mat);
  viewPlane.setRotationFromAxisAngle( new THREE.Vector3(0,1,0), Math.PI );
  app.scene.add(viewPlane);
  
  var ctracker = new clm.tracker();
  ctracker.init(pModel);
  
  const leftEyeStalk = new EyeStalk(
    0,0,0, // position
    10, // seg
    0.006 // segLength
  );
  app.scene.add(leftEyeStalk);
  const rightEyeStalk = new EyeStalk(
    0,0,0, // position
    10, // seg
    0.006 // segLength
  );
  app.scene.add(rightEyeStalk);
  
  const system = VerletSystem3D({
    gravity: [0, -1, 0],
    // min? max?
  });
  
  let vW, vH;
  camEl.addEventListener('canplay', start, false);
  function start() {
    vW = camEl.width;
    vH = camEl.height;
    camEl.play();
    ctracker.start(camEl);
    positionLoop();
  }
  
  
  function positionLoop() {
    requestAnimationFrame(positionLoop);
    var p = ctracker.getCurrentPosition();
    if (p) {
      // NOTE these might be the reverse order
      let pLeft = [p[27][0] - vW/2, p[27][1] - vH/2].map(pos => pos * -0.0018);
      let pRight = [p[32][0] - vW/2, p[32][1] - vH/2].map(pos => pos * -0.0018);
      // console.log(pLeft);
      leftEyeStalk.move(
        [...pLeft, 0],
        0
      );
      rightEyeStalk.move(
        [...pRight, 0],
        0
      );
    }
  }
  
  app.on('tick', function(dt) {
    //.. handle pre-render updates
    system.integrate(leftEyeStalk.sim.vertices, dt/1000);
    leftEyeStalk.update(dt/1000);
    system.integrate(rightEyeStalk.sim.vertices, dt/1000);
    rightEyeStalk.update(dt/1000);
  })

}
