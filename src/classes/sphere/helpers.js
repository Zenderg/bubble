import * as THREE from 'three';

const isIntersect = (scene, camera, event, name) => {
  const coords = mousePos(event);

  const raycaster = new THREE.Raycaster();

  raycaster.setFromCamera(coords, camera);

  const intersects = raycaster.intersectObjects(scene.children,
      true);

  return !!intersects.length && intersects[0].object.name === name;
};

const mousePos = event => {
  const x = (event.clientX / window.innerWidth) * 2 - 1;
  const y = -(event.clientY / window.innerHeight) * 2 + 1;

  return {x, y};
};

export {isIntersect, mousePos}