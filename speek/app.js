// ===============================
// 数字人 SVG 头像（基础模板，每次使用前会生成唯一 ID）
// ===============================
const AVATAR_SVG_TEMPLATE = '<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="{P}skinGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe8da"/><stop offset="1" stop-color="#f5c6a8"/></linearGradient><linearGradient id="{P}hairGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e0f2fe"/><stop offset="0.45" stop-color="#a5f3fc"/><stop offset="1" stop-color="#c084fc"/></linearGradient><linearGradient id="{P}clothGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="0.5" stop-color="#312e81"/><stop offset="1" stop-color="#4c1d95"/></linearGradient><radialGradient id="{P}irisGrad" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c3aed"/></radialGradient><radialGradient id="{P}coreGrad" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="#67e8f9"/><stop offset="0.6" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c3aed"/></radialGradient><linearGradient id="{P}holoGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(34,211,238,0.55)"/><stop offset="1" stop-color="rgba(34,211,238,0)"/></linearGradient><filter id="{P}glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><ellipse class="holo-base" cx="120" cy="296" rx="90" ry="18" fill="url(#{P}holoGrad)"/><g class="char" transform-origin="120px 280px"><g class="char-body"><path class="arm arm-left" d="M78 235 Q56 270 72 300" stroke="url(#{P}clothGrad)" stroke-width="17" stroke-linecap="round" fill="none"/><path class="arm arm-right" d="M162 235 Q184 270 168 300" stroke="url(#{P}clothGrad)" stroke-width="17" stroke-linecap="round" fill="none"/><path class="torso" d="M120 198 C80 198,58 232,62 284 Q120 312,178 284 C182 232,160 198,120 198Z" fill="url(#{P}clothGrad)"/><path class="collar" d="M102 204 Q120 224 138 204" stroke="#22d3ee" stroke-width="3" fill="none" opacity="0.85" filter="url(#{P}glow)"/><path class="neon-line" d="M74 230 L60 218" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" opacity="0.85" filter="url(#{P}glow)"/><path class="neon-line" d="M166 230 L180 218" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round" opacity="0.85" filter="url(#{P}glow)"/><circle class="energy-core" cx="120" cy="252" r="14" fill="url(#{P}coreGrad)" filter="url(#{P}glow)"/></g><rect class="neck" x="108" y="176" width="24" height="34" rx="11" fill="#f0cdb8"/><g class="char-head" transform-origin="120px 182px"><path class="hair-back" d="M120 40 C52 40,42 114,58 156 C68 186,90 192,120 190 C150 192,172 186,182 156 C198 114,188 40,120 40Z" fill="url(#{P}hairGrad)"/><ellipse class="face" cx="120" cy="114" rx="58" ry="66" fill="url(#{P}skinGrad)"/><path class="hair-front" d="M60 110 C56 58,88 36,120 36 C152 36,184 58,180 110 C170 88,152 80,142 94 C134 80,106 80,98 94 C88 80,70 88,60 110Z" fill="url(#{P}hairGrad)" opacity="0.96"/><path class="brow brow-l" d="M82 92 Q96 86 110 92" stroke="#7c5cff" stroke-width="4" fill="none" stroke-linecap="round"/><path class="brow brow-r" d="M130 92 Q144 86 158 92" stroke="#7c5cff" stroke-width="4" fill="none" stroke-linecap="round"/><g class="eye eye-l"><ellipse class="eye-outer" cx="96" cy="110" rx="14" ry="17" fill="#0b1020"/><ellipse class="iris" cx="96" cy="110" rx="10" ry="12" fill="url(#{P}irisGrad)"/><circle class="pupil" cx="96" cy="112" r="6" fill="#08080f"/><circle class="eye-hl" cx="100" cy="105" r="3.5" fill="#fff"/><circle class="eye-hl2" cx="92" cy="113" r="2" fill="#fff" opacity="0.7"/></g><g class="eye eye-r"><ellipse class="eye-outer" cx="144" cy="110" rx="14" ry="17" fill="#0b1020"/><ellipse class="iris" cx="144" cy="110" rx="10" ry="12" fill="url(#{P}irisGrad)"/><circle class="pupil" cx="144" cy="112" r="6" fill="#08080f"/><circle class="eye-hl" cx="148" cy="105" r="3.5" fill="#fff"/><circle class="eye-hl2" cx="140" cy="113" r="2" fill="#fff" opacity="0.7"/></g><ellipse class="blush blush-l" cx="76" cy="140" rx="12" ry="7" fill="#ff6fae" opacity="0.45"/><ellipse class="blush blush-r" cx="164" cy="140" rx="12" ry="7" fill="#ff6fae" opacity="0.45"/><ellipse class="mouth" cx="120" cy="156" rx="14" ry="5" fill="#ff5d8f"/></g><path class="ahoge" d="M120 40 Q136 12 154 22" stroke="#a855f7" stroke-width="2.4" stroke-linecap="round" fill="none" filter="url(#{P}glow)"/><circle class="ahoge-tip" cx="154" cy="22" r="3.5" fill="#22d3ee" filter="url(#{P}glow)"/></g><style>.holo-base{animation:{P}holoPulse 4s ease-in-out infinite}.char{animation:{P}charBreathe 4s ease-in-out infinite}.char-head{animation:{P}headSway 6s ease-in-out infinite}.energy-core{animation:{P}corePulse 2.4s ease-in-out infinite}.eye{animation:{P}blink 5s infinite}@keyframes {P}holoPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.92;transform:scale(1.05)}}@keyframes {P}charBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.025)}}@keyframes {P}headSway{0%,100%{transform:rotate(0deg)}50%{transform:rotate(2.5deg)}}@keyframes {P}corePulse{0%,100%{opacity:.82;transform:scale(1)}50%{opacity:1;transform:scale(1.14)}}@keyframes {P}blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(0.08)}}</style></svg>';


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
let BOT_AVATAR = "/files/nova-bot.jpg";
let currentBotAvatar = null;  // 用户自定义机器人头像
function botAvatarHTML(variant = "idle") {
    const src = currentBotAvatar || BOT_AVATAR;
    return `<img class="bot-avatar bot-${variant}" src="${src}" alt="小诺 NOVA">`;
}

