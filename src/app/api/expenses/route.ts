import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const extractAmount = (text: string) => {
  const match = text.match(/\$\s?(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
};

const getStatus = (subject: string, snippet: string) => {
  const text = (subject + ' ' + snippet).toLowerCase();
  if (text.includes('cancelado') || text.includes('canceled') || text.includes('vayas')) return 'Canceled';
  if (text.includes('problemas') || text.includes('fallido') || text.includes('failed') || text.includes('no realizado') || text.includes('unable to successfully bill')) return 'Failed';
  if (text.includes('confirmado') || text.includes('recibo') || text.includes('exitoso') || text.includes('invoice') || text.includes('receipt')) return 'Active';
  return 'Active';
};

const getProviderName = (from: string, subject: string) => {
  const text = (from + ' ' + subject).toLowerCase();
  if (text.includes('google')) return 'Google Play/One';
  if (text.includes('icloud') || text.includes('apple')) return 'iCloud Storage';
  if (text.includes('hostinger')) return 'Hostinger Hosting';
  if (text.includes('linkedin')) return 'LinkedIn Premium';
  if (text.includes('anthropic') || text.includes('claude')) return 'Claude Pro';
  if (text.includes('diri')) return 'Diri Móvil';
  if (text.includes('coursera')) return 'Coursera Plus';
  return from.split('<')[0].trim();
};

export async function GET() {
  try {
    const query = 'after:2026/01/01 before:2026/12/31 (subject:(suscripción OR subscription OR pago OR factura OR recibo OR invoice OR receipt OR plan OR premium OR confirmación OR membership OR membresía OR canceled OR cancelado) OR "pago exitoso" OR "pago no realizado" OR "unable to bill")';
    const listCommand = `gws gmail users messages list --params '{"userId":"me", "q":"${query}", "maxResults": 60}' --format json`;
    const { stdout: listOutput } = await execAsync(listCommand);
    const listData = JSON.parse(listOutput);

    if (!listData.messages) {
      return NextResponse.json({ subscriptions: [], monthlyStats: [] });
    }

    const emailPromises = listData.messages.map(async (msg: any) => {
      try {
        const getCommand = `gws gmail users messages get --params '{"userId":"me", "id":"${msg.id}"}' --format json`;
        const { stdout: getOutput } = await execAsync(getCommand);
        const emailData = JSON.parse(getOutput);

        const headers = emailData.payload.headers;
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const date = headers.find((h: any) => h.name === 'Date')?.value || '';
        const snippet = emailData.snippet;
        const amount = extractAmount(snippet);
        const status = getStatus(subject, snippet);
        const provider = getProviderName(from, subject);

        return {
          id: msg.id,
          provider,
          subject,
          date: new Date(date).toISOString(),
          day: new Date(date).getDate(),
          month: new Date(date).toLocaleString('es-ES', { month: 'short' }),
          amount,
          status,
          snippet
        };
      } catch (err) {
        return null;
      }
    });

    const expenses = (await Promise.all(emailPromises)).filter((e: any) => e !== null);

    // Detect unique subscriptions and their latest state
    const subsMap: Record<string, any> = {};
    const monthlyTotals: Record<string, number> = {};

    expenses.forEach((exp: any) => {
      // Aggregate monthly stats (only for successful payments)
      if (exp.status === 'Active' && exp.amount) {
        monthlyTotals[exp.month] = (monthlyTotals[exp.month] || 0) + exp.amount;
      }

      // Track sub state (keep the most recent event per provider)
      if (!subsMap[exp.provider] || new Date(exp.date) > new Date(subsMap[exp.provider].date)) {
        subsMap[exp.provider] = exp;
      }
    });

    const sortedMonths = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const monthlyStats = sortedMonths
      .filter(m => monthlyTotals[m] !== undefined)
      .map(m => ({
        name: m.toUpperCase(),
        total: monthlyTotals[m],
        forecast: m === 'jun' ? (monthlyTotals[m] || 0) + 2500 : null // Projection for Google hike
      }));

    return NextResponse.json({
      subscriptions: Object.values(subsMap),
      monthlyStats,
      totalSpent: Object.values(monthlyTotals).reduce((a, b) => a + b, 0).toFixed(2),
      burnRate: monthlyTotals['mar'] || 0 // Current monthly cost
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}
