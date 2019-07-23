import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import './assets/shaders/FresnelShader';
import Controls from './classes/constrols/Controls'
import Sphere from './classes/sphere/Sphere';

export default class MainScene {
  sphere = null;
  stats = new Stats();

  constructor(scene, renderer, camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
  }

  init(renderFunc) {
    Controls.setConfig(this.renderer, this.camera);

    // загрузка заднего фона
    const textureCube = Controls.loadBackground(this.scene);

    this.sphere = new Sphere(this.scene, this.camera, textureCube);
    this.scene.add(this.sphere.create());

    //Хелперы
    new OrbitControls(this.camera, this.renderer.domElement);

    const container = document.getElementById('WebGL-output');

    Controls.append(container, this.stats.dom, this.renderer.domElement);

    renderFunc();
  };

  render() {
    this.stats.update();

    this.sphere.render();
  }
}
