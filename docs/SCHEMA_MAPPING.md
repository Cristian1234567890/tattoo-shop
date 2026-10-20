# Semantic Schema Mapping Manifesto: Tattoo Hub Platform -> Analytical Lakehouse

> **Platform**: Tattoo Hub V2 Multi-Tenant Architecture  
> **Source Engine**: Supabase PostgreSQL (`public` & `qa` isolated schemas)  
> **Target Platform**: Enterprise Analytical Lakehouse / Google Cloud BigQuery (`tattoo_hub_dw`)  
> **Author**: Antigravity Data Platform Specialist  
> **Skill Standard**: `/schema-mapping` Protocol v1.0  

---

## 1. Executive Summary & Business Context

Tattoo Hub is an independent platform connecting tattoo artists, piercing specialists, ateliers/studios, and clients without corporate intermediation. The application processes high-frequency user interactions across appointment scheduling, subscription monetization (Free, Pro, VIP), real-time chat, and an interactive photographic healing progress diary.

To support executive analytics, cohort retention, artist revenue metrics, and healing phase compliance, this document defines the formal semantic mappings between the operational PostgreSQL database and the analytical dimensional warehouse.

---

## 2. Global Data Cleanliness & Integrity Rules

All transformation pipelines implementing this specification MUST enforce the following four universal cleanliness standards:

1. **Null Standardization**:
   - Any source string matching `'NULL'`, `'None'`, `'N/A'`, `'undefined'`, or whitespace-only (`'   '`) MUST be cast to SQL `NULL`.
2. **Trim & Casing Standards**:
   - All free-text strings (`city`, `display_name`, `studio_name`) MUST be trimmed of leading and trailing whitespace via `TRIM()`.
   - ISO codes (`country_code`, `currency_code`) MUST be converted to uppercase (`UPPER(TRIM(code))`).
3. **Temporal Consistency**:
   - All timestamps MUST be parsed into standard ISO-8601 UTC format (`TIMESTAMP`).
   - For appointment sessions, pipelines must enforce `scheduled_start_time <= scheduled_end_time`. If `end_time` is null, it derives as `start_time + INTERVAL 2 HOUR`.
4. **Constraint & Defensive Type Mapping**:
   - Non-nullable target fields MUST NEVER receive `NULL`. When source values are missing, explicit non-null defaults or hash derivations are enforced.

---

## 3. Semantic Translation & Synonym Resolution Table

| Domain Concept | Operational Source Name | Analytical Target Name | Semantic Resolution & Standard |
| :--- | :--- | :--- | :--- |
| Artist ID | `auth.users.id` / `tatuadores_data.id` | `artist_id` | UUIDv4 canonical identifier |
| Client ID | `auth.users.id` / `profiles.id` | `client_id` | UUIDv4 canonical identifier |
| Booking / Appointment | `appointments.id` / `agenda.id` | `appointment_id` | Unique session reservation |
| Healing Stage | `tattoo_progress.stage` | `healing_stage` | Normalized phase (Fase 1, 2, 3) |
| Subscription Record | `user_subscription.subscription_id` | `subscription_id` | PayPal / Stripe billing reference |
| Currency | `currencies.code` | `currency_code` | ISO 4217 (USD, PAB, EUR, COP, MXN) |

---

## 4. Table-by-Table Mapping Manifesto

---

### Target Dimension: `analytics_artists`

* **Anchor Source Table**: `public.tatuadores_data`
* **Contributing / Lookup Tables**: `auth.users`, `public.user_subscription`, `public.currencies`
* **Join Paths & Optimization**:
  * `tatuadores_data` LEFT JOIN `auth.users` ON `tatuadores_data.id = auth.users.id` (1:1)
  * `tatuadores_data` LEFT JOIN `user_subscription` ON `tatuadores_data.id = user_subscription.id` (1:1 Large-to-Small broadcast)
  * `tatuadores_data` LEFT JOIN `currencies` ON `UPPER(TRIM(tatuadores_data.data->>'currency')) = currencies.code` (Lookup broadcast)

