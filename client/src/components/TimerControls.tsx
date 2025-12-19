import React from "react";
import { Play, Pause, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimerControlsProps {
  timeLeft: number;
  isActive: boolean;
  progress: number;
  steps: number;
  totalDuration: number;
  distanceText: string;
  isMinimized: boolean;
  routeData: any;
  startPos: any;
  endPos: any;
  routePath: any[];
  isLoadingRoute: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onToggleMinimize: () => void;
}

export default function TimerControls({
  timeLeft,
  isActive,
  progress,
  steps,
  totalDuration,
  distanceText,
  isMinimized,
  routeData,
  startPos,
  endPos,
  routePath,
  isLoadingRoute,
  onToggleTimer,
  onResetTimer,
  onToggleMinimize,
}: TimerControlsProps) {
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const days = Math.floor(hours / 24);

    if (hours >= 24) {
      return `${days}d:${(hours % 24).toString()}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="justify-center items-center flex flex-col gap-4 p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      {/* Header with minimize button */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-primary">
            MAP TIMER
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
          onClick={onToggleMinimize}
        >
          {isMinimized ? (
            <Maximize2 className="w-4 h-4" />
          ) : (
            <Minimize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Minimized View */}
      {isMinimized ? (
        <div
          className="flex flex-col items-center w-full cursor-pointer p-2"
          onClick={onToggleMinimize}
        >
          <div className="text-3xl font-mono font-bold tracking-widest text-foreground tabular-nums">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            Steps: {steps.toLocaleString()}
            {totalDuration > 0 && ` · ${(progress * 100).toFixed(0)}%`}
          </div>
        </div>
      ) : (
        <>
          {/* Timer Display */}
          <div className="flex flex-col items-center w-full">
            <div className="text-5xl font-mono font-bold tracking-widest text-foreground tabular-nums mb-4">
              {formatTime(timeLeft)}
            </div>

            {/* Route Details Card */}
            {routeData && (
              <div className="w-full grid grid-cols-3 gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Distance</div>
                  <div className="text-lg font-bold">{distanceText}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">ETA</div>
                  <div className="text-lg font-bold">
                    {formatTime(totalDuration)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Steps</div>
                  <div className="text-lg font-bold">
                    {steps.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {routeData && (
              <div className="w-full space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Journey Progress
                  </span>
                  <span className="font-medium">
                    {(progress * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200/50 dark:bg-gray-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 w-full justify-center">
            <Button
              size="lg"
              className={`w-full h-12 rounded-full shadow-lg transition-all bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white ${
                !startPos || !endPos || !routePath.length || isLoadingRoute
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105"
              }`}
              disabled={
                !startPos || !endPos || !routePath.length || isLoadingRoute
              }
              onClick={onToggleTimer}
            >
              {isActive ? (
                <>
                  <Pause className="w-6 h-6 mr-2" />
                  Pause Journey
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2 ml-1" />
                  Start Journey
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 rounded-full border-2 hover:scale-105 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-700 dark:hover:text-amber-300"
              onClick={onResetTimer}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
