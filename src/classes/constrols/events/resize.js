const event = (renderer, camera) => () => {
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    renderer.setSize(containerWidth, containerHeight);
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
};

export default event;