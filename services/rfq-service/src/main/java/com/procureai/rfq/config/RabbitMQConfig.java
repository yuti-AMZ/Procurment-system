package com.procureai.rfq.config;

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

    // Own exchange
    @Bean
    public TopicExchange rfqExchange() {
        return new TopicExchange("rfq.exchange");
    }

    // Queues for own events
    @Bean
    public Queue rfqCreatedQueue() {
        return new Queue("rfq.created.queue", true);
    }

    @Bean
    public Queue rfqPublishedQueue() {
        return new Queue("rfq.published.queue", true);
    }

    // Bindings for own events
    @Bean
    public Binding rfqCreatedBinding(Queue rfqCreatedQueue, TopicExchange rfqExchange) {
        return BindingBuilder.bind(rfqCreatedQueue)
                .to(rfqExchange)
                .with("rfq.created");
    }

    @Bean
    public Binding rfqPublishedBinding(Queue rfqPublishedQueue, TopicExchange rfqExchange) {
        return BindingBuilder.bind(rfqPublishedQueue)
                .to(rfqExchange)
                .with("rfq.published");
    }

    // External exchanges
    @Bean
    public TopicExchange supplierExchange() {
        return new TopicExchange("supplier.exchange");
    }

    // External queues
    @Bean
    public Queue supplierApprovedQueue() {
        return new Queue("supplier.approved.queue", true);
    }

    // External bindings
    @Bean
    public Binding supplierApprovedBinding(Queue supplierApprovedQueue, TopicExchange supplierExchange) {
        return BindingBuilder.bind(supplierApprovedQueue)
                .to(supplierExchange)
                .with("supplier.approved");
    }
}
