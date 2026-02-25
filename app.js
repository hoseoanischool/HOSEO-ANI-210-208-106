// ====== 설정 ======
const ROOMS = ["210호", "106호", "208호"]; 

const SEATS_BY_ROOM = {
  "210호": Array.from({ length: 35 }, (_, i) => String(i + 1)),
  "106호": Array.from({ length: 32 }, (_, i) => String(i + 1)),
  "208호": Array.from({ length: 36 }, (_, i) => String(i + 1))
};

const fixedSeatsByRoom = {
  "210호": { 
    "1": "이채은", "7": "김지선", "9": "자나라", "10": "최수인", "11": "이현두", 
    "12": "임호빈", "13": "전가람", "17": "장수선", "18": "임소연", "19": "이수빈", 
    "20": "장아라", "24": "박소윤", "25": "박지혜", "27": "장시은", "28": "이현아" 
  },
  "106호": { "14": "김정민" }, 
  "208호": {} 
};

const ADMIN_PASSWORD = '0415405841-2025-2-0821'; 

// 시간 설정
function nowKST() { 
  const n = new Date(); 
  return new Date(n.getTime() + (n.getTimezoneOffset() * 60000) + (9 * 60 * 60000)); 
}
function ymdKST(d = nowKST()) { 
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; 
}
function labelKOR(d) { 
  return `${d.getMonth()+1}/${d.getDate()}(${["일","월","화","수","목","금","토"][d.getDay()]})`; 
}

function getWeekDatesKST(base = nowKST()) {
  const mon = new Date(base); 
  mon.setDate(base.getDate() + (base.getDay() === 0 ? -6 : 1 - base.getDay()));
  mon.setHours(0,0,0,0);
  return Array.from({ length: 7 }, (_, i) => { 
    const d = new Date(mon); 
    d.setDate(mon.getDate() + i); 
    return d; 
  });
}

let activeRoom = ROOMS[0];
let activeDate = nowKST();
let activeDateKey = ymdKST(activeDate);

// 화면 그리기
function renderRoomTabs() {
  const $tabs = document.getElementById("roomTabs");
  $tabs.innerHTML = "";
  ROOMS.forEach(room => {
    const btn = document.createElement("button");
    btn.textContent = room;
    btn.className = (room === activeRoom) ? "active" : "inactive";
    btn.onclick = () => { activeRoom = room; renderRoomTabs(); attachBookingsListener(); };
    $tabs.appendChild(btn);
  });
  document.getElementById("activeRoomDisplay").textContent = `현재 선택: ${activeRoom}`;
}

function renderWeekTabs() {
  const $tabs = document.getElementById("weekTabs");
  $tabs.innerHTML = "";
  getWeekDatesKST().forEach(d => {
    const btn = document.createElement("button");
    const key = ymdKST(d);
    btn.textContent = labelKOR(d);
    btn.className = (key === activeDateKey) ? "active" : "inactive";
    btn.onclick = () => { activeDate = new Date(d); activeDateKey = key; renderWeekTabs(); attachBookingsListener(); };
    $tabs.appendChild(btn);
  });
}

function renderSeats(snapshotVal) {
  const $layout = document.getElementById("seatLayout");
  $layout.innerHTML = "";
  $layout.className = `seat-container room-${activeRoom.replace('호', '')}`;
  const bookings = snapshotVal || {};
  SEATS_BY_ROOM[activeRoom].forEach(seat => {
    const div = document.createElement("div");
    div.className = "seat";
    div.dataset.seatNumber = seat;
    const isFixed = fixedSeatsByRoom[activeRoom][seat];
    if (isFixed) div.classList.add("fixed");
    if (bookings[seat]) div.classList.add("booked");
    div.innerHTML = `<strong>${seat}</strong><div class="name">${isFixed || (bookings[seat] ? bookings[seat].name : "예약 가능")}</div>`;
    div.onclick = () => { if (!isFixed && !bookings[seat]) openModal(seat); };
    $layout.appendChild(div);
  });
}

function openModal(seat) {
  selectedSeat = seat;
  document.getElementById("modalTitle").textContent = `${activeRoom} ${seat}번 예약`;
  document.getElementById("bookingModal").classList.add("show");
}

function attachBookingsListener() {
  window.db.ref(`bookings/${activeRoom}/${activeDateKey}`).on("value", snap => renderSeats(snap.val()));
}

document.getElementById("modalCloseBtn").onclick = () => document.getElementById("bookingModal").classList.remove("show");
renderRoomTabs(); renderWeekTabs(); attachBookingsListener();
