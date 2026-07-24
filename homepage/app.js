// NOVA 首页交互
const DEFAULT_AVATAR = "nova-hero.jpg";

document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll(".nav-links a");
    const sections = document.querySelectorAll("#hero, #features, #scenes, #about");
    const NAV_H = document.getElementById("topNav")?.offsetHeight || 70;

    // 缓动函数：easeInOutCubic
    function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // 手动平滑滚动（保证在任何浏览器都丝滑）
    function scrollToSection(id) {
        const el = document.querySelector(id);
        if (!el) return;
        const startY = window.scrollY;
        const targetY = el.getBoundingClientRect().top + startY - NAV_H;
        const distance = targetY - startY;
        const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 300), 800);
        let startTime = null;

        function step(now) {
            if (!startTime) startTime = now;
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, startY + distance * ease(progress));
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // 点击导航：平滑滚动 + 高亮
    links.forEach((a) => {
        a.addEventListener("click", (e) => {
            const id = a.getAttribute("href");
            if (id && id.startsWith("#") && document.querySelector(id)) {
                e.preventDefault();
                scrollToSection(id);
                links.forEach((x) => x.classList.remove("active"));
                a.classList.add("active");
            }
        });
    });

    // 滚动高亮（带节流）
    let ticking = false;
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                let current = "hero";
                sections.forEach((s) => {
                    const top = s.offsetTop - NAV_H - 1;
                    if (window.scrollY >= top) current = s.id;
                });
                links.forEach((a) => {
                    a.classList.remove("active");
                    if (a.getAttribute("href") === "#" + current) a.classList.add("active");
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    // 入场动画
    const heroBits = document.querySelectorAll(".hero-text > *, .show-card");
    heroBits.forEach((el, i) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(18px)";
        el.style.transition = "opacity .6s ease, transform .6s ease";
        setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }, 120 + i * 70);
    });

    initUserMenu();
    bindStartChatButtons();
    initPasswordToggles();
});

// ===============================
// 密码小眼睛
// ===============================
function initPasswordToggles() {
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
}// ===============================
// 登录态：头像 + 下拉菜单 + 弹窗
// ===============================
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
    const loginBtn = document.getElementById("loginBtn");
    const userMenu = document.getElementById("userMenu");
    const avatarImg = document.getElementById("userAvatarImg");
    const udAvatar = document.getElementById("udAvatar");
    const udName = document.getElementById("udName");
    const avatarBtn = document.getElementById("userAvatarBtn");
    const dropdown = document.getElementById("userDropdown");

    if (!session) {
        // 未登录：显示登录按钮，隐藏头像菜单
        if (loginBtn) {
            loginBtn.hidden = false;
            loginBtn.addEventListener("click", (e) => {
                e.preventDefault();
                go("/auth/");
            });
        }
        if (userMenu) userMenu.hidden = true;
        return;
    }

    // 已登录：隐藏登录按钮，显示头像
    if (loginBtn) loginBtn.hidden = true;
    if (userMenu) userMenu.hidden = false;

    const avatar = session.avatar || DEFAULT_AVATAR;
    if (avatarImg) avatarImg.src = avatar;
    if (udAvatar) udAvatar.src = avatar;
    if (udName) udName.textContent = session.username;

    // 头像点击：切换下拉菜单
    avatarBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const open = dropdown.hidden;
        dropdown.hidden = !open;
        avatarBtn.setAttribute("aria-expanded", String(open));
    });

    // 点击其他区域关闭菜单
    document.addEventListener("click", (e) => {
        if (userMenu && !userMenu.contains(e.target)) {
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

    // 绑定弹窗事件
    bindModals();
}

// ---- 内部导航助手：使用相对路径，兼容本地/隧道/域名访问 ----
function backendBase() {
    return "";
}
function go(path) {
    window.location.href = backendBase() + path;
}

// ---- 切换用户：清除会话，回到登录页 ----
function onSwitchUser() {
    clearSession();
    go("/auth/");
}

// ---- 弹窗通用控制 ----
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.hidden = false;
}
function closeModal(m) {
    m.hidden = true;
    // 清空错误与输入
    m.querySelectorAll(".modal-err").forEach((e) => (e.textContent = ""));
    m.querySelectorAll("input").forEach((i) => (i.value = ""));
    const prev = m.querySelector(".avatar-preview img");
    if (prev) prev.src = (getSession() && getSession().avatar) || DEFAULT_AVATAR;
}

function bindModals() {
    document.querySelectorAll(".modal-mask").forEach((mask) => {
        // 点遮罩关闭
        mask.addEventListener("click", (e) => {
            if (e.target === mask) closeModal(mask);
        });
        // 关闭按钮
        mask.querySelectorAll("[data-close]").forEach((b) => {
            b.addEventListener("click", () => closeModal(mask));
        });
    });

    document.getElementById("avatarSave").addEventListener("click", onAvatarSave);
    document.getElementById("pwdSave").addEventListener("click", onPwdSave);
    document.getElementById("delConfirm").addEventListener("click", onDelConfirm);

    // 头像预览
    const input = document.getElementById("avatarInput");
    const preview = document.getElementById("avatarPreview");
    input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        if (file) preview.src = URL.createObjectURL(file);
    });
}

