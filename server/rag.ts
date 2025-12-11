/**
 * RAG (Retrieval-Augmented Generation) Module
 * 
 * Busca opcional no material educacional moçambicano para enriquecer respostas.
 * Filosofia: Conhecimento global + Contexto local = Estudantes competitivos globalmente
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execAsync = promisify(exec);

const KNOWLEDGE_BASE_DIR = path.join(__dirname, 'knowledge_base');
const METADATA_FILE = path.join(__dirname, 'knowledge_metadata.json');

interface SearchResult {
  content: string;
  metadata: {
    source: string;
    filename: string;
    type: 'livro' | 'exame' | 'unknown';
    classe: string;
    disciplina: string;
    ano?: string;
    page_number: number;
  };
  score: number;
}

interface RAGContext {
  hasRelevantContent: boolean;
  results: SearchResult[];
  summary: string;
}

/**
 * Detecta se a pergunta do estudante requer consulta ao material moçambicano
 */
function shouldSearchMaterial(query: string, mode: string): boolean {
  const keywords = [
    'manual',
    'livro',
    'exame uem',
    'exame up',
    'admissão',
    'como está no',
    'segundo o manual',
    'no livro',
    'exame de',
    'prova de',
  ];

  const queryLower = query.toLowerCase();
  
  // Sempre busca em modo de preparação para exames
  if (mode === 'exam_prep') {
    return true;
  }

  // Busca se mencionar keywords específicos
  return keywords.some(keyword => queryLower.includes(keyword));
}

/**
 * Verifica se a base de conhecimento está disponível
 */
async function isKnowledgeBaseReady(): Promise<boolean> {
  try {
    await fs.access(KNOWLEDGE_BASE_DIR);
    await fs.access(METADATA_FILE);
    return true;
  } catch {
    return false;
  }
}

/**
 * Busca contexto relevante no material moçambicano usando Python script
 */
async function searchKnowledgeBase(
  query: string,
  classe?: string,
  disciplina?: string,
  topK: number = 3
): Promise<SearchResult[]> {
  try {
    // Criar script Python temporário para busca
    const searchScript = `
import sys
import json
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# Carregar embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    model_kwargs={'device': 'cpu'}
)

# Carregar vectorstore
vectorstore = Chroma(
    persist_directory="${KNOWLEDGE_BASE_DIR}",
    embedding_function=embeddings,
    collection_name="genius_knowledge"
)

# Buscar documentos relevantes
query = """${query.replace(/"/g, '\\"')}"""
results = vectorstore.similarity_search_with_score(query, k=${topK})

# Formatar resultados
output = []
for doc, score in results:
    output.append({
        "content": doc.page_content[:500],  # Limitar tamanho
        "metadata": doc.metadata,
        "score": float(score)
    })

print(json.dumps(output, ensure_ascii=False))
`;

    const scriptPath = path.join(__dirname, 'temp_search.py');
    await fs.writeFile(scriptPath, searchScript);

    // Executar script
    const { stdout } = await execAsync(`python3 ${scriptPath}`, {
      timeout: 30000, // 30 segundos
    });

    // Limpar script temporário
    await fs.unlink(scriptPath);

    // Parse resultados
    const results = JSON.parse(stdout);
    return results;
  } catch (error) {
    console.error('Erro ao buscar na base de conhecimento:', error);
    return [];
  }
}

/**
 * Obtém contexto RAG para enriquecer a resposta
 */
export async function getRAGContext(
  query: string,
  mode: string,
  studentProfile: any
): Promise<RAGContext> {
  // Verificar se deve buscar material
  if (!shouldSearchMaterial(query, mode)) {
    return {
      hasRelevantContent: false,
      results: [],
      summary: '',
    };
  }

  // Verificar se base de conhecimento está pronta
  const isReady = await isKnowledgeBaseReady();
  if (!isReady) {
    console.log('Base de conhecimento ainda não está pronta');
    return {
      hasRelevantContent: false,
      results: [],
      summary: '',
    };
  }

  try {
    // Buscar contexto relevante
    const results = await searchKnowledgeBase(
      query,
      studentProfile.grade,
      undefined, // disciplina pode ser inferida da query
      3
    );

    if (results.length === 0) {
      return {
        hasRelevantContent: false,
        results: [],
        summary: '',
      };
    }

    // Criar resumo do contexto encontrado
    const summary = createContextSummary(results);

    return {
      hasRelevantContent: true,
      results,
      summary,
    };
  } catch (error) {
    console.error('Erro ao obter contexto RAG:', error);
    return {
      hasRelevantContent: false,
      results: [],
      summary: '',
    };
  }
}

/**
 * Cria resumo do contexto encontrado para adicionar ao prompt
 */
function createContextSummary(results: SearchResult[]): string {
  if (results.length === 0) return '';

  const sources = results.map(r => {
    const { metadata } = r;
    return `- ${metadata.type === 'livro' ? 'Livro' : 'Exame'}: ${metadata.disciplina} (${metadata.classe}ª classe)`;
  }).join('\n');

  const content = results.map(r => r.content).join('\n\n---\n\n');

  return `
CONTEXTO DO MATERIAL MOÇAMBICANO:
(Usa este contexto como REFERÊNCIA, mas não te limites a ele. Adiciona sempre mais valor com conhecimento global.)

Fontes consultadas:
${sources}

Conteúdo relevante:
${content}

IMPORTANTE: Este é apenas material de referência. Usa-o para:
- Conhecer a terminologia usada nos manuais moçambicanos
- Entender o formato de exames (se relevante)
- Não contradizer o que é ensinado nas escolas (quando apropriado)

MAS sempre:
- Adiciona explicações melhores e mais completas
- Usa métodos mais eficientes se existirem
- Inclui conhecimento científico moderno
- Mostra aplicações práticas e tecnológicas
- Mantém exemplos no contexto moçambicano (MZN, locais, etc)
`;
}

/**
 * Adiciona contexto RAG ao system prompt se relevante
 */
export function enhanceSystemPrompt(
  basePrompt: string,
  ragContext: RAGContext
): string {
  if (!ragContext.hasRelevantContent) {
    return basePrompt;
  }

  return `${basePrompt}

${ragContext.summary}`;
}

