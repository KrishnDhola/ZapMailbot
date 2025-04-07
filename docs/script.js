const API = "https://api.mail.tm";
let token = null;
let accountId = null;

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const generateBtn = document.getElementById("generate");
const saveBtn = document.getElementById("save");
const messageList = document.getElementById("message-list");
const msgPreview = document.getElementById("message-preview");

generateBtn.onclick = async () => {
  const { address, password } = await generateAccount();
  emailInput.value = address;
  passwordInput.value = password;
};

saveBtn.onclick = async () => {
  const address = emailInput.value;
  const password = passwordInput.value;

  const loginRes = await fetch(\`\${API}/token\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });

  const loginData = await loginRes.json();
  token = loginData.token;

  if (token) {
    fetchInbox();
  } else {
    alert("Login failed. Try again.");
  }
};

async function generateAccount() {
  const domainRes = await fetch(\`\${API}/domains\`);
  const domains = await domainRes.json();
  const domain = domains["hydra:member"][0].domain;

  const random = Math.random().toString(36).substring(2, 10);
  const address = \`\${random}@\${domain}\`;
  const password = Math.random().toString(36).substring(2, 10);

  await fetch(\`\${API}/accounts\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address, password }),
  });

  return { address, password };
}

async function fetchInbox() {
  const inboxRes = await fetch(\`\${API}/messages\`, {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  const inboxData = await inboxRes.json();

  messageList.innerHTML = "";
  inboxData["hydra:member"].forEach((msg) => {
    const li = document.createElement("li");
    li.textContent = \`\${msg.from.address} — \${msg.subject}\`;
    li.onclick = () => showMessage(msg.id);
    messageList.appendChild(li);
  });
}

async function showMessage(id) {
  const msgRes = await fetch(\`\${API}/messages/\${id}\`, {
    headers: { Authorization: \`Bearer \${token}\` },
  });
  const msg = await msgRes.json();

  document.getElementById("msg-subject").textContent = msg.subject;
  document.getElementById("msg-from").textContent = \`From: \${msg.from.address}\`;
  document.getElementById("msg-body").innerHTML = msg.html[0] || msg.text;

  msgPreview.classList.remove("hidden");
}
