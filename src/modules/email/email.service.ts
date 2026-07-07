import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private enabled = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const host = this.config.get<string>('smtp.host');
    const port = this.config.get<number>('smtp.port');
    const user = this.config.get<string>('smtp.user');
    const pass = this.config.get<string>('smtp.pass');

    // Nếu chưa cấu hình SMTP thì bỏ qua hoàn toàn (không throw lỗi, không chặn app khởi động)
    // — hữu ích khi mới deploy chưa kịp setup email, hệ thống vẫn chạy bình thường.
    if (!host || !user || !pass) {
      this.logger.warn('SMTP chưa được cấu hình — tính năng gửi email thông báo sẽ bị bỏ qua.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: port ?? 587,
      secure: port === 465,
      auth: { user, pass },
    });
    this.enabled = true;
    this.logger.log('Email service đã sẵn sàng.');
  }

  async sendNewConsultationNotification(data: {
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    message?: string;
  }) {
    if (!this.enabled || !this.transporter) return;

    const to = this.config.get<string>('smtp.adminNotificationEmail');
    if (!to) {
      this.logger.warn('ADMIN_NOTIFICATION_EMAIL chưa được cấu hình — bỏ qua gửi email.');
      return;
    }

    const from = this.config.get<string>('smtp.from') ?? this.config.get<string>('smtp.user');

    try {
      await this.transporter.sendMail({
        from: `"SolarDV Website" <${from}>`,
        to,
        subject: `🔔 Đăng ký tư vấn mới từ ${data.fullName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px;">
            <h2 style="color: #C9742C;">Có đăng ký tư vấn mới trên website</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; color: #666;">Họ tên:</td><td style="padding: 8px 0; font-weight: bold;">${data.fullName}</td></tr>
              <tr><td style="padding: 8px 0; color: #666;">Điện thoại:</td><td style="padding: 8px 0; font-weight: bold;">${data.phone}</td></tr>
              ${data.email ? `<tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;">${data.email}</td></tr>` : ''}
              ${data.address ? `<tr><td style="padding: 8px 0; color: #666;">Địa chỉ:</td><td style="padding: 8px 0;">${data.address}</td></tr>` : ''}
              ${data.message ? `<tr><td style="padding: 8px 0; color: #666; vertical-align: top;">Nội dung:</td><td style="padding: 8px 0;">${data.message}</td></tr>` : ''}
            </table>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              Vào trang quản trị Admin để xử lý đăng ký này.
            </p>
          </div>
        `,
      });
      this.logger.log(`Đã gửi email thông báo đăng ký tư vấn tới ${to}`);
    } catch (err) {
      // Không throw — lỗi gửi email không được phép làm hỏng luồng tạo consultation
      this.logger.error('Gửi email thông báo thất bại', err);
    }
  }
}
