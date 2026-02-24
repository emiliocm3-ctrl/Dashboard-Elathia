import { ASSETS } from "./config/assets";
import "./MenuMovil.css";

export default function MenuMovil({ title, items, selectedItem, onItemClick, onLogout, isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="menu-movil__overlay" onClick={onClose} />
      <aside className="menu-movil menu-movil--open">
        <div className="menu-movil__content">
          <div className="menu-movil__highlight">{title || "Control General"}</div>
          {items && items.length > 0 && (
            <>
              <p className="menu-movil__label">Navegación:</p>
              <div className="menu-movil__list">
                {items.map((item, idx) => {
                  const label = typeof item === "string" ? item : item.label || item.name;
                  const isActive = label === selectedItem;
                  return (
                    <button
                      key={typeof item === "string" ? item : item.id || idx}
                      className={`menu-movil__item ${isActive ? "menu-movil__item--active" : ""}`}
                      onClick={() => {
                        onItemClick(item, idx);
                        onClose();
                      }}
                      type="button"
                    >
                      <span className="menu-movil__item-text">{label}</span>
                      <span className="menu-movil__chevron" aria-hidden="true">
                        <img src={ASSETS.icons.chevron} alt="" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <button className="menu-movil__logout" type="button" onClick={() => { onLogout(); onClose(); }}>
          <span className="menu-movil__logout-icon" aria-hidden="true">
            <img src={ASSETS.icons.logout} alt="" />
          </span>
          Cerrar Sesión
        </button>
      </aside>
    </>
  );
}