// ===============================
// 人设（每条对话独立一份）
// ===============================
function defaultPersona() {
    return { name: "小诺", base_setting: "", learned: "", learned_turns: 0, bot_avatar: null };
}
// 新建对话时可选择的预设人设模板
const PERSONA_PRESETS = [
    { key: "cold",     name: "凛", title: "高冷御姐", base: "你是一个高冷疏离的御姐，说话简短克制，不主动讨好，偶尔毒舌但内心细腻，用淡漠的语气维持距离感。" },
    { key: "warm",     name: "暖", title: "温柔姐姐", base: "你是一个温柔体贴的邻家姐姐，语气温柔包容，善于倾听与共情，总给人安心的感觉。" },
    { key: "tsundere", name: "傲", title: "傲娇少女", base: "你是一个傲娇少女，嘴硬心软，嘴上不饶人但行动很照顾对方，害羞时爱用「才不是为你…」这类句式。" },
    { key: "cute",     name: "糖", title: "可爱萌妹", base: "你是一个活泼可爱的萌妹，说话带语气词和颜文字，元气满满，喜欢用撒娇的口吻。" },
];
// 本地存储 schema 版本：变更数据结构时自增，触发「清空重来」
const CONV_SCHEMA_KEY = "nova_conv_schema";
const CONV_SCHEMA_VAL = "v2";

// 兼容迁移：保证每条对话都带完整 persona
function normalizeConversations(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(c => {
        if (c && !c.persona) c.persona = defaultPersona();
        if (c && c.persona && typeof c.persona === "object") {
            const d = defaultPersona();
            for (const k in d) if (!(k in c.persona)) c.persona[k] = d[k];
        }
        return c;
    });
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

    // 数据结构升级：按用户选择「全部清空重来」，清掉旧聊天（本地 + 服务端）
    const schema = localStorage.getItem(CONV_SCHEMA_KEY);
    if (schema !== CONV_SCHEMA_VAL) {
        try { localStorage.removeItem(convKey()); localStorage.removeItem(activeKey()); } catch (e) {}
        if (session) {
            fetch("/api/memory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: session.username, conversations: [] })
            }).catch(() => {});
        }
        localStorage.setItem(CONV_SCHEMA_KEY, CONV_SCHEMA_VAL);
        conversations = [createConversation("新的对话")];
        activeId = conversations[0].id;
        saveConversations();
        return;
    }

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
            if (Array.isArray(arr) && arr.length) conversations = normalizeConversations(arr);
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
                conversations = normalizeConversations(data.conversations);
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

function createConversation(title, persona) {
    return {
        id: "c_" + Date.now() + "_" + Math.floor(Math.random() * 100000),
        title: title || "新的对话",
        persona: persona || defaultPersona(),
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

    // 置顶的排前面
    const sorted = [...conversations].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
    });

    sorted.forEach(c => {
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
    loadCharacter();   // 刷新当前对话的人设与头像
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
    // 弹出预设人设选择面板
    const modal = document.getElementById("presetModal");
    if (modal) modal.classList.add("show");
}

// 根据所选预设（或自定义）创建新对话
function createConversationFromPreset(preset) {
    let persona;
    let title = "新的对话";
    if (preset && preset.key === "custom") {
        persona = defaultPersona();   // 自定义：先用默认，稍后由编辑角色面板填写
        title = "自定义人设";
    } else if (preset) {
        persona = Object.assign(defaultPersona(), {
            name: preset.name,
            base_setting: preset.base,
            persona_key: preset.key,    // 用于卡片显示专属人设标签
            persona_title: preset.title
        });
        title = preset.title;
    } else {
        persona = defaultPersona();
    }
    const c = createConversation(title, persona);
    conversations.unshift(c);
    activeId = c.id;
    saveConversations();
    renderChatList();
    renderActiveMessages();
    setAvatarState("idle");
    loadCharacter();   // 刷新右侧人设卡与头像为当前对话
    showToast("已新建对话：" + title);
    // 自定义人设：立即打开编辑角色面板让用户输入
    if (preset && preset.key === "custom") openCharacterModal();
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
        if (m.role === "user") appendUserMessage(m);
        else appendAIMessage(m);
    });
    updateDocBadge();
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
// 附件选择 / 预览 / 上传
// ===============================
const fileInput = document.getElementById("fileInput");
const attachBtn = document.getElementById("attachBtn");
const attachPreview = document.getElementById("attachPreview");
let pendingFiles = [];   // [{ file, id }]

if (attachBtn && fileInput) {
    attachBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        for (const f of e.target.files) {
            pendingFiles.push({ file: f, id: "f_" + Date.now() + "_" + Math.floor(Math.random() * 1e6) });
        }
        e.target.value = "";   // 允许重复选择同一文件
        renderAttachPreview();
    });
}

// 预览区移除按钮（事件委托）
if (attachPreview) {
    attachPreview.addEventListener("click", (e) => {
        const rm = e.target.closest(".attach-remove");
        if (!rm) return;
        const idx = parseInt(rm.getAttribute("data-i"), 10);
        if (!isNaN(idx) && pendingFiles[idx]) {
            pendingFiles.splice(idx, 1);
            renderAttachPreview();
        }
    });
}

function renderAttachPreview() {
    if (!attachPreview) return;
    if (!pendingFiles.length) {
        attachPreview.innerHTML = "";
        attachPreview.style.display = "none";
        return;
    }
    attachPreview.style.display = "flex";
    attachPreview.innerHTML = pendingFiles.map((p, i) => {
        const isImg = /(\.png|\.jpe?g|\.gif|\.webp)$/i.test(p.file.name);
        const thumb = isImg
            ? `<img class="attach-thumb" src="${URL.createObjectURL(p.file)}" alt="">`
            : `<span class="attach-thumb attach-thumb-file">📎</span>`;
        return `<div class="attach-chip">
            ${thumb}
            <span class="attach-name" title="${escapeHtml(p.file.name)}">${escapeHtml(p.file.name)}</span>
            <button class="attach-remove" data-i="${i}" title="移除">×</button>
        </div>`;
    }).join("");
}

