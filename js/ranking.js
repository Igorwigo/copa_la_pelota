// URL da API
const API_URL = 'https://opensheet.elk.sh/1-mf5W0gjAusry7HTZRjy-GZBjTSBY31WVyGvy_6PaB0/1';

// Variável global para armazenar os jogadores
let jogadores = [];

// Função para calcular o nível baseado nos pontos
function calcularNivel(pontos) {
    const pontosNum = parseFloat(pontos);
    if (pontosNum >= 900) return "Lendário";
    if (pontosNum >= 750) return "Elite";
    if (pontosNum >= 600) return "Profissional";
    if (pontosNum >= 450) return "Avançado";
    return "Intermediário";
}

// Função para buscar dados da API
async function buscarDadosAPI() {
    try {
        // Mostrar loading
        mostrarLoading();
        
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error('Erro ao buscar dados da API');
        }
        const dados = await response.json();
        
        console.log('Dados recebidos da API:', dados); // Debug
        
        // Processar e formatar os dados
        jogadores = dados.map(jogador => {
            const pontos = parseFloat(jogador.Pontos || 0);
            const gols = parseInt(jogador.Gols || 0);
            const assistencias = parseInt(jogador['Assistência '] || jogador.Assistencia || jogador['Assistência'] || 0);
            
            return {
                nome: jogador.Nome || 'Sem nome',
                time: jogador.Time || 'Sem Time',
                pontos: pontos,
                gols: gols,
                assistencias: assistencias,
                nivel: calcularNivel(pontos)
            };
        });

        // Ordenar por pontos (maior para menor)
        jogadores.sort((a, b) => b.pontos - a.pontos);
        
        console.log('Jogadores processados:', jogadores); // Debug

        // Renderizar o ranking e o pódio
        renderizarRanking();
        atualizarPodio();
        atualizarFiltroTimes();

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        mostrarErro();
    }
}

// Função para mostrar loading
function mostrarLoading() {
    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px;">
                <strong>⏳ Carregando dados...</strong><br>
                <small>Aguarde um momento</small>
            </td>
        </tr>
    `;
}

// Função para mostrar mensagem de erro
function mostrarErro() {
    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 40px; color: #e74c3c;">
                <strong>⚠️ Erro ao carregar os dados</strong><br>
                <small>Verifique sua conexão ou tente novamente mais tarde.</small>
            </td>
        </tr>
    `;
    
    // Limpar pódio
    const podioContainer = document.querySelector('.podio-container');
    if (podioContainer) {
        podioContainer.innerHTML = '<p style="text-align: center; color: #e74c3c;">Erro ao carregar pódio</p>';
    }
}

// Função para atualizar o pódio com os 3 primeiros
function atualizarPodio() {
    if (!jogadores || jogadores.length === 0) {
        console.log('Nenhum jogador para exibir no pódio');
        return;
    }

    const podioData = [
        { classe: 'segundo-lugar', posicao: '2º', index: 1, medalha: '🥈' },
        { classe: 'primeiro-lugar', posicao: '1º', index: 0, medalha: '🥇' },
        { classe: 'terceiro-lugar', posicao: '3º', index: 2, medalha: '🥉' }
    ];

    const podioContainer = document.querySelector('.podio-container');
    if (!podioContainer) return;
    
    podioContainer.innerHTML = '';

    podioData.forEach(item => {
        const jogador = jogadores[item.index];
        if (!jogador) return;

        const podioItem = document.createElement('div');
        podioItem.className = `podio-item ${item.classe}`;
        podioItem.innerHTML = `
            <div class="podio-medalha">${item.medalha}</div>
            <div class="podio-posicao">${item.posicao}</div>
            <div class="podio-info">
                <div class="podio-nome">${jogador.nome}</div>
                <div class="podio-time">${jogador.time}</div>
                <div class="podio-nivel ${getNivelClass(jogador.nivel)}">${jogador.nivel}</div>
                <div class="podio-pontos">${jogador.pontos.toFixed(1)} pts</div>
            </div>
        `;
        podioContainer.appendChild(podioItem);
    });
}

// Função para atualizar o filtro de times dinamicamente
function atualizarFiltroTimes() {
    const filtroTime = document.getElementById('filtro-time');
    if (!filtroTime || !jogadores || jogadores.length === 0) return;
    
    const timesUnicos = [...new Set(jogadores.map(j => j.time))].filter(t => t && t !== 'Sem Time').sort();
    
    // Limpar opções antigas (exceto "Todos os Times")
    filtroTime.innerHTML = '<option value="todos">Todos os Times</option>';
    
    // Adicionar times únicos
    timesUnicos.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        filtroTime.appendChild(option);
    });
    
    // Se houver jogadores sem time, adicionar opção
    const temSemTime = jogadores.some(j => j.time === 'Sem Time');
    if (temSemTime) {
        const option = document.createElement('option');
        option.value = 'Sem Time';
        option.textContent = 'Sem Time';
        filtroTime.appendChild(option);
    }
}

// Função para determinar a classe CSS do nível
function getNivelClass(nivel) {
    const niveis = {
        "Lendário": "nivel-lendario",
        "Elite": "nivel-elite",
        "Profissional": "nivel-profissional",
        "Avançado": "nivel-avancado",
        "Intermediário": "nivel-intermediario"
    };
    return niveis[nivel] || "nivel-intermediario";
}

// Função para renderizar a tabela de ranking
function renderizarRanking(jogadoresFiltrados = null) {
    const tbody = document.getElementById('ranking-tbody');
    
    // Se não foram passados jogadores filtrados, usar todos
    if (!jogadoresFiltrados) {
        jogadoresFiltrados = jogadores;
    }
    
    if (!jogadoresFiltrados || jogadoresFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #666;">
                    <strong>Nenhum jogador encontrado</strong><br>
                    <small>Tente ajustar os filtros</small>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = '';

    jogadoresFiltrados.forEach((jogador, index) => {
        const posicao = index + 1;
        const isTop3 = posicao <= 3;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="ranking-position ${isTop3 ? 'top-3' : ''}">${posicao}º</span>
            </td>
            <td>
                <div class="jogador-nome">${jogador.nome}</div>
            </td>
            <td>
                <div class="jogador-time">${jogador.time}</div>
            </td>
            <td>
                <span class="nivel-badge ${getNivelClass(jogador.nivel)}">${jogador.nivel}</span>
            </td>

            <td>
                <span class="stats-valor">${jogador.gols}</span>
            </td>
            <td>
                <span class="stats-valor">${jogador.assistencias}</span>
            </td>
                        <td>
                <span class="pontos-valor">${jogador.pontos.toFixed(1)}</span>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Função para filtrar jogadores
function filtrarJogadores() {
    const filtroTime = document.getElementById('filtro-time');
    const filtroNivel = document.getElementById('filtro-nivel');
    
    if (!filtroTime || !filtroNivel || !jogadores || jogadores.length === 0) return;
    
    const timeValue = filtroTime.value;
    const nivelValue = filtroNivel.value;

    let jogadoresFiltrados = [...jogadores];

    // Filtrar por time
    if (timeValue !== 'todos') {
        jogadoresFiltrados = jogadoresFiltrados.filter(j => j.time === timeValue);
    }

    // Filtrar por nível
    if (nivelValue !== 'todos') {
        jogadoresFiltrados = jogadoresFiltrados.filter(j => j.nivel === nivelValue);
    }

    renderizarRanking(jogadoresFiltrados);
}

// Inicializar a página quando carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página carregada, buscando dados da API...');
    buscarDadosAPI();
});

// Função de scroll suave
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}