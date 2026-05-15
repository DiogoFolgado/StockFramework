const YH = 'https://query1.finance.yahoo.com';

// Crumb state — cached in Worker memory between requests (resets on cold start ~once/hour)
let crumb = '';
let crumbCookie = '';
let crumbExpiry = 0;

async function refreshCrumb() {
  // Step 1: get a Yahoo session cookie from fc.yahoo.com
  const fc = await fetch('https://fc.yahoo.com/', { redirect: 'follow' });
  const setCookie = fc.headers.get('set-cookie') || '';
  const a3 = (setCookie.match(/A3=[^;,]+/) || [])[0] || '';
  if (!a3) throw new Error('Could not acquire Yahoo session cookie');
  crumbCookie = a3;

  // Step 2: exchange the cookie for a crumb
  const cr = await fetch(`${YH}/v1/test/getcrumb`, {
    headers: {
      Cookie: crumbCookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  });
  if (!cr.ok) throw new Error(`Crumb fetch failed: ${cr.status}`);
  crumb = (await cr.text()).trim();
  crumbExpiry = Date.now() + 55 * 60 * 1000; // refresh after 55 minutes
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function proxyToYahoo(path) {
  const needsCrumb = path.includes('/v10/finance/quoteSummary');

  if (needsCrumb && (!crumb || Date.now() > crumbExpiry)) {
    await refreshCrumb();
  }

  const sep  = path.includes('?') ? '&' : '?';
  const yUrl = YH + path + (needsCrumb ? sep + 'crumb=' + encodeURIComponent(crumb) : '');

  const yRes = await fetch(yUrl, {
    headers: { Cookie: crumbCookie, 'User-Agent': UA, Accept: 'application/json' }
  });

  // Stale crumb — refresh once and retry
  if (yRes.status === 401 && needsCrumb) {
    await refreshCrumb();
    const sep2   = path.includes('?') ? '&' : '?';
    const retry  = await fetch(YH + path + sep2 + 'crumb=' + encodeURIComponent(crumb), {
      headers: { Cookie: crumbCookie, 'User-Agent': UA, Accept: 'application/json' }
    });
    return new Response(await retry.text(), {
      status: retry.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  return new Response(await yRes.text(), {
    status: yRes.status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    const { pathname, search } = new URL(request.url);
    const path = pathname + search;

    // Only allow Yahoo Finance paths
    if (!path.startsWith('/v8/finance/') && !path.startsWith('/v10/finance/') && !path.startsWith('/v1/finance/')) {
      return new Response('Not found', { status: 404, headers: CORS });
    }

    try {
      return await proxyToYahoo(path);
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
  }
};
