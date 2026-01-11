let map = L.map('map').setView([0,0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const table = document.getElementById('deviceTable');

function addRow(type, name, id, signal, notes){
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${type}</td><td>${name||'-'}</td><td>${id||'-'}</td><td>${signal||'-'}</td><td>${notes||''}</td>`;
  table.appendChild(tr);
}

document.getElementById('btnGeo').onclick = () => {
  if(!navigator.geolocation){ alert('Geolocation not supported'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const {latitude, longitude} = pos.coords;
    map.setView([latitude, longitude], 16);
    L.marker([latitude, longitude]).addTo(map).bindPopup('Your location (permissioned)').openPopup();
  }, err => alert(err.message));
};

document.getElementById('btnBluetooth').onclick = async () => {
  if(!navigator.bluetooth){ alert('Web Bluetooth not supported on this browser'); return; }
  try{
    const device = await navigator.bluetooth.requestDevice({ acceptAllDevices:true });
    addRow('Bluetooth', device.name || 'Unknown', device.id, '-', 'User-approved device');
  }catch(e){ /* user cancelled */ }
};

document.getElementById('fileInput').onchange = async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const text = await file.text();
  try{
    const data = JSON.parse(text);
    if(Array.isArray(data.devices)){
      data.devices.forEach(d => addRow(d.type, d.name, d.id, d.signal, 'Imported'));
      if(data.location){
        map.setView([data.location.lat, data.location.lng], 14);
        L.marker([data.location.lat, data.location.lng]).addTo(map)
          .bindPopup('Imported scan location');
      }
    } else alert('Invalid format');
  }catch(err){ alert('Invalid JSON'); }
};
