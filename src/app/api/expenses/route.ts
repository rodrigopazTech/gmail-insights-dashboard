import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const extractAmount = (text: string) => {
  const match = text.match(/\$\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)/);
  if (match) return parseFloat(match[1].replace(/,/g, ''));
  return null;
};

const getProviderInfo = (from: string, subject: string) => {
  const text = (from + ' ' + subject).toLowerCase();
  
  // Categorization
  const isSub = text.includes('google') || text.includes('icloud') || text.includes('apple') || 
                text.includes('linkedin') || text.includes('replit') || text.includes('diri') || 
                text.includes('coursera') || text.includes('claude') || text.includes('anthropic') ||
                text.includes('suscripción') || text.includes('subscription');

  let name = from.split('<')[0].trim().replace(/"/g, '');
  if (text.includes('google')) name = 'Google Play/One';
  else if (text.includes('apple') || text.includes('icloud')) name = 'iCloud Storage';
  else if (text.includes('aliexpress')) name = 'AliExpress';
  else if (text.includes('amazon')) name = 'Amazon';
  else if (text.includes('uber')) name = 'Uber / Eats';
  else if (text.includes('cinepolis') || text.includes('undostres')) name = 'Cinépolis / UnDosTres';

  return { name, type: isSub ? 'Subscription' : 'Product' };
};

export async function GET() {
  try {
    const query = 'after:2026/01/01 before:2026/12/31 (subject:(compra OR order OR pedido OR factura OR recibo OR invoice OR receipt OR subscription OR suscripción OR pago) OR \\\"pago exitoso\\\" OR \\\"total paid\\\")';
    const listCommand = `gws gmail users messages list --params '{"userId":"me", "q":"${query}", "maxResults": 80}' --format json`;
    
    const { stdout: listOutput } = await execAsync(listCommand);
    const listData = JSON.parse(listOutput);

    if (!listData.messages) {
      return NextResponse.json({ subscriptions: [], products: [] });
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
        
        const { name, type } = getProviderInfo(from, subject);
        const amount = extractAmount(snippet) || extractAmount(subject);
        
        const dateObj = new Date(date);
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

        return {
          id: msg.id,
          provider: name,
          type,
          subject,
          date: dateObj.toISOString(),
          day: dateObj.getDate(),
          month: months[dateObj.getMonth()], // Matches frontend filter
          amount,
          snippet
        };
      } catch (err) {
        return null;
      }
    });

    const allExpenses = (await Promise.all(emailPromises)).filter((e: any) => e !== null);

    const subscriptionsMap: Record<string, any> = {};
    const products: any[] = [];

    allExpenses.forEach(exp => {
      if (exp.type === 'Subscription') {
        // Only keep the most recent payment instance for the subscription table
        if (!subscriptionsMap[exp.provider] || new Date(exp.date) > new Date(subscriptionsMap[exp.provider].date)) {
          subscriptionsMap[exp.provider] = exp;
        }
      } else {
        products.push(exp);
      }
    });

    return NextResponse.json({
      subscriptions: Object.values(subscriptionsMap),
      products: products,
      allExpenses
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