function openAvatarModal() {
    const s = getSession();
    document.getElementById("avatarPreview").src = (s && s.avatar) || DEFAULT_AVATAR;
    document.getElementById("avatarInput").value = "";
    document.getElementById("avatarPwd").value = "";
    document.getElementById("avatarPwdErr").textContent = "";
    document.getElementById("avatarErr").textContent = "";
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
    const file = input.files && input.files[0];
    if (!pwdEl.value) { document.getElementById("avatarPwdErr").textContent = "请输入密码"; return; }
    if (!file) {
        errEl.textContent = "请先选择一张图片";
        return;
    }
    const fd = new FormData();
    fd.append("username", s.username);
    fd.append("password", pwdEl.value);
    fd.append("file", file);

    errEl.textContent = "上传中…";
    try {
        const resp = await fetch("/api/user/avatar", { method: "POST", body: fd });
        const data = await resp.json();
        if (data.ok) {
            setSession({ username: s.username, avatar: data.avatar });
            document.getElementById("userAvatarImg").src = data.avatar;
            document.getElementById("udAvatar").src = data.avatar;
            closeModal(document.getElementById("avatarModal"));
            showToast("头像已更新");
        } else {
            document.getElementById("avatarPwdErr").textContent = "";
            errEl.textContent = data.msg || "上传失败";
        }
    } catch (e) {
        errEl.textContent = "网络错误，请确认后端已启动";
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

    document.getElementById("pwdOldErr").textContent = "";
    document.getElementById("pwdNewErr").textContent = "";
    document.getElementById("pwdNew2Err").textContent = "";
    errEl.textContent = "";

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
            errEl.textContent = data.msg || "修改失败";
        }
    } catch (e) {
        errEl.textContent = "网络错误，请确认后端已启动";
    }
}

// ---- 注销账号 ----
async function onDelConfirm() {
    const s = getSession();
    const pwd = document.getElementById("delPwd").value;
    const errEl = document.getElementById("delErr");
    errEl.textContent = "";
    if (!pwd) { errEl.textContent = "请输入密码"; return; }
    if (!confirm("确定要永久注销账号「" + s.username + "」吗？此操作不可恢复。")) return;

    try {
        const resp = await fetch("/api/user/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: s.username, password: pwd }),
        });
        const data = await resp.json();
        if (data.ok) {
            clearSession();
            showToast("账号已注销");
            setTimeout(() => { go("/auth/"); }, 600);
        } else {
            errEl.textContent = data.msg || "注销失败";
        }
    } catch (e) {
        errEl.textContent = "网络错误，请确认后端已启动";
    }
}

// ---- Toast ----
let toastTimer = null;
function showToast(msg) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---- 开启对话按钮：兼容 VS Code Live Server 与后端 7860 ----
function bindStartChatButtons() {
    document.querySelectorAll(".js-start-chat").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (!getSession()) {
                go("/auth/");
                return;
            }
            go("/chat/");
        });
    });
}
