import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("kulith", verificationToken), // Placeholder fixed
      category: "verify email"
    });
    console.log("Email sent successfully", response);
  } catch (error) {
    console.error("Email send failed", error);
    throw new Error(`Error sending email: ${error.message}`);
  }
};
