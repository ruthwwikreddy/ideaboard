import React, { useEffect, useRef } from "react";

export const HeroBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener("resize", resize);
        resize();

        const waves = [
            {
                y: height / 2,
                length: 0.01,
                amplitude: 50,
                speed: 0.02,
                color: "rgba(255, 255, 255, 0.05)",
                offset: 0,
            },
            {
                y: height / 2,
                length: 0.005,
                amplitude: 70,
                speed: 0.015,
                color: "rgba(255, 255, 255, 0.03)",
                offset: 100,
            },
            {
                y: height / 2,
                length: 0.008,
                amplitude: 60,
                speed: 0.025,
                color: "rgba(100, 100, 255, 0.05)", // Subtle blueish
                offset: 200,
            },
            {
                y: height / 2,
                length: 0.006,
                amplitude: 40,
                speed: 0.01,
                color: "rgba(200, 100, 255, 0.05)", // Subtle purpleish
                offset: 300,
            },
            {
                y: height / 2,
                length: 0.012,
                amplitude: 30,
                speed: 0.03,
                color: "rgba(255, 255, 255, 0.04)",
                offset: 400,
            },
        ];

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            waves.forEach((wave) => {
                ctx.beginPath();
                ctx.moveTo(0, wave.y);

                for (let i = 0; i < width; i++) {
                    const y =
                        wave.y +
                        Math.sin(i * wave.length + wave.offset) * wave.amplitude * Math.sin(wave.offset * 0.1); // Add a second sine for "breathing" amplitude
                    ctx.lineTo(i, y);
                }

                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 2; // Thicker lines for visibility
                ctx.stroke();

                wave.offset += wave.speed;
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
        />
    );
};
