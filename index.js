const randomColor = require('randomcolor');
global.THREE = require('three');
const TWEEN = require('tween.js');
const createOrbitViewer = require('three-orbit-viewer')(THREE)
/* Scene */
const app = createOrbitViewer({
  clearColor: 0x000000,
  clearAlpha: 1,
  fov: 65,
  position: new THREE.Vector3(0, 0, 1), // camera
})

// Display cam feed on a plane
// flip the video horizontally (since it's front side cam)
const camEl = require('getuservideo')({
  width: window.innerWidth,
  height: window.innerHeight,
  autoplay: true,
});
const tex = new THREE.VideoTexture(camEl);
// set up texture for better performance
tex.minFilter = THREE.LinearFilter;
tex.magFilter = THREE.LinearFilter;
tex.format = THREE.RGBFormat;
const geo = new THREE.PlaneGeometry(window.innerWidth / window.innerHeight, 1 );
const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: tex });
mat.side = THREE.BackSide;
const viewPlane = new THREE.Mesh(geo, mat);
viewPlane.setRotationFromAxisAngle( new THREE.Vector3(0,1,0), Math.PI );
app.scene.add(viewPlane);

app.on('tick', function(dt) {
  //.. handle pre-render updates
  TWEEN.update();
})
