import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export function TouchControls() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Pinch to zoom
        e.preventDefault();
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gl]);

  return null;
}
