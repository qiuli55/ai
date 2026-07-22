const fs = require("fs");
const path = require("path");
const http = require("http");
const axios = require("axios");

// ============配置区域============
const ARK_API_KEY = "YOUR_ARK_API_KEY";
const CHAT_MODEL_ID = "ep-doubao-seed-2-1-pro-260628";
const IMAGE_MODEL_ID = "doubao-seedream-5-0-pro-260628";
const PORT = 7860;
// =================================

const SYSTEM_PROMPT = `
学习附带的历史聊天记录，模仿双方语气、称呼、说话习惯交流。
不要主动复述历史记录，自然聊天。
用户消息以「画图：」开头，则生成图片。
`;

// 读取本地聊天记录
function loadChatHistory() {
    try {
        const txt = fs.readFileSync(path.join(__dirname, "chat_history.txt"), "utf8");
        return `【历史聊天样本】\n${txt}`;
    } catch (err) {
        return "暂无聊天记录";
    }
}
const historyContent = loadChatHistory();

// 大模型对话请求
async function chatRequest(messages) {
    const res = await axios.post(
        "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
        {
            model: CHAT_MODEL_ID,
            messages: messages,
            temperature: 0.8
        },
        {
            headers: {
                Authorization: `Bearer ${ARK_API_KEY}`,
                "Content-Type": "application/json"
            },
            timeout: 60000
        }
    );
    return res.data.choices[0].message.content;
}

// 文生图
async function drawImage(prompt) {
    const res = await axios.post(
        "https://ark.cn-beijing.volces.com/api/v3/images/generations",
        {
            model: IMAGE_MODEL_ID,
            prompt: prompt,
            size: "2k",
            watermark: false
        },
        {
            headers: {
                Authorization: `Bearer ${ARK_API_KEY}`,
                "Content-Type": "application/json"
            },
            timeout: 120000
        }
    );
    return res.data.data[0].url;
}

// 启动HTTP服务
const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json;charset=utf-8");

    // 返回前端页面
    if (req.url === "/" && req.method === "GET") {
        res.setHeader("Content-Type", "text/html;charset=utf-8");
        const html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
        return res.end(html);
    }

    // 聊天接口
    if (req.url === "/api/chat" && req.method === "POST") {
        let body = "";
        for await (const chunk of req) body += chunk;
        const data = JSON.parse(body);
        const userMsg = data.message;
        const history = data.history;

        try {
            // 绘图指令
            if (userMsg.startsWith("画图：")) {
                const picPrompt = userMsg.replace("画图：", "").trim();
                const imgUrl = await drawImage(picPrompt);
                return res.end(JSON.stringify({ reply: `✨![图片](${imgUrl})` }));
            }

            // 文字对话
            const messages = [
                { role: "system", content: SYSTEM_PROMPT + "\n" + historyContent }
            ];
            for (const [u, a] of history) {
                messages.push({ role: "user", content: u });
                messages.push({ role: "assistant", content: a });
            }
            messages.push({ role: "user", content: userMsg });
            const reply = await chatRequest(messages);
            return res.end(JSON.stringify({ reply }));
        } catch (e) {
            return res.end(JSON.stringify({ reply: `请求出错：${e.message}` }));
        }
    }

    res.statusCode = 404;
    res.end(JSON.stringify({ reply: "接口不存在" }));
});

server.listen(PORT, () => {
    console.log(`✅ 服务启动成功！浏览器打开：http://127.0.0.1:${PORT}`);
});