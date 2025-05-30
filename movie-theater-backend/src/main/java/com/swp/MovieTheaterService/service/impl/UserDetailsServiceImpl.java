package com.swp.MovieTheaterService.service.impl;

import com.swp.MovieTheaterService.entity.Account;
import com.swp.MovieTheaterService.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        log.debug("Loading user by email: {}", email);
        
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với email: " + email));

        return User.builder()
                .username(account.getEmail())
                .password(account.getPassword())
                .authorities(getAuthorities(account))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!account.isEmailVerified())
                .build();
    }

    private Collection<? extends GrantedAuthority> getAuthorities(Account account) {
        return Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + account.getRole().name())
        );
    }
} 