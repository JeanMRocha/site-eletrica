import { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { preventContextMenu } from './fabricCanvasAdapter';

export function useCanvasInit(
  canvasElementRef: React.MutableRefObject<HTMLCanvasElement | null>,
  shellRef: React.MutableRefObject<HTMLDivElement | null>,
  onCanvasReady: (canvas: Canvas) => void,
  onCanvasDestroy: () => void
) {
  const canvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElementRef.current || !shellRef.current) return;

    const canvas = new Canvas(canvasElementRef.current, {
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      selection: true,
    });
    canvasRef.current = canvas;
    onCanvasReady(canvas);

    const resize = () => {
      const rect = shellRef.current?.getBoundingClientRect();
      if (!rect) return;
      canvas.setDimensions({ width: Math.max(320, rect.width), height: Math.max(420, rect.height) });
      canvas.requestRenderAll();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shellRef.current);
    resize();

    canvas.upperCanvasEl.addEventListener('contextmenu', preventContextMenu);

    return () => {
      canvas.upperCanvasEl.removeEventListener('contextmenu', preventContextMenu);
      resizeObserver.disconnect();
      canvas.dispose();
      canvasRef.current = null;
      onCanvasDestroy();
    };
  }, []);

  return canvasRef;
}
