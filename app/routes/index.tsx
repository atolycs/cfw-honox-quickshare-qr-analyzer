import { createRoute } from "honox/factory";
import QrCodeReader from "../islands/QrCodeReader";

export default createRoute((c) => {
  return c.render(
    <div class="min-h-screen bg-[#0a0e17] flex flex-col items-center justify-center px-4 py-10">
      <title>Google QuickShare QRCode Decoder</title>
      <div class="mb-8 text-center">
        <div class="inline-flex items-center gap-2 mb-3">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>QR Code</title>
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              rx="1"
              stroke="#4f8ef7"
              stroke-width="1.8"
            />
            <rect
              x="14"
              y="3"
              width="7"
              height="7"
              rx="1"
              stroke="#4f8ef7"
              stroke-width="1.8"
            />
            <rect
              x="3"
              y="14"
              width="7"
              height="7"
              rx="1"
              stroke="#4f8ef7"
              stroke-width="1.8"
            />
            <rect x="16" y="16" width="2" height="2" fill="#4f8ef7" />
            <rect x="19" y="16" width="2" height="2" fill="#4f8ef7" />
            <rect x="16" y="19" width="5" height="2" fill="#4f8ef7" />
          </svg>
          <span class="text-[#4f8ef7] text-xs font-mono tracking-[0.2em] uppercase">
            Google QuickShare
          </span>
        </div>
        <h1 class="text-white text-2xl font-bold tracking-tight leading-tight">
          QR Code Decoder
        </h1>
        <p class="text-[#8892a4] text-sm mt-2 font-mono">
          Point your camera at QuicksShare QR code
        </p>
      </div>

      {/* <h1 class="text-3xl font-bold">Google QuickShare QRCode Decoder</h1> */}
      <div class="w-full flex justify-center px-4">
        <div class="w-full" style={{ maxWidth: "384px" }}>
          <QrCodeReader />
        </div>
      </div>
      <p class="mt-10 text-[#3d4658] text-xs font-mono">
        Only <span class="text-[#4f8ef7]">quickshare.google</span> URLs are
        accepted
      </p>
    </div>,
  );
});
