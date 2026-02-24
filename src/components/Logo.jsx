/**
 * Logo Component
 * Renders the Elathia application logo using image files
 *
 * @param {Object} props
 * @param {'mark'|'text'|'full'} props.variant - Logo variant to display
 * @param {string} props.className - Additional CSS class names
 */
export default function Logo({ variant = 'full', className = '' }) {
  // Use image files from public folder
  const shortLogoSrc = process.env.PUBLIC_URL + '/Elathia Short Logo.png';
  const fullLogoSrc = process.env.PUBLIC_URL + '/Frame 1.png';

  if (variant === 'mark') {
    return (
      <div className={`logo-mark ${className}`} aria-label="Elathia">
        <img src={shortLogoSrc} alt="Elathia" height="24" />
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`logo-text ${className}`} aria-label="Elathia">
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          color: '#1f4c7a',
          letterSpacing: '0.5px'
        }}>
          ELATHIA
        </span>
      </div>
    );
  }

  // Full variant - use the full logo image
  return (
    <div className={`logo-full ${className}`} aria-label="Elathia">
      <img src={fullLogoSrc} alt="Elathia" height="36" />
    </div>
  );
}
