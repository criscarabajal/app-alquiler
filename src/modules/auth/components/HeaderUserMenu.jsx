// src/components/HeaderUserMenu.jsx
import { useState, useEffect, useRef } from "react";
import { LogOut, User, Upload, ChevronDown } from "lucide-react";

export default function HeaderUserMenu({ onLogout, onChangeUser, usuario }) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);
  const menuRef = useRef(null);

  const avatarKey = `userAvatar_${usuario}`;

  useEffect(() => {
    const img = localStorage.getItem(avatarKey);
    if (img) setAvatarSrc(img);
  }, [usuario]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChangeAvatar = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem(avatarKey, reader.result);
        setAvatarSrc(reader.result);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-dark-800/80 backdrop-blur-md border border-white/10 rounded-full pl-4 pr-2 py-1.5 hover:bg-dark-700 transition-all group"
      >
        <span className="text-sm font-medium text-gray-200 group-hover:text-white">
          {usuario}
        </span>
        <div className="w-10 h-10 rounded-full bg-dark-700 border border-white/10 overflow-hidden flex items-center justify-center relative">
          {avatarSrc ? (
            <img src={avatarSrc} alt={usuario} className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold text-primary">
              {usuario?.[0]?.toUpperCase()}
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-white/10 rounded-2xl shadow-xl overflow-hidden animate-fade-in-up z-50">
          <div className="p-2 space-y-1">
            <button
              onClick={handleChangeAvatar}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors text-left"
            >
              <Upload size={18} />
              Cambiar imagen
            </button>
            <button
              onClick={() => {
                onChangeUser();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors text-left"
            >
              <User size={18} />
              Cambiar usuario
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors text-left"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
