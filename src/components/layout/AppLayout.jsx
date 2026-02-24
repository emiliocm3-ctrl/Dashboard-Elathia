import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { ASSETS } from "../../config/assets";
import Logo from "../Logo";
import LanguageToggle from "./LanguageToggle";
import BottomNav from "./BottomNav";
import MenuMovil from "../../MenuMovil";
import "./layout.css";

export default function AppLayout({ sidebar, children }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-layout">
      <header className="app-topbar">
        <button
          className="app-topbar__menu-toggle"
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Abrir menú"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="app-topbar__brand">
          <Logo variant="full" />
        </div>
        <div className="app-topbar__user">
          <LanguageToggle />
          <span className="app-topbar__greeting">
            {t('greeting.hello')}, {user?.name || t('greeting.defaultUser')}
          </span>
          <span className="app-topbar__avatar">
            <img src={ASSETS.icons.person} alt="" />
          </span>
        </div>
      </header>

      {sidebar && <aside className="app-sidebar">{sidebar}</aside>}

      <main className="app-main">
        {children}
      </main>

      <BottomNav />

      <MenuMovil
        title="Menú"
        items={[]}
        selectedItem={null}
        onItemClick={() => {}}
        onLogout={handleLogout}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  );
}
