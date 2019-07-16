import MainScene from './MainScene';
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});

const bubble = new MainScene(scene, renderer, camera);

const render = () => {
    bubble.render();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

bubble.init(render);

