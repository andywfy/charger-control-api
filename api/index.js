const express = require('express');
const axios = require('axios');
const app = express();

// 解决 Vercel 跨域 + 403 错误
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// 你的配置信息
const CONFIG = {
    token: "179fcc11-c075-43fa-979b-5e9be8e732c3",
    cookie: "token=179fcc11-c075-43fa-979b-5e9be8e732c3; MOBILE=306b8151-8d38-4104-a239-c434038f33f7",
    id: "79490",
    imei: "862741082710969",
    runUrl: "https://cdz.xiaoyouwulian.com/web-wechart/agent/charge/equipment/net/remote/send/run",
    stopUrl: "https://cdz.xiaoyouwulian.com/web-wechart/agent/charge/equipment/net/remote/send/stop"
};

// 启动充电桩
async function sendRunRequest(port, duration) {
    try {
        const res = await axios.post(CONFIG.runUrl, new URLSearchParams({
            t: Date.now().toString(),
            id: CONFIG.id,
            cd: CONFIG.imei,
            port: port+'',
            time: duration+'',
            token: CONFIG.token
        }), { headers: { Cookie: CONFIG.cookie, token: CONFIG.token }, timeout: 15000 });
        return res.data?.code === 200 ? { success:true } : { success:false, error:res.data?.msg };
    } catch (e) { return { success:false, error:e.message }; }
}

// 停止充电桩
async function sendStopRequest(port) {
    try {
        const res = await axios.post(CONFIG.stopUrl, new URLSearchParams({
            t: Date.now().toString(),
            id: CONFIG.id,
            cd: CONFIG.imei,
            port: port+'',
            time: "",
            token: CONFIG.token
        }), { headers: { Cookie: CONFIG.cookie, token: CONFIG.token }, timeout: 15000 });
        return res.data?.code === 200 ? { success:true } : { success:false, error:res.data?.msg };
    } catch (e) { return { success:false, error:e.message }; }
}

// API 接口
app.get('/', (req,res) => res.send('✅ 服务正常运行'));
app.post('/api/start', async (req,res) => res.json(await sendRunRequest(req.body.port, req.body.duration)));
app.post('/api/stop', async (req,res) => res.json(await sendStopRequest(req.body.port)));

// Vercel 必须导出
module.exports = app;
