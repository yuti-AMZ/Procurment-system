package com.procureai.quotation.config;

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
    public TopicExchange quotationExchange() {
        return new TopicExchange("quotation.exchange");
    }

    @Bean
    public Queue quotationSubmittedQueue() {
        return new Queue("quotation.submitted.queue", true);
    }

    @Bean
    public Binding quotationSubmittedBinding(Queue quotationSubmittedQueue, TopicExchange quotationExchange) {
        return BindingBuilder.bind(quotationSubmittedQueue)
                .to(quotationExchange)
                .with("quotation.submitted");
    }

    @Bean
    public TopicExchange rfqExchange() {
        return new TopicExchange("rfq.exchange");
    }

    @Bean
    public Queue rfqPublishedQueue() {
        return new Queue("rfq.published.queue", true);
    }

    @Bean
    public Binding rfqPublishedBinding(Queue rfqPublishedQueue, TopicExchange rfqExchange) {
        return BindingBuilder.bind(rfqPublishedQueue)
                .to(rfqExchange)
                .with("rfq.published");
    }
}
