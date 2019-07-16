import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SimplexNoise from 'simplex-noise'
import Stats from 'three/examples/jsm/libs/stats.module';
import './FresnelShader'
import SubFunctions from './SubFunctions'

export default class MainScene extends SubFunctions{
  constructor(scene, renderer, camera) {
    super(scene, renderer, camera);
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.sphereVerticesArray = [];
    this.sphereVerticesNormArray = [];
    this.simplex = new SimplexNoise();
    this.step = 0;
    this.stats = new Stats();
    this.controls = {
      noiseAmount: 0.1,
      step: 0.5,
      coef: 20
    };
    this.sphereGeom = null;
  }

  init(renderFunc) {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.position.set(0, 0, 90);

    this.sphereGeom = new THREE.SphereGeometry(25, 100, 100);
    [this.sphereVerticesArray, this.sphereVerticesNormArray] = MainScene.addVertexesInArr(this.sphereGeom);

    // загрузка заднего фона
    const textureCube = SubFunctions.loadBackground(this.scene);
    // загрузка шейдеров
    let planetMaterial = SubFunctions.loadShader(textureCube);

    const sphere = new THREE.Mesh(this.sphereGeom, planetMaterial);
    sphere.name = "bubble";
    this.scene.add(sphere);

    const container = document.getElementById("WebGL-output");

    //Хелперы
    new OrbitControls( this.camera, this.renderer.domElement );
    container.appendChild( this.stats.dom );

    container.appendChild(this.renderer.domElement);
    this.initEvents(sphere, this.controls);

    renderFunc();
  };

  render() {
    this.stats.update();

    this.decreaseNoise(this.controls);

    this.step += this.controls.step;

    this.renderSphereNoise();
  }

  static addVertexesInArr(sphereGeom) {
    const sphereVerticesArray = [];
    const sphereVerticesNormArray = [];
    const verticesLength = sphereGeom.vertices.length;

    for (let i = 0; i < verticesLength; i += 1) {
      const vertex = sphereGeom.vertices[i];
      const vec = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
      sphereVerticesArray.push(vec);
      let mag = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
      mag = Math.sqrt(mag);
      const norm = new THREE.Vector3(vertex.x / mag, vertex.y / mag, vertex.z / mag);
      sphereVerticesNormArray.push(norm);
    }

    return [sphereVerticesArray, sphereVerticesNormArray];
  }

  renderSphereNoise() {
    const iMax = this.sphereGeom.vertices.length;

    for (let i = 0; i < iMax; i++) {
      let vertex = this.sphereGeom.vertices[i];

      let value = this.simplex.noise3D((vertex.x + this.step) / this.controls.coef, vertex.y / this.controls.coef, vertex.z / this.controls.coef);

      vertex.x = this.sphereVerticesArray[i].x + this.sphereVerticesNormArray[i].x * value * this.controls.noiseAmount;
      vertex.y = this.sphereVerticesArray[i].y + this.sphereVerticesNormArray[i].y * value * this.controls.noiseAmount;
      vertex.z = this.sphereVerticesArray[i].z + this.sphereVerticesNormArray[i].z * value * this.controls.noiseAmount;
    }

    this.sphereGeom.computeFaceNormals();
    this.sphereGeom.computeVertexNormals();

    this.sphereGeom.verticesNeedUpdate = true;
  }
}
