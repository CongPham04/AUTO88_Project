package com.carshop.oto_shop.dto.account;

import com.carshop.oto_shop.enums.AccountStatus;
import com.carshop.oto_shop.enums.Role;

public class AccountResponse {

    private String email;

    private Role role;

    private AccountStatus status;

    public AccountResponse() {
    }

    public AccountResponse(String email, Role role, AccountStatus status) {
        this.email = email;
        this.role = role;
        this.status = status;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }
}
