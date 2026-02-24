import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./layout.css";

export default function BottomNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const TABS = [
    { id: "home", label: t('nav.home'), icon: "⌂", path: "/" },
    { id: "alerts", label: t('nav.alerts'), icon: "⚠", path: "/alerts" },
    { id: "profile", label: t('nav.profile'), icon: "👤", path: "/profile" },
  ];

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/" || location.pathname.startsWith("/ranches");
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`bottom-nav__tab ${isActive(tab.path) ? "bottom-nav__tab--active" : ""}`}
          onClick={() => navigate(tab.path)}
          aria-current={isActive(tab.path) ? "page" : undefined}
          type="button"
        >
          <span className="bottom-nav__icon">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
