// 小诺 NOVA 数字人对话 JS

// ===============================
// 数字人 SVG 头像（基础模板，每次使用前会生成唯一 ID）
// ===============================
const AVATAR_SVG_TEMPLATE = `
<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="{P}skinGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe8da" />
      <stop offset="1" stop-color="#f5c6a8" />
    </linearGradient>
    <linearGradient id="{P}hairGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e0f2fe" />
      <stop offset="0.45" stop-color="#a5f3fc" />
      <stop offset="1" stop-color="#c084fc" />
    </linearGradient>
    <linearGradient id="{P}clothGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e1b4b" />
      <stop offset="0.5" stop-color="#312e81" />
      <stop offset="1" stop-color="#4c1d95" />
    </linearGradient>
    <radialGradient id="{P}irisGrad" cx="50%" cy="40%" r="60%">
      <stop offset="0" stop-color="#22d3ee" />
      <stop offset="1" stop-color="#7c3aed" />
    </radialGradient>
    <radialGradient id="{P}coreGrad" cx="50%" cy="40%" r="65%">
      <stop offset="0" stop-color="#67e8f9" />
      <stop offset="0.6" stop-color="#22d3ee" />
      <stop offset="1" stop-color="#7c3aed" />
    </radialGradient>
    <linearGradient id="{P}holoGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(34,211,238,0.55)" />
      <stop offset="1" stop-color="rgba(34,211,238,0)" />
    </linearGradient>
    <filter id="{P}glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <ellipse class="holo-base" cx="120" cy="296" rx="90" ry="18" fill="url(#{P}holoGrad)" />

  <g class="char" transform-origin="120px 280px">
    <g class="char-body">
      <path class="arm arm-left" d="M78 235 Q56 270 72 300" stroke="url(#{P}clothGrad)" stroke-width="17" stroke-linecap="round" fill="none" />
      <path class="arm arm-right" d="M162 235 Q184 270 168 300" stroke="url(#{P}clothGrad)" stroke-width="17" stroke-linecap="round" fill="none" />
      <path class="torso" d="M120 198 C80 198, 58 232, 62 284 Q120 312, 178 284 C182 232, 160 198, 120 198 Z" fill="url(#{P}clothGrad)" />
      <path class="collar" d="M102 204 Q120 224 138 204" stroke="#22d3ee" stroke-width="3" fill="none" opacity="0.85" filter="url(#{P}glow)" />
      <path class="neon-line" d="M74 230 L60 218" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" opacity="0.85" filter="url(#{P}glow)" />
      <path class="neon-line" d="M166 230 L180 218" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" opacity="0.85" filter="url(#{P}glow)" />
      <circle class="energy-core" cx="120" cy="252" r="14" fill="url(#{P}coreGrad)" filter="url(#{P}glow)" />
    </g>

    <rect class="neck" x="108" y="176" width="24" height="34" rx="11" fill="#f0cdb8" />

    <g class="char-head" transform-origin="120px 182px">
      <path class="hair-back" d="M120 40 C52 40, 42 114, 58 156 C68 186, 90 192, 120 190 C150 192, 172 186, 182 156 C198 114, 188 40, 120 40 Z" fill="url(#{P}hairGrad)" />
      <ellipse class="face" cx="120" cy="114" rx="58" ry="66" fill="url(#{P}skinGrad)" />
      <path class="hair-front" d="M60 110 C56 58, 88 36, 120 36 C152 36, 184 58, 180 110 C170 88, 152 80, 142 94 C134 80, 106 80, 98 94 C88 80, 70 88, 60 110 Z" fill="url(#{P}hairGrad)" opacity="0.96" />

      <path class="brow brow-l" d="M82 92 Q96 86 110 92" stroke="#7c5cff" stroke-width="4" fill="none" stroke-linecap="round" />
      <path class="brow brow-r" d="M130 92 Q144 86 158 92" stroke="#7c5cff" stroke-width="4" fill="none" stroke-linecap="round" />

      <g class="eye eye-l" transform-box="fill-box" transform-origin="center">
        <ellipse class="eye-outer" cx="96" cy="110" rx="14" ry="17" fill="#0b1020" />
        <ellipse class="iris" cx="96" cy="110" rx="10" ry="12" fill="url(#{P}irisGrad)" />
        <circle class="pupil" cx="96" cy="112" r="6" fill="#08080f" />
        <circle class="eye-hl" cx="100" cy="105" r="3.5" fill="#ffffff" />
        <circle class="eye-hl2" cx="92" cy="113" r="2" fill="#ffffff" opacity="0.7" />
      </g>
      <g class="eye eye-r" transform-box="fill-box" transform-origin="center">
        <ellipse class="eye-outer" cx="144" cy="110" rx="14" ry="17" fill="#0b1020" />
        <ellipse class="iris" cx="144" cy="110" rx="10" ry="12" fill="url(#{P}irisGrad)" />
        <circle class="pupil" cx="144" cy="112" r="6" fill="#08080f" />
        <circle class="eye-hl" cx="148" cy="105" r="3.5" fill="#ffffff" />
        <circle class="eye-hl2" cx="140" cy="113" r="2" fill="#ffffff" opacity="0.7" />
      </g>

      <ellipse class="blush blush-l" cx="76" cy="140" rx="12" ry="7" fill="#ff6fae" opacity="0.45" />
      <ellipse class="blush blush-r" cx="164" cy="140" rx="12" ry="7" fill="#ff6fae" opacity="0.45" />

      <ellipse class="mouth" cx="120" cy="156" rx="14" ry="5" fill="#ff5d8f" transform-box="fill-box" transform-origin="center" />
    </g>

    <path class="ahoge" d="M120 40 Q136 12 154 22" stroke="#a855f7" stroke-width="2.4" stroke-linecap="round" fill="none" filter="url(#{P}glow)" />
    <circle class="ahoge-tip" cx="154" cy="22" r="3.5" fill="#22d3ee" filter="url(#{P}glow)" />
  </g>

  <style>
    .holo-base { animation: {P}holoPulse 4s ease-in-out infinite; }
    .char { animation: {P}charBreathe 4s ease-in-out infinite; }
    .char-head { animation: {P}headSway 6s ease-in-out infinite; }
    .energy-core { animation: {P}corePulse 2.4s ease-in-out infinite; }
    .eye { animation: {P}blink 5s infinite; }
    @keyframes {P}holoPulse { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.92;transform:scale(1.05)} }
    @keyframes {P}charBreathe { 0%,100%{transform:scale(1)} 50%{transform:scale(1.025)} }
    @keyframes {P}headSway { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(2.5deg)} }
    @keyframes {P}corePulse { 0%,100%{opacity:.82;transform:scale(1)} 50%{opacity:1;transform:scale(1.14)} }
    @keyframes {P}blink { 0%,92%,100%{transform:scaleY(1)} 96%{transform:scaleY(0.08)} }
  </style>
</svg>`;

