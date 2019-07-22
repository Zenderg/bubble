import * as THREE from 'three';

export default class Sphere {
  sphereVertices = [];
  sphereVerticesNorm = [];
  sphere = null;
  sphereName = 'bubble';

  constructor(scene, texture) {
    this.texture = texture;
  }

  create() {
    const sphereGeom = new THREE.SphereGeometry(25, 100, 100);
    const planetMaterial = Sphere.loadShader(this.texture);

    [this.sphereVertices, this.sphereVerticesNorm] = Sphere.addVertexes(sphereGeom);

    const sphere = new THREE.Mesh(sphereGeom, planetMaterial);
    sphere.name = this.sphereName;

    return sphere;
  }

  static loadShader(texture) {
    const shader = THREE.FresnelShader;
    const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['tCube'].value = texture;

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
    });
  }

  render() {

  }

  static addVertexes(sphereGeom) {
    const sphereVerticesArray = [];
    const sphereVerticesNormArray = [];
    const verticesLength = sphereGeom.vertices.length;

    for (let i = 0; i < verticesLength; i += 1) {
      const vertex = sphereGeom.vertices[i];
      const vec = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
      sphereVerticesArray.push(vec);
      let mag = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
      mag = Math.sqrt(mag);
      const norm = new THREE.Vector3(vertex.x / mag, vertex.y / mag,
          vertex.z / mag);
      sphereVerticesNormArray.push(norm);
    }

    return [sphereVerticesArray, sphereVerticesNormArray];
  }
}