async function uploadPendingFiles(session) {
    if (!pendingFiles.length) return [];
    const fd = new FormData();
    fd.append("username", session.username);
    pendingFiles.forEach(p => fd.append("file", p.file));
    try {
        const resp = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await resp.json();
        if (!data.ok) { showToast(data.msg || "附件上传失败"); return []; }
        return data.files || [];
    } catch (e) {
        console.log("附件上传异常", e);
        showToast("附件上传失败");
        return [];
    }
}

// ===============================
// 语音输入（Web Speech API）
// ===============================
// 语音输入状态（录音 + ARK 音频理解，不依赖 Web Speech API）
const voice = {
    recording: false,
    stream: null,
    audioCtx: null,
    analyser: null,
    processor: null,
    pcm: [],
    sampleRate: 44100,
    startTime: 0,
    rafId: 0,
    canvas: null,
    ctx2d: null,
    autoStop: 0,
};

function ensureVoiceCanvas() {
    let c = document.getElementById("voiceWave");
    if (!c) {
        c = document.createElement("canvas");
        c.id = "voiceWave";
        c.className = "voice-wave";
        const bar = document.querySelector(".input-bar");
        if (bar) bar.appendChild(c);
    }
    voice.canvas = c;
    voice.ctx2d = c.getContext("2d");
    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = Math.max(1, Math.floor(rect.width * dpr));
    c.height = Math.max(1, Math.floor(rect.height * dpr));
    return c;
}

function roundRectPath(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawVoiceWave() {
    if (!voice.recording) return;
    const ctx = voice.ctx2d, analyser = voice.analyser;
    const w = voice.canvas.width, h = voice.canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (analyser) {
        const bins = analyser.frequencyBinCount;
        const buf = new Uint8Array(bins);
        analyser.getByteFrequencyData(buf);
        const bars = 30;
        const step = Math.max(1, Math.floor(bins / bars));
        const gap = Math.max(1, w * 0.006);
        const bw = (w - gap * (bars - 1)) / bars;
        for (let i = 0; i < bars; i++) {
            let v = buf[i * step] / 255;
            if (v < 0.03) v = 0.03;
            const bh = v * h * 0.92;
            const x = i * (bw + gap);
            const y = (h - bh) / 2;
            const grad = ctx.createLinearGradient(0, y, 0, y + bh);
            grad.addColorStop(0, "#22d3ee");
            grad.addColorStop(1, "#a78bfa");
            ctx.fillStyle = grad;
            roundRectPath(ctx, x, y, bw, bh, bw / 2);
            ctx.fill();
        }
    }
    voice.rafId = requestAnimationFrame(drawVoiceWave);
}

async function startVoice() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast("当前环境不支持录音（需 HTTPS 或 localhost，且允许麦克风）");
        return;
    }
    const micBtn = document.getElementById("micBtn");
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voice.stream = stream;
        voice.recording = true;
        voice.pcm = [];
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ac = new AudioCtx();
        if (ac.state === "suspended") { try { await ac.resume(); } catch (e) {} }
        voice.audioCtx = ac;
        voice.sampleRate = ac.sampleRate;
        const source = ac.createMediaStreamSource(stream);
        const analyser = ac.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        const processor = ac.createScriptProcessor(2048, 1, 1);
        processor.onaudioprocess = (e) => {
            const ch = e.inputBuffer.getChannelData(0);
            voice.pcm.push(new Float32Array(ch));
        };
        source.connect(processor);
        const silent = ac.createGain();
        silent.gain.value = 0;
        processor.connect(silent);
        silent.connect(ac.destination);
        voice.analyser = analyser;
        voice.processor = processor;

        const bar = document.querySelector(".input-bar");
        if (bar) bar.classList.add("voice-on");
        if (micBtn) { micBtn.classList.add("recording"); micBtn.title = "正在录音，点击停止"; }
        msgInput.placeholder = "正在聆听…再次点击麦克风结束";
        ensureVoiceCanvas();
        voice.startTime = Date.now();
        drawVoiceWave();
        voice.autoStop = setTimeout(stopVoice, 30000);
    } catch (e) {
        showToast("无法访问麦克风：" + (e && e.message ? e.message : e));
    }
}

function encodeWav(chunks, sampleRate) {
    if (!chunks.length) return null;
    let len = 0;
    for (const c of chunks) len += c.length;
    if (!len) return null;
    const samples = new Float32Array(len);
    let off = 0;
    for (const c of chunks) { samples.set(c, off); off += c.length; }
    const buffer = new ArrayBuffer(44 + len * 2);
    const view = new DataView(buffer);
    const writeStr = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    writeStr(0, "RIFF");
    view.setUint32(4, 36 + len * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, "data");
    view.setUint32(40, len * 2, true);
    let p = 44;
    for (let i = 0; i < len; i++) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(p, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        p += 2;
    }
    return new Blob([view], { type: "audio/wav" });
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result);
        fr.onerror = reject;
        fr.readAsDataURL(blob);
    });
}

