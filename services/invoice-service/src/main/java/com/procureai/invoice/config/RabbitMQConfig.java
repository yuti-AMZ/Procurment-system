package com.procureai.invoice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(org.springframework.amqp.rabbit.connection.ConnectionFactory connectionFactory,
                                          MessageConverter messageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter);
        return template;
    }

    @Bean
    public TopicExchange invoiceExchange() {
        return new TopicExchange("invoice.exchange");
    }

    @Bean
    public Queue poGeneratedQueue() {
        return new Queue("po.generated.queue", true);
    }

    @Bean
    public Binding poGeneratedBinding(Queue poGeneratedQueue, TopicExchange procurementExchange) {
        return BindingBuilder.bind(poGeneratedQueue)
                .to(procurementExchange)
                .with("procurement.po.generated");
    }

    @Bean
    public TopicExchange procurementExchange() {
        return new TopicExchange("procurement.exchange");
    }
}
