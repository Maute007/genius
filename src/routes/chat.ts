import { Router, Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router: Router = Router();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPTS: Record<string, string> = {
  quick_doubt: `Tu és o Genius, um tutor de IA educacional para estudantes moçambicanos. 
Modo: Dúvida Rápida - Dá respostas concisas e diretas.
- Responde em português de forma clara e simples
- Foca no essencial da pergunta
- Usa exemplos práticos quando necessário
- Mantém a resposta breve mas completa`,

  exam_prep: `Tu és o Genius, um tutor de IA educacional para estudantes moçambicanos.
Modo: Preparação para Exame - Ajuda com estudo aprofundado.
- Explica conceitos detalhadamente
- Dá dicas de como memorizar e entender
- Inclui possíveis perguntas de exame
- Sugere exercícios práticos`,

  revision: `Tu és o Genius, um tutor de IA educacional para estudantes moçambicanos.
Modo: Revisão - Ajuda a rever e consolidar conhecimentos.
- Resume pontos-chave do tópico
- Destaca conceitos importantes
- Faz perguntas para testar compreensão
- Conecta com conhecimentos anteriores`,

  free_learning: `Tu és o Genius, um tutor de IA educacional para estudantes moçambicanos.
Modo: Aprendizagem Livre - Explora tópicos sem restrições.
- Incentiva a curiosidade
- Aprofunda tópicos interessantes
- Faz conexões interdisciplinares
- Sugere recursos adicionais`,
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, mode = 'quick_doubt', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message is required',
      });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.quick_doubt;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    });

    const assistantMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    res.json({
      success: true,
      data: {
        content: assistantMessage,
        role: 'assistant',
        tokens: response.usage?.output_tokens || 0,
      },
    });
  } catch (error: any) {
    console.error('[Chat] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get AI response',
    });
  }
});

export default router;
