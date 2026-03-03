import { Button } from "./Button";

export default function ViewDetail({ onClick }) {
  return (
    <div
      className="
        absolute inset-0
        bg-black/40
        flex items-center justify-center
        opacity-0
        transition-all duration-300
        group-hover:opacity-100
      "
    >
      <Button
        onClick={onClick}
        className="
          px-4 py-2
          bg-white
          rounded-xl
          font-medium
          transition-all
          hover:scale-105
          cursor-pointer
        "
      >
        👁️ Xem chi tiết
      </Button>
    </div>
  );
}
