export const htmlContent: string = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                padding: 20px 0;
            }
            .header h1 {
                margin: 0;
                color: #333333;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content h2 {
                color: #333333;
            }
            .content p {
                color: #666666;
                font-size: 16px;
                line-height: 1.5;
            }
            .content .code {
                font-size: 24px;
                font-weight: bold;
                color: #333333;
                margin: 20px 0;
                padding: 10px;
                border: 1px solid #dddddd;
                border-radius: 5px;
                background-color: #f9f9f9;
            }
            .footer {
                text-align: center;
                padding: 20px;
                font-size: 14px;
                color: #999999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Verify Your Email</h1>
            </div>
            <div class="content">
                <h2>Hello,</h2>
                <p>Thank you for registering with us. To complete your registration, please verify your email address by entering the following verification code:</p>
                <div class="code">{verificationToken}</div>
                <p>If you did not request this verification, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Your Company. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;

export const generateWelcomeEmailHtml = (name: string) => {
    return `
          <html>
            <head>
              <style>
                .email-container {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  padding: 20px;
                  background-color: #f4f4f4;
                  border-radius: 10px;
                  max-width: 600px;
                  margin: auto;
                }
                .email-header {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .email-body {
                  background-color: white;
                  padding: 20px;
                  border-radius: 0 0 10px 10px;
                }
                .email-footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
                .button {
                  display: inline-block;
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="email-header">
                  <h1>Welcome to Food Hub!</h1>
                </div>
                <div class="email-body">
                  <p>Dear ${name},</p>
                  <p>Thank you for joining Food Hub! We're excited to have you on board.</p>
                  <p>You can now start exploring our delicious food options and placing orders.</p>
                  <div class="email-footer">
                    <p>&copy; 2024 Food Hub. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
};

export const generatePasswordResetEmailHtml = (resetURL: string) => {
    return `
          <html>
            <head>
              <style>
                .email-container {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  padding: 20px;
                  background-color: #f4f4f4;
                  border-radius: 10px;
                  max-width: 600px;
                  margin: auto;
                }
                .email-header {
                  background-color: #ff9800;
                  color: white;
                  padding: 10px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .email-body {
                  background-color: white;
                  padding: 20px;
                  border-radius: 0 0 10px 10px;
                }
                .button {
                  display: inline-block;
                  background-color: #ff9800;
                  color: white;
                  padding: 10px 20px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin-top: 20px;
                }
                .email-footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="email-header">
                  <h1>Password Reset Request</h1>
                </div>
                <div class="email-body">
                  <p>Hello,</p>
                  <p>We received a request to reset your password. Click the button below to reset it:</p>
                  <a href="${resetURL}" class="button">Reset Password</a>
                  <p>If you didn't request a password reset, you can ignore this email.</p>
                  <p>This link will expire in 1 hour.</p>
                  <div class="email-footer">
                    <p>&copy; 2024 Food Hub. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
};

export const generateResetSuccessEmailHtml = () => {
    return `
          <html>
            <head>
              <style>
                .email-container {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  padding: 20px;
                  background-color: #f4f4f4;
                  border-radius: 10px;
                  max-width: 600px;
                  margin: auto;
                }
                .email-header {
                  background-color: #4CAF50;
                  color: white;
                  padding: 10px;
                  text-align: center;
                  border-radius: 10px 10px 0 0;
                }
                .email-body {
                  background-color: white;
                  padding: 20px;
                  border-radius: 0 0 10px 10px;
                }
                .email-footer {
                  text-align: center;
                  margin-top: 20px;
                  font-size: 12px;
                  color: #666;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="email-header">
                  <h1>Password Reset Successful</h1>
                </div>
                <div class="email-body">
                  <p>Hello,</p>
                  <p>Your password has been successfully reset. You can now log in with your new password.</p>
                  <p>If you didn't make this change, please contact our support team immediately.</p>
                  <div class="email-footer">
                    <p>&copy; 2024 Food Hub. All rights reserved.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
};
