import { Link, NavLink, Outlet } from "react-router";
import { FaUsers, FaPlusCircle, FaHome, FaRegUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import logo from '../img/logo.png';

export default function MainLayout() {
  const navItems = [
    { to: "/", label: "Mijozlar", icon: <FaUsers className="text-lg" /> },
    { to: "/payments/new", label: "To'lov qo'shish", icon: <FaPlusCircle className="text-lg" /> }
  ];

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
              <h3 className="text-xl font-semibold text-gray-800">Ijarachilar ro'yxati</h3>
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
      
      {/* FOOTER */}
    </div>
  );
}