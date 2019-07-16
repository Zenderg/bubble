import * as THREE from 'three';
// import bgUrl from './assets/sky.jpg';
import nx from './assets/nx.jpg';
import ny from './assets/ny.jpg';
import nz from './assets/nz.jpg';
import px from './assets/px.jpg';
import py from './assets/py.jpg';
import pz from './assets/pz.jpg';

export default class SubFunctions {
  constructor(scene, renderer, camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = {x: 0, y: 0};
    this.cursorOnBubble = false;
    this.bubbleShake = false;
    this.intersects = [];
    this.animControls = {
      step: {max: 1.5, min: 0.5},
      noise: {max: 0.4, min: 0.1},
      intStep: 10,
      animStep: 0.05
    };
  }

  onWindowResize() {
    return () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight;

      this.renderer.setSize(containerWidth, containerHeight);
      this.camera.aspect = containerWidth / containerHeight;
      this.camera.updateProjectionMatrix();
    };
  }

  bubbleClick(controls) {
    return (event) => {
      this.setMousePos(event);

      if (!this.isIntersect(this.mouse, 'bubble') || controls.bubbleShake) return false;

      this.bubbleShake = true;

      const timer = setInterval(() => {
        if (controls.step < this.animControls.step.max) {
          controls.step += this.animControls.animStep;
          if (controls.noiseAmount < this.animControls.noise.max) {
            controls.noiseAmount += this.animControls.animStep;
          }
        } else {
          clearInterval(timer);
          let timer2 = setInterval(() => {
            if (controls.step > this.animControls.step.min) {
              controls.step -= this.animControls.animStep;
              if (controls.noiseAmount > this.animControls.noise.min) {
                controls.noiseAmount -= this.animControls.animStep;
              }
            } else {
              clearInterval(timer2);
              this.bubbleShake = false;
            }
          }, this.animControls.intStep);
        }
      }, this.animControls.intStep);
    };
  }

  static loadBackground(scene) {
    const urls = [
      px, // слева
      nx, // справа
      py, // сверху
      ny, // снизу
      pz, // сзади
      nz, // спереди
    ];
    const textureCube = new THREE.CubeTextureLoader().load(urls);

    textureCube.format = THREE.RGBFormat;
    textureCube.minFilter = THREE.LinearFilter;
    scene.background = textureCube;

    return textureCube;
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

  onMouseMove(sphere) {
    return event => {
      const coefEffect = 1;

      this.setMousePos(event);

      sphere.position.x = -this.mouse.x * coefEffect;
      sphere.position.y = -this.mouse.y * coefEffect;
    };
  }

  isIntersect(mouse, name) {
    if (mouse.x === 0 && mouse.y === 0) return false;

    this.raycaster.setFromCamera(mouse, this.camera);
    this.intersects = this.raycaster.intersectObjects(this.scene.children,
        true);

    return !!this.intersects.length && this.intersects[0].object.name === name;
  }

  setMousePos(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  initEvents(sphere, controls) {
    window.addEventListener('resize', this.onWindowResize());
    document.addEventListener('click', this.bubbleClick(controls));
    document.addEventListener('mousemove',
        this.onMouseMove(sphere));
  }
};
