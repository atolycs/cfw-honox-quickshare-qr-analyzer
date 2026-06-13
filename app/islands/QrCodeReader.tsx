import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";
import { type FC, useEffect, useRef, useState } from "hono/jsx";

const QrCodeReader: FC = () => {
  const controlsRef = useRef<IScannerControls | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [qrCodes, setQrCodes] = useState<string[]>([]);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const [permissionState, setPermissionState] = useState<
    PermissionState | "unknown"
  >("unknown");

  useEffect(() => {
    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((result) => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      })
      .catch(() => {
        setPermissionState("unknown");
      });
    if (!videoRef.current) {
      return;
    }

    const codeReader = new BrowserQRCodeReader();
    codeReader
      .decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error, controls) => {
          controlsRef.current = controls;
          if (error || !result) {
            if (error) {
              if (error.name === "NotAllowedError") {
                setCameraError(
                  "Camera Access Denied. Please check browser configuration",
                );
                setIsScanning(false);
                controls?.stop();
              }
            }
            return;
          }

          if (result) {
            controls?.stop();
            controlsRef.current = null;
            setIsScanning(false);
            setQrCodes((codes) => [result.getText(), ...codes]);
          }
        },
      )
      .catch((err: Error) => {
        if (err.name === "NotAllowedError") {
          setCameraError(
            "Camera Access Denied. Please check Browser Permission.",
          );
        }
      });

    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div class="flex flex-col items-center gap-6" style={{ width: "100%" }}>
      <div
        class="relative rounded-2xl overflow-hidden bg-[#111826] border border-[#1e2a3a] shadow-[0_0_40px_rgba(79,142,247,0.08)]"
        style={{ minHeight: "320px", height: "320px", width: "100%" }}
      >
        <div class="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#4f8ef7] rounded-tl-md z-10 pointer-events-none" />
        <div class="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#4f8ef7] rounded-tr-md z-10 pointer-events-none" />
        <div class="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#4f8ef7] rounded-bl-md z-10 pointer-events-none" />
        <div class="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#4f8ef7] rounded-br-md z-10 pointer-events-none" />

        {isScanning && !cameraError && (
          <div
            class="absolute inset-x-6 z-10 pointer-events-none"
            style={{
              animation: "scanline 2.4s ease-in-out infinite",
              top: "24px",
            }}
          >
            <div class="h-px bg-grandient-to-r from-transparent via-[#4f8ef7] to-transparent opacity-80" />
          </div>
        )}

        {isScanning && !cameraError && (
          <video
            ref={videoRef}
            muted={true}
            class="w-full h-full object-cover"
          />
        )}

        {cameraError && (
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div class="w-14 h-14 rounded-full bg-[#1e2030] flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Warning</title>
                <path
                  d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#ef4444"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <p class="text-[#ef4444] text-sm leading-relaxed">{cameraError}</p>
          </div>
        )}
        {!isScanning && !cameraError && qrCodes.length === 0 && (
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-14 h-14 rounded-full bg-[#1e2030] flex items-center justify-center">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Idle</title>
                <circle
                  cx="11"
                  cy="11"
                  r="8"
                  stroke="#3d4658"
                  stroke-width="1.8"
                />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="#3d4658"
                  stroke-width="1.8"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      {isScanning && !cameraError && (
        <div class="flex items-center gap-2">
          <span
            class={`inline-block w-2 h-2 rounded-full ${permissionState === "prompt" ? "bg-[#f59e0b]" : "bg-[#4f8ef7]"}`}
            style={{ animation: "pulse 1.5s ease-in-out infinite" }}
          />
          <span class="text-[#8892a4] text-xs font-mono tracking-wide">
            {permissionState === "prompt" || permissionState === "unknown"
              ? "Waiting for camera permission..."
              : "Scanning..."}
          </span>
        </div>
      )}
      {qrCodes.length > 0 && (
        <div class="w-full flex flex-col gap-3">
          {qrCodes.map((code: string, i) => {
            const isQuickShare = code?.match(/^https:\/\/quickshare\.google.*/);

            return isQuickShare ? (
              <div
                key={i}
                class="bg-[#0d1a2d] border-[#1a3358] rounded-xl border p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full shrink-0 bg-[#22c5ee]" />
                  <span className="text-xs font-mono tracking-wide uppercase text-[#22c55e]">
                    QuickShare URL detected
                  </span>
                </div>
                <p class="text-[#c8d3e6] text-sm font-mono break-all leading-relaxed">
                  {code}
                </p>
                <a
                  href={code}
                  class="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#4f8ef7] hover:bg-[#6ba3f9]"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Open QuickShare
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Link</title>
                    <path
                      d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </a>
              </div>
            ) : (
              <div
                key={i}
                class="bg-[#1a0e0e] border-[#3d1a1a] rounded-xl border p-4 flex flex-col gap-3"
              >
                <div class="flex items-center gap-2">
                  <span class="bg-[#ef4444] w-2 h-2 rounded-full shrink-0" />
                  <span class="text-[#ef4444] text-xs font-mono tracking-wide uppercase">
                    No a Quickshare QR code
                  </span>
                </div>
                <p class="text-xs leading-relaxed text-[#8892a4]">
                  This QR code doesn't point to{" "}
                  <span class="text-[#c8d3e6]">quickshare.google</span>. Please
                  try scanning again.
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  class="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#2a1f1f] hover:bg-[#3a2a2a] active:bg-[#1e1616] text-[#f87171] text-sm font-semibold transition-colors border border-[#5a2a2a] cursor-pointer"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>Reload</title>
                    <path
                      d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M3 3v5h5"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  Try again
                </button>
              </div>
            );
          })}
        </div>
      )}
      <style>
        {`
      @keyframes scanline {
        0% { top: 24px; }
        50% { top: calc(100% - 24px); }
        100% { top: 24px; }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `}
      </style>
    </div>
  );
};

export default QrCodeReader;
