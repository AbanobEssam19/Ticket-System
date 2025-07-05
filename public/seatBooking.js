const rightRows = [
    { label: 'AR', seats: 11 },
    { label: 'BR', seats: 11 },
    { label: 'CR', seats: 11 },
    { label: 'DR', seats: 9 },
    { label: 'ER', seats: 10 },
    { label: 'FR', seats: 11 },
    { label: 'GR', seats: 11 },
    { label: 'HR', seats: 11 },
    { label: 'IR', seats: 9 },
    { label: 'JR', seats: 11 },
    { label: 'KR', seats: 11 },
    { label: 'LR', seats: 11 },
    { label: 'MR', seats: 9 },
    { label: 'NR', seats: 10 },
    { label: 'OR', seats: 11 },
    { label: 'PR', seats: 11 }
];

const leftRows = [
    { label: 'AL', seats: 11 },
    { label: 'BL', seats: 11 },
    { label: 'CL', seats: 11 },
    { label: 'DL', seats: 10 },
    { label: 'EL', seats: 10 },
    { label: 'FL', seats: 11 },
    { label: 'GL', seats: 11 },
    { label: 'HL', seats: 11 },
    { label: 'IL', seats: 10 },
    { label: 'JL', seats: 11 },
    { label: 'KL', seats: 11 },
    { label: 'LL', seats: 11 },
    { label: 'ML', seats: 9 },
    { label: 'NL', seats: 10 },
    { label: 'OL', seats: 11 },
    { label: 'PL', seats: 11 }
];

rightRows.reverse();
leftRows.reverse();

const rightArea = document.getElementById('right-seating');
const leftArea = document.getElementById('left-seating');
let selectedSeat;

let selectedSeats = [];

async function fetchSelectedSeats() {
    const res = await fetch('/api/selectedSeats');
    const data = await res.json();
    selectedSeats = data.selectedSeats;
    for (const seat of selectedSeats) {
        const id = seat.row + '-' + seat.number;
        const current = document.getElementById(id);
        if (current) {
            document.getElementById(id).classList.add('disabled');
        }
    }
}


function createRow(row, parent, isRightSide = true) {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('seat-row');

    const label = document.createElement('div');
    label.classList.add('row-label');
    label.innerText = row.label;
    rowDiv.appendChild(label);

    for (let i = 1; i <= row.seats; i++) {
        const seat = document.createElement('div');
        seat.classList.add('seat');
        seat.id = `${row.label}-${i}`;
        seat.innerText = i;

        // Sound control area for right side only (PR and OR, seats 1–3)
        if (
            isRightSide &&
            (row.label === 'PR' || row.label === 'OR') &&
            (i >= 1 && i < 4)
        ) {
            seat.innerText = '🔊';
            seat.classList.add('disabled');
            seat.title = 'Sound Control';
        } else {
            seat.addEventListener('click', () => {
                if (seat.classList.contains('disabled')) return;
                if (selectedSeat) {
                    selectedSeat.classList.remove('selected');
                }
                selectedSeat = seat;
                seat.classList.toggle('selected');
            });
        }

        rowDiv.appendChild(seat);
    }

    parent.appendChild(rowDiv);
}

rightRows.forEach(row => createRow(row, rightArea, true));
leftRows.forEach(row => createRow(row, leftArea, false));


fetchSelectedSeats();


const seatSession = sessionStorage.getItem('selectedSeat');
if (seatSession) {
    selectedSeat = document.getElementById(seatSession);
    selectedSeat.classList.add('selected');
}

document.getElementById("submitButton").addEventListener("click", () => {
    if (!selectedSeat) {
        alert("Please select a seat.");
        return;
    }
    sessionStorage.setItem("selectedSeat", selectedSeat.id);
    window.location.href = "/";
})