async function stopVoice() {
    if (!voice.recording) return;
    voice.recording = false;
    clearTimeout(voice.autoStop);
    cancelAnimationFrame(voice.rafId);
    const micBtn = document.getElementById("micBtn");
    const bar = document.querySelector(".input-bar");
    if (bar) bar.classList.remove("voice-on");
    if (voice.stream) voice.stream.getTracks().forEach((t) => t.stop());
    if (voice.audioCtx) { try { voice.audioCtx.close(); } catch (e) {} }
    if (micBtn) { micBtn.classList.remove("recording"); micBtn.title = "语音输入"; }
    msgInput.placeholder = "输入消息…（或点右侧麦克风语音输入）";
    if (voice.canvas) voice.canvas.style.opacity = "0";

    const wav = encodeWav(voice.pcm, voice.sampleRate);
    if (!wav || wav.size < 100) { showToast("没有录到声音，请靠近麦克风再试"); return; }

    if (micBtn) { micBtn.classList.add("processing"); micBtn.title = "识别中…"; }
    try {
        const dataUrl = await blobToBase64(wav);
        const b64 = dataUrl.split(",")[1];
        const resp = await fetch("/api/voice", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_b64: b64, format: "wav" }),
        });
        const j = await resp.json();
        if (j.ok && j.text) {
            const prev = msgInput.value.trim();
            msgInput.value = (prev ? prev + " " : "") + j.text.trim();
            autoResizeTextarea();
        } else {
            showToast("语音识别失败：" + (j.error || "未知错误"));
        }
    } catch (e) {
        showToast("语音识别出错：" + (e && e.message ? e.message : e));
    } finally {
        if (micBtn) micBtn.classList.remove("processing");
    }
}

function toggleVoice() {
    if (voice.recording) stopVoice();
    else startVoice();
}

// ===============================
// 主聊天函数
// ===============================
async function sendMessage() {
    const session = getSession();
    if (!session) { showLoginRequired(); return; }
    const text = msgInput.value.trim();
    if ((!text && !pendingFiles.length) || isReplying) return;

    const targetId = activeId;               // 锁定本次回复归属的会话
    const conv = conversations.find(c => c.id === targetId);
    if (!conv) return;

    isReplying = true;
    replyToken++;
    const myToken = replyToken;

    stickToBottom = true; // 发送消息时回到跟随底部
    // 发送前先把附件上传到服务端，拿到可访问的附件元数据
    const attachments = await uploadPendingFiles(session);
    const userMsg = { role: "user", content: text, attachments: attachments };
    appendUserMessage(userMsg);
    conv.messages.push(userMsg);
    saveConversations();
    renderChatList();
    msgInput.value = "";
    pendingFiles = [];
    renderAttachPreview();
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
            body: JSON.stringify({
                message: text,
                history: history,
                username: session.username,
                conversation_id: targetId,
                persona: conv.persona,
                attachments: attachments,
                deep_think: deepThinkEnabled
            })
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
        let lastFiles = null;

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
                    if (obj.error) {
                        if (myToken === replyToken) {
                            aiBubble.classList.remove("thinking-bubble");
                            aiBubble.innerHTML = "⚠️ " + escapeHtml(obj.error);
                            setAvatarState("idle");
                            isReplying = false;
                        }
                        return;
                    }
                    if (obj.type === "files") {
                        if (myToken !== replyToken) return;
                        reply = obj.text || "";
                        lastFiles = obj.files || null;
                        aiBubble.classList.remove("thinking-bubble");
                        aiBubble.innerHTML = escapeHtml(reply) + renderFileChips(lastFiles);
                        scrollBottom();
                        continue;
                    }
                    if (obj.text) {
                        reply += obj.text;
                        if (myToken !== replyToken) return;   // 已切换会话，停止本轮渲染
                        aiBubble.classList.remove("thinking-bubble");
                        // 正在生成文件时，先不展示原始标记
                        if (reply.indexOf("<<<FILE:") >= 0) {
                            aiBubble.innerHTML = "📄 正在生成文件…";
                        } else {
                            aiBubble.innerHTML = escapeHtml(reply);
                        }
                        scrollBottom();
                    }
                } catch (err) {
                    console.log("SSE解析错误:", err, json);
                }
            }
        }

        if (myToken !== replyToken) return;

        const hasContent = reply.length > 0 || lastFiles;
        if (!hasContent) {
            aiBubble.classList.remove("thinking-bubble");
            aiBubble.innerHTML = "（未收到回复）";
        } else {
            updateDocBadge();
        }

        conv.messages.push({ role: "assistant", content: reply, files: lastFiles || null });
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
function renderAttachments(atts) {
    if (!atts || !atts.length) return "";
    return atts.map(a => {
        const url = a.url || "";
        const name = a.name || "文件";
        const isImg = (a.type && a.type.indexOf("image/") === 0) ||
                      /(\.png|\.jpe?g|\.gif|\.webp)$/i.test(name);
        if (isImg) {
            return `<a class="attach-img" href="${url}" target="_blank" rel="noopener">
                        <img src="${url}" alt="${escapeHtml(name)}">
                    </a>`;
        }
        return `<a class="attach-file" href="${url}" target="_blank" rel="noopener" download>📎 ${escapeHtml(name)}</a>`;
    }).join("");
}

function appendUserMessage(msg) {
    const text = (typeof msg === "string") ? msg : (msg.content || "");
    const atts = (typeof msg === "object" && msg.attachments) ? msg.attachments : null;
    const s = getSession();
    const userAvatar = (s && s.avatar) || DEFAULT_AVATAR;
    const box = document.createElement("div");
    box.className = "message user";
    box.innerHTML = `
        <div class="msg-avatar"><img src="${userAvatar}" alt="用户" class="msg-avatar-img"></div>
        <div class="msg-content">
            <div class="bubble">${escapeHtml(text)}${renderAttachments(atts)}</div>
        </div>
    `;
    chatbox.appendChild(box);
    scrollBottom();
}

function appendAIMessage(msg) {
    const text = (typeof msg === "string") ? msg : (msg.content || "");
    const files = (typeof msg === "object" && msg.files) ? msg.files : null;
    const box = document.createElement("div");
    box.className = "message ai";
    box.innerHTML = `
        <div class="msg-avatar">${botAvatarHTML("idle")}</div>
        <div class="msg-content">
            <div class="bubble">${escapeHtml(text)}${renderFileChips(files)}</div>
        </div>
    `;
    chatbox.appendChild(box);
    scrollBottom();
}

