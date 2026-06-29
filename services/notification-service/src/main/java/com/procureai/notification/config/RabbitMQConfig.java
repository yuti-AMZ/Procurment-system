package com.procureai.notification.config;

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
    public TopicExchange notificationExchange() {
        return new TopicExchange("notification.exchange");
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue("notification.queue", true);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(notificationQueue)
                .to(notificationExchange)
                .with("#");
    }

    // External exchanges
    @Bean
    public TopicExchange procurementExchange() {
        return new TopicExchange("procurement.exchange");
    }

    @Bean
    public TopicExchange rfqExchange() {
        return new TopicExchange("rfq.exchange");
    }

    @Bean
    public TopicExchange quotationExchange() {
        return new TopicExchange("quotation.exchange");
    }

    @Bean
    public TopicExchange supplierExchange() {
        return new TopicExchange("supplier.exchange");
    }

    @Bean
    public TopicExchange invoiceExchange() {
        return new TopicExchange("invoice.exchange");
    }

    // Queues for external events
    @Bean
    public Queue procurementNotificationQueue() {
        return new Queue("notification.procurement.queue", true);
    }

    @Bean
    public Queue rfqNotificationQueue() {
        return new Queue("notification.rfq.queue", true);
    }

    @Bean
    public Queue quotationNotificationQueue() {
        return new Queue("notification.quotation.queue", true);
    }

    @Bean
    public Queue supplierNotificationQueue() {
        return new Queue("notification.supplier.queue", true);
    }

    @Bean
    public Queue invoiceNotificationQueue() {
        return new Queue("notification.invoice.queue", true);
    }

    // Bindings
    @Bean
    public Binding procurementNotificationBinding(Queue procurementNotificationQueue,
                                                   TopicExchange procurementExchange) {
        return BindingBuilder.bind(procurementNotificationQueue)
                .to(procurementExchange)
                .with("procurement.#");
    }

    @Bean
    public Binding rfqNotificationBinding(Queue rfqNotificationQueue,
                                           TopicExchange rfqExchange) {
        return BindingBuilder.bind(rfqNotificationQueue)
                .to(rfqExchange)
                .with("rfq.#");
    }

    @Bean
    public Binding quotationNotificationBinding(Queue quotationNotificationQueue,
                                                 TopicExchange quotationExchange) {
        return BindingBuilder.bind(quotationNotificationQueue)
                .to(quotationExchange)
                .with("quotation.#");
    }

    @Bean
    public Binding supplierNotificationBinding(Queue supplierNotificationQueue,
                                                TopicExchange supplierExchange) {
        return BindingBuilder.bind(supplierNotificationQueue)
                .to(supplierExchange)
                .with("supplier.#");
    }

    @Bean
    public Binding invoiceNotificationBinding(Queue invoiceNotificationQueue,
                                               TopicExchange invoiceExchange) {
        return BindingBuilder.bind(invoiceNotificationQueue)
                .to(invoiceExchange)
                .with("invoice.#");
    }
}
