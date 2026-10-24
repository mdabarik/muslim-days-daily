const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const repoNames = {
  "muslim-days-daily": "Daily operations",
  "push-notifications": "Push notifications",
  "muslim-days": "Main codebase",
};

let repositoryTickets = [];
let localTickets = readLocal();

function readLocal() {
  try { return JSON.parse(localStorage.getItem("mdd-tickets")) || []; } catch { return []; }
}

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
}

function formatDate(date) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("bn-BD", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
}

function allTickets() {
  const tickets = new Map();
  [...repositoryTickets, ...localTickets].forEach((ticket) => tickets.set(ticket.id, ticket));
  return [...tickets.values()].sort((a, b) => {
    const rank = { high: 0, medium: 1, low: 2 };
    return (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3) || String(b.created).localeCompare(String(a.created));
  });
}

function filteredTickets() {
  const search = $("#ticketSearch").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const repository = $("#repoFilter").value;
  const priority = $("#priorityFilter").value;
  return allTickets().filter((ticket) =>
    (!search || [ticket.id, ticket.title, ticket.description, ticket.owner].join(" ").toLowerCase().includes(search)) &&
    (category === "all" || ticket.category === category) &&
    (repository === "all" || ticket.repository === repository) &&
    (priority === "all" || ticket.priority === priority)
  );
}

function saveLocal() {
  localStorage.setItem("mdd-tickets", JSON.stringify(localTickets));
  render();
}

function nextId() {
  const largest = allTickets().reduce((max, ticket) => Math.max(max, Number(String(ticket.id).replace(/\D/g, "")) || 0), 0);
  return `MD-${String(largest + 1).padStart(3, "0")}`;
}

function ticketCard(ticket) {
  const resolved = ticket.status === "resolved";
  return `<article class="ticket-card">
    <div class="ticket-card-top"><span class="ticket-key">${escapeHTML(ticket.id)}</span><span class="priority ${escapeHTML(ticket.priority)}">${escapeHTML(ticket.priority)}</span></div>
    <h3>${escapeHTML(ticket.title)}</h3>
    <p>${escapeHTML(ticket.description || "কোনো description দেওয়া হয়নি।")}</p>
    <div class="ticket-tags"><span>${escapeHTML(ticket.category)}</span><span>${escapeHTML(repoNames[ticket.repository] || ticket.repository)}</span><span>${resolved ? "resolved" : escapeHTML(ticket.stage || "todo")}</span>${ticket.owner ? `<span>${escapeHTML(ticket.owner)}</span>` : ""}</div>
    <div class="ticket-card-foot">
      <div class="ticket-dates"><span>Created ${formatDate(ticket.created)}</span><span>${resolved ? `Resolved ${formatDate(ticket.resolved)}` : ticket.due ? `Due ${formatDate(ticket.due)}` : "No due date"}</span></div>
      <div class="ticket-buttons">${ticket.url ? `<a href="${escapeHTML(ticket.url)}" target="_blank" rel="noopener">Link</a>` : ""}<button data-edit="${escapeHTML(ticket.id)}">Edit</button><button class="resolve" data-toggle="${escapeHTML(ticket.id)}">${resolved ? "Reopen" : "Resolve"}</button></div>
    </div>
  </article>`;
}

function render() {
  const all = allTickets();
  const visible = filteredTickets();
  const active = visible.filter((ticket) => ticket.status !== "resolved");
  const resolved = visible.filter((ticket) => ticket.status === "resolved");
  $("#activeCount").textContent = all.filter((ticket) => ticket.status !== "resolved").length;
  $("#progressCount").textContent = all.filter((ticket) => ticket.status !== "resolved" && ticket.stage === "in-progress").length;
  $("#highCount").textContent = all.filter((ticket) => ticket.status !== "resolved" && ticket.priority === "high").length;
  $("#resolvedCount").textContent = all.filter((ticket) => ticket.status === "resolved").length;
  $("#activeBadge").textContent = active.length;
  $("#resolvedBadge").textContent = resolved.length;
  $("#activeTickets").innerHTML = active.length ? active.map(ticketCard).join("") : `<div class="empty">কোনো active ticket নেই।</div>`;
  $("#resolvedTickets").innerHTML = resolved.length ? resolved.map(ticketCard).join("") : `<div class="empty">কোনো resolved ticket নেই।</div>`;
  $$("[data-edit]").forEach((button) => button.addEventListener("click", () => openTicket(allTickets().find((ticket) => ticket.id === button.dataset.edit))));
  $$("[data-toggle]").forEach((button) => button.addEventListener("click", () => toggleTicket(button.dataset.toggle)));
}