// ===============================
// 通知功能 + AI 返回文件（文档面板）
// ===============================

// ---------- 通知（活动信息 / 更新公告） ----------
let _announcements = [];      // 当前公告列表（内存缓存）
let _notifPollTimer = null;   // 轮询定时器

function notifReadKey() {
    const s = getSession();
    return "nova_notif_read_" + (s ? s.username : "guest");
}
function notifCacheKey() {
    const s = getSession();
    return "nova_announcements_cache_" + (s ? s.username : "guest");
}
function getReadIds() {
    try { return JSON.parse(localStorage.getItem(notifReadKey()) || "[]"); } catch (e) { return []; }
}
function saveReadIds(ids) {
    try { localStorage.setItem(notifReadKey(), JSON.stringify(ids)); } catch (e) {}
}
function isAnnouncementRead(id) {
    return getReadIds().indexOf(id) >= 0;
}
function markAllAnnouncementsRead() {
    const ids = _announcements.map(a => a.id);
    saveReadIds(ids);
    updateNotifBadge();
}
function loadCachedAnnouncements() {
    try { return JSON.parse(localStorage.getItem(notifCacheKey()) || "[]"); } catch (e) { return []; }
}
function saveCachedAnnouncements(arr) {
    try { localStorage.setItem(notifCacheKey(), JSON.stringify(arr)); } catch (e) {}
}

// 从后端拉取公告
function fetchAnnouncements() {
    return fetch("/api/announcements")
        .then(r => r.json())
        .then(data => (data.announcements || []))
        .catch(() => loadCachedAnnouncements());
}

// 拉取并检查新公告（页面加载 / 轮询时调用）
function fetchAndCheckAnnouncements() {
    fetchAnnouncements().then(list => {
        const prevIds = loadCachedAnnouncements().map(a => a.id);
        _announcements = list;
        saveCachedAnnouncements(list);

        // 检测新公告（之前缓存里没有的）
        const newOnes = list.filter(a => prevIds.indexOf(a.id) < 0);
        if (newOnes.length > 0 && document.hidden) {
            const latest = newOnes[0];
            notifyDesktop(latest.title || "NOVA 通知", (latest.body || "").slice(0, 140));
        }
        updateNotifBadge();
    });
}

function updateNotifBadge() {
    const unread = _announcements.filter(a => !isAnnouncementRead(a.id)).length;
    const b = document.getElementById("notifBadge");
    if (!b) return;
    if (unread > 0) { b.hidden = false; b.textContent = unread > 99 ? "99+" : String(unread); }
    else { b.hidden = true; }
}

function renderNotifPanel() {
    const list = document.getElementById("notifList");
    if (!list) return;
    const arr = _announcements;
    if (!arr.length) { list.innerHTML = '<div class="dp-empty">暂无通知</div>'; return; }
    const typeIcon = { "update": "\uD83D\uDCE2", "activity": "\uD83C\uDF89", "feature": "\u2728" };
    list.innerHTML = arr.map(n => `
        <div class="dp-item ${isAnnouncementRead(n.id) ? "" : "dp-unread"}" data-id="${n.id}">
            <div class="dp-item-title">${typeIcon[n.type] || "\uD83D\uDD14"} ${escapeHtml(n.title)}</div>
            <div class="dp-item-body">${escapeHtml(n.body)}</div>
            <div class="dp-item-time">${timeAgo((n.ts || 0) * 1000)}</div>
        </div>`).join("");

    // 点击通知弹出详情
    list.querySelectorAll(".dp-item").forEach(el => {
        el.addEventListener("click", () => {
            const id = el.dataset.id;
            const n = arr.find(a => a.id === id);
            if (!n) return;
            const modal = document.getElementById("notifModal");
            if (!modal) return;
            document.getElementById("notifModalTitle").textContent = n.title;
            document.getElementById("notifModalBody").textContent = n.body;
            const icon = typeIcon[n.type] || "\uD83D\uDD14";
            document.getElementById("notifModalIcon").textContent = icon;
            modal.classList.add("show");
            markAnnouncementRead(id);
            renderNotifPanel();
            updateNotifBadge();
        });
    });
}

function notifyDesktop(title, body) {
    try {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") {
            new Notification(title, { body: body });
        }
    } catch (e) {}
}

// 启动通知轮询（每 5 分钟检查新公告）
function startNotifPolling() {
    if (_notifPollTimer) clearInterval(_notifPollTimer);
    _notifPollTimer = setInterval(fetchAndCheckAnnouncements, 5 * 60 * 1000);
}

// ---------- 文档 / AI 返回文件 ----------
function collectConvFiles(conv) {
    const out = [];
    (conv.messages || []).forEach(m => {
        if (m.role === "assistant" && m.files && m.files.length) {
            m.files.forEach(f => out.push(Object.assign({}, f, { source: "AI" })));
        }
        if (m.role === "user" && m.attachments && m.attachments.length) {
            m.attachments.forEach(f => out.push(Object.assign({}, f, { source: "我" })));
        }
    });
    return out;
}
function renderFileChips(files) {
    if (!files || !files.length) return "";
    return `<div class="file-chips">` + files.map(f => `
        <button class="file-chip" type="button" data-url="${f.url}" data-name="${escapeHtml(f.name || "文件")}">
            <span class="file-ic">📄</span><span class="file-name">${escapeHtml(f.name || "文件")}</span>
        </button>`).join("") + `</div>`;
}
const TEXT_EXTS = [".txt", ".md", ".markdown", ".json", ".csv", ".log", ".tsv",
    ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".c", ".cpp", ".h", ".hpp",
    ".html", ".htm", ".css", ".scss", ".xml", ".yaml", ".yml", ".ini", ".conf",
    ".toml", ".sql", ".sh", ".bat", ".ps1", ".go", ".rs", ".rb", ".php",
    ".swift", ".kt", ".r", ".lua"];
