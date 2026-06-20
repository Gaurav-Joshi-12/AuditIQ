# Controllers in Spring Boot

## 1. What is a Controller?
In the MVC pattern, the Controller acts as the "receptionist". It listens for HTTP requests from the internet (e.g., from our React frontend), validates the input, hands the real work off to the Service layer, and returns an HTTP response.

## 2. Key Annotations
- **`@RestController`:** Tells Spring "This class handles web requests and returns data (JSON), not HTML views."
- **`@RequestMapping("/api/...")`:** Defines the base URL for the entire class.
- **`@PostMapping`, `@GetMapping`:** Defines exactly which HTTP method and sub-path trigger a specific function.
- **`@RequestBody`:** Tells Spring to take the incoming JSON and automatically convert it into a Java Object (DTO).
- **`@PathVariable` & `@RequestParam`:** Extracts data from the URL itself (e.g., `/api/uploads/{uploadId}` or `?companyId=1`).

## 3. Controllers in AuditIQ
- **`AuthController`:** Handles `/api/auth/login`. Takes credentials, checks them, returns a JWT.
- **`UploadController`:** Handles file uploads. Very critical because it takes a `@RequestParam("file") MultipartFile` instead of raw JSON.
- **`QueryController`:** The entry point for the RAG AI chatbot.
- **`ReportController` & `CompanyController`:** Basic endpoints to fetch data for the frontend dashboards.
