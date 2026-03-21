export default function Product3DViewer({ modelUrl, className }) {
  return (
    <div
      className={`flex items-center justify-center h-full w-full ${className || ""}`}
    >
      <model-viewer
        src={modelUrl}
        alt="3D Model"
        auto-rotate
        camera-controls
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
