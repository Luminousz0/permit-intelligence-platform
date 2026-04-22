export interface Coordinates {
  rd: [number, number];
  wgs84: [number, number];
  address: string;
  municipality: string;
}

export async function addressToCoordinates(address: string): Promise<Coordinates> {
  const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(address)}&rows=1`;
  const res = await fetch(url);
  const data = await res.json();
  const doc = data.response?.docs?.[0];
  if (!doc) throw new Error('Address not found');
  
  const rdMatch = doc.centroide_rd.match(/POINT\(([\d.]+) ([\d.]+)\)/);
  const wgsMatch = doc.centroide_ll.match(/POINT\(([\d.]+) ([\d.]+)\)/);
  
  return {
    rd: [parseFloat(rdMatch[1]), parseFloat(rdMatch[2])],
    wgs84: [parseFloat(wgsMatch[1]), parseFloat(wgsMatch[2])],
    address: doc.weergavenaam,
    municipality: doc.gemeentenaam
  };
}