function openFile(f) {
    if (!f) return;
    const name = f.name || "";
    const ext = (name.indexOf(".") >= 0) ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";
    if (TEXT_EXTS.indexOf(ext) >= 0) {
        fetch(f.url).then(r => r.text()).then(t => {
            const nm = document.getElementById("fileModalName");
            const pv = document.getElementById("filePreview");
            const dl = document.getElementById("fileModalDownload");
            if (nm) nm.textContent = name;
            if (pv) pv.textContent = t;
            if (dl) dl.href = f.url;
            openModal("fileModal");
        }).catch(() => { window.open(f.url, "_blank"); });
    } else {
        window.open(f.url, "_blank");
    }
}
function updateDocBadge() {
    const c = getActive();
    const n = c ? collectConvFiles(c).length : 0;
    const b = document.getElementById("docBadge");
    if (!b) return;
    if (n > 0) { b.hidden = false; b.textContent = n > 99 ? "99+" : String(n); }
    else { b.hidden = true; }
}
function renderDocPanel() {
    const list = document.getElementById("docList");
    const titleEl = document.getElementById("docConvTitle");
    const c = getActive();
    if (titleEl && c) titleEl.textContent = (c.title && c.title !== "新的对话") ? "· " + c.title : "";
    const files = c ? collectConvFiles(c) : [];
    if (!list) return;
    if (!files.length) { list.innerHTML = '<div class="dp-empty">本对话暂无文档</div>'; return; }
    list.innerHTML = files.map((f, i) => `
        <div class="dp-item file-item" data-idx="${i}">
            <span class="dp-file-ic">📄</span>
            <div class="dp-file-meta">
                <div class="dp-item-title">${escapeHtml(f.name || "文件")}</div>
                <div class="dp-item-sub">${f.source === "AI" ? "AI 返回" : "我上传"}</div>
            </div>
        </div>`).join("");
    list.querySelectorAll(".file-item").forEach(el => {
        el.addEventListener("click", () => {
            const f = files[Number(el.getAttribute("data-idx"))];
            openFile(f);
        });
    });
}

// ---------- 面板开关 ----------
function togglePanel(panel, other) {
    if (other) other.hidden = true;
    if (!panel) return;
    panel.hidden = !panel.hidden;
}
function bindNotifAndDoc() {
    const notifBtn = document.getElementById("notifBtn");
    const docBtn = document.getElementById("docBtn");
    const notifPanel = document.getElementById("notifPanel");
    const docPanel = document.getElementById("docPanel");
    const notifClear = document.getElementById("notifClear");

    if (notifBtn) notifBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePanel(notifPanel, docPanel);
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
        renderNotifPanel();
        markAllAnnouncementsRead();
    });
    if (notifClear) notifClear.addEventListener("click", (e) => {
        e.stopPropagation();
        markAllAnnouncementsRead();
        renderNotifPanel();
    });
    if (docBtn) docBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        togglePanel(docPanel, notifPanel);
        renderDocPanel();
    });

    // 点击空白处关闭两个面板
    document.addEventListener("click", (e) => {
        [["notifPanel", "notifBtn"], ["docPanel", "docBtn"]].forEach(([pid, bid]) => {
            const p = document.getElementById(pid);
            const b = document.getElementById(bid);
            const inBtn = b ? b.contains(e.target) : false;
            if (p && !p.hidden && !p.contains(e.target) && !inBtn) {
                p.hidden = true;
            }
        });
    });

    // 对话气泡内文件卡片点击 → 预览
    if (chatbox) chatbox.addEventListener("click", (e) => {
        const chip = e.target.closest(".file-chip");
        if (chip) {
            openFile({ url: chip.getAttribute("data-url"), name: chip.getAttribute("data-name") });
        }
    });
}

