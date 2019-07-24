import {isIntersect} from '../helpers';

let timer = null;

const event = (scene, camera, name, actions) => event => {
  if (!isIntersect(scene, camera, event, name)) return false;

  actions.state = 'increase';

  if (timer) {
    clearTimeout(timer);
    timer = null;
  }

  timer = setTimeout(() => actions.state = 'decrease', 200);
};

export default event;
