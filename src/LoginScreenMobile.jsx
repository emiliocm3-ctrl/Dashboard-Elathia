import "./LoginScreenMobile.css";

const imgBattery = "http://localhost:3845/assets/ab3e78739f97806a98bd3092608839a8af6f428c.svg";
const imgBatteryDark = "http://localhost:3845/assets/fc1bc48382553ce8928bbab45dad0e973fa1541e.svg";
const imgCellular = "http://localhost:3845/assets/82c41dd2f462dc082e211d884b58250dc8ba4f1e.svg";
const imgWifiBar1 = "http://localhost:3845/assets/50ea93d35b85679332c61b9cac3e08bea3cddd1c.svg";
const imgWifiBar2 = "http://localhost:3845/assets/ed1339d2320c71c4e7b1e738de991d3641e0093a.svg";
const imgWifiBar3 = "http://localhost:3845/assets/bd8b8b6b9d8f48f68c11cb076c44d1c1ea7afe59.svg";
const imgWifiBar4 = "http://localhost:3845/assets/99838241a0ec6e766030f17ed4c5c26dd090254f.svg";
const imgBluetooth = "http://localhost:3845/assets/10d848d864f0b2f846ef90876338b8379523e982.svg";
const imgLogoMark1 = "http://localhost:3845/assets/b316159dbf9f5a76080b8b460b9a6d573ba8d969.svg";
const imgLogoMark2 = "http://localhost:3845/assets/b369f867e16f326596ffc73d1d1c7ad8ffd40995.svg";
const imgLogoMark3 = "http://localhost:3845/assets/75c8dd80e01c2bfa1fb4a49fc5465b94bce70bb9.svg";
const imgLogoMark4 = "http://localhost:3845/assets/3bc967941af7c29bd473fb7d5ca0c4fe970a84e6.svg";
const imgLogoMark5 = "http://localhost:3845/assets/1308e978305db29605b33f4f6962612419c88028.svg";
const imgLogoText1 = "http://localhost:3845/assets/db1eb0ca08045a91258f69fc68066c136dd7aa53.svg";
const imgLogoText2 = "http://localhost:3845/assets/a094de903293323a77b2422f96b9474d3a1aec4b.svg";
const imgLogoText3 = "http://localhost:3845/assets/816fc3dfa7a3aab05dced686a994c5c482b50489.svg";
const imgLogoText4 = "http://localhost:3845/assets/92b9bca1d4fc1ae681da1f6eb2ce82c460275aa3.svg";
const imgLogoText5 = "http://localhost:3845/assets/f2b94b55e627958aab5077e56777a1cb42bb1c81.svg";
const imgLogoText6 = "http://localhost:3845/assets/dd961b079558001ccdc096c34ab0c6dd371d5bcb.svg";
const imgLogoText7 = "http://localhost:3845/assets/c971774fef711a39ec06c4518b3e4947053c8f72.svg";
const imgPasswordIcon = "http://localhost:3845/assets/ccab5b6710fe38e3fb506ba88ae4baff1abf71d0.svg";

function StatusBar() {
  return (
    <div className="login-mobile__statusbar" aria-hidden="true">
      <span className="login-mobile__status-time">09:30 PM</span>
      <div className="login-mobile__status-icons">
        <span className="login-mobile__icon bluetooth">
          <img src={imgBluetooth} alt="" />
        </span>
        <span className="login-mobile__icon wifi">
          <img className="wifi-bar wifi-bar--1" src={imgWifiBar1} alt="" />
          <img className="wifi-bar wifi-bar--2" src={imgWifiBar2} alt="" />
          <img className="wifi-bar wifi-bar--3" src={imgWifiBar3} alt="" />
          <img className="wifi-bar wifi-bar--4" src={imgWifiBar4} alt="" />
        </span>
        <span className="login-mobile__icon cellular">
          <span className="cellular-label">5G</span>
          <img src={imgCellular} alt="" />
        </span>
        <span className="login-mobile__icon battery">
          <img src={imgBattery} alt="" />
          <span className="battery-indicator" />
          <span className="battery-outline" aria-hidden="true">
            <img src={imgBatteryDark} alt="" />
          </span>
        </span>
      </div>
    </div>
  );
}

export default function LoginScreenMobile() {
  return (
    <div className="login-mobile" data-node-id="157:15410">
      <div className="login-mobile__grid" aria-hidden="true" />
      <StatusBar />
      <div className="login-mobile__content">
        <div className="login-mobile__brand">
          <div className="login-mobile__logo-mark" aria-hidden="true">
            <img className="logo-piece logo-piece--1" src={imgLogoMark1} alt="" />
            <img className="logo-piece logo-piece--2" src={imgLogoMark2} alt="" />
            <img className="logo-piece logo-piece--3" src={imgLogoMark3} alt="" />
            <img className="logo-piece logo-piece--4" src={imgLogoMark4} alt="" />
            <img className="logo-piece logo-piece--5" src={imgLogoMark5} alt="" />
          </div>
          <div className="login-mobile__logo-text" aria-label="Elathia">
            <img className="logo-text-piece logo-text-piece--1" src={imgLogoText1} alt="" />
            <img className="logo-text-piece logo-text-piece--2" src={imgLogoText2} alt="" />
            <img className="logo-text-piece logo-text-piece--3" src={imgLogoText3} alt="" />
            <img className="logo-text-piece logo-text-piece--4" src={imgLogoText4} alt="" />
            <img className="logo-text-piece logo-text-piece--5" src={imgLogoText5} alt="" />
            <img className="logo-text-piece logo-text-piece--6" src={imgLogoText6} alt="" />
            <img className="logo-text-piece logo-text-piece--7" src={imgLogoText7} alt="" />
          </div>
        </div>

        <div className="login-mobile__form">
          <div className="login-mobile__field">
            <label className="login-mobile__label" htmlFor="mobile-email">
              Email
            </label>
            <div className="login-mobile__input">
              <input id="mobile-email" type="email" placeholder="Email" />
            </div>
          </div>

          <div className="login-mobile__field">
            <label className="login-mobile__label" htmlFor="mobile-password">
              Contraseña
            </label>
            <div className="login-mobile__input login-mobile__input--with-icon">
              <input id="mobile-password" type="password" placeholder="Contraseña" />
              <span className="login-mobile__input-icon" aria-hidden="true">
                <img src={imgPasswordIcon} alt="" />
              </span>
            </div>
          </div>

          <button className="login-mobile__button" type="button">
            Iniciar sesión
          </button>

          <div className="login-mobile__footer">
            <label className="login-mobile__toggle">
              <input className="login-mobile__toggle-input" type="checkbox" />
              <span className="login-mobile__toggle-track" aria-hidden="true">
                <span className="login-mobile__toggle-knob" />
              </span>
              <span className="login-mobile__toggle-label">Recuérdame</span>
            </label>
            <button className="login-mobile__link" type="button">
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
