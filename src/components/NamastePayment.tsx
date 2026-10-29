import { useEffect, useRef, useState } from "react";
import type { FaceLandmarker, HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";

type Props = {
  busy: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onCancel: () => void;
};

function distance(a: NormalizedLandmark, b: NormalizedLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function isNamaste(hands: NormalizedLandmark[][]) {
  if (hands.length < 2) return false;
  const [left, right] = hands;
  const upright = (hand: NormalizedLandmark[]) =>
    [8, 12, 16, 20].every((tip) => hand[tip].y < hand[9].y + 0.035);
  const palmsTogether = distance(left[0], right[0]) < 0.36
    && distance(left[9], right[9]) < 0.2
    && distance(left[5], right[5]) < 0.22
    && distance(left[12], right[12]) < 0.24;
  return upright(left) && upright(right) && palmsTogether;
}

function drawFaceBulge(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
) {
  const xs = landmarks.map((point) => point.x * width);
  const ys = landmarks.map((point) => point.y * height);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  const radiusX = Math.max(24, (Math.max(...xs) - Math.min(...xs)) * 0.62);
  const radiusY = Math.max(30, (Math.max(...ys) - Math.min(...ys)) * 0.68);
  const magnification = 1.55;
  context.save();
  context.beginPath();
  context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.clip();
  context.drawImage(
    video,
    centerX - radiusX / magnification,
    centerY - radiusY / magnification,
    (radiusX * 2) / magnification,
    (radiusY * 2) / magnification,
    centerX - radiusX,
    centerY - radiusY,
    radiusX * 2,
    radiusY * 2,
  );
  context.restore();
  context.save();
  context.beginPath();
  context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
  context.strokeStyle = "rgba(245, 243, 238, .9)";
  context.lineWidth = Math.max(2, width / 320);
  context.stroke();
  context.restore();
}

export function NamastePayment({ busy, onComplete, onSkip, onCancel }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<HandLandmarker | null>(null);
  const faceDetectorRef = useRef<FaceLandmarker | null>(null);
  const frameRef = useRef<number | null>(null);
  const holdStartedAt = useRef<number | null>(null);
  const lastFaceDetectionAt = useRef(0);
  const faceLandmarks = useRef<NormalizedLandmark[] | null>(null);
  const completedRef = useRef(false);
  const [starting, setStarting] = useState(false);
  const [running, setRunning] = useState(false);
  const [faceEffectAvailable, setFaceEffectAvailable] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Camera stays off until you press the button.");
  const [holdProgress, setHoldProgress] = useState(0);

  const stopCamera = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    detectorRef.current?.close();
    detectorRef.current = null;
    faceDetectorRef.current?.close();
    faceDetectorRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRunning(false);
  };

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    detectorRef.current?.close();
    faceDetectorRef.current?.close();
  }, []);

  const startCamera = async () => {
    setError("");
    setStarting(true);
    setStatus("Asking for camera permission…");
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("This browser does not provide camera access.");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("The camera preview could not be opened.");
      video.srcObject = stream;
      await video.play();
      const previewCanvas = canvasRef.current;
      const previewContext = previewCanvas?.getContext("2d");
      if (previewCanvas && previewContext && video.videoWidth) {
        const previewWidth = Math.min(640, video.videoWidth);
        const previewHeight = Math.round(previewWidth * video.videoHeight / video.videoWidth);
        previewCanvas.width = previewWidth;
        previewCanvas.height = previewHeight;
        previewContext.drawImage(video, 0, 0, previewWidth, previewHeight);
      }
      setRunning(true);
      setStatus("Loading the palm-reading apparatus…");
      lastFaceDetectionAt.current = 0;
      faceLandmarks.current = null;
      const { FilesetResolver, FaceLandmarker, HandLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
      );
      const handOptions = {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO" as const,
        numHands: 2,
      };
      try {
        detectorRef.current = await HandLandmarker.createFromOptions(vision, {
          ...handOptions,
          baseOptions: { ...handOptions.baseOptions, delegate: "GPU" },
        });
      } catch {
        detectorRef.current = await HandLandmarker.createFromOptions(vision, {
          ...handOptions,
          baseOptions: { ...handOptions.baseOptions, delegate: "CPU" },
        });
      }
      try {
        const faceOptions = {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "VIDEO" as const,
          numFaces: 1,
        };
        try {
          faceDetectorRef.current = await FaceLandmarker.createFromOptions(vision, {
            ...faceOptions,
            baseOptions: { ...faceOptions.baseOptions, delegate: "GPU" },
          });
        } catch {
          faceDetectorRef.current = await FaceLandmarker.createFromOptions(vision, {
            ...faceOptions,
            baseOptions: { ...faceOptions.baseOptions, delegate: "CPU" },
          });
        }
        setFaceEffectAvailable(true);
      } catch {
        setFaceEffectAvailable(false);
      }
      setStarting(false);
      setStatus("Bring both palms together and hold your Namaste.");
      const detectFrame = () => {
        const activeVideo = videoRef.current;
        const detector = detectorRef.current;
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (!activeVideo || !detector || !canvas || !context || completedRef.current) return;
        if (activeVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const frameWidth = Math.min(640, activeVideo.videoWidth);
          const frameHeight = Math.round(frameWidth * activeVideo.videoHeight / activeVideo.videoWidth);
          if (canvas.width !== frameWidth || canvas.height !== frameHeight) {
            canvas.width = frameWidth;
            canvas.height = frameHeight;
          }
          context.drawImage(activeVideo, 0, 0, frameWidth, frameHeight);
          const now = performance.now();
          if (faceDetectorRef.current && now - lastFaceDetectionAt.current > 100) {
            lastFaceDetectionAt.current = now;
            faceLandmarks.current = faceDetectorRef.current.detectForVideo(activeVideo, now).faceLandmarks[0] ?? null;
          }
          if (faceLandmarks.current) drawFaceBulge(context, activeVideo, faceLandmarks.current, frameWidth, frameHeight);
          const result = detector.detectForVideo(activeVideo, now);
          if (result.landmarks && isNamaste(result.landmarks)) {
            holdStartedAt.current ??= performance.now();
            const progress = Math.min(1, (performance.now() - holdStartedAt.current) / 1300);
            setHoldProgress(progress);
            setStatus("Namaste detected. Keep holding…");
            if (progress >= 1) {
              completedRef.current = true;
              setAccepted(true);
              setStatus("Namaste accepted. The store is confirming your simulated order.");
              stopCamera();
              onComplete();
              return;
            }
          } else {
            holdStartedAt.current = null;
            setHoldProgress(0);
            setStatus("Place both palms together in front of the camera.");
          }
        }
        frameRef.current = requestAnimationFrame(detectFrame);
      };
      frameRef.current = requestAnimationFrame(detectFrame);
    } catch (cause) {
      stopCamera();
      setStarting(false);
      const message = cause instanceof Error ? cause.message : "The Namaste camera could not start.";
      setError(message);
      setStatus("Camera ritual unavailable.");
    }
  };

  return (
    <section className="namaste-payment" aria-labelledby="namaste-title">
      <div className="namaste-heading">
        <span className="eyebrow">PAYMENT METHOD / PALMS AND GOOD INTENTIONS</span>
        <h2 id="namaste-title">Namaste to confirm.</h2>
        <p>This is a simulated gesture, not a real payment. Camera video is processed in this browser and is not recorded or uploaded.</p>
      </div>
      <div className="namaste-camera-frame">
        <video ref={videoRef} autoPlay muted playsInline aria-label="Camera source for the local face filter" className="namaste-camera-source" />
        <canvas ref={canvasRef} aria-label="Live camera preview with a local face-bulge effect" />
        {!running && !accepted && <div className="namaste-camera-placeholder"><span aria-hidden="true">🙏</span><small>YOUR CAMERA PREVIEW WILL APPEAR HERE</small></div>}
        <div className="namaste-camera-status" role="status">{status}</div>
      </div>
      <div className="namaste-progress" aria-label={`${Math.round(holdProgress * 100)} percent gesture hold progress`}>
        <span style={{ width: `${holdProgress * 100}%` }} />
      </div>
      <div className="namaste-actions">
        {!running && !accepted && (
          <button type="button" className="button button-dark" onClick={() => void startCamera()} disabled={starting || busy}>
            {starting ? "Preparing camera…" : error ? "Try camera again" : "Open camera and do Namaste"}
          </button>
        )}
        {running && <button type="button" className="button button-outline" onClick={() => { stopCamera(); setStatus("Camera stopped."); }} disabled={busy || starting}>Stop camera</button>}
        {accepted && <button type="button" className="button button-dark" onClick={onComplete} disabled={busy}>Retry store confirmation</button>}
        {!accepted && <button type="button" className="text-button" onClick={onCancel} disabled={busy || starting}>Go back</button>}
      </div>
      {running && <p className="namaste-filter-label" aria-live="polite">{faceEffectAvailable ? "Local face-bulge lens is on. Your camera feed stays on this device." : "Face-bulge lens unavailable. Gesture detection is still active."}</p>}
      {error && (
        <div className="namaste-fallback">
          <p>{error} You can still place this simulated order without camera access.</p>
          <button type="button" className="text-button" onClick={onSkip} disabled={busy}>Continue without camera</button>
        </div>
      )}
    </section>
  );
}
