# Repositories & JPA Implementation

## 1. What is a Repository?
In Spring Boot, the Repository layer handles direct communication with the Database. It executes the SQL queries to save, update, delete, or fetch data.

## 2. Spring Data JPA
Instead of writing complex JDBC (Java Database Connectivity) code and raw SQL, we use Spring Data JPA. By simply creating an interface that extends `JpaRepository<Entity, ID>`, Spring automatically generates all the basic CRUD methods for us in memory (e.g., `.save()`, `.findAll()`, `.findById()`).

## 3. Derived Queries
Spring Data JPA is incredibly smart. If we write a method signature like:
```java
List<Upload> findByCompanyId(Long companyId);
```
We do not have to write the SQL for this! Spring automatically parses the method name, realizes we want to query the `Upload` table `WHERE company_id = ?`, and executes it.

## 4. Native Queries and pgvector
Sometimes, we need highly complex or database-specific queries that Spring Data JPA can't generate automatically. This is exactly what we had to do for the RAG pipeline.

In `AnomalyResultRepository.java`, we wrote a Native Query using `@Query(nativeQuery = true)`:
```java
@Query(value = "SELECT * FROM anomaly_result WHERE transaction_fk IN (SELECT id FROM transaction WHERE company_id = :companyId) ORDER BY embedding_text <=> cast(:embedding as vector) LIMIT :limit", nativeQuery = true)
List<AnomalyResult> findSimilarAnomalies(...);
```
- **`<=>`** : This is a specialized operator provided exclusively by the `pgvector` extension. It calculates the **Cosine Distance** between two vectors.
- This query takes the mathematical vector generated from the user's chat prompt, compares it against *every single vector* stored in our database, sorts them by which ones are mathematically closest in meaning, and returns the top 5 results (`LIMIT :limit`). This is the absolute core of our RAG (Retrieval-Augmented Generation) engine.
