import nodemailer from 'nodemailer';

// Configuração do transporter (quem vai enviar os emails)
const transporter = nodemailer.createTransport({
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
          <h2 style="color: #333; margin-bottom: 20px;">Olá! 👋</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Obrigado por te juntares ao <strong>Genius</strong>! Estamos muito felizes por teres escolhido a nossa plataforma para potenciar os teus estudos.
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            Para começares a usar o Genius, precisas confirmar o teu endereço de email clicando no botão abaixo:
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
          
          <p style="color: #999; font-size: 14px; line-height: 1.4; margin-top: 30px;">
            Se não conseguires clicar no botão, copia e cola este link no teu navegador:<br>
            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            Se não criaste uma conta no Genius, podes ignorar este email.<br>
            Este link expira em 24 horas.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            © 2024 Genius - AI Tutor Moçambicano. Todos os direitos reservados.
          </p>
        </div>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado com sucesso:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return false;
  }
}