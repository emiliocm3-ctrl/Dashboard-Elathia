import { useState } from "react";
import Logo from "./components/Logo";
import { ASSETS } from "./config/assets";
import "./LoginScreen.css";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      if (onLogin) onLogin(email, password);
    } catch {
      setLoginError("Error al iniciar sesión. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-grid" aria-hidden="true" />
      <div className="login-hero" />
      <div className="login-panel">
        <div className="login-brand">
          <Logo variant="full" />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label" htmlFor="login-email">
              Email
            </label>
            <div className="form-input">
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                className="input-control"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="login-password">
              Contraseña
            </label>
            <div className="form-input form-input--with-icon">
              <input
                id="login-password"
                type="password"
                placeholder="Contraseña"
                className="input-control"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="input-icon" aria-hidden="true">
                <img src={ASSETS.icons.person} alt="" />
              </span>
            </div>
          </div>
          {loginError && (
            <div className="login-error" role="alert">{loginError}</div>
          )}
          <button className="login-button" type="submit">
            Iniciar sesión
          </button>
          <div className="login-footer">
            <label className="remember-toggle">
              <input className="remember-toggle__input" type="checkbox" />
              <span className="remember-toggle__track" aria-hidden="true">
                <span className="remember-toggle__knob" />
              </span>
              <span className="remember-toggle__label">Recuérdame</span>
            </label>
            <button className="login-link" type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
