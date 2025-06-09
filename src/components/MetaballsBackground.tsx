import React, { useEffect, useRef } from 'react';

const MetaballsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Metaball configuration
    const metaballs = [
      { x: 100, y: 100, vx: 0.5, vy: 0.3, radius: 120, color: [6, 182, 212, 0.3] }, // cyan
      { x: 300, y: 200, vx: -0.3, vy: 0.4, radius: 100, color: [139, 92, 246, 0.3] }, // purple
      { x: 500, y: 150, vx: 0.4, vy: -0.2, radius: 80, color: [236, 72, 153, 0.3] }, // pink
      { x: 200, y: 400, vx: -0.2, vy: -0.5, radius: 110, color: [16, 185, 129, 0.3] }, // emerald
      { x: 600, y: 300, vx: 0.6, vy: 0.1, radius: 90, color: [245, 101, 101, 0.3] }, // red
    ];

    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update metaball positions
      metaballs.forEach((ball, index) => {
        // Update position with sine wave for smooth movement
        ball.x += ball.vx + Math.sin(time + index) * 0.1;
        ball.y += ball.vy + Math.cos(time + index * 0.7) * 0.1;

        // Bounce off edges
        if (ball.x < -ball.radius || ball.x > canvas.width + ball.radius) {
          ball.vx *= -1;
        }
        if (ball.y < -ball.radius || ball.y > canvas.height + ball.radius) {
          ball.vy *= -1;
        }

        // Keep within bounds
        ball.x = Math.max(-ball.radius / 2, Math.min(canvas.width + ball.radius / 2, ball.x));
        ball.y = Math.max(-ball.radius / 2, Math.min(canvas.height + ball.radius / 2, ball.y));
      });

      // Create image data for metaball effect
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Calculate metaball field
      for (let x = 0; x < canvas.width; x += 2) {
        for (let y = 0; y < canvas.height; y += 2) {
          let sum = 0;
          let finalColor = [0, 0, 0, 0];

          metaballs.forEach(ball => {
            const dx = x - ball.x;
            const dy = y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ball.radius) {
              const influence = (ball.radius - distance) / ball.radius;
              const strength = Math.pow(influence, 2);
              sum += strength;

              // Blend colors
              finalColor[0] += ball.color[0] * strength;
              finalColor[1] += ball.color[1] * strength;
              finalColor[2] += ball.color[2] * strength;
              finalColor[3] += ball.color[3] * strength;
            }
          });

          // Apply threshold for metaball effect
          if (sum > 0.3) {
            const pixelIndex = (y * canvas.width + x) * 4;
            const alpha = Math.min(255, finalColor[3] * 255 * sum);
            
            data[pixelIndex] = finalColor[0] / sum;     // R
            data[pixelIndex + 1] = finalColor[1] / sum; // G
            data[pixelIndex + 2] = finalColor[2] / sum; // B
            data[pixelIndex + 3] = alpha;               // A

            // Fill adjacent pixels for better performance
            if (x + 1 < canvas.width) {
              const nextPixelIndex = (y * canvas.width + x + 1) * 4;
              data[nextPixelIndex] = data[pixelIndex];
              data[nextPixelIndex + 1] = data[pixelIndex + 1];
              data[nextPixelIndex + 2] = data[pixelIndex + 2];
              data[nextPixelIndex + 3] = data[pixelIndex + 3];
            }
            if (y + 1 < canvas.height) {
              const nextRowPixelIndex = ((y + 1) * canvas.width + x) * 4;
              data[nextRowPixelIndex] = data[pixelIndex];
              data[nextRowPixelIndex + 1] = data[pixelIndex + 1];
              data[nextRowPixelIndex + 2] = data[pixelIndex + 2];
              data[nextRowPixelIndex + 3] = data[pixelIndex + 3];
            }
          }
        }
      }

      // Draw the metaballs
      ctx.putImageData(imageData, 0, 0);

      // Add some additional glow effects
      metaballs.forEach(ball => {
        const gradient = ctx.createRadialGradient(
          ball.x, ball.y, 0,
          ball.x, ball.y, ball.radius * 1.5
        );
        
        gradient.addColorStop(0, `rgba(${ball.color[0]}, ${ball.color[1]}, ${ball.color[2]}, 0.1)`);
        gradient.addColorStop(0.7, `rgba(${ball.color[0]}, ${ball.color[1]}, ${ball.color[2]}, 0.05)`);
        gradient.addColorStop(1, 'transparent');

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default MetaballsBackground;