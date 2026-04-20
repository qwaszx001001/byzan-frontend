// Email service for manuscript submissions
// This service can be configured to use EmailJS, SendGrid, or your backend API

export const emailService = {
  async sendManuscriptSubmission(formData) {
    const { email, judulBuku, deskripsiBuku } = formData
    
    // Create email content
    const emailContent = {
      to: 'admin@byzaneducation.com', // Replace with actual recipient email
      from: email,
      subject: `Pengajuan Naskah Buku: ${judulBuku}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #64fb5f; padding-bottom: 10px;">
            Pengajuan Naskah Buku Baru
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Detail Pengajuan:</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; width: 150px;">Email Pengirim:</td>
                <td style="padding: 8px 0; color: #333;">${email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Judul Buku:</td>
                <td style="padding: 8px 0; color: #333;">${judulBuku}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Deskripsi:</td>
                <td style="padding: 8px 0; color: #333; line-height: 1.6;">${deskripsiBuku.replace(/\n/g, '<br>')}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Tanggal Pengajuan:</td>
                <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td>
              </tr>
            </table>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #64fb5f;">
            <p style="margin: 0; color: #333;">
              <strong>Catatan:</strong> Silakan hubungi pengirim melalui email yang tercantum di atas untuk proses selanjutnya.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              Email ini dikirim otomatis dari sistem ByzanPedia<br>
              © ${new Date().getFullYear()} Byzan Education
            </p>
          </div>
        </div>
      `,
      text: `
        Pengajuan Naskah Buku Baru
        
        Email Pengirim: ${email}
        Judul Buku: ${judulBuku}
        Deskripsi: ${deskripsiBuku}
        Tanggal Pengajuan: ${new Date().toLocaleDateString('id-ID')}
        
        Silakan hubungi pengirim untuk proses selanjutnya.
      `
    }

    try {
      // For development, we'll simulate sending email
      // In production, you would integrate with your email service
      console.log('Sending email:', emailContent)
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Return success response
      return {
        success: true,
        message: 'Naskah berhasil dikirim! Tim kami akan menghubungi Anda segera.'
      }
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Gagal mengirim naskah. Silakan coba lagi.')
    }
  }
}