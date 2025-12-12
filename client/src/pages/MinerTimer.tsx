import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Settings } from "lucide-react";
import confetti from "canvas-confetti";
import minerSprite from "@assets/generated_images/pixel_art_sprite_sheet_of_a_miner_character.png";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const MINER_SIZE = 32; // Size in px
const SPRITE_SIZE = 64; // Assumed size of sprite frame in sheet (adjust if needed)
const FPS = 60;

export default function MinerTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [duration, setDuration] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  
  // Miner State
  const [minerPos, setMinerPos] = useState({ x: 0, y: 0, facingRight: true });
  const [frame, setFrame] = useState(0);

  // Initialize Canvas
  const drawWall = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Resize canvas if needed
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    // Calculate progress
    const progress = 1 - (timeLeft / duration); // 0 to 1 (0 = start, 1 = done)
    
    // Path Logic
    const rows = Math.ceil(height / MINER_SIZE);
    const totalDistance = rows * width;
    const currentDistance = progress * totalDistance;
    
    const currentRowIndex = Math.floor(currentDistance / width);
    const rowProgress = currentDistance % width;
    
    // Y is calculated from bottom
    // Row 0 is bottom
    const y = height - (currentRowIndex + 1) * MINER_SIZE;
    
    // X depends on row direction
    const isEvenRow = currentRowIndex % 2 === 0; // 0, 2, 4... (L->R)
    let x = isEvenRow ? rowProgress : width - rowProgress;
    
    // Update Miner Position State for the sprite
    setMinerPos({ 
      x: Math.max(0, Math.min(width - MINER_SIZE, x - (MINER_SIZE / 2))), 
      y: Math.max(0, Math.min(height - MINER_SIZE, y)),
      facingRight: isEvenRow 
    });

    // Draw Rock
    ctx.clearRect(0, 0, width, height);
    
    // Draw Background (Cave/Empty) handled by CSS background color
    
    // Draw Unmined Blocks
    ctx.fillStyle = "#333340"; // Rock Color
    
    // 1. Draw all full rows ABOVE current row
    // Since we start from bottom (row 0), rows > currentRowIndex are unmined
    // Correct logic: Rows are indexed 0 (bottom) to N (top).
    // Unmined rows are those with index > currentRowIndex.
    // Their Y positions are from 0 to (height - (currentRowIndex + 1) * MINER_SIZE)
    
    const unminedHeight = height - (currentRowIndex + 1) * MINER_SIZE;
    if (unminedHeight > 0) {
      ctx.fillRect(0, 0, width, unminedHeight);
    }
    
    // 2. Draw partial current row
    const rowY = height - (currentRowIndex + 1) * MINER_SIZE;
    if (isEvenRow) {
      // Mining L->R, so Rock is from X to Width
      ctx.fillRect(x, rowY, width - x, MINER_SIZE);
    } else {
      // Mining R->L, so Rock is from 0 to X
      ctx.fillRect(0, rowY, x, MINER_SIZE);
    }
    
    // Add pixel texture/grid lines to the rock
    ctx.strokeStyle = "#222230";
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Vertical grid
    for (let gx = 0; gx <= width; gx += MINER_SIZE) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
    }
    // Horizontal grid
    for (let gy = 0; gy <= height; gy += MINER_SIZE) {
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
    }
    ctx.stroke();

  }, [timeLeft, duration]);

  // Animation Loop
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      if (isActive && timeLeft > 0) {
        // Update Time
        const deltaTime = (time - lastTime) / 1000;
        setTimeLeft((prev) => Math.max(0, prev - deltaTime));
        
        // Update Sprite Frame (every 100ms)
        if (Math.floor(time / 150) % 4 !== frame) {
          setFrame(Math.floor(time / 150) % 4);
        }
      } else if (timeLeft <= 0 && isActive) {
        setIsActive(false);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      drawWall();
      lastTime = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, timeLeft, drawWall, frame]);

  // Window Resize Handler
  useEffect(() => {
    window.addEventListener('resize', drawWall);
    return () => window.removeEventListener('resize', drawWall);
  }, [drawWall]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration);
    setMinerPos({ x: 0, y: 0, facingRight: true }); // Reset pos will be fixed by drawWall next frame
    drawWall(); // Force redraw
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden flex flex-col">
      {/* Header / HUD */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start pointer-events-none">
        <div className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border-2 border-border pixel-box-shadow pointer-events-auto">
          <h1 className="text-2xl font-pixel text-primary mb-2 pixel-text-shadow">MINER TIMER</h1>
          <div className="text-5xl font-mono text-foreground tracking-widest">
            {formatTime(timeLeft)}
          </div>
          <div className="mt-4 flex gap-2">
            <Button 
              variant="default" 
              size="icon" 
              className="h-12 w-12 rounded-none border-2 border-primary/50 bg-primary/20 hover:bg-primary/40 text-primary cursor-pointer"
              onClick={toggleTimer}
            >
              {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="h-12 w-12 rounded-none border-2 border-border bg-card hover:bg-accent/20 cursor-pointer"
              onClick={resetTimer}
            >
              <RotateCcw className="h-6 w-6" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-none border-2 border-border bg-card hover:bg-accent/20 cursor-pointer">
                  <Settings className="h-6 w-6" />
                </Button>
              </DialogTrigger>
              <DialogContent className="font-pixel border-4 border-border bg-card">
                <DialogHeader>
                  <DialogTitle>Timer Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label>Duration (Minutes)</Label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={[duration / 60]} 
                        min={1} 
                        max={60} 
                        step={1}
                        onValueChange={(vals) => {
                          setDuration(vals[0] * 60);
                          setTimeLeft(vals[0] * 60);
                          setIsActive(false);
                        }}
                      />
                      <span className="font-mono text-xl w-12">{duration / 60}</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Game Viewport */}
      <div ref={containerRef} className="relative flex-1 w-full h-full">
        {/* The Wall Canvas */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 z-10 block"
        />
        
        {/* The Miner Sprite */}
        <div 
          className="absolute z-20 pointer-events-none transition-transform duration-100"
          style={{
            width: `${MINER_SIZE}px`,
            height: `${MINER_SIZE}px`,
            transform: `translate(${minerPos.x}px, ${minerPos.y}px) scaleX(${minerPos.facingRight ? 1 : -1})`,
            imageRendering: 'pixelated'
          }}
        >
          {/* Sprite Image Container */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${minerSprite})`,
              backgroundSize: '400% 300%', // Assuming 4 cols, 3 rows
              // Logic: 
              // Row 0: Idle (Top)
              // Row 1: Walk (Middle)
              // Row 2: Mine (Bottom)
              backgroundPosition: isActive 
                ? `-${frame * 100}% 50%` // Row 1 (Walk)
                : `-${frame * 100}% 0%`, // Idle
            }}
          />
          
          {/* Pickaxe Swing Animation (Visual fallback) */}
          {isActive && (
             <div className="absolute -right-1 -top-1 w-2 h-2 bg-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}
