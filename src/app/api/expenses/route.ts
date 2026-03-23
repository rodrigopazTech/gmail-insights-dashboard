import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const extractAmount = (text: string) => {
  const match = text.match(/\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  return null;
};

const getProviderInfo = (from: string, subject: string, snippet: string) => {
  const text = (from + ' ' + subject + ' ' + snippet).toLowerCase();
  
  // Strict Marketing Filter: If it sounds like an ad, it's not a subscription
  const isMarketing = text.includes('vibe coding') || text.includes('introducing') || 
                      text.includes('tomorrow:') || text.includes('updates') || 
                      text.includes('oferta') || text.includes('try for free');

  if (isMarketing && !text.includes('recibo') && !text.includes('pago')) return { name: null, type: 'Marketing' };

  // E-Commerce Providers
  if (text.includes('aliexpress')) return { name: 'AliExpress', type: 'Product' };
  if (text.includes('undostres')) return { name: 'UnDosTres (Cinépolis)', type: 'Product' };
  if (text.includes('amazon') && (text.includes('order') || text.includes('pedido'))) return { name: 'Amazon', type: 'Product' };
  if (text.includes('uber') && text.includes('receipt')) return { name: 'Uber / Eats', type: 'Product' };
  
  // Subscription Providers (Confirmed)
  if (text.includes('google play') || text.includes('google one')) return { name: 'Google Play/One', type: 'Subscription' };
  if (text.includes('icloud') || text.includes('apple storage')) return { name: 'iCloud Storage', type: 'Subscription' };
  if (text.includes('linkedin') && text.includes('pago')) return { name: 'LinkedIn Premium', type: 'Subscription' };
  if (text.includes('diri') && (text.includes('pago') || text.includes('recarga'))) return { name: 'Diri Móvil', type: 'Subscription' };

  return { name: from.split('<')[0].trim().replace(/"/g, ''), type: 'Other' };
};

export async function GET() {
  try {
    const query = 'after:2026/01/01 before:2026/12/31 (subject:(compra OR order OR pedido OR factura OR recibo OR invoice OR receipt OR subscription OR suscripción OR pago) OR \\\"pago exitoso\\\" OR \\\"total paid\\\")';
    const listCommand = `gws gmail users messages list --params '{"userId":"me", "q":"${query}", "maxResults": 100}' --format json`;
    const { stdout: listOutput } = await execAsync(listCommand);
    const listData = JSON.parse(listOutput);

    if (!listData.messages) return NextResponse.json({ subscriptions: [], products: [] });

    const emailPromises = listData.messages.map(async (msg: any) => {
      try {
        const getCommand = `gws gmail users messages get --params "{\\\"userId\\\":\\\"me\\\", \\\"id\\\":\\\"${msg.id}\\\"}" --format json`;
        const { stdout: getOutput } = await execAsync(getCommand);
        const emailData = JSON.parse(getOutput);

        const from = emailData.payload.headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
        const subject = emailData.payload.headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const date = emailData.payload.headers.find((h: any) => h.name === 'Date')?.value || '';
        
        const { name, type } = getProviderInfo(from, subject, emailData.snippet);
        if (type === 'Marketing' || !name) return null;

        const amount = extractAmount(emailData.snippet) || extractAmount(subject);
        const dateObj = new Date(date);
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

        return {
          id: msg.id,
          provider: name,
          type,
          subject,
          date: dateObj.toISOString(),
          day: dateObj.getDate(),
          month: months[dateObj.getMonth()],
          amount,
          status: (subject.toLowerCase().includes('problema') || subject.toLowerCase().includes('fallido')) ? 'Failed' : 'Active'
        };
      } catch (err) { return null; }
    });

    const allExpenses = (await Promise.all(emailPromises)).filter((e: any) => e !== null);

    const subscriptionsMap: Record<string, any> = {};
    const products: any[] = [];

    allExpenses.forEach(exp => {
      if (exp.type === 'Subscription') {
        if (!subscriptionsMap[exp.provider] || new Date(exp.date) > new Date(subscriptionsMap[exp.provider].date)) {
          subscriptionsMap[exp.provider] = exp;
        }
      } else {
        products.push(exp);
      }
    });

    return NextResponse.json({
      subscriptions: Object.values(subscriptionsMap),
      products: products
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
