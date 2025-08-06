# 📝 Task Manager

A modern task management web application with real-time collaboration features. Users can organize tasks across three sections (Pending, In Progress, Completed) and collaborate with team members through group workspaces.

## ✨ Features

### 📋 Task Management
- Add, update, and delete tasks
- Organize tasks in three sections: Pending, In Progress, and Completed
- Clean and intuitive dashboard interface
- Personalized task views for individual users

### 🔐 Authentication
- Google OAuth integration using NextAuth
- Secure email-based user authentication
- Personalized user sessions

### 👥 Group Collaboration
- Create and manage groups for team collaboration
- Share tasks within group workspaces
- Multi-user group management
- Same clean layout for both personal and group tasks

### ⚡ Real-time Updates
- WebSocket server for live updates
- Real-time task synchronization across users
- Instant notifications for group task changes

## 📁 Project Structure

```
├── prisma/
├── public/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── groups/
│   │   └── api/
│   │       ├── tasks/
│   │       └── routes/
│   ├── components/
│   │   ├── buttons/
│   │   ├── groups/
│   │   └── tasks/
│   ├── auths/
│   ├── lib/
│   ├── prisma/
│   └── types/
└── server/
```


## 🛠️ Tech Stack

- **Frontend**: Next.js
- **Authentication**: NextAuth with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Backend**: Express.js
- **Real-time**: Socket.IO
- **Containerization**: Docker
