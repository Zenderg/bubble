import click from './events/click';
import mousemove from './events/mousemove';

export default class Events {
  static init(scene, camera, sphere, name, actions, controls) {
    document.addEventListener('click', click(scene, camera, name, actions));
    document.addEventListener('mousemove', mousemove(scene, camera, sphere, name, actions, controls))
  }
}
