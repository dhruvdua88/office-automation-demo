// ─────────────────────────────────────────────────────────────────────────────
// EmailJS configuration
// Sign up free at https://www.emailjs.com/ and replace the values below.
// ─────────────────────────────────────────────────────────────────────────────

export const EMAILJS_CONFIG = {
  publicKey:   'YOUR_PUBLIC_KEY',      // Account → API Keys
  serviceId:   'YOUR_SERVICE_ID',      // Email Services tab
  templateId:  'YOUR_TEMPLATE_ID',     // Email Templates tab
}

// Template variable map — must match the variables in your EmailJS template.
// Example template body:
//   Dear {{to_name}}, {{message}} — regards, {{from_name}}
export const TEMPLATE_VARS = {
  to_name:   '',   // recipient name
  to_email:  '',   // recipient email  (set as "To Email" in template)
  from_name: 'DD & Co',
  reply_to:  'dhruv@ddandco.in',
  subject:   '',
  message:   '',
  cc:        '',
}
