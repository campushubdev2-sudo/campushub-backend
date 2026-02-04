const ACTION_TYPES = [
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
  "calendar-entry.detail",
  "calendar-entry.by-event",
  "calendar-entry.by-user",
  "calendar-entry.check.event-added",
  "calendar-entry.update",
  "calendar-entry.delete",
  "calendar-entry.stats.overview",

  // ROLES / PERMISSIONS (from audit log usage)
  "user.login",
  "user.logout",
  "role.grant",
  "role.revoke",
];

export { ACTION_TYPES };
