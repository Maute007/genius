# Como Adicionar os Documentos Moçambicanos ao Genius

## Opção 1: Via Interface Web (Recomendado - EM DESENVOLVIMENTO)

**Status:** Funcionalidade em desenvolvimento para a próxima versão.

Terá uma página de administração onde poderá fazer upload dos documentos directamente pelo browser.

---

## Opção 2: Via Acesso Directo ao Servidor (ACTUAL)

### Passo 1: Aceder ao Diretório

Os documentos devem ser colocados neste diretório:

```
/home/ubuntu/genius/documents/mocambique/
```

### Passo 2: Fazer Upload dos Ficheiros

Pode usar qualquer um destes métodos:

#### Método A: Via Painel de Controlo Manus
1. Abra o painel de gestão do projeto Genius
2. Vá à secção "Code" (Código)
3. Navegue até a pasta `documents/mocambique/`
4. Clique em "Upload Files"
5. Selecione os seus 100 documentos
6. Aguarde o upload completar

#### Método B: Via SCP/SFTP (Se tiver acesso SSH)
```bash
scp -r /caminho/local/documentos/* usuario@servidor:/home/ubuntu/genius/documents/mocambique/
```

#### Método C: Via Git (Se os documentos estiverem num repositório)
```bash
cd /home/ubuntu/genius/documents/mocambique/
git clone [URL_DO_REPOSITORIO_COM_DOCUMENTOS]
```

### Passo 3: Verificar os Ficheiros

Depois do upload, verifique se os ficheiros estão no lugar certo:

```bash
ls -la /home/ubuntu/genius/documents/mocambique/
```

Deverá ver os seus 100 documentos listados.

---

## Formatos Suportados

O Genius suporta os seguintes formatos de documento:

- ✅ **PDF** (.pdf)
- ✅ **Microsoft Word** (.doc, .docx)
- ✅ **Texto Simples** (.txt)
- ✅ **Markdown** (.md)
- ✅ **Rich Text** (.rtf)

---

## O Que Acontece Depois?

### Fase Actual (MVP)
Os documentos ficam armazenados no servidor. Na próxima fase, implementaremos:

### Fase 2 (Próxima Actualização)
1. **Processamento Automático**: O sistema lerá automaticamente todos os documentos
2. **Criação de Embeddings**: Converterá o conteúdo em vectores para busca semântica
3. **Integração RAG**: A IA usará estes documentos para dar respostas contextualizadas
4. **Base de Conhecimento**: Criará uma base de conhecimento moçambicana

---

## Estrutura Recomendada

Organize os documentos em subpastas para facilitar:

```
/home/ubuntu/genius/documents/mocambique/
├── curriculo/
│   ├── matematica_10_classe.pdf
│   ├── portugues_11_classe.pdf
│   └── ...
├── exercicios/
│   ├── exercicios_fisica.pdf
│   └── ...
├── contexto_local/
│   ├── historia_mocambique.pdf
│   ├── geografia_mocambique.pdf
│   └── ...
└── outros/
    └── ...
```

---

## Precisa de Ajuda?

**Email:** genius@risetech.co.mz  
**Telefone:** +258 826 074 507  
**WhatsApp:** +258 826 074 507

---

## Nota Importante

⚠️ **Os documentos NÃO são processados automaticamente ainda.** Esta funcionalidade será implementada na Fase 2 do projeto. Por agora, os documentos ficam armazenados e prontos para quando o sistema RAG for activado.

Para acelerar a implementação do sistema RAG, entre em contacto connosco!

