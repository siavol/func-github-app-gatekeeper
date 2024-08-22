import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function exchangeCodeForToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const code = request.query.get('code');

    const clientId = process.env.GITHUB_APP_CLIENT_ID
    const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET
    const url = `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`
    console.log('POST ' + url)
    const response = await fetch(url, {
      method: 'POST',
    })
    
    if (!response.ok) {
        const details = await response.json()
        return {
            status: 500,
            body: JSON.stringify({
                error: 'GitHub request failed'
            })
        }
    }
      
    const resText = await response.text();
    const tokenData = resText
        .split('&')
        .map(i => i.split('=', 2))
        .reduce((acc, [key, val]) => {
            acc[key]=val; 
            return acc
        }, {})
  

    return { body: JSON.stringify(tokenData) };
};

app.http('exchangeCodeForToken', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: exchangeCodeForToken
});
