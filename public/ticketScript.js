console.log("hello");
async function loadTicket() {
    const id = window.location.pathname.split('/').pop();
    const res = await fetch(`/api/ticket/${id}`);

    const data = await res.json();
    console.log(data);

    document.getElementById('name').textContent = data.ticket.name;
    document.getElementById('phone').textContent = data.ticket.phone;
    document.getElementById('seatNo').textContent = data.ticket.seatNum;
}

loadTicket();
