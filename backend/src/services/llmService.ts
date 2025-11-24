import OpenAI from 'openai';

const useMockLLM = process.env.USE_MOCK_LLM === 'true' || !process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (!useMockLLM && process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export async function callLLM(prompt: string): Promise<string> {
  if (useMockLLM || !openai) {
    return mockLLMResponse(prompt);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    return response.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('OpenAI API error:', error);
    return mockLLMResponse(prompt);
  }
}

type ParsedEmail = {
  subject?: string
  fromName?: string
  body?: string
}

function extractEmailFields(prompt: string): ParsedEmail {
  const subjectMatch = prompt.match(/Subject:\s*(.+)/i)
  const fromMatch = prompt.match(/From:\s*([^\n<]+)/i)
  const bodyMatch = prompt.match(/Body:\s*([\s\S]+)/i)

  return {
    subject: subjectMatch?.[1]?.trim(),
    fromName: fromMatch?.[1]?.trim(),
    body: bodyMatch?.[1]?.trim(),
  }
}

function buildReplyForEmail(email: ParsedEmail): string {
  const fromName = email.fromName || 'there'
  const subject = email.subject?.toLowerCase() || ''
  const body = email.body?.toLowerCase() || ''

  let middle = `I appreciate the update about "${email.subject || 'your email'}".`

  if (subject.includes('birthday') || body.includes('birthday') || body.includes('happy birthday')) {
    if (body.includes('celebrate') || body.includes('weekend')) {
      middle = `Thank you so much for the birthday wishes! 🎉 I'd love to celebrate this weekend. Let me know what works for you!`
    } else {
      middle = `Thank you so much for the birthday wishes! 🎉 I really appreciate you thinking of me.`
    }
  } else if ((subject.includes('registration') && (subject.includes('confirmation') || body.includes('confirmed'))) || 
             (body.includes('registration') && body.includes('confirmed'))) {
    middle = "Thank you for the confirmation! I'm looking forward to attending. I'll await the schedule and venue details."
  } else if (body.includes('maintenance')) {
    middle = "Thanks for the heads-up about tonight's maintenance. I'll make sure to save my work and log out before the outage window."
  } else if (body.includes('meeting')) {
    middle = 'Thanks for reaching out—those meeting times work for me. Let me know if a different slot is better for you.'
  } else if (body.includes('invoice') || body.includes('payment') || body.includes('billing')) {
    middle = 'I received the invoice and will review the details. Expect confirmation once the payment is scheduled.'
  } else if (body.includes('interview') || subject.includes('application') || body.includes('application')) {
    if (body.includes('availability') || body.includes('available')) {
      middle = "Thank you for the invitation! I'm excited about this opportunity. I'm available next week and will send my preferred time slots shortly."
    } else {
      middle = "Thank you for the invitation. I'm available and happy to confirm a time that works best for the team."
    }
  } else if (body.includes('review') || body.includes('feedback')) {
    middle = "I'll review the materials and share feedback by the requested deadline."
  } else if (body.includes('lunch') || body.includes('celebrate')) {
    middle = "I'd love to join—count me in! Thanks for including me."
  } else if (body.includes('budget')) {
    middle = "I'll go through the budget details and share my approval or questions shortly."
  } else if (body.includes('security') || body.includes('alert')) {
    middle = "Thanks for the security notice. I'll review the account activity right away."
  } else if (subject.includes('job offer') || body.includes('job offer') || body.includes('pleased to offer')) {
    middle = "Thank you for the job offer! I'm excited about this opportunity. I'll review the details and get back to you by the deadline."
  } else if (subject.includes('password reset') || body.includes('password reset') || body.includes('reset your password')) {
    middle = "I received the password reset request. If I didn't request this, I'll ignore it. If I did, I'll follow the instructions."
  } else if (subject.includes('invited') || body.includes('you\'re invited') || body.includes('rsvp')) {
    if (body.includes('rsvp')) {
      middle = "Thank you for the invitation! I'd love to attend. I'll RSVP by the deadline."
    } else {
      middle = "Thank you for the invitation! I appreciate you including me."
    }
  } else if (body.includes('thank you') && (body.includes('donation') || body.includes('contribution'))) {
    middle = "You're very welcome! I'm happy to support your cause. Keep up the great work!"
  } else if (body.includes('collaboration') || body.includes('collaborating') || body.includes('collaborate')) {
    middle = "Thank you for reaching out! I'm interested in learning more about the collaboration opportunity. Let's schedule a call to discuss."
  } else if (subject.includes('deadline') || body.includes('deadline') || body.includes('due tomorrow') || body.includes('due today')) {
    middle = "Thanks for the reminder. I'm aware of the deadline and will make sure to submit on time."
  } else if (subject.includes('welcome') || body.includes('welcome to')) {
    middle = "Thank you for the warm welcome! I'm excited to get started and explore the platform."
  } else if (subject.includes('subscription') && (body.includes('renew') || body.includes('renewal'))) {
    middle = "I received the subscription renewal notice. I'll review the details and update my payment method if needed."
  } else if (subject.includes('support ticket') || body.includes('support ticket') || body.includes('ticket #')) {
    if (body.includes('resolved') || body.includes('fixed')) {
      middle = "Thank you for resolving the issue! I appreciate your help and will let you know if I need any further assistance."
    } else {
      middle = "Thank you for your support. I'll review the ticket details and respond accordingly."
    }
  } else if (body.includes('started following') || body.includes('new follower') || subject.includes('follower')) {
    middle = "Thanks for the notification. I'll check out the profile when I have a chance."
  } else if (body.includes('order') && (body.includes('shipped') || body.includes('delivery'))) {
    middle = "Thank you for the shipping notification! I'll track the package and look forward to receiving it."
  }

  return `Hi ${fromName},\n\n${middle}\n\nBest regards,`
}

function determineCategory(email: ParsedEmail): string {
  const body = email.body?.toLowerCase() || ''
  const subject = email.subject?.toLowerCase() || ''

  if (body.includes('urgent') || body.includes('maintenance') || body.includes('security alert')) {
    return 'urgent'
  }
  if (body.includes('invoice') || body.includes('payment') || body.includes('billing')) {
    return 'finance'
  }
  if (body.includes('meeting') || body.includes('project') || body.includes('interview') || subject.includes('meeting')) {
    return 'work'
  }
  if (body.includes('newsletter') || subject.includes('newsletter')) {
    return 'newsletter'
  }
  if (body.includes('birthday') || body.includes('lunch') || body.includes('celebrate') || body.includes('invited') || subject.includes('invited')) {
    return 'personal'
  }
  if (subject.includes('job offer') || body.includes('job offer') || body.includes('application') || body.includes('interview')) {
    return 'work'
  }
  if (subject.includes('password reset') || body.includes('password reset') || body.includes('security alert')) {
    return 'urgent'
  }
  if (body.includes('order') && (body.includes('shipped') || body.includes('delivery'))) {
    return 'personal'
  }
  if (subject.includes('subscription') || body.includes('subscription')) {
    return 'finance'
  }
  return 'work'
}

function determinePriority(email: ParsedEmail): string {
  const body = email.body?.toLowerCase() || ''
  if (body.includes('urgent') || body.includes('immediately') || body.includes('critical') || body.includes('security')) {
    return 'high'
  }
  if (body.includes('deadline') || body.includes('review by') || body.includes('approval')) {
    return 'medium'
  }
  return 'low'
}

function summarizeEmail(email: ParsedEmail): string {
  const subject = email.subject || 'the email'
  const fromName = email.fromName || 'the sender'
  const body = email.body?.toLowerCase() || ''
  const subjectLower = subject.toLowerCase()

  if (subjectLower.includes('birthday') || body.includes('birthday') || body.includes('happy birthday')) {
    if (body.includes('celebrate') || body.includes('weekend')) {
      return `${fromName} sent birthday wishes and suggested celebrating this weekend.`
    }
    return `${fromName} sent birthday wishes.`
  }
  if ((subjectLower.includes('registration') && (subjectLower.includes('confirmation') || body.includes('confirmed'))) || 
      (body.includes('registration') && body.includes('confirmed'))) {
    return `${fromName} confirmed your registration. They will send schedule and venue details closer to the event date.`
  }
  if (body.includes('maintenance')) {
    return `${fromName} is warning about scheduled maintenance tonight. Systems will be unavailable during the window, so save work and log out beforehand.`
  }
  if (body.includes('new login') || body.includes('secure your account')) {
    return `${fromName} detected a new login to your account from a different device/location. If you don't recognize it, secure the account immediately.`
  }
  if (body.includes('invoice') || body.includes('payment')) {
    return `${fromName} sent an invoice for recent services and requests payment within the stated terms.`
  }
  if (body.includes('meeting') || body.includes('available')) {
    return `${fromName} is trying to schedule a meeting and is asking for your availability.`
  }
  if (body.includes('interview') || subjectLower.includes('application') || body.includes('application')) {
    if (body.includes('availability') || body.includes('available')) {
      return `${fromName} invited you for an interview and is asking for your availability next week.`
    }
    return `${fromName} sent an interview invitation. Respond to confirm your interest and availability.`
  }
  if (body.includes('feedback') || body.includes('review')) {
    return `${fromName} shared materials and needs your review and feedback by the requested deadline.`
  }
  if (subjectLower.includes('job offer') || body.includes('job offer') || body.includes('pleased to offer')) {
    return `${fromName} sent a job offer. Review the details and respond by the deadline.`
  }
  if (subjectLower.includes('password reset') || body.includes('password reset')) {
    return `${fromName} sent a password reset request. Follow the instructions if you requested it, or ignore if you didn't.`
  }
  if (subjectLower.includes('invited') || body.includes('you\'re invited') || body.includes('rsvp')) {
    return `${fromName} sent an event invitation. RSVP by the deadline if you plan to attend.`
  }
  if (body.includes('thank you') && (body.includes('donation') || body.includes('contribution'))) {
    return `${fromName} sent a thank you message for your donation or contribution.`
  }
  if (body.includes('collaboration') || body.includes('collaborating')) {
    return `${fromName} is requesting a collaboration opportunity and wants to schedule a call.`
  }
  if (subjectLower.includes('deadline') || body.includes('deadline') || body.includes('due tomorrow')) {
    return `${fromName} sent a deadline reminder. Complete and submit the work by the specified deadline.`
  }
  if (subjectLower.includes('welcome') || body.includes('welcome to')) {
    return `${fromName} sent a welcome message with resources to get started on the platform.`
  }
  if (subjectLower.includes('subscription') && (body.includes('renew') || body.includes('renewal'))) {
    return `${fromName} sent a subscription renewal notice. Review and update payment method if needed.`
  }
  if (subjectLower.includes('support ticket') || body.includes('support ticket')) {
    if (body.includes('resolved')) {
      return `${fromName} notified you that your support ticket has been resolved.`
    }
    return `${fromName} sent an update about your support ticket.`
  }
  if (body.includes('started following') || body.includes('new follower')) {
    return `${fromName} notified you about a new follower on the social platform.`
  }
  if (body.includes('order') && (body.includes('shipped') || body.includes('delivery'))) {
    return `${fromName} notified you that your order has been shipped with tracking information.`
  }
  return `${fromName} wrote about "${subject}". Review the details and respond as needed.`
}

function extractActionsFromEmail(email: ParsedEmail): string {
  const body = email.body?.toLowerCase() || ''
  const subject = email.subject?.toLowerCase() || ''
  const actions: string[] = []

  if (subject.includes('birthday') || body.includes('birthday') || body.includes('happy birthday')) {
    if (body.includes('celebrate') || body.includes('weekend')) {
      actions.push('Reply with birthday thanks and confirm weekend celebration plans.')
    } else {
      actions.push('Reply with birthday thanks and appreciation.')
    }
  } else if ((subject.includes('registration') && (subject.includes('confirmation') || body.includes('confirmed'))) || 
             (body.includes('registration') && body.includes('confirmed'))) {
    // Registration confirmations typically don't require action, but user might want to acknowledge
    actions.push('Optionally acknowledge the registration confirmation. No action required.')
  } else if (body.includes('log out') || body.includes('save your work')) {
    actions.push('Save work and log out before the maintenance window.')
  } else if (body.includes('secure your account')) {
    actions.push('Secure the account immediately if the login was not you.')
  } else if (body.includes('interview') || subject.includes('application') || body.includes('application')) {
    if (body.includes('availability') || body.includes('available')) {
      actions.push('Reply with your availability for the interview next week.')
    } else {
      actions.push('Respond to the interview invitation and confirm your interest.')
    }
  } else if (body.includes('review') || body.includes('feedback')) {
    actions.push('Review the attached materials and provide feedback by the requested deadline.')
  } else if ((body.includes('schedule') && (body.includes('meeting') || body.includes('available') || body.includes('availability'))) || 
             (body.includes('availability') && (body.includes('meeting') || body.includes('interview'))) ||
             (body.includes('meeting') && (body.includes('schedule') || body.includes('available') || body.includes('time')))) {
    actions.push('Reply with your availability to schedule the meeting/interview.')
  } else if (body.includes('invoice') || body.includes('payment')) {
    actions.push('Process the invoice and arrange payment within the stated terms.')
  } else if (body.includes('survey') || body.includes('feedback')) {
    actions.push('Consider taking the survey to provide feedback.')
  } else if (body.includes('lunch') || body.includes('join')) {
    actions.push('Reply to confirm attendance for the lunch/event.')
  } else if (subject.includes('job offer') || body.includes('job offer') || body.includes('pleased to offer')) {
    actions.push('Review the job offer details and respond by the deadline with your decision.')
  } else if (subject.includes('password reset') || body.includes('password reset')) {
    actions.push('If you requested the reset, follow the instructions. If not, ignore the email and secure your account.')
  } else if (subject.includes('invited') || body.includes('you\'re invited') || body.includes('rsvp')) {
    if (body.includes('rsvp')) {
      actions.push('RSVP to the event by the deadline if you plan to attend.')
    } else {
      actions.push('Optionally acknowledge the invitation.')
    }
  } else if (body.includes('collaboration') || body.includes('collaborating')) {
    actions.push('Respond to express interest and schedule a call to discuss the collaboration.')
  } else if (subject.includes('deadline') || body.includes('deadline') || body.includes('due tomorrow') || body.includes('due today')) {
    actions.push('Complete and submit the work by the deadline, or request an extension if needed.')
  } else if (subject.includes('subscription') && (body.includes('renew') || body.includes('renewal'))) {
    actions.push('Review the renewal details and update payment method if needed before the renewal date.')
  } else if (subject.includes('support ticket') || body.includes('support ticket')) {
    if (body.includes('resolved')) {
      actions.push('Verify the issue is resolved. Reply if you still experience problems.')
    } else {
      actions.push('Review the support ticket and respond with any additional information needed.')
    }
  } else if (body.includes('order') && (body.includes('shipped') || body.includes('delivery'))) {
    actions.push('Track the shipment and prepare to receive the package.')
  }

  if (actions.length === 0) {
    return 'No actions required.'
  }

  return actions.map((action, index) => `${index + 1}. ${action}`).join('\n')
}

function extractUserQuestion(prompt: string): string {
  const match = prompt.match(/User's question:\s*([\s\S]*?)(?:Provide a helpful|$)/i)
  return match ? match[1].trim() : ''
}

function mockLLMResponse(prompt: string): string {
  // Simple mock responses based on prompt content
  const lowerPrompt = prompt.toLowerCase();
  const parsedEmail = extractEmailFields(prompt);
  const userQuestion = extractUserQuestion(prompt).toLowerCase();
  const promptForIntent = userQuestion || lowerPrompt;
  const actionMatch = prompt.match(/\[ACTION:(.+?)\]/i);
  const forcedAction = actionMatch?.[1]?.trim().toLowerCase();

  if (forcedAction) {
    switch (forcedAction) {
      case 'category':
        return determineCategory(parsedEmail);
      case 'actions':
        return extractActionsFromEmail(parsedEmail);
      case 'reply':
        return buildReplyForEmail(parsedEmail);
      case 'summary':
        return summarizeEmail(parsedEmail);
      case 'priority':
        return determinePriority(parsedEmail);
    }
  }

  const wantsReply =
    promptForIntent.includes('reply') ||
    promptForIntent.includes('draft') ||
    promptForIntent.includes('respond');
  if (wantsReply) {
    return buildReplyForEmail(parsedEmail);
  }
  
  if (promptForIntent.includes('categorize') || promptForIntent.includes('category')) {
    return determineCategory(parsedEmail);
  }
  
  if (promptForIntent.includes('action') || promptForIntent.includes('task')) {
    return extractActionsFromEmail(parsedEmail);
  }
  
  if (promptForIntent.includes('summary') || promptForIntent.includes('summarize')) {
    return summarizeEmail(parsedEmail);
  }
  
  if (promptForIntent.includes('priority')) {
    return determinePriority(parsedEmail);
  }
  
  return 'I understand your request. Here is a helpful response based on the email content.';
}




