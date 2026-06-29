import json
import threading
from typing import Callable, Optional

import pika

from .config import settings


class RabbitMQConsumer:
    def __init__(self):
        self.connection: Optional[pika.BlockingConnection] = None
        self.channel: Optional[pika.Channel] = None
        self._callbacks: dict[str, list[Callable]] = {}
        self._consumer_tag_to_queue: dict[str, str] = {}
        self._running = False
        self._thread: Optional[threading.Thread] = None

    def connect(self):
        credentials = pika.PlainCredentials(settings.username, settings.password)
        parameters = pika.ConnectionParameters(
            host=settings.host,
            port=settings.port,
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=300,
        )
        self.connection = pika.BlockingConnection(parameters)
        self.channel = self.connection.channel()

        for exchange in [
            settings.procurement_exchange,
            settings.rfq_exchange,
            settings.supplier_exchange,
            settings.quotation_exchange,
            settings.invoice_exchange,
            settings.notification_exchange,
        ]:
            self.channel.exchange_declare(
                exchange=exchange, exchange_type="topic", durable=True
            )

    def register_callback(self, queue: str, callback: Callable):
        if queue not in self._callbacks:
            self._callbacks[queue] = []
        self._callbacks[queue].append(callback)

    def _on_message(self, channel, method, properties, body):
        queue_name = self._consumer_tag_to_queue.get(method.consumer_tag, "")
        try:
            data = json.loads(body)
            callbacks = self._callbacks.get(queue_name, [])
            for cb in callbacks:
                cb(data, method.routing_key)
            channel.basic_ack(delivery_tag=method.delivery_tag)
        except Exception as e:
            print(f"Error processing message from {queue_name}: {e}")
            channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

    def start_consuming(self):
        if not self.channel:
            self.connect()

        if self._running:
            return

        self._running = True
        self._thread = threading.Thread(target=self._consume, daemon=True)
        self._thread.start()

    def _consume(self):
        for queue in self._callbacks:
            tag = self.channel.basic_consume(
                queue=queue, on_message_callback=self._on_message, auto_ack=False
            )
            self._consumer_tag_to_queue[tag] = queue
        self.channel.start_consuming()

    def stop(self):
        self._running = False
        if self.channel:
            try:
                self.channel.stop_consuming()
            except Exception:
                pass
        if self.connection:
            try:
                self.connection.close()
            except Exception:
                pass
