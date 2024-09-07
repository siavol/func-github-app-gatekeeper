import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function refreshToken(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    const refreshToken = request.query.get('refresh-token');

    const clientId = process.env.GITHUB_APP_CLIENT_ID
    const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET
    const grantType = 'refresh_token'
    const url = `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}&refresh_token=${refreshToken}`
    console.log('POST ' + url)
    const response = await fetch(url, {
      method: 'POST',
    })

    if (!response.ok) {
        const details = await response.json()
        return {
            status: 500,
            body: JSON.stringify({
                error: 'GitHub request failed',
                details
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
}

app.http('refreshToken', {
    methods: ['GET', 'POST'],
    authLevel: 'function',
    handler: refreshToken
});
