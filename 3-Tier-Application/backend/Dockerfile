# 1️⃣ Use lightweight Node image
FROM node:16-alpine

# 2️⃣ Set working directory inside container
WORKDIR /app

# 3️⃣ Copy package files first (Docker cache optimization)
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install --production

# 5️⃣ Copy application code
COPY . .

# 6️⃣ Expose application port
EXPOSE 3030

# 7️⃣ Start the app
CMD ["npm", "start"]

