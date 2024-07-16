document.addEventListener('DOMContentLoaded', () => {
    const pokemonNumberInput = document.getElementById('pokemonNumber');
    const searchButton = document.getElementById('searchButton');
    const previousButton = document.getElementById('previousButton');
    const nextButton = document.getElementById('nextButton');
    const toggleShinyButton = document.getElementById('toggleShinyButton');
    const pokemonName = document.getElementById('pokemonName');
    const pokemonNumberDisplay = document.getElementById('pokemonNumberDisplay');
    const pokemonImage = document.getElementById('pokemonImage');
    const pokemonType = document.getElementById('pokemonType');
    const pokemonDescription = document.getElementById('pokemonDescription');
    const pokemonStats = document.getElementById('pokemonStats');
    const pokemonEvolution = document.getElementById('pokemonEvolution');
    const pokemonMoves = document.getElementById('pokemonMoves');

    let currentPokemonId = 1;
    let isShiny = false;

    const statTranslations = {
        hp: 'PS',
        attack: 'Ataque',
        defense: 'Defensa',
        'special-attack': 'Ataque Especial',
        'special-defense': 'Defensa Especial',
        speed: 'Velocidad'
    };

    const typeTranslations = {
        grass: 'hierba',
        poison: 'veneno',
        fire: 'fuego',
        water: 'agua',
        electric: 'eléctrico',
        ice: 'hielo',
        fighting: 'lucha',
        ground: 'tierra',
        flying: 'volador',
        psychic: 'psíquico',
        bug: 'bicho',
        rock: 'roca',
        ghost: 'fantasma',
        dark: 'siniestro',
        dragon: 'dragón',
        steel: 'acero',
        fairy: 'hada'
    };

    const fetchData = async (url) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('ERROR');
        return response.json();
    };

    const updatePokemonData = async (id) => {
        try {
            const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const speciesData = await fetchData(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            currentPokemonId = id;
            isShiny = false;

            pokemonName.textContent = pokemonData.name;
            pokemonNumberDisplay.textContent = `No ${pokemonData.id}`;
            pokemonImage.src = pokemonData.sprites.front_default;
            pokemonType.innerHTML = pokemonData.types.map(typeInfo => `<span class="type ${typeTranslations[typeInfo.type.name]}">${typeTranslations[typeInfo.type.name]}</span>`).join('');
            const flavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es') || speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
            pokemonDescription.textContent = flavorTextEntry ? flavorTextEntry.flavor_text : 'Descripción no disponible';

            pokemonStats.innerHTML = pokemonData.stats.map(stat => `<li>${statTranslations[stat.stat.name]}: ${stat.base_stat}</li>`).join('');

            const evolutionChain = await fetchData(speciesData.evolution_chain.url);
            pokemonEvolution.innerHTML = getEvolutionChainImages(evolutionChain.chain).join('');
            pokemonMoves.innerHTML = pokemonData.moves.slice(0, 3).map(move => `<li>${move.move.name}</li>`).join('');
        } catch (error) {
            console.error('Error poke data:', error);
            alert('Pokémon no encontrado');
        }
    };

    const getEvolutionChainImages = (chain) => {
        const evolutionImages = [];
        let current = chain;

        do {
            const id = getIdFromUrl(current.species.url);
            evolutionImages.push(`
                <div class="evolution-stage">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png" alt="${current.species.name}">
                    <p>${current.species.name}</p>
                </div>
            `);
            current = current.evolves_to[0];
        } while (current);

        return evolutionImages;
    };

    const getIdFromUrl = (url) => {
        const parts = url.split('/');
        return parts[parts.length - 2];
    };

    searchButton.addEventListener('click', async () => {
        const id = pokemonNumberInput.value;
        if (id) {
            try {
                await updatePokemonData(id);
            } catch (error) {
                alert('Pokémon no encontrado');
            }
        }
    });

    previousButton.addEventListener('click', async () => {
        if (currentPokemonId > 1) {
            try {
                await updatePokemonData(currentPokemonId - 1);
            } catch (error) {
                alert('Pokémon no encontrado');
            }
        }
    });

    nextButton.addEventListener('click', async () => {
        try {
            await updatePokemonData(currentPokemonId + 1);
        } catch (error) {
            alert('Pokémon no encontrado');
        }
    });

    toggleShinyButton.addEventListener('click', async () => {
        try {
            const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${currentPokemonId}`);
            isShiny = !isShiny;
            pokemonImage.src = isShiny ? pokemonData.sprites.front_shiny : pokemonData.sprites.front_default;
        } catch (error) {
            console.error('Error shiny imagen:', error);
        }
    });

    updatePokemonData(1);
});
