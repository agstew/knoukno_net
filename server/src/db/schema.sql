-- Kno U Kno :: knoukno.net :: GoDaddy MySQL 8 schema
-- Every "collection" from the spec is a table below.

CREATE TABLE IF NOT EXISTS users (
  id              CHAR(36)      NOT NULL PRIMARY KEY,
  email           VARCHAR(190)  NOT NULL,
  password_hash   VARCHAR(255)  NOT NULL,
  first_name      VARCHAR(80)   NULL,
  last_name       VARCHAR(80)   NULL,
  role            ENUM('user','admin') NOT NULL DEFAULT 'user',
  tier            ENUM('free','member','pro') NOT NULL DEFAULT 'free',
  bonus           TINYINT(1)    NOT NULL DEFAULT 0,
  question_quota  INT           NOT NULL DEFAULT 5,
  tier_started_at DATETIME      NULL,
  tier_expires_at DATETIME      NULL,
  email_verified  TINYINT(1)    NOT NULL DEFAULT 0,
  last_login_at   DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for login (session / refresh + forgot-password tokens)
CREATE TABLE IF NOT EXISTS login_sessions (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  user_id      CHAR(36)     NOT NULL,
  refresh_hash VARCHAR(255) NOT NULL,
  ip           VARCHAR(64)  NULL,
  user_agent   VARCHAR(255) NULL,
  expires_at   DATETIME     NOT NULL,
  revoked_at   DATETIME     NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_login_user (user_id),
  CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_resets (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME     NOT NULL,
  used_at    DATETIME     NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_reset_user (user_id),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection title
CREATE TABLE IF NOT EXISTS titles (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  user_id      CHAR(36)     NOT NULL,
  business_title VARCHAR(190) NOT NULL,
  industry     VARCHAR(120) NULL,
  location     VARCHAR(190) NULL,
  description  TEXT         NULL,
  status       ENUM('active','archived') NOT NULL DEFAULT 'active',
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_titles_user (user_id),
  CONSTRAINT fk_titles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for question (AI written, ~800 words each, paginated)
CREATE TABLE IF NOT EXISTS questions (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  title_id    CHAR(36) NOT NULL,
  user_id     CHAR(36) NOT NULL,
  stage       ENUM('law','location','hiring','people') NOT NULL,
  position    INT      NOT NULL,
  prompt      TEXT     NOT NULL,
  example     MEDIUMTEXT NULL,
  word_count  INT      NOT NULL DEFAULT 0,
  model       VARCHAR(60) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_question_position (title_id, position),
  KEY idx_questions_title (title_id),
  CONSTRAINT fk_questions_title FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE,
  CONSTRAINT fk_questions_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for answers (the client writes these)
CREATE TABLE IF NOT EXISTS answers (
  id          CHAR(36)  NOT NULL PRIMARY KEY,
  question_id CHAR(36)  NOT NULL,
  title_id    CHAR(36)  NOT NULL,
  user_id     CHAR(36)  NOT NULL,
  body        MEDIUMTEXT NOT NULL,
  word_count  INT       NOT NULL DEFAULT 0,
  created_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_answer_question (question_id),
  KEY idx_answers_title (title_id),
  CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_title    FOREIGN KEY (title_id)    REFERENCES titles(id)    ON DELETE CASCADE,
  CONSTRAINT fk_answers_user     FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for grade (A=4, B=3, C=2, D=1, F=0)
CREATE TABLE IF NOT EXISTS grades (
  id         CHAR(36) NOT NULL PRIMARY KEY,
  answer_id  CHAR(36) NOT NULL,
  title_id   CHAR(36) NOT NULL,
  user_id    CHAR(36) NOT NULL,
  letter     ENUM('A','B','C','D','F') NOT NULL,
  points     TINYINT  NOT NULL,
  note       VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_grade_answer (answer_id),
  KEY idx_grades_title (title_id),
  CONSTRAINT fk_grades_answer FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
  CONSTRAINT fk_grades_title  FOREIGN KEY (title_id)  REFERENCES titles(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for rated (drag-and-drop ordering of answers)
CREATE TABLE IF NOT EXISTS ratings (
  id            CHAR(36) NOT NULL PRIMARY KEY,
  answer_id     CHAR(36) NOT NULL,
  title_id      CHAR(36) NOT NULL,
  user_id       CHAR(36) NOT NULL,
  rank_position INT      NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_rating_answer (answer_id),
  KEY idx_ratings_title (title_id, rank_position),
  CONSTRAINT fk_ratings_answer FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_title  FOREIGN KEY (title_id)  REFERENCES titles(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for average (snapshot of the grade roll-up)
CREATE TABLE IF NOT EXISTS averages (
  id            CHAR(36) NOT NULL PRIMARY KEY,
  title_id      CHAR(36) NOT NULL,
  user_id       CHAR(36) NOT NULL,
  answer_count  INT      NOT NULL DEFAULT 0,
  graded_count  INT      NOT NULL DEFAULT 0,
  total_points  INT      NOT NULL DEFAULT 0,
  average_points DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  letter        ENUM('A','B','C','D','F') NULL,
  computed_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_average_title (title_id),
  CONSTRAINT fk_averages_title FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection payment (Stripe + PayPal)
CREATE TABLE IF NOT EXISTS payments (
  id           CHAR(36) NOT NULL PRIMARY KEY,
  user_id      CHAR(36) NOT NULL,
  provider     ENUM('stripe','paypal') NOT NULL,
  provider_ref VARCHAR(190) NULL,
  tier         ENUM('free','member','pro') NOT NULL,
  bonus        TINYINT(1) NOT NULL DEFAULT 0,
  amount_cents INT      NOT NULL DEFAULT 0,
  currency     CHAR(3)  NOT NULL DEFAULT 'USD',
  status       ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  raw          JSON     NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_payments_user (user_id),
  UNIQUE KEY uq_payment_provider_ref (provider, provider_ref),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for print (print / save page audit)
CREATE TABLE IF NOT EXISTS prints (
  id         CHAR(36) NOT NULL PRIMARY KEY,
  user_id    CHAR(36) NOT NULL,
  title_id   CHAR(36) NOT NULL,
  kind       ENUM('print','save') NOT NULL DEFAULT 'print',
  page       VARCHAR(60) NOT NULL DEFAULT 'questions',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_prints_user (user_id),
  CONSTRAINT fk_prints_title FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for Email (2 year retention, enforced by admin cleanup)
CREATE TABLE IF NOT EXISTS email_log (
  id           CHAR(36) NOT NULL PRIMARY KEY,
  user_id      CHAR(36) NULL,
  to_email     VARCHAR(190) NOT NULL,
  template     ENUM('welcome','broadcast','password_reset','receipt') NOT NULL,
  subject      VARCHAR(255) NOT NULL,
  body_html    MEDIUMTEXT NULL,
  status       ENUM('queued','sent','failed') NOT NULL DEFAULT 'queued',
  provider_ref VARCHAR(190) NULL,
  error        VARCHAR(500) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  purge_after  DATETIME NULL,
  KEY idx_email_user (user_id),
  KEY idx_email_purge (purge_after)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Collection for delete (soft-delete audit trail)
CREATE TABLE IF NOT EXISTS deletions (
  id          CHAR(36) NOT NULL PRIMARY KEY,
  user_id     CHAR(36) NULL,
  entity_type VARCHAR(40) NOT NULL,
  entity_id   CHAR(36) NOT NULL,
  payload     JSON     NULL,
  reason      VARCHAR(255) NULL,
  deleted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_deletions_entity (entity_type, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI-written landing copy (~400 words per section)
CREATE TABLE IF NOT EXISTS landing_sections (
  id         CHAR(36) NOT NULL PRIMARY KEY,
  slug       VARCHAR(80) NOT NULL,
  heading    VARCHAR(190) NOT NULL,
  body       MEDIUMTEXT NOT NULL,
  image_url  VARCHAR(255) NULL,
  image_alt  VARCHAR(190) NULL,
  word_count INT NOT NULL DEFAULT 0,
  position   INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_landing_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
