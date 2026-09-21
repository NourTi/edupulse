CREATE TABLE IF NOT EXISTS users (
  id varchar(255) PRIMARY KEY,
  openId varchar(255),
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL UNIQUE,
  loginMethod varchar(50) NOT NULL,
  role varchar(50) DEFAULT 'user',
  linked_student_id varchar(255),
  profileCompleted boolean DEFAULT false,
  passwordHash varchar(255),
  status varchar(50) DEFAULT 'active',
  mustChangePassword boolean DEFAULT false,
  passwordChangedAt datetime,
  createdAt datetime DEFAULT CURRENT_TIMESTAMP,
  updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn datetime
);
