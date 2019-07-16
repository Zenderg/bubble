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
        this.bubbleIncreaseNoise = false;
        this.intersects = [];
        this.animControls = {
            step: {step: 0.2, min: 0.5, max: 1.7, animStep: 0.05},
            noise: {step: 0.07, min: 0.1, max: 0.5, animStep: 0.008},
            intStep: 6
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

            if (!this.isIntersect(this.mouse, 'bubble')) return false;

            const limitStep = controls.step + this.animControls.step.step;
            const limitNoise = controls.noiseAmount + this.animControls.noise.step;

            this.bubbleIncreaseNoise = true;

            const timer = setInterval(() => {
                const flag = SubFunctions.increaseNoise(controls, {step: limitStep, noise: limitNoise}, this.animControls);

                if(!flag) {
                    this.bubbleIncreaseNoise = false;
                    clearInterval(timer);
                }
            }, this.animControls.intStep)
        };
    }

    static increaseNoise(controls, limit, animControls) {
        if ((controls.step >= limit.step || controls.step > animControls.step.max) &&
            (controls.noiseAmount >= limit.noise || controls.noiseAmount > animControls.noise.max)) {
            return false;
        }

        controls.step = controls.step + animControls.step.animStep;
        controls.noiseAmount = controls.noiseAmount + animControls.noise.animStep;

        return true;
    }

    decreaseNoise(controls) {
        if(this.bubbleIncreaseNoise) return;

        const step = this.animControls.step;
        const noise = this.animControls.noise;

        if (controls.step <= step.min && controls.noiseAmount <= noise.min) return;

        const decelerationRate = 10;

        controls.step = controls.step > step.min ? controls.step - step.step / decelerationRate : controls.step;
        controls.noiseAmount = controls.noiseAmount > noise.min ? controls.noiseAmount - noise.step / (decelerationRate * 3) : controls.noiseAmount;
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
        textureCube.minFilter = THREE.LinearMipMapLinearFilter;
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
        // console.log(this.scene.children);
        this.intersects = this.raycaster.intersectObjects(this.scene.children,
            true);

        // if (this.intersects.length > 0) console.log(this.intersects[0].point);

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
