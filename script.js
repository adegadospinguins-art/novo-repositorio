// Configuração da API do Backend no Render
const BACKEND_URL = 'https://offbeat-backend-22xy.onrender.com';

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById('searchInput') || document.querySelector('input[type="text"]');
    const cardsGrid = document.getElementById('cardsGrid') || document.querySelector('.artists-grid') || document.querySelector('.albums-grid');

    let debounceTimer = null;

    // Função para buscar músicas exclusivamente no seu Backend do Render
    async function fetchMusic(term) {
        const query = term ? term.trim() : 'Henrique e Juliano';

        try {
            const response = await fetch(`${BACKEND_URL}/api/search?q=${encodeURIComponent(query)}`);
            const tracks = await response.json();

            if (Array.isArray(tracks) && tracks.length > 0) {
                renderMusicGrid(tracks);
            } else {
                if (cardsGrid) cardsGrid.innerHTML = `<p class="text-white text-xs p-4">Nenhuma música encontrada para "${query}".</p>`;
            }
        } catch (err) {
            console.error("Erro ao conectar ao backend no Render:", err);
            if (cardsGrid) cardsGrid.innerHTML = `<p class="text-red-400 text-xs p-4">Erro de conexão com o servidor.</p>`;
        }
    }

    // Renderiza os resultados no grid principal do HTML
    function renderMusicGrid(tracks) {
        if (!cardsGrid) return;
        cardsGrid.innerHTML = '';

        tracks.forEach(track => {
            const trackName = track.title || 'Música';
            const artistName = track.artist || 'Artista';
            const coverUrl = track.cover || './IMG/default.jpg';
            const trackId = track.id;

            const card = document.createElement('div');
            card.className = "bg-brand-card hover:bg-brand-cardHover p-3 rounded-xl cursor-pointer group transition-all duration-300 flex flex-col gap-2 border border-white/5 shadow-lg relative";

            card.innerHTML = `
                <div class="relative w-full aspect-square rounded-lg overflow-hidden shadow-md">
                    <img src="${coverUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Capa">
                    <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div class="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center shadow-lg text-black font-bold">
                            ▶
                        </div>
                    </div>
                </div>
                <div class="truncate mt-1">
                    <h4 class="font-bold text-xs text-white truncate">${trackName}</h4>
                    <p class="text-[11px] text-brand-textMuted truncate mt-0.5">${artistName}</p>
                </div>
                <a href="${BACKEND_URL}/api/download?id=${trackId}" target="_blank" onclick="event.stopPropagation()" title="Baixar MP3" class="mt-2 text-center bg-brand-subtle hover:bg-white/10 text-brand-green border border-brand-green/30 text-[10px] py-1 px-2 rounded-full font-semibold transition-colors">
                    ⬇ Baixar MP3
                </a>
            `;

            // Clique para carregar o stream de áudio do YouTube via Render
            card.onclick = () => loadAndPlayStream(trackId, title = trackName, artistName, coverUrl);
            cardsGrid.appendChild(card);
        });
    }

    // Requisição para reproduzir o áudio completo
    async function loadAndPlayStream(id, title, artist, cover) {
        const audioElement = document.getElementById('audioElement') || document.querySelector('audio');

        try {
            const res = await fetch(`${BACKEND_URL}/api/stream?id=${id}`);
            const data = await res.json();

            if (data.streamUrl && audioElement) {
                audioElement.pause();
                audioElement.src = data.streamUrl;
                audioElement.currentTime = 0;
                audioElement.load();
                audioElement.play().catch(err => console.warn("Autoplay bloqueado pelo browser:", err));
            } else {
                alert("Não foi possível carregar o fluxo de áudio.");
            }
        } catch (e) {
            console.error("Erro ao invocar stream:", e);
        }
    }

    // Escuta a digitação na barra de pesquisa
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const val = e.target.value;
            if (!val.trim()) return;
            debounceTimer = setTimeout(() => {
                fetchMusic(val);
            }, 500);
        });
    }

    // Executa a busca inicial ao abrir a página
    fetchMusic('Henrique e Juliano');
});
