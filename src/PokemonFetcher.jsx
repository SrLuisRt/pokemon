import React, { useState, useEffect } from 'react';
import './PokemonFetcher.css';

const PokemonFetcher = () => {
  const [pokemones, setPokemones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(4);
  const [tipos, setTipos] = useState([]);

  useEffect(() => {
    const fetchTipos = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/type');
        const data = await res.json();
        const tiposValidos = data.results
          .filter(tipo => !['shadow', 'unknown'].includes(tipo.name))
          .map(tipo => tipo.name);
        setTipos(tiposValidos);
      } catch (err) {
        console.error('Error al cargar tipos:', err);
      }
    };

    fetchTipos();
  }, []);

  useEffect(() => {
    const fetchPokemones = async () => {
      try {
        setCargando(true);
        setError(null);
        const fetchedPokemones = [];

        if (tipoSeleccionado) {
          const res = await fetch(`https://pokeapi.co/api/v2/type/${tipoSeleccionado}`);
          const data = await res.json();
          const pokemonsTipo = data.pokemon.map(p => p.pokemon);
          const seleccionados = cantidad === 898 ? pokemonsTipo : pokemonsTipo.slice(0, cantidad);

          for (const poke of seleccionados) {
            const resPoke = await fetch(poke.url);
            const dataPoke = await resPoke.json();
            fetchedPokemones.push({
              id: dataPoke.id,
              nombre: dataPoke.name,
              imagen: dataPoke.sprites.front_default,
              tipos: dataPoke.types.map(t => t.type.name),
            });
          }
        } else {
          const pokemonIds = new Set();
          while (pokemonIds.size < cantidad) {
            const randomId = Math.floor(Math.random() * 898) + 1;
            pokemonIds.add(randomId);
          }

          for (const id of pokemonIds) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
            const data = await response.json();
            fetchedPokemones.push({
              id: data.id,
              nombre: data.name,
              imagen: data.sprites.front_default,
              tipos: data.types.map(typeInfo => typeInfo.type.name),
            });
          }
        }

        setPokemones(fetchedPokemones);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    fetchPokemones();
  }, [tipoSeleccionado, cantidad]);

  return (
    <div className='pokemon-container'>
      <h2>Explora tus Pokemóns!</h2>

      <div className="pokemon-controls">
        <label>
          Tipo:
          <select onChange={(e) => setTipoSeleccionado(e.target.value)} value={tipoSeleccionado}>
            <option value=''>Aleatorio</option>
            {tipos.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cantidad:
          <select onChange={(e) => setCantidad(parseInt(e.target.value))} value={cantidad}>
            <option value={4}>4</option>
            <option value={6}>6</option>
            <option value={10}>10</option>
            <option value={898}>Todos</option>
          </select>
        </label>
      </div>

      {cargando && <div>Cargando Pokémon...</div>}
      {error && <div className="error">Error: {error}</div>}

      <div className="pokemon-list">
        {pokemones.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <h3>{pokemon.nombre.charAt(0).toUpperCase() + pokemon.nombre.slice(1)}</h3>
            <img src={pokemon.imagen} alt={pokemon.nombre} />
            <p><strong>Tipos:</strong> {pokemon.tipos.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PokemonFetcher;
