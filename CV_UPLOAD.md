# CV Upload API Usage

## Endpoint
`POST /api/cv/upload`

## Authentication
Requires Bearer token in Authorization header.

## Request
- Method: POST
- Content-Type: multipart/form-data
- File field name: `cv`
- File type: PDF only
- Max file size: 5MB

## Example using curl

```bash
curl -X POST http://localhost:3001/api/cv/upload \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "cv=@path/to/your/cv.pdf"
```

## Response

### Success (200)
```json
{
  "message": "CV uploaded successfully", 
  "fileUrl": "https://team-1-bucket-067502745215.s3.us-east-1.amazonaws.com/cv/1-cv-1708261234567.pdf"
}
```

### Error (400)
```json
{
  "error": "No file uploaded"
}
// OR
{
  "error": "Only PDF files are allowed"
}
// OR  
{
  "error": "File too large (max 5MB)"
}
```

### Error (401)
```json
{
  "error": "Authentication required"
}
```

## File Storage
- Files are stored in S3 with pattern: `cv/{userId}-cv-{timestamp}.{extension}`
- Original filename and user ID are stored as metadata