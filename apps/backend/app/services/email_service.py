"""Email service for sending registration confirmation emails."""

import html

from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType, MultipartSubtypeEnum
from app.core.config import get_settings

settings = get_settings()

# Email Configuration
# Force use of port 465 (SSL) for Gmail if currently configured for 587 (STARTTLS)
# This fixes common timeout issues in certain environments
mail_port = settings.mail_port
mail_server = settings.mail_server
use_ssl = False
use_starttls = False

if "smtp.gmail.com" in mail_server and mail_port == 587:
    print("⚠️ Detected Gmail on port 587. Forcing switch to port 465 (SSL) to avoid timeouts.")
    mail_port = 465

if mail_port == 465:
    use_ssl = True
    use_starttls = False
elif mail_port == 587:
    use_ssl = False
    use_starttls = True

email_conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=mail_port,
    MAIL_SERVER=mail_server,
    MAIL_FROM_NAME=settings.mail_from_name,
    MAIL_STARTTLS=use_starttls,
    MAIL_SSL_TLS=use_ssl,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
    TEMPLATE_FOLDER=None,  # We'll use inline HTML
    TIMEOUT=10 # Set timeout to 10 seconds
)

fastmail = FastMail(email_conf)


# Brand palette (matches apps/syf-frontend/site.config.ts)
NAVY = "#0E1A2B"
SILVER = "#C0C6CF"
SILVER_DIM = "#8C95A3"
MIST = "#F3F5F8"
LINE = "#E3E7ED"
INK = "#1F2937"
INK_MUTED = "#4A5568"
ROYAL = "#2457E6"
ROYAL_TINT = "#EAF0FD"

FONT_BODY = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"
FONT_DISPLAY = "Georgia, 'Times New Roman', serif"
FONT_MONO = "'SFMono-Regular', Menlo, Consolas, monospace"


def _format_inr(amount: int) -> str:
    """Format whole rupees with Indian digit grouping, e.g. 150000 -> ₹1,50,000."""
    digits = str(amount)
    if len(digits) > 3:
        head, tail = digits[:-3], digits[-3:]
        groups = []
        while len(head) > 2:
            groups.insert(0, head[-2:])
            head = head[:-2]
        if head:
            groups.insert(0, head)
        digits = ",".join(groups + [tail])
    return f"₹{digits}"


def _receipt_row(label: str, value_html: str, last: bool = False) -> str:
    border = "" if last else f"border-bottom:1px solid {LINE};"
    return f"""
                <tr>
                  <td valign="top" style="padding:12px 16px 12px 0;{border}font-family:{FONT_BODY};font-size:14px;color:{INK_MUTED};white-space:nowrap;">{label}</td>
                  <td align="right" valign="top" style="padding:12px 0;{border}font-family:{FONT_BODY};font-size:14px;font-weight:700;color:{NAVY};word-break:break-all;">{value_html}</td>
                </tr>"""


def _next_steps(event_label: str) -> list[str]:
    return [
        "Keep this email. Your Registration ID is your reference for anything to do with your entry.",
        "Registration doesn’t guarantee a place in a team. The organisers will be in touch about the next steps.",
        f"Keep your calendar free for {event_label} practice sessions and every match day. "
        "We’ll share the schedule once it is confirmed.",
    ]


