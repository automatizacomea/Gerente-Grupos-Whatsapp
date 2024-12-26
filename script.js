// Inicialização do Supabase
const supabaseUrl = 'https://tbdvznmoxuulgbdrhkfo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZHZ6bm1veHV1bGdiZHJoa2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ0MjU3MSwiZXhwIjoyMDUwMDE4NTcxfQ.MKkmRr4Kef2YpWybB4yX52mfYDmyJXM4Cpe7CJ7-3WI';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

let leads = [];
let palavrasChave = [];

// Função para carregar leads do Supabase
async function carregarLeads() {
    try {
        const { data, error } = await supabase
            .from('leads')
            .select('*');
        
        if (error) throw error;

        leads = data;
        console.log('Leads carregados:', leads);
        atualizarEstatisticasLeads();
        preencherTabelaLeads();
    } catch (error) {
        console.error('Erro ao carregar leads:', error);
    }
}

// Função para carregar palavras-chave do Supabase
async function carregarPalavrasChave() {
    try {
        const { data, error } = await supabase
            .from('palavras_chave')
            .select('*');
        
        if (error) throw error;

        palavrasChave = data.map(item => item.palavra);
        console.log('Palavras-chave carregadas:', palavrasChave);
        exibirPalavrasChave();
    } catch (error) {
        console.error('Erro ao carregar palavras-chave:', error);
    }
}

// Função para atualizar as estatísticas de leads
function atualizarEstatisticasLeads() {
    const totalLeads = leads.length;
    const leadsQuentes = leads.filter(lead => lead.status === "quente").length;
    const leadsMornos = leads.filter(lead => lead.status === "morno").length;
    const leadsFrios = leads.filter(lead => lead.status === "frio").length;

    document.getElementById("total-leads").textContent = totalLeads;
    document.getElementById("leads-quentes").textContent = leadsQuentes;
    document.getElementById("leads-mornos").textContent = leadsMornos;
    document.getElementById("leads-frios").textContent = leadsFrios;
}

