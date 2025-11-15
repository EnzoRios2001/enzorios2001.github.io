import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import LineString from 'ol/geom/LineString';
import Stroke from 'ol/style/Stroke';

const Emergencia = () => {
  const mapRef = useRef();
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [sucursalCoords, setSucursalCoords] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoords, setRouteCoords] = useState(null);

  // Obtener coordenadas de la sucursal usando Nominatim
  useEffect(() => {
    const fetchSucursalCoords = async () => {
      try {
        const response = await fetch(
          'https://nominatim.openstreetmap.org/search?format=json&q=Av. Mazzanti 550, Goya, Corrientes, Argentina'
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setSucursalCoords({
            latitude: parseFloat(data[0].lat),
            longitude: parseFloat(data[0].lon),
          });
        }
      } catch (err) {
        setError('No se pudo obtener la ubicación de la sucursal.');
      }
    };
    fetchSucursalCoords();
  }, []);

  // Obtener ubicación del usuario
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada en este navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setError('No se pudo obtener la ubicación.'),
      { enableHighAccuracy: true }
    );
  }, []);

  // Crear el mapa y los marcadores
  useEffect(() => {
    if (!sucursalCoords || !mapRef.current) return;

    const sucursalPoint = fromLonLat([sucursalCoords.longitude, sucursalCoords.latitude]);
    let features = [];

    // Marcador de la sucursal
    const sucursalMarker = new Feature({
      geometry: new Point(sucursalPoint),
      name: 'Sucursal',
    });
    sucursalMarker.setStyle(
      new Style({
        image: new Icon({
          src: 'https://cdn-icons-png.flaticon.com/512/684/684831.png', // ícono diferente
          scale: 0.07,
        }),
      })
    );
    features.push(sucursalMarker);

    // Marcador del usuario (si existe)
    let userPoint = null;
    if (coords) {
      userPoint = fromLonLat([coords.longitude, coords.latitude]);
      const userMarker = new Feature({
        geometry: new Point(userPoint),
      });
      userMarker.setStyle(
        new Style({
          image: new Icon({
            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scale: 0.07,
          }),
        })
      );
      features.push(userMarker);
    }

    // Camino iluminado (ruta real por calles)
    let routeLayer = null;
    if (showRoute && routeCoords) {
      const routeLine = new LineString(routeCoords.map(([lon, lat]) => fromLonLat([lon, lat])));
      const route = new Feature({ geometry: routeLine });
      route.setStyle(
        new Style({
          stroke: new Stroke({
            color: '#FFD700', // amarillo
            width: 5,
            lineDash: [10, 10],
          }),
        })
      );
      const routeSource = new VectorSource({ features: [route] });
      routeLayer = new VectorLayer({ source: routeSource });
    }

    const vectorSource = new VectorSource({ features });
    const vectorLayer = new VectorLayer({ source: vectorSource });

    const layers = [
      new TileLayer({ source: new OSM() }),
      vectorLayer,
    ];
    if (routeLayer) layers.push(routeLayer);

    const olMap = new Map({
      target: mapRef.current,
      layers,
      view: new View({
        center: sucursalPoint,
        zoom: 15,
      }),
    });

    return () => {
      olMap.setTarget(null);
    };
  }, [sucursalCoords, coords, showRoute, routeCoords]);

  // Función para obtener ruta real usando OSRM
  const handleRoute = async () => {
    if (!coords || !sucursalCoords) return;
    const url = `https://router.project-osrm.org/route/v1/driving/${coords.longitude},${coords.latitude};${sucursalCoords.longitude},${sucursalCoords.latitude}?overview=full&geometries=geojson`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        setRouteCoords(data.routes[0].geometry.coordinates);
        setShowRoute(true);
      } else {
        setError('No se pudo calcular la ruta.');
      }
    } catch (err) {
      setError('Error al conectar con el servicio de rutas.');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {error && <p>{error}</p>}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <button
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 10,
          padding: '10px 20px',
          background: '#FFD700',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
        onClick={handleRoute}
        disabled={!coords || !sucursalCoords || showRoute}
      >
        Cómo llegar a la sucursal
      </button>
    </div>
  );
};

export default Emergencia;
