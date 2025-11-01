# External APIs

The AMFE tool minimizes external dependencies to maintain offline capability and cost efficiency. Only essential services are integrated.

## Supabase APIs

**Purpose:** Core backend-as-a-service providing database, authentication, storage, and real-time synchronization.

**Documentation:** https://supabase.com/docs/reference/javascript
**Base URL(s):** https://<project-id>.supabase.co
**Authentication:** Bearer token (JWT) with Row Level Security
**Rate Limits:** Generous free tier, 100,000 requests/month

**Key Endpoints Used:**
- `GET /rest/v1/amfes` - Fetch AMFE documents
- `POST /rest/v1/amfes` - Create new AMFE
- `PATCH /rest/v1/amfe_items` - Batch update analysis items
- `POST /storage/v1/upload` - Upload evidence files
- `GET /storage/v1/object` - Retrieve file attachments

**Integration Notes:** All Supabase communications use auto-generated client with automatic JWT injection. Offline mode queues requests when connection unavailable.

## PDF Generation Service (Client-side)

**Purpose:** Generate professional PDF reports without external dependencies.

**Documentation:** https://pdf-lib.js.org/
**Base URL(s):** N/A (client-side library)
**Authentication:** None
**Rate Limits:** None (client-side processing)

**Key Endpoints Used:**
- N/A - Client-side JavaScript processing

**Integration Notes:** Uses PDF-lib library running in browser to avoid server costs. For complex reports, optional Supabase Edge Function can handle generation if needed.

---

**Note:** The architecture intentionally avoids external API dependencies to:
1. Ensure offline functionality
2. Minimize recurring costs
3. Maintain data privacy for manufacturing information
4. Reduce complexity and potential failure points

---
