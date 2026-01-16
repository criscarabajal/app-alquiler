// src/App.jsx
import React, { useState, useEffect } from "react";
import ProductosPOS from "./modules/products/components/ProductosPOS";
import Login from "./modules/auth/components/Login";
import HeaderUserMenu from "./modules/auth/components/HeaderUserMenu";
import { isAuthenticated, getCurrentUser, setCurrentUser, switchUser, logout } from "./modules/auth";

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState("");

  useEffect(() => {
    setAutenticado(isAuthenticated());
    const savedUser = getCurrentUser();
    if (savedUser) setUsuarioActual(savedUser);
  }, []);

  const handleLoginExitoso = (usuario) => {
    setCurrentUser(usuario);
    setUsuarioActual(usuario);
    setAutenticado(true);
  };

  const changeUser = () => {
    const siguiente = switchUser(usuarioActual);

    if (!siguiente) {
      // No hay más usuarios - hacer logout
      logout();
      setAutenticado(false);
      return;
    }

    setCurrentUser(siguiente);
    setUsuarioActual(siguiente);
  };

  if (!autenticado) {
    return <Login onLoginExitoso={handleLoginExitoso} />;
  }

  return (
    <>
      {/* Avatar y nombre arriba a la derecha */}
      <div className="fixed top-4 right-4 z-50">
        <HeaderUserMenu
          usuario={usuarioActual}
          onLogout={() => {
            logout();
            setAutenticado(false);
          }}
          onChangeUser={changeUser}
        />
      </div>

      {/* RECARGA productos pero mantiene carrito */}
      <ProductosPOS key={usuarioActual} usuario={usuarioActual} />

    </>
  );
}
