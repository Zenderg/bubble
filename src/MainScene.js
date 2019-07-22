import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import './assets/shaders/FresnelShader';
import Controls from './classes/constrols/Controls'
import Sphere from './classes/sphere/Sphere';

export default class MainScene {
  sphere = null;

  constructor(scene, renderer, camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.step = 0;
    this.stats = new Stats();

    this.raycaster = new THREE.Raycaster();
    this.mouse = {x: 0, y: 0};
    this.bubbleIncreaseNoise = false;
    this.intersects = [];
    this.animControls = {
      step: {speed: 0.2, min: 0.5, max: 1.7, animStep: 0.05},
      noise: {speed: 0.07, min: 0.1, max: 0.5, animStep: 0.008},
      intStep: 6,
    };
  }

  init(renderFunc) {
    Controls.setConfig(this.renderer, this.camera);

    // загрузка заднего фона
    const textureCube = Controls.loadBackground(this.scene);

    this.sphere = new Sphere(textureCube);
    this.scene.add(this.sphere.create());

    this.initEvents(this.sphere, this.controls);

    //Хелперы
    new OrbitControls(this.camera, this.renderer.domElement);

    const container = document.getElementById('WebGL-output');

    Controls.append(container, this.stats.dom, this.renderer.domElement);

    renderFunc();
  };

  render() {
    this.stats.update();

    this.decreaseNoise(this.controls);

    this.sphere.render();
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

    const limitStep = this.controls.speed + this.animControls.step.step;
    const limitNoise = this.controls.noiseAmount + this.animControls.noise.step;

    this.bubbleIncreaseNoise = true;

    const timer = setInterval(() => {
      const flag = this.increaseNoise({speed: limitStep, noise: limitNoise});

      if (!flag) {
        this.bubbleIncreaseNoise = false;
        clearInterval(timer);
      }
    }, this.animControls.intStep);
  };

  increaseNoise(limit) {
    if ((this.controls.speed >= limit.speed || this.controls.speed >
        this.animControls.step.max) &&
        (this.controls.noiseAmount >= limit.noise || this.controls.noiseAmount >
            this.animControls.noise.max)) {
      return false;
    }

    this.controls.speed = this.controls.speed + this.animControls.step.animStep;
    this.controls.noiseAmount = this.controls.noiseAmount +
        this.animControls.noise.animStep;

    return true;
  }

  decreaseNoise() {
    if (this.bubbleIncreaseNoise) return;

    const step = this.animControls.step;
    const noise = this.animControls.noise;

    if (this.controls.speed <= step.min && this.controls.noiseAmount <=
        noise.min) return;

    const decelerationRate = 10;

    this.controls.speed = this.controls.speed > step.min ?
        this.controls.speed - step.step / decelerationRate :
        this.controls.speed;
    this.controls.noiseAmount = this.controls.noiseAmount > noise.min ?
        this.controls.noiseAmount - noise.step / (decelerationRate * 3) :
        this.controls.noiseAmount;
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
