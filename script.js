// Inicialização do Supabase
const supabase = window.supabase.createClient(
    'https://tbdvznmoxuulgbdrhkfo.supabase.co/rest/v1/',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZHZ6bm1veHV1bGdiZHJoa2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ0MjU3MSwiZXhwIjoyMDUwMDE4NTcxfQ.MKkmRr4Kef2YpWybB4yX52mfYDmyJXM4Cpe7CJ7-3WI'
);

let leads = [];

// Função para carregar leads do Supabase
async function carregarLeads() {
    try {
        const { data, error } = await supabase
            .from('leads_analise')
            .select('*')
            .order('hora', { ascending: false });
        
        if (error) throw error;

        leads = data || [];
        console.log('Leads carregados:', leads);
        atualizarEstatisticasLeads();
        preencherTabelaLeads();
    } catch (error) {
        console.error('Erro ao carregar leads:', error);
    }
}

// Função para atualizar as estatísticas de leads
function atualizarEstatisticasLeads() {
    const totalLeads = leads.length;
    const leadsFortes = leads.filter(lead => lead.strength === "forte").length;
    const leadsMedios = leads.filter(lead => lead.strength === "medio").length;
    const leadsFracos = leads.filter(lead => lead.strength === "fraco").length;

    document.getElementById("total-leads").textContent = totalLeads;
    document.getElementById("leads-fortes").textContent = leadsFortes;
    document.getElementById("leads-medios").textContent = leadsMedios;
    document.getElementById("leads-fracos").textContent = leadsFracos;
}

// Função para preencher a tabela de leads
function preencherTabelaLeads(leadsParaExibir = leads) {
    const corpoTabela = document.getElementById("corpo-leads");
    corpoTabela.innerHTML = "";

    leadsParaExibir.forEach(lead => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${lead.nome}</td>
            <td>${lead.remoteJid}</td>
            <td><span class="status-badge status-${lead.strength}">${lead.strength}</span></td>
            <td>${lead.category}</td>
            <td>${lead.data} ${lead.hora}</td>
            <td><button class="btn-excluir" data-hora="${lead.hora}"><i class="fas fa-trash"></i></button></td>
        `;
        corpoTabela.appendChild(linha);
    });

    // Adicionar evento de clique para os botões de excluir
    document.querySelectorAll('.btn-excluir').forEach(button => {
        button.addEventListener('click', function() {
            const leadHora = this.getAttribute('data-hora');
            excluirLead(leadHora);
        });
    });
}

// Função para excluir um lead
async function excluirLead(hora) {
    try {
        const { error } = await supabase
            .from('leads_analise')
            .delete()
            .eq('hora', hora);

        if (error) throw error;

        leads = leads.filter(lead => lead.hora !== hora);
        atualizarEstatisticasLeads();
        preencherTabelaLeads();
    } catch (error) {
        console.error('Erro ao excluir lead:', error);
    }
}

// Função para filtrar leads por força
function filtrarLeads() {
    const strengthSelecionado = document.getElementById("filtro-strength").value;
    let leadsFiltrados = leads;
    if (strengthSelecionado !== "todos") {
        leadsFiltrados = leads.filter(lead => lead.strength === strengthSelecionado);
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

// Função para exportar leads para CSV
function exportarLeadsCSV() {
    const csvContent = [
        ["Nome", "Telefone", "Força", "Categoria", "Data", "Hora", "Mensagem", "Confiança"],
        ...leads.map(lead => [
            lead.nome,
            lead.remoteJid,
            lead.strength,
            lead.category,
            lead.data,
            lead.hora,
            lead.mensagem,
            lead.confidence
        ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "leads_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Função para alternar o tema
function toggleTheme(e) {
    if (e.target.checked) {
        document.documentElement.classList.add('dark-theme');
        document.documentElement.classList.remove('light-theme');
    } else {
        document.documentElement.classList.add('light-theme');
        document.documentElement.classList.remove('dark-theme');
    }
}


// Ouvinte de evento para exportar leads
document.getElementById("btn-exportar").addEventListener("click", exportarLeadsCSV);

// Ouvinte de evento para filtrar leads
document.getElementById("filtro-strength").addEventListener("change", filtrarLeads);

// Ouvinte de evento para ordenar leads
document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', function() {
        const coluna = this.getAttribute('data-sort');
        ordenarLeads(coluna);
    });
});

// Função para configurar listeners em tempo real
function configurarListenersTempoReal() {
    const channel = supabase
        .channel('leads_changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'leads_analise'
            },
            (payload) => {
                console.log('Mudança detectada:', payload);
                
                if (payload.eventType === 'INSERT') {
                    leads = [payload.new, ...leads];
                } else if (payload.eventType === 'DELETE') {
                    leads = leads.filter(lead => lead.hora !== payload.old.hora);
                } else if (payload.eventType === 'UPDATE') {
                    const index = leads.findIndex(lead => lead.hora === payload.new.hora);
                    if (index !== -1) {
                        leads[index] = payload.new;
                    }
                }
                
                atualizarEstatisticasLeads();
                preencherTabelaLeads();
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
}

// Inicializar o painel
async function inicializarPainel() {
    try {
        await carregarLeads();
        const unsubscribe = configurarListenersTempoReal();
        
        // Configurar tema inicial
        const themeSwitch = document.getElementById('theme-switch');
        themeSwitch.addEventListener('change', toggleTheme);
        
        // Definir tema inicial com base na preferência do sistema
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            themeSwitch.checked = true;
            document.documentElement.classList.add('dark-theme');
        } else {
            document.documentElement.classList.add('light-theme');
        }
        
        console.log('Painel inicializado com sucesso');
        
        // Cleanup function to unsubscribe from the channel when the component unmounts or is no longer needed.
        return () => {
            unsubscribe();
        }
    } catch (error) {
        console.error('Erro ao inicializar o painel:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarPainel);

