export const hojeISO = () => new Date().toLocaleDateString('sv-SE');

export function somarDias(iso, dias) {
  const data = new Date(`${iso}T12:00:00`);
  data.setDate(data.getDate() + dias);
  return data.toLocaleDateString('sv-SE');
}