#### Field Mappings:

| Target Field | Source Field / Logic | Mapping Type | Rationale / Transformation Details |
| :--- | :--- | :--- | :--- |
| `artist_id` | `tatuadores_data.id` | Direct | Primary key, 1-to-1 canonical artist UUID |
| `display_name` | `COALESCE(TRIM(tatuadores_data.data->>'name'), 'Artista Residente')` | Derived | Extracts JSON attribute with non-null fallback to prevent pipeline constraint rejection |
| `studio_id` | `NULLIF(TRIM(tatuadores_data.data->>'studio_id'), '')` | Derived | Nullable foreign studio reference; maps empty string to true SQL NULL |
| `primary_style` | `COALESCE(UPPER(TRIM(tatuadores_data.data->>'work_type')), 'GENERAL')` | Derived | Artist style (Realismo, Blackwork, Neotradicional); uppercase standardized |
| `country_code` | `COALESCE(UPPER(TRIM(tatuadores_data.data->>'country')), 'PA')` | Derived | Defaults to Panama ('PA') baseline atelier headquarters |
| `city` | `COALESCE(TRIM(tatuadores_data.data->>'city'), 'Ciudad de Panamá')` | Derived | Normalized city name without extraneous whitespace |
| `min_rate_usd` | `SAFE_CAST(tatuadores_data.data->>'price' AS NUMERIC) * COALESCE(currencies.rate, 1.0)` | Joined / Derived | Normalizes pricing into base USD utilizing active exchange rate lookup |
| `subscription_tier` | `CASE WHEN user_subscription.product_id IS NOT NULL THEN 'PRO' ELSE 'FREE' END` | Joined | Resolves commercial monetization tier |
| `is_verified` | `COALESCE(SAFE_CAST(tatuadores_data.data->>'is_verified' AS BOOLEAN), FALSE)` | Derived | Boolean verification badge flag |
| `created_at` | `tatuadores_data.created_at` | Direct | Direct ISO timestamp from PostgreSQL |
| `updated_at` | `tatuadores_data.updated_at` | Direct | Direct ISO timestamp from PostgreSQL |

---

### Target Fact: `analytics_appointments_and_agenda`

* **Anchor Source Table**: `public.appointments`
* **Contributing / Lookup Tables**: `public.tatuadores_data`, `public.profiles`
* **Join Paths & Optimization**:
  * `appointments` LEFT JOIN `tatuadores_data` ON `appointments.artist_id = tatuadores_data.id` (Many-to-1)
  * `appointments` LEFT JOIN `profiles` ON `appointments.client_id = profiles.id` (Many-to-1)

#### Field Mappings:

| Target Field | Source Field / Logic | Mapping Type | Rationale / Transformation Details |
| :--- | :--- | :--- | :--- |
| `appointment_id` | `appointments.id` | Direct | Unique primary key of the session booking |
| `client_id` | `appointments.client_id` | Direct | Foreign key identifying client user |
| `artist_id` | `appointments.artist_id` | Direct | Foreign key identifying artist user |
| `studio_name` | `COALESCE(TRIM(appointments.studio_name), 'Atelier Independiente')` | Derived | Default atelier location if not explicitly bound |
| `service_type` | `COALESCE(TRIM(appointments.service_title), 'Sesión de Tatuaje')` | Derived | Standard service categorization (Tatuaje, Piercing, Consulta) |
| `status` | `UPPER(TRIM(appointments.status))` | Derived | Normalized status ('PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA') |
| `scheduled_start_time` | `appointments.start_time` | Direct | UTC timestamp for session start |
| `scheduled_end_time` | `COALESCE(appointments.end_time, appointments.start_time + INTERVAL 2 HOUR)` | Derived | Handles unclosed or open-ended booking durations defensively |
| `has_technical_notes` | `LENGTH(TRIM(COALESCE(appointments.notes, ''))) > 0` | Derived | Boolean KPI indicating artist recorded session specifications |
| `created_at` | `appointments.created_at` | Direct | Direct record creation timestamp |