let avatarIdCounter = 0;

function makeAvatarSVG(variant = "idle") {
    avatarIdCounter++;
    const prefix = `a${avatarIdCounter}_`;
    let svg = AVATAR_SVG_TEMPLATE.replace(/{P}/g, prefix);

    if (variant === "talking") {
        const talkAnim = `
        .char { animation: ${prefix}charBreathe 4s ease-in-out infinite, ${prefix}talkBounce .42s ease-in-out infinite alternate; }
        .char-head { animation: ${prefix}headSway 6s ease-in-out infinite, ${prefix}talkNod .8s ease-in-out infinite; }
        @keyframes ${prefix}talkBounce { from { transform: scale(1.025) translateY(0); } to { transform: scale(1.05) translateY(-7px); } }
        @keyframes ${prefix}talkNod { 0%,100% { transform: rotate(2.5deg); } 50% { transform: rotate(-1.5deg); } }
        `;
        svg = svg.replace("</style>", talkAnim + "</style>");
    } else if (variant === "thinking") {
        const thinkStyle = `
        .char-head { animation: none; transform: rotate(-7deg); }
        .brow { transform: translateY(-5px); }
        .mouth { transform: scale(0.55); }
        .pupil { transform: translateY(-3px); transition: transform .3s; }
        `;
        svg = svg.replace("</style>", thinkStyle + "</style>");
    }

    return svg;
}

// 机器人（小诺 NOVA）默认头像：赛博朋克女生图
const BOT_AVATAR = "/files/nova-bot.jpg";
function botAvatarHTML(variant = "idle") {
    return `<img class="bot-avatar bot-${variant}" src="${BOT_AVATAR}" alt="小诺 NOVA">`;
}

// ===============================
// 会话状态（localStorage 持久化）
// ===============================
// 会话持久化：每个登录账号一份（与后端专属记忆库对应）
const STORAGE_KEY_PREFIX = "nova_conv_";
const ACTIVE_KEY_PREFIX = "nova_active_";

function convKey() {
    const s = getSession();
    return STORAGE_KEY_PREFIX + (s ? s.username : "guest");
}
function activeKey() {
    const s = getSession();
    return ACTIVE_KEY_PREFIX + (s ? s.username : "guest");
}

let conversations = [];     // [{id, title, messages:[{role, content}], createdAt}]
let activeId = null;
let isReplying = false;
let replyToken = 0;          // 用于在切换会话时中断进行中的请求结果写入

const DOT_COLORS = ["online", "purple", "cyan", "pink"];

function loadConversations() {
    const session = getSession();
    if (!session) {
        // 未登录：无记忆库，给一个干净的默认会话
        conversations = [createConversation("新的对话")];
        activeId = conversations[0].id;
        return;
    }
    // 先尝试本地缓存，保证即时渲染
    try {
        const raw = localStorage.getItem(convKey());
        if (raw) {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr) && arr.length) conversations = arr;
        }
    } catch (e) { conversations = []; }
    if (!conversations.length) conversations = [createConversation("新的对话")];
    activeId = localStorage.getItem(activeKey()) || conversations[0].id;
    if (!conversations.find(c => c.id === activeId)) activeId = conversations[0].id;

    // 后台从服务器拉取该账号的专属记忆库（覆盖本地缓存）
    refreshMemoryFromServer(session.username);
}

