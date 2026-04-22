export function generateVerslagTemplate(data: any): string {
  const date = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 800px; margin: 40px auto; padding: 20px; }
h1 { color: #1a365d; border-bottom: 2px solid #3182ce; padding-bottom: 10px; }
h2 { color: #2c5282; margin-top: 30px; font-size: 1.3em; }
.metadata { background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
table { width: 100%; border-collapse: collapse; margin: 20px 0; }
th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
th { background: #edf2f7; font-weight: 600; }
.placeholder { color: #a0aec0; font-style: italic; }
.warning { background: #fffaf0; border-left: 4px solid #ed8936; padding: 15px; margin: 20px 0; }
</style>
</head>
<body>

<h1>Participatieverslag — ${data.projectName || 'Project'}</h1>

<div class="metadata">
<p><strong>Gemeente:</strong> ${data.municipality}</p>
<p><strong>Projectadres:</strong> ${data.projectAddress}</p>
<p><strong>Datum aanvraag:</strong> ${date}</p>
<p><strong>Aanvrager:</strong> [Vul naam in]</p>
<p><strong>Type activiteit:</strong> ${data.activityType}</p>
${data.housingUnits ? `<p><strong>Aantal eenheden:</strong> ${data.housingUnits}</p>` : ''}
</div>

<h2>1. Projectoverzicht</h2>
<p class="placeholder">[Beschrijf hier kort uw project. Wat gaat u bouwen, verbouwen of veranderen? Vermeld de omvang, locatie en belangrijkste kenmerken.]</p>

<h2>2. Betrokken Belanghebbenden</h2>
<p>De volgende partijen zijn geïdentificeerd als belanghebbenden bij dit project:</p>
<table>
<thead><tr><th>Groep</th><th>Waarom betrokken</th><th>Hoe geïdentificeerd</th><th>Contactmethode</th></tr></thead>
<tbody>
<tr><td>Direct omwonenden (binnen 50m)</td><td>Direct zicht/hinder</td><td>Adresregistratie gemeente</td><td>Brief/e-mail</td></tr>
<tr><td class="placeholder">[Voeg meer groepen toe]</td><td class="placeholder">[Reden]</td><td class="placeholder">[Methode]</td><td class="placeholder">[Contact]</td></tr>
</tbody>
</table>

<h2>3. Uitgevoerde Participatieactiviteiten</h2>
<table>
<thead><tr><th>Datum</th><th>Type</th><th>Locatie/Methode</th><th>Deelnemers</th></tr></thead>
<tbody>
<tr><td class="placeholder">[DD-MM-JJJJ]</td><td class="placeholder">[Bijv. Informatiebijeenkomst]</td><td class="placeholder">[Adres/Online]</td><td class="placeholder">[Aantal en type]</td></tr>
</tbody>
</table>

<h3>Details per activiteit</h3>
<p><strong>[Datum] — [Type activiteit]</strong></p>
<ul>
<li><strong>Locatie:</strong> <span class="placeholder">[Adres of online platform]</span></li>
<li><strong>Aanwezigen:</strong> <span class="placeholder">[Namen of groepen]</span></li>
<li><strong>Besproken:</strong> <span class="placeholder">[Korte samenvatting]</span></li>
<li><strong>Uitkomsten:</strong> <span class="placeholder">[Wat is er uit gekomen?]</span></li>
</ul>

<h2>4. Ontvangen Feedback en Verwerking</h2>
<h3>Feedback die is verwerkt in het plan</h3>
<table>
<thead><tr><th>Ingebracht door</th><th>Zorg/Input</th><th>Aanpassing in plan</th></tr></thead>
<tbody>
<tr><td class="placeholder">[Naam/groep]</td><td class="placeholder">[Beschrijving]</td><td class="placeholder">[Wat is aangepast?]</td></tr>
</tbody>
</table>

<h3>Feedback die niet is verwerkt (met reden)</h3>
<table>
<thead><tr><th>Ingebracht door</th><th>Zorg/Input</th><th>Reden niet verwerkt</th></tr></thead>
<tbody>
<tr><td class="placeholder">[Naam/groep]</td><td class="placeholder">[Beschrijving]</td><td class="placeholder">[Waarom niet?]</td></tr>
</tbody>
</table>

<h2>5. Conclusie en Vervolg</h2>
<p class="placeholder">[Beschrijf de uitkomst van het participatieproces. Is er consensus bereikt? Wat is de huidige relatie met belanghebbenden? Zijn er nog openstaande punten?]</p>

<h2>6. Verklaring</h2>
<p>Ondergetekende verklaart dat bovenstaand participatieproces te goeder trouw is uitgevoerd, dat alle geïdentificeerde belanghebbenden adequaat zijn geïnformeerd en in de gelegenheid zijn gesteld input te leveren, en dat dit verslag een accurate weergave is van het proces en de uitkomsten.</p>
<p style="margin-top: 30px;"><strong>Aanvrager:</strong> [Vul naam in]<br><strong>Datum:</strong> ${date}</p>

${getMunicipalityNotes(data.municipality)}

</body>
</html>`;
}

function getMunicipalityNotes(municipality: string): string {
  const notes: Record<string, string> = {
    'Amsterdam': `
<div class="warning">
<h3 style="color: #ed8936;">Amsterdam-specifieke vereisten</h3>
<p>Amsterdam hanteert verplichte participatiecategorieën (1-3) op basis van impactscore:</p>
<ul>
<li><strong>Categorie 1:</strong> Informeren direct omwonenden</li>
<li><strong>Categorie 2:</strong> Raadplegen bredere groep</li>
<li><strong>Categorie 3:</strong> Actief adviesproces met gebiedsmakelaar</li>
</ul>
</div>`,
    'Almere': `
<div class="warning">
<h3 style="color: #ed8936;">Almere-specifieke vereisten</h3>
<p>Almere beoordeelt participatie per geval. Documenteer alle activiteiten uitgebreid. Bij onvoldoende participatie kan de gemeente zelf zienswijzen ophalen (veroorzaakt vertraging).</p>
</div>`,
    'Utrecht': `
<div class="warning">
<h3 style="color: #ed8936;">Utrecht-specifieke vereisten</h3>
<p>Utrecht vereist het 'Kompas voor Zeggenschap'. Dien zowel Samenwerkingsplan (vooraf) als Samenwerkingsverslag (achteraf) in.</p>
</div>`,
    'Rotterdam': `
<div class="warning">
<h3 style="color: #ed8936;">Rotterdam-specifieke vereisten</h3>
<p>Rotterdam maakt onderscheid tussen grote en kleine initiatieven. Grote projecten vereisen intake-team en participatieadviseur.</p>
</div>`
  };
  return notes[municipality] || '';
}
