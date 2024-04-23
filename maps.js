var map1 = L.map('map1').setView([0, 0], 2);
var map2 = L.map('map2').setView([0, 0], 2);


L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
}).addTo(map1);
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri'
}).addTo(map2);


async function fetchGeographicData(lat, lng, features, radius = 300) {
    const baseUrl = 'https://secure.geonames.org/findNearbyJSON';
    const username = 'kalevj'; 
    let closestFeature = null;

    for (const feature of features) {
        const params = `lat=${lat}&lng=${lng}&featureCode=${feature}&radius=${radius}&username=${username}`;
        const response = await fetch(`${baseUrl}?${params}`);
        if (!response.ok) {
            console.error('Error fetching geographic data:', response.status);
            continue;
        }
        const data = await response.json();
        if (data.geonames.length > 0 && (!closestFeature || parseFloat(data.geonames[0].distance) < parseFloat(closestFeature.distance))) {
            closestFeature = data.geonames[0];
        }
    }
    return closestFeature;
}


async function showAntipode(lat, lng, originMap, destinationMap) {
    var antipodalLat = -lat;
    var antipodalLng = lng > 0 ? lng - 180 : lng + 180;

    clearMarkers(originMap);
    clearMarkers(destinationMap);

    L.marker([lat, lng]).addTo(originMap).bindPopup('My location: ' + lat.toFixed(2) + ', ' + lng.toFixed(2));
    var originZoom = originMap.getZoom() > 5 ? originMap.getZoom() : 5;
    originMap.setView([lat, lng], originZoom);

    L.marker([antipodalLat, antipodalLng]).addTo(destinationMap).bindPopup('Antipodal point: ' + antipodalLat.toFixed(2) + ', ' + antipodalLng.toFixed(2));
    var destinationZoom = destinationMap.getZoom() > 5 ? destinationMap.getZoom() : 5;
    destinationMap.setView([antipodalLat, antipodalLng], destinationZoom);

    var cityIcon = L.icon({
        iconUrl: 'images/cityIcon.svg',
        iconSize: [32, 32], 
        iconAnchor: [16, 32], 
        popupAnchor: [0, -32] 
    });

    var airportIcon = L.icon({
        iconUrl: 'images/airportIcon.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });

    var portIcon = L.icon({
        iconUrl: 'images/portIcon.svg',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    

    const cityData = await fetchGeographicData(lat, lng, ['PPLC', 'PPLA']);
    if (cityData) {
        L.marker([cityData.lat, cityData.lng], {icon: cityIcon}).addTo(originMap).bindPopup(`Nearest city: ${cityData.name}, ${Math.round(cityData.distance)} km away`);
    }

    const antipodalCityData = await fetchGeographicData(antipodalLat, antipodalLng, ['PPLC', 'PPLA']);
    if (antipodalCityData) {
        L.marker([antipodalCityData.lat, antipodalCityData.lng], {icon: cityIcon}).addTo(destinationMap).bindPopup(`Nearest city: ${antipodalCityData.name}, ${Math.round(antipodalCityData.distance)} km away`);
    }

    
    const airportData = await fetchGeographicData(lat, lng, ['AIRP']);
    if (airportData) {
        L.marker([airportData.lat, airportData.lng], {icon: airportIcon}).addTo(originMap).bindPopup(`Closest airport: ${airportData.name}, ${Math.round(airportData.distance)} km away`);
    }

    const antipodalAirportData = await fetchGeographicData(antipodalLat, antipodalLng, ['AIRP']);
    if (antipodalAirportData) {
        L.marker([antipodalAirportData.lat, antipodalAirportData.lng], {icon: airportIcon}).addTo(destinationMap).bindPopup(`Closest airport: ${antipodalAirportData.name}, ${Math.round(antipodalAirportData.distance)} km away`);
    }

    
    const portData = await fetchGeographicData(lat, lng, ['PRT']);
    if (portData) {
        L.marker([portData.lat, portData.lng], {icon: portIcon}).addTo(originMap).bindPopup(`Nearest port: ${portData.name}, ${Math.round(portData.distance)} km away`);
    }

    const antipodalPortData = await fetchGeographicData(antipodalLat, antipodalLng, ['PRT']);
    if (antipodalPortData) {
        L.marker([antipodalPortData.lat, antipodalPortData.lng], {icon: portIcon}).addTo(destinationMap).bindPopup(`Nearest port: ${antipodalPortData.name}, ${Math.round(antipodalPortData.distance)} km away`);
    }
}


function clearMarkers(m) {
    m.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            m.removeLayer(layer);
        }
    });
}


map1.on('click', function(e) {
    var clickedLat = e.latlng.lat;
    var clickedLng = e.latlng.lng;
    showAntipode(clickedLat, clickedLng, map1, map2);
});


map2.on('click', function(e) {
    var clickedLat = e.latlng.lat;
    var clickedLng = e.latlng.lng;
    showAntipode(clickedLat, clickedLng, map2, map1);
});
