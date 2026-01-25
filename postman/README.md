# Personal Site Public API + Postman Collection

This folder contains a lightweight, open-source Postman collection for exploring the public, read-only APIs that power the personal site. The goal is to make it easy for anyone to browse blogs and projects without authentication.

## What the API is for

- Share public blog metadata and full post content.
- Share public project summaries and details.
- Provide a simple health check for uptime monitoring.
- Keep the surface area small, consistent, and easy to test.

## Import the collection into Postman

1. Open Postman.
2. Click **Import**.
3. Drag in `postman/personal-site-public-api.postman_collection.json`.
4. Confirm the `base_url` variable is set to `https://personal-site-ten-delta-48.vercel.app`.

Learn more: https://learning.postman.com/docs/collections/use-collections/create-collections/

## Run in Postman button

1. Publish the collection in Postman.
2. Grab your collection UID.
3. Replace `YOUR_COLLECTION_UID` in the button URL on the project page.

Postman guide: https://learning.postman.com/docs/publishing-your-api/run-in-postman/creating-run-button/

## Example workflows

- Check uptime: run **Health**.
- Browse blogs: run **Blogs → Get All Blogs** and pick a slug.
- Explore projects: run **Projects → Get All Projects** and open a project detail.

## Example curl calls

```bash
curl -s https://personal-site-ten-delta-48.vercel.app/api/health | jq
```

```bash
curl -s https://personal-site-ten-delta-48.vercel.app/api/blogs | jq
```

```bash
curl -s https://personal-site-ten-delta-48.vercel.app/api/blogs/one-page-destroyed-confidence | jq
```

```bash
curl -s https://personal-site-ten-delta-48.vercel.app/api/projects | jq
```

```bash
curl -s https://personal-site-ten-delta-48.vercel.app/api/projects/postman-collection | jq
```

## API reference

### Response schema

All responses follow one of these shapes:

Success (list):
```
{
  "ok": true,
  "data": [...],
  "meta": { "count": number, "generatedAt": "ISOString" }
}
```

Success (single item):
```
{
  "ok": true,
  "data": { ... },
  "meta": { "generatedAt": "ISOString" }
}
```

Error:
```
{
  "ok": false,
  "error": { "code": "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_ERROR", "message": string },
  "meta": { "generatedAt": "ISOString" }
}
```

### GET /api/health

Returns a basic uptime check.

Fields:
- `status` (string): Always `ok`.

### GET /api/blogs

Returns blog metadata.

Fields:
- `slug` (string): Stable identifier for the post.
- `title` (string): Post title.
- `tags` (string[]): Tags assigned in the markdown front matter.
- `readTime` (number | null): Estimated minutes to read.
- `date` (string | null): ISO date string from front matter.

### GET /api/blogs/{slug}

Returns full blog content + metadata.

Fields:
- All fields from `/api/blogs`
- `contentHtml` (string): Rendered HTML content.

### GET /api/projects

Returns project summaries.

Fields:
- `id` (string): Project identifier.
- `name` (string): Project name.
- `description` (string): Short summary.
- `route` (string): Site route for the project.
- `type` (string): `technical` or `fun`.

### GET /api/projects/{id}

Returns detailed project info.

Fields:
- All fields from `/api/projects`
- `highlights` (string[]): Key tags/skills.
- `status` (string): Project status label.
- `resourceLink` (object | null): Optional external link metadata.

## Postman collection authentication

No authentication is required. Endpoints are read-only and return JSON responses only.

Reference: https://learning.postman.com/docs/developer/postman-api/authentication/
