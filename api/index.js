const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// --------------------------
// 填入你现在有效的Token和Cookie
// --------------------------
const CONFIG = {
    token: "179fcc11-c075-43fa-979b-5e9be8e732c3",
    cookie: "token=179fcc11-c075-43fa-979b-5e9be8e732c3; MOBILE=306b8151-8d38-4104-a239-c434038f33f7",
    id: "79490",
    imei: "862741082710969",
    runUrl: "https://cdz.xiaoyouwulian.com/web-wechart/agent/charge/equipment/net/remote/send/run",
    stopUrl: "https://cdz.xiaoyouwulian.com/web-wechart/agent/charge/equipment/net/remote/send/stop"
};

// --------------------------
// 核心控制函数
// --------------------------
async function sendRunRequest(port, duration) {
    const timestamp = Date.now();
    console.log(`🚀 启动端口${port}，时长${duration}分钟`);
    
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

        console.log(`📡 服务器返回：${JSON.stringify(response.data)}`);
        return response.data && response.data.code === 200 
            ? { success: true } 
            : { success: false, error: response.data?.msg || '未知错误' };

    } catch (error) {
        console.log(`❌ 请求失败：${error.message}`);
        return { success: false, error: error.message };
    }
}

async function sendStopRequest(port) {
    const timestamp = Date.now();
    console.log(`🛑 停止端口${port}`);
    
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

        console.log(`📡 服务器返回：${JSON.stringify(response.data)}`);
        return response.data && response.data.code === 200 
            ? { success: true } 
            : { success: false, error: response.data?.msg || '未知错误' };

    } catch (error) {
        console.log(`❌ 请求失败：${error.message}`);
        return { success: false, error: error.message };
    }
}

// --------------------------
// API接口
// --------------------------
app.get('/', (req, res) => {
    res.send('✅ 充电桩控制服务运行正常！');
});

app.post('/api/start', async (req, res) => {
    const { port, duration } = req.body;
    const result = await sendRunRequest(port, duration);
    res.json(result);
});

app.post('/api/stop', async (req, res) => {
    const { port } = req.body;
    const result = await sendStopRequest(port);
    res.json(result);
});

// Vercel云函数导出
module.exports = app;
