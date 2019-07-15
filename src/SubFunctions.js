import * as THREE from 'three';
import bgUrl from './sky.jpg';

export default class SubFunctions {
  constructor(scene, renderer, camera) {
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;
    this.raycaster = new THREE.Raycaster();
    this.mouse = {x: 0, y: 0};
    this.cursorOnBubble = false;
    this.intersects = [];
  }

  initTrash() {
    const trash = [];
    const particlesQuantity = 125;// кол-во мусора

    // let particlesTexture= new THREE.TextureLoader().load('public/images/skybox/3.jpg');// текстура для мусора
    const particlesGeometry = new THREE.SphereGeometry(0.05, 4, 4);
    const particlesMaterial = new THREE.MeshBasicMaterial({
      // map: particlesTexture
    });

    for (let i = 0; i < particlesQuantity; i++) {
      const mesh = new THREE.Mesh(particlesGeometry, particlesMaterial);

      mesh.position.x = Math.random() * 100;
      mesh.position.y = Math.random() * 40;
      mesh.position.z = Math.random() * 70;
      mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

      this.scene.add(mesh);
      trash.push(mesh);
    }

    return trash;
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
    return () => {
      if (!this.intersects.length || controls.bubbleShake) return false;

      const animControls = {
        step: {max: 1.5, min: 0.5},
        noise: {max: 0.4, min: 0.1},
        intStep: 10,
        animStep: 0.05
      };

      controls.bubbleShake = true;

      const timer = setInterval(() => {
        if (controls.step < animControls.step.max) {
          controls.step += animControls.animStep;
          if (controls.noiseAmount < animControls.noise.max) {
            controls.noiseAmount += animControls.animStep;
          }
        } else {
          clearInterval(timer);
          let timer2 = setInterval(() => {
            if (controls.step > animControls.step.min) {
              controls.step -= animControls.animStep;
              if (controls.noiseAmount > animControls.noise.min) {
                controls.noiseAmount -= animControls.animStep;
              }
            } else {
              clearInterval(timer2);
              controls.bubbleShake = false;
            }
          }, animControls.intStep);
        }
      }, animControls.intStep);
    };
  }

  static loadBackground(scene) {
    const urls = [
      bgUrl, // слева
      bgUrl, // справа
      bgUrl, // сверху
      bgUrl, // снизу
      bgUrl, // сзади
      bgUrl, // спереди
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

  onDocumentMouseMove(sphere, controls) {
    return event => {
      const coefEffect = 1;

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      sphere.position.x = -this.mouse.x * coefEffect;
      sphere.position.y = -this.mouse.y * coefEffect;

      this.checkIntersects(controls);
    };
  }

  checkIntersects(controls) {
    if (this.mouse.x === 0 && this.mouse.y === 0) return false;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    this.intersects = this.raycaster.intersectObjects(this.scene.children,
        true);

    if (this.intersects.length && this.intersects[0].object.name === 'bubble') {
      if (!this.cursorOnBubble) this.triggerBubbleClickWithCurs(controls);
    } else {
      if (this.cursorOnBubble) this.triggerBubbleClickWithCurs(controls);
    }
  }

  initEvents(sphere, controls) {
    window.addEventListener('resize', this.onWindowResize());
    document.addEventListener('click', this.bubbleClick(controls));
    document.addEventListener('mousemove',
        this.onDocumentMouseMove(sphere, controls));
  }

  triggerBubbleClickWithCurs(controls) {
    this.bubbleClick(controls)();
    this.cursorOnBubble = !this.cursorOnBubble;
  }
};
