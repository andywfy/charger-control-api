const axios = require('axios');

const CONFIG = {
    token: "179fcc11-c075-43fa-979b-5e9be8e732c3",
    cookie: "token=179fcc11-c075-43fa-979b-5e9be8e732c3; MOBILE=306b8151-8d38-4104-a239-c434038f33f7",
    id: "79490",
    imei: "862741082710969",
    runUrl: "https://cdz.xiaoyouwulian.com/web-wechart/agent/charge/equipment/net/remote/send/run",
    stopUrl: "https://cdz.xiaoyouwulian.com/web-wechart/agent/charge/equipment/net/remote/send/stop"
};

async function sendRunRequest(port, duration) {
    const timestamp = Date.now();
    try {
        const response = await axios.post(
            `${CONFIG.runUrl}?t=${timestamp}`,
            new URLSearchParams({
                t: timestamp.toString(),
                id: CONFIG.id,
                cd: CONFIG.imei,
                port: port.toString(),
                time: duration.toString(),
                token: CONFIG.token
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': CONFIG.cookie,
                    'token': CONFIG.token
                },
                timeout: 15000
            }
        );
        return response.data && response.data.code === 200 
            ? { success: true } 
            : { success: false, error: response.data?.msg || '未知错误' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function sendStopRequest(port) {
    const timestamp = Date.now();
    try {
        const response = await axios.post(
            `${CONFIG.stopUrl}?t=${timestamp}`,
            new URLSearchParams({
                t: timestamp.toString(),
                id: CONFIG.id,
                cd: CONFIG.imei,
                port: port.toString(),
                time: "",
                token: CONFIG.token
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': CONFIG.cookie,
                    'token': CONFIG.token
                },
                timeout: 15000
            }
        );
        return response.data && response.data.code === 200 
            ? { success: true } 
            : { success: false, error: response.data?.msg || '未知错误' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Vercel 原生函数写法（绕过所有express和跨域问题）
module.exports = async (req, res) => {
    // 强制设置跨域头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { method, url, body } = req;

        if (url === '/' && method === 'GET') {
            return res.status(200).json({ message: '✅ 充电桩控制服务运行正常！' });
        }

        if (url === '/start' && method === 'POST') {
            const { port, duration } = JSON.parse(body || '{}');
            const result = await sendRunRequest(port, duration);
            return res.status(200).json(result);
        }

        if (url === '/stop' && method === 'POST') {
            const { port } = JSON.parse(body || '{}');
            const result = await sendStopRequest(port);
            return res.status(200).json(result);
        }

        return res.status(404).json({ error: 'Not Found' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
