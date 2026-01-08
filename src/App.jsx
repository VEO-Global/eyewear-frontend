function App() {
  const styleCenter = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Canh giữa theo chiều dọc
    alignItems: "center", // Canh giữa theo chiều ngang
    height: "100vh", // Chiều cao bằng toàn bộ màn hình
    width: "100vw", // Chiều rộng bằng toàn bộ màn hình
    position: "fixed", // Cố định vị trí để bỏ qua margin mặc định của body
    top: 0,
    left: 0,
    margin: 0,
    textAlign: "center",
  };

  return (
    <div style={styleCenter}>
      <h1 className="text-6xl font-serif mb-6">🚀 Hello World!</h1>
      <h2 className="text-3xl font-serif tracking-widest">
        Welcome to VEO Eyewear Project
      </h2>
      <p>System is running...</p>
    </div>
  );
}

export default App;
