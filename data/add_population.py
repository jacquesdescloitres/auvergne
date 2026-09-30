import json

file1 = 'communes_france_avec_polygon_2025.json'       # France communes with population

file2 = 'communes-63-puy-de-dome.geojson'       # Puy-de-Dôme communes
file3 = 'communes-63-puy-de-dome-with-population.geojson'     # merged file (Puy-de-Dôme communes with population)

#file2 = 'communes-auvergne-rhone-alpes.geojson'       # Auvergne-Rhône-Alpes communes
#file3 = 'communes-auvergne-rhone-alpes-with-population.geojson'     # merged file (Auvergne-Rhône-Alpes communes with population)


# Load the ancillary file (France communes with population)
with open(file1, 'r', encoding='utf-8') as f:
    ancillary_data = json.load(f)

# Load the original GeoJSON file (Puy-de-Dôme communes)
with open(file2, 'r', encoding='utf-8') as f:
    original_data = json.load(f)

# Create a dictionary to map commune names to population
population_dict = {}
for data in ancillary_data['data']:
    code = data.get('code_insee')
    population = data.get('population', 0)
    if code:
        population_dict[code] = population

# Merge population data into the original GeoJSON
for feature in original_data['features']:
    code = feature['properties'].get('code')
    if code in population_dict:
        feature['properties']['population'] = population_dict[code]
    else:
        feature['properties']['population'] = 0  # Default if not found

# Save the merged GeoJSON to a new file
with open(file3, 'w', encoding='utf-8') as f:
    #json.dump(original_data, f, ensure_ascii=False, indent=2)
    json.dump(original_data, f, ensure_ascii=False, indent=None, separators=(',', ':'))