// Função para preencher a tabela de leads
function preencherTabelaLeads(leadsParaExibir = leads) {
    const corpoTabela = document.getElementById("corpo-leads");
    corpoTabela.innerHTML = "";

    leadsParaExibir.forEach(lead => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${lead.nome}</td>
            <td>${lead.telefone}</td>
            <td><span class="status-badge status-${lead.status}">${lead.status}</span></td>
            <td>${lead.interesse}</td>
            <td><button class="btn-excluir" data-id="${lead.id}"><i class="fas fa-trash"></i></button></td>
        `;
        corpoTabela.appendChild(linha);
    });

    // Adicionar evento de clique para os botões de excluir
    document.querySelectorAll('.btn-excluir').forEach(button => {
        button.addEventListener('click', function() {
            const leadId = parseInt(this.getAttribute('data-id'));
            excluirLead(leadId);
        });
    });
}

// Função para excluir um lead
async function excluirLead(id) {
    try {
        const { error } = await supabase
            .from('leads')
            .delete()
            .eq('id', id);

        if (error) throw error;

        leads = leads.filter(lead => lead.id !== id);
        atualizarEstatisticasLeads();
        preencherTabelaLeads();
    } catch (error) {
        console.error('Erro ao excluir lead:', error);
    }
}

// Função para exibir palavras-chave
function exibirPalavrasChave() {
    const listaPalavrasChave = document.getElementById("lista-palavras-chave");
    listaPalavrasChave.innerHTML = "<h3>Palavras-chave Atuais:</h3>";
    const ul = document.createElement("ul");
    palavrasChave.forEach(palavraChave => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${palavraChave}
            <button class="btn-remover-palavra-chave" data-palavra="${palavraChave}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        ul.appendChild(li);
    });
    listaPalavrasChave.appendChild(ul);

    // Adicionar evento de clique para remover palavras-chave
    document.querySelectorAll('.btn-remover-palavra-chave').forEach(button => {
        button.addEventListener('click', function() {
            const palavraParaRemover = this.getAttribute('data-palavra');
            removerPalavraChave(palavraParaRemover);
        });
    });
}

// Função para remover palavra-chave
async function removerPalavraChave(palavra) {
    try {
        const { error } = await supabase
            .from('palavras_chave')
            .delete()
            .eq('palavra', palavra);

        if (error) throw error;

        palavrasChave = palavrasChave.filter(p => p !== palavra);
        exibirPalavrasChave();
    } catch (error) {
        console.error('Erro ao remover palavra-chave:', error);
    }
}

// Função para filtrar leads por status
function filtrarLeads() {
    const statusSelecionado = document.getElementById("filtro-status").value;
    let leadsFiltrados = leads;
    if (statusSelecionado !== "todos") {
        leadsFiltrados = leads.filter(lead => lead.status === statusSelecionado);
    }
    preencherTabelaLeads(leadsFiltrados);
}

// Função para ordenar leads
function ordenarLeads(coluna) {
    leads.sort((a, b) => {
        if (a[coluna] < b[coluna]) return -1;
        if (a[coluna] > b[coluna]) return 1;
        return 0;
    });
    preencherTabelaLeads();
}

// Função para adicionar um lead aleatório
async function adicionarLeadAleatorio() {
    const nomes = ["Ana", "Bruno", "Carla", "Daniel", "Eduarda", "Fábio", "Gabriela", "Hugo"];
    const sobrenomes = ["Silva", "Santos", "Oliveira", "Rodrigues", "Ferreira", "Almeida", "Pereira", "Costa"];
    const interesses = ["preço", "demonstração", "funcionalidades", "suporte", "integração"];
    const status = ["quente", "morno", "frio"];

    const novoLead = {
        nome: `${nomes[Math.floor(Math.random() * nomes.length)]} ${sobrenomes[Math.floor(Math.random() * sobrenomes.length)]}`,
        telefone: `+55${Math.floor(Math.random() * 90000000) + 10000000}`,
        status: status[Math.floor(Math.random() * status.length)],
        interesse: interesses[Math.floor(Math.random() * interesses.length)]
    };

    try {
        const { data, error } = await supabase
            .from('leads')
            .insert([novoLead])
            .select();

        if (error) throw error;

        leads.push(data[0]);
        atualizarEstatisticasLeads();
        preencherTabelaLeads();
    } catch (error) {
        console.error('Erro ao adicionar lead:', error);
    }
}

// Ouvinte de evento para adicionar uma nova palavra-chave
document.getElementById("formulario-adicionar-palavra-chave").addEventListener("submit", async function(e) {
    e.preventDefault();
    const inputPalavraChave = document.getElementById("input-palavra-chave");
    const novaPalavraChave = inputPalavraChave.value.trim().toLowerCase();
    if (novaPalavraChave && !palavrasChave.includes(novaPalavraChave)) {
        try {
            const { error } = await supabase
                .from('palavras_chave')
                .insert([{ palavra: novaPalavraChave }]);

            if (error) throw error;

            palavrasChave.push(novaPalavraChave);
            exibirPalavrasChave();
            inputPalavraChave.value = "";
        } catch (error) {
            console.error('Erro ao adicionar palavra-chave:', error);
        }
    }
});

// Ouvinte de evento para exportar leads (apenas um alerta para este MVP)
document.getElementById("btn-exportar").addEventListener("click", function() {
    alert("Leads exportados com sucesso!");
});

// Ouvinte de evento para adicionar lead aleatório
document.getElementById("btn-adicionar-lead").addEventListener("click", adicionarLeadAleatorio);

// Ouvinte de evento para filtrar leads
document.getElementById("filtro-status").addEventListener("change", filtrarLeads);

// Ouvinte de evento para ordenar leads
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', function() {
        const coluna = this.getAttribute('data-sort');
        ordenarLeads(coluna);
    });
});

// Função para configurar listeners em tempo real
function configurarListenersTempoReal() {
    supabase
        .channel('public:leads')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, payload => {
            if (payload.eventType === 'INSERT') {
                leads.push(payload.new);
            } else if (payload.eventType === 'DELETE') {
                leads = leads.filter(lead => lead.id !== payload.old.id);
            } else if (payload.eventType === 'UPDATE') {
                const index = leads.findIndex(lead => lead.id === payload.new.id);
                if (index !== -1) {
                    leads[index] = payload.new;
                }
            }
            atualizarEstatisticasLeads();
            preencherTabelaLeads();
        })
        .subscribe();

    supabase
        .channel('public:palavras_chave')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'palavras_chave' }, payload => {
            if (payload.eventType === 'INSERT') {
                palavrasChave.push(payload.new.palavra);
            } else if (payload.eventType === 'DELETE') {
                palavrasChave = palavrasChave.filter(palavra => palavra !== payload.old.palavra);
            }
            exibirPalavrasChave();
        })
        .subscribe();
}

// Inicializar o painel
async function inicializarPainel() {
    try {
        await carregarLeads();
        await carregarPalavrasChave();
        configurarListenersTempoReal();
        console.log('Painel inicializado com sucesso');
    } catch (error) {
        console.error('Erro ao inicializar o painel:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarPainel();
});