function refreshMemoryFromServer(username) {
    fetch(`/api/memory?username=${encodeURIComponent(username)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
            if (data && data.logged_in && Array.isArray(data.conversations) && data.conversations.length) {
                conversations = data.conversations;
                if (!conversations.find(c => c.id === activeId)) activeId = conversations[0].id;
                renderChatList();
                renderActiveMessages();
            }
        })
        .catch(() => {});
}

function saveConversations() {
    const session = getSession();
    try {
        if (session) localStorage.setItem(convKey(), JSON.stringify(conversations));
        if (activeId) localStorage.setItem(activeKey(), activeId);
    } catch (e) {
        console.log("保存会话失败", e);
    }
    // 异步（防抖）同步到该账号的专属记忆库
    if (session) syncMemoryToServer(session.username, conversations);
}

let _syncTimer = null;
function syncMemoryToServer(username, convs) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
        fetch("/api/memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, conversations: convs })
        }).catch(() => {});
    }, 300);
}

function createConversation(title) {
    return {
        id: "c_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
        title: title || "新的对话",
        messages: [],
        createdAt: Date.now()
    };
}

function getActive() {
    return conversations.find(c => c.id === activeId) || null;
}

function dotColor(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return DOT_COLORS[h % DOT_COLORS.length];
}

// ===============================
// 渲染左侧会话列表
// ===============================
const chatList = document.getElementById("chatList");

function renderChatList() {
    if (!chatList) return;
    chatList.innerHTML = "";

    conversations.forEach(c => {
        const li = document.createElement("li");
        li.className = "chat-item" + (c.id === activeId ? " active" : "");
        li.dataset.id = c.id;

        const last = c.messages[c.messages.length - 1];
        const preview = last ? last.content : "开始一段新的对话";
        const timeStr = timeAgo(c.createdAt);

        li.innerHTML = `
            <div class="chat-dot ${dotColor(c.id)}"></div>
            <div class="chat-info">
                <div class="chat-name">${escapeHtml(c.title)}</div>
                <div class="chat-preview">${escapeHtml(preview)}</div>
            </div>
            <div class="chat-time">${timeStr}</div>
            <button class="chat-del" title="删除对话">×</button>
        `;

        li.addEventListener("click", (e) => {
            if (e.target.closest(".chat-del")) return;
            switchConversation(c.id);
        });

        li.querySelector(".chat-del").addEventListener("click", (e) => {
            e.stopPropagation();
            deleteConversation(c.id);
        });

        chatList.appendChild(li);
    });
}

// ===============================
// 切换 / 删除 / 新建会话
// ===============================
function switchConversation(id) {
    if (id === activeId) return;
    activeId = id;
    saveConversations();
    renderChatList();
    renderActiveMessages();
    setAvatarState("idle");
    showToast("已切换对话");
}

function deleteConversation(id) {
    if (conversations.length <= 1) {
        // 至少保留一个：清空它
        const c = conversations[0];
        c.messages = [];
        c.title = "新的对话";
    } else {
        conversations = conversations.filter(c => c.id !== id);
        if (activeId === id) activeId = conversations[0].id;
    }
    saveConversations();
    renderChatList();
    renderActiveMessages();
    showToast("已删除对话");
}

function newConversation() {
    const c = createConversation("新的对话");
    conversations.unshift(c);
    activeId = c.id;
    saveConversations();
    renderChatList();
    renderActiveMessages();
    showToast("已新建对话");
}

// ===============================
// 渲染当前会话消息
// ===============================
const chatbox = document.getElementById("chatbox");

// 滚动跟随：用户上滑查看历史时，不强制把窗口拉回底部
let stickToBottom = true;
let programmaticScroll = false;
const scrollBottomBtn = document.getElementById("scrollBottomBtn");

if (chatbox) {
    chatbox.addEventListener("scroll", () => {
        // 忽略由程序 scrollBottom() 触发的滚动事件
        if (programmaticScroll) { programmaticScroll = false; return; }
        const nearBottom = chatbox.scrollHeight - chatbox.scrollTop - chatbox.clientHeight < 60;
        stickToBottom = nearBottom;
        if (scrollBottomBtn) scrollBottomBtn.classList.toggle("show", !stickToBottom);
    });
    if (scrollBottomBtn) {
        scrollBottomBtn.addEventListener("click", () => {
            stickToBottom = true;
            chatbox.scrollTo({ top: chatbox.scrollHeight, behavior: "smooth" });
        });
    }
}

function renderActiveMessages() {
    if (!chatbox) return;
    const c = getActive();
    chatbox.innerHTML = "";

    if (!c || c.messages.length === 0) {
        chatbox.innerHTML = `
            <div class="date-divider">今天 ${formatTime(new Date())}</div>
            <div class="message ai">
                <div class="msg-avatar">${botAvatarHTML("idle")}</div>
                <div class="msg-content">
                    <div class="bubble">你好，我是你的二次元数字人分身小诺，有什么可以帮你的吗？</div>
                </div>
            </div>
        `;
        stickToBottom = true;
        scrollBottom();
        return;
    }

    c.messages.forEach(m => {
        if (m.role === "user") appendUserMessage(m.content);
        else appendAIMessage(m.content);
    });
}

// ===============================
// DOM
// ===============================
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const avatarStatus = document.getElementById("avatarStatus");
const loading = document.getElementById("loading");
const toast = document.getElementById("toast");
const quickChips = document.getElementById("quickChips");
const newChatBtn = document.getElementById("newChatBtn");

const userMiniAvatar = document.getElementById("userMiniAvatar");
const chatHeaderAvatar = document.getElementById("chatHeaderAvatar");
const profileAvatar = document.getElementById("profileAvatar");
const msgAvatar1 = document.getElementById("msgAvatar1");

// ===============================
// 初始化头像
// ===============================
function injectAvatars(variant = "idle") {
    const html = botAvatarHTML(variant);
    if (userMiniAvatar) userMiniAvatar.innerHTML = html;
    if (chatHeaderAvatar) chatHeaderAvatar.innerHTML = html;
    if (profileAvatar) profileAvatar.innerHTML = html;
    if (msgAvatar1) msgAvatar1.innerHTML = html;
}

// ===============================
// 发送按钮 / 回车发送 / 快捷指令 / 新建
// ===============================
sendBtn.onclick = sendMessage;

msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

if (quickChips) {
    quickChips.addEventListener("click", (e) => {
        const chip = e.target.closest(".chip");
        if (!chip || isReplying) return;
        msgInput.value = chip.textContent;
        sendMessage();
    });
}

if (newChatBtn) {
    newChatBtn.addEventListener("click", newConversation);
}

// ===============================
// 主聊天函数
// ===============================
async function sendMessage() {
    const session = getSession();
    if (!session) { showLoginRequired(); return; }
    const text = msgInput.value.trim();
    if (!text || isReplying) return;

    const targetId = activeId;               // 锁定本次回复归属的会话
    const conv = conversations.find(c => c.id === targetId);
    if (!conv) return;

    isReplying = true;
    replyToken++;
    const myToken = replyToken;

    stickToBottom = true; // 发送消息时回到跟随底部
    appendUserMessage(text);
    conv.messages.push({ role: "user", content: text });
    saveConversations();
    renderChatList();
    msgInput.value = "";
    autoResizeTextarea();

    setAvatarState("thinking");

    // 立即创建 AI 对话框，先显示「正在思考…」（不再有等待遮罩）
    const aiBox = document.createElement("div");
    aiBox.className = "message ai";
    aiBox.innerHTML = `
        <div class="msg-avatar">${botAvatarHTML("thinking")}</div>
        <div class="msg-content">
            <div class="bubble thinking-bubble"><span class="thinking-text">正在思考…</span></div>
        </div>
    `;
    chatbox.appendChild(aiBox);
    scrollBottom();
    const aiBubble = aiBox.querySelector(".bubble");

    // 仅取成对的 user/ai 历史传给后端（与后端 history 格式一致）
    const history = [];
    for (let i = 0; i < conv.messages.length - 1; i++) {
        if (conv.messages[i].role === "user") {
            const u = conv.messages[i].content;
            const next = conv.messages[i + 1];
            const a = (next && next.role === "assistant") ? next.content : "";
            history.push([u, a]);
        }
    }

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text, history: history, username: session.username })
        });

        if (!response.ok) {
            aiBubble.classList.remove("thinking-bubble");
            aiBubble.innerHTML = "请先登录后再与 AI 聊天";
            isReplying = false;
            showLoginRequired();
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let reply = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
                if (!line.startsWith("data:")) continue;
                const json = line.substring(5).trim();
                if (!json) continue;

                try {
                    const obj = JSON.parse(json);
                    if (obj.text) {
                        reply += obj.text;
                        if (myToken !== replyToken) return;   // 已切换会话，停止本轮渲染
                        aiBubble.classList.remove("thinking-bubble");
                        aiBubble.innerHTML = escapeHtml(reply);
                        scrollBottom();
                    }
                } catch (err) {
                    console.log("SSE解析错误:", err, json);
                }
            }
        }

        if (myToken !== replyToken) return;

        if (reply.length === 0) {
            aiBubble.classList.remove("thinking-bubble");
            aiBubble.innerHTML = "（未收到回复）";
        }

        conv.messages.push({ role: "assistant", content: reply });
        saveConversations();
        renderChatList();

        // 用户发满第 3 条消息且 AI 已回复后，用对话内容总结一次标题（只生成一次，生成中即锁定）
        const userCount = conv.messages.filter(m => m.role === "user").length;
        if (conv.title === "新的对话" && !conv.titleLock && userCount >= 3) {
            conv.titleLock = true;
            generateTitle(conv);
        }

        setAvatarState("talking");
        playTTS(reply);

    } catch (error) {
        console.error(error);
        if (myToken === replyToken) {
            aiBubble.classList.remove("thinking-bubble");
            aiBubble.innerHTML = "请求失败：" + (error && error.message ? error.message : error);
            setAvatarState("idle");
            isReplying = false;
        }
    }
}

// ===============================
// 添加消息（仅渲染）
// ===============================
function appendUserMessage(text) {
    const box = document.createElement("div");
    box.className = "message user";
    box.innerHTML = `
        <div class="msg-avatar">👤</div>
        <div class="msg-content">
            <div class="bubble">${escapeHtml(text)}</div>
        </div>
    `;
    chatbox.appendChild(box);
    scrollBottom();
}

function appendAIMessage(text) {
    const box = document.createElement("div");
    box.className = "message ai";
    box.innerHTML = `
        <div class="msg-avatar">${botAvatarHTML("idle")}</div>
        <div class="msg-content">
            <div class="bubble">${escapeHtml(text)}</div>
        </div>
    `;
    chatbox.appendChild(box);
    scrollBottom();
}

// ===============================
// GPT-SoVITS 语音
// ===============================
async function playTTS(text) {
    try {
        const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });

        const data = await res.json();

        if (data.url) {
            const audio = new Audio(data.url);
            audio.play();
            analyzeAudio(audio);

            audio.onended = () => {
                setAvatarState("idle");
                isReplying = false;
            };
            audio.onerror = () => {
                setAvatarState("idle");
                isReplying = false;
            };
        } else {
            setAvatarState("idle");
            isReplying = false;
        }
    } catch (e) {
        console.log("TTS错误", e);
        setAvatarState("idle");
        isReplying = false;
    }
}

// ===============================
// 音频可视化（嘴型）
// ===============================
function analyzeAudio(audio) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();

        source.connect(analyser);
        analyser.connect(ctx.destination);
        analyser.fftSize = 256;

        const data = new Uint8Array(analyser.frequencyBinCount);

        function loop() {
            if (audio.paused || audio.ended) {
                setMouthScale(1);
                return;
            }
            analyser.getByteFrequencyData(data);
            const value = data.reduce((a, b) => a + b) / data.length;
            const scale = Math.min(2.4, 0.5 + value / 38);
            setMouthScale(scale);
            requestAnimationFrame(loop);
        }
        loop();
    } catch (e) {
        console.log("音频分析不可用", e);
    }
}

function setMouthScale(scale) {
    document.querySelectorAll(".mouth").forEach((mouth) => {
        mouth.style.transform = `scaleY(${scale})`;
    });
}

// ===============================
// 状态控制
// ===============================
function setAvatarState(state) {
    if (state === "thinking") {
        if (avatarStatus) avatarStatus.textContent = "思考中… · 多模态就绪";
        injectAvatars("thinking");
    } else if (state === "talking") {
        if (avatarStatus) avatarStatus.textContent = "正在说话 · 多模态就绪";
        injectAvatars("talking");
    } else {
        if (avatarStatus) avatarStatus.textContent = "在线 · 多模态就绪";
        injectAvatars("idle");
    }
}

// ===============================
// Loading / Toast / Scroll
// ===============================
function showLoading() { if (loading) loading.classList.remove("hide"); }
function hideLoading() { if (loading) loading.classList.add("hide"); }

function scrollBottom() {
    if (!chatbox || !stickToBottom) return;
    programmaticScroll = true;
    chatbox.scrollTop = chatbox.scrollHeight;
}

function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
}

// ===============================
// 根据对话内容生成标题（只调用一次）
// ===============================
async function generateTitle(conv) {
    const messages = conv.messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));

    try {
        const res = await fetch("/api/title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages })
        });
        const data = await res.json();

        if (data.title && data.title.trim()) {
            conv.title = data.title.trim();
        } else {
            // 接口失败时的兜底：取首句前 12 字
            const first = conv.messages.find(m => m.role === "user");
            if (first) {
                const t = first.content;
                conv.title = t.length > 12 ? t.slice(0, 12) + "…" : t;
            }
        }
        saveConversations();
        renderChatList();
    } catch (e) {
        console.log("标题生成失败", e);
    }
}

// ===============================
// 工具函数
// ===============================
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatTime(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
}

function timeAgo(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return Math.floor(diff / 60000) + "分钟前";
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return formatTime(d);
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

function autoResizeTextarea() {
    msgInput.style.height = "auto";
    msgInput.style.height = Math.min(120, msgInput.scrollHeight) + "px";
}

msgInput.addEventListener("input", autoResizeTextarea);

// ===============================
// 健康检查
// ===============================
function startHealthCheck() {
    const check = () => {
        fetch("/api/health")
            .then(() => {
                if (avatarStatus && avatarStatus.textContent.includes("服务异常")) {
                    avatarStatus.textContent = "在线 · 多模态就绪";
                }
            })
            .catch(() => {
                if (avatarStatus) avatarStatus.textContent = "服务异常";
            });
    };
    check();
    setInterval(check, 30000);
}

// ===============================
// 移动端抽屉（侧边栏开合）
// ===============================
function initMobileDrawer() {
    const menuBtn = document.getElementById("menuBtn");
    const sidebarLeft = document.querySelector(".sidebar-left");
    const overlay = document.getElementById("sidebarOverlay");
    if (!menuBtn || !sidebarLeft || !overlay) return;

    const openSidebar = () => {
        sidebarLeft.classList.add("open");
        overlay.classList.add("show");
    };
    const closeSidebar = () => {
        sidebarLeft.classList.remove("open");
        overlay.classList.remove("show");
    };

    menuBtn.addEventListener("click", () => {
        sidebarLeft.classList.contains("open") ? closeSidebar() : openSidebar();
    });
    overlay.addEventListener("click", closeSidebar);

    // 窄屏下选中某个会话后自动收起抽屉
    if (chatList) {
        chatList.addEventListener("click", (e) => {
            if (e.target.closest(".chat-item") && window.innerWidth <= 768) {
                closeSidebar();
            }
        });
    }

    // 视口放大回桌面尺寸时，确保抽屉状态复位
    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) closeSidebar();
    });
}

// ===============================
// 角色人设（从聊天记录学习）
// ===============================
let characterState = { name: "小诺", base_setting: "", learned: "", learned_turns: 0, pending: 0, threshold: 8 };

function renderCharacterCard() {
    const nameEl = document.getElementById("charName");
    const progEl = document.getElementById("charProgress");
    const learnedEl = document.getElementById("charLearned");
    if (nameEl) nameEl.textContent = characterState.name || "小诺";
    if (progEl) {
        const need = Math.max(0, (characterState.threshold || 8) - (characterState.pending || 0));
        progEl.textContent = characterState.learned
            ? `已学习 ${characterState.learned_turns || 0} 轮`
            : `还差 ${need} 轮自动学习`;
    }
    if (learnedEl) {
        learnedEl.textContent = characterState.learned
            ? characterState.learned
            : "（暂无学习到的内容，多聊几句或点「重新学习」）";
    }
}

async function loadCharacter() {
    const session = getSession();
    const url = session
        ? `/api/character?username=${encodeURIComponent(session.username)}`
        : "/api/character";
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        characterState = await res.json();
        renderCharacterCard();
    } catch (e) {
        console.log("加载角色画像失败", e);
    }
}

function openCharacterModal() {
    const modal = document.getElementById("charModal");
    const nameInput = document.getElementById("charNameInput");
    const baseInput = document.getElementById("charBaseInput");
    if (nameInput) nameInput.value = characterState.name || "";
    if (baseInput) baseInput.value = characterState.base_setting || "";
    if (modal) modal.classList.add("show");
}

function closeCharacterModal() {
    const modal = document.getElementById("charModal");
    if (modal) modal.classList.remove("show");
}

async function saveCharacter() {
    const nameInput = document.getElementById("charNameInput");
    const baseInput = document.getElementById("charBaseInput");
    const session = getSession();
    const payload = {
        username: session ? session.username : "",
        name: nameInput ? nameInput.value.trim() : "",
        base_setting: baseInput ? baseInput.value : ""
    };
    try {
        const res = await fetch("/api/character", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
            characterState = data.profile || characterState;
            renderCharacterCard();
            closeCharacterModal();
            showToast("角色设定已保存");
        }
    } catch (e) {
        console.log("保存角色设定失败", e);
        showToast("保存失败");
    }
}

async function learnCharacter() {
    const btn = document.getElementById("learnCharBtn");
    if (btn) { btn.disabled = true; btn.textContent = "学习中…"; }
    const session = getSession();
    const uname = session ? session.username : "";
    try {
        await fetch("/api/character/learn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: uname })
        });
        const start = Date.now();
        while (Date.now() - start < 60000) {
            await new Promise(r => setTimeout(r, 2000));
            const res = await fetch(`/api/character?username=${encodeURIComponent(uname)}`);
            const st = await res.json();
            characterState = st;
            renderCharacterCard();
            if (st.pending <= 0) break;
        }
        showToast("角色画像已更新");
    } catch (e) {
        console.log("学习失败", e);
        showToast("学习失败");
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "重新学习"; }
    }
}

// ---- 从本地/项目聊天记录文件学习（提炼进角色人设）----
function fileToExcerpt(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            let text = String(reader.result || "");
            try {
                const obj = JSON.parse(text);
                const arr = Array.isArray(obj) ? obj
                    : (obj.conversations || obj.messages || obj.data || obj.dialogs || obj.records || null);
                if (Array.isArray(arr)) {
                    const lines = [];
                    for (const m of arr) {
                        if (!m) continue;
                        const role = String(m.role || m.speaker || m.from || "").toLowerCase();
                        const c = m.content != null ? m.content
                            : (m.text != null ? m.text
                                : (m.message != null ? m.message
                                    : (m.user != null && m.bot != null ? `用户：${m.user}\nAI：${m.bot}` : "")));
                        if (!c) continue;
                        const prefix = (role === "user" || role === "human" || m.user != null) ? "用户：" : "AI：";
                        lines.push(prefix + c);
                    }
                    if (lines.length) text = lines.join("\n");
                }
            } catch (e) { /* 非 JSON，按纯文本处理 */ }
            resolve(text);
        };
        reader.onerror = () => reject(new Error("读取文件失败"));
        reader.readAsText(file);
    });
}

async function learnFromFile(file) {
    const s = getSession();
    if (!s) { showLoginRequired(); return; }
    const btn = document.getElementById("learnFileBtn");
    const input = document.getElementById("learnFileInput");
    const content = await fileToExcerpt(file);
    if (!content || !content.trim()) { showToast("文件内容为空"); if (input) input.value = ""; return; }
    if (btn) { btn.disabled = true; btn.textContent = "学习中…"; }
    try {
        await fetch("/api/character/learn-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: s.username, content })
        });
        const start = Date.now();
        while (Date.now() - start < 90000) {
            await new Promise(r => setTimeout(r, 2000));
            const res = await fetch(`/api/character?username=${encodeURIComponent(s.username)}`);
            const st = await res.json();
            characterState = st;
            renderCharacterCard();
            if (st.learned && st.updated_at * 1000 >= start) break;
        }
        showToast("已从文件学习完成");
    } catch (e) {
        console.log("从文件学习失败", e);
        showToast("学习失败");
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "从文件学习"; }
        if (input) input.value = "";
    }
}

function initCharacterUI() {
    const editBtn = document.getElementById("editCharBtn");
    const learnBtn = document.getElementById("learnCharBtn");
    const learnFileBtn = document.getElementById("learnFileBtn");
    const learnFileInput = document.getElementById("learnFileInput");
    const saveBtn = document.getElementById("charModalSave");
    const cancelBtn = document.getElementById("charModalCancel");
    const modal = document.getElementById("charModal");
    if (editBtn) editBtn.addEventListener("click", openCharacterModal);
    if (learnBtn) learnBtn.addEventListener("click", learnCharacter);
    if (learnFileBtn && learnFileInput) {
        learnFileBtn.addEventListener("click", () => learnFileInput.click());
        learnFileInput.addEventListener("change", (e) => {
            const f = e.target.files && e.target.files[0];
            if (f) learnFromFile(f);
        });
    }
    if (saveBtn) saveBtn.addEventListener("click", saveCharacter);
    if (cancelBtn) cancelBtn.addEventListener("click", closeCharacterModal);
    if (modal) modal.addEventListener("click", (e) => {
        if (e.target === modal) closeCharacterModal();
    });
}

// ===============================
// 初始化
// ===============================
window.addEventListener("load", () => {
    loadConversations();
    renderChatList();
    renderActiveMessages();
    injectAvatars("idle");
    autoResizeTextarea();
    startHealthCheck();
    initMobileDrawer();
    initCharacterUI();
    loadCharacter();
    initUserMenu();
    bindModals();
    console.log("小诺 NOVA 对话系统启动完成");
});

// ===============================
// 内部导航助手：非后端环境自动加前缀 http://127.0.0.1:7860
// ===============================
function backendBase() {
    const onBackend = window.location.port === "7860" || window.location.href.includes(":7860/");
    return onBackend ? "" : "http://127.0.0.1:7860";
}
function go(path) {
    window.location.href = backendBase() + path;
}

// ===============================
// 右上角账号菜单（与首页同步的登录态）
// ===============================
const DEFAULT_AVATAR = "/files/nova-hero.jpg";

function getSession() {
    try {
        const raw = localStorage.getItem("nova_session");
        if (!raw) return null;
        const s = JSON.parse(raw);
        if (!s || !s.username) return null;
        return s;
    } catch (e) {
        return null;
    }
}

function setSession(s) {
    localStorage.setItem("nova_session", JSON.stringify(s));
}

function clearSession() {
    localStorage.removeItem("nova_session");
}

function initUserMenu() {
    const session = getSession();
    const userMenu = document.getElementById("userMenu");
    const avatarImg = document.getElementById("userAvatarImg");
    const udAvatar = document.getElementById("udAvatar");
    const udName = document.getElementById("udName");
    const avatarBtn = document.getElementById("userAvatarBtn");
    const dropdown = document.getElementById("userDropdown");
    if (!userMenu || !avatarBtn || !dropdown) return;

    // 未登录：隐藏账号菜单（保留右上角其它按钮），并提示先登录
    if (!session) {
        userMenu.hidden = true;
        if (msgInput) msgInput.placeholder = "请先登录后再与 AI 聊天…";
        return;
    }

    userMenu.hidden = false;
    if (msgInput) msgInput.placeholder = "输入消息…";
    const avatar = session.avatar || DEFAULT_AVATAR;
    if (avatarImg) avatarImg.src = avatar;
    if (udAvatar) udAvatar.src = avatar;
    if (udName) udName.textContent = session.username;

    // 头像点击：切换下拉
    avatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = dropdown.hidden;
        dropdown.hidden = !open;
        avatarBtn.setAttribute("aria-expanded", String(open));
    });

    // 点击其它区域关闭
    document.addEventListener("click", (e) => {
        if (!userMenu.contains(e.target)) {
            dropdown.hidden = true;
            avatarBtn.setAttribute("aria-expanded", "false");
        }
    });

    // 菜单项
    dropdown.querySelectorAll(".ud-item").forEach((item) => {
        item.addEventListener("click", () => {
            dropdown.hidden = true;
            avatarBtn.setAttribute("aria-expanded", "false");
            const act = item.getAttribute("data-act");
            if (act === "switch") onSwitchUser();
            else if (act === "avatar") openAvatarModal();
            else if (act === "password") openPwdModal();
            else if (act === "delete") openDelModal();
        });
    });
}

function onSwitchUser() {
    const s = getSession();
    if (s) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + s.username);
        localStorage.removeItem(ACTIVE_KEY_PREFIX + s.username);
    }
    clearSession();
    go("/auth/");
}

// ---- 弹窗通用控制（speek 用 .modal-mask + .show）----
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add("show");
}

function closeModal(m) {
    if (!m) return;
    m.classList.remove("show");
    m.querySelectorAll(".modal-err").forEach((e) => (e.textContent = ""));
    m.querySelectorAll("input").forEach((i) => (i.value = ""));
    const prev = m.querySelector(".avatar-preview img");
    if (prev) prev.src = (getSession() && getSession().avatar) || DEFAULT_AVATAR;
}

// 未登录提示
function showLoginRequired() {
    openModal("loginRequiredModal");
}

function bindModals() {
    document.querySelectorAll(".modal-mask").forEach((mask) => {
        mask.addEventListener("click", (e) => {
            if (e.target === mask) closeModal(mask);
        });
        mask.querySelectorAll("[data-close]").forEach((b) => {
            b.addEventListener("click", () => closeModal(mask));
        });
    });

    const loginGo = document.getElementById("loginGoBtn");
    if (loginGo) loginGo.addEventListener("click", () => { go("/auth/"); });
    const loginClose = document.getElementById("loginCloseBtn");
    const loginMask = document.getElementById("loginRequiredModal");
    if (loginClose) loginClose.addEventListener("click", () => closeModal(loginMask));
    if (loginMask) loginMask.addEventListener("click", (e) => { if (e.target === loginMask) closeModal(loginMask); });

    const avatarSave = document.getElementById("avatarSave");
    const pwdSave = document.getElementById("pwdSave");
    const delConfirm = document.getElementById("delConfirm");
    if (avatarSave) avatarSave.addEventListener("click", onAvatarSave);
    if (pwdSave) pwdSave.addEventListener("click", onPwdSave);
    if (delConfirm) delConfirm.addEventListener("click", onDelConfirm);

    const input = document.getElementById("avatarInput");
    const preview = document.getElementById("avatarPreview");
    if (input && preview) {
        input.addEventListener("change", () => {
            const file = input.files && input.files[0];
            if (file) preview.src = URL.createObjectURL(file);
        });
    }
}

function openAvatarModal() {
    const s = getSession();
    const prev = document.getElementById("avatarPreview");
    const input = document.getElementById("avatarInput");
    const pwd = document.getElementById("avatarPwd");
    const pwdErr = document.getElementById("avatarPwdErr");
    const err = document.getElementById("avatarErr");
    if (prev) prev.src = (s && s.avatar) || DEFAULT_AVATAR;
    if (input) input.value = "";
    if (pwd) pwd.value = "";
    if (pwdErr) pwdErr.textContent = "";
    if (err) err.textContent = "";
    openModal("avatarModal");
}

function openPwdModal() {
    openModal("pwdModal");
}

function openDelModal() {
    openModal("delModal");
}

// ---- 更换头像 ----
async function onAvatarSave() {
    const s = getSession();
    const errEl = document.getElementById("avatarErr");
    const pwdEl = document.getElementById("avatarPwd");
    const input = document.getElementById("avatarInput");
    const file = input && input.files && input.files[0];
    if (!s) return;
    if (!pwdEl.value) { document.getElementById("avatarPwdErr").textContent = "请输入密码"; return; }
    if (!file) {
        if (errEl) errEl.textContent = "请先选择一张图片";
        return;
    }
    const fd = new FormData();
    fd.append("username", s.username);
    fd.append("password", pwdEl.value);
    fd.append("file", file);

    if (errEl) errEl.textContent = "上传中…";
    try {
        const resp = await fetch("/api/user/avatar", { method: "POST", body: fd });
        const data = await resp.json();
        if (data.ok) {
            setSession({ username: s.username, avatar: data.avatar });
            const img = document.getElementById("userAvatarImg");
            const ud = document.getElementById("udAvatar");
            if (img) img.src = data.avatar;
            if (ud) ud.src = data.avatar;
            closeModal(document.getElementById("avatarModal"));
            showToast("头像已更新");
        } else {
            const pwdErrEl = document.getElementById("avatarPwdErr");
            if (pwdErrEl) pwdErrEl.textContent = "";
            if (errEl) errEl.textContent = data.msg || "上传失败";
        }
    } catch (e) {
        if (errEl) errEl.textContent = "网络错误，请确认后端已启动";
    }
}

// ---- 修改密码 ----
async function onPwdSave() {
    const s = getSession();
    const oldI = document.getElementById("pwdOld");
    const newI = document.getElementById("pwdNew");
    const new2I = document.getElementById("pwdNew2");
    const errEl = document.getElementById("pwdErr");
    const RE_PWD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!s) return;
    document.getElementById("pwdOldErr").textContent = "";
    document.getElementById("pwdNewErr").textContent = "";
    document.getElementById("pwdNew2Err").textContent = "";
    if (errEl) errEl.textContent = "";

    if (!oldI.value) { document.getElementById("pwdOldErr").textContent = "请输入当前密码"; return; }
    if (!RE_PWD.test(newI.value)) { document.getElementById("pwdNewErr").textContent = "新密码至少 8 位，含字母与数字"; return; }
    if (newI.value !== new2I.value) { document.getElementById("pwdNew2Err").textContent = "两次输入不一致"; return; }

    try {
        const resp = await fetch("/api/user/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: s.username, old_password: oldI.value, new_password: newI.value }),
        });
        const data = await resp.json();
        if (data.ok) {
            closeModal(document.getElementById("pwdModal"));
            showToast("密码已修改");
        } else {
            if (errEl) errEl.textContent = data.msg || "修改失败";
        }
    } catch (e) {
        if (errEl) errEl.textContent = "网络错误，请确认后端已启动";
    }
}

// ---- 注销账号 ----
async function onDelConfirm() {
    const s = getSession();
    const pwd = document.getElementById("delPwd").value;
    const errEl = document.getElementById("delErr");
    if (!s) return;
    if (errEl) errEl.textContent = "";
    if (!pwd) { if (errEl) errEl.textContent = "请输入密码"; return; }
    if (!confirm("确定要永久注销账号「" + s.username + "」吗？此操作不可恢复。")) return;

    try {
        const resp = await fetch("/api/user/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: s.username, password: pwd }),
        });
        const data = await resp.json();
        if (data.ok) {
            const s = getSession();
            if (s) {
                localStorage.removeItem(STORAGE_KEY_PREFIX + s.username);
                localStorage.removeItem(ACTIVE_KEY_PREFIX + s.username);
            }
            clearSession();
            showToast("账号已注销");
            setTimeout(() => { go("/auth/"); }, 600);
        } else {
            if (errEl) errEl.textContent = data.msg || "注销失败";
        }
    } catch (e) {
        if (errEl) errEl.textContent = "网络错误，请确认后端已启动";
    }
}
