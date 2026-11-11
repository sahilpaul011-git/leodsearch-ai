# Multi-stage build: compile with Maven, run with a slim JRE.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -ntp package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/leodsearch-backend.jar app.jar
EXPOSE 7070
CMD ["java", "-jar", "app.jar"]
