import * as THREE from 'three';

export const isIntersect = (scene, camera, coords, name) => {
  if (coords.x === 0 && coords.y === 0) return false;

  const raycaster = new THREE.Raycaster().setFromCamera(coords, camera);
  const intersects = raycaster.intersectObjects(scene.children,
      true);

  return !!intersects.length && intersects[0].object.name === name;
};
