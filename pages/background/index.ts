const GITHUB_CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';
const GITHUB_CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'EXCHANGE_GITHUB_CODE') {
        exchangeCodeForToken(message.code)
            .then((token) => {
                if (token) {
                    // 存储token
                    chrome.storage.local.set({ githubToken: token }, () => {
                        chrome.tabs.sendMessage(sender.tab!.id!, { type: 'GITHUB_CONNECTED' });
                        sendResponse({ success: true });
                    });
                } else {
                    sendResponse({ success: false });
                }
            })
            .catch(() => sendResponse({ success: false }));
        return true; // 表示我们会异步发送响应
    }
});

// 添加用于获取存储的令牌的函数
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_TOKEN') {
        chrome.storage.local.get([`${message.system.toLowerCase()}Token`], (result) => {
            sendResponse({ token: result[`${message.system.toLowerCase()}Token`] });
        });
        return true; // 表示我们会异步发送响应
    }
});

async function exchangeCodeForToken(code: string): Promise<string | null> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            client_id: GITHUB_CLIENT_ID,
            client_secret: GITHUB_CLIENT_SECRET,
            code: code,
        }),
    });

    if (response.ok) {
        const data = await response.json();
        return data.access_token;
    }
    return null;
}