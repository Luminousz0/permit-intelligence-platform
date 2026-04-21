export interface Coordinates {
  rd: [number, number];
  wgs84: [number, number];
  address: string;
  municipality: string;
  province: string;
  postcode: string;
  street: string;
  houseNumber: number;
  houseLetter?: string;
  city: string;
  id: string;
}

interface PDOKDocument {
  id: string;
  weergavenaam: string;
  gemeentenaam: string;
  provincienaam: string;
  postcode: string;
  straatnaam: string;
  huis_nlt: string;
  huisnummer: number;
  huisletter?: string;
  woonplaatsnaam: string;
  centroide_ll: string;
  centroide_rd: string;
  centroide_rd_x?: number;
  centroide_rd_y?: number;
  centroide_ll_x?: number;
  centroide_ll_y?: number;
  type: string;
  score: number;
}

function parsePoint(pointStr: string): [number, number] {
  const match = pointStr.match(/POINT\s*\(?\s*([\d.]+)\s+([\d.]+)\s*\)?/i);
  if (!match) throw new Error(`Invalid POINT format: ${pointStr}`);
  return [parseFloat(match[1]), parseFloat(match[2])];
}

function extractCoordinates(doc: PDOKDocument): { rd: [number, number]; wgs84: [number, number] } {
  let rd: [number, number];
  if (doc.centroide_rd_x !== undefined && doc.centroide_rd_y !== undefined) {
    rd = [doc.centroide_rd_x, doc.centroide_rd_y];
  } else if (doc.centroide_rd) {
    rd = parsePoint(doc.centroide_rd);
  } else {
    throw new Error(`No RD coordinates for: ${doc.weergavenaam}`);
  }

  let wgs84: [number, number];
  if (doc.centroide_ll_x !== undefined && doc.centroide_ll_y !== undefined) {
    wgs84 = [doc.centroide_ll_x, doc.centroide_ll_y];
  } else if (doc.centroide_ll) {
    wgs84 = parsePoint(doc.centroide_ll);
  } else {
    wgs84 = [0, 0];
  }

  return { rd, wgs84 };
}

function parseHouseNumber(huisNlt: string): { number: number; letter?: string } {
  const match = huisNlt.match(/^(\d+)([A-Za-z]?)$/);
  if (!match) return { number: parseInt(huisNlt, 10) || 0 };
  return { number: parseInt(match[1], 10), letter: match[2] || undefined };
}

function transformDocument(doc: PDOKDocument): Coordinates {
  const coords = extractCoordinates(doc);
  const house = parseHouseNumber(doc.huis_nlt || '');
  return {
    rd: coords.rd,
    wgs84: coords.wgs84,
    address: doc.weergavenaam,
    municipality: doc.gemeentenaam,
    province: doc.provincienaam,
    postcode: doc.postcode,
    street: doc.straatnaam,
    houseNumber: house.number,
    houseLetter: house.letter,
    city: doc.woonplaatsnaam,
    id: doc.id
  };
}

async function searchPDOK(query: string): Promise<PDOKDocument | null> {
  const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(query)}&rows=1`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.response?.docs?.[0] || null;
  } catch {
    return null;
  }
}

function looksLikePostcode(input: string): boolean {
  return /^[0-9]{4}\s*[A-Za-z]{2}$/.test(input.trim());
}

function looksLikeCityOnly(input: string): boolean {
  return !/\d/.test(input) && input.length > 2;
}

export async function addressToCoordinates(address: string): Promise<Coordinates> {
  const cleanAddress = address.trim();
  
  // Strategy 1: Try the exact input first
  console.log(`   Trying exact: "${cleanAddress}"`);
  let doc = await searchPDOK(cleanAddress);
  if (doc) {
    console.log(`   ✅ Found with exact match`);
    return transformDocument(doc);
  }
  
  // Strategy 2: If it looks like just a postcode (e.g., "1349DV")
  if (looksLikePostcode(cleanAddress)) {
    console.log(`   Trying as postcode: "${cleanAddress}"`);
    doc = await searchPDOK(cleanAddress);
    if (doc) {
      console.log(`   ✅ Found by postcode`);
      return transformDocument(doc);
    }
  }
  
  // Strategy 3: If it looks like just a city (e.g., "Almere")
  if (looksLikeCityOnly(cleanAddress)) {
    console.log(`   Trying as city: "${cleanAddress}"`);
    doc = await searchPDOK(cleanAddress);
    if (doc) {
      console.log(`   ✅ Found by city (centroid)`);
      return transformDocument(doc);
    }
  }
  
  // Strategy 4: Try with "Netherlands" appended
  console.log(`   Trying with Netherlands: "${cleanAddress}, Netherlands"`);
  doc = await searchPDOK(`${cleanAddress}, Netherlands`);
  if (doc) {
    console.log(`   ✅ Found with Netherlands appended`);
    return transformDocument(doc);
  }
  
  // Strategy 5: Try to extract and format as street+city
  const parts = cleanAddress.split(',').map(p => p.trim());
  if (parts.length >= 2) {
    const streetPart = parts[0];
    const cityPart = parts[parts.length - 1];
    const combined = `${streetPart}, ${cityPart}`;
    console.log(`   Trying simplified: "${combined}"`);
    doc = await searchPDOK(combined);
    if (doc) {
      console.log(`   ✅ Found with simplified format`);
      return transformDocument(doc);
    }
  }
  
  throw new Error(`Could not geocode: "${cleanAddress}". Try format: "Straatnaam 123, 1234AB Plaatsnaam" or just "1234AB" or "Plaatsnaam"`);
}

export async function addressToRD(address: string): Promise<[number, number]> {
  const coords = await addressToCoordinates(address);
  return coords.rd;
}

export async function addressToWGS84(address: string): Promise<[number, number]> {
  const coords = await addressToCoordinates(address);
  return coords.wgs84;
}
