package com.carshop.oto_shop.services;

import com.carshop.oto_shop.entities.Order;
import com.carshop.oto_shop.entities.OrderDetail;
import com.carshop.oto_shop.enums.OrderStatus;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    // ========================================================================
    // 1. PHƯƠNG THỨC CŨ (Giữ nguyên cho Auth: Đăng ký, Quên mật khẩu...)
    // ========================================================================
    @Async
    public void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            javaMailSender.send(message);
            logger.info("Text email sent to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send text email to {}: {}", to, e.getMessage());
        }
    }

    // ========================================================================
    // 2. PHƯƠNG THỨC MỚI (Hỗ trợ HTML cho Đơn hàng)
    // ========================================================================

    // Hàm nền tảng để gửi HTML
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            // true = multipart (cho phép đính kèm file nếu cần), "UTF-8" = hỗ trợ tiếng Việt
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = nội dung là HTML

            javaMailSender.send(message);
            logger.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    // -----------------------------------------------------------
    // NGHIỆP VỤ: Gửi xác nhận đặt hàng (Gọi hàm này trong OrderService)
    // -----------------------------------------------------------
    public void sendOrderConfirmation(Order order) {
        String subject = "Xác nhận đơn hàng #" + order.getOrderId();
        // Gọi hàm private bên dưới để tạo nội dung HTML
        String content = buildOrderConfirmationContent(order);
        sendHtmlEmail(order.getEmail(), subject, content);
    }

    // -----------------------------------------------------------
    // NGHIỆP VỤ: Gửi thông báo cập nhật trạng thái
    // -----------------------------------------------------------
    public void sendOrderStatusUpdate(Order order) {
        String subject = "Cập nhật trạng thái đơn hàng #" + order.getOrderId();
        String content = buildOrderStatusUpdateContent(order);
        sendHtmlEmail(order.getEmail(), subject, content);
    }

    // ========================================================================
    // 3. CÁC HÀM PRIVATE (Tạo nội dung HTML)
    // ========================================================================

    private String buildOrderConfirmationContent(Order order) {
        StringBuilder html = new StringBuilder();
        NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        html.append("<html><body style='font-family: Arial, sans-serif;'>");
        html.append("<h2 style='color: #d32f2f;'>Cảm ơn bạn đã đặt hàng tại Auto 88!</h2>");
        html.append("<p>Xin chào <b>").append(order.getFullName()).append("</b>,</p>");
        html.append("<p>Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.</p>");

        // Thông tin chung
        html.append("<div style='background-color: #f9f9f9; padding: 15px; border-radius: 5px;'>");
        html.append("<p><b>Mã đơn hàng:</b> ").append(order.getOrderId()).append("</p>");
        html.append("<p><b>Ngày đặt:</b> ").append(order.getOrderDate().format(dateFormatter)).append("</p>");
        html.append("<p><b>Địa chỉ giao hàng:</b> ").append(order.getAddress()).append(", ")
                .append(order.getWard()).append(", ").append(order.getDistrict()).append(", ").append(order.getCity()).append("</p>");
        html.append("</div>");

        // Bảng sản phẩm
        html.append("<h3>Chi tiết đơn hàng:</h3>");
        html.append("<table style='border-collapse: collapse; width: 100%; border: 1px solid #ddd;'>");
        html.append("<tr style='background-color: #333; color: white;'>")
                .append("<th style='padding: 10px; border: 1px solid #ddd;'>Sản phẩm</th>")
                .append("<th style='padding: 10px; border: 1px solid #ddd;'>Màu sắc</th>")
                .append("<th style='padding: 10px; border: 1px solid #ddd;'>Số lượng</th>")
                .append("<th style='padding: 10px; border: 1px solid #ddd;'>Thành tiền</th>")
                .append("</tr>");

        for (OrderDetail item : order.getOrderDetails()) {
            html.append("<tr>");
            html.append("<td style='padding: 8px; border: 1px solid #ddd;'>").append(item.getCar().getModel()).append("</td>");

            // Xử lý null cho colorName
            String color = (item.getColorName() != null) ? item.getColorName().name() : "Tiêu chuẩn";
            html.append("<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>").append(color).append("</td>");

            html.append("<td style='padding: 8px; border: 1px solid #ddd; text-align: center;'>").append(item.getQuantity()).append("</td>");

            // Tính thành tiền từng món
            BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            html.append("<td style='padding: 8px; border: 1px solid #ddd; text-align: right;'>").append(currencyFormatter.format(subtotal)).append("</td>");
            html.append("</tr>");
        }
        html.append("</table>");

        // Tổng tiền
        html.append("<h3 style='text-align: right;'>Tổng thanh toán: <span style='color: #d32f2f;'>")
                .append(currencyFormatter.format(order.getTotalAmount())).append("</span></h3>");

        html.append("<hr>");
        html.append("<p style='font-size: 12px; color: gray;'>Đây là email tự động, vui lòng không trả lời email này.</p>");
        html.append("<p>Trân trọng,<br><b>Đội ngũ Auto 88</b></p>");
        html.append("</body></html>");

        return html.toString();
    }

    private String buildOrderStatusUpdateContent(Order order) {
        String orderStatus = "";
        if(order.getStatus() == OrderStatus.PENDING) {
            orderStatus = "Chờ xác nhận";
        }else if(order.getStatus() == OrderStatus.CONFIRMED){
            orderStatus = "Đã xác nhận";
        }else if(order.getStatus() == OrderStatus.CANCELLED){
            orderStatus = "Đã bị huỷ";
        }else if(order.getStatus() == OrderStatus.SHIPPING){
            orderStatus = "Đang vận chuyển";
        }else if(order.getStatus() == OrderStatus.DELIVERED){
            orderStatus = "Đã giao";
        }else if(order.getStatus() == OrderStatus.COMPLETED){
            orderStatus = "Đã hoàn thành";
        }
        return "<html><body style='font-family: Arial, sans-serif;'>" +
                "<h2 style='color: #1976d2;'>Cập nhật trạng thái đơn hàng</h2>" +
                "<p>Xin chào <b>" + order.getFullName() + "</b>,</p>" +
                "<p>Đơn hàng <b>#" + order.getOrderId() + "</b> của bạn đã được cập nhật trạng thái mới:</p>" +
                "<div style='padding: 15px; background-color: #e3f2fd; border-left: 5px solid #2196f3; font-size: 18px; font-weight: bold;'>" +
                orderStatus +
                "</div>" +
                "<p>Cảm ơn bạn đã tin tưởng và mua sắm tại Auto 88.</p>" +
                "<p>Trân trọng,<br>Auto 88</p>" +
                "</body></html>";
    }

    // -----------------------------------------------------------
    // NGHIỆP VỤ: Gửi thông báo HỦY ĐƠN HÀNG
    // -----------------------------------------------------------
    public void sendOrderCancellationEmail(Order order) {
        String subject = "Thông báo hủy đơn hàng #" + order.getOrderId();
        String content = buildOrderCancellationContent(order);
        sendHtmlEmail(order.getEmail(), subject, content);
    }

    private String buildOrderCancellationContent(Order order) {
        return "<html><body style='font-family: Arial, sans-serif;'>" +
                "<h2 style='color: #d32f2f;'>Đơn hàng đã bị hủy</h2>" +
                "<p>Xin chào <b>" + order.getFullName() + "</b>,</p>" +
                "<p>Đơn hàng <b>#" + order.getOrderId() + "</b> của bạn đã được hủy thành công.</p>" +

                "<div style='background-color: #fff3cd; padding: 15px; border-radius: 5px; border: 1px solid #ffeeba;'>" +
                "<p style='margin: 0; color: #856404;'><b>Lý do hủy:</b> " +
                (order.getCancelReason() != null ? order.getCancelReason() : "Không có lý do cụ thể") +
                "</p>" +
                "</div>" +

                "<p>Nếu bạn đã thanh toán online, số tiền sẽ được hoàn lại theo chính sách của ngân hàng/ví điện tử (thường từ 3-7 ngày làm việc).</p>" +
                "<p>Rất tiếc vì sự bất tiện này. Hy vọng được phục vụ bạn trong lần tới.</p>" +
                "<p>Trân trọng,<br><b>Đội ngũ Auto 88</b></p>" +
                "</body></html>";
    }
}