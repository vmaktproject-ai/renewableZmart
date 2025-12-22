import { sgMail, EMAIL_FROM } from '../config/email';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'vmaktproject@gmail.com';

export const emailService = {
  // Send welcome email to new user
  sendWelcomeEmail: async (userEmail: string, firstName: string, accountType: string) => {
    try {
      const mailOptions = {
        from: EMAIL_FROM,
        to: userEmail,
        subject: 'Welcome to RenewableZmart! 🌱',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #0d9488, #10b981); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Welcome to RenewableZmart</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #0d9488;">Hello ${firstName}! 👋</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for joining RenewableZmart - your trusted marketplace for sustainable energy products and services.
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                Your <strong>${accountType}</strong> account has been successfully created.
              </p>
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0d9488; margin-top: 0;">What's Next?</h3>
                <ul style="color: #374151; line-height: 1.8;">
                  ${accountType === 'vendor' ? `
                    <li>Set up your store and add products</li>
                    <li>Manage your inventory</li>
                    <li>Start receiving orders</li>
                  ` : accountType === 'installer' ? `
                    <li>Complete your profile with certifications</li>
                    <li>Add your portfolio projects</li>
                    <li>Connect with customers</li>
                  ` : `
                    <li>Browse our marketplace for sustainable products</li>
                    <li>Find verified installers in your area</li>
                    <li>Use our load calculator to find the right system</li>
                  `}
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000" style="background-color: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Go to Dashboard
                </a>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                If you have any questions, feel free to contact our support team.
              </p>
            </div>
            <div style="background-color: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © 2025 RenewableZmart. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      await sgMail.send({
        to: userEmail,
        from: EMAIL_FROM,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('✉️ Welcome email sent to:', userEmail);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
    }
  },

  // Notify admin of new registration
  sendAdminRegistrationNotification: async (user: any) => {
    try {
      const mailOptions = {
        from: EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `New ${user.accountType || 'Customer'} Registration - ${user.firstName} ${user.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0d9488; padding: 20px;">
              <h2 style="color: white; margin: 0;">New User Registration</h2>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
              <h3 style="color: #0d9488;">User Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.firstName} ${user.lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Account Type:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.accountType || 'Customer'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Location:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.city}, ${user.country}</td>
                </tr>
                ${user.businessName ? `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>Business Name:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${user.businessName}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px;"><strong>Registration Date:</strong></td>
                  <td style="padding: 8px;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
          </div>
        `,
      };

      await sgMail.send({
        to: ADMIN_EMAIL,
        from: EMAIL_FROM,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('✉️ Admin notification sent for new registration');
    } catch (error) {
      console.error('❌ Error sending admin notification:', error);
    }
  },

  // Send login notification to user
  sendLoginNotification: async (userEmail: string, firstName: string, loginInfo: any) => {
    try {
      const mailOptions = {
        from: EMAIL_FROM,
        to: userEmail,
        subject: 'New Login to Your RenewableZmart Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0d9488; padding: 20px;">
              <h2 style="color: white; margin: 0;">Login Activity</h2>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
              <p style="font-size: 16px; color: #374151;">Hello ${firstName},</p>
              <p style="font-size: 16px; color: #374151;">
                We noticed a new login to your RenewableZmart account.
              </p>
              <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0; color: #374151;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Location:</strong> ${loginInfo.city}, ${loginInfo.country}</p>
              </div>
              <p style="font-size: 14px; color: #ef4444;">
                If this wasn't you, please secure your account immediately by changing your password.
              </p>
            </div>
          </div>
        `,
      };

      await sgMail.send({
        to: userEmail,
        from: EMAIL_FROM,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('✉️ Login notification sent to:', userEmail);
    } catch (error) {
      console.error('❌ Error sending login notification:', error);
    }
  },

  // Notify admin of new login
  sendAdminLoginNotification: async (user: any) => {
    try {
      const mailOptions = {
        from: EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `User Login - ${user.firstName} ${user.lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0d9488; padding: 20px;">
              <h2 style="color: white; margin: 0;">User Login Activity</h2>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
              <p><strong>User:</strong> ${user.firstName} ${user.lastName}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Location:</strong> ${user.city}, ${user.country}</p>
            </div>
          </div>
        `,
      };

      await sgMail.send({
        to: ADMIN_EMAIL,
        from: EMAIL_FROM,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('✉️ Admin login notification sent');
    } catch (error) {
      console.error('❌ Error sending admin login notification:', error);
    }
  },

  // Send order confirmation to user
  sendOrderConfirmation: async (userEmail: string, firstName: string, orderDetails: any) => {
    try {
      const mailOptions = {
        from: EMAIL_FROM,
        to: userEmail,
        subject: `Order Confirmation - #${orderDetails.id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0d9488; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Order Confirmed! 🎉</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <p style="font-size: 16px; color: #374151;">Hello ${firstName},</p>
              <p style="font-size: 16px; color: #374151;">
                Thank you for your order! We've received your payment and are processing your order.
              </p>
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0d9488;">Order Details</h3>
                <p><strong>Order ID:</strong> #${orderDetails.id}</p>
                <p><strong>Total:</strong> ${orderDetails.total}</p>
                <p><strong>Status:</strong> Processing</p>
              </div>
              <p style="font-size: 14px; color: #6b7280;">
                We'll send you another email when your order ships.
              </p>
            </div>
          </div>
        `,
      };

      await sgMail.send({
        to: userEmail,
        from: EMAIL_FROM,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('✉️ Order confirmation sent to:', userEmail);
    } catch (error) {
      console.error('❌ Error sending order confirmation:', error);
    }
  },

  // Notify admin of new order
  sendAdminOrderNotification: async (orderDetails: any) => {
    try {
      const mailOptions = {
        from: EMAIL_FROM,
        to: ADMIN_EMAIL,
        subject: `New Order #${orderDetails.id} - ${orderDetails.total}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0d9488; padding: 20px;">
              <h2 style="color: white; margin: 0;">New Order Received</h2>
            </div>
            <div style="padding: 20px; background-color: #f9fafb;">
              <h3>Order #${orderDetails.id}</h3>
              <p><strong>Customer:</strong> ${orderDetails.customerName}</p>
              <p><strong>Email:</strong> ${orderDetails.customerEmail}</p>
              <p><strong>Total:</strong> ${orderDetails.total}</p>
              <p><strong>Items:</strong> ${orderDetails.itemCount}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      };

      await sgMail.send({
        to: ADMIN_EMAIL,
        from: EMAIL_FROM,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('✉️ Admin order notification sent');
    } catch (error) {
      console.error('❌ Error sending admin order notification:', error);
    }
  },

  // Send order status update email
  sendOrderStatusUpdate: async (
    userEmail: string, 
    userName: string, 
    orderId: string, 
    status: string, 
    trackingNumber?: string,
    carrier?: string
  ) => {
    try {
      const statusMessages: { [key: string]: { title: string; message: string; color: string } } = {
        'processing': {
          title: 'Order is Being Processed',
          message: 'Your order is being prepared for shipment.',
          color: '#3b82f6'
        },
        'shipped': {
          title: 'Order Has Been Shipped',
          message: 'Your order is on its way!',
          color: '#8b5cf6'
        },
        'in_transit': {
          title: 'Order is In Transit',
          message: 'Your order is currently in transit to your location.',
          color: '#6366f1'
        },
        'out_for_delivery': {
          title: 'Out for Delivery',
          message: 'Your order is out for delivery and will arrive soon!',
          color: '#f59e0b'
        },
        'delivered': {
          title: 'Order Delivered',
          message: 'Your order has been successfully delivered. Thank you for shopping with us!',
          color: '#10b981'
        },
        'cancelled': {
          title: 'Order Cancelled',
          message: 'Your order has been cancelled.',
          color: '#ef4444'
        }
      };

      const statusInfo = statusMessages[status] || {
        title: 'Order Status Updated',
        message: 'Your order status has been updated.',
        color: '#0d9488'
      };

      const mailOptions = {
        from: EMAIL_FROM,
        to: userEmail,
        subject: `${statusInfo.title} - Order #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${statusInfo.color}; padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">${statusInfo.title}</h1>
            </div>
            <div style="padding: 30px; background-color: #f9fafb;">
              <h2 style="color: #0d9488;">Hello ${userName}! 👋</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                ${statusInfo.message}
              </p>
              <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> ${status.replace('_', ' ').toUpperCase()}</p>
                ${trackingNumber ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
                ${carrier ? `<p style="margin: 5px 0;"><strong>Carrier:</strong> ${carrier}</p>` : ''}
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/track-order" style="background-color: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Track Your Order
                </a>
              </div>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                If you have any questions about your order, please contact our support team at support@renewablezmart.com
              </p>
            </div>
            <div style="background-color: #e5e7eb; padding: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                RenewableZmart - Sustainable Energy Marketplace
              </p>
            </div>
          </div>
        `,
      };

      await sgMail.send({
        to: userEmail,
        from: EMAIL_FROM,
        subject: mailOptions.subject,
        html: mailOptions.html,
      });
      console.log('✉️ Order status update email sent');
    } catch (error) {
      console.error('❌ Error sending order status update:', error);
    }
  },

  // Generic send email method
  sendEmail: async (options: { to: string; subject: string; text?: string; html?: string }) => {
    try {
      await sgMail.send({
        to: options.to,
        from: EMAIL_FROM,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      });
      console.log('✉️ Email sent successfully');
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  },
};
