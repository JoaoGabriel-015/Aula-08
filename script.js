// A URL DA SUA API REAL deve ser definida aqui:
const API_BASE_URL = 'https://api-alunos.exemplo.com/alunos';

// --- SIMULAÇÃO DE API (Mantenha se não tiver API real) ---
let alunosData = [
    { id: 1, nome: "Ana Silva", turma: "TADS-2023", matricula: "2023001" },
    { id: 2, nome: "Bruno Costa", turma: "TADS-2024", matricula: "2024005" },
    { id: 3, nome: "Carla Souza", turma: "TADS-2023", matricula: "2023010" },
    { id: 4, nome: "Daniel Reis", turma: "TADS-2024", matricula: "2024012" }
];
let nextId = 5;

const mockFetchAlunos = async () => new Promise(resolve => {
    setTimeout(() => {
        resolve({
            json: () => Promise.resolve(alunosData),
            ok: true
        });
    }, 300);
});

const mockFetchCadastrar = async (novoAluno) => new Promise(resolve => {
    setTimeout(() => {
        const alunoComId = { ...novoAluno, id: nextId++ };
        alunosData.push(alunoComId);
        resolve({
            json: () => Promise.resolve(alunoComId),
            ok: true
        });
    }, 300);
});

const mockFetchDeletar = async (id) => new Promise(resolve => {
    setTimeout(() => {
        const index = alunosData.findIndex(a => a.id === parseInt(id));
        if (index > -1) {
            alunosData.splice(index, 1);
            resolve({
                ok: true,
                status: 204
            });
        } else {
            resolve({
                ok: false,
                status: 404
            });
        }
    }, 300);
});

const mockFetchPorNome = async (nome) => new Promise(resolve => {
    setTimeout(() => {
        const aluno = alunosData.filter(a => a.nome.toLowerCase().includes(nome.toLowerCase()));
        resolve({
            json: () => Promise.resolve(aluno),
            ok: true
        });
    }, 300);
});
// --- FIM DA SIMULAÇÃO DE API ---


// -----------------------------------------------------
// FUNÇÕES DE LÓGICA PRINCIPAL
// -----------------------------------------------------

const listaAlunosEl = document.getElementById('lista-alunos');
const formCadastro = document.getElementById('form-cadastro');
const msgCadastroEl = document.getElementById('msg-cadastro');
const msgConsultaEl = document.getElementById('msg-consulta');
const btnConsultarTodos = document.getElementById('btn-consultar-todos');
const btnBuscarAluno = document.getElementById('btn-buscar-aluno');
const inputBuscaNome = document.getElementById('busca-nome');
const selectFiltroTurma = document.getElementById('filtro-turma');

function exibirMensagem(element, mensagem, isSucesso) {
    element.textContent = mensagem;
    element.className = isSucesso ? 'mensagem sucesso' : 'mensagem erro';
    setTimeout(() => {
        element.className = 'mensagem';
        element.textContent = '';
    }, 3000);
}

