FROM node:alpine

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npx pnpm install --prod --frozen-lockfile
COPY . .

CMD ["npm", "start"]