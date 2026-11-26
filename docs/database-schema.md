# Fixit - Database schema (final)

PostgreSQL database, managed with Prisma (`server/prisma/schema.prisma`).

```mermaid
erDiagram
    USERS ||--o{ JOBS : "books (customer_id)"
    USERS ||--o{ JOBS : "does (pro_id)"
    SERVICES ||--o{ JOBS : "is booked as"
    JOBS ||--o| REVIEWS : "gets"

    USERS {
        int id PK
        string name
        string email UK
        string password_hash
        enum role "customer | pro | admin"
        enum trade "pros only"
        string phone
        datetime created_at
    }
    SERVICES {
        int id PK
        enum category "= trade"
        string name
        string description
        int fixed_price_usd
        int est_minutes
    }
    JOBS {
        int id PK
        int customer_id FK
        int pro_id FK "nullable until a pro accepts"
        int service_id FK
        string address
        float lat
        float lng
        datetime scheduled_at
        string description
        int price_usd "copied at booking"
        enum status "requested | accepted | on_the_way | done | cancelled"
        datetime created_at
    }
    REVIEWS {
        int id PK
        int job_id FK "unique: one review per job"
        int rating "1 to 5"
        string comment
        datetime created_at
    }
```

## Relationships

| Relation | Type | How |
|---|---|---|
| customer to jobs | 1 to many | `jobs.customer_id` references `users.id` |
| pro to jobs | 1 to many | `jobs.pro_id` references `users.id` (empty until a pro accepts) |
| service to jobs | 1 to many | `jobs.service_id` references `services.id` |
| job to review | 1 to 0..1 | `reviews.job_id` is unique |

## Design decisions

- **`price_usd` is copied into the job when it is booked.** If the catalogue price changes later, old jobs keep the price the customer agreed to.
- **A pro's average rating is calculated, not stored.** It is the average of the ratings on that pro's jobs, so it can never be out of date.
- **Trades are an enum** (plumbing, electrical, ac, carpentry, painting). The same values are used for a pro's trade and a service's category, so "jobs in my trade" is a simple equality check.

## Job status flow

```
requested --(pro accepts)--> accepted --(pro)--> on_the_way --(pro)--> done --(customer)--> review
    |
    +--(customer cancels)--> cancelled
```
