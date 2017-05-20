// Eyestalk
// hanging bouncy string that jumps on command

const Point3D = require('verlet-point/3d');
const Constraint3D = require('verlet-constraint/3d');

function createConstraints(vertices, seglength) {
    //make our connections
    var points = []
    for (var i=0; i<vertices.length-1; i++) {
        points.push([ vertices[i], vertices[i+1] ]);
    }

    //turn each into a constraint
    return points.map(function(p) {
        return Constraint3D(p, { restingDistance: seglength, stiffness: 0.5 })
    })
}

class EyeStalkSim {
  constructor(x,y,z,seg,seglength) {
    this.position = [x,y,z]; // ? format needs thought
    this.vertices = [];
    for (var i = 0; i < seg; i++) {
      let p = Point3D({
        position: [x,y,z + (seglength*0.5)*i],
        mass: 0.5,
      });
      this.vertices.push(p);
    }
    // root is immovable
    this.vertices[0].mass = 0;
    this.vertices[this.vertices.length-1].mass = 5;
    // create constraints between each vertices
    this.constraints = createConstraints(this.vertices, seglength);
  }
  update(dt) {
    this.constraints.forEach((c)=>{ c.solve(); });
  }
  jump(magnitude) {
    this.vertices[this.vertices.length-1].addForce( [0,magnitude,0] );
  }
  move(position, index) {
    this.vertices[index].place(position);
  }
}

class EyeStalkRender extends THREE.Group {
  constructor(x,y,z,seg,segLength) {
    super();
    this.sim = new EyeStalkSim(x,y,z,seg,segLength);
    this.segments = [];
    const colors = [0xffff00, 0xff00ff, 0x00ffff];
    for (var i = 0; i < seg; i++) {
      this.segments[i] = new THREE.Mesh(
        new THREE.SphereGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: colors[i%colors.length] })
      );
      this.segments[i].scale.setScalar(0.08);
      this.add(this.segments[i]);
    }
  }
  update(dt) {
    this.sim.update(dt);
    // update graphics according to simulation
    for (var i = 0; i < this.segments.length; i++) {
      this.segments[i].position.set(
        this.sim.vertices[i].position[0],
        this.sim.vertices[i].position[1],
        this.sim.vertices[i].position[2]
      );
    }
  }
  jump(magnitude) {
    this.sim.jump(magnitude);
  }
  /*
   * @param position array[3]
   */
  move(position, index) {
    this.sim.move(position, index);
  }
}

module.exports = EyeStalkRender;
