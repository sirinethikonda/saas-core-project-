package com.saas.platform.core.security;

import com.saas.platform.core.middleware.TenantContext;
import com.saas.platform.modules.user.User;
import com.saas.platform.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Multi-tenant aware lookup
        String tenantId = TenantContext.getCurrentTenant();
        
        User user;
        if (tenantId != null) {
            user = userRepository.findByEmailAndTenantId(email, tenantId)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email + " in tenant: " + tenantId));
        } else {
            // Fallback for non-tenant requests (system admin?) or legacy
             user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
        }

        return CustomUserDetails.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .password(user.getPasswordHash())
                .tenantId(user.getTenantId())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole())))
                .build();
    }
}