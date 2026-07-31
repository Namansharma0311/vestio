import React, { useRef, useEffect, useState } from "react";

const PIXEL = 3;

const PALETTE = {
  offWhite: "#FAF7F1",
  warmWhite: "#FFF5F0",
  tulipPink: "#F8A5A5",
  tulipDeep: "#E87D7D",
  tulipCenter: "#F5C6C6",
  stemGreen: "#7DB87D",
  stemDark: "#5A9B5A",
  leafGreen: "#6BB86B",
  leafDark: "#4A9B4A",
  sunYellow: "#FFD44A",
  sunGlow: "#FFE88A",
  skyBlue: "#A8D8E8",
  soilBrown: "#C4A58A",
  soilDark: "#A0856A",
  grassGreen: "#8FBC8F",
  particle: "#E8D5C8",
};

const TULIP_PIXELS = [
  "....PP....",
  "...PPPP...",
  "..PPPPPP..",
  ".PPPPPPPP.",
  "PPPPPPPPPP",
  "PPPPPPPPPP",
  "..PPPPPP..",
  "..PPPPPP..",
  "....PP....",
];

const STEM_PIXELS = [
  "....SS....",
  "....SS....",
  "....SS....",
  "....SS....",
  "....SS....",
  "....SS....",
  "....SS....",
  "....SS....",
  "....SS....",
  "....SS....",
];

const LEAF_LEFT_PIXELS = [
  "LL........",
  "LLL.......",
  "LLLL......",
  "LLLL......",
  "LLL.......",
  "LL........",
];

const LEAF_RIGHT_PIXELS = [
  "........RR",
  ".......RRR",
  "......RRRR",
  "......RRRR",
  ".......RRR",
  "........RR",
];

const SUN_PIXELS = [
  "....YY....",
  "...YYYYY..",
  "..YYYYYYY.",
  ".YYYYYYYYY",
  "YYYYYYYYYY",
  "YYYYYYYYYY",
  ".YYYYYYYYY",
  "..YYYYYYY.",
  "...YYYYY..",
  "....YY....",
];

const SUN_RAYS = [
  { x: 5, y: -8, len: 6 },
  { x: 8, y: -5, len: 6 },
  { x: 10, y: 0, len: 6 },
  { x: 8, y: 5, len: 6 },
  { x: 5, y: 8, len: 6 },
  { x: 1, y: 8, len: 6 },
  { x: -2, y: 5, len: 6 },
  { x: -4, y: 0, len: 6 },
  { x: -2, y: -5, len: 6 },
  { x: 1, y: -8, len: 6 },
];

const GRASS_BLADES = [
  { x: 0, h: 8 },
  { x: 4, h: 10 },
  { x: 8, h: 6 },
  { x: 12, h: 9 },
  { x: 16, h: 7 },
  { x: 20, h: 11 },
  { x: 24, h: 8 },
  { x: 28, h: 6 },
  { x: 32, h: 10 },
  { x: 36, h: 7 },
  { x: 40, h: 9 },
];

const PETAL_PARTICLES = 20;

function drawRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawPixelGrid(ctx, pixels, startX, startY, scale, colorMap) {
  for (let row = 0; row < pixels.length; row++) {
    for (let col = 0; col < pixels[row].length; col++) {
      const ch = pixels[row][col];
      if (ch === ".") continue;
      const color = colorMap[ch];
      if (!color) continue;
      drawRect(ctx, startX + col * scale, startY + row * scale, scale, scale, color);
    }
  }
}

