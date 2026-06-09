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
    <div>
      {cameraError && <div style={{ color: "red" }}>⚠️ {cameraError}</div>}
      {isScanning && !cameraError && (
        <video
          style={{ maxHeight: "100%", maxWidth: "100%", height: "100%" }}
          ref={videoRef}
          muted={true}
        />
      )}
      {/* <video */}
      {/*   style={{ maxWidth: "100%", maxHeight: "100%", height: "100%" }} */}
      {/*   ref={videoRef} */}
      {/*   muted={true} */}
      {/* /> */}
      {/* quickshare.google */}

      {
        <ul>
          {qrCodes?.map((code: string | null, i) => {
            if (code?.match(/^https:\/\/quickshare.google.*/)) {
              return (
                <>
                  <li key={i}>{code}</li>
                  <a href={code}>Quick Share</a>
                </>
              );
            } else {
              return (
                <>
                  <li key={i} style={{ color: "red" }}>
                    ⚠️ {i + 1} Times: This QRcode is not QuickShare Generated.
                    Please retry Again.
                  </li>
                  <button
                    type="button"
                    class="px-4 py-2 bg-orange-400 text-white rounded cursor-pointer"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    Reload
                  </button>
                </>
              );
            }
          })}
        </ul>
      }
    </div>
  );
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
