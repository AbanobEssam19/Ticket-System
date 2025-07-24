let users = [];

async function fetchUsers() {
  try {
    const res = await fetch("/api/users");
    const data = await res.json();
    users = data.users;
  } catch (error) {
    console.error("Error fetching users:", error);
  }
  document.querySelector("div").innerHTML = users.map(user => `<p>${user.name} number of tickets: ${user.numberOfTickets}</p>`).join("");
  return;
}

fetchUsers();

