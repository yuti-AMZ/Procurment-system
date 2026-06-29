package com.procureai.procurement.config;

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
    public TopicExchange procurementExchange() {
        return new TopicExchange("procurement.exchange");
    }

    // Queues for this service's own events
    @Bean
    public Queue prCreatedQueue() {
        return new Queue("pr.created.queue", true);
    }

    @Bean
    public Queue prApprovedQueue() {
        return new Queue("pr.approved.queue", true);
    }

    @Bean
    public Queue poGeneratedQueue() {
        return new Queue("po.generated.queue", true);
    }

    // Bindings for own events
    @Bean
    public Binding prCreatedBinding(Queue prCreatedQueue, TopicExchange procurementExchange) {
        return BindingBuilder.bind(prCreatedQueue)
                .to(procurementExchange)
                .with("procurement.pr.created");
    }

    @Bean
    public Binding prApprovedBinding(Queue prApprovedQueue, TopicExchange procurementExchange) {
        return BindingBuilder.bind(prApprovedQueue)
                .to(procurementExchange)
                .with("procurement.pr.approved");
    }

    @Bean
    public Binding poGeneratedBinding(Queue poGeneratedQueue, TopicExchange procurementExchange) {
        return BindingBuilder.bind(poGeneratedQueue)
                .to(procurementExchange)
                .with("procurement.po.generated");
    }

    // External exchanges
    @Bean
    public TopicExchange supplierExchange() {
        return new TopicExchange("supplier.exchange");
    }

    @Bean
    public TopicExchange quotationExchange() {
        return new TopicExchange("quotation.exchange");
    }

    // External queues
    @Bean
    public Queue supplierApprovedQueue() {
        return new Queue("supplier.approved.queue", true);
    }

    @Bean
    public Queue quotationSubmittedQueue() {
        return new Queue("quotation.submitted.queue", true);
    }

    // External bindings
    @Bean
    public Binding supplierApprovedBinding(Queue supplierApprovedQueue, TopicExchange supplierExchange) {
        return BindingBuilder.bind(supplierApprovedQueue)
                .to(supplierExchange)
                .with("supplier.approved");
    }

    @Bean
    public Binding quotationSubmittedBinding(Queue quotationSubmittedQueue, TopicExchange quotationExchange) {
        return BindingBuilder.bind(quotationSubmittedQueue)
                .to(quotationExchange)
                .with("quotation.submitted");
    }
}
