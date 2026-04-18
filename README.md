# Ecommilan Toolkit - Vercel verzija

## Upload na GitHub
Ubaci sve fajlove iz ovog foldera u root GitHub repoa.

## Deploy na Vercel
1. Importuj GitHub repo u Vercel
2. U Settings > Environment Variables dodaj:
   - OPENAI_API_KEY
   - OPENAI_MODEL (opciono, npr. gpt-4.1-mini)
3. Deploy

## Struktura
- public/index.html = isti frontend
- api/ai.js = serverless backend za Vercel
