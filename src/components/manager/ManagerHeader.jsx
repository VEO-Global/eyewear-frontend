import { useLocation } from "react-router-dom";

function ManagerHeader({ navItems }) {
  const location = useLocation();
  console.log(navItems);

  const current = navItems.find(
    (item) => location.pathname === `/manager/${item.id}`
  );
  const title = current?.label || "Manager";

  return (
    <header className="h-16 bg-white shadow flex items-center px-6">
      <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
    </header>
  );
}

export default ManagerHeader;
