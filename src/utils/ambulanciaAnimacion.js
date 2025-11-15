// utils/ambulanciaAnimacion.js
// Animación de ambulancia entre dos puntos en OpenLayers

export function animarAmbulancia({
  start, end, setPos, onFinish, velocidad = 13.888, espera = 500 }) {
  // velocidad en m/s, espera en ms
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const distance = Math.sqrt(dx * dx + dy * dy);
  const totalTime = (distance / velocidad) * 1000;
  const steps = Math.round(totalTime / 50);
  let step = 0;
  let going = true;

  function animate() {
    let t = step / steps;
    if (going) {
      // Ida
      const x = start[0] + t * dx;
      const y = start[1] + t * dy;
      setPos([x, y]);
      if (step < steps) {
        step++;
        setTimeout(animate, 50);
      } else {
        going = false;
        step = 0;
        setTimeout(animate, espera); // Espera en destino
      }
    } else {
      // Vuelta
      let tBack = step / steps;
      const x = end[0] + tBack * (start[0] - end[0]);
      const y = end[1] + tBack * (start[1] - end[1]);
      setPos([x, y]);
      if (step < steps) {
        step++;
        setTimeout(animate, 50);
      } else {
        setPos(null);
        if (onFinish) onFinish();
      }
    }
  }
  animate();
}