def build_success_email(
    name: str,
    player_id: str,
    amount: int,
    payment_id: str | None = None,
) -> tuple[str, str, str]:
    """Build the registration confirmation as (subject, html, plain_text)."""
    organiser = settings.organiser_name
    event_name = settings.event_name
    short_name = settings.event_short_name
    season = settings.event_season
    event_label = f"{short_name} {season}"
    support = settings.mail_support_email
    amount_text = _format_inr(amount)
    steps = _next_steps(event_label)

    subject = f"✅ {event_label} Registration Successful – Payment Received"
    preheader = f"We've received your payment of {amount_text}. Your Registration ID is {player_id}."

    e = html.escape
    rows = _receipt_row("Registration ID", f'<span style="font-family:{FONT_MONO};font-size:13px;">{e(player_id)}</span>')
    rows += _receipt_row("Amount paid", e(amount_text))
    if payment_id:
        rows += _receipt_row("Payment reference", f'<span style="font-family:{FONT_MONO};font-size:13px;">{e(payment_id)}</span>')
    rows += _receipt_row("Payment status", f'<span style="color:{ROYAL};">Received</span>', last=True)

    steps_html = "".join(
        f"""
                <tr>
                  <td width="28" valign="top" style="padding:0 0 12px;font-family:{FONT_BODY};font-size:14px;font-weight:700;color:{ROYAL};">{i}.</td>
                  <td valign="top" style="padding:0 0 12px;font-family:{FONT_BODY};font-size:14px;line-height:22px;color:{INK};">{e(step)}</td>
                </tr>"""
        for i, step in enumerate(steps, start=1)
    )

    if support:
        support_html = (
            f'<p style="margin:0 0 6px;font-family:{FONT_BODY};font-size:13px;line-height:20px;color:{INK_MUTED};">'
            f'Questions? Write to <a href="mailto:{e(support)}" style="color:{ROYAL};text-decoration:underline;">{e(support)}</a>.</p>'
        )
    else:
        support_html = ""

    # With a support address, Reply-To routes replies there, so don't tell people not to reply.
    automated_note = (
        "This is an automated email."
        if support
        else "This is an automated email. Please do not reply to this message."
    )

    html_body = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>{e(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:{MIST};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:{MIST};">{e(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{MIST}" style="background-color:{MIST};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">

          <!-- Header -->
          <tr>
            <td bgcolor="{NAVY}" style="background-color:{NAVY};padding:32px 32px 28px;border-radius:12px 12px 0 0;">
              <p style="margin:0 0 14px;font-family:{FONT_BODY};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:{SILVER};">{e(organiser)}</p>
              <h1 style="margin:0;font-family:{FONT_DISPLAY};font-size:32px;line-height:38px;font-weight:400;color:#FFFFFF;">{e(event_label)}</h1>
              <p style="margin:6px 0 0;font-family:{FONT_BODY};font-size:14px;line-height:20px;color:{SILVER};">{e(event_name)}</p>
            </td>
          </tr>
          <tr>
            <td bgcolor="{ROYAL}" height="4" style="background-color:{ROYAL};height:4px;line-height:4px;font-size:4px;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:32px;border-left:1px solid {LINE};border-right:1px solid {LINE};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="{ROYAL_TINT}" style="background-color:{ROYAL_TINT};padding:6px 12px;border-radius:999px;font-family:{FONT_BODY};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:{ROYAL};">&#10003;&nbsp; Payment received</td>
                </tr>
              </table>

              <h2 style="margin:20px 0 12px;font-family:{FONT_DISPLAY};font-size:26px;line-height:32px;font-weight:400;color:{NAVY};">You&rsquo;re registered.</h2>
              <p style="margin:0 0 12px;font-family:{FONT_BODY};font-size:15px;line-height:24px;color:{INK};">Hi <strong>{e(name)}</strong>,</p>
              <p style="margin:0 0 24px;font-family:{FONT_BODY};font-size:15px;line-height:24px;color:{INK};">Thank you for registering for <strong>{e(event_name)} ({e(event_label)})</strong>. We&rsquo;ve received your registration fee and your registration is complete.</p>

              <!-- Receipt -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="{MIST}" style="background-color:{MIST};border-radius:8px;">
                <tr>
                  <td style="padding:8px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{rows}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Next steps -->
              <h3 style="margin:28px 0 14px;font-family:{FONT_BODY};font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:{NAVY};">What happens next</h3>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{steps_html}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#FFFFFF" style="background-color:#FFFFFF;padding:20px 32px 28px;border:1px solid {LINE};border-top:1px solid {LINE};border-radius:0 0 12px 12px;">
              {support_html}<p style="margin:0 0 4px;font-family:{FONT_BODY};font-size:12px;line-height:18px;color:{SILVER_DIM};"><strong>{e(organiser)}</strong> &middot; {e(event_label)}</p>
              <p style="margin:0;font-family:{FONT_BODY};font-size:12px;line-height:18px;color:{SILVER_DIM};">{e(automated_note)}</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    text_lines = [
        f"{organiser} | {event_label}",
        event_name,
        "",
        "PAYMENT RECEIVED - You're registered.",
        "",
        f"Hi {name},",
        "",
        f"Thank you for registering for {event_name} ({event_label}). "
        "We've received your registration fee and your registration is complete.",
        "",
        f"Registration ID:   {player_id}",
        f"Amount paid:       {amount_text}",
    ]
    if payment_id:
        text_lines.append(f"Payment reference: {payment_id}")
    text_lines += ["Payment status:   Received", "", "WHAT HAPPENS NEXT"]
    text_lines += [f"{i}. {step}" for i, step in enumerate(steps, start=1)]
    text_lines.append("")
    if support:
        text_lines.append(f"Questions? Write to {support}.")
    text_lines.append(automated_note)

    return subject, html_body, "\n".join(text_lines) + "\n"


async def send_success_email(
    to_email: str,
    name: str,
    player_id: str,
    amount: int,
    payment_id: str | None = None,
) -> bool:
    """
    Send registration success confirmation email.

    Args:
        to_email: Recipient email address
        name: Player's full name
        player_id: Unique player registration ID
        amount: Payment amount in INR (whole rupees)
        payment_id: Razorpay payment ID, shown as the payment reference when available

    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        subject, html_content, text_content = build_success_email(
            name=name,
            player_id=player_id,
            amount=amount,
            payment_id=payment_id,
        )

        support = settings.mail_support_email
        # multipart/alternative puts the preferred version last, so the plain-text body goes
        # first and the HTML is attached as its alternative.
        message = MessageSchema(
            subject=subject,
            recipients=[to_email],
            body=text_content,
            alternative_body=html_content,
            subtype=MessageType.plain,
            multipart_subtype=MultipartSubtypeEnum.alternative,
            reply_to=[support] if support else [],
        )

        await fastmail.send_message(message)
        print(f"✅ Success email sent to {to_email} for player {player_id}")
        return True

    except Exception as e:
        # Log error but don't fail the webhook
        print(f"❌ Failed to send email to {to_email}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
