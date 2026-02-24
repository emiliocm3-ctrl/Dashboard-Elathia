import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const toggle = () => {
    i18n.changeLanguage(current === 'es' ? 'en' : 'es');
  };

  return (
    <button
      className="lang-toggle"
      onClick={toggle}
      aria-label={current === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      title={current === 'es' ? 'English' : 'Español'}
      type="button"
    >
      <span className={`lang-toggle__option ${current === 'es' ? 'lang-toggle__option--active' : ''}`}>ES</span>
      <span className="lang-toggle__divider">/</span>
      <span className={`lang-toggle__option ${current === 'en' ? 'lang-toggle__option--active' : ''}`}>EN</span>
    </button>
  );
}
