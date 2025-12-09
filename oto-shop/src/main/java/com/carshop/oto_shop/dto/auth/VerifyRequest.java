package com.carshop.oto_shop.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class VerifyRequest {
    @NotBlank(message = "Mã xác thực không được để trống")
    @Size(min = 6, max = 10, message = "Mã xác thực phải từ 6-10 ký tự")
    private String code;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}