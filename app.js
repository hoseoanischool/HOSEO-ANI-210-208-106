// ====== 설정 ======
const ROOMS = ["210호", "106호", "208호", "212호"];

const SEATS_BY_ROOM = {
  "210호": Array.from({ length: 35 }, (_, i) => String(i + 1)),
  "106호": Array.from({ length: 32 }, (_, i) => String(i + 1)),
  "208호": Array.from({ length: 36 }, (_, i) => String(i + 1)),
  "212호": Array.from({ length: 32 }, (_, i) => String(i + 1)),
};

const fixedSeatsByRoom = {
  "210호": { "1": "이채은", "7": "김지선", "9": "자나라", "10": "최수인", "11": "이현두", "12": "임호빈", "13": "전가람", "17": "장수선", "18": "임소연", "19": "이수빈", "20": "장아라", "24": "박소윤", "25": "박지혜", "27": "장시은", "28": "이현아" },
  "106호": { "14": "김정민" }, "208호": {}, "212호": {}
};

const ADMIN_PASSWORD = '0415405841-2025-2-0821'; 
const KST_OFFSET_MIN = 9 * 60;

function nowKST() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + KST_OFFSET_MIN * 60000);
}
function pad2(n) { return String(n).padStart(2, "0"); }
function ymdKST(d = nowKST()) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function labelKOR(d) { return `${d.getMonth()+1}/${d.getDate()}(${["일","월","화","수","목","금","토"][d.getDay()]})`; }

function getWeekDatesKST(base = nowKST()) {
  const monday = new Date(base);
  monday.setDate(base.getDate() + (base.getDay() === 0 ? -6 : 1 - base.getDay()));
  monday.setHours(0,0,0,0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i); return d;
  });
}

const $roomTabs = document.getElementById("roomTabs");
const $weekTabs = document.getElementById("weekTabs");
const $seatLayout = document.getElementById("seatLayout");
const $modal = document.getElementById("bookingModal");
const $modalSubmitBtn = document.getElementById("modalSubmitBtn");

let activeRoom = ROOMS[0];
let activeDate = nowKST();
let activeDateKey = ymdKST(activeDate);

function renderRoomTabs() {
  $roomTabs.innerHTML = "";
  ROOMS.forEach(room => {
    const btn = document.createElement("button");
    btn.textContent = room;
    btn.className = (room === activeRoom) ? "active" : "inactive";
    btn.onclick = () => { activeRoom = room; renderRoomTabs(); attachBookingsListener(); };
    $roomTabs.appendChild(btn);
  });
  document.getElementById("activeRoomDisplay").textContent = `현재 선택: ${activeRoom}`;
}

function renderWeekTabs() {
  $weekTabs.innerHTML = "";
  getWeekDatesKST().forEach(d => {
    const btn = document.createElement("button");
    const key = ymdKST(d);
    btn.textContent = labelKOR(d);
    btn.className = (key === activeDateKey) ? "active" : "inactive";
    btn.onclick = () => { activeDate = new Date(d); activeDateKey = key; renderWeekTabs(); attachBookingsListener(); };
    $weekTabs.appendChild(btn);
  });
}

function renderSeats(snapshotVal) {
  $seatLayout.innerHTML = "";
  const bookings = snapshotVal || {};
  const seats = SEATS_BY_ROOM[activeRoom] || [];
  const fixed = fixedSeatsByRoom[activeRoom] || {};
  
  $seatLayout.className = `seat-container room-${activeRoom.replace('호', '')}`;

  seats.forEach(seat => {
    const div = document.createElement("div");
    div.className = "seat";
    div.dataset.seatNumber = seat;
    if (fixed[seat]) div.classList.add("fixed");
    if (bookings[seat]) div.classList.add("booked");

    div.innerHTML = `<strong>${seat}</strong><div class="name">${fixed[seat] || (bookings[seat] ? bookings[seat].name : "예약 가능")}</div>`;
    div.onclick = () => {
        if(fixed[seat]) alert("고정석입니다.");
        else if(bookings[seat]) alert("예약된 자리입니다.");
        else openModal(seat);
    };
    $seatLayout.appendChild(div);
  });
}

function openModal(seat) { 
  selectedSeat = seat; 
  document.getElementById("modalTitle").textContent = `${activeRoom} ${seat}번 예약`;
  $modal.classList.add("show"); 
}

function attachBookingsListener() {
  db.ref(`bookings/${activeRoom}/${activeDateKey}`).on("value", snap => renderSeats(snap.val()));
}

document.getElementById("modalCloseBtn").onclick = () => $modal.classList.remove("show");
renderRoomTabs(); renderWeekTabs(); attachBookingsListener();
