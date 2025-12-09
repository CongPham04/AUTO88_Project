package com.carshop.oto_shop.common.exceptions;

public class AppException extends RuntimeException {
    private final ErrorCode errorCode;

    // Constructor 1: Dùng message mặc định của ErrorCode
    public AppException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    // Constructor 2: Dùng message tùy chỉnh (Ví dụ: "Email đã tồn tại" thay vì "Trùng lặp dữ liệu")
    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}