/**
 * Função para rolar até a seção de chaveamento
 */
function scrollToChaveamento() {
    const chaveamentoSection = document.getElementById('chaveamento');
    if (chaveamentoSection) {
        chaveamentoSection.scrollIntoView({ behavior: 'smooth' });
    }
}
