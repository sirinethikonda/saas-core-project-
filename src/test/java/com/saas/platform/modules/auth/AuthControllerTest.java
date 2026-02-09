package com.saas.platform.modules.auth;

import com.saas.platform.core.common.ApiResponse;
import com.saas.platform.core.config.SecurityConfig;
import com.saas.platform.core.middleware.TenantFilter;
import com.saas.platform.core.security.JwtAuthFilter;
import com.saas.platform.core.security.JwtService;
import com.saas.platform.modules.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class, TenantFilter.class})
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private UserDetailsService userDetailsService;
    
    @Test
    @WithMockUser(username = "test@example.com", roles = "user")
    public void getCurrentUser_ShouldReturn200() throws Exception {
        // Mock AuthService response
        User user = new User();
        user.setEmail("test@example.com");
        
        ApiResponse response = ApiResponse.success("User profile", Map.of("email", "test@example.com"));
        doReturn(response).when(authService).getCurrentUser(anyString());

        mockMvc.perform(get("/api/auth/me"))
                .andDo(print())
                .andExpect(status().isOk());
    }
}
