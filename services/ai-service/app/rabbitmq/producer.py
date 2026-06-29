import json

import pika

from .config import settings


class RabbitMQProducer:
    def __init__(self):
        self.connection: pika.BlockingConnection | None = None
        self.channel: pika.Channel | None = None

    def connect(self):
        credentials = pika.PlainCredentials(settings.username, settings.password)
        parameters = pika.ConnectionParameters(
            host=settings.host,
            port=settings.port,
            credentials=credentials,
            heartbeat=600,
        )
        self.connection = pika.BlockingConnection(parameters)
        self.channel = self.connection.channel()

    def publish(
        self, exchange: str, routing_key: str, data: dict, delivery_mode: int = 2
    ):
        if not self.channel:
            self.connect()

        self.channel.basic_publish(
            exchange=exchange,
            routing_key=routing_key,
            body=json.dumps(data),
            properties=pika.BasicProperties(delivery_mode=delivery_mode),
        )

    def publish_notification(self, notification_data: dict):
        self.publish(
            exchange=settings.notification_exchange,
            routing_key="notification.send",
            data=notification_data,
        )

    def close(self):
        if self.connection:
            self.connection.close()
