FROM eclipse-temurin:19-jdk AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apt-get update && apt-get install -y maven && \
    mvn clean package -DskipTests

FROM eclipse-temurin:19-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create uploads directories
RUN mkdir -p /app/uploads/photos /app/uploads/resumes

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
