import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { InstallmentApplication, ApplicationStatus } from '../models/InstallmentApplication';
import { emailService } from '../services/emailService';
import { validatePhoneNumber } from '../utils/phoneValidation';
import { validateEmail } from '../utils/emailValidation';

export const submitInstallmentApplication = async (req: AuthRequest, res: Response) => {
  try {
    const {
      fullName,
      email,
      phone,
      address,
      employmentStatus,
      monthlyIncome,
      organization,
      bvn,
      bvnData,
      totalAmount,
      firstPayment,
      monthlyPayment,
      months,
      cartItems
    } = req.body;

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate required fields
    if (!fullName || !email || !phone || !address || !employmentStatus || !monthlyIncome || !bvn) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Validate BVN format (11 digits)
    if (!/^\d{11}$/.test(bvn)) {
      return res.status(400).json({ message: 'Invalid BVN format. Must be 11 digits.' });
    }

    // Ensure BVN was verified through Paystack
    if (!bvnData || !bvnData.firstName || !bvnData.lastName) {
      return res.status(400).json({ 
        message: 'BVN must be verified through our system before submission. Please verify your BVN in the form.' 
      });
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone, 'Nigeria');
    if (!phoneValidation.isValid) {
      return res.status(400).json({ message: phoneValidation.error || 'Invalid phone number' });
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.error || 'Invalid email address' });
    }

    // Cross-validate submitted name matches BVN name
    const submittedName = fullName.toLowerCase().trim();
    const bvnFullName = `${bvnData.firstName || ''} ${bvnData.middleName || ''} ${bvnData.lastName || ''}`.toLowerCase().trim();
    
    if (submittedName !== bvnFullName) {
      return res.status(400).json({ 
        message: 'Submitted name does not match BVN records. Please use the name verified from your BVN.' 
      });
    }

    const applicationRepo = AppDataSource.getRepository(InstallmentApplication);

    const application = applicationRepo.create({
      userId,
      fullName,
      email,
      phone,
      address,
      employmentStatus,
      monthlyIncome,
      organization,
      bvn,
      bvnData,
      totalAmount,
      firstPayment,
      monthlyPayment,
      months,
      cartItems,
      status: ApplicationStatus.PENDING
    });

    await applicationRepo.save(application);

    // Send notification email to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'vmaktproject@gmail.com';
      await emailService.sendEmail({
        to: adminEmail,
        subject: 'New Installment Application - RenewableZmart',
        text: `New installment application received from ${fullName} (${email}) for ₦${totalAmount.toLocaleString()}.
        
Application Details:
- Name: ${fullName}
- Email: ${email}
- Phone: ${phone}
- Employment: ${employmentStatus}
- Monthly Income: ${monthlyIncome}
- Total Amount: ₦${totalAmount.toLocaleString()}
- First Payment: ₦${firstPayment.toLocaleString()}
- Monthly Payment: ₦${monthlyPayment.toLocaleString()} for ${months} months

Please review and approve/reject this application in the admin dashboard.`,
        html: `<h2>New Installment Application</h2>
        <p>New application received from <strong>${fullName}</strong></p>
        
        <h3>Application Details:</h3>
        <ul>
          <li><strong>Name:</strong> ${fullName}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Address:</strong> ${address}</li>
          <li><strong>Employment:</strong> ${employmentStatus}</li>
          <li><strong>Monthly Income:</strong> ${monthlyIncome}</li>
          ${organization ? `<li><strong>Organization:</strong> ${organization}</li>` : ''}
        </ul>
        
        <h3>Payment Plan:</h3>
        <ul>
          <li><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</li>
          <li><strong>First Payment (50%):</strong> ₦${firstPayment.toLocaleString()}</li>
          <li><strong>Monthly Payment:</strong> ₦${monthlyPayment.toLocaleString()}</li>
          <li><strong>Duration:</strong> ${months} months</li>
        </ul>
        
        <p>Please review and approve/reject this application in the admin dashboard.</p>`
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
    }

    // Send confirmation email to customer
    try {
      await emailService.sendEmail({
        to: email,
        subject: 'Installment Application Received - RenewableZmart',
        text: `Dear ${fullName},

Your Pay Small Small installment application has been received and is under review.

Application Summary:
- Total Amount: ₦${totalAmount.toLocaleString()}
- First Payment (50%): ₦${firstPayment.toLocaleString()}
- Monthly Payment: ₦${monthlyPayment.toLocaleString()} for ${months} months

Our team will review your application and get back to you within 24 hours. Once approved, you'll receive a payment link to make your first payment.

Thank you for choosing RenewableZmart!`,
        html: `<h2>Application Received</h2>
        <p>Dear <strong>${fullName}</strong>,</p>
        
        <p>Your <strong>Pay Small Small</strong> installment application has been received and is under review.</p>
        
        <h3>Application Summary:</h3>
        <ul>
          <li><strong>Total Amount:</strong> ₦${totalAmount.toLocaleString()}</li>
          <li><strong>First Payment (50%):</strong> ₦${firstPayment.toLocaleString()}</li>
          <li><strong>Monthly Payment:</strong> ₦${monthlyPayment.toLocaleString()}</li>
          <li><strong>Duration:</strong> ${months} months</li>
        </ul>
        
        <p>Our team will review your application and get back to you within <strong>24 hours</strong>. Once approved, you'll receive a payment link to make your first payment.</p>
        
        <p>Thank you for choosing RenewableZmart!</p>`
      });
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Installment application submitted successfully. You will be notified within 24 hours.',
      data: {
        applicationId: application.id,
        status: application.status
      }
    });
  } catch (error: any) {
    console.error('Submit installment application error:', error);
    res.status(500).json({ message: 'Failed to submit application', error: error.message });
  }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const applicationRepo = AppDataSource.getRepository(InstallmentApplication);
    const applications = await applicationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });

    res.json({ success: true, data: applications });
  } catch (error: any) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

