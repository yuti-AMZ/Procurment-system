FROM eclipse-temurin:21-jre
WORKDIR /app
COPY target/procurement-service-*.jar app.jar
EXPOSE 8088
ENTRYPOINT ["java", "-jar", "app.jar"]
