import * as THREE from 'three';
import SimplexNoise from 'simplex-noise'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import './FresnelShader'
import subFunctions from './subFunctions';

const sphereVerticesArray = [];
const sphereVerticesNormArray = [];

const simplex = new SimplexNoise();
let step = 0;

//хелперы
const stats = new Stats();

const render = (scene, renderer, camera, sphereGeom, controls, trash) => () => {
    //обновление хелпера статистики
    stats.update();

    // анимация мусора
    let timer = Date.now() * 0.00005;
    for (let i = 0, il = trash.length; i < il; i++) {
        let mesh = trash[i];
        mesh.position.x = 50 * Math.cos(timer + i);
        mesh.position.y = 50 * Math.sin(timer + i * 1.1);
    }

    step += controls.step;

    // перерисовка сферы при каждом кадре
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

    //следующий кадр
    requestAnimationFrame(render(scene, renderer, camera, sphereGeom, controls, trash));
    renderer.render(scene, camera);
};

const init = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    const renderer = new THREE.WebGLRenderer({alpha: true});

    const controls = new function () {
        this.noiseAmount = 0.1;
        this.step = 0.5;
        this.coef = 20;
        this.bubbleShake = false;
    };

    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.position.set(0, 0, 90);

    // загрузка заднего фона
    const textureCube = subFunctions.loadBackground(scene);

    //создание геометрии сферы
    const sphereGeom = new THREE.SphereGeometry(25, 100, 100);

    //добавление вершин в массивы
    const verticesLength = sphereGeom.vertices.length;

    for (let i = 0; i < verticesLength; i += 1) {
        const vertex = sphereGeom.vertices[i];
        const vec = new THREE.Vector3(vertex.x, vertex.y, vertex.z);
        sphereVerticesArray.push(vec);
        let mag = vec.x * vec.x + vec.y * vec.y + vec.z * vec.z;
        mag = Math.sqrt(mag);
        let norm = new THREE.Vector3(vertex.x / mag, vertex.y / mag, vertex.z / mag);
        sphereVerticesNormArray.push(norm);
    }

    // загрузка шейдеров
    let planetMaterial = subFunctions.loadShader(textureCube);

    //создание сферы
    const sphere = new THREE.Mesh(sphereGeom, planetMaterial);
    sphere.name = "bubble";
    scene.add(sphere);

    const container = document.getElementById("WebGL-output");

    //Хелперы
    new OrbitControls( camera, renderer.domElement );
    container.appendChild( stats.dom );

    // обертка
    container.appendChild(renderer.domElement);

    const trash = subFunctions.initTrash(scene);

    subFunctions.initEvents(scene, renderer, camera, sphere, controls);

    render(scene, renderer, camera, sphereGeom, controls, trash)();
};

init();
