import * as THREE from 'three';
import Events from './Events';
import px from '../../assets/images/px.jpg';
import nx from '../../assets/images/nx.jpg';
import py from '../../assets/images/py.jpg';
import ny from '../../assets/images/ny.jpg';
import pz from '../../assets/images/pz.jpg';
import nz from '../../assets/images/nz.jpg';

export default  class Controls {
  static setConfig(renderer, camera) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.set(0, 0, 90);

    Events.init(renderer, camera);
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

  static append(container, ...children) {
    children.forEach(item => {
      container.appendChild(item);
    })
  }
}
