import { ASSETS } from '../config/assets';

/**
 * Sidebar Component
 * Navigation sidebar with sector list and logout button
 *
 * @param {Object} props
 * @param {string} props.title - Sidebar title (e.g., "Control General")
 * @param {Array} props.items - Array of sidebar items
 * @param {string|null} props.selectedItem - Currently selected item
 * @param {Function} props.onItemClick - Callback when item is clicked
 * @param {Function} props.onLogout - Callback when logout is clicked
 * @param {Function} props.onTitleClick - Callback when title pill is clicked
 */
export default function Sidebar({
  title,
  items = [],
  selectedItem = null,
  onItemClick,
  onLogout,
  onTitleClick,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <button
          className="sidebar-pill"
          type="button"
          onClick={onTitleClick}
          aria-label="Volver a Control General"
        >
          {title}
        </button>
        <p className="sidebar-label">Por sector:</p>
        <div className="sidebar-list">
          {items.map((item, index) => {
            const itemLabel = item.label || item;
            const isSelected = selectedItem === itemLabel;
            return (
              <SidebarItem
                key={index}
                label={itemLabel}
                isSelected={isSelected}
                onClick={() => onItemClick && onItemClick(item, index)}
              />
            );
          })}
        </div>
      </div>
      <button className="sidebar-logout" type="button" onClick={onLogout}>
        <span className="icon-32 rotate-90">
          <img src={ASSETS.icons.upload} alt="" />
        </span>
        <span>Cerrar Sesión</span>
      </button>
    </aside>
  );
}

/**
 * SidebarItem Component
 * Individual item in the sidebar list
 *
 * @param {Object} props
 * @param {string} props.label - Item label text
 * @param {boolean} props.isSelected - Whether this item is selected
 * @param {Function} props.onClick - Callback when item is clicked
 * @param {Function} props.onEdit - Callback when edit icon is clicked
 */
function SidebarItem({ label, isSelected = false, onClick }) {
  return (
    <button
      type="button"
      className={`sidebar-item ${isSelected ? 'sidebar-item--selected' : ''}`}
      onClick={onClick}
    >
      <span>{label}</span>
    </button>
  );
}
