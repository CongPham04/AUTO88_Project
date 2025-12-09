package com.carshop.oto_shop.common.exceptions;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Xử lý chung cho AppException và các lớp con (BadRequest, DuplicateKey...)
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ErrorResponse> handleAppException(AppException e) {
        ErrorCode errorCode = e.getErrorCode();
        ErrorResponse errorResponse = new ErrorResponse(
                errorCode.getCode(),
                e.getMessage(), // Lấy message tùy chỉnh nếu có
                errorCode.getHttpStatus().value()
        );
        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .body(errorResponse);
    }

    // 2. Xử lý lỗi Validate (@Valid)
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        List<Map<String, String>> validationErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> Map.of(
                        "field", error.getField(),
                        "message", error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid"
                ))
                .collect(Collectors.toList());

        String combinedMessage = validationErrors.stream()
                .map(err -> err.get("field") + ": " + err.get("message"))
                .collect(Collectors.joining("; "));

        ErrorResponse errorResponse = new ErrorResponse(
                ErrorCode.VALIDATION_FAILED.getCode(),
                combinedMessage,
                ErrorCode.VALIDATION_FAILED.getHttpStatus().value()
        );
        errorResponse.setErrors(validationErrors);

        return ResponseEntity.badRequest().body(errorResponse);
    }

    // 3. Xử lý lỗi Database (SQL Constraints, Duplicate Entry...)
    @ExceptionHandler(value = DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolationException(DataIntegrityViolationException e) {
        String message = e.getMostSpecificCause().getMessage();
        String userMessage = "Lỗi dữ liệu hệ thống!";

        // Phân tích sơ bộ lỗi để trả về message thân thiện hơn
        if (message != null) {
            if (message.contains("Duplicate entry")) {
                userMessage = "Dữ liệu đã tồn tại hoặc bị trùng lặp trong hệ thống.";
            } else if (message.contains("password_reset_tokens")) {
                userMessage = "Yêu cầu đặt lại mật khẩu đang được xử lý, vui lòng chờ giây lát.";
            }
        }

        ErrorResponse errorResponse = new ErrorResponse(
                ErrorCode.DUPLICATE_KEY.getCode(),
                userMessage,
                ErrorCode.DUPLICATE_KEY.getHttpStatus().value()
        );
        return ResponseEntity.status(ErrorCode.DUPLICATE_KEY.getHttpStatus()).body(errorResponse);
    }

    // 4. Các lỗi Security / Auth
    @ExceptionHandler(value = LockedException.class)
    public ResponseEntity<ErrorResponse> handleLockedException(LockedException e) {
        return buildResponse(ErrorCode.ACCOUNT_BANNED);
    }

    @ExceptionHandler(value = DisabledException.class)
    public ResponseEntity<ErrorResponse> handleDisabledException(DisabledException e) {
        return buildResponse(ErrorCode.ACCOUNT_INACTIVE);
    }

    // 5. Các lỗi HTTP / File
    @ExceptionHandler(value = HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        return buildResponse(ErrorCode.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(value = HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMediaTypeNotSupported(HttpMediaTypeNotSupportedException e) {
        return buildResponse(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
    }

    @ExceptionHandler(value = MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException e) {
        return buildResponse(ErrorCode.FILE_SIZE_EXCEEDED);
    }

    // 6. Fallback cho tất cả lỗi còn lại (Exception)
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        // Log lỗi ra console để dev fix (không trả chi tiết Exception ra FE để bảo mật)
        e.printStackTrace();

        ErrorResponse errorResponse = new ErrorResponse(
                ErrorCode.INTERNAL_SERVER_ERROR.getCode(),
                "Đã có lỗi xảy ra, vui lòng thử lại sau!", // Message chung chung an toàn
                ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus().value()
        );
        return ResponseEntity.status(ErrorCode.INTERNAL_SERVER_ERROR.getHttpStatus()).body(errorResponse);
    }

    // Hàm helper để tạo Response nhanh từ ErrorCode
    private ResponseEntity<ErrorResponse> buildResponse(ErrorCode errorCode) {
        ErrorResponse response = new ErrorResponse(
                errorCode.getCode(),
                errorCode.getMessage(),
                errorCode.getHttpStatus().value()
        );
        return ResponseEntity.status(errorCode.getHttpStatus()).body(response);
    }
}