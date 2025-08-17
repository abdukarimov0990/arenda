import { Link, NavLink, Outlet } from "react-router";
import { useState, useEffect } from "react";
import { FaUsers, FaPlusCircle } from "react-icons/fa";
import logo from "../img/logo.png";
import Login from "../pages/Login";

export default function MainLayout() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("authUser");
    if (user) {
      setIsAuth(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setIsAuth(false);
  };

  const navItems = [
    { to: "/", label: "Mijozlar", icon: <FaUsers className="text-lg" /> },
    { to: "/payments/new", label: "To'lov qo'shish", icon: <FaPlusCircle className="text-lg" /> }
  ];

  if (!isAuth) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-3 group"
            >
              <img 
                src={logo} 
                alt="Logo" 
                className="w-10 h-10 transition-transform group-hover:scale-105"
              />
              <h3 className="text-xl font-semibold text-gray-800">
                Ijarachilar ro'yxati
              </h3>
            </Link>
            
            <div className="flex items-center gap-4">
              <nav className="flex items-center space-x-2">
                {navItems.map(({ to, label, icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-emerald-700 text-white shadow-md"
                          : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-800"
                      }`
                    }
                  >
                    {icon}
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
