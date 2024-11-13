import React, { useEffect, useRef, useState } from 'react';

const WheelComponent = ({ segments, segColors, onFinished, primaryColor = 'black', contrastColor = 'white', buttonText = 'Spin', size = 600 }) => {
    const canvasRef = useRef(null);
    const [angleCurrent, setAngleCurrent] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        drawWheel(context);
    }, [segments, angleCurrent]);

    const drawWheel = (ctx) => {
        const centerX = ctx.canvas.width / 2;
        const centerY = ctx.canvas.height;
        const radius = size / 2;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        let lastAngle = angleCurrent;

        segments.forEach((segment, index) => {
            const angle = (2 * Math.PI) / segments.length;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, lastAngle, lastAngle + angle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = segColors[index];
            ctx.fill();
            lastAngle += angle;

            // Draw segment text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(lastAngle - angle / 2);
            ctx.fillStyle = contrastColor;
            ctx.font = 'bold 1em Arial';
            ctx.fillText(segment, radius / 2, 0);
            ctx.restore();
        });

        // Draw the needle
        drawNeedle(ctx, centerX, centerY);
    };

    const drawNeedle = (ctx, centerX, centerY) => {
        ctx.beginPath();
        ctx.moveTo(centerX + 20, centerY - size / 2);
        ctx.lineTo(centerX - 20, centerY - size / 2);
        ctx.lineTo(centerX, centerY - size / 2 - 20);
        ctx.fillStyle = contrastColor;
        ctx.fill();
    };

    // Function to shuffle the segments array
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    const spin = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        const spinDuration = Math.floor(Math.random() * (12000 - 3000 + 1)) + 3000; // Random duration between 3000 and 12000 ms
        const spinAngle = Math.random() * 10 * Math.PI + (5 * Math.PI); // Random angle between 5π and 15π
        const start = Date.now();

        const animate = () => {
            const now = Date.now();
            const elapsed = now - start;

            if (elapsed < spinDuration) {
                const progress = elapsed / spinDuration;
                setAngleCurrent(spinAngle * progress); // Update angle based on progress
                requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                // Calculate the final angle and adjust to find the winning segment
                const finalAngle = (angleCurrent + spinAngle) % (2 * Math.PI);
                const adjustedAngle = finalAngle - Math.PI / 2; // Rotate to make the top 0 angle
                const winningSegmentIndex = Math.floor(((adjustedAngle + Math.PI * 2) % (2 * Math.PI)) / (2 * Math.PI) * segments.length);
                const winner = segments[winningSegmentIndex];
                onFinished(winner);
            }
        };

        requestAnimationFrame(animate);
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={size}
                height={size}
                style={{ display: 'block', overflow: 'hidden', margin: 'auto', position: 'relative', top: '-50%' }} // Show only top half
            />
            <button onClick={spin} disabled={isSpinning}>{buttonText}</button>
        </div>
    );
};

export default WheelComponent;
