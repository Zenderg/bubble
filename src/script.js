import * as THREE from 'three';
import SimplexNoise from 'simplex-noise'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import './FresnelShader'
import bgUrl from './sky.jpg'

const sphereVerticesArray = [];
const sphereVerticesNormArray = [];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
const renderer = new THREE.WebGLRenderer({alpha: true});
let simplex = new SimplexNoise();
let sphereGeom = new THREE.SphereGeometry(25, 100, 100);
export let sphere = "";
// const clock = new THREE.Clock();
const controls = new function () {
    this.noiseAmount = 0.1;
    this.step = 0.5;
    this.coef = 20;
};
let bubbleState = "off";
let step = 0;
let mouse = {
    x: 0,
    y: 0
};
let raycaster = new THREE.Raycaster();
let flag = false;
let intersects;
let parallax = true;
let moveFlag = false;

// куб для тестирования прозрачности
let box;

//мусор
let trash = [];

//хелперы
const stats = new Stats();

init();

function init() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.position.set(0, 0, 90);

    // загрузка заднего фона
    let textureCube = loadBackground();

    for (let i = 0; i < sphereGeom.vertices.length; i += 1) {
        let vertex = sphereGeom.vertices[i];
        let vec = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        sphereVerticesArray.push(vec);
        let mag = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
        mag = Math.sqrt(mag);
        let norm = new THREE.Vector3(vertex.x / mag, vertex.y / mag, vertex.z / mag);
        sphereVerticesNormArray.push(norm);
    }

    // загрузка шейдеров
    let planetMaterial = loadShader(textureCube);

    sphere = new THREE.Mesh(sphereGeom, planetMaterial);
    sphere.name = "bubble";
    scene.add(sphere);

    const container = document.getElementById("WebGL-output");

    //Хелперы
    new OrbitControls( camera, renderer.domElement );
    container.appendChild( stats.dom );

    // обертка
    container.appendChild(renderer.domElement);

    // добавление света для тестового куба
    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.setScalar(10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    // Инициализация тестового куба
    box = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6), new THREE.MeshLambertMaterial({
        color: "white"
    }));
    scene.add(box);

    initTrash();

    initEvents();

    render();
}

function render() {
    //обновление хелпера статистики
    stats.update();

    // анимация тестового куба
    box.rotation.x+=0.005;
    box.rotation.y+=0.005;

    // анимация мусора
    let timer = Date.now() * 0.00005;
    for (let i = 0, il = trash.length; i < il; i++) {
        let mesh = trash[i];
        mesh.position.x = 50 * Math.cos(timer + i);
        mesh.position.y = 50 * Math.sin(timer + i * 1.1);
    }

    step += controls.step;

    renderer.clear();

    // перерисовка сферы при каждом кадре
    scene.remove(sphere);
    const iMax = sphereGeom.vertices.length;

    for (let i = 0; i < iMax; i++) {
        let vertex = sphereGeom.vertices[i];

        let value = simplex.noise3D((vertex.x + step) / controls.coef, vertex.y / controls.coef, vertex.z / controls.coef);

        vertex.x = sphereVerticesArray[i].x + sphereVerticesNormArray[i].x * value * controls.noiseAmount;
        vertex.y = sphereVerticesArray[i].y + sphereVerticesNormArray[i].y * value * controls.noiseAmount;
        vertex.z = sphereVerticesArray[i].z + sphereVerticesNormArray[i].z * value * controls.noiseAmount;
    }

    sphereGeom.computeFaceNormals();
    sphereGeom.computeVertexNormals();

    sphereGeom.verticesNeedUpdate = true;
    scene.add(sphere);

    //следующий кадр
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function initTrash() {
    // let particlesTexture= new THREE.TextureLoader().load('public/images/skybox/3.jpg');// текстура для мусора
    let particlesGeometry = new THREE.SphereGeometry(0.05, 4, 4);
    let particlesMaterial = new THREE.MeshBasicMaterial({
        // map: particlesTexture
    });

    let particlesQuantity = 125;// кол-во мусора
    for (let i = 0; i < particlesQuantity; i++) {
        let mesh = new THREE.Mesh(particlesGeometry, particlesMaterial);

        mesh.position.x = Math.random() * 100;
        mesh.position.y = Math.random() * 40;
        mesh.position.z = Math.random() * 70;
        mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 3 + 1;

        scene.add(mesh);
        trash.push(mesh);
    }

    return trash;
}

function onWindowResize() {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    renderer.setSize(containerWidth, containerHeight);
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
}

function bubbleClick() {
    if (intersects.length !== 0 && !flag) {
        let intStep = 10; // время, указано в мс
        let animStep = 0.05;// шаг анимации
        flag = true;
        let timer = setInterval(() => {

            if (+controls.step.toFixed(1) !== 1.5) {
                controls.step += animStep;
                if (+controls.noiseAmount.toFixed(1) !== 0.4) {
                    controls.noiseAmount += animStep;
                }
            }
            else {
                clearInterval(timer);
                let timer2 = setInterval(() => {
                    if (+controls.step.toFixed(1) !== 0.5) {
                        controls.step -= animStep;
                        if (+controls.noiseAmount.toFixed(1) !== 0.1) {
                            controls.noiseAmount -= animStep;
                        }
                    }
                    else {
                        clearInterval(timer2);
                        flag = false;
                    }
                }, intStep);

            }

        }, intStep);
    }
}

function loadBackground() {
    const urls = [
        bgUrl, // слева
        bgUrl, // справа
        bgUrl, // сверху
        bgUrl, // снизу
        bgUrl, // сзади
        bgUrl // спереди
    ];
    const textureCube = new THREE.CubeTextureLoader().load(urls);
    textureCube.format = THREE.RGBFormat;
    textureCube.minFilter = THREE.LinearFilter;
    scene.background = textureCube;
    return textureCube;
}

function loadShader(texture) {
    const shader = THREE.FresnelShader;
    const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms["tCube"].value = texture;

    const planetMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,
        transparent: true
    });

    return planetMaterial;
}

function onDocumentMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    let coefEffect=1;
    if (parallax) {
        sphere.position.x = -mouse.x * coefEffect;
        sphere.position.y = -mouse.y * coefEffect;
    }

    // if (document.getElementById("text")) {
    //     document.getElementById("text").style = "transform: translate(" + -mouse.x * 10 + "px," + mouse.y * 10 + "px)";
    // }

    checkIntersects();
}

function checkIntersects() {
    raycaster.setFromCamera(mouse, camera);

    intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length !== 0 && intersects[0].object.name === "bubble") {
        if (mouse.x !== 0 && mouse.y !== 0 && bubbleState === "off") {
            bubbleClick();
            bubbleState = "on"
        }
    }
    else {
        if (mouse.x !== 0 && mouse.y !== 0 && bubbleState === "on") {
            bubbleClick();
            bubbleState = "off"
        }
    }
}

function initEvents() {
    document.addEventListener("click", bubbleClick);

    window.addEventListener('resize', onWindowResize, false);

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    window.addEventListener("bubbelMoveRight", function () {
        parallax = false;
        moveFlag = false;

        returnInStartY()
            .then(
                result => moveToRight()
            );
    });

    window.addEventListener("bubbelMoveLeft", function () {
        parallax = false;
        moveFlag = false;

        returnInStartY()
            .then(
                result => moveToLeft()
            );
    });

    window.addEventListener("bubbelMoveCenter", function () {
        parallax = false;
        moveFlag = false;

        returnInStartX()
            .then(
                result => parallax = true
            );
    });
}

function returnInStartY() {
    const timerStep = 10;
    const animStep = 0.1;

    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            if (sphere.position.y.toFixed(1) > 0) {
                sphere.position.y -= animStep;
            }
            else if (sphere.position.y.toFixed(1) < 0) {
                sphere.position.y += animStep;
            }
            else {
                resolve("Смещение завершено");
                clearInterval(timer);
            }
        }, timerStep);
    });
}

function moveToRight(){
    const timerStep = 10;
    const animStep = 0.9;
    moveFlag = true;

    const timer = setInterval(() => {
        if (!moveFlag) clearInterval(timer);

        if (sphere.position.x.toFixed(1) < 25) {
            sphere.position.x += animStep;
        }
        else {
            clearInterval(timer);
        }
    }, timerStep);
}

function moveToLeft() {
    let timerStep = 10;
    let animStep = 0.9;
    moveFlag = true;

    let timer = setInterval(() => {
        if (!moveFlag) clearInterval(timer);

        if (sphere.position.x.toFixed(1) > -25) {
            sphere.position.x -= animStep;
        }
        else {
            clearInterval(timer);
        }
    }, timerStep);
}

function returnInStartX() {
    const timerStep = 10;
    const animStep = 0.9;
    moveFlag = true;

    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            if (!moveFlag) clearInterval(timer);

            if (Math.round(sphere.position.x) > 0) {
                sphere.position.x -= animStep;
            }
            else if (Math.round(sphere.position.x) < 0) {
                sphere.position.x += animStep;
            }
            else {
                resolve("Перемещение завершено");
                clearInterval(timer);
            }
        }, timerStep);
    });
}