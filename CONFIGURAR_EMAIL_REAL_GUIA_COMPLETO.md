# 📧 Como Configurar Email Real - Guia Completo para Iniciantes

## 🎯 O que vamos fazer?
Atualmente, quando alguém se registra, o link de verificação aparece apenas no console do servidor. Vamos fazer com que um **email real** seja enviado para a pessoa.

---

## 📋 **PASSO 1: Preparar sua conta do Gmail**

### 1.1 - Ativar "Senha de App" no Gmail
1. Acesse [myaccount.google.com](https://myaccount.google.com)
2. Clique em **"Segurança"** (lado esquerdo)
3. Ative **"Verificação em duas etapas"** (se não estiver ativada)
4. Depois de ativar, procure por **"Senhas de app"**
5. Clique em **"Senhas de app"**
6. Selecione **"Outro (nome personalizado)"**
7. Digite: **"Genius App"**
8. Clique **"Gerar"**
9. **COPIE** a senha gerada (16 caracteres) - você vai precisar dela!

### ⚠️ **IMPORTANTE**: Use a "senha de app", NÃO a senha normal do Gmail!

---

## 📋 **PASSO 2: Configurar as variáveis de ambiente**

### 2.1 - Editar o arquivo `.env`

**Arquivo**: `/home/maute007/Desktop/projetos/genius-codigo-completo/genius/.env`

**O que fazer**: Adicionar estas linhas no final do arquivo:

```env
# Email Configuration - Gmail SMTP
EMAIL_SERVICE=gmail
EMAIL_USER=SEU_EMAIL@gmail.com
EMAIL_PASS=SUA_SENHA_DE_APP_AQUI
FROM_EMAIL=SEU_EMAIL@gmail.com
FROM_NAME=Genius - AI Tutor
```

**Exemplo real**:
```env
# Email Configuration - Gmail SMTP
EMAIL_SERVICE=gmail
EMAIL_USER=joao.silva@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
FROM_EMAIL=joao.silva@gmail.com
FROM_NAME=Genius - AI Tutor
```

---

## 📋 **PASSO 3: Criar o serviço de email**

### 3.1 - Criar arquivo `emailService.ts`

**Arquivo**: `/home/maute007/Desktop/projetos/genius-codigo-completo/genius/server/_core/emailService.ts`

**Conteúdo** (copie e cole exatamente assim):

```typescript
import nodemailer from 'nodemailer';

// Configuração do transporter (quem vai enviar os emails)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para enviar email de verificação
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: '🎓 Genius - Confirma o teu email para começar!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎓 Bem-vindo ao Genius!</h1>
          <p style="color: white; margin: 10px 0;">O teu AI Tutor Moçambicano</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Olá! 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.5;">
            Obrigado por te juntares ao Genius! Para começar a usar o teu AI tutor personalizado, 
            precisas confirmar o teu email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              ✅ Confirmar Email
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            Se o botão não funcionar, copia e cola este link no teu browser:<br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Este email foi enviado porque criaste uma conta no Genius.<br>
            Se não foste tu, podes ignorar este email.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email enviado para: ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao enviar email para ${email}:`, error);
    return false;
  }
}
```

---

## 📋 **PASSO 4: Modificar o código que envia emails**

### 4.1 - Editar `auth-router.ts`

**Arquivo**: `/home/maute007/Desktop/projetos/genius-codigo-completo/genius/server/auth-router.ts`

**Encontrar esta parte** (por volta da linha 65):
```typescript
// TODO: Send verification email
// For now, we'll just return success without the token
// In production, integrate with email service (SendGrid, etc.)
console.log(`[Auth] Verification token for ${input.email}: ${verificationToken}`);
console.log(`[Auth] Verification URL: ${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`);
```

**Substituir por**:
```typescript
// Send verification email
const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

// Try to send real email
const emailSent = await sendVerificationEmail(input.email, verificationUrl);

if (emailSent) {
  console.log(`✅ Email de verificação enviado para: ${input.email}`);
} else {
  console.log(`❌ Falha ao enviar email, usando console como backup:`);
  console.log(`[Auth] Verification URL: ${verificationUrl}`);
}
```

### 4.2 - Adicionar import no topo do arquivo

**No topo do arquivo** `auth-router.ts`, **adicionar**:
```typescript
import { sendVerificationEmail } from "./_core/emailService";
```

### 4.3 - Fazer o mesmo para reenvio de email

**Encontrar esta parte** (por volta da linha 265):
```typescript
// TODO: Send verification email
// For now, we'll just log to console for development
console.log(`[Auth] NEW Verification token for ${input.email}: ${verificationToken}`);
console.log(`[Auth] NEW Verification URL: ${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`);
```

**Substituir por**:
```typescript
// Send verification email (resend)
const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

// Try to send real email
const emailSent = await sendVerificationEmail(input.email, verificationUrl);

if (emailSent) {
  console.log(`✅ Email de verificação REENVIADO para: ${input.email}`);
} else {
  console.log(`❌ Falha ao reenviar email, usando console como backup:`);
  console.log(`[Auth] NEW Verification URL: ${verificationUrl}`);
}
```

---

## 📋 **PASSO 5: Testar o sistema**

### 5.1 - Reiniciar o servidor
```bash
cd /home/maute007/Desktop/projetos/genius-codigo-completo/genius
npm run dev
```

### 5.2 - Testar o registro
1. Abra `http://localhost:3000`
2. Clique "Começar Grátis"
3. Registre com um email real (pode ser o seu mesmo)
4. **Verifique seu email** - deve chegar uma mensagem linda! 📧

### 5.3 - Testar o reenvio
1. Se não receber o email, clique "Reenviar Email"
2. Deve chegar outro email

---

## 🔧 **RESUMO DOS ARQUIVOS MODIFICADOS**

| Arquivo | O que faz |
|---------|-----------|
| `.env` | Guarda suas credenciais do Gmail |
| `server/_core/emailService.ts` | **NOVO** - Envia emails bonitos |
| `server/auth-router.ts` | Modificado para usar email real |

---

## ❗ **PROBLEMAS COMUNS E SOLUÇÕES**

### ❌ "Authentication failed"
- **Problema**: Senha do Gmail incorreta
- **Solução**: Use a "senha de app", não a senha normal

### ❌ "Less secure app access"
- **Problema**: Gmail bloqueando
- **Solução**: Use "senha de app" (método mais seguro)

### ❌ Email não chega
- **Problema**: Pode estar no spam
- **Solução**: Verifique pasta de spam/lixo

### ❌ Erro de conexão
- **Problema**: Firewall ou internet
- **Solução**: Verifique conexão à internet

---

## 🎉 **PRONTO!**

Agora seu sistema envia emails **reais e bonitos**! 

Quando alguém:
- ✅ Se registra → Recebe email automaticamente
- ✅ Clica "Reenviar" → Recebe novo email
- ✅ Clica no link → Conta ativada!

**Backup**: Se o email falhar, o link ainda aparece no console como antes.

---

## 📞 **Precisa de Ajuda?**

Se algo não funcionar:
1. Verifique se seguiu TODOS os passos
2. Confira se a "senha de app" está correta
3. Veja o console do servidor para mensagens de erro
4. Teste com um email diferente

**Boa sorte!** 🚀