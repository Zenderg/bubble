import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import SimplexNoise from 'simplex-noise';
import Stats from 'three/examples/jsm/libs/stats.module';
import './assets/shaders/FresnelShader';
import Controls from './classes/constrols/Controls'

export default class MainScene {
  constructor(scene, renderer, camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.sphereVertices = [];
    this.sphereVerticesNorm = [];
    this.simplex = new SimplexNoise();
    this.step = 0;
    this.stats = new Stats();
    this.controls = {
      noiseAmount: 0.1,
      step: 0.5,
      coef: 20,
    };
    this.sphereGeom = new THREE.SphereGeometry(25, 100, 100);
    this.sphereName = 'bubble';

    this.raycaster = new THREE.Raycaster();
    this.mouse = {x: 0, y: 0};
    this.bubbleIncreaseNoise = false;
    this.intersects = [];
    this.animControls = {
      step: {step: 0.2, min: 0.5, max: 1.7, animStep: 0.05},
      noise: {step: 0.07, min: 0.1, max: 0.5, animStep: 0.008},
      intStep: 6,
    };
  }

  init(renderFunc) {
    Controls.setConfig(this.renderer, this.camera);

    [
      this.sphereVertices,
      this.sphereVerticesNorm] = MainScene.addVertexesInArr(
        this.sphereGeom);

    // загрузка заднего фона
    const textureCube = Controls.loadBackground(this.scene);

    const sphere = this.createSphere(textureCube);
    this.scene.add(sphere);

    this.initEvents(sphere, this.controls);

    //Хелперы
    new OrbitControls(this.camera, this.renderer.domElement);

    const container = document.getElementById('WebGL-output');

    Controls.append(container, this.stats.dom, this.renderer.domElement);

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
      const norm = new THREE.Vector3(vertex.x / mag, vertex.y / mag,
          vertex.z / mag);
      sphereVerticesNormArray.push(norm);
    }

    return [sphereVerticesArray, sphereVerticesNormArray];
  }

  renderSphereNoise() {
    const iMax = this.sphereGeom.vertices.length;

    for (let i = 0; i < iMax; i++) {
      let vertex = this.sphereGeom.vertices[i];

      let value = this.simplex.noise3D(
          (vertex.x + this.step) / this.controls.coef,
          vertex.y / this.controls.coef, vertex.z / this.controls.coef);

      vertex.x = this.sphereVertices[i].x +
          this.sphereVerticesNorm[i].x * value * this.controls.noiseAmount;
      vertex.y = this.sphereVertices[i].y +
          this.sphereVerticesNorm[i].y * value * this.controls.noiseAmount;
      vertex.z = this.sphereVertices[i].z +
          this.sphereVerticesNorm[i].z * value * this.controls.noiseAmount;
    }

    this.sphereGeom.computeFaceNormals();
    this.sphereGeom.computeVertexNormals();

    this.sphereGeom.verticesNeedUpdate = true;
  }

  createSphere(texture) {
    const planetMaterial = MainScene.loadShader(texture);

    const sphere = new THREE.Mesh(this.sphereGeom, planetMaterial);
    sphere.name = 'bubble';

    return sphere;
  }

  initEvents(sphere) {
    document.addEventListener('click', this.bubbleClick);
    document.addEventListener('mousemove',
        this.onMouseMove(sphere));
  }

  onMouseMove = sphere => event => {
    const coefEffect = 1;

    this.setMousePos(event);

    sphere.position.x = -this.mouse.x * coefEffect;
    sphere.position.y = -this.mouse.y * coefEffect;
  };

  bubbleClick = (event) => {
    this.setMousePos(event);

    if (!this.isIntersect(this.mouse, 'bubble')) return false;

    const limitStep = this.controls.step + this.animControls.step.step;
    const limitNoise = this.controls.noiseAmount + this.animControls.noise.step;

    this.bubbleIncreaseNoise = true;

    const timer = setInterval(() => {
      const flag = this.increaseNoise({step: limitStep, noise: limitNoise});

      if (!flag) {
        this.bubbleIncreaseNoise = false;
        clearInterval(timer);
      }
    }, this.animControls.intStep);
  };

  increaseNoise(limit) {
    if ((this.controls.step >= limit.step || this.controls.step >
        this.animControls.step.max) &&
        (this.controls.noiseAmount >= limit.noise || this.controls.noiseAmount >
            this.animControls.noise.max)) {
      return false;
    }

    this.controls.step = this.controls.step + this.animControls.step.animStep;
    this.controls.noiseAmount = this.controls.noiseAmount +
        this.animControls.noise.animStep;

    return true;
  }

  decreaseNoise() {
    if (this.bubbleIncreaseNoise) return;

    const step = this.animControls.step;
    const noise = this.animControls.noise;

    if (this.controls.step <= step.min && this.controls.noiseAmount <=
        noise.min) return;

    const decelerationRate = 10;

    this.controls.step = this.controls.step > step.min ?
        this.controls.step - step.step / decelerationRate :
        this.controls.step;
    this.controls.noiseAmount = this.controls.noiseAmount > noise.min ?
        this.controls.noiseAmount - noise.step / (decelerationRate * 3) :
        this.controls.noiseAmount;
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

  isIntersect() {
    if (this.mouse.x === 0 && this.mouse.y === 0) return false;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersects = this.raycaster.intersectObjects(this.scene.children,
        true);

    return !!this.intersects.length && this.intersects[0].object.name ===
        this.sphereName;
  }

  setMousePos(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
}
