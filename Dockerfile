# Step 1: Use Maven to build the application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Step 2: Use JDK to run the application
FROM eclipse-temurin:21-jre-jammy
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/target/*.jar app.jar

# Expose the mandatory backend port
EXPOSE 5000

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]