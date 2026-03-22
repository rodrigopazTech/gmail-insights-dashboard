import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Categorization Logic
const getCategory = (from: string, subject: string, labels: string[], snippet: string) => {
  const fromLower = from.toLowerCase();
  const subjectLower = subject.toLowerCase();
  const snippetLower = snippet.toLowerCase();

  // Subscription/Payment detection
  if (
    subjectLower.includes('factura') || 
    subjectLower.includes('recibo') || 
    subjectLower.includes('invoice') || 
    subjectLower.includes('receipt') || 
    subjectLower.includes('pago exitoso') ||
    snippetLower.includes('suscription') ||
    snippetLower.includes('suscripción') ||
    snippetLower.includes('pago mensual')
  ) {
    return 'Subscription';
  }

  if (fromLower.includes('aliexpress') || fromLower.includes('undostres') || fromLower.includes('amazon') || subjectLower.includes('compra') || subjectLower.includes('order')) {
    return 'Orders';
  }
  if (fromLower.includes('computrabajo') || fromLower.includes('linkedin') || subjectLower.includes('empleo') || subjectLower.includes('vacante') || subjectLower.includes('candidato')) {
    return 'Work';
  }
  if (fromLower.includes('google meet') || subjectLower.includes('clase')) {
    return 'Study';
  }
  if (labels.includes('CATEGORY_PROMOTIONS')) {
    return 'Promotions';
  }
  if (labels.includes('CATEGORY_SOCIAL')) {
    return 'Social';
  }
  return 'Other';
};

// Helper to extract amount from snippet
const extractAmount = (text: string) => {
  const match = text.match(/\$\s?(\d+(?:\.\d+)?)/);
  return match ? match[0] : null;
};

export async function GET() {
  try {
    // 1. List messages from the last week (max 20 for performance in this demo)
    const listCommand = `gws gmail users messages list --params '{"userId":"me", "q":"after:2026/03/14", "maxResults": 20}' --format json`;
    const { stdout: listOutput } = await execAsync(listCommand);
    const listData = JSON.parse(listOutput);

    if (!listData.messages || listData.messages.length === 0) {
      return NextResponse.json({ summary: {}, emails: [], stats: { categories: [] } });
    }

    // 2. Fetch details for each message in parallel
    const emailPromises = listData.messages.map(async (msg: any) => {
      try {
        const getCommand = `gws gmail users messages get --params '{"userId":"me", "id":"${msg.id}"}' --format json`;
        const { stdout: getOutput } = await execAsync(getCommand);
        const emailData = JSON.parse(getOutput);

        const headers = emailData.payload.headers;
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';
        const labels = emailData.labelIds || [];
        const category = getCategory(from, subject, labels, emailData.snippet);
        const amount = extractAmount(emailData.snippet);

        return {
          id: msg.id,
          threadId: emailData.threadId,
          from,
          subject,
          date,
          category,
          amount,
          snippet: emailData.snippet,
          labels,
        };
      } catch (err) {
        return null;
      }
    });

    const emails = (await Promise.all(emailPromises)).filter((e: any) => e !== null);

    // 3. Aggregate statistics
    const summary: Record<string, number> = {
      Subscription: 0,
      Orders: 0,
      Work: 0,
      Study: 0,
      Promotions: 0,
      Social: 0,
      Other: 0,
    };

    emails.forEach((email: any) => {
      summary[email.category] = (summary[email.category] || 0) + 1;
    });

    const categoryStats = Object.entries(summary)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      summary,
      emails,
      stats: {
        categories: categoryStats,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error fetching Gmail data:', error);
    return NextResponse.json({ error: 'Failed to fetch Gmail data' }, { status: 500 });
  }
}
