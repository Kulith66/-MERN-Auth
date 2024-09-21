import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
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

export const sendWelcomeEmail =async (email,name) => {
    const recipient = [{email}];
    try {
      await mailtrapClient.send({
        from: sender,
        to: recipient,
        template_uuid: "998051c6-72d8-4781-a058-a1166f835d94",
        template_variables:{
          company_info_name:"companyy name",
          name:name
        },
       
      });
      console.log("Welcome email sent successfully",response)
    } catch (error) {
      console.error("Error sending email",error)
      throw new Error(`Error sending email: ${error.message}`);
    }
};
export const sendPasswordResetEmail = async (email, resetUrl) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetUrl}", resetUrl),
      category: "password Reset"
    });

    console.log("Password reset email sent successfully", response);
    console.log(resetUrl)
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};




export const sendResetSuccessEmail = async (email) => {
    try {
        await mailtrapClient.send({
            from: sender,
            to: [{ email }], // Wrap recipient email in an object
            subject: "Password Reset Successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE, // Use your pre-defined HTML template for success
            category: "password reset",
        });

        return { success: true };
    } catch (error) {
        console.error("Error sending reset success email:", error);
        return { success: false, message: "Failed to send reset success email" };
    }
};
