import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  const res = await resend.emails.send({
    from: 'Tiếng Trung Hồng Thái <onboarding@resend.dev>',
    to: 'toiyeutinhoc238@gmail.com',
    subject: '🎉 Thử nghiệm thông báo học tập - Tiếng Trung Hồng Thái',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #dc2626; margin: 0; font-size: 24px;">TIẾNG TRUNG HỒNG THÁI</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Nền tảng học tiếng Trung thông minh hàng đầu</p>
        </div>
        <div style="padding: 20px; background: #f8fafc; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
          <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 18px;">Chào mừng bạn đến với hệ thống thông báo tức thời!</h3>
          <p style="color: #475569; line-height: 1.6; margin: 0;">
            Hệ thống email tự động qua Resend đã được tích hợp thành công. Từ nay mọi thông báo quan trọng, bài tập mới và sự kiện thi thử HSK sẽ được gửi tới hòm thư của bạn trong chớp mắt.
          </p>
        </div>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://toiyeutinhoc238-sudo.github.io/tieng-trung-hong-tai/" style="display: inline-block; background: #dc2626; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
            Vào Học Ngay
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 0;">
          © 2026 Tiếng Trung Hồng Thái. Bạn nhận được email này vì đã đăng ký tài khoản học tập.
        </p>
      </div>
    `
  });
  console.log('Result sending to owner:', JSON.stringify(res, null, 2));
}

test();
