# 📚 Sistema de Documentos Moçambicanos - Genius

## Onde Colocar os Documentos?

Os seus 100 documentos moçambicanos devem ser colocados no diretório:

```
/home/ubuntu/genius/documents/mocambique/
```

## Formatos Suportados

- **PDF** (.pdf) - Documentos escaneados ou digitais
- **Word** (.docx, .doc) - Documentos do Microsoft Word
- **Texto** (.txt) - Arquivos de texto simples
- **Markdown** (.md) - Documentos formatados em Markdown

## Estrutura Recomendada

Organize os documentos em subpastas para melhor gestão:

```
documents/mocambique/
├── curriculo/
│   ├── matematica_10classe.pdf
│   ├── portugues_secundario.pdf
│   └── ciencias_naturais.pdf
├── materias/
│   ├── fisica/
│   ├── quimica/
│   └── biologia/
├── exemplos/
│   ├── exercicios_mocambicanos.pdf
│   └── problemas_contextualizados.pdf
└── contexto/
    ├── cultura_mocambicana.txt
    └── referencias_locais.md
```

## Como o Sistema Funciona (RAG - Retrieval-Augmented Generation)

### 1. Processamento dos Documentos
- Os documentos são lidos e o texto é extraído
- O conteúdo é dividido em chunks (pedaços) de texto
- Cada chunk é convertido em embeddings (vetores numéricos)

### 2. Armazenamento
- Os embeddings são armazenados numa base de dados vetorial
- Isto permite busca semântica rápida e eficiente

### 3. Utilização nas Respostas
Quando um estudante faz uma pergunta:
1. A pergunta é convertida em embedding
2. O sistema busca os chunks mais relevantes nos documentos
3. O contexto relevante é injetado no prompt da IA
4. A IA usa esse contexto para dar respostas mais precisas e localizadas

## Exemplo de Uso

**Sem RAG:**
- Estudante: "Como resolver equações do 2º grau?"
- IA: Resposta genérica com exemplos internacionais

**Com RAG (Documentos Moçambicanos):**
- Estudante: "Como resolver equações do 2º grau?"
- Sistema busca: Encontra exemplos do currículo moçambicano
- IA: Resposta adaptada com exemplos do programa nacional, terminologia usada em Moçambique, e exercícios do tipo que aparecem nos exames nacionais

## Implementação Técnica (Para Desenvolvedores)

### Opção 1: Sistema Local (Mais Simples)
```typescript
// Usar embeddings do OpenAI + armazenamento local
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
```

### Opção 2: Sistema Escalável (Recomendado)
```typescript
// Usar Pinecone ou Weaviate para produção
import { PineconeStore } from "@langchain/pinecone";
```

## Próximos Passos

1. **Adicione os documentos** ao diretório `documents/mocambique/`
2. **Execute o script de processamento** (será criado na próxima fase)
3. **Teste o sistema** fazendo perguntas relacionadas ao conteúdo dos documentos
4. **Refine** adicionando mais documentos conforme necessário

## Benefícios

✅ **Respostas mais precisas** - Baseadas no currículo nacional
✅ **Contexto local** - Exemplos e referências moçambicanas
✅ **Terminologia correta** - Usa os termos do sistema educacional moçambicano
✅ **Exercícios relevantes** - Alinhados com os exames nacionais
✅ **Escalável** - Fácil adicionar mais documentos no futuro

## Notas Importantes

- **Tamanho dos documentos**: Não há limite, mas documentos muito grandes serão divididos em chunks
- **Atualização**: Quando adicionar novos documentos, será necessário reprocessar
- **Privacidade**: Os documentos ficam no servidor e não são partilhados
- **Performance**: Quanto mais documentos, melhor a qualidade das respostas (até um certo ponto)

---

**Contacto para Suporte:**
- Email: genius@risetech.co.mz
- Telefone: +258 826 074 507

