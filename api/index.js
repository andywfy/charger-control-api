const express = require('express');
const axios = require('axios');
const app = express();

// --------------------------
// Render 必须的配置：监听动态端口 + 绑定0.0.0.0
// --------------------------
const PORT = process.env.PORT || 3000;

// 跨域配置
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// --------------------------
// 你的配置信息（Token如果过期了，在这里更新）
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
// 核心：启动充电桩
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
            ? { success: true, message: "操作成功！" } 
            : { success: false, error: response.data?.msg || '未知错误' };

    } catch (error) {
        console.log(`❌ 请求失败：${error.message}`);
        return { success: false, error: error.message };
    }
}

// --------------------------
// 核心：停止充电桩
// --------------------------
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
            ? { success: true, message: "操作成功！" } 
            : { success: false, error: response.data?.msg || '未知错误' };

    } catch (error) {
        console.log(`❌ 请求失败：${error.message}`);
        return { success: false, error: error.message };
    }
}

// --------------------------
// API 接口
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

// --------------------------
// Render 必须的监听配置
// --------------------------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 服务已启动，监听端口：${PORT}`);
    console.log(`🌐 公网访问地址：https://${process.env.RENDER_EXTERNAL_HOSTNAME}`);
});
