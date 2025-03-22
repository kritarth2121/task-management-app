Postman Doc: https://documenter.getpostman.com/view/15901978/2sAYkHnxQQ

# Installing an AdonisJS Project

Here are the steps to install and set up a new AdonisJS project:

1. **Prerequisites**
   - Install Node.js (version 14 or later)
   - Install npm (usually comes with Node.js)

2. **Install the AdonisJS CLI**
   ```bash
   npm i -g @adonisjs/cli
   ```

3. **Create a new AdonisJS project**
   ```bash
   npm init adonis-ts-app my-project
   ```
   You'll be prompted to choose a project structure:
   - `web` (For full-stack web applications)
   - `api` (For API servers)
   - `slim` (Minimal setup)

4. **Navigate to your project directory**
   ```bash
   cd my-project
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Set up the environment file**
   ```bash
   cp .env.example .env
   ```

7. **Generate an application key**
   ```bash
   node ace generate:key
   ```
   Add the generated key to your `.env` file as `APP_KEY`

8. **Run migrations (if using a database)**
   ```bash
   node ace migration:run
   ```

9. **Start the development server**
   ```bash
   node ace serve --watch
   ```

Your AdonisJS application should now be running at `http://localhost:3333`.

Would you like me to explain any specific part of the setup process in more detail?