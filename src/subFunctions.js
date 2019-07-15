import * as THREE from 'three';
import bgUrl from './sky.jpg';

export default {
  raycaster: new THREE.Raycaster(),
  mouse: {x: 0, y: 0},
  bubbleState: 'off',
  intersects: [],

  initTrash: scene => {
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

      scene.add(mesh);
      trash.push(mesh);
    }

    return trash;
  },
  onWindowResize: (renderer, camera) => () => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    renderer.setSize(containerWidth, containerHeight);
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
  },
  bubbleClick: function(controls) {
    return () => {
      if (this.intersects.length !== 0 && !controls.bubbleShake) {
        const intStep = 10; // время, указано в мс
        const animStep = 0.05;// шаг анимации

        controls.bubbleShake = true;

        const timer = setInterval(() => {
          if (+controls.step.toFixed(1) !== 1.5) {
            controls.step += animStep;
            if (+controls.noiseAmount.toFixed(1) !== 0.4) {
              controls.noiseAmount += animStep;
            }
          } else {
            clearInterval(timer);
            let timer2 = setInterval(() => {
              if (+controls.step.toFixed(1) !== 0.5) {
                controls.step -= animStep;
                if (+controls.noiseAmount.toFixed(1) !== 0.1) {
                  controls.noiseAmount -= animStep;
                }
              } else {
                clearInterval(timer2);
                controls.bubbleShake = false;
              }
            }, intStep);

          }

        }, intStep);
      }
    }
  },
  loadBackground: scene => {
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
  },
  loadShader: texture => {
    const shader = THREE.FresnelShader;
    const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms['tCube'].value = texture;

    return new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      transparent: true,
    });
  },
  onDocumentMouseMove: function(scene, sphere, camera,controls) {
    return event => {
      const coefEffect = 1;

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      sphere.position.x = -this.mouse.x * coefEffect;
      sphere.position.y = -this.mouse.y * coefEffect;

      this.checkIntersects(scene, camera, controls);
    };
  },
  checkIntersects: function(scene, camera, controls) {
    this.raycaster.setFromCamera(this.mouse, camera);
    this.intersects = this.raycaster.intersectObjects(scene.children, true);

    if (this.intersects.length !== 0 && this.intersects[0].object.name === 'bubble') {
      if (this.mouse.x !== 0 && this.mouse.y !== 0 && this.bubbleState ===
          'off') {
        this.bubbleClick(controls)();
        this.bubbleState = 'on';
      }
    } else {
      if (this.mouse.x !== 0 && this.mouse.y !== 0 && this.bubbleState ===
          'on') {
        this.bubbleClick(controls)();
        this.bubbleState = 'off';
      }
    }
  },
  initEvents: function(scene, renderer, camera, sphere, controls) {
    window.addEventListener('resize', this.onWindowResize(renderer, camera),
        false);
    document.addEventListener('click', this.bubbleClick(controls));
    document.addEventListener('mousemove',
        this.onDocumentMouseMove(scene, sphere, camera, controls),
        false);
  },
};
