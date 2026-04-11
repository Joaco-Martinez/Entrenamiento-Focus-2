export function resetPasswordCodeTemplate(code: string) {
  return `
  <div style="background:#0b0b0b;padding:40px 20px;font-family:Arial,sans-serif;color:#fff;">
    <div style="max-width:600px;margin:0 auto;background:#111;border:1px solid rgba(212,175,55,.25);border-radius:18px;overflow:hidden;">
      <div style="height:6px;background:linear-gradient(90deg,#D4AF37,#f4d97c,#D4AF37);"></div>

      <div style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:28px;color:#D4AF37;">Recuperar contraseña</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#e7e7e7;">
          Recibimos una solicitud para restablecer tu contraseña.
        </p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#e7e7e7;">
          Usá este código de verificación:
        </p>

        <div style="margin:24px 0;padding:18px 24px;border-radius:14px;background:#1b1b1b;border:1px solid rgba(212,175,55,.25);text-align:center;">
          <span style="font-size:34px;letter-spacing:8px;font-weight:700;color:#ffffff;">${code}</span>
        </div>

        <p style="margin:0 0 10px;font-size:14px;line-height:1.6;color:#cfcfcf;">
          Este código vence en <strong>15 minutos</strong>.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#cfcfcf;">
          Si no solicitaste este cambio, simplemente ignorá este email.
        </p>
      </div>
    </div>
  </div>
  `;
}