// ===============================
// GPT-SoVITS 语音
// ===============================
async function playTTS(text) {
    if (!ttsEnabled) { setAvatarState("idle"); isReplying = false; return; }
    try {
        const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: text })
        });

        const data = await res.json();

        if (data.url) {
            // 停止上一段还在播放的语音
            if (currentAudio) { currentAudio.pause(); currentAudio = null; }
            const audio = new Audio(data.url);
            currentAudio = audio;
            audio.play();
            analyzeAudio(audio);

            audio.onended = () => {
                currentAudio = null;
                setAvatarState("idle");
                isReplying = false;
            };
            audio.onerror = () => {
                currentAudio = null;
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
    const tagEl = document.getElementById("charTag");
    const baseEl = document.getElementById("charBase");
    const progEl = document.getElementById("charProgress");
    const learnedEl = document.getElementById("charLearned");
    const st = characterState || {};
    if (nameEl) nameEl.textContent = st.name || "小诺";
    // 人设标签（如「高冷御姐」「温柔姐姐」），来自该对话专属 persona
    if (tagEl) {
        if (st.persona_title) {
            tagEl.textContent = st.persona_title;
            tagEl.hidden = false;
        } else {
            tagEl.hidden = true;
        }
    }
    // 人设描述（每对话独特的初始设定），高亮展示
    if (baseEl) {
        if (st.base_setting && st.base_setting.trim()) {
            baseEl.textContent = st.base_setting;
            baseEl.hidden = false;
        } else {
            baseEl.hidden = true;
        }
    }
    if (progEl) {
        const need = Math.max(0, (st.threshold || 8) - (st.pending || 0));
        progEl.textContent = st.learned
            ? `已学习 ${st.learned_turns || 0} 轮`
            : `还差 ${need} 轮自动学习`;
    }
    if (learnedEl) {
        learnedEl.textContent = st.learned
            ? st.learned
            : "（暂无学习到的内容，多聊几句或点「重新学习」）";
    }
}

async function loadCharacter() {
    const session = getSession();
    const conv = getActive();
    const cid = conv ? conv.id : "";
    const url = session
        ? `/api/character?username=${encodeURIComponent(session.username)}&conversation_id=${encodeURIComponent(cid)}`
        : "/api/character";
    try {
        const res = await fetch(url);
        if (!res.ok) return;
        const st = await res.json();
        // 服务端尚无该对话（刚新建、尚未同步）时，沿用本地人设，避免被默认值覆盖
        const p = (st.not_found && conv) ? conv.persona : st;
        characterState = p;
        if (conv && !st.not_found) {
            conv.persona = {
                name: st.name, base_setting: st.base_setting, learned: st.learned,
                learned_turns: st.learned_turns, bot_avatar: st.bot_avatar, updated_at: st.updated_at || 0
            };
            saveConversations();
        }
        currentBotAvatar = p.bot_avatar || null;
        injectAvatars("idle");
        renderCharacterCard();
        const headerName = document.getElementById("chatHeaderName");
        if (headerName) headerName.textContent = (p.name && p.name !== "小诺") ? p.name + " · NOVA" : "小诺 NOVA";
    } catch (e) {
        console.log("加载角色画像失败", e);
    }
}

function openCharacterModal() {
    const modal = document.getElementById("charModal");
    const nameInput = document.getElementById("charNameInput");
    const baseInput = document.getElementById("charBaseInput");
    const conv = getActive();
    const p = conv ? conv.persona : characterState;
    if (nameInput) nameInput.value = p.name || "";
    if (baseInput) baseInput.value = p.base_setting || "";
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
    const conv = getActive();
    const payload = {
        username: session ? session.username : "",
        conversation_id: conv ? conv.id : "",
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
            if (conv) { conv.persona = data.profile; saveConversations(); }
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
    if (btn) { btn.disabled = true; btn.textContent = "重置中…"; }
    const session = getSession();
    const uname = session ? session.username : "";
    const conv = getActive();
    const cid = conv ? conv.id : "";

    // 当前对话全部回到出厂默认：清空 AI 已学人设、初始设定、名字、头像
    try {
        await fetch("/api/character", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: uname, conversation_id: cid, reset_all: true })
        });
    } catch (e) {}
    currentBotAvatar = null;
    injectAvatars("idle");

    try {
        const res = await fetch(`/api/character?username=${encodeURIComponent(uname)}&conversation_id=${encodeURIComponent(cid)}`);
        const st = await res.json();
        characterState = st;
        if (conv) {
            conv.persona = {
                name: st.name, base_setting: st.base_setting, learned: st.learned,
                learned_turns: st.learned_turns, bot_avatar: st.bot_avatar, updated_at: st.updated_at || 0
            };
            saveConversations();
        }
        renderCharacterCard();
        showToast("当前对话 AI 已重置为初始状态");
    } catch (e) {
        console.log("重置失败", e);
        showToast("重置失败");
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "重新训练"; }
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
    const conv = getActive();
    const cid = conv ? conv.id : "";
    try {
        await fetch("/api/character/learn-file", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: s.username, conversation_id: cid, content })
        });
        const start = Date.now();
        while (Date.now() - start < 90000) {
            await new Promise(r => setTimeout(r, 2000));
            const res = await fetch(`/api/character?username=${encodeURIComponent(s.username)}&conversation_id=${encodeURIComponent(cid)}`);
            const st = await res.json();
            characterState = st;
            if (conv) {
                conv.persona = {
                    name: st.name, base_setting: st.base_setting, learned: st.learned,
                    learned_turns: st.learned_turns, bot_avatar: st.bot_avatar, updated_at: st.updated_at || 0
                };
                saveConversations();
            }
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
    const learnFileBtn = document.getElementById("learnFileBtn");
    const learnFileInput = document.getElementById("learnFileInput");
    const saveBtn = document.getElementById("charModalSave");
    const cancelBtn = document.getElementById("charModalCancel");
    const modal = document.getElementById("charModal");
    if (editBtn) editBtn.addEventListener("click", openCharacterModal);
    const learnCharBtn = document.getElementById("learnCharBtn");
    if (learnCharBtn) learnCharBtn.addEventListener("click", learnCharacter);
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

// ---- 更换机器人头像 ----
function bindBotAvatarUpload() {
    const overlay = document.getElementById("botAvatarOverlay");
    const input = document.getElementById("botAvatarInput");
    if (!overlay || !input) return;
    overlay.addEventListener("click", () => { input.click(); });
    const editBtn = document.getElementById("editProfileBtn");
    if (editBtn) editBtn.addEventListener("click", () => { input.click(); });
    input.addEventListener("change", async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const session = getSession();
        if (!session) { showLoginRequired(); return; }
        const fd = new FormData();
        const conv = getActive();
        fd.append("username", session.username);
        fd.append("conversation_id", conv ? conv.id : "");
        fd.append("file", file);
        overlay.classList.add("uploading");
        try {
            const resp = await fetch("/api/bot/avatar", { method: "POST", body: fd });
            const data = await resp.json();
            if (data.ok) {
                currentBotAvatar = data.avatar;
                injectAvatars("idle");
                if (conv) { conv.persona.bot_avatar = data.avatar; saveConversations(); }
                showToast("机器人头像已更新");
            } else {
                showToast(data.msg || "上传失败");
            }
        } catch (e) {
            showToast("网络错误");
        } finally {
            overlay.classList.remove("uploading");
            input.value = "";
        }
    });
}

