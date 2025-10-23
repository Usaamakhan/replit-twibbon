/**
 * Email templates for user notifications
 * Returns { subject, html } for each template type
 */
export const getEmailTemplate = (templateName, params = {}) => {
  const templates = {
    accountBanned: ({ userEmail, username, banReason, appealDeadline, isPermanent }) => ({
      subject: '🚫 Your Account Has Been Suspended',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: #dc2626; 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content { 
              padding: 30px; 
            }
            .warning-box { 
              background: #fef2f2; 
              border-left: 4px solid #dc2626; 
              padding: 15px; 
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning-box strong {
              display: block;
              margin-bottom: 8px;
              color: #dc2626;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #666; 
              font-size: 14px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            .button { 
              background: #2563eb; 
              color: white !important; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              display: inline-block;
              margin: 20px 0;
            }
            .button:hover {
              background: #1d4ed8;
            }
            p {
              margin: 0 0 16px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚫 Account Suspended</h1>
            </div>
            <div class="content">
              <p>Hello ${username || userEmail},</p>
              
              <p>Your Twibbonize account has been ${isPermanent ? 'permanently' : 'temporarily'} suspended by our moderation team.</p>
              
              <div class="warning-box">
                <strong>Reason for suspension:</strong>
                <p style="margin: 0;">${banReason}</p>
              </div>
              
              ${!isPermanent ? `
                <p><strong>Appeal Deadline:</strong> ${appealDeadline}</p>
                <p>You have the right to appeal this decision within 30 days. If you believe this suspension was made in error, you can submit an appeal before the deadline.</p>
                <p style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.NEXT_PUBLIC_BASE_URL}/appeal" class="button">Submit an Appeal</a>
                </p>
              ` : `
                <p>This is a permanent suspension. Your account will not be restored.</p>
              `}
              
              <p>If you have any questions, please contact our support team at support@twibbonize.com</p>
            </div>
            <div class="footer">
              <p><strong>Twibbonize Moderation Team</strong></p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),

    accountUnbanned: ({ userEmail, username }) => ({
      subject: '✅ Your Account Has Been Restored',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 20px auto; 
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: #16a34a; 
              color: white; 
              padding: 30px 20px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .content { 
              padding: 30px; 
            }
            .success-box { 
              background: #f0fdf4; 
              border-left: 4px solid #16a34a; 
              padding: 15px; 
              margin: 20px 0;
              border-radius: 4px;
            }
            .success-box strong {
              display: block;
              margin-bottom: 8px;
              color: #16a34a;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #666; 
              font-size: 14px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            .button { 
              background: #2563eb; 
              color: white !important; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              display: inline-block;
              margin: 20px 0;
            }
            .button:hover {
              background: #1d4ed8;
            }
            p {
              margin: 0 0 16px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Account Restored</h1>
            </div>
            <div class="content">
              <p>Hello ${username || userEmail},</p>
              
              <div class="success-box">
                <strong>Good news!</strong>
                <p style="margin: 0;">Your Twibbonize account has been reviewed and restored by our moderation team.</p>
              </div>
              
              <p>You can now log in and access your account normally. We appreciate your patience during the review process.</p>
              
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/signin" class="button">Sign In Now</a>
              </p>
              
              <p>Please remember to follow our community guidelines to avoid future issues. If you have any questions, contact us at support@twibbonize.com</p>
            </div>
            <div class="footer">
              <p><strong>Twibbonize Moderation Team</strong></p>
              <p>This is an automated email. Please do not reply directly.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Email template "${templateName}" not found`);
  }

  return typeof template === 'function' ? template(params) : template;
};
