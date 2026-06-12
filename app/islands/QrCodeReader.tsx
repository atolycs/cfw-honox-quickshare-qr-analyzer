import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Result } from "@zxing/library";
import { type FC, useEffect, useRef, useState } from "hono/jsx";

const QrCodeReader: FC = () => {
  const controlsRef = useRef<IScannerControls | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [qrCodes, setQrCodes] = useState<string[]>([]);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
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
            class="inline-block w-2 h-2 rounded-full bg-[#4f8ef7]"
            style={{ animation: "pulse 1.5s ease-in-out infinite" }}
          />
          <span class="text-[#8892a4] text-xs font-mono tracking-wide">
            Scanning...
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
                  <span class="w-2 h-2 rounded-full flex-shrink-0 bg-[#22c5ee]" />
                  <span className="text-xs font-mono tracking-wide uppercase text-[#22c55e]">
                    QuickShare URL detected
                  </span>
                  <p class="text-[#c8d3e6] text-sm font-mono break-all leading-relaxed">
                    {code}
                  </p>
                  <a
                    href={code}
                    class="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#4f8ef7] hover:bg-[#6ba3f9]"
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
              </div>
            ) : (
              <div>aaa</div>
            );
          })}
        </div>
      )}
    </div>
  );

  // return (
  //   <div class="place-content-center">
  //     {cameraError && <div style={{ color: "red" }}>⚠️ {cameraError}</div>}
  //     {isScanning && !cameraError && (
  //       <video
  //         style={{ maxHeight: "100%", maxWidth: "100%", height: "100%" }}
  //         ref={videoRef}
  //         muted={true}
  //       />
  //     )}
  //     {/* <video */}
  //     {/*   style={{ maxWidth: "100%", maxHeight: "100%", height: "100%" }} */}
  //     {/*   ref={videoRef} */}
  //     {/*   muted={true} */}
  //     {/* /> */}
  //     {/* quickshare.google */}
  //
  //     {
  //       <ul>
  //         {qrCodes?.map((code: string | null, i) => {
  //           if (code?.match(/^https:\/\/quickshare.google.*/)) {
  //             return (
  //               <>
  //                 <li key={i}>{code}</li>
  //                 <a href={code}>Quick Share</a>
  //               </>
  //             );
  //           } else {
  //             return (
  //               <>
  //                 <li key={i} style={{ color: "red" }}>
  //                   ⚠️ {i + 1} Times: This QRcode is not QuickShare Generated.
  //                   Please retry Again.
  //                 </li>
  //                 <button
  //                   type="button"
  //                   class="px-4 py-2 bg-orange-400 text-white rounded cursor-pointer"
  //                   onClick={() => {
  //                     window.location.reload();
  //                   }}
  //                 >
  //                   Reload
  //                 </button>
  //               </>
  //             );
  //           }
  //         })}
  //       </ul>
  //     }
  //   </div>
  // );
};

export default QrCodeReader;

/* const QrCodeReader: FC<{ onReadQRCode: (text: Result) => void }> = ({ onReadQRCode }) => {
  const controlsRef = useRef<IScannerControls | null>()
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (!videoRef.current) {
      return
    }

    const codeReader = new BrowserQRCodeReader()
    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result, error, controls) => {
        if (error) {
          return
        }

        if (result) {
          onReadQRCode(result)
        }
        controlsRef.current = controls
      })

    return () => {
      if (!controlsRef.current) {
        return
      }
      controlsRef.current.stop()
      controlsRef.current = null
    }
  }, [onReadQRCode])

  return <video
    style={{ maxWidth: "100%", maxHeight: "100%", height: "100%" }}
    ref={videoRef}
  />
}

export default QrCodeReader;
 */
