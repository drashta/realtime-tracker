const socket = io();

// Initialize the Leaflet map centered at a default location
const map = L.map("map").setView([0, 0], 2); // [lat, lng], zoom level

// Add the OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markers={};

socket.on("receive-location",(data)=>{
    const{id,latitude,longitude}=data;
    map.setView([latitude,longitude]);
    if (markers[id]){
        markers[id].setLatLng([latitude,longitude]);
    }
    else{
        markers[id]=L.marker([latitude,longitude]).addTo(map);
    }
});

socket.on("user-disconnected",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

socket.on("connect_error", (err) => {
  console.error("Socket.io connection error:", err);
});


// Marker for your device
let marker;

// Watch and emit location
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });

      // Update marker on the map
      if (!marker) {
        marker = L.marker([latitude, longitude]).addTo(map);
      } else {
        marker.setLatLng([latitude, longitude]);
      }
      map.setView([latitude, longitude], 16); // Zoom in on your location
    },
    (error) => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}
