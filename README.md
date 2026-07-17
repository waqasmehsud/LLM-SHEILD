# HIRENETIC — Career Telemetry & Calibration Console

**Hirenetic** is a next-generation career telemetry dashboard and job alignment calibrator. It parses resume vectors, configures salary/location filters, and matches candidate profile signals against career channels in real-time.

---

## Key Features

*   **Career Calibration Deck (`/dashboard`):** Real-time candidate filtering console with interactive sliders for minimum salary, job types (Remote, Hybrid, In-Office), and job resonance thresholds.
*   **Job Crawler Telemetry Console (`/dashboard/crawler`):** Live dashboard tracking background scraping runtimes, parsed portal targets (Vercel, Cloudflare, Supabase, Stripe, Linear), and simulated terminal execution logs.
*   **LLM API Gateway Manager (`/dashboard/llm-api`):** Secure dashboard interface to manage model API keys (OpenAI, Anthropic, Gemini, DeepSeek) and parameters (Temperature, Token Budgets, Default Routing Model).
*   **Role-Based Access Control (RBAC):** Middleware-enforced Edge gating (`proxy.ts`) that restricts the entire dashboard environment exclusively to authenticated accounts with `role: "admin"` in their user metadata, routing standard users to the welcome page.
*   **Secure Authentication:** Responsive auth pages (Sign In, Profile Initialization, Recovery Console) tailored to the Hirenetic retro-grid design system.

---

## Tech Stack

*   **Framework:** Next.js (App Router, Turbopack)
*   **Styling:** CSS & Tailwind CSS (Custom dark theme with `#0e1420` ink backgrounds and `#3ddc97` signal accents)
*   **Database & Auth:** Supabase PostgreSQL and Supabase Auth
*   **Edge Router:** Next.js Middleware (`proxy.ts` Edge compilation)
*   **Testing:** Vitest (Unit/Integration) and Playwright (E2E)

---

## Getting Started

### 1. Environment Configuration
Create a `.env.local` file in the root of the project with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Tests
*   To run unit and integration tests:
    ```bash
    npm run test
    ```
*   To build the production bundle:
    ```bash
    npm run build
    ```

---

## Deployments
The application compiles dynamically to support Vercel Edge middleware. 
When creating your project on Vercel, ensure you bind your Supabase environment credentials (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the project settings.