function exibirAlunosNaTabela(alunos) {
    listaAlunosEl.innerHTML = '';
    msgConsultaEl.className = 'mensagem';

    if (alunos.length === 0) {
        listaAlunosEl.innerHTML = '<tr><td colspan="4">Nenhum aluno encontrado.</td></tr>';
        return;
    }

    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluno.nome}</td>
            <td>${aluno.turma}</td>
            <td>${aluno.matricula}</td>
            <td>
                <button class="btn-delete" data-id="${aluno.id}">Deletar</button>
            </td>
        `;
        listaAlunosEl.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (event) => {
            const alunoId = event.target.getAttribute('data-id');
            if (confirm(`Tem certeza que deseja deletar o aluno com ID ${alunoId}?`)) {
                deletarAluno(alunoId);
            }
        });
    });
}

function popularFiltroTurma(alunos) {
    const turmas = [...new Set(alunos.map(aluno => aluno.turma))].sort();

    selectFiltroTurma.innerHTML = '<option value="">Todas as Turmas</option>';

    turmas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma;
        option.textContent = turma;
        selectFiltroTurma.appendChild(option);
    });
}


// -----------------------------------------------------
// REQUISIÇÕES À API (usando mock ou fetch real)
// -----------------------------------------------------

async function consultarTodosAlunos(turma = null) {
    try {
        // Se for usar a API real, substitua 'mockFetchAlunos()' pelo 'fetch(API_BASE_URL)'
        const response = await mockFetchAlunos(); 

        if (!response.ok) {
            throw new Error(`Erro na consulta: ${response.status}`);
        }

        let alunos = await response.json();

        if (turma) {
            alunos = alunos.filter(aluno => aluno.turma === turma);
        }
        
        exibirAlunosNaTabela(alunos);
        
        if (!turma) {
            popularFiltroTurma(alunos);
        }

    } catch (error) {
        exibirMensagem(msgConsultaEl, `Erro ao carregar dados: ${error.message}`, false);
    }
}

async function consultarAlunoPorNome() {
    const nome = inputBuscaNome.value.trim();
    if (!nome) {
        exibirMensagem(msgConsultaEl, 'Por favor, digite um nome para buscar.', false);
        return;
    }

    try {
        // Se for usar a API real, substitua 'mockFetchPorNome(nome)' pelo fetch real
        const response = await mockFetchPorNome(nome); 

        if (!response.ok) {
            throw new Error(`Erro na busca: ${response.status}`);
        }

        const alunosEncontrados = await response.json();
        exibirAlunosNaTabela(alunosEncontrados);

    } catch (error) {
        exibirMensagem(msgConsultaEl, `Erro ao buscar aluno: ${error.message}`, false);
    }
}

async function cadastrarNovoAluno(alunoData) {
    try {
        // Se for usar a API real, substitua 'mockFetchCadastrar(alunoData)' pelo fetch real (POST)
        const response = await mockFetchCadastrar(alunoData);
        
        if (!response.ok) {
            throw new Error(`Erro ao cadastrar: ${response.status}`);
        }

        const novoAluno = await response.json();
        
        exibirMensagem(msgCadastroEl, `Aluno ${novoAluno.nome} cadastrado com sucesso!`, true);
        formCadastro.reset();
        consultarTodosAlunos();
        
    } catch (error) {
        exibirMensagem(msgCadastroEl, `Erro ao cadastrar aluno: ${error.message}`, false);
    }
}

async function deletarAluno(id) {
    try {
        // Se for usar a API real, substitua 'mockFetchDeletar(id)' pelo fetch real (DELETE)
        const response = await mockFetchDeletar(id);
        
        if (!response.ok) {
            throw new Error(`Erro ao deletar: ${response.status}`);
        }

        exibirMensagem(msgConsultaEl, `Aluno (ID: ${id}) deletado com sucesso.`, true);
        consultarTodosAlunos();

    } catch (error) {
        exibirMensagem(msgConsultaEl, `Erro ao deletar aluno: ${error.message}`, false);
    }
}


// -----------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------

formCadastro.addEventListener('submit', (event) => {
    event.preventDefault();
    const alunoData = {
        nome: document.getElementById('nome').value,
        turma: document.getElementById('turma').value,
        matricula: document.getElementById('matricula').value,
    };
    cadastrarNovoAluno(alunoData);
});

btnConsultarTodos.addEventListener('click', () => {
    selectFiltroTurma.value = '';
    consultarTodosAlunos();
});

btnBuscarAluno.addEventListener('click', consultarAlunoPorNome);

selectFiltroTurma.addEventListener('change', (event) => {
    const turmaSelecionada = event.target.value;
    consultarTodosAlunos(turmaSelecionada || null); 
});

document.addEventListener('DOMContentLoaded', () => {
    consultarTodosAlunos(); 
});