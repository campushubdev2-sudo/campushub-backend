// @ts-check

/** @type {readonly string[]} */
const ACTION_TYPES = Object.freeze([
  // AUTH
  "auth.profile.view",
  "auth.sign-up",
  "auth.sign-in",
  "auth.reset-password",
  "auth.logout",

  // USERS
  "user.create",
  "user.list",
  "user.detail",
  "user.update",
  "user.delete",
  "user.stats.overview",

  // ORGANIZATIONS
  "org.register",
  "org.create",
  "org.list",
  "org.get",
  "org.update",
  "org.delete",
  "org.stats.overview",

  // EVENTS (SCHOOL EVENTS)
  "event.create",
  "event.list",
  "event.filter.date-range",
  "event.stats.overview",
  "event.stats.monthly",
  "event.stats.venues",
  "event.recent",
  "event.detail",
  "event.update",
  "event.delete",

  // EVENT NOTIFICATIONS
  "notification.create",
  "notification.bulk-create",
  "notification.list",
  "notification.detail",
  "notification.update",
  "notification.delete",
  "notification.stats",
  "notification.stats.overall",

  // REPORTS
  "report.create",
  "report.list",
  "report.detail",
  "report.download(s)",
  "report.update-status",
  "report.delete",

  // OTP
  "otp.cleanup",
  "otp.stats",
  "otp.send",
  "otp.resend",
  "otp.verify",

  // SMS
  "sms.send",
  "sms.send.bulk",
  "sms.balance",
  "sms.messages",
  "sms.validate-phone",
  "sms.format-phone",
  "sms.test",
  "sms.send.method",
  "sms.status",

  // CALENDAR ENTRIES
  "calendar-entry.create",
  "calendar-entry.list",
  "calendar-entry.update",
  "calendar-entry.delete",
  "calendar-entry.stats.overview",
  "calendar-entry.detail",

  // OFFICERS
  "officer.create",
  "officer.list",
  "officer.detail",
  "officer.update",
  "officer.delete",
  "officer.stats.overview",
  "officer.stats.detailed",
  "officer.stats.organization",
  "officer.stats.period",
  "officer.near-term-end",
]);

export { ACTION_TYPES };
