import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faUser,
  faHouse,
  faClipboardList,
  faUsers,
  faBoxOpen,
  faRightFromBracket,
  faBlog,
} from "@fortawesome/free-solid-svg-icons";
import { logout } from "../features/auth/authSlice";

const MainLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between px-6 py-3 border-b bg-white shrink-0">
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCartShopping} className="text-xl text-blue-600" />
          <h1 className="font-bold text-lg">Super Market</h1>
        </div>
        <div className="text-xl">
          <FontAwesomeIcon icon={faUser} className="text-gray-600" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="flex flex-col p-4 w-44 bg-gray-50 border-r space-y-2 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded">
            <FontAwesomeIcon icon={faHouse} className="w-5" /> Home
          </Link>
          <Link to="/order" className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded">
            <FontAwesomeIcon icon={faClipboardList} className="w-5" /> Order
          </Link>
          <Link to="/customer" className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded">
            <FontAwesomeIcon icon={faUsers} className="w-5" /> Customer
          </Link>
          <Link to="/item" className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded">
            <FontAwesomeIcon icon={faBoxOpen} className="w-5" /> Item
          </Link>
          <Link to="/blog" className="flex items-center gap-3 p-2 hover:bg-gray-200 rounded">
            <FontAwesomeIcon icon={faBlog} className="w-5" /> Blog
          </Link>

          <div className="flex-1" />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 text-red-500 hover:bg-red-50 rounded text-left"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-5" /> Logout
          </button>
        </nav>

        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
