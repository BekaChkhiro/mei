"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

type Stage = "camera" | "scanning" | "valentine" | "celebration" | "gift";

export default function Home() {
  const [stage, setStage] = useState<Stage>("camera");
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });

  // Start camera
  useEffect(() => {
    if (stage === "camera") {
      // Check if mediaDevices is available (requires HTTPS)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera requires HTTPS");
        setCameraReady(true); // Allow to proceed anyway
        return;
      }

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraReady(true);
          }
        })
        .catch((err) => {
          console.error("Camera error:", err);
          setCameraReady(true); // Allow to proceed anyway
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stage]);

  // Load model-viewer script
  useEffect(() => {
    if (stage === "gift") {
      const existingScript = document.querySelector('script[src*="model-viewer"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.type = "module";
        script.src = "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
        document.head.appendChild(script);
      }
    }
  }, [stage]);

  // Petals effect for gift stage
  useEffect(() => {
    if (stage === "gift") {
      const colors = ["#ff69b4", "#ff1493", "#ffb6c1", "#ffc0cb", "#ff85a2"];

      const interval = setInterval(() => {
        confetti({
          particleCount: 8,
          angle: 90,
          spread: 120,
          origin: { x: Math.random(), y: -0.1 },
          colors: colors,
          gravity: 0.5,
          drift: Math.random() - 0.5,
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [stage]);

  // Handle confirm button
  const handleConfirm = () => {
    setStage("scanning");

    // Stop camera
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    // After 3 seconds, go to valentine stage
    setTimeout(() => {
      setStage("valentine");
    }, 3000);
  };

  // Handle Yes button
  const handleYes = () => {
    setStage("celebration");

    // Play music
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }

    // Fire confetti
    const duration = 30 * 1000;
    const end = Date.now() + duration;

    const colors = ["#ff69b4", "#ff1493", "#ffb6c1", "#ffc0cb", "#ff85a2"];

    (function frame() {
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 80,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 80,
        origin: { x: 1 },
        colors: colors,
      });
      confetti({
        particleCount: 10,
        angle: 90,
        spread: 100,
        origin: { x: 0.5, y: 0 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  // Handle gift button
  const handleGift = () => {
    setStage("gift");
  };

  // Handle No button - run away!
  const handleNoHover = useCallback(() => {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    setNoButtonPosition({ x, y });
  }, []);

  // Camera Stage
  if (stage === "camera") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center mb-8 fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-pink-800 mb-4">
            გასაგრძელებლად
          </h1>
          <p className="text-xl md:text-2xl text-pink-700">
            მსოფლიოში ყველაზე ლამაზი გოგოს სახე გვჭირდება
          </p>
        </div>

        <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-pink-400 shadow-2xl mb-8">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        </div>

        {cameraReady && (
          <button
            onClick={handleConfirm}
            className="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold rounded-full shadow-lg transform transition hover:scale-105 fade-in"
          >
            დადასტურება
          </button>
        )}
      </main>
    );
  }

  // Scanning Stage
  if (stage === "scanning") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border-8 border-pink-400 shadow-2xl mb-8 bg-pink-200">
          <div className="scanning-line" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-6xl heart-beat">💕</div>
          </div>
        </div>
        <p className="text-2xl text-pink-700 font-bold">სკანირება...</p>
      </main>
    );
  }

  // Valentine Stage
  if (stage === "valentine") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center fade-in">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-xl text-pink-600 mb-8">დადასტურდა!</p>

          <h1 className="text-3xl md:text-5xl font-bold text-pink-800 mb-8 float">
            მეი, იქნები ჩემი ვალენტინი?
          </h1>

          <div className="text-6xl mb-12 heart-beat">💕</div>

          <div className="flex gap-8 items-center justify-center">
            <button
              onClick={handleYes}
              className="px-12 py-4 bg-pink-500 hover:bg-pink-600 text-white text-2xl font-bold rounded-full shadow-lg transform transition hover:scale-110"
            >
              კი
            </button>

            <button
              onMouseEnter={handleNoHover}
              onTouchStart={handleNoHover}
              style={{
                transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
                transition: "transform 0.2s ease-out",
              }}
              className="px-12 py-4 bg-gray-400 text-white text-2xl font-bold rounded-full shadow-lg"
            >
              არა
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Celebration Stage
  if (stage === "celebration") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <audio
          ref={audioRef}
          src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3"
          loop
        />

        <div className="text-center fade-in">
          <div className="text-8xl mb-8 heart-beat">💕</div>

          <h1 className="text-4xl md:text-6xl font-bold text-pink-800 mb-8 float">
            მიყვარხარ 💕
          </h1>

          <button
            onClick={handleGift}
            className="mt-8 px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white text-xl font-bold rounded-full shadow-lg transform transition hover:scale-105 animate-pulse"
          >
            🎁 საჩუქრის ნახვა
          </button>
        </div>
      </main>
    );
  }

  // Gift Stage - AR
  if (stage === "gift") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
          <div className="text-center mb-4 fade-in z-10">
            <h1 className="text-2xl md:text-4xl font-bold text-pink-800 mb-2">
              შენი საჩუქარი 🎁
            </h1>
            <p className="text-lg text-pink-600">
              მეისთვის სიყვარულით 💕
            </p>
          </div>

          <div className="w-full max-w-lg h-[60vh] rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-300">
            {/* @ts-ignore */}
            <model-viewer
              src="/bike.glb"
              ios-src="/bike.usdz"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              touch-action="pan-y"
              auto-rotate
              shadow-intensity="1"
              ar-scale="auto"
              loading="eager"
              style={{ width: "100%", height: "100%", backgroundColor: "#fce4ec" }}
            >
              <div className="absolute inset-0 flex items-center justify-center" slot="poster">
                <div className="text-center">
                  <div className="text-4xl mb-4 heart-beat">🎁</div>
                  <p className="text-pink-600">იტვირთება...</p>
                </div>
              </div>
              <button
                type="button"
                slot="ar-button"
                style={{
                  position: "absolute",
                  bottom: "16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "12px 24px",
                  backgroundColor: "#ec4899",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  borderRadius: "9999px",
                  border: "none",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                  cursor: "pointer"
                }}
              >
                🏍️ ოთახში ნახვა (AR)
              </button>
            </model-viewer>
          </div>

          <p className="mt-4 text-pink-600 text-center text-sm">
            💡 3D მოდელი შეგიძლია თითით მოატრიალო
          </p>
        </main>
    );
  }

  return null;
}