---

### Target Fact: `analytics_healing_and_progress`

* **Anchor Source Table**: `public.tattoo_progress`
* **Contributing / Lookup Tables**: `public.profiles`
* **Join Paths & Optimization**:
  * `tattoo_progress` LEFT JOIN `profiles` ON `tattoo_progress.client_id = profiles.id` (Many-to-1)

#### Field Mappings:

| Target Field | Source Field / Logic | Mapping Type | Rationale / Transformation Details |
| :--- | :--- | :--- | :--- |
| `progress_id` | `tattoo_progress.id` | Direct | Primary key of the healing update |
| `client_id` | `tattoo_progress.client_id` | Direct | Client owner of the tattoo record |
| `tattoo_title` | `COALESCE(TRIM(tattoo_progress.title), 'Tatuaje en Seguimiento')` | Derived | Human-readable tattoo description |
| `healing_stage` | `COALESCE(TRIM(tattoo_progress.stage), 'Fase 1: Limpieza & Primer Vendaje')` | Derived | Categorizes healing progression stage |
| `session_number` | `COALESCE(tattoo_progress.session_number, 1)` | Derived | Defaults to session 1 if multi-pass sessions not yet registered |
| `has_photo_evidence` | `tattoo_progress.image_url IS NOT NULL AND LENGTH(TRIM(tattoo_progress.image_url)) > 0` | Derived | Telemetry flag verifying photographic record was stored |
| `photo_url` | `NULLIF(TRIM(tattoo_progress.image_url), '')` | Derived | Supabase Storage URL |
| `entry_date` | `COALESCE(SAFE_CAST(tattoo_progress.date AS DATE), CURRENT_DATE())` | Derived | Logged date of milestone |
| `created_at` | `tattoo_progress.created_at` | Direct | Timestamp of progress creation |

---

### Target Dimension: `analytics_subscriptions_and_billing`

* **Anchor Source Table**: `public.user_subscription`
* **Contributing / Lookup Tables**: `auth.users`
* **Join Paths & Optimization**:
  * `user_subscription` INNER JOIN `auth.users` ON `user_subscription.id = auth.users.id` (1:1)

#### Field Mappings:

| Target Field | Source Field / Logic | Mapping Type | Rationale / Transformation Details |
| :--- | :--- | :--- | :--- |
| `subscription_id` | `user_subscription.subscription_id` | Direct | External payment gateway transaction/subscription ID |
| `user_id` | `user_subscription.id` | Direct | Bound user account UUID |
| `tier_name` | `CASE WHEN UPPER(user_subscription.product_id) LIKE '%VIP%' THEN 'VIP' WHEN UPPER(user_subscription.product_id) LIKE '%STUDIO%' THEN 'STUDIO' ELSE 'PRO' END` | Derived | Categorizes commercial tier |
| `provider` | `'PAYPAL'` | Direct | Payment provider token |
| `currency_code` | `'USD'` | Direct | Base billing currency |
| `is_active` | `TRUE` | Direct | Active billing lifecycle flag |
| `subscribed_at` | `user_subscription.created_at` | Direct | Initial registration timestamp |
| `last_renewed_at` | `user_subscription.updated_at` | Direct | Last automated recurring renewal timestamp |

---

## 5. Verification & Downstream ETL Guardrails

1. **Cartesian Product Defense**: All joins are 1:1 on unique UUIDs (`user_subscription.id`, `tatuadores_data.id`), eliminating row duplication risks.
2. **Schema Drift Handling**: The JSONB column `tatuadores_data.data` is accessed via explicit `SAFE_CAST` operations, shielding analytical pipelines against unstructured user input variations.
3. **QA Environment Segregation**: Analytical extract pipelines MUST filter `WHERE schema = 'public'` or exclude records flagged with email domains ending in `@sandbox.tattoohub.test` to preserve clean production reporting.
