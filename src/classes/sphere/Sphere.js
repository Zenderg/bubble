import * as THREE from 'three';
import SimplexNoise from "simplex-noise";
import Actions from "./Actions";

export default class Sphere {
  sphereVertices = [];
  sphereVerticesNorm = [];
  sphere = null;
  sphereName = 'bubble';
  sphereGeom = new THREE.SphereGeometry(25, 100, 100);
  simplex = new SimplexNoise();
  controls = {
    noiseAmount: 0.1,
    speed: 0.5,
    coef: 20,
  };
  step = 0;// каждый раз прибавляет к себе скорость, нужно для создания шумов

  constructor(texture) {
    this.texture = texture;
  }

  create() {
    const planetMaterial = Sphere.loadShader(this.texture);

    [this.sphereVertices, this.sphereVerticesNorm] = Sphere.addVertexes(this.sphereGeom);

    const sphere = new THREE.Mesh(this.sphereGeom, planetMaterial);
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
    this.updateNoises();

    this.sphereGeom.computeFaceNormals();
    this.sphereGeom.computeVertexNormals();

    this.sphereGeom.verticesNeedUpdate = true;

    Actions.d
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

  newVertex(vertexGeom, vertexNorm, vertexSphere) {
    const value = this.simplex.noise3D(
        (vertexGeom.x + this.step) / this.controls.coef,
        vertexGeom.y / this.controls.coef, vertexGeom.z / this.controls.coef);

    const x = vertexSphere.x +
        vertexNorm.x * value * this.controls.noiseAmount;
    const y = vertexSphere.y +
        vertexNorm.y * value * this.controls.noiseAmount;
    const z = vertexSphere.z +
        vertexNorm.z * value * this.controls.noiseAmount;

    return {x, y, z};
  }

  updateNoises() {
    this.step += this.controls.speed;

    const iMax = this.sphereGeom.vertices.length;

    for (let i = 0; i < iMax; i++) {
      let vertexGeom = this.sphereGeom.vertices[i];
      vertexGeom = this.newVertex(vertexGeom, this.sphereVerticesNorm[i], this.sphereVertices[i]);
    }
  }
}