// ---- 预设人设选择面板 ----
function presetEmoji(key) {
    const m = { cold: "❄️", warm: "🌸", tsundere: "😤", cute: "🍬" };
    return m[key] || "✨";
}
function closePresetModal() {
    const modal = document.getElementById("presetModal");
    if (modal) modal.classList.remove("show");
}
function initPresetModal() {
    const modal = document.getElementById("presetModal");
    if (!modal) return;
    const list = modal.querySelector(".preset-list");
    if (list) {
        list.innerHTML = "";
        PERSONA_PRESETS.forEach(p => {
            const b = document.createElement("button");
            b.className = "preset-item";
            b.innerHTML = `<span class="preset-emoji">${presetEmoji(p.key)}</span>` +
                `<span class="preset-title">${escapeHtml(p.title)}</span>` +
                `<span class="preset-desc">${escapeHtml(p.base)}</span>`;
            b.addEventListener("click", () => { closePresetModal(); createConversationFromPreset(p); });
            list.appendChild(b);
        });
        const custom = document.createElement("button");
        custom.className = "preset-item preset-custom";
        custom.innerHTML = `<span class="preset-emoji">✏️</span>` +
            `<span class="preset-title">自定义人设</span>` +
            `<span class="preset-desc">自己填写名字与初始设定</span>`;
        custom.addEventListener("click", () => { closePresetModal(); createConversationFromPreset({ key: "custom" }); });
        list.appendChild(custom);
    }
    const cancel = modal.querySelector(".preset-cancel");
    if (cancel) cancel.addEventListener("click", closePresetModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closePresetModal(); });
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
    bindBotAvatarUpload();
    bindNotifAndDoc();
    fetchAndCheckAnnouncements();
    startNotifPolling();
    updateDocBadge();
    initPresetModal();
    const micBtn = document.getElementById("micBtn");
    if (micBtn) micBtn.addEventListener("click", toggleVoice);
    console.log("小诺 NOVA 对话系统启动完成");
});

// ===============================
// 内部导航助手：使用相对路径，兼容本地/隧道/域名访问
// ===============================
function backendBase() {
    return "";
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
            // 同步更新聊天中已有的用户消息头像
            document.querySelectorAll(".message.user .msg-avatar img").forEach(el => {
                el.src = data.avatar;
            });
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

// ===============================
// 更多按钮下拉菜单
// ===============================
(function initMoreMenu() {
    const btn = document.getElementById("moreBtn");
    const menu = document.getElementById("moreDropdown");
    if (!btn || !menu) return;

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
    });
    document.addEventListener("click", (e) => {
        if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) {
            menu.hidden = true;
        }
    });

    menu.querySelectorAll(".md-item").forEach((item) => {
        item.addEventListener("click", () => {
            menu.hidden = true;
            const act = item.getAttribute("data-act");
            if (act === "clear") doClearChat();
            else if (act === "pin") doTogglePin();
            else if (act === "tts") doToggleTTS(item);
            else if (act === "think") doToggleThink(item);
            else if (act === "font") doCycleFont(item);
        });
    });
})();

let ttsEnabled = localStorage.getItem("nova_tts") !== "off";
let currentAudio = null;  // 当前播放的语音，用于立即停止
function doClearChat() {
    const c = conversations.find(c => c.id === activeId);
    if (!c || !c.messages.length) return;
    if (!confirm("确定要清除当前对话的所有消息吗？")) return;
    c.messages = [];
    saveConversations();
    renderActiveMessages();
    showToast("对话已清除");
}

function doTogglePin() {
    const c = conversations.find(c => c.id === activeId);
    if (!c) return;
    c.pinned = !c.pinned;
    saveConversations();
    renderChatList();
    showToast(c.pinned ? "已置顶" : "已取消置顶");
}

// 深度思考开关
let deepThinkEnabled = localStorage.getItem("nova_deep_think") === "on";
function doToggleThink() {
    deepThinkEnabled = !deepThinkEnabled;
    localStorage.setItem("nova_deep_think", deepThinkEnabled ? "on" : "off");
    const badge = document.getElementById("thinkBadge");
    if (badge) {
        badge.textContent = deepThinkEnabled ? "开" : "关";
        badge.style.background = deepThinkEnabled ? "var(--accent)" : "var(--text-tertiary)";
    }
    showToast(deepThinkEnabled ? "深度思考已开启（qwen3:8b）" : "深度思考已关闭（qwen3:4b）");
}

function doToggleTTS() {
    ttsEnabled = !ttsEnabled;
    localStorage.setItem("nova_tts", ttsEnabled ? "on" : "off");
    
    // 关掉语音时，正在播放的立刻停止
    if (!ttsEnabled && currentAudio) {
        currentAudio.pause();
        currentAudio = null;
        setAvatarState("idle");
        isReplying = false;
    }
    
    const badge = document.getElementById("ttsBadge");
    if (badge) {
        badge.textContent = ttsEnabled ? "开" : "关";
        badge.style.background = ttsEnabled ? "" : "var(--text-tertiary)";
    }
    showToast(ttsEnabled ? "语音回复已开启" : "语音回复已关闭");
}

// 字体大小（存 localStorage）
const fontSizes = ["小", "中", "大"];
const fontVals = ["13px", "15px", "17px"];
function getFontIdx() {
    const saved = localStorage.getItem("nova_font");
    if (saved === "0") return 0;
    if (saved === "2") return 2;
    return 1; // 默认中
}
function doCycleFont() {
    const idx = (getFontIdx() + 1) % fontSizes.length;
    localStorage.setItem("nova_font", String(idx));
    applyFont(idx);
    showToast("字体已设为" + fontSizes[idx]);
}
function applyFont(idx) {
    const chatbox = document.getElementById("chatbox");
    if (chatbox) chatbox.style.setProperty("--chat-font-size", fontVals[idx]);
    const badge = document.getElementById("fontBadge");
    if (badge) badge.textContent = fontSizes[idx];
}

// 页面加载时恢复字体
applyFont(getFontIdx());

// ===============================
// 密码小眼睛
// ===============================
(function initPasswordToggles() {
    const eyeSVG = (open) => open
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    document.querySelectorAll("input[type='password']").forEach(input => {
        if (input.closest(".pwd-wrap")) return;
        const wrap = document.createElement("span");
        wrap.className = "pwd-wrap";
        const eye = document.createElement("button");
        eye.type = "button";
        eye.className = "pwd-eye";
        eye.innerHTML = eyeSVG(false);
        eye.setAttribute("aria-label", "显示密码");
        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(input);
        wrap.appendChild(eye);
        eye.addEventListener("click", () => {
            const show = input.type === "password";
            input.type = show ? "text" : "password";
            eye.innerHTML = eyeSVG(show);
            eye.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
        });
    });
})();
