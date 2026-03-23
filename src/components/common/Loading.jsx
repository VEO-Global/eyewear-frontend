export const Loading = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center  bg-slate-100">
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #ccc",
          borderTop: "4px solid #0d9488",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      {children}
    </div>
  );
};