export const getAllApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applicationRepo = AppDataSource.getRepository(InstallmentApplication);
    const applications = await applicationRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });

    res.json({ success: true, data: applications });
  } catch (error: any) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

export const approveApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const applicationRepo = AppDataSource.getRepository(InstallmentApplication);
    const application = await applicationRepo.findOne({ where: { id }, relations: ['user'] });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== ApplicationStatus.PENDING) {
      return res.status(400).json({ message: 'Application is not pending' });
    }

    application.status = ApplicationStatus.APPROVED;
    application.adminNotes = adminNotes;
    application.approvedBy = req.user?.userId;
    application.approvedAt = new Date();

    await applicationRepo.save(application);

    // Send approval email to customer
    try {
      await emailService.sendEmail({
        to: application.email,
        subject: 'Installment Application Approved! - RenewableZmart',
        text: `Dear ${application.fullName},

Great news! Your Pay Small Small installment application has been APPROVED! 🎉

Payment Details:
- Total Amount: ₦${application.totalAmount.toLocaleString()}
- First Payment (50%): ₦${application.firstPayment.toLocaleString()}
- Monthly Payment: ₦${application.monthlyPayment.toLocaleString()} for ${application.months} months

Next Steps:
1. Log in to your account at ${process.env.FRONTEND_URL || 'http://localhost:3000'}
2. Go to "My Applications" to view your approved application
3. Click "Make First Payment" to complete your 50% down payment
4. Once payment is confirmed, your order will be processed

${adminNotes ? `\nAdmin Notes: ${adminNotes}` : ''}

Thank you for choosing RenewableZmart for your renewable energy needs!`,
        html: `<h2>🎉 Application Approved!</h2>
        <p>Dear <strong>${application.fullName}</strong>,</p>
        
        <p>Great news! Your <strong>Pay Small Small</strong> installment application has been <strong style="color: green;">APPROVED</strong>! 🎉</p>
        
        <h3>Payment Details:</h3>
        <ul>
          <li><strong>Total Amount:</strong> ₦${application.totalAmount.toLocaleString()}</li>
          <li><strong>First Payment (50%):</strong> ₦${application.firstPayment.toLocaleString()}</li>
          <li><strong>Monthly Payment:</strong> ₦${application.monthlyPayment.toLocaleString()}</li>
          <li><strong>Duration:</strong> ${application.months} months</li>
        </ul>
        
        <h3>Next Steps:</h3>
        <ol>
          <li>Log in to your account at <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}">${process.env.FRONTEND_URL || 'http://localhost:3000'}</a></li>
          <li>Go to "My Applications" to view your approved application</li>
          <li>Click "Make First Payment" to complete your 50% down payment</li>
          <li>Once payment is confirmed, your order will be processed</li>
        </ol>
        
        ${adminNotes ? `<p><strong>Admin Notes:</strong> ${adminNotes}</p>` : ''}
        
        <p>Thank you for choosing RenewableZmart for your renewable energy needs!</p>`
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.json({ success: true, message: 'Application approved successfully', data: application });
  } catch (error: any) {
    console.error('Approve application error:', error);
    res.status(500).json({ message: 'Failed to approve application', error: error.message });
  }
};

export const rejectApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const applicationRepo = AppDataSource.getRepository(InstallmentApplication);
    const application = await applicationRepo.findOne({ where: { id } });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== ApplicationStatus.PENDING) {
      return res.status(400).json({ message: 'Application is not pending' });
    }

    application.status = ApplicationStatus.REJECTED;
    application.adminNotes = adminNotes;
    application.rejectedBy = req.user?.userId;
    application.rejectedAt = new Date();

    await applicationRepo.save(application);

    // Send rejection email to customer
    try {
      await emailService.sendEmail({
        to: application.email,
        subject: 'Installment Application Update - RenewableZmart',
        text: `Dear ${application.fullName},

Thank you for applying for our Pay Small Small installment plan.

After careful review, we regret to inform you that we are unable to approve your application at this time.

${adminNotes ? `Reason: ${adminNotes}` : ''}

You can still purchase items using our regular payment options. If you have questions or would like to discuss alternative payment options, please contact our customer support.

Thank you for your interest in RenewableZmart.`,
        html: `<h2>Application Update</h2>
        <p>Dear <strong>${application.fullName}</strong>,</p>
        
        <p>Thank you for applying for our <strong>Pay Small Small</strong> installment plan.</p>
        
        <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
        
        ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ''}
        
        <p>You can still purchase items using our regular payment options. If you have questions or would like to discuss alternative payment options, please contact our customer support.</p>
        
        <p>Thank you for your interest in RenewableZmart.</p>`
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.json({ success: true, message: 'Application rejected', data: application });
  } catch (error: any) {
    console.error('Reject application error:', error);
    res.status(500).json({ message: 'Failed to reject application', error: error.message });
  }
};

export const initializeInstallmentPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { applicationId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const applicationRepo = AppDataSource.getRepository(InstallmentApplication);
    const application = await applicationRepo.findOne({ where: { id: applicationId, userId } });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== ApplicationStatus.APPROVED) {
      return res.status(400).json({ message: 'Application is not approved yet' });
    }

    // Generate payment reference
    const reference = `RZM-INST-${Date.now()}-${applicationId.substring(0, 8)}`;
    
    application.paymentReference = reference;
    await applicationRepo.save(application);

    res.json({
      success: true,
      data: {
        reference,
        amount: application.firstPayment,
        email: application.email,
        applicationId: application.id
      }
    });
  } catch (error: any) {
    console.error('Initialize installment payment error:', error);
    res.status(500).json({ message: 'Failed to initialize payment', error: error.message });
  }
};
