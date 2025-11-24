import { getDatabase } from '../db/database';

export function initMockInbox(): void {
  const db = getDatabase();
  const insert = db.prepare(`
    INSERT INTO emails (subject, from_email, from_name, to_email, body, date, read, category, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const emails = [
    {
      subject: "Meeting Request: Q4 Planning Discussion",
      from_email: "sarah.johnson@company.com",
      from_name: "Sarah Johnson",
      to_email: "you@example.com",
      body: "Hi,\n\nI'd like to schedule a meeting to discuss our Q4 planning strategy. Are you available this Thursday at 2 PM?\n\nLet me know what works for you.\n\nBest regards,\nSarah",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Project Update: Website Redesign Status",
      from_email: "mike.chen@designstudio.com",
      from_name: "Mike Chen",
      to_email: "you@example.com",
      body: "Hello,\n\nThe website redesign is progressing well. We've completed the homepage mockups and are ready for your review. Can you take a look at the attached files and provide feedback by Friday?\n\nThanks!\nMike",
      date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Invoice #INV-2024-001",
      from_email: "billing@services.com",
      from_name: "Billing Department",
      to_email: "you@example.com",
      body: "Dear Customer,\n\nPlease find attached invoice #INV-2024-001 for services rendered in November 2024.\n\nPayment is due within 30 days.\n\nThank you for your business.\n\nBilling Department",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      read: 1,
      category: null,
      priority: null
    },
    {
      subject: "Re: Budget Approval Needed",
      from_email: "finance@company.com",
      from_name: "Finance Team",
      to_email: "you@example.com",
      body: "Hi,\n\nFollowing up on the budget request. We need your approval for the marketing campaign budget by end of week.\n\nPlease review the attached proposal and let us know if you have any questions.\n\nRegards,\nFinance Team",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Welcome to Our Newsletter!",
      from_email: "newsletter@technews.com",
      from_name: "Tech News",
      to_email: "you@example.com",
      body: "Thank you for subscribing to our newsletter!\n\nThis week's highlights:\n- New AI developments\n- Tech industry trends\n- Product launches\n\nRead more on our website.\n\nTech News Team",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Urgent: Server Maintenance Tonight",
      from_email: "it@company.com",
      from_name: "IT Department",
      to_email: "you@example.com",
      body: "URGENT NOTICE\n\nWe will be performing critical server maintenance tonight from 11 PM to 2 AM. The system will be unavailable during this time.\n\nPlease save your work and log out before 11 PM.\n\nIT Department",
      date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Re: Follow-up on Your Application",
      from_email: "hr@startup.com",
      from_name: "HR Team",
      to_email: "you@example.com",
      body: "Hello,\n\nThank you for your interest in the Software Engineer position. We'd like to invite you for a second round interview.\n\nPlease let us know your availability for next week.\n\nBest regards,\nHR Team",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      read: 1,
      category: null,
      priority: null
    },
    {
      subject: "Your Order Has Shipped!",
      from_email: "orders@onlinestore.com",
      from_name: "Online Store",
      to_email: "you@example.com",
      body: "Great news! Your order #12345 has been shipped.\n\nTracking number: TRACK123456789\n\nExpected delivery: December 15, 2024\n\nThank you for your purchase!\n\nOnline Store Team",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: 1,
      category: null,
      priority: null
    },
    {
      subject: "Team Lunch This Friday?",
      from_email: "colleague@company.com",
      from_name: "Alex Martinez",
      to_email: "you@example.com",
      body: "Hey!\n\nA few of us are planning to grab lunch this Friday at the new Italian place downtown. Want to join us?\n\nLet me know!\n\nAlex",
      date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Security Alert: New Login Detected",
      from_email: "security@account.com",
      from_name: "Security Team",
      to_email: "you@example.com",
      body: "We detected a new login to your account from a new device.\n\nLocation: San Francisco, CA\nDevice: Chrome on Windows\nTime: Today at 3:45 PM\n\nIf this was you, no action is needed. If not, please secure your account immediately.\n\nSecurity Team",
      date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Conference Registration Confirmation",
      from_email: "events@techconf.com",
      from_name: "Tech Conference 2024",
      to_email: "you@example.com",
      body: "Thank you for registering for Tech Conference 2024!\n\nYour registration is confirmed. We'll send you more details about the schedule and venue closer to the event date.\n\nSee you there!\n\nConference Team",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      read: 1,
      category: null,
      priority: null
    },
    {
      subject: "Re: Contract Review",
      from_email: "legal@company.com",
      from_name: "Legal Department",
      to_email: "you@example.com",
      body: "Hi,\n\nI've reviewed the contract and made some suggested changes. Please see the attached document with my comments.\n\nWe should discuss these points before finalizing. Are you available for a call this week?\n\nBest,\nLegal Team",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Happy Birthday!",
      from_email: "friend@email.com",
      from_name: "Jessica",
      to_email: "you@example.com",
      body: "Happy Birthday! 🎉\n\nHope you have an amazing day! Let's celebrate this weekend!\n\nJessica",
      date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      read: 1,
      category: null,
      priority: null
    },
    {
      subject: "Reminder: Team Standup Tomorrow",
      from_email: "manager@company.com",
      from_name: "David Kim",
      to_email: "you@example.com",
      body: "Just a reminder that we have our weekly team standup tomorrow at 9 AM.\n\nPlease come prepared with updates on your current projects.\n\nThanks,\nDavid",
      date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Survey: How was your experience?",
      from_email: "feedback@service.com",
      from_name: "Customer Feedback",
      to_email: "you@example.com",
      body: "Hi there,\n\nWe'd love to hear about your recent experience with our service. Could you take a quick 2-minute survey?\n\nYour feedback helps us improve!\n\nThank you,\nCustomer Feedback Team",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Job Offer: Software Engineer Position",
      from_email: "hr@techcorp.com",
      from_name: "HR Department",
      to_email: "you@example.com",
      body: "Congratulations!\n\nWe are pleased to offer you the Software Engineer position at TechCorp. The offer includes a competitive salary, health benefits, and stock options.\n\nPlease let us know your decision by next Friday.\n\nWe're excited to have you join our team!\n\nBest regards,\nHR Department",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Password Reset Request",
      from_email: "noreply@account.com",
      from_name: "Account Security",
      to_email: "you@example.com",
      body: "We received a request to reset your password.\n\nIf you made this request, click the link below to reset your password:\n\nhttps://account.com/reset?token=abc123\n\nThis link will expire in 24 hours.\n\nIf you didn't request this, please ignore this email.\n\nAccount Security Team",
      date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "You're Invited: Company Holiday Party",
      from_email: "events@company.com",
      from_name: "Events Committee",
      to_email: "you@example.com",
      body: "You're invited to our annual holiday party!\n\nDate: December 20, 2024\nTime: 6:00 PM - 11:00 PM\nLocation: Grand Ballroom, Downtown Hotel\n\nPlease RSVP by December 10th. We can't wait to celebrate with you!\n\nEvents Committee",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Thank You for Your Donation",
      from_email: "donations@charity.org",
      from_name: "Charity Foundation",
      to_email: "you@example.com",
      body: "Dear Supporter,\n\nThank you so much for your generous donation of $100. Your contribution helps us continue our mission to support those in need.\n\nWe truly appreciate your kindness and support.\n\nWith gratitude,\nCharity Foundation Team",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      read: 1,
      category: null,
      priority: null
    },
    {
      subject: "Collaboration Request: Design Project",
      from_email: "partner@designco.com",
      from_name: "Sarah Williams",
      to_email: "you@example.com",
      body: "Hi,\n\nI'm reaching out to see if you'd be interested in collaborating on a new design project. We're looking for someone with your expertise to help us create something amazing.\n\nWould you be available for a quick call this week to discuss?\n\nLooking forward to hearing from you!\n\nSarah",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Deadline Reminder: Project Proposal Due Tomorrow",
      from_email: "project@company.com",
      from_name: "Project Manager",
      to_email: "you@example.com",
      body: "Friendly reminder: Your project proposal is due tomorrow by 5 PM.\n\nPlease make sure to submit it through the portal. If you need an extension, let me know as soon as possible.\n\nThanks,\nProject Manager",
      date: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Welcome to Our Platform!",
      from_email: "welcome@platform.com",
      from_name: "Platform Team",
      to_email: "you@example.com",
      body: "Welcome to our platform!\n\nWe're thrilled to have you join our community. Here are some resources to get you started:\n\n- Getting Started Guide\n- Video Tutorials\n- Community Forum\n\nIf you have any questions, don't hesitate to reach out!\n\nHappy exploring!\n\nPlatform Team",
      date: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      read: 1,
      category: null,
      priority: null
    },
    {
      subject: "Subscription Renewal Notice",
      from_email: "billing@service.com",
      from_name: "Billing Team",
      to_email: "you@example.com",
      body: "Your subscription is set to renew on December 31, 2024.\n\nCurrent plan: Premium Monthly\nRenewal amount: $29.99\n\nYour payment method on file will be charged automatically. If you'd like to update your payment method or cancel, please do so before the renewal date.\n\nThank you for being a valued customer!\n\nBilling Team",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    },
    {
      subject: "Support Ticket #12345 - Resolved",
      from_email: "support@service.com",
      from_name: "Support Team",
      to_email: "you@example.com",
      body: "Hello,\n\nYour support ticket #12345 has been resolved. The issue with your account access has been fixed.\n\nIf you're still experiencing any problems, please reply to this email and we'll be happy to help.\n\nThank you for your patience!\n\nSupport Team",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: 1,
      category: null,
      priority: null
    },
    {
      subject: "New Follower on Social Platform",
      from_email: "notifications@social.com",
      from_name: "Social Platform",
      to_email: "you@example.com",
      body: "John Smith started following you!\n\nView their profile: https://social.com/johnsmith\n\nYou can manage your notification preferences in your account settings.\n\nSocial Platform Team",
      date: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      read: 0,
      category: null,
      priority: null
    }
  ];
  
  const insertMany = db.transaction((emails: typeof emails) => {
    for (const email of emails) {
      insert.run(
        email.subject,
        email.from_email,
        email.from_name,
        email.to_email,
        email.body,
        email.date,
        email.read,
        email.category,
        email.priority
      );
    }
  });
  
  insertMany(emails);
  console.log(`✅ Initialized ${emails.length} mock emails`);
}











