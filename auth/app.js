// ===============================
// NOVA 登录 / 注册 交互（已接入后端）
// ===============================

// 后端地址（使用相对路径，兼容本地/隧道/域名访问）
const API = "";
const HOME = API + "/home/";

const viewLogin = document.getElementById("viewLogin");
const viewRegister = document.getElementById("viewRegister");
const viewForgot = document.getElementById("viewForgot");
const toast = document.getElementById("toast");

// ---- 视图切换 ----
function showView(view) {
    viewLogin.classList.toggle("active", view === "login");
    viewRegister.classList.toggle("active", view === "register");
    viewForgot.classList.toggle("active", view === "forgot");
    window.scrollTo({ top: 0 });
}

document.getElementById("toRegister").addEventListener("click", (e) => {
    e.preventDefault();
    showView("register");
});

document.getElementById("toLogin").addEventListener("click", (e) => {
    e.preventDefault();
    showView("login");
});

document.getElementById("toForgot").addEventListener("click", (e) => {
    e.preventDefault();
    showView("forgot");
});

document.getElementById("toLoginFromForgot").addEventListener("click", (e) => {
    e.preventDefault();
    showView("login");
});

// ---- Toast ----
let toastTimer = null;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---- 表单校验工具 ----
function setError(input, msg) {
    const field = input.closest(".field");
    field.classList.toggle("invalid", !!msg);
    const errEl = field.querySelector(".field-err");
    if (errEl) errEl.textContent = msg || "";
}

function clearError(input) {
    setError(input, "");
}

document.querySelectorAll(".field input").forEach((inp) => {
    inp.addEventListener("input", () => clearError(inp));
});

// 前端规则（与后端保持一致，仅做即时反馈；后端为权威校验）
const RE_USER = /^[A-Za-z0-9]+$/;
const RE_PWD = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const RE_PHONE = /^1[3-9]\d{9}$/;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---- 登录 ----
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const account = loginForm.account.value.trim();
    const password = loginForm.password.value;

    if (!account) {
        setError(loginForm.account, "请输入账号");
        return;
    }
    if (!password) {
        setError(loginForm.password, "请输入密码");
        return;
    }

    try {
        const resp = await fetch(API + "/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account, password }),
        });
        const data = await resp.json();

        if (data.needRegister) {
            showToast("尚未注册，请先创建账号");
            showView("register");
            return;
        }
        if (data.ok) {
            // 写入本地会话，供首页渲染头像与账号菜单
            localStorage.setItem("nova_session", JSON.stringify({
                username: data.username,
                avatar: data.avatar || null,
            }));
            showToast("登录成功，正在进入主页…");
            setTimeout(() => { window.location.href = HOME; }, 600);
            return;
        }
        showToast(data.msg || "登录失败");
    } catch (err) {
        showToast("网络错误，请确认后端已启动");
    }
});

// ---- 注册 ----
const registerForm = document.getElementById("registerForm");
registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = registerForm.username.value.trim();
    const phone = registerForm.phone.value.trim();
    const email = registerForm.email.value.trim();
    const password = registerForm.password.value;
    const confirm = registerForm.confirm.value;

    let ok = true;
    if (!username) {
        setError(registerForm.username, "请输入用户名");
        ok = false;
    } else if (!RE_USER.test(username)) {
        setError(registerForm.username, "用户名只能包含英文字母和数字");
        ok = false;
    }
    if (!phone) {
        setError(registerForm.phone, "请输入手机号");
        ok = false;
    } else if (!RE_PHONE.test(phone)) {
        setError(registerForm.phone, "请输入正确的 11 位手机号");
        ok = false;
    }
    if (!email) {
        setError(registerForm.email, "请输入邮箱");
        ok = false;
    } else if (!RE_EMAIL.test(email)) {
        setError(registerForm.email, "邮箱格式不正确");
        ok = false;
    }
    if (!password) {
        setError(registerForm.password, "请输入密码");
        ok = false;
    } else if (!RE_PWD.test(password)) {
        setError(registerForm.password, "密码至少 8 位，且含字母和数字");
        ok = false;
    }
    if (confirm !== password) {
        setError(registerForm.confirm, "两次密码不一致");
        ok = false;
    }
    if (!ok) return;

    try {
        const resp = await fetch(API + "/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, phone, email, password }),
        });
        const data = await resp.json();

        if (data.ok) {
            // 写入本地会话（注册时无自定义头像，用默认数字人头像）
            localStorage.setItem("nova_session", JSON.stringify({
                username: username,
                avatar: null,
            }));
            showToast("注册成功，正在进入主页…");
            setTimeout(() => { window.location.href = HOME; }, 600);
            return;
        }
        showToast(data.msg || "注册失败");
    } catch (err) {
        showToast("网络错误，请确认后端已启动");
    }
});

// ---- 忘记密码（同页切换，不跳转）----
const forgotForm = document.getElementById("forgotForm");
forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const account = forgotForm.account.value.trim();
    const email = forgotForm.email.value.trim();
    const np = forgotForm.new_password.value;
    const cp = forgotForm.confirm_password.value;

    let ok = true;
    if (!account) { setError(forgotForm.account, "请输入账号"); ok = false; }
    if (!email) { setError(forgotForm.email, "请输入邮箱"); ok = false; }
    else if (!RE_EMAIL.test(email)) { setError(forgotForm.email, "邮箱格式不正确"); ok = false; }
    if (!np) { setError(forgotForm.new_password, "请输入新密码"); ok = false; }
    else if (!RE_PWD.test(np)) { setError(forgotForm.new_password, "密码至少 8 位，且含字母和数字"); ok = false; }
    if (cp !== np) { setError(forgotForm.confirm_password, "两次密码不一致"); ok = false; }
    if (!ok) return;

    try {
        const resp = await fetch(API + "/api/forgot/reset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ account, email, new_password: np, confirm_password: cp }),
        });
        const data = await resp.json();
        if (data.ok) {
            showToast("密码已重置，请用新密码登录");
            forgotForm.reset();
            setTimeout(() => showView("login"), 900);
            return;
        }
        showToast(data.msg || "重置失败");
    } catch (err) {
        showToast("网络错误，请确认后端已启动");
    }
});

// 启动
window.addEventListener("load", () => {
    showView("login");
    initPasswordToggles();
});

// 密码小眼睛
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
}
