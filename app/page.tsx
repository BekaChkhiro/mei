"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

type Stage = "camera" | "scanning" | "valentine" | "celebration" | "gift";

// Floating Hearts Component
const FloatingHearts = () => {
  const hearts = ["💕", "💗", "💖", "💝", "🩷"];
  return (
    <div className="hearts-bg">
      {[...Array(15)].map((_, i) => (
        <span
          key={i}
          className="heart"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            fontSize: `${Math.random() * 20 + 15}px`,
          }}
        >
          {hearts[Math.floor(Math.random() * hearts.length)]}
        </span>
      ))}
    </div>
  );
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("camera");
  const [cameraReady, setCameraReady] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 });

  // Start camera
  useEffect(() => {
    if (stage === "camera") {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("Camera requires HTTPS");
        setCameraReady(true);
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
          setCameraReady(true);
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stage]);

  // Scanning progress
  useEffect(() => {
    if (stage === "scanning") {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 60);
      return () => clearInterval(interval);
    }
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
      const colors = ["#ff69b4", "#ff1493", "#ffb6c1", "#ffc0cb", "#ff85a2", "#f9a8d4"];

      const interval = setInterval(() => {
        confetti({
          particleCount: 5,
          angle: 90,
          spread: 120,
          origin: { x: Math.random(), y: -0.1 },
          colors: colors,
          gravity: 0.4,
          drift: Math.random() - 0.5,
          scalar: 1.2,
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [stage]);

  // Handle confirm button
  const handleConfirm = () => {
    setStage("scanning");
    setScanProgress(0);

    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    setTimeout(() => {
      setStage("valentine");
    }, 3500);
  };

  // Handle Yes button
  const handleYes = () => {
    setStage("celebration");

    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }

    const duration = 30 * 1000;
    const end = Date.now() + duration;
    const colors = ["#ff69b4", "#ff1493", "#ffb6c1", "#ffc0cb", "#ff85a2", "#f9a8d4", "#ec4899"];

    (function frame() {
      confetti({
        particleCount: 12,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.6 },
        colors: colors,
      });
      confetti({
        particleCount: 12,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.6 },
        colors: colors,
      });
      confetti({
        particleCount: 8,
        angle: 90,
        spread: 100,
        origin: { x: 0.5, y: 0 },
        colors: colors,
        gravity: 1.5,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handleGift = () => {
    setStage("gift");
  };

  const handleNoHover = useCallback(() => {
    const x = Math.random() * 250 - 125;
    const y = Math.random() * 250 - 125;
    setNoButtonPosition({ x, y });
  }, []);

  // Camera Stage
  if (stage === "camera") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <FloatingHearts />

        <div className="text-center mb-10 fade-in relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold shimmer mb-4">
            გასაგრძელებლად
          </h1>
          <p className="text-xl md:text-2xl text-pink-700 fade-in-delay">
            მსოფლიოში ყველაზე ლამაზი გოგოს
          </p>
          <p className="text-xl md:text-2xl text-pink-700 fade-in-delay-2">
            სახე გვჭირდება 💕
          </p>
        </div>

        <div className="camera-frame mb-10 fade-in relative z-10">
          <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden bg-pink-100">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        </div>

        {cameraReady && (
          <button
            onClick={handleConfirm}
            className="btn-primary fade-in-delay-2 relative z-10"
          >
            ✨ დადასტურება
          </button>
        )}
      </main>
    );
  }

  // Scanning Stage
  if (stage === "scanning") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <FloatingHearts />

        <div className="camera-frame mb-8 relative z-10">
          <div className="w-72 h-72 md:w-80 md:h-80 rounded-full overflow-hidden bg-gradient-to-br from-pink-200 to-pink-300 scanning-container relative">
            <div className="scanning-line" />
            <div className="scanning-pulse" />
            <div className="scanning-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-7xl heart-beat">💕</div>
            </div>
          </div>
        </div>

        <div className="text-center relative z-10">
          <p className="text-2xl text-pink-700 font-bold mb-4">სკანირება...</p>

          <div className="w-64 mx-auto mb-3">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${scanProgress}%`, transition: 'width 0.1s ease' }}
              />
            </div>
          </div>

          <p className="text-pink-500 text-lg">{scanProgress}%</p>
        </div>
      </main>
    );
  }

  // Valentine Stage
  if (stage === "valentine") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <FloatingHearts />

        <div className="text-center relative z-10">
          <div className="checkmark mb-6 mx-auto fade-in">
            <svg viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <p className="text-xl text-emerald-600 font-semibold mb-8 fade-in-delay">
            სილამაზე დადასტურდა! ✨
          </p>

          <h1 className="text-4xl md:text-6xl font-bold shimmer mb-4 float fade-in-delay">
            მეი,
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-pink-700 mb-10 float fade-in-delay-2">
            იქნები ჩემი ვალენტინი?
          </h2>

          <div className="text-7xl mb-12 heart-beat">💕</div>

          <div className="flex gap-6 items-center justify-center flex-wrap">
            <button
              onClick={handleYes}
              className="btn-primary text-2xl px-16 py-5"
            >
              კი 💕
            </button>

            <button
              onMouseEnter={handleNoHover}
              onTouchStart={handleNoHover}
              onClick={handleNoHover}
              style={{
                transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
                transition: "transform 0.3s ease-out",
              }}
              className="px-12 py-4 bg-gray-300 hover:bg-gray-400 text-gray-600 text-xl font-bold rounded-full shadow-lg"
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
      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative z-10">
        <FloatingHearts />

        <audio
          ref={audioRef}
          src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3"
          loop
        />

        <div className="text-center relative z-10">
          <div className="text-8xl md:text-9xl mb-8 heart-beat fade-in">
            💕
          </div>

          <h1 className="text-5xl md:text-7xl font-bold shimmer mb-6 float fade-in-delay">
            მიყვარხარ
          </h1>

          <p className="text-4xl mb-12 fade-in-delay-2">
            💕
          </p>

          <button
            onClick={handleGift}
            className="btn-primary text-xl animate-pulse fade-in-delay-2"
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
      <main className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <FloatingHearts />

        <div className="text-center mb-6 relative z-10 fade-in">
          <h1 className="text-3xl md:text-4xl font-bold shimmer mb-2">
            შენი საჩუქარი
          </h1>
          <p className="text-xl text-pink-600">
            მეისთვის სიყვარულით 💕
          </p>
        </div>

        <div className="gift-card w-full max-w-md fade-in-delay relative z-10">
          <div className="h-[55vh] relative">
            {/* @ts-ignore */}
            <model-viewer
              src="/bike.glb"
              ios-src="https://pub-76cefa6348404990a1ef5271ccf16230.r2.dev/bike.usdz"
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              touch-action="pan-y"
              auto-rotate
              shadow-intensity="1"
              ar-scale="auto"
              loading="eager"
              style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
            >
              <div className="absolute inset-0 flex items-center justify-center" slot="poster">
                <div className="text-center">
                  <div className="text-5xl mb-4 heart-beat">🎁</div>
                  <p className="text-pink-600 text-lg">იტვირთება...</p>
                </div>
              </div>
              <button
                type="button"
                slot="ar-button"
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "bold",
                  borderRadius: "9999px",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(236, 72, 153, 0.4)",
                  cursor: "pointer"
                }}
              >
                🏍️ ოთახში ნახვა
              </button>
            </model-viewer>
          </div>
        </div>

        <p className="mt-6 text-pink-600 text-center text-sm relative z-10 fade-in-delay-2">
          💡 თითით მოატრიალე • მიაახლოვე • AR-ით ოთახში ნახე
        </p>
      </main>
    );
  }

  return null;
}
