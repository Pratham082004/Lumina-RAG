import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to_email: str, subject: str, html_content: str, reply_to: str | None = None) -> bool:
    if not settings.EMAIL_USER or not settings.EMAIL_PASS:
        logger.warning("Skipping email to %s: No email credentials configured in environment.", to_email)
        return False

    msg = MIMEMultipart()
    msg['From'] = f"Lumina Finance <{settings.EMAIL_USER}>"
    msg['To'] = to_email
    msg['Subject'] = subject

    if reply_to:
        msg['Reply-To'] = reply_to

    msg.attach(MIMEText(html_content, 'html'))

    try:
        if settings.EMAIL_PORT == 465:
            server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10)
        else:
            server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT, timeout=10)
            server.starttls()

        email_pass = settings.EMAIL_PASS.replace(" ", "") if settings.EMAIL_PASS else ""
        server.login(settings.EMAIL_USER, email_pass)
        text = msg.as_string()
        server.sendmail(settings.EMAIL_USER, to_email, text)
        server.quit()
        logger.info("Email sent successfully to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)
        print(f"[SMTP EMAIL ERROR] Failed to send email to {to_email} from {settings.EMAIL_USER}: {e}")
        return False


def send_otp_email(to_email: str, otp: str) -> bool:
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a365d; margin-bottom: 10px;">Verify Your Email Address</h2>
        <p style="color: #4a5568; line-height: 1.5;">Thank you for registering with <strong>Lumina Finance</strong>. Please use the following One-Time Password (OTP) to complete your verification:</p>
        <div style="background-color: #ebf8ff; border: 1px dashed #3182ce; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2b6cb0; margin: 0; letter-spacing: 6px; font-size: 32px;">{otp}</h1>
        </div>
        <p style="color: #718096; font-size: 14px;">This OTP will expire in 15 minutes.</p>
        <p style="color: #a0aec0; font-size: 12px; margin-top: 30px;">If you did not request this email, please disregard it.</p>
    </div>
    """
    return send_email(to_email, "Lumina Finance - Email Verification OTP", html_content)


def send_contact_email(from_email: str, user_message: str) -> None:
    # 1. Send notification email to admin (YOU), with Reply-To set to visitor's email
    admin_subject = f"New Contact Form Submission from {from_email}"
    admin_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2b6cb0;">New Contact Form Message</h2>
        <p><strong>Visitor Email:</strong> <a href="mailto:{from_email}">{from_email}</a></p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #3182ce; margin: 15px 0;">
            <p style="margin: 0; white-space: pre-wrap; color: #2d3748;">{user_message}</p>
        </div>
        <p style="color: #718096; font-size: 13px;">Hit "Reply" in your email inbox to respond directly to {from_email}.</p>
    </div>
    """
    send_email(settings.EMAIL_USER, admin_subject, admin_html, reply_to=from_email)

    # 2. Send confirmation receipt to visitor
    user_subject = "We received your message - Lumina Finance"
    user_html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #1a365d;">Thank you for reaching out!</h2>
        <p style="color: #4a5568;">Hi there,</p>
        <p style="color: #4a5568; line-height: 1.5;">We have received your message. A member of the Lumina Finance team will review your inquiry and get back to you as soon as possible.</p>
        <div style="background-color: #f7fafc; padding: 12px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #718096; font-size: 13px;"><strong>Your submitted message:</strong></p>
            <p style="margin: 5px 0 0 0; color: #4a5568; font-style: italic;">"{user_message}"</p>
        </div>
        <p style="color: #a0aec0; font-size: 12px;">Lumina Finance Team</p>
    </div>
    """
    send_email(from_email, user_subject, user_html)