function openTicket(ticket) {
  $("#ticketForm").reset();
  $("#ticketDialogTitle").textContent = ticket ? `Edit ${ticket.id}` : "New ticket";
  $("#ticketId").value = ticket?.id || "";
  $("#ticketTitle").value = ticket?.title || "";
  $("#ticketCategory").value = ticket?.category || "feature";
  $("#ticketPriority").value = ticket?.priority || "medium";
  $("#ticketRepo").value = ticket?.repository || "muslim-days-daily";
  $("#ticketStage").value = ticket?.stage || "todo";
  $("#ticketCreated").value = ticket?.created || localDate();
  $("#ticketDue").value = ticket?.due || "";
  $("#ticketOwner").value = ticket?.owner || "";
  $("#ticketDescription").value = ticket?.description || "";
  $("#ticketUrl").value = ticket?.url || "";
  $("#ticketDialog").showModal();
}

function toggleTicket(id) {
  const current = allTickets().find((ticket) => ticket.id === id);
  if (!current) return;
  const resolved = current.status === "resolved";
  const updated = { ...current, status: resolved ? "active" : "resolved", resolved: resolved ? "" : localDate(), updated_at: new Date().toISOString(), source: "browser" };
  localTickets = localTickets.filter((ticket) => ticket.id !== id);
  localTickets.push(updated);
  saveLocal();
}

function exportTickets() {
  const blob = new Blob([JSON.stringify(allTickets(), null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = "tickets.json"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function loadTickets() {
  try {
    const response = await fetch(`data/tickets.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Ticket data পাওয়া যায়নি");
    repositoryTickets = await response.json();
    render();
  } catch (error) {
    $("#activeTickets").innerHTML = `<div class="empty">${escapeHTML(error.message)}। Local preview-এর জন্য HTTP server ব্যবহার করুন।</div>`;
  }
}

$("#newTicket").addEventListener("click", () => openTicket());
$("#exportTickets").addEventListener("click", exportTickets);
[$("#ticketSearch"), $("#categoryFilter"), $("#repoFilter"), $("#priorityFilter")].forEach((control) => control.addEventListener("input", render));
$("#resetTicketFilters").addEventListener("click", () => {
  $("#ticketSearch").value = ""; $("#categoryFilter").value = "all"; $("#repoFilter").value = "all"; $("#priorityFilter").value = "all"; render();
});
$("#ticketForm").addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const id = $("#ticketId").value || nextId();
  const existing = allTickets().find((ticket) => ticket.id === id);
  const ticket = {
    id, title: $("#ticketTitle").value.trim(), category: $("#ticketCategory").value,
    priority: $("#ticketPriority").value, repository: $("#ticketRepo").value,
    stage: $("#ticketStage").value, status: existing?.status || "active",
    created: $("#ticketCreated").value, due: $("#ticketDue").value,
    owner: $("#ticketOwner").value.trim(), description: $("#ticketDescription").value.trim(),
    url: $("#ticketUrl").value.trim(), resolved: existing?.resolved || "",
    updated_at: new Date().toISOString(), source: "browser",
  };
  localTickets = localTickets.filter((item) => item.id !== id);
  localTickets.push(ticket);
  $("#ticketDialog").close(); saveLocal();
});

loadTickets();
