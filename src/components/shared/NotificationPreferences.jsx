import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNotificationPreferences } from "../../hooks/useNotifications";
import "./shared.css";

export default function NotificationPreferences({ userId = "default" }) {
  const { t } = useTranslation();
  const { prefs, loading, saving, save } = useNotificationPreferences(userId);
  const [local, setLocal] = useState(null);

  const CHANNELS = [
    { id: "email", label: t('notifications.email') },
    { id: "whatsapp", label: t('notifications.whatsapp') },
    { id: "call", label: t('notifications.calls') },
  ];

  const FREQUENCIES = [
    { value: "daily", label: t('notifications.daily') },
    { value: "weekly", label: t('notifications.weekly') },
    { value: "none", label: "--" },
  ];

  useEffect(() => {
    if (prefs) setLocal({ ...prefs });
  }, [prefs]);

  if (loading || !local) {
    return <div className="notif-prefs">{t('dashboard.loading')}</div>;
  }

  const toggleChannel = (list, channel) => {
    if (list.includes(channel)) return list.filter((c) => c !== channel);
    return [...list, channel];
  };

  return (
    <div className="notif-prefs">
      <div className="notif-prefs__section">
        <h4>{t('notifications.channels')}</h4>
        {CHANNELS.map((ch) => (
          <div key={ch.id} className="notif-prefs__row">
            <button
              className={`notif-prefs__toggle ${local.alertChannels.includes(ch.id) ? "notif-prefs__toggle--active" : ""}`}
              onClick={() => setLocal({ ...local, alertChannels: toggleChannel(local.alertChannels, ch.id) })}
              type="button"
            />
            <span className="notif-prefs__label">{ch.label}</span>
          </div>
        ))}
      </div>

      <div className="notif-prefs__section">
        <h4>Email</h4>
        <div className="notif-prefs__row">
          <input
            className="notif-prefs__input"
            type="email"
            value={local.contacts.email || ""}
            onChange={(e) => setLocal({ ...local, contacts: { ...local.contacts, email: e.target.value } })}
          />
        </div>
        <div className="notif-prefs__row">
          <span className="notif-prefs__label">WhatsApp</span>
          <input
            className="notif-prefs__input"
            type="tel"
            value={local.contacts.whatsapp || ""}
            onChange={(e) => setLocal({ ...local, contacts: { ...local.contacts, whatsapp: e.target.value } })}
          />
        </div>
      </div>

      <div className="notif-prefs__section">
        <h4>{t('notifications.reports')}</h4>
        <div className="notif-prefs__row">
          <select
            className="notif-prefs__select"
            value={local.reportFrequency}
            onChange={(e) => setLocal({ ...local, reportFrequency: e.target.value })}
          >
            {FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="notif-prefs__section">
        <h4>{t('notifications.quietHours')}</h4>
        <div className="notif-prefs__row">
          <button
            className={`notif-prefs__toggle ${local.quietHours.enabled ? "notif-prefs__toggle--active" : ""}`}
            onClick={() => setLocal({ ...local, quietHours: { ...local.quietHours, enabled: !local.quietHours.enabled } })}
            type="button"
          />
          <span className="notif-prefs__label">
            {local.quietHours.enabled ? `${local.quietHours.start} - ${local.quietHours.end}` : "--"}
          </span>
        </div>
      </div>

      <button className="notif-prefs__save" type="button" onClick={() => save(local)} disabled={saving}>
        {saving ? "..." : t('notifications.save')}
      </button>
    </div>
  );
}
