package com.carshop.oto_shop.common.exceptions;

public class DuplicateKeyException extends AppException {
    public DuplicateKeyException(String message) {
        super(ErrorCode.DUPLICATE_KEY, message);
    }
}