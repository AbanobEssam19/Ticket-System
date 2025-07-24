let users = [];

async function fetchUsers() {
  try {
    const res = await fetch("/api/users");
    const data = await res.json();
    users = data.users;

    users.sort((a, b) => b.numberOfTickets - a.numberOfTickets);

    const totalTickets = users.reduce((sum, user) => sum + user.numberOfTickets, 0);
    document.getElementById("total").textContent = `إجمالي التذاكر: ${totalTickets}`;

    const listHtml = users.map(user => `
      <li>
        <span class="name">${user.name}</span>
        <span class="count">${user.numberOfTickets}</span>
      </li>
    `).join("");

    document.getElementById("names").innerHTML = listHtml;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
}

fetchUsers();
