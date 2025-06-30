# Obsidian Local REST API Endpoints

## Authentication
All endpoints except `GET /` require an API key from Obsidian's Local REST API plugin settings.
- Use `Authorization: Bearer YOUR_API_KEY` header
- Default HTTPS port: 27124
- Default HTTP port: 27123

## System

### GET /
Server status and authentication check
```bash
curl https://127.0.0.1:27124/
```

### GET /openapi.yaml
Get OpenAPI specification
```bash
curl https://127.0.0.1:27124/openapi.yaml
```

### GET /obsidian-local-rest-api.crt
Get SSL certificate
```bash
curl https://127.0.0.1:27124/obsidian-local-rest-api.crt
```

## Active File (Currently Open)

### GET /active/
Get content of currently active file
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://127.0.0.1:27124/active/
```

### PUT /active/
Replace entire content of active file
```bash
curl -X PUT -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: text/markdown" \
     -d "# New content" \
     https://127.0.0.1:27124/active/
```

### POST /active/
Append content to end of active file
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: text/markdown" \
     -d "Additional content" \
     https://127.0.0.1:27124/active/
```

### PATCH /active/
Insert content at specific location (heading, block, frontmatter)
```bash
curl -X PATCH -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Operation: append" \
     -H "Target-Type: heading" \
     -H "Target: My Heading" \
     -d "New content" \
     https://127.0.0.1:27124/active/
```

### DELETE /active/
Delete the currently active file
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/active/
```

## Commands

### GET /commands/
List all available Obsidian commands
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/commands/
```

### POST /commands/{commandId}/
Execute a specific Obsidian command
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/commands/global-search:open/
```

## File Operations

### GET /vault/{filename}
Get content of specific file
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/vault/my-note.md
```

### PUT /vault/{filename}
Create new file or completely replace existing file
```bash
curl -X PUT -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: text/markdown" \
     -d "# My Note" \
     https://127.0.0.1:27124/vault/new-note.md
```

### POST /vault/{filename}
Append content to existing file (creates if doesn't exist)
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: text/markdown" \
     -d "More content" \
     https://127.0.0.1:27124/vault/my-note.md
```

### PATCH /vault/{filename}
Insert content at specific location in file
```bash
curl -X PATCH -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Operation: append" \
     -H "Target-Type: heading" \
     -H "Target: Section Title" \
     -d "Content to insert" \
     https://127.0.0.1:27124/vault/my-note.md
```

### DELETE /vault/{filename}
Delete specific file
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/vault/old-note.md
```

## Directory Operations

### GET /vault/
List files in vault root directory
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/vault/
```

### GET /vault/{directory}/
List files in specific directory
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/vault/my-folder/
```

## Periodic Notes

### GET /periodic/{period}/
Get current periodic note (daily/weekly/monthly/quarterly/yearly)
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/periodic/daily/
```

### PUT /periodic/{period}/
Create/replace current periodic note
```bash
curl -X PUT -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: text/markdown" \
     -d "# Today's Notes" \
     https://127.0.0.1:27124/periodic/daily/
```

### POST /periodic/{period}/
Append to current periodic note
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: text/markdown" \
     -d "New entry" \
     https://127.0.0.1:27124/periodic/daily/
```

### PATCH /periodic/{period}/
Insert content at specific location in periodic note
```bash
curl -X PATCH -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Operation: append" \
     -H "Target-Type: heading" \
     -H "Target: Tasks" \
     -d "- New task" \
     https://127.0.0.1:27124/periodic/daily/
```

### DELETE /periodic/{period}/
Delete current periodic note
```bash
curl -X DELETE -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/periodic/daily/
```

### GET /periodic/{period}/{year}/{month}/{day}/
Get specific date's periodic note
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/periodic/daily/2024/06/29/
```

## Search

### POST /search/simple/
Simple text search across vault
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     "https://127.0.0.1:27124/search/simple/?query=my search term&contextLength=100"
```

### POST /search/
Advanced search with JsonLogic or Dataview queries

**JsonLogic search by tag:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/vnd.olrapi.jsonlogic+json" \
     -d '{"in": ["myTag", {"var": "tags"}]}' \
     https://127.0.0.1:27124/search/
```

**JsonLogic search by frontmatter:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/vnd.olrapi.jsonlogic+json" \
     -d '{"==": [{"var": "frontmatter.status"}, "completed"]}' \
     https://127.0.0.1:27124/search/
```

**Dataview DQL query:**
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/vnd.olrapi.dataview.dql+txt" \
     -d "TABLE rating, status FROM #project SORT rating DESC" \
     https://127.0.0.1:27124/search/
```

## UI Operations

### POST /open/{filename}
Open specific file in Obsidian interface
```bash
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     https://127.0.0.1:27124/open/my-note.md?newLeaf=true
```

## Common PATCH Parameters

When using PATCH endpoints, these headers control the operation:

- **Operation**: `append`, `prepend`, or `replace`
- **Target-Type**: `heading`, `block`, or `frontmatter`
- **Target**: The specific target (heading name, block ID, or frontmatter field)
- **Target-Delimiter**: For nested headings, default is `::`

### Examples:
- Heading target: `"My Section::Subsection"`
- Block target: `"abc123"` (block reference ID)
- Frontmatter target: `"status"` (field name)

## Notes

- Replace `YOUR_API_KEY` with your actual API key from Obsidian settings
- For JSON responses, add `-H "Accept: application/vnd.olrapi.note+json"`
- File paths are relative to vault root
- Directories in listings end with `/`
- Use HTTPS (port 27124) for secure connections, HTTP (port 27123) for local testing