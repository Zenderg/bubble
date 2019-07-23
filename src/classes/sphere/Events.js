import click from './events/click';
import mousemove from './events/mousemove';

export default class Events {
  static init(scene, camera, sphere, name, controls) {
    document.addEventListener('click', click(scene, camera, name, controls));
    document.addEventListener('mousemove', mousemove(sphere))
  }
}
