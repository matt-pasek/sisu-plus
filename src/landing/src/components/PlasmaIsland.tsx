import Plasma from '@landing/components/Plasma';

export const PlasmaIsland = () => (
  <Plasma
    center={[1, 0.75]}
    color="#419648"
    rotation={1.5}
    speed={0.6}
    direction="forward"
    scale={1.38}
    opacity={0.78}
    mouseInteractive
  />
);

export default PlasmaIsland;
