async function verify() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    window.location.href = "/login";
  }
}

verify();

const rightRows = [
  { label: "AR", seats: 11 },
  { label: "BR", seats: 11 },
  { label: "CR", seats: 11 },
  { label: "DR", seats: 9 },
  { label: "ER", seats: 10 },
  { label: "FR", seats: 11 },
  { label: "GR", seats: 11 },
  { label: "HR", seats: 11 },
  { label: "IR", seats: 9 },
  { label: "JR", seats: 11 },
  { label: "KR", seats: 11 },
  { label: "LR", seats: 11 },
  { label: "MR", seats: 9 },
  { label: "NR", seats: 10 },
  { label: "OR", seats: 11 },
  { label: "PR", seats: 11 },
];

const leftRows = [
  { label: "AL", seats: 11 },
  { label: "BL", seats: 11 },
  { label: "CL", seats: 11 },
  { label: "DL", seats: 10 },
  { label: "EL", seats: 10 },
  { label: "FL", seats: 11 },
  { label: "GL", seats: 11 },
  { label: "HL", seats: 11 },
  { label: "IL", seats: 10 },
  { label: "JL", seats: 11 },
  { label: "KL", seats: 11 },
  { label: "LL", seats: 11 },
  { label: "ML", seats: 9 },
  { label: "NL", seats: 10 },
  { label: "OL", seats: 11 },
  { label: "PL", seats: 11 },
];

// rightRows.reverse();
// leftRows.reverse();

const rightArea = document.getElementById("right-seating");
const leftArea = document.getElementById("left-seating");
const middleArea = document.getElementById(`middle-seating`);
let selectedSeat;

let selectedSeats = [];

async function fetchSelectedSeats() {
const loadingOverlay = document.getElementById("loadingOverlay");
loadingOverlay.style.display = "flex";
  const res = await fetch("/api/selectedSeats");
  const data = await res.json();
  selectedSeats = data.selectedSeats;
  for (const seat of selectedSeats) {
    const id = seat.row + "-" + seat.number + "-" + seat.seatPosition;
    const current = document.getElementById(id);
    if (current) {
      document.getElementById(id).classList.add("disabled");
    }
  }
    loadingOverlay.style.display = "none"; 
}

function createRow(row, parent, isRightSide = true) {
  const rowDiv = document.createElement("div");
  rowDiv.classList.add("seat-row");

  const label = document.createElement("div");
  label.classList.add("row-label");
  label.innerText = row.label;
  rowDiv.appendChild(label);

  for (let i = 1; i <= row.seats; i++) {
    const seat = document.createElement("div");
    seat.classList.add("seat");
    seat.id = `${row.label}-${i}-${currentFloor == 1 ? "down" : "up"}`;
    seat.innerText = i;

    // Sound control area for right side only (PR and OR, seats 1–3)
    if (
      isRightSide &&
      (row.label === "PR" || row.label === "OR") &&
      i >= 1 &&
      i < 4
    ) {
      seat.innerText = "🔊";
      seat.classList.add("disabled");
      seat.title = "Sound Control";
    } else {
      seat.addEventListener("click", () => {
        if (seat.classList.contains("disabled")) return;
        if (selectedSeat) {
          selectedSeat.classList.remove("selected");
        }
        selectedSeat = seat;
        seat.classList.toggle("selected");
      });
    }

    rowDiv.appendChild(seat);
  }

  parent.appendChild(rowDiv);
}

/* ---------------------------------- */
/* 1.  Seat‑data definitions          */
/* ---------------------------------- */

/* Ground floor – you already have these */
const rightRows1 = [...rightRows]; // reuse your existing arrays
const leftRows1 = [...leftRows];

/* Second floor – change labels / counts to whatever your plan needs */
const rightRows2 = [
  { label: "AR", seats: 12 },
  { label: "BR", seats: 12 },
  { label: "CR", seats: 7 },
  { label: "DR", seats: 7 },
  { label: "ER", seats: 8 },
  { label: "FR", seats: 9 },
  { label: "GR", seats: 9 },
  { label: "HR", seats: 7 },
  { label: "IR", seats: 5 },
  { label: "JR", seats: 4 },
  { label: "KR", seats: 5 },
];
const leftRows2 = [
  { label: "AL", seats: 11 },
  { label: "BL", seats: 12 },
  { label: "CL", seats: 7 },
  { label: "DL", seats: 7 },
  { label: "EL", seats: 8 },
  { label: "FL", seats: 8 },
  { label: "GL", seats: 9 },
  { label: "HL", seats: 7 },
  { label: "IL", seats: 5 },
  { label: "JL", seats: 5 },
  { label: "KL", seats: 5 },
];

const middleRows = [{ label: "ML", seats: 3 }];

/* We’ll store both sets in a map so we can switch quickly */
const FLOORS = {
  1: { right: rightRows1, left: leftRows1 },
  2: { right: rightRows2, left: leftRows2 },
};

let currentFloor = 1;

/* ---------------------------------- */
/* 2.  Render helpers                 */
/* ---------------------------------- */

function clearSeating() {
  rightArea.innerHTML = "";
  leftArea.innerHTML = "";
  middleArea.innerHTML = "";
}

function buildFloor(floorNumber) {
  clearSeating();
  const { right, left } = FLOORS[floorNumber];

  /* ground‑floor was reversed in your code to keep row A at bottom.
     mirror same logic here: */
  right
    .slice()
    .reverse()
    .forEach((r) => createRow(r, rightArea, true));
  left
    .slice()
    .reverse()
    .forEach((r) => createRow(r, leftArea, false));

  if (floorNumber === 2) {
    middleRows.forEach((r) => createRow(r, middleArea, true));
  }

  // restore previous selection if user switched floors
  const remembered = sessionStorage.getItem("selectedSeat");
  if (remembered) {
    const sel = document.getElementById(remembered);
    if (sel) sel.classList.add("selected");
  }
  fetchSelectedSeats(); // re‑apply disabled seats for this floor
}

/* ---------------------------------- */
/* 3.  Floor‑toggle behaviour         */
/* ---------------------------------- */

document.getElementById("floorSwitch").addEventListener("change", (e) => {
  currentFloor = e.target.checked ? 2 : 1;
  buildFloor(currentFloor);
});

/* ---------------------------------- */
/* 4.  Init – build ground floor once */
/* ---------------------------------- */

buildFloor(currentFloor);

// rightRows.forEach(row => createRow(row, rightArea, true));
// leftRows.forEach(row => createRow(row, leftArea, false));

fetchSelectedSeats();

const seatSession = sessionStorage.getItem("selectedSeat");
if (seatSession) {
  selectedSeat = document.getElementById(seatSession);
  selectedSeat.classList.add("selected");
}

document.getElementById("submitButton").addEventListener("click", () => {
  if (!selectedSeat) {
    alert("Please select a seat.");
    return;
  }
  sessionStorage.setItem("selectedSeat", selectedSeat.id);
  window.location.href = "/";
});
