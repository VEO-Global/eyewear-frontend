export const products = [
  {
    id: 1,
    name: "Kính Mát Retro 2026",
    price: 500000,
    // Ảnh 2D (Bạn có thể lấy link ảnh mạng bất kỳ để test)
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
    description: "Phong cách cổ điển, chống tia UV 100%.",
    // Link 3D (Quan trọng: File này phải nằm trong frontend/public/models/)
    model3dUrl: "https://res.cloudinary.com/dd5i9knw1/image/upload/v1770184608/glasses_dlxgis.glb", 
    category: "Sunglasses"
  },
  {
    id: 2,
    name: "Gọng Kính Titan Siêu Nhẹ",
    price: 1200000,
    image: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=500&q=80",
    description: "Chất liệu Titanium bền bỉ, nhẹ như không.",
    model3d: null, // Cái này không có 3D thì để null
    category: "Eyeglasses"
  },
  {
    id: 3,
    name: "Kính Râm Aviator",
    price: 850000,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
    description: "Kiểu dáng phi công sành điệu.",
    model3d: null,
    category: "Sunglasses"
  },
  {
    id: 4,
    name: "Kính Chống Ánh Sáng Xanh",
    price: 650000,
    image: "https://images.unsplash.com/photo-1483412901819-729f5729d353?w=500&q=80",
    description: "Bảo vệ mắt khi dùng máy tính.",
    model3d: null,
    category: "Protection"
  }
];