// The parts of WebGazer 3.5 this project uses. WebGazer ships no type definitions.
export interface Prediction {
  x: number;
  y: number;
}

export interface WebGazer {
  params: { faceMeshSolutionPath: string; [key: string]: unknown };
  begin(onFail?: () => void): Promise<WebGazer>;
  end(): WebGazer;
  pause(): WebGazer;
  resume(): Promise<WebGazer>;
  stopVideo(): WebGazer;
  isReady(): boolean;
  detectCompatibility(): boolean;
  saveDataAcrossSessions(value: boolean): WebGazer;
  applyKalmanFilter(value: boolean): WebGazer;
  showVideoPreview(value: boolean): WebGazer;
  showVideo(value: boolean): WebGazer;
  showFaceOverlay(value: boolean): WebGazer;
  showFaceFeedbackBox(value: boolean): WebGazer;
  showPredictionPoints(value: boolean): WebGazer;
  setRegression(name: string): WebGazer;
  setGazeListener(listener: (data: Prediction | null, elapsedMs: number) => void): WebGazer;
  clearGazeListener(): WebGazer;
  removeMouseEventListeners(): WebGazer;
  recordScreenPosition(x: number, y: number, eventType: 'click' | 'move'): WebGazer;
  setVideoViewerSize(width: number, height: number): void;
  getTracker(): { getPositions(): unknown[] | null };
}

declare global {
  interface Window {
    webgazer?: WebGazer;
  }
}
