package com.procureai.common.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Blocking Redis config for Servlet-based (Tomcat) services only.
 * Excluded from WebFlux/reactive services (api-gateway) via:
 *   ConditionalOnWebApplication(type = SERVLET)
 *
 * The gateway must NEVER use this bean — use ReactiveStringRedisTemplate instead.
 */
@Configuration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
public class RedisConfig {

    @Bean
    public StringRedisTemplate stringRedisTemplate(RedisConnectionFactory connectionFactory) {
        return new StringRedisTemplate(connectionFactory);
    }
}