export default function PixelArtBg() {
  const canvasRef = useRef(null);
  const [time, setTime] = useState(0);
  const [particles, setParticles] = useState([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h;
    let cx, cy;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      cx = w / 2;
      cy = h / 2;
    }

    function initParticles() {
      const newParticles = [];
      for (let i = 0; i < PETAL_PARTICLES; i++) {
        newParticles.push({
          x: cx + (Math.random() - 0.5) * 60,
          y: cy - 120 + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.4,
          vy: 0.3 + Math.random() * 0.5,
          size: 2 + Math.random() * 3,
          alpha: 0.3 + Math.random() * 0.4,
          hue: 340 + Math.random() * 20,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.01,
        });
      }
      setParticles(newParticles);
    }

    function drawSky() {
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, PALETTE.skyBlue);
      grad.addColorStop(0.3, PALETTE.warmWhite);
      grad.addColorStop(0.5, PALETTE.offWhite);
      grad.addColorStop(1, PALETTE.offWhite);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    function drawSun(t) {
      const sunX = cx + 180;
      const sunY = 120;
      const rayLen = 40 + Math.sin(t * 0.001) * 5;

      ctx.strokeStyle = PALETTE.sunGlow;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.4;
      SUN_RAYS.forEach((ray) => {
        ctx.beginPath();
        ctx.moveTo(sunX + ray.x * 8, sunY + ray.y * 8);
        ctx.lineTo(sunX + (ray.x + ray.x * 0.3) * 8, sunY + (ray.y + ray.y * 0.3) * 8);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      const sunGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
      sunGrad.addColorStop(0, PALETTE.sunYellow);
      sunGrad.addColorStop(0.5, PALETTE.sunGlow);
      sunGrad.addColorStop(1, "rgba(255,212,74,0)");
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
      ctx.fill();

      drawPixelGrid(ctx, SUN_PIXELS, sunX - 15, sunY - 15, 3, { Y: PALETTE.sunYellow });
    }

    function drawSoil() {
      const soilY = cy + 60;
      const grad = ctx.createLinearGradient(0, soilY, 0, h);
      grad.addColorStop(0, PALETTE.soilBrown);
      grad.addColorStop(1, PALETTE.soilDark);
      ctx.fillStyle = grad;
      ctx.fillRect(0, soilY, w, h - soilY);

      for (let x = 0; x < w; x += 8) {
        ctx.fillStyle = PALETTE.soilDark;
        ctx.fillRect(x + (Math.random() - 0.5) * 4, soilY + Math.random() * 20, 2, 2);
      }
    }

    function drawGrass() {
      const soilY = cy + 60;
      GRASS_BLADES.forEach((blade) => {
        const x = cx - 100 + blade.x;
        const h = blade.h * PIXEL;
        const sway = Math.sin(time * 0.002 + blade.x) * 3;
        ctx.strokeStyle = PALETTE.grassGreen;
        ctx.lineWidth = PIXEL;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x + sway, soilY);
        ctx.lineTo(x + sway, soilY - h);
        ctx.stroke();

        ctx.strokeStyle = PALETTE.leafDark;
        ctx.beginPath();
        ctx.moveTo(x + sway, soilY);
        ctx.lineTo(x + sway, soilY - h * 0.7);
        ctx.stroke();
      });
    }

    function drawTulip(t) {
      const tulipX = cx - 30;
      const tulipY = cy - 30;
      const scale = PIXEL;
      const sway = Math.sin(t * 0.0008) * 4;

      drawPixelGrid(ctx, STEM_PIXELS, tulipX + sway, tulipY + 90, scale, {
        S: PALETTE.stemGreen,
      });
      drawPixelGrid(ctx, STEM_PIXELS, tulipX + sway + 2, tulipY + 90, scale, {
        S: PALETTE.stemDark,
      });

      drawPixelGrid(ctx, LEAF_LEFT_PIXELS, tulipX + sway - 20, tulipY + 110, scale, {
        L: PALETTE.leafGreen,
      });
      drawPixelGrid(ctx, LEAF_RIGHT_PIXELS, tulipX + sway + 30, tulipY + 110, scale, {
        R: PALETTE.leafGreen,
      });
      drawPixelGrid(ctx, LEAF_LEFT_PIXELS, tulipX + sway - 18, tulipY + 110, scale, {
        L: PALETTE.leafDark,
      });
      drawPixelGrid(ctx, LEAF_RIGHT_PIXELS, tulipX + sway + 32, tulipY + 110, scale, {
        R: PALETTE.leafDark,
      });

      const bloomY = tulipY + 10;
      const bloomSway = sway * 1.2;

      drawPixelGrid(ctx, TULIP_PIXELS, tulipX + bloomSway, bloomY, scale, {
        P: PALETTE.tulipPink,
      });
      drawPixelGrid(ctx, TULIP_PIXELS, tulipX + bloomSway + 1, bloomY + 1, scale, {
        P: PALETTE.tulipDeep,
      });

      const centerGrad = ctx.createRadialGradient(
        tulipX + bloomSway + 15, bloomY + 45, 0,
        tulipX + bloomSway + 15, bloomY + 45, 25
      );
      centerGrad.addColorStop(0, PALETTE.tulipCenter);
      centerGrad.addColorStop(1, PALETTE.tulipDeep);
      ctx.fillStyle = centerGrad;
      ctx.beginPath();
      ctx.ellipse(tulipX + bloomSway + 15, bloomY + 45, 12, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawParticles(t) {
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.y > h + 50 || p.x < -50 || p.x > w + 50) {
          p.x = cx + (Math.random() - 0.5) * 60;
          p.y = cy - 120 + (Math.random() - 0.5) * 40;
          p.alpha = 0.3 + Math.random() * 0.4;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = `hsl(${p.hue}, 80%, 75%)`;
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.6, p.size * 0.4);
        ctx.lineTo(-p.size * 0.6, p.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    }

    function animate() {
      setTime((t) => t + 1);
      drawSky();
      drawSun(time);
      drawSoil();
      drawGrass();
      drawTulip(time);
      drawParticles(time);
      animRef.current = requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();
    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}