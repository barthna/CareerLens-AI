FROM node:20-alpine AS builder

WORKDIR /workspace

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Set Env to point to backend container
ENV NEXT_PUBLIC_API_URL=http://localhost:8000/api
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /workspace

COPY --from=builder /workspace/package*.json ./
COPY --from=builder /workspace/.next ./.next
COPY --from=builder /workspace/public ./public
COPY --from=builder /workspace/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
