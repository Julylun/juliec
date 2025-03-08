import React, { useEffect, useRef } from 'react';

interface Triangle {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  size: number;
  speed: number;
  angle: number;
  color: string;
}

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });
  const trianglesRef = useRef<Triangle[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createTriangles = () => {
      const triangles: Triangle[] = [];
      // Tạo tam giác ở góc trên trái (ít hơn)
      for (let i = 0; i < 10; i++) {
        triangles.push({
          x: Math.random() * (canvas.width * 0.3),
          y: Math.random() * (canvas.height * 0.3),
          originalX: Math.random() * (canvas.width * 0.3),
          originalY: Math.random() * (canvas.height * 0.3),
          size: 5 + Math.random() * 15,
          speed: 0.2 + Math.random() * 0.3,
          angle: Math.random() * Math.PI * 2,
          color: 'rgba(59, 130, 246, 0.5)'
        });
      }

      // Tạo tam giác ở góc dưới phải (nhiều hơn)
      for (let i = 0; i < 20; i++) {
        triangles.push({
          x: canvas.width - Math.random() * (canvas.width * 0.4),
          y: canvas.height - Math.random() * (canvas.height * 0.4),
          originalX: canvas.width - Math.random() * (canvas.width * 0.4),
          originalY: canvas.height - Math.random() * (canvas.height * 0.4),
          size: 5 + Math.random() * 15,
          speed: 0.2 + Math.random() * 0.3,
          angle: Math.random() * Math.PI * 2,
          color: 'rgba(59, 130, 246, 0.5)'
        });
      }
      return triangles;
    };

    const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x - size * Math.cos(Math.PI / 6), y + size * Math.sin(Math.PI / 6));
      ctx.lineTo(x + size * Math.cos(Math.PI / 6), y + size * Math.sin(Math.PI / 6));
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const drawConnections = (ctx: CanvasRenderingContext2D, triangles: Triangle[], mouseX: number, mouseY: number) => {
      for (let i = 0; i < triangles.length; i++) {
        for (let j = i + 1; j < triangles.length; j++) {
          const dx = triangles[i].x - triangles[j].x;
          const dy = triangles[i].y - triangles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150 && distance > 30) {
            ctx.beginPath();
            ctx.moveTo(triangles[i].x, triangles[i].y);
            ctx.lineTo(triangles[j].x, triangles[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${1 - distance / 150})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        const dxMouse = triangles[i].x - mouseX;
        const dyMouse = triangles[i].y - mouseY;
        const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (distanceMouse < 200) {
          ctx.beginPath();
          ctx.moveTo(triangles[i].x, triangles[i].y);
          ctx.lineTo(mouseX, mouseY);
          ctx.strokeStyle = `rgba(59, 130, 246, ${1 - distanceMouse / 200})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    };

    const keepDistance = (triangles: Triangle[], currentIndex: number) => {
      const minDistance = 30;
      const triangle = triangles[currentIndex];
      let dx = 0;
      let dy = 0;

      for (let i = 0; i < triangles.length; i++) {
        if (i !== currentIndex) {
          const other = triangles[i];
          const deltaX = triangle.x - other.x;
          const deltaY = triangle.y - other.y;
          const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

          if (distance < minDistance) {
            const angle = Math.atan2(deltaY, deltaX);
            const force = (minDistance - distance) / minDistance;
            dx += Math.cos(angle) * force * 0.5;
            dy += Math.sin(angle) * force * 0.5;
          }
        }
      }

      return { dx, dy };
    };

    const animate = () => {
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      trianglesRef.current.forEach((triangle, index) => {
        const dx = mouseRef.current.x - triangle.x;
        const dy = mouseRef.current.y - triangle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const distanceToOrigin = Math.sqrt(
          Math.pow(triangle.x - triangle.originalX, 2) + 
          Math.pow(triangle.y - triangle.originalY, 2)
        );

        const repulsion = keepDistance(trianglesRef.current, index);

        if (distance < 200) {
          if (distanceToOrigin < 200) {
            triangle.x += ((dx / distance) * triangle.speed + repulsion.dx) * 0.5;
            triangle.y += ((dy / distance) * triangle.speed + repulsion.dy) * 0.5;
          } else {
            const dxOriginal = triangle.originalX - triangle.x;
            const dyOriginal = triangle.originalY - triangle.y;
            triangle.x += dxOriginal * 0.05;
            triangle.y += dyOriginal * 0.05;
          }
        } else {
          const dxOriginal = triangle.originalX - triangle.x;
          const dyOriginal = triangle.originalY - triangle.y;
          triangle.x += (dxOriginal * 0.02 + repulsion.dx) * 0.5;
          triangle.y += (dyOriginal * 0.02 + repulsion.dy) * 0.5;
        }

        drawTriangle(ctx, triangle.x, triangle.y, triangle.size, triangle.color);
      });

      drawConnections(ctx, trianglesRef.current, mouseRef.current.x, mouseRef.current.y);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    
    resizeCanvas();
    trianglesRef.current = createTriangles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0.7
      }}
    />
  );
};

export default Background